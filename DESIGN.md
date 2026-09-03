---
name: CUADRA
description: Desarrollo web profesional en Montevideo. Light mode, minimalista, azul como accent. Marca proactiva: identifico, diseño, vendo. 3 paginas estaticas. HTML + CSS + JS vanilla. Deploy en Render Static Site.

colors:
  bg: "#ffffff"
  bg-raised: "#f8fafc"
  bg-card: "#ffffff"
  bg-card-hover: "#f1f5f9"
  text: "#0f172a"
  text-secondary: "#64748b"
  text-muted: "#94a3b8"
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  border: "#e2e8f0"
  border-strong: "#cbd5e1"
  success: "#16a34a"
  error: "#dc2626"
  focus: "#2563eb"

gradients:
  hero: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)"
  accent: "linear-gradient(135deg, #2563eb, #3b82f6)"

shadows:
  sm: "0 1px 3px rgba(0, 0, 0, 0.06)"
  md: "0 4px 12px rgba(0, 0, 0, 0.08)"
  lg: "0 8px 24px rgba(0, 0, 0, 0.10)"

glassmorphism:
  bg: "rgba(255, 255, 255, 0.70)"
  border: "rgba(0, 0, 0, 0.06)"
  blur: "12px"

typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: clamp(2.75rem, 6vw, 4.5rem)
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Space Grotesk
    fontSize: clamp(2rem, 4.5vw, 3.5rem)
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.03em
  display-md:
    fontFamily: Space Grotesk
    fontSize: clamp(1.75rem, 3vw, 2.25rem)
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.02em

components:
  button-primary:
    background: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 13px 28px
  card:
    background: "{colors.bg-card}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: 24px
---

# CUADRA — Design System

## Overview

CUADRA es una marca de desarrollo web profesional en Montevideo, Uruguay. Enfoque proactivo: identifico negocios que necesitan presencia online, diseño la solucion y la presento lista para usar. Especializado en barberias y negocios locales.

**Design Read**: Light mode limpio y profesional. Fondo blanco, azul (#2563eb) como unico accent. Sin sombras excesivas, sin glassmorphism. Tipografia limpia con Space Grotesk.

## Colors

Paleta limitada y profesional. Background blanco (#ffffff) con elevacion via grises claros (#f8fafc, #f1f5f9). Un solo accent: azul electrico (#2563eb) para links, botones, focus rings. Texto principal en slate oscuro (#0f172a), secundario en slate medio (#64748b).

## Typography

Space Grotesk como unica fuente. Display headings con weight 700 y letter-spacing tight. Body text con weight 400 y line-height generoso (1.7). Labels con weight 500 y letter-spacing wide.

## Layout

3 paginas: Home (one-page con todas las secciones), Proyectos, Contacto. Home: Hero -> Stats -> Antes/Despues -> Proyectos -> Proceso -> Testimonios -> Pricing -> FAQ -> CTA. Baja densidad visual, spacing generoso.

## Brand Identity

- **Nombre**: CUADRA (referencia a la unidad de medida — cada sitio se disena a medida)
- **Enfoque**: Proactivo — identifico, diseño, vendo
- **Tono**: Moderno, directo, tecnico. El trabajo habla.
- **Accent**: Azul (#2563eb) para acciones primarias
- **Deploy**: Render Static Site (cuadra-m5ew.onrender.com)

## Do's and Don'ts

- Do usar azul (#2563eb) solo para elementos interactivos: links, botones, focus rings
- Do mantener contraste WCAG AA (4.5:1 minimo para texto)
- Do usar Space Grotesk exclusivamente
- Do usar background lightness para elevacion
- Do mantener el hero alineado a la izquierda en desktop
- Don't agregar mas de un accent color por componente
- Don't usar puro negro (#000000) o puro blanco (#ffffff) para texto sobre fondos de acento
- Don't agregar box-shadows decorativos (solo sombras funcionales en cards)
- Don't usar serif fonts
- Don't agregar emojis en el codigo
