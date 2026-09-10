# CUADRA — Typography Specification: Montserrat Light 300

## Overview

Montserrat Light 300 replaces Space Grotesk and Inter as the single primary typeface. The 0.38em letter-spacing + all-caps treatment defines CUADRA's architectural identity for interface elements. Body text uses Montserrat 300 at normal tracking for legibility.

---

## Google Fonts Link

Replace the existing Google Fonts link in all 4 HTML files:

```html
<!-- OLD -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<!-- NEW -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## CSS Token Changes (tokens.css)

### Font Family Tokens

```css
/* OLD */
--font-display: 'Space Grotesk', sans-serif;
--font-body: 'Inter', sans-serif;

/* NEW */
--font-primary: 'Montserrat', sans-serif;
--font-display: 'Montserrat', sans-serif;
--font-body: 'Montserrat', sans-serif;
```

### Letter-Spacing Tokens

```css
/* OLD */
--letter-spacing-tight: -0.04em;
--letter-spacing-snug: -0.03em;
--letter-spacing-normal: -0.01em;
--letter-spacing-wide: 0.08em;

/* NEW */
--letter-spacing-interface: 0.38em;    /* caps + wide tracking for short interface text */
--letter-spacing-display: 0.18em;      /* reduced tracking for longer display phrases */
--letter-spacing-body: 0.02em;         /* normal reading tracking for paragraphs */
--letter-spacing-tight: 0em;           /* reserved, not used with Montserrat Light */
```

### Typography Scale (Updated)

```css
--text-display-xl: 300 clamp(2.5rem, 5vw, 3.75rem)/1.0 var(--font-display);
--text-display-lg: 300 clamp(1.75rem, 4vw, 2.75rem)/1.05 var(--font-display);
--text-display-md: 300 clamp(1.5rem, 3vw, 2rem)/1.12 var(--font-display);
--text-h2: 300 1.375rem/1.2 var(--font-display);
--text-h3: 300 1.125rem/1.35 var(--font-display);
--text-body-lg: 300 1.125rem/1.6 var(--font-body);
--text-body: 300 1rem/1.6 var(--font-body);
--text-body-sm: 300 0.875rem/1.5 var(--font-body);
--text-label: 400 0.8125rem/1.4 var(--font-body);   /* 13px minimum for Light weight legibility */
--text-caption: 400 0.75rem/1.5 var(--font-body);     /* 12px minimum */
--text-stat: 300 clamp(2rem, 4vw, 3rem)/1.0 var(--font-display);
```

---

## Role → Caps/Tracking Table

| Role | Tracking | Caps | Weight | Justification |
|------|----------|------|--------|---------------|
| **Wordmark "CUADRA"** | 0.38em | YES | 300 | Brand identity, short word (6 chars), dominant visual |
| **Nav items** | 0.38em | YES | 300 | Interface navigation, short labels |
| **Buttons (.btn)** | 0.38em | YES | 500 | CTA affordance, short labels, weight exception for interactivity |
| **Eyebrows (.hero__label)** | 0.38em | YES | 400 | Small uppercase labels above headlines |
| **Footer links** | 0.38em | YES | 300 | Short navigation phrases |
| **Coordinates/Location** | 0.38em | YES | 300 | Short data strings (e.g., "34°53'S 56°10'W") |
| **Hero rotator phrases** | 0.18em | YES | 300 | Reduced tracking for readability in longer phrases |
| **Display headings (H1-H3)** | 0.18em | YES | 300 | Reduced tracking for headlines >12 chars |
| **Stat numbers** | 0.38em | YES | 300 | Short numeric display |
| **Body paragraphs** | 0.02em | NO | 300 | Normal reading, NO caps for legibility |
| **Project descriptions** | 0.02em | NO | 300 | Long-form reading text |
| **Form labels** | 0.02em | NO | 400 | Readable labels, weight 400 for minimum legibility |
| **Form inputs** | 0.02em | NO | 300 | User input text |
| **Testimonials** | 0.02em | NO | 300 | Quoted text, readable |
| **Captions** | 0.02em | NO | 400 | Small text, weight 400 for legibility |
| **Skip link** | 0.02em | NO | 500 | Accessibility, must be readable |

---

## Element-Specific CSS (components.css)

### Navigation

```css
.nav__link {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: 0.875rem;           /* 14px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}
```

### Buttons

```css
.btn {
  font-family: var(--font-primary);
  font-weight: 500;              /* EXCEPTION: weight 500 for affordance */
  font-size: 0.8125rem;          /* 13px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}

.btn--primary {
  background-color: var(--color-primary);
  color: var(--color-black);
  /* ... existing styles ... */
}
```

### Hero Section

```css
.hero__label {
  font-family: var(--font-primary);
  font-weight: 400;
  font-size: 0.8125rem;          /* 13px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}

.hero__wordmark {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: clamp(2.5rem, 10vw, 5.5rem);  /* Redimensioned for 390px + 0.38em tracking */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
  line-height: 1.0;
}

.hero__rotator {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-display);  /* 0.18em - reduced for longer phrases */
}

.hero__heading {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-display);  /* 0.18em */
}
```

### Footer

```css
.footer__link {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: 0.875rem;           /* 14px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}

.footer__copy {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: 0.75rem;            /* 12px */
  letter-spacing: var(--letter-spacing-body);  /* 0.02em - normal for readability */
  text-transform: none;           /* NO caps for copyright text */
}
```

### Body Text

```css
p, .body-text {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 1rem;               /* 16px */
  line-height: 1.6;
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
  text-transform: none;           /* NO caps for body text */
}

.body-text-lg {
  font-weight: 300;
  font-size: 1.125rem;           /* 18px */
  line-height: 1.6;
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
}
```

### Labels & Captions

```css
.label {
  font-family: var(--font-primary);
  font-weight: 400;              /* Weight 400 for minimum legibility at small sizes */
  font-size: 0.8125rem;          /* 13px - minimum for Montserrat Light */
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
}

.caption {
  font-family: var(--font-primary);
  font-weight: 400;              /* Weight 400 for minimum legibility */
  font-size: 0.75rem;            /* 12px - minimum */
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
}
```

### Stats

```css
.stat__number {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: clamp(2rem, 4vw, 3rem);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}

.stat__label {
  font-family: var(--font-primary);
  font-weight: 400;
  font-size: 0.8125rem;          /* 13px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}
```

### Testimonials

```css
.testimonial__quote {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 1.125rem;           /* 18px */
  line-height: 1.6;
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
  text-transform: none;           /* NO caps for quoted text */
}

.testimonial__author {
  font-family: var(--font-primary);
  font-weight: 400;
  font-size: 0.875rem;           /* 14px */
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
  text-transform: none;
}
```

### Form Elements

```css
.form-label {
  font-family: var(--font-primary);
  font-weight: 400;              /* Weight 400 for legibility */
  font-size: 0.875rem;           /* 14px */
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
  text-transform: none;
}

.form-input {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 1rem;               /* 16px */
  letter-spacing: var(--letter-spacing-body);  /* 0.02em */
  text-transform: none;
}
```

---

## Wordmark Dimensioning (390px viewport)

The wordmark "CUADRA" (6 characters) with 0.38em tracking requires reduced font size to prevent overflow on mobile:

```css
.hero__wordmark {
  /* Mobile: 2.5rem fits within 390px with 0.38em tracking */
  /* Desktop: scales to 5.5rem for dominant presence */
  font-size: clamp(2.5rem, 10vw, 5.5rem);
  letter-spacing: 0.38em;
  text-transform: uppercase;
}
```

**Calculation**:
- At 390px viewport, 10vw = 39px (2.4375rem)
- With 0.38em tracking on 6 characters: extra width = 5 × 0.38em × 2.4375rem ≈ 4.63rem
- Total visual width ≈ 6 × 2.4375rem + 4.63rem ≈ 19.25rem (308px)
- Fits within 390px with 82px margin (safe)

---

## Legibility Justification

### Why 0.38em + Caps Works for Interface
- Short text (≤12 characters) is scanned, not read
- Wide tracking enhances architectural/editorial identity
- All-caps creates consistent baseline and height
- Examples: "PROYECTOS", "CONTACTO", "CUADRA", "34°53'S"

### Why 0.38em + Caps Fails for Body Text
- Paragraphs require continuous reading, not scanning
- Wide tracking breaks word recognition patterns
- All-caps reduces reading speed by 10-15% (research-backed)
- WCAG 1.4.8 requires text scalable to 200% without loss of functionality

### The Compromise
- Interface elements (≤12 chars): 0.38em + caps = identity
- Display headings (>12 chars): 0.18em + caps = balance
- Body text: 0.02em + normal case = legibility

---

## Size Minimums for Montserrat Light 300

| Element | Minimum Size | Weight | Justification |
|---------|--------------|--------|---------------|
| Labels | 13px (0.8125rem) | 400 | Light weight at 300 is too thin below 13px |
| Captions | 12px (0.75rem) | 400 | Absolute minimum, weight 400 for legibility |
| Body | 16px (1rem) | 300 | Standard reading size |
| Buttons | 13px (0.8125rem) | 500 | Weight exception for affordance |
| Nav | 14px (0.875rem) | 300 | Readable with tracking |
| Skip link | 14px (0.875rem) | 500 | Accessibility requirement |

---

## Files to Update

1. **css/tokens.css** - Font family, letter-spacing tokens, typography scale
2. **css/base.css** - Body font-family (var(--font-primary))
3. **css/components.css** - All component typography (nav, btn, hero, footer, etc.)
4. **index.html** - Google Fonts link
5. **index-web.html** - Google Fonts link
6. **proyectos.html** - Google Fonts link
7. **contacto.html** - Google Fonts link

---

## Designer Sign-Off

This specification respects the client's vision (Montserrat Light 300 + 0.38em + caps) while maintaining WCAG AA legibility standards. The tracking policy is documented and justified: wide tracking for identity, normal tracking for readability.

**UI Designer**: Design System Agent
**Date**: September 2026
**Status**: Ready for frontend implementation
