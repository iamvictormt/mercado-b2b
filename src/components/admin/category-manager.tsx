"use client";

import { FolderTree, LoaderCircle, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProductCategoryRecord } from "@/lib/product-categories";
import { cn } from "@/lib/utils";

type CategoryManagerProps = {
  open: boolean;
  categories: ProductCategoryRecord[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onReload: () => Promise<void>;
};

type CategoryForm = { namePt: string; nameEn: string };

const emptyForm: CategoryForm = { namePt: "", nameEn: "" };

async function responseError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Não foi possível concluir a operação.";
}

export function CategoryManager({
  open,
  categories,
  loading,
  onOpenChange,
  onReload,
}: CategoryManagerProps) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<ProductCategoryRecord | null>(null);

  useEffect(() => {
    if (!open) {
      setEditingSlug(null);
      setForm(emptyForm);
      setConfirmRemove(null);
    }
  }, [open]);

  const startCreate = () => {
    setEditingSlug(null);
    setForm(emptyForm);
  };

  const startEdit = (category: ProductCategoryRecord) => {
    setEditingSlug(category.slug);
    setForm({ namePt: category.namePt, nameEn: category.nameEn });
  };

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(
        editingSlug ? `/api/product-categories/${editingSlug}` : "/api/product-categories",
        {
          method: editingSlug ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!response.ok) throw new Error(await responseError(response));

      toast.success(editingSlug ? "Categoria atualizada." : "Categoria criada.");
      await onReload();
      startCreate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível guardar a categoria.");
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async () => {
    if (!confirmRemove) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/product-categories/${confirmRemove.slug}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await responseError(response));

      toast.success("Categoria excluída.");
      if (editingSlug === confirmRemove.slug) startCreate();
      setConfirmRemove(null);
      await onReload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a categoria.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-5xl gap-0 overflow-hidden rounded-none p-0">
          <DialogHeader className="border-b border-border px-6 py-5 pr-14 sm:px-8">
            <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-muted-foreground">
              Organização do catálogo
            </p>
            <DialogTitle className="font-display text-4xl font-normal italic">
              Categorias de produto
            </DialogTitle>
            <DialogDescription>
              Crie grupos claros para o catálogo. O identificador técnico é gerado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-0 overflow-y-auto lg:grid-cols-[1.1fr_.9fr]">
            <div className="border-b border-border p-5 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Categorias existentes</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCreate}
                  className="rounded-none"
                >
                  <Plus /> Nova
                </Button>
              </div>

              {loading ? (
                <div className="grid min-h-48 place-items-center border border-border">
                  <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : categories.length === 0 ? (
                <div className="grid min-h-48 place-items-center border border-dashed border-border p-8 text-center">
                  <div>
                    <FolderTree className="mx-auto size-7 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">Crie a primeira categoria.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-border border-y border-border">
                  {categories.map((category) => (
                    <div
                      key={category.slug}
                      className={cn(
                        "flex items-center gap-4 px-1 py-4",
                        editingSlug === category.slug && "bg-store-paper",
                      )}
                    >
                      <div className="min-w-0 flex-1 px-3">
                        <p className="truncate text-sm font-medium">{category.namePt}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {category.nameEn} · {category._count.products}{" "}
                          {category._count.products === 1 ? "produto" : "produtos"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(category)}
                        aria-label={`Editar ${category.namePt}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={category._count.products > 0}
                        onClick={() => setConfirmRemove(category)}
                        aria-label={`Excluir ${category.namePt}`}
                        title={
                          category._count.products > 0
                            ? "Mova os produtos antes de excluir"
                            : "Excluir categoria"
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={saveCategory} className="flex flex-col bg-store-paper/45 p-5 sm:p-8">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[.24em] text-muted-foreground">
                  {editingSlug ? "Editar categoria" : "Nova categoria"}
                </p>
                <h3 className="mt-2 font-display text-3xl italic">
                  {editingSlug ? "Ajustar nomes" : "Adicionar ao catálogo"}
                </h3>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Use nomes curtos e fáceis de reconhecer nos filtros da loja.
                </p>
              </div>
              <div className="mt-8 space-y-5">
                <Input
                  label="Nome em português"
                  required
                  value={form.namePt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, namePt: event.target.value }))
                  }
                  controlClassName="h-12 min-h-12"
                />
                <Input
                  label="Nome em inglês"
                  required
                  value={form.nameEn}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, nameEn: event.target.value }))
                  }
                  controlClassName="h-12 min-h-12"
                />
              </div>
              {editingSlug && (
                <p className="mt-4 text-[11px] text-muted-foreground">
                  Identificador: <span className="font-mono">{editingSlug}</span>
                </p>
              )}
              <div className="mt-8 flex flex-wrap justify-end gap-2 lg:mt-auto lg:pt-12">
                {editingSlug && (
                  <Button type="button" variant="outline" onClick={startCreate} disabled={saving}>
                    Cancelar edição
                  </Button>
                )}
                <Button type="submit" disabled={saving} className="min-w-36 rounded-none">
                  {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
                  {saving ? "A guardar..." : editingSlug ? "Guardar nomes" : "Criar categoria"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmRemove !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deleting) setConfirmRemove(null);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-none p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-3xl font-normal italic">
              Excluir categoria?
            </AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmRemove?.namePt}” será removida definitivamente. Esta ação só é permitida para
              categorias sem produtos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void removeCategory()} disabled={deleting}>
              {deleting && <LoaderCircle className="animate-spin" />}
              Excluir categoria
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
