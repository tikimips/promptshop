import { NextResponse } from 'next/server';
import { saveToGallery } from '../_lib/gallery';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

// Upload booths send whole snapshots (possibly groups), not per-person face crops.
const EVERYONE_NOTE = " IMPORTANT OVERRIDE ON PEOPLE: the attached photo(s) are ordinary snapshots, and one snapshot may contain several people. Ignore any earlier statement about exactly how many people or characters the image must contain. The finished image must include EVERY person visible across the attached photo(s) — the same people, no more, no fewer, adults and children alike — and ALL of them are equal co-stars: every one of them appears together in the FOREGROUND, in the same themed role, uniform or costume treatment as each other, posed as one group at similar size and prominence, like teammates in the action or heroes in the key visual. Never render any of them as a spectator, background figure or crowd member. Each preserves that person's real facial features, expression, skin tone, apparent age, gender and hair exactly.";

const TEAMS: Record<string, string> = {
  yankees:
    'a New York Yankees baseball player in the authentic navy pinstripe home uniform and navy NY cap, mid-swing batting at home plate in Yankee Stadium at night, packed stands, the famous white frieze visible, bright stadium lights',
  mets:
    'a New York Mets baseball player in the authentic white home uniform with blue and orange trim and blue NY cap, mid-swing batting at home plate in Citi Field, packed stands, evening game lighting',
  dodgers:
    'a Los Angeles Dodgers baseball player in the authentic white home uniform with Dodger blue script and blue LA cap, mid-swing batting at home plate in Dodger Stadium at golden hour, the hexagonal scoreboards and San Gabriel mountains visible, packed stands',
  cubs:
    'a Chicago Cubs baseball player in the authentic white pinstripe home uniform and blue C cap, mid-swing batting at home plate in Wrigley Field on a sunny day, the ivy-covered brick outfield wall and classic scoreboard visible, packed stands',
  giants:
    'a San Francisco Giants baseball player in the authentic cream home uniform with orange and black trim and black SF cap, mid-swing batting at home plate in Oracle Park, the bay and brick right-field wall visible, packed stands',
  athletics:
    'an Athletics baseball player in the authentic kelly green and gold uniform and green cap, mid-swing batting at home plate in a packed baseball stadium, green and gold branding throughout, bright stadium lights',
  usopen:
    'a professional tennis player in modern athletic wear hitting a powerful forehand on the iconic blue hard court of Arthur Ashe Stadium at the US Open at night, US Open branding on the court, packed stadium crowd, dramatic lighting',
  knicks:
    'a New York Knicks basketball player in the authentic blue and orange Knicks jersey driving hard to the basket at Madison Square Garden, packed crowd, the famous ceiling of the Garden visible, dramatic arena lighting',
  lakers:
    'a Los Angeles Lakers basketball player in the authentic purple and gold Lakers jersey rising for a dunk in the Lakers home arena in Los Angeles, packed crowd, championship banners visible in the rafters, dramatic arena lighting',
  warriors:
    'a Golden State Warriors basketball player in the authentic blue and gold Warriors jersey shooting a three-pointer at Chase Center in San Francisco, packed crowd, dramatic arena lighting',
  sparks:
    'a Los Angeles Sparks WNBA basketball player in the authentic purple and gold Sparks jersey driving hard to the basket at Crypto.com Arena in Los Angeles, packed crowd, dramatic arena lighting',
  liberty:
    'a New York Liberty WNBA basketball player in the authentic seafoam green and black Liberty jersey rising for a layup at Barclays Center in Brooklyn, packed crowd, dramatic arena lighting',
  sun:
    'a Connecticut Sun WNBA basketball player in the authentic red-orange and navy Sun jersey shooting a jump shot at Mohegan Sun Arena in Uncasville, Connecticut, packed crowd, dramatic arena lighting',
  sky:
    'a Chicago Sky WNBA basketball player in the authentic sky blue and yellow Sky jersey driving fast to the basket at Wintrust Arena in Chicago, packed crowd, dramatic arena lighting',
  valkyries:
    'a Golden State Valkyries WNBA basketball player in the authentic violet and black Valkyries jersey shooting a three-pointer at Chase Center in San Francisco, packed crowd, dramatic arena lighting',
  nygiants:
    'a New York Giants NFL football player in the authentic royal blue jersey, gray pants and red trim, charging forward with the football at MetLife Stadium, helmet tucked under one arm so the face is fully visible, packed crowd, dramatic stadium lighting',
  nyjets:
    'a New York Jets NFL football player in the authentic gotham green and white uniform, striking a power pose with the football at MetLife Stadium, helmet tucked under one arm so the face is fully visible, packed crowd, dramatic stadium lighting',
  rams:
    'a Los Angeles Rams NFL football player in the authentic royal blue and sol-yellow uniform, mid-stride with the football at SoFi Stadium, helmet tucked under one arm so the face is fully visible, packed crowd, the massive Infinity Screen visible above, dramatic lighting',
  chargers:
    'a Los Angeles Chargers NFL football player in the authentic powder blue and gold-bolt uniform, throwing a pass at SoFi Stadium, helmet tucked under one arm in the other hand so the face is fully visible, packed crowd, dramatic lighting',
  niners:
    "a San Francisco 49ers NFL football player in the authentic scarlet red and gold uniform, sprinting with the football at Levi's Stadium, helmet tucked under one arm so the face is fully visible, packed crowd, golden California light",
  bears:
    'a Chicago Bears NFL football player in the authentic navy and orange uniform, in a fierce lineman stance with the football at Soldier Field, helmet tucked under one arm so the face is fully visible, packed crowd, overcast Chicago sky, dramatic lighting',
  olympics:
    'a Team USA Olympic athlete in an official Team USA warm-up jacket standing proudly on the top step of the Olympic medal podium at the Paris 2024 Summer Olympics, a gold medal around their neck, one hand raised in celebration, Paris 2024 podium branding, photographers and a cheering crowd in the background, confetti in the air, the Eiffel Tower visible in the distance at dusk',
  nbc: 'broadcast booth scene', // handled by the dedicated branch below
};

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: { imageB64?: string; imagesB64?: string[]; team?: string; gallery?: string };
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
  const isNbc = body.team === 'nbc';
  const team = TEAMS[String(body.team)] ? String(body.team) : 'yankees';

  const preserve =
    n === 1
      ? "Preserve the person's real facial features, expression, skin tone, apparent age, gender and hair exactly, match the body build to the person"
      : `The image must contain exactly ${n} people, one per attached face photo, each preserving that person's real facial features, expression, skin tone, apparent age, gender and hair exactly`;

  let prompt: string;
  const parts: object[] = [];

  if (isNbc) {
    const guests =
      n === 1
        ? 'Replace the person on the RIGHT with one person wearing a sharp professional suit, whose face is taken from the first attached photo'
        : `Replace the person on the RIGHT with the ${n} people from the first ${n} attached photos, all wearing sharp professional suits, arranged naturally next to him in the booth`;
    prompt =
      'A photorealistic broadcast-television photo recreating the last attached reference image: sports commentators side by side at night in a broadcast booth high above a packed stadium. ' +
      'Keep the commentator on the LEFT side of the reference photo exactly as he appears there — same face, glasses, gray suit, pose and microphone. ' +
      guests + `. ${preserve}. ` +
      'They hold black broadcast microphones and smile at the camera. Same framing, lighting, color grading and stadium crowd background as the reference so it looks like one seamless professional broadcast photo, not a collage. ' +
      'Landscape orientation, composed with every face comfortably inside the frame, at least 5% away from every edge. No added text overlays, no watermark.';
    if (body.gallery === 'cindy') prompt += EVERYONE_NOTE;
    parts.push({ text: prompt });
    for (const f of faces) parts.push({ inline_data: { mime_type: 'image/jpeg', data: f } });
    try {
      const origin = new URL(req.url).origin;
      const r = await fetch(`${origin}/sports-refs/nbc-booth.jpg`, { cache: 'force-cache' });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        parts.push({ inline_data: { mime_type: 'image/jpeg', data: buf.toString('base64') } });
      }
    } catch {
      // reference unavailable; prompt alone still describes the scene
    }
  } else {
    const subject =
      n === 1
        ? `the person in the attached photo as ${TEAMS[team]}`
        : `the ${n} people in the ${n} attached photos together as teammates — each of them is ${TEAMS[team]} — posed together naturally in one scene like a team photo or mid-game celebration`;
    prompt =
      `A photorealistic, cinematic professional sports photograph of ${subject}. ${preserve}, ` +
      'and match the lighting, color grading, grain and camera angle of the scene so it looks like one single professionally shot photograph, not a collage or paste. ' +
      'Landscape orientation, composed with every face comfortably inside the frame, at least 5% away from every edge. No text overlays, no watermark.';
    if (body.gallery === 'cindy') prompt += EVERYONE_NOTE;
    parts.push({ text: prompt });
    for (const f of faces) parts.push({ inline_data: { mime_type: 'image/jpeg', data: f } });
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
        if (d) {
          await saveToGallery(d, 'sports', body.gallery === 'cindy' ? 'cindy' : 'gallery').catch(() => {});
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
