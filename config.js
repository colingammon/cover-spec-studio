/* ═══════════════════════════════════════════════════════════════════
   config.js — Cover Layout Creator
   Central configuration: branding, cover rules, alert messages.

   CUSTOMIZATION GUIDE
   ───────────────────────────────────────────────────────────────────
   This file controls all production rules and user-facing messages.

   • DIMENSION CONSTRAINTS: Each cover type specifies maximum spine width
     (maxSpineMm), maximum flap widths (flapMin/Max), and other bounds.
     Change these to enforce your production capabilities.

   • ALERT MESSAGES: When a user enters a value exceeding a constraint,
     the corresponding alert fires. Messages live in the alerts section
     below and reference the constraint values in coverTypes.

   • BOARD SIZES: The boardThicknesses array populates the jacket and
     PPC board dropdown. Add or remove options to match your inventory.

   • PPC SUBTYPES: The ppc.subtypes object defines board hollow styles
     with their gutter widths. Add new subtypes as new production flows.

   All changes apply immediately—no code changes needed in script.js.
═══════════════════════════════════════════════════════════════════ */

const CONFIG = {

  brand: {
    name:     'CoverSpec Studio',
    tagline:  'Production-Ready Cover Specs',
  },

  // ── Feature Toggles ────────────────────────────────────────────
  // Enable or disable optional features for your deployment
  features: {
    enablePaperPresets:  true,    // Show paper stock preset dropdown
    enableSaveHistory:   true,    // Save and recall recent calculations
  },

  // ── Paper Stock Presets ────────────────────────────────────────
  // Commonly used papers in book production. Add or modify to match
  // your suppliers. Format: { label, gsm, volume }
  // Note: volumes are calculated from formula (microns/gsm)×10.
  // Verify with your paper supplier and adjust as needed.
  // Tip: To add a custom paper, manually enter gsm/volume below the
  // dropdown without selecting a preset.
  paperStocks: [
    { label: '— Select a paper stock (or enter custom) —', gsm: 0, volume: 0 },
    // Light (50-70gsm)
    { label: 'Munken Pure 60gsm', gsm: 60, volume: 10.5 },
    { label: 'Holmen Book Cream 60gsm', gsm: 60, volume: 9.5 },
    { label: 'Arctic Volume 70gsm', gsm: 70, volume: 12.0 },
    // Standard (80-90gsm)
    { label: 'Munken Pure 80gsm', gsm: 80, volume: 13.0 },
    { label: 'Munken Pure 90gsm', gsm: 90, volume: 14.0 },
    { label: 'Holmen Book Cream 80gsm', gsm: 80, volume: 12.0 },
    { label: 'Fedrigoni Cirrus 80gsm', gsm: 80, volume: 11.8 },
    { label: 'Sappi Bookmatt 80gsm', gsm: 80, volume: 12.0 },
    { label: 'Sappi Bookmatt 90gsm', gsm: 90, volume: 13.5 },
    { label: 'UPM Finesse 90gsm', gsm: 90, volume: 12.8 },
    // Premium/Textured (100gsm+)
    { label: 'Munken Pure 100gsm', gsm: 100, volume: 15.0 },
    { label: 'Fedrigoni Cirrus 100gsm', gsm: 100, volume: 14.8 },
    { label: 'Arctic Volume 100gsm', gsm: 100, volume: 16.0 },
  ],

  // ── Theme tokens ───────────────────────────────────────────────
  // All colour, typography, radius, and motion values used by the UI.
  // These are written into :root as CSS custom properties at init by
  // applyTheme() — config.js is the single source of truth for all
  // brand decisions. To white-label: update values here only.
  theme: {
    // Content surfaces (light palette)
    bg:           '#f4f3f0',   // page / input background
    surface:      '#ffffff',   // card background
    border:       '#d8d6d0',   // card and input borders
    borderDark:   '#b0ada6',   // secondary button border

    // Content text (dark on light)
    text:         '#1a1916',   // primary body text
    textMid:      '#4a4845',   // labels, secondary text
    textDim:      '#8a8780',   // muted labels, hints, units

    // Brand accent
    accent:       '#a58242',   // gold — CTAs, active states, section titles
    accentHover:  '#b8955a',   // lightened gold — primary button hover
    accentDark:   '#7a5f2e',   // darkened gold — link hover

    // Chrome surfaces (brand dark — header, tab bar)
    chromeBg:     '#000000',   // header background
    chromeSurf:   '#212121',   // tab bar background
    chromeBord:   'rgba(255,255,255,0.14)', // chrome borders

    // Chrome text (on dark chrome)
    chromeText:    '#ffffff',  // primary on dark
    chromeTextMid: '#dddddd',  // secondary on dark — header title
    chromeTextDim: '#6e7c7c',  // muted on dark — inactive tabs

    // Fallback logo mark (shown if logo.png is absent)
    logoFallback: '#c8a050',   // "Clays" wordmark colour in fallback

    // Semantic error
    red:          '#c0392b',
    redBg:        '#fdf0ee',
    redBorder:    '#e8b4ae',

    // Typography
    font:         "'Montserrat', sans-serif",

    // Motion
    dur:          '300ms',

    // Radii
    rXs:          '4px',
    rSm:          '10px',
  },

  // ── Cover type definitions ─────────────────────────────────────
  // Each cover type includes spine calculation parameters and dimension
  // constraints (maxSpineMm, maxDocWMm, flap ranges, etc). Modify these
  // values to enforce different production rules for your workflow.
  // Changing a constraint will automatically trigger an alert in the UI
  // if the user enters a value that exceeds it.
  // See the alerts section below for the corresponding alert messages.
  coverTypes: {
    limp: {
      label:       'Limp / Paperback',
      spineBaseline:  0.65,        // baseline mm added to spine calculation
      spineRoundMm:   false,       // round to 1 decimal place (not whole mm)
      maxSpineMm:     60,          // alert triggers if calculated spine > this value
      hinge:          3,           // mm inboard from spine edge for hinge guide
      bleedNote:      'Add 3mm bleed allowance to the document',
      pdfNote:        'PDF page = trim size. Hinge & spine guides included.',
      templateTitle:  'Cover Layout — Limp Cover Template',
    },
    flaps: {
      label:       'Limp with Flaps (8pp)',
      spineBaseline:  0.65,        // baseline mm added to spine calculation
      spineRoundMm:   false,       // round to 1 decimal place
      maxSpineMm:     50,          // alert triggers if calculated spine > this (stricter than limp)
      maxDocWMm:      580,         // alert triggers if final document width > this (production limit)
      flapMin:        90,          // alert if user enters flap width < this value (mm)
      hinge:          3,           // mm inboard from spine edge for hinge guide
      bleedNote:      'Add 3mm bleed allowance to the document',
      pdfNote:        'PDF page = trim size incl. flaps. Score & spine guides included.',
      templateTitle:  'Cover Layout — Limp with Flaps (8pp) Template',
    },
    jacket: {
      label:       'Dust Jacket',
      spineBaseline:  0.50,        // baseline mm added to spine calculation
      spineRoundMm:   true,        // round to nearest whole mm (stricter precision than limp)
      maxSpineMm:     60,          // alert triggers if calculated spine > this value (mm)
      boardOverhang:  4,           // mm overhang each side: docW = backCover + spine + frontCover + (2 × boardOverhang)
      turnIn:         10,          // fixed turn-in depth (mm) on both front and back flaps
      flapMin:        70,          // alert if user enters flap width < this value (mm)
      flapMax:        100,         // alert if user enters flap width > this value (mm)
      heightAdd:      6,           // mm added to document height for board overhang (docH = pH + 6)
      bleedNote:      'Add 3mm bleed allowance to the document',
      pdfNote:        'PDF page = trim size incl. flaps & turn-ins. Fold guides included.',
      templateTitle:  'Cover Layout — Dust Jacket Template',
    },
    ppc: {
      label:       'Printed Paper Case (PPC)',
      spineBaseline:  0.50,        // baseline mm added to spine calculation
      spineRoundMm:   true,        // round to nearest whole mm
      maxSpineMm:     60,          // alert triggers if calculated spine > this value (mm)
      wrap:           15,          // mm board wraparound top and bottom (docH = pH + 36 = pH + 15 + 15 + 6)
      heightAdd:      36,          // total mm added to height for wraparounds (15 top + 15 bottom + 6 overhang)
      bleedNote:      'No additional bleed required — wraparound acts as bleed',
      pdfNote:        'PDF page = full document size incl. 15mm wraparounds.',
      templateTitle:  'Cover Layout — PPC Template',
      // PPC subtypes control gutter width (space between spine and cover edge)
      // Gutter affects document width calculation: wider gutter = narrower trim width
      // To add a new subtype: { label: 'Display Name', gutter: width_mm }
      // Gutter widths are typically 8–10mm depending on board hollow style
      subtypes: {
        round:      { label: 'Round Back',                  gutter: 8  },
        presspahn:  { label: 'Presspahn Hollow',            gutter: 9  },
        flatback:   { label: 'Flat Back Board Hollow',      gutter: 10 },
      },
    },
  },

  // ── Board thickness options (PPC & Jacket) ────────────────────
  // value = total board contribution to spine (both boards combined, mm)
  boardThicknesses: [
    { label: 'Choose board size', value: 0   },
    { label: '1.5mm boards',      value: 3   },
    { label: '1.75mm boards',     value: 3.5 },
    { label: '2mm boards',        value: 4   },
    { label: '2.25mm boards',     value: 4.5 },
    { label: '2.5mm boards',      value: 5   },
    { label: '2.75mm boards',     value: 5.5 },
  ],

  // ── Binding adders ─────────────────────────────────────────────
  bindingAdders: {
    '0': 0,   // Perfect Bound
    '2': 2,   // Sewn
  },

  // ── Alert messages ─────────────────────────────────────────────
  // Alerts fire when users enter values that exceed production constraints.
  // Modify messages here to match your brand voice and contact procedures.
  // Alert triggers are defined in coverTypes above:
  //   - spine60/spine50: triggered when spine > maxSpineMm
  //   - docW580: triggered when docW > maxDocWMm (flaps only)
  //   - flapMin/flapMax: triggered by flap width bounds (limp with flaps)
  //   - jktFlapMin/jktFlapMax: triggered by jacket flap bounds (jacket only)
  //   - boardReq: triggered when board thickness not selected (jacket/PPC)
  alerts: {
    spine60:    '⚠ Spine exceeds 60mm maximum — Contact Your Printer.',
    spine50:    '⚠ Spine exceeds 50mm maximum — Contact Your Printer.',
    docW580:    '⚠ Document width exceeds 580mm — Contact Your Printer.',
    flapMin:    '⚠ Flap width is below the minimum.',
    flapMax:    '⚠ Flap width exceeds maximum (page width − 10mm).',
    jktFlapMin: '⚠ Flap width is below the 70mm minimum.',
    jktFlapMax: '⚠ Flap width exceeds the 100mm maximum.',
    boardReq:   '⚠ Please select a board thickness.',
    requiredFields: '⚠ Please complete all required fields.',
  },

  // ── PDF drawing constants ──────────────────────────────────────
  pdf: {
    fills: {
      back:       [232, 231, 227],
      spine:      [212, 210, 204],
      front:      [238, 237, 233],
      flap:       [225, 224, 220],
      turnIn:     [230, 228, 222],
      ppcBase:    [232, 231, 227],
      ppcBack:    [238, 237, 234],
      ppcFront:   [243, 242, 238],
    },
    noteY:    0.18,   // proportion of pageH for notes block
    infoY:    0.845,  // proportion of pageH for info block
    lineH:    5.5,    // mm between info lines
  },
};
