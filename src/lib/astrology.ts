/**
 * lib/astrology.ts
 *
 * 통합 운세 계산 라이브러리 (외부 의존성 없음)
 * ─────────────────────────────────────────────
 * SECTION 1 : 서양 점성학 (Western Astrology)
 *   - 행성 황경 (Jean Meeus 궤도요소법, ±1° 이내)
 *   - 달 황경 (Meeus Ch.47 축약급수, ±0.3°)
 *   - 태양 황경 (지구 궤도 역산)
 *   - 북교점/남교점 (평균교점)
 *   - 어센던트 / MC (천구좌표 → 황도좌표)
 *   - Placidus 하우스 (반호법 반복수렴)
 *   - 역행 여부 감지
 *   - 상 (Conjunction · Sextile · Square · Trine · Opposition · Quincunx)
 *
 * SECTION 2 : 사주팔자 (Four Pillars of Destiny)
 *   - 연월일시주 (절기/오호둔법/오자둔법)
 *   - 십신 (일간 기준 오행 생극 관계)
 *   - 지장간 (정기 중심)
 *   - 오행 분석 (강약·희기)
 *   - 대운 (절기 JD 탐색으로 대운 시작 나이 계산)
 *
 * 입력 시간: 서양 점성학 = UT, 사주 = 한국 현지시(KST=UTC+9)
 * 참고: Jean Meeus "Astronomical Algorithms" 2nd ed.
 */

// ═══════════════════════════════════════════════════════════════
// 공통 수학 유틸리티
// ═══════════════════════════════════════════════════════════════

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const toRad  = (d: number) => d * DEG;
const toDeg  = (r: number) => r * RAD;
const mod360 = (d: number) => ((d % 360) + 360) % 360;
const modPI2 = (r: number) => ((r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
const modN   = (n: number, m: number) => ((n % m) + m) % m;

// ═══════════════════════════════════════════════════════════════
// SECTION 1 : 서양 점성학 (Western Astrology)
// ═══════════════════════════════════════════════════════════════

// ─── 1-1. 율리우스 일수 ────────────────────────────────────────

/**
 * 그레고리력 → 율리우스 일수 (Julian Day Number)
 * @param hour UT 기준 시
 */
export function julianDay(
  year: number, month: number, day: number,
  hour = 0, minute = 0,
): number {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716))
       + Math.floor(30.6001 * (m + 1))
       + day + (hour + minute / 60) / 24 + B - 1524.5;
}

// ─── 1-2. 황도 경사각 ──────────────────────────────────────────

function obliquity(T: number): number {
  // IAU 1980, T = 율리우스 세기 (J2000.0 기준)
  return 23.4392911 - 0.013004167 * T - 1.639e-7 * T * T + 5.036e-7 * T * T * T;
}

// ─── 1-3. 그리니치 항성시 (GST) ───────────────────────────────

function greenwichSiderealTime(JD: number): number {
  const T = (JD - 2451545.0) / 36525;
  return mod360(
    280.46061837
    + 360.98564736629 * (JD - 2451545.0)
    + 0.000387933 * T * T
    - T * T * T / 38710000,
  );
}

// ─── 1-4. 케플러 방정식 풀기 ──────────────────────────────────

function solveKepler(M: number, e: number): number {
  // M(평균근점이각) → E(이심근점이각), 단위 rad
  let E = M;
  for (let i = 0; i < 50; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

// ─── 1-5. 궤도요소 + 행성 지심 황경 ──────────────────────────
// Jean Meeus Table 31.a (J2000.0 기준, 줄리우스 세기당 변화율 포함)
// [a, e, I, L, ω̃, Ω, da, de, dI, dL, dω̃, dΩ]

const ORBITAL_ELEMENTS: Record<string, readonly number[]> = {
  mercury: [0.38709927, 0.20563593,  7.00497902, 252.25032350,  77.45779628,  48.33076593,
             3.7e-7,   1.906e-5, -5.9475e-3, 149472.67411175,  0.16047689, -0.12534081],
  venus:   [0.72333566, 0.00677672,  3.39467605, 181.97909950, 131.60246718,  76.67984255,
             3.9e-6,  -4.107e-5, -7.889e-4,  58517.81538729,  0.00268329, -0.27769418],
  earth:   [1.00000018, 0.01673163, -5.4346e-4, 100.46457166, 102.93768193,  -5.11260389,
            -3e-8,    -3.661e-5, -1.33718e-2, 35999.37244981,  0.32327364, -0.24123353],
  mars:    [1.52371034, 0.09339410,  1.84969142,  -4.55343205, -23.94362959,  49.55953891,
             1.847e-5,  7.882e-5, -8.1313e-3, 19140.30268499,  0.44441088, -0.29257343],
  jupiter: [5.20288700, 0.04838624,  1.30439695,  34.39644051,  14.72847983, 100.47390909,
            -1.1607e-4,-1.3253e-4,-1.83714e-3,  3034.74612775,  0.21252668,  0.20469106],
  saturn:  [9.53667594, 0.05386179,  2.48599187,  49.95424423,  92.59887831, 113.66242448,
            -1.2506e-3,-5.0991e-4, 1.93609e-3,  1222.49362201, -0.41897216, -0.28867794],
  uranus:  [19.18916464,0.04725744,  0.77263783, 313.23810451, 170.95427630,  74.01692503,
            -1.96176e-3,-4.397e-5,-2.42939e-3,   428.48202785,  0.40805281,  0.04240589],
  neptune: [30.06992276,0.00859048,  1.77004347, -55.12002969,  44.96476227, 131.78422574,
             2.6291e-4, 5.105e-5, 3.5372e-4,    218.45945325, -0.32241464, -0.00508664],
};

function heliocentricXYZ(name: string, T: number): [number, number, number] {
  const el = ORBITAL_ELEMENTS[name];
  const a     = el[0] + el[6]  * T;
  const e     = el[1] + el[7]  * T;
  const I     = toRad(el[2] + el[8]  * T);
  const L     = toRad(mod360(el[3] + el[9]  * T));
  const wbar  = toRad(mod360(el[4] + el[10] * T));
  const Omega = toRad(mod360(el[5] + el[11] * T));
  const M     = modPI2(L - wbar);
  const w     = modPI2(wbar - Omega);
  const E     = solveKepler(M, e);
  const nu    = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2),
  );
  const r = a * (1 - e * Math.cos(E));
  const u = nu + w;
  return [
    r * (Math.cos(Omega) * Math.cos(u) - Math.sin(Omega) * Math.sin(u) * Math.cos(I)),
    r * (Math.sin(Omega) * Math.cos(u) + Math.cos(Omega) * Math.sin(u) * Math.cos(I)),
    r * Math.sin(u) * Math.sin(I),
  ];
}

/** 행성의 지심 황경 (도) */
function geocentricLongitude(planet: string, T: number): number {
  const [px, py] = heliocentricXYZ(planet, T);
  const [ex, ey] = heliocentricXYZ('earth', T);
  return mod360(toDeg(Math.atan2(py - ey, px - ex)));
}

/** 태양의 지심 황경 (도) — 지구의 반대 방향 */
function sunLongitude(T: number): number {
  const [ex, ey] = heliocentricXYZ('earth', T);
  // 광행차 보정 (-0.00569 - 0.00478·sin(Ω)) 포함
  const Omega = mod360(125.04 - 1934.136 * T);
  const raw = mod360(toDeg(Math.atan2(-ey, -ex)));
  return mod360(raw - 0.00569 - 0.00478 * Math.sin(toRad(Omega)));
}

// ─── 1-6. 달 황경 (Meeus Ch.47 축약급수, ±0.3°) ───────────────

function moonLongitude(T: number): number {
  const L0  = mod360(218.3164477 + 481267.88123421 * T);
  const D   = toRad(mod360(297.8501921 + 445267.1114034 * T));
  const M   = toRad(mod360(357.5291092 + 35999.0502909  * T));
  const Mp  = toRad(mod360(134.9633964 + 477198.8675055 * T));
  const F   = toRad(mod360(93.2720950  + 483202.0175233 * T));
  return mod360(L0
    + 6.288774 * Math.sin(Mp)
    + 1.274027 * Math.sin(2*D - Mp)
    + 0.658314 * Math.sin(2*D)
    + 0.213618 * Math.sin(2*Mp)
    - 0.185116 * Math.sin(M)
    - 0.114332 * Math.sin(2*F)
    + 0.058793 * Math.sin(2*D - 2*Mp)
    + 0.057066 * Math.sin(2*D - M  - Mp)
    + 0.053322 * Math.sin(2*D + Mp)
    + 0.045758 * Math.sin(2*D - M)
    - 0.040923 * Math.sin(M  - Mp)
    - 0.034720 * Math.sin(D)
    - 0.030383 * Math.sin(M  + Mp)
    + 0.015327 * Math.sin(2*D - 2*F)
    + 0.010980 * Math.sin(Mp - 2*F)
    + 0.010675 * Math.sin(4*D - Mp)
    + 0.010034 * Math.sin(3*Mp)
    + 0.008548 * Math.sin(4*D - 2*Mp)
    - 0.007888 * Math.sin(2*D + M  - Mp)
    - 0.006766 * Math.sin(2*D + M)
    - 0.005163 * Math.sin(D   - Mp)
    + 0.004987 * Math.sin(D   + M)
    + 0.004036 * Math.sin(2*D - M  + Mp)
    + 0.003994 * Math.sin(2*D + 2*Mp)
    + 0.003861 * Math.sin(4*D)
    + 0.003665 * Math.sin(2*D - 3*Mp),
  );
}

// ─── 1-7. 달의 북교점 (평균, Meeus Ch.47) ─────────────────────

function northNode(T: number): number {
  return mod360(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
}

// ─── 1-8. 역행 감지 ──────────────────────────────────────────

function isRetrograde(planet: string, T: number): boolean {
  const dt = 1 / 36525; // ≈ 1일
  const before = planet === 'moon' ? moonLongitude(T - dt)
               : planet === 'sun'  ? sunLongitude(T - dt)
               : geocentricLongitude(planet, T - dt);
  const after  = planet === 'moon' ? moonLongitude(T + dt)
               : planet === 'sun'  ? sunLongitude(T + dt)
               : geocentricLongitude(planet, T + dt);
  const motion = mod360(after - before + 360);
  return motion > 180; // 역행이면 황경이 감소 → 차이가 180° 초과
}

// ─── 1-9. 황도 12궁 ──────────────────────────────────────────

export const ZODIAC_SIGNS_KR = [
  '양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리',
  '천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리',
] as const;
export const ZODIAC_SIGNS_EN = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const;
export const ZODIAC_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'] as const;
export const PLANET_SYMBOLS: Record<string, string> = {
  sun:'☉', moon:'☽', mercury:'☿', venus:'♀', mars:'♂',
  jupiter:'♃', saturn:'♄', uranus:'♅', neptune:'♆',
  northNode:'☊', southNode:'☋',
};
export const PLANET_NAMES_KR: Record<string, string> = {
  sun:'태양', moon:'달', mercury:'수성', venus:'금성', mars:'화성',
  jupiter:'목성', saturn:'토성', uranus:'천왕성', neptune:'해왕성',
  northNode:'북교점(라후)', southNode:'남교점(케투)',
  ascendant:'어센던트', mc:'중천(MC)',
};

function zodiacInfo(lon: number) {
  const n = mod360(lon);
  const idx = Math.floor(n / 30);
  const inSign = n - idx * 30;
  return {
    signIndex: idx,
    sign: ZODIAC_SIGNS_KR[idx],
    signEn: ZODIAC_SIGNS_EN[idx],
    symbol: ZODIAC_SYMBOLS[idx],
    degree: Math.floor(inSign),
    minute: Math.floor((inSign % 1) * 60),
  };
}

// ─── 1-10. 어센던트 · MC ─────────────────────────────────────

/** RA(적경°) → 황경° 변환 (황도 위의 점, 황위=0 가정) */
function raToEclLon(ra: number, eps: number): number {
  const raR = toRad(ra), epsR = toRad(eps);
  return mod360(toDeg(Math.atan2(Math.sin(raR) / Math.cos(epsR), Math.cos(raR))));
}

function calcMC(ramc: number, eps: number): number {
  const lon = raToEclLon(ramc, eps);
  // MC는 RAMC와 같은 반구여야 함
  const diff = mod360(lon - ramc);
  return diff > 90 && diff < 270 ? mod360(lon + 180) : lon;
}

function calcAscendant(ramc: number, eps: number, lat: number): number {
  const r = toRad(ramc), epsR = toRad(eps), latR = toRad(lat);
  const y = -Math.cos(r);
  const x = Math.sin(epsR) * Math.tan(latR) + Math.cos(epsR) * Math.sin(r);
  let asc = mod360(toDeg(Math.atan2(y, x)));
  // 어센던트는 RAMC+90° 부근이어야 함
  if (Math.abs(mod360(asc - ramc) - 90) > 90) asc = mod360(asc + 180);
  return asc;
}

// ─── 1-11. Placidus 하우스 커스프 (반호법 반복수렴) ─────────

/**
 * Placidus 중간 하우스 커스프 계산
 * @param fraction 1/3 (11·3번 하우스) or 2/3 (12·2번 하우스)
 * @param nocturnal false = 주간 반호(MC 쪽), true = 야간 반호(IC 쪽)
 */
function placidusIntermediate(
  ramc: number, eps: number, lat: number,
  fraction: number, nocturnal: boolean,
): number {
  const epsR = toRad(eps);
  const latR = toRad(lat);
  const ramcR = toRad(ramc);
  const raicR = ramcR + Math.PI;

  // 초기값: RAMC(또는 RAIC)에서 fraction×90° 떨어진 황경
  const initRA = nocturnal ? raicR + fraction * Math.PI / 2
                           : ramcR + fraction * Math.PI / 2;
  let lambdaR = Math.atan2(Math.sin(initRA) / Math.cos(epsR), Math.cos(initRA));

  for (let i = 0; i < 30; i++) {
    const sinDecl = Math.sin(epsR) * Math.sin(lambdaR);
    const decl = Math.asin(Math.max(-1, Math.min(1, sinDecl)));
    const cosHA = -Math.tan(decl) * Math.tan(latR);
    if (Math.abs(cosHA) >= 1) break; // 주극성 → 수렴 불가

    const DSA = Math.acos(Math.max(-1, Math.min(1, cosHA)));
    const semiArc = nocturnal ? (Math.PI - DSA) : DSA;
    const targetRA = (nocturnal ? raicR : ramcR) + fraction * semiArc;
    const newLambda = Math.atan2(Math.sin(targetRA) / Math.cos(epsR), Math.cos(targetRA));

    if (Math.abs(newLambda - lambdaR) < 1e-10) break;
    lambdaR = newLambda;
  }
  return mod360(toDeg(lambdaR));
}

/** 12하우스 커스프 배열 계산 (Placidus) */
function calcHouseCusps(ramc: number, eps: number, lat: number): number[] {
  const mc  = calcMC(ramc, eps);
  const asc = calcAscendant(ramc, eps, lat);
  const ic  = mod360(mc  + 180);
  const dsc = mod360(asc + 180);

  const h11 = placidusIntermediate(ramc, eps, lat, 1/3, false);
  const h12 = placidusIntermediate(ramc, eps, lat, 2/3, false);
  const h2  = placidusIntermediate(ramc, eps, lat, 1/3, true);
  const h3  = placidusIntermediate(ramc, eps, lat, 2/3, true);

  return [
    asc,              // 1
    h2,               // 2
    h3,               // 3
    ic,               // 4
    mod360(h11 + 180),// 5 (11번 하우스의 대칭)
    mod360(h12 + 180),// 6 (12번 하우스의 대칭)
    dsc,              // 7
    mod360(h2  + 180),// 8
    mod360(h3  + 180),// 9
    mc,               // 10
    h11,              // 11
    h12,              // 12
  ];
}

// ─── 1-12. 상(Aspect) ─────────────────────────────────────────

const ASPECT_DEFS = [
  { name:'합',   nameEn:'Conjunction',  angle: 0,   orb: 8, symbol:'☌' },
  { name:'육분', nameEn:'Sextile',      angle: 60,  orb: 6, symbol:'⚹' },
  { name:'사분', nameEn:'Square',       angle: 90,  orb: 8, symbol:'□' },
  { name:'삼분', nameEn:'Trine',        angle: 120, orb: 8, symbol:'△' },
  { name:'충',   nameEn:'Opposition',   angle: 180, orb: 8, symbol:'☍' },
  { name:'오분', nameEn:'Quincunx',     angle: 150, orb: 3, symbol:'⚻' },
] as const;

export interface Aspect {
  planet1: string; planet1Kr: string;
  planet2: string; planet2Kr: string;
  aspectName: string; aspectNameEn: string; symbol: string;
  angle: number; orb: number;
}

function calcAspects(positions: Record<string, number>): Aspect[] {
  const keys = Object.keys(positions);
  const result: Aspect[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const diff = mod360(Math.abs(positions[keys[i]] - positions[keys[j]]));
      const angle = diff > 180 ? 360 - diff : diff;
      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(angle - asp.angle);
        if (orb <= asp.orb) {
          result.push({
            planet1: keys[i], planet1Kr: PLANET_NAMES_KR[keys[i]] ?? keys[i],
            planet2: keys[j], planet2Kr: PLANET_NAMES_KR[keys[j]] ?? keys[j],
            aspectName: asp.name, aspectNameEn: asp.nameEn, symbol: asp.symbol,
            angle: asp.angle, orb: Math.round(orb * 10) / 10,
          });
          break;
        }
      }
    }
  }
  return result;
}

// ─── 1-13. 타입 정의 ─────────────────────────────────────────

export interface PlanetPosition {
  name: string; nameKr: string; symbol: string;
  longitude: number;
  signIndex: number; sign: string; signEn: string; signSymbol: string;
  degree: number; minute: number;
  retrograde: boolean;
}

export interface HouseCusp {
  house: number; longitude: number;
  signIndex: number; sign: string; signEn: string; degree: number;
}

export interface WesternChartResult {
  /** 행성 위치 (태양~해왕성, 교점) */
  planets: Record<string, PlanetPosition>;
  /** 어센던트 */
  ascendant: PlanetPosition;
  /** 중천 */
  mc: PlanetPosition;
  /** 12하우스 커스프 (Placidus) */
  houses: HouseCusp[];
  /** 주요 상 */
  aspects: Aspect[];
  /** 달의 위상각 (0°=삭, 180°=망) */
  moonPhaseAngle: number;
  /** 입력값 */
  input: { year: number; month: number; day: number; hour: number; minute: number; lat: number; lng: number };
}

// ─── 1-14. 메인: calcWesternChart ─────────────────────────────

/**
 * 서양 점성학 출생 차트 계산
 * @param year  연도
 * @param month 월 (1-12)
 * @param day   일
 * @param hour  UT 시 (0-23) — KST라면 -9 변환 후 입력
 * @param minute UT 분
 * @param lat   출생지 위도 (북위 +)
 * @param lng   출생지 경도 (동경 +)
 */
export function calcWesternChart(
  year: number, month: number, day: number,
  hour: number, minute: number,
  lat: number, lng: number,
): WesternChartResult {
  const JD  = julianDay(year, month, day, hour, minute);
  const T   = (JD - 2451545.0) / 36525;
  const eps = obliquity(T);
  const gst = greenwichSiderealTime(JD);
  const ramc = mod360(gst + lng); // 로컬 항성시 (도)

  // 행성 황경 계산
  const lonMap: Record<string, number> = {
    sun:      sunLongitude(T),
    moon:     moonLongitude(T),
    mercury:  geocentricLongitude('mercury', T),
    venus:    geocentricLongitude('venus',   T),
    mars:     geocentricLongitude('mars',    T),
    jupiter:  geocentricLongitude('jupiter', T),
    saturn:   geocentricLongitude('saturn',  T),
    uranus:   geocentricLongitude('uranus',  T),
    neptune:  geocentricLongitude('neptune', T),
    northNode: northNode(T),
  };
  lonMap.southNode = mod360(lonMap.northNode + 180);

  const makePlanetPos = (name: string, lon: number): PlanetPosition => {
    const z = zodiacInfo(lon);
    return {
      name, nameKr: PLANET_NAMES_KR[name] ?? name,
      symbol: PLANET_SYMBOLS[name] ?? '?',
      longitude: Math.round(lon * 100) / 100,
      signIndex: z.signIndex, sign: z.sign, signEn: z.signEn, signSymbol: z.symbol,
      degree: z.degree, minute: z.minute,
      retrograde: ['sun','moon','northNode','southNode','ascendant','mc'].includes(name)
        ? false
        : isRetrograde(name, T),
    };
  };

  const planets: Record<string, PlanetPosition> = {};
  for (const [name, lon] of Object.entries(lonMap)) {
    planets[name] = makePlanetPos(name, lon);
  }

  const ascLon = calcAscendant(ramc, eps, lat);
  const mcLon  = calcMC(ramc, eps);

  const cuspLons = calcHouseCusps(ramc, eps, lat);
  const houses: HouseCusp[] = cuspLons.map((lon, i) => {
    const z = zodiacInfo(lon);
    return { house: i + 1, longitude: Math.round(lon * 100) / 100, signIndex: z.signIndex, sign: z.sign, signEn: z.signEn, degree: z.degree };
  });

  const moonPhaseAngle = mod360(lonMap.moon - lonMap.sun);

  return {
    planets,
    ascendant: makePlanetPos('ascendant', ascLon),
    mc:        makePlanetPos('mc',        mcLon),
    houses,
    aspects:   calcAspects(lonMap),
    moonPhaseAngle: Math.round(moonPhaseAngle * 10) / 10,
    input: { year, month, day, hour, minute, lat, lng },
  };
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 : 사주팔자 (Four Pillars of Destiny)
// ═══════════════════════════════════════════════════════════════

// ─── 2-1. 기본 데이터 ─────────────────────────────────────────

/** 천간 (Heavenly Stems) */
export const STEMS    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const;
export const STEMS_KR = ['갑','을','병','정','무','기','경','신','임','계'] as const;

/** 지지 (Earthly Branches) */
export const BRANCHES    = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const;
export const BRANCHES_KR = ['자','축','인','묘','진','사','오','미','신','유','술','해'] as const;

/** 오행 (Wood·Fire·Earth·Metal·Water) */
export const ELEMENTS    = ['木','火','土','金','水'] as const;
export const ELEMENTS_KR = ['목','화','토','금','수'] as const;

/** 십이지 동물 */
export const ZODIAC_ANIMAL_KR = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'] as const;

/** 십신 */
export const SIP_SHIN = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'] as const;

export const SIP_SHIN_EN_MAP: Record<string, string> = {
  '비견':'Peer','겁재':'Rob Wealth','식신':'Eating God','상관':'Hurting Officer',
  '편재':'Indirect Wealth','정재':'Direct Wealth','편관':'7 Killings',
  '정관':'Direct Officer','편인':'Indirect Resource','정인':'Direct Resource',
};

export const UNSUNG_EN_MAP: Record<string, string> = {
  '장생':'Longevity','목욕':'Bath','관대':'Coronation','건록':'Prosperity',
  '제왕':'Emperor','쇠':'Decline','병':'Illness','사':'Death',
  '묘':'Burial','절':'Extinction','태':'Conception','양':'Nurture',
};

// 천간 오행 (甲乙=木 0, 丙丁=火 1, 戊己=土 2, 庚辛=金 3, 壬癸=水 4)
const STEM_EL   = [0,0,1,1,2,2,3,3,4,4] as const;
// 지지 오행 (子=水, 丑辰未戌=土, 寅卯=木, 巳午=火, 申酉=金, 亥=水)
export const BRANCH_EL = [4,2,0,0,2,1,1,2,3,3,2,4] as const;

/**
 * 지장간 (支藏干) — 각 지지에 내포된 천간 인덱스
 * 순서: [여기(餘氣), 중기(中氣), 정기(正氣)]
 */
export const HIDDEN_STEMS: readonly (readonly number[])[] = [
  [8, 9],        // 子: 壬癸
  [9, 7, 5],     // 丑: 癸辛己
  [0, 2, 4],     // 寅: 甲丙戊
  [0, 1],        // 卯: 甲乙
  [1, 9, 4],     // 辰: 乙癸戊
  [2, 4, 6],     // 巳: 丙戊庚
  [3, 5],        // 午: 丁己
  [1, 3, 5],     // 未: 乙丁己
  [4, 6, 8],     // 申: 戊庚壬
  [6, 7],        // 酉: 庚辛
  [3, 7, 4],     // 戌: 丁辛戊
  [0, 8],        // 亥: 甲壬
] as const;

// ─── 2-2. 타입 ───────────────────────────────────────────────

export interface Pillar {
  stemIndex: number;    branchIndex: number;
  stem: string;         branch: string;
  stemKr: string;       branchKr: string;
  char: string;         charKr: string;
  elementKr: string;
  yinYang: '양' | '음';
  sipShin?: string;
  hiddenStems: { stemKr: string; elementKr: string }[];
}

export interface DaeunCycle {
  startAge: number;     endAge: number;
  pillar: Pillar;
  sipShin: string;
}

export interface SajuResult {
  year:  Pillar;  month: Pillar;
  day:   Pillar;  hour:  Pillar;
  dayMaster: {
    stemIndex: number; stemKr: string;
    elementKr: string; yinYang: '양' | '음';
  };
  elementCount:    Record<string, number>;
  dominantElement: string;
  lackingElement:  string;
  zodiacAnimal:    string;
  daeun:           DaeunCycle[];
  input: {
    year: number; month: number; day: number;
    hour: number; minute: number;
    jajasi: '야자시' | '조자시';
  };
}

// ─── 2-3. 내부 헬퍼 ──────────────────────────────────────────

function makePillar(si: number, bi: number): Omit<Pillar, 'sipShin'> {
  si = modN(si, 10); bi = modN(bi, 12);
  return {
    stemIndex: si, branchIndex: bi,
    stem: STEMS[si], branch: BRANCHES[bi],
    stemKr: STEMS_KR[si], branchKr: BRANCHES_KR[bi],
    char: STEMS[si] + BRANCHES[bi],
    charKr: STEMS_KR[si] + BRANCHES_KR[bi],
    elementKr: ELEMENTS_KR[STEM_EL[si]],
    yinYang: si % 2 === 0 ? '양' : '음',
    hiddenStems: HIDDEN_STEMS[bi].map(idx => ({
      stemKr: STEMS_KR[idx],
      elementKr: ELEMENTS_KR[STEM_EL[idx]],
    })),
  };
}

// ─── 2-4. 월절기 테이블 (만세력 기반, KST) ──────────────────────
//
// 인덱스 0~11 순서: 소한, 입춘, 경칩, 청명, 입하, 망종, 소서, 입추, 백로, 한로, 입동, 대설
// 대응 월지(branchIdx):  1,    2,    3,    4,    5,    6,    7,    8,    9,   10,   11,    0
// 입춘(index 1)이 사주 연도 경계
// 각 항목: [월, 일, 시, 분] KST
// 범위: 2016 ~ 2100

const SOLAR_TERM_TABLE: Record<number, [number,number,number,number][]> = {
  2016: [[1,6,7,8],[2,4,18,46],[3,5,12,43],[4,4,17,27],[5,5,10,42],[6,5,14,48],[7,7,1,3],[8,7,10,53],[9,7,13,51],[10,8,5,33],[11,7,8,48],[12,7,1,41]],
  2017: [[1,5,12,55],[2,4,0,33],[3,5,18,32],[4,4,23,16],[5,5,16,30],[6,5,20,36],[7,7,6,50],[8,7,16,39],[9,7,19,38],[10,8,11,21],[11,7,14,37],[12,7,7,32]],
  2018: [[1,5,18,48],[2,4,6,28],[3,6,0,27],[4,5,5,12],[5,5,22,24],[6,6,2,28],[7,7,12,41],[8,7,22,30],[9,8,1,29],[10,8,17,14],[11,7,20,31],[12,7,13,25]],
  2019: [[1,6,0,38],[2,4,12,13],[3,6,6,9],[4,5,10,50],[5,6,4,2],[6,6,8,5],[7,7,18,20],[8,8,4,12],[9,8,7,16],[10,8,23,5],[11,8,2,23],[12,7,19,17]],
  2020: [[1,6,6,29],[2,4,18,2],[3,5,11,56],[4,4,16,37],[5,5,9,50],[6,5,13,57],[7,7,0,13],[8,7,10,5],[9,7,13,7],[10,8,4,54],[11,7,8,13],[12,7,1,8]],
  2021: [[1,5,12,22],[2,3,23,58],[3,5,17,53],[4,4,22,34],[5,5,15,46],[6,5,19,51],[7,7,6,4],[8,7,15,53],[9,7,18,52],[10,8,10,38],[11,7,13,58],[12,7,6,56]],
  2022: [[1,5,18,13],[2,4,5,50],[3,5,23,43],[4,5,4,19],[5,5,21,25],[6,6,1,25],[7,7,11,37],[8,7,21,28],[9,8,0,31],[10,8,16,21],[11,7,19,44],[12,7,12,45]],
  2023: [[1,5,0,4],[2,4,11,41],[3,6,5,35],[4,5,10,12],[5,6,3,18],[6,6,7,17],[7,7,17,30],[8,8,3,22],[9,8,6,26],[10,8,22,14],[11,8,1,35],[12,7,18,32]],
  2024: [[1,6,5,48],[2,4,17,26],[3,5,11,22],[4,4,16,1],[5,5,9,9],[6,5,13,9],[7,6,23,19],[8,7,9,8],[9,7,12,10],[10,8,3,59],[11,7,7,19],[12,7,0,16]],
  2025: [[1,5,11,32],[2,3,23,9],[3,5,17,6],[4,4,21,47],[5,5,14,56],[6,5,18,55],[7,7,5,4],[8,7,14,50],[9,7,17,51],[10,8,9,40],[11,7,13,3],[12,7,6,3]],
  2026: [[1,5,17,22],[2,4,5,1],[3,5,22,58],[4,5,3,39],[5,5,20,48],[6,6,0,47],[7,7,10,56],[8,7,20,42],[9,8,23,40],[10,8,15,28],[11,7,18,51],[12,7,11,51]],
  2027: [[1,5,23,9],[2,4,10,45],[3,6,4,38],[4,5,9,16],[5,6,2,24],[6,6,6,25],[7,7,16,36],[8,8,2,26],[9,8,5,27],[10,8,21,16],[11,8,0,37],[12,7,17,36]],
  2028: [[1,6,4,53],[2,4,16,30],[3,5,10,24],[4,4,15,2],[5,5,8,11],[6,5,12,15],[7,6,22,29],[8,7,8,20],[9,7,11,21],[10,8,3,7],[11,7,6,26],[12,6,23,23]],
  2029: [[1,5,10,41],[2,3,22,20],[3,5,16,16],[4,4,20,57],[5,5,14,7],[6,5,18,9],[7,7,4,21],[8,7,14,11],[9,7,17,11],[10,8,8,57],[11,7,12,16],[12,7,5,13]],
  2030: [[1,5,16,29],[2,4,4,7],[3,5,22,2],[4,5,2,40],[5,5,19,45],[6,6,23,43],[7,7,9,54],[8,7,19,46],[9,7,22,52],[10,8,14,44],[11,7,18,7],[12,7,11,6]],
  2031: [[1,5,22,22],[2,4,9,57],[3,6,3,50],[4,5,8,27],[5,6,1,34],[6,6,5,34],[7,7,15,48],[8,8,1,42],[9,8,4,49],[10,8,20,42],[11,7,0,4],[12,7,17,2]],
  2032: [[1,6,4,15],[2,4,15,48],[3,5,9,39],[4,4,14,16],[5,5,7,25],[6,5,11,27],[7,6,21,40],[8,7,7,31],[9,7,10,30],[10,8,2,29],[11,7,5,53],[12,6,22,52]],
  2033: [[1,5,10,7],[2,3,21,40],[3,5,15,31],[4,4,20,7],[5,5,13,12],[6,5,17,12],[7,7,3,24],[8,7,13,14],[9,7,16,19],[10,8,8,13],[11,7,11,40],[12,7,4,44]],
  2034: [[1,5,16,3],[2,4,4,40],[3,5,21,31],[4,5,2,5],[5,5,19,8],[6,5,23,5],[7,7,9,16],[8,7,19,8],[9,7,22,13],[10,8,14,6],[11,7,17,30],[12,7,10,31]],
  2035: [[1,5,21,54],[2,4,10,28],[3,6,3,22],[4,5,8,0],[5,6,1,7],[6,6,5,9],[7,7,15,22],[8,8,1,15],[9,8,4,17],[10,8,19,59],[11,7,23,22],[12,7,16,20]],
  2036: [[1,6,3,43],[2,4,16,20],[3,5,9,12],[4,4,13,52],[5,5,6,59],[6,5,11,2],[7,6,21,18],[8,7,7,14],[9,7,10,19],[10,8,2,9],[11,7,5,37],[12,6,22,38]],
  2037: [[1,5,9,33],[2,3,22,9],[3,5,15,3],[4,4,19,43],[5,5,12,49],[6,5,16,50],[7,7,2,59],[8,7,12,54],[9,7,15,58],[10,8,7,49],[11,7,11,17],[12,7,4,16]],
  2038: [[1,5,15,26],[2,4,4,2],[3,5,20,57],[4,5,1,37],[5,5,18,44],[6,5,22,41],[7,7,8,49],[8,7,18,43],[9,7,21,49],[10,8,13,42],[11,7,17,10],[12,7,10,6]],
  2039: [[1,5,21,21],[2,4,9,58],[3,6,2,52],[4,5,7,33],[5,6,0,39],[6,6,4,36],[7,7,14,44],[8,8,0,38],[9,8,3,47],[10,8,19,41],[11,7,23,8],[12,7,16,5]],
  2040: [[1,6,3,12],[2,4,15,49],[3,5,8,42],[4,4,13,21],[5,5,6,27],[6,5,10,24],[7,6,20,34],[8,7,6,27],[9,7,9,33],[10,8,1,26],[11,7,4,53],[12,6,21,49]],
  2041: [[1,5,9,1],[2,3,21,37],[3,5,14,30],[4,4,19,10],[5,5,12,18],[6,5,16,17],[7,7,2,28],[8,7,12,21],[9,7,15,30],[10,8,7,24],[11,7,10,52],[12,7,3,48]],
  2042: [[1,5,14,51],[2,4,3,26],[3,5,20,17],[4,5,0,59],[5,5,18,6],[6,5,22,8],[7,7,8,19],[8,7,18,12],[9,7,21,20],[10,8,13,16],[11,7,16,46],[12,7,9,46]],
  2043: [[1,5,20,45],[2,4,9,20],[3,6,2,13],[4,5,6,55],[5,6,0,2],[6,6,4,4],[7,7,14,15],[8,8,0,8],[9,8,3,18],[10,8,19,12],[11,7,22,44],[12,7,15,44]],
  2044: [[1,6,2,33],[2,4,15,6],[3,5,8,0],[4,4,12,40],[5,5,5,47],[6,5,9,48],[7,6,19,59],[8,7,5,51],[9,7,9,1],[10,8,0,55],[11,7,4,28],[12,6,21,29]],
  2045: [[1,5,8,22],[2,3,20,55],[3,5,13,48],[4,4,18,30],[5,5,11,38],[6,5,15,40],[7,7,1,52],[8,7,11,45],[9,7,14,54],[10,8,6,48],[11,7,10,20],[12,7,3,20]],
  2046: [[1,5,14,12],[2,4,2,46],[3,5,19,39],[4,5,0,21],[5,5,17,28],[6,5,21,29],[7,7,7,40],[8,7,17,34],[9,7,20,46],[10,8,12,42],[11,7,16,14],[12,7,9,12]],
  2047: [[1,5,20,3],[2,4,8,38],[3,6,1,31],[4,5,6,13],[5,5,23,19],[6,6,3,20],[7,7,13,31],[8,7,23,23],[9,8,2,36],[10,8,18,32],[11,7,22,4],[12,7,15,2]],
  2048: [[1,6,1,54],[2,4,14,27],[3,5,7,21],[4,4,12,3],[5,5,5,10],[6,5,9,13],[7,6,19,25],[8,7,5,18],[9,7,8,30],[10,8,0,25],[11,7,3,58],[12,6,20,56]],
  2049: [[1,5,7,44],[2,3,20,16],[3,5,13,10],[4,4,17,51],[5,5,4,58],[6,5,8,59],[7,7,1,9],[8,7,11,2],[9,7,14,14],[10,8,6,8],[11,7,9,40],[12,7,2,40]],
  2050: [[1,5,13,34],[2,4,2,7],[3,5,18,59],[4,4,23,40],[5,5,16,48],[6,5,20,52],[7,7,7,4],[8,7,16,58],[9,7,20,9],[10,8,12,3],[11,7,15,36],[12,7,8,36]],
  2051: [[1,5,19,26],[2,4,7,59],[3,6,0,51],[4,5,5,32],[5,5,22,38],[6,6,2,41],[7,7,12,53],[8,7,22,48],[9,8,2,2],[10,8,17,58],[11,7,21,32],[12,7,14,32]],
  2052: [[1,6,1,18],[2,4,13,50],[3,5,6,42],[4,4,11,23],[5,5,4,29],[6,5,8,31],[7,6,18,42],[8,7,4,36],[9,7,7,49],[10,7,23,44],[11,7,3,18],[12,6,20,17]],
  2053: [[1,5,7,7],[2,3,19,39],[3,5,12,31],[4,4,17,12],[5,5,4,19],[6,5,8,22],[7,7,0,34],[8,7,10,27],[9,7,13,41],[10,8,5,35],[11,7,9,8],[12,7,2,8]],
  2054: [[1,5,13,0],[2,4,1,33],[3,5,18,26],[4,4,23,8],[5,5,16,15],[6,5,20,17],[7,7,6,29],[8,7,16,22],[9,7,19,36],[10,8,11,31],[11,7,15,3],[12,7,7,59]],
  2055: [[1,5,18,51],[2,4,7,25],[3,6,0,19],[4,5,4,59],[5,5,22,7],[6,6,2,9],[7,7,12,22],[8,7,22,17],[9,8,1,33],[10,8,17,28],[11,7,20,58],[12,7,13,56]],
  2056: [[1,6,0,40],[2,4,13,13],[3,5,6,7],[4,4,10,47],[5,5,3,55],[6,5,7,57],[7,6,18,10],[8,7,4,5],[9,7,7,22],[10,7,23,17],[11,7,2,45],[12,6,19,44]],
  2057: [[1,5,6,30],[2,3,19,3],[3,5,11,56],[4,4,16,36],[5,5,3,44],[6,5,7,46],[7,6,23,58],[8,7,9,51],[9,7,13,7],[10,8,5,3],[11,7,8,32],[12,7,1,31]],
  2058: [[1,5,12,21],[2,4,0,54],[3,5,17,47],[4,4,22,27],[5,5,15,35],[6,5,19,38],[7,7,5,50],[8,7,15,44],[9,7,19,0],[10,8,10,56],[11,7,14,25],[12,7,7,23]],
  2059: [[1,5,18,13],[2,4,6,46],[3,5,23,40],[4,5,4,21],[5,5,21,28],[6,6,1,30],[7,7,11,43],[8,7,21,38],[9,8,0,55],[10,8,16,51],[11,7,20,19],[12,7,13,17]],
  2060: [[1,6,0,4],[2,4,12,37],[3,5,5,30],[4,4,10,11],[5,5,3,18],[6,5,7,19],[7,6,17,31],[8,7,3,25],[9,7,6,40],[10,7,22,36],[11,7,2,4],[12,6,19,1]],
  2061: [[1,5,5,55],[2,3,18,28],[3,5,11,20],[4,4,16,0],[5,5,3,7],[6,5,7,8],[7,6,23,19],[8,7,9,12],[9,7,12,26],[10,8,4,21],[11,7,7,49],[12,7,0,47]],
  2062: [[1,5,11,46],[2,4,0,19],[3,5,17,11],[4,4,21,52],[5,5,14,59],[6,5,19,0],[7,7,5,11],[8,7,15,5],[9,7,18,20],[10,8,10,16],[11,7,13,45],[12,7,6,44]],
  2063: [[1,5,17,39],[2,4,6,13],[3,5,23,5],[4,5,3,45],[5,5,20,52],[6,6,0,54],[7,7,11,6],[8,7,21,0],[9,8,0,15],[10,8,16,11],[11,7,19,39],[12,7,12,37]],
  2064: [[1,5,23,29],[2,4,11,59],[3,5,4,54],[4,4,9,34],[5,5,2,40],[6,5,6,42],[7,6,16,54],[8,7,2,46],[9,7,6,2],[10,7,21,58],[11,7,1,26],[12,6,18,25]],
  2065: [[1,5,5,21],[2,3,17,55],[3,5,10,48],[4,4,15,28],[5,5,2,36],[6,5,6,38],[7,6,22,50],[8,7,8,44],[9,7,12,0],[10,8,3,57],[11,7,7,27],[12,7,0,27]],
  2066: [[1,5,11,13],[2,3,23,47],[3,5,16,39],[4,4,21,18],[5,5,14,27],[6,5,18,29],[7,7,4,41],[8,7,14,37],[9,7,17,54],[10,8,9,51],[11,7,13,20],[12,7,6,18]],
  2067: [[1,5,17,5],[2,4,5,39],[3,5,22,32],[4,5,3,11],[5,5,20,18],[6,6,0,20],[7,7,10,31],[8,7,20,25],[9,7,23,41],[10,8,15,37],[11,7,19,6],[12,7,12,5]],
  2068: [[1,5,22,58],[2,4,11,32],[3,5,4,25],[4,4,9,5],[5,5,2,11],[6,5,6,14],[7,6,16,27],[8,7,2,21],[9,7,5,37],[10,7,21,33],[11,7,1,1],[12,6,17,59]],
  2069: [[1,5,4,49],[2,3,17,23],[3,5,10,16],[4,4,14,56],[5,5,2,2],[6,5,6,4],[7,6,22,15],[8,7,8,8],[9,7,11,23],[10,8,3,19],[11,7,6,48],[12,6,23,46]],
  2070: [[1,5,10,41],[2,3,23,14],[3,5,16,7],[4,4,20,47],[5,5,13,55],[6,5,17,57],[7,7,4,9],[8,7,14,2],[9,7,17,18],[10,8,9,14],[11,7,12,42],[12,7,5,41]],
  2071: [[1,5,16,32],[2,4,5,5],[3,5,22,0],[4,5,2,40],[5,5,19,48],[6,5,23,50],[7,7,10,2],[8,7,19,56],[9,7,23,12],[10,8,15,8],[11,7,18,37],[12,7,11,36]],
  2072: [[1,5,22,24],[2,4,10,57],[3,5,3,51],[4,4,8,31],[5,5,1,38],[6,5,5,40],[7,6,15,53],[8,7,1,46],[9,7,5,2],[10,7,20,59],[11,7,0,28],[12,6,17,26]],
  2073: [[1,5,4,14],[2,3,16,47],[3,5,9,40],[4,4,14,21],[5,5,1,28],[6,5,5,30],[7,6,21,43],[8,7,7,36],[9,7,10,52],[10,8,2,47],[11,7,6,16],[12,6,23,14]],
  2074: [[1,5,10,6],[2,3,22,39],[3,5,15,33],[4,4,20,14],[5,5,13,22],[6,5,17,23],[7,7,3,36],[8,7,13,29],[9,7,16,45],[10,8,8,41],[11,7,12,9],[12,7,5,7]],
  2075: [[1,5,15,57],[2,4,4,31],[3,5,21,24],[4,5,2,4],[5,5,19,11],[6,5,23,12],[7,7,9,24],[8,7,19,18],[9,7,22,34],[10,8,14,30],[11,7,17,58],[12,7,10,56]],
  2076: [[1,5,21,48],[2,4,10,21],[3,5,3,15],[4,4,7,55],[5,5,0,2],[6,5,5,4],[7,6,15,17],[8,7,1,10],[9,7,4,26],[10,7,20,22],[11,7,0,0],[12,6,16,58]],
  2077: [[1,5,3,40],[2,3,15,13],[3,5,9,7],[4,4,13,48],[5,5,0,54],[6,5,4,55],[7,6,21,7],[8,7,7,0],[9,7,10,16],[10,8,2,11],[11,7,5,39],[12,6,22,38]],
  2078: [[1,5,9,31],[2,3,21,4],[3,5,14,58],[4,4,19,38],[5,5,12,45],[6,5,16,47],[7,7,3,0],[8,7,12,53],[9,7,16,9],[10,8,8,4],[11,7,11,32],[12,7,4,31]],
  2079: [[1,5,15,22],[2,4,2,55],[3,5,20,49],[4,5,1,30],[5,5,18,36],[6,5,22,37],[7,7,8,49],[8,7,18,43],[9,7,21,59],[10,8,13,55],[11,7,17,23],[12,7,10,22]],
  2080: [[1,5,21,14],[2,4,8,47],[3,5,2,41],[4,4,7,21],[5,4,24,28],[6,5,4,30],[7,6,14,42],[8,7,0,37],[9,7,3,52],[10,7,19,48],[11,7,0,17],[12,6,15,15]],
  2081: [[1,5,3,5],[2,3,14,38],[3,5,8,31],[4,4,13,12],[5,5,0,18],[6,5,10,20],[7,6,20,32],[8,7,6,25],[9,7,9,42],[10,8,1,37],[11,7,5,6],[12,6,22,5]],
  2082: [[1,5,8,57],[2,3,20,30],[3,5,14,23],[4,4,19,3],[5,5,12,10],[6,5,16,11],[7,7,2,23],[8,7,12,17],[9,7,15,32],[10,8,7,28],[11,7,10,56],[12,7,3,55]],
  2083: [[1,5,14,48],[2,4,2,21],[3,5,20,15],[4,5,0,55],[5,5,18,1],[6,5,22,2],[7,7,8,14],[8,7,18,8],[9,7,21,24],[10,8,13,19],[11,7,16,47],[12,7,9,46]],
  2084: [[1,5,20,40],[2,4,8,13],[3,5,2,7],[4,4,6,47],[5,4,23,53],[6,5,3,55],[7,6,14,7],[8,7,0,1],[9,7,3,17],[10,7,19,12],[11,6,22,41],[12,6,15,39]],
  2085: [[1,5,2,30],[2,3,14,3],[3,5,7,57],[4,4,12,37],[5,4,29,44],[6,5,9,45],[7,6,19,57],[8,7,5,50],[9,7,9,6],[10,8,1,1],[11,7,4,29],[12,6,21,28]],
  2086: [[1,5,8,22],[2,3,19,55],[3,5,13,48],[4,4,18,28],[5,5,11,34],[6,5,15,36],[7,7,1,47],[8,7,11,40],[9,7,14,56],[10,8,6,51],[11,7,10,20],[12,7,3,18]],
  2087: [[1,5,14,13],[2,4,1,46],[3,5,19,39],[4,5,0,19],[5,5,17,26],[6,5,21,28],[7,7,7,40],[8,7,17,33],[9,7,20,50],[10,8,12,45],[11,7,16,13],[12,7,9,12]],
  2088: [[1,5,20,5],[2,4,7,38],[3,5,1,31],[4,4,6,12],[5,4,23,18],[6,5,3,20],[7,6,13,33],[8,6,23,26],[9,7,2,42],[10,7,18,37],[11,6,22,5],[12,6,15,4]],
  2089: [[1,5,1,56],[2,3,13,29],[3,5,7,22],[4,4,12,3],[5,4,29,10],[6,5,9,12],[7,6,19,24],[8,7,5,16],[9,7,8,33],[10,8,0,28],[11,7,3,56],[12,6,20,54]],
  2090: [[1,5,7,48],[2,3,19,21],[3,5,13,14],[4,4,17,54],[5,5,11,1],[6,5,15,2],[7,7,1,13],[8,7,11,7],[9,7,14,22],[10,8,6,17],[11,7,9,45],[12,7,2,44]],
  2091: [[1,5,13,38],[2,4,1,11],[3,5,19,4],[4,4,23,44],[5,5,16,51],[6,5,20,53],[7,7,7,4],[8,7,16,58],[9,7,20,14],[10,8,12,9],[11,7,15,37],[12,7,8,36]],
  2092: [[1,5,19,30],[2,4,7,3],[3,5,0,56],[4,4,5,36],[5,4,22,43],[6,5,2,46],[7,6,12,58],[8,6,22,51],[9,7,2,7],[10,7,18,2],[11,6,21,30],[12,6,14,28]],
  2093: [[1,5,1,21],[2,3,12,54],[3,5,6,47],[4,4,11,27],[5,4,28,34],[6,5,8,36],[7,6,18,48],[8,7,4,42],[9,7,7,57],[10,7,23,52],[11,7,3,20],[12,6,20,19]],
  2094: [[1,5,7,13],[2,3,18,46],[3,5,12,38],[4,4,17,18],[5,5,10,24],[6,5,14,27],[7,7,0,39],[8,7,10,33],[9,7,13,49],[10,8,5,43],[11,7,9,11],[12,7,2,10]],
  2095: [[1,5,13,4],[2,4,0,37],[3,5,18,29],[4,4,23,9],[5,5,16,16],[6,5,20,18],[7,7,6,30],[8,7,16,23],[9,7,19,39],[10,8,11,34],[11,7,15,2],[12,7,7,59]],
  2096: [[1,5,18,55],[2,4,6,28],[3,5,0,21],[4,4,5,1],[5,4,22,8],[6,5,2,10],[7,6,12,22],[8,6,22,16],[9,7,1,31],[10,7,17,26],[11,6,20,54],[12,6,13,52]],
  2097: [[1,5,0,47],[2,3,12,20],[3,5,6,13],[4,4,10,53],[5,4,28,0],[6,5,8,2],[7,6,18,14],[8,7,4,7],[9,7,7,22],[10,7,23,17],[11,7,2,45],[12,6,19,44]],
  2098: [[1,5,6,38],[2,3,18,11],[3,5,12,5],[4,4,16,45],[5,5,9,51],[6,5,13,53],[7,7,0,5],[8,7,9,58],[9,7,13,14],[10,8,5,9],[11,7,8,37],[12,7,1,36]],
  2099: [[1,5,12,28],[2,4,0,1],[3,5,17,55],[4,4,22,35],[5,5,15,42],[6,5,19,45],[7,7,5,58],[8,7,15,51],[9,7,19,7],[10,8,11,1],[11,7,14,30],[12,7,7,29]],
  2100: [[1,5,18,20],[2,4,5,53],[3,5,23,46],[4,5,4,27],[5,5,21,33],[6,6,1,36],[7,7,11,49],[8,7,21,43],[9,8,0,59],[10,8,16,53],[11,7,20,22],[12,7,13,20]],
};

// 월절기 → 월지(branchIdx) 대응
// SOLAR_TERM_TABLE 인덱스 0~11 → branchIdx 1,2,3,4,5,6,7,8,9,10,11,0
const TERM_TO_BRANCH = [1,2,3,4,5,6,7,8,9,10,11,0] as const;

/**
 * 출생 년·월·일·시·분(KST)을 받아 {monthBranch, sajuYear} 반환.
 * 만세력 테이블(2016-2100) 사용, 범위 밖은 태양 황경 fallback.
 */
function getMonthBranchAndSajuYear(
  year: number, month: number, day: number, hour: number, minute: number,
): { monthBranch: number; sajuYear: number } {
  const table = SOLAR_TERM_TABLE[year];
  const prevTable = SOLAR_TERM_TABLE[year - 1];

  if (table) {
    // 12개 월절기를 현재 연도와 이전 연도 두 해에서 수집
    type TermEntry = { termYear: number; termMonth: number; termDay: number; termHour: number; termMin: number; branch: number; isChunbun: boolean };
    const entries: TermEntry[] = [];

    const tablesToScan: [typeof table, number][] = [[table, year]];
    if (prevTable) tablesToScan.push([prevTable, year - 1]);

    for (const [tbl, tYear] of tablesToScan) {
      for (let i = 0; i < 12; i++) {
        const [m, d, h, mn] = tbl[i];
        entries.push({
          termYear: tYear, termMonth: m, termDay: d, termHour: h, termMin: mn,
          branch: TERM_TO_BRANCH[i],
          isChunbun: i === 1,
        });
      }
    }

    // 출생 시각보다 이전이며 가장 최근인 절기 찾기
    // 비교: (termYear, termMonth, termDay, termHour, termMin) vs (year, month, day, hour, minute)
    function termBefore(e: TermEntry): boolean {
      if (e.termYear !== year) return e.termYear < year;
      if (e.termMonth !== month) return e.termMonth < month;
      if (e.termDay !== day) return e.termDay < day;
      if (e.termHour !== hour) return e.termHour < hour;
      return e.termMin <= minute;
    }
    function termCompare(a: TermEntry, b: TermEntry): number {
      if (a.termYear !== b.termYear) return a.termYear - b.termYear;
      if (a.termMonth !== b.termMonth) return a.termMonth - b.termMonth;
      if (a.termDay !== b.termDay) return a.termDay - b.termDay;
      if (a.termHour !== b.termHour) return a.termHour - b.termHour;
      return a.termMin - b.termMin;
    }

    const past = entries.filter(termBefore);
    if (past.length > 0) {
      const latest = past.reduce((a, b) => termCompare(a, b) > 0 ? a : b);
      const monthBranch = latest.branch;

      // 사주 연도: 현재 연도의 입춘 이전이면 year-1
      const cb = table[1]; // 입춘
      const beforeChunbun = month < cb[0]
        || (month === cb[0] && day < cb[1])
        || (month === cb[0] && day === cb[1] && hour < cb[2])
        || (month === cb[0] && day === cb[1] && hour === cb[2] && minute < cb[3]);
      const sajuYear = beforeChunbun ? year - 1 : year;

      return { monthBranch, sajuYear };
    }
  }

  // fallback: 태양 황경 기반 (테이블 범위 밖 연도)
  const birthJD = julianDay(year, month, day, hour - 9, minute);
  const T = (birthJD - 2451545.0) / 36525;
  const lon = sunLongitude(T);
  const monthBranch = modN(Math.floor(mod360(lon - 255) / 30), 12);
  // 입춘(태양황경 315°) JD를 직접 계산해 출생일과 비교
  const chunbunJD = findSolarTermJD(315, julianDay(year, 2, 4));
  const sajuYear = birthJD < chunbunJD ? year - 1 : year;
  return { monthBranch, sajuYear };
}

/**
 * 연주(年柱) 계산
 */
function calcYearPillar(sajuYear: number): Pillar {
  return makePillar(modN(sajuYear - 4, 10), modN(sajuYear - 4, 12)) as Pillar;
}

// 오호둔월법: 연간 → 인월(寅, bi=2)의 월간 시작 인덱스
// 갑/기→丙(2), 을/경→戊(4), 병/신→庚(6), 정/임→壬(8), 무/계→甲(0)
const MONTH_STEM_BASE = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0] as const;

/**
 * 월주(月柱) 계산 — 오호둔월법
 */
function calcMonthPillar(yearStemIdx: number, monthBranch: number): Pillar {
  const offset = modN(monthBranch - 2, 12);
  const si = modN(MONTH_STEM_BASE[yearStemIdx] + offset, 10);
  return makePillar(si, monthBranch) as Pillar;
}

// ─── 2-6. 일주(日柱) ─────────────────────────────────────────
// 기준: 2000-01-01 = 戊午日 (60갑자 index 54)
// 만세력 검증: 2016-01-01=壬午(18), 2024-02-04=戊戌(34) ✓

function calcDayPillar(year: number, month: number, day: number): Pillar {
  const ref    = Date.UTC(2000, 0, 1);
  const target = Date.UTC(year, month - 1, day);
  const diff   = Math.round((target - ref) / 86_400_000);
  const idx    = modN(54 + diff, 60);
  return makePillar(idx % 10, idx % 12) as Pillar;
}

// ─── 2-7. 시주(時柱) ─────────────────────────────────────────
// 오자둔시법: 일간 → 자시(子時)의 시간 시작 인덱스
// 갑/기→甲(0), 을/경→丙(2), 병/신→戊(4), 정/임→庚(6), 무/계→壬(8)
const HOUR_STEM_BASE = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8] as const;

function getHourBranch(hour: number, minute: number): number {
  const t = hour * 60 + minute;
  if (t >= 1380 || t < 60)   return 0;  // 子 23:00-01:00
  if (t < 180)  return 1;  // 丑 01:00-03:00
  if (t < 300)  return 2;  // 寅 03:00-05:00
  if (t < 420)  return 3;  // 卯 05:00-07:00
  if (t < 540)  return 4;  // 辰 07:00-09:00
  if (t < 660)  return 5;  // 巳 09:00-11:00
  if (t < 780)  return 6;  // 午 11:00-13:00
  if (t < 900)  return 7;  // 未 13:00-15:00
  if (t < 1020) return 8;  // 申 15:00-17:00
  if (t < 1140) return 9;  // 酉 17:00-19:00
  if (t < 1260) return 10; // 戌 19:00-21:00
  return 11;               // 亥 21:00-23:00
}

function calcHourPillar(dayStemIdx: number, hour: number, minute: number): Pillar {
  const bi = getHourBranch(hour, minute);
  const si = modN(HOUR_STEM_BASE[dayStemIdx] + bi, 10);
  return makePillar(si, bi) as Pillar;
}

// ─── 2-8. 십신(十神) ─────────────────────────────────────────
// 오행 상생: 木(0)→火(1)→土(2)→金(3)→水(4)→木
// 오행 상극: 木→土, 土→水, 水→火, 火→金, 金→木

const CONTROLS: Record<number, number> = { 0:2, 2:4, 4:1, 1:3, 3:0 };

/**
 * 십신 계산
 * @param dmIdx 일간 인덱스
 * @param targetIdx 대상 천간 인덱스
 */
export function getSipShin(dmIdx: number, targetIdx: number): string {
  const dmEl  = STEM_EL[dmIdx];
  const tEl   = STEM_EL[targetIdx];
  const same  = (dmIdx % 2) === (targetIdx % 2); // 음양 동일 여부

  if (dmEl === tEl)              return same ? '비견' : '겁재';
  if ((dmEl + 1) % 5 === tEl)   return same ? '식신' : '상관'; // DM이 生
  if (CONTROLS[dmEl] === tEl)   return same ? '편재' : '정재'; // DM이 剋
  if (CONTROLS[tEl]  === dmEl)  return same ? '편관' : '정관'; // 대상이 DM을 剋
  return same ? '편인' : '정인';                               // 대상이 DM을 生
}

// ─── 2-9. 절기 JD 탐색 (대운 시작 나이 계산용) ──────────────
// 절기 = 태양이 특정 황경에 도달하는 시점
// 월초 절기 황경: 소한(285°), 입춘(315°), 경칩(345°), 청명(15°), 입하(45°),
//                망종(75°), 소서(105°), 입추(135°), 백로(165°), 한로(195°),
//                입동(225°), 대설(255°)

const SOLAR_TERM_LONS = [285,315,345,15,45,75,105,135,165,195,225,255] as const;

/** 이분탐색으로 태양 황경이 targetLon이 되는 JD 탐색 */
function findSolarTermJD(targetLon: number, nearJD: number): number {
  let lo = nearJD - 30, hi = nearJD + 30;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const T   = (mid - 2451545.0) / 36525;
    let diff  = targetLon - sunLongitude(T);
    // 0/360 경계 처리
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (Math.abs(diff) < 1e-6) return mid;
    if (diff > 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * 생년월일 기준으로 다음 또는 이전 월초 절기 JD를 반환
 * @param forward true=다음 절기, false=이전 절기
 */
function nearestSolarTermJD(birthJD: number, forward: boolean): number {
  // 근처 절기 탐색: 최대 ±100일 범위에서 12개 절기 모두 확인
  const candidates: number[] = [];
  for (const lon of SOLAR_TERM_LONS) {
    // 근사 날짜: 해당 황경에 가장 가까운 시점을 birthJD 근처에서 찾음
    for (const offset of [-365, 0, 365]) {
      const approxJD = findSolarTermJD(lon, birthJD + offset);
      if (forward  && approxJD > birthJD + 0.01) candidates.push(approxJD);
      if (!forward && approxJD < birthJD - 0.01) candidates.push(approxJD);
    }
  }
  if (candidates.length === 0) return birthJD;
  return forward
    ? Math.min(...candidates)
    : Math.max(...candidates);
}

// ─── 2-10. 대운(大運) ────────────────────────────────────────

/**
 * 대운 계산 (10사이클)
 * @param gender '남' | '여'
 */
function calcDaeun(
  dayPillar: Pillar,
  monthPillar: Pillar,
  yearPillar: Pillar,
  birthYear: number, birthMonth: number, birthDay: number,
  gender: '남' | '여',
): DaeunCycle[] {
  const isYangYear = yearPillar.stemIndex % 2 === 0;
  const isForward  = (gender === '남' && isYangYear) || (gender === '여' && !isYangYear);
  const dmIdx      = dayPillar.stemIndex;

  // 출생일 JD
  const birthJD = julianDay(birthYear, birthMonth, birthDay);
  // 대운 기산점: 다음(순행) 또는 이전(역행) 절기까지의 날수
  const termJD   = nearestSolarTermJD(birthJD, isForward);
  const daysDiff = Math.abs(termJD - birthJD);
  // 3일 = 1년 (소수 첫째자리 반올림)
  const startAge = Math.round(daysDiff / 3 * 10) / 10;

  const cycles: DaeunCycle[] = [];
  for (let i = 1; i <= 10; i++) {
    const offset = isForward ? i : -i;
    const si = modN(monthPillar.stemIndex  + offset, 10);
    const bi = modN(monthPillar.branchIndex + offset, 12);
    const pillar = makePillar(si, bi) as Pillar;
    pillar.sipShin = getSipShin(dmIdx, si);
    const age = Math.floor(startAge) + (i - 1) * 10;
    cycles.push({
      startAge: age,
      endAge:   age + 9,
      pillar,
      sipShin: pillar.sipShin,
    });
  }
  return cycles;
}

// ─── 2-11. 메인: calcSaju ────────────────────────────────────

/**
 * 사주팔자 계산
 * @param year    양력 연도
 * @param month   월 (1-12)
 * @param day     일
 * @param hour    한국 현지 시 KST (0-23), 기본 0
 * @param minute  분, 기본 0
 * @param gender  대운 계산용 성별 ('남' | '여'), 기본 '남'
 * @param jajasi  야자시/조자시 학파 선택
 *   - '야자시': 23:00~24:00은 당일 일주 유지 (기본값)
 *   - '조자시': 23:00 이후는 다음날 일주 적용
 */
export function calcSaju(
  year: number, month: number, day: number,
  hour = 0, minute = 0,
  gender: '남' | '여' = '남',
  jajasi: '야자시' | '조자시' = '야자시',
): SajuResult {
  // ── 야자시/조자시: 일주 계산에 쓸 날짜 결정 ──────────────────
  // 조자시 학파: 23시(자시 시작)부터 다음날로 일주 전환
  // 야자시 학파: 일주는 오늘 유지, 시주 계산만 다음날 일간 기준
  let dpYear = year, dpMonth = month, dpDay = day;
  if (jajasi === '조자시' && hour >= 23) {
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    dpYear  = next.getUTCFullYear();
    dpMonth = next.getUTCMonth() + 1;
    dpDay   = next.getUTCDate();
  }

  // ── 연주·월주: 만세력 테이블 기반 절기 판단 ──────────────────
  const { monthBranch, sajuYear } = getMonthBranchAndSajuYear(year, month, day, hour, minute);

  const yp = calcYearPillar(sajuYear);
  const mp = calcMonthPillar(yp.stemIndex, monthBranch);
  const dp = calcDayPillar(dpYear, dpMonth, dpDay);

  // 야자시 23시 이후: 시주는 다음날 일간 기준으로 계산
  let hpDayStemIdx = dp.stemIndex;
  if (jajasi === '야자시' && hour >= 23) {
    const next = new Date(Date.UTC(dpYear, dpMonth - 1, dpDay + 1));
    const nextDp = calcDayPillar(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
    hpDayStemIdx = nextDp.stemIndex;
  }

  const hp = calcHourPillar(hpDayStemIdx, hour, minute);

  const dmIdx = dp.stemIndex;
  const withSipShin = (p: Omit<Pillar,'sipShin'>, isSelf = false): Pillar => ({
    ...p,
    sipShin: isSelf ? undefined : getSipShin(dmIdx, p.stemIndex),
  });

  // 오행 집계 (천간 4 + 지지 4 = 8자)
  const count: Record<string, number> = { 木:0, 火:0, 土:0, 金:0, 水:0 };
  for (const p of [yp, mp, dp, hp]) {
    count[ELEMENTS[STEM_EL[p.stemIndex]]]++;
    count[ELEMENTS[BRANCH_EL[p.branchIndex]]]++;
  }
  const entries  = Object.entries(count);
  const dominant = entries.reduce((a, b) => b[1] > a[1] ? b : a)[0];
  const lacking  = entries.reduce((a, b) => b[1] < a[1] ? b : a)[0];

  const daeun = calcDaeun(dp, mp, yp, dpYear, dpMonth, dpDay, gender);

  return {
    year:  withSipShin(yp),
    month: withSipShin(mp),
    day:   withSipShin(dp, true),
    hour:  withSipShin(hp),
    dayMaster: {
      stemIndex: dmIdx,
      stemKr:    STEMS_KR[dmIdx],
      elementKr: ELEMENTS_KR[STEM_EL[dmIdx]],
      yinYang:   dmIdx % 2 === 0 ? '양' : '음',
    },
    elementCount:    count,
    dominantElement: dominant,
    lackingElement:  lacking,
    zodiacAnimal:    ZODIAC_ANIMAL_KR[yp.branchIndex],
    daeun,
    input: { year, month, day, hour, minute, jajasi },
  };
}

// ─── 2-12. 십이운성 (十二運星) ───────────────────────────────

export const UNSUNG_NAMES = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'] as const;

// 양간의 장생 지지 인덱스: 甲→亥(11), 丙→寅(2), 戊→寅(2), 庚→巳(5), 壬→申(8)
const YANG_BIRTH_BRANCH = [11, 0, 2, 0, 2, 0, 5, 0, 8, 0] as const;
// 음간의 장생 지지 인덱스: 乙→午(6), 丁→酉(9), 己→酉(9), 辛→子(0), 癸→卯(3)
const YIN_BIRTH_BRANCH  = [0, 6, 0, 9, 0, 9, 0, 0, 0, 3] as const;

/**
 * 십이운성 계산 (일간 기준)
 * @param dayStemIdx 일간 천간 인덱스 (0=甲 … 9=癸)
 * @param branchIdx  대상 지지 인덱스 (0=子 … 11=亥)
 */
export function calc12Unsung(dayStemIdx: number, branchIdx: number): string {
  if (dayStemIdx % 2 === 0) {
    return UNSUNG_NAMES[modN(branchIdx - YANG_BIRTH_BRANCH[dayStemIdx], 12)];
  } else {
    return UNSUNG_NAMES[modN(YIN_BIRTH_BRANCH[dayStemIdx] - branchIdx, 12)];
  }
}

// ─── 2-13. 신살 / 귀인 계산 ──────────────────────────────────

export interface SinSal {
  name: string;
  nameEn: string;
  emoji: string;
  present: boolean;
  pillars: string[];       // 어느 기둥 지지에 존재하는지
  shortDesc: string;
  shortDescEn: string;
}

// 천을귀인 지지 (일간 인덱스 → 귀인 지지 인덱스 배열)
// 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 辛→寅午, 壬癸→卯巳
const CHEONUL_BRANCHES: readonly (readonly number[])[] = [
  [1, 7],   // 甲(0) → 丑(1), 未(7)
  [0, 8],   // 乙(1) → 子(0), 申(8)
  [11, 9],  // 丙(2) → 亥(11), 酉(9)
  [11, 9],  // 丁(3) → 亥(11), 酉(9)
  [1, 7],   // 戊(4) → 丑(1), 未(7)
  [0, 8],   // 己(5) → 子(0), 申(8)
  [1, 7],   // 庚(6) → 丑(1), 未(7)
  [2, 6],   // 辛(7) → 寅(2), 午(6)
  [3, 5],   // 壬(8) → 卯(3), 巳(5)
  [3, 5],   // 癸(9) → 卯(3), 巳(5)
] as const;

// 문창귀인 지지 (일간 인덱스 → 지지 인덱스)
// 甲→巳, 乙→午, 丙→申, 丁→酉, 戊→申, 己→酉, 庚→亥, 辛→子, 壬→寅, 癸→卯
const MUNCHANG_BRANCH: readonly number[] = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3] as const;

// 삼합 그룹별 [역마, 도화, 화개] 지지 인덱스
// 寅午戌(2,6,10) → 申(8), 卯(3), 戌(10)
// 巳酉丑(5,9,1)  → 亥(11), 午(6), 丑(1)
// 申子辰(8,0,4)  → 寅(2), 酉(9), 辰(4)
// 亥卯未(11,3,7) → 巳(5), 子(0), 未(7)
const SAMHAP_SAL: Readonly<Record<number, readonly [number, number, number]>> = {
  2:  [8, 3, 10],  6:  [8, 3, 10],  10: [8, 3, 10],
  5:  [11, 6, 1],  9:  [11, 6, 1],  1:  [11, 6, 1],
  8:  [2, 9, 4],   0:  [2, 9, 4],   4:  [2, 9, 4],
  11: [5, 0, 7],   3:  [5, 0, 7],   7:  [5, 0, 7],
};

const SINSAL_PILLAR_KR = ['연지', '월지', '시지'];

/**
 * 일주 기준 주요 신살·귀인 계산
 * 천을귀인·문창귀인은 일간, 역마·도화·화개는 일지 삼합 그룹 기준
 */
export function calcSinSal(saju: SajuResult): SinSal[] {
  const dmIdx = saju.day.stemIndex;
  const dayBi = saju.day.branchIndex;
  const others = [saju.year.branchIndex, saju.month.branchIndex, saju.hour.branchIndex];

  const findPillars = (targets: readonly number[]): string[] =>
    others.flatMap((bi, i) => targets.includes(bi) ? [SINSAL_PILLAR_KR[i]] : []);

  const cheonulPillars  = findPillars(CHEONUL_BRANCHES[dmIdx] ?? []);
  const munchangPillars = findPillars([MUNCHANG_BRANCH[dmIdx]]);
  const salGroup = SAMHAP_SAL[dayBi];
  const yukmaPillars  = salGroup ? findPillars([salGroup[0]]) : [];
  const dokhwaPillars = salGroup ? findPillars([salGroup[1]]) : [];
  const hwagaePillars = salGroup ? findPillars([salGroup[2]]) : [];

  return [
    {
      name: '천을귀인', nameEn: 'Sky Guardian', emoji: '⭐',
      present: cheonulPillars.length > 0, pillars: cheonulPillars,
      shortDesc: '사주 최고의 길성! 힘들 때 귀인(귀한 사람)이 나타나 도와주는 하늘의 수호천사입니다.',
      shortDescEn: 'The luckiest star in BaZi! A guardian who sends noble helpers to your side when you need them most.',
    },
    {
      name: '문창귀인', nameEn: 'Scholar Star', emoji: '📚',
      present: munchangPillars.length > 0, pillars: munchangPillars,
      shortDesc: '총명함의 별! 학문·시험·자격증에 강하고, 글과 말로 빛나는 지적 재능을 타고났습니다.',
      shortDescEn: 'Star of brilliance! Strong in academics, exams, and certifications — naturally gifted with words and intellect.',
    },
    {
      name: '역마살', nameEn: 'Travel Star', emoji: '🌏',
      present: yukmaPillars.length > 0, pillars: yukmaPillars,
      shortDesc: '떠돌이 팔자! 이사·여행·해외·출장이 잦습니다. 움직일수록 운이 열리는 역동적인 기질입니다.',
      shortDescEn: 'Born to roam! Frequent moves, travel, and overseas activity. This dynamic energy unlocks luck on the go.',
    },
    {
      name: '도화살', nameEn: 'Peach Blossom', emoji: '🌸',
      present: dokhwaPillars.length > 0, pillars: dokhwaPillars,
      shortDesc: '매력 폭발! 이성을 끌어당기는 자연스러운 매력이 있고, 예술·미적 감각도 탁월합니다. (양날의 검!)',
      shortDescEn: 'Magnetic charm! Natural pull for romance, beauty, and the arts. A double-edged star — alluring but intense.',
    },
    {
      name: '화개살', nameEn: 'Mystic Star', emoji: '🎨',
      present: hwagaePillars.length > 0, pillars: hwagaePillars,
      shortDesc: '고독한 예술가 기질! 철학·종교·예술에 깊이 이끌리며, 혼자 있는 시간에 재충전하는 타입입니다.',
      shortDescEn: 'Solitary artist soul! Drawn to philosophy, spirituality, and art — recharges in solitude.',
    },
  ];
}

// ─── 2-14. 오늘의 사주 운세 ──────────────────────────────────

const SAJU_TODAY_FORTUNE: Record<string, { keyword: string; keywordEn: string; summary: string; summaryEn: string }> = {
  비견: { keyword: '자립',   keywordEn: 'Independence', summary: '자신감이 넘치고 독립적인 행동이 빛나는 날입니다. 새로운 시작을 두려워하지 마세요.', summaryEn: 'Confidence shines and independent action is at its best today. Don\'t be afraid to start something new.' },
  겁재: { keyword: '경쟁',   keywordEn: 'Competition',  summary: '경쟁과 갈등 상황에 주의가 필요합니다. 충동적 결정보다 신중함이 필요한 날입니다.', summaryEn: 'Be cautious of competitive or conflicting situations. This is a day for careful consideration rather than impulsive choices.' },
  식신: { keyword: '즐거움', keywordEn: 'Joy',           summary: '창의력과 여유가 넘치는 하루입니다. 좋아하는 것을 즐기고 맛있는 것을 드세요.', summaryEn: 'A day overflowing with creativity and ease. Enjoy what you love and treat yourself well.' },
  상관: { keyword: '표현',   keywordEn: 'Expression',   summary: '자기표현 욕구가 강한 날입니다. 말 한마디가 관계를 좌우할 수 있으니 신중히 하세요.', summaryEn: 'Your desire for self-expression is strong today. A single word can shape a relationship, so choose your words with care.' },
  편재: { keyword: '기회',   keywordEn: 'Opportunity',  summary: '뜻밖의 기회나 수입이 찾아올 수 있습니다. 능동적으로 움직이면 좋은 결과가 따릅니다.', summaryEn: 'Unexpected opportunities or income may arise. Taking active steps will lead to positive results.' },
  정재: { keyword: '안정',   keywordEn: 'Stability',    summary: '꾸준한 노력이 결실을 맺는 날입니다. 재물과 관련된 안정적인 성과를 기대해 보세요.', summaryEn: 'A day when steady effort bears fruit. Expect stable gains in financial or material matters.' },
  편관: { keyword: '긴장',   keywordEn: 'Tension',      summary: '예상치 못한 압박이 찾아올 수 있습니다. 건강 관리와 스트레스 해소에 신경 쓰세요.', summaryEn: 'Unexpected pressure may arrive. Pay attention to your health and find ways to relieve stress.' },
  정관: { keyword: '질서',   keywordEn: 'Order',        summary: '원칙과 신뢰가 중요한 날입니다. 공식적인 자리나 업무에서 좋은 인상을 줄 수 있어요.', summaryEn: 'Principles and trust are key today. You can make a strong impression in official settings or at work.' },
  편인: { keyword: '직관',   keywordEn: 'Intuition',    summary: '직관과 영감이 풍부한 날입니다. 혼자만의 시간을 가지며 아이디어를 정리해 보세요.', summaryEn: 'Intuition and inspiration are rich today. Take time alone to gather and refine your ideas.' },
  정인: { keyword: '배움',   keywordEn: 'Learning',     summary: '학습과 지혜가 빛나는 날입니다. 새로운 지식을 받아들이거나 조언을 구하면 도움이 됩니다.', summaryEn: 'Knowledge and wisdom shine today. Accepting new information or seeking advice will be beneficial.' },
};

export function calcTodaySajuFortune(saju: SajuResult, lmtOffsetMin: number = 0, dayOffset: number = 0): {
  keyword: string; keywordEn: string;
  summary: string; summaryEn: string;
  todayStem: string; todayBranch: string;
  todayStemKr: string; todayBranchKr: string;
  sipShin: string; sipShinEn: string;
} {
  const now = new Date();
  // 출생지 LMT 기준으로 오늘 일진 결정: UTC + (9*60 + lmtOffsetMin)분 + dayOffset일
  const lmt = new Date(now.getTime() + (9 * 60 + lmtOffsetMin) * 60 * 1000 + dayOffset * 24 * 60 * 60 * 1000);
  const todayPillar = calcDayPillar(lmt.getUTCFullYear(), lmt.getUTCMonth() + 1, lmt.getUTCDate());
  const sipShin = getSipShin(saju.dayMaster.stemIndex, todayPillar.stemIndex);
  const fortune = SAJU_TODAY_FORTUNE[sipShin] ?? { keyword: '평온', keywordEn: 'Calm', summary: '평범하지만 안정적인 하루입니다.', summaryEn: 'An ordinary but stable day.' };
  return {
    ...fortune,
    sipShin,
    sipShinEn: SIP_SHIN_EN_MAP[sipShin] ?? sipShin,
    todayStem:    todayPillar.stem,
    todayBranch:  todayPillar.branch,
    todayStemKr:  todayPillar.stemKr,
    todayBranchKr: todayPillar.branchKr,
  };
}

// ─── 오늘의 서양 점성학 운세 ─────────────────────────────────

const WESTERN_TODAY_FORTUNE: Record<number, { keyword: string; keywordEn: string; summary: string; summaryEn: string }> = {
  0:  { keyword: '공명',   keywordEn: 'Resonance',    summary: '달이 태어날 때와 같은 자리입니다. 내면이 편안하고 감정이 선명하게 느껴지는 날입니다.', summaryEn: 'The moon aligns with your birth position. Your inner world feels peaceful and emotions are crystal clear.' },
  1:  { keyword: '설렘',   keywordEn: 'Anticipation', summary: '새로운 감정의 흐름이 시작됩니다. 주변 변화에 유연하게 반응하면 좋은 날입니다.', summaryEn: 'A new flow of feeling begins. A good day to respond flexibly to changes around you.' },
  2:  { keyword: '소통',   keywordEn: 'Connection',   summary: '활발한 소통과 정보 교류가 이루어지는 날입니다. 대화를 통해 좋은 아이디어가 나올 수 있어요.', summaryEn: 'A day of lively communication and exchange of ideas. Great ideas can emerge through conversation.' },
  3:  { keyword: '성장',   keywordEn: 'Growth',       summary: '감정적 에너지가 충만한 날입니다. 중요한 결정보다 내면의 소리에 귀 기울여 보세요.', summaryEn: 'Emotional energy is abundant today. Rather than major decisions, listen to your inner voice.' },
  4:  { keyword: '조화',   keywordEn: 'Harmony',      summary: '감정과 현실이 조화를 이루는 날입니다. 창의적 표현이 빛을 발합니다.', summaryEn: 'Emotions and reality come into balance. Creative expression shines.' },
  5:  { keyword: '성찰',   keywordEn: 'Reflection',   summary: '조용히 돌아보는 시간이 필요한 날입니다. 완성에 가까워지는 느낌을 받을 수 있어요.', summaryEn: 'A day calling for quiet contemplation. You may feel yourself drawing closer to completion.' },
  6:  { keyword: '전환',   keywordEn: 'Transition',   summary: '감정적 전환점이 찾아오는 날입니다. 오래된 패턴을 내려놓을 좋은 기회입니다.', summaryEn: 'An emotional turning point arrives. A great chance to release old patterns.' },
  7:  { keyword: '해소',   keywordEn: 'Release',      summary: '내면의 긴장이 서서히 풀리는 날입니다. 내가 원하는 것이 무엇인지 선명해집니다.', summaryEn: 'Inner tension gradually eases today. What you truly want becomes clearer.' },
  8:  { keyword: '재충전', keywordEn: 'Recharge',     summary: '에너지를 재충전하고 새로운 방향을 모색하기 좋은 날입니다.', summaryEn: 'A good day to restore your energy and explore new directions.' },
  9:  { keyword: '직관',   keywordEn: 'Intuition',    summary: '직관과 통찰이 날카로워지는 날입니다. 느낌을 믿고 행동해 보세요.', summaryEn: 'Intuition and insight are sharp today. Trust your instincts and act on them.' },
  10: { keyword: '유연',   keywordEn: 'Flexibility',  summary: '유연한 사고와 감정 조절이 돋보이는 날입니다. 다양한 관점을 수용해 보세요.', summaryEn: 'Flexible thinking and emotional balance stand out. Try embracing diverse perspectives.' },
  11: { keyword: '마무리', keywordEn: 'Closure',      summary: '한 사이클이 마무리되는 시점입니다. 감사와 정리로 다음을 준비하세요.', summaryEn: 'A cycle is coming to its end. Prepare for what\'s next with gratitude and a clear mind.' },
};

export function calcTodayWesternFortune(western: WesternChartResult, dayOffset: number = 0): {
  keyword: string; keywordEn: string;
  summary: string; summaryEn: string;
  todayMoonSign: string; todayMoonSignEn: string;
  sunSign: string; sunSignEn: string;
  moonSunDiff: number;
} {
  const ZODIAC_SIGNS_KR_LIST = ['양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리',
    '천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리'];
  const now = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
  const JD = julianDay(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes());
  const T  = (JD - 2451545.0) / 36525;
  const todayMoonSignIdx  = Math.floor(moonLongitude(T) / 30) % 12;
  // 오늘 달 vs 출생 태양 별자리 기준 (별자리 운세는 태양 기준)
  const natalSunSignIdx = western.planets['sun']?.signIndex ?? 0;
  const diff = modN(todayMoonSignIdx - natalSunSignIdx, 12);
  const fortune = WESTERN_TODAY_FORTUNE[diff] ?? { keyword: '평온', keywordEn: 'Calm', summary: '감정적으로 안정적인 하루를 보낼 수 있습니다.', summaryEn: 'You can have a day of emotional stability.' };
  return {
    ...fortune,
    todayMoonSign:   ZODIAC_SIGNS_KR_LIST[todayMoonSignIdx],
    todayMoonSignEn: ZODIAC_SIGNS_EN[todayMoonSignIdx],
    sunSign:    western.planets['sun']?.sign    ?? '',
    sunSignEn:  western.planets['sun']?.signEn  ?? '',
    moonSunDiff: diff,
  };
}

// ─── 통합 오늘의 운세 ─────────────────────────────────────────

// 사주 십신 점수: 吉(2) / 중(1) / 평(0) / 흉(-1)
const SIPSHIN_SCORE: Record<string, number> = {
  '식신': 2, '정재': 2, '정인': 2,
  '비견': 1, '정관': 1, '편재': 1,
  '겁재': 0, '상관': 0, '편인': 0,
  '편관': -1,
};
// 서양 달-태양 거리 점수 (0~11)
const MOON_SUN_SCORE = [2, 1, 2, 1, 2, 0, -1, 0, 0, 2, 1, 0];

const UNIFIED_TABLE: Record<number, { keyword: string; keywordEn: string; advice: string; adviceEn: string }> = {
  4:  { keyword: '대길(大吉)', keywordEn: 'Great Fortune',    advice: '사주와 별자리 모두 오늘을 강하게 지지합니다. 중요한 결정이나 새로운 시작에 최적의 날입니다. 평소 미뤄두었던 일을 과감히 실행하세요.', adviceEn: 'Both BaZi and astrology strongly support today. An ideal day for important decisions or new beginnings. Act boldly on what you\'ve been putting off.' },
  3:  { keyword: '길(吉)',    keywordEn: 'Fortune',           advice: '두 흐름이 조화롭게 맞물립니다. 계획한 일을 실행에 옮기기 좋고, 사람과의 만남에서도 긍정적인 에너지가 오갑니다.', adviceEn: 'Both streams align harmoniously. A great time to execute your plans, and positive energy flows in your connections with others.' },
  2:  { keyword: '소길(小吉)', keywordEn: 'Moderate Fortune', advice: '전반적으로 순탄한 흐름입니다. 한 쪽이 힘을 보태고 있으니 무리하지 않고 꾸준히 나아가면 좋은 결과가 따릅니다.', adviceEn: 'The flow is generally smooth. One stream lends its strength, so moving steadily without overexerting will bring good results.' },
  1:  { keyword: '평길(平吉)', keywordEn: 'Gentle Fortune',   advice: '크게 나쁘지 않은 하루입니다. 작은 일부터 차근차근 처리하며 긍정적인 흐름을 유지하세요.', adviceEn: 'Not a particularly bad day. Tackle small tasks one by one and keep a positive momentum.' },
  0:  { keyword: '평(平)',    keywordEn: 'Neutral',           advice: '사주와 별자리 모두 중립적인 에너지입니다. 평소 루틴을 지키며 내면을 돌보는 하루를 보내세요.', adviceEn: 'Both BaZi and astrology carry neutral energy. Stick to your routine and spend the day nurturing your inner self.' },
  [-1]: { keyword: '소주의', keywordEn: 'Minor Caution',     advice: '한쪽에서 긴장이 감지됩니다. 신중하게 행동하고 중요한 결정은 내일로 미루는 것이 좋습니다.', adviceEn: 'Tension is detected on one side. Act carefully and consider postponing important decisions until tomorrow.' },
  [-2]: { keyword: '신중',   keywordEn: 'Caution',           advice: '두 흐름 모두 도전적인 에너지입니다. 오늘은 현상 유지에 집중하고 새로운 시도는 삼가세요. 충분한 휴식이 최선입니다.', adviceEn: 'Both streams carry challenging energy. Focus on maintaining the status quo and avoid new ventures today. Ample rest is the best choice.' },
};

export function calcUnifiedFortune(
  saju: SajuResult,
  western: WesternChartResult,
  lmtOffsetMin: number = 0,
): {
  keyword: string; keywordEn: string;
  advice: string;  adviceEn: string;
  score: number;
  sajuToday: ReturnType<typeof calcTodaySajuFortune>;
  westernToday: ReturnType<typeof calcTodayWesternFortune>;
} {
  const sajuToday    = calcTodaySajuFortune(saju, lmtOffsetMin);
  const westernToday = calcTodayWesternFortune(western);
  const score = Math.min(2, Math.max(-1, SIPSHIN_SCORE[sajuToday.sipShin] ?? 0))
              + Math.min(2, Math.max(-1, MOON_SUN_SCORE[westernToday.moonSunDiff] ?? 0));
  const { keyword, keywordEn, advice, adviceEn } = UNIFIED_TABLE[score] ?? UNIFIED_TABLE[0];
  return { keyword, keywordEn, advice, adviceEn, score, sajuToday, westernToday };
}
