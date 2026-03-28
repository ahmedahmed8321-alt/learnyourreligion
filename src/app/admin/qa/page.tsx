"use client";

import { useEffect, useState } from "react";
import type { QA, QASection } from "@/lib/supabase";

type Tab = "pending" | "published" | "sections";
type Source = "all" | "website" | "telegram" | "manual";

export default function AdminQAPage() {
  const [items, setItems] = useState<QA[]>([]);
  const [sections, setSections] = useState<QASection[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [sourceFilter, setSourceFilter] = useState<Source>("all");
  const [editId, setEditId] = useState<string | null>(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [editSectionId, setEditSectionId] = useState<string>("");
  const [editPublished, setEditPublished] = useState(true);

  // New manual Q&A
  const [showNew, setShowNew] = useState(false);
  const [newQ, setNewQ] = useState({ question: "", answer: "", section_id: "", published: true });

  // New section
  const [showNewSection, setShowNewSection] = useState(false);
  const [newSection, setNewSection] = useState({ title: "", description: "", order_index: 0 });

  // Search
  const [search, setSearch] = useState("");

  async function load() {
    const [qaRes, secRes] = await Promise.all([
      fetch("/api/qa"),
      fetch("/api/qa/sections"),
    ]);
    setItems(await qaRes.json());
    setSections(await secRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const pendingItems = items.filter((q) => !q.published);
  const publishedItems = items.filter((q) => q.published);

  const filtered = (tab === "pending" ? pendingItems : publishedItems).filter(
    (q) => sourceFilter === "all" || q.source === sourceFilter
  ).filter(
    (q) => !search.trim() || q.question.includes(search) || q.answer?.includes(search)
  );

  async function saveQA(id: string, publish?: boolean) {
    await fetch(`/api/qa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer: editAnswer || null,
        section_id: editSectionId || null,
        published: publish ?? editPublished,
      }),
    });
    setEditId(null);
    load();
  }

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/qa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    load();
  }

  async function deleteQA(id: string) {
    if (!confirm("حذف هذا السؤال؟")) return;
    await fetch(`/api/qa/${id}`, { method: "DELETE" });
    load();
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newQ, section_id: newQ.section_id || null }),
    });
    setNewQ({ question: "", answer: "", section_id: "", published: true });
    setShowNew(false);
    load();
  }

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/qa/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSection),
    });
    setNewSection({ title: "", description: "", order_index: 0 });
    setShowNewSection(false);
    load();
  }

  async function deleteSection(id: string) {
    if (!confirm("حذف هذا القسم؟ ستُزال الأسئلة منه ولن تُحذف.")) return;
    await fetch(`/api/qa/sections/${id}`, { method: "DELETE" });
    load();
  }

  const sourceLabel: Record<Source, string> = {
    all: "الكل", website: "من الموقع", telegram: "تيليغرام", manual: "يدوي",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-green-900">الأسئلة والأجوبة</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowNew(!showNew)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm font-medium">
            + سؤال يدوي
          </button>
          <button onClick={() => setTab("sections")}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-400 text-sm font-medium">
            إدارة الأقسام
          </button>
        </div>
      </div>

      {/* Add manual Q&A */}
      {showNew && (
        <form onSubmit={addManual} className="bg-white rounded-xl shadow p-5 mb-6 space-y-3 border border-green-100">
          <h2 className="font-semibold text-gray-700">إضافة سؤال يدوي</h2>
          <textarea value={newQ.question} onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
            required rows={2} placeholder="نص السؤال *"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
          <textarea value={newQ.answer} onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
            rows={3} placeholder="نص الجواب (اختياري)"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
          <div className="flex flex-wrap gap-4 items-center">
            <select value={newQ.section_id} onChange={(e) => setNewQ({ ...newQ, section_id: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">بدون قسم</option>
              {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={newQ.published}
                onChange={(e) => setNewQ({ ...newQ, published: e.target.checked })}
                className="rounded text-green-600" />
              نشر مباشرة
            </label>
            <button type="submit" className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-600">حفظ</button>
            <button type="button" onClick={() => setShowNew(false)} className="text-gray-500 text-sm hover:underline">إلغاء</button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["pending", "published", "sections"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-green-700 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}>
            {t === "pending" ? `في الانتظار (${pendingItems.length})` :
             t === "published" ? `منشور (${publishedItems.length})` : "الأقسام"}
          </button>
        ))}
      </div>

      {/* ── SECTIONS TAB ──────────────────────────────────────────── */}
      {tab === "sections" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">أقسام الأسئلة والأجوبة</h2>
            <button onClick={() => setShowNewSection(!showNewSection)}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
              + قسم جديد
            </button>
          </div>

          {showNewSection && (
            <form onSubmit={addSection} className="bg-white rounded-xl p-5 shadow space-y-3 border border-green-100">
              <input value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                required placeholder="اسم القسم *"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input value={newSection.description ?? ""} onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                placeholder="وصف القسم (اختياري)"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <div className="flex gap-3 items-center">
                <label className="text-sm text-gray-600">الترتيب:</label>
                <input type="number" value={newSection.order_index}
                  onChange={(e) => setNewSection({ ...newSection, order_index: parseInt(e.target.value) })}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                <button type="submit" className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm">حفظ</button>
                <button type="button" onClick={() => setShowNewSection(false)} className="text-gray-500 text-sm hover:underline">إلغاء</button>
              </div>
            </form>
          )}

          {sections.length === 0 ? (
            <p className="text-gray-400 text-center py-8">لا توجد أقسام بعد</p>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th className="text-right px-5 py-3">القسم</th>
                    <th className="text-right px-5 py-3">الوصف</th>
                    <th className="text-right px-5 py-3">الترتيب</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sections.map((s) => (
                    <SectionRow key={s.id} section={s} onDelete={deleteSection} onUpdate={load} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Q&A TABS ──────────────────────────────────────────────── */}
      {tab !== "sections" && (
        <>
          {/* Search */}
          <div className="relative max-w-md mb-4">
            <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الأسئلة والأجوبة..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
          </div>

          {/* Source filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {(["all", "website", "telegram", "manual"] as Source[]).map((s) => (
              <button key={s} onClick={() => setSourceFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  sourceFilter === s ? "bg-green-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>
                {sourceLabel[s]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 h-20 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-12">لا توجد أسئلة في هذا القسم</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((q) => (
                <QARow key={q.id} item={q} sections={sections}
                  editId={editId} editAnswer={editAnswer} editSectionId={editSectionId} editPublished={editPublished}
                  onEdit={() => { setEditId(q.id); setEditAnswer(q.answer ?? ""); setEditSectionId(q.section_id ?? ""); setEditPublished(q.published); }}
                  onCancelEdit={() => setEditId(null)}
                  onChangeAnswer={setEditAnswer} onChangeSectionId={setEditSectionId} onChangePublished={setEditPublished}
                  onSave={() => saveQA(q.id)}
                  onSaveAndPublish={() => saveQA(q.id, true)}
                  onTogglePublish={() => togglePublish(q.id, q.published)}
                  onDelete={() => deleteQA(q.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Section row with inline edit ──────────────────────────────────────────── */
function SectionRow({ section, onDelete, onUpdate }: {
  section: QASection; onDelete: (id: string) => void; onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: section.title, description: section.description ?? "", order_index: section.order_index });

  async function save() {
    await fetch(`/api/qa/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditing(false);
    onUpdate();
  }

  if (editing) {
    return (
      <tr className="bg-green-50">
        <td className="px-5 py-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border border-green-300 rounded px-2 py-1 text-sm w-full focus:outline-none" />
        </td>
        <td className="px-5 py-3">
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-green-300 rounded px-2 py-1 text-sm w-full focus:outline-none" />
        </td>
        <td className="px-5 py-3">
          <input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) })}
            className="border border-green-300 rounded px-2 py-1 text-sm w-16 focus:outline-none" />
        </td>
        <td className="px-5 py-3 text-left">
          <button onClick={save} className="text-green-700 font-medium text-xs hover:underline ml-3">حفظ</button>
          <button onClick={() => setEditing(false)} className="text-gray-400 text-xs hover:underline">إلغاء</button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-5 py-3 font-medium text-gray-800">{section.title}</td>
      <td className="px-5 py-3 text-gray-500 text-xs">{section.description ?? "—"}</td>
      <td className="px-5 py-3 text-gray-400">{section.order_index}</td>
      <td className="px-5 py-3 text-left">
        <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline text-xs ml-3">تعديل</button>
        <button onClick={() => onDelete(section.id)} className="text-red-500 hover:underline text-xs">حذف</button>
      </td>
    </tr>
  );
}

/* ── Q&A Row ────────────────────────────────────────────────────────────────── */
function QARow({ item, sections, editId, editAnswer, editSectionId, editPublished,
  onEdit, onCancelEdit, onChangeAnswer, onChangeSectionId, onChangePublished,
  onSave, onSaveAndPublish, onTogglePublish, onDelete }: {
  item: QA; sections: QASection[];
  editId: string | null; editAnswer: string; editSectionId: string; editPublished: boolean;
  onEdit: () => void; onCancelEdit: () => void;
  onChangeAnswer: (v: string) => void; onChangeSectionId: (v: string) => void; onChangePublished: (v: boolean) => void;
  onSave: () => void; onSaveAndPublish: () => void; onTogglePublish: () => void; onDelete: () => void;
}) {
  const isEditing = editId === item.id;
  const sectionName = sections.find((s) => s.id === item.section_id)?.title;
  const sourceColor: Record<string, string> = {
    website: "bg-green-50 text-green-600",
    telegram: "bg-blue-50 text-blue-500",
    manual: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 border-r-4 border-green-600">
      {/* Question header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <p className="font-semibold text-green-900 leading-relaxed">س: {item.question}</p>
          {item.submitter_name && <p className="text-xs text-gray-400 mt-0.5">من: {item.submitter_name}</p>}
        </div>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 text-xs shrink-0">حذف</button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${sourceColor[item.source] ?? "bg-gray-100 text-gray-500"}`}>
          {item.source === "website" ? "من الموقع" : item.source === "telegram" ? "تيليغرام" : "يدوي"}
        </span>
        {sectionName && (
          <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">{sectionName}</span>
        )}
        <button onClick={onTogglePublish}
          className={`text-xs px-2 py-0.5 rounded-full border ${
            item.published ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"
          }`}>
          {item.published ? "✓ منشور" : "○ مخفي"}
        </button>
      </div>

      {/* Edit mode */}
      {isEditing ? (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          <textarea value={editAnswer} onChange={(e) => onChangeAnswer(e.target.value)}
            rows={5} placeholder="اكتب إجابة الشيخ هنا..."
            autoFocus
            className="w-full border border-green-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-y" />
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">القسم:</label>
              <select value={editSectionId} onChange={(e) => onChangeSectionId(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">بدون قسم</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={editPublished} onChange={(e) => onChangePublished(e.target.checked)}
                className="rounded text-green-600" />
              نشر للزوار
            </label>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={onSave}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm hover:bg-gray-300 font-medium">
              حفظ كمسودة
            </button>
            <button onClick={onSaveAndPublish}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-600 font-medium">
              إرسال الإجابة
            </button>
            <button onClick={onCancelEdit} className="text-gray-400 text-sm hover:underline px-3">إلغاء</button>
          </div>
        </div>
      ) : (
        <div>
          {(item.answer || item.audio_url) ? (
            <div className="border-t border-gray-100 pt-3">
              {item.answer && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  <span className="font-semibold text-yellow-600 ml-1">ج:</span>
                  {item.answer}
                </p>
              )}
              {item.audio_url && (
                <div className="mt-2">
                  {!item.answer && <span className="font-semibold text-yellow-600 text-xs">ج (صوتي):</span>}
                  <audio controls className="w-full max-w-sm mt-1" preload="none">
                    <source src={item.audio_url} />
                  </audio>
                </div>
              )}
              <button onClick={onEdit} className="text-gray-400 hover:underline text-xs mt-2 block">تعديل الإجابة</button>
            </div>
          ) : (
            <button onClick={onEdit}
              className="text-green-600 hover:text-green-700 text-sm font-medium mt-1 flex items-center gap-1">
              <span>+</span> أضف إجابة
            </button>
          )}
        </div>
      )}
    </div>
  );
}
