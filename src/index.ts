import type { NuclearPlugin, NuclearPluginAPI } from '@nuclearplayer/plugin-sdk';
import { BandcampClient } from './client.ts';
import { DASHBOARD_PROVIDER_ID, PLAYLISTS_PROVIDER_ID } from './config.ts';
import { createDashboardProvider } from './dashboard-provider.ts';
import { createPlaylistsProvider } from './playlists-provider.ts';

const plugin: NuclearPlugin = {
  onEnable(api: NuclearPluginAPI) {
    const client = new BandcampClient(api.Http.fetch, api.Logger);
    api.Providers.register(createDashboardProvider(client));
    api.Providers.register(createPlaylistsProvider(client));
  },

  onDisable(api: NuclearPluginAPI) {
    api.Providers.unregister(DASHBOARD_PROVIDER_ID);
    api.Providers.unregister(PLAYLISTS_PROVIDER_ID);
  },
};

export default plugin;
