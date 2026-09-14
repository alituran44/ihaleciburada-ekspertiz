"use client";

import React from "react";
import { ParcelInput, CalculationResult } from "@/types";
import { formatTL, formatNumber } from "@/lib/constants";
import { 
  Printer, 
  ArrowLeft, 
  Share2, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Coins, 
  FileCheck2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  PhoneCall,
  Home, 
  CalendarClock, 
  Globe,
  Activity,
  Sun,
  DollarSign,
  Landmark
} from "lucide-react";
import { ParcelMap } from "@/components/ParcelMap";

interface ReportViewProps {
  input: ParcelInput;
  calc: CalculationResult;
  onBack: () => void;
  onOpenShareModal: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  input,
  calc,
  onBack,
  onOpenShareModal,
}) => {
  const isResidential = input.category === "konut";

  const reportDate = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const prefix = isResidential ? "EV" : "EXP";
  const reportRefNo = `IB-${prefix}-${input.city.substring(0, 2).toUpperCase()}-${input.ada || "0"}-${input.parsel || "0"}-${Date.now().toString().slice(-4)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Üst Eylem Çubuğu (Yazdırma sırasında gizlenir) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-300 shadow-premium flex flex-wrap items-center justify-between gap-3 sticky top-20 z-30">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Düzenleyiciye Dön</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenShareModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp ile Paylaş</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-blue-700/25 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PDF Olarak Kaydet / Yazdır</span>
          </button>
        </div>
      </div>

      {/* RAPOR DOKÜMANI (A4 Uyumlu & Kurumsal Tasarım) */}
      <div className="bg-white border border-slate-300 shadow-premium rounded-2xl p-6 sm:p-10 space-y-8 text-slate-800 card-print">
        
        {/* 1. BAŞLIK VE KURUMSAL MÜHÜR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-black font-heading tracking-tight text-[#0F223D]">
                ihaleciburada<span className="text-blue-600">.com</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] uppercase tracking-wider">
                {isResidential ? "Konut Değerleme Birimi" : "Arsa & İmar Ekspertizi"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 leading-tight">
              {isResidential ? "KONUT VE GAYRİMENKUL DEĞERLEME RAPORU" : "ARSA İMAR FİZİBİLİTESİ VE DEĞERLEME RAPORU"}
            </h1>
            <p className="text-xs text-slate-500">
              {isResidential 
                ? "Piyasa Emsal Kıyaslama, Kira Amortismanı ve Yapı Güvenlik Modeli"
                : "3194 Sayılı İmar Kanunu ve Piyasa Emsal Simülasyon Standardı"}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <div className="font-mono font-bold text-blue-700 text-sm">
              Ref: {reportRefNo}
            </div>
            <div className="flex items-center sm:justify-end gap-1 text-[11px] text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>{reportDate}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[10px]">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Doğrulanmış Yatırım Raporu
            </div>
          </div>
        </div>

        {/* İHALE BİLGİ ŞERİDİ (Varsa) */}
        {input.isTender && (
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
              <Gavel className="w-4 h-4 text-orange-600" />
              <span>Resmi Satış & İhale Dosyası:</span>
              <span className="underline">{input.tenderAuthority || "Resmi Kurum / İcra Dairesi"}</span>
            </div>
            {input.tenderFileNo && (
              <span className="px-2 py-0.5 rounded bg-white text-orange-900 font-mono font-bold text-xs border border-orange-300">
                Dosya No: {input.tenderFileNo}
              </span>
            )}
          </div>
        )}

        {/* 2. TAŞINMAZ GENEL BİLGİLERİ */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 font-heading flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            1. Taşınmaz Kimliği ve Lokasyon Bilgileri
          </h2>

          {isResidential ? (
            /* KONUT İÇİN KİMLİK KARTLARI */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Konum</span>
                <strong className="text-slate-900 font-bold">{input.city} / {input.district}</strong>
                <div className="text-[11px] text-slate-600">{input.neighborhood || "Merkez"}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Konut Tipi & Oda</span>
                <strong className="text-slate-900 font-bold">{input.housingType?.toUpperCase() || "DAİRE"} ({input.roomCount || "3+1"})</strong>
                <div className="text-[11px] text-slate-600">{input.floorLocation === "ara_kat" ? "Ara Kat" : input.floorLocation}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Yüzölçümü</span>
                <strong className="text-blue-900 font-black text-sm">Brüt: {input.areaM2} m²</strong>
                <div className="text-[10px] text-slate-500">Net: {input.netAreaM2 || Math.round(input.areaM2 * 0.82)} m²</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Bina Yaşı & Tapu</span>
                <strong className="text-slate-900 font-bold">{input.buildingAge === "0" ? "Sıfır Yapı" : `${input.buildingAge} Yaşında`}</strong>
                <div className="text-[10px] text-slate-500">{input.deedStatus === "kat_mulkiyeti" ? "Kat Mülkiyeti" : "Kat İrtifakı"}</div>
              </div>
            </div>
          ) : (
            /* ARSA İÇİN KİMLİK KARTLARI */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">İl / İlçe / Mahalle</span>
                <strong className="text-slate-900 font-bold">{input.city} / {input.district}</strong>
                <div className="text-[11px] text-slate-600">{input.neighborhood}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Ada / Parsel No</span>
                <strong className="text-slate-900 font-bold">Ada: {input.ada}</strong>
                <div className="text-[11px] text-slate-600">Parsel: {input.parsel}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Tapu Alanı (Brüt)</span>
                <strong className="text-blue-900 font-black text-sm">{formatNumber(input.areaM2)} m²</strong>
                <div className="text-[10px] text-slate-500">Kayıtlı Parsel Yüzölçümü</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Net İnşaat Alanı</span>
                <strong className="text-slate-900 font-black text-sm">{formatNumber(calc.netAreaM2)} m²</strong>
                <div className="text-[10px] text-rose-600">-%{input.relinquishmentRatio} Yola Terk</div>
              </div>
            </div>
          )}

          {/* Canlı Harita */}
          <ParcelMap 
            city={input.city}
            district={input.district}
            neighborhood={input.neighborhood}
            ada={input.ada}
            parsel={input.parsel}
            coordinates={input.coordinates}
            elevationMeters={input.elevationMeters}
            comparables={input.comparables || input.marketResearch?.comparables}
            category={input.category}
          />
        </div>

        {/* 3. TEKNİK ÖZELLİKLER VEYA İMAR TABLOSU */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 font-heading flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Building2 className="w-3.5 h-3.5" />
            2. {isResidential ? "Konut Donatı ve Teknik Standartlar" : "İmar Durumu ve Yapılaşma Kapasitesi"}
          </h2>

          {isResidential ? (
            /* KONUT DONATI TABLOSU */
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-[#0F223D] text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5 font-bold">Teknik Kriter</th>
                    <th className="p-2.5 font-bold text-center">Durum</th>
                    <th className="p-2.5 font-bold">Açıklama & Değerleme Etkisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-white">
                    <td className="p-2.5 font-bold text-slate-900">Bina Yaşı & Deprem</td>
                    <td className="p-2.5 text-center font-bold text-blue-700">{input.buildingAge === "0" ? "Sıfır Yapı" : `${input.buildingAge} Yaş`}</td>
                    <td className="p-2.5 text-slate-600">{calc.buildingAgeRiskLabel}</td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="p-2.5 font-bold text-slate-900">Kat Konumu</td>
                    <td className="p-2.5 text-center font-bold text-slate-800">{input.floorLocation === "ara_kat" ? "Ara Kat" : input.floorLocation}</td>
                    <td className="p-2.5 text-slate-600">Isı yalıtımı ve tercih edilebilirlik çarpanı</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2.5 font-bold text-slate-900">Otopark & Asansör</td>
                    <td className="p-2.5 text-center font-bold text-emerald-700">{input.hasParking && input.hasElevator ? "Mevcut" : "Kısmi / Yok"}</td>
                    <td className="p-2.5 text-slate-600">Alıcı ve kiracı talebini doğrudan artıran temel donatılar</td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="p-2.5 font-bold text-slate-900">Isıtma Tipi</td>
                    <td className="p-2.5 text-center font-bold text-slate-800">{input.heatingType || "Doğalgaz Kombi"}</td>
                    <td className="p-2.5 text-slate-600">Bireysel ısınma konforu ve aidat kontrolü</td>
                  </tr>
                  <tr className="bg-blue-50/80 font-bold text-blue-950">
                    <td className="p-2.5">Kredi Uygunluğu</td>
                    <td className="p-2.5 text-center text-emerald-700">Uygun (Kat Mülkiyetli)</td>
                    <td className="p-2.5 text-blue-900 font-medium">Bankaların konut kredisi onay baremlerine tam uyumlu</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* ARSA İMAR TABLOSU */
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-[#0F223D] text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5 font-bold">İmar Parametresi</th>
                    <th className="p-2.5 font-bold text-center">Yasal / Plan Oranı</th>
                    <th className="p-2.5 font-bold text-right">Hesaplanan Alan</th>
                    <th className="p-2.5 font-bold">Açıklama & Not</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-white">
                    <td className="p-2.5 font-bold text-slate-900">Fonksiyon</td>
                    <td className="p-2.5 text-center font-semibold text-blue-700 uppercase">{input.zoningType}</td>
                    <td className="p-2.5 text-right font-semibold">-</td>
                    <td className="p-2.5 text-slate-500">1/1000 Uygulama İmar Planı Kararı</td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="p-2.5 font-bold text-slate-900">KAKS / Emsal</td>
                    <td className="p-2.5 text-center font-bold text-blue-700">{input.kaks}</td>
                    <td className="p-2.5 text-right font-black text-slate-900">{formatNumber(calc.zoningAllowedConstructionM2)} m²</td>
                    <td className="p-2.5 text-slate-500">Emsale dahil yapı inşaat alanı</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2.5 font-bold text-slate-900">TAKS (Taban Oturumu)</td>
                    <td className="p-2.5 text-center font-bold text-slate-700">{input.taks}</td>
                    <td className="p-2.5 text-right font-black text-slate-900">{formatNumber(calc.footprintAreaM2)} m²</td>
                    <td className="p-2.5 text-slate-500">Maksimum bina taban oturumu</td>
                  </tr>
                  <tr className="bg-blue-50/80 font-bold text-blue-950">
                    <td className="p-2.5">Satılabilir Brüt Alan</td>
                    <td className="p-2.5 text-center">Emsal Dışı İlavelere Açık</td>
                    <td className="p-2.5 text-right font-black text-base text-blue-700">{formatNumber(calc.totalSellableGrossM2)} m²</td>
                    <td className="p-2.5 text-blue-900 font-medium">Balkon, çatı ve bodrum eklentileri dahil</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 4. FİNANSAL DEĞERLEME & KİRA / HASILAT MATRİSİ */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 font-heading flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Coins className="w-3.5 h-3.5" />
            3. {isResidential ? "Değerleme ve Kira Amortisman Modeli" : "Değerleme Matrisi ve Finansal Fizibilite"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Hızlı Satış / Likit Değer</span>
              <div className="text-lg font-black text-slate-800 my-1">{formatTL(calc.quickSaleValueTL)}</div>
              <span className="text-[10px] text-slate-400">Piyasa İskontolu Nakit Değeri</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border-2 border-blue-600 text-center shadow-xs">
              <span className="text-[10px] text-blue-700 font-black uppercase tracking-wider block">Adil Piyasa Değeri</span>
              <div className="text-xl font-black text-blue-900 my-1">{formatTL(calc.fairMarketValueTL)}</div>
              <span className="text-[11px] text-blue-800 font-bold block">m²: {formatTL(Math.round(calc.fairMarketValueTL / (input.areaM2 || 1)))}</span>
              {Boolean(calc.fairMarketValueUSD && calc.fairMarketValueEUR) && (
                <span className="text-[10px] text-blue-950/80 font-semibold block pt-1 border-t border-blue-200 mt-1">
                  ~${calc.fairMarketValueUSD?.toLocaleString("en-US")} • ~€{calc.fairMarketValueEUR?.toLocaleString("en-US")}
                </span>
              )}
            </div>

            {isResidential ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center">
                <span className="text-[10px] text-emerald-800 font-bold uppercase block">Amortisman (Geri Dönüş)</span>
                <div className="text-lg font-black text-emerald-950 my-1">{calc.amortizationYears} Yıl</div>
                <span className="text-[10px] text-emerald-700 font-bold">Brüt Getiri: %{calc.grossRentalYieldPercent}</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Müteahhit Tavan Değeri</span>
                <div className="text-lg font-black text-slate-800 my-1">{formatTL(calc.developerCeilingValueTL)}</div>
                <span className="text-[10px] text-slate-400">Projenin Kâr Edeceği Maksimum Alış</span>
              </div>
            )}
          </div>

          {/* Konut için Kira Getiri Şeridi / Arsa için Kat Karşılığı */}
          {isResidential ? (
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Kira Getirisi ve Yatırım Verimi
                </span>
                <span className="text-slate-400 text-[11px]">
                  Yıllık Kira Hasılatı: {formatTL(calc.annualRentalIncomeTL || 0)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Aylık Tahmini Kira</span>
                  <strong className="text-emerald-400 text-base">{formatTL(calc.monthlyRentalYieldTL || 0)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Yıllık Brüt Getiri Oranı</span>
                  <strong className="text-white text-base">%{calc.grossRentalYieldPercent}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Amortisman Süresi</span>
                  <strong className="text-sky-400 text-base">{calc.amortizationYears} Yıl</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-orange-400 uppercase tracking-wider font-heading">
                  Proje İnşaat & Hasılat Projeksiyonu
                </span>
                <span className="text-slate-400 text-[11px]">
                  Kat Karşılığı: %{100 - input.contractorSharePercent} Arsa Sahibi / %{input.contractorSharePercent} Müteahhit
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Tahmini İnşaat Maliyeti</span>
                  <strong className="text-slate-100 text-sm">{formatTL(calc.totalEstimatedConstructionCostTL)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Toplam Satış Hasılatı</span>
                  <strong className="text-emerald-400 text-sm">{formatTL(calc.totalProjectTurnoverTL)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Arsa Sahibine Kalan Pay</span>
                  <strong className="text-white text-sm">{formatNumber(calc.landownerGrossM2)} m²</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Müteahhit İnşaat Payı</span>
                  <strong className="text-white text-sm">{formatNumber(calc.contractorGrossM2)} m²</strong>
                </div>
              </div>
            </div>
          )}

          {/* İNTERNET EMSAL ARAŞTIRMA VE PİYASA TARAMA KÜNYESİ */}
          {input.marketResearch && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 font-heading">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  İnternet Emsal İlan ve Değerleme Taraması
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">
                  {input.marketResearch.sampleCount} Emsal İlan Taraması
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                {input.marketResearch.summaryNote}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Piyasa Trendi: <strong className="text-slate-800">{input.marketResearch.marketTrend}</strong></span>
                <span>Analiz Kaynakları: <strong className="text-slate-800">{input.marketResearch.sources.join(" • ")}</strong></span>
              </div>

              {Boolean(input.marketResearch.comparables && input.marketResearch.comparables.length > 0) && (
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Harita Üzerinde Doğrulanan Çevre Emsalleri</span>
                    <span className="text-slate-400 font-normal">Mesafe ve Birim Fiyat Analizi</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                        <tr>
                          <th className="p-1.5">Emsal İlan Tanımı</th>
                          <th className="p-1.5 text-center">Kaynak</th>
                          <th className="p-1.5 text-center">Mesafe</th>
                          <th className="p-1.5 text-right">Alan</th>
                          <th className="p-1.5 text-right">Birim Fiyat</th>
                          <th className="p-1.5 text-right">Toplam Fiyat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {input.marketResearch.comparables?.slice(0, 5).map((comp) => (
                          <tr key={comp.id} className="hover:bg-slate-50">
                            <td className="p-1.5 font-medium text-slate-800">{comp.title}</td>
                            <td className="p-1.5 text-center text-[10px] font-bold text-slate-600">{comp.source}</td>
                            <td className="p-1.5 text-center font-mono font-semibold text-slate-600">{comp.distanceMeters}m</td>
                            <td className="p-1.5 text-right text-slate-700">{comp.areaM2} m²</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{comp.pricePerM2TL.toLocaleString("tr-TR")} ₺/m²</td>
                            <td className="p-1.5 text-right font-black text-blue-700">₺ {comp.priceTL.toLocaleString("tr-TR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RESMİ DEĞERLEME & MALİYET TABANI (TCMB EVDS3 & ÇŞB MİMARLAR ODASI) */}
          {(calc.tcmbOfficialData || calc.buildingCostEstimate) && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 font-heading">
                  <Landmark className="w-3.5 h-3.5 text-blue-700" />
                  Resmi Değerleme & Yasal Maliyet Tabanı
                </span>
                <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  TCMB EVDS3 & ÇŞB 2026/1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {calc.tcmbOfficialData && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      TCMB Resmi Konut Fiyat Endeksi (KFE)
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-extrabold text-blue-900 font-mono">
                        {calc.tcmbOfficialData.kfeIndex} Puan
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Yıllık +%{calc.tcmbOfficialData.kfeAnnualChangePercent}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                      <span>Bölge Resmi Birim Medyanı:</span>
                      <strong className="text-slate-900">{formatTL(calc.tcmbOfficialData.officialAvgM2TL)} / m²</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Haftalık Konut Kredisi Faizi:</span>
                      <strong>Yıllık %{calc.tcmbOfficialData.mortgageInterestAnnualPercent}</strong>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {calc.tcmbOfficialData.benchmarkRegion} • {calc.tcmbOfficialData.source}
                    </div>
                  </div>
                )}

                {calc.buildingCostEstimate && !isResidential && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      ÇŞB 2026/1 & Mimarlar Odası Proje Maliyetleri
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {calc.buildingCostEstimate.csbBuildingClass}
                    </div>
                    <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100">
                      <span>ÇŞB m² Kaba+İnce İnşaat:</span>
                      <strong className="text-slate-900">{formatTL(calc.buildingCostEstimate.unitCostTL)} / m²</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Mimarlar Odası Asgari Proje Bedeli:</span>
                      <strong className="text-blue-700">{formatTL(calc.buildingCostEstimate.architecturalProjectFeeTL)}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>Mühendislik & Yapı Denetim:</span>
                      <strong className="text-slate-800">{formatTL(calc.buildingCostEstimate.engineeringAndSupervisionFeeTL)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* İHALE MASRAF, VERGİ & GÜVENLİ TAVAN TEKLİF (PEY) ANALİZİ */}
        {calc.auctionAnalysis?.isAuction && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-orange-700 font-heading flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5 text-orange-600" />
                İhale Masraf, Vergi & Güvenli Tavan Teklif (Pey) Analizi
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 font-black">
                Hedef Net ROI: %{calc.auctionAnalysis.targetProfitPercent}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Finansal & Hukuki Parametre</th>
                    <th className="p-2.5 text-center">Oran / Barem</th>
                    <th className="p-2.5 text-right">Tutar (TL)</th>
                    <th className="p-2.5 text-slate-500">Açıklama & Kanuni Dayanak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">İhale Başlangıç / Muhammen Bedel</td>
                    <td className="p-2.5 text-center font-mono">Giriş Pey</td>
                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                      {formatTL(calc.auctionAnalysis.startingPriceTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500">İcra / İhale satış dosyasında ilan edilen açılış rakamı</td>
                  </tr>
                  <tr className="bg-amber-50/60">
                    <td className="p-2.5 font-extrabold text-amber-950">
                      🎯 Güvenli Tavan Teklif (Maksimum Pey)
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-amber-800">
                      Tavan Sınır
                    </td>
                    <td className="p-2.5 text-right font-black text-amber-900 font-mono text-sm">
                      {formatTL(calc.auctionAnalysis.maxSafeBidTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-amber-900 font-medium">
                      Bu teklif aşılmadığı takdirde hedeflenen %{calc.auctionAnalysis.targetProfitPercent} net kâr marjı garanti edilir
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">İhale Tellaliye Harcı</td>
                    <td className="p-2.5 text-center font-mono font-semibold text-slate-600">%1.00</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                      {formatTL(calc.auctionAnalysis.auctioneerFeeTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500">Belediye Gelirleri Kanunu m.68 uyarınca tahsil edilir</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">İhale Damga Vergisi</td>
                    <td className="p-2.5 text-center font-mono font-semibold text-slate-600">‰5.69</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                      {formatTL(calc.auctionAnalysis.stampTaxTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500">488 sayılı Damga Vergisi Kanunu ihale kararı harcı</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">İhale KDV Tutarı</td>
                    <td className="p-2.5 text-center font-mono font-semibold text-slate-600">%{input.kdvRatePercent ?? 10}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                      {formatTL(calc.auctionAnalysis.kdvAmountTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500">Taşınmaz niteliğine göre belirlenen KDV oranı</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Tahliye, Haciz Terkini & Risk Tamponu</td>
                    <td className="p-2.5 text-center font-mono font-semibold text-slate-600">Sabit Tampon</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                      {formatTL(calc.auctionAnalysis.evictionBufferTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-500">İİK m.135 tahliye masrafları ve hukuki koruma bütçesi</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="p-2.5">Toplam İktisap & Masraf Maliyeti</td>
                    <td className="p-2.5 text-center font-mono">Maliyet Toplamı</td>
                    <td className="p-2.5 text-right font-mono font-black text-slate-950">
                      {formatTL(calc.auctionAnalysis.totalAcquisitionCostTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-600">Teklif bedeli + tüm yasal harç ve tahliye giderleri</td>
                  </tr>
                  <tr className="bg-emerald-50/80 font-bold text-emerald-950">
                    <td className="p-2.5">Öngörülen Net Yatırım Kârı</td>
                    <td className="p-2.5 text-center font-mono font-black text-emerald-700">%{calc.auctionAnalysis.projectedRoiPercent} ROI</td>
                    <td className="p-2.5 text-right font-mono font-black text-emerald-800 text-sm">
                      +{formatTL(calc.auctionAnalysis.projectedNetProfitTL)}
                    </td>
                    <td className="p-2.5 text-[11px] text-emerald-800">Piyasa rayici ile toplam edinme maliyeti arasındaki net fark</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {input.tenderAuthority && (
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-950 flex flex-wrap items-center justify-between gap-2">
                <span><strong>İhale Makamı:</strong> {input.tenderAuthority}</span>
                {input.tenderFileNo && <span><strong>Dosya No:</strong> {input.tenderFileNo}</span>}
              </div>
            )}
          </div>
        )}

        {/* FİNANSMAN & BANKA KREDİ UYGUNLUĞU */}
        {calc.loanAnalysis && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 font-heading flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
                Finansman, Banka Kredi Uygunluğu & BDDK Kaldıraç Simülasyonu
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                BDDK LTV: %{calc.loanAnalysis.ltvPercent}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Çekilebilecek Azami Kredi</div>
                <div className="text-base font-black text-blue-700 font-mono mt-0.5">
                  {formatTL(calc.loanAnalysis.maxLoanAmountTL)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ekspertiz değerinin %{calc.loanAnalysis.ltvPercent}&apos;i</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Asgari Peşinat (Özkaynak)</div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {formatTL(calc.loanAnalysis.requiredDownPaymentTL)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Yatırımcının nakit ihtiyacı</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Aylık Kredi Taksiti</div>
                <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                  {formatTL(calc.loanAnalysis.monthlyLoanInstallmentTL)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">%{calc.loanAnalysis.interestRateMonthly} faiz • {calc.loanAnalysis.termMonths} ay vade</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Net Aylık Nakit Akışı</div>
                <div className={`text-base font-black font-mono mt-0.5 ${
                  (calc.loanAnalysis.netMonthlyCashFlowTL ?? 0) >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}>
                  {formatTL(calc.loanAnalysis.netMonthlyCashFlowTL ?? 0)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Kira Geliri - Kredi Taksiti</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. AÇIK VERİ, DÖVİZ VE ÇEVRESEL ANALİZLER (PUBLIC APIS) */}
        {(calc.currencyRates || calc.earthquakeRisk || calc.solarClimate) && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 font-heading flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Activity className="w-3.5 h-3.5" />
              4. Açık Veri Portalı & Uluslararası Göstergeler
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Frankfurter / ECB Kurları */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      Döviz Bazlı Değerleme
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                      ECB Canlı
                    </span>
                  </div>
                  <div className="space-y-1 my-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">USD Değeri:</span>
                      <strong className="text-slate-900 font-black text-sm">
                        ${calc.fairMarketValueUSD?.toLocaleString("en-US")}
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">EUR Değeri:</span>
                      <strong className="text-slate-900 font-black text-sm">
                        €{calc.fairMarketValueEUR?.toLocaleString("en-US")}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                  Kur: 1$ = {calc.currencyRates?.usdTry.toFixed(2)} ₺ • 1€ = {calc.currencyRates?.eurTry.toFixed(2)} ₺
                </div>
              </div>

              {/* USGS Deprem ve Fay Hattı Riski */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-rose-600" />
                      Sismik Risk (USGS)
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      calc.earthquakeRisk?.riskLevel === "Düşük" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : calc.earthquakeRisk?.riskLevel === "Orta" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {calc.earthquakeRisk?.riskLevel || "Orta"} Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug my-1.5">
                    {calc.earthquakeRisk?.nearestEvent || "Bölgesel 150 km sismik fay aktivitesi"}
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span>150 km içi aktivite:</span>
                  <span className="font-bold text-slate-800">{calc.earthquakeRisk?.eventsCountWithin150km || 0} Olay</span>
                </div>
              </div>

              {/* Open-Meteo Güneşlenme ve İklim */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      Güneş & İklim Potansiyeli
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase">
                      Open-Meteo
                    </span>
                  </div>
                  <div className="space-y-1 my-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">Çatı GES / İklim:</span>
                      <strong className="text-slate-900 font-bold text-xs">
                        {calc.solarClimate?.solarSuitability || "Yüksek Potansiyel"}
                      </strong>
                    </div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500">Işınım (GHI):</span>
                      <strong className="text-amber-900 font-black text-xs">
                        {calc.solarClimate?.solarRadiationMJ} MJ/m²
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200 flex items-center justify-between">
                  <span>Maks. Sıcaklık:</span>
                  <span className="font-bold text-slate-800">~{calc.solarClimate?.avgTempMaxC}°C</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. GÜÇLÜ YÖNLER & RİSK DEĞERLENDİRMESİ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <h3 className="font-extrabold text-emerald-950 flex items-center gap-1.5 font-heading text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Tespit Edilen Güçlü Yönler (Avantajlar)
            </h3>
            <ul className="space-y-1.5 text-emerald-900 text-[11px] leading-relaxed">
              {calc.advantages.map((adv, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
            <h3 className="font-extrabold text-amber-950 flex items-center gap-1.5 font-heading text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Kritik Risk ve Kısıt Faktörleri
            </h3>
            <ul className="space-y-1.5 text-amber-900 text-[11px] leading-relaxed">
              {calc.risksAndWarnings.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 6. DANIŞMAN VE KURUMSAL MÜHÜR */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Raporu Düzenleyen Danışman & Ofis</span>
            <div className="font-extrabold text-slate-900 text-sm">{input.consultantName || "Yetkili Gayrimenkul Danışmanı"}</div>
            <div className="text-slate-600 font-semibold">{input.consultantAgency || "İhaleciBurada Kurumsal Portföy"}</div>
            <div className="text-blue-700 font-bold flex items-center gap-1">
              <PhoneCall className="w-3 h-3" />
              <span>{input.consultantPhone || "0850 840 86 95"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right sm:text-right space-y-1 w-full sm:w-auto">
            <div className="flex items-center sm:justify-end gap-1.5 text-xs font-black text-[#0B1E3B]">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>İhaleciBurada Doğrulanmış Ön Ekspertiz</span>
            </div>
            <p className="text-[10px] text-slate-500 max-w-xs sm:text-right leading-tight">
              Veriler Türkiye 81 il piyasa emsal endeksi ve güncel değerleme standartları referans alınarak simüle edilmiştir.
            </p>
            {input.dataSourceLabel && (
              <div className="text-[10px] text-blue-700 font-bold pt-1 sm:text-right">
                Kaynak: {input.dataSourceLabel}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
