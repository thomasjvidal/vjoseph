
// lab-library.js - Extensions for Lab de Mensagens & Biblioteca de Templates

// Ensure state objects exist
if (typeof state !== 'undefined') {
  if (!state.messageLab) state.messageLab = {};
  if (!state.templateLibrary) state.templateLibrary = {};
}

// Global state for current lab stage
window.currentLabStage = 'todas';

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
  if (!stageId) stageId = window.currentLabStage || 'todas';
  window.currentLabStage = stageId;

  // Ensure stages exist
  if (stageId !== 'todas' && !state.messageLab[stageId]) {
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

  // Change layout based on stage
  if (stageId === 'todas') {
    container.style.gridTemplateColumns = '1fr';
  } else {
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
  }

  let messages = [];
  if (stageId === 'todas') {
    // Collect all messages from all stages
    for (const key in state.messageLab) {
      if (Array.isArray(state.messageLab[key])) {
        state.messageLab[key].forEach(m => {
          messages.push({...m, _stage: key});
        });
      }
    }
  } else {
    messages = state.messageLab[stageId] || [];
  }
  
  // Responsive Grid for Lab Cards
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
  container.style.gap = '24px';

  if (messages.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Nenhuma mensagem cadastrada. Adicione uma nova copy.</div>`;
  } else {
    const messagesHtml = messages.map(m => {
      // Find best performer logic if needed, but let's keep it simple for now
      const isBest = false; // logic can be added later
      const actualStageId = stageId === 'todas' ? m._stage : stageId;
      const stageBadge = stageId === 'todas' ? `<span style="margin-left: 8px; background: rgba(var(--shadow-rgb),0.05); padding: 2px 6px; border-radius: 4px; font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">${actualStageId}</span>` : '';
      
      const textEscaped = typeof escapeXml === 'function' ? escapeXml(m.text) : m.text;
      const isLongText = textEscaped.length > 150 || textEscaped.split('\\n').length > 4;
      
      const textHtml = isLongText ? `
        <div id="msg-text-container-${m.id}" style="background: rgba(var(--shadow-rgb),0.03); border-radius: 8px; padding: 12px; font-size: 14px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 8px; min-height: 80px; max-height: 120px; overflow: hidden; white-space: pre-wrap; position: relative; transition: max-height 0.3s ease;">${textEscaped}</div>
        <button onclick="toggleLabMessageExpand(this, '${m.id}')" style="background: none; border: none; color: var(--primary); font-size: 12px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 16px; text-align: left;">Ver mais</button>
      ` : `
        <div style="background: rgba(var(--shadow-rgb),0.03); border-radius: 8px; padding: 12px; font-size: 14px; line-height: 1.5; color: var(--text-secondary); margin-bottom: 16px; min-height: 80px; white-space: pre-wrap;">${textEscaped}</div>
      `;

      return `
        <div class="lab-card" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; position: relative; display: flex; flex-direction: column;">
          ${isBest ? '<div style="position: absolute; top: -10px; right: 20px; background: #22c55e; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">Melhor Copy 🏆</div>' : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; align-items: center;">
            <div>
              <span style="background: rgba(99, 102, 241, 0.1); color: #6366f1; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${m.name}</span>
              ${stageBadge}
            </div>
            <button onclick="deleteLabMessage('${actualStageId}', '${m.id}')" style="background: none; border: none; cursor: pointer; color: var(--text-muted);" title="Excluir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
          
          ${textHtml}

          <div style="margin-top: auto;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 12px;">
              <div>
                <span style="display: block; font-size: 11px; margin-bottom: 2px;">Envios</span>
                <strong style="color: var(--text-primary);">${m.sentCount || 0}</strong>
              </div>
              <div style="text-align: center;">
                 <span style="display: block; font-size: 11px; margin-bottom: 2px;">Visu.</span>
                 <strong style="color: #0ea5e9;">${m.viewCount || 0}</strong>
              </div>
              <div style="text-align: center;">
                 <span style="display: block; font-size: 11px; margin-bottom: 2px;">Não Visu.</span>
                 <strong style="color: #f43f5e;">${Math.max(0, (m.sentCount || 0) - (m.viewCount || 0))}</strong>
              </div>
              <div style="text-align: right;">
                 <span style="display: block; font-size: 11px; margin-bottom: 2px;">Resp.</span>
                 <strong style="color: var(--primary);">${m.replyRate || '0%'}</strong>
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <button class="btn-secondary" onclick="copyLabMessage(this.dataset.text)" data-text="${(typeof escapeXml === 'function' ? escapeXml(m.text) : m.text).replace(/"/g, '&quot;')}" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copiar
              </button>
              <button class="btn-secondary" onclick="editLabMessage('${actualStageId}', '${m.id}')" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    container.innerHTML = messagesHtml;
  }
  
  // Ensure "Nova Copy" button has correct icon/text if needed (but rely on HTML onclick)
  let newBtn = document.getElementById('btn-new-lab-test');
  if (newBtn && !newBtn.onclick) {
     newBtn.onclick = () => addNewLabMessage(stageId === 'todas' ? 'dm1' : stageId);
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

  // Render lead tracking section for specific stages (not "todas")
  if (stageId !== 'todas') {
    renderLabLeadTracking(stageId);
  } else {
    const t = document.getElementById('lab-lead-tracking');
    if (t) t.innerHTML = '';
  }
}

function renderLabLeadTracking(stageId, filter) {
  const el = document.getElementById('lab-lead-tracking');
  if (!el) return;
  filter = filter || el.dataset.filter || 'nao_visualizou';
  el.dataset.filter = filter;

  const tracking = (state.labTracking && state.labTracking[stageId]) || {};
  const leads = Object.entries(tracking).map(([id, d]) => ({ id, ...d }));

  const counts = { nao_visualizou: 0, visualizou: 0, nao_respondeu: 0 };
  leads.forEach(l => { if (counts[l.status] !== undefined) counts[l.status]++; });

  const filtered = leads.filter(l => l.status === filter);

  const btnStyle = (active) => `padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); transition: all 0.15s; background: ${active ? 'var(--primary)' : 'var(--bg-surface)'}; color: ${active ? 'white' : 'var(--text-secondary)'};`;

  const statusLabel = { nao_visualizou: 'Não Visualizou', visualizou: 'Visualizou', nao_respondeu: 'Não Respondeu' };
  const statusColor = { nao_visualizou: '#f59e0b', visualizou: '#0ea5e9', nao_respondeu: '#f43f5e' };

  el.innerHTML = `
    <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-top: 24px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <span style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Leads com mensagem enviada</span>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button style="${btnStyle(filter === 'nao_visualizou')}" onclick="renderLabLeadTracking('${stageId}', 'nao_visualizou')">📨 Não Visualizou <span style="opacity:.7">${counts.nao_visualizou}</span></button>
          <button style="${btnStyle(filter === 'visualizou')}" onclick="renderLabLeadTracking('${stageId}', 'visualizou')">👁️ Visualizou <span style="opacity:.7">${counts.visualizou}</span></button>
          <button style="${btnStyle(filter === 'nao_respondeu')}" onclick="renderLabLeadTracking('${stageId}', 'nao_respondeu')">❌ Não Respondeu <span style="opacity:.7">${counts.nao_respondeu}</span></button>
        </div>
      </div>
      ${filtered.length === 0 ? `<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 16px 0;">Nenhum lead neste status ainda.</p>` : `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${filtered.map(l => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(var(--glass-rgb),0.03); border: 1px solid rgba(var(--glass-rgb),0.08); border-radius: 10px;">
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${l.name || l.id}</div>
              ${l.handle ? `<div style="font-size: 11px; color: var(--text-muted);">@${l.handle}</div>` : ''}
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span style="font-size: 11px; color: ${statusColor[l.status]}; font-weight: 600;">${statusLabel[l.status] || l.status}</span>
              <select onchange="labTrackingSetStatus('${stageId}', '${l.id}', this.value)" style="font-size: 11px; padding: 3px 6px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-secondary); cursor: pointer;">
                <option value="nao_visualizou" ${l.status === 'nao_visualizou' ? 'selected' : ''}>Não Visualizou</option>
                <option value="visualizou" ${l.status === 'visualizou' ? 'selected' : ''}>Visualizou</option>
                <option value="nao_respondeu" ${l.status === 'nao_respondeu' ? 'selected' : ''}>Não Respondeu</option>
              </select>
            </div>
          </div>
        `).join('')}
      </div>`}
    </div>
  `;
}

window.renderLabLeadTracking = renderLabLeadTracking;

window.labTrackingSetStatus = function(stageId, leadId, newStatus) {
  if (!state.labTracking) state.labTracking = {};
  if (!state.labTracking[stageId]) state.labTracking[stageId] = {};
  if (state.labTracking[stageId][leadId]) {
    state.labTracking[stageId][leadId].status = newStatus;
    if (typeof save === 'function') save();
    renderLabLeadTracking(stageId);
  }
};

window.toggleMessageViewed = function(leadId, msgInstanceId, viewed) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead || !lead.sentMessages) return;

  const msgInstance = lead.sentMessages.find(m => m.id === msgInstanceId);
  if (msgInstance) {
    const wasViewed = msgInstance.viewed;
    msgInstance.viewed = viewed;

    // Update Lab message metrics
    const labStage = state.messageLab[msgInstance.labStageId];
    if (labStage) {
      const labMsg = labStage.find(m => m.id === msgInstance.messageId);
      if (labMsg) {
        if (viewed && !wasViewed) {
          labMsg.viewCount = (labMsg.viewCount || 0) + 1;
        } else if (!viewed && wasViewed) {
          labMsg.viewCount = Math.max(0, (labMsg.viewCount || 0) - 1);
        }
      }
    }
    
    if (typeof save === 'function') save();
    if (typeof dashboardCarouselRender === 'function') dashboardCarouselRender();
  }
};

window.toggleMessageReplied = function(leadId, msgInstanceId, replied) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead || !lead.sentMessages) return;

  const msgInstance = lead.sentMessages.find(m => m.id === msgInstanceId);
  if (msgInstance) {
    const wasReplied = msgInstance.replied;
    msgInstance.replied = replied;

    // Update Lab message metrics
    const labStage = state.messageLab[msgInstance.labStageId];
    if (labStage) {
      const labMsg = labStage.find(m => m.id === msgInstance.messageId);
      if (labMsg) {
        if (replied && !wasReplied) {
          labMsg.replyCount = (labMsg.replyCount || 0) + 1;
        } else if (!replied && wasReplied) {
          labMsg.replyCount = Math.max(0, (labMsg.replyCount || 0) - 1);
        }
        
        // Recalculate replyRate
        const sent = labMsg.sentCount || 0;
        const replies = labMsg.replyCount || 0;
        let calculatedRate = "0%";
        if (sent > 0) {
          calculatedRate = ((replies / sent) * 100).toFixed(1).replace(/\.0$/, '') + "%";
        }
        labMsg.replyRate = calculatedRate;
      }
    }
    
    if (typeof save === 'function') save();
    if (typeof dashboardCarouselRender === 'function') dashboardCarouselRender();
  }
};

window.toggleLabMessageExpand = function(btn, id) {
  const container = document.getElementById('msg-text-container-' + id);
  if (!container) return;
  if(container.style.maxHeight === '120px') {
    container.style.maxHeight = '2000px';
    btn.textContent = 'Ver menos';
  } else {
    container.style.maxHeight = '120px';
    btn.textContent = 'Ver mais';
  }
};

window.addNewLabMessage = function(stageId) {
  if (!stageId) stageId = window.currentLabStage || 'dm1';
  if (stageId === 'todas') stageId = 'dm1';
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
  const viewEl = document.getElementById('labMsgViewed');
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
  viewEl.value = '';
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
        viewEl.value = msg.viewCount || 0;
        rateEl.value = msg.replyCount !== undefined ? msg.replyCount : 0;
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
  let viewed = document.getElementById('labMsgViewed').value;
  let rate = document.getElementById('labMsgRate').value;

  if (!name || !text) {
    alert('Nome e Mensagem são obrigatórios.');
    return;
  }

  // Ensure stage exists
  if (!state.messageLab[stage]) state.messageLab[stage] = [];

  sent = parseInt(sent) || 0;
  let views = parseInt(viewed) || 0;
  if (views > sent) views = sent; // prevent more views than sent
  
  let replies = parseInt(rate) || 0;
  if (replies > sent) replies = sent; // prevent more replies than sent
  
  let calculatedRate = "0%";
  if (sent > 0) {
    calculatedRate = ((replies / sent) * 100).toFixed(1).replace(/\.0$/, '') + "%";
  }

  if (id) {
    // Update existing
    const msg = state.messageLab[stage].find(m => m.id === id);
    if (msg) {
      msg.name = name;
      msg.text = text;
      msg.sentCount = sent;
      msg.viewCount = views;
      msg.replyCount = replies;
      msg.replyRate = calculatedRate;
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
      viewCount: views,
      replyCount: replies,
      replyRate: calculatedRate
    });
    if(typeof toast === 'function') toast('Copy criada!');
  }

  if (typeof save === 'function') save();
  renderMessageLab(stage);
  closeLabMessageModal();
};

// --- EXPORT AND IMPORT LAB MESSAGES ---
window.exportLabMessages = function() {
  if (!state.messageLab || Object.keys(state.messageLab).length === 0) {
    alert('Não há mensagens para exportar.');
    return;
  }
  const jsonStr = JSON.stringify(state.messageLab, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", url);
  downloadAnchorNode.setAttribute("download", "mensagens_lab.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  URL.revokeObjectURL(url);
};

window.importLabMessages = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      let content = e.target.result.trim();
      
      // Fix for previously exported files that might have been URL encoded
      if (content.startsWith('data:text/json')) {
        content = decodeURIComponent(content.substring(content.indexOf(',') + 1));
      } else if (content.startsWith('%7B') || content.startsWith('%5B')) {
        content = decodeURIComponent(content);
      }
      
      // Remove any potential BOM or weird invisible characters at the start
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }

      const importedData = JSON.parse(content);
      if (typeof importedData === 'object' && importedData !== null) {
        // Merge imported messages with existing ones
        for (const stage in importedData) {
          if (Array.isArray(importedData[stage])) {
            if (!state.messageLab[stage]) {
              state.messageLab[stage] = [];
            }
            
            importedData[stage].forEach(importedMsg => {
              // Check if message with same ID already exists
              const existingIndex = state.messageLab[stage].findIndex(m => m.id === importedMsg.id);
              if (existingIndex >= 0) {
                // Update existing
                state.messageLab[stage][existingIndex] = importedMsg;
              } else {
                // Append new
                state.messageLab[stage].push(importedMsg);
              }
            });
          }
        }
        if (typeof save === 'function') save();
        if (typeof toast === 'function') toast('Mensagens importadas com sucesso!');
        renderMessageLab(window.currentLabStage || 'todas');
      } else {
        alert('Formato de arquivo inválido.');
      }
    } catch (err) {
      alert('Erro ao importar o arquivo: ' + err.message);
    }
    // Reset file input
    event.target.value = '';
  };
  reader.readAsText(file);
};

// Render Library
function renderTemplateLibrary(category = 'landing') {
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
  if (!state.templateLibrary) state.templateLibrary = {};
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
      // Landing page usa state.customTemplates (mesmo sistema do Gerador de Sites)
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
      renderLibraryGridLanding(landingGrid, landingItems);
    }
  }
}

function renderLibraryGridLanding(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size:40px;margin-bottom:12px;">📄</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:8px;">Nenhum template ainda</div>
        <div style="font-size:13px;margin-bottom:20px;">Clique em "+ Novo Template" para adicionar seu primeiro template de landing page</div>
        <button class="btn-primary" onclick="openNewTemplateModal()" style="margin:0 auto;">+ Adicionar primeiro template</button>
      </div>`;
    return;
  }

  // Resolve BUILTIN_TEMPLATE_TYPES if available
  const _builtinTypes = (typeof BUILTIN_TEMPLATE_TYPES !== 'undefined' ? BUILTIN_TEMPLATE_TYPES : []);
  const _customTypes  = (typeof state !== 'undefined' && Array.isArray(state.templateTypes) ? state.templateTypes : []);
  const _allTypes = [..._builtinTypes, ..._customTypes];

  container.innerHTML = items.map(item => {
    const varsHtml = (item.vars || []).slice(0, 6).map(v =>
      `<span style="background:rgba(124,58,237,.1);color:#a78bfa;padding:2px 7px;border-radius:4px;font-size:11px;font-family:monospace;">{{${v}}}</span>`
    ).join('');

    // Resolve type label
    const typeObj  = _allTypes.find(t => t.name === item.type);
    const typeLabel = item.isBuiltin ? 'Nativo' : (typeObj ? typeObj.label : (item.type ? item.type.replace(/_/g,' ') : 'Landing Page'));
    const bgGrad = item.isBuiltin ? 'linear-gradient(135deg,#7C3AED 0%,#06B6D4 100%)' : 'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)';
    const actionBtns = item.isBuiltin
      ? `<button class="btn-secondary" onclick="navigate('generator');genGoSlide(1)" style="flex:1;justify-content:center;font-size:12px;">Usar no Gerador</button>`
      : '<button class="btn-secondary" onclick="editTemplateHtml(\'landing\',' + "'" + '+item.id+' + "'" + ')" style="flex:1;justify-content:center;font-size:12px;">Editar HTML</button><button class="btn-secondary" onclick="deleteCustomTemplate(' + "'" + '+item.id+' + "'" + ')" style="padding:7px 10px;justify-content:center;background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.25);color:#f87171;">X</button>';

    return `
      <div class="template-card" style="background:var(--bg-surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform .2s;">
        <div style="height:140px;background:${bgGrad};display:flex;align-items:center;justify-content:center;color:white;position:relative;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:40px;height:40px;opacity:.8;"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span style="position:absolute;top:10px;right:10px;background:rgba(var(--shadow-rgb),.3);color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${typeLabel}</span>
        </div>
        <div style="padding:16px;">
          <h3 style="font-size:15px;font-weight:600;margin:0 0 6px;color:var(--text-primary);">${item.name}</h3>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;min-height:22px;">${varsHtml || '<span style="color:var(--text-muted);font-size:12px;">Sem variáveis detectadas</span>'}</div>
          <div style="display:flex;gap:7px;">
            ${actionBtns}
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderLibraryGrid(container, items, type) {
  if (!items || items.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Nenhum template encontrado.</div>`;
    return;
  }

  container.innerHTML = items.map(item => {
    const varsHtml = (item.vars || []).map(v => 
      `<span style="background: rgba(var(--shadow-rgb),0.05); color: var(--text-secondary); padding: 2px 6px; border-radius: 4px; font-size: 11px; font-family: monospace;">[${v}]</span>`
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
          <div style="display:flex; gap:8px;">
            <button class="btn-secondary" onclick="editTemplate('${type}', '${item.id}')" style="flex:1; justify-content: center;">✏️ Editar Info</button>
            <button class="btn-secondary" onclick="editTemplateHtml('${type}', '${item.id}')" style="flex:1; justify-content: center; background:rgba(59,130,246,.08); border-color:rgba(59,130,246,.3); color:#60a5fa;">🖊️ Editar HTML</button>
          </div>
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

window.editTemplateHtml = function(type, id) {
  // Landing templates vivem em state.customTemplates; outros em state.templateLibrary
  let item, itemList;
  if (type === 'landing') {
    itemList = state.customTemplates || [];
    item = itemList.find(t => t.id === id);
  } else {
    const items = state.templateLibrary ? state.templateLibrary[type] : null;
    if (!items) return;
    item = items.find(t => t.id === id);
    itemList = items;
  }
  if (!item) return;

  // Cria modal de edição de HTML
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(var(--shadow-rgb),.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:#13131f;border:1px solid rgba(var(--glass-rgb),.1);border-radius:16px;width:100%;max-width:900px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;';

  modal.innerHTML = `
    <div style="padding:16px 20px;border-bottom:1px solid rgba(var(--glass-rgb),.08);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div>
        <div style="font-size:15px;font-weight:600;color:#e0e0e0;">🖊️ Editar HTML — ${item.name}</div>
        <div style="font-size:12px;color:#6b6b80;margin-top:2px;">Variáveis: {{nome}}, {{bio}}, {{tagline}}, {{servico_1}}, {{servicos}}, {{foto}}, {{cta}}, {{whatsapp}}, {{instagram}}</div>
      </div>
      <button id="tpl-edit-close" style="background:transparent;border:none;color:#6b6b80;font-size:20px;cursor:pointer;padding:4px 8px;">✕</button>
    </div>
    <textarea id="tpl-edit-textarea" style="flex:1;padding:16px;background:#0a0a14;color:#c0c0d0;font-family:monospace;font-size:13px;border:none;outline:none;resize:none;overflow-y:auto;min-height:400px;">${(item.html||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
    <div style="padding:12px 20px;border-top:1px solid rgba(var(--glass-rgb),.08);display:flex;gap:10px;flex-shrink:0;">
      <button id="tpl-edit-save" style="flex:1;padding:10px;background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">💾 Salvar Alterações</button>
      <button id="tpl-edit-cancel" style="padding:10px 20px;background:transparent;border:1px solid rgba(var(--glass-rgb),.1);border-radius:8px;color:#9090a0;font-size:14px;cursor:pointer;">Cancelar</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const textarea = modal.querySelector('#tpl-edit-textarea');
  // Decode HTML entities back to real HTML
  textarea.value = item.html || '';

  const close = () => overlay.remove();
  modal.querySelector('#tpl-edit-close').onclick = close;
  modal.querySelector('#tpl-edit-cancel').onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  modal.querySelector('#tpl-edit-save').onclick = () => {
    const newHtml = textarea.value;
    if (!newHtml.trim()) {
      if (typeof toast === 'function') toast('O HTML não pode estar vazio!');
      return;
    }
    item.html = newHtml;
    // Atualiza variáveis detectadas
    const varMatches = newHtml.match(/{{(.*?)}}/g);
    if (varMatches) {
      item.vars = [...new Set(varMatches.map(v => v.replace(/{{|}}/g, '')))];
    }
    if (typeof save === 'function') save();
    // Para landing: re-renderiza biblioteca + seletor do gerador
    if (type === 'landing') {
      renderLibraryGridLanding(document.getElementById('lib-section-landing'),
        (state.customTemplates||[]).map(t=>({id:t.id,name:t.name,type:t.type||null,desc:'',
          vars:(t.html||'').match(/{{(.*?)}}/g)?[...new Set((t.html.match(/{{(.*?)}}/g)||[]).map(v=>v.replace(/{{|}}/g,'')))]:[], html:t.html})));
      if (typeof renderGeneratorTemplates === 'function') renderGeneratorTemplates();
    } else {
      renderTemplateLibrary(type);
    }
    close();
    if (typeof toast === 'function') toast('✅ Template HTML atualizado!');
  };
};

// Expõe para outras partes do app (openNewTemplateModal, deleteCustomTemplate)
window._labRenderTemplateLibrary = function(category) {
  window._libCategory = category || 'landing';
  renderTemplateLibrary(category || 'landing');
};

// Monkey Patching & Global Overrides
const originalNavigate = window.navigate;
window.navigate = function(view, activeNavEl) {
  if (originalNavigate) originalNavigate(view, activeNavEl);

  if (view === 'lab-mensagens') {
    renderMessageLab();
  }
  if (view === 'biblioteca-templates') {
    window._libCategory = window._libCategory || 'landing';
    renderTemplateLibrary(window._libCategory);
  }
  if (view === 'generator') {
    // Atualiza o seletor de templates do gerador
    if (typeof renderGeneratorTemplates === 'function') renderGeneratorTemplates();
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
      <div class="lead-carousel-card kanban-dnd-item" draggable="true" data-id="${l.id}" onclick="if(typeof openLeadInUnicoTab === 'function') openLeadInUnicoTab('${l.id}')"
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
  const tabs = ['unico', 'pipeline', 'daily'];

  // Update all buttons
  tabs.forEach(t => {
    const btn = document.getElementById(`btn-tab-${t}`);
    if (!btn) return;
    if (t === tab) {
      btn.classList.add('active');
      btn.style.borderBottom = '2px solid var(--primary)';
      btn.style.color = 'var(--text-primary)';
      btn.style.fontWeight = '600';
    } else {
      btn.classList.remove('active');
      btn.style.borderBottom = '2px solid transparent';
      btn.style.color = 'var(--text-muted)';
      btn.style.fontWeight = '500';
    }
  });

  // Update all content panes
  tabs.forEach(t => {
    const pane = document.getElementById(`tab-${t}`);
    if (pane) pane.style.display = t === tab ? 'block' : 'none';
  });

  // Tab-specific render
  if (tab === 'pipeline') {
    if (typeof renderProspectMiniKanban === 'function') renderProspectMiniKanban();
  }
  if (tab === 'daily') {
    if (typeof renderDailyTab === 'function') renderDailyTab();
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
    document.querySelectorAll('.kanban-col').forEach(c => c.style.background = 'rgba(var(--glass-rgb),0.02)');
  }
});

document.addEventListener('dragover', (e) => {
  if (draggedItem) {
    e.preventDefault();
    const col = e.target.closest('.kanban-col');
    if (col) {
      col.style.background = 'rgba(var(--glass-rgb),0.05)';
    }
  }
});

document.addEventListener('dragleave', (e) => {
  const col = e.target.closest('.kanban-col');
  if (col) {
    col.style.background = 'rgba(var(--glass-rgb),0.02)';
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
          if (typeof moveLeadToStageDash2 === 'function') {
            moveLeadToStageDash2(leadId, newStageId);
          } else {
            lead.pipelineStageV2 = newStageId;
            if (typeof save === 'function') save();
          }

          if (typeof renderProspectMiniKanban === 'function') renderProspectMiniKanban();
          if (typeof renderDashboard === 'function') renderDashboard();
          if (typeof toast === 'function') {
            const stages = (typeof DASH2_STAGES !== 'undefined') ? DASH2_STAGES : [];
            const meta = stages.find(s => s.id === newStageId);
            toast('Lead movido para ' + (meta ? meta.label : newStageId));
          }
        }
      }
      col.style.background = 'rgba(var(--glass-rgb),0.02)';
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
    window._libCategory = cat;
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
  if (!body) return;

  if(typeof updateLeadCounter === 'function') updateLeadCounter();

  const leads = dashboardCarouselGetLeads();
  if (!Number.isFinite(dashboardCarouselIndex)) dashboardCarouselIndex = 0;
  if (dashboardCarouselIndex < 0) dashboardCarouselIndex = leads.length - 1;
  if (dashboardCarouselIndex >= leads.length && leads.length > 0) dashboardCarouselIndex = 0;

  const allStages = Array.isArray(DASH2_STAGES) ? DASH2_STAGES : [];
  
  if (!leads.length) {
    const counterStr = '0/0';
    const filterStage = dashboardCarouselFilterValue || 'coletados';
    const stageSelectOptions = allStages.map(s => 
      `<option value="${s.id}" ${s.id === filterStage ? 'selected' : ''}>${escapeXml(s.label)}</option>`
    ).join('');

    body.innerHTML = `
      <div class="lead-carousel-card" style="min-height: auto; border: none; background: transparent; box-shadow: none; padding: 0;">
        <div class="lead-carousel-card-head" style="flex-direction: column; align-items: flex-start;">
          <div class="lead-carousel-controls" style="display:flex;align-items:center;gap:8px;width:100%;margin-bottom:8px;justify-content:flex-start;flex-wrap:wrap;">
            
            <!-- Stage Selector with Arrows (View Only - Empty State) -->
            <div style="display:flex;align-items:center;gap:2px;background:rgba(var(--glass-rgb),0.04);border:1px solid rgba(var(--glass-rgb),0.08);border-radius:8px;padding:2px;">
              <button class="lead-carousel-nav-btn" type="button" aria-label="Etapa Anterior" onclick="dashboardCarouselViewStageMove(-1)" style="width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:var(--text-secondary);cursor:pointer;border-radius:4px;transition:background 0.2s;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <select class="lead-carousel-filter" id="leadStageSelectEmpty" onchange="dashboardFilterByStage(this.value)" style="margin:0; border:none; background:transparent; max-width:130px; padding:2px 4px; box-shadow:none;">
                ${stageSelectOptions}
              </select>
              <button class="lead-carousel-nav-btn" type="button" aria-label="Próxima Etapa" onclick="dashboardCarouselViewStageMove(1)" style="width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:var(--text-secondary);cursor:pointer;border-radius:4px;transition:background 0.2s;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>

            <div class="lead-carousel-nav">
              <button class="lead-carousel-nav-btn" type="button" aria-label="Anterior" disabled style="opacity: 0.5;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div class="lead-carousel-counter" id="leadCarouselCounter">${counterStr}</div>
              <button class="lead-carousel-nav-btn" type="button" aria-label="Próximo" disabled style="opacity: 0.5;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (!Number.isFinite(dashboardCarouselIndex)) dashboardCarouselIndex = 0;
  if (dashboardCarouselIndex < 0) dashboardCarouselIndex = leads.length - 1;
  if (dashboardCarouselIndex >= leads.length) dashboardCarouselIndex = 0;

  const lead = leads[dashboardCarouselIndex];
  const counterStr = `${dashboardCarouselIndex + 1}/${leads.length}`;

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

      // Filter stages where the view/reply icons should appear
      const showIconsStages = ['dm1_enviada', 'nao_respondeu', 'respondeu', 'follow_up_1', 'dm2_enviada', 'ainda_nao_respondeu', 'follow_up_2', 'proposta_enviada', 'nao_respondeu_proposta', 'follow_up_3'];
      const showIcons = showIconsStages.includes(String(stageId));

      let iconsHtml = '';
      if (showIcons) {
        // Find the last sent message to determine the state
        const lastMsg = (lead.sentMessages && lead.sentMessages.length > 0) ? lead.sentMessages[lead.sentMessages.length - 1] : null;
        const isViewed = lastMsg ? !!lastMsg.viewed : false;
        const isReplied = lastMsg ? !!lastMsg.replied : false;
        const msgId = lastMsg ? lastMsg.id : '';

        iconsHtml = `
          <div style="display: flex; gap: 8px; align-items: center; margin-left: auto;">
            <button title="Visualizou" onclick="if('${msgId}') toggleMessageViewed('${lead.id}', '${msgId}', ${!isViewed})" style="background: ${isViewed ? 'rgba(14, 165, 233, 0.1)' : 'rgba(var(--glass-rgb),0.05)'}; border: 1px solid ${isViewed ? '#0ea5e9' : 'rgba(var(--glass-rgb),0.1)'}; color: ${isViewed ? '#0ea5e9' : 'var(--text-secondary)'}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button title="Respondeu" onclick="if('${msgId}') toggleMessageReplied('${lead.id}', '${msgId}', ${!isReplied})" style="background: ${isReplied ? 'rgba(124, 58, 237, 0.1)' : 'rgba(var(--glass-rgb),0.05)'}; border: 1px solid ${isReplied ? 'var(--primary)' : 'rgba(var(--glass-rgb),0.1)'}; color: ${isReplied ? 'var(--primary)' : 'var(--text-secondary)'}; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
          </div>
        `;
      }

      // Pipeline Timeline Logic (New - Detailed)
  const stageSelectOptions = allStages.map(s => 
    `<option value="${s.id}" ${s.id === stageId ? 'selected' : ''}>${escapeXml(s.label)}</option>`
  ).join('');

  const now = Date.now();
  const t = typeof v2TimelineOf === 'function' ? v2TimelineOf(lead, now) : [];
  const currentStageId = String(stageId).toLowerCase();
  const currentMeta = typeof stageMetaOf === 'function' ? stageMetaOf(currentStageId) : { label: stageId, color: 'var(--primary)' };
  
  let pipelineHtml = '';
  if (t.length > 0) {
    pipelineHtml = t.map(item => {
      const meta = typeof stageMetaOf === 'function' ? stageMetaOf(item.stageId) : { label: item.stageId, color: 'var(--primary)' };
      const isNow = String(item.stageId || '').toLowerCase() === currentStageId && item.isCurrent;
      const canDelete = !isNow && t.length > 1;
      return `
        <div style="border-left: 2px solid ${meta.color}; padding-left: 10px; margin-bottom: 12px; position: relative;">
          <div style="position: absolute; left: -5px; top: 0; width: 8px; height: 8px; border-radius: 50%; background: ${meta.color};"></div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 4px;">
            <div style="font-weight:600; font-size:11px; color:var(--text-primary);">${escapeXml(meta.label)}</div>
            <div style="font-size:10px; color:var(--text-muted);">${typeof fmtLeadDuration === 'function' ? fmtLeadDuration(item.durMs) : ''}</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:10px; color:var(--text-muted); opacity: 0.8;">${typeof fmtLeadDateTime === 'function' ? fmtLeadDateTime(item.startAt) : ''}</div>
            <div style="display:flex; gap:6px; align-items:center;">
              <div style="font-size:9px; padding:2px 6px; border-radius:4px; background:rgba(var(--glass-rgb),0.05); color:var(--text-muted);">${isNow ? 'Atual' : 'Concluído'}</div>
              ${canDelete ? `
                <button title="Excluir" onclick="event.stopPropagation(); if(typeof excludeV2TimelineEntry === 'function') excludeV2TimelineEntry('${lead.id}', '${String(item.stageId || '').toLowerCase()}', ${Number(item.startAt) || 0})" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; padding:0; display:flex; align-items:center;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    pipelineHtml = `
      <div style="border-left: 2px solid ${currentMeta.color}; padding-left: 10px; margin-bottom: 12px; position: relative;">
        <div style="position: absolute; left: -5px; top: 0; width: 8px; height: 8px; border-radius: 50%; background: ${currentMeta.color};"></div>
        <div style="font-weight:600; font-size:11px; color:var(--text-primary); margin-bottom: 4px;">${escapeXml(currentMeta.label)}</div>
        <div style="font-size:10px; color:var(--text-muted); opacity: 0.8;">Sem histórico suficiente</div>
      </div>
    `;
  }

  // Sent Messages Logic
  let sentMessagesHtml = '';
  const sentMsgs = lead.sentMessages || [];
  if (sentMsgs.length > 0) {
    sentMessagesHtml = sentMsgs.slice().reverse().map(msg => {
      const isViewed = !!msg.viewed;
      const isReplied = !!msg.replied;
      const dateStr = new Date(msg.sentAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
      
      const suggestionHtml = isViewed 
        ? `<div style="margin-top: 8px; padding: 6px 8px; background: rgba(14, 165, 233, 0.1); border-left: 2px solid #0ea5e9; color: #0ea5e9; font-size: 10px; border-radius: 4px;"><strong>Aviso:</strong> Lead visualizou! Lembre-se de responder ou acompanhar.</div>`
        : `<div style="margin-top: 8px; padding: 6px 8px; background: rgba(244, 63, 94, 0.1); border-left: 2px solid #f43f5e; color: #f43f5e; font-size: 10px; border-radius: 4px;"><strong>Aviso:</strong> Lead não visualizou. Sugerimos enviar um Follow-up.</div>`;

      return `
        <div style="background: rgba(var(--glass-rgb),0.02); border: 1px solid rgba(var(--glass-rgb),0.05); border-radius: 8px; padding: 10px; margin-bottom: 8px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: var(--text-primary);">${escapeXml(msg.messageName || 'Mensagem')}</div>
            <div style="font-size: 9px; color: var(--text-muted);">${dateStr}</div>
          </div>
          <div style="font-size: 10px; color: var(--text-secondary); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
            ${escapeXml(msg.text)}
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-muted); cursor: pointer;">
              <input type="checkbox" ${isViewed ? 'checked' : ''} onchange="toggleMessageViewed('${lead.id}', '${msg.id}', this.checked)" style="margin: 0; cursor: pointer;">
              Visualizou
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-muted); cursor: pointer;">
              <input type="checkbox" ${isReplied ? 'checked' : ''} onchange="toggleMessageReplied('${lead.id}', '${msg.id}', this.checked)" style="margin: 0; cursor: pointer;">
              Respondeu
            </label>
          </div>
          ${suggestionHtml}
        </div>
      `;
    }).join('');
  } else {
    sentMessagesHtml = `
      <div style="font-size: 11px; color: var(--text-muted); padding: 10px; background: rgba(var(--glass-rgb),0.02); border-radius: 8px; border: 1px dashed rgba(var(--glass-rgb),0.05);">
        Nenhuma mensagem enviada.
      </div>
    `;
  }

  body.innerHTML = `
    <div class="lead-carousel-card">
      <div class="lead-carousel-card-head" style="flex-direction: column; align-items: flex-start;">
        <div class="lead-carousel-controls" style="display:flex;align-items:center;gap:8px;width:100%;margin-bottom:8px;justify-content:flex-start;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:2px;background:rgba(var(--glass-rgb),0.04);border:1px solid rgba(var(--glass-rgb),0.08);border-radius:8px;padding:2px;">
            <button class="lead-carousel-nav-btn" type="button" aria-label="Etapa Anterior" onclick="dashboardCarouselViewStageMove(-1)" style="width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:var(--text-secondary);cursor:pointer;border-radius:4px;transition:background 0.2s;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <select class="lead-carousel-filter" id="leadStageSelect" onchange="dashboardFilterByStage(this.value)" style="margin:0; border:none; background:transparent; max-width:130px; padding:2px 4px; box-shadow:none;">
              ${stageSelectOptions}
            </select>
            <button class="lead-carousel-nav-btn" type="button" aria-label="Próxima Etapa" onclick="dashboardCarouselViewStageMove(1)" style="width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:transparent;border:none;color:var(--text-secondary);cursor:pointer;border-radius:4px;transition:background 0.2s;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          <div class="lead-carousel-nav">
            <button class="lead-carousel-nav-btn" type="button" aria-label="Anterior" onclick="dashboardCarouselPrev()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="lead-carousel-counter" id="leadCarouselCounter">${counterStr}</div>
            <button class="lead-carousel-nav-btn" type="button" aria-label="Próximo" onclick="dashboardCarouselNext()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
        <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
          <div class="lead-carousel-card-title" style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
            <div class="lead-carousel-lead-name">${escapeXml(lead.name || 'Lead')}</div>
            <div class="lead-carousel-lead-sub">${escapeXml(sub || '—')}</div>
          </div>
          ${iconsHtml}
        </div>
      </div>

      <div class="lead-carousel-actions">
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselCopyMsg('${lead.id}')">Copiar Mensagem</button>
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','open_insta')">Instagram</button>
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','open_whats')">WhatsApp</button>
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','generate_site')">Gerar Site</button>
        ${altButtons}
        ${nextId ? `<button class="lead-action-btn primary" type="button" onclick="dashboardCarouselAdvance('${lead.id}', '${nextId}')">Avançar: ${escapeXml(nextMeta?.label || nextId)}</button>` : ''}
        <div style="position:relative; display:inline-block;">
          <select class="lead-action-btn" style="appearance:none; padding-right:30px; cursor:pointer; background:rgba(var(--glass-rgb),0.05); color:var(--text-secondary); border:1px solid rgba(var(--glass-rgb),0.1);" onchange="if(this.value){ dashboardCarouselSetStage('${lead.id}', this.value); this.value=''; }">
            <option value="" disabled selected>Mover para...</option>
            ${(typeof DASH2_STAGES !== 'undefined' && Array.isArray(DASH2_STAGES) ? DASH2_STAGES : []).map(s => `<option value="${s.id}">${escapeXml(s.label)}</option>`).join('')}
          </select>
          <svg style="position:absolute; right:10px; top:50%; transform:translateY(-50%); width:14px; height:14px; pointer-events:none; stroke:var(--text-secondary);" viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <div style="display: flex; gap: 16px; margin-top: 20px; align-items: flex-start; flex-wrap: wrap;">
        <div class="lead-checklist" style="width: 200px; flex-shrink: 0;">
          <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; letter-spacing: 0.05em;">Checklist</div>
          ${checklistHtml || `<div class="lead-carousel-empty" style="font-size:11px; padding: 12px;">Sem tarefas para esta etapa</div>`}
        </div>
        
        <div style="flex: 1; min-width: 200px; border-left: 1px solid rgba(var(--glass-rgb),0.1); padding-left: 16px;">
          <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; font-weight: 600; letter-spacing: 0.05em;">Timeline do Pipeline</div>
          <div style="display: flex; flex-direction: column;">
            ${pipelineHtml}
          </div>
        </div>

        <div style="flex: 1; min-width: 220px; border-left: 1px solid rgba(var(--glass-rgb),0.1); padding-left: 16px;">
          <div style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; font-weight: 600; letter-spacing: 0.05em;">Mensagens Enviadas</div>
          <div style="display: flex; flex-direction: column;">
            ${sentMessagesHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  const cEl = document.getElementById('leadCarouselCounter');
  if (cEl) cEl.textContent = counterStr;
};
