import { supabaseAdmin, STORAGE_BUCKET } from './supabase';

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

export async function getPublicUrl(filePath: string): Promise<string> {
  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

