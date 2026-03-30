// =============================================================
// synthesis.ts — Blends Saju + Western dimensions into one reading
// =============================================================
// Flow:
//   1. Get Saju dimensions  (from sajuScoring.ts)
//   2. Get Western dimensions (from westernScoring.ts)
//   3. Blend them with weights  (Saju 50% / Western 50% by default)
//   4. Average all 6 dimensions → overallScore
//   5. Map overallScore → keyword + advice

import type { BirthInfo, Dimensions, SynthesisResult } from './types';
import { calcSajuScore }      from './sajuScoring';
import { calcWesternScore }   from './westernScoring';
import { buildInterpretation } from './interpretation';

// -------------------------------------------------------
// Blend weights
// -------------------------------------------------------
// How much each system contributes to the final dimensions.
// Must add up to 1.0.
// Change these if you want one system to dominate more.

const SAJU_WEIGHT    = 0.5;
const WESTERN_WEIGHT = 0.5;

// -------------------------------------------------------
// Blend two Dimension objects
// -------------------------------------------------------
// Goes through each of the 6 dimensions and does a weighted average.

function blendDimensions(saju: Dimensions, western: Dimensions): Dimensions {
  // Helper: round a weighted average of two values
  const avg = (a: number, b: number) =>
    Math.round(a * SAJU_WEIGHT + b * WESTERN_WEIGHT);

  return {
    creativity:           avg(saju.creativity,           western.creativity),
    analysis:             avg(saju.analysis,             western.analysis),
    responsibility:       avg(saju.responsibility,       western.responsibility),
    emotional_sensitivity:avg(saju.emotional_sensitivity,western.emotional_sensitivity),
    expansion:            avg(saju.expansion,            western.expansion),
    structure:            avg(saju.structure,            western.structure),
  };
}

// -------------------------------------------------------
// Overall score = simple average of all 6 dimensions
// -------------------------------------------------------

function calcOverallScore(dims: Dimensions): number {
  const values = Object.values(dims);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

// -------------------------------------------------------
// Keyword table
// -------------------------------------------------------
// Maps an overall score to a one-word day descriptor.

function scoreToKeyword(score: number): string {
  if (score >= 80) return 'Radiant';
  if (score >= 65) return 'Flowing';
  if (score >= 50) return 'Stable';
  if (score >= 35) return 'Cautious';
  return 'Challenging';
}

// -------------------------------------------------------
// Advice templates
// -------------------------------------------------------
// The advice also mentions which dimension is highest today,
// so the user gets a personalised hint, not just a generic line.

function buildAdvice(keyword: string, dims: Dimensions): string {
  // Find the strongest and weakest dimension
  const entries = Object.entries(dims) as [keyof Dimensions, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const [strongest] = entries[0];
  const [weakest]   = entries[entries.length - 1];

  const strengthLabels: Record<keyof Dimensions, string> = {
    creativity:            'creative energy',
    analysis:              'analytical clarity',
    responsibility:        'sense of duty',
    emotional_sensitivity: 'emotional awareness',
    expansion:             'expansive optimism',
    structure:             'structured discipline',
  };

  const openings: Record<string, string> = {
    Radiant:
      `Conditions are excellent today. Lean into your ${strengthLabels[strongest]} — ` +
      `both the Saju and Western chart agree this energy is at its peak.`,
    Flowing:
      `A positive current runs through the day. Your ${strengthLabels[strongest]} is ` +
      `heightened — use it to make steady, confident progress.`,
    Stable:
      `Balanced but unremarkable energy. Routine tasks suit the day well. ` +
      `Your ${strengthLabels[strongest]} is your quiet asset right now.`,
    Cautious:
      `Mixed signals today. Your ${strengthLabels[weakest]} is under strain — ` +
      `avoid over-committing in that area and lean on your ${strengthLabels[strongest]} instead.`,
    Challenging:
      `Both systems flag friction. Rest and reflect rather than force outcomes. ` +
      `Conserve your ${strengthLabels[strongest]} for when the cycle turns.`,
  };

  return openings[keyword] ?? 'Stay grounded and take things one step at a time today.';
}

// -------------------------------------------------------
// Public API
// -------------------------------------------------------

/**
 * Generate the full unified reading.
 *
 * Usage:
 *   import { synthesize } from '@/lib/synthesis/synthesis';
 *   const result = synthesize(birthInfo);
 *   console.log(result.dimensions.creativity); // 0–100
 *   console.log(result.keyword);               // e.g. "Flowing"
 */
export function synthesize(birth: BirthInfo): SynthesisResult {
  const sajuScore    = calcSajuScore(birth);
  const westernScore = calcWesternScore(birth);

  const dimensions   = blendDimensions(sajuScore.dimensions, westernScore.dimensions);
  const overallScore = calcOverallScore(dimensions);
  const keyword      = scoreToKeyword(overallScore);
  const advice       = buildAdvice(keyword, dimensions);

  // ← MULTILINGUAL: language comes from the user's input, defaults to "ko"
  const lang           = birth.language ?? 'ko';
  const interpretation = buildInterpretation(dimensions, lang);

  return { sajuScore, westernScore, dimensions, overallScore, keyword, advice, interpretation };
}
