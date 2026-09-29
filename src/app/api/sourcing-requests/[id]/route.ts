import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, nullableText, requireApiUser, validateMutationOrigin } from "@/server/api";
import { sourcingUpdateSchema } from "@/server/schemas";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const include = {
  company: { select: { id: true, name: true, email: true, phone: true } },
  requestedBy: { select: { id: true, name: true, email: true } },
} as const;

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const sourcingRequest = await prisma.sourcingRequest.findFirst({
      where: {
        id,
        ...(auth.user.role === "ADMIN" ? {} : { requestedById: auth.user.id }),
      },
      include,
    });
    return sourcingRequest
      ? Response.json({ sourcingRequest })
      : apiError("Pedido de pesquisa não encontrado.", 404);
  } catch (error) {
    console.error("Falha ao consultar pedido de pesquisa", error);
    return apiError("Não foi possível consultar o pedido de pesquisa.", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const payload = sourcingUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados do pedido inválidos.", 400, payload.error.flatten());
    }
    const { id } = await params;
    const input = payload.data;
    const data: Prisma.SourcingRequestUpdateInput = {};
    if (input.status !== undefined) data.status = input.status;
    if (input.internalNotes !== undefined)
      data.internalNotes = nullableText(input.internalNotes) ?? null;

    const existing = await prisma.sourcingRequest.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return apiError("Pedido de pesquisa não encontrado.", 404);
    const sourcingRequest = await prisma.sourcingRequest.update({ where: { id }, data, include });
    return Response.json({ sourcingRequest });
  } catch (error) {
    console.error("Falha ao atualizar pedido de pesquisa", error);
    return apiError("Não foi possível atualizar o pedido de pesquisa.", 500);
  }
}
