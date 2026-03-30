'use client';

// =============================================================
// SynthesisExample.tsx — shows two ways to call synthesize()
// =============================================================
// This is a teaching component, not production UI.
// It demonstrates the two connection patterns side by side.
//
// OPTION A — call synthesize() directly in the browser (simple)
// OPTION B — call the API route (for server-side processing)
//
// In your current app, Option A is the right choice because
// the app has no server and everything runs in the browser.

import { useState } from 'react';
import { useLang } from '@/lib/lang';               // ← language is already here
import { synthesize } from '@/lib/synthesis/synthesis';
import type { BirthInfo, SynthesisResult } from '@/lib/synthesis/types';

// -------------------------------------------------------
// Shared: build a BirthInfo from URL search params
// -------------------------------------------------------
// Your ResultContent.tsx already reads these from the URL.
// This helper turns them into the shape synthesize() expects.

function buildBirthInfo(
  year: number, month: number, day: number,
  hour: number, minute: number,
  timezone: string,
  language: 'ko' | 'en'    // ← language is the only new field
): BirthInfo {
  return { year, month, day, hour, minute, timezone, language };
}

// ═══════════════════════════════════════════════════════
// OPTION A — Client-side (recommended for your current app)
// ═══════════════════════════════════════════════════════
// synthesize() runs entirely in the browser.
// Language comes from useLang() — no extra wiring needed.
//
// HOW THE LANGUAGE FLOWS:
//   useLang()       → lang = "ko" or "en"
//   buildBirthInfo  → passes lang into BirthInfo
//   synthesize()    → reads lang, picks the right renderer
//   result          → interpretation text is in the chosen language

export function OptionA_ClientSide() {
  const { lang } = useLang();  // ← reads the language the user already chose
  const [result, setResult] = useState<SynthesisResult | null>(null);

  function runSynthesis() {
    // In your real app these values come from URL search params,
    // exactly as ResultContent.tsx already reads them.
    const birth = buildBirthInfo(
      1990, 5, 10,    // year, month, day
      8, 30,          // hour, minute
      'Asia/Seoul',
      lang            // ← the only thing connecting language to synthesis
    );

    // synthesize() runs in the browser — no network request needed
    const reading = synthesize(birth);
    setResult(reading);
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
      <h2>Option A — Client-side</h2>
      <p>Current language from useLang(): <strong>{lang}</strong></p>
      <button onClick={runSynthesis}>Run synthesis</button>

      {result && (
        <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({
            language:     result.interpretation.language,
            overallScore: result.overallScore,
            keyword:      result.keyword,
            summary:      result.interpretation.summary,
            practicalAdvice: result.interpretation.practicalAdvice,
          }, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// OPTION B — API route (for when you want server-side)
// ═══════════════════════════════════════════════════════
// The browser sends birth data + language as a POST body.
// The server runs synthesize() and sends back the result.
//
// HOW THE LANGUAGE FLOWS:
//   useLang()     → lang = "ko" or "en"
//   fetch body    → { ...birthData, language: lang }
//   route.ts      → receives body, passes to synthesize()
//   response      → interpretation text in the chosen language

export function OptionB_ApiRoute() {
  const { lang } = useLang();  // ← same source — language comes from here
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSynthesis() {
    setLoading(true);
    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: 1990, month: 5, day: 10,
          hour: 8, minute: 30,
          timezone: 'Asia/Seoul',
          language: lang,   // ← language goes in the request body
        }),
      });

      const reading: SynthesisResult = await response.json();
      setResult(reading);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
      <h2>Option B — API route</h2>
      <p>Current language from useLang(): <strong>{lang}</strong></p>
      <button onClick={runSynthesis} disabled={loading}>
        {loading ? 'Loading...' : 'Run synthesis via API'}
      </button>

      {result && (
        <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({
            language:        result.interpretation.language,
            overallScore:    result.overallScore,
            keyword:         result.keyword,
            summary:         result.interpretation.summary,
            practicalAdvice: result.interpretation.practicalAdvice,
          }, null, 2)}
        </pre>
      )}
    </div>
  );
}
