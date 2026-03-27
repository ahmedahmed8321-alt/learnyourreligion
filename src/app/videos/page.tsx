import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Playlist } from "@/lib/supabase";

export const revalidate = 3600;
export const metadata = { title: "المقاطع المرئية — تعلم دينك لتنجو وتسعد" };

export default async function VideosPage() {
  const { data, count } = await supabase
    .from("playlists")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false });

  const playlists = (data ?? []) as Playlist[];
  const hasPlaylists = playlists.length > 0;

  return (
    <div>
      {/* Page header */}
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-1">المقاطع المرئية</h1>
            <p className="text-green-300 text-sm">
              {hasPlaylists
                ? `${(count ?? 0).toLocaleString("ar-EG")} قائمة تشغيل — الشيخ محمود لاشين`
                : "جميع المقاطع — الشيخ محمود لاشين"}
            </p>
          </div>
          <Link href="/videos/all"
            className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold px-6 py-2.5 rounded-full text-sm transition-colors shadow">
            عرض كل المقاطع →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {!hasPlaylists ? (
          <NoPlaylists />
        ) : (
          <>
            {/* Category label */}
            <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              اختر قائمة تشغيل لعرض مقاطعها
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {playlists.map((pl) => (
                <PlaylistCard key={pl.id} playlist={pl} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link href={`/videos/playlist/${playlist.youtube_playlist_id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Thumbnail */}
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
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/40 transition-colors flex items-center justify-center">
          <span className="bg-yellow-400 text-green-900 rounded-full px-5 py-2 text-sm font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-300">
            عرض القائمة
          </span>
        </div>
        {/* Video count badge */}
        <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
          {playlist.video_count} مقطع
        </span>
      </div>

      {/* Info */}
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

function NoPlaylists() {
  return (
    <div className="text-center py-20 space-y-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      </div>
      <p className="text-lg font-semibold text-gray-600">لم يتم مزامنة قوائم التشغيل بعد</p>
      <p className="text-sm text-gray-400">اذهب إلى لوحة التحكم واضغط "مزامنة قوائم التشغيل"</p>
      <Link href="/videos/all"
        className="inline-block mt-2 bg-green-700 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-green-600 transition-colors">
        عرض كل المقاطع بدلاً من ذلك →
      </Link>
    </div>
  );
}
