'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { calcSaju, calcWesternChart } from '@/lib/astrology';
import FortuneResult from '@/components/FortuneResult';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';

export default function ResultContent() {
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const r = t.result;

  const name   = searchParams.get('name')   ?? '익명';
  const year   = Number(searchParams.get('year')   ?? 1990);
  const month  = Number(searchParams.get('month')  ?? 1);
  const day    = Number(searchParams.get('day')    ?? 1);
  const hour   = Number(searchParams.get('hour')   ?? 12);
  const minute = Number(searchParams.get('minute') ?? 0);
  const gender = (searchParams.get('gender') ?? '남') as '남' | '여';
  const lat    = Number(searchParams.get('lat')    ?? 37.5665);
  const lng    = Number(searchParams.get('lng')    ?? 126.9780);
  const city   = searchParams.get('city')   ?? '서울';
  const jajasi = (searchParams.get('jajasi') ?? '야자시') as '야자시' | '조자시';

  // KST → UT (-9h) for western chart
  const { utHour, utMinute, utDay, utMonth, utYear } = useMemo(() => {
    let totalMin = hour * 60 + minute - 9 * 60;
    let utDay = day, utMonth = month, utYear = year;
    if (totalMin < 0) {
      totalMin += 24 * 60;
      utDay -= 1;
      if (utDay < 1) {
        utMonth -= 1;
        if (utMonth < 1) { utMonth = 12; utYear -= 1; }
        const daysInMonth = new Date(utYear, utMonth, 0).getDate();
        utDay = daysInMonth;
      }
    } else if (totalMin >= 24 * 60) {
      totalMin -= 24 * 60;
      utDay += 1;
      const daysInMonth = new Date(utYear, utMonth, 0).getDate();
      if (utDay > daysInMonth) { utDay = 1; utMonth += 1; }
      if (utMonth > 12) { utMonth = 1; utYear += 1; }
    }
    return { utYear, utMonth, utDay, utHour: Math.floor(totalMin / 60), utMinute: totalMin % 60 };
  }, [year, month, day, hour, minute]);

  // KST(135°E 기준) → LMT 보정: 사주 시주 계산에 사용
  // 보정량(분) = (출생지 경도 - 135) × 4
  const { lmtYear, lmtMonth, lmtDay, lmtHour, lmtMinute, lmtOffsetMin } = useMemo(() => {
    const offsetMin = Math.round((lng - 135) * 4);
    let totalMin = hour * 60 + minute + offsetMin;
    let lmtDay = day, lmtMonth = month, lmtYear = year;
    if (totalMin < 0) {
      totalMin += 24 * 60;
      lmtDay -= 1;
      if (lmtDay < 1) {
        lmtMonth -= 1;
        if (lmtMonth < 1) { lmtMonth = 12; lmtYear -= 1; }
        lmtDay = new Date(lmtYear, lmtMonth, 0).getDate();
      }
    } else if (totalMin >= 24 * 60) {
      totalMin -= 24 * 60;
      lmtDay += 1;
      const dim = new Date(lmtYear, lmtMonth, 0).getDate();
      if (lmtDay > dim) { lmtDay = 1; lmtMonth += 1; }
      if (lmtMonth > 12) { lmtMonth = 1; lmtYear += 1; }
    }
    return {
      lmtYear, lmtMonth, lmtDay,
      lmtHour: Math.floor(totalMin / 60),
      lmtMinute: totalMin % 60,
      lmtOffsetMin: offsetMin,
    };
  }, [year, month, day, hour, minute, lng]);

  const { saju, western } = useMemo(() => ({
    saju:    calcSaju(lmtYear, lmtMonth, lmtDay, lmtHour, lmtMinute, gender, jajasi),
    western: calcWesternChart(utYear, utMonth, utDay, utHour, utMinute, lat, lng),
  }), [lmtYear, lmtMonth, lmtDay, lmtHour, lmtMinute, gender, jajasi, utYear, utMonth, utDay, utHour, utMinute, lat, lng]);

  useEffect(() => {
    track('fortune_completed', {
      city,
      gender,
      zodiac_animal: saju.zodiacAnimal,
      sun_sign: western.planets['sun']?.sign ?? '',
    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg,#0a0510 0%,#1a0a2e 50%,#0d0820 100%)' }}
    >
      {/* 헤더 */}
      <header
        className="flex items-center justify-between px-6 md:px-16 py-5"
        style={{ borderBottom: '1px solid rgba(212,168,83,0.1)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">☽</span>
          <span className="text-xl font-bold tracking-widest" style={{ color: '#d4a853' }}>천명술</span>
        </Link>
        <Link
          href="/fortune"
          className="text-xs px-4 py-2 rounded-xl transition-colors"
          style={{
            background: 'rgba(212,168,83,0.1)',
            border: '1px solid rgba(212,168,83,0.25)',
            color: 'rgba(232,213,183,0.7)',
          }}
        >
          {r.backButton[lang]}
        </Link>
      </header>

      {/* 결과 */}
      <main className="flex-1">
        <FortuneResult saju={saju} western={western} name={name} city={city} lmtOffsetMin={lmtOffsetMin} />
      </main>
    </div>
  );
}
