'use client';

import { useState, useMemo } from 'react';
import type { WesternChartResult } from '@/lib/astrology';
import { calcTodayWesternFortune } from '@/lib/astrology';
import { useLang } from '@/lib/lang';
import { t } from '@/lib/translations';
import type { Lang } from '@/lib/lang';

const PLANET_NAMES_EN: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune',
  northNode: 'North Node', southNode: 'South Node',
};

// 행성별 역할 키워드
const PLANET_ROLE: Record<string, { ko: string; en: string }> = {
  sun:       { ko: '나의 본질·정체성',    en: 'Core Identity' },
  moon:      { ko: '감정·내면 본능',      en: 'Emotions & Instincts' },
  mercury:   { ko: '소통·사고방식',       en: 'Communication & Mind' },
  venus:     { ko: '사랑·미감·가치관',    en: 'Love, Beauty & Values' },
  mars:      { ko: '욕망·행동력·에너지',  en: 'Drive, Action & Energy' },
  jupiter:   { ko: '성장·행운·확장',      en: 'Growth, Luck & Expansion' },
  saturn:    { ko: '책임·한계·인내',      en: 'Responsibility & Limits' },
  uranus:    { ko: '변화·혁신·독창성',    en: 'Change & Innovation' },
  neptune:   { ko: '꿈·직관·영성',        en: 'Dreams & Intuition' },
  northNode: { ko: '이번 생의 과제',      en: "This Life's Mission" },
  southNode: { ko: '타고난 재능·전생',    en: 'Innate Gifts & Past Life' },
};

// 별자리별 키워드 (사인 인덱스 0~11)
const SIGN_TRAIT_KO = [
  '개척·열정적', '안정·감각적', '지적·다재다능', '감성·보호적',
  '창의·카리스마', '분석·완벽주의', '균형·조화', '강렬·심층적',
  '자유·낙천적', '현실·책임감', '독창·인도주의', '감수성·공감력',
];
const SIGN_TRAIT_EN = [
  'Pioneer & Passionate', 'Stable & Sensual', 'Intellectual & Versatile', 'Nurturing & Sensitive',
  'Creative & Charismatic', 'Analytical & Precise', 'Balanced & Harmonious', 'Intense & Deep',
  'Free-spirited & Optimistic', 'Practical & Responsible', 'Original & Humanitarian', 'Empathic & Intuitive',
];

// 상(Aspect) 유형 — 에너지 특성
const ASPECT_TYPE: Record<string, { ko: string; en: string; color: string }> = {
  '합':   { ko: '에너지 결합', en: 'Blending',  color: '#d4a853' },
  '육분': { ko: '기회·협력',  en: 'Opportunity', color: '#86efac' },
  '방':   { ko: '긴장·성장',  en: 'Challenge',   color: '#fca5a5' },
  '삼분': { ko: '타고난 흐름', en: 'Natural Flow', color: '#93c5fd' },
  '충':   { ko: '균형 찾기',  en: 'Polarity',    color: '#fcd34d' },
  '반사분':{ ko: '조율 필요', en: 'Adjustment',  color: 'rgba(232,213,183,0.5)' },
};

// 하우스별 삶의 영역 키워드 (1~12)
const HOUSE_AREA_KO = ['', '자아·외모', '재물·가치관', '소통·형제', '가정·뿌리', '창의·연애', '건강·일상', '관계·결혼', '변화·심층', '철학·여행', '경력·사회', '우정·꿈', '내면·무의식'];
const HOUSE_AREA_EN = ['', 'Self & Appearance', 'Money & Values', 'Communication', 'Home & Roots', 'Creativity & Romance', 'Health & Daily Life', 'Relationships', 'Transformation', 'Philosophy & Travel', 'Career & Status', 'Friends & Dreams', 'Inner Self'];

// 핵심 배치용 Sun/Moon/ASC 한 줄 해석
const SUN_DESC_KO = [
  '도전을 즐기는 개척형 리더십이 본질입니다.',
  '안정과 감각적 즐거움을 추구하는 것이 본질입니다.',
  '호기심 넘치고 다재다능한 것이 본질입니다.',
  '감성이 깊고 타인을 보살피는 것이 본질입니다.',
  '따뜻하고 창의적인 자기표현이 본질입니다.',
  '분석적이고 완벽을 추구하는 것이 본질입니다.',
  '균형과 조화를 추구하는 것이 본질입니다.',
  '강렬하고 깊이 있는 탐구가 본질입니다.',
  '자유와 진리를 추구하는 것이 본질입니다.',
  '현실적이고 목표 지향적인 것이 본질입니다.',
  '독창적이고 인류애가 강한 것이 본질입니다.',
  '공감력이 뛰어나고 경계가 유연한 것이 본질입니다.',
];
const MOON_DESC_KO = [
  '감정이 즉각적이고 열정적으로 표현됩니다.',
  '안정감이 있을 때 감정적으로 안심합니다.',
  '다양한 감정을 언어로 잘 표현합니다.',
  '감정이 풍부하고 보호받고 싶은 욕구가 강합니다.',
  '인정받을 때 감정적으로 충만해집니다.',
  '감정을 분석하고 통제하려는 경향이 있습니다.',
  '감정적 균형과 아름다운 관계를 중시합니다.',
  '감정이 깊고 강렬하며 쉽게 드러내지 않습니다.',
  '감정적으로 자유롭고 모험을 즐깁니다.',
  '감정을 절제하고 책임감으로 표현합니다.',
  '감정을 이성적으로 처리하는 경향이 있습니다.',
  '감정이 섬세하고 주변의 분위기를 잘 흡수합니다.',
];
const ASC_DESC_KO = [
  '에너지 넘치고 직접적인 첫인상을 줍니다.',
  '안정적이고 믿음직한 인상을 줍니다.',
  '활발하고 유머러스한 인상을 줍니다.',
  '따뜻하고 감성적인 인상을 줍니다.',
  '자신감 있고 카리스마 있는 인상을 줍니다.',
  '꼼꼼하고 신뢰감 있는 인상을 줍니다.',
  '우아하고 균형 잡힌 매력적인 인상을 줍니다.',
  '강렬하고 신비로운 인상을 줍니다.',
  '밝고 자유분방한 인상을 줍니다.',
  '차분하고 성숙한 인상을 줍니다.',
  '독특하고 진보적인 인상을 줍니다.',
  '부드럽고 몽환적인 인상을 줍니다.',
];

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
  const today    = useMemo(() => calcTodayWesternFortune(western, 0), [western]);
  const tomorrow = useMemo(() => calcTodayWesternFortune(western, 1), [western]);
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-4">

      {/* 오늘의 운세 */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(212,168,83,0.3)', background: 'rgba(45,19,84,0.6)' }}>
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs tracking-widest mb-3" style={{ color: '#d4a853' }}>{w.todayTitle[lang]}</p>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.45)' }}>☀</span>
              <span className="text-sm font-bold" style={{ color: '#f0c97a' }}>{lang === 'ko' ? today.sunSign : today.sunSignEn}</span>
            </div>
            <span style={{ color: 'rgba(232,213,183,0.25)' }}>·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.45)' }}>☽</span>
              <span className="text-sm" style={{ color: 'rgba(232,213,183,0.7)' }}>{lang === 'ko' ? today.todayMoonSign : today.todayMoonSignEn}</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)', color: '#f0c97a' }}>
              {lang === 'ko' ? today.keyword : today.keywordEn}
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#e8d5b7' }}>{lang === 'ko' ? today.summary : today.summaryEn}</p>

          {/* 내일 운세 */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.12)' }}>
            <p className="text-xs mb-1.5" style={{ color: 'rgba(212,168,83,0.6)' }}>
              {lang === 'ko' ? '내일 미리보기' : 'Tomorrow Preview'}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.45)' }}>☽</span>
              <span className="text-sm font-medium" style={{ color: 'rgba(240,201,122,0.7)' }}>
                {lang === 'ko' ? tomorrow.todayMoonSign : tomorrow.todayMoonSignEn}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)', color: 'rgba(240,201,122,0.7)' }}>
                {lang === 'ko' ? tomorrow.keyword : tomorrow.keywordEn}
              </span>
              <span className="text-xs" style={{ color: 'rgba(232,213,183,0.45)' }}>
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
          {open ? w.collapseBtn[lang] : w.expandBtn[lang]}
        </button>
      </div>

      {/* 상세 내용 */}
      {open && <div className="space-y-6">

      {/* 나의 핵심 배치 요약 */}
      {(() => {
        const sunIdx   = western.planets['sun']?.signIndex ?? 0;
        const moonIdx  = western.planets['moon']?.signIndex ?? 0;
        const ascIdx   = western.ascendant?.signIndex ?? 0;
        const items = [
          { icon: '☀', labelKo: '태양', labelEn: 'Sun',
            signKo: western.planets['sun']?.sign ?? '', signEn: western.planets['sun']?.signEn ?? '',
            descKo: SUN_DESC_KO[sunIdx], descEn: SIGN_TRAIT_EN[sunIdx] + ' — your core essence.' },
          { icon: '☽', labelKo: '달', labelEn: 'Moon',
            signKo: western.planets['moon']?.sign ?? '', signEn: western.planets['moon']?.signEn ?? '',
            descKo: MOON_DESC_KO[moonIdx], descEn: SIGN_TRAIT_EN[moonIdx] + ' — your emotional nature.' },
          { icon: '⬆', labelKo: '어센던트', labelEn: 'Ascendant',
            signKo: western.ascendant?.sign ?? '', signEn: western.ascendant?.signEn ?? '',
            descKo: ASC_DESC_KO[ascIdx], descEn: SIGN_TRAIT_EN[ascIdx] + ' — first impression you give.' },
        ];
        return (
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <p className="text-xs tracking-widest mb-2" style={{ color: '#d4a853' }}>
              {lang === 'ko' ? '✦ 나의 핵심 배치 — 이것이 당신입니다' : '✦ Your Core Placements — Who You Are'}
            </p>
            {items.map(item => (
              <div key={item.icon} className="flex items-start gap-3">
                <span className="text-base w-5 text-center shrink-0 mt-0.5" style={{ color: '#d4a853' }}>{item.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-bold" style={{ color: '#f0c97a' }}>
                      {lang === 'ko' ? `${item.signKo} ${item.labelKo}` : `${item.labelEn} in ${item.signEn}`}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(232,213,183,0.65)' }}>
                    {lang === 'ko' ? item.descKo : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ASC / MC / 달 위상 하이라이트 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: w.ascendant[lang], val: `${lang === 'ko' ? western.ascendant.sign : western.ascendant.signEn} ${western.ascendant.degree}°`, sub: w.ascSub[lang], icon: '⬆' },
          { label: w.mc[lang],        val: `${lang === 'ko' ? western.mc.sign : western.mc.signEn} ${western.mc.degree}°`,               sub: w.mcSub[lang],  icon: '✦' },
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
        <p className="text-xs tracking-widest mb-1" style={{ color: '#d4a853' }}>{w.planetsTitle[lang]}</p>
        <p className="text-xs mb-3" style={{ color: 'rgba(232,213,183,0.4)' }}>
          {lang === 'ko'
            ? '각 행성이 어떤 별자리에 있는지, 그 에너지가 어떻게 발현되는지 보여줍니다.'
            : 'Shows what sign each planet occupies and how its energy expresses itself.'}
        </p>
        <div className="glass-card rounded-2xl overflow-hidden">
          {PLANET_ORDER.map((key, i) => {
            const p = western.planets[key];
            if (!p) return null;
            const role = PLANET_ROLE[key];
            const signTrait = lang === 'ko'
              ? SIGN_TRAIT_KO[p.signIndex ?? 0]
              : SIGN_TRAIT_EN[p.signIndex ?? 0];
            return (
              <div
                key={key}
                className="px-4 py-2.5"
                style={{ borderBottom: i < PLANET_ORDER.length - 1 ? '1px solid rgba(212,168,83,0.08)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center shrink-0" style={{ color: '#d4a853' }}>{p.symbol}</span>
                  <span className="text-sm w-16 font-medium shrink-0" style={{ color: '#e8d5b7' }}>
                    {lang === 'ko' ? p.nameKr : (PLANET_NAMES_EN[p.name] ?? p.name)}
                  </span>
                  <span className="text-sm flex-1" style={{ color: 'rgba(232,213,183,0.7)' }}>
                    {p.signSymbol} {lang === 'ko' ? p.sign : p.signEn}
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'rgba(232,213,183,0.45)' }}>
                    {p.degree}°{p.minute.toString().padStart(2, '0')}′
                  </span>
                  {p.retrograde && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                      {w.retrograde[lang]}
                    </span>
                  )}
                </div>
                {role && (
                  <div className="flex items-center gap-2 mt-1 ml-9">
                    <span className="text-xs" style={{ color: 'rgba(212,168,83,0.55)' }}>{lang === 'ko' ? role.ko : role.en}</span>
                    <span style={{ color: 'rgba(232,213,183,0.2)' }}>·</span>
                    <span className="text-xs" style={{ color: 'rgba(232,213,183,0.35)' }}>{signTrait}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 상(Aspect) */}
      {western.aspects.length > 0 && (
        <div>
          <p className="text-xs tracking-widest mb-1" style={{ color: '#d4a853' }}>{w.aspectsTitle[lang]}</p>
          <p className="text-xs mb-3" style={{ color: 'rgba(232,213,183,0.4)' }}>
            {lang === 'ko'
              ? '두 행성이 만드는 각도 관계입니다. 에너지가 조화롭게 흐르는지, 긴장·갈등 구조인지를 보여줍니다.'
              : 'Angular relationships between planets — showing whether energies flow harmoniously or create tension.'}
          </p>
          <div className="glass-card rounded-2xl overflow-hidden">
            {western.aspects.slice(0, 10).map((asp, i) => {
              const typeKo = asp.aspectName;
              const typeInfo = ASPECT_TYPE[typeKo];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderBottom: i < Math.min(western.aspects.length, 10) - 1 ? '1px solid rgba(212,168,83,0.08)' : 'none' }}
                >
                  <span className="text-base w-5 text-center shrink-0" style={{ color: typeInfo?.color ?? '#d4a853' }}>{asp.symbol}</span>
                  <span className="text-sm flex-1" style={{ color: '#e8d5b7' }}>
                    {lang === 'ko'
                      ? `${asp.planet1Kr} ${asp.aspectName} ${asp.planet2Kr}`
                      : `${PLANET_NAMES_EN[asp.planet1] ?? asp.planet1} ${asp.aspectNameEn} ${PLANET_NAMES_EN[asp.planet2] ?? asp.planet2}`
                    }
                  </span>
                  {typeInfo && (
                    <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ color: typeInfo.color, background: typeInfo.color + '18' }}>
                      {lang === 'ko' ? typeInfo.ko : typeInfo.en}
                    </span>
                  )}
                  <span className="text-xs shrink-0" style={{ color: 'rgba(232,213,183,0.35)' }}>
                    orb {asp.orb}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 하우스 */}
      <div>
        <p className="text-xs tracking-widest mb-1" style={{ color: '#d4a853' }}>{w.housesTitle[lang]}</p>
        <p className="text-xs mb-3" style={{ color: 'rgba(232,213,183,0.4)' }}>
          {lang === 'ko'
            ? '삶의 12개 영역을 나타냅니다. 각 영역에 어떤 별자리 에너지가 깔려 있는지 보여줍니다.'
            : 'Represents 12 areas of life — showing which sign energy underlies each area.'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {western.houses.map(h => {
            const area = lang === 'ko' ? HOUSE_AREA_KO[h.house] : HOUSE_AREA_EN[h.house];
            return (
              <div key={h.house} className="glass-card rounded-xl px-3 py-2 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs w-4 font-bold shrink-0" style={{ color: 'rgba(212,168,83,0.6)' }}>{h.house}</span>
                  <span className="text-xs font-medium" style={{ color: '#e8d5b7' }}>{lang === 'ko' ? h.sign : h.signEn}</span>
                </div>
                {area && (
                  <div className="flex items-center gap-1 ml-5">
                    <span className="text-xs" style={{ color: 'rgba(232,213,183,0.4)' }}>{area}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>}
    </div>
  );
}
