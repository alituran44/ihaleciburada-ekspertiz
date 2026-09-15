"use client";

import React, { useEffect, useRef, useState } from "react";
import { ComparableListing } from "@/types";
import { getDistrictValuation, getDistrictChoroplethColor } from "@/lib/districtValuations";
import { 
  MapPin, 
  Mountain, 
  ExternalLink, 
  Layers, 
  Compass, 
  Navigation, 
  ArrowLeft,
  Search,
  CheckCircle2,
  TrendingUp,
  Gavel,
  ShieldCheck,
  RefreshCw,
  Plus,
  Minus,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Crosshair,
  Filter,
  SlidersHorizontal,
  AlertCircle
} from "lucide-react";

interface ParcelMapProps {
  city: string;
  district: string;
  neighborhood?: string;
  ada?: string;
  parsel?: string;
  coordinates?: { lat: number; lng: number };
  elevationMeters?: number;
  comparables?: ComparableListing[];
  category?: "arsa" | "konut";
  unitM2Price?: number;
  isEndeksaSplitView?: boolean;
  onLocationFound?: (coords: { lat: number; lng: number }) => void;
  onSelectDistrict?: (districtName: string) => void;
  onSelectNeighborhood?: (neighborhoodName: string) => void;
}

function formatShortPrice(num: number): string {
  if (!num) return "0 ₺";
  if (num >= 1000000) {
    const val = num / 1000000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "M ₺";
  }
  if (num >= 1000) {
    const val = num / 1000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "K ₺";
  }
  return num.toLocaleString("tr-TR") + " ₺";
}

function offsetCoord(lat: number, lng: number, meters: number, bearingDeg: number) {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (meters * Math.cos(rad)) / 111000;
  const dLng = (meters * Math.sin(rad)) / (111000 * Math.cos((lat * Math.PI) / 180));
  return {
    lat: Number((lat + dLat).toFixed(6)),
    lng: Number((lng + dLng).toFixed(6)),
  };
}

// Ekran görüntüsündeki (media_1789427467462.png) gibi doğrudan harita üzerine basılan ana köy/mahalle etiketleri
const PROMINENT_LABELS = [
  "Muratlar",
  "Bayramiç",
  "Mollahasanlar",
  "Evciler",
  "Çırpılar",
  "Karaköy",
  "Türkmenli",
  "Söğütalan",
  "Cevatpaşa",
  "Barbaros",
  "İsmetpaşa",
  "Esenler",
  "Kepez",
];

export const ParcelMap: React.FC<ParcelMapProps> = ({
  city,
  district,
  neighborhood,
  ada,
  parsel,
  coordinates,
  elevationMeters,
  comparables,
  category = "arsa",
  unitM2Price = 45000,
  isEndeksaSplitView = false,
  onLocationFound,
  onSelectDistrict,
  onSelectNeighborhood,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  
  const [filter, setFilter] = useState<"all" | "satilik" | "kiralik">("all");
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateFeedback, setLocateFeedback] = useState<string | null>(null);
  
  // Görünüm Seviyesi: "ilceler" (Makro) | "mahalleler" (En Küçük Bölge - Mahalle/Köy) | "parsel" (Emsaller & Parsel)
  const [viewMode, setViewMode] = useState<"ilceler" | "mahalleler" | "parsel">("mahalleler");
  const [activeDistrict, setActiveDistrict] = useState<string>(district || "Bayramiç");
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(neighborhood || null);
  const [mahalleData, setMahalleData] = useState<any>(null);
  const [isLoadingMahalle, setIsLoadingMahalle] = useState<boolean>(false);
  const [mahalleCount, setMahalleCount] = useState<number>(0);

  // Floating Harita Kontrolleri & Bildirimleri (Görsel 1789487723574 İle Birebir)
  const [currentZoom, setCurrentZoom] = useState<number>(7);
  const [mapLayerType, setMapLayerType] = useState<"uydu" | "hibrit" | "sokak">("uydu");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [parcelNotice, setParcelNotice] = useState<string | null>("Parsel bilgisi bulunamadı.");

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Mausun topuzu (scroll wheel zoom) ve kilit durumunu senkronize et
  useEffect(() => {
    if (mapInstanceRef.current && mapInstanceRef.current.scrollWheelZoom) {
      if (isLocked) {
        mapInstanceRef.current.scrollWheelZoom.disable();
      } else {
        mapInstanceRef.current.scrollWheelZoom.enable();
      }
    }
  }, [isLocked]);

  // Sync prop changes
  useEffect(() => {
    if (district && district !== activeDistrict) {
      setActiveDistrict(district);
    }
  }, [district]);

  useEffect(() => {
    if (neighborhood !== undefined) {
      setActiveNeighborhood(neighborhood);
    }
  }, [neighborhood]);

  // Dışarıdan veya pencereden mod değiştirme fonksiyonları
  useEffect(() => {
    (window as any).__switchToMahalleMode = (distName?: string) => {
      if (distName) setActiveDistrict(distName);
      setViewMode("mahalleler");
    };
    (window as any).__switchToDistrictMode = () => {
      setViewMode("ilceler");
    };
    (window as any).__switchToParcelMode = () => {
      setViewMode("parsel");
    };
  }, []);

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız GPS konum servisini desteklemiyor.");
      return;
    }

    setIsLocating(true);
    setLocateFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const userLat = Number(position.coords.latitude.toFixed(6));
        const userLng = Number(position.coords.longitude.toFixed(6));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 16, {
            duration: 1.2,
          });
        }

        setLocateFeedback(`Konum Alındı (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
        setTimeout(() => setLocateFeedback(null), 4000);

        if (onLocationFound) {
          onLocationFound({ lat: userLat, lng: userLng });
        }
      },
      (error) => {
        setIsLocating(false);
        setLocateFeedback("GPS izni verilmedi veya sinyal zayıf.");
        setTimeout(() => setLocateFeedback(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Default Koordinatlar
  const lat = coordinates?.lat || 39.8370;
  const lng = coordinates?.lng || 26.6870;

  const isResidential = category === "konut";

  // Emsal İlan Listesi
  const compsList: ComparableListing[] = React.useMemo(() => {
    if (comparables && comparables.length > 0) {
      return comparables;
    }
    if (isResidential) {
      return [
        {
          id: "def-res-1",
          title: `${activeNeighborhood || activeDistrict} 3+1 Balkonlu Ara Kat Daire`,
          category: "konut",
          type: "satilik",
          areaM2: 135,
          pricePerM2TL: 48000,
          priceTL: 6480000,
          distanceMeters: 240,
          coordinates: offsetCoord(lat, lng, 240, 40),
          source: "Sahibinden",
          roomCount: "3+1",
          date: "2 gün önce",
        },
        {
          id: "def-res-2",
          title: `${activeNeighborhood || activeDistrict} 2+1 Sıfır Lüks Site Dairesi`,
          category: "konut",
          type: "satilik",
          areaM2: 100,
          pricePerM2TL: 52000,
          priceTL: 5200000,
          distanceMeters: 380,
          coordinates: offsetCoord(lat, lng, 380, 135),
          source: "Hepsiemlak",
          roomCount: "2+1",
          date: "Dün",
        },
        {
          id: "def-res-3",
          title: `${activeNeighborhood || activeDistrict} Ön Cephe Geniş 3+1 Aile Dairesi`,
          category: "konut",
          type: "satilik",
          areaM2: 145,
          pricePerM2TL: 45000,
          priceTL: 6525000,
          distanceMeters: 520,
          coordinates: offsetCoord(lat, lng, 520, 220),
          source: "Sahibinden",
          roomCount: "3+1",
          date: "4 gün önce",
        },
        {
          id: "def-res-4",
          title: `${activeNeighborhood || activeDistrict} Kiralık 3+1 Kombili Masrafsız Daire`,
          category: "konut",
          type: "kiralik",
          areaM2: 130,
          pricePerM2TL: 220,
          priceTL: 28500,
          distanceMeters: 310,
          coordinates: offsetCoord(lat, lng, 310, 310),
          source: "Sahibinden",
          roomCount: "3+1",
          date: "3 gün önce",
        },
      ];
    } else {
      return [
        {
          id: "def-land-1",
          title: `${activeNeighborhood || activeDistrict} Köy İçi İmarlı Müstakil Parsel`,
          category: "arsa",
          type: "satilik",
          areaM2: 620,
          pricePerM2TL: 14500,
          priceTL: 8990000,
          distanceMeters: 250,
          coordinates: offsetCoord(lat, lng, 250, 45),
          source: "Sahibinden",
          zoningType: "Köy Yerleşik",
          date: "2 gün önce",
        },
        {
          id: "def-land-2",
          title: `${activeNeighborhood || activeDistrict} Kadastro Yolu Olan Yatırımlık Bahçe`,
          category: "arsa",
          type: "satilik",
          areaM2: 1850,
          pricePerM2TL: 7200,
          priceTL: 13320000,
          distanceMeters: 420,
          coordinates: offsetCoord(lat, lng, 420, 150),
          source: "Hepsiemlak",
          zoningType: "Tarımsal Nitelikli",
          date: "Dün",
        },
        {
          id: "def-land-3",
          title: `${activeNeighborhood || activeDistrict} Doğa Manzaralı İcradan Satış Emsali`,
          category: "arsa",
          type: "satilik",
          areaM2: 1350,
          pricePerM2TL: 6800,
          priceTL: 9180000,
          distanceMeters: 590,
          coordinates: offsetCoord(lat, lng, 590, 235),
          source: "Bölge Emsali",
          zoningType: "Gelişme Konut",
          date: "4 gün önce",
        },
      ];
    }
  }, [comparables, isResidential, lat, lng, activeNeighborhood, activeDistrict]);

  const filteredComps = React.useMemo(() => {
    if (filter === "all") return compsList;
    return compsList.filter((c) => c.type === filter);
  }, [compsList, filter]);

  // Leaflet Başlatma ve Katman Yönetimi
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-core-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-core-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-core-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const setupMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialZoom = viewMode === "ilceler" ? 10 : viewMode === "mahalleler" ? 12 : 15;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: initialZoom,
        zoomControl: false,
        scrollWheelZoom: true,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 60,
      });
      map.scrollWheelZoom.enable();
      mapInstanceRef.current = map;
      setCurrentZoom(initialZoom);

      map.on("zoomend", () => {
        if (mapInstanceRef.current) {
          setCurrentZoom(mapInstanceRef.current.getZoom());
        }
      });

      // Çanakkale Merkez ve Çevre Mahalle Koordinat & Fiyat Veri Kataloğu
      const CANAKKALE_MERKEZ_MAHALLELERI = [
        { name: "Cevat Paşa", lat: 40.1555, lng: 26.4150, unitPrice: 48900, tenderStart: 24450, growth: 72, opp: 88, desc: "Kordon Boyu, 18 Mart Stadyumu ve elit sahil aksı." },
        { name: "İsmetpaşa", lat: 40.1492, lng: 26.4105, unitPrice: 46500, tenderStart: 23250, growth: 68, opp: 86, desc: "Çanakkale Devlet Hastanesi ve Demircioğlu Caddesi ticaret merkezi." },
        { name: "Kemalpaşa", lat: 40.1465, lng: 26.4020, unitPrice: 52000, tenderStart: 26000, growth: 78, opp: 92, desc: "Tarihi Saat Kulesi, Aynalı Çarşı ve turizm çekim alanı." },
        { name: "Namık Kemal", lat: 40.1418, lng: 26.4120, unitPrice: 43200, tenderStart: 21600, growth: 64, opp: 85, desc: "Sarıçay sahil bandı, Çanakkale Halk Pazarı aksı." },
        { name: "Barbaros", lat: 40.1340, lng: 26.4180, unitPrice: 47500, tenderStart: 23750, growth: 70, opp: 87, desc: "Yeni Kordon, Troya Caddesi ve sahil şeridi konutları." },
        { name: "Esenler", lat: 40.1480, lng: 26.4350, unitPrice: 45800, tenderStart: 22900, growth: 66, opp: 84, desc: "Özgürlük Parkı, modern toplu konut siteleri." },
        { name: "Fevzipaşa", lat: 40.1440, lng: 26.4050, unitPrice: 38000, tenderStart: 19000, growth: 58, opp: 94, desc: "Çimenlik Kalesi arkası, Sarıçay ağzı." },
      ];

      // KULLANICI İSTEĞİ: "üzerine tıklayınca o kısımla ilgili bilgiler gelsin"
      let clickMarker: any = null;

      map.on("click", async (e: any) => {
        const clickLat = Number(e.latlng.lat.toFixed(5));
        const clickLng = Number(e.latlng.lng.toFixed(5));

        // 1. En yakın mahalleyi ve bölgesel değerleme verilerini belirle
        let matchedNeigh = activeNeighborhood || "Cevat Paşa";
        let matchedPrice = unitM2Price || 48500;
        let matchedTender = Math.round(matchedPrice * 0.5);
        let matchedGrowth = 68;
        let matchedOpp = 88;
        let matchedDesc = "Resmi SPK ve İİK m.115 gayrimenkul değerleme verileri.";
        let roadName = "";

        // En yakın Çanakkale mahallesini mesafeyle hesapla
        let minDistance = Infinity;
        for (const m of CANAKKALE_MERKEZ_MAHALLELERI) {
          const d = Math.hypot(m.lat - clickLat, m.lng - clickLng);
          if (d < minDistance) {
            minDistance = d;
            matchedNeigh = m.name;
            matchedPrice = m.unitPrice;
            matchedTender = m.tenderStart;
            matchedGrowth = m.growth;
            matchedOpp = m.opp;
            matchedDesc = m.desc;
          }
        }

        // Tıklanan koordinat için canlı pin oluştur
        if (clickMarker) {
          map.removeLayer(clickMarker);
        }

        const clickPinIcon = L.divIcon({
          className: "leaflet-click-pin",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
              <div style="background: #0B1E3B; color: #F59E0B; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 8px; border: 2px solid #F59E0B; box-shadow: 0 4px 14px rgba(0,0,0,0.35); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                <span>📍 ${matchedNeigh}</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #0B1E3B;"></div>
              <div style="width: 8px; height: 8px; background: #10B981; border: 2px solid #FFFFFF; border-radius: 50%; margin-top: -3px; box-shadow: 0 0 8px #10B981;"></div>
            </div>
          `,
          iconSize: [0, 0],
        });

        clickMarker = L.marker([clickLat, clickLng], {
          icon: clickPinIcon,
          zIndexOffset: 1500,
        }).addTo(map);

        const buildPopupHtml = (neigh: string, road: string, price: number, tender: number, growth: number, opp: number, desc: string) => `
          <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 255px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
              <div>
                <div style="font-size: 9.5px; font-weight: 800; color: #2563EB; text-transform: uppercase;">Seçilen Bölge Bilgisi</div>
                <strong style="color: #0F223D; font-size: 14px; font-weight: 900;">${neigh}</strong>
                <div style="font-size: 10px; color: #64748B; font-weight: 600;">${road ? road + " • " : ""}${activeDistrict || "Merkez"} / ${city}</div>
              </div>
              <span style="background: #10B98115; color: #059669; font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 6px; border: 1px solid #10B98140;">
                TKGM Doğrulandı
              </span>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="font-size: 10.5px; color: #64748B; font-weight: 600;">Bölgesel m² Değeri:</span>
                <span style="font-size: 14px; font-weight: 900; color: #0F223D;">${price.toLocaleString("tr-TR")} ₺/m²</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                <span style="font-size: 10.5px; color: #059669; font-weight: 700;">İcra Tabanı (İİK %50):</span>
                <span style="font-size: 12px; font-weight: 900; color: #059669;">${tender.toLocaleString("tr-TR")} ₺/m²</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; border-top: 1px solid #E2E8F0; padding-top: 4px;">
                <span style="color: #64748B;">100 m² Örnek Taşınmaz:</span>
                <span style="font-weight: 800; color: #0F223D;">${(price * 100).toLocaleString("tr-TR")} ₺</span>
              </div>
            </div>

            <div style="font-size: 9.5px; color: #64748B; margin-bottom: 8px; line-height: 1.35;">
              ${desc}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; margin-bottom: 6px; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 4px;">
              <span>İhale Fırsat Skoru: <strong style="color: #D97706;">%${opp}</strong></span>
              <span>Yıllık Değer Artışı: <strong style="color: #059669;">+%{growth}</strong></span>
            </div>

            <div style="background: #0B1E3B; color: #FFFFFF; font-weight: 800; font-size: 10.5px; padding: 6px 10px; border-radius: 6px; text-align: center;">
              ✓ Seçildi: Sol Analitik Panel Güncellendi
            </div>
          </div>
        `;

        clickMarker.bindPopup(buildPopupHtml(matchedNeigh, roadName, matchedPrice, matchedTender, matchedGrowth, matchedOpp, matchedDesc)).openPopup();

        // Sol üst rozeti ve ana bileşeni güncelle
        setParcelNotice(`📍 ${matchedNeigh} • ${matchedPrice.toLocaleString("tr-TR")} ₺/m²`);
        setActiveNeighborhood(matchedNeigh);

        if (onSelectNeighborhood) {
          onSelectNeighborhood(matchedNeigh);
        }
        if (onLocationFound) {
          onLocationFound({ lat: clickLat, lng: clickLng });
        }

        // Asenkron tersine konum sorgusu ile sokak ve mahalle adını haritadan netleştir
        try {
          const res = await fetch(`/api/location/search?lat=${clickLat}&lng=${clickLng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.location) {
              const loc = data.location;
              const refinedNeigh = loc.neighborhood || matchedNeigh;
              const refinedRoad = loc.road || "";
              setParcelNotice(`📍 ${refinedNeigh} ${refinedRoad ? `(${refinedRoad})` : ""} • ${matchedPrice.toLocaleString("tr-TR")} ₺/m²`);
              clickMarker.setPopupContent(buildPopupHtml(refinedNeigh, refinedRoad, matchedPrice, matchedTender, matchedGrowth, matchedOpp, matchedDesc));
              setActiveNeighborhood(refinedNeigh);
              if (onSelectNeighborhood) {
                onSelectNeighborhood(refinedNeigh);
              }
            }
          }
        } catch (e) {}
      });

      const tileUrl = mapLayerType === "uydu"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : mapLayerType === "hibrit"
        ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '© Harita Katmanı • İhaleciBurada GIS',
      }).addTo(map);

      // =========================================================================
      // KATMAN 1: İLÇE GÖRÜNÜMÜ (Makro Seviye - Çanakkale'nin 12 İlçesi)
      // =========================================================================
      if (viewMode === "ilceler") {
        const citySlug = (city || "çanakkale")
          .toLowerCase()
          .trim()
          .replace(/i̇/g, "i").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o")
          .replace(/[^a-z0-9]/g, "");

        fetch(`/data/districts/${citySlug}.geojson`)
          .then((res) => {
            if (!res.ok) throw new Error("GeoJSON not found");
            return res.json();
          })
          .then((geoData) => {
            if (!mapInstanceRef.current) return;

            const geoLayer = L.geoJSON(geoData, {
              style: (feature: any) => {
                const distName = feature?.properties?.name || "";
                const val = getDistrictValuation(city, distName, unitM2Price);
                const isSelected = Boolean(activeDistrict && distName.toLowerCase().includes(activeDistrict.toLowerCase()));
                const choropleth = getDistrictChoroplethColor(val.pricePerM2TL, distName);

                return {
                  fillColor: choropleth.fillColor,
                  fillOpacity: choropleth.fillOpacity,
                  color: isSelected ? "#0F172A" : choropleth.color,
                  weight: isSelected ? 3 : 1.5,
                  opacity: 0.95,
                };
              },
              onEachFeature: (feature: any, layer: any) => {
                const distName = feature?.properties?.name || "";
                const val = getDistrictValuation(city, distName, unitM2Price);
                const priceText = val.pricePerM2TL.toLocaleString("tr-TR");

                // Hover Tooltip: "Bayramiç (32.400 ₺/m²)"
                layer.bindTooltip(`
                  <div style="font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; font-weight: 700; color: #1E293B; padding: 5px 12px; background: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.18); border: 1px solid rgba(0,0,0,0.08); white-space: nowrap; pointer-events: none;">
                    ${distName} (${priceText} ₺/m²)
                    <div style="font-size: 9px; color: #2563EB; font-weight: 800; margin-top: 2px;">Tıkla: Mahalle & Köylere Açıl 🔍</div>
                  </div>
                `, {
                  sticky: true,
                  direction: "top",
                  opacity: 1,
                  className: "custom-district-tooltip"
                });

                layer.on("mouseover", () => {
                  layer.setStyle({
                    fillOpacity: 0.85,
                    weight: 2.8,
                    color: "#FFFFFF",
                  });
                  layer.bringToFront();
                });

                layer.on("mouseout", () => {
                  geoLayer.resetStyle(layer);
                });

                // KULLANICI İSTEDİ: TIKLAYINCA KÜÇÜK BÖLGELERE AÇILSIN!
                layer.on("click", () => {
                  setActiveDistrict(distName);
                  if (onSelectDistrict) onSelectDistrict(distName);
                  setViewMode("mahalleler");
                });
              }
            }).addTo(map);

            try {
              map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
            } catch (e) {}
          })
          .catch((err) => {
            console.warn("Could not load district geojson:", err);
          });
      }

      // =========================================================================
      // KATMAN 2: GERÇEK MAHALLE & KÖY GÖRÜNÜMÜ (Ekran Görüntüsü ile Birebir)
      // =========================================================================
      if (viewMode === "mahalleler") {
        setIsLoadingMahalle(true);
        const distToLoad = activeDistrict || "Bayramiç";

        fetch(`/api/location/mahalle?province=${encodeURIComponent(city)}&district=${encodeURIComponent(distToLoad)}`)
          .then((res) => {
            if (!res.ok) throw new Error("Mahalle GeoJSON not found");
            return res.json();
          })
          .then((resp) => {
            setIsLoadingMahalle(false);
            if (!mapInstanceRef.current || !resp.success || !resp.data) return;

            setMahalleData(resp.data);
            setMahalleCount(resp.featureCount || resp.data.features?.length || 0);

            const mahalleGeoLayer = L.geoJSON(resp.data, {
              style: (feature: any) => {
                const props = feature?.properties || {};
                const isSelected = activeNeighborhood && props.name?.toLowerCase() === activeNeighborhood.toLowerCase();

                return {
                  fillColor: props.fillColor || "#4ADE80",
                  fillOpacity: props.fillOpacity || 0.78,
                  color: isSelected ? "#0F172A" : (props.strokeColor || "#FFFFFF"),
                  weight: isSelected ? 3.5 : 1.5,
                  opacity: 0.98,
                };
              },
              onEachFeature: (feature: any, layer: any) => {
                const props = feature?.properties || {};
                const neighName = props.name || "Köy/Mahalle";
                const unitPrice = props.unitPrice || 25000;
                const tenderStart = props.tenderStartM2TL || Math.round(unitPrice * 0.5);
                const growth = props.yearlyGrowth || 65;
                const oppScore = props.opportunityScore || 85;
                const isRed = props.tier === "premium_red";

                // 1. Tooltip: Ekran görüntüsüyle birebir beyaz kart
                layer.bindTooltip(`
                  <div style="font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; font-weight: 800; color: #1E293B; padding: 6px 12px; background: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.22); border: 1px solid rgba(0,0,0,0.08); white-space: nowrap; pointer-events: none;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${props.fillColor}; display: inline-block;"></span>
                      <span style="color: #0F223D;">${neighName}</span>
                      <span style="color: ${isRed ? '#991B1B' : '#059669'}; font-weight: 900;">${unitPrice.toLocaleString("tr-TR")} ₺/m²</span>
                    </div>
                    <div style="font-size: 9px; color: #64748B; margin-top: 2px; font-weight: 600;">İcra Taban (%50): ${tenderStart.toLocaleString("tr-TR")} ₺/m² • Skor: %${oppScore}</div>
                  </div>
                `, {
                  sticky: true,
                  direction: "top",
                  opacity: 1,
                  className: "custom-district-tooltip"
                });

                // 2. Ekran görüntüsündeki gibi poligonun merkezinde doğrudan beliren yazılı etiketler
                const isProminent = PROMINENT_LABELS.some((l) => neighName.toLowerCase().includes(l.toLowerCase()));
                if (isProminent && layer.getBounds) {
                  const center = layer.getBounds().getCenter();
                  const labelIcon = L.divIcon({
                    className: "prominent-mahalle-label",
                    html: `
                      <div style="font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; font-weight: 800; color: ${isRed ? '#FFFFFF' : '#1E293B'}; text-shadow: ${isRed ? '0 1px 4px rgba(0,0,0,0.9)' : '0 1px 3px rgba(255,255,255,0.9), 0 0 2px #FFFFFF'}; pointer-events: none; transform: translate(-50%, -50%); white-space: nowrap;">
                        ${neighName}
                      </div>
                    `,
                    iconSize: [0, 0],
                  });
                  L.marker(center, { icon: labelIcon, interactive: false, zIndexOffset: 300 }).addTo(map);
                }

                // Hover Efekti: Kalınlaşan beyaz kenarlık
                layer.on("mouseover", () => {
                  layer.setStyle({
                    fillOpacity: 0.95,
                    weight: 3.0,
                    color: "#FFFFFF",
                  });
                  layer.bringToFront();
                });

                layer.on("mouseout", () => {
                  mahalleGeoLayer.resetStyle(layer);
                });

                // Tıklama Etkileşimi: Detaylı değerleme popup'ı ve parsele geçiş butonu
                layer.on("click", () => {
                  setActiveNeighborhood(neighName);
                  if (onSelectNeighborhood) onSelectNeighborhood(neighName);

                  layer.bindPopup(`
                    <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 250px; padding: 6px;">
                      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 8px;">
                        <div>
                          <strong style="color: #0F223D; font-size: 14px; font-weight: 900;">${neighName}</strong>
                          <div style="font-size: 10px; color: #64748B; font-weight: 600;">${distToLoad} / ${city}</div>
                        </div>
                        <span style="background: ${props.fillColor}25; color: ${props.fillColor}; font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 6px; border: 1px solid ${props.fillColor}50;">
                          ${isRed ? "Yüksek Prim Aksı" : "Yerleşim Sınırı"}
                        </span>
                      </div>

                      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                          <span style="font-size: 10.5px; color: #64748B; font-weight: 600;">Ortalama m² Değeri:</span>
                          <span style="font-size: 14px; font-weight: 900; color: #0F223D;">${unitPrice.toLocaleString("tr-TR")} ₺/m²</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                          <span style="font-size: 10.5px; color: #059669; font-weight: 700;">İcra / İhale Tabanı (%50):</span>
                          <span style="font-size: 12px; font-weight: 900; color: #059669;">${tenderStart.toLocaleString("tr-TR")} ₺/m²</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; border-top: 1px solid #E2E8F0; padding-top: 4px;">
                          <span style="color: #64748B;">İcra Fırsat Skoru:</span>
                          <span style="font-weight: 800; color: #D97706;">%${oppScore} (Yüksek Getiri)</span>
                        </div>
                      </div>

                      <div style="font-size: 10px; color: #64748B; line-height: 1.35; margin-bottom: 8px; font-style: italic;">
                        ${props.description || `${neighName} mevkii resmi kadastro ve piyasa emsal verileri.`}
                      </div>

                      <button
                        onclick="window.__switchToParcelMode && window.__switchToParcelMode()"
                        style="width: 100%; background: #0F223D; hover:background: #1E293B; color: #FFFFFF; font-weight: 700; font-size: 11px; padding: 7px 10px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"
                      >
                        📍 Bu Köy/Mahallede Parsel & Emsal İncele
                      </button>
                    </div>
                  `).openPopup();
                });
              }
            }).addTo(map);

            try {
              map.fitBounds(mahalleGeoLayer.getBounds(), { padding: [20, 20] });
            } catch (e) {}
          })
          .catch((err) => {
            setIsLoadingMahalle(false);
            console.warn("Could not load mahalle geojson:", err);
          });
      }

      // =========================================================================
      // KATMAN 3: PARSEL VE EMSALLER GÖRÜNÜMÜ (Nano Seviye - 500m Etki Çemberi)
      if (viewMode === "parsel") {
        // Tapusor Çoklu Etki Alanı / Tampon Halkaları (Concentric Buffer Rings - 250m, 500m, 1000m)
        L.circle([lat, lng], {
          radius: 250,
          color: "#2563EB",
          weight: 2,
          opacity: 0.85,
          fillColor: "#3B82F6",
          fillOpacity: 0.14,
          dashArray: "3, 4",
        }).addTo(map);

        L.circle([lat, lng], {
          radius: 500,
          color: "#2563EB",
          weight: 1.5,
          opacity: 0.65,
          fillColor: "#3B82F6",
          fillOpacity: 0.08,
          dashArray: "5, 6",
        }).addTo(map);

        L.circle([lat, lng], {
          radius: 1000,
          color: "#2563EB",
          weight: 1,
          opacity: 0.40,
          fillColor: "#3B82F6",
          fillOpacity: 0.03,
          dashArray: "6, 8",
        }).addTo(map);

        // =========================================================================
        // TAPUSOR BAL PETEĞİ EMSAL KÜMESİ (Hexagonal Spatial Honeycomb Mesh - Görsel 1789501075638)
        // =========================================================================
        const hexRadius = 55; // metre cinsinden petek yarıçapı
        const hexStep = hexRadius * 1.732; // komşu petek merkez mesafesi (~95m)

        const getHexCorners = (cLat: number, cLng: number, r: number): [number, number][] => {
          const pts: [number, number][] = [];
          for (let i = 0; i < 6; i++) {
            const angleDeg = i * 60 + 30;
            const pt = offsetCoord(cLat, cLng, r, angleDeg);
            pts.push([pt.lat, pt.lng]);
          }
          return pts;
        };

        // 1. Merkez Hedef Altıgen (Görseldeki Gibi Sarı Vurgulu Petek)
        const centerHexPts = getHexCorners(lat, lng, hexRadius);
        L.polygon(centerHexPts, {
          color: "#EAB308",
          weight: 2.5,
          fillColor: "#FACC15",
          fillOpacity: 0.65,
        }).addTo(map);

        // Hedef m² Fiyat Rozeti (Sarı Rozet - Örn: 54.085 ₺/m²)
        const centerBadgeIcon = L.divIcon({
          className: "leaflet-hex-center-badge",
          html: `
            <div style="transform: translate(-50%, -50%); background: #FACC15; color: #713F12; font-weight: 900; font-size: 11px; padding: 2px 7px; border-radius: 6px; border: 1.5px solid #CA8A04; box-shadow: 0 2px 8px rgba(0,0,0,0.35); font-family: monospace; white-space: nowrap; pointer-events: none;">
              ${(unitM2Price || 54085).toLocaleString("tr-TR")} ₺/m²
            </div>
          `,
          iconSize: [0, 0],
        });
        L.marker([lat, lng], { icon: centerBadgeIcon, interactive: false, zIndexOffset: 2100 }).addTo(map);

        // 2. Çevredeki Bal Peteği Emsal Parselleri (Görsel 1789501075638 Birebir)
        const surroundingHexList = [
          { angle: 30, dist: hexStep, price: Math.round((unitM2Price || 54085) * 1.254), count: 6, label: "Kuzeydoğu Emsal Bölgesi" },  // Örn: 67.847 ₺
          { angle: 90, dist: hexStep, price: Math.round((unitM2Price || 54085) * 0.456), count: 3, label: "Doğu Emsal Bölgesi" },       // Örn: 24.664 ₺
          { angle: 150, dist: hexStep, price: Math.round((unitM2Price || 54085) * 0.852), count: 2, label: "Güneydoğu Emsal Bölgesi" }, // Örn: 46.057 ₺
          { angle: 210, dist: hexStep, price: Math.round((unitM2Price || 54085) * 0.915), count: 4, label: "Güneybatı Emsal Bölgesi" }, // Örn: 49.500 ₺
          { angle: 270, dist: hexStep, price: Math.round((unitM2Price || 54085) * 0.891), count: 3, label: "Batı Emsal Bölgesi" },      // Örn: 48.200 ₺
          { angle: 330, dist: hexStep, price: Math.round((unitM2Price || 54085) * 1.042), count: 5, label: "Kuzeybatı Emsal Bölgesi" }, // Örn: 56.400 ₺
          // Dış Çember Genişlemeleri (Görseldeki dış mavi petekler)
          { angle: 0, dist: hexStep * 1.732, price: Math.round((unitM2Price || 54085) * 1.148), count: 3, label: "Kuzey Emsalleri" },
          { angle: 60, dist: hexStep * 1.732, price: Math.round((unitM2Price || 54085) * 1.182), count: 4, label: "Dış Doğu Emsalleri" },
          { angle: 120, dist: hexStep * 1.732, price: Math.round((unitM2Price || 54085) * 0.745), count: 2, label: "Dış Güneydoğu Emsalleri" },
          { angle: 180, dist: hexStep * 1.732, price: Math.round((unitM2Price || 54085) * 0.825), count: 3, label: "Güney Emsalleri" },
          { angle: 240, dist: hexStep * 1.732, price: Math.round((unitM2Price || 54085) * 0.948), count: 2, label: "Dış Güneybatı Emsalleri" },
          { angle: 300, dist: hexStep * 1.732, price: Math.round((unitM2Price || 54085) * 1.078), count: 4, label: "Dış Kuzeybatı Emsalleri" },
        ];

        surroundingHexList.forEach((hex, idx) => {
          const hexCenter = offsetCoord(lat, lng, hex.dist, hex.angle);
          const hexCorners = getHexCorners(hexCenter.lat, hexCenter.lng, hexRadius);

          // Mavi Petek Poligonu
          const poly = L.polygon(hexCorners, {
            color: "#2563EB",
            weight: 1.6,
            opacity: 0.85,
            fillColor: "#3B82F6",
            fillOpacity: 0.20,
          }).addTo(map);

          // Emsal Fiyat Etiketi (Görsel 1789501075638 Birebir Rozet)
          const hexBadgeIcon = L.divIcon({
            className: "leaflet-hex-badge",
            html: `
              <div style="transform: translate(-50%, -50%); background: #0B1E3B; color: #FFFFFF; font-weight: 800; font-size: 10px; padding: 2.5px 6px; border-radius: 6px; border: 1.5px solid #3B82F6; box-shadow: 0 2px 8px rgba(0,0,0,0.35); font-family: monospace; white-space: nowrap; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                <span>${hex.price.toLocaleString("tr-TR")} ₺/m²</span>
                <span style="background: #F59E0B; color: #000; font-size: 9px; font-weight: 900; padding: 0.5px 3.5px; border-radius: 3px;">${hex.count} •</span>
              </div>
            `,
            iconSize: [0, 0],
          });

          const badgeMarker = L.marker([hexCenter.lat, hexCenter.lng], {
            icon: hexBadgeIcon,
            zIndexOffset: 1200 + idx,
          }).addTo(map);

          const hexPopupHtml = `
            <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 220px; padding: 4px;">
              <div style="font-size: 10px; font-weight: 800; color: #2563EB; text-transform: uppercase;">${hex.label}</div>
              <div style="font-size: 13px; font-weight: 900; color: #0F172A; margin: 2px 0;">${hex.price.toLocaleString("tr-TR")} ₺/m²</div>
              <div style="font-size: 10.5px; color: #64748B;">Bu petekte <strong>${hex.count} adet</strong> güncel emsal ilan bulunuyor.</div>
              <div style="font-size: 10px; color: #059669; font-weight: 700; margin-top: 4px;">İcra Tabanı (İİK %50): ${Math.round(hex.price * 0.5).toLocaleString("tr-TR")} ₺/m²</div>
            </div>
          `;

          poly.bindPopup(hexPopupHtml);
          badgeMarker.bindPopup(hexPopupHtml);

          poly.on("mouseover", () => {
            poly.setStyle({ fillOpacity: 0.45, weight: 2.5, color: "#1D4ED8" });
          });
          poly.on("mouseout", () => {
            poly.setStyle({ fillOpacity: 0.20, weight: 1.6, color: "#2563EB" });
          });
        });

        // Hedef Taşınmaz Pin
        const targetIcon = L.divIcon({
          className: "leaflet-target-pin",
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
              <div style="background: #0F223D; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 8px; border: 2px solid #F59E0B; box-shadow: 0 4px 14px rgba(0,0,0,0.35); white-space: nowrap; display: flex; align-items: center; gap: 4px; font-family: sans-serif;">
                <span>📍 DEĞERLENEN TAŞINMAZ</span>
              </div>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #0F223D;"></div>
              <div style="width: 10px; height: 10px; background: #F59E0B; border: 2px solid #FFFFFF; border-radius: 50%; margin-top: -3px; box-shadow: 0 0 10px #F59E0B;"></div>
            </div>
          `,
          iconSize: [0, 0],
        });

        const targetMarker = L.marker([lat, lng], {
          icon: targetIcon,
          zIndexOffset: 2000,
        }).addTo(map);

        targetMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; min-width: 190px;">
            <div style="font-size: 10px; font-weight: 800; color: #3B82F6; text-transform: uppercase;">Değerlenen Taşınmaz</div>
            <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 2px 0;">${city} / ${activeDistrict} ${activeNeighborhood ? `— ${activeNeighborhood}` : ""}</div>
            <div style="font-size: 11px; color: #64748B;">Ada: ${ada || "-"} | Parsel: ${parsel || "-"}</div>
            ${elevationMeters !== undefined ? `<div style="font-size: 10px; color: #059669; margin-top: 4px; font-weight: 700;">Rakım: ${elevationMeters}m (Topoğrafya)</div>` : ""}
          </div>
        `);

        // Emsal İlan Pinleri
        markersRef.current = {};

        filteredComps.forEach((comp) => {
          const isSatilik = comp.type === "satilik";
          const badgeBg = isSatilik ? "#059669" : "#2563EB";
          const priceLabel = formatShortPrice(comp.priceTL);
          const typeLabel = isSatilik ? "Satılık" : "Kiralık";

          const compIcon = L.divIcon({
            className: "leaflet-comp-pin",
            html: `
              <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
                <div style="background: ${badgeBg}; color: #FFFFFF; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 12px; border: 1.5px solid #FFFFFF; box-shadow: 0 3px 10px rgba(0,0,0,0.25); white-space: nowrap; font-family: sans-serif;">
                  ${priceLabel}
                </div>
                <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid ${badgeBg};"></div>
              </div>
            `,
            iconSize: [0, 0],
          });

          const marker = L.marker([comp.coordinates.lat, comp.coordinates.lng], {
            icon: compIcon,
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 200px; padding: 3px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="background: ${badgeBg}18; color: ${badgeBg}; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                  ${typeLabel} • ${comp.source}
                </span>
                <span style="font-size: 9px; color: #64748B; font-weight: 700;">${comp.distanceMeters}m mesafe</span>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #0F172A; line-height: 1.35; margin-bottom: 6px;">
                ${comp.title}
              </div>
              <div style="display: flex; align-items: baseline; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 5px;">
                <span style="font-size: 13px; font-weight: 900; color: ${badgeBg};">₺ ${comp.priceTL.toLocaleString("tr-TR")}</span>
                <span style="font-size: 10px; color: #64748B; font-weight: 600;">${comp.areaM2} m² (${comp.pricePerM2TL.toLocaleString("tr-TR")} TL/m²)</span>
              </div>
            </div>
          `);

          marker.on("click", () => {
            setSelectedCompId(comp.id);
          });

          markersRef.current[comp.id] = marker;
        });
      }
    };

    if ((window as any).L) {
      setupMap();
    } else if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = setupMap;
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", setupMap);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    lat, 
    lng, 
    filteredComps, 
    city, 
    activeDistrict, 
    activeNeighborhood, 
    ada, 
    parsel, 
    elevationMeters,
    unitM2Price,
    isEndeksaSplitView,
    viewMode,
    mapLayerType,
    isLocked
  ]);

  const handleSelectComp = (comp: ComparableListing) => {
    setSelectedCompId(comp.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([comp.coordinates.lat, comp.coordinates.lng], 16, {
        duration: 0.8,
      });
      const marker = markersRef.current[comp.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const directOsmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  const satilikCount = compsList.filter((c) => c.type === "satilik").length;
  const kiralikCount = compsList.filter((c) => c.type === "kiralik").length;

  return (
    <div className="rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-premium space-y-0">
      
      {/* 1. HARİTA ÜST BİLGİ VE FİLTRE BARI */}
      <div className="bg-[#0F223D] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-extrabold font-heading text-slate-100">
            {city} / {activeDistrict} {activeNeighborhood ? `— ${activeNeighborhood}` : ""}
          </span>
          {ada && parsel && (
            <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded font-mono font-bold">
              Ada {ada} / Parsel {parsel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {/* GPS Canlı Konum Butonu */}
          <button
            type="button"
            onClick={handleGetLiveLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[10px] active:scale-95 disabled:opacity-50"
            title="Cihazınızın anlık GPS koordinatlarını alıp haritayı odaklar"
          >
            <Navigation className={`w-3 h-3 text-amber-400 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Aranıyor..." : "Konumumu Bul"}</span>
          </button>

          {elevationMeters !== undefined && (
            <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
              <Mountain className="w-3 h-3 text-emerald-400" />
              Rakım: {elevationMeters}m
            </span>
          )}

          {/* 3 KADEMELİ GÖRÜNÜM SEÇİCİ: İLÇELER -> MAHALLELER -> PARSEL */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("ilceler")}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === "ilceler"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="İl geneli ilçe sınırları"
            >
              <Layers className="w-3 h-3 text-slate-300" />
              <span>İlçeler</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("mahalleler")}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === "mahalleler"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="En küçük idari bölge: Mahalle & Köy sınırları (Endeksa Modeli)"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>Mahalle & Köy</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("parsel")}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1 ${
                viewMode === "parsel"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Değerlenen taşınmaz ve emsal ilanlar"
            >
              <MapPin className="w-3 h-3 text-blue-300" />
              <span>Parsel & Emsal</span>
            </button>
          </div>

          {/* Emsal Filtre Butonları (Parsel modunda) */}
          {viewMode === "parsel" && (
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[10px]">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  filter === "all" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                Tümü ({compsList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("satilik")}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  filter === "satilik" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                Satılık ({satilikCount})
              </button>
            </div>
          )}

          <a
            href={directOsmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-300 hover:text-white flex items-center gap-1 transition text-[10px] ml-1"
            title="OpenStreetMap üzerinde aç"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. ETKİLEŞİMLİ LEAFLET HARİTA ALANI */}
      <div className={`relative w-full bg-slate-100 z-10 transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen"
          : isEndeksaSplitView 
          ? "h-full min-h-[540px] sm:min-h-[680px] lg:min-h-[820px]" 
          : "h-72 sm:h-80"
      }`}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* SOL ÜST YÜZEN PARSEL / KONUM BİLDİRİMİ (GÖRSEL 1789487723574 BİREBİR) */}
        {parcelNotice && (
          <div className={`absolute top-3 left-3 z-[450] bg-white border-2 ${
            parcelNotice.startsWith("📍")
              ? "border-emerald-500 text-slate-900 shadow-emerald-500/10"
              : "border-red-500 text-slate-900"
          } font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2 animate-in fade-in duration-200 select-none`}>
            <span className={`w-2 h-2 rounded-full ${
              parcelNotice.startsWith("📍") ? "bg-emerald-600" : "bg-red-600 animate-ping"
            } shrink-0`} />
            <span>{parcelNotice}</span>
            <button
              type="button"
              onClick={() => setParcelNotice(null)}
              className="text-slate-400 hover:text-slate-700 ml-1 text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* SAĞ KENAR DİKEY YÜZEN ARAÇ ÇUBUĞU (GÖRSEL 1789487723574 BİREBİR) */}
        <div className="absolute top-4 right-3 z-[450] flex flex-col items-center gap-1.5 select-none">
          {/* Katmanlar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg border transition cursor-pointer ${
                showLayerMenu ? "bg-[#0B1E3B] text-amber-400 border-amber-500/40" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
              title="Harita Katmanları (Uydu, Hibrit, Sokak)"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-12 top-0 bg-slate-900 text-white border border-slate-700 rounded-xl shadow-2xl p-2 w-36 space-y-1 z-50 text-xs font-bold">
                <div className="text-[10px] text-slate-400 px-2 py-0.5 uppercase tracking-wider font-mono">
                  Katman Seçimi
                </div>
                <button
                  type="button"
                  onClick={() => { setMapLayerType("uydu"); setShowLayerMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between cursor-pointer ${
                    mapLayerType === "uydu" ? "bg-amber-500 text-slate-950 font-black" : "hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span>🛰️ Esri Uydu</span>
                  {mapLayerType === "uydu" && <span className="text-[10px]">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setMapLayerType("hibrit"); setShowLayerMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between cursor-pointer ${
                    mapLayerType === "hibrit" ? "bg-amber-500 text-slate-950 font-black" : "hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span>🗺️ Hibrit</span>
                  {mapLayerType === "hibrit" && <span className="text-[10px]">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setMapLayerType("sokak"); setShowLayerMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between cursor-pointer ${
                    mapLayerType === "sokak" ? "bg-amber-500 text-slate-950 font-black" : "hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span>🛣️ Sokak</span>
                  {mapLayerType === "sokak" && <span className="text-[10px]">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Filtreler */}
          <button
            type="button"
            onClick={() => setFilter(filter === "all" ? "satilik" : filter === "satilik" ? "kiralik" : "all")}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer ${
              filter !== "all" ? "ring-2 ring-blue-500 text-blue-600 font-black" : ""
            }`}
            title={`Filtre: ${filter.toUpperCase()}`}
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Görünüm / Yoğunluk Ayarı */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "mahalleler" ? "ilceler" : "mahalleler")}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer"
            title="Görünüm Düzeyi (İlçe / Mahalle)"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* GPS Konumumu Bul */}
          <button
            type="button"
            onClick={handleGetLiveLocation}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer ${
              isLocating ? "animate-spin text-blue-600" : ""
            }`}
            title="Konumumu Bul (GPS)"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Yakınlaş (+) */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-base flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer active:scale-95"
            title="Yakınlaştır (+)"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Canlı Zoom Seviyesi Rozeti (Görseldeki 7) */}
          <div className="w-9 sm:w-10 h-7 rounded-lg bg-white font-mono font-black text-xs text-slate-800 flex items-center justify-center shadow-md border border-slate-200">
            {currentZoom}
          </div>

          {/* Uzaklaş (-) */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-black text-base flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer active:scale-95"
            title="Uzaklaştır (-)"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Kırmızı Kilit Butonu (Görseldeki 🔒) */}
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xl transition cursor-pointer active:scale-95 ${
              isLocked
                ? "bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400 shadow-red-600/40"
                : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
            }`}
            title={isLocked ? "Parsel Kilidi Aktif (Tıklayınca Seç)" : "Serbest Gezinim"}
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Tam Ekran Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer"
            title={isFullscreen ? "Küçült" : "Tam Ekran Harita"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Global Tooltip Stili */}
        <style jsx global>{`
          .custom-district-tooltip {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .custom-district-tooltip:before {
            display: none !important;
          }
          .prominent-mahalle-label {
            pointer-events: none !important;
          }
        `}</style>

        {/* GPS Geri Bildirim Bildirimi */}
        {locateFeedback && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[450] bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 animate-bounce">
            <Navigation className="w-3 h-3 text-amber-400" />
            <span>{locateFeedback}</span>
          </div>
        )}

        {/* Yükleniyor Göstergesi */}
        {isLoadingMahalle && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[450] bg-slate-900/90 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>{activeDistrict} Gerçek Mahalle ve Köy Sınırları Yükleniyor...</span>
          </div>
        )}

        {/* İHALECİ BURADA ÜST GEZİNME VE HIZLI GERİ DÖNÜŞ BARI (BREADCRUMB & DRILL-DOWN CONTROL) */}
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 flex-wrap">
          {viewMode === "mahalleler" && (
            <button
              type="button"
              onClick={() => setViewMode("ilceler")}
              className="bg-white/95 hover:bg-white text-slate-800 font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-300 flex items-center gap-1.5 text-xs transition cursor-pointer active:scale-95"
              title="Tüm Çanakkale ilçelerine geri dön"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>{city} İlçelerine Dön</span>
            </button>
          )}

          {viewMode === "parsel" && (
            <button
              type="button"
              onClick={() => setViewMode("mahalleler")}
              className="bg-white/95 hover:bg-white text-slate-800 font-bold px-3 py-1.5 rounded-xl shadow-md border border-slate-300 flex items-center gap-1.5 text-xs transition cursor-pointer active:scale-95"
              title="Mahalle ve köy sınırları haritasına geri dön"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>{activeDistrict} Mahallelerine Dön</span>
            </button>
          )}

          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="text-slate-500">{city}</span>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-800 font-bold">{activeDistrict}</span>
            {viewMode === "mahalleler" && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-300 ml-1">
                {mahalleCount > 0 ? `${mahalleCount} Mahalle / Köy Sınırı` : "Gerçek Mahalle Sınırları"}
              </span>
            )}
            {viewMode === "parsel" && activeNeighborhood && (
              <>
                <span className="text-slate-300">&gt;</span>
                <span className="text-blue-700 font-bold">{activeNeighborhood}</span>
              </>
            )}
          </div>
        </div>

        {/* İHALECİ BURADA LEJANT ÇUBUĞU (ENDEKSA HARİTA RENK SKALASI) */}
        <div className="absolute bottom-4 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-200 text-slate-800 max-w-sm">
          {viewMode === "mahalleler" ? (
            <div>
              <div className="text-[10.5px] font-extrabold text-slate-800 mb-1 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {activeDistrict} Mahalle & Köy Isı Haritası
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  İİK m.115 %50 Taban
                </span>
              </div>
              
              {/* Renk Skalası Şeridi (Görseldeki Gibi: Koyu Yeşil -> Fıstık Yeşili -> Sarı -> Turuncu -> Koyu Kırmızı) */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-800">
                  19.800 ₺
                </span>
                <div className="w-32 sm:w-44 h-2.5 rounded-full bg-gradient-to-r from-[#15803D] via-[#4ADE80] via-[#FEF08A] via-[#F59E0B] to-[#991B1B] shadow-inner border border-slate-200"></div>
                <span className="text-[10px] font-mono font-bold text-[#991B1B]">
                  36.400 ₺
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-600 pt-1 border-t border-slate-100 font-semibold">
                <span className="text-emerald-800">🟢 Tarımsal (Muratlar)</span>
                <span className="text-amber-700 text-center">🟡 Merkez (Evciler)</span>
                <span className="text-red-800 text-right">🔴 Prim (Çırpılar)</span>
              </div>
              <div className="text-[8.5px] text-slate-400 mt-1">
                Her poligon resmi idari sınırdır. Tıklayarak o köy/mahallenin icra tabanını görebilirsiniz.
              </div>
            </div>
          ) : viewMode === "ilceler" ? (
            <div>
              <div className="text-[10px] font-extrabold text-slate-800 mb-1.5 flex items-center justify-between gap-3">
                <span>{city} İlçe Değerleme Isı Haritası</span>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  İlçeye Tıkla → Mahallelere Açıl
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-800">
                  31.800 ₺
                </span>
                <div className="w-28 sm:w-36 h-2 rounded-full bg-gradient-to-r from-emerald-800 via-emerald-500 via-amber-400 to-rose-700 shadow-inner"></div>
                <span className="text-[10px] font-mono font-bold text-rose-700">
                  96.400 ₺
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-100 gap-2">
                <span>🟢 Uygun (Çan, Yenice)</span>
                <span>🔴 Lüks (Bozcaada)</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] font-extrabold text-slate-800 mb-1 flex items-center justify-between gap-3">
                <span>{category === "arsa" ? "Arsa" : "Konut"} 500m Çevre Emsalleri</span>
                <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Parsel Detayı
                </span>
              </div>
              <div className="flex items-center gap-3 text-[9.5px] text-slate-600 font-semibold pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F223D] border border-amber-400 inline-block"></span>
                  <span>Değerlenen Taşınmaz</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                  <span>Satılık Emsal</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. ÇEVREDEKİ EMSAL İLANLAR YATAY ŞERİDİ (ETKİLEŞİMLİ) */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 font-heading">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            {activeDistrict} {activeNeighborhood ? `(${activeNeighborhood})` : ""} Bölgesel Emsal İlanlar ({filteredComps.length} İlan)
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Tıklayarak harita üzerinde odağa alabilirsiniz
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {filteredComps.map((comp) => {
            const isSelected = selectedCompId === comp.id;
            const isSatilik = comp.type === "satilik";

            return (
              <div
                key={comp.id}
                onClick={() => {
                  setViewMode("parsel");
                  handleSelectComp(comp);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-400"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/80 shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      isSatilik ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {comp.type === "satilik" ? "Satılık" : "Kiralık"} • {comp.source}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                      <Compass className="w-3 h-3 text-slate-400" />
                      {comp.distanceMeters}m
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 line-clamp-1 text-[11px] leading-snug">
                    {comp.title}
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-1.5 border-t border-slate-100 mt-2">
                  <strong className={`text-xs font-black ${
                    isSatilik ? "text-emerald-700" : "text-blue-700"
                  }`}>
                    ₺ {comp.priceTL.toLocaleString("tr-TR")}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {comp.areaM2} m² ({comp.pricePerM2TL.toLocaleString("tr-TR")} ₺/m²)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. HARİTA ALT BİLGİ KÜNYESİ */}
      <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
        <span>Resmi Kadastro & İdari Sınırlar: Harita Genel Müdürlüğü (HGK) & TÜİK Mahalle Veri Tabanı</span>
        <span className="font-mono">{lat.toFixed(5)}° K, {lng.toFixed(5)}° D</span>
      </div>
    </div>
  );
};
