"use client";

import { useBrandsPaged } from "@/hooks/use-brands-paged";
import type { Brand } from "@/types/brand";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";

export type BrandRowAction =
  | {
      key: string;
      label: string;
      href: string;
      onClick?: never;
      icon?: ReactNode;
      disabled?: boolean;
    }
  | {
      key: string;
      label: string;
      href?: never;
      onClick: (brand: Brand) => void;
      icon?: ReactNode;
      disabled?: boolean;
    };

function getParamInt(
  value: string | null,
  { fallback, min, max }: { fallback: number; min: number; max: number },
) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function TableRow({
  brand,
  actions,
}: {
  brand: Brand;
  actions: BrandRowAction[];
}) {
  return (
    <tr className="border-b border-[color-mix(in_srgb,var(--foreground)_10%,transparent)]">
      <td className="whitespace-nowrap px-3 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-(--brand-primary)">
            {brand.name}
          </div>
          <div className="truncate text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
            {brand.slug}
          </div>
        </div>
      </td>
      <td className="max-w-48 px-3 py-3 text-sm text-[color-mix(in_srgb,var(--foreground)_75%,transparent)]">
        {brand.logo_url ? (
          <span className="block truncate font-mono text-xs" title={brand.logo_url}>
            {brand.logo_url}
          </span>
        ) : (
          <span className="text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
            —
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
        {new Date(brand.created_at).toLocaleDateString("es-DO")}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        {actions.length ? (
          <div className="flex items-center justify-end gap-2">
            {actions.map((action) => {
              const baseClassName =
                "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition disabled:opacity-50";
              const className = `${baseClassName} border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)]`;

              return "href" in action ? (
                <Link
                  key={action.key}
                  href={action.href || ""}
                  aria-label={action.label}
                  className={className}
                >
                  {action.icon}
                  {action.label}
                </Link>
              ) : (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => action.onClick(brand)}
                  aria-label={action.label}
                  className={className}
                  disabled={action.disabled}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-right text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
            —
          </div>
        )}
      </td>
    </tr>
  );
}

export default function BrandsPageClient({
  actions = [],
}: {
  actions?: BrandRowAction[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const page = getParamInt(searchParams.get("page"), {
    fallback: 1,
    min: 1,
    max: 1_000_000,
  });
  const pageSize = getParamInt(searchParams.get("pageSize"), {
    fallback: 10,
    min: 5,
    max: 100,
  });
  const q = (searchParams.get("q") ?? "").trim();

  const { brands, total, totalPages, isLoading, error } = useBrandsPaged({
    page,
    pageSize,
    query: q,
  });

  const [searchDraft, setSearchDraft] = useState(q);

  const pageNumbers = useMemo(() => {
    const radius = 2;
    const start = Math.max(1, page - radius);
    const end = Math.min(totalPages, page + radius);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }, [page, totalPages]);

  function pushParams(next: Record<string, string | number | null>) {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") sp.delete(key);
      else sp.set(key, String(value));
    }
    startTransition(() => {
      router.push(`${pathname}?${sp.toString()}`);
    });
  }

  function goToPage(nextPage: number) {
    pushParams({ page: nextPage });
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-(--brand-primary)">
            Marcas
          </h1>
          <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
            {isLoading ? "Cargando…" : `${total} resultado(s)`}
            {q ? ` para “${q}”` : ""}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
              Buscar
            </label>
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushParams({
                    q: searchDraft.trim() || null,
                    page: 1,
                  });
                }
              }}
              placeholder="Nombre o slug…"
              className="h-9 w-full rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] bg-(--background) px-3 text-sm text-(--foreground) outline-none focus:border-[color-mix(in_srgb,var(--brand-gold)_60%,var(--brand-primary))] sm:w-72"
            />
            <button
              type="button"
              onClick={() => pushParams({ q: searchDraft.trim() || null, page: 1 })}
              className="h-9 rounded-lg border border-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] bg-(--background) px-3 text-sm font-semibold text-(--brand-primary) transition hover:bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]"
              disabled={isPending}
            >
              Aplicar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
              Por página
            </label>
            <select
              value={pageSize}
              onChange={(e) =>
                pushParams({
                  pageSize: Number(e.target.value),
                  page: 1,
                })
              }
              className="h-9 rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] bg-(--background) px-2 text-sm"
            >
              {[5, 10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/brands/create")}
            className="h-9 rounded-lg border border-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] bg-(--background) px-3 text-sm font-semibold text-(--brand-primary) transition hover:bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]"
          >
            Crear marca
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-(--background)">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)]">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[color-mix(in_srgb,var(--foreground)_65%,transparent)]">
                <th className="px-3 py-3">Marca</th>
                <th className="px-3 py-3">Logo (URL)</th>
                <th className="px-3 py-3">Creado</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-10 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]"
                  >
                    Cargando marcas…
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-10 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]"
                  >
                    No hay marcas para mostrar.
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <TableRow key={b.id} brand={b} actions={actions} />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
            Página <span className="font-semibold text-(--foreground)">{page}</span>{" "}
            de{" "}
            <span className="font-semibold text-(--foreground)">{totalPages}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isPending}
              className="h-9 rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] bg-(--background) px-3 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] transition enabled:hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)] disabled:opacity-50"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers[0] && pageNumbers[0] > 1 ? (
                <>
                  <Link
                    href={`${pathname}?${new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      page: "1",
                    }).toString()}`}
                    className="grid h-9 min-w-9 place-items-center rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] px-2 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)]"
                  >
                    1
                  </Link>
                  <span className="px-1 text-sm text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
                    …
                  </span>
                </>
              ) : null}

              {pageNumbers.map((n) => {
                const active = n === page;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => goToPage(n)}
                    disabled={isPending}
                    className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-semibold transition ${
                      active
                        ? "border-[color-mix(in_srgb,var(--brand-primary)_18%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] text-(--brand-primary)"
                        : "border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)]"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}

              {pageNumbers[pageNumbers.length - 1] &&
              pageNumbers[pageNumbers.length - 1] < totalPages ? (
                <>
                  <span className="px-1 text-sm text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
                    …
                  </span>
                  <button
                    type="button"
                    onClick={() => goToPage(totalPages)}
                    disabled={isPending}
                    className="grid h-9 min-w-9 place-items-center rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] px-2 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)]"
                  >
                    {totalPages}
                  </button>
                </>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isPending}
              className="h-9 rounded-lg border border-[color-mix(in_srgb,var(--foreground)_14%,transparent)] bg-(--background) px-3 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] transition enabled:hover:bg-[color-mix(in_srgb,var(--brand-gold)_10%,transparent)] disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
