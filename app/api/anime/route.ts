import { NextResponse } from 'next/server';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

const STYLE =
  'high-quality, professional anime illustration with sharp line work, vibrant cel-shading with clear highlights on the hair, and detailed, large, expressive glossy eyes. ' +
  "Retain the subject's real gender, apparent age, facial features, expression, skin tone, pose, hair color and clothing style, but simplify them into clean anime geometry.";

const SCENES = [
  // Scene 1: Nighttime magic and fireflies
  'The character stands in a dense bioluminescent golden grass field glowing intense yellow, looking upward in wonder. ' +
    'Swirling yellow and blue magic firefly particle effects drift in the dark navy night sky above. ' +
    'A tiny red daruma-doll figure sits on their shoulder.',
  // Scene 2: High-altitude euphoria
  'The character is captured mid-air, flying above a deep sea of cumulus clouds against a vast, bright blue sky, ' +
    'in a dynamic pose with arms spread wide and a look of joyful wonder and freedom. ' +
    'Defined cel-shading on the skin and clothing with bright natural sky lighting.',
  // Scene 3: Sunset silhouette and power structure
  'Viewed from a low-angle perspective through tall, dark, silhouetted grass blades, the character stands looking down toward the camera. ' +
    'Behind them is a dramatic, fiery orange, red and purple sunset and the intricate metal grid framework of a power transmission tower. ' +
    'The scene is illuminated by intense, warm golden-hour backlighting.',
];

// Optional style/scene reference images. Drop PNGs into public/anime-refs/
// (style.png, scene0.png, scene1.png, scene2.png) and they are picked up
// automatically as image references for Gemini.
async function loadRef(origin: string, name: string): Promise<string | null> {
  try {
    const r = await fetch(`${origin}/anime-refs/${name}`, { cache: 'force-cache' });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 100) return null;
    return buf.toString('base64');
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: { imageB64?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!body?.imageB64) {
    return NextResponse.json({ error: 'imageB64 required' }, { status: 400 });
  }

  const scene = Math.floor(Math.random() * SCENES.length);
  const origin = new URL(req.url).origin;
  const [styleRef, sceneRef] = await Promise.all([
    loadRef(origin, 'style.png'),
    loadRef(origin, `scene${scene}.png`),
  ]);

  let prompt =
    'The person in the first attached photo is converted into a ' + STYLE + ' ' + SCENES[scene];
  if (styleRef) {
    prompt +=
      ' Replicate the exact art style of the attached style reference image (line work, shading, eye rendering).';
  }
  if (sceneRef) {
    prompt +=
      ' Match the background, palette and lighting of the attached scene reference image.';
  }
  prompt +=
    ' The final result must be one cohesive anime illustration, landscape orientation. No text, no watermark, no logo.';

  const parts: object[] = [
    { text: prompt },
    { inline_data: { mime_type: 'image/jpeg', data: String(body.imageB64) } },
  ];
  if (styleRef) parts.push({ inline_data: { mime_type: 'image/png', data: styleRef } });
  if (sceneRef) parts.push({ inline_data: { mime_type: 'image/png', data: sceneRef } });

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
        if (d) return NextResponse.json({ image: d, scene });
      }
      lastError = 'no image in gemini response';
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  return NextResponse.json({ error: lastError }, { status: 502 });
}
