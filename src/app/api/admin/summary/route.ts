import { prisma } from "@/lib/prisma";
import { apiError, requireApiUser } from "@/server/api";

export const runtime = "nodejs";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const activityStart = new Date();
    activityStart.setUTCHours(0, 0, 0, 0);
    activityStart.setUTCDate(activityStart.getUTCDate() - 6);

    const [monthlyVolumeRows, openQuotes, activeCompanies, openSourcingRequests, quotes] =
      await prisma.$transaction([
        prisma.quote.groupBy({
          by: ["currency"],
          where: { createdAt: { gte: monthStart } },
          orderBy: { currency: "asc" },
          _sum: { totalAmount: true },
        }),
        prisma.quote.count({
          where: { status: { in: ["REQUESTED", "UNDER_REVIEW", "QUOTED", "IMPORTING"] } },
        }),
        prisma.company.count({ where: { status: "ACTIVE" } }),
        prisma.sourcingRequest.count({
          where: {
            status: { in: ["REQUESTED", "SEARCHING", "SUPPLIER_FOUND", "QUOTED"] },
          },
        }),
        prisma.quote.findMany({
          where: { createdAt: { gte: activityStart } },
          select: { createdAt: true },
        }),
      ]);

    const counts = new Map<string, number>();
    for (const quote of quotes) {
      const date = isoDate(quote.createdAt);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }

    const quoteActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(activityStart);
      date.setUTCDate(activityStart.getUTCDate() + index);
      const key = isoDate(date);
      return { date: key, count: counts.get(key) ?? 0 };
    });

    return Response.json({
      monthlyVolumes: monthlyVolumeRows.map((row) => ({
        currency: row.currency,
        total: Number(row._sum?.totalAmount ?? 0),
      })),
      openQuotes,
      activeCompanies,
      openSourcingRequests,
      quoteActivity,
    });
  } catch (error) {
    console.error("Falha ao carregar o resumo administrativo", error);
    return apiError("Não foi possível carregar o resumo do painel.", 500);
  }
}
