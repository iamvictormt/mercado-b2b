"use client";

import { AlertCircle, FileText, LoaderCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { formatMoney } from "@/lib/products";
import {
  type QuoteListResponse,
  type QuoteRecord,
  type QuoteStatus,
  quoteStatusLabels,
  quoteStatusStyles,
  quoteStatuses,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(value),
  );

export function AdminQuoteManager({ limit }: { limit?: number }) {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/quotes?pageSize=100", { cache: "no-store" });
      const body = (await response.json()) as QuoteListResponse & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Não foi possível carregar as cotações.");
      setQuotes(limit ? body.items.slice(0, limit) : body.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Não foi possível carregar as cotações.",
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

  const updateStatus = async (quote: QuoteRecord, status: QuoteStatus) => {
    if (status === quote.status) return;
    setUpdatingId(quote.id);
    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json()) as { quote?: QuoteRecord; error?: string };
      if (!response.ok || !body.quote) {
        throw new Error(body.error ?? "Não foi possível atualizar a cotação.");
      }
      setQuotes((current) => current.map((item) => (item.id === quote.id ? body.quote! : item)));
      toast.success(`${quote.number} atualizada para ${quoteStatusLabels[status]}.`);
    } catch (updateError) {
      toast.error(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível atualizar a cotação.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-56 place-items-center border border-border bg-card">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-56 place-items-center border border-border bg-card p-6 text-center">
        <div>
          <AlertCircle className="mx-auto mb-3 size-6 text-destructive" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" className="mt-5 rounded-none" onClick={() => void loadQuotes()}>
            <RotateCw /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!quotes.length) {
    return (
      <div className="grid min-h-56 place-items-center border border-border bg-card p-8 text-center">
        <div>
          <FileText className="mx-auto mb-3 size-6 text-muted-foreground" />
          <p className="font-display text-2xl italic">Ainda não existem cotações.</p>
        </div>
      </div>
    );
  }

  const statusOptions = quoteStatuses.map((status) => ({
    value: status,
    label: quoteStatusLabels[status],
  }));

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => void loadQuotes()}>
          <RotateCw className="size-3.5" /> Atualizar
        </Button>
      </div>
      <div className="space-y-3 md:hidden">
        {quotes.map((quote) => (
          <article key={quote.id} className="border border-border bg-card p-5 text-sm">
            <div className="flex justify-between gap-3">
              <strong>{quote.number}</strong>
              <span className="text-muted-foreground">{formatDate(quote.createdAt)}</span>
            </div>
            <p className="mt-3 font-medium">{quote.company.name}</p>
            <p className="mt-1 text-muted-foreground">
              {quote.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
              <strong>{formatMoney(Number(quote.totalAmount), "pt", quote.currency)}</strong>
              <SelectField
                value={quote.status}
                disabled={updatingId === quote.id}
                onValueChange={(status) => void updateStatus(quote, status as QuoteStatus)}
                options={statusOptions}
                triggerAriaLabel={`Status da cotação ${quote.number}`}
                triggerClassName={cn(
                  "h-8 min-w-40 rounded-none border-0 text-xs shadow-none",
                  quoteStatusStyles[quote.status],
                )}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto border border-border bg-card md:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              {[
                "Cotação",
                "Empresa",
                "Data",
                "Produtos",
                "Itens",
                "Total indicativo",
                "Status",
              ].map((heading) => (
                <th key={heading} className="p-4 font-normal">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id} className="border-t border-border align-top">
                <td className="p-4 font-medium">{quote.number}</td>
                <td className="p-4">{quote.company.name}</td>
                <td className="p-4 whitespace-nowrap">{formatDate(quote.createdAt)}</td>
                <td className="max-w-64 p-4">
                  {quote.items.map((item) => item.productName).join(", ")}
                </td>
                <td className="p-4">{quote.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="p-4 whitespace-nowrap">
                  {formatMoney(Number(quote.totalAmount), "pt", quote.currency)}
                </td>
                <td className="p-4">
                  <SelectField
                    value={quote.status}
                    disabled={updatingId === quote.id}
                    onValueChange={(status) => void updateStatus(quote, status as QuoteStatus)}
                    options={statusOptions}
                    triggerAriaLabel={`Alterar status de ${quote.number}`}
                    triggerClassName={cn(
                      "h-8 min-w-40 rounded-none border-0 px-2 py-1 text-xs shadow-none",
                      quoteStatusStyles[quote.status],
                    )}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
