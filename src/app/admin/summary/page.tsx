import type { Metadata } from "next";

import { AdminSummary } from "@/components/admin/admin-summary";
import { AdminQuoteManager } from "@/components/admin/quote-manager";

export const metadata: Metadata = { title: "Resumo administrativo" };

export default function Page() {
  return (
    <div className="space-y-8">
      <AdminSummary />
      <section>
        <p className="mb-4 text-xs uppercase tracking-[.18em] text-muted-foreground">
          Cotações recentes
        </p>
        <AdminQuoteManager limit={3} />
      </section>
    </div>
  );
}
