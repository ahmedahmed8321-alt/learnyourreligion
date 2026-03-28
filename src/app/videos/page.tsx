import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Playlist } from "@/lib/supabase";
import PlaylistGrid from "./PlaylistGrid";

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
        ) : (
          <PlaylistGrid playlists={playlists} />
        )}
      </div>
    </div>
  );
}
