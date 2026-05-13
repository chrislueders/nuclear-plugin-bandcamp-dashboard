import {
  ALBUM_OF_DAY_DAYS,
  BANDCAMP_API_NOTABLE,
  BANDCAMP_API_SHOW_GET,
  BANDCAMP_API_SHOWS_LIST,
  BANDCAMP_DAILY_ALBUM_OF_DAY_URL,
  DISCOVER_LIMIT,
  SHOWS_LIMIT,
} from './config.ts';
import type {
  BcRawAlbumEntry,
  BcRawDiscoverItem,
  BcRawNotableItem,
  BcRawNotableResponse,
  BcRawShow,
  BcRawShowDetail,
} from './types.ts';

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
type Logger = { info(msg: string): void; error(msg: string): void; warn(msg: string): void };

export class BandcampClient {
  constructor(private fetch: FetchFn, private log: Logger) {}

  async getNotableItems(limit = DISCOVER_LIMIT): Promise<BcRawNotableItem[]> {
    try {
      const res = await this.fetch(BANDCAMP_API_NOTABLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8', Accept: 'application/json' },
        body: JSON.stringify({ page_size: limit }),
      });
      this.log.info(`[bc-dashboard] notable status=${res.status}`);
      if (!res.ok) return [];
      const raw = await res.text();
      this.log.info(`[bc-dashboard] notable raw=${raw.slice(0, 300)}`);
      const data = JSON.parse(raw) as BcRawNotableResponse;
      return data.items ?? [];
    } catch (e) {
      this.log.error(`[bc-dashboard] notable error: ${String(e)}`);
      return [];
    }
  }

  async getDiscoverItems(limit = DISCOVER_LIMIT): Promise<BcRawDiscoverItem[]> {
    try {
      const res = await this.fetch('https://bandcamp.com/');
      this.log.info(`[bc-dashboard] discover status=${res.status}`);
      if (!res.ok) return [];
      const html = await res.text();
      return parseDiscoverHtml(html, limit);
    } catch (e) {
      this.log.error(`[bc-dashboard] discover error: ${String(e)}`);
      return [];
    }
  }

  async getAlbumOfDayEntries(days = ALBUM_OF_DAY_DAYS): Promise<BcRawAlbumEntry[]> {
    try {
      const res = await this.fetch(BANDCAMP_DAILY_ALBUM_OF_DAY_URL);
      this.log.info(`[bc-dashboard] album-of-day status=${res.status}`);
      if (!res.ok) return [];
      const html = await res.text();
      this.log.info(`[bc-dashboard] album-of-day html_len=${html.length} snippet=${html.slice(0, 800).replace(/\s+/g, ' ')}`);
      const entries = parseAlbumOfDayHtml(html, days).filter(e => e.imageUrl);
      this.log.info(`[bc-dashboard] album-of-day parsed=${entries.length} entries`);
      if (entries.length > 0) {
        this.log.info(`[bc-dashboard] first entry: ${JSON.stringify(entries[0])}`);
      }
      return entries;
    } catch (e) {
      this.log.error(`[bc-dashboard] album-of-day error: ${String(e)}`);
      return [];
    }
  }

  async getShows(limit = SHOWS_LIMIT): Promise<BcRawShow[]> {
    try {
      const res = await this.fetch(BANDCAMP_API_SHOWS_LIST);
      this.log.info(`[bc-dashboard] shows status=${res.status}`);
      if (!res.ok) return [];
      const raw = await res.text();
      this.log.info(`[bc-dashboard] shows raw=${raw.slice(0, 300)}`);
      const data = JSON.parse(raw) as { results?: BcRawShow[]; shows?: BcRawShow[] } | BcRawShow[];
      const shows = Array.isArray(data) ? data : (data.results ?? data.shows ?? []);
      return shows.slice(0, limit);
    } catch (e) {
      this.log.error(`[bc-dashboard] shows error: ${String(e)}`);
      return [];
    }
  }

  async getShowById(id: number): Promise<BcRawShowDetail | null> {
    try {
      const res = await this.fetch(BANDCAMP_API_SHOW_GET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return null;
      const raw = await res.text();
      this.log.info(`[bc-dashboard] show-detail raw=${raw.slice(0, 500)}`);
      const data = JSON.parse(raw) as { show?: BcRawShowDetail } | BcRawShowDetail;
      return ('show' in data ? data.show : data) ?? null;
    } catch (e) {
      this.log.error(`[bc-dashboard] show-detail error: ${String(e)}`);
      return null;
    }
  }
}

function parseAlbumOfDayHtml(html: string, limit: number): BcRawAlbumEntry[] {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return parseAlbumOfDayFromDom(doc, limit);
  } catch (e) {
    return [];
  }
}

function parseAlbumOfDayFromDom(doc: Document, limit: number): BcRawAlbumEntry[] {
  const results: BcRawAlbumEntry[] = [];
  // daily.bandcamp.com uses class="list-article  aotd" for each card
  const cards = Array.from(doc.querySelectorAll('[class~="aotd"]'));

  for (const card of cards) {
    if (results.length >= limit) break;

    const titleEl = card.querySelector('a.title') as HTMLAnchorElement | null;
    const href = titleEl?.getAttribute('href') ?? '';
    if (!href || !href.includes('/album-of-the-day/')) continue;

    const img = card.querySelector('img') as HTMLImageElement | null;
    const imgSrc = img?.getAttribute('src') ?? '';
    if (!imgSrc) continue;

    const fullTitle = titleEl?.textContent?.trim() ?? '';
    const commaIdx = fullTitle.indexOf(', ');
    let title = fullTitle;
    let artistName: string | undefined;
    if (commaIdx > 0) {
      artistName = fullTitle.slice(0, commaIdx);
      title = fullTitle.slice(commaIdx + 2).replace(/^[""]|[""]$/g, '');
    }

    // Date text is in .article-info-text, after the franchise link
    const infoEl = card.querySelector('.article-info-text');
    let date = '';
    if (infoEl) {
      const franchiseText = infoEl.querySelector('a')?.textContent ?? '';
      date = (infoEl.textContent ?? '')
        .replace(franchiseText, '')
        .replace('·', '')
        .replace('&middot;', '')
        .trim();
    }

    const albumUrl = `https://daily.bandcamp.com${href}`;
    results.push({ url: albumUrl, title, date, imageUrl: imgSrc, artistName, albumUrl });
  }
  return results;
}

function parseDiscoverHtml(html: string, limit: number): BcRawDiscoverItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Try data-blob (Bandcamp's common embedded JSON pattern)
  for (const el of Array.from(doc.querySelectorAll('[data-blob]'))) {
    try {
      const blob = JSON.parse(el.getAttribute('data-blob') ?? '{}') as Record<string, unknown>;
      const items = (blob.new_notable ?? blob.items ?? blob.featured ?? []) as BcRawDiscoverItem[];
      if (items.length > 0) return items.slice(0, limit);
    } catch {}
  }

  // Try embedded JS variables
  const scriptMatches = html.matchAll(/"items"\s*:\s*(\[[\s\S]{10,2000}?\])/g);
  for (const m of scriptMatches) {
    try {
      const items = JSON.parse(m[1]) as BcRawDiscoverItem[];
      if (items.length > 0) return items.slice(0, limit);
    } catch {}
  }

  return [];
}
