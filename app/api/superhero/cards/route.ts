import { NextResponse } from 'next/server';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

function cardPrompt(kind: 'man' | 'woman') {
  const who =
    kind === 'man'
      ? 'a heroic adult man superhero with an athletic build, wearing a bright blue suit with a flowing red cape, yellow belt and red boots'
      : 'a heroic adult woman superhero with an athletic build, wearing a bright red suit with a flowing purple cape, yellow belt and yellow boots';
  return (
    'A photorealistic, cinematic full-body photograph of ' +
    who +
    ', floating mid-air in a confident hero pose, cape billowing, dramatic blue sky with clouds behind, ' +
    'movie-poster lighting, sharp focus, high detail. Confident smiling face looking at the camera. ' +
    'Portrait orientation, full body visible head to boots, centered. No text, no watermark, no logo.'
  );
}

async function generate(key: string, kind: 'man' | 'woman'): Promise<string> {
  let lastError = 'all models failed';
  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            contents: [{ parts: [{ text: cardPrompt(kind) }] }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: { aspectRatio: '2:3' },
            },
          }),
        }
      );
      if (!r.ok) {
        lastError = `gemini http ${r.status}`;
        if (r.status === 404 || r.status === 400) continue;
        throw new Error(lastError);
      }
      const j = await r.json();
      const ps = j?.candidates?.[0]?.content?.parts || [];
      for (const p of ps) {
        const d = p?.inlineData?.data || p?.inline_data?.data;
        if (d) return d as string;
      }
      lastError = 'no image in gemini response';
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  throw new Error(lastError);
}

// Warm-instance cache so repeat loads don't regenerate
let cache: { boy: string; girl: string } | null = null;
let pending: Promise<{ boy: string; girl: string }> | null = null;

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }
  try {
    if (!cache) {
      if (!pending) {
        pending = Promise.all([generate(key, 'man'), generate(key, 'woman')])
          .then(([boy, girl]) => ({ boy, girl }))
          .finally(() => {
            pending = null;
          });
      }
      cache = await pending;
    }
    return NextResponse.json(cache, {
      headers: {
        // Vercel CDN keeps this for a week, so cards are instant for everyone
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'generation failed' },
      { status: 502 }
    );
  }
}
