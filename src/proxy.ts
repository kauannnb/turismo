import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decryptSession } from "@/lib/session";

/**
 * Checagem otimista: lê só o cookie, sem tocar no banco. Roda em toda
 * navegação para /admin, inclusive em prefetch, então precisa ser barata.
 *
 * A checagem forte (o usuário ainda existe?) fica no DAL, perto dos dados.
 * Aqui é só para evitar que a tela do admin chegue a renderizar para quem
 * não está logado.
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  const session = await decryptSession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isLoginPage) {
    const url = new URL("/admin/login", req.nextUrl);
    // Guarda para onde a pessoa queria ir, e volta para lá depois do login.
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
