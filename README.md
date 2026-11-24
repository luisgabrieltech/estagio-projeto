# Avalia

Avalia é uma aplicação web para criar avaliações, coletar respostas e analisar resultados. Você pode definir o público de cada formulário, criar perguntas condicionais, exportar respostas em CSV e emitir certificados de participação com um código de verificação pública.

## Rodar localmente

Você precisa de Node.js 22.12 ou superior com npm, Docker com Compose v2 e OpenSSL. O Compose inicia o PostgreSQL 16. A aplicação Next.js roda no host.

```bash
git clone https://github.com/luisgabrieltech/estagio-projeto.git
cd estagio-projeto
npm ci
cp .env.example .env
```

Edite o `.env` e preencha estes valores:

| Variável | Valor |
| --- | --- |
| `POSTGRES_PASSWORD` | Gere com `openssl rand -hex 24`. |
| `DATABASE_URL` | Substitua `SENHA_GERADA` pela mesma senha. O banco padrão é `avalia_dev`, na porta local `5432`. |
| `NEXTAUTH_SECRET` | Gere com `openssl rand -base64 32`. |

Se alterar `POSTGRES_USER` ou `POSTGRES_DB`, use os mesmos valores em `DATABASE_URL`. O PostgreSQL lê essas variáveis na inicialização do volume. Por padrão, o volume `postgres_data` preserva dados entre reinícios.

```bash
docker compose up -d --wait db
npx prisma migrate deploy
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Para testar o build de produção localmente, pare o servidor de desenvolvimento e rode `npm run build` seguido de `npm start`.

### Experimentar o fluxo completo

Em um banco local ou descartável, defina `DEMO_SEED_PASSWORD` no `.env` com pelo menos 12 caracteres e até 72 bytes. Execute:

```bash
npm run db:seed
```

1. Entre com `admin@example.test` e a senha definida no seed. No painel administrativo, crie um formulário com pelo menos uma pergunta.
2. Publique o formulário, marque-o como disponível e inclua **Docente** no público.
3. Saia da conta administrativa e entre com `docente@example.test`, usando a mesma senha inicial. Preencha a avaliação.
4. Volte à conta administrativa para consultar as estatísticas e exportar as respostas.

O seed também cria uma avaliação fictícia para docentes. Reexecutá-lo preserva dados e senhas existentes. Ele recusa execução com `NODE_ENV=production`.

## Arquitetura

Avalia é um monólito Next.js com uma instalação por organização. Páginas e Route Handlers convivem na mesma aplicação. Os endpoints encaminham operações para serviços de domínio, que usam repositórios Prisma para acessar o PostgreSQL.

| Caminho | Responsabilidade |
| --- | --- |
| `app/` | Home, autenticação, painéis e endpoints HTTP |
| `components/` e `hooks/` | Interface de formulários, controles de avaliação e cache no cliente |
| `lib/domain/` | Regras de formulários, elegibilidade, respostas, resultados e certificados |
| `lib/infrastructure/` | Repositórios Prisma |
| `lib/auth/` e `middleware.ts` | Sessão NextAuth, acesso a rotas e limites de consulta |
| `prisma/` | Modelo de dados, migrações e seed fictício |
| `__tests__/` | Testes com Vitest, Testing Library, MSW e fast-check |

A interface usa React, TypeScript, Tailwind CSS, Radix UI e TanStack Query. Certificados são gerados com PDFKit sob demanda no download autorizado. A consulta pública por código devolve apenas código, título da avaliação e data de emissão.

## Personalização e integrações

- `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_BRAND_LOGO_PATH` e `NEXT_PUBLIC_SUPPORT_EMAIL` configuram o nome, o logotipo e o contato. Coloque o logotipo no diretório `public/` e informe o caminho público. Variáveis `NEXT_PUBLIC_*` precisam ser definidas antes do build.
- `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` usam `http://localhost:3000` no ambiente local. Para um deploy em subcaminho, alinhe essas URLs ao `NEXT_PUBLIC_BASE_PATH` e configure o proxy para remover o prefixo antes de encaminhar a requisição.
- SMTP é opcional. Configure o bloco `SMTP_*` de [`.env.example`](.env.example) para enviar e-mails de recuperação.
- Sentry é opcional. Defina um DSN próprio para cada ambiente desejado. O upload de source maps exige também organização, projeto e token. Mantenha segredos no ambiente de execução e use dados fictícios para demonstrações.

## Testes

```bash
npm run test:run
npm run test:coverage
npm run build
```

A suíte cobre regras de domínio, autorização, perguntas condicionais e contratos de API. Parte dos testes usa repositórios simulados e MSW. A validação com PostgreSQL em execução é um passo separado.
