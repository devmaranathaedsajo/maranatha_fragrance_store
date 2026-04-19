import { Brand } from "./brand";
import { Category } from "./category";
import { FragranceFamily } from "./fragance-family";

export enum Gender {
  MEN = "men",
  WOMEN = "women",
  UNISEX = "unisex",
}

export interface Product {
  id: string;

  name: string;
  slug: string;
  sku: string;

  short_description?: string | null;
  description?: string | null;

  gender?: Gender | null;

  brand_id?: string | null;
  category_id?: string | null;

  is_featured: boolean;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;

  image_url: string;

  is_main: boolean;
  display_order: number;

  created_at: string;
}

export interface ProductFragranceFamily {
  product_id: string;
  fragrance_family_id: string;
}

export interface ProductWithRelations extends Product {
  brand?: Brand | null;
  category?: Category | null;

  images?: ProductImage[];

  fragrance_families?: FragranceFamily[];
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;

export type ProductUpdate = Partial<ProductInsert>;
