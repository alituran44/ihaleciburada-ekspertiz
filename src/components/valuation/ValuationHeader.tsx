"use client";

import React from "react";
import { ValuationServiceType } from "./types";
import { 
  Building, 
  Home, 
  Compass, 
  Store, 
  Check, 
  MapPin, 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp,
  X
} from "lucide-react";

interface ValuationHeaderProps {
  activeService: ValuationServiceType;
  onServiceChange: (service: ValuationServiceType) => void;
  currentStep: number;
  onStepClick: (step: number) => void;
  onClose?: () => void;
  isDashboardActive?: boolean;
}

export const ValuationHeader: React.FC<ValuationHeaderProps> = ({
  activeService,
  onServiceChange,
  currentStep,
  onStepClick,
  onClose,
  isDashboardActive = false,
}) => {
  const steps = [
    { num: 1, label: "Konum & Kadastro", icon: MapPin },
    { num: 2, label: "Mülk & İmar Detayları", icon: SlidersHorizontal },
    { num: 3, label: "Donatı & Nitelikler", icon: Sparkles },
    { num: 4, label: "Ekspertiz & Yatırım Raporu", icon: TrendingUp },
  ];

  const progressPercent = isDashboardActive
    ? 100
    : currentStep === 1
    ? 25
    : currentStep === 2
    ? 50
    : currentStep === 3
    ? 75
    : 100;

  return (
    <div className="w-full max-w-5xl mx-auto mb-6 sm:mb-8 select-none">
      {/* ÜST BAR: Başlık & Kapatma */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0B1E3B] to-slate-900 flex items-center justify-center text-amber-400 shadow-md border border-amber-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-heading">
                İhaleciBurada <span className="text-amber-600">Akıllı Değerleme & Ekspertiz Motoru</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200">
                Yapay Zeka + TKGM + İİK m.115
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Gerçek piyasa rayiçleri, icra/ihale fırsat tabanı ve amortisman analizi
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* HİZMET SEÇİM TABS (KONUT, ARSA, ARAZİ, TİCARİ) */}
      {!isDashboardActive && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <button
            type="button"
            onClick={() => onServiceChange("konut")}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer border ${
              activeService === "konut"
                ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-md shadow-blue-950/20 ring-2 ring-blue-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Home className={`w-4 h-4 ${activeService === "konut" ? "text-amber-400" : "text-slate-400"}`} />
            <span>Konut & Daire</span>
          </button>

          <button
            type="button"
            onClick={() => onServiceChange("arsa")}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer border ${
              activeService === "arsa"
                ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-md shadow-blue-950/20 ring-2 ring-blue-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Building className={`w-4 h-4 ${activeService === "arsa" ? "text-emerald-400" : "text-slate-400"}`} />
            <span>İmarlı Arsa</span>
          </button>

          <button
            type="button"
            onClick={() => onServiceChange("arazi")}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer border ${
              activeService === "arazi"
                ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-md shadow-blue-950/20 ring-2 ring-blue-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Compass className={`w-4 h-4 ${activeService === "arazi" ? "text-amber-400" : "text-slate-400"}`} />
            <span>Tarla & Arazi</span>
          </button>

          <button
            type="button"
            onClick={() => onServiceChange("ticari")}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer border ${
              activeService === "ticari"
                ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-md shadow-blue-950/20 ring-2 ring-blue-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Store className={`w-4 h-4 ${activeService === "ticari" ? "text-sky-400" : "text-slate-400"}`} />
            <span>Ticari & İşyeri</span>
          </button>
        </div>
      )}

      {/* STEPPER PROGRESS BARI */}
      {!isDashboardActive && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Adım {currentStep} / {steps.length}: <span className="text-blue-600">{steps[currentStep - 1]?.label}</span>
            </span>
            <span className="font-mono font-bold text-slate-500 text-[11px]">
              %{progressPercent} Tamamlandı
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4 relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {steps.map((s) => {
              const StepIcon = s.icon;
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (s.num < currentStep) onStepClick(s.num);
                  }}
                  className={`flex flex-col items-center gap-1.5 transition ${
                    s.num < currentStep ? "cursor-pointer" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                      isPassed
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isCurrent
                        ? "bg-[#0B1E3B] text-amber-400 ring-2 ring-amber-500/40 shadow-sm"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold hidden sm:inline truncate max-w-[120px] ${
                      isCurrent
                        ? "text-slate-900 font-extrabold"
                        : isPassed
                        ? "text-emerald-700"
                        : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
