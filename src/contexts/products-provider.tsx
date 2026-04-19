"use client";

import { createClient } from "@/lib/supabase/client";
import type { Product, ProductInsert, ProductUpdate } from "@/types/product";
import type { PostgrestError } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type MutationResult = {
    data: Product | null;
    error: PostgrestError | null;
};

type ProductsContextValue = {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    createProduct: (input: ProductInsert) => Promise<MutationResult>;
    updateProduct: (id: string, patch: ProductUpdate) => Promise<MutationResult>;
    clearError: () => void;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const [supabase] = useState(() => createClient());
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const { data, error: qError } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        setIsLoading(false);

        if (qError) {
            setError(qError.message);
            setProducts([]);
            return;
        }

        setProducts((data as Product[]) ?? []);
    }, [supabase]);

    useEffect(() => {
        let active = true;
        queueMicrotask(() => {
            if (active) void refresh();
        });
        return () => {
            active = false;
        };
    }, [refresh]);

    const clearError = useCallback(() => setError(null), []);

    const createProduct = useCallback(
        async (input: ProductInsert): Promise<MutationResult> => {
            setError(null);
            const { data, error: insertError } = await supabase
                .from("products")
                .insert(input)
                .select()
                .single();

            if (insertError) {
                setError(insertError.message);
                return { data: null, error: insertError };
            }

            await refresh();
            return { data: data as Product, error: null };
        },
        [supabase, refresh],
    );

    const updateProduct = useCallback(
        async (id: string, patch: ProductUpdate): Promise<MutationResult> => {
            setError(null);
            const { data, error: updateError } = await supabase
                .from("products")
                .update(patch)
                .eq("id", id)
                .select()
                .single();

            if (updateError) {
                setError(updateError.message);
                return { data: null, error: updateError };
            }

            await refresh();
            return { data: data as Product, error: null };
        },
        [supabase, refresh],
    );

    const value = useMemo<ProductsContextValue>(
        () => ({
            products,
            isLoading,
            error,
            refresh,
            createProduct,
            updateProduct,
            clearError,
        }),
        [
            products,
            isLoading,
            error,
            refresh,
            createProduct,
            updateProduct,
            clearError,
        ],
    );

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts(): ProductsContextValue {
    const ctx = useContext(ProductsContext);
    if (!ctx) {
        throw new Error("useProducts debe usarse dentro de ProductsProvider");
    }
    return ctx;
}
