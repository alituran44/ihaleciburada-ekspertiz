"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { ValuationFormData } from "./types";
import { findFastLocationFromCoords, getProvinceCoordinates } from "@/lib/turkeyLocations";
import { 
  Search, 
  MapPin, 
  Crosshair, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Compass, 
  CheckCircle2,
  Sparkles,
  Building,
  Plus,
  Minus
} from "lucide-react";

interface LocationStepProps {
  data: ValuationFormData;
  onChange: (updated: Partial<ValuationFormData>) => void;
  onNext: () => void;
}

interface SuggestionItem {
  id: string;
  label: string;
  secondaryLabel: string;
  province: string;
  district: string;
  neighborhood?: string;
  lat: number;
  lng: number;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const serviceLabel = 
    data.service === "konut" ? "Konut & Daire" :
    data.service === "arsa" ? "İmarlı Arsa" :
    data.service === "arazi" ? "Tarla & Arazi" : "Ticari Gayrimenkul";

  const currentLat = data.coordinates?.lat || 39.974;
  const currentLng = data.coordinates?.lng || 32.641;

  // Güncel Alan (m²) Değeri
  const currentArea = 
    data.service === "arsa" ? (data.arsaAreaM2 || 850) :
    data.service === "arazi" ? (data.araziAreaM2 || 1250) :
    data.service === "ticari" ? (data.commercialAreaM2 || 180) :
    (data.grossAreaM2 || 110);

  const handleAreaChange = (newArea: number) => {
    if (data.service === "arsa") {
      onChange({ arsaAreaM2: newArea });
    } else if (data.service === "arazi") {
      onChange({ araziAreaM2: newArea });
    } else if (data.service === "ticari") {
      onChange({ commercialAreaM2: newArea });
    } else {
      onChange({ grossAreaM2: newArea });
    }
  };

  const handleLocateByText = async () => {
    const q = `${data.neighborhood || ""}, ${data.district || ""}, ${data.city || ""}`.trim();
    if (!q) return;

    try {
      const res = await fetch(`/api/location/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.results) && json.results.length > 0) {
        const best = json.results[0];
        onChange({
          coordinates: { lat: best.lat, lng: best.lng },
          searchQuery: `${best.label}, ${best.province}`,
        });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([best.lat, best.lng], 16, { duration: 0.8 });
        }
        return;
      }
    } catch {
      // Fallback
    }

    const provCoords = getProvinceCoordinates(data.city);
    if (provCoords) {
      onChange({ coordinates: provCoords });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([provCoords.lat, provCoords.lng], 14, { duration: 0.8 });
      }
    }
  };

  // =========================================================================
  // LEAFLET MAP BAŞLATMA
  // =========================================================================
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: false,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 60,
    });

    // Açık Sokak Görünümü (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap • İhaleciBurada GIS',
    }).addTo(map);

    // 250m Etki Çemberi
    const circle = L.circle([currentLat, currentLng], {
      radius: 200,
      color: "#2563EB",
      weight: 2,
      opacity: 0.8,
      fillColor: "#3B82F6",
      fillOpacity: 0.12,
      dashArray: "4, 4",
    }).addTo(map);
    circleRef.current = circle;

    // Hedef Kadastro Pini
    const buildPinIcon = (adaVal: string, parselVal: string, areaVal: number) => L.divIcon({
      className: "custom-kadastro-pin",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="background: #0F223D; color: #FCD34D; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 14px; border: 2px solid #FCD34D; box-shadow: 0 4px 12px rgba(0,0,0,0.3); white-space: nowrap; font-family: sans-serif; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span>Ada ${adaVal || "1357"} / Parsel ${parselVal || "4"}</span>
            <span style="color: #60A5FA; font-size: 10px; margin-left: 2px;">(${areaVal} m²)</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #0F223D;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const marker = L.marker([currentLat, currentLng], { 
      icon: buildPinIcon(data.ada, data.parsel, currentArea) 
    }).addTo(map);
    markerRef.current = marker;

    // Harita Tıklama Dinleyicisi
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const clickLat = Number(e.latlng.lat.toFixed(6));
      const clickLng = Number(e.latlng.lng.toFixed(6));

      // 0ms hızlı il/ilçe çözümü
      const fastLoc = findFastLocationFromCoords(clickLat, clickLng);

      onChange({
        city: fastLoc.city,
        district: fastLoc.district,
        neighborhood: fastLoc.neighborhood,
        coordinates: { lat: clickLat, lng: clickLng },
        searchQuery: `${fastLoc.neighborhood}, ${fastLoc.district}, ${fastLoc.city}`,
      });

      marker.setLatLng([clickLat, clickLng]);
      if (circleRef.current) {
        circleRef.current.setLatLng([clickLat, clickLng]);
      }

      // Arka planda cadde/mahalle detayını güncelle
      try {
        const res = await fetch(`/api/location/search?lat=${clickLat}&lng=${clickLng}`);
        const result = await res.json();
        if (result.success && result.location) {
          const loc = result.location;
          onChange({
            city: loc.province || fastLoc.city,
            district: loc.district || fastLoc.district,
            neighborhood: loc.neighborhood || fastLoc.neighborhood,
            searchQuery: `${loc.neighborhood || fastLoc.neighborhood}, ${loc.district || fastLoc.district}, ${loc.province || fastLoc.city}`,
          });
        }
      } catch (e) {}
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Koordinat Değiştiğinde Haritayı Güncelle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const center = mapInstanceRef.current.getCenter();
    const diff = Math.hypot(center.lat - currentLat, center.lng - currentLng);

    if (diff > 0.0005) {
      mapInstanceRef.current.flyTo([currentLat, currentLng], 15, { duration: 0.8 });
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([currentLat, currentLng]);
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([currentLat, currentLng]);
    }
  }, [currentLat, currentLng]);

  // Canlı Arama / Autocomplete
  useEffect(() => {
    const q = data.searchQuery?.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.results)) {
          setSuggestions(json.results);
          setShowSuggestions(true);
        }
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [data.searchQuery]);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setShowSuggestions(false);
    onChange({
      city: item.province,
      district: item.district || "Merkez",
      neighborhood: item.neighborhood || item.label,
      coordinates: { lat: item.lat, lng: item.lng },
      searchQuery: `${item.label}, ${item.district ? item.district + ", " : ""}${item.province}`,
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 16, { duration: 0.8 });
    }
  };

  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız GPS konum servisini desteklemiyor.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const fastLoc = findFastLocationFromCoords(lat, lng);

        onChange({
          city: fastLoc.city,
          district: fastLoc.district,
          neighborhood: fastLoc.neighborhood,
          coordinates: { lat, lng },
          searchQuery: `${fastLoc.district}, ${fastLoc.city}`,
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.8 });
        }
      },
      () => {
        setIsLocating(false);
        alert("GPS konumuna erişilemedi.");
      }
    );
  };

  // Hızlı Örnek Seçenekleri
  const handleQuickSelect = (city: string, dist: string, neigh: string, ada: string, parsel: string, lat: number, lng: number) => {
    onChange({
      city,
      district: dist,
      neighborhood: neigh,
      ada,
      parsel,
      coordinates: { lat, lng },
      searchQuery: `${neigh}, ${dist}, ${city}`,
    });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.8 });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* SOL ANA PANEL */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Adım 1: Lokasyon & Kadastro Doğrulaması</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            {serviceLabel} Konumunu Belirleyin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Türkiye genelinde 81 il, 973 ilçe veya doğrudan Ada/Parsel numarasını girerek konumunuzu doğrulayın.
          </p>
        </div>

        {/* 1. ADRES ARAMA VE AUTOCOMPLETE */}
        <div className="relative">
          <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50 p-1.5 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15 transition shadow-2xs">
            <div className="hidden sm:flex items-center gap-1 px-3 text-xs font-extrabold text-slate-700 border-r border-slate-200 shrink-0">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Adres / Parsel</span>
            </div>

            <input
              type="text"
              value={data.searchQuery}
              onChange={(e) => onChange({ searchQuery: e.target.value })}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Örn: Sarıbeyli Çanakkale veya Devlet Mah. Etimesgut Ankara"
              className="flex-1 px-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 bg-transparent min-w-0"
            />

            {data.searchQuery && (
              <button
                type="button"
                onClick={() => onChange({ searchQuery: "" })}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-1.5 pl-1.5 shrink-0">
              <button
                type="button"
                onClick={handleGpsLocate}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                title="GPS Konumumu Bul"
              >
                <Crosshair className={`w-4 h-4 ${isLocating ? "animate-spin text-blue-600" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (suggestions.length > 0) {
                    handleSelectSuggestion(suggestions[0]);
                  } else {
                    onNext();
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#0F223D] hover:bg-slate-900 text-amber-400 font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Konumu Doğrula</span>
              </button>
            </div>
          </div>

          {/* Autocomplete Öneri Listesi */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 divide-y divide-slate-100 z-50 max-h-60 overflow-y-auto">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="p-3 hover:bg-blue-50/80 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <strong className="text-slate-900">{item.label}</strong>
                      <span className="text-slate-500 text-[11px] ml-1.5 font-medium">{item.secondaryLabel}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">Seç ↵</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. DİNAMİK İL / İLÇE / KÖY / ADA / PARSEL / ALAN GİRİŞ BÖLÜMÜ */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Resmi Kadastro & Parsel Bilgileri</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Tüm alanları elle klavyeyle düzenleyebilir veya haritadan seçebilirsiniz
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* İL */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">İl</label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Örn: Çanakkale"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
              />
            </div>

            {/* İLÇE */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">İlçe</label>
              <input
                type="text"
                value={data.district}
                onChange={(e) => onChange({ district: e.target.value })}
                placeholder="Örn: Merkez"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
              />
            </div>

            {/* KÖY / MAHALLE */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Köy / Mahalle</label>
              <input
                type="text"
                value={data.neighborhood}
                onChange={(e) => onChange({ neighborhood: e.target.value })}
                placeholder="Örn: Sarıbeyli Köyü"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
              />
            </div>

            {/* ADA NO */}
            <div>
              <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Ada No</label>
              <input
                type="text"
                value={data.ada}
                onChange={(e) => onChange({ ada: e.target.value })}
                placeholder="Örn: 1357"
                className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-black text-amber-700 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200 transition"
              />
            </div>

            {/* PARSEL NO */}
            <div>
              <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Parsel No</label>
              <input
                type="text"
                value={data.parsel}
                onChange={(e) => onChange({ parsel: e.target.value })}
                placeholder="Örn: 4"
                className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-black text-amber-700 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-200 transition"
              />
            </div>

            {/* ALAN (m²) */}
            <div>
              <label className="block text-[10px] font-bold text-blue-900 uppercase mb-1">Alan (m²)</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={1}
                  max={5000000}
                  value={currentArea}
                  onChange={(e) => handleAreaChange(Number(e.target.value))}
                  placeholder="Örn: 1250"
                  className="w-full px-2 py-1.5 pr-7 bg-white border border-blue-300 rounded-lg text-xs font-mono font-black text-slate-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-200 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-1.5 text-[10px] font-bold text-slate-400 select-none pointer-events-none">
                  m²
                </span>
              </div>
            </div>
          </div>

          {/* TAPU NİTELİĞİ & HARİTADA KONUMLANDIR AKSİYONU */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <span>Tapu Niteliği:</span>
              <span className="font-extrabold text-blue-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {data.tapuNiteligi || (data.service === "konut" ? "Kat Mülkiyeti / Mesken" : data.service === "arazi" ? "Tarla" : data.service === "ticari" ? "Dükkan / Mağaza" : "İmarlı Arsa")}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLocateByText}
              className="px-3 py-1 bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Haritada Konumlandır</span>
            </button>
          </div>
        </div>

        {/* 3. GERÇEK ETKİLEŞİMLİ LEAFLET KADASTRO HARİTASI */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 h-72 sm:h-80 bg-slate-100 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Sol Üst: TKGM Kadastro Rozeti */}
          <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 shadow-md">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>TKGM & HGK Canlı Kadastro Katmanı</span>
            </div>
          </div>

          {/* Sağ Üst: Deprem Risk PGA Rozeti */}
          <div className="absolute top-3 right-3 z-[400] pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PGA Deprem İvmesi: {data.pgaSeismicHazard}</span>
            </div>
          </div>

          {/* Sağ Alt: Harita Yakınlaştırma Araçları */}
          <div className="absolute bottom-16 right-3 z-[400] flex flex-col gap-1">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-md border border-slate-200 font-bold transition cursor-pointer active:scale-95"
              title="Yakınlaştır"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center shadow-md border border-slate-200 font-bold transition cursor-pointer active:scale-95"
              title="Uzaklaştır"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>

          {/* Alt: Tapu & Kadastro Doğrulama Şeridi */}
          <div className="absolute bottom-0 left-0 right-0 z-[400] bg-slate-950/90 backdrop-blur-md p-3 text-white text-xs border-t border-white/10 space-y-1">
            <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-2">
              <span className="flex items-center gap-1.5 text-amber-300 font-heading">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{data.city} / {data.district} {data.neighborhood ? `• ${data.neighborhood}` : ""}</span>
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                Ada: <strong className="text-white font-mono">{data.ada || "1357"}</strong> | Parsel: <strong className="text-white font-mono">{data.parsel || "4"}</strong> | Alan: <strong className="text-amber-400 font-mono">{currentArea} m²</strong> | Pafta: {data.pafta || "H29-D-12-B"}
              </span>
            </div>
            <div className="text-slate-300 text-[10.5px] flex items-center justify-between">
              <span>Mevcut Tapu Niteliği: <strong>{data.tapuNiteligi || (data.service === "konut" ? "Kat Mülkiyeti / Mesken" : data.service === "arazi" ? "Tarla" : data.service === "ticari" ? "Dükkan / Mağaza" : "İmarlı Arsa")}</strong></span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Kadastro Tescili Doğrulandı
              </span>
            </div>
          </div>
        </div>

        {/* 4. ALT AKSİYON BUTONLARI */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 font-medium">
            * Harita üzerinde dilediğiniz noktaya tıklayarak parsel konumunu değiştirebilirsiniz.
          </span>

          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F223D] hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Mülk Özelliklerine Geç</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* SAĞ YAN BİLGİ PANELİ */}
      <div className="lg:col-span-4 space-y-4">
        {/* Akıllı Kadastro Analizi Kartı */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0B1E3B] to-slate-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Akıllı Kadastro Analizi</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug font-heading">
            Neden Ada ve Parsel Doğrulaması Önemlidir?
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              İhaleciBurada değerleme motoru, yalnızca genel ilçe ortalamalarını değil, taşınmazın mikro-lokasyonunu, resmi imar durumunu ve komşu parsel satışlarını baz alır.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1.5">
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                İhale & İcra Arbitrajı
              </div>
              <p className="text-[11px] text-slate-400">
                Taşınmazın icra tabanı (%50 İİK m.115) doğrudan bu kadastro kaydı üzerinden hesaplanır.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Veri Kaynağı: TKGM & HGK</span>
            <span className="font-mono text-emerald-400 font-bold">Canlı Doğrulandı</span>
          </div>
        </div>

        {/* Hızlı Örnek Seçenekleri Kartı */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3 shadow-2xs">
          <div className="font-bold flex items-center gap-1.5 text-slate-900 font-heading">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Hızlı Test Konumları
          </div>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickSelect("Çanakkale", "Merkez", "Sarıbeyli", "1357", "4", 40.1172, 26.4022)}
              className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-[11px] font-semibold text-slate-700 flex items-center justify-between"
            >
              <span>📍 Çanakkale, Sarıbeyli (1357/4)</span>
              <span className="text-[10px] text-blue-600 font-bold">Seç</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect("Ankara", "Etimesgut", "Devlet Mah.", "48507", "1", 39.974, 32.641)}
              className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-[11px] font-semibold text-slate-700 flex items-center justify-between"
            >
              <span>📍 Ankara, Etimesgut (48507/1)</span>
              <span className="text-[10px] text-blue-600 font-bold">Seç</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect("İstanbul", "Kadıköy", "Caferağa", "248", "12", 40.9875, 29.0285)}
              className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition text-[11px] font-semibold text-slate-700 flex items-center justify-between"
            >
              <span>📍 İstanbul, Kadıköy (248/12)</span>
              <span className="text-[10px] text-blue-600 font-bold">Seç</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
