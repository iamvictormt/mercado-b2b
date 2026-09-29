import { uploadImage } from "@/lib/cloudinary";
import { apiError, requireApiUser, validateMutationOrigin } from "@/server/api";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") === "sourcing" ? "sourcing" : "products";

    if (folder === "products" && auth.user.role !== "ADMIN") {
      return apiError("Apenas administradores podem enviar imagens de produtos.", 403);
    }

    if (!(file instanceof File)) {
      return apiError("Envie uma imagem no campo file.", 400);
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return apiError("Formato inválido. Use JPEG, PNG, WebP ou AVIF.", 415);
    }
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      return apiError("A imagem deve ter no máximo 8 MB.", 413);
    }

    const result = await uploadImage(Buffer.from(await file.arrayBuffer()), folder);

    return Response.json(
      {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Falha no upload para o Cloudinary", error);
    const httpCode =
      typeof error === "object" && error !== null && "http_code" in error
        ? (error as { http_code?: unknown }).http_code
        : undefined;
    if (httpCode === 401 || httpCode === 403) {
      return apiError(
        "O Cloudinary recusou o upload. Confirme se a chave da API permite criar assets.",
        502,
      );
    }
    return apiError("Não foi possível enviar a imagem.", 502);
  }
}
