import { supabase } from "@/lib/supabase";
import SummariesList from "./SummariesList";

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

  return (
    <div>
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">الملخصات</h1>
          <p className="text-green-300 text-sm">ملفات PDF — ملخصات ودروس الشيخ محمود لاشين</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <SummariesList summaries={summaries} />
      </div>
    </div>
  );
}
