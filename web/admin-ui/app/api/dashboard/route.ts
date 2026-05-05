import dashboard from "@/lib/mock/dashboard.json";

export async function GET() {
  return new Response(JSON.stringify(dashboard), {
    headers: { "Content-Type": "application/json" },
  });
}
