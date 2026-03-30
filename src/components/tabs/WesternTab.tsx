'use client';

'use client';

import { useState, useMemo } from 'react';
import type { WesternChartResult } from '@/lib/astrology';
import { calcTodayWesternFortune } from '@/lib/astrology';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';
import type { Lang } from '@/lib/lang';

function moonPhaseName(angle: number, lang: Lang): string {
  const p = t.western.moonPhaseNames;
  if (angle < 22.5 || angle >= 337.5) return p.new[lang];
  if (angle < 67.5)  return p.waxingCrescent[lang];
  if (angle < 112.5) return p.firstQuarter[lang];
  if (angle < 157.5) return p.waxingGibbous[lang];
  if (angle < 202.5) return p.full[lang];
  if (angle < 247.5) return p.waningGibbous[lang];
  if (angle < 292.5) return p.lastQuarter[lang];
  return p.waningCrescent[lang];
}

export default function WesternTab({ western }: { western: WesternChartResult }) {
  const { lang } = useLang();
  const w = t.western;
  const PLANET_ORDER = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','northNode','southNode'];
  const today = useMemo(() => calcTodayWesternFortune(western), [western]);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">

      {/* 오늘의 운세 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,168,83,0.3)', background: 'rgba(45,19,84,0.6)' }}>
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{w.todayTitle[lang]}</p>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.45)' }}>☀</span>
              <span className="text-sm font-bold" style={{ color: '#f0c97a' }}>{today.sunSign}</span>
            </div>
            <span style={{ color: 'rgba(232,213,183,0.25)' }}>·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.45)' }}>☽</span>
              <span className="text-sm" style={{ color: 'rgba(232,213,183,0.7)' }}>{today.todayMoonSign}</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', color: '#f0c97a' }}>
              {today.keyword}
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#e8d5b7' }}>{today.summary}</p>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs transition-colors"
          style={{ borderTop: '1px solid rgba(212,168,83,0.15)', color: 'rgba(232,213,183,0.5)' }}
        >
          {open ? w.collapseBtn[lang] : w.expandBtn[lang]}
        </button>
      </div>

      {/* 상세 내용 */}
      {open && <div className="space-y-6">

      {/* ASC / MC / 달 위상 하이라이트 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: w.ascendant[lang], val: `${western.ascendant.sign} ${western.ascendant.degree}°`, sub: w.ascSub[lang], icon: '⬆' },
          { label: w.mc[lang],        val: `${western.mc.sign} ${western.mc.degree}°`,               sub: w.mcSub[lang],  icon: '✦' },
          { label: w.moonPhase[lang], val: moonPhaseName(western.moonPhaseAngle, lang),               sub: `${western.moonPhaseAngle}°`, icon: '☽' },
        ].map(item => (
          <div key={item.label} className="glass-card rounded-xl p-4 text-center">
            <div className="text-lg mb-1" style={{ color: '#d4a853' }}>{item.icon}</div>
            <div className="text-xs mb-1" style={{ color: 'rgba(232,213,183,0.5)' }}>{item.label}</div>
            <div className="font-bold text-sm leading-tight" style={{ color: '#e8d5b7' }}>{item.val}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(232,213,183,0.4)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* 행성 목록 */}
      <div>
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{w.planetsTitle[lang]}</p>
        <div className="glass-card rounded-2xl overflow-hidden">
          {PLANET_ORDER.map((key, i) => {
            const p = western.planets[key];
            if (!p) return null;
            return (
              <div
                key={key}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < PLANET_ORDER.length - 1 ? '1px solid rgba(212,168,83,0.08)' : 'none' }}
              >
                <span className="text-lg w-6 text-center" style={{ color: '#d4a853' }}>{p.symbol}</span>
                <span className="text-sm w-20 font-medium" style={{ color: '#e8d5b7' }}>{p.nameKr}</span>
                <span className="text-sm flex-1" style={{ color: 'rgba(232,213,183,0.7)' }}>
                  {p.signSymbol} {p.sign}
                </span>
                <span className="text-sm font-mono" style={{ color: 'rgba(232,213,183,0.55)' }}>
                  {p.degree}° {p.minute.toString().padStart(2, '0')}′
                </span>
                {p.retrograde && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                    {w.retrograde[lang]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 상(Aspect) */}
      {western.aspects.length > 0 && (
        <div>
          <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{w.aspectsTitle[lang]}</p>
          <div className="glass-card rounded-2xl overflow-hidden">
            {western.aspects.slice(0, 10).map((asp, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5"
                style={{ borderBottom: i < Math.min(western.aspects.length, 10) - 1 ? '1px solid rgba(212,168,83,0.08)' : 'none' }}
              >
                <span className="text-base w-5 text-center" style={{ color: '#d4a853' }}>{asp.symbol}</span>
                <span className="text-sm flex-1" style={{ color: '#e8d5b7' }}>
                  {asp.planet1Kr} {asp.aspectName} {asp.planet2Kr}
                </span>
                <span className="text-xs" style={{ color: 'rgba(232,213,183,0.4)' }}>
                  {asp.angle}° (orb {asp.orb}°)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하우스 */}
      <div>
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{w.housesTitle[lang]}</p>
        <div className="grid grid-cols-3 gap-2">
          {western.houses.map(h => (
            <div key={h.house} className="glass-card rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="text-xs w-5 font-bold" style={{ color: 'rgba(212,168,83,0.6)' }}>{h.house}</span>
              <span className="text-sm" style={{ color: '#e8d5b7' }}>{h.sign}</span>
              <span className="text-xs ml-auto" style={{ color: 'rgba(232,213,183,0.4)' }}>{h.degree}°</span>
            </div>
          ))}
        </div>
      </div>
      </div>}
    </div>
  );
}
