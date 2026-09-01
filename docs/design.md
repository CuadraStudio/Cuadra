# Luciano Martin - Especificacion de Diseno por Pagina

Referencia: DESIGN.md (tokens y rationale)

---

## Navegacion Global

### Estructura
Barra de navegacion fija arriba. Un solo nivel. Cuatro enlaces: Inicio, Proyectos, Sobre mi, Contacto.

### Comportamiento
- **Desktop (>= 1024px)**: Barra horizontal, unica linea, altura maxima 72px. Logo "LM" a la izquierda, enlaces a la derecha. Fondo bg-raised con border inferior en 8% opacity.
- **Tablet (768px - 1023px)**: Misma estructura, enlaces con font-size reducido.
- **Mobile (< 768px)**: Logo "LM" a la izquierda, boton hamburguesa a la derecha. Menu desplegable ocupa toda la pantalla con fondo overlay. Enlaces centrados verticalmente, display-md font.

### Interacciones
- Enlace activo: texto en accent color, underline de 2px en accent.
- Hover: transicion de color 200ms.
- Hamburguesa: animacion de lineas a cruz usando transform (3 lineas, 200ms).
- Focus visible: outline 2px solid accent, offset 2px.

### Accesibilidad
- Nav con role="navigation" y aria-label="Navegacion principal".
- Enlace actual con aria-current="page".
- Hamburguesa con aria-expanded, aria-controls apuntando al menu.
- Menu mobile con role="dialog" y aria-modal="true".

---

## Pagina Home (/)

### Hero

**Layout**: Dos columnas en desktop (60/40). Mobile: columna unica.

**Contenido**:
- Columna izquierda (texto):
  - Etiqueta: "Desarrollador Web" en label font (0.75rem, weight 500, letter-spacing 0.05em), color text-secondary.
  - Titulo: "Luciano Martin" en display-xl (clamp 3rem a 4rem), weight 700, color text.
  - Subtitulo: "Creo sitios web que funcionan y se ven bien. Especializado en barberias y negocios locales en Montevideo." en body-lg (1.125rem), color text-secondary, max-width 50ch.
  - CTA: Boton "Ver proyectos" en button-primary. Enlace "Contactame" en button-secondary a la derecha.

- Columna derecha (avatar):
  - Avatar circular de 200px en desktop, 140px en mobile.
  - Gradiente de accent a accent-hover.
  - Texto "LM" en display-xl weight, color blanco.
  - role="img", aria-label="Luciano Martin".

**Espaciado**:
- Desktop: padding-top 6rem (seccion), gap entre columnas 4rem.
- Mobile: padding-top 4rem, avatar arriba del texto, gap 2rem.

**Responsive**:
- Mobile (< 768px): columna unica, avatar centrado arriba, texto centrado.
- Desktop (>= 1024px): dos columnas, texto a la izquierda, avatar a la derecha.

### Proyectos Destacados

**Layout**: Grid de 3 columnas en desktop, 1 en mobile.

**Contenido**:
- Titulo de seccion: "Proyectos destacados" en display-md.
- 3 cards de proyecto, cada una con:
  - Imagen preview (placeholder con bg-card-hover, aspect-ratio 16/9).
  - Nombre del proyecto en h3.
  - Descripcion corta (max 2 lineas) en body-sm, color text-secondary.
  - Link "Ver sitio" en accent color, con flecha.

**Espaciado**:
- Section padding: 6rem vertical, page horizontal.
- Grid gap: 1.5rem.
- Card padding: 24px.

**Responsive**:
- Mobile: columna unica, cards apiladas.
- Tablet (768px): 2 columnas.
- Desktop (>= 1024px): 3 columnas.

**Interacciones**:
- Card hover: background sube a bg-card-hover, transicion 200ms.
- Link hover: color accent-hover, flecha se mueve 4px a la derecha.
- Focus visible en todo el card (no solo el link).

### Sobre Mi (resumen)

**Layout**: Dos columnas asimetricas en desktop (55/45). Mobile: columna unica.

**Contenido**:
- Titulo: "Sobre mi" en display-md.
- Texto: Bio breve en body-lg, max-width 55ch. Contenido: autodidacta, 28 anos, Montevideo, usa IA como herramienta, 3 sitios publicados.
- Lista de tech stack: logos de HTML, CSS, JavaScript, Git en linea horizontal. Cada logo con aria-label.

**Espaciado**:
- Section padding: 6rem vertical.
- Gap entre titulo y texto: 1.5rem.
- Gap entre texto y tech stack: 2rem.

**Responsive**:
- Mobile: columna unica, tech stack centrado.
- Desktop: dos columnas, titulo + texto a la izquierda, nada a la derecha (asimetria intencional).

### Call to Action Contacto

**Layout**: Bloque centrado con fondo bg-raised.

**Contenido**:
- Titulo: "Trabajemos juntos" en display-md.
- Texto: "Tenes un proyecto en mente? Me encantaria escucharlo." en body, color text-secondary.
- Boton: "Contactame" en button-primary.

**Espaciado**:
- Section padding: 5rem vertical.
- Boton margin-top: 2rem.

---

## Pagina Proyectos (/proyectos)

### Header de Pagina

**Contenido**:
- Titulo: "Proyectos" en display-lg.
- Subtitulo: "Sitios web que he creado para barberias y negocios locales." en body-lg, color text-secondary.

**Espaciado**:
- Padding-top: 8rem (要考虑 navbar), padding-bottom: 4rem.

### Grid de Proyectos

**Layout**: Grid de 2 columnas en desktop, 1 en mobile.

**Contenido**: 3 cards de proyecto, cada una con:
- Imagen preview: placeholder con bg-card-hover, aspect-ratio 16/9, border-radius lg.
- Contenido interno de la card:
  - Nombre del proyecto en h2 (display-md en mobile, display-lg en desktop).
  - Descripcion completa en body, color text-secondary, max-width 60ch.
  - Tecnologias usadas: pills con bg-accent-subtle, color accent, border-radius full, padding 4px 12px, font-size label.
  - Link "Visitar sitio" en accent color.

**Espaciado**:
- Grid gap: 2rem.
- Card padding: 0 (imagen borde a borde) + 24px interno para texto.
- Section padding: 6rem vertical.

**Responsive**:
- Mobile: columna unica.
- Desktop: 2 columnas. La primera card puede ser full-width para destacar.

**Interacciones**:
- Card hover: background sube, transicion 200ms.
- Link hover: accent-hover, underline.
- Pills de tech: sin interaccion (son informativos).

---

## Pagina Sobre Mi (/sobre-mi)

### Header de Pagina

**Contenido**:
- Titulo: "Sobre mi" en display-lg.
- Avatar: mismo tratamiento que el hero de Home (circular, gradiente, "LM").

**Layout**: Avatar y titulo en linea en desktop, apilados en mobile.

### Bio Completa

**Layout**: Columna unica, max-width 65ch centrada.

**Contenido**:
- Parrafo 1: Quien soy (28 anos, Montevideo, nacido en Cordoba, Argentina).
- Parrafo 2: Como trabajo (autodidacta, usa IA como herramienta, enfoque en barberias y negocios locales).
- Parrafo 3: Que he hecho (3 sitios publicados y funcionando).

**Tipografia**: body-lg para parrafos, spacing entre parrafos 1.5rem.

### Stack Tecnologico

**Layout**: Grid de iconos en 2 filas. Mobile: fila unica con scroll horizontal.

**Contenido**:
- Fila 1: HTML5, CSS3, JavaScript.
- Fila 2: Git, GitHub, APIs REST.
- Cada item: icono (placeholder rectangular 48x48) + nombre en label font.
- Color: text-secondary para iconos, text para nombres.

**Espaciado**:
- Grid gap: 2rem horizontal, 1.5rem vertical.
- Section padding: 6rem vertical.

### Filosofia de Trabajo

**Layout**: Columna unica, max-width 65ch.

**Contenido**:
- Titulo: "Como trabajo" en display-md.
- Lista de principios (no bulleted, usando separadores visuales):
  - Cada principio: titulo en h3, descripcion en body-sm.
  - Principios: "Codigo limpio y mantenible", "Diseno mobile-first", "Accesibilidad como estandar", "Aprendizaje continuo".

**Espaciado**:
- Gap entre principios: 2rem.
- Separador visual: line de 1px en border color entre principios.

---

## Pagina Contacto (/contacto)

### Header de Pagina

**Contenido**:
- Titulo: "Contacto" en display-lg.
- Subtitulo: "¿Tenés un proyecto en mente? Hablemos." en body-lg, color text-secondary.

### Formulario

**Layout**: Columna unica, max-width 540px centrada.

**Campos**:
- Nombre: input text, label arriba en label font, placeholder "Tu nombre".
- Email: input email, label arriba, placeholder "tu@email.com".
- Mensaje: textarea, label arriba, placeholder "Contame sobre tu proyecto...", min-height 120px.
- Boton: "Enviar mensaje" en button-primary, full-width en mobile, auto-width en desktop.

**Estilos de campos**:
- Background: bg-raised.
- Border: 1px solid border.
- Border-radius: md (8px).
- Padding: 12px 16px.
- Focus: border-color accent, box-shadow 0 0 0 3px accent-subtle.
- Error state: border-color error, texto de error en error color debajo del campo.

**Espaciado**:
- Gap entre campos: 1.5rem.
- Section padding: 6rem vertical.

### Links Directos

**Layout**: Grid de 3 columnas en desktop, 1 en mobile. Debajo del formulario.

**Contenido**:
- Email: icono + "fedemiranda2198@gmail.com" en accent color, link mailto:.
- GitHub: icono + "github.com/fedmiranda" en accent color, link externo.
- Telefono: icono + "099 331 909" en accent color, link tel:.

**Espaciado**:
- Gap: 1.5rem.
- Margin-top: 3rem (separacion del formulario).

---

## Footer Global

**Contenido**:
- Texto: "© 2026 Luciano Martin" en caption font, color text-muted.
- Links: GitHub, email, telefono en linea horizontal.
- Layout: flex horizontal, justify-content space-between, align-items center.

**Estilos**:
- Background: bg-raised.
- Border-top: 1px solid border.
- Padding: 1.5rem vertical, page horizontal.

**Responsive**:
- Mobile: texto centrado, links debajo en linea.
- Desktop: texto izquierda, links derecha.

---

## Comportamiento Global

### Scroll Reveal

Todos los elementos dentro de las secciones usan IntersectionObserver para revelarse al entrar en viewport.

**Configuracion**:
- Threshold: 0.15 (15% visible).
- Animacion: opacity 0 a 1, translateY 20px a 0.
- Duracion: 500ms, easing cubic-bezier(0.16, 1, 0.3, 1).
- Stagger: 100ms entre elementos hermanos.
- Una sola vez: once: true.

**Reduced Motion**: Sin animacion. Elementos visibles desde el inicio.

### Hover States

- **Cards**: background sube un tier (bg-card a bg-card-hover), transicion 200ms.
- **Links**: color accent a accent-hover, transicion 200ms.
- **Botones primary**: background primary a primary-hover, transicion 200ms.
- **Botones secondary**: background transparent a bg-card, transicion 200ms.
- **Avatar**: scale 1.02, transicion 300ms.

### Focus States

- Todos los elementos interactivos: outline 2px solid accent, outline-offset 2px.
- Inputs: border-color accent, box-shadow 0 0 0 3px accent-subtle.
- Sin outline en :focus-visible para elementos que no son interactivos.

### Loading States

- Imagenes de proyecto: placeholder con bg-card-hover y animacion de shimmer (si se implementa).
- Formulario: boton en estado disabled con opacity 0.6 durante envio.

### Empty States

- Proyectos: si no hay proyectos, mostrar "Proximamente" en body-lg, color text-muted.
- Formulario: si hay error de envio, mostrar mensaje de error inline debajo del boton.

---

## Archivos de Estilo

### Estructura
```
css/
  tokens.css      -- Custom properties (colores, tipografia, espaciado, etc.)
  base.css        -- Reset, tipografia base, enlaces
  layout.css      -- Grid, contenedores, responsive
  components.css  -- Botones, cards, inputs, avatar, nav
  pages.css       -- Estilos especificos por pagina
  animations.css  -- Scroll reveal, hover states, transitions
```

### Orden de carga
1. tokens.css
2. base.css
3. layout.css
4. components.css
5. pages.css
6. animations.css

### Media Queries
```css
/* Mobile-first: estilos base son para mobile */
/* Tablet */
@media (min-width: 640px) { ... }
/* Desktop */
@media (min-width: 768px) { ... }
/* Large desktop */
@media (min-width: 1024px) { ... }
/* Extra large */
@media (min-width: 1280px) { ... }
```
