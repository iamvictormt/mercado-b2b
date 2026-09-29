export type AdminSummaryResponse = {
  monthlyVolumes: Array<{ currency: string; total: number }>;
  openQuotes: number;
  activeCompanies: number;
  openSourcingRequests: number;
  quoteActivity: Array<{ date: string; count: number }>;
};

export type AdminCompany = {
  id: string;
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  quoteTotals: Array<{ currency: string; total: number }>;
  _count: {
    users: number;
    quotes: number;
    sourcingRequests: number;
  };
};

export const sourcingStatuses = [
  "REQUESTED",
  "SEARCHING",
  "SUPPLIER_FOUND",
  "QUOTED",
  "CLOSED",
  "CANCELLED",
] as const;

export type SourcingStatus = (typeof sourcingStatuses)[number];

export const sourcingStatusLabels: Record<SourcingStatus, string> = {
  REQUESTED: "Pedido recebido",
  SEARCHING: "Em pesquisa",
  SUPPLIER_FOUND: "Fornecedor encontrado",
  QUOTED: "Cotado",
  CLOSED: "Concluído",
  CANCELLED: "Cancelado",
};

export const sourcingStatusLabelsEn: Record<SourcingStatus, string> = {
  REQUESTED: "Request received",
  SEARCHING: "Searching",
  SUPPLIER_FOUND: "Supplier found",
  QUOTED: "Quoted",
  CLOSED: "Completed",
  CANCELLED: "Cancelled",
};

export const sourcingStatusStyles: Record<SourcingStatus, string> = {
  REQUESTED: "bg-store-coral/15 text-foreground",
  SEARCHING: "bg-store-blue/15 text-foreground",
  SUPPLIER_FOUND: "bg-store-mint text-foreground",
  QUOTED: "bg-store-mint text-foreground",
  CLOSED: "bg-foreground text-background",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export type AdminSourcingRequest = {
  id: string;
  number: string;
  description: string;
  quantity: number | null;
  budget: string | number | null;
  currency: string;
  desiredBy: string | null;
  status: SourcingStatus;
  imageUrl: string | null;
  createdAt: string;
  company: { id: string; name: string };
  requestedBy: { id: string; name: string; email: string } | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; pageCount: number };
};
