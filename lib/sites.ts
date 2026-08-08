import { list, put, del } from '@vercel/blob';

// Published photobooth site configs, stored as small JSON blobs.
export type SiteConfig = {
  slug: string;
  title: string;
  password: string;
  themes: string[];
  product: 'upload';
  createdAt: number;
};

export const SITE_SLUG_RE = /^[a-z0-9-]{2,32}$/;
export const RESERVED_SLUGS = ['publisher'];
export const AVAILABLE_THEMES = ['sports', 'film', 'superhero', 'anime'];

const KEY = (slug: string) => `sites/${slug}.json`;

export async function getSite(slug: string): Promise<SiteConfig | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  if (!SITE_SLUG_RE.test(slug)) return null;
  try {
    const { blobs } = await list({ prefix: KEY(slug), limit: 10 });
    const b = blobs.find((x) => x.pathname === KEY(slug));
    if (!b) return null;
    const r = await fetch(`${b.url}?v=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as SiteConfig;
  } catch {
    return null;
  }
}

export async function listSites(): Promise<SiteConfig[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  try {
    const { blobs } = await list({ prefix: 'sites/', limit: 200 });
    const out: SiteConfig[] = [];
    for (const b of blobs) {
      if (!b.pathname.endsWith('.json')) continue;
      try {
        const r = await fetch(`${b.url}?v=${Date.now()}`, { cache: 'no-store' });
        if (r.ok) out.push((await r.json()) as SiteConfig);
      } catch {
        // skip unreadable configs
      }
    }
    return out.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function saveSite(cfg: SiteConfig): Promise<void> {
  await removeSite(cfg.slug); // clear any prior version first
  await put(KEY(cfg.slug), JSON.stringify(cfg), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
  });
}

export async function removeSite(slug: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix: KEY(slug), limit: 10 });
    for (const b of blobs) {
      if (b.pathname === KEY(slug)) await del(b.url);
    }
  } catch {
    // nothing to remove
  }
}
