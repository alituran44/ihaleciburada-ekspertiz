import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "İhaleciBurada Ekspertiz — Arsa İmar Fizibilitesi ve Değerleme Raporu",
  description: "Arsa satanlar, emlak danışmanları ve ihale katılımcıları için 3 dakikada kapsamlı imar hakları, yapılaşma kapasitesi, maliyet ve değerleme fizibilite raporu.",
  keywords: "arsa ekspertiz, arsa değerleme, ihale fizibilitesi, imar durumu sorgulama, kat karşılığı hesaplama, ihaleciburada",
  openGraph: {
    title: "İhaleciBurada Ekspertiz — Profesyonel Arsa & Gayrimenkul Yatırım Raporu",
    description: "TKGM uyumlu parsel geometrisi, resmi kadastro verileri, inşaat maliyeti ve piyasa değerleme bandı.",
    url: "https://ekspertiz.ihaleciburada.com",
    siteName: "İhaleciBurada",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
