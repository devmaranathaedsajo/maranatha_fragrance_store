"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  Brand,
  UseBrandsPagedParams,
  UseBrandsPagedResult,
} from "@/types/brand";
import { useCallback, useEffect, useMemo, useState } from "react";

function clampInt(value: number, { min, max }: { min: number; max: number }) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

export function useBrandsPaged(
  params: UseBrandsPagedParams,
): UseBrandsPagedResult {
  const [supabase] = useState(() => createClient());

  const pageSize = useMemo(
    () => clampInt(params.pageSize, { min: 5, max: 100 }),
    [params.pageSize],
  );
  const page = useMemo(
    () => clampInt(params.page, { min: 1, max: 1_000_000 }),
    [params.page],
  );
  const query = (params.query ?? "").trim();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = supabase
      .from("brands")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (query) {
      const escaped = query.replaceAll("%", "\\%").replaceAll("_", "\\_");
      q = q.or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
    }

    const { data, count, error: qError } = await q;

    if (qError) {
      setBrands([]);
      setTotal(0);
      setError(qError.message);
      setIsLoading(false);
      return;
    }

    setBrands((data as Brand[]) ?? []);
    setTotal(count ?? 0);
    setIsLoading(false);
  }, [page, pageSize, query, supabase]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void fetchPage();
    });
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [pageSize, total]);

  return {
    brands,
    total,
    totalPages,
    isLoading,
    error,
    refetch: fetchPage,
  };
}
