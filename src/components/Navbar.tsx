'use client';

import Link from 'next/link';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

export default function Navbar() {
  const { lang, setLang } = useLang();
  const n = t.nav;

  return (
    <nav
      className="w-full flex items-center justify-between px-6 md:px-16 py-5"
      style={{ borderBottom: '1px solid rgba(212,168,83,0.1)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">☽</span>
        <span className="text-xl font-bold tracking-widest" style={{ color: '#d4a853' }}>
          {lang === 'ko' ? '천명술' : 'Cheonmyeongsul'}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'rgba(232,213,183,0.7)' }}>
        <a href="#" className="hover:text-amber-300 transition-colors">{n.todayFortune[lang]}</a>
        <a href="#" className="hover:text-amber-300 transition-colors">{n.sajuAnalysis[lang]}</a>
        <a href="#" className="hover:text-amber-300 transition-colors">{n.astrology[lang]}</a>
        <a href="#" className="hover:text-amber-300 transition-colors">{n.compatibility[lang]}</a>
      </div>

      <div className="flex items-center gap-3">
        {/* 언어 토글 */}
        <button
          onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
          style={{
            background: 'rgba(212,168,83,0.08)',
            border: '1px solid rgba(212,168,83,0.3)',
            color: 'rgba(232,213,183,0.6)',
          }}
        >
          {lang === 'ko' ? '🌐 EN' : '🇰🇷 한국어'}
        </button>

        <Link
          href="/fortune"
          className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
          style={{
            background: 'rgba(212,168,83,0.15)',
            border: '1px solid rgba(212,168,83,0.5)',
            color: '#f0c97a',
          }}
        >
          {n.startFree[lang]}
        </Link>
      </div>
    </nav>
  );
}
