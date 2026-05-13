import type { Playlist, PlaylistItem } from '@nuclearplayer/model';
import type { PlaylistProvider } from '@nuclearplayer/plugin-sdk';
import type { BandcampClient } from './client.ts';
import { DASHBOARD_PROVIDER_NAME, PLAYLISTS_PROVIDER_ID, PROVIDER_SOURCE } from './config.ts';
import { rawShowTrackToNuclearTrack } from './mappers.ts';

export function createPlaylistsProvider(client: BandcampClient): PlaylistProvider {
  return {
    id: PLAYLISTS_PROVIDER_ID,
    kind: 'playlists',
    name: DASHBOARD_PROVIDER_NAME,

    matchesUrl(url: string): boolean {
      return url.includes('bandcamp.com/radio?show=') || url.includes('bandcamp.com/radio?show=');
    },

    async fetchPlaylistByUrl(url: string): Promise<Playlist> {
      const idMatch = url.match(/[?&]show=(\d+)/);
      if (!idMatch) throw new Error(`Invalid show URL: ${url}`);

      const showId = parseInt(idMatch[1], 10);
      const show = await client.getShowById(showId);
      if (!show) throw new Error(`Could not fetch Bandcamp show ${showId}`);

      const now = new Date().toISOString();
      const items: PlaylistItem[] = (show.tracks ?? []).map((track, i) => ({
        id: `show-${showId}-track-${i}`,
        track: rawShowTrackToNuclearTrack(track),
        addedAtIso: now,
      }));

      return {
        id: String(showId),
        name: show.title ?? `Bandcamp Show #${showId}`,
        description: show.desc,
        createdAtIso: show.published_date ?? show.date ?? now,
        lastModifiedIso: now,
        isReadOnly: true,
        origin: { provider: PROVIDER_SOURCE, id: String(showId), url },
        items,
      };
    },
  };
}
