import type { Lang } from './lang';

const t = {
  // ── Navbar ──────────────────────────────────────────────────
  nav: {
    todayFortune: { ko: '오늘의 운세', en: "Today's Fortune" },
    sajuAnalysis:  { ko: '사주 분석',   en: 'BaZi Analysis' },
    astrology:     { ko: '점성학',      en: 'Astrology' },
    compatibility: { ko: '궁합',        en: 'Compatibility' },
    startFree:     { ko: '무료 시작',   en: 'Start Free' },
  },

  // ── Hero ────────────────────────────────────────────────────
  hero: {
    badge:    { ko: '동서양 운세의 새로운 기준', en: 'Eastern & Western Fortune, United' },
    subtitle: { ko: '天命術',                   en: 'Cheonmyeongsul' },
    desc1:    { ko: '사주팔자의 오행과 별자리의 행성 기운이 만나는 곳.', en: 'Where the Five Elements of BaZi meet the planetary forces of astrology.' },
    desc2:    { ko: '당신의 타고난 운명을 동양과 서양의 지혜로 풀어드립니다.', en: 'Unveiling your destiny through the wisdom of East and West.' },
    tag1:     { ko: '사주 · 오행',   en: 'BaZi · Five Elements' },
    tag2:     { ko: '별자리 · 행성', en: 'Stars · Planets' },
    tag3:     { ko: '통합 운세',    en: 'Unified Reading' },
    cta1:     { ko: '✨ 오늘의 운세 보기', en: "✨ See Today's Fortune" },
    cta2:     { ko: '🌙 사주 분석 시작',  en: '🌙 Start BaZi Analysis' },
    scroll:   { ko: '스크롤하여 더 알아보기', en: 'Scroll to learn more' },
  },

  // ── Feature ─────────────────────────────────────────────────
  feature: {
    sectionBadge: { ko: '✦ 세 가지 핵심 ✦', en: '✦ Three Pillars ✦' },
    sectionTitle: { ko: '왜 천명술인가요?',  en: 'Why Cheonmyeongsul?' },
    items: [
      {
        title: { ko: '사주팔자 분석',   en: 'BaZi Analysis' },
        desc:  { ko: '생년월일시의 여덟 글자에 담긴 오행의 균형과 기운을 정밀하게 분석합니다.', en: 'Precisely analyzes the balance and energy of the Five Elements encoded in your birth date and time.' },
      },
      {
        title: { ko: '서양 점성학',    en: 'Western Astrology' },
        desc:  { ko: '태양궁, 달궁, 어센던트를 포함한 10개 행성의 위치와 상호 작용을 읽습니다.', en: 'Reads the positions and interactions of 10 planets including your Sun, Moon, and Ascendant signs.' },
      },
      {
        title: { ko: '통합 운세 해석', en: 'Unified Reading' },
        desc:  { ko: '동서양 두 체계가 공명하는 지점에서 더 깊고 입체적인 운명의 윤곽을 그립니다.', en: 'Draws a deeper, multi-dimensional portrait of your destiny where both systems resonate.' },
      },
    ],
  },

  // ── Service ─────────────────────────────────────────────────
  service: {
    sectionBadge: { ko: '✦ 서비스 ✦',        en: '✦ Services ✦' },
    sectionTitle: { ko: '운명을 탐색하는 방법들', en: 'Ways to Explore Your Destiny' },
    badge: {
      free:    { ko: '무료',    en: 'Free' },
      basic:   { ko: '기본',    en: 'Basic' },
      premium: { ko: '프리미엄', en: 'Premium' },
    },
    items: [
      {
        title: { ko: '오늘의 운세',    en: "Today's Fortune" },
        desc:  { ko: '사주와 별자리가 오늘 하루를 어떻게 읽는지 확인하세요.', en: 'See how your BaZi and stars read your day.' },
        badge: 'free' as const,
      },
      {
        title: { ko: '사주 원국 분석', en: 'Birth Chart Analysis' },
        desc:  { ko: '당신의 타고난 기질과 인생 전반의 흐름을 상세히 풀어드립니다.', en: 'Detailed reading of your innate temperament and life path.' },
        badge: 'basic' as const,
      },
      {
        title: { ko: '연간 대운 · 트랜짓', en: 'Annual Luck & Transits' },
        desc:  { ko: '올해의 행운, 주의할 시기, 기회의 타이밍을 미리 파악하세요.', en: "Know your lucky periods, cautious times, and opportunity windows for the year." },
        badge: 'premium' as const,
      },
      {
        title: { ko: '궁합 분석', en: 'Compatibility' },
        desc:  { ko: '사주 오행 궁합과 시너지 행성 배치로 두 사람의 관계를 진단합니다.', en: 'Diagnose a relationship through elemental compatibility and synergy planet placements.' },
        badge: 'premium' as const,
      },
    ],
  },

  // ── CTA ─────────────────────────────────────────────────────
  cta: {
    badge:    { ko: '✦ 지금 바로 ✦',          en: '✦ Start Now ✦' },
    title:    { ko: '당신의 운명을 읽어드릴게요', en: "Let's Read Your Destiny" },
    desc1:    { ko: '생년월일시만 입력하면 됩니다.', en: 'Just enter your birth date and time.' },
    desc2:    { ko: '사주와 별자리가 함께 말하는 당신만의 이야기.', en: 'Your unique story told by BaZi and the stars together.' },
    button:   { ko: '✨ 무료로 운세 보기',       en: '✨ Get Free Reading' },
    footnote: { ko: '회원가입 없이도 오늘의 운세를 즐기실 수 있습니다', en: 'No sign-up required to enjoy your fortune reading' },
  },

  // ── Fortune Form ────────────────────────────────────────────
  form: {
    badge:          { ko: '✦ 천명 분석 ✦',          en: '✦ Destiny Analysis ✦' },
    title:          { ko: '당신의 이야기를 들려주세요', en: 'Tell Us About Yourself' },
    subtitle:       { ko: '사주팔자 + 서양 점성학으로 분석합니다', en: 'Analyzed with BaZi + Western Astrology' },
    name:           { ko: '이름 (선택)',  en: 'Name (optional)' },
    namePlaceholder:{ ko: '홍길동',      en: 'Jane Doe' },
    birthDate:      { ko: '생년월일',    en: 'Date of Birth' },
    birthTime:      { ko: '출생 시간',   en: 'Birth Time' },
    unknownTime:    { ko: '시간 모름',   en: 'Unknown' },
    unknownNote:    { ko: '시간 미상 시 정오(12:00) 기준으로 계산됩니다. 시주(時柱)는 참고용으로만 보세요.', en: 'Unknown birth time defaults to noon (12:00). The Hour Pillar is for reference only.' },
    ziHourLabel:    { ko: '자시(子時) 학파 선택', en: 'Zi Hour (子時) School' },
    ziHourNote: {
      야자시: { ko: '야자시: 23시생은 당일 일주 유지', en: 'Late Zi: Born at 23:00 keeps the same-day Day Pillar' },
      조자시: { ko: '조자시: 23시 이후는 다음날 일주 적용', en: 'Early Zi: After 23:00 uses the next-day Day Pillar' },
    },
    gender:         { ko: '성별 (대운 계산 기준)', en: 'Gender (for luck cycle)' },
    male:           { ko: '남성', en: 'Male' },
    female:         { ko: '여성', en: 'Female' },
    city:           { ko: '출생 도시',       en: 'City of Birth' },
    cityNote:       { ko: '서양 점성학 계산에 사용', en: 'Used for Western astrology calculation' },
    cityPlaceholder:{ ko: '도시명 입력 (예: 서울, 부산)', en: 'Enter city (e.g. Seoul, Tokyo)' },
    cityNoResult:   { ko: '검색 결과 없음', en: 'No results' },
    submit:         { ko: '✨ 운명 분석 시작하기', en: '✨ Start Destiny Analysis' },
    privacy:        { ko: '모든 계산은 브라우저에서 직접 처리됩니다', en: 'All calculations are processed directly in your browser' },
    yearSuffix:     { ko: '년', en: '' },
    monthSuffix:    { ko: '월', en: '' },
    hourSuffix:     { ko: '시', en: ':00' },
    am:             { ko: '오전', en: 'AM' },
    pm:             { ko: '오후', en: 'PM' },
  },

  // ── Result Header ───────────────────────────────────────────
  result: {
    headerBadge:   { ko: '님의 운명 분석', en: "'s Destiny Reading" },
    lmtApplied:    { ko: '경도 시차 보정', en: 'Longitude offset' },
    lmtMin:        { ko: '분 적용',        en: 'min applied' },
    sunSign:       { ko: '☀', en: '☀' },
    tabUnified:    { ko: '오늘의 운세', en: "Today's Fortune" },
    tabSaju:       { ko: '사주팔자',   en: 'BaZi' },
    tabWestern:    { ko: '서양 점성학', en: 'Astrology' },
    backButton:    { ko: '← 다시 분석하기', en: '← Analyze Again' },
  },

  // ── Unified Tab ─────────────────────────────────────────────
  unified: {
    sectionTitle: { ko: '✦ 오늘의 종합 운세 ✦', en: "✦ Today's Combined Reading ✦" },
    sajuLabel:    { ko: '☯ 사주',  en: '☯ BaZi' },
    westernLabel: { ko: '✦ 별자리', en: '✦ Astrology' },
    dayUnit:      { ko: '일',      en: '' },
    summaryNote:  { ko: '를 종합한 결과입니다.', en: 'combined reading.' },
    todayDay:     { ko: '오늘 일진', en: "Today's Day Pillar" },
    moonPos:      { ko: '달의 자리', en: "Moon's Position" },
  },

  // ── Saju Tab ────────────────────────────────────────────────
  saju: {
    todayTitle:   { ko: '✦ 오늘의 운세',          en: "✦ Today's Reading" },
    dayUnit:      { ko: '일',                      en: '' },
    expandBtn:    { ko: '자세한 사주 분석 ▼',     en: 'Detailed BaZi Analysis ▼' },
    collapseBtn:  { ko: '접기 ▲',                 en: 'Collapse ▲' },
    dayMasterNote:{ ko: '일간 (日干) · 나의 기본 기운', en: 'Day Master (日干) · Core Energy' },
    zodiac:       { ko: '띠',  en: ' zodiac' },
    dominant:     { ko: '강한 오행', en: 'Strong element' },
    lacking:      { ko: '약한 오행', en: 'Weak element' },
    pillarsTitle: { ko: '✦ 사주팔자 (四柱八字)', en: '✦ Four Pillars (四柱八字)' },
    pillarsLegend:{ ko: '위→아래: 천간십신 · 천간 · 지지 · 지장간 · 지지십신 · 십이운성', en: 'Top→Bottom: 10-God · Stem · Branch · Hidden Stems · Branch 10-God · 12 Stages' },
    elementsTitle:{ ko: '✦ 오행 분포 (8자 기준)', en: '✦ Five Elements Distribution (8 chars)' },
    daeunTitle:   { ko: '✦ 대운 (大運) 10년 주기', en: '✦ Major Luck Cycles (10-year periods)' },
    ageUnit:      { ko: '세', en: 'y/o' },
    pillarLabels: {
      hour:  { ko: '시주\n時柱', en: 'Hour\n時柱' },
      day:   { ko: '일주\n日柱', en: 'Day\n日柱' },
      month: { ko: '월주\n月柱', en: 'Month\n月柱' },
      year:  { ko: '연주\n年柱', en: 'Year\n年柱' },
    },
  },

  // ── Western Tab ─────────────────────────────────────────────
  western: {
    todayTitle:    { ko: '✦ 오늘의 운세',     en: "✦ Today's Reading" },
    expandBtn:     { ko: '자세한 점성학 분석 ▼', en: 'Detailed Astrology Analysis ▼' },
    collapseBtn:   { ko: '접기 ▲',            en: 'Collapse ▲' },
    ascendant:     { ko: '어센던트',           en: 'Ascendant' },
    ascSub:        { ko: '나의 외면·첫인상',   en: 'Outer self · First impression' },
    mc:            { ko: '중천 MC',            en: 'Midheaven MC' },
    mcSub:         { ko: '사회적 목표·경력',   en: 'Social goals · Career' },
    moonPhase:     { ko: '달의 위상',          en: 'Moon Phase' },
    planetsTitle:  { ko: '✦ 행성 위치',        en: '✦ Planet Positions' },
    aspectsTitle:  { ko: '✦ 주요 상 (Aspects)', en: '✦ Major Aspects' },
    housesTitle:   { ko: '✦ 하우스 (Placidus)', en: '✦ Houses (Placidus)' },
    retrograde:    { ko: '역행', en: 'Rx' },
    moonPhaseNames: {
      new:           { ko: '삭 (新月)',    en: 'New Moon' },
      waxingCrescent:{ ko: '초승달',      en: 'Waxing Crescent' },
      firstQuarter:  { ko: '상현 (半月)', en: 'First Quarter' },
      waxingGibbous: { ko: '차오르는 달', en: 'Waxing Gibbous' },
      full:          { ko: '망 (滿月)',    en: 'Full Moon' },
      waningGibbous: { ko: '기우는 달',   en: 'Waning Gibbous' },
      lastQuarter:   { ko: '하현 (半月)', en: 'Last Quarter' },
      waningCrescent:{ ko: '그믐달',      en: 'Waning Crescent' },
    },
  },

  // ── Language Modal ──────────────────────────────────────────
  langModal: {
    title:    { ko: '언어를 선택하세요',  en: 'Choose Your Language' },
    subtitle: { ko: '언제든지 변경할 수 있습니다', en: 'You can change this anytime' },
  },
} as const;

export function tr<
  K1 extends keyof typeof t,
  K2 extends keyof typeof t[K1],
>(section: K1, key: K2, lang: Lang): string {
  const entry = t[section][key] as { ko: string; en: string };
  return entry[lang];
}

export { t };
