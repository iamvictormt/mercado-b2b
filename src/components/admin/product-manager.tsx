"use client";

import {
  CheckCircle2,
  FolderTree,
  ImagePlus,
  LoaderCircle,
  PackageOpen,
  Pencil,
  Plus,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CategoryManager } from "@/components/admin/category-manager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input, MaskedInput, maskFormatters } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/products";
import type { ProductCategoryRecord } from "@/lib/product-categories";
import { cn } from "@/lib/utils";

type AdminProduct = {
  id: string;
  slug: string;
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  detailPt: string | null;
  detailEn: string | null;
  category: {
    slug: string;
    namePt: string;
    nameEn: string;
  };
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  price: string;
  currency: string;
  originPt: string;
  originEn: string;
  leadTimePt: string;
  leadTimeEn: string;
  minQuantity: number;
  unitPt: string;
  unitEn: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  featuredOrder: number;
};

type ProductCurrency = "AOA" | "USD" | "EUR" | "STN";

type ProductForm = {
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  detailPt: string;
  detailEn: string;
  categorySlug: string;
  status: AdminProduct["status"];
  price: string;
  currency: ProductCurrency;
  originPt: string;
  originEn: string;
  leadTimePt: string;
  leadTimeEn: string;
  minQuantity: string;
  unitPt: string;
  unitEn: string;
  imageUrl: string;
  imagePublicId: string;
  featured: boolean;
};

const emptyForm: ProductForm = {
  namePt: "",
  nameEn: "",
  descriptionPt: "",
  descriptionEn: "",
  detailPt: "",
  detailEn: "",
  categorySlug: "",
  status: "ACTIVE",
  price: "",
  currency: "EUR",
  originPt: "",
  originEn: "",
  leadTimePt: "",
  leadTimeEn: "",
  minQuantity: "1",
  unitPt: "unidade",
  unitEn: "unit",
  imageUrl: "",
  imagePublicId: "",
  featured: false,
};

const statusLabels: Record<AdminProduct["status"], string> = {
  ACTIVE: "Publicado",
  DRAFT: "Rascunho",
  ARCHIVED: "Arquivado",
};

const currencyOptions: Array<{
  value: ProductCurrency;
  label: string;
  prefix: string;
}> = [
  { value: "AOA", label: "AOA — Kwanza angolano", prefix: "Kz" },
  { value: "USD", label: "USD — Dólar americano", prefix: "US$" },
  { value: "EUR", label: "EUR — Euro", prefix: "€" },
  { value: "STN", label: "STN — Dobra santomense", prefix: "Db" },
];

const supportedCurrencies = new Set<ProductCurrency>(
  currencyOptions.map((currency) => currency.value),
);

const fieldControlClassName = "h-12 min-h-12";
const selectTriggerClassName = "h-12 rounded border-input bg-card shadow-sm";

function formatPriceInput(value: string) {
  return maskFormatters.decimalMoney(value.replace(".", ","));
}

function parsePriceInput(value: string) {
  return Number(value.replaceAll(" ", "").replace(",", "."));
}

async function responseError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Não foi possível concluir a operação.";
}

function productToForm(product: AdminProduct): ProductForm {
  return {
    namePt: product.namePt,
    nameEn: product.nameEn,
    descriptionPt: product.descriptionPt,
    descriptionEn: product.descriptionEn,
    detailPt: product.detailPt ?? "",
    detailEn: product.detailEn ?? "",
    categorySlug: product.category.slug,
    status: product.status,
    price: formatPriceInput(product.price),
    currency: supportedCurrencies.has(product.currency as ProductCurrency)
      ? (product.currency as ProductCurrency)
      : "EUR",
    originPt: product.originPt,
    originEn: product.originEn,
    leadTimePt: product.leadTimePt,
    leadTimeEn: product.leadTimeEn,
    minQuantity: String(product.minQuantity),
    unitPt: product.unitPt,
    unitEn: product.unitEn,
    imageUrl: product.imageUrl ?? "",
    imagePublicId: product.imagePublicId ?? "",
    featured: product.featuredOrder > 0,
  };
}

export function ProductManager() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ProductCategoryRecord[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<AdminProduct | null>(null);
  const pricePrefix =
    currencyOptions.find((currency) => currency.value === form.currency)?.prefix ?? form.currency;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products?scope=manage&pageSize=100", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(await responseError(response));
      const body = (await response.json()) as { items: AdminProduct[] };
      setProducts(body.items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível carregar os produtos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch("/api/product-categories", { cache: "no-store" });
      if (!response.ok) throw new Error(await responseError(response));
      const body = (await response.json()) as { items: ProductCategoryRecord[] };
      setCategories(body.items);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível carregar as categorias.",
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadCategories();
  }, [loadCategories, loadProducts]);

  const releasePreview = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  };

  const closeForm = () => {
    releasePreview();
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const openCreate = () => {
    releasePreview();
    setEditingId(null);
    setForm({ ...emptyForm, categorySlug: categories[0]?.slug ?? "" });
    setImageFile(null);
    setImagePreview(null);
    setFormOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    releasePreview();
    setEditingId(product.id);
    setForm(productToForm(product));
    setImageFile(null);
    setImagePreview(product.imageUrl);
    setFormOpen(true);
  };

  const setField = <K extends keyof ProductForm>(field: K, value: ProductForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const chooseImage = (file: File | undefined) => {
    if (!file) return;
    releasePreview();
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (!form.categorySlug) {
        throw new Error("Crie ou selecione uma categoria antes de guardar o produto.");
      }

      let imageUrl = form.imageUrl;
      let imagePublicId = form.imagePublicId;

      if (imageFile) {
        const uploadBody = new FormData();
        uploadBody.set("file", imageFile);
        uploadBody.set("folder", "products");
        const uploadResponse = await fetch("/api/uploads/cloudinary", {
          method: "POST",
          body: uploadBody,
        });
        if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));
        const upload = (await uploadResponse.json()) as {
          image: { url: string; publicId: string };
        };
        imageUrl = upload.image.url;
        imagePublicId = upload.image.publicId;
      }

      if (!imageUrl || !imagePublicId) {
        throw new Error("Selecione uma fotografia para o produto.");
      }

      const payload = {
        namePt: form.namePt,
        nameEn: form.nameEn,
        descriptionPt: form.descriptionPt,
        descriptionEn: form.descriptionEn,
        detailPt: form.detailPt || null,
        detailEn: form.detailEn || null,
        categorySlug: form.categorySlug,
        status: form.status,
        price: parsePriceInput(form.price),
        currency: form.currency,
        originPt: form.originPt,
        originEn: form.originEn,
        leadTimePt: form.leadTimePt,
        leadTimeEn: form.leadTimeEn,
        minQuantity: Number(form.minQuantity),
        unitPt: form.unitPt,
        unitEn: form.unitEn,
        imageUrl,
        imagePublicId,
        featured: form.featured,
      };

      const response = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await responseError(response));

      toast.success(editingId ? "Produto atualizado com sucesso." : "Produto criado com sucesso.");
      closeForm();
      await loadProducts();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível guardar o produto.");
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async () => {
    if (!confirmRemove) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${confirmRemove.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      setProducts((current) => current.filter((product) => product.id !== confirmRemove.id));
      toast.success("Produto excluído do catálogo.");
      setConfirmRemove(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o produto.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div>
          <p className="text-sm font-medium">Catálogo</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Produtos publicados aparecem imediatamente na página principal e no catálogo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCategoryManagerOpen(true)}
            className="gap-2 rounded-none px-5"
          >
            <FolderTree className="size-4" /> Gerir categorias
          </Button>
          <Button onClick={openCreate} className="gap-2 rounded-none px-5">
            <Plus className="size-4" /> Novo produto
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid min-h-64 place-items-center border border-border bg-card">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="grid min-h-72 place-items-center border border-dashed border-border bg-card p-8 text-center">
          <div>
            <PackageOpen className="mx-auto size-9 text-muted-foreground" />
            <h2 className="mt-4 font-display text-3xl italic">O catálogo está pronto.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Cadastre o primeiro produto com fotografia, preço e informações em português e inglês.
            </p>
            <Button onClick={openCreate} className="mt-6 rounded-none">
              <Plus /> Criar primeiro produto
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="group grid grid-cols-[104px_minmax(0,1fr)] overflow-hidden border border-border bg-card"
            >
              <div className="relative min-h-32 bg-store-paper">
                <img
                  src={product.imageUrl ?? "/product-placeholder.svg"}
                  alt={product.namePt}
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex min-w-0 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.namePt}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {product.category.namePt} · {product.originPt}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider",
                      product.status === "ACTIVE"
                        ? "bg-store-mint text-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {statusLabels[product.status]}
                  </span>
                </div>
                <p className="mt-3 font-display text-2xl italic">
                  {formatMoney(Number(product.price), "pt", product.currency)}
                </p>
                {product.featuredOrder > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <Star className="size-3 fill-current" /> Em destaque
                  </p>
                )}
                <div className="mt-auto flex items-center justify-end gap-1 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(product)}
                    className="gap-2"
                  >
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmRemove(product)}
                    aria-label={`Excluir ${product.namePt}`}
                    title="Excluir"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? "Editar produto" : "Novo produto"}
          onClick={closeForm}
        >
          <form
            onSubmit={saveProduct}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[94vh] min-h-[min(760px,94vh)] w-full max-w-[1440px] flex-col overflow-hidden border border-border bg-background shadow-2xl"
          >
            <div className="z-10 flex shrink-0 items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur sm:px-8">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-muted-foreground">
                  Catálogo / {editingId ? "Edição" : "Novo registo"}
                </p>
                <h2 className="font-display text-3xl italic sm:text-4xl">
                  {editingId ? "Editar produto" : "Criar produto"}
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="grid min-h-0 flex-1 gap-8 overflow-y-auto p-5 sm:p-8 lg:grid-cols-[340px_minmax(0,1fr)] xl:gap-12 xl:px-10">
              <div className="lg:sticky lg:top-0 lg:self-start">
                <label className="group relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-border bg-store-paper text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Pré-visualização"
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="size-8 text-muted-foreground" />
                  )}
                  <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 bg-background/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest backdrop-blur">
                    <UploadCloud className="size-4" />{" "}
                    {imagePreview ? "Trocar fotografia" : "Enviar fotografia"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    required={!imagePreview}
                    className="sr-only"
                    onChange={(event) => chooseImage(event.target.files?.[0])}
                  />
                </label>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  JPEG, PNG, WebP ou AVIF, até 8 MB.
                </p>
                <div className="mt-6 space-y-3">
                  <SelectField
                    label="Estado"
                    value={form.status}
                    onValueChange={(value) => setField("status", value as ProductForm["status"])}
                    options={[
                      { value: "ACTIVE", label: "Publicado" },
                      { value: "DRAFT", label: "Rascunho" },
                    ]}
                    triggerClassName={selectTriggerClassName}
                  />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.featured}
                    onClick={() => setField("featured", !form.featured)}
                    className={cn(
                      "flex w-full items-center gap-3 border p-3 text-left transition-colors",
                      form.featured
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:border-foreground/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full",
                        form.featured ? "bg-background/15" : "bg-store-mint",
                      )}
                    >
                      <Star className={cn("size-4", form.featured && "fill-current")} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold">Mostrar nos destaques</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[10px]",
                          form.featured ? "text-background/70" : "text-muted-foreground",
                        )}
                      >
                        A posição é definida automaticamente.
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                        form.featured ? "bg-background/35" : "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 size-4 rounded-full bg-background shadow-sm transition-transform",
                          form.featured ? "translate-x-[18px]" : "translate-x-0.5",
                        )}
                      />
                    </span>
                  </button>
                </div>
              </div>

              <div className="min-w-0 space-y-9">
                <div className="border-b border-border pb-5">
                  <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-muted-foreground">
                    Informação do produto
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Preencha o conteúdo em português e inglês. O produto publicado será atualizado
                    imediatamente na vitrine.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nome em português"
                    required
                    value={form.namePt}
                    onChange={(event) => setField("namePt", event.target.value)}
                    controlClassName={fieldControlClassName}
                  />
                  <Input
                    label="Nome em inglês"
                    required
                    value={form.nameEn}
                    onChange={(event) => setField("nameEn", event.target.value)}
                    controlClassName={fieldControlClassName}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Resumo em português"
                    value={form.detailPt}
                    onChange={(event) => setField("detailPt", event.target.value)}
                    controlClassName={fieldControlClassName}
                  />
                  <Input
                    label="Resumo em inglês"
                    value={form.detailEn}
                    onChange={(event) => setField("detailEn", event.target.value)}
                    controlClassName={fieldControlClassName}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Textarea
                    label="Descrição em português"
                    required
                    rows={4}
                    value={form.descriptionPt}
                    onChange={(event) => setField("descriptionPt", event.target.value)}
                    textareaClassName="min-h-32"
                  />
                  <Textarea
                    label="Descrição em inglês"
                    required
                    rows={4}
                    value={form.descriptionEn}
                    onChange={(event) => setField("descriptionEn", event.target.value)}
                    textareaClassName="min-h-32"
                  />
                </div>
                <div className="border-t border-border pt-7">
                  <p className="mb-5 text-[9px] font-semibold uppercase tracking-[.24em] text-muted-foreground">
                    Condições comerciais
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)]">
                    <SelectField
                      label="Categoria"
                      value={form.categorySlug}
                      onValueChange={(value) => setField("categorySlug", value)}
                      options={categories.map((category) => ({
                        value: category.slug,
                        label: category.namePt,
                      }))}
                      triggerClassName={selectTriggerClassName}
                    />
                    <SelectField
                      label="Moeda"
                      value={form.currency}
                      onValueChange={(value) =>
                        setField("currency", value as ProductForm["currency"])
                      }
                      options={currencyOptions.map(({ value, label }) => ({ value, label }))}
                      triggerClassName={selectTriggerClassName}
                    />
                    <MaskedInput
                      label="Preço"
                      inputMode="decimal"
                      prefix={pricePrefix}
                      mask={maskFormatters.decimalMoney}
                      maxLength={18}
                      required
                      value={form.price}
                      onChange={(event) => setField("price", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                  </div>
                </div>
                <div className="border-t border-border pt-7">
                  <p className="mb-5 text-[9px] font-semibold uppercase tracking-[.24em] text-muted-foreground">
                    Logística e fornecimento
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Origem em português"
                      required
                      value={form.originPt}
                      onChange={(event) => setField("originPt", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                    <Input
                      label="Origem em inglês"
                      required
                      value={form.originEn}
                      onChange={(event) => setField("originEn", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Prazo em português"
                      required
                      placeholder="Ex.: 4–6 semanas"
                      value={form.leadTimePt}
                      onChange={(event) => setField("leadTimePt", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                    <Input
                      label="Prazo em inglês"
                      required
                      placeholder="E.g. 4–6 weeks"
                      value={form.leadTimeEn}
                      onChange={(event) => setField("leadTimeEn", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <MaskedInput
                      label="Quantidade mínima"
                      inputMode="numeric"
                      mask={maskFormatters.integer}
                      maxLength={9}
                      suffix="un."
                      required
                      value={form.minQuantity}
                      onChange={(event) => setField("minQuantity", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                    <Input
                      label="Unidade em português"
                      required
                      value={form.unitPt}
                      onChange={(event) => setField("unitPt", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                    <Input
                      label="Unidade em inglês"
                      required
                      value={form.unitEn}
                      onChange={(event) => setField("unitEn", event.target.value)}
                      controlClassName={fieldControlClassName}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-background/95 px-5 py-4 backdrop-blur sm:px-8 mt-4">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4" /> Produtos publicados ficam visíveis na loja.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="min-w-36 rounded-none">
                  {saving && <LoaderCircle className="animate-spin" />}
                  {saving ? "A guardar..." : editingId ? "Guardar alterações" : "Criar produto"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      <CategoryManager
        open={categoryManagerOpen}
        categories={categories}
        loading={categoriesLoading}
        onOpenChange={setCategoryManagerOpen}
        onReload={loadCategories}
      />

      <AlertDialog
        open={confirmRemove !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setConfirmRemove(null);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-none p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-3xl font-normal italic">
              Excluir produto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmRemove?.namePt}” será removido da página principal, do catálogo e do banco. A
              fotografia também será eliminada do Cloudinary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void removeProduct()} disabled={deleting}>
              {deleting && <LoaderCircle className="animate-spin" />}
              Excluir definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
