'use client';

import { useMemo } from 'react';
import type { SajuResult, WesternChartResult } from '@/lib/astrology';
import { calcUnifiedFortune } from '@/lib/astrology';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

const SCORE_COLOR: Record<number, string> = {
  4: '#f0c97a', 3: '#f0c97a', 2: '#86efac', 1: '#86efac',
  0: '#e8d5b7', [-1]: '#fca5a5', [-2]: '#fca5a5',
};

export default function UnifiedTab({ saju, western, lmtOffsetMin }: { saju: SajuResult; western: WesternChartResult; lmtOffsetMin: number }) {
  const unified = useMemo(() => calcUnifiedFortune(saju, western, lmtOffsetMin), [saju, western, lmtOffsetMin]);
  const { sajuToday, westernToday, keyword, keywordEn, advice, adviceEn, score } = unified;
  const scoreColor = SCORE_COLOR[score] ?? '#e8d5b7';
  const { lang } = useLang();
  const u = t.unified;

  return (
    <div className="space-y-4">

      {/* 종합 키워드 */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{ background: 'rgba(45,19,84,0.5)', border: '1px solid rgba(212,168,83,0.2)' }}
      >
        <p className="text-xs tracking-widest mb-3" style={{ color: 'rgba(212,168,83,0.6)' }}>{u.sectionTitle[lang]}</p>
        <div
          className="text-3xl font-bold mb-3 tracking-widest"
          style={{ color: scoreColor }}
        >
          {lang === 'ko' ? keyword : keywordEn}
        </div>
        {/* 점수 바 */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {[-2, -1, 0, 1, 2, 3, 4].map(s => (
            <div
              key={s}
              className="w-6 h-2 rounded-full transition-all"
              style={{
                background: s <= score ? scoreColor : 'rgba(212,168,83,0.15)',
                opacity: s <= score ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,213,183,0.8)' }}>
          {lang === 'ko' ? advice : adviceEn}
        </p>
      </div>

      {/* 사주 + 서양 각각의 오늘 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 사주 */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(45,19,84,0.4)', border: '1px solid rgba(212,168,83,0.15)' }}
        >
          <p className="text-xs tracking-widest mb-2" style={{ color: 'rgba(212,168,83,0.6)' }}>{u.sajuLabel[lang]}</p>
          <p className="text-lg font-bold mb-1" style={{ color: '#e8d5b7' }}>
            {sajuToday.todayStemKr}{sajuToday.todayBranchKr}{u.dayUnit[lang]}
          </p>
          <p className="text-xs font-semibold mb-2" style={{ color: '#f0c97a' }}>{lang === 'ko' ? sajuToday.keyword : sajuToday.keywordEn}</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,213,183,0.65)' }}>
            {lang === 'ko' ? sajuToday.summary : sajuToday.summaryEn}
          </p>
        </div>
        {/* 서양 */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(45,19,84,0.4)', border: '1px solid rgba(212,168,83,0.15)' }}
        >
          <p className="text-xs tracking-widest mb-2" style={{ color: 'rgba(212,168,83,0.6)' }}>{u.westernLabel[lang]}</p>
          <p className="text-lg font-bold mb-1" style={{ color: '#e8d5b7' }}>
            ☽ {lang === 'ko' ? westernToday.todayMoonSign : westernToday.todayMoonSignEn}
          </p>
          <p className="text-xs font-semibold mb-2" style={{ color: '#f0c97a' }}>{lang === 'ko' ? westernToday.keyword : westernToday.keywordEn}</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,213,183,0.65)' }}>
            {lang === 'ko' ? westernToday.summary : westernToday.summaryEn}
          </p>
        </div>
      </div>

      {/* 오늘의 조합 설명 */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(45,19,84,0.3)', border: '1px solid rgba(212,168,83,0.1)' }}
      >
        <p className="text-xs mb-2" style={{ color: 'rgba(212,168,83,0.5)' }}>
          {u.todayDay[lang]} <span style={{ color: '#e8d5b7' }}>{sajuToday.todayStemKr}{sajuToday.todayBranchKr}</span>
          {' '}({lang === 'ko' ? sajuToday.sipShin : sajuToday.sipShinEn}) · {u.moonPos[lang]} <span style={{ color: '#e8d5b7' }}>{lang === 'ko' ? westernToday.todayMoonSign : westernToday.todayMoonSignEn}</span>
          {' '}({lang === 'ko' ? westernToday.keyword : westernToday.keywordEn}) {u.summaryNote[lang]}
        </p>
      </div>
    </div>
  );
}
