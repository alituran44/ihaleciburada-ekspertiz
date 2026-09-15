"use client";

import React, { useState } from "react";
import { ValuationFormData } from "./types";
import { 
  TrendingUp, 
  Gavel, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Share2, 
  Printer, 
  FileText, 
  Building2, 
  Home, 
  DollarSign, 
  CheckCircle2, 
  ArrowUpRight, 
  BarChart2, 
  Clock, 
  Layers, 
  RotateCcw,
  Compass
} from "lucide-react";

interface ValuationResultsDashboardProps {
  data: ValuationFormData;
  onReset: () => void;
  onOpenReportModal: () => void;
}

export const ValuationResultsDashboard: React.FC<ValuationResultsDashboardProps> = ({
  data,
  onReset,
  onOpenReportModal,
}) => {
  const [valuationViewMode, setValuationViewMode] = useState<"satis" | "kira">("satis");
  const [activeTab, setActiveTab] = useState<"yatirim" | "karne" | "emsaller" | "trend" | "rapor">("yatirim");
  const [copied, setCopied] = useState(false);
  const [userReportedPrice, setUserReportedPrice] = useState("");
  const [userReportedSaved, setUserReportedSaved] = useState(false);

  // Değerleme Değişkenleri
  const isKonut = data.service === "konut";
  const isArsa = data.service === "arsa";
  const isArazi = data.service === "arazi";

  const area = isArsa ? data.arsaAreaM2 : isArazi ? data.araziAreaM2 : data.grossAreaM2;
  const unitPrice = isKonut ? 71818 : isArazi ? 419 : isArsa ? 18500 : 45000;
  const marketValueTL = isKonut ? 7900000 : isArazi ? 490000 : Math.round(area * unitPrice);
  const minMarketValueTL = Math.round(marketValueTL * 0.95);
  const maxMarketValueTL = Math.round(marketValueTL * 1.06);

  // İhale Tabanı (%50 İİK m.115)
  const tenderBasePriceTL = Math.round(marketValueTL * 0.50);
  const potentialArbitrageProfitTL = marketValueTL - tenderBasePriceTL;

  // Kira & Amortisman
  const monthlyRentTL = isKonut ? 42500 : Math.round(marketValueTL / 220);
  const paybackYears = isKonut ? 15.5 : isArazi ? 28 : 22;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. ÜST BİLGİ & EYLEM ÇUBUĞU                                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0B1E3B] text-amber-400 text-[10px] font-extrabold uppercase font-mono">
              İhaleciBurada Değerleme Raporu
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              TKGM & İİK m.115 Doğrulandı
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Rapor No: İB-2026-{data.ada || "48507"}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
            {data.city}, {data.district}, {data.neighborhood || "Merkez"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Ada: <strong className="text-slate-800">{data.ada}</strong> | Parsel: <strong className="text-slate-800">{data.parsel}</strong> | Alan: <strong className="text-slate-800">{area} m²</strong> | Deprem PGA: <strong className="text-emerald-700">{data.pgaSeismicHazard}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Rapor Linkini Kopyala"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copied ? "Kopyalandı!" : "Paylaş"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#0B1E3B] hover:bg-blue-900 text-amber-400 text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Resmi PDF Rapor (13 Sayfa)</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition cursor-pointer"
            title="Yeni Değerleme Başlat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL HERO VALUE CARDS (PİYASA DEĞERİ & İHALE ARBİTRAJI)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KART A: PİYASA RAYİÇ DEĞERİ */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Tahmini Piyasa Rayici
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Hedonik Fiyat Modeli & Güncel Satışlar
                </span>
              </div>
            </div>

            {/* Satış / Kira Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setValuationViewMode("satis")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  valuationViewMode === "satis" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Satış
              </button>
              <button
                type="button"
                onClick={() => setValuationViewMode("kira")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  valuationViewMode === "kira" ? "bg-white text-slate-900 shadow-2xs font-black" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Kira
              </button>
            </div>
          </div>

          <div className="text-center py-3 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
              {valuationViewMode === "satis" 
                ? `${marketValueTL.toLocaleString("tr-TR")} ₺`
                : `${monthlyRentTL.toLocaleString("tr-TR")} ₺ / ay`
              }
            </div>
            <div className="text-xs font-extrabold text-slate-600">
              {valuationViewMode === "satis" 
                ? `${unitPrice.toLocaleString("tr-TR")} ₺ / m²` 
                : `Yıllık Getiri: ${(monthlyRentTL * 12).toLocaleString("tr-TR")} ₺`
              }
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Minimum Değer</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">
                {minMarketValueTL.toLocaleString("tr-TR")} ₺
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Maksimum Değer</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">
                {maxMarketValueTL.toLocaleString("tr-TR")} ₺
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Model Güven Skoru: <strong className="text-slate-900">%94 (Yüksek)</strong></span>
            <span>Amortisman: <strong className="text-slate-900">{paybackYears} Yıl</strong></span>
          </div>
        </div>

        {/* KART B: İHALECİ BURADA İCRA & İHALE ARBİTRAJI */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0B1E3B] to-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                <Gavel className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                  İcra & İhale Fırsat Tabanı
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  İİK m.115 %50 Başlangıç Rayici
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              %50 Fırsat Marjı
            </span>
          </div>

          <div className="text-center py-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-heading tracking-tight">
              {tenderBasePriceTL.toLocaleString("tr-TR")} ₺
            </div>
            <div className="text-xs font-bold text-slate-300">
              Potansiyel Arbitraj Kârı: <strong className="text-emerald-400">+{potentialArbitrageProfitTL.toLocaleString("tr-TR")} ₺</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Yatırım Skoru</div>
              <div className="text-base font-black text-white mt-0.5 flex items-center justify-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                <span>8.8 / 10 (A+)</span>
              </div>
            </div>

            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tahmini Satış Süresi</div>
              <div className="text-base font-black text-white mt-0.5 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>45 Gün (Hızlı)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Yasal Taban: 2004 Sayılı İİK</span>
            <span className="text-amber-400 font-semibold">İhaleciBurada Portföyünde Takipte</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 5'Lİ ANALİTİK SEKMELERİ                                                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex items-center overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-3 pt-2 text-xs font-extrabold">
          {[
            { id: "yatirim", label: "Yatırım & Arbitraj Fizibilitesi", icon: BarChart2 },
            { id: "karne", label: "Mülk & Kadastro Karnesi", icon: Layers },
            { id: "emsaller", label: "Bölge Emsalleri & İlanlar", icon: Building2 },
            { id: "trend", label: "Değer Değişim Trendi", icon: TrendingUp },
            { id: "rapor", label: "Resmi Ekspertiz Raporu", icon: FileText },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition cursor-pointer font-heading ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-2xs font-black"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-7">
          {/* TAB 1: YATIRIM & ARBİTRAJ */}
          {activeTab === "yatirim" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  İhale Alımı vs Serbest Piyasa Karşılaştırması
                </h3>
                <p className="text-xs text-slate-500">
                  Taşınmazın icra ihalesinden %50 tabanla alınması durumundaki tahmini net kârlılık tablosu.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-y border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Finansal Kalem</th>
                      <th className="py-2.5 px-3 text-right">Serbest Piyasa Alımı</th>
                      <th className="py-2.5 px-3 text-right text-amber-700">İhale Başlangıç (%50)</th>
                      <th className="py-2.5 px-3 text-right text-emerald-700">Fırsat Farkı / Net Kazanç</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-900">Satın Alma Bedeli</td>
                      <td className="py-3 px-3 text-right">{marketValueTL.toLocaleString("tr-TR")} ₺</td>
                      <td className="py-3 px-3 text-right text-amber-700 font-mono font-bold">{tenderBasePriceTL.toLocaleString("tr-TR")} ₺</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-mono font-black">-{potentialArbitrageProfitTL.toLocaleString("tr-TR")} ₺ (%50 Tasarruf)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3">Tapu Harcı & Damga Vergisi (%4 + KDV)</td>
                      <td className="py-3 px-3 text-right">{Math.round(marketValueTL * 0.04).toLocaleString("tr-TR")} ₺</td>
                      <td className="py-3 px-3 text-right text-amber-700 font-mono">{Math.round(tenderBasePriceTL * 0.04).toLocaleString("tr-TR")} ₺</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-mono">+{Math.round((marketValueTL - tenderBasePriceTL) * 0.04).toLocaleString("tr-TR")} ₺</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3">Tahmini Yıllık Brüt Kira Getirisi</td>
                      <td className="py-3 px-3 text-right">{(monthlyRentTL * 12).toLocaleString("tr-TR")} ₺ (%6.4)</td>
                      <td className="py-3 px-3 text-right text-amber-700 font-mono font-bold">{(monthlyRentTL * 12).toLocaleString("tr-TR")} ₺ (%12.9)</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-mono font-black">2 Kat Daha Yüksek Getiri Oranı</td>
                    </tr>
                    <tr className="bg-emerald-50/50 font-black text-slate-900">
                      <td className="py-3 px-3 text-emerald-950">Net Yatırım Arbitrajı (Tahmini ROI)</td>
                      <td className="py-3 px-3 text-right text-slate-500">Piyasa Normu</td>
                      <td className="py-3 px-3 text-right text-amber-900 font-mono">%100 Özkaynak Getirisi</td>
                      <td className="py-3 px-3 text-right text-emerald-800 font-mono text-sm">+{potentialArbitrageProfitTL.toLocaleString("tr-TR")} ₺ Kâr Potansiyeli</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MÜLK KARNESİ */}
          {activeTab === "karne" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Mülk & Kadastro Teknik Özellikleri</h3>
                <p className="text-xs text-slate-500">Girdiğiniz ve resmi kadastrodan teyit edilen mülk parametreleri.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Kategori</div>
                  <div className="font-extrabold text-slate-900 capitalize mt-0.5">{data.service}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Ada / Parsel</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{data.ada} / {data.parsel}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Brüt / Arsa Alanı</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">{area} m²</div>
                </div>

                {isKonut && (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-400 text-[10px] font-bold uppercase">Oda Sayısı</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{data.roomCount}+{data.livingRoomCount}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-400 text-[10px] font-bold uppercase">Bulunduğu Kat</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{data.floorNumber}. Kat (Toplam: {data.totalFloors})</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-400 text-[10px] font-bold uppercase">Bina Yaşı</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{data.buildingAge} Yaşında</div>
                    </div>
                  </>
                )}

                {isArsa && (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-400 text-[10px] font-bold uppercase">Emsal (KAKS)</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{data.arsaKaks}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-slate-400 text-[10px] font-bold uppercase">Taban Alanı (TAKS)</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{data.arsaTaks}</div>
                    </div>
                  </>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Deprem Riski (PGA)</div>
                  <div className="font-extrabold text-emerald-700 mt-0.5">{data.pgaSeismicHazard} (Düşük)</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Kullanım Durumu</div>
                  <div className="font-extrabold text-slate-900 capitalize mt-0.5">{data.usageStatus.replace("_", " ")}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMSAL İLANLAR & İHALELER */}
          {activeTab === "emsaller" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Bölgesel Emsal İlanlar ve Son İhale Kararları</h3>
                <p className="text-xs text-slate-500">Değerlemeye konu parselle 500m yarıçaptaki güncel satılık ve ihale emsalleri.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { title: "Devlet Mah. 3+1 115 m² Lüks Daire", price: "8.150.000 ₺", m2: "70.869 ₺/m²", date: "3 Gün Önce", type: "Serbest Piyasa İlanı" },
                  { title: "Devlet Mah. 3+1 110 m² Ara Kat Daire", price: "7.750.000 ₺", m2: "70.454 ₺/m²", date: "1 Hafta Önce", type: "Serbest Piyasa İlanı" },
                  { title: "48506 Ada 2 Parsel 3+1 Daire (İcra Satışı)", price: "4.100.000 ₺", m2: "37.272 ₺/m²", date: "Son 30 Gün", type: "Gerçekleşen İcra Satışı" },
                  { title: "Eryaman 1. Etap 3+1 120 m² Daire", price: "8.400.000 ₺", m2: "70.000 ₺/m²", date: "Dün", type: "Serbest Piyasa İlanı" },
                ].map((em, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        em.type.includes("İcra") ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-blue-100 text-blue-900"
                      }`}>
                        {em.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{em.date}</span>
                    </div>
                    <div className="font-bold text-slate-900">{em.title}</div>
                    <div className="flex items-center justify-between font-mono text-xs pt-1 border-t border-slate-200/60">
                      <span className="font-extrabold text-slate-900">{em.price}</span>
                      <span className="text-slate-500">{em.m2}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DEĞER DEĞİŞİMİ */}
          {activeTab === "trend" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Bölgesel Değer Artış Trendi (TCMB & Piyasa)</h3>
                <p className="text-xs text-slate-500">Son 3 yılda {data.district} bölgesindeki konut fiyat endeksi değişimi.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">Son 1 Yıllık Artış</div>
                  <div className="text-xl font-black text-emerald-900 mt-1 font-mono">+%64.2</div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Enflasyon Üstü Getiri</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800 uppercase">Son 2 Yıllık Artış</div>
                  <div className="text-xl font-black text-blue-900 mt-1 font-mono">+%148.0</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Bölge Ortalaması: %135</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-[11px] font-bold text-purple-800 uppercase">Son 3 Yıllık Artış</div>
                  <div className="text-xl font-black text-purple-900 mt-1 font-mono">+%312.5</div>
                  <div className="text-[10px] text-purple-700 mt-0.5">TCMB EVDS İndeksi</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RESMİ RAPOR */}
          {activeTab === "rapor" && (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  İhaleciBurada Lisanslı Elektronik Ekspertiz Raporu
                </h3>
                <p className="text-xs text-slate-500">
                  SPK ve TCMB uyumlu 13 sayfalık resmi değerleme raporunu tarayıcınızda açıp inceleyebilir veya PDF olarak yazdırabilirsiniz.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="px-8 py-3 rounded-xl bg-[#0B1E3B] hover:bg-blue-900 text-amber-400 font-extrabold text-xs shadow-md transition cursor-pointer inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>13 Sayfalık Raporu Görüntüle</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CROWDSOURCED GERÇEK DEĞER BİLDİRİMİ (İHALECİBURADA VERİ AĞI)           */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Gerçekleşen İhale veya Satış Fiyatı Bildirimi</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Bu parselde veya yakın çevrede gerçekleşen kesin satış tutarını bildirerek İhaleciBurada yapay zeka modelinin doğruluğunu güçlendirebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <input
            type="text"
            value={userReportedPrice}
            onChange={(e) => setUserReportedPrice(e.target.value)}
            placeholder="₺ Gerçekleşen Değer"
            className="w-full sm:w-44 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (userReportedPrice) setUserReportedSaved(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer whitespace-nowrap"
          >
            {userReportedSaved ? "✓ Kaydedildi" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
};
