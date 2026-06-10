const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// Find renderSectionPicker boundaries
const fnIdx = js.indexOf('function renderSectionPicker(');
let depth = 0, pos = fnIdx, fnEnd = -1;
while (pos < js.length) {
  if (js[pos] === '{') depth++;
  else if (js[pos] === '}') { depth--; if (depth === 0) { fnEnd = pos+1; break; } }
  pos++;
}
console.log('Found renderSectionPicker at', fnIdx, 'to', fnEnd);

const newFn = `function renderSectionPicker() {
  var container = document.getElementById('blocosContainer');
  if (!container) return;
  container.innerHTML = '';

  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:4px 0';

  var allSections = state.sectionLibrary || [];

  if (!allSections.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-muted);font-size:13px;">Nenhuma sessao ainda.<br><br>Adicione um template na Biblioteca para extrair sessoes automaticamente.</div>';
    container.appendChild(wrap);
    return;
  }

  var cats = {};
  for (var si = 0; si < allSections.length; si++) {
    var sec0 = allSections[si];
    var c = sec0.category || 'outros';
    if (!cats[c]) cats[c] = [];
    cats[c].push(sec0);
  }

  var catLabels = { hero: 'Hero', bio: 'Bio / Sobre', servicos: 'Servicos', faq: 'FAQ', cta: 'CTA / Contato', prova_social: 'Prova Social', localizacao: 'Localizacao', outros: 'Outros' };
  var catOrder = ['hero', 'bio', 'servicos', 'faq', 'cta', 'prova_social', 'localizacao', 'outros'];
  var sortedCats = catOrder.filter(function(c){return !!cats[c];}).concat(Object.keys(cats).filter(function(c){return catOrder.indexOf(c) === -1;}));

  for (var ci = 0; ci < sortedCats.length; ci++) {
    var cat = sortedCats[ci];
    var sections = cats[cat];
    if (!sections || !sections.length) continue;

    var catRow = document.createElement('div');
    catRow.style.cssText = 'background:rgba(255,255,255,.03);border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.06)';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;user-select:none;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;';
    var labelSpan = document.createElement('span');
    labelSpan.textContent = (catLabels[cat] || cat) + ' (' + sections.length + ')';
    var arrow = document.createElement('span');
    arrow.textContent = '\u25B6';
    arrow.style.cssText = 'font-size:9px;transition:transform .2s;transform:rotate(0deg)';
    header.appendChild(labelSpan);
    header.appendChild(arrow);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:none;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;padding:0 14px 14px';

    header.addEventListener('click', function(g, a) {
      return function() {
        var open = g.style.display === 'grid';
        g.style.display = open ? 'none' : 'grid';
        a.style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
      };
    }(grid, arrow));

    catRow.appendChild(header);

    (function(sections) {
      for (var ii = 0; ii < sections.length; ii++) {
        (function(sec) {
          var isActive = state._previewSection === sec.id;
          var card = document.createElement('div');
          card.style.cssText = 'border-radius:10px;cursor:pointer;border:2px solid ' + (isActive ? '#7C3AED' : 'rgba(255,255,255,.07)') + ';background:' + (isActive ? 'rgba(124,58,237,.1)' : 'rgba(255,255,255,.03)') + ';overflow:hidden;transition:.15s;position:relative;';
          card.draggable = true;
          card.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', sec.id);
            e.dataTransfer.effectAllowed = 'copy';
          });

          var previewWrap = document.createElement('div');
          previewWrap.style.cssText = 'position:relative;overflow:hidden;height:90px;background:#f0f0f0;';
          var iframe = document.createElement('iframe');
          iframe.scrolling = 'no';
          iframe.loading = 'lazy';
          iframe.style.cssText = 'width:400%;height:400%;transform:scale(0.25);transform-origin:0 0;border:none;pointer-events:none;';
          var srcHtml = sec.html || '';
          if (srcHtml && srcHtml.indexOf('<!DOCTYPE') !== 0) {
            srcHtml = '<!DOCTYPE html><html><head><style>body{margin:0;padding:0}</style></head><body>' + srcHtml + '</body></html>';
          }
          iframe.srcdoc = srcHtml;
          previewWrap.appendChild(iframe);

          // Hover overlay
          var overlay = document.createElement('div');
          overlay.style.cssText = 'position:absolute;inset:0;background:rgba(124,58,237,.82);display:flex;align-items:center;justify-content:center;opacity:0;transition:.15s;z-index:5';
          overlay.innerHTML = '<span style="color:#fff;font-size:11px;font-weight:700;text-align:center;padding:4px">\u25B6 Ver Previa</span>';
          previewWrap.appendChild(overlay);

          card.addEventListener('mouseenter', function() {
            overlay.style.opacity = '1';
            if (!isActive) card.style.borderColor = 'rgba(124,58,237,.5)';
          });
          card.addEventListener('mouseleave', function() {
            overlay.style.opacity = '0';
            if (!isActive) card.style.borderColor = 'rgba(255,255,255,.07)';
          });

          if (isActive) {
            var badge = document.createElement('div');
            badge.style.cssText = 'position:absolute;top:4px;right:4px;background:#7C3AED;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.5px;z-index:6';
            badge.textContent = 'Ativo';
            previewWrap.appendChild(badge);
          }

          var info = document.createElement('div');
          info.style.cssText = 'padding:8px 10px';
          var secLabel = sec.name.replace(sec.fromTemplate ? sec.fromTemplate + ' \u2014 ' : '', '');
          info.innerHTML = '<div style="font-size:11px;font-weight:700;color:' + (isActive ? '#c4b5fd' : 'var(--text-secondary)') + ';margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + (sec.name||'') + '">' + secLabel + '</div>' +
            '<div style="font-size:10px;color:rgba(255,255,255,.25);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (sec.fromTemplate || '') + '</div>';

          card.appendChild(previewWrap);
          card.appendChild(info);
          card.onclick = function() { addExtractedSectionToSite(sec); };
          grid.appendChild(card);
        })(sections[ii]);
      }
    })(sections);

    catRow.appendChild(grid);
    wrap.appendChild(catRow);
  }

  container.appendChild(wrap);

  // Drag-and-drop onto preview panel (setup once)
  var previewPanel = document.querySelector('.preview-panel');
  if (previewPanel && !previewPanel._sectionDropSetup) {
    previewPanel._sectionDropSetup = true;
    previewPanel.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      previewPanel.style.outline = '3px dashed #7C3AED';
    });
    previewPanel.addEventListener('dragleave', function() {
      previewPanel.style.outline = '';
    });
    previewPanel.addEventListener('drop', function(e) {
      e.preventDefault();
      previewPanel.style.outline = '';
      var secId = e.dataTransfer.getData('text/plain');
      var dropped = (state.sectionLibrary || []).find(function(s){ return s.id === secId; });
      if (!dropped) return;
      if (state.generatedHTML) {
        var insert = dropped.html || '';
        if (insert.indexOf('<!DOCTYPE') === 0) {
          var bodyMatch = insert.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          insert = bodyMatch ? bodyMatch[1] : insert;
        }
        var newHtml = state.generatedHTML.replace('</body>', insert + '</body>');
        state.generatedHTML = newHtml;
        var ifr = document.getElementById('sitePreview');
        if (ifr) ifr.srcdoc = newHtml;
        toast('Secao adicionada ao site!');
      } else {
        addExtractedSectionToSite(dropped);
      }
    });
  }
}`;

js = js.substring(0, fnIdx) + newFn + js.substring(fnEnd);

try { new Function(js); console.log('SYNTAX OK'); } catch(e) { console.error('SYNTAX ERROR:', e.message); }
fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js);
console.log('renderSectionPicker: categories now collapsed by default');
