# CUADRA — Typography Specification: Montserrat Light 300 (Role-Based)

## Overview

Montserrat Light 300 replaces Space Grotesk and Inter as the single primary typeface. The **role-based policy** (D-033) is active:

- **Interface (short, ≤12 chars)**: 0.38em + caps (nav, buttons, eyebrows, coords, footer links, wordmark)
- **Display (longer phrases, >12 chars)**: 0.18em + caps (headings H1-H3, rotator, section titles)
- **Body / reading**: 0.02em + normal case (paragraphs, testimonials, forms, captions, stat labels)

**Exception (weight)**: buttons keep weight 500 for affordance. Captions/labels keep 400 for legibility at small sizes.

**Brand rule (fixed, independent of policy)**: every visible occurrence of the word "CUADRA" uses `Montserrat 300 + uppercase + 0.38em` via `.brand-wordmark` (or the construction wordmark `.hero--construction .hero__label`). See "Brand wordmark rule" below.

---

## Google Fonts Link

All 4 HTML files:

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

## CSS Token Changes (tokens.css)

### Font Family Tokens

```css
--font-primary: 'Montserrat', sans-serif;
--font-display: 'Montserrat', sans-serif;
--font-body: 'Montserrat', sans-serif;
```

### Letter-Spacing Tokens (role-based)

```css
--letter-spacing-interface: 0.38em;    /* caps + wide tracking for short interface text (<=12 chars) */
--letter-spacing-display: 0.18em;      /* reduced tracking for longer display phrases (>12 chars) */
--letter-spacing-body: 0.02em;         /* normal reading tracking for paragraphs */
--letter-spacing-tight: 0em;           /* reserved, not used with Montserrat Light */
```

### Typography Scale

```css
--text-display-xl: 300 clamp(2.5rem, 5vw, 3.75rem)/1.0 var(--font-display);   /* 0.18em */
--text-display-lg: 300 clamp(1.75rem, 4vw, 2.75rem)/1.05 var(--font-display); /* 0.18em */
--text-display-md: 300 clamp(1.5rem, 3vw, 2rem)/1.12 var(--font-display);     /* 0.18em */
--text-h2: 300 1.375rem/1.2 var(--font-display);                              /* 0.18em */
--text-h3: 300 1.125rem/1.35 var(--font-display);                             /* 0.18em */
--text-body-lg: 300 1.125rem/1.6 var(--font-body);                            /* 0.02em */
--text-body: 300 1rem/1.6 var(--font-body);                                   /* 0.02em */
--text-body-sm: 300 0.875rem/1.5 var(--font-body);                            /* 0.02em */
--text-label: 400 0.8125rem/1.4 var(--font-body);   /* 13px minimum for Light weight legibility */
--text-caption: 400 0.75rem/1.5 var(--font-body);     /* 12px minimum */
--text-stat: 300 clamp(2rem, 4vw, 3rem)/1.0 var(--font-display);              /* 0.38em */
```

---

## Role → Caps/Tracking Table (D-033)

| Role | Tracking | Caps | Weight | Justification |
|------|----------|------|--------|---------------|
| **Wordmark "CUADRA" (.brand-wordmark)** | 0.38em | YES | 300 | Brand identity — ALWAYS this format |
| **Nav items** | 0.38em | YES | 300 | Interface navigation, short labels |
| **Buttons (.btn)** | 0.38em | YES | 500 | CTA affordance — weight exception |
| **Eyebrows (.hero__label)** | 0.38em | YES | 400 | Small uppercase labels above headlines |
| **Footer links** | 0.38em | YES | 300 | Short navigation phrases |
| **Coordinates/Location** | 0.38em | YES | 300 | Short data strings |
| **Hero rotator phrases** | 0.18em | YES | 300 | Reduced tracking for longer phrases |
| **Display headings (H1-H3)** | 0.18em | YES | 300 | Headlines >12 chars |
| **Stat numbers** | 0.38em | YES | 300 | Short numeric display |
| **Stat labels** | 0.02em | NO | 300 | Descriptive phrases — readable |
| **Body paragraphs** | 0.02em | NO | 300 | Normal reading |
| **Project descriptions** | 0.02em | NO | 300 | Long-form reading |
| **Form labels** | 0.02em | NO | 400 | Readable labels |
| **Form inputs** | 0.02em | NO | 300 | User input text |
| **Testimonials** | 0.02em | NO | 300 | Quoted text, readable |
| **Captions / badges** | 0.02em | NO | 400 | Small text legibility |
| **Skip link** | 0.02em | NO | 500 | Accessibility |

---

## Brand Wordmark Rule

**Every visible occurrence of "CUADRA" must use Montserrat 300 + uppercase + 0.38em**, regardless of the surrounding role's tracking policy:

```css
.brand-wordmark {
  font-family: var(--font-primary);
  font-weight: 300;
  letter-spacing: var(--letter-spacing-interface); /* 0.38em fixed */
  text-transform: uppercase;
}
```

Applied in:
- `footer__copy` of all 4 pages: `&copy; 2026 <span class="brand-wordmark">CUADRA</span>`
- index-web.html FAQ answer: `Para nada. <span class="brand-wordmark">CUADRA</span> se encarga...`
- pre-existing: hero title, section title, comparison label (index-web.html)
- construction hero: `.hero--construction .hero__label` (clamp(2.5rem, 10vw, 5.5rem), 0.38em, caps, 300) — already brand format, untouched

Excluded: `<title>`, `meta`, `alt`/`aria-label` (no rendered CSS).

---

## Element-Specific CSS (components.css / pages.css)

```css
/* Interface (0.38em caps) */
.nav__link, .footer__link {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: 0.875rem;               /* 14px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}

.btn {
  font-family: var(--font-primary);
  font-weight: 500;                  /* EXCEPTION: affordance */
  font-size: 0.8125rem;              /* 13px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
  /* fixes conservados: white-space: normal; text-align: center; line-height: 1.2; */
}

.hero__label {
  font-family: var(--font-primary);
  font-weight: 400;
  font-size: 0.8125rem;              /* 13px */
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-interface);  /* 0.38em */
}

/* Display (0.18em caps) */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 300;
  letter-spacing: var(--letter-spacing-display);    /* 0.18em */
  text-transform: uppercase;
}

.hero__title {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-display);    /* 0.18em */
}

/* Body (0.02em normal) */
p {
  font-family: var(--font-body);
  font-weight: 300;
  letter-spacing: var(--letter-spacing-body);       /* 0.02em */
  text-transform: none;
}

.form-label { font-weight: 400; letter-spacing: var(--letter-spacing-body); }
.form-input, .form-textarea { font-weight: 300; letter-spacing: var(--letter-spacing-body); }
.testimonial-card__quote { font-weight: 300; letter-spacing: var(--letter-spacing-body); text-transform: none; }
.testimonial-card__name { font-weight: 400; letter-spacing: var(--letter-spacing-body); }
.stat-card__label { font-weight: 300; letter-spacing: var(--letter-spacing-body); /* NO caps */ }
.footer__copy { font-weight: 300; letter-spacing: var(--letter-spacing-body); text-transform: none; }
```

### Construction rotator (final measured values)

```css
.hero--construction .hero__rotator {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(1rem, 3vw, 1.75rem);   /* restored floor 16px */
  letter-spacing: var(--letter-spacing-display); /* 0.18em */
  text-transform: uppercase;
  min-height: 4em;     /* <640px: up to 3 lines at 16px floor = 62.4px real */
}
@media (min-width: 640px)  { .hero--construction .hero__rotator { min-height: 2.8em; } }
@media (min-width: 1024px) { .hero--construction .hero__rotator { min-height: 2.8em; } }
```

With 0.18em tracking, the longest phrase (49 chars) measures **2 lines at 390px** (≈41.6px real at floor 16px); `min-height: 4em` (64px) covers the 3-line edge case at ≤340px viewports; `2.8em` covers 2 lines (2×1.3em = 2.6em + rail) at ≥640px where the 44ch max-width keeps phrases at 2 lines. No overlap with `.hero--construction .hero__subtitle`, no height jumps on rotation.

### Construction hero

```css
.hero--construction .hero__label {   /* wordmark — NOT TOUCHED, always brand format */
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: clamp(2.5rem, 10vw, 5.5rem);
  letter-spacing: var(--letter-spacing-interface); /* 0.38em */
  text-transform: uppercase;
  line-height: 1.0;
}

.hero--construction .hero__subtitle {   /* conserved */
  font-size: 1rem;
  line-height: 1.6;
  max-width: 58ch;
  margin-inline: auto;
  color: var(--color-text);
}
```

---

## Wordmark Dimensioning (390px viewport)

"CUADRA" (6 chars) at 0.38em tracking, floor clamp 2.5rem (40px):

- ~240-254px visual width at 390px — wide safe margin, no overflow

---

## Legibility Justification

### Why 0.38em + Caps Works for Interface
- Short text (≤12 characters) is scanned, not read; wide tracking reinforces architectural/editorial identity.

### Why 0.02em + Normal Case for Body
- Paragraphs require continuous reading; wide tracking breaks word recognition; all-caps reduces reading speed 10-15% (WCAG 1.4.8 text scaling preserved — no nowrap on body).

### The Compromise (D-033)
- Interface (≤12 chars): 0.38em + caps = identity
- Display (>12 chars): 0.18em + caps = balance
- Body: 0.02em + normal case = legibility
- Buttons: weight 500 exception; brand wordmark: always 0.38em caps 300

---

## Size Minimums for Montserrat Light 300

| Element | Minimum Size | Weight | Justification |
|---------|--------------|--------|---------------|
| Labels | 13px (0.8125rem) | 400 | Light weight at 300 too thin below 13px |
| Captions | 12px (0.75rem) | 400 | Absolute minimum, weight 400 |
| Body | 16px (1rem) | 300 | Standard reading size |
| Buttons | 13px (0.8125rem) | 500 | Weight exception for affordance |
| Nav | 14px (0.875rem) | 300 | Readable with tracking |
| Skip link | 14px (0.875rem) | 500 | Accessibility |

---

## Files to Update (this run)

1. **css/tokens.css** - letter-spacing tokens restored (display 0.18, body 0.02), scale labels/captions 400
2. **css/base.css** - p normal case, skip-link 500
3. **css/components.css** - role table restored (nav/btn/footer links 0.38 caps 500; body normal), fixes conserved (.btn wrap/center, .footer__links flex-wrap)
4. **css/pages.css** - hero label, stat label (0.02 normal), testimonial normal, comparison label, project links 500, rotator clamp(1rem...) + min-heights, brand-wordmark 0.38 fixed
5. ***.html** - footer__copy + FAQ: CUADRA wrapped in <span class="brand-wordmark">
6. **DESIGN.md** - role-based policy + brand wordmark rule

---

## Designer Sign-Off

Role-based policy restored (D-033): interface identity (0.38em caps), display balance (0.18em caps), body legibility (0.02em normal), button weight exception 500. Brand wordmark "CUADRA" is fixed at Montserrat 300 + 0.38em caps everywhere it renders.

**UI Designer**: Design System Agent
**Date**: September 2026
**Status**: Ready — role-based restored, brand rule fixed