"use client";

import { useState } from "react";
import type { Dhikr } from "@/lib/supabase";

export default function AdhkarList({ groups }: { groups: { category: string; items: Dhikr[] }[] }) {
  const [active, setActive] = useState<string>(groups[0]?.category ?? "");

  const current = groups.find((g) => g.category === active) ?? groups[0];

  return (
    <div>
      {/* Category tabs */}
      {groups.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {groups.map((g) => (
            <button key={g.category} onClick={() => setActive(g.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm ${
                active === g.category ? "bg-green-700 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
              }`}>
              {g.category} <span className="text-xs opacity-70">({g.items.length})</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {current?.items.map((d) => <DhikrCard key={d.id} dhikr={d} />)}
      </div>
    </div>
  );
}

function DhikrCard({ dhikr }: { dhikr: Dhikr }) {
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const target = dhikr.repeat_count > 0 ? dhikr.repeat_count : 1;
  const done = count >= target;

  function tap() {
    setCount((c) => (c >= target ? c : c + 1));
  }
  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(dhikr.text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }

  return (
    <div onClick={tap}
      className={`bg-white rounded-2xl shadow p-6 border-r-4 cursor-pointer select-none transition-colors ${
        done ? "border-green-500 bg-green-50/40" : "border-yellow-400 hover:bg-gray-50"
      }`}>
      <p className="text-green-950 text-lg sm:text-xl leading-loose font-medium text-center" style={{ lineHeight: 2.2 }}>
        {dhikr.text}
      </p>

      {dhikr.virtue && (
        <p className="text-gray-500 text-sm leading-relaxed mt-3 bg-gray-50 rounded-lg p-3 text-center">{dhikr.virtue}</p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* Counter */}
          <span className={`min-w-[3.5rem] text-center px-3 py-1.5 rounded-full text-sm font-bold ${
            done ? "bg-green-600 text-white" : "bg-green-100 text-green-800"
          }`}>
            {count} / {target}
          </span>
          {dhikr.reference && <span className="text-gray-400 text-xs">{dhikr.reference}</span>}
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setCount(0); }}
              className="text-gray-400 hover:text-gray-600 text-xs">تصفير</button>
          )}
          <button onClick={copy} className="text-green-600 hover:text-green-700 text-xs flex items-center gap-1">
            {copied ? "✓ تم النسخ" : "نسخ"}
          </button>
        </div>
      </div>
    </div>
  );
}
