import { redirect } from "next/navigation";

const legacyTabs: Record<string, string> = {
  quotes: "/account/quotes",
  sourcing: "/account/sourcing",
  profile: "/account/company",
  favorites: "/account/favorites",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; next?: string }>;
}) {
  const { tab, next } = await searchParams;
  const destination = (tab && legacyTabs[tab]) || "/account/quotes";
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : null;
  const query =
    destination === "/account/company" && safeNext ? `?next=${encodeURIComponent(safeNext)}` : "";
  redirect(`${destination}${query}`);
}
