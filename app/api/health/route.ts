export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    status: "ok",
    service: "FilmiScript Agent API",
    timestamp: new Date().toISOString(),
    groqConfigured: !!process.env.GROQ_API_KEY,
  });
}