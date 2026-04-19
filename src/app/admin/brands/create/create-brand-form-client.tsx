"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

export default function CreateBrandFormClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slugManual, setSlugManual] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugAuto = useMemo(() => slugify(name), [name]);
  const slug = slugTouched ? slugManual : slugAuto;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin/brands"
            className="mb-1 inline-flex text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] transition hover:text-(--brand-primary)"
          >
            ← Volver a marcas
          </Link>
          <h1 className="text-lg font-semibold tracking-tight text-(--brand-primary)">
            Crear marca
          </h1>
          <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
            Nombre y slug son obligatorios. El slug se genera a partir del nombre
            si no lo editas.
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const trimmedName = name.trim();
          const finalSlug = (slugTouched ? slugManual : slugAuto)
            .trim()
            .toLowerCase();
          if (!trimmedName || !finalSlug) {
            setError("Indica un nombre válido (el slug no puede quedar vacío).");
            return;
          }
          setSubmitting(true);
          const supabase = createClient();
          const { error: insertError } = await supabase.from("brands").insert({
            name: trimmedName,
            slug: finalSlug,
            logo_url: logoUrl.trim() || null,
          });
          setSubmitting(false);
          if (insertError) {
            setError(insertError.message);
            return;
          }
          router.push("/admin/brands");
          router.refresh();
        }}
        noValidate
      >
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-(--background) p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-(--brand-primary)">
            Datos
          </h2>
          <div className="flex flex-col gap-4 sm:max-w-lg">
            <div>
              <label htmlFor="brand-name" className={labelClass}>
                Nombre
              </label>
              <input
                id="brand-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 ${inputClass}`}
                autoComplete="organization"
              />
            </div>
            <div>
              <label htmlFor="brand-slug" className={labelClass}>
                Slug
              </label>
              <input
                id="brand-slug"
                name="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlugManual(e.target.value);
                }}
                className={`mt-1 font-mono text-sm ${inputClass}`}
                placeholder={slugAuto}
              />
            </div>
            <div>
              <label htmlFor="brand-logo" className={labelClass}>
                URL del logo (opcional)
              </label>
              <input
                id="brand-logo"
                name="logo_url"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className={`mt-1 ${inputClass}`}
                placeholder="https://…"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/admin/brands"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] px-4 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] px-4 text-sm font-semibold text-(--brand-primary) transition hover:bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)] disabled:opacity-60"
          >
            {submitting ? "Guardando…" : "Crear marca"}
          </button>
        </div>
      </form>
    </section>
  );
}
