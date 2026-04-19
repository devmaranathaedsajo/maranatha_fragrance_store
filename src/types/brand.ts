export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  created_at: string;
}

export type UseBrandsPagedParams = {
  page: number;
  pageSize: number;
  query?: string;
};

export type UseBrandsPagedResult = {
  brands: Brand[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type BrandInsert = Omit<Brand, "id" | "created_at">;
export type BrandUpdate = Partial<BrandInsert>;
