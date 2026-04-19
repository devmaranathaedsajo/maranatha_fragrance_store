"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const SHELL_CLASS =
    "flex min-h-dvh flex-col items-center justify-center bg-[color-mix(in_srgb,var(--background)_92%,var(--brand-gold))] px-5 py-12 font-sans";

function getPostLoginPath(nextParam: string | null): string {
    if (
        nextParam &&
        nextParam.startsWith("/") &&
        !nextParam.startsWith("//")
    ) {
        return nextParam;
    }
    return "/admin";
}

function LoginPageInner() {
    const { signIn, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const afterLogin = useMemo(
        () => getPostLoginPath(searchParams.get("next")),
        [searchParams],
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authLoading || !user) return;
        router.replace(afterLogin);
    }, [authLoading, user, router, afterLogin]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const { error: signInError } = await signIn(email, password);
        setLoading(false);
        if (signInError) {
            setError(signInError.message);
            return;
        }
        router.refresh();
        router.push(afterLogin);
    }

    if (authLoading) {
        return (
            <div className={SHELL_CLASS}>
                <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                    Cargando…
                </p>
            </div>
        );
    }

    if (user) {
        return (
            <div className={SHELL_CLASS}>
                <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                    Redirigiendo al panel…
                </p>
            </div>
        );
    }

    return (
        <div className={SHELL_CLASS}>
            <div className="w-full max-w-105">
                <div className="mb-10 text-center">
                    <p className="text-xs font-medium uppercase tracking-[0.35em] text-(--brand-gold)">
                        Maranatha EdSaJo
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-(--brand-primary)">
                        Iniciar sesión
                    </h1>
                    <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
                        Accede con tu correo y contraseña
                    </p>
                </div>

                <div className="rounded-2xl border border-[color-mix(in_srgb,var(--brand-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--background)_98%,var(--brand-gold))] p-8 shadow-[0_20px_60px_-24px_rgba(4,8,42,0.35)] sm:p-10">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {error ? (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                            >
                                {error}
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="login-email"
                                className="text-xs font-medium uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--brand-primary)_75%,transparent)]"
                            >
                                Correo
                            </label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl border border-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] bg-(--background) px-4 py-3 text-(--foreground) shadow-inner outline-none transition placeholder:text-[color-mix(in_srgb,var(--foreground)_45%,transparent)] focus:border-[color-mix(in_srgb,var(--brand-gold)_70%,var(--brand-primary))] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-gold)_35%,transparent)]"
                                placeholder="tu@correo.com"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="login-password"
                                className="text-xs font-medium uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--brand-primary)_75%,transparent)]"
                            >
                                Contraseña
                            </label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] bg-(--background) px-4 py-3 text-(--foreground) shadow-inner outline-none transition placeholder:text-[color-mix(in_srgb,var(--foreground)_45%,transparent)] focus:border-[color-mix(in_srgb,var(--brand-gold)_70%,var(--brand-primary))] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-gold)_35%,transparent)]"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-(--brand-primary) px-4 py-3.5 text-sm font-semibold text-[color-mix(in_srgb,var(--background)_96%,var(--brand-gold))] shadow-[0_12px_32px_-12px_rgba(4,8,42,0.65)] transition hover:bg-[color-mix(in_srgb,var(--brand-primary)_92%,var(--brand-gold))] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--brand-gold) disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Entrando…" : "Entrar"}
                        </button>
                    </form>

                    <div className="mx-auto mt-8 h-px w-12 bg-(--brand-gold)" aria-hidden />

                    <p className="mt-6 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                        <Link
                            href="/"
                            className="font-medium text-(--brand-primary) underline-offset-4 transition hover:text-[color-mix(in_srgb,var(--brand-primary)_80%,var(--brand-gold))] hover:underline"
                        >
                            Volver al inicio
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className={SHELL_CLASS}>
                    <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                        Cargando…
                    </p>
                </div>
            }
        >
            <LoginPageInner />
        </Suspense>
    );
}
