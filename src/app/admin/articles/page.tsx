"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/supabase";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/articles");
    const data = await res.json();
    setArticles(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    load();
  }

  async function deleteArticle(id: string) {
    if (!confirm("هل تريد حذف هذا المقال؟")) return;
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">المقالات</h1>
        <Link href="/admin/articles/new"
          className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
          + مقال جديد
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 h-14 rounded-xl animate-pulse" />)}</div>
      ) : articles.length === 0 ? (
        <p className="text-gray-400 text-center py-12">لا توجد مقالات بعد</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-right px-5 py-3">العنوان</th>
                <th className="text-right px-5 py-3">التصنيف</th>
                <th className="text-right px-5 py-3">الحالة</th>
                <th className="text-right px-5 py-3">التاريخ</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{a.title}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{a.category ?? "—"}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => togglePublish(a.id, a.published)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        a.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {a.published ? "منشور" : "مسودة"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(a.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-5 py-3 text-left">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/articles/${a.id}`}
                        className="text-blue-600 hover:underline text-xs">تعديل</Link>
                      <button onClick={() => deleteArticle(a.id)}
                        className="text-red-500 hover:underline text-xs">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
