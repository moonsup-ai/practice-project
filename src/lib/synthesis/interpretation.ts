// =============================================================
// interpretation.ts — Turns dimension scores into human-readable text
// =============================================================
//
// THREE-LAYER ARCHITECTURE
// ────────────────────────
//   Layer 1 · MEANING  buildContext(dims)
//             Computes what to say — archetype, strongest/weakest
//             dimensions, energy level. Runs once. No language here.
//
//   Layer 2 · PHRASING  renderKo(ctx) / renderEn(ctx)
//             Two completely independent writing functions.
//             Each receives the same ContentContext and returns
//             natural text in its own language.
//             Korean and English are NOT translations of each other —
//             they share the same meaning but are written from scratch
//             for each audience.
//
//   Layer 3 · ORCHESTRATION  buildInterpretation(dims, lang)
//             Calls Layer 1, then picks the right Layer 2 renderer.
//             This is the only place `lang` is inspected.
//
// HOW TO EDIT
// ───────────
//   • Change what the reading says → edit Layer 1 (ContentContext logic)
//   • Change how it sounds in Korean → edit renderKo() only
//   • Change how it sounds in English → edit renderEn() only
//   • Add a new language (e.g. "ja") → add renderJa() + wire it in Layer 3

import type { Dimensions, Interpretation, Lang } from './types';

// ─────────────────────────────────────────────
// ARCHETYPES
// ─────────────────────────────────────────────
// Each of the 6 dimensions has a corresponding archetype name.
// The archetype is used as the key into both language renderers.

type Archetype =
  | 'expressive'   // creativity dominant
  | 'analytical'   // analysis dominant
  | 'responsible'  // responsibility dominant
  | 'empathic'     // emotional_sensitivity dominant
  | 'expansive'    // expansion dominant
  | 'structured';  // structure dominant

const DIM_TO_ARCHETYPE: Record<keyof Dimensions, Archetype> = {
  creativity:            'expressive',
  analysis:              'analytical',
  responsibility:        'responsible',
  emotional_sensitivity: 'empathic',
  expansion:             'expansive',
  structure:             'structured',
};

// ─────────────────────────────────────────────
// LAYER 1 — MEANING (language-agnostic)
// ─────────────────────────────────────────────
// ContentContext is the single source of truth about what the
// reading should communicate. Both renderers receive this object.

type EnergyLevel = 'high' | 'mid' | 'low';

interface ContentContext {
  archetype:    Archetype;          // personality type for today
  dominant:     keyof Dimensions;   // highest-scoring dimension
  secondary:    keyof Dimensions;   // second-highest
  weakest:      keyof Dimensions;   // lowest-scoring dimension
  energyLevel:  EnergyLevel;        // overall score tier
}

/** Sort dimension keys highest → lowest */
function rankDims(dims: Dimensions): Array<keyof Dimensions> {
  return (Object.entries(dims) as [keyof Dimensions, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
}

/** Convert average dimension score to a three-tier label */
function toEnergyLevel(dims: Dimensions): EnergyLevel {
  const avg = Object.values(dims).reduce((s, v) => s + v, 0) / 6;
  if (avg >= 65) return 'high';
  if (avg >= 45) return 'mid';
  return 'low';
}

/** LAYER 1 entry point — call once, pass result to both renderers */
function buildContext(dims: Dimensions): ContentContext {
  const ranked = rankDims(dims);
  const dominant = ranked[0];
  return {
    archetype:   DIM_TO_ARCHETYPE[dominant],
    dominant,
    secondary:   ranked[1],
    weakest:     ranked[ranked.length - 1],
    energyLevel: toEnergyLevel(dims),
  };
}

// ─────────────────────────────────────────────
// LAYER 2 — PHRASING: KOREAN  renderKo()
// ─────────────────────────────────────────────
// Written to feel natural in a modern Korean lifestyle/wellness app.
// Tone: warm, direct, conversational — like a trusted friend
// who knows astrology. No stiff formality, no awkward English rhythm.
//
// Dimension labels in Korean — chosen to fit naturally mid-sentence.
const KO_LABEL: Record<keyof Dimensions, string> = {
  creativity:            '창의적 표현력',
  analysis:              '분석적 사고력',
  responsibility:        '책임감',
  emotional_sensitivity: '감수성',
  expansion:             '확장하는 에너지',
  structure:             '체계적인 성향',
};

// Each archetype has 5 writing functions.
// Functions receive (dominant label, secondary label, weakest label, energy level).
type KoRenderer = (d: string, s: string, w: string, e: EnergyLevel) => Omit<Interpretation, 'language'>;

const KO: Record<Archetype, KoRenderer> = {

  expressive: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? '오늘은 표현의 기운이 활짝 열린 날입니다. 하고 싶었던 말, 만들고 싶었던 것—지금이 딱 좋은 타이밍입니다.'
        : e === 'mid'
        ? '창의적인 흐름이 흐르고 있지만, 선택과 집중이 필요한 하루입니다.'
        : '에너지가 고요한 날입니다. 아이디어는 메모해 두고 실행은 다음을 기약하세요.',
    corePersonality:
      `사주와 별자리 모두에서 ${d}이 뚜렷하게 드러납니다. ` +
      `새로운 것을 만들고 자신을 표현할 때 가장 살아있는 느낌을 받는 타입으로, ` +
      `아이디어가 끊이지 않고 직관적으로 행동하는 경향이 있습니다. ` +
      `다만 ${w} 쪽은 상대적으로 약한 편이니, 에너지가 넘칠수록 현실 감각도 함께 챙기면 좋습니다.`,
    workStyle:
      `업무에서는 ${d}이 가장 큰 무기입니다. ` +
      `새로운 접근법을 제안하거나 아무도 생각 못 한 각도에서 문제를 보는 데 강점을 발휘합니다. ` +
      `정해진 틀보다 자유롭게 사고할 수 있는 환경에서 성과가 훨씬 높아집니다.`,
    relationshipStyle:
      `관계에서는 신선한 자극과 활기찬 에너지로 주변을 끌어당기는 편입니다. ` +
      `함께 있으면 지루하지 않고, 상대방에게 새로운 시각을 열어주는 존재입니다. ` +
      `깊이보다 폭을 선택할 때가 있으니, 중요한 관계에는 시간을 충분히 투자하는 의식적인 노력이 필요합니다.`,
    practicalAdvice:
      `오늘은 ${w}이 약한 편이니 세밀한 분석이나 중요한 결정은 내일로 미루세요. ` +
      `아이디어를 쏟아내는 데 집중하고, 다듬는 작업은 에너지가 균형 잡힌 날로 남겨두세요.`,
  }),

  analytical: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? '논리와 분석의 에너지가 최고조입니다. 복잡하고 어려운 문제를 다루기에 더없이 좋은 날입니다.'
        : e === 'mid'
        ? '꼼꼼하게 생각을 정리하기 좋은 하루입니다. 큰 결정보다는 검토와 계획에 어울리는 흐름입니다.'
        : '에너지가 낮은 날이지만, 오히려 단순한 것에 집중할 때 빛이 납니다.',
    corePersonality:
      `사주의 水 기운과 서양 점성학의 Air 에너지가 맞물려 ${d}이 핵심 강점으로 자리 잡고 있습니다. ` +
      `상황을 구조적으로 파악하고 감정보다 데이터를 신뢰하는 편입니다. ` +
      `${w}이 낮은 편이라, 분석 뒤에 숨어 감정 표현을 미루는 습관이 생기지 않도록 주의하세요.`,
    workStyle:
      `리서치, 기획, 문제 해결처럼 깊이 있는 사고가 필요한 업무에서 두각을 나타냅니다. ` +
      `빠른 결정보다 철저한 검토를 선호하기 때문에 팀에서 신중한 목소리 역할을 자연스럽게 맡습니다. ` +
      `혼자 집중하는 환경에서 ${d}이 가장 잘 발휘됩니다.`,
    relationshipStyle:
      `관계에서는 말보다 행동으로 신뢰를 쌓는 타입입니다. ` +
      `상대방의 문제를 함께 고민하고 해결책을 찾아주는 데서 애정을 표현합니다. ` +
      `감정을 직접 드러내는 것이 어색할 수 있으니, 때로는 "그냥 들어줘"를 연습해 보세요.`,
    practicalAdvice:
      `오늘은 ${w}이 약한 편입니다. 감정적이거나 즉흥적인 결정은 잠시 내려놓고, ` +
      `${d}이 빛을 발할 수 있는 구체적이고 명확한 과제에 집중하세요.`,
  }),

  responsible: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? '책임과 신뢰의 에너지가 오늘을 이끕니다. 맡은 일을 묵묵히 해낼 때 가장 빛나는 날입니다.'
        : e === 'mid'
        ? '꾸준함이 힘이 되는 하루입니다. 화려하지 않아도, 성실하게 쌓인 것이 빛납니다.'
        : '에너지가 낮더라도 약속 하나를 지키는 것만으로 충분합니다.',
    corePersonality:
      `사주의 土·金 기운과 서양 점성학의 Earth 에너지가 결합해 ${d}이 성격의 중심축을 이룹니다. ` +
      `한 번 한 약속은 끝까지 지키고, 주변 사람들이 기댈 수 있는 든든한 존재입니다. ` +
      `${w}이 낮다는 건 모험보다 안정을 선호한다는 의미이기도 합니다—이 성향을 인정하되, 가끔은 새로운 시도도 허용해 보세요.`,
    workStyle:
      `마감을 지키고, 품질을 유지하고, 팀이 의지할 수 있는 사람으로 평가받습니다. ` +
      `${d}은 직장에서의 가장 강력한 자산입니다. ` +
      `혼자 모든 걸 짊어지려는 경향이 생길 수 있으니, 위임하고 나누는 연습도 필요합니다.`,
    relationshipStyle:
      `관계에서는 화려한 제스처보다 꾸준한 존재감으로 사랑을 표현합니다. ` +
      `기억하고, 나타나고, 곁을 지키는 사람입니다. ` +
      `이 방식이 상대방에게 당연하게 여겨질 때 서운함이 쌓일 수 있으니, 필요한 것을 직접 말하는 연습을 해보세요.`,
    practicalAdvice:
      `${w}이 약한 오늘, 새로운 도전보다는 이미 진행 중인 일을 완성하는 데 에너지를 집중하세요. ` +
      `완료된 항목 하나가 오늘 하루를 충분히 의미 있게 만들어 줄 것입니다.`,
  }),

  empathic: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? '감수성과 직관의 기운이 오늘 가장 선명합니다. 지금 당신의 느낌은 꽤 정확한 나침반입니다.'
        : e === 'mid'
        ? '감정의 흐름을 따라가기 좋은 날입니다. 억지로 논리를 찾기보다 직관을 믿어보세요.'
        : '조용히 자신의 내면을 들여다보기에 좋은 날입니다. 회복에 집중하세요.',
    corePersonality:
      `사주의 水 기운과 서양 점성학의 Water 별자리 에너지가 만나 ${d}이 깊게 발달해 있습니다. ` +
      `상대의 감정을 빠르게 감지하고 분위기 전체를 읽는 능력이 남다릅니다. ` +
      `${w}이 약한 편이라, 감정에 압도되거나 경계를 설정하는 데 어려움을 느낄 때가 있습니다—자신을 지키는 선을 의식적으로 그어두세요.`,
    workStyle:
      `팀의 분위기를 살피고 갈등을 미리 완화하는 역할을 자연스럽게 맡습니다. ` +
      `사람 이해가 핵심인 일—협업, 상담, 인터뷰, 콘텐츠—에서 특히 빛을 발합니다. ` +
      `감정 소진을 막기 위해 에너지를 많이 쓰는 날 이후에는 혼자만의 회복 시간을 꼭 챙기세요.`,
    relationshipStyle:
      `상대방이 말하지 않아도 느끼게 해주는 드문 능력을 가지고 있습니다. ` +
      `깊은 연결을 원하고 표면적인 관계에 쉽게 지칩니다. ` +
      `타인의 감정을 내 것처럼 흡수하지 않도록, 이따금 자신의 경계선을 점검하는 시간이 필요합니다.`,
    practicalAdvice:
      `오늘은 ${w}이 약해 논리적 판단보다 직관이 앞서나갈 수 있습니다. ` +
      `중요한 결정은 감정이 안정된 이후로 미루고, 지금은 마음이 끌리는 창의적이거나 회복적인 활동에 집중하세요.`,
  }),

  expansive: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? '성장과 도전의 기운이 오늘 가장 강합니다. 익숙한 경계 너머를 향해 한 발 내딛기 좋은 날입니다.'
        : e === 'mid'
        ? '새로운 것에 호기심이 생기는 하루입니다. 작은 시도가 큰 흐름을 만드는 씨앗이 됩니다.'
        : '에너지를 아끼는 날입니다. 지금은 준비하고, 도약은 다음으로 미루세요.',
    corePersonality:
      `사주의 木 기운과 서양 점성학의 Fire 별자리 에너지가 결합해 ${d}이 뚜렷하게 나타납니다. ` +
      `새로운 가능성을 향해 나아가는 것이 가장 자연스러운 모습이며, 가만히 있으면 오히려 불안해집니다. ` +
      `${w}이 낮은 편이라 열정이 앞서 마무리가 약해질 때가 있으니, 끝내는 것도 시작만큼 중요하게 여겨보세요.`,
    workStyle:
      `새로운 프로젝트를 시작하거나 큰 그림을 그리는 일에서 두각을 나타냅니다. ` +
      `변화를 두려워하지 않고 팀에 활력을 불어넣는 역할을 합니다. ` +
      `${d}을 살리면서 장기 실행력까지 갖추면 아이디어가 실제 성과로 이어질 수 있습니다.`,
    relationshipStyle:
      `함께 있으면 세상이 넓어지는 느낌을 주는 사람입니다. ` +
      `상대에게 새로운 경험과 시각을 선물하는 방식으로 관계를 풍요롭게 합니다. ` +
      `자유로운 에너지가 상대방에게 불안감을 줄 수 있으니, 안정과 모험 사이의 균형을 의식적으로 맞춰보세요.`,
    practicalAdvice:
      `${w}이 약한 오늘, 여러 방향으로 에너지를 흩트리기보다 하나의 목표에 집중하세요. ` +
      `이미 시작한 것 하나를 완성하는 것이 지금 에너지를 가장 잘 쓰는 방법입니다.`,
  }),

  structured: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? '체계와 질서의 에너지가 가장 강한 날입니다. 계획을 세우고 실행하기에 더없이 좋은 흐름입니다.'
        : e === 'mid'
        ? '정리하고 다듬기 좋은 하루입니다. 복잡했던 것들이 오늘은 제자리를 찾기 쉽습니다.'
        : '에너지가 낮더라도 한 가지 루틴을 지키는 것만으로 충분합니다.',
    corePersonality:
      `사주의 金·土 기운과 서양 점성학의 Earth 에너지가 맞물려 ${d}이 성격의 뼈대를 이룹니다. ` +
      `명확한 규칙과 구조 속에서 최고의 퍼포먼스를 발휘하며, 모호한 상황을 불편해합니다. ` +
      `${w}이 낮은 편이라 예상치 못한 변화에 흔들릴 수 있으니, 낮은 위험도에서 유연성을 연습해 두면 도움이 됩니다.`,
    workStyle:
      `복잡한 프로젝트를 체계적으로 정리하고 효율적으로 실행하는 능력이 뛰어납니다. ` +
      `계획 수립, 프로세스 개선, 품질 관리처럼 정밀함이 요구되는 역할에서 강점이 드러납니다. ` +
      `완벽주의가 속도를 늦출 때가 있으니, "충분히 좋은" 기준을 미리 설정해 두세요.`,
    relationshipStyle:
      `약속을 지키고 기대치를 명확히 하는 데 익숙하며, 관계에 안정감을 줍니다. ` +
      `상대방은 당신과 함께 있을 때 안전하다는 느낌을 받습니다. ` +
      `상대의 즉흥성이나 감정 기복을 답답하게 느낄 수 있으니, 가끔은 계획 없이 흘러가는 시간도 허용해 보세요.`,
    practicalAdvice:
      `${w}이 낮은 오늘, 새 아이디어를 억지로 짜내기보다 이미 계획된 것을 실행하는 데 집중하세요. ` +
      `리스트 정리, 프로세스 문서화, 목표 점검처럼 구조적인 작업이 오늘 에너지와 가장 잘 맞습니다.`,
  }),
};

// ─────────────────────────────────────────────
// LAYER 2 — PHRASING: ENGLISH  renderEn()
// ─────────────────────────────────────────────
// Written for a global (US-leaning) audience.
// Tone: confident, warm, slightly elevated — like a premium
// wellness product. Short punchy sentences. No filler.
// These are NOT translations of the Korean above.
// They describe the same meaning but are written from scratch
// for English-speaking readers.
//
// Dimension labels in English — chosen to fit mid-sentence.
const EN_LABEL: Record<keyof Dimensions, string> = {
  creativity:            'creative expression',
  analysis:              'analytical thinking',
  responsibility:        'reliability',
  emotional_sensitivity: 'emotional sensitivity',
  expansion:             'expansive energy',
  structure:             'structured discipline',
};

type EnRenderer = (d: string, s: string, w: string, e: EnergyLevel) => Omit<Interpretation, 'language'>;

const EN: Record<Archetype, EnRenderer> = {

  expressive: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? 'Creative energy peaks today. Trust the impulses that feel bold or original — they\'re pointing somewhere real.'
        : e === 'mid'
        ? 'A steady creative current runs through the day. Choose one idea and go deep rather than wide.'
        : 'Energy is quiet today. Capture ideas without acting on them — the right moment is coming.',
    corePersonality:
      `Both your Saju and Western chart highlight ${d} as a defining trait. ` +
      `You come alive through making, performing, or sharing ideas — originality is your native language. ` +
      `${w} is a quieter area, so pair creative bursts with a dose of grounding before committing.`,
    workStyle:
      `At work, ${d} is your edge. You generate ideas quickly and bring energy to projects others find draining. ` +
      `Rigid structures dampen your output — you think best when you have room to roam. ` +
      `Build in a review step so your instincts get refined before they ship.`,
    relationshipStyle:
      `You make people feel sparked and alive. Your enthusiasm is contagious, and you introduce others to sides of themselves they hadn\'t met. ` +
      `Watch the tendency to pursue breadth over depth — your closest relationships reward sustained attention.`,
    practicalAdvice:
      `${w} is low today — skip detailed decisions or analytical tasks. ` +
      `Use this creative window to generate and brainstorm. Refine tomorrow.`,
  }),

  analytical: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? 'Your analytical mind is sharp today. Complex problems, strategic decisions, and careful planning all have tailwinds.'
        : e === 'mid'
        ? 'Good energy for reviewing and refining. Not the day for big launches — save that for when the current is stronger.'
        : 'Keep it simple today. One well-executed task beats three half-finished ones.',
    corePersonality:
      `Water (Saju) and Air (Western) energies combine to make ${d} your defining strength. ` +
      `You naturally decompose problems, prefer evidence over intuition, and think in systems. ` +
      `${w} runs quieter — watch for a habit of using analysis to avoid emotional engagement.`,
    workStyle:
      `Research, planning, and any work that rewards methodical thinking is where you thrive. ` +
      `Teams rely on you as the voice of reason — the one who actually read the fine print. ` +
      `Protect focused blocks of time; shallow multitasking is your kryptonite.`,
    relationshipStyle:
      `You show care by solving problems and offering well-considered advice. ` +
      `That\'s a real gift, though partners sometimes need you to just listen without fixing. ` +
      `Practise sitting with someone\'s feelings before reaching for a solution.`,
    practicalAdvice:
      `${w} is low today — sidestep impulsive or emotionally-charged choices. ` +
      `Channel your sharpest focus into the problem that genuinely deserves it.`,
  }),

  responsible: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? 'Reliability and follow-through define the energy today. The work you show up for will quietly compound.'
        : e === 'mid'
        ? 'Steady effort beats inspiration today. Finish what you started — that\'s the win.'
        : 'Low energy, but one kept promise still counts. Choose the most important thing and do just that.',
    corePersonality:
      `Earth and Metal energies in both your Saju and Western chart make ${d} a cornerstone of your identity. ` +
      `You are the person others lean on — steady, thorough, and genuinely trustworthy. ` +
      `${w} runs lower; you may resist novelty or risk more than most. Notice that — it\'s worth working with, not around.`,
    workStyle:
      `You deliver. Teams build timelines around your word because you keep it. ` +
      `${d} is your professional reputation, built one completed task at a time. ` +
      `Watch for absorbing more than your share — delegating is a skill worth developing.`,
    relationshipStyle:
      `In relationships you show love through consistent presence, not grand gestures. ` +
      `You remember, you show up, and you stay — that\'s rarer than it sounds. ` +
      `When this goes unacknowledged, resentment builds quietly. Say what you need out loud.`,
    practicalAdvice:
      `${w} is low today — this isn\'t the day to start something new. ` +
      `Finish one thing already in progress and let that be enough.`,
  }),

  empathic: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? 'Emotional intuition is heightened today. Your instincts are picking up on things logic alone would miss.'
        : e === 'mid'
        ? 'A reflective current runs through the day. Follow your gut on interpersonal matters — it\'s well-calibrated right now.'
        : 'Quiet, restorative energy today. Protect your emotional bandwidth; fill your own cup first.',
    corePersonality:
      `Water energies from both systems make ${d} your most developed trait. ` +
      `You read rooms, feel undercurrents, and often sense trouble before it\'s named. ` +
      `${w} runs lower — setting and holding personal limits can feel harder for you than most.`,
    workStyle:
      `People-centred work is your natural domain: collaboration, facilitation, listening at depth. ` +
      `You defuse tension before it becomes conflict, often without being asked. ` +
      `Build recovery time after high-contact days — you process more than most, and the cost is real.`,
    relationshipStyle:
      `You make others feel genuinely seen and understood — a rarer gift than it appears. ` +
      `You crave depth and lose interest in relationships that stay at the surface. ` +
      `Guard against absorbing others\' emotional weight as your own. Their feelings are theirs to carry.`,
    practicalAdvice:
      `${w} is low today — analytical clarity may feel harder to access than usual. ` +
      `Defer high-stakes decisions. Use this window for reflective, creative, or restorative work instead.`,
  }),

  expansive: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? 'Growth energy is strong today. Step toward something that stretches you — conditions support bold moves.'
        : e === 'mid'
        ? 'A forward-leaning current is present. One deliberate step beyond your comfort zone is enough.'
        : 'Energy is low, but preparation counts as progress. Plan the leap; take it when the current returns.',
    corePersonality:
      `Wood (Saju) and Fire (Western) energies drive your ${d}. ` +
      `You are pulled toward possibility, growth, and new experience — standing still feels like falling behind. ` +
      `${w} tends to lag; enthusiasm can outpace follow-through. Build finishing into the plan from the start.`,
    workStyle:
      `You\'re a natural at launching things — new projects, new directions, unexpected pivots. ` +
      `You energise teams and push past collective inertia. ` +
      `The gap between your vision and your execution closes when you pair ${d} with a system for completion.`,
    relationshipStyle:
      `Relationships feel alive and forward-moving around you. ` +
      `You introduce people to new ideas, places, and versions of themselves they hadn\'t imagined. ` +
      `Balance that momentum with reassurance — not everyone moves at your pace, and that\'s okay.`,
    practicalAdvice:
      `${w} is low today — resist scattering energy across too many directions. ` +
      `Pick one thing and go all in. Completion matters more than exploration right now.`,
  }),

  structured: (d, _s, w, e) => ({
    summary:
      e === 'high'
        ? 'Order and precision are your allies today. Systems, plans, and careful execution all have tailwinds.'
        : e === 'mid'
        ? 'Good energy for refining and organising. Tighten what exists rather than building something new.'
        : 'Low energy day — one completed routine task is a win. Keep the bar real.',
    corePersonality:
      `Metal and Earth energies from both systems make ${d} the backbone of your personality. ` +
      `You perform best with clarity — clear roles, clear goals, clear expectations. ` +
      `${w} is a growth edge; unexpected change can destabilise you more than most. Practise adapting in low-stakes situations so it\'s available when you need it.`,
    workStyle:
      `Organising complexity and executing with precision is where you thrive. ` +
      `Process design, quality control, detailed planning — these are your native terrain. ` +
      `Perfectionism can become a bottleneck. Define "good enough" up front so projects actually ship.`,
    relationshipStyle:
      `People know where they stand with you — and that consistency is genuinely reassuring. ` +
      `You set clear expectations and keep your word without being asked twice. ` +
      `Make room for spontaneity. Not everything that matters fits inside a plan.`,
    practicalAdvice:
      `${w} is low today — skip brainstorming and go straight to execution. ` +
      `Organising, documenting, or reviewing progress will feel natural and productive.`,
  }),
};

// ─────────────────────────────────────────────
// LAYER 3 — ORCHESTRATION
// ─────────────────────────────────────────────
// This is the only function that knows about `lang`.
// It calls Layer 1, picks the right Layer 2 renderer, and
// attaches the language tag to the result.

/**
 * Build the full Interpretation from blended dimension scores.
 *
 * @param dims  Blended (Saju + Western) dimension scores
 * @param lang  "ko" | "en" — chosen by the user at the entry screen
 *
 * Usage:
 *   import { buildInterpretation } from '@/lib/synthesis/interpretation';
 *   const interp = buildInterpretation(result.dimensions, 'en');
 */
export function buildInterpretation(dims: Dimensions, lang: Lang): Interpretation {
  // Layer 1: compute shared meaning
  const ctx = buildContext(dims);

  // Resolve labels for the selected language
  const labelMap = lang === 'ko' ? KO_LABEL : EN_LABEL;
  const dLabel = labelMap[ctx.dominant];
  const sLabel = labelMap[ctx.secondary];
  const wLabel = labelMap[ctx.weakest];

  // Layer 2: pick renderer and generate text
  const renderer = lang === 'ko' ? KO[ctx.archetype] : EN[ctx.archetype];
  const text = renderer(dLabel, sLabel, wLabel, ctx.energyLevel);

  // Layer 3: attach language tag and return
  return { language: lang, ...text };
}
