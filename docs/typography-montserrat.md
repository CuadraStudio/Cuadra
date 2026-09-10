# CUADRA — Typography Specification: Montserrat Light 300 (Global Caps Policy)

## Overview

Montserrat Light 300 is the single primary typeface. The client's **new global policy** applies ALL-CAPS with wide letter-spacing across the entire system:

- **Display / titles** (wordmark, headings H1-H3, rotator, stat numbers, coords): weight **300**, tracking **0.38em**, uppercase
- **Body / interface** (p, nav, btn, footer links, labels, captions, form, testimonials, skip link, stat labels): weight **300**, tracking **0.28em**, uppercase

The previous policy (body at 0.02em normal-case for legibility, weight-500 button exception) is **replaced**. There are no weight exceptions: everything is 300. Emphasis comes from color/background, not weight.

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

### Letter-Spacing Tokens (new values)

```css
--letter-spacing-interface: 0.38em;    /* display/wordmark/short display - wide editorial tracking */
--letter-spacing-display: 0.38em;      /* unified with interface: ALL display at 0.38em */
--letter-spacing-body: 0.28em;         /* body & interface text - caps + wide tracking (client policy) */
--letter-spacing-tight: 0em;           /* reserved, not used with Montserrat Light */
```

### Typography Scale (weights all 300; 400 ONLY below 13px)

```css
--text-display-xl: 300 clamp(2.5rem, 5vw, 3.75rem)/1.0 var(--font-display);   /* 0.38em */
--text-display-lg: 300 clamp(1.75rem, 4vw, 2.75rem)/1.05 var(--font-display); /* 0.38em */
--text-display-md: 300 clamp(1.5rem, 3vw, 2rem)/1.12 var(--font-display);     /* 0.38em */
--text-h2: 300 1.375rem/1.2 var(--font-display);                              /* 0.38em */
--text-h3: 300 1.125rem/1.35 var(--font-display);                             /* 0.38em */
--text-body-lg: 300 1.125rem/1.6 var(--font-body);                            /* 0.28em */
--text-body: 300 1rem/1.6 var(--font-body);                                   /* 0.28em */
--text-body-sm: 300 0.875rem/1.5 var(--font-body);                            /* 0.28em */
--text-label: 300 0.8125rem/1.4 var(--font-body);   /* 13px (>=13px): weight 300 = 300 policy */
--text-caption: 400 0.75rem/1.5 var(--font-body);   /* 12px (<13px): weight kept 400 for legibility */
--text-stat: 300 clamp(2rem, 4vw, 3rem)/1.0 var(--font-display);              /* 0.38em */
```

**Documented deviation**: captions at 0.75rem (12px) keep weight 400 because 12px < 13px; Montserrat Light 300 is too thin below 13px. No text element is smaller than 12px.

---

## Role → Caps/Tracking Table (NEW POLICY)

| Role | Tracking | Caps | Weight | Notes |
|------|----------|------|--------|-------|
| **Display bucket** | 0.38em | YES | 300 | wordmark, H1-H3, rotador, stat numbers, coords |
| **Body & interface bucket** | 0.28em | YES | 300 | p, nav, btn, footer links, labels, captions, form, testimonios, skip link, stat labels |
| Captions (12px < 13px) | 0.28em | YES | 400 | single documented 400 exception |

---

## Element-Specific CSS (components.css / pages.css)

### Navigation + Footer (`--letter-spacing-body`: 0.28em)

```css
.nav__link, .footer__link {
  font-family: var(--font-primary);
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-body);   /* 0.28em */
}
```

### Buttons (weight exception ELIMINATED)

```css
.btn {
  font-family: var(--font-primary);
  font-weight: 300;                             /* NO 500 exception — emphasis via background color */
  letter-spacing: var(--letter-spacing-body);   /* 0.28em */
  text-transform: uppercase;
}
```

### Display / headings (0.38em)

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 300;
  letter-spacing: var(--letter-spacing-display); /* 0.38em */
  text-transform: uppercase;
}

.hero__rotator {   /* construction hero */
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(0.875rem, 2.5vw, 1.5rem);     /* final value: fits 49-char phrase in 2 lines at 390px */
  letter-spacing: var(--letter-spacing-display); /* 0.38em */
  text-transform: uppercase;
  min-height: 2.7em;
  max-width: 44ch;
}

.hero--construction .hero__label {   /* wordmark */
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: clamp(2.5rem, 10vw, 5.5rem);
  letter-spacing: var(--letter-spacing-interface); /* 0.38em */
  text-transform: uppercase;
  line-height: 1.0;
}
```

### Body (uppercase by policy)

```css
p {
  font-family: var(--font-body);
  font-weight: 300;
  letter-spacing: var(--letter-spacing-body); /* 0.28em */
  text-transform: uppercase;                  /* client policy */
}
```

### Construction hero subtitle (recreated rule)

```css
.hero--construction .hero__subtitle {
  font-size: 1rem;
  line-height: 1.6;
  max-width: 58ch;
  margin-inline: auto;
  color: var(--color-text);
}
/* receives uppercase + 0.28em from the global p rule */
```

---

## Wordmark Dimensioning (390px viewport)

"CUADRA" (6 chars) at 0.38em tracking, floor clamp 2.5rem (40px):

- 6 chars × ~0.68em + 5 × 0.38em = ~5.98em × 40px ≈ 239-254px visual width
- Fits within 390px with wide safe margin (no overflow at 390px or 1440px)

---

## Legibility Note (documented client decision)

ALL-CAPS + wide tracking (0.28em body) **reduces reading speed** for long-form text (research: caps read 10-15% slower; wide tracking breaks word recognition). This is an explicit **brand decision** by the client for neutrality/identity — not an accessibility regression for control contrast (WCAG AA contrast ratios unchanged). Implementation mitigates overflow risk: long phrases wrap (no nowrap on body), overflow-wrap is enabled, and the rotator's font-size floor was lowered to fit its longest phrase.

**Rotator final values (documented)**: longest phrase "DESARROLLO A MEDIDA, SIN PLANTILLAS, SIN LÍMITES." (49 chars) at 0.38em → to keep it inside `min-height: 2.7em` (2 lines) at 390px, floor was stepped down to `0.875rem` (14px) in `clamp(0.875rem, 2.5vw, 1.5rem)`. The 0.38em token is unchanged per role.

---

## Size Minimums for Montserrat Light 300

| Element | Minimum Size | Weight | Justification |
|---------|--------------|--------|---------------|
| Labels | 13px (0.8125rem) | 300 | 13px >= 13px threshold → 300 policy |
| Captions | 12px (0.75rem) | 400 | Below 13px → documented 400 exception |
| Body | 16px (1rem) | 300 | Standard reading size |
| Buttons | 13px (0.8125rem) | 300 | No weight exception |
| Nav | 14px (0.875rem) | 300 | Readable with tracking |
| Skip link | 14px (0.875rem) | 300 | Body/interface bucket per policy |

---

## Files to Update (this run)

1. **css/tokens.css** - letter-spacing tokens (display 0.38, body 0.28), scale labels → 300 (caption 400 documented)
2. **css/base.css** - p uppercase, skip-link 300 + uppercase
3. **css/components.css** - nav, btn (300), footer, forms, testimonials, pricing, FAQ, pills, tech/case-study (broken token refs fixed)
4. **css/pages.css** - hero label, stat labels, step numbers, testimonial name/quote, comparison labels, project links, rotated font-size, construction subtitle rule
5. **index.html** - rotator reordered (7 phrases), historical subtitle added
6. **DESIGN.md** - tokens + policy updated

---

## Designer Sign-Off

This specification implements the client's **global caps policy** (display 0.38em / body 0.28em, all 300). The single 400 exception (captions < 13px) is size-forced and documented. Legibility tradeoff in long body text is a documented brand decision (neutrality); contrast, focus states and minimum sizes keep WCAG AA control compliance.

**UI Designer**: Design System Agent
**Date**: September 2026
**Status**: Ready — policy update applied