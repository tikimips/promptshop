import { NextResponse } from 'next/server';
import { saveToGallery } from '../_lib/gallery';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

const POSE_NOTE =
  ' POSE REFERENCE: the very last attached image is a pose reference only. Arrange the people in the same body poses, grouping, spacing and camera framing as that reference. Do NOT include any person from the pose reference in the finished image and do not copy their faces, identities, clothing or uniforms from it — only the poses and composition. The people in the finished image are exactly those from the other attached photo(s).';


async function callModels(key: string, parts: object[]): Promise<{ image?: string; error: string }> {
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
        continue;
      }
      const j = await r.json();
      const ps = j?.candidates?.[0]?.content?.parts || [];
      for (const p of ps) {
        const d = p?.inlineData?.data || p?.inline_data?.data;
        if (d) return { image: d, error: '' };
      }
      lastError = 'no image in gemini response';
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  return { error: lastError };
}


// Optional free-text creative direction from the booth's notes field
function noteSuffix(notes: unknown): string {
  const t = typeof notes === 'string' ? notes.trim().slice(0, 300) : '';
  return t ? ` USER REQUEST: ${t}. Apply this creative direction while still following every rule above.` : '';
}

// Upload booths send whole snapshots (possibly groups), not per-person face crops.
const EVERYONE_NOTE =
  ' NOTE: the attached photo(s) are ordinary snapshots and one photo may contain several people. Apply everything described above exactly as written, as if each person had been attached as a separate photo: every person visible across the attached photo(s) appears in the finished image — the same people, no more, no fewer — all together in the foreground as equal subjects, never as spectators or background figures.';

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
      'on a chaotic Hollywood movie-studio backlot surrounded by a swarm of original little yellow capsule-shaped cartoon helpers in goggles and blue overalls scrambling to wrangle the silly original cartoon monsters they accidentally unleashed — toppled film sets, cameras and studio lights everywhere, gleeful comedy mayhem; the people themselves wear their own everyday clothes',
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

  let body: { imagesB64?: string[]; imageB64?: string; movie?: string; gallery?: string; notes?: string; poseB64?: string };
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

  let prompt =
    `A movie still of ${subject} ${m.scene}. ` +
    "Each character must preserve the corresponding person's real facial features, expression, skin tone, apparent age, gender and hair. " +
    'All background creatures and side characters are original designs merely inspired by the described aesthetic, not copies of any existing copyrighted characters. ' +
    'The result must look like one cohesive frame from the film, not a collage or paste. ' +
    'Landscape orientation, composed with every face comfortably inside the frame, at least 5% away from every edge. No text, no watermark, no logo.';

  if (body.gallery === 'cindy') prompt += EVERYONE_NOTE;
    prompt += noteSuffix(body.notes);
  const TRADE_DRESS = 'original little yellow capsule-shaped cartoon helpers in goggles and blue overalls';
  const DRESS_VARIANTS = [
    TRADE_DRESS,
    'knee-high glossy yellow pill-shaped original cartoon creatures, each with one or two huge round eyes behind silver-rimmed goggles, wearing tiny blue denim dungarees with shoulder straps, black gloves and stubby black boots',
  ];
  const faceParts: object[] = faces.map((f) => ({ inline_data: { mime_type: 'image/jpeg', data: f } }));
  const hasPose = typeof body.poseB64 === 'string' && body.poseB64.length > 0;
  const poseParts: object[] = hasPose ? [{ inline_data: { mime_type: 'image/jpeg', data: String(body.poseB64) } }] : [];
  if (hasPose) prompt += POSE_NOTE;

  const finish = async (d: string) => {
    await saveToGallery(d, 'film', body.gallery === 'cindy' ? 'cindy' : 'gallery').catch(() => {});
    return NextResponse.json({ image: d });
  };

  let lastError = '';

  // Minions: two-stage. Real photos + canon minion trade dress in one call is
  // what Gemini keeps refusing — so first turn the people into animated
  // characters (no franchise elements at all), then drop that already-cartoon
  // image into the canon minion scene. Stage two has no real photos in it,
  // which is what makes the canon look pass reliably.
  if (movie === 'minions') {
    const toonPrompt =
      `Convert ${n === 1 ? 'the person' : 'the people'} in the attached photo${n === 1 ? '' : 's'} into 3D-animated family-movie cartoon characters, ` +
      "keeping each person's real facial features, expression, skin tone, apparent age, gender, hair and clothing clearly recognizable in stylized cartoon form. " +
      'Every person visible across the attached photo(s) appears — the same people, no more, no fewer — standing together as one group, full body, all equally prominent. ' +
      'Plain soft neutral studio background, even lighting. Landscape orientation. No text, no watermark.';
    const s1 = await callModels(key, [{ text: hasPose ? toonPrompt + POSE_NOTE : toonPrompt }, ...faceParts, ...poseParts]);
    if (s1.image) {
      for (const dress of DRESS_VARIANTS) {
        const scene = m.scene.replace(TRADE_DRESS, dress);
        const p2 =
          'A single cohesive 3D-animated movie still: take the already-animated cartoon characters in the attached image and place them into a new scene ' +
          'EXACTLY as they appear — same faces, same hair, same clothes, same proportions, same art style, and every single character from the attached image included, none omitted — now ' +
          scene + '. ' +
          'All background creatures and side characters are original designs merely inspired by the described aesthetic, not copies of any existing copyrighted characters. ' +
          'The characters are the foreground stars of the frame. The result must look like one cohesive frame from an animated film, not a collage or paste. ' +
          'Landscape orientation, every face comfortably inside the frame, at least 5% away from every edge. No text, no watermark, no logo.' +
          noteSuffix(body.notes);
        const s2 = await callModels(key, [
          { text: p2 },
          { inline_data: { mime_type: 'image/png', data: s1.image } },
        ]);
        if (s2.image) return finish(s2.image);
        lastError = s2.error;
      }
    } else {
      lastError = s1.error;
    }
    // Last resort: single-shot canon prompt, one pass
    const single = await callModels(key, [{ text: prompt }, ...faceParts, ...poseParts]);
    if (single.image) return finish(single.image);
    return NextResponse.json({ error: single.error || lastError }, { status: 502 });
  }

  // Every other movie: single call as before
  const res = await callModels(key, [{ text: prompt }, ...faceParts, ...poseParts]);
  if (res.image) return finish(res.image);
  return NextResponse.json({ error: res.error }, { status: 502 });
}
