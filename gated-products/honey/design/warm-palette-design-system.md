---
title: "The Warm Palette Design System — Complete Token Definitions for AI-Native Products"
author: Melisia Archimedes
collection: C10-design-bible
tier: honey
price: 49
version: 1.0
last_updated: 2026-03-09
audience: developers
hive_doctrine_id: HD-0077
---

# The Warm Palette Design System — Complete Token Definitions for AI-Native Products

## System Philosophy

The Warm Palette Design System exists at the intersection of three demands:

1. **Editorial precision** — every visual decision serves clarity of information
2. **Warm restraint** — colour and emotion without excess or sentimentality
3. **Data intelligence** — designed for products that surface complex information and make it navigable

This system is not:

- **Linear minimalism** (cold, uninviting, loses emotional signal)
- **Neutral flexibility** (generic, forgettable, treats all products as equal)
- **Dense utilitarianism** (Bloomberg terminals for everyone—fast, but punishing)
- **Corporate polish** (Stripe-like—beautiful, but impersonal)

It is: warm, opinionated, alive, and designed for products where clarity and intelligence matter more than trends.

## Identity Principles

Three core principles drive every decision in this system:

### 1. Information Density with Breathing Room

AI-native products handle a lot of information. Financial data. Research. Agent states. Logs. This system accommodates density without claustrophobia.

The mechanism: generous whitespace + clear hierarchy + warm neutrals that don't compete with content.

Users should never feel like they're reading an instruction manual.

### 2. Warmth Without Sentimentality

Cold designs (all greys and blues) feel sterile. Warm designs (too many pastels) feel unprofessional.

This system uses a warm neutral palette (off-whites, soft greys, warm blacks) with occasional warm accent colours (amber, terracotta, warm grey) to create *presence* without theatrics.

Warmth here means human-scale. It means the product was designed by people, for people. Not by algorithms, for robots.

### 3. Dark Mode as First Class

Dark mode isn't an afterthought. Both light and dark modes are fully designed and tested. For many data-heavy products, dark mode is primary.

This system provides complete token definitions for both.

## Colour Tokens: Light Mode

Light mode is designed around natural paper and ambient light—colours you'd see in a well-lit studio or office.

### Background & Surface Tokens

| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| `--bg` | `#FAFAF8` | 250, 250, 248 | Page background; primary canvas |
| `--surface` | `#FFFFFF` | 255, 255, 255 | Card surfaces, modals, elevated containers |
| `--surface-hover` | `#F9F8F6` | 249, 248, 246 | Hover state on surface elements |
| `--surface-active` | `#F5F3F0` | 245, 243, 240 | Active/pressed state on surface elements |
| `--overlay` | `rgba(0, 0, 0, 0.05)` | — | Overlay for modals, dropdowns (5% black) |

### Text Tokens

| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| `--text` | `#111827` | 17, 24, 39 | Primary text; highest contrast |
| `--text-2` | `#4B5563` | 75, 85, 99 | Secondary text; lower hierarchy |
| `--text-3` | `#9CA3AF` | 156, 163, 175 | Tertiary text; metadata, timestamps, disabled states |
| `--text-muted` | `#D1D5DB` | 209, 213, 219 | Severely diminished text (captions, hints) |

### Divider & Border Tokens

| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| `--divider` | `#E5E7EB` | 229, 231, 235 | Light borders, dividing lines between sections |
| `--divider-strong` | `#D1D5DB` | 209, 213, 219 | Stronger borders, more prominent dividers |
| `--border` | `#E5E7EB` | 229, 231, 235 | General border colour (same as divider) |

### Accent & Semantic Tokens

| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| `--primary` | `#D97706` | 217, 119, 6 | Primary actions, highlights (warm amber) |
| `--primary-hover` | `#B45309` | 180, 83, 9 | Hover state on primary actions |
| `--primary-active` | `#92400E` | 146, 64, 14 | Active/pressed state |
| `--success` | `#059669` | 5, 150, 105 | Confirmation, success states |
| `--success-hover` | `#047857` | 4, 120, 87 | Hover state |
| `--warning` | `#F59E0B` | 245, 158, 11 | Warnings, cautions (amber) |
| `--warning-hover` | `#D97706` | 217, 119, 6 | Hover state |
| `--error` | `#DC2626` | 220, 38, 38 | Errors, destructive actions (red) |
| `--error-hover` | `#B91C1C` | 185, 28, 28 | Hover state |
| `--info` | `#0891B2` | 8, 145, 178 | Informational states (teal) |

### Background Tints (for alerts, badges, tags)

| Token | Hex | Purpose |
|-------|-----|---------|
| `--success-bg` | `#F0FDF4` | Success alert background |
| `--warning-bg` | `#FFFBEB` | Warning alert background |
| `--error-bg` | `#FEF2F2` | Error alert background |
| `--info-bg` | `#F0F9FF` | Info alert background |

## Colour Tokens: Dark Mode

Dark mode swaps the brightness axis but maintains the same hue relationships.

### Background & Surface Tokens (Dark)

| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| `--bg-dark` | `#0F0F0F` | 15, 15, 15 | Page background; primary canvas (near-black) |
| `--surface-dark` | `#1A1A1A` | 26, 26, 26 | Card surfaces, modals, elevated containers |
| `--surface-hover-dark` | `#252525` | 37, 37, 37 | Hover state on surface elements |
| `--surface-active-dark` | `#333333` | 51, 51, 51 | Active/pressed state on surface elements |
| `--overlay-dark` | `rgba(255, 255, 255, 0.08)` | — | Overlay for modals, dropdowns (8% white) |

### Text Tokens (Dark)

| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| `--text-dark` | `#E5E7EB` | 229, 231, 235 | Primary text; highest contrast on dark |
| `--text-2-dark` | `#A1A5B0` | 161, 165, 176 | Secondary text; lower hierarchy |
| `--text-3-dark` | `#6B7280` | 107, 114, 128 | Tertiary text; metadata, timestamps |
| `--text-muted-dark` | `#4B5563` | 75, 85, 99 | Severely diminished text |

### Divider & Border Tokens (Dark)

| Token | Hex | RGB | Purpose |
|-------|-----|-----|---------|
| `--divider-dark` | `#2D2D2D` | 45, 45, 45 | Light borders, dividing lines |
| `--divider-strong-dark` | `#3F3F3F` | 63, 63, 63 | Stronger borders, more prominent dividers |

### Accent & Semantic Tokens (Dark)

Accents remain identical across light and dark:

| Token | Hex | Purpose |
|-------|-----|---------|
| `--primary` | `#D97706` | Primary actions (warm amber—stands out in dark) |
| `--primary-hover` | `#F59E0B` | Hover state (slightly brighter) |
| `--success` | `#10B981` | Success states (adjusted for dark—brighter) |
| `--warning` | `#F59E0B` | Warnings |
| `--error` | `#EF4444` | Errors (slightly brighter for dark) |
| `--info` | `#06B6D4` | Informational (adjusted for dark) |

## Typography System

### Font Family

**Primary:** Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)

Inter is chosen for:
- Exceptional readability at all sizes
- Strong character differentiation (critical for code, data)
- Warm, human personality without sentimentality
- Excellent multilingual support

### Type Scale

All sizes in pixels. Line height in multipliers.

| Size | Usage | Line Height | Letter Spacing |
|------|-------|-------------|-----------------|
| 12px | Caption, small labels, metadata | 1.4 (16.8px) | -0.01em |
| 13px | UI labels, small text, secondary info | 1.4 (18.2px) | 0em |
| 14px | Body text, default UI text | 1.5 (21px) | 0em |
| 15px | Slightly larger body, list items | 1.5 (22.5px) | 0em |
| 18px | Subheadings, smaller section titles | 1.3 (23.4px) | 0em |
| 24px | Section headings, major titles | 1.3 (31.2px) | -0.015em |
| 32px | Page titles, H1 | 1.2 (38.4px) | -0.02em |

### Font Weights

| Weight | Usage |
|--------|-------|
| 400 (Regular) | Body text, default UI text, paragraphs |
| 500 (Medium) | Subheadings, button labels, sidebar titles, emphasis |
| 600 (Semibold) | Section headings, bold labels, strong emphasis |

**Rule:** Never use 700 (Bold) in UI. It's too heavy. Use 600 for strong emphasis.

### Line Height Guidance

- **Headings (24px and larger):** 1.2–1.3 (tighter)
- **Body text (14–18px):** 1.5–1.6 (generous, readable)
- **Small text (12–13px):** 1.4 (tight enough to group, but legible)

## Spacing System

All spacing uses an 8px grid. This ensures rhythm and alignment.

| Size | Multiplier | Usage |
|------|-----------|-------|
| 4px | 0.5x | Rarely used; tight component internal spacing |
| 8px | 1x | Component padding, small gaps |
| 12px | 1.5x | Medium gaps, section padding |
| 16px | 2x | Standard padding, medium gaps |
| 24px | 3x | Section spacing, card spacing |
| 32px | 4x | Large section gaps, top-level spacing |
| 48px | 6x | Page-level spacing, major section dividers |
| 64px | 8x | Full-screen sections, major page dividers |

### Padding Standards

- **Buttons:** 8px horizontal, 10px vertical (internally)
- **Cards:** 24px horizontal, 20px vertical
- **Modals:** 32px horizontal, 24px vertical
- **Page margins:** 32px on desktop, 16px on mobile

### Gap Standards (Flexbox/Grid)

- **Component internal gap:** 8px
- **Section internal gap:** 16px
- **Section-to-section gap:** 32px

## Component Styling

### Buttons

#### Primary Button

```
Background: --primary (#D97706)
Text: white (#FFFFFF), weight 500
Padding: 10px 16px
Border radius: 6px
Border: 1px solid --primary-hover (#B45309)
Cursor: pointer

Hover: background --primary-hover (#B45309)
Active: background --primary-active (#92400E)
Disabled: background --text-muted (#D1D5DB), cursor not-allowed, opacity 0.6
```

#### Secondary Button

```
Background: --surface (#FFFFFF) or --surface-dark (#1A1A1A)
Text: --text (#111827) or --text-dark (#E5E7EB)
Border: 1px solid --divider (#E5E7EB) or --divider-dark (#2D2D2D)
Padding: 10px 16px
Border radius: 6px

Hover: background --surface-hover or shadow 0 0 0 4px --primary (soft outline)
Active: background --surface-active
```

#### Destructive Button

```
Background: --error (#DC2626)
Text: white, weight 500
Padding: 10px 16px
Border radius: 6px
Hover: background --error-hover (#B91C1C)
Active: background darker variant
```

### Tags & Badges

#### Success Tag

```
Background: --success-bg (#F0FDF4)
Text: --success (#059669), weight 500, size 13px
Padding: 4px 12px
Border radius: 12px (pill)
Border: 1px solid --success (optional subtle outline)
```

#### Warning Tag

```
Background: --warning-bg (#FFFBEB)
Text: --warning (#F59E0B), weight 500
Padding: 4px 12px
Border radius: 12px
```

#### Error Tag

```
Background: --error-bg (#FEF2F2)
Text: --error (#DC2626), weight 500
Padding: 4px 12px
Border radius: 12px
```

#### Default Tag

```
Background: --surface-hover (#F9F8F6) or --surface-hover-dark (#252525)
Text: --text-2 (#4B5563) or --text-2-dark (#A1A5B0)
Padding: 4px 12px
Border radius: 12px
```

### Section Labels & Dividers

#### Section Label

```
Text: --text-3 (#9CA3AF) or --text-3-dark (#6B7280)
Font size: 12px
Font weight: 600
Text transform: uppercase
Letter spacing: 0.05em
Margin bottom: 12px
```

#### Divider (Horizontal)

```
Height: 1px
Background: --divider (#E5E7EB) or --divider-dark (#2D2D2D)
Margin: 24px 0
```

#### Divider (Vertical)

```
Width: 1px
Height: 24px (or contextual)
Background: --divider
Margin: 0 16px
```

### Dropdowns & Select Menus

```
Background: --surface (#FFFFFF) or --surface-dark (#1A1A1A)
Border: 1px solid --divider (#E5E7EB) or --divider-dark (#2D2D2D)
Border radius: 6px
Padding: 10px 12px
Font size: 14px
Text colour: --text or --text-dark

Hover (closed): border colour transitions to --divider-strong
Hover (item): background --surface-hover or --surface-hover-dark
Selected item: background --primary, text white

Focus: outline 2px solid --primary, outline-offset 2px
```

### Input Fields

```
Background: --surface (#FFFFFF) or --surface-dark (#1A1A1A)
Border: 1px solid --divider
Border radius: 6px
Padding: 10px 12px
Font size: 14px
Text colour: --text or --text-dark

Focus: border-colour --primary, outline 2px solid --primary, outline-offset 2px
Error: border-colour --error, outline 2px solid --error
Disabled: background --text-muted, text --text-muted, cursor not-allowed
Placeholder: --text-3 or --text-3-dark, opacity 0.7
```

## Motion & Transition

### Timing

- **Quick interactions** (button hover, state change): 150ms
- **Modal/panel open/close:** 200ms
- **Fade/opacity changes:** 200ms
- **Scroll-triggered animations:** 300ms

### Easing

- **Default (ease):** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Ease-in (appears):** `cubic-bezier(0.4, 0, 1, 1)`
- **Ease-out (disappears):** `cubic-bezier(0, 0, 0.2, 1)`

### Transition Syntax

```css
transition: property 150ms cubic-bezier(0.4, 0, 0.2, 1);
```

Examples:
```css
button {
  transition: background-color 150ms ease, border-color 150ms ease;
}

modal {
  transition: opacity 200ms ease, transform 200ms ease;
}
```

## Anti-Patterns: What NOT to Do

1. **No blue links** — links are underlined or have explicit button styling. Default HTML `<a>` tag is invisible in this system.

2. **No shadows heavier than 0.1 opacity** — shadows should feel like ambient light, not weight. Heavy shadows (0.3+ opacity) feel clumsy.

3. **No font sizes below 12px** — below 12px, Inter becomes hard to read, especially on screens. Use 12px minimum.

4. **No nesting beyond 3 menu levels** — users get lost. If you need to nest, flatten the hierarchy.

5. **No all-caps labels for more than 2 words** — all-caps is hard to scan. Use sentence case (capital + lowercase) for legibility.

6. **No opacity-based text for primary content** — opacity makes text harder to read, especially on coloured backgrounds. Use colour contrast instead.

7. **No icon-only buttons without tooltips** — every icon-only button needs a `title` attribute or a tooltip on hover.

8. **No justified text** — justified text creates uneven spacing and is harder to read. Use left-aligned or centre-aligned.

## Implementation Guide

### CSS Variables Setup

Define these at the root or in a CSS custom properties file:

```css
:root {
  /* Light mode (default) */
  --bg: #FAFAF8;
  --surface: #FFFFFF;
  --surface-hover: #F9F8F6;
  --surface-active: #F5F3F0;
  --text: #111827;
  --text-2: #4B5563;
  --text-3: #9CA3AF;
  --divider: #E5E7EB;
  --primary: #D97706;
  --success: #059669;
  --error: #DC2626;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0F0F0F;
    --surface: #1A1A1A;
    --surface-hover: #252525;
    --text: #E5E7EB;
    --text-2: #A1A5B0;
    --divider: #2D2D2D;
  }
}
```

### Implementation in Component Frameworks

For React, Vue, or similar:

```jsx
// Adopt system at component level
const Button = ({ variant = 'primary', children }) => (
  <button className={`btn btn--${variant}`}>{children}</button>
);

// CSS
.btn--primary {
  background-color: var(--primary);
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  transition: background-color 150ms ease;
}

.btn--primary:hover {
  background-color: var(--primary-hover);
}

@media (prefers-color-scheme: dark) {
  .btn--primary:hover {
    background-color: var(--primary-hover); /* adjust if needed */
  }
}
```

## Validation Checklist

Before shipping a product on this system, verify:

- [ ] All text is 12px or larger
- [ ] All interactive elements (buttons, links) are at least 44x44px (touch target)
- [ ] Colour contrast ratio (WCAG AA) is ≥4.5:1 for body text
- [ ] Dark mode works; all tokens are defined
- [ ] Whitespace ratio is ≥40% in primary layouts
- [ ] Buttons have clear hover and active states
- [ ] No "mystery meat" buttons (icons without labels or tooltips)
- [ ] Mobile spacing is reduced proportionally (16px margins instead of 32px)
- [ ] Focus states are visible (2px outline, outline-offset 2px)
- [ ] No animations that loop infinitely without user interaction

## Final Word

A design system is only as good as its consistency and its users' willingness to follow it.

This system is opinionated by design. That's a feature, not a bug. The more strictly you apply it, the more cohesive your product feels.

But don't treat it as gospel. If you find a violation that makes your product better, document it, explain why, and propagate the change across the system.

Living systems evolve. This one should too.
