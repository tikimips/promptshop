import { NextResponse } from 'next/server';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

const MOVIES: Record<string, { render: string; scene: string }> = {
  mario: {
    render:
      "rendered as colorful 3D-animated movie characters in the bright, bouncy style of a modern animated video-game adventure film, keeping each person's real facial features, hair and expression clearly recognizable in stylized cartoon form",
    scene:
      'leaping joyfully between small floating planetoids in a dazzling cosmic galaxy, star-shaped power-ups and sparkling star bits swirling around, tiny cheerful mushroom-village creatures waving from below, vibrant candy-colored space skies',
  },
  disclosure: {
    render:
      "a photorealistic, cinematic live-action movie still with warm Spielberg-style backlighting and gentle lens flare, preserving each person's real face exactly",
    scene:
      'standing awe-struck on a suburban street at dusk as massive glowing UFOs are officially revealed hovering over the distant city skyline, neighbors gazing upward, news helicopters circling, shafts of warm golden light pouring from the sky',
  },
  minions: {
    render:
      "rendered as 3D-animated family-movie characters, keeping each person's real facial features and hair recognizable in cartoon form",
    scene:
      'on a chaotic Hollywood movie-studio backlot surrounded by a swarm of original little yellow capsule-shaped cartoon helpers in goggles and blue overalls scrambling to wrangle the silly original cartoon monsters they accidentally unleashed — toppled film sets, cameras and studio lights everywhere, gleeful comedy mayhem',
  },
  odyssey: {
    render:
      "a photorealistic, epic cinematic live-action movie still shot on large-format film, preserving each person's real face exactly",
    scene:
      'as ancient Greek heroes in weathered bronze armor and wind-whipped cloaks aboard a wooden ship on a storm-tossed wine-dark sea, towering waves, dramatic skies, distant rocky islands, epic mythological scale',
  },
  werwulf: {
    render:
      "a stark black-and-white photorealistic cinematic movie still in the style of a 13th-century gothic horror film, heavy film grain and deep shadows, preserving each person's real face exactly",
    scene:
      'as medieval villagers in rough wool cloaks deep in a mist-choked ancient forest under an enormous full moon, the silhouette of a monstrous wolf looming between the twisted trees, flickering torchlight and creeping dread',
  },
  httyd: {
    render:
      "rendered as 3D-animated characters in the style of a soaring dragon-riding animated adventure film, keeping each person's real facial features and hair recognizable in stylized form",
    scene:
      'as viking dragon-riders in leather flight gear soaring on the backs of majestic colorful dragons above sea stacks and clouds, golden sunlight, exhilarating aerial adventure',
  },
  shrek: {
    render:
      "rendered as 3D-animated fairy-tale characters in a classic storybook-parody animated style, keeping each person's real facial features and hair recognizable in cartoon form",
    scene:
      'in a sunlit fairy-tale swamp beside a cozy tree-stump cottage, a chatty gray donkey nearby, a big friendly green ogre waving from his porch in the background, and a storybook castle kingdom on the horizon',
  },
  wicked: {
    render:
      "a lush, theatrical cinematic movie-musical still with sweeping stage lighting, preserving each person's real face exactly",
    scene:
      "dressed in dazzling emerald-and-black and pink-and-silver costumes inside the glittering green art-deco Emerald City, one holding a broomstick, a pointed witch's hat and a hot-air balloon drifting in the sky above, swirling spotlights",
  },
  sing: {
    render:
      "rendered as 3D-animated characters in a glossy animated musical-spectacle style, keeping each person's real facial features and hair recognizable in cartoon form",
    scene:
      'performing under neon spotlights on a spectacular futuristic show stage alongside anthropomorphic animal performers — a dapper koala emcee, a punk porcupine rocker, a crooning gorilla — confetti cannons and glowing lights',
  },
};

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: { imagesB64?: string[]; imageB64?: string; movie?: string };
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
  const movie = MOVIES[String(body.movie)] ? String(body.movie) : 'mario';
  const m = MOVIES[movie];

  const subject =
    n === 1
      ? `the person in the attached photo, ${m.render},`
      : `the ${n} people in the ${n} attached photos together in one single scene, ${m.render} — the image must contain exactly ${n} characters, one per attached photo, posed together naturally as a group —`;

  const prompt =
    `A movie still of ${subject} ${m.scene}. ` +
    "Each character must preserve the corresponding person's real facial features, expression, skin tone, apparent age, gender and hair. " +
    'All background creatures and side characters are original designs merely inspired by the described aesthetic, not copies of any existing copyrighted characters. ' +
    'The result must look like one cohesive frame from the film, not a collage or paste. ' +
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
