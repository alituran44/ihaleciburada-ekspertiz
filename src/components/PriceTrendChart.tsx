"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { formatTL } from "@/lib/constants";
import { Calendar, ChevronDown, Info } from "lucide-react";

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
  | "fiyat_endeksi"
  | "birim_fiyat"
  | "fiyati"
  | "amortisman"
  | "getirisi"
  | "aylik_degisim"
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

  // Dışarı tıklandığında dropdown kapatma
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
  const amortYears = 15;
  const returnYield = Number((100 / amortYears).toFixed(2)); // %6.67 - %6.86

  // 7 Farklı Analiz Başlığı (Ekran Görüntüsü 1'deki Radyo Buton Menüsü)
  const analysisOptions: Array<{ id: AnalysisMetric; label: string; unit: string }> = [
    { id: "fiyat_endeksi", label: "Fiyat Endeksi", unit: "Puan" },
    { id: "birim_fiyat", label: "m² Birim Fiyatı", unit: "₺/m²" },
    { id: "fiyati", label: "Fiyatı", unit: "₺" },
    { id: "amortisman", label: "Amortisman", unit: "Yıl" },
    { id: "getirisi", label: "Getirisi", unit: "%" },
    { id: "aylik_degisim", label: "Aylık Değişimi", unit: "%" },
    { id: "yillik_degisim", label: "Yıllık Değişimi", unit: "%" },
  ];

  const currentOption = analysisOptions.find((o) => o.id === activeAnalysis) || analysisOptions[1];

  // 2021 Ocak - 2027 Temmuz Zaman Çizelgesi
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
    // Gelecek Projeksiyonu (Noktalı Forecast)
    { label: "Eyl 2026", short: "Eyl 2026", factor: 1.16, forecast: true },
    { label: "Kas 2026", short: "Kas 2026", factor: 1.20, forecast: true },
    { label: "Oca 2027", short: "Oca 2027", factor: 1.24, forecast: true },
    { label: "Mar 2027", short: "Mar 2027", factor: 1.28, forecast: true },
    { label: "May 2027", short: "May 2027", factor: 1.33, forecast: true },
    { label: "Tem 2027", short: "Tem 2027", factor: 1.38, forecast: true },
  ];

  // Aktif Analiz Moduna Göre Veri Noktaları
  const chartData = useMemo<DataPoint[]>(() => {
    return rawTrajectory.map((item) => {
      let val = 0;
      let fmt = "";

      switch (activeAnalysis) {
        case "fiyat_endeksi":
          val = Math.round(item.factor * 100 * 2.1);
          fmt = `${val} Puan`;
          break;
        case "birim_fiyat":
          val = Math.round(basePrice * item.factor);
          fmt = `${val.toLocaleString("tr-TR")} ₺/m²`;
          break;
        case "fiyati":
          val = Math.round(avgTotalVal * item.factor);
          fmt = `${val.toLocaleString("tr-TR")} ₺`;
          break;
        case "amortisman":
          val = Math.max(12, Math.round(26 - item.factor * 10));
          fmt = `${val} yıl`;
          break;
        case "getirisi":
          val = Number((3.5 + item.factor * 3.2).toFixed(2));
          fmt = `%${val.toString().replace(".", ",")}`;
          break;
        case "aylik_degisim":
          val = Number((1.2 + (item.factor % 0.1) * 15).toFixed(2));
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
  }, [activeAnalysis, basePrice, avgTotalVal]);

  // SVG Boyutları (Endeksa Oranları: Yüksek Çözünürlüklü ve Geniş)
  const svgWidth = 720;
  const svgHeight = 310;
  const padLeft = 85;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 65;

  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  const maxVal = Math.max(...chartData.map((d) => d.value)) * 1.15 || 100;
  const minVal = 0;

  const getY = (val: number) => {
    return padTop + innerHeight - (val / maxVal) * innerHeight;
  };

  const getX = (index: number) => {
    return padLeft + (index / (chartData.length - 1)) * innerWidth;
  };

  const trendPoints = chartData.filter((d) => !d.isForecast);
  const forecastPoints = chartData.filter((d, i) => i >= trendPoints.length - 1);

  // Trend Alanı
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

  // Forecast Yolu
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

  // Y-Eksen Kademeleri (Endeksa Görsel 1: 0, 10k, 20k, 30k, 40k, 50k, 60k, 70k)
  const yTicks = useMemo(() => {
    const step = maxVal / 7;
    return [0, step * 1, step * 2, step * 3, step * 4, step * 5, step * 6, step * 7];
  }, [maxVal]);

  // X-Eksen Etiketleri (Her 2 ayda bir gösterim)
  const xLabels = chartData.filter((_, idx) => idx % 2 === 0);

  const currentPoint = trendPoints[trendPoints.length - 1];
  const currentPointX = getX(trendPoints.length - 1);
  const currentPointY = getY(currentPoint.value);

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. ENDEKSA GRAFİK KARTI (EKRAN GÖRÜNTÜSÜ 1) */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        
        {/* Üst Bar: [Tarih Aralığı] ve [Analiz Seçici Açılır Menü] */}
        <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
          
          {/* Sol: Tarih Aralığı Rozeti */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
            <span>Oca 21 - Ağu 26</span>
            <Calendar className="w-3.5 h-3.5 text-rose-600" />
          </div>

          {/* Sağ: Analiz Seçici Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shadow-2xs transition cursor-pointer"
            >
              <span>Analiz: <strong className="text-rose-600 font-extrabold">{currentOption.label}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Görsel 1'deki Radyo Butonlu Açılır Pencere */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
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
                        isSelected ? "border-rose-600" : "border-slate-300"
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-rose-600"></div>
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

        {/* SVG Grafik Alanı ve Arka Plan Endeksa Filigranı */}
        <div className="relative w-full overflow-hidden bg-white rounded-xl">
          
          {/* Filigran (Endeksa Logosu ve Evi) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-3xl font-black">
                ⌂
              </div>
              <span className="text-5xl font-black tracking-tighter text-rose-950 font-heading">
                endeksa
              </span>
            </div>
          </div>

          <div className="w-full aspect-[2.3/1] min-h-[250px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Endeksa Açık Camgöbeği Mavi Degradisi */}
                <linearGradient id="endeksaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Yatay Izgara Çizgileri ve Y-Eksen Etiketleri */}
              {yTicks.map((tick, i) => {
                const y = getY(tick);
                let labelStr = `${Math.round(tick).toLocaleString("tr-TR")}`;
                if (currentOption.id === "birim_fiyat") labelStr += " ₺/m²";
                else if (currentOption.id === "fiyati") labelStr = `${(tick / 1000000).toFixed(1)}M ₺`;
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

              {/* X-Eksen Çizgisi */}
              <line
                x1={padLeft}
                y1={padTop + innerHeight}
                x2={svgWidth - padRight}
                y2={padTop + innerHeight}
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* X-Eksen Etiketleri (45 Derece Döndürülmüş - Görsel 1 Birebir) */}
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

              {/* Doldurulmuş Mavi Alan */}
              <path d={trendAreaD} fill="url(#endeksaAreaGrad)" />

              {/* Mavi Çizgi (Trend) */}
              <path
                d={trendPathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Forecast (Gelecek Projeksiyonu Kesikli Çizgi) */}
              <path
                d={forecastPathD}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />

              {/* Noktalar (Çemberler) */}
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
                      stroke="#0284c7"
                      strokeWidth="1.6"
                    />
                    {isHovered && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="4.5"
                        fill="#e11d48"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                    {/* Görünmez Geniş Tıklama Alanı */}
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

          {/* Hover Araç İpucu (Tooltip) */}
          {hoveredPoint && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center gap-2">
              <span className="text-slate-300 font-medium">{hoveredPoint.dateLabel}:</span>
              <span className="font-bold text-sky-400 font-mono">{hoveredPoint.formattedValue}</span>
              {hoveredPoint.isForecast && (
                <span className="text-[9px] bg-rose-600 px-1.5 py-0.5 rounded font-bold">Tahmin</span>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SATILIK KONUT ORTALAMALARI KARTI (EKRAN GÖRÜNTÜSÜ 5) */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-base font-extrabold font-heading text-slate-900 text-center mb-4 pb-2 border-b border-slate-100">
          {city} {district && district !== "Merkez" ? district : ""} Satılık {category === "arsa" ? "Arsa" : "Konut"} Ortalamaları
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          
          {/* Ortalama Birim Fiyat */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Ortalama Birim Fiyat</span>
            <span className="font-extrabold text-slate-900 font-mono">
              {basePrice.toLocaleString("tr-TR")} ₺/m²
            </span>
          </div>

          {/* Ortalama Brüt Alan */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Ortalama Brüt Alan</span>
            <span className="font-extrabold text-slate-900 font-mono">
              {avgAreaM2} m²
            </span>
          </div>

          {/* Ortalama Fiyat */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Ortalama Fiyat</span>
            <span className="font-extrabold text-slate-900 font-mono">
              {avgTotalVal.toLocaleString("tr-TR")} ₺
            </span>
          </div>

          {/* Geri Dönüş Süresi */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Geri Dönüş Süresi</span>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
              <span className="text-[10px] text-slate-400">Bilgi</span>
            </div>
            <span className="font-extrabold text-slate-900 font-mono">
              {amortYears} yıl
            </span>
          </div>

          {/* Getiri */}
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Getiri</span>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
              <span className="text-[10px] text-slate-400">Bilgi</span>
            </div>
            <span className="font-black text-teal-600 font-mono text-sm">
              %{returnYield.toString().replace(".", ",")}
            </span>
          </div>

          {/* Kilitli Pro Özellikler (Endeksa Görsel 5 Birebir) */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Min. Maks. Birim Fiyat</span>
            <button type="button" className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 font-medium">
              Erişim Alın
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Pazardaki Yaş Ortalaması</span>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
              <span className="text-[10px] text-slate-400">Bilgi</span>
            </div>
            <button type="button" className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 font-medium">
              Erişim Alın
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Ortalama Pazarlama Süresi</span>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
              <span className="text-[10px] text-slate-400">Bilgi</span>
            </div>
            <button type="button" className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 font-medium">
              Erişim Alın
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Stok Adedi</span>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
              <span className="text-[10px] text-slate-400">Bilgi</span>
            </div>
            <button type="button" className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 font-medium">
              Erişim Alın
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Stok Oranı</span>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
              <span className="text-[10px] text-slate-400">Bilgi</span>
            </div>
            <button type="button" className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 font-medium">
              Erişim Alın
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Stok Değişimi</span>
              <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">i</span>
              <span className="text-[10px] text-slate-400">Bilgi</span>
            </div>
            <button type="button" className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 font-medium">
              Erişim Alın
            </button>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DEĞİŞİM & TOPLAM DEĞİŞİM & DÖVİZ (EKRAN GÖRÜNTÜSÜ 2) */}
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
                  <th className="py-2 px-3 text-right">1 Yıl Sonra</th>
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
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 cursor-pointer">
                      Erişim Alın
                    </span>
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
                  <th className="py-2 px-3 text-right">1 Yıl Sonra</th>
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
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-slate-500 border-b border-dotted border-slate-500 hover:text-rose-600 cursor-pointer">
                      Erişim Alın
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLO C: Döviz */}
        <div>
          <div className="text-xs font-bold text-slate-800 mb-2">Döviz</div>
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

        {/* Endeksa Yasal ve Metodolojik Dipnotları */}
        <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-2 leading-relaxed">
          <p>
            * Bu ekrandaki tahminler, www.endeksa.com tarafından satış, saha çalışmaları ve internette yer alan verilere dayalı istatistiksel modelleme yöntemleri ile üretilmiştir ve sapmalar içerebilir. Burada yer alan bilgiler ve tahminler, varsayımsal olup herhangi bir taahhüt veya kesinlik içermez. Bu kapsamda buradaki bilgiler ve tahminler, müşteri için sadece tavsiye niteliğinde olup öngörü amaçlıdır; herhangi bir şekilde www.endeksa.com veya müşteriler için hukuki bağlayıcılığı olamaz. Bu bilgi ve tahminlerin bir yatırıma veya ticarete konu edilmesi halinde www.endeksa.com herhangi bir sorumluluk üstlenmez.
          </p>
          <p>
            * Trendlerin son 3 ayını kapsayan pencere dönemi içerisinde, yeni verilerin eklenmesiyle, değerlerde düşük miktarda değişimler gözlemlenebilir.
          </p>
        </div>

      </div>
    </div>
  );
};
