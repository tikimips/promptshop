import { put } from '@vercel/blob';

// Saves a generated booth photo into the event gallery (Vercel Blob).
// Keys use an inverted timestamp so lexicographic listing = newest first.
// Silently does nothing until a Blob store is connected to the project.
export async function saveToGallery(b64: string, theme: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const key = `gallery/${String(1e13 - Date.now()).padStart(13, '0')}_${theme}.png`;
  await put(key, Buffer.from(b64, 'base64'), {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: true,
  });
}
