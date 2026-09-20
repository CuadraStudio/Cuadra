---
name: CUADRA
description: "Desarrollo web a medida en Montevideo. Dark-first arquitectonico y editorial, paleta black/graphite/sage, Montserrat por-rol: peso 600 + tracking negativo en titulares (sentence case), peso 500-600 + tracking 0.04-0.14em en labels/botones/eyebrows (mayusculas), peso 400 + tracking normal en cuerpo; isotipo geometrico. 8 paginas estaticas (home-editorial en todas). HTML + CSS + JS vanilla. Deploy en Render Static Site."

colors:
  bg: "#0F1111"
  bg-raised: "#292E2D"
  bg-card: "#F2F1ED"
  bg-card-hover: "#292E2D"
  text: "#F2F1ED"
  text-secondary: "#A7AAAD"
  text-muted: "#A7AAAD"
  primary: "#AFC8C2"
  primary-hover: "#93B5AE"
  accent: "#AFC8C2"
  accent-hover: "#93B5AE"
  border: "#A7AAAD"
  border-strong: "#D8E2DF"
  success: "#AFC8C2"
  error: "#E58E7E"
  focus: "#AFC8C2"

gradients:
  hero: "none"
  accent: "none"

shadows:
  sm: "0 1px 2px rgba(15, 17, 17, 0.20)"
  md: "0 4px 12px rgba(15, 17, 17, 0.25)"
  lg: "0 8px 24px rgba(15, 17, 17, 0.30)"

glassmorphism:
  bg: "rgba(242, 241, 237, 0.04)"
  border: "rgba(242, 241, 237, 0.12)"
  blur: "8px"

typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 3.75rem
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Montserrat
    fontSize: 2.75rem
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.015em
  display-md:
    fontFamily: Montserrat
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  heading-xl:
    fontFamily: Montserrat
    fontSize: 1.375rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  heading-lg:
    fontFamily: Montserrat
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.005em
  heading-md:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.005em
  heading-sm:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.005em
  heading-xs:
    fontFamily: Montserrat
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.06em
  title:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.1em
  h4:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Montserrat
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  body:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  small:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.02em
  caption:
    fontFamily: Montserrat
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.08em
  micro:
    fontFamily: Montserrat
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.14em

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "4px"
    padding: "12px 24px"
    typography:
      fontFamily: Montserrat
      fontSize: 0.8125rem
      fontWeight: 600
      letterSpacing: 0.06em
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "4px"
    padding: "12px 24px"
    typography:
      fontFamily: Montserrat
      fontSize: 0.8125rem
      fontWeight: 600
      letterSpacing: 0.06em
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "8px"
    padding: "24px"
---

# CUADRA — Design System

## Overview

CUADRA es un estudio de desarrollo web a medida en Montevideo, Uruguay. Cada sitio se diseña y construye pieza por pieza, como una cuadra urbana: medido, estructurado y funcional. Dark-first, arquitectónico y editorial.

**Design Read**: Dark-first arquitectónico. Predominio de CUADRA Black (#0F1111) con Graphite (#292E2D) para superficies secundarias y Sage (#AFC8C2) como acento de identidad (nunca como fondo masivo). Tipografía Montserrat como fuente única principal con política **por-rol**: peso 600 + tracking negativo (-0.005em a -0.02em, más ajustado cuanto más grande) + caso normal en titulares y nombres de producto; peso 500-600 + mayúsculas + tracking 0.04-0.14em en labels/eyebrows/botones/tags cortos; peso 400 + caso normal + tracking neutro en cuerpo/lectura. Bordes finos y discretos, radios rectilíneos, sin sombras ni efectos dramáticos. Debe sentirse como estudio de diseño + estudio de arquitectura + ingeniería digital.

## Colors

Paleta neutra y arquitectónica. **CUADRA Black** (#0F1111): fondos principales — header, footer, hero, secciones premium. **Graphite** (#292E2D): superficies secundarias — cards oscuras, navegación, profundidad. **Sage** (#AFC8C2): CTAs, detalles, estados activos — acento, no fondo masivo. **Mist** (#D8E2DF): fondos claros y secciones destacadas. **Warm White** (#F2F1ED): fondo claro principal y tipografía sobre fondos oscuros. **Concrete** (#A7AAAD): texto secundario, bordes, metadatos. Proporción recomendada: 40% black / 20% graphite / 20% sage / 10% mist / 5% white / 5% concrete.

## Typography

**Montserrat** como fuente única principal (reemplaza Space Grotesk e Inter). Fuente familiar: `--font-primary: 'Montserrat', sans-serif`.

> **Nota de vigencia**: esta sección documenta el sistema tipográfico realmente en producción — la variante editorial (namespace `.ed-*`, `css/home-editorial.css`), que hoy renderiza el 100% de las páginas del sitio (las 8 páginas raíz usan `.home-editorial`). Una versión anterior de este documento describía un sistema Montserrat Light 300 con tracking ancho (0.38em/0.18em/0.02em) que ninguna página actual usa; queda reemplazada por la tabla de abajo.

### Tracking Policy (Identity Language — role-based)

**Peso 600 + tracking negativo + caso normal — titulares y nombres de producto**:
- Hero title, section labels de producto (.ed-hero__title, .ed-feature__title, .ed-row__title, .ed-timeline__title, .ed-cta__title, .ed-lettered__title, .ed-footer__email)
- Tracking se ajusta con el tamaño: -0.005em en títulos chicos (~1-1.1rem), hasta -0.02em en el H1 del hero
- Caso normal (sentence case), NUNCA mayúsculas — son frases que se leen, no se escanean

**Peso 500-600 + MAYÚSCULAS + tracking 0.04–0.14em — labels, eyebrows, botones, tags cortos**:
- Botones y CTAs (.ed-cta__btn, .ed-feature__cta, .ed-hero__link): 0.04-0.06em, peso 600
- Section index/labels, eyebrows (.ed-section__label, .ed-feature__eyebrow, .ed-cta__eyebrow, .ed-footer__col-title): 0.1-0.14em, peso 600
- Nav wordmark/brand lockup (.ed-nav__brand): hasta 0.28em, peso 600
- Nav links (.ed-nav .nav__link): caso normal (no mayúsculas), peso 500, 0.02em — excepción dentro de esta franja, prioriza legibilidad de navegación sobre la convención de mayúsculas

**Peso 400 + caso normal + tracking neutro (0 a 0.02em) — cuerpo/lectura**:
- Párrafos y descripciones (.ed-hero__subtitle, .ed-section__lede, .ed-feature__tagline, .ed-row__desc, .ed-timeline__text, .ed-cta__text, .ed-footer__col a)
- FAQ (preguntas en peso 600 sentence-case como titulares cortos; respuestas en peso 400 cuerpo)

### Justificación de Legibilidad (WCAG)

- **Mayúsculas + tracking ancho funciona para interfaz corta**: Texto corto se escanea, no se lee. Tracking 0.04-0.14em más mayúsculas refuerza identidad sin el costo de legibilidad de un tracking extremo.
- **Mayúsculas + tracking ancho falla en cuerpo**: Párrafos requieren lectura continua; por eso el cuerpo se mantiene en caso normal, peso 400, sin mayúsculas.
- **Compromiso documentado**: Interfaz corta = identidad (mayúsculas + 0.04-0.14em). Titulares = peso, no tracking (600 + negativo, sentence case). Cuerpo = legibilidad (400 + neutro).

### Escala Tipográfica

| Token | Peso | Tamaño | Line-height | Tracking | Uso |
|-------|------|--------|-------------|----------|-----|
| --text-display-xl | 600 | clamp(2.5rem, 5vw, 3.75rem) | 1.05 | -0.02em | H1 del hero |
| --text-display-lg | 600 | clamp(1.75rem, 4vw, 2.75rem) | 1.15 | -0.015em | Títulos CTA final |
| --text-display-md | 600 | clamp(1.5rem, 3vw, 2rem) | 1.2 | -0.01em | Títulos de feature destacado |
| --text-h2 | 600 | 1.375rem | 1.25 | -0.01em | Subtítulos |
| --text-h3 | 600 | 1.125rem | 1.3 | -0.005em | Títulos menores (row, timeline, lettered) |
| --text-body-lg | 400 | 1.125rem | 1.55 | 0em | Párrafos grandes (hero subtitle, lede) |
| --text-body | 400 | 1rem | 1.6 | 0em | Cuerpo principal |
| --text-body-sm | 400 | 0.875rem | 1.5 | 0.02em | Texto secundario |
| --text-label | 600 | 0.8125rem (13px min) | 1.4 | 0.06em | Botones, CTAs |
| --text-caption | 500 | 0.75rem (12px min) | 1.4 | 0.08em | Tags, pills, captions |
| --text-stat | 600 | clamp(2rem, 4vw, 3rem) | 1.0 | 0.1em | Números destacados |

### Tokens de Letter-Spacing

```css
--letter-spacing-heading: -0.005em a -0.02em;  /* titulares, negativo, escala con tamaño */
--letter-spacing-label: 0.04em a 0.06em;        /* botones/CTAs, mayúsculas */
--letter-spacing-eyebrow: 0.1em a 0.14em;       /* eyebrows/section labels, mayúsculas */
--letter-spacing-body: 0em a 0.02em;            /* texto corrido, caso normal */
```

### Excepciones de Peso

- **Base**: nunca menor a 400 en todo el sistema (sin pesos Light/300 en producción)
- **Cuerpo**: peso 400
- **Nav links**: peso 500 (excepción de caso: normal, no mayúsculas)
- **Titulares, labels, eyebrows, botones**: peso 600
- **Mínimos de tamaño**: Labels 13px mín, captions 12px mín

### Wordmark "CUADRA"

La palabra "CUADRA" ya no tiene un tratamiento único fijo en todo el sitio — varía por contexto igual que el resto del sistema por-rol: el lockup de marca en el nav (.ed-nav__brand) usa peso 600 + 0.28em + mayúsculas; el copyright del footer (.ed-footer__bottom .brand-wordmark) usa 0.1em; el wordmark del hero de construcción (.hero--construction .hero__label, index.html) conserva el tratamiento heredado de base.css. Al referenciar "CUADRA" en una pieza nueva, seguí el tracking del rol que le corresponda (titular, label corto, o wordmark de marca) en lugar de asumir un valor único fijo.

### Jerarquía del Hero (index.html — construcción)

1. Logo/isotipo (.hero__logo)
2. **CUADRA** (wordmark, clamp(2.5rem, 10vw, 5.5rem), 0.38em, formato marca fijo)
3. Rotador de propuestas (clamp(1rem, 2.6vw, 1.375rem), peso 600, tracking normal — actualizado por home-editorial.css) — min-height 4em / 2.8em (≥640) / 2.8em (≥1024) para que la frase más alta NUNCA se solape con el subtitle y sin saltos al rotar
4. Subtitle histórico (.hero__subtitle, 1rem/1.6, 58ch) — 0.02em normal, conservado
5. CTAs (buttons, 0.38em, peso 500)

## Layout

Grid editorial: 12 columnas desktop (gutter 20-32px, contenedor máximo 1280-1440px), 8 columnas tablet, 4 columnas mobile (gutter 16px, márgenes 16-20px). Espacio en blanco deliberado entre secciones: 96-160px desktop, 64-96px mobile. El espacio vacío es parte de la identidad — nada se llena sin razón. 3 páginas: Home (Hero -> Stats -> Antes/Después -> Proyectos -> Proceso -> Testimonios -> Pricing -> FAQ -> CTA), Proyectos, Contacto.

## Brand Identity

- **Nombre**: CUADRA (referencia a la unidad de medida urbana — cada sitio se diseña a medida)
- **Isotipo**: Interpretación geométrica de `¬=` — SVG propio, trazos consistentes, esquinas limpias, alto contraste a tamaños pequeños
- **Tono**: Directo, claro, profesional, técnico. Sin exageraciones.
- **Accent**: Sage (#AFC8C2)
- **Motion**: Easing global cubic-bezier(0.22, 1, 0.36, 1); micro 150-200ms, normal 250-400ms, reveal 500-800ms; underlines animados, bordes que se expanden, reveal on scroll discreto; respetar prefers-reduced-motion
- **Deploy**: Render Static Site (cuadrastudio.uy)

## Accessibility

Contraste WCAG AA (4.5:1 mínimo para texto normal, 3:1 para texto grande). Contrastes verificados: concrete/black 8.1:1, black/sage 10.7:1, sage/white 1.57:1 (FALLA — nunca sage como texto sobre fondos claros). Estado de focus visible en every interactive element. Skip link funcional. Formulario con labels. Sin overflow horizontal 390/1440: buttons con white-space normal + centrado, footer links con flex-wrap, rotador con min-height medido.

## Do's and Don'ts

- Do usar Sage (#AFC8C2) para CTAs y estados activos — nunca como fondo masivo ni como texto sobre fondos claros
- Do usar Graphite (#292E2D) para elevación sobre black (bordes +1px darker, no sombras)
- Do usar Montserrat como fuente única principal (peso 400 mínimo — sin Light/300 en producción)
- Do usar peso 600 + tracking negativo (-0.005em a -0.02em) + caso normal en titulares: hero, section titles, cards, footer email
- Do usar peso 500-600 + MAYÚSCULAS + tracking 0.04-0.14em en labels/eyebrows/botones/tags cortos
- Do usar peso 400 + caso normal + tracking neutro para cuerpo: párrafos, testimonios, formularios, footer copy
- Do usar peso 600 para botones (affordance) y peso 500 para nav links (única excepción de caso normal dentro de la franja de labels)
- Do seguir el tracking del rol correspondiente para cada aparición de "CUADRA" (nav 0.28em, footer 0.1em, hero de construcción hereda base.css) — ya no hay un valor único fijo
- Do mantener 13px mínimo para labels, 12px para captions
- Do mantener el rotador con min-height que cubra la frase más alta (4em base / 2.8em ≥640) sin superponerse al subtitle
- Do usar bordes finos (1px solid rgba(242,241,237,0.12) sobre oscuro, rgba(15,17,17,0.12) sobre claro)
- Do usar radios rectilíneos: 0px editorial, 2-4px botones, 8px cards, 12px imágenes
- Do mantener contraste WCAG AA (4.5:1 mínimo para texto)
- Do mantener el hero alineado a la izquierda en desktop
- Don't usar box-shadows decorativos ni glows — la elevación es por color y borde, no por sombra
- Don't usar esquinas muy redondeadas ni cards tipo SaaS dashboard (chrome redondeado, glassmorphism)
- Don't usar gradientes excesivos, neon/cyberpunk ni estética gamer
- Don't usar iconos rellenos mezclados con lineales (todo trazo fino y consistente)
- Don't usar serif fonts
- Don't agregar emojis en el código