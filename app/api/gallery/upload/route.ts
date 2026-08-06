import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const maxDuration = 60;

// Accepts one image per request (raw bytes). The ts query param carries the
// photo's original file time so older photos sort into place by when they
// were actually taken.
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'no blob store connected' }, { status: 500 });
  }
  try {
    const url = new URL(req.url);
    const ts = Number(url.searchParams.get('ts')) || Date.now();
    const buf = Buffer.from(await req.arrayBuffer());
    if (!buf.length) return NextResponse.json({ error: 'empty body' }, { status: 400 });
    if (buf.length > 8 * 1024 * 1024) return NextResponse.json({ error: 'file too large' }, { status: 400 });
    const key = `gallery/${String(1e13 - ts).padStart(13, '0')}_upload.jpg`;
    const blob = await put(key, buf, {
      access: 'public',
      contentType: req.headers.get('content-type') || 'image/jpeg',
      addRandomSuffix: true,
    });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'upload failed' }, { status: 502 });
  }
}
