# CLAUDE.md — CoverSpec Studio

## Project overview

**CoverSpec Studio** — *Production-Ready Cover Specs* — is a multi-tool browser microsite consisting of three tools:

1. **Cover Templates** — calculates cover artwork dimensions for four binding types and generates to-scale PDF template files for use in DTP software
2. **Micron → Volume** — converts paper thickness in microns to paper volume (bulk factor)
3. **ISBN Barcode** — generates a print-ready EAN-13 ISBN barcode as a vector PDF

Originally reverse-engineered from a suite of Acrobat PDF calculator forms. All JavaScript was extracted from compressed PDF field action streams and reimplemented in vanilla JS.

---

## File structure

Three files — no build step, no framework, deployable from any static server or filesystem:

| File | Purpose |
|---|---|
| `index.html` | Markup, CSS, tab navigation, all HTML for every tool tab |
| `script.js` | All application logic — calculations, PDF generation, barcode encoding, micron converter |
| `config.js` | Central configuration — brand, cover type rules, spine formulas, board options, alert messages, PDF draw constants |

Root assets expected alongside these files:

| File | Purpose |
|---|---|
| `logo.png` | Brand logo displayed in header (SVG or PNG, height 36px, transparent bg). Falls back to text mark if absent. |
| `favicon-32x32.png` | Browser tab icon (32×32) |
| `favicon-16x16.png` | Browser tab icon (16×16) |
| `apple-touch-icon.png` | iOS home screen icon |

---

## Dependencies

| Dependency | Source | Purpose |
|---|---|---|
| Montserrat | Google Fonts CDN | UI typography (font.family.primary per DESIGN.md) |
| jsPDF 2.5.1 | cdnjs.cloudflare.com | Client-side PDF generation |

jsPDF loaded as UMD bundle: `window.jspdf.jsPDF`.

---

## Design system

The UI uses a hybrid theme: brand dark chrome for navigation/header/CTAs, original light palette for content areas. All tokens are defined as CSS custom properties in `index.html`.

### CSS custom properties

```css
/* Content surfaces — light */
--bg:          #f4f3f0;   /* page background */
--surface:     #ffffff;   /* card background */
--border:      #d8d6d0;   /* card/input borders */
--border-dark: #b0ada6;   /* secondary button border */

/* Content text — dark on light */
--text:        #1a1916;   /* primary body text */
--text-mid:    #4a4845;   /* labels, secondary text */
--text-dim:    #8a8780;   /* muted labels, hints, units */

/* Brand accent — DESIGN.md color.text.primary */
--accent:      #a58242;   /* gold — active states, CTAs, section titles */

/* Chrome surfaces — brand dark (header, tab bar) */
--chrome-bg:   #000000;   /* header background */
--chrome-surf: #212121;   /* tab bar background */
--chrome-bord: rgba(255,255,255,0.14); /* chrome borders */

/* Chrome text — on dark chrome */
--chrome-text:     #ffffff;   /* primary on dark */
--chrome-text-mid: #dddddd;   /* secondary on dark — header title */
--chrome-text-dim: #6e7c7c;   /* muted on dark — inactive tabs */

/* Error */
--red:         #c0392b;
--red-bg:      #fdf0ee;
--red-border:  #e8b4ae;

/* Typography */
--font: 'Montserrat', sans-serif;

/* Motion */
--dur: 300ms;   /* motion.duration.instant per DESIGN.md */

/* Radii */
--r-xs: 4px;    /* radius.xs per DESIGN.md */
--r-sm: 10px;   /* radius.sm per DESIGN.md */
```

### Contrast ratios (WCAG 2.2 AA — all pass ≥4.5:1)

| Foreground | Background | Ratio |
|---|---|---|
| `#a58242` | `#000000` | 5.87:1 |
| `#ffffff` | `#000000` | 21.0:1 |
| `#dddddd` | `#000000` | 15.5:1 |
| `#6e7c7c` | `#000000` | 4.84:1 |
| `#ffffff` | `#212121` | 16.1:1 |
| `#a58242` | `#212121` | 4.50:1 |
| `#1a1916` | `#f4f3f0` | 16.9:1 |
| `#a58242` | `#ffffff` | 3.27:1 — use at 18px+ or bold only |

### Theme zones

| Zone | Surface | Text | Accent |
|---|---|---|---|
| Header | `--chrome-bg` #000 | `--chrome-text-mid` #ddd | `--accent` #a58242 |
| Tab bar | `--chrome-surf` #212121 | `--chrome-text-dim` #6e7c7c (inactive) / `--accent` (active) | — |
| Cover type buttons (active) | `--accent` #a58242 | #000 | — |
| Download button | `--accent` #a58242 | #000 bold | — |
| Primary result card | `--chrome-bg` #000 | `--accent` (value) | — |
| Cards, inputs, body | `--surface` #fff / `--bg` #f4f3f0 | `--text` #1a1916 | `--accent` (highlights) |
| Section titles | `--surface` | `--accent` (text) | — |

### Typography

- Font: Montserrat (Google Fonts, weights 400/500/600/700)
- Base size: 14px (font.size.lg), line-height 1.65
- Section titles: 10px, weight 700, letter-spacing 0.16em, uppercase, `--accent` colour
- Labels: 13px, weight 600, `--text-mid`
- Hints/notes: 11px, weight 500, `--text-dim`
- Header title: 15px, weight 700, letter-spacing 0.10em, uppercase, `--chrome-text-mid`
- Tab labels: 12px, weight 600, letter-spacing 0.07em, uppercase

### Focus visible

Global `:focus-visible` rule applies `2px solid var(--accent)` outline with `outline-offset: 2px` to all interactive elements (WCAG 2.2 AA keyboard requirement).

---

## config.js

All cover-type rules, board options, alert messages, and PDF draw constants live here. Change behaviour by editing config.js — never hard-code values in script.js.

**Enhanced documentation:** config.js includes a detailed customization guide at the top and inline comments explaining each constraint, when alerts trigger, and how to modify production rules. See the file itself for examples on changing dimension limits, alert messages, board sizes, and PPC subtypes.

### Structure

```js
CONFIG = {
  brand: { name, tagline },
  coverTypes: {
    limp:   { spineBaseline, spineRoundMm, maxSpineMm, hinge, bleedNote, ... },
    flaps:  { spineBaseline, maxSpineMm, maxDocWMm, flapMin, hinge, ... },
    jacket: { spineBaseline, spineRoundMm, maxSpineMm, boardOverhang, turnIn, flapMin, flapMax, heightAdd, ... },
    ppc:    { spineBaseline, spineRoundMm, maxSpineMm, wrap, heightAdd, subtypes: { round, presspahn, flatback } },
  },
  boardThicknesses: [ { label, value }, ... ],  // populated into <select> at runtime
  bindingAdders: { '0': 0, '2': 2 },            // Perfect Bound / Sewn
  alerts: { spine60, spine50, docW530, flapMin, flapMax, jktFlapMin, jktFlapMax, boardReq },
  pdf: { fills, noteY, infoY, lineH },
}
```

### Board thickness options

Values represent the combined contribution of both boards to spine width (mm):

| Label | Value |
|---|---|
| Choose board size | 0 |
| 1.5mm boards | 3 |
| 1.9mm boards | 3.8 |
| 2mm boards | 4 |
| 2.25mm boards | 4.5 |
| 2.5mm boards | 5 |
| 2.75mm boards | 5.5 |

---

## Spine formulas

### Limp / Paperback

```
spine = round1dp((pages × gsm × vol) / 20000 + 0.65)
```

Rounded to **1 decimal place immediately** before any derived values are computed. Never use the raw float downstream — docW must agree with displayed spine.

```js
spine = Math.round(((pages * gsm * vol) / 20000 + 0.65) * 10) / 10;
```

If pages, gsm, or volume is zero, spine = 0 (no baseline applied).

### Limp with Flaps (8pp)

Same formula as limp. Max spine 50mm (not 60mm).

### Dust Jacket

```
spine = roundMm((pages × gsm × vol) / 20000 + 0.50 + boardValue + bindingAdder)
```

- `boardValue` — from board thickness dropdown (both boards combined, e.g. 2mm boards = 4mm)
- `bindingAdder` — Perfect Bound = 0, Sewn = 2mm
- Rounded to nearest whole mm

### PPC (all subtypes)

Same formula as jacket. Board thickness and binding adder required.

```
spine = roundMm((pages × gsm × vol) / 20000 + 0.50 + boardValue + bindingAdder)
```

---

## Cover type geometry

### Limp / Paperback

```
docW = pW + spine + pW
docH = pH
hinge = 3mm each side of spine boundary
max spine: 60mm
```

### Limp with Flaps (8pp)

```
coverW = pW + 1          (+1mm manufacturing tolerance)
docW   = flapW + coverW + spine + coverW + flapW
docH   = pH
max spine: 50mm
max docW:  530mm
flap min: 90mm, flap max: pW − 10mm
score lines at flapW and flapW + coverW from each edge
```

### Dust Jacket

```
coverW = pW + 4          (+4mm board overhang each side)
TURN   = 10              (fixed turn-in, mm)
docW   = flapW + TURN + coverW + spine + coverW + TURN + flapW
docH   = pH + 6          (+6mm top/bottom board overhang)
max spine: 60mm
flap min: 70mm, flap max: 100mm
fold lines at flapW; turn-in lines at flapW + TURN
```

### PPC — Round Back

```
gutter = 8mm
coverW = pW − gutter
WRAP   = 15mm (board wraparound)
trimW  = round(coverW + gutter + spine + gutter + coverW)
trimH  = round(pH + 6)
docW   = WRAP + coverW + gutter + spine + gutter + coverW + WRAP
docH   = pH + 36         (+15mm top + 15mm bottom + 6mm overhang)
```

### PPC — Presspahn Hollow

Same as Round Back but `gutter = 9mm`.

### PPC — Flat Back Board Hollow

Same as Round Back but `gutter = 10mm`.

---

## Dimension convention

**Height × Width** throughout — all labels in the PDF and UI spec box follow `H × W mm`.

- BACK COVER / FRONT COVER sub-labels: `${fmt(docH)} × ${fmt(pW)} mm`
- Document Size info line: `Document Size: ${fmt(docH)} × ${fmt(docW)} mm`
- Page size: `Page: ${fmt(docH)} × ${fmt(pW)} mm`

Do not swap to W × H.

---

## PDF template specification

### Page geometry

| Property | Value |
|---|---|
| MediaBox | `docW × docH` mm (trim size — no bleed added to page) |
| TrimBox | Full page (= MediaBox), specified in points with Y-flip |
| BleedBox | Not set |
| Unit | mm |

### TrimBox coordinate conversion

jsPDF writes box values directly into the PDF stream without unit conversion. Values must be in **points**, using PDF's **bottom-left origin** (Y flipped from jsPDF's top-left):

```js
const SF = doc.internal.scaleFactor; // 2.8346 pts/mm
pageCtx.trimBox = {
  bottomLeftX: 0,
  bottomLeftY: 0,
  topRightX:   pageW * SF,
  topRightY:   pageH * SF,
};
```

For offset trim (if bleed is ever re-introduced as page padding):
```
bottomLeftY = (pageH − bleed − docH) × SF
topRightY   = (pageH − bleed) × SF
```

### PDF draw order — all cover types

1. Section fills (back / spine / front / flap / turn-in as applicable)
2. Page border — solid black, lw 0.4
3. Spine boundary lines — solid black, lw 0.5, full page height
4. Spine centre line — dashed grey (3/2mm), lw 0.3
5. Cover-type-specific guides:
   - **Limp / Flaps** — hinge lines (dashed, 3mm inboard of spine), score/fold lines on flaps (dashed)
   - **Jacket** — fold lines at flap boundary (dashed), turn-in lines (dashed)
   - **PPC** — gutter lines (dashed), horizontal wraparound fold lines
6. Section labels — BACK COVER / FRONT COVER / SPINE centred in panels, mid-page vertically
7. Notes block — two bold 11pt lines centred at `pageH × 0.18`
8. Info block — three bold 11pt lines centred at `pageH × 0.845`

**No fold/TURN-IN vertical text annotations** — removed at client request (confusing to less experienced users).

**No bleed guide** — removed at client request. Bleed is communicated as a text note only.

### PDF section fill colours (RGB)

| Section | R | G | B |
|---|---|---|---|
| Back cover | 232 | 231 | 227 |
| Spine | 212 | 210 | 204 |
| Front cover | 238 | 237 | 233 |
| Flap | 225 | 224 | 220 |
| Turn-in | 230 | 228 | 222 |
| PPC base (full page) | 232 | 231 | 227 |
| PPC back board | 238 | 237 | 234 |
| PPC front board | 243 | 242 | 238 |

### PDF text sizes

| Element | Size | Weight |
|---|---|---|
| BACK COVER / FRONT COVER | 14pt | Bold |
| Section dimension sub-label | 10pt | Normal |
| SPINE label | 11pt | Bold |
| Spine mm value | 9pt | Normal |
| Notes block / info block | 11pt | Bold |
| Gutter / wraparound labels (PPC) | 9pt | Bold |

### Filename conventions

| Mode | Pattern | Example |
|---|---|---|
| Limp | `limp-template-{pW}x{docH}-sp{spine}.pdf` | `limp-template-129x198-sp25.6.pdf` |
| Flaps | `flaps-template-{pW}x{docH}-sp{spine}.pdf` | `flaps-template-156x234-sp17.3.pdf` |
| Jacket | `jacket-template-{pW}x{pH}-sp{spine}.pdf` | `jacket-template-156x234-sp22.pdf` |
| PPC | `ppc-template-{pW}x{pH}-sp{spine}.pdf` | `ppc-template-156x234-sp20.pdf` |

Widths/heights use `fmt(n, 0)` (integer). Spine uses `fmt(n)` (1dp) for limp/flaps, `fmtInt(n)` (whole mm) for jacket/PPC.

---

## UI — inputs

| ID | Label | Unit | Modes | Notes |
|---|---|---|---|---|
| `pHeight` | Trim Height | mm | all | Page trim height |
| `pWidth` | Trim Width | mm | all | Single page trim width |
| `gsm` | Grammage | gsm | all | Paper weight |
| `volume` | Volume | — | all | Paper volume / bulk factor, step 0.1 |
| `numPages` | Number of Pages | pp | all | Total extent including plate sections |
| `flapWidth` | Flap Width | mm | flaps | Min 90mm, max pW−10mm |
| `jacketFlapWidth` | Flap Width | mm | jacket | Min 70mm, max 100mm |
| `binding` | Binding Style | — | jacket, ppc | Select: Perfect Bound (0) / Sewn (+2mm) |
| `boardThickness` | Board Size | mm | jacket, ppc | Populated from `CONFIG.boardThicknesses` |
| `ppcType` | PPC Type | — | ppc | Select: round / presspahn / flatback |

All number inputs: `type="number"`, `min="0"`, spinner arrows hidden. All fire `cvCalculate()` on `input` event.

---

## UI — result displays

### Cover Templates

| ID | Mode | Label | Primary card |
|---|---|---|---|
| `r-limp-spine` / `r-limp-docW` / `r-limp-docH` | limp | Spine / Doc Width / Doc Height | docW |
| `r-flaps-spine` / `r-flaps-coverW` / `r-flaps-docW` / `r-flaps-docH` | flaps | Spine / Cover Width / Doc Width / Doc Height | docW |
| `r-jkt-spine` / `r-jkt-coverW` / `r-jkt-docW` / `r-jkt-docH` | jacket | Spine / Cover Width / Doc Width / Doc Height | docW |
| `r-ppc-spine` / `r-ppc-trimW` / `r-ppc-trimH` / `r-ppc-docW` / `r-ppc-docH` | ppc | Spine / Trim Width / Trim Height / Doc Width / Doc Height | docW |

All show `—` until pWidth and pHeight are both > 0.

### Alerts

| ID | Trigger |
|---|---|
| `alert-spine-60` | Spine > 60mm (limp, jacket, ppc) |
| `alert-spine-50` | Spine > 50mm (flaps) |
| `alert-docw-530` | docW > 530mm (flaps) |
| `alert-flap-min` | flapW < 90mm (flaps) |
| `alert-flap-max` | flapW > pW−10mm (flaps) |
| `alert-jktflap-min` | flapW < 70mm (jacket) |
| `alert-jktflap-max` | flapW > 100mm (jacket) |
| `alert-board-req` | boardThickness = 0 with hasCore (jacket, ppc) |

All alerts include a contact message customizable in `config.js.alerts`. Default phrasing uses "Account Manager" — modify the alert strings to match your support/sales process.

---

## Micron to Volume calculator

Formula: `volume = (microns / gsm) × 10`

Result displayed to 1dp. Copy to clipboard button. Clear button.

IDs: `mv-micron`, `mv-gsm`, `mv-volume`, `mv-copy`, `mv-result-wrap`.

---

## ISBN Barcode generator

- **Input:** ISBN-13 (hyphens stripped, must start 978 or 979, check digit validated)
- **Add-on:** EAN-5 only (5 digits). Leave blank if not required.
- **Output:** single vector PDF, sized to user-specified width × height (mm)
- Barcode drawn as native jsPDF rectangles — not images — resolution independent
- Embedded Noto Sans font (base64 in script.js) for barcode text
- Live canvas preview updates on input
- No batch, no step-and-repeat, no ISSN — stripped from the original ISBN generator

IDs: `bcIsbn`, `bcAddon`, `bcWidth`, `bcHeight`, `bc-canvas`, `bc-error`, `bc-preview-wrap`, `bc-download`.

---

## `fmt()` / `fmtInt()` functions

```js
function cvFmt(n, d=1) {
  const f = parseFloat(n.toFixed(d));
  return d === 1 ? f.toFixed(1) : String(f);
}
function cvFmtInt(n) { return String(Math.round(n)); }
```

`cvFmt()` always produces 1dp by default. Pass `d=0` for integers. `cvFmtInt()` rounds to whole mm (used for jacket/PPC spine, docW, docH). Used throughout both UI and PDF output to guarantee displayed values agree.

---

## Known constraints and decisions

- **No bleed on the PDF page.** Page = trim size only. Bleed instruction is a text note. Adding a bleed-padded page with dashed guides was tried and rejected as confusing to non-technical users.
- **No dimension annotation lines.** Arrow/tick-mark dimensions were removed. Plain bold text labels only.
- **No fold/TURN-IN/FOLD vertical text annotations.** Tried and removed — rotated text rendering was inconsistent across viewers.
- **No white background boxes behind text.** Tried and removed — text sits directly on section fills.
- **Spine rounded before docW.** `Math.round(raw × 10) / 10` applied immediately to prevent displayed spine and docW disagreeing due to float precision.
- **Board thickness required for jacket and PPC.** Alert fires if user enters dimensions without selecting a board size. Without a board value the spine is materially wrong.
- **Height × Width convention.** All dimensions printed `H × W mm` to match industry standard for book formats.

---

## Recent updates (v2.0+)

- **Rebranding:** Project renamed to "CoverSpec Studio" with tagline "Production-Ready Cover Specs"
- **Enhanced config.js:** Added comprehensive customization guide and inline comments explaining all dimension constraints, alert triggers, and how to modify production rules
- **Improved introduction:** Wider card layout (800px) and larger typography (15px intro, 14px body) for better readability
- **Paper Stock Presets:** Dropdown with 13 common international paper stocks (Munken, Fedrigoni, Sappi, etc.). Users can select to auto-fill gsm/volume or enter custom values. Fully customizable via config.js
- **Saved Calculations:** Manual save feature—users click "Save Calculation" to store specs with custom names. No auto-history. Uses browser localStorage, searchable by name
- **Red PDF Text:** All text, labels, and guides in generated PDFs now render in red for better visibility and distinction from artwork
- **Book Cover Icons:** New professional book spine icon design (black on gold background) used in header and introduction cards
- **Improved UI:** Placeholder text is subtle and smaller; save modal matches app design system; custom modal dialog for saving calculations (no browser prompt)
- **Clean branding:** Removed all references to previous white-label client (TJ Clays/TJ Books)
- **MIT License:** Published as open-source with permissive licensing

---

## Paper Stock Presets

The `CONFIG.paperStocks` array in config.js provides a dropdown for users to quickly select common papers. Format:

```js
paperStocks: [
  { label: '— Select a paper stock (or enter custom) —', gsm: 0, volume: 0 },
  { label: 'Munken Pure 80gsm', gsm: 80, volume: 13.0 },
  { label: 'Your Custom Paper', gsm: 90, volume: 14.5 },
]
```

Volume values use the formula: `(microns / gsm) × 10`. Verify with paper suppliers. Users can:
- Select a preset → gsm/volume auto-fill
- Leave dropdown blank → manually enter custom values

---

## Saved Calculations

Users can manually save calculation specs with custom names to browser localStorage:

**UI:** "Save Calculation" button → optional name input modal → stored in `coverspec_saved`

**Format stored:**
```js
{
  id: timestamp,
  name: "Jacket • 156×234",  // User-customizable
  timestamp: Date.now(),
  mode: "jacket",
  inputs: { pHeight, pWidth, gsm, volume, numPages, ... }
}
```

**Toggle via config:**
```js
CONFIG.features.enableSaveHistory = true  // enables saved calculations
```

Saved calculations appear in a dropdown at the bottom of the form. Users can load, rename (by re-saving), or delete. No limit on number of saved calculations.

---

## PDF Generation (Red Text)

All text in generated PDFs renders in red for visibility:
- Section labels (BACK COVER, FRONT COVER, SPINE): `[220,0,0]` (bright red)
- Spine text & notes: `[200,0,0]` (darker red)
- Dimension values: `[240,80,80]` (lighter red)

Change colors in the `txt()` calls throughout the PDF generation functions (lines 600+).

---

## Expanding the application

### Paper stock presets

Add a `<select>` populated from a presets array `[{ name, gsm, volume }]` in `config.js`. On selection, populate `gsm` and `volume` fields and call `cvCalculate()`.

### Even-page validation

Add a check in `cvCalculate()` flagging if `numPages` is odd (cover extents are always even).

### Additional PPC subtypes

Add entries to `CONFIG.coverTypes.ppc.subtypes` with a `gutter` value. The UI dropdown (`ppcType`) is populated from this object — no other changes needed.

### Additional board sizes

Add entries to `CONFIG.boardThicknesses`. The board select is populated by `cvPopulateBoardSelect()` at init — no other changes needed.

### White-labelling

The app ships with "CoverSpec Studio" and "Production-Ready Cover Specs" as defaults. To re-brand:

1. Replace `logo.png` with your brand logo (36px height, transparent background)
2. Update `CONFIG.brand.name` and `CONFIG.brand.tagline` in `config.js`
3. Optionally update `CONFIG.theme` colors to match your brand identity
4. Update alert messages in `CONFIG.alerts` to reference your support process
5. Update PDF template titles in `CONFIG.coverTypes[mode].templateTitle` if needed
6. All changes apply immediately—no code modifications needed
