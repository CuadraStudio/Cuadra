---
name: CUADRA
description: "Desarrollo web a medida en Montevideo. Dark-first arquitectonico y editorial, paleta black/graphite/sage, Montserrat Light 300 con 0.38em tracking para interfaz, isotipo geometrico. 3 paginas estaticas. HTML + CSS + JS vanilla. Deploy en Render Static Site."

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
    letterSpacing: 0.18em
  display-lg:
    fontFamily: Montserrat
    fontSize: 2.75rem
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: 0.18em
  display-md:
    fontFamily: Montserrat
    fontSize: 2rem
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: 0.18em
  heading-xl:
    fontFamily: Montserrat
    fontSize: 1.375rem
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: 0.18em
  heading-lg:
    fontFamily: Montserrat
    fontSize: 1.125rem
    fontWeight: 300
    lineHeight: 1.35
    letterSpacing: 0.18em
  heading-md:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1.4
    letterSpacing: 0.18em
  heading-sm:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: 0.18em
  heading-xs:
    fontFamily: Montserrat
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.02em
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
    letterSpacing: 0.18em
  body-lg:
    fontFamily: Montserrat
    fontSize: 1.125rem
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: 0.02em
  body:
    fontFamily: Montserrat
    fontSize: 1rem
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: 0.02em
  small:
    fontFamily: Montserrat
    fontSize: 0.875rem
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: 0.02em
  caption:
    fontFamily: Montserrat
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.02em
  micro:
    fontFamily: Montserrat
    fontSize: 0.8125rem
    fontWeight: 400
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
      fontWeight: 500
      letterSpacing: 0.38em
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "4px"
    padding: "12px 24px"
    typography:
      fontFamily: Montserrat
      fontSize: 0.8125rem
      fontWeight: 500
      letterSpacing: 0.38em
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "8px"
    padding: "24px"
---

# CUADRA — Design System

## Overview

CUADRA es un estudio de desarrollo web a medida en Montevideo, Uruguay. Cada sitio se diseña y construye pieza por pieza, como una cuadra urbana: medido, estructurado y funcional. Dark-first, arquitectónico y editorial.

**Design Read**: Dark-first arquitectónico. Predominio de CUADRA Black (#0F1111) con Graphite (#292E2D) para superficies secundarias y Sage (#AFC8C2) como acento de identidad (nunca como fondo masivo). Tipografía Montserrat Light 300 como fuente única principal, con letter-spacing 0.38em + mayúsculas para elementos de interfaz cortos (≤12 caracteres) como lenguaje editorial/arquitectónico de identidad. Bordes finos y discretos, radios rectilíneos, sin sombras ni efectos dramáticos. Debe sentirse como estudio de diseño + estudio de arquitectura + ingeniería digital.

## Colors

Paleta neutra y arquitectónica. **CUADRA Black** (#0F1111): fondos principales — header, footer, hero, secciones premium. **Graphite** (#292E2D): superficies secundarias — cards oscuras, navegación, profundidad. **Sage** (#AFC8C2): CTAs, detalles, estados activos — acento, no fondo masivo. **Mist** (#D8E2DF): fondos claros y secciones destacadas. **Warm White** (#F2F1ED): fondo claro principal y tipografía sobre fondos oscuros. **Concrete** (#A7AAAD): texto secundario, bordes, metadatos. Proporción recomendada: 40% black / 20% graphite / 20% sage / 10% mist / 5% white / 5% concrete.

## Typography

**Montserrat Light 300** como fuente única principal (reemplaza Space Grotesk e Inter). Fuente familiar: `--font-primary: 'Montserrat', sans-serif`.

### Tracking Policy (Identity Language)

**0.38em + MAYÚSCULAS** para elementos de interfaz cortos (≤12 caracteres):
- Navegación (.nav__link)
- Botones (.btn) — excepción: peso 500 para affordance
- Labels/eyebrows (.hero__label)
- Coordenadas/ubicación
- Wordmark "CUADRA"
- Links de footer
- Números de estadísticas

**0.18em + MAYÚSCULAS** para frases display más largas (>12 caracteres):
- Rotador de propuestas (.hero__rotator)
- Títulos de sección (H1-H3)
- Subtítulos display

**0.02em + caso normal** para texto corrido de lectura:
- Párrafos y descripciones
- Testimonios
- Formularios (labels, inputs)
- Captions
- Texto de copyright

### Justificación de Legibilidad (WCAG)

- **0.38em + caps funciona para interfaz**: Texto corto se escanea, no se lee. Tracking amplio refuerza identidad arquitectónica/editorial.
- **0.38em + caps falla en cuerpo**: Párrafos requieren lectura continua. Tracking amplio rompe patrones de reconocimiento de palabras. Mayúsculas reducen velocidad de lectura 10-15%.
- **Compromiso documentado**: Interfaz corta = identidad (0.38em). Display medio = balance (0.18em). Cuerpo = legibilidad (0.02em).

### Escala Tipográfica

| Token | Peso | Tamaño | Line-height | Tracking | Uso |
|-------|------|--------|-------------|----------|-----|
| --text-display-xl | 300 | clamp(2.5rem, 5vw, 3.75rem) | 1.0 | 0.18em | Wordmark, títulos hero |
| --text-display-lg | 300 | clamp(1.75rem, 4vw, 2.75rem) | 1.05 | 0.18em | H1 principal |
| --text-display-md | 300 | clamp(1.5rem, 3vw, 2rem) | 1.12 | 0.18em | H2, H3 |
| --text-h2 | 300 | 1.375rem | 1.2 | 0.18em | Subtítulos |
| --text-h3 | 300 | 1.125rem | 1.35 | 0.18em | Títulos menores |
| --text-body-lg | 300 | 1.125rem | 1.6 | 0.02em | Párrafos grandes |
| --text-body | 300 | 1rem | 1.6 | 0.02em | Cuerpo principal |
| --text-body-sm | 300 | 0.875rem | 1.5 | 0.02em | Texto secundario |
| --text-label | 400 | 0.8125rem (13px min) | 1.4 | 0.02em | Labels de formulario |
| --text-caption | 400 | 0.75rem (12px min) | 1.5 | 0.02em | Captions |
| --text-stat | 300 | clamp(2rem, 4vw, 3rem) | 1.0 | 0.38em | Números destacados |

### Tokens de Letter-Spacing

```css
--letter-spacing-interface: 0.38em;   /* interfaz corta ≤12 chars */
--letter-spacing-display: 0.18em;     /* frases display >12 chars */
--letter-spacing-body: 0.02em;        /* texto corrido */
--letter-spacing-tight: 0em;          /* reservado, no usado con Montserrat Light */
```

### Excepciones de Peso

- **Base**: 300 en todo el sistema
- **Excepción justificada**: Botones e interacciones usan peso **500** para affordance visual ( Feedback de clic, contraste con texto circundante)
- **Mínimos de tamaño**: Labels 13px mín, captions 12px mín — peso 400 para legibilidad en tamaños pequeños

### Wordmark "CUADRA"

Pieza central del hero de construcción. Dimensionado para 390px con 0.38em tracking:

```css
.hero__wordmark {
  font-size: clamp(2.5rem, 10vw, 5.5rem);  /* Redimensionado */
  letter-spacing: 0.38em;
  text-transform: uppercase;
  font-weight: 300;
}
```

**Cálculo**: En 390px viewport, "CUADRA" (6 chars) con 0.38em tracking = ~308px ancho visual. Margen seguro de 82px.

### Jerarquía del Hero

1. Logo/isotipo (SVG)
2. **CUADRA** (wordmark, clamp(2.5rem, 10vw, 5.5rem), 0.38em)
3. Rotador de propuestas (clamp(1.25rem, 3vw, 1.75rem), 0.18em)
4. CTAs (buttons, 0.38em, peso 500)

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

Contraste WCAG AA (4.5:1 mínimo para texto normal, 3:1 para texto grande). Contrastes verificados: concrete/black 8.1:1, black/sage 10.7:1, sage/white 1.57:1 (FALLA — nunca sage como texto sobre fondos claros). Estado de focus visible en every interactive element. Skip link funcional. Formulario con labels.

## Do's and Don'ts

- Do usar Sage (#AFC8C2) para CTAs y estados activos — nunca como fondo masivo ni como texto sobre fondos claros
- Do usar Graphite (#292E2D) para elevación sobre black (bordes +1px darker, no sombras)
- Do usar Montserrat Light 300 como fuente única principal
- Do usar 0.38em + mayúsculas para interfaz corta (≤12 chars): nav, botones, labels, wordmark
- Do usar 0.18em + mayúsculas para display largo (>12 chars): títulos, rotador
- Do usar 0.02em + caso normal para cuerpo: párrafos, testimonios, formularios
- Do usar peso 500 para botones (excepción justificada para affordance)
- Do mantener 13px mínimo para labels, 12px para captions (Montserrat Light requiere tamaño mínimo)
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
