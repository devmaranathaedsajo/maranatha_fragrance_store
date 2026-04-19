import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada petición y protege `/admin`.
 * En Next.js 16 el archivo `middleware` se renombró a `proxy` (runtime Node).
 */
export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet, headers) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                    Object.entries(headers).forEach(([key, value]) =>
                        supabaseResponse.headers.set(key, value),
                    );
                },
            },
        },
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isAdminRoute = pathname.startsWith("/admin");

    if (!user && isAdminRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        url.searchParams.set(
            "next",
            `${pathname}${request.nextUrl.search}`,
        );
        const redirectResponse = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
        });
        return redirectResponse;
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Ejecutar en casi todas las rutas para refrescar la sesión;
         * excluir estáticos y favicon.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
