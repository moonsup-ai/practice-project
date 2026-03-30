// =============================================================
// interpretation.ts — Turns dimension scores into human-readable text
// =============================================================
// HOW IT WORKS (for beginners):
//   1. Look at the blended dimensions (6 numbers, 0–100 each)
//   2. Find the strongest dimension → this is the person's "archetype"
//   3. Find the second-strongest → adds nuance to the description
//   4. Find the weakest → used in the practical advice as a growth area
//   5. Pick the matching template for that archetype + language
//
// WHERE MULTILINGUAL HANDLING HAPPENS:
//   - Every template object has a "ko" key and an "en" key.
//   - We select the right one using the `lang` parameter.
//   - Korean is written to feel natural for a Korean app (not translated English).
//   - English is written to feel like a premium global astrology product.

import type { Dimensions, Interpretation, Lang } from './types';

// -------------------------------------------------------
// Archetype names
// -------------------------------------------------------
// Each dominant dimension maps to a personality archetype.
// These are used internally to pick the right template.

type Archetype =
  | 'expressive'   // creativity is highest
  | 'analytical'   // analysis is highest
  | 'responsible'  // responsibility is highest
  | 'empathic'     // emotional_sensitivity is highest
  | 'expansive'    // expansion is highest
  | 'structured';  // structure is highest

const DIMENSION_TO_ARCHETYPE: Record<keyof Dimensions, Archetype> = {
  creativity:            'expressive',
  analysis:              'analytical',
  responsibility:        'responsible',
  emotional_sensitivity: 'empathic',
  expansion:             'expansive',
  structure:             'structured',
};

// -------------------------------------------------------
// Bilingual label maps
// -------------------------------------------------------
// Used to insert dimension names naturally into sentences.
// NOTE: Korean labels are phrased as noun phrases that fit
// inside a sentence, not just direct translations.

const DIM_LABEL: Record<keyof Dimensions, Record<Lang, string>> = {
  creativity:            { ko: '창의적 표현력', en: 'creative expression' },
  analysis:              { ko: '분석적 사고력', en: 'analytical thinking' },
  responsibility:        { ko: '책임감',        en: 'sense of responsibility' },
  emotional_sensitivity: { ko: '감수성',        en: 'emotional sensitivity' },
  expansion:             { ko: '확장 에너지',   en: 'expansive energy' },
  structure:             { ko: '체계적인 면',   en: 'structured discipline' },
};

// -------------------------------------------------------
// Templates
// -------------------------------------------------------
// Each archetype has 5 sections × 2 languages.
// The function receives `strong` and `weak` dimension labels
// that get inserted into the template strings.
//
// Writing guidelines followed here:
//   Korean — conversational, warm, modern app tone (SNS/lifestyle)
//   English — clear, confident, slightly elevated (premium product)

type TemplateFields = {
  summary:             Record<Lang, string>;
  corePersonality:     Record<Lang, (strong: string, weak: string) => string>;
  workStyle:           Record<Lang, (strong: string) => string>;
  relationshipStyle:   Record<Lang, (strong: string) => string>;
  practicalAdvice:     Record<Lang, (weak: string) => string>;
};

const TEMPLATES: Record<Archetype, TemplateFields> = {

  // ----------------------------------------------------------
  expressive: {
    summary: {
      ko: '오늘은 표현의 기운이 가장 강하게 흐르는 날입니다. 당신 안의 창의적 불꽃을 믿어도 좋을 때입니다.',
      en: 'Creative energy peaks today. Trust the impulses that feel bold or original — they\'re pointing somewhere real.',
    },
    corePersonality: {
      ko: (strong, weak) =>
        `사주와 별자리 모두에서 ${strong}이 두드러집니다. ` +
        `새로운 것을 만들고 자신을 드러내는 일에서 가장 살아있는 느낌을 받는 타입입니다. ` +
        `다만 ${weak} 쪽은 상대적으로 약하니, 에너지가 넘칠 때일수록 현실 감각을 챙기면 좋습니다.`,
      en: (strong, weak) =>
        `Both your Saju and Western chart highlight ${strong} as a defining trait. ` +
        `You come alive through making, performing, or sharing ideas — originality is your native language. ` +
        `${weak} is a quieter area for you, so pair your bursts of inspiration with a dose of grounding.`,
    },
    workStyle: {
      ko: (strong) =>
        `업무에서는 ${strong}이 강점으로 작용합니다. ` +
        `새로운 접근법이나 아이디어를 제안하는 역할에서 두각을 나타냅니다. ` +
        `반복적인 루틴보다는 자유롭게 사고할 수 있는 환경에서 성과가 높습니다.`,
      en: (strong) =>
        `At work, ${strong} is your edge. ` +
        `You generate ideas quickly and bring energy to creative projects that others find draining. ` +
        `You do your best thinking outside rigid structures — give yourself room to experiment.`,
    },
    relationshipStyle: {
      ko: (strong) =>
        `관계에서는 ${strong}으로 상대방에게 신선한 자극을 줍니다. ` +
        `재미있고 활기찬 에너지로 주변 사람들을 끌어당기는 편입니다. ` +
        `가끔 깊이보다 폭을 선택하는 경향이 있으니, 중요한 관계에는 시간을 충분히 투자하세요.`,
      en: (strong) =>
        `In relationships, your ${strong} makes you magnetic and fun to be around. ` +
        `People are drawn to your enthusiasm and originality. ` +
        `Watch for a tendency to pursue breadth over depth — your closest bonds deserve sustained attention.`,
    },
    practicalAdvice: {
      ko: (weak) =>
        `오늘은 ${weak}이 약한 편이니, 중요한 분석이나 세부 결정은 내일로 미루는 것이 좋습니다. ` +
        `아이디어는 오늘 쏟아내고, 다듬는 작업은 에너지가 균형 잡힌 날로 잡아두세요.`,
      en: (weak) =>
        `${weak} is low today — avoid making detailed or analytical decisions right now. ` +
        `Use this peak creative window to generate, brainstorm, or start something new. Refine it later.`,
    },
  },

  // ----------------------------------------------------------
  analytical: {
    summary: {
      ko: '오늘은 논리와 분석의 에너지가 강하게 흐릅니다. 복잡한 문제를 다루기에 좋은 날입니다.',
      en: 'Your analytical mind is sharp today. Complex problems, careful decisions, and strategic thinking are all favoured.',
    },
    corePersonality: {
      ko: (strong, weak) =>
        `사주의 水 기운과 서양 점성학의 Air 에너지가 맞물려 ${strong}이 핵심 강점으로 나타납니다. ` +
        `상황을 구조적으로 파악하고, 감정보다 데이터를 신뢰하는 편입니다. ` +
        `${weak}이 낮은 편이니, 논리 뒤에 숨어 감정 표현을 미루는 습관을 주의하세요.`,
      en: (strong, weak) =>
        `Water (Saju) and Air (Western) energies combine to make ${strong} your defining strength. ` +
        `You naturally break situations down into components and prefer evidence to intuition. ` +
        `${weak} is a quieter area — be mindful of using analysis as a way to avoid emotional engagement.`,
    },
    workStyle: {
      ko: (strong) =>
        `일할 때는 ${strong}을 무기로 삼습니다. ` +
        `리서치, 기획, 문제 해결처럼 깊이 있는 사고가 필요한 업무에서 강점을 발휘합니다. ` +
        `빠른 의사결정보다 철저한 검토를 선호하기 때문에 팀에서 신중한 목소리 역할을 합니다.`,
      en: (strong) =>
        `${strong} is your professional superpower. ` +
        `You excel at research, planning, and any work that rewards careful, methodical thinking. ` +
        `Teams value you as the voice of reason — the person who actually read the fine print.`,
    },
    relationshipStyle: {
      ko: (strong) =>
        `관계에서는 말보다 행동으로 신뢰를 쌓는 타입입니다. ` +
        `${strong}으로 상대방의 문제를 함께 풀어주는 데서 애정을 표현합니다. ` +
        `감정을 직접 드러내는 것이 어색할 수 있으니, 때로는 "그냥 들어줘"를 연습해 보세요.`,
      en: (strong) =>
        `You show love through ${strong} — solving problems, offering well-thought-out advice, being reliable. ` +
        `Emotional expression can feel less natural; make space to simply listen without fixing.`,
    },
    practicalAdvice: {
      ko: (weak) =>
        `오늘은 ${weak}이 상대적으로 약합니다. 감정적 결정이나 즉흥적인 행동은 잠시 내려놓고, ` +
        `분석 능력이 빛을 발할 수 있는 구체적인 과제에 집중하세요.`,
      en: (weak) =>
        `${weak} is low today — sidestep impulsive or emotionally-driven choices. ` +
        `Channel your sharp focus into a problem that actually deserves it.`,
    },
  },

  // ----------------------------------------------------------
  responsible: {
    summary: {
      ko: '책임과 신뢰의 에너지가 오늘을 이끕니다. 당신이 맡은 일을 묵묵히 해낼 때 가장 빛나는 날입니다.',
      en: 'Reliability and follow-through define the energy today. The work you show up for will quietly compound.',
    },
    corePersonality: {
      ko: (strong, weak) =>
        `사주의 土·金 기운과 서양 점성학의 Earth 에너지가 결합해 ${strong}이 핵심 축을 이룹니다. ` +
        `한 번 한 약속은 끝까지 지키고, 타인에게 기댈 수 있는 든든한 존재입니다. ` +
        `${weak}이 낮다는 건 모험보다 안정을 선호한다는 뜻이기도 합니다—이 성향을 이해하고 균형을 맞춰가세요.`,
      en: (strong, weak) =>
        `Earth and Metal energies in both your Saju and Western chart make ${strong} a cornerstone of your identity. ` +
        `You are the person people lean on — steady, trustworthy, and thorough. ` +
        `${weak} tends to run lower; you may resist risk or novelty more than most, which is worth noticing.`,
    },
    workStyle: {
      ko: (strong) =>
        `일에서 ${strong}은 당신의 가장 큰 경쟁력입니다. ` +
        `마감을 지키고, 품질을 유지하고, 팀이 의지할 수 있는 사람으로 평가받습니다. ` +
        `때로는 혼자 다 짊어지려는 경향이 생기니, 위임하는 연습도 필요합니다.`,
      en: (strong) =>
        `${strong} is your professional reputation. ` +
        `You deliver, you follow through, and teams build timelines around your reliability. ` +
        `Watch for a tendency to absorb too much responsibility — delegating is also a skill.`,
    },
    relationshipStyle: {
      ko: (strong) =>
        `관계에서 ${strong}은 장기적인 신뢰로 나타납니다. ` +
        `화려한 제스처보다 꾸준한 존재감으로 사랑을 표현합니다. ` +
        `상대방이 이 방식을 알아봐 주지 않을 때 서운함이 쌓일 수 있으니, 필요한 것을 직접 표현하는 연습을 해보세요.`,
      en: (strong) =>
        `In relationships, ${strong} shows up as consistent presence rather than grand gestures. ` +
        `You are the one who remembers, shows up, and stays. ` +
        `Resentment can build quietly when this goes unnoticed — practise saying what you need out loud.`,
    },
    practicalAdvice: {
      ko: (weak) =>
        `${weak}이 약한 오늘, 새로운 도전보다는 이미 진행 중인 일을 완성하는 데 에너지를 쓰세요. ` +
        `완료된 항목 하나가 오늘 하루를 충분히 의미 있게 만들 것입니다.`,
      en: (weak) =>
        `${weak} is low today — this isn't the day to start something new. ` +
        `Finish one thing already in progress and let that be enough.`,
    },
  },

  // ----------------------------------------------------------
  empathic: {
    summary: {
      ko: '감수성과 직관의 기운이 오늘 가장 선명합니다. 당신의 느낌은 지금 꽤 정확한 나침반입니다.',
      en: 'Emotional intuition is heightened today. Your instincts are picking up on things logic alone would miss.',
    },
    corePersonality: {
      ko: (strong, weak) =>
        `사주의 水 기운과 서양 점성학의 Water 별자리 에너지가 만나 ${strong}이 깊게 발달해 있습니다. ` +
        `상대의 감정을 빠르게 감지하고, 분위기 전체를 읽는 능력이 뛰어납니다. ` +
        `${weak}이 약한 편이라 가끔 감정에 압도되거나 경계를 설정하는 데 어려움을 느낄 수 있습니다.`,
      en: (strong, weak) =>
        `Water energies in both Saju and your Western chart make ${strong} your most developed trait. ` +
        `You read rooms, feel undercurrents, and often know something is off before anyone says so. ` +
        `${weak} runs lower — you may find it harder to establish clear personal limits.`,
    },
    workStyle: {
      ko: (strong) =>
        `${strong}을 활용해 팀의 분위기를 살피고 갈등을 미리 완화하는 역할을 자연스럽게 맡습니다. ` +
        `사람과의 협업, 인터뷰, 상담, 콘텐츠처럼 사람 이해가 핵심인 분야에서 특히 빛을 발합니다. ` +
        `감정 소진을 막기 위해 일과 후 혼자만의 회복 시간을 꼭 챙기세요.`,
      en: (strong) =>
        `${strong} makes you naturally suited for people-centred work — collaboration, listening, interpreting needs. ` +
        `You defuse tension before it becomes conflict, often without being asked. ` +
        `Build in recovery time after high-contact days; you process more than most.`,
    },
    relationshipStyle: {
      ko: (strong) =>
        `관계에서 ${strong}은 상대방이 말하지 않아도 느끼게 해주는 힘으로 나타납니다. ` +
        `깊은 연결을 원하고 표면적인 관계에 쉽게 지칩니다. ` +
        `감정을 너무 많이 흡수하지 않도록, 이따금 자신의 경계선을 점검해 보세요.`,
      en: (strong) =>
        `Your ${strong} makes others feel genuinely seen and understood — a rare gift. ` +
        `You crave depth and grow bored with surface-level connection. ` +
        `Be careful about absorbing others\' emotional weight as though it were your own.`,
    },
    practicalAdvice: {
      ko: (weak) =>
        `오늘은 ${weak}이 약해 논리적 판단보다 직관이 더 앞서나갈 수 있습니다. ` +
        `중요한 결정은 감정이 가라앉은 후 다시 검토하고, 지금은 마음이 시키는 창의적인 일에 시간을 써보세요.`,
      en: (weak) =>
        `${weak} is low today — logic may feel harder than usual to access. ` +
        `Defer high-stakes decisions and use this window for reflective, creative, or restorative activities.`,
    },
  },

  // ----------------------------------------------------------
  expansive: {
    summary: {
      ko: '성장과 도전의 기운이 오늘 가장 강하게 흐릅니다. 익숙한 경계 너머를 향해 한 발 내딛기 좋은 날입니다.',
      en: 'Growth energy is strong today. Step toward something that stretches you — conditions support bold moves.',
    },
    corePersonality: {
      ko: (strong, weak) =>
        `사주의 木 기운과 서양 점성학의 Fire 별자리 에너지가 결합해 ${strong}이 뚜렷하게 나타납니다. ` +
        `새로운 가능성을 향해 나아가는 것이 당신에게 가장 자연스러운 모습입니다. ` +
        `${weak}이 낮은 편이라, 열정이 앞서 디테일이 빠질 때가 있으니 마무리에 신경 쓰세요.`,
      en: (strong, weak) =>
        `Wood (Saju) and Fire (Western) energies power your ${strong}. ` +
        `You are drawn toward growth, possibility, and experience — standing still feels like falling behind. ` +
        `${weak} tends to lag; enthusiasm can outpace follow-through, so build finishing into your plans.`,
    },
    workStyle: {
      ko: (strong) =>
        `${strong}을 바탕으로 새로운 프로젝트를 시작하거나 큰 그림을 그리는 일에서 두각을 나타냅니다. ` +
        `변화를 두려워하지 않고 팀에 활력을 불어넣는 역할을 합니다. ` +
        `장기 실행력을 강화하면 아이디어가 더 큰 결과로 이어질 수 있습니다.`,
      en: (strong) =>
        `${strong} makes you a natural at launching things — new projects, new directions, new ideas. ` +
        `You energise teams and push past inertia. ` +
        `Pair your vision with a system for seeing things through; that\'s where lasting impact lives.`,
    },
    relationshipStyle: {
      ko: (strong) =>
        `관계에서 ${strong}은 상대에게 새로운 경험과 자극을 선물하는 방식으로 나타납니다. ` +
        `함께 있으면 세상이 넓어지는 느낌을 주는 사람입니다. ` +
        `자유로운 에너지가 상대방을 불안하게 만들 수 있으니, 안정과 모험을 균형 있게 조절해 보세요.`,
      en: (strong) =>
        `Your ${strong} makes relationships feel alive and forward-moving. ` +
        `You introduce people to new ideas, places, and versions of themselves. ` +
        `Balance this with reassurance — not everyone moves at your pace.`,
    },
    practicalAdvice: {
      ko: (weak) =>
        `${weak}이 약한 오늘, 즉흥적인 결정보다는 하나의 목표에 집중하세요. ` +
        `이미 시작한 것 중 하나를 마무리하는 것이 오늘 에너지를 가장 잘 쓰는 방법입니다.`,
      en: (weak) =>
        `${weak} is low today — resist the urge to scatter energy across too many ideas. ` +
        `Pick one direction and go all in; completion matters more than exploration right now.`,
    },
  },

  // ----------------------------------------------------------
  structured: {
    summary: {
      ko: '오늘은 체계와 질서의 에너지가 강합니다. 계획을 세우고 실행하기에 더없이 좋은 날입니다.',
      en: 'Order and precision are your allies today. Systems, plans, and careful execution all have tailwinds.',
    },
    corePersonality: {
      ko: (strong, weak) =>
        `사주의 金·土 기운과 서양 점성학의 Earth 에너지가 맞물려 ${strong}이 성격의 중심을 이룹니다. ` +
        `명확한 규칙과 질서 속에서 최고의 퍼포먼스를 발휘합니다. ` +
        `${weak}이 낮은 편이라 예상치 못한 변화에 쉽게 흔들릴 수 있으니, 유연성을 의도적으로 키우면 좋습니다.`,
      en: (strong, weak) =>
        `Metal and Earth energies from both systems make ${strong} the backbone of your personality. ` +
        `You perform best when there is clarity — clear roles, clear goals, clear expectations. ` +
        `${weak} is a growth edge; unexpected change can destabilise you more than most, so practise adapting in low-stakes situations.`,
    },
    workStyle: {
      ko: (strong) =>
        `${strong}을 바탕으로 복잡한 프로젝트를 정리하고 효율적으로 실행하는 능력이 뛰어납니다. ` +
        `계획 수립, 프로세스 개선, 품질 관리처럼 정밀함이 요구되는 역할에서 강점이 빛납니다. ` +
        `지나친 완벽주의가 속도를 늦출 때가 있으니, "충분히 좋은" 기준도 설정해 두세요.`,
      en: (strong) =>
        `${strong} makes you exceptional at organising complexity and executing with precision. ` +
        `Process design, quality control, detailed planning — these are where you thrive. ` +
        `Perfectionism can be a bottleneck; define "good enough" so projects actually ship.`,
    },
    relationshipStyle: {
      ko: (strong) =>
        `관계에서 ${strong}은 믿을 수 있는 일관성으로 나타납니다. ` +
        `약속을 지키고 기대치를 명확히 하는 데 익숙하며, 관계에 안정감을 줍니다. ` +
        `상대방의 감정이나 즉흥성을 답답하게 느낄 수 있으니, 가끔은 계획 없이 흘러가는 시간도 허용해 보세요.`,
      en: (strong) =>
        `Your ${strong} gives relationships a sense of safety and predictability — people know where they stand with you. ` +
        `You set clear expectations and keep your word. ` +
        `Try to make room for spontaneity; not everything needs a plan to be worthwhile.`,
    },
    practicalAdvice: {
      ko: (weak) =>
        `${weak}이 낮은 오늘, 새로운 아이디어를 억지로 짜내기보다는 이미 계획된 것을 실행하는 데 집중하세요. ` +
        `구조적인 작업—리스트 정리, 프로세스 문서화, 목표 점검—이 오늘 에너지와 가장 잘 맞습니다.`,
      en: (weak) =>
        `${weak} is low today — skip brainstorming and go straight to execution. ` +
        `Structured tasks like organising, documenting, or reviewing progress will feel natural and productive.`,
    },
  },
};

// -------------------------------------------------------
// Helper: find top-N dimensions from a Dimensions object
// -------------------------------------------------------

function rankDimensions(dims: Dimensions): Array<keyof Dimensions> {
  return (Object.entries(dims) as [keyof Dimensions, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}

// -------------------------------------------------------
// Public API
// -------------------------------------------------------

/**
 * Build the full Interpretation from blended dimension scores.
 *
 * @param dims   The blended (Saju + Western) dimension scores
 * @param lang   "ko" or "en" — set by the user on the entry screen
 *
 * Usage:
 *   import { buildInterpretation } from '@/lib/synthesis/interpretation';
 *   const interp = buildInterpretation(result.dimensions, 'en');
 */
export function buildInterpretation(dims: Dimensions, lang: Lang): Interpretation {
  const ranked = rankDimensions(dims);

  // The dominant dimension determines the archetype template we use.
  const dominantDim  = ranked[0];
  const archetype    = DIMENSION_TO_ARCHETYPE[dominantDim];

  // The second dimension adds nuance when mentioned inside templates.
  // The weakest dimension shows up as the growth area in practical advice.
  const secondDim = ranked[1];
  const weakestDim = ranked[ranked.length - 1];

  // Labels for the current language — these get inserted into template strings.
  const strongLabel = DIM_LABEL[secondDim][lang];   // secondary strength
  const weakLabel   = DIM_LABEL[weakestDim][lang];  // growth area

  // ← MULTILINGUAL: every .ko / .en branch below is where language diverges.
  const tmpl = TEMPLATES[archetype];

  return {
    language: lang,
    // ← MULTILINGUAL: direct string lookup
    summary: tmpl.summary[lang],
    // ← MULTILINGUAL: function call returns a string in the selected language
    corePersonality:   tmpl.corePersonality[lang](DIM_LABEL[dominantDim][lang], weakLabel),
    workStyle:         tmpl.workStyle[lang](DIM_LABEL[dominantDim][lang]),
    relationshipStyle: tmpl.relationshipStyle[lang](strongLabel),
    practicalAdvice:   tmpl.practicalAdvice[lang](weakLabel),
  };
}
