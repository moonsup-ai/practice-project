'use client';

import { useLang } from '@/lib/lang';

export default function Footer() {
  const { lang } = useLang();

  return (
    <footer
      className="py-10 px-6 md:px-16 text-center"
      style={{ borderTop: '1px solid rgba(212,168,83,0.1)' }}
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-xl">☽</span>
        <span className="font-bold tracking-widest" style={{ color: '#d4a853' }}>
          천명술
        </span>
        <span className="text-xl">☾</span>
      </div>
      <p className="text-xs" style={{ color: 'rgba(232,213,183,0.35)' }}>
        {lang === 'ko'
          ? '© 2026 천명술 · 사주 · 점성학 통합 운세 서비스'
          : '© 2026 Cheonmyeongsul · BaZi & Astrology Fortune Service'}
      </p>
    </footer>
  );
}
