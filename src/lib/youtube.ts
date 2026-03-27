const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;
const BASE = "https://www.googleapis.com/youtube/v3";

export interface YoutubeVideo {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount?: number;
}

export interface YoutubePlaylist {
  playlistId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
  publishedAt: string;
}

/** Fetch ALL videos from the uploads playlist (paginated) */
export async function fetchChannelVideos(): Promise<YoutubeVideo[]> {
  const channelRes = await fetch(
    `${BASE}/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
  );
  const channelData = await channelRes.json();
  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist");

  const allVideoIds: string[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL(`${BASE}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", API_KEY);
    if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

    const res = await fetch(url.toString());
    const data = await res.json();
    (data.items ?? []).forEach((item: any) =>
      allVideoIds.push(item.snippet.resourceId.videoId)
    );
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  if (allVideoIds.length === 0) return [];

  const allVideos: YoutubeVideo[] = [];
  for (let i = 0; i < allVideoIds.length; i += 50) {
    const batch = allVideoIds.slice(i, i + 50);
    const res = await fetch(
      `${BASE}/videos?part=snippet,statistics&id=${batch.join(",")}&key=${API_KEY}`
    );
    const data = await res.json();
    (data.items ?? []).forEach((v: any) =>
      allVideos.push({
        youtubeId: v.id,
        title: v.snippet.title,
        description: v.snippet.description,
        thumbnailUrl:
          v.snippet.thumbnails?.high?.url ||
          v.snippet.thumbnails?.medium?.url ||
          v.snippet.thumbnails?.default?.url,
        publishedAt: v.snippet.publishedAt,
        viewCount: parseInt(v.statistics?.viewCount ?? "0", 10),
      })
    );
  }
  return allVideos;
}

/** Fetch ALL playlists for the channel */
export async function fetchChannelPlaylists(): Promise<YoutubePlaylist[]> {
  const allPlaylists: YoutubePlaylist[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL(`${BASE}/playlists`);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("channelId", CHANNEL_ID);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", API_KEY);
    if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

    const res = await fetch(url.toString());
    const data = await res.json();

    (data.items ?? []).forEach((p: any) =>
      allPlaylists.push({
        playlistId: p.id,
        title: p.snippet.title,
        description: p.snippet.description ?? "",
        thumbnailUrl:
          p.snippet.thumbnails?.high?.url ||
          p.snippet.thumbnails?.medium?.url ||
          p.snippet.thumbnails?.default?.url,
        videoCount: p.contentDetails?.itemCount ?? 0,
        publishedAt: p.snippet.publishedAt,
      })
    );
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return allPlaylists;
}

/** Fetch all video IDs (with position) for a single playlist */
export async function fetchPlaylistVideoIds(
  playlistId: string
): Promise<{ videoId: string; position: number }[]> {
  const items: { videoId: string; position: number }[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL(`${BASE}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", API_KEY);
    if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

    const res = await fetch(url.toString());
    const data = await res.json();

    (data.items ?? []).forEach((item: any) =>
      items.push({
        videoId: item.snippet.resourceId.videoId,
        position: item.snippet.position ?? 0,
      })
    );
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return items;
}
