// =============================================================
// types.ts — Shared types for Saju + Western astrology synthesis
// =============================================================
// All input and output shapes live here so the other files
// can import from one central place.

// -------------------------------------------------------
// LANGUAGE — supported output languages
// -------------------------------------------------------

/** "ko" = Korean, "en" = English */
export type Lang = 'ko' | 'en';

// -------------------------------------------------------
// INPUT — what the user provides
// -------------------------------------------------------

/** Birth info supplied by the user */
export interface BirthInfo {
  year: number;   // e.g. 1990
  month: number;  // 1–12
  day: number;    // 1–31
  hour: number;   // 0–23
  minute: number; // 0–59
  /** IANA timezone, e.g. "Asia/Seoul" */
  timezone: string;
  /**
   * Which language the user chose on the entry screen.
   * Defaults to "ko" if omitted.
   * All interpretation text in SynthesisResult will match this language.
   */
  language: Lang;
}

// -------------------------------------------------------
// INTERPRETATION — the human-readable reading
// -------------------------------------------------------
// This is the text layer on top of the dimension numbers.
// Every field is a natural-language sentence or paragraph.
// The language matches BirthInfo.language.

export interface Interpretation {
  /** Which language this interpretation is written in */
  language: Lang;
  /** One sentence capturing the overall energy of the day */
  summary: string;
  /** Who this person is at their core (2–3 sentences) */
  corePersonality: string;
  /** How they operate at work or on focused tasks (2–3 sentences) */
  workStyle: string;
  /** How they show up in relationships (2–3 sentences) */
  relationshipStyle: string;
  /** One specific, actionable suggestion for today */
  practicalAdvice: string;
}

// -------------------------------------------------------
// DIMENSIONS — the 6 personality/energy axes
// -------------------------------------------------------
// Each dimension is scored 0–100.
// Both Saju and Western astrology contribute to every dimension.
// The final score for each dimension is a weighted average of both.

export interface Dimensions {
  /**
   * CREATIVITY — originality, self-expression, artistic impulse.
   * Saju signal: Fire element (火) = brightness and expression.
   * Western signal: Fire signs (Aries/Leo/Sagittarius), Venus.
   */
  creativity: number;

  /**
   * ANALYSIS — logical thinking, pattern recognition, precision.
   * Saju signal: Water element (水) = depth and intelligence.
   * Western signal: Air signs (Gemini/Libra/Aquarius), Mercury.
   */
  analysis: number;

  /**
   * RESPONSIBILITY — reliability, duty, follow-through.
   * Saju signal: Earth element (土) = stability and commitment.
   * Western signal: Earth signs (Taurus/Virgo/Capricorn), Saturn.
   */
  responsibility: number;

  /**
   * EMOTIONAL_SENSITIVITY — empathy, intuition, mood awareness.
   * Saju signal: Water element (水) = emotional depth.
   * Western signal: Water signs (Cancer/Scorpio/Pisces), Moon sign.
   */
  emotional_sensitivity: number;

  /**
   * EXPANSION — growth mindset, optimism, taking risks.
   * Saju signal: Wood element (木) = upward growth.
   * Western signal: Fire signs, Jupiter energy.
   */
  expansion: number;

  /**
   * STRUCTURE — discipline, rule-following, organisation.
   * Saju signal: Metal element (金) = sharpness and order.
   * Western signal: Earth signs, Saturn, Capricorn/Virgo.
   */
  structure: number;
}

// -------------------------------------------------------
// SAJU (BaZi) — Four Pillars of Destiny
// -------------------------------------------------------

/** One pillar (year / month / day / hour) */
export interface Pillar {
  stem: string;    // Heavenly Stem, e.g. "甲"
  branch: string;  // Earthly Branch, e.g. "子"
  element: string; // Five-element of the stem, e.g. "Wood"
}

/** Result of analysing the Four Pillars */
export interface SajuScore {
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  /** Dimension scores derived from Saju signals only */
  dimensions: Dimensions;
  /** One-sentence summary for the user */
  summary: string;
}

// -------------------------------------------------------
// WESTERN — Natal chart
// -------------------------------------------------------

/** A planet's position in the natal chart */
export interface PlanetPosition {
  name: string;        // e.g. "Sun"
  sign: string;        // e.g. "Aries"
  degree: number;      // 0–29
  isRetrograde: boolean;
}

/** Result of analysing the Western natal chart */
export interface WesternScore {
  sun: PlanetPosition;
  moon: PlanetPosition;
  ascendant: string;   // Rising sign, e.g. "Scorpio"
  /** Dimension scores derived from Western signals only */
  dimensions: Dimensions;
  /** One-sentence summary for the user */
  summary: string;
}

// -------------------------------------------------------
// SYNTHESIS — merged result
// -------------------------------------------------------

/** Final unified reading shown to the user */
export interface SynthesisResult {
  sajuScore: SajuScore;
  westernScore: WesternScore;
  /**
   * The blended dimensions — Saju + Western averaged together.
   * This is what gets shown to the user.
   */
  dimensions: Dimensions;
  /**
   * Average of all 6 dimensions.
   * Gives a single "how good is today" number.  Range: 0–100.
   */
  overallScore: number;
  /** Short keyword describing the day's energy, e.g. "Growth" */
  keyword: string;
  /** Brief daily advice (one paragraph) */
  advice: string;
  /**
   * The full human-readable interpretation.
   * Language matches BirthInfo.language.
   */
  interpretation: Interpretation;
}
