"use client";

import React from "react";
import { 
  Menu, 
  TrendingUp, 
  BarChart3, 
  Flame, 
  FileText,
  Gavel,
  Home,
  Building2,
  Layers,
  FileSpreadsheet
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
      {/* ÜST KISIM: İHALECİ BURADA LOGO & MENÜ */}
      <div className="space-y-4 flex flex-col items-center">
        {/* Hamburger Menü */}
        <button 
          type="button"
          aria-label="Menüyü Aç"
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* İhaleci Burada Kurumsal Rozet Logosu */}
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => onTabChange("endeks")}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-900/20 border border-amber-500/30">
            <Gavel className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[9px] font-black text-slate-900 font-heading tracking-tight text-center leading-none">
            ihaleci
          </span>
        </div>

        {/* Kategori Değiştirici Hızlı Düğme (Konut / Arsa) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onCategoryChange(category === "konut" ? "arsa" : "konut")}
            title={category === "konut" ? "Arsa Moduna Geç" : "Konut Moduna Geç"}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition border ${
              category === "konut"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {category === "konut" ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5 text-amber-700" />}
          </button>
        </div>

        {/* NAVİGASYON ÖĞELERİ */}
        <nav className="w-full space-y-1.5 pt-2 flex flex-col items-center">
          
          {/* 1. PİYASA & ENDEKS */}
          <button
            type="button"
            onClick={() => onTabChange("endeks")}
            className={`relative w-full py-2.5 flex flex-col items-center gap-1 transition ${
              activeTab === "endeks"
                ? "text-amber-700 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeTab === "endeks" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-amber-600 rounded-r-full"></span>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeTab === "endeks" ? "bg-amber-50 text-amber-700" : ""
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight text-center font-medium">
              Piyasa
            </span>
          </button>

          {/* 2. DEĞERLEME & EMSAL SİHİRBAZI */}
          <button
            type="button"
            onClick={() => onTabChange("degerleme")}
            className={`relative w-full py-2.5 flex flex-col items-center gap-1 transition ${
              activeTab === "degerleme"
                ? "text-amber-700 font-bold"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {activeTab === "degerleme" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-amber-600 rounded-r-full"></span>
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              activeTab === "degerleme" ? "bg-amber-50 text-amber-700" : ""
            }`}>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight text-center font-medium">
              Değerleme
            </span>
          </button>

          {/* 3. İHALE & PEY SİMÜLATÖRÜ */}
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
              İhale & Pey
            </span>
          </button>

          {/* 4. EKSPERTİZ RAPORU */}
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
      <div className="flex flex-col items-center gap-1 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onTabChange("ihale")}
          title="Fırsat İhaleler & Yüksek Marj"
          className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center"
        >
          <Flame className="w-5 h-5 text-amber-600" />
        </button>
        <span className="text-[9px] font-bold text-slate-400">
          İhale Fırsat
        </span>
      </div>
    </aside>
  );
};
