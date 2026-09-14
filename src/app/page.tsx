"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ValuationWizard } from "@/components/ValuationWizard";
import { FeasibilityPreview } from "@/components/FeasibilityPreview";
import { ReportView } from "@/components/ReportView";
import { WhatsAppShareModal } from "@/components/WhatsAppShareModal";
import { EndeksaSidebar } from "@/components/EndeksaSidebar";
import { PriceTrendChart } from "@/components/PriceTrendChart";
import { ParcelMap } from "@/components/ParcelMap";
import { ParcelInput } from "@/types";
import { SAMPLE_SCENARIOS, formatTL, formatNumber } from "@/lib/constants";
import { calculateFeasibility } from "@/lib/calculator";
import { 
  Building, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldCheck, 
  Gavel, 
  CheckCircle, 
  Layers, 
  TrendingUp,
  FileCheck,
  Search,
  ChevronDown,
  MapPin,
  Home as HomeIcon,
  Building2,
  Calendar,
  DollarSign,
  Share2,
  Printer,
  SlidersHorizontal,
  Flame
} from "lucide-react";

export default function Home() {
  // Varsayılan olarak Çanakkale senaryosu ile başlar
  const [parcelData, setParcelData] = useState<ParcelInput>(SAMPLE_SCENARIOS[0].data);
  const [activeTab, setActiveTab] = useState<"endeks" | "degerleme" | "ihale" | "rapor">("endeks");
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("Çanakkale, Bayramiç");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Anlık fizibilite hesaplaması
  const calculation = useMemo(() => {
    return calculateFeasibility(parcelData);
  }, [parcelData]);

  const isResidential = parcelData.category === "konut";

  const handleCategorySwitch = (cat: "arsa" | "konut") => {
    if (cat === "konut") {
      setParcelData({
        ...parcelData,
        category: "konut",
        title: "Konut & Daire Portföyü",
        areaM2: 135,
        netAreaM2: 110,
        roomCount: "3+1",
        buildingAge: "1-5",
        floorLocation: "ara_kat",
        housingType: "daire",
        heatingType: "dogalgaz_kombi",
        deedStatus: "kat_mulkiyeti",
        hasElevator: true,
        hasParking: true,
        hasBalcony: true,
        monthlyRentEstimateTL: 32000,
        askedPriceTL: 5800000,
      });
    } else {
      setParcelData({
        ...parcelData,
        category: "arsa",
        title: "İmarlı Arsa Portföyü",
        areaM2: 1000,
        zoningType: "konut",
        kaks: 1.5,
        taks: 0.35,
        maxFloors: 5,
        askedPriceTL: 9500000,
      });
    }
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const parts = searchQuery.split(",").map((s) => s.trim());
    const newCity = parts[0] || "Çanakkale";
    const newDistrict = parts[1] || "Bayramiç";

    try {
      const url = `/api/emsal?il=${encodeURIComponent(newCity)}&ilce=${encodeURIComponent(newDistrict)}&kategori=${parcelData.category}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        const resData = data.data;
        setParcelData({
          ...parcelData,
          city: newCity,
          district: newDistrict,
          neighborhood: resData.neighborhood || "",
          estimatedLandM2PriceTL: resData.landM2PriceTL,
          estimatedUnitSaleM2PriceTL: resData.unitSaleM2PriceTL,
          contractorSharePercent: resData.contractorSharePercent,
          monthlyRentEstimateTL: isResidential ? resData.estimatedMonthlyRentTL : parcelData.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: resData.comparables,
          tcmbOfficialData: resData.tcmbOfficialData,
          buildingCostEstimate: resData.buildingCostEstimate,
        });
      } else {
        setParcelData({
          ...parcelData,
          city: newCity,
          district: newDistrict,
        });
      }
    } catch (err) {
      setParcelData({
        ...parcelData,
        city: newCity,
        district: newDistrict,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. ENDEKSA TARZI ÜST ARAMA & GEZİNİM ÇUBUĞU */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16 gap-3">
          
          {/* Sol Kısım: Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveTab("endeks")}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-sm font-black text-sm">
                İB
              </div>
              <span className="font-black text-lg sm:text-xl font-heading tracking-tight text-slate-900 hidden sm:inline">
                ihaleciburada<span className="text-rose-600">.endeks</span>
              </span>
            </div>
          </div>

          {/* Orta Kısım: Endeksa Arama Kutusu [Adres v] [İl / İlçe ...] [Değerini Öğren] */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl mx-2 flex items-center bg-slate-50 border border-slate-300 rounded-full p-1 shadow-2xs focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 transition"
          >
            {/* Adres Dropdown */}
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-700 border-r border-slate-200 shrink-0 cursor-pointer">
              <span>Adres</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Arama Inputu */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İl, İlçe veya Mahalle arayın (Örn: Çanakkale, Bayramiç)"
              className="flex-1 bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 min-w-0"
            />

            {/* Arama İkonu */}
            <button 
              type="submit"
              aria-label="Konum Ara"
              className="p-1.5 text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* "Değerini Öğren" Kırmızı Butonu (Endeksa İmzası) */}
            <button
              type="button"
              onClick={() => setActiveTab("degerleme")}
              className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            >
              <span>Değerini Öğren</span>
            </button>
          </form>

          {/* Sağ Kısım: Hızlı İşlemler */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-600 transition cursor-pointer"
              title="WhatsApp İle Paylaş"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rapor")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rapor Al</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. RAPOR GÖRÜNÜMÜ MODU (Seçildiğinde Tam Ekran A4 Formatı) */}
      {activeTab === "rapor" ? (
        <main className="flex-1 py-6 px-4 sm:px-6">
          <ReportView
            input={parcelData}
            calc={calculation}
            onBack={() => setActiveTab("endeks")}
            onOpenShareModal={() => setShareModalOpen(true)}
          />
        </main>
      ) : (
        /* 3. ENDEKSA İKİYE BÖLÜNMÜŞ (SPLIT-SCREEN) ANA ÇALIŞMA ALANI */
        <div className="flex-1 flex flex-row overflow-hidden">
          
          {/* Sol Kenar Çubuğu (Icon Sidebar) */}
          <EndeksaSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            category={parcelData.category}
            onCategoryChange={handleCategorySwitch}
          />

          {/* İkili Çalışma Alanı: Sol Analitik (%50) + Sağ Harita (%50) */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            
            {/* SOL ANALİTİK & VERİ PANELİ (Scroll Edilebilir) */}
            <div className="w-full lg:w-[50%] lg:h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-5 space-y-4 border-r border-slate-200">
              
              {/* ENDEKSA FİLTRE HAPLARI (PILLS) */}
              <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200/80">
                {/* Gayrimenkul: Konut / Arsa */}
                <button
                  type="button"
                  onClick={() => handleCategorySwitch(isResidential ? "arsa" : "konut")}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition cursor-pointer"
                >
                  <span>Gayrimenkul: <strong className="text-rose-900">{isResidential ? "Konut" : "Arsa"}</strong></span>
                  <ChevronDown className="w-3 h-3 text-rose-500" />
                </button>

                {/* Tip: Satılık */}
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  Tip: <strong className="text-slate-900">Satılık / İhale</strong>
                </span>

                {/* Kategori: Tümü */}
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  Kategori: <strong className="text-slate-900">{isResidential ? parcelData.housingType || "Daire" : parcelData.zoningType || "İmar"}</strong>
                </span>

                {/* Oda / Kat */}
                {isResidential ? (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    Oda: <strong className="text-slate-900">{parcelData.roomCount || "3+1"}</strong>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    Emsal: <strong className="text-slate-900">KAKS {parcelData.kaks || 1.5}</strong>
                  </span>
                )}
              </div>

              {/* ÇALIŞMA SEKMELERİ: [ENDEKS & TREND] | [DEĞERLEME SİHİRBAZI] | [İHALE ANALİZİ] */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("endeks")}
                  className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "endeks"
                      ? "bg-white text-rose-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Fiyat Endeksi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("degerleme")}
                  className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "degerleme"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Değerleme Girişi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ihale")}
                  className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "ihale"
                      ? "bg-white text-orange-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Gavel className="w-3.5 h-3.5" />
                  <span>İhale & Pey</span>
                </button>
              </div>

              {/* SEKME 1: ENDEKS & FİYAT TRENDİ (ENDEKSA GRAFİĞİ) */}
              {activeTab === "endeks" && (
                <div className="space-y-4">
                  {/* İnteraktif Fiyat Trend Grafiği */}
                  <PriceTrendChart
                    city={parcelData.city}
                    district={parcelData.district}
                    neighborhood={parcelData.neighborhood}
                    category={parcelData.category}
                    currentUnitM2TL={
                      isResidential 
                        ? (parcelData.estimatedUnitSaleM2PriceTL || 48000) 
                        : (parcelData.estimatedLandM2PriceTL || 15000)
                    }
                    kfeIndex={parcelData.tcmbOfficialData?.kfeIndex}
                    kfeAnnualChange={parcelData.tcmbOfficialData?.kfeAnnualChangePercent}
                    currencyRates={parcelData.currencyRates}
                  />

                  {/* ENDEKSA ÖZET METRİK KARTLARI */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Adil Piyasa Değeri
                      </span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 font-mono">
                        {formatTL(calculation.fairMarketValueTL)}
                      </strong>
                      <span className="text-[9px] text-emerald-600 block mt-0.5 font-semibold">
                        Güven Skoru: %94
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        TCMB KFE Endeksi
                      </span>
                      <strong className="text-sm sm:text-base font-black text-blue-700 font-mono">
                        {parcelData.tcmbOfficialData?.kfeIndex || 204.36}
                      </strong>
                      <span className="text-[9px] text-slate-500 block mt-0.5 truncate">
                        {parcelData.tcmbOfficialData?.benchmarkRegion || "Bölge Medyanı"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Amortisman Süresi
                      </span>
                      <strong className="text-sm sm:text-base font-black text-slate-900 font-mono">
                        {calculation.amortizationYears || 18} Yıl
                      </strong>
                      <span className="text-[9px] text-emerald-600 block mt-0.5 font-semibold">
                        Yüksek Kira Verimi
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Güvenli Tavan Pey
                      </span>
                      <strong className="text-sm sm:text-base font-black text-amber-900 font-mono">
                        {formatTL(calculation.auctionAnalysis?.maxSafeBidTL || Math.round(calculation.fairMarketValueTL * 0.72))}
                      </strong>
                      <span className="text-[9px] text-orange-600 block mt-0.5 font-bold">
                        İhale Fırsat Sınırı
                      </span>
                    </div>
                  </div>

                  {/* Eylemler: Rapor Aç & WhatsApp */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("rapor")}
                      className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Kapsamlı Raporu Aç (PDF)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareModalOpen(true)}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>WhatsApp Yatırımcı Brifi</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SEKME 2: DEĞERLEME SİHİRBAZI */}
              {activeTab === "degerleme" && (
                <div className="space-y-4">
                  <ValuationWizard
                    input={parcelData}
                    onChange={setParcelData}
                    onReset={() => handleCategorySwitch(parcelData.category)}
                  />
                </div>
              )}

              {/* SEKME 3: İHALE VE FİZİBİLİTE ÖNİZLEMESİ */}
              {activeTab === "ihale" && (
                <div className="space-y-4">
                  <FeasibilityPreview
                    input={parcelData}
                    calc={calculation}
                    onViewReport={() => setActiveTab("rapor")}
                  />
                </div>
              )}
            </div>

            {/* SAĞ HARİTA PANELİ (%50 Genişlik - Endeksa Tam Ekran Haritası) */}
            <div className="w-full lg:w-[50%] lg:h-[calc(100vh-64px)] relative bg-slate-100 flex flex-col">
              <ParcelMap
                city={parcelData.city}
                district={parcelData.district}
                neighborhood={parcelData.neighborhood}
                ada={parcelData.ada}
                parsel={parcelData.parsel}
                coordinates={parcelData.coordinates}
                elevationMeters={parcelData.elevationMeters}
                comparables={parcelData.comparables}
                category={parcelData.category}
                unitM2Price={
                  isResidential 
                    ? (parcelData.estimatedUnitSaleM2PriceTL || 48000) 
                    : (parcelData.estimatedLandM2PriceTL || 15000)
                }
                isEndeksaSplitView={true}
                onLocationFound={(coords) => {
                  setParcelData({ ...parcelData, coordinates: coords });
                }}
              />
            </div>

          </div>
        </div>
      )}

      {/* WhatsApp Paylaşım Modalı */}
      <WhatsAppShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        input={parcelData}
        calc={calculation}
      />
    </div>
  );
}
