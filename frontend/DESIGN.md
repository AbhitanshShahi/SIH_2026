# Design System Inspired by mira

> Auto-extracted from `https://mira-inc.jp/` on 2026-08-26

## AgniDrishti application notes

This product is a dense GIS operations dashboard, not a marketing site. Apply Mira as **chrome**: light canvas, grayscale type, 12px spacing, tinted shadows, and rounded — never sharp — surfaces.

| Mira token | Dashboard usage |
|---|---|
| `#ffffff` canvas | Page, cards, panels, header |
| `#6e6e6e` / `#666666` | Headings, body, captions — never `#000` |
| `#888888` / `#aaaaaa` | Primary actions, active tabs, focus ring |
| `#e5e5e5` | Borders and inputs |
| `12px` base | Gaps, padding (`gap-3`, `p-3`) |
| `0 0 6px rgba(31,184,181,0.07)` | Card / panel elevation |
| Heading weight 400 | Titles and section labels |
| Yu Gothic Medium | Loaded with Noto Sans JP + Hiragino fallbacks |

**Operational color exception:** classification, risk, and confidence remain tinted (red / amber / blue / emerald). Those colors encode telemetry, not brand decoration.

**Radius on dense UI:** Mira marketing cards use ~87px. Dashboard surfaces use **24px** (`rounded-3xl`); buttons and controls use **12px**. 87px would collapse KPI rows and event cards.

**Type size:** Body stays at **14px+**. Extracted 9.9px sizes are not used.

**Dark mode** remains a user toggle. Light is the brand default.

---

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

**Key Characteristics:**
- Yu Gothic Medium as the heading font
- Yu Gothic Medium as the body font for all running text
- Heading weight 400
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#888888` used for CTAs and brand highlights
- 1 shadow level(s) detected — tinted shadows
- Rounded corners (86.7533px+) creating a friendly, approachable feel
- Tags: light, rounded, monochrome, compact, serif

## 2. Color Palette & Roles

### Primary
- **Primary Accent** (`#888888`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Secondary Accent** (`#aaaaaa`) · `--color-secondary`: Secondary brand, hover states, complementary highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.

### Text
- **Text Primary** (`#6e6e6e`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces
- **Border** (`#e5e5e5`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#ffffff` | `--palette-1` | section | large | text-dark |

## 3. Typography Rules

- **Heading Font:** `Yu Gothic Medium`, sans-serif
- **Body Font:** `Yu Gothic Medium`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Yu Gothic Medium | 9.91467px | 400 | 9.91467px | normal |
| Body | Yu Gothic Medium | 9.91467px | 400 | 14.872px | normal |
| Small | aboreto | 12.3933px | 400 | 12.3933px | 1.4872px |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `112.779px` | headings |
| H1 | `85.514px` | headings |
| H2 | `49.5733px` | headings |
| H3 | `37.18px` | headings |
| H4 | `32.2227px` | headings |
| Body L | `28.5047px` | body / supporting text |
| Body | `27.885px` | body / supporting text |
| Small | `17.3507px` | body / supporting text |
| XS | `15.4917px` | body / supporting text |
| Caption | `14.872px` | body / supporting text |

### Japanese Typography (CJK)

This site uses Japanese (CJK) text. Apply the following rules:

- **Line height:** Use `1.7`–`2.0` for body text (CJK needs more vertical space than Latin)
- **Letter spacing:** Use `0.04em`–`0.08em` for body text (improves Japanese readability)
- **Font fallback:** Always include a Japanese font fallback: `Yu Gothic Medium, "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif`
- **Word break:** Use `word-break: normal` and `overflow-wrap: anywhere` — never `break-all` for Japanese
- **Kinsoku (禁則処理):** Avoid line breaks before closing brackets 」）】 or after opening brackets 「（【
- **Heading line-height:** `1.3`–`1.5` (tighter than body, but looser than Latin headings)
- **Minimum body font size:** `14px` (Japanese characters are complex, smaller is hard to read)

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #6e6e6e;
  border-radius: 0px;
  padding: 0px 39.6587px;
  font-size: 12.3933px;
  font-weight: 400;
  border: none;
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `12.3933px` — use multiples (24.7866px, 37.1799px, 49.5732px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `12.3933px` | element |
| spacing-2 | `61.9667px` | section |
| spacing-3 | `136.327px` | section |
| spacing-4 | `198.293px` | section |
| spacing-5 | `148.72px` | section |
| spacing-6 | `21.0687px` | element |
| spacing-7 | `99.1467px` | section |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-card | `86.7533px` | card |
| radius-card | `43.3767px` | card |
| radius-button | `7.436px` | button |
| radius-button | `12.3933px` | button |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(31, 184, 181, 0.07) 0px 0px 6.19667px 0px` | Cards, subtle elevation |

> **Note:** This site uses chromatic (color-tinted) shadows rather than pure black — this is a deliberate brand choice that adds warmth to elevation.

## 7. Do's and Don'ts

### Do
- Use `#ffffff` as the primary background color
- Use `Yu Gothic Medium` for all headings and `Yu Gothic Medium` for body text
- Use `#888888` as the single dominant accent/CTA color
- Maintain `12.3933px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`86.7533px`+) consistently for all interactive elements
- Use serif fonts for headlines to maintain editorial authority
- Stick to grayscale + `#888888` accent — avoid color overload
- Apply the shadow system for elevation — use the extracted shadow values
- Use weight 400 for headings to match the brand's typographic voice
- Use `line-height: 1.7-2.0` for Japanese body text
- Include Japanese font fallback (Noto Sans JP, Hiragino, Yu Gothic)

### Don't
- Don't use colors outside the extracted palette without justification
- Don't substitute Yu Gothic Medium/Yu Gothic Medium with generic alternatives
- Don't use irregular spacing — stick to 12.3933px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't add additional saturated colors beyond the primary accent
- Don't mix in geometric sans-serif headlines — it breaks the editorial tone
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#6e6e6e` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette
- Don't use `word-break: break-all` for Japanese text — it breaks in the middle of words
- Don't set body font size below 14px for Japanese — characters are too complex
- Don't use Latin-optimized line-height (1.2-1.4) for Japanese body text

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 12.3933px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #6e6e6e
Accent:      #888888
Secondary:   #aaaaaa
Border:      #e5e5e5
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Yu Gothic Medium` heading in `#6e6e6e`, and a `#888888` CTA button."
2. "Create a pricing card using background `#ffffff`, border `#e5e5e5`, `Yu Gothic Medium` for text, and 37.1799px padding."
3. "Design a navigation bar — `#ffffff` background, `#6e6e6e` links, `#888888` for active state."
4. "Build a feature grid with 3 columns, 37.1799px gap, each card using the card component style."
5. "Create a footer with `#6e6e6e` background, `#ffffff` text, and 24.7866px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 61 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--wp-block-synced-color` | `#7a00df` |
| `--wp-editor-canvas-background` | `#ddd` |
| `--wp-admin-theme-color` | `#007cba` |
| `--wp-admin-theme-color-darker-10` | `#006ba1` |
| `--wp-admin-theme-color-darker-20` | `#005a87` |
| `--wp--preset--color--black` | `#000000` |
| `--wp--preset--color--cyan-bluish-gray` | `#abb8c3` |
| `--wp--preset--color--white` | `#ffffff` |
| `--wp--preset--color--pale-pink` | `#f78da7` |
| `--wp--preset--color--vivid-red` | `#cf2e2e` |
| `--wp--preset--color--luminous-vivid-orange` | `#ff6900` |
| `--wp--preset--color--luminous-vivid-amber` | `#fcb900` |
| `--wp--preset--color--light-green-cyan` | `#7bdcb5` |
| `--wp--preset--color--vivid-green-cyan` | `#00d084` |
| `--wp--preset--color--pale-cyan-blue` | `#8ed1fc` |
| `--wp--preset--color--vivid-cyan-blue` | `#0693e3` |
| `--wp--preset--color--vivid-purple` | `#9b51e0` |
| `--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple` | `linear-gradient(135deg,rgb(6,147,227) 0%,rgb(155,81,224) 100%)` |
| `--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan` | `linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%)` |
| `--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange` | `linear-gradient(135deg,rgb(252,185,0) 0%,rgb(255,105,0) 100%)` |
| `--wp--preset--gradient--luminous-vivid-orange-to-vivid-red` | `linear-gradient(135deg,rgb(255,105,0) 0%,rgb(207,46,46) 100%)` |
| `--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray` | `linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%)` |
| `--wp--preset--gradient--cool-to-warm-spectrum` | `linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%)` |
| `--wp--preset--gradient--blush-light-purple` | `linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%)` |
| `--wp--preset--gradient--blush-bordeaux` | `linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%)` |
| `--wp--preset--gradient--luminous-dusk` | `linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%)` |
| `--wp--preset--gradient--pale-ocean` | `linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%)` |
| `--wp--preset--gradient--electric-grass` | `linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%)` |
| `--wp--preset--gradient--midnight` | `linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%)` |
| `--wp--preset--shadow--natural` | `6px 6px 9px rgba(0, 0, 0, 0.2)` |
| ... | *(5 more)* |

### Spacing Variables

| Variable | Value |
|---|---|
| `--wp-admin-border-width-focus` | `2px` |
| `--wp--preset--aspect-ratio--square` | `1` |
| `--wp--preset--spacing--20` | `0.44rem` |
| `--wp--preset--spacing--30` | `0.67rem` |
| `--wp--preset--spacing--40` | `1rem` |
| `--wp--preset--spacing--50` | `1.5rem` |
| `--wp--preset--spacing--60` | `2.25rem` |
| `--wp--preset--spacing--70` | `3.38rem` |
| `--wp--preset--spacing--80` | `5.06rem` |

### Typography Variables

| Variable | Value |
|---|---|
| `--wp--preset--font-size--normal` | `16px` |
| `--wp--preset--font-size--huge` | `42px` |
| `--wp--preset--font-size--small` | `13px` |
| `--wp--preset--font-size--medium` | `20px` |
| `--wp--preset--font-size--large` | `36px` |
| `--wp--preset--font-size--x-large` | `42px` |

### Other Variables

| Variable | Value |
|---|---|
| `--wp-block-synced-color--rgb` | `122,0,223` |
| `--wp-bound-block-color` | `var(--wp-block-synced-color)` |
| `--wp-admin-theme-color--rgb` | `0,124,186` |
| `--wp-admin-theme-color-darker-10--rgb` | `0,107,160.5` |
| `--wp-admin-theme-color-darker-20--rgb` | `0,90,135` |
| `--wp--preset--aspect-ratio--4-3` | `4/3` |
| `--wp--preset--aspect-ratio--3-4` | `3/4` |
| `--wp--preset--aspect-ratio--3-2` | `3/2` |
| `--wp--preset--aspect-ratio--2-3` | `2/3` |
| `--wp--preset--aspect-ratio--16-9` | `16/9` |
| `--wp--preset--aspect-ratio--9-16` | `9/16` |
