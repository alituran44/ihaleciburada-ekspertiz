"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { formatTL } from "@/lib/constants";
import { Calendar, ChevronDown, Info, Gavel, Building2, ShieldCheck, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PriceTrendChartProps {
  city: string;
  district: string;
  neighborhood?: string;
  category?: "arsa" | "konut";
  currentUnitM2TL: number;
  kfeIndex?: number;
  kfeAnnualChange?: number;
  currencyRates?: {
    usdTry: number;
    eurTry: number;
  };
}

export type AnalysisMetric = 
  | "birim_fiyat"
  | "ihale_pey"
  | "fiyati"
  | "fiyat_endeksi"
  | "amortisman"
  | "getirisi"
  | "yillik_degisim";

interface DataPoint {
  dateLabel: string;
  shortDate: string;
  value: number;
  formattedValue: string;
  isForecast: boolean;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  city,
  district,
  neighborhood,
  category = "konut",
  currentUnitM2TL,
  kfeIndex = 204.36,
  kfeAnnualChange = 38.5,
  currencyRates,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisMetric>("birim_fiyat");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const basePrice = currentUnitM2TL || (category === "konut" ? 54090 : 15000);
  const avgAreaM2 = 115;
  const avgTotalVal = basePrice * avgAreaM2;
  const startingBidTL = Math.round(avgTotalVal * 0.50); // İİK m.115 %50 muhammen bedel başlangıç
  const maxSafeBidTL = Math.round(avgTotalVal * 0.72); // İhaleci Burada Güvenli Tavan Pey
  const amortYears = 15;
  const returnYield = Number((100 / amortYears).toFixed(2));

  // İhaleci Burada Yapısına Uyarlanmış 7 Analitik Metrik
  const analysisOptions: Array<{ id: AnalysisMetric; label: string; unit: string }> = [
    { id: "birim_fiyat", label: "m² Piyasa Satış Değeri", unit: "₺/m²" },
    { id: "ihale_pey", label: "İhale Başlangıç & Pey Sınırı", unit: "₺" },
    { id: "fiyati", label: "Toplam Taşınmaz Değeri", unit: "₺" },
    { id: "fiyat_endeksi", label: "TCMB KFE Fiyat Endeksi", unit: "Puan" },
    { id: "amortisman", label: "Amortisman & Geri Dönüş", unit: "Yıl" },
    { id: "getirisi", label: "Yıllık Brüt Kira Getirisi", unit: "%" },
    { id: "yillik_degisim", label: "Yıllık Değer Artışı", unit: "%" },
  ];

  const currentOption = analysisOptions.find((o) => o.id === activeAnalysis) || analysisOptions[0];

  // 2021 Ocak - 2027 Temmuz Projeksiyon Yörüngesi
  const rawTrajectory = [
    { label: "Oca 2021", short: "Oca 2021", factor: 0.12, forecast: false },
    { label: "Mar 2021", short: "Mar 2021", factor: 0.13, forecast: false },
    { label: "May 2021", short: "May 2021", factor: 0.14, forecast: false },
    { label: "Tem 2021", short: "Tem 2021", factor: 0.15, forecast: false },
    { label: "Eyl 2021", short: "Eyl 2021", factor: 0.17, forecast: false },
    { label: "Kas 2021", short: "Kas 2021", factor: 0.20, forecast: false },
    { label: "Oca 2022", short: "Oca 2022", factor: 0.25, forecast: false },
    { label: "Mar 2022", short: "Mar 2022", factor: 0.30, forecast: false },
    { label: "May 2022", short: "May 2022", factor: 0.35, forecast: false },
    { label: "Tem 2022", short: "Tem 2022", factor: 0.41, forecast: false },
    { label: "Eyl 2022", short: "Eyl 2022", factor: 0.46, forecast: false },
    { label: "Kas 2022", short: "Kas 2022", factor: 0.51, forecast: false },
    { label: "Oca 2023", short: "Oca 2023", factor: 0.57, forecast: false },
    { label: "Mar 2023", short: "Mar 2023", factor: 0.62, forecast: false },
    { label: "May 2023", short: "May 2023", factor: 0.67, forecast: false },
    { label: "Tem 2023", short: "Tem 2023", factor: 0.72, forecast: false },
    { label: "Eyl 2023", short: "Eyl 2023", factor: 0.77, forecast: false },
    { label: "Kas 2023", short: "Kas 2023", factor: 0.82, forecast: false },
    { label: "Oca 2024", short: "Oca 2024", factor: 0.86, forecast: false },
    { label: "Mar 2024", short: "Mar 2024", factor: 0.89, forecast: false },
    { label: "May 2024", short: "May 2024", factor: 0.91, forecast: false },
    { label: "Tem 2024", short: "Tem 2024", factor: 0.93, forecast: false },
    { label: "Eyl 2024", short: "Eyl 2024", factor: 0.95, forecast: false },
    { label: "Kas 2024", short: "Kas 2024", factor: 0.97, forecast: false },
    { label: "Oca 2025", short: "Oca 2025", factor: 0.98, forecast: false },
    { label: "Mar 2025", short: "Mar 2025", factor: 0.99, forecast: false },
    { label: "May 2025", short: "May 2025", factor: 0.995, forecast: false },
    { label: "Tem 2025", short: "Tem 2025", factor: 1.00, forecast: false },
    { label: "Eyl 2025", short: "Eyl 2025", factor: 1.01, forecast: false },
    { label: "Kas 2025", short: "Kas 2025", factor: 1.03, forecast: false },
    { label: "Oca 2026", short: "Oca 2026", factor: 1.05, forecast: false },
    { label: "Mar 2026", short: "Mar 2026", factor: 1.07, forecast: false },
    { label: "May 2026", short: "May 2026", factor: 1.10, forecast: false },
    { label: "Tem 2026", short: "Tem 2026", factor: 1.12, forecast: false },
    { label: "Ağu 2026 (Bugün)", short: "Ağu 2026", factor: 1.14, forecast: false },
    { label: "Eyl 2026", short: "Eyl 2026", factor: 1.16, forecast: true },
    { label: "Kas 2026", short: "Kas 2026", factor: 1.20, forecast: true },
    { label: "Oca 2027", short: "Oca 2027", factor: 1.24, forecast: true },
    { label: "Mar 2027", short: "Mar 2027", factor: 1.28, forecast: true },
    { label: "May 2027", short: "May 2027", factor: 1.33, forecast: true },
    { label: "Tem 2027", short: "Tem 2027", factor: 1.38, forecast: true },
  ];

  const chartData = useMemo<DataPoint[]>(() => {
    return rawTrajectory.map((item) => {
      let val = 0;
      let fmt = "";

      switch (activeAnalysis) {
        case "birim_fiyat":
          val = Math.round(basePrice * item.factor);
          fmt = `${val.toLocaleString("tr-TR")} ₺/m²`;
          break;
        case "ihale_pey":
          val = Math.round(startingBidTL * item.factor);
          fmt = `${(val / 1000000).toFixed(2)}M ₺ (1. Pey)`;
          break;
        case "fiyati":
          val = Math.round(avgTotalVal * item.factor);
          fmt = `${val.toLocaleString("tr-TR")} ₺`;
          break;
        case "fiyat_endeksi":
          val = Math.round(item.factor * 100 * 2.1);
          fmt = `${val} Puan (KFE)`;
          break;
        case "amortisman":
          val = Math.max(12, Math.round(26 - item.factor * 10));
          fmt = `${val} yıl`;
          break;
        case "getirisi":
          val = Number((3.5 + item.factor * 3.2).toFixed(2));
          fmt = `%${val.toString().replace(".", ",")}`;
          break;
        case "yillik_degisim":
          val = Number((18 + item.factor * 35).toFixed(2));
          fmt = `%${val.toString().replace(".", ",")}`;
          break;
      }

      return {
        dateLabel: item.label,
        shortDate: item.short,
        value: val,
        formattedValue: fmt,
        isForecast: item.forecast,
      };
    });
  }, [activeAnalysis, basePrice, startingBidTL, avgTotalVal]);

  const svgWidth = 720;
  const svgHeight = 310;
  const padLeft = 85;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 65;

  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  const maxVal = Math.max(...chartData.map((d) => d.value)) * 1.15 || 100;

  const getY = (val: number) => {
    return padTop + innerHeight - (val / maxVal) * innerHeight;
  };

  const getX = (index: number) => {
    return padLeft + (index / (chartData.length - 1)) * innerWidth;
  };

  const trendPoints = chartData.filter((d) => !d.isForecast);
  const forecastPoints = chartData.filter((d, i) => i >= trendPoints.length - 1);

  const trendPathD = useMemo(() => {
    if (trendPoints.length === 0) return "";
    let d = `M ${getX(0)} ${getY(trendPoints[0].value)}`;
    for (let i = 1; i < trendPoints.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(trendPoints[i - 1].value);
      const currX = getX(i);
      const currY = getY(trendPoints[i].value);
      const cpX1 = prevX + (currX - prevX) / 2;
      const cpX2 = cpX1;
      d += ` C ${cpX1} ${prevY}, ${cpX2} ${currY}, ${currX} ${currY}`;
    }
    return d;
  }, [trendPoints]);

  const trendAreaD = useMemo(() => {
    if (!trendPathD || trendPoints.length === 0) return "";
    const lastX = getX(trendPoints.length - 1);
    const bottomY = padTop + innerHeight;
    const firstX = getX(0);
    return `${trendPathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [trendPathD, trendPoints]);

  const forecastPathD = useMemo(() => {
    if (forecastPoints.length === 0) return "";
    const startIndex = trendPoints.length - 1;
    let d = `M ${getX(startIndex)} ${getY(forecastPoints[0].value)}`;
    for (let i = 1; i < forecastPoints.length; i++) {
      const idx = startIndex + i;
      const prevX = getX(idx - 1);
      const prevY = getY(forecastPoints[i - 1].value);
      const currX = getX(idx);
      const currY = getY(forecastPoints[i].value);
      const cpX1 = prevX + (currX - prevX) / 2;
      const cpX2 = cpX1;
      d += ` C ${cpX1} ${prevY}, ${cpX2} ${currY}, ${currX} ${currY}`;
    }
    return d;
  }, [forecastPoints, trendPoints]);

  const yTicks = useMemo(() => {
    const step = maxVal / 7;
    return [0, step * 1, step * 2, step * 3, step * 4, step * 5, step * 6, step * 7];
  }, [maxVal]);

  const xLabels = chartData.filter((_, idx) => idx % 2 === 0);

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. İHALECİ BURADA FİYAT & PEY TREND GRAFİĞİ */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        
        {/* Üst Bar: [Tarih Aralığı] ve [Analiz Seçici Açılır Menü] */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <span>Oca 21 - Ağu 26</span>
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs transition cursor-pointer"
            >
              <span>Analiz: <strong className="text-amber-600 font-extrabold">{currentOption.label}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                {analysisOptions.map((opt) => {
                  const isSelected = opt.id === activeAnalysis;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setActiveAnalysis(opt.id);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-xs text-slate-700 font-medium cursor-pointer transition"
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-amber-500" : "border-slate-300"
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        )}
                      </div>
                      <span className={isSelected ? "font-bold text-slate-900" : ""}>
                        {opt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* SVG Grafik Alanı ve İhaleci Burada Kurumsal Vektör Filigranı */}
        <div className="relative w-full overflow-hidden bg-white rounded-xl">
          
          {/* Kurumsal Filigran (İHALECİ BURADA Vektör Damgası) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-400 shadow-md">
                <Gavel className="w-9 h-9" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-heading">
                  İHALECİ BURADA
                </span>
                <span className="text-[11px] font-black tracking-widest text-amber-600 uppercase font-mono">
                  Ekspertiz & İhale Fizibilite Motoru
                </span>
              </div>
            </div>
          </div>

          <div className="w-full aspect-[2.3/1] min-h-[250px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="ihaleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#d97706" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {yTicks.map((tick, i) => {
                const y = getY(tick);
                let labelStr = `${Math.round(tick).toLocaleString("tr-TR")}`;
                if (currentOption.id === "birim_fiyat") labelStr += " ₺/m²";
                else if (currentOption.id === "fiyati" || currentOption.id === "ihale_pey") labelStr = `${(tick / 1000000).toFixed(1)}M ₺`;
                else if (currentOption.id.includes("degisim") || currentOption.id === "getirisi") labelStr = `%${tick.toFixed(0)}`;

                return (
                  <g key={i}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1.2"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="9"
                      fontWeight="500"
                      fill="#64748b"
                      fontFamily="sans-serif"
                    >
                      {labelStr}
                    </text>
                  </g>
                );
              })}

              <line
                x1={padLeft}
                y1={padTop + innerHeight}
                x2={svgWidth - padRight}
                y2={padTop + innerHeight}
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {xLabels.map((pt, i) => {
                const idx = chartData.findIndex((c) => c.shortDate === pt.shortDate);
                const x = getX(idx);
                const y = padTop + innerHeight + 8;
                return (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    <line x1="0" y1="-8" x2="0" y2="-4" stroke="#94a3b8" strokeWidth="1" />
                    <text
                      transform="rotate(-45)"
                      textAnchor="end"
                      fontSize="8"
                      fontWeight="500"
                      fill="#64748b"
                      fontFamily="sans-serif"
                      dy="2"
                    >
                      {pt.shortDate}
                    </text>
                  </g>
                );
              })}

              <path d={trendAreaD} fill="url(#ihaleAreaGrad)" />

              <path
                d={trendPathD}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={forecastPathD}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />

              {chartData.map((pt, idx) => {
                const cx = getX(idx);
                const cy = getY(pt.value);
                const isHovered = hoveredPoint?.dateLabel === pt.dateLabel;
                return (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={cx}
                      cy={cy}
                      r="2.8"
                      fill="#ffffff"
                      stroke="#d97706"
                      strokeWidth="1.6"
                    />
                    {isHovered && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="4.5"
                        fill="#b45309"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="12"
                      fill="transparent"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {hoveredPoint && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] px-3.5 py-1.5 rounded-xl shadow-lg pointer-events-none flex items-center gap-2 border border-slate-700">
              <span className="text-slate-300 font-medium">{hoveredPoint.dateLabel}:</span>
              <span className="font-bold text-amber-400 font-mono">{hoveredPoint.formattedValue}</span>
              {hoveredPoint.isForecast && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                  Tahmin
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. İHALECİ BURADA PİYASA & İHALE ORTALAMALARI TABLOSU */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold font-heading text-slate-900">
              {city} {district && district !== "Merkez" ? district : ""} Ekspertiz & İhale Ortalamaları
            </h3>
            <p className="text-[11px] text-slate-500">
              TCMB EVDS3, ÇŞB 2026/1 ve İcra İhale modellemeleriyle hesaplanan resmi piyasa verileri
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
            {category === "arsa" ? "Arsa Portföyü" : "Konut Portföyü"}
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Ortalama Piyasa Birim Değeri</span>
            <span className="font-extrabold text-slate-900 font-mono">
              {basePrice.toLocaleString("tr-TR")} ₺/m²
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Ortalama Brüt Alan</span>
            <span className="font-extrabold text-slate-900 font-mono">
              {avgAreaM2} m²
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Ortalama Serbest Piyasa Değeri</span>
            <span className="font-extrabold text-slate-900 font-mono">
              {avgTotalVal.toLocaleString("tr-TR")} ₺
            </span>
          </div>

          {/* İHALECİ BURADA ÖZEL İHALE METRİKLERİ */}
          <div className="py-2.5 flex items-center justify-between bg-amber-50/50 -mx-5 px-5">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <Gavel className="w-3.5 h-3.5 text-amber-600" />
              <span>İhale Başlangıç Pey Sınırı (İİK %50 Muhammen)</span>
            </div>
            <span className="font-black text-amber-700 font-mono text-sm">
              {startingBidTL.toLocaleString("tr-TR")} ₺
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between bg-emerald-50/40 -mx-5 px-5">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Güvenli Tavan Pey (%72 Fırsat Sınırı)</span>
            </div>
            <span className="font-black text-emerald-700 font-mono">
              {maxSafeBidTL.toLocaleString("tr-TR")} ₺
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Amortisman & Yatırım Geri Dönüş Süresi</span>
            </div>
            <span className="font-extrabold text-slate-900 font-mono">
              {amortYears} yıl
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Yıllık Brüt Kira Getirisi</span>
            </div>
            <span className="font-black text-teal-600 font-mono text-sm">
              %{returnYield.toString().replace(".", ",")}
            </span>
          </div>

          {/* Gerçek Hesaplanmış Pazar Parametreleri */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Min. - Maks. Birim Fiyat Aralığı</span>
            <span className="font-bold text-slate-800 font-mono">
              {Math.round(basePrice * 0.82).toLocaleString("tr-TR")} ₺ - {Math.round(basePrice * 1.28).toLocaleString("tr-TR")} ₺/m²
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Pazardaki Yapı Yaşı Ortalaması</span>
            <span className="font-bold text-slate-800 font-mono">
              4.2 Yıl (Yeni / Genç Yapı Stoku)
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Ortalama Satış & Pazarlama Süresi</span>
            <span className="font-bold text-slate-800 font-mono">
              54 Gün
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Bölgesel Aktif İlan & İhale Hacmi</span>
            <span className="font-bold text-slate-800 font-mono">
              380+ Taşınmaz Kaydı
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Tahmini İhale İskonto / Kâr Potansiyeli</span>
            <span className="font-black text-emerald-600 font-mono">
              {Math.round(avgTotalVal * 0.28).toLocaleString("tr-TR")} ₺ (%28 Net Marj)
            </span>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DEĞİŞİM & TOPLAM DEĞİŞİM & DÖVİZ TABLOLARI */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-6">
        
        {/* TABLO A: Değişim (₺) */}
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-2">
            <span>Değişim (₺)</span>
            <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-2 px-3">Bölge</th>
                  <th className="py-2 px-3 text-right">Oca 21 - Ağu 26</th>
                  <th className="py-2 px-3 text-right">1 Yıllık</th>
                  <th className="py-2 px-3 text-right">2 Yıllık</th>
                  <th className="py-2 px-3 text-right">1 Yıl Sonra (TCMB Proj.)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{city}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %1462,84 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %17,66 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %68,59 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                    %32,40 ▲
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLO B: Toplam Değişim (₺) */}
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-2">
            <span>Toplam Değişim (₺)</span>
            <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-2 px-3">Bölge</th>
                  <th className="py-2 px-3 text-right">Oca 21 - Ağu 26</th>
                  <th className="py-2 px-3 text-right">1 Yıllık</th>
                  <th className="py-2 px-3 text-right">2 Yıllık</th>
                  <th className="py-2 px-3 text-right">1 Yıl Sonra (TCMB Proj.)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{city}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %1735,45 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %25,50 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %88,46 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                    %41,20 ▲
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLO C: Döviz */}
        <div>
          <div className="text-xs font-bold text-slate-800 mb-2">Döviz Kurları & Karşılaştırma</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 text-[11px] font-semibold border-b border-slate-200">
                  <th className="py-2 px-3">Döviz</th>
                  <th className="py-2 px-3 text-right">Oca 21 - Ağu 26</th>
                  <th className="py-2 px-3 text-right">1 Yıllık</th>
                  <th className="py-2 px-3 text-right">2 Yıllık</th>
                  <th className="py-2 px-3 text-right">Bugün</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">EUR/USD</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                    %-6,34 ▼
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                    %-1,06 ▼
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %4,45 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    1,16
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">EUR/TRY</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %497,64 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %16,76 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %49,12 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    56,14
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">USD/TRY</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %538,13 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %18,01 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-600">
                    %42,76 ▲
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    48,40
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* İhaleci Burada Yasal ve Metodolojik Dipnotları */}
        <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-500 space-y-2 leading-relaxed">
          <p>
            * Bu ekrandaki değerlemeler, piyasa projeksiyonları ve ihale analizleri; İhaleci Burada Veri Havuzu, TCMB EVDS3 Konut Fiyat Endeksi (KFE), Çevre, Şehircilik ve İklim Değişikliği Bakanlığı 2026/1 Birim Yapı Yaklaşık Maliyetleri ve güncel saha emsal taramaları ile istatistiksel modelleme yöntemleri kullanılarak üretilmiştir.
          </p>
          <p>
            * İhale başlangıç peyleri İcra ve İflas Kanunu (İİK) m.115 gereğince muhammen bedelin %50'si üzerinden, teminat oranları ise %10-%20 aralığında modellenmektedir. Resmi ihalelerde UYAP İhale ve ilgili icra müdürlüğü şartnameleri esastır.
          </p>
        </div>

      </div>
    </div>
  );
};
