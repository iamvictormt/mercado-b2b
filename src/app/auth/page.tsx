import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthPage from "@/routes/auth";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Entrar ou criar conta",
  description: "Aceda à sua conta ou crie uma conta no Mercado B2B.",
  openGraph: {
    title: "Conta Mercado B2B",
    description: "Área visual para entrar ou criar conta no Mercado B2B.",
  },
};

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin/summary" : "/account/quotes");

  return <AuthPage />;
}
