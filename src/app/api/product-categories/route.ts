import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import {
  apiError,
  hasErrorCode,
  requireApiUser,
  slugify,
  validateMutationOrigin,
} from "@/server/api";
import { productCategoryCreateSchema } from "@/server/schemas";

export const runtime = "nodejs";

const categorySelect = {
  slug: true,
  namePt: true,
  nameEn: true,
  _count: { select: { products: true } },
} as const;

export async function GET() {
  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const items = await prisma.productCategory.findMany({
      select: categorySelect,
      orderBy: { namePt: "asc" },
    });
    return Response.json({ items });
  } catch (error) {
    console.error("Falha ao listar categorias de produtos", error);
    return apiError("Não foi possível carregar as categorias.", 500);
  }
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const payload = productCategoryCreateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados da categoria inválidos.", 400, payload.error.flatten());
    }

    const slug = slugify(payload.data.namePt).slice(0, 80);
    if (!slug) return apiError("Não foi possível gerar um identificador para a categoria.", 400);

    const category = await prisma.productCategory.create({
      data: { slug, ...payload.data },
      select: categorySelect,
    });

    revalidatePath("/");
    revalidatePath("/catalog");
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    if (hasErrorCode(error, "P2002")) {
      return apiError("Já existe uma categoria com esse nome.", 409);
    }
    console.error("Falha ao criar categoria de produto", error);
    return apiError("Não foi possível criar a categoria.", 500);
  }
}
