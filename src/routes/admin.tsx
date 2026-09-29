"use client";

import Link from "next/link";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Menu,
  Package,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PanelActions } from "@/components/panel-actions";
import { ProductManager } from "@/components/admin/product-manager";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { formatMoney } from "@/lib/products";
import { cn } from "@/lib/utils";

type Tab = "summary" | "products" | "quotes" | "companies" | "sourcing";

const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "summary", label: "Resumo", icon: BarChart3 },
  { id: "products", label: "Produtos", icon: Package },
  { id: "quotes", label: "Cotações", icon: FileText },
  { id: "companies", label: "Empresas", icon: Building2 },
  { id: "sourcing", label: "Pedidos de pesquisa", icon: Search },
];

const statusStyle: Record<string, string> = {
  "Em análise": "bg-store-coral/15 text-foreground",
  Cotado: "bg-store-blue/15 text-foreground",
  "Em importação": "bg-store-blue/15 text-foreground",
  Entregue: "bg-store-mint text-foreground",
};

const quotes = [
  {
    id: "#C-1048",
    company: "Gráfica Central, Lda",
    date: "24/09/2026",
    product: "Plotter de grande formato 1,6 m",
    qty: 1,
    total: 6800,
    status: "Em análise",
  },
  {
    id: "#C-1047",
    company: "Café & Cacau STP",
    date: "23/09/2026",
    product: "Pulverizador motorizado 20 L",
    qty: 10,
    total: 1650,
    status: "Cotado",
  },
  {
    id: "#C-1046",
    company: "Escritório Horizonte",
    date: "22/09/2026",
    product: "Impressora multifunções laser",
    qty: 3,
    total: 1260,
    status: "Em importação",
  },
  {
    id: "#C-1045",
    company: "Mercearia Bom Preço",
    date: "20/09/2026",
    product: "Vitrine refrigerada para bebidas",
    qty: 2,
    total: 1560,
    status: "Entregue",
  },
  {
    id: "#C-1044",
    company: "Restaurante O Pescador",
    date: "19/09/2026",
    product: "Kit caixa POS completo",
    qty: 1,
    total: 590,
    status: "Entregue",
  },
];

const companies = [
  {
    name: "Gráfica Central, Lda",
    contact: "grafica.central@email.com",
    phone: "+239 990 0001",
    quotes: 4,
    volume: 12890,
  },
  {
    name: "Café & Cacau STP",
    contact: "compras@cafecacau.st",
    phone: "+239 990 0002",
    quotes: 1,
    volume: 1650,
  },
  {
    name: "Escritório Horizonte",
    contact: "geral@horizonte.st",
    phone: "+239 990 0003",
    quotes: 3,
    volume: 3109,
  },
  {
    name: "Mercearia Bom Preço",
    contact: "bom.preco@email.com",
    phone: "+239 990 0004",
    quotes: 2,
    volume: 2150,
  },
];

const sourcingRequests = [
  {
    id: "#B-031",
    company: "Hotel Praia Inhame",
    request: "Máquina de gelo industrial 50 kg/dia",
    budget: "€1.500",
    deadline: "60 dias",
    date: "24/09/2026",
  },
  {
    id: "#B-030",
    company: "Padaria São Pedro",
    request: "Forno rotativo a gás para padaria",
    budget: "€4.000",
    deadline: "90 dias",
    date: "21/09/2026",
  },
  {
    id: "#B-029",
    company: "Cooperativa de Cacau",
    request: "Balança plataforma 500 kg",
    budget: "€300",
    deadline: "45 dias",
    date: "18/09/2026",
  },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("summary");
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [quoteStatuses, setQuoteStatuses] = useState<Record<string, string>>({});

  const nav = (mini = false) => (
    <nav className="mt-6 flex flex-col gap-2 lg:mt-12">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          onClick={() => {
            setTab(id);
            setMenuOpen(false);
          }}
          variant="ghost"
          title={mini ? label : undefined}
          aria-label={mini ? label : undefined}
          className={cn(
            "h-11 w-full shrink-0 gap-3 rounded px-3 text-sm",
            mini ? "justify-center" : "justify-start",
            tab === id
              ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
              : "hover:bg-background/70",
          )}
        >
          <Icon className="size-4" /> {!mini && label}
        </Button>
      ))}
    </nav>
  );

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground lg:grid",
        collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[280px_minmax(0,1fr)]",
      )}
    >
      {/* Top bar com hambúrguer — mobile e tablet */}
      <div className="flex items-center justify-between border-b border-border bg-store-mint/60 px-5 py-4 lg:hidden">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-2xl italic leading-tight">Mercado B2B</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            admin
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-6" />
        </Button>
      </div>

      {/* Menu lateral deslizante — mobile e tablet */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu do painel"
        >
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-store-mint shadow-xl">
            <div className="flex items-start justify-between p-5">
              <Link href="/" className="flex flex-col gap-1" onClick={() => setMenuOpen(false)}>
                <span className="font-display text-2xl italic leading-tight">Mercado B2B</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  admin
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="px-5">{nav()}</div>
            <PanelActions onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Barra lateral fixa — desktop */}
      <aside
        className={cn(
          "hidden border-r border-border bg-store-mint/60 lg:flex lg:min-h-screen lg:flex-col",
          collapsed ? "lg:w-[72px]" : "lg:w-[280px]",
        )}
      >
        <div className={collapsed ? "p-3" : "p-8"}>
          <div
            className={cn(
              "flex items-start",
              collapsed ? "flex-col items-center gap-5" : "justify-between gap-2",
            )}
          >
            <Link href="/" title="Mercado B2B" className="flex flex-col gap-1">
              <span className="font-display text-2xl italic leading-tight">
                {collapsed ? "M" : "Mercado B2B"}
              </span>
              {!collapsed && (
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  admin
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expandir menu" : "Minimizar menu"}
              title={collapsed ? "Expandir menu" : "Minimizar menu"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>
          {nav(collapsed)}
        </div>
        <PanelActions compact={collapsed} />
      </aside>

      <main className="min-w-0 p-5 sm:p-8 lg:p-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Painel</p>
            <h1 className="font-display text-5xl">{tabs.find((t) => t.id === tab)?.label}</h1>
          </div>
        </div>

        {tab === "summary" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Volume cotado no mês", formatMoney(18420, "pt")],
                ["Cotações abertas", "12"],
                ["Empresas ativas", "38"],
                ["Pedidos de pesquisa", "5"],
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-3 font-display text-4xl">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded border border-border bg-card p-6">
              <p className="mb-6 text-sm text-muted-foreground">Cotações dos últimos 7 dias</p>
              <div className="flex h-48 items-end gap-3">
                {[40, 65, 30, 80, 55, 95, 70].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t bg-primary/70" style={{ height: `${h}%` }} />
                    <span className="text-xs text-muted-foreground">
                      {["S", "T", "Q", "Q", "S", "S", "D"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <QuotesTable
              rows={quotes.slice(0, 3)}
              statuses={quoteStatuses}
              onStatusChange={(id, status) => {
                setQuoteStatuses((previous) => ({ ...previous, [id]: status }));
                toast.success(`Cotação ${id} atualizada para ${status} (demonstração).`);
              }}
            />
          </div>
        )}

        {tab === "products" && <ProductManager />}

        {tab === "quotes" && (
          <QuotesTable
            rows={quotes}
            statuses={quoteStatuses}
            onStatusChange={(id, status) => {
              setQuoteStatuses((previous) => ({ ...previous, [id]: status }));
              toast.success(`Cotação ${id} atualizada para ${status} (demonstração).`);
            }}
          />
        )}

        {tab === "companies" && (
          <div>
            <div className="space-y-3 md:hidden">
              {companies.map((c) => (
                <article
                  key={c.contact}
                  className="rounded border border-border bg-card p-5 text-sm"
                >
                  <h2 className="font-medium">{c.name}</h2>
                  <p className="mt-2 break-all text-muted-foreground">{c.contact}</p>
                  <p className="mt-1 text-muted-foreground">{c.phone}</p>
                  <div className="mt-4 flex justify-between border-t border-border pt-3">
                    <span>{c.quotes} cotações</span>
                    <strong>{formatMoney(c.volume, "pt")}</strong>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto rounded border border-border bg-card md:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    {["Empresa", "Contacto", "Telefone", "Cotações", "Volume total"].map((h) => (
                      <th key={h} className="p-4 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.contact} className="border-t border-border">
                      <td className="p-4 font-medium">{c.name}</td>
                      <td className="p-4">{c.contact}</td>
                      <td className="p-4">{c.phone}</td>
                      <td className="p-4">{c.quotes}</td>
                      <td className="p-4">{formatMoney(c.volume, "pt")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "sourcing" && (
          <div className="space-y-4">
            {sourcingRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded border border-border bg-card p-5"
              >
                <div>
                  <p className="font-medium">
                    {r.request}{" "}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {r.id} · {r.date}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.company}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <span>
                    Orçamento: <strong>{r.budget}</strong>
                  </span>
                  <span>
                    Prazo: <strong>{r.deadline}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function QuotesTable({
  rows,
  statuses,
  onStatusChange,
}: {
  rows: typeof quotes;
  statuses?: Record<string, string>;
  onStatusChange?: (id: string, status: string) => void;
}) {
  return (
    <div>
      <div className="space-y-3 md:hidden">
        {rows.map((o) => (
          <article key={o.id} className="rounded border border-border bg-card p-5 text-sm">
            <div className="flex justify-between gap-3">
              <strong>{o.id}</strong>
              <span className="text-muted-foreground">{o.date}</span>
            </div>
            <p className="mt-3 font-medium">{o.company}</p>
            <p className="mt-1 text-muted-foreground">
              {o.product} · {o.qty} un.
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
              <strong>{formatMoney(o.total, "pt")}</strong>
              <SelectField
                value={statuses?.[o.id] ?? o.status}
                onValueChange={(status) => onStatusChange?.(o.id, status)}
                options={Object.keys(statusStyle).map((s) => ({ value: s, label: s }))}
                triggerAriaLabel={`Status da cotação ${o.id}`}
                triggerClassName="h-8 min-w-36 text-xs"
              />
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded border border-border bg-card md:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              {["Cotação", "Empresa", "Data", "Produto", "Qtd.", "Total", "Status"].map((h) => (
                <th key={h} className="p-4 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-4 font-medium">{o.id}</td>
                <td className="p-4">{o.company}</td>
                <td className="p-4">{o.date}</td>
                <td className="p-4">{o.product}</td>
                <td className="p-4">{o.qty}</td>
                <td className="p-4">{formatMoney(o.total, "pt")}</td>
                <td className="p-4">
                  <SelectField
                    value={statuses?.[o.id] ?? o.status}
                    onValueChange={(status) => onStatusChange?.(o.id, status)}
                    options={Object.keys(statusStyle).map((s) => ({ value: s, label: s }))}
                    triggerAriaLabel="Alterar status"
                    triggerClassName={cn(
                      "h-8 min-w-36 border-0 px-2 py-1 text-xs shadow-none",
                      statusStyle[o.status],
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
