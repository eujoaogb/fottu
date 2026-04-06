import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3001;
const landingPage = process.env.LANDING_PAGE || 'index.html';
const isNetlifyRuntime = Boolean(process.env.NETLIFY);
const projectRoot = process.cwd();
const chatApiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const chatBaseURL =
  process.env.GROQ_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  'https://api.groq.com/openai/v1';

const DEFAULT_CHAT_MODEL =
  process.env.GROQ_MODEL ||
  process.env.OPENAI_MODEL ||
  'openai/gpt-oss-120b';

const AUDIO_MODEL = 'whisper-large-v3';
const MAX_ATTACHMENTS = 5;
const MAX_TEXT_ATTACHMENT_CHARS = 12000;
const MAX_AUDIO_TRANSCRIPT_CHARS = 12000;
const MAX_INLINE_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = isNetlifyRuntime ? 4 * 1024 * 1024 : 20 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_ATTACHMENTS,
    fileSize: MAX_ATTACHMENT_BYTES
  }
});

const chatClient = chatApiKey
  ? new OpenAI({
      apiKey: chatApiKey,
      baseURL: chatBaseURL
    })
  : null;

if (!chatApiKey) {
  console.warn(
    '[aviso] GROQ_API_KEY nao foi definida. A rota /api/chat vai falhar ate a chave ser configurada.'
  );
}

app.use(express.json({ limit: '2mb' }));

if (!isNetlifyRuntime) {
  app.use(express.static(projectRoot, { index: false }));

  app.get('/fottu_conteudo_completo.html', (_req, res) => {
    res.sendFile(path.join(projectRoot, 'fottu_conteudo_completo.html'));
  });
}

const FIELD_CATALOG = [
  {
    id: 'customerName',
    label: 'Nome do cliente',
    type: 'text',
    placeholder: 'Digite o nome do cliente',
    keywords: ['nome do cliente', 'cliente', 'contato']
  },
  {
    id: 'customerPhone',
    label: 'WhatsApp do cliente',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    keywords: ['telefone', 'whatsapp', 'contato']
  },
  {
    id: 'customerEmail',
    label: 'E-mail do cliente',
    type: 'email',
    placeholder: 'cliente@email.com',
    keywords: ['email', 'e-mail']
  },
  {
    id: 'petName',
    label: 'Nome do pet',
    type: 'text',
    placeholder: 'Ex.: Luna',
    keywords: ['pet', 'nome do pet', 'cachorro', 'gato']
  },
  {
    id: 'babyName',
    label: 'Nome do bebe / crianca',
    type: 'text',
    placeholder: 'Ex.: Theo',
    keywords: ['bebe', 'crianca']
  },
  {
    id: 'occasion',
    label: 'Ocasiao / data especial',
    type: 'text',
    placeholder: 'Ex.: Dia das Maes, aniversario, casamento',
    keywords: ['ocasiao', 'data especial', 'evento', 'comemoracao']
  },
  {
    id: 'giftMessage',
    label: 'Frase para o presente',
    type: 'textarea',
    placeholder: 'Escreva a mensagem que acompanhara o pedido',
    keywords: ['frase', 'mensagem', 'recado', 'dedicatoria']
  },
  {
    id: 'quantity',
    label: 'Quantidade desejada',
    type: 'number',
    placeholder: 'Ex.: 8',
    keywords: ['quantidade', 'unidades', 'kit']
  },
  {
    id: 'size',
    label: 'Tamanho do ima',
    type: 'select',
    placeholder: '',
    options: ['5x5 cm', '6x6 cm', 'Outro'],
    keywords: ['tamanho', 'medida', 'dimensao']
  },
  {
    id: 'photoReference',
    label: 'Link ou referencia da foto',
    type: 'text',
    placeholder: 'Cole aqui o link ou referencia enviada',
    keywords: ['foto', 'imagem', 'arquivo', 'referencia']
  },
  {
    id: 'deliveryDate',
    label: 'Prazo / data limite',
    type: 'date',
    placeholder: '',
    keywords: ['prazo', 'urgencia', 'data limite', 'entrega']
  },
  {
    id: 'address',
    label: 'Endereco de entrega',
    type: 'textarea',
    placeholder: 'Rua, numero, complemento, bairro, cidade',
    keywords: ['endereco', 'entrega', 'frete', 'cep']
  },
  {
    id: 'stylePreference',
    label: 'Estilo desejado',
    type: 'text',
    placeholder: 'Ex.: delicado, minimalista, romantico',
    keywords: ['estilo', 'visual', 'estetica', 'layout']
  },
  {
    id: 'colors',
    label: 'Cores preferidas',
    type: 'text',
    placeholder: 'Ex.: terracota e creme',
    keywords: ['cor', 'cores', 'paleta']
  },
  {
    id: 'notes',
    label: 'Observacoes adicionais',
    type: 'textarea',
    placeholder: 'Detalhes extras do pedido',
    keywords: ['observacao', 'detalhe', 'extra', 'observacoes']
  }
];

const GUIDE_SUMMARY = [
  'A marca fottu.br vende presentes personalizados com foto e apelo de memoria afetiva premium.',
  'Os canais prioritarios sao Instagram para atracao, WhatsApp Business para fechamento e TikTok para descoberta.',
  'O posicionamento deve ser caloroso, proximo, refinado e emocional.',
  'O pedido ideal coleta dados como contato, referencia da foto, quantidade, prazo e endereco.',
  'Embalagem, pos-venda e prova social fazem parte da experiencia e ajudam na recompra e indicacao.',
  'O assistente pode sugerir ou criar campos novos no briefing quando a duvida indicar que falta coletar alguma informacao.'
].join(' ');

const AUTO_MODEL_ID = 'auto';
const AUTO_MODEL = {
  id: AUTO_MODEL_ID,
  label: 'Auto',
  description: 'Escolhe automaticamente o melhor motor para cada prompt.',
  supportsVision: true,
  supportsBuiltInBrowserSearch: true,
  supportsCodeExecution: true,
  recommended: true
};

const CHAT_MODELS = [
  {
    id: 'openai/gpt-oss-120b',
    label: 'GPT OSS 120B',
    description: 'Melhor escolha geral para respostas mais fortes, pesquisa web e code execution.',
    supportsVision: false,
    supportsBuiltInBrowserSearch: true,
    supportsCodeExecution: true,
    recommended: true
  },
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    label: 'Llama 4 Scout',
    description: 'Modelo multimodal para imagem + texto. Ideal para analisar fotos e referencias visuais.',
    supportsVision: true,
    supportsBuiltInBrowserSearch: false,
    supportsCodeExecution: false,
    recommended: false
  }
];

const TOOL_OPTIONS = [
  {
    id: 'browser_search',
    label: 'Browser Search',
    description: 'Busca na web diretamente pelo Groq.',
    supportedModels: [AUTO_MODEL_ID, 'openai/gpt-oss-120b']
  },
  {
    id: 'code_interpreter',
    label: 'Code Execution',
    description: 'Executa Python no sandbox do Groq para calculos e analises.',
    supportedModels: [AUTO_MODEL_ID, 'openai/gpt-oss-120b']
  }
];

const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.csv',
  '.json',
  '.html',
  '.htm',
  '.xml',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.css',
  '.log'
]);

const AUDIO_EXTENSIONS = new Set([
  '.mp3',
  '.mp4',
  '.mpeg',
  '.mpga',
  '.m4a',
  '.wav',
  '.webm',
  '.ogg',
  '.flac'
]);

function safeString(value, max = 4000) {
  return String(value ?? '').slice(0, max);
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseMaybeJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;

  const text = String(value).trim();
  if (!text) return fallback;

  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function normalizeField(field) {
  const cleanId =
    safeString(field?.id, 80).replace(/[^a-zA-Z0-9_-]/g, '') || `field_${Date.now()}`;

  return {
    id: cleanId,
    label: safeString(field?.label, 120) || 'Novo campo',
    type: ['text', 'textarea', 'number', 'email', 'tel', 'date', 'select'].includes(field?.type)
      ? field.type
      : 'text',
    placeholder: safeString(field?.placeholder, 180),
    options: Array.isArray(field?.options)
      ? field.options.map((item) => safeString(item, 80)).filter(Boolean).slice(0, 20)
      : []
  };
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-10)
    .map((message) => {
      const rawRole = safeString(message?.role, 24).toLowerCase();
      const role = rawRole === 'assistant' || rawRole === 'bot' ? 'assistant' : 'user';
      const text = safeString(message?.text ?? message?.content, 4000).trim();
      if (!text) return null;
      return {
        role,
        content: text
      };
    })
    .filter(Boolean);
}

function getModelConfig(modelId) {
  return CHAT_MODELS.find((item) => item.id === modelId) || CHAT_MODELS[0];
}

function normalizeModel(modelId) {
  const cleanModelId = safeString(modelId, 120) || DEFAULT_CHAT_MODEL;
  if (cleanModelId === AUTO_MODEL_ID) return AUTO_MODEL_ID;
  return getModelConfig(cleanModelId).id;
}

function normalizeTools(rawTools, modelId) {
  const requested = Array.isArray(rawTools)
    ? rawTools.map((item) => safeString(item, 80)).filter(Boolean)
    : [];

  const modelTools = TOOL_OPTIONS.filter((tool) => tool.supportedModels.includes(modelId));

  return requested.filter((toolId) => modelTools.some((tool) => tool.id === toolId));
}

function inferAutoTools(question, resolvedModel, rawRequestedTools) {
  if (Array.isArray(rawRequestedTools) && rawRequestedTools.length) {
    return normalizeTools(rawRequestedTools, resolvedModel);
  }

  if (resolvedModel !== 'openai/gpt-oss-120b') {
    return [];
  }

  const normalized = normalizeText(question);
  const inferred = [];

  if (
    /(hoje|agora|atual|atualizada|tendencia|tendencia atual|noticia|noticia atual|pesquise|pesquisar|busque|procure|novidade|recente|mercado atual)/.test(
      normalized
    )
  ) {
    inferred.push('browser_search');
  }

  if (
    /(calcule|calcular|orcamento|orçamento|margem|roi|projecao|projeção|simule|simular|ticket medio|ticket médio|planilha|tabela|conversao|conversão)/.test(
      normalized
    )
  ) {
    inferred.push('code_interpreter');
  }

  return inferred;
}

function inferFields(question) {
  const normalized = normalizeText(question);
  const matches = FIELD_CATALOG.filter((field) =>
    field.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  );

  const wantsFields =
    /(adicion|inclu|crie|criar|novo campo|novos campos|briefing|formulario|pedir do cliente|coletar|preciso perguntar|preciso pedir)/.test(
      normalized
    );

  if (matches.length && wantsFields) return matches.map(normalizeField);

  if (
    /quais dados.*pedido|dados.*cliente|informacoes.*pedido|pedir.*cliente/.test(normalized)
  ) {
    return FIELD_CATALOG.filter((field) =>
      [
        'customerName',
        'customerPhone',
        'photoReference',
        'quantity',
        'deliveryDate',
        'address',
        'notes'
      ].includes(field.id)
    ).map(normalizeField);
  }

  return wantsFields ? matches.map(normalizeField) : [];
}

function buildFallbackReply(question, contextTopics = []) {
  const normalized = normalizeText(question);
  const contextSummary = Array.isArray(contextTopics)
    ? contextTopics
        .slice(0, 3)
        .map((item) => safeString(item?.title || item?.key || '', 80))
        .filter(Boolean)
    : [];

  if (/dados.*cliente|pedir.*cliente|fechar.*pedido|informacoes.*pedido/.test(normalized)) {
    return 'Para fechar um pedido com seguranca, o ideal e coletar pelo menos: nome do cliente, contato, referencia da foto, quantidade, prazo desejado e endereco de entrega. Se houver personalizacao, vale pedir tambem frase, estilo e observacoes.';
  }

  if (/preco|precificacao|precificar|valor|margem/.test(normalized)) {
    return 'Na precificacao, some o custo do blank, insumos, embalagem e tempo de producao. Depois aplique uma margem real. Uma referencia inicial segura e trabalhar com pelo menos 2,5x o custo total e incentivar kits para elevar o ticket medio.';
  }

  if (/instagram|tiktok|whatsapp|elo7|mercado livre|canal|canais/.test(normalized)) {
    return 'A sequencia mais eficiente e usar Instagram para atrair, WhatsApp para converter e TikTok para ampliar alcance organico. Elo7 e Mercado Livre entram bem como complemento para capturar demanda pronta.';
  }

  if (/tom de voz|comunica|legenda|copy|marca|branding/.test(normalized)) {
    return 'A comunicacao da fottu.br deve ser proxima, calorosa e emocional. O foco e fazer a pessoa sentir o valor afetivo da lembranca, evitando linguagem fria, tecnica ou agressiva.';
  }

  if (/embalagem|pos venda|pos-venda|cartao/.test(normalized)) {
    return 'A experiencia de entrega e parte do produto. Uma embalagem simples, bonita e carinhosa, com cartao escrito a mao e contato pos-venda, aumenta a percepcao de valor e estimula indicacao.';
  }

  if (contextSummary.length) {
    return `Posso te orientar com base no guia da fottu.br. Os temas mais relacionados a sua pergunta sao: ${contextSummary.join(', ')}.`;
  }

  return 'Entendi sua duvida. Dentro deste guia, eu consigo te orientar sobre mercado, inicio da operacao, primeiros clientes, canais de venda, marca, embalagem, tom de voz e organizacao do pedido.';
}

function isImageAttachment(file) {
  return Boolean(file?.mimetype?.startsWith('image/'));
}

function isAudioAttachment(file) {
  if (file?.mimetype?.startsWith('audio/')) return true;
  const extension = path.extname(file?.originalname || '').toLowerCase();
  return AUDIO_EXTENSIONS.has(extension);
}

function isTextAttachment(file) {
  if (!file) return false;
  if (file?.mimetype?.startsWith('text/')) return true;
  if (
    [
      'application/json',
      'application/xml',
      'application/javascript',
      'text/csv'
    ].includes(file?.mimetype)
  ) {
    return true;
  }
  const extension = path.extname(file?.originalname || '').toLowerCase();
  return TEXT_EXTENSIONS.has(extension);
}

function toDataUrl(file) {
  return `data:${file.mimetype || 'application/octet-stream'};base64,${file.buffer.toString('base64')}`;
}

async function transcribeAudioAttachment(file) {
  if (!chatClient) {
    throw new Error('GROQ_API_KEY nao configurada para transcricao de audio.');
  }

  const audioFile = new File([file.buffer], file.originalname || 'audio-file', {
    type: file.mimetype || 'application/octet-stream'
  });

  const transcription = await chatClient.audio.transcriptions.create({
    file: audioFile,
    model: AUDIO_MODEL,
    response_format: 'json'
  });

  return safeString(transcription?.text, MAX_AUDIO_TRANSCRIPT_CHARS);
}

async function parseAttachments(files) {
  const imageParts = [];
  const textBlocks = [];
  const warnings = [];
  const summaries = [];

  for (const file of files.slice(0, MAX_ATTACHMENTS)) {
    if (!file?.buffer?.length) continue;

    const name = safeString(file.originalname || 'arquivo', 140);

    if (isImageAttachment(file)) {
      if (file.buffer.length > MAX_INLINE_IMAGE_BYTES) {
        warnings.push(
          `${name}: imagem muito grande para envio inline. Use um arquivo menor (ate 3 MB).`
        );
        continue;
      }

      imageParts.push({
        type: 'image_url',
        image_url: {
          url: toDataUrl(file)
        }
      });
      summaries.push({ name, type: 'image' });
      continue;
    }

    if (isAudioAttachment(file)) {
      try {
        const transcript = await transcribeAudioAttachment(file);
        if (transcript) {
          textBlocks.push({
            name,
            type: 'audio_transcript',
            content: transcript
          });
          summaries.push({ name, type: 'audio' });
        }
      } catch (error) {
        warnings.push(
          `${name}: nao consegui transcrever o audio (${safeString(error?.message, 160)}).`
        );
      }
      continue;
    }

    if (isTextAttachment(file)) {
      const textContent = safeString(file.buffer.toString('utf8'), MAX_TEXT_ATTACHMENT_CHARS);
      textBlocks.push({
        name,
        type: 'text',
        content: textContent
      });
      summaries.push({ name, type: 'text' });
      continue;
    }

    warnings.push(
      `${name}: formato ainda nao suportado no chat. Use imagem, audio ou arquivo de texto.`
    );
  }

  return {
    imageParts,
    textBlocks,
    warnings,
    summaries
  };
}

function buildAttachmentContext(textBlocks, warnings) {
  const sections = textBlocks.map((block) => {
    const title =
      block.type === 'audio_transcript'
        ? `Transcricao do audio "${block.name}"`
        : `Conteudo do arquivo "${block.name}"`;

    return `${title}:\n${block.content}`;
  });

  if (warnings.length) {
    sections.push(`Avisos de anexo:\n- ${warnings.join('\n- ')}`);
  }

  return sections.join('\n\n');
}

function buildSystemPrompt() {
  return [
    'Voce e o assistente oficial do guia da fottu.br.',
    'Responda sempre em portugues do Brasil, com tom claro, util e caloroso.',
    'Priorize respostas curtas, acionaveis e bem organizadas.',
    'Use o contexto do guia da marca como base principal e nao invente capacidades da empresa nem numeros nao informados.',
    'Quando o usuario perguntar sobre atendimento, vendas, canais, briefing, embalagem ou operacao, conecte a resposta ao negocio da fottu.br.',
    'Se houver anexos, use o conteudo deles diretamente na resposta.',
    'Se houver pesquisa web ou execucao de codigo, incorpore o resultado naturalmente na resposta final.'
  ].join(' ');
}

function buildUserContent({
  question,
  contextTopics,
  currentFields,
  attachmentContext
}) {
  const serializedContext = Array.isArray(contextTopics)
    ? contextTopics
        .slice(0, 6)
        .map((item) => `${safeString(item?.title || item?.key || 'Tema', 80)}: ${safeString(item?.answer || '', 400)}`)
        .filter(Boolean)
        .join('\n')
    : '';

  const serializedFields = Array.isArray(currentFields) && currentFields.length
    ? currentFields
        .slice(0, 25)
        .map((field) => `${safeString(field?.id, 50)} - ${safeString(field?.label, 120)}`)
        .join('\n')
    : 'Nenhum campo dinamico criado ainda.';

  return [
    `Resumo do guia:\n${GUIDE_SUMMARY}`,
    serializedContext ? `Contexto rapido do front-end:\n${serializedContext}` : '',
    `Campos atuais do briefing:\n${serializedFields}`,
    attachmentContext ? `Anexos enviados:\n${attachmentContext}` : '',
    `Pergunta do usuario:\n${question}`
  ]
    .filter(Boolean)
    .join('\n\n');
}

function chooseAutoModel({ imageParts, requestedTools }) {
  const requestedToolIds = Array.isArray(requestedTools)
    ? requestedTools.map((toolId) => safeString(toolId, 80)).filter(Boolean)
    : [];

  if (imageParts.length) {
    return {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      reason: 'Auto: detectei imagem e direcionei para Llama 4 Scout.'
    };
  }

  if (requestedToolIds.length) {
    return {
      model: 'openai/gpt-oss-120b',
      reason: 'Auto: tools do Groq ativas pedem GPT OSS 120B.'
    };
  }

  return {
    model: 'openai/gpt-oss-120b',
    reason: 'Auto: pedidos textuais usam GPT OSS 120B como motor principal.'
  };
}

function resolveModel(requestedModel, { question, imageParts, textBlocks, requestedTools }) {
  const notes = [];
  const normalizedModel = normalizeModel(requestedModel);
  let resolvedModel = normalizedModel;

  if (normalizedModel === AUTO_MODEL_ID) {
    const autoChoice = chooseAutoModel({
      imageParts,
      requestedTools
    });

    resolvedModel = autoChoice.model;
    notes.push(autoChoice.reason);
  }

  const requestedConfig = getModelConfig(resolvedModel);

  if (imageParts.length && !requestedConfig.supportsVision) {
    resolvedModel = 'meta-llama/llama-4-scout-17b-16e-instruct';
    notes.push('Imagem detectada: o modelo foi trocado automaticamente para Llama 4 Scout.');
  }

  return {
    requestedModel: normalizedModel,
    resolvedModel,
    notes
  };
}

function getToolTrace(executedTools = []) {
  if (!Array.isArray(executedTools)) return [];

  return executedTools
    .map((tool) => ({
      type: safeString(tool?.type || tool?.name, 60) || 'tool',
      output: safeString(tool?.output, 600)
    }))
    .filter((tool) => tool.type);
}

function getMessageText(content) {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part?.type === 'text') return part.text || '';
        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

app.get(['/api/models', '/models'], (_req, res) => {
  return res.json({
    provider: 'groq',
    defaultModel: AUTO_MODEL_ID,
    audioModel: AUDIO_MODEL,
    maxAttachmentBytes: MAX_ATTACHMENT_BYTES,
    models: CHAT_MODELS,
    tools: TOOL_OPTIONS
  });
});

app.get(['/api/health', '/health'], (_req, res) => {
  return res.json({
    ok: true,
    hasApiKey: Boolean(chatApiKey),
    provider: 'groq',
    defaultModel: AUTO_MODEL_ID,
    audioModel: AUDIO_MODEL,
    maxAttachmentBytes: MAX_ATTACHMENT_BYTES,
    baseURL: chatBaseURL,
    port
  });
});

app.post(['/api/chat', '/chat'], upload.array('attachments', MAX_ATTACHMENTS), async (req, res) => {
  try {
    const history = normalizeHistory(parseMaybeJson(req.body?.history, []));
    const currentFields = parseMaybeJson(req.body?.currentFields, []);
    const contextTopics = parseMaybeJson(req.body?.context, []);
    const requestedModel = safeString(req.body?.model, 120) || DEFAULT_CHAT_MODEL;
    const requestedTools = parseMaybeJson(req.body?.tools, []);
    const files = Array.isArray(req.files) ? req.files : [];

    const attachmentData = await parseAttachments(files);
    const attachmentContext = buildAttachmentContext(
      attachmentData.textBlocks,
      attachmentData.warnings
    );

    let question = safeString(req.body?.question, 2400).trim();
    if (!question && (attachmentData.imageParts.length || attachmentData.textBlocks.length)) {
      question = 'Analise os anexos enviados e me diga os principais pontos.';
    }

    if (!question) {
      return res.status(400).json({ error: 'Pergunta nao enviada.' });
    }

    const modelResolution = resolveModel(requestedModel, {
      question,
      imageParts: attachmentData.imageParts,
      textBlocks: attachmentData.textBlocks,
      requestedTools
    });
    const resolvedModel = modelResolution.resolvedModel;
    const enabledTools = inferAutoTools(question, resolvedModel, requestedTools);

    if (!chatApiKey) {
      const inferredFields = inferFields(`${question}\n${attachmentContext}`);
      return res.status(200).json({
        reply: buildFallbackReply(question, contextTopics),
        fieldsToAdd: inferredFields,
        provider: 'local-fallback',
        requestedModel: normalizeModel(requestedModel),
        resolvedModel,
        enabledTools,
        usedTools: [],
        notes: [
          'GROQ_API_KEY nao configurada no servidor. O chat respondeu com o fallback local.',
          ...modelResolution.notes,
          ...attachmentData.warnings
        ],
        attachments: attachmentData.summaries
      });
    }

    const userContentText = buildUserContent({
      question,
      contextTopics,
      currentFields,
      attachmentContext
    });

    const userMessage =
      attachmentData.imageParts.length > 0
        ? {
            role: 'user',
            content: [
              { type: 'text', text: userContentText },
              ...attachmentData.imageParts
            ]
          }
        : {
            role: 'user',
            content: userContentText
          };

    const requestBody = {
      model: resolvedModel,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...history,
        userMessage
      ],
      temperature: 0.3,
      max_completion_tokens: 1400
    };

    if (enabledTools.length) {
      requestBody.tools = enabledTools.map((toolId) => ({ type: toolId }));
      requestBody.tool_choice = 'auto';
    } else if (['openai/gpt-oss-120b'].includes(resolvedModel)) {
      requestBody.tool_choice = 'none';
    }

    const completion = await chatClient.chat.completions.create(requestBody);
    const message = completion?.choices?.[0]?.message;
    const reply =
      safeString(getMessageText(message?.content), 8000) ||
      'Nao consegui montar uma resposta agora.';

    const existingFieldIds = new Set(
      (Array.isArray(currentFields) ? currentFields : [])
        .map((field) => field?.id)
        .filter(Boolean)
    );

    const normalizedFields = inferFields(`${question}\n${attachmentContext}`).filter(
      (field) => !existingFieldIds.has(field.id)
    );

    return res.json({
      reply,
      fieldsToAdd: normalizedFields,
      provider: 'groq',
      requestedModel: modelResolution.requestedModel,
      resolvedModel,
      enabledTools,
      usedTools: getToolTrace(message?.executed_tools),
      notes: [...modelResolution.notes, ...attachmentData.warnings],
      attachments: attachmentData.summaries
    });
  } catch (error) {
    console.error('[erro /api/chat]', error);

    return res.status(500).json({
      error: 'Falha ao consultar a IA.',
      details: error?.message || 'Erro desconhecido.',
      provider: 'groq',
      defaultModel: normalizeModel(DEFAULT_CHAT_MODEL)
    });
  }
});

if (!isNetlifyRuntime) {
  app.get('/', (_req, res) => {
    res.sendFile(path.join(projectRoot, landingPage));
  });

  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(projectRoot, landingPage));
  });
}

function isDirectRun() {
  const entryFile = process.argv[1];
  if (!entryFile) return false;
  return path.basename(entryFile).toLowerCase() === 'server.js';
}

if (isDirectRun()) {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

export { app, MAX_ATTACHMENT_BYTES };
