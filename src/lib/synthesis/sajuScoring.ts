// =============================================================
// sajuScoring.ts — Scores the 6 dimensions from Saju (BaZi) signals
// =============================================================
// The main idea:
//   Each of the Five Elements maps strongly to certain dimensions.
//   We count how many pillars carry each element, then convert
//   that count into a 0–100 score per dimension.
//
// Five Elements → Dimension mapping (the "why" is in each rule):
//   火 Fire   → creativity, expansion
//   水 Water  → analysis, emotional_sensitivity
//   木 Wood   → expansion, creativity
//   金 Metal  → structure, analysis
//   土 Earth  → responsibility, structure

import type { BirthInfo, Pillar, Dimensions, SajuScore } from './types';

// -------------------------------------------------------
// Static lookup tables
// -------------------------------------------------------

/** Maps each Heavenly Stem to its Five-Element */
const STEM_ELEMENT: Record<string, string> = {
  '甲': 'Wood',  '乙': 'Wood',
  '丙': 'Fire',  '丁': 'Fire',
  '戊': 'Earth', '己': 'Earth',
  '庚': 'Metal', '辛': 'Metal',
  '壬': 'Water', '癸': 'Water',
};

const STEMS    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// -------------------------------------------------------
// Pillar helpers (same simplified math as before)
// -------------------------------------------------------

function stemFromOffset(n: number)   { return STEMS  [((n % 10) + 10) % 10]; }
function branchFromOffset(n: number) { return BRANCHES[((n % 12) + 12) % 12]; }

function makePillar(stem: string, branch: string): Pillar {
  return { stem, branch, element: STEM_ELEMENT[stem] ?? 'Unknown' };
}

function calcPillars(b: BirthInfo) {
  const yearOff  = b.year - 1900;
  const monthOff = b.month - 1;
  const dayOff   = Math.floor((b.year * 365.25 + b.month * 30 + b.day) / 60);
  const hourOff  = Math.floor(b.hour / 2);
  return {
    year:  makePillar(stemFromOffset(yearOff),  branchFromOffset(yearOff)),
    month: makePillar(stemFromOffset(monthOff), branchFromOffset(monthOff)),
    day:   makePillar(stemFromOffset(dayOff),   branchFromOffset(dayOff)),
    hour:  makePillar(stemFromOffset(hourOff),  branchFromOffset(hourOff)),
  };
}

// -------------------------------------------------------
// Element counter
// -------------------------------------------------------

/**
 * Count how many of the 4 pillars carry each element.
 * Returns a map like { Fire: 2, Water: 1, Wood: 1, Metal: 0, Earth: 0 }.
 */
function countElements(pillars: ReturnType<typeof calcPillars>): Record<string, number> {
  const counts: Record<string, number> = {
    Fire: 0, Water: 0, Wood: 0, Metal: 0, Earth: 0,
  };
  for (const p of Object.values(pillars)) {
    if (p.element in counts) counts[p.element]++;
  }
  return counts;
}

// -------------------------------------------------------
// Convert an element count (0–4) to a 0–100 score
// -------------------------------------------------------
// We use a simple linear scale:
//   0 pillars = base score of 20  (element is absent, but not zero)
//   4 pillars = max score of 100  (element dominates the chart)
// Base of 20 prevents any dimension from ever hitting zero.

function countToScore(count: number): number {
  return 20 + count * 20; // 0→20, 1→40, 2→60, 3→80, 4→100
}

// -------------------------------------------------------
// Dimension scoring rules
// -------------------------------------------------------
// Each rule explains WHY a particular element affects a dimension.

function calcDimensions(pillars: ReturnType<typeof calcPillars>): Dimensions {
  const el = countElements(pillars);

  return {
    // CREATIVITY
    // Fire (丙丁) = outward expression, passion, brightness → primary driver
    // Wood (甲乙) = growth and originality → secondary driver
    // We average both so neither alone dominates.
    creativity: Math.round(
      countToScore(el.Fire) * 0.6 +
      countToScore(el.Wood) * 0.4
    ),

    // ANALYSIS
    // Water (壬癸) = deep thinking, intelligence, strategy → primary
    // Metal (庚辛) = precision, cutting through noise → secondary
    analysis: Math.round(
      countToScore(el.Water) * 0.6 +
      countToScore(el.Metal) * 0.4
    ),

    // RESPONSIBILITY
    // Earth (戊己) = groundedness, keeping promises, loyalty → primary
    // Metal (庚辛) = rule-following, discipline → secondary
    responsibility: Math.round(
      countToScore(el.Earth) * 0.6 +
      countToScore(el.Metal) * 0.4
    ),

    // EMOTIONAL SENSITIVITY
    // Water (壬癸) = emotions, intuition, feeling others' moods → primary
    // Wood (甲乙) = empathy and care (nurturing energy) → small secondary
    emotional_sensitivity: Math.round(
      countToScore(el.Water) * 0.7 +
      countToScore(el.Wood)  * 0.3
    ),

    // EXPANSION
    // Wood (甲乙) = upward growth, optimism, new beginnings → primary
    // Fire (丙丁) = boldness and taking risks → secondary
    expansion: Math.round(
      countToScore(el.Wood) * 0.6 +
      countToScore(el.Fire) * 0.4
    ),

    // STRUCTURE
    // Metal (庚辛) = sharp edges, systems, organisation → primary
    // Earth (戊己) = stability, routine, discipline → secondary
    structure: Math.round(
      countToScore(el.Metal) * 0.6 +
      countToScore(el.Earth) * 0.4
    ),
  };
}

// -------------------------------------------------------
// Summary helper
// -------------------------------------------------------

function makeSummary(dims: Dimensions): string {
  // Find the strongest dimension to mention in the summary
  const entries = Object.entries(dims) as [keyof Dimensions, number][];
  const [topKey] = entries.sort((a, b) => b[1] - a[1])[0];
  const labels: Record<keyof Dimensions, string> = {
    creativity: 'creativity',
    analysis: 'analytical thinking',
    responsibility: 'a sense of responsibility',
    emotional_sensitivity: 'emotional sensitivity',
    expansion: 'an expansive outlook',
    structure: 'structured discipline',
  };
  return `Your Four Pillars highlight ${labels[topKey]} as your strongest energy today.`;
}

// -------------------------------------------------------
// Public API
// -------------------------------------------------------

export function calcSajuScore(birth: BirthInfo): SajuScore {
  const pillars    = calcPillars(birth);
  const dimensions = calcDimensions(pillars);
  const summary    = makeSummary(dimensions);
  return { pillars, dimensions, summary };
}
