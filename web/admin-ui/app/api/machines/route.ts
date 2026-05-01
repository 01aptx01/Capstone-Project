import machines from "../../../mock/machines.json";

export async function GET() {
  return new Response(JSON.stringify(machines), {
    headers: { "Content-Type": "application/json" },
  });
}
