---
name: Warm Light Peach Soft
colors:
  surface: "#fff8f5"
  surface-dim: "#e5d7d1"
  surface-bright: "#fff8f5"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#fff1ea"
  surface-container: "#f9ebe5"
  surface-container-high: "#f3e5df"
  surface-container-highest: "#ede0d9"
  on-surface: "#211a16"
  on-surface-variant: "#53433e"
  inverse-surface: "#362f2b"
  inverse-on-surface: "#fceee7"
  outline: "#86736d"
  outline-variant: "#d9c2ba"
  surface-tint: "#8f4c33"
  primary: "#8f4c33"
  on-primary: "#ffffff"
  primary-container: "#ffa98a"
  on-primary-container: "#793b24"
  inverse-primary: "#ffb59b"
  secondary: "#665c56"
  on-secondary: "#ffffff"
  secondary-container: "#ebddd5"
  on-secondary-container: "#6b615b"
  tertiary: "#056c48"
  on-tertiary: "#ffffff"
  tertiary-container: "#7acfa4"
  on-tertiary-container: "#00583a"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdbcf"
  primary-fixed-dim: "#ffb59b"
  on-primary-fixed: "#380d00"
  on-primary-fixed-variant: "#72361e"
  secondary-fixed: "#eee0d8"
  secondary-fixed-dim: "#d2c4bc"
  on-secondary-fixed: "#211a16"
  on-secondary-fixed-variant: "#4e453f"
  tertiary-fixed: "#9ef4c7"
  tertiary-fixed-dim: "#82d8ac"
  on-tertiary-fixed: "#002113"
  on-tertiary-fixed-variant: "#005235"
  background: "#fff8f5"
  on-background: "#211a16"
  surface-variant: "#ede0d9"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: "600"
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  margin-tablet: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a gentle, comforting, and elevated aesthetic centered on lightness, warm tactile calm, and approachable luxury. Designed primarily for lifestyle, curated commerce, mindful wellness, and modern hospitality interfaces, it invites users into an uncluttered and reassuring digital space.

The visual style blends soft minimalism with warm organic modernism:

- Generous, airy negative space paired with warm pastel tones rather than sterile whites or grays.
- Absence of harsh separation; borders are virtually eliminated in favor of tonal shifts and ambient, diffused lighting.
- Tactile warmth conveyed through pillowy structural curves, smooth micro-interactions, and human-centric typography.

## Colors

The palette establishes an inviting atmosphere defined by sunlight-infused undertones and high legibility without cold contrasts.

- **Background Canvas (`#FFF9F5`):** A warm alabaster peach tint that sets an unhurried, comfortable tone across the application canvas.
- **Surface & Cards (`#FFFFFF`):** Crisp pure white applied to elevated content containers, floating smoothly over the warm canvas.
- **Primary Accent (`#FFA98A`):** A ripe, luminous peach tone designated for high-intent interactive components and key focal points.
- **Primary Tint (`#FFF0E8`):** A sheer, soft wash used for quiet highlights, selected states, and gentle chip containers.
- **Text & Foreground:**
  - High Emphasis (`#2B2420`): A deep espresso brown offering rich contrast without the jarring sterility of pure `#000000`.
  - Medium/Secondary (`#8A7F78`): A warm taupe for supporting metadata, placeholders, and inactive states.
- **Semantic Badges:** `#E4F6EE` provides an airy sage background paired with `#1F7A55` for reassuring, organic success confirmations.

## Typography

The typographic hierarchy utilizes Plus Jakarta Sans across all display, body, and label roles. Its geometric underpinnings combined with organic, friendly curves harmonize naturally with the soft peach design language.

- **Headlines & Display:** Set tightly with negative tracking to ensure large headers feel modern, cohesive, and intentional.
- **Body:** Given generous line heights (`1.5` to `1.55`) to facilitate effortless scanning on warm backgrounds.
- **Labels & Overlines:** Emphasize medium and semi-bold weights with subtle tracking to maintain crisp definition at smaller scales without appearing rigid.

## Layout & Spacing

The layout is built upon an open, fluid grid system designed to let content breathe:

- **Desktop (1024px+):** 12-column layout with 24px gutters and generous 48px outer canvas margins to enforce an uncluttered, spacious perimeter.
- **Tablet (768px - 1023px):** 8-column layout with 24px gutters and 32px canvas margins.
- **Mobile (<768px):** 4-column layout with 16px gutters and 20px outer canvas margins to retain warmth without crowding edge-to-edge screens.

The spacing rhythm prioritizes open vertical flow. Section blocks rely on `space-xl` gaps to prevent visual fatigue, while micro-elements within cards adhere strictly to `space-sm` and `space-md` relationships.

## Elevation & Depth

This system avoids dark, cold drop shadows and distinct linear borders. Depth is realized through tinted ambient dispersion:

- **Ambient Tinting:** Shadows use a soft, warm umber base tint (`rgba(66, 36, 21, 0.05)` to `rgba(66, 36, 21, 0.08)`) instead of black or synthetic cool gray.
- **Low-Elevation Card Level:** `box-shadow: 0 4px 24px -2px rgba(66, 36, 21, 0.04), 0 2px 6px -1px rgba(66, 36, 21, 0.02)`. Blurs are expansive and ultra-feathered.
- **Floating Overlays & Popovers:** `box-shadow: 0 16px 40px -4px rgba(66, 36, 21, 0.08), 0 4px 12px -2px rgba(66, 36, 21, 0.03)`.
- **Surfacing:** Stacking relies heavily on chromatic contrast—pure white (`#FFFFFF`) elements layered against the slightly deeper `#FFF9F5` base canvas provide natural separation without structural boundaries.

## Shapes

The shape system centers on fluid, tactile contours that reflect comfort and approachability:

- **Primary Cards & Containers:** Standardized at a custom 20px (`1.25rem`) corner radius, yielding smooth, pebble-like surfaces that define the interface's soft personality.
- **Interactive Controls (Inputs, Buttons, Dropdowns):** Configured with 12px to 16px corner radii to balance usability with friendly curvature.
- **Pills & Status Badges:** Fully circular (`rounded-full` / `9999px`) to distinguish meta labels from structural cards.

## Components

### Buttons

- **Primary:** Filled with `#FFA98A`, typography set in `#3A2620` (`label-lg`), height of 48px, 14px border radius. Hover introduces an ambient warm glow (`box-shadow: 0 6px 16px rgba(255, 169, 138, 0.45)`). No border.
- **Secondary / Soft:** Filled with `#FFF0E8`, typography set in `#2B2420`. On hover, transitions smoothly to a 10% deeper tint.
- **Ghost:** Transparent background with `#2B2420` text, highlighting gently with `#FFF0E8` at 60% opacity on press.

### Cards

- Pure `#FFFFFF` fill with uniform 20px border radius and 24px internal padding (`space-lg`).
- Zero border outlines by default; spatial definition is created entirely by the subtle warm ambient elevation and the contrast against `#FFF9F5`.

### Input Fields

- Surface set to `#FFFFFF` with an unselected neutral border tone replaced by an ultra-subtle fill shift (`#FFFDFB`).
- Height of 48px, 12px border radius, text styled in `#2B2420` with placeholders in `#8A7F78`.
- Focus state: Subtle 2px outer aura in `#FFA98A` with zero harsh strokes.

### Chips & Badges

- **Status & Success Badges:** Rounded pill shape, filled with `#E4F6EE`, text set in `#1F7A55` (`label-sm`).
- **Filter Chips:** 36px height, rounded pill shape, `#FFF0E8` background when inactive, shifting to `#FFA98A` fill with `#3A2620` text when selected.

### Checkboxes & Radios

- 20px dimensional scale with 6px border radius (checkbox) or full circle (radio).
- Unselected state uses `#FFF0E8` fill; selected state transitions to `#FFA98A` with a `#3A2620` check icon.

### Lists & Dividers

- Avoid stark 1px solid dividers. Separate list items using generous vertical space (`space-md`) or ultra-soft warm gradient rules (`rgba(43, 36, 32, 0.04)`).
