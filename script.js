/* ═══════════════════════════════════════════════════════════════════
   script.js — Cover Layout Creator
   Spine calculations, PDF generation, barcode encoding, micron
   converter. Requires config.js and jsPDF to be loaded first.
═══════════════════════════════════════════════════════════════════ */

// ── Embedded Noto Sans font (subsetted: digits, hyphen, space, I S B N) ──────
const NOTO_SANS_B64 = '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';

function registerEmbeddedFont(pdf) {
  pdf.addFileToVFS('NotoSans-Regular.ttf', NOTO_SANS_B64);
  pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
}

// ═══════════════════════════════════════════════════════════════════
// EAN-13 / EAN-5 / EAN-2 ENCODING
// ═══════════════════════════════════════════════════════════════════

const L_PAT = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
const G_PAT = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
const R_PAT = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
const EAN13_PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
const EAN5_PARITY  = ['GGLLL','GLGLL','GLLGL','GLLLG','LGGLL','LLGGL','LLLGG','LGLGL','LLGLG','LGLLL'];
const EAN2_PARITY  = ['LL','LG','GL','GG'];

function encodeEAN13(digits13) {
  const d = digits13.split('').map(Number);
  const parity = EAN13_PARITY[d[0]];
  let bits = '101';
  for (let i = 0; i < 6; i++) bits += parity[i]==='L' ? L_PAT[d[i+1]] : G_PAT[d[i+1]];
  bits += '01010';
  for (let i = 7; i <= 12; i++) bits += R_PAT[d[i]];
  return bits + '101';
}
function encodeEAN5(digits5) {
  const d = digits5.split('').map(Number);
  const check = (3*d[0]+9*d[1]+3*d[2]+9*d[3]+3*d[4]) % 10;
  const parity = EAN5_PARITY[check];
  let bits = '01011';
  for (let i = 0; i < 5; i++) { if(i>0)bits+='01'; bits += parity[i]==='L' ? L_PAT[d[i]] : G_PAT[d[i]]; }
  return bits;
}
function encodeEAN2(digits2) {
  const d = digits2.split('').map(Number);
  const parity = EAN2_PARITY[(d[0]*10+d[1]) % 4];
  let bits = '01011';
  for (let i = 0; i < 2; i++) { if(i>0)bits+='01'; bits += parity[i]==='L' ? L_PAT[d[i]] : G_PAT[d[i]]; }
  return bits;
}
function encodeAddon(addon) {
  if (addon.length===2) return { bits: encodeEAN2(addon), modules:20, digitCount:2 };
  if (addon.length===5) return { bits: encodeEAN5(addon), modules:47, digitCount:5 };
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// ISBN UTILITIES
// ═══════════════════════════════════════════════════════════════════

function stripNonDigits(s) { return s.replace(/[^0-9]/g,''); }

function ean13CheckDigit(digits12) {
  let sum = 0;
  for (let i=0;i<12;i++) sum += parseInt(digits12[i]) * (i%2===0?1:3);
  return ((10-(sum%10))%10).toString();
}

function validateAndNormalise(raw) {
  const digits = stripNonDigits(raw);
  if (digits.length===13) {
    if (!digits.startsWith('978') && !digits.startsWith('979'))
      return { error: 'ISBN-13 must begin with 978 or 979.' };
    const expected = ean13CheckDigit(digits.slice(0,12));
    if (digits[12]!==expected)
      return { error: 'Invalid check digit. Expected '+expected+', got '+digits[12]+'.' };
    return { digits13: digits };
  }
  return { error: 'Enter 13 digits (hyphens ignored). Got '+digits.length+' digit(s).' };
}

function formatISBNDisplay(digits13) {
  const p = digits13;
  return 'ISBN '+p.slice(0,3)+'-'+p[3]+'-'+p.slice(4,7)+'-'+p.slice(7,12)+'-'+p[12];
}

// ═══════════════════════════════════════════════════════════════════
// BARCODE CANVAS RENDERER
// ═══════════════════════════════════════════════════════════════════

function renderBarcodeToContext(ctx, digits13, addon, originX, originY, widthPx, heightPx) {
  const addonEncoded = addon ? encodeAddon(addon) : null;
  const hasAddon = !!addonEncoded;
  const topLabel = formatISBNDisplay(digits13);

  function setFont(size, bold) {
    ctx.font = (bold?'bold ':'')+size+'px "Helvetica Neue",Helvetica,Arial,sans-serif';
  }

  const topFontSize = Math.max(1, heightPx*0.072);
  const numFontSize = Math.max(1, heightPx*0.080);
  const topTextH    = Math.round(topFontSize*1.5);
  const bottomTextH = Math.round(numFontSize*1.6);
  const barAreaH    = heightPx - topTextH - bottomTextH;
  const guardExtend = Math.round(bottomTextH*0.55);
  const mainBarH    = barAreaH;
  const guardBarH   = barAreaH + guardExtend;

  const mainModules  = 113;
  const addonModules = hasAddon ? (5 + addonEncoded.modules) : 0;
  const moduleW = widthPx / (mainModules + addonModules);

  const barcodeStartX = originX + 11*moduleW;
  const barY          = originY + topTextH;
  const addonStartX   = barcodeStartX + 100*moduleW;

  const mainBits = encodeEAN13(digits13);

  function isGuardModule(idx) {
    return (idx<=2)||(idx>=45&&idx<=49)||(idx>=92&&idx<=94);
  }

  ctx.fillStyle='#ffffff';
  ctx.fillRect(originX, originY, widthPx, heightPx);
  ctx.fillStyle='#000000';

  for (let i=0;i<mainBits.length;i++) {
    if (mainBits[i]==='1') {
      ctx.fillRect(barcodeStartX+i*moduleW, barY, moduleW, isGuardModule(i)?guardBarH:mainBarH);
    }
  }

  if (hasAddon) {
    const {bits:addonBits, digitCount} = addonEncoded;
    const addonNumFontSz = Math.max(5, Math.min(barAreaH*0.18, (addonEncoded.modules*moduleW)/digitCount*0.75));
    setFont(addonNumFontSz);
    ctx.textBaseline='top'; ctx.textAlign='center';
    const addonNumY = barY + barAreaH*0.03;
    const addonBarTopY = addonNumY + addonNumFontSz*1.25;
    for (let i=0;i<digitCount;i++) {
      const bitStart = 5+i*9;
      ctx.fillText(addon[i], addonStartX+(bitStart+3.5)*moduleW, addonNumY);
    }
    for (let i=0;i<addonBits.length;i++) {
      if(addonBits[i]==='1') ctx.fillRect(addonStartX+i*moduleW, addonBarTopY, moduleW, mainBarH*0.5);
    }
  }

  setFont(topFontSize, true);
  ctx.textAlign='left'; ctx.textBaseline='middle';
  ctx.fillText(topLabel, barcodeStartX, originY+topTextH*0.5);

  setFont(numFontSize);
  ctx.textBaseline='middle'; ctx.textAlign='center';
  const guardBottomY = barY + guardBarH;
  const numY = guardBottomY + bottomTextH*0.02;

  ctx.fillText(digits13[0], originX+(barcodeStartX-originX)*0.5, numY);
  for (let i=0;i<6;i++) ctx.fillText(digits13[i+1], barcodeStartX+(3+i*7+3.5)*moduleW, numY);
  for (let i=0;i<6;i++) ctx.fillText(digits13[i+7], barcodeStartX+(50+i*7+3.5)*moduleW, numY);
}

function renderBarcode(canvas, digits13, addon, widthPx, heightPx) {
  canvas.width=widthPx; canvas.height=heightPx;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,widthPx,heightPx);
  renderBarcodeToContext(ctx, digits13, addon, 0, 0, widthPx, heightPx);
}

// ═══════════════════════════════════════════════════════════════════
// BARCODE PDF RENDERER
// ═══════════════════════════════════════════════════════════════════

function renderBarcodeToPDF(pdf, digits13, addon, originX, originY, wMM, hMM) {
  const addonEncoded = addon ? encodeAddon(addon) : null;
  const hasAddon = !!addonEncoded;
  const topLabel = formatISBNDisplay(digits13);

  const topFontMM   = Math.max(0.5, hMM*0.072);
  const numFontMM   = Math.max(0.5, hMM*0.080);
  const topTextH    = topFontMM*1.5;
  const bottomTextH = numFontMM*1.6;
  const barAreaH    = hMM - topTextH - bottomTextH;
  const guardExtend = bottomTextH*0.55;
  const mainBarH    = barAreaH;
  const guardBarH   = barAreaH + guardExtend;

  const mainModules  = 113;
  const addonModules = hasAddon ? (5+addonEncoded.modules) : 0;
  const moduleW = wMM / (mainModules+addonModules);

  const barcodeStartX = originX + 11*moduleW;
  const barY          = originY + topTextH;
  const addonStartX   = barcodeStartX + 100*moduleW;

  const mainBits = encodeEAN13(digits13);

  function isGuardModule(idx) {
    return (idx<=2)||(idx>=45&&idx<=49)||(idx>=92&&idx<=94);
  }

  pdf.setFillColor(255,255,255);
  pdf.rect(originX, originY, wMM, hMM, 'F');
  pdf.setFillColor(0,0,0);

  for (let i=0;i<mainBits.length;i++) {
    if (mainBits[i]==='1') {
      pdf.rect(barcodeStartX+i*moduleW, barY, moduleW, isGuardModule(i)?guardBarH:mainBarH, 'F');
    }
  }

  if (hasAddon) {
    const {bits:addonBits, digitCount} = addonEncoded;
    const addonNumFontMM = Math.max(1.5, Math.min(barAreaH*0.18, (addonEncoded.modules*moduleW)/digitCount*0.75));
    pdf.setFontSize(addonNumFontMM*2.8346);
    const addonNumY    = barY + barAreaH*0.03;
    const addonBarTopY = addonNumY + addonNumFontMM*1.25;
    for (let i=0;i<digitCount;i++) {
      pdf.text(addon[i], addonStartX+(5+i*9+3.5)*moduleW, addonNumY+addonNumFontMM, {align:'center'});
    }
    for (let i=0;i<addonBits.length;i++) {
      if(addonBits[i]==='1') pdf.rect(addonStartX+i*moduleW, addonBarTopY, moduleW, mainBarH*0.5, 'F');
    }
  }

  pdf.setFontSize(topFontMM*1.15*2.8346);
  pdf.text(topLabel, barcodeStartX, originY+topTextH*0.5+topFontMM*0.35);

  pdf.setFontSize(numFontMM*2.8346);
  const guardBottomY = barY + guardBarH;
  const numY = guardBottomY + bottomTextH*0.02;

  pdf.text(digits13[0], originX+(barcodeStartX-originX)*0.5, numY, {align:'center'});
  for (let i=0;i<6;i++) pdf.text(digits13[i+1], barcodeStartX+(3+i*7+3.5)*moduleW, numY, {align:'center'});
  for (let i=0;i<6;i++) pdf.text(digits13[i+7], barcodeStartX+(50+i*7+3.5)*moduleW, numY, {align:'center'});
}

// ═══════════════════════════════════════════════════════════════════
// BARCODE UI
// ═══════════════════════════════════════════════════════════════════

let bcDigits13 = '', bcAddon = '';

function mmToPx(mm, dpi) { return Math.round(mm*dpi/25.4); }
function bcGetNum(id, fb) { const v=parseFloat(document.getElementById(id).value); return isNaN(v)?fb:v; }
function bcWidthMM()  { return Math.min(100, Math.max(20, bcGetNum('bcWidth',  38))); }
function bcHeightMM() { return Math.min(80,  Math.max(5,  bcGetNum('bcHeight', 27))); }

function bcShowError(msg) {
  const el = document.getElementById('bc-error');
  el.textContent = msg; el.style.display = 'block';
}
function bcHideError() { document.getElementById('bc-error').style.display = 'none'; }

function bcUpdatePreview() {
  const raw   = document.getElementById('bcIsbn').value.trim();
  const addon = document.getElementById('bcAddon').value.trim().replace(/\D/g,'');

  if (!raw) { bcHideError(); document.getElementById('bc-preview-wrap').style.display='none'; document.getElementById('bc-download').disabled=true; return; }

  const result = validateAndNormalise(raw);
  if (result.error) { bcShowError(result.error); document.getElementById('bc-preview-wrap').style.display='none'; document.getElementById('bc-download').disabled=true; return; }

  if (addon && addon.length!==5) { bcShowError('Add-on must be exactly 5 digits.'); return; }

  bcHideError();
  bcDigits13 = result.digits13;
  bcAddon    = addon || '';

  const wPx = mmToPx(bcWidthMM(), 96);
  const hPx = mmToPx(bcHeightMM(), 96);
  const canvas = document.getElementById('bc-canvas');
  renderBarcode(canvas, bcDigits13, bcAddon, wPx, hPx);
  document.getElementById('bc-preview-wrap').style.display = 'block';
  document.getElementById('bc-download').disabled = false;
  document.getElementById('bc-size-label').textContent = `${bcWidthMM()} × ${bcHeightMM()} mm`;
}

function bcDownloadPDF() {
  if (!bcDigits13) return;
  const {jsPDF} = window.jspdf;
  const wMM = bcWidthMM(), hMM = bcHeightMM();
  const pdf = new jsPDF({ orientation: wMM>hMM?'landscape':'portrait', unit:'mm', format:[wMM,hMM], putOnlyUsedFonts:true });
  registerEmbeddedFont(pdf);
  pdf.setFont('NotoSans','normal');
  renderBarcodeToPDF(pdf, bcDigits13, bcAddon, 0, 0, wMM, hMM);
  pdf.save('isbn-'+bcDigits13+(bcAddon?'-'+bcAddon:'')+'.pdf');
}

function bcClear() {
  ['bcIsbn','bcAddon'].forEach(id=>{ document.getElementById(id).value=''; });
  bcDigits13=''; bcAddon='';
  bcHideError();
  document.getElementById('bc-preview-wrap').style.display='none';
  document.getElementById('bc-download').disabled=true;
}

// ═══════════════════════════════════════════════════════════════════
// MICRON TO VOLUME CALCULATOR
// ═══════════════════════════════════════════════════════════════════

function mvCalculate() {
  const micron   = parseFloat(document.getElementById('mv-micron').value);
  const grammage = parseFloat(document.getElementById('mv-gsm').value);

  if (isNaN(micron)||isNaN(grammage)||micron<=0||grammage<=0) {
    document.getElementById('mv-result-wrap').style.display='none';
    document.getElementById('mv-copy').disabled=true;
    return;
  }
  const volume = (micron/grammage)*10;
  document.getElementById('mv-volume').textContent = volume.toFixed(1);
  document.getElementById('mv-result-wrap').style.display='block';
  document.getElementById('mv-copy').disabled=false;
}

function mvCopy() {
  const micron   = document.getElementById('mv-micron').value;
  const gsm      = document.getElementById('mv-gsm').value;
  const volume   = document.getElementById('mv-volume').textContent;
  const text     = `Micron: ${micron} µ\nGrammage: ${gsm} gsm\nVolume: ${volume}`;
  navigator.clipboard.writeText(text).then(()=>{
    const btn = document.getElementById('mv-copy');
    btn.textContent = 'Copied!';
    setTimeout(()=>{ btn.textContent='Copy Result'; }, 2000);
  });
}

function mvClear() {
  ['mv-micron','mv-gsm'].forEach(id=>{ document.getElementById(id).value=''; });
  document.getElementById('mv-result-wrap').style.display='none';
  document.getElementById('mv-copy').disabled=true;
}

// ═══════════════════════════════════════════════════════════════════
// COVER CALCULATOR — helpers
// ═══════════════════════════════════════════════════════════════════

function cvVal(id) { return parseFloat(document.getElementById(id).value)||0; }
function cvFmt(n,d=1) { const f=parseFloat(n.toFixed(d)); return d===1?f.toFixed(1):String(f); }
function cvFmtInt(n)  { return String(Math.round(n)); }

function cvCalcSpine(pages,gsm,vol,baseline,bindAdder=0,roundMm=false) {
  if(pages<=0||gsm<=0||vol<=0) return 0;
  const raw = (pages*gsm*vol)/20000 + baseline + bindAdder;
  return roundMm ? Math.round(raw) : Math.round(raw*10)/10;
}

// ── Shared jsPDF helpers ────────────────────────────────────────────
function cvMakeDoc(pageW,pageH) {
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({ orientation:pageW>=pageH?'landscape':'portrait', unit:'mm', format:[pageW,pageH], compress:true });
  const SF  = doc.internal.scaleFactor;
  const ctx = doc.internal.getCurrentPageInfo().pageContext;
  ctx.trimBox = { bottomLeftX:0, bottomLeftY:0, topRightX:pageW*SF, topRightY:pageH*SF };
  return doc;
}

function cvHelpers(doc) {
  const str  = (r,g,b,lw=0.3)=>{ doc.setDrawColor(r,g,b); doc.setLineWidth(lw); };
  const fill = (r,g,b)       =>  doc.setFillColor(r,g,b);
  const ln   = (x1,y1,x2,y2)=>  doc.line(x1,y1,x2,y2);
  function dash(x1,y1,x2,y2,on=3,off=2) {
    const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy); if(!len)return;
    const ux=dx/len,uy=dy/len; let d=0,draw=true;
    while(d<len){const seg=Math.min(draw?on:off,len-d);if(draw)doc.line(x1+ux*d,y1+uy*d,x1+ux*(d+seg),y1+uy*(d+seg));d+=seg;draw=!draw;}
  }
  function txt(x,y,s,size,bold,col,align='center',angle=0) {
    doc.setTextColor(...col);doc.setFontSize(size);
    doc.setFont('helvetica',bold?'bold':'normal');
    doc.text(s,x,y,{align,angle});
  }
  function notes(pageW,pageH,l1,l2) {
    const nY=pageH*CONFIG.pdf.noteY;
    txt(pageW/2,nY,    l1,11,true,[200,0,0]);
    txt(pageW/2,nY+5.5,l2,11,true,[200,0,0]);
  }
  function infoBlock(pageW,pageH,t1,t2,t3) {
    const iY=pageH*CONFIG.pdf.infoY;
    txt(pageW/2,iY,        t1,11,true,[200,0,0]);
    txt(pageW/2,iY+5.5,    t2,11,true,[200,0,0]);
    txt(pageW/2,iY+12.5,   t3,11,true,[200,0,0]);
  }
  return {str,fill,ln,dash,txt,notes,infoBlock};
}

// ═══════════════════════════════════════════════════════════════════
// COVER CALCULATOR — mode state & calculate()
// ═══════════════════════════════════════════════════════════════════

let cvMode  = 'limp';
let cvState = null;

const CORE_IDS = ['pHeight','pWidth','gsm','volume','numPages'];

function cvPopulateBoardSelect() {
  const sel = document.getElementById('boardThickness');
  sel.innerHTML = '';
  CONFIG.boardThicknesses.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.value;
    opt.textContent = b.label;
    sel.appendChild(opt);
  });
}

function cvInit() {
  cvPopulateBoardSelect();
  cvPopulatePaperPresets();
  cvUpdateSavedUI();
  CORE_IDS.forEach(id=>document.getElementById(id).addEventListener('input',cvCalculate));
  ['flapWidth','jacketFlapWidth','binding','boardThickness','ppcType'].forEach(id=>
    document.getElementById(id).addEventListener('input',cvCalculate));
  cvCalculate();
}

function cvSetMode(m) {
  cvMode = m;
  ['limp','flaps','jacket','ppc'].forEach(k=>{
    document.getElementById('btn-'+k).classList.toggle('active',k===m);
  });
  const show=(id,vis)=>document.getElementById(id).classList.toggle('visible',vis);
  show('sec-flapWidth',      m==='flaps');
  show('sec-jacketFlap',     m==='jacket');
  show('sec-binding',        m==='jacket'||m==='ppc');
  show('sec-boardThickness', m==='jacket'||m==='ppc');
  show('sec-ppcType',        m==='ppc');
  show('sec-ppcWrap',        m==='ppc');
  if(m==='ppc') document.getElementById('ppcWrap').value='15';
  ['limp','flaps','jacket','ppc'].forEach(k=>{
    document.getElementById('results-'+k).style.display=k===m?'':'none';
  });
  const notes={
    limp:   'PDF page = trim size. Hinge & spine guides included.',
    flaps:  'PDF page = trim size incl. flaps. Score & spine guides included.',
    jacket: 'PDF page = trim size incl. flaps & turn-ins. Fold guides included.',
    ppc:    'PDF page = full document size incl. wraparounds. Gutter & fold guides included.',
  };
  document.getElementById('footer-note').textContent=notes[m];
  cvCalculate();
}

function cvShowAlert(id,show) { document.getElementById(id).classList.toggle('show',show); }
function cvClearAlerts() {
  ['alert-spine-60','alert-spine-50','alert-docw-580',
   'alert-flap-min','alert-flap-max','alert-jktflap-min','alert-jktflap-max','alert-board-req','alert-required-fields']
  .forEach(id=>cvShowAlert(id,false));
}

function cvSetResult(id,val) { document.getElementById(id).textContent=val!==null?val:'—'; }

function cvUpdateSpec(hasData,rows) {
  const el=document.getElementById('pdf-spec'), em=document.getElementById('pdf-spec-empty');
  if(!hasData){el.classList.add('hidden');em.style.display='';return;}
  el.classList.remove('hidden');em.style.display='none';
  el.innerHTML=Object.entries(rows).filter(([,v])=>v!==null).map(([k,v])=>`${k}: <span>${v}</span>`).join('<br>');
}

function cvCalculate() {
  cvClearAlerts();
  const pH=cvVal('pHeight'),pW=cvVal('pWidth');
  const gsm=cvVal('gsm'),vol=cvVal('volume'),pages=cvVal('numPages');
  const hasCore=pW>0&&pH>0;

  // Check for required fields (mode-specific only) — only if user has entered dimensions
  if(hasCore) {
    const flapWidth=cvVal('flapWidth');
    const jacketFlapWidth=cvVal('jacketFlapWidth');

    let requiredFieldsMissing=false;
    if(cvMode==='flaps'&&flapWidth<=0) requiredFieldsMissing=true;
    if(cvMode==='jacket'&&(jacketFlapWidth<=0)) requiredFieldsMissing=true;

    if(requiredFieldsMissing) cvShowAlert('alert-required-fields',true);
  }

  if      (cvMode==='limp')   cvCalcLimp(pH,pW,gsm,vol,pages,hasCore);
  else if (cvMode==='flaps')  cvCalcFlaps(pH,pW,gsm,vol,pages,hasCore);
  else if (cvMode==='jacket') cvCalcJacket(pH,pW,gsm,vol,pages,hasCore);
  else if (cvMode==='ppc')    cvCalcPPC(pH,pW,gsm,vol,pages,hasCore);
  document.getElementById('btn-download').disabled=!cvState;
  document.getElementById('btn-specs').disabled=!cvState;
  document.getElementById('btn-save-calc').disabled=!cvState;
}

// ── LIMP ─────────────────────────────────────────────────────────
function cvCalcLimp(pH,pW,gsm,vol,pages,hasCore) {
  const spine=cvCalcSpine(pages,gsm,vol,0.65);
  const docW=hasCore?pW*2+spine:0, docH=pH;
  cvSetResult('r-limp-spine', spine>0||hasCore?cvFmt(spine):null);
  cvSetResult('r-limp-docW',  hasCore?cvFmt(docW):null);
  cvSetResult('r-limp-docH',  hasCore?cvFmt(docH):null);
  const spEl=document.getElementById('r-limp-spine');
  if(spine>60){cvShowAlert('alert-spine-60',true);spEl.style.color='var(--red)';}
  else spEl.style.color='';
  cvUpdateSpec(hasCore,{
    'Doc Size':  hasCore?`${cvFmt(docH)} × ${cvFmt(docW)} mm`:null,
    'Page Size': hasCore?`${cvFmt(docH)} × ${cvFmt(pW)} mm`:null,
    'Spine': cvFmt(spine)+' mm', 'Hinge':'3mm each side of spine', 'Bleed':'Add 3mm to all edges',
  });
  cvState=hasCore?{mode:'limp',pH,pW,spine,docW,docH}:null;
}

// ── FLAPS ─────────────────────────────────────────────────────────
function cvCalcFlaps(pH,pW,gsm,vol,pages,hasCore) {
  const spine=cvCalcSpine(pages,gsm,vol,0.65);
  const coverW=hasCore?pW+1:0, flapW=cvVal('flapWidth');
  const docW=hasCore?flapW+coverW+spine+coverW+flapW:0, docH=pH;
  cvSetResult('r-flaps-spine',  spine>0||hasCore?cvFmt(spine):null);
  cvSetResult('r-flaps-coverW', hasCore?cvFmt(coverW):null);
  cvSetResult('r-flaps-docW',   hasCore?cvFmt(docW):null);
  cvSetResult('r-flaps-docH',   hasCore?cvFmt(docH):null);
  const spEl=document.getElementById('r-flaps-spine');
  if(spine>50){cvShowAlert('alert-spine-50',true);spEl.style.color='var(--red)';}else spEl.style.color='';
  if(docW>580) cvShowAlert('alert-docw-580',true);
  if(flapW>0&&flapW<90) cvShowAlert('alert-flap-min',true);
  if(flapW>0&&pW>0&&flapW>pW-10) cvShowAlert('alert-flap-max',true);
  document.getElementById('flap-hint').textContent=pW>0?`Min 90mm — max ${pW-10}mm`:'Min 90mm — max = page width − 10mm';
  cvUpdateSpec(hasCore&&flapW>0,{
    'Doc Size':   hasCore?`${cvFmt(docH)} × ${cvFmt(docW)} mm`:null,
    'Cover Panel':hasCore?`${cvFmt(docH)} × ${cvFmt(coverW)} mm (+1mm tolerance)`:null,
    'Flap Width': flapW>0?`${cvFmt(flapW)} mm each`:null,
    'Spine':cvFmt(spine)+' mm','Score lines':'At flap/cover boundaries','Bleed':'Add 3mm to all edges',
  });
  cvState=(hasCore&&flapW>0)?{mode:'flaps',pH,pW,spine,coverW,flapW,docW,docH}:null;
}

// ── JACKET ────────────────────────────────────────────────────────
function cvCalcJacket(pH,pW,gsm,vol,pages,hasCore) {
  const bindAdder=parseFloat(document.getElementById('binding').value)||0;
  const boardVal=parseFloat(document.getElementById('boardThickness').value)||0;
  const spine=cvCalcSpine(pages,gsm,vol,0.50,bindAdder+boardVal,true);
  const coverW=hasCore?pW+4:0, flapW=cvVal('jacketFlapWidth'), TURN=10;
  const docW=hasCore?flapW+TURN+coverW+spine+coverW+TURN+flapW:0, docH=hasCore?pH+6:0;
  cvSetResult('r-jkt-spine',  spine>0||hasCore?cvFmtInt(spine):null);
  cvSetResult('r-jkt-coverW', hasCore?cvFmt(coverW):null);
  cvSetResult('r-jkt-docW',   hasCore?cvFmtInt(docW):null);
  cvSetResult('r-jkt-docH',   hasCore?cvFmtInt(docH):null);
  const spEl=document.getElementById('r-jkt-spine');
  if(spine>60){cvShowAlert('alert-spine-60',true);spEl.style.color='var(--red)';}else spEl.style.color='';
  if(boardVal===0&&hasCore) cvShowAlert('alert-board-req',true);
  if(flapW>0&&flapW<70)  cvShowAlert('alert-jktflap-min',true);
  if(flapW>0&&flapW>100) cvShowAlert('alert-jktflap-max',true);
  cvUpdateSpec(hasCore&&flapW>0,{
    'Doc Size':   hasCore?`${cvFmtInt(docH)} × ${cvFmtInt(docW)} mm`:null,
    'Cover Panel':hasCore?`${cvFmtInt(docH)} × ${cvFmt(coverW)} mm (+4mm overhang)`:null,
    'Flap Width': flapW>0?`${cvFmt(flapW)} mm each`:null,
    'Board':boardVal>0?`${boardVal}mm (both boards combined)`:'Not selected',
    'Turn-in':`${TURN}mm each side (fixed)`,'Spine':cvFmtInt(spine)+' mm (rounded to mm)','Bleed':'Add 3mm to all edges',
  });
  cvState=(hasCore&&flapW>0)?{mode:'jacket',pH,pW,spine,coverW,flapW,TURN,docW,docH,boardVal}:null;
}

// ── PPC ───────────────────────────────────────────────────────────
function cvCalcPPC(pH,pW,gsm,vol,pages,hasCore) {
  const ppcType=document.getElementById('ppcType').value;
  const bindAdder=parseFloat(document.getElementById('binding').value)||0;
  const boardVal=parseFloat(document.getElementById('boardThickness').value)||0;
  const gutter=CONFIG.coverTypes.ppc.subtypes[ppcType]?.gutter||8;
  const wrap=parseFloat(document.getElementById('ppcWrap').value)||15;
  const coverW=hasCore?pW-gutter:0;
  const spine=cvCalcSpine(pages,gsm,vol,0.50,bindAdder+boardVal,true);
  const trimW=hasCore?Math.round(coverW+gutter+spine+gutter+coverW):0;
  const trimH=hasCore?Math.round(pH+6):0;
  const docW=hasCore?wrap+coverW+gutter+spine+gutter+coverW+wrap:0;
  const docH=hasCore?pH+wrap+wrap+6:0;
  cvSetResult('r-ppc-spine', spine>0||hasCore?cvFmtInt(spine):null);
  cvSetResult('r-ppc-trimW', hasCore?cvFmtInt(trimW):null);
  cvSetResult('r-ppc-trimH', hasCore?cvFmtInt(trimH):null);
  cvSetResult('r-ppc-docW',  hasCore?cvFmtInt(docW):null);
  cvSetResult('r-ppc-docH',  hasCore?cvFmtInt(docH):null);
  const spEl=document.getElementById('r-ppc-spine');
  if(spine>60){cvShowAlert('alert-spine-60',true);spEl.style.color='var(--red)';}else spEl.style.color='';
  if(boardVal===0&&hasCore) cvShowAlert('alert-board-req',true);
  const typeLabels={round:'Round Back',presspahn:'Presspahn Hollow',flatback:'Flat Back Board Hollow'};
  cvUpdateSpec(hasCore,{
    'Type':typeLabels[ppcType],
    'Doc Size':hasCore?`${cvFmtInt(docH)} × ${cvFmtInt(docW)} mm`:null,
    'Trim Size':hasCore?`${cvFmtInt(trimH)} × ${cvFmtInt(trimW)} mm`:null,
    'Spine':cvFmtInt(spine)+' mm (rounded to mm)',
    'Board':boardVal>0?`${boardVal}mm (both boards combined)`:'Not selected',
    'Gutter':gutter+'mm each side — avoid type in this area',
    'Wraparound':`${wrap}mm all sides (top, bottom, front & back)`,
  });
  cvState=hasCore?{mode:'ppc',pH,pW,spine,coverW,gutter,trimW,trimH,docW,docH,WRAP:wrap,boardVal}:null;
}

// ═══════════════════════════════════════════════════════════════════
// PDF GENERATION
// ═══════════════════════════════════════════════════════════════════

function cvGeneratePDF() {
  if(!cvState) return;
  if      (cvState.mode==='limp')   pdfLimp();
  else if (cvState.mode==='flaps')  pdfFlaps();
  else if (cvState.mode==='jacket') pdfJacket();
  else if (cvState.mode==='ppc')    pdfPPC();
}

// ── LIMP ──────────────────────────────────────────────────────────
function pdfLimp() {
  const {pW,pH,spine,docW,docH}=cvState;
  const HINGE=3,pageW=docW,pageH=docH;
  const doc=cvMakeDoc(pageW,pageH);
  const {str,fill,ln,dash,txt,notes,infoBlock}=cvHelpers(doc);
  const bx=pW,sx=pW+spine,spineCx=pW+spine/2;
  const midY=pageH/2,midBx=pW/2,midFx=sx+pW/2;

  fill(232,231,227);doc.rect(0,0,pW,pageH,'F');
  fill(212,210,204);doc.rect(bx,0,spine,pageH,'F');
  fill(238,237,233);doc.rect(sx,0,pW,pageH,'F');
  str(0,0,0,0.4);doc.rect(0,0,pageW,pageH,'S');
  str(0,0,0,0.5);ln(bx,0,bx,pageH);ln(sx,0,sx,pageH);
  str(80,80,80,0.3);dash(spineCx,0,spineCx,pageH,3,2);
  str(80,80,80,0.3);dash(bx-HINGE,0,bx-HINGE,pageH,2,1.5);dash(sx+HINGE,0,sx+HINGE,pageH,2,1.5);

  txt(midBx,midY-5,'BACK COVER',14,true,[220,0,0]);
  txt(midBx,midY+5,`${cvFmt(docH)} × ${cvFmt(pW)} mm`,10,false,[110,110,110]);
  txt(midFx,midY-5,'FRONT COVER',14,true,[220,0,0]);
  txt(midFx,midY+5,`${cvFmt(docH)} × ${cvFmt(pW)} mm`,10,false,[110,110,110]);
  if(spine>=10){txt(spineCx,midY-4,'SPINE',11,true,[200,0,0]);txt(spineCx,midY+5,`${cvFmt(spine)} mm`,9,false,[240,80,80]);}
  else if(spine>=4){txt(spineCx,midY,`${cvFmt(spine)}mm`,8,true,[40,40,40],'center',90);}

  notes(pageW,pageH,'A 3mm hinge will be created as part of the manufacturing process','Avoid type matter running into this area');
  infoBlock(pageW,pageH,
    'Cover Layout — Limp Cover Template',
    `Document Size: ${cvFmt(docH)} × ${cvFmt(docW)} mm  |  Spine: ${cvFmt(spine)} mm  |  Page: ${cvFmt(docH)} × ${cvFmt(pW)} mm`,
    'Add 3mm bleed allowance to the document');
  doc.save(`limp-template-${cvFmt(pW,0)}x${cvFmt(docH,0)}-sp${cvFmt(spine)}.pdf`);
}

// ── FLAPS ─────────────────────────────────────────────────────────
function pdfFlaps() {
  const {pW,pH,spine,coverW,flapW,docW,docH}=cvState;
  const HINGE=3,pageW=docW,pageH=docH;
  const doc=cvMakeDoc(pageW,pageH);
  const {str,fill,ln,dash,txt,notes,infoBlock}=cvHelpers(doc);

  const x1=flapW, x2=x1+coverW, x3=x2+spine, x4=x3+coverW;
  const spineCx=x2+spine/2, midY=pageH/2;

  fill(225,224,220);doc.rect(0,0,flapW,pageH,'F');
  fill(232,231,227);doc.rect(x1,0,coverW,pageH,'F');
  fill(212,210,204);doc.rect(x2,0,spine,pageH,'F');
  fill(238,237,233);doc.rect(x3,0,coverW,pageH,'F');
  fill(225,224,220);doc.rect(x4,0,flapW,pageH,'F');

  str(0,0,0,0.4);doc.rect(0,0,pageW,pageH,'S');
  // Score/fold lines — dashed (not solid)
  str(0,0,0,0.5);dash(x1,0,x1,pageH,3,2);dash(x4,0,x4,pageH,3,2);
  // Spine boundaries — solid
  str(0,0,0,0.4);ln(x2,0,x2,pageH);ln(x3,0,x3,pageH);
  // Spine centre
  str(80,80,80,0.3);dash(spineCx,0,spineCx,pageH,3,2);
  // Hinge lines
  str(80,80,80,0.3);dash(x2-HINGE,0,x2-HINGE,pageH,2,1.5);dash(x3+HINGE,0,x3+HINGE,pageH,2,1.5);

  // Panel labels — no FOLD annotations
  txt(flapW/2,     midY,'BACK FLAP',  11,true,[80,80,80]);
  txt(x1+coverW/2, midY-5,'BACK COVER',14,true,[220,0,0]);
  txt(x1+coverW/2, midY+5,`${cvFmt(docH)} × ${cvFmt(coverW)} mm`,10,false,[110,110,110]);
  txt(x3+coverW/2, midY-5,'FRONT COVER',14,true,[220,0,0]);
  txt(x3+coverW/2, midY+5,`${cvFmt(docH)} × ${cvFmt(coverW)} mm`,10,false,[110,110,110]);
  txt(x4+flapW/2,  midY,'FRONT FLAP', 11,true,[80,80,80]);
  if(spine>=10){txt(spineCx,midY-4,'SPINE',10,true,[200,0,0]);txt(spineCx,midY+4,`${cvFmt(spine)} mm`,8,false,[240,80,80]);}
  else if(spine>=4){txt(spineCx,midY,`${cvFmt(spine)}mm`,7,true,[40,40,40],'center',90);}

  notes(pageW,pageH,'A 3mm hinge will be created as part of the manufacturing process','Avoid type matter running into this area — ensure artwork extends to fold');
  infoBlock(pageW,pageH,
    'Cover Layout — Limp with Flaps (8pp) Template',
    `Doc: ${cvFmt(docH)} × ${cvFmt(docW)} mm  |  Spine: ${cvFmt(spine)} mm  |  Flap: ${cvFmt(flapW)} mm`,
    'Add 3mm bleed allowance to the document');
  doc.save(`flaps-template-${cvFmt(pW,0)}x${cvFmt(docH,0)}-sp${cvFmt(spine)}.pdf`);
}

// ── JACKET ────────────────────────────────────────────────────────
function pdfJacket() {
  const {pW,pH,spine,coverW,flapW,TURN,docW,docH}=cvState;
  const pageW=docW,pageH=docH;
  const doc=cvMakeDoc(pageW,pageH);
  const {str,fill,ln,dash,txt,infoBlock}=cvHelpers(doc);

  const x1=flapW, x2=x1+TURN, x3=x2+coverW, x4=x3+spine, x5=x4+coverW, x6=x5+TURN;
  const spineCx=x3+spine/2, midY=pageH/2;

  fill(222,220,214);doc.rect(0,0,flapW,pageH,'F');
  fill(230,228,222);doc.rect(x1,0,TURN,pageH,'F');
  fill(232,231,227);doc.rect(x2,0,coverW,pageH,'F');
  fill(212,210,204);doc.rect(x3,0,spine,pageH,'F');
  fill(238,237,233);doc.rect(x4,0,coverW,pageH,'F');
  fill(230,228,222);doc.rect(x5,0,TURN,pageH,'F');
  fill(222,220,214);doc.rect(x6,0,flapW,pageH,'F');

  str(0,0,0,0.4);doc.rect(0,0,pageW,pageH,'S');
  // Fold lines — dashed (not solid), no FOLD annotations
  str(0,0,0,0.5);dash(x1,0,x1,pageH,3,2);dash(x6,0,x6,pageH,3,2);
  // Turn-in lines — dashed
  str(60,60,60,0.35);dash(x2,0,x2,pageH,3,2);dash(x5,0,x5,pageH,3,2);
  // Spine boundaries — solid
  str(0,0,0,0.4);ln(x3,0,x3,pageH);ln(x4,0,x4,pageH);
  // Spine centre
  str(80,80,80,0.3);dash(spineCx,0,spineCx,pageH,3,2);

  // Panel labels — no TURN-IN vertical annotations
  txt(flapW/2,     midY,'BACK FLAP',  11,true,[80,80,80]);
  txt(x2+coverW/2, midY-5,'BACK COVER',14,true,[220,0,0]);
  txt(x2+coverW/2, midY+5,`${cvFmtInt(docH)} × ${cvFmt(coverW)} mm`,10,false,[110,110,110]);
  txt(x4+coverW/2, midY-5,'FRONT COVER',14,true,[220,0,0]);
  txt(x4+coverW/2, midY+5,`${cvFmtInt(docH)} × ${cvFmt(coverW)} mm`,10,false,[110,110,110]);
  txt(x6+flapW/2,  midY,'FRONT FLAP', 11,true,[80,80,80]);
  if(spine>=10){txt(spineCx,midY-4,'SPINE',10,true,[200,0,0]);txt(spineCx,midY+4,`${cvFmtInt(spine)} mm`,8,false,[240,80,80]);}
  else if(spine>=4){txt(spineCx,midY,`${cvFmtInt(spine)}mm`,7,true,[40,40,40],'center',90);}

  const nY=pageH*CONFIG.pdf.noteY;
  txt(pageW/2,nY,    'Ensure artwork extends into the 10mm turn-in allowance',11,true,[200,0,0]);
  txt(pageW/2,nY+5.5,'Extend fore-edge bleeds into the turn-in area',11,true,[200,0,0]);
  infoBlock(pageW,pageH,
    'Cover Layout — Dust Jacket Template',
    `Doc: ${cvFmtInt(docH)} × ${cvFmtInt(docW)} mm  |  Spine: ${cvFmtInt(spine)} mm  |  Flap: ${cvFmt(flapW)} mm  |  Boards: ${cvState.boardVal}mm`,
    'Add 3mm bleed allowance to the document');
  doc.save(`jacket-template-${cvFmt(pW,0)}x${cvFmt(pH,0)}-sp${cvFmtInt(spine)}.pdf`);
}

// ── PPC ───────────────────────────────────────────────────────────
function pdfPPC() {
  const {pW,pH,spine,coverW,gutter,trimW,trimH,docW,docH,WRAP}=cvState;
  const pageW=docW,pageH=docH;
  const doc=cvMakeDoc(pageW,pageH);
  const {str,fill,ln,dash,txt,infoBlock}=cvHelpers(doc);

  const x1=WRAP, x2=x1+coverW, x3=x2+gutter, x4=x3+spine, x5=x4+gutter, x6=x5+coverW;
  const trimTop=WRAP, trimBot=pageH-WRAP;
  const spineCx=x3+spine/2, midY=pageH/2;

  fill(232,231,227);doc.rect(0,0,pageW,pageH,'F');
  fill(238,237,234);doc.rect(x1,trimTop,coverW,trimH,'F');
  fill(212,210,204);doc.rect(x3,trimTop,spine,trimH,'F');
  fill(243,242,238);doc.rect(x5,trimTop,coverW,trimH,'F');

  str(0,0,0,0.4);doc.rect(0,0,pageW,pageH,'S');
  str(0,0,0,0.35);doc.rect(x1,trimTop,trimW,trimH,'S');
  str(0,0,0,0.3);ln(0,trimTop,pageW,trimTop);ln(0,trimBot,pageW,trimBot);
  // Spine boundaries — solid
  str(0,0,0,0.5);ln(x2,0,x2,pageH);ln(x5,0,x5,pageH);
  // Gutter lines — dashed
  str(80,80,80,0.3);dash(x3,0,x3,pageH,2,1.5);dash(x4,0,x4,pageH,2,1.5);
  // Spine centre
  str(80,80,80,0.25);dash(spineCx,0,spineCx,pageH,3,2);

  // Wraparound labels (horizontal only — no vertical annotations)
  txt(x1+trimW/2, trimTop/2+3,   `${WRAP}mm wraparound (all sides)`,9,true,[80,80,80]);
  txt(x1+trimW/2, trimBot+7,     `${WRAP}mm wraparound (all sides)`,9,true,[80,80,80]);

  // Panel labels — no vertical FOLD annotations, no vertical side labels
  txt(x1+coverW/2, midY-5,'BACK COVER',  14,true,[220,0,0]);
  txt(x1+coverW/2, midY+5,`${cvFmtInt(trimH)} × ${cvFmt(coverW)} mm`,10,false,[110,110,110]);
  txt(x5+coverW/2, midY-5,'FRONT COVER', 14,true,[220,0,0]);
  txt(x5+coverW/2, midY+5,`${cvFmtInt(trimH)} × ${cvFmt(coverW)} mm`,10,false,[110,110,110]);
  if(spine>=10){txt(spineCx,midY-4,'SPINE',10,true,[200,0,0]);txt(spineCx,midY+4,`${cvFmtInt(spine)} mm`,8,false,[240,80,80]);}
  else if(spine>=4){txt(spineCx,midY,`${cvFmtInt(spine)}mm`,7,true,[40,40,40],'center',90);}

  // Gutter dimension labels
  txt(x2+gutter/2, trimTop+8,`${gutter}mm`,8,true,[80,80,80]);
  txt(x4+gutter/2, trimTop+8,`${gutter}mm`,8,true,[80,80,80]);

  const nY=pageH*CONFIG.pdf.noteY;
  txt(pageW/2,nY,    'Avoid type matter going into the gutter allowance',11,true,[200,0,0]);
  txt(pageW/2,nY+5.5,'Ensure artwork extends into the 15mm wraparound',11,true,[200,0,0]);
  infoBlock(pageW,pageH,
    'Cover Layout — PPC Template',
    `Doc: ${cvFmtInt(docH)} × ${cvFmtInt(docW)} mm  |  Trim: ${cvFmtInt(trimH)} × ${cvFmtInt(trimW)} mm  |  Spine: ${cvFmtInt(spine)} mm  |  Gutter: ${gutter}mm  |  Boards: ${cvState.boardVal}mm`,
    'No additional bleed required — wraparound acts as bleed');
  doc.save(`ppc-template-${cvFmt(pW,0)}x${cvFmt(pH,0)}-sp${cvFmtInt(spine)}.pdf`);
}

// ── DOWNLOAD SPECS TEXT FILE ──────────────────────────────────────
function cvDownloadSpecs() {
  if (!cvState) return;

  const pH = cvVal('pHeight');
  const pW = cvVal('pWidth');
  const gsm = cvVal('gsm');
  const vol = cvVal('volume');
  const pages = cvVal('numPages');
  const now = new Date();

  // Build specs text
  let specs = `COVERSPEC STUDIO — Production-Ready Cover Specifications\n`;
  specs += `Generated: ${now.toLocaleString()}\n`;
  specs += `\n${'='.repeat(60)}\n\n`;

  specs += `COVER TYPE\n`;
  specs += `${'-'.repeat(60)}\n`;
  specs += `TYPE: ${cvMode.charAt(0).toUpperCase() + cvMode.slice(1)}\n\n`;

  specs += `PAGE DIMENSIONS\n`;
  specs += `${'-'.repeat(60)}\n`;
  specs += `Trim Height: ${pH} mm\n`;
  specs += `Trim Width: ${pW} mm\n\n`;

  specs += `PAPER SPECIFICATION\n`;
  specs += `${'-'.repeat(60)}\n`;
  specs += `Grammage: ${gsm} gsm\n`;
  specs += `Volume: ${vol}\n`;
  specs += `Number of Pages: ${pages} pp\n\n`;

  // Add mode-specific inputs
  if (cvMode === 'flaps') {
    const flapW = cvVal('flapWidth');
    specs += `FLAP SPECIFICATION\n`;
    specs += `${'-'.repeat(60)}\n`;
    specs += `Flap Width: ${flapW} mm\n\n`;
  } else if (cvMode === 'jacket') {
    const flapW = cvVal('jacketFlapWidth');
    const binding = document.getElementById('binding').value;
    const boardSelect = document.getElementById('boardThickness');
    const boardLabel = boardSelect.options[boardSelect.selectedIndex].text;
    specs += `JACKET SPECIFICATION\n`;
    specs += `${'-'.repeat(60)}\n`;
    specs += `Flap Width: ${flapW} mm\n`;
    specs += `Binding: ${binding === '0' ? 'Perfect Bound' : 'Sewn'}\n`;
    specs += `Board Thickness: ${boardLabel}\n\n`;
  } else if (cvMode === 'ppc') {
    const binding = document.getElementById('binding').value;
    const boardSelect = document.getElementById('boardThickness');
    const boardLabel = boardSelect.options[boardSelect.selectedIndex].text;
    const ppcType = document.getElementById('ppcType').value;
    const wrap = cvVal('ppcWrap') || 15;
    specs += `PPC SPECIFICATION\n`;
    specs += `${'-'.repeat(60)}\n`;
    specs += `PPC Type: ${ppcType.charAt(0).toUpperCase() + ppcType.slice(1)}\n`;
    specs += `Binding: ${binding === '0' ? 'Perfect Bound' : 'Sewn'}\n`;
    specs += `Board Thickness: ${boardLabel}\n`;
    specs += `Wraparound Size: ${wrap}mm (all sides — top, bottom, front & back)\n\n`;
  }

  specs += `CALCULATED RESULTS\n`;
  specs += `${'-'.repeat(60)}\n`;
  specs += `Spine Width: ${cvState.spine} mm\n`;
  specs += `Document Width: ${cvFmtInt(cvState.docW)} mm\n`;
  specs += `Document Height: ${cvFmtInt(cvState.docH)} mm\n\n`;

  specs += `PRODUCTION NOTES\n`;
  specs += `${'-'.repeat(60)}\n`;
  specs += `${CONFIG.coverTypes[cvMode].bleedNote}\n`;
  specs += `${CONFIG.coverTypes[cvMode].pdfNote}\n\n`;

  specs += `ALERTS & WARNINGS\n`;
  specs += `${'-'.repeat(60)}\n`;
  const alerts = document.querySelectorAll('.alert-box.show');
  if (alerts.length === 0) {
    specs += `No alerts — specifications within acceptable ranges.\n`;
  } else {
    alerts.forEach(alert => {
      specs += `⚠ ${alert.textContent.trim()}\n`;
    });
  }

  // Download as TXT file
  const filename = `specs-${cvMode}-${pH}x${pW}-sp${cvFmtInt(cvState.spine)}.txt`;
  const blob = new Blob([specs], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── RESET ─────────────────────────────────────────────────────────
function cvReset() {
  [...CORE_IDS,'flapWidth','jacketFlapWidth'].forEach(id=>{ document.getElementById(id).value=''; });
  document.getElementById('binding').value='0';
  document.getElementById('boardThickness').value='0';
  document.getElementById('ppcType').value='round';
  document.getElementById('ppcWrap').value='15';
  cvState=null;
  cvClearAlerts();
  cvCalculate();
}

// ── PAPER STOCK PRESETS ────────────────────────────────────────────
function cvPopulatePaperPresets() {
  if (!CONFIG.features.enablePaperPresets) return;

  const row = document.getElementById('paperPresetRow');
  const select = document.getElementById('paperStockSelect');

  select.innerHTML = '';
  CONFIG.paperStocks.forEach(stock => {
    const option = document.createElement('option');
    option.value = `${stock.gsm},${stock.volume}`;
    option.textContent = stock.label;
    select.appendChild(option);
  });

  row.style.display = 'block';
}

function cvApplyPaperStock() {
  const select = document.getElementById('paperStockSelect');
  const [gsm, volume] = select.value.split(',');

  if (gsm > 0) {
    document.getElementById('gsm').value = gsm;
    document.getElementById('volume').value = volume;
    // Keep selection visible instead of resetting
    cvCalculate();
  }
}

// ── SAVE & LOAD SAVED CALCULATIONS ────────────────────────────────
function cvSaveCalculation() {
  if (!CONFIG.features.enableSaveHistory) return;

  // Show modal
  const modal = document.getElementById('saveModal');
  const input = document.getElementById('saveCalcName');

  // Pre-fill with default name
  const defaultName = `${cvMode.charAt(0).toUpperCase() + cvMode.slice(1)} • ${document.getElementById('pHeight').value}×${document.getElementById('pWidth').value}`;
  input.value = defaultName;
  input.focus();
  input.select();

  // Store default for use in confirm
  cvSaveData = { defaultName };

  // Show modal
  modal.style.display = 'flex';

  // Close modal on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      cvCancelSave();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function cvConfirmSave() {
  if (!CONFIG.features.enableSaveHistory) return;

  const modal = document.getElementById('saveModal');
  const input = document.getElementById('saveCalcName');
  const name = input.value.trim() || cvSaveData.defaultName;

  const entry = {
    id: Date.now(),
    name: name,
    timestamp: Date.now(),
    mode: cvMode,
    inputs: {
      pHeight: document.getElementById('pHeight').value,
      pWidth: document.getElementById('pWidth').value,
      gsm: document.getElementById('gsm').value,
      volume: document.getElementById('volume').value,
      numPages: document.getElementById('numPages').value,
      flapWidth: document.getElementById('flapWidth').value || '',
      jacketFlapWidth: document.getElementById('jacketFlapWidth').value || '',
      binding: document.getElementById('binding').value || '0',
      boardThickness: document.getElementById('boardThickness').value || '0',
      ppcType: document.getElementById('ppcType').value || 'round'
    }
  };

  let saved = JSON.parse(localStorage.getItem('coverspec_saved') || '[]');
  saved.push(entry);
  localStorage.setItem('coverspec_saved', JSON.stringify(saved));
  cvUpdateSavedUI();

  // Close modal
  modal.style.display = 'none';
}

function cvCancelSave() {
  const modal = document.getElementById('saveModal');
  modal.style.display = 'none';
}

function cvLoadSaved(id) {
  if (!id) return;

  const saved = JSON.parse(localStorage.getItem('coverspec_saved') || '[]');
  const entry = saved.find(e => e.id == id);

  if (!entry) return;

  // Restore mode
  cvSetMode(entry.mode);

  // Restore inputs
  Object.entries(entry.inputs).forEach(([fieldId, value]) => {
    const el = document.getElementById(fieldId);
    if (el) el.value = value;
  });

  // Reset dropdown
  document.getElementById('savedDropdown').value = '';

  cvCalculate();
}

function cvUpdateSavedUI() {
  if (!CONFIG.features.enableSaveHistory) return;

  const saved = JSON.parse(localStorage.getItem('coverspec_saved') || '[]');
  const section = document.getElementById('savedCalcsSection');
  const dropdown = document.getElementById('savedDropdown');

  if (saved.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  dropdown.innerHTML = '<option value="">Load a saved calculation...</option>';

  // Sort by most recent first
  saved.sort((a, b) => b.timestamp - a.timestamp);

  saved.forEach(entry => {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.name;
    dropdown.appendChild(option);
  });
}

function cvDeleteSaved(id) {
  if (!confirm('Delete this saved calculation?')) return;

  let saved = JSON.parse(localStorage.getItem('coverspec_saved') || '[]');
  saved = saved.filter(e => e.id != id);
  localStorage.setItem('coverspec_saved', JSON.stringify(saved));
  cvUpdateSavedUI();
}

function cvClearAllSaved() {
  if (confirm('Delete all saved calculations?')) {
    localStorage.removeItem('coverspec_saved');
    cvUpdateSavedUI();
  }
}
