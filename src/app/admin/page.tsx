import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminPage from "@/routes/admin";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Painel administrativo",
  description: "Gira produtos, cotações e empresas do Mercado B2B.",
  openGraph: {
    title: "Painel administrativo — Mercado B2B",
    description: "Produtos, cotações, empresas e resumo de atividade do Mercado B2B.",
  },
};

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin");
  if (user.role !== "ADMIN") redirect("/account");

  return <AdminPage />;
}
