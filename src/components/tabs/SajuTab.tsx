'use client';

import { useState, useMemo } from 'react';
import type { SajuResult } from '@/lib/astrology';
import { calcTodaySajuFortune, calcSinSal, calc12Unsung, getSipShin, HIDDEN_STEMS, BRANCH_EL, ELEMENTS_KR, SIP_SHIN_EN_MAP, UNSUNG_EN_MAP } from '@/lib/astrology';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

const ELEMENT_COLOR: Record<string, { text: string; bg: string }> = {
  木: { text: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  火: { text: '#fca5a5', bg: 'rgba(239,68,68,0.15)'  },
  土: { text: '#fcd34d', bg: 'rgba(234,179,8,0.15)'  },
  金: { text: '#e2e8f0', bg: 'rgba(148,163,184,0.15)'},
  水: { text: '#93c5fd', bg: 'rgba(59,130,246,0.15)' },
};

const ELEMENT_KR_COLOR: Record<string, string> = {
  목: '#86efac', 화: '#fca5a5', 토: '#fcd34d', 금: '#e2e8f0', 수: '#93c5fd',
};

const ELEMENT_KR_TO_EN: Record<string, string> = {
  '목':'Wood','화':'Fire','토':'Earth','금':'Metal','수':'Water',
};
const ZODIAC_KR_TO_EN: Record<string, string> = {
  '쥐':'Rat','소':'Ox','호랑이':'Tiger','토끼':'Rabbit','용':'Dragon','뱀':'Snake',
  '말':'Horse','양':'Goat','원숭이':'Monkey','닭':'Rooster','개':'Dog','돼지':'Pig',
};

export default function SajuTab({ saju, lmtOffsetMin }: { saju: SajuResult; lmtOffsetMin: number }) {
  const { lang } = useLang();
  const s = t.saju;

  const pillars = [
    { label: s.pillarLabels.hour[lang],  p: saju.hour  },
    { label: s.pillarLabels.day[lang],   p: saju.day   },
    { label: s.pillarLabels.month[lang], p: saju.month },
    { label: s.pillarLabels.year[lang],  p: saju.year  },
  ];

  const elements = Object.entries(saju.elementCount);
  const maxCount = Math.max(...elements.map(([, v]) => v));
  const today    = useMemo(() => calcTodaySajuFortune(saju, lmtOffsetMin, 0), [saju, lmtOffsetMin]);
  const tomorrow = useMemo(() => calcTodaySajuFortune(saju, lmtOffsetMin, 1), [saju, lmtOffsetMin]);
  const sinsal   = useMemo(() => calcSinSal(saju), [saju]);
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-4">

      {/* 오늘의 운세 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,168,83,0.3)', background: 'rgba(45,19,84,0.6)' }}>
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{s.todayTitle[lang]}</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-lg font-bold" style={{ color: '#f0c97a' }}>
              <span>{today.todayStemKr}{today.todayBranchKr}</span>
              <span className="text-sm font-normal" style={{ color: 'rgba(232,213,183,0.45)' }}>{s.dayUnit[lang]}</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', color: '#f0c97a' }}>
              {lang === 'ko' ? today.sipShin : today.sipShinEn} · {lang === 'ko' ? today.keyword : today.keywordEn}
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#e8d5b7' }}>{lang === 'ko' ? today.summary : today.summaryEn}</p>

          {/* 다음날 운세 */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.12)' }}>
            <p className="text-xs mb-1.5" style={{ color: 'rgba(212,168,83,0.6)' }}>
              {lang === 'ko' ? '내일 미리보기' : 'Tomorrow Preview'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: 'rgba(240,201,122,0.7)' }}>
                {tomorrow.todayStemKr}{tomorrow.todayBranchKr}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)', color: 'rgba(240,201,122,0.7)' }}>
                {lang === 'ko' ? tomorrow.sipShin : tomorrow.sipShinEn} · {lang === 'ko' ? tomorrow.keyword : tomorrow.keywordEn}
              </span>
              <span className="text-xs flex-1" style={{ color: 'rgba(232,213,183,0.45)' }}>
                {lang === 'ko' ? tomorrow.summary.slice(0, 25) + '…' : tomorrow.summaryEn.slice(0, 30) + '…'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs transition-colors"
          style={{ borderTop: '1px solid rgba(212,168,83,0.15)', color: 'rgba(232,213,183,0.5)' }}
        >
          {open ? s.collapseBtn[lang] : s.expandBtn[lang]}
        </button>
      </div>

      {/* 상세 내용 */}
      {open && <div className="space-y-6">

      {/* 일간 요약 */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: 'rgba(45,19,84,0.5)', border: '1px solid rgba(212,168,83,0.25)' }}
      >
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0"
          style={{
            background: `${ELEMENT_KR_COLOR[saju.dayMaster.elementKr]}22`,
            border: `1px solid ${ELEMENT_KR_COLOR[saju.dayMaster.elementKr]}44`,
            color: ELEMENT_KR_COLOR[saju.dayMaster.elementKr],
          }}
        >
          {saju.day.stemKr}
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(232,213,183,0.55)' }}>{s.dayMasterNote[lang]}</p>
          <p className="font-bold text-lg" style={{ color: '#e8d5b7' }}>
            {lang === 'ko'
              ? `${saju.dayMaster.yinYang} ${saju.dayMaster.elementKr}(${saju.day.stem}) · ${saju.zodiacAnimal}${s.zodiac[lang]}`
              : `${saju.dayMaster.yinYang === '양' ? 'Yang' : 'Yin'} ${ELEMENT_KR_TO_EN[saju.dayMaster.elementKr] ?? saju.dayMaster.elementKr}(${saju.day.stem}) · ${ZODIAC_KR_TO_EN[saju.zodiacAnimal] ?? saju.zodiacAnimal}${s.zodiac[lang]}`
            }
          </p>
          <p className="text-sm" style={{ color: 'rgba(232,213,183,0.6)' }}>
            {s.dominant[lang]} {saju.dominantElement} · {s.lacking[lang]} {saju.lackingElement}
          </p>
        </div>
      </div>

      {/* 사주 4주 테이블 */}
      <div>
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{s.pillarsTitle[lang]}</p>
        <div className="grid grid-cols-4 gap-2">
          {pillars.map(({ label, p }) => {
            const dmIdx = saju.dayMaster.stemIndex;
            const branchElKr = ELEMENTS_KR[BRANCH_EL[p.branchIndex]];
            const branchColor = ELEMENT_KR_COLOR[branchElKr] ?? '#e8d5b7';
            const hiddenLen = HIDDEN_STEMS[p.branchIndex].length;
            const branchSipShin = getSipShin(dmIdx, HIDDEN_STEMS[p.branchIndex][hiddenLen - 1]);
            const unsung = calc12Unsung(dmIdx, p.branchIndex);
            return (
              <div key={label} className="glass-card rounded-xl overflow-hidden">
                {/* 기둥 제목 */}
                <div className="py-2 text-center text-xs" style={{ color: 'rgba(212,168,83,0.7)', borderBottom: '1px solid rgba(212,168,83,0.15)' }}>
                  {label.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                </div>
                {/* 천간 십신 */}
                <div className="py-1 text-center text-xs" style={{ color: p.sipShin ? 'rgba(232,213,183,0.55)' : 'transparent', borderBottom: '1px solid rgba(212,168,83,0.1)' }}>
                  {p.sipShin ? (lang === 'ko' ? p.sipShin : (SIP_SHIN_EN_MAP[p.sipShin] ?? p.sipShin)) : '●'}
                </div>
                {/* 천간 */}
                <div className="py-3 text-center">
                  <div className="text-2xl font-bold" style={{ color: ELEMENT_KR_COLOR[p.elementKr] ?? '#e8d5b7' }}>
                    {p.stem}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(232,213,183,0.5)' }}>{p.stemKr}</div>
                </div>
                {/* 지지 */}
                <div className="py-3 text-center" style={{ borderTop: '1px solid rgba(212,168,83,0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: branchColor }}>{p.branch}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(232,213,183,0.5)' }}>{p.branchKr}</div>
                </div>
                {/* 지장간 */}
                <div className="py-1.5 text-center" style={{ borderTop: '1px solid rgba(212,168,83,0.1)', background: 'rgba(0,0,0,0.15)' }}>
                  <div className="text-xs" style={{ color: 'rgba(232,213,183,0.45)' }}>
                    {p.hiddenStems.map(h => h.stemKr).join(' ')}
                  </div>
                </div>
                {/* 지지십신 + 십이운성 */}
                <div className="py-1.5 text-center" style={{ borderTop: '1px solid rgba(212,168,83,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                  {branchSipShin && (
                    <div className="text-xs mb-0.5" style={{ color: 'rgba(232,213,183,0.5)' }}>
                      {lang === 'ko' ? branchSipShin : (SIP_SHIN_EN_MAP[branchSipShin] ?? branchSipShin)}
                    </div>
                  )}
                  <div className="text-xs font-medium" style={{ color: 'rgba(212,168,83,0.7)' }}>
                    {lang === 'ko' ? unsung : (UNSUNG_EN_MAP[unsung] ?? unsung)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* 범례 */}
        <div className="flex gap-4 mt-3 flex-wrap">
          <span className="text-xs" style={{ color: 'rgba(232,213,183,0.35)' }}>{s.pillarsLegend[lang]}</span>
        </div>
      </div>

      {/* 오행 분포 */}
      <div>
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{s.elementsTitle[lang]}</p>
        <div className="glass-card rounded-2xl p-5 space-y-3">
          {elements.map(([el, cnt]) => {
            const col = ELEMENT_COLOR[el] ?? { text: '#e8d5b7', bg: 'rgba(255,255,255,0.1)' };
            const pct = maxCount > 0 ? Math.round((cnt / maxCount) * 100) : 0;
            return (
              <div key={el} className="flex items-center gap-3">
                <div className="w-10 text-center text-sm font-bold" style={{ color: col.text }}>{el}</div>
                <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: col.text, opacity: 0.8 }}
                  />
                </div>
                <div className="w-6 text-right text-sm font-bold" style={{ color: col.text }}>{cnt}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 대운 */}
      <div>
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{s.daeunTitle[lang]}</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {saju.daeun.slice(0, 8).map((d, i) => {
            const col = ELEMENT_KR_COLOR[d.pillar.elementKr] ?? '#e8d5b7';
            return (
              <div
                key={i}
                className="shrink-0 glass-card rounded-xl p-3 text-center min-w-[72px]"
                style={{ border: `1px solid ${col}33` }}
              >
                <div className="text-xs mb-1" style={{ color: 'rgba(212,168,83,0.6)' }}>
                  {d.startAge}~{d.endAge}{s.ageUnit[lang]}
                </div>
                <div className="text-xl font-bold" style={{ color: col }}>{d.pillar.stem}</div>
                <div className="text-xl font-bold" style={{ color: '#e8d5b7' }}>{d.pillar.branch}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(232,213,183,0.45)' }}>
                  {lang === 'ko' ? d.sipShin : (SIP_SHIN_EN_MAP[d.sipShin] ?? d.sipShin)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 신살 / 귀인 */}
      <div>
        <p className="text-xs tracking-widest mb-1" style={{ color: '#d4a853' }}>
          {lang === 'ko' ? '✦ 신살 & 귀인 (일주 기준)' : '✦ Star Spirits & Guardians (Day Pillar)'}
        </p>
        <p className="text-xs mb-3" style={{ color: 'rgba(232,213,183,0.4)' }}>
          {lang === 'ko'
            ? '일주에서 파생되는 타고난 기질과 운의 특징입니다.'
            : 'Innate traits and fortune patterns derived from your Day Pillar.'}
        </p>
        <div className="space-y-2">
          {sinsal.map(s => (
            <div
              key={s.name}
              className="glass-card rounded-xl px-4 py-3 flex items-start gap-3"
              style={{ opacity: s.present ? 1 : 0.45 }}
            >
              <span className="text-xl shrink-0 mt-0.5">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: s.present ? '#f0c97a' : 'rgba(232,213,183,0.6)' }}>
                    {lang === 'ko' ? s.name : s.nameEn}
                  </span>
                  {s.present
                    ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,83,0.2)', border: '1px solid rgba(212,168,83,0.4)', color: '#f0c97a' }}>
                        {s.pillars.join(' · ')} 有
                      </span>
                    : <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(232,213,183,0.35)' }}>
                        {lang === 'ko' ? '없음' : 'Absent'}
                      </span>
                  }
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,213,183,0.6)' }}>
                  {lang === 'ko' ? s.shortDesc : s.shortDescEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      </div>}
    </div>
  );
}
