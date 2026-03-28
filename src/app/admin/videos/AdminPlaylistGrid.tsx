"use client";

import { useState } from "react";
import Image from "next/image";
import type { Playlist } from "@/lib/supabase";

interface Video {
  id: string;
  youtube_id: string;
  title: string;
  thumbnail_url: string;
  published_at: string;
}

export default function AdminPlaylistGrid({ playlists }: { playlists: Playlist[] }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [videos, setVideos] = useState<Record<string, Video[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = search.trim()
    ? playlists.filter((p) => p.title.includes(search) || p.description?.includes(search))
    : playlists;

  async function toggleExpand(pl: Playlist) {
    const plId = pl.youtube_playlist_id;
    if (expandedId === plId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(plId);

    // Load videos if not cached
    if (!videos[plId]) {
      setLoadingId(plId);
      try {
        const res = await fetch(`/api/playlists/${plId}/videos`);
        const data = await res.json();
        setVideos((prev) => ({ ...prev, [plId]: data }));
      } catch {
        setVideos((prev) => ({ ...prev, [plId]: [] }));
      }
      setLoadingId(null);
    }
  }

  return (
    <>
      {/* Search */}
      <div className="relative max-w-md mb-6">
        <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في قوائم التشغيل..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {search ? "لا توجد نتائج" : "لا توجد قوائم تشغيل — اضغط \"مزامنة قوائم التشغيل\""}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pl) => {
            const plId = pl.youtube_playlist_id;
            const isExpanded = expandedId === plId;
            const isLoading = loadingId === plId;
            const plVideos = videos[plId] ?? [];

            return (
              <div key={pl.id} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Playlist header — clickable to expand */}
                <button
                  onClick={() => toggleExpand(pl)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-right"
                >
                  {pl.thumbnail_url ? (
                    <Image src={pl.thumbnail_url} alt={pl.title}
                      width={120} height={68}
                      className="rounded-lg object-cover shrink-0 aspect-video w-[120px]" />
                  ) : (
                    <div className="w-[120px] aspect-video bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm leading-relaxed line-clamp-1">{pl.title}</h3>
                    {pl.description && (
                      <p className="text-gray-400 text-xs mt-1 line-clamp-1">{pl.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-green-600 text-xs font-medium">{pl.video_count} مقطع</span>
                      {pl.published_at && (
                        <span className="text-gray-400 text-xs">
                          {new Date(pl.published_at).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded videos */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    {isLoading ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="bg-gray-200 rounded-lg h-28 animate-pulse" />
                        ))}
                      </div>
                    ) : plVideos.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">لا توجد مقاطع في هذه القائمة</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {plVideos.map((v) => (
                          <a key={v.id} href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
                            target="_blank" rel="noopener noreferrer"
                            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <Image src={v.thumbnail_url} alt={v.title} width={240} height={135}
                              className="w-full aspect-video object-cover" />
                            <div className="p-2">
                              <p className="text-xs text-gray-700 line-clamp-2 font-medium">{v.title}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(v.published_at).toLocaleDateString("ar-EG")}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {plVideos.length > 0 && (
                      <div className="text-center mt-3">
                        <a href={`https://www.youtube.com/playlist?list=${plId}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-xs font-medium">
                          فتح القائمة على يوتيوب ←
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
