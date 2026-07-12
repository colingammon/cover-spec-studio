# CoverSpec Studio

Production-ready cover specifications made instant. A free, browser-based toolkit for book cover production. Calculate spine width, generate PDF templates, convert paper metrics, and create ISBN barcodes—no software installation required.

![MIT License](https://img.shields.io/badge/license-MIT-green)
![No dependencies](https://img.shields.io/badge/dependencies-2%20CDN-blue)
![Vanilla JS](https://img.shields.io/badge/built%20with-vanilla%20JS-orange)

## Features

**Cover Templates**
- Calculate exact dimensions for four binding types: limp cover, limp with flaps, dust jacket, and printed paper case (PPC)
- Automatically compute spine width from paper specifications (gsm, volume, extent)
- Generate to-scale vector PDF templates for use in InDesign, Affinity Publisher, or Illustrator
- Customizable production constraints and alerts

**Micron → Volume Converter**
- Convert paper thickness (microns) to paper volume (bulk factor)
- Needed when paper suppliers quote microns but the calculator needs volume
- Copy result directly to clipboard

**ISBN Barcode Generator**
- Create print-ready EAN-13 ISBN barcodes as vector PDFs
- Optional EAN-5 price supplement add-on
- Specify exact output width and height in millimetres
- Live canvas preview

## How It Works

All three tools run entirely in the browser with no server backend. The application:
- Uses [jsPDF 2.5.1](https://github.com/parallax/jsPDF) for vector PDF generation
- Performs all calculations client-side
- Saves generated PDFs directly to your computer
- Works offline once loaded

## Getting Started

### Installation

1. Download or clone this repository:
   ```bash
   git clone https://github.com/colingammon/coverspec-studio.git
   cd coverspec-studio
   ```

2. No build step needed! Simply open `index.html` in a modern browser:
   - **Local file:** Drag `index.html` onto your browser, or right-click → Open with
   - **Local server:** `python3 -m http.server 8000` (Python 3.x), then visit `http://localhost:8000`
   - **Deploy:** Copy the three files (`index.html`, `script.js`, `config.js`) to any static web server

### File Structure

```
.
├── index.html          # Markup, CSS, tab navigation
├── script.js           # All application logic (calculations, PDF generation, barcode encoding)
├── config.js           # Central configuration (branding, cover rules, alerts, production limits)
├── logo.png            # Brand logo (32–36px, transparent background) — optional
├── favicon-32x32.png   # Browser tab icon
├── favicon-16x16.png   # Browser tab icon
└── apple-touch-icon.png # iOS home screen icon
```

## Usage

### Cover Templates

1. Select your cover type (Limp, Limp with Flaps, Dust Jacket, or PPC)
2. Enter page trim dimensions (height × width in mm)
3. Enter paper grammage (gsm) and volume
4. Enter total extent (number of pages)
5. For flap covers, specify flap width; for jackets/PPC, select board thickness
6. Results update in real-time
7. Click **Download PDF Template** to save a to-scale PDF

The generated PDF is trim size (no bleed padding) with spine boundaries and fold guides as vector lines.

### Micron to Volume

1. Enter paper thickness in microns (µ)
2. Enter paper grammage in gsm
3. Volume is calculated instantly using: `(Microns ÷ Grammage) × 10`
4. Click **Copy Result** to copy to clipboard

### ISBN Barcode

1. Enter 13-digit ISBN (hyphens ignored; must start 978 or 979)
2. Optionally add a 5-digit EAN-5 price supplement
3. Set desired width and height in mm
4. Live preview updates as you type
5. Click **Download PDF Barcode** to save the barcode

## Customization

All production rules and user-facing messages live in **`config.js`**. Modify these without touching the JavaScript:

### Change Production Limits

```javascript
jacket: {
  maxSpineMm: 60,        // Alert if spine exceeds 60mm
  flapMin: 70,           // Alert if flap < 70mm
  flapMax: 100,          // Alert if flap > 100mm
  // ... other constraints
}
```

### Customize Alert Messages

```javascript
alerts: {
  spine60: '⚠ Spine too large — contact sales@example.com',
  // ... other messages
}
```

### Add Board Sizes

```javascript
boardThicknesses: [
  { label: 'Choose board size', value: 0 },
  { label: '1.5mm boards', value: 3 },
  { label: 'Custom boards', value: 4.2 },  // Add a new option
]
```

### Add PPC Subtypes

```javascript
ppc: {
  subtypes: {
    round: { label: 'Round Back', gutter: 8 },
    custom: { label: 'Custom Hollow', gutter: 7 },  // New subtype
  }
}
```

### White-Label

By default, the app displays "CoverSpec Studio" and "Production-Ready Cover Specs". To re-brand:

1. Replace `logo.png` with your brand logo (36px height, transparent background)
2. Update `CONFIG.brand.name` and `CONFIG.brand.tagline` in `config.js`:
   ```javascript
   brand: {
     name: 'Your Company Name',
     tagline: 'Your tagline here',
   }
   ```
3. Adjust `CONFIG.theme` colors to match your brand
4. All changes apply immediately—no build step needed

See `config.js` for a detailed customization guide.

## Spine Calculation Formulas

### Limp / Paperback

```
spine = round1dp((pages × gsm × volume) / 20000 + 0.65)
```

### Dust Jacket / PPC

```
spine = round((pages × gsm × volume) / 20000 + 0.50 + boardValue + bindingAdder)
```

- `boardValue` = total board thickness (both boards combined, mm)
- `bindingAdder` = 0 for Perfect Bound, 2 for Sewn

## Design System

The UI uses a hybrid theme:
- **Dark chrome:** header and tab bar (brand black)
- **Light content:** card and input surfaces (warm off-white)
- **Accent:** gold (#a58242) for buttons, highlights, and active states

All theme values (colors, typography, spacing, motion) are CSS custom properties defined in `config.js` and applied to `:root` at runtime. Fully responsive to light/dark mode preferences.

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge). Requires:
- ES6 JavaScript support
- Canvas API (for barcode preview)
- CSS Grid and Flexbox

## Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| jsPDF | 2.5.1 | Vector PDF generation |
| Montserrat | Google Fonts | Typography |

Both loaded from CDN. No npm install or build step needed.

## Known Limitations & Design Decisions

- **No bleed on the PDF page.** The page size equals trim size. Bleed instructions are provided as text notes, not visual guides.
- **No white background boxes behind text.** Text sits directly on section fills for a clean, minimal look.
- **Spine rounded before document width.** Rounding is applied immediately to prevent float precision errors between displayed spine and computed docW.
- **Board thickness required for Jacket/PPC.** An alert fires if the user forgets to select a board size, since the spine calculation is materially affected.
- **Height × Width convention.** All dimensions follow `H × W mm` to match industry standards for book formats.

## License

MIT License © 2024. See LICENSE file for full details.

**In short:** You're free to use this code for any purpose—commercial or personal—as long as you include the license and copyright notice. No warranty is provided.

## Credits

- **Original inspiration:** Reverse-engineered from Acrobat PDF calculator field action streams
- **PDF generation:** [jsPDF](https://github.com/parallax/jsPDF) by Parallax
- **Typography:** Montserrat by Julieta Ulanovsky via [Google Fonts](https://fonts.google.com/)

## Contributing

Found a bug? Have a feature request? Open an issue or submit a pull request.

## Support

For questions or issues:
1. Check the **Introduction** tab in the app for how-to guidance
2. Review the customization comments in `config.js` 
3. Open an issue on GitHub with a description and steps to reproduce

---

**Ready to get started?** Download, open `index.html`, and start generating production-ready cover specs!
