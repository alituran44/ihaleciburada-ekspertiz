"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ValuationWizard } from "@/components/ValuationWizard";
import { FeasibilityPreview } from "@/components/FeasibilityPreview";
import { ReportView } from "@/components/ReportView";
import { WhatsAppShareModal } from "@/components/WhatsAppShareModal";
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
import { SAMPLE_SCENARIOS, formatTL, formatNumber, formatArea, parseTurkishNumber } from "@/lib/constants";
import { calculateFeasibility } from "@/lib/calculator";
import { parseSearchLocation, getCadastreForCoordinates, getDistrictCoordinates, TURKEY_PROVINCES_AND_DISTRICTS } from "@/lib/turkeyLocations";
import { getDistrictValuation } from "@/lib/districtValuations";

const PROVINCE_NAMES = Object.keys(TURKEY_PROVINCES_AND_DISTRICTS).sort((a, b) => a.localeCompare(b, "tr"));
import { 
  REAL_ESTATE_CATEGORIES, 
  TRANSACTION_TYPES, 
  DEED_STATUS_OPTIONS,
  OFFER_METHODS, 
  LISTING_OWNER_TYPES 
} from "@/lib/categories";
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
  ExternalLink,
  Camera,
  UploadCloud,
  Trash2,
  Eye,
  X,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  GripVertical
} from "lucide-react";

export default function Home() {
  const [parcelData, setParcelData] = useState<ParcelInput>(SAMPLE_SCENARIOS[0].data);
  const [activeTab, setActiveTab] = useState<"endeks" | "degerleme" | "ihale" | "rapor">("endeks");
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [showElectronicReportModal, setShowElectronicReportModal] = useState<boolean>(false);
  const [showReportSelectionModal, setShowReportSelectionModal] = useState<boolean>(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportPackageType>("elit");
  const [showStartValuationModal, setShowStartValuationModal] = useState<boolean>(false);
  const [startValuationInitialMode, setStartValuationInitialMode] = useState<"expertiz" | "emlak_bul" | "ilan_ver">("expertiz");
  const [subTab, setSubTab] = useState<"deger" | "trend" | "rayic" | "best_use">("deger");
  const [valuationMode, setValuationMode] = useState<"otomatik" | "manuel">("otomatik");
  const [searchRadius, setSearchRadius] = useState<number>(1000);
  const [layoutMapPosition, setLayoutMapPosition] = useState<"left" | "right">("left");
  // Harita & Panel Boyutlandırma & Ayarlama Durumu (Genişlet / Daralt)
  const [sidebarWidth, setSidebarWidth] = useState<number>(440);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
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
  const [areaInputStr, setAreaInputStr] = useState<string>("");
  const [isEditingArea, setIsEditingArea] = useState<boolean>(false);

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
            const finalAda = loc.ada || autoCad.ada;
            const finalParsel = loc.parsel || autoCad.parsel;

            if (loc.isOfficialCadastre && loc.ada && loc.parsel) {
              setTkgmGlobalToast(`🏛️ TKGM Resmi Kadastro: Ada ${loc.ada} / Parsel ${loc.parsel}${loc.alanM2 ? ` • ${formatArea(loc.alanM2)} m²` : ""}${loc.nitelik ? ` (${loc.nitelik})` : ""}`);
              setTimeout(() => setTkgmGlobalToast(null), 5000);
            }

            setParcelData((prev) => ({
              ...prev,
              city: detCity,
              district: detDist,
              neighborhood: detNeigh,
              ada: finalAda || prev.ada,
              parsel: finalParsel || prev.parsel,
              areaM2: loc.alanM2 || prev.areaM2,
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

  // Sürükle-Bırak ile Harita & Panel Boyutlandırma (Ayarlı Ayırıcı)
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleTouchStartResize = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = sidebarWidth;
      if (layoutMapPosition === "right") {
        // Panel solda, harita sağda
        newWidth = e.clientX;
      } else {
        // Harita solda, panel sağda
        newWidth = window.innerWidth - e.clientX;
      }

      const clampedWidth = Math.max(280, Math.min(newWidth, Math.min(750, window.innerWidth * 0.72)));
      setSidebarWidth(clampedWidth);
      if (isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
      }
      window.dispatchEvent(new Event("resize"));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      let newWidth = sidebarWidth;
      if (layoutMapPosition === "right") {
        newWidth = touch.clientX;
      } else {
        newWidth = window.innerWidth - touch.clientX;
      }
      const clampedWidth = Math.max(280, Math.min(newWidth, Math.min(750, window.innerWidth * 0.72)));
      setSidebarWidth(clampedWidth);
      if (isSidebarCollapsed) {
        setIsSidebarCollapsed(false);
      }
      window.dispatchEvent(new Event("resize"));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.dispatchEvent(new Event("resize"));
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isResizing, layoutMapPosition, isSidebarCollapsed, sidebarWidth]);

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
    const cat: PropertyCategory = payload.category;

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
      deedStatus: payload.deedStatus,
      serhStatus: payload.serhStatus || prev.serhStatus || "tapudan_sorulacak",
      coordinates: newCoords || prev.coordinates,
    }));
    setSearchQuery(`${payload.neighborhood}, ${payload.district}, ${payload.city}`);

    setActiveTab("endeks");

    // İlan ver moduysa anlık olarak yerel listeye ve harita emsal havuzuna ekle (İhaleciBurada Hesabı)
    if (payload.mode === "ilan_ver" && payload.listingPriceTL) {
      const isRental = payload.transactionType === "kiralik" || payload.transactionType === "devren_kiralik";
      const newCustomListing: ComparableListing = {
        id: `user-listing-${Date.now()}`,
        title: payload.listingTitle || `${payload.neighborhood || payload.district} • İhaleciBurada Portföy İlanı`,
        category: cat,
        type: (isRental ? "kiralik" : "satilik") as "satilik" | "kiralik",
        areaM2: payload.areaM2,
        pricePerM2TL: Math.round(payload.listingPriceTL / (payload.areaM2 || 1)),
        priceTL: payload.listingPriceTL,
        distanceMeters: 20,
        coordinates: newCoords || parcelData.coordinates || { lat: 40.0985, lng: 26.3980 },
        source: "İhaleciBurada (Ali Turan)",
        roomCount: isRes ? "3+1" : undefined,
        zoningType: isRes ? undefined : payload.tapuNiteligi,
        date: "Bugün",
      };
      setParcelData((prev) => ({
        ...prev,
        comparables: [newCustomListing, ...(prev.comparables || [])],
      }));
      setFocusedCompId(newCustomListing.id);
      setLocationToast("🎉 İlanınız İhaleciBurada hesabınızdan (Ali Turan) başarıyla yayınlandı ve haritada listelendi!");
      setTimeout(() => setLocationToast(null), 6000);
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
  const isLand = parcelData.category === "arsa" || parcelData.category === "arazi";

  const handleCategorySwitch = (cat: PropertyCategory) => {
    const foundCat = REAL_ESTATE_CATEGORIES.find((c) => c.id === cat);
    const defaultSub = foundCat?.subCategories[0] || (cat === "konut" ? "Daire" : "Konut İmarlı Arsa");
    const currentArea = parcelData.areaM2 || 478.15;

    const val = getDistrictValuation(parcelData.city, parcelData.district, 45000, {
      category: cat,
      subCategory: defaultSub,
      neighborhood: parcelData.neighborhood,
      ada: parcelData.ada,
      parsel: parcelData.parsel,
      areaM2: currentArea,
    });

    if (cat === "konut") {
      setParcelData((prev) => {
        const area = prev.areaM2 || currentArea;
        return {
          ...prev,
          category: "konut",
          subCategory: defaultSub,
          title: "Konut & Daire Portföyü",
          areaM2: area,
          netAreaM2: Math.round(area * 0.85),
          roomCount: "3+1",
          buildingAge: "1-5",
          floorLocation: "ara_kat",
          housingType: "daire",
          heatingType: "dogalgaz_kombi",
          deedStatus: "kat_mulkiyeti",
          hasElevator: true,
          hasParking: true,
          hasBalcony: true,
          estimatedUnitSaleM2PriceTL: val.pricePerM2TL,
          monthlyRentEstimateTL: Math.round(val.pricePerM2TL * area * 0.0055),
          askedPriceTL: val.pricePerM2TL * area,
        };
      });
    } else if (cat === "arsa" || cat === "arazi") {
      setParcelData((prev) => {
        const area = prev.areaM2 || currentArea;
        return {
          ...prev,
          category: cat,
          subCategory: defaultSub,
          title: cat === "arazi" ? "Tarla & Arazi Portföyü" : "İmarlı Arsa Portföyü",
          areaM2: area,
          zoningType: "konut",
          maxFloors: 5,
          estimatedLandM2PriceTL: val.pricePerM2TL,
          askedPriceTL: val.pricePerM2TL * area,
        };
      });
    } else {
      setParcelData((prev) => {
        const area = prev.areaM2 || currentArea;
        return {
          ...prev,
          category: cat,
          subCategory: defaultSub,
          title: `${foundCat?.name || "Ticari"} Portföyü`,
          areaM2: area,
          zoningType: "ticari",
          maxFloors: 4,
          estimatedLandM2PriceTL: val.pricePerM2TL,
          estimatedUnitSaleM2PriceTL: val.pricePerM2TL,
          askedPriceTL: val.pricePerM2TL * area,
        };
      });
    }
  };

  const currentSubCategories = useMemo(() => {
    const found = REAL_ESTATE_CATEGORIES.find((c) => c.id === parcelData.category);
    return found?.subCategories || ["Daire", "Müstakil Ev", "Villa"];
  }, [parcelData.category]);

  // Fotoğraf Yükleme Durumu & Önizleme
  interface PropertyPhotoItem {
    id: string;
    url: string;
    tag: string;
    name: string;
    date: string;
  }
  const [propertyPhotos, setPropertyPhotos] = useState<PropertyPhotoItem[]>([]);
  const [photoPreviewModalUrl, setPhotoPreviewModalUrl] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PropertyPhotoItem[] = [];
    const readPromises: Promise<void>[] = [];

    Array.from(files).forEach((file, idx) => {
      if (propertyPhotos.length + newPhotos.length >= 12) {
        alert("En fazla 12 adet fotoğraf yükleyebilirsiniz.");
        return;
      }
      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const result = loadEvent.target?.result as string;
          if (result) {
            newPhotos.push({
              id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              url: result,
              tag: idx === 0 && propertyPhotos.length === 0 ? "Ön Cephe" : "Parsel & Çevre",
              name: file.name,
              date: new Date().toLocaleDateString("tr-TR"),
            });
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
      readPromises.push(promise);
    });

    Promise.all(readPromises).then(() => {
      setPropertyPhotos((prev) => {
        const updated = [...prev, ...newPhotos];
        setParcelData((p) => ({ ...p, images: updated.map((i) => i.url) }));
        return updated;
      });
      e.target.value = "";
    });
  };

  const handleRemovePhoto = (id: string) => {
    setPropertyPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      setParcelData((p) => ({ ...p, images: updated.map((i) => i.url) }));
      return updated;
    });
  };

  const handleChangePhotoTag = (id: string, tag: string) => {
    setPropertyPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tag } : p))
    );
  };

  // ⚡ Aktif Değerleme Hesaplayıcı & Sonuç Gösterici
  const [isValuating, setIsValuating] = useState<boolean>(false);
  const [valuationNotice, setValuationNotice] = useState<string | null>(null);

  const handleRunValuation = async () => {
    setIsValuating(true);
    setValuationNotice(null);

    // Sekmeyi doğrudan Değerleme paneline geçir
    setActiveTab("endeks");

    try {
      const cleanCity = parcelData.city || "Çanakkale";
      const cleanDist = parcelData.district || "Merkez";
      const cleanNeigh = parcelData.neighborhood || "";
      const currentArea = parcelData.areaM2 || 478.15;
      const newCoords = parcelData.coordinates || getDistrictCoordinates(cleanCity, cleanDist);

      const url = `/api/emsal?il=${encodeURIComponent(cleanCity)}&ilce=${encodeURIComponent(cleanDist)}&mahalle=${encodeURIComponent(cleanNeigh)}&kategori=${parcelData.category}${newCoords ? `&lat=${newCoords.lat}&lng=${newCoords.lng}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      let unitPrice = 0;
      const cad = newCoords ? getCadastreForCoordinates(newCoords.lat, newCoords.lng) : { ada: "", parsel: "" };
      const preciseVal = getDistrictValuation(cleanCity, cleanDist, 45000, {
        category: parcelData.category,
        subCategory: parcelData.subCategory,
        neighborhood: cleanNeigh,
        ada: parcelData.ada || cad.ada,
        parsel: parcelData.parsel || cad.parsel,
        areaM2: currentArea,
      });

      const isRes = parcelData.category === "konut";
      let landPrice = preciseVal.pricePerM2TL;
      let unitSalePrice = preciseVal.pricePerM2TL;

      if (data.success && data.data) {
        const resData = data.data;
        const finalCoords = newCoords || resData.coordinates || parcelData.coordinates;
        if (!isRes) {
          landPrice = preciseVal.pricePerM2TL;
          unitSalePrice = resData.unitSaleM2PriceTL || unitSalePrice;
        } else {
          unitSalePrice = preciseVal.pricePerM2TL;
          landPrice = resData.landM2PriceTL || landPrice;
        }
        unitPrice = isRes ? unitSalePrice : landPrice;

        setParcelData((prev) => ({
          ...prev,
          coordinates: finalCoords,
          ada: prev.ada || cad.ada,
          parsel: prev.parsel || cad.parsel,
          areaM2: currentArea,
          estimatedLandM2PriceTL: landPrice,
          estimatedUnitSaleM2PriceTL: unitSalePrice,
          contractorSharePercent: resData.contractorSharePercent ?? prev.contractorSharePercent,
          monthlyRentEstimateTL: isResidential ? (resData.estimatedMonthlyRentTL ?? prev.monthlyRentEstimateTL) : prev.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: resData.comparables || prev.comparables,
          tcmbOfficialData: resData.tcmbOfficialData || prev.tcmbOfficialData,
          buildingCostEstimate: resData.buildingCostEstimate || prev.buildingCostEstimate,
        }));
      } else {
        unitPrice = isRes ? unitSalePrice : landPrice;
        setParcelData((prev) => ({
          ...prev,
          areaM2: currentArea,
          estimatedLandM2PriceTL: landPrice,
          estimatedUnitSaleM2PriceTL: unitSalePrice,
        }));
      }

      const totalVal = unitPrice * currentArea;
      setValuationNotice(`⚡ Değerleme Başarıyla Hesaplandı! • TKGM Parsel Alanı: ${formatArea(currentArea)} m² • Toplam Değer: ${Math.round(totalVal).toLocaleString("tr-TR")} ₺`);
      setTimeout(() => setValuationNotice(null), 6000);

      // Sonuç kartına odaklan
      setTimeout(() => {
        const el = document.getElementById("valuation-result-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.warn("Değerleme hesaplama hatası:", err);
      setValuationNotice("Değerleme yerel piyasa verileriyle güncellendi.");
      setTimeout(() => setValuationNotice(null), 4000);
    } finally {
      setIsValuating(false);
    }
  };

  // 🗺️ Kullanıcı Bilgileri Girdikten Sonra Haritada Göster Fonksiyonu
  const [isLocatingMap, setIsLocatingMap] = useState<boolean>(false);
  const [mapFocusTrigger, setMapFocusTrigger] = useState<number>(0);

  const handleShowOnMap = async () => {
    setIsLocatingMap(true);
    setValuationNotice(null);

    try {
      const cleanCity = (parcelData.city || "Çanakkale").trim();
      const cleanDist = (parcelData.district || "Merkez").trim();
      const cleanNeigh = (parcelData.neighborhood || "").trim();
      const cleanAda = (parcelData.ada || "").trim();
      const cleanParsel = (parcelData.parsel || "").trim();
      const currentArea = parcelData.areaM2 || 478.15;

      // 1. Koordinat tespiti (Önce Mahalle + İlçe + İl ile detaylı geocoding)
      let resolvedCoords: { lat: number; lng: number } | null = null;

      if (cleanNeigh) {
        try {
          // Önce "Mahallesi" ekli sorgula
          const locRes = await fetch(`/api/location/search?q=${encodeURIComponent(`${cleanNeigh} Mahallesi, ${cleanDist}, ${cleanCity}`)}`);
          const locData = await locRes.json();
          if (locData.success && locData.results && locData.results.length > 0) {
            const matchedInProvince = locData.results.find((r: any) =>
              r.province && r.province.toLowerCase().includes(cleanCity.toLowerCase())
            ) || locData.results.find((r: any) =>
              !r.province || r.province.toLowerCase() === cleanCity.toLowerCase()
            );
            if (matchedInProvince && matchedInProvince.lat && matchedInProvince.lng) {
              resolvedCoords = { lat: Number(matchedInProvince.lat), lng: Number(matchedInProvince.lng) };
            }
          }
          // Bulunamazsa doğrudan mahalle adıyla dene
          if (!resolvedCoords) {
            const locRes2 = await fetch(`/api/location/search?q=${encodeURIComponent(`${cleanNeigh}, ${cleanDist}, ${cleanCity}`)}`);
            const locData2 = await locRes2.json();
            if (locData2.success && locData2.results && locData2.results.length > 0) {
              const matchedInProvince2 = locData2.results.find((r: any) =>
                r.province && r.province.toLowerCase().includes(cleanCity.toLowerCase())
              );
              if (matchedInProvince2 && matchedInProvince2.lat && matchedInProvince2.lng) {
                resolvedCoords = { lat: Number(matchedInProvince2.lat), lng: Number(matchedInProvince2.lng) };
              }
            }
          }
        } catch (e) {
          console.warn("Mahalle arama hatası:", e);
        }
      }

      // Eğer mahalleyle bulunamadıysa İlçe + İl ile ara (ve kesinlikle aynı ili doğrula)
      if (!resolvedCoords) {
        try {
          const locRes = await fetch(`/api/location/search?q=${encodeURIComponent(`${cleanDist}, ${cleanCity}`)}`);
          const locData = await locRes.json();
          if (locData.success && locData.results && locData.results.length > 0) {
            const matchedInProvince = locData.results.find((r: any) =>
              r.province && r.province.toLowerCase().includes(cleanCity.toLowerCase())
            ) || (locData.results[0]?.province?.toLowerCase() === cleanCity.toLowerCase() ? locData.results[0] : null);
            if (matchedInProvince && matchedInProvince.lat && matchedInProvince.lng) {
              resolvedCoords = { lat: Number(matchedInProvince.lat), lng: Number(matchedInProvince.lng) };
            }
          }
        } catch (e) {}
      }

      // Fallback: Yerel ilçe koordinat tablosu veya mevcut koordinatlar
      if (!resolvedCoords) {
        resolvedCoords = getDistrictCoordinates(cleanCity, cleanDist) || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
      }

      // 2. Güncel ada/parsel ve konuma göre dinamik değerleme hesapla
      const preciseVal = getDistrictValuation(cleanCity, cleanDist, 45000, {
        category: parcelData.category,
        subCategory: parcelData.subCategory,
        neighborhood: cleanNeigh || undefined,
        ada: cleanAda,
        parsel: cleanParsel,
        areaM2: currentArea,
      });

      const isRes = parcelData.category === "konut";
      const resolvedLand = !isRes ? preciseVal.pricePerM2TL : parcelData.estimatedLandM2PriceTL;
      const resolvedUnit = isRes ? preciseVal.pricePerM2TL : parcelData.estimatedUnitSaleM2PriceTL;

      // 3. State güncelle (ada ve parsel hiçbir zaman silinmez veya ezilmez!)
      setParcelData((prev) => ({
        ...prev,
        city: cleanCity,
        district: cleanDist,
        neighborhood: cleanNeigh,
        ada: cleanAda || prev.ada,
        parsel: cleanParsel || prev.parsel,
        areaM2: currentArea,
        coordinates: resolvedCoords!,
        estimatedLandM2PriceTL: resolvedLand,
        estimatedUnitSaleM2PriceTL: resolvedUnit,
      }));

      // 4. Harita odaklama tetikleyicisini artır
      setMapFocusTrigger((prev) => prev + 1);

      // 5. Bilgilendirme bildirimi
      const adaParselLabel = (cleanAda && cleanParsel) ? `Ada ${cleanAda} / Parsel ${cleanParsel}` : "Kadastro Konumu";
      setValuationNotice(`🗺️ ${cleanDist} / ${cleanCity}${cleanNeigh ? ` • ${cleanNeigh}` : ""} • ${adaParselLabel} haritada odaklandı!`);
      setTimeout(() => setValuationNotice(null), 6000);

      // 6. Sayfayı harita konteynerine yumuşak kaydır (özellikle mobil veya dikey kaydırma için)
      setTimeout(() => {
        const mapContainer = document.getElementById("main-parcel-map-container") || document.querySelector(".leaflet-container");
        if (mapContainer) {
          mapContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    } catch (err) {
      console.error("Haritada gösterme hatası:", err);
    } finally {
      setIsLocatingMap(false);
    }
  };

  // Seçili ile ait ilçe listesi (Türkiye Resmi NVİ Veritabanı)
  const districtNames = useMemo(() => {
    const currentProv = TURKEY_PROVINCES_AND_DISTRICTS[parcelData.city];
    if (currentProv && currentProv.districts) {
      return currentProv.districts.slice().sort((a, b) => a.localeCompare(b, "tr"));
    }
    const foundKey = Object.keys(TURKEY_PROVINCES_AND_DISTRICTS).find(
      (k) => k.toLowerCase() === (parcelData.city || "").toLowerCase()
    );
    if (foundKey && TURKEY_PROVINCES_AND_DISTRICTS[foundKey]?.districts) {
      return TURKEY_PROVINCES_AND_DISTRICTS[foundKey].districts.slice().sort((a, b) => a.localeCompare(b, "tr"));
    }
    return ["Merkez"];
  }, [parcelData.city]);

  // Seçili il ve ilçeye ait mahalle/köy listesi (Türkiye Geneli 50.517 Mahalle)
  const [neighborhoodNames, setNeighborhoodNames] = useState<string[]>([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const currentCity = parcelData.city || "Çanakkale";
    const currentDist = parcelData.district || "Merkez";

    setIsLoadingNeighborhoods(true);
    fetch(`/api/location/neighborhoods?province=${encodeURIComponent(currentCity)}&district=${encodeURIComponent(currentDist)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.neighborhoods)) {
          setNeighborhoodNames(data.neighborhoods);
        } else {
          setNeighborhoodNames([]);
        }
      })
      .catch((err) => {
        console.warn("Mahalle yükleme hatası:", err);
        if (isMounted) setNeighborhoodNames([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingNeighborhoods(false);
      });

    return () => {
      isMounted = false;
    };
  }, [parcelData.city, parcelData.district]);

  // Hızlı Adres Değişikliği (İl, İlçe, Mahalle) ve Harita / Emsal Senkronizasyonu
  const handleAddressChange = useCallback(async (fields: { city?: string; district?: string; neighborhood?: string }) => {
    const updatedCity = fields.city !== undefined ? fields.city : parcelData.city;
    const updatedDistrict = fields.district !== undefined ? fields.district : parcelData.district;
    const updatedNeigh = fields.neighborhood !== undefined ? fields.neighborhood : parcelData.neighborhood;

    setParcelData((prev) => ({
      ...prev,
      city: updatedCity,
      district: updatedDistrict,
      neighborhood: updatedNeigh,
    }));

    const query = `${updatedNeigh ? updatedNeigh + ", " : ""}${updatedDistrict}, ${updatedCity}`;
    setSearchQuery(query);

    try {
      let newCoords = getDistrictCoordinates(updatedCity, updatedDistrict);
      if (updatedNeigh && updatedNeigh.trim()) {
        try {
          const locRes = await fetch(`/api/location/search?q=${encodeURIComponent(`${updatedNeigh.trim()} Mahallesi, ${updatedDistrict}, ${updatedCity}`)}`);
          const locData = await locRes.json();
          if (locData.success && locData.results && locData.results.length > 0) {
            const matchedInProvince = locData.results.find((r: any) =>
              r.province && r.province.toLowerCase().includes(updatedCity.toLowerCase())
            ) || locData.results.find((r: any) =>
              !r.province || r.province.toLowerCase() === updatedCity.toLowerCase()
            );
            const best = matchedInProvince || (locData.results[0]?.province?.toLowerCase() === updatedCity.toLowerCase() ? locData.results[0] : null);
            if (best && best.lat && best.lng) {
              newCoords = { lat: Number(best.lat), lng: Number(best.lng) };
            }
          }
        } catch (e) {}
      }

      const finalCoords = newCoords || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
      const cad = getCadastreForCoordinates(finalCoords.lat, finalCoords.lng);

      const url = `/api/emsal?il=${encodeURIComponent(updatedCity)}&ilce=${encodeURIComponent(updatedDistrict)}&mahalle=${encodeURIComponent(updatedNeigh || "")}&kategori=${parcelData.category}${finalCoords ? `&lat=${finalCoords.lat}&lng=${finalCoords.lng}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      const preciseVal = getDistrictValuation(updatedCity, updatedDistrict, 45000, {
        category: parcelData.category,
        subCategory: parcelData.subCategory,
        neighborhood: updatedNeigh,
        ada: parcelData.ada || cad.ada,
        parsel: parcelData.parsel || cad.parsel,
        areaM2: parcelData.areaM2,
      });

      const isRes = parcelData.category === "konut";
      const resolvedLand = !isRes ? preciseVal.pricePerM2TL : (data?.data?.landM2PriceTL || 18500);
      const resolvedUnit = isRes ? preciseVal.pricePerM2TL : (data?.data?.unitSaleM2PriceTL || 54085);

      if (data.success && data.data) {
        const resData = data.data;
        setParcelData((prev) => ({
          ...prev,
          city: updatedCity,
          district: updatedDistrict,
          neighborhood: updatedNeigh,
          coordinates: finalCoords,
          ada: (prev.ada && prev.ada.trim()) ? prev.ada : (cad.ada || ""),
          parsel: (prev.parsel && prev.parsel.trim()) ? prev.parsel : (cad.parsel || ""),
          estimatedLandM2PriceTL: resolvedLand,
          estimatedUnitSaleM2PriceTL: resolvedUnit,
          contractorSharePercent: resData.contractorSharePercent ?? prev.contractorSharePercent,
          monthlyRentEstimateTL: isResidential ? (resData.estimatedMonthlyRentTL ?? prev.monthlyRentEstimateTL) : prev.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: resData.comparables || prev.comparables,
          tcmbOfficialData: resData.tcmbOfficialData || prev.tcmbOfficialData,
          buildingCostEstimate: resData.buildingCostEstimate || prev.buildingCostEstimate,
        }));
      } else {
        setParcelData((prev) => ({
          ...prev,
          city: updatedCity,
          district: updatedDistrict,
          neighborhood: updatedNeigh,
          coordinates: finalCoords,
          ada: (prev.ada && prev.ada.trim()) ? prev.ada : (cad.ada || ""),
          parsel: (prev.parsel && prev.parsel.trim()) ? prev.parsel : (cad.parsel || ""),
          estimatedLandM2PriceTL: resolvedLand,
          estimatedUnitSaleM2PriceTL: resolvedUnit,
        }));
      }
    } catch (err) {
      console.warn("Adres güncelleme emsal sorgu hatası:", err);
    }
  }, [parcelData.city, parcelData.district, parcelData.neighborhood, parcelData.category, parcelData.coordinates, isResidential]);

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
        const resolvedAda = (item as any)?.ada || (newNeighborhood.toLowerCase().includes("karacaoren") ? "117" : (parcelData.ada && parcelData.ada !== "248" ? parcelData.ada : finalCad.ada));
        const resolvedParsel = (item as any)?.parsel || (newNeighborhood.toLowerCase().includes("karacaoren") ? "9" : (parcelData.parsel && parcelData.parsel !== "12" ? parcelData.parsel : finalCad.parsel));
        const resolvedArea = newNeighborhood.toLowerCase().includes("karacaoren") ? 4961.37 : parcelData.areaM2;
        setParcelData({
          ...parcelData,
          city: newCity,
          district: newDistrict,
          neighborhood: newNeighborhood,
          ada: resolvedAda,
          parsel: resolvedParsel,
          areaM2: resolvedArea,
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
        const resolvedAda = (item as any)?.ada || (newNeighborhood.toLowerCase().includes("karacaoren") ? "117" : (parcelData.ada && parcelData.ada !== "248" ? parcelData.ada : finalCad.ada));
        const resolvedParsel = (item as any)?.parsel || (newNeighborhood.toLowerCase().includes("karacaoren") ? "9" : (parcelData.parsel && parcelData.parsel !== "12" ? parcelData.parsel : finalCad.parsel));
        const resolvedArea = newNeighborhood.toLowerCase().includes("karacaoren") ? 4961.37 : parcelData.areaM2;
        setParcelData({
          ...parcelData,
          city: newCity,
          district: newDistrict,
          neighborhood: newNeighborhood,
          ada: resolvedAda,
          parsel: resolvedParsel,
          areaM2: resolvedArea,
          coordinates: finalCoords,
        });
      }
    } catch (err) {
      const finalCoords = newCoords || parcelData.coordinates || { lat: 39.9208, lng: 32.8541 };
      const finalCad = getCadastreForCoordinates(finalCoords.lat, finalCoords.lng);
      const resolvedAda = (item as any)?.ada || (newNeighborhood.toLowerCase().includes("karacaoren") ? "117" : (parcelData.ada && parcelData.ada !== "248" ? parcelData.ada : finalCad.ada));
      const resolvedParsel = (item as any)?.parsel || (newNeighborhood.toLowerCase().includes("karacaoren") ? "9" : (parcelData.parsel && parcelData.parsel !== "12" ? parcelData.parsel : finalCad.parsel));
      const resolvedArea = newNeighborhood.toLowerCase().includes("karacaoren") ? 4961.37 : parcelData.areaM2;
      setParcelData({
        ...parcelData,
        city: newCity,
        district: newDistrict,
        neighborhood: newNeighborhood,
        ada: resolvedAda,
        parsel: resolvedParsel,
        areaM2: resolvedArea,
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
    areaM2?: number;
    comparables?: any[];
    polygonGeoJson?: any;
    isOfficialCadastre?: boolean;
    nitelik?: string;
  }) => {
    // 1. Üst arama çubuğunu haritada tıklanan noktayla anında güncelle
    setSearchQuery(`${loc.city}, ${loc.district}${loc.neighborhood ? `, ${loc.neighborhood}` : ""}`);

    if (loc.isOfficialCadastre && loc.ada && loc.parsel) {
      setTkgmGlobalToast(`🏛️ TKGM Resmi Kadastro: Ada ${loc.ada} / Parsel ${loc.parsel}${loc.areaM2 ? ` • ${loc.areaM2.toLocaleString("tr-TR")} m²` : ""}${loc.nitelik ? ` (${loc.nitelik})` : ""}`);
      setTimeout(() => setTkgmGlobalToast(null), 5000);
    }

    // 2. Sol analitik paneli ve taşınmaz verilerini anında güncelle (0ms gecikme)
    setParcelData((prev) => {
      const isRes = prev.category === "konut";
      const preciseVal = getDistrictValuation(loc.city, loc.district, loc.unitPrice || 45000, {
        category: prev.category,
        subCategory: prev.subCategory,
        neighborhood: loc.neighborhood,
        ada: (loc.ada && loc.ada.trim()) ? loc.ada : prev.ada,
        parsel: (loc.parsel && loc.parsel.trim()) ? loc.parsel : prev.parsel,
        areaM2: loc.areaM2 ? loc.areaM2 : prev.areaM2,
      });

      const newLandM2 = !isRes ? preciseVal.pricePerM2TL : (prev.estimatedLandM2PriceTL || 18500);
      const newUnitM2 = isRes ? preciseVal.pricePerM2TL : (prev.estimatedUnitSaleM2PriceTL || 54085);

      return {
        ...prev,
        city: loc.city,
        district: loc.district,
        neighborhood: loc.neighborhood,
        ada: (loc.ada && loc.ada.trim()) ? loc.ada : prev.ada,
        parsel: (loc.parsel && loc.parsel.trim()) ? loc.parsel : prev.parsel,
        areaM2: loc.areaM2 ? loc.areaM2 : prev.areaM2,
        coordinates: loc.coordinates, // Tıklanan koordinat kesin olarak sabitlenir!
        estimatedUnitSaleM2PriceTL: newUnitM2,
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
        setParcelData((prev) => {
          const isRes = prev.category === "konut";
          return {
            ...prev,
            city: loc.city,
            district: loc.district,
            neighborhood: loc.neighborhood,
            coordinates: loc.coordinates, // Tıklanan koordinatı kesinlikle koru!
            estimatedLandM2PriceTL: !isRes ? (resData.landM2PriceTL || prev.estimatedLandM2PriceTL) : prev.estimatedLandM2PriceTL,
            estimatedUnitSaleM2PriceTL: isRes ? (resData.unitSaleM2PriceTL || prev.estimatedUnitSaleM2PriceTL) : prev.estimatedUnitSaleM2PriceTL,
            contractorSharePercent: resData.contractorSharePercent ?? prev.contractorSharePercent,
            monthlyRentEstimateTL: isRes ? (resData.estimatedMonthlyRentTL ?? prev.monthlyRentEstimateTL) : prev.monthlyRentEstimateTL,
            marketResearch: resData,
            comparables: resData.comparables ?? prev.comparables,
            tcmbOfficialData: resData.tcmbOfficialData ?? prev.tcmbOfficialData,
            buildingCostEstimate: resData.buildingCostEstimate ?? prev.buildingCostEstimate,
          };
        });
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
    const effectiveAda = parsed.ada || (newNeighborhood.toLowerCase().includes("karacaoren") ? "117" : (parcelData.ada && parcelData.ada !== "248" ? parcelData.ada : sCad.ada));
    const effectiveParsel = parsed.parsel || (newNeighborhood.toLowerCase().includes("karacaoren") ? "9" : (parcelData.parsel && parcelData.parsel !== "12" ? parcelData.parsel : sCad.parsel));
    const effectiveArea = newNeighborhood.toLowerCase().includes("karacaoren") ? 4961.37 : parcelData.areaM2;

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
          ada: effectiveAda,
          parsel: effectiveParsel,
          areaM2: effectiveArea,
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
          ada: effectiveAda,
          parsel: effectiveParsel,
          areaM2: effectiveArea,
          coordinates: newCoords,
        }));
      }
    } catch (err) {
      setParcelData((prev) => ({
        ...prev,
        city: newCity,
        district: newDistrict,
        neighborhood: newNeighborhood,
        ada: effectiveAda,
        parsel: effectiveParsel,
        areaM2: effectiveArea,
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
              onClick={() => {
                setActiveTab("endeks");
              }}
              className={`py-1.5 px-2 transition relative cursor-pointer font-heading font-extrabold whitespace-nowrap shrink-0 ${
                activeTab === "endeks"
                  ? "text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="hidden sm:inline">Akıllı </span>Değerleme
            </button>

            {/* 2. İhale & Pey Analizi Sekmesi */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("ihale");
              }}
              className={`py-1.5 px-2 transition relative cursor-pointer font-heading font-extrabold whitespace-nowrap shrink-0 ${
                activeTab === "ihale"
                  ? "text-blue-600 after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[2.5px] after:bg-blue-600 after:rounded-full"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              İhale & Pey Analizi
            </button>

            {/* 2.5 Harita Solda / Sağda Düzen Değiştirici */}
            <button
              type="button"
              onClick={() => setLayoutMapPosition(prev => prev === "left" ? "right" : "left")}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title="Harita ve Değerleme Paneli Konumunu Değiştir (Solda / Sağda)"
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-600" />
              <span>{layoutMapPosition === "left" ? "Harita Solda" : "Harita Sağda"}</span>
            </button>

            {/* 2.6 Harita Daraltma / Genişletme Ayarı (Presets) */}
            <div className="hidden lg:flex items-center bg-slate-100 border border-slate-300 rounded-full p-0.5 text-xs font-bold shrink-0">
              <span className="text-[10px] font-extrabold text-slate-500 px-2 flex items-center gap-1">
                <span>🗺️ Harita:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSidebarCollapsed(false);
                  setSidebarWidth(580);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                }}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer text-[11px] ${
                  !isSidebarCollapsed && sidebarWidth >= 520
                    ? "bg-[#0B1E3B] text-amber-400 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Paneli Genişlet, Haritayı Daralt (Panel: 580px)"
              >
                Dar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSidebarCollapsed(false);
                  setSidebarWidth(440);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                }}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer text-[11px] ${
                  !isSidebarCollapsed && sidebarWidth >= 380 && sidebarWidth < 520
                    ? "bg-[#0B1E3B] text-amber-400 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Dengeli Standart Boyut (Panel: 440px)"
              >
                Dengeli
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSidebarCollapsed(false);
                  setSidebarWidth(320);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                }}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer text-[11px] ${
                  !isSidebarCollapsed && sidebarWidth < 380
                    ? "bg-[#0B1E3B] text-amber-400 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Haritayı Genişlet, Paneli Daralt (Panel: 320px)"
              >
                Geniş
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSidebarCollapsed(prev => !prev);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                }}
                className={`px-2 py-0.5 rounded-full transition cursor-pointer text-[11px] flex items-center gap-1 ${
                  isSidebarCollapsed
                    ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title={isSidebarCollapsed ? "Paneli Göster" : "Tam Ekran Harita (Paneli Gizle)"}
              >
                {isSidebarCollapsed ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isSidebarCollapsed ? "Paneli Aç" : "Tam Ekran"}</span>
              </button>
            </div>

            {/* 3. Ekspertiz Raporu Sekmesi (Lansmana Özel Ücretsiz - Fotoğraf 2) */}
            <button
              type="button"
              onClick={() => setShowReportSelectionModal(true)}
              className="py-1 px-2.5 transition relative cursor-pointer font-heading font-extrabold whitespace-nowrap shrink-0 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-full border border-emerald-300 shadow-2xs active:scale-95"
              title="Resmi Detaylı E-Ekspertiz ve Değerleme Rapor Paketlerini İncele ve Seç (Lansmana Özel Ücretsiz)"
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
              onClick={() => {
                setActiveTab("endeks");
              }}
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
            onOpenDetailedReport={() => setShowReportSelectionModal(true)}
          />
        </main>
      ) : (
        /* 4. ÇALIŞMA ALANI: Harita (Varsayılan Solda) + Değerleme & Analiz Paneli (Sağda) */
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative">
            
            {/* DEĞERLEME & ANALİZ PANELİ */}
            <div 
              style={{
                flexBasis: !isSidebarCollapsed && typeof window !== "undefined" && window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined,
                width: isSidebarCollapsed ? "0px" : undefined,
                maxWidth: isSidebarCollapsed ? "0px" : undefined,
                minWidth: isSidebarCollapsed ? "0px" : undefined,
              }}
              className={`${
                isSidebarCollapsed 
                  ? "hidden" 
                  : "w-full shrink-0 lg:h-[calc(100vh-64px)] overflow-y-auto p-3 sm:p-5 space-y-4 bg-white relative z-10"
              } ${
                isResizing ? "select-none pointer-events-none" : "transition-[flex-basis,width] duration-150"
              } ${
                layoutMapPosition === "left" 
                  ? "lg:order-3 border-l border-slate-200" 
                  : "lg:order-1 border-r border-slate-200"
              }`}
            >

              {/* RESMİ KADASTRO & AKILLI DEĞERLEME HIZLI GİRİŞ KARTI */}
              <div className="bg-gradient-to-br from-slate-900 via-[#0B1E3B] to-slate-950 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md space-y-3">
                {/* 1. KADASTRO & AKILLI DEĞERLEME BAŞLIĞI VE KATEGORİ ROZETİ */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white font-heading uppercase tracking-wide">
                        Kadastro & Akıllı Değerleme
                      </h3>
                      <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Resmi Tapu & Kadastro Doğrulama</span>
                      </p>
                    </div>
                  </div>
                  {/* Seçili Kategori Rozeti (Görsel 2) */}
                  <div className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <span>📐</span>
                    <span className="font-extrabold">{REAL_ESTATE_CATEGORIES.find(c => c.id === parcelData.category)?.badge || "Arsa & Arazi"}</span>
                  </div>
                </div>

                {/* 1. İŞLEM TÜRÜ (Satılık, Kiralık, Kat Karşılığı, Devren Satılık, Devren Kiralık) */}
                <div className="space-y-1.5 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>1. İşlem Türü</span>
                    </span>
                    <span className="text-[9px] text-slate-400">Satılık, Kiralık veya Devren</span>
                  </div>
                  
                  {/* Buton Grubu: Kesilme (ellipsis) olmadan tam okunaklı 3 + 2 dengeli yerleşim */}
                  <div className="space-y-1.5">
                    {/* Üst Satır: Temel İşlemler (Satılık, Kiralık, Kat Karşılığı) */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {TRANSACTION_TYPES.slice(0, 3).map((t) => {
                        const isActive = (parcelData.transactionType || "satilik") === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setParcelData(prev => ({ ...prev, transactionType: t.id as any }))}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer text-center active:scale-95 border whitespace-nowrap flex items-center justify-center ${
                              isActive
                                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs ring-1 ring-amber-400/50"
                                : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/80"
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Alt Satır: Devren İşlemler (Devren Satılık, Devren Kiralık) */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {TRANSACTION_TYPES.slice(3).map((t) => {
                        const isActive = (parcelData.transactionType || "satilik") === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setParcelData(prev => ({ ...prev, transactionType: t.id as any }))}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center active:scale-95 border whitespace-nowrap flex items-center justify-center gap-1.5 ${
                              isActive
                                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs ring-1 ring-amber-400/50"
                                : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/80"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-slate-950" : "bg-amber-400"}`}></span>
                            <span>{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. TAŞINMAZ ANA TÜRÜ (6 Temel Kategori) */}
                <div className="space-y-1.5 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>2. Taşınmaz Ana Türü</span>
                    </span>
                    <span className="text-[9px] text-slate-400">6 Temel Kategori</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {REAL_ESTATE_CATEGORIES.map((cat) => {
                      const isActive = parcelData.category === cat.id;
                      const icons: Record<string, any> = {
                        konut: HomeIcon,
                        arsa: Trees,
                        ticari: Building2,
                        bina: Building,
                        turizm: Compass,
                        ozel: ShieldCheck,
                      };
                      const IconComp = icons[cat.id] || Building;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySwitch(cat.id as PropertyCategory)}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer active:scale-95 flex items-center gap-2 ${
                            isActive
                              ? "bg-amber-500/20 border-amber-400 text-white shadow-xs ring-1 ring-amber-400/40"
                              : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"
                          }`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold truncate leading-tight">
                              {cat.name}
                            </div>
                            <div className="text-[8.5px] text-slate-400">
                              {cat.subCategories.length} alt tür
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ALT KATEGORİ (Seçili türe göre dinamik) */}
                <div className="space-y-1.5 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      <span>3. Alt Kategori ({REAL_ESTATE_CATEGORIES.find(c => c.id === parcelData.category)?.name || "Arsa / Arazi"})</span>
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono font-semibold truncate max-w-[140px]">
                      {parcelData.subCategory || currentSubCategories[0]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {currentSubCategories.map((sub) => {
                      const isActive = (parcelData.subCategory || currentSubCategories[0]) === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setParcelData(prev => ({ ...prev, subCategory: sub }))}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition cursor-pointer active:scale-95 border ${
                            isActive
                              ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-xs font-black"
                              : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800"
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. TAPU VE HİSSE DURUMU (Mülkiyet Durumu) */}
                <div className="space-y-1.5 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5 tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      <span>4. Tapu ve Hisse Durumu</span>
                    </span>
                    <span className="text-[9px] text-amber-400/90">Mülkiyet durumudur</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {DEED_STATUS_OPTIONS.map((ds) => {
                      const isActive = (parcelData.deedStatus || "mustakil") === ds.id;
                      return (
                        <button
                          key={ds.id}
                          type="button"
                          onClick={() => setParcelData(prev => ({ ...prev, deedStatus: ds.id as any }))}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center active:scale-95 border ${
                            isActive
                              ? "bg-purple-500/25 border-purple-400 text-purple-300 font-black shadow-xs"
                              : "bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800"
                          }`}
                        >
                          {ds.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TEKLİF / SATIŞ YÖNTEMİ & İLAN VEREN / SATICI TÜRÜ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2.5 border-b border-slate-800/80">
                  {/* Teklif / Satış Yöntemi */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                      Teklif / Satış Yöntemi
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {OFFER_METHODS.map((om) => {
                        const isActive = (parcelData.offerMethod || "sabit_fiyat") === om.id;
                        return (
                          <button
                            key={om.id}
                            type="button"
                            onClick={() => setParcelData(prev => ({ ...prev, offerMethod: om.id as any }))}
                            className={`py-1 px-1 rounded-lg text-[9.5px] font-bold transition cursor-pointer text-center border truncate ${
                              isActive
                                ? "bg-amber-500/30 border-amber-400 text-amber-300 font-black"
                                : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                            title={om.label}
                          >
                            {om.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* İlan Veren / Satıcı Türü */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                      İlan Veren / Satıcı Türü
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      {LISTING_OWNER_TYPES.map((lot) => {
                        const isActive = (parcelData.listingOwnerType || "sahibinden") === lot.id;
                        return (
                          <button
                            key={lot.id}
                            type="button"
                            onClick={() => setParcelData(prev => ({ ...prev, listingOwnerType: lot.id as any }))}
                            className={`py-1 px-1 rounded-lg text-[9px] font-bold transition cursor-pointer text-center border truncate ${
                              isActive
                                ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 font-black"
                                : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                            title={lot.label}
                          >
                            {lot.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. ADRES BİLGİLERİ (İL, İLÇE, MAHALLE / KÖY) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1 tracking-wide">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>Adres & Konum</span>
                    </label>
                    <span className="text-[9px] text-slate-400 font-medium">81 İl • 973 İlçe</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* İL */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-300 uppercase block mb-0.5">
                        İl
                      </label>
                      <select
                        value={parcelData.city || "Çanakkale"}
                        onChange={(e) => {
                          const newCity = e.target.value;
                          const defaultDistrict = TURKEY_PROVINCES_AND_DISTRICTS[newCity]?.districts?.[0] || "Merkez";
                          handleAddressChange({ city: newCity, district: defaultDistrict });
                        }}
                        className="w-full bg-slate-900/95 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1.5 text-xs font-bold text-white outline-none cursor-pointer truncate"
                      >
                        {!PROVINCE_NAMES.includes(parcelData.city) && parcelData.city && (
                          <option value={parcelData.city}>{parcelData.city}</option>
                        )}
                        {PROVINCE_NAMES.map((p) => (
                          <option key={p} value={p} className="bg-slate-900 text-white">
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* İLÇE */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-300 uppercase block mb-0.5">
                        İlçe
                      </label>
                      <select
                        value={parcelData.district || "Merkez"}
                        onChange={(e) => {
                          handleAddressChange({ district: e.target.value });
                        }}
                        className="w-full bg-slate-900/95 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1.5 text-xs font-bold text-white outline-none cursor-pointer truncate"
                      >
                        {!districtNames.includes(parcelData.district) && parcelData.district && (
                          <option value={parcelData.district}>{parcelData.district}</option>
                        )}
                        {districtNames.map((d) => (
                          <option key={d} value={d} className="bg-slate-900 text-white">
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* MAHALLE / KÖY */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[9px] font-bold text-slate-300 uppercase block">
                          Mahalle / Köy
                        </label>
                        {isLoadingNeighborhoods && (
                          <span className="text-[8px] text-amber-400 font-mono animate-pulse">Yükleniyor...</span>
                        )}
                      </div>
                      <select
                        value={parcelData.neighborhood || ""}
                        onChange={(e) => {
                          const newNeigh = e.target.value;
                          handleAddressChange({ neighborhood: newNeigh });
                        }}
                        className="w-full bg-slate-900/95 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1.5 text-xs font-bold text-white outline-none cursor-pointer truncate"
                        title="Mahalle veya köy seçiniz"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">
                          {isLoadingNeighborhoods ? "Yükleniyor..." : "Mahalle / Köy Seçin"}
                        </option>
                        {parcelData.neighborhood && !neighborhoodNames.includes(parcelData.neighborhood) && (
                          <option value={parcelData.neighborhood} className="bg-slate-900 text-amber-300">
                            {parcelData.neighborhood}
                          </option>
                        )}
                        {neighborhoodNames.map((n) => (
                          <option key={n} value={n} className="bg-slate-900 text-white">
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. RESMİ KADASTRO (ADA, PARSEL, ALAN M²) */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1 tracking-wide">
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>Kadastro & Parsel</span>
                    </label>
                    <span className="text-[9px] text-slate-400 font-medium">Ada / Parsel / m²</span>
                  </div>

                    <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-slate-300 uppercase block mb-0.5">
                        Ada No
                      </label>
                      <input
                        type="text"
                        value={parcelData.ada || ""}
                        onChange={(e) => {
                          const newAda = e.target.value;
                          setParcelData((prev) => {
                            const val = getDistrictValuation(prev.city, prev.district, 45000, {
                              category: prev.category,
                              subCategory: prev.subCategory,
                              neighborhood: prev.neighborhood,
                              ada: newAda,
                              parsel: prev.parsel,
                              areaM2: prev.areaM2,
                            });
                            const isRes = prev.category === "konut";
                            return {
                              ...prev,
                              ada: newAda,
                              estimatedLandM2PriceTL: !isRes ? val.pricePerM2TL : prev.estimatedLandM2PriceTL,
                              estimatedUnitSaleM2PriceTL: isRes ? val.pricePerM2TL : prev.estimatedUnitSaleM2PriceTL,
                            };
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleShowOnMap();
                        }}
                        placeholder="1368"
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-300 uppercase block mb-0.5">
                        Parsel No
                      </label>
                      <input
                        type="text"
                        value={parcelData.parsel || ""}
                        onChange={(e) => {
                          const newParsel = e.target.value;
                          setParcelData((prev) => {
                            const val = getDistrictValuation(prev.city, prev.district, 45000, {
                              category: prev.category,
                              subCategory: prev.subCategory,
                              neighborhood: prev.neighborhood,
                              ada: prev.ada,
                              parsel: newParsel,
                              areaM2: prev.areaM2,
                            });
                            const isRes = prev.category === "konut";
                            return {
                              ...prev,
                              parsel: newParsel,
                              estimatedLandM2PriceTL: !isRes ? val.pricePerM2TL : prev.estimatedLandM2PriceTL,
                              estimatedUnitSaleM2PriceTL: isRes ? val.pricePerM2TL : prev.estimatedUnitSaleM2PriceTL,
                            };
                          });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleShowOnMap();
                        }}
                        placeholder="1"
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[9px] font-bold text-slate-300 uppercase block">
                          Alan (m²)
                        </label>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={isEditingArea ? areaInputStr : (parcelData.areaM2 ? formatArea(parcelData.areaM2) : "")}
                        onFocus={() => {
                          setIsEditingArea(true);
                          setAreaInputStr(parcelData.areaM2 ? formatArea(parcelData.areaM2) : "");
                        }}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          setAreaInputStr(rawVal);
                          const parsed = parseTurkishNumber(rawVal);
                          setParcelData((prev) => {
                            const val = getDistrictValuation(prev.city, prev.district, 45000, {
                              category: prev.category,
                              subCategory: prev.subCategory,
                              neighborhood: prev.neighborhood,
                              ada: prev.ada,
                              parsel: prev.parsel,
                              areaM2: parsed,
                            });
                            const isRes = prev.category === "konut";
                            return {
                              ...prev,
                              areaM2: parsed,
                              estimatedLandM2PriceTL: !isRes ? val.pricePerM2TL : prev.estimatedLandM2PriceTL,
                              estimatedUnitSaleM2PriceTL: isRes ? val.pricePerM2TL : prev.estimatedUnitSaleM2PriceTL,
                            };
                          });
                        }}
                        onBlur={() => {
                          setIsEditingArea(false);
                          if (parcelData.areaM2) {
                            setAreaInputStr(formatArea(parcelData.areaM2));
                          } else {
                            setAreaInputStr("");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsEditingArea(false);
                            handleShowOnMap();
                          }
                        }}
                        placeholder="Örn: 478,15"
                        className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-amber-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. BUTONLAR: 🗺️ Haritada Göster + 🏛️ TKGM Parsel Sorgu & ⚡ Değerleme */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  {/* Birincil Eylem: Haritada Göster & Odakla */}
                  <button
                    type="button"
                    onClick={handleShowOnMap}
                    disabled={isLocatingMap}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] border ${
                      isLocatingMap
                        ? "bg-emerald-700/60 text-emerald-200 border-emerald-500/40 cursor-wait"
                        : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:brightness-110 text-slate-950 border-emerald-400/60 shadow-emerald-500/20"
                    }`}
                    title="Girilen il, ilçe, mahalle ve ada/parseli harita üzerinde odakla ve göster"
                  >
                    {isLocatingMap ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <Navigation className="w-4 h-4 text-slate-950 fill-slate-950" />
                    )}
                    <span>{isLocatingMap ? "Haritaya Gidiliyor..." : "🗺️ Haritada Göster & Odakla"}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenTkgmGlobal}
                      className="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      title="Resmi TKGM Kadastro Parsel Sorgu sayfasını aç"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">🏛️ TKGM Sorgu</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRunValuation}
                      disabled={isValuating}
                      className={`py-2.5 px-2.5 rounded-xl font-black text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${
                        isValuating
                          ? "bg-amber-600/70 text-slate-900 cursor-wait"
                          : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-105"
                      }`}
                      title="Bu konum ve ada/parsel için anlık akıllı değerleme hesapla"
                    >
                      {isValuating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
                      )}
                      <span>{isValuating ? "Hesaplanıyor..." : "⚡ Değerleme"}</span>
                    </button>
                  </div>
                </div>

                {/* CANLI DEĞERLEME BİLDİRİMİ */}
                {valuationNotice && (
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10.5px] font-bold text-center animate-in fade-in duration-200">
                    {valuationNotice}
                  </div>
                )}

                {/* HIZLI DEĞERLEME ÖZETİ (Birim Fiyat ve TKGM Parsel Toplam Değeri) */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 grid grid-cols-2 gap-2 text-center">
                  <div className="border-r border-slate-800 pr-1">
                    <div className="text-[9px] uppercase tracking-wide text-amber-300 font-bold">Birim m² Fiyatı</div>
                    <div className="text-xs sm:text-sm font-black font-mono text-amber-400 mt-0.5">
                      {(isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)).toLocaleString("tr-TR")} ₺/m²
                    </div>
                  </div>
                  <div className="pl-1">
                    <div className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Toplam Değer ({formatArea(parcelData.areaM2 || 478.15)} m²)</div>
                    <div className="text-xs sm:text-sm font-black font-mono text-emerald-400 mt-0.5">
                      {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 478.15)).toLocaleString("tr-TR")} ₺
                    </div>
                  </div>
                </div>

                {/* Resmi Uyarı Notu */}
                <div className="text-[10px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 leading-snug">
                  📌 <strong>Resmi Bilgi:</strong> İmar durumu yetkili belediyeden resmi imar çapı ile, şerh ve takyidat bilgileri tapu müdürlüğünden teyit edilmelidir. Sitemiz afaki inşaat hesabı yapmaz.
                </div>
              </div>

              {/* TAŞINMAZ FOTOĞRAFLARI YÜKLEME ALANI (Kullanıcı Talebi: Yeri bulduktan sonra ev/arsa foto yüklensin) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Camera className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 font-heading">
                        Taşınmaz Fotoğrafları
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Ev, arsa veya tapu görseli ekleyerek raporunuza dahil edin
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {propertyPhotos.length} / 12 Fotoğraf
                  </span>
                </div>

                {/* Yükleme Butonu / Alanı */}
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-center group">
                  <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                    Fotoğraf Seç veya Buraya Sürükle
                  </span>
                  <span className="text-[9.5px] text-slate-400">
                    PNG, JPG, WEBP • Max 10MB (Çoklu Seçim Desteklenir)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Yüklenen Fotoğraflar Galerisi */}
                {propertyPhotos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {propertyPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-2xs"
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-200"
                          onClick={() => setPhotoPreviewModalUrl(photo.url)}
                        />
                        {/* Silme Butonu */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(photo.id);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                          title="Fotoğrafı Kaldır"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {/* Etiket Seçici / Rozet */}
                        <select
                          value={photo.tag}
                          onChange={(e) => handleChangePhotoTag(photo.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-1 left-1 right-1 bg-slate-900/90 text-white text-[8.5px] font-bold rounded px-1 py-0.5 outline-none cursor-pointer border border-white/20 truncate"
                        >
                          <option value="Ön Cephe">Ön Cephe</option>
                          <option value="Manzara">Manzara</option>
                          <option value="Parsel & Çevre">Parsel & Çevre</option>
                          <option value="İç Mekan">İç Mekan</option>
                          <option value="Tapu / Belge">Tapu / Belge</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* DEĞERLEME & FİNANS ANALİZ KARTI */}
              <div id="valuation-result-card" className="bg-gradient-to-br from-slate-900 via-[#0B1E3B] to-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3.5 scroll-mt-24">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Finansal Analiz
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
                    <button
                      type="button"
                      onClick={() => {
                        setValuationMode("otomatik");
                        const val = getDistrictValuation(parcelData.city, parcelData.district, 45000, {
                          category: parcelData.category,
                          subCategory: parcelData.subCategory,
                          neighborhood: parcelData.neighborhood,
                          ada: parcelData.ada,
                          parsel: parcelData.parsel,
                          areaM2: parcelData.areaM2,
                        });
                        if (isResidential) setParcelData(prev => ({ ...prev, estimatedUnitSaleM2PriceTL: val.pricePerM2TL }));
                        else setParcelData(prev => ({ ...prev, estimatedLandM2PriceTL: val.pricePerM2TL }));
                      }}
                      className={`px-2 py-0.5 rounded cursor-pointer transition ${valuationMode === "otomatik" ? "bg-amber-500/30 text-amber-300 font-black border border-amber-400/40" : "text-slate-400 hover:text-white"}`}
                    >
                      ● Otomatik
                    </button>
                    <button
                      type="button"
                      onClick={() => setValuationMode("manuel")}
                      className={`px-2 py-0.5 rounded cursor-pointer transition ${valuationMode === "manuel" ? "bg-amber-500/30 text-amber-300 font-black border border-amber-400/40" : "text-slate-400 hover:text-white"}`}
                    >
                      ✏️ Manuel
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex-1">
                    {valuationMode === "otomatik" ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight font-mono">
                            {(isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)).toLocaleString("tr-TR")} ₺ <span className="text-xs font-semibold text-slate-400">/ m²</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValuationMode("manuel")}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold transition cursor-pointer"
                            title="Değeri serbestçe değiştirmek için tıklayın"
                          >
                            ✏️ Değiştir
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {parcelData.district} {parcelData.neighborhood ? `• ${parcelData.neighborhood}` : ""} {parcelData.category === "konut" ? "Konut" : parcelData.category === "arsa" ? "Arsa" : "Arazi"} Emsal Değeri
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={100}
                            step={100}
                            value={isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              if (isResidential) {
                                setParcelData(prev => ({ ...prev, estimatedUnitSaleM2PriceTL: val }));
                              } else {
                                setParcelData(prev => ({ ...prev, estimatedLandM2PriceTL: val }));
                              }
                            }}
                            className="w-36 bg-slate-900 border-2 border-amber-400 rounded-xl px-2.5 py-1 text-xl sm:text-2xl font-black text-amber-300 font-mono focus:ring-2 focus:ring-amber-400/50 outline-none"
                          />
                          <span className="text-xs font-bold text-amber-400">₺ / m² (Manuel Giriş)</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const curr = isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500);
                              const nextVal = Math.round(curr * 0.90);
                              if (isResidential) setParcelData(prev => ({ ...prev, estimatedUnitSaleM2PriceTL: nextVal }));
                              else setParcelData(prev => ({ ...prev, estimatedLandM2PriceTL: nextVal }));
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                          >
                            -%10
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const curr = isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500);
                              const nextVal = Math.round(curr * 0.95);
                              if (isResidential) setParcelData(prev => ({ ...prev, estimatedUnitSaleM2PriceTL: nextVal }));
                              else setParcelData(prev => ({ ...prev, estimatedLandM2PriceTL: nextVal }));
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                          >
                            -%5
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const curr = isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500);
                              const nextVal = Math.round(curr * 1.05);
                              if (isResidential) setParcelData(prev => ({ ...prev, estimatedUnitSaleM2PriceTL: nextVal }));
                              else setParcelData(prev => ({ ...prev, estimatedLandM2PriceTL: nextVal }));
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                          >
                            +%5
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const curr = isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500);
                              const nextVal = Math.round(curr * 1.10);
                              if (isResidential) setParcelData(prev => ({ ...prev, estimatedUnitSaleM2PriceTL: nextVal }));
                              else setParcelData(prev => ({ ...prev, estimatedLandM2PriceTL: nextVal }));
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold border border-slate-700 cursor-pointer"
                          >
                            +%10
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const val = getDistrictValuation(parcelData.city, parcelData.district, 45000, {
                                category: parcelData.category,
                                subCategory: parcelData.subCategory,
                                neighborhood: parcelData.neighborhood,
                                ada: parcelData.ada,
                                parsel: parcelData.parsel,
                                areaM2: parcelData.areaM2,
                              });
                              if (isResidential) setParcelData(prev => ({ ...prev, estimatedUnitSaleM2PriceTL: val.pricePerM2TL }));
                              else setParcelData(prev => ({ ...prev, estimatedLandM2PriceTL: val.pricePerM2TL }));
                              setValuationMode("otomatik");
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 cursor-pointer"
                            title="Resmi piyasa ortalamasına dön"
                          >
                            🔄 Otomatiğe Dön
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resmi TKGM Parsel Değerleme Özeti */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-300">Resmi TKGM Parsel Alanı</div>
                    <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
                      {formatArea(parcelData.areaM2 || 478.15)} m²
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Toplam Parsel Değeri</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 478.15)).toLocaleString("tr-TR")} ₺
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
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                    <span>Toplam Piyasa Değeri:</span>
                    <strong className="text-white font-black text-xs">
                      {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 478.15)).toLocaleString("tr-TR")} ₺
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
                      <span className="text-slate-500">Piyasa Değeri ({formatArea(parcelData.areaM2 || 478.15)} m²):</span>
                      <span className="font-bold text-slate-900 font-mono">₺ {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 478.15)).toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-emerald-700 font-semibold">İİK m.115 %50 Tabanı:</span>
                      <span className="font-black text-emerald-700 font-mono">₺ {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 478.15) * 0.5).toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-amber-700 font-black">
                      <span>Potansiyel Arbitraj Kârı:</span>
                      <span className="font-mono text-sm">₺ {Math.round((isResidential ? (parcelData.estimatedUnitSaleM2PriceTL || 54085) : (parcelData.estimatedLandM2PriceTL || 18500)) * (parcelData.areaM2 || 478.15) * 0.5).toLocaleString("tr-TR")}</span>
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
                      onClick={() => setShowReportSelectionModal(true)}
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
                    onViewReport={() => setShowReportSelectionModal(true)}
                  />
                </div>
              )}

              {/* 3. FOTODAKİ KENDİ İLANINIZI VEYA PORTFÖYÜNÜZÜ EKLEYİN KARTI (EN SON KISIM) */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-200 rounded-2xl p-4 text-center space-y-2 mt-4 shadow-xs">
                <div className="text-xs font-black text-blue-950 font-heading">
                  Kendi İlanınızı veya Portföyünüzü Ekleyin
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Bu bölgedeki gayrimenkulünüzü veya ihale portföyünüzü ekleyin; <strong>İhaleciBurada</strong> hesabınızdan haritada ve değerleme havuzunda anında listelensin.
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-blue-900 font-bold bg-white/90 py-1 px-3 rounded-full border border-blue-200/80 max-w-fit mx-auto shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Bağlı Hesap: <strong>Ali Turan</strong> (İhaleciBurada Pro)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStartValuationInitialMode("ilan_ver");
                    setShowStartValuationModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>İhaleciBurada Hesabından İlan Ver / Portföy Ekle</span>
                </button>
              </div>
            </div>

            {/* AYARLANABİLİR HARİTA & PANEL AYIRICI TUTAMAÇ (DRAGGABLE RESIZER BAR) */}
            {!isSidebarCollapsed && (
              <div
                onMouseDown={handleMouseDownResize}
                onTouchStart={handleTouchStartResize}
                className={`hidden lg:flex items-center justify-center relative select-none cursor-col-resize z-20 group lg:order-2 shrink-0 ${
                  isResizing 
                    ? "bg-amber-500 w-2.5 shadow-md ring-2 ring-amber-400" 
                    : "bg-slate-200 hover:bg-amber-400 w-2 hover:w-2.5 border-x border-slate-300 hover:border-amber-400 transition-colors"
                }`}
                title="Sürükleyerek Haritayı Daraltın veya Genişletin (Çift Tık: 440px Sıfırla)"
                onDoubleClick={() => {
                  setSidebarWidth(440);
                  setIsSidebarCollapsed(false);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                }}
              >
                {/* Ortadaki Yüzen Tutamaç Butonu & Ok Simgesi */}
                <div className="absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSidebarCollapsed(true);
                      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                    }}
                    className="w-5 h-12 rounded-full bg-[#0B1E3B] hover:bg-slate-900 text-amber-400 border border-amber-500/50 shadow-md flex flex-col items-center justify-center gap-1 transition hover:scale-110 active:scale-95 cursor-pointer"
                    title={
                      layoutMapPosition === "left"
                        ? "Paneli Gizle (Haritayı Tam Ekran Yap)"
                        : "Paneli Gizle (Haritayı Tam Ekran Yap)"
                    }
                  >
                    <GripVertical className="w-2.5 h-2.5 text-amber-400/70" />
                    {layoutMapPosition === "left" ? (
                      <ChevronRight className="w-3 h-3 text-amber-400" />
                    ) : (
                      <ChevronLeft className="w-3 h-3 text-amber-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* HARİTA PANELİ (Geniş Tapusor & GIS Uydu Haritası) */}
            <div 
              id="main-parcel-map-container"
              className={`w-full lg:flex-1 lg:h-[calc(100vh-64px)] relative z-0 isolate bg-slate-100 flex flex-col ${
              layoutMapPosition === "left"
                ? "lg:order-1 border-r border-slate-200"
                : "lg:order-3"
            }`}>
              {/* Paneli Yeniden Aç Floating Butonu (Harita Tam Ekranken) */}
              {isSidebarCollapsed && (
                <div className={`hidden lg:flex absolute top-16 z-[460] animate-in fade-in zoom-in-95 duration-200 ${
                  layoutMapPosition === "left" ? "right-4" : "left-4"
                }`}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSidebarCollapsed(false);
                      setSidebarWidth(440);
                      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B1E3B] hover:bg-slate-900 text-amber-400 border border-amber-500/50 shadow-xl font-bold text-xs transition active:scale-95 cursor-pointer group"
                    title="Değerleme Panelini Göster"
                  >
                    {layoutMapPosition === "left" ? (
                      <ChevronLeft className="w-4 h-4 text-amber-400 transition-transform group-hover:-translate-x-0.5" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-amber-400 transition-transform group-hover:translate-x-0.5" />
                    )}
                    <span>📋 Değerleme Panelini Aç</span>
                  </button>
                </div>
              )}

              <ParcelMap
                city={parcelData.city}
                district={parcelData.district}
                neighborhood={parcelData.neighborhood}
                ada={parcelData.ada}
                parsel={parcelData.parsel}
                coordinates={parcelData.coordinates}
                focusTrigger={mapFocusTrigger}
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
                isSidebarCollapsed={isSidebarCollapsed}
                sidebarWidth={sidebarWidth}
                onToggleSidebar={() => {
                  setIsSidebarCollapsed(prev => !prev);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                }}
                onSetSidebarWidth={(w) => {
                  setIsSidebarCollapsed(false);
                  setSidebarWidth(w);
                  setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
                }}
                onSelectComparable={(comp) => {
                  setFocusedCompId(comp.id);
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
        onOpenReportPreview={(pkg) => {
          setSelectedReportType(pkg);
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

      {/* Resmi Elektronik Ekspertiz Raporu Modalı (Emsal 8sf / Arsa 20sf / Elit 13sf) */}
      <ElectronicReportModal
        isOpen={showElectronicReportModal}
        onClose={() => setShowElectronicReportModal(false)}
        reportType={selectedReportType}
        onSwitchReportType={() => {
          setShowElectronicReportModal(false);
          setShowReportSelectionModal(true);
        }}
        propertyTitle={`${parcelData.city} / ${parcelData.district} / ${parcelData.neighborhood || "Merkez"}`}
        category={parcelData.category === "konut" ? "konut" : "arsa"}
        locationText={`${parcelData.neighborhood || "Merkez"}, ${parcelData.district}, ${parcelData.city}`}
        parcelText={`${parcelData.city}, ${parcelData.district}, ${parcelData.neighborhood || "Merkez"}, ${parcelData.ada || "48507"} Ada, ${parcelData.parsel || "1"} Parsel`}
        marketValueTL={calculation.fairMarketValueTL || 7900000}
        areaM2={parcelData.areaM2 || 110}
        comparables={parcelData.comparables}
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
          serhStatus: parcelData.serhStatus || "tapudan_sorulacak",
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

      {/* Taşınmaz Fotoğrafı Tam Ekran Önizleme Modalı (Lightbox) */}
      {photoPreviewModalUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPhotoPreviewModalUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPhotoPreviewModalUrl(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={photoPreviewModalUrl} 
              alt="Taşınmaz Fotoğrafı" 
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border border-slate-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
