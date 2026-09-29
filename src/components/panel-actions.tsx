import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PanelExit } from "@/components/panel-exit";
import { Button } from "@/components/ui/button";
import type { StoreLocale } from "@/lib/products";

export function PanelActions({
  compact = false,
  onNavigate,
  locale,
}: {
  compact?: boolean;
  onNavigate?: () => void;
  locale: StoreLocale;
}) {
  const backLabel = locale === "pt" ? "Voltar à plataforma" : "Back to the platform";
  return (
    <div
      className="mt-auto border-t border-border bg-background/50 p-2"
      aria-label={locale === "pt" ? "Ações da conta" : "Account actions"}
    >
      <div className="flex flex-col gap-1">
        <Button
          asChild
          variant="ghost"
          title={compact ? backLabel : undefined}
          className={`group h-11 w-full px-2 text-muted-foreground hover:bg-store-blue/10 hover:text-foreground ${compact ? "justify-center" : "justify-start gap-3"}`}
        >
          <Link
            href="/"
            {...(onNavigate ? { onClick: onNavigate } : {})}
            {...(compact ? { "aria-label": backLabel } : {})}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted/80 transition-colors group-hover:bg-store-blue/10">
              <ArrowLeft className="size-4" />
            </span>
            {!compact && <span>{backLabel}</span>}
          </Link>
        </Button>
        <PanelExit compact={compact} locale={locale} />
      </div>
    </div>
  );
}
