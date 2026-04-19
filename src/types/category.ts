export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  created_at: string;
}

export type UseCategoriesPagedParams = {
  page: number;
  pageSize: number;
  query?: string;
};

export type UseCategoriesPagedResult = {
  categories: Category[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export type CategoryInsert = Omit<Category, "id" | "created_at">;
export type CategoryUpdate = Partial<CategoryInsert>;
