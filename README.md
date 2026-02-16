# bank_analytics

## Setup rápido

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

```bash
npm install
npm run install-all
npm run dev
```

`npm run dev` na raiz sobe:

- frontend (`5173`)
- backend em microsserviços (`gateway + auth + data + analytics`)

## Execução

Backend (microsserviços):

```bash
cd backend
npm run dev
```

Backend (fallback monólito):

```bash
cd backend
npm run dev:monolith
```

Frontend:

```bash
cd frontend
npm run dev
```

## Migrations e seed

Rodar migration manual:

```bash
cd backend
npm run db:migrate
```

Pular migration automática no `dev`:

```bash
cd backend
SKIP_MIGRATIONS=true npm run dev
```

Seed de admin:

```bash
cd backend
npm run seed:admin
```

Em produção:

```bash
ALLOW_ADMIN_SEED=true NODE_ENV=production npm run seed:admin
```

## Arquitetura atual (MVP)

Portas padrão:

- Gateway: `5000` (`PORT`)
- Auth: `5001` (`AUTH_PORT` / `AUTH_URL`)
- Data: `5002` (`DATA_PORT` / `DATA_URL`)
- Analytics: `5003` (`ANALYTICS_PORT` / `ANALYTICS_URL`)

Roteamento via gateway:

- `/auth/*` -> auth
- `/agencias|users|periodos|produtos|import/*` -> data
- `/dashboard/*` -> analytics

## Saúde e monitoramento

Endpoints:

- `GET http://localhost:5000/status`
- `GET http://localhost:5000/status/deps` (admin)
- `GET http://localhost:5001/status`
- `GET http://localhost:5002/status`
- `GET http://localhost:5003/status`

Tela admin:

- `http://localhost:5173/admin/configuracoes/status-sistema`

## Request-Id

As APIs aceitam e retornam `X-Request-Id`.

- Se o cliente enviar, o ID é reutilizado.
- Se não enviar, o backend gera automaticamente.
- O gateway propaga o mesmo ID para os serviços internos.
- Os logs HTTP incluem `[req:<id>]`.

Exemplo:

```bash
curl -H "X-Request-Id: pos-analise-001" http://localhost:5000/status
```

## CI (Quality Gate)

Workflow em `.github/workflows/ci.yml`:

1. instala dependências
2. roda testes do backend
3. roda build do frontend

Use com branch protection na `main` para bloquear merge quando o CI falhar.

## Troubleshooting rápido

```bash
docker-compose ps
docker-compose logs -f db
```

```bash
curl http://localhost:5000/status
curl http://localhost:5000/status/deps
curl http://localhost:5001/status
curl http://localhost:5002/status
curl http://localhost:5003/status
```