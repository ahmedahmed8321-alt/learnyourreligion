import { supabase } from "@/lib/supabase";

export const revalidate = 600;
export const metadata = { title: "ملخصات — تعلم دينك لتنجو وتسعد" };

interface Summary {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  category: string | null;
  created_at: string;
}

export default async function SummariesPage() {
  const { data } = await supabase
    .from("summaries")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const summaries = (data ?? []) as Summary[];

  const grouped: Record<string, Summary[]> = {};
  const uncategorized: Summary[] = [];
  summaries.forEach((s) => {
    if (s.category) {
      grouped[s.category] = grouped[s.category] ?? [];
      grouped[s.category].push(s);
    } else {
      uncategorized.push(s);
    }
  });

  const categories = Object.keys(grouped).sort();

  return (
    <div>
      {/* Page header */}
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">الملخصات</h1>
          <p className="text-green-300 text-sm">ملفات PDF — ملخصات ودروس الشيخ محمود لاشين</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {summaries.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-500">لا توجد ملخصات بعد</p>
            <p className="text-sm text-gray-400">سيضيف الشيخ الملخصات قريباً</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <CategorySection key={cat} title={cat} summaries={grouped[cat]} />
            ))}
            {uncategorized.length > 0 && (
              <CategorySection
                title={categories.length > 0 ? "متنوعة" : undefined}
                summaries={uncategorized}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategorySection({ title, summaries }: { title?: string; summaries: Summary[] }) {
  return (
    <section>
      {title && (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-7 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shrink-0" />
          <h2 className="text-xl font-bold text-green-900">{title}</h2>
          <span className="text-sm text-gray-400 font-normal">({summaries.length})</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {summaries.map((s) => <SummaryCard key={s.id} summary={s} />)}
      </div>
    </section>
  );
}

function SummaryCard({ summary }: { summary: Summary }) {
  const sizeMB = summary.file_size ? (summary.file_size / 1024 / 1024).toFixed(1) : null;

  return (
    <a href={summary.file_url} target="_blank" rel="noopener noreferrer"
      className="group flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
      {/* PDF icon */}
      <div className="shrink-0 w-13 h-14 bg-red-50 rounded-xl flex flex-col items-center justify-center border border-red-100 group-hover:bg-red-100 transition-colors px-2">
        <span className="text-red-600 text-xs font-black tracking-tight">PDF</span>
        <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 text-sm leading-relaxed group-hover:text-green-700 transition-colors line-clamp-2">
          {summary.title}
        </h3>
        {summary.description && (
          <p className="text-gray-400 text-xs mt-1 line-clamp-1">{summary.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          {sizeMB && <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sizeMB} MB
          </span>}
          <span>{new Date(summary.created_at).toLocaleDateString("ar-EG")}</span>
        </div>
      </div>

      {/* Download icon */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-green-50 group-hover:bg-green-600 flex items-center justify-center transition-colors">
        <svg className="w-4 h-4 text-green-600 group-hover:text-white transition-colors group-hover:translate-y-0.5 duration-300"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
    </a>
  );
}
