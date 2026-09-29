import { destroyUserSession, isSameOrigin } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Origem da requisição inválida." }, { status: 403 });
  }

  try {
    await destroyUserSession();
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Falha ao terminar sessão", error);
    return Response.json({ error: "Não foi possível terminar a sessão." }, { status: 500 });
  }
}
