import products from "../../../../mock/products.json";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const found = (products as any[]).find((p) => p.id === id || p.code === id);
  if (!found) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify(found), { headers: { "Content-Type": "application/json" } });
}
