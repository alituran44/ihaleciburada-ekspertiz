"use client";

import React from "react";
import { 
  Menu, 
  Compass, 
  TrendingUp, 
  BarChart3, 
  Percent, 
  Users, 
  MapPin, 
  UserCheck, 
  Flame, 
  FileText,
  Gavel,
  Home,
  Building2,
  ChevronDown
} from "lucide-react";

interface EndeksaSidebarProps {
  activeTab: "endeks" | "degerleme" | "ihale" | "rapor";
  onTabChange: (tab: "endeks" | "degerleme" | "ihale" | "rapor") => void;
  category: "arsa" | "konut";
  onCategoryChange: (cat: "arsa" | "konut") => void;
}

export const EndeksaSidebar: React.FC<EndeksaSidebarProps> = ({
  activeTab,
  onTabChange,
  category,
  onCategoryChange,
}) => {
  return (
    <aside className="w-16 sm:w-20 bg-white border-r border-slate-200 flex flex-col justify-between py-3 shrink-0 select-none z-20">
      {/* ÜST KISIM: LOGO & MENÜ BUTONU */}
      <div className="space-y-4 flex flex-col items-center">
        {/* Hamburger Menü */}
        <button 
          type="button"
          aria-label="Menüyü Aç"
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* İhaleciBurada / Endeksa Rozet Logosu */}
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onTabChange("endeks")}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
            <span className="font-black text-base tracking-tighter">İB</span>
          </div>
          <span className="text-[9px] font-black text-rose-600 font-heading tracking-tight text-center leading-none">
            endeks
          </span>
        </div>

        {/* Kategori Değiştirici Hızlı Düğme */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onCategoryChange(category === "konut" ? "arsa" : "konut")}
            title={category === "konut" ? "Arsa Moduna Geç" : "Konut Moduna Geç"}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition border ${
              category === "konut"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
            }`}
          >
            {category === "konut" ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </button>
        </div>

        {/* NAVİGASYON ÖĞELERİ (ENDEKSA SİMGELERİ) */}
        <nav className="w-full space-y-1.5 pt-2 flex flex-col items-center">
          
          {/* 1. ANALİZ / ENDEKS (Vurgulu) */}
          <button
            type="button"
            onClick={() => onTabChange("endeks")}
            className={`relative w-full py-2.5 flex flex-col items-center gap-1 transition ${
              activeTab === "endeks"
                ? "text-rose-600 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeTab === "endeks" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-rose-600 rounded-r-full"></span>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeTab === "endeks" ? "bg-rose-50 text-rose-600" : ""
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight text-center font-medium">
              Endeks
            </span>
          </button>

          {/* 2. DEĞERLEMELER (Hesaplayıcı & Sihirbaz) */}
          <button
            type="button"
            onClick={() => onTabChange("degerleme")}
            className={`relative w-full py-2.5 flex flex-col items-center gap-1 transition ${
              activeTab === "degerleme"
                ? "text-rose-600 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeTab === "degerleme" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-rose-600 rounded-r-full"></span>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeTab === "degerleme" ? "bg-rose-50 text-rose-600" : ""
            }`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight text-center font-medium">
              Değerleme
            </span>
          </button>

          {/* 3. YATIRIM & İHALE */}
          <button
            type="button"
            onClick={() => onTabChange("ihale")}
            className={`relative w-full py-2.5 flex flex-col items-center gap-1 transition ${
              activeTab === "ihale"
                ? "text-orange-600 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeTab === "ihale" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-orange-600 rounded-r-full"></span>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeTab === "ihale" ? "bg-orange-50 text-orange-600" : ""
            }`}>
              <Gavel className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight text-center font-medium">
              İhale / Yatırım
            </span>
          </button>

          {/* 4. RAPOR / ÇIKTI */}
          <button
            type="button"
            onClick={() => onTabChange("rapor")}
            className={`relative w-full py-2.5 flex flex-col items-center gap-1 transition ${
              activeTab === "rapor"
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeTab === "rapor" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-blue-600 rounded-r-full"></span>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeTab === "rapor" ? "bg-blue-50 text-blue-600" : ""
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight text-center font-medium">
              Rapor
            </span>
          </button>
        </nav>
      </div>

      {/* ALT KISIM: FIRSAT ROZETİ */}
      <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onTabChange("ihale")}
          title="Fırsat İhaleler"
          className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center"
        >
          <Flame className="w-5 h-5 text-amber-600" />
        </button>
        <span className="text-[9px] font-bold text-slate-400">
          Fırsat
        </span>
      </div>
    </aside>
  );
};
