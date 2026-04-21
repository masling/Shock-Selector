import { mapProductToListItem } from "@/lib/products/product-mappers";
import { searchProducts } from "@/lib/products/product-repository";
import { productSearchSchema, type ProductSearchResult } from "@/lib/products/schemas";

export async function productSearchService(rawInput: unknown): Promise<ProductSearchResult> {
  const input = productSearchSchema.parse(rawInput);
  const { items, total } = await searchProducts(input);

  return {
    total,
    page: input.page,
    pageSize: input.pageSize,
    items: items.map((item) => mapProductToListItem(item, input.locale)),
  };
}
