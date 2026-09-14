"use client";

import React, { useState } from "react";
import { ParcelInput, CalculationResult } from "@/types";
import { formatTL, formatNumber } from "@/lib/constants";
import { X, Copy, Check, Share2 } from "lucide-react";

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: ParcelInput;
  calc: CalculationResult;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  input,
  calc,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isResidential = input.category === "konut";

  let auctionSection = "";
  if (calc.auctionAnalysis?.isAuction) {
    const totalCosts = calc.auctionAnalysis.kdvAmountTL + calc.auctionAnalysis.auctioneerFeeTL + calc.auctionAnalysis.stampTaxTL + calc.auctionAnalysis.evictionBufferTL;
    auctionSection = `\n\n⚖️ *İHALE & İCRA YATIRIMCI ANALİZİ:*\n• Güvenli Tavan Teklif (Maks. Pey): ${formatTL(calc.auctionAnalysis.maxSafeBidTL)}\n• Hedeflenen Net ROI: %${calc.auctionAnalysis.targetProfitPercent}\n• Beklenen Net Kâr: ~${formatTL(calc.auctionAnalysis.projectedNetProfitTL)}\n• Masraflar & Tahliye Tamponu: ${formatTL(totalCosts)}`;
  }

  let loanSection = "";
  if (calc.loanAnalysis) {
    loanSection = `\n\n🏦 *BANKA KREDİ & FİNANSMAN:*\n• Azami Kredi (%${calc.loanAnalysis.ltvPercent} LTV): ${formatTL(calc.loanAnalysis.maxLoanAmountTL)}\n• Asgari Peşinat: ${formatTL(calc.loanAnalysis.requiredDownPaymentTL)}\n• Aylık Taksit (${calc.loanAnalysis.termMonths} Ay): ${formatTL(calc.loanAnalysis.monthlyLoanInstallmentTL)}/ay${
      isResidential && calc.loanAnalysis.netMonthlyCashFlowTL !== undefined && calc.loanAnalysis.netMonthlyCashFlowTL !== 0
        ? `\n• Net Kira/Nakit Akışı: ${formatTL(calc.loanAnalysis.netMonthlyCashFlowTL)}/ay`
        : ""
    }`;
  }

  const shareText = isResidential
    ? `*İHALECİBURADA KONUT / DAİRE DEĞERLEME ÖZETİ*
📍 *Konum:* ${input.city} / ${input.district}${input.neighborhood ? ` / ${input.neighborhood}` : ""}
🏢 *Gayrimenkul:* ${input.roomCount || "3+1"} ${input.housingType ? `(${input.housingType.toUpperCase()})` : ""}
📐 *Alan:* Brüt ${formatNumber(input.areaM2)} m² / Net ${formatNumber(input.netAreaM2 || Math.round(input.areaM2 * 0.82))} m²
🏗️ *Bina Yaşı & Kat:* ${input.buildingAge || "1-5"} Yaş | ${input.floorLocation || "Ara Kat"}
🛡️ *Tapu Durumu:* ${input.deedStatus || "Kat Mülkiyeti"}

💰 *FİNANSAL DEĞERLEME:*
• İstenen / Başlangıç Fiyatı: ${formatTL(input.askedPriceTL)}
• Adil Piyasa Değeri: ${formatTL(calc.fairMarketValueTL)}
• Piyasaya Göre Durum: ${calc.isOpportunity ? `%${calc.discountRatio} İskontolu Fırsat` : "Piyasa Düzeyinde"}
• Tahmini m² Satış Değeri: ${formatTL(input.estimatedUnitSaleM2PriceTL)}/m²

📈 *KİRA GETİRİSİ & AMORTİSMAN:*
• Tahmini Aylık Kira: ${formatTL(calc.monthlyRentalYieldTL || 0)}
• Tahmini Yıllık Kira: ${formatTL(calc.annualRentalIncomeTL || 0)}
• Amortisman (Geri Dönüş): ~${calc.amortizationYears || 18} Yıl
• Brüt Kira Getirisi: %${calc.grossRentalYieldPercent || 5.5}${auctionSection}${loanSection}

⭐ *Yatırım Skoru:* ${calc.investmentScore}/100 (${calc.scoreLabel})
👤 *Yetkili:* ${input.consultantName || "Danışman"} (${input.consultantPhone || "0850 840 86 95"})
🏢 *Ofis:* ${input.consultantAgency || "İhaleciBurada Kurumsal"}

🔗 Detaylı A4 Ekspertiz Raporu İçin: https://ekspertiz.ihaleciburada.com`
    : `*İHALECİBURADA ARSA EKSPERTİZ & FİZİBİLİTE ÖZETİ*
📍 *Konum:* ${input.city} / ${input.district} / ${input.neighborhood}
📌 *Ada/Parsel:* Ada ${input.ada}, Parsel ${input.parsel}
📐 *Tapu Alanı:* ${formatNumber(input.areaM2)} m² (Net İnşaat: ${formatNumber(calc.netAreaM2)} m²)
🏗️ *İmar:* ${input.zoningType.toUpperCase()} | Emsal (KAKS): ${input.kaks} | TAKS: ${input.taks} | ${input.maxFloors} Kat
🏢 *Satılabilir Alan:* ${formatNumber(calc.totalSellableGrossM2)} m² (~${calc.estimatedUnitCount} Bağımsız Bölüm)

💰 *FİNANSAL DEĞERLEME:*
• İstenen / Başlangıç Fiyatı: ${formatTL(input.askedPriceTL)}
• Adil Piyasa Değeri: ${formatTL(calc.fairMarketValueTL)}
• Piyasaya Göre Durum: ${calc.isOpportunity ? `%${calc.discountRatio} İskontolu Fırsat` : "Piyasa Düzeyinde"}
• Tahmini Proje Hasılatı: ${formatTL(calc.totalProjectTurnoverTL)}${auctionSection}${loanSection}

⭐ *Yatırım Skoru:* ${calc.investmentScore}/100 (${calc.scoreLabel})
👤 *Yetkili:* ${input.consultantName || "Danışman"} (${input.consultantPhone || "0850 840 86 95"})
🏢 *Ofis:* ${input.consultantAgency || "İhaleciBurada Kurumsal"}

🔗 Detaylı A4 Ekspertiz Raporu İçin: https://ekspertiz.ihaleciburada.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                WhatsApp Yatırımcı Brifi
              </h3>
              <p className="text-[11px] text-slate-500">
                Müşterinize veya yatırımcınıza tek tıkla profesyonel özet gönderin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metin Önizleme Kutusu */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-h-60 overflow-y-auto font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed select-all">
          {shareText}
        </div>

        {/* Aksiyon Butonları */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
              copied
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Metin Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Panoya Kopyala</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp'ta Aç</span>
          </button>
        </div>
      </div>
    </div>
  );
};
