"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePanelLocale } from "@/components/panel-locale";
import { Input, MaskedInput, maskFormatters } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Company = {
  id: string;
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  countryCode: string;
};

type CompanyForm = {
  name: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
};

const emptyForm: CompanyForm = {
  name: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
};

const copy = {
  pt: {
    loadError: "Não foi possível carregar a empresa.",
    saveError: "Não foi possível guardar os dados da empresa.",
    savedToast: "Dados da empresa guardados.",
    completeTitle: "Complete a empresa para pedir a cotação.",
    completeText: "Estes dados identificam a empresa compradora e serão associados aos seus pedidos.",
    profile: "Perfil empresarial",
    active: "Ativo",
    newProfile: "Novo perfil",
    heroTitle: "A base de cada cotação.",
    heroText:
      "Centralize a identificação e os contactos usados pela equipa para preparar propostas, documentos e entregas.",
    completion: "Preenchimento do perfil",
    completionHint: "Nome da empresa é obrigatório. Os demais dados agilizam a análise.",
    protected: "Dados protegidos",
    editable: "Editável a qualquer momento",
    identification: "Identificação e contacto",
    companyData: "Dados da empresa",
    requiredHint: "Campos marcados com * são necessários para criar uma cotação.",
    companyName: "Nome da empresa *",
    companyPlaceholder: "Nome comercial ou razão social",
    taxId: "Número fiscal",
    taxPlaceholder: "Número de identificação fiscal",
    email: "E-mail da empresa",
    phone: "Telefone / WhatsApp",
    phoneTitle: "Introduza os sete dígitos do número de São Tomé e Príncipe.",
    country: "País",
    countryName: "São Tomé e Príncipe",
    address: "Morada",
    addressPlaceholder: "Distrito, cidade, rua e referência para entrega",
    saved: "Alterações guardadas.",
    review: "Revise os dados antes de guardar.",
    back: "Voltar ao produto",
    saving: "A guardar…",
    save: "Guardar alterações",
    create: "Criar perfil",
  },
  en: {
    loadError: "Company details could not be loaded.",
    saveError: "Company details could not be saved.",
    savedToast: "Company details saved.",
    completeTitle: "Complete your company profile to request a quote.",
    completeText: "These details identify the purchasing company and will be linked to your requests.",
    profile: "Company profile",
    active: "Active",
    newProfile: "New profile",
    heroTitle: "The foundation of every quote.",
    heroText:
      "Keep the identification and contact details our team uses to prepare proposals, documents and deliveries in one place.",
    completion: "Profile completion",
    completionHint: "Company name is required. The other details speed up the review.",
    protected: "Protected data",
    editable: "Editable at any time",
    identification: "Identification and contact",
    companyData: "Company details",
    requiredHint: "Fields marked with * are required to create a quote.",
    companyName: "Company name *",
    companyPlaceholder: "Trading or registered company name",
    taxId: "Tax number",
    taxPlaceholder: "Tax identification number",
    email: "Company email",
    phone: "Phone / WhatsApp",
    phoneTitle: "Enter the seven digits of the São Tomé and Príncipe number.",
    country: "Country",
    countryName: "São Tomé and Príncipe",
    address: "Address",
    addressPlaceholder: "District, city, street and delivery reference",
    saved: "Changes saved.",
    review: "Review the details before saving.",
    back: "Back to product",
    saving: "Saving…",
    save: "Save changes",
    create: "Create profile",
  },
};

const safeReturnPath = (value: string | null) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : null;

export function CompanyProfile({
  returnTo,
  onSaved,
}: {
  returnTo?: string | null;
  onSaved?: (company: Company) => void;
}) {
  const router = useRouter();
  const locale = usePanelLocale();
  const t = copy[locale];
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const nextPath = safeReturnPath(returnTo ?? null);
  const completedFields = Object.values(form).filter((value) => value.trim().length > 0).length;
  const completion = Math.round((completedFields / Object.keys(form).length) * 100);

  const loadCompany = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/company", { cache: "no-store" });
      const body = (await response.json()) as { company?: Company | null; error?: string };
      if (!response.ok) throw new Error(body.error ?? t.loadError);
      if (body.company) {
        setHasCompany(true);
        setForm({
          name: body.company.name,
          taxId: body.company.taxId ?? "",
          email: body.company.email ?? "",
          phone: maskFormatters.stpPhone((body.company.phone ?? "").replace(/^\+\d{1,3}\s*/, "")),
          address: body.company.address ?? "",
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.loadError);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    void loadCompany();
  }, [loadCompany]);

  const update = (field: keyof CompanyForm, value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/account/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          taxId: form.taxId || null,
          email: form.email || null,
          phone: form.phone ? `+239 ${form.phone}` : null,
          address: form.address || null,
          countryCode: "ST",
        }),
      });
      const body = (await response.json()) as { company?: Company; error?: string };
      if (!response.ok || !body.company) {
        throw new Error(body.error ?? t.saveError);
      }

      setSaved(true);
      setHasCompany(true);
      onSaved?.(body.company);
      router.refresh();
      toast.success(t.savedToast);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t.saveError,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[520px] w-full place-items-center border border-border bg-card">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {nextPath && (
        <div className="mb-6 flex gap-4 border border-border bg-store-mint/55 p-5 sm:items-center sm:px-7">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-background">
            <Building2 className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">{t.completeTitle}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{t.completeText}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={submit}
        className="grid w-full overflow-hidden border border-border bg-card xl:min-h-[610px] xl:grid-cols-[minmax(300px,.72fr)_minmax(0,1.28fr)]"
      >
        <aside className="relative flex overflow-hidden border-b border-border bg-store-paper p-6 sm:p-9 xl:border-b-0 xl:border-r xl:p-10">
          <div className="absolute -right-36 -top-32 size-80 rounded-full border border-border bg-store-mint/65" />
          <div className="absolute right-12 top-16 size-2.5 rounded-full bg-primary" />

          <div className="relative z-10 flex w-full flex-col">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-medium uppercase tracking-[.26em] text-muted-foreground">
                {t.profile}
              </p>
              <span className="border border-border bg-background/80 px-3 py-1 text-[9px] uppercase tracking-widest backdrop-blur-sm">
                {hasCompany ? t.active : t.newProfile}
              </span>
            </div>

            <div className="mt-20 max-w-md xl:mt-28">
              <h2 className="font-display text-5xl font-normal italic leading-[.95] sm:text-6xl xl:text-[4.5rem]">
                {t.heroTitle}
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">
                {t.heroText}
              </p>
            </div>

            <div className="mt-12 xl:mt-auto">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[.22em] text-muted-foreground">
                    {t.completion}
                  </p>
                  <p className="mt-2 font-display text-4xl italic">{completion}%</p>
                </div>
                <p className="max-w-36 text-right text-[10px] leading-5 text-muted-foreground">
                  {t.completionHint}
                </p>
              </div>
              <div className="mt-4 h-1 overflow-hidden bg-background">
                <div
                  className="h-full bg-primary transition-[width] duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <div className="mt-7 grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-3 xl:grid-cols-1">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-foreground" /> {t.protected}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-foreground" /> {t.countryName}
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-foreground" /> {t.editable}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-border px-5 py-6 sm:px-8 sm:py-8 xl:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[.24em] text-muted-foreground">
                  {t.identification}
                </p>
                <h3 className="mt-2 font-display text-3xl font-normal italic sm:text-4xl">
                  {t.companyData}
                </h3>
              </div>
              <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                {t.requiredHint}
              </p>
            </div>
          </header>

          <div className="grid flex-1 gap-x-8 gap-y-8 p-5 sm:grid-cols-2 sm:p-8 xl:p-10">
            <Input
              label={t.companyName}
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              required
              minLength={2}
              maxLength={200}
              autoComplete="organization"
              placeholder={t.companyPlaceholder}
              className="sm:col-span-2"
              controlClassName="h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            />
            <MaskedInput
              label={t.taxId}
              value={form.taxId}
              onChange={(event) => update("taxId", event.target.value)}
              mask={maskFormatters.integer}
              inputMode="numeric"
              maxLength={20}
              placeholder={t.taxPlaceholder}
              controlClassName="h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            />
            <Input
              label={t.email}
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              maxLength={255}
              autoComplete="email"
              placeholder="compras@empresa.com"
              controlClassName="h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            />
            <MaskedInput
              label={t.phone}
              prefix="+239"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              mask={maskFormatters.stpPhone}
              inputMode="numeric"
              autoComplete="tel"
              maxLength={8}
              pattern="[0-9]{3} [0-9]{4}"
              title={t.phoneTitle}
              placeholder="990 0000"
              controlClassName="h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            />
            <Input
              label={t.country}
              value={t.countryName}
              disabled
              controlClassName="h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
            />
            <Textarea
              label={t.address}
              value={form.address}
              onChange={(event) => update("address", event.target.value)}
              rows={3}
              maxLength={5000}
              placeholder={t.addressPlaceholder}
              className="sm:col-span-2"
              textareaClassName="min-h-28 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus:ring-0"
            />
          </div>

          <footer className="flex flex-col gap-4 border-t border-border bg-store-paper/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 xl:px-10">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {saved ? (
                <>
                  <CheckCircle2 className="size-4 text-primary" /> {t.saved}
                </>
              ) : (
                t.review
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              {saved && nextPath && (
                <Button asChild variant="outline" className="h-11 rounded-none">
                  <Link href={nextPath}>
                    {t.back} <ArrowRight />
                  </Link>
                </Button>
              )}
              <Button type="submit" disabled={saving} className="h-11 rounded-none px-7">
                {saving && <LoaderCircle className="animate-spin" />}
                {saving ? t.saving : hasCompany ? t.save : t.create}
              </Button>
            </div>
          </footer>
        </div>
      </form>
    </div>
  );
}
