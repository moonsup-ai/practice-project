const services = [
  { emoji: "🌟", title: "오늘의 운세", desc: "사주와 별자리가 오늘 하루를 어떻게 읽는지 확인하세요.", badge: "무료" },
  { emoji: "📖", title: "사주 원국 분석", desc: "당신의 타고난 기질과 인생 전반의 흐름을 상세히 풀어드립니다.", badge: "기본" },
  { emoji: "💫", title: "연간 대운 · 트랜짓", desc: "올해의 행운, 주의할 시기, 기회의 타이밍을 미리 파악하세요.", badge: "프리미엄" },
  { emoji: "💑", title: "궁합 분석", desc: "사주 오행 궁합과 시너지 행성 배치로 두 사람의 관계를 진단합니다.", badge: "프리미엄" },
];

const badgeColors: Record<string, { bg: string; text: string }> = {
  "무료": { bg: "rgba(34,197,94,0.15)", text: "#86efac" },
  "기본": { bg: "rgba(212,168,83,0.15)", text: "#f0c97a" },
  "프리미엄": { bg: "rgba(124,58,237,0.2)", text: "#c4b5fd" },
};

export default function ServiceSection() {
  return (
    <section className="py-24 px-6 md:px-16" style={{ borderTop: "1px solid rgba(212,168,83,0.1)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest mb-3" style={{ color: "#d4a853" }}>
            ✦ 서비스 ✦
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#e8d5b7" }}>
            운명을 탐색하는 방법들
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {services.map((s, i) => {
            const badge = badgeColors[s.badge];
            return (
              <div
                key={i}
                className="glass-card rounded-2xl p-6 flex gap-5 items-start hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "rgba(212,168,83,0.1)" }}
                >
                  {s.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold" style={{ color: "#e8d5b7" }}>
                      {s.title}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(232,213,183,0.65)" }}>
                    {s.desc}
                  </p>
                </div>
                <span style={{ color: "rgba(212,168,83,0.5)" }} className="text-lg">›</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
