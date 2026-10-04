# confirm-email — copia del mensaje para quien lo envía

Cuando alguien completa un formulario de la web (contacto, diálogo del sitio en construcción o datos del plan), `js/main.js` hace dos cosas:

1. **FormSubmit** te manda el mensaje a `cuadrastudio.uy@gmail.com` (ya configurado).
2. Si el paso 1 salió bien, llama a este Worker, que usa **Resend** para enviarle a la persona un correo con **copia de lo que envió**, desde `no-reply@cuadrastudio.uy` y con respuesta a `cuadrastudio.uy@gmail.com`.

Si el Worker no está configurado o falla, la web funciona igual: solo no se envía la copia.

## Puesta en marcha (una sola vez)

1. **Verificar el dominio en Resend.** Resend → *Domains* → *Add Domain* → `cuadrastudio.uy`. Cargá en tu DNS los registros que te indica (SPF y DKIM, y DMARC si querés) y esperá a que figure como *Verified*. Sin dominio verificado, Resend solo deja enviar a tu propia casilla.
2. **Crear una clave de API.** Resend → *API Keys* → *Create API Key* → permiso **Sending access**, limitada al dominio `cuadrastudio.uy`. Copiala (se muestra una sola vez).
3. **Cuenta de Cloudflare** (gratis) e instalación de `wrangler`: `npm i -g wrangler` y `wrangler login`.
4. **(Recomendado) Límite de envíos.** `npx wrangler kv namespace create RATE`, copiá el `id` que devuelve y descomentá las 3 líneas `[[kv_namespaces]]` de `wrangler.toml`. Activa 5 envíos / 10 min por IP y 3 copias por día a la misma dirección.
5. **Guardar la clave como secreto** (nunca en el código ni en git):
   ```
   cd workers/confirm-email
   npx wrangler secret put RESEND_API_KEY
   ```
6. **Publicar:** `npx wrangler deploy`. Devuelve una URL como `https://cuadra-confirm-email.<tu-cuenta>.workers.dev`.
7. **Conectar la web:** en `js/site-config.js` poné esa URL en `confirmEndpoint`, hacé commit y push.
8. **Probar** (reemplazá la URL y el email):
   ```
   curl -X POST https://cuadra-confirm-email.<tu-cuenta>.workers.dev \
     -H "Origin: https://cuadrastudio.uy" -H "Content-Type: application/json" \
     -d '{"kind":"contact","fields":{"Nombre":"Prueba","Email":"tu@correo.com","Mensaje":"Hola"}}'
   ```
   Tiene que responder `{"ok":true}` y llegarte la copia.

## Qué recibe la persona

- Asunto: **"Copia de tu mensaje a CUADRA"** (contacto) o **"Copia de tu plan: CUADRA Agenda"** (plan).
- Cuerpo: saludo con su nombre, tabla con todo lo que completó (y el plan con extras y precios en USD) y aviso de que le respondés a ese mismo correo.
- Versión HTML y de texto plano.

## Seguridad

El endpoint es público y manda un correo a la dirección que le indican, así que:

- Solo acepta pedidos desde `https://cuadrastudio.uy` y `https://www.cuadrastudio.uy` (`ALLOWED_ORIGINS`).
- La plantilla es fija: lo que escribe la persona solo aparece escapado dentro de la tabla.
- Limita cantidad y largo de campos, rechaza varios destinatarios y saltos de línea en el asunto.
- Descarta envíos de bots (campo trampa) y aplica el límite por IP y por destinatario (si activaste `RATE`).
- Si más adelante recibís abuso, agregá Cloudflare Turnstile en el formulario y verificalo en el Worker.

## Límites de Resend (plan gratis)

3.000 correos por mes y 100 por día. Cada formulario enviado usa 1.
