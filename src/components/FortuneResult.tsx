'use client';

import { useState, useMemo } from 'react';
import type { SajuResult, WesternChartResult } from '@/lib/astrology';
import { calcTodaySajuFortune, calcTodayWesternFortune, calc12Unsung, getSipShin, HIDDEN_STEMS, BRANCH_EL, ELEMENTS_KR } from '@/lib/astrology';

// ─── 탭 타입 ─────────────────────────────────────────────────

type Tab = 'saju' | 'western';

// ─── 오행 색상 ────────────────────────────────────────────────

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

// ─── 달의 위상 텍스트 ─────────────────────────────────────────

function moonPhaseName(angle: number): string {
  if (angle < 22.5 || angle >= 337.5) return '삭 (新月)';
  if (angle < 67.5)  return '초승달';
  if (angle < 112.5) return '상현 (半月)';
  if (angle < 157.5) return '차오르는 달';
  if (angle < 202.5) return '망 (滿月)';
  if (angle < 247.5) return '기우는 달';
  if (angle < 292.5) return '하현 (半月)';
  return '그믐달';
}

// ─── 사주 탭 ─────────────────────────────────────────────────

function SajuTab({ saju, lmtOffsetMin }: { saju: SajuResult; lmtOffsetMin: number }) {
  const pillars = [
    { label: '시주\n時柱', p: saju.hour  },
    { label: '일주\n日柱', p: saju.day   },
    { label: '월주\n月柱', p: saju.month },
    { label: '연주\n年柱', p: saju.year  },
  ];

  const elements = Object.entries(saju.elementCount);
  const maxCount = Math.max(...elements.map(([, v]) => v));
  const today = useMemo(() => calcTodaySajuFortune(saju, lmtOffsetMin), [saju, lmtOffsetMin]);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">

      {/* 오늘의 운세 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,168,83,0.3)', background: 'rgba(45,19,84,0.6)' }}>
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 오늘의 운세</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-lg font-bold" style={{ color: '#f0c97a' }}>
              <span>{today.todayStemKr}{today.todayBranchKr}</span>
              <span className="text-sm font-normal" style={{ color: 'rgba(232,213,183,0.45)' }}>일</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', color: '#f0c97a' }}>
              {today.sipShin} · {today.keyword}
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#e8d5b7' }}>{today.summary}</p>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs transition-colors"
          style={{ borderTop: '1px solid rgba(212,168,83,0.15)', color: 'rgba(232,213,183,0.5)' }}
        >
          {open ? '접기 ▲' : '자세한 사주 분석 ▼'}
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
          <p className="text-xs mb-1" style={{ color: 'rgba(232,213,183,0.55)' }}>일간 (日干) · 나의 기본 기운</p>
          <p className="font-bold text-lg" style={{ color: '#e8d5b7' }}>
            {saju.dayMaster.yinYang} {saju.dayMaster.elementKr}({saju.day.stem}) · {saju.zodiacAnimal}띠
          </p>
          <p className="text-sm" style={{ color: 'rgba(232,213,183,0.6)' }}>
            강한 오행 {saju.dominantElement} · 약한 오행 {saju.lackingElement}
          </p>
        </div>
      </div>

      {/* 사주 4주 테이블 */}
      <div>
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 사주팔자 (四柱八字)</p>
        <div className="grid grid-cols-4 gap-2">
          {pillars.map(({ label, p }) => {
            const dmIdx = saju.dayMaster.stemIndex;
            const branchElKr = ELEMENTS_KR[BRANCH_EL[p.branchIndex]];
            const branchColor = ELEMENT_KR_COLOR[branchElKr] ?? '#e8d5b7';
            const hiddenLen = HIDDEN_STEMS[p.branchIndex].length;
            const branchSipShin = p.sipShin !== undefined
              ? getSipShin(dmIdx, HIDDEN_STEMS[p.branchIndex][hiddenLen - 1])
              : undefined;
            const unsung = calc12Unsung(dmIdx, p.branchIndex);
            return (
              <div key={label} className="glass-card rounded-xl overflow-hidden">
                {/* 기둥 제목 */}
                <div className="py-2 text-center text-xs" style={{ color: 'rgba(212,168,83,0.7)', borderBottom: '1px solid rgba(212,168,83,0.15)' }}>
                  {label.split('\n').map((l, i) => <div key={i}>{l}</div>)}
                </div>
                {/* 천간 십신 */}
                <div className="py-1 text-center text-xs" style={{ color: p.sipShin ? 'rgba(232,213,183,0.55)' : 'transparent', borderBottom: '1px solid rgba(212,168,83,0.1)' }}>
                  {p.sipShin ?? '●'}
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
                    <div className="text-xs mb-0.5" style={{ color: 'rgba(232,213,183,0.5)' }}>{branchSipShin}</div>
                  )}
                  <div className="text-xs font-medium" style={{ color: 'rgba(212,168,83,0.7)' }}>{unsung}</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* 범례 */}
        <div className="flex gap-4 mt-3 flex-wrap">
          <span className="text-xs" style={{ color: 'rgba(232,213,183,0.35)' }}>위→아래: 천간십신 · 천간 · 지지 · 지장간 · 지지십신 · 십이운성</span>
        </div>
      </div>

      {/* 오행 분포 */}
      <div>
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 오행 분포 (8자 기준)</p>
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
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 대운 (大運) 10년 주기</p>
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
                  {d.startAge}~{d.endAge}세
                </div>
                <div className="text-xl font-bold" style={{ color: col }}>{d.pillar.stem}</div>
                <div className="text-xl font-bold" style={{ color: '#e8d5b7' }}>{d.pillar.branch}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(232,213,183,0.45)' }}>{d.sipShin}</div>
              </div>
            );
          })}
        </div>
      </div>
      </div>}
    </div>
  );
}

// ─── 서양 점성학 탭 ──────────────────────────────────────────

function WesternTab({ western }: { western: WesternChartResult }) {
  const PLANET_ORDER = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','northNode','southNode'];
  const today = useMemo(() => calcTodayWesternFortune(western), [western]);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">

      {/* 오늘의 운세 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,168,83,0.3)', background: 'rgba(45,19,84,0.6)' }}>
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 오늘의 운세</p>
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
          {open ? '접기 ▲' : '자세한 점성학 분석 ▼'}
        </button>
      </div>

      {/* 상세 내용 */}
      {open && <div className="space-y-6">

      {/* ASC / MC / 달 위상 하이라이트 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '어센던트', val: `${western.ascendant.sign} ${western.ascendant.degree}°`, sub: '나의 외면·첫인상', icon: '⬆' },
          { label: '중천 MC', val: `${western.mc.sign} ${western.mc.degree}°`, sub: '사회적 목표·경력', icon: '✦' },
          { label: '달의 위상', val: moonPhaseName(western.moonPhaseAngle), sub: `위상각 ${western.moonPhaseAngle}°`, icon: '☽' },
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
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 행성 위치</p>
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
                    ℞
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
          <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 주요 상 (Aspects)</p>
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
        <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>✦ 하우스 (Placidus)</p>
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

// ─── 메인 컴포넌트 ────────────────────────────────────────────

interface Props {
  saju: SajuResult;
  western: WesternChartResult;
  name: string;
  city: string;
  lmtOffsetMin: number;
}

export default function FortuneResult({ saju, western, name, city, lmtOffsetMin }: Props) {
  const [tab, setTab] = useState<Tab>('saju');

  const { input } = saju;
  const dateStr = `${input.year}년 ${input.month}월 ${input.day}일 ${input.hour}시 ${input.minute}분`;

  return (
    <div className="max-w-lg mx-auto w-full px-4 pb-16 pt-6">
      {/* 프로필 헤더 */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-4"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(212,168,83,0.3)', color: '#f0c97a' }}
        >
          ✦ {name}님의 운명 분석
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#e8d5b7' }}>{name}</h2>
        <p className="text-sm" style={{ color: 'rgba(232,213,183,0.5)' }}>{dateStr} · {city}</p>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(232,213,183,0.5)' }}>
          {saju.zodiacAnimal}띠 · {saju.dayMaster.yinYang}{saju.dayMaster.elementKr}일간
          {' · '}
          {western.planets['sun']?.sign ?? ''} ☀
        </p>
        {saju.input.hour >= 23 && (
          <p className="text-xs mt-1" style={{ color: 'rgba(212,168,83,0.55)' }}>
            {saju.input.jajasi} 적용
          </p>
        )}
        {lmtOffsetMin !== 0 && (
          <p className="text-xs mt-1" style={{ color: 'rgba(212,168,83,0.55)' }}>
            경도 시차 보정 {lmtOffsetMin > 0 ? '+' : ''}{lmtOffsetMin}분 적용
          </p>
        )}
      </div>

      {/* 탭 */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{ background: 'rgba(45,19,84,0.5)', border: '1px solid rgba(212,168,83,0.15)' }}
      >
        {[
          { key: 'saju' as Tab,    label: '사주팔자', icon: '☯' },
          { key: 'western' as Tab, label: '서양 점성학', icon: '✦' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.key ? 'rgba(212,168,83,0.2)' : 'transparent',
              color: tab === t.key ? '#f0c97a' : 'rgba(232,213,183,0.5)',
              border: tab === t.key ? '1px solid rgba(212,168,83,0.3)' : '1px solid transparent',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {tab === 'saju'    && <SajuTab    saju={saju} lmtOffsetMin={lmtOffsetMin} />}
      {tab === 'western' && <WesternTab western={western} />}
    </div>
  );
}
