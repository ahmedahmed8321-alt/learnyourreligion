import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const supabase = getSupabaseAdmin();
  const [{ count: videoCount }, { count: articleCount }, { count: qaCount }, { count: pendingCount }] =
    await Promise.all([
      supabase.from("videos").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("*", { count: "exact", head: true }),
      supabase.from("qa").select("*", { count: "exact", head: true }).eq("published", true),
      supabase.from("qa").select("*", { count: "exact", head: true }).eq("published", false),
    ]);

  const stats = [
    { label: "المقاطع", value: videoCount ?? 0, href: "/admin/videos", color: "bg-red-50 border-red-200 text-red-700" },
    { label: "المقالات", value: articleCount ?? 0, href: "/admin/articles", color: "bg-green-50 border-green-200 text-green-700" },
    { label: "أسئلة منشورة", value: qaCount ?? 0, href: "/admin/qa", color: "bg-blue-50 border-blue-200 text-blue-700" },
    { label: "أسئلة في الانتظار", value: pendingCount ?? 0, href: "/admin/qa?tab=pending", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900 mb-1">لوحة التحكم</h1>
      <p className="text-gray-400 text-sm mb-8">مرحباً، الشيخ محمود لاشين</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className={`border rounded-xl p-5 ${s.color} hover:shadow-md transition-shadow`}>
            <div className="text-3xl font-bold mb-1">{s.value}</div>
            <div className="text-sm font-medium">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">إجراءات سريعة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard href="/admin/articles/new" title="كتابة مقال جديد" icon="✍️"
          desc="أضف مقالاً أو درساً إسلامياً جديداً" />
        <ActionCard href="/admin/qa?tab=pending" title="الرد على الأسئلة" icon="💬"
          desc={`${pendingCount ?? 0} سؤال ينتظر إجابتك`} />
        <ActionCard href="/api/youtube/sync" title="مزامنة يوتيوب" icon="▶️"
          desc="تحديث المقاطع من قناة اليوتيوب" />
      </div>
    </div>
  );
}

function ActionCard({ href, title, icon, desc }: { href: string; title: string; icon: string; desc: string }) {
  return (
    <Link href={href}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-green-300 transition-all">
      <span className="text-2xl">{icon}</span>
      <h3 className="font-semibold text-gray-800 mt-2 mb-1">{title}</h3>
      <p className="text-gray-400 text-xs">{desc}</p>
    </Link>
  );
}
