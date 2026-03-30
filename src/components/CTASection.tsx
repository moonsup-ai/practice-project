import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 px-6 md:px-16">
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="rounded-3xl p-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(45,19,84,0.8) 0%, rgba(26,10,46,0.9) 100%)",
            border: "1px solid rgba(212,168,83,0.3)",
            boxShadow: "0 0 80px rgba(124,58,237,0.2), inset 0 0 40px rgba(212,168,83,0.05)",
          }}
        >
          {/* 장식 */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.6), transparent)" }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.6), transparent)" }}
          />

          <p className="text-sm tracking-widest mb-4" style={{ color: "#d4a853" }}>
            ✦ 지금 바로 ✦
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#e8d5b7" }}>
            당신의 운명을 읽어드릴게요
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: "rgba(232,213,183,0.7)" }}>
            생년월일시만 입력하면 됩니다.
            <br />
            사주와 별자리가 함께 말하는 당신만의 이야기.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/fortune"
              className="glow-card px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #d4a853, #b8853a)",
                color: "#0a0510",
              }}
            >
              ✨ 무료로 운세 보기
            </Link>
          </div>

          <p className="mt-5 text-xs" style={{ color: "rgba(232,213,183,0.4)" }}>
            회원가입 없이도 오늘의 운세를 즐기실 수 있습니다
          </p>
        </div>
      </div>
    </section>
  );
}
