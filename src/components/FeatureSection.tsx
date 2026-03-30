const features = [
  {
    icon: "☯",
    title: "사주팔자 분석",
    desc: "생년월일시의 여덟 글자에 담긴 오행의 균형과 기운을 정밀하게 분석합니다.",
    color: "rgba(124,58,237,0.3)",
    border: "rgba(124,58,237,0.5)",
  },
  {
    icon: "♈",
    title: "서양 점성학",
    desc: "태양궁, 달궁, 어센던트를 포함한 10개 행성의 위치와 상호 작용을 읽습니다.",
    color: "rgba(212,168,83,0.2)",
    border: "rgba(212,168,83,0.5)",
  },
  {
    icon: "∞",
    title: "통합 운세 해석",
    desc: "동서양 두 체계가 공명하는 지점에서 더 깊고 입체적인 운명의 윤곽을 그립니다.",
    color: "rgba(45,19,84,0.6)",
    border: "rgba(212,168,83,0.3)",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest mb-3" style={{ color: "#d4a853" }}>
            ✦ 세 가지 핵심 ✦
          </p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#e8d5b7" }}>
            왜 천명술인가요?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-8 hover:scale-105 transition-transform duration-300"
              style={{ background: f.color, borderColor: f.border }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-5"
                style={{ background: "rgba(212,168,83,0.1)", border: `1px solid ${f.border}` }}
              >
                {f.icon}
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "#f0c97a" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,213,183,0.7)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
