"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "الرئيسية", icon: "⊞" },
  { href: "/admin/articles", label: "المقالات", icon: "📝" },
  { href: "/admin/qa", label: "الأسئلة والأجوبة", icon: "💬" },
  { href: "/admin/summaries", label: "الملخصات PDF", icon: "📄" },
  { href: "/admin/videos", label: "المقاطع", icon: "▶" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-green-700">
        <p className="font-bold text-yellow-400 text-sm">لوحة التحكم</p>
        <p className="text-green-400 text-xs mt-0.5">الشيخ محمود لاشين</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-green-700 text-white font-semibold" : "text-green-200 hover:bg-green-800"
              }`}>
              <span>{l.icon}</span> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-green-700 space-y-2">
        <Link href="/" target="_blank" onClick={() => setOpen(false)}
          className="block text-green-300 hover:text-white text-xs px-3 py-1.5 rounded hover:bg-green-800 transition-colors">
          ← عرض الموقع
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full text-right text-red-400 hover:text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 transition-colors">
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 right-0 left-0 z-50 bg-green-900 text-white flex items-center justify-between px-4 py-3 shadow">
        <span className="text-yellow-400 font-bold text-sm">لوحة التحكم</span>
        <button onClick={() => setOpen(!open)} className="p-1">
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-64 bg-green-900 text-white flex flex-col h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-green-900 text-white flex-col min-h-screen shrink-0">
        <NavContent />
      </aside>

      {/* Mobile top-bar spacer */}
      <div className="md:hidden h-12 w-full" />
    </>
  );
}
