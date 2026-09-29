import { getCurrentUser } from "@/server/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ user: null }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Falha ao consultar sessão", error);
    return Response.json({ error: "Não foi possível consultar a sessão." }, { status: 500 });
  }
}
