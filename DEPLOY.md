# Colocando o site no ar — VPS da Hostinger, passo a passo

Guia escrito pra quem **nunca mexeu com VPS**. Cada passo diz o que você digita, o que deve acontecer, e o que fazer se não acontecer.

Estado assumido: VPS já contratada na Hostinger, **sem domínio ainda** (o site vai ser acessado pelo IP). Quando comprar o domínio, a [última seção](#parte-13--quando-você-comprar-o-domínio) resolve em 5 minutos.

Tempo estimado: **1 a 2 horas** na primeira vez. Depois disso, atualizar o site é um comando só.

---

## O que é cada peça

Antes de sair digitando, vale saber o que você está montando. São quatro programas conversando entre si na mesma máquina:

| Peça | O que faz | Analogia |
|---|---|---|
| **nginx** | Recebe as visitas da internet na porta 80 e repassa pro Next | A portaria do prédio |
| **PM2** | Mantém o Next ligado, reinicia se cair, religa depois de reboot | O zelador |
| **Next.js** | O site em si, rodando na porta 3000 | O apartamento |
| **MariaDB** | Guarda destinos, pacotes e datas | O arquivo do prédio |

A porta 3000 fica **fechada pra internet** de propósito. Só o nginx, que está dentro da mesma máquina, fala com ela. Quem vem de fora bate na porta 80 e o nginx decide o que fazer.

**Um aviso que vale pra tudo aqui:** você vai colar comandos num terminal com poder de administrador. Leia antes de colar. Se um comando não fizer sentido, pergunte antes de rodar — desfazer na VPS é bem mais chato do que desfazer no seu PC.

---

## Antes de começar, tenha isso anotado

Abra um bloco de notas e deixe estes valores à mão. Você vai usá-los várias vezes:

| Anote | Onde encontra |
|---|---|
| **IP da VPS** | Painel da Hostinger → VPS → visão geral. Algo como `203.0.113.45` |
| **Senha de root** | Você define na criação da VPS (Parte 1) |
| **Senha do seu usuário** | Você inventa na Parte 3 |
| **Senha do banco** | Você inventa na Parte 6. Longa, e **diferente** das outras |

Ao longo do guia, troque:

- `IP_DA_VPS` → o IP real
- `SENHA_DO_BANCO` → a senha que você criou pro banco
- `lohan` → o nome de usuário que você quiser (pode manter `lohan`)

---

## Parte 1 — Criar a VPS no painel da Hostinger

Se a VPS ainda não foi configurada (aparece como "Em configuração" ou pede pra escolher um sistema):

1. Entre em [hpanel.hostinger.com](https://hpanel.hostinger.com) → menu **VPS** → sua VPS.
2. Em **sistema operacional**, escolha **Ubuntu 24.04 LTS** (só o Ubuntu limpo — **não** escolha painéis como CyberPanel, Plesk ou CloudPanel, eles instalam um monte de coisa que vai brigar com o nosso nginx).
3. Defina a **senha de root**. Anote.
4. Espere terminar de provisionar (uns minutos) e anote o **IP**.

> **Quanta RAM tem seu plano?** Se for **1 GB**, o build do Next não cabe na memória e falha. Tem solução (swap), está na Parte 4. Se for 2 GB ou mais, relaxa.

## Parte 2 — Conectar na VPS pela primeira vez

Aqui no seu PC, abra o **PowerShell** (tecla Windows, digite "PowerShell", Enter) e:

```powershell
ssh root@IP_DA_VPS
```

Na primeira conexão aparece isto:

```
The authenticity of host '203.0.113.45' can't be established.
ED25519 key fingerprint is SHA256:xxxxx...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Digite **`yes`** e Enter. Isso só aparece uma vez — é o seu PC memorizando a identidade do servidor.

Depois ele pede a senha de root. **Atenção:** ao digitar senha no terminal Linux, **não aparece nada na tela** — nem asteriscos, nem bolinhas. Parece que não está funcionando, mas está. Digite e dê Enter.

Deu certo se o prompt virar algo como `root@srv123456:~#`.

> **Dica:** pra colar no terminal do PowerShell, use **botão direito do mouse** ou `Ctrl+Shift+V`. `Ctrl+V` nem sempre funciona.

> **Alternativa:** se o SSH não conectar, o painel da Hostinger tem um **Terminal do navegador** que já entra logado. Funciona igual, é só mais desconfortável pra colar textos longos.

## Parte 3 — Criar um usuário (não trabalhe como root)

`root` pode tudo, inclusive destruir o sistema com um comando errado. Boa prática é ter um usuário normal e pedir permissão quando precisar. Ainda como root:

```bash
adduser lohan
```

Ele vai pedir uma senha (duas vezes) e depois nome completo, telefone etc. — **pode deixar tudo em branco** dando Enter, e confirmar com `Y` no fim.

Agora dê a esse usuário o direito de usar `sudo` (que é o "só desta vez, como administrador"):

```bash
usermod -aG sudo lohan
```

Saia e entre de novo, agora como o novo usuário:

```bash
exit
```

```powershell
ssh lohan@IP_DA_VPS
```

O prompt agora deve ser `lohan@srv123456:~$` — repare que o `#` do root virou `$`.

**Daqui pra frente, todos os comandos são como `lohan`.** Quando um comando começa com `sudo`, o terminal vai pedir **a senha do lohan** (não a de root). Ele pede uma vez e guarda por alguns minutos.

## Parte 4 — Instalar os programas

Primeiro, atualizar a lista de pacotes e o que já está instalado:

```bash
sudo apt update && sudo apt upgrade -y
```

Isso demora uns minutos e cospe muito texto — normal. Se aparecer uma tela roxa perguntando sobre reiniciar serviços, é só apertar Enter em **`<Ok>`**.

Agora os programas:

```bash
sudo apt install -y git nginx mariadb-server ufw curl
```

O Node que vem no Ubuntu é velho demais pro Next 16, então instalamos da fonte oficial:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
```

Confira:

```bash
node -v
```

Tem que aparecer **`v24.x.x`**. Se aparecer v18 ou v20, o repositório não foi adicionado — repita os dois comandos acima.

E o PM2:

```bash
sudo npm install -g pm2
```

### Se a sua VPS tem 1 GB de RAM, faça isto agora

O `next build` consome bastante memória e o processo é morto no meio (você veria um erro seco, tipo `Killed`). Swap é memória emprestada do disco — mais lenta, mas resolve:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Confira com `free -h` — a linha `Swap:` deve mostrar 2,0Gi.

## Parte 5 — Fechar o servidor com firewall

Por padrão a VPS está com tudo aberto. Vamos deixar passar só o que precisa:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Ele avisa `Command may disrupt existing ssh connections. Proceed with operation (y|n)?` — responda **`y`**. O SSH já foi liberado na linha anterior, então sua conexão não cai.

```bash
sudo ufw status
```

Deve listar `OpenSSH` e `Nginx Full` como `ALLOW`.

> Repare que a porta 3000 **não** está liberada, e é proposital: o Next só precisa ser alcançado pelo nginx, que está na mesma máquina.

## Parte 6 — Preparar o banco de dados

```bash
sudo mariadb-secure-installation
```

Ele faz uma sequência de perguntas. Responda assim:

| Pergunta | Resposta |
|---|---|
| `Enter current password for root (enter for none)` | só **Enter** (ainda não tem) |
| `Switch to unix_socket authentication [Y/n]` | **`n`** |
| `Change the root password? [Y/n]` | **`Y`**, e defina uma senha (anote) |
| `Remove anonymous users?` | **`Y`** |
| `Disallow root login remotely?` | **`Y`** |
| `Remove test database and access to it?` | **`Y`** |
| `Reload privilege tables now?` | **`Y`** |

Agora crie o banco do projeto e um usuário **só pra ele** — a aplicação nunca deve usar root:

```bash
sudo mariadb
```

O prompt vira `MariaDB [(none)]>`. Cole as quatro linhas abaixo (trocando `SENHA_DO_BANCO`), uma de cada vez ou todas juntas:

```sql
CREATE DATABASE turismo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'turismo'@'localhost' IDENTIFIED BY 'SENHA_DO_BANCO';
GRANT ALL PRIVILEGES ON turismo.* TO 'turismo'@'localhost';
FLUSH PRIVILEGES;
```

Cada uma deve responder `Query OK`. Para sair:

```sql
EXIT;
```

> **Cuidado com a senha do banco:** ela vai dentro de uma URL no `.env`. Se tiver `@`, `:`, `/`, `#` ou `?`, quebra a URL. Use letras, números, `-` e `_` e você não terá dor de cabeça.

## Parte 7 — Baixar o projeto

```bash
sudo mkdir -p /var/www /var/log/turismo
sudo chown -R lohan:lohan /var/www /var/log/turismo
git clone https://github.com/kauannnb/turismo.git /var/www/turismo
cd /var/www/turismo
```

`/var/www` é o lugar convencional de sites em servidores Linux. O `chown` passa a pasta pro seu usuário, pra você não precisar de `sudo` toda hora.

> Se o `git clone` pedir usuário e senha, é porque o repositório está privado. Ou deixe público no GitHub, ou gere um token de acesso — me chame que eu te passo o caminho.

## Parte 8 — Configurar as variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

O `nano` é um editor de texto dentro do terminal. Setinhas pra navegar, digitar normal. **Não use o mouse pra posicionar o cursor, não funciona.**

Deixe o arquivo assim (trocando o que está em maiúsculas):

```
DATABASE_URL="mysql://turismo:SENHA_DO_BANCO@localhost:3306/turismo"
NEXT_PUBLIC_WHATSAPP_NUMBER="5511987654321"
NEXT_PUBLIC_SITE_NAME="Rota Viva Turismo"
NEXT_PUBLIC_SITE_URL="http://IP_DA_VPS"
```

**Pra salvar e sair do nano:** `Ctrl+O` → Enter (salva) → `Ctrl+X` (sai).

Duas coisas críticas neste arquivo:

1. **O número do WhatsApp.** O valor que está no repo (`5511999999999`) é inventado. Se subir assim, **todo botão de reserva do site manda o cliente pra um número que não é seu.** Formato: 55 + DDD + número, só dígitos, sem espaço, traço ou parênteses.
2. **Tudo que começa com `NEXT_PUBLIC_` é gravado dentro do site no momento do build.** Não é lido enquanto o site roda. Ou seja: mudou qualquer um desses depois, tem que buildar de novo. Reiniciar o PM2 não adianta.

## Parte 9 — Instalar, migrar e construir o site

Quatro comandos, nesta ordem:

```bash
npm ci
```
Instala as dependências exatamente como no `package-lock.json`. Demora alguns minutos.

```bash
npm run db:generate
```
Gera o cliente do Prisma (o código que conversa com o banco). É rápido.

```bash
npm run db:deploy
```
Cria as tabelas no banco. Deve terminar com `All migrations have been successfully applied`.

```bash
npm run build
```
Constrói a versão otimizada. **É o passo mais demorado** (2 a 5 minutos numa VPS modesta) e o mais propenso a falhar por falta de memória. No fim ele imprime uma tabelinha com as rotas do site.

Se quiser subir já com os dados de exemplo (8 destinos, 8 pacotes, fotos e depoimentos) pra ter o que mostrar enquanto o painel admin não existe:

```bash
npm run db:seed
```

> **Rode o seed uma vez só.** Ele repovoa o banco do zero — se você rodar depois de ter cadastrado coisas de verdade, perde o que cadastrou.

## Parte 10 — Deixar o site rodando com PM2

Se você rodasse `npm start` direto, o site morreria assim que você fechasse o SSH. O PM2 resolve isso:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Agora o passo que quase todo mundo esquece — fazer o site voltar sozinho depois de um reboot da VPS:

```bash
pm2 startup
```

Esse comando **não faz nada sozinho**: ele imprime outro comando, grandão, começando com `sudo env PATH=...`. **Copie a linha que ele imprimiu, cole e execute.** Só aí a inicialização automática fica configurada.

Confira se está de pé:

```bash
pm2 status
curl -I http://127.0.0.1:3000
```

O `pm2 status` deve mostrar `turismo` com status **`online`**. O `curl` deve responder `HTTP/1.1 200 OK`.

Se o status for `errored` ou ficar reiniciando sem parar:

```bash
pm2 logs turismo --lines 50
```

## Parte 11 — Colocar o nginx na frente

```bash
sudo cp /var/www/turismo/deploy/nginx-turismo.conf /etc/nginx/sites-available/turismo
sudo ln -s /etc/nginx/sites-available/turismo /etc/nginx/sites-enabled/turismo
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

O `nginx -t` testa a configuração antes de aplicar. Tem que dizer `syntax is ok` e `test is successful`. **Se der erro, não siga adiante** — o erro diz o arquivo e a linha.

```bash
sudo systemctl reload nginx
```

## Parte 12 — Testar de verdade

Abra `http://IP_DA_VPS` no navegador do seu PC (com `http://`, não `https://` — ainda não tem certificado).

Confira, nesta ordem:

- [ ] A home carrega, com as fotos dos destinos aparecendo
- [ ] A busca de destino no topo funciona
- [ ] `/destinos` lista os 8 destinos
- [ ] Clicar num destino abre a lista de pacotes, e os filtros respondem
- [ ] Clicar num pacote abre a página com roteiro e datas de saída
- [ ] **O botão verde do WhatsApp abre a conversa com o SEU número**, e a mensagem já vem escrita com o nome do pacote e o link

O último item é o que realmente importa — é ele que gera cliente.

---

## Como atualizar o site depois

Essa é a parte boa: a partir de agora é um comando.

No seu PC, você programa, commita e dá `git push`. Na VPS:

```bash
cd /var/www/turismo
./deploy/deploy.sh
```

O script faz tudo na ordem certa (`git pull` → `npm ci` → gerar cliente → migrar banco → build → recarregar o PM2) e para no primeiro erro, sem deixar o site num estado quebrado pela metade.

## Quando der problema

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| **502 Bad Gateway** | nginx está de pé, Next caiu | `pm2 logs turismo --lines 50` |
| **Site não abre, nem erro** | firewall ou nginx parado | `sudo ufw status` e `sudo systemctl status nginx` |
| **`next build` morre com `Killed`** | acabou a memória | criar o swap (fim da Parte 4) |
| **Erro de conexão com o banco** | senha errada no `.env` ou caractere especial quebrando a URL | conferir `DATABASE_URL`; testar com `mariadb -u turismo -p turismo` |
| **Botão do WhatsApp com número errado** | `.env` não atualizado, ou atualizado sem rebuild | corrigir o `.env` e rodar `./deploy/deploy.sh` |
| **Mudei o `.env` e nada mudou no site** | `NEXT_PUBLIC_*` é embutido no build | rodar o build de novo |
| **Site sumiu depois de reiniciar a VPS** | faltou o `pm2 startup` | refazer a Parte 10 |

## Comandos do dia a dia

```bash
pm2 status              # o site está no ar?
pm2 logs turismo        # ver o que está acontecendo (Ctrl+C pra sair)
pm2 restart turismo     # reiniciar o site
sudo systemctl status nginx
free -h                 # quanta memória sobrou
df -h                   # quanto disco sobrou
```

## Backup do banco

Vale começar antes de ter dado real lá dentro:

```bash
mysqldump -u turismo -p turismo > ~/turismo-$(date +%F).sql
```

Isso gera um arquivo com a data no nome. Quando o admin estiver pronto e você tiver cadastros de verdade, colocamos isso num agendamento automático.

---

## Uma pegadinha pra resolver junto com o admin

No build, a **home (`/`) sai como página estática** — ela é gerada uma vez, no `npm run build`, e congela. As páginas de destino e de pacote são dinâmicas: leem o banco a cada acesso.

Hoje, sem admin, isso não muda nada. Mas no dia em que você cadastrar um pacote pelo painel, ele vai aparecer em `/destinos` e **não** na home, até o próximo build.

A correção é uma linha em `src/app/page.tsx`:

```ts
export const revalidate = 300; // a home se atualiza a cada 5 min
```

## Parte 13 — Quando você comprar o domínio

1. No painel de quem vendeu o domínio, crie dois registros **A** apontando pro `IP_DA_VPS`: um para `@` (o domínio puro) e outro para `www`. A propagação leva de minutos a algumas horas.
2. Na VPS, edite a configuração do nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/turismo
   ```
   Troque `server_name _;` por `server_name seudominio.com.br www.seudominio.com.br;`, salve (`Ctrl+O`, Enter, `Ctrl+X`) e recarregue:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. Instale o certificado HTTPS (é grátis e renova sozinho):
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
   ```
   Ele pergunta um e-mail, pede aceite dos termos, e oferece redirecionar HTTP → HTTPS: **aceite**.
4. **Atualize o `.env`** com `NEXT_PUBLIC_SITE_URL="https://seudominio.com.br"` e rode `./deploy/deploy.sh`. Sem esse rebuild, o link que vai na mensagem do WhatsApp continua apontando pro IP antigo.
