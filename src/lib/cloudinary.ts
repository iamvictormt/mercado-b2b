import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

let configured = false;

function configureCloudinary() {
  if (configured) return;

  const cloudinaryUrl = process.env["CLOUDINARY_URL"];
  if (cloudinaryUrl) {
    const parsed = new URL(cloudinaryUrl);
    if (parsed.protocol !== "cloudinary:") {
      throw new Error("CLOUDINARY_URL deve começar por cloudinary://.");
    }

    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password),
      secure: true,
    });
  } else {
    const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
    const apiKey = process.env["CLOUDINARY_API_KEY"];
    const apiSecret = process.env["CLOUDINARY_API_SECRET"];
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary não está configurado.");
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error("Cloudinary não está configurado.");
  }

  configured = true;
}

export async function uploadImage(buffer: Buffer, folder: "products" | "sourcing") {
  configureCloudinary();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `mercado-b2b/${folder}`,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("O Cloudinary não devolveu o resultado do upload."));
          return;
        }
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function destroyImage(publicId: string) {
  configureCloudinary();
  return cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
}
