import { NextResponse } from 'next/server';
import { saveToGallery } from '../_lib/gallery';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

const SITE_SLUG_RE_B = /^[a-z0-9-]{2,32}$/;
function bucketOf(b: { gallery?: string; site?: string }): string {
  if (typeof b.site === 'string' && SITE_SLUG_RE_B.test(b.site)) return `site-${b.site}`;
  return b.gallery === 'cindy' ? 'cindy' : 'gallery';
}

// Upload booths send whole snapshots (possibly groups), not per-person face crops.
const EVERYONE_NOTE =
  ' NOTE: the attached photo(s) are ordinary snapshots and one photo may contain several people. Apply everything described above exactly as written, as if each person had been attached as a separate photo: every person visible across the attached photo(s) appears in the finished image — the same people, no more, no fewer — all together in the foreground as equal subjects, never as spectators or background figures.';

function scenePrompt(gender: 'man' | 'woman') {
  return (
    `A futuristic cyberpunk aesthetic photo of the person in the attached photo (a ${gender}) playing tennis on a glowing neon court at night. ` +
    'Magenta and cyan rim lighting, reflective dark court surface, glowing tennis ball, modern tech-wear athletic outfit, synthwave vibe, dark background with glowing stadium lights. ' +
    "Preserve the person's real facial features, expression, skin tone, apparent age and hair exactly, and blend them seamlessly into the scene so it looks like one single professionally shot photograph, not a collage or paste. " +
    'Landscape orientation, composed with every face comfortably inside the frame, at least 5% away from every edge. No text, no watermark, no logo.'
  );
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: { imageB64?: string; gender?: string; gallery?: string; site?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!body?.imageB64) {
    return NextResponse.json({ error: 'imageB64 required' }, { status: 400 });
  }
  const gender: 'man' | 'woman' = body.gender === 'woman' ? 'woman' : 'man';

  const parts = [
    { text: scenePrompt(gender) + (body.gallery === 'cindy' ? EVERYONE_NOTE : '') },
    { inline_data: { mime_type: 'image/jpeg', data: String(body.imageB64) } },
  ];

  let lastError = 'all models failed';
  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: { aspectRatio: '3:2' },
            },
          }),
        }
      );
      if (!r.ok) {
        lastError = `gemini http ${r.status}: ${(await r.text()).slice(0, 300)}`;
        if (r.status === 404 || r.status === 400) continue;
        return NextResponse.json({ error: lastError }, { status: 502 });
      }
      const j = await r.json();
      const ps = j?.candidates?.[0]?.content?.parts || [];
      for (const p of ps) {
        const d = p?.inlineData?.data || p?.inline_data?.data;
        if (d) {
          await saveToGallery(d, 'cyberpunk', bucketOf(body)).catch(() => {});
          return NextResponse.json({ image: d });
        }
      }
      lastError = 'no image in gemini response';
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  return NextResponse.json({ error: lastError }, { status: 502 });
}
