import { z } from "zod";

const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();
const currency = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase());
const imageUrl = z.string().trim().url().max(2048).nullable().optional();
const imagePublicId = z.string().trim().min(1).max(255).nullable().optional();

export const productCategories = ["OFFICE", "PRINT", "AGRO", "BUSINESS", "OTHER"] as const;
export const productStatuses = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export const quoteStatuses = [
  "REQUESTED",
  "UNDER_REVIEW",
  "QUOTED",
  "IMPORTING",
  "DELIVERED",
  "CANCELLED",
] as const;
export const sourcingStatuses = [
  "REQUESTED",
  "SEARCHING",
  "SUPPLIER_FOUND",
  "QUOTED",
  "CLOSED",
  "CANCELLED",
] as const;

export const productSchema = z.object({
  slug: z.string().trim().min(1).max(180).optional(),
  namePt: z.string().trim().min(2).max(200),
  nameEn: z.string().trim().min(2).max(200),
  descriptionPt: z.string().trim().min(10).max(10000),
  descriptionEn: z.string().trim().min(10).max(10000),
  detailPt: nullableText(255),
  detailEn: nullableText(255),
  category: z.enum(productCategories),
  status: z.enum(productStatuses).default("DRAFT"),
  price: z.coerce.number().finite().nonnegative().max(9999999999.99),
  currency: currency.default("EUR"),
  originPt: z.string().trim().min(2).max(120),
  originEn: z.string().trim().min(2).max(120),
  leadTimePt: z.string().trim().min(1).max(120),
  leadTimeEn: z.string().trim().min(1).max(120),
  minQuantity: z.coerce.number().int().positive().max(100000000).default(1),
  unitPt: z.string().trim().min(1).max(60),
  unitEn: z.string().trim().min(1).max(60),
  imageUrl,
  imagePublicId,
  featuredOrder: z.coerce.number().int().min(0).max(100000).default(0),
});

export const productUpdateSchema = productSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Envie ao menos um campo para atualizar.");

export const companySchema = z.object({
  name: z.string().trim().min(2).max(200),
  taxId: nullableText(80),
  email: z.string().trim().email().max(255).nullable().optional(),
  phone: nullableText(40),
  address: nullableText(5000),
  countryCode: z
    .string()
    .trim()
    .length(2)
    .transform((value) => value.toUpperCase())
    .default("ST"),
});

export const quoteCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().positive().max(100000),
      }),
    )
    .min(1)
    .max(100),
  notes: nullableText(5000),
});

export const quoteUpdateSchema = z
  .object({
    status: z.enum(quoteStatuses).optional(),
    notes: nullableText(5000),
    validUntil: z.string().date().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "Envie ao menos um campo para atualizar.");

export const sourcingCreateSchema = z.object({
  description: z.string().trim().min(10).max(10000),
  quantity: z.coerce.number().int().positive().max(100000000).nullable().optional(),
  budget: z.coerce.number().finite().nonnegative().max(9999999999.99).nullable().optional(),
  currency: currency.default("EUR"),
  desiredBy: z.string().date().nullable().optional(),
  imageUrl,
  imagePublicId,
});

export const sourcingUpdateSchema = z
  .object({
    status: z.enum(sourcingStatuses).optional(),
    internalNotes: nullableText(10000),
  })
  .refine((value) => Object.keys(value).length > 0, "Envie ao menos um campo para atualizar.");
