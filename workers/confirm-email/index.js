/**
 * CUADRA - copia por email para quien completa un formulario.
 *
 * Cloudflare Worker (ES module). Recibe lo que el visitante envio desde la web
 * y le manda, via Resend, un correo "copia de tu mensaje" a su propio email.
 * El aviso a CUADRA lo sigue haciendo FormSubmit (ver js/site-config.js).
 *
 * POST  { "kind": "contact" | "plan", "fields": { "Nombre": "...", "Email": "...", ... } }
 * 200   { ok: true }
 *
 * Variables / secretos (ver README.md):
 *   RESEND_API_KEY   secreto  - clave de Resend con permiso solo de envio
 *   FROM_EMAIL       opcional - por defecto "CUADRA <no-reply@cuadrastudio.uy>"
 *   REPLY_TO         opcional - por defecto "cuadrastudio.uy@gmail.com"
 *   ALLOWED_ORIGINS  opcional - lista separada por comas; por defecto el sitio de CUADRA
 *   RATE (KV)        opcional - activa el limite de envios por IP y por destinatario
 *
 * Este endpoint es publico: manda un correo a la direccion que le indiquen.
 * Para que no sirva de relay de spam: origen permitido, plantilla fija, campos
 * acotados, trampa para bots y limite de envios (con KV).
 */

const DEFAULT_ORIGINS = ['https://cuadrastudio.uy', 'https://www.cuadrastudio.uy'];
const DEFAULT_FROM = 'CUADRA <no-reply@cuadrastudio.uy>';
const DEFAULT_REPLY_TO = 'cuadrastudio.uy@gmail.com';

const MAX_BODY_BYTES = 20 * 1024;
const MAX_FIELDS = 40;
const MAX_KEY = 80;
const MAX_VALUE = 2000;
const EMAIL_RE = /^[^\s@<>"',;:]+@[^\s@<>"',;:]+\.[^\s@<>"',;:]+$/;

const LIMITS = {
  ip: { max: 5, windowSeconds: 600 },        // 5 envios cada 10 min por IP
  recipient: { max: 3, windowSeconds: 86400 } // 3 copias por dia a la misma direccion
};

function allowedOrigins(env) {
  return env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: Object.assign({ 'Content-Type': 'application/json' }, origin ? corsHeaders(origin) : {})
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

// Quita caracteres de control (incluye saltos para encabezados) salvo \n y \t en valores.
function clean(value, max, keepNewlines) {
  let text = String(value == null ? '' : value);
  text = keepNewlines
    ? text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    : text.replace(/[\u0000-\u001F\u007F]/g, ' ');
  return text.trim().slice(0, max);
}

function sanitizeFields(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const keys = Object.keys(raw);
  if (keys.length === 0 || keys.length > MAX_FIELDS) return null;
  for (const key of keys) {
    if (key.charAt(0) === '_') continue; // campos internos (_honey, _subject...)
    const k = clean(key, MAX_KEY, false);
    const v = clean(raw[key], MAX_VALUE, true);
    if (k && v) out[k] = v;
  }
  return out;
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Cuenta envios en KV. Devuelve true si todavia hay cupo.
async function underLimit(kv, key, limit) {
  if (!kv) return true;
  const current = parseInt((await kv.get(key)) || '0', 10);
  if (current >= limit.max) return false;
  await kv.put(key, String(current + 1), { expirationTtl: limit.windowSeconds });
  return true;
}

function buildEmail(kind, fields) {
  const name = fields['Nombre y apellido'] || fields['Nombre'] || '';
  const isPlan = kind === 'plan';
  const subject = isPlan
    ? 'Copia de tu plan: ' + (fields['Plan'] || 'CUADRA')
    : 'Copia de tu mensaje a CUADRA';
  const intro = isPlan
    ? 'Recibimos tu plan. Esta es una copia de lo que nos enviaste.'
    : 'Recibimos tu mensaje. Esta es una copia de lo que nos enviaste.';
  const closing = 'Te respondemos a este mismo correo para confirmar contenido, alcance y precio final. ' +
    'Si no enviaste este mensaje, podés ignorar este correo.';

  const rows = Object.keys(fields).map((key) => (
    '<tr>' +
    '<td style="padding:10px 12px;border-bottom:1px solid #E3E3DE;color:#5A6060;font-size:13px;vertical-align:top;width:38%">' + escapeHtml(key) + '</td>' +
    '<td style="padding:10px 12px;border-bottom:1px solid #E3E3DE;color:#0F1111;font-size:14px;white-space:pre-wrap">' + escapeHtml(fields[key]) + '</td>' +
    '</tr>'
  )).join('');

  const html =
    '<!doctype html><html lang="es"><body style="margin:0;padding:24px;background:#F2F1ED;font-family:Arial,Helvetica,sans-serif">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E3E3DE">' +
    '<tr><td style="background:#0F1111;padding:20px 24px;color:#F2F1ED;font-size:15px;font-weight:700;letter-spacing:0.28em">CUADRA</td></tr>' +
    '<tr><td style="padding:24px">' +
    '<p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0F1111">' + (name ? 'Hola ' + escapeHtml(name) + ',' : 'Hola,') + '</p>' +
    '<p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#0F1111">' + escapeHtml(intro) + '</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E3E3DE">' + rows + '</table>' +
    '<p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#5A6060">' + escapeHtml(closing) + '</p>' +
    '</td></tr>' +
    '<tr><td style="padding:16px 24px;background:#F2F1ED;color:#5A6060;font-size:12px">CUADRA · Montevideo, Uruguay · cuadrastudio.uy</td></tr>' +
    '</table></body></html>';

  const text = [
    name ? 'Hola ' + name + ',' : 'Hola,',
    '',
    intro,
    '',
    ...Object.keys(fields).map((key) => key + ': ' + fields[key]),
    '',
    closing,
    '',
    'CUADRA · Montevideo, Uruguay · cuadrastudio.uy'
  ].join('\n');

  return { subject: clean(subject, 150, false), html, text };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = allowedOrigins(env);
    const originOk = allowed.indexOf(origin) !== -1;

    if (request.method === 'OPTIONS') {
      return originOk
        ? new Response(null, { status: 204, headers: corsHeaders(origin) })
        : new Response(null, { status: 403 });
    }
    if (request.method !== 'POST') return json(405, { ok: false, error: 'method' }, originOk ? origin : '');
    if (!originOk) return json(403, { ok: false, error: 'origin' }, '');

    const type = request.headers.get('Content-Type') || '';
    if (type.indexOf('application/json') === -1) return json(415, { ok: false, error: 'content-type' }, origin);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too-large' }, origin);

    let payload;
    try { payload = JSON.parse(raw); } catch (e) { return json(400, { ok: false, error: 'json' }, origin); }

    // Trampa para bots: si esta completa, se responde "ok" sin enviar nada.
    if (payload && payload.fields && payload.fields._honey) return json(200, { ok: true }, origin);

    const kind = payload && payload.kind === 'plan' ? 'plan' : 'contact';
    const fields = sanitizeFields(payload && payload.fields);
    if (!fields) return json(400, { ok: false, error: 'fields' }, origin);

    const email = clean(fields['Email'] || '', 254, false).toLowerCase();
    if (!EMAIL_RE.test(email)) return json(400, { ok: false, error: 'email' }, origin);

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const okIp = await underLimit(env.RATE, 'ip:' + ip, LIMITS.ip);
    const okRecipient = okIp && await underLimit(env.RATE, 'to:' + (await sha256(email)), LIMITS.recipient);
    if (!okIp || !okRecipient) return json(429, { ok: false, error: 'rate-limit' }, origin);

    if (!env.RESEND_API_KEY) return json(500, { ok: false, error: 'not-configured' }, origin);

    const message = buildEmail(kind, fields);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'copy-' + (await sha256(email + '|' + message.subject + '|' + message.text)).slice(0, 48)
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || DEFAULT_FROM,
        to: [email],
        reply_to: env.REPLY_TO || DEFAULT_REPLY_TO,
        subject: message.subject,
        html: message.html,
        text: message.text
      })
    });

    if (!response.ok) return json(502, { ok: false, error: 'resend' }, origin);
    return json(200, { ok: true }, origin);
  }
};
