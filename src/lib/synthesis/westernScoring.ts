// =============================================================
// westernScoring.ts — Scores the 6 dimensions from Western astrology
// =============================================================
// The main idea:
//   Each zodiac sign belongs to one of four elements.
//   Sun, Moon, and Ascendant signs each contribute to the dimensions,
//   but with different weights — Sun matters most, Moon for emotions,
//   Ascendant for how you present to the world.
//
// Element → Dimension mapping (the "why" is in each rule):
//   Fire signs  (Aries/Leo/Sagittarius) → creativity, expansion
//   Air signs   (Gemini/Libra/Aquarius) → analysis, creativity
//   Water signs (Cancer/Scorpio/Pisces) → emotional_sensitivity, analysis
//   Earth signs (Taurus/Virgo/Capricorn)→ responsibility, structure

import type { BirthInfo, PlanetPosition, Dimensions, WesternScore } from './types';

// -------------------------------------------------------
// Static lookup tables
// -------------------------------------------------------

/** Zodiac sign → elemental group */
const SIGN_ELEMENT: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer',
  'Leo','Virgo','Libra','Scorpio',
  'Sagittarius','Capricorn','Aquarius','Pisces',
];

// -------------------------------------------------------
// Approximate sign helpers (same simplified math as before)
// -------------------------------------------------------

function approxSunSign(month: number, day: number): string {
  const cutoffs: [number, number, string][] = [
    [3,21,'Aries'],[4,20,'Taurus'],[5,21,'Gemini'],[6,21,'Cancer'],
    [7,23,'Leo'],[8,23,'Virgo'],[9,23,'Libra'],[10,23,'Scorpio'],
    [11,22,'Sagittarius'],[12,22,'Capricorn'],[1,20,'Aquarius'],[2,19,'Pisces'],
  ];
  for (let i = cutoffs.length - 1; i >= 0; i--) {
    const [cm, cd, sign] = cutoffs[i];
    if (month > cm || (month === cm && day >= cd)) return sign;
  }
  return 'Pisces';
}

function approxMoonSign(year: number, month: number, day: number): string {
  const refDays  = (year - 2000) * 365.25 + month * 30.44 + day;
  const signIdx  = Math.floor((refDays % (27.3 * 12)) / 27.3);
  return SIGNS[((signIdx % 12) + 12) % 12];
}

function approxAscendant(hour: number): string {
  return SIGNS[Math.floor(hour / 2) % 12];
}

function makePlanet(name: string, sign: string, degree: number): PlanetPosition {
  return { name, sign, degree, isRetrograde: false };
}

// -------------------------------------------------------
// Convert an element presence to a 0–100 score
// -------------------------------------------------------
// Simple: if the sign belongs to the element → 80, otherwise → 20.
// We use 20 as the floor (not 0) so no dimension collapses entirely.

function elementScore(sign: string, targetElement: string): number {
  return SIGN_ELEMENT[sign] === targetElement ? 80 : 20;
}

// -------------------------------------------------------
// Dimension scoring rules
// -------------------------------------------------------
// Sun  weight = 0.5  (core identity — strongest influence)
// Moon weight = 0.3  (emotional nature — important for inner life)
// ASC  weight = 0.2  (surface presentation — least stable, changes every 2h)

function calcDimensions(sunSign: string, moonSign: string, ascSign: string): Dimensions {
  // Helper: weighted blend of three signals
  function blend(sunVal: number, moonVal: number, ascVal: number): number {
    return Math.round(sunVal * 0.5 + moonVal * 0.3 + ascVal * 0.2);
  }

  return {
    // CREATIVITY
    // Fire signs = bold self-expression → primary
    // Air signs  = intellectual originality → secondary
    // We take whichever score is higher for each placement.
    creativity: blend(
      Math.max(elementScore(sunSign, 'Fire'), elementScore(sunSign, 'Air') * 0.7),
      Math.max(elementScore(moonSign,'Fire'), elementScore(moonSign,'Air') * 0.7),
      Math.max(elementScore(ascSign, 'Fire'), elementScore(ascSign, 'Air') * 0.7),
    ),

    // ANALYSIS
    // Air signs  = logical, communicative → primary
    // Water signs = intuitive pattern recognition → secondary
    analysis: blend(
      Math.max(elementScore(sunSign, 'Air'),   elementScore(sunSign, 'Water') * 0.7),
      Math.max(elementScore(moonSign,'Air'),   elementScore(moonSign,'Water') * 0.7),
      Math.max(elementScore(ascSign, 'Air'),   elementScore(ascSign, 'Water') * 0.7),
    ),

    // RESPONSIBILITY
    // Earth signs = steady, reliable, dutiful → primary driver
    // Moon in Earth = strong habit of follow-through
    responsibility: blend(
      elementScore(sunSign,  'Earth'),
      elementScore(moonSign, 'Earth'),
      elementScore(ascSign,  'Earth'),
    ),

    // EMOTIONAL SENSITIVITY
    // Water signs = empathy, intuition, deep feelings → primary
    // Moon is the most important placement for emotional life
    // so we give it extra weight by swapping Sun and Moon weights
    emotional_sensitivity: blend(
      elementScore(moonSign, 'Water'), // ← Moon as "Sun" slot (most important for emotions)
      elementScore(sunSign,  'Water'), // ← Sun as "Moon" slot
      elementScore(ascSign,  'Water'),
    ),

    // EXPANSION
    // Fire signs = adventurous, optimistic, future-oriented → primary
    // A little Air also expands thinking (curiosity = expansion)
    expansion: blend(
      Math.max(elementScore(sunSign, 'Fire'), elementScore(sunSign, 'Air') * 0.6),
      Math.max(elementScore(moonSign,'Fire'), elementScore(moonSign,'Air') * 0.6),
      Math.max(elementScore(ascSign, 'Fire'), elementScore(ascSign, 'Air') * 0.6),
    ),

    // STRUCTURE
    // Earth signs = systematic, organised, rule-following → primary
    // Water signs add a small contribution (intuitive structure / routines)
    structure: blend(
      Math.max(elementScore(sunSign, 'Earth'), elementScore(sunSign, 'Water') * 0.5),
      Math.max(elementScore(moonSign,'Earth'), elementScore(moonSign,'Water') * 0.5),
      Math.max(elementScore(ascSign, 'Earth'), elementScore(ascSign, 'Water') * 0.5),
    ),
  };
}

// -------------------------------------------------------
// Summary helper
// -------------------------------------------------------

function makeSummary(sunSign: string, dims: Dimensions): string {
  const entries = Object.entries(dims) as [keyof Dimensions, number][];
  const [topKey] = entries.sort((a, b) => b[1] - a[1])[0];
  const labels: Record<keyof Dimensions, string> = {
    creativity: 'creative expression',
    analysis: 'sharp thinking',
    responsibility: 'dependability',
    emotional_sensitivity: 'emotional depth',
    expansion: 'bold optimism',
    structure: 'disciplined focus',
  };
  return `Your ${sunSign} Sun amplifies ${labels[topKey]} in today's chart.`;
}

// -------------------------------------------------------
// Public API
// -------------------------------------------------------

export function calcWesternScore(birth: BirthInfo): WesternScore {
  const sunSign  = approxSunSign(birth.month, birth.day);
  const moonSign = approxMoonSign(birth.year, birth.month, birth.day);
  const ascSign  = approxAscendant(birth.hour);

  const sun  = makePlanet('Sun',  sunSign,  birth.day % 30);
  const moon = makePlanet('Moon', moonSign, birth.day % 30);

  const dimensions = calcDimensions(sunSign, moonSign, ascSign);
  const summary    = makeSummary(sunSign, dimensions);

  return { sun, moon, ascendant: ascSign, dimensions, summary };
}
