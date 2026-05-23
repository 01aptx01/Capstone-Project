import { apiFetch } from "./client";

export interface ApiProduct {
  product_id: number;
  name: string;
  description: string;
  price: number;
  heating_time: number;
  image_url: string | null;
  category: string;
  stock: number;
}

export async function fetchProducts(
  machineCode: string,
): Promise<ApiProduct[]> {
  return apiFetch<ApiProduct[]>(
    `/api/products?machine_code=${encodeURIComponent(machineCode)}`,
  );
}
