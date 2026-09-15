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
import { EndeksaValuationModal } from "@/components/EndeksaValuationModal";
import { ElectronicReportModal } from "@/components/ElectronicReportModal";
import { ReportSelectionModal, ReportPackageType } from "@/components/ReportSelectionModal";
import { ParcelInput } from "@/types";
import { SAMPLE_SCENARIOS, formatTL, formatNumber } from "@/lib/constants";
import { calculateFeasibility } from "@/lib/calculator";
import { 
  Building, 
  FileText,
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
  Compass,
  Bell,
  Moon,
  Globe
} from "lucide-react";

export default function Home() {
  const [parcelData, setParcelData] = useState<ParcelInput>(SAMPLE_SCENARIOS[0].data);
  const [activeTab, setActiveTab] = useState<"endeks" | "degerleme" | "ihale" | "rapor">("endeks");
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [showElectronicReportModal, setShowElectronicReportModal] = useState<boolean>(false);
  const [showReportSelectionModal, setShowReportSelectionModal] = useState<boolean>(false);
  const [subTab, setSubTab] = useState<"deger" | "trend" | "rayic" | "best_use">("deger");
  const [valuationMode, setValuationMode] = useState<"otomatik" | "manuel">("otomatik");
  const [isEmsalOpen, setIsEmsalOpen] = useState<boolean>(true);
  const [isWeightedOpen, setIsWeightedOpen] = useState<boolean>(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(true);
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

          {/* Sağ Kısım: İhaleciBurada Üst Menü & Kullanıcı Rozeti */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
            
            {/* 1. Değerleme Sekmesi */}
            <button
              type="button"
              onClick={() => setActiveTab("degerleme")}
              className={`py-1.5 px-2.5 transition relative cursor-pointer font-heading font-extrabold ${
                activeTab === "degerleme"
                  ? "text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Akıllı Değerleme
            </button>

            {/* 2. Harita & Bölge Sekmesi */}
            <button
              type="button"
              onClick={() => setActiveTab("endeks")}
              className={`py-1.5 px-2.5 transition relative cursor-pointer font-heading font-extrabold ${
                activeTab === "endeks"
                  ? "text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Harita & Bölge İncele
            </button>

            <span className="hidden xl:inline-block text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
              Profesyoneller
            </span>

            <span className="hidden xl:inline-block text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
              Blog
            </span>

            {/* Hızlı İkonlar: 🔔, 🌙, 🌐 */}
            <div className="hidden sm:flex items-center gap-1 text-slate-400 pl-1 border-l border-slate-200">
              <button 
                type="button" 
                aria-label="Bildirimler"
                className="p-1.5 hover:text-slate-700 transition cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                aria-label="Karanlık Mod"
                className="p-1.5 hover:text-slate-700 transition cursor-pointer"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                aria-label="Dil Seçimi"
                className="p-1.5 hover:text-slate-700 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Kullanıcı Profili Rozeti: Ali Turan */}
            <div 
              onClick={() => setActiveTab("degerleme")}
              className="flex items-center gap-2 bg-[#0B1E3B] hover:bg-slate-900 text-amber-400 border border-amber-500/30 pl-1.5 pr-3 py-1 rounded-full shadow-xs cursor-pointer select-none transition active:scale-95"
              title="Kullanıcı: Ali Turan (İhaleciBurada Pro Hesap)"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                AT
              </div>
              <span className="text-xs font-extrabold whitespace-nowrap text-white">Ali Turan</span>
            </div>
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
      ) : activeTab === "degerleme" ? (
        /* 3. DEĞERİNİ ÖĞREN EKRANI (GÖRSELDEKİ BİREBİR ENDEKSA SİHİRBAZI) */
        <EndeksaValuationModal
          input={parcelData}
          onChange={setParcelData}
          onClose={() => setActiveTab("endeks")}
          onNavigateToMap={() => setActiveTab("endeks")}
        />
      ) : (
        /* 4. ENDEKSA İKİYE BÖLÜNMÜŞ (SPLIT-SCREEN) BÖLGEYİ İNCELE ALANI */
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
            
            {/* SOL ANALİTİK & VERİ PANELİ (Tapusor Genişliği %32) */}
            <div className="w-full lg:w-[38%] xl:w-[32%] min-w-[360px] lg:h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-5 space-y-5 border-r border-slate-200 bg-white">
              
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

              {/* TAPUSOR ESİNTİLİ 4'LÜ ÇALIŞMA SEKMESİ (Görsel 1789501075638) */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200">
                {(["deger", "trend", "rayic", "best_use"] as const).map((tab) => {
                  const titles: Record<string, string> = {
                    deger: "Değer",
                    trend: "Trend",
                    rayic: "Rayiç",
                    best_use: "Best-Use",
                  };
                  const isActive = subTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSubTab(tab)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                        isActive
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {titles[tab]}
                    </button>
                  );
                })}
              </div>

              {/* TAPUSOR ESİNTİLİ OTOMATİK DEĞERLEME & FİNANS ANALİZ KARTI */}
              <div className="bg-gradient-to-br from-slate-900 via-[#0B1E3B] to-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Finansal Analiz
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                    <button
                      type="button"
                      onClick={() => setValuationMode("otomatik")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${valuationMode === "otomatik" ? "bg-amber-500/30 text-amber-300 font-black border border-amber-400/40" : "text-slate-400"}`}
                    >
                      ● Otomatik
                    </button>
                    <button
                      type="button"
                      onClick={() => setValuationMode("manuel")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${valuationMode === "manuel" ? "bg-amber-500/30 text-amber-300 font-black border border-amber-400/40" : "text-slate-400"}`}
                    >
                      ○ Manuel
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight font-mono">
                      {(isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)).toLocaleString("tr-TR")} ₺ <span className="text-xs font-semibold text-slate-400">/ m²</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {parcelData.neighborhood || "Merkez"} Bölgesel Emsal m² Fiyatı
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-tight">
                      İİK m.115 %50 Tabanı
                    </div>
                    <div className="text-xs font-black text-emerald-400 font-mono">
                      {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) * (parcelData.areaM2 || 110) : (parcelData.estimatedLandM2PriceTL || 18500) * (parcelData.areaM2 || 850)) * 0.5).toLocaleString("tr-TR")} ₺
                    </div>
                  </div>
                </div>

                {/* Görsel 1789501075638: Hızlı Satış - Ortalama - Tok Satış Skalası */}
                <div className="pt-2 pb-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300 mb-1.5 font-mono">
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Hızlı Satış: {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * 0.90).toLocaleString("tr-TR")} ₺
                    </span>
                    <span className="text-white font-black text-[11px]">
                      m² Ortalama
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      Tok Satış: {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * 1.10).toLocaleString("tr-TR")} ₺
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-rose-500 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-950 shadow-md"></div>
                  </div>
                </div>

                {/* Tapusor Stili Sarı/Kehribar "Hemen Rapor Al" Butonu */}
                <button
                  type="button"
                  onClick={() => setShowReportSelectionModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Hemen Ekspertiz Raporu Al (13 Sayfa PDF)</span>
                </button>
              </div>

              {/* GÖRSEL 1789501075638: EMSALLER AKORDİYONU */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsEmsalOpen(!isEmsalOpen)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-heading">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Çevredeki Emsal Parseller (Bal Peteği Verisi)
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isEmsalOpen ? "rotate-180" : ""}`} />
                </button>

                {isEmsalOpen && (
                  <div className="p-3 space-y-2.5 text-xs divide-y divide-slate-100">
                    <div className="flex items-center justify-between pb-1.5 text-[11px]">
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{parcelData.neighborhood || "Arslanca"} 3+1 Cadde Cepheli</div>
                        <div className="text-[10px] text-slate-500">Kuzeydoğu • 240m • 135 m²</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-emerald-700">₺ 6.480.000</div>
                        <div className="text-[9.5px] text-slate-400 font-mono">48.000 ₺/m²</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 text-[11px]">
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{parcelData.neighborhood || "Arslanca"} Sıfır Lüks Konut</div>
                        <div className="text-[10px] text-slate-500">Doğu • 380m • 100 m²</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-emerald-700">₺ 5.200.000</div>
                        <div className="text-[9.5px] text-slate-400 font-mono">52.000 ₺/m²</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 text-[11px]">
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{parcelData.neighborhood || "Arslanca"} Geniş Aile Dairesi</div>
                        <div className="text-[10px] text-slate-500">Güneydoğu • 520m • 145 m²</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-emerald-700">₺ 6.525.000</div>
                        <div className="text-[9.5px] text-slate-400 font-mono">45.000 ₺/m²</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GÖRSEL 1789501075638: AĞIRLIKLI ORTALAMALAR */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsWeightedOpen(!isWeightedOpen)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-heading">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    Ağırlıklı Ortalamalar
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isWeightedOpen ? "rotate-180" : ""}`} />
                </button>

                {isWeightedOpen && (
                  <div className="p-3 grid grid-cols-2 gap-3 text-xs bg-slate-50/50">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Mesafe Ağırlıklı</div>
                      <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                        {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * 0.984).toLocaleString("tr-TR")} ₺ <span className="text-[10px] text-slate-400 font-normal">/ m²</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-semibold">Zaman Ağırlıklı</div>
                      <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                        {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * 1.014).toLocaleString("tr-TR")} ₺ <span className="text-[10px] text-slate-400 font-normal">/ m²</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GÖRSEL 1789501075638: ANALİZ ÖZETİ & İİK M.115 TABANI */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-heading">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Analiz Özeti & İcra Tabanı
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isSummaryOpen ? "rotate-180" : ""}`} />
                </button>

                {isSummaryOpen && (
                  <div className="p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Konum & Parsel:</span>
                      <span className="font-bold text-slate-900">{parcelData.district} / {parcelData.neighborhood || "Merkez"} • {parcelData.ada || "48507"}/{parcelData.parsel || "1"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Piyasa Değeri ({parcelData.areaM2 || 110} m²):</span>
                      <span className="font-bold text-slate-900 font-mono">₺ {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 110)).toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-emerald-700 font-semibold">İİK m.115 %50 Tabanı:</span>
                      <span className="font-black text-emerald-700 font-mono">₺ {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 110) * 0.5).toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-amber-700 font-black">
                      <span>Potansiyel Arbitraj Kârı:</span>
                      <span className="font-mono text-sm">₺ {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 110) * 0.5).toLocaleString("tr-TR")}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ÇALIŞMA SEKMELERİ: [PİYASA ANALİZİ] | [İHALE & PEY SİMÜLATÖRÜ] */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
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
                      onClick={() => setShowElectronicReportModal(true)}
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

              {/* SEKME 3: İHALE VE FİZİBİLİTE ÖNİZLEMESİ */}
              {activeTab === "ihale" && (
                <div className="space-y-4">
                  <FeasibilityPreview
                    input={parcelData}
                    calc={calculation}
                    onViewReport={() => setShowElectronicReportModal(true)}
                  />
                </div>
              )}
            </div>

            {/* SAĞ HARİTA PANELİ (Geniş Tapusor & GIS Uydu Haritası %68) */}
            <div className="w-full lg:w-[62%] xl:w-[68%] lg:h-[calc(100vh-64px)] relative bg-slate-100 flex flex-col">
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

      {/* Tapusor Stili 5 Adımlı Emlak Muayenesi & Rapor Seçim Modalı */}
      <ReportSelectionModal
        isOpen={showReportSelectionModal}
        onClose={() => setShowReportSelectionModal(false)}
        onOpenReportPreview={() => {
          setShowReportSelectionModal(false);
          setShowElectronicReportModal(true);
        }}
        city={parcelData.city}
        district={parcelData.district}
        neighborhood={parcelData.neighborhood || "Merkez"}
        ada={parcelData.ada || "48507"}
        parsel={parcelData.parsel || "1"}
        areaM2={parcelData.areaM2 || 110}
        category={parcelData.category === "konut" ? "konut" : "arsa"}
        nitelik={parcelData.category === "konut" ? "Betonarme Mesken ve Müştemilatı" : "Bağ & Tarla Vasfında İmar Parseli"}
      />

      {/* 13 Sayfalık Resmi Elektronik Ekspertiz Raporu Modalı */}
      <ElectronicReportModal
        isOpen={showElectronicReportModal}
        onClose={() => setShowElectronicReportModal(false)}
        propertyTitle={`${parcelData.city} / ${parcelData.district} / ${parcelData.neighborhood || "Merkez"}`}
        category={parcelData.category === "konut" ? "konut" : "arsa"}
        locationText={`${parcelData.neighborhood || "Merkez"}, ${parcelData.district}, ${parcelData.city}`}
        parcelText={`${parcelData.city}, ${parcelData.district}, ${parcelData.neighborhood || "Merkez"}, ${parcelData.ada || "48507"} Ada, ${parcelData.parsel || "1"} Parsel`}
        marketValueTL={calculation.fairMarketValueTL || 7900000}
        areaM2={parcelData.areaM2 || 110}
      />
    </div>
  );
}
