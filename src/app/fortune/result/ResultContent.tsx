'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { calcSaju, calcWesternChart } from '@/lib/astrology';
import FortuneResult from '@/components/FortuneResult';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';
// NEW: import the synthesis function
import { synthesize } from '@/lib/synthesis/synthesis';

export default function ResultContent() {
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const r = t.result;

  const name   = searchParams.get('name')   ?? (lang === 'ko' ? '익명' : 'Anonymous');
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

  // NEW: run the synthesis using the same birth data already in this component.
  // lang comes from useLang() above — no extra wiring needed.
  // hour/minute are already 12/0 when the user chose "unknown time" (handled by the form page).
  // This re-runs only when birth data or language changes.
  const synthesis = useMemo(() => synthesize({
    year, month, day, hour, minute,
    timezone: 'Asia/Seoul',  // the app always works in KST
    language: lang,          // ← the only new piece — comes from useLang()
  }), [year, month, day, hour, minute, lang]);

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
          <span className="text-xl font-bold tracking-widest" style={{ color: '#d4a853' }}>{lang === 'ko' ? '천명술' : 'Cheonmyeongsul'}</span>
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

        {/*
          ─── SYNTHESIS READING SECTION ─────────────────────────────────
          What: Shows the 5-field integrated reading from the synthesis module.
          Why here: `synthesis` is already computed above with useMemo(), so
                    we can just read synthesis.interpretation directly — no extra
                    props or state needed.
          Layout: Same max-w-lg / px-4 as FortuneResult so columns line up.
          Styling: Matches the project's inline-style pattern (gold + dark).
          ────────────────────────────────────────────────────────────────
        */}
        <div className="max-w-lg mx-auto w-full px-4 pb-16">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.15)' }}
          >
            {/* Section title — gold, small, matches other tab headings */}
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#d4a853' }}>
              {lang === 'ko' ? '✦ 통합 운세' : '✦ Synthesis Reading'}
            </h3>

            {/*
              FIELD 1: summary
              One sentence capturing today's overall energy.
              Displayed larger so it reads as the "headline" of the section.
            */}
            <p className="text-sm font-medium mb-5 leading-relaxed" style={{ color: '#e8d5b7' }}>
              {synthesis.interpretation.summary}
            </p>

            {/*
              FIELDS 2–5: corePersonality, workStyle, relationshipStyle, practicalAdvice
              Each rendered as a labelled paragraph.
              The array + .map() keeps the JSX concise — adding a new field
              in the future is just one more object in the array.
            */}
            {(
              [
                {
                  label: lang === 'ko' ? '핵심 성격' : 'Core Personality',
                  text: synthesis.interpretation.corePersonality,
                },
                {
                  label: lang === 'ko' ? '업무 스타일' : 'Work Style',
                  text: synthesis.interpretation.workStyle,
                },
                {
                  label: lang === 'ko' ? '관계 스타일' : 'Relationship Style',
                  text: synthesis.interpretation.relationshipStyle,
                },
                {
                  label: lang === 'ko' ? '오늘의 조언' : 'Practical Advice',
                  text: synthesis.interpretation.practicalAdvice,
                },
              ] as { label: string; text: string }[]
            ).map(({ label, text }) => (
              /*
                key={label} is safe here because the labels are unique
                and the array never reorders at runtime.
              */
              <div key={label} className="mb-4 last:mb-0">
                {/* Muted gold label above each paragraph */}
                <p className="text-xs mb-1" style={{ color: 'rgba(212,168,83,0.65)' }}>
                  {label}
                </p>
                {/* Body text — slightly muted cream so it doesn't compete with the label */}
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,213,183,0.8)' }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
