"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ValuationWizard } from "@/components/ValuationWizard";
import { FeasibilityPreview } from "@/components/FeasibilityPreview";
import { ReportView } from "@/components/ReportView";
import { WhatsAppShareModal } from "@/components/WhatsAppShareModal";
import { EndeksaSidebar } from "@/components/EndeksaSidebar";
import { PriceTrendChart } from "@/components/PriceTrendChart";
import { InvestmentScoreCard } from "@/components/InvestmentScoreCard";
import dynamic from "next/dynamic";
const ParcelMap = dynamic(
  () => import("@/components/ParcelMap").then((mod) => mod.ParcelMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[540px] flex flex-col items-center justify-center bg-slate-900 text-white rounded-2xl">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-xs font-bold text-slate-300">Tapu & Değerleme Haritası Yükleniyor...</div>
      </div>
    ),
  }
);
const EndeksaValuationModal = dynamic(
  () => import("@/components/EndeksaValuationModal").then((mod) => mod.EndeksaValuationModal),
  { ssr: false }
);
import { ElectronicReportModal } from "@/components/ElectronicReportModal";
import { ReportSelectionModal, ReportPackageType } from "@/components/ReportSelectionModal";
import type { StartValuationPayload } from "@/components/valuation/StartValuationModal";
const StartValuationModal = dynamic(
  () => import("@/components/valuation/StartValuationModal").then((mod) => mod.StartValuationModal),
  { ssr: false }
);
import { ParcelInput, PropertyCategory, ComparableListing } from "@/types";
import { SAMPLE_SCENARIOS, formatTL, formatNumber } from "@/lib/constants";
import { calculateFeasibility } from "@/lib/calculator";
import { parseSearchLocation, getCadastreForCoordinates, getDistrictCoordinates } from "@/lib/turkeyLocations";
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
  Globe,
  PlusCircle,
  Radio,
  Tag,
  Check,
  Filter,
  Crosshair,
  ExternalLink
} from "lucide-react";

export default function Home() {
  const [parcelData, setParcelData] = useState<ParcelInput>(SAMPLE_SCENARIOS[0].data);
  const [activeTab, setActiveTab] = useState<"endeks" | "degerleme" | "ihale" | "rapor">("endeks");
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [showElectronicReportModal, setShowElectronicReportModal] = useState<boolean>(false);
  const [showReportSelectionModal, setShowReportSelectionModal] = useState<boolean>(false);
  const [showStartValuationModal, setShowStartValuationModal] = useState<boolean>(false);
  const [startValuationInitialMode, setStartValuationInitialMode] = useState<"expertiz" | "emlak_bul" | "ilan_ver">("expertiz");
  const [subTab, setSubTab] = useState<"deger" | "trend" | "rayic" | "best_use">("deger");
  const [valuationMode, setValuationMode] = useState<"otomatik" | "manuel">("otomatik");
  const [searchRadius, setSearchRadius] = useState<number>(1000);
  const [focusedCompId, setFocusedCompId] = useState<string | null>(null);
  const [listingFilter, setListingFilter] = useState<"all" | "satilik" | "kiralik">("all");
  const [isEmsalOpen, setIsEmsalOpen] = useState<boolean>(true);
  const [isWeightedOpen, setIsWeightedOpen] = useState<boolean>(true);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(
    `${SAMPLE_SCENARIOS[0].data.city}, ${SAMPLE_SCENARIOS[0].data.district}${SAMPLE_SCENARIOS[0].data.neighborhood ? `, ${SAMPLE_SCENARIOS[0].data.neighborhood}` : ""}`
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAutoLocating, setIsAutoLocating] = useState<boolean>(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [tkgmGlobalToast, setTkgmGlobalToast] = useState<string | null>(null);

  // 📍 GPS İle Otomatik İl, İlçe, Köy Bilgisi Doldurma ve Emsal Yükleme
  const handleAutoLocateGPS = useCallback((silent: boolean = false) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      if (!silent) alert("Tarayıcınız GPS konum servisini desteklemiyor.");
      return;
    }

    setIsAutoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uLat = Number(pos.coords.latitude.toFixed(6));
        const uLng = Number(pos.coords.longitude.toFixed(6));

        try {
          const res = await fetch(`/api/location/search?lat=${uLat}&lng=${uLng}`);
          const data = await res.json();
          if (data.success && data.location) {
            const loc = data.location;
            const detCity = loc.province || "Çanakkale";
            const detDist = loc.district || "Merkez";
            const detNeigh = loc.neighborhood || "";

            setSearchQuery(`${detNeigh ? detNeigh + ", " : ""}${detDist}, ${detCity}`);
            setLocationToast(`📍 Bulunduğunuz konuma göre açıldı: ${detNeigh ? detNeigh + ", " : ""}${detDist} / ${detCity}`);
            setTimeout(() => setLocationToast(null), 5000);

            // Bölgesel emsal sorgusunu tetikle
            const emsalRes = await fetch(`/api/emsal?il=${encodeURIComponent(detCity)}&ilce=${encodeURIComponent(detDist)}&mahalle=${encodeURIComponent(detNeigh)}&kategori=${parcelData.category}&lat=${uLat}&lng=${uLng}`);
            const emsalData = await emsalRes.json();
            const autoCad = getCadastreForCoordinates(uLat, uLng);

            setParcelData((prev) => ({
              ...prev,
              city: detCity,
              district: detDist,
              neighborhood: detNeigh,
              ada: autoCad.ada,
              parsel: autoCad.parsel,
              coordinates: { lat: uLat, lng: uLng },
              estimatedLandM2PriceTL: emsalData?.data?.landM2PriceTL || prev.estimatedLandM2PriceTL,
              estimatedUnitSaleM2PriceTL: emsalData?.data?.unitSaleM2PriceTL || prev.estimatedUnitSaleM2PriceTL,
              comparables: emsalData?.data?.comparables || prev.comparables,
              contractorSharePercent: emsalData?.data?.contractorSharePercent ?? prev.contractorSharePercent,
              monthlyRentEstimateTL: prev.category === "konut" ? (emsalData?.data?.estimatedMonthlyRentTL ?? prev.monthlyRentEstimateTL) : prev.monthlyRentEstimateTL,
              marketResearch: emsalData?.data || prev.marketResearch,
              tcmbOfficialData: emsalData?.data?.tcmbOfficialData || prev.tcmbOfficialData,
              buildingCostEstimate: emsalData?.data?.buildingCostEstimate || prev.buildingCostEstimate,
            }));
          }
        } catch (err) {
          console.warn("GPS konum servisi hatası:", err);
        } finally {
          setIsAutoLocating(false);
        }
      },
      (err) => {
        setIsAutoLocating(false);
        if (!silent) {
          alert("GPS konumuna erişilemedi veya izin verilmedi.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [parcelData.category]);

  // Sayfa açıldığında doğrudan kullanıcının bulunduğu konuma göre başlat
  useEffect(() => {
    handleAutoLocateGPS(true);
  }, [handleAutoLocateGPS]);

  // 🏛️ Resmi TKGM Parsel Sorgu Entegrasyonu
  const handleOpenTkgmGlobal = () => {
    const textToCopy = `${parcelData.city} / ${parcelData.district} / ${parcelData.neighborhood || "Merkez"} - Ada: ${parcelData.ada || "1"} Parsel: ${parcelData.parsel || "1"}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setTkgmGlobalToast(`Ada ${parcelData.ada || "1"} / Parsel ${parcelData.parsel || "1"} bilgisi panoya kopyalandı! TKGM resmi ekranı açılıyor...`);
    setTimeout(() => setTkgmGlobalToast(null), 4000);

    const lat = parcelData.coordinates?.lat || 40.1553;
    const lng = parcelData.coordinates?.lng || 26.4142;
    window.open(`https://parselsorgu.tkgm.gov.tr/#ara/cografi/${lat}/${lng}`, "_blank", "noopener,noreferrer");
  };

  // Yeni Değerleme Başlat Formu Gönderildiğinde (Hasan Bey Modeli: Expertiz, Emlak Bul veya İlan Ver)
  const handleStartValuationSubmit = async (payload: StartValuationPayload) => {
    setShowStartValuationModal(false);
    const isRes = payload.category === "konut";
    const newCoords = payload.coordinates;
    const cat: PropertyCategory = isRes ? "konut" : "arsa";

    if (payload.searchRadiusMeters) {
      setSearchRadius(payload.searchRadiusMeters);
    }

    setParcelData((prev) => ({
      ...prev,
      category: cat,
      city: payload.city,
      district: payload.district,
      neighborhood: payload.neighborhood,
      ada: payload.ada,
      parsel: payload.parsel,
      areaM2: payload.areaM2,
      coordinates: newCoords || prev.coordinates,
    }));
    setSearchQuery(`${payload.neighborhood}, ${payload.district}, ${payload.city}`);

    if (payload.mode === "emlak_bul" || payload.mapAction === "ilanlari_bul") {
      setActiveTab("endeks");
      setSubTab("rayic");
    } else if (payload.mode === "ilan_ver") {
      setActiveTab("endeks");
      setSubTab("rayic");
    } else {
      setActiveTab("degerleme");
    }

    // İlan ver moduysa anlık olarak yerel listeye ve harita emsal havuzuna ekle
    if (payload.mode === "ilan_ver" && payload.listingPriceTL) {
      const newCustomListing: ComparableListing = {
        id: `user-listing-${Date.now()}`,
        title: payload.listingTitle || `${payload.neighborhood || payload.district} İhaleciBurada Portföy İlanı`,
        category: cat,
        type: (payload.mainCategory === "kiralik" ? "kiralik" : "satilik") as "satilik" | "kiralik",
        areaM2: payload.areaM2,
        pricePerM2TL: Math.round(payload.listingPriceTL / (payload.areaM2 || 1)),
        priceTL: payload.listingPriceTL,
        distanceMeters: 50,
        coordinates: newCoords || parcelData.coordinates || { lat: 40.0985, lng: 26.3980 },
        source: "Bölge Emsali",
        roomCount: isRes ? "3+1" : undefined,
        zoningType: isRes ? undefined : payload.tapuNiteligi,
        date: "Bugün",
      };
      setParcelData((prev) => ({
        ...prev,
        comparables: [newCustomListing, ...(prev.comparables || [])],
      }));
      setFocusedCompId(newCustomListing.id);
    }

    // Arka planda girilen il, ilçe ve köy/mahalle için anlık emsal ve piyasa verisini güncelle
    try {
      const url = `/api/emsal?il=${encodeURIComponent(payload.city)}&ilce=${encodeURIComponent(payload.district)}&mahalle=${encodeURIComponent(payload.neighborhood)}&kategori=${cat}${newCoords ? `&lat=${newCoords.lat}&lng=${newCoords.lng}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        const resData = data.data;
        setParcelData((prev) => ({
          ...prev,
          estimatedLandM2PriceTL: resData.landM2PriceTL,
          estimatedUnitSaleM2PriceTL: resData.unitSaleM2PriceTL,
          contractorSharePercent: resData.contractorSharePercent,
          monthlyRentEstimateTL: isRes ? resData.estimatedMonthlyRentTL : prev.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: prev.comparables && prev.comparables.length > 0 && prev.comparables[0].id.startsWith("user-listing-") 
            ? [prev.comparables[0], ...(resData.comparables || [])] 
            : resData.comparables,
          tcmbOfficialData: resData.tcmbOfficialData,
          buildingCostEstimate: resData.buildingCostEstimate,
        }));
      }
    } catch (e) {
      console.warn("Emsal verisi arka planda alınırken hata:", e);
    }
  };

  // Türkiye Geneli Canlı Konum Autocomplete Arama Durumu
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const isUserTypingRef = useRef<boolean>(false);

  // Dışarı tıklandığında arama önerilerini kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSuggestions([]);
        isUserTypingRef.current = false;
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Canlı Konum Arama (Debounce ile 81 İl, 973 İlçe, Köy ve Mahalleler - Yalnızca kullanıcı klavyeden yazıyorsa çalışır)
  useEffect(() => {
    if (!isUserTypingRef.current || !searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (isUserTypingRef.current && data.success && data.results) {
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

  const handleCategorySwitch = (cat: PropertyCategory) => {
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
        category: cat,
        title: cat === "arazi" ? "Tarla & Arazi Portföyü" : cat === "ticari" ? "Ticari Mülk Portföyü" : "İmarlı Arsa Portföyü",
        areaM2: cat === "arazi" ? 2500 : cat === "ticari" ? 200 : 1000,
        zoningType: cat === "ticari" ? "ticari" : "konut",
        kaks: 1.5,
        taks: 0.35,
        maxFloors: 5,
        askedPriceTL: 9500000,
      });
    }
  };

  // Konum Autocomplete Seçildiğinde Çalışır
  const handleSelectLocation = async (item: any) => {
    isUserTypingRef.current = false;
    setShowSuggestions(false);
    setSuggestions([]);
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
        const finalCoords = newCoords || resData.coordinates || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
        const finalCad = getCadastreForCoordinates(finalCoords.lat, finalCoords.lng);
        setParcelData({
          ...parcelData,
          city: newCity,
          district: newDistrict,
          neighborhood: newNeighborhood,
          ada: finalCad.ada,
          parsel: finalCad.parsel,
          coordinates: finalCoords,
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
        const finalCoords = newCoords || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
        const finalCad = getCadastreForCoordinates(finalCoords.lat, finalCoords.lng);
        setParcelData({
          ...parcelData,
          city: newCity,
          district: newDistrict,
          neighborhood: newNeighborhood,
          ada: finalCad.ada,
          parsel: finalCad.parsel,
          coordinates: finalCoords,
        });
      }
    } catch (err) {
      const finalCoords = newCoords || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
      const finalCad = getCadastreForCoordinates(finalCoords.lat, finalCoords.lng);
      setParcelData({
        ...parcelData,
        city: newCity,
        district: newDistrict,
        neighborhood: newNeighborhood,
        ada: finalCad.ada,
        parsel: finalCad.parsel,
        coordinates: finalCoords,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // İlçe Tablosundan (Görsel 4 & 6) İlçe Seçildiğinde Çalışır
  const handleSelectDistrict = async (districtName: string, cityName?: string) => {
    const targetCity = cityName || parcelData.city || "Ankara";
    setSearchQuery(`${targetCity}, ${districtName}`);
    setIsSearching(true);

    try {
      const url = `/api/emsal?il=${encodeURIComponent(targetCity)}&ilce=${encodeURIComponent(districtName)}&kategori=${parcelData.category}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        const resData = data.data;
        const targetCoords = resData.coordinates || getDistrictCoordinates(targetCity, districtName) || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
        const dCad = getCadastreForCoordinates(targetCoords.lat, targetCoords.lng);
        setParcelData((prev) => ({
          ...prev,
          city: targetCity,
          district: districtName,
          neighborhood: "",
          ada: dCad.ada,
          parsel: dCad.parsel,
          coordinates: targetCoords,
          estimatedLandM2PriceTL: resData.landM2PriceTL,
          estimatedUnitSaleM2PriceTL: resData.unitSaleM2PriceTL,
          contractorSharePercent: resData.contractorSharePercent,
          monthlyRentEstimateTL: isResidential ? resData.estimatedMonthlyRentTL : prev.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: resData.comparables,
          tcmbOfficialData: resData.tcmbOfficialData,
          buildingCostEstimate: resData.buildingCostEstimate,
        }));
      } else {
        const targetCoords = getDistrictCoordinates(targetCity, districtName) || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
        const dCad = getCadastreForCoordinates(targetCoords.lat, targetCoords.lng);
        setParcelData((prev) => ({
          ...prev,
          city: targetCity,
          district: districtName,
          neighborhood: "",
          ada: dCad.ada,
          parsel: dCad.parsel,
          coordinates: targetCoords,
        }));
      }
    } catch (err) {
      const targetCoords = getDistrictCoordinates(targetCity, districtName) || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
      const dCad = getCadastreForCoordinates(targetCoords.lat, targetCoords.lng);
      setParcelData((prev) => ({
        ...prev,
        city: targetCity,
        district: districtName,
        neighborhood: "",
        ada: dCad.ada,
        parsel: dCad.parsel,
        coordinates: targetCoords,
      }));
    } finally {
      setIsSearching(false);
    }
  };

  // Haritadan Herhangi Bir Noktaya Tıklandığında Tüm Uygulamayı Senkronize Et
  const handleMapLocationSelect = async (loc: {
    city: string;
    district: string;
    neighborhood: string;
    coordinates: { lat: number; lng: number };
    unitPrice?: number;
    ada?: string;
    parsel?: string;
    comparables?: any[];
  }) => {
    // 1. Üst arama çubuğunu haritada tıklanan noktayla anında güncelle
    setSearchQuery(`${loc.city}, ${loc.district}${loc.neighborhood ? `, ${loc.neighborhood}` : ""}`);

    // 2. Sol analitik paneli ve taşınmaz verilerini anında güncelle (0ms gecikme)
    setParcelData((prev) => {
      const isRes = prev.category === "konut";
      const newUnitM2 = loc.unitPrice || prev.estimatedUnitSaleM2PriceTL || 54090;
      const newLandM2 = isRes ? (prev.estimatedLandM2PriceTL || 15000) : newUnitM2;
      return {
        ...prev,
        city: loc.city,
        district: loc.district,
        neighborhood: loc.neighborhood,
        ada: loc.ada || prev.ada,
        parsel: loc.parsel || prev.parsel,
        coordinates: loc.coordinates, // Tıklanan koordinat kesin olarak sabitlenir!
        estimatedUnitSaleM2PriceTL: isRes ? newUnitM2 : prev.estimatedUnitSaleM2PriceTL,
        estimatedLandM2PriceTL: newLandM2,
        comparables: loc.comparables && loc.comparables.length > 0 ? loc.comparables : prev.comparables,
      };
    });

    // 3. Arka planda bölgesel piyasa verilerini ve TCMB endeksini güncelle (koordinatlar ASLA ezilmez!)
    try {
      const url = `/api/emsal?il=${encodeURIComponent(loc.city)}&ilce=${encodeURIComponent(loc.district)}&mahalle=${encodeURIComponent(loc.neighborhood)}&kategori=${parcelData.category}&lat=${loc.coordinates.lat}&lng=${loc.coordinates.lng}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        const resData = data.data;
        setParcelData((prev) => ({
          ...prev,
          city: loc.city,
          district: loc.district,
          neighborhood: loc.neighborhood,
          coordinates: loc.coordinates, // Tıklanan koordinatı kesinlikle koru!
          contractorSharePercent: resData.contractorSharePercent ?? prev.contractorSharePercent,
          monthlyRentEstimateTL: parcelData.category === "konut" ? (resData.estimatedMonthlyRentTL ?? prev.monthlyRentEstimateTL) : prev.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: resData.comparables ?? prev.comparables,
          tcmbOfficialData: resData.tcmbOfficialData ?? prev.tcmbOfficialData,
          buildingCostEstimate: resData.buildingCostEstimate ?? prev.buildingCostEstimate,
        }));
      }
    } catch (err) {
      console.warn("Bölgesel emsal sorgu hatası:", err);
    }
  };

  // Form submit olduğunda arama
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    isUserTypingRef.current = false;
    setShowSuggestions(false);
    setSuggestions([]);

    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0]);
      return;
    }

    setIsSearching(true);
    const parsed = parseSearchLocation(searchQuery);
    const newCity = parsed.city;
    const newDistrict = parsed.district;
    const newNeighborhood = parsed.neighborhood || "";
    const newCoords = { lat: parsed.lat, lng: parsed.lng };
    const sCad = getCadastreForCoordinates(newCoords.lat, newCoords.lng);

    try {
      const url = `/api/emsal?il=${encodeURIComponent(newCity)}&ilce=${encodeURIComponent(newDistrict)}&mahalle=${encodeURIComponent(newNeighborhood)}&kategori=${parcelData.category}&lat=${newCoords.lat}&lng=${newCoords.lng}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        const resData = data.data;
        setParcelData((prev) => ({
          ...prev,
          city: newCity,
          district: newDistrict,
          neighborhood: newNeighborhood || resData.neighborhood || "",
          ada: sCad.ada,
          parsel: sCad.parsel,
          coordinates: newCoords,
          estimatedLandM2PriceTL: resData.landM2PriceTL,
          estimatedUnitSaleM2PriceTL: resData.unitSaleM2PriceTL,
          contractorSharePercent: resData.contractorSharePercent,
          monthlyRentEstimateTL: isResidential ? resData.estimatedMonthlyRentTL : prev.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: resData.comparables,
          tcmbOfficialData: resData.tcmbOfficialData,
          buildingCostEstimate: resData.buildingCostEstimate,
        }));
      } else {
        setParcelData((prev) => ({
          ...prev,
          city: newCity,
          district: newDistrict,
          neighborhood: newNeighborhood,
          ada: sCad.ada,
          parsel: sCad.parsel,
          coordinates: newCoords,
        }));
      }
    } catch (err) {
      setParcelData((prev) => ({
        ...prev,
        city: newCity,
        district: newDistrict,
        neighborhood: newNeighborhood,
        ada: sCad.ada,
        parsel: sCad.parsel,
        coordinates: newCoords,
      }));
    } finally {
      setIsSearching(false);
    }
  };

  // Emlak Bul & Bölgesel İlanlar Filtrelenmiş Listesi
  const displayedListings = useMemo(() => {
    let list = parcelData.comparables || [];
    if (listingFilter !== "all") {
      list = list.filter((c) => c.type === listingFilter);
    }
    return list;
  }, [parcelData.comparables, listingFilter]);

  const satilikCount = useMemo(() => {
    return (parcelData.comparables || []).filter((c) => c.type === "satilik").length;
  }, [parcelData.comparables]);

  const kiralikCount = useMemo(() => {
    return (parcelData.comparables || []).filter((c) => c.type === "kiralik").length;
  }, [parcelData.comparables]);

  const avgListingM2Price = useMemo(() => {
    if (!parcelData.comparables || parcelData.comparables.length === 0) {
      return isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500);
    }
    const sum = parcelData.comparables.reduce((acc, c) => acc + (c.pricePerM2TL || 0), 0);
    return Math.round(sum / parcelData.comparables.length);
  }, [parcelData.comparables, isResidential, parcelData.estimatedUnitSaleM2PriceTL, parcelData.estimatedLandM2PriceTL]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. ENDEKSA TARZI ÜST ARAMA & GEZİNİM ÇUBUĞU */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[1000] shadow-2xs">
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
          <div className="relative flex-1 max-w-xl mx-2 z-[1100]" ref={searchContainerRef}>
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
                  isUserTypingRef.current = true;
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (isUserTypingRef.current && suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="81 İl, İlçe veya Köy Arayın (Örn: Çanakkale, Kepez, Adatepe)"
                className="flex-1 bg-transparent px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 min-w-0"
              />

              {/* GPS Otomatik Konum Bul Butonu */}
              <button 
                type="button"
                onClick={() => handleAutoLocateGPS(false)}
                disabled={isAutoLocating}
                aria-label="Bulunduğum Konumu GPS ile Al"
                title="Mevcut GPS Konumumu Bul ve İl/İlçe/Köy Otomatik Doldur"
                className="p-1.5 text-slate-400 hover:text-amber-600 transition shrink-0 cursor-pointer"
              >
                <Crosshair className={`w-4 h-4 ${isAutoLocating ? "animate-spin text-amber-600" : "text-amber-500 hover:text-amber-600"}`} />
              </button>

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

              {/* Hasan Bey Üçlü Eylem Butonları: Geniş ekranda tam butonlar, orta ekranda kompakt ikonlar */}
              <div className="hidden xl:flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setStartValuationInitialMode("expertiz");
                    setShowStartValuationModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ekspertiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStartValuationInitialMode("emlak_bul");
                    setShowStartValuationModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Emlak Bul</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStartValuationInitialMode("ilan_ver");
                    setShowStartValuationModal(true);
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>İlan Ver</span>
                </button>
              </div>

              {/* Orta Ekran (md:flex xl:hidden) Kompakt İkon Grubu - Menü çakışmasını önler */}
              <div className="hidden md:flex xl:hidden items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setStartValuationInitialMode("expertiz");
                    setShowStartValuationModal(true);
                  }}
                  className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Ekspertiz Başlat"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartValuationInitialMode("emlak_bul");
                    setShowStartValuationModal(true);
                  }}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xs transition active:scale-95 cursor-pointer"
                  title="Emlak Bul"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartValuationInitialMode("ilan_ver");
                    setShowStartValuationModal(true);
                  }}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xs transition active:scale-95 cursor-pointer"
                  title="İlan Ver"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* TÜRKİYE 81 İL, 973 İLÇE VE KÖY CANLI ÖNERİ AÇILIR PENCERESİ */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[1200] animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto divide-y divide-slate-100">
                <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Türkiye Mülki İdare & Harita Sonuçları</span>
                  <span>{suggestions.length} Konum</span>
                </div>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectLocation(item);
                    }}
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
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-bold shrink-0">
            
            {/* 1. Değerleme Sekmesi */}
            <button
              type="button"
              onClick={() => setActiveTab("degerleme")}
              className={`py-1.5 px-2 transition relative cursor-pointer font-heading font-extrabold whitespace-nowrap shrink-0 ${
                activeTab === "degerleme"
                  ? "text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="hidden sm:inline">Akıllı </span>Değerleme
            </button>

            {/* 2. Harita & Bölge Sekmesi */}
            <button
              type="button"
              onClick={() => setActiveTab("endeks")}
              className={`py-1.5 px-2 transition relative cursor-pointer font-heading font-extrabold whitespace-nowrap shrink-0 ${
                activeTab === "endeks"
                  ? "text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Harita <span className="hidden sm:inline">& Bölge</span>
            </button>

            {/* 3. Ekspertiz Raporu Sekmesi (Lansmana Özel Ücretsiz) */}
            <button
              type="button"
              onClick={() => setShowElectronicReportModal(true)}
              className="py-1 px-2.5 transition relative cursor-pointer font-heading font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-full border border-emerald-300 shadow-2xs active:scale-95"
              title="13 Sayfalık Resmi Detaylı Elektronik Ekspertiz Raporunu Aç ve PDF İndir"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspertiz Raporu</span>
              <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded-full bg-emerald-600 text-white tracking-wide">
                Ücretsiz
              </span>
            </button>

            {/* 4. Resmi TKGM Parsel Sorgu Butonu */}
            <button
              type="button"
              onClick={handleOpenTkgmGlobal}
              className="hidden md:flex items-center gap-1 bg-[#0B1E3B] hover:bg-slate-900 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-black transition cursor-pointer active:scale-95 shrink-0 shadow-2xs"
              title="Resmi TKGM Parsel Sorgu uygulamasını aç ve ada/parseli sorgula"
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>TKGM</span>
            </button>

            <span className="hidden 2xl:inline-block text-slate-600 hover:text-slate-900 cursor-pointer font-medium whitespace-nowrap">
              Profesyoneller
            </span>

            <span className="hidden 2xl:inline-block text-slate-600 hover:text-slate-900 cursor-pointer font-medium whitespace-nowrap">
              Blog
            </span>

            {/* Hızlı İkonlar: 🔔, 🌙, 🌐 */}
            <div className="hidden xl:flex items-center gap-1 text-slate-400 pl-1 border-l border-slate-200 shrink-0">
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
              className="flex items-center gap-2 bg-[#0B1E3B] hover:bg-slate-900 text-amber-400 border border-amber-500/30 pl-1.5 pr-3 py-1 rounded-full shadow-xs cursor-pointer select-none transition active:scale-95 shrink-0"
              title="Kullanıcı: Ali Turan (İhaleciBurada Pro Hesap)"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                AT
              </div>
              <span className="text-xs font-extrabold whitespace-nowrap text-white hidden sm:inline">Ali Turan</span>
            </div>
          </div>
        </div>

        {/* Canlı Konum & TKGM Bildirim Bannerı */}
        {(locationToast || tkgmGlobalToast) && (
          <div className="bg-[#0B1E3B] text-amber-400 border-t border-amber-500/30 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{locationToast || tkgmGlobalToast}</span>
          </div>
        )}
      </header>

      {/* 2. RAPOR GÖRÜNÜMÜ MODU (Seçildiğinde Tam Ekran A4 Formatı) */}
      {activeTab === "rapor" ? (
        <main className="flex-1 py-6 px-4 sm:px-6">
          <ReportView
            input={parcelData}
            calc={calculation}
            onBack={() => setActiveTab("endeks")}
            onOpenShareModal={() => setShareModalOpen(true)}
            onOpenDetailedReport={() => setShowElectronicReportModal(true)}
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
            <div className="w-full lg:w-[38%] xl:w-[32%] min-w-[360px] lg:h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-5 space-y-5 border-r border-slate-200 bg-white relative z-10">
              
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
                    rayic: "Rayiç & İlanlar",
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

              {/* SEKME: RAYİÇ & İLANLAR (HASAN HÜSEYİN YILDIRIM: BU ALAN İÇİNDEKİ İLANLARI BUL VE LİSTELE) */}
              {subTab === "rayic" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* 1. RADAR BAŞLIĞI & YARIÇAP KONTROL KARTI */}
                  <div className="bg-[#0B1E3B] text-white p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white font-heading uppercase tracking-wide">
                            Bölgesel İlanlar & Emsal Radarı
                          </div>
                          <div className="text-[10px] text-slate-300 font-mono">
                            {parcelData.neighborhood || "Merkez"}, {parcelData.district}, {parcelData.city}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 font-mono">
                        {searchRadius >= 1000 ? `${searchRadius / 1000} km` : `${searchRadius} m`} Çapında
                      </span>
                    </div>

                    {/* YARIÇAP BUTONLARI (500m - 5km) */}
                    <div className="pt-2.5 border-t border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Arama Radar Çapı (Mesafe):</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {searchRadius >= 1000 ? `${searchRadius / 1000} km` : `${searchRadius} m`}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { val: 500, label: "500 m" },
                          { val: 1000, label: "1 km" },
                          { val: 3000, label: "3 km" },
                          { val: 5000, label: "5 km" },
                        ].map((r) => (
                          <button
                            key={r.val}
                            type="button"
                            onClick={() => setSearchRadius(r.val)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-black border transition cursor-pointer text-center ${
                              searchRadius === r.val
                                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. PİYASA İSTATİSTİK ŞERİDİ */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center font-mono">
                    <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Taranan İlan</div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                        {displayedListings.length} Adet
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Ort. m² Birim</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-700 mt-0.5">
                        {avgListingM2Price.toLocaleString("tr-TR")} ₺
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">Kategori</div>
                      <div className="text-xs sm:text-sm font-black text-amber-700 mt-0.5 truncate">
                        {isResidential ? "Konut" : "Arsa"}
                      </div>
                    </div>
                  </div>

                  {/* 3. FİLTRELEME HAPLARI: TÜMÜ / SATILIK / KİRALIK */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold border border-slate-200">
                    {[
                      { id: "all", label: `Tümü (${parcelData.comparables?.length || 0})` },
                      { id: "satilik", label: `Satılık (${satilikCount})` },
                      { id: "kiralik", label: `Kiralık (${kiralikCount})` },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setListingFilter(f.id as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                          listingFilter === f.id
                            ? "bg-white text-slate-900 shadow-xs font-black"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* 4. İLAN KARTLARI LİSTESİ */}
                  <div className="space-y-3">
                    {displayedListings.length > 0 ? (
                      displayedListings.map((comp) => {
                        const isSatilik = comp.type === "satilik";
                        const isFocused = focusedCompId === comp.id;
                        return (
                          <div
                            key={comp.id}
                            className={`p-3.5 rounded-xl border transition bg-white shadow-2xs relative ${
                              isFocused
                                ? "border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {/* Üst Şerit: Rozetler & Mesafe */}
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                  isSatilik ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                                }`}>
                                  {isSatilik ? "Satılık" : "Kiralık"}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {comp.source}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                                <span>🎯</span>
                                <span>{comp.distanceMeters || 220} m</span>
                              </span>
                            </div>

                            {/* İlan Başlığı */}
                            <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                              {comp.title}
                            </div>

                            {/* Özellikler */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 pb-2 mb-2 border-b border-slate-100 font-mono">
                              <span className="bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-800">
                                {comp.areaM2} m²
                              </span>
                              <span>•</span>
                              <span className="font-bold text-slate-800">
                                {comp.pricePerM2TL.toLocaleString("tr-TR")} ₺/m²
                              </span>
                              <span>•</span>
                              <span>
                                {comp.roomCount || comp.zoningType || (isResidential ? "3+1" : "İmarlı")}
                              </span>
                              <span>•</span>
                              <span className="text-slate-400">{comp.date || "Güncel"}</span>
                            </div>

                            {/* Fiyat & Aksiyon Butonları */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                  İlan Fiyatı
                                </div>
                                <div className={`text-base font-black font-mono ${isSatilik ? "text-emerald-700" : "text-blue-700"}`}>
                                  ₺ {comp.priceTL.toLocaleString("tr-TR")}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFocusedCompId(comp.id);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                                  title="Haritada bu ilanın konumuna odaklan"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Haritada Gör</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setParcelData((prev) => ({
                                      ...prev,
                                      areaM2: comp.areaM2,
                                      estimatedUnitSaleM2PriceTL: isResidential ? comp.pricePerM2TL : prev.estimatedUnitSaleM2PriceTL,
                                      estimatedLandM2PriceTL: !isResidential ? comp.pricePerM2TL : prev.estimatedLandM2PriceTL,
                                    }));
                                    setSubTab("deger");
                                  }}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95"
                                  title="Bu ilanın verilerini değerleme sihirbazına aktar"
                                >
                                  <span>Değerle</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                        Seçilen filtrede ilan bulunamadı.
                      </div>
                    )}
                  </div>

                  {/* 5. YENİ İLAN / PORTFÖY EKLE ÇAĞRISI */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-center space-y-2">
                    <div className="text-xs font-black text-blue-950 font-heading">
                      Kendi İlanınızı veya Portföyünüzü Ekleyin
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Bu bölgedeki gayrimenkulünüzü veya ihale portföyünüzü ekleyin; haritada ve değerleme havuzunda anında listelensin.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStartValuationInitialMode("ilan_ver");
                        setShowStartValuationModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>İlan Ver / Portföy Ekle</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SEKME: BEST-USE PROJE VE GELİŞTİRME */}
              {subTab === "best_use" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-[#0B1E3B] text-white p-4 rounded-2xl border border-slate-800 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Best-Use & Proje Geliştirme
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        KAKS: {parcelData.kaks || 1.5} • TAKS: {parcelData.taks || 0.35}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="text-2xl font-black text-white font-mono">
                        {Math.round((parcelData.areaM2 || 1000) * (parcelData.kaks || 1.5)).toLocaleString("tr-TR")} m²
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Öngörülen Toplam Emsal İnşaat Alanı (Satılabilir Alan)
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-400">Müteahhit Payı:</span>
                        <div className="font-bold text-white font-mono">%{parcelData.contractorSharePercent || 50} Kat Karşılığı</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Arsa Sahibi Payı:</span>
                        <div className="font-bold text-amber-400 font-mono">%{100 - (parcelData.contractorSharePercent || 50)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-slate-900 font-heading">
                      En Etkin ve Verimli Kullanım (Highest & Best Use) Özeti
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {parcelData.city} ili, {parcelData.district} ilçesi imar plan notları ve piyasa absorpsiyon oranlarına göre, bu parsel üzerinde zemin ticari + üst katlar konut tipolojisi en yüksek yatırım getirisini (IRR %38) sağlamaktadır.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowReportSelectionModal(true)}
                      className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition cursor-pointer"
                    >
                      Best-Use Raporunu PDF Olarak İndir
                    </button>
                  </div>
                </div>
              )}

              {/* SEKME: TREND */}
              {subTab === "trend" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <PriceTrendChart
                    city={parcelData.city}
                    district={parcelData.district}
                    neighborhood={parcelData.neighborhood}
                    category={parcelData.category === "konut" ? "konut" : "arsa"}
                    currentUnitM2TL={
                      isResidential 
                        ? (parcelData.estimatedUnitSaleM2PriceTL || 54090) 
                        : (parcelData.estimatedLandM2PriceTL || 15000)
                    }
                    kfeIndex={parcelData.tcmbOfficialData?.kfeIndex}
                    kfeAnnualChange={parcelData.tcmbOfficialData?.kfeAnnualChangePercent}
                    currencyRates={parcelData.currencyRates}
                  />
                </div>
              )}

              {/* SEKME: DEĞER (STANDART TAPUSOR OTOMATİK DEĞERLEME & FİNANS ANALİZ KARTI VE AKORDİYONLAR) */}
              {subTab === "deger" && (
                <>
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
                      {parcelData.district} {parcelData.neighborhood ? `• ${parcelData.neighborhood}` : ""} Bölgesel Emsal Değeri
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-tight">
                      İİK m.115 %50 Tabanı
                    </div>
                    <div className="text-xs font-black text-emerald-400 font-mono">
                      {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) * (parcelData.areaM2 || 100) : (parcelData.estimatedLandM2PriceTL || 18500) * (parcelData.areaM2 || 100)) * 0.5).toLocaleString("tr-TR")} ₺
                    </div>
                  </div>
                </div>

                {/* Tapusor Brüt m² Girişi & Toplam Değer */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="text-[11px] text-slate-300 font-bold">
                    <span>Taşınmaz Alanı (Brüt):</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={10}
                      max={100000}
                      value={parcelData.areaM2 || 100}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setParcelData((prev) => ({
                          ...prev,
                          areaM2: val > 0 ? val : 1,
                        }));
                      }}
                      className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-right text-xs font-mono font-black text-amber-400 focus:border-amber-400 outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400">m²</span>
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
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                    <span>Toplam Piyasa Değeri:</span>
                    <strong className="text-white font-black text-xs">
                      {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 100)).toLocaleString("tr-TR")} ₺
                    </strong>
                  </div>
                </div>

                {/* Tapusor Stili Sarı/Kehribar "Hemen Rapor Al" Butonu */}
                <button
                  type="button"
                  onClick={() => setShowReportSelectionModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Hemen Ekspertiz Raporu Al (13 Sayfa PDF • Ücretsiz)</span>
                </button>
              </div>

              {/* GÖRSEL 1789501075638: DİNAMİK EMSALLER AKORDİYONU */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setIsEmsalOpen(!isEmsalOpen)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-heading">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Çevredeki Emsal Parseller (Bal Peteği Verisi: {parcelData.comparables?.length || 0})
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isEmsalOpen ? "rotate-180" : ""}`} />
                </button>

                {isEmsalOpen && (
                  <div className="p-3 space-y-2.5 text-xs divide-y divide-slate-100">
                    {parcelData.comparables && parcelData.comparables.length > 0 ? (
                      parcelData.comparables.map((comp) => {
                        const isSatilik = comp.type === "satilik";
                        return (
                          <div key={comp.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-[11px] hover:bg-slate-50 rounded-lg p-1.5 transition">
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-900 truncate">
                                {comp.title}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                <span className={`px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                                  isSatilik ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                                }`}>
                                  {isSatilik ? "Satılık" : "Kiralık"}
                                </span>
                                <span>•</span>
                                <span>{comp.distanceMeters || 240}m</span>
                                <span>•</span>
                                <span>{comp.areaM2} m²</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-600">{comp.source}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`font-mono font-black ${isSatilik ? "text-emerald-700" : "text-blue-700"}`}>
                                ₺ {comp.priceTL.toLocaleString("tr-TR")}
                              </div>
                              <div className="text-[9.5px] text-slate-400 font-mono">
                                {comp.pricePerM2TL.toLocaleString("tr-TR")} ₺/m²
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs">
                        Bu bölge çevresindeki emsal ilanlar taranıyor...
                      </div>
                    )}
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

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleOpenTkgmGlobal}
                        className="w-full py-2 px-3 rounded-lg bg-[#0B1E3B] hover:bg-slate-900 text-amber-400 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                        title="Resmi TKGM Parsel Sorgu uygulamasında bu ada/parseli sorgula"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>🏛️ TKGM Parsel Sorgu&apos;da Resmi Kaydı Gör</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
              )}

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
                    category={parcelData.category === "konut" ? "konut" : "arsa"}
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
                    category={parcelData.category === "konut" ? "konut" : "arsa"}
                    onSelectDistrict={handleSelectDistrict}
                  />

                  {/* Eylemler: Rapor Aç & WhatsApp */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowElectronicReportModal(true)}
                      className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>Kapsamlı Raporu Aç (PDF • Ücretsiz)</span>
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
            <div className="w-full lg:w-[62%] xl:w-[68%] lg:h-[calc(100vh-64px)] relative z-0 isolate bg-slate-100 flex flex-col">
              <ParcelMap
                city={parcelData.city}
                district={parcelData.district}
                neighborhood={parcelData.neighborhood}
                ada={parcelData.ada}
                parsel={parcelData.parsel}
                coordinates={parcelData.coordinates}
                elevationMeters={parcelData.elevationMeters}
                comparables={parcelData.comparables}
                category={parcelData.category === "konut" ? "konut" : "arsa"}
                areaM2={parcelData.areaM2}
                unitM2Price={
                  isResidential 
                    ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) 
                    : (parcelData.estimatedLandM2PriceTL || 18500)
                }
                isEndeksaSplitView={true}
                searchRadius={searchRadius}
                focusedCompId={focusedCompId}
                onSelectComparable={(comp) => {
                  setFocusedCompId(comp.id);
                  setSubTab("rayic");
                }}
                onLocationFound={(coords) => {
                  setParcelData((prev) => ({
                    ...prev,
                    coordinates: coords,
                  }));
                }}
                onSelectDistrict={(dist) => {
                  handleSelectDistrict(dist, parcelData.city);
                }}
                onSelectNeighborhood={(neigh) => {
                  setParcelData((prev) => ({
                    ...prev,
                    neighborhood: neigh,
                  }));
                }}
                onLocationSelect={handleMapLocationSelect}
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
        formData={{
          service: parcelData.category,
          city: parcelData.city,
          district: parcelData.district,
          neighborhood: parcelData.neighborhood || "Merkez",
          ada: parcelData.ada || "117",
          parsel: parcelData.parsel || "9",
          pafta: "H17-D-04-B",
          coordinates: parcelData.coordinates || { lat: 40.1172, lng: 26.4022 },
          grossAreaM2: parcelData.areaM2 || 125,
          netAreaM2: parcelData.netAreaM2 || Math.round((parcelData.areaM2 || 125) * 0.85),
          arsaAreaM2: parcelData.category === "arsa" ? parcelData.areaM2 : undefined,
          araziAreaM2: parcelData.category === "arazi" ? parcelData.areaM2 : undefined,
          roomCount: parcelData.roomCount ? parseInt(parcelData.roomCount.split("+")[0]) || 3 : 3,
          livingRoomCount: parcelData.roomCount && parcelData.roomCount.includes("+") ? parseInt(parcelData.roomCount.split("+")[1]) || 1 : 1,
          buildingAge: parcelData.buildingAge === "0" ? 0 : parcelData.buildingAge === "1-5" ? 3 : parcelData.buildingAge === "6-10" ? 8 : 12,
          floorNumber: parcelData.floorLocation === "kot_bodrum" ? -1 : parcelData.floorLocation === "bahce_giris" ? 0 : (parcelData.floorLocation === "en_ust_kat" || parcelData.floorLocation === "cati_dubleks") ? 5 : 2,
          totalFloors: parcelData.totalFloorsInBuilding || parcelData.maxFloors || 5,
          heatingSystem: parcelData.heatingType === "dogalgaz_kombi" ? "Doğalgaz Kombi" : parcelData.heatingType === "merkezi_payolcer" ? "Merkezi Pay Ölçer" : parcelData.heatingType === "yerden_isitma" ? "Yerden Isıtma" : "Doğalgaz Kombi",
          housingTypeKind: (parcelData.housingType === "villa" || parcelData.housingType === "mustakil") ? "mustakil" : "apartman",
          pgaSeismicHazard: "0.220g",
          marketValueEstimate: calculation.fairMarketValueTL || 7900000,
        }}
      />

      {/* Yeni Ekspertiz ve Değerleme Başlat Modalı (Hasan Hüseyin Yıldırım Modeli: Expertiz & Emlak Bul) */}
      <StartValuationModal
        isOpen={showStartValuationModal}
        onClose={() => setShowStartValuationModal(false)}
        onSubmit={handleStartValuationSubmit}
        initialMode={startValuationInitialMode}
        initialCity={parcelData.city || "Çanakkale"}
        initialDistrict={parcelData.district || "Merkez"}
        initialNeighborhood={parcelData.neighborhood || "Kepez"}
        initialAda={parcelData.ada || "117"}
        initialParsel={parcelData.parsel || "9"}
        initialAreaM2={parcelData.areaM2 || 135}
        initialCategory={parcelData.category === "konut" ? "konut" : "arsa"}
      />
    </div>
  );
}
