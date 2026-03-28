"use client";

import { useState } from "react";
import Image from "next/image";
import type { Video } from "@/lib/supabase";

export default function AdminVideoGrid({ videos }: { videos: Video[] }) {
  const [search, setSearch] = useState("");

  const filtered = videos.filter(
    (v) => !search.trim() || v.title.includes(search)
  );

  return (
    <>
      {videos.length > 0 && (
        <div className="relative max-w-md mb-4">
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في المقاطع..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((v) => (
          <a key={v.id} href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
            target="_blank" rel="noopener noreferrer"
            className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow">
            <Image src={v.thumbnail_url} alt={v.title} width={300} height={169}
              className="w-full aspect-video object-cover" />
            <div className="p-2">
              <p className="text-xs text-gray-700 line-clamp-2 font-medium">{v.title}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(v.published_at).toLocaleDateString("ar-EG")}</p>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-16 text-gray-400">
            {search ? "لا توجد نتائج" : "اضغط \"مزامنة من يوتيوب\" لجلب المقاطع"}
          </div>
        )}
      </div>
    </>
  );
}
