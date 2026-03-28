import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Playlist } from "@/lib/supabase";
import SyncButton from "./SyncButton";
import AdminPlaylistGrid from "./AdminPlaylistGrid";

export default async function AdminVideosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const supabase = getSupabaseAdmin();

  const [playlistsRes, videosCount] = await Promise.all([
    supabase.from("playlists").select("*").order("published_at", { ascending: false }),
    supabase.from("videos").select("*", { count: "exact", head: true }),
  ]);

  const playlists = (playlistsRes.data ?? []) as Playlist[];
  const totalVideos = videosCount.count ?? 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-900">المقاطع المرئية</h1>
          <p className="text-gray-400 text-sm mt-1">
            {totalVideos} مقطع في {playlists.length} قائمة تشغيل
          </p>
        </div>
        <SyncButton />
      </div>

      <AdminPlaylistGrid playlists={playlists} />
    </div>
  );
}
