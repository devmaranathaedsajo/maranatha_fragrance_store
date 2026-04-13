export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-(--brand-primary) px-6 py-16 font-sans">
      <main className="w-full max-w-lg rounded-2xl border border-[color-mix(in_srgb,var(--brand-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--background)_96%,var(--brand-gold))] px-10 py-14 text-center shadow-[0_25px_80px_-20px_rgba(0,0,0,0.45)] sm:px-12 sm:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-(--brand-gold)">
          Maranatha EdSaJo
        </p>
        <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-(--brand-primary) sm:text-3xl">
          Estamos construyendo nuestra nueva web
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[color-mix(in_srgb,var(--foreground)_75%,transparent)]">
          Muy pronto podrás descubrir nuestra colección con la misma elegancia
          que define cada fragancia.
        </p>
        <div
          className="mx-auto mt-10 h-px w-16 bg-(--brand-gold) sm:mx-0"
          aria-hidden
        />
        <p className="mt-6 text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
          Vuelve pronto.
        </p>
      </main>
    </div>
  );
}
