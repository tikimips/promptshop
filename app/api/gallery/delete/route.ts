import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export const maxDuration = 30;

// Deletes one gallery photo by its blob URL. Only blobs inside our two
// gallery prefixes can be deleted.
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'no blob store connected' }, { status: 500 });
  }
  try {
    const body = (await req.json()) as { url?: string };
    const url = String(body?.url || '');
    if (!/\/(cindy|gallery|site-[a-z0-9-]{2,32})\//.test(new URL(url).pathname)) {
      return NextResponse.json({ error: 'not a gallery photo' }, { status: 400 });
    }
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'delete failed' }, { status: 502 });
  }
}
