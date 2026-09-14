"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail, FileText, ArrowRight, ShieldCheck, Menu, X, ExternalLink } from "lucide-react";

interface HeaderProps {
  onNewReportClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewReportClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      {/* Üst İletişim Şeridi */}
      <div className="bg-[#0B1E3B] text-slate-300 py-1.5 px-4 sm:px-6 text-[11px] border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <span className="text-rose-400">📞</span>
              <strong className="text-slate-200">Destek:</strong>
              <a href="tel:08508408695" className="text-blue-300 hover:text-white transition">0850 840 86 95</a>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="text-sky-400">✉</span>
              <strong className="text-slate-200">E-posta:</strong>
              <a href="mailto:ihalecib@gmail.com" className="text-blue-300 hover:text-white transition">ihalecib@gmail.com</a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              İhaleciBurada Kurumsal Altyapı
            </span>
            <a 
              href="https://ihaleciburada.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition"
            >
              <span>Ana Portala Dön</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Ana Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Subdomain Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            {/* SVG Logo based on ihaleciburada.com branding */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 120" width="190" height="42" className="h-8 sm:h-9 w-auto max-w-[190px] sm:max-w-[220px] object-contain" fill="none" role="img" aria-label="İhaleciBurada">
              <g transform="translate(10, 10)">
                <circle cx="106" cy="18" r="14" fill="#FF5938"></circle>
                <path d="M 38 68 L 86 63 L 83 58 L 32 64 Z" fill="#0052FF"></path>
                <path d="M 18 84 L 78 78 L 75 73 L 12 80 Z" fill="#0084FF"></path>
                <path d="M 0 98 L 70 91 L 67 86 L -4 94 Z" fill="#00C2FF"></path>
                <path d="M 94 33 C 90 33 82 37 81 40 L 89 40 C 97 40 94 48 91 58 L 79 97 C 76 107 84 105 91 101 C 101 95 108 78 114 55 C 117 42 110 33 94 33 Z" fill="#0B1E3B"></path>
              </g>
              <text x="152" y="84" fill="#0B1E3B" fontFamily="'Outfit', 'Inter', sans-serif" fontSize="46" fontWeight="900" letterSpacing="-1.2px">ihaleciburada</text>
              <text x="430" y="84" fill="#0052FF" fontFamily="'Outfit', 'Inter', sans-serif" fontSize="46" fontWeight="900" letterSpacing="-0.8px">.com</text>
            </svg>
          </Link>
          
          <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/80 text-blue-900 font-bold text-xs font-heading tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Ekspertiz & Fizibilite
          </div>
        </div>

        {/* Navigasyon & Aksiyonlar */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <Link href="/" className="text-blue-600 hover:text-blue-700 transition flex items-center gap-1">
            Arsa Hesaplayıcı
          </Link>
          <a href="https://ihaleciburada.com/pazar-yeri" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
            İhale Pazar Yeri
          </a>
          <a href="#nasil-calisir" className="hover:text-blue-600 transition">
            Nasıl Çalışır?
          </a>
          <a href="#ornek-raporlar" className="hover:text-blue-600 transition">
            Örnek Raporlar
          </a>
        </nav>

        {/* CTA Buton */}
        <div className="flex items-center gap-3">
          {onNewReportClick ? (
            <button
              onClick={onNewReportClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Yeni Rapor Başlat</span>
            </button>
          ) : (
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Yeni Rapor Başlat</span>
            </Link>
          )}

          {/* Mobil Menü Butonu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobil Açılır Menü */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-blue-600"
          >
            Arsa Ekspertiz Hesaplayıcı
          </Link>
          <a 
            href="https://ihaleciburada.com/pazar-yeri" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            İhale Pazar Yeri
          </a>
          <a 
            href="#nasil-calisir" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Nasıl Çalışır?
          </a>
          <a 
            href="#ornek-raporlar" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Örnek Raporlar
          </a>
        </div>
      )}
    </header>
  );
};
