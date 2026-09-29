import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  apiError,
  hasErrorCode,
  nullableText,
  requireApiUser,
  validateMutationOrigin,
} from "@/server/api";
import { companySchema } from "@/server/schemas";

export const runtime = "nodejs";

const companySelect = {
  id: true,
  name: true,
  taxId: true,
  email: true,
  phone: true,
  address: true,
  countryCode: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    if (!auth.user.company) return Response.json({ company: null });
    const company = await prisma.company.findUnique({
      where: { id: auth.user.company.id },
      select: companySelect,
    });
    return Response.json({ company });
  } catch (error) {
    console.error("Falha ao consultar empresa", error);
    return apiError("Não foi possível consultar os dados da empresa.", 500);
  }
}

export async function PUT(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const payload = companySchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados da empresa inválidos.", 400, payload.error.flatten());
    }

    const input = payload.data;
    const data: Prisma.CompanyCreateInput = {
      name: input.name,
      countryCode: input.countryCode,
      ...(input.taxId !== undefined ? { taxId: nullableText(input.taxId) ?? null } : {}),
      ...(input.email !== undefined ? { email: nullableText(input.email) ?? null } : {}),
      ...(input.phone !== undefined ? { phone: nullableText(input.phone) ?? null } : {}),
      ...(input.address !== undefined ? { address: nullableText(input.address) ?? null } : {}),
    };

    const company = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: auth.user.id },
        select: { companyId: true },
      });

      if (user?.companyId) {
        return transaction.company.update({
          where: { id: user.companyId },
          data,
          select: companySelect,
        });
      }

      return transaction.company.create({
        data: { ...data, users: { connect: { id: auth.user.id } } },
        select: companySelect,
      });
    });

    return Response.json({ company });
  } catch (error) {
    if (hasErrorCode(error, "P2002")) {
      return apiError("Já existe uma empresa com este número fiscal.", 409);
    }
    console.error("Falha ao guardar empresa", error);
    return apiError("Não foi possível guardar os dados da empresa.", 500);
  }
}
