# nuclear-plugin-bandcamp-dashboard

A [Nuclear Player](https://nuclearplayer.com/) plugin that integrates [Bandcamp](https://bandcamp.com) as a dashboard and playlist source. Browse curated music, editorial picks, and Bandcamp Weekly radio shows directly inside Nuclear.

No Bandcamp account required. No API key. No streaming — discovery and browsing only.

---

## Dashboard Sections

| Nuclear Section | Bandcamp Source | Description |
|---|---|---|
| **Top Albums** | [Album of the Day](https://daily.bandcamp.com/album-of-the-day) | The last 7 daily editorial picks from Bandcamp Daily, with artist name and date |
| **New Releases** | [New & Notable](https://bandcamp.com) | ~20 hand-selected albums from the Bandcamp homepage, updated regularly by the editorial team |
| **Top Tracks** | New & Notable | Same source as New Releases, displayed as individual tracks |
| **Top Playlists** | [Bandcamp Weekly](https://bandcamp.com/radio) | The 10 most recent Bandcamp Weekly / Bandcamp Selects radio episodes |

Clicking an album or track opens a search in Nuclear for that artist and title. Clicking a playlist opens the full track list of that radio episode.

> **Tip:** Install the [**Bandcamp plugin by nukeop**](https://github.com/NuclearPlayer/nuclear-plugin-bandcamp) alongside this one. It adds Bandcamp as a streaming and metadata provider, so clicking an album or track here will resolve directly to Bandcamp audio instead of falling back to a generic search.

---

## Features

- **Album of the Day** — editorial picks with cover art, artist, and date label
- **New & Notable** — current releases chosen by Bandcamp's editorial team
- **Bandcamp Weekly / Bandcamp Selects** — full track listings with cover art for each episode; playable as a playlist
- No external dependencies — all data fetched directly via Nuclear's built-in HTTP client

---

## Installation

### Manual (development)

1. Clone this repository
2. In Nuclear: **Preferences → Plugins → Add Plugin** → select the cloned folder
3. Enable the plugin
4. Open the Dashboard and select **Bandcamp** from the provider dropdown

### From the Nuclear Plugin Registry

Once published, search for **Bandcamp Dashboard** in Nuclear's plugin browser.

---

## How It Works

All data comes from Bandcamp's own internal APIs and HTML — no third-party scraping library.

| Source | Method |
|---|---|
| New & Notable | `POST https://bandcamp.com/api/homepage_api/1/notable_tralbums_data` — the same endpoint the Bandcamp homepage Vue app calls |
| Album of the Day | `GET https://daily.bandcamp.com/album-of-the-day` + DOM parsing (CSS selector `[class~="aotd"]`) |
| Show list | `GET https://bandcamp.com/api/bcweekly/1/list` |
| Show detail / tracks | `POST https://bandcamp.com/api/bcweekly/1/get` with `{ id }` |

Images use Bandcamp's public CDN at `https://f4.bcbits.com/img/`.

---

## Project Structure

```
src/
  index.ts              Plugin entry point, registers both providers
  config.ts             API URLs and constants
  client.ts             HTTP client — all Bandcamp API calls
  dashboard-provider.ts DashboardProvider factory
  playlists-provider.ts PlaylistsProvider factory (Bandcamp Weekly track lists)
  mappers.ts            Bandcamp API types → Nuclear model types
  types.ts              TypeScript interfaces for raw Bandcamp responses
```

---

## Limitations

- **No streaming** — this plugin does not stream audio. Clicking an album or track triggers a Nuclear search. Install the [Bandcamp plugin by nukeop](https://github.com/NuclearPlayer/nuclear-plugin-bandcamp) to resolve results directly from Bandcamp.
- **No authentication** — only publicly available, unauthenticated data.
- **Bandcamp API changes** — Bandcamp's internal APIs are undocumented and may change without notice.

---

## License

MIT
