# fottu.br + Groq Chatbot

## 1) Instalar dependencias
```bash
npm install
```

## 2) Criar o arquivo `.env`
Copie `.env.example` para `.env` e preencha sua chave:

```env
GROQ_API_KEY=sua_chave_aqui
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
```

## 3) Rodar o projeto
```bash
npm start
```

Se a porta `3000` estiver ocupada, rode com outra:

## 4) Abrir no navegador
```text
http://localhost:3001
```

## Versao para social media
Para subir a versao completa do workspace de social media em uma porta de teste separada:

```bash
npm run start:social
```

Ela abre em:

```text
http://localhost:3004
```

## Recursos do chatbot
- Modo `Auto` para escolher o melhor motor por prompt
- `GPT OSS 120B`
- `Llama 4 Scout` para imagem + texto
- `Whisper Large v3` para transcricao de audio
- `browser_search` para pesquisa web
- `code_interpreter` para calculos e analises
- Upload de imagem, audio e arquivos de texto
- Criacao automatica de campos no briefing
- Workspace dedicado para social media com onboarding, acoes prontas, biblioteca de rascunhos e planner semanal

## Endpoints uteis
- `GET /api/health`
- `GET /api/models`
- `POST /api/chat`

## Observacoes
- O chat usa `multipart/form-data` para suportar anexos.
- Pedidos textuais vao para `GPT OSS 120B`, e pedidos com imagem vao para `Llama 4 Scout`.
- A chave fica so no backend.

## Deploy no Netlify
O site nao roda a IA sozinho so com HTML estatico. Para a IA funcionar no Netlify, este projeto usa uma `Netlify Function` que reaproveita o backend do `server.js`.

### Arquivos usados no deploy
- `netlify.toml`
- `netlify/functions/api.js`

### Variaveis de ambiente no painel do Netlify
Em `Site configuration > Environment variables`, configure:

```env
GROQ_API_KEY=sua_chave_aqui
GROQ_MODEL=openai/gpt-oss-120b
GROQ_BASE_URL=https://api.groq.com/openai/v1
LANDING_PAGE=index.html
```

Opcionalmente, voce pode usar `OPENAI_API_KEY`, `OPENAI_MODEL` e `OPENAI_BASE_URL` no lugar das variaveis `GROQ_*`.

### Build recomendado
- Base directory: deixe a pasta deste projeto como raiz do deploy
- Publish directory: `.`
- Functions directory: `netlify/functions`

Depois de salvar as variaveis, faca um novo deploy.

### Endpoint esperado
Com o redirect do `netlify.toml`, o front continua chamando:

```text
/api/chat
/api/models
/api/health
```

### Limite importante no Netlify
No ambiente do Netlify, cada anexo fica limitado a aproximadamente `4 MB` para evitar erro de payload no Functions. Localmente, o backend continua aceitando anexos maiores.
