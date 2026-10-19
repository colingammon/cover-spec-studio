// ═══════════════════════════════════════════════════════════════════
// PDF TEMPLATES — CoverSpec Studio layout
// Slate spine, dotted safe-zone and fold guides, dimension arrows with
// plain-English notes. Drawing constants live in CONFIG.pdf (config.js);
// geometry comes from cvState (script.js), so the rules stay in one place.
//
// Each builder takes the calculated state and returns a jsPDF doc.
// Page size = document size exactly (no slug / crop marks) so the
// Fit to Graphic scripts size documents correctly.
// Depends on: CONFIG (config.js), cvFmt / cvFmtInt (script.js),
// window.jspdf.jsPDF.
// ═══════════════════════════════════════════════════════════════════

function pdfNewDoc(pageW, pageH) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: pageW >= pageH ? 'landscape' : 'portrait', unit: 'mm', format: [pageW, pageH], compress: true });
  const SF  = doc.internal.scaleFactor;
  doc.internal.getCurrentPageInfo().pageContext.trimBox =
    { bottomLeftX: 0, bottomLeftY: 0, topRightX: pageW * SF, topRightY: pageH * SF };
  return doc;
}

// Drawing kit bound to one doc. All units mm, font sizes pt.
function pdfKit(doc) {
  const P   = CONFIG.pdf;
  const PT  = 25.4 / 72;                       // mm per pt
  const capH = size => size * 0.72 * PT;       // Helvetica cap height in mm

  const stroke = (col, lw) => { doc.setDrawColor(...col); doc.setLineWidth(lw); };
  const fillC  = col => doc.setFillColor(...col);

  function line(x1, y1, x2, y2, col = P.ink, lw = P.lineW) {
    stroke(col, lw); doc.line(x1, y1, x2, y2);
  }
  // Round-capped zero-length dashes = dots
  function dotted(x1, y1, x2, y2, col = P.ink, lw = P.dotW) {
    stroke(col, lw); doc.setLineCap('round');
    doc.setLineDashPattern([0, P.dotGap], 0);
    doc.line(x1, y1, x2, y2);
    doc.setLineDashPattern([], 0); doc.setLineCap('butt');
  }
  function dashed(x1, y1, x2, y2, col = P.ink, lw = P.lineW) {
    stroke(col, lw); doc.setLineDashPattern([2, 1.5], 0);
    doc.line(x1, y1, x2, y2);
    doc.setLineDashPattern([], 0);
  }
  function rect(x, y, w, h, col, lw = P.lineW) { stroke(col, lw); doc.rect(x, y, w, h, 'S'); }
  function box(x, y, w, h, col) { fillC(col); doc.rect(x, y, w, h, 'F'); }

  // Dimension arrow; heads at both ends unless ends = 'end' / 'start'
  function arrow(x1, y1, x2, y2, ends = 'both') {
    const len = Math.hypot(x2 - x1, y2 - y1); if (!len) return;
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const hl = Math.min(P.headL, len / 3), hw = P.headW / 2;
    const head = (tx, ty, dx, dy) => {
      fillC(P.ink);
      doc.triangle(tx, ty, tx - dx * hl - dy * hw, ty - dy * hl + dx * hw, tx - dx * hl + dy * hw, ty - dy * hl - dx * hw, 'F');
    };
    const s = ends !== 'end', e = ends !== 'start';
    line(x1 + (s ? ux * hl * 0.8 : 0), y1 + (s ? uy * hl * 0.8 : 0), x2 - (e ? ux * hl * 0.8 : 0), y2 - (e ? uy * hl * 0.8 : 0), P.ink, P.arrowW);
    if (e) head(x2, y2, ux, uy);
    if (s) head(x1, y1, -ux, -uy);
  }

  function setFont(size, bold, col) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(...col);
  }
  const width = (s, size, bold) => { setFont(size, bold, P.ink); return doc.getTextWidth(s); };

  // Note text, wrapped to maxW. y = top of first line. Returns block height.
  function note(s, x, y, maxW, align = 'center', size = P.noteSize) {
    setFont(size, false, P.ink);
    const lines = doc.splitTextToSize(s, maxW);
    const lh = size * PT * 1.25;
    lines.forEach((l, i) => doc.text(l, x, y + capH(size) + i * lh, { align }));
    return lines.length * lh;
  }
  // Single line rotated 90°. dir 'down' reads top→bottom, 'up' reads bottom→top.
  // (cx, y) = centre of the strip across the text, start of text along it.
  function vnote(s, cx, y, dir = 'down', size = P.noteSize, maxLen = Infinity) {
    while (size > 5 && width(s, size) > maxLen) size -= 0.5;
    setFont(size, false, P.ink);
    const off = capH(size) / 2;
    if (dir === 'down') doc.text(s, cx - off, y, { angle: -90 });
    else                doc.text(s, cx + off, y, { angle: 90 });
  }
  // Letter-spaced display label centred on (cx, cy), shrunk to fit maxW
  function title(s, cx, cy, maxW, col = P.slate, size = P.titleSize, vertical = false) {
    const spaced = sz => width(s, sz, true) + (s.length - 1) * sz * P.titleTrack * PT;
    while (size > 8 && spaced(size) > maxW) size -= 1;
    if (size <= 8 && spaced(size) > maxW) return;
    const cs = size * P.titleTrack * PT, w = spaced(size), h = capH(size);
    setFont(size, true, col);
    if (!vertical) doc.text(s, cx - w / 2, cy + h / 2, { charSpace: cs });
    else           doc.text(s, cx + h / 2, cy + w / 2, { angle: 90, charSpace: cs });
  }
  // Font size at which a vertical title's cap height fits a strip of width w
  const titleFor = w => Math.min(P.titleSize, (w * 0.5) / (0.72 * PT));

  // Dotted safe-zone rectangle with an optional label sitting in a gap in the top or bottom edge
  // skip: 'left' | 'right' omits that side (e.g. where a hinge line already marks it)
  function safeRect(x, y, w, h, label, labelEdge = 'top', { cx = x + w / 2, skip } = {}) {
    const ly = labelEdge === 'top' ? y : y + h;
    if (label && w > 40) {
      const lw = Math.min(width(label, P.noteSize) + 6, w - 12);
      const gx1 = cx - lw / 2, gx2 = gx1 + lw;
      dotted(x, ly, gx1, ly); dotted(gx2, ly, x + w, ly);
      const other = labelEdge === 'top' ? y + h : y;
      dotted(x, other, x + w, other);
      note(label, cx, ly - capH(P.noteSize) / 2, lw - 4);
    } else {
      dotted(x, y, x + w, y); dotted(x, y + h, x + w, y + h);
    }
    if (skip !== 'left')  dotted(x, y, x, y + h);
    if (skip !== 'right') dotted(x + w, y, x + w, y + h);
  }

  // Job spec lines — title + key dimensions, small, left-aligned
  function spec(lines, x, y, maxW) {
    let yy = y;
    lines.forEach((l, i) => { yy += note(l, x, yy, maxW, 'left', i === 0 ? P.noteSize : P.specSize) + 0.6; });
  }

  return { line, dotted, dashed, rect, box, arrow, note, vnote, title, titleFor, safeRect, spec, width, capH };
}

// mm value without a trailing .0 (129.0 → 129, 20.3 → 20.3)
const mm = n => cvFmt(n).replace(/\.0$/, '');
const pdfTitleLine = mode => `${CONFIG.brand.name} — ${CONFIG.coverTypes[mode].templateTitle.replace(/^Cover Layout — /, '')}`;

// ── PAPERBACK ─────────────────────────────────────────────────────
function pdfBuildLimp(s) {
  const { pW, pH, spine, docW, docH } = s;
  const ct = CONFIG.coverTypes.limp, P = CONFIG.pdf, SZ = ct.safeZone, HG = ct.hinge;
  const doc = pdfNewDoc(docW, docH), k = pdfKit(doc);
  const bx = pW, fx = pW + spine, midY = docH / 2;

  k.box(bx, 0, spine, docH, P.slate);
  k.rect(0, 0, docW, docH, P.slate, 0.25);
  // Hinge lines 3mm onto each cover
  k.dashed(bx - HG, 0, bx - HG, docH); k.dashed(fx + HG, 0, fx + HG, docH);
  // Safe zones: 3mm from trim, inner edge at the hinge
  k.safeRect(SZ, SZ, pW - SZ - HG, docH - 2 * SZ, `No type or borders within ${SZ}mm of trim`, 'top', { skip: 'right' });
  k.safeRect(fx + HG, SZ, pW - SZ - HG, docH - 2 * SZ, `No type or borders within ${SZ}mm of trim`, 'bottom', { skip: 'left' });
  k.vnote(`${SZ}mm away from trim`, SZ / 2, docH * 0.92, 'up', P.noteSize, docH * 0.25);
  k.vnote(`${HG}mm hinge — avoid type`, bx - HG - 2.5, docH * 0.12, 'down', P.noteSize, docH * 0.35);
  k.vnote(`${HG}mm hinge — avoid type`, fx + HG + 2.5, docH * 0.12, 'down', P.noteSize, docH * 0.35);

  k.title('BACK',  pW / 2, midY - 12, pW - 20);
  k.title('FRONT', fx + pW / 2, midY - 12, pW - 20);
  if (spine >= 6) k.title('SPINE', bx + spine / 2, midY, docH * 0.5, P.white, k.titleFor(spine), true);

  // Trim width across the back, trim height down the front
  k.arrow(SZ, midY, bx, midY);
  k.note(`Trim width ${mm(pW)}mm`, pW / 2, midY + 2.5, pW - 20);
  const hx = fx + HG + 9;
  k.arrow(hx, 0, hx, docH);
  k.note(`Trim height ${mm(pH)}mm`, hx + 3, SZ + 8, Math.min(55, pW - 30), 'left');

  k.spec([pdfTitleLine('limp'),
    `Document ${mm(docH)} × ${mm(docW)}mm  ·  Spine ${mm(spine)}mm  ·  Page ${mm(docH)} × ${mm(pW)}mm`,
    ct.bleedNote], SZ + 4, docH - SZ - 16, pW - 2 * SZ - HG - 8);
  return doc;
}

// ── PAPERBACK WITH FLAPS ──────────────────────────────────────────
function pdfBuildFlaps(s) {
  const { pW, pH, spine, coverW, flapW, docW, docH } = s;
  const ct = CONFIG.coverTypes.flaps, P = CONFIG.pdf, SZ = ct.safeZone, HG = ct.hinge;
  const doc = pdfNewDoc(docW, docH), k = pdfKit(doc);
  const x1 = flapW, x2 = x1 + coverW, x3 = x2 + spine, x4 = x3 + coverW, midY = docH / 2;

  k.box(0, 0, flapW, docH, P.flapTint); k.box(x4, 0, flapW, docH, P.flapTint);
  k.box(x2, 0, spine, docH, P.slate);
  k.rect(0, 0, docW, docH, P.slate, 0.25);
  // Score lines at the flap folds, hinge lines beside the spine
  k.dashed(x1, 0, x1, docH); k.dashed(x4, 0, x4, docH);
  k.dashed(x2 - HG, 0, x2 - HG, docH); k.dashed(x3 + HG, 0, x3 + HG, docH);
  k.safeRect(x1 + SZ, SZ, coverW - SZ - HG, docH - 2 * SZ, `No type or borders within ${SZ}mm of edges`, 'top', { skip: 'right' });
  k.safeRect(x3 + HG, SZ, coverW - SZ - HG, docH - 2 * SZ, `No type or borders within ${SZ}mm of edges`, 'bottom', { skip: 'left' });
  k.safeRect(SZ, SZ, flapW - 2 * SZ, docH - 2 * SZ);
  k.safeRect(x4 + SZ, SZ, flapW - 2 * SZ, docH - 2 * SZ);
  k.vnote(`${HG}mm hinge — avoid type`, x2 - HG - 2.5, docH * 0.12, 'down', P.noteSize, docH * 0.35);
  k.vnote(`${HG}mm hinge — avoid type`, x3 + HG + 2.5, docH * 0.12, 'down', P.noteSize, docH * 0.35);
  k.vnote('Score / fold', x1 - SZ / 2, docH * 0.62, 'up', P.noteSize, docH * 0.2);
  k.vnote('Score / fold', x4 + SZ / 2, docH * 0.38, 'down', P.noteSize, docH * 0.2);

  k.title('BACK FLAP',  flapW / 2, midY, flapW - 12, P.slate, P.titleSize * 0.6);
  k.title('FRONT FLAP', x4 + flapW / 2, midY, flapW - 12, P.slate, P.titleSize * 0.6);
  k.title('BACK',  x1 + coverW / 2, midY - 12, coverW - 20);
  k.title('FRONT', x3 + coverW / 2, midY - 12, coverW - 20);
  if (spine >= 6) k.title('SPINE', x2 + spine / 2, midY, docH * 0.5, P.white, k.titleFor(spine), true);

  k.arrow(0, SZ + 6, x1, SZ + 6);
  k.note(`Flap ${mm(flapW)}mm`, flapW / 2, SZ + 8.5, flapW - 8);
  k.arrow(x4, SZ + 6, docW, SZ + 6);
  k.note(`Flap ${mm(flapW)}mm`, x4 + flapW / 2, SZ + 8.5, flapW - 8);
  k.arrow(x1, midY, x2, midY);
  k.note(`Cover panel ${mm(coverW)}mm (trim width + 1mm)`, x1 + coverW / 2, midY + 2.5, coverW - 20);

  k.spec([pdfTitleLine('flaps'),
    `Document ${mm(docH)} × ${mm(docW)}mm  ·  Spine ${mm(spine)}mm  ·  Flaps ${mm(flapW)}mm`,
    ct.bleedNote], x1 + SZ + 4, docH - SZ - 16, coverW - 2 * SZ - HG - 8);
  return doc;
}

// ── DUST JACKET (after jacket-wrapper.pdf) ────────────────────────
function pdfBuildJacket(s) {
  const { pW, pH, spine, coverW, flapW, TURN, docW, docH, boardVal } = s;
  const ct = CONFIG.coverTypes.jacket, P = CONFIG.pdf, SZ = ct.safeZone, OH = ct.boardOverhang;
  const doc = pdfNewDoc(docW, docH), k = pdfKit(doc);
  // flapW includes the turn-in; fv = flap beyond the turn-in
  const fv = flapW - TURN;
  const x1 = fv, x2 = flapW, x3 = x2 + coverW, x4 = x3 + spine, x5 = x4 + coverW, x6 = x5 + TURN;
  const midY = docH / 2;

  k.box(0, 0, fv, docH, P.flapTint); k.box(x6, 0, fv, docH, P.flapTint);
  k.box(x3, 0, spine, docH, P.slate);
  k.rect(0, 0, docW, docH, P.slate, 0.25);
  // Guides each side: turn-in limit, fold (trim + 3mm), trimmed book width
  [x1, x2, x2 + OH, x5 - OH, x5, x6].forEach(x => k.dotted(x, 0, x, docH));
  k.safeRect(SZ, SZ, docW - 2 * SZ, docH - 2 * SZ, `No type or borders within ${SZ}mm of the edges`, 'bottom', { cx: x2 + coverW / 2 });

  // Flap widths (including the turn-in) across the top
  const ay = SZ + 6;
  k.arrow(0, ay, x2, ay);
  k.note(`Flap ${mm(flapW)}mm including ${TURN}mm of colour turn-in`, x2 / 2, ay - 5, x2 - 6);
  k.arrow(x5, ay, docW, ay);
  k.note(`Flap ${mm(flapW)}mm including ${TURN}mm of colour turn-in`, x5 + (docW - x5) / 2, ay - 5, docW - x5 - 6);
  // 10mm turn-in strips
  const ty = ay + 12;
  k.arrow(x1, ty, x2, ty); k.note(`${TURN}mm`, x1 + TURN / 2, ty + 1.5, TURN + 4);
  k.arrow(x5, ty, x6, ty); k.note(`${TURN}mm`, x5 + TURN / 2, ty + 1.5, TURN + 4);
  const turnTxt = `${TURN}mm allowance for flap turn-in to be provided on both front and back`;
  k.vnote(turnTxt, x1 + TURN / 2, ty + 8, 'down', P.noteSize, docH - ty - 20);
  k.vnote(turnTxt, x5 + TURN / 2, ty + 8, 'down', P.noteSize, docH - ty - 20);

  // Jacket height down the back flap
  const hx = Math.min(8, fv / 4);
  k.arrow(hx, SZ + 12, hx, docH - SZ);
  k.note(`The height of the jacket is the trimmed book height plus 6mm: ${cvFmtInt(docH)}mm`, hx + 4 + (fv - hx - 8) / 2, docH - SZ - 22, fv - hx - 10);

  k.title('BACK',  x2 + coverW / 2, midY - 14, coverW - 24);
  k.title('FRONT', x4 + coverW / 2, midY - 14, coverW - 24);
  if (spine >= 6) k.title('SPINE', x3 + spine / 2, midY, docH * 0.5, P.white, k.titleFor(spine), true);

  // Front panel: trim width, centring width (+3), design extent (+13)
  const fy = docH * 0.66, gap = Math.max(9, docH * 0.08);
  k.arrow(x4, fy, x5 - OH, fy);
  k.note(`Trimmed book width ${mm(pW)}mm`, x4 + (coverW - OH) / 2, fy + 2.5, coverW - 16);
  k.arrow(x4, fy + gap, x5, fy + gap);
  k.note(`Design must be centred to this dimension on front and back (trim + ${OH}mm = ${mm(coverW)}mm)`, x4 + coverW / 2, fy + gap + 2.5, coverW - 16);
  k.arrow(x4, fy + 2 * gap, x6, fy + 2 * gap);
  k.note(`Design usually extends to here to allow for folding (trim + ${OH + TURN}mm = ${mm(coverW + TURN)}mm)`, x4 + coverW / 2, fy + 2 * gap + 2.5, coverW - 16);

  k.spec([pdfTitleLine('jacket'),
    `Document ${cvFmtInt(docH)} × ${cvFmtInt(docW)}mm  ·  Spine ${cvFmtInt(spine)}mm  ·  Boards ${boardVal / 2}mm`,
    ct.bleedNote], x2 + SZ + 4, docH - SZ - 18, coverW - 2 * SZ - 8);
  return doc;
}

// ── PRINTED PAPER CASE ────────────────────────────────────────────
function pdfBuildPPC(s) {
  const { pW, pH, spine, coverW, gutter, trimW, trimH, docW, docH, WRAP, boardVal, ppcType } = s;
  const ct = CONFIG.coverTypes.ppc, P = CONFIG.pdf;
  const sub = ct.subtypes[ppcType] || ct.subtypes.round;
  const doc = pdfNewDoc(docW, docH), k = pdfKit(doc);
  const x1 = WRAP, x2 = x1 + coverW, x3 = x2 + gutter, x4 = x3 + spine, x5 = x4 + gutter, x6 = x5 + coverW;
  const top = WRAP, bot = WRAP + trimH, midY = top + trimH / 2;
  const SE = ct.safeEdge, SS = ct.safeSpine;

  k.rect(0, 0, docW, docH, P.slate, 0.25);
  // Spine with 2mm lettering limits
  k.box(x3, top, spine, trimH, P.slate);
  if (spine >= 3 * SS) { k.dotted(x3 + SS, top, x3 + SS, bot, P.white); k.dotted(x4 - SS, top, x4 - SS, bot, P.white); }
  // Case boards and 4mm safe zones
  k.rect(x1, top, coverW, trimH, P.slate, 0.35);
  k.rect(x5, top, coverW, trimH, P.slate, 0.35);
  k.safeRect(x1 + SE, top + SE, coverW - 2 * SE, trimH - 2 * SE, `Non-bleed designs must be ${SE}mm away from trim`, 'top');
  k.safeRect(x5 + SE, top + SE, coverW - 2 * SE, trimH - 2 * SE, `Non-bleed designs must be ${SE}mm away from trim`, 'bottom');
  k.vnote(`${SE}mm away from trim`, x1 + SE / 2, bot - 12, 'up', P.noteSize, trimH * 0.3);
  k.vnote(`${SE}mm away from trim`, x6 - SE / 2, top + 12, 'down', P.noteSize, trimH * 0.3);

  // Turn-in arrows on all four edges
  const ta = x2 - 2;
  k.arrow(ta, 0, ta, top);
  k.vnote(`${WRAP}mm`, ta + 3, top / 2 - 3, 'down', P.noteSize);
  k.note(`${WRAP}mm extended background on all four edges for turn-in`, x3 + 3, top / 2 - 1.5, docW - x3 - 6, 'left');
  k.arrow(x5 + 2, bot, x5 + 2, docH);
  k.vnote(`${WRAP}mm`, x5 + 5, bot + (docH - bot) / 2 - 3, 'down', P.noteSize);
  k.arrow(0, midY, x1, midY);  k.note(`${WRAP}mm`, x1 / 2, midY + 2, x1);
  k.arrow(x6, midY, docW, midY); k.note(`${WRAP}mm`, x6 + WRAP / 2, midY + 2, WRAP);

  // Case joints
  const jy = top + 14;
  k.arrow(x2, jy, x3, jy); k.note(`${gutter}mm`, x2 + gutter / 2, jy + 1.5, gutter + 6);
  k.arrow(x4, jy, x5, jy); k.note(`${gutter}mm`, x4 + gutter / 2, jy + 1.5, gutter + 6);
  k.vnote(`Case joint allowance (${sub.label}) — ${gutter}mm`,
    x2 + gutter / 2, jy + 8, 'down', P.noteSize, trimH - 24);

  // Titles
  k.title('BACK',  x1 + coverW / 2, midY - 8, coverW - 2 * SE - 10);
  k.title('FRONT', x5 + coverW / 2, midY - 8, coverW - 2 * SE - 10);
  if (spine >= 6) k.title('SPINE', x3 + spine / 2, midY, trimH * 0.5, P.white, k.titleFor(spine - 2 * SS), true);

  // Back: board width
  k.arrow(x1, midY + 2, x2, midY + 2);
  k.note(`The case board width is the trim width less ${mm(pW - coverW)}mm: ${mm(coverW)}mm instead of ${mm(pW)}mm`, x1 + coverW / 2, midY + 5, coverW - 2 * SE - 8);
  // Front: board height
  const hx = x5 + SE + 5;
  k.arrow(hx, top, hx, bot);
  k.note(`The case board height is the trim height plus 6mm: ${cvFmtInt(trimH)}mm instead of ${mm(pH)}mm`, hx + 4, top + SE + 6, Math.min(70, coverW - 2 * SE - 14), 'left');
  // Round back: centre the front design between the safe lines
  if (ppcType !== 'flatback') {
    k.arrow(x5 + SE, midY + 2, x6 - SE, midY + 2);
    k.note('If the cover is designed to be centred on the front, centre the design between these two points', x5 + coverW / 2 + 4, midY + 5, coverW - 2 * SE - 18);
  }
  // Spine lettering rule, pointing into the spine
  const ly = bot - SE - 10;
  k.note(`Lettering on the spine must be at least ${SS}mm away from the edge of the spine`, x2 - 6, ly - 5, Math.min(60, coverW - 2 * SE - 10), 'right');
  k.arrow(x2 - 4, ly + 2, x3 + SS, ly + 2, 'end');

  // Job spec in the bottom turn-in
  k.spec([pdfTitleLine('ppc'),
    `Document ${cvFmtInt(docH)} × ${cvFmtInt(docW)}mm  ·  Case ${cvFmtInt(trimH)} × ${cvFmtInt(trimW)}mm  ·  Spine ${cvFmtInt(spine)}mm  ·  Joint ${gutter}mm  ·  Boards ${boardVal / 2}mm  ·  ${ct.bleedNote}`],
    x1, bot + 3, x2 - x1 + gutter);
  return doc;
}
