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
const bomFiles = [];

for (const entry of readdirSync(migrationsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const file = join(migrationsDir, entry.name, "migration.sql");
  if (!existsSync(file)) continue;

  // BOM no começo do arquivo: o MariaDB recebe os bytes colados na primeira
  // instrução e responde "You have an error in your SQL syntax (1064)".
  // `Set-Content -Encoding utf8` do PowerShell 5.1 grava BOM sem avisar.
  const bytes = readFileSync(file);
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    bomFiles.push(`${entry.name}/migration.sql`);
  }

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

if (problems.length === 0 && bomFiles.length === 0) {
  console.log(
    `Migrações conferidas (${models.length} models): caixa dos nomes e codificação em ordem.`,
  );
  process.exit(0);
}

if (bomFiles.length > 0) {
  console.error("\nMigrações gravadas com BOM (o MariaDB recusa com erro 1064):\n");
  for (const f of bomFiles) console.error(`  ${f}`);
  console.error(
    "\nRegrave em UTF-8 sem BOM. No PowerShell, `Set-Content -Encoding utf8`\n" +
      "grava COM BOM; use:\n" +
      '  [System.IO.File]::WriteAllText($p, $txt, (New-Object System.Text.UTF8Encoding $false))\n',
  );
}

if (problems.length > 0) {
  console.error("\nNomes de tabela com a caixa errada nas migrações:\n");
  for (const p of problems) {
    console.error(`  ${p.file}:${p.line}  \`${p.found}\`  ->  \`${p.expected}\``);
  }
  console.error(
    "\nIsso passa no Windows e quebra no Linux da VPS. Corrija a caixa no arquivo\n" +
      ".sql antes de commitar.\n",
  );
}

console.error(
  "Se a migração já foi aplicada no banco local, apague a linha dela em\n" +
    "_prisma_migrations e rode `npm run db:deploy` de novo — alterar o arquivo\n" +
    "muda o checksum que o Prisma guarda.\n",
);
process.exit(1);
