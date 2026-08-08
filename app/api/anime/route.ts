import { NextResponse } from 'next/server';
import { saveToGallery } from '../_lib/gallery';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

// Upload booths send whole snapshots (possibly groups), not per-person face crops.
const EVERYONE_NOTE = " IMPORTANT OVERRIDE ON PEOPLE: the attached photo(s) are ordinary snapshots, and one snapshot may contain several people. Ignore any earlier statement about exactly how many people or characters the image must contain. The finished image must include EVERY person visible across the attached photo(s) — the same people, no more, no fewer, adults and children alike — and ALL of them are equal co-stars: every one of them appears together in the FOREGROUND, in the same themed role, uniform or costume treatment as each other, posed as one group at similar size and prominence, like teammates in the action or heroes in the key visual. Never render any of them as a spectator, background figure or crowd member. FIRST count every person in the attached photo(s), then double-check the finished image contains exactly that many humans — leaving anyone out is a failure. The people always remain clearly HUMAN: never dress, color or shape any of them like the theme's creatures, mascots, sidekicks or background characters. Each preserves that person's real facial features, expression, skin tone, apparent age, gender and hair exactly.";

const STYLE =
  'high-quality, professional anime illustration with sharp line work, vibrant cel-shading with clear highlights on the hair, and detailed, large, expressive glossy eyes. ' +
  "Retain the subject's real gender, apparent age, facial features, expression, skin tone, pose, hair color and clothing style, but simplify them into clean anime geometry.";

// Character-design inspirations, one picked at random per photo
const CHARACTER_STYLES = [
  'Character design inspired by One Piece (Eiichiro Oda): bold dynamic line work, expressive exaggerated features, adventurous swashbuckling energy and outfit styling.',
  'Character design inspired by Fullmetal Alchemist (Hiromu Arakawa): clean confident lines, determined expression, sturdy proportions and early-2000s shonen palette.',
  'Character design inspired by Thorfinn from Vinland Saga: grounded realistic proportions, weathered detail, muted historical tones and a quiet intense gaze.',
  'Character design inspired by Kurisu Makise from Steins;Gate: slender elegant proportions, sharp intelligent gaze, understated modern clothing with subtle red accents.',
  'Character design inspired by Rem from Re:Zero: soft rounded facial features, large finely detailed eyes and clean modern shading.',
];

// Atmosphere / environment inspirations, one picked at random per photo
const SCENES = [
  // Original three scenes
  'The character stands in a dense bioluminescent golden grass field glowing intense yellow, looking upward in wonder. ' +
    'Swirling yellow and blue magic firefly particle effects drift in the dark navy night sky above. ' +
    'A tiny red daruma-doll figure sits on their shoulder.',
  'The character is captured mid-air, flying above a deep sea of cumulus clouds against a vast, bright blue sky, ' +
    'in a dynamic pose with arms spread wide and a look of joyful wonder and freedom. ' +
    'Defined cel-shading on the skin and clothing with bright natural sky lighting.',
  'Viewed from a low-angle perspective through tall, dark, silhouetted grass blades, the character stands looking down toward the camera. ' +
    'Behind them is a dramatic, fiery orange, red and purple sunset and the intricate metal grid framework of a power transmission tower. ' +
    'The scene is illuminated by intense, warm golden-hour backlighting.',
  // Atmosphere inspirations
  'Atmosphere inspired by Aria: the character stands on a gondola gliding through the serene canals of a Venetian water city, ' +
    'gentle rippling reflections, soft pastel sky, warm terracotta buildings and a peaceful, healing calm.',
  'Atmosphere inspired by Mushishi: the character stands in a misty ancient forest in rural Japan, soft green light filtering through tall trees, ' +
    'faint glowing white spirit-like mushi drifting in the air, quiet and contemplative mood.',
  'Atmosphere inspired by Mononoke (2007): a vivid ukiyo-e styled world of flat saturated colors, ornate washi-paper textures and patterned sliding doors, ' +
    'theatrical composition with layered decorative motifs surrounding the character.',
  'Atmosphere inspired by Call of the Night: the character stands on an empty city street late at night under a deep indigo sky, ' +
    'glowing vending machines and neon signs, cool blue tones with warm pools of light, moody nocturnal freedom.',
  'Atmosphere inspired by The Tatami Galaxy: flat graphic colors, bold stylized composition, a whimsical collage-like room of tatami mats ' +
    'stretching in impossible directions, saturated pop-art palette and playful surrealism.',
  'Atmosphere inspired by Sonny Boy: a dreamlike surreal void with a minimalist sky, floating school buildings and drifting debris, ' +
    'flat muted colors, no outlines on the background, quiet existential wonder.',
  "Atmosphere inspired by Girls' Last Tour: the character stands small against vast, quiet post-apocalyptic ruins under soft falling snow, " +
    'muted grays and pale light, giant industrial structures fading into fog, melancholy but peaceful.',
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

  let body: { imageB64?: string; imagesB64?: string[]; gallery?: string };
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

  const scene = Math.floor(Math.random() * SCENES.length);
  const charStyle = Math.floor(Math.random() * CHARACTER_STYLES.length);
  const origin = new URL(req.url).origin;
  const styleRef = await loadRef(origin, 'style.png');

  let prompt: string;
  if (n === 1) {
    prompt =
      'The person in the first attached photo is converted into a ' + STYLE + ' ' +
      CHARACTER_STYLES[charStyle] + ' ' + SCENES[scene];
  } else {
    prompt =
      `The ${n} different people in the first ${n} attached photos are all converted into anime characters in ONE single group illustration together — a ` +
      STYLE + ' ' + CHARACTER_STYLES[charStyle] + ' ' + SCENES[scene] +
      ` The illustration must contain exactly ${n} characters, one per attached photo, each preserving that person's real facial features, hair, gender and apparent age. ` +
      'Pose them together naturally as a group in fun, dynamic anime poses — like a group photo of friends in an anime key visual.';
  }
  if (styleRef) {
    prompt +=
      ' Replicate the exact art style of the attached style reference image (line work, shading, eye rendering).';
  }
  prompt +=
    ' The final result must be one cohesive anime illustration, landscape orientation, composed with every face comfortably inside the frame, at least 5% away from every edge. No text, no watermark, no logo.';

  if (body.gallery === 'cindy') prompt += EVERYONE_NOTE;
  const parts: object[] = [{ text: prompt }];
  for (const f of faces) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: f } });
  }
  if (styleRef) parts.push({ inline_data: { mime_type: 'image/png', data: styleRef } });

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
          await saveToGallery(d, 'anime', body.gallery === 'cindy' ? 'cindy' : 'gallery').catch(() => {});
          return NextResponse.json({ image: d, scene });
        }
      }
      lastError = 'no image in gemini response';
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'fetch failed';
    }
  }
  return NextResponse.json({ error: lastError }, { status: 502 });
}
