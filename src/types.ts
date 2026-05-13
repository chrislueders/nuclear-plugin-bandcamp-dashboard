export interface BcRawDiscoverItem {
  title: string;
  tralbum_url?: string;
  art_id?: number;
  artist?: string;
  band_name?: string;
  type?: string;
}

export interface BcRawDiscoverResponse {
  items?: BcRawDiscoverItem[];
}

export interface BcRawNotableItem {
  artistName?: string;
  date?: string;
  description?: string;
  genre?: string;
  imageId?: number;
  itemId?: number;
  itemType?: string;
  itemUrl?: string;
  title?: string;
  trackId?: number;
}

export interface BcRawNotableResponse {
  items?: BcRawNotableItem[];
  nextCursor?: string;
}

export interface BcRawAlbumEntry {
  url: string;
  title: string;
  date: string;
  imageUrl?: string;
  artistName?: string;
  albumUrl?: string;
}

export interface BcRawShow {
  id: number;
  title?: string;
  subtitle?: string;
  desc?: string;
  date?: string;
  published_date?: string;
  image_id?: number;
  audio_stream?: { stream_url?: string };
}

export interface BcRawShowDetail extends BcRawShow {
  tracks?: BcRawShowTrack[];
}

export interface BcRawShowsResponse {
  results?: BcRawShow[];
  shows?: BcRawShow[];
}

export interface BcRawShowTrack {
  title?: string;
  name?: string;
  artist_name?: string;
  band_name?: string;
  artist?: string;
  track_url?: string;
  url?: string;
  track_art_id?: number;
  image_id?: number;
  art_id?: number;
  duration?: number;
}
