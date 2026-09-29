import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PanelShell } from "@/components/panel-shell";
import { getCurrentUser } from "@/server/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/summary");
  if (user.role !== "ADMIN") redirect("/account/quotes");

  return (
    <PanelShell variant="admin" sessionExpiresAt={user.sessionExpiresAt}>
      {children}
    </PanelShell>
  );
}
