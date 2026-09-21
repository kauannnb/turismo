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
- Rotas públicas em `src/app/(site)/`: home, `destinos/` (busca `?q=`), `destinos/[slug]` (filtros de categoria / mês / preço / ordenação) e `pacotes/[slug]` (galeria, incluso/não incluso, roteiro em timeline, datas com vagas, depoimentos, relacionados e card sticky com WhatsApp).
- O route group `(site)` existe para que `/admin` **não** herde cabeçalho e rodapé do site: o layout raiz é mínimo e a moldura pública vive em `(site)/layout.tsx`.
- `src/app/not-found.tsx` (404 com atalhos para `/destinos` e `/`). Traz header/footer por conta própria, já que o layout raiz não tem.
- **Painel em `/admin`** (2026-09-20): login com bcrypt + sessão JWT assinada em cookie HttpOnly (`jose`), `src/proxy.ts` para a checagem otimista e `src/lib/dal.ts` para a verificação forte. CRUD de destinos e pacotes, galeria, datas de saída com vagas. Primeiro usuário: `npm run admin:create -- "Nome" email@dominio.com`.
- **19 destinos**: os 8 originais + 11 do litoral SP, Paraty e Fernando de Noronha (`npm run db:seed:litoral`, idempotente).
- **Design**: teal profundo + terracota sobre neutros quentes, títulos em **Playfair Display** e corpo em **Inter**. Tokens em `src/app/globals.css`, com os utilitários `container-page` e `eyebrow`. O painel usa `.admin-chrome`, que devolve os títulos para a sans.
- **Upload de imagens** (2026-09-21): arquivos gravados em `<projeto>/uploads/<ano>/<mês>/<aleatório>.<ext>` e servidos por `/api/uploads/[...path]`. Validação por bytes iniciais (não pela extensão nem pelo `type` enviado), limite de 8 MB, e caminho conferido contra escape de pasta. `UPLOAD_DIR` muda a pasta.
- **Campos opcionais** (2026-09-21): destino exige só nome e estado; pacote, só título e destino. O slug é gerado do nome, com sufixo numérico quando já existe. Tudo que é opcional tem tratamento de ausência nas páginas públicas — capa vira `<CoverImage>` com fundo neutro, preço vira "Sob consulta", e blocos sem conteúdo não renderizam.
- **Verificado de fato**: `tsc --noEmit`, `eslint` e `npm run build` passam; todas as rotas respondem 200 em dev e em produção; o layout foi conferido por captura headless, não só por status HTTP.

### No ar desde 2026-09-20

**https://147-93-95-29.nip.io** — VPS Hostinger (Ubuntu 26.04, 2 vCPU / 8 GB), nginx + PM2 + MariaDB 11.8, HTTPS via Let's Encrypt. O passo a passo completo e o histórico do que deu errado estão em [`DEPLOY.md`](DEPLOY.md).

Para publicar uma alteração: `git push` daqui, depois `cd /var/www/turismo && ./deploy/deploy.sh` na VPS (usuário `madruga`).

O `nip.io` é um domínio temporário — resolve o IP embutido no próprio nome e permite certificado HTTPS, que IP puro não permite. Trocar pelo domínio definitivo quando houver (Parte 14 do `DEPLOY.md`).

### Falta (próximos passos, nesta ordem)

1. **Subir o painel para a VPS.** Ainda não foi. Exige `SESSION_SECRET` no `.env` de lá, `deploy.sh`, `db:seed:litoral` e `admin:create` — passo a passo na **Parte 16 do [`DEPLOY.md`](DEPLOY.md)**.
2. **Pacotes para os 11 destinos novos.** Eles estão no ar mostrando "0 pacotes", porque só os 8 destinos originais têm pacote. Cadastrar pelo painel.
3. **Upload de fotos.** Hoje as imagens entram por URL, e só de `images.unsplash.com` ou `upload.wikimedia.org`. Upload de arquivo exige um route handler servindo os arquivos (`public/` no Next só serve o que existia no build) — ou um `location /uploads/` no nginx.
4. **Conteúdo real:** textos institucionais do rodapé, Cadastur/CNPJ e fotos próprias. As fotos atuais são do Wikimedia (licenças CC, pedem atribuição) e do Unsplash — são provisórias.
5. Duas fotos do seed original não batem com o destino (Gramado mostra um churrasco, Foz do Iguaçu mostra o Rio). Trocar pelo painel.
6. SEO / Google: só depois do domínio definitivo e do conteúdo real, senão indexa os dados de exemplo. Parte 15 do `DEPLOY.md`.

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

Scripts em `package.json`: `dev`, `build`, `start`, `lint`, `db:migrate`, `db:deploy`, `db:generate`, `db:seed`, `db:seed:litoral`, `db:studio`, `admin:create`.

O `.env` precisa de `SESSION_SECRET` (mínimo 32 caracteres) além das quatro variáveis antigas, senão o `/admin` quebra. Gere com:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### Notas da instalação em Windows do zero
- `winget install Git.Git OpenJS.NodeJS.LTS GitHub.cli` — instalam sem segredo.
- MariaDB: **fixar a versão LTS**, `winget install MariaDB.Server -v 11.8.2.0`. A rolling mais nova (13.0.2) falha com `MSI 1603`. Passar as opções pelo `--override`: `"/quiet PASSWORD=root SERVICENAME=MariaDB PORT=3306 UTF8=1"`, e rodar o terminal **como administrador** (sem elevação o MSI também morre em 1603).
- Após instalar via winget, o PATH do terminal precisa ser recarregado (ou abrir novo terminal).
- Senha root do banco usada em dev: `root` → `DATABASE_URL="mysql://root:root@localhost:3306/turismo"`.
- Cliente de linha de comando do MariaDB: `C:\Program Files\MariaDB 11.8\bin\mariadb.exe` (não se chama mais `mysql.exe`).

## Observações técnicas importantes

- `npm install prisma@latest` puxou um RC 8.0 — **manter `prisma` e `@prisma/client` na mesma versão 7.x**.
- `prisma init` gerou `prisma7.config.ts`; foi renomeado para `prisma.config.ts`.
- Imagens remotas: `next.config.ts` libera `images.unsplash.com` e `upload.wikimedia.org`. **Essa lista é duplicada em `ALLOWED_IMAGE_HOSTS` (`src/lib/form.ts`)**, que valida o que se digita no painel — mexeu num, mexa no outro, senão a URL passa no formulário e o `next/image` recusa depois.
- Unsplash tem proteção anti-bot: não dá para descobrir IDs de foto raspando o site. As fotos dos destinos novos vieram da API da Wikipédia (`pt.wikipedia.org/w/api.php`, `prop=pageimages`), que funciona sem chave.
- Colunas de URL são `VarChar(500)`: o padrão do Prisma seria 191, e as URLs de thumb do Wikimedia passam disso (erro `P2000 LengthMismatch`).
- **Caixa dos nomes de tabela entre Windows e Linux.** O MariaDB do Windows roda com `lower_case_table_names=1` e guarda as tabelas em minúsculas; o do Linux é case-sensitive e lá elas são `Destination`, `Package`, etc. O Prisma gera a migração no padrão do banco local, então uma migração criada no Windows sai com `ALTER TABLE \`destination\``, passa aqui e **quebra na VPS** com `Table 'turismo.destination' doesn't exist`. Por isso `npm run db:migrate` encadeia `npm run db:check` (`prisma/check-migrations.mjs`), que compara a caixa de cada identificador com os models do schema e falha antes do commit. Não remova esse passo.
- `.gitignore` ignora `.env*` mas libera `.env.example`.
- Filtro de mês usa formato `YYYY-MM` no searchParam `month`; datas de saída são salvas em UTC com horário fixo de Brasília no seed.
- **npm 11+ bloqueia install scripts.** No primeiro `npm install` os postinstall de `@prisma/engines`, `esbuild`, `prisma` e `unrs-resolver` não rodam, e sem eles o Prisma e o `tsx` quebram. Já existe um bloco `allowScripts` no `package.json` cobrindo os quatro; se aparecer o aviso de novo, `npm approve-scripts <pkg>` seguido de `npm rebuild`.
- **`lucide-react` v1 removeu os ícones de marca** (`Facebook`, `Instagram`) — quebra o build inteiro, porque o `site-footer` entra no layout raiz. Os dois foram redesenhados como SVG inline dentro de `src/components/site-footer.tsx`. Não volte a importá-los do lucide.
- Os campos `included`, `notIncluded` e `itinerary` são `Json` no Prisma, ou seja, chegam como `unknown` no TypeScript. A página do pacote valida o formato em `asStringList` / `asItinerary` antes de renderizar — reaproveitar isso no admin.
- `getRelatedPackages` filtra por `destinationId` e exclui o pacote atual; com o seed atual (1 pacote por destino) o resultado é sempre vazio.
- **`packageCardSelect` é função, não constante.** Como constante, o `new Date()` do filtro de saídas futuras seria avaliado uma vez só, quando o módulo carrega — e sob PM2 o processo fica dias no ar anunciando datas vencidas. Mesmo motivo do `revalidate = 300` na home, que é estática.
- Datas de saída são gravadas **ao meio-dia UTC**. Meia-noite UTC apareceria como o dia anterior em `America/Sao_Paulo`, que é o fuso usado na formatação.
- O ESLint aplica as regras de pureza do React: `Date.now()` dentro de um componente é **erro**, não aviso. Resolva na camada de dados (veja `listDeparturesGrouped` em `src/lib/admin-queries.ts`) e passe booleanos prontos para o componente.
- Num arquivo `"use server"`, **todo export vira Server Action** e precisa ser `async`. Funções puras auxiliares vão para `src/lib/`.
- O cookie de sessão é `Secure` quando `NODE_ENV=production`: em produção o login só funciona por HTTPS. Em dev fica sem `Secure`, senão o navegador descartaria o cookie em `http://localhost`.
- **Uploads não podem ficar em `public/`**: o Next só serve o que estava lá no momento do build, então arquivo enviado depois nunca apareceria. Daí a rota `/api/uploads/[...path]`. A pasta `uploads/` é ignorada pelo git e sobrevive ao `deploy.sh`, que só faz `git pull`.
- Em `src/lib/uploads.ts` os `path.resolve` levam `/* turbopackIgnore: true */`. Sem isso o Turbopack considera o caminho dinâmico demais, rastreia o projeto inteiro e empacota todo o código-fonte junto com o servidor.
- **Apagar um destino ou pacote não apaga os arquivos enviados.** Eles ficam órfãos em `uploads/`. Não incomoda no volume atual; se virar problema, fazer uma rotina de limpeza que confira antes se a URL ainda é referenciada em `Destination.coverImage`, `Package.coverImage` ou `PackageImage.url`.
- Campo `Json` anulável no Prisma não aceita `null` direto — seria ambíguo com o valor JSON `null`. Use `Prisma.DbNull` (veja `jsonOuNulo` em `pacotes/actions.ts`).
- `spotsTotal = 0` significa **vagas ainda não definidas**, não esgotado. Painel e site tratam os dois casos de forma diferente; esgotado é só quando havia vagas e acabaram.
