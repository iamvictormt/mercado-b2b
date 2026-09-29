import { randomUUID } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  apiError,
  nullableText,
  paginationFrom,
  requireApiUser,
  validateMutationOrigin,
} from "@/server/api";
import { quoteCreateSchema, quoteStatuses } from "@/server/schemas";

export const runtime = "nodejs";

const quoteInclude = {
  company: { select: { id: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, slug: true, namePt: true, nameEn: true, imageUrl: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const { page, pageSize, skip } = paginationFrom(url, 20);
    const status = url.searchParams.get("status");
    if (status && !quoteStatuses.includes(status as (typeof quoteStatuses)[number])) {
      return apiError("Estado de cotação inválido.", 400);
    }

    const where: Prisma.QuoteWhereInput = {
      ...(auth.user.role === "ADMIN" ? {} : { requestedById: auth.user.id }),
      ...(status ? { status: status as (typeof quoteStatuses)[number] } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.quote.findMany({
        where,
        include: quoteInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.quote.count({ where }),
    ]);

    return Response.json({
      items,
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Falha ao listar cotações", error);
    return apiError("Não foi possível listar as cotações.", 500);
  }
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("CUSTOMER");
  if (!auth.ok) return auth.response;
  if (!auth.user.company) {
    return apiError("Preencha os dados da empresa antes de pedir uma cotação.", 409);
  }

  try {
    const payload = quoteCreateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados da cotação inválidos.", 400, payload.error.flatten());
    }

    const quantities = new Map<string, number>();
    for (const item of payload.data.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: [...quantities.keys()] }, status: "ACTIVE" },
      select: { id: true, namePt: true, price: true, currency: true },
    });
    if (products.length !== quantities.size) {
      return apiError("Um ou mais produtos não estão disponíveis.", 400);
    }

    const currency = products[0]?.currency ?? "EUR";
    if (products.some((product) => product.currency !== currency)) {
      return apiError("Todos os produtos da cotação devem usar a mesma moeda.", 400);
    }

    let total = new Prisma.Decimal(0);
    const items = products.map((product) => {
      const quantity = quantities.get(product.id) ?? 0;
      total = total.plus(product.price.mul(quantity));
      return {
        productId: product.id,
        productName: product.namePt,
        unitPrice: product.price,
        quantity,
      };
    });

    const quote = await prisma.quote.create({
      data: {
        number: `C-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`,
        companyId: auth.user.company.id,
        requestedById: auth.user.id,
        currency,
        totalAmount: total,
        notes: nullableText(payload.data.notes) ?? null,
        items: { create: items },
      },
      include: quoteInclude,
    });

    return Response.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar cotação", error);
    return apiError("Não foi possível criar a cotação.", 500);
  }
}
