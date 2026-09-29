export const quoteStatuses = [
  "REQUESTED",
  "UNDER_REVIEW",
  "QUOTED",
  "IMPORTING",
  "DELIVERED",
  "CANCELLED",
] as const;

export type QuoteStatus = (typeof quoteStatuses)[number];

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  REQUESTED: "Pedido recebido",
  UNDER_REVIEW: "Em análise",
  QUOTED: "Cotado",
  IMPORTING: "Em importação",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const quoteStatusLabelsEn: Record<QuoteStatus, string> = {
  REQUESTED: "Request received",
  UNDER_REVIEW: "Under review",
  QUOTED: "Quoted",
  IMPORTING: "Importing",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const quoteStatusStyles: Record<QuoteStatus, string> = {
  REQUESTED: "bg-store-coral/15 text-foreground",
  UNDER_REVIEW: "bg-store-coral/15 text-foreground",
  QUOTED: "bg-store-blue/15 text-foreground",
  IMPORTING: "bg-store-blue/15 text-foreground",
  DELIVERED: "bg-store-mint text-foreground",
  CANCELLED: "bg-destructive/10 text-destructive",
};

export const quoteProgressSteps = ["Recebido", "Cotado", "Importação", "Entregue"];
export const quoteProgressStepsEn = ["Received", "Quoted", "Importing", "Delivered"];

export function quoteProgressIndex(status: QuoteStatus) {
  if (status === "REQUESTED" || status === "UNDER_REVIEW") return 0;
  if (status === "QUOTED") return 1;
  if (status === "IMPORTING") return 2;
  if (status === "DELIVERED") return 3;
  return -1;
}

export type QuoteRecord = {
  id: string;
  number: string;
  status: QuoteStatus;
  currency: string;
  totalAmount: string | number;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    unitPrice: string | number;
    quantity: number;
    product: {
      id: string;
      slug: string;
      namePt: string;
      nameEn: string;
      imageUrl: string | null;
    } | null;
  }>;
};

export type QuoteListResponse = {
  items: QuoteRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};
