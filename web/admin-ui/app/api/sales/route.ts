import sales from "@/lib/mock/sales.json";

export async function GET() {
  return new Response(JSON.stringify(sales), {
    headers: { "Content-Type": "application/json" },
  });
}
