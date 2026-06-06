"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { QA } from "@/lib/supabase";

export default function SharePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">جاري التحميل...</div>}>
      <ShareContent />
    </Suspense>
  );
}

function ShareContent() {
  const params = useSearchParams();
  const text = params.get("text") ?? "";
  const audio = params.get("audio");
  const image = params.get("image");
  const hadError = params.get("error") === "1";

  const [mode, setMode] = useState<"choose" | "new" | "answer">("choose");
  const [done, setDone] = useState<null | string>(null);

  // New question
  const [questionText, setQuestionText] = useState(text);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Answer to existing
  const [items, setItems] = useState<QA[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (mode === "answer" && items.length === 0) {
      setLoadingList(true);
      fetch("/api/qa").then((r) => r.json()).then((d) => {
        setItems(Array.isArray(d) ? d : []);
        setLoadingList(false);
      });
    }
  }, [mode, items.length]);

  const nothingShared = !text && !audio && !image;

  async function saveAsNew() {
    if (!questionText.trim() && !audio && !image) {
      alert("اكتب نص السؤال أو شارك صوتاً/صورة");
      return;
    }
    setSaving(true);
    const fd = new FormData();
    fd.append("question", questionText);
    fd.append("published", String(published));
    if (audio) fd.append("question_audio_url", audio); // voice belongs to the QUESTION here
    if (image) fd.append("image_url", image);
    const res = await fetch("/api/qa", { method: "POST", body: fd });
    setSaving(false);
    if (res.ok) setDone("تم حفظ السؤال الجديد");
    else alert("حدث خطأ أثناء الحفظ");
  }

  async function answerQuestion(q: QA) {
    const body: Record<string, any> = { published: true };
    if (audio) body.audio_url = audio;
    if (image) body.answer_image_url = image;
    if (text && !audio && !image) {
      body.answer = q.answer ? `${q.answer}\n${text}` : text;
    }
    const res = await fetch(`/api/qa/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) setDone("تمت إضافة الإجابة للسؤال");
    else alert("حدث خطأ أثناء الحفظ");
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-green-900 mb-2">{done}</h1>
        <Link href="/admin/qa" className="inline-block mt-4 bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-green-600">
          الذهاب إلى الأسئلة والأجوبة
        </Link>
      </div>
    );
  }

  const filtered = items.filter((q) => !search.trim() || q.question.includes(search) || q.answer?.includes(search));

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-900 mb-1">محتوى مُشارَك</h1>
      <p className="text-gray-400 text-sm mb-6">احفظ المحتوى الذي شاركته كسؤال جديد أو كإجابة على سؤال موجود</p>

      {hadError && (
        <p className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">حدث خطأ أثناء استقبال المحتوى المُشارَك.</p>
      )}

      {nothingShared && !hadError && (
        <p className="bg-yellow-50 text-yellow-700 text-sm rounded-lg p-3 mb-4">
          لم يصل أي محتوى. افتح تطبيق واتساب، اضغط على رسالة ثم &quot;مشاركة&quot; واختر هذا التطبيق.
        </p>
      )}

      {/* Shared content preview */}
      <div className="bg-white rounded-xl shadow p-5 mb-6 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">المحتوى المُشارَك:</h2>
        {text && <p className="text-gray-800 text-sm whitespace-pre-line bg-gray-50 rounded-lg p-3">{text}</p>}
        {audio && (
          <div>
            <span className="text-xs text-gray-500 block mb-1">🎙️ تسجيل صوتي:</span>
            <audio controls className="w-full max-w-md" preload="none"><source src={audio} /></audio>
          </div>
        )}
        {image && (
          <div>
            <span className="text-xs text-gray-500 block mb-1">🖼️ صورة:</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="مشاركة" className="max-h-56 rounded-lg border border-gray-200" />
          </div>
        )}
        {nothingShared && <p className="text-gray-400 text-sm">—</p>}
      </div>

      {/* Mode choice */}
      {!nothingShared && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button onClick={() => setMode("new")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium ${mode === "new" ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            ➕ حفظ كسؤال جديد
          </button>
          <button onClick={() => setMode("answer")}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium ${mode === "answer" ? "bg-green-700 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            💬 إضافة كإجابة لسؤال موجود
          </button>
        </div>
      )}

      {/* New question */}
      {mode === "new" && (
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نص السؤال {audio || image ? "(اختياري)" : "*"}</label>
            <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3}
              placeholder="اكتب نص السؤال هنا..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded text-green-600" />
            نشر مباشرة
          </label>
          <button onClick={saveAsNew} disabled={saving}
            className="bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-green-600 disabled:opacity-60 font-medium">
            {saving ? "جاري الحفظ..." : "حفظ السؤال"}
          </button>
        </div>
      )}

      {/* Answer to existing */}
      {mode === "answer" && (
        <div className="bg-white rounded-xl shadow p-5">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن السؤال الذي تريد الإجابة عليه..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-4" />

          {loadingList ? (
            <p className="text-gray-400 text-center py-6 text-sm">جاري التحميل...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-6 text-sm">لا توجد أسئلة</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {filtered.map((q) => (
                <button key={q.id} onClick={() => answerQuestion(q)}
                  className="w-full text-right border border-gray-100 hover:border-green-300 hover:bg-green-50 rounded-lg px-4 py-3 transition-colors">
                  <p className="text-sm font-medium text-green-900 leading-relaxed">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.published ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {q.published ? "منشور" : "في الانتظار"}
                    </span>
                    {(q.answer || q.audio_url) && <span className="text-xs text-gray-400">له إجابة — سيُضاف لها</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
