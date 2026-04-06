const AI_ENDPOINT = '/api/chat';
const AI_HEALTH_ENDPOINT = '/api/health';
const DEFAULT_MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

const STORAGE_KEYS = {
  settings: 'fottu_social_settings_v1',
  messages: 'fottu_social_messages_v1',
  drafts: 'fottu_social_drafts_v1',
  weekStart: 'fottu_social_week_start_v1'
};

const QUICK_TEMPLATES = [
  {
    id: 'week_plan',
    label: 'Calendario da semana',
    shortLabel: 'Calendario',
    preset: {
      platform: 'Instagram',
      objective: 'Criar relacionamento e lembranca',
      funnel: 'Meio de funil'
    },
    helper: 'Ideal para organizar a semana inteira com objetivo, formato, CTA e checklist.',
    description: 'Monta uma semana completa com ideia, formato, CTA e recomendacao de criativo.',
    preview: 'Visao da semana + tabela editorial + detalhamento por dia.'
  },
  {
    id: 'ideas',
    label: 'Ideias de conteudo',
    shortLabel: 'Ideias',
    preset: {
      platform: 'Instagram',
      objective: 'Atrair novos seguidores',
      funnel: 'Topo de funil'
    },
    helper: 'Use quando precisar abastecer a pauta rapido sem depender de brainstorm manual.',
    description: 'Cria um pacote de ideias priorizadas para feed, stories, reels ou WhatsApp.',
    preview: 'Banco de ideias + top 3 para executar primeiro.'
  },
  {
    id: 'caption',
    label: 'Legenda pronta',
    shortLabel: 'Legenda',
    preset: {
      platform: 'Instagram',
      objective: 'Converter para pedido',
      funnel: 'Fundo de funil'
    },
    helper: 'Bom para transformar tema ou criativo em copy pronta para publicar.',
    description: 'Escreve legenda em mais de uma versao, com CTA, hashtag e observacao visual.',
    preview: 'Versao curta, media e comercial.'
  },
  {
    id: 'reels',
    label: 'Roteiro de Reels',
    shortLabel: 'Reels',
    preset: {
      platform: 'Instagram + TikTok',
      objective: 'Atrair novos seguidores',
      funnel: 'Topo de funil'
    },
    helper: 'Use para transformar ideia em video gravavel.',
    description: 'Estrutura gancho, falas, cenas, texto na tela e CTA para reels ou video curto.',
    preview: 'Storyboard, falas, texto na tela e CTA.'
  },
  {
    id: 'campaign',
    label: 'Campanha sazonal',
    shortLabel: 'Campanha',
    preset: {
      platform: 'Instagram + WhatsApp',
      objective: 'Converter para pedido',
      funnel: 'Meio de funil'
    },
    helper: 'Perfeito para datas especiais, campanhas de prova social ou semanas promocionais.',
    description: 'Monta estrategia, linha criativa, cronograma e oferta para campanha de data especial.',
    preview: 'Tese da campanha + matriz de conteudo + timeline.'
  },
  {
    id: 'whatsapp',
    label: 'Resposta para WhatsApp',
    shortLabel: 'WhatsApp',
    preset: {
      platform: 'WhatsApp',
      objective: 'Gerar conversas no WhatsApp',
      funnel: 'Fundo de funil'
    },
    helper: 'Ajuda o social media a responder no tom da marca, com clareza e calor.',
    description: 'Gera respostas humanizadas para atendimento, follow-up, fechamento ou objecoes.',
    preview: 'Versao curta, media, follow-up e fechamento.'
  },
  {
    id: 'custom',
    label: 'Pedido personalizado',
    shortLabel: 'Custom',
    preset: {},
    helper: 'Mantem a estrutura do sistema, mas com liberdade para uma demanda fora do playbook.',
    description: 'Use para algo especifico que nao cabe nos templates prontos.',
    preview: 'Resposta estruturada sob medida.'
  }
];

const DRAFT_FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'week_plan', label: 'Calendarios' },
  { id: 'ideas', label: 'Ideias' },
  { id: 'caption', label: 'Legendas' },
  { id: 'reels', label: 'Reels' },
  { id: 'campaign', label: 'Campanhas' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'custom', label: 'Custom' }
];

const PIPELINE_OPTIONS = [
  { value: 'idea', label: 'Ideia' },
  { value: 'writing', label: 'Redacao' },
  { value: 'design', label: 'Design' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'published', label: 'Publicado' }
];

const dom = {
  briefingModal: document.getElementById('briefingModal'),
  briefingForm: document.getElementById('briefingForm'),
  editBriefingBtn: document.getElementById('editBriefingBtn'),
  closeBriefingBtn: document.getElementById('closeBriefingBtn'),
  newTaskBtn: document.getElementById('newTaskBtn'),
  copyWeekBtn: document.getElementById('copyWeekBtn'),
  briefingChips: document.getElementById('briefingChips'),
  briefingHighlights: document.getElementById('briefingHighlights'),
  statGrid: document.getElementById('statGrid'),
  quickActionGrid: document.getElementById('quickActionGrid'),
  studioForm: document.getElementById('studioForm'),
  templateSelect: document.getElementById('templateSelect'),
  templateHelper: document.getElementById('templateHelper'),
  customPromptField: document.getElementById('customPromptField'),
  customPromptInput: document.getElementById('customPromptInput'),
  browserSearchToggle: document.getElementById('browserSearchToggle'),
  attachmentInput: document.getElementById('studioAttachmentInput'),
  attachmentList: document.getElementById('attachmentList'),
  attachBtn: document.getElementById('attachBtn'),
  freeAttachBtn: document.getElementById('freeAttachBtn'),
  clearAttachmentsBtn: document.getElementById('clearAttachmentsBtn'),
  generateBtn: document.getElementById('generateBtn'),
  studioMessages: document.getElementById('studioMessages'),
  freePromptInput: document.getElementById('freePromptInput'),
  sendFreePromptBtn: document.getElementById('sendFreePromptBtn'),
  clearHistoryBtn: document.getElementById('clearHistoryBtn'),
  draftFilterPills: document.getElementById('draftFilterPills'),
  draftSearchInput: document.getElementById('draftSearchInput'),
  draftList: document.getElementById('draftList'),
  prevWeekBtn: document.getElementById('prevWeekBtn'),
  nextWeekBtn: document.getElementById('nextWeekBtn'),
  weekGrid: document.getElementById('weekGrid'),
  weekSummaryChips: document.getElementById('weekSummaryChips'),
  toastStack: document.getElementById('toastStack')
};

function startOfWeek(date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() + diff);
  return value;
}

const state = {
  settings: {
    goalMonth: '',
    productFocus: '',
    campaigns: '',
    keyDates: '',
    channels: 'Instagram, WhatsApp Business, TikTok',
    frequency: '4 posts por semana + stories diarios',
    audience: '',
    offerFocus: '',
    pillars: '',
    ctaBank: '',
    restrictions: ''
  },
  messages: [],
  drafts: [],
  attachments: [],
  backendLimits: {
    maxAttachmentBytes: DEFAULT_MAX_ATTACHMENT_BYTES
  },
  draftFilter: 'all',
  draftSearch: '',
  activeTemplateId: 'week_plan',
  weekStart: startOfWeek(new Date()),
  busy: false
};

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short'
  }).format(date);
}

function formatTime(value = Date.now()) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function getTemplate(templateId) {
  return QUICK_TEMPLATES.find(template => template.id === templateId) || QUICK_TEMPLATES[0];
}

function getPipelineLabel(status) {
  return PIPELINE_OPTIONS.find(item => item.value === status)?.label || 'Ideia';
}

function getPipelineClass(status) {
  if (status === 'writing') return 'pipeline-writing';
  if (status === 'design') return 'pipeline-design';
  if (status === 'scheduled') return 'pipeline-scheduled';
  if (status === 'published') return 'pipeline-published';
  return '';
}

function summarizeAttachment(file) {
  if (!file) return '';
  if ((file.type || '').startsWith('image/')) return `${file.name} (imagem)`;
  if ((file.type || '').startsWith('audio/')) return `${file.name} (audio)`;
  return `${file.name} (texto)`;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  dom.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(state.messages));
  localStorage.setItem(STORAGE_KEYS.drafts, JSON.stringify(state.drafts));
  localStorage.setItem(STORAGE_KEYS.weekStart, state.weekStart.toISOString());
}

function addMessage(message) {
  state.messages.push({
    id: message.id || uid('msg'),
    role: message.role,
    text: message.text || '',
    createdAt: message.createdAt || Date.now(),
    templateId: message.templateId || 'custom',
    label: message.label || getTemplate(message.templateId || 'custom').label
  });
  saveState();
}

function loadState() {
  state.settings = {
    ...state.settings,
    ...safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {})
  };
  state.messages = safeJsonParse(localStorage.getItem(STORAGE_KEYS.messages), []);
  state.drafts = safeJsonParse(localStorage.getItem(STORAGE_KEYS.drafts), []);

  const storedWeekStart = localStorage.getItem(STORAGE_KEYS.weekStart);
  if (storedWeekStart) {
    const parsed = new Date(storedWeekStart);
    if (!Number.isNaN(parsed.getTime())) {
      state.weekStart = parsed;
    }
  }

  if (!state.messages.length) {
    addMessage({
      role: 'bot',
      label: 'Boas-vindas',
      templateId: 'custom',
      text:
        '## Bem-vindo ao workspace do social media\n\nUse as acoes prontas para gerar entregas mais usaveis que um prompt livre.\n\n### O que este painel resolve\n- planejamento semanal\n- ideias de conteudo\n- legendas prontas\n- roteiro de reels\n- respostas de WhatsApp\n- biblioteca de rascunhos\n- calendario editorial\n\n### Melhor fluxo\n1. Atualize o briefing.\n2. Escolha uma acao pronta.\n3. Gere a entrega.\n4. Salve o melhor resultado.\n5. Agende no planner.'
    });
  }
}

function openBriefingModal() {
  dom.briefingModal.classList.add('open');
}

function closeBriefingModal() {
  dom.briefingModal.classList.remove('open');
}

function populateBriefingForm() {
  Object.entries(state.settings).forEach(([key, value]) => {
    const input = dom.briefingForm.elements.namedItem(key);
    if (input) input.value = value || '';
  });
}

function renderBriefingSummary() {
  const chips = [];
  if (state.settings.goalMonth) chips.push(`Objetivo: ${state.settings.goalMonth}`);
  if (state.settings.productFocus) chips.push(`Foco: ${state.settings.productFocus}`);
  if (state.settings.campaigns) chips.push(`Campanhas: ${state.settings.campaigns}`);
  if (state.settings.frequency) chips.push(`Cadencia: ${state.settings.frequency}`);
  if (state.settings.channels) chips.push(`Canais: ${state.settings.channels}`);

  dom.briefingChips.innerHTML = '';
  if (!chips.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Preencha o briefing para deixar o sistema mais util.';
    dom.briefingChips.appendChild(empty);
  } else {
    chips.forEach(text => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.textContent = text;
      dom.briefingChips.appendChild(chip);
    });
  }

  const highlightItems = [
    {
      title: 'Publico e oferta',
      text: `${state.settings.audience || 'Defina o publico principal'}${state.settings.offerFocus ? ` | Oferta: ${state.settings.offerFocus}` : ''}`
    },
    {
      title: 'Pilares',
      text: state.settings.pillars || 'Defina os pilares para guiar a linha editorial.'
    },
    {
      title: 'CTAs e limites',
      text: `${state.settings.ctaBank || 'Defina CTAs preferidos'}${state.settings.restrictions ? ` | Evitar: ${state.settings.restrictions}` : ''}`
    }
  ];

  dom.briefingHighlights.innerHTML = '';
  highlightItems.forEach(item => {
    const card = document.createElement('article');
    card.className = 'guide-item';
    card.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>`;
    dom.briefingHighlights.appendChild(card);
  });
}

function renderStats() {
  const scheduledCount = state.drafts.filter(draft => draft.scheduledDate).length;
  const publishedCount = state.drafts.filter(draft => draft.status === 'published').length;
  const pendingCount = state.drafts.filter(draft => !['published', 'scheduled'].includes(draft.status)).length;
  const outputsCount = state.messages.filter(message => message.role === 'bot').length;
  const stats = [
    ['Rascunhos salvos', String(state.drafts.length), 'biblioteca pronta para reuso'],
    ['Agendados', String(scheduledCount), 'itens com data no planner'],
    ['Pendentes', String(pendingCount), 'ideia, redacao ou design'],
    ['Outputs gerados', String(outputsCount), 'historico de trabalho com IA']
  ];

  dom.statGrid.innerHTML = '';
  stats.forEach(([label, value, note]) => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <span class="stat-label">${escapeHtml(label)}</span>
      <span class="stat-value">${escapeHtml(value)}</span>
      <span class="stat-note">${escapeHtml(note)}</span>
    `;
    dom.statGrid.appendChild(card);
  });
}

function renderTemplateOptions() {
  dom.templateSelect.innerHTML = '';
  QUICK_TEMPLATES.forEach(template => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = template.label;
    dom.templateSelect.appendChild(option);
  });
  dom.templateSelect.value = state.activeTemplateId;
}

function syncTemplateUi() {
  const template = getTemplate(state.activeTemplateId);
  dom.templateHelper.textContent = template.helper;
  dom.customPromptField.hidden = template.id !== 'custom';
}

function applyTemplatePreset(templateId) {
  const template = getTemplate(templateId);
  const preset = template.preset || {};

  if (preset.platform) document.getElementById('platformSelect').value = preset.platform;
  if (preset.objective) document.getElementById('objectiveSelect').value = preset.objective;
  if (preset.funnel) document.getElementById('funnelSelect').value = preset.funnel;
}

function renderQuickActions() {
  dom.quickActionGrid.innerHTML = '';
  QUICK_TEMPLATES.filter(template => template.id !== 'custom').forEach(template => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quick-card';
    button.innerHTML = `
      <span class="quick-tag">${escapeHtml(template.shortLabel)}</span>
      <div>
        <h3>${escapeHtml(template.label)}</h3>
        <p>${escapeHtml(template.description)}</p>
      </div>
      <p class="hint">${escapeHtml(template.preview)}</p>
    `;
    button.addEventListener('click', () => {
      state.activeTemplateId = template.id;
      dom.templateSelect.value = template.id;
      syncTemplateUi();
      applyTemplatePreset(template.id);
      dom.studioForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    dom.quickActionGrid.appendChild(button);
  });
}

function renderAttachments() {
  dom.attachmentList.innerHTML = '';
  state.attachments.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'attachment-item';
    item.innerHTML = `
      <span>${escapeHtml(summarizeAttachment(file))}</span>
      <button type="button" data-attachment-index="${index}" aria-label="Remover anexo">x</button>
    `;
    dom.attachmentList.appendChild(item);
  });
}

function addAttachments(fileList) {
  const maxAttachmentBytes =
    Number(state.backendLimits.maxAttachmentBytes) || DEFAULT_MAX_ATTACHMENT_BYTES;
  const existing = new Set(
    state.attachments.map(file => `${file.name}|${file.size}|${file.lastModified}`)
  );
  const rejectedFiles = [];

  Array.from(fileList || []).forEach(file => {
    const key = `${file.name}|${file.size}|${file.lastModified}`;
    if (existing.has(key)) return;
    if (state.attachments.length >= 5) return;
    if (file.size > maxAttachmentBytes) {
      rejectedFiles.push(file.name);
      return;
    }
    state.attachments.push(file);
    existing.add(key);
  });

  renderAttachments();

  if (rejectedFiles.length) {
    showToast(
      `Arquivos acima do limite por anexo (${formatBytes(maxAttachmentBytes)}): ${rejectedFiles.join(', ')}.`
    );
  }
}

function clearAttachments() {
  state.attachments = [];
  renderAttachments();
}

function renderInlineMarkdown(text = '') {
  const codeTokens = [];
  let html = escapeHtml(text).replace(/`([^`]+)`/g, (_, code) => {
    const token = `__CODE_${codeTokens.length}__`;
    codeTokens.push(`<code>${code}</code>`);
    return token;
  });
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, url) => {
    return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  codeTokens.forEach((tokenHtml, index) => {
    html = html.replace(`__CODE_${index}__`, tokenHtml);
  });
  return html;
}

function isTableSeparatorLine(line = '') {
  const trimmed = String(line).trim();
  return /^[|:\-\s]+$/.test(trimmed) && trimmed.includes('-');
}

function splitMarkdownTableRow(line = '') {
  let trimmed = String(line).trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map(cell => cell.trim());
}

function renderMarkdown(text = '') {
  const normalized = String(text).replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const blocks = [];
  let index = 0;

  function isSpecialLine(line, nextLine) {
    return (
      /^#{1,4}\s+/.test(line) ||
      /^```/.test(line) ||
      /^(\s*[-*•]\s+)/.test(line) ||
      /^(\s*\d+\.\s+)/.test(line) ||
      /^(---|\*\*\*|___)\s*$/.test(line.trim()) ||
      (line.includes('|') && isTableSeparatorLine(nextLine || ''))
    );
  }

  while (index < lines.length) {
    const line = lines[index];
    const nextLine = lines[index + 1] || '';

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(4, headingMatch[1].length);
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) {
      blocks.push('<hr>');
      index += 1;
      continue;
    }

    if (line.includes('|') && isTableSeparatorLine(nextLine)) {
      const header = splitMarkdownTableRow(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].trim() && lines[index].includes('|')) {
        rows.push(splitMarkdownTableRow(lines[index]));
        index += 1;
      }
      const headerHtml = header.map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join('');
      const rowsHtml = rows
        .map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`)
        .join('');
      blocks.push(`<table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`);
      continue;
    }

    if (/^(\s*[-*•]\s+)/.test(line)) {
      const items = [];
      while (index < lines.length && /^(\s*[-*•]\s+)/.test(lines[index])) {
        items.push(lines[index].replace(/^(\s*[-*•]\s+)/, ''));
        index += 1;
      }
      blocks.push(`<ul>${items.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^(\s*\d+\.\s+)/.test(line)) {
      const items = [];
      while (index < lines.length && /^(\s*\d+\.\s+)/.test(lines[index])) {
        items.push(lines[index].replace(/^(\s*\d+\.\s+)/, ''));
        index += 1;
      }
      blocks.push(`<ol>${items.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ol>`);
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isSpecialLine(lines[index], lines[index + 1] || '')) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push(`<p>${paragraphLines.map(item => renderInlineMarkdown(item)).join('<br>')}</p>`);
  }

  return blocks.join('');
}

function createMessageElement(message) {
  const wrapper = document.createElement('article');
  wrapper.className = `msg ${message.role}`;
  wrapper.innerHTML = `
    <div class="msg-meta">
      <span class="msg-badge">${escapeHtml(message.role === 'user' ? 'Pedido enviado' : message.label)}</span>
      <span class="msg-time">${escapeHtml(formatTime(message.createdAt))}</span>
    </div>
    <div class="msg-markdown">${message.role === 'user'
      ? `<p>${escapeHtml(message.text).replace(/\n/g, '<br>')}</p>`
      : renderMarkdown(message.text)
    }</div>
  `;

  if (message.role === 'bot') {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    actions.innerHTML = `
      <button class="msg-action-btn" type="button" data-action="copy" data-id="${message.id}">Copiar</button>
      <button class="msg-action-btn" type="button" data-action="save" data-id="${message.id}">Salvar como rascunho</button>
    `;
    wrapper.appendChild(actions);
  }

  return wrapper;
}

function renderMessages() {
  dom.studioMessages.innerHTML = '';
  state.messages.forEach(message => {
    dom.studioMessages.appendChild(createMessageElement(message));
  });
  dom.studioMessages.scrollTop = dom.studioMessages.scrollHeight;
}

function renderDraftFilterPills() {
  dom.draftFilterPills.innerHTML = '';
  DRAFT_FILTERS.forEach(filter => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-pill ${state.draftFilter === filter.id ? 'active' : ''}`;
    button.textContent = filter.label;
    button.addEventListener('click', () => {
      state.draftFilter = filter.id;
      renderDraftFilterPills();
      renderDrafts();
    });
    dom.draftFilterPills.appendChild(button);
  });
}

function filteredDrafts() {
  const search = normalizeText(state.draftSearch);
  return state.drafts.filter(draft => {
    const matchesFilter = state.draftFilter === 'all' || draft.templateId === state.draftFilter;
    const haystack = normalizeText(`${draft.title} ${draft.content} ${draft.label}`);
    return matchesFilter && (!search || haystack.includes(search));
  });
}

function extractTitleFromText(text, fallback = 'Rascunho salvo') {
  const lines = String(text).split('\n').map(line => line.trim()).filter(Boolean);
  const heading = lines.find(line => /^#{1,4}\s+/.test(line));
  if (heading) return heading.replace(/^#{1,4}\s+/, '').slice(0, 90);
  return (lines[0] || fallback).slice(0, 90);
}

function saveDraftFromMessage(messageId) {
  const message = state.messages.find(item => item.id === messageId);
  if (!message || message.role !== 'bot') return;

  state.drafts.unshift({
    id: uid('draft'),
    title: extractTitleFromText(message.text, message.label),
    content: message.text,
    templateId: message.templateId,
    label: message.label,
    status: 'idea',
    scheduledDate: '',
    createdAt: Date.now()
  });

  saveState();
  renderDrafts();
  renderPlanner();
  renderStats();
  showToast('Rascunho salvo na biblioteca.');
}

function renderDrafts() {
  const drafts = filteredDrafts();
  dom.draftList.innerHTML = '';

  if (!drafts.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Nenhum rascunho salvo ainda. Salve as melhores respostas do painel.';
    dom.draftList.appendChild(empty);
    return;
  }

  drafts.forEach(draft => {
    const card = document.createElement('article');
    card.className = 'draft-card';
    card.innerHTML = `
      <div class="draft-top">
        <div>
          <h3 class="draft-title">${escapeHtml(draft.title)}</h3>
          <div class="draft-meta">${escapeHtml(draft.label || getTemplate(draft.templateId).label)} | ${escapeHtml(new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(draft.createdAt)))}</div>
        </div>
        <span class="pipeline-badge ${getPipelineClass(draft.status)}">${escapeHtml(getPipelineLabel(draft.status))}</span>
      </div>
      <p class="draft-snippet">${escapeHtml(draft.content.slice(0, 220))}${draft.content.length > 220 ? '...' : ''}</p>
      <div class="draft-controls">
        <label class="field">
          <span>Status</span>
          <select data-draft-status="${draft.id}">
            ${PIPELINE_OPTIONS.map(option => `<option value="${option.value}" ${option.value === draft.status ? 'selected' : ''}>${option.label}</option>`).join('')}
          </select>
        </label>
        <label class="field">
          <span>Agendar</span>
          <input type="date" data-draft-date="${draft.id}" value="${draft.scheduledDate || ''}">
        </label>
      </div>
      <div class="draft-actions">
        <button class="mini-btn" type="button" data-draft-copy="${draft.id}">Copiar</button>
        <button class="mini-btn" type="button" data-draft-open="${draft.id}">Jogar no chat</button>
        <button class="mini-btn" type="button" data-draft-delete="${draft.id}">Excluir</button>
      </div>
    `;
    dom.draftList.appendChild(card);
  });
}

function weekDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(state.weekStart);
    date.setDate(state.weekStart.getDate() + index);
    return date;
  });
}

function renderPlanner() {
  const dates = weekDates();
  dom.weekSummaryChips.innerHTML = '';

  [
    `${formatDate(dates[0])} - ${formatDate(dates[6])}`,
    `${state.drafts.filter(draft => draft.scheduledDate).length} agendados`,
    `${state.drafts.filter(draft => draft.status === 'published').length} publicados`,
    state.settings.frequency || 'Cadencia nao definida'
  ].forEach(text => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = text;
    dom.weekSummaryChips.appendChild(chip);
  });

  dom.weekGrid.innerHTML = '';

  dates.forEach(date => {
    const iso = date.toISOString().slice(0, 10);
    const items = state.drafts.filter(draft => draft.scheduledDate === iso);
    const column = document.createElement('div');
    column.className = 'day-column';
    column.innerHTML = `
      <div class="day-head">
        <span class="day-name">${escapeHtml(formatLongDate(date).split(',')[0])}</span>
        <strong class="day-date">${escapeHtml(formatDate(date))}</strong>
      </div>
    `;

    const list = document.createElement('div');
    list.className = 'day-list';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'Sem publicacao agendada.';
      list.appendChild(empty);
    } else {
      items.forEach(item => {
        const article = document.createElement('article');
        article.className = 'planner-card-item';
        article.innerHTML = `
          <span class="pipeline-badge ${getPipelineClass(item.status)}">${escapeHtml(getPipelineLabel(item.status))}</span>
          <h3 class="draft-title" style="margin-top:0.55rem;">${escapeHtml(item.title)}</h3>
          <p class="draft-snippet" style="margin-top:0.5rem;">${escapeHtml(item.content.slice(0, 120))}${item.content.length > 120 ? '...' : ''}</p>
        `;
        list.appendChild(article);
      });
    }

    column.appendChild(list);
    dom.weekGrid.appendChild(column);
  });
}

function collectBriefingContext() {
  return [
    `Objetivo do mes: ${state.settings.goalMonth || 'nao informado'}`,
    `Produtos foco: ${state.settings.productFocus || 'nao informado'}`,
    `Campanhas ativas: ${state.settings.campaigns || 'nao informado'}`,
    `Datas importantes: ${state.settings.keyDates || 'nao informado'}`,
    `Canais usados: ${state.settings.channels || 'nao informado'}`,
    `Frequencia de postagem: ${state.settings.frequency || 'nao informado'}`,
    `Publico principal: ${state.settings.audience || 'nao informado'}`,
    `Oferta foco: ${state.settings.offerFocus || 'nao informado'}`,
    `Pilares: ${state.settings.pillars || 'nao informado'}`,
    `CTAs preferidos: ${state.settings.ctaBank || 'nao informado'}`,
    `Restricoes da marca: ${state.settings.restrictions || 'nao informado'}`
  ].join('\n');
}

function buildStructuredPrompt(template, payload) {
  const header = [
    'Voce e o estrategista de social media da fottu.br.',
    'Responda em portugues do Brasil.',
    'Pense como um profissional que precisa entregar algo pronto para um social media executar.',
    'Use linguagem clara, pratica, organizada e com cara de ferramenta de trabalho.',
    '',
    '## Briefing operacional',
    collectBriefingContext(),
    '',
    '## Contexto da tarefa',
    `Canal: ${payload.platform}`,
    `Objetivo: ${payload.objective}`,
    `Funil: ${payload.funnel}`,
    `Produto/tema foco: ${payload.product || 'nao informado'}`,
    `Campanha: ${payload.campaign || 'nao informado'}`,
    `Prazo/data: ${payload.dueDate || 'nao informado'}`,
    `CTA desejado: ${payload.cta || 'nao informado'}`,
    `Observacoes extras: ${payload.notes || 'nao informado'}`,
    payload.customPrompt ? `Complemento do usuario: ${payload.customPrompt}` : ''
  ].filter(Boolean).join('\n');

  const instructions = {
    week_plan: [
      '## Tarefa',
      'Monte um calendario editorial de 7 dias.',
      '',
      '## Formato de resposta obrigatorio',
      '### Visao da semana',
      '- objetivo macro',
      '- principal narrativa',
      '- como distribuir topo, meio e fundo do funil',
      '',
      '### Calendario editorial',
      '| Dia | Objetivo | Formato | Tema | Gancho | CTA |',
      '| --- | --- | --- | --- | --- | --- |',
      '',
      '### Detalhamento por peca',
      'Para cada dia inclua: ideia central, legenda base, orientacao visual e observacao para stories ou WhatsApp.',
      '',
      '### Checklist de producao',
      '- o que gravar',
      '- o que desenhar',
      '- o que precisa aprovar'
    ],
    ideas: [
      '## Tarefa',
      'Crie um pacote de ideias de conteudo priorizadas.',
      '',
      '## Formato de resposta obrigatorio',
      '### Direcao editorial',
      '- raciocinio central',
      '- angulo mais forte para a semana',
      '',
      '### Banco de ideias',
      '| Prioridade | Formato | Tema | Gancho | CTA |',
      '| --- | --- | --- | --- | --- |',
      '',
      '### Top 3 para executar primeiro',
      'Explique por que essas tres devem sair antes.',
      '',
      '### Alertas de tom',
      'Diga o que evitar para a marca continuar premium e afetiva.'
    ],
    caption: [
      '## Tarefa',
      'Escreva legenda pronta para publicacao.',
      '',
      '## Formato de resposta obrigatorio',
      '### Leitura estrategica',
      '- qual angulo escolher',
      '',
      '### Legendas',
      'Entregue tres versoes: curta, media e conversao.',
      '',
      '### Complementos',
      '- CTA recomendado',
      '- hashtags sugeridas',
      '- orientacao de criativo',
      '- primeira linha mais forte'
    ],
    reels: [
      '## Tarefa',
      'Monte um roteiro de reels gravavel.',
      '',
      '## Formato de resposta obrigatorio',
      '### Conceito do video',
      '- ideia central',
      '- publico e reacao desejada',
      '',
      '### Roteiro',
      '| Cena | Tempo | O que aparece | Texto na tela | Falas/locucao |',
      '| --- | --- | --- | --- | --- |',
      '',
      '### Apoios',
      '- legenda base',
      '- CTA final',
      '- observacao de ritmo',
      '- variacao para stories'
    ],
    campaign: [
      '## Tarefa',
      'Crie uma campanha sazonal pronta para execucao.',
      '',
      '## Formato de resposta obrigatorio',
      '### Tese da campanha',
      '- ideia central',
      '- oferta',
      '- por que isso conecta com a fottu.br',
      '',
      '### Plano de conteudo',
      '| Fase | Objetivo | Formato | Tema | CTA |',
      '| --- | --- | --- | --- | --- |',
      '',
      '### Cronograma',
      '- aquecimento',
      '- pico',
      '- fechamento',
      '',
      '### Checklist operacional',
      '- criativos',
      '- copys',
      '- ajustes de atendimento'
    ],
    whatsapp: [
      '## Tarefa',
      'Crie respostas de WhatsApp prontas para uso.',
      '',
      '## Formato de resposta obrigatorio',
      '### Contexto de atendimento',
      '- objetivo da conversa',
      '- tom ideal',
      '',
      '### Respostas prontas',
      'Entregue: versao curta, media, fechamento, follow-up e objecao comum.',
      '',
      '### Observacoes',
      '- quando usar cada uma',
      '- o que nao falar'
    ],
    custom: [
      '## Tarefa',
      'Atenda ao pedido personalizado do usuario mantendo a resposta util para rotina de social media.',
      '',
      '## Formato de resposta obrigatorio',
      '### Objetivo',
      '### Entrega principal',
      '### Recomendacoes praticas',
      '### Proximo passo'
    ]
  };

  return [header, '', ...(instructions[template.id] || instructions.custom)].join('\n');
}

function buildUserPreview(template, payload, attachments) {
  return [
    `Tipo: ${template.label}`,
    `Canal: ${payload.platform}`,
    `Objetivo: ${payload.objective}`,
    payload.product ? `Foco: ${payload.product}` : '',
    payload.campaign ? `Campanha: ${payload.campaign}` : '',
    payload.cta ? `CTA: ${payload.cta}` : '',
    payload.notes ? `Notas: ${payload.notes}` : '',
    payload.customPrompt ? `Prompt extra: ${payload.customPrompt}` : '',
    attachments.length ? `Anexos: ${attachments.map(summarizeAttachment).join(', ')}` : ''
  ].filter(Boolean).join('\n');
}

async function callAssistant(prompt, templateId, label, attachments, tools) {
  const formData = new FormData();
  formData.append('question', prompt);
  formData.append('model', 'auto');
  formData.append('tools', JSON.stringify(tools || []));
  formData.append('history', JSON.stringify(state.messages.slice(-8).map(message => ({
    role: message.role === 'bot' ? 'assistant' : 'user',
    content: message.text
  }))));
  formData.append('context', JSON.stringify([
    {
      title: 'Briefing operacional do social media',
      answer: collectBriefingContext()
    }
  ]));
  formData.append('currentFields', JSON.stringify([]));

  attachments.forEach(file => {
    formData.append('attachments', file, file.name);
  });

  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    body: formData
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.reply) {
    throw new Error(data?.error || data?.details || 'Falha ao consultar a IA');
  }

  addMessage({
    role: 'bot',
    label,
    templateId,
    text: data.reply
  });
}

async function runStructuredTask(payload) {
  if (state.busy) return;

  const template = getTemplate(payload.template);
  const prompt = buildStructuredPrompt(template, payload);
  const attachments = [...state.attachments];
  const tools = dom.browserSearchToggle.checked ? ['browser_search'] : [];

  addMessage({
    role: 'user',
    label: template.label,
    templateId: template.id,
    text: buildUserPreview(template, payload, attachments)
  });

  state.busy = true;
  dom.generateBtn.disabled = true;
  dom.sendFreePromptBtn.disabled = true;
  dom.generateBtn.textContent = 'Gerando...';
  renderMessages();
  renderStats();

  try {
    await callAssistant(prompt, template.id, template.label, attachments, tools);
    clearAttachments();
  } catch (error) {
    addMessage({
      role: 'bot',
      label: 'Erro',
      templateId: 'custom',
      text: `## Falha ao gerar\n\nNao consegui completar essa entrega agora.\n\n### Detalhe\n${error.message || 'Erro desconhecido.'}`
    });
    showToast(error.message || 'Falha ao gerar entrega.');
  } finally {
    state.busy = false;
    dom.generateBtn.disabled = false;
    dom.sendFreePromptBtn.disabled = false;
    dom.generateBtn.textContent = 'Gerar entrega estruturada';
    renderMessages();
    renderStats();
  }
}

async function runFreePrompt() {
  if (state.busy) return;

  const question = dom.freePromptInput.value.trim();
  const attachments = [...state.attachments];
  if (!question && !attachments.length) return;

  addMessage({
    role: 'user',
    label: attachments.length && !question ? 'Analise de referencia' : 'Refinamento',
    templateId: 'custom',
    text: question || `Analise os anexos enviados: ${attachments.map(summarizeAttachment).join(', ')}`
  });

  state.busy = true;
  dom.generateBtn.disabled = true;
  dom.sendFreePromptBtn.disabled = true;
  dom.sendFreePromptBtn.textContent = 'Enviando...';
  renderMessages();

  try {
    await callAssistant(
      question || 'Analise os anexos enviados e proponha proximos passos para o social media.',
      'custom',
      'Refinamento',
      attachments,
      []
    );
    dom.freePromptInput.value = '';
    clearAttachments();
  } catch (error) {
    showToast(error.message || 'Falha ao enviar refinamento.');
  } finally {
    state.busy = false;
    dom.generateBtn.disabled = false;
    dom.sendFreePromptBtn.disabled = false;
    dom.sendFreePromptBtn.textContent = 'Enviar';
    renderMessages();
  }
}

function copyText(text, successMessage) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMessage);
  }).catch(() => {
    showToast('Nao consegui copiar automaticamente.');
  });
}

function updateDraftStatus(draftId, status) {
  const draft = state.drafts.find(item => item.id === draftId);
  if (!draft) return;
  draft.status = status;
  saveState();
  renderDrafts();
  renderPlanner();
  renderStats();
}

function updateDraftDate(draftId, value) {
  const draft = state.drafts.find(item => item.id === draftId);
  if (!draft) return;
  draft.scheduledDate = value;
  if (value && draft.status === 'idea') {
    draft.status = 'scheduled';
  }
  saveState();
  renderDrafts();
  renderPlanner();
  renderStats();
  showToast(value ? 'Rascunho agendado.' : 'Agendamento removido.');
}

function deleteDraft(draftId) {
  state.drafts = state.drafts.filter(item => item.id !== draftId);
  saveState();
  renderDrafts();
  renderPlanner();
  renderStats();
  showToast('Rascunho removido.');
}

function replayDraftIntoChat(draftId) {
  const draft = state.drafts.find(item => item.id === draftId);
  if (!draft) return;
  dom.freePromptInput.value = `Refine este rascunho e entregue uma versao melhor:\n\n${draft.content}`;
  dom.freePromptInput.focus();
  document.querySelector('.workspace-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyCurrentWeek() {
  const lines = [
    `Planner da semana | ${formatDate(weekDates()[0])} ate ${formatDate(weekDates()[6])}`,
    ''
  ];

  weekDates().forEach(date => {
    const iso = date.toISOString().slice(0, 10);
    const items = state.drafts.filter(draft => draft.scheduledDate === iso);
    lines.push(`${formatLongDate(date)}:`);
    if (!items.length) {
      lines.push('- Sem publicacao agendada');
    } else {
      items.forEach(item => {
        lines.push(`- ${item.title} | ${getPipelineLabel(item.status)}`);
      });
    }
    lines.push('');
  });

  copyText(lines.join('\n'), 'Resumo da semana copiado.');
}

function maybeOpenOnboarding() {
  const hasAnyBriefing = Object.values(state.settings).some(value => String(value || '').trim());
  if (!hasAnyBriefing) openBriefingModal();
}

function hydrateUi() {
  populateBriefingForm();
  renderBriefingSummary();
  renderTemplateOptions();
  applyTemplatePreset(state.activeTemplateId);
  renderQuickActions();
  syncTemplateUi();
  renderDraftFilterPills();
  renderDrafts();
  renderPlanner();
  renderMessages();
  renderStats();
  renderAttachments();
}

dom.templateSelect.addEventListener('change', event => {
  state.activeTemplateId = event.target.value;
  syncTemplateUi();
  applyTemplatePreset(event.target.value);
});

dom.studioForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(dom.studioForm);
  runStructuredTask({
    template: formData.get('template'),
    platform: formData.get('platform'),
    objective: formData.get('objective'),
    funnel: formData.get('funnel'),
    product: formData.get('product'),
    campaign: formData.get('campaign'),
    dueDate: formData.get('dueDate'),
    cta: formData.get('cta'),
    notes: formData.get('notes'),
    customPrompt: formData.get('customPrompt')
  });
});

dom.briefingForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(dom.briefingForm);
  state.settings = {
    goalMonth: formData.get('goalMonth'),
    productFocus: formData.get('productFocus'),
    campaigns: formData.get('campaigns'),
    keyDates: formData.get('keyDates'),
    channels: formData.get('channels'),
    frequency: formData.get('frequency'),
    audience: formData.get('audience'),
    offerFocus: formData.get('offerFocus'),
    pillars: formData.get('pillars'),
    ctaBank: formData.get('ctaBank'),
    restrictions: formData.get('restrictions')
  };
  saveState();
  renderBriefingSummary();
  renderStats();
  closeBriefingModal();
  showToast('Briefing salvo.');
});

dom.editBriefingBtn.addEventListener('click', openBriefingModal);
dom.closeBriefingBtn.addEventListener('click', closeBriefingModal);
dom.briefingModal.addEventListener('click', event => {
  if (event.target === dom.briefingModal) closeBriefingModal();
});

dom.newTaskBtn.addEventListener('click', () => {
  dom.studioForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('notesInput').focus();
});

dom.copyWeekBtn.addEventListener('click', copyCurrentWeek);

[dom.attachBtn, dom.freeAttachBtn].forEach(button => {
  button.addEventListener('click', () => dom.attachmentInput.click());
});

dom.clearAttachmentsBtn.addEventListener('click', clearAttachments);

dom.attachmentInput.addEventListener('change', event => {
  addAttachments(event.target.files);
  event.target.value = '';
});

dom.attachmentList.addEventListener('click', event => {
  const button = event.target.closest('[data-attachment-index]');
  if (!button) return;
  const index = Number(button.dataset.attachmentIndex);
  if (!Number.isNaN(index)) {
    state.attachments.splice(index, 1);
    renderAttachments();
  }
});

dom.sendFreePromptBtn.addEventListener('click', runFreePrompt);
dom.freePromptInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    runFreePrompt();
  }
});

dom.clearHistoryBtn.addEventListener('click', () => {
  state.messages = [];
  saveState();
  loadState();
  renderMessages();
  renderStats();
  showToast('Historico limpo.');
});

dom.draftSearchInput.addEventListener('input', event => {
  state.draftSearch = event.target.value.trim();
  renderDrafts();
});

dom.draftList.addEventListener('change', event => {
  if (event.target.matches('[data-draft-status]')) {
    updateDraftStatus(event.target.dataset.draftStatus, event.target.value);
  }
  if (event.target.matches('[data-draft-date]')) {
    updateDraftDate(event.target.dataset.draftDate, event.target.value);
  }
});

dom.draftList.addEventListener('click', event => {
  const copyButton = event.target.closest('[data-draft-copy]');
  if (copyButton) {
    const draft = state.drafts.find(item => item.id === copyButton.dataset.draftCopy);
    if (draft) copyText(draft.content, 'Rascunho copiado.');
    return;
  }

  const openButton = event.target.closest('[data-draft-open]');
  if (openButton) {
    replayDraftIntoChat(openButton.dataset.draftOpen);
    return;
  }

  const deleteButton = event.target.closest('[data-draft-delete]');
  if (deleteButton) {
    deleteDraft(deleteButton.dataset.draftDelete);
  }
});

dom.studioMessages.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const messageId = button.dataset.id;
  if (button.dataset.action === 'copy') {
    const message = state.messages.find(item => item.id === messageId);
    if (message) copyText(message.text, 'Resposta copiada.');
  }
  if (button.dataset.action === 'save') {
    saveDraftFromMessage(messageId);
  }
});

dom.prevWeekBtn.addEventListener('click', () => {
  const next = new Date(state.weekStart);
  next.setDate(next.getDate() - 7);
  state.weekStart = next;
  saveState();
  renderPlanner();
});

dom.nextWeekBtn.addEventListener('click', () => {
  const next = new Date(state.weekStart);
  next.setDate(next.getDate() + 7);
  state.weekStart = next;
  saveState();
  renderPlanner();
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeBriefingModal();
});

loadState();
hydrateUi();
maybeOpenOnboarding();

fetch(AI_HEALTH_ENDPOINT)
  .then(response => {
    if (!response.ok) throw new Error('Falha ao validar backend');
    return response.json();
  })
  .then(data => {
    const maxAttachmentBytes = Number(data?.maxAttachmentBytes);
    if (maxAttachmentBytes > 0) {
      state.backendLimits.maxAttachmentBytes = maxAttachmentBytes;
    }
  })
  .catch(() => {
    showToast('Nao consegui validar o backend agora, mas o painel continua pronto para uso.');
  });
