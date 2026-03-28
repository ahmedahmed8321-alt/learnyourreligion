"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("حدث خطأ، تأكد من صحة البريد الإلكتروني");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">استعادة كلمة المرور</h1>
          <p className="text-gray-400 text-sm mt-1">سنرسل لك رابط لإعادة تعيين كلمة المرور</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-green-800 font-semibold">تم إرسال الرابط</p>
            <p className="text-gray-500 text-sm">تحقق من بريدك الإلكتروني <span dir="ltr" className="font-medium text-gray-700">{email}</span> واتبع الرابط لإعادة تعيين كلمة المرور</p>
            <p className="text-gray-400 text-xs">لم يصلك شيء؟ تحقق من مجلد الرسائل غير المرغوب فيها</p>
            <Link href="/login" className="inline-block text-green-700 font-medium text-sm hover:underline mt-2">
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required dir="ltr" placeholder="example@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
                {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              تذكرت كلمة المرور؟{" "}
              <Link href="/login" className="text-green-700 font-medium hover:underline">تسجيل الدخول</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
