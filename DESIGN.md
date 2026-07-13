# DESIGN.md — CoverSpec Studio

## Product

- **Product name:** CoverSpec Studio
- **Audience:** Book designers, pre-press operators, and production staff preparing artwork files for book cover production. Users range from highly experienced DTP professionals to less experienced staff who need simple, unambiguous guidance.
- **Product surface:** Browser-based toolset

---

## Mission

Provide a clean, accessible, fast-loading set of tools that are visually consistent while remaining simple and unambiguous for non-technical users.

---

## Style foundations

### Typography

| Token | Value |
|---|---|
| `font.family.primary` | Montserrat |
| `font.family.stack` | `Montserrat, sans-serif` |
| `font.size.base` | 18px |
| `font.weight.base` | 400 |
| `font.lineHeight.base` | 28px |

**Scale used in this application:**

| Token | Value | Usage |
|---|---|---|
| `font.size.xs` | 12px | — |
| `font.size.sm` | 13px | — |
| `font.size.md` | 13.33px | — |
| `font.size.lg` | 14px | Body text baseline |
| `font.size.xl` | 16px | — |
| `font.size.2xl` | 18px | — |
| `font.size.3xl` | 20px | — |
| `font.size.4xl` | 22px | — |

Specific sizes used in the UI (mapped to scale where possible):

| Element | Size | Weight | Other |
|---|---|---|---|
| Header title | 15px | 700 | Uppercase, ls 0.10em |
| Tab labels | 12px | 600 | Uppercase, ls 0.07em |
| Section titles | 10px | 700 | Uppercase, ls 0.16em, accent colour |
| Field labels | 13px | 600 | — |
| Input values | 16px | 600 | — |
| Hints / notes | 11px | 500 | — |
| Result values | 20px | 700 | — |
| Result labels | 9px | 700 | Uppercase, ls 0.14em |
| Intro body text | 13–14px | 400 | lh 1.75 |

---

## Colour palette

### Brand tokens

| Token | Value | Description |
|---|---|---|
| `color.text.primary` | `#a58242` | Gold — brand accent, CTAs, active states, highlights |
| `color.text.secondary` | `#ffffff` | White — primary text on dark chrome |
| `color.text.tertiary` | `#6e7c7c` | Muted — inactive tab labels |
| `color.text.inverse` | `#dddddd` | Near-white — header title, secondary on dark |
| `color.surface.base` | `#000000` | Black — header background |
| `color.surface.muted` | `#212121` | Dark grey — tab bar background |

### Application-specific tokens (content areas — light palette)

| Token | Value | Description |
|---|---|---|
| `--bg` | `#f4f3f0` | Page / input background |
| `--surface` | `#ffffff` | Card background |
| `--border` | `#d8d6d0` | Card and input borders |
| `--border-dark` | `#b0ada6` | Secondary button border |
| `--text` | `#1a1916` | Primary body text |
| `--text-mid` | `#4a4845` | Secondary labels |
| `--text-dim` | `#8a8780` | Muted labels, hints, units |
| `--red` | `#c0392b` | Error / alert text |
| `--red-bg` | `#fdf0ee` | Alert background |
| `--red-border` | `#e8b4ae` | Alert border |

### Hybrid theme principle

Brand **chrome** (header, tab bar) uses the DESIGN.md dark palette — black background, gold accent, white/grey text. This anchors the tool visually to the main website.

Content **areas** (cards, inputs, body text, results) use the original warm light palette — off-white surfaces, near-black text. This maximises readability for form-heavy data entry and avoids eye strain during extended use.

**Primary CTA (Download button)** and **active cover-type selector buttons** use the gold accent as background fill with black text — brand-consistent, high-contrast (5.87:1 on black, 3.27:1 on white — use bold weight only on white).

---

## Contrast ratios (WCAG 2.2 AA — all pass ≥4.5:1)

| Foreground | Background | Ratio | Notes |
|---|---|---|---|
| `#a58242` | `#000000` | 5.87:1 | ✓ AA |
| `#ffffff` | `#000000` | 21.0:1 | ✓ AA |
| `#dddddd` | `#000000` | 15.5:1 | ✓ AA |
| `#6e7c7c` | `#000000` | 4.84:1 | ✓ AA |
| `#ffffff` | `#212121` | 16.1:1 | ✓ AA |
| `#a58242` | `#212121` | 4.50:1 | ✓ AA (minimum — use bold) |
| `#1a1916` | `#f4f3f0` | 16.9:1 | ✓ AA |
| `#4a4845` | `#f4f3f0` | 9.3:1 | ✓ AA |
| `#8a8780` | `#f4f3f0` | 3.9:1 | Large text / non-text only |
| `#000000` | `#a58242` | 5.87:1 | ✓ AA (buttons, active states) |

---

## Spacing scale

| Token | Value |
|---|---|
| `space.1` | 2px |
| `space.2` | 3px |
| `space.3` | 4px |
| `space.4` | 5px |
| `space.5` | 6px |
| `space.6` | 7px |
| `space.7` | 10px |
| `space.8` | 12px |

---

## Radius / shadow / motion tokens

| Token | Value |
|---|---|
| `radius.xs` | 4px — inputs, buttons, result cards, alerts |
| `radius.sm` | 10px — cards (outer container) |
| `shadow.1` | `rgba(0,0,0,0.08) 0px 0px 10px 0px` — card drop shadow |
| `motion.duration.instant` | 300ms — all transitions |

---

## Accessibility

- Target: WCAG 2.2 AA
- Global `:focus-visible` rule: `2px solid var(--accent)` outline, `outline-offset: 2px`
- All interactive elements (buttons, inputs, selects, tabs, links) have explicit focus-visible treatment
- No focus indicators suppressed
- All text contrast ratios verified (see table above)
- `--text-dim` (`#8a8780`) on `--bg` (`#f4f3f0`) = 3.9:1 — used only for non-critical decorative text (hints, units); increase weight or use `--text-mid` if text becomes functionally important
- Keyboard-first tab navigation required
- `aria` labels not currently implemented — add `aria-label` to icon-only controls if any are added in future

---

## Component rules

### Header

- Background: `--chrome-bg` (#000000)
- Logo: `logo.png` from root, height 36px. Text fallback if file absent.
- Title: "COVER LAYOUT CREATOR", 15px/700, uppercase, `--chrome-text-mid` (#dddddd)
- Separator: 1px `--chrome-bord`
- Height: 56px fixed

### Tab bar

- Background: `--chrome-surf` (#212121)
- Border-bottom: 1px `--chrome-bord`
- Tab labels: 12px/600, uppercase, inactive `--chrome-text-dim`, hover `--chrome-text-mid`, active `--accent` with 2px bottom border in `--accent`
- Active tab border-bottom: 2px solid `--accent`
- Padding: 13px 18px per tab

### Cards

- Background: `--surface` (#ffffff)
- Border: 1px `--border`
- Border-radius: `radius.sm` (10px)
- Shadow: `shadow.1`
- Max-width: 600px (intro card: 680px)
- Card body padding: 28px
- Card footer: border-top `--border`, padding 20px 28px 26px

### Section titles

- 10px/700, uppercase, letter-spacing 0.16em
- Colour: `--accent` (#a58242)
- Margin-bottom: 14px

### Inputs and selects

- Background: `--bg`
- Border: 1.5px `--border`
- Border-radius: `radius.xs` (4px)
- Font: 16px/600 Montserrat
- Focus: border-color `--accent`, background #fff
- Focus-visible: 2px `--accent` outline

### Cover type selector buttons

| State | Style |
|---|---|
| Default | Transparent bg, `--text-mid`, `--border` border |
| Hover | `--accent` border, `--text` colour |
| Active | `--accent` fill, black text, weight 700 |
| Focus-visible | 2px `--accent` outline |

### Download (primary) button

| State | Style |
|---|---|
| Default | `--accent` bg, #000 text, 13px/700, uppercase |
| Hover | Lightened gold `#b8955a` |
| Disabled | 30% opacity, not-allowed cursor |
| Focus-visible | 2px #fff outline, offset 3px (on gold) |

### Secondary button

| State | Style |
|---|---|
| Default | Transparent, `--text-mid`, `--border-dark` border |
| Hover | `--bg` fill, `--text`, `--accent` border |
| Focus-visible | 2px `--accent` outline |

### Result cards

| Variant | Background | Value colour |
|---|---|---|
| Default | `--bg` | `--text` |
| Primary (doc width) | `--chrome-bg` (#000) | `--accent` gold |

### Alerts

- Background: `--red-bg`, border: 1.5px `--red-border`, text: `--red`
- Border-radius: `radius.xs`
- All alerts reference "Account Manager" — never "CSR"

---

## Writing tone

Concise, plain, instructional. No jargon without explanation. Audience ranges from professionals to complete beginners — always favour clarity over brevity when the two conflict.

In-tool labels and hints:
- Use active voice: "Enter the trim height" not "Trim height should be entered"
- Avoid abbreviations in visible UI except standard industry terms (gsm, mm, pp, PPC, PDF)
- Alert messages must state the problem and the action: "⚠ Spine exceeds 60mm maximum — contact your Account Manager."

---

## Anti-patterns

- Do not use `--text-dim` (#8a8780) for functional body text — contrast fails AA at normal weight on `--bg`
- Do not use `--accent` (#a58242) as background with white text — contrast is 3.27:1, fails AA
- Do not introduce inline `font-family` references other than `var(--font)` — all type must use Montserrat
- Do not add dimension annotation lines to PDFs — previously tried and removed at client request
- Do not add vertical running text annotations to PDFs — rendering inconsistent across viewers, removed at client request
- Do not add bleed guide boxes to PDFs — confusing to non-technical users, removed at client request
- Do not reference "CSR" — use "Account Manager" throughout

---

## QA checklist

- [ ] All text contrasts verified against WCAG 2.2 AA thresholds
- [ ] All interactive elements have visible `:focus-visible` state
- [ ] `logo.png` fallback renders if file is absent
- [ ] Favicons present: `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`
- [ ] SEO meta: description, keywords, og:title, og:description, og:type present
- [ ] All spine formulas round before computing derived values
- [ ] Board thickness required for jacket and PPC — alert fires if absent
- [ ] All alerts say "Account Manager" not "CSR"
- [ ] All dimensions displayed Height × Width
- [ ] PDF TrimBox values in points with Y-flip applied
- [ ] PDF filenames include mode, trim size, and spine value
- [ ] No FOLD/TURN-IN vertical text annotations in any PDF
- [ ] No bleed guide box in any PDF
- [ ] No IBM Plex or other font references remain
- [ ] No `#f4f3f0` / light tokens used in chrome areas (header, tab bar)
- [ ] No `#000000` / dark tokens used in content areas (cards, inputs)
- [ ] `config.js` is the single source of truth for all cover rules and alert text
- [ ] External link (danrodney.com) opens in new tab with `rel="noopener noreferrer"`
