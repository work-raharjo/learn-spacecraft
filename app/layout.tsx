import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OrbitLearn — Spacecraft Architecture Studio",
  description:
    "Immersive AI-native aerospace learning environment for GEO communications satellites, spacecraft systems, orbital mechanics, and RF engineering.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="h-full overflow-hidden bg-app">{children}</body>
    </html>
  );
}
