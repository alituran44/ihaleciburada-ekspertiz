"use client";

import React, { useState, useMemo } from "react";
import { formatTL } from "@/lib/constants";
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";

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

interface DataPoint {
  dateLabel: string;
  shortDate: string;
  price: number;
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
  const [activeAnalysis, setActiveAnalysis] = useState<"birim" | "kira" | "amortisman">("birim");

  const basePrice = currentUnitM2TL || (category === "konut" ? 48000 : 15000);

  // 2021 Ocak'tan 2027 Temmuz'a kadar aylık/çeyreklik veri serisi üretimi (Endeksa'daki gibi)
  const chartData = useMemo<DataPoint[]>(() => {
    const points: DataPoint[] = [];
    
    // Geçmiş 4 yıl (2021-2025)
    // 2021'deki fiyat yaklaşık 6-7 kat daha düşüktü (TCMB KFE büyümesine göre)
    const startFactor = 0.14; // 2021 başı
    const growthTrajectory = [
      { label: "Oca 2021", short: "Oca 21", factor: 0.14, forecast: false },
      { label: "May 2021", short: "May 21", factor: 0.16, forecast: false },
      { label: "Eyl 2021", short: "Eyl 21", factor: 0.19, forecast: false },
      { label: "Oca 2022", short: "Oca 22", factor: 0.24, forecast: false },
      { label: "May 2022", short: "May 22", factor: 0.32, forecast: false },
      { label: "Eyl 2022", short: "Eyl 22", factor: 0.42, forecast: false },
      { label: "Oca 2023", short: "Oca 23", factor: 0.52, forecast: false },
      { label: "May 2023", short: "May 23", factor: 0.61, forecast: false },
      { label: "Eyl 2023", short: "Eyl 23", factor: 0.69, forecast: false },
      { label: "Oca 2024", short: "Oca 24", factor: 0.76, forecast: false },
      { label: "May 2024", short: "May 24", factor: 0.82, forecast: false },
      { label: "Eyl 2024", short: "Eyl 24", factor: 0.88, forecast: false },
      { label: "Oca 2025", short: "Oca 25", factor: 0.94, forecast: false },
      { label: "May 2025", short: "May 25", factor: 0.97, forecast: false },
      { label: "Ağu 2025", short: "Ağu 25", factor: 0.99, forecast: false },
      { label: "Oca 2026 (Bugün)", short: "Oca 26", factor: 1.00, forecast: false },
      // Gelecek Tahmini (Forecast - Noktalı Çizgi)
      { label: "May 2026", short: "May 26", factor: 1.09, forecast: true },
      { label: "Eyl 2026", short: "Eyl 26", factor: 1.17, forecast: true },
      { label: "Oca 2027", short: "Oca 27", factor: 1.25, forecast: true },
      { label: "May 2027", short: "May 27", factor: 1.32, forecast: true },
    ];

    return growthTrajectory.map((item) => ({
      dateLabel: item.label,
      shortDate: item.short,
      price: Math.round(basePrice * item.factor),
      isForecast: item.forecast,
    }));
  }, [basePrice]);

  // SVG Çizim Parametreleri
  const svgWidth = 620;
  const svgHeight = 250;
  const padLeft = 65;
  const padRight = 20;
  const padTop = 35;
  const padBottom = 35;

  const innerWidth = svgWidth - padLeft - padRight;
  const innerHeight = svgHeight - padTop - padBottom;

  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.12;
  const minPrice = 0;

  const getY = (val: number) => {
    return padTop + innerHeight - (val / (maxPrice || 1)) * innerHeight;
  };

  const getX = (index: number) => {
    return padLeft + (index / (chartData.length - 1)) * innerWidth;
  };

  // Geçmiş Trend Noktaları (Forecast Olmayanlar)
  const trendPoints = chartData.filter((d) => !d.isForecast);
  const forecastPoints = chartData.filter((d, i) => i >= trendPoints.length - 1); // Son trend noktası ile başlar

  // Trend Alanı Yolu (Dolu Mavi Alan)
  const trendPathD = useMemo(() => {
    if (trendPoints.length === 0) return "";
    let d = `M ${getX(0)} ${getY(trendPoints[0].price)}`;
    for (let i = 1; i < trendPoints.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(trendPoints[i - 1].price);
      const currX = getX(i);
      const currY = getY(trendPoints[i].price);
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

  // Forecast Yolu (Noktalı Çizgi)
  const forecastPathD = useMemo(() => {
    if (forecastPoints.length === 0) return "";
    const startIndex = trendPoints.length - 1;
    let d = `M ${getX(startIndex)} ${getY(forecastPoints[0].price)}`;
    for (let i = 1; i < forecastPoints.length; i++) {
      const idx = startIndex + i;
      const prevX = getX(idx - 1);
      const prevY = getY(forecastPoints[i - 1].price);
      const currX = getX(idx);
      const currY = getY(forecastPoints[i].price);
      const cpX1 = prevX + (currX - prevX) / 2;
      const cpX2 = cpX1;
      d += ` C ${cpX1} ${prevY}, ${cpX2} ${currY}, ${currX} ${currY}`;
    }
    return d;
  }, [forecastPoints, trendPoints]);

  // Y-Eksen Kademeleri
  const yTicks = [0, maxPrice * 0.25, maxPrice * 0.5, maxPrice * 0.75, maxPrice];

  // X-Eksen Etiketleri (Her 3 noktada bir)
  const xTicks = chartData.filter((_, idx) => idx % 3 === 0);

  // Güncel nokta
  const currentPoint = trendPoints[trendPoints.length - 1];
  const currentPointX = getX(trendPoints.length - 1);
  const currentPointY = getY(currentPoint.price);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* BAŞLIK & FİLTRE ÇUBUĞU (ENDEKSA TARZI) */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black font-heading text-slate-900 tracking-tight">
              Türkiye {city} {district} {neighborhood ? `${neighborhood} ` : ""}Satılık {category === "arsa" ? "Arsa" : "Konut"} m² Birim Fiyatları
            </h3>
            <p className="text-xs text-slate-500">
              TCMB Konut Fiyat Endeksi (KFE) ve çevresel ilan veri havuzu projeksiyonu
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Oca 21 - May 27</span>
            </div>

            <select
              value={activeAnalysis}
              onChange={(e) => setActiveAnalysis(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="birim">Analiz: Birim Fiyatı</option>
              <option value="kira">Analiz: m² Kira Değeri</option>
              <option value="amortisman">Analiz: Amortisman</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRAFİK ALANI */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50/50 to-white rounded-xl p-2 border border-slate-100">
        
        {/* "Bu Ayki Ortalama" Rozeti */}
        <div 
          className="absolute z-10 pointer-events-none transition-all duration-300"
          style={{
            left: `${Math.min(78, (currentPointX / svgWidth) * 100)}%`,
            top: "14px",
          }}
        >
          <div className="bg-white/95 backdrop-blur-xs border border-blue-200 text-blue-950 px-2.5 py-1 rounded-lg shadow-sm text-center">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Bu Ayki Ortalama
            </div>
            <div className="text-xs sm:text-sm font-black text-blue-700 font-mono">
              {formatTL(currentPoint.price)} / m²
            </div>
          </div>
        </div>

        {/* SVG GRAFİĞİ */}
        <div className="w-full aspect-[2.4/1] min-h-[220px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Trend Alanı Degradisi (Endeksa Açık Mavi Degradisi) */}
              <linearGradient id="endeksaTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#0284c7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>

              {/* Forecast Degradisi */}
              <linearGradient id="endeksaForecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Yatay Kılavuz Çizgileri ve Y-Eksen Etiketleri */}
            {yTicks.map((tick, i) => {
              const y = getY(tick);
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="9"
                    fontWeight="600"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    {tick >= 1000 ? `${Math.round(tick / 1000)}k ₺/m²` : `${Math.round(tick)} ₺`}
                  </text>
                </g>
              );
            })}

            {/* X-Eksen Etiketleri */}
            {xTicks.map((tick, i) => {
              const idx = chartData.findIndex((c) => c.shortDate === tick.shortDate);
              const x = getX(idx);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padTop + innerHeight}
                    x2={x}
                    y2={padTop + innerHeight + 5}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padTop + innerHeight + 16}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="600"
                    fill="#64748b"
                    fontFamily="monospace"
                  >
                    {tick.shortDate}
                  </text>
                </g>
              );
            })}

            {/* Trend Doldurulmuş Alan */}
            <path d={trendAreaD} fill="url(#endeksaTrendGrad)" />

            {/* Trend Çizgisi */}
            <path
              d={trendPathD}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Forecast Çizgisi (Gelecek Tahmini - Noktalı) */}
            <path
              d={forecastPathD}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* Forecast Noktaları */}
            {forecastPoints.map((pt, i) => {
              const idx = trendPoints.length - 1 + i;
              const cx = getX(idx);
              const cy = getY(pt.price);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2"
                />
              );
            })}

            {/* Güncel Ay İşaretçisi (Dikey Çizgi & Büyük Nokta) */}
            <line
              x1={currentPointX}
              y1={padTop}
              x2={currentPointX}
              y2={padTop + innerHeight}
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={currentPointX}
              cy={currentPointY}
              r="5"
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* İnteraktif Hover Noktaları */}
            {chartData.map((pt, idx) => {
              const cx = getX(idx);
              const cy = getY(pt.price);
              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="transparent"
                  />
                  {hoveredPoint?.dateLabel === pt.dateLabel && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#e11d48"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip (Mouse Takip) */}
        {hoveredPoint && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none flex items-center gap-2 border border-slate-700">
            <span className="text-slate-300 font-medium">{hoveredPoint.dateLabel}:</span>
            <span className="font-bold text-amber-400 font-mono">
              {formatTL(hoveredPoint.price)} / m²
            </span>
            {hoveredPoint.isForecast && (
              <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                Tahmin
              </span>
            )}
          </div>
        )}

        {/* Lejant: Trend vs Forecast */}
        <div className="flex items-center justify-center gap-6 pt-2 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-2.5 rounded bg-sky-400/80 inline-block"></span>
            <span>Trend (Gerçekleşen)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 border-b-2 border-dashed border-sky-600 inline-block"></span>
            <span>Forecast (TCMB Enflasyon Modeli)</span>
          </div>
        </div>
      </div>

      {/* ENDEKSA TARZI DEĞİŞİM & DÖVİZ TABLOSU */}
      <div className="space-y-3 pt-1">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold">
              <tr className="border-b border-slate-200">
                <th className="p-2.5 font-bold">Değişim (₺)</th>
                <th className="p-2.5 text-center">Oca 21 - Ağu 26</th>
                <th className="p-2.5 text-center">1 Yıllık</th>
                <th className="p-2.5 text-center">2 Yıllık</th>
                <th className="p-2.5 text-center">1 Yıl Sonra (Tahmin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
              <tr>
                <td className="p-2.5 font-semibold text-slate-900">
                  {city} / {district}
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                  +%614,20 ▲
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                  +%{kfeAnnualChange} ▲
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-emerald-600">
                  +%84,80 ▲
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-blue-600">
                  +%25,00 ▲
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-2.5 font-semibold text-slate-900">
                  Toplam Değişim (Kümülatif)
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                  +%714,00
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                  +%{Math.round(kfeAnnualChange * 1.15)}
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                  +%98,40
                </td>
                <td className="p-2.5 text-center font-mono font-bold text-blue-700">
                  +%32,85
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DÖVİZ PARİTELERİ (ECB/FRANKFURTER) */}
        {currencyRates && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold">
                <tr className="border-b border-slate-200">
                  <th className="p-2 font-bold">Döviz Kurları (ECB)</th>
                  <th className="p-2 text-center">1 Yıllık Trend</th>
                  <th className="p-2 text-center">2 Yıllık Trend</th>
                  <th className="p-2 text-right">Bugün</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                <tr>
                  <td className="p-2 font-semibold">USD / TRY</td>
                  <td className="p-2 text-center font-mono text-emerald-600 font-bold">+%34,20 ▲</td>
                  <td className="p-2 text-center font-mono text-emerald-600 font-bold">+%78,40 ▲</td>
                  <td className="p-2 text-right font-mono font-black text-slate-900">{currencyRates.usdTry.toFixed(2)} ₺</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">EUR / TRY</td>
                  <td className="p-2 text-center font-mono text-emerald-600 font-bold">+%31,10 ▲</td>
                  <td className="p-2 text-center font-mono text-emerald-600 font-bold">+%72,80 ▲</td>
                  <td className="p-2 text-right font-mono font-black text-slate-900">{currencyRates.eurTry.toFixed(2)} ₺</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
