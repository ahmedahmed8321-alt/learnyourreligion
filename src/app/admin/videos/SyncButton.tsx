"use client";

import { useState } from "react";

export default function SyncButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSync(endpoint: string, label: string) {
    setStatus("loading");
    setMessage(`جاري ${label}...`);

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(`✅ ${label} — ${data.synced ?? data.playlists ?? ""} تم بنجاح`);
      } else {
        setStatus("error");
        setMessage(`❌ ${data.error ?? "حدث خطأ"}`);
      }
    } catch {
      setStatus("error");
      setMessage("❌ خطأ في الاتصال");
    }

    setTimeout(() => { setStatus("idle"); setMessage(""); }, 5000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => handleSync("/api/youtube/sync", "مزامنة المقاطع")}
        disabled={status === "loading"}
        className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-500 text-sm font-medium transition-colors disabled:opacity-60">
        {status === "loading" ? "⏳ جاري المزامنة..." : "🔄 مزامنة المقاطع"}
      </button>
      <button
        onClick={() => handleSync("/api/youtube/sync-playlists", "مزامنة قوائم التشغيل")}
        disabled={status === "loading"}
        className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-600 text-sm font-medium transition-colors disabled:opacity-60">
        {status === "loading" ? "⏳ جاري المزامنة..." : "🔄 مزامنة قوائم التشغيل"}
      </button>
      {message && (
        <span className={`text-sm px-3 py-1.5 rounded-lg ${
          status === "success" ? "bg-green-50 text-green-700" :
          status === "error" ? "bg-red-50 text-red-700" :
          "bg-blue-50 text-blue-700"
        }`}>
          {message}
        </span>
      )}
    </div>
  );
}
