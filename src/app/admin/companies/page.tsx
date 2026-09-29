import type { Metadata } from "next";

import { CompanyManager } from "@/components/admin/company-manager";

export const metadata: Metadata = { title: "Empresas" };

export default function Page() {
  return <CompanyManager />;
}
