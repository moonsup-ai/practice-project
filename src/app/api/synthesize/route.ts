// =============================================================
// route.ts — API route: POST /api/synthesize
// =============================================================
// This is Option B (server-side).
// The browser sends birth data + language → we return the reading.
//
// When to use this instead of calling synthesize() directly:
//   • When you add an AI layer (e.g. rewrite advice with Claude)
//   • When you want to log or store readings server-side
//   • When the synthesis becomes too heavy for the browser
//
// For the current app (fully client-side), Option A below is simpler.

import { NextRequest, NextResponse } from 'next/server';
import { synthesize } from '@/lib/synthesis/synthesis';
import type { BirthInfo } from '@/lib/synthesis/types';

// -------------------------------------------------------
// POST /api/synthesize
// -------------------------------------------------------
// Expected request body (JSON):
// {
//   "year": 1990, "month": 5, "day": 10,
//   "hour": 8,   "minute": 30,
//   "timezone": "Asia/Seoul",
//   "language": "ko"          ← comes from the user's language choice
// }

export async function POST(req: NextRequest) {
  // 1. Parse the request body
  const body = await req.json();

  // 2. Basic validation — make sure required fields are present
  const required = ['year', 'month', 'day', 'hour', 'minute', 'timezone', 'language'];
  for (const field of required) {
    if (body[field] === undefined) {
      return NextResponse.json(
        { error: `Missing field: ${field}` },
        { status: 400 }
      );
    }
  }

  // 3. Make sure language is one of the supported values
  if (body.language !== 'ko' && body.language !== 'en') {
    return NextResponse.json(
      { error: 'language must be "ko" or "en"' },
      { status: 400 }
    );
  }

  // 4. Build the BirthInfo object
  const birth: BirthInfo = {
    year:     Number(body.year),
    month:    Number(body.month),
    day:      Number(body.day),
    hour:     Number(body.hour),
    minute:   Number(body.minute),
    timezone: String(body.timezone),
    language: body.language,   // ← language flows straight through to synthesize()
  };

  // 5. Run the synthesis
  const result = synthesize(birth);

  // 6. Return the full result as JSON
  return NextResponse.json(result);
}
