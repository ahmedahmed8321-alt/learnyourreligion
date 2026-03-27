import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Image from "next/image";
import type { Video } from "@/lib/supabase";

export default async function AdminVideosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("videos")
    .select("*")
    .order("published_at", { ascending: false });

  const videos = (data ?? []) as Video[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">المقاطع المرئية</h1>
        <a href="/api/youtube/sync"
          className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-500 text-sm font-medium transition-colors">
          🔄 مزامنة من يوتيوب
        </a>
      </div>

      <p className="text-gray-400 text-sm mb-4">
        المقاطع تُجلب تلقائياً من القناة — {videos.length} مقطع حالياً
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((v) => (
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
        {videos.length === 0 && (
          <div className="col-span-4 text-center py-16 text-gray-400">
            اضغط "مزامنة من يوتيوب" لجلب المقاطع
          </div>
        )}
      </div>
    </div>
  );
}
