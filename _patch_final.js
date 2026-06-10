const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// =========================================================
// FIX 1: Template click = select only, NO preview update
// =========================================================
const oldClick = "      state.selectedTemplate = t.id;\n      // Quick preview update without full generate\n      if (typeof updateQuickPreview === 'function') updateQuickPreview(t);";
const newClick = "      state.selectedTemplate = t.id;\n      // Preview only on 'Gerar Site' click";

if (js.includes(oldClick)) {
  js = js.replace(oldClick, newClick);
  console.log('Fix 1: template click no longer auto-previews');
} else {
  // Try CRLF
  const crlf = oldClick.replace(/\n/g, '\r\n');
  if (js.includes(crlf)) {
    js = js.replace(crlf, newClick);
    console.log('Fix 1: template click no longer auto-previews (CRLF)');
  } else {
    console.log('Fix 1 FAIL');
    const idx = js.indexOf('state.selectedTemplate = t.id;');
    console.log('context:', JSON.stringify(js.substring(idx, idx+200)));
  }
}

// =========================================================
// FIX 2: rebuildPreviewImagesList - filter out placeholder URLs
// =========================================================
const rpiIdx = js.indexOf('function rebuildPreviewImagesList(');
let d=0,p=rpiIdx,e=-1;
while(p<js.length){if(js[p]==='{')d++;else if(js[p]==='}'){d--;if(d===0){e=p+1;break;}}p++;}

const newRPI = `function rebuildPreviewImagesList(iframeId) {
  if (!iframeId) iframeId = 'sitePreview';
  const grid = document.getElementById('previewImagesList');
  const doc = getIframeDoc(iframeId);
  if (!grid) return;
  grid.innerHTML = '';
  if (!doc || !doc.body) {
    grid.innerHTML = '<div class="preview-image-meta" style="padding:16px;text-align:center;color:var(--text-muted)">Gere um site primeiro para ver as imagens.</div>';
    return;
  }

  // Filter function: exclude placeholder URLs and SVG data URIs
  function isRealImage(src) {
    if (!src || typeof src !== 'string') return false;
    const s = src.trim();
    if (!s) return false;
    if (s.startsWith('{{') || s.includes('}}')) return false; // template placeholders
    if (s.startsWith('data:image/svg')) return false; // SVG placeholders
    if (s.length < 5) return false;
    return true;
  }

  const imgs = Array.from(doc.querySelectorAll('img'))
    .map(img => (img && img.getAttribute ? img.getAttribute('src') : '') || '')
    .map(s => s.trim())
    .filter(isRealImage);

  const bgs = (typeof extractBackgroundUrls === 'function' ? extractBackgroundUrls(doc) : [])
    .map(s => String(s).trim())
    .filter(isRealImage);

  const unique = Array.from(new Set([...imgs, ...bgs]));

  if (unique.length === 0) {
    grid.innerHTML = '<div class="preview-image-meta" style="padding:16px;text-align:center;color:var(--text-muted)">Nenhuma imagem no site gerado.</div>';
    return;
  }

  unique.forEach((src, idx) => {
    const item = document.createElement('div');
    item.className = 'preview-image-item';

    const thumb = document.createElement('img');
    thumb.className = 'preview-image-thumb';
    thumb.src = src;
    thumb.alt = '';
    thumb.onerror = function() { this.style.opacity = '0.3'; };

    const meta = document.createElement('div');
    meta.className = 'preview-image-meta';
    meta.textContent = (typeof getFileNameFromUrl === 'function') ? getFileNameFromUrl(src, idx) : ('imagem-' + (idx+1) + '.png');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary';
    btn.textContent = 'Baixar';
    btn.addEventListener('click', async () => {
      const fileName = (typeof getFileNameFromUrl === 'function') ? getFileNameFromUrl(src, idx) : ('imagem-' + (idx+1) + '.png');
      const ok = (typeof downloadUrlAsFile === 'function') ? await downloadUrlAsFile(src, fileName) : false;
      if (ok) toast('Download iniciado');
      else { window.open(src, '_blank'); toast('Abrindo imagem em nova aba'); }
    });

    const swapBtn = document.createElement('button');
    swapBtn.type = 'button';
    swapBtn.className = 'btn-secondary';
    swapBtn.textContent = 'Trocar';
    swapBtn.addEventListener('click', async () => {
      if (typeof replacePreviewImageForUrl === 'function') {
        await replacePreviewImageForUrl(src, iframeId);
        rebuildPreviewImagesList(iframeId);
      }
    });

    item.appendChild(thumb);
    item.appendChild(meta);
    item.appendChild(btn);
    item.appendChild(swapBtn);
    grid.appendChild(item);
  });
}`;

js = js.substring(0, rpiIdx) + newRPI + js.substring(e);
console.log('Fix 2: rebuildPreviewImagesList filters placeholders');

// =========================================================
// FIX 3: injectEditor - per-section Edit/Delete buttons visible immediately
// No global "Editar" toggle needed - buttons show on hover, click to edit
// =========================================================
const injIdx = js.indexOf('function injectEditor(');
let d2=0,p2=injIdx,e2=-1;
while(p2<js.length){if(js[p2]==='{')d2++;else if(js[p2]==='}'){d2--;if(d2===0){e2=p2+1;break;}}p2++;}

const newEditor = `function injectEditor(html, data) {
  html = sanitizeGeneratedHtml(html, data);
  const insertPos = html.indexOf('</body>');

  const editorCode = \`
<style id="lf-canva-style">
/* ---- Per-section controls ---- */
.lf-edit-wrapper{position:relative;transition:outline .15s}
.lf-edit-wrapper:hover{outline:2px dashed rgba(124,58,237,.5);outline-offset:2px}
.lf-sec-controls{position:absolute;top:0;right:0;z-index:2147483647;display:none;gap:0;flex-direction:column}
.lf-edit-wrapper:hover .lf-sec-controls{display:flex}
.lf-sec-btn{all:unset;display:flex!important;align-items:center;gap:5px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;color:#fff;font-family:system-ui,-apple-system,sans-serif;white-space:nowrap}
.lf-sec-btn-edit{background:#7C3AED;border-bottom-left-radius:0}
.lf-sec-btn-del{background:#DC2626;border-bottom-left-radius:6px}
.lf-sec-btn:hover{filter:brightness(1.15)}
/* ---- Edit mode active ---- */
.lf-editing{outline:2px solid #7C3AED!important;outline-offset:2px}
[contenteditable=true]:focus{outline:2px dashed #7C3AED!important;background:rgba(124,58,237,.05)!important;border-radius:2px}
/* ---- Global format toolbar ---- */
#lf-fmt-bar{display:none;position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:linear-gradient(90deg,#1e1b4b,#312e81);color:#fff;border-radius:12px;padding:8px 12px;gap:8px;align-items:center;box-shadow:0 4px 24px rgba(0,0,0,.5);font-family:system-ui,sans-serif;font-size:12px;flex-wrap:wrap;min-width:300px;justify-content:center}
#lf-fmt-bar button{all:unset;cursor:pointer;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:700;background:rgba(255,255,255,.12);color:#fff;transition:.15s}
#lf-fmt-bar button:hover{background:rgba(255,255,255,.25)}
#lf-fmt-bar input[type=color]{width:26px;height:26px;border:2px solid rgba(255,255,255,.3);border-radius:5px;cursor:pointer;padding:0;background:none}
#lf-fmt-bar label{font-size:11px;display:flex;align-items:center;gap:4px;color:rgba(255,255,255,.8)}
#lf-fmt-bar .lf-sep{width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 2px}
#lf-fmt-bar .lf-done{background:rgba(5,150,105,.8)}
#lf-fmt-bar .lf-done:hover{background:rgba(5,150,105,1)}
</style>
<div id="lf-fmt-bar">
  <label>Texto <input type="color" id="lf-tc" value="#000000" oninput="lfTC(this.value)"></label>
  <label>Fundo <input type="color" id="lf-bc" value="#ffffff" oninput="lfBC(this.value)"></label>
  <div class="lf-sep"></div>
  <button onclick="lfBold()"><b>N</b></button>
  <button onclick="lfItalic()"><i>I</i></button>
  <select id="lf-fs" onchange="lfFS(this.value)" style="all:unset;background:rgba(255,255,255,.12);color:#fff;padding:5px 8px;border-radius:6px;font-size:11px;cursor:pointer">
    <option value="">Tamanho</option>
    <option value="12px">12</option><option value="14px">14</option><option value="16px">16</option>
    <option value="18px">18</option><option value="20px">20</option><option value="24px">24</option>
    <option value="28px">28</option><option value="32px">32</option><option value="36px">36</option>
    <option value="40px">40</option><option value="48px">48</option><option value="56px">56</option>
    <option value="64px">64</option><option value="72px">72</option>
  </select>
  <div class="lf-sep"></div>
  <button onclick="lfDelEl()" style="background:rgba(220,38,38,.5)">🗑 Elem.</button>
  <button onclick="lfCloseEdit()" class="lf-done">✅ Fechar</button>
</div>
<script id="lf-canva-script">
(function() {
  var _sel = null; // selected text element
  var _secEditing = null; // section in edit mode

  function getSections() {
    var all = [];
    var seen = new Set();
    document.querySelectorAll('header,section,footer,main>*,body>div,body>nav').forEach(function(el) {
      var t = el.tagName.toUpperCase();
      if (['SCRIPT','STYLE','LINK','META'].includes(t)) return;
      if (el.id === 'lf-fmt-bar') return;
      if (seen.has(el)) return;
      seen.add(el);
      all.push(el);
    });
    return all;
  }

  function setupSection(sec) {
    if (sec._lfSetup) return;
    sec._lfSetup = true;
    sec.classList.add('lf-edit-wrapper');
    if (window.getComputedStyle(sec).position === 'static') sec.style.position = 'relative';

    var ctrl = document.createElement('div');
    ctrl.className = 'lf-sec-controls';

    var editBtn = document.createElement('button');
    editBtn.className = 'lf-sec-btn lf-sec-btn-edit';
    editBtn.innerHTML = '✏️ Editar';
    editBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); startEdit(sec, editBtn); };

    var delBtn = document.createElement('button');
    delBtn.className = 'lf-sec-btn lf-sec-btn-del';
    delBtn.innerHTML = '🗑 Excluir';
    delBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); if(confirm('Excluir esta seção?')){sec.remove();} };

    ctrl.appendChild(editBtn);
    ctrl.appendChild(delBtn);
    sec.appendChild(ctrl);
  }

  function startEdit(sec, btn) {
    if (_secEditing && _secEditing !== sec) stopEdit(_secEditing);
    _secEditing = sec;
    sec.classList.add('lf-editing');
    btn.innerHTML = '💾 Salvar';
    btn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); stopEdit(sec); btn.innerHTML = '✏️ Editar'; btn.onclick = function(e2){e2.preventDefault();e2.stopPropagation();startEdit(sec,btn);}; };
    // Make text elements editable
    var sel = 'h1,h2,h3,h4,h5,h6,p,span,a,li,b,strong,i,em,small,button,[class*="btn"],[class*="cta"],[class*="title"],[class*="heading"],[class*="text"],[class*="label"]';
    sec.querySelectorAll(sel).forEach(function(el) {
      if (!el.closest('.lf-sec-controls')) {
        el.contentEditable = 'true';
        el.addEventListener('focus', function() { selectEl(el); }, true);
      }
    });
    // Show format bar
    document.getElementById('lf-fmt-bar').style.display = 'flex';
  }

  function stopEdit(sec) {
    if (!sec) return;
    sec.classList.remove('lf-editing');
    sec.querySelectorAll('[contenteditable]').forEach(function(el){ el.contentEditable='false'; });
    _secEditing = null; _sel = null;
    // Hide format bar if no other section editing
    document.getElementById('lf-fmt-bar').style.display = 'none';
  }

  function selectEl(el) {
    if (_sel && _sel !== el) _sel.style.outline = '';
    _sel = el;
    // Update color pickers
    var cs = window.getComputedStyle(el);
    function toHex(rgb) {
      if (!rgb || rgb === 'transparent') return null;
      var m = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
      if (!m) return null;
      return '#' + [m[1],m[2],m[3]].map(function(x){return ('0'+parseInt(x).toString(16)).slice(-2);}).join('');
    }
    var tc = document.getElementById('lf-tc');
    var bc = document.getElementById('lf-bc');
    if (tc) tc.value = toHex(cs.color) || '#000000';
    if (bc) bc.value = toHex(cs.backgroundColor) || '#ffffff';
  }

  window.lfTC = function(v) { if (_sel) _sel.style.color = v; };
  window.lfBC = function(v) { if (_sel) _sel.style.backgroundColor = v; };
  window.lfBold = function() { if (_sel) _sel.style.fontWeight = _sel.style.fontWeight === 'bold' ? '' : 'bold'; };
  window.lfItalic = function() { if (_sel) _sel.style.fontStyle = _sel.style.fontStyle === 'italic' ? '' : 'italic'; };
  window.lfFS = function(v) { if (_sel) _sel.style.fontSize = v; };
  window.lfDelEl = function() { if (_sel && confirm('Apagar este elemento?')) { _sel.remove(); _sel = null; } };
  window.lfCloseEdit = function() { if (_secEditing) stopEdit(_secEditing); };

  // Image click to replace
  document.addEventListener('click', function(e) {
    if (!_secEditing) return;
    var t = e.target;
    if (!t || t.closest && t.closest('.lf-sec-controls, #lf-fmt-bar')) return;
    if (t.tagName === 'IMG') {
      e.preventDefault(); e.stopPropagation();
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function(ev) {
        var f = ev.target.files && ev.target.files[0];
        if (!f || f.size > 5*1024*1024) return;
        var r = new FileReader();
        r.onload = function(le) { t.src = le.target.result; };
        r.readAsDataURL(f);
      };
      inp.click();
    }
  }, true);

  // Init sections on load
  function init() { getSections().forEach(setupSection); }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

  // Also re-run init after a brief delay to catch lazy-rendered elements
  setTimeout(init, 500);
})();
</script>
\`;

  if (insertPos !== -1) {
    return html.slice(0, insertPos) + editorCode + html.slice(insertPos);
  } else {
    return html + editorCode;
  }
}`;

js = js.substring(0, injIdx) + newEditor + js.substring(e2);
console.log('Fix 3: injectEditor - per-section buttons restored');

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('All fixes done');
