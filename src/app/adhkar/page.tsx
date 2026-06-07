import { supabase } from "@/lib/supabase";
import type { Dhikr } from "@/lib/supabase";
import AdhkarList from "./AdhkarList";

export const revalidate = 300;
export const metadata = { title: "الأذكار والفوائد — تعلم دينك لتنجو وتسعد" };

export default async function AdhkarPage() {
  const { data } = await supabase
    .from("adhkar")
    .select("*")
    .eq("published", true)
    .order("category", { ascending: true })
    .order("order_index", { ascending: true });

  const adhkar = (data ?? []) as Dhikr[];

  // Group by category, preserving order
  const groups: { category: string; items: Dhikr[] }[] = [];
  for (const d of adhkar) {
    let g = groups.find((x) => x.category === d.category);
    if (!g) { g = { category: d.category, items: [] }; groups.push(g); }
    g.items.push(d);
  }

  return (
    <div>
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">الأذكار والفوائد</h1>
          <p className="text-green-300 text-sm">أذكار يومية وفوائد إيمانية — اضغط على الذكر لاحتساب التكرار</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {groups.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📿</p>
            <p className="text-lg">سيتم إضافة الأذكار قريباً بإذن الله</p>
          </div>
        ) : (
          <AdhkarList groups={groups} />
        )}
      </div>
    </div>
  );
}
