import { supabase } from "@/lib/supabase";
import type { QA, QASection } from "@/lib/supabase";
import AskForm from "./AskForm";
import QAList from "./QAList";

export const revalidate = 300;
export const metadata = { title: "الأسئلة والأجوبة — تعلم دينك لتنجو وتسعد" };

export default async function QAPage() {
  // Fetch sections
  const { data: sectionsData } = await supabase
    .from("qa_sections")
    .select("*")
    .order("order_index", { ascending: true });

  const sections = (sectionsData ?? []) as QASection[];

  // Fetch all published Q&A with answers
  const { data: qaData } = await supabase
    .from("qa")
    .select("*")
    .eq("published", true)
    .not("answer", "is", null)
    .order("created_at", { ascending: false });

  const allQA = (qaData ?? []) as QA[];

  // Group by section
  const bySectionId: Record<string, QA[]> = {};
  const unsectioned: QA[] = [];

  allQA.forEach((q) => {
    if (q.section_id) {
      bySectionId[q.section_id] = bySectionId[q.section_id] ?? [];
      bySectionId[q.section_id].push(q);
    } else {
      unsectioned.push(q);
    }
  });

  return (
    <div>
      {/* Page header */}
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">الأسئلة والأجوبة</h1>
          <p className="text-green-300 text-sm">
            أسئلة المستمعين وإجابات الشيخ محمود لاشين — {allQA.length} سؤال منشور
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Ask a question */}
        <AskForm />

        {/* Sections navigation */}
        {sections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <a href="#all"
              className="bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors shadow-sm">
              الكل
            </a>
            {sections.map((s) => (
              <a key={s.id} href={`#section-${s.id}`}
                className="bg-white border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-green-50 hover:border-green-400 transition-colors shadow-sm">
                {s.title}
              </a>
            ))}
          </div>
        )}

        {allQA.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-500">لا توجد أسئلة منشورة بعد</p>
            <p className="text-sm text-gray-400">يمكنك إرسال سؤالك باستخدام النموذج أعلاه</p>
          </div>
        ) : (
          <div id="all" className="space-y-10">
            {sections.map((section) => {
              const sectionQA = bySectionId[section.id] ?? [];
              if (sectionQA.length === 0) return null;
              return (
                <div key={section.id} id={`section-${section.id}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-7 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shrink-0" />
                    <h2 className="text-xl font-bold text-green-900">{section.title}</h2>
                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {sectionQA.length} سؤال
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-gray-500 text-sm mb-4 mr-4">{section.description}</p>
                  )}
                  <QAList items={sectionQA} />
                </div>
              );
            })}

            {unsectioned.length > 0 && (
              <div>
                {sections.length > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-7 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shrink-0" />
                    <h2 className="text-xl font-bold text-green-900">متنوعة</h2>
                  </div>
                )}
                <QAList items={unsectioned} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
