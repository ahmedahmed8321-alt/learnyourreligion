"use client";

import Link from "next/link";
import Image from "next/image";
import VideoEmbedCard from "@/components/VideoEmbedCard";
import type { Video } from "@/lib/supabase";

export interface SearchPlaylist {
  id: string;
  youtube_playlist_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_count: number;
}
export interface SearchVideo extends Video {
  snippet?: { text: string; q: string } | null;
}

/** Renders combined search results: matching playlists + videos (with transcript snippets). */
export default function SearchResults({
  playlists, videos, loading, query,
}: {
  playlists: SearchPlaylist[]; videos: SearchVideo[]; loading: boolean; query: string;
}) {
  if (loading) {
    return <p className="text-center py-12 text-gray-400 text-sm">جاري البحث...</p>;
  }
  const total = playlists.length + videos.length;
  if (total === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="font-medium">لا توجد نتائج لـ &quot;{query}&quot;</p>
        <p className="text-sm mt-2">جرّب كلمات أخرى أو أقصر</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {playlists.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <span>📚</span> قوائم التشغيل <span className="text-sm font-normal text-gray-400">({playlists.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <Link key={pl.id} href={`/videos/playlist/${pl.youtube_playlist_id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex">
                {pl.thumbnail_url ? (
                  <Image src={pl.thumbnail_url} alt={pl.title} width={160} height={90}
                    className="w-32 aspect-video object-cover shrink-0" />
                ) : (
                  <div className="w-32 aspect-video bg-green-100 flex items-center justify-center shrink-0 text-green-400 text-2xl">📚</div>
                )}
                <div className="p-3 flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-green-700 transition-colors">{pl.title}</h3>
                  <p className="text-green-600 text-xs mt-1">{pl.video_count} مقطع</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <span>🎬</span> المقاطع <span className="text-sm font-normal text-gray-400">({videos.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((v) => (
              <VideoEmbedCard key={v.id} video={v} variant="grid" snippet={v.snippet ?? undefined} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
