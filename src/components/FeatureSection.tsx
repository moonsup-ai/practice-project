'use client';

import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

const FEATURE_STYLES = [
  { icon: '☯', color: 'rgba(124,58,237,0.3)', border: 'rgba(124,58,237,0.5)' },
  { icon: '♈', color: 'rgba(212,168,83,0.2)',  border: 'rgba(212,168,83,0.5)' },
  { icon: '∞', color: 'rgba(45,19,84,0.6)',    border: 'rgba(212,168,83,0.3)' },
];

export default function FeatureSection() {
  const { lang } = useLang();
  const f = t.feature;

  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest mb-3" style={{ color: '#d4a853' }}>
            {f.sectionBadge[lang]}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#e8d5b7' }}>
            {f.sectionTitle[lang]}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {f.items.map((item, i) => {
            const style = FEATURE_STYLES[i];
            return (
              <div
                key={i}
                className="glass-card rounded-2xl p-8 hover:scale-105 transition-transform duration-300"
                style={{ background: style.color, borderColor: style.border }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5"
                  style={{ background: 'rgba(212,168,83,0.1)', border: `1px solid ${style.border}` }}
                >
                  {style.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#f0c97a' }}>
                  {item.title[lang]}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,213,183,0.7)' }}>
                  {item.desc[lang]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
