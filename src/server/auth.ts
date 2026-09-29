import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "mercado_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const SCRYPT_KEY_LENGTH = 64;
const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedKey] = passwordHash.split(":");
  if (algorithm !== "scrypt" || !salt || !storedKey) return false;

  const storedBuffer = Buffer.from(storedKey, "hex");
  const derivedKey = (await scrypt(password, salt, storedBuffer.length)) as Buffer;
  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.$transaction([
    prisma.authSession.deleteMany({
      where: { userId, expiresAt: { lte: new Date() } },
    }),
    prisma.authSession.create({
      data: { userId, tokenHash: hashSessionToken(token), expiresAt },
    }),
  ]);

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.authSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  cookieStore.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.authSession.findFirst({
    where: {
      tokenHash: hashSessionToken(token),
      expiresAt: { gt: new Date() },
    },
    select: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          company: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return session?.user ?? null;
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
