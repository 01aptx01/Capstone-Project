import notifications from "@/lib/mock/notifications.json";

export async function GET() {
  return new Response(JSON.stringify(notifications), {
    headers: { "Content-Type": "application/json" },
  });
}
