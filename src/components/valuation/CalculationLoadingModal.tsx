"use client";

import React, { useEffect, useState } from "react";
import { Loader2, TrendingUp, Gavel, ShieldCheck, Sparkles } from "lucide-react";

interface CalculationLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  service: string;
}

export const CalculationLoadingModal: React.FC<CalculationLoadingModalProps> = ({
  isOpen,
  onComplete,
  service,
}) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("TKGM kadastro ve tapu verileri taranıyor...");

  useEffect(() => {
    if (!isOpen) {
      setProgress(15);
      return;
    }

    const t1 = setTimeout(() => {
      setProgress(45);
      setStatusText(
        service === "arazi"
          ? "Tarım ve Orman Bakanlığı toprak verimliliği ve rekolte endeksleri inceleniyor..."
          : service === "arsa"
          ? "Belediye imar planı ve KAKS / TAKS inşaat hakları çözümleniyor..."
          : "TCMB EVDS Konut Fiyat Endeksi ve Hedonik Fiyat Modeli çalıştırılıyor..."
      );
    }, 600);

    const t2 = setTimeout(() => {
      setProgress(80);
      setStatusText("İcra İflas Kanunu m.115 gereği %50 İhale Başlangıç Tabanı hesaplanıyor...");
    }, 1300);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText("İhaleciBurada Değerleme & Yatırım Raporu hazırlandı!");
    }, 1900);

    const t4 = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen, onComplete, service]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        {/* Pulsing Brand Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping duration-1000" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0B1E3B] to-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
            <TrendingUp className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Title & Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Yapay Zeka Analizi Sürüyor</span>
          </div>
          <h3 className="text-xl font-black text-white font-heading tracking-tight">
            İhaleciBurada Değerleme Motoru
          </h3>
          <p className="text-xs text-slate-400 font-medium min-h-[36px] transition-all duration-300">
            {statusText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
            <span>İşleniyor</span>
            <span className="text-amber-400">%{progress}</span>
          </div>
        </div>

        {/* Bottom Badges */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            TCMB EVDS
          </span>
          <span className="flex items-center gap-1">
            <Gavel className="w-3.5 h-3.5 text-amber-400" />
            İİK m.115 %50
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            TKGM Kadastro
          </span>
        </div>
      </div>
    </div>
  );
};
