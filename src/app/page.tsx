"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ValuationWizard } from "@/components/ValuationWizard";
import { FeasibilityPreview } from "@/components/FeasibilityPreview";
import { ReportView } from "@/components/ReportView";
import { WhatsAppShareModal } from "@/components/WhatsAppShareModal";
import { EndeksaSidebar } from "@/components/EndeksaSidebar";
import { PriceTrendChart } from "@/components/PriceTrendChart";
import { InvestmentScoreCard } from "@/components/InvestmentScoreCard";
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
  Flame,
  Loader2,
  Trees,
  Compass
} from "lucide-react";

export default function Home() {
  const [parcelData, setParcelData] = useState<ParcelInput>(SAMPLE_SCENARIOS[0].data);
  const [activeTab, setActiveTab] = useState<"endeks" | "degerleme" | "ihale" | "rapor">("endeks");
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("Çanakkale, Bayramiç");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Türkiye Geneli Canlı Konum Autocomplete Arama Durumu
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında arama önerilerini kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Canlı Konum Arama (Debounce ile 81 İl, 973 İlçe, Köy ve Mahalleler)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success && data.results) {
          setSuggestions(data.results);
          setShowSuggestions(data.results.length > 0);
        }
      } catch (err) {
        console.warn("Konum arama servisi hatası:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Konum Autocomplete Seçildiğinde Çalışır
  const handleSelectLocation = async (item: any) => {
    setShowSuggestions(false);
    setSearchQuery(`${item.label}, ${item.province}`);
    setIsSearching(true);

    const newCity = item.province;
    const newDistrict = item.district || "Merkez";
    const newNeighborhood = item.neighborhood || "";
    const newCoords = item.lat && item.lng ? { lat: item.lat, lng: item.lng } : undefined;

    try {
      const url = `/api/emsal?il=${encodeURIComponent(newCity)}&ilce=${encodeURIComponent(newDistrict)}&mahalle=${encodeURIComponent(newNeighborhood)}&kategori=${parcelData.category}${newCoords ? `&lat=${newCoords.lat}&lng=${newCoords.lng}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        const resData = data.data;
        setParcelData({
          ...parcelData,
          city: newCity,
          district: newDistrict,
          neighborhood: newNeighborhood,
          coordinates: newCoords || resData.coordinates || parcelData.coordinates,
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
          neighborhood: newNeighborhood,
          coordinates: newCoords || parcelData.coordinates,
        });
      }
    } catch (err) {
      setParcelData({
        ...parcelData,
        city: newCity,
        district: newDistrict,
        neighborhood: newNeighborhood,
        coordinates: newCoords || parcelData.coordinates,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // İlçe Tablosundan (Görsel 4 & 6) İlçe Seçildiğinde Çalışır
  const handleSelectDistrict = async (districtName: string) => {
    setSearchQuery(`${parcelData.city}, ${districtName}`);
    setIsSearching(true);

    try {
      const url = `/api/emsal?il=${encodeURIComponent(parcelData.city)}&ilce=${encodeURIComponent(districtName)}&kategori=${parcelData.category}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        const resData = data.data;
        setParcelData({
          ...parcelData,
          district: districtName,
          neighborhood: "",
          coordinates: resData.coordinates || parcelData.coordinates,
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
          district: districtName,
          neighborhood: "",
        });
      }
    } catch (err) {
      setParcelData({
        ...parcelData,
        district: districtName,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Form submit olduğunda arama
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0]);
      return;
    }

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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center justify-between px-3 sm:px-6 h-14 sm:h-16 gap-3">
          
          {/* Sol Kısım: İhaleci Burada Kurumsal Logo */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab("endeks")}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-600 flex items-center justify-center text-amber-400 shadow-sm border border-amber-500/30">
                <Gavel className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-xl font-heading tracking-tight text-slate-900 hidden sm:inline leading-tight">
                  ihaleciburada<span className="text-amber-600">.ekspertiz</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 hidden sm:inline -mt-0.5 tracking-wide uppercase font-mono">
                  İhale & Emsal Değerleme Motoru
                </span>
              </div>
            </div>
          </div>

          {/* Orta Kısım: İhaleci Burada Arama Kutusu & Canlı Konum Autocomplete */}
          <div className="relative flex-1 max-w-xl mx-2" ref={searchContainerRef}>
            <form 
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-slate-50 border border-slate-300 rounded-full p-1 shadow-2xs focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 focus-within:bg-white transition"
            >
              {/* Konum Etiketi */}
              <div className="hidden sm:flex items-center gap-1 px-3 py-1 text-xs font-bold text-slate-700 border-r border-slate-200 shrink-0 cursor-pointer">
                <span>Konum</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Arama Inputu */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="81 İl, İlçe veya Köy Arayın (Örn: Çanakkale, Bayramiç, Adatepe)"
                className="flex-1 bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 min-w-0"
              />

              {/* Arama / Yükleniyor İkonu */}
              <button 
                type="submit"
                aria-label="Konum Ara"
                className="p-1.5 text-slate-400 hover:text-amber-600 transition shrink-0 cursor-pointer"
              >
                {isLoadingSuggestions || isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>

              {/* "Ekspertiz Başlat" Amber Butonu */}
              <button
                type="button"
                onClick={() => setActiveTab("degerleme")}
                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                <span>Ekspertiz Başlat</span>
              </button>
            </form>

            {/* TÜRKİYE 81 İL, 973 İLÇE VE KÖY CANLI ÖNERİ AÇILIR PENCERESİ */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto divide-y divide-slate-100">
                <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Türkiye Mülki İdare & Harita Sonuçları</span>
                  <span>{suggestions.length} Konum</span>
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLocation(item)}
                    className="p-3 hover:bg-rose-50/60 cursor-pointer transition flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === "il" 
                          ? "bg-blue-100 text-blue-700" 
                          : item.type === "ilce" 
                          ? "bg-amber-100 text-amber-700" 
                          : item.type === "koy" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {item.type === "il" ? (
                          <Building className="w-4 h-4" />
                        ) : item.type === "ilce" ? (
                          <Building2 className="w-4 h-4" />
                        ) : item.type === "koy" ? (
                          <Trees className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.secondaryLabel}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      item.type === "il" 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : item.type === "ilce" 
                        ? "bg-amber-50 text-amber-800 border border-amber-200" 
                        : item.type === "koy" 
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                        : "bg-purple-50 text-purple-800 border border-purple-200"
                    }`}>
                      {item.type === "il" ? "İl" : item.type === "ilce" ? "İlçe" : item.type === "koy" ? "Köy" : "Mahalle"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

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
            <div className="w-full lg:w-[50%] lg:h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-5 space-y-5 border-r border-slate-200">
              
              {/* İHALECİ BURADA FİLTRE HAPLARI */}
              <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200/80">
                {/* Gayrimenkul: Konut / Arsa */}
                <button
                  type="button"
                  onClick={() => handleCategorySwitch(isResidential ? "arsa" : "konut")}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  <span>Portföy: <strong className="text-amber-950">{isResidential ? "Konut & Daire" : "Arsa & Arazi"}</strong></span>
                  <ChevronDown className="w-3 h-3 text-amber-600" />
                </button>

                {/* Segment */}
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  Segment: <strong className="text-slate-900">İhale & Serbest Piyasa</strong>
                </span>

                {/* Kategori */}
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  Tip: <strong className="text-slate-900">{isResidential ? parcelData.housingType || "Daire" : parcelData.zoningType || "İmar"}</strong>
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

              {/* ÇALIŞMA SEKMELERİ: [PİYASA ANALİZİ] | [KADASTRO & DEĞERLEME] | [İHALE & PEY SİMÜLATÖRÜ] */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("endeks")}
                  className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "endeks"
                      ? "bg-white text-amber-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>Piyasa Analizi</span>
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
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kadastro & Değerleme</span>
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
                  <Gavel className="w-3.5 h-3.5 text-orange-600" />
                  <span>İhale & Pey Analizi</span>
                </button>
              </div>

              {/* SEKME 1: PİYASA ANALİZİ, İHALE TRENDİ & YATIRIM SKORLARI */}
              {activeTab === "endeks" && (
                <div className="space-y-6">
                  
                  {/* BÖLÜM 1: İnteraktif Fiyat Trend Grafiği (Görsel 1) + Satılık Konut Ortalamaları (Görsel 5) + Değişim & Döviz (Görsel 2) */}
                  <PriceTrendChart
                    city={parcelData.city}
                    district={parcelData.district}
                    neighborhood={parcelData.neighborhood}
                    category={parcelData.category}
                    currentUnitM2TL={
                      isResidential 
                        ? (parcelData.estimatedUnitSaleM2PriceTL || 54090) 
                        : (parcelData.estimatedLandM2PriceTL || 15000)
                    }
                    kfeIndex={parcelData.tcmbOfficialData?.kfeIndex}
                    kfeAnnualChange={parcelData.tcmbOfficialData?.kfeAnnualChangePercent}
                    currencyRates={parcelData.currencyRates}
                  />

                  {/* BÖLÜM 2: Bölge Yatırım Skoru (Görsel 3) + İlçeler Yatırım Skoru (Görsel 4) + İlçeler Piyasa Ortalamaları (Görsel 6) */}
                  <InvestmentScoreCard
                    city={parcelData.city}
                    selectedDistrict={parcelData.district}
                    category={parcelData.category}
                    onSelectDistrict={handleSelectDistrict}
                  />

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
                    ? (parcelData.estimatedUnitSaleM2PriceTL || 54090)
                    : (parcelData.estimatedLandM2PriceTL || 15000)
                }
                isEndeksaSplitView={true}
                onLocationFound={(coords) => {
                  setParcelData((prev) => ({
                    ...prev,
                    coordinates: coords,
                  }));
                }}
                onSelectDistrict={(dist) => {
                  handleSelectDistrict(dist);
                }}
                onSelectNeighborhood={(neigh) => {
                  setParcelData((prev) => ({
                    ...prev,
                    neighborhood: neigh,
                  }));
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
