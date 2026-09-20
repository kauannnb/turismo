import "dotenv/config";
import { createInterface } from "node:readline/promises";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

/**
 * Cria (ou atualiza a senha de) um usuário do painel.
 *
 *   npm run admin:create -- "Nome Completo" email@dominio.com
 *
 * A senha é perguntada no terminal em vez de vir por argumento, porque
 * argumento fica gravado no histórico do shell e aparece no `ps`.
 */
async function main() {
  const [name, email] = process.argv.slice(2);

  if (!name || !email) {
    console.error('Uso: npm run admin:create -- "Nome Completo" email@dominio.com');
    process.exit(1);
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`E-mail inválido: ${email}`);
    process.exit(1);
  }

  // ADMIN_PASSWORD existe para uso não interativo (scripts, CI). Prefira o
  // modo interativo: variável de ambiente é visível em /proc/<pid>/environ.
  let password = process.env.ADMIN_PASSWORD ?? "";

  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Senha (mínimo 8 caracteres): ");
    const confirm = await rl.question("Repita a senha: ");
    rl.close();

    if (password !== confirm) {
      console.error("As senhas não conferem.");
      process.exit(1);
    }
  }

  if (password.length < 8) {
    console.error("Senha curta demais. Mínimo 8 caracteres.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: { name, passwordHash },
    create: { name, email: normalizedEmail, passwordHash },
    select: { id: true, name: true, email: true },
  });

  console.log(
    existing
      ? `Senha atualizada para ${user.email} (${user.name}).`
      : `Usuário criado: ${user.email} (${user.name}). Acesse /admin/login.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
