---
name: CUADRA
description: Web development agency specializing in booking systems for barbershops and local businesses. Dark mode, premium, minimalista, multi-page static site. HTML + CSS + JS vanilla. Deploy en Render Static Site.

colors:
  bg: "#08090d"
  bg-raised: "#0e1017"
  bg-card: "#13151e"
  bg-card-hover: "#191c28"
  text: "#eef0f6"
  text-secondary: "#8d90a5"
  text-muted: "#525570"
  primary: "#2563eb"
  primary-hover: "#3b82f6"
  accent: "#60a5fa"
  accent-hover: "#93c5fd"
  accent-subtle: "rgba(96,165,250,0.10)"
  border: "rgba(255,255,255,0.06)"
  border-strong: "rgba(255,255,255,0.12)"
  success: "#22c55e"
  error: "#ef4444"
  focus: "#60a5fa"
  overlay: "rgba(8,9,13,0.90)"

gradients:
  hero: "linear-gradient(160deg, #08090d 0%, #0c0e18 40%, #0f1225 100%)"
  accent: "linear-gradient(135deg, #2563eb, #60a5fa)"

typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: clamp(2.75rem, 5.5vw, 4.25rem)
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: -0.035em
  display-lg:
    fontFamily: Space Grotesk
    fontSize: clamp(2rem, 4vw, 3.25rem)
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -0.025em
  display-md:
    fontFamily: Space Grotesk
    fontSize: clamp(1.75rem, 3vw, 2.25rem)
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
  h3:
    fontFamily: Space Grotesk
    fontSize: 1.125rem
    fontWeight: 500
    lineHeight: 1.35
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: Space Grotesk
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Space Grotesk
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.06em
  caption:
    fontFamily: Space Grotesk
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5

spacing:
  0: 0
  1: 0.25rem
  2: 0.5rem
  3: 0.75rem
  4: 1rem
  5: 1.25rem
  6: 1.5rem
  8: 2rem
  10: 2.5rem
  12: 3rem
  16: 4rem
  20: 5rem
  24: 6rem
  32: 8rem
  section: 5rem
  section-lg: 7rem
  gutter: clamp(1.25rem, 4vw, 3rem)
  page: clamp(1.25rem, 5vw, 3.5rem)

rounded:
  none: 0
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  full: 9999px

shadows:
  sm: "0 1px 2px rgba(0,0,0,0.3)"
  md: "0 4px 16px rgba(0,0,0,0.3)"
  lg: "0 8px 32px rgba(0,0,0,0.4)"
  glow: "0 0 40px rgba(37,99,235,0.15)"

components:
  button-primary:
    background: "{gradients.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 13px 28px
    typography: "{typography.body}"
  button-primary-hover:
    background: "linear-gradient(135deg, {colors.primary-hover}, {colors.accent})"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 13px 28px
    typography: "{typography.body}"
  card:
    backgroundColor: "{colors.bg-card}"
    rounded: "{rounded.xl}"
    padding: 24px
  input:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 14px 18px
    typography: "{typography.body}"
---

# CUADRA — Web Agency

## Overview

Web development agency led by Luciano Martín, based in Montevideo, Uruguay. CUADRA takes a proactive approach: instead of waiting for clients, they identify businesses that need an online presence, design the solution directly, and approach the business owner with a ready-to-use product. Specializes in barbershops and local businesses with integrated booking systems.

**Design Read**: Premium dark theme, electric blue accent — modern, tech-forward, trustworthy. Minimalist dark layout with blue as the sole accent color for interactive elements. Glassmorphism nav, gradient buttons, subtle glow effects.

## Colors

Electric blue (#2563EB) as the sole accent. Very dark blue-tinted backgrounds (#08090d) create depth with a subtle blue undertone. The primary blue (#2563EB) is used for CTAs and buttons. The lighter accent blue (#60a5fa) is used for links, focus rings, and interactive highlights.

Surfaces use a three-tier elevation: bg (#08090d) darkest, bg-raised (#0e1017) for nav/inputs, bg-card (#13151e) for project cards. Subtle shadows now complement the background-lightness hierarchy for cards and hover states.

## Typography

Space Grotesk remains the sole typeface — geometric sans-serif with weight range 300-700. Display headings use weight 700 with tight letter-spacing (-0.035em). Body text uses weight 400 at 16px with generous line-height (1.7). Labels use weight 500 with widened letter-spacing (0.06em).

## Layout

Low visual density. Sections breathe at 5rem vertical padding on desktop, collapsing to 4rem on mobile. Mobile-first with breakpoints at 640px, 768px, 1024px, 1280px. Hero left-aligned on desktop with gradient background. Cards use responsive grid with 16px border-radius.

## Brand Identity

- **Name**: CUADRA (all-caps, authoritative)
- **Tagline**: "Tu negocio merece presencia online."
- **Niche**: Proactively designed websites with booking systems for barbershops and local businesses
- **Tone**: Professional, direct, proactive. Design-first, sell-after. The work speaks.

## Do's and Don'ts

- Do use electric blue (#2563EB, #60a5fa) only for interactive elements
- Do maintain WCAG AA contrast ratios (4.5:1 minimum)
- Do use Space Grotesk exclusively
- Do use background lightness and subtle shadows for elevation hierarchy
- Do use gradient buttons for primary CTAs
- Do use glassmorphism (backdrop-filter) for navigation
- Don't add more than one accent color to any component
- Don't use pure black (#000000) or pure white (#ffffff) in body text
- Don't use serif fonts
- Don't overcrowd sections — breathing room is key
