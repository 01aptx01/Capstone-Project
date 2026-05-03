import orders from "@/lib/mock/orders.json";

export async function GET() {
  return new Response(JSON.stringify(orders), {
    headers: { "Content-Type": "application/json" },
  });
}
