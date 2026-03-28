"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Admin: sign in via NextAuth directly (no redirect to /admin/login)
    if (ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("بيانات الدخول غير صحيحة");
        setLoading(false);
      } else {
        router.push("/admin");
      }
      return;
    }

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/profile");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">تسجيل الدخول</h1>
          <p className="text-gray-400 text-sm mt-1">مرحباً بك في موقع الشيخ محمود لاشين</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required dir="ltr" placeholder="example@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required dir="ltr" placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-green-700 font-medium hover:underline">إنشاء حساب</Link>
        </p>

        <div className="border-t border-gray-100 mt-5 pt-4 text-center">
          <Link href="/admin/login" className="text-xs text-gray-400 hover:text-green-700 transition-colors">
            دخول لوحة التحكم (للشيخ فقط)
          </Link>
        </div>
      </div>
    </div>
  );
}
