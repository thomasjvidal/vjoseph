const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// =========================================================
// FIX 1: sanitizeGeneratedHtml - stop replacing images in custom HTML
// Only strip tracking scripts, don't replace image sources
// =========================================================
const oldSanitize = js.indexOf('function sanitizeGeneratedHtml(');
let d=0,p=oldSanitize,e=-1;
while(p<js.length){if(js[p]==='{')d++;else if(js[p]==='}'){d--;if(d===0){e=p+1;break;}}p++;}

const newSanitize = `function sanitizeGeneratedHtml(html, data) {
  let out = String(html || '');
  // Only remove tracking/analytics scripts - don't touch images or styles
  out = out.replace(/<script\\b[^>]*\\bsrc=["']https?:\\/\\/[^"']*(?:cdnjs\\.cloudflare\\.com\\/ajax\\/libs\\/lucide|googletagmanager\\.com\\/gtm\\.js|googletagmanager\\.com\\/gtag\\/js|google-analytics\\.com)[^"']*["'][^>]*>\\s*<\\/script>/gi, '');
  out = out.replace(/<script\\b[^>]*>\\s*[\\s\\S]*?(?:googletagmanager|gtm\\.start|gtag\\(|google_tag_manager)[\\s\\S]*?<\\/script>/gi, '');
  return out;
}`;

js = js.substring(0, oldSanitize) + newSanitize + js.substring(e);
console.log('Fix 1 sanitize: done');

// =========================================================
// FIX 2: injectEditor - full Canva-like editor
// =========================================================
const injIdx = js.indexOf('function injectEditor(');
let d2=0,p2=injIdx,e2=-1;
while(p2<js.length){if(js[p2]==='{')d2++;else if(js[p2]==='}'){d2--;if(d2===0){e2=p2+1;break;}}p2++;}

const newEditor = `function injectEditor(html, data) {
  html = sanitizeGeneratedHtml(html, data);
  const insertPos = html.indexOf('</body>');

  const editorCode = \`
<style id="lf-canva-style">
#lf-toolbar{position:fixed;top:0;left:0;right:0;z-index:2147483647;background:linear-gradient(90deg,#1e1b4b,#312e81);color:#fff;display:flex;align-items:center;gap:8px;padding:8px 12px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;box-shadow:0 2px 12px rgba(0,0,0,.4);flex-wrap:wrap}
#lf-toolbar button{all:unset;cursor:pointer;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:700;background:rgba(255,255,255,.1);color:#fff;transition:.15s}
#lf-toolbar button:hover{background:rgba(255,255,255,.2)}
#lf-toolbar button.active{background:#7C3AED}
#lf-toolbar input[type=color]{width:28px;height:28px;border:2px solid rgba(255,255,255,.3);border-radius:5px;cursor:pointer;padding:0;background:transparent}
#lf-toolbar label{font-size:11px;display:flex;align-items:center;gap:4px;color:rgba(255,255,255,.8)}
#lf-toolbar .sep{width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px}
#lf-toolbar .lf-hint{font-size:11px;color:rgba(255,255,255,.5);margin-left:auto}
#lf-el-float{display:none;position:fixed;z-index:2147483646;background:#1e1b4b;border:1px solid rgba(124,58,237,.5);border-radius:8px;padding:6px 8px;gap:6px;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,.5);font-family:system-ui,sans-serif}
#lf-el-float button{all:unset;cursor:pointer;padding:4px 8px;border-radius:5px;font-size:11px;font-weight:700;color:#fff;background:rgba(255,255,255,.1);transition:.15s}
#lf-el-float button:hover{background:rgba(255,255,255,.25)}
#lf-el-float button.del{background:rgba(220,38,38,.3);color:#fca5a5}
#lf-el-float button.del:hover{background:rgba(220,38,38,.6)}
#lf-el-float input[type=color]{width:24px;height:24px;border:1px solid rgba(255,255,255,.3);border-radius:4px;cursor:pointer;padding:0}
#lf-el-float label{font-size:10px;color:rgba(255,255,255,.6);display:flex;align-items:center;gap:3px}
body{padding-top:46px!important}
.lf-section-hover{outline:2px dashed rgba(124,58,237,.4)!important;outline-offset:2px}
.lf-section-selected{outline:2px solid #7C3AED!important;outline-offset:2px}
.lf-el-selected{outline:2px solid #06B6D4!important;outline-offset:1px;background:rgba(6,182,212,.05)!important}
[contenteditable=true]:focus{outline:2px dashed #7C3AED!important;background:rgba(124,58,237,.05)!important;border-radius:2px}
.lf-editable-mode [contenteditable=true]{cursor:text}
.lf-editable-mode *{cursor:crosshair}
.lf-editable-mode [contenteditable=true]{cursor:text!important}
.lf-del-section{all:unset!important;position:absolute!important;top:4px!important;right:4px!important;z-index:9999!important;background:#DC2626!important;color:#fff!important;font-size:11px!important;font-weight:700!important;padding:4px 8px!important;border-radius:5px!important;cursor:pointer!important;display:none!important;font-family:system-ui,sans-serif!important}
.lf-section-selected .lf-del-section{display:inline-flex!important}
</style>
<div id="lf-toolbar">
  <button id="lf-edit-toggle" onclick="lfToggleEdit()">✏️ Editar</button>
  <div class="sep"></div>
  <div id="lf-text-controls" style="display:none;align-items:center;gap:8px;flex-wrap:wrap">
    <label>Texto <input type="color" id="lf-tc" value="#000000" oninput="lfApplyTextColor(this.value)" title="Cor do texto"></label>
    <label>Fundo <input type="color" id="lf-bc" value="#ffffff" oninput="lfApplyBgColor(this.value)" title="Cor de fundo do elemento"></label>
    <button onclick="lfBold()" title="Negrito"><b>B</b></button>
    <button onclick="lfItalic()" title="Itálico"><i>I</i></button>
    <select id="lf-fsize" onchange="lfFontSize(this.value)" style="all:unset;background:rgba(255,255,255,.1);color:#fff;padding:4px 8px;border-radius:5px;font-size:12px;cursor:pointer">
      <option value="">Tamanho</option>
      <option value="12px">12</option><option value="14px">14</option><option value="16px">16</option>
      <option value="18px">18</option><option value="20px">20</option><option value="24px">24</option>
      <option value="28px">28</option><option value="32px">32</option><option value="36px">36</option>
      <option value="40px">40</option><option value="48px">48</option><option value="56px">56</option>
      <option value="64px">64</option><option value="72px">72</option>
    </select>
    <button onclick="lfDeleteEl()" style="background:rgba(220,38,38,.4)" title="Apagar elemento selecionado">🗑 Elemento</button>
    <button onclick="lfDeleteSection()" style="background:rgba(220,38,38,.6)" title="Apagar seção selecionada">🗑 Seção</button>
  </div>
  <span class="lf-hint" id="lf-hint">Clique em Editar para modificar o site</span>
</div>
<div id="lf-el-float">
  <label>Txt <input type="color" id="lf-ef-tc" oninput="lfFloatTextColor(this.value)"></label>
  <label>Bg <input type="color" id="lf-ef-bc" oninput="lfFloatBgColor(this.value)"></label>
  <button onclick="lfFloatDelete()" class="del">🗑</button>
</div>
<script id="lf-canva-script">
(function() {
  var editMode = false;
  var selectedEl = null;
  var selectedSection = null;
  var floatTimer = null;

  // Make sections selectable
  function getSections() {
    var secs = Array.from(document.querySelectorAll('header, section, footer, main > *, body > *'));
    return secs.filter(function(el) {
      var t = el.tagName.toUpperCase();
      return !['SCRIPT','STYLE','LINK','META','HEAD','#lf-toolbar','#lf-el-float'].includes(t) &&
        el.id !== 'lf-toolbar' && el.id !== 'lf-el-float';
    });
  }

  function setupSections() {
    getSections().forEach(function(sec) {
      if (sec._lfSetup) return;
      sec._lfSetup = true;
      if (window.getComputedStyle(sec).position === 'static') sec.style.position = 'relative';

      // Delete section button
      var delBtn = document.createElement('button');
      delBtn.className = 'lf-del-section';
      delBtn.textContent = '🗑 Excluir seção';
      delBtn.onclick = function(e) {
        e.preventDefault(); e.stopPropagation();
        if (confirm('Excluir esta seção?')) { sec.remove(); hideFloat(); }
      };
      sec.appendChild(delBtn);

      sec.addEventListener('mouseenter', function() {
        if (!editMode) return;
        sec.classList.add('lf-section-hover');
      });
      sec.addEventListener('mouseleave', function() {
        sec.classList.remove('lf-section-hover');
      });
      sec.addEventListener('click', function(e) {
        if (!editMode) return;
        if (e.target.id === 'lf-edit-toggle') return;
        selectSection(sec);
      });
    });
  }

  function selectSection(sec) {
    if (selectedSection && selectedSection !== sec) {
      selectedSection.classList.remove('lf-section-selected');
    }
    selectedSection = sec;
    sec.classList.add('lf-section-selected');
    sec.classList.remove('lf-section-hover');
  }

  function makeEditable(sec) {
    var textSel = 'h1,h2,h3,h4,h5,h6,p,span,a,li,b,strong,i,em,small,button,[class*="btn"],[class*="cta"],[class*="title"],[class*="heading"],[class*="text"],[class*="desc"]';
    sec.querySelectorAll(textSel).forEach(function(el) {
      if (el.children.length === 0 || el.innerText.trim().length > 0) {
        el.contentEditable = 'true';
      }
    });
  }

  function removeEditable(sec) {
    sec.querySelectorAll('[contenteditable]').forEach(function(el) {
      el.contentEditable = 'false';
    });
  }

  window.lfToggleEdit = function() {
    editMode = !editMode;
    var btn = document.getElementById('lf-edit-toggle');
    var textCtrl = document.getElementById('lf-text-controls');
    var hint = document.getElementById('lf-hint');
    var body = document.body;

    if (editMode) {
      btn.textContent = '✅ Sair da Edição';
      btn.classList.add('active');
      textCtrl.style.display = 'flex';
      hint.textContent = 'Clique numa seção → selecionar | Clique no texto → editar | 🗑 para apagar';
      body.classList.add('lf-editable-mode');
      setupSections();
      getSections().forEach(makeEditable);
    } else {
      btn.textContent = '✏️ Editar';
      btn.classList.remove('active');
      textCtrl.style.display = 'none';
      hint.textContent = 'Clique em Editar para modificar o site';
      body.classList.remove('lf-editable-mode');
      if (selectedSection) { selectedSection.classList.remove('lf-section-selected'); selectedSection = null; }
      if (selectedEl) { selectedEl.classList.remove('lf-el-selected'); selectedEl = null; }
      getSections().forEach(removeEditable);
      hideFloat();
    }
  };

  // Element-level selection
  document.addEventListener('click', function(e) {
    if (!editMode) return;
    var target = e.target;
    if (!target || target.id === 'lf-toolbar' || target.closest('#lf-toolbar') || target.closest('#lf-el-float')) return;
    if (target.classList && target.classList.contains('lf-del-section')) return;

    // Check if it's an editable text node
    if (target.contentEditable === 'true') {
      selectEl(target);
      return;
    }

    // Find section
    var sec = target.closest('header,section,footer') || target.closest('body > *');
    if (sec && !sec.id !== 'lf-el-float') {
      selectSection(sec);
    }
  }, true);

  function selectEl(el) {
    if (selectedEl && selectedEl !== el) selectedEl.classList.remove('lf-el-selected');
    selectedEl = el;
    el.classList.add('lf-el-selected');
    showFloatNear(el);
    // Update color inputs
    var cs = window.getComputedStyle(el);
    var tc = document.getElementById('lf-tc');
    var bc = document.getElementById('lf-bc');
    var eftc = document.getElementById('lf-ef-tc');
    var efbc = document.getElementById('lf-ef-bc');
    if (tc) tc.value = rgbToHex(cs.color) || '#000000';
    if (bc) bc.value = rgbToHex(cs.backgroundColor) || '#ffffff';
    if (eftc) eftc.value = rgbToHex(cs.color) || '#000000';
    if (efbc) efbc.value = rgbToHex(cs.backgroundColor) || '#ffffff';
  }

  function showFloatNear(el) {
    var f = document.getElementById('lf-el-float');
    if (!f) return;
    f.style.display = 'flex';
    var r = el.getBoundingClientRect();
    f.style.top = (r.top + window.scrollY - f.offsetHeight - 8) + 'px';
    f.style.left = r.left + 'px';
  }

  function hideFloat() {
    var f = document.getElementById('lf-el-float');
    if (f) f.style.display = 'none';
    if (selectedEl) { selectedEl.classList.remove('lf-el-selected'); selectedEl = null; }
  }

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
    var m = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (!m) return null;
    return '#' + [m[1],m[2],m[3]].map(function(x){return ('0'+parseInt(x).toString(16)).slice(-2);}).join('');
  }

  window.lfApplyTextColor = function(v) {
    var el = selectedEl || (selectedSection ? selectedSection.querySelector('[contenteditable=true]') : null);
    if (el) el.style.color = v;
    var eftc = document.getElementById('lf-ef-tc');
    if (eftc) eftc.value = v;
  };
  window.lfApplyBgColor = function(v) {
    var el = selectedEl || selectedSection;
    if (el) el.style.backgroundColor = v;
    var efbc = document.getElementById('lf-ef-bc');
    if (efbc) efbc.value = v;
  };
  window.lfBold = function() { if (selectedEl) selectedEl.style.fontWeight = selectedEl.style.fontWeight === 'bold' ? '' : 'bold'; };
  window.lfItalic = function() { if (selectedEl) selectedEl.style.fontStyle = selectedEl.style.fontStyle === 'italic' ? '' : 'italic'; };
  window.lfFontSize = function(v) { if (selectedEl) selectedEl.style.fontSize = v; };
  window.lfDeleteEl = function() {
    if (!selectedEl) return;
    if (confirm('Apagar este elemento?')) { selectedEl.remove(); selectedEl = null; hideFloat(); }
  };
  window.lfDeleteSection = function() {
    if (!selectedSection) return;
    if (confirm('Apagar esta seção?')) { selectedSection.remove(); selectedSection = null; hideFloat(); }
  };
  window.lfFloatTextColor = function(v) {
    var tc = document.getElementById('lf-tc'); if (tc) tc.value = v;
    window.lfApplyTextColor(v);
  };
  window.lfFloatBgColor = function(v) {
    var bc = document.getElementById('lf-bc'); if (bc) bc.value = v;
    window.lfApplyBgColor(v);
  };
  window.lfFloatDelete = function() { window.lfDeleteEl(); };

  // Image click to replace
  document.addEventListener('click', function(e) {
    if (!editMode) return;
    var target = e.target;
    if (!target) return;
    if (target.tagName === 'IMG' && !target.closest('#lf-toolbar') && !target.closest('#lf-el-float')) {
      e.preventDefault(); e.stopPropagation();
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function(ev) {
        var f = ev.target.files && ev.target.files[0];
        if (!f) return;
        if (f.size > 5*1024*1024) { alert('Imagem muito grande (max 5MB)'); return; }
        var r = new FileReader();
        r.onload = function(le) { target.src = le.target.result; };
        r.readAsDataURL(f);
      };
      inp.click();
    }
  }, true);

  // Close float when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target) return;
    if (e.target.closest && (e.target.closest('#lf-el-float') || e.target.closest('#lf-toolbar'))) return;
    if (e.target.contentEditable !== 'true') hideFloat();
  });

  // Post modified HTML to parent when requested
  window.addEventListener('message', function(e) {
    if (e.data === 'lf-get-html') {
      var clone = document.documentElement.cloneNode(true);
      var toolbar = clone.querySelector('#lf-toolbar');
      var floatEl = clone.querySelector('#lf-el-float');
      var style = clone.querySelector('#lf-canva-style');
      var script = clone.querySelector('#lf-canva-script');
      if (toolbar) toolbar.remove();
      if (floatEl) floatEl.remove();
      if (style) style.remove();
      if (script) script.remove();
      // Remove contenteditable attributes
      clone.querySelectorAll('[contenteditable]').forEach(function(el) { el.removeAttribute('contenteditable'); });
      clone.querySelectorAll('.lf-section-selected,.lf-section-hover,.lf-el-selected,.lf-editable-mode').forEach(function(el) {
        el.classList.remove('lf-section-selected','lf-section-hover','lf-el-selected','lf-editable-mode');
      });
      clone.querySelectorAll('.lf-del-section').forEach(function(el) { el.remove(); });
      e.source.postMessage({ type: 'lf-html', html: '<!DOCTYPE html>' + clone.outerHTML }, '*');
    }
  });

  setupSections();
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
console.log('Fix 2 injectEditor: done');

// =========================================================
// FIX 3: getCleanHTML - extract from iframe with message passing
// =========================================================
const gchIdx = js.indexOf('function getCleanHTML(');
if (gchIdx > -1) {
  let d3=0,p3=gchIdx,e3=-1;
  while(p3<js.length){if(js[p3]==='{')d3++;else if(js[p3]==='}'){d3--;if(d3===0){e3=p3+1;break;}}p3++;}
  const newGCH = `function getCleanHTML() {
  try {
    const iframe = document.getElementById('sitePreview');
    if (!iframe || !iframe.contentDocument) return state.generatedHTML;
    const doc = iframe.contentDocument;
    const clone = doc.documentElement.cloneNode(true);
    // Remove editor UI
    ['#lf-toolbar','#lf-el-float','#lf-canva-style','#lf-canva-script'].forEach(sel => {
      const el = clone.querySelector(sel); if (el) el.remove();
    });
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('.lf-section-selected,.lf-section-hover,.lf-el-selected,.lf-editable-mode').forEach(el => {
      el.classList.remove('lf-section-selected','lf-section-hover','lf-el-selected','lf-editable-mode');
    });
    clone.querySelectorAll('.lf-del-section').forEach(el => el.remove());
    return '<!DOCTYPE html>' + clone.outerHTML;
  } catch(e) { return state.generatedHTML; }
}`;
  js = js.substring(0, gchIdx) + newGCH + js.substring(e3);
  console.log('Fix 3 getCleanHTML: updated');
} else {
  // Add getCleanHTML before injectEditor
  const newFn = `function getCleanHTML() {
  try {
    const iframe = document.getElementById('sitePreview');
    if (!iframe || !iframe.contentDocument) return state.generatedHTML;
    const doc = iframe.contentDocument;
    const clone = doc.documentElement.cloneNode(true);
    ['#lf-toolbar','#lf-el-float','#lf-canva-style','#lf-canva-script'].forEach(sel => {
      const el = clone.querySelector(sel); if (el) el.remove();
    });
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('.lf-del-section').forEach(el => el.remove());
    return '<!DOCTYPE html>' + clone.outerHTML;
  } catch(e) { return state.generatedHTML; }
}\n\n`;
  const insertBefore = js.indexOf('function injectEditor(');
  js = js.substring(0, insertBefore) + newFn + js.substring(insertBefore);
  console.log('Fix 3 getCleanHTML: added');
}

// =========================================================
// FIX 4: updateQuickPreview should use getSiteFormData() for consistency
// =========================================================
const uqpIdx = js.indexOf('function updateQuickPreview(tpl)');
let d4=0,p4=uqpIdx,e4=-1;
while(p4<js.length){if(js[p4]==='{')d4++;else if(js[p4]==='}'){d4--;if(d4===0){e4=p4+1;break;}}p4++;}

const newUQP = `function updateQuickPreview(tpl) {
  try {
    // Use real form data if available, otherwise placeholders
    const data = (typeof getSiteFormData === 'function') ? getSiteFormData() : {
      name: "Dra. Ana Lima", specialty: "Nutricionista", city: "Sao Paulo",
      attendance: "Online", tagline: "Nutricao personalizada", bio: "Especialista em nutricao.",
      services: ["Consulta"], whatsapp: "11999999999", whatsapp_clean: "11999999999",
      instagram: "@draana", cta: "Agendar Consulta", photo: "", initials: "DA", images: {}
    };
    var html = tpl.isCustom ? generateCustomTemplate(tpl.html, data) : tpl.generator(data);
    var iframe = document.getElementById('sitePreview');
    var ph = document.getElementById('previewPlaceholder');
    if (iframe && html) {
      iframe.srcdoc = html;
      if (ph) ph.style.display = 'none';
      iframe.style.display = 'block';
      state.generatedHTML = html;
    }
  } catch(e) { console.warn('updateQuickPreview failed', e); }
}`;

js = js.substring(0, uqpIdx) + newUQP + js.substring(e4);
console.log('Fix 4 updateQuickPreview: uses getSiteFormData');

// Syntax check
try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('All patches applied');
