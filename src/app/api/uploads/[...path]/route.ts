import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname } from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { mimeForExtension, resolveUploadPath } from "@/lib/uploads";

/**
 * Entrega as imagens enviadas pelo painel. Existe porque o Next só serve o
 * conteúdo que estava em `public/` no momento do build — arquivo enviado
 * depois nunca apareceria.
 *
 * É rota pública de leitura: as imagens aparecem no site para qualquer
 * visitante, então não há verificação de sessão aqui.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/uploads/[...path]">) {
  const { path: segments } = await ctx.params;

  const file = resolveUploadPath(segments);
  if (!file) return new Response("Not found", { status: 404 });

  const mime = mimeForExtension(extname(file).slice(1));
  if (!mime) return new Response("Not found", { status: 404 });

  let info;
  try {
    info = await stat(file);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!info.isFile()) return new Response("Not found", { status: 404 });

  const stream = Readable.toWeb(createReadStream(file)) as WebReadableStream<Uint8Array>;

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(info.size),
      // O nome do arquivo é aleatório e nunca é reaproveitado, então o
      // conteúdo naquele endereço jamais muda.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
