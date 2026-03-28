import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/supabase";
import ArticlesList from "./ArticlesList";

export const revalidate = 600;
export const metadata = { title: "المقالات — تعلم دينك لتنجو وتسعد" };

export default async function ArticlesPage() {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const articles = (data ?? []) as Article[];

  return (
    <div>
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">المقالات الإسلامية</h1>
          <p className="text-green-300 text-sm">مقالات ومواضيع علمية بقلم الشيخ محمود لاشين</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <ArticlesList articles={articles} />
      </div>
    </div>
  );
}
