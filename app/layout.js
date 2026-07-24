import "./globals.css";

export const metadata = {
  title: "The Met × The Cloisters Guide",
  description: "부모님과 함께 보는 오디세이 테마 The Met 디지털 가이드",
};

export default function RootLayout({ children }) {
  return <html lang="ko"><body>{children}</body></html>;
}
