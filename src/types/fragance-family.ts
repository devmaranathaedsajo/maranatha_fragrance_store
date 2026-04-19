export interface FragranceFamily {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
}

export type FragranceFamilyInsert = Omit<FragranceFamily, "id" | "created_at">;
export type FragranceFamilyUpdate = Partial<FragranceFamilyInsert>;
