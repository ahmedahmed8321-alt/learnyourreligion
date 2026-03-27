"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (form.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "هذا البريد الإلكتروني مسجل مسبقاً"
          : "حدث خطأ، حاول مرة أخرى"
      );
      setLoading(false);
    } else {
      router.push("/profile?welcome=1");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">إنشاء حساب</h1>
          <p className="text-gray-400 text-sm mt-1">انضم لمجتمع طلاب العلم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              required placeholder="أبو محمد..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              required dir="ltr" placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              required dir="ltr" placeholder="6 أحرف على الأقل"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required dir="ltr" placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-green-700 font-medium hover:underline">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
