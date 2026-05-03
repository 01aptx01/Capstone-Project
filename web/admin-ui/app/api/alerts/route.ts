import alerts from "@/lib/mock/alerts.json";

export async function GET() {
  return new Response(JSON.stringify(alerts), {
    headers: { "Content-Type": "application/json" },
  });
}
