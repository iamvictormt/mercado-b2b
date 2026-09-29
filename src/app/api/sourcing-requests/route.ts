import { randomUUID } from "node:crypto";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  apiError,
  nullableText,
  paginationFrom,
  requireApiUser,
  validateMutationOrigin,
} from "@/server/api";
import { sourcingCreateSchema, sourcingStatuses } from "@/server/schemas";

export const runtime = "nodejs";

const include = {
  company: { select: { id: true, name: true } },
  requestedBy: { select: { id: true, name: true, email: true } },
} as const;

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const { page, pageSize, skip } = paginationFrom(url, 20);
    const status = url.searchParams.get("status");
    if (status && !sourcingStatuses.includes(status as (typeof sourcingStatuses)[number])) {
      return apiError("Estado de pedido inválido.", 400);
    }

    const where: Prisma.SourcingRequestWhereInput = {
      ...(auth.user.role === "ADMIN" ? {} : { requestedById: auth.user.id }),
      ...(status ? { status: status as (typeof sourcingStatuses)[number] } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.sourcingRequest.findMany({
        where,
        include,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.sourcingRequest.count({ where }),
    ]);

    return Response.json({
      items,
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Falha ao listar pedidos de pesquisa", error);
    return apiError("Não foi possível listar os pedidos de pesquisa.", 500);
  }
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("CUSTOMER");
  if (!auth.ok) return auth.response;
  if (!auth.user.company) {
    return apiError("Preencha os dados da empresa antes de enviar um pedido.", 409);
  }

  try {
    const payload = sourcingCreateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados do pedido inválidos.", 400, payload.error.flatten());
    }

    const input = payload.data;
    const sourcingRequest = await prisma.sourcingRequest.create({
      data: {
        number: `B-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`,
        companyId: auth.user.company.id,
        requestedById: auth.user.id,
        description: input.description,
        quantity: input.quantity ?? null,
        budget:
          input.budget === null || input.budget === undefined ? null : input.budget.toFixed(2),
        currency: input.currency,
        desiredBy: input.desiredBy ? new Date(`${input.desiredBy}T00:00:00.000Z`) : null,
        imageUrl: nullableText(input.imageUrl) ?? null,
        imagePublicId: nullableText(input.imagePublicId) ?? null,
      },
      include,
    });

    return Response.json({ sourcingRequest }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar pedido de pesquisa", error);
    return apiError("Não foi possível criar o pedido de pesquisa.", 500);
  }
}
