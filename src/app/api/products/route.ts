import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  apiError,
  hasErrorCode,
  nullableText,
  paginationFrom,
  requireApiUser,
  slugify,
  validateMutationOrigin,
} from "@/server/api";
import { publicProductSelect } from "@/server/repositories/products";
import { productCategories, productSchema } from "@/server/schemas";
import { getCurrentUser } from "@/server/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { page, pageSize, skip } = paginationFrom(url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("q")?.trim();
    const user = await getCurrentUser();
    const scope = url.searchParams.get("scope");
    const canManage = user?.role === "ADMIN" && (scope === "manage" || scope === "all");
    const canSeeArchived = user?.role === "ADMIN" && scope === "all";

    if (category && !productCategories.includes(category as (typeof productCategories)[number])) {
      return apiError("Categoria de produto inválida.", 400);
    }

    const where: Prisma.ProductWhereInput = {
      ...(canSeeArchived ? {} : canManage ? { status: { not: "ARCHIVED" } } : { status: "ACTIVE" }),
      ...(category ? { category: category as (typeof productCategories)[number] } : {}),
      ...(search
        ? {
            OR: [
              { namePt: { contains: search, mode: "insensitive" } },
              { nameEn: { contains: search, mode: "insensitive" } },
              { descriptionPt: { contains: search, mode: "insensitive" } },
              { descriptionEn: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        select: canManage ? { ...publicProductSelect, status: true } : publicProductSelect,
        orderBy: [{ featuredOrder: "desc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({
      items,
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Falha ao listar produtos", error);
    return apiError("Não foi possível listar os produtos.", 500);
  }
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const payload = productSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados do produto inválidos.", 400, payload.error.flatten());
    }

    const input = payload.data;
    const slug = slugify(input.slug ?? input.namePt);
    if (!slug) return apiError("Não foi possível gerar um slug válido.", 400);

    const product = await prisma.product.create({
      data: {
        slug,
        namePt: input.namePt,
        nameEn: input.nameEn,
        descriptionPt: input.descriptionPt,
        descriptionEn: input.descriptionEn,
        detailPt: nullableText(input.detailPt) ?? null,
        detailEn: nullableText(input.detailEn) ?? null,
        category: input.category,
        status: input.status,
        price: input.price.toFixed(2),
        currency: input.currency,
        originPt: input.originPt,
        originEn: input.originEn,
        leadTimePt: input.leadTimePt,
        leadTimeEn: input.leadTimeEn,
        minQuantity: input.minQuantity,
        unitPt: input.unitPt,
        unitEn: input.unitEn,
        imageUrl: nullableText(input.imageUrl) ?? null,
        imagePublicId: nullableText(input.imagePublicId) ?? null,
        featuredOrder: input.featuredOrder,
      },
      select: { ...publicProductSelect, status: true },
    });

    revalidatePath("/");
    revalidatePath("/catalog");

    return Response.json({ product }, { status: 201 });
  } catch (error) {
    if (hasErrorCode(error, "P2002")) {
      return apiError("Já existe um produto com este slug.", 409);
    }
    console.error("Falha ao criar produto", error);
    return apiError("Não foi possível criar o produto.", 500);
  }
}
