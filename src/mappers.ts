import type { AlbumRef, ArtistCredit, ArtistRef, ArtworkSet, PlaylistRef, ProviderRef, Track } from '@nuclearplayer/model';
import { BANDCAMP_IMAGE_BASE, PROVIDER_SOURCE } from './config.ts';
import type { BcRawAlbumEntry, BcRawDiscoverItem, BcRawNotableItem, BcRawShow, BcRawShowDetail, BcRawShowTrack } from './types.ts';

function toArtwork(imageUrl: string | undefined): ArtworkSet | undefined {
  if (!imageUrl) return undefined;
  return { items: [{ url: imageUrl }] };
}

function toProviderRef(url: string | undefined, id: string): ProviderRef {
  return { provider: PROVIDER_SOURCE, id, url };
}

function toArtistRef(name: string): ArtistRef {
  return { name, source: toProviderRef(undefined, name) };
}

function albumArtUrl(artId: number): string {
  return `${BANDCAMP_IMAGE_BASE}a${artId}_16.jpg`;
}

function showImageUrl(imageId: number): string {
  return `${BANDCAMP_IMAGE_BASE}${imageId}_25.jpg`;
}

function trackImageUrl(imageId: number): string {
  return `${BANDCAMP_IMAGE_BASE}a${imageId}_9.jpg`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function notableItemToAlbumRef(item: BcRawNotableItem): AlbumRef {
  const imageUrl = item.imageId ? `${BANDCAMP_IMAGE_BASE}a${item.imageId}_16.jpg` : undefined;
  return {
    title: item.title ?? '',
    artists: item.artistName ? [toArtistRef(item.artistName)] : undefined,
    artwork: toArtwork(imageUrl),
    source: toProviderRef(item.itemUrl, item.itemUrl ?? String(item.itemId ?? '')),
  };
}

export function notableItemToTrack(item: BcRawNotableItem): Track {
  const imageUrl = item.imageId ? `${BANDCAMP_IMAGE_BASE}a${item.imageId}_16.jpg` : undefined;
  const artist: ArtistCredit = { name: item.artistName ?? 'Unknown', roles: [] };
  return {
    title: item.title ?? '',
    artists: [artist],
    artwork: toArtwork(imageUrl),
    source: toProviderRef(item.itemUrl, item.itemUrl ?? String(item.itemId ?? '')),
  };
}

export function discoverItemToAlbumRef(item: BcRawDiscoverItem): AlbumRef {
  return {
    title: item.title,
    artists: item.artist ? [toArtistRef(item.artist)] : undefined,
    artwork: item.art_id ? toArtwork(albumArtUrl(item.art_id)) : undefined,
    source: toProviderRef(item.tralbum_url, item.tralbum_url ?? item.title),
  };
}

export function discoverItemToTrack(item: BcRawDiscoverItem): Track {
  const artist: ArtistCredit = { name: item.artist ?? 'Unknown', roles: [] };
  return {
    title: item.title,
    artists: [artist],
    artwork: item.art_id ? toArtwork(albumArtUrl(item.art_id)) : undefined,
    source: toProviderRef(item.tralbum_url, item.tralbum_url ?? item.title),
  };
}

export function albumEntryToAlbumRef(entry: BcRawAlbumEntry): AlbumRef {
  const dateLabel = entry.date ? ` (${formatDate(entry.date)})` : '';
  return {
    title: `${entry.title}${dateLabel}`,
    artists: entry.artistName ? [toArtistRef(entry.artistName)] : undefined,
    artwork: toArtwork(entry.imageUrl),
    source: toProviderRef(entry.albumUrl ?? entry.url, entry.albumUrl ?? entry.url),
  };
}

export function showToPlaylistRef(show: BcRawShow): PlaylistRef {
  const detail = show as BcRawShowDetail;
  const id = show.id ?? detail.show_id ?? 0;
  const showUrl = `https://bandcamp.com/radio?show=${id}`;
  const name = show.title
    ? (show.subtitle ? `${show.title} – ${show.subtitle}` : show.title)
    : (show.subtitle ?? `Bandcamp Weekly #${show.id}`);
  const imageId = detail.show_image_id ?? show.image_id;
  return {
    id: String(id),
    name,
    artwork: imageId ? toArtwork(showImageUrl(imageId)) : undefined,
    source: toProviderRef(showUrl, String(id)),
  };
}

export function rawShowTrackToNuclearTrack(track: BcRawShowTrack): Track {
  const artistName = track.artist_name ?? track.band_name ?? track.artist ?? 'Unknown';
  const title = track.title ?? track.name ?? 'Unknown';
  const url = track.track_url ?? track.url;
  const imageId = track.track_art_id ?? track.image_id ?? track.art_id;
  return {
    title,
    artists: [{ name: artistName, roles: [] }],
    artwork: imageId ? toArtwork(trackImageUrl(imageId)) : undefined,
    durationMs: undefined,
    source: toProviderRef(url, url ?? title),
  };
}
