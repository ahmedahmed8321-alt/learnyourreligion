"use client";

import { useEffect, useState } from "react";
import type { Dhikr } from "@/lib/supabase";

const emptyForm = { text: "", category: "أذكار عامة", reference: "", virtue: "", repeat_count: 1, order_index: 0, published: true };

export default function AdminAdhkarPage() {
  const [items, setItems] = useState<Dhikr[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");

  async function load() {
    const res = await fetch("/api/adhkar");
    setItems(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.text.trim()) return;
    await fetch("/api/adhkar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ ...emptyForm });
    setShowNew(false);
    load();
  }

  async function save(id: string) {
    await fetch(`/api/adhkar/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    setEditId(null);
    load();
  }

  async function togglePublish(d: Dhikr) {
    await fetch(`/api/adhkar/${d.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !d.published }) });
    load();
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا الذكر؟")) return;
    await fetch(`/api/adhkar/${id}`, { method: "DELETE" });
    load();
  }

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filtered = items.filter((i) => !search.trim() || i.text.includes(search) || i.category.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-green-900">الأذكار والفوائد</h1>
        <button onClick={() => setShowNew(!showNew)} className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium">
          + ذكر جديد
        </button>
      </div>

      {showNew && (
        <form onSubmit={add} className="bg-white rounded-xl shadow p-5 mb-6 space-y-3 border border-green-100">
          <DhikrFields form={form} setForm={setForm} categories={categories} />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-600">حفظ</button>
            <button type="button" onClick={() => setShowNew(false)} className="text-gray-500 text-sm hover:underline">إلغاء</button>
          </div>
        </form>
      )}

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث في الأذكار..."
        className="w-full max-w-md border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white mb-4" />

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 h-24 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-12">لا توجد أذكار بعد</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow p-5 border-r-4 border-green-600">
              {editId === d.id ? (
                <div className="space-y-3">
                  <DhikrFields form={editForm} setForm={setEditForm} categories={categories} />
                  <div className="flex gap-2">
                    <button onClick={() => save(d.id)} className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-600">حفظ</button>
                    <button onClick={() => setEditId(null)} className="text-gray-500 text-sm hover:underline">إلغاء</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full shrink-0">{d.category}</span>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => togglePublish(d)} className={`text-xs px-2 py-0.5 rounded-full border ${d.published ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                        {d.published ? "✓ منشور" : "○ مخفي"}
                      </button>
                      <button onClick={() => { setEditId(d.id); setEditForm({ text: d.text, category: d.category, reference: d.reference ?? "", virtue: d.virtue ?? "", repeat_count: d.repeat_count, order_index: d.order_index, published: d.published }); }}
                        className="text-blue-600 hover:underline text-xs">تعديل</button>
                      <button onClick={() => remove(d.id)} className="text-red-500 hover:underline text-xs">حذف</button>
                    </div>
                  </div>
                  <p className="text-green-950 leading-loose mt-2 font-medium">{d.text}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    {d.reference && <span>{d.reference}</span>}
                    <span>التكرار: {d.repeat_count}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DhikrFields({ form, setForm, categories }: { form: typeof emptyForm; setForm: (f: typeof emptyForm) => void; categories: string[] }) {
  return (
    <>
      <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
        required rows={3} placeholder="نص الذكر *"
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input list="adhkar-cats" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="القسم (مثل: أذكار الصباح)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <datalist id="adhkar-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
          placeholder="التخريج / المصدر (اختياري)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>
      <input value={form.virtue} onChange={(e) => setForm({ ...form, virtue: e.target.value })}
        placeholder="الفضل (اختياري)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-gray-600">التكرار:
          <input type="number" min={1} value={form.repeat_count} onChange={(e) => setForm({ ...form, repeat_count: parseInt(e.target.value) || 1 })}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">الترتيب:
          <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
            className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded text-green-600" />
          منشور
        </label>
      </div>
    </>
  );
}
