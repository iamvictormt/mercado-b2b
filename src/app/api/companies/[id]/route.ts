import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { apiError, requireApiUser, validateMutationOrigin } from "@/server/api";

export const runtime = "nodejs";

const updateSchema = z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) });
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { quotes: true, sourcingRequests: true } },
      },
    });
    return company ? Response.json({ company }) : apiError("Empresa não encontrada.", 404);
  } catch (error) {
    console.error("Falha ao consultar empresa", error);
    return apiError("Não foi possível consultar a empresa.", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const payload = updateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) return apiError("Estado de empresa inválido.", 400);
    const { id } = await params;
    const result = await prisma.company.updateMany({ where: { id }, data: payload.data });
    if (result.count === 0) return apiError("Empresa não encontrada.", 404);
    return Response.json({ id, status: payload.data.status });
  } catch (error) {
    console.error("Falha ao atualizar empresa", error);
    return apiError("Não foi possível atualizar a empresa.", 500);
  }
}
