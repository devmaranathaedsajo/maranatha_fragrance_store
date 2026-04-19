"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    { href: "/admin", label: "Panel" },
    { href: "/admin/products", label: "Productos" },
    { href: "/admin/categories", label: "Categorías" },
    { href: "/admin/brands", label: "Marcas" },
] as const;

export function AdminNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut, isLoading } = useAuth();

    async function handleSignOut() {
        await signOut();
        router.refresh();
        router.push("/auth/login");
    }

    return (
        <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--brand-gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--background)_97%,var(--brand-gold))] shadow-[0_1px_0_rgba(4,8,42,0.06)]">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
                <div className="flex min-w-0 items-center gap-6 lg:gap-10">
                    <Link
                        href="/admin"
                        className="shrink-0 font-sans text-sm font-semibold tracking-tight text-(--brand-primary)"
                    >
                        <span className="block text-[0.65rem] font-medium uppercase tracking-[0.35em] text-(--brand-gold)">
                            Maranatha
                        </span>
                        <span className="block leading-tight">Admin</span>
                    </Link>

                    <nav
                        className="hidden items-center gap-1 sm:flex"
                        aria-label="Administración"
                    >
                        {navItems.map(({ href, label }) => {
                            const active =
                                href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname === href ||
                                      pathname.startsWith(`${href}/`);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        active
                                            ? "bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] text-(--brand-primary)"
                                            : "text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand-primary)_5%,transparent)] hover:text-(--brand-primary)"
                                    }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <Link
                        href="/"
                        className="hidden text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] transition hover:text-(--brand-primary) sm:inline"
                    >
                        Ver sitio
                    </Link>

                    <div
                        className="hidden h-6 w-px bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] sm:block"
                        aria-hidden
                    />

                    <div className="flex min-w-0 flex-col items-end text-right sm:min-w-32">
                        <span className="truncate text-xs text-[color-mix(in_srgb,var(--foreground)_50%,transparent)]">
                            {isLoading ? "…" : (user?.email ?? "Sesión")}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleSignOut()}
                        className="rounded-lg border border-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] bg-(--background) px-3 py-1.5 text-xs font-semibold text-(--brand-primary) transition hover:border-[color-mix(in_srgb,var(--brand-gold)_50%,var(--brand-primary))] hover:bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)] sm:px-4 sm:text-sm"
                    >
                        Salir
                    </button>
                </div>
            </div>

            <nav
                className="flex gap-1 overflow-x-auto border-t border-[color-mix(in_srgb,var(--brand-gold)_20%,transparent)] px-3 py-2 sm:hidden"
                aria-label="Administración"
            >
                {navItems.map(({ href, label }) => {
                    const active =
                        href === "/admin"
                            ? pathname === "/admin"
                            : pathname === href || pathname.startsWith(`${href}/`);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                                active
                                    ? "bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)] text-(--brand-primary)"
                                    : "text-[color-mix(in_srgb,var(--foreground)_65%,transparent)]"
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
                <Link
                    href="/"
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Sitio
                </Link>
            </nav>
        </header>
    );
}
