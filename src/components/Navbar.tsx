import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="w-full flex items-center justify-between px-6 md:px-16 py-5"
      style={{ borderBottom: "1px solid rgba(212,168,83,0.1)" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">☽</span>
        <span
          className="text-xl font-bold tracking-widest"
          style={{ color: "#d4a853" }}
        >
          천명술
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "rgba(232,213,183,0.7)" }}>
        <a href="#" className="hover:text-amber-300 transition-colors">오늘의 운세</a>
        <a href="#" className="hover:text-amber-300 transition-colors">사주 분석</a>
        <a href="#" className="hover:text-amber-300 transition-colors">점성학</a>
        <a href="#" className="hover:text-amber-300 transition-colors">궁합</a>
      </div>

      <Link
        href="/fortune"
        className="px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
        style={{
          background: "rgba(212,168,83,0.15)",
          border: "1px solid rgba(212,168,83,0.5)",
          color: "#f0c97a",
        }}
      >
        무료 시작
      </Link>
    </nav>
  );
}
