"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string; name: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", category: "", published: false });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories?type=article").then((r) => r.json()).then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/admin/articles");
    } else {
      const d = await res.json();
      setError(d.error ?? "حدث خطأ");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-green-900 mb-6">مقال جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
        <Field label="عنوان المقال *">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            required placeholder="اكتب عنوان المقال هنا..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500" />
        </Field>

        <Field label="التصنيف (اختياري)">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
            <option value="">— بدون تصنيف —</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">أضف تصنيفاً من صفحة المقالات &larr; إدارة التصنيفات</p>
          )}
        </Field>

        <Field label="مقتطف (اختياري)">
          <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            rows={2} placeholder="وصف قصير للمقال يظهر في القائمة..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        </Field>

        <Field label="محتوى المقال *">
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            required rows={14} placeholder="اكتب محتوى المقال هنا... (يدعم HTML)"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono text-sm" />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="w-4 h-4 rounded text-green-600" />
          <span className="text-sm font-medium text-gray-700">نشر المقال مباشرة</span>
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-green-700 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-60 font-medium">
            {saving ? "جاري الحفظ..." : "حفظ المقال"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
