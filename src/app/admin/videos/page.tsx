import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Video } from "@/lib/supabase";
import SyncButton from "./SyncButton";
import AdminVideoGrid from "./VideoGrid";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-green-900">المقاطع المرئية</h1>
        <SyncButton />
      </div>

      <p className="text-gray-400 text-sm mb-4">
        المقاطع تُجلب تلقائياً من القناة — {videos.length} مقطع حالياً
      </p>

      <AdminVideoGrid videos={videos} />
    </div>
  );
}
