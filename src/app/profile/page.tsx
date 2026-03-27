"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { QA } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";

  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data } = await supabase
        .from("qa")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setQuestions((data ?? []) as QA[]);
      setLoading(false);
    }
    load();
  }, [router]);

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        <div className="animate-pulse text-lg">جاري التحميل...</div>
      </div>
    );
  }

  const answered = questions.filter((q) => q.answer);
  const pending = questions.filter((q) => !q.answer);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Welcome banner */}
      {isWelcome && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <h2 className="font-bold text-green-800 text-lg">أهلاً وسهلاً!</h2>
          <p className="text-green-600 text-sm mt-1">تم إنشاء حسابك بنجاح. يمكنك الآن إرسال أسئلتك للشيخ.</p>
        </div>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h1 className="font-bold text-green-900 text-xl">
              {user?.user_metadata?.name ?? "مستخدم"}
            </h1>
            <p className="text-gray-400 text-sm" dir="ltr">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut}
          className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
          تسجيل الخروج
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "كل الأسئلة", value: questions.length, color: "bg-gray-50 text-gray-700" },
          { label: "تم الرد", value: answered.length, color: "bg-green-50 text-green-700" },
          { label: "في الانتظار", value: pending.length, color: "bg-yellow-50 text-yellow-700" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Questions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-900">أسئلتي</h2>
        <Link href="/qa" className="text-sm text-green-600 hover:underline">إرسال سؤال جديد →</Link>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500 font-medium">لم ترسل أي أسئلة بعد</p>
          <Link href="/qa"
            className="inline-block mt-4 bg-green-700 text-white px-6 py-2 rounded-full text-sm hover:bg-green-600 transition-colors">
            اسأل الشيخ الآن
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className={`bg-white rounded-xl shadow p-5 border-r-4 ${q.answer ? "border-green-500" : "border-yellow-400"}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold text-green-900 leading-relaxed">س: {q.question}</p>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {q.is_private && (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">🔒 خاص</span>
                  )}
                  {q.published ? (
                    <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">منشور</span>
                  ) : (
                    <span className="bg-yellow-50 text-yellow-600 text-xs px-2 py-0.5 rounded-full">في الانتظار</span>
                  )}
                </div>
              </div>

              {q.answer ? (
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="text-gray-700 text-sm leading-loose">
                    <span className="font-semibold text-yellow-600 ml-1">ج:</span>
                    {q.answer}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-xs mt-2">سيتم الرد عليك قريباً بإذن الله</p>
              )}

              <p className="text-gray-300 text-xs mt-2">
                {new Date(q.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
