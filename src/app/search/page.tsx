import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Video, Playlist } from "@/lib/supabase";
import VideoEmbedCard from "@/components/VideoEmbedCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "البحث — تعلم دينك لتنجو وتسعد" };

interface Props { searchParams: { q?: string } }

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim();
  // Sanitise for PostgREST .or() (commas/parens/wildcards would break the filter)
  const safe = q.replace(/[(),*%]/g, " ").trim();

  let playlists: Playlist[] = [];
  let videos: Video[] = [];

  if (safe) {
    const [plRes, vRes] = await Promise.all([
      supabase
        .from("playlists")
        .select("*")
        .or(`title.ilike.%${safe}%,description.ilike.%${safe}%`)
        .order("published_at", { ascending: false })
        .limit(18),
      supabase
        .from("videos")
        .select("id,youtube_id,title,description,thumbnail_url,published_at,transcript")
        .or(`title.ilike.%${safe}%,description.ilike.%${safe}%,transcript.ilike.%${safe}%`)
        .order("published_at", { ascending: false })
        .limit(48),
    ]);
    playlists = (plRes.data ?? []) as Playlist[];
    videos = (vRes.data ?? []) as unknown as Video[];
  }

  function snippetFor(v: Video): { text: string; q: string } | undefined {
    if (!safe || !v.transcript) return undefined;
    let idx = v.transcript.indexOf(safe);
    if (idx === -1) idx = v.transcript.toLowerCase().indexOf(safe.toLowerCase());
    if (idx === -1) return undefined;
    const start = Math.max(0, idx - 60);
    const end = Math.min(v.transcript.length, idx + safe.length + 90);
    return { text: v.transcript.slice(start, end).trim(), q: safe };
  }

  const total = playlists.length + videos.length;

  return (
    <div>
      {/* Header + search box */}
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">البحث في الموقع</h1>
          <form action="/search" method="GET" className="relative">
            <input name="q" type="text" defaultValue={q} autoFocus
              placeholder="ابحث في المقاطع، قوائم التشغيل، ونصوص الدروس..."
              className="w-full rounded-full px-6 py-3.5 pl-14 text-gray-800 text-base focus:outline-none focus:ring-4 focus:ring-yellow-400/40 shadow-lg" />
            <button type="submit" aria-label="بحث"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-green-700 text-white rounded-full p-2.5 hover:bg-green-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          {q && (
            <p className="text-green-300 text-sm mt-3">
              {total > 0 ? `${total} نتيجة لـ "${q}"` : `لا توجد نتائج لـ "${q}"`}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {!q ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔎</p>
            <p className="text-lg">اكتب كلمة للبحث في كل المقاطع وقوائم التشغيل ونصوص الدروس</p>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">لا توجد نتائج مطابقة</p>
            <p className="text-sm mt-2">جرّب كلمات أخرى أو أقصر</p>
          </div>
        ) : (
          <>
            {/* Playlists */}
            {playlists.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-green-900 mb-5 flex items-center gap-2">
                  <span>📚</span> قوائم التشغيل <span className="text-sm font-normal text-gray-400">({playlists.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {playlists.map((pl) => <PlaylistCard key={pl.id} playlist={pl} />)}
                </div>
              </section>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-green-900 mb-5 flex items-center gap-2">
                  <span>🎬</span> المقاطع <span className="text-sm font-normal text-gray-400">({videos.length})</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.map((v) => <VideoEmbedCard key={v.id} video={v} variant="grid" snippet={snippetFor(v)} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link href={`/videos/playlist/${playlist.youtube_playlist_id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex">
      {playlist.thumbnail_url ? (
        <Image src={playlist.thumbnail_url} alt={playlist.title} width={160} height={90}
          className="w-32 aspect-video object-cover shrink-0" />
      ) : (
        <div className="w-32 aspect-video bg-green-100 flex items-center justify-center shrink-0 text-green-400 text-2xl">📚</div>
      )}
      <div className="p-3 flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-green-700 transition-colors">{playlist.title}</h3>
        <p className="text-green-600 text-xs mt-1">{playlist.video_count} مقطع</p>
      </div>
    </Link>
  );
}
