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

  // Collect unique categories for datalist
  const categories = Array.from(new Set(summaries.map((s) => s.category).filter(Boolean)));

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-green-900 mb-6">الملخصات (PDF)</h1>

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
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            list="categories-list" placeholder="مثال: فقه، عقيدة، تجويد..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <datalist id="categories-list">
            {categories.map((c) => <option key={c!} value={c!} />)}
          </datalist>
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
