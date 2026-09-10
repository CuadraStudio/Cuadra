---
name: CUADRA
description: "Desarrollo web a medida en Montevideo. Dark-first arquitectonico y editorial, paleta black/graphite/sage, Montserrat Light 300 con caps global: 0.38em display y 0.28em cuerpo/interfaz, isotipo geometrico. 3 paginas estaticas. HTML + CSS + JS vanilla. Deploy en Render Static Site."

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
    fontWeight: 300
    lineHeight: 1.0
    letterSpacing: 0.38em
  display-lg:
    fontFamily: Montserrat
    fontSize: 2.75rem
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.38em
  display-md:
    fontFamily: Montserrat
    fontSize: 2rem
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: 0.38em
  heading-xl:
    fontFamily: Montserrat
    fontSize: 1.375rem
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: 0.38em
  heading-lg:
    fontFamily: Montserrat
    fontSize: 1.125rem
    fontWeight: 300
    lineHeight: 1.35
    letterSpacing: 0.38em
  heading-md:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0.38em
  heading-sm:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: 0.38em
  heading-xs:
    fontFamily: Montserrat
    fontSize: 0.8125rem
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0.28em
  title:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: 0.38em
  h4:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0.38em
  body-lg:
    fontFamily: Montserrat
    fontSize: 1.125rem
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: 0.28em
  body:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: 0.28em
  small:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: 0.28em
  caption:
    fontFamily: Montserrat
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.28em
  micro:
    fontFamily: Montserrat
    fontSize: 0.8125rem
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0.38em

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "4px"
    padding: "12px 24px"
    typography:
      fontFamily: Montserrat
      fontSize: 0.8125rem
      fontWeight: 300
      letterSpacing: 0.28em
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "4px"
    padding: "12px 24px"
    typography:
      fontFamily: Montserrat
      fontSize: 0.8125rem
      fontWeight: 300
      letterSpacing: 0.28em
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "8px"
    padding: "24px"
---

# CUADRA — Design System

## Overview

CUADRA es un estudio de desarrollo web a medida en Montevideo, Uruguay. Cada sitio se diseña y construye pieza por pieza, como una cuadra urbana: medido, estructurado y funcional. Dark-first, arquitectónico y editorial.

**Design Read**: Dark-first arquitectónico. Predominio de CUADRA Black (#0F1111) con Graphite (#292E2D) para superficies secundarias y Sage (#AFC8C2) como acento de identidad (nunca como fondo masivo). Tipografía Montserrat Light 300 como fuente única principal con política de MAYÚSCULAS GLOBAL: letter-spacing 0.38em para display (wordmark, títulos, rotador, números, coordenadas) y 0.28em para cuerpo e interfaz (párrafos, nav, botones, labels, formularios, testimonios, footer) — lenguaje editorial/arquitectónico de identidad sin excepciones de peso (todo 300; el énfasis lo da el color). Bordes finos y discretos, radios rectilíneos, sin sombras ni efectos dramáticos. Debe sentirse como estudio de diseño + estudio de arquitectura + ingeniería digital.

## Colors

Paleta neutra y arquitectónica. **CUADRA Black** (#0F1111): fondos principales — header, footer, hero, secciones premium. **Graphite** (#292E2D): superficies secundarias — cards oscuras, navegación, profundidad. **Sage** (#AFC8C2): CTAs, detalles, estados activos — acento, no fondo masivo. **Mist** (#D8E2DF): fondos claros y secciones destacadas. **Warm White** (#F2F1ED): fondo claro principal y tipografía sobre fondos oscuros. **Concrete** (#A7AAAD): texto secundario, bordes, metadatos. Proporción recomendada: 40% black / 20% graphite / 20% sage / 10% mist / 5% white / 5% concrete.

## Typography

**Montserrat Light 300** como fuente única principal (reemplaza Space Grotesk e Inter). Fuente familiar: `--font-primary: 'Montserrat', sans-serif`. **Política de mayúsculas global** (decisión de marca del cliente): todo el texto en caps, sin excepciones de peso — el énfasis de los botones lo da el color de fondo, no el peso.

### Tracking Policy (Identity Language)

**0.38em + MAYÚSCULAS — bucket display**:
- Wordmark "CUADRA"
- Títulos H1-H3 y subtítulos display
- Rotador de propuestas (.hero__rotator)
- Números de estadísticas (.stat-card__number)
- Coordenadas/ubicación
- Números de pasos (.step-card__number)

**0.28em + MAYÚSCULAS — bucket cuerpo e interfaz**:
- Párrafos y descripciones (p)
- Navegación (.nav__link, .footer__link)
- Botones (.btn)
- Labels/eyebrows (.hero__label)
- Formularios (labels, inputs, textarea)
- Testimonios (quote, name, fuente)
- Footer (copy, brand-desc)
- Stat labels (.stat-card__label)
- Pills, badges, FAQ, links de card, skip link

### Decisión de Legibilidad (documentada)

- **0.38em + caps en display y 0.28em + caps en cuerpo** es una **decisión de marca del cliente** (neutralidad/identidad).
- Texto largo en caps + 0.28em reduce velocidad de lectura 10-15% (research-backed) — aceptado y documentado por el cliente.
- Contraste WCAG AA y tamaños mínimos se mantienen (labels ≥13px, captions ≥12px); ningún overflow horizontal a 390/1440px (overflow-wrap activo, wrapping en botones, rotador con floor ajustado).
- **Única excepción de peso**: captions 12px (0.75rem) se mantienen en 400 por legibilidad (12px < 13px).

### Escala Tipográfica

| Token | Peso | Tamaño | Line-height | Tracking | Uso |
|-------|------|--------|-------------|----------|-----|
| --text-display-xl | 300 | clamp(2.5rem, 5vw, 3.75rem) | 1.0 | 0.38em | Wordmark, títulos hero |
| --text-display-lg | 300 | clamp(1.75rem, 4vw, 2.75rem) | 1.05 | 0.38em | H1 principal |
| --text-display-md | 300 | clamp(1.5rem, 3vw, 2rem) | 1.12 | 0.38em | H2, H3 |
| --text-h2 | 300 | 1.375rem | 1.2 | 0.38em | Subtítulos |
| --text-h3 | 300 | 1.125rem | 1.35 | 0.38em | Títulos menores |
| --text-body-lg | 300 | 1.125rem | 1.6 | 0.28em | Párrafos grandes |
| --text-body | 300 | 1rem | 1.6 | 0.28em | Cuerpo principal |
| --text-body-sm | 300 | 0.875rem | 1.5 | 0.28em | Texto secundario |
| --text-label | 300 | 0.8125rem (13px min) | 1.4 | 0.28em | Labels de formulario |
| --text-caption | 400 | 0.75rem (12px min) | 1.5 | 0.28em | Captions (400 <13px, documentado) |
| --text-stat | 300 | clamp(2rem, 4vw, 3rem) | 1.0 | 0.38em | Números destacados |

### Tokens de Letter-Spacing

```css
--letter-spacing-interface: 0.38em;   /* bucket display: wordmark, números, coords */
--letter-spacing-display: 0.38em;     /* unificado con interface: todos los display 0.38em */
--letter-spacing-body: 0.28em;        /* cuerpo e interfaz: caps + tracking amplio */
--letter-spacing-tight: 0em;          /* reservado, no usado con Montserrat Light */
```

### Pesos

- **Todo 300**. No hay excepción 500 en botones (el énfasis lo da el color de fondo).
- **Única excepción**: captions 12px (0.75rem) → 400 por legibilidad (por debajo de 13px). Ningún texto < 12px.

### Wordmark "CUADRA"

Pieza central del hero de construcción. Dimensionado para 390px con 0.38em tracking:

```css
.hero--construction .hero__label {
  font-size: clamp(2.5rem, 10vw, 5.5rem);  /* piso 2.5rem cabe en 390px */
  letter-spacing: var(--letter-spacing-interface); /* 0.38em */
  text-transform: uppercase;
  font-weight: 300;
  line-height: 1.0;
}
```

**Cálculo**: En 390px viewport, "CUADRA" (6 chars) con 0.38em tracking = ~240-254px ancho visual. Margen seguro de ~136px.

### Jerarquía del Hero (index.html — construcción)

1. Logo/isotipo (.hero__logo)
2. **CUADRA** (wordmark, clamp(2.5rem, 10vw, 5.5rem), 0.38em)
3. Rotador de propuestas (clamp(0.875rem, 2.5vw, 1.5rem), 0.38em) — floor ajustado para que la frase más larga (49 chars) quepa en 2 líneas a 390px; ANOTADO como valor final
4. Subtitle histórico (.hero__subtitle, 1rem/1.6, 58ch) — caps + 0.28em vía p global
5. CTAs (buttons, 0.28em, peso 300)

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

Contraste WCAG AA (4.5:1 mínimo para texto normal, 3:1 para texto grande). Contrastes verificados: concrete/black 8.1:1, black/sage 10.7:1, sage/white 1.57:1 (FALLA — nunca sage como texto sobre fondos claros). Estado de focus visible en every interactive element. Skip link funcional. Formulario con labels. La política de caps + 0.28em es decisión de marca documentada (WCAG 1.4.8 escala de texto 200% preservada: sin nowrap en body, overflow-wrap activo); captions <13px en 400 para legibilidad mínima.

## Do's and Don'ts

- Do usar Sage (#AFC8C2) para CTAs y estados activos — nunca como fondo masivo ni como texto sobre fondos claros
- Do usar Graphite (#292E2D) para elevación sobre black (bordes +1px darker, no sombras)
- Do usar Montserrat Light 300 como fuente única principal, todo en mayúsculas
- Do usar 0.38em + mayúsculas para display: wordmark, títulos H1-H3, rotador, números de stats, coords
- Do usar 0.28em + mayúsculas para cuerpo e interfaz: párrafos, nav, botones, labels, formularios, testimonios, footer, stat labels, skip link
- Do usar peso 300 en todo; sin excepción 500 en botones (énfasis por color, no por peso)
- Do mantener captions en 400 cuando quedan <13px (12px mínimo absoluto, documentado)
- Do mantener 13px mínimo para labels, 12px para captions (Montserrat Light requiere tamaño mínimo)
- Do evitar overflow horizontal a 390/1440px: wrapping en botones, flex-wrap en footer links, rotador con floor ajustado (0.875rem) para la frase más larga
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