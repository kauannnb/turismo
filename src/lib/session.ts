import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "turismo_admin";

const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 horas

export type SessionPayload = {
  userId: number;
  name: string;
};

// Resolvido sob demanda, e não no topo do módulo: se fosse no topo, um build
// sem SESSION_SECRET quebraria na hora de compilar em vez de na hora de usar.
function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou com menos de 32 caracteres. Gere um: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey());
}

export async function decryptSession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "number" || typeof payload.name !== "string") return null;
    return { userId: payload.userId, name: payload.name };
  } catch {
    // Assinatura inválida, token expirado ou adulterado — tudo vira "sem sessão".
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + MAX_AGE_MS);
  const token = await encryptSession(payload, expiresAt);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Em dev o site roda em http://localhost; um cookie Secure seria descartado
    // pelo navegador e o login nunca completaria.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return decryptSession(token);
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}
