"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function AskForm() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [form, setForm] = useState({
    question: "", submitter_name: "", submitter_email: "", is_private: false,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const payload: any = {
      question: form.question,
      is_private: form.is_private,
    };

    // If logged in, attach user info
    if (user) {
      payload.user_id = user.id;
      payload.submitter_name = user.user_metadata?.name ?? null;
      payload.submitter_email = user.email ?? null;
    } else {
      payload.submitter_name = form.submitter_name || null;
      payload.submitter_email = form.submitter_email || null;
    }

    const res = await fetch("/api/qa/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      setStatus("success");
      setForm({ question: "", submitter_name: "", submitter_email: "", is_private: false });
    } else {
      setStatus("error");
      setErrorMsg(data.error ?? "حدث خطأ");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-bold text-green-800 text-lg mb-1">تم إرسال سؤالك بنجاح</h3>
        <p className="text-green-600 text-sm">سيقوم الشيخ محمود لاشين بالإجابة قريباً بإذن الله</p>
        {user && (
          <Link href="/profile" className="inline-block mt-3 text-green-700 hover:underline text-sm font-medium">
            تابع سؤالك في حسابك →
          </Link>
        )}
        <button onClick={() => setStatus("idle")} className="block mx-auto mt-2 text-gray-400 hover:underline text-sm">
          إرسال سؤال آخر
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="w-full bg-gradient-to-l from-green-700 to-green-600 text-white rounded-2xl p-5 text-right hover:from-green-600 hover:to-green-500 transition-all shadow group">
          <div className="flex items-center justify-between">
            <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
            <div>
              <p className="font-bold text-lg">أرسل سؤالك للشيخ</p>
              <p className="text-green-200 text-sm">سيتم الرد عليه ونشره بعد مراجعة الشيخ</p>
            </div>
          </div>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-green-900">أرسل سؤالك</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          {/* Login notice for guests */}
          {user === null && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
              <p className="text-blue-700 text-sm">سجّل دخولك لإرسال سؤال خاص وتتبع إجاباتك</p>
              <Link href="/login" className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-500 shrink-0">
                دخول
              </Link>
            </div>
          )}

          {/* Logged in user badge */}
          {user && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 flex items-center gap-2">
              <span className="text-green-600 text-sm">✓ مسجّل كـ</span>
              <span className="font-medium text-green-800 text-sm">{user.user_metadata?.name ?? user.email}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">سؤالك *</label>
              <textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required rows={4}
                placeholder="اكتب سؤالك هنا بوضوح..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-base"
              />
            </div>

            {/* Name/email only for guests */}
            {user === null && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">اسمك (اختياري)</label>
                  <input type="text" value={form.submitter_name}
                    onChange={(e) => setForm({ ...form, submitter_name: e.target.value })}
                    placeholder="أبو محمد..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">بريدك (اختياري)</label>
                  <input type="email" value={form.submitter_email}
                    onChange={(e) => setForm({ ...form, submitter_email: e.target.value })}
                    placeholder="للإشعار بالرد" dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                </div>
              </div>
            )}

            {/* Privacy toggle — only for logged-in users */}
            {user && (
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={form.is_private}
                  onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-700">🔒 سؤال خاص</p>
                  <p className="text-xs text-gray-400 mt-0.5">لن يُنشر للعموم — فقط أنت والشيخ تريانه</p>
                </div>
              </label>
            )}

            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              {form.is_private
                ? "سؤالك خاص — لن يظهر للزوار الآخرين، يمكنك متابعة الإجابة من حسابك."
                : "قد يُنشر سؤالك وإجابة الشيخ على الموقع بعد المراجعة."}
            </p>

            {status === "error" && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{errorMsg}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={status === "loading"}
                className="bg-green-700 text-white px-8 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60 font-semibold">
                {status === "loading" ? "جاري الإرسال..." : "إرسال السؤال"}
              </button>
              <button type="button" onClick={() => setOpen(false)}
                className="text-gray-500 px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
