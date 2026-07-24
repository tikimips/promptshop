import { NextResponse } from 'next/server';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

function scenePrompt(gender: 'man' | 'woman') {
  return (
    `A futuristic cyberpunk aesthetic photo of the person in the attached photo (a ${gender}) playing tennis on a glowing neon court at night. ` +
    'Magenta and cyan rim lighting, reflective dark court surface, glowing tennis ball, modern tech-wear athletic outfit, synthwave vibe, dark background with glowing stadium lights. ' +
    "Preserve the person's real facial features, expression, skin tone, apparent age and hair exactly, and blend them seamlessly into the scene so it looks like one single professionally shot photograph, not a collage or paste. " +
    'Landscape orientation. No text, no watermark, no logo.'
  );
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: { imageB64?: string; gender?: string };
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
    { text: scenePrompt(gender) },
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
        if (d) return NextResponse.json({ image: d });
      }
      lastError = 'no image in gemini response';
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  return NextResponse.json({ error: lastError }, { status: 502 });
}
