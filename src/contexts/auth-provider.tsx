"use client";

import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type AuthContextValue = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => ReturnType<
        ReturnType<typeof createClient>["auth"]["signInWithPassword"]
    >;
    signOut: () => ReturnType<ReturnType<typeof createClient>["auth"]["signOut"]>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClient());
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        supabase.auth.getSession().then(({ data: { session: initial } }) => {
            if (cancelled) return;
            setSession(initial);
            setUser(initial?.user ?? null);
            setIsLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, next) => {
            setSession(next);
            setUser(next?.user ?? null);
            setIsLoading(false);
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [supabase]);

    const signIn = useCallback(
        (email: string, password: string) =>
            supabase.auth.signInWithPassword({ email, password }),
        [supabase],
    );

    const signOut = useCallback(
        () => supabase.auth.signOut(),
        [supabase],
    );

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            session,
            isLoading,
            signIn,
            signOut,
        }),
        [user, session, isLoading, signIn, signOut],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return ctx;
}
