// =============================================================
// test.ts — Beginner-friendly test of the full synthesis flow
// =============================================================
// Run this file with:
//   npx ts-node src/lib/synthesis/test.ts
//
// It will print two complete readings side by side:
//   one in Korean, one in English.

import { synthesize } from './synthesis';
import type { BirthInfo, ContentContext, SynthesisResult } from './types';

// ─────────────────────────────────────────────
// INPUTS
// ─────────────────────────────────────────────

// Input 1 — Korean user
const inputKo: BirthInfo = {
  year: 1990, month: 5, day: 10,
  hour: 8, minute: 30,
  timezone: 'Asia/Seoul',
  language: 'ko',               // ← tells the system: produce Korean text
};

// Input 2 — English user (same birth data, different language)
const inputEn: BirthInfo = {
  year: 1990, month: 5, day: 10,
  hour: 8, minute: 30,
  timezone: 'Asia/Seoul',
  language: 'en',               // ← tells the system: produce English text
};

// ─────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────

const resultKo = synthesize(inputKo);
const resultEn = synthesize(inputEn);

// ─────────────────────────────────────────────
// PRINT HELPERS
// ─────────────────────────────────────────────

function printDivider(title: string) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function printDimensions(result: SynthesisResult) {
  // Sort dimensions high → low for easy reading
  const sorted = Object.entries(result.dimensions)
    .sort((a, b) => b[1] - a[1]);

  console.log('\n📊 DIMENSIONS (shared — same for both languages)');
  sorted.forEach(([key, val]) => {
    const bar = '█'.repeat(Math.round(val / 10));
    const label = key.padEnd(22);
    console.log(`   ${label} ${bar.padEnd(10)} ${val}`);
  });

  console.log(`\n   Overall score : ${result.overallScore}`);
  console.log(`   Energy level  : ${val(result.overallScore)}`);
}

function val(score: number): string {
  if (score >= 65) return 'high';
  if (score >= 45) return 'mid';
  return 'low';
}

function printInterpretation(result: SynthesisResult) {
  const i = result.interpretation;
  console.log(`\n🌐 LANGUAGE: ${i.language.toUpperCase()}`);
  console.log('\n① Summary');
  console.log(`   ${i.summary}`);
  console.log('\n② Core personality');
  console.log(`   ${i.corePersonality}`);
  console.log('\n③ Work style');
  console.log(`   ${i.workStyle}`);
  console.log('\n④ Relationship style');
  console.log(`   ${i.relationshipStyle}`);
  console.log('\n⑤ Practical advice');
  console.log(`   ${i.practicalAdvice}`);
}

// ─────────────────────────────────────────────
// OUTPUT
// ─────────────────────────────────────────────

printDivider('STEP 1 — SHARED MEANING (runs once for both languages)');

// The dimensions are identical for both results because they come
// from the same birth data. Language does not affect this step.
console.log('\nBoth inputs share the same birth date → same dimension scores.');
printDimensions(resultKo);  // same as resultEn.dimensions

printDivider('STEP 2 + 3 — LANGUAGE-SPECIFIC WORDING (Korean)');
console.log('\nThe Korean renderer receives the same ContentContext');
console.log('and writes natural Korean from scratch.');
printInterpretation(resultKo);

printDivider('STEP 2 + 3 — LANGUAGE-SPECIFIC WORDING (English)');
console.log('\nThe English renderer receives the exact same ContentContext');
console.log('and writes natural English from scratch — NOT a translation.');
printInterpretation(resultEn);

printDivider('HOW THE FLOW WORKS');
console.log(`
  Your birth data
       │
       ▼
  ┌──────────────────────────────────────┐
  │  Layer 1 · buildContext()            │
  │  "What does this chart say?"         │
  │                                      │
  │  → archetype   : ${resultKo.sajuScore.pillars.day.element.padEnd(10)}        │
  │  → dominant    : ${Object.entries(resultKo.dimensions).sort((a,b)=>b[1]-a[1])[0][0].padEnd(22)}│
  │  → weakest     : ${Object.entries(resultKo.dimensions).sort((a,b)=>a[1]-b[1])[0][0].padEnd(22)}│
  │  → energyLevel : ${val(resultKo.overallScore).padEnd(10)}        │
  │                                      │
  │  ← NO language here. Just meaning.  │
  └──────────────────────────────────────┘
       │
       ├── language = "ko" ──► KO[archetype]()
       │                       Korean writer gets labels in Korean
       │                       Writes from scratch in natural Korean
       │
       └── language = "en" ──► EN[archetype]()
                               English writer gets labels in English
                               Writes from scratch in natural English
`);
