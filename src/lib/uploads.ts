import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Upload de imagens gravadas em disco.
 *
 * Por que não em `public/`: o Next só serve o que existia em `public/` no
 * momento do build. Arquivo enviado depois simplesmente não seria encontrado
 * em produção. Por isso os arquivos vão para uma pasta fora do build e são
 * entregues pela rota `/api/uploads/[...path]`.
 *
 * A pasta precisa sobreviver aos deploys — `deploy.sh` faz `git pull`, não
 * apaga nada, então `<projeto>/uploads` serve. Em outro servidor, aponte
 * UPLOAD_DIR para um volume persistente.
 */

export const UPLOAD_URL_PREFIX = "/api/uploads/";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function uploadRoot() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

type Kind = { ext: string; mime: string; matches: (b: Uint8Array) => boolean };

function ascii(bytes: Uint8Array, start: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    if (bytes[start + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

/**
 * A checagem é pelos bytes iniciais, não pelo `type` do File nem pela
 * extensão: os dois vêm do cliente e podem mentir. Um .exe renomeado para
 * .jpg não passa daqui.
 */
const KINDS: Kind[] = [
  { ext: "jpg", mime: "image/jpeg", matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: "png",
    mime: "image/png",
    matches: (b) => b[0] === 0x89 && ascii(b, 1, "PNG") && b[4] === 0x0d && b[5] === 0x0a,
  },
  { ext: "gif", mime: "image/gif", matches: (b) => ascii(b, 0, "GIF8") },
  { ext: "webp", mime: "image/webp", matches: (b) => ascii(b, 0, "RIFF") && ascii(b, 8, "WEBP") },
  { ext: "avif", mime: "image/avif", matches: (b) => ascii(b, 4, "ftypavif") },
];

export function mimeForExtension(ext: string) {
  return KINDS.find((k) => k.ext === ext.toLowerCase())?.mime;
}

export type SaveResult = { url: string } | { error: string };

export async function saveUpload(file: File): Promise<SaveResult> {
  if (file.size === 0) return { error: "Arquivo vazio." };
  if (file.size > MAX_BYTES) {
    return { error: `Imagem acima de ${MAX_BYTES / 1024 / 1024} MB.` };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = KINDS.find((k) => k.matches(bytes));
  if (!kind) {
    return { error: "Formato não reconhecido. Use JPG, PNG, WebP, GIF ou AVIF." };
  }

  // Agrupar por ano/mês evita uma pasta única com milhares de arquivos.
  const now = new Date();
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const name = `${randomBytes(16).toString("hex")}.${kind.ext}`;

  const dir = path.join(uploadRoot(), folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);

  return { url: `${UPLOAD_URL_PREFIX}${folder}/${name}` };
}

/** Caminho em disco a partir dos segmentos da URL, barrando escapes de pasta. */
export function resolveUploadPath(segments: string[]) {
  const root = uploadRoot();

  // Os `turbopackIgnore` abaixo são deliberados. Sem eles o Turbopack conclui
  // que o caminho é dinâmico demais para analisar e passa a rastrear o projeto
  // inteiro, empacotando todo o código-fonte junto com o servidor. A pasta é
  // configurável por ambiente de propósito, então não há como torná-la
  // estática — e nada aqui é importado, só lido em tempo de execução.
  const target = path.resolve(/* turbopackIgnore: true */ root, ...segments);
  const rootResolved = path.resolve(/* turbopackIgnore: true */ root);

  // `..` nos segmentos sairia da pasta de uploads e exporia o disco inteiro.
  if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) return null;
  return target;
}

export function isUploadUrl(value: string) {
  return value.startsWith(UPLOAD_URL_PREFIX);
}

/**
 * Lê um campo de imagem do formulário, no contrato que o `<ImageField>` usa:
 *
 *   <nome>        arquivo novo, se a pessoa escolheu um
 *   <nome>Atual   URL que já estava salva
 *   <nome>Remover "1" quando ela clicou em remover
 *
 * Devolve a URL a gravar, ou null quando não há imagem.
 */
export async function resolveImageField(
  formData: FormData,
  name: string,
): Promise<{ value: string | null } | { error: string }> {
  if (formData.get(`${name}Remover`) === "1") return { value: null };

  const file = formData.get(name);
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    return "error" in saved ? saved : { value: saved.url };
  }

  const current = String(formData.get(`${name}Atual`) ?? "").trim();
  return { value: current || null };
}
