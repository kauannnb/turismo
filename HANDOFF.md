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
- `src/app/pacotes/[slug]/page.tsx` — página do pacote: hero com breadcrumb, galeria, descrição, incluso / não incluso, roteiro dia a dia (timeline), datas de saída com vagas e preço por data, depoimentos, pacotes relacionados e card lateral sticky com o botão WhatsApp.
- `src/app/not-found.tsx` (404 com atalhos para `/destinos` e `/`).
- Tema em `src/app/globals.css`: brand teal (`#0f766e`), accent laranja (`#f97316`), tokens via `@theme inline`.
- **Projeto já roda de verdade** (2026-09-19): `npm run dev` sobe limpo, todas as rotas respondem 200, 404 funciona, `tsc --noEmit` e `eslint` passam sem erro.

### Falta (próximos passos, nesta ordem)
1. Painel admin (`/admin`): login (tabela `User` já existe, usar bcrypt + cookie de sessão), CRUD de destinos, pacotes, datas, fotos (upload local em `public/uploads` ou similar).
2. Conteúdo real: trocar `NEXT_PUBLIC_WHATSAPP_NUMBER` (hoje é o placeholder `5511999999999`), textos institucionais do rodapé, Cadastur/CNPJ e fotos próprias no lugar das do Unsplash.
3. Mais de um pacote por destino no seed — hoje é 1 por destino, então o bloco "Outros pacotes para…" nunca aparece com os dados de exemplo (o bloco em si já foi testado e funciona).
4. Deploy na VPS Hostinger: Node + MariaDB + PM2 + nginx. Definir `NEXT_PUBLIC_SITE_URL` com o domínio real — ele é usado no link que vai na mensagem do WhatsApp.

## Como rodar em uma máquina nova

Pré-requisitos: Node 20.9+ (usado 24 LTS), MariaDB ou MySQL rodando localmente.

```bash
git clone <repo> turismo
cd turismo
npm install
copy .env.example .env      # editar DATABASE_URL, NEXT_PUBLIC_WHATSAPP_NUMBER, NEXT_PUBLIC_SITE_URL
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

### Notas da instalação em Windows do zero
- `winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli` — instalam sem segredo.
- MariaDB: **fixar a versão LTS**, `winget install MariaDB.Server -v 11.8.2.0`. A rolling mais nova (13.0.2) falha com `MSI 1603`. Passar as opções pelo `--override`: `"/quiet PASSWORD=root SERVICENAME=MariaDB PORT=3306 UTF8=1"`, e rodar o terminal **como administrador** (sem elevação o MSI também morre em 1603).
- Após instalar via winget, o PATH do terminal precisa ser recarregado (ou abrir novo terminal).
- Senha root do banco usada em dev: `root` → `DATABASE_URL="mysql://root:root@localhost:3306/turismo"`.
- Cliente de linha de comando do MariaDB: `C:\Program Files\MariaDB 11.8\bin\mariadb.exe` (não se chama mais `mysql.exe`).

## Observações técnicas importantes

- `npm install prisma@latest` puxou um RC 8.0 — **manter `prisma` e `@prisma/client` na mesma versão 7.x**.
- `prisma init` gerou `prisma7.config.ts`; foi renomeado para `prisma.config.ts`.
- Imagens remotas: `next.config.ts` libera apenas `images.unsplash.com` em `remotePatterns`. Ao subir fotos próprias, ajustar.
- `.gitignore` ignora `.env*` mas libera `.env.example`.
- Filtro de mês usa formato `YYYY-MM` no searchParam `month`; datas de saída são salvas em UTC com horário fixo de Brasília no seed.
- **npm 11+ bloqueia install scripts.** No primeiro `npm install` os postinstall de `@prisma/engines`, `esbuild`, `prisma` e `unrs-resolver` não rodam, e sem eles o Prisma e o `tsx` quebram. Já existe um bloco `allowScripts` no `package.json` cobrindo os quatro; se aparecer o aviso de novo, `npm approve-scripts <pkg>` seguido de `npm rebuild`.
- **`lucide-react` v1 removeu os ícones de marca** (`Facebook`, `Instagram`) — quebra o build inteiro, porque o `site-footer` entra no layout raiz. Os dois foram redesenhados como SVG inline dentro de `src/components/site-footer.tsx`. Não volte a importá-los do lucide.
- Os campos `included`, `notIncluded` e `itinerary` são `Json` no Prisma, ou seja, chegam como `unknown` no TypeScript. A página do pacote valida o formato em `asStringList` / `asItinerary` antes de renderizar — reaproveitar isso no admin.
- `getRelatedPackages` filtra por `destinationId` e exclui o pacote atual; com o seed atual (1 pacote por destino) o resultado é sempre vazio.
