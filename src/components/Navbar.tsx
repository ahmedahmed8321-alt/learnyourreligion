"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const publicLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/videos", label: "المقاطع" },
  { href: "/articles", label: "المقالات" },
  { href: "/summaries", label: "ملخصات" },
  { href: "/qa", label: "س & ج" },
];

const adminLinks = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/videos", label: "المقاطع" },
  { href: "/admin/articles", label: "المقالات" },
  { href: "/admin/summaries", label: "الملخصات" },
  { href: "/admin/qa", label: "س & ج" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: adminSession } = useSession();

  // User is "logged in" if either Supabase user or NextAuth admin
  const isLoggedIn = !!user || !!adminSession;
  const displayName = user?.user_metadata?.name ?? adminSession?.user?.name ?? "م";
  const isAdmin = !!adminSession;

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);

    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  useEffect(() => { setOpen(false); setShowMenu(false); }, [pathname]);

  async function handleSignOut() {
    if (adminSession) {
      await nextAuthSignOut({ callbackUrl: "/" });
    }
    if (user) {
      const supabase = createSupabaseBrowser();
      await supabase.auth.signOut();
      setUser(null);
    }
    setShowMenu(false);
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-green-950 shadow-lg" : "bg-green-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <Image src="/logo.png" alt="الشيخ محمود لاشين"
                width={44} height={44}
                className="rounded-full border-2 border-yellow-400 object-cover shadow-lg" />
              <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-green-900" />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-yellow-400 font-bold text-base group-hover:text-yellow-300 transition-colors">
                تعلم دينك لتنجو وتسعد
              </p>
              <p className="text-green-300 text-xs">الشيخ محمود لاشين</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {(isAdmin ? adminLinks : publicLinks).map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link key={l.href} href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active ? "bg-green-700 text-yellow-300" : "text-green-100 hover:bg-green-800 hover:text-white"
                  }`}>
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78"
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow">
              <WhatsAppIcon />
              <span className="hidden md:inline">انضم للقناة</span>
            </a>

            {isLoggedIn ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setShowMenu(!showMenu)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-green-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors shadow"
                  title={displayName}>
                  {displayName[0]}
                </button>
                {showMenu && (
                  <div className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px] z-50">
                    {user && (
                      <Link href="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        حسابي
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        لوحة التحكم
                      </Link>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="text-green-200 hover:text-white border border-green-600 hover:border-green-400 px-3 py-1.5 rounded-full text-xs transition-colors">
                دخول
              </Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-white hover:bg-green-800 rounded-lg transition-colors"
              aria-label="القائمة">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-green-950 border-t border-green-800 px-4 py-3 space-y-1">
          {(isAdmin ? adminLinks : publicLinks).map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href}
                className={`flex items-center px-3 py-3 rounded-xl text-base transition-colors ${
                  active ? "bg-green-700 text-yellow-300 font-semibold" : "text-green-100 hover:bg-green-800"
                }`}>
                {l.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-green-800 flex gap-2 flex-wrap">
            <a href="https://chat.whatsapp.com/JdlcX5UzwpuJct08f9Ym78"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex-1 justify-center">
              <WhatsAppIcon /> انضم للقناة
            </a>
            {isLoggedIn ? (
              <button onClick={handleSignOut}
                className="flex items-center justify-center border border-red-600 text-red-400 px-4 py-2.5 rounded-xl text-sm flex-1">
                تسجيل الخروج
              </button>
            ) : (
              <Link href="/login"
                className="flex items-center justify-center border border-green-600 text-green-200 px-4 py-2.5 rounded-xl text-sm flex-1">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
