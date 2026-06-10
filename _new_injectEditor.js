function injectEditor(html, data) {
  html = sanitizeGeneratedHtml(html, data);
  const insertPos = html.indexOf('</body>');

  const editorCode = `
<style id="lf-canva-style">
/* Per-section wrapper */
.lf-edit-wrapper{position:relative}
.lf-sec-controls{position:absolute;top:4px;right:4px;z-index:2147483647;display:none;gap:2px;flex-direction:column;pointer-events:auto}
.lf-edit-wrapper:hover>.lf-sec-controls{display:flex}
.lf-edit-wrapper:hover{outline:2px dashed rgba(124,58,237,.4);outline-offset:1px}
.lf-sec-btn{all:unset;display:flex!important;align-items:center;gap:4px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer;color:#fff;font-family:system-ui,sans-serif;white-space:nowrap;border-radius:4px;margin-bottom:1px}
.lf-sec-btn-edit{background:#7C3AED}
.lf-sec-btn-ai{background:#0891b2}
.lf-sec-btn-del{background:#DC2626}
.lf-sec-btn:hover{filter:brightness(1.2)}
/* Selected element highlight */
.lf-selected-el{outline:2px solid #7C3AED!important;outline-offset:1px;border-radius:2px}
/* Edit mode */
.lf-editing>.lf-edit-wrapper,.lf-editing{outline:2px solid #7C3AED!important}
[contenteditable=true]{cursor:text}
[contenteditable=true]:focus{outline:2px dashed #7C3AED!important;background:rgba(124,58,237,.06)!important}
/* Remove grayscale from images */
img{filter:none!important}
/* Format bar */
#lf-fmt-bar{display:none;position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:linear-gradient(90deg,#1e1b4b,#312e81);color:#fff;border-radius:12px;padding:7px 12px;gap:7px;align-items:center;box-shadow:0 4px 24px rgba(0,0,0,.6);font-family:system-ui,sans-serif;font-size:12px;flex-wrap:wrap;max-width:96vw;justify-content:center}
#lf-fmt-bar button{all:unset;cursor:pointer;padding:4px 9px;border-radius:5px;font-size:12px;font-weight:700;background:rgba(255,255,255,.12);color:#fff;transition:.12s}
#lf-fmt-bar button:hover{background:rgba(255,255,255,.28)}
#lf-fmt-bar input[type=color]{width:24px;height:24px;border:2px solid rgba(255,255,255,.3);border-radius:4px;cursor:pointer;padding:0;background:none;flex-shrink:0}
#lf-fmt-bar label{font-size:10px;display:flex;align-items:center;gap:3px;color:rgba(255,255,255,.8);white-space:nowrap}
#lf-fmt-bar .lf-sep{width:1px;height:18px;background:rgba(255,255,255,.2);margin:0 2px;flex-shrink:0}
#lf-fmt-bar .lf-done{background:rgba(5,150,105,.8)}
#lf-fmt-bar .lf-done:hover{background:rgba(5,150,105,1)}
#lf-fmt-bar select{all:unset;background:rgba(255,255,255,.12);color:#fff;padding:4px 7px;border-radius:5px;font-size:11px;cursor:pointer}
</style>
<div id="lf-fmt-bar">
  <label>Texto<input type="color" id="lf-tc" value="#000000" oninput="lfTC(this.value)"></label>
  <label>Fundo<input type="color" id="lf-bc" value="#ffffff" oninput="lfBC(this.value)"></label>
  <label>Seção<input type="color" id="lf-sc" value="#ffffff" oninput="lfSC(this.value)"></label>
  <div class="lf-sep"></div>
  <button onmousedown="event.preventDefault();lfBold()"><b>N</b></button>
  <button onmousedown="event.preventDefault();lfItalic()"><i>I</i></button>
  <select id="lf-fs" onchange="lfFS(this.value)">
    <option value="">Tam.</option>
    <option value="12px">12</option><option value="14px">14</option><option value="16px">16</option>
    <option value="18px">18</option><option value="20px">20</option><option value="24px">24</option>
    <option value="28px">28</option><option value="32px">32</option><option value="36px">36</option>
    <option value="40px">40</option><option value="48px">48</option><option value="56px">56</option>
    <option value="64px">64</option><option value="72px">72</option>
  </select>
  <div class="lf-sep"></div>
  <button onmousedown="event.preventDefault();lfDelEl()" style="background:rgba(220,38,38,.6)">🗑</button>
  <button onclick="lfCloseAll()" class="lf-done">✅ Fechar</button>
</div>
<script id="lf-canva-script">
(function() {
  var _sel = null;
  var _secEditing = null;
  var _fmtVisible = false;

  /* ---------- helpers ---------- */
  function toHex(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
    var m = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (!m) return null;
    return '#' + [m[1],m[2],m[3]].map(function(x){return ('0'+parseInt(x).toString(16)).slice(-2);}).join('');
  }

  function showFmt() {
    var b = document.getElementById('lf-fmt-bar');
    if (b) { b.style.display = 'flex'; _fmtVisible = true; }
  }

  function syncFmt(el) {
    if (!el) return;
    var cs = window.getComputedStyle(el);
    var tc = document.getElementById('lf-tc');
    var bc = document.getElementById('lf-bc');
    if (tc) tc.value = toHex(cs.color) || '#000000';
    if (bc) bc.value = toHex(cs.backgroundColor) || '#ffffff';
    // find nearest section bg
    var sc = document.getElementById('lf-sc');
    if (sc) {
      var node = el;
      while (node && node !== document.body) {
        var bg = toHex(window.getComputedStyle(node).backgroundColor);
        if (bg) { sc.value = bg; break; }
        node = node.parentElement;
      }
    }
  }

  /* ---------- section detection ---------- */
  function getSections() {
    var seen = new Set();
    var results = [];
    // Elementor parent containers first
    var sels = [
      '[data-element_type="container"].e-parent',
      'section[data-element_type="section"]',
      '.elementor-section.elementor-top-section',
      'header', 'footer'
    ];
    sels.forEach(function(s) {
      try {
        document.querySelectorAll(s).forEach(function(el) {
          if (!seen.has(el) && el.id !== 'lf-fmt-bar') { seen.add(el); results.push(el); }
        });
      } catch(e) {}
    });
    // Fallback: generic top-level blocks
    if (!results.length) {
      document.querySelectorAll('header,section,footer,main>*,body>div,body>nav').forEach(function(el) {
        var t = el.tagName.toUpperCase();
        if (['SCRIPT','STYLE','LINK','META'].includes(t)) return;
        if (el.id === 'lf-fmt-bar') return;
        if (!seen.has(el)) { seen.add(el); results.push(el); }
      });
    }
    return results;
  }

  /* ---------- setup section buttons ---------- */
  function setupSection(sec) {
    if (sec._lfSetup) return;
    sec._lfSetup = true;
    sec.classList.add('lf-edit-wrapper');
    if (window.getComputedStyle(sec).position === 'static') sec.style.position = 'relative';

    var ctrl = document.createElement('div');
    ctrl.className = 'lf-sec-controls';

    var editBtn = document.createElement('button');
    editBtn.className = 'lf-sec-btn lf-sec-btn-edit';
    editBtn.textContent = '✏️ Editar';
    editBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); toggleEdit(sec, editBtn); };

    var aiBtn = document.createElement('button');
    aiBtn.className = 'lf-sec-btn lf-sec-btn-ai';
    aiBtn.textContent = '🤖 IA';
    aiBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); fillWithAI(sec, aiBtn); };

    var delBtn = document.createElement('button');
    delBtn.className = 'lf-sec-btn lf-sec-btn-del';
    delBtn.textContent = '🗑 Excluir';
    delBtn.onclick = function(e) { e.preventDefault(); e.stopPropagation(); if(confirm('Excluir esta seção?')) sec.remove(); };

    ctrl.appendChild(editBtn);
    ctrl.appendChild(aiBtn);
    ctrl.appendChild(delBtn);
    sec.appendChild(ctrl);
  }

  /* ---------- edit toggle ---------- */
  function toggleEdit(sec, btn) {
    if (_secEditing && _secEditing !== sec) stopEdit(_secEditing);
    if (_secEditing === sec) { stopEdit(sec); return; }
    _secEditing = sec;
    sec.classList.add('lf-editing');
    btn.textContent = '💾 Salvar';
    btn.onclick = function(e) {
      e.preventDefault(); e.stopPropagation();
      stopEdit(sec);
      btn.textContent = '✏️ Editar';
      btn.onclick = function(e2){ e2.preventDefault(); e2.stopPropagation(); toggleEdit(sec, btn); };
    };
    var q = 'h1,h2,h3,h4,h5,h6,p,span,a,li,b,strong,i,em,small,button,[class*="btn"],[class*="cta"],[class*="title"],[class*="heading"],[class*="text-editor"],[class*="label"]';
    sec.querySelectorAll(q).forEach(function(el) {
      if (!el.closest('.lf-sec-controls')) el.contentEditable = 'true';
    });
    showFmt();
    syncFmt(sec);
  }

  function stopEdit(sec) {
    if (!sec) return;
    sec.classList.remove('lf-editing');
    sec.querySelectorAll('[contenteditable=true]').forEach(function(el){ el.contentEditable = 'false'; });
    _secEditing = null;
  }

  /* ---------- global click: select + sync ---------- */
  document.addEventListener('mousedown', function(e) {
    var t = e.target;
    if (!t) return;
    if (t.closest && (t.closest('.lf-sec-controls') || t.closest('#lf-fmt-bar'))) return;

    // Remove previous highlight
    if (_sel && _sel !== t) _sel.classList.remove('lf-selected-el');

    _sel = t;
    _sel.classList.add('lf-selected-el');
    showFmt();
    syncFmt(t);

    // If it's an IMG, open file picker
    if (t.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = function(ev) {
        var f = ev.target.files && ev.target.files[0];
        if (!f) return;
        var r = new FileReader();
        r.onload = function(le) { t.src = le.target.result; t.style.filter = 'none'; };
        r.readAsDataURL(f);
      };
      inp.click();
    }
  }, true);

  /* ---------- toolbar actions ---------- */
  window.lfTC = function(v) {
    if (!_sel) return;
    _sel.style.setProperty('color', v, 'important');
  };
  window.lfBC = function(v) {
    if (!_sel) return;
    _sel.style.setProperty('background-color', v, 'important');
  };
  window.lfSC = function(v) {
    // Apply to nearest section ancestor
    var node = _sel;
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains('lf-edit-wrapper')) {
        node.style.setProperty('background-color', v, 'important');
        return;
      }
      node = node.parentElement;
    }
    if (_secEditing) _secEditing.style.setProperty('background-color', v, 'important');
  };
  window.lfBold = function() {
    if (!_sel) return;
    var fw = window.getComputedStyle(_sel).fontWeight;
    _sel.style.fontWeight = (fw === 'bold' || parseInt(fw) >= 700) ? '400' : 'bold';
  };
  window.lfItalic = function() {
    if (!_sel) return;
    var fi = window.getComputedStyle(_sel).fontStyle;
    _sel.style.fontStyle = fi === 'italic' ? 'normal' : 'italic';
  };
  window.lfFS = function(v) {
    if (_sel && v) _sel.style.setProperty('font-size', v, 'important');
  };
  window.lfDelEl = function() {
    if (_sel && confirm('Apagar este elemento?')) {
      var el = _sel; _sel = null;
      el.remove();
    }
  };
  window.lfCloseAll = function() {
    if (_sel) { _sel.classList.remove('lf-selected-el'); _sel = null; }
    if (_secEditing) stopEdit(_secEditing);
    var b = document.getElementById('lf-fmt-bar');
    if (b) { b.style.display = 'none'; _fmtVisible = false; }
  };

  /* ---------- AI fill section ---------- */
  function fillWithAI(sec, btn) {
    var p = window.parent;
    var leadData = null;
    try {
      var st = p.state;
      var sel = p.document.getElementById('genLeadSelect');
      var leadId = sel ? sel.value : '';
      if (leadId && st && st.leads) {
        var l = st.leads.find(function(x){ return x.id === leadId; });
        if (l) leadData = l;
      }
      if (!leadData && p.getSiteFormData) leadData = p.getSiteFormData();
    } catch(ex) {}

    if (!leadData || !leadData.name) {
      alert('Selecione um lead na aba Info antes de usar a IA.');
      return;
    }

    var textEls = Array.from(sec.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li'));
    textEls = textEls.filter(function(el) {
      return !el.closest('.lf-sec-controls') && !el.querySelector('h1,h2,h3,h4,p') && el.textContent.trim().length > 2;
    });
    if (!textEls.length) { alert('Nenhum texto encontrado nesta seção.'); return; }

    var texts = textEls.map(function(el, i){ return (i+1) + '. ' + el.textContent.trim().substring(0, 120); }).join('\\n');
    var prompt = 'Profissional: ' + (leadData.name||'') + ', ' + (leadData.specialty||'') + ', ' + (leadData.city||'Brasil') + '.\\n' +
      'Bio: ' + ((leadData.bio||leadData.tagline||'')).substring(0,200) + '\\n' +
      'Reescreva os textos abaixo para este profissional. Mantenha estrutura e tamanho similares.\\n' +
      'Retorne SOMENTE JSON: {"textos":["t1","t2",...]}\\n\\n' + texts;

    var orig = btn.textContent;
    btn.textContent = '⏳';
    btn.disabled = true;

    p.fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ system:'Responda SOMENTE JSON puro.', messages:[{role:'user',content:prompt}], maxTokens:600 })
    }).then(function(r){ return r.json(); }).then(function(d){
      var txt = (d.text||'').replace(/^[\s\S]*?\\{/, '{').replace(/\\}[^\\}]*$/, '}');
      var arr = JSON.parse(txt).textos || [];
      arr.forEach(function(t, i){ if (textEls[i] && t) textEls[i].textContent = t; });
      btn.textContent = '✅';
      setTimeout(function(){ btn.textContent = orig; btn.disabled = false; }, 1500);
    }).catch(function(){
      btn.textContent = orig; btn.disabled = false;
      alert('Erro ao chamar IA. Verifique se o servidor está rodando.');
    });
  }

  /* ---------- init ---------- */
  function init() {
    getSections().forEach(setupSection);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  setTimeout(init, 600);
  setTimeout(init, 2000); // catch Elementor lazy-rendered sections
})();
</script>
`;

  if (insertPos !== -1) {
    return html.slice(0, insertPos) + editorCode + html.slice(insertPos);
  } else {
    return html + editorCode;
  }
}
