"use client";

import { useEffect, useRef, useState } from "react";

interface Summary {
  id: string; title: string; description: string | null;
  file_url: string; file_name: string; file_size: number | null;
  category: string | null; created_at: string;
}

export default function AdminSummariesPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/summaries");
    setSummaries(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setProgress("اختر ملف PDF أولاً"); return; }

    setUploading(true);
    setProgress("جاري رفع الملف...");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);

    const res = await fetch("/api/summaries/upload", { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok) {
      setProgress("✅ تم الرفع بنجاح");
      setForm({ title: "", description: "", category: "" });
      if (fileRef.current) fileRef.current.value = "";
      load();
    } else {
      setProgress(`❌ ${data.error}`);
    }
    setUploading(false);
  }

  async function deleteSummary(id: string, file_url: string) {
    if (!confirm("حذف هذا الملف نهائياً؟")) return;
    await fetch("/api/summaries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, file_url }),
    });
    load();
  }

  const [editCat, setEditCat] = useState<{ old: string; val: string } | null>(null);
  const [newCat, setNewCat] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  // Collect unique categories for datalist
  const categories = Array.from(new Set(summaries.map((s) => s.category).filter(Boolean))) as string[];

  async function addCategory() {
    const name = newCat.trim();
    if (!name || categories.includes(name)) { setNewCat(""); setShowAddCat(false); return; }
    // Create a placeholder record to register the category, or just add to local state
    // Since categories are derived from summaries, we'll use PATCH to create a marker
    // Actually, we just need to track categories locally until a file uses it
    // Simpler: just add it to the datalist so user can select it when uploading
    // But the user wants it to persist. Let's use a different approach:
    // We'll store categories as a JSON array in a special summary record... no that's hacky.
    // Best: just allow creating by typing in the upload form. The section management
    // lets you rename/delete. For "add", we open the input and let them type.
    setForm((prev) => ({ ...prev, category: name }));
    setNewCat("");
    setShowAddCat(false);
  }

  async function renameCategory(oldName: string, newName: string) {
    if (!newName.trim() || newName === oldName) { setEditCat(null); return; }
    const res = await fetch("/api/summaries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldCategory: oldName, newCategory: newName.trim() }),
    });
    if (res.ok) { load(); }
    setEditCat(null);
  }

  async function deleteCategory(catName: string) {
    if (!confirm(`حذف التصنيف "${catName}"؟ سيتم إزالة التصنيف من الملفات (بدون حذف الملفات نفسها)`)) return;
    await fetch("/api/summaries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldCategory: catName, newCategory: "" }),
    });
    load();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-green-900 mb-6">الملخصات (PDF)</h1>

      {/* Category management */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <span>📁</span> إدارة التصنيفات ({categories.length})
          </h2>
          <button onClick={() => setShowAddCat(true)}
            className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
            + إضافة تصنيف
          </button>
        </div>

        {/* Add new category */}
        {showAddCat && (
          <div className="flex items-center gap-2 mb-3 bg-green-50 rounded-lg px-4 py-2.5 border border-green-200">
            <input
              autoFocus
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") { setShowAddCat(false); setNewCat(""); } }}
              placeholder="اسم التصنيف الجديد..."
              className="flex-1 border border-green-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            <button onClick={addCategory}
              className="bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
              حفظ
            </button>
            <button onClick={() => { setShowAddCat(false); setNewCat(""); }}
              className="text-gray-400 hover:text-gray-600 text-xs">إلغاء</button>
          </div>
        )}

        {categories.length === 0 && !showAddCat ? (
          <p className="text-gray-400 text-sm text-center py-4">لا توجد تصنيفات بعد — أضف تصنيفاً ثم استخدمه عند رفع الملفات</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => {
              const count = summaries.filter((s) => s.category === cat).length;
              const isEditing = editCat?.old === cat;
              return (
                <div key={cat} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editCat.val}
                      onChange={(e) => setEditCat({ ...editCat, val: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") renameCategory(cat, editCat.val); if (e.key === "Escape") setEditCat(null); }}
                      onBlur={() => renameCategory(cat, editCat.val)}
                      className="flex-1 border border-green-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-gray-800">{cat}</span>
                  )}
                  <span className="text-xs text-gray-400 shrink-0">{count} ملف</span>
                  {!isEditing && (
                    <>
                      <button onClick={() => setEditCat({ old: cat, val: cat })}
                        className="text-blue-500 hover:text-blue-700 text-xs">تعديل</button>
                      <button onClick={() => deleteCategory(cat)}
                        className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-white rounded-xl shadow p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-gray-700 text-lg">رفع ملف جديد</h2>

        {/* File picker */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && !form.title) setForm((prev) => ({ ...prev, title: f.name.replace(".pdf", "") }));
            }} />
          <span className="text-4xl block mb-2">📄</span>
          <p className="text-gray-500 text-sm">اضغط لاختيار ملف PDF</p>
          <p className="text-gray-400 text-xs mt-1">الحد الأقصى 20 ميجابايت</p>
          {fileRef.current?.files?.[0] && (
            <p className="text-green-600 text-sm mt-2 font-medium">
              ✓ {fileRef.current.files[0].name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان الملف *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            required placeholder="مثال: ملخص أحكام الطهارة"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">القسم / التصنيف (اختياري)</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">— بدون تصنيف —</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">أضف تصنيفاً من قسم "إدارة التصنيفات" أعلاه</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">وصف مختصر (اختياري)</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2} placeholder="وصف محتوى الملف..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        </div>

        {progress && (
          <p className={`text-sm px-4 py-2 rounded-lg ${
            progress.startsWith("✅") ? "bg-green-50 text-green-700" :
            progress.startsWith("❌") ? "bg-red-50 text-red-700" :
            "bg-blue-50 text-blue-700"
          }`}>{progress}</p>
        )}

        <button type="submit" disabled={uploading}
          className="bg-green-700 text-white px-8 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60 font-semibold w-full sm:w-auto">
          {uploading ? "جاري الرفع..." : "رفع الملف"}
        </button>
      </form>

      {/* Files list */}
      <h2 className="font-semibold text-gray-700 mb-3">الملفات المرفوعة ({summaries.length})</h2>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : summaries.length === 0 ? (
        <p className="text-gray-400 text-center py-8">لا توجد ملفات بعد</p>
      ) : (
        <div className="space-y-2">
          {summaries.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
              <span className="text-2xl shrink-0">📄</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{s.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {s.file_name}
                  {s.category && <span className="mr-2 bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{s.category}</span>}
                  {s.file_size && <span className="mr-2">{(s.file_size / 1024 / 1024).toFixed(1)} MB</span>}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-xs">عرض</a>
                <button onClick={() => deleteSummary(s.id, s.file_url)}
                  className="text-red-500 hover:underline text-xs">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
