# HANDOFF — contexto do projeto para continuar em outra máquina

> Cole este arquivo (ou peça para o Claude ler `HANDOFF.md`) ao retomar o trabalho em outro PC.

## O que é este projeto

Site de **excursões / pacotes de viagem** que o Lohan está montando **para portfólio**. Iniciado em 2026-09-17.

Referências analisadas (o que aproveitar de cada uma):

| Site | O que aproveitar |
|---|---|
| **Civitatis** (civitatis.com/br) | Home com **barra de busca de destino** no hero — modelo preferido pelo Lohan. Tiles de destinos populares, 4 selos de confiança, cards com nota/preço. |
| **GetYourGuide** | Cards de atividade com badges, duração, nota, "a partir de R$". Filtros na listagem. |
| **PasseioJá** (passeioja.com.br) | "Selecione a região de partida", seção "Como funciona" em passos, selos Cadastur/Reclame Aqui. |
| **Maria Lúcia Turismo** | CTA de reserva pelo **WhatsApp**, listagem de pacotes por mês, filtros (saída / mês / destino / categoria), depoimentos. |

## Decisões tomadas (respondidas pelo Lohan)

- **Hospedagem:** VPS da Hostinger (Node + MySQL na mesma máquina, sem Supabase ou banco de terceiros).
- **Stack:** Next.js 16 (App Router, TypeScript, Tailwind v4) + Prisma 7 + MySQL/MariaDB.
- **Reserva:** botão **WhatsApp** com mensagem pré-preenchida do pacote. Sem pagamento online por enquanto.
- **Fluxo principal:** Home (hero + busca de destino) → página do destino com lista de pacotes e filtros → página do pacote → WhatsApp.
- **Admin:** vai ter CRUD de destinos, pacotes, datas de saída e fotos (ainda não feito).
- Nome placeholder do site: "Rota Viva Turismo" (via `NEXT_PUBLIC_SITE_NAME` no `.env`).

## Estado atual do código

### Feito
- Projeto Next.js criado com `create-next-app` (TS, Tailwind, ESLint, App Router, `src/`).
- Prisma 7 com driver adapter `@prisma/adapter-mariadb`. Config em `prisma.config.ts` (**não** usa `url` no schema — vai no config).
- Schema em `prisma/schema.prisma`: `Destination`, `Category`, `Package`, `PackageImage`, `Departure`, `Testimonial`, `User`.
- Migração inicial aplicada e client gerado em `src/generated/prisma` (gitignored — rodar `npm run db:generate`).
- Seed em `prisma/seed.ts`: 8 destinos brasileiros, 6 categorias, 8 pacotes com roteiro/datas/fotos (Unsplash), 6 depoimentos.
- `src/lib/prisma.ts` (singleton), `src/lib/queries.ts` (todas as consultas), `src/lib/format.ts` (preço/data/duração pt-BR), `src/lib/whatsapp.ts` (monta link wa.me).
- Componentes em `src/components/`: `site-header`, `site-footer`, `destination-search` (client, autocomplete estilo Civitatis), `package-card`, `destination-card`, `whatsapp-button`, `package-filters` (client, filtros via searchParams).
- Páginas: `src/app/page.tsx` (Home completa), `src/app/destinos/page.tsx` (todos os destinos + busca `?q=`), `src/app/destinos/[slug]/page.tsx` (pacotes do destino com filtros de categoria / mês / preço / ordenação).
- Tema em `src/app/globals.css`: brand teal (`#0f766e`), accent laranja (`#f97316`), tokens via `@theme inline`.

### Falta (próximos passos, nesta ordem)
1. **`src/app/pacotes/[slug]/page.tsx`** — página do pacote: galeria, descrição, o que está incluso / não incluso, roteiro dia a dia, datas de saída com vagas, preço, botão WhatsApp (usar `packageInquiryMessage` de `src/lib/whatsapp.ts`), pacotes relacionados (`getRelatedPackages`). Todas as queries já existem em `src/lib/queries.ts` (`getPackageBySlug`).
2. `src/app/not-found.tsx`.
3. **Rodar `npm run dev` e testar no navegador** — o servidor ainda NÃO foi iniciado nenhuma vez, então pode haver erros de compilação/tipagem a corrigir. Ver `AGENTS.md` (Next 16 tem mudanças: `params`/`searchParams` são Promise, `PageProps<'/rota'>` é helper global, `proxy.ts` no lugar de `middleware.ts`, Turbopack padrão).
4. Painel admin (`/admin`): login (tabela `User` já existe, usar bcrypt + cookie de sessão), CRUD de destinos, pacotes, datas, fotos (upload local em `public/uploads` ou similar).
5. Deploy na VPS Hostinger: Node + MariaDB + PM2 + nginx.

## Como rodar em uma máquina nova

Pré-requisitos: Node 20.9+ (usado 24 LTS), MariaDB ou MySQL rodando localmente.

```bash
git clone <repo> turismo
cd turismo
npm install
copy .env.example .env      # editar DATABASE_URL, NEXT_PUBLIC_WHATSAPP_NUMBER
```

Criar o banco (ajustar usuário/senha):

```sql
CREATE DATABASE turismo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
npm run db:migrate          # aplica migrações (prisma migrate dev)
npm run db:generate         # gera o client em src/generated/prisma
npm run db:seed             # popula com dados de exemplo
npm run dev                 # http://localhost:3000
```

Scripts em `package.json`: `dev`, `build`, `start`, `lint`, `db:migrate`, `db:generate`, `db:seed`, `db:studio`.

### Notas da instalação no PC anterior (Windows)
- Node instalado via `winget install OpenJS.NodeJS.LTS`.
- MariaDB via `winget install MariaDB.Server` com senha root `root`, serviço `MariaDB`.
- Git e GitHub CLI via winget.
- Após instalar via winget, o PATH do terminal precisa ser recarregado (ou abrir novo terminal).

## Observações técnicas importantes

- `npm install prisma@latest` puxou um RC 8.0 — **manter `prisma` e `@prisma/client` na mesma versão 7.x**.
- `prisma init` gerou `prisma7.config.ts`; foi renomeado para `prisma.config.ts`.
- Imagens remotas: `next.config.ts` libera apenas `images.unsplash.com` em `remotePatterns`. Ao subir fotos próprias, ajustar.
- `.gitignore` ignora `.env*` mas libera `.env.example`.
- Filtro de mês usa formato `YYYY-MM` no searchParam `month`; datas de saída são salvas em UTC com horário fixo de Brasília no seed.
