"use client";

import { useState } from "react";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";
import type { Article } from "@/lib/supabase";

export default function ArticlesList({ articles }: { articles: Article[] }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  // All categories for filter pills
  const allCategories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean))) as string[];
  const hasUncategorized = articles.some((a) => !a.category);

  // Filter by category + search
  let filtered = articles;
  if (activeCat === "__none") {
    filtered = filtered.filter((a) => !a.category);
  } else if (activeCat) {
    filtered = filtered.filter((a) => a.category === activeCat);
  }
  if (search.trim()) {
    filtered = filtered.filter((a) =>
      a.title.includes(search) || a.excerpt?.includes(search)
    );
  }

  return (
    <>
      {articles.length > 0 && (
        <div className="space-y-4 mb-6">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث في المقالات..." />

          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveCat(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                  !activeCat ? "bg-green-700 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
                }`}>
                الكل
              </button>
              {allCategories.map((cat) => {
                const count = articles.filter((a) => a.category === cat).length;
                return (
                  <button key={cat} onClick={() => setActiveCat(activeCat === cat ? null : cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                      activeCat === cat ? "bg-green-700 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
                    }`}>
                    {cat}
                    <span className="mr-1 text-xs opacity-70">({count})</span>
                  </button>
                );
              })}
              {hasUncategorized && allCategories.length > 0 && (
                <button onClick={() => setActiveCat(activeCat === "__none" ? null : "__none")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                    activeCat === "__none" ? "bg-green-700 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
                  }`}>
                  متنوعة
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24 space-y-3">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-500">
            {search || activeCat ? "لا توجد نتائج" : "لا توجد مقالات بعد"}
          </p>
          {!search && !activeCat && <p className="text-sm text-gray-400">سيضيف الشيخ المقالات قريباً</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <ArticleRow key={a.id} article={a} />
          ))}
        </div>
      )}
    </>
  );
}

function ArticleRow({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`}
      className="group block bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <div className="shrink-0 mt-1.5 w-3 h-3 rounded-full bg-yellow-400 group-hover:bg-green-500 transition-colors" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-lg font-bold text-green-900 group-hover:text-green-700 transition-colors leading-relaxed">
              {article.title}
            </h2>
            {article.category && (
              <span className="shrink-0 bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">{article.category}</span>
            )}
          </div>
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
