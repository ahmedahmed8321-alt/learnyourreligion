import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Video } from "@/lib/supabase";
import SyncButton from "./SyncButton";
import AdminVideoGrid from "./VideoGrid";

const PAGE_SIZE = 48;

interface Props { searchParams: { page?: string } }

export default async function AdminVideosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getSupabaseAdmin();
  const { data, count } = await supabase
    .from("videos")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(from, to);

  const videos = (data ?? []) as Video[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-green-900">المقاطع المرئية</h1>
        <SyncButton />
      </div>

      <p className="text-gray-400 text-sm mb-4">
        المقاطع تُجلب تلقائياً من القناة — {total} مقطع حالياً — صفحة {page} من {totalPages}
      </p>

      <AdminVideoGrid videos={videos} currentPage={page} totalPages={totalPages} />
    </div>
  );
}
