import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountPage from "@/routes/account";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Acompanhe as suas cotações, dados da empresa e favoritos no Mercado B2B.",
  openGraph: {
    title: "Minha conta — Mercado B2B",
    description: "Cotações, dados da empresa e favoritos da sua conta Mercado B2B.",
  },
};

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");

  return <AccountPage />;
}
