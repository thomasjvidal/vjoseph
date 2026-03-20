/* =========================================
   LEADFLOW — app.js
   Full application logic
   ========================================= */

// ---- TIPOS DE TEMPLATE (built-in, sempre disponíveis) ----
const BUILTIN_TEMPLATE_TYPES = [
  { name: 'landing_simples',  label: 'Landing Simples',      fields: ['nome','especialidade','cta','whatsapp'] },
  { name: 'landing_basica',   label: 'Landing Básica',        fields: ['nome','bio','cta','whatsapp'] },
  { name: 'landing_servicos', label: 'Landing com Serviços',  fields: ['nome','tagline','bio','servico_1','servico_2','servico_3','cta','whatsapp'] },
  { name: 'landing_completa', label: 'Landing Completa',      fields: ['nome','tagline','bio','servico_1','servico_2','servico_3','servico_4','foto','cta','whatsapp','instagram'] },
];

// ---- SISTEMA DE BLOCOS ----

const SECTIONS_BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,sans-serif;color:#111;background:#fff;overflow-x:hidden}
:root{--clr-primary:#7C3AED;--clr-accent:#06B6D4;--clr-dark:#0a0a10;--clr-gray:#6b7280;--clr-border:#e5e7eb}
a{text-decoration:none}
.sec-container{max-width:1100px;margin:0 auto;padding:0 24px}
.site-section{width:100%;padding:64px 24px}
.sec-h1{font-size:clamp(36px,5vw,56px);font-weight:900;line-height:1.1;letter-spacing:-2px}
.sec-h2{font-size:clamp(28px,4vw,40px);font-weight:800;line-height:1.2;letter-spacing:-1px}
.sec-h3{font-size:20px;font-weight:700;line-height:1.3}
.sec-body{font-size:16px;line-height:1.75;color:var(--clr-gray)}
.sec-small{font-size:13px}
.sec-btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;padding:15px 32px;border-radius:12px;font-weight:700;font-size:16px;transition:transform .2s,box-shadow .2s;cursor:pointer}
.sec-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.35)}
.sec-btn-wa{display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;padding:15px 32px;border-radius:12px;font-weight:700;font-size:16px;transition:transform .2s,box-shadow .2s;cursor:pointer}
.sec-btn-wa:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,211,102,.35)}
.sec-grid-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.sec-grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}
.sec-hover-lift{transition:transform .2s}.sec-hover-lift:hover{transform:translateY(-4px)}
@media(max-width:640px){.site-section{padding:48px 16px}.sec-btn-primary,.sec-btn-wa{width:100%;justify-content:center}}
`;

const SECTION_LIBRARY = [
  {
    id: 'hero_dark',
    category: 'hero',
    name: 'Hero Escuro',
    preview: 'Fundo dark · Gradiente · CTA destaque',
    html: `<style>
.hd-wrap{background:linear-gradient(135deg,#0a0a10 60%,#1a0a2e);color:#fff;text-align:center;padding:80px 24px 96px;position:relative;overflow:hidden}
.hd-wrap::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.25) 0%,transparent 65%);pointer-events:none}
.hd-badge{display:inline-block;background:rgba(124,58,237,.2);border:1px solid rgba(124,58,237,.4);color:#c4b5fd;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:24px;letter-spacing:.5px}
.hd-photo{width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid rgba(124,58,237,.5);box-shadow:0 0 0 6px rgba(124,58,237,.1);margin:0 auto 28px;display:block}
.hd-photo-placeholder{width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#06B6D4);display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;color:#fff;margin:0 auto 28px}
.hd-h1{font-size:clamp(34px,5vw,58px);font-weight:900;letter-spacing:-2px;line-height:1.08;margin-bottom:16px;background:linear-gradient(135deg,#fff 40%,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hd-tagline{font-size:18px;color:rgba(255,255,255,.65);max-width:560px;margin:0 auto 40px;line-height:1.6}
.hd-city{font-size:13px;color:rgba(255,255,255,.35);margin-top:20px;letter-spacing:.5px}
</style>
<section class="site-section hd-wrap">
  <div class="sec-container">
    {{#photo}}<img src="{{photo}}" class="hd-photo" alt="{{name}}">{{/photo}}
    {{^photo}}<div class="hd-photo-placeholder">{{initials}}</div>{{/photo}}
    <div class="hd-badge">{{specialty}}</div>
    <h1 class="hd-h1">{{name}}</h1>
    <p class="hd-tagline">{{tagline}}</p>
    <a href="https://wa.me/55{{whatsapp_clean}}" class="sec-btn-wa">💬 {{cta}}</a>
    <p class="hd-city">{{city}}</p>
  </div>
</section>`
  },
  {
    id: 'hero_light',
    category: 'hero',
    name: 'Hero Claro',
    preview: 'Fundo branco · Foto circular · Minimalista',
    html: `<style>
.hl-wrap{background:#fff;padding:80px 24px 96px;text-align:center;border-bottom:1px solid #f0f0f0}
.hl-photo{width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #f3f0ff;margin:0 auto 24px;display:block;box-shadow:0 4px 20px rgba(124,58,237,.15)}
.hl-photo-placeholder{width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#06B6D4);display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:#fff;margin:0 auto 24px}
.hl-badge{display:inline-block;background:#f3f0ff;color:#7C3AED;padding:5px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:20px}
.hl-h1{font-size:clamp(32px,5vw,52px);font-weight:900;color:#111;letter-spacing:-2px;line-height:1.1;margin-bottom:14px}
.hl-tagline{font-size:17px;color:#6b7280;max-width:520px;margin:0 auto 36px;line-height:1.65}
.hl-city{font-size:12px;color:#9ca3af;margin-top:16px;letter-spacing:.5px}
</style>
<section class="site-section hl-wrap">
  <div class="sec-container">
    {{#photo}}<img src="{{photo}}" class="hl-photo" alt="{{name}}">{{/photo}}
    {{^photo}}<div class="hl-photo-placeholder">{{initials}}</div>{{/photo}}
    <div class="hl-badge">{{specialty}}</div>
    <h1 class="hl-h1">{{name}}</h1>
    <p class="hl-tagline">{{tagline}}</p>
    <a href="https://wa.me/55{{whatsapp_clean}}" class="sec-btn-primary">📅 {{cta}}</a>
    <p class="hl-city">{{city}}</p>
  </div>
</section>`
  },
  {
    id: 'bio_clean',
    category: 'bio',
    name: 'Bio Minimalista',
    preview: 'Texto centralizado · Sem imagem · Clean',
    html: `<style>
.bc-wrap{background:#fafafa;text-align:center}
.bc-title{font-size:13px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px}
.bc-h2{font-size:clamp(24px,3vw,36px);font-weight:800;color:#111;margin-bottom:20px;letter-spacing:-1px}
.bc-text{font-size:17px;color:#6b7280;max-width:640px;margin:0 auto;line-height:1.8}
</style>
<section class="site-section bc-wrap">
  <div class="sec-container">
    <p class="bc-title">Sobre</p>
    <h2 class="bc-h2">Quem é {{name}}?</h2>
    <p class="bc-text">{{bio}}</p>
  </div>
</section>`
  },
  {
    id: 'bio_split',
    category: 'bio',
    name: 'Bio com Foto',
    preview: 'Foto à esquerda · Texto à direita · 50/50',
    html: `<style>
.bs-wrap{background:#fff}
.bs-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;max-width:1000px;margin:0 auto}
.bs-photo{width:100%;aspect-ratio:1;border-radius:20px;object-fit:cover;box-shadow:0 20px 60px rgba(0,0,0,.1)}
.bs-photo-placeholder{width:100%;aspect-ratio:1;border-radius:20px;background:linear-gradient(135deg,#f3f0ff,#e0e7ff);display:flex;align-items:center;justify-content:center;font-size:64px}
.bs-label{font-size:12px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
.bs-h2{font-size:clamp(22px,3vw,34px);font-weight:800;color:#111;margin-bottom:16px;letter-spacing:-1px}
.bs-text{font-size:16px;color:#6b7280;line-height:1.8}
@media(max-width:700px){.bs-grid{grid-template-columns:1fr;gap:32px}}
</style>
<section class="site-section bs-wrap">
  <div class="sec-container">
    <div class="bs-grid">
      <div>
        {{#photo}}<img src="{{photo}}" class="bs-photo" alt="{{name}}">{{/photo}}
        {{^photo}}<div class="bs-photo-placeholder">👤</div>{{/photo}}
      </div>
      <div>
        <p class="bs-label">Sobre</p>
        <h2 class="bs-h2">{{name}}</h2>
        <p class="bs-text">{{bio}}</p>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'servicos_cards',
    category: 'servicos',
    name: 'Serviços em Cards',
    preview: 'Grid de cards · Numerados · Visual',
    html: `<style>
.sc-wrap{background:#fff}
.sc-header{text-align:center;margin-bottom:48px}
.sc-label{font-size:12px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
.sc-h2{font-size:clamp(24px,3vw,36px);font-weight:800;color:#111;letter-spacing:-1px}
.sc-card{background:#fafafa;border:1px solid #f0f0f0;border-radius:16px;padding:28px 24px;transition:all .2s}
.sc-card:hover{border-color:#7C3AED;box-shadow:0 8px 32px rgba(124,58,237,.1);transform:translateY(-4px)}
.sc-num{font-size:32px;font-weight:900;color:#7C3AED;opacity:.3;margin-bottom:12px;line-height:1}
.sc-name{font-size:16px;font-weight:700;color:#111;line-height:1.4}
</style>
<section class="site-section sc-wrap">
  <div class="sec-container">
    <div class="sc-header">
      <p class="sc-label">O que ofereço</p>
      <h2 class="sc-h2">Serviços</h2>
    </div>
    <div class="sec-grid-3">
      {{services_cards_html}}
    </div>
  </div>
</section>`
  },
  {
    id: 'servicos_lista',
    category: 'servicos',
    name: 'Serviços em Lista',
    preview: 'Lista com ícones · Uma coluna · Simples',
    html: `<style>
.sl-wrap{background:#fafafa}
.sl-header{text-align:center;margin-bottom:48px}
.sl-label{font-size:12px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
.sl-h2{font-size:clamp(24px,3vw,36px);font-weight:800;color:#111;letter-spacing:-1px}
.sl-list{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.sl-item{display:flex;align-items:center;gap:16px;background:#fff;border:1px solid #f0f0f0;border-radius:12px;padding:18px 20px}
.sl-dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#06B6D4);flex-shrink:0}
.sl-name{font-size:16px;font-weight:600;color:#111}
</style>
<section class="site-section sl-wrap">
  <div class="sec-container">
    <div class="sl-header">
      <p class="sl-label">O que ofereço</p>
      <h2 class="sl-h2">Serviços</h2>
    </div>
    <div class="sl-list">
      {{services_lista_html}}
    </div>
  </div>
</section>`
  },
  {
    id: 'cta_simples',
    category: 'cta',
    name: 'CTA Simples',
    preview: 'Fundo claro · Texto + botão WhatsApp',
    html: `<style>
.cs-wrap{background:#fff;text-align:center;border-top:1px solid #f0f0f0}
.cs-h2{font-size:clamp(24px,3vw,36px);font-weight:800;color:#111;letter-spacing:-1px;margin-bottom:12px}
.cs-sub{font-size:16px;color:#6b7280;margin-bottom:36px;line-height:1.6}
.cs-ig{display:inline-flex;align-items:center;gap:6px;margin-top:20px;color:#7C3AED;font-size:14px;font-weight:600}
</style>
<section class="site-section cs-wrap">
  <div class="sec-container">
    <h2 class="cs-h2">Vamos conversar?</h2>
    <p class="cs-sub">Atendimento {{attendance}}{{#city}} em {{city}}{{/city}}</p>
    <a href="https://wa.me/55{{whatsapp_clean}}" class="sec-btn-wa">💬 {{cta}}</a>
    {{#instagram}}<div><a href="https://instagram.com/{{instagram_clean}}" class="cs-ig">📸 {{instagram}}</a></div>{{/instagram}}
  </div>
</section>
<footer style="padding:20px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #f0f0f0">© 2025 {{name}} — {{specialty}}</footer>`
  },
  {
    id: 'cta_premium',
    category: 'cta',
    name: 'CTA Premium',
    preview: 'Fundo dark · Dois botões · Impacto máximo',
    html: `<style>
.cp-wrap{background:linear-gradient(135deg,#0a0a10,#1a0a2e);color:#fff;text-align:center;position:relative;overflow:hidden}
.cp-wrap::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,rgba(124,58,237,.2) 0%,transparent 65%);pointer-events:none}
.cp-h2{font-size:clamp(26px,4vw,44px);font-weight:900;letter-spacing:-1px;margin-bottom:12px;background:linear-gradient(135deg,#fff,#c4b5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.cp-sub{font-size:16px;color:rgba(255,255,255,.6);margin-bottom:40px;line-height:1.6}
.cp-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.cp-ig{display:inline-flex;align-items:center;gap:6px;margin-top:20px;color:rgba(255,255,255,.5);font-size:14px}
</style>
<section class="site-section cp-wrap">
  <div class="sec-container">
    <h2 class="cp-h2">Pronto para transformar<br>sua vida?</h2>
    <p class="cp-sub">Atendimento {{attendance}}{{#city}} em {{city}}{{/city}}</p>
    <div class="cp-btns">
      <a href="https://wa.me/55{{whatsapp_clean}}" class="sec-btn-wa">💬 {{cta}}</a>
    </div>
    {{#instagram}}<div><a href="https://instagram.com/{{instagram_clean}}" class="cp-ig">📸 {{instagram}}</a></div>{{/instagram}}
  </div>
</section>
<footer style="padding:16px;text-align:center;font-size:12px;color:rgba(255,255,255,.2);background:#0a0a10">© 2025 {{name}} — {{specialty}}</footer>`
  }
];

const SECTION_RECIPES = {
  dentista:      ['hero_dark',  'bio_split',  'servicos_cards', 'cta_premium'],
  odonto:        ['hero_dark',  'bio_split',  'servicos_cards', 'cta_premium'],
  nutricionista: ['hero_light', 'bio_clean',  'servicos_cards', 'cta_simples'],
  nutri:         ['hero_light', 'bio_clean',  'servicos_cards', 'cta_simples'],
  psicolog:      ['hero_light', 'bio_split',  'servicos_lista', 'cta_simples'],
  terapeuta:     ['hero_light', 'bio_split',  'servicos_lista', 'cta_simples'],
  clinica:       ['hero_dark',  'bio_split',  'servicos_lista', 'cta_premium'],
  médico:        ['hero_dark',  'bio_split',  'servicos_lista', 'cta_premium'],
  medico:        ['hero_dark',  'bio_split',  'servicos_lista', 'cta_premium'],
  fisio:         ['hero_dark',  'bio_clean',  'servicos_cards', 'cta_premium'],
  esteti:        ['hero_light', 'bio_split',  'servicos_cards', 'cta_premium'],
  personal:      ['hero_dark',  'bio_clean',  'servicos_lista', 'cta_premium'],
  _default:      ['hero_light', 'bio_clean',  'servicos_cards', 'cta_simples']
};

const SECTION_CATEGORIES = ['hero', 'bio', 'servicos', 'cta'];

// ---- STATE ----
let state = {
  leads: [],
  settings: {
    geminiKey: '',
    vercelToken: '',
    servicePrice: 350,
    dailyLeadGoal: 100,
    monthlySiteGoal: 30,
    yourName: 'MFS Studio',
    yourInstagram: '@mfsstudio'
  },
  currentView: 'dashboard',
  dashboardTab: 'metrics',
  leadsTab: 'ativos',
  selectedTemplate: 'minimal',
  customTemplates: [],
  templateTypes: [],
  generatorMode: 'template',
  selectedSections: [],
  generatedHTML: '',
  currentPreviewTemplate: '',
  currentMsgTemplate: 0,
  previewSettings: {
    btnPrimary: '#7C3AED',
    btnSecondary: '#06B6D4'
  }
};

const MSG_TEMPLATES = [
  {
    title: 'Abertura — Apresentação',
    text: `Oi {{nome}}, tudo bem? 😊

Estava analisando alguns perfis de nutricionistas da região e vi o seu trabalho. Incrível!

Percebi que você ainda não tem um site profissional — e achei que poderia te ajudar com isso.

Posso te mostrar um exemplo de como ficaria o seu? 🚀`
  },
  {
    title: 'Follow-up — Site Pronto',
    text: `Oi {{nome}}! 🙋

Acabei de finalizar um exemplo de site para você. Ficou lindo, com as suas cores e especialidade em {{especialidade}}.

Segue o link: {{link_site}}

O que você achou? Posso personalizar qualquer detalhe 😊`
  },
  {
    title: 'Curiosidade — Antes da Revelação',
    text: `Oi {{nome}}!! Fiz algo especial pra você... 🎁

Dediquei um tempo criando um site profissional mostrando como seria a sua presença digital como nutricionista em {{cidade}}.

Posso te enviar o link?`
  },
  {
    title: 'Fechamento — Proposta',
    text: `Ótimo, {{nome}}! 😄

Posso te mostrar o site completo com:
✅ Página de apresentação profissional
✅ Seus serviços e especializações
✅ Botão de agendamento via WhatsApp
✅ Design premium personalizado

Tudo pronto para publicar. Bora fechar? 💜`
  },
  {
    title: 'Reativação — Sem Resposta',
    text: `Oii {{nome}}, sumidade! rsrs 😄

Lembrei que te mandei uma mensagem semana passada sobre seu site.

Sei que a rotina de nutricionista é corrida, mas queria muito te mostrar o que preparei. Tenho certeza que vai curtir 🥑

Tem 2 minutinhos?`
  }
];

// ---- PERSISTENCE ----
function save() {
  try {
    localStorage.setItem('lf_leads', JSON.stringify(state.leads));
    localStorage.setItem('lf_settings', JSON.stringify(state.settings));
    localStorage.setItem('lf_custom_templates', JSON.stringify(state.customTemplates));
    localStorage.setItem('lf_template_types', JSON.stringify(state.templateTypes));
    localStorage.setItem('lf_preview_settings', JSON.stringify(state.previewSettings));
    localStorage.setItem('lf_dashboard_tab', state.dashboardTab === 'pipeline' ? 'pipeline' : 'metrics');

    // Visual feedback for reassurance (non-intrusive)
    const saveIndicator = document.getElementById('saveIndicator');
    if (saveIndicator) {
      saveIndicator.textContent = 'Salvo';
      saveIndicator.classList.add('visible');
      setTimeout(() => saveIndicator.classList.remove('visible'), 2000);
    }
    if (state.currentView === 'kpis' && typeof renderKPIs === 'function') renderKPIs();
  } catch (e) {
    console.error('Erro ao salvar:', e);
    if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
      alert('ATENÇÃO: Limite de armazenamento cheio! Faça um backup imediatamente para não perder dados.');
      exportBackup();
    } else {
      toast('Erro ao salvar dados!', 'error');
    }
  }
}

function load() {
  try {
    const leads = localStorage.getItem('lf_leads');
    const settings = localStorage.getItem('lf_settings');
    const customTemplates = localStorage.getItem('lf_custom_templates');
    const templateTypes = localStorage.getItem('lf_template_types');
    const previewSettings = localStorage.getItem('lf_preview_settings');
    const dashboardTab = localStorage.getItem('lf_dashboard_tab');
    if (leads) {
      state.leads = JSON.parse(leads).map(l => {
        if (l.status === 'analisado') l.status = 'coletado';
        // Migration: Ensure pipelineStage exists
        if (!l.pipelineStage) {
          if (l.status === 'fechado') l.pipelineStage = 'fechado';
          else if (l.status === 'contatado') l.pipelineStage = 'dm_enviada';
          else if (l.status === 'site_pronto') l.pipelineStage = 'engajar';
          else l.pipelineStage = 'engajar';
        }
        if (!l.pipelineStageV2) {
          const old = l.pipelineStage || 'engajar';
          const st = l.status || '';
          if (st === 'arquivado' || st === 'sem_interesse') l.pipelineStageV2 = 'arquivado';
          else if (st === 'fechado' || old === 'fechado') l.pipelineStageV2 = 'fechado';
          else if (st === 'cobrado' || old === 'proposta') l.pipelineStageV2 = 'proposta_enviada';
          else if (old === 'respondeu') l.pipelineStageV2 = 'respondeu';
          else if (old === 'follow_up') l.pipelineStageV2 = 'follow_up_1';
          else if (st === 'site_pronto') l.pipelineStageV2 = 'chat_gerado';
          else if (st === 'contatado' || old === 'dm_enviada') l.pipelineStageV2 = 'dm1_enviada';
          else l.pipelineStageV2 = 'coletados';
        }
        if (l.pipelineStageV2 === 'follow_up') l.pipelineStageV2 = 'follow_up_1';
        if (l.pipelineStageV2 === 'site_dm2') {
          l.pipelineStageV2 = l.dm2SentAt ? 'dm2_enviada' : 'chat_gerado';
        }
        if (!l.history) l.history = [];
        if (!l.createdAt) l.createdAt = Date.now();
        normalizeV2StageEntries(l);
        return l;
      });
    }
    if (previewSettings) {
      const parsed = JSON.parse(previewSettings);
      if (parsed && typeof parsed === 'object') {
        state.previewSettings = {
          ...state.previewSettings,
          ...parsed
        };
      }
    }
    if (settings) state.settings = { ...state.settings, ...JSON.parse(settings) };
    if (customTemplates) state.customTemplates = JSON.parse(customTemplates) || [];
    if (!Array.isArray(state.customTemplates)) state.customTemplates = [];
    if (templateTypes) state.templateTypes = JSON.parse(templateTypes) || [];
    if (!Array.isArray(state.templateTypes)) state.templateTypes = [];
    state.dashboardTab = 'metrics';

    renderGeneratorTemplates();
    // Start sidebar collapsed
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.add('collapsed');
  } catch (e) { console.warn('Load error', e); }
}

function toTsAny(v) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  const p = Date.parse(v);
  if (Number.isFinite(p)) return p;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pushV2StageEntry(lead, stageId, atTs) {
  if (!lead) return;
  const st = String(stageId || '').trim().toLowerCase();
  const ts = toTsAny(atTs) || Date.now();
  if (!st) return;
  const ex = Array.isArray(lead.v2StageEntriesExclusions) ? lead.v2StageEntriesExclusions : [];
  if (ex && ex.includes(`${st}|${ts}`)) return;
  if (!Array.isArray(lead.v2StageEntries)) lead.v2StageEntries = [];
  const exists = lead.v2StageEntries.some(e => e && String(e.stageId || '').toLowerCase() === st && toTsAny(e.at) === ts);
  if (!exists) lead.v2StageEntries.push({ stageId: st, at: ts });
  lead.v2StageEntries.sort((a, b) => toTsAny(a?.at) - toTsAny(b?.at));
}

function normalizeV2StageEntries(lead) {
  if (!lead) return;
  if (!Array.isArray(lead.v2StageEntries)) lead.v2StageEntries = [];
  if (!Array.isArray(lead.v2StageEntriesExclusions)) lead.v2StageEntriesExclusions = [];
  const exclusions = new Set(lead.v2StageEntriesExclusions.map(x => String(x)));

  const add = (stageId, ts) => {
    const t = toTsAny(ts);
    if (!t) return;
    const st = String(stageId || '').trim().toLowerCase();
    if (!st) return;
    if (exclusions.has(`${st}|${t}`)) return;
    pushV2StageEntry(lead, st, t);
  };

  const baseCreated = toTsAny(lead.createdAt) || Date.now();
  add('coletados', baseCreated);

  const hist = Array.isArray(lead.history) ? lead.history : [];
  hist.forEach(h => {
    const act = (h && h.action) ? String(h.action) : '';
    const ts = toTsAny(h && h.date);
    if (!ts) return;
    const m = act.match(/V2:\s+(?:Moved|Auto site):\s+([a-z0-9_]+)\s+->\s+([a-z0-9_]+)/i);
    if (!m) return;
    const to = String(m[2] || '').toLowerCase();
    if (to) add(to, ts);
  });

  add('dm1_enviada', lead.dm1SentAt);
  add('chat_gerado', lead.siteGeneratedAt);
  add('dm2_enviada', lead.dm2SentAt);
  add('proposta_enviada', lead.propostaSentAt);
  add('fechado', lead.closedAt);
  add('arquivado', lead.archivedAt);

  const curStage = (lead.pipelineStageV2 || 'coletados');
  const curTs = toTsAny(lead.v2LastMovedAt) || baseCreated;
  add(curStage, curTs);
}

function v2TimelineOf(lead, nowTs) {
  if (!lead) return [];
  const now = toTsAny(nowTs) || Date.now();
  if (!Array.isArray(lead.v2StageEntries) || !lead.v2StageEntries.length) normalizeV2StageEntries(lead);
  const entries = (Array.isArray(lead.v2StageEntries) ? lead.v2StageEntries : [])
    .map(e => ({ stageId: String(e?.stageId || '').toLowerCase(), at: toTsAny(e?.at) }))
    .filter(e => e.stageId && e.at)
    .sort((a, b) => a.at - b.at);

  const seq = [];
  entries.forEach(e => {
    if (!seq.length || seq[seq.length - 1].stageId !== e.stageId) seq.push(e);
  });
  if (!seq.length) return [];

  return seq.map((e, i) => {
    const endAt = seq[i + 1]?.at || now;
    const durMs = Math.max(0, endAt - e.at);
    return { stageId: e.stageId, startAt: e.at, endAt, durMs, isCurrent: i === seq.length - 1 };
  });
}

function stageMetaOf(stageId) {
  const stages = (typeof DASH2_STAGES !== 'undefined' && Array.isArray(DASH2_STAGES)) ? DASH2_STAGES : [];
  const id = String(stageId || '').toLowerCase();
  const s = stages.find(x => String(x?.id || '').toLowerCase() === id);
  return s || { id, label: stageId || '—', color: '#94a3b8' };
}

function fmtLeadDuration(ms) {
  const m = Number(ms);
  if (!Number.isFinite(m) || m <= 0) return '—';
  const minutes = Math.round(m / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  if (hours < 24) return remMin ? `${hours}h ${remMin}min` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  if (days < 10) return remH ? `${days}d ${remH}h` : `${days}d`;
  return `${days}d`;
}

function leadCurrentStageAgeText(lead, nowTs) {
  const now = toTsAny(nowTs) || Date.now();
  const tl = v2TimelineOf(lead, now);
  if (!tl.length) return '';
  const cur = tl[tl.length - 1];
  if (!cur || !cur.isCurrent) return '';
  const d = fmtLeadDuration(cur.durMs);
  return d === '—' ? '' : `há ${d}`;
}

function fmtLeadDateTime(ts) {
  const t = toTsAny(ts);
  if (!t) return '—';
  return new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ---- ROUTING ----
function navigate(view, activeNavEl) {
  state.currentView = view;
  const navItems = Array.from(document.querySelectorAll('.nav-item'));
  navItems.forEach(el => el.classList.remove('active'));
  if (activeNavEl && activeNavEl.classList && activeNavEl.classList.contains('nav-item')) {
    activeNavEl.classList.add('active');
  } else {
    const firstMatch = navItems.find(el => el.dataset.view === view);
    if (firstMatch) firstMatch.classList.add('active');
  }
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === `view-${view}`));
  const titles = {
    dashboard: ['Dashboard', 'Visão geral do sistema'],
    office: ['Office', 'VJoseph HQ'],
    kpis: ['KPIs do Funil', 'Métricas que controlam o negócio'],
    dashboard2: ['Dashboard 2', 'Pipeline Kanban único'],
    leads: ['Leads', 'Gerencie todos os seus contatos'],
    analyzer: ['Analisador de Bio', 'Extraia dados de perfis com IA'],
    generator: ['Gerador de Sites', 'Crie sites personalizados automaticamente'],
    messages: ['Mensagens', 'Templates de prospecção e follow-up'],
    'lab-mensagens': ['Lab de Mensagens', 'Teste e otimize suas mensagens'],
    'biblioteca-templates': ['Biblioteca de Templates', 'Gerencie seus produtos e templates'],
    stories: ['Stories Control', 'Estratégia de Stories integrada ao LeadFlow'],
    settings: ['Configurações', 'API, preços e configurações gerais']
  };
  if (titles[view]) {
    document.getElementById('pageTitle').textContent = titles[view][0];
    document.getElementById('breadcrumb').textContent = titles[view][1];
  }
  if (view === 'dashboard') {
    renderDashboard();
    syncDashboardTabsUI();
  }
  if (view === 'kpis') renderKPIs();
  if (view === 'dashboard2') renderDashboard2();
  if (view === 'leads') renderLeadsTable();
  if (view === 'generator') {
    populateGenLeadSelect();
    renderGeneratorModeToggle();
    if (state.generatorMode === 'blocos') renderSectionPicker();
    else renderGeneratorTemplates();
  }
  if (view === 'messages') {
    renderProspectingBoard();
    renderMiniKanbanV2('k2m-', 'kanbanv2m-');
    initKanbanDnd();
  }

  if (view === 'stories') {
    if (typeof renderStoriesView === 'function') renderStoriesView();
  }
  if (view === 'settings') { loadSettingsForm(); loadApiConfig(); }

  // Recarrega Lab de Mensagens sempre que o usuário navegar para ela
  if (view === 'lab-mensagens') {
    try {
      const saved = localStorage.getItem('lf_messageLab');
      if (saved) state.messageLab = JSON.parse(saved);
    } catch (e) {}
    if (typeof renderMessageLab === 'function') {
      renderMessageLab(window.currentLabStage || 'dm1');
    }
  }

  // Send LeadFlow data to HQ iframe when office view is active
  if (view === 'office') {
    setTimeout(() => {
      const iframe = document.querySelector('#view-office iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'lf_data', leads: state.leads, settings: state.settings }, '*');
      }
    }, 700);
  }
}

// Recebe postMessage do HQ (iframe) quando um lead muda de etapa
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;
  // HQ confirmou envio e moveu lead → atualiza estado local
  if (e.data.type === 'lf_leads_updated' && Array.isArray(e.data.leads)) {
    state.leads = e.data.leads;
    save();
    if (state.currentView === 'dashboard') { renderDashboard(); syncDashboardTabsUI(); }
    if (state.currentView === 'leads') renderLeadsTable();
    if (state.currentView === 'dashboard2') renderDashboard2();
    if (state.currentView === 'kpis') renderKPIs();
  }
});

function navigatePipelineHQ(e) {
  if(e) e.preventDefault();
  navigate('office');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-pipeline-hq').classList.add('active');
  document.getElementById('pageTitle').textContent = 'Pipeline HQ';
  document.getElementById('breadcrumb').textContent = 'Funil IA completo do VJoseph HQ';
  setTimeout(() => {
    const iframe = document.querySelector('#view-office iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'lf_data', leads: state.leads, settings: state.settings }, '*');
      iframe.contentWindow.postMessage({ type: 'open_pipeline' }, '*');
    }
  }, 700);
}

// ---- TOAST ----
function toast(msg, icon = 'success') {
  const el = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

// ---- STATUS HELPERS ----
const PROSPECT_STAGES = [
  { id: 'engajar', label: 'Engajar Perfil', color: '#64748b' },
  { id: 'dm_enviada', label: 'DM Enviada', color: '#3b82f6' },
  { id: 'nao_respondeu', label: 'Não Respondeu', color: '#06b6d4' },
  { id: 'respondeu', label: 'Respondeu', color: '#8b5cf6' },
  { id: 'follow_up', label: 'Follow-up', color: '#f59e0b' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#10b981' },
  { id: 'proposta', label: 'Proposta', color: '#ec4899' },
  { id: 'fechado', label: 'Fechado', color: '#22c55e' }
];

function normalizeLeadStatus(s) {
  const v = String(s || '').trim().toLowerCase();
  if (!v) return '';
  if (v === 'analisado') return 'coletado';
  return v;
}

const STATUS_LABELS = {
  coletado: 'Coletado',
  site_pronto: 'Site Pronto',
  contatado: 'Contatado',
  cobrado: 'Cobrado',
  fechado: 'Fechado',
  sem_interesse: 'Sem Interesse',
  arquivado: 'Arquivado'
};

function statusBadge(s) {
  const st = normalizeLeadStatus(s) || String(s || '');
  const label = STATUS_LABELS[st] || st;
  return `<span class="status-badge status-${st}">${label}</span>`;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function renderMiniKanban(countPrefix, colPrefix) {
  const cols = { coletado: [], contatado: [], arquivado: [], site_pronto: [], cobrado: [], fechado: [] };
  state.leads.forEach(l => {
    const st = normalizeLeadStatus(l.status);
    if (st && cols[st]) cols[st].push(l);
  });

  const colMap = { coletado: 'coletado', contatado: 'contatado', site_pronto: 'site', cobrado: 'cobrado', arquivado: 'arquivado', fechado: 'fechado' };
  const nowTs = Date.now();
  Object.entries(cols).forEach(([status, leads]) => {
    const key = colMap[status];
    const countEl = document.getElementById(`${countPrefix}${key}`);
    if (countEl) countEl.textContent = leads.length;
    const container = document.getElementById(`${colPrefix}${key}`);
    if (!container) return;
    container.innerHTML = leads.map(l => {
      const initial = (l.name || '?').trim().charAt(0).toUpperCase();
      const imgTag = l.avatar ? `<img src="${l.avatar}" alt="${l.name || ''}" referrerpolicy="no-referrer" onload="this.parentElement.classList.add('has-img')" onerror="this.remove();this.parentElement.classList.remove('has-img')">` : '';
      const ageText = leadCurrentStageAgeText(l, nowTs);
      return `<div class="kanban-card" draggable="true" data-id="${l.id}" onclick="openLeadTimeline('${l.id}')">
        <span class="avatar avatar-sm">${imgTag}<span class="avatar-fallback">${initial}</span></span>
        <span>
          <div class="kanban-card-name">${l.name}</div>
          <div class="kanban-card-sub">${l.instagram || ''}</div>
          ${ageText ? `<div class="kanban-card-age">${ageText}</div>` : ''}
          <div class="prospect-footer">
            <div class="prospect-actions">
              <button class="p-action-btn" title="Copiar Mensagem" onclick="event.stopPropagation(); prospectAction('${l.id}', 'copy_msg')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="p-action-btn" title="Abrir Instagram" onclick="event.stopPropagation(); prospectAction('${l.id}', 'open_insta')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </button>
              <button class="p-action-btn" title="Abrir WhatsApp" onclick="event.stopPropagation(); prospectAction('${l.id}', 'open_whats')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
              <button class="p-action-btn primary" title="Gerar Site" onclick="event.stopPropagation(); prospectAction('${l.id}', 'generate_site')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </button>
            </div>
          </div>
        </span>
      </div>`;
    }).join('') || '<div style="color:var(--text-muted);font-size:11px;padding:8px">Nenhum</div>';
  });
}

function renderMiniKanbanV2(countPrefix = 'k2-', colPrefix = 'kanbanv2-') {
  const stages = Array.isArray(DASH2_STAGES) ? DASH2_STAGES : [];
  const cols = {};
  stages.forEach(s => { cols[s.id] = []; });

  state.leads.forEach(l => {
    const stageId = l.pipelineStageV2 || 'coletados';
    if (cols[stageId]) cols[stageId].push(l);
  });

  const nowTs = Date.now();
  stages.forEach(stage => {
    const countEl = document.getElementById(`${countPrefix}${stage.id}`);
    if (countEl) countEl.textContent = cols[stage.id].length;

    const container = document.getElementById(`${colPrefix}${stage.id}`);
    if (!container) return;

    container.innerHTML = cols[stage.id].map(l => {
      const initial = (l.name || '?').trim().charAt(0).toUpperCase();
      const imgTag = l.avatar ? `<img src="${l.avatar}" alt="${l.name || ''}" referrerpolicy="no-referrer" onload="this.parentElement.classList.add('has-img')" onerror="this.remove();this.parentElement.classList.remove('has-img')">` : '';
      const ageText = leadCurrentStageAgeText(l, nowTs);
      return `<div class="kanban-card" draggable="true" data-id="${l.id}" onclick="openLeadTimeline('${l.id}')">
        <span class="avatar avatar-sm">${imgTag}<span class="avatar-fallback">${initial}</span></span>
        <span>
          <div class="kanban-card-name">${l.name || ''}</div>
          <div class="kanban-card-sub">${l.instagram || ''}</div>
          ${ageText ? `<div class="kanban-card-age">${ageText}</div>` : ''}
          <div class="prospect-footer">
            <div class="prospect-actions">
              <button class="p-action-btn" title="Copiar Mensagem" onclick="event.stopPropagation(); prospectAction('${l.id}', 'copy_msg')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="p-action-btn" title="Abrir Instagram" onclick="event.stopPropagation(); prospectAction('${l.id}', 'open_insta')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </button>
              <button class="p-action-btn" title="Abrir WhatsApp" onclick="event.stopPropagation(); prospectAction('${l.id}', 'open_whats')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
              <button class="p-action-btn primary" title="Gerar Site" onclick="event.stopPropagation(); prospectAction('${l.id}', 'generate_site')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </button>
            </div>
          </div>
        </span>
      </div>`;
    }).join('') || '<div style="color:var(--text-muted);font-size:11px;padding:8px">Nenhum</div>';
  });
}

function renderProspectMiniKanban(countPrefix = 'k3-', colPrefix = 'kanbanv3-') {
  const stages = Array.isArray(DASH2_STAGES) ? DASH2_STAGES : [];
  const cols = {};
  stages.forEach(s => { cols[s.id] = []; });

  state.leads.forEach(l => {
    // Use pipelineStageV2 for Prospect/Mensagens mirror
    const stageId = l.pipelineStageV2 || 'coletados';
    if (cols[stageId]) cols[stageId].push(l);
  });

  stages.forEach(s => {
    const leads = cols[s.id] || [];
    const countEl = document.getElementById(`${countPrefix}${s.id}`);
    if (countEl) countEl.textContent = leads.length;

    const container = document.getElementById(`${colPrefix}${s.id}`);
    if (!container) return;

    container.innerHTML = leads.map(l => {
      const initial = (l.name || '?').trim().charAt(0).toUpperCase();
      const imgTag = l.avatar
        ? `<img src="${l.avatar}" alt="${l.name}" referrerpolicy="no-referrer" onload="this.parentElement.classList.add('has-img')" onerror="this.remove();this.parentElement.classList.remove('has-img')">`
        : '';
      
      return `
      <div class="kanban-card mini" onclick="openLeadTimeline('${l.id}')" style="cursor:pointer; background: var(--bg-surface); padding: 8px; border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border);">
        <div class="kanban-card-header" style="display: flex; align-items: center; gap: 8px;">
          <span class="avatar avatar-xs" style="width: 24px; height: 24px; font-size: 10px;">${imgTag}<span class="avatar-fallback">${initial}</span></span>
          <div class="kanban-card-name" style="font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${l.name}</div>
        </div>
      </div>`;
    }).join('');
  });
}

function setTodayDateText(elementId) {
  const now = new Date();
  const options = { day: 'numeric', month: 'long', weekday: 'long' };
  const dateStr = now.toLocaleDateString('pt-BR', options);
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const el = document.getElementById(elementId);
  if (el) el.textContent = formattedDate;
}

let dashboardCarouselIndex = 0;
let dashboardCarouselFilterValue = '';

const DASHBOARD_CAROUSEL_STAGE_FLOW = {
  coletados: { next: 'perfil_engajado' },
  perfil_engajado: { next: 'dm1_enviada' },
  dm1_enviada: { next: 'nao_respondeu', alt: [{ id: 'respondeu', label: 'Respondeu' }] },
  nao_respondeu: { next: 'follow_up_1', alt: [{ id: 'respondeu', label: 'Respondeu' }] },
  follow_up_1: { next: 'chat_gerado' },
  respondeu: { next: 'chat_gerado' },
  chat_gerado: { next: 'dm2_enviada' },
  dm2_enviada: { next: 'proposta_enviada' },
  proposta_enviada: { next: 'follow_up_2' },
  follow_up_2: { next: 'fechado' }
};

const DASHBOARD_STAGE_CHECKLISTS = {
  coletados: [
    { id: 'perfil_ok', label: 'Confirmar nicho & cidade' },
    { id: 'dados_ok', label: 'Salvar @ e nome' },
    { id: 'engajar_ok', label: 'Seguir + 2 curtidas' }
  ],
  perfil_engajado: [
    { id: 'curtidas', label: '3 curtidas' },
    { id: 'comentario', label: '1 comentário' },
    { id: 'dm1_prep', label: 'DM1 pronta' }
  ],
  dm1_enviada: [
    { id: 'dm1_ok', label: 'DM1 enviada' },
    { id: 'aguardar', label: 'Aguardar 24h' },
    { id: 'sem_resp', label: 'Sem resposta' }
  ],
  nao_respondeu: [
    { id: 'fu1', label: 'Follow-up 1' },
    { id: 'registrar', label: 'Registrar' },
    { id: 'aguardar2', label: 'Aguardar' }
  ],
  respondeu: [
    { id: 'contexto', label: 'Entender need' },
    { id: 'oferta', label: 'Alinhar proposta' },
    { id: 'site_prep', label: 'Preparar site' }
  ],
  follow_up_1: [
    { id: 'site_gerar', label: 'Gerar site' },
    { id: 'link', label: 'Link do preview' },
    { id: 'dm2_prep', label: 'DM2 pronta' }
  ],
  chat_gerado: [
    { id: 'revisar', label: 'Revisar site' },
    { id: 'link2', label: 'Confirmar link' },
    { id: 'dm2', label: 'Enviar DM2' }
  ],
  dm2_enviada: [
    { id: 'acompanhar', label: 'Acompanhar' },
    { id: 'qualificar', label: 'Qualificar $' },
    { id: 'proposta_prep', label: 'Proposta pronta' }
  ],
  proposta_enviada: [
    { id: 'condicoes', label: 'Preço & prazo' },
    { id: 'follow', label: 'Follow-up' },
    { id: 'proximo', label: 'Próximo passo' }
  ],
  follow_up_2: [
    { id: 'final', label: 'Follow-up final' },
    { id: 'obje', label: 'Objeções' },
    { id: 'decisao', label: 'Decidir' }
  ],
  fechado: [
    { id: 'pagamento', label: 'Pagamento ok' },
    { id: 'brief', label: 'Brief coletado' },
    { id: 'kickoff', label: 'Kickoff marcado' }
  ]
};

function dashboardCarouselStageMeta(stageId) {
  const id = String(stageId || 'coletados');
  return (Array.isArray(DASH2_STAGES) ? DASH2_STAGES : []).find(s => s.id === id) || { id, label: id, color: '#94a3b8' };
}

function dashboardCarouselNormalizeHandle(handle) {
  const h = String(handle || '').trim();
  if (!h) return '';
  if (h.startsWith('http')) return h.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '');
  return h.startsWith('@') ? h : `@${h}`;
}

function dashboardCarouselGetLeads() {
  const rank = new Map((Array.isArray(DASH2_STAGES) ? DASH2_STAGES : []).map((s, i) => [s.id, i]));
  const stageOf = (l) => l.pipelineStageV2 || 'coletados';
  const isActive = (l) => !['arquivado', 'fechado'].includes(stageOf(l));
  const filterStage = dashboardCarouselFilterValue;
  const ts = (v) => {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    const p = Date.parse(v);
    return Number.isFinite(p) ? p : 0;
  };

  return state.leads
    .filter(l => filterStage ? stageOf(l) === filterStage : isActive(l))
    .slice()
    .sort((a, b) => {
      const ra = rank.get(stageOf(a)) ?? 999;
      const rb = rank.get(stageOf(b)) ?? 999;
      if (ra !== rb) return ra - rb;
      return ts(a.createdAt) - ts(b.createdAt);
    });
}

function dashboardCarouselChecklistProgress(lead, stageId) {
  const stage = String(stageId || 'coletados');
  const all = lead?.v2Checklist && typeof lead.v2Checklist === 'object' ? lead.v2Checklist : {};
  const cur = all && typeof all[stage] === 'object' ? all[stage] : {};
  return { all, stage, cur };
}

function dashboardCarouselAllDone(lead, stageId) {
  const checklist = DASHBOARD_STAGE_CHECKLISTS[String(stageId || 'coletados')] || [];
  if (!checklist.length) return true;
  const { cur } = dashboardCarouselChecklistProgress(lead, stageId);
  return checklist.every(it => !!cur[it.id]);
}

function dashboardCarouselRender() {
  const body = document.getElementById('leadCarouselBody');
  const counter = document.getElementById('leadCarouselCounter');
  const filterSelect = document.getElementById('leadCarouselFilter');
  if (!body || !counter) return;

  // Populate filter options
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

  const checklist = DASHBOARD_STAGE_CHECKLISTS[String(stageId)] || [];
  const { cur } = dashboardCarouselChecklistProgress(lead, stageId);
  const checklistHtml = checklist.map(it => {
    const checked = !!cur[it.id];
    return `
      <label class="lead-check-item">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="dashboardToggleChecklist('${lead.id}','${stageId}','${it.id}', this.checked)">
        <span>${escapeXml(it.label)}</span>
      </label>
    `;
  }).join('');

  const flow = DASHBOARD_CAROUSEL_STAGE_FLOW[String(stageId)] || {};
  const nextId = flow.next || '';
  const nextMeta = nextId ? dashboardCarouselStageMeta(nextId) : null;
  const canAdvance = nextId && dashboardCarouselAllDone(lead, stageId);

  const altButtons = Array.isArray(flow.alt) ? flow.alt.map(a => {
    const target = dashboardCarouselStageMeta(a.id);
    return `<button class="lead-action-btn" type="button" onclick="dashboardCarouselSetStage('${lead.id}','${target.id}')">${escapeXml(a.label || target.label)}</button>`;
  }).join('') : '';

  body.innerHTML = `
    <div class="lead-carousel-card">
      <div class="lead-carousel-card-head">
        <div class="lead-carousel-card-title">
          <div class="lead-carousel-lead-name">${escapeXml(lead.name || 'Lead')}</div>
          <div class="lead-carousel-lead-sub">${escapeXml(sub || '—')}</div>
        </div>
        <div class="lead-carousel-stage" title="${escapeXml(meta.label)}">
          <span class="lead-carousel-stage-dot" style="background:${escapeXml(meta.color)}"></span>
          <span>${escapeXml(meta.label)}</span>
        </div>
      </div>

      <div class="lead-carousel-actions">
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','open_insta')">Instagram</button>
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','open_whats')">WhatsApp</button>
        <button class="lead-action-btn" type="button" onclick="dashboardCarouselQuickAction('${lead.id}','generate_site')">Gerar Site</button>
        ${altButtons}
        ${nextId ? `<button class="lead-action-btn primary" type="button" ${canAdvance ? '' : 'disabled'} onclick="dashboardCarouselAdvance('${lead.id}')">Avançar: ${escapeXml(nextMeta?.label || nextId)}</button>` : ''}
      </div>

      <div class="lead-checklist">
        ${checklistHtml || `<div class="lead-carousel-empty">Sem checklist para esta etapa</div>`}
      </div>
    </div>
  `;
}

window.dashboardCarouselPrev = function () {
  dashboardCarouselIndex = (Number.isFinite(dashboardCarouselIndex) ? dashboardCarouselIndex : 0) - 1;
  dashboardCarouselRender();
};

window.dashboardCarouselNext = function () {
  dashboardCarouselIndex = (Number.isFinite(dashboardCarouselIndex) ? dashboardCarouselIndex : 0) + 1;
  dashboardCarouselRender();
};

window.dashboardToggleChecklist = function (leadId, stageId, itemId, checked) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;
  const { all, stage, cur } = dashboardCarouselChecklistProgress(lead, stageId);
  const nextCur = { ...cur, [String(itemId)]: !!checked };
  lead.v2Checklist = { ...all, [stage]: nextCur };
  save();
  renderDashboard();
};

window.dashboardCarouselSetStage = function (leadId, stageId) {
  if (typeof moveLeadToStageDash2 === 'function') moveLeadToStageDash2(leadId, stageId);
  renderDashboard();
};

window.switchLeadTab = function(tabId) {
  // Update buttons
  document.querySelectorAll('.lead-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.borderBottom = '2px solid transparent';
    btn.style.fontWeight = '500';
    btn.style.color = 'var(--text-muted)';
  });
  const activeBtn = document.getElementById(`btn-tab-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.borderBottom = '2px solid var(--primary)';
    activeBtn.style.fontWeight = '600';
    activeBtn.style.color = 'var(--text-primary)';
  }

  // Update content
  document.querySelectorAll('.lead-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) {
    activeContent.style.display = 'block';
  }

  // Render pipeline if needed
  if (tabId === 'pipeline') {
    const container = document.getElementById('kanbanMiniDashboard');
    if (container && container.children.length === 0) {
      // Generate HTML structure using PROSPECT_STAGES (Mirror Mensagens Tab)
      const stages = (typeof PROSPECT_STAGES !== 'undefined' && Array.isArray(PROSPECT_STAGES)) ? PROSPECT_STAGES : [];
      
      container.innerHTML = stages.map(stage => `
        <div class="kanban-col" style="min-width: 280px; background: rgba(255,255,255,0.02); border-radius: 12px; padding: 12px; margin-right: 12px;">
          <div class="kanban-col-header" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="kanban-dot" style="background:${stage.color}; width: 8px; height: 8px; border-radius: 50%; display: inline-block;"></span>
              <span style="font-weight: 600; font-size: 13px;">${stage.label}</span>
            </div>
            <span class="kanban-count" id="k3-${stage.id}" style="font-size: 11px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px;">0</span>
          </div>
          <div class="kanban-cards" id="kanbanv3-${stage.id}" style="min-height: 50px;"></div>
        </div>
      `).join('');
    }
    // Render Kanban
    if (typeof renderProspectMiniKanban === 'function') {
      renderProspectMiniKanban('k3-', 'kanbanv3-');
    }
  }
};

window.dashboardCarouselFilter = function () {
  const select = document.getElementById('leadCarouselFilter');
  dashboardCarouselFilterValue = select ? select.value : '';
  dashboardCarouselIndex = 0; // Reset to first lead when filter changes
  renderDashboard();
};

window.dashboardCarouselAdvance = function (leadId) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;
  const stageId = lead.pipelineStageV2 || 'coletados';
  const flow = DASHBOARD_CAROUSEL_STAGE_FLOW[String(stageId)] || {};
  const nextId = flow.next;
  if (!nextId) return;
  if (!dashboardCarouselAllDone(lead, stageId)) {
    toast('Complete o checklist para avançar', 'error');
    return;
  }
  if (typeof moveLeadToStageDash2 === 'function') moveLeadToStageDash2(leadId, nextId);
  renderDashboard();
};

window.dashboardCarouselQuickAction = function (leadId, action) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;

  if (action === 'open_insta') {
    let url = lead.instagram;
    if (!url) { toast('Lead sem Instagram'); return; }
    if (!String(url).startsWith('http')) url = `https://instagram.com/${String(url).replace('@', '')}`;
    window.open(url, '_blank');
    return;
  }

  if (action === 'open_whats') {
    let phone = lead.phone;
    if (!phone) {
      phone = prompt('Qual o número do WhatsApp? (Ex: 5511999999999)');
      if (phone) {
        lead.phone = phone;
        save();
      }
    }
    if (phone) window.open(`https://wa.me/${phone}`, '_blank');
    return;
  }

  if (action === 'generate_site') {
    document.getElementById('nav-generator')?.click();
    setTimeout(() => {
      const select = document.getElementById('genLeadSelect');
      if (select) {
        select.value = leadId;
        select.dispatchEvent(new Event('change'));
      }
    }, 500);
  }
};

// ---- DASHBOARD ----
function renderDashboard() {
  const now = new Date();
  const total = state.leads.length;
  const stageOf = (l) => l.pipelineStageV2 || 'coletados';
  const siteStages = new Set(['dm2_enviada', 'proposta_enviada', 'follow_up_2', 'fechado']);
  const sites = state.leads.filter(l => siteStages.has(stageOf(l))).length;
  const msgs = state.leads.filter(l => !['coletados', 'perfil_engajado'].includes(stageOf(l))).length;
  const closed = state.leads.filter(l => l.status === 'fechado').length;
  const confirmedLeads = state.leads.filter(l => stageOf(l) === 'fechado').length;
  const potentialStages = new Set(['respondeu', 'chat_gerado', 'dm2_enviada', 'proposta_enviada', 'follow_up_2']);
  const potentialRevenueLeads = state.leads.filter(l => potentialStages.has(stageOf(l))).length;
  const revenue = potentialRevenueLeads * (state.settings.servicePrice || 0);

  document.getElementById('metricTotal').textContent = total;
  document.getElementById('metricSites').textContent = sites;
  // document.getElementById('metricSitesGoal').textContent = state.settings.monthlySiteGoal || 30; // Reverted per user request

  setTodayDateText('currentDateDisplay');

  // ---- GOALS PANEL UPDATE ----
  const goalTarget = state.settings.monthlySiteGoal || 20;
  const goalMin = Math.round(goalTarget * 0.5);
  const goalChallenge = Math.round(goalTarget * 1.5);
  const servicePrice = state.settings.servicePrice || 350;

  const currentSites = confirmedLeads;
  const percentage = Math.min(100, Math.round((currentSites / goalTarget) * 100));

  // Calculate Pace
  const dayOfMonth = now.getDate();
  const pace = dayOfMonth > 0 ? (currentSites / dayOfMonth).toFixed(1) : '0.0';
  const paceVal = parseFloat(pace);

  let paceStatus = 'Neutro';
  let paceColor = 'var(--text-muted)';

  if (paceVal < 0.3) {
    paceStatus = 'Mês Fraco';
    paceColor = '#EF4444'; // var(--red)
  } else if (paceVal < 0.7) {
    paceStatus = 'Meta Provável';
    paceColor = '#F59E0B'; // var(--orange)
  } else {
    paceStatus = 'Mês Forte';
    paceColor = '#10B981'; // var(--green)
  }

  const safeSetText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  safeSetText('goalCurrent', currentSites);
  safeSetText('goalTarget', goalTarget);
  safeSetText('goalPercentage', `${percentage}%`);

  const progressBar = document.getElementById('goalProgressBar');
  if (progressBar) progressBar.style.width = `${percentage}%`;

  safeSetText('goalMinSites', `${goalMin} sites`);
  safeSetText('goalMinValue', `R$ ${(goalMin * servicePrice).toLocaleString('pt-BR')}`);

  safeSetText('goalTargetSites', `${goalTarget} sites`);
  safeSetText('goalTargetValue', `R$ ${(goalTarget * servicePrice).toLocaleString('pt-BR')}`);

  safeSetText('goalChallengeSites', `${goalChallenge} sites`);
  safeSetText('goalChallengeValue', `R$ ${(goalChallenge * servicePrice).toLocaleString('pt-BR')}`);

  safeSetText('goalServicePrice', `R$ ${servicePrice.toLocaleString('pt-BR')}`);

  safeSetText('goalPaceValue', pace);
  const paceStatusEl = document.getElementById('goalPaceStatus');
  if (paceStatusEl) {
    paceStatusEl.textContent = paceStatus;
    paceStatusEl.style.color = paceColor;
    paceStatusEl.style.borderColor = paceColor;
    paceStatusEl.style.backgroundColor = paceColor + '1A'; // 10% opacity
  }

  // Highlight current active goal level (next milestone)
  const minEl = document.getElementById('goalLevelMin');
  const targetEl = document.getElementById('goalLevelTarget');
  const challengeEl = document.getElementById('goalLevelChallenge');

  [minEl, targetEl, challengeEl].forEach(el => el?.classList.remove('active'));

  if (currentSites < goalMin) {
    minEl?.classList.add('active');
  } else if (currentSites < goalTarget) {
    targetEl?.classList.add('active');
  } else {
    challengeEl?.classList.add('active');
  }

  document.getElementById('metricMessages').textContent = msgs;
  document.getElementById('metricRevenue').textContent = `R$ ${revenue.toLocaleString('pt-BR')}`;
  const confEl = document.getElementById('metricRevenueConfirmed');
  if (confEl) {
    const confirmed = confirmedLeads * (state.settings.servicePrice || 0);
    confEl.textContent = `R$ ${confirmed.toLocaleString('pt-BR')}`;
  }
  const leadsBadge = document.getElementById('leadsBadge');
  if (leadsBadge) leadsBadge.textContent = total;

  if (typeof dash2ComputeStats === 'function') {
    const stats = dash2ComputeStats();
    safeSetText('d1-bucket-a', stats?.buckets?.a ?? 0);
    safeSetText('d1-bucket-b', stats?.buckets?.b ?? 0);
    safeSetText('d1-bucket-c', stats?.buckets?.c ?? 0);
    safeSetText('d1-bucket-d', stats?.buckets?.d ?? 0);
    safeSetText('d1-bucket-e', stats?.buckets?.e ?? 0);
    safeSetText('d1-bucket-f', stats?.buckets?.f ?? 0);
  }

  renderMiniKanbanV2();
  renderMiniKanbanV2('k2m-', 'kanbanv2m-');
  if (typeof renderProspectMiniKanban === 'function') renderProspectMiniKanban('k3-', 'kanbanv3-');
  dashboardCarouselRender();
}

function renderKPIs() {
  const wrap = document.getElementById('view-kpis');
  if (!wrap) return;

  setTodayDateText('kpiDate');

  const stageOf = (l) => l.pipelineStageV2 || 'coletados';
  const price = Number(state.settings?.servicePrice || 350);
  const goal = Number(state.settings?.monthlySiteGoal || 30);
  const dailyLeadGoal = Math.max(1, Number(state.settings?.dailyLeadGoal || 100));
  const workMinutesPerDay = 300;

  const toTs = (v) => {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    const p = Date.parse(v);
    if (Number.isFinite(p)) return p;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const startOfDay = (ts) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const todayStart = startOfDay(Date.now());
  const isToday = (ts) => ts >= todayStart && ts < (todayStart + 86400000);

  const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const pct = (a, b) => (b > 0 ? (a / b) : 0);
  const pctTxt = (v) => `${Math.round(safeNum(v) * 100)}%`;
  const fmt = (v) => safeNum(v).toLocaleString('pt-BR');
  const fmtMinutes = (mins) => {
    const m = safeNum(mins);
    if (m <= 0) return '—';
    if (m < 1) return `~${Math.max(1, Math.round(m * 60))}s`;
    if (m < 10) return `~${m.toFixed(1)}min`;
    return `~${Math.round(m)}min`;
  };

  const totalLeads = state.leads.length;
  const leadsToday = state.leads.filter(l => isToday(toTs(l.createdAt))).length;

  const v2StageOrder = ['coletados', 'perfil_engajado', 'dm1_enviada', 'nao_respondeu', 'respondeu', 'follow_up_1', 'chat_gerado', 'dm2_enviada', 'proposta_enviada', 'follow_up_2', 'fechado', 'arquivado'];
  const v2RankOf = (st) => v2StageOrder.indexOf(st);
  const v2AtOrAfter = (st, min) => v2RankOf(st) >= v2RankOf(min) && v2RankOf(min) !== -1;
  const v2HasEntry = (l, stageId) => Array.isArray(l?.v2StageEntries) && l.v2StageEntries.some(e => String(e?.stageId || '').toLowerCase() === stageId);
  const v2HasDm1Evidence = (l) => !!(l?.dm1SentAt || l?.dm2SentAt || l?.siteGeneratedAt || l?.propostaSentAt || l?.closedAt);

  const dm1Sent = state.leads.filter(l => {
    const st = stageOf(l);
    if (st === 'arquivado') return v2HasDm1Evidence(l) || v2HasEntry(l, 'dm1_enviada');
    return v2AtOrAfter(st, 'dm1_enviada') || !!l.dm1SentAt;
  }).length;
  const dm1SentToday = state.leads.filter(l => isToday(toTs(l.dm1SentAt))).length;

  const responseStageSet = new Set(['respondeu', 'follow_up_1', 'chat_gerado', 'dm2_enviada', 'proposta_enviada', 'follow_up_2', 'fechado']);
  const hasResponded = (l) => {
    const st = stageOf(l);
    if (responseStageSet.has(st)) return true;
    if (st !== 'arquivado') return false;
    return !!(l.siteGeneratedAt || l.dm2SentAt || l.propostaSentAt || l.closedAt);
  };
  const responses = state.leads.filter(hasResponded).length;
  const dm1FromNoReply = state.leads.filter(l => {
    const st = stageOf(l);
    if (st === 'arquivado') return v2HasDm1Evidence(l) || v2HasEntry(l, 'nao_respondeu') || hasResponded(l);
    return v2AtOrAfter(st, 'nao_respondeu');
  }).length;

  const sitesGenerated = state.leads.filter(l => {
    const st = stageOf(l);
    if (st === 'arquivado') return false;
    return v2AtOrAfter(st, 'dm2_enviada');
  }).length;
  const sitesGeneratedToday = state.leads.filter(l => isToday(toTs(l.siteGeneratedAt))).length;

  const proposalStageSet = new Set(['proposta_enviada', 'follow_up_2', 'fechado']);
  const proposals = state.leads.filter(l => proposalStageSet.has(stageOf(l))).length;
  const proposalsWeek = (() => {
    const now = new Date();
    const day = now.getDay();
    const mondayShift = (day + 6) % 7;
    const weekStart = startOfDay(Date.now() - mondayShift * 86400000);
    const weekEnd = weekStart + 7 * 86400000;
    return state.leads.filter(l => {
      const ts = toTs(l.propostaSentAt);
      return ts >= weekStart && ts < weekEnd;
    }).length;
  })();

  const closed = state.leads.filter(l => stageOf(l) === 'fechado').length;
  const closedWeek = (() => {
    const now = new Date();
    const day = now.getDay();
    const mondayShift = (day + 6) % 7;
    const weekStart = startOfDay(Date.now() - mondayShift * 86400000);
    const weekEnd = weekStart + 7 * 86400000;
    return state.leads.filter(l => {
      const ts = toTs(l.closedAt);
      return ts >= weekStart && ts < weekEnd;
    }).length;
  })();

  const archived = state.leads.filter(l => stageOf(l) === 'arquivado').length;
  const activeLeads = state.leads.filter(l => !['arquivado', 'fechado'].includes(stageOf(l))).length;

  const responseRate = pct(dm1FromNoReply, totalLeads);
  const siteRate = pct(sitesGenerated, responses);
  const proposalRate = pct(proposals, sitesGenerated);
  const closeRate = pct(closed, proposals);
  const goalProgress = pct(closed, goal);
  const conversionRate = pct(closed, totalLeads);

  const confirmedRevenue = closed * price;
  const pipelineValue = activeLeads * price;
  const timePerLeadMinutes = workMinutesPerDay / dailyLeadGoal;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  nextMonthStart.setHours(0, 0, 0, 0);
  const dayOfMonth = Math.max(1, now.getDate());
  const closedThisMonth = state.leads.filter(l => {
    const ts = toTs(l.closedAt);
    return stageOf(l) === 'fechado' && ts >= monthStart.getTime() && ts < nextMonthStart.getTime();
  }).length;
  const projectedRevenuePerDay = (closedThisMonth / dayOfMonth) * price;
  const targetRevenuePerDay = (goal / Math.max(1, Math.round((nextMonthStart.getTime() - monthStart.getTime()) / 86400000))) * price;
  const followOnlyStages = new Set(['follow_up_1', 'follow_up_2']);
  const followOnlyCount = state.leads.filter(l => stageOf(l) !== 'arquivado' && followOnlyStages.has(stageOf(l))).length;
  const followOnlyValue = followOnlyCount * price;
  const followOnlyShare = pct(followOnlyValue, pipelineValue);

  const followUpPendingStages = new Set(['nao_respondeu', 'follow_up_1', 'dm2_enviada', 'proposta_enviada', 'follow_up_2']);
  const followUpPendingCount = state.leads.filter(l => stageOf(l) !== 'arquivado' && followUpPendingStages.has(stageOf(l))).length;
  const avgFunnelDaysForCard = (() => {
    const diffs = state.leads
      .filter(l => stageOf(l) === 'fechado' && l.closedAt && l.createdAt)
      .map(l => (toTs(l.closedAt) - toTs(l.createdAt)) / 86400000)
      .filter(d => Number.isFinite(d) && d >= 0);
    if (!diffs.length) return 0;
    return diffs.reduce((a, b) => a + b, 0) / diffs.length;
  })();

  const fmtDays = (days) => {
    const d = safeNum(days);
    if (d <= 0) return '—';
    if (d < 1) return `~${Math.max(1, Math.round(d * 24))}h`;
    if (d < 10) return `~${d.toFixed(1).replace('.', ',')} dias`;
    return `~${Math.round(d)} dias`;
  };

  const timeBadge = avgFunnelDaysForCard > 0
    ? (avgFunnelDaysForCard <= 7 ? { cls: 'good', txt: 'OK' } : avgFunnelDaysForCard <= 14 ? { cls: 'warn', txt: 'Atenção' } : { cls: 'bad', txt: 'Crítico' })
    : { cls: 'warn', txt: '—' };

  const badgeOf = (v, goodMin, warnMin) => {
    if (v >= goodMin) return { cls: 'good', txt: 'OK' };
    if (v >= warnMin) return { cls: 'warn', txt: 'Atenção' };
    return { cls: 'bad', txt: 'Crítico' };
  };
  const badgeOfCount = (n, goodMax, warnMax) => {
    const v = safeNum(n);
    if (v <= goodMax) return { cls: 'good', txt: 'OK' };
    if (v <= warnMax) return { cls: 'warn', txt: 'Atenção' };
    return { cls: 'bad', txt: 'Crítico' };
  };

  const cards = [
    { label: 'Receita confirmada', value: formatBRL(confirmedRevenue), sub: `${fmt(closed)} fechados`, badge: closed > 0 ? { cls: 'good', txt: 'Real' } : { cls: 'warn', txt: '—' }, accent: 'green' },
    { label: 'Pipeline value', value: formatBRL(pipelineValue), sub: `${fmt(activeLeads)} leads ativos`, badge: { cls: 'good', txt: 'Potencial' }, accent: 'cyan' },
    { label: 'Dinheiro em follow-up', value: formatBRL(followOnlyValue), sub: `${fmt(followOnlyCount)} leads • ${pctTxt(followOnlyShare)} do funil`, badge: badgeOf(followOnlyShare, 0.3, 0.15), accent: 'green' },
    { label: 'Progresso da meta', value: pctTxt(goalProgress), sub: `${fmt(closed)} / ${fmt(goal)}`, badge: badgeOf(goalProgress, 0.7, 0.35), accent: 'violet' },

    { label: 'Leads coletados', value: fmt(totalLeads), sub: 'Volume do funil', badge: { cls: 'good', txt: 'Base' }, accent: 'cyan' },
    { label: 'Leads coletados hoje', value: fmt(leadsToday), sub: 'Velocidade', badge: leadsToday >= 10 ? { cls: 'good', txt: 'Meta' } : leadsToday >= 5 ? { cls: 'warn', txt: 'Baixo' } : { cls: 'bad', txt: 'Crítico' }, accent: 'violet' },
    { label: 'DM1 enviadas', value: fmt(dm1Sent), sub: `${fmt(dm1Sent)} / ${fmt(totalLeads)}`, badge: dm1Sent > 0 ? { cls: 'good', txt: 'Ativo' } : { cls: 'warn', txt: 'Zerado' }, accent: 'cyan' },
    { label: 'Taxa de resposta DM1', value: pctTxt(responseRate), sub: `${fmt(dm1FromNoReply)} / ${fmt(totalLeads)}`, badge: badgeOf(responseRate, 0.5, 0.35), accent: 'violet' },

    { label: 'Sites gerados', value: fmt(sitesGenerated), sub: 'Velocidade operacional', badge: sitesGeneratedToday >= 2 ? { cls: 'good', txt: 'Ritmo' } : sitesGeneratedToday >= 1 ? { cls: 'warn', txt: 'Lento' } : { cls: 'bad', txt: 'Parado' }, accent: 'pink' },
    { label: 'Propostas enviadas', value: fmt(proposals), sub: 'Avanço do funil', badge: proposals > 0 ? { cls: 'good', txt: 'Ativo' } : { cls: 'warn', txt: 'Zerado' }, accent: 'amber' },
    { label: 'Taxa de proposta', value: pctTxt(proposalRate), sub: `${fmt(proposals)} / ${fmt(sitesGenerated)}`, badge: badgeOf(proposalRate, 0.5, 0.3), accent: 'amber' },
    { label: 'Pendentes de follow-up', value: fmt(followUpPendingCount), sub: `${fmt(followUpPendingCount)} / ${fmt(totalLeads)}`, badge: badgeOfCount(followUpPendingCount, 0, 3), accent: 'pink' },

    { label: 'Fechamentos', value: fmt(closed), sub: 'Resultado real', badge: closed > 0 ? { cls: 'good', txt: 'Venda' } : { cls: 'warn', txt: 'Zerado' }, accent: 'green' },
    { label: 'Taxa de fechamento', value: pctTxt(closeRate), sub: `${fmt(closed)} / ${fmt(proposals)}`, badge: badgeOf(closeRate, 0.25, 0.12), accent: 'green' },
    { label: 'Taxa de conversão', value: pctTxt(conversionRate), sub: `${fmt(closed)} / ${fmt(totalLeads)}`, badge: badgeOf(conversionRate, 0.12, 0.06), accent: 'cyan' },
    { label: 'Tempo por lead', value: fmtDays(avgFunnelDaysForCard), sub: 'Tempo médio até fechar', badge: timeBadge, accent: 'violet' }
  ];

  const cardHtml = (c) => `
    <div class="kpi-card" data-accent="${c.accent}">
      <div class="kpi-card-top">
        <div class="kpi-card-label">${c.label}</div>
        <div class="kpi-badge ${c.badge.cls}">${c.badge.txt}</div>
      </div>
      <div class="kpi-card-value">${c.value}</div>
      <div class="kpi-card-foot">
        <div class="kpi-card-sub">${c.sub}</div>
      </div>
    </div>
  `;

  const cardsPrimaryEl = document.getElementById('kpiCardsPrimary');
  if (cardsPrimaryEl) {
    cardsPrimaryEl.innerHTML = cards.map(cardHtml).join('');
  }

  const summaryPill = document.getElementById('kpiSummaryPill');
  if (summaryPill) {
    const confirmedTxt = formatBRL(confirmedRevenue);
    const pipelineTxt = formatBRL(pipelineValue);
    summaryPill.innerHTML = `
      <span class="kpi-pill-item is-confirmed">
        <span class="kpi-pill-dot"></span>
        <span class="kpi-pill-label">Confirmada</span>
        <span class="kpi-pill-value">${confirmedTxt}</span>
      </span>
      <span class="kpi-pill-sep"></span>
      <span class="kpi-pill-item is-pipeline">
        <span class="kpi-pill-dot"></span>
        <span class="kpi-pill-label">No funil</span>
        <span class="kpi-pill-value">${pipelineTxt}</span>
      </span>
    `;
  }

  const funnelRows = [
    { key: 'leads', label: 'Leads coletados', count: totalLeads, rev: '-' },
    { key: 'dm1', label: 'DM1 enviada', count: dm1Sent, rev: '-' },
    { key: 'follow', label: 'Follow-up', count: dm1FromNoReply, rev: '-' },
    { key: 'sites', label: 'Sites gerados', count: sitesGenerated, rev: '-' },
    { key: 'prop', label: 'Propostas enviadas', count: proposals, rev: formatBRL(proposals * price) },
    { key: 'close', label: 'Fechados', count: closed, rev: formatBRL(closed * price) },
    { key: 'arch', label: 'Sem interesse', count: archived, rev: '-' }
  ];

  const convFromPrev = (idx) => {
    if (idx <= 0) return '-';
    const prev = funnelRows[idx - 1].count;
    const cur = funnelRows[idx].count;
    if (prev <= 0) return '0%';
    return `${Math.round((cur / prev) * 100)}%`;
  };

  const funnelVisualEl = document.getElementById('kpiFunnelVisual');
  if (funnelVisualEl) {
    const steps = [
      { label: 'Leads', count: totalLeads },
      { label: 'DM1 enviadas', count: dm1Sent },
      { label: 'Follow-up', count: dm1FromNoReply },
      { label: 'Sites gerados', count: sitesGenerated },
      { label: 'Propostas', count: proposals },
      { label: 'Vendas', count: closed }
    ];
    const base = Math.max(steps[0].count, 1);
    const hasBase = steps[0].count > 0;
    funnelVisualEl.innerHTML = `
      <div class="kpi-funnel-steps">
        ${steps.map((s, i) => {
          const pct = hasBase ? Math.round((s.count / base) * 100) : 0;
          const conv = hasBase
            ? `<div class="kpi-funnel-conv">${i === 0 ? '100%' : `${pct}%`}</div>`
            : `<div class="kpi-funnel-conv is-empty">—</div>`;
          const w = Math.max(2, Math.round((s.count / base) * 100));
          const stepHtml = `
            <div class="kpi-funnel-step">
              <div class="kpi-funnel-left">
                <div class="kpi-funnel-count">${fmt(s.count)}</div>
                <div class="kpi-funnel-label">${s.label}</div>
              </div>
              <div class="kpi-funnel-bar"><div class="kpi-funnel-fill" style="width:${w}%"></div></div>
              ${conv}
            </div>
          `;
          return stepHtml;
        }).join('')}
      </div>
    `;
  }

  const funnelMiniTable = document.getElementById('kpiFunnelMiniTable');
  if (funnelMiniTable) {
    const base = Math.max(totalLeads, 1);
    const hasBase = totalLeads > 0;
    const rows = [
      { e: 'Leads', c: totalLeads, conv: hasBase ? '100%' : '—' },
      { e: 'DM1', c: dm1Sent, conv: hasBase ? `${Math.round((dm1Sent / base) * 100)}%` : '—' },
      { e: 'Follow-up', c: dm1FromNoReply, conv: hasBase ? `${Math.round((dm1FromNoReply / base) * 100)}%` : '—' },
      { e: 'Sites', c: sitesGenerated, conv: hasBase ? `${Math.round((sitesGenerated / base) * 100)}%` : '—' },
      { e: 'Propostas', c: proposals, conv: hasBase ? `${Math.round((proposals / base) * 100)}%` : '—' },
      { e: 'Vendas', c: closed, conv: hasBase ? `${Math.round((closed / base) * 100)}%` : '—' }
    ];
    funnelMiniTable.innerHTML = `
      <thead><tr><th>Etapa</th><th>Leads</th><th>Conversão</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r.e}</td><td class="kpi-num">${fmt(r.c)}</td><td class="kpi-muted">${r.conv}</td></tr>`).join('')}
      </tbody>
    `;
  }

  const funnelTable = document.getElementById('kpiFunnelTable');
  if (funnelTable) {
    const hasBase = totalLeads > 0;
    funnelTable.innerHTML = `
      <thead>
        <tr>
          <th>Etapa</th>
          <th>Quantidade</th>
          <th>Conversão</th>
          <th>Receita</th>
        </tr>
      </thead>
      <tbody>
        ${funnelRows.map((r, i) => `
          <tr>
            <td>${r.label}</td>
            <td class="kpi-num">${fmt(r.count)}</td>
            <td class="kpi-muted">${hasBase ? (i === 0 ? '100%' : `${Math.round((r.count / totalLeads) * 100)}%`) : '—'}</td>
            <td class="kpi-muted">${r.rev}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  const maxFunnel = Math.max(...funnelRows.map(r => r.count), 1);
  const funnelBars = document.getElementById('kpiFunnelBars');
  if (funnelBars) {
    funnelBars.innerHTML = funnelRows
      .map(r => {
        const w = Math.max(2, Math.round((r.count / maxFunnel) * 100));
        return `
          <div class="kpi-funnel-row ${r.key === 'arch' ? 'is-arch' : ''}">
            <div class="kpi-funnel-label">${r.label}</div>
            <div class="kpi-funnel-bar"><div class="kpi-funnel-fill" style="width:${w}%"></div></div>
            <div class="kpi-funnel-val">${fmt(r.count)}</div>
          </div>
        `;
      }).join('');
  }

  const avgFunnelDays = (() => {
    const diffs = state.leads
      .filter(l => stageOf(l) === 'fechado' && l.closedAt && l.createdAt)
      .map(l => (toTs(l.closedAt) - toTs(l.createdAt)) / 86400000)
      .filter(d => Number.isFinite(d) && d >= 0);
    if (!diffs.length) return 0;
    return diffs.reduce((a, b) => a + b, 0) / diffs.length;
  })();

  const followUpLeads = state.leads.filter(l => ['follow_up_1', 'follow_up_2'].includes(stageOf(l))).length;
  const followUpAdvances = (() => {
    const adv = new Set();
    state.leads.forEach(l => {
      const hist = Array.isArray(l.history) ? l.history : [];
      hist.forEach(h => {
        const act = (h && h.action) ? String(h.action) : '';
        const m = act.match(/V2:\s+Moved:\s+(follow_up_1|follow_up_2)\s+->\s+([a-z0-9_]+)/i);
        if (!m) return;
        const to = String(m[2] || '').toLowerCase();
        if (to && !['follow_up_1', 'follow_up_2'].includes(to)) adv.add(l.id);
      });
    });
    return adv.size;
  })();

  const efficiencyTable = document.getElementById('kpiEfficiencyTable');
  if (efficiencyTable) {
    const rows = [
      { m: 'Receita por lead', v: formatBRL(totalLeads > 0 ? (confirmedRevenue / totalLeads) : 0), u: 'Valor médio real' },
      { m: 'Leads por venda', v: closed > 0 ? (totalLeads / closed).toFixed(1) : '—', u: 'Eficiência do funil' },
      { m: 'Sites por venda', v: closed > 0 ? (sitesGenerated / closed).toFixed(1) : '—', u: 'Qualidade operacional' },
      { m: 'Propostas por venda', v: closed > 0 ? (proposals / closed).toFixed(1) : '—', u: 'Força da oferta' },
      { m: 'Tempo médio do funil', v: avgFunnelDays > 0 ? `${avgFunnelDays.toFixed(1)} dias` : '—', u: 'Velocidade até fechar' },
      { m: 'Follow-up efetivo', v: followUpLeads > 0 ? pctTxt(followUpAdvances / followUpLeads) : '—', u: 'Avanços em follow-up' }
    ];
    efficiencyTable.innerHTML = `
      <thead><tr><th>Métrica</th><th>Valor</th><th>Uso</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r.m}</td><td class="kpi-num">${r.v}</td><td class="kpi-muted">${r.u}</td></tr>`).join('')}
      </tbody>
    `;
  }

  const speedTable = document.getElementById('kpiSpeedTable');
  const speedViz = document.getElementById('kpiSpeedViz');
  if (speedTable) {
    const speedRows = [
      { m: 'Leads coletados por dia', v: leadsToday, t: 10 },
      { m: 'DM1 enviadas por dia', v: dm1SentToday, t: 10 },
      { m: 'Sites gerados por dia', v: sitesGeneratedToday, t: 2 },
      { m: 'Propostas por semana', v: proposalsWeek, t: 5 },
      { m: 'Vendas por semana', v: closedWeek, t: 2 }
    ].map(r => ({ ...r, p: Math.min(1, pct(r.v, r.t)) }));

    speedTable.innerHTML = `
      <thead><tr><th>Métrica</th><th>Atual</th><th>Meta</th><th>Ritmo</th></tr></thead>
      <tbody>
        ${speedRows.map(r => `
          <tr>
            <td>${r.m}</td>
            <td class="kpi-num">${fmt(r.v)}</td>
            <td class="kpi-muted">${fmt(r.t)}</td>
            <td>
              <div class="kpi-speedbar"><div class="kpi-speedfill" style="width:${Math.round(r.p * 100)}%"></div></div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    if (speedViz) {
      const score = speedRows.length ? (speedRows.reduce((a, r) => a + r.p, 0) / speedRows.length) : 0;
      const scorePct = Math.round(score * 100);
      const kpis = [
        { l: 'Hoje: Leads', v: fmt(leadsToday), h: `Meta ${fmt(10)}` },
        { l: 'Hoje: DM1', v: fmt(dm1SentToday), h: `Meta ${fmt(10)}` },
        { l: 'Hoje: Sites', v: fmt(sitesGeneratedToday), h: `Meta ${fmt(2)}` },
        { l: 'Semana: Propostas', v: fmt(proposalsWeek), h: `Meta ${fmt(5)}` }
      ];
      speedViz.innerHTML = `
        <div class="kpi-viz-top">
          <div>
            <div class="kpi-viz-title">Ritmo geral</div>
            <div class="kpi-viz-sub">Média das metas do bloco</div>
          </div>
          <div class="kpi-viz-big">${scorePct}%</div>
        </div>
        <div class="kpi-viz-bar"><div class="kpi-viz-fill" style="width:${Math.max(2, scorePct)}%"></div></div>
        <div class="kpi-viz-kpis">
          ${kpis.map(k => `
            <div class="kpi-viz-kpi">
              <div class="kpi-viz-kpi-label">${k.l}</div>
              <div class="kpi-viz-kpi-val">${k.v}</div>
              <div class="kpi-viz-kpi-hint">${k.h}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  const financeTable = document.getElementById('kpiFinanceTable');
  {
    const rows = [
      { e: 'Leads ativos', l: activeLeads, value: activeLeads * price, v: formatBRL(activeLeads * price), cls: 'fin-active' },
      { e: 'Propostas enviadas', l: proposals, value: proposals * price, v: formatBRL(proposals * price), cls: 'fin-prop' },
      { e: 'Fechados', l: closed, value: closed * price, v: formatBRL(closed * price), cls: 'fin-closed' }
    ];
    if (financeTable) {
    financeTable.innerHTML = `
      <thead><tr><th>Etapa</th><th>Leads</th><th>Valor potencial</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r.e}</td><td class="kpi-num">${fmt(r.l)}</td><td class="kpi-muted">${r.v}</td></tr>`).join('')}
      </tbody>
    `;
    }

    const financeViz = document.getElementById('kpiFinanceViz');
    if (financeViz) {
      const total = Math.max(1, rows.reduce((a, r) => a + (Number.isFinite(r.value) ? r.value : 0), 0));
      const segs = rows.map(r => {
        const p = Math.max(0, Math.min(1, (Number.isFinite(r.value) ? r.value : 0) / total));
        const w = Math.max(2, Math.round(p * 100));
        return `<div class="kpi-finance-seg ${r.cls}" style="width:${w}%"></div>`;
      }).join('');
      financeViz.innerHTML = `
        <div class="kpi-finance-stack">${segs}</div>
        <div class="kpi-finance-legend">
          ${rows.map(r => `
            <div class="kpi-finance-item">
              <div class="kpi-finance-dot ${r.cls}"></div>
              <div class="kpi-finance-name">${r.e} • ${fmt(r.l)}</div>
              <div class="kpi-finance-val">${r.v}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  const alertsEl = document.getElementById('kpiAlerts');
  if (alertsEl) {
    const pendingSites = state.leads.filter(l => ['respondeu', 'follow_up_1'].includes(stageOf(l))).length;
    const alerts = [];

    if (leadsToday < 5) alerts.push({ type: 'bad', t: 'Alerta de prospecção', m: 'Baixo volume de leads hoje.' });
    if (responseRate < 0.5 && dm1Sent > 0) alerts.push({ type: responseRate < 0.35 ? 'bad' : 'warn', t: 'Alerta de mensagem', m: 'Mensagem inicial precisa de otimização.' });
    if (pendingSites > 3) alerts.push({ type: 'warn', t: 'Alerta operacional', m: 'Sites pendentes para gerar.' });
    if (proposals > 5 && closed === 0) alerts.push({ type: 'bad', t: 'Alerta de vendas', m: 'Oferta ou follow-up precisam revisão.' });

    if (!alerts.length) alerts.push({ type: 'good', t: 'Status do funil', m: 'Tudo dentro do esperado hoje.' });

    alertsEl.innerHTML = alerts.map(a => `<div class="kpi-alert ${a.type}"><strong>${a.t}</strong><span>${a.m}</span></div>`).join('');
  }

  const weeklyRevenueEl = document.getElementById('kpiWeeklyRevenue');
  if (weeklyRevenueEl) {
    const now = Date.now();
    const d = new Date(now);
    const day = d.getDay();
    const mondayShift = (day + 6) % 7;
    const thisWeekStart = startOfDay(now - mondayShift * 86400000);
    const weeks = Array.from({ length: 8 }).map((_, i) => {
      const start = thisWeekStart - (7 * 86400000 * (7 - i));
      return { start, end: start + 7 * 86400000 };
    });

    const totals = weeks.map(w => {
      const sales = state.leads.filter(l => {
        const ts = toTs(l.closedAt);
        return ts >= w.start && ts < w.end;
      }).length;
      return sales * price;
    });

    const max = Math.max(...totals, 1);
    weeklyRevenueEl.innerHTML = totals.map((v, i) => {
      const h = Math.max(3, Math.round((v / max) * 100));
      const label = new Date(weeks[i].start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `<div>
        <div class="kpi-mini-bar"><div style="height:${h}%"></div></div>
        <div class="kpi-mini-bar-label">${label}</div>
      </div>`;
    }).join('');
  }

  const conversionBarsEl = document.getElementById('kpiConversionBars');
  if (conversionBarsEl) {
    const bars = [
      { label: 'Resp', v: responseRate },
      { label: 'Site', v: siteRate },
      { label: 'Prop', v: proposalRate },
      { label: 'Close', v: closeRate },
      { label: 'Meta', v: goalProgress },
      { label: '', v: 0 },
      { label: '', v: 0 },
      { label: '', v: 0 }
    ];

    conversionBarsEl.innerHTML = bars.map(b => {
      const h = Math.max(3, Math.round(Math.min(1, safeNum(b.v)) * 100));
      return `<div>
        <div class="kpi-mini-bar"><div style="height:${h}%"></div></div>
        <div class="kpi-mini-bar-label">${b.label}</div>
      </div>`;
    }).join('');
  }

  const median = (arr) => {
    if (!arr.length) return 0;
    const a = [...arr].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  };

  const respondedAtOf = (lead) => {
    const hist = Array.isArray(lead?.history) ? lead.history : [];
    let best = 0;
    hist.forEach(h => {
      const act = (h && h.action) ? String(h.action) : '';
      if (!/V2:\s+Moved:\s+[a-z0-9_]+\s+->\s+respondeu/i.test(act)) return;
      const ts = toTs(h.date);
      if (!ts) return;
      best = best ? Math.min(best, ts) : ts;
    });
    return best;
  };

  const stagesMeta = (typeof DASH2_STAGES !== 'undefined' && Array.isArray(DASH2_STAGES)) ? DASH2_STAGES : [];
  const stageCounts = new Map();
  const stageAges = new Map();
  const nowTs = Date.now();

  state.leads.forEach(l => {
    const st = stageOf(l);
    stageCounts.set(st, (stageCounts.get(st) || 0) + 1);
    const base = toTs(l.v2LastMovedAt) || toTs(l.createdAt) || nowTs;
    const days = Math.max(0, (nowTs - base) / 86400000);
    if (!stageAges.has(st)) stageAges.set(st, []);
    stageAges.get(st).push(days);
  });

  const stagesTable = document.getElementById('kpiStagesTable');
  if (stagesTable) {
    const rows = stagesMeta.map(s => {
      const c = stageCounts.get(s.id) || 0;
      const share = totalLeads > 0 ? `${Math.round((c / totalLeads) * 100)}%` : '0%';
      const age = median(stageAges.get(s.id) || []);
      const ageTxt = c > 0 ? `${age.toFixed(1)}d` : '—';
      return { label: s.label, count: c, share, ageTxt };
    });

    stagesTable.innerHTML = `
      <thead><tr><th>Etapa</th><th>Leads</th><th>%</th><th>Mediana</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.label}</td>
            <td class="kpi-num">${fmt(r.count)}</td>
            <td class="kpi-muted">${r.share}</td>
            <td class="kpi-muted">${r.ageTxt}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  const ageBaseForNoReply = (lead) => toTs(lead.dm1SentAt) || toTs(lead.dm2SentAt) || toTs(lead.v2LastMovedAt) || toTs(lead.createdAt) || nowTs;
  const overdueNoReply = state.leads.filter(l => stageOf(l) === 'nao_respondeu' && (nowTs - ageBaseForNoReply(l)) >= 48 * 60 * 60 * 1000).length;
  const stale72h = state.leads.filter(l => {
    const st = stageOf(l);
    if (['arquivado', 'fechado'].includes(st)) return false;
    const base = toTs(l.v2LastMovedAt) || toTs(l.createdAt) || nowTs;
    return (nowTs - base) >= 72 * 60 * 60 * 1000;
  }).length;

  const opsTable = document.getElementById('kpiOpsTable');
  if (opsTable) {
    const rows = [
      { a: 'Engajar perfil', c: stageCounts.get('coletados') || 0, n: 'Abrir e qualificar' },
      { a: 'Enviar DM1', c: stageCounts.get('perfil_engajado') || 0, n: 'Iniciar conversa' },
      { a: 'Aguardar resposta', c: stageCounts.get('dm1_enviada') || 0, n: 'Monitorar' },
      { a: 'Follow-up (48h+)', c: overdueNoReply, n: 'Reativação' },
      { a: 'Gerar site', c: (stageCounts.get('respondeu') || 0) + (stageCounts.get('follow_up_1') || 0), n: 'Produção' },
      { a: 'Enviar DM2', c: stageCounts.get('chat_gerado') || 0, n: 'Link + CTA' },
      { a: 'Enviar proposta', c: stageCounts.get('dm2_enviada') || 0, n: 'Oferta' },
      { a: 'Follow-up 2', c: stageCounts.get('proposta_enviada') || 0, n: 'Acompanhar' },
      { a: 'Fechar', c: stageCounts.get('follow_up_2') || 0, n: 'Último empurrão' },
      { a: 'Parados (72h+)', c: stale72h, n: 'Prioridade' }
    ];

    opsTable.innerHTML = `
      <thead><tr><th>Ação</th><th>Leads</th><th>Nota</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.a}</td>
            <td class="kpi-num">${fmt(r.c)}</td>
            <td class="kpi-muted">${r.n}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  const normKey = (v) => (v || '').toString().trim();
  const topN = (items, n) => items.sort((a, b) => b.c - a.c).slice(0, n);
  const groupCount = (keyFn) => {
    const m = new Map();
    state.leads.forEach(l => {
      const k = normKey(keyFn(l));
      if (!k) return;
      m.set(k, (m.get(k) || 0) + 1);
    });
    return [...m.entries()].map(([k, c]) => ({ k, c }));
  };

  const topCitiesTable = document.getElementById('kpiTopCitiesTable');
  if (topCitiesTable) {
    const rows = topN(groupCount(l => l.city), 7);
    const denom = totalLeads || 1;
    topCitiesTable.innerHTML = `
      <thead><tr><th>Cidade</th><th>Leads</th><th>%</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td><button type="button" class="kpi-cell-btn" data-kpi-city="${encodeURIComponent(r.k)}">${r.k}</button></td>
            <td class="kpi-num">${fmt(r.c)}</td>
            <td class="kpi-muted">${Math.round((r.c / denom) * 100)}%</td>
          </tr>
        `).join('') || `<tr><td class="kpi-muted">—</td><td class="kpi-muted">—</td><td class="kpi-muted">—</td></tr>`}
      </tbody>
    `;
    if (!topCitiesTable.dataset.boundCityClick) {
      topCitiesTable.dataset.boundCityClick = '1';
      topCitiesTable.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('[data-kpi-city]') : null;
        if (!btn) return;
        const city = decodeURIComponent(btn.dataset.kpiCity || '');
        const input = document.getElementById('leadsSearch');
        if (input) input.value = city;
        navigate('leads');
        if (input) input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }

  const topSpecialtiesTable = document.getElementById('kpiTopSpecialtiesTable');
  if (topSpecialtiesTable) {
    const rows = topN(groupCount(l => l.specialty), 7);
    const denom = totalLeads || 1;
    topSpecialtiesTable.innerHTML = `
      <thead><tr><th>Especialidade</th><th>Leads</th><th>%</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.k}</td>
            <td class="kpi-num">${fmt(r.c)}</td>
            <td class="kpi-muted">${Math.round((r.c / denom) * 100)}%</td>
          </tr>
        `).join('') || `<tr><td class="kpi-muted">—</td><td class="kpi-muted">—</td><td class="kpi-muted">—</td></tr>`}
      </tbody>
    `;
  }

  const dataQualityTable = document.getElementById('kpiDataQualityTable');
  if (dataQualityTable) {
    const isMissing = (v) => !(v && String(v).trim().length);
    const missingInstagram = state.leads.filter(l => isMissing(l.instagram)).length;
    const missingCity = state.leads.filter(l => isMissing(l.city)).length;
    const missingSpecialty = state.leads.filter(l => isMissing(l.specialty)).length;
    const missingWhatsapp = state.leads.filter(l => isMissing(l.whatsapp)).length;
    const missingName = state.leads.filter(l => isMissing(l.name) || String(l.name).trim() === 'Lead Sem Nome').length;
    const noHistory = state.leads.filter(l => !Array.isArray(l.history) || l.history.length === 0).length;

    const rows = [
      { f: 'Sem Instagram', c: missingInstagram, i: 'Dificulta DM e links' },
      { f: 'Sem Cidade', c: missingCity, i: 'Afeta personalização' },
      { f: 'Sem Especialidade', c: missingSpecialty, i: 'Afeta copy do site' },
      { f: 'Sem WhatsApp', c: missingWhatsapp, i: 'Afeta fechamento rápido' },
      { f: 'Sem Nome', c: missingName, i: 'Reduz conversão' },
      { f: 'Sem Histórico', c: noHistory, i: 'Perde rastreio do fluxo' }
    ];

    dataQualityTable.innerHTML = `
      <thead><tr><th>Campo</th><th>Leads</th><th>Impacto</th></tr></thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.f}</td>
            <td class="kpi-num">${fmt(r.c)}</td>
            <td class="kpi-muted">${r.i}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  const monthPaceTable = document.getElementById('kpiMonthPaceTable');
  const monthViz = document.getElementById('kpiMonthViz');
  if (monthPaceTable || monthViz) {
    const now = new Date(nowTs);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    nextMonthStart.setHours(0, 0, 0, 0);

    const monthStartTs = monthStart.getTime();
    const nextMonthStartTs = nextMonthStart.getTime();
    const daysInMonth = Math.max(1, Math.round((nextMonthStartTs - monthStartTs) / 86400000));
    const dayOfMonth = Math.max(1, now.getDate());
    const todayStartTs = startOfDay(nowTs);
    const daysRemaining = Math.max(0, Math.ceil((nextMonthStartTs - todayStartTs) / 86400000));

    const closedThisMonth = state.leads.filter(l => {
      const ts = toTs(l.closedAt);
      return ts >= monthStartTs && ts < nextMonthStartTs;
    }).length;

    const remainingToGoal = Math.max(0, goal - closedThisMonth);
    const pacePerDay = dayOfMonth > 0 ? (closedThisMonth / dayOfMonth) : 0;
    const projected = Math.round(pacePerDay * daysInMonth);

    const needPerDay = daysRemaining > 0 ? (remainingToGoal / daysRemaining) : remainingToGoal;
    const needPerWeek = needPerDay * 7;
    const progressMonth = Math.max(0, Math.min(1, pct(closedThisMonth, goal)));

    const rows = [
      { m: 'Fechados no mês', v: fmt(closedThisMonth), u: `R$ ${(closedThisMonth * price).toLocaleString('pt-BR')}` },
      { m: 'Meta do mês', v: fmt(goal), u: `R$ ${(goal * price).toLocaleString('pt-BR')}` },
      { m: 'Faltam', v: fmt(remainingToGoal), u: remainingToGoal > 0 ? 'Para bater a meta' : 'Meta batida' },
      { m: 'Dias restantes', v: fmt(daysRemaining), u: 'Inclui hoje' },
      { m: 'Necessário por dia', v: remainingToGoal > 0 ? needPerDay.toFixed(2) : '0.00', u: 'Ritmo mínimo' },
      { m: 'Necessário por semana', v: remainingToGoal > 0 ? needPerWeek.toFixed(1) : '0.0', u: 'Ritmo mínimo' },
      { m: 'Ritmo atual', v: pacePerDay.toFixed(2), u: 'Fechados/dia no mês' },
      { m: 'Projeção do mês', v: fmt(projected), u: projected >= goal ? 'Meta provável' : 'Abaixo da meta' }
    ];

    if (monthPaceTable) {
      monthPaceTable.innerHTML = `
        <thead><tr><th>Métrica</th><th>Valor</th><th>Leitura</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr><td>${r.m}</td><td class="kpi-num">${r.v}</td><td class="kpi-muted">${r.u}</td></tr>`).join('')}
        </tbody>
      `;
    }

    if (monthViz) {
      const progressPct = Math.round(progressMonth * 100);
      monthViz.innerHTML = `
        <div class="kpi-viz-top">
          <div>
            <div class="kpi-viz-title">Progresso da meta</div>
            <div class="kpi-viz-sub">${fmt(closedThisMonth)} / ${fmt(goal)} fechados</div>
          </div>
          <div class="kpi-viz-big">${progressPct}%</div>
        </div>
        <div class="kpi-viz-bar"><div class="kpi-viz-fill" style="width:${Math.max(2, progressPct)}%"></div></div>
        <div class="kpi-viz-kpis">
          <div class="kpi-viz-kpi">
            <div class="kpi-viz-kpi-label">Faltam</div>
            <div class="kpi-viz-kpi-val">${fmt(remainingToGoal)}</div>
            <div class="kpi-viz-kpi-hint">${remainingToGoal > 0 ? 'para bater a meta' : 'meta batida'}</div>
          </div>
          <div class="kpi-viz-kpi">
            <div class="kpi-viz-kpi-label">Necessário / dia</div>
            <div class="kpi-viz-kpi-val">${remainingToGoal > 0 ? needPerDay.toFixed(2) : '0.00'}</div>
            <div class="kpi-viz-kpi-hint">${fmt(daysRemaining)} dias restantes</div>
          </div>
          <div class="kpi-viz-kpi">
            <div class="kpi-viz-kpi-label">Ritmo atual</div>
            <div class="kpi-viz-kpi-val">${pacePerDay.toFixed(2)}</div>
            <div class="kpi-viz-kpi-hint">fechados/dia</div>
          </div>
          <div class="kpi-viz-kpi">
            <div class="kpi-viz-kpi-label">Projeção</div>
            <div class="kpi-viz-kpi-val">${fmt(projected)}</div>
            <div class="kpi-viz-kpi-hint">${projected >= goal ? 'meta provável' : 'abaixo da meta'}</div>
          </div>
        </div>
      `;
    }
  }

  const cycleTable = document.getElementById('kpiCycleTable');
  if (cycleTable) {
    const fmtDur = (days) => {
      const d = Number(days);
      if (!Number.isFinite(d) || d <= 0) return '—';
      if (d < 1) return `${Math.max(1, Math.round(d * 24))}h`;
      return `${d.toFixed(1)}d`;
    };

    const pushDiff = (arr, a, b) => {
      const ta = toTs(a);
      const tb = toTs(b);
      if (!ta || !tb) return;
      const d = (tb - ta) / 86400000;
      if (!Number.isFinite(d) || d < 0) return;
      arr.push(d);
    };

    const collectedToDm1 = [];
    const dm1ToResponse = [];
    const responseToSite = [];
    const siteToDm2 = [];
    const dm2ToProposal = [];
    const proposalToClose = [];

    state.leads.forEach(l => {
      pushDiff(collectedToDm1, l.createdAt, l.dm1SentAt);
      const respAt = respondedAtOf(l);
      if (respAt) pushDiff(dm1ToResponse, l.dm1SentAt, respAt);
      if (respAt) pushDiff(responseToSite, respAt, l.siteGeneratedAt);
      pushDiff(siteToDm2, l.siteGeneratedAt, l.dm2SentAt);
      pushDiff(dm2ToProposal, l.dm2SentAt, l.propostaSentAt);
      pushDiff(proposalToClose, l.propostaSentAt, l.closedAt);
    });

    const rows = [
      { s: 'Coleta → DM1', a: collectedToDm1 },
      { s: 'DM1 → Resposta', a: dm1ToResponse },
      { s: 'Resposta → Site', a: responseToSite },
      { s: 'Site → DM2', a: siteToDm2 },
      { s: 'DM2 → Proposta', a: dm2ToProposal },
      { s: 'Proposta → Fechado', a: proposalToClose }
    ].map(r => ({
      s: r.s,
      med: fmtDur(median(r.a)),
      n: r.a.length ? fmt(r.a.length) : '—'
    }));

    cycleTable.innerHTML = `
      <thead><tr><th>Etapa</th><th>Mediana</th><th>Amostra</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r.s}</td><td class="kpi-num">${r.med}</td><td class="kpi-muted">${r.n}</td></tr>`).join('')}
      </tbody>
    `;
  }

  const stageDurViz = document.getElementById('kpiStageDurationsViz');
  if (stageDurViz) {
    const fmtDur = (days) => {
      const d = Number(days);
      if (!Number.isFinite(d) || d <= 0) return '—';
      if (d < 1) return `${Math.max(1, Math.round(d * 24))}h`;
      return `${d.toFixed(1)}d`;
    };

    const byStage = new Map();
    state.leads.forEach(l => {
      const tl = v2TimelineOf(l, nowTs);
      tl.forEach(it => {
        const st = String(it.stageId || '').toLowerCase();
        if (!st) return;
        if (!byStage.has(st)) byStage.set(st, []);
        byStage.get(st).push(it.durMs / 86400000);
      });
    });

    const rows = stagesMeta
      .map(s => {
        const id = String(s?.id || '').toLowerCase();
        const arr = byStage.get(id) || [];
        return { id, label: s.label, color: s.color, med: median(arr), n: arr.length };
      })
      .filter(r => r.n > 0);

    if (!rows.length) {
      stageDurViz.innerHTML = `<div class="kpi-muted" style="padding:8px 0">Sem dados suficientes</div>`;
    } else {
      const max = Math.max(...rows.map(r => r.med), 0.00001);
      stageDurViz.innerHTML = `
        <div class="kpi-stage-bars">
          ${rows.map(r => {
            const w = Math.max(2, Math.round((r.med / max) * 100));
            return `
              <div class="kpi-stage-row">
                <div class="kpi-stage-label">${r.label}</div>
                <div class="kpi-stage-track"><div class="kpi-stage-fill" style="width:${w}%;background:${r.color}"></div></div>
                <div class="kpi-stage-val">${fmtDur(r.med)} • n=${fmt(r.n)}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  const recentActivityTable = document.getElementById('kpiRecentActivityTable');
  if (recentActivityTable) {
    const last24 = nowTs - 24 * 60 * 60 * 1000;
    const last7d = nowTs - 7 * 86400000;

    const agg = {
      created24: 0, created7d: 0,
      dm124: 0, dm17d: 0,
      resp24: 0, resp7d: 0,
      site24: 0, site7d: 0,
      dm224: 0, dm27d: 0,
      prop24: 0, prop7d: 0,
      close24: 0, close7d: 0,
      arch24: 0, arch7d: 0,
      moved24: 0, moved7d: 0
    };

    state.leads.forEach(l => {
      const c = toTs(l.createdAt);
      if (c >= last24) agg.created24 += 1;
      if (c >= last7d) agg.created7d += 1;

      const d1 = toTs(l.dm1SentAt);
      if (d1 >= last24) agg.dm124 += 1;
      if (d1 >= last7d) agg.dm17d += 1;

      const resp = respondedAtOf(l);
      if (resp >= last24) agg.resp24 += 1;
      if (resp >= last7d) agg.resp7d += 1;

      const site = toTs(l.siteGeneratedAt);
      if (site >= last24) agg.site24 += 1;
      if (site >= last7d) agg.site7d += 1;

      const d2 = toTs(l.dm2SentAt);
      if (d2 >= last24) agg.dm224 += 1;
      if (d2 >= last7d) agg.dm27d += 1;

      const p = toTs(l.propostaSentAt);
      if (p >= last24) agg.prop24 += 1;
      if (p >= last7d) agg.prop7d += 1;

      const cl = toTs(l.closedAt);
      if (cl >= last24) agg.close24 += 1;
      if (cl >= last7d) agg.close7d += 1;

      const a = toTs(l.archivedAt);
      if (a >= last24) agg.arch24 += 1;
      if (a >= last7d) agg.arch7d += 1;

      const mv = toTs(l.v2LastMovedAt);
      if (mv >= last24) agg.moved24 += 1;
      if (mv >= last7d) agg.moved7d += 1;
    });

    const rows = [
      { a: 'Movimentações no funil', h: agg.moved24, s: agg.moved7d },
      { a: 'Leads coletados', h: agg.created24, s: agg.created7d },
      { a: 'DM1 enviadas', h: agg.dm124, s: agg.dm17d },
      { a: 'Respostas', h: agg.resp24, s: agg.resp7d },
      { a: 'Sites gerados', h: agg.site24, s: agg.site7d },
      { a: 'DM2 enviadas', h: agg.dm224, s: agg.dm27d },
      { a: 'Propostas enviadas', h: agg.prop24, s: agg.prop7d },
      { a: 'Fechados', h: agg.close24, s: agg.close7d },
      { a: 'Arquivados', h: agg.arch24, s: agg.arch7d }
    ];

    recentActivityTable.innerHTML = `
      <thead><tr><th>Ação</th><th>24h</th><th>7 dias</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r.a}</td><td class="kpi-num">${fmt(r.h)}</td><td class="kpi-muted">${fmt(r.s)}</td></tr>`).join('')}
      </tbody>
    `;
  }
}

const DASH2_STAGES = [
  { id: 'coletados', label: 'Coletados', color: '#7c3aed' },
  { id: 'perfil_engajado', label: 'Perfil Engajado', color: '#64748b' },
  { id: 'dm1_enviada', label: 'DM1 Enviada', color: '#3b82f6' },
  { id: 'nao_respondeu', label: 'Não Respondeu', color: '#06b6d4' },
  { id: 'respondeu', label: 'Respondeu', color: '#8b5cf6' },
  { id: 'follow_up_1', label: 'Follow-up 1', color: '#fb923c' },
  { id: 'chat_gerado', label: 'Gerar Site', color: '#ec4899' },
  { id: 'dm2_enviada', label: 'DM2 Enviada', color: '#db2777' },
  { id: 'proposta_enviada', label: 'Proposta Enviada', color: '#f59e0b' },
  { id: 'follow_up_2', label: 'Follow-up 2', color: '#f97316' },
  { id: 'fechado', label: 'Fechado', color: '#22c55e' },
  { id: 'arquivado', label: 'Arquivado / Sem Interesse', color: '#94a3b8' }
];

function formatBRL(value) {
  const n = Number(value || 0);
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

function dash2ComputeStats() {
  const stageOf = (l) => l.pipelineStageV2 || 'coletados';
  const isArchived = (l) => stageOf(l) === 'arquivado';
  const conversationStages = new Set(['dm1_enviada', 'nao_respondeu', 'respondeu', 'follow_up_1', 'chat_gerado', 'dm2_enviada', 'proposta_enviada', 'follow_up_2']);
  const siteStages = new Set(['dm2_enviada', 'proposta_enviada', 'follow_up_2', 'fechado']);
  const stageOrder = ['coletados', 'perfil_engajado', 'dm1_enviada', 'nao_respondeu', 'respondeu', 'follow_up_1', 'chat_gerado', 'dm2_enviada', 'proposta_enviada', 'follow_up_2', 'fechado', 'arquivado'];
  const stageIndex = (st) => {
    const i = stageOrder.indexOf(st);
    return i >= 0 ? i : -1;
  };
  const stageAtOrAfter = (st, pivot) => {
    const si = stageIndex(st);
    const pi = stageIndex(pivot);
    if (si < 0 || pi < 0) return false;
    return si >= pi;
  };

  const totalLeads = state.leads.filter(l => !isArchived(l)).length;

  let sent = 0;
  let sites = 0;
  let proposta = 0;
  let fechado = 0;
  let arquivado = 0;
  let follow = 0;

  let bucketA = 0;
  let bucketB = 0;
  let bucketC = 0;
  let bucketD = 0;
  let bucketE = 0;
  let bucketF = 0;
  let bucketG = 0;
  let bucketH = 0;

  state.leads.forEach(l => {
    const st = stageOf(l);
    if (l.dm1SentAt) sent += 1;
    if (l.dm2SentAt) sent += 1;
    if (siteStages.has(st)) sites += 1;
    if (st === 'proposta_enviada') proposta += 1;
    if (st === 'fechado') fechado += 1;
    if (st === 'arquivado') arquivado += 1;
    if (st === 'follow_up_1' || st === 'follow_up_2') follow += 1;

    if (['coletados', 'perfil_engajado'].includes(st)) bucketA += 1;
    if (conversationStages.has(st)) bucketB += 1;
    if (st === 'proposta_enviada') bucketC += 1;
    if (st === 'fechado') bucketD += 1;
    if (st === 'arquivado') bucketE += 1;
    if (st === 'follow_up_1' || st === 'follow_up_2') bucketF += 1;
    if (st !== 'arquivado' && stageAtOrAfter(st, 'dm1_enviada')) bucketG += 1;
    if (st !== 'arquivado' && stageAtOrAfter(st, 'dm2_enviada')) bucketH += 1;
  });

  const price = Number(state.settings?.servicePrice || 0);
  const potentialStages = new Set(['respondeu', 'chat_gerado', 'dm2_enviada', 'proposta_enviada', 'follow_up_2']);
  const potentialLeads = state.leads.filter(l => !isArchived(l) && potentialStages.has(stageOf(l))).length;
  const potential = price * potentialLeads;
  const confirmed = price * fechado;

  return {
    totalLeads,
    sent,
    sites,
    potential,
    confirmed,
    buckets: { a: bucketA, b: bucketB, c: bucketC, d: bucketD, e: bucketE, f: bucketF, g: bucketG, h: bucketH },
    counts: { proposta, fechado, arquivado, follow }
  };
}

function dash2Card(lead) {
  const stage = lead.pipelineStageV2 || 'coletados';
  const now = Date.now();
  const ageBase = lead.dm1SentAt || lead.dm2SentAt || lead.v2LastMovedAt || lead.createdAt || now;
  const overdue = stage === 'nao_respondeu' && (now - Number(ageBase)) >= 48 * 60 * 60 * 1000;
  const classes = `prospect-card compact${overdue ? ' overdue' : ''}`;

  const initial = (lead.name || '?').trim().charAt(0).toUpperCase();
  const imgTag = lead.avatar ? `<img class="prospect-avatar-img" src="${lead.avatar}" alt="${lead.name || ''}" referrerpolicy="no-referrer">` : '';

  const meta = DASH2_STAGES.find(s => s.id === stage) || { label: stage, color: '#94a3b8' };
  const handle = (lead.instagram || '').toString().trim();
  const handleView = handle ? (handle.startsWith('http') ? handle.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '') : (handle.startsWith('@') ? handle : `@${handle}`)) : '';
  const subtitle = [handleView, lead.city || ''].filter(Boolean).join(' • ');

  const tag = lead.followUpTag === 'dm1'
    ? 'Follow-up DM1'
    : lead.followUpTag === 'dm2'
      ? 'Follow-up DM2'
      : lead.followUpTag === 'final'
        ? 'Follow-up Final'
        : '';
  const tagLine = tag || '';

  const primaryBtn = (label, action, icon) => `
    <button class="dash2-action-primary" onclick="dash2QuickAction('${lead.id}','${action}')">
      ${icon || ''}
      <span>${label}</span>
    </button>
  `;

  const chipBtn = (label, action, active = false) => `
    <button class="dash2-chip${active ? ' active' : ''}" onclick="dash2QuickAction('${lead.id}','${action}')">${label}</button>
  `;

  const actions = (() => {
    if (stage === 'coletados') {
      return `<div class="dash2-action-row">
        ${primaryBtn('Engajar perfil', 'engajar', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-6"/></svg>`)}
      </div>`;
    }
    if (stage === 'perfil_engajado') {
      return `<div class="dash2-action-row">
        ${primaryBtn('Enviar DM1', 'dm1', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>`)}
      </div>`;
    }
    if (stage === 'nao_respondeu') {
      return `<div class="dash2-action-row">
        ${primaryBtn(overdue ? 'Follow-up (48h)' : 'Follow-up', 'follow_dm1', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>`)}
        ${chipBtn('Respondeu', 'respondeu')}
      </div>`;
    }
    if (stage === 'chat_gerado' || stage === 'dm2_enviada') {
      const dm2Ok = !!lead.dm2SentAt;
      return `<div class="dash2-action-row">
        ${primaryBtn(dm2Ok ? 'DM2 enviada' : 'Enviar DM2', 'dm2', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`)}
      </div>`;
    }
    if (stage === 'follow_up_1' || stage === 'follow_up_2') {
      return `<div class="dash2-action-row">
        ${chipBtn('Follow-up DM1', 'tag_dm1', lead.followUpTag === 'dm1')}
        ${chipBtn('Follow-up DM2', 'tag_dm2', lead.followUpTag === 'dm2')}
        ${chipBtn('Final', 'tag_final', lead.followUpTag === 'final')}
      </div>`;
    }
    return '';
  })();

  return `
    <div class="${classes}" draggable="true" ondragstart="dragDash2(event, '${lead.id}')" id="d2-card-${lead.id}">
      <div class="prospect-card-header">
        <div class="prospect-avatar">${imgTag || `<span class="prospect-avatar-fallback">${initial}</span>`}</div>
        <div class="prospect-info">
          <div class="prospect-name">${lead.name || 'Lead Sem Nome'}</div>
          <div class="prospect-tag">${subtitle}</div>
        </div>
      </div>
      ${tagLine ? `<div class="prospect-last-msg"><span class="dash2-pill"><span class="dash2-pill-dot" style="background:#f97316"></span><span>${tagLine}</span></span></div>` : ''}
      ${actions ? `<div class="prospect-footer"><div style="width:100%">${actions}</div></div>` : ''}
    </div>
  `;
}

function renderDashboard2() {
  const board = document.getElementById('dash2Board');
  if (!board) return;

  setTodayDateText('currentDateDisplayDash2');

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  const stats = dash2ComputeStats();
  setTxt('d2-total', stats.totalLeads);
  setTxt('d2-msgs', stats.sent);
  setTxt('d2-sites', stats.sites);
  setTxt('d2-potential', formatBRL(stats.potential));
  setTxt('d2-confirmed', formatBRL(stats.confirmed));
  setTxt('d2-bucket-a', stats.buckets.a);
  setTxt('d2-bucket-b', stats.buckets.b);
  setTxt('d2-bucket-c', stats.buckets.c);
  setTxt('d2-bucket-d', stats.buckets.d);
  setTxt('d2-bucket-e', stats.buckets.e);
  setTxt('d2-bucket-f', stats.buckets.f);
  setTxt('d2-bucket-g', stats.buckets.g);
  setTxt('d2-bucket-h', stats.buckets.h);

  board.innerHTML = '';
  DASH2_STAGES.forEach(stage => {
    const col = document.createElement('div');
    col.className = 'prospect-col';
    col.dataset.stage = stage.id;

    const leadsInStage = state.leads.filter(l => (l.pipelineStageV2 || 'coletados') === stage.id);

    col.innerHTML = `
      <div class="prospect-col-header" style="border-top: 3px solid ${stage.color}">
        <span class="dash2-pill-dot" style="background:${stage.color}"></span>
        <div class="prospect-col-title">${stage.label}</div>
        <div class="prospect-col-count">${leadsInStage.length}</div>
      </div>
      <div class="prospect-cards" id="d2-col-${stage.id}" ondrop="dropDash2(event, '${stage.id}')" ondragover="allowDropDash2(event)">
        ${leadsInStage.map(l => dash2Card(l)).join('') || `<div class="dash2-empty">Nenhum lead</div>`}
      </div>
    `;
    board.appendChild(col);
  });

  if (window._dash2Tick) clearInterval(window._dash2Tick);
  window._dash2Tick = setInterval(() => {
    if (state.currentView === 'dashboard2') renderDashboard2();
  }, 60 * 1000);
}

window.allowDropDash2 = function (ev) {
  ev.preventDefault();
  if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
}

window.dragDash2 = function (ev, id) {
  if (!ev.dataTransfer) return;
  ev.dataTransfer.effectAllowed = 'move';
  ev.dataTransfer.setData("text/plain", id);
  ev.dataTransfer.setData("text", id);
}

window.dropDash2 = function (ev, stageId) {
  ev.preventDefault();
  const leadId = (ev.dataTransfer && (ev.dataTransfer.getData("text/plain") || ev.dataTransfer.getData("text"))) || "";
  if (!leadId) return;
  moveLeadToStageDash2(leadId, stageId);
}

function dash2SetStatusSafely(lead, status) {
  if (!lead || lead.status === 'arquivado') return;
  const cur = lead.status || '';
  if (cur === 'fechado') return;
  if (cur === 'cobrado' && status !== 'fechado') return;
  if (cur === 'site_pronto' && ['contatado', 'coletado'].includes(status)) return;
  lead.status = status;
}

function dash2AutoGenerateSite(lead) {
  if (!lead.siteGeneratedAt) lead.siteGeneratedAt = Date.now();
  dash2SetStatusSafely(lead, 'site_pronto');
  const oldStage = lead.pipelineStageV2 || 'coletados';
  lead.pipelineStageV2 = 'chat_gerado';
  lead.v2LastMovedAt = Date.now();
  if (!lead.history) lead.history = [];
  lead.history.push({ date: new Date().toISOString(), action: `V2: Auto site: ${oldStage} -> chat_gerado` });
  pushV2StageEntry(lead, 'chat_gerado', lead.v2LastMovedAt);
  toast('Site gerado – envie DM2');
}

window.moveLeadToStageDash2 = function (leadId, stageId) {
  const idx = state.leads.findIndex(l => l.id === leadId);
  if (idx === -1) return;
  const lead = state.leads[idx];
  const oldStage = lead.pipelineStageV2 || 'coletados';
  const nextStage = String(stageId || '').trim().toLowerCase();
  if (!Array.isArray(lead.v2StageEntries) || !lead.v2StageEntries.length) normalizeV2StageEntries(lead);
  if (oldStage) pushV2StageEntry(lead, oldStage, toTsAny(lead.createdAt) || Date.now());
  lead.pipelineStageV2 = stageId;
  lead.v2LastMovedAt = Date.now();
  if (!lead.history) lead.history = [];
  lead.history.push({ date: new Date().toISOString(), action: `V2: Moved: ${oldStage} -> ${stageId}` });
  if (nextStage && nextStage !== String(oldStage || '').toLowerCase()) pushV2StageEntry(lead, nextStage, lead.v2LastMovedAt);

  if (stageId === 'dm1_enviada') {
    if (!lead.dm1SentAt) lead.dm1SentAt = Date.now();
    dash2SetStatusSafely(lead, 'contatado');
  }
  if (stageId === 'chat_gerado') {
    if (!lead.siteGeneratedAt) lead.siteGeneratedAt = Date.now();
    dash2SetStatusSafely(lead, 'site_pronto');
  }
  if (stageId === 'dm2_enviada') {
    if (!lead.siteGeneratedAt) lead.siteGeneratedAt = Date.now();
    if (!lead.dm2SentAt) lead.dm2SentAt = Date.now();
    dash2SetStatusSafely(lead, 'contatado');
  }
  if (stageId === 'proposta_enviada') {
    if (!lead.propostaSentAt) lead.propostaSentAt = Date.now();
    dash2SetStatusSafely(lead, 'cobrado');
  }
  if (stageId === 'fechado') {
    if (!lead.closedAt) lead.closedAt = Date.now();
    lead.status = 'fechado';
  }
  if (stageId === 'arquivado') {
    if (lead.status !== 'arquivado') lead.statusBeforeArchive = lead.status || '';
    lead.status = 'arquivado';
    if (!lead.archivedAt) lead.archivedAt = Date.now();
  }

  save();
  renderDashboard2();
}

window.dash2QuickAction = function (leadId, action) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;
  if (!lead.history) lead.history = [];

  if (action === 'engajar') {
    moveLeadToStageDash2(leadId, 'perfil_engajado');
    return;
  }
  if (action === 'dm1') {
    moveLeadToStageDash2(leadId, 'dm1_enviada');
    return;
  }
  if (action === 'respondeu') {
    moveLeadToStageDash2(leadId, 'respondeu');
    return;
  }
  if (action === 'dm2') {
    if (!lead.dm2SentAt) lead.dm2SentAt = Date.now();
    moveLeadToStageDash2(leadId, 'dm2_enviada');
    return;
  }
  if (action === 'follow_dm1') {
    lead.followUpTag = 'dm1';
    moveLeadToStageDash2(leadId, 'follow_up_1');
    return;
  }
  if (action === 'tag_dm1') {
    lead.followUpTag = lead.followUpTag === 'dm1' ? '' : 'dm1';
    save();
    renderDashboard2();
    return;
  }
  if (action === 'tag_dm2') {
    lead.followUpTag = lead.followUpTag === 'dm2' ? '' : 'dm2';
    save();
    renderDashboard2();
    return;
  }
  if (action === 'tag_final') {
    lead.followUpTag = lead.followUpTag === 'final' ? '' : 'final';
    save();
    renderDashboard2();
    return;
  }
}

function syncLeadsTabsUI() {
  const activeBtn = document.getElementById('leadsTabActive');
  const archivedBtn = document.getElementById('leadsTabArchived');
  const statusSelect = document.getElementById('statusFilter');

  const tab = state.leadsTab === 'arquivados' ? 'arquivados' : 'ativos';

  if (activeBtn) {
    activeBtn.classList.toggle('active', tab === 'ativos');
    activeBtn.setAttribute('aria-selected', tab === 'ativos' ? 'true' : 'false');
  }
  if (archivedBtn) {
    archivedBtn.classList.toggle('active', tab === 'arquivados');
    archivedBtn.setAttribute('aria-selected', tab === 'arquivados' ? 'true' : 'false');
  }

  if (statusSelect) {
    if (tab === 'arquivados') {
      statusSelect.value = 'arquivado';
      statusSelect.disabled = true;
    } else {
      statusSelect.disabled = false;
      if (statusSelect.value === 'arquivado') statusSelect.value = '';
    }
  }
}

function setLeadsTab(tab) {
  state.leadsTab = tab === 'arquivados' ? 'arquivados' : 'ativos';
  syncLeadsTabsUI();
  renderLeadsTable();
}

function applyDashboardTab(tab) {
  const view = document.getElementById('view-dashboard');
  if (!view) return;
  view.dataset.dashboardTab = tab === 'pipeline' ? 'pipeline' : 'metrics';
}

function syncDashboardTabsUI() {
  const metricsBtn = document.getElementById('dashboardTabMetrics');
  const pipelineBtn = document.getElementById('dashboardTabPipeline');
  const tab = state.dashboardTab === 'pipeline' ? 'pipeline' : 'metrics';

  if (metricsBtn) {
    metricsBtn.classList.toggle('active', tab === 'metrics');
    metricsBtn.setAttribute('aria-selected', tab === 'metrics' ? 'true' : 'false');
  }
  if (pipelineBtn) {
    pipelineBtn.classList.toggle('active', tab === 'pipeline');
    pipelineBtn.setAttribute('aria-selected', tab === 'pipeline' ? 'true' : 'false');
  }

  applyDashboardTab(tab);
}

function setDashboardTab(tab) {
  state.dashboardTab = tab === 'pipeline' ? 'pipeline' : 'metrics';
  try { localStorage.setItem('lf_dashboard_tab', state.dashboardTab); } catch (e) {}
  syncDashboardTabsUI();
}

function openKpiSection(sectionId) {
  // Primeiro, oculta todas as seções KPI do dashboard
  const kpiSectionsDashboard = document.getElementById('kpiSectionsDashboard');
  if (kpiSectionsDashboard) {
    kpiSectionsDashboard.style.display = 'none';
    
    // Fecha todas as seções details
    const allSections = Array.from(kpiSectionsDashboard.querySelectorAll('details.kpi-section'));
    allSections.forEach(el => { if (el) el.open = false; });
  }
  
  // Oculta o kanban-mini e o lead-carousel
  const kanbanMini = document.getElementById('kanbanMini');
  const leadCarousel = document.getElementById('leadCarousel');
  if (kanbanMini) kanbanMini.style.display = 'none';
  if (leadCarousel) leadCarousel.style.display = 'none';
  
  // Se for uma seção específica, mostra o container e a seção correspondente
  if (sectionId && sectionId !== 'metrics') {
    if (kpiSectionsDashboard) {
      kpiSectionsDashboard.style.display = 'block';
      
      // Abre a seção específica
      const targetSection = document.getElementById(sectionId + 'Dashboard');
      if (targetSection) {
        targetSection.open = true;
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  } else {
    // Se for a aba Métricas (padrão), mostra o conteúdo normal
    if (kanbanMini) kanbanMini.style.display = 'grid';
    if (leadCarousel) leadCarousel.style.display = 'block';
  }
}

// ---- LEADS TABLE ----
function renderLeadsTable(filter = '') {
  const search = (document.getElementById('leadsSearch')?.value || '').toLowerCase();
  const statusF = document.getElementById('statusFilter')?.value || '';
  const sortF = document.getElementById('sortFilter')?.value || 'status';
  const dateF = document.getElementById('dateFilter')?.value || '';

  let leads = [...state.leads];

  // Sorting Logic
  if (sortF === 'date_desc') {
    leads.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortF === 'date_asc') {
    leads.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  } else if (sortF === 'site') {
    // Leads with site first
    leads.sort((a, b) => (b.siteLink ? 1 : 0) - (a.siteLink ? 1 : 0));
  } else if (sortF === 'status') {
    const statusOrder = {
      'coletado': 1, 'contatado': 2, 'arquivado': 3,
      'site_pronto': 4, 'cobrado': 5, 'fechado': 6, 'sem_interesse': 7
    };
    leads.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
  }

  const tab = statusF === 'arquivado' ? 'arquivados' : (state.leadsTab === 'arquivados' ? 'arquivados' : 'ativos');
  if (state.leadsTab !== tab) state.leadsTab = tab;
  syncLeadsTabsUI();
  if (tab === 'arquivados') leads = leads.filter(l => l.status === 'arquivado');
  else leads = leads.filter(l => l.status !== 'arquivado');

  if (search) leads = leads.filter(l => (l.name + l.instagram + l.specialty + l.city).toLowerCase().includes(search));
  if (statusF) leads = leads.filter(l => l.status === statusF);
  if (dateF) {
    leads = leads.filter(l => {
      if (!l.createdAt) return false;
      const d = new Date(l.createdAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}` === dateF;
    });
  }

  // Reset selection state
  const selectAll = document.getElementById('selectAll');
  if (selectAll) selectAll.checked = false;
  if (typeof updateSelectionBar === 'function') updateSelectionBar();

  const tbody = document.getElementById('leadsBody');
  if (!leads.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Nenhum lead encontrado.</td></tr>';
    return;
  }
  tbody.innerHTML = leads.map(l => {
    const initial = (l.name || '?').trim().charAt(0).toUpperCase();
    const imgTag = l.avatar ? `<img src="${l.avatar}" alt="${l.name || ''}" referrerpolicy="no-referrer" onload="this.parentElement.classList.add('has-img')" onerror="this.remove();this.parentElement.classList.remove('has-img')">` : '';
    const instaLink = l.instagram ? `<a href="https://instagram.com/${l.instagram.replace('@', '')}" target="_blank" class="text-sm text-muted no-underline hover-primary">${l.instagram}</a>` : '<span class="text-sm text-muted">—</span>';
    const isArchived = l.status === 'arquivado' || tab === 'arquivados';

    const actions = isArchived
      ? `
        <button class="action-btn" title="Editar" onclick="openEditLead('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="action-btn success" title="Desarquivar" onclick="unarchiveLead('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18"/><path d="M5 7l1-3h12l1 3"/><path d="M5 7v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7"/><path d="M12 10v7"/><path d="M8.5 13.5L12 10l3.5 3.5"/></svg></button>
        <button class="action-btn danger" title="Excluir" onclick="deleteLead('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>
      `
      : `
        <button class="action-btn success" title="Gerar Site" onclick="goGenerate('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></button>
        <button class="action-btn" title="Editar" onclick="openEditLead('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="action-btn warning" title="Arquivar" onclick="archiveLead('${l.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></button>
      `;

    return `
    <tr>
      <td><input type="checkbox" class="lead-check" data-id="${l.id}" /></td>
      <td>
        <div class="flex items-center gap-3">
          <div class="avatar">${imgTag}<span class="avatar-fallback">${initial}</span></div>
          <div class="flex flex-col">
            <strong class="text-base">${l.name}</strong>
            ${instaLink}
          </div>
        </div>
      </td>
      <td><span class="text-sm">${l.specialty || '—'}</span></td>
      <td><span class="text-sm">${l.city || '—'}</span></td>
      <td><span class="text-sm text-muted">${l.createdAt ? new Date(l.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</span></td>
      <td>${statusBadge(l.status)}</td>
      <td>${l.siteLink ? `<a class="site-link" href="#" onclick="previewExternalSite('${l.siteLink}');return false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Ver</a>` : '<span class="no-site">—</span>'}</td>
      <td><div class="action-btns">
        ${actions}
      </div></td>
    </tr>`;
  }).join('');
}

// ---- LEAD MODAL ----
function updateModalAvatar(name, avatarUrl) {
  const imgEl = document.getElementById('modalAvatarImg');
  const initEl = document.getElementById('modalAvatarInitials');

  const initials = (name || '?').trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  initEl.textContent = initials;

  if (avatarUrl) {
    // Check if same src to avoid reload loop if needed, but here we want to force update
    // Force reset to trigger load event again if same URL but failed previously?
    // Actually, simply setting src is enough.
    imgEl.referrerPolicy = 'no-referrer'; // Re-enforce
    imgEl.src = avatarUrl;
    // Don't set display block here immediately, let onload handle it to avoid broken image icon
    // But if we don't set it, and onload fails, it stays hidden.
    // If we set it block, we might see broken image.
    // Let's keep it consistent with the event listener logic.
    // However, for immediate feedback, let's reset display to none until load.
    // BUT, if it's already loaded (cached), load might not fire?
    // In most browsers, setting src triggers load even if cached.
    // Let's try setting display block ONLY in onload.
    // But wait, if we are editing an existing lead with a valid image, we want it shown.
    // The issue might be that updateModalAvatar sets display=block, but then error hides it?
    // Or updateModalAvatar sets display=block, and the image is broken so it shows broken icon.
    // User says "nao aparece a imagem div", meaning the div content (image) is not visible or not updating.

    // Let's ensure we clear any previous error state
    imgEl.style.display = 'none'; // Hide until loaded

    // Add a cache buster if it helps? No, might break signed URLs.

  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }
}

function openAddLead() {
  document.getElementById('editLeadId').value = '';
  document.getElementById('modalTitle').textContent = 'Novo Lead';
  document.getElementById('leadName').value = '';
  document.getElementById('leadInstagram').value = '';
  const imgEl = document.getElementById('leadImage'); if (imgEl) imgEl.value = '';
  document.getElementById('leadBio').value = '';
  document.getElementById('leadSpecialty').value = '';
  document.getElementById('leadCity').value = '';
  document.getElementById('leadWhatsapp').value = '';
  document.getElementById('leadAttendance').value = 'Online e Presencial';
  document.getElementById('leadTagline').value = '';
  document.getElementById('leadServices').value = '';
  document.getElementById('leadStatus').value = 'coletado';
  document.getElementById('leadSiteLink').value = '';
  document.getElementById('leadNotes').value = '';
  document.getElementById('smartPasteInput').value = '';

  updateModalAvatar('', '');

  // Collapse form by default for new leads
  const leadFormGrid = document.getElementById('leadFormGrid');
  const toggleLeadFormIcon = document.getElementById('toggleLeadFormIcon');
  if (leadFormGrid && toggleLeadFormIcon) {
    leadFormGrid.classList.add('collapsed');
    toggleLeadFormIcon.classList.add('rotate-180');
  }

  document.getElementById('leadModal').classList.add('open');
}

// ---- SMART PASTE ----
document.getElementById('smartPasteBtn').addEventListener('click', () => {
  const text = document.getElementById('smartPasteInput').value;
  const countInput = document.getElementById('smartPasteCount');
  const count = parseInt(countInput ? countInput.value : 0) || 0;

  if (!text.trim()) { toast('Cole algo primeiro!'); return; }

  // Check for bulk import markers (e.g. "1- Ficha:", "2- Ficha:")
  const fichaRegex = /\d+\s*-\s*Ficha:/gi;
  const fichaHeaderRegex = /^\s*\[?\s*ficha\s*-\s*@/gmi;
  const numericMatches = text.match(fichaRegex);
  const headerMatches = text.match(fichaHeaderRegex);
  const numericCount = numericMatches ? numericMatches.length : 0;
  const headerCount = headerMatches ? headerMatches.length : 0;
  const detectedCount = Math.max(numericCount, headerCount);

  // Bulk mode if count > 1 OR multiple "Ficha" markers detected
  if (count > 1 || detectedCount > 1) {
    let chunks = [];

    // Try splitting by "N- Ficha:"
    if (headerCount > 0) {
      chunks = text.split(/(?=^\s*\[?\s*ficha\s*-\s*@)/gmi).filter(c => c.trim().length > 10);
    } else if (numericCount > 0) {
      chunks = text.split(/(?=\d+\s*-\s*Ficha:)/i).filter(c => c.trim().length > 10);
    }
    // Fallback: If no "Ficha" but count > 1, try simple double newline or just process as one chunk if regex fails
    else {
      // If the user said "5 leads" but didn't use "Ficha:", we might try splitting by "Nome:"
      const nameMatches = text.match(/Nome:/gi);
      if (nameMatches && nameMatches.length > 1) {
        chunks = text.split(/(?=Nome:)/i).filter(c => c.trim().length > 10);
        toast(`Detectei ${chunks.length} leads baseados em "Nome:".`);
      } else {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const isLeadStart = (line) => {
          if (!line) return false;
          if (/^\s*\[?\s*ficha\s*-\s*@/i.test(line)) return true;
          if (/^\[\s*ficha\b/i.test(line)) return true;
          if (/^@[\w.]{2,}$/i.test(line)) return true;
          if (/^(https?:\/\/)?(www\.)?instagram\.com\/[\w.]{2,}/i.test(line)) return true;
          if (/^instagram\s*[:\-]/i.test(line)) return true;
          if (/^nome\s*[:\-]/i.test(line)) return true;
          return false;
        };
        const grouped = [];
        let cur = [];
        lines.forEach(line => {
          if (cur.length && isLeadStart(line) && !isLeadStart(cur[cur.length - 1])) {
            grouped.push(cur.join('\n'));
            cur = [line];
            return;
          }
          if (cur.length && isLeadStart(line) && isLeadStart(cur[cur.length - 1])) {
            grouped.push(cur.join('\n'));
            cur = [line];
            return;
          }
          cur.push(line);
        });
        if (cur.length) grouped.push(cur.join('\n'));

        const groupedClean = grouped.map(c => c.trim()).filter(Boolean);
        if (groupedClean.length > 1) {
          chunks = groupedClean;
          toast(`Detectei ${chunks.length} leads por linhas (ex: @ / instagram.com).`);
        } else {
          chunks = [text];
          toast('Não identifiquei separadores. Tentando processar...');
        }
      }
    }

    const replicatedFromSingleChunk = count > 1 && chunks.length === 1;
    if (replicatedFromSingleChunk) {
      chunks = Array.from({ length: count }, () => chunks[0]);
    } else if (count > 1 && chunks.length > count) {
      chunks = chunks.slice(0, count);
    }

    let addedCount = 0;

    const baseCreatedAt = Date.now();
    const pipelineStageFromStatus = (status) => {
      if (status === 'fechado') return 'fechado';
      if (status === 'contatado') return 'dm_enviada';
      if (status === 'site_pronto') return 'engajar';
      return 'engajar';
    };

    chunks.forEach((chunk, idx) => {
      const data = parseSmartPaste(chunk);
      // Minimal validation
      if (data.name || data.instagram) {
        const createdAt = baseCreatedAt + idx;
        const rawStatus = (data.status || 'coletado');
        const status = String(rawStatus).toLowerCase().replace(/\s+/g, '_');
        const nameBase = data.name || 'Lead Sem Nome';
        const newLead = {
          id: typeof genId === 'function' ? genId() : Date.now().toString(36) + Math.random().toString(36).substr(2),
          createdAt,
          pipelineStage: pipelineStageFromStatus(status),
          pipelineStageV2: 'coletados',
          v2LastMovedAt: createdAt,
          v2StageEntries: [{ stageId: 'coletados', at: createdAt }],
          history: [],
          name: replicatedFromSingleChunk && idx > 0 ? `${nameBase} (${idx + 1})` : nameBase,
          instagram: replicatedFromSingleChunk && idx > 0 ? '' : (data.instagram || ''),
          bio: data.bio || '',
          specialty: data.specialty || '',
          city: data.city || '',
          whatsapp: data.whatsapp || '',
          status,
          notes: data.notes || '',
          attendance: data.attendance || 'Online e Presencial',
          tagline: data.tagline || '',
          services: data.services || '',
          siteLink: ''
        };
        state.leads.push(newLead);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      save();
      renderLeadsTable();
      if (typeof renderPipelineStats === 'function') renderPipelineStats();
      if (typeof renderDashboard === 'function') renderDashboard();

      toast(`${addedCount} leads adicionados com sucesso!`);
      document.getElementById('leadModal').classList.remove('open');

      // Clear inputs
      document.getElementById('smartPasteInput').value = '';
      if (countInput) countInput.value = '';
    } else {
      toast('Nenhum dado válido encontrado.');
    }

    return;
  }

  // Single mode (original logic)
  const data = parseSmartPaste(text);

  if (data.name) document.getElementById('leadName').value = data.name;
  if (data.instagram) document.getElementById('leadInstagram').value = data.instagram;
  if (data.bio) document.getElementById('leadBio').value = data.bio;
  if (data.specialty) document.getElementById('leadSpecialty').value = data.specialty;
  if (data.city) document.getElementById('leadCity').value = data.city;
  if (data.whatsapp) document.getElementById('leadWhatsapp').value = data.whatsapp;
  if (data.status) document.getElementById('leadStatus').value = data.status.toLowerCase().replace(' ', '_');
  if (data.notes) document.getElementById('leadNotes').value = data.notes;
  if (data.attendance) document.getElementById('leadAttendance').value = data.attendance;
  if (data.tagline) document.getElementById('leadTagline').value = data.tagline;
  if (data.services) document.getElementById('leadServices').value = data.services;

  updateModalAvatar(document.getElementById('leadName').value, document.getElementById('leadImage')?.value || '');

  // Expand form to show filled data
  const leadFormGrid = document.getElementById('leadFormGrid');
  const toggleLeadFormIcon = document.getElementById('toggleLeadFormIcon');
  if (leadFormGrid && toggleLeadFormIcon) {
    leadFormGrid.classList.remove('collapsed');
    toggleLeadFormIcon.classList.remove('rotate-180');
  }

  toast('Dados preenchidos automaticamente!');
});

function parseSmartPaste(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const data = {};
  let currentKey = null;
  let servicesMode = false;
  let servicesList = [];
  let sawKeyLine = false;

  // Keys mapping
  const keyMap = {
    'nome': 'name',
    'nome do perfil do instagram': 'name',
    'instagram': 'instagram',
    'instagram username como @': 'instagram',
    'instagram username sem o @': 'instagram',
    'bio': 'bio',
    'bio do instagram dela': 'bio',
    'especialidade': 'specialty',
    'especialidades': 'specialty',
    'cidade': 'city',
    'whatsapp': 'whatsapp',
    'whatsapps': 'whatsapp',
    'whatsapps mesmo se tiver dois coloque aqui os dois': 'whatsapp',
    'status': 'status',
    'status como \'analisado\'': 'status',
    'observações': 'notes',
    'obs': 'notes',
    'observações sobre esse lead': 'notes',
    'atendimento': 'attendance',
    'atendimento online, presencial ou online e presencial': 'attendance',
    'tagline': 'tagline',
    'frase': 'tagline',
    'tagline / frase de impacto': 'tagline',
    'serviços': 'services',
    'servicos': 'services',
    'serviços (um por linha)': 'services'
  };

  lines.forEach(line => {
    // Check if line starts with a key
    const lowerLine = line.toLowerCase();
    let foundKey = false;

    if (lowerLine.startsWith('status como') && lowerLine.includes('analisado')) {
      data.status = 'coletado';
      currentKey = null;
      servicesMode = false;
      sawKeyLine = true;
      return;
    }

    for (const [key, prop] of Object.entries(keyMap)) {
      if (lowerLine.startsWith(key) && (line.includes(':') || line.length < key.length + 5)) {
        currentKey = prop;
        sawKeyLine = true;
        foundKey = true;

        // Extract value if on same line
        const parts = line.split(/[:](.+)/);
        if (parts[1]) {
          let val = parts[1].trim();
          if (prop === 'services') {
            servicesMode = true;
            if (val) servicesList.push(val);
          } else {
            servicesMode = false;
            if (prop === 'instagram') {
              const mUrl = val.match(/instagram\.com\/([a-z0-9._]{2,})/i);
              if (mUrl && mUrl[1]) {
                val = `@${mUrl[1]}`;
              } else {
                const v = val.replace(/^@+/, '').trim();
                val = v ? `@${v}` : '';
              }
            }
            data[prop] = val;
          }
        } else {
          if (prop === 'services') servicesMode = true;
          else servicesMode = false;
        }
        break;
      }
    }

    if (!foundKey) {
      if (servicesMode) {
        servicesList.push(line);
      } else if (currentKey && currentKey !== 'services') {
        // Append to current key (multiline support for bio/notes)
        if (currentKey === 'bio' || currentKey === 'notes') {
          data[currentKey] = (data[currentKey] || '') + '\n' + line;
        }
      }
    }
  });

  if (servicesList.length > 0) {
    data.services = servicesList.join('\n');
  }

  if (!data.instagram) {
    const mUrl = text.match(/instagram\.com\/([a-z0-9._]{2,})/i);
    if (mUrl && mUrl[1]) data.instagram = `@${mUrl[1]}`;
  }
  if (!data.instagram) {
    const mAt = text.match(/@([a-z0-9._]{2,})/i);
    if (mAt && mAt[1]) data.instagram = `@${mAt[1]}`;
  }
  if (!data.instagram && !sawKeyLine) {
    const first = (lines[0] || '').trim();
    if (first && !first.includes(' ') && !first.includes(':') && first.length >= 3 && first.length <= 30) {
      data.instagram = first.startsWith('@') ? first : `@${first}`;
    }
  }
  if (!data.name && data.instagram && !sawKeyLine) {
    const firstLine = (lines[0] || '').trim();
    const atIdx = firstLine.indexOf('@');
    const nameGuess = atIdx > 0 ? firstLine.slice(0, atIdx).trim() : '';
    if (nameGuess && nameGuess.length >= 2) data.name = nameGuess;
  }

  return data;
}

function generateNutri({ name, specialty, city, attendance, tagline, services, whatsapp, instagram, images }) {
  const primary = '#B8A89A';
  const secondary = '#8E7D70';
  const bg = '#F7F5F2';
  const wa = whatsapp.replace(/\D/g, '');
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const handle = instagram ? instagram.replace('@', '') : '';
  const data = { name, specialty, city, attendance, tagline, services, whatsapp, instagram, images };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} | ${specialty}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --color-bg: ${bg};
            --color-card-beige: #Cebdb2;
            --color-card-text: #fff;
            --color-primary: ${primary};
            --color-primary-dark: ${secondary};
            --color-text: #5A524D;
            --color-text-dark: #3D3530;
            --color-white: #ffffff;
            --color-whatsapp: #25D366;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; background-color: var(--color-bg); color: var(--color-text); line-height: 1.6; }
        .container { width: 100%; max-width: 1200px; margin: 0 auto; padding-bottom: 100px; }
        .hero { padding: 4rem 2rem; text-align: center; }
        .hero h1 { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; color: var(--color-text-dark); margin-bottom: 1rem; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 1rem 2rem; border-radius: 50px; text-decoration: none; font-weight: 600; transition: transform 0.3s ease; }
        .btn-wa { background-color: var(--color-whatsapp); color: white; }
        .btn:hover { transform: translateY(-3px); }
        .services { padding: 4rem 2rem; }
        .service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem; }
        .service-card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .hero-img { width: 100%; max-width: 500px; border-radius: 30px; margin-top: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <section class="hero">
            <div style="width: 120px; height: 120px; background: var(--color-primary); border-radius: 50%; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-family: 'Cormorant Garamond', serif;">${initials}</div>
            <h1>${name}</h1>
            <p style="font-style: italic; font-size: 1.2rem; color: var(--color-primary-dark); margin-bottom: 2rem;">${specialty}</p>
            <p style="max-width: 600px; margin: 0 auto 3rem;">${tagline}</p>
            ${wa ? `<a href="https://wa.me/55${wa}" class="btn btn-wa"><i class="fab fa-whatsapp"></i> Agendar Consulta</a>` : ''}
            <div>
              <img src="${getTemplateImage(data, 0, 'https://picsum.photos/id/1015/600/600')}" class="hero-img" alt="${name}">
            </div>
        </section>
        <section class="services">
            <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; text-align: center;">Serviços</h2>
            <div class="service-grid">
                ${services.map(s => `<div class="service-card"><h3>${s}</h3><p>Atendimento especializado em ${city || 'toda região'}.</p></div>`).join('')}
            </div>
        </section>
    </div>
</body>
</html>`;
}

function openEditLead(id) {
  const l = state.leads.find(x => x.id === id);
  if (!l) return;
  document.getElementById('editLeadId').value = l.id;
  document.getElementById('modalTitle').textContent = 'Editar Lead';
  document.getElementById('leadName').value = l.name || '';
  document.getElementById('leadInstagram').value = l.instagram || '';
  const imgElE = document.getElementById('leadImage'); if (imgElE) imgElE.value = l.avatar || '';
  document.getElementById('leadBio').value = l.bio || '';
  document.getElementById('leadSpecialty').value = l.specialty || '';
  document.getElementById('leadCity').value = l.city || '';
  document.getElementById('leadWhatsapp').value = l.whatsapp || '';
  document.getElementById('leadStatus').value = l.status || 'coletado';
  document.getElementById('leadSiteLink').value = l.siteLink || '';
  document.getElementById('leadNotes').value = l.notes || '';

  updateModalAvatar(l.name, l.avatar);

  const v2DatesEl = document.getElementById('leadV2StageDates');
  if (v2DatesEl) {
    normalizeV2StageEntries(l);
    const entries = Array.isArray(l.v2StageEntries) ? l.v2StageEntries : [];
    const firstByStage = new Map();
    entries.forEach(e => {
      const st = String(e?.stageId || '').toLowerCase();
      const ts = toTsAny(e?.at);
      if (!st || !ts) return;
      const cur = firstByStage.get(st);
      if (!cur || ts < cur) firstByStage.set(st, ts);
    });
    const fmtDt = (ts) => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    const lines = (Array.isArray(DASH2_STAGES) ? DASH2_STAGES : []).map(s => {
      const ts = firstByStage.get(String(s.id || '').toLowerCase());
      return `${s.label}: ${ts ? fmtDt(ts) : '—'}`;
    });
    v2DatesEl.value = lines.join('\n');
  }

  // Expand form for editing
  const leadFormGrid = document.getElementById('leadFormGrid');
  const toggleLeadFormIcon = document.getElementById('toggleLeadFormIcon');
  if (leadFormGrid && toggleLeadFormIcon) {
    leadFormGrid.classList.remove('collapsed');
    toggleLeadFormIcon.classList.remove('rotate-180');
  }

  document.getElementById('leadModal').classList.add('open');
}

function openLeadTimeline(id) {
  const lead = state.leads.find(x => x.id === id);
  if (!lead) return;
  const modal = document.getElementById('leadTimelineModal');
  const titleEl = document.getElementById('leadTimelineTitle');
  const bodyEl = document.getElementById('leadTimelineBody');
  if (!modal || !titleEl || !bodyEl) return;

  modal.dataset.leadId = lead.id;
  titleEl.textContent = 'Timeline do Pipeline';

  const now = Date.now();
  const t = v2TimelineOf(lead, now);
  const totalMs = t.length ? Math.max(0, (t[t.length - 1].endAt || now) - (t[0].startAt || now)) : 0;
  const currentStageId = String(lead.pipelineStageV2 || 'coletados').toLowerCase();
  const currentMeta = stageMetaOf(currentStageId);

  bodyEl.innerHTML = `
    <div class="lead-timeline">
      <div class="lead-timeline-top">
        <div>
          <div class="lead-timeline-title">${lead.name || 'Lead Sem Nome'}</div>
          <div class="lead-timeline-sub">${lead.instagram ? lead.instagram : '—'}</div>
        </div>
        <div class="lead-timeline-summary">Total: ${fmtLeadDuration(totalMs)}</div>
      </div>
      <div class="lead-timeline-list">
        ${t.map(item => {
          const meta = stageMetaOf(item.stageId);
          const isNow = String(item.stageId || '').toLowerCase() === currentStageId && item.isCurrent;
          const canDelete = !isNow && t.length > 1;
          return `
            <div class="lead-timeline-item" style="border-left:3px solid ${meta.color};">
              <div class="lead-timeline-item-top">
                <div class="lead-timeline-stage">${meta.label}</div>
                <div class="lead-timeline-duration">${fmtLeadDuration(item.durMs)}</div>
              </div>
              <div class="lead-timeline-item-sub">
                <div class="lead-timeline-date">Entrou: ${fmtLeadDateTime(item.startAt)}</div>
                <div style="display:flex;gap:8px;align-items:center">
                  <div class="lead-timeline-pill">${isNow ? 'Atual' : 'Concluído'}</div>
                  ${canDelete ? `
                    <button class="modal-close" title="Excluir etapa do timeline" onclick="event.stopPropagation(); excludeV2TimelineEntry('${lead.id}', '${String(item.stageId || '').toLowerCase()}', ${Number(item.startAt) || 0})">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                        <path d="M10 11v6"></path>
                        <path d="M14 11v6"></path>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                      </svg>
                    </button>
                  ` : ``}
                </div>
              </div>
            </div>
          `;
        }).join('') || `
          <div class="lead-timeline-item">
            <div class="lead-timeline-item-top">
              <div class="lead-timeline-stage">${currentMeta.label}</div>
              <div class="lead-timeline-duration">—</div>
            </div>
            <div class="lead-timeline-item-sub">
              <div class="lead-timeline-date">Sem histórico suficiente</div>
              <div class="lead-timeline-pill">—</div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function excludeV2TimelineEntry(leadId, stageId, startAt) {
  const lead = state.leads.find(x => x.id === leadId);
  if (!lead) return;
  const st = String(stageId || '').trim().toLowerCase();
  const ts = toTsAny(startAt);
  if (!st || !ts) return;

  const curStageId = String(lead.pipelineStageV2 || 'coletados').toLowerCase();
  const curTs = toTsAny(lead.v2LastMovedAt);
  if (st === curStageId && curTs && ts === curTs) {
    toast('Não dá para excluir a etapa atual', 'error');
    return;
  }

  if (!confirm('Excluir esta etapa do timeline?')) return;
  if (!Array.isArray(lead.v2StageEntriesExclusions)) lead.v2StageEntriesExclusions = [];
  const key = `${st}|${ts}`;
  if (!lead.v2StageEntriesExclusions.includes(key)) lead.v2StageEntriesExclusions.push(key);

  if (Array.isArray(lead.v2StageEntries)) {
    lead.v2StageEntries = lead.v2StageEntries.filter(e => !(String(e?.stageId || '').toLowerCase() === st && toTsAny(e?.at) === ts));
  }

  save();
  renderDashboard();
  openLeadTimeline(lead.id);
}

function saveLead() {
  const name = document.getElementById('leadName').value.trim();
  if (!name) { alert('Nome é obrigatório'); return; }
  const id = document.getElementById('editLeadId').value;
  const data = {
    name,
    instagram: document.getElementById('leadInstagram').value.trim(),
    avatar: (document.getElementById('leadImage')?.value || '').trim(),
    bio: document.getElementById('leadBio').value.trim(),
    specialty: document.getElementById('leadSpecialty').value.trim(),
    city: document.getElementById('leadCity').value.trim(),
    whatsapp: document.getElementById('leadWhatsapp').value.trim(),
    attendance: document.getElementById('leadAttendance').value,
    tagline: document.getElementById('leadTagline').value.trim(),
    services: document.getElementById('leadServices').value.trim(),
    status: document.getElementById('leadStatus').value,
    siteLink: document.getElementById('leadSiteLink').value.trim(),
    notes: document.getElementById('leadNotes').value.trim(),
  };
  if (id) {
    const idx = state.leads.findIndex(x => x.id === id);
    if (idx !== -1) state.leads[idx] = { ...state.leads[idx], ...data };
    toast('Lead atualizado!');
  } else {
    const createdAt = Date.now();
    const status = data.status || 'coletado';
    const pipelineStage = status === 'fechado'
      ? 'fechado'
      : status === 'contatado'
        ? 'dm_enviada'
        : status === 'site_pronto'
          ? 'engajar'
          : 'engajar';
    state.leads.push({
      id: genId(),
      createdAt,
      pipelineStage,
      pipelineStageV2: 'coletados',
      v2LastMovedAt: createdAt,
      v2StageEntries: [{ stageId: 'coletados', at: createdAt }],
      history: [],
      ...data
    });
    toast('Lead adicionado!');
  }
  save();
  closeModal('leadModal');
  renderDashboard();
  renderLeadsTable();
  const leadsBadge = document.getElementById('leadsBadge');
  if (leadsBadge) leadsBadge.textContent = state.leads.length;
}

function archiveLead(id) {
  if (!confirm('Arquivar este lead?')) return;
  const idx = state.leads.findIndex(x => x.id === id);
  if (idx !== -1) {
    const lead = state.leads[idx];
    if (lead.status && lead.status !== 'arquivado' && !lead.statusBeforeArchive) {
      lead.statusBeforeArchive = lead.status;
    }
    state.leads[idx].status = 'arquivado';
    save();
    toast('Lead arquivado');
    setLeadsTab('arquivados');
    renderDashboard();
  }
}

function unarchiveLead(id) {
  const idx = state.leads.findIndex(x => x.id === id);
  if (idx === -1) return;
  const lead = state.leads[idx];

  const restore = lead.statusBeforeArchive && lead.statusBeforeArchive !== 'arquivado'
    ? lead.statusBeforeArchive
    : (lead.siteLink ? 'site_pronto' : 'coletado');

  lead.status = restore;
  if (lead.statusBeforeArchive) delete lead.statusBeforeArchive;

  save();
  toast('Lead desarquivado');
  setLeadsTab('ativos');
  renderDashboard();
}

function deleteLead(id) {
  if (!confirm('Remover este lead permanentemente?')) return;
  state.leads = state.leads.filter(x => x.id !== id);
  save();
  toast('Lead removido');
  renderLeadsTable();
  renderDashboard();
}

function initKanbanDnd() {
  document.querySelectorAll('.kanban-mini').forEach(mini => {
    if (!mini || mini.dataset.dndInit === '1') return;
    mini.dataset.dndInit = '1';

    let dragId = null;
    mini.addEventListener('dragstart', e => {
      const card = e.target.closest('.kanban-card');
      if (!card) return;
      dragId = card.getAttribute('data-id');
      card.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', dragId); } catch (_) { }
    });
    mini.addEventListener('dragend', e => {
      const card = e.target.closest('.kanban-card');
      if (card) card.classList.remove('dragging');
    });

    const map = {
      'kanban-coletado': 'coletado',
      'kanban-site': 'site_pronto',
      'kanban-contatado': 'contatado',
      'kanban-cobrado': 'cobrado',
      'kanban-arquivado': 'arquivado',
      'kanban-fechado': 'fechado',
      'kanbanp-coletado': 'coletado',
      'kanbanp-site': 'site_pronto',
      'kanbanp-contatado': 'contatado',
      'kanbanp-cobrado': 'cobrado',
      'kanbanp-arquivado': 'arquivado',
      'kanbanp-fechado': 'fechado'
    };

    const stageIdFromV2ColId = (colId) => {
      if (typeof colId !== 'string') return '';
      if (colId.startsWith('kanbanv2-')) return colId.slice('kanbanv2-'.length);
      if (colId.startsWith('kanbanv2m-')) return colId.slice('kanbanv2m-'.length);
      if (colId.startsWith('kanbanv3-')) return colId.slice('kanbanv3-'.length);
      return '';
    };

    mini.querySelectorAll('.kanban-cards').forEach(col => {
      col.addEventListener('dragover', e => {
        e.preventDefault();
        col.classList.add('drag-over');
      });
      col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
      col.addEventListener('drop', e => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const id = dragId || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null);
        if (!id) return;
        const stageId = stageIdFromV2ColId(col.id);
        if (stageId) {
          if (typeof moveLeadToStageDash2 === 'function') moveLeadToStageDash2(id, stageId);
          renderDashboard();
          if (typeof renderPipelineKanban === 'function') renderPipelineKanban();
          if (typeof renderPipelineStats === 'function') renderPipelineStats();
          return;
        }
        const status = map[col.id];
        if (!status) return;
        const idx = state.leads.findIndex(x => x.id === id);
        if (idx === -1) return;
        state.leads[idx].status = status;
        save();
        renderDashboard();
        renderPipelineKanban();
        renderPipelineStats();
      });
    });
  });
}

// ---- BIO ANALYZER ----
async function analyzeBio() {
  const bio = document.getElementById('bioInput').value.trim();
  if (!bio) { alert('Cole uma bio primeiro'); return; }

  const btn = document.getElementById('analyzeBioBtn');
  btn.textContent = 'Analisando...';
  btn.disabled = true;

  const resultPanel = document.getElementById('analyzerResult');

  try {
    let result;
    if (state.settings.geminiKey) {
      result = await analyzeWithGemini(bio);
    } else {
      result = analyzeLocal(bio);
    }
    renderAnalysisResult(result, resultPanel);
  } catch (e) {
    resultPanel.innerHTML = `<div style="color:var(--red);padding:16px">Erro: ${e.message}</div>`;
  } finally {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>Analisar com IA`;
    btn.disabled = false;
  }
}

async function analyzeWithGemini(bio) {
  const prompt = `Analise a bio de Instagram abaixo e extraia as seguintes informações em JSON puro (sem markdown, sem blocos de código):
{
  "nome": "nome completo ou nome de trabalho",
  "especialidade": "área de atuação principal",
  "cidade": "cidade/estado se mencionado",
  "atendimento": "online/presencial/ambos",
  "tom": "formal/informal/motivacional",
  "servicos": ["lista", "de", "serviços"],
  "keywords": ["palavras", "chave"],
  "whatsapp": "número se mencionado ou vazio"
}

BIO: ${bio}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.settings.geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates[0].content.parts[0].text.trim();
  return JSON.parse(text);
}

function analyzeLocal(bio) {
  const lower = bio.toLowerCase();
  const nome = bio.match(/dra?\.?\s+[A-ZÁÉÍÓÚÃÕÂÊÔ][a-záéíóúãõâêô]+(?:\s+[A-ZÁÉÍÓÚÃÕÂÊÔ][a-záéíóúãõâêô]+)?/)?.[0] || '';
  const especialidades = ['nutricionista', 'nutrição', 'nutri', 'esportiva', 'clínica', 'estética', 'infantil', 'funcional'];
  const esp = especialidades.filter(e => lower.includes(e)).map(e => e.charAt(0).toUpperCase() + e.slice(1));
  const cidades = ['são paulo', 'sp', 'rio', 'rj', 'belo horizonte', 'bh', 'curitiba', 'pr', 'brasília', 'df', 'salvador', 'recife', 'fortaleza', 'manaus', 'porto alegre'];
  const cidade = cidades.find(c => lower.includes(c)) || '';
  const online = lower.includes('online');
  const presencial = lower.includes('presencial');
  const atendimento = online && presencial ? 'Online e Presencial' : online ? 'Online' : presencial ? 'Presencial' : 'A consultar';
  const servicos = [];
  if (lower.includes('emagrecimento') || lower.includes('emagrecer')) servicos.push('Emagrecimento');
  if (lower.includes('performance') || lower.includes('atleta')) servicos.push('Performance Esportiva');
  if (lower.includes('dieta') || lower.includes('plano alimentar')) servicos.push('Plano Alimentar');
  if (lower.includes('suplementação') || lower.includes('suplemento')) servicos.push('Suplementação');
  if (lower.includes('gestante') || lower.includes('gestação')) servicos.push('Nutrição Gestacional');
  if (lower.includes('infantil') || lower.includes('criança')) servicos.push('Nutrição Infantil');
  const whatsapp = bio.match(/\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/)?.[0] || '';
  return {
    nome,
    especialidade: esp.join(', ') || 'Nutricionista',
    cidade: cidade ? cidade.charAt(0).toUpperCase() + cidade.slice(1) : '',
    atendimento,
    tom: lower.includes('❤') || lower.includes('😊') || lower.includes('✨') ? 'Informal/Caloroso' : 'Profissional',
    servicos: servicos.length ? servicos : ['Consultoria Nutricional'],
    keywords: esp,
    whatsapp
  };
}

function renderAnalysisResult(data, panel) {
  const handle = document.getElementById('instaHandle').value.trim();
  const canAddLead = data.nome;

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <h3 style="font-size:16px;font-weight:700">Dados Extraídos</h3>
      ${canAddLead ? `<button class="btn-primary" style="font-size:12px;padding:7px 14px" onclick='addLeadFromAnalysis(${JSON.stringify(data).replace(/'/g, "&#39;")},"${handle}")'>+ Adicionar Lead</button>` : ''}
    </div>
    <div class="result-card"><div class="result-card-title">Nome</div><div class="result-card-value">${data.nome || '—'}</div></div>
    <div class="result-card"><div class="result-card-title">Especialidade</div><div class="result-card-value">${data.especialidade || '—'}</div></div>
    <div class="result-card"><div class="result-card-title">Cidade</div><div class="result-card-value">${data.cidade || 'Não identificada'}</div></div>
    <div class="result-card"><div class="result-card-title">Atendimento</div><div class="result-card-value">${data.atendimento || 'A consultar'}</div></div>
    <div class="result-card"><div class="result-card-title">Tom de Comunicação</div><div class="result-card-value">${data.tom || '—'}</div></div>
    ${data.whatsapp ? `<div class="result-card"><div class="result-card-title">WhatsApp</div><div class="result-card-value">${data.whatsapp}</div></div>` : ''}
    ${data.servicos?.length ? `<div class="result-card"><div class="result-card-title">Serviços Identificados</div><div class="result-tags">${data.servicos.map(s => `<span class="result-tag">${s}</span>`).join('')}</div></div>` : ''}
    ${data.keywords?.length ? `<div class="result-card"><div class="result-card-title">Keywords</div><div class="result-tags">${data.keywords.map(k => `<span class="result-tag">${k}</span>`).join('')}</div></div>` : ''}
  `;
}

function addLeadFromAnalysis(data, handle) {
  const lead = {
    id: genId(),
    createdAt: Date.now(),
    name: data.nome || 'Sem nome',
    instagram: handle || '',
    bio: document.getElementById('bioInput').value.trim(),
    specialty: data.especialidade || '',
    city: data.cidade || '',
    whatsapp: data.whatsapp || '',
    attendance: data.atendimento || 'Online e Presencial',
    tagline: '',
    services: (data.servicos || []).join('\n'),
    status: 'coletado',
    siteLink: '',
    notes: `Tom: ${data.tom || ''}`
  };
  state.leads.push(lead);
  save();
  const leadsBadge = document.getElementById('leadsBadge');
  if (leadsBadge) leadsBadge.textContent = state.leads.length;
  toast('Lead adicionado a partir da análise!');
}

// ---- SITE GENERATOR ----
function populateGenLeadSelect() {
  const sel = document.getElementById('genLeadSelect');
  sel.innerHTML = '<option value="">— Preencher manualmente —</option>' +
    state.leads.map(l => `<option value="${l.id}">${l.name} ${l.instagram ? `(${l.instagram})` : ''}</option>`).join('');
}

document.addEventListener('change', e => {
  if (e.target.id === 'genLeadSelect') {
    const id = e.target.value;
    const avatarContainer = document.getElementById('genSelectedAvatar');
    const avatarImg = avatarContainer.querySelector('img');
    const avatarFallback = avatarContainer.querySelector('.avatar-fallback');

    if (!id) {
      avatarContainer.style.display = 'none';
      document.getElementById('genName').value = '';
      document.getElementById('genSpecialty').value = '';
      document.getElementById('genCity').value = '';
      document.getElementById('genWhatsapp').value = '';
      document.getElementById('genInstagram').value = '';
      document.getElementById('genAvatar').value = '';
      document.getElementById('genAttendance').value = 'Online e Presencial';
      document.getElementById('genTagline').value = '';
      document.getElementById('genServices').value = '';
      return;
    }

    const l = state.leads.find(x => x.id === id);
    if (!l) return;

    // Show avatar
    avatarContainer.style.display = 'flex';
    const initials = (l.name || '?').trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
    avatarFallback.textContent = initials;

    if (l.avatar) {
      avatarImg.src = l.avatar;
      avatarImg.style.display = 'block';
    } else {
      avatarImg.src = '';
      avatarImg.style.display = 'none';
    }

    document.getElementById('genName').value = l.name || '';
    document.getElementById('genSpecialty').value = l.specialty || '';
    document.getElementById('genCity').value = l.city || '';
    document.getElementById('genWhatsapp').value = l.whatsapp || '';
    document.getElementById('genInstagram').value = l.instagram || '';
    document.getElementById('genAvatar').value = l.avatar || '';

    // New fields
    if (l.attendance) document.getElementById('genAttendance').value = l.attendance;
    document.getElementById('genTagline').value = l.tagline || '';
    document.getElementById('genServices').value = l.services || '';
  }
});

// Update avatar when manually pasting URL
document.getElementById('genAvatar').addEventListener('input', e => {
  const url = e.target.value.trim();
  const avatarContainer = document.getElementById('genSelectedAvatar');
  const avatarImg = avatarContainer.querySelector('img');

  // Also update current lead if selected
  const leadId = document.getElementById('genLeadSelect').value;
  if (leadId) {
    const l = state.leads.find(x => x.id === leadId);
    if (l) {
      l.avatar = url;
      saveState();
      renderDashboard(); // Refresh Kanban cards
    }
  }

  if (url) {
    avatarContainer.style.display = 'flex';
    avatarImg.src = url;
    avatarImg.style.display = 'block';
  } else if (!leadId) {
    avatarContainer.style.display = 'none';
    avatarImg.src = '';
    avatarImg.style.display = 'none';
  } else {
    // If has lead but no URL, fallback to initials
    avatarImg.style.display = 'none';
  }
});

// ---- CUSTOM TEMPLATES ----

const BUILTIN_TEMPLATES = [
  { id: 'minimal', name: 'Minimal', generator: generateMinimal },
  { id: 'premium', name: 'Premium', generator: generatePremium },
  { id: 'modern', name: 'Moderno', generator: generateModern },
  { id: 'elite', name: 'Élite ✦', generator: generateElite },
  { id: 'clinic', name: 'Clínica ✦', generator: generateClinica },
  { id: 'nutri', name: 'Nutri Premium ✦', generator: generateNutri }
];

// ---- SISTEMA DE BLOCOS — funções ----

function getRecipeForSpecialty(specialty) {
  const s = (specialty || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const key of Object.keys(SECTION_RECIPES)) {
    if (key === '_default') continue;
    if (s.includes(key)) return SECTION_RECIPES[key];
  }
  return SECTION_RECIPES._default;
}

function applyRecipe() {
  const specialty = (document.getElementById('genSpecialty') || {}).value || '';
  state.selectedSections = [...getRecipeForSpecialty(specialty)];
  renderSectionPicker();
}

function toggleSectionCategory(category, enabled) {
  // Remove all of this category
  state.selectedSections = state.selectedSections.filter(id => {
    const sec = SECTION_LIBRARY.find(s => s.id === id);
    return sec && sec.category !== category;
  });
  if (enabled) {
    // Add first variant of that category
    const first = SECTION_LIBRARY.find(s => s.category === category);
    if (first) state.selectedSections.push(first.id);
  }
  renderSectionPicker();
}

function selectSectionVariant(category, newId) {
  // Replace existing section of this category OR add if not present
  const hasCategory = state.selectedSections.some(id => {
    const sec = SECTION_LIBRARY.find(s => s.id === id);
    return sec && sec.category === category;
  });
  if (hasCategory) {
    state.selectedSections = state.selectedSections.map(id => {
      const sec = SECTION_LIBRARY.find(s => s.id === id);
      return sec && sec.category === category ? newId : id;
    });
  } else {
    state.selectedSections.push(newId);
  }
  renderSectionPicker();
}

function renderSectionHtml(section, data) {
  const wa = (data.whatsapp || '').replace(/\D/g, '');
  const initials = (data.name || 'AA').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const photo = (data.avatar || (data.images && data.images[0]) || '');
  const igClean = (data.instagram || '').replace('@', '');

  // Build services_cards_html
  const services = data.services || [];
  const servicesCardsHtml = services.map((s, i) =>
    `<div class="sc-card sec-hover-lift"><div class="sc-num">0${i + 1}</div><div class="sc-name">${s}</div></div>`
  ).join('');
  const servicesListaHtml = services.map(s =>
    `<div class="sl-item"><div class="sl-dot"></div><div class="sl-name">${s}</div></div>`
  ).join('');

  let html = section.html;

  // Mustache-like conditionals (use \^\^ to avoid ^ being treated as anchor)
  if (photo) {
    html = html.replace(/\{\{#photo\}\}([\s\S]*?)\{\{\/photo\}\}/g, '$1');
    html = html.replace(/\{\{\^photo\}\}([\s\S]*?)\{\{\/photo\}\}/g, '');
  } else {
    html = html.replace(/\{\{#photo\}\}([\s\S]*?)\{\{\/photo\}\}/g, '');
    html = html.replace(/\{\{\^photo\}\}([\s\S]*?)\{\{\/photo\}\}/g, '$1');
  }
  if (data.instagram) {
    html = html.replace(/\{\{#instagram\}\}([\s\S]*?)\{\{\/instagram\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#instagram\}\}([\s\S]*?)\{\{\/instagram\}\}/g, '');
  }
  if (data.city) {
    html = html.replace(/\{\{#city\}\}([\s\S]*?)\{\{\/city\}\}/g, '$1');
  } else {
    html = html.replace(/\{\{#city\}\}([\s\S]*?)\{\{\/city\}\}/g, '');
  }

  // Replace all variables
  html = html
    .replace(/{{name}}/g, data.name || '')
    .replace(/{{specialty}}/g, data.specialty || '')
    .replace(/{{city}}/g, data.city || '')
    .replace(/{{tagline}}/g, data.tagline || '')
    .replace(/{{bio}}/g, data.bio || '')
    .replace(/{{cta}}/g, data.cta || 'Agendar consulta')
    .replace(/{{whatsapp}}/g, data.whatsapp || '')
    .replace(/{{whatsapp_clean}}/g, wa)
    .replace(/{{instagram}}/g, data.instagram || '')
    .replace(/{{instagram_clean}}/g, igClean)
    .replace(/{{attendance}}/g, data.attendance || 'presencial')
    .replace(/{{photo}}/g, photo)
    .replace(/{{initials}}/g, initials)
    .replace(/{{services_cards_html}}/g, servicesCardsHtml)
    .replace(/{{services_lista_html}}/g, servicesListaHtml);

  return html;
}

function assembleFromSections(selectedIds, data) {
  // Render sections in canonical category order
  const orderedIds = [];
  for (const cat of SECTION_CATEGORIES) {
    const id = selectedIds.find(sid => {
      const sec = SECTION_LIBRARY.find(s => s.id === sid);
      return sec && sec.category === cat;
    });
    if (id) orderedIds.push(id);
  }

  const sectionsHtml = orderedIds.map(id => {
    const sec = SECTION_LIBRARY.find(s => s.id === id);
    if (!sec) return '';
    return renderSectionHtml(sec, data);
  }).join('\n');

  const name = data.name || '';
  const specialty = data.specialty || '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}${specialty ? ' | ' + specialty : ''}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
<style>${SECTIONS_BASE_CSS}</style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;
}

function renderSectionPicker() {
  const container = document.getElementById('templateSelectorContainer');
  if (!container) return;
  container.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:20px;padding:4px 0';

  for (const cat of SECTION_CATEGORIES) {
    const variants = SECTION_LIBRARY.filter(s => s.category === cat);
    const activeId = state.selectedSections.find(id => {
      const sec = SECTION_LIBRARY.find(s => s.id === id);
      return sec && sec.category === cat;
    });
    const isEnabled = !!activeId;

    const catLabels = { hero: 'Hero', bio: 'Bio / Sobre', servicos: 'Serviços', cta: 'CTA / Contato' };
    const catLabel = catLabels[cat] || cat;

    const catRow = document.createElement('div');

    // Category header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px';
    header.innerHTML = `
      <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.5px">${catLabel}</span>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:${isEnabled ? '#c4b5fd' : 'var(--text-muted)'}">
        <input type="checkbox" ${isEnabled ? 'checked' : ''} style="accent-color:#7C3AED;width:14px;height:14px"
          onchange="toggleSectionCategory('${cat}', this.checked)">
        ${isEnabled ? 'Ativo' : 'Inativo'}
      </label>`;
    catRow.appendChild(header);

    // Variant thumbnails
    const varRow = document.createElement('div');
    varRow.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px';

    for (const sec of variants) {
      const isActive = activeId === sec.id;
      const card = document.createElement('div');
      card.style.cssText = `
        padding:12px;border-radius:10px;cursor:pointer;border:2px solid ${isActive ? '#7C3AED' : 'rgba(255,255,255,.07)'};
        background:${isActive ? 'rgba(124,58,237,.12)' : 'rgba(255,255,255,.03)'};transition:.15s;
        ${!isEnabled ? 'opacity:.4;pointer-events:none' : ''}`;
      card.innerHTML = `
        <div style="font-size:11px;font-weight:700;color:${isActive ? '#c4b5fd' : 'var(--text-muted)'};margin-bottom:4px">${sec.name}</div>
        <div style="font-size:10px;color:${isActive ? 'rgba(196,181,253,.7)' : 'rgba(255,255,255,.25)'};line-height:1.4">${sec.preview}</div>
        ${isActive ? '<div style="margin-top:8px;font-size:9px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:1px">● Ativo</div>' : ''}`;
      card.onclick = () => selectSectionVariant(cat, sec.id);
      varRow.appendChild(card);
    }
    catRow.appendChild(varRow);
    wrap.appendChild(catRow);
  }

  // Auto-recipe button
  const autoBtn = document.createElement('button');
  autoBtn.innerHTML = '🎯 Auto-selecionar por especialidade';
  autoBtn.style.cssText = 'width:100%;padding:9px;border:1px dashed rgba(124,58,237,.3);border-radius:8px;background:transparent;color:#9b77e0;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;margin-top:4px';
  autoBtn.onmouseover = () => { autoBtn.style.borderColor = 'rgba(124,58,237,.6)'; autoBtn.style.color = '#c4b5fd'; };
  autoBtn.onmouseout = () => { autoBtn.style.borderColor = 'rgba(124,58,237,.3)'; autoBtn.style.color = '#9b77e0'; };
  autoBtn.onclick = applyRecipe;
  wrap.appendChild(autoBtn);

  container.appendChild(wrap);
}

function renderGeneratorModeToggle() {
  let el = document.getElementById('generatorModeToggle');
  if (!el) return;
  const isBlocos = state.generatorMode === 'blocos';
  el.innerHTML = `
    <button class="mode-btn ${!isBlocos ? 'active' : ''}" id="modeBtnTemplate" onclick="setGeneratorMode('template')">Template</button>
    <button class="mode-btn ${isBlocos ? 'active' : ''}" id="modeBtnBlocos" onclick="setGeneratorMode('blocos')">Blocos</button>`;
}

function setGeneratorMode(mode) {
  state.generatorMode = mode;
  renderGeneratorModeToggle();
  const container = document.getElementById('templateSelectorContainer');
  if (!container) return;
  if (mode === 'blocos') {
    if (!state.selectedSections.length) applyRecipe();
    else renderSectionPicker();
  } else {
    renderGeneratorTemplates();
  }
}

function renderGeneratorTemplates() {
  const container = document.getElementById('templateSelector');
  if (!container) return;

  // Clear existing templates (both built-in and custom) to render uniformly
  container.innerHTML = '';

  const allTemplates = [
    ...BUILTIN_TEMPLATES,
    ...state.customTemplates.map(t => ({ ...t, isCustom: true }))
  ];

  const previewData = {
    name: "Dra. Ana",
    specialty: "Nutri",
    city: "SP",
    attendance: "Online",
    tagline: "Saúde e Bem-estar",
    services: ["Consulta", "Dieta"],
    whatsapp: "11999999999",
    instagram: "@ana.nutri",
    avatar: ""
  };

  allTemplates.forEach(t => {
    const el = document.createElement('div');
    el.className = 'template-option';
    if (t.isCustom) el.classList.add('custom-template-option');
    el.dataset.template = t.id;

    // Generate HTML for preview
    let html = '';
    try {
      if (t.isCustom) {
        html = generateCustomTemplate(t.html, previewData);
      } else {
        html = t.generator(previewData);
      }
    } catch (e) {
      console.error("Error generating preview for", t.name, e);
      html = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:10px;">Erro</div>';
    }

    // Create iframe preview
    el.innerHTML = `
      <div class="template-preview" style="position: relative; overflow: hidden; background: #fff; border: 1px solid #eee;">
        <iframe 
          scrolling="no" 
          loading="lazy"
          style="width: 400%; height: 400%; transform: scale(0.25); transform-origin: 0 0; border: none; pointer-events: none; background: #fff;"
          srcdoc="${html.replace(/"/g, '&quot;')}"
        ></iframe>
        <div style="position: absolute; inset: 0; z-index: 10; cursor: pointer;"></div>
      </div>
      <span>${t.name}</span>
    `;

    el.addEventListener('click', () => {
      document.querySelectorAll('.template-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      state.selectedTemplate = t.id;
    });

    if (state.selectedTemplate === t.id) el.classList.add('selected');

    container.appendChild(el);
  });
}

function addCustomTemplate(nameVal, htmlVal, typeVal, onSuccess) {
  // Suporta chamada antiga sem typeVal: addCustomTemplate(name, html, callback)
  if (typeof typeVal === 'function') { onSuccess = typeVal; typeVal = null; }

  const name = nameVal || (document.getElementById('newTemplateName') ? document.getElementById('newTemplateName').value.trim() : '');
  const html = htmlVal || (document.getElementById('newTemplateHtml') ? document.getElementById('newTemplateHtml').value.trim() : '');

  if (!name || !html) {
    toast('Preencha nome e HTML do template');
    return false;
  }

  const newTemplate = {
    id: 'custom_' + Date.now(),
    name,
    html,
    type: typeVal || 'landing_servicos'
  };

  state.customTemplates.push(newTemplate);
  save();
  renderGeneratorTemplates();

  if (document.getElementById('newTemplateName')) document.getElementById('newTemplateName').value = '';
  if (document.getElementById('newTemplateHtml')) document.getElementById('newTemplateHtml').value = '';
  toast('✅ Template adicionado!');
  if (typeof onSuccess === 'function') onSuccess();
  return true;
}

function deleteCustomTemplate(id) {
  if (!confirm('Excluir este template? Esta ação não pode ser desfeita.')) return;
  state.customTemplates = state.customTemplates.filter(t => t.id !== id);
  save();
  renderGeneratorTemplates();
  // Refresh biblioteca se estiver aberta
  if (document.getElementById('lib-section-landing')) {
    const activeTab = document.querySelector('.library-tab.active');
    if (activeTab && window._libCategory) {
      // Trigger re-render in lab-library context
      if (typeof window._labRenderTemplateLibrary === 'function') window._labRenderTemplateLibrary(window._libCategory);
    }
  }
  toast('Template excluído.');
}

function openNewTemplateModal() {
  const overlay = document.createElement('div');
  overlay.id = 'new-template-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

  const modal = document.createElement('div');
  modal.style.cssText = 'background:#13131f;border:1px solid rgba(255,255,255,.1);border-radius:16px;width:100%;max-width:820px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;';

  // Helper: build type dropdown options
  function buildTypeOptions(selectedName) {
    const allTypes = [...BUILTIN_TEMPLATE_TYPES, ...(state.templateTypes || [])];
    return allTypes.map(t =>
      `<option value="${t.name}" ${t.name === selectedName ? 'selected' : ''}>${t.label}</option>`
    ).join('');
  }

  modal.innerHTML = `
    <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div>
        <div style="font-size:16px;font-weight:700;color:#e0e0e0;">+ Novo Template de Landing Page</div>
        <div id="ntm-subtitle" style="font-size:12px;color:#6b6b80;margin-top:2px;">Passo 1 de 2 — Cole o HTML e converta as variáveis</div>
      </div>
      <button id="ntm-close" style="background:transparent;border:none;color:#6b6b80;font-size:22px;cursor:pointer;line-height:1;">✕</button>
    </div>

    <!-- STEP 1 -->
    <div id="ntm-step1" style="padding:16px 20px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:14px;">
      <div>
        <label style="display:block;font-size:13px;font-weight:600;color:#c0c0d0;margin-bottom:6px;">Nome do Template</label>
        <input id="ntm-name" type="text" placeholder="Ex: Landing Nutricionista Dark" style="width:100%;padding:10px 14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#e0e0e0;font-size:14px;outline:none;box-sizing:border-box;">
      </div>
      <div style="flex:1;">
        <label style="display:block;font-size:13px;font-weight:600;color:#c0c0d0;margin-bottom:6px;">Código HTML</label>
        <textarea id="ntm-html" placeholder="Cole o HTML completo aqui. Use {{nome}}, {{bio}}, {{tagline}}, {{servicos}}, {{foto}}, {{whatsapp}}, {{instagram}}, {{cta}}..." style="width:100%;height:280px;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#c0c0d0;font-family:monospace;font-size:12px;outline:none;resize:vertical;box-sizing:border-box;"></textarea>
        <div style="font-size:11px;color:#5a5a70;margin-top:6px;">Variáveis disponíveis: {{nome}}, {{bio}}, {{tagline}}, {{servico_1}}, {{servicos}}, {{foto}}, {{cta}}, {{whatsapp}}, {{instagram}}, {{especialidade}}, {{cidade}}</div>
      </div>
    </div>

    <!-- STEP 2 (hidden initially) -->
    <div id="ntm-step2" style="padding:16px 20px;overflow-y:auto;flex:1;display:none;flex-direction:column;gap:16px;">
      <div id="ntm-detected-vars" style="background:rgba(124,58,237,.08);border:1px solid rgba(124,58,237,.25);border-radius:10px;padding:12px 14px;">
        <div style="font-size:12px;font-weight:600;color:#a78bfa;margin-bottom:8px;">⚡ Variáveis detectadas:</div>
        <div id="ntm-vars-list" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
      </div>
      <div style="font-size:14px;font-weight:600;color:#c0c0d0;margin-bottom:4px;">Como deseja classificar este template?</div>
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
        <input type="radio" name="ntm-type-choice" value="existing" checked style="accent-color:#7c3aed;">
        <span style="color:#e0e0e0;font-size:13px;">Usar tipo existente</span>
      </label>
      <div id="ntm-existing-block" style="padding-left:26px;">
        <select id="ntm-type-select" style="width:100%;padding:9px 12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:8px;color:#e0e0e0;font-size:13px;outline:none;">
          ${buildTypeOptions('landing_servicos')}
        </select>
      </div>
      <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
        <input type="radio" name="ntm-type-choice" value="new" style="accent-color:#7c3aed;">
        <span style="color:#e0e0e0;font-size:13px;">Criar novo tipo</span>
      </label>
      <div id="ntm-new-block" style="padding-left:26px;display:none;">
        <input id="ntm-new-type-name" type="text" placeholder="Nome do tipo (ex: landing_fisio)" style="width:100%;padding:9px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#e0e0e0;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:10px;">
        <input id="ntm-new-type-label" type="text" placeholder="Rótulo visível (ex: Landing Fisioterapia)" style="width:100%;padding:9px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#e0e0e0;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:10px;">
        <div style="font-size:12px;color:#6b6b80;margin-bottom:8px;">Campos incluídos neste tipo:</div>
        <div id="ntm-field-checkboxes" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
      </div>
    </div>

    <div id="ntm-footer" style="padding:12px 20px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;">
      <button id="ntm-convert" class="btn-secondary" style="flex:1;min-width:140px;">⚡ Converter Variáveis</button>
      <button id="ntm-save" style="flex:1;min-width:140px;padding:10px;background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;border-radius:8px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;display:none;">💾 Salvar Template</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const nameEl  = modal.querySelector('#ntm-name');
  const htmlEl  = modal.querySelector('#ntm-html');
  const step1   = modal.querySelector('#ntm-step1');
  const step2   = modal.querySelector('#ntm-step2');
  const footer  = modal.querySelector('#ntm-footer');
  const subtitle = modal.querySelector('#ntm-subtitle');
  const close   = () => overlay.remove();

  modal.querySelector('#ntm-close').onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  // Radio toggle
  modal.querySelectorAll('input[name="ntm-type-choice"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const isNew = radio.value === 'new';
      modal.querySelector('#ntm-existing-block').style.display = isNew ? 'none' : 'block';
      modal.querySelector('#ntm-new-block').style.display      = isNew ? 'block' : 'none';
    });
  });

  let detectedVars = [];

  // Step 1 → Step 2 transition
  modal.querySelector('#ntm-convert').onclick = () => {
    const html = htmlEl.value.trim();
    if (!html) { toast('Cole o HTML primeiro!'); return; }
    let result;
    try {
      result = convertHTMLToTemplate(html);
      htmlEl.value = result.html;
    } catch(e) { toast('Erro ao converter HTML.'); return; }

    detectedVars = result.variables || [];

    // Fill detected vars display
    const varsList = modal.querySelector('#ntm-vars-list');
    varsList.innerHTML = detectedVars.length
      ? detectedVars.map(v => `<span style="background:rgba(124,58,237,.15);color:#a78bfa;padding:3px 8px;border-radius:5px;font-size:12px;font-family:monospace;">{{${v}}}</span>`).join('')
      : '<span style="color:#6b6b80;font-size:12px;">Nenhuma variável detectada</span>';

    // Build checkboxes for "create new type"
    const ALL_VARS = ['nome','especialidade','tagline','bio','servico_1','servico_2','servico_3','servico_4','cta','whatsapp','instagram','foto','cidade','atendimento'];
    const checkboxContainer = modal.querySelector('#ntm-field-checkboxes');
    checkboxContainer.innerHTML = ALL_VARS.map(v => {
      const checked = detectedVars.includes(v) ? 'checked' : '';
      return `<label style="display:flex;align-items:center;gap:5px;cursor:pointer;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:6px;padding:4px 10px;">
        <input type="checkbox" value="${v}" ${checked} style="accent-color:#7c3aed;">
        <span style="font-size:12px;font-family:monospace;color:#c0c0d0;">{{${v}}}</span>
      </label>`;
    }).join('');

    // Refresh type dropdown (in case new types were added)
    modal.querySelector('#ntm-type-select').innerHTML = buildTypeOptions('landing_servicos');

    // Show step 2
    step1.style.display = 'none';
    step2.style.display = 'flex';
    subtitle.textContent = 'Passo 2 de 2 — Classifique o template';
    modal.querySelector('#ntm-convert').style.display = 'none';
    modal.querySelector('#ntm-save').style.display = 'block';
  };

  // Salvar
  modal.querySelector('#ntm-save').onclick = () => {
    const name = nameEl.value.trim();
    const html = htmlEl.value.trim();
    if (!name) { toast('Dê um nome ao template!'); nameEl.focus(); return; }
    if (!html)  { toast('O HTML não pode estar vazio!'); return; }

    const choice = modal.querySelector('input[name="ntm-type-choice"]:checked').value;
    let typeVal;

    if (choice === 'existing') {
      typeVal = modal.querySelector('#ntm-type-select').value;
    } else {
      // Create new type
      const typeName  = modal.querySelector('#ntm-new-type-name').value.trim().replace(/\s+/g,'_').toLowerCase();
      const typeLabel = modal.querySelector('#ntm-new-type-label').value.trim();
      if (!typeName || !typeLabel) { toast('Preencha o nome e rótulo do novo tipo!'); return; }
      const checkedFields = [...modal.querySelectorAll('#ntm-field-checkboxes input:checked')].map(cb => cb.value);
      if (!checkedFields.length) { toast('Selecione pelo menos 1 campo para o novo tipo!'); return; }
      const newType = { name: typeName, label: typeLabel, fields: checkedFields };
      if (!Array.isArray(state.templateTypes)) state.templateTypes = [];
      state.templateTypes.push(newType);
      typeVal = typeName;
    }

    addCustomTemplate(name, html, typeVal, () => {
      if (typeof window._labRenderTemplateLibrary === 'function') {
        window._labRenderTemplateLibrary('landing');
      }
      close();
    });
  };

  nameEl.focus();
}

function convertHTMLToTemplate(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const variables = new Set();

  // Helper to process text nodes
  function processText(node) {
    if (node.nodeType === 3) { // Text node
      let text = node.nodeValue;
      let changed = false;

      // 1. Detect Name (Doutor Name, Dr. Name, etc)
      const nameTitles = ['Doutor', 'Doutora', 'Dr\\.', 'Dra\\.', 'Dr', 'Dra', 'Clínica', 'Nutricionista'];
      const nameRegex = new RegExp(`(${nameTitles.join('|')})\\s+([A-ZÀ-ÿ][a-zà-ÿ]+(?:\\s[A-ZÀ-ÿ][a-zà-ÿ]+)?)`, 'g');
      if (nameRegex.test(text)) {
        text = text.replace(nameRegex, '{{nome}}');
        variables.add('nome');
        changed = true;
      }

      // 2. Detect City (em City)
      const cityRegex = /(\bem\s+)(São Paulo|Curitiba|Rio de Janeiro|Belo Horizonte|Brasília|Salvador|Fortaleza|Recife|Porto Alegre|Manaus|[A-ZÀ-ÿ][a-zà-ÿ]+(?:\s[A-ZÀ-ÿ][a-zà-ÿ]+)?)/g;
      if (cityRegex.test(text)) {
        text = text.replace(cityRegex, '$1{{cidade}}');
        variables.add('cidade');
        changed = true;
      }

      // 3. Detect Specialty Keywords
      const specialties = ['nutricionista', 'dentista', 'psicólogo', 'psicóloga', 'fisioterapeuta', 'médico', 'médica', 'advogado', 'advogada', 'personal trainer', 'coach'];
      specialties.forEach(sp => {
        const spRegex = new RegExp(`\\b${sp}\\b`, 'gi');
        if (spRegex.test(text)) {
          text = text.replace(spRegex, '{{especialidade}}');
          variables.add('especialidade');
          changed = true;
        }
      });

      // 4. Detect Attendance Keywords
      const attendanceKeywords = ['Atendimento online', 'Atendimento presencial', 'Online e presencial', 'Consultas online', 'Atendo online'];
      attendanceKeywords.forEach(kw => {
        const kwRegex = new RegExp(kw, 'gi');
        if (kwRegex.test(text)) {
          text = text.replace(kwRegex, '{{atendimento}}');
          variables.add('atendimento');
          changed = true;
        }
      });

      if (changed) node.nodeValue = text;
    } else if (node.nodeType === 1) { // Element node
      // Skip script and style tags content processing
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;

      // Recursively process child nodes
      Array.from(node.childNodes).forEach(processText);

      // 4. Process Attributes

      // WhatsApp Links in href
      if (node.tagName === 'A' && node.hasAttribute('href')) {
        const href = node.getAttribute('href');
        const waRegex = /(https?:\/\/(?:wa\.me|api\.whatsapp\.com)\/(?:send\?phone=)?)(\d+)/;
        if (waRegex.test(href)) {
          node.setAttribute('href', href.replace(waRegex, '$1{{whatsapp}}'));
          variables.add('whatsapp');
        }
        // Instagram links in href
        const igRegex = /https?:\/\/(?:www\.)?instagram\.com\/([^/?#"'\s]+)/;
        if (igRegex.test(href)) {
          node.setAttribute('href', href.replace(igRegex, 'https://instagram.com/{{instagram}}'));
          variables.add('instagram');
        }
      }
    }
  }

  // Pre-process Images to assign unique IDs
  const imgs = doc.querySelectorAll('img');
  imgs.forEach((img, index) => {
    if (!img.src.includes('{{')) {
      const varName = index === 0 ? '{{foto_hero}}' : `{{foto_${index}}}`;
      img.setAttribute('src', varName);
      variables.add(varName.replace(/{{|}}/g, ''));
    }
  });

  // Process Text and Links - Start from documentElement to cover everything
  processText(doc.documentElement);

  // 5b. Detect BIO — parágrafo mais longo (80+ palavras), exceto footer/nav/header
  const skipTags = new Set(['SCRIPT','STYLE','NAV','FOOTER','HEADER']);
  let longestP = null, longestWords = 0;
  doc.querySelectorAll('p').forEach(p => {
    let ancestor = p.parentElement;
    while (ancestor) { if (skipTags.has(ancestor.tagName)) return; ancestor = ancestor.parentElement; }
    const words = (p.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    if (words > longestWords && words >= 30) { longestWords = words; longestP = p; }
  });
  if (longestP) {
    longestP.innerHTML = '{{bio}}';
    variables.add('bio');
  }

  // 5c. Detect TAGLINE — primeiro h2 ou h3 com 3-20 palavras que não seja nome
  const hEls = doc.querySelectorAll('h2, h3');
  for (const h of hEls) {
    const txt = (h.textContent || '').trim();
    const wc = txt.split(/\s+/).filter(Boolean).length;
    if (wc >= 3 && wc <= 20 && !txt.includes('{{nome}}')) {
      h.innerHTML = '{{tagline}}';
      variables.add('tagline');
      break; // só o primeiro
    }
  }

  // 5d. Detect SERVIÇOS — lista (ul/ol) com 3+ itens curtos (2-8 palavras cada)
  const lists = doc.querySelectorAll('ul, ol');
  for (const ul of lists) {
    const items = Array.from(ul.querySelectorAll('li'));
    if (items.length >= 3) {
      const allShort = items.every(li => {
        const wc = (li.textContent||'').trim().split(/\s+/).filter(Boolean).length;
        return wc >= 1 && wc <= 10;
      });
      if (allShort) {
        items.forEach((li, idx) => {
          li.innerHTML = `{{servico_${idx+1}}}`;
          variables.add(`servico_${idx+1}`);
        });
        break; // só a primeira lista de serviços
      }
    }
  }

  // 5. Detect existing variables ({{...}}) in the final string
  let finalHtml = doc.documentElement.outerHTML;

  // Ensure Doctype is present if it looks like a full page
  if (!finalHtml.toLowerCase().startsWith('<!doctype')) {
    finalHtml = '<!DOCTYPE html>\n' + finalHtml;
  }

  const existingVars = finalHtml.match(/{{(.*?)}}/g);
  if (existingVars) {
    existingVars.forEach(v => variables.add(v.replace(/{{|}}/g, '')));
  }

  return { html: finalHtml, variables: Array.from(variables) };
}

function generateCustomTemplate(html, data) {
  let output = html;
  output = output.replace(/{{nome}}/g, data.name || '');
  output = output.replace(/{{especialidade}}/g, data.specialty || '');
  output = output.replace(/{{cidade}}/g, data.city || '');
  output = output.replace(/{{instagram}}/g, data.instagram || '');
  output = output.replace(/{{whatsapp}}/g, data.whatsapp || '');
  output = output.replace(/{{bio}}/g, data.bio || '');
  output = output.replace(/{{tagline}}/g, data.tagline || '');
  output = output.replace(/{{atendimento}}/g, data.attendance || '');
  output = output.replace(/{{cta}}/g, data.cta || 'Agendar consulta');
  output = output.replace(/{{servicos}}/g, (data.services||[]).join(', '));
  // Serviços individuais: {{servico_1}}, {{servico_2}}, ...
  const svcArr = data.services || [];
  for (let i = 0; i < 12; i++) {
    output = output.replace(new RegExp(`{{servico_${i+1}}}`, 'g'), svcArr[i] || '');
  }
  // Map {{foto}} and {{foto_hero}} to avatar
  output = output.replace(/{{foto}}/g, data.avatar || '');
  output = output.replace(/{{foto_hero}}/g, data.avatar || '');
  // Legacy support for {{avatar}} if used
  output = output.replace(/{{avatar}}/g, data.avatar || '');
  return output;
}

function getSiteFormData() {
  const name = document.getElementById('genName').value.trim() || 'Nutricionista';
  const specialty = document.getElementById('genSpecialty').value.trim() || 'Nutricionista';
  const city = document.getElementById('genCity').value.trim() || '';
  const attendance = document.getElementById('genAttendance').value;
  const tagline = document.getElementById('genTagline').value.trim() || `Nutrição personalizada para transformar sua saúde`;
  const bio = document.getElementById('genBio') ? document.getElementById('genBio').value.trim() : '';
  const servicesRaw = document.getElementById('genServices').value.trim();
  const services = servicesRaw ? servicesRaw.split('\n').filter(Boolean) : ['Consultoria Nutricional', 'Plano Alimentar', 'Acompanhamento Online'];
  const whatsappRaw = document.getElementById('genWhatsapp').value.trim();
  const whatsapp = whatsappRaw.split(/[\/\,]| e /)[0].trim();
  const instagram = document.getElementById('genInstagram').value.trim();

  let avatar = '';
  let images = [];
  const leadId = document.getElementById('genLeadSelect').value;
  if (leadId) {
    const l = state.leads.find(x => x.id === leadId);
    if (l) {
      if (l.avatar) avatar = l.avatar;
      if (Array.isArray(l.images)) images = l.images;
    }
  }
  // Garante que a foto do lead apareça como imagem principal nos templates built-in
  if (avatar && (!images.length || !images[0])) {
    images = [avatar, ...images];
  }

  return { name, specialty, city, attendance, tagline, bio, services, whatsapp, instagram, avatar, images, cta: '' };
}

function generateSiteHTML(data, templateId) {
  const customTpl = state.customTemplates.find(t => t.id === templateId);
  if (customTpl) return generateCustomTemplate(customTpl.html, data);

  const builtin = BUILTIN_TEMPLATES.find(t => t.id === templateId);
  if (builtin) return builtin.generator(data);

  return generateClinica(data);
}

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function placeholderTemplateImageDataUri(data, index) {
  const name = String(data?.name || 'LeadFlow');
  const specialty = String(data?.specialty || '');
  const title = escapeXml(name.length > 44 ? `${name.slice(0, 41)}…` : name);
  const sub = escapeXml(specialty.length > 52 ? `${specialty.slice(0, 49)}…` : specialty);
  const hue = (Number(index) * 47) % 360;
  const hue2 = (hue + 60) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 70%, 22%)"/>
      <stop offset="100%" stop-color="hsl(${hue2}, 70%, 18%)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <rect width="1200" height="800" fill="rgba(0,0,0,0.28)"/>
  <g fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2">
    <path d="M-50 690 C 200 610, 360 780, 640 690 S 1080 610, 1250 700"/>
    <path d="M-80 560 C 180 490, 420 650, 700 560 S 1100 480, 1280 590"/>
    <path d="M-100 430 C 190 360, 420 520, 740 430 S 1120 350, 1300 450"/>
  </g>
  <g font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" text-anchor="middle">
    <text x="600" y="420" font-size="54" font-weight="800" fill="rgba(255,255,255,0.92)">${title}</text>
    ${sub ? `<text x="600" y="475" font-size="26" font-weight="600" fill="rgba(255,255,255,0.75)">${sub}</text>` : ''}
    <text x="600" y="540" font-size="16" font-weight="700" letter-spacing="0.12em" fill="rgba(255,255,255,0.55)">IMAGEM EXEMPLO</text>
  </g>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getTemplateImage(data, index, fallbackUrl) {
  if (Array.isArray(data.images) && data.images[index]) {
    return data.images[index];
  }
  const fb = String(fallbackUrl || '').trim();
  if (fb && !/^https?:\/\//i.test(fb)) return fb;
  return placeholderTemplateImageDataUri(data, index);
}

async function generateSiteWithAI(data, templateType) {
  try {
    // Resolve fields based on template type
    const allTypes = [...BUILTIN_TEMPLATE_TYPES, ...(state.templateTypes || [])];
    const typeObj  = allTypes.find(t => t.name === templateType);
    const fields   = typeObj ? typeObj.fields : ['nome','tagline','bio','servico_1','servico_2','servico_3','cta','whatsapp'];

    // Build only the JSON shape the template actually needs
    const jsonShape = {};
    if (fields.includes('tagline')) jsonShape.tagline = 'frase de impacto em até 12 palavras';
    if (fields.includes('bio'))     jsonShape.bio     = 'parágrafo profissional em até 55 palavras na 3ª pessoa';
    if (fields.includes('cta'))     jsonShape.cta     = 'frase curta para botão WhatsApp (ex: Agende sua consulta)';
    const servicoCount = fields.filter(f => f.startsWith('servico_')).length;
    if (servicoCount > 0) jsonShape.servicos = `array com exatamente ${servicoCount} serviço(s) melhorado(s)`;

    // If nothing to generate, skip AI call
    if (Object.keys(jsonShape).length === 0) return null;

    const prompt = `Você é um copywriter especialista em sites de profissionais de saúde no Brasil.
Retorne SOMENTE um JSON válido (sem markdown, sem blocos de código) com estas chaves:
${JSON.stringify(jsonShape, null, 2)}

Dados do profissional:
Nome: ${data.name}
Especialidade: ${data.specialty}
Cidade: ${data.city || 'Brasil'}
Bio original: ${data.bio || 'não informada'}
Tagline original: ${data.tagline || 'não informada'}
Serviços: ${(data.services||[]).join(', ') || 'não informados'}
Atendimento: ${data.attendance || 'presencial'}`;

    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'Você é copywriter. Responda SOMENTE com JSON puro, sem markdown, sem blocos de código.',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 500
      })
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (d.error) return null;
    const text = (d.text || '').trim().replace(/^```json\s*|^```\s*|```$/gm, '');
    const ai = JSON.parse(text);
    return {
      tagline:  ai.tagline  || data.tagline,
      bio:      ai.bio      || data.bio,
      services: Array.isArray(ai.servicos) && ai.servicos.length ? ai.servicos : data.services,
      cta:      ai.cta      || 'Agendar consulta'
    };
  } catch(e) {
    console.warn('[IA Site] Falha:', e.message);
    return null;
  }
}

async function generateSite() {
  const data = getSiteFormData();

  // Loading no botão
  const btn = document.querySelector('button[onclick="generateSite()"]');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<span style="opacity:.7">⏳ Gerando com IA...</span>'; }

  // IA melhora o copy antes de gerar
  const template = state.selectedTemplate;
  const tplObj = state.customTemplates.find(t => t.id === template);
  const templateType = tplObj ? tplObj.type : null;
  const aiCopy = await generateSiteWithAI(data, templateType);
  if (aiCopy) {
    data.tagline  = aiCopy.tagline;
    data.bio      = aiCopy.bio;
    data.services = aiCopy.services;
    data.cta      = aiCopy.cta;
  }

  if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }

  // ── MODO BLOCOS ──────────────────────────────────────────────
  if (state.generatorMode === 'blocos') {
    const ids = state.selectedSections.length ? state.selectedSections : getRecipeForSpecialty(data.specialty);
    const html = assembleFromSections(ids, data);
    state.generatedHTML = html;
    const iframe = document.getElementById('sitePreview');
    document.getElementById('previewPlaceholder').style.display = 'none';
    iframe.srcdoc = html;
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/dr[ao]-?/g, '');
    document.querySelector('.preview-url').textContent = `leadflow.site/${slug}`;
    toast(aiCopy ? '✨ Site gerado com blocos + IA!' : '✅ Site gerado com blocos!');
    return;
  }

  // ── MODO TEMPLATE COMPLETO (comportamento original) ──────────
  state.currentPreviewTemplate = template;
  const html = generateSiteHTML(data, template);
  state.generatedHTML = html;

  // Inject Editor Logic before setting to iframe
  const editableHtml = injectEditor(html, data);

  const iframe = document.getElementById('sitePreview');
  document.getElementById('previewPlaceholder').style.display = 'none';
  iframe.srcdoc = editableHtml;

  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/dr[ao]-?/g, '');
  document.querySelector('.preview-url').textContent = `leadflow.site/${slug}`;

  toast(aiCopy ? '✨ Site gerado com IA!' : 'Site gerado com sucesso!');
}

function sanitizeGeneratedHtml(html, data) {
  let out = String(html || '');
  out = out.replace(/<script\b[^>]*\bsrc=["']https?:\/\/[^"']*(?:cdnjs\.cloudflare\.com\/ajax\/libs\/lucide|googletagmanager\.com\/gtm\.js|googletagmanager\.com\/gtag\/js|google-analytics\.com)[^"']*["'][^>]*>\s*<\/script>/gi, '');
  out = out.replace(/<script\b[^>]*>\s*[\s\S]*?(?:googletagmanager|gtm\.start|gtag\(|google_tag_manager)[\s\S]*?<\/script>/gi, '');
  let idx = 1000;
  out = out.replace(/(<img\b[^>]*\bsrc=["'])(https?:\/\/[^"']+)(["'][^>]*>)/gi, (m, p1, _url, p3) => `${p1}${getTemplateImage(data || {}, idx++, '')}${p3}`);
  out = out.replace(/url\(\s*(['"]?)(https?:\/\/[^'")]+)\1\s*\)/gi, () => `url("${getTemplateImage(data || {}, idx++, '')}")`);
  return out;
}

function injectEditor(html, data) {
  html = sanitizeGeneratedHtml(html, data);
  // If no body tag, append to end
  const insertPos = html.indexOf('</body>');
  const code = `
    <style id="lf-editor-style">
      .lf-edit-wrapper { position: relative; transition: all 0.2s; box-sizing: border-box; isolation: isolate; }
      .lf-edit-wrapper:hover { outline: 2px dashed #7C3AED; outline-offset: -2px; }
      .lf-edit-btn {
        all: unset;
        position: absolute !important; top: 0 !important; right: 0 !important;
        z-index: 2147483647 !important;
        display: inline-flex !important; align-items: center !important; gap: 6px !important;
        padding: 6px 10px !important;
        border-bottom-left-radius: 6px !important;
        background: #7C3AED !important;
        color: #fff !important;
        font-size: 12px !important;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25) !important;
      }
      .lf-del-btn {
        all: unset;
        position: absolute !important; top: 34px !important; right: 0 !important;
        z-index: 2147483647 !important;
        display: inline-flex !important; align-items: center !important; gap: 6px !important;
        padding: 6px 10px !important;
        border-bottom-left-radius: 6px !important;
        background: #DC2626 !important;
        color: #fff !important;
        font-size: 12px !important;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25) !important;
      }
      .lf-edit-btn:hover { filter: brightness(1.06); }
      .lf-del-btn:hover { filter: brightness(1.06); }
      .lf-edit-btn:focus-visible, .lf-del-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.9) !important; outline-offset: 2px !important; }
      .lf-editable-active { outline: 2px solid #7C3AED !important; }
      [contenteditable="true"]:focus { outline: 2px dashed #7C3AED; background: rgba(124, 58, 237, 0.05); }
    </style>
    <script id="lf-editor-script">
      document.addEventListener('DOMContentLoaded', () => {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        const LF_IMAGE_TITLE = 'Clique para alterar a imagem';

        function pickAndApplyImage(applyFn) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (ev) => {
            const file = ev.target.files && ev.target.files[0];
            if (!file) return;
            if (file.size > MAX_IMAGE_SIZE) {
              alert('A imagem deve ter no máximo 5MB.');
              return;
            }
            const reader = new FileReader();
            reader.onload = (loadEv) => {
              const dataUrl = loadEv.target && loadEv.target.result;
              if (!dataUrl) return;
              applyFn(String(dataUrl));
            };
            reader.readAsDataURL(file);
          };
          input.click();
        }

        function findBackgroundTarget(startEl) {
          let el = startEl;
          while (el && el !== document.body && el !== document.documentElement) {
            if (el.classList && (el.classList.contains('lf-edit-btn') || el.classList.contains('lf-del-btn'))) return null;
            const style = window.getComputedStyle(el);
            const bg = style && style.backgroundImage;
            if (bg && bg !== 'none' && bg.includes('url(')) return el;
            el = el.parentElement;
          }
          return null;
        }

        function markClickableImage(el) {
          if (!el || !el.style) return;
          if (!el.getAttribute('title')) el.setAttribute('title', LF_IMAGE_TITLE);
          if (el.style.cursor !== 'pointer') {
            el.style.cursor = 'pointer';
            el.setAttribute('data-lf-editor-cursor', '1');
          }
        }

        document.querySelectorAll('img').forEach(markClickableImage);
        document.querySelectorAll('[style*="background-image"]').forEach(markClickableImage);

        document.addEventListener('click', (e) => {
          const target = e.target;
          if (!target || (target.closest && target.closest('.lf-edit-btn, .lf-del-btn'))) return;

          if (target.tagName === 'IMG') {
            e.preventDefault();
            e.stopPropagation();
            markClickableImage(target);
            pickAndApplyImage((dataUrl) => { target.src = dataUrl; });
            return;
          }

          const bgTarget = findBackgroundTarget(target);
          if (!bgTarget) return;
          e.preventDefault();
          e.stopPropagation();
          markClickableImage(bgTarget);
          pickAndApplyImage((dataUrl) => { bgTarget.style.backgroundImage = 'url(\"' + dataUrl + '\")'; });
        }, true);

        function getEditableContainers() {
          const out = [];
          const seen = new Set();
          const push = (el) => {
            if (!el || !el.tagName) return;
            if (seen.has(el)) return;
            const tag = el.tagName.toUpperCase();
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META') return;
            if (el.id === 'lf-editor-ui') return;
            if (el.classList && el.classList.contains('lf-edit-wrapper')) return;
            seen.add(el);
            out.push(el);
          };

          document.querySelectorAll('header, section, main, footer').forEach(push);

          const hasSections = document.querySelectorAll('section').length > 0;
          if (!hasSections) {
            const main = document.querySelector('main');
            if (main) {
              Array.from(main.children || [])
                .filter(el => el && el.tagName && !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(el.tagName))
                .forEach(push);
            }
          }

          if (out.length > 0) return out;

          let top = Array.from(document.body ? document.body.children : []);
          top = top.filter(el => el && el.tagName && !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(el.tagName));

          if (top.length === 1) {
            const only = top[0];
            const inner = Array.from(only.children || []).filter(el => el && el.tagName && !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(el.tagName));
            if (inner.length > 1) top = inner;
          }

          top.forEach(push);
          return out;
        }

        const containers = getEditableContainers();
        
        containers.forEach(el => {
          if(el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
          if (el.id === 'lf-editor-ui') return;
          if (el.classList && el.classList.contains('lf-edit-wrapper')) return;
          el.classList.add('lf-edit-wrapper');
          
          const btn = document.createElement('button');
          btn.className = 'lf-edit-btn';
          btn.innerHTML = '✏️ Editar';
          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleEdit(el, btn);
          };

          const del = document.createElement('button');
          del.className = 'lf-del-btn';
          del.innerHTML = '🗑 Excluir';
          del.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Excluir esta seção do site?')) {
              el.remove();
            }
          };
          
          // Ensure positioning context
          const style = window.getComputedStyle(el);
          if(style.position === 'static') el.style.position = 'relative';
          
          el.appendChild(btn);
          el.appendChild(del);
        });

        document.addEventListener('click', (e) => {
          const target = e.target;
          if (!target || !target.closest) return;
          if (target.closest('.lf-edit-btn, .lf-del-btn')) return;
          const editingScope = target.closest('.lf-editable-active');
          if (!editingScope) return;
          const link = target.closest('a');
          const btn = target.closest('button');
          if (link || btn) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);

        document.addEventListener('dblclick', (e) => {
          const target = e.target;
          if (!target || !target.closest) return;
          if (target.closest('.lf-edit-btn, .lf-del-btn')) return;
          const editingScope = target.closest('.lf-editable-active');
          if (!editingScope) return;

          const link = target.closest('a');
          if (link) {
            e.preventDefault();
            e.stopPropagation();
            const current = link.getAttribute('href') || '';
            const next = prompt('URL do botão/link:', current);
            if (next === null) return;
            const cleaned = String(next).trim();
            link.setAttribute('href', cleaned || '#');
            return;
          }

          const btn = target.closest('button');
          if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const current = btn.getAttribute('data-lf-href') || '';
            const next = prompt('URL do botão:', current);
            if (next === null) return;
            const cleaned = String(next).trim();
            btn.setAttribute('data-lf-href', cleaned);
            if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
            if (!btn.getAttribute('data-lf-href-hooked')) {
              btn.setAttribute('data-lf-href-hooked', '1');
              btn.addEventListener('click', (ev) => {
                if (btn.closest('.lf-editable-active')) {
                  ev.preventDefault();
                  ev.stopPropagation();
                  return;
                }
                const href = btn.getAttribute('data-lf-href') || '';
                if (href) window.location.href = href;
              }, true);
            }
          }
        }, true);

        function toggleEdit(container, btn) {
          const isEditing = btn.innerHTML.includes('Salvar');
          
          if (isEditing) {
            // Save Mode -> View Mode
            btn.innerHTML = '✏️ Editar';
            btn.style.background = '#7C3AED';
            container.classList.remove('lf-editable-active');
            
            // Disable text editing
            container.querySelectorAll('[contenteditable]').forEach(child => {
              child.contentEditable = 'false';
            });
          } else {
            // View Mode -> Edit Mode
            btn.innerHTML = '💾 Salvar';
            btn.style.background = '#059669'; // Green for save
            container.classList.add('lf-editable-active');
            
            // Enable text editing for safe elements
            const textSelector = 'h1, h2, h3, h4, h5, h6, p, span, a, li, b, strong, i, em, small, button, .btn, [role="button"], [class*="btn"], [class*="cta"], [class*="button"]';
            container.querySelectorAll(textSelector).forEach(child => {
               // Only edit if it has direct text or is a leaf node
               if (child.children.length === 0 || child.innerText.trim().length > 0) {
                 child.contentEditable = 'true';
               }
            });
          }
        }
      });
    </script>
  `;

  if (insertPos !== -1) {
    return html.slice(0, insertPos) + code + html.slice(insertPos);
  } else {
    return html + code;
  }
}

function getCleanHTML(iframeId = 'sitePreview') {
  const iframe = document.getElementById(iframeId);
  if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) return null;

  // Use clone to avoid messing up the view
  const doc = iframe.contentDocument.documentElement.cloneNode(true);

  // Remove Editor Styles and Scripts
  const style = doc.querySelector('#lf-editor-style');
  if (style) style.remove();
  const script = doc.querySelector('#lf-editor-script');
  if (script) script.remove();

  // Remove Editor UI Elements
  doc.querySelectorAll('.lf-edit-btn, .lf-del-btn').forEach(el => el.remove());

  // Clean classes and attributes
  doc.querySelectorAll('.lf-edit-wrapper').forEach(el => {
    el.classList.remove('lf-edit-wrapper');
    el.classList.remove('lf-editable-active');
    if (el.style.position === 'relative' && !el.getAttribute('style')?.includes('position: relative')) {
      el.style.position = ''; // Attempt to revert if inline style was added strictly for editor
    }
  });

  // Clean images
  doc.querySelectorAll('img').forEach(img => {
    if (img.title === 'Clique para alterar a imagem') {
      img.removeAttribute('title');
    }
    img.style.cursor = '';
  });

  doc.querySelectorAll('[title="Clique para alterar a imagem"]').forEach(el => el.removeAttribute('title'));
  doc.querySelectorAll('[data-lf-editor-cursor="1"]').forEach(el => {
    el.style.cursor = '';
    el.removeAttribute('data-lf-editor-cursor');
  });

  doc.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  return doc.outerHTML;
}

function sanitizeHexColor(value, fallback) {
  const raw = String(value || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const r = raw[1], g = raw[2], b = raw[3];
    return (`#${r}${r}${g}${g}${b}${b}`).toUpperCase();
  }
  return fallback;
}

function getIframeDoc(iframeId) {
  const iframe = document.getElementById(iframeId);
  return iframe && iframe.contentDocument ? iframe.contentDocument : null;
}

function ensurePreviewButtonColors(iframeId, primary, secondary) {
  const doc = getIframeDoc(iframeId);
  if (!doc) return;

  const head = doc.head || doc.querySelector('head') || doc.documentElement;
  if (!head) return;

  const safePrimary = sanitizeHexColor(primary, '#7C3AED');
  const safeSecondary = sanitizeHexColor(secondary, '#06B6D4');

  const css = `
    :root{--lf-btn-primary:${safePrimary};--lf-btn-secondary:${safeSecondary};}
    :is(
      a[href].cta, a[href].btn, a[href].btn-main, a[href].btn-wa, a[href].cta-white, a[href].cta-light,
      a[href][class*="btn"], a[href][class*="cta"], a[href][class*="button"], a[href][class*="action"],
      button.btn, button.btn-primary, button[class*="btn"], button[class*="cta"], button[class*="button"], button[class*="action"],
      input[type="button"], input[type="submit"],
      [role="button"].btn, [role="button"].cta, [role="button"][class*="btn"], [role="button"][class*="cta"], [role="button"][class*="button"], [role="button"][class*="action"],
      .btn, .btn-primary, .btn-wa, .cta, .button, .cta-button, .primary-btn, .secondary-btn, .dash2-action-primary
    ){
      background-color:var(--lf-btn-primary) !important;
      background-image:linear-gradient(135deg,var(--lf-btn-primary),var(--lf-btn-secondary)) !important;
      background:linear-gradient(135deg,var(--lf-btn-primary),var(--lf-btn-secondary)) !important;
      color:#fff !important;
      border-color:transparent !important;
    }
    a.btn-out,a.soc,a[href*="instagram.com"]{
      background:transparent !important;
      border:1px solid var(--lf-btn-primary) !important;
      color:var(--lf-btn-primary) !important;
    }
    a.btn-out:hover,a.soc:hover,a[href*="instagram.com"]:hover{
      background:var(--lf-btn-primary) !important;
      color:#fff !important;
    }
  `.trim();

  let style = doc.getElementById('lf-preview-btn-colors');
  if (!style) {
    style = doc.createElement('style');
    style.id = 'lf-preview-btn-colors';
    head.appendChild(style);
  }
  style.textContent = css;
}

function getSectionLabel(el, index) {
  const tag = (el.tagName || '').toLowerCase();
  const id = (el.getAttribute && el.getAttribute('id')) ? `#${el.getAttribute('id')}` : '';
  const cls = (el.getAttribute && el.getAttribute('class')) ? el.getAttribute('class').trim().split(/\s+/).slice(0, 2).join('.') : '';
  const hint = id || (cls ? `.${cls}` : '');
  const base = hint ? `${tag} ${hint}` : tag;
  const heading = el.querySelector ? el.querySelector('h1,h2,h3') : null;
  const title = heading ? (heading.textContent || '').trim().replace(/\s+/g, ' ') : '';
  if (title) return `${index + 1}. ${title}`;
  return `Seção ${index + 1} (${base})`;
}

function rebuildPreviewSectionsList(iframeId = 'sitePreview') {
  const list = document.getElementById('previewSectionsList');
  const doc = getIframeDoc(iframeId);
  if (!list) return;
  list.innerHTML = '';
  if (!doc || !doc.body) return;

  const els = (() => {
    const out = [];
    const seen = new Set();
    const push = (el) => {
      if (!el || !el.tagName) return;
      if (seen.has(el)) return;
      const tag = el.tagName.toUpperCase();
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META') return;
      if (el.id === 'lf-editor-ui') return;
      seen.add(el);
      out.push(el);
    };

    Array.from(doc.querySelectorAll('header, section, main, footer')).forEach(push);
    const hasSections = doc.querySelectorAll('section').length > 0;
    if (!hasSections) {
      const main = doc.querySelector('main');
      if (main) {
        Array.from(main.children || [])
          .filter(el => el && el.tagName && !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(el.tagName.toUpperCase()))
          .forEach(push);
      }
    }

    if (out.length > 0) return out;

    let top = Array.from(doc.body.children || []);
    top = top.filter(el => el && el.tagName && !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(el.tagName.toUpperCase()));
    if (top.length === 1) {
      const only = top[0];
      const inner = Array.from(only.children || []).filter(el => el && el.tagName && !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(el.tagName.toUpperCase()));
      if (inner.length > 1) top = inner;
    }
    top.forEach(push);
    return out;
  })();

  if (els.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'preview-image-meta';
    empty.textContent = 'Nenhuma seção encontrada.';
    list.appendChild(empty);
    return;
  }

  els.forEach((el, idx) => {
    const item = document.createElement('div');
    item.className = 'preview-section-item';

    const name = document.createElement('div');
    name.className = 'preview-section-name';
    name.textContent = getSectionLabel(el, idx);

    const actions = document.createElement('div');
    actions.className = 'preview-section-actions';

    const visible = doc.defaultView ? doc.defaultView.getComputedStyle(el).display !== 'none' : el.style.display !== 'none';

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'preview-tools-label';
    const toggleText = document.createElement('span');
    toggleText.textContent = 'Mostrar';
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = visible;
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        el.style.display = el.dataset.lfPrevDisplay || '';
        delete el.dataset.lfPrevDisplay;
      } else {
        if (!el.dataset.lfPrevDisplay) el.dataset.lfPrevDisplay = el.style.display || '';
        el.style.display = 'none';
      }
    });
    toggleLabel.appendChild(toggleText);
    toggleLabel.appendChild(toggle);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-secondary';
    del.textContent = 'Excluir';
    del.addEventListener('click', () => {
      if (confirm('Excluir esta seção do site?')) {
        el.remove();
        rebuildPreviewSectionsList(iframeId);
        rebuildPreviewImagesList(iframeId);
      }
    });

    actions.appendChild(toggleLabel);
    actions.appendChild(del);

    item.appendChild(name);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

function countPreviewButtons(iframeId = 'sitePreview') {
  const doc = getIframeDoc(iframeId);
  if (!doc || !doc.body) return { count: 0, matched: 0 };
  const nodes = Array.from(doc.querySelectorAll('a, button'))
    .filter(el => !(el.classList && (el.classList.contains('lf-edit-btn') || el.classList.contains('lf-del-btn'))));

  const isButtonLike = (el) => {
    const cls = ((el.getAttribute && el.getAttribute('class')) || '').toLowerCase();
    if (/(^|\s)(btn|cta|soc|action)(\s|$)/.test(cls)) return true;
    if (cls.includes('btn') || cls.includes('cta') || cls.includes('soc') || cls.includes('action')) return true;
    if (el.tagName === 'A') {
      const href = (el.getAttribute && el.getAttribute('href')) ? el.getAttribute('href') : '';
      if (/wa\.me|whatsapp|instagram\.com/i.test(href)) return true;
    }
    return false;
  };

  const matched = nodes.filter(isButtonLike);
  return { count: nodes.length, matched: matched.length };
}

function updatePreviewButtonsMeta(iframeId = 'sitePreview') {
  const el = document.getElementById('previewButtonsMeta');
  if (!el) return;
  const { matched } = countPreviewButtons(iframeId);
  el.textContent = `${matched} botão(ões) detectado(s) no site`;
}

function extractBackgroundUrls(doc) {
  if (!doc || !doc.body || !doc.defaultView) return [];
  const urls = [];
  const re = /url\(["']?(.*?)["']?\)/g;
  const all = Array.from(doc.body.querySelectorAll('*'));
  for (const el of all) {
    try {
      const bg = doc.defaultView.getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none' || !bg.includes('url(')) continue;
      let m;
      while ((m = re.exec(bg))) {
        const u = (m[1] || '').trim();
        if (u) urls.push(u);
      }
    } catch { }
  }
  return urls;
}

function getFileNameFromUrl(url, index) {
  const base = `imagem-${index + 1}`;
  if (!url) return `${base}.png`;
  const raw = String(url);
  if (raw.startsWith('data:')) {
    const mime = raw.slice(5, raw.indexOf(';')) || 'image/png';
    const ext = mime.includes('jpeg') ? 'jpg' : (mime.split('/')[1] || 'png');
    return `${base}.${ext}`;
  }
  try {
    const u = new URL(raw);
    const last = u.pathname.split('/').filter(Boolean).pop() || base;
    return last.includes('.') ? last : `${last}.png`;
  } catch {
    return `${base}.png`;
  }
}

async function downloadUrlAsFile(url, filename) {
  const raw = String(url || '');
  try {
    const res = await fetch(raw);
    if (!res.ok) throw new Error('fetch-failed');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename || 'imagem.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    return true;
  } catch {
    try {
      window.open(raw, '_blank');
      return false;
    } catch {
      return false;
    }
  }
}

function rebuildPreviewImagesList(iframeId = 'sitePreview') {
  const grid = document.getElementById('previewImagesList');
  const doc = getIframeDoc(iframeId);
  if (!grid) return;
  grid.innerHTML = '';
  if (!doc || !doc.body) return;

  const imgs = Array.from(doc.querySelectorAll('img'))
    .map(img => (img && img.getAttribute ? img.getAttribute('src') : '') || '')
    .map(s => s.trim())
    .filter(Boolean);

  const bgs = extractBackgroundUrls(doc).map(s => String(s).trim()).filter(Boolean);
  const unique = Array.from(new Set([...imgs, ...bgs]));

  if (unique.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'preview-image-meta';
    empty.textContent = 'Nenhuma imagem encontrada.';
    grid.appendChild(empty);
    return;
  }

  unique.forEach((src, idx) => {
    const item = document.createElement('div');
    item.className = 'preview-image-item';

    const thumb = document.createElement('img');
    thumb.className = 'preview-image-thumb';
    thumb.src = src;
    thumb.alt = '';

    const meta = document.createElement('div');
    meta.className = 'preview-image-meta';
    meta.textContent = getFileNameFromUrl(src, idx);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary';
    btn.textContent = 'Baixar';
    btn.addEventListener('click', async () => {
      const fileName = getFileNameFromUrl(src, idx);
      const ok = await downloadUrlAsFile(src, fileName);
      if (ok) toast('Download iniciado');
      else toast('Não foi possível baixar (abrindo em nova aba)', 'error');
    });

    item.appendChild(thumb);
    item.appendChild(meta);
    item.appendChild(btn);
    grid.appendChild(item);
  });
}

async function downloadAllPreviewImages(iframeId = 'sitePreview') {
  const doc = getIframeDoc(iframeId);
  if (!doc || !doc.body) return;

  const imgs = Array.from(doc.querySelectorAll('img'))
    .map(img => (img && img.getAttribute ? img.getAttribute('src') : '') || '')
    .map(s => s.trim())
    .filter(Boolean);

  const bgs = extractBackgroundUrls(doc).map(s => String(s).trim()).filter(Boolean);
  const unique = Array.from(new Set([...imgs, ...bgs]));
  for (let i = 0; i < unique.length; i++) {
    const src = unique[i];
    const fileName = getFileNameFromUrl(src, i);
    await downloadUrlAsFile(src, fileName);
  }
}

function initPreviewToolsUI() {
  const toggles = [
    { btnId: 'togglePreviewButtons', iconId: 'togglePreviewButtonsIcon', containerId: 'previewButtonsContainer' },
    { btnId: 'togglePreviewSections', iconId: 'togglePreviewSectionsIcon', containerId: 'previewSectionsContainer' },
    { btnId: 'togglePreviewImages', iconId: 'togglePreviewImagesIcon', containerId: 'previewImagesContainer' },
    { btnId: 'toggleGallery', iconId: 'toggleGalleryIcon', containerId: 'galleryContainer' }
  ];

  const bindAccordionToggle = (btnId, iconId, containerId) => {
    const btn = document.getElementById(btnId);
    const icon = document.getElementById(iconId);
    const container = document.getElementById(containerId);
    if (!btn || !icon || !container) return;
    if (btn.dataset.accordionInit === '1') return;
    btn.dataset.accordionInit = '1';

    btn.addEventListener('click', () => {
      const isCollapsed = container.classList.contains('collapsed');
      if (isCollapsed) {
        toggles.forEach(t => {
          if (t.containerId === containerId) return;
          const c = document.getElementById(t.containerId);
          const i = document.getElementById(t.iconId);
          if (c) c.classList.add('collapsed');
          if (i) i.classList.add('rotate-180');
        });
        container.classList.remove('collapsed');
        icon.classList.remove('rotate-180');
        return;
      }
      container.classList.add('collapsed');
      icon.classList.add('rotate-180');
    });
  };

  toggles.forEach(t => bindAccordionToggle(t.btnId, t.iconId, t.containerId));

  const inputPrimary = document.getElementById('previewBtnPrimaryColor');
  const inputSecondary = document.getElementById('previewBtnSecondaryColor');
  const applyBtn = document.getElementById('applyPreviewBtnColorsBtn');
  const resetBtn = document.getElementById('resetPreviewBtnColorsBtn');
  const refreshSectionsBtn = document.getElementById('refreshPreviewSectionsBtn');
  const refreshImagesBtn = document.getElementById('refreshPreviewImagesBtn');
  const downloadAllBtn = document.getElementById('downloadAllPreviewImagesBtn');

  if (inputPrimary) inputPrimary.value = sanitizeHexColor(state.previewSettings?.btnPrimary, '#7C3AED');
  if (inputSecondary) inputSecondary.value = sanitizeHexColor(state.previewSettings?.btnSecondary, '#06B6D4');

  const apply = () => {
    const primary = sanitizeHexColor(inputPrimary?.value, '#7C3AED');
    const secondary = sanitizeHexColor(inputSecondary?.value, '#06B6D4');
    state.previewSettings = { ...(state.previewSettings || {}), btnPrimary: primary, btnSecondary: secondary };
    save();
    ensurePreviewButtonColors('sitePreview', primary, secondary);
    ensurePreviewButtonColors('fullPreview', primary, secondary);
    updatePreviewButtonsMeta('sitePreview');
    toast('Cores aplicadas');
  };

  if (applyBtn) applyBtn.addEventListener('click', apply);
  if (inputPrimary) inputPrimary.addEventListener('input', apply);
  if (inputSecondary) inputSecondary.addEventListener('input', apply);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const primary = '#7C3AED';
      const secondary = '#06B6D4';
      if (inputPrimary) inputPrimary.value = primary;
      if (inputSecondary) inputSecondary.value = secondary;
      state.previewSettings = { ...(state.previewSettings || {}), btnPrimary: primary, btnSecondary: secondary };
      save();
      ensurePreviewButtonColors('sitePreview', primary, secondary);
      ensurePreviewButtonColors('fullPreview', primary, secondary);
      updatePreviewButtonsMeta('sitePreview');
      toast('Cores resetadas');
    });
  }

  if (refreshSectionsBtn) refreshSectionsBtn.addEventListener('click', () => rebuildPreviewSectionsList('sitePreview'));
  if (refreshImagesBtn) refreshImagesBtn.addEventListener('click', () => rebuildPreviewImagesList('sitePreview'));
  if (downloadAllBtn) downloadAllBtn.addEventListener('click', async () => { await downloadAllPreviewImages('sitePreview'); });

  const siteIframe = document.getElementById('sitePreview');
  if (siteIframe) {
    siteIframe.addEventListener('load', () => {
      ensurePreviewButtonColors('sitePreview', state.previewSettings?.btnPrimary, state.previewSettings?.btnSecondary);
      rebuildPreviewSectionsList('sitePreview');
      rebuildPreviewImagesList('sitePreview');
      updatePreviewButtonsMeta('sitePreview');
    });
  }

  const fullIframe = document.getElementById('fullPreview');
  if (fullIframe) {
    fullIframe.addEventListener('load', () => {
      ensurePreviewButtonColors('fullPreview', state.previewSettings?.btnPrimary, state.previewSettings?.btnSecondary);
    });
  }

  ensurePreviewButtonColors('sitePreview', state.previewSettings?.btnPrimary, state.previewSettings?.btnSecondary);
  ensurePreviewButtonColors('fullPreview', state.previewSettings?.btnPrimary, state.previewSettings?.btnSecondary);
  rebuildPreviewSectionsList('sitePreview');
  rebuildPreviewImagesList('sitePreview');
  updatePreviewButtonsMeta('sitePreview');
}

async function publishToVercel() {
  const btn = document.getElementById('saveLeadSiteBtn');

  const cleanHtmlFromIframe = getCleanHTML() || null;
  const cleanHtml = cleanHtmlFromIframe || state.generatedHTML || '';
  if (!cleanHtml.trim()) { toast('Gere um site primeiro'); return; }

  const leadId = document.getElementById('genLeadSelect')?.value || '';
  const lead = leadId ? state.leads.find(x => x.id === leadId) : null;
  const formData = getSiteFormData();
  const baseName = (lead?.name || formData?.name || 'cliente').trim();

  const slugify = (s) => (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const deploymentName = `site-${slugify(baseName) || 'cliente'}`;
  const vercelToken = state.settings.vercelToken || '';

  if (!vercelToken) {
    toast('Configure seu Token da Vercel nas Configurações', 'error');
    navigate('settings');
    return;
  }

  const originalTitle = btn?.title || 'Publicar (Vercel)';
  if (btn) {
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
    btn.title = 'Publicando...';
  }

  try {
    toast('Iniciando deploy na Vercel...');

    const payload = {
      name: deploymentName,
      target: 'production',
      files: [
        {
          file: 'index.html',
          data: cleanHtml
        }
      ],
      projectSettings: {
        framework: null
      }
    };

    const res = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || `Erro ao publicar (${res.status})`;
      throw new Error(msg);
    }

    const aliases = Array.isArray(data?.alias) ? data.alias : [];
    // Prioritize an alias ending in .vercel.app for a cleaner public URL
    const cleanAlias = aliases.find(a => a.endsWith('.vercel.app'));
    const rawUrl = cleanAlias || (aliases.length > 0 ? aliases[0] : (data?.url || ''));

    const deployedUrl = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) : '';
    if (!deployedUrl) throw new Error('Deploy criado, mas sem URL retornada.');

    // Update UI with URL
    const previewUrlEl = document.querySelector('.preview-url');
    if (previewUrlEl) previewUrlEl.textContent = deployedUrl.replace(/^https?:\/\//, '');

    const actions = document.querySelector('.preview-actions');
    if (actions) {
      let wrap = document.getElementById('vercelDeployResult');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'vercelDeployResult';
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '6px';
        wrap.style.marginLeft = '6px';
        actions.appendChild(wrap);
      } else {
        wrap.innerHTML = '';
      }

      const openBtn = document.createElement('button');
      openBtn.className = 'preview-btn';
      openBtn.title = 'Abrir site';
      openBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" /></svg>`;
      openBtn.addEventListener('click', () => window.open(deployedUrl, '_blank'));

      const copyBtn = document.createElement('button');
      copyBtn.className = 'preview-btn';
      copyBtn.title = 'Copiar link';
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>`;
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(deployedUrl).then(() => toast('Link copiado!'));
      });

      wrap.appendChild(openBtn);
      wrap.appendChild(copyBtn);
    }

    if (leadId) {
      const idx = state.leads.findIndex(x => x.id === leadId);
      if (idx !== -1) {
        state.leads[idx].siteLink = deployedUrl;
        state.leads[idx].status = 'site_pronto';
        save();
        renderLeadsTable();
      }
    }

    toast('Site publicado com sucesso na Vercel!');
  } catch (e) {
    toast(e?.message || 'Erro ao publicar na Vercel', 'error');
    console.error('Vercel deploy error:', e);
  } finally {
    if (btn) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
      btn.title = originalTitle;
    }
  }
}

window.publishToVercel = publishToVercel;

document.addEventListener('click', (e) => {
  const target = e.target?.closest?.('#saveLeadSiteBtn');
  if (!target) return;
  e.preventDefault();
  publishToVercel();
});

async function exportToPDF(btn) {
  if (!state.generatedHTML) { toast('Gere um site primeiro'); return; }

  // Detect context
  const isModal = btn.closest('#previewModal') || btn.id === 'exportPdfBtn';
  const sourceIframeId = isModal ? 'fullPreview' : 'sitePreview';

  // Ask for file location FIRST to avoid UI freeze perception
  let fileHandle = null;
  if (window.showSaveFilePicker) {
    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: `leadflow-site-${Date.now()}.pdf`,
        types: [{
          description: 'PDF Document',
          accept: { 'application/pdf': ['.pdf'] },
        }],
      });
    } catch (err) {
      if (err.name === 'AbortError') return; // User cancelled
      console.error('File picker error:', err);
      return;
    }
  }

  const originalContent = btn.innerHTML;
  const isSmallBtn = btn.classList.contains('preview-btn');

  if (isSmallBtn) {
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
  } else {
    btn.innerHTML = 'Gerando...';
    btn.disabled = true;
  }

  // Force UI update before heavy lifting
  await new Promise(resolve => setTimeout(resolve, 50));

  // Defer the heavy work to the next tick to ensure UI is responsive
  setTimeout(() => {
    generatePDFContent();
  }, 100);

  function generatePDFContent() {
    let cleanHtml;

    if (state.currentView === 'generator' && state.selectedTemplate !== state.currentPreviewTemplate) {
      try {
        const data = getSiteFormData();
        cleanHtml = generateSiteHTML(data, state.selectedTemplate);
      } catch (e) {
        cleanHtml = getCleanHTML(sourceIframeId) || state.generatedHTML;
      }
    } else {
      cleanHtml = getCleanHTML(sourceIframeId) || state.generatedHTML;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    if (!printWindow) {
      toast('Confirme a permissão para janelas pop-up para exportar.');
      cleanup();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exportação LeadFlow - ${new Date().toLocaleDateString()}</title>
        <style>
          @media print {
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #admin-bar, .no-print, button, .controls, [data-html2canvas-ignore] {
              display: none !important;
            }
            .h-screen, .min-h-screen {
              height: auto !important;
              min-height: 100vh !important;
            }
          }
          body { 
            margin: 0; 
            padding: 0;
            background: #f4f4f4;
          }
          .preparing-msg {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: sans-serif;
            z-index: 9999;
          }
        </style>
      </head>
      <body>
        <div class="preparing-msg" id="msg">Preparando visualização de alta fidelidade...</div>
        ${cleanHtml}
        <script>
          window.onload = () => {
            setTimeout(() => {
              document.getElementById('msg').style.display = 'none';
              window.print();
              // A janela de impressão bloqueia a execução. 
              // Podemos tentar fechar após a impressão.
              window.onafterprint = () => window.close();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();

    toast('Preparando impressão profissional...');
    cleanup();
  }






  function cleanup(iframe) {
    if (isSmallBtn) {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    } else {
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
    if (iframe) iframe.remove();
  }
}

function generateMinimal({ name, specialty, city, attendance, tagline, services, whatsapp, instagram, images }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const wa = whatsapp.replace(/\D/g, '');
  const data = { name, specialty, city, attendance, tagline, services, whatsapp, instagram, images };
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} | ${specialty}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#fff;color:#111}a{text-decoration:none}
.nav{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-bottom:1px solid #f0f0f0}
.logo{font-weight:800;font-size:20px;background:linear-gradient(135deg,#7C3AED,#06B6D4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero{padding:80px 40px;max-width:700px;margin:0 auto;text-align:center}
.avatar-img{width:120px;height:120px;border-radius:50%;object-fit:cover;margin:0 auto 24px;border:3px solid #f3f0ff}
.avatar{width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#06B6D4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:36px;font-weight:800;margin:0 auto 24px}
.hero h1{font-size:48px;font-weight:900;line-height:1.1;letter-spacing:-2px;margin-bottom:12px}
.hero .tag{display:inline-block;background:#f3f0ff;color:#7C3AED;padding:6px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-bottom:20px}
.hero p{font-size:18px;color:#555;line-height:1.6;margin-bottom:32px}
.cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;padding:16px 32px;border-radius:12px;font-weight:700;font-size:16px;transition:transform .2s}
.cta:hover{transform:translateY(-2px)}
.services{background:#fafafa;padding:60px 40px}
.services h2{text-align:center;font-size:32px;font-weight:800;margin-bottom:40px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;max-width:800px;margin:0 auto}
.card{background:#fff;border-radius:12px;padding:20px;border:1px solid #eee;text-align:center}
.card-num{font-size:28px;font-weight:900;color:#7C3AED}
.card p{font-size:14px;color:#555;margin-top:4px;line-height:1.4}
.contact{padding:60px 40px;text-align:center}
.contact h2{font-size:32px;font-weight:800;margin-bottom:12px}
.contact p{color:#555;margin-bottom:28px}
.social{margin-top:20px;display:flex;gap:12px;justify-content:center}
.soc{background:#f0f0f0;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;color:#333;transition:.2s}
.soc:hover{background:#7C3AED;color:#fff}
footer{padding:20px;text-align:center;font-size:12px;color:#999}
</style></head><body>
<nav class="nav"><div class="logo">LeadFlow</div><span style="font-size:13px;color:#999">${city}</span></nav>
<section class="hero">
  <img src="${getTemplateImage(data, 0, 'https://picsum.photos/id/1015/400/400')}" class="avatar-img">
  <span class="tag">${specialty}</span>
  <h1>${name}</h1>
  <p>${tagline}</p>
  ${wa ? `<a class="cta" href="https://wa.me/55${wa}">📅 Agendar Consulta</a>` : `<a class="cta" href="#">📅 Agendar Consulta</a>`}
</section>
<section class="services"><h2>Nossos Serviços</h2>
  <div class="grid">${services.map((s, i) => `<div class="card"><div class="card-num">0${i + 1}</div><p>${s}</p></div>`).join('')}</div>
</section>
<section class="contact">
  <h2>Vamos conversar?</h2>
  <p>Atendimento ${city ? `em ${city}` : ''} — ${attendance}</p>
  ${wa ? `<a class="cta" href="https://wa.me/55${wa}" style="margin-bottom:8px">💬 WhatsApp</a>` : ''}
  <div class="social">${instagram ? `<a class="soc" href="https://instagram.com/${instagram.replace('@', '')}" target="_blank">📸 ${instagram}</a>` : ''}
  </div>
</section>
<footer>© 2025 ${name} — ${specialty}</footer>
</body></html>`;
}

function generatePremium({ name, specialty, city, attendance, tagline, services, whatsapp, instagram, images }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const wa = whatsapp.replace(/\D/g, '');
  const data = { name, specialty, city, attendance, tagline, services, whatsapp, instagram, images };
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} | ${specialty}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#0a0a10;color:#fff}a{text-decoration:none}
.nav{display:flex;justify-content:space-between;align-items:center;padding:20px 48px;border-bottom:1px solid rgba(255,255,255,0.07)}
.logo-nav{font-weight:800;font-size:18px;background:linear-gradient(135deg,#A78BFA,#67E8F9);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero{min-height:90vh;display:flex;align-items:center;justify-content:center;padding:60px 48px;background:radial-gradient(ellipse at 20% 50%,rgba(124,58,237,0.15) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(6,182,212,0.1) 0%,transparent 50%);position:relative;overflow:hidden}
.hero-img-bg { position: absolute; inset: 0; z-index: -1; opacity: 0.2; object-fit: cover; width: 100%; height: 100%; }
.hero-content{max-width:680px;text-align:center}
.badge{display:inline-block;background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);color:#A78BFA;padding:8px 20px;border-radius:24px;font-size:13px;font-weight:600;margin-bottom:28px}
.hero h1{font-size:60px;font-weight:900;line-height:1.05;letter-spacing:-2.5px;margin-bottom:20px;background:linear-gradient(135deg,#fff 40%,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:18px;color:#A1A1AA;line-height:1.7;margin-bottom:40px}
.hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn-main{background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;padding:16px 32px;border-radius:12px;font-weight:700;font-size:15px;transition:.2s}
.btn-main:hover{transform:translateY(-2px);box-shadow:0 0 32px rgba(124,58,237,0.4)}
.btn-out{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:16px 32px;border-radius:12px;font-weight:600;font-size:15px}
.services{padding:80px 48px;background:#0d0d18}
.s-head{text-align:center;margin-bottom:48px}
.s-head h2{font-size:38px;font-weight:800;letter-spacing:-1px}
.s-head p{color:#71717A;margin-top:8px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;max-width:900px;margin:0 auto}
.card{background:#13131f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;transition:.2s}
.card:hover{border-color:rgba(124,58,237,0.4);transform:translateY(-4px)}
.card-icon{width:44px;height:44px;background:rgba(124,58,237,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
.card h3{font-size:15px;font-weight:700;margin-bottom:6px}
.card p{font-size:13px;color:#71717A;line-height:1.5}
.cta-sec{padding:80px 48px;text-align:center;background:linear-gradient(135deg,rgba(124,58,237,0.1),rgba(6,182,212,0.05));border-top:1px solid rgba(255,255,255,0.05)}
.cta-sec h2{font-size:38px;font-weight:800;margin-bottom:12px}
.cta-sec p{color:#A1A1AA;margin-bottom:32px}
footer{padding:24px;text-align:center;font-size:12px;color:#52525B;border-top:1px solid rgba(255,255,255,0.05)}
</style></head><body>
<nav class="nav"><div class="logo-nav">✦ ${name.split(' ')[0]}</div><span style="font-size:13px;color:#71717A">${city}</span></nav>
<section class="hero">
  <img src="${getTemplateImage(data, 0, 'https://picsum.photos/id/1015/1200/800')}" class="hero-img-bg">
  <div class="hero-content">
  <div class="badge">✦ ${specialty}</div>
  <h1>${name}</h1>
  <p>${tagline}</p>
  <div class="hero-btns">
    ${wa ? `<a class="btn-main" href="https://wa.me/55${wa}">📅 Agendar Consulta</a>` : `<a class="btn-main" href="#">📅 Agendar Consulta</a>`}
    ${instagram ? `<a class="btn-out" href="https://instagram.com/${instagram.replace('@', '')}" target="_blank">📸 Instagram</a>` : ''}
  </div>
</div></section>
<section class="services"><div class="s-head"><h2>Serviços</h2><p>Conheça as soluções disponíveis</p></div>
<div class="grid">${services.map((s, i) => `<div class="card"><div class="card-icon">${['🥗', '💪', '🎯', '🌿', '⚡', '❤️'][i] || '✓'}</div><h3>${s}</h3><p>Programa personalizado para suas necessidades e objetivos.</p></div>`).join('')}</div>
</section>
<section class="cta-sec"><h2>Pronta para começar?</h2><p>Atendimento ${city ? `em ${city}` : ''} — ${specialty}</p>
${wa ? `<a class="btn-main" href="https://wa.me/55${wa}">💬 Falar no WhatsApp</a>` : ''}
</section>
<footer>© 2025 ${name} — Todos os direitos reservados</footer>
</body></html>`;
}

function generateModern({ name, specialty, city, attendance, tagline, services, whatsapp, instagram, images }) {
  const wa = whatsapp.replace(/\D/g, '');
  const data = { name, specialty, city, attendance, tagline, services, whatsapp, instagram, images };
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} | ${specialty}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#fff;color:#111}a{text-decoration:none}
.nav{display:flex;justify-content:space-between;align-items:center;padding:20px 48px;position:fixed;top:0;width:100%;z-index:100;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);border-bottom:1px solid #f5f5f5}
.logo-nav{font-weight:900;font-size:18px}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;padding-top:64px}
.hero-left{background:linear-gradient(rgba(16,185,129,0.8),rgba(6,182,212,0.8)), url('${getTemplateImage(data, 0, 'https://picsum.photos/id/1015/1000/1000')}'); background-size: cover; background-position: center; display:flex; align-items:center; padding:60px 48px}
.hero-left-content{color:#fff; z-index: 1;}
.hero-left h1{font-size:52px;font-weight:900;line-height:1.1;letter-spacing:-2px;margin-bottom:16px}
.hero-left p{font-size:16px;opacity:.85;line-height:1.7;margin-bottom:32px}
.cta-white{background:#fff;color:#10B981;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;transition:.2s}
.cta-white:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15)}
.hero-right{display:flex;flex-direction:column;justify-content:center;padding:60px 48px;background:#f9f9f9}
.tag-green{display:inline-block;background:#d1fae5;color:#065F46;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px}
.hero-right h2{font-size:36px;font-weight:800;margin-bottom:12px}
.hero-right p{color:#555;line-height:1.6;font-size:15px}
.services{padding:80px 48px}
.s-head{margin-bottom:40px}
.s-head h2{font-size:36px;font-weight:800}
.s-head p{color:#777;margin-top:6px}
.list{display:flex;flex-direction:column;gap:1px}
.list-item{display:flex;align-items:center;gap:16px;padding:20px 24px;background:#fafafa;border-radius:8px;margin-bottom:8px;transition:.2s;border-left:3px solid transparent}
.list-item:hover{border-left-color:#10B981;background:#f0fdf4}
.li-num{width:36px;height:36px;background:#d1fae5;color:#065F46;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0}
.li-text{font-size:15px;font-weight:600}
.contact{padding:60px 48px;background:linear-gradient(135deg,#10B981,#065F46);color:#fff;text-align:center}
.contact h2{font-size:36px;font-weight:800;margin-bottom:8px}
.contact p{opacity:.85;margin-bottom:28px}
.cta-light{background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.3);color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;display:inline-block;transition:.2s}
.cta-light:hover{background:rgba(255,255,255,0.25)}
footer{padding:20px;text-align:center;font-size:12px;color:#999}
@media(max-width:768px){.hero{grid-template-columns:1fr}.hero-left h1{font-size:36px}.nav{padding:16px 20px}.hero-left,.hero-right{padding:40px 20px}.services,.contact{padding:60px 20px}}
</style></head><body>
<nav class="nav"><div class="logo-nav">${name.split(' ')[0]}</div><span style="font-size:13px;color:#999">${city}</span></nav>
<section class="hero">
  <div class="hero-left"><div class="hero-left-content">
    <h1>${tagline}</h1>
    <p>${specialty} ${city ? `em ${city}` : ''}</p>
    ${wa ? `<a class="cta-white" href="https://wa.me/55${wa}">📅 Agendar Agora</a>` : `<a class="cta-white" href="#">📅 Agendar Agora</a>`}
  </div></div>
  <div class="hero-right">
    <span class="tag-green">${specialty}</span>
    <h2>${name}</h2>
    <p>${tagline}. Tratamentos personalizados baseados na sua individualidade e objetivos.</p>
  </div>
</section>
<section class="services"><div class="s-head"><h2>O que ofereço</h2><p>Serviços especializados para você</p></div>
<div class="list">${services.map((s, i) => `<div class="list-item"><div class="li-num">0${i + 1}</div><div class="li-text">${s}</div></div>`).join('')}</div>
</section>
<section class="contact">
  <h2>Vamos começar?</h2>
  <p>${name} — ${specialty} ${city ? `· ${city}` : ''}</p>
  ${wa ? `<a class="cta-light" href="https://wa.me/55${wa}" style="margin:0 8px">💬 WhatsApp</a>` : ''}
  ${instagram ? `<a class="cta-light" href="https://instagram.com/${instagram.replace('@', '')}" target="_blank" style="margin:0 8px">📸 Instagram</a>` : ''}
</section>
<footer>© 2025 ${name}</footer>
</body></html>`;
}

function generateElite({ name, specialty, city, tagline, services, whatsapp, instagram, images }) {
  const wa = whatsapp.replace(/\D/g, '');
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const instaHandle = instagram ? instagram.replace('@', '') : '';
  const data = { name, specialty, city, tagline, services, whatsapp, instagram, images };

  const servicesHtml = services.slice(0, 4).map((s, i) => `
    <div class="flex gap-x-6">
      <div class="text-[#00A8E8] text-4xl font-light">0${i + 1}</div>
      <div>
        <p class="font-semibold text-xl">${s}</p>
        <p class="text-gray-600">Atendimento personalizado com foco nos seus resultados.</p>
      </div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} • ${specialty}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
    :root { --primary: #00A8E8; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .heading-font { font-family: 'Playfair Display', serif; }
    .hero-bg {
      background-image: linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.35)), 
      url('${getTemplateImage(data, 0, 'https://picsum.photos/id/1015/2000/1200')}');
      background-size: cover; background-position: center;
    }
    .nav-link { transition: all 0.3s ease; }
    .nav-link:hover { color: #00A8E8; transform: translateY(-1px); }
    .result-img { transition: transform 0.4s ease; }
    .result-img:hover { transform: scale(1.05); }
  </style>
</head>
<body class="bg-white text-gray-900 overflow-x-hidden">

  <!-- NAVBAR -->
  <nav class="bg-white border-b border-gray-100 fixed w-full z-50">
    <div class="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
      <div class="flex items-center gap-x-3">
        <div class="w-9 h-9 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">${initials}</div>
        <span class="heading-font text-2xl font-semibold tracking-tighter text-gray-900">${name.toUpperCase()}</span>
      </div>
      <div class="hidden md:flex items-center gap-x-10 text-sm font-medium">
        <a href="#home" class="nav-link text-gray-700">INÍCIO</a>
        <a href="#servicos" class="nav-link text-gray-700">SERVIÇOS</a>
        <a href="#resultados" class="nav-link text-gray-700">RESULTADOS</a>
        <a href="#contato" class="nav-link text-gray-700">CONTATO</a>
      </div>
      ${wa ? `<a href="https://wa.me/55${wa}" class="bg-[#00A8E8] hover:bg-[#0090c7] transition-all text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wider flex items-center gap-x-2"><i class="fas fa-calendar-check"></i> AGENDAR CONSULTA</a>` : `<a href="#contato" class="bg-[#00A8E8] text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wider">AGENDAR CONSULTA</a>`}
    </div>
  </nav>

  <!-- HERO -->
  <section id="home" class="hero-bg h-screen flex items-center relative">
    <div class="max-w-7xl mx-auto px-8 pt-20">
      <div class="max-w-xl">
        <h1 class="heading-font text-white text-7xl leading-none font-light tracking-tighter mb-4">${name.toUpperCase()}</h1>
        <p class="text-white text-3xl font-light tracking-wide mb-10">${specialty}</p>
        ${wa ? `<a href="https://wa.me/55${wa}" class="inline-flex items-center gap-x-3 bg-white text-gray-900 hover:bg-gray-100 transition-all px-10 py-5 rounded-full text-lg font-semibold"><span>AGENDAR CONSULTA</span><i class="fas fa-arrow-right"></i></a>` : ''}
      </div>
    </div>
    ${city ? `<div class="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md px-6 py-3 rounded-3xl shadow-2xl flex items-center gap-x-3"><div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span class="text-sm font-medium">Atendimento em ${city}</span></div>` : ''}
  </section>

  <!-- SOBRE / DESTAQUE -->
  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-8">
      <div class="grid md:grid-cols-2 gap-16 items-center">
        <div class="relative flex justify-center">
          <img src="${getTemplateImage(data, 1, 'https://picsum.photos/id/201/620/580')}" alt="${name}" class="w-full max-w-md rounded-[4rem] object-cover shadow-2xl">
        </div>
        <div>
          <div class="inline-flex items-center gap-x-2 bg-sky-100 text-sky-700 px-5 py-2 rounded-full text-sm font-semibold mb-6"><i class="fas fa-medal"></i> ESPECIALISTA</div>
          <h2 class="heading-font text-5xl font-semibold tracking-tighter leading-none mb-8">${tagline}</h2>
          <p class="text-2xl text-gray-700 font-light leading-relaxed mb-10">${specialty} ${city ? `em ${city}` : ''} com tratamentos personalizados para resultados reais.</p>
          <div class="space-y-6 text-gray-600">
            <div class="flex gap-x-5"><div class="w-8 h-8 flex-shrink-0 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-xl">✦</div><div><p class="font-semibold text-lg">Diagnóstico Completo</p><p class="text-sm">Avaliação detalhada e individualizada antes de qualquer protocolo</p></div></div>
            <div class="flex gap-x-5"><div class="w-8 h-8 flex-shrink-0 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-xl">🎯</div><div><p class="font-semibold text-lg">Protocolos Personalizados</p><p class="text-sm">Cada paciente recebe um plano único para seus objetivos</p></div></div>
            <div class="flex gap-x-5"><div class="w-8 h-8 flex-shrink-0 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center text-xl">📈</div><div><p class="font-semibold text-lg">Resultados Comprovados</p><p class="text-sm">Acompanhamento contínuo para garantir evolução real</p></div></div>
          </div>
          ${wa ? `<a href="https://wa.me/55${wa}" class="mt-12 group inline-flex items-center gap-x-4 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-3xl transition-all"><span class="font-semibold text-lg">Agende sua Consulta</span><span class="text-2xl transition-transform group-hover:translate-x-2">→</span></a>` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- RESULTADOS -->
  <section id="resultados" class="py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-8">
      <div class="text-center mb-16">
        <span class="uppercase tracking-[3px] text-sky-600 font-medium text-sm">Galeria</span>
        <h2 class="heading-font text-5xl font-semibold mt-3">Resultados Reais</h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        ${[2, 3, 4, 5, 6, 7].map((id, i) => `<div class="bg-white rounded-3xl overflow-hidden shadow-sm result-img"><img src="${getTemplateImage(data, id, `https://picsum.photos/id/${237 + i}/400/320`)}" alt="Resultado ${i + 1}" class="w-full h-64 object-cover"><div class="p-4 text-center text-xs font-medium text-gray-500">Paciente ${String.fromCharCode(65 + i)} • ${(i + 1) * 30} dias</div></div>`).join('')}
      </div>
    </div>
  </section>

  <!-- DEPOIMENTO DESTAQUE -->
  <section class="bg-[#00A8E8] py-20 text-white">
    <div class="max-w-7xl mx-auto px-8 grid md:grid-cols-12 gap-12 items-center">
      <div class="md:col-span-5"><img src="${getTemplateImage(data, 8, 'https://picsum.photos/id/64/600/700')}" alt="Paciente" class="rounded-3xl shadow-2xl w-full"></div>
      <div class="md:col-span-7"><div class="max-w-lg">
        <div class="uppercase text-xs tracking-[2px] opacity-75 mb-2">HISTÓRIA REAL</div>
        <h2 class="heading-font text-5xl font-light leading-none mb-8">Uma de nossas pacientes que fez a diferença</h2>
        <div class="italic text-2xl leading-relaxed mb-10">"O atendimento personalizado e o comprometimento com meus resultados foram transformadores. Recomendo de coração!"</div>
        <div class="flex items-center gap-x-4">
          <div class="w-14 h-14 bg-white/30 rounded-2xl"></div>
          <div><p class="font-semibold">Paciente satisfeita</p><p class="text-sm opacity-75">${city || 'Brasil'}</p></div>
        </div>
      </div></div>
    </div>
  </section>

  <!-- SERVIÇOS -->
  <section id="servicos" class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-8">
      <div class="grid md:grid-cols-12 gap-16">
        <div class="md:col-span-5">
          <img src="${getTemplateImage(data, 9, 'https://picsum.photos/id/1005/700/900')}" alt="${name}" class="rounded-3xl shadow-xl">
          <div class="mt-6 flex items-center gap-x-3 text-sm">
            <div class="bg-emerald-400 text-white text-xs px-3 py-1 rounded-full font-medium">✓ Especialista</div>
            <span class="text-gray-500">${specialty}</span>
          </div>
        </div>
        <div class="md:col-span-7 pt-8">
          <h2 class="heading-font text-5xl font-semibold leading-none mb-12">Tratamentos personalizados para quem busca resultados <span class="text-[#00A8E8]">reais</span></h2>
          <div class="space-y-8">${servicesHtml}</div>
          ${wa ? `<a href="https://wa.me/55${wa}" class="mt-16 inline-block bg-[#00A8E8] text-white px-10 py-5 rounded-3xl font-semibold text-lg">Quero meu protocolo personalizado</a>` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- DEPOIMENTOS -->
  <section class="py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-8">
      <div class="text-center mb-16">
        <span class="text-sky-600 text-sm font-medium">DEPOIMENTOS</span>
        <h2 class="heading-font text-5xl mt-3">O que dizem sobre ${name.split(' ')[0]}</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-8 rounded-3xl shadow-sm"><div class="flex gap-x-1 text-amber-400 mb-6">★★★★★</div><p class="italic text-gray-700">"Profissionalismo e resultados reais. Melhor investimento que fiz!"</p><div class="mt-8 flex items-center gap-x-3"><img src="${getTemplateImage(data, 10, 'https://picsum.photos/id/64/60/60')}" class="w-10 h-10 rounded-full object-cover"><div><p class="font-medium">Ana Clara</p><p class="text-xs text-gray-500">${city || 'Brasil'} • 2025</p></div></div></div>
        <div class="bg-white p-8 rounded-3xl shadow-sm"><div class="flex gap-x-1 text-amber-400 mb-6">★★★★★</div><p class="italic text-gray-700">"Atendimento humanizado e tratamento que realmente funciona. Indico sempre!"</p><div class="mt-8 flex items-center gap-x-3"><img src="${getTemplateImage(data, 11, 'https://picsum.photos/id/201/60/60')}" class="w-10 h-10 rounded-full object-cover"><div><p class="font-medium">Mariana S.</p><p class="text-xs text-gray-500">${city || 'Brasil'} • 2025</p></div></div></div>
        <div class="bg-white p-8 rounded-3xl shadow-sm"><div class="flex gap-x-1 text-amber-400 mb-6">★★★★☆</div><p class="italic text-gray-700">"Finalmente encontrei o profissional certo. Resultado visível em poucas semanas!"</p><div class="mt-8 flex items-center gap-x-3"><img src="${getTemplateImage(data, 12, 'https://picsum.photos/id/1009/60/60')}" class="w-10 h-10 rounded-full object-cover"><div><p class="font-medium">Beatriz L.</p><p class="text-xs text-gray-500">${city || 'Brasil'} • 2025</p></div></div></div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer id="contato" class="bg-[#0A2540] text-white py-20">
    <div class="max-w-7xl mx-auto px-8 grid md:grid-cols-12 gap-y-16">
      <div class="md:col-span-4">
        <div class="flex items-center gap-x-3 mb-6">
          <div class="w-9 h-9 bg-sky-400 rounded-full flex items-center justify-center text-[#0A2540] font-bold">${initials}</div>
          <span class="heading-font text-2xl font-semibold">${name.toUpperCase()}</span>
        </div>
        <p class="text-gray-400 max-w-xs">${specialty} ${city ? `em ${city}` : ''} — atendimento dedicado e resultados reais.</p>
        <div class="mt-12 flex gap-x-6 text-2xl">
          ${instaHandle ? `<a href="https://instagram.com/${instaHandle}" target="_blank" class="fab fa-instagram hover:text-sky-400 cursor-pointer"></a>` : '<i class="fab fa-instagram text-gray-600"></i>'}
          ${wa ? `<a href="https://wa.me/55${wa}" class="fab fa-whatsapp hover:text-sky-400 cursor-pointer"></a>` : '<i class="fab fa-whatsapp text-gray-600"></i>'}
        </div>
      </div>
      <div class="md:col-span-2">
        <h4 class="font-semibold mb-6 text-sky-400">MENU</h4>
        <div class="space-y-3 text-sm text-gray-300"><p>Início</p><p>Serviços</p><p>Resultados</p><p>Contato</p></div>
      </div>
      <div class="md:col-span-3">
        <h4 class="font-semibold mb-6 text-sky-400">CONTATO</h4>
        <div class="space-y-4 text-sm">
          ${city ? `<p class="flex items-center gap-x-3"><i class="fas fa-map-marker-alt"></i>${city}</p>` : ''}
          ${wa ? `<p class="flex items-center gap-x-3"><i class="fas fa-phone"></i>${whatsapp}</p>` : ''}
          ${instaHandle ? `<p class="flex items-center gap-x-3"><i class="fab fa-instagram"></i>@${instaHandle}</p>` : ''}
        </div>
      </div>
      <div class="md:col-span-3">
        <h4 class="font-semibold mb-6 text-sky-400">AGENDAR AGORA</h4>
        <p class="text-gray-400 text-sm mb-6">Entre em contato e agende sua consulta.</p>
        ${wa ? `<a href="https://wa.me/55${wa}" class="w-full bg-white text-[#0A2540] py-5 rounded-3xl font-semibold flex items-center justify-center gap-x-3 hover:scale-105 transition-transform"><i class="fab fa-whatsapp text-2xl text-green-500"></i> FALAR NO WHATSAPP</a>` : ''}
      </div>
    </div>
    <div class="text-center text-gray-500 text-xs mt-20">© 2025 ${name} — ${specialty} — Todos os direitos reservados</div>
  </footer>

</body>
</html>`;
}


function generateClinica({ name, specialty, city, attendance, tagline, services, whatsapp, instagram, images }) {
  const wa = whatsapp.replace(/\D/g, '');
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const instaHandle = instagram ? instagram.replace('@', '') : '';
  const lastName = name.split(' ').filter(w => !w.match(/^dr[ao]?\.?$/i)).pop() || name;
  const firstName = name.split(' ').slice(0, 2).join(' ');
  const data = { name, specialty, city, attendance, tagline, services, whatsapp, instagram, images };

  const journeySteps = services.slice(0, 6).map((s, i) => `
    <div class="flex flex-col md:flex-row border-b border-gray-800 pb-6 gap-4 items-start md:items-center">
      <div class="w-full md:w-1/3 flex items-center gap-4">
        <span class="text-brand-green font-serif italic text-xl">0${i + 1}</span>
        <h4 class="font-semibold text-sm text-white">${s}</h4>
      </div>
      <div class="w-full md:w-2/3">
        <p class="text-gray-400 text-xs leading-relaxed">Conduta personalizada e baseada em evidências para garantir os melhores resultados no seu caso.</p>
      </div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - ${specialty}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: { extend: {
        colors: { 'brand-green': '#2a3d2c', 'brand-dark': '#111111', 'brand-gray': '#f8f8f8' },
        fontFamily: { serif: ['"Playfair Display"','serif'], sans: ['Inter','sans-serif'] }
      }}
    }
  </script>
  <style>
    .image-grayscale { filter: grayscale(100%); }
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="font-sans text-gray-800 antialiased overflow-x-hidden">

  <!-- HEADER -->
  <header class="relative h-[500px] flex flex-col justify-between bg-black">
    <div class="absolute inset-0 z-0">
      <img src="${getTemplateImage(data, 0, 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2000&auto=format&fit=crop')}" alt="${specialty}" class="w-full h-full object-cover opacity-60 image-grayscale">
    </div>
    <nav class="relative z-10 flex justify-between items-center px-10 py-6 text-white max-w-7xl mx-auto w-full text-sm">
      <div class="font-serif text-xl tracking-widest font-semibold">${lastName.toUpperCase()}<br><span class="text-sm font-sans tracking-normal font-light">${specialty}</span></div>
      <ul class="hidden md:flex space-x-8">
        <li><a href="#sobre" class="hover:text-gray-300">Sobre</a></li>
        <li><a href="#servicos" class="hover:text-gray-300">Serviços</a></li>
        <li><a href="#jornada" class="hover:text-gray-300">Jornada</a></li>
        <li><a href="#depoimentos" class="hover:text-gray-300">Avaliações</a></li>
      </ul>
      <div class="flex space-x-4">
        ${instaHandle ? `<a href="https://instagram.com/${instaHandle}" target="_blank" class="text-white hover:text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>` : ''}
        ${wa ? `<a href="https://wa.me/55${wa}" target="_blank" class="text-white hover:text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45a2 2 0 0 1 1.18-1.85l2.7-.9a2 2 0 0 1 2.31.9l1.07 2.14a2 2 0 0 1-.46 2.61L7.5 7.5a16 16 0 0 0 6 6"/></svg></a>` : ''}
      </div>
    </nav>
    <div class="relative z-10 bg-brand-green w-full text-center py-3 text-white text-xs tracking-wide">
      <p><strong>${name}</strong> — ${tagline}</p>
    </div>
  </header>

  <!-- INTRO / SOBRE -->
  <section id="sobre" class="max-w-6xl mx-auto py-24 px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
    <div class="flex gap-2">
      <div class="flex flex-col gap-2 w-1/3">
        <img src="${getTemplateImage(data, 1, 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=400&fit=crop')}" class="object-cover h-32 w-full image-grayscale" alt="${specialty}">
        <img src="${getTemplateImage(data, 2, 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop')}" class="object-cover h-32 w-full image-grayscale" alt="${specialty}">
        <img src="${getTemplateImage(data, 3, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop')}" class="object-cover h-32 w-full image-grayscale" alt="${specialty}">
      </div>
      <div class="w-2/3">
        <img src="${getTemplateImage(data, 4, 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=600&h=800&fit=crop')}" class="object-cover h-full w-full image-grayscale" alt="${name}">
      </div>
    </div>
    <div>
      <span class="text-xs tracking-widest text-gray-400 uppercase font-semibold">${specialty}</span>
      <h2 class="font-serif text-4xl mt-4 mb-6 leading-snug">${tagline}<br><span class="italic text-gray-600">com precisão e dedicação.</span></h2>
      <p class="text-gray-600 text-sm mb-4 leading-relaxed">Especialista em ${specialty}, ${name} combina o que há de mais moderno em diagnóstico e tratamento para devolver função, conforto e qualidade de vida aos seus pacientes.</p>
      <p class="text-gray-600 text-sm mb-8 leading-relaxed">Cada paciente recebe um atendimento individualizado, com protocolo baseado em evidências e acompanhamento contínuo para garantir resultados reais e duradouros.</p>
      ${wa ? `<a href="https://wa.me/55${wa}" class="bg-brand-green text-white px-6 py-3 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-2 hover:bg-green-900 transition">📅 AGENDAR UMA CONSULTA</a>` : ''}
    </div>
  </section>

  <!-- SERVIÇOS -->
  <section id="servicos" class="bg-brand-gray py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-end mb-12">
        <div>
          <span class="text-xs tracking-widest text-gray-400 uppercase font-semibold">Especialidades</span>
          <h2 class="font-serif text-3xl mt-2">Áreas de Atuação<br><span class="italic">e Tratamentos</span></h2>
        </div>
        <p class="text-xs text-gray-500 max-w-xs text-right hidden md:block">Conheça os serviços disponíveis e como podemos te ajudar a recuperar sua saúde e bem-estar.</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-${Math.min(services.length, 6)} gap-4">
        ${services.slice(0, 6).map((s, i) => {
    const defaultImgs = [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=600&fit=crop'
    ];
    return `<div class="relative group cursor-pointer overflow-hidden">
            <img src="${getTemplateImage(data, 5 + i, defaultImgs[i % defaultImgs.length])}" class="w-full h-64 object-cover image-grayscale group-hover:scale-105 transition duration-500" alt="${s}">
            <div class="absolute inset-0 bg-black/40"></div>
            <div class="absolute bottom-4 left-4 text-white text-xs font-semibold">${s}</div>
          </div>`;
  }).join('')}
      </div>
    </div>
  </section>

  <!-- MÉDICO / SOBRE -->
  <section class="bg-[#1a1a1a] text-white flex flex-col md:flex-row items-stretch">
    <div class="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
      <span class="text-xs tracking-widest text-gray-400 uppercase font-semibold">Quem é o seu médico?</span>
      <h2 class="font-serif text-4xl mt-4 mb-6">${firstName} <span class="italic text-gray-400">${lastName}</span></h2>
      <p class="text-gray-400 text-sm mb-4 leading-relaxed">Especialista em ${specialty} com dedicação exclusiva ao cuidado dos seus pacientes, combinando atualização científica constante com atendimento humanizado.</p>
      <p class="text-gray-400 text-sm mb-8 leading-relaxed">${city ? `Atendendo em ${city}, ` : ''}${name} prioriza o diagnóstico preciso e o tratamento personalizado para devolver movimento, saúde e qualidade de vida a cada paciente.</p>
      ${wa ? `<a href="https://wa.me/55${wa}" class="bg-brand-green w-fit text-white px-6 py-3 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-2 hover:bg-green-900 transition">📅 AGENDAR UMA CONSULTA</a>` : ''}
    </div>
    <div class="w-full md:w-1/2 flex">
      <img src="${getTemplateImage(data, 11, 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=600&h=800&fit=crop')}" class="w-1/2 object-cover image-grayscale border-r border-gray-800" alt="${name}">
      <img src="${getTemplateImage(data, 12, 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=800&fit=crop')}" class="w-1/2 object-cover image-grayscale" alt="${name}">
    </div>
  </section>

  <!-- JORNADA DO PACIENTE -->
  <section id="jornada" class="bg-brand-dark text-white py-24 px-6 border-t border-gray-800">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <span class="text-xs tracking-widest text-gray-500 uppercase font-semibold">Jornada do Paciente</span>
        <h2 class="font-serif text-3xl mt-4">Da primeira consulta ao retorno do<br><span class="italic text-gray-400">movimento, como cuidamos de você</span></h2>
      </div>
      <div class="space-y-6">${journeySteps}</div>
      <div class="mt-16 text-center text-xs text-gray-500 tracking-wide">
        Resultado esperado: <strong class="text-white">menos dor, mais saúde e uma volta segura às suas rotinas.</strong>
      </div>
    </div>
  </section>

  <!-- DEPOIMENTOS -->
  <section id="depoimentos" class="py-24 px-6 bg-white">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
      <div class="w-full md:w-1/3">
        <span class="text-xs tracking-widest text-gray-400 uppercase font-semibold">Depoimentos</span>
        <h2 class="font-serif text-3xl mt-4 mb-4">Histórias reais de<br><span class="italic text-gray-500">confiança e cuidado</span></h2>
        <p class="text-gray-600 text-sm mb-8 leading-relaxed">Os depoimentos refletem não apenas os resultados, mas a atenção, respeito e dedicação em cada etapa do tratamento.</p>
        ${wa ? `<a href="https://wa.me/55${wa}" class="bg-brand-green text-white px-6 py-3 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-2 hover:bg-green-900 transition">💬 FALAR NO WHATSAPP</a>` : ''}
      </div>
      <div class="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-brand-gray p-8 rounded-sm shadow-sm flex flex-col justify-between">
          <div><div class="flex text-yellow-500 mb-4 text-xs">★★★★★</div><p class="text-gray-600 text-xs italic leading-relaxed mb-6">"Profissional excepcional! O tratamento foi um sucesso. Recomendo 100%!"</p></div>
          <div class="flex items-center gap-3"><img src="${getTemplateImage(data, 13, 'https://i.pravatar.cc/150?u=1')}" class="w-8 h-8 rounded-full object-cover grayscale"><span class="text-xs font-semibold text-gray-800">Guilherme F.</span></div>
        </div>
        <div class="bg-brand-gray p-8 rounded-sm shadow-sm flex flex-col justify-between">
          <div><div class="flex text-yellow-500 mb-4 text-xs">★★★★★</div><p class="text-gray-600 text-xs italic leading-relaxed mb-6">"Muito atencioso, explica tudo com paciência e clareza. Ótimo médico!"</p></div>
          <div class="flex items-center gap-3"><img src="${getTemplateImage(data, 14, 'https://i.pravatar.cc/150?u=2')}" class="w-8 h-8 rounded-full object-cover grayscale"><span class="text-xs font-semibold text-gray-800">Luciana M.</span></div>
        </div>
        <div class="bg-brand-gray p-8 rounded-sm shadow-sm flex flex-col justify-between">
          <div><div class="flex text-yellow-500 mb-4 text-xs">★★★★★</div><p class="text-gray-600 text-xs italic leading-relaxed mb-6">"Excelente médico, muito competente. O tratamento foi um sucesso!"</p></div>
          <div class="flex items-center gap-3"><img src="${getTemplateImage(data, 15, 'https://i.pravatar.cc/150?u=3')}" class="w-8 h-8 rounded-full object-cover grayscale"><span class="text-xs font-semibold text-gray-800">Eliane G.</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-brand-dark text-gray-400 py-16 px-6 border-t-[20px] border-white">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-center mb-16">
        <div class="text-white text-center font-serif text-2xl tracking-widest font-semibold">
          ${lastName.toUpperCase()}<br>
          <span class="text-sm font-sans tracking-normal font-light">${specialty}</span>
          <div class="text-[8px] uppercase tracking-widest font-sans font-light mt-1">${city || ''}</div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-xs border-b border-gray-800 pb-12">
        <div>
          <h5 class="text-white font-semibold mb-4 uppercase tracking-widest text-[10px]">${city ? 'Localização' : 'Contato'}</h5>
          <p class="leading-relaxed">${city ? `${city}` : 'Consulte disponibilidade'}</p>
        </div>
        <div>
          <h5 class="text-white font-semibold mb-4 uppercase tracking-widest text-[10px]">Contato</h5>
          <p class="leading-relaxed">${wa ? `WhatsApp: ${whatsapp}` : 'Entre em contato'}</p>
        </div>
        <div>
          <h5 class="text-white font-semibold mb-4 uppercase tracking-widest text-[10px]">Redes Sociais</h5>
          <p class="leading-relaxed">${instaHandle ? `@${instaHandle}` : `${name}`}</p>
        </div>
      </div>
      <div class="pt-8 flex flex-col md:flex-row justify-between items-center text-[10px]">
        <p>© 2025 ${name} — ${specialty}. Todos os direitos reservados.</p>
        <div class="flex space-x-4 mt-4 md:mt-0">
          ${instaHandle ? `<a href="https://instagram.com/${instaHandle}" target="_blank" class="hover:text-white">Instagram</a>` : ''}
          ${wa ? `<a href="https://wa.me/55${wa}" class="hover:text-white">WhatsApp</a>` : ''}
        </div>
      </div>
    </div>
  </footer>

</body>
</html>`;
}

function goGenerate(leadId) {
  navigate('generator');
  setTimeout(() => {
    document.getElementById('genLeadSelect').value = leadId;
    document.getElementById('genLeadSelect').dispatchEvent(new Event('change'));
  }, 100);
}

// ---- MESSAGES ----
function populateMsgLeadSelect() {
  const sel = document.getElementById('msgLeadSelect');
  sel.innerHTML = '<option value="">— Selecionar Lead —</option>' +
    state.leads.map(l => `<option value="${l.id}">${l.name} ${l.instagram ? `(${l.instagram})` : ''}</option>`).join('');
}

function renderMsgTemplate(idx) {
  state.currentMsgTemplate = idx;
  document.querySelectorAll('.msg-template-item').forEach((el, i) => el.classList.toggle('selected', i === idx));
  document.getElementById('msgText').value = MSG_TEMPLATES[idx].text;
  updateCharCount();
}

function updateCharCount() {
  document.getElementById('charCount').textContent = document.getElementById('msgText').value.length;
}

function resolveMsg() {
  const leadId = document.getElementById('msgLeadSelect').value;
  let text = document.getElementById('msgText').value;
  if (leadId) {
    const l = state.leads.find(x => x.id === leadId);
    if (l) {
      text = text
        .replace(/{{nome}}/g, l.name || '')
        .replace(/{{especialidade}}/g, l.specialty || 'nutricionista')
        .replace(/{{cidade}}/g, l.city || 'sua cidade')
        .replace(/{{link_site}}/g, l.siteLink || '[link do site]');
    }
  }
  return text;
}



// ---- API CONFIG (chaves de IA) ----

async function loadApiConfig() {
  try {
    const res = await fetch('/api/getconfig');
    if (!res.ok) { renderApiStatus(null); return; }
    const c = await res.json();
    // Preenche campos com valores mascarados
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('cfgGroqKey1',     c.groq_key);
    set('cfgGroqKey2',     c.groq_key_2);
    set('cfgGroqKey3',     c.groq_key_3);
    set('cfgAnthropicKey', c.anthropic_key);
    const gm = document.getElementById('cfgGroqModel');
    if (gm) gm.value = c.groq_model || 'llama-3.3-70b-versatile';
    const am = document.getElementById('cfgAnthropicModel');
    if (am) am.value = c.model || 'claude-3-5-haiku-20241022';
    renderApiStatus(c);
  } catch(e) {
    console.warn('[ApiConfig] Servidor não disponível:', e.message);
    renderApiStatus(null);
  }
}

function renderApiStatus(c) {
  const el = document.getElementById('apiStatusBadges');
  if (!el) return;
  if (!c) {
    el.innerHTML = `<span style="font-size:12px;color:#ef4444">⚠️ Servidor não encontrado — inicie o serve.py</span>`;
    return;
  }
  const items = [
    { label: 'Groq 1',    ok: c.has_groq,      color: '#10B981' },
    { label: 'Groq 2',    ok: c.has_groq_2,    color: '#10B981' },
    { label: 'Groq 3',    ok: c.has_groq_3,    color: '#10B981' },
    { label: 'Anthropic', ok: c.has_anthropic,  color: '#7C3AED' },
  ];
  el.innerHTML = items.map(b => `
    <span style="padding:4px 12px;border-radius:12px;font-size:11px;font-weight:700;
      background:${b.ok ? b.color+'22' : 'rgba(255,255,255,.05)'};
      color:${b.ok ? b.color : '#6b7280'};
      border:1px solid ${b.ok ? b.color+'44' : 'rgba(255,255,255,.08)'}">
      ${b.ok ? '✓' : '✗'} ${b.label}
    </span>`).join('');
}

async function exportApiConfig() {
  try {
    const res = await fetch('/api/exportconfig');
    if (!res.ok) throw new Error('Erro ' + res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vjoseph-api-keys.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('📤 Backup das chaves baixado!');
  } catch(e) {
    toast('❌ Erro ao exportar: ' + e.message);
  }
}

async function importApiConfig(input) {
  const file = input?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    // Valida que é um arquivo de config válido
    if (!data || typeof data !== 'object') throw new Error('Arquivo inválido');

    const res = await fetch('/api/setconfig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Erro ' + res.status);

    await loadApiConfig(); // recarrega campos e badges
    toast('✅ Chaves restauradas com sucesso!');
  } catch(e) {
    toast('❌ Erro ao restaurar: ' + e.message);
  } finally {
    // Limpa o input para permitir importar o mesmo arquivo novamente
    if (input) input.value = '';
  }
}

async function saveApiConfig() {
  const btn = document.getElementById('saveApiConfigBtn');
  const orig = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Salvando...'; }
  try {
    const body = {
      groq_key:       (document.getElementById('cfgGroqKey1')?.value || '').trim(),
      groq_key_2:     (document.getElementById('cfgGroqKey2')?.value || '').trim(),
      groq_key_3:     (document.getElementById('cfgGroqKey3')?.value || '').trim(),
      anthropic_key:  (document.getElementById('cfgAnthropicKey')?.value || '').trim(),
      groq_model:     document.getElementById('cfgGroqModel')?.value || 'llama-3.3-70b-versatile',
      model:          document.getElementById('cfgAnthropicModel')?.value || 'claude-3-5-haiku-20241022',
    };
    const res = await fetch('/api/setconfig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Erro ' + res.status);
    const result = await res.json();
    // Atualiza badges com resultado real do servidor
    renderApiStatus(result);
    // Recarrega valores mascarados nos campos
    await loadApiConfig();
    toast('✅ Chaves salvas com sucesso!');
  } catch(e) {
    toast('❌ Erro ao salvar: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = orig; }
  }
}

// ---- SETTINGS ----
function loadSettingsForm() {
  const geminiKeyEl = document.getElementById('geminiKey');
  if (geminiKeyEl) geminiKeyEl.value = state.settings.geminiKey || '';

  const vercelTokenEl = document.getElementById('vercelToken');
  if (vercelTokenEl) vercelTokenEl.value = state.settings.vercelToken || '';

  document.getElementById('servicePrice').value = state.settings.servicePrice;
  document.getElementById('dailyLeadGoal').value = state.settings.dailyLeadGoal;
  document.getElementById('monthlySiteGoal').value = state.settings.monthlySiteGoal || 30;
  document.getElementById('yourName').value = state.settings.yourName || '';
  document.getElementById('yourInstagram').value = state.settings.yourInstagram || '';
}

function saveSettings() {
  const geminiKeyEl = document.getElementById('geminiKey');

  state.settings = {
    geminiKey: geminiKeyEl ? geminiKeyEl.value.trim() : (state.settings.geminiKey || ''),
    vercelToken: document.getElementById('vercelToken') ? document.getElementById('vercelToken').value.trim() : (state.settings.vercelToken || ''),
    servicePrice: parseFloat(document.getElementById('servicePrice').value) || 350,
    dailyLeadGoal: parseInt(document.getElementById('dailyLeadGoal').value) || 100,
    monthlySiteGoal: parseInt(document.getElementById('monthlySiteGoal').value) || 30,
    yourName: document.getElementById('yourName').value.trim(),
    yourInstagram: document.getElementById('yourInstagram').value.trim()
  };
  save();
  renderDashboard();
  toast('Configurações salvas!');
}

// ---- BACKUP & RESTORE ----
function exportBackup() {
  const backup = {
    leads: state.leads,
    settings: state.settings,
    customTemplates: state.customTemplates,
    timestamp: Date.now(),
    version: '1.0'
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leadflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup baixado com sucesso!');
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const name = (file.name || '').toLowerCase();
  const isCsv = name.endsWith('.csv') || (file.type || '').toLowerCase().includes('csv');

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      if (isCsv) {
        const normalize = (s) => (s || '')
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        const parseCSV = (text) => {
          const src = String(text || '').replace(/^\uFEFF/, '');
          const firstLine = (src.split(/\r?\n/)[0] || '');
          const semis = (firstLine.match(/;/g) || []).length;
          const commas = (firstLine.match(/,/g) || []).length;
          const delimiter = semis > commas ? ';' : ',';
          const rows = [];
          let row = [];
          let cur = '';
          let inQuotes = false;

          for (let i = 0; i < src.length; i++) {
            const ch = src[i];
            if (inQuotes) {
              if (ch === '"') {
                const next = src[i + 1];
                if (next === '"') {
                  cur += '"';
                  i++;
                } else {
                  inQuotes = false;
                }
              } else {
                cur += ch;
              }
              continue;
            }

            if (ch === '"') {
              inQuotes = true;
            } else if (ch === delimiter) {
              row.push(cur);
              cur = '';
            } else if (ch === '\n') {
              row.push(cur);
              rows.push(row);
              row = [];
              cur = '';
            } else if (ch !== '\r') {
              cur += ch;
            }
          }

          row.push(cur);
          rows.push(row);
          return rows
            .map(r => r.map(v => (v == null ? '' : String(v)).trim()))
            .filter(r => r.some(v => v.length > 0));
        };

        const parsePtBRDate = (value) => {
          const v = (value || '').toString().trim();
          const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
          if (!m) return null;
          const dd = parseInt(m[1], 10);
          const mm = parseInt(m[2], 10);
          let yyyy = parseInt(m[3], 10);
          if (yyyy < 100) yyyy += 2000;
          const d = new Date(yyyy, mm - 1, dd);
          if (Number.isNaN(d.getTime())) return null;
          return d.getTime();
        };

        const rows = parseCSV(e.target.result);
        if (!rows.length) throw new Error('CSV vazio');

        const header = rows[0].map(h => normalize(h));
        const idx = (names) => {
          for (const n of names) {
            const i = header.indexOf(normalize(n));
            if (i !== -1) return i;
          }
          return -1;
        };

        const iName = idx(['nome', 'name']);
        const iInstagram = idx(['instagram', 'insta']);
        const iSpecialty = idx(['especialidade', 'especialty']);
        const iCity = idx(['cidade', 'city']);
        const iWhatsapp = idx(['whatsapp', 'whats', 'telefone', 'phone']);
        const iStatus = idx(['status']);
        const iSite = idx(['site', 'sitelink', 'link', 'url']);
        const iNotes = idx(['notas', 'notes', 'observacoes', 'observações']);
        const iCreated = idx(['criado', 'created', 'createdat', 'data']);

        const statusMap = {};
        Object.keys(STATUS_LABELS || {}).forEach(k => { statusMap[normalize(STATUS_LABELS[k])] = k; });
        Object.keys(STATUS_LABELS || {}).forEach(k => { statusMap[normalize(k)] = k; });
        const knownStatuses = new Set(Object.keys(STATUS_LABELS || {}));

        const toStatus = (value) => {
          const key = normalize(value).replace(/\s+/g, '_');
          const mapped = statusMap[key] || statusMap[normalize(value)] || '';
          if (mapped && knownStatuses.has(mapped)) return mapped;
          if (key && knownStatuses.has(key)) return key;
          return 'coletado';
        };

        const ensurePipeline = (lead) => {
          if (!lead.pipelineStage) {
            if (lead.status === 'fechado') lead.pipelineStage = 'fechado';
            else if (lead.status === 'contatado') lead.pipelineStage = 'dm_enviada';
            else if (lead.status === 'site_pronto') lead.pipelineStage = 'engajar';
            else lead.pipelineStage = 'engajar';
          }
          if (!lead.history) lead.history = [];
          if (!lead.createdAt) lead.createdAt = Date.now();
          if (!lead.id) lead.id = genId();
          return lead;
        };

        const leads = rows.slice(1).map(r => {
          const nameVal = iName !== -1 ? r[iName] : '';
          const instagramVal = iInstagram !== -1 ? r[iInstagram] : '';
          const specialtyVal = iSpecialty !== -1 ? r[iSpecialty] : '';
          const cityVal = iCity !== -1 ? r[iCity] : '';
          const whatsappVal = iWhatsapp !== -1 ? r[iWhatsapp] : '';
          const statusVal = iStatus !== -1 ? r[iStatus] : '';
          const siteVal = iSite !== -1 ? r[iSite] : '';
          const notesVal = iNotes !== -1 ? r[iNotes] : '';
          const createdVal = iCreated !== -1 ? r[iCreated] : '';

          const createdAt = parsePtBRDate(createdVal) || Date.parse(createdVal) || Date.now();

          return ensurePipeline({
            id: genId(),
            createdAt,
            name: nameVal || 'Lead Sem Nome',
            instagram: instagramVal || '',
            specialty: specialtyVal || '',
            city: cityVal || '',
            whatsapp: whatsappVal || '',
            bio: '',
            avatar: '',
            attendance: 'Online e Presencial',
            tagline: '',
            services: '',
            status: toStatus(statusVal),
            siteLink: siteVal || '',
            notes: notesVal || ''
          });
        }).filter(l => (l.name && l.name !== 'Lead Sem Nome') || (l.instagram && l.instagram.trim().length));

        if (!leads.length) throw new Error('CSV não contém leads válidos');

        if (confirm(`Restaurar ${leads.length} lead(s) a partir do CSV? Isso substituirá os dados atuais.`)) {
          state.leads = leads;
          save();
          renderDashboard();
          renderLeadsTable();
          if (typeof renderProspectingBoard === 'function') renderProspectingBoard();
          const badge = document.getElementById('leadsBadge');
          if (badge) badge.textContent = String(state.leads.length);
          toast('Dados restaurados com sucesso!');
        }
        event.target.value = '';
        return;
      }

      const data = JSON.parse(e.target.result);
      if (!data.leads || !Array.isArray(data.leads)) {
        throw new Error('Arquivo de backup inválido (leads ausentes)');
      }

      if (confirm(`Restaurar backup de ${new Date(data.timestamp || Date.now()).toLocaleDateString()}? Isso substituirá os dados atuais.`)) {
        state.leads = data.leads;
        if (data.settings) state.settings = { ...state.settings, ...data.settings };
        if (data.customTemplates) state.customTemplates = data.customTemplates;

        save();
        renderDashboard();
        renderLeadsTable();
        if (typeof renderProspectingBoard === 'function') renderProspectingBoard();
        toast('Dados restaurados com sucesso!');
      }
    } catch (err) {
      console.error(err);
      toast('Erro ao restaurar backup: ' + err.message);
    }
    // Reset input
    event.target.value = '';
  };
  reader.readAsText(file);
}

// ---- CSV EXPORT ----
function exportCSV() {
  if (!state.leads.length) { alert('Nenhum lead para exportar'); return; }
  const headers = ['Nome', 'Instagram', 'Especialidade', 'Cidade', 'WhatsApp', 'Status', 'Site', 'Notas', 'Criado'];
  const rows = state.leads.map(l => [
    l.name, l.instagram, l.specialty, l.city, l.whatsapp,
    STATUS_LABELS[l.status] || l.status, l.siteLink, l.notes,
    l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : ''
  ].map(v => `"${(v || '').replace(/"/g, '""')}"`));
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `leadflow_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  toast('CSV exportado!');
}

// ---- IMPORT ----
function doImport() {
  const text = document.getElementById('importText').value.trim();
  if (!text) return;
  const lines = text.split('\n').filter(Boolean);
  let count = 0;
  lines.forEach(line => {
    const parts = line.split(',').map(s => s.trim());
    if (parts[0]) {
      state.leads.push({
        id: genId(), createdAt: Date.now(),
        name: parts[0], instagram: parts[1] || '', specialty: parts[2] || '',
        city: parts[3] || '', whatsapp: '', bio: '', status: 'coletado', siteLink: '', notes: ''
      });
      count++;
    }
  });
  save();
  const leadsBadge = document.getElementById('leadsBadge');
  if (leadsBadge) leadsBadge.textContent = state.leads.length;
  closeModal('importModal');
  renderLeadsTable();
  renderDashboard();
  toast(`${count} lead(s) importado(s)!`);
}

// ---- MODAL HELPERS ----
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function previewExternalSite(link) {
  // open in new tab
  window.open(link, '_blank');
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  load();
  renderDashboard();
  syncDashboardTabsUI();

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });
  document.getElementById('topbarMenuBtn').addEventListener('click', () => {
    const sb = document.getElementById('sidebar');
    sb.style.display = '';
    sb.classList.toggle('mobile-open');
  });
  const syncSidebarViewport = () => {
    const sb = document.getElementById('sidebar');
    sb.style.display = '';
    if (window.matchMedia('(min-width: 901px)').matches) sb.classList.remove('mobile-open');
  };
  window.addEventListener('resize', syncSidebarViewport);
  syncSidebarViewport();

  // Navigation
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.view, el); });
  });

  document.querySelectorAll('.btn-link[data-view]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.view));
  });

  // Add lead buttons
  const addBtn = document.getElementById('addLeadBtn');
  if (addBtn) addBtn.addEventListener('click', openAddLead);

  const addBtn2 = document.getElementById('addLeadBtn2');
  if (addBtn2) addBtn2.addEventListener('click', openAddLead);

  document.getElementById('saveLeadBtn').addEventListener('click', saveLead);
  document.getElementById('closeLeadModal').addEventListener('click', () => closeModal('leadModal'));
  document.getElementById('cancelLeadModal').addEventListener('click', () => closeModal('leadModal'));
  const closeLeadTimelineBtn = document.getElementById('closeLeadTimelineModal');
  if (closeLeadTimelineBtn) closeLeadTimelineBtn.addEventListener('click', () => closeModal('leadTimelineModal'));
  const leadTimelineEditBtn = document.getElementById('leadTimelineEditBtn');
  if (leadTimelineEditBtn) {
    leadTimelineEditBtn.addEventListener('click', () => {
      const modal = document.getElementById('leadTimelineModal');
      const id = modal ? modal.dataset.leadId : '';
      if (id) {
        closeModal('leadTimelineModal');
        openEditLead(id);
      }
    });
  }

  initKanbanDnd();

  // Leads filters
  document.getElementById('leadsSearch').addEventListener('input', renderLeadsTable);
  document.getElementById('statusFilter').addEventListener('change', renderLeadsTable);
  document.getElementById('sortFilter').addEventListener('change', renderLeadsTable);
  document.getElementById('dateFilter').addEventListener('change', renderLeadsTable);

  const leadsTabActiveBtn = document.getElementById('leadsTabActive');
  if (leadsTabActiveBtn) leadsTabActiveBtn.addEventListener('click', () => setLeadsTab('ativos'));
  const leadsTabArchivedBtn = document.getElementById('leadsTabArchived');
  if (leadsTabArchivedBtn) leadsTabArchivedBtn.addEventListener('click', () => setLeadsTab('arquivados'));
  syncLeadsTabsUI();



  // Import
  document.getElementById('importLeadsBtn').addEventListener('click', () => document.getElementById('importModal').classList.add('open'));
  document.getElementById('doImportBtn').addEventListener('click', doImport);
  document.getElementById('closeImportModal').addEventListener('click', () => closeModal('importModal'));
  document.getElementById('cancelImportModal').addEventListener('click', () => closeModal('importModal'));

  // Bio analyzer
  document.getElementById('analyzeBioBtn').addEventListener('click', analyzeBio);

  // Generator
  document.getElementById('generateSiteBtn').addEventListener('click', generateSite);
  initPreviewToolsUI();

  const genLeadSelect = document.getElementById('genLeadSelect');
  if (genLeadSelect) {
    genLeadSelect.addEventListener('change', () => {
      const leadId = genLeadSelect.value;
      if (leadId) {
        const lead = state.leads.find(l => l.id === leadId);
        if (lead) {
          document.getElementById('genName').value = lead.name || '';
          document.getElementById('genInstagram').value = lead.instagram || '';
          document.getElementById('genSpecialty').value = lead.specialty || '';
          document.getElementById('genCity').value = lead.city || '';
          document.getElementById('genTagline').value = lead.tagline || '';
          document.getElementById('genBio').value = lead.bio || '';
          document.getElementById('genServices').value = (lead.services || []).join('\n');
          document.getElementById('genWhatsapp').value = lead.whatsapp || '';
          if (lead.avatar) {
            document.getElementById('genAvatar').value = lead.avatar;
            document.getElementById('genAvatarImg').src = lead.avatar;
            document.getElementById('genAvatarImg').style.display = 'block';
          }
          if (typeof renderGallery === 'function') renderGallery();
        }
      }
    });
  }

  // Gallery events
  const galleryUploadTrigger = document.getElementById('galleryUploadTrigger');
  const genGalleryInput = document.getElementById('genGalleryInput');
  if (galleryUploadTrigger && genGalleryInput) {
    galleryUploadTrigger.addEventListener('click', () => genGalleryInput.click());
    genGalleryInput.addEventListener('change', (e) => {
      if (typeof handleGalleryUpload === 'function') return handleGalleryUpload(e.target.files);
      toast('Galeria indisponível.');
    });
  }

  const addImageUrlBtn = document.getElementById('addImageUrlBtn');
  if (addImageUrlBtn) {
    addImageUrlBtn.addEventListener('click', () => {
      const input = document.getElementById('genImageUrl');
      const url = input.value.trim();
      if (url) {
        if (typeof addGalleryImage === 'function') addGalleryImage(url);
        else toast('Galeria indisponível.');
        input.value = '';
      }
    });
  }

  document.querySelectorAll('.template-option').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.template-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      state.selectedTemplate = el.dataset.template;
    });
  });

  document.getElementById('openPreviewBtn').addEventListener('click', () => {
    if (!state.generatedHTML) { toast('Gere um site primeiro'); return; }
    const currentHtml = getCleanHTML('sitePreview') || state.generatedHTML;
    document.getElementById('fullPreview').srcdoc = injectEditor(currentHtml);
    document.getElementById('previewModal').classList.add('open');
  });

  document.getElementById('closePreviewModal').addEventListener('click', () => closeModal('previewModal'));

  // Toggle Preview Device (Mobile/PC)
  const toggleDeviceBtn = document.getElementById('toggleDeviceBtn');
  if (toggleDeviceBtn) {
    toggleDeviceBtn.addEventListener('click', () => {
      const iframe = document.getElementById('fullPreview');
      const isMobile = iframe.style.width === '375px';

      if (isMobile) {
        // Switch to PC View
        iframe.style.width = '100%';
        iframe.style.flex = '1';
        iframe.style.height = '';
        iframe.style.margin = '0';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '0 0 16px 16px';
        iframe.style.boxShadow = 'none';

        // Icon: Phone (to indicate next state is Mobile)
        toggleDeviceBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line></svg>`;
        toggleDeviceBtn.title = "Alternar para Mobile";
      } else {
        // Switch to Mobile View
        iframe.style.width = '375px';
        iframe.style.flex = 'none';
        iframe.style.height = 'calc(100% - 40px)';
        iframe.style.margin = '20px auto';
        iframe.style.border = '8px solid #111'; // Thicker border for phone frame
        iframe.style.borderRadius = '32px';
        iframe.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';

        // Icon: PC (to indicate next state is PC)
        toggleDeviceBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
        toggleDeviceBtn.title = "Alternar para PC";
      }
    });
  }

  document.getElementById('exportPdfBtn').addEventListener('click', function () {
    exportToPDF(this);
  });

  const exportPdfSmallBtn = document.getElementById('exportPdfSmallBtn');
  if (exportPdfSmallBtn) {
    exportPdfSmallBtn.addEventListener('click', function () {
      exportToPDF(this);
    });
  }

  // Toggle Template Section
  const toggleTemplateSection = document.getElementById('toggleTemplateSection');
  const templateSelectorContainer = document.getElementById('templateSelectorContainer');
  const toggleTemplateIcon = document.getElementById('toggleTemplateIcon');

  if (toggleTemplateSection && templateSelectorContainer && toggleTemplateIcon) {
    toggleTemplateSection.addEventListener('click', () => {
      const isCollapsed = templateSelectorContainer.classList.toggle('collapsed');
      if (isCollapsed) {
        toggleTemplateIcon.classList.add('rotate-180');
      } else {
        toggleTemplateIcon.classList.remove('rotate-180');
      }
    });
  }

  document.getElementById('copyHtmlBtn').addEventListener('click', () => {
    if (!state.generatedHTML) { toast('Gere um site primeiro'); return; }

    // Get HTML from iframe if possible, otherwise use state
    const cleanHtml = getCleanHTML() || state.generatedHTML;

    navigator.clipboard.writeText(cleanHtml).then(() => toast('HTML copiado!'));
  });

  // Messages
  document.querySelectorAll('.msg-template-item').forEach((el, i) => {
    el.addEventListener('click', () => renderMsgTemplate(i));
  });

  const msgText = document.getElementById('msgText');
  if (msgText) msgText.addEventListener('input', updateCharCount);

  document.querySelectorAll('.var-tag').forEach(el => {
    el.addEventListener('click', () => {
      const ta = document.getElementById('msgText');
      if (!ta) return;
      const start = ta.selectionStart;
      const val = ta.value;
      ta.value = val.slice(0, start) + el.dataset.var + val.slice(ta.selectionEnd);
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + el.dataset.var.length;
      updateCharCount();
    });
  });

  const copyMsgBtn = document.getElementById('copyMsgBtn');
  if (copyMsgBtn) {
    copyMsgBtn.addEventListener('click', () => {
      const txt = resolveMsg();
      navigator.clipboard.writeText(txt).then(() => toast('Mensagem copiada!'));
    });
  }

  const markSentBtn = document.getElementById('markSentBtn');
  if (markSentBtn) {
    markSentBtn.addEventListener('click', () => {
      const leadId = document.getElementById('msgLeadSelect').value;
      if (!leadId) { toast('Selecione um lead primeiro'); return; }
      const idx = state.leads.findIndex(x => x.id === leadId);
      if (idx !== -1 && state.leads[idx].status !== 'fechado') {
        state.leads[idx].status = 'contatado';
        save();
        toast('Lead marcado como contatado!');
      }
    });
  }

  // Settings
  const saveSettingsBtn = document.getElementById('saveSettings');
  if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

  const addTplBtn = document.getElementById('addTemplateBtn');
  if (addTplBtn) addTplBtn.addEventListener('click', addCustomTemplate);

  const autoConvertBtn = document.getElementById('autoConvertBtn');
  if (autoConvertBtn) {
    autoConvertBtn.addEventListener('click', () => {
      const ta = document.getElementById('newTemplateHtml');
      const html = ta.value;
      if (!html.trim()) {
        toast('Cole o HTML primeiro!');
        return;
      }

      try {
        const result = convertHTMLToTemplate(html);
        ta.value = result.html;
        if (result.variables.length > 0) {
          toast(`Convertido! Variáveis encontradas: ${result.variables.join(', ')}`);
        } else {
          toast('Convertido! Nenhuma variável detectada, mas HTML formatado.');
        }
      } catch (e) {
        console.error(e);
        toast('Erro ao converter HTML.');
      }
    });
  }


  // Backup & Restore Listeners
  const backupBtn = document.getElementById('backupBtn');
  if (backupBtn) backupBtn.addEventListener('click', exportBackup);

  const restoreInput = document.getElementById('restoreInput');
  if (restoreInput) restoreInput.addEventListener('change', importBackup);

  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (confirm('Tem certeza? Isso apaga TODOS os dados permanentemente.')) {
      state.leads = [];
      save();
      toast('Dados apagados');
      renderDashboard();
      renderLeadsTable();
      const leadsBadge = document.getElementById('leadsBadge');
      if (leadsBadge) leadsBadge.textContent = '0';
    }
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  // Initial select all
  document.getElementById('selectAll').addEventListener('change', e => {
    const checkboxes = document.querySelectorAll('.lead-check');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateSelectionBar();
  });

  const selectionArchiveBtn = document.getElementById('selectionArchiveBtn');
  if (selectionArchiveBtn) selectionArchiveBtn.addEventListener('click', archiveSelectedLeads);

  const selectionUnarchiveBtn = document.getElementById('selectionUnarchiveBtn');
  if (selectionUnarchiveBtn) selectionUnarchiveBtn.addEventListener('click', unarchiveSelectedLeads);

  const selectionDeleteBtn = document.getElementById('selectionDeleteBtn');
  if (selectionDeleteBtn) selectionDeleteBtn.addEventListener('click', deleteSelectedLeads);

  // Update modal avatar preview
  document.getElementById('leadName').addEventListener('input', e => {
    updateModalAvatar(e.target.value, document.getElementById('leadImage').value);
  });

  const leadImageInput = document.getElementById('leadImage');
  const updateModalAvatarFromInput = () => {
    let url = leadImageInput.value.trim();
    // Sanitize URL (replace encoded ampersands)
    if (url.includes('&amp;')) {
      url = url.replace(/&amp;/g, '&');
      leadImageInput.value = url; // Update input with clean URL
    }
    // Force a valid URL check or simple pass
    updateModalAvatar(document.getElementById('leadName').value, url);
  };

  leadImageInput.addEventListener('input', updateModalAvatarFromInput);
  leadImageInput.addEventListener('change', updateModalAvatarFromInput);
  leadImageInput.addEventListener('paste', () => setTimeout(updateModalAvatarFromInput, 10));

  // Modal Avatar Load/Error Handlers
  const modalAvatarImg = document.getElementById('modalAvatarImg');
  if (modalAvatarImg) {
    // Explicitly set referrerpolicy in JS as well
    modalAvatarImg.referrerPolicy = 'no-referrer';

    modalAvatarImg.addEventListener('load', () => {
      console.log('Imagem carregada com sucesso:', modalAvatarImg.src);
      modalAvatarImg.style.display = 'block';
      leadImageInput.style.borderColor = ''; // Reset border
      leadImageInput.title = '';
    });

    modalAvatarImg.addEventListener('error', (e) => {
      console.error('Erro ao carregar imagem do modal:', modalAvatarImg.src, e);
      modalAvatarImg.style.display = 'none';
      if (leadImageInput.value.trim()) {
        leadImageInput.style.borderColor = '#EF4444'; // Red border
        leadImageInput.title = 'Erro ao carregar imagem. Verifique o link.';
      }
    });
  }

  // Generator Avatar Load/Error Handlers
  const genAvatarImg = document.getElementById('genAvatarImg');
  if (genAvatarImg) {
    genAvatarImg.addEventListener('load', () => {
      genAvatarImg.style.display = 'block';
    });
    genAvatarImg.addEventListener('error', () => {
      console.error('Erro ao carregar imagem do gerador:', genAvatarImg.src);
      genAvatarImg.style.display = 'none';
    });
  }

  // Toggle Client Info Section
  const toggleClientBtn = document.getElementById('toggleClientInfo');
  const toggleClientIcon = document.getElementById('toggleClientIcon');
  const clientInfoContainer = document.getElementById('clientInfoContainer');

  if (toggleClientBtn && clientInfoContainer && toggleClientIcon) {
    toggleClientBtn.addEventListener('click', () => {
      const isCollapsed = clientInfoContainer.classList.toggle('collapsed');
      if (isCollapsed) {
        toggleClientIcon.classList.add('rotate-180');
      } else {
        toggleClientIcon.classList.remove('rotate-180');
      }
    });
  }

  // Toggle Lead Form Section (Modal)
  const toggleLeadFormBtn = document.getElementById('toggleLeadForm');
  const toggleLeadFormIcon = document.getElementById('toggleLeadFormIcon');
  const leadFormGrid = document.getElementById('leadFormGrid');

  if (toggleLeadFormBtn && leadFormGrid && toggleLeadFormIcon) {
    toggleLeadFormBtn.addEventListener('click', () => {
      const isCollapsed = leadFormGrid.classList.toggle('collapsed');
      if (isCollapsed) {
        toggleLeadFormIcon.classList.add('rotate-180');
      } else {
        toggleLeadFormIcon.classList.remove('rotate-180');
      }
    });
  }

  // Avatar Upload Logic
  const avatarTrigger = document.getElementById('avatarUploadTrigger');
  const photoInput = document.getElementById('leadPhotoInput');

  if (avatarTrigger && photoInput) {
    avatarTrigger.addEventListener('click', () => {
      photoInput.click();
    });

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast('A imagem deve ter no máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        if (leadImageInput) leadImageInput.value = base64;

        // Update preview immediately
        const nameVal = document.getElementById('leadName').value;
        updateModalAvatar(nameVal, base64);

        toast('Foto carregada com sucesso!');
      };
      reader.readAsDataURL(file);
    });
  }

  // Demo data button hint
  console.log('%cLeadFlow carregado! 🚀', 'color:#7C3AED;font-weight:bold;font-size:16px');
});

// ---- SELECTION BAR LOGIC ----
function getSelectedLeadIds() {
  return Array.from(document.querySelectorAll('.lead-check:checked'))
    .map(cb => cb.getAttribute('data-id'))
    .filter(Boolean);
}

function archiveSelectedLeads() {
  const ids = getSelectedLeadIds();
  if (!ids.length) return;
  if (!confirm(`Arquivar ${ids.length} lead(s)?`)) return;

  ids.forEach(id => {
    const idx = state.leads.findIndex(x => x.id === id);
    if (idx === -1) return;
    const lead = state.leads[idx];
    if (lead.status && lead.status !== 'arquivado' && !lead.statusBeforeArchive) {
      lead.statusBeforeArchive = lead.status;
    }
    lead.status = 'arquivado';
  });

  save();
  toast('Leads arquivados');
  setLeadsTab('arquivados');
  renderDashboard();
}

function unarchiveSelectedLeads() {
  const ids = getSelectedLeadIds();
  if (!ids.length) return;

  ids.forEach(id => {
    const idx = state.leads.findIndex(x => x.id === id);
    if (idx === -1) return;
    const lead = state.leads[idx];

    const restore = lead.statusBeforeArchive && lead.statusBeforeArchive !== 'arquivado'
      ? lead.statusBeforeArchive
      : (lead.siteLink ? 'site_pronto' : 'coletado');

    lead.status = restore;
    if (lead.statusBeforeArchive) delete lead.statusBeforeArchive;
  });

  save();
  toast('Leads desarquivados');
  setLeadsTab('ativos');
  renderDashboard();
}

function deleteSelectedLeads() {
  const ids = getSelectedLeadIds();
  if (!ids.length) return;
  if (!confirm(`Excluir ${ids.length} lead(s) permanentemente?`)) return;

  const idSet = new Set(ids);
  state.leads = state.leads.filter(l => !idSet.has(l.id));
  save();
  toast('Leads removidos');
  renderLeadsTable();
  renderDashboard();
}

window.updateSelectionBar = function () {
  const checkboxes = document.querySelectorAll('.lead-check:checked');
  const count = checkboxes.length;
  const bar = document.getElementById('selectionBar');
  const countEl = document.getElementById('selectionCount');
  const archiveBtn = document.getElementById('selectionArchiveBtn');
  const unarchiveBtn = document.getElementById('selectionUnarchiveBtn');
  const deleteBtn = document.getElementById('selectionDeleteBtn');
  const statusSelect = document.getElementById('statusFilter');

  if (countEl) countEl.textContent = count;

  if (bar) {
    if (count > 0) {
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
  }

  const tab = (statusSelect?.value === 'arquivado' || state.leadsTab === 'arquivados') ? 'arquivados' : 'ativos';
  if (archiveBtn) archiveBtn.style.display = tab === 'ativos' ? '' : 'none';
  if (unarchiveBtn) unarchiveBtn.style.display = tab === 'arquivados' ? '' : 'none';
  if (deleteBtn) deleteBtn.style.display = tab === 'arquivados' ? '' : 'none';
};

// Event Delegation for Lead Checkboxes
document.addEventListener('change', (e) => {
  if (e.target && e.target.classList.contains('lead-check')) {
    updateSelectionBar();

    // Update "Select All" state
    const allChecks = document.querySelectorAll('.lead-check');
    const allChecked = Array.from(allChecks).every(c => c.checked);
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
      selectAll.checked = allChecked && allChecks.length > 0;
      selectAll.indeterminate = !allChecked && document.querySelectorAll('.lead-check:checked').length > 0;
    }
  }
});

// =========================================
// PROSPECTING SYSTEM
// =========================================

function renderProspectingBoard() {
  const board = document.getElementById('prospectingBoard');
  if (!board) return;
  board.innerHTML = '';

  // Render Columns
  PROSPECT_STAGES.forEach(stage => {
    const col = document.createElement('div');
    col.className = 'prospect-col';
    col.dataset.stage = stage.id;

    // Filter leads for this stage
    const leadsInStage = state.leads.filter(l => (l.pipelineStage || 'engajar') === stage.id);

    col.innerHTML = `
      <div class="prospect-col-header" style="border-top: 3px solid ${stage.color}">
        <div class="prospect-col-title">
          ${stage.label}
        </div>
        <div class="prospect-col-count">${leadsInStage.length}</div>
      </div>
      <div class="prospect-cards" id="p-col-${stage.id}" ondrop="drop(event, '${stage.id}')" ondragover="allowDrop(event)">
        ${leadsInStage.map(l => getProspectCard(l)).join('')}
      </div>
    `;
    board.appendChild(col);
  });

  updateProspectMetrics();
}

function getProspectCard(l) {
  // Logic for "Next Action"
  let recommendation = '';
  const lastAction = l.history && l.history.length > 0 ? l.history[l.history.length - 1] : null;
  const now = new Date();

  if (lastAction) {
    const diffHours = (now - new Date(lastAction.date)) / (1000 * 60 * 60);
    if (diffHours > 48 && l.pipelineStage !== 'fechado') {
      recommendation = `<div class="recommendation-badge">⚠️ Follow-up sugerido</div>`;
    }
  }

  const lastMsg = lastAction ? `Última: ${lastAction.action}` : 'Nenhuma ação recente';
  const initial = (l.name || '?').trim().charAt(0).toUpperCase();
  const avatarHtml = l.avatar
    ? `<img src="${l.avatar}" class="prospect-avatar-img" alt="${l.name}" referrerpolicy="no-referrer" onerror="this.style.display='none'">`
    : `<span class="prospect-avatar-fallback">${initial}</span>`;

  return `
    <div class="prospect-card compact" draggable="true" ondragstart="drag(event, '${l.id}')" id="p-card-${l.id}">
      <div class="prospect-card-header">
        <div class="prospect-avatar">
            ${avatarHtml}
        </div>
        <div class="prospect-info">
            <div class="prospect-name">${l.name}</div>
            <div class="prospect-tag">${l.city || 'BR'}</div>
        </div>
      </div>
      
      <div class="prospect-last-msg" title="${lastMsg}">
        ${lastMsg}
      </div>
      
      ${recommendation}

      <div class="prospect-footer">
        <div class="prospect-actions">
           <button class="p-action-btn" title="Copiar Mensagem" onclick="prospectAction('${l.id}', 'copy_msg')">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
           </button>
           <button class="p-action-btn" title="Abrir Instagram" onclick="prospectAction('${l.id}', 'open_insta')">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
           </button>
           <button class="p-action-btn" title="Abrir WhatsApp" onclick="prospectAction('${l.id}', 'open_whats')">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
           </button>
           <button class="p-action-btn primary" title="Gerar Site" onclick="prospectAction('${l.id}', 'generate_site')">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
           </button>
        </div>
      </div>
    </div>
  `;
}

function updateProspectMetrics() {
  const today = new Date().toLocaleDateString();

  let sentToday = 0;
  let responses = 0;
  let inConv = 0;
  let conversions = 0;

  state.leads.forEach(l => {
    // Sent Today check: Count unique leads that had a message sent OR moved to DM Enviada today
    if (l.history) {
      const hasSentEvent = l.history.some(h => {
        const isToday = new Date(h.date).toLocaleDateString() === today;
        const isMsgSent = h.action === 'msg_sent' || h.action.includes('msg_sent');
        const isMovedToDm = h.action.includes('-> dm_enviada');
        return isToday && (isMsgSent || isMovedToDm);
      });

      if (hasSentEvent) {
        sentToday++;
      }
    }

    if (l.pipelineStage === 'respondeu') responses++;
    if (['respondeu', 'follow_up', 'whatsapp', 'proposta'].includes(l.pipelineStage)) inConv++;
    if (l.pipelineStage === 'fechado') conversions++;
  });

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  setTxt('pm-sent-today', sentToday);
  setTxt('pm-responses', responses);
  setTxt('pm-in-conversation', inConv);
  setTxt('pm-conversions', conversions);
}

// Drag and Drop
window.allowDrop = function (ev) {
  ev.preventDefault();
}

window.drag = function (ev, id) {
  ev.dataTransfer.setData("text", id);
}

window.drop = function (ev, stageId) {
  ev.preventDefault();
  const leadId = ev.dataTransfer.getData("text");
  moveLeadToStage(leadId, stageId);
}

window.moveLeadToStage = function (leadId, stageId) {
  const idx = state.leads.findIndex(l => l.id === leadId);
  if (idx > -1) {
    const lead = state.leads[idx];
    const oldStage = lead.pipelineStage || 'engajar';
    const oldStatus = lead.status || '';
    lead.pipelineStage = stageId;

    if (stageId === 'fechado') {
      lead.status = 'fechado';
      if (!lead.closedAt) lead.closedAt = Date.now();
    } else if (oldStatus === 'fechado') {
      lead.status = 'contatado';
      if (lead.closedAt) delete lead.closedAt;
    } else if (stageId !== 'engajar' && oldStatus !== 'arquivado') {
      if (!['contatado', 'site_pronto', 'cobrado', 'fechado'].includes(oldStatus)) {
        lead.status = 'contatado';
      }
    }

    // Add to history
    if (!lead.history) lead.history = [];
    lead.history.push({
      date: new Date().toISOString(),
      action: `Moved: ${oldStage} -> ${stageId}`,
      user: 'user'
    });

    save();
    renderProspectingBoard();
    renderDashboard();
    renderLeadsTable();
    renderPipelineStats();
    toast(`Lead movido para ${PROSPECT_STAGES.find(s => s.id === stageId).label}`);
  }
}

window.prospectAction = function (leadId, action) {
  const lead = state.leads.find(l => l.id === leadId);
  if (!lead) return;

  if (!lead.history) lead.history = [];

  if (action === 'copy_msg') {
    // Simple logic: Copy default template or ask
    const link = lead.siteLink || `https://leadflow.app/preview/${lead.id}`;
    const msg = `Oi ${lead.name}, tudo bem? Vi seu perfil e criei um site exemplo: ${link}`;
    navigator.clipboard.writeText(msg).then(() => toast('Mensagem copiada!'));

    // Log action
    lead.history.push({ date: new Date().toISOString(), action: 'msg_sent' });
    if (lead.pipelineStage === 'engajar') lead.pipelineStage = 'dm_enviada';
    if (lead.status !== 'arquivado' && !['contatado', 'site_pronto', 'cobrado', 'fechado'].includes(lead.status || '')) {
      lead.status = 'contatado';
    }
    save();
    renderProspectingBoard();
    renderDashboard();
    renderLeadsTable();
  }

  if (action === 'open_insta') {
    let url = lead.instagram;
    if (!url) { toast('Lead sem Instagram'); return; }
    if (!url.startsWith('http')) url = `https://instagram.com/${url.replace('@', '')}`;
    window.open(url, '_blank');
  }

  if (action === 'open_whats') {
    let phone = lead.phone;
    if (!phone) {
      phone = prompt('Qual o número do WhatsApp? (Ex: 5511999999999)');
      if (phone) {
        lead.phone = phone;
        save();
      }
    }
    if (phone) window.open(`https://wa.me/${phone}`, '_blank');
  }

  if (action === 'generate_site') {
    // Switch to generator view and populate
    document.getElementById('nav-generator').click();
    setTimeout(() => {
      const select = document.getElementById('genLeadSelect');
      if (select) {
        select.value = leadId;
        select.dispatchEvent(new Event('change'));
      }
    }, 500);
  }
}

// ── Sincronização em tempo real com HQ (iframe) via storage events ──────────
// Quando o HQ (rodando no iframe) salva algo no localStorage,
// o evento 'storage' dispara aqui no app principal automaticamente.
window.addEventListener('storage', function(e) {

  // HQ moveu um lead ou confirmou envio → atualiza o pipeline do dashboard
  if (e.key === 'lf_leads' && e.newValue) {
    try {
      const updated = JSON.parse(e.newValue);
      if (Array.isArray(updated)) {
        state.leads = updated;
        // Re-renderiza as views que estão abertas
        if (state.currentView === 'dashboard') {
          renderDashboard();
          syncDashboardTabsUI();
        }
        if (state.currentView === 'leads') renderLeadsTable();
        if (state.currentView === 'dashboard2') renderDashboard2();
        if (state.currentView === 'kpis') renderKPIs();
      }
    } catch (err) {}
  }

  // HQ gerou copies → atualiza Lab de Mensagens se estiver aberto
  if (e.key === 'lf_messageLab' && e.newValue) {
    try {
      const updatedLab = JSON.parse(e.newValue);
      state.messageLab = updatedLab;
      if (state.currentView === 'lab-mensagens' && typeof renderMessageLab === 'function') {
        renderMessageLab(window.currentLabStage || 'dm1');
      }
    } catch (err) {}
  }
});
