---
name: CUADRA
description: Modern tech web development portfolio. Dark mode with cyan + purple neon accents, glassmorphism, gradient highlights. Solo developer — proactive approach: identify, design, sell. 3-page static site. HTML + CSS + JS vanilla. Deploy en Render Static Site.

colors:
  bg: "#050510"
  bg-raised: "#0a0a1a"
  bg-card: "rgba(255,255,255,0.03)"
  bg-card-hover: "rgba(255,255,255,0.06)"
  text: "#f0f0f5"
  text-secondary: "#8888a0"
  text-muted: "#55556a"
  primary: "#00d4ff"
  primary-hover: "#33dfff"
  accent: "#a855f7"
  accent-hover: "#c084fc"
  cyan: "#00d4ff"
  purple: "#a855f7"
  border: "rgba(255,255,255,0.06)"
  border-strong: "rgba(255,255,255,0.12)"
  success: "#22c55e"
  error: "#ef4444"
  focus: "#00d4ff"
  overlay: "rgba(5,5,16,0.92)"

gradients:
  hero: "linear-gradient(160deg, #050510 0%, #0a0a2e 50%, #0f0520 100%)"
  accent: "linear-gradient(135deg, #00d4ff, #a855f7)"

glassmorphism:
  bg: "rgba(255,255,255,0.03)"
  border: "rgba(255,255,255,0.08)"
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
    background: "{gradients.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 13px 28px
    shadow: "0 2px 16px rgba(0,212,255,0.25)"
  card:
    background: "{glassmorphism.bg}"
    backdropFilter: "{glassmorphism.blur}"
    border: "1px solid {glassmorphism.border}"
    rounded: "{rounded.xl}"
    padding: 24px
---

# CUADRA — Modern Tech Portfolio

## Overview

Solo web developer portfolio led by Luciano Martín, based in Montevideo, Uruguay. CUADRA takes a proactive approach: identify businesses that need an online presence, design the solution directly, and approach the business owner with a ready-to-use product. Specializes in barbershops and local businesses with integrated booking systems.

**Design Read**: Deep dark background with cyan (#00d4ff) and purple (#a855f7) neon accents. Glassmorphism cards, gradient text highlights, subtle glow effects. Modern tech startup vibe.

## Colors

Electric cyan (#00D4FF) as the primary accent for CTAs, links, numbers, and interactive elements. Vibrant purple (#A855F7) as secondary accent for gradients, testimonial highlights, and decorative elements. The gradient accent combines both: `linear-gradient(135deg, #00d4ff, #a855f7)`.

Backgrounds use a deep dark with purple undertone: bg (#050510) darkest, bg-raised (#0a0a1a) for nav/footer, glass-bg (rgba 255,255,255,0.03) for cards with backdrop-filter blur.

## Glassmorphism

Cards use glassmorphism: semi-transparent background with backdrop blur (12px). Subtle borders at 8% white opacity. On hover, borders shift to cyan with glow shadow. This creates depth without relying on solid backgrounds.

## Typography

Space Grotesk remains the sole typeface. Display headings use gradient text (cyan → purple) via `background-clip: text`. Body text at weight 400 with generous line-height (1.7). Labels use weight 500 with widened letter-spacing.

## Layout

3 pages: Home (one-page with all sections), Proyectos, Contacto. Sections: Hero → Stats → Before/After → Projects → Process → Testimonials → CTA. Low visual density, generous spacing.

## Brand Identity

- **Name**: CUADRA (all-caps, authoritative)
- **Approach**: Proactive — identify, design, sell
- **Tone**: Modern, direct, tech-forward. The work speaks.
- **Accent colors**: Cyan for primary actions, purple for decorative
