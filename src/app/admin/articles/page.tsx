"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/supabase";

interface Category {
  id: string; name: string; type: string; order_index: number; created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"articles" | "sections">("articles");

  // Category management
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [editCat, setEditCat] = useState<{ id: string; val: string } | null>(null);

  async function load() {
    const [artRes, catRes] = await Promise.all([
      fetch("/api/articles"),
      fetch("/api/categories?type=article"),
    ]);
    setArticles(await artRes.json());
    setCategories(await catRes.json());
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

  // Category CRUD
  async function addCategory() {
    const name = newCat.trim();
    if (!name) { setNewCat(""); setShowAddCat(false); return; }
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type: "article" }),
    });
    setNewCat("");
    setShowAddCat(false);
    load();
  }

  async function renameCategory(id: string, newName: string) {
    if (!newName.trim()) { setEditCat(null); return; }
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    // Rename in category table
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    // Update articles that use the old name
    const articlesWithOldCat = articles.filter((a) => a.category === cat.name);
    await Promise.all(articlesWithOldCat.map((a) =>
      fetch(`/api/articles/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newName.trim() }),
      })
    ));
    setEditCat(null);
    load();
  }

  async function deleteCategory(id: string, catName: string) {
    if (!confirm(`حذف التصنيف "${catName}"؟ سيتم إزالة التصنيف من المقالات (بدون حذف المقالات)`)) return;
    // Remove category from articles
    const articlesWithCat = articles.filter((a) => a.category === catName);
    await Promise.all(articlesWithCat.map((a) =>
      fetch(`/api/articles/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: null }),
      })
    ));
    // Delete category record
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = articles.filter(
    (a) => !search.trim() || a.title.includes(search) || a.category?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-green-900">المقالات</h1>
        <div className="flex gap-2">
          <Link href="/admin/articles/new"
            className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
            + مقال جديد
          </Link>
          <button onClick={() => setTab(tab === "sections" ? "articles" : "sections")}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-400 text-sm font-medium">
            {tab === "sections" ? "المقالات" : "إدارة التصنيفات"}
          </button>
        </div>
      </div>

      {/* ── SECTIONS TAB ──────────────────────────────────────── */}
      {tab === "sections" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700">تصنيفات المقالات ({categories.length})</h2>
              <button onClick={() => setShowAddCat(true)}
                className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600">
                + تصنيف جديد
              </button>
            </div>

            {showAddCat && (
              <div className="flex items-center gap-2 mb-3 bg-green-50 rounded-lg px-4 py-2.5 border border-green-200">
                <input autoFocus value={newCat} onChange={(e) => setNewCat(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") { setShowAddCat(false); setNewCat(""); } }}
                  placeholder="اسم التصنيف الجديد..."
                  className="flex-1 border border-green-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
                <button onClick={addCategory}
                  className="bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600">حفظ</button>
                <button onClick={() => { setShowAddCat(false); setNewCat(""); }}
                  className="text-gray-400 hover:text-gray-600 text-xs">إلغاء</button>
              </div>
            )}

            {categories.length === 0 && !showAddCat ? (
              <p className="text-gray-400 text-sm text-center py-4">لا توجد تصنيفات بعد</p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const count = articles.filter((a) => a.category === cat.name).length;
                  const isEditing = editCat?.id === cat.id;
                  return (
                    <div key={cat.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                      {isEditing ? (
                        <input autoFocus value={editCat.val}
                          onChange={(e) => setEditCat({ ...editCat, val: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") renameCategory(cat.id, editCat.val); if (e.key === "Escape") setEditCat(null); }}
                          onBlur={() => renameCategory(cat.id, editCat.val)}
                          className="flex-1 border border-green-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      ) : (
                        <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
                      )}
                      <span className="text-xs text-gray-400 shrink-0">{count} مقال</span>
                      {!isEditing && (
                        <>
                          <button onClick={() => setEditCat({ id: cat.id, val: cat.name })}
                            className="text-blue-500 hover:text-blue-700 text-xs">تعديل</button>
                          <button onClick={() => deleteCategory(cat.id, cat.name)}
                            className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ARTICLES TAB ──────────────────────────────────────── */}
      {tab === "articles" && (
        <>
          {/* Search */}
          {articles.length > 0 && (
            <div className="relative max-w-md mb-4">
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث في المقالات..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
            </div>
          )}

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
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{a.title}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{a.category ?? "—"}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => togglePublish(a.id, a.published)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            a.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
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
        </>
      )}
    </div>
  );
}
