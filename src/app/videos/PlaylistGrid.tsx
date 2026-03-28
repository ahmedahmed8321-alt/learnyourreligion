"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import type { Playlist } from "@/lib/supabase";

export default function PlaylistGrid({ playlists }: { playlists: Playlist[] }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? playlists.filter((p) =>
        p.title.includes(search) || p.description?.includes(search)
      )
    : playlists;

  return (
    <>
      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="ابحث في قوائم التشغيل..." />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">{search ? `لا توجد نتائج لـ "${search}"` : "لا توجد قوائم تشغيل"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}
    </>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link href={`/videos/playlist/${playlist.youtube_playlist_id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative overflow-hidden">
        {playlist.thumbnail_url ? (
          <Image src={playlist.thumbnail_url} alt={playlist.title}
            width={400} height={225}
            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <svg className="w-14 h-14 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/40 transition-colors flex items-center justify-center">
          <span className="bg-yellow-400 text-green-900 rounded-full px-5 py-2 text-sm font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-300">
            عرض القائمة
          </span>
        </div>
        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
          {playlist.video_count} مقطع
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-sm leading-relaxed line-clamp-2 group-hover:text-green-700 transition-colors flex-1">
          {playlist.title}
        </h3>
        {playlist.description && (
          <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">{playlist.description}</p>
        )}
        <div className="flex items-center gap-1 mt-3 text-green-600 text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          فتح القائمة
        </div>
      </div>
    </Link>
  );
}
