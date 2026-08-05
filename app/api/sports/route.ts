import { NextResponse } from 'next/server';

const MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

export const maxDuration = 60;

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
};

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  let body: { imageB64?: string; team?: string; gender?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!body?.imageB64) {
    return NextResponse.json({ error: 'imageB64 required' }, { status: 400 });
  }
  const team = TEAMS[String(body.team)] ? String(body.team) : 'yankees';
  const gender = body.gender === 'woman' ? 'woman' : 'man';

  const prompt =
    `A photorealistic, cinematic professional sports photograph of the person in the attached photo (a ${gender}) as ${TEAMS[team]}. ` +
    "Preserve the person's real facial features, expression, skin tone, apparent age and hair exactly, match the body build to the person, " +
    'and match the lighting, color grading, grain and camera angle of the scene so it looks like one single professionally shot photograph, not a collage or paste. ' +
    'Landscape orientation. No text overlays, no watermark.';

  const parts = [
    { text: prompt },
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
