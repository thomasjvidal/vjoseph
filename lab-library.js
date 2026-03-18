
// lab-library.js - Extensions for Lab de Mensagens & Biblioteca de Templates

// Ensure state objects exist
if (typeof state !== 'undefined') {
  if (!state.messageLab) state.messageLab = {};
  if (!state.templateLibrary) state.templateLibrary = {};
}

// Global state for current lab stage
window.currentLabStage = 'dm1';

// Load Lab Data from LocalStorage immediately
try {
  const savedLab = localStorage.getItem('lf_messageLab');
  const savedLib = localStorage.getItem('lf_templateLibrary');
  if (savedLab) state.messageLab = JSON.parse(savedLab);
  if (savedLib) state.templateLibrary = JSON.parse(savedLib);
} catch (e) {
  console.error('Error loading Lab data:', e);
}

// Initialization Function with Event Delegation
function initLabEvents() {
  // Event Delegation for Tabs
  const tabsContainer = document.querySelector('.lab-tabs');
  if (tabsContainer) {
    // Remove old listener if possible (cloning container is a safe way to wipe listeners)
    const newContainer = tabsContainer.cloneNode(true);
    tabsContainer.parentNode.replaceChild(newContainer, tabsContainer);
    
    newContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.lab-tab');
      if (btn) {
        const stage = btn.dataset.stage;
        if (stage) {
          window.currentLabStage = stage;
          renderMessageLab(stage);
        }
      }
    });
  }

  // Attach New Copy Button Listener
  // Removed to rely on HTML onclick attribute
}

// Call init when script loads (or when DOM is ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLabEvents);
} else {
  initLabEvents();
}

// ── Escuta mudanças no lf_messageLab feitas pelo HQ (iframe) ─────────────────
// O Storage Event dispara apenas em janelas que NÃO fizeram a mudança,
// então quando o HQ (iframe) salva, a janela pai recebe aqui.
window.addEventListener('storage', function(e) {
  if (e.key === 'lf_messageLab' && e.newValue) {
    try {
      const updated = JSON.parse(e.newValue);
      if (typeof state !== 'undefined') state.messageLab = updated;
      // Se a aba Lab de Mensagens está visível, re-renderiza
      const labView = document.getElementById('view-lab-mensagens');
      if (labView && labView.classList.contains('active')) {
        renderMessageLab(window.currentLabStage || 'dm1');
      }
    } catch (err) {}
  }
});

// Render Lab
function renderMessageLab(stageId) {
  if (!stageId) stageId = window.currentLabStage || 'dm1';
  window.currentLabStage = stageId;

  // Ensure stage array exists
  if (!state.messageLab[stageId]) {
    state.messageLab[stageId] = [];
  }
  
  // Update Tabs UI
  document.querySelectorAll('.lab-tab').forEach(t => {
    const isActive = t.dataset.stage === stageId;
    t.classList.toggle('active', isActive);
    if(isActive) {
      t.style.background = 'var(--primary)';
      t.style.color = 'white';
      t.style.border = 'none';
    } else {
      t.style.background = 'var(--bg-surface)';
      t.style.color = 'var(--text-secondary)';
      t.style.border = '1px solid var(--border)';
    }
  });

  const container = document.querySelector('.lab-cards-grid');
  if (!container) return;

  const messages = state.messageLab[stageId] || [];
  
  // Responsive Grid for Lab Cards
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  container.style.gap = '24px';

  if (messages.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Nenhuma mensagem cadastrada neste estágio. Adicione uma nova copy.</div>`;
  } else {
    const messagesHtml = messages.map(m => {
      // Find best performer logic if needed, but let's keep it simple for now
      const isBest = false; // logic can be added later

      return `
        <div class="lab-card" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; position: relative;">
          ${isBest ? '<div style="position: absolute; top: -10px; right: 20px; background: #22c55e; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Melhor Copy 🏆</div>' : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span style="background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${m.name}</span>
            <button onclick="deleteLabMessage('${stageId}', '${m.id}')" style="background: none; border: none; cursor: pointer; color: var(--text-muted);" title="Excluir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
          
          <div style="background: rgba(0,0,0,0.03); border-radius: 8px; padding: 12px; font-size: 14px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 16px; min-height: 80px; white-space: pre-wrap;">${(typeof escapeXml === 'function' ? escapeXml(m.text) : m.text)}</div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 12px;">
              <div>
                <span style="display: block; font-size: 11px; margin-bottom: 2px;">Envios</span>
                <strong style="color: var(--text-primary);">${m.sentCount || 0}</strong>
              </div>
              <div style="text-align: right;">
                 <span style="display: block; font-size: 11px; margin-bottom: 2px;">Resp.</span>
                 <strong style="color: var(--primary);">${m.replyRate || '0%'}</strong>
              </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn-secondary" onclick="copyLabMessage('${(typeof escapeXml === 'function' ? escapeXml(m.text) : m.text)}')" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copiar
            </button>
            <button class="btn-secondary" onclick="editLabMessage('${stageId}', '${m.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
          </div>
        </div>
      `;
    }).join('');
    container.innerHTML = messagesHtml;
  }
  
  // Ensure "Nova Copy" button has correct icon/text if needed (but rely on HTML onclick)
  let newBtn = document.getElementById('btn-new-lab-test');
  if (newBtn && !newBtn.onclick) {
     newBtn.onclick = () => addNewLabMessage(stageId);
  }

  // Update Metrics Summary with Real Data
  const metricsCard = document.querySelector('.lab-container .dashboard-card');
  if(metricsCard) {
      let totalSent = 0;
      let bestPerformer = null;
      let bestRate = -1;
      let rateSum = 0;
      let countWithRate = 0;
      
      messages.forEach(m => {
          const sent = parseInt(m.sentCount || 0);
          const rateStr = String(m.replyRate || '0%').replace('%', '');
          const rate = parseFloat(rateStr);
          
          totalSent += sent;
          if(!isNaN(rate) && rate > bestRate) {
              bestRate = rate;
              bestPerformer = m;
          }
          if(sent > 0 && !isNaN(rate)) {
            rateSum += rate;
            countWithRate++;
          }
      });

      const avgRate = countWithRate > 0 ? (rateSum / countWithRate).toFixed(1) + '%' : '0%';
      const bestName = bestPerformer ? `${bestPerformer.name} (${bestRate}%)` : '—';

      metricsCard.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div>
            <span style="font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 4px;">Melhor Performance</span>
            <span style="font-size: 18px; font-weight: 600; color: #22c55e;">${bestName}</span>
          </div>
          <div>
            <span style="font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 4px;">Total Envios</span>
            <span style="font-size: 18px; font-weight: 600; color: var(--text-primary);">${totalSent}</span>
          </div>
          <div>
            <span style="font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 4px;">Taxa Média Resposta</span>
            <span style="font-size: 18px; font-weight: 600; color: var(--primary);">${avgRate}</span>
          </div>
        </div>
      `;
  }
}

window.addNewLabMessage = function(stageId) {
  if (!stageId) stageId = window.currentLabStage || 'dm1';
  openLabMessageModal('create', stageId);
};

// --- MODAL LOGIC FOR LAB MESSAGES ---

window.openLabMessageModal = function(mode, stage, id) {
  const modal = document.getElementById('labMessageModal');
  const titleEl = document.getElementById('labMessageModalTitle');
  const idEl = document.getElementById('labMsgId');
  const stageEl = document.getElementById('labMsgStage');
  const nameEl = document.getElementById('labMsgName');
  const textEl = document.getElementById('labMsgText');
  const sentEl = document.getElementById('labMsgSent');
  const rateEl = document.getElementById('labMsgRate');

  if (!modal) {
    console.error('Modal labMessageModal not found');
    return;
  }

  // Reset fields
  idEl.value = '';
  stageEl.value = stage || window.currentLabStage || 'dm1';
  nameEl.value = '';
  textEl.value = '';
  sentEl.value = '';
  rateEl.value = '';

  if (mode === 'edit' && id) {
    titleEl.textContent = 'Editar Copy';
    idEl.value = id;
    
    // Find message
    if (state.messageLab[stage]) {
      const msg = state.messageLab[stage].find(m => m.id === id);
      if (msg) {
        nameEl.value = msg.name || '';
        textEl.value = msg.text || '';
        sentEl.value = msg.sentCount || 0;
        rateEl.value = msg.replyRate || '0%';
      }
    }
  } else {
    titleEl.textContent = 'Nova Copy';
  }

  modal.classList.add('open');
};

window.closeLabMessageModal = function() {
  const modal = document.getElementById('labMessageModal');
  if (modal) {
    modal.classList.remove('open');
  }
};

window.saveLabMessage = function() {
  const id = document.getElementById('labMsgId').value;
  const stage = document.getElementById('labMsgStage').value;
  const name = document.getElementById('labMsgName').value;
  const text = document.getElementById('labMsgText').value;
  let sent = document.getElementById('labMsgSent').value;
  let rate = document.getElementById('labMsgRate').value;

  if (!name || !text) {
    alert('Nome e Mensagem são obrigatórios.');
    return;
  }

  // Ensure stage exists
  if (!state.messageLab[stage]) state.messageLab[stage] = [];

  sent = parseInt(sent) || 0;
  if (!rate.includes('%')) rate += '%';
  if (rate === '%') rate = '0%';

  if (id) {
    // Update existing
    const msg = state.messageLab[stage].find(m => m.id === id);
    if (msg) {
      msg.name = name;
      msg.text = text;
      msg.sentCount = sent;
      msg.replyRate = rate;
      if(typeof toast === 'function') toast('Copy atualizada!');
    }
  } else {
    // Create new
    const newId = 'copy_' + Date.now();
    state.messageLab[stage].push({
      id: newId,
      name,
      text,
      sentCount: sent,
      replyRate: rate
    });
    if(typeof toast === 'function') toast('Copy criada!');
  }

  if (typeof save === 'function') save();
  renderMessageLab(stage);
  closeLabMessageModal();
};

// Render Library
function renderTemplateLibrary(category = 'minichat') {
  // Update Tabs UI
  document.querySelectorAll('.library-tab').forEach(t => {
    const isActive = t.dataset.category === category;
    t.classList.toggle('active', isActive);
    if (isActive) {
      t.style.borderBottom = '2px solid var(--primary)';
      t.style.color = 'var(--primary)';
    } else {
      t.style.borderBottom = '2px solid transparent';
      t.style.color = 'var(--text-muted)';
    }
  });

  const minichatGrid = document.getElementById('lib-section-minichat');
  const landingGrid = document.getElementById('lib-section-landing');
  
  // Initialize if empty
  if (!state.templateLibrary.minichat) state.templateLibrary.minichat = [];
  if (!state.templateLibrary.landing) state.templateLibrary.landing = [];
  
  if (minichatGrid && landingGrid) {
    if (category === 'minichat') {
      minichatGrid.style.display = 'grid';
      landingGrid.style.display = 'none';
      renderLibraryGrid(minichatGrid, state.templateLibrary.minichat, 'minichat');
    } else {
      minichatGrid.style.display = 'none';
      landingGrid.style.display = 'grid';
      renderLibraryGrid(landingGrid, state.templateLibrary.landing, 'landing');
    }
  }
}

function renderLibraryGrid(container, items, type) {
  if (!items || items.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Nenhum template encontrado.</div>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const varsHtml = (item.vars || []).map(v => 
      `<span style="background: rgba(0,0,0,0.05); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 11px; font-family: monospace;">[${v}]</span>`
    ).join('');

    const icon = type === 'minichat' 
      ? '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' 
      : '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/>';
    
    const gradient = type === 'minichat'
      ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
      : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';

    const tagColor = type === 'minichat' ? '#10b981' : '#3b82f6';
    const tagBg = type === 'minichat' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    const typeLabel = type === 'minichat' ? 'Mini Chat' : 'Landing Page';

    return `
      <div class="template-card" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: transform 0.2s;">
        <div style="height: 160px; background: ${gradient}; display: flex; align-items: center; justify-content: center; color: white;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; opacity: 0.8;">${icon}</svg>
        </div>
        <div style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: var(--text-primary);">${item.name}</h3>
            <span style="background: ${tagBg}; color: ${tagColor}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">${typeLabel}</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">${item.desc}</p>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Variáveis</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${varsHtml}
            </div>
          </div>
          <button class="btn-secondary" onclick="editTemplate('${type}', '${item.id}')" style="width: 100%; justify-content: center;">Editar Template</button>
        </div>
      </div>
    `;
  }).join('');
}

// Global Actions
window.copyLabMessage = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    if(typeof toast === 'function') toast('Mensagem copiada!');
    else alert('Mensagem copiada!');
  });
};

window.deleteLabMessage = function(stage, id) {
  if(confirm('Tem certeza que deseja excluir esta mensagem?')) {
    state.messageLab[stage] = state.messageLab[stage].filter(m => m.id !== id);
    if(typeof save === 'function') save();
    renderMessageLab(stage);
    if(typeof toast === 'function') toast('Mensagem excluída.');
  }
};

window.editLabMessage = function(stage, id) {
  openLabMessageModal('edit', stage, id);
};

window.editTemplate = function(type, id) {
  const items = state.templateLibrary[type];
  if (!items) return;
  const item = items.find(t => t.id === id);
  if (item) {
    const newName = prompt('Nome do Template:', item.name);
    if (newName) {
      const newDesc = prompt('Descrição do Template:', item.desc);
      if (newDesc) {
        item.name = newName;
        item.desc = newDesc;
        if (typeof save === 'function') save();
        renderTemplateLibrary(type);
        if (typeof toast === 'function') toast('Template atualizado com sucesso!');
      }
    }
  }
};

// Monkey Patching & Global Overrides
const originalNavigate = window.navigate;
window.navigate = function(view, activeNavEl) {
  if (originalNavigate) originalNavigate(view, activeNavEl);
  
  if (view === 'lab-mensagens') {
    renderMessageLab();
  }
  if (view === 'biblioteca-templates') {
    renderTemplateLibrary();
  }
  if (view === 'generator') {
    renderTemplateLibrary();
  }
};

// Lead Counter
function updateLeadCounter() {
  const countEl = document.getElementById('nav-leads-count');
  if (countEl && state && state.leads) {
    countEl.textContent = state.leads.length;
  }
}

const originalSave = window.save;
window.save = function() {
  if (originalSave) originalSave();
  try {
    localStorage.setItem('lf_messageLab', JSON.stringify(state.messageLab));
    localStorage.setItem('lf_templateLibrary', JSON.stringify(state.templateLibrary));
    updateLeadCounter();
  } catch(e) { console.error('Lab/Lib Save Error', e); }
};

// Override Pipeline Renderer to use Premium Card Design
window.renderProspectMiniKanban = function(countPrefix = 'k3-', colPrefix = 'kanbanv3-') {
  const stages = (typeof DASH2_STAGES !== 'undefined' && Array.isArray(DASH2_STAGES)) ? DASH2_STAGES : [];
  const cols = {};
  stages.forEach(s => { cols[s.id] = []; });

  state.leads.forEach(l => {
    const stageId = l.pipelineStageV2 || 'coletados';
    if (cols[stageId]) cols[stageId].push(l);
  });

  stages.forEach(s => {
    const leads = cols[s.id] || [];
    const countEl = document.getElementById(`${countPrefix}${s.id}`);
    if (countEl) countEl.textContent = leads.length;

    const container = document.getElementById(`${colPrefix}${s.id}`);
    if (!container) return;

    // Render cards using lead-carousel-premium.css classes
    container.innerHTML = leads.map(l => {
      const handle = (l.instagram || '').replace('https://instagram.com/', '@').replace('/', '');
      
      return `
      <div class="lead-carousel-card kanban-dnd-item" draggable="true" data-id="${l.id}" 
           style="padding: 12px; gap: 8px; margin-bottom: 12px; cursor: grab; min-height: 80px; grid-template-columns: 1fr;">
        <div class="lead-carousel-card-head" style="gap: 10px; align-items: center;">
          <div class="lead-carousel-card-title">
            <div class="lead-carousel-lead-name" style="font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${l.name}</div>
            <div class="lead-carousel-lead-sub" style="font-size: 11px;">${handle}</div>
          </div>
          <div class="lead-carousel-stage-dot" style="background:${s.color || '#ccc'}; width: 8px; height: 8px; animation: none; flex-shrink: 0;"></div>
        </div>
        
        <div class="prospect-actions" style="display: flex; gap: 4px; margin-top: 8px; flex-wrap: wrap;">
          <button class="p-action-btn" title="Copiar Mensagem" onclick="event.stopPropagation(); prospectAction('${l.id}', 'copy_msg')" style="flex: 1; min-width: 32px; padding: 6px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-secondary); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button class="p-action-btn" title="Abrir Instagram" onclick="event.stopPropagation(); prospectAction('${l.id}', 'open_insta')" style="flex: 1; min-width: 32px; padding: 6px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-secondary); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </button>
          <button class="p-action-btn" title="Abrir WhatsApp" onclick="event.stopPropagation(); prospectAction('${l.id}', 'open_whats')" style="flex: 1; min-width: 32px; padding: 6px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-secondary); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </button>
          <button class="p-action-btn" title="Gerar Site" onclick="event.stopPropagation(); prospectAction('${l.id}', 'generate_site')" style="flex: 1; min-width: 32px; padding: 6px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-secondary); border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  });
  
  updateLeadCounter();
};

// Drag and Drop Logic for Pipeline
let draggedItem = null;

document.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('kanban-dnd-item')) {
    draggedItem = e.target;
    e.target.style.opacity = '0.5';
    try { e.dataTransfer.setData('text/plain', e.target.dataset.id); } catch(ex) {}
    e.dataTransfer.effectAllowed = 'move';
  }
});

// Tab Switching Logic
window.switchLeadTab = function(tab) {
  const tUnico = document.getElementById('tab-unico');
  const tPipeline = document.getElementById('tab-pipeline');
  const bUnico = document.getElementById('btn-tab-unico');
  const bPipeline = document.getElementById('btn-tab-pipeline');

  if (tab === 'unico') {
    if(tUnico) tUnico.style.display = 'block';
    if(tPipeline) tPipeline.style.display = 'none';
    if(bUnico) { 
      bUnico.classList.add('active'); 
      bUnico.style.borderBottom = '2px solid var(--primary)'; 
      bUnico.style.color = 'var(--text-primary)'; 
    }
    if(bPipeline) { 
      bPipeline.classList.remove('active'); 
      bPipeline.style.borderBottom = '2px solid transparent'; 
      bPipeline.style.color = 'var(--text-muted)'; 
    }
  } else {
    if(tUnico) tUnico.style.display = 'none';
    if(tPipeline) tPipeline.style.display = 'block';
    if(bUnico) { 
      bUnico.classList.remove('active'); 
      bUnico.style.borderBottom = '2px solid transparent'; 
      bUnico.style.color = 'var(--text-muted)'; 
    }
    if(bPipeline) { 
      bPipeline.classList.add('active'); 
      bPipeline.style.borderBottom = '2px solid var(--primary)'; 
      bPipeline.style.color = 'var(--text-primary)'; 
    }
    
    // Render pipeline when showing it
    if(typeof renderProspectMiniKanban === 'function') renderProspectMiniKanban();
  }
};

// Initialize Lead Counter immediately
updateLeadCounter();
// And periodically in case of async loads
setTimeout(updateLeadCounter, 1000);
setTimeout(updateLeadCounter, 3000);

document.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('kanban-dnd-item')) {
    e.target.style.opacity = '1';
    draggedItem = null;
    document.querySelectorAll('.kanban-col').forEach(c => c.style.background = 'rgba(255,255,255,0.02)');
  }
});

document.addEventListener('dragover', (e) => {
  if (draggedItem) {
    e.preventDefault();
    const col = e.target.closest('.kanban-col');
    if (col) {
      col.style.background = 'rgba(255,255,255,0.05)';
    }
  }
});

document.addEventListener('dragleave', (e) => {
  const col = e.target.closest('.kanban-col');
  if (col) {
    col.style.background = 'rgba(255,255,255,0.02)';
  }
});

document.addEventListener('drop', (e) => {
  if (draggedItem) {
    e.preventDefault();
    const col = e.target.closest('.kanban-col');
    if (col) {
      const cardsContainer = col.querySelector('.kanban-cards');
      if (cardsContainer) {
        const newStageId = cardsContainer.id.replace('kanbanv3-', '');
        const leadId = draggedItem.dataset.id;
        
        const lead = state.leads.find(l => l.id === leadId);
        if (lead && lead.pipelineStageV2 !== newStageId) {
          lead.pipelineStageV2 = newStageId;
          if (typeof save === 'function') save();
          
          if (typeof renderProspectMiniKanban === 'function') {
             renderProspectMiniKanban();
          }
          if (typeof toast === 'function') toast('Lead movido para ' + newStageId);
        }
      }
      col.style.background = 'rgba(255,255,255,0.02)';
    }
  }
});

// Initial Load Logic
try {
  const ml = localStorage.getItem('lf_messageLab');
  if (ml) state.messageLab = JSON.parse(ml);
  const tl = localStorage.getItem('lf_templateLibrary');
  if (tl) state.templateLibrary = JSON.parse(tl);
  // No seeding anymore
} catch(e) {}

// Event Listeners
document.addEventListener('click', (e) => {
  if(e.target.matches('.lab-tab')) {
    const stage = e.target.dataset.stage;
    renderMessageLab(stage);
  }
  if(e.target.matches('.library-tab')) {
    const cat = e.target.dataset.category;
    renderTemplateLibrary(cat);
  }
});

// ==========================================
// CUSTOM DASHBOARD OVERRIDES
// ==========================================

// Ensure escapeXml exists locally if not global
if (typeof escapeXml !== 'function') {
  window.escapeXml = function(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
}

// Override render function
window.dashboardCarouselRender = function() {
  const body = document.getElementById('leadCarouselBody');
  const counter = document.getElementById('leadCarouselCounter');
  const filterSelect = document.getElementById('leadCarouselFilter');
  if (!body || !counter) return;

  // Update lead count badge in sidebar
  if(typeof updateLeadCounter === 'function') updateLeadCounter();

  // Populate filter options if needed
  if (filterSelect && filterSelect.children.length <= 1) {
    const stages = Array.isArray(DASH2_STAGES) ? DASH2_STAGES : [];
    stages.forEach(stage => {
      const option = document.createElement('option');
      option.value = stage.id;
      option.textContent = stage.label;
      if (stage.color) option.style.color = stage.color;
      filterSelect.appendChild(option);
    });
  }
  
  if (filterSelect) {
    filterSelect.value = dashboardCarouselFilterValue;
  }

  const leads = dashboardCarouselGetLeads();
  if (!leads.length) {
    counter.textContent = '0/0';
    body.innerHTML = `<div class="lead-carousel-empty">Nenhum lead ativo</div>`;
    return;
  }

  if (!Number.isFinite(dashboardCarouselIndex)) dashboardCarouselIndex = 0;
  if (dashboardCarouselIndex < 0) dashboardCarouselIndex = leads.length - 1;
  if (dashboardCarouselIndex >= leads.length) dashboardCarouselIndex = 0;

  const lead = leads[dashboardCarouselIndex];
  counter.textContent = `${dashboardCarouselIndex + 1}/${leads.length}`;

  const stageId = lead.pipelineStageV2 || 'coletados';
  const meta = dashboardCarouselStageMeta(stageId);
  const handle = dashboardCarouselNormalizeHandle(lead.instagram);
  const sub = [handle, lead.city || ''].filter(Boolean).join(' • ');

  // Checklist Logic
  const checklist = DASHBOARD_STAGE_CHECKLISTS[String(stageId)] || [];
  const { cur } = dashboardCarouselChecklistProgress(lead, stageId);
  const checklistHtml = checklist.map(it => {
    const checked = !!cur[it.id];
    return `
      <label class="lead-check-item" style="padding: 8px 12px; min-height: 36px;">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="dashboardToggleChecklist('${lead.id}','${stageId}','${it.id}', this.checked)">
        <span style="font-size: 11px; line-height: 1.2;">${escapeXml(it.label)}</span>
      </label>
    `;
  }).join('');

  // Flow Logic
  const flow = DASHBOARD_CAROUSEL_STAGE_FLOW[String(stageId)] || {};
  const nextId = flow.next || '';
  const nextMeta = nextId ? dashboardCarouselStageMeta(nextId) : null;
  const canAdvance = nextId && dashboardCarouselAllDone(lead, stageId);

  const altButtons = Array.isArray(flow.alt) ? flow.alt.map(a => {
    const target = dashboardCarouselStageMeta(a.id);
    return `<button class="lead-action-btn" type="button" onclick="dashboardCarouselSetStage('${lead.id}','${target.id}')">${escapeXml(a.label || target.label)}</button>`;
  }).join('') : '';

  // Pipeline Timeline Logic (New)
  const allStages = Array.isArray(DASH2_STAGES) ? DASH2_STAGES : [];
  const currentStageIndex = allStages.findIndex(s => s.id === stageId);
  
  const stageSelectOptions = allStages.map(s => 
    `<option value="${s.id}" ${s.id === stageId ? 'selected' : ''}>${escapeXml(s.label)}</option>`
  ).join('');

  const pipelineHtml = allStages.map((s, idx) => {
    const isCurrent = idx === currentStageIndex;
    const isPast = idx < currentStageIndex;
    const color = isCurrent || isPast ? s.color : 'rgba(255,255,255,0.1)';
    const opacity = isCurrent ? 1 : (isPast ? 0.6 : 0.3);
    const labelColor = isCurrent ? 'var(--text-primary)' : 'var(--text-muted)';
    const fontWeight = isCurrent ? '600' : '400';
    
    return `
      <div onclick="dashboardCarouselSetStage('${lead.id}','${s.id}')" 
           style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer; opacity: ${opacity}; transition: all 0.2s;"
           title="${s.label}">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; box-shadow: ${isCurrent ? `0 0 8px ${color}` : 'none'};"></div>
        <div style="font-size: 10px; color: ${labelColor}; font-weight: ${fontWeight}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.label}</div>
      </div>
    `;
  }).join('');

  body.innerHTML = `
    <div class="lead-carousel-card">
      <div class="lead-carousel-card-head">
        <div class="lead-carousel-card-title">
          <div class="lead-carousel-lead-name">${escapeXml(lead.name || 'Lead')}</div>
          <div class="lead-carousel-lead-sub">${escapeXml(sub || '—')}</div>
        </div>
        <div title="Alterar estágio">
          <select onchange="dashboardCarouselSetStage('${lead.id}', this.value)" 
                  class="lead-carousel-filter" 
                  style="padding: 4px 8px; font-size: 11px; height: auto; width: auto; background-color: var(--bg-surface); border-color: var(--border);">
            ${stageSelectOptions}
          </select>
        </div>
      </div>

      <div class="lead-carousel-actions">
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','open_insta')">Instagram</button>
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','open_whats')">WhatsApp</button>
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','generate_site')">Gerar Site</button>
        ${altButtons}
        ${nextId ? `<button class="lead-action-btn primary" type="button" ${canAdvance ? '' : 'disabled'} onclick="dashboardCarouselAdvance('${lead.id}')">Avançar: ${escapeXml(nextMeta?.label || nextId)}</button>` : ''}
      </div>

      <div style="display: flex; gap: 16px; margin-top: 20px; align-items: flex-start;">
        <div class="lead-checklist" style="width: 220px; flex-shrink: 0;">
          <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; letter-spacing: 0.05em;">Checklist</div>
          ${checklistHtml || `<div class="lead-carousel-empty" style="font-size:11px; padding: 12px;">Sem tarefas para esta etapa</div>`}
        </div>
        
        <div style="width: 140px; flex-shrink: 0; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 16px;">
          <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; letter-spacing: 0.05em;">Pipeline</div>
          <div style="display: flex; flex-direction: column;">
            ${pipelineHtml}
          </div>
        </div>
      </div>
    </div>
  `;
};
