import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Confere a caixa dos nomes de tabela nas migrações.
 *
 * Por que isto existe: o MariaDB do Windows roda com
 * `lower_case_table_names=1` e guarda os nomes em minúsculas. Quando o Prisma
 * gera uma migração comparando com esse banco, ele escreve
 * `ALTER TABLE \`destination\``. No Linux da VPS, onde os nomes são
 * case-sensitive, a tabela se chama `Destination` e a migração quebra com
 * "Table 'turismo.destination' doesn't exist" — no meio do deploy, e só lá.
 *
 * Roda automaticamente depois de `npm run db:migrate`.
 */
const prismaDir = dirname(fileURLToPath(import.meta.url));

const schema = readFileSync(join(prismaDir, "schema.prisma"), "utf8");
const models = [...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((m) => m[1]);

if (models.length === 0) {
  console.error("Nenhum model encontrado no schema.prisma — o check não vale nada assim.");
  process.exit(1);
}

const byLower = new Map(models.map((m) => [m.toLowerCase(), m]));
const migrationsDir = join(prismaDir, "migrations");

if (!existsSync(migrationsDir)) {
  console.log("Sem pasta de migrações, nada a conferir.");
  process.exit(0);
}

const problems = [];

for (const entry of readdirSync(migrationsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const file = join(migrationsDir, entry.name, "migration.sql");
  if (!existsSync(file)) continue;

  const sql = readFileSync(file, "utf8");

  sql.split("\n").forEach((line, i) => {
    // Ignora comentários, onde os nomes aparecem só como texto.
    if (line.trimStart().startsWith("--")) return;

    for (const [, ident] of line.matchAll(/`([A-Za-z_]+)`/g)) {
      const correct = byLower.get(ident.toLowerCase());
      if (correct && correct !== ident) {
        problems.push({
          file: `${entry.name}/migration.sql`,
          line: i + 1,
          found: ident,
          expected: correct,
        });
      }
    }
  });
}

if (problems.length === 0) {
  console.log(`Caixa dos nomes de tabela conferida em ${models.length} models: tudo certo.`);
  process.exit(0);
}

console.error("\nNomes de tabela com a caixa errada nas migrações:\n");
for (const p of problems) {
  console.error(`  ${p.file}:${p.line}  \`${p.found}\`  ->  \`${p.expected}\``);
}
console.error(
  "\nIsso passa no Windows e quebra no Linux da VPS. Corrija a caixa no arquivo\n" +
    ".sql antes de commitar. Se a migração já foi aplicada no banco local, apague\n" +
    "a linha dela em _prisma_migrations e rode `npm run db:deploy` de novo.\n",
);
process.exit(1);
