import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, paginationFrom, requireApiUser } from "@/server/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const { page, pageSize, skip } = paginationFrom(url);
    const search = url.searchParams.get("q")?.trim();
    const rawStatus = url.searchParams.get("status");
    if (rawStatus && rawStatus !== "ACTIVE" && rawStatus !== "INACTIVE") {
      return apiError("Estado de empresa inválido.", 400);
    }
    const status = rawStatus === "ACTIVE" || rawStatus === "INACTIVE" ? rawStatus : undefined;

    const where: Prisma.CompanyWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { taxId: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          taxId: true,
          email: true,
          phone: true,
          countryCode: true,
          status: true,
          createdAt: true,
          _count: { select: { users: true, quotes: true, sourcingRequests: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.company.count({ where }),
    ]);

    const quoteTotals = items.length
      ? await prisma.quote.groupBy({
          by: ["companyId", "currency"],
          where: { companyId: { in: items.map((company) => company.id) } },
          orderBy: [{ companyId: "asc" }, { currency: "asc" }],
          _sum: { totalAmount: true },
        })
      : [];

    return Response.json({
      items: items.map((company) => ({
        ...company,
        quoteTotals: quoteTotals
          .filter((total) => total.companyId === company.id)
          .map((total) => ({
            currency: total.currency,
            total: Number(total._sum?.totalAmount ?? 0),
          })),
      })),
      pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Falha ao listar empresas", error);
    return apiError("Não foi possível listar as empresas.", 500);
  }
}
