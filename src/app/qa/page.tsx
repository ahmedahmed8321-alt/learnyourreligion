import { supabase } from "@/lib/supabase";
import type { QA, QASection } from "@/lib/supabase";
import AskForm from "./AskForm";
import QASearch from "./QASearch";

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

        <QASearch sections={sections} bySectionId={bySectionId} unsectioned={unsectioned} />
      </div>
    </div>
  );
}
