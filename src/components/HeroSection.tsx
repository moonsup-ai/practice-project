import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        {/* 장식 원 */}
        <div className="float-element mb-10">
          <div className="relative w-40 h-40 mx-auto">
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: "radial-gradient(circle, rgba(212,168,83,0.4), transparent)",
                boxShadow: "0 0 60px rgba(212,168,83,0.3)",
              }}
            />
            <div
              className="absolute inset-4 rounded-full border opacity-60"
              style={{ borderColor: "rgba(212,168,83,0.5)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              ☯
            </div>
          </div>
        </div>

        {/* 뱃지 */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(212,168,83,0.4)",
            color: "#f0c97a",
          }}
        >
          <span>✦</span>
          <span>동서양 운세의 새로운 기준</span>
          <span>✦</span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          <span className="shimmer-text">천명술</span>
          <br />
          <span style={{ color: "#e8d5b7" }} className="text-3xl md:text-4xl font-light">
            天命術
          </span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-2xl leading-relaxed mb-4"
          style={{ color: "rgba(232,213,183,0.75)" }}
        >
          사주팔자의 오행과 별자리의 행성 기운이 만나는 곳.
          <br />
          당신의 타고난 운명을 동양과 서양의 지혜로 풀어드립니다.
        </p>

        <div className="flex items-center gap-3 mb-12" style={{ color: "rgba(212,168,83,0.7)" }}>
          <span className="text-sm">사주 · 오행</span>
          <span>✦</span>
          <span className="text-sm">별자리 · 행성</span>
          <span>✦</span>
          <span className="text-sm">통합 운세</span>
        </div>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/fortune"
            className="glow-card px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #d4a853, #b8853a)",
              color: "#0a0510",
            }}
          >
            ✨ 오늘의 운세 보기
          </Link>
          <Link
            href="/fortune"
            className="px-8 py-4 rounded-full font-semibold text-base transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(45,19,84,0.5)",
              border: "1px solid rgba(212,168,83,0.4)",
              color: "#f0c97a",
            }}
          >
            🌙 사주 분석 시작
          </Link>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs" style={{ color: "#d4a853" }}>
            스크롤하여 더 알아보기
          </span>
          <div
            className="w-px h-8"
            style={{
              background: "linear-gradient(to bottom, rgba(212,168,83,0.8), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
