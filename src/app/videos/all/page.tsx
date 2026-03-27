import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/lib/supabase";

export const revalidate = 3600;
export const metadata = { title: "كل المقاطع — تعلم دينك لتنجو وتسعد" };

const PAGE_SIZE = 24;

interface Props { searchParams: { page?: string; q?: string } }

export default async function AllVideosPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.q?.trim() ?? "";
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("videos")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(from, to);

  if (search) query = query.ilike("title", `%${search}%`);

  const { data, count, error } = await query;
  const videos = (data ?? []) as Video[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-green-700">الرئيسية</Link>
        <span className="mx-2">›</span>
        <Link href="/videos" className="hover:text-green-700">المقاطع</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-600">كل المقاطع</span>
      </nav>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-900 border-r-4 border-yellow-500 pr-4 mb-1">كل المقاطع</h1>
          <p className="text-gray-500 text-sm">{count ?? 0} مقطع</p>
        </div>
        <Link href="/videos" className="text-green-600 hover:underline text-sm">← قوائم التشغيل</Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6 relative max-w-xl">
        <input type="text" name="q" defaultValue={search}
          placeholder="ابحث في المقاطع..."
          className="w-full border border-gray-200 rounded-xl px-5 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
        <button type="submit" className="absolute right-4 top-3.5">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
      </form>

      {error && <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6 text-sm">حدث خطأ أثناء جلب المقاطع.</div>}

      {videos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">{search ? `لا توجد نتائج لـ "${search}"` : "لا توجد مقاطع"}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {videos.map((v) => (
              <a key={v.id} href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
                target="_blank" rel="noopener noreferrer"
                className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all flex flex-col">
                <div className="relative">
                  <Image src={v.thumbnail_url} alt={v.title} width={320} height={180}
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
                  <h3 className="font-medium text-gray-800 text-xs line-clamp-2 leading-relaxed flex-1">{v.title}</h3>
                  <p className="text-gray-400 text-xs mt-1">{new Date(v.published_at).toLocaleDateString("ar-EG")}</p>
                </div>
              </a>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
              {page > 1 && <PL href={`/videos/all?page=${page - 1}${search ? `&q=${search}` : ""}`} label="→ السابق" />}
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "..." ? <span key={`d${i}`} className="px-2 text-gray-400">...</span> :
                <PL key={p} href={`/videos/all?page=${p}${search ? `&q=${search}` : ""}`} label={String(p)} active={p === page} />
              )}
              {page < totalPages && <PL href={`/videos/all?page=${page + 1}${search ? `&q=${search}` : ""}`} label="التالي ←" />}
            </div>
          )}
          <p className="text-center text-gray-400 text-sm mt-3">صفحة {page} من {totalPages} — {count} مقطع</p>
        </>
      )}
    </div>
  );
}

function PL({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-green-50"
    }`}>{label}</Link>
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
