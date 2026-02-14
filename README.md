# bank_analytics

## Configuração por ambiente

Copie os arquivos de exemplo e ajuste as variáveis:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Principais variáveis do backend:

- DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT
- JWT_SECRET
- INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD (usadas no seed manual)
- APP_BASE_URL (usada para montar link de troca de senha)
- LOG_SQL (true/false)

Principais variáveis do frontend:

- VITE_API_URL (URL do backend)

## Codespaces (URLs)

Quando rodar no Codespaces, use:

- Frontend: `https://<seu-codespace>-5173.app.github.dev`
- Backend: `https://<seu-codespace>-5000.app.github.dev`

## Como rodar

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Backend (migrations)

Rodar migrations manualmente:

```bash
cd backend
npm run db:migrate
```

O comando `npm run dev` executa migrations automaticamente. Para pular:

```bash
cd backend
SKIP_MIGRATIONS=true npm run dev
```

## Seed do admin (manual)

Para criar o primeiro admin em ambiente novo:

```bash
cd backend
npm run seed:admin
```

Em produção, o seed exige a flag:

```bash
ALLOW_ADMIN_SEED=true NODE_ENV=production npm run seed:admin
```