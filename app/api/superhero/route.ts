import { NextResponse } from 'next/server';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

// Hero costume looks — one per person, distinct within a group.
// Every look explicitly keeps the face uncovered so the likeness survives.
const LOOKS = [
  'a classic bright blue superhero suit with a flowing red cape, yellow belt and red boots',
  'a black armored tactical superhero suit with a long dark cape and silver utility belt (no mask, face fully visible)',
  'a red and gold high-tech armored superhero suit with softly glowing chest core (no helmet, face fully visible)',
  'an emerald green superhero suit with glowing green energy accents and a dark green cape',
  'a scarlet speedster superhero suit with golden lightning motifs and streamlined lines (no cowl, face fully visible)',
  'a sleek silver and white futuristic superhero suit with a pale glowing cape',
  'a deep purple and black vigilante superhero suit with a hooded cape worn down and silver accents',
  'a gold and white cosmic superhero suit with a shimmering star-flecked cape',
];

// City atmospheres, dark to light
const ATMOSPHERES = [
  'a rain-soaked gothic city at night, brooding gargoyle-topped skyscrapers, moonlight cutting through storm clouds, film-noir mood',
  'a neon-lit city at midnight, glowing signs reflecting off wet rooftops, deep shadows and cinematic contrast',
  'a stormy city under crackling lightning, wind-whipped rain, dark dramatic clouds between the towers',
  'an overcast city at dusk, moody gray-gold light, fog drifting between skyscrapers',
  'a city at fiery sunset, warm orange and purple light gleaming off glass towers',
  'a gleaming modern metropolis at golden dawn, hopeful warm light between glass skyscrapers',
  'a bright sunny morning over a shining metropolis, vivid blue sky, sunlight flaring off the towers',
  'a snowy city evening, soft falling snow, glowing warm windows against cool blue twilight',
];

// Hero actions
const ACTIONS = [
  'flying dramatically between the skyscrapers, cape billowing',
  'landing in a powerful three-point hero pose on the street, debris scattering',
  'standing on a rooftop ledge overlooking the city, cape whipping in the wind',
  'leaping across rooftops mid-stride',
  'hovering above the street with energy glowing around their fists',
  'standing tall in the middle of the street facing the camera, heroic low-angle shot',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickDistinct<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n; i++) {
    if (!pool.length) pool.push(...arr);
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: { imageB64?: string; imagesB64?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const faces: string[] = Array.isArray(body?.imagesB64)
    ? body.imagesB64.filter((f) => typeof f === 'string' && f.length > 0).slice(0, 5)
    : body?.imageB64
      ? [String(body.imageB64)]
      : [];
  if (!faces.length) {
    return NextResponse.json({ error: 'imagesB64 required' }, { status: 400 });
  }
  const n = faces.length;

  const atmosphere = pick(ATMOSPHERES);
  const action = pick(ACTIONS);
  const looks = pickDistinct(LOOKS, n);

  let prompt: string;
  if (n === 1) {
    prompt =
      `A photorealistic, cinematic movie-still photograph of the person in the attached photo as a superhero wearing ${looks[0]}, ${action}, in ${atmosphere}. ` +
      "Preserve the person's real facial features, expression, skin tone, apparent age, gender and hair exactly, match the body build to the person, and keep their face fully visible (no mask). ";
  } else {
    const outfits = looks.map((l, i) => `person ${i + 1} wears ${l}`).join('; ');
    prompt =
      `A photorealistic, cinematic movie-still photograph of the ${n} people in the ${n} attached photos together as a superhero team in ${atmosphere}, posed together dramatically like a superhero team key visual — some ${action}. ` +
      `Each person wears a different costume: ${outfits}. ` +
      `The image must contain exactly ${n} heroes, one per attached photo, each preserving that person's real facial features, expression, skin tone, apparent age, gender and hair exactly, faces fully visible (no masks). `;
  }
  prompt +=
    'Match the lighting, color grading, grain and camera angle of the scene so it looks like one single professionally shot photograph, not a collage or paste. ' +
    'Landscape orientation. No text, no watermark, no logo.';

  const parts: object[] = [{ text: prompt }];
  for (const f of faces) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: f } });
  }

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
