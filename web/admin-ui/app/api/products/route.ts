import products from "@/lib/mock/products.json";

export async function GET() {
  return new Response(JSON.stringify(products), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `P${Math.floor(Math.random() * 900 + 100)}`;
    const created = { id, ...body };
    // NOTE: This is a stateless mock endpoint. It does not persist to disk.
    return new Response(JSON.stringify(created), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}
