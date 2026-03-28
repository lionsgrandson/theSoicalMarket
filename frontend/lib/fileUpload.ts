export interface FileUploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  resource_type?: string;
  format?: string;
  error?: string;
}

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName || !uploadPreset) {
    return null;
  }

  return { cloudName, uploadPreset };
}

function getImgbbApiKey() {
  return process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim() || null;
}

function extractUploadUrl(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;

  const record = result as Record<string, unknown>;
  const topLevelUrl =
    typeof record.url === "string"
      ? record.url
      : typeof record.file_url === "string"
        ? record.file_url
        : typeof record.secure_url === "string"
          ? record.secure_url
          : undefined;

  if (topLevelUrl) return topLevelUrl;

  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;

  if (!data) return undefined;

  if (typeof data.url === "string") return data.url;
  if (typeof data.display_url === "string") return data.display_url;

  const image =
    data.image && typeof data.image === "object"
      ? (data.image as Record<string, unknown>)
      : null;

  if (image && typeof image.url === "string") return image.url;

  return undefined;
}

async function uploadViaCloudinary(file: File): Promise<FileUploadResponse> {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary is not configured");
  }

  const mimeType = file.type;
  let resourceType = "auto";

  if (mimeType.startsWith("image/")) {
    resourceType = "image";
  } else if (mimeType.startsWith("video/")) {
    resourceType = "video";
  } else {
    resourceType = "raw";
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", config.uploadPreset);
  formData.append("folder", "brand-logos");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `Cloudinary upload failed: ${
        (result as { error?: { message?: string } })?.error?.message ||
        response.statusText
      }`
    );
  }

  const url = extractUploadUrl(result);
  if (!url) {
    throw new Error("Cloudinary upload succeeded but no file URL was returned");
  }

  return {
    success: true,
    url,
    filename:
      typeof (result as { public_id?: string }).public_id === "string"
        ? (result as { public_id: string }).public_id
        : file.name,
    resource_type:
      typeof (result as { resource_type?: string }).resource_type === "string"
        ? (result as { resource_type: string }).resource_type
        : undefined,
    format:
      typeof (result as { format?: string }).format === "string"
        ? (result as { format: string }).format
        : undefined,
  };
}

async function uploadViaImgbb(file: File): Promise<FileUploadResponse> {
  const apiKey = getImgbbApiKey();
  if (!apiKey) {
    throw new Error("ImgBB is not configured");
  }

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("image", file);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `ImgBB upload failed: ${
        (result as { error?: { message?: string } })?.error?.message ||
        response.statusText
      }`
    );
  }

  const url = extractUploadUrl(result);
  if (!url) {
    throw new Error("ImgBB upload succeeded but no file URL was returned");
  }

  const data =
    result && typeof result === "object" && "data" in result
      ? ((result as { data?: Record<string, unknown> }).data ?? null)
      : null;

  return {
    success: true,
    url,
    filename:
      typeof data?.title === "string" && data.title.trim()
        ? data.title
        : file.name,
    format:
      typeof data?.image === "object" &&
      data.image &&
      typeof (data.image as Record<string, unknown>).extension === "string"
        ? (data.image as Record<string, string>).extension
        : undefined,
  };
}

export async function uploadFile(file: File): Promise<FileUploadResponse> {
  return uploadToCloudinary(file);
}

export async function uploadToCloudinary(
  file: File
): Promise<FileUploadResponse> {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    if (getCloudinaryConfig()) {
      return await uploadViaCloudinary(file);
    }

    if (getImgbbApiKey()) {
      return await uploadViaImgbb(file);
    }

    throw new Error(
      "File upload is not configured. Add Cloudinary env vars or NEXT_PUBLIC_IMGBB_API_KEY."
    );
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
