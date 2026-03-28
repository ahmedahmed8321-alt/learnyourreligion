"use client";

import { useState } from "react";
import type { QA } from "@/lib/supabase";

export default function QAList({ items }: { items: QA[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = search
    ? items.filter(
        (q) =>
          q.question.includes(search) ||
          (q.answer ?? "").includes(search)
      )
    : items;

  return (
    <div>
      {items.length > 5 && (
        <div className="mb-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في هذا القسم..."
            className="w-full border border-gray-200 rounded-xl px-5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">لا توجد نتائج</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id}
              className={`bg-white rounded-xl border-r-4 transition-shadow ${
                openId === q.id ? "border-yellow-500 shadow-md" : "border-green-600 shadow"
              }`}>
              <button
                onClick={() => setOpenId(openId === q.id ? null : q.id)}
                className="w-full text-right px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <span className="font-semibold text-green-900 text-base leading-relaxed">
                  {q.question}
                </span>
                <svg
                  className={`w-5 h-5 text-green-600 shrink-0 mt-0.5 transition-transform ${openId === q.id ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {openId === q.id && (q.answer || q.audio_url) && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="pt-4">
                    {q.answer && (
                      <p className="text-gray-700 text-base leading-loose whitespace-pre-line">
                        <span className="font-semibold text-yellow-600 ml-1">الجواب:</span>
                        {q.answer}
                      </p>
                    )}
                    {q.audio_url && (
                      <div className="mt-3">
                        {!q.answer && <span className="font-semibold text-yellow-600 text-sm block mb-2">الجواب (صوتي):</span>}
                        <audio controls className="w-full max-w-md" preload="none">
                          <source src={q.audio_url} />
                        </audio>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-gray-400">
                      <span>الشيخ محمود لاشين</span>
                      <span>•</span>
                      <span>{new Date(q.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</span>
                      {q.source === "telegram" && (
                        <span className="bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">تيليغرام</span>
                      )}
                      {q.source === "website" && (
                        <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">من الموقع</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
