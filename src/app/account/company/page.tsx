import type { Metadata } from "next";

import { CompanyProfile } from "@/components/account/company-profile";

export const metadata: Metadata = { title: "Dados da empresa" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <CompanyProfile returnTo={next ?? null} />;
}
