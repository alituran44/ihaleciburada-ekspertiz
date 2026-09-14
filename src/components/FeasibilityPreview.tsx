"use client";

import React, { useState } from "react";
import { CalculationResult, ParcelInput } from "@/types";
import { formatTL, formatNumber } from "@/lib/constants";
import { 
  Building2, 
  TrendingUp, 
  Coins, 
  Layers, 
  ArrowUpRight, 
  FileDown, 
  Home, 
  CalendarClock, 
  Percent, 
  ShieldCheck,
  ShieldAlert,
  Activity,
  Sun,
  DollarSign,
  Gavel,
  Landmark,
  MessageSquare,
  Copy,
  Check,
  X,
  ExternalLink
} from "lucide-react";

export function generateWhatsAppSummary(input: ParcelInput, calc: CalculationResult): string {
  const isResidential = input.category === "konut";
  const propertyTitle = isResidential 
    ? `${input.roomCount || "3+1"} ${input.housingType?.toUpperCase() || "KONUT"} (${input.areaM2} m²)` 
    : `ARSA Ada ${input.ada || "-"}/Parsel ${input.parsel || "-"} (${formatNumber(input.areaM2)} m²)`;

  const lines = [
    `🏢 *${propertyTitle}*`,
    `📍 *Konum:* ${input.city} / ${input.district}${input.neighborhood ? ` - ${input.neighborhood}` : ""}`,
    `📊 *Yatırım Skoru:* ${calc.investmentScore}/100 (${calc.scoreLabel})`,
    `💰 *Adil Piyasa Değeri:* ${formatTL(calc.fairMarketValueTL)}`,
  ];

  if (input.askedPriceTL) {
    lines.push(`🏷️ *İstenen / Başlangıç Fiyatı:* ${formatTL(input.askedPriceTL)}`);
    if (calc.discountRatio > 0) {
      lines.push(`🎯 *Piyasa İskontosu:* %${calc.discountRatio} Fırsat Oranı`);
    }
  }

  if (calc.auctionAnalysis?.isAuction) {
    const totalCosts = calc.auctionAnalysis.kdvAmountTL + calc.auctionAnalysis.auctioneerFeeTL + calc.auctionAnalysis.stampTaxTL + calc.auctionAnalysis.evictionBufferTL;
    lines.push(``);
    lines.push(`⚖️ *İHALE & İCRA YATIRIMCI ANALİZİ:*`);
    lines.push(`• *Güvenli Tavan Teklif (Maksimum Pey):* ${formatTL(calc.auctionAnalysis.maxSafeBidTL)}`);
    lines.push(`• *Hedeflenen Net ROI:* %${calc.auctionAnalysis.targetProfitPercent}`);
    lines.push(`• *Beklenen Net Kâr:* ~${formatTL(calc.auctionAnalysis.projectedNetProfitTL)}`);
    lines.push(`• *Yasal Masraf & Tahliye Tamponu:* ${formatTL(totalCosts)}`);
  }

  if (calc.loanAnalysis) {
    lines.push(``);
    lines.push(`🏦 *BANKA KREDİ & FİNANSMAN:*`);
    lines.push(`• *Azami Kredi (%${calc.loanAnalysis.ltvPercent} LTV):* ${formatTL(calc.loanAnalysis.maxLoanAmountTL)}`);
    lines.push(`• *Asgari Peşinat İhtiyacı:* ${formatTL(calc.loanAnalysis.requiredDownPaymentTL)}`);
    lines.push(`• *Aylık Taksit (${calc.loanAnalysis.termMonths} Ay):* ${formatTL(calc.loanAnalysis.monthlyLoanInstallmentTL)}/ay`);
    if (isResidential && calc.loanAnalysis.netMonthlyCashFlowTL !== undefined && calc.loanAnalysis.netMonthlyCashFlowTL !== 0) {
      lines.push(`• *Net Kira/Nakit Akışı:* ${formatTL(calc.loanAnalysis.netMonthlyCashFlowTL)}/ay`);
    }
  }

  if (input.consultantName) {
    lines.push(``);
    lines.push(`👤 *Danışman:* ${input.consultantName} ${input.consultantPhone ? `(${input.consultantPhone})` : ""}`);
  }

  lines.push(`🔗 *Detaylı Rapor:* https://ekspertiz.ihaleciburada.com`);

  return lines.join("\n");
}

interface FeasibilityPreviewProps {
  input: ParcelInput;
  calc: CalculationResult;
  onViewReport: () => void;
}

export const FeasibilityPreview: React.FC<FeasibilityPreviewProps> = ({
  input,
  calc,
  onViewReport,
}) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isResidential = input.category === "konut";

  const getScoreBadge = () => {
    if (calc.investmentScore >= 85) {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-300",
        bar: "bg-emerald-500",
      };
    }
    if (calc.investmentScore >= 70) {
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-300",
        bar: "bg-blue-600",
      };
    }
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-300",
      bar: "bg-amber-500",
    };
  };

  const scoreTheme = getScoreBadge();

  return (
    <div className="bg-white border border-slate-300/80 rounded-2xl p-5 shadow-premium space-y-5 sticky top-24">
      {/* Üst Başlık & Skor Rozeti */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-heading">
              {isResidential ? "Konut Ekspertiz Özeti" : "Arsa Fizibilite Özeti"}
            </span>
            <span className={`px-1.5 py-0.2 text-[9px] font-black rounded uppercase ${
              isResidential ? "bg-indigo-100 text-indigo-800" : "bg-orange-100 text-orange-800"
            }`}>
              {isResidential ? "Daire / Ev" : "Arsa / İmar"}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 leading-tight">
            {input.city || "Şehir Belirtilmedi"} / {input.district || "İlçe"}
          </h3>
          <p className="text-xs text-slate-500">
            {isResidential ? (
              <span>{input.roomCount || "3+1"} {input.housingType?.toUpperCase() || "DAİRE"} ({input.areaM2} m² Brüt)</span>
            ) : (
              <span>Ada: {input.ada || "-"} | Parsel: {input.parsel || "-"} ({formatNumber(input.areaM2)} m²)</span>
            )}
          </p>
        </div>

        {/* Yatırım Skoru */}
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-semibold">Yatırım Skoru</div>
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-2xl font-black font-heading text-slate-900">
              {calc.investmentScore}
            </span>
            <span className="text-xs text-slate-400 font-bold">/100</span>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${scoreTheme.bg}`}>
            {calc.scoreLabel}
          </span>
        </div>
      </div>

      {/* İlerleme Çubuğu */}
      <div className="space-y-1">
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${scoreTheme.bar}`}
            style={{ width: `${calc.investmentScore}%` }}
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* METRİKLER GRID (KONUT VS ARSA) */}
      {/* ========================================== */}
      {isResidential ? (
        /* KONUT / EV METRİKLERİ */
        <div className="grid grid-cols-2 gap-3">
          {/* Aylık Kira Getirisi */}
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 mb-1">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aylık Kira Getirisi</span>
            </div>
            <div className="text-base font-black text-emerald-950">
              {formatTL(calc.monthlyRentalYieldTL || 0)}
            </div>
            <div className="text-[10px] text-emerald-700">
              Yıllık: {formatTL(calc.annualRentalIncomeTL || 0)}
            </div>
          </div>

          {/* Amortisman / Geri Dönüş */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-800 mb-1">
              <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
              <span>Geri Dönüş (Amortisman)</span>
            </div>
            <div className="text-base font-black text-blue-950">
              {calc.amortizationYears} Yıl
            </div>
            <div className="text-[10px] text-blue-700">
              Brüt Getiri: %{calc.grossRentalYieldPercent}
            </div>
          </div>

          {/* Adil Piyasa Değeri */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
              <Home className="w-3.5 h-3.5 text-indigo-600" />
              <span>Adil Piyasa Değeri</span>
            </div>
            <div className="text-sm font-black text-slate-900">
              {formatTL(calc.fairMarketValueTL)}
            </div>
            <div className="text-[10px] text-slate-500">
              m²: {formatTL(Math.round(calc.fairMarketValueTL / (input.areaM2 || 1)))}
            </div>
            {Boolean(calc.fairMarketValueUSD && calc.fairMarketValueEUR) && (
              <div className="text-[9px] text-slate-500 font-semibold pt-0.5 border-t border-slate-200/60 mt-1">
                ~${calc.fairMarketValueUSD?.toLocaleString("en-US")} • ~€{calc.fairMarketValueEUR?.toLocaleString("en-US")}
              </div>
            )}
          </div>

          {/* Hızlı Satış / İhale */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span>Hızlı Satış (Likit)</span>
            </div>
            <div className="text-sm font-black text-slate-900">
              {formatTL(calc.quickSaleValueTL)}
            </div>
            <div className="text-[10px] text-slate-500">
              İskontolu Taban Değer
            </div>
          </div>
        </div>
      ) : (
        /* ARSA / İMAR METRİKLERİ */
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Satılabilir Alan</span>
            </div>
            <div className="text-base font-black text-slate-900">
              {formatNumber(calc.totalSellableGrossM2)} m²
            </div>
            <div className="text-[10px] text-slate-500">
              ~{calc.estimatedUnitCount} Bağımsız Bölüm
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Taban Oturumu</span>
            </div>
            <div className="text-base font-black text-slate-900">
              {formatNumber(calc.footprintAreaM2)} m²
            </div>
            <div className="text-[10px] text-slate-500">
              Net Arsa: {formatNumber(calc.netAreaM2)} m²
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-800 mb-1">
              <Coins className="w-3.5 h-3.5 text-blue-600" />
              <span>Adil Piyasa Değeri</span>
            </div>
            <div className="text-sm font-black text-blue-900">
              {formatTL(calc.fairMarketValueTL)}
            </div>
            <div className="text-[10px] text-blue-700">
              m²: {formatTL(Math.round(calc.fairMarketValueTL / (input.areaM2 || 1)))}
            </div>
            {Boolean(calc.fairMarketValueUSD && calc.fairMarketValueEUR) && (
              <div className="text-[9px] text-blue-900 font-semibold pt-0.5 border-t border-blue-200 mt-1">
                ~${calc.fairMarketValueUSD?.toLocaleString("en-US")} • ~€{calc.fairMarketValueEUR?.toLocaleString("en-US")}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tahmini Hasılat</span>
            </div>
            <div className="text-sm font-black text-emerald-900">
              {formatTL(calc.totalProjectTurnoverTL)}
            </div>
            <div className="text-[10px] text-emerald-700">
              Maliyet: {formatTL(calc.totalEstimatedConstructionCostTL)}
            </div>
          </div>
        </div>
      )}

      {/* Fiyat / İskonto Analizi */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>İstenen / İhale Fiyatı:</span>
          <strong className="text-slate-900 font-bold">{formatTL(input.askedPriceTL)}</strong>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Piyasaya Göre Durum:</span>
          {calc.isOpportunity ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
              % {calc.discountRatio} İskontolu (Fırsat)
            </span>
          ) : (
            <span className="font-bold text-amber-700">
              Piyasa Düzeyinde / Primli
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5 text-[11px] text-slate-500">
          <span>Hızlı Satış Tabanı:</span>
          <span className="font-bold text-slate-700">{formatTL(calc.quickSaleValueTL)}</span>
        </div>
      </div>

      {/* İHALE & İCRA: TAVAN PEY VE MASRAF KARTI */}
      {calc.auctionAnalysis?.isAuction && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 text-xs space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
            <div className="flex items-center gap-1.5 font-heading font-extrabold text-amber-950">
              <Gavel className="w-4 h-4 text-amber-700" />
              <span>İhale Güvenli Tavan Teklif</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-black">
              %{calc.auctionAnalysis.targetProfitPercent} Net ROI
            </span>
          </div>

          <div className="bg-white/90 p-3 rounded-lg border border-amber-200 space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Maksimum Güvenli Pey (Tavan Teklif)
            </div>
            <div className="text-xl font-black text-amber-900 font-heading">
              {formatTL(calc.auctionAnalysis.maxSafeBidTL)}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <span>Hedeflenen Net Kâr:</span>
              <span className="font-bold font-mono">+{formatTL(calc.auctionAnalysis.projectedNetProfitTL)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1">
            <div className="bg-white/70 p-2 rounded border border-amber-200/60">
              <span className="text-slate-500">Yasal Masraflar (KDV+Harç):</span>
              <div className="font-bold text-slate-800">{formatTL(calc.auctionAnalysis.kdvAmountTL + calc.auctionAnalysis.auctioneerFeeTL + calc.auctionAnalysis.stampTaxTL)}</div>
            </div>
            <div className="bg-white/70 p-2 rounded border border-amber-200/60">
              <span className="text-slate-500">Tahliye / Hukuk Tamponu:</span>
              <div className="font-bold text-slate-800">{formatTL(calc.auctionAnalysis.evictionBufferTL)}</div>
            </div>
          </div>
        </div>
      )}

      {/* ALT PANEL: KONUT İÇİN BİNA YAŞI / ARSA İÇİN KAT KARŞILIĞI */}
      {isResidential ? (
        <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Yapı & Deprem Değerlendirmesi:</span>
            <span className="font-bold text-emerald-400">{input.buildingAge === "0" ? "Sıfır Yapı" : `${input.buildingAge} Yaşında`}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
            {calc.buildingAgeRiskLabel}
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Kat Karşılığı Simülasyonu:</span>
            <span className="font-bold text-orange-400">
              %{100 - (input.contractorSharePercent || 50)} Arsa Sahibi / %{input.contractorSharePercent || 50} Müteahhit
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400">Arsa Sahibine Kalan</div>
              <div className="font-bold text-white text-sm">
                {formatNumber(calc.landownerGrossM2)} m²
              </div>
              <div className="text-[10px] text-emerald-400">
                ~{formatTL(calc.landownerRevenueTL)} Değer
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Müteahhit Payı</div>
              <div className="font-bold text-white text-sm">
                {formatNumber(calc.contractorGrossM2)} m²
              </div>
              <div className="text-[10px] text-slate-400">
                İnşaat Finansmanı
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Açık Veri & Çevresel Analiz (USGS, Open-Meteo, ECB) */}
      {(calc.earthquakeRisk || calc.solarClimate || calc.currencyRates) && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 border-b border-slate-200/80 pb-1.5">
            <span className="flex items-center gap-1.5 font-heading text-slate-900">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Açık Veri & Çevresel Analiz
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase">
              Canlı API
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {calc.earthquakeRisk && (
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                  <Activity className="w-3 h-3 text-rose-500" />
                  <span>Sismik Risk (USGS)</span>
                </div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {calc.earthquakeRisk.riskLevel} Risk
                </div>
                <div className="text-[9px] text-slate-400 truncate" title={calc.earthquakeRisk.nearestEvent}>
                  {calc.earthquakeRisk.nearestEvent}
                </div>
              </div>
            )}

            {calc.solarClimate && (
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>Güneş / GES Potansiyeli</span>
                </div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {calc.solarClimate.solarSuitability}
                </div>
                <div className="text-[9px] text-slate-400">
                  {calc.solarClimate.solarRadiationMJ} MJ/m² radyasyon
                </div>
              </div>
            )}
          </div>

          {calc.currencyRates && (
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1 font-medium">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                ECB/Frankfurter:
              </span>
              <span className="font-mono font-bold text-slate-700">
                1$ = {calc.currencyRates.usdTry.toFixed(2)} ₺ • 1€ = {calc.currencyRates.eurTry.toFixed(2)} ₺
              </span>
            </div>
          )}
        </div>
      )}

      {/* BANKA KREDİSİ & BDDK KALDIRAÇ ÖZETİ */}
      {calc.loanAnalysis && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
            <div className="flex items-center gap-1.5 font-heading font-extrabold text-slate-800 text-[11px]">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Banka Kredi & Finansman</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              %{calc.loanAnalysis.ltvPercent} LTV
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500">Azami Kredi:</span>
              <div className="font-extrabold text-blue-700">{formatTL(calc.loanAnalysis.maxLoanAmountTL)}</div>
              <span className="text-[9px] text-slate-400">Peşinat: {formatTL(calc.loanAnalysis.requiredDownPaymentTL)}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500">Aylık Taksit ({calc.loanAnalysis.termMonths} Ay):</span>
              <div className="font-extrabold text-slate-800">{formatTL(calc.loanAnalysis.monthlyLoanInstallmentTL)}</div>
              {isResidential && calc.loanAnalysis.netMonthlyCashFlowTL !== undefined && calc.loanAnalysis.netMonthlyCashFlowTL !== 0 && (
                <span className={`text-[9px] font-bold ${calc.loanAnalysis.netMonthlyCashFlowTL > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                  Net Nakit Akışı: {formatTL(calc.loanAnalysis.netMonthlyCashFlowTL)}/ay
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aksiyon Butonları */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => setShowWhatsAppModal(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-white" />
          <span>WhatsApp Yatırımcı Notu (One-Pager)</span>
        </button>

        <button
          type="button"
          onClick={onViewReport}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-blue-700/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          <span>Kapsamlı Raporu Aç & PDF İndir</span>
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-400">
        Resmi kurum ve banka standardında A4 rapor formatında hazırlanır.
      </p>

      {/* WHATSAPP YATIRIMCI NOTU MODAL */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 font-heading">
                    WhatsApp Yatırımcı Bilgi Notu
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tek tıkla kopyalayın veya doğrudan WhatsApp uygulamasında paylaşın.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap max-h-64 select-all border border-slate-800 leading-relaxed">
                {generateWhatsAppSummary(input, calc)}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generateWhatsAppSummary(input, calc));
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2500);
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const summary = generateWhatsAppSummary(input, calc);
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(summary)}`;
                  window.open(url, "_blank");
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>WhatsApp'ta Paylaş</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
