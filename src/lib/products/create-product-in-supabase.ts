import type { ProductInsert } from "@/types/product";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

type CreateProductResult =
  | { data: { id: string }; error: null }
  | { data: null; error: PostgrestError };

/**
 * Inserta un producto y sus familias olfativas. Si falla la tabla intermedia,
 * elimina el producto creado para no dejar filas huérfanas.
 */
export async function createProductWithFragranceFamilies(
  supabase: SupabaseClient,
  product: ProductInsert,
  fragranceFamilyIds: string[],
): Promise<CreateProductResult> {
  const { data: row, error: insertError } = await supabase
    .from("products")
    .insert(product)
    .select("id")
    .single();

  if (insertError) {
    return { data: null, error: insertError };
  }

  const productId = row.id as string;

  if (fragranceFamilyIds.length === 0) {
    return { data: { id: productId }, error: null };
  }

  const junctionRows = fragranceFamilyIds.map((fragrance_family_id) => ({
    product_id: productId,
    fragrance_family_id,
  }));

  const { error: junctionError } = await supabase
    .from("product_fragrance_families")
    .insert(junctionRows);

  if (junctionError) {
    await supabase.from("products").delete().eq("id", productId);
    return { data: null, error: junctionError };
  }

  return { data: { id: productId }, error: null };
}
