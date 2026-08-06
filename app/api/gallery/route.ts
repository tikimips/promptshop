import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(req: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ photos: [], cursor: null, note: 'no blob store connected' });
    }
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || undefined;
    const { blobs, cursor: next, hasMore } = await list({ prefix: 'gallery/', limit: 40, cursor });
    return NextResponse.json({
      photos: blobs.map((b) => ({ url: b.url, name: b.pathname.split('/').pop() })),
      cursor: hasMore ? next : null,
    });
  } catch (e) {
    return NextResponse.json({ photos: [], cursor: null, error: e instanceof Error ? e.message : 'list failed' });
  }
}
