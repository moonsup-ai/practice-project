import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오디세이를 따라 두 개의 Met 걷기",
  description: "부모님과 함께 보는 The Met Cloisters와 The Met Fifth Avenue 디지털 전시 가이드",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
