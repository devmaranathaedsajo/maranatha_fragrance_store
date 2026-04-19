"use client";

import { createProductWithFragranceFamilies } from "@/lib/products/create-product-in-supabase";
import { createClient } from "@/lib/supabase/client";
import { Gender, type ProductInsert } from "@/types/product";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: Gender.MEN, label: "Hombre" },
  { value: Gender.WOMEN, label: "Mujer" },
  { value: Gender.UNISEX, label: "Unisex" },
];

const inputClass =
  "h-10 w-full rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] bg-(--background) px-3 text-sm text-(--foreground) outline-none focus:border-[color-mix(in_srgb,var(--brand-gold)_60%,var(--brand-primary))]";

const labelClass =
  "text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
}

type SubmitCreateProductInput = {
  productName: string;
  productSlug: string;
  sku: string;
  shortDescription: string;
  description: string;
  gender: "" | Gender;
  brandId: string;
  isFeatured: boolean;
  selectedFragranceFamilyIds: string[];
};

type SubmitCreateProductResult =
  | { ok: true }
  | { ok: false; error: string };

async function submitCreateProductForm(
  input: SubmitCreateProductInput,
): Promise<SubmitCreateProductResult> {
  const trimmedName = input.productName.trim();
  const finalSlug = input.productSlug.trim().toLowerCase();
  const finalSku =
    input.sku.trim() ||
    finalSlug.replace(/-/g, "_").toUpperCase() ||
    "SIN-SKU";

  if (!trimmedName) {
    return { ok: false, error: "Indica un nombre para el producto." };
  }
  if (!finalSlug) {
    return {
      ok: false,
      error:
        "El slug no puede quedar vacío; revisa el nombre del producto.",
    };
  }

  const product: ProductInsert = {
    name: trimmedName,
    slug: finalSlug,
    sku: finalSku,
    short_description: input.shortDescription.trim() || null,
    description: input.description.trim() || null,
    gender:
      input.gender !== "" &&
      (Object.values(Gender) as string[]).includes(input.gender)
        ? input.gender
        : null,
    brand_id: input.brandId.trim() || null,
    category_id: null,
    is_featured: input.isFeatured,
    is_active: true,
  };

  const supabase = createClient();
  const result = await createProductWithFragranceFamilies(
    supabase,
    product,
    input.selectedFragranceFamilyIds,
  );

  if (result.error) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true };
}

export default function CreateProductFormClient() {
  const router = useRouter();
  const [fragranceFamilies, setFragranceFamilies] = useState<
    { id: string; name: string }[]
  >([]);
  const [fragranceFamiliesLoading, setFragranceFamiliesLoading] = useState(true);
  const [fragranceFamiliesError, setFragranceFamiliesError] = useState<
    string | null
  >(null);
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState<"" | Gender>("");
  const [brandId, setBrandId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [selectedFragranceFamilyIds, setSelectedFragranceFamilyIds] = useState<
    string[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void (async () => {
      setFragranceFamiliesLoading(true);
      setFragranceFamiliesError(null);
      setBrandsLoading(true);
      setBrandsError(null);

      const [ffRes, brandRes] = await Promise.all([
        supabase
          .from("fragrance_families")
          .select("id, name")
          .order("name", { ascending: true }),
        supabase
          .from("brands")
          .select("id, name")
          .order("name", { ascending: true }),
      ]);

      if (!active) return;

      if (ffRes.error) {
        setFragranceFamiliesError(ffRes.error.message);
        setFragranceFamilies([]);
      } else {
        setFragranceFamilies(
          (ffRes.data as { id: string; name: string }[]) ?? [],
        );
      }
      setFragranceFamiliesLoading(false);

      if (brandRes.error) {
        setBrandsError(brandRes.error.message);
        setBrands([]);
      } else {
        setBrands((brandRes.data as { id: string; name: string }[]) ?? []);
      }
      setBrandsLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const productSlug = useMemo(() => slugify(productName), [productName]);

  function toggleFragranceFamily(id: string) {
    setSelectedFragranceFamilyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin/products"
            className="mb-1 inline-flex text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] transition hover:text-(--brand-primary)"
          >
            ← Volver a productos
          </Link>
          <h1 className="text-lg font-semibold tracking-tight text-(--brand-primary)">
            Crear producto
          </h1>
          <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
            Precio y stock se pueden completar después; por ahora se guardan en 0.
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form
        className="space-y-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            const outcome = await submitCreateProductForm({
              productName,
              productSlug,
              sku,
              shortDescription,
              description,
              gender,
              brandId,
              isFeatured,
              selectedFragranceFamilyIds,
            });
            if (!outcome.ok) {
              setError(outcome.error);
              return;
            }
            router.push("/admin/products");
            router.refresh();
          } finally {
            setSubmitting(false);
          }
        }}
        noValidate
      >
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-(--background) p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-(--brand-primary)">
            Identificación
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="product-name" className={labelClass}>
                Nombre
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                autoComplete="off"
                placeholder="Ej. Eau de parfum Aurora"
                className={inputClass}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="product-slug" className={labelClass}>
                Slug
              </label>
              <input
                id="product-slug"
                name="slug"
                type="text"
                autoComplete="off"
                readOnly
                value={productSlug}
                placeholder="eau-de-parfum-aurora"
                className={`${inputClass} font-mono text-xs`}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="product-sku" className={labelClass}>
                SKU
              </label>
              <input
                id="product-sku"
                name="sku"
                type="text"
                autoComplete="off"
                placeholder="SKU-0001 (opcional: se genera desde el slug)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={`${inputClass} font-mono text-xs`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-(--background) p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-(--brand-primary)">
            Descripciones
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="product-short-desc" className={labelClass}>
                Descripción corta{" "}
                <span className="font-normal text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
                  (opcional)
                </span>
              </label>
              <textarea
                id="product-short-desc"
                name="short_description"
                rows={2}
                placeholder="Resumen para listados y tarjetas"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className={`${inputClass} min-h-18 resize-y py-2`}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="product-desc" className={labelClass}>
                Descripción{" "}
                <span className="font-normal text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
                  (opcional)
                </span>
              </label>
              <textarea
                id="product-desc"
                name="description"
                rows={5}
                placeholder="Detalle completo del producto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} min-h-32 resize-y py-2`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-(--background) p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-(--brand-primary)">
            Clasificación
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="product-gender" className={labelClass}>
                Género{" "}
              </label>
              <select
                id="product-gender"
                name="gender"
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as "" | Gender)
                }
                className={inputClass}
              >
                <option value="">Sin especificar</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="product-brand" className={labelClass}>
                Marca{" "}
                <span className="font-normal text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
                  (opcional)
                </span>
              </label>
              {brandsError ? (
                <p
                  className="text-xs text-red-600 dark:text-red-400"
                  role="alert"
                >
                  No se pudieron cargar las marcas: {brandsError}
                </p>
              ) : null}
              <select
                id="product-brand"
                name="brand_id"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                disabled={brandsLoading}
                aria-busy={brandsLoading}
                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <option value="">
                  {brandsLoading ? "Cargando marcas…" : "Sin marca"}
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className={labelClass}>Familias olfativas</span>
            <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_50%,transparent)]">
              Selecciona una o varias familias olfativas; se vincularán al
              guardar el producto.
            </p>
            {fragranceFamiliesError ? (
              <p
                className="text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                No se pudieron cargar las familias olfativas:{" "}
                {fragranceFamiliesError}
              </p>
            ) : null}
            <ul
              className="max-h-48 space-y-2 overflow-auto rounded-lg border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-[color-mix(in_srgb,var(--brand-gold)_6%,transparent)] p-3"
              role="group"
              aria-label="Familias olfativas del producto"
              aria-busy={fragranceFamiliesLoading}
            >
              {fragranceFamiliesLoading ? (
                <li className="px-2 py-2 text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                  Cargando familias olfativas…
                </li>
              ) : fragranceFamilies.length === 0 && !fragranceFamiliesError ? (
                <li className="px-2 py-2 text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                  No hay familias olfativas en el catálogo.
                </li>
              ) : (
                fragranceFamilies.map((f) => {
                  const checked = selectedFragranceFamilyIds.includes(f.id);
                  return (
                    <li key={f.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm transition hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]">
                        <input
                          type="checkbox"
                          name="fragrance_family_ids"
                          value={f.id}
                          checked={checked}
                          onChange={() => toggleFragranceFamily(f.id)}
                          className="size-4 rounded border-[color-mix(in_srgb,var(--foreground)_25%,transparent)] text-(--brand-primary) focus:ring-(--brand-gold)"
                        />
                        <span className="text-[color-mix(in_srgb,var(--foreground)_85%,transparent)]">
                          {f.name}
                        </span>
                      </label>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-(--background) p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-(--brand-primary)">
            Visibilidad
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="is_featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="size-4 rounded border-[color-mix(in_srgb,var(--foreground)_25%,transparent)] text-(--brand-primary) focus:ring-(--brand-gold)"
              />
              <span>Producto destacado</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/products"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] px-4 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] px-4 text-sm font-semibold text-(--brand-primary) transition hover:bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)] disabled:opacity-60"
          >
            {submitting ? "Guardando…" : "Crear producto"}
          </button>
        </div>
      </form>
    </section>
  );
}
