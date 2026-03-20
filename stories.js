/* ==========================================
   STORIES CONTROL MODULE — stories.js
   Estratégia de Stories integrada ao LeadFlow
   ========================================== */

// ── CONSTANTS ──────────────────────────────────────────────────────────────────

const SC_STAGE_MAP = {
  coletados:        'Coletados',
  dm1_enviada:      'DM1 enviada',
  respondeu:        'Respondeu',
  follow_up_1:      'Follow-up 1',
  chat_gerado:      'Engajados',
  proposta_enviada: 'Proposta',
  fechado:          'Fechado',
  arquivado:        'Arquivado',
  dm2_enviada:      'Follow-up 1',
};

const SC_STAGES = ['Coletados','Engajados','DM1 enviada','Respondeu','Não respondeu','Follow-up 1','Proposta','Fechado','Arquivado'];

const SC_STORIES_DEFAULT = [
  { id:1, period:'Manhã',  type:'Bastidor',    title:'Começando os projetos do dia',           posted:false },
  { id:2, period:'Manhã',  type:'Autoridade',  title:'3 erros que médicos cometem no digital', posted:false },
  { id:3, period:'Manhã',  type:'Engajamento', title:"Enquete: 'Você atualizou seu site?'",    posted:false },
  { id:4, period:'Tarde',  type:'Prova',       title:'Veja o site que entregamos ontem',       posted:false },
  { id:5, period:'Tarde',  type:'Conteúdo',    title:'Por que design importa para conversão',  posted:false },
  { id:6, period:'Tarde',  type:'Desejo',      title:'Antes/depois: site antigo vs. novo',     posted:false },
  { id:7, period:'Noite',  type:'Gatilho',     title:'Seu site hoje passa confiança?',         posted:false },
  { id:8, period:'Noite',  type:'Oferta',      title:'Podemos criar seu site agora',           posted:false },
  { id:9, period:'Noite',  type:'CTA',         title:"Caixa: 'Quer meu guia de sites?'",       posted:false },
];

const SC_REPOSTS = [
  { id:1, source:'@clinica_aura',    type:'Depoimento',   content:'Resultado incrível com o novo site!', score:95 },
  { id:2, source:'@afiliado_webmed', type:'Bastidor',     content:'Setup de gravação para médicos',      score:87 },
  { id:3, source:'@digital360',      type:'Dica técnica', content:'5 plugins para sites de saúde',       score:78 },
];

const SC_COLLABS_DEFAULT = [
  { id:1, partner:'@influencer_saude', format:'Vídeo conjunto',        topic:'Presença digital para médicos', status:'Planejado'    },
  { id:2, partner:'@agencia_parceira', format:'Stories compartilhados', topic:'Cases de sucesso',              status:'Em andamento' },
];

const SC_TONE_PRESETS = [
  { name:'Profissional & Próximo',    desc:'Formal mas humano. Autoridade sem criar distância.',  emoji:'💼' },
  { name:'Inspirador & Motivacional', desc:'Energia alta, histórias de transformação.',           emoji:'🔥' },
  { name:'Técnico & Educativo',       desc:'Dados, processos, passo a passo claro.',              emoji:'📐' },
  { name:'Descontraído & Direto',     desc:'Sem rodeios, conversa real, linguagem leve.',         emoji:'😎' },
  { name:'Premium & Exclusivo',       desc:'Sofisticação, resultados de alto padrão.',            emoji:'👑' },
];

const SC_SEQ = {
  Manhã: [
    { type:'Bastidor',    icon:'🎬', title:'Bastidor leve',     desc:'Mostre o começo do dia, projetos sendo iniciados' },
    { type:'Autoridade',  icon:'💡', title:'Autoridade rápida', desc:'Uma dica do seu nicho que demonstra conhecimento' },
    { type:'Engajamento', icon:'🗳',  title:'Envolvimento',      desc:'Enquete ou caixa de perguntas sobre a dor do lead' },
  ],
  Tarde: [
    { type:'Prova',    icon:'✅', title:'Prova indireta',   desc:'Mostre resultado ou entrega sem vender diretamente' },
    { type:'Conteúdo', icon:'📖', title:'Conteúdo técnico', desc:'Explique algo relevante que gera credibilidade' },
    { type:'Desejo',   icon:'⚡', title:'Antes / Depois',   desc:'Mostre uma transformação de cliente' },
  ],
  Noite: [
    { type:'Gatilho', icon:'🧠', title:'Gatilho mental', desc:'Ative urgência, escassez ou autoridade social' },
    { type:'Oferta',  icon:'🎁', title:'Oferta leve',    desc:'Apresente sua solução de forma natural, sem pressão' },
    { type:'CTA',     icon:'💬', title:'CTA indireto',   desc:'Caixa de perguntas para qualificar interesse' },
  ],
};

const SC_MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// ── STATE ──────────────────────────────────────────────────────────────────────
const SC = {
  tab:          'radar',
  tone:         'Profissional & Próximo',
  motorResult:  null,
  motorLoading: false,
  stories:      [],
  collabs:      [],
  storyFlags:   {},   // { [leadId]: { viewed: bool, replied: bool } }
};

// ── PERSISTENCE ────────────────────────────────────────────────────────────────
function scLoad() {
  // Stories — reset automaticamente a cada novo dia
  try {
    const saved = localStorage.getItem('sc_stories');
    const savedDate = localStorage.getItem('sc_stories_date');
    const today = new Date().toDateString();
    SC.stories = (saved && savedDate === today)
      ? JSON.parse(saved)
      : SC_STORIES_DEFAULT.map(s => ({ ...s, posted: false }));
    if (!saved || savedDate !== today) localStorage.setItem('sc_stories_date', today);
  } catch(e) { SC.stories = SC_STORIES_DEFAULT.map(s => ({ ...s })); }

  // Collabs
  try {
    const c = localStorage.getItem('sc_collabs');
    SC.collabs = c ? JSON.parse(c) : SC_COLLABS_DEFAULT.map(x => ({ ...x }));
  } catch(e) { SC.collabs = SC_COLLABS_DEFAULT.map(x => ({ ...x })); }

  // Tom de voz
  try { const t = localStorage.getItem('sc_tone'); if (t) SC.tone = t; } catch(e) {}

  // Flags por lead (viewed / replied)
  try { const f = localStorage.getItem('sc_flags'); SC.storyFlags = f ? JSON.parse(f) : {}; } catch(e) {}
}

function scSaveStories() {
  try {
    localStorage.setItem('sc_stories', JSON.stringify(SC.stories));
    localStorage.setItem('sc_stories_date', new Date().toDateString());
  } catch(e) {}
}
function scSaveCollabs() { try { localStorage.setItem('sc_collabs', JSON.stringify(SC.collabs)); } catch(e) {} }
function scSaveTone()    { try { localStorage.setItem('sc_tone',    SC.tone);                     } catch(e) {} }
function scSaveFlags()   { try { localStorage.setItem('sc_flags',   JSON.stringify(SC.storyFlags)); } catch(e) {} }

// ── HELPERS ────────────────────────────────────────────────────────────────────
function scStageColor(s) {
  return { 'Coletados':'#71717A','Engajados':'#7C3AED','DM1 enviada':'#F59E0B',
           'Respondeu':'#10B981','Não respondeu':'#EF4444','Follow-up 1':'#F97316',
           'Proposta':'#06B6D4','Fechado':'#A78BFA','Arquivado':'#52525B' }[s] || '#71717A';
}

function scTypeColor(t) {
  return { 'Bastidor':'#F59E0B','Autoridade':'#7C3AED','Prova':'#10B981',
           'Desejo':'#EC4899','Engajamento':'#06B6D4','CTA':'#F97316',
           'Conteúdo':'#A78BFA','Gatilho':'#EF4444','Oferta':'#10B981',
           'Depoimento':'#10B981','Dica técnica':'#06B6D4' }[t] || '#71717A';
}

function scPeriodStyle(p) {
  if (p === 'Manhã') return { color:'#F59E0B', bg:'rgba(245,158,11,0.1)',  border:'rgba(245,158,11,0.3)'  };
  if (p === 'Tarde') return { color:'#06B6D4', bg:'rgba(6,182,212,0.1)',   border:'rgba(6,182,212,0.3)'   };
  return                    { color:'#A78BFA', bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.3)' };
}

function _scTag(text, color) {
  return `<span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${color}22;color:${color};border:1px solid ${color}33">${text}</span>`;
}

function _scCard(content, extra) {
  return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:16px;${extra||''}">${content}</div>`;
}

function _scHeader(icon, title, desc) {
  return `<div style="margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:20px">${icon}</span>
      <h2 style="margin:0;font-size:18px;font-weight:800;color:var(--text-primary)">${title}</h2>
    </div>
    ${desc ? `<p style="margin:4px 0 0 28px;font-size:13px;color:var(--text-secondary)">${desc}</p>` : ''}
  </div>`;
}

function _scBar(value, max, color, height) {
  const h = height || 8;
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0;
  return `<div style="height:${h}px;border-radius:999px;background:rgba(255,255,255,0.07);overflow:hidden">
    <div style="height:100%;width:${pct}%;border-radius:999px;background:${color};transition:width .5s"></div>
  </div>`;
}

function _scAv(initials, color) {
  return `<div style="width:28px;height:28px;border-radius:50%;background:${color}22;border:2px solid ${color}44;color:${color};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">${initials}</div>`;
}

// Constrói lista de leads sincronizada com state.leads
function scGetLeads() {
  const raw = (typeof state !== 'undefined' && Array.isArray(state.leads)) ? state.leads : [];
  return raw.map(l => {
    const mapped = SC_STAGE_MAP[l.pipelineStageV2 || 'coletados'] || 'Coletados';
    const flags  = SC.storyFlags[l.id] || {};
    const parts  = (l.name || '').trim().split(/\s+/);
    const initials = parts.slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
    return { id: l.id, name: l.name || 'Lead', stage: mapped, viewed: !!flags.viewed, replied: !!flags.replied, initials };
  });
}

// ── ENTRY POINT ────────────────────────────────────────────────────────────────
function renderStoriesView() {
  const el = document.getElementById('view-stories');
  if (!el) return;
  scLoad();

  const done  = SC.stories.filter(s => s.posted).length;
  const total = SC.stories.length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  const today = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });

  const tabs = [
    { id:'radar',      label:'Radar',    icon:'📡' },
    { id:'motor',      label:'Motor IA', icon:'🤖' },
    { id:'sequencia',  label:'Sequência',icon:'📅' },
    { id:'checklist',  label:'Execução', icon:'✅' },
    { id:'repost',     label:'Reposts',  icon:'🔄' },
    { id:'calendario', label:'Agenda',   icon:'🗓' },
    { id:'tom',        label:'Tom',      icon:'🎭' },
  ];

  el.innerHTML = `
  <div style="padding:24px">
    <!-- Header -->
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:16px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#7C3AED,#A78BFA);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📱</div>
        <div>
          <div style="font-weight:800;font-size:16px;color:var(--text-primary)">Stories Control</div>
          <div style="font-size:12px;color:var(--text-secondary);text-transform:capitalize">${today}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;background:${pct===100?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.12)'};color:${pct===100?'#10B981':'#F59E0B'};border:1px solid ${pct===100?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.3)'}">
          ✅ ${pct}%
        </div>
      </div>
    </div>

    <!-- Sub-Tabs -->
    <div style="display:flex;gap:4px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:4px;margin-bottom:20px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none">
      ${tabs.map(t => `
        <button onclick="scSetTab('${t.id}')" id="sc-tab-${t.id}" style="
          flex:1;min-width:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:3px;padding:8px 4px;border:none;border-radius:8px;cursor:pointer;transition:all .15s;
          background:${SC.tab===t.id?'rgba(124,58,237,0.2)':'transparent'};
          color:${SC.tab===t.id?'#A78BFA':'var(--text-muted)'}
        ">
          <span style="font-size:16px;line-height:1">${t.icon}</span>
          <span style="font-size:10px;font-weight:${SC.tab===t.id?'700':'500'};letter-spacing:.2px">${t.label}</span>
        </button>
      `).join('')}
    </div>

    <!-- Content -->
    <div id="sc-content"></div>
  </div>`;

  scRenderTab();
}

function scSetTab(tab) {
  SC.tab = tab;
  document.querySelectorAll('[id^="sc-tab-"]').forEach(btn => {
    const active = btn.id === `sc-tab-${tab}`;
    btn.style.background = active ? 'rgba(124,58,237,0.2)' : 'transparent';
    btn.style.color      = active ? '#A78BFA' : 'var(--text-muted)';
    const lbl = btn.querySelectorAll('span')[1];
    if (lbl) lbl.style.fontWeight = active ? '700' : '500';
  });
  scRenderTab();
}

function scRenderTab() {
  const el = document.getElementById('sc-content');
  if (!el) return;
  switch (SC.tab) {
    case 'radar':      el.innerHTML = scRenderRadar();      break;
    case 'motor':      el.innerHTML = scRenderMotor();      break;
    case 'sequencia':  el.innerHTML = scRenderSequencia();  break;
    case 'checklist':  el.innerHTML = scRenderChecklist();  break;
    case 'repost':     el.innerHTML = scRenderRepost();     break;
    case 'calendario': el.innerHTML = scRenderCalendario(); break;
    case 'tom':        el.innerHTML = scRenderTom();        break;
  }
}

// ── 1. RADAR DO DIA ────────────────────────────────────────────────────────────
function scRenderRadar() {
  const leads = scGetLeads();
  const total = leads.length;
  const cnt   = {};
  SC_STAGES.forEach(s => cnt[s] = leads.filter(l => l.stage === s).length);

  const viewed   = leads.filter(l => l.viewed && !l.replied);
  const replied  = leads.filter(l => l.replied);
  const followup = leads.filter(l => l.stage === 'Follow-up 1');

  let html = _scHeader('📡', 'Radar do Dia', 'Onde estão seus leads agora');

  // ── Alertas ──
  if (viewed.length > 0) {
    html += `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:12px 14px;margin-bottom:12px">
      <div style="font-weight:700;font-size:13px;color:#F59E0B;margin-bottom:8px">👁 ${viewed.length} lead${viewed.length>1?'s':''} viu seu Story mas não respondeu</div>
      ${viewed.map(l => `<div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        ${_scAv(l.initials,'#F59E0B')}
        <span style="font-size:13px;color:var(--text-primary);font-weight:500;flex:1">${l.name}</span>
        ${_scTag(l.stage, scStageColor(l.stage))}
      </div>`).join('')}
    </div>`;
  }

  if (replied.length > 0) {
    html += `<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:12px 14px;margin-bottom:12px">
      <div style="font-weight:700;font-size:13px;color:#10B981;margin-bottom:8px">💬 ${replied.length} lead${replied.length>1?'s':''} respondeu DM — aja agora!</div>
      ${replied.map(l => `<div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        ${_scAv(l.initials,'#10B981')}
        <span style="font-size:13px;color:var(--text-primary);font-weight:500;flex:1">${l.name}</span>
        ${_scTag(l.stage, scStageColor(l.stage))}
      </div>`).join('')}
    </div>`;
  }

  if (followup.length > 0) {
    html += `<div style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:12px;padding:12px 14px;margin-bottom:12px">
      <div style="font-weight:700;font-size:13px;color:#F97316;margin-bottom:8px">🔁 ${followup.length} lead${followup.length>1?'s':''} em follow-up esperando resposta</div>
      ${followup.map(l => `<div style="display:flex;align-items:center;gap:8px;margin-top:6px">
        ${_scAv(l.initials,'#F97316')}
        <span style="font-size:13px;color:var(--text-primary);font-weight:500">${l.name}</span>
      </div>`).join('')}
    </div>`;
  }

  if (viewed.length + replied.length + followup.length === 0) {
    html += `<div style="background:rgba(124,58,237,0.07);border:1px solid rgba(124,58,237,0.15);border-radius:12px;padding:12px 14px;margin-bottom:12px;text-align:center">
      <div style="font-size:13px;color:var(--text-secondary)">✨ Nenhum alerta ativo no momento. Boa operação!</div>
    </div>`;
  }

  // ── Pipeline completa ──
  html += _scCard(`
    <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:12px">📊 Pipeline completa</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${SC_STAGES.map(s => {
        const n = cnt[s] || 0;
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="width:108px;font-size:12px;color:var(--text-secondary);flex-shrink:0">${s}</div>
          <div style="flex:1">${_scBar(n, total || 1, scStageColor(s))}</div>
          <div style="width:22px;text-align:right;font-size:12px;font-weight:700;color:${scStageColor(s)}">${n}</div>
        </div>`;
      }).join('')}
    </div>
  `, 'margin-bottom:12px');

  // ── Marcar interações ──
  if (leads.length > 0) {
    html += _scCard(`
      <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:4px">🏷 Marcar interações de hoje</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">👁 = viu seu story &nbsp;|&nbsp; 💬 = respondeu DM</div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${leads.slice(0, 12).map(l => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-surface);border-radius:10px">
            ${_scAv(l.initials,'#A78BFA')}
            <div style="flex:1;font-size:12px;color:var(--text-primary);font-weight:500;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.name}</div>
            ${_scTag(l.stage, scStageColor(l.stage))}
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button onclick="scToggleFlag('${l.id}','viewed')" title="Viu o story" style="padding:4px 8px;border-radius:6px;border:1px solid ${l.viewed?'rgba(245,158,11,0.5)':'var(--border)'};background:${l.viewed?'rgba(245,158,11,0.15)':'transparent'};color:${l.viewed?'#F59E0B':'var(--text-muted)'};font-size:12px;font-weight:600;cursor:pointer;transition:.15s">👁</button>
              <button onclick="scToggleFlag('${l.id}','replied')" title="Respondeu DM" style="padding:4px 8px;border-radius:6px;border:1px solid ${l.replied?'rgba(16,185,129,0.5)':'var(--border)'};background:${l.replied?'rgba(16,185,129,0.15)':'transparent'};color:${l.replied?'#10B981':'var(--text-muted)'};font-size:12px;font-weight:600;cursor:pointer;transition:.15s">💬</button>
            </div>
          </div>
        `).join('')}
      </div>
    `, 'margin-bottom:12px');
  }

  // ── Metas ──
  html += _scCard(`
    <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:12px">🎯 Metas</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${[
        { label:'Fechamentos no mês',  cur: cnt['Fechado']||0,        max:20,  color:'#10B981' },
        { label:'DMs enviadas hoje',   cur: cnt['DM1 enviada']||0,    max:20,  color:'#F59E0B' },
        { label:'Propostas ativas',    cur: cnt['Proposta']||0,       max:10,  color:'#06B6D4' },
        { label:'Total na pipeline',   cur: total,                    max:50,  color:'#7C3AED' },
      ].map(g => `
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px">
            <span style="font-size:13px;color:var(--text-primary)">${g.label}</span>
            <span style="font-size:13px;font-weight:700;color:${g.color}">${g.cur} / ${g.max}</span>
          </div>
          ${_scBar(g.cur, g.max, g.color)}
        </div>
      `).join('')}
    </div>
  `);

  return `<div style="display:flex;flex-direction:column;gap:0">${html}</div>`;
}

window.scToggleFlag = function(leadId, field) {
  if (!SC.storyFlags[leadId]) SC.storyFlags[leadId] = {};
  SC.storyFlags[leadId][field] = !SC.storyFlags[leadId][field];
  scSaveFlags();
  scRenderTab();
};

// ── 2. MOTOR IA ────────────────────────────────────────────────────────────────
function scRenderMotor() {
  const leads = scGetLeads();
  const done  = SC.stories.filter(s => s.posted).length;
  let html = _scHeader('🤖', 'Motor Inteligente', 'IA analisa sua pipeline e gera a estratégia de Stories do dia');

  html += _scCard(`
    <div style="font-weight:700;font-size:14px;color:var(--text-primary);margin-bottom:3px">Tom de voz ativo</div>
    <div style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">${SC.tone}</div>
    <button onclick="scGerarMotor()" id="scMotorBtn" ${SC.motorLoading?'disabled':''} style="
      width:100%;padding:13px;border-radius:10px;border:none;
      background:${SC.motorLoading?'rgba(255,255,255,0.05)':'linear-gradient(135deg,#7C3AED,#A78BFA)'};
      color:${SC.motorLoading?'var(--text-muted)':'#fff'};font-weight:700;font-size:14px;
      cursor:${SC.motorLoading?'not-allowed':'pointer'};font-family:inherit;transition:.2s
    ">
      ${SC.motorLoading ? '⏳ Analisando pipeline…' : '✨ Gerar Estratégia do Dia'}
    </button>
  `, 'margin-bottom:12px');

  if (!SC.motorResult && !SC.motorLoading) {
    html += _scCard(`
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:36px;margin-bottom:10px">🧠</div>
        <div style="font-weight:600;font-size:14px;color:var(--text-primary);margin-bottom:4px">Ainda sem estratégia gerada</div>
        <div style="font-size:13px;color:var(--text-secondary)">Clique acima para a IA analisar sua pipeline e criar as recomendações do dia.</div>
      </div>
    `);
  }

  const r = SC.motorResult;
  if (r) {
    if (r.alerta) {
      html += `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:12px 14px;margin-bottom:12px">
        <div style="font-weight:700;font-size:13px;color:#EF4444">🚨 ${r.alerta}</div>
      </div>`;
    }

    html += _scCard(`
      <div style="font-weight:700;font-size:13px;color:#A78BFA;margin-bottom:6px">📊 Análise da pipeline</div>
      <p style="margin:0;font-size:14px;color:var(--text-primary);line-height:1.7">${r.analise || ''}</p>
    `, 'margin-bottom:12px');

    html += _scCard(`
      <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:6px">🎯 Prioridade agora</div>
      <p style="margin:0;font-size:14px;color:var(--text-secondary);line-height:1.7">${r.prioridade || ''}</p>
    `, 'margin-bottom:12px');

    if (r.recomendacoes && r.recomendacoes.length) {
      html += _scCard(`
        <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:10px">📋 Recomendações</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${r.recomendacoes.map(rec => {
            const ps = scPeriodStyle(rec.periodo || 'Tarde');
            return `<div style="padding:12px;border-radius:10px;background:${ps.bg};border:1px solid ${ps.border}">
              <div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">
                ${_scTag(rec.periodo || '', ps.color)}
                ${_scTag(rec.tipo || '', scTypeColor(rec.tipo || ''))}
              </div>
              <div style="font-weight:600;font-size:14px;color:var(--text-primary);margin-bottom:3px">${rec.sugestao || ''}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${rec.razao || ''}</div>
            </div>`;
          }).join('')}
        </div>
      `, 'margin-bottom:12px');
    }

    if (r.quantidade) {
      html += _scCard(`
        <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:10px">📱 Quantidade sugerida</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          ${[['Manhã','manha','#F59E0B','rgba(245,158,11,0.1)'],['Tarde','tarde','#06B6D4','rgba(6,182,212,0.1)'],['Noite','noite','#A78BFA','rgba(167,139,250,0.1)']].map(([label,key,color,bg]) =>
            `<div style="background:${bg};border:1px solid ${color}22;border-radius:10px;padding:12px 8px;text-align:center">
              <div style="font-size:26px;font-weight:800;color:${color}">${r.quantidade[key] ?? '-'}</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${label}</div>
            </div>`
          ).join('')}
        </div>
      `);
    }
  }

  return `<div style="display:flex;flex-direction:column;gap:0">${html}</div>`;
}

window.scGerarMotor = async function() {
  if (SC.motorLoading) return;
  SC.motorLoading = true;
  SC.motorResult  = null;
  scRenderTab();

  const leads = scGetLeads();
  const cnt   = {};
  SC_STAGES.forEach(s => cnt[s] = leads.filter(l => l.stage === s).length);
  const done = SC.stories.filter(s => s.posted).length;

  const prompt = `Você é estrategista de Stories para Instagram. Tom: "${SC.tone}".
Pipeline: ${SC_STAGES.map(s => `${s}: ${cnt[s]}`).join(', ')}.
Leads que viram sem responder: ${leads.filter(l=>l.viewed&&!l.replied).map(l=>l.name).join(', ')||'nenhum'}.
Responderam DM: ${leads.filter(l=>l.replied).map(l=>l.name).join(', ')||'nenhum'}.
Em Proposta: ${leads.filter(l=>l.stage==='Proposta').map(l=>l.name).join(', ')||'nenhum'}.
Stories feitos hoje: ${done}/${SC.stories.length}.
Gere JSON exato (sem markdown, sem texto fora do JSON):
{"analise":"2 frases sobre o estado atual da pipeline","prioridade":"qual tipo de story focar agora e por quê","recomendacoes":[{"tipo":"Bastidor|Prova|Autoridade|Desejo|Conversão|Engajamento","periodo":"Manhã|Tarde|Noite","sugestao":"texto concreto do story","razao":"por que faz sentido agora"}],"quantidade":{"manha":2,"tarde":3,"noite":2},"alerta":"mensagem de urgência se houver, ou string vazia"}`;

  try {
    const res  = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system:    'Responda APENAS com JSON válido, sem markdown, sem texto adicional.',
        messages:  [{ role: 'user', content: prompt }],
        maxTokens: 1200,
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const raw = (data.text || '').replace(/```json|```/g, '').trim();
    SC.motorResult = JSON.parse(raw);
  } catch(e) {
    SC.motorResult = {
      analise:        'Não foi possível gerar a estratégia. Verifique sua chave de API em Configurações.',
      prioridade:     'Adicione uma chave Groq ou Anthropic nas Configurações do app.',
      recomendacoes:  [],
      quantidade:     {},
      alerta:         '',
    };
  }

  SC.motorLoading = false;
  scRenderTab();
};

// ── 3. SEQUÊNCIA DO DIA ────────────────────────────────────────────────────────
function scRenderSequencia() {
  const leads = scGetLeads();
  let html = _scHeader('📅', 'Sequência do Dia', 'Stories organizados por período — manhã, tarde e noite');

  const ctxMsg = (type) => {
    if (leads.filter(l=>l.stage==='Proposta').length && (type==='Prova'||type==='Autoridade'))
      return { msg:'💼 Leads em proposta: reforce prova social', color:'#06B6D4' };
    if (leads.filter(l=>l.stage==='Follow-up 1').length && type==='Gatilho')
      return { msg:'🔁 Leads em follow-up: use gatilho de conversão', color:'#F97316' };
    if (leads.filter(l=>l.replied).length && type==='CTA')
      return { msg:'💬 Leads responderam: qualifique mais fundo', color:'#10B981' };
    return null;
  };

  for (const [period, pIcon, pSub] of [['Manhã','🌅','Construa presença'],['Tarde','☀️','Gere desejo'],['Noite','🌙','Converta']]) {
    const ps = scPeriodStyle(period);
    html += `
    <div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:${ps.bg};border:1px solid ${ps.border};margin-bottom:8px">
        <span style="font-size:22px">${pIcon}</span>
        <div>
          <div style="font-weight:700;font-size:14px;color:${ps.color}">${period}</div>
          <div style="font-size:12px;color:var(--text-secondary)">${pSub}</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${SC_SEQ[period].map(item => {
          const ctx = ctxMsg(item.type);
          return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;gap:10px">
            <div style="width:36px;height:36px;border-radius:8px;background:${ps.bg};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${item.icon}</div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
                <span style="font-weight:700;font-size:13px;color:var(--text-primary)">${item.title}</span>
                ${_scTag(item.type, scTypeColor(item.type))}
              </div>
              <div style="font-size:12px;color:var(--text-secondary)">${item.desc}</div>
              ${ctx ? `<div style="margin-top:6px;font-size:11px;padding:3px 8px;border-radius:6px;background:${ps.bg};color:${ctx.color};font-weight:600;display:inline-block">${ctx.msg}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  return `<div>${html}</div>`;
}

// ── 4. CHECKLIST / EXECUÇÃO ────────────────────────────────────────────────────
function scRenderChecklist() {
  const done  = SC.stories.filter(s => s.posted).length;
  const total = SC.stories.length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  let html = _scHeader('✅', 'Execução do Dia', 'Marque cada Story conforme postar');

  html += _scCard(`
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:10px">
      <div>
        <div style="font-size:13px;color:var(--text-secondary);margin-bottom:2px">Progresso de hoje</div>
        <div style="font-size:28px;font-weight:800;color:${pct===100?'#10B981':'var(--text-primary)'}">${pct}%</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:22px;font-weight:700;color:${pct===100?'#10B981':'#7C3AED'}">${done}/${total}</div>
        <div style="font-size:12px;color:var(--text-secondary)">Stories</div>
      </div>
    </div>
    ${_scBar(done, total, pct===100?'#10B981':'#7C3AED', 10)}
    ${pct===100 ? '<div style="margin-top:12px;text-align:center;font-size:14px;font-weight:700;color:#10B981">🎉 Parabéns! Todos os Stories foram postados hoje!</div>' : ''}
  `, 'margin-bottom:12px');

  for (const period of ['Manhã','Tarde','Noite']) {
    const ps    = scPeriodStyle(period);
    const group = SC.stories.filter(s => s.period === period);
    const dc    = group.filter(s => s.posted).length;
    const icon  = period==='Manhã'?'🌅':period==='Tarde'?'☀️':'🌙';

    html += `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-weight:700;font-size:13px;color:${ps.color}">${icon} ${period}</div>
        ${_scTag(`${dc}/${group.length} feitos`, ps.color)}
      </div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${group.map(s => `
          <div onclick="scToggleStory(${s.id})" style="
            display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;cursor:pointer;user-select:none;
            background:${s.posted?ps.bg:'var(--bg-card)'};
            border:1.5px solid ${s.posted?ps.border:'var(--border)'};
            transition:.15s
          ">
            <div style="
              width:22px;height:22px;border-radius:6px;flex-shrink:0;
              background:${s.posted?ps.color:'transparent'};
              border:2px solid ${s.posted?ps.color:'rgba(255,255,255,0.2)'};
              display:flex;align-items:center;justify-content:center;
              color:white;font-size:13px;font-weight:800;transition:.15s
            ">${s.posted?'✓':''}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500;color:${s.posted?'var(--text-muted)':'var(--text-primary)'};text-decoration:${s.posted?'line-through':'none'}">${s.title}</div>
              ${_scTag(s.type, scTypeColor(s.type))}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  return `<div>${html}</div>`;
}

window.scToggleStory = function(id) {
  const s = SC.stories.find(x => x.id === id);
  if (!s) return;
  s.posted = !s.posted;
  scSaveStories();
  scRenderTab();
  // Update header badge
  const done  = SC.stories.filter(x => x.posted).length;
  const total = SC.stories.length;
  const pct   = total > 0 ? Math.round(done / total * 100) : 0;
  const badge = document.querySelector('#view-stories [style*="Stories Control"] + div div');
  // Just re-render the header section via the tab render (already done above)
};

// ── 5. REPOST & COLAB ──────────────────────────────────────────────────────────
function scRenderRepost() {
  let html = _scHeader('🔄', 'Repost & Colab', 'Reposts sugeridos e parcerias planejadas');

  html += _scCard(`
    <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:8px">♻️ Reposts sugeridos</div>
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px">Conteúdos de parceiros que combinam com sua narrativa</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${SC_REPOSTS.map(r => `
        <div style="padding:12px;border-radius:10px;background:var(--bg-surface);border:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div style="flex:1">
              <div style="font-weight:700;font-size:13px;color:#A78BFA;margin-bottom:2px">${r.source}</div>
              <div style="font-size:13px;color:var(--text-primary);margin-bottom:5px">${r.content}</div>
              ${_scTag(r.type, scTypeColor(r.type))}
            </div>
            <div style="text-align:center;flex-shrink:0">
              <div style="font-size:20px;font-weight:800;color:${r.score>=90?'#10B981':r.score>=75?'#F59E0B':'#71717A'}">${r.score}</div>
              <div style="font-size:9px;color:var(--text-muted)">relevância</div>
            </div>
          </div>
          <button style="margin-top:8px;width:100%;padding:8px;border-radius:8px;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.1);color:#A78BFA;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
            + Adicionar ao plano
          </button>
        </div>
      `).join('')}
    </div>
  `, 'margin-bottom:12px');

  html += _scCard(`
    <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:10px">🤝 Colaborações</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
      ${SC.collabs.length === 0
        ? `<div style="font-size:13px;color:var(--text-muted);padding:8px 0">Nenhuma colaboração ainda. Adicione abaixo.</div>`
        : SC.collabs.map(c => `
          <div style="padding:12px;border-radius:10px;background:var(--bg-surface);border:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <div>
                <div style="font-weight:700;font-size:13px;color:var(--text-primary)">${c.partner}</div>
                <div style="font-size:12px;color:var(--text-secondary)">${c.format} · ${c.topic}</div>
              </div>
              ${_scTag(c.status, c.status==='Em andamento'?'#10B981':'#F59E0B')}
            </div>
          </div>
        `).join('')}
    </div>
    <div style="height:1px;background:var(--border);margin:4px 0 14px"></div>
    <div style="font-weight:600;font-size:13px;color:var(--text-primary);margin-bottom:8px">+ Nova colaboração</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <input id="scCollabPartner" placeholder="Parceiro (ex: @perfil)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-input);color:var(--text-primary);font-size:13px;outline:none;width:100%;box-sizing:border-box;font-family:inherit">
      <input id="scCollabFormat"  placeholder="Formato (ex: Vídeo conjunto)" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-input);color:var(--text-primary);font-size:13px;outline:none;width:100%;box-sizing:border-box;font-family:inherit">
      <input id="scCollabTopic"   placeholder="Tema" style="padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-input);color:var(--text-primary);font-size:13px;outline:none;width:100%;box-sizing:border-box;font-family:inherit">
      <button onclick="scAddCollab()" style="padding:11px;border-radius:8px;background:linear-gradient(135deg,#7C3AED,#A78BFA);border:none;color:#fff;font-weight:700;cursor:pointer;font-size:13px;font-family:inherit">
        Adicionar Colaboração
      </button>
    </div>
  `);

  return `<div style="display:flex;flex-direction:column;gap:0">${html}</div>`;
}

window.scAddCollab = function() {
  const partner = (document.getElementById('scCollabPartner')?.value || '').trim();
  const format  = (document.getElementById('scCollabFormat')?.value  || '').trim();
  const topic   = (document.getElementById('scCollabTopic')?.value   || '').trim();
  if (!partner || !format || !topic) return;
  SC.collabs.push({ id: Date.now(), partner, format, topic, status:'Planejado' });
  scSaveCollabs();
  scRenderTab();
};

// ── 6. CALENDÁRIO MENSAL ───────────────────────────────────────────────────────
function scRenderCalendario() {
  const today       = new Date();
  const year        = today.getFullYear();
  const month       = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const todayDate   = today.getDate();
  const types       = ['Bastidor','Autoridade','Prova','Desejo','Engajamento','CTA'];
  const events      = {};

  [2,4,5,7,8,10,11,12,14,15,17,18,19,21,22,25,26,28].forEach((d, i) => {
    events[d] = [types[i % types.length], types[(i+2) % types.length]].slice(0, d % 3 === 0 ? 2 : 1);
  });

  const days  = ['D','S','T','Q','Q','S','S'];
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_,i) => i + 1)];

  let html = _scHeader('🗓', 'Calendário Mensal', `${SC_MONTH_NAMES[month]} ${year} — Stories agendados`);

  html += _scCard(`
    <div style="font-weight:600;font-size:12px;color:var(--text-secondary);margin-bottom:8px">Tipos de Story</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${types.map(t => `
        <div style="display:flex;align-items:center;gap:4px">
          <div style="width:8px;height:8px;border-radius:2px;background:${scTypeColor(t)}"></div>
          <span style="font-size:11px;color:var(--text-secondary)">${t}</span>
        </div>
      `).join('')}
    </div>
  `, 'padding:12px 14px;margin-bottom:12px');

  html += _scCard(`
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">
      ${days.map(d => `<div style="text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);padding:4px 0">${d}</div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">
      ${cells.map(d => {
        if (!d) return '<div></div>';
        const isToday = d === todayDate;
        return `<div style="
          min-height:52px;border-radius:8px;padding:4px 3px;
          background:${isToday?'rgba(124,58,237,0.15)':'rgba(255,255,255,0.02)'};
          border:${isToday?'2px solid rgba(124,58,237,0.5)':'1px solid var(--border)'}
        ">
          <div style="font-size:11px;font-weight:700;color:${isToday?'#A78BFA':'var(--text-secondary)'};margin-bottom:2px">${d}</div>
          ${(events[d] || []).map(t => `
            <div style="font-size:8px;padding:1px 3px;border-radius:3px;margin-bottom:1px;background:${scTypeColor(t)}20;color:${scTypeColor(t)};font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t}</div>
          `).join('')}
        </div>`;
      }).join('')}
    </div>
  `, 'padding:12px');

  return `<div style="display:flex;flex-direction:column;gap:0">${html}</div>`;
}

// ── 7. TOM DE VOZ ──────────────────────────────────────────────────────────────
function scRenderTom() {
  let html = _scHeader('🎭', 'Tom de Voz', 'Define como o Motor IA vai escrever as sugestões');

  html += `<div style="padding:14px 16px;border-radius:12px;background:rgba(124,58,237,0.12);border:1.5px solid rgba(124,58,237,0.3);margin-bottom:12px">
    <div style="font-size:11px;color:#A78BFA;font-weight:700;letter-spacing:.5px;margin-bottom:3px">TOM ATIVO</div>
    <div style="font-size:15px;font-weight:700;color:var(--text-primary)">${SC.tone}</div>
  </div>`;

  html += _scCard(`
    <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:10px">Escolher tom</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${SC_TONE_PRESETS.map((p, i) => `
        <div onclick="scSetTone(${i})" style="
          display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;cursor:pointer;
          background:${SC.tone===p.name?'rgba(124,58,237,0.15)':'var(--bg-surface)'};
          border:1.5px solid ${SC.tone===p.name?'rgba(124,58,237,0.5)':'var(--border)'};
          transition:.15s
        ">
          <span style="font-size:22px">${p.emoji}</span>
          <div style="flex:1">
            <div style="font-weight:600;font-size:13px;color:var(--text-primary)">${p.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:1px">${p.desc}</div>
          </div>
          ${SC.tone===p.name?'<span style="color:#A78BFA;font-weight:800;font-size:16px">✓</span>':''}
        </div>
      `).join('')}
    </div>
  `, 'margin-bottom:12px');

  html += _scCard(`
    <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:8px">Tom personalizado</div>
    <textarea id="scCustomTone" placeholder="Ex: Direto ao ponto, foco em dados e resultados. Evitar linguagem muito formal." rows="3" style="
      width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);
      background:var(--bg-input);color:var(--text-primary);font-size:13px;outline:none;
      resize:vertical;box-sizing:border-box;line-height:1.6;font-family:inherit
    "></textarea>
    <button onclick="scSaveCustomTone()" style="
      margin-top:8px;width:100%;padding:11px;border-radius:8px;
      background:linear-gradient(135deg,#7C3AED,#A78BFA);border:none;
      color:#fff;font-weight:700;cursor:pointer;font-size:13px;font-family:inherit
    ">Salvar tom personalizado</button>
  `, 'margin-bottom:12px');

  html += _scCard(`
    <div style="font-weight:700;font-size:13px;color:var(--text-primary);margin-bottom:10px">🔗 Como o Motor usa o tom</div>
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">Baseado no estágio do lead, o Motor IA prioriza:</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${[
        ['Respondeu DM',   'Prova social + Autoridade',           '#10B981'],
        ['Não respondeu',  'Desejo + Engajamento',                '#EF4444'],
        ['Follow-up 1',    'Reforço de conversão',                '#F97316'],
        ['Proposta',       'Prova social + Gatilho de fechamento','#06B6D4'],
        ['Fechado',        'Bastidores + Relacionamento',         '#A78BFA'],
        ['Arquivado',      'Remarketing leve',                    '#71717A'],
      ].map(([s,st,c]) => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--bg-surface)">
          ${_scTag(s,c)}
          <span style="font-size:12px;color:var(--text-secondary)">→ ${st}</span>
        </div>
      `).join('')}
    </div>
  `);

  return `<div style="display:flex;flex-direction:column;gap:0">${html}</div>`;
}

window.scSetTone = function(idx) {
  SC.tone = SC_TONE_PRESETS[idx].name;
  scSaveTone();
  scRenderTab();
};

window.scSaveCustomTone = function() {
  const val = (document.getElementById('scCustomTone')?.value || '').trim();
  if (val) { SC.tone = val; scSaveTone(); scRenderTab(); }
};
