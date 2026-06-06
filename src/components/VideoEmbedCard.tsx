"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Video } from "@/lib/supabase";

interface Snippet { text: string; q: string }

/** A video thumbnail card that opens the video in an embedded lightbox player
 *  (stays on the site) with a transcript panel, instead of redirecting to YouTube. */
export default function VideoEmbedCard({ video, variant = "grid", snippet }: { video: Video; variant?: "home" | "grid"; snippet?: Snippet }) {
  const [open, setOpen] = useState(false);

  const date = new Date(video.published_at).toLocaleDateString("ar-EG",
    variant === "home" ? { year: "numeric", month: "long", day: "numeric" } : undefined);

  const SnippetEl = snippet ? (
    <p className="text-[11px] text-gray-600 mt-1.5 line-clamp-2 leading-relaxed bg-yellow-50 rounded px-2 py-1">
      <span className="text-gray-400">…</span><Highlight text={snippet.text} q={snippet.q} /><span className="text-gray-400">…</span>
    </p>
  ) : null;

  return (
    <>
      {variant === "home" ? (
        <button onClick={() => setOpen(true)}
          className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-right w-full">
          <div className="relative overflow-hidden">
            <Image src={video.thumbnail_url} alt={video.title} width={480} height={270}
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="bg-red-600 text-white rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300">
                <PlayIcon />
              </span>
            </div>
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">فيديو</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-relaxed group-hover:text-green-700 transition-colors">{video.title}</h3>
            <p className="text-gray-400 text-xs mt-2">{date}</p>
            {SnippetEl}
          </div>
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition-all flex flex-col text-right w-full">
          <div className="relative">
            <Image src={video.thumbnail_url} alt={video.title} width={320} height={180}
              className="w-full aspect-video object-cover group-hover:brightness-75 transition-all" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-red-600 text-white rounded-full p-3 shadow-xl"><PlayIcon /></span>
            </div>
          </div>
          <div className="p-2 flex-1 flex flex-col">
            <h3 className="font-medium text-gray-800 text-xs line-clamp-2 leading-relaxed flex-1">{video.title}</h3>
            <p className="text-gray-400 text-xs mt-1">{date}</p>
            {SnippetEl}
          </div>
        </button>
      )}

      {open && <VideoModal video={video} highlight={snippet?.q} onClose={() => setOpen(false)} />}
    </>
  );
}

function VideoModal({ video, highlight, onClose }: { video: Video; highlight?: string; onClose: () => void }) {
  const [tr, setTr] = useState<{ loading: boolean; text: string | null; open: boolean }>({ loading: false, text: null, open: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  async function toggleTranscript() {
    if (tr.text !== null) { setTr((s) => ({ ...s, open: !s.open })); return; }
    setTr({ loading: true, text: null, open: true });
    try {
      const r = await fetch(`/api/videos/transcript?id=${video.youtube_id}`);
      const d = await r.json();
      setTr({ loading: false, text: d.transcript ?? "", open: true });
    } catch {
      setTr({ loading: false, text: "", open: true });
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-4xl my-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="إغلاق"
          className="absolute -top-9 left-0 text-white/80 hover:text-white flex items-center gap-1 text-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          إغلاق
        </button>
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="text-white/90 text-sm mt-3 text-center line-clamp-2">{video.title}</p>

        {/* Transcript */}
        <div className="mt-2 flex items-center justify-center gap-4">
          <button onClick={toggleTranscript} className="text-white/80 hover:text-white text-sm flex items-center gap-1">
            📄 {tr.open ? "إخفاء النص" : "عرض النص"}
          </button>
          <a href={`https://www.youtube.com/watch?v=${video.youtube_id}`} target="_blank" rel="noopener noreferrer"
            className="text-white/50 hover:text-white/80 text-xs">فتح في يوتيوب ↗</a>
        </div>
        {tr.open && (
          <div className="mt-2 max-h-64 overflow-y-auto bg-white/95 rounded-lg p-4 text-sm text-gray-800 leading-loose">
            {tr.loading ? "جاري تحميل النص..." :
              tr.text ? <Highlight text={tr.text} q={highlight} /> :
              <span className="text-gray-400">لا يتوفر نص لهذا المقطع بعد. تتم إضافة النصوص تلقائياً.</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function escapeRegExp(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function Highlight({ text, q }: { text: string; q?: string }) {
  if (!q || !q.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(q.trim())})`, "gi"));
  return <>{parts.map((p, i) =>
    p.toLowerCase() === q.trim().toLowerCase()
      ? <mark key={i} className="bg-yellow-300 rounded px-0.5">{p}</mark>
      : <span key={i}>{p}</span>
  )}</>;
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}
