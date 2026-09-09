---
name: CUADRA
description: "Desarrollo web a medida en Montevideo. Dark-first arquitectonico y editorial, paleta black/graphite/sage, Space Grotesk + Inter, isotipo geometrico. 3 paginas estaticas. HTML + CSS + JS vanilla. Deploy en Render Static Site."

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
    fontFamily: Space Grotesk
    fontSize: 4.5rem
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.03em
  display-md:
    fontFamily: Space Grotesk
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.02em
  heading-xl:
    fontFamily: Space Grotesk
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  heading-lg:
    fontFamily: Space Grotesk
    fontSize: 2.75rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  heading-md:
    fontFamily: Space Grotesk
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 1.1
  heading-sm:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
  heading-xs:
    fontFamily: Space Grotesk
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
  micro:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.08em

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "4px"
    padding: "12px 24px"
    textTransform: "uppercase"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "4px"
    padding: "12px 24px"
    textTransform: "uppercase"
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "8px"
    padding: "24px"
---

# CUADRA — Design System

## Overview

CUADRA es un estudio de desarrollo web a medida en Montevideo, Uruguay. Cada sitio se diseña y construye pieza por pieza, como una cuadra urbana: medido, estructurado y funcional. Dark-first, arquitectónico y editorial.

**Design Read**: Dark-first arquitectónico. Predominio de CUADRA Black (#0F1111) con Graphite (#292E2D) para superficies secundarias y Sage (#AFC8C2) como acento de identidad (nunca como fondo masivo). Tipografía Space Grotesk (display) + Inter (body). Bordes finos y discretos, radios rectilíneos, sin sombras ni efectos dramáticos. Debe sentirse como estudio de diseño + estudio de arquitectura + ingeniería digital.

## Colors

Paleta neutra y arquitectónica. **CUADRA Black** (#0F1111): fondos principales — header, footer, hero, secciones premium. **Graphite** (#292E2D): superficies secundarias — cards oscuras, navegación, profundidad. **Sage** (#AFC8C2): CTAs, detalles, estados activos — acento, no fondo masivo. **Mist** (#D8E2DF): fondos claros y secciones destacadas. **Warm White** (#F2F1ED): fondo claro principal y tipografía sobre fondos oscuros. **Concrete** (#A7AAAD): texto secundario, bordes, metadatos. Proporción recomendada: 40% black / 20% graphite / 20% sage / 10% mist / 5% white / 5% concrete.

## Typography

**Space Grotesk** (--font-display) para H1-H4, nombres de proyectos, frases de impacto, números destacados y navegación destacada. **Inter** (--font-body) para párrafos, botones, formularios, descripciones, metadata. Escala desktop: H1 72px/1.0, H2 48px/1.05, H3 32px/1.1, H4 24px/1.2, Body Large 20px/1.5, Body 16px/1.6, Small 14px/1.5, Caption 12px/1.4. Tracking: títulos grandes -0.03em a -0.05em, labels/uppercase 0.08em a 0.16em. Uso responsivo con clamp en CSS (el frontmatter declara valores base).

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
- Do usar Space Grotesk para display/números y Inter para body/UI
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
