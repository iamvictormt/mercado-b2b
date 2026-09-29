import "server-only";

import { getCurrentUser, isSameOrigin } from "@/server/auth";

export function apiError(message: string, status: number, details?: unknown) {
  return Response.json(details === undefined ? { error: message } : { error: message, details }, {
    status,
  });
}

export function validateMutationOrigin(request: Request) {
  return isSameOrigin(request) ? null : apiError("Origem da requisição inválida.", 403);
}

export async function requireApiUser(role?: "ADMIN" | "CUSTOMER") {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false as const, response: apiError("Autenticação necessária.", 401) };
  }

  if (role && user.role !== role) {
    return { ok: false as const, response: apiError("Não tem permissão para esta operação.", 403) };
  }

  return { ok: true as const, user };
}

export function paginationFrom(url: URL, defaultPageSize = 24) {
  const rawPage = Number(url.searchParams.get("page") ?? 1);
  const rawPageSize = Number(url.searchParams.get("pageSize") ?? defaultPageSize);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isInteger(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, 100) : defaultPageSize;

  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function hasErrorCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function nullableText(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}
