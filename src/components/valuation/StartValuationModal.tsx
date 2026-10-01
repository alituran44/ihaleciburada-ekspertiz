"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Search, 
  X, 
  Building, 
  Building2, 
  Trees, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Layers,
  Loader2,
  CheckCircle2,
  FileText,
  Compass,
  Navigation,
  Radio,
  PlusCircle,
  Tag,
  Phone,
  User,
  Check,
  Crosshair,
  ExternalLink,
  Home,
  Info
} from "lucide-react";
import { TURKEY_PROVINCES_AND_DISTRICTS, getProvinceCoordinates, getDistrictCoordinates } from "@/lib/turkeyLocations";
import { 
  REAL_ESTATE_TAXONOMY, 
  TRANSACTION_TYPES, 
  TENDER_METHODS, 
  SELLER_TYPES, 
  DEED_STATUS_OPTIONS, 
  PROPERTY_TAGS 
} from "@/lib/taxonomy";

export interface StartValuationPayload {
  mode: "expertiz" | "emlak_bul" | "ilan_ver";
  transactionType: "satilik" | "kiralik" | "kat_karsiligi" | "devren_satilik" | "devren_kiralik";
  mainCategory: "konut" | "arsa" | "ticari" | "bina" | "turizm" | "ozel_amacli";
  subCategory: string;
  customSubCategory?: string;
  deedStatus: "mustakil" | "hisseli" | "kat_mulkiyeti" | "kat_irtifaki";
  tenderMethod?: "sabit_fiyat" | "teklif_al" | "acik_artirma";
  sellerType?: "sahibinden" | "emlak_ofisi" | "insaat_firmasi" | "kurum";
  tags?: string[];
  mapAction: "isaretle" | "ilanlari_bul";
  searchRadiusMeters?: number;
  category: "konut" | "arsa" | "arazi" | "ticari";
  city: string;
  district: string;
  neighborhood: string;
  ada: string;
  parsel: string;
  areaM2: number;
  tapuNiteligi: string;
  coordinates?: { lat: number; lng: number };
  serhStatus?: "tapudan_sorulacak" | "temiz" | "ipotek_var" | "haciz_serh_var";
  // İlan Ver Modu Alanları
  listingPriceTL?: number;
  contactName?: string;
  contactPhone?: string;
  listingTitle?: string;
}

interface StartValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: StartValuationPayload) => void;
  initialMode?: "expertiz" | "emlak_bul" | "ilan_ver";
  initialCity?: string;
  initialDistrict?: string;
  initialNeighborhood?: string;
  initialAda?: string;
  initialParsel?: string;
  initialAreaM2?: number;
  initialCategory?: "konut" | "arsa" | "arazi" | "ticari";
}

export const StartValuationModal: React.FC<StartValuationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialMode = "expertiz",
  initialCity = "Çanakkale",
  initialDistrict = "Merkez",
  initialNeighborhood = "Kepez",
  initialAda = "117",
  initialParsel = "9",
  initialAreaM2 = 135,
  initialCategory = "arsa",
}) => {
  // 1. Mod Seçimi (EXPERTİZ vs EMLAK BUL vs İLAN VER)
  const [activeMode, setActiveMode] = useState<"expertiz" | "emlak_bul" | "ilan_ver">(initialMode);

  // 2. İşlem Türü (Satılık, Kiralık, Kat Karşılığı, Devren Satılık, Devren Kiralık)
  const [transactionType, setTransactionType] = useState<"satilik" | "kiralik" | "kat_karsiligi" | "devren_satilik" | "devren_kiralik">("satilik");

  // 3. Ana Kategori (6 Standart Taşınmaz Türü)
  const [mainCategory, setMainCategory] = useState<"konut" | "arsa" | "ticari" | "bina" | "turizm" | "ozel_amacli">(
    initialCategory === "konut" ? "konut" : initialCategory === "ticari" ? "ticari" : "arsa"
  );

  // 4. Alt Kategori (Seçili ana kategoriye göre dinamik)
  const [subCategory, setSubCategory] = useState<string>(
    initialCategory === "konut" ? "daire" : "konut_imarli"
  );
  const [customSubCategory, setCustomSubCategory] = useState<string>("");
  const [showCustomSubCategory, setShowCustomSubCategory] = useState<boolean>(false);

  // 5. Tapu & Hisse Durumu (Mülkiyet Durumu - Kesinlikle taşınmaz türü değil)
  const [deedStatus, setDeedStatus] = useState<"mustakil" | "hisseli" | "kat_mulkiyeti" | "kat_irtifaki">("mustakil");

  // 6. Teklif Yöntemi & İlan Veren
  const [tenderMethod, setTenderMethod] = useState<"sabit_fiyat" | "teklif_al" | "acik_artirma">("sabit_fiyat");
  const [sellerType, setSellerType] = useState<"sahibinden" | "emlak_ofisi" | "insaat_firmasi" | "kurum">("sahibinden");

  // 7. Özellik & Filtre Etiketleri (Denize Yakın, Yatırımlık vb.)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "konut":
        return <Home className="w-4 h-4 shrink-0" />;
      case "arsa":
        return <Trees className="w-4 h-4 shrink-0" />;
      case "ticari":
        return <Store className="w-4 h-4 shrink-0" />;
      case "bina":
        return <Building2 className="w-4 h-4 shrink-0" />;
      case "turizm":
        return <Building className="w-4 h-4 shrink-0" />;
      case "ozel_amacli":
        return <ShieldCheck className="w-4 h-4 shrink-0" />;
      default:
        return <Layers className="w-4 h-4 shrink-0" />;
    }
  };

  // 4. Kiralık / Satılık Aynı Menü (Lokasyon & Ada / Parsel)
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [neighborhood, setNeighborhood] = useState(initialNeighborhood);
  const [ada, setAda] = useState(initialAda);
  const [parsel, setParsel] = useState(initialParsel);
  const [areaM2, setAreaM2] = useState(initialAreaM2);
  const [tapuNiteligi, setTapuNiteligi] = useState("İmarlı Arsa");
  const [serhStatus, setSerhStatus] = useState<"tapudan_sorulacak" | "temiz" | "ipotek_var" | "haciz_serh_var">("tapudan_sorulacak");

  // 5. Arama Yarıçapı (Radar / Çap Seçimi: 500m, 1000m, 3000m, 5000m)
  const [searchRadius, setSearchRadius] = useState<number>(1000);

  // 6. Haritada Kendin Seç & İşlem Seçimi
  const [mapAction, setMapAction] = useState<"isaretle" | "ilanlari_bul">(
    initialMode === "emlak_bul" ? "ilanlari_bul" : "isaretle"
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 40.0985,
    lng: 26.3980,
  });

  // 7. İlan Ver Modu Özel Alanları (İhaleciBurada Ali Turan Hesabı)
  const [listingPriceTL, setListingPriceTL] = useState<number>(9425000);
  const [contactName, setContactName] = useState<string>("Ali Turan");
  const [contactPhone, setContactPhone] = useState<string>("0532 000 00 00");
  const [listingTitle, setListingTitle] = useState<string>("");
  const [isListingPublishedSuccess, setIsListingPublishedSuccess] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoLocating, setIsAutoLocating] = useState<boolean>(false);
  const [tkgmCopiedToast, setTkgmCopiedToast] = useState<string | null>(null);

  // GPS ile İl, İlçe, Köy/Mahalle Otomatik Getir
  const handleAutoLocateGPS = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Cihazınızda GPS konum servisi bulunamadı.");
      return;
    }
    setIsAutoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uLat = Number(pos.coords.latitude.toFixed(6));
        const uLng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ lat: uLat, lng: uLng });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([uLat, uLng], 16);
          if (markerInstanceRef.current) markerInstanceRef.current.setLatLng([uLat, uLng]);
          if (circleInstanceRef.current) circleInstanceRef.current.setLatLng([uLat, uLng]);
        }

        try {
          const res = await fetch(`/api/location/search?lat=${uLat}&lng=${uLng}`);
          const data = await res.json();
          if (data.success && data.location) {
            const loc = data.location;
            if (loc.province) setCity(loc.province);
            if (loc.district) setDistrict(loc.district);
            if (loc.neighborhood) setNeighborhood(loc.neighborhood);
          }
        } catch (err) {
          console.warn("Otomatik konum çözümleme hatası:", err);
        } finally {
          setIsAutoLocating(false);
        }
      },
      (err) => {
        setIsAutoLocating(false);
        alert("GPS konum izni verilmedi veya sinyal zayıf.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Resmi TKGM Parsel Sorgu Entegrasyonu
  const handleOpenTkgm = () => {
    const textToCopy = `${city} / ${district} / ${neighborhood || "Merkez"} - Ada: ${ada || "1"} Parsel: ${parsel || "1"}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setTkgmCopiedToast(`Ada ${ada || "1"} / Parsel ${parsel || "1"} bilgisi panoya kopyalandı! TKGM resmi parsel sorgu haritası açılıyor...`);
    setTimeout(() => setTkgmCopiedToast(null), 4000);

    const tkgmUrl = `https://parselsorgu.tkgm.gov.tr/#ara/cografi/${coords.lat}/${coords.lng}`;
    window.open(tkgmUrl, "_blank", "noopener,noreferrer");
  };

  // Leaflet Harita Referansları
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);
  const polygonInstanceRef = useRef<any>(null);

  // Mod değiştiğinde harita eylemini senkronize et
  useEffect(() => {
    if (activeMode === "emlak_bul") {
      setMapAction("ilanlari_bul");
    } else {
      setMapAction("isaretle");
    }
  }, [activeMode]);

  // İl değiştikçe ilçeleri otomatik getir
  const provinceList = Object.keys(TURKEY_PROVINCES_AND_DISTRICTS).sort((a, b) => a.localeCompare(b, "tr"));
  const availableDistricts = TURKEY_PROVINCES_AND_DISTRICTS[city]?.districts || [];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const dists = TURKEY_PROVINCES_AND_DISTRICTS[newCity]?.districts || [];
    const newDistrict = dists.length > 0 ? dists[0] : "";
    setDistrict(newDistrict);

    const distCoords = getDistrictCoordinates(newCity, newDistrict) || getProvinceCoordinates(newCity);
    if (distCoords) {
      setCoords(distCoords);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([distCoords.lat, distCoords.lng], 15);
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([distCoords.lat, distCoords.lng]);
        }
      }
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const distCoords = getDistrictCoordinates(city, newDistrict);
    if (distCoords) {
      setCoords(distCoords);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([distCoords.lat, distCoords.lng], 15);
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([distCoords.lat, distCoords.lng]);
        }
      }
    }
  };

  // Harita Başlatma & Canlı Kadastro Poligonu + Radar Çemberi Güncellemesi
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    const setupMap = async () => {
      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const currentLat = coords?.lat || 40.0985;
      const currentLng = coords?.lng || 26.3980;

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 15,
        zoomControl: false,
      });

      // ESRI World Imagery (Uydu Katmanı)
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        attribution: "Tiles © Esri",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // 1. ÖZEL KEHRİBAR PIN
      const badgeHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #0B1E3B; color: #F59E0B; padding: 4px 8px; border-radius: 8px; font-weight: 900; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6); border: 2px solid #F59E0B; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span>${ada ? `${ada}/${parsel}` : "Konum"}</span>
          </div>
          <div style="width: 12px; height: 12px; background: #F59E0B; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.5); margin-top: -3px;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-pin",
        html: badgeHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([currentLat, currentLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      // 2. KADASTRO PARSEL POLİGONU (MİNİ HARİTADA PARSEL SINIRI)
      const dLat = (Math.sqrt(areaM2 || 850) / 111320) * 0.45;
      const dLng = (Math.sqrt(areaM2 || 850) / (111320 * Math.cos(currentLat * Math.PI / 180))) * 0.45;
      const parcelBounds: [number, number][] = [
        [currentLat - dLat * 0.85, currentLng - dLng * 0.9],
        [currentLat + dLat * 1.15, currentLng - dLng * 0.75],
        [currentLat + dLat * 0.9, currentLng + dLng * 1.1],
        [currentLat - dLat * 0.95, currentLng + dLng * 0.85],
      ];

      const polygon = L.polygon(parcelBounds, {
        color: "#F59E0B",
        fillColor: "#F59E0B",
        fillOpacity: 0.35,
        weight: 2.5,
        dashArray: "3, 3",
      }).addTo(map);

      polygon.bindTooltip(`Ada: ${ada || "117"} / Parsel: ${parsel || "9"} (${areaM2} m²)`, {
        permanent: false,
        direction: "top",
      });

      // 3. ARAMA RADAR ÇEMBERİ (YARIÇAP: 500m - 5000m)
      const circle = L.circle([currentLat, currentLng], {
        radius: searchRadius,
        color: "#10B981",
        fillColor: "#10B981",
        fillOpacity: (activeMode === "emlak_bul" || mapAction === "ilanlari_bul") ? 0.12 : 0,
        weight: (activeMode === "emlak_bul" || mapAction === "ilanlari_bul") ? 2 : 0,
        dashArray: "6, 6",
      }).addTo(map);

      const updateGeometries = async (newLat: number, newLng: number) => {
        setCoords({ lat: newLat, lng: newLng });
        circle.setLatLng([newLat, newLng]);

        const ndLat = (Math.sqrt(areaM2 || 850) / 111320) * 0.45;
        const ndLng = (Math.sqrt(areaM2 || 850) / (111320 * Math.cos(newLat * Math.PI / 180))) * 0.45;
        polygon.setLatLngs([
          [newLat - ndLat * 0.85, newLng - ndLng * 0.9],
          [newLat + ndLat * 1.15, newLng - ndLng * 0.75],
          [newLat + ndLat * 0.9, newLng + ndLng * 1.1],
          [newLat - ndLat * 0.95, newLng + ndLng * 0.85],
        ]);

        // Haritada işaretlenen noktanın İl, İlçe, Köy/Mahalle bilgisini otomatik doldur
        try {
          const res = await fetch(`/api/location/search?lat=${newLat}&lng=${newLng}`);
          const data = await res.json();
          if (data.success && data.location) {
            const loc = data.location;
            if (loc.province) setCity(loc.province);
            if (loc.district) setDistrict(loc.district);
            if (loc.neighborhood) setNeighborhood(loc.neighborhood);
          }
        } catch (e) {
          // ignore
        }
      };

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        updateGeometries(pos.lat, pos.lng);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        updateGeometries(e.latlng.lat, e.latlng.lng);
      });

      markerInstanceRef.current = marker;
      circleInstanceRef.current = circle;
      polygonInstanceRef.current = polygon;
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);
    };

    setupMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, searchRadius, activeMode, mapAction]);

  if (!isOpen) return null;

  // Hazır Test Şablonları
  const applyPreset = (preset: {
    mode: "expertiz" | "emlak_bul";
    transactionType: "satilik" | "kiralik" | "kat_karsiligi" | "devren_satilik" | "devren_kiralik";
    mainCat: "konut" | "arsa" | "ticari" | "bina" | "turizm" | "ozel_amacli";
    subCat: string;
    deedStatus: "mustakil" | "hisseli" | "kat_mulkiyeti" | "kat_irtifaki";
    tags?: string[];
    city: string;
    dist: string;
    neigh: string;
    ada: string;
    parsel: string;
    area: number;
    nit: string;
    lat: number;
    lng: number;
  }) => {
    setActiveMode(preset.mode);
    setTransactionType(preset.transactionType);
    setMainCategory(preset.mainCat);
    setSubCategory(preset.subCat);
    setDeedStatus(preset.deedStatus);
    setSelectedTags(preset.tags || []);
    setCity(preset.city);
    setDistrict(preset.dist);
    setNeighborhood(preset.neigh);
    setAda(preset.ada);
    setParsel(preset.parsel);
    setAreaM2(preset.area);
    setTapuNiteligi(preset.nit);
    setCoords({ lat: preset.lat, lng: preset.lng });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 16);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([preset.lat, preset.lng]);
      }
      if (circleInstanceRef.current) {
        circleInstanceRef.current.setLatLng([preset.lat, preset.lng]);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanCity = city.trim() || "Çanakkale";
    const cleanDistrict = district.trim() || "Merkez";
    const cleanNeigh = neighborhood.trim() || "Kepez";

    let targetCoords = coords;

    // Koordinat henüz net değilse Nominatim üzerinden teyit et
    if (!targetCoords || (targetCoords.lat === 40.0985 && targetCoords.lng === 26.3980 && cleanCity !== "Çanakkale")) {
      try {
        const searchTarget = `${cleanNeigh}, ${cleanDistrict}, ${cleanCity}`;
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(searchTarget)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const match = data.results[0];
            if (match.lat && match.lng) {
              targetCoords = { lat: Number(match.lat), lng: Number(match.lng) };
            }
          }
        }
      } catch (err) {
        console.warn("Konum çözümlenemedi, varsayılan koordinata dönülüyor:", err);
      }
    }

    // Motor için 4 temel kategoriye eşleme
    let resolvedCategory: "konut" | "arsa" | "arazi" | "ticari" = "arsa";
    if (mainCategory === "konut" || mainCategory === "bina") {
      resolvedCategory = "konut";
    } else if (mainCategory === "ticari" || mainCategory === "turizm" || mainCategory === "ozel_amacli") {
      resolvedCategory = "ticari";
    } else if (mainCategory === "arsa") {
      if (["tarla", "bag", "bahce", "zeytinlik", "imarsiz_arazi"].includes(subCategory)) {
        resolvedCategory = "arazi";
      } else {
        resolvedCategory = "arsa";
      }
    }

    const payload: StartValuationPayload = {
      mode: activeMode,
      transactionType,
      mainCategory,
      subCategory,
      customSubCategory: showCustomSubCategory ? customSubCategory : undefined,
      deedStatus,
      tenderMethod,
      sellerType,
      tags: selectedTags,
      mapAction,
      searchRadiusMeters: searchRadius,
      category: resolvedCategory,
      city: cleanCity,
      district: cleanDistrict,
      neighborhood: cleanNeigh,
      ada: ada.trim() || "117",
      parsel: parsel.trim() || "9",
      areaM2: Number(areaM2) || 850,
      tapuNiteligi: tapuNiteligi || (subCategory === "tarla" ? "Tarla" : "İmarlı Arsa"),
      coordinates: targetCoords,
      serhStatus: serhStatus,
      listingPriceTL: activeMode === "ilan_ver" ? listingPriceTL : undefined,
      contactName: activeMode === "ilan_ver" ? contactName : undefined,
      contactPhone: activeMode === "ilan_ver" ? contactPhone : undefined,
      listingTitle: activeMode === "ilan_ver" ? listingTitle : undefined,
    };

    // İlan Ver Moduysa Kaydet ve Bildir
    if (activeMode === "ilan_ver") {
      try {
        await fetch("/api/crowdsource", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ada: ada.trim() || "117",
            parsel: parsel.trim() || "9",
            city: cleanCity,
            district: cleanDistrict,
            neighborhood: cleanNeigh,
            reportedPrice: listingPriceTL,
            userNote: `${contactName} (${contactPhone}) - ${listingTitle || "Kullanıcı İlanı"}`,
          }),
        });
      } catch (err) {
        console.warn("İlan kaydetme API hatası:", err);
      }

      onSubmit(payload);
      setIsListingPublishedSuccess(true);
      setTimeout(() => {
        setIsListingPublishedSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1500);
      return;
    }

    setIsSubmitting(false);
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ÜST BAŞLIK & 3'LÜ MOD SEÇİMİ (EXPERTİZ vs EMLAK BUL vs İLAN VER) */}
        <div className="bg-[#0B1E3B] text-white p-4 sm:p-5 relative border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Hasan Hüseyin Yıldırım Kadastro Standardı (173401031)</span>
          </div>

          {/* 3'LÜ MOD SEKMELERİ */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-700/80 mb-2">
            <button
              type="button"
              onClick={() => setActiveMode("expertiz")}
              className={`py-2 px-2 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeMode === "expertiz"
                  ? "bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate">EXPERTİZ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("emlak_bul")}
              className={`py-2 px-2 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeMode === "emlak_bul"
                  ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="truncate">EMLAK BUL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("ilan_ver")}
              className={`py-2 px-2 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeMode === "ilan_ver"
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="truncate">İLAN VER</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-300 font-medium">
            {activeMode === "expertiz" 
              ? "Taşınmazın ada, parsel, konum ve nitelik bilgilerini girerek 13 sayfalık resmi SPK/BDDK ekspertiz değerlemesini başlatın."
              : activeMode === "emlak_bul"
              ? "Belirlediğiniz ada/parsel veya harita radar yarıçapı içindeki satılık/kiralık ilan ve emsalleri listeleyin."
              : "Taşınmazınızı İhaleciBurada platformunda ilan olarak yayınlayın ve portföyünüze ekleyin."}
          </p>
        </div>

        {/* FORM GÖVDESİ */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 font-sans">
          
          {/* İLAN VER MODU ÖZEL ALANLARI */}
          {activeMode === "ilan_ver" && (
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span>İlan Yayın Bilgileri</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-300">
                  İhaleciBurada Portföyü
                </span>
              </div>

              {/* İhaleciBurada Bağlı Hesap Rozeti */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0B1E3B] text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs font-black shrink-0">
                    AT
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>Yayıncı Hesap: <strong>Ali Turan</strong></span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">Pro Profil</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500">İlanınız doğrudan İhaleciBurada kurumsal hesabınızdan yayınlanacaktır</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Bağlı Hesap</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    Talep Edilen Satış Fiyatı (₺) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={listingPriceTL}
                    onChange={(e) => setListingPriceTL(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono font-black text-blue-950 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    İletişim Ad Soyad <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    placeholder="Ali Turan"
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                    İletişim Telefonu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                    placeholder="05XX XXX XX XX"
                    className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  İlan Başlığı / Açıklaması
                </label>
                <input
                  type="text"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  placeholder="Örn: Kepez Merkezde Deniz Manzaralı 135 m² İmarlı Arsa Fırsatı"
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* 1. İŞLEM TÜRÜ (SATILIK, KİRALIK, KAT KARŞILIĞI VB.) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>1. İşlem Türü</span>
              </label>
              <span className="text-[10px] text-slate-500 font-bold">
                Satılık, Kiralık veya Devren
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Üst Satır: Temel İşlemler */}
              <div className="grid grid-cols-3 gap-1.5">
                {TRANSACTION_TYPES.slice(0, 3).map((item) => {
                  const isSelected = transactionType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTransactionType(item.id as any)}
                      className={`py-2 px-1.5 rounded-lg border text-xs font-black transition cursor-pointer text-center whitespace-nowrap flex items-center justify-center ${
                        isSelected
                          ? "border-[#0B1E3B] bg-[#0B1E3B] text-amber-400 shadow-xs ring-1 ring-[#0B1E3B]"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Alt Satır: Devren İşlemler */}
              <div className="grid grid-cols-2 gap-1.5">
                {TRANSACTION_TYPES.slice(3).map((item) => {
                  const isSelected = transactionType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTransactionType(item.id as any)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-black transition cursor-pointer text-center whitespace-nowrap flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "border-[#0B1E3B] bg-[#0B1E3B] text-amber-400 shadow-xs ring-1 ring-[#0B1E3B]"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-400" : "bg-slate-400"}`}></span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. ANA KATEGORİ (6 STANDART TAŞINMAZ TÜRÜ) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>2. Taşınmaz Ana Türü</span>
              </label>
              <span className="text-[10px] text-slate-400 font-bold">6 Temel Kategori</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(REAL_ESTATE_TAXONOMY).map((cat) => {
                const isSelected = mainCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setMainCategory(cat.id as any);
                      setShowCustomSubCategory(false);
                      const firstSub = cat.subCategories[0];
                      if (firstSub) {
                        setSubCategory(firstSub.id);
                        setTapuNiteligi(firstSub.tapuNitelikDefault || firstSub.label);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                      isSelected
                        ? "border-amber-500 bg-[#0B1E3B] text-amber-400 shadow-sm ring-1 ring-amber-500"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? "bg-amber-400/20 text-amber-400" : "bg-slate-100 text-slate-600"}`}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">{cat.label}</div>
                      <div className={`text-[10px] ${isSelected ? "text-amber-200/80" : "text-slate-400"} truncate`}>
                        {cat.subCategories.length} alt tür
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. DİNAMİK ALT KATEGORİ (SEÇİLİ TAŞINMAZ TÜRÜNE GÖRE) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>3. Alt Kategori ({REAL_ESTATE_TAXONOMY[mainCategory]?.label || "Seçim"})</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCustomSubCategory(!showCustomSubCategory)}
                className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
              >
                + Elle Girilsin
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {REAL_ESTATE_TAXONOMY[mainCategory]?.subCategories.map((sub) => {
                const isSelected = subCategory === sub.id && !showCustomSubCategory;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSubCategory(sub.id);
                      setShowCustomSubCategory(false);
                      setTapuNiteligi(sub.tapuNitelikDefault || sub.label);
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition cursor-pointer text-center truncate ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-black ring-1 ring-emerald-600"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                    title={sub.label}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Elle Girilsin Kutusu */}
            {showCustomSubCategory && (
              <div className="mt-2.5 animate-in fade-in duration-150">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Elle Girilsin (Özel Alt Tür / Tapu Niteliği)
                </label>
                <input
                  type="text"
                  value={customSubCategory}
                  onChange={(e) => {
                    setCustomSubCategory(e.target.value);
                    setTapuNiteligi(e.target.value);
                  }}
                  placeholder="Örn: Zeytinlikli Tarla, Fabrika Binası, Çiftlik Evi vb."
                  className="w-full px-3 py-1.5 bg-white border border-emerald-400 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            )}
          </div>

          {/* 4. TAPU VE HİSSE DURUMU (MÜLKİYET DURUMU) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>4. Tapu ve Hisse Durumu</span>
              </label>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
                Taşınmaz türü değil, mülkiyet durumudur
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DEED_STATUS_OPTIONS.map((item) => {
                const isSelected = deedStatus === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDeedStatus(item.id as any)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition cursor-pointer text-center ${
                      isSelected
                        ? "border-purple-600 bg-purple-50 text-purple-950 font-black ring-1 ring-purple-600 shadow-2xs"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. TEKLİF YÖNTEMİ & İLAN VEREN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                Teklif / Satış Yöntemi
              </label>
              <div className="grid grid-cols-3 gap-1">
                {TENDER_METHODS.map((tm) => (
                  <button
                    key={tm.id}
                    type="button"
                    onClick={() => setTenderMethod(tm.id as any)}
                    className={`py-1.5 px-1 rounded-lg border text-[11px] font-bold transition cursor-pointer text-center truncate ${
                      tenderMethod === tm.id
                        ? "border-[#0B1E3B] bg-[#0B1E3B] text-amber-400 font-black shadow-2xs"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tm.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block">
                İlan Veren / Satıcı Türü
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {SELLER_TYPES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSellerType(st.id as any)}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold transition cursor-pointer text-center truncate ${
                      sellerType === st.id
                        ? "border-[#0B1E3B] bg-[#0B1E3B] text-amber-400 font-black shadow-2xs"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                    title={st.label}
                  >
                    {st.label.replace(" (Belediye / İcra / Banka)", "")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. ÖZELLİKLER & FİLTRE ETİKETLERİ */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Özellik Etiketleri</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold">
                &quot;Denize Yakın&quot;, &quot;Yatırımlık&quot; vb. özellik filtreleridir
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TAGS.map((tag) => {
                const isChecked = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`py-1 px-2.5 rounded-full border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isChecked
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-black"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. KİRALIK / SATILIK AYNI MENÜ (LOKASYON BİLGİSİ: İL, İLÇE, MAHALLE, ADA, PARSEL) */}
          <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200 space-y-2.5">
            <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Kiralık / Satılık Konum & Kadastro Bilgileri</span>
              </span>
              <div className="flex items-center gap-1.5">
                {/* 📍 GPS İle Otomatik Konum Doldur Butonu */}
                <button
                  type="button"
                  onClick={handleAutoLocateGPS}
                  disabled={isAutoLocating}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                  title="Mevcut GPS konumunuzdan İl, İlçe ve Köy/Mahalle bilgilerini otomatik doldurun"
                >
                  <Crosshair className={`w-3 h-3 text-amber-600 ${isAutoLocating ? "animate-spin" : ""}`} />
                  <span>{isAutoLocating ? "Konum Alınıyor..." : "📍 Konumumu Bul (Otomatik)"}</span>
                </button>

                {/* 🏛️ TKGM Parsel Sorgu Butonu */}
                <button
                  type="button"
                  onClick={handleOpenTkgm}
                  className="px-2.5 py-1 bg-[#0B1E3B] hover:bg-slate-900 text-amber-400 border border-amber-500/40 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                  title="Resmi TKGM Parsel Sorgu uygulamasında aç"
                >
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                  <span>🏛️ TKGM Parsel Sorgu</span>
                </button>
              </div>
            </div>

            {tkgmCopiedToast && (
              <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tkgmCopiedToast}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* İL */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  İL <span className="text-rose-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-amber-600 transition"
                >
                  {provinceList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* İLÇE */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  İLÇE <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-amber-600 transition"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* MAHALLE / KÖY */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  MAHALLE / KÖY <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Örn: Kepez"
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-amber-600 transition"
                />
              </div>

              {/* ADA */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  ADA (YAZ) <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  value={ada}
                  onChange={(e) => setAda(e.target.value)}
                  placeholder="Örn: 117"
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-black text-amber-800 outline-none focus:border-amber-600 transition"
                />
              </div>

              {/* PARSEL */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  PARSEL (YAZ) <span className="text-amber-700">*</span>
                </label>
                <input
                  type="text"
                  value={parsel}
                  onChange={(e) => setParsel(e.target.value)}
                  placeholder="Örn: 9"
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-black text-amber-800 outline-none focus:border-amber-600 transition"
                />
              </div>

              {/* ALAN m² */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">
                  ALAN (m²) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value))}
                  placeholder="Örn: 850"
                  required
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-black text-slate-900 outline-none focus:border-amber-600 transition"
                />
              </div>
            </div>
          </div>

          {/* 4. TAPU ŞERH / İPOTEK DURUMU (ALICI / TAPU SORGUSU) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                <span>Tapu Şerh & İpotek Durumu (Alıcı / Tapu Sorgusu)</span>
              </label>
              <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Tapudan Sorulacak
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { id: "tapudan_sorulacak", label: "Tapu Müdürlüğü'nden Sorulacak (Tavsiye)" },
                { id: "temiz", label: "Şerh / İpotek Yok (Temiz Beyan)" },
                { id: "ipotek_var", label: "İpotek / Banka Rehinli" },
                { id: "haciz_serh_var", label: "Haciz / Dava / İcra Şerhli" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSerhStatus(item.id as any)}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition cursor-pointer text-left flex items-center justify-between ${
                    serhStatus === item.id
                      ? "border-[#0B1E3B] bg-[#0B1E3B] text-white shadow-2xs"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {serhStatus === item.id && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic">
              * Tapu takyidatları ve şerh durumu yalnızca e-Devlet Web-Tapu sistemi veya ilgili Tapu Müdürlüğü üzerinden resmi olarak teyit edilir.
            </p>
          </div>

          {/* 5. HARİTADA KENDİN SEÇ & PARSEL POLİGONU & RADAR ÇEMBERİ */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Haritada Kendin Seç & Kadastro Poligonu
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            </div>

            {/* Harita Konteyneri */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-44 sm:h-52 rounded-lg overflow-hidden border border-slate-700 relative z-10 isolate"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 italic mt-1.5">
              <span>* Haritada ada/parsel poligonu sarı sınırla, arama radarı yeşil çemberle gösterilir.</span>
              <span className="font-mono text-amber-400 font-bold">{ada} Ada / {parsel} Parsel</span>
            </div>

            {/* ARAMA YARIÇAPI (RADAR SEÇİCİ) */}
            {(activeMode === "emlak_bul" || mapAction === "ilanlari_bul") && (
              <div className="mt-3 pt-3 border-t border-slate-800 animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Arama Radar Yarıçapı (Çap Seçimi)</span>
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-300">
                    {searchRadius >= 1000 ? `${searchRadius / 1000} km` : `${searchRadius} m`}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 500, label: "500 m" },
                    { val: 1000, label: "1 km" },
                    { val: 3000, label: "3 km" },
                    { val: 5000, label: "5 km" },
                  ].map((r) => {
                    const isSelected = searchRadius === r.val;
                    return (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setSearchRadius(r.val)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-mono font-black border transition cursor-pointer text-center ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                            : "bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* HARİTA AKSİYON SEÇENEKLERİ (İŞARETLE vs BU ALAN İÇİNDEKİ İLANLARI BUL LİSTELE) */}
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <label 
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition cursor-pointer ${
                  mapAction === "isaretle"
                    ? "bg-amber-500/10 border-amber-500/60 text-amber-300 font-bold"
                    : "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="mapAction"
                  value="isaretle"
                  checked={mapAction === "isaretle"}
                  onChange={() => setMapAction("isaretle")}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs">İŞARETLE (Bu Noktayı Değerlemeye Al)</span>
              </label>

              <label 
                className={`flex items-center gap-2.5 p-2 rounded-lg border transition cursor-pointer ${
                  mapAction === "ilanlari_bul"
                    ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-300 font-bold"
                    : "bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="mapAction"
                  value="ilanlari_bul"
                  checked={mapAction === "ilanlari_bul"}
                  onChange={() => setMapAction("ilanlari_bul")}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs">BU ALAN İÇİNDEKİ SATILIK / KİRALIK İLANLARI BUL & LİSTELE</span>
              </label>
            </div>
          </div>

          {/* 5. HIZLI TEST ÖRNEKLERİ */}
          <div className="pt-1">
            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Hızlı Test Örneği (Hasan Bey Çanakkale Portföyü):</span>
            </div>
            <button
              type="button"
              onClick={() => applyPreset({
                mode: "expertiz",
                transactionType: "satilik",
                mainCat: "arsa",
                subCat: "konut_imarli",
                deedStatus: "mustakil",
                tags: ["yatirimlik"],
                city: "Çanakkale",
                dist: "Merkez",
                neigh: "Kepez",
                ada: "117",
                parsel: "9",
                area: 135,
                nit: "İmarlı Arsa",
                lat: 40.0985,
                lng: 26.3980,
              })}
              className="text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 border border-slate-200 text-[11px] text-slate-700 transition cursor-pointer flex items-center justify-between w-full"
            >
              <span>🏛️ <strong>Çanakkale Kepez</strong> (117 Ada / 9 Parsel - 135 m² Konut İmarlı Arsa)</span>
              <span className="text-amber-700 font-bold text-[10px]">Doldur ➔</span>
            </button>
          </div>

          {/* BAŞARI BİLDİRİMİ */}
          {isListingPublishedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in zoom-in-95">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ İlanınız İhaleciBurada hesabınızdan (Ali Turan) başarıyla yayınlandı ve haritada listelendi!</span>
            </div>
          )}

          {/* BUTONLAR */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95 ${
                activeMode === "ilan_ver"
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-700/20"
                  : activeMode === "emlak_bul" || mapAction === "ilanlari_bul"
                  ? "bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-700/20"
                  : "bg-linear-to-r from-[#0B1E3B] via-[#0F284E] to-amber-600 hover:from-[#0B1E3B] hover:to-amber-500 shadow-slate-900/30"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>İşleniyor...</span>
                </>
              ) : activeMode === "ilan_ver" ? (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>İhaleciBurada Hesabından İlanı Yayınla</span>
                </>
              ) : activeMode === "emlak_bul" || mapAction === "ilanlari_bul" ? (
                <>
                  <Search className="w-4 h-4" />
                  <span>Bu Alandaki İlanları Bul ve Listele ({searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`})</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Resmi Ekspertiz Değerlemesini Başlat</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
