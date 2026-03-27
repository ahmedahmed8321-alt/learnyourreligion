import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/supabase";

export const revalidate = 600;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const { data } = await supabase.from("articles").select("title, excerpt").eq("slug", params.slug).single();
  if (!data) return { title: "مقال غير موجود" };
  return { title: `${data.title} — تعلم دينك لتنجو وتسعد`, description: data.excerpt };
}

export default async function ArticlePage({ params }: Props) {
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!data) notFound();
  const article = data as Article;

  return (
    <div>
      {/* Page header */}
      <div className="bg-gradient-to-l from-green-900 to-green-800 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-green-400 mb-4 flex items-center gap-2 flex-wrap">
            <a href="/" className="hover:text-yellow-400 transition-colors">الرئيسية</a>
            <span className="text-green-600">›</span>
            <a href="/articles" className="hover:text-yellow-400 transition-colors">المقالات</a>
            <span className="text-green-600">›</span>
            <span className="text-green-200 line-clamp-1">{article.title}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 leading-relaxed">{article.title}</h1>
          <div className="flex items-center gap-3 text-sm text-green-400 mt-3">
            <span>الشيخ محمود لاشين</span>
            <span>•</span>
            <span>{new Date(article.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <article className="bg-white rounded-2xl shadow-card p-8 md:p-10">
          {/* Article content */}
          <div
            className="article-content text-gray-700 text-lg leading-loose"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Back link */}
        <div className="mt-6 text-center">
          <a href="/articles"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-600 text-sm font-medium bg-green-50 hover:bg-green-100 px-5 py-2.5 rounded-full transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            العودة إلى المقالات
          </a>
        </div>
      </div>
    </div>
  );
}
