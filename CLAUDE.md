# CLAUDE.md — CoverSpec Studio

## Project overview

**CoverSpec Studio** — *Production-Ready Cover Specs* — is a multi-tool browser microsite consisting of four tools:

1. **Standard Sizes** — reference table of UK and European standard book trim sizes (A-Format through A4, with binding types and use cases)
2. **Cover Templates** — calculates cover artwork dimensions for four binding types and generates to-scale PDF template files for use in DTP software
3. **Micron → Volume** — converts paper thickness in microns to paper volume (bulk factor)
4. **ISBN Barcode** — generates a print-ready EAN-13 ISBN barcode as a vector PDF

Originally reverse-engineered from a suite of Acrobat PDF calculator forms. All JavaScript was extracted from compressed PDF field action streams and reimplemented in vanilla JS.

---

## File structure

Four files — no build step, no framework, deployable from any static server or filesystem:

| File | Purpose |
|---|---|
| `index.html` | Markup, CSS, tab navigation, all HTML for every tool tab |
| `script.js` | All application logic — calculations, PDF dispatch, barcode encoding, micron converter |
| `pdfTemplates.js` | PDF template layouts — one builder per cover type, plus the drawing kit (guides, dimension arrows, notes, titles) |
| `config.js` | Central configuration — brand, cover type rules, spine formulas, board options, alert messages, PDF drawing constants |

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
    limp:   { spineBaseline, spineRoundMm, maxSpineMm, hinge, safeZone, bleedNote, pdfNote, templateTitle, ... },
    flaps:  { spineBaseline, maxSpineMm, flapMin, hinge, safeZone, bleedNote, pdfNote, templateTitle, ... },
    jacket: { spineBaseline, spineRoundMm, maxSpineMm, boardOverhang, turnIn, flapMin, flapMax, heightAdd, safeZone, ... },
    ppc:    { spineBaseline, spineRoundMm, maxSpineMm, wrap, heightAdd, safeEdge, safeSpine, subtypes: { round, presspahn, flatback } },
  },
  boardThicknesses: [ { label, value }, ... ],  // populated into <select> at runtime
  bindingAdders: { '0': 0, '2': 2 },            // Perfect Bound / Sewn
  alerts: { spine60, spine50, flapMin, flapMax, jktFlapMin, jktFlapMax, boardReq },
  pdf: { ink, slate, white, flapTint, lineW, dotW, dotGap, arrowW, headL, headW, noteSize, specSize, titleSize, titleTrack },
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

### Architecture

- `pdfTemplates.js` holds one builder per cover type: `pdfBuildLimp`, `pdfBuildFlaps`, `pdfBuildJacket`, `pdfBuildPPC`. Each takes `cvState` and returns a jsPDF document.
- `cvGeneratePDF()` in `script.js` picks the builder from `cvState.mode`, builds the document and saves it. It does no drawing itself.
- `pdfNewDoc(pageW, pageH)` creates the page at document size and sets the TrimBox.
- `pdfKit(doc)` is the drawing kit: `line`, `dotted`, `dashed`, `rect`, `box`, `arrow`, `note`, `vnote`, `title`, `safeRect`, `spec`.
- Geometry comes from `cvState` (calculated in `script.js`). Drawing constants come from `CONFIG.pdf`. Cover rules (safe zones, hinge, overhang, wrap) come from `CONFIG.coverTypes`. Change them in `config.js`, not in `pdfTemplates.js`.

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

1. Section fills — flap tint on flaps and jacket flaps, slate spine, slate case boards (PPC)
2. Page border — slate, lw 0.25
3. Guides — solid/dashed hinge, fold, score, turn-in and gutter lines; dotted fold and turn-in lines on jackets
4. Safe zones — dotted rectangles inset from trim, with the label sitting in a gap in the top or bottom edge
5. Titles — BACK / FRONT / FLAP / SPINE, letter-spaced, shrunk to fit their panel. SPINE is white on slate.
6. Dimension arrows, each with a short note
7. Job spec block — title, document / spine / page sizes, bleed note. Bottom-left of the back panel; in the bottom turn-in for PPC.

**Vertical notes are used** for hinge, score and turn-in labels. Rotated text can crowd the dotted lines, so check it in the rendered PDF.

**No bleed guide** — bleed is communicated as a text note only.

### Layout by cover type

- **Limp** — slate spine. Dashed hinge lines 3mm either side of the spine. Dotted safe zones 3mm from trim. Trim width arrow across the back and trim height arrow down the front.
- **Flaps** — flap tint on both flaps, dashed score lines at the flap folds, hinge lines beside the spine. Flap width arrows on the top edge. Cover panel width arrow notes the +1mm tolerance.
- **Jacket** — flaps include a 10mm turn-in. Dotted guides at flap fold, board overhang, trimmed width and turn-in limits. Flap width arrows across the top, 10mm turn-in strips, and a jacket height note. Front arrows show trimmed width, centring width (trim + overhang) and folding extent (trim + overhang + turn-in).
- **PPC** — case boards with dotted 4mm safe zones (`safeEdge`). Dotted 2mm spine lettering limits (`safeSpine`). 15mm wraparound arrows on all four edges (`WRAP`). Gutter arrows for the joint (`gutter`), with a joint note naming the back style. Board width note shows the trim width less the gutter. Board height note shows trim height plus 6mm. Centring note on the front unless the back is flatback.

### PDF drawing constants (`CONFIG.pdf`)

| Key | Value | Use |
|---|---|---|
| `ink` | `[35, 31, 32]` (#231f20) | Guides, arrows, notes |
| `slate` | `[145, 155, 176]` (#919bb0) | Spine fill, boards, panel titles |
| `white` | `[255, 255, 255]` | Spine lettering and SPINE title |
| `flapTint` | `[238, 240, 244]` | Flap areas |
| `lineW` / `dotW` / `dotGap` | 0.3 / 0.35 / 0.7 mm | Solid and dashed guides; dot size and spacing |
| `arrowW` / `headL` / `headW` | 0.35 / 2.2 / 1.6 mm | Dimension arrows |
| `noteSize` / `specSize` | 8pt / 7pt | Notes; job spec lines after the title |
| `titleSize` / `titleTrack` | 34pt / 0.12 | Panel titles (maximum size) and letter spacing |

Font is Helvetica throughout. Titles are bold; notes and spec lines are normal weight.

### Filename conventions

| Mode | Pattern | Example |
|---|---|---|
| Limp | `limp-template-{pW}x{docH}-sp{spine}.pdf` | `limp-template-129x198-sp25.6.pdf` |
| Flaps | `flaps-template-{pW}x{docH}-sp{spine}.pdf` | `flaps-template-156x234-sp17.3.pdf` |
| Jacket | `jacket-template-{pW}x{pH}-sp{spine}.pdf` | `jacket-template-156x234-sp22.pdf` |
| PPC | `ppc-template-{pW}x{pH}-sp{spine}.pdf` | `ppc-template-156x234-sp20.pdf` |

Widths/heights use `cvFmt(n, 0)` (integer). Spine uses `cvFmt(n)` (1dp) for limp/flaps, `cvFmtInt(n)` (whole mm) for jacket/PPC.

---

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
| `ppcWrap` | Wraparound Size | mm | ppc | Board overhang on all four sides (default 15mm, resets on tab switch) |
| `paperPreset` | Paper Stock | — | all | Optional: select common papers to auto-fill gsm/volume |

All number inputs: `type="number"`, `min="0"`. Most hide spinner arrows for cleaner UI; `bcFontScale` (barcode font size) displays spinner arrows for easy adjustment. All fire `cvCalculate()` or `bcUpdatePreview()` on `input` event.

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
| `alert-spine-60` | Spine > 60mm (limp, jacket, ppc) — warns of binding machine limits (2–65mm recommended) |
| `alert-spine-50` | Spine > 50mm (flaps) — warns of binding machine limits (2–65mm recommended) |
| `alert-flap-min` | flapW < 90mm (flaps) |
| `alert-flap-max` | flapW > pW−10mm (flaps) |
| `alert-jktflap-min` | flapW < 70mm (jacket) |
| `alert-jktflap-max` | flapW > 100mm (jacket) |
| `alert-board-req` | boardThickness = 0 with hasCore (jacket, ppc) |
| `alert-required-fields` | Mode-specific required field is missing (flaps: flap width; jacket: flap width) — only shows after user enters trim dimensions |

All spine alerts include guidance to contact printer or consider using lower grammage paper. All alert messages are customizable in `config.js.alerts`.

---

## Micron to Volume calculator

Formula: `volume = (microns / gsm) × 10`

Result displayed to 1dp. Copy to clipboard button. Clear button.

IDs: `mv-micron`, `mv-gsm`, `mv-volume`, `mv-copy`, `mv-result-wrap`.

---

## ISBN Barcode generator

- **Input:** ISBN-13 (hyphens stripped, must start 978 or 979, check digit validated)
- **Add-on:** EAN-5 only (5 digits for price or edition number). Leave blank if not required.
- **Output:** single vector PDF, sized to user-specified width × height (mm)
- Barcode drawn as native jsPDF rectangles — not images — resolution independent
- Embedded Noto Sans font (base64 in script.js) for barcode text
- Live canvas preview updates on input
- No batch, no step-and-repeat, no ISSN — stripped from the original ISBN generator

### Text Customization

Users can customize barcode text elements via toggles and settings:

| Control | Type | Range | Default | Purpose |
|---|---|---|---|---|
| `bcShowLabel` | Checkbox | on/off | on | Show/hide ISBN label at top |
| `bcShowDigits` | Checkbox | on/off | on | Show/hide digit numbers below barcode |
| `bcShowAddonDigits` | Checkbox | on/off | on | Show/hide EAN-5 add-on numbers |
| `bcFontScale` | Number input | 50–150% | 100% | Scale all text elements proportionally |
| `bcIsbnFormat` | Select | "formatted" / "raw" | "formatted" | ISBN label format: `ISBN XXX-X-XXX-XXXXX-X` or `9780000000000` |

**Text Overflow Warning:**
- Displays if ISBN label width exceeds barcode width at current font size
- Message: "⚠ Text size exceeds barcode width. Reduce font size or increase barcode width."
- Checked in real-time; updates as user adjusts font scale or barcode width

**Layout & Alignment:**
- ISBN label at top left-aligns with visual barcode structure (indented 4 module widths from left edge)
- Font sizes scale proportionally with barcode height and font scale setting
- **Preview note:** Canvas preview renders at 96 DPI (screen resolution) for performance; text will appear larger in the final PDF at print resolution

**Clear Button:**
- Resets all barcode inputs to defaults
- Width/height reset to 38 × 27mm
- All text customization options reset to defaults

IDs: `bcIsbn`, `bcAddon`, `bcWidth`, `bcHeight`, `bcShowLabel`, `bcShowDigits`, `bcShowAddonDigits`, `bcFontScale`, `bcIsbnFormat`, `bc-canvas`, `bc-error`, `bc-preview-wrap`, `bc-download`.

---

## Standard Sizes Reference

Reference table of UK and European standard book trim sizes for both limp-bound (paperback) and case-bound (hardback) publishing:

**Included formats:**
- **A-Format** (178 × 111 mm) — Mass-market fiction paperbacks
- **B-Format** (198 × 129 mm) — Most common UK fiction & non-fiction
- **Demy Limp** (216 × 135 mm) — Premium trade paperbacks, literary fiction
- **Demy Case Bound** (216 × 138 mm) — Standard hardback fiction & non-fiction
- **American Royal** (229 × 152 mm) — US Trade (6×9"), print-on-demand standard
- **Royal Limp** (234 × 153 mm) — Premium paperbacks, biographies, travel editions
- **Royal Case Bound** (234 × 156 mm) — Commercial hardbacks & heavy non-fiction
- **Pinched Crown Quarto** (248 × 171 mm) — Specialized non-fiction, textbooks
- **Crown Quarto** (246 × 189 mm) — Children's books, art, photography, poetry anthologies
- **A5** (210 × 148 mm) — Academic publishing, journals, technical manuals
- **A4** (297 × 210 mm) — Illustrated art books, atlases, children's picture books

**Technical note:** For case-bound (hardback) books, the outer rigid boards typically extend 3–4mm beyond the page block on top, bottom, and fore-edge for protection.

All dimensions listed as Height × Width in millimetres. Data source: UK and European Standard Book Sizes Guide (book sizes.md).

IDs: `tab-sizes`, table in card format for reference use.

---

## TXT Specs Download

Generated alongside PDF templates, the TXT file exports all calculated specifications in human-readable format:

```
GENERATED: 7/12/2026, 10:30:45 AM

============================================================

COVER TYPE
------------------------------------------------------------
TYPE: Jacket

PAGE DIMENSIONS
------------------------------------------------------------
Trim Height: 234 mm
Trim Width: 156 mm

PAPER SPECIFICATION
------------------------------------------------------------
Grammage: 80 gsm
Volume: 13
Number of Pages: 320 pp

COVER SPECIFICATIONS
------------------------------------------------------------
Doc Size: 297 × 370 mm
Spine: 22 mm (rounded to mm)
Board: 4mm (both boards combined)
Binding: Perfect Bound
...
```

**Filename:** `{mode}-specs-{timestamp}.txt`

IDs: `btn-specs`, triggered from results card.

---

## Paper Stock Presets

Optional dropdown feature (enabled via `CONFIG.features.enablePaperPresets`) pre-populates gsm and volume from common international paper stocks:

**Populated from:** `CONFIG.paperStocks` array (13 stocks by default: Munken, Holmen, Fedrigoni, Sappi, Arctic, UPM)

**Behavior:**
- User selects preset → `gsm` and `volume` inputs auto-fill
- User leaves blank → must manually enter custom gsm/volume
- Selection persists in dropdown until user selects different preset

Volume formula: `(microns / gsm) × 10`. Users should verify values with their paper supplier.

IDs: `paperPreset` (select), `paperPresetRow` (optional section).

---

## Saved Calculations

Manual save feature (enabled via `CONFIG.features.enableSaveHistory`) stores calculation specs to browser localStorage with custom names.

**Behavior:**
- Click "Save Calculation" button → modal prompts for name
- Specs stored with: `id` (timestamp), `name` (user input), `timestamp`, `mode`, `inputs` object
- Dropdown shows saved calculations; click to load → repopulates all form fields
- Delete button removes individual saves; "Clear All" wipes history

**Storage key:** `coverspec_saved` (browser localStorage)

**Format:**
```js
{
  id: 1720774245000,
  name: "Jacket • 156×234",
  timestamp: 1720774245000,
  mode: "jacket",
  inputs: { pHeight: 234, pWidth: 156, gsm: 80, volume: 13, ... }
}
```

IDs: `btn-save-calc`, `saveModal`, `savedCalcsSection`, `savedCalcsDropdown`.

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
- **Dimension arrows with short notes.** Arrows mark each dimension, with a plain-English note beside it. Keep notes short.
- **Vertical notes are allowed** for hinge, score and turn-in labels. Check them in the rendered PDF, since rotated text rendering varies between viewers.
- **No white background boxes behind text.** Tried and removed — text sits directly on section fills.
- **Spine rounded before docW.** `Math.round(raw × 10) / 10` applied immediately to prevent displayed spine and docW disagreeing due to float precision.
- **Board thickness required for jacket and PPC.** Alert fires if user enters dimensions without selecting a board size. Without a board value the spine is materially wrong.
- **Height × Width convention.** All dimensions printed `H × W mm` to match industry standard for book formats.

---

## Recent updates (v2.0+)

- **PDF templates rebuilt:** Layouts moved to `pdfTemplates.js`. They use slate spines, dotted safe zones, dimension arrows with short notes, and job spec lines. Drawing constants moved to `CONFIG.pdf`. The old red-text PDF style is retired.
- **SVG template export removed:** `svgGenerator.js` and the SVG download button were removed.

- **Rebranding:** Project renamed to "CoverSpec Studio" with tagline "Production-Ready Cover Specs"
- **Enhanced config.js:** Added comprehensive customization guide and inline comments explaining all dimension constraints, alert triggers, and how to modify production rules
- **Improved introduction:** Wider card layout (800px) and larger typography (15px intro, 14px body) for better readability
- **Paper Stock Presets:** Dropdown with 13 common international paper stocks (Munken, Fedrigoni, Sappi, etc.). Users can select to auto-fill gsm/volume or enter custom values. Fully customizable via config.js
- **Saved Calculations:** Manual save feature—users click "Save Calculation" to store specs with custom names. No auto-history. Uses browser localStorage, searchable by name
- **TXT Specs Download:** Alongside PDF template, users can download calculated specifications as a text file with all dimensions, paper details, and cover-type-specific settings
- **Red PDF Text:** All text, labels, and guides in generated PDFs now render in red for better visibility and distinction from artwork
- **Book Cover Icons:** New professional book spine icon design (black on gold background) used in header and introduction cards
- **Improved UI:** Placeholder text is subtle and smaller; save modal matches app design system; custom modal dialog for saving calculations (no browser prompt)
- **PPC Wraparound Customization:** Input field allows users to customize board wraparound size (default 15mm, applies to all four sides: top, bottom, front, back). Resets to 15mm when switching to PPC tab
- **8pp Flap Cover Limit:** Maximum document width increased to 580mm (from 530mm) for limp with flaps
- **Required Fields Alert:** Shows when user has entered trim dimensions but hasn't filled in mode-specific required fields (flap width for flaps/jacket)
- **Updated Alert Messages:** All alerts now reference "Contact Your Printer" instead of "Contact Your Account Manager"
- **Clean branding:** Removed all references to previous white-label client (TJ Clays/TJ Books)
- **MIT License:** Published as open-source with permissive licensing
- **Barcode Text Customization:** ISBN barcode generator now supports toggling ISBN label, digit numbers, and EAN-5 add-on display. Font scaling (50–150%), ISBN format options (formatted vs. raw), and real-time text overflow warning when text exceeds barcode width. Improved text alignment and positioning for cleaner layout
- **Standard Sizes Reference:** New reference tab displaying UK and European standard book trim sizes (A-Format through A4) with binding types and use cases. Sourced from comprehensive book sizes research document
- **Spine Warning Updates:** Spine alert messages now reference binding machine limits (Min 2mm – Max 65mm recommended) and suggest contacting printer or considering lower grammage paper as alternatives
- **Flaps Width Constraint Removed:** Removed 580mm maximum document width constraint for 8pp flap covers, allowing greater flexibility for varied production scenarios

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

## PDF Generation

- Dispatch: `cvGeneratePDF()` in `script.js` → `pdfBuild*()` in `pdfTemplates.js` → `doc.save()`.
- All guide and note text uses `CONFIG.pdf.ink` (#231f20). Section titles use `CONFIG.pdf.slate`, or white on the spine.
- To change a colour, weight or size, edit `CONFIG.pdf`. To change a label or note, edit the matching line in `pdfTemplates.js`. Notes read the numbers from `cvState` so they always match the calculated figures.

---

## Expanding the application

### Paper stock presets

✓ **Already implemented.** See "Paper Stock Presets" section above. Customize available stocks by editing `CONFIG.paperStocks` in `config.js`.

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
3. Update `CONFIG.paperStocks` to your paper suppliers' stocks and specifications
4. Optionally update `CONFIG.theme` colors to match your brand identity
5. Update alert messages in `CONFIG.alerts` to reference your support process
6. Enable/disable features in `CONFIG.features` (paper presets, saved calculations)
7. Update PDF template titles in `CONFIG.coverTypes[mode].templateTitle` if needed
8. All changes apply immediately—no code modifications needed
