import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Video, Playlist } from "@/lib/supabase";

export const revalidate = 3600;

const PAGE_SIZE = 24;

interface Props {
  params: { id: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props) {
  const { data } = await supabase
    .from("playlists")
    .select("title")
    .eq("youtube_playlist_id", params.id)
    .single();
  return { title: `${data?.title ?? "قائمة التشغيل"} — تعلم دينك لتنجو وتسعد` };
}

export default async function PlaylistPage({ params, searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Get playlist info
  const { data: plData } = await supabase
    .from("playlists")
    .select("*")
    .eq("youtube_playlist_id", params.id)
    .single();

  const playlist = plData as Playlist | null;

  // Get videos in this playlist (join via video_playlists)
  const { data: vpData, count } = await supabase
    .from("video_playlists")
    .select("video_youtube_id, position", { count: "exact" })
    .eq("playlist_youtube_id", params.id)
    .order("position", { ascending: true })
    .range(from, to);

  const videoIds = (vpData ?? []).map((r: any) => r.video_youtube_id);

  let videos: Video[] = [];
  if (videoIds.length > 0) {
    const { data: vData } = await supabase
      .from("videos")
      .select("*")
      .in("youtube_id", videoIds);

    // Sort by playlist position
    const posMap = Object.fromEntries(
      (vpData ?? []).map((r: any) => [r.video_youtube_id, r.position])
    );
    videos = ((vData ?? []) as Video[]).sort(
      (a, b) => (posMap[a.youtube_id] ?? 0) - (posMap[b.youtube_id] ?? 0)
    );
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-700">الرئيسية</Link>
        <span className="mx-2">›</span>
        <Link href="/videos" className="hover:text-green-700">المقاطع</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-600 line-clamp-1">{playlist?.title}</span>
      </nav>

      {/* Playlist header */}
      {playlist && (
        <div className="flex gap-5 mb-8 bg-white rounded-2xl p-5 shadow">
          {playlist.thumbnail_url && (
            <Image src={playlist.thumbnail_url} alt={playlist.title}
              width={200} height={112}
              className="rounded-xl object-cover shrink-0 hidden sm:block" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-green-900 mb-2">{playlist.title}</h1>
            {playlist.description && (
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{playlist.description}</p>
            )}
            <p className="text-green-600 text-sm font-medium mt-2">{count ?? playlist.video_count} مقطع</p>
          </div>
        </div>
      )}

      {/* Videos grid */}
      {videos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">لا توجد مقاطع في هذه القائمة</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
              {page > 1 && (
                <PageLink href={`/videos/playlist/${params.id}?page=${page - 1}`} label="→ السابق" />
              )}
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`d${i}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <PageLink key={p} href={`/videos/playlist/${params.id}?page=${p}`}
                    label={String(p)} active={p === page} />
                )
              )}
              {page < totalPages && (
                <PageLink href={`/videos/playlist/${params.id}?page=${page + 1}`} label="التالي ←" />
              )}
            </div>
          )}
          <p className="text-center text-gray-400 text-sm mt-3">
            صفحة {page} من {totalPages}
          </p>
        </>
      )}
    </div>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <a href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
      target="_blank" rel="noopener noreferrer"
      className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all flex flex-col">
      <div className="relative">
        <Image src={video.thumbnail_url} alt={video.title}
          width={320} height={180}
          className="w-full aspect-video object-cover group-hover:brightness-75 transition-all" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-red-600 text-white rounded-full p-3 shadow-xl">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
            </svg>
          </span>
        </div>
      </div>
      <div className="p-2 flex-1 flex flex-col">
        <h3 className="font-medium text-gray-800 text-xs line-clamp-2 leading-relaxed flex-1">{video.title}</h3>
        <p className="text-gray-400 text-xs mt-1">{new Date(video.published_at).toLocaleDateString("ar-EG")}</p>
      </div>
    </a>
  );
}

function PageLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-green-50"
      }`}>
      {label}
    </Link>
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
