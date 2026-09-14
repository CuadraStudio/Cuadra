// E2E smoke — demo Estudio Arroyo (CUADRA Consulta en subruta)
// Servidor local embebido en :8765, sirve Cuadra_static_site para que
// /demos/estudioarroyo/... resuelva. Browser: Chromium (msedge) headless.
// Sin sleeps: todo espera condición/red/URL.
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '..', '..', '..'); // Cuadra_static_site
const PORT = 8765;
const HOST = `http://127.0.0.1:${PORT}`;
const BASE = '/demos/estudioarroyo';
const CITAS_KEY = 'estudioarroyo_demo_citas';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      let file = path.join(SITE_ROOT, p);
      if (file.endsWith(path.sep) && !file.endsWith('index.html')) file = path.join(file, 'index.html');
      try {
        const data = fs.readFileSync(file);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('nf'); }
    });
    server.listen(PORT, '127.0.0.1', () => { console.log('server up on ' + HOST); resolve(server); });
  });
}

let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log('ok   - ' + name); }
  else { fail++; console.log('FAIL - ' + name + '  ' + extra); }
}

// Próximo día hábil >= 3 días adelante (evita el filtro "hoy" del runtime,
// que compara la fecha local contra toISOString() en UTC y puede dejar el
// día siguiente sin horarios por skew de zona horaria).
function nextSlotDate() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return iso;
}

(async () => {
  const server = await serve();
  const consoleErrors = [];
  const waUrls = [];

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push('console.error: ' + m.text()); });
  // Captura determinística de wa.me: intercepta la petición (fallback) y
  // además registra el URL de window.open en sessionStorage (sobrevive la
  // navegación a /gracias/) para no depender del popup en headless.
  await page.context().route('https://wa.me/**', route => route.abort());
  await page.addInitScript(() => {
    const orig = window.open;
    window.open = function (u) {
      try { sessionStorage.setItem('__qa_last_wa', u); } catch (e) {}
      return orig ? orig.apply(this, arguments) : null;
    };
  });

  // ---------- HOME ----------
  await page.goto(HOST + BASE + '/', { waitUntil: 'networkidle' });
  const homeH1 = (await page.locator('h1').first().textContent()).trim();
  check('home: h1 correcto', homeH1 === 'Que entender tus derechos no sea el problema', 'h1=' + homeH1);
  const navCount = await page.locator('.nav__list .nav__link').count();
  check('home: nav con 5 ítems', navCount === 5, 'nav=' + navCount);
  const cta = page.locator('a.site-header__cta, .hero__actions a.btn--primary').first();
  const ctaText = (await cta.textContent()).trim();
  const ctaHref = await cta.getAttribute('href');
  check('home: CTA "Agendar consulta" → /agendar/', ctaText === 'Agendar consulta' && ctaHref === BASE + '/agendar/', ctaText + ' ' + ctaHref);
  const notice = (await page.locator('.site-footer__notice').first().textContent()).trim();
  check('home: aviso demo en footer', notice.includes('Sitio de demostración') && notice.includes('ficticios'), notice);
  await page.screenshot({ path: path.join(__dirname, '..', '.orion', 'gates', 'artifacts', 'home.png') }).catch(() => {});

  // ---------- SERVICIO FICHA ----------
  await page.goto(HOST + BASE + '/servicios/despidos-y-ceses/', { waitUntil: 'networkidle' });
  const fichaH1 = (await page.locator('h1').textContent()).trim();
  check('ficha: h1 = servicio', fichaH1 === 'Despidos y ceses', 'h1=' + fichaH1);
  const agendarCta = page.getByRole('link', { name: 'Agendar una consulta' });
  const agendarHref = await agendarCta.getAttribute('href');
  check('ficha: CTA Agendar enlaza con ?servicio=', agendarHref === BASE + '/agendar/?servicio=despidos-y-ceses', agendarHref);
  const waCta = page.getByRole('link', { name: 'Consultar por WhatsApp' });
  const waHref = await waCta.getAttribute('href');
  check('ficha: CTA WhatsApp wa.me con servicio', waHref.startsWith('https://wa.me/59899000000') && waHref.includes('%20Despidos%20y%20ceses'), waHref);

  // ---------- FLUJO AGENDAR ----------
  await page.goto(HOST + BASE + '/agendar/?servicio=despidos-y-ceses', { waitUntil: 'networkidle' });
  const presel = await page.locator('#f-servicio').inputValue();
  check('agendar: preselección ?servicio= en el select', presel === 'despidos-y-ceses', presel);
  const modalidad = await page.locator('#f-modalidad').inputValue();
  check('agendar: modalidad default presente', modalidad === 'Presencial en el estudio', modalidad);

  const fecha = nextSlotDate();
  await page.fill('#f-fecha', fecha);
  // Espera a que los horarios se generen (condición, no sleep)
  await page.waitForSelector('#f-hora .slot', { timeout: 5000 });
  const slotCount = await page.locator('#f-hora .slot').count();
  check('agendar: horarios generados sin API', slotCount >= 1, 'slots=' + slotCount);
  await page.locator('#f-hora .slot').first().click();

  await page.fill('#f-nombre', 'Cliente QA E2E');
  await page.fill('#f-telefono', '099 000 111');
  await page.fill('#f-email', 'cliente@qa.test');
  await page.fill('#f-mensaje', 'Consulta de prueba del flujo e2e');
  await page.screenshot({ path: path.join(__dirname, '..', '.orion', 'gates', 'artifacts', 'agendar-prefill.png') }).catch(() => {});

  let popupWa = null;
  page.on('popup', async (pop) => { popupWa = pop.url(); waUrls.push(popupWa); await pop.close().catch(() => {}); });
  const waReq = page.waitForRequest(r => r.url().startsWith('https://wa.me/'), { timeout: 8000 }).catch(() => null);

  await Promise.all([
    page.waitForURL('**' + BASE + '/gracias/', { timeout: 8000 }),
    page.locator('button[type="submit"]').click()
  ]);
  const graciasH1 = (await page.locator('h1').textContent()).trim();
  check('agendar: llega a /gracias/ con h1', graciasH1 === '¡Consulta enviada!', graciasH1);
  await page.screenshot({ path: path.join(__dirname, '..', '.orion', 'gates', 'artifacts', 'gracias.png') }).catch(() => {});
  const finalWa = (await page.evaluate(() => sessionStorage.getItem('__qa_last_wa'))) || popupWa || (await waReq)?.url() || null;
  check('agendar: wa.me abierto con la consulta', !!finalWa && finalWa.startsWith('https://wa.me/59899000000'), finalWa);

  const stored = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), CITAS_KEY);
  const cita = stored[0];
  check('agendar: cita guardada en localStorage', !!cita, JSON.stringify(cita));
  check('agendar: cita con servicio + nombre', cita && cita.servicio === 'despidos-y-ceses' && cita.nombre === 'Cliente QA E2E', JSON.stringify(cita && { s: cita.servicio, n: cita.nombre }));
  check('agendar: cita con hora elegida', cita && /^\d{2}:\d{2}$/.test(cita.hora), cita && cita.hora);

  // ---------- ADMIN ----------
  await page.goto(HOST + BASE + '/admin.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('#panel-view, #login-view', { timeout: 5000 });
  const panelHiddenAttr = await page.getAttribute('#panel-view', 'hidden');
  const loginHiddenAttr = await page.getAttribute('#login-view', 'hidden');
  const panelVisible = await page.locator('#panel-view').isVisible();
  const sess = await page.evaluate(() => sessionStorage.getItem('estudioarroyo_demo_admin'));
  console.log('  [admin] panelHiddenAttr=' + panelHiddenAttr + ' loginHiddenAttr=' + loginHiddenAttr + ' panelVisible=' + panelVisible + ' session=' + sess);
  // Sin sesión el panel debe quedar oculto (atributo hidden presente) y login visible.
  check('admin: sin sesión el panel queda oculto (no auto-login)', panelHiddenAttr !== null && loginHiddenAttr === null,
    'panelHidden=' + panelHiddenAttr + ' loginHidden=' + loginHiddenAttr);
  // Regresión CSS: el atributo hidden debe ocultar el panel aunque admin.css defina display.
  check('admin: `hidden` oculta el panel (CSS no lo pisa)', panelVisible === false, 'panelVisible=' + panelVisible + ' → si es true, .admin-shell display:flex pisa el hidden');
  if (loginHiddenAttr === null) {
    await page.fill('#pin-input', '0000');
    await page.click('#login-btn');
    await page.waitForSelector('#panel-view:not([hidden])', { timeout: 5000 });
    const afterPanels = await page.getAttribute('#panel-view', 'hidden');
    check('admin: login con PIN 0000 deja el panel sin hidden', afterPanels === null, 'panelHidden=' + afterPanels);
  }
  const citaRow = await page.locator('.admin-card').count();
  check('admin: lista citas renderizada (>=1)', citaRow >= 1, 'cards=' + citaRow);
  const cardText = await page.locator('.admin-card').first().textContent();
  check('admin: la cita recién creada figura en la lista', cardText.includes('Cliente QA E2E') && cardText.includes('despidos-y-ceses'), cardText.slice(0, 160));
  const kpiTotal = await page.locator('#kpi-total').textContent();
  check('admin: KPI total coherente', Number(kpiTotal) >= 1, 'kpi=' + kpiTotal);
  await page.screenshot({ path: path.join(__dirname, '..', '.orion', 'gates', 'artifacts', 'admin.png') }).catch(() => {});

  // ---------- CONTACTO ----------
  await page.goto(HOST + BASE + '/contacto/', { waitUntil: 'networkidle' });
  const motivoOpts = await page.locator('#f-motivo option').count();
  const urgenciaOpts = await page.locator('#f-urgencia option').count();
  check('contacto: select Tipo de consulta funcional (7 opts)', motivoOpts === 7, 'opts=' + motivoOpts);
  check('contacto: select urgencia funcional (4 opts)', urgenciaOpts === 4, 'opts=' + urgenciaOpts);
  await page.selectOption('#f-motivo', 'Divorcio');
  await page.selectOption('#f-urgencia', 'Sí, tengo una fecha límite');
  check('contacto: selects cambian valor', (await page.locator('#f-motivo').inputValue()) === 'Divorcio' && (await page.locator('#f-urgencia').inputValue()) === 'Sí, tengo una fecha límite', '');

  popupWa = null;
  const waReq2 = page.waitForRequest(r => r.url().startsWith('https://wa.me/'), { timeout: 8000 }).catch(() => null);
  await page.evaluate(() => sessionStorage.removeItem('__qa_last_wa'));
  await page.fill('#f-nombre', 'Contacto QA E2E');
  await page.fill('#f-telefono', '099 000 222');
  await page.fill('#f-mensaje', 'Tengo una duda sobre mi divorcio');
  await Promise.all([
    page.waitForURL('**' + BASE + '/gracias/', { timeout: 8000 }),
    page.locator('button[type="submit"]').click()
  ]);
  const contWa = (await page.evaluate(() => sessionStorage.getItem('__qa_last_wa'))) || popupWa || (await waReq2)?.url() || null;
  check('contacto: wa.me con mensaje formado', !!contWa && contWa.startsWith('https://wa.me/59899000000?text='), contWa);
  const stored2 = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '[]'), CITAS_KEY);
  check('contacto: registro guardado en la misma lista', stored2.length >= 2 && stored2[0].nombre === 'Contacto QA E2E', 'len=' + stored2.length + ' top=' + (stored2[0] || {}).nombre);

  // ---------- CONSOLA ----------
  const cleanErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('net::ERR'));
  check('consola: 0 errores JS en home/ficha/agendar/admin/gracias/contacto', cleanErrors.length === 0, JSON.stringify(cleanErrors.slice(0, 5)));

  await browser.close();
  server.close();
  console.log(`\n${pass}/${pass + fail} PASS`);
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => { console.error('FATAL ' + e.message); process.exit(1); });