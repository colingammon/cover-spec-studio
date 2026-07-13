/* ═══════════════════════════════════════════════════════════════════
   svgGenerator.js — SVG template generation for cover layouts
   Mirrors PDF generation logic but outputs native SVG for Illustrator/Affinity
═══════════════════════════════════════════════════════════════════ */

function svgLimp(state) {
  const { pW, pH, spine, docW, docH } = state;
  const HINGE = 3;
  const pageW = docW;
  const pageH = docH;

  const bx = pW;
  const sx = pW + spine;
  const spineCx = pW + spine / 2;
  const midY = pageH / 2;
  const midBx = pW / 2;
  const midFx = sx + pW / 2;

  // SVG structure with improved text handling
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${pageW} ${pageH}" width="${pageW}mm" height="${pageH}mm" xmlns="http://www.w3.org/2000/svg">
<defs>
<style>
text { font-family: Arial, Helvetica, sans-serif; }
.label-main { font-size: 9px; font-weight: bold; fill: #dc0000; }
.label-sub { font-size: 7px; fill: #6e6e6e; }
.label-spine { font-size: 8px; font-weight: bold; fill: #c80000; }
.label-value { font-size: 6px; fill: #f05050; }
.label-notes { font-size: 7px; font-weight: bold; fill: #c80000; }
.guide-line { stroke: #505050; stroke-width: 0.3; }
.guide-spine { stroke: #505050; stroke-width: 0.3; stroke-dasharray: 3,2; }
</style>
</defs>

<!-- Page background -->
<rect width="${pageW}" height="${pageH}" fill="#ffffff"/>

<!-- Section fills -->
<g id="fills">
  <rect x="0" y="0" width="${pW}" height="${pageH}" fill="#e8e7e3"/>
  <rect x="${bx}" y="0" width="${spine}" height="${pageH}" fill="#d4d2cc"/>
  <rect x="${sx}" y="0" width="${pW}" height="${pageH}" fill="#eeede9"/>
</g>

<!-- Structure guides -->
<g id="guides">
  <!-- Page border -->
  <rect x="0" y="0" width="${pageW}" height="${pageH}" fill="none" stroke="#000000" stroke-width="0.4"/>

  <!-- Spine boundaries -->
  <line x1="${bx}" y1="0" x2="${bx}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>
  <line x1="${sx}" y1="0" x2="${sx}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>

  <!-- Spine centre -->
  <line x1="${spineCx}" y1="0" x2="${spineCx}" y2="${pageH}" class="guide-spine"/>

  <!-- Hinge lines -->
  <line x1="${bx - HINGE}" y1="0" x2="${bx - HINGE}" y2="${pageH}" class="guide-line" stroke-dasharray="2,1.5"/>
  <line x1="${sx + HINGE}" y1="0" x2="${sx + HINGE}" y2="${pageH}" class="guide-line" stroke-dasharray="2,1.5"/>
</g>

<!-- Back cover section -->
<g id="back-section">
  <text x="${midBx}" y="${midY - 6}" text-anchor="middle" class="label-main">BACK COVER</text>
  <text x="${midBx}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmt(docH)} × ${cvFmt(pW)} mm</text>
</g>

<!-- Front cover section -->
<g id="front-section">
  <text x="${midFx}" y="${midY - 6}" text-anchor="middle" class="label-main">FRONT COVER</text>
  <text x="${midFx}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmt(docH)} × ${cvFmt(pW)} mm</text>
</g>`;

  // Spine label (conditional on size)
  if (spine >= 10) {
    svg += `
<!-- Spine section -->
<g id="spine-section">
  <text x="${spineCx}" y="${midY - 6}" text-anchor="middle" class="label-spine">SPINE</text>
  <text x="${spineCx}" y="${midY + 8}" text-anchor="middle" class="label-value">${cvFmt(spine)} mm</text>
</g>`;
  } else if (spine >= 4) {
    svg += `
<!-- Small spine label -->
<g id="spine-section">
  <text x="${spineCx}" y="${midY}" text-anchor="middle" font-size="8" font-weight="bold" fill="#282828">${cvFmt(spine)} mm</text>
</g>`;
  }

  svg += `
<!-- Notes section -->
<g id="notes">
  <text x="${pageW / 2}" y="${pageH * 0.08 + 10}" text-anchor="middle" class="label-notes">A 3mm hinge will be created as part of the manufacturing process</text>
  <text x="${pageW / 2}" y="${pageH * 0.08 + 20}" text-anchor="middle" class="label-notes">Avoid type matter running into this area</text>
</g>

<!-- Info section -->
<g id="info">
  <text x="${pageW / 2}" y="${pageH * 0.84}" text-anchor="middle" class="label-notes">Cover Layout — Limp Cover Template</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 10}" text-anchor="middle" font-size="7" font-weight="bold" fill="#c80000">Document Size: ${cvFmt(docH)} × ${cvFmt(docW)} mm | Spine: ${cvFmt(spine)} mm</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 20}" text-anchor="middle" class="label-notes">Add 3mm bleed allowance to the document</text>
</g>

</svg>`;

  return svg;
}

function svgFlaps(state) {
  const { pW, pH, spine, coverW, flapW, docW, docH } = state;
  const HINGE = 3;
  const pageW = docW;
  const pageH = docH;

  const x1 = flapW;
  const x2 = x1 + coverW;
  const x3 = x2 + spine;
  const x4 = x3 + coverW;
  const spineCx = x2 + spine / 2;
  const midY = pageH / 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${pageW} ${pageH}" width="${pageW}mm" height="${pageH}mm" xmlns="http://www.w3.org/2000/svg">
<defs>
<style>
text { font-family: Arial, Helvetica, sans-serif; }
.label-main { font-size: 9px; font-weight: bold; fill: #dc0000; }
.label-sub { font-size: 7px; fill: #6e6e6e; }
.label-spine { font-size: 8px; font-weight: bold; fill: #c80000; }
.label-value { font-size: 6px; fill: #f05050; }
.label-notes { font-size: 7px; font-weight: bold; fill: #c80000; }
.guide-line { stroke: #505050; stroke-width: 0.3; }
.guide-spine { stroke: #505050; stroke-width: 0.3; stroke-dasharray: 3,2; }
</style>
</defs>

<rect width="${pageW}" height="${pageH}" fill="#ffffff"/>

<g id="fills">
  <rect x="0" y="0" width="${flapW}" height="${pageH}" fill="#e1e0dc"/>
  <rect x="${x1}" y="0" width="${coverW}" height="${pageH}" fill="#e8e7e3"/>
  <rect x="${x2}" y="0" width="${spine}" height="${pageH}" fill="#d4d2cc"/>
  <rect x="${x3}" y="0" width="${coverW}" height="${pageH}" fill="#eeede9"/>
  <rect x="${x4}" y="0" width="${flapW}" height="${pageH}" fill="#e1e0dc"/>
</g>

<g id="guides">
  <rect x="0" y="0" width="${pageW}" height="${pageH}" fill="none" stroke="#000000" stroke-width="0.4"/>
  <line x1="${x1}" y1="0" x2="${x1}" y2="${pageH}" class="guide-line" stroke-dasharray="3,2"/>
  <line x1="${x2}" y1="0" x2="${x2}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>
  <line x1="${x3}" y1="0" x2="${x3}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>
  <line x1="${x4}" y1="0" x2="${x4}" y2="${pageH}" class="guide-line" stroke-dasharray="3,2"/>
  <line x1="${spineCx}" y1="0" x2="${spineCx}" y2="${pageH}" class="guide-spine"/>
  <line x1="${x2 - HINGE}" y1="0" x2="${x2 - HINGE}" y2="${pageH}" class="guide-line" stroke-dasharray="2,1.5"/>
  <line x1="${x3 + HINGE}" y1="0" x2="${x3 + HINGE}" y2="${pageH}" class="guide-line" stroke-dasharray="2,1.5"/>
</g>

<g id="back-flap">
  <text x="${flapW / 2}" y="${midY}" text-anchor="middle" font-size="8" fill="#808080">BACK FLAP</text>
</g>

<g id="back-section">
  <text x="${x1 + coverW / 2}" y="${midY - 6}" text-anchor="middle" class="label-main">BACK COVER</text>
  <text x="${x1 + coverW / 2}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmt(docH)} × ${cvFmt(coverW)} mm</text>
</g>

<g id="front-section">
  <text x="${x3 + coverW / 2}" y="${midY - 6}" text-anchor="middle" class="label-main">FRONT COVER</text>
  <text x="${x3 + coverW / 2}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmt(docH)} × ${cvFmt(coverW)} mm</text>
</g>

<g id="front-flap">
  <text x="${x4 + flapW / 2}" y="${midY}" text-anchor="middle" font-size="8" fill="#808080">FRONT FLAP</text>
</g>

${spine >= 10 ? `<g id="spine-section">
  <text x="${spineCx}" y="${midY - 6}" text-anchor="middle" class="label-spine">SPINE</text>
  <text x="${spineCx}" y="${midY + 8}" text-anchor="middle" class="label-value">${cvFmt(spine)} mm</text>
</g>` : `<g id="spine-section">
  <text x="${spineCx}" y="${midY}" text-anchor="middle" font-size="8" fill="#282828">${cvFmt(spine)} mm</text>
</g>`}

<g id="notes">
  <text x="${pageW / 2}" y="${pageH * 0.08 + 10}" text-anchor="middle" class="label-notes">A 3mm hinge will be created as part of the manufacturing process</text>
  <text x="${pageW / 2}" y="${pageH * 0.08 + 20}" text-anchor="middle" class="label-notes">Ensure artwork extends to fold lines</text>
</g>

<g id="info">
  <text x="${pageW / 2}" y="${pageH * 0.84}" text-anchor="middle" class="label-notes">Cover Layout — Limp with Flaps (8pp) Template</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 10}" text-anchor="middle" font-size="7" font-weight="bold" fill="#c80000">Doc: ${cvFmt(docH)} × ${cvFmt(docW)} mm | Spine: ${cvFmt(spine)} mm | Flap: ${cvFmt(flapW)} mm</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 20}" text-anchor="middle" class="label-notes">Add 3mm bleed allowance to the document</text>
</g>

</svg>`;
  return svg;
}

function svgJacket(state) {
  const { pW, pH, spine, coverW, flapW, TURN, docW, docH } = state;
  const pageW = docW;
  const pageH = docH;

  const x1 = flapW;
  const x2 = x1 + TURN;
  const x3 = x2 + coverW;
  const x4 = x3 + spine;
  const x5 = x4 + coverW;
  const x6 = x5 + TURN;
  const spineCx = x3 + spine / 2;
  const midY = pageH / 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${pageW} ${pageH}" width="${pageW}mm" height="${pageH}mm" xmlns="http://www.w3.org/2000/svg">
<defs>
<style>
text { font-family: Arial, Helvetica, sans-serif; }
.label-main { font-size: 9px; font-weight: bold; fill: #dc0000; }
.label-sub { font-size: 7px; fill: #6e6e6e; }
.label-spine { font-size: 8px; font-weight: bold; fill: #c80000; }
.label-value { font-size: 6px; fill: #f05050; }
.label-notes { font-size: 7px; font-weight: bold; fill: #c80000; }
.guide-line { stroke: #505050; stroke-width: 0.3; }
.guide-spine { stroke: #505050; stroke-width: 0.3; stroke-dasharray: 3,2; }
</style>
</defs>

<rect width="${pageW}" height="${pageH}" fill="#ffffff"/>

<g id="fills">
  <rect x="0" y="0" width="${flapW}" height="${pageH}" fill="#deddce"/>
  <rect x="${x1}" y="0" width="${TURN}" height="${pageH}" fill="#e6e4de"/>
  <rect x="${x2}" y="0" width="${coverW}" height="${pageH}" fill="#e8e7e3"/>
  <rect x="${x3}" y="0" width="${spine}" height="${pageH}" fill="#d4d2cc"/>
  <rect x="${x4}" y="0" width="${coverW}" height="${pageH}" fill="#eeede9"/>
  <rect x="${x5}" y="0" width="${TURN}" height="${pageH}" fill="#e6e4de"/>
  <rect x="${x6}" y="0" width="${flapW}" height="${pageH}" fill="#deddce"/>
</g>

<g id="guides">
  <rect x="0" y="0" width="${pageW}" height="${pageH}" fill="none" stroke="#000000" stroke-width="0.4"/>
  <line x1="${x1}" y1="0" x2="${x1}" y2="${pageH}" class="guide-line" stroke-dasharray="3,2"/>
  <line x1="${x2}" y1="0" x2="${x2}" y2="${pageH}" class="guide-line" stroke-dasharray="3,2" stroke="#3c3c3c"/>
  <line x1="${x3}" y1="0" x2="${x3}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>
  <line x1="${x4}" y1="0" x2="${x4}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>
  <line x1="${x5}" y1="0" x2="${x5}" y2="${pageH}" class="guide-line" stroke-dasharray="3,2" stroke="#3c3c3c"/>
  <line x1="${x6}" y1="0" x2="${x6}" y2="${pageH}" class="guide-line" stroke-dasharray="3,2"/>
  <line x1="${spineCx}" y1="0" x2="${spineCx}" y2="${pageH}" class="guide-spine"/>
</g>

<g id="back-flap">
  <text x="${flapW / 2}" y="${midY}" text-anchor="middle" font-size="8" fill="#808080">BACK FLAP</text>
</g>

<g id="back-section">
  <text x="${x2 + coverW / 2}" y="${midY - 6}" text-anchor="middle" class="label-main">BACK COVER</text>
  <text x="${x2 + coverW / 2}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmt(docH)} × ${cvFmt(coverW)} mm</text>
</g>

<g id="front-section">
  <text x="${x4 + coverW / 2}" y="${midY - 6}" text-anchor="middle" class="label-main">FRONT COVER</text>
  <text x="${x4 + coverW / 2}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmt(docH)} × ${cvFmt(coverW)} mm</text>
</g>

<g id="front-flap">
  <text x="${x6 + flapW / 2}" y="${midY}" text-anchor="middle" font-size="8" fill="#808080">FRONT FLAP</text>
</g>

${spine >= 10 ? `<g id="spine-section">
  <text x="${spineCx}" y="${midY - 6}" text-anchor="middle" class="label-spine">SPINE</text>
  <text x="${spineCx}" y="${midY + 8}" text-anchor="middle" class="label-value">${cvFmtInt(spine)} mm</text>
</g>` : `<g id="spine-section">
  <text x="${spineCx}" y="${midY}" text-anchor="middle" font-size="8" fill="#282828">${cvFmtInt(spine)} mm</text>
</g>`}

<g id="notes">
  <text x="${pageW / 2}" y="${pageH * 0.08 + 10}" text-anchor="middle" class="label-notes">Ensure artwork extends into the 10mm turn-in allowance</text>
  <text x="${pageW / 2}" y="${pageH * 0.08 + 20}" text-anchor="middle" class="label-notes">Extend fore-edge bleeds into the turn-in area</text>
</g>

<g id="info">
  <text x="${pageW / 2}" y="${pageH * 0.84}" text-anchor="middle" class="label-notes">Cover Layout — Dust Jacket Template</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 10}" text-anchor="middle" font-size="7" font-weight="bold" fill="#c80000">Doc: ${cvFmtInt(docH)} × ${cvFmtInt(docW)} mm | Spine: ${cvFmtInt(spine)} mm | Flap: ${cvFmt(flapW)} mm</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 20}" text-anchor="middle" class="label-notes">Add 3mm bleed allowance to the document</text>
</g>

</svg>`;
  return svg;
}

function svgPPC(state) {
  const { pW, pH, spine, coverW, gutter, trimW, trimH, docW, docH, WRAP } = state;
  const pageW = docW;
  const pageH = docH;

  const x1 = WRAP;
  const x2 = x1 + coverW;
  const x3 = x2 + gutter;
  const x4 = x3 + spine;
  const x5 = x4 + gutter;
  const x6 = x5 + coverW;
  const trimTop = WRAP;
  const trimBot = pageH - WRAP;
  const spineCx = x3 + spine / 2;
  const midY = pageH / 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${pageW} ${pageH}" width="${pageW}mm" height="${pageH}mm" xmlns="http://www.w3.org/2000/svg">
<defs>
<style>
text { font-family: Arial, Helvetica, sans-serif; }
.label-main { font-size: 9px; font-weight: bold; fill: #dc0000; }
.label-sub { font-size: 7px; fill: #6e6e6e; }
.label-spine { font-size: 8px; font-weight: bold; fill: #c80000; }
.label-value { font-size: 6px; fill: #f05050; }
.label-notes { font-size: 7px; font-weight: bold; fill: #c80000; }
.guide-line { stroke: #505050; stroke-width: 0.3; }
.guide-spine { stroke: #505050; stroke-width: 0.3; stroke-dasharray: 3,2; }
</style>
</defs>

<rect width="${pageW}" height="${pageH}" fill="#ffffff"/>

<g id="fills">
  <rect x="0" y="0" width="${pageW}" height="${pageH}" fill="#e8e7e3"/>
  <rect x="${x1}" y="${trimTop}" width="${coverW}" height="${trimH}" fill="#eeecea"/>
  <rect x="${x3}" y="${trimTop}" width="${spine}" height="${trimH}" fill="#d4d2cc"/>
  <rect x="${x5}" y="${trimTop}" width="${coverW}" height="${trimH}" fill="#f3f2ee"/>
</g>

<g id="guides">
  <rect x="0" y="0" width="${pageW}" height="${pageH}" fill="none" stroke="#000000" stroke-width="0.4"/>
  <rect x="${x1}" y="${trimTop}" width="${trimW}" height="${trimH}" fill="none" stroke="#000000" stroke-width="0.35"/>
  <line x1="0" y1="${trimTop}" x2="${pageW}" y2="${trimTop}" class="guide-line"/>
  <line x1="0" y1="${trimBot}" x2="${pageW}" y2="${trimBot}" class="guide-line"/>
  <line x1="${x2}" y1="0" x2="${x2}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>
  <line x1="${x5}" y1="0" x2="${x5}" y2="${pageH}" stroke="#000000" stroke-width="0.5"/>
  <line x1="${x3}" y1="0" x2="${x3}" y2="${pageH}" class="guide-line" stroke-dasharray="2,1.5"/>
  <line x1="${x4}" y1="0" x2="${x4}" y2="${pageH}" class="guide-line" stroke-dasharray="2,1.5"/>
  <line x1="${spineCx}" y1="0" x2="${spineCx}" y2="${pageH}" class="guide-spine"/>
</g>

<g id="back-section">
  <text x="${x1 + coverW / 2}" y="${midY - 6}" text-anchor="middle" class="label-main">BACK COVER</text>
  <text x="${x1 + coverW / 2}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmtInt(trimH)} × ${cvFmt(coverW)} mm</text>
</g>

<g id="front-section">
  <text x="${x5 + coverW / 2}" y="${midY - 6}" text-anchor="middle" class="label-main">FRONT COVER</text>
  <text x="${x5 + coverW / 2}" y="${midY + 8}" text-anchor="middle" class="label-sub">${cvFmtInt(trimH)} × ${cvFmt(coverW)} mm</text>
</g>

${spine >= 10 ? `<g id="spine-section">
  <text x="${spineCx}" y="${midY - 6}" text-anchor="middle" class="label-spine">SPINE</text>
  <text x="${spineCx}" y="${midY + 8}" text-anchor="middle" class="label-value">${cvFmtInt(spine)} mm</text>
</g>` : `<g id="spine-section">
  <text x="${spineCx}" y="${midY}" text-anchor="middle" font-size="8" fill="#282828">${cvFmtInt(spine)} mm</text>
</g>`}

<g id="wraparound-labels">
  <text x="${x1 + trimW / 2}" y="${trimTop / 2 + 2}" text-anchor="middle" font-size="7" fill="#808080">${WRAP}mm wraparound</text>
  <text x="${x1 + trimW / 2}" y="${trimBot + 6}" text-anchor="middle" font-size="7" fill="#808080">${WRAP}mm wraparound</text>
</g>

<g id="gutter-labels">
  <text x="${x3 + gutter / 2}" y="${trimTop + 7}" text-anchor="middle" font-size="6" fill="#808080">${gutter}mm</text>
  <text x="${x4 + gutter / 2}" y="${trimTop + 7}" text-anchor="middle" font-size="6" fill="#808080">${gutter}mm</text>
</g>

<g id="notes">
  <text x="${pageW / 2}" y="${pageH * 0.08 + 10}" text-anchor="middle" class="label-notes">Avoid type matter going into the gutter allowance</text>
  <text x="${pageW / 2}" y="${pageH * 0.08 + 20}" text-anchor="middle" class="label-notes">Ensure artwork extends into the wraparound</text>
</g>

<g id="info">
  <text x="${pageW / 2}" y="${pageH * 0.84}" text-anchor="middle" class="label-notes">Cover Layout — PPC Template</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 10}" text-anchor="middle" font-size="7" font-weight="bold" fill="#c80000">Doc: ${cvFmtInt(docH)} × ${cvFmtInt(docW)} mm | Trim: ${cvFmtInt(trimH)} × ${cvFmtInt(trimW)} mm | Spine: ${cvFmtInt(spine)} mm</text>
  <text x="${pageW / 2}" y="${pageH * 0.84 + 20}" text-anchor="middle" class="label-notes">No additional bleed required — wraparound acts as bleed</text>
</g>

</svg>`;
  return svg;
}

function cvGenerateSVG() {
  if (!cvState) return;
  if (cvState.mode === 'limp') return svgLimp(cvState);
  if (cvState.mode === 'flaps') return svgFlaps(cvState);
  if (cvState.mode === 'jacket') return svgJacket(cvState);
  if (cvState.mode === 'ppc') return svgPPC(cvState);
  return null;
}

function cvDownloadSVG() {
  if (!cvState) return;
  const svgContent = cvGenerateSVG();
  if (!svgContent) return;

  const filename = `${cvState.mode}-template-${cvFmt(cvState.pW, 0)}x${cvFmt(cvState.docH, 0)}-sp${cvFmt(cvState.spine)}.svg`;
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
