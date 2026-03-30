'use client';

import { useState } from 'react';
import type { SajuResult, WesternChartResult } from '@/lib/astrology';
import SajuTab from '@/components/tabs/SajuTab';
import UnifiedTab from '@/components/tabs/UnifiedTab';
import WesternTab from '@/components/tabs/WesternTab';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

type Tab = 'unified' | 'saju' | 'western';

interface Props {
  saju: SajuResult;
  western: WesternChartResult;
  name: string;
  city: string;
  lmtOffsetMin: number;
}

const ZODIAC_KR_TO_EN: Record<string, string> = {
  '쥐':'Rat','소':'Ox','호랑이':'Tiger','토끼':'Rabbit','용':'Dragon','뱀':'Snake',
  '말':'Horse','양':'Goat','원숭이':'Monkey','닭':'Rooster','개':'Dog','돼지':'Pig',
};
const ELEMENT_KR_TO_EN: Record<string, string> = {
  '목':'Wood','화':'Fire','토':'Earth','금':'Metal','수':'Water',
};

export default function FortuneResult({ saju, western, name, city, lmtOffsetMin }: Props) {
  const [tab, setTab] = useState<Tab>('unified');
  const { lang } = useLang();
  const r = t.result;

  const { input } = saju;
  const dateStr = lang === 'ko'
    ? `${input.year}년 ${input.month}월 ${input.day}일 ${input.hour}시 ${input.minute}분`
    : `${input.year}/${String(input.month).padStart(2,'0')}/${String(input.day).padStart(2,'0')} ${String(input.hour).padStart(2,'0')}:${String(input.minute).padStart(2,'0')}`;

  return (
    <div className="max-w-lg mx-auto w-full px-4 pb-16 pt-6">
      {/* 프로필 헤더 */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-4"
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(212,168,83,0.3)', color: '#f0c97a' }}
        >
          ✦ {name}{r.headerBadge[lang]}
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#e8d5b7' }}>{name}</h2>
        <p className="text-sm" style={{ color: 'rgba(232,213,183,0.5)' }}>{dateStr} · {city}</p>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(232,213,183,0.5)' }}>
          {lang === 'ko'
            ? `${saju.zodiacAnimal}띠 · ${saju.dayMaster.yinYang}${saju.dayMaster.elementKr}일간`
            : `${ZODIAC_KR_TO_EN[saju.zodiacAnimal] ?? saju.zodiacAnimal} · ${saju.dayMaster.yinYang === '양' ? 'Yang' : 'Yin'} ${ELEMENT_KR_TO_EN[saju.dayMaster.elementKr] ?? saju.dayMaster.elementKr} Day Master`
          }
          {' · '}
          {(lang === 'ko' ? western.planets['sun']?.sign : western.planets['sun']?.signEn) ?? ''} ☀
        </p>
        {saju.input.hour >= 23 && (
          <p className="text-xs mt-1" style={{ color: 'rgba(212,168,83,0.55)' }}>
            {lang === 'ko'
              ? `${saju.input.jajasi} 적용`
              : `${saju.input.jajasi === '야자시' ? 'Late Zi' : 'Early Zi'} applied`}
          </p>
        )}
        {lmtOffsetMin !== 0 && (
          <p className="text-xs mt-1" style={{ color: 'rgba(212,168,83,0.55)' }}>
            {r.lmtApplied[lang]} {lmtOffsetMin > 0 ? '+' : ''}{lmtOffsetMin} {r.lmtMin[lang]}
          </p>
        )}
      </div>

      {/* 탭 */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{ background: 'rgba(45,19,84,0.5)', border: '1px solid rgba(212,168,83,0.15)' }}
      >
        {[
          { key: 'unified' as Tab, label: r.tabUnified[lang], icon: '◈' },
          { key: 'saju' as Tab,    label: r.tabSaju[lang],    icon: '☯' },
          { key: 'western' as Tab, label: r.tabWestern[lang], icon: '✦' },
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
      {tab === 'unified' && <UnifiedTab saju={saju} western={western} lmtOffsetMin={lmtOffsetMin} />}
      {tab === 'saju'    && <SajuTab    saju={saju} lmtOffsetMin={lmtOffsetMin} />}
      {tab === 'western' && <WesternTab western={western} />}
    </div>
  );
}
