import { supabaseAdmin, STORAGE_BUCKET } from './supabase';

export const COVER_IMAGES_BUCKET = 'cover-images';

export async function generateSignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; filePath: string }> {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `uploads/${timestamp}-${sanitizedFilename}`;

  // Generate a signed upload URL
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(filePath);

  if (error) {
    throw new Error(`Failed to generate upload URL: ${error.message}`);
  }

  return {
    uploadUrl: data.signedUrl,
    filePath,
  };
}

export async function generateSignedImageUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; filePath: string }> {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `covers/${timestamp}-${sanitizedFilename}`;

  // Generate a signed upload URL for cover images
  const { data, error } = await supabaseAdmin.storage
    .from(COVER_IMAGES_BUCKET)
    .createSignedUploadUrl(filePath);

  if (error) {
    throw new Error(`Failed to generate image upload URL: ${error.message}`);
  }

  return {
    uploadUrl: data.signedUrl,
    filePath,
  };
}

export async function getPublicUrl(filePath: string): Promise<string> {
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function getPublicImageUrl(filePath: string): Promise<string> {
  const { data } = supabaseAdmin.storage
    .from(COVER_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Generate a signed URL that expires after a specified time
export async function generateSignedDownloadUrl(
  filePath: string,
  expiresIn: number = 3600 // Default 1 hour
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

