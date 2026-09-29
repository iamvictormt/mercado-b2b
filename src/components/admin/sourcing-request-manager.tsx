"use client";

import { AlertCircle, FileSearch, LoaderCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import {
  type AdminSourcingRequest,
  type PaginatedResponse,
  type SourcingStatus,
  sourcingStatusLabels,
  sourcingStatusStyles,
  sourcingStatuses,
} from "@/lib/admin";
import { formatMoney } from "@/lib/products";
import { cn } from "@/lib/utils";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(value),
  );

const statusOptions = sourcingStatuses.map((status) => ({
  value: status,
  label: sourcingStatusLabels[status],
}));

export function SourcingRequestManager() {
  const [requests, setRequests] = useState<AdminSourcingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sourcing-requests?pageSize=100", { cache: "no-store" });
      const body = (await response.json()) as PaginatedResponse<AdminSourcingRequest> & {
        error?: string;
      };
      if (!response.ok) throw new Error(body.error ?? "Não foi possível carregar os pedidos.");
      setRequests(body.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Não foi possível carregar os pedidos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const updateStatus = async (request: AdminSourcingRequest, status: SourcingStatus) => {
    if (request.status === status) return;
    setUpdatingId(request.id);
    try {
      const response = await fetch(`/api/sourcing-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = (await response.json()) as {
        sourcingRequest?: AdminSourcingRequest;
        error?: string;
      };
      if (!response.ok || !body.sourcingRequest) {
        throw new Error(body.error ?? "Não foi possível atualizar o pedido.");
      }
      setRequests((current) =>
        current.map((item) => (item.id === request.id ? body.sourcingRequest! : item)),
      );
      toast.success(`${request.number} atualizado para ${sourcingStatusLabels[status]}.`);
    } catch (updateError) {
      toast.error(
        updateError instanceof Error ? updateError.message : "Não foi possível atualizar o pedido.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center border border-border bg-card">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-64 place-items-center border border-border bg-card p-8 text-center">
        <div>
          <AlertCircle className="mx-auto size-6 text-destructive" />
          <p className="mt-3 text-sm">{error}</p>
          <Button
            variant="outline"
            className="mt-5 rounded-none"
            onClick={() => void loadRequests()}
          >
            <RotateCw /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="grid min-h-64 place-items-center border border-border bg-card p-8 text-center">
        <div>
          <FileSearch className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 font-display text-2xl italic">
            Ainda não existem pedidos de pesquisa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border border-border bg-store-paper/50 p-4">
        <p className="text-xs text-muted-foreground">{requests.length} pedidos apresentados</p>
        <Button variant="ghost" size="sm" onClick={() => void loadRequests()}>
          <RotateCw className="size-3.5" /> Atualizar
        </Button>
      </div>

      {requests.map((request) => (
        <article key={request.id} className="border border-border bg-card">
          <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-medium uppercase tracking-[.18em] text-muted-foreground">
                  {request.number}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(request.createdAt)}
                </span>
              </div>
              <h2 className="mt-3 max-w-3xl font-display text-2xl leading-tight italic">
                {request.description}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {request.company.name}
                {request.requestedBy
                  ? ` · ${request.requestedBy.name} · ${request.requestedBy.email}`
                  : ""}
              </p>
            </div>

            <SelectField
              value={request.status}
              disabled={updatingId === request.id}
              onValueChange={(status) => void updateStatus(request, status as SourcingStatus)}
              options={statusOptions}
              triggerAriaLabel={`Alterar estado do pedido ${request.number}`}
              triggerClassName={cn(
                "h-10 min-w-52 rounded-none border-0 px-3 text-xs shadow-none",
                sourcingStatusStyles[request.status],
              )}
            />
          </div>

          <div className="grid border-t border-border text-sm sm:grid-cols-3">
            <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
              <p className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                Orçamento
              </p>
              <p className="mt-2 font-medium">
                {request.budget === null
                  ? "Não indicado"
                  : formatMoney(Number(request.budget), "pt", request.currency)}
              </p>
            </div>
            <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
              <p className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                Quantidade
              </p>
              <p className="mt-2 font-medium">{request.quantity ?? "Não indicada"}</p>
            </div>
            <div className="p-4">
              <p className="text-[9px] uppercase tracking-[.18em] text-muted-foreground">
                Data pretendida
              </p>
              <p className="mt-2 font-medium">
                {request.desiredBy ? formatDate(request.desiredBy) : "Não definida"}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
