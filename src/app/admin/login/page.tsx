"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "admin_remember";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { email, password } = JSON.parse(saved);
      setEmail(email);
      setPassword(password);
      setRemember(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">لوحة التحكم</h1>
          <p className="text-gray-400 text-sm mt-1">الشيخ محمود لاشين</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="admin@example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded text-green-600 border-gray-300"
            />
            <span className="text-sm text-gray-600">تذكرني</span>
          </label>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
