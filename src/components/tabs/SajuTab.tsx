'use client';

import { useState, useMemo } from 'react';
import type { SajuResult } from '@/lib/astrology';
import { calcTodaySajuFortune, calcSinSal, calc12Unsung, getSipShin, HIDDEN_STEMS, BRANCH_EL, ELEMENTS_KR, SIP_SHIN_EN_MAP, UNSUNG_EN_MAP, STEMS_KR } from '@/lib/astrology';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

const ELEMENT_COLOR: Record<string, { text: string; bg: string }> = {
  木: { text: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  火: { text: '#fca5a5', bg: 'rgba(239,68,68,0.15)'  },
  土: { text: '#fcd34d', bg: 'rgba(234,179,8,0.15)'  },
  金: { text: '#e2e8f0', bg: 'rgba(148,163,184,0.15)'},
  水: { text: '#93c5fd', bg: 'rgba(59,130,246,0.15)' },
};

const SIP_SHIN_META: Record<string, { emoji: string; color: string; tagKo: string; tagEn: string; descKo: string; descEn: string }> = {
  비견: { emoji: '⚔️', color: '#fca5a5', tagKo: '자립·경쟁', tagEn: 'Independence',
    descKo: '나와 같은 기운. 자존심이 강하고 독립적입니다. 내 방식대로 살고 싶어하고 경쟁심이 있습니다.',
    descEn: 'The same energy as you. Strong self-esteem and independence. Competitive and driven to live on your own terms.' },
  겁재: { emoji: '🔥', color: '#fb923c', tagKo: '추진·야망', tagEn: 'Ambition',
    descKo: '나와 비슷하지만 더 강렬한 기운. 강한 추진력과 결단력이 있지만 때로 충동적일 수 있습니다.',
    descEn: 'Similar to you but more intense. Strong drive and decisiveness, though sometimes impulsive.' },
  식신: { emoji: '🌱', color: '#86efac', tagKo: '창의·여유', tagEn: 'Creativity',
    descKo: '내가 편안하게 발산하는 기운. 표현력·창의력이 풍부하고 먹복과 여유로운 분위기가 있습니다.',
    descEn: 'The energy you freely radiate. Rich creativity and expression, with good fortune in comfort and pleasure.' },
  상관: { emoji: '🎨', color: '#67e8f9', tagKo: '재능·자유', tagEn: 'Talent',
    descKo: '내가 강렬하게 발산하는 기운. 뛰어난 재능과 자유로운 기질. 규칙보다 창의적 해결을 선호합니다.',
    descEn: 'Energy you radiate intensely. Outstanding talent and a free spirit — you prefer creativity over convention.' },
  편재: { emoji: '💸', color: '#fcd34d', tagKo: '사업·기회', tagEn: 'Business',
    descKo: '내가 제압하는 이질적 기운. 사업가 기질이 있고 큰 재물을 다루는 배짱이 있습니다.',
    descEn: 'The force you command and conquer. Entrepreneurial spirit and the boldness to handle big opportunities.' },
  정재: { emoji: '💰', color: '#f0c97a', tagKo: '안정·성실', tagEn: 'Stability',
    descKo: '내가 관리하는 동질적 기운. 성실하고 꼼꼼하며 안정적인 수입과 재물을 추구합니다.',
    descEn: 'The force you steadily manage. Diligent and detail-oriented, you seek stable income and material security.' },
  편관: { emoji: '⚡', color: '#c4b5fd', tagKo: '카리스마·힘', tagEn: 'Power',
    descKo: '나를 강하게 압박하는 기운. 강한 카리스마와 도전 정신. 역경을 통해 성장합니다.',
    descEn: 'The force that pressures and tests you. Strong charisma and competitive drive — you grow through adversity.' },
  정관: { emoji: '👑', color: '#818cf8', tagKo: '명예·원칙', tagEn: 'Authority',
    descKo: '나를 올바르게 제어하는 기운. 명예와 원칙을 중시하고 사회적 신뢰와 인정을 추구합니다.',
    descEn: 'The force that guides you with integrity. You value honor and principle, seeking social recognition and trust.' },
  편인: { emoji: '🔮', color: '#e879f9', tagKo: '직관·독창', tagEn: 'Intuition',
    descKo: '나를 독특하게 키우는 기운. 직관력과 독창성. 남다른 시각으로 전문 분야에서 빛을 발합니다.',
    descEn: 'The force that nurtures your uniqueness. Strong intuition and originality — you shine in specialized fields.' },
  정인: { emoji: '📖', color: '#a78bfa', tagKo: '학문·지혜', tagEn: 'Wisdom',
    descKo: '나를 바르게 키우는 기운. 학습 능력이 뛰어나고 스승·귀인의 도움을 자연스럽게 받습니다.',
    descEn: 'The force that nurtures you with wisdom. Quick learner who naturally attracts mentors and helpful people.' },
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

      {/* 십신 분석 */}
      <div>
        <p className="text-xs tracking-widest mb-1" style={{ color: '#d4a853' }}>
          {lang === 'ko' ? '✦ 십신 분석' : '✦ Ten Gods Analysis'}
        </p>
        <p className="text-xs mb-4" style={{ color: 'rgba(232,213,183,0.4)' }}>
          {lang === 'ko'
            ? '일간(나)과 각 기둥의 오행 관계를 나타냅니다. 타고난 성격, 재물·관계·학문의 기질을 읽을 수 있습니다.'
            : 'Shows the elemental relationships between your Day Master and each pillar — revealing innate personality, wealth, relationships, and learning style.'}
        </p>

        {/* 기둥별 십신 한눈에 보기 */}
        {(() => {
          const dmIdx = saju.dayMaster.stemIndex;
          const pillarDefs = [
            { labelKo: '시간', labelEn: 'Hour', stem: STEMS_KR[saju.hour.stemIndex],  sipShin: saju.hour.sipShin },
            { labelKo: '일간', labelEn: 'Day',  stem: STEMS_KR[saju.day.stemIndex],   sipShin: undefined },
            { labelKo: '월간', labelEn: 'Mon',  stem: STEMS_KR[saju.month.stemIndex], sipShin: saju.month.sipShin },
            { labelKo: '연간', labelEn: 'Year', stem: STEMS_KR[saju.year.stemIndex],  sipShin: saju.year.sipShin },
          ];
          const branchDefs = [
            { labelKo: '시지', labelEn: 'H.Br', branchKr: saju.hour.branchKr,  sipShin: getSipShin(dmIdx, HIDDEN_STEMS[saju.hour.branchIndex].at(-1)!) },
            { labelKo: '일지', labelEn: 'D.Br', branchKr: saju.day.branchKr,   sipShin: getSipShin(dmIdx, HIDDEN_STEMS[saju.day.branchIndex].at(-1)!) },
            { labelKo: '월지', labelEn: 'M.Br', branchKr: saju.month.branchKr, sipShin: getSipShin(dmIdx, HIDDEN_STEMS[saju.month.branchIndex].at(-1)!) },
            { labelKo: '연지', labelEn: 'Y.Br', branchKr: saju.year.branchKr,  sipShin: getSipShin(dmIdx, HIDDEN_STEMS[saju.year.branchIndex].at(-1)!) },
          ];
          return (
            <div className="glass-card rounded-2xl p-4 mb-4">
              {/* 천간 */}
              <p className="text-xs mb-2" style={{ color: 'rgba(212,168,83,0.55)' }}>{lang === 'ko' ? '천간 (일간 기준)' : 'Heavenly Stems'}</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {pillarDefs.map(({ labelKo, labelEn, stem, sipShin }) => {
                  const meta = sipShin ? SIP_SHIN_META[sipShin] : null;
                  return (
                    <div key={labelKo} className="text-center">
                      <div className="text-xs mb-1" style={{ color: 'rgba(212,168,83,0.5)' }}>{lang === 'ko' ? labelKo : labelEn}</div>
                      <div className="text-base font-bold mb-1" style={{ color: '#e8d5b7' }}>{stem}</div>
                      <div className="text-xs px-1.5 py-0.5 rounded-full" style={{
                        background: meta ? `${meta.color}22` : 'rgba(212,168,83,0.08)',
                        color: meta ? meta.color : 'rgba(232,213,183,0.4)',
                        border: `1px solid ${meta ? `${meta.color}44` : 'rgba(212,168,83,0.1)'}`,
                      }}>
                        {sipShin ? (lang === 'ko' ? sipShin : (SIP_SHIN_EN_MAP[sipShin] ?? sipShin)) : (lang === 'ko' ? '본원' : 'Self')}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* 지지 */}
              <p className="text-xs mb-2" style={{ color: 'rgba(212,168,83,0.55)' }}>{lang === 'ko' ? '지지 정기 (일간 기준)' : 'Earthly Branches (main qi)'}</p>
              <div className="grid grid-cols-4 gap-2">
                {branchDefs.map(({ labelKo, labelEn, branchKr, sipShin }) => {
                  const meta = SIP_SHIN_META[sipShin];
                  return (
                    <div key={labelKo} className="text-center">
                      <div className="text-xs mb-1" style={{ color: 'rgba(212,168,83,0.5)' }}>{lang === 'ko' ? labelKo : labelEn}</div>
                      <div className="text-base font-bold mb-1" style={{ color: '#e8d5b7' }}>{branchKr}</div>
                      <div className="text-xs px-1.5 py-0.5 rounded-full" style={{
                        background: `${meta.color}22`,
                        color: meta.color,
                        border: `1px solid ${meta.color}44`,
                      }}>
                        {lang === 'ko' ? sipShin : (SIP_SHIN_EN_MAP[sipShin] ?? sipShin)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 내 사주에 있는 십신 설명 */}
        {(() => {
          const dmIdx = saju.dayMaster.stemIndex;
          const entries: { sipShin: string; pillarsKo: string[]; pillarsEn: string[] }[] = [];
          const seen = new Map<string, { ko: string[]; en: string[] }>();
          const add = (sipShin: string | undefined, ko: string, en: string) => {
            if (!sipShin) return;
            if (!seen.has(sipShin)) seen.set(sipShin, { ko: [], en: [] });
            seen.get(sipShin)!.ko.push(ko);
            seen.get(sipShin)!.en.push(en);
          };
          add(saju.year.sipShin,  '연간', 'Year stem');
          add(saju.month.sipShin, '월간', 'Month stem');
          add(saju.hour.sipShin,  '시간', 'Hour stem');
          add(getSipShin(dmIdx, HIDDEN_STEMS[saju.year.branchIndex].at(-1)!),   '연지', 'Year branch');
          add(getSipShin(dmIdx, HIDDEN_STEMS[saju.month.branchIndex].at(-1)!),  '월지', 'Month branch');
          add(getSipShin(dmIdx, HIDDEN_STEMS[saju.day.branchIndex].at(-1)!),    '일지', 'Day branch');
          add(getSipShin(dmIdx, HIDDEN_STEMS[saju.hour.branchIndex].at(-1)!),   '시지', 'Hour branch');
          seen.forEach((v, k) => entries.push({ sipShin: k, pillarsKo: v.ko, pillarsEn: v.en }));
          return (
            <div className="space-y-2">
              {entries.map(({ sipShin, pillarsKo, pillarsEn }) => {
                const meta = SIP_SHIN_META[sipShin];
                if (!meta) return null;
                return (
                  <div
                    key={sipShin}
                    className="rounded-xl px-4 py-3"
                    style={{ background: `${meta.color}0d`, border: `1px solid ${meta.color}33` }}
                  >
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-base">{meta.emoji}</span>
                      <span className="text-sm font-bold" style={{ color: meta.color }}>
                        {lang === 'ko' ? sipShin : (SIP_SHIN_EN_MAP[sipShin] ?? sipShin)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>
                        {lang === 'ko' ? meta.tagKo : meta.tagEn}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(232,213,183,0.4)' }}>
                        {lang === 'ko' ? pillarsKo.join(' · ') : pillarsEn.join(' · ')}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,213,183,0.65)' }}>
                      {lang === 'ko' ? meta.descKo : meta.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      </div>}
    </div>
  );
}
