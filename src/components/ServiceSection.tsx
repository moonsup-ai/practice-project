'use client';

import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  free:    { bg: 'rgba(34,197,94,0.15)',  text: '#86efac' },
  basic:   { bg: 'rgba(212,168,83,0.15)', text: '#f0c97a' },
  premium: { bg: 'rgba(124,58,237,0.2)',  text: '#c4b5fd' },
};

const SERVICE_EMOJIS = ['🌟', '📖', '💫', '💑'];

export default function ServiceSection() {
  const { lang } = useLang();
  const s = t.service;

  return (
    <section className="py-24 px-6 md:px-16" style={{ borderTop: '1px solid rgba(212,168,83,0.1)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest mb-3" style={{ color: '#d4a853' }}>
            {s.sectionBadge[lang]}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#e8d5b7' }}>
            {s.sectionTitle[lang]}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {s.items.map((item, i) => {
            const badge = BADGE_COLORS[item.badge];
            return (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 flex gap-5 items-start hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: 'rgba(212,168,83,0.1)' }}
                >
                  {SERVICE_EMOJIS[i]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold" style={{ color: '#e8d5b7' }}>{item.title[lang]}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {s.badge[item.badge][lang]}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,213,183,0.65)' }}>
                    {item.desc[lang]}
                  </p>
                </div>
                <span style={{ color: 'rgba(212,168,83,0.5)' }} className="text-lg">›</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
