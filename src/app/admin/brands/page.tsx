import { Suspense } from "react";
import BrandsPageClient from "./brands-page-client";

export default function BrandsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-(--background) px-4 py-10 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
          Cargando…
        </div>
      }
    >
      <BrandsPageClient />
    </Suspense>
  );
}
