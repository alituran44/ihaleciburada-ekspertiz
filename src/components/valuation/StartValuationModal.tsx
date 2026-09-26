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
  Navigation
} from "lucide-react";
import { TURKEY_PROVINCES_AND_DISTRICTS, getProvinceCoordinates, getDistrictCoordinates } from "@/lib/turkeyLocations";

export interface StartValuationPayload {
  mode: "expertiz" | "emlak_bul";
  mainCategory: "satilik" | "kiralik" | "takas" | "diger";
  customMainCategory?: string;
  subCategory: string;
  customSubCategory?: string;
  mapAction: "isaretle" | "ilanlari_bul";
  category: "konut" | "arsa" | "arazi" | "ticari";
  city: string;
  district: string;
  neighborhood: string;
  ada: string;
  parsel: string;
  areaM2: number;
  tapuNiteligi: string;
  coordinates?: { lat: number; lng: number };
}

interface StartValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: StartValuationPayload) => void;
  initialMode?: "expertiz" | "emlak_bul";
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
  // 1. Mod Seçimi (EXPERTİZ vs EMLAK BUL)
  const [activeMode, setActiveMode] = useState<"expertiz" | "emlak_bul">(initialMode);

  // 2. Ana Kategori (Gayrimenkul İlanı)
  const [mainCategory, setMainCategory] = useState<"satilik" | "kiralik" | "takas" | "diger">("satilik");
  const [customMainCategory, setCustomMainCategory] = useState<string>("");
  const [showCustomMainCategory, setShowCustomMainCategory] = useState<boolean>(false);

  // 3. Alt Kategori (Arsa Niteliği)
  const [subCategory, setSubCategory] = useState<string>("konut_imarli");
  const [customSubCategory, setCustomSubCategory] = useState<string>("");
  const [showCustomSubCategory, setShowCustomSubCategory] = useState<boolean>(false);

  // 4. Kiralık / Satılık Aynı Menü (Lokasyon & Ada / Parsel)
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [neighborhood, setNeighborhood] = useState(initialNeighborhood);
  const [ada, setAda] = useState(initialAda);
  const [parsel, setParsel] = useState(initialParsel);
  const [areaM2, setAreaM2] = useState(initialAreaM2);
  const [tapuNiteligi, setTapuNiteligi] = useState("İmarlı Arsa");

  // 5. Haritada Kendin Seç & İşlem Seçimi
  const [mapAction, setMapAction] = useState<"isaretle" | "ilanlari_bul">(
    initialMode === "emlak_bul" ? "ilanlari_bul" : "isaretle"
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 40.0985,
    lng: 26.3980,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Leaflet Harita Referansları
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

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

  // Harita Başlatma & Yenileme (Client-Side Dynamic Leaflet)
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

      // Özel Kehribar / Kırmızı Rozet İkonu
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

      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      markerInstanceRef.current = marker;
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
  }, [isOpen]);

  if (!isOpen) return null;

  // Hazır Test Şablonları
  const applyPreset = (preset: {
    mode: "expertiz" | "emlak_bul";
    mainCat: "satilik" | "kiralik" | "takas" | "diger";
    subCat: string;
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
    setMainCategory(preset.mainCat);
    setSubCategory(preset.subCat);
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

    setIsSubmitting(false);

    // Kategori eşleştirme
    const resolvedCategory: "konut" | "arsa" | "arazi" | "ticari" = 
      subCategory === "konut_imarli" ? "arsa" :
      subCategory === "isyeri_imarli" ? "arsa" :
      subCategory === "tarla" || subCategory === "zeytinlik" || subCategory === "meyvelik" ? "arazi" : "arsa";

    onSubmit({
      mode: activeMode,
      mainCategory,
      customMainCategory: showCustomMainCategory ? customMainCategory : undefined,
      subCategory,
      customSubCategory: showCustomSubCategory ? customSubCategory : undefined,
      mapAction,
      category: resolvedCategory,
      city: cleanCity,
      district: cleanDistrict,
      neighborhood: cleanNeigh,
      ada: ada.trim() || "117",
      parsel: parsel.trim() || "9",
      areaM2: Number(areaM2) || 850,
      tapuNiteligi: tapuNiteligi || (subCategory === "tarla" ? "Tarla" : "İmarlı Arsa"),
      coordinates: targetCoords,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ÜST BAŞLIK & MOD SEÇİMİ (EXPERTİZ vs EMLAK BUL) */}
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

          {/* İKİLİ MOD SEKMELERİ: EXPERTİZ vs EMLAK BUL */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-xl border border-slate-700/80 mb-2">
            <button
              type="button"
              onClick={() => setActiveMode("expertiz")}
              className={`py-2 px-3 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === "expertiz"
                  ? "bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>EXPERTİZ (ARSA İÇİN)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("emlak_bul")}
              className={`py-2 px-3 rounded-lg text-xs font-black tracking-wide flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === "emlak_bul"
                  ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>EMLAK BUL (ARSA İÇİN)</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-300 font-medium">
            {activeMode === "expertiz" 
              ? "Taşınmazın ada, parsel, konum ve nitelik bilgilerini girerek 13 sayfalık resmi SPK/BDDK ekspertiz değerlemesini başlatın."
              : "Belirlediğiniz ada/parsel veya haritada işaretlediğiniz alan içerisindeki satılık/kiralık ilan ve emsalleri listeleyin."}
          </p>
        </div>

        {/* FORM GÖVDESİ */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 font-sans">
          
          {/* 1. ANA KATEGORİ (GAYRİMENKUL İLANI) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Ana Kategori (Gayrimenkul İlanı)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-bold">Hasan Bey Şablonu</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "satilik", label: "SATILIK" },
                { id: "kiralik", label: "KİRALIK" },
                { id: "takas", label: "TAKAS" },
                { id: "diger", label: "DİĞER" },
              ].map((item) => {
                const isSelected = mainCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMainCategory(item.id as any);
                      setShowCustomMainCategory(item.id === "diger");
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-black transition cursor-pointer text-center ${
                      isSelected
                        ? "border-[#0B1E3B] bg-[#0B1E3B] text-amber-400 shadow-2xs"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Elle Girilsin Kutusu */}
            {(showCustomMainCategory || mainCategory === "diger") && (
              <div className="mt-2.5 animate-in fade-in duration-150">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Elle Girilsin (Özel İlan Türü)
                </label>
                <input
                  type="text"
                  value={customMainCategory}
                  onChange={(e) => setCustomMainCategory(e.target.value)}
                  placeholder="Örn: Kat Karşılığı Satış, Devren, İpotekli İhale vb."
                  className="w-full px-3 py-1.5 bg-white border border-amber-400 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            )}
          </div>

          {/* 2. ALT KATEGORİ (ARSA NİTELİĞİ) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Alt Kategori (Arsa Niteliği)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCustomSubCategory(!showCustomSubCategory)}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                + Elle Girilsin
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: "konut_imarli", label: "KONUT İMARLI" },
                { id: "isyeri_imarli", label: "İŞYERİ İMARLI" },
                { id: "tarla", label: "TARLA" },
                { id: "zeytinlik", label: "ZEYTİNLİK" },
                { id: "meyvelik", label: "MEYVELİK" },
                { id: "diger", label: "DİĞER" },
              ].map((item) => {
                const isSelected = subCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSubCategory(item.id);
                      setTapuNiteligi(item.label);
                      if (item.id === "diger") {
                        setShowCustomSubCategory(true);
                      }
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-black transition cursor-pointer text-center ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Elle Girilsin Kutusu */}
            {showCustomSubCategory && (
              <div className="mt-2.5 animate-in fade-in duration-150">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Elle Girilsin (Özel Arsa Niteliği)
                </label>
                <input
                  type="text"
                  value={customSubCategory}
                  onChange={(e) => {
                    setCustomSubCategory(e.target.value);
                    setTapuNiteligi(e.target.value);
                  }}
                  placeholder="Örn: Sanayi İmarlı, Bağ Evi, Hisseli Tarla vb."
                  className="w-full px-3 py-1.5 bg-white border border-emerald-400 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            )}
          </div>

          {/* 3. KİRALIK / SATILIK AYNI MENÜ (LOKASYON BİLGİSİ: İL, İLÇE, MAHALLE, ADA, PARSEL) */}
          <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-200">
            <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Kiralık / Satılık Aynı Menü (Arsa)</span>
              <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 font-bold">
                TKGM Kadastro
              </span>
            </div>

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

          {/* 4. HARİTADA KENDİN SEÇ (İNTERAKTİF LEAFLET UYDU HARİTASI) */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Haritada Kendin Seç
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
            </div>

            {/* Harita Konteyneri */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-44 sm:h-52 rounded-lg overflow-hidden border border-slate-700 relative z-10"
            />

            <div className="text-[10px] text-slate-400 italic mt-1.5">
              * Harita üzerine tıklayarak veya rozeti sürükleyerek taşınmazınızın tam koordinatını belirleyebilirsiniz.
            </div>

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
                mainCat: "satilik",
                subCat: "konut_imarli",
                city: "Çanakkale",
                dist: "Merkez",
                neigh: "Kepez",
                ada: "117",
                parsel: "9",
                area: 135,
                nit: "Kat Mülkiyeti / Mesken",
                lat: 40.0985,
                lng: 26.3980,
              })}
              className="text-left px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 border border-slate-200 text-[11px] text-slate-700 transition cursor-pointer flex items-center justify-between w-full"
            >
              <span>🏠 <strong>Çanakkale Kepez</strong> (117 Ada / 9 Parsel - 8-10M TL Rayiç)</span>
              <span className="text-amber-700 font-bold text-[10px]">Doldur ➔</span>
            </button>
          </div>

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
                activeMode === "emlak_bul" || mapAction === "ilanlari_bul"
                  ? "bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-700/20"
                  : "bg-linear-to-r from-[#0B1E3B] via-[#0F284E] to-amber-600 hover:from-[#0B1E3B] hover:to-amber-500 shadow-slate-900/30"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>İşleniyor...</span>
                </>
              ) : activeMode === "emlak_bul" || mapAction === "ilanlari_bul" ? (
                <>
                  <Search className="w-4 h-4" />
                  <span>Bu Alandaki İlanları Bul ve Listele</span>
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
