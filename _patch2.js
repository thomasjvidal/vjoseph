const fs = require('fs');
let js = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');

// ─── 1. Replace renderSectionPicker — only sectionLibrary with previews ───
const funcStart = js.indexOf('function renderSectionPicker() {');
if (funcStart === -1) { console.error('renderSectionPicker not found'); process.exit(1); }

let depth = 0, pos = funcStart, funcEnd = -1;
while (pos < js.length) {
  if (js[pos] === '{') depth++;
  else if (js[pos] === '}') { depth--; if (depth === 0) { funcEnd = pos + 1; break; } }
  pos++;
}

const newRenderSectionPicker = `function renderSectionPicker() {
  const container = document.getElementById('blocosContainer');
  if (!container) return;
  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:20px;padding:4px 0';

  const allSections = state.sectionLibrary || [];

  if (!allSections.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-muted);font-size:13px;">Nenhuma sessão ainda.<br><br>Adicione um template na Biblioteca para extrair sessões automaticamente.</div>';
    container.appendChild(wrap);
    return;
  }

  // Group by category
  const cats = {};
  for (const sec of allSections) {
    const c = sec.category || 'outros';
    if (!cats[c]) cats[c] = [];
    cats[c].push(sec);
  }

  const catLabels = { hero: 'Hero', bio: 'Bio / Sobre', servicos: 'Serviços', faq: 'FAQ', cta: 'CTA / Contato', prova_social: 'Prova Social', localizacao: 'Localização', outros: 'Outros' };
  const catOrder = ['hero', 'bio', 'servicos', 'faq', 'cta', 'prova_social', 'localizacao', 'outros'];

  const sortedCats = [...catOrder.filter(c => cats[c]), ...Object.keys(cats).filter(c => !catOrder.includes(c))];

  for (const cat of sortedCats) {
    const sections = cats[cat];
    if (!sections || !sections.length) continue;

    const catRow = document.createElement('div');

    const header = document.createElement('div');
    header.style.cssText = 'font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px';
    header.textContent = catLabels[cat] || cat;
    catRow.appendChild(header);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px';

    for (const sec of sections) {
      const isActive = (state.selectedSections || []).includes(sec.id);
      const card = document.createElement('div');
      card.style.cssText = 'border-radius:10px;cursor:pointer;border:2px solid ' + (isActive ? '#7C3AED' : 'rgba(255,255,255,.07)') + ';background:' + (isActive ? 'rgba(124,58,237,.1)' : 'rgba(255,255,255,.03)') + ';overflow:hidden;transition:.15s;';
      card.onmouseenter = () => { if (!isActive) card.style.borderColor = 'rgba(124,58,237,.4)'; };
      card.onmouseleave = () => { if (!isActive) card.style.borderColor = 'rgba(255,255,255,.07)'; };

      // Mini preview iframe
      const previewWrap = document.createElement('div');
      previewWrap.style.cssText = 'position:relative;overflow:hidden;height:90px;background:#1a1a2e;';
      const iframe = document.createElement('iframe');
      iframe.scrolling = 'no';
      iframe.loading = 'lazy';
      iframe.style.cssText = 'width:400%;height:400%;transform:scale(0.25);transform-origin:0 0;border:none;pointer-events:none;';
      iframe.srcdoc = sec.html || '';
      previewWrap.appendChild(iframe);

      if (isActive) {
        const badge = document.createElement('div');
        badge.style.cssText = 'position:absolute;top:4px;right:4px;background:#7C3AED;color:#fff;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.5px';
        badge.textContent = 'Ativo';
        previewWrap.appendChild(badge);
      }

      const info = document.createElement('div');
      info.style.cssText = 'padding:8px 10px';
      const secLabel = sec.name.replace(sec.fromTemplate ? sec.fromTemplate + ' — ' : '', '');
      info.innerHTML = '<div style="font-size:11px;font-weight:700;color:' + (isActive ? '#c4b5fd' : 'var(--text-secondary)') + ';margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + sec.name + '">' + secLabel + '</div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,.25);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (sec.fromTemplate || '') + '</div>';

      card.appendChild(previewWrap);
      card.appendChild(info);
      card.onclick = () => addExtractedSectionToSite(sec);
      grid.appendChild(card);
    }

    catRow.appendChild(grid);
    wrap.appendChild(catRow);
  }

  container.appendChild(wrap);
}`;

js = js.substring(0, funcStart) + newRenderSectionPicker + js.substring(funcEnd);
console.log('1. renderSectionPicker replaced');

// ─── 2. Add initBuiltinSections() before BUILTIN_TEMPLATES ───
const builtinIdx = js.indexOf('const BUILTIN_TEMPLATES = [');
if (builtinIdx === -1) { console.error('BUILTIN_TEMPLATES not found'); process.exit(1); }

const initBuiltinFn = `
// ========== AUTO-EXTRACT SECTIONS FROM BUILTIN TEMPLATES ==========
function initBuiltinSections() {
  if (!state.sectionLibrary) state.sectionLibrary = [];
  const previewData = {
    name: 'Dra. Ana Lima', specialty: 'Nutricionista Esportiva', city: 'São Paulo, SP',
    attendance: 'Online e Presencial', tagline: 'Transforme sua saúde com nutrição de alta performance',
    bio: 'Especialista em nutrição esportiva com mais de 10 anos de experiência.', initials: 'DA',
    services: ['Consulta Nutricional', 'Plano Alimentar', 'Acompanhamento Esportivo', 'Suplementação'],
    whatsapp: '11999999999', whatsapp_clean: '11999999999', instagram: '@draanalima',
    cta: 'Agendar Consulta', photo: '', images: {}
  };

  for (const tpl of BUILTIN_TEMPLATES) {
    const alreadyHas = state.sectionLibrary.some(s => s.fromTemplate === tpl.name);
    if (alreadyHas) continue;
    try {
      const html = tpl.generator(previewData);
      const extracted = extractSectionsFromHTML(html, tpl.name);
      state.sectionLibrary.push(...extracted);
    } catch(e) { console.warn('Section extraction failed for', tpl.name, e); }
  }
  save();
}
// ========== END AUTO-EXTRACT ==========

`;

js = js.substring(0, builtinIdx) + initBuiltinFn + js.substring(builtinIdx);
console.log('2. initBuiltinSections() added');

// ─── 3. Call initBuiltinSections after load() ───
// Find where renderGeneratorTemplates() is called after loading localStorage
const afterLoad = '    renderGeneratorTemplates();\n    // Start sidebar collapsed';
const afterLoadNew = '    renderGeneratorTemplates();\n    // Auto-extract sections from built-in templates\n    setTimeout(initBuiltinSections, 0);\n    // Start sidebar collapsed';
if (js.includes(afterLoad)) {
  js = js.replace(afterLoad, afterLoadNew);
  console.log('3. initBuiltinSections called after load()');
} else { console.error('3. load call site not found'); }

// ─── 4. Template click → auto-generate preview ───
const oldClickHandler = `    el.addEventListener('click', () => {
      document.querySelectorAll('.template-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      state.selectedTemplate = t.id;
    });`;
const newClickHandler = `    el.addEventListener('click', () => {
      document.querySelectorAll('.template-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      state.selectedTemplate = t.id;
      // Auto-generate preview when template is selected
      if (typeof generateSite === 'function') generateSite();
    });`;
if (js.includes(oldClickHandler)) {
  js = js.replace(oldClickHandler, newClickHandler);
  console.log('4. Template click auto-generates preview');
} else { console.error('4. click handler not found'); }

fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', js, 'utf-8');
console.log('app.js saved');

// ─── 5. Biblioteca — show BUILTIN_TEMPLATES too (lab-library.js) ───
let lib = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/lab-library.js', 'utf-8');

const oldLandingItems = `      // Landing page usa state.customTemplates (mesmo sistema do Gerador de Sites)
      const landingItems = (state.customTemplates || []).map(t => ({
        id: t.id,
        name: t.name,
        type: t.type || null,
        desc: 'Landing page personalizada',
        vars: (t.html || '').match(/{{(.*?)}}/g)
          ? [...new Set((t.html.match(/{{(.*?)}}/g)||[]).map(v=>v.replace(/{{|}}/g,'')))]
          : [],
        html: t.html
      }));
      renderLibraryGridLanding(landingGrid, landingItems);`;

const newLandingItems = `      // Landing page usa BUILTIN_TEMPLATES + state.customTemplates
      const builtinItems = (typeof BUILTIN_TEMPLATES !== 'undefined' ? BUILTIN_TEMPLATES : []).map(t => ({
        id: t.id,
        name: t.name,
        type: 'builtin',
        isBuiltin: true,
        desc: 'Template nativo do sistema',
        vars: ['nome', 'especialidade', 'cidade', 'bio', 'servicos', 'whatsapp', 'instagram'],
        html: null
      }));
      const customItems = (state.customTemplates || []).map(t => ({
        id: t.id,
        name: t.name,
        type: t.type || null,
        desc: 'Landing page personalizada',
        vars: (t.html || '').match(/{{(.*?)}}/g)
          ? [...new Set((t.html.match(/{{(.*?)}}/g)||[]).map(v=>v.replace(/{{|}}/g,'')))]
          : [],
        html: t.html
      }));
      const landingItems = [...builtinItems, ...customItems];
      renderLibraryGridLanding(landingGrid, landingItems);`;

if (lib.includes(oldLandingItems)) {
  lib = lib.replace(oldLandingItems, newLandingItems);
  console.log('5. Biblioteca now shows BUILTIN_TEMPLATES too');
} else { console.error('5. landingItems pattern not found in lab-library.js'); }

// ─── 6. renderLibraryGridLanding — handle isBuiltin (no edit/delete) ───
const oldCardHtml = `          <div style="display:flex;gap:7px;">
            <button class="btn-secondary" onclick="editTemplateHtml('landing','${item.id}')" style="flex:1;justify-content:center;font-size:12px;">🖊️ Editar HTML</button>
            <button class="btn-secondary" onclick="deleteCustomTemplate('${item.id}')" style="padding:7px 10px;justify-content:center;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171;" title="Excluir template">🗑️</button>
          </div>`;

// Use regex to find and update the card render in renderLibraryGridLanding
// Replace the map function to check isBuiltin
const oldReturnMap = `    const typeObj  = _allTypes.find(t => t.name === item.type);
    const typeLabel = typeObj ? typeObj.label : (item.type ? item.type.replace(/_/g,' ') : 'Landing Page');

    return \`
      <div class="template-card" style="background:var(--bg-surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform .2s;">
        <div style="height:140px;background:linear-gradient(135deg,#f59e0b 0%,#ef4444 100%);display:flex;align-items:center;justify-content:center;color:white;position:relative;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:40px;height:40px;opacity:.8;"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.3);color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">\${typeLabel}</span>
        </div>
        <div style="padding:16px;">
          <h3 style="font-size:15px;font-weight:600;margin:0 0 6px;color:var(--text-primary);">\${item.name}</h3>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;min-height:22px;">\${varsHtml || '<span style="color:var(--text-muted);font-size:12px;">Sem variáveis detectadas</span>'}</div>
          <div style="display:flex;gap:7px;">
            <button class="btn-secondary" onclick="editTemplateHtml('landing','\${item.id}')" style="flex:1;justify-content:center;font-size:12px;">🖊️ Editar HTML</button>
            <button class="btn-secondary" onclick="deleteCustomTemplate('\${item.id}')" style="padding:7px 10px;justify-content:center;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171;" title="Excluir template">🗑️</button>
          </div>
        </div>
      </div>\`;`;

const newReturnMap = `    const typeObj  = _allTypes.find(t => t.name === item.type);
    const typeLabel = item.isBuiltin ? 'Nativo' : (typeObj ? typeObj.label : (item.type ? item.type.replace(/_/g,' ') : 'Landing Page'));
    const bgGradient = item.isBuiltin ? 'linear-gradient(135deg,#7C3AED 0%,#06B6D4 100%)' : 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)';
    const actionBtns = item.isBuiltin
      ? \`<button class="btn-secondary" onclick="navigate('generator');genGoSlide(1)" style="flex:1;justify-content:center;font-size:12px;">🎨 Usar no Gerador</button>\`
      : \`<button class="btn-secondary" onclick="editTemplateHtml('landing','\${item.id}')" style="flex:1;justify-content:center;font-size:12px;">🖊️ Editar HTML</button>
         <button class="btn-secondary" onclick="deleteCustomTemplate('\${item.id}')" style="padding:7px 10px;justify-content:center;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171;" title="Excluir template">🗑️</button>\`;

    return \`
      <div class="template-card" style="background:var(--bg-surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform .2s;">
        <div style="height:140px;background:\${bgGradient};display:flex;align-items:center;justify-content:center;color:white;position:relative;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:40px;height:40px;opacity:.8;"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,.3);color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">\${typeLabel}</span>
        </div>
        <div style="padding:16px;">
          <h3 style="font-size:15px;font-weight:600;margin:0 0 6px;color:var(--text-primary);">\${item.name}</h3>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;min-height:22px;">\${varsHtml || '<span style="color:var(--text-muted);font-size:12px;">Sem variáveis detectadas</span>'}</div>
          <div style="display:flex;gap:7px;">\${actionBtns}</div>
        </div>
      </div>\`;`;

if (lib.includes(oldReturnMap)) {
  lib = lib.replace(oldReturnMap, newReturnMap);
  console.log('6. Library card updated for isBuiltin handling');
} else { console.error('6. returnMap not found in lab-library.js'); }

fs.writeFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/lab-library.js', lib, 'utf-8');
console.log('lab-library.js saved');

// Syntax check
const js2 = fs.readFileSync('C:/Users/milen/OneDrive/Ambiente de Trabalho/vjoseph/app.js', 'utf-8');
try { new Function(js2); console.log('app.js syntax OK'); } catch(e) { console.error('app.js SYNTAX ERROR:', e.message); }
