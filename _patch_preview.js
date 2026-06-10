const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// =========================================================
// FIX 1: navigate to generator → reset preview to placeholder
// =========================================================
const oldGenBlock = "if (view === 'generator') {\n    populateGenLeadSelect();\n    genInitCarouselDrag();\n    genGoSlide(0);\n    genRenderPalette();\n  }";
const newGenBlock = "if (view === 'generator') {\n    populateGenLeadSelect();\n    genInitCarouselDrag();\n    genGoSlide(1);\n    genRenderPalette();\n    // Always reset preview to placeholder when entering generator\n    const _siteIframe = document.getElementById('sitePreview');\n    const _ph = document.getElementById('previewPlaceholder');\n    if (_siteIframe) { _siteIframe.srcdoc = ''; _siteIframe.style.display = 'none'; }\n    if (_ph) _ph.style.display = '';\n    state.generatedHTML = '';\n  }";

if (js.includes(oldGenBlock)) {
  js = js.replace(oldGenBlock, newGenBlock);
  console.log('Fix 1: navigate generator reset preview');
} else {
  // Try CRLF
  const crlf = oldGenBlock.replace(/\n/g, '\r\n');
  if (js.includes(crlf)) {
    js = js.replace(crlf, newGenBlock);
    console.log('Fix 1: navigate generator reset preview (CRLF)');
  } else {
    console.log('Fix 1 FAIL - trying indexOf');
    const idx = js.indexOf("if (view === 'generator') {");
    if (idx > -1) {
      const end = js.indexOf('  }', idx) + 3;
      console.log('found at', idx, 'to', end);
      console.log('old:', JSON.stringify(js.substring(idx, end)));
    }
  }
}

// =========================================================
// FIX 2: ensureEditorInIframe → no-op if new toolbar exists,
// also skip if iframe has no real content
// =========================================================
const ensIdx = js.indexOf('function ensureEditorInIframe(');
let d2=0,p2=ensIdx,e2=-1;
while(p2<js.length){if(js[p2]==='{')d2++;else if(js[p2]==='}'){d2--;if(d2===0){e2=p2+1;break;}}p2++;}

const newEnsure = `function ensureEditorInIframe(iframeId) {
  // The new Canva editor is already injected via injectEditor() during generateSite()
  // and updateQuickPreview(). No auto-injection needed.
  return;
}`;

js = js.substring(0, ensIdx) + newEnsure + js.substring(e2);
console.log('Fix 2: ensureEditorInIframe disabled (editor injected via generateSite)');

// =========================================================
// FIX 3: When generating site (generateSite + updateQuickPreview),
// inject Canva editor into the result
// =========================================================
// generateSite already calls injectEditor. Check updateQuickPreview doesn't.
// updateQuickPreview shows raw preview (no editor) - this is CORRECT for quick preview
// Editor only appears after "Gerar Site" is clicked

// =========================================================
// FIX 4: initPreviewToolsUI - remove calls to ensureEditorInIframe at end
// and remove the iframe load event that called it
// =========================================================
const iframeLoadPat = "  const siteIframe = document.getElementById('sitePreview');\n  if (siteIframe) {\n    siteIframe.addEventListener('load', () => {\n      ensureEditorInIframe('sitePreview');";
const iframeLoadEnd = js.indexOf("});", js.indexOf(iframeLoadPat)) + 3;
if (js.includes(iframeLoadPat)) {
  // Replace with version without ensureEditorInIframe calls
  const newLoad = "  const siteIframe = document.getElementById('sitePreview');\n  if (siteIframe) {\n    siteIframe.addEventListener('load', () => {";
  js = js.replace(iframeLoadPat, newLoad);
  console.log('Fix 4: removed ensureEditorInIframe from siteIframe load event');
} else {
  console.log('Fix 4: pattern not found (skipped)');
}

// Also remove the standalone ensureEditorInIframe calls at the end of initPreviewToolsUI
// Find them specifically
const ensCallPat1 = "\n  ensureEditorInIframe('sitePreview');";
const ensCallPat2 = "\n  ensureEditorInIframe('fullPreview');";
// Only remove the standalone calls (outside event listeners)
// Find the last occurrence in initPreviewToolsUI
const initUIIdx = js.indexOf('function initPreviewToolsUI(');
let dUI=0,pUI=initUIIdx,eUI=-1;
while(pUI<js.length){if(js[pUI]==='{')dUI++;else if(js[pUI]==='}'){dUI--;if(dUI===0){eUI=pUI+1;break;}}pUI++;}
const uiBlock = js.substring(initUIIdx, eUI);

// Find and remove standalone ensureEditorInIframe calls in this block
const ens1Idx = uiBlock.lastIndexOf(ensCallPat1);
const ens2Idx = uiBlock.lastIndexOf(ensCallPat2);
if (ens1Idx > -1 || ens2Idx > -1) {
  let newBlock = uiBlock;
  if (ens1Idx > -1) newBlock = newBlock.replace(newBlock.substring(ens1Idx, ens1Idx + ensCallPat1.length), '');
  if (ens2Idx > -1) newBlock = newBlock.replace(newBlock.substring(ens2Idx, ens2Idx + ensCallPat2.length), '');
  js = js.substring(0, initUIIdx) + newBlock + js.substring(eUI);
  console.log('Fix 4b: removed standalone ensureEditorInIframe calls from initPreviewToolsUI');
}

// =========================================================
// FIX 5: generateSite — inject editor toolbar into the preview
// The iframe load event should show the editor toolbar
// Actually injectEditor is already called in generateSite:
// const editableHtml = injectEditor(html, data);
// So this is fine.
// =========================================================

// =========================================================
// FIX 6: Add a "Limpar" (clear) button to the preview panel in navigate
// by patching the navigate function to also wire up a clear button if it exists
// Actually let's add it to the preview topbar in index.html
// =========================================================

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('Preview fixes done');
