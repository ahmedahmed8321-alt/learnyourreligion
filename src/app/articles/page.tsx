import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/supabase";

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
      {/* Page header */}
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">المقالات الإسلامية</h1>
          <p className="text-green-300 text-sm">مقالات ومواضيع علمية بقلم الشيخ محمود لاشين</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-500">لا توجد مقالات بعد</p>
            <p className="text-sm text-gray-400">سيضيف الشيخ المقالات قريباً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <ArticleRow key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleRow({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`}
      className="group block bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        {/* Decorative dot */}
        <div className="shrink-0 mt-1.5 w-3 h-3 rounded-full bg-yellow-400 group-hover:bg-green-500 transition-colors" />

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-green-900 group-hover:text-green-700 transition-colors mb-1.5 leading-relaxed">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{article.excerpt}</p>
          )}
          <p className="text-gray-400 text-xs mt-3">
            {new Date(article.created_at).toLocaleDateString("ar-EG", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        <span className="shrink-0 text-gray-300 group-hover:text-green-600 transition-colors mt-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
