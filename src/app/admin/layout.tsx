import { AdminNavbar } from "@/components/admin-navbar";
import { ProductsProvider } from "@/contexts/products-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[color-mix(in_srgb,var(--background)_96%,var(--brand-gold))] font-sans">
      <AdminNavbar />
      <ProductsProvider>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
      </ProductsProvider>
    </div>
  );
}