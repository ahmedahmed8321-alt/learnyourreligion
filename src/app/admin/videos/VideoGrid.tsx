"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/supabase";

export default function AdminVideoGrid({
  videos,
  currentPage,
  totalPages,
}: {
  videos: Video[];
  currentPage: number;
  totalPages: number;
}) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? videos.filter((v) => v.title.includes(search))
    : videos;

  return (
    <>
      {/* Search (filters within current page) */}
      <div className="relative max-w-md mb-4">
        <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في هذه الصفحة..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
      </div>

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
            {search ? "لا توجد نتائج" : "لا توجد مقاطع"}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          {currentPage > 1 && (
            <Link href={`/admin/videos?page=${currentPage - 1}`}
              className="px-4 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-green-50">
              → السابق
            </Link>
          )}
          {getPageNumbers(currentPage, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`d${i}`} className="px-2 text-gray-400">...</span>
            ) : (
              <Link key={p} href={`/admin/videos?page=${p}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  p === currentPage ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-green-50"
                }`}>
                {p}
              </Link>
            )
          )}
          {currentPage < totalPages && (
            <Link href={`/admin/videos?page=${currentPage + 1}`}
              className="px-4 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:bg-green-50">
              التالي ←
            </Link>
          )}
        </div>
      )}
    </>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
