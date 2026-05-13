import type { DashboardProvider } from '@nuclearplayer/plugin-sdk';
import type { BandcampClient } from './client.ts';
import { DASHBOARD_PROVIDER_ID, DASHBOARD_PROVIDER_NAME } from './config.ts';
import {
  albumEntryToAlbumRef,
  notableItemToAlbumRef,
  notableItemToTrack,
  showToPlaylistRef,
} from './mappers.ts';

export function createDashboardProvider(client: BandcampClient): DashboardProvider {
  return {
    id: DASHBOARD_PROVIDER_ID,
    kind: 'dashboard',
    name: DASHBOARD_PROVIDER_NAME,
    capabilities: ['topAlbums', 'topTracks', 'newReleases', 'editorialPlaylists'],

    fetchTopAlbums: async () => {
      const entries = await client.getAlbumOfDayEntries();
      return entries.map(albumEntryToAlbumRef);
    },

    fetchTopTracks: async () => {
      const items = await client.getNotableItems();
      return items.map(notableItemToTrack);
    },

    fetchNewReleases: async () => {
      const items = await client.getNotableItems();
      return items.map(notableItemToAlbumRef);
    },

    fetchEditorialPlaylists: async () => {
      const shows = await client.getShows();
      return shows.map(showToPlaylistRef);
    },
  };
}
