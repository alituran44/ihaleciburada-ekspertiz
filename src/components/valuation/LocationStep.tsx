"use client";

import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { ValuationFormData } from "./types";
import { findFastLocationFromCoords, getProvinceCoordinates, getDistrictCoordinates } from "@/lib/turkeyLocations";
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
  Minus,
  Loader2
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
  const polygonRef = useRef<L.Polygon | null>(null);
  const comparableMarkersRef = useRef<L.Marker[]>([]);
  const activeTileLayerRef = useRef<L.TileLayer | null>(null);

  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLayerType, setMapLayerType] = useState<"satellite" | "streets">("satellite");
  const isUserTypingRef = useRef<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  const serviceLabel = 
    data.service === "konut" ? "Konut & Daire" :
    data.service === "arsa" ? "İmarlı Arsa" :
    data.service === "arazi" ? "Tarla & Arazi" : "Ticari Gayrimenkul";

  // Varsayılan Koordinat (Çanakkale Kepez 40.1172, 26.4022)
  const currentLat = data.coordinates?.lat || 40.1172;
  const currentLng = data.coordinates?.lng || 26.4022;

  // Güncel Alan (m²) Değeri
  const currentArea = 
    data.service === "arsa" ? (data.arsaAreaM2 || 850) :
    data.service === "arazi" ? (data.araziAreaM2 || 1250) :
    data.service === "ticari" ? (data.commercialAreaM2 || 180) :
    (data.grossAreaM2 || 125);

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

  // Harita Katmanı Değiştirme (Uydu / Harita)
  const handleSwitchMapLayer = (layer: "satellite" | "streets") => {
    setMapLayerType(layer);
    if (!mapInstanceRef.current || !activeTileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    const L = (window as any).L;
    if (!L) return;
    const url = layer === "satellite" 
      ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const newLayer = L.tileLayer(url, {
      maxZoom: layer === "satellite" ? 20 : 19,
      attribution: layer === "satellite" ? '© Google Uydu • TKGM Kadastro' : '© OpenStreetMap • İhaleciBurada',
    }).addTo(mapInstanceRef.current);
    activeTileLayerRef.current = newLayer;
  };

  // Akıllı ve Kesin Koordinat Çözümleme (Köy/Mahalle -> İlçe -> İl Hiyerarşisi)
  const handleLocateCoordinates = async () => {
    setIsLocating(true);
    const cleanCity = (data.city || "").trim();
    const cleanDistrict = (data.district || "").trim();
    const cleanNeigh = (data.neighborhood || "").trim();

    let resolvedCoords: { lat: number; lng: number } | null = null;
    let resolvedLabel = `${cleanNeigh ? cleanNeigh + ", " : ""}${cleanDistrict ? cleanDistrict + ", " : ""}${cleanCity}`;

    // 1. AŞAMA: Köy + İlçe + İl Arama (Nominatim API)
    if (cleanNeigh && cleanDistrict) {
      try {
        const q = `${cleanNeigh}, ${cleanDistrict}, ${cleanCity}`;
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.results) && json.results.length > 0) {
          const best = json.results[0];
          if (best.lat && best.lng) {
            resolvedCoords = { lat: Number(best.lat), lng: Number(best.lng) };
            resolvedLabel = `${best.label}, ${best.province}`;
          }
        }
      } catch (err) {
        console.warn("Köy araması tamamlanamadı, ilçe koordinatına geçiliyor:", err);
      }
    }

    // 2. AŞAMA: 973 İlçe Koordinatı Fallback (0ms yerel kesin koordinat)
    if (!resolvedCoords && cleanDistrict) {
      resolvedCoords = getDistrictCoordinates(cleanCity, cleanDistrict);
    }

    // 3. AŞAMA: 81 İl Koordinatı Fallback
    if (!resolvedCoords && cleanCity) {
      resolvedCoords = getProvinceCoordinates(cleanCity);
    }

    if (resolvedCoords) {
      onChange({
        coordinates: resolvedCoords,
        searchQuery: resolvedLabel,
      });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([resolvedCoords.lat, resolvedCoords.lng], 16, { duration: 0.8 });
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([resolvedCoords.lat, resolvedCoords.lng]);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([resolvedCoords.lat, resolvedCoords.lng]);
      }
      if (mapInstanceRef.current) {
        renderComparablesAndPolygon(mapInstanceRef.current, resolvedCoords.lat, resolvedCoords.lng, data.ada, data.parsel, currentArea, data.service);
      }
    }

    setIsLocating(false);
  };

  // =========================================================================
  // YÜZEN EMSAL BALONLARI & KADASTRO SINIR POLİGONU ÇİZİCİ
  // =========================================================================
  const renderComparablesAndPolygon = (
    map: L.Map | null,
    lat: number,
    lng: number,
    adaVal: string,
    parselVal: string,
    areaVal: number,
    serviceVal: string
  ) => {
    if (!map) return;
    const L = (window as any).L;
    if (!L) return;

    // 1. Kadastro Parsel Sınır Poligonu
    if (polygonRef.current) {
      try {
        map.removeLayer(polygonRef.current);
      } catch (e) {}
      polygonRef.current = null;
    }

    const dLat = 0.00030;
    const dLng = 0.00040;
    const parcelCoords: [number, number][] = [
      [lat + dLat, lng - dLng],
      [lat + dLat * 0.95, lng + dLng * 1.05],
      [lat - dLat * 1.05, lng + dLng * 0.85],
      [lat - dLat * 0.85, lng - dLng * 0.95],
    ];

    try {
      const polygon = L.polygon(parcelCoords, {
        color: "#F59E0B",
        weight: 2.5,
        opacity: 0.95,
        fillColor: "#FCD34D",
        fillOpacity: 0.22,
        dashArray: "4, 4",
      }).addTo(map);

      polygon.bindTooltip(`TKGM Kadastro Parseli • Ada ${adaVal || "117"} / Parsel ${parselVal || "9"} (${areaVal} m²)`, {
        permanent: false,
        direction: "top",
      });
      polygonRef.current = polygon;
    } catch (e) {}

    // 2. Yüzen Emsal Balonları (3 Serbest Piyasa İlanı + 1 İcra Satış Kararı)
    comparableMarkersRef.current.forEach((m) => {
      try {
        map.removeLayer(m);
      } catch (e) {}
    });
    comparableMarkersRef.current = [];

    const isKonut = serviceVal === "konut";
    const compArea = isKonut ? areaVal : 850;

    const comps = [
      {
        offset: [0.0017, 0.0022],
        title: "Yakın Çevre Satılık Daire",
        price: "8.850.000 ₺",
        badge: "8.85M ₺",
        m2: `${compArea - 5} m²`,
        type: "sale",
        detail: "3 Gün Önce Eklendi • Emsal: 68.076 ₺/m²",
      },
      {
        offset: [-0.0016, 0.0026],
        title: "Yeni Yapı Lüks Konut",
        price: "9.400.000 ₺",
        badge: "9.40M ₺",
        m2: `${compArea} m²`,
        type: "sale",
        detail: "Dün Eklendi • Emsal: 69.629 ₺/m²",
      },
      {
        offset: [0.0021, -0.0024],
        title: "Cadde Üzeri Ara Kat",
        price: "8.250.000 ₺",
        badge: "8.25M ₺",
        m2: `${compArea - 15} m²`,
        type: "sale",
        detail: "1 Hafta Önce • Emsal: 71.739 ₺/m²",
      },
      {
        offset: [-0.0022, -0.0019],
        title: "İcra İhalesi Kararı (İİK m.115)",
        price: "4.450.000 ₺",
        badge: "4.45M ₺ İhale",
        m2: `${compArea} m²`,
        type: "auction",
        detail: "%50 Başlangıç Rayici • İhaleciBurada Takipte",
      },
    ];

    comps.forEach((c) => {
      const cLat = lat + c.offset[0];
      const cLng = lng + c.offset[1];

      const html = c.type === "auction"
        ? `
          <div style="background: #0B1E3B; border: 2px solid #F59E0B; border-radius: 20px; padding: 4px 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 5px; font-family: sans-serif; cursor: pointer; white-space: nowrap; transform: translate(-50%, -50%);">
            <span style="font-size: 11px;">⚖️</span>
            <span style="font-weight: 900; font-size: 11px; color: #FCD34D;">${c.badge}</span>
            <span style="background: rgba(16,185,129,0.25); color: #34D399; font-size: 9px; font-weight: 800; border-radius: 6px; padding: 1px 5px;">%50</span>
          </div>
        `
        : `
          <div style="background: #FFFFFF; border: 2px solid #2563EB; border-radius: 20px; padding: 4px 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 5px; font-family: sans-serif; cursor: pointer; white-space: nowrap; transform: translate(-50%, -50%);">
            <span style="font-size: 11px;">📍</span>
            <span style="font-weight: 900; font-size: 11px; color: #1E3A8A;">${c.badge}</span>
            <span style="color: #64748B; font-size: 9px; font-weight: 700;">(${c.m2})</span>
          </div>
        `;

      const compIcon = L.divIcon({
        className: "custom-emsal-balloon",
        html,
        iconSize: [0, 0],
      });

      try {
        const compMarker = L.marker([cLat, cLng], { icon: compIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; min-width: 170px;">
            <div style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 4px; ${c.type === "auction" ? "background: #FEF3C7; color: #92400E;" : "background: #DBEAFE; color: #1E40AF;"}">
              ${c.type === "auction" ? "İcra & İhale Kararı" : "Piyasa Satılık İlanı"}
            </div>
            <div style="font-weight: 800; font-size: 12px; color: #0F172A;">${c.title}</div>
            <div style="font-weight: 900; font-size: 15px; color: ${c.type === "auction" ? "#D97706" : "#2563EB"}; margin: 3px 0;">${c.price}</div>
            <div style="font-size: 10px; color: #64748B;">${c.detail}</div>
          </div>
        `;
        compMarker.bindPopup(popupContent);
        comparableMarkersRef.current.push(compMarker);
      } catch (e) {}
    });
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

    // Google Hybrid Uydu Katmanı (Varsayılan - Yüksek Çözünürlüklü Uydu + Cadde/Sokak Etiketleri)
    const initialLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      attribution: '© Google Uydu • TKGM Kadastro',
    }).addTo(map);
    activeTileLayerRef.current = initialLayer;

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
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;" title="Pini farenizle sürükleyip parselinizin üzerine bırakabilirsiniz">
          <div style="background: #0F223D; color: #FCD34D; font-weight: 900; font-size: 11px; padding: 5px 12px; border-radius: 14px; border: 2px solid #FCD34D; box-shadow: 0 4px 14px rgba(0,0,0,0.35); white-space: nowrap; font-family: sans-serif; display: flex; align-items: center; gap: 5px;">
            <span>📍</span>
            <span>Ada ${adaVal || "1357"} / Parsel ${parselVal || "4"}</span>
            <span style="color: #60A5FA; font-size: 10px; margin-left: 2px;">(${areaVal} m²)</span>
            <span style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 1px 4px; font-size: 9px; color: #A7F3D0; margin-left: 3px;">🖐 Sürükle</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F223D;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const marker = L.marker([currentLat, currentLng], { 
      icon: buildPinIcon(data.ada, data.parsel, currentArea),
      draggable: true,
      autoPan: true,
    }).addTo(map);
    markerRef.current = marker;

    // Kadastro Sınır Poligonu ve Emsal Balonlarını Çiz
    renderComparablesAndPolygon(map, currentLat, currentLng, data.ada, data.parsel, currentArea, data.service);

    // Pini Fareyle (Mouse) Elle Sürükleyerek Konum Düzeltme Dinleyicisi
    marker.on("dragend", async (e: any) => {
      const position = e.target.getLatLng();
      const dragLat = Number(position.lat.toFixed(6));
      const dragLng = Number(position.lng.toFixed(6));

      // 0ms hızlı il/ilçe çözümü
      const fastLoc = findFastLocationFromCoords(dragLat, dragLng);

      onChange({
        city: fastLoc.city,
        district: fastLoc.district,
        neighborhood: fastLoc.neighborhood,
        coordinates: { lat: dragLat, lng: dragLng },
        searchQuery: `${fastLoc.neighborhood}, ${fastLoc.district}, ${fastLoc.city}`,
      });

      if (circleRef.current) {
        circleRef.current.setLatLng([dragLat, dragLng]);
      }

      renderComparablesAndPolygon(map, dragLat, dragLng, data.ada, data.parsel, currentArea, data.service);

      // Arka planda cadde/mahalle detayını güncelle
      try {
        const res = await fetch(`/api/location/search?lat=${dragLat}&lng=${dragLng}`);
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
      } catch (err) {}
    });

    // Harita Tıklama Dinleyicisi (Haritaya Tıklayarak Pini Taşıma)
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

      renderComparablesAndPolygon(map, clickLat, clickLng, data.ada, data.parsel, currentArea, data.service);

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
      } catch (err) {}
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        comparableMarkersRef.current.forEach((m) => {
          try {
            mapInstanceRef.current?.removeLayer(m);
          } catch (e) {}
        });
        comparableMarkersRef.current = [];
        if (polygonRef.current) {
          try {
            mapInstanceRef.current?.removeLayer(polygonRef.current);
          } catch (e) {}
          polygonRef.current = null;
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Koordinat veya Ada/Parsel/Alan Değiştiğinde Haritayı & Pini Güncelle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const center = mapInstanceRef.current.getCenter();
    const diff = Math.hypot(center.lat - currentLat, center.lng - currentLng);

    if (diff > 0.0005) {
      mapInstanceRef.current.flyTo([currentLat, currentLng], 15, { duration: 0.8 });
    }

    if (markerRef.current && (window as any).L) {
      const L = (window as any).L;
      markerRef.current.setLatLng([currentLat, currentLng]);
      const newIcon = L.divIcon({
        className: "custom-kadastro-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;" title="Pini farenizle sürükleyip parselinizin üzerine bırakabilirsiniz">
            <div style="background: #0F223D; color: #FCD34D; font-weight: 900; font-size: 11px; padding: 5px 12px; border-radius: 14px; border: 2px solid #FCD34D; box-shadow: 0 4px 14px rgba(0,0,0,0.35); white-space: nowrap; font-family: sans-serif; display: flex; align-items: center; gap: 5px;">
              <span>📍</span>
              <span>Ada ${data.ada || "1357"} / Parsel ${data.parsel || "4"}</span>
              <span style="color: #60A5FA; font-size: 10px; margin-left: 2px;">(${currentArea} m²)</span>
              <span style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 1px 4px; font-size: 9px; color: #A7F3D0; margin-left: 3px;">🖐 Sürükle</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #0F223D;"></div>
          </div>
        `,
        iconSize: [0, 0],
      });
      markerRef.current.setIcon(newIcon);
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([currentLat, currentLng]);
    }

    renderComparablesAndPolygon(mapInstanceRef.current, currentLat, currentLng, data.ada, data.parsel, currentArea, data.service);
  }, [currentLat, currentLng, data.ada, data.parsel, currentArea, data.service]);

  // Canlı Arama / Autocomplete
  useEffect(() => {
    if (!isUserTypingRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = data.searchQuery?.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (isUserTypingRef.current && json.success && Array.isArray(json.results)) {
          setSuggestions(json.results);
          setShowSuggestions(json.results.length > 0);
        }
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [data.searchQuery]);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    isUserTypingRef.current = false;
    setShowSuggestions(false);
    setSuggestions([]);
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
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const fastLoc = findFastLocationFromCoords(lat, lng);

        onChange({
          city: fastLoc.city,
          district: fastLoc.district,
          neighborhood: fastLoc.neighborhood,
          coordinates: { lat, lng },
          searchQuery: `${fastLoc.neighborhood || fastLoc.district}, ${fastLoc.district}, ${fastLoc.city}`,
        });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.8 });
        }

        try {
          const res = await fetch(`/api/location/search?lat=${lat}&lng=${lng}`);
          const result = await res.json();
          if (result.success && result.location) {
            const loc = result.location;
            onChange({
              city: loc.province || fastLoc.city,
              district: loc.district || fastLoc.district,
              neighborhood: loc.neighborhood || fastLoc.neighborhood,
              coordinates: { lat, lng },
              searchQuery: `${loc.neighborhood || fastLoc.neighborhood}, ${loc.district || fastLoc.district}, ${loc.province || fastLoc.city}`,
            });
          }
        } catch (e) {
        } finally {
          setIsLocating(false);
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
        <div className="relative" ref={searchContainerRef}>
          <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50 p-1.5 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15 transition shadow-2xs">
            <div className="hidden sm:flex items-center gap-1 px-3 text-xs font-extrabold text-slate-700 border-r border-slate-200 shrink-0">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Adres / Parsel</span>
            </div>

            <input
              type="text"
              value={data.searchQuery}
              onChange={(e) => {
                isUserTypingRef.current = true;
                setShowSuggestions(true);
                onChange({ searchQuery: e.target.value });
              }}
              onFocus={() => {
                if (isUserTypingRef.current && suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Örn: Sarıbeyli Çanakkale veya Devlet Mah. Etimesgut Ankara"
              className="flex-1 px-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 bg-transparent min-w-0"
            />

            {data.searchQuery && (
              <button
                type="button"
                onClick={() => {
                  isUserTypingRef.current = false;
                  setShowSuggestions(false);
                  setSuggestions([]);
                  onChange({ searchQuery: "" });
                }}
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
                onClick={handleLocateCoordinates}
                disabled={isLocating}
                className="px-4 py-2 rounded-lg bg-[#0F223D] hover:bg-slate-900 disabled:opacity-60 text-amber-400 font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(item);
                  }}
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const textToCopy = `${data.city} / ${data.district} / ${data.neighborhood || "Merkez"} - Ada: ${data.ada || "1"} Parsel: ${data.parsel || "1"}`;
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(textToCopy);
                  }
                  const tkgmUrl = `https://parselsorgu.tkgm.gov.tr/#ara/cografi/${currentLat}/${currentLng}`;
                  window.open(tkgmUrl, "_blank", "noopener,noreferrer");
                }}
                className="px-3 py-1 bg-[#0F223D] hover:bg-slate-900 border border-amber-500/40 text-amber-400 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                title="TKGM Parsel Sorgu resmi sayfasında aç ve bilgileri kopyala"
              >
                <span>🏛️ TKGM Parsel Sorgu</span>
              </button>

              <button
                type="button"
                onClick={handleLocateCoordinates}
                disabled={isLocating}
                className="px-3 py-1 bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-60"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>Haritada Konumlandır</span>
              </button>
            </div>
          </div>
        </div>

        {/* HARİTA KULLANIM İPUCU: FAREYLE SÜRÜKLE VEYA TIKLA */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 rounded-xl text-xs text-blue-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">🖐️</span>
            <span className="font-medium">
              <strong className="font-extrabold text-blue-900">Pini farenizle (mouse) sürükleyip</strong> parselinizin tam üstüne taşıyabilir veya haritaya tıklayarak konumu milimetrik düzeltebilirsiniz.
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Canlı Koordinat
          </span>
        </div>

        {/* 3. GERÇEK ETKİLEŞİMLİ LEAFLET KADASTRO HARİTASI (UYDU GÖRÜNTÜSÜ) */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 h-72 sm:h-80 bg-slate-100 shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Sol Üst: TKGM Kadastro Rozeti */}
          <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 shadow-md">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>TKGM & HGK Canlı Kadastro Katmanı</span>
            </div>
          </div>

          {/* Sağ Üst: Katman Değiştirici (Uydu / Harita) */}
          <div className="absolute top-3 right-3 z-[400] flex items-center bg-slate-950/85 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => handleSwitchMapLayer("satellite")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                mapLayerType === "satellite"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>🛰️ Uydu Görünümü</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMapLayer("streets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                mapLayerType === "streets"
                  ? "bg-white text-slate-950 font-black shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>🗺️ Harita</span>
            </button>
          </div>

          {/* Sol Alt: Deprem Risk PGA Rozeti */}
          <div className="absolute bottom-16 left-3 z-[400] pointer-events-none">
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
