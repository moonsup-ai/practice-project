// =============================================================
// sampleData.ts — Sample birth data for testing and demos
// =============================================================
// Import these in tests or a demo page to try the synthesis
// without needing a real form submission.

import type { BirthInfo } from './types';

// -------------------------------------------------------
// Sample birth records
// -------------------------------------------------------

/** A person born in spring — Wood-heavy Saju, Taurus Sun */
export const SAMPLE_SPRING: BirthInfo = {
  year: 1990,
  month: 5,   // May
  day: 10,
  hour: 8,
  minute: 30,
  timezone: 'Asia/Seoul',
  language: 'ko',            // Korean user
};

/** A person born in mid-winter — Water/Metal-heavy Saju, Capricorn Sun */
export const SAMPLE_WINTER: BirthInfo = {
  year: 1985,
  month: 1,   // January
  day: 5,
  hour: 23,
  minute: 0,
  timezone: 'America/New_York',
  language: 'en',            // English user
};

/** A person born at midsummer — Fire-heavy Saju, Leo Sun */
export const SAMPLE_SUMMER: BirthInfo = {
  year: 2000,
  month: 8,   // August
  day: 15,
  hour: 12,
  minute: 0,
  timezone: 'Europe/London',
  language: 'en',            // English user
};

// -------------------------------------------------------
// Quick smoke-test (run with: npx ts-node sampleData.ts)
// -------------------------------------------------------

// Uncomment the block below to test from the command line:
//
// import { synthesize } from './synthesis';
// const result = synthesize(SAMPLE_SPRING);
// console.log('Overall score :', result.overallScore);
// console.log('Keyword       :', result.keyword);
// console.log('Advice        :', result.advice);
// console.log('Saju summary  :', result.sajuScore.summary);
// console.log('Western summary:', result.westernScore.summary);
