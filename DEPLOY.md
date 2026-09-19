# Deploy na VPS da Hostinger

Estado assumido aqui: VPS Ubuntu já contratada, **sem domínio ainda** (acesso pelo IP), build rodando na própria VPS.
Quando o domínio chegar, veja a seção [Quando o domínio chegar](#quando-o-domínio-chegar) no fim — são 5 minutos.

Arquitetura: **nginx** (porta 80) → **PM2** → **Next.js** (porta 3000, só no localhost) → **MariaDB** (local).

Substitua em todos os comandos:

| Placeholder | O que é |
|---|---|
| `IP_DA_VPS` | o IP que aparece no painel da Hostinger |
| `SENHA_DO_BANCO` | uma senha nova, longa, só pra aplicação (não reuse a de root) |
| `lohan` | o nome do usuário que você vai criar no passo 1 |

---

## 1. Entrar e criar um usuário sem privilégios

Por SSH, com o IP e a senha de root do painel:

```bash
ssh root@IP_DA_VPS
```

Rodar a aplicação como root é pedir problema. Crie um usuário e dê sudo a ele:

```bash
adduser lohan
usermod -aG sudo lohan
```

Copie sua chave SSH pra ele (se você usa chave) e reconecte:

```bash
rsync --archive --chown=lohan:lohan ~/.ssh /home/lohan
exit
ssh lohan@IP_DA_VPS
```

Daqui pra frente tudo é como `lohan`, com `sudo` onde precisar.

## 2. Pacotes base

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx mariadb-server ufw
```

Node 24 (o `apt` do Ubuntu traz uma versão velha demais — use o repositório da NodeSource):

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # deve mostrar v24.x
```

PM2 global:

```bash
sudo npm install -g pm2
```

**Se a VPS tiver 1 GB de RAM**, o `next build` morre por falta de memória. Crie swap antes de continuar:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 3. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

A porta 3000 **não** entra na lista — o Next só precisa ser alcançável pelo nginx, que está na mesma máquina.

## 4. Banco de dados

```bash
sudo mariadb-secure-installation
```

Responda: definir senha de root **sim**, remover usuários anônimos **sim**, proibir login remoto de root **sim**, remover o banco `test` **sim**.

Agora crie o banco e um usuário só pra aplicação:

```bash
sudo mariadb
```

```sql
CREATE DATABASE turismo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'turismo'@'localhost' IDENTIFIED BY 'SENHA_DO_BANCO';
GRANT ALL PRIVILEGES ON turismo.* TO 'turismo'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Em produção o app **não** usa root, ao contrário do ambiente local.

## 5. Clonar o projeto

```bash
sudo mkdir -p /var/www /var/log/turismo
sudo chown -R lohan:lohan /var/www /var/log/turismo
git clone https://github.com/kauannnb/turismo.git /var/www/turismo
cd /var/www/turismo
```

## 6. Variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Deixe assim:

```
DATABASE_URL="mysql://turismo:SENHA_DO_BANCO@localhost:3306/turismo"
NEXT_PUBLIC_WHATSAPP_NUMBER="55DDDNUMERO"
NEXT_PUBLIC_SITE_NAME="Rota Viva Turismo"
NEXT_PUBLIC_SITE_URL="http://IP_DA_VPS"
```

Duas armadilhas aqui:

- **`NEXT_PUBLIC_WHATSAPP_NUMBER` ainda é o placeholder `5511999999999`.** Se subir assim, o botão de reserva manda o cliente pra um número que não é seu. Formato: código do país + DDD + número, só dígitos (ex.: `5511987654321`).
- **Tudo que começa com `NEXT_PUBLIC_` é embutido no build, não lido em tempo de execução.** Mudou qualquer um desses? Tem que rodar `npm run build` de novo — reiniciar o PM2 sozinho não adianta.

## 7. Instalar, migrar e buildar

```bash
npm ci
npm run db:generate    # gera o client em src/generated/prisma
npm run db:deploy      # aplica as migrações (migrate deploy, não migrate dev)
npm run build
```

Se quiser subir com os dados de exemplo (8 destinos e 8 pacotes) pra ter o que mostrar enquanto o admin não existe:

```bash
npm run db:seed
```

Rode o seed **uma vez só** — ele popula do zero e você vai perder o que tiver cadastrado depois.

## 8. Subir com PM2

O `ecosystem.config.cjs` já está no repo, apontando pra `/var/www/turismo`:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup      # imprime um comando com sudo — copie, cole e execute
```

Esse `pm2 startup` é o que faz o site voltar sozinho depois de um reboot da VPS. Não pule.

Confira que respondeu localmente:

```bash
curl -I http://127.0.0.1:3000
pm2 logs turismo --lines 50
```

## 9. nginx

```bash
sudo cp /var/www/turismo/deploy/nginx-turismo.conf /etc/nginx/sites-available/turismo
sudo ln -s /etc/nginx/sites-available/turismo /etc/nginx/sites-enabled/turismo
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Testar

Abra `http://IP_DA_VPS` no navegador. Confira:

- home carrega com os destinos e as fotos;
- `/destinos` e uma página de destino com os filtros;
- uma página de pacote, e principalmente o **botão do WhatsApp**: ele tem que abrir a conversa com o **seu** número e com o link certo na mensagem.

Deu 502? O nginx está de pé mas o Next não: `pm2 logs turismo`.

---

## Atualizações depois da primeira vez

Do seu PC: commit e push normal. Na VPS:

```bash
cd /var/www/turismo && ./deploy/deploy.sh
```

O script faz `git pull`, `npm ci`, `db:generate`, `db:deploy`, `build` e `pm2 reload` — nessa ordem, parando no primeiro erro.

## Uma pegadinha pra resolver antes do admin

No build, a **home (`/`) sai como página estática** — ela é gerada uma vez, no `npm run build`, e congela. As páginas de destino e de pacote são dinâmicas (`ƒ` no relatório do build), essas leem o banco a cada acesso.

Na prática: hoje, sem admin, não muda nada. Mas no dia em que você cadastrar um pacote novo pelo painel, ele vai aparecer em `/destinos` e na página do destino, e **não** vai aparecer na home até o próximo build.

A correção é uma linha em `src/app/page.tsx` — revalidar de tempos em tempos:

```ts
export const revalidate = 300; // a home se atualiza a cada 5 min
```

Fica anotado aqui pra ser feito junto com o admin.

## Backup do banco

Vale configurar antes de ter dado real lá dentro:

```bash
mysqldump -u turismo -p turismo > ~/turismo-$(date +%F).sql
```

Coloque no cron (`crontab -e`) quando o admin estiver pronto.

## Quando o domínio chegar

1. No painel do registrador, aponte um registro **A** do domínio (e do `www`) pro `IP_DA_VPS`. Espere propagar.
2. Troque o `server_name _;` em `/etc/nginx/sites-available/turismo` pelo domínio, e `sudo systemctl reload nginx`.
3. HTTPS:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
   ```
   O certbot edita o nginx e configura a renovação automática sozinho.
4. **Atualize `NEXT_PUBLIC_SITE_URL` no `.env`** para `https://seudominio.com.br` e **rode o build de novo** (`./deploy/deploy.sh`). Sem isso, o link que vai na mensagem do WhatsApp continua apontando pro IP.
