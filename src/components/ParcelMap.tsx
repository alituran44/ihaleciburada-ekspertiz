"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { ComparableListing, PropertyCategory } from "@/types";
import { getDistrictValuation } from "@/lib/districtValuations";
import { findFastLocationFromCoords, getCadastreForCoordinates } from "@/lib/turkeyLocations";
import { formatArea, parseTurkishNumber } from "@/lib/constants";
import { 
  MapPin, 
  Mountain, 
  Layers, 
  Compass, 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Filter, 
  Sparkles,
  ShieldCheck,
  Ruler,
  Shapes,
  Navigation,
  Share2,
  Copy,
  Check,
  RotateCcw,
  X,
  Sliders
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
  category?: PropertyCategory;
  unitM2Price?: number;
  areaM2?: number;
  isEndeksaSplitView?: boolean;
  searchRadius?: number;
  focusedCompId?: string | null;
  focusTrigger?: number;
  onSelectComparable?: (comp: ComparableListing) => void;
  onLocationFound?: (coords: { lat: number; lng: number }) => void;
  onSelectDistrict?: (districtName: string) => void;
  onSelectNeighborhood?: (neighborhoodName: string) => void;
  onLocationSelect?: (loc: {
    city: string;
    district: string;
    neighborhood: string;
    coordinates: { lat: number; lng: number };
    unitPrice?: number;
    ada?: string;
    parsel?: string;
    areaM2?: number;
    comparables?: ComparableListing[];
    polygonGeoJson?: any;
    isOfficialCadastre?: boolean;
    nitelik?: string;
  }) => void;
  isSidebarCollapsed?: boolean;
  sidebarWidth?: number;
  onToggleSidebar?: () => void;
  onSetSidebarWidth?: (width: number) => void;
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

function formatDistance(meters: number): string {
  if (!meters) return "0 m";
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km (${Math.round(meters)} m)`;
  }
  return `${Math.round(meters)} m`;
}

function computePolygonArea(pts: L.LatLng[]): number {
  if (!pts || pts.length < 3) return 0;
  const rad = Math.PI / 180;
  const meanLat = (pts.reduce((acc, p) => acc + p.lat, 0) / pts.length) * rad;
  const R = 6378137;
  const projected = pts.map((p) => ({
    x: p.lng * rad * R * Math.cos(meanLat),
    y: p.lat * rad * R,
  }));
  let area = 0;
  for (let i = 0; i < projected.length; i++) {
    const j = (i + 1) % projected.length;
    area += projected[i].x * projected[j].y;
    area -= projected[j].x * projected[i].y;
  }
  return Math.abs(area) / 2;
}

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
  unitM2Price = 54085,
  areaM2 = 135,
  isEndeksaSplitView = false,
  searchRadius = 1000,
  focusedCompId,
  focusTrigger,
  onSelectComparable,
  onLocationFound,
  onSelectDistrict,
  onSelectNeighborhood,
  onLocationSelect,
  isSidebarCollapsed,
  sidebarWidth,
  onToggleSidebar,
  onSetSidebarWidth,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const parcelLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const isInternalClickRef = useRef<boolean>(false);
  const lastInteractedCoordRef = useRef<{ lat: number; lng: number } | null>(null);

  const [filter, setFilter] = useState<"all" | "satilik" | "kiralik">("all");
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [dynamicComps, setDynamicComps] = useState<ComparableListing[] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateFeedback, setLocateFeedback] = useState<string | null>(null);
  
  const [activeDistrict, setActiveDistrict] = useState<string>(district || "Merkez");
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(neighborhood || null);

  // Floating Controls
  const [currentZoom, setCurrentZoom] = useState<number>(17);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [parcelNotice, setParcelNotice] = useState<string | null>(null);
  const [mapLayerType, setMapLayerType] = useState<"satellite" | "streets">("satellite");

  // Saha ve Ölçüm Araçları (Mesafe Cetveli & Alan Ölçer)
  const [activeTool, setActiveTool] = useState<"none" | "ruler" | "area">("none");
  const activeToolRef = useRef<"none" | "ruler" | "area">("none");
  const measurementLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [rulerPoints, setRulerPoints] = useState<L.LatLng[]>([]);
  const [areaPoints, setAreaPoints] = useState<L.LatLng[]>([]);
  const [rulerDistance, setRulerDistance] = useState<number>(0);
  const [areaM2Value, setAreaM2Value] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // WMS / Tematik İmar ve Çevre Katmanları (ÇŞİDB & MTA)
  const [thematicLayers, setThematicLayers] = useState<{
    eplan: boolean;
    fay: boolean;
    sit: boolean;
    kiyi: boolean;
  }>({
    eplan: false,
    fay: false,
    sit: false,
    kiyi: false,
  });
  const [thematicOpacity, setThematicOpacity] = useState<number>(0.75);
  const thematicLayersRef = useRef<{ [key: string]: L.TileLayer.WMS }>({});

  const handleRulerClickRef = useRef<(latlng: L.LatLng) => void>(() => {});
  const handleAreaClickRef = useRef<(latlng: L.LatLng) => void>(() => {});

  // Ölçüm Modu Cursor & Ref Senkronizasyonu
  useEffect(() => {
    activeToolRef.current = activeTool;
    if (mapContainerRef.current) {
      if (activeTool !== "none") {
        mapContainerRef.current.style.cursor = "crosshair";
      } else {
        mapContainerRef.current.style.cursor = "";
      }
    }
  }, [activeTool]);

  // ESC Tuşu ile Ölçümden Çıkış
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeToolRef.current !== "none") {
        closeMeasurement();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // WMS Tematik Katmanlar Senkronizasyonu (e-Plan, Fay, Sit, Kıyı)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const wmsConfigs: { [key: string]: { url: string; layers: string; attribution: string } } = {
      eplan: {
        url: "https://tucbs-public-api3.csb.gov.tr/trk_cbsgm_eplanvector_wms",
        layers: "eplanvector",
        attribution: "© ÇŞİDB e-Plan İmar Planı",
      },
      fay: {
        url: "https://yerbilimleri.mta.gov.tr/wms",
        layers: "diri_fay",
        attribution: "© MTA Diri Fay Haritası",
      },
      sit: {
        url: "https://tucbs-public-api3.csb.gov.tr/trk_csb_tabiat_wms",
        layers: "sit_alanlari",
        attribution: "© ÇŞİDB Doğal Sit",
      },
      kiyi: {
        url: "https://tucbs-public-api3.csb.gov.tr/trk_csb_mpgm_kiyikenar_wms",
        layers: "kiyi_kenar_cizgisi",
        attribution: "© ÇŞİDB Kıyı Kenar",
      },
    };

    Object.entries(thematicLayers).forEach(([key, isEnabled]) => {
      const existingLayer = thematicLayersRef.current[key];
      if (isEnabled) {
        if (!existingLayer && wmsConfigs[key]) {
          try {
            const cfg = wmsConfigs[key];
            const newWms = L.tileLayer.wms(cfg.url, {
              layers: cfg.layers,
              format: "image/png",
              transparent: true,
              opacity: thematicOpacity,
              maxZoom: 21,
              attribution: cfg.attribution,
            }).addTo(map);
            thematicLayersRef.current[key] = newWms;
          } catch (err) {
            console.error("WMS katmanı yüklenemedi:", err);
          }
        } else if (existingLayer) {
          existingLayer.setOpacity(thematicOpacity);
        }
      } else {
        if (existingLayer) {
          map.removeLayer(existingLayer);
          delete thematicLayersRef.current[key];
        }
      }
    });
  }, [thematicLayers, thematicOpacity]);

  // Cetvel ve Alan Çizim Fonksiyonları
  const renderRuler = (pts: L.LatLng[]) => {
    if (!measurementLayerGroupRef.current) return;
    measurementLayerGroupRef.current.clearLayers();

    if (pts.length === 0) {
      setRulerDistance(0);
      return;
    }

    if (pts.length > 1) {
      L.polyline(pts, {
        color: "#F59E0B",
        weight: 3.5,
        dashArray: "6, 6",
        opacity: 0.95,
      }).addTo(measurementLayerGroupRef.current);
    }

    let totalDist = 0;
    pts.forEach((pt, idx) => {
      if (idx > 0) {
        totalDist += pts[idx - 1].distanceTo(pt);
      }

      L.circleMarker(pt, {
        radius: idx === 0 ? 6 : 5,
        color: "#FFFFFF",
        fillColor: idx === 0 ? "#10B981" : "#F59E0B",
        fillOpacity: 1,
        weight: 2,
      }).addTo(measurementLayerGroupRef.current!);

      const label = idx === 0 ? "Başlangıç" : `${Math.round(totalDist)} m`;
      const markerBadge = L.divIcon({
        className: "leaflet-ruler-badge",
        html: `
          <div style="transform: translate(8px, -18px); pointer-events: none;">
            <div style="background: rgba(15, 23, 42, 0.92); color: ${idx === 0 ? '#34D399' : '#FDE047'}; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.5); white-space: nowrap; font-family: monospace; box-shadow: 0 2px 6px rgba(0,0,0,0.35);">
              ${label}
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker(pt, { icon: markerBadge }).addTo(measurementLayerGroupRef.current!);
    });

    setRulerDistance(totalDist);
  };

  const renderArea = (pts: L.LatLng[]) => {
    if (!measurementLayerGroupRef.current) return;
    measurementLayerGroupRef.current.clearLayers();

    if (pts.length === 0) {
      setAreaM2Value(0);
      return;
    }

    if (pts.length === 2) {
      L.polyline(pts, {
        color: "#3B82F6",
        weight: 2.5,
        dashArray: "4, 4",
        opacity: 0.9,
      }).addTo(measurementLayerGroupRef.current);
    } else if (pts.length >= 3) {
      L.polygon(pts, {
        color: "#2563EB",
        weight: 2.5,
        dashArray: "4, 4",
        fillColor: "#3B82F6",
        fillOpacity: 0.28,
      }).addTo(measurementLayerGroupRef.current);
    }

    pts.forEach((pt) => {
      L.circleMarker(pt, {
        radius: 5,
        color: "#FFFFFF",
        fillColor: "#2563EB",
        fillOpacity: 1,
        weight: 2,
      }).addTo(measurementLayerGroupRef.current!);
    });

    if (pts.length >= 3) {
      const area = computePolygonArea(pts);
      setAreaM2Value(area);

      const centerLat = pts.reduce((a, b) => a + b.lat, 0) / pts.length;
      const centerLng = pts.reduce((a, b) => a + b.lng, 0) / pts.length;
      const donum = (area / 1000).toFixed(2);

      const centerBadge = L.divIcon({
        className: "leaflet-area-badge",
        html: `
          <div style="transform: translate(-50%, -50%); pointer-events: none;">
            <div style="background: rgba(15, 34, 61, 0.95); color: #93C5FD; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 8px; border: 1.5px solid #3B82F6; white-space: nowrap; font-family: monospace; box-shadow: 0 4px 12px rgba(0,0,0,0.35); text-align: center;">
              <div style="color: #FFFFFF; font-weight: 900; font-size: 12px;">📐 ${Math.round(area).toLocaleString("tr-TR")} m²</div>
              <div style="color: #60A5FA; font-size: 10px;">${donum} Dönüm</div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker([centerLat, centerLng], { icon: centerBadge }).addTo(measurementLayerGroupRef.current!);
    } else {
      setAreaM2Value(0);
    }
  };

  handleRulerClickRef.current = (latlng: L.LatLng) => {
    setRulerPoints((prev) => {
      const next = [...prev, latlng];
      renderRuler(next);
      return next;
    });
  };

  handleAreaClickRef.current = (latlng: L.LatLng) => {
    setAreaPoints((prev) => {
      const next = [...prev, latlng];
      renderArea(next);
      return next;
    });
  };

  const resetMeasurement = () => {
    if (measurementLayerGroupRef.current) {
      measurementLayerGroupRef.current.clearLayers();
    }
    setRulerPoints([]);
    setRulerDistance(0);
    setAreaPoints([]);
    setAreaM2Value(0);
  };

  const closeMeasurement = () => {
    resetMeasurement();
    setActiveTool("none");
    activeToolRef.current = "none";
  };

  const toggleRuler = () => {
    if (activeTool === "ruler") {
      closeMeasurement();
    } else {
      resetMeasurement();
      setActiveTool("ruler");
      activeToolRef.current = "ruler";
      setParcelNotice("📏 Mesafe Ölçer Aktif: Haritada başlangıç ve varış noktalarına tıklayın.");
    }
  };

  const toggleArea = () => {
    if (activeTool === "area") {
      closeMeasurement();
    } else {
      resetMeasurement();
      setActiveTool("area");
      activeToolRef.current = "area";
      setParcelNotice("📐 Alan Ölçer Aktif: Parsel veya arazinin köşe noktalarına sırayla tıklayın (en az 3 nokta).");
    }
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const currentTotal = (unitM2Price || 54085) * (areaM2 || 135);
    const text = 
`🏛️ *İhaleciBurada Gayrimenkul & Parsel Bilgisi*
📍 *Konum:* ${city} / ${activeDistrict} ${activeNeighborhood ? `• ${activeNeighborhood}` : ""}
📋 *Ada / Parsel:* ${activeAda} / ${activeParsel}
📐 *Yüzölçümü:* ${formatArea(areaM2)} m²
🏢 *Nitelik:* ${category === "konut" ? "Konut & Daire" : "İmarlı Arsa"}
💰 *Bölge Rayici:* ${(unitM2Price || 54085).toLocaleString("tr-TR")} ₺/m²
🏷️ *Tahmini Değer:* ${currentTotal.toLocaleString("tr-TR")} ₺
🗺️ *Google Haritalar:* https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}
🌐 *Analiz Linki:* ${typeof window !== "undefined" ? window.location.href : ""}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyKunye = () => {
    const text = `${city} / ${activeDistrict} ${activeNeighborhood ? `• ${activeNeighborhood}` : ""} | Ada: ${activeAda}, Parsel: ${activeParsel} | GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)} | ${formatArea(areaM2)} m² | ${(unitM2Price || 54085).toLocaleString("tr-TR")} ₺/m²`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setParcelNotice(`📋 Künye ve GPS koordinatları panoya kopyalandı!`);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const handleSwitchLayer = (type: "satellite" | "streets") => {
    setMapLayerType(type);
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newUrl = type === "satellite"
      ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const newLayer = L.tileLayer(newUrl, {
      maxZoom: type === "satellite" ? 21 : 19,
      attribution: type === "satellite" ? '© Google Uydu • TKGM Kadastro' : '© OpenStreetMap • İhaleciBurada GIS',
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  };

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

  // Sync scrollWheelZoom with lock state
  useEffect(() => {
    if (mapInstanceRef.current) {
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

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız GPS konum servisini desteklemiyor.");
      return;
    }

    setIsLocating(true);
    setLocateFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = Number(position.coords.latitude.toFixed(6));
        const userLng = Number(position.coords.longitude.toFixed(6));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 16, { duration: 1.2 });
        }

        // 1. Yerel hızlı eşleme
        const fastLoc = findFastLocationFromCoords(userLat, userLng);
        const uCad = getCadastreForCoordinates(userLat, userLng);
        const initialAda = uCad.ada || "";
        const initialParsel = uCad.parsel || "";
        const fastVal = getDistrictValuation(fastLoc.city, fastLoc.district, unitM2Price, {
          category,
          neighborhood: fastLoc.neighborhood,
          ada: initialAda,
          parsel: initialParsel,
          areaM2,
        });
        const resolvedPrice = fastVal.pricePerM2TL;
        const initialBadge = (initialAda && initialParsel) ? ` • Ada ${initialAda} / Parsel ${initialParsel}` : "";

        setActiveDistrict(fastLoc.district);
        setActiveNeighborhood(fastLoc.neighborhood);
        setParcelNotice(`📍 ${fastLoc.district} / ${fastLoc.city}${initialBadge} • ${resolvedPrice.toLocaleString("tr-TR")} ₺/m²`);

        const generatedComps = drawParcelHoneycomb(
          userLat,
          userLng,
          resolvedPrice,
          fastLoc.city,
          fastLoc.district,
          fastLoc.neighborhood,
          initialAda,
          initialParsel
        );

        if (onLocationSelect) {
          onLocationSelect({
            city: fastLoc.city,
            district: fastLoc.district,
            neighborhood: fastLoc.neighborhood,
            coordinates: { lat: userLat, lng: userLng },
            unitPrice: resolvedPrice,
            ada: initialAda,
            parsel: initialParsel,
            comparables: generatedComps,
          });
        }

        if (onLocationFound) {
          onLocationFound({ lat: userLat, lng: userLng });
        }

        // 2. Detaylı tersine çözümleme ve TKGM Resmi Kadastro Sorgusu
        try {
          const res = await fetch(`/api/location/search?lat=${userLat}&lng=${userLng}`);
          const data = await res.json();
          if (data.success && data.location) {
            const loc = data.location;
            const refCity = loc.province || fastLoc.city;
            const refDist = loc.district || fastLoc.district;
            const refNeigh = loc.neighborhood || fastLoc.neighborhood;
            const refAda = loc.ada || initialAda;
            const refParsel = loc.parsel || initialParsel;
            const refArea = loc.alanM2;

            drawParcelHoneycomb(
              userLat,
              userLng,
              resolvedPrice,
              refCity,
              refDist,
              refNeigh,
              refAda,
              refParsel,
              refArea,
              loc.polygonGeoJson
            );

            setActiveDistrict(refDist);
            if (refNeigh) setActiveNeighborhood(refNeigh);

            const adaParselDesc = (refAda && refParsel) ? `Ada ${refAda} / Parsel ${refParsel}` : "Kadastro Parseli";
            const areaDesc = refArea ? ` • ${formatArea(refArea)} m²` : "";
            const officialBadge = loc.isOfficialCadastre ? "🏛️ TKGM Onaylı" : "📍";

            setParcelNotice(`${officialBadge} ${refDist} / ${refCity}${refNeigh ? ` • ${refNeigh}` : ""} • ${adaParselDesc}${areaDesc} • ${resolvedPrice.toLocaleString("tr-TR")} ₺/m²`);

            if (onLocationSelect) {
              onLocationSelect({
                city: refCity,
                district: refDist,
                neighborhood: refNeigh,
                coordinates: { lat: userLat, lng: userLng },
                unitPrice: resolvedPrice,
                ada: refAda,
                parsel: refParsel,
                areaM2: refArea,
                comparables: generatedComps,
                polygonGeoJson: loc.polygonGeoJson,
                isOfficialCadastre: loc.isOfficialCadastre,
                nitelik: loc.nitelik,
              });
            }
            setLocateFeedback(`📍 ${refNeigh ? refNeigh + ", " : ""}${refDist} / ${refCity} (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
          } else {
            setLocateFeedback(`GPS Konumu Alındı: ${fastLoc.district} (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
          }
        } catch (e) {
          setLocateFeedback(`GPS Konumu Alındı (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
        } finally {
          setIsLocating(false);
          setTimeout(() => setLocateFeedback(null), 5000);
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
  const lat = coordinates?.lat || 40.1553;
  const lng = coordinates?.lng || 26.4142;

  const currentCad = useMemo(() => getCadastreForCoordinates(lat, lng), [lat, lng]);
  const activeAda = (ada && ada.trim()) ? ada.trim() : currentCad.ada;
  const activeParsel = (parsel && parsel.trim()) ? parsel.trim() : currentCad.parsel;

  const isResidential = category === "konut";

  // Emsal İlan Listesi
  const compsList: ComparableListing[] = useMemo(() => {
    if (dynamicComps && dynamicComps.length > 0) {
      return dynamicComps;
    }
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
          distanceMeters: 220,
          coordinates: offsetCoord(lat, lng, 220, 30),
          source: "Sahibinden",
          roomCount: "3+1",
          date: "2 gün önce",
        },
        {
          id: "def-res-2",
          title: `${activeNeighborhood || activeDistrict} Site İçi Otoparklı 2+1 Daire`,
          category: "konut",
          type: "satilik",
          areaM2: 110,
          pricePerM2TL: 47200,
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
  }, [comparables, dynamicComps, isResidential, lat, lng, activeNeighborhood, activeDistrict]);

  const filteredComps = useMemo(() => {
    if (filter === "all") return compsList;
    return compsList.filter((c) => c.type === filter);
  }, [compsList, filter]);

  // =========================================================================
  // TAPUSOR BAL PETEĞİ VE PARSEL ÇİZİMİ (Hexagonal Mesh & Tampon Halkaları)
  // =========================================================================
  const drawParcelHoneycomb = (
    cLat: number,
    cLng: number,
    targetPrice: number,
    cCity: string,
    cDist: string,
    cNeigh?: string,
    customAda?: string,
    customParsel?: string,
    customArea?: number,
    customPolygonGeoJson?: any
  ) => {
    if (!parcelLayerGroupRef.current) return [];

    parcelLayerGroupRef.current.clearLayers();
    markersRef.current = {};

    // 1. Çoklu Etki Alanı / Tampon Halkaları (250m, 500m, 1000m)
    L.circle([cLat, cLng], {
      radius: 250,
      color: "#2563EB",
      weight: 2,
      opacity: 0.85,
      fillColor: "#3B82F6",
      fillOpacity: 0.12,
      dashArray: "4, 4",
    }).addTo(parcelLayerGroupRef.current);

    L.circle([cLat, cLng], {
      radius: 500,
      color: "#2563EB",
      weight: 1.5,
      opacity: 0.65,
      fillColor: "#3B82F6",
      fillOpacity: 0.06,
      dashArray: "5, 6",
    }).addTo(parcelLayerGroupRef.current);

    L.circle([cLat, cLng], {
      radius: 1000,
      color: "#2563EB",
      weight: 1,
      opacity: 0.40,
      fillColor: "#3B82F6",
      fillOpacity: 0.03,
      dashArray: "6, 8",
    }).addTo(parcelLayerGroupRef.current);

    // Hasan Hüseyin Yıldırım: Dinamik Arama Radar Çemberi (Yeşil Vurgu)
    if (searchRadius && searchRadius > 0) {
      L.circle([cLat, cLng], {
        radius: searchRadius,
        color: "#10B981",
        weight: 2.5,
        opacity: 0.95,
        fillColor: "#10B981",
        fillOpacity: 0.08,
        dashArray: "6, 6",
      }).addTo(parcelLayerGroupRef.current);
    }

    // 2. Bal Peteği Emsal Kümesi (Hexagonal Honeycomb Mesh)
    const hexRadius = 55; // metre cinsinden petek yarıçapı
    const hexStep = hexRadius * 1.732; // komşu petek merkez mesafesi (~95m)

    const getHexCorners = (hLat: number, hLng: number, r: number): [number, number][] => {
      const pts: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const angleDeg = i * 60 + 30;
        const pt = offsetCoord(hLat, hLng, r, angleDeg);
        pts.push([pt.lat, pt.lng]);
      }
      return pts;
    };

    const locCad = getCadastreForCoordinates(cLat, cLng);
    const targetAda = (customAda && customAda.trim()) ? customAda.trim() : (ada && ada.trim()) ? ada.trim() : (locCad.ada || "");
    const targetParsel = (customParsel && customParsel.trim()) ? customParsel.trim() : (parsel && parsel.trim()) ? parsel.trim() : (locCad.parsel || "");
    const effectiveArea = customArea || areaM2;
    const targetArea = effectiveArea 
      ? formatArea(effectiveArea) 
      : "1.650";

    const adaParselBadgeText = (targetAda && targetParsel) ? `Ada ${targetAda} / Parsel ${targetParsel}` : "Kadastro Parseli";

    // Merkez Hedef Poligonu (Varsa Gerçek TKGM GeoJSON Poligonu, Yoksa Sarı Vurgulu Bal Peteği)
    let centerPolygon: any;
    if (customPolygonGeoJson && (customPolygonGeoJson.type === "Polygon" || customPolygonGeoJson.type === "MultiPolygon")) {
      centerPolygon = L.geoJSON(customPolygonGeoJson, {
        style: {
          color: "#D97706",
          weight: 3.5,
          opacity: 1.0,
          fillColor: "#FDE047",
          fillOpacity: 0.65,
          dashArray: "6, 4",
        }
      }).addTo(parcelLayerGroupRef.current);
    } else {
      const centerHexCorners = getHexCorners(cLat, cLng, hexRadius);
      centerPolygon = L.polygon(centerHexCorners, {
        color: "#D97706",
        weight: 3.5,
        opacity: 1.0,
        fillColor: "#FDE047",
        fillOpacity: 0.65,
        dashArray: "6, 4",
      }).addTo(parcelLayerGroupRef.current);
    }

    centerPolygon.bindTooltip(
      `<div style="font-family: sans-serif; text-align: center; padding: 4px 8px; white-space: nowrap;">
        <div style="font-weight: 900; font-size: 13px; color: #92400E; display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span>🏛️</span>
          <span>Ada: <strong>${targetAda}</strong> / Parsel: <strong>${targetParsel}</strong></span>
        </div>
        <div style="color: #0F172A; font-weight: 800; font-size: 11px; margin-top: 2px;">
          ${targetPrice.toLocaleString("tr-TR")} ₺/m² • ${targetArea} m²
        </div>
        <div style="color: #475569; font-size: 10px;">
          ${cCity} / ${cDist} ${cNeigh ? `• ${cNeigh}` : ""}
        </div>
      </div>`,
      { permanent: false, direction: "top", opacity: 0.98 }
    );

    centerPolygon.on("click", (e: any) => {
      L.DomEvent.stopPropagation(e);
      setParcelNotice(`🏛️ ${adaParselBadgeText} • ${targetPrice.toLocaleString("tr-TR")} ₺/m²`);
      if (onLocationSelect) {
        onLocationSelect({
          city: cCity,
          district: cDist,
          neighborhood: cNeigh || "",
          coordinates: { lat: cLat, lng: cLng },
          unitPrice: targetPrice,
          ada: targetAda,
          parsel: targetParsel,
          areaM2: effectiveArea,
        });
      }
    });

    // 1. Merkezde Yüzen Ada / Parsel ve m² Rozeti (Pim üstünde - Yatay, temiz ve tekil)
    const centerBadgeIcon = L.divIcon({
      className: "leaflet-target-badge",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto; cursor: pointer; white-space: nowrap;">
          <div style="background: #0B1E3B; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 5px 12px; border-radius: 9999px; border: 2px solid #F59E0B; box-shadow: 0 4px 16px rgba(0,0,0,0.4); white-space: nowrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; display: flex; align-items: center; gap: 8px;">
            <span style="background: #F59E0B; color: #0B1E3B; font-weight: 900; padding: 2px 7px; border-radius: 6px; font-size: 10.5px; letter-spacing: -0.2px;">🏛️ ${adaParselBadgeText}</span>
            <span style="color: #FCD34D; font-weight: 800;">${targetPrice.toLocaleString("tr-TR")} ₺/m²</span>
            <span style="color: #94A3B8; font-size: 10px; font-weight: 600;">• ${targetArea} m²</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #F59E0B;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });
    L.marker([cLat, cLng], { icon: centerBadgeIcon }).addTo(parcelLayerGroupRef.current);

    // Çevre 12 Adet Bal Peteği Hücresi (Komşu Kadastro Parselleri)
    const baseAdaNum = parseInt(targetAda.replace(/\D/g, "")) || 0;
    const baseParselNum = parseInt(targetParsel.replace(/\D/g, "")) || 0;

    const honeycombOffsets = [
      { angle: 0, dist: hexStep, mult: 1.04, pOffset: 1, adaOffset: 0 },
      { angle: 60, dist: hexStep, mult: 0.97, pOffset: 2, adaOffset: 0 },
      { angle: 120, dist: hexStep, mult: 1.06, pOffset: 3, adaOffset: 0 },
      { angle: 180, dist: hexStep, mult: 0.92, pOffset: -1, adaOffset: 0 },
      { angle: 240, dist: hexStep, mult: 0.95, pOffset: -2, adaOffset: 0 },
      { angle: 300, dist: hexStep, mult: 1.08, pOffset: -3, adaOffset: 0 },
      { angle: 30, dist: hexStep * 1.732, mult: 1.11, pOffset: 4, adaOffset: 0 },
      { angle: 90, dist: hexStep * 1.732, mult: 1.03, pOffset: 5, adaOffset: 0 },
      { angle: 150, dist: hexStep * 1.732, mult: 0.89, pOffset: -4, adaOffset: 0 },
      { angle: 210, dist: hexStep * 1.732, mult: 0.91, pOffset: -5, adaOffset: 0 },
      { angle: 270, dist: hexStep * 1.732, mult: 0.98, pOffset: 1, adaOffset: 1 },
      { angle: 330, dist: hexStep * 1.732, mult: 1.14, pOffset: 2, adaOffset: -1 },
    ];

    honeycombOffsets.forEach((hCell) => {
      const cellCenter = offsetCoord(cLat, cLng, hCell.dist, hCell.angle);
      const cellCorners = getHexCorners(cellCenter.lat, cellCenter.lng, hexRadius);
      const cellPrice = Math.round(targetPrice * hCell.mult);
      const cellAda = baseAdaNum > 0 ? String(baseAdaNum + hCell.adaOffset) : "";
      const cellParsel = baseParselNum > 0 ? String(Math.max(1, baseParselNum + hCell.pOffset)) : "";
      const cellBadgeLabel = (cellAda && cellParsel) 
        ? (hCell.adaOffset === 0 ? `P. ${cellParsel}` : `${cellAda}/${cellParsel}`)
        : `${cellPrice.toLocaleString("tr-TR")} ₺`;

      const cellPoly = L.polygon(cellCorners, {
        color: "#2563EB",
        weight: 1.5,
        opacity: 0.85,
        fillColor: "#3B82F6",
        fillOpacity: 0.16,
      }).addTo(parcelLayerGroupRef.current!);

      const cellIcon = L.divIcon({
        className: "leaflet-hex-badge",
        html: `
          <div style="transform: translate(-50%, -50%); pointer-events: auto; cursor: pointer;">
            <div style="background: rgba(255, 255, 255, 0.95); color: #1E3A8A; font-weight: 800; font-size: 9px; padding: 2px 6px; border-radius: 8px; border: 1.5px solid rgba(37, 99, 235, 0.45); box-shadow: 0 2px 5px rgba(0,0,0,0.14); white-space: nowrap; font-family: monospace; display: flex; align-items: center; gap: 4px;">
              <span style="color: #2563EB; font-weight: 900;">${cellBadgeLabel}</span>
              ${cellAda && cellParsel ? `<span style="color: #94A3B8;">•</span><span>${cellPrice.toLocaleString("tr-TR")} ₺</span>` : ""}
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      L.marker([cellCenter.lat, cellCenter.lng], { icon: cellIcon }).addTo(parcelLayerGroupRef.current!);

      const tooltipTitle = (cellAda && cellParsel)
        ? `🏛️ Ada: ${cellAda} / Parsel: ${cellParsel}`
        : `📍 Komşu Parsel`;

      cellPoly.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px; padding: 2px 4px;">
          <strong style="color: #1E40AF;">${tooltipTitle}</strong><br/>
          <span style="color: #0F172A; font-weight: 800;">Rayiç: ${cellPrice.toLocaleString("tr-TR")} ₺/m²</span><br/>
          <span style="color: #64748B; font-size: 10px;">Komşu Kadastro Parseli</span>
        </div>`,
        { direction: "center", opacity: 0.95 }
      );

      cellPoly.on("click", (e: any) => {
        L.DomEvent.stopPropagation(e);
        const noticeDesc = (cellAda && cellParsel) ? `🏛️ Ada ${cellAda} / Parsel ${cellParsel}` : `📍 Komşu Parsel`;
        setParcelNotice(`${noticeDesc} • ${cellPrice.toLocaleString("tr-TR")} ₺/m²`);
        if (onLocationSelect) {
          onLocationSelect({
            city: cCity,
            district: cDist,
            neighborhood: cNeigh || "",
            coordinates: { lat: cellCenter.lat, lng: cellCenter.lng },
            unitPrice: cellPrice,
            ada: cellAda || undefined,
            parsel: cellParsel || undefined,
          });
        }
      });
    });

    // 3. Tıklanan Noktanın Çevresine 4-6 Dinamik Emsal İlanı Yerleştir
    const localGeneratedComps: ComparableListing[] = [
      {
        id: `comp-${cLat.toFixed(3)}-1`,
        title: `${cNeigh || cDist} Satılık ${isResidential ? "Balkonlu 3+1 Daire" : "Müstakil Parsel"}`,
        category: category,
        type: "satilik" as const,
        areaM2: isResidential ? 135 : 650,
        pricePerM2TL: Math.round(targetPrice * 0.98),
        priceTL: Math.round(targetPrice * 0.98 * (isResidential ? 135 : 650)),
        distanceMeters: 220,
        coordinates: offsetCoord(cLat, cLng, 220, 35),
        source: "Sahibinden",
        roomCount: isResidential ? "3+1" : undefined,
        zoningType: isResidential ? undefined : "Konut İmarlı",
        date: "Dün",
      },
      {
        id: `comp-${cLat.toFixed(3)}-2`,
        title: `${cNeigh || cDist} ${isResidential ? "Site İçi Otoparklı 2+1" : "Yola Cepheli Arsa"}`,
        category: category,
        type: "satilik" as const,
        areaM2: isResidential ? 110 : 1200,
        pricePerM2TL: Math.round(targetPrice * 1.05),
        priceTL: Math.round(targetPrice * 1.05 * (isResidential ? 110 : 1200)),
        distanceMeters: 380,
        coordinates: offsetCoord(cLat, cLng, 380, 140),
        source: "Hepsiemlak",
        roomCount: isResidential ? "2+1" : undefined,
        zoningType: isResidential ? undefined : "Gelişme Konut",
        date: "2 gün önce",
      },
      {
        id: `comp-${cLat.toFixed(3)}-3`,
        title: `${cNeigh || cDist} ${isResidential ? "Ön Cephe 3+1 Aile Dairesi" : "Yatırımlık Arsa Emsali"}`,
        category: category,
        type: "satilik" as const,
        areaM2: isResidential ? 140 : 850,
        pricePerM2TL: Math.round(targetPrice * 0.88),
        priceTL: Math.round(targetPrice * 0.88 * (isResidential ? 140 : 850)),
        distanceMeters: 520,
        coordinates: offsetCoord(cLat, cLng, 520, 230),
        source: "Bölge Emsali",
        roomCount: isResidential ? "3+1" : undefined,
        zoningType: isResidential ? undefined : "Köy Yerleşik",
        date: "3 gün önce",
      },
      {
        id: `comp-${cLat.toFixed(3)}-4`,
        title: `${cNeigh || cDist} Kiralık ${isResidential ? "Kombili 3+1 Daire" : "Depolama / Saha"}`,
        category: category,
        type: "kiralik" as const,
        areaM2: isResidential ? 125 : 500,
        pricePerM2TL: Math.round(targetPrice * 0.0055),
        priceTL: Math.round(targetPrice * 0.0055 * (isResidential ? 125 : 500)),
        distanceMeters: 310,
        coordinates: offsetCoord(cLat, cLng, 310, 315),
        source: "Sahibinden",
        roomCount: isResidential ? "3+1" : undefined,
        date: "2 gün önce",
      }
    ];

    setDynamicComps(localGeneratedComps);

    const compsToRender = filter === "all" ? localGeneratedComps : localGeneratedComps.filter((c) => c.type === filter);
    compsToRender.forEach((comp) => {
      const isIhaleci = comp.source?.toLowerCase().includes("ihaleciburada");
      const isSatilik = comp.type === "satilik";
      const badgeBg = isIhaleci ? "#D97706" : (isSatilik ? "#059669" : "#2563EB");
      const priceLabel = `${isIhaleci ? "🏛️ " : ""}${formatShortPrice(comp.priceTL)}`;
      const typeLabel = isSatilik ? "Satılık" : "Kiralık";

      const compIcon = L.divIcon({
        className: "leaflet-comp-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
            <div style="background: ${badgeBg}; color: #FFFFFF; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 12px; border: 1.5px solid #FFFFFF; box-shadow: 0 3px 10px rgba(0,0,0,0.25); white-space: nowrap; font-family: sans-serif; display: flex; align-items: center; gap: 3px;">
              <span>${priceLabel}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid ${badgeBg};"></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const marker = L.marker([comp.coordinates.lat, comp.coordinates.lng], {
        icon: compIcon,
      }).addTo(parcelLayerGroupRef.current!);

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
        if (onSelectComparable) {
          onSelectComparable(comp);
        }
      });

      markersRef.current[comp.id] = marker;
    });

    return localGeneratedComps;
  };

  // =========================================================================
  // LEAFLET MAP LIFECYCLE (HER ZAMAN GÜVENLİ VE HAZIR)
  // =========================================================================
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialZoom = 17;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: initialZoom,
      zoomControl: false,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 60,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
    });

    // Mouse ile haritanın üzerine gelindiğinde tekerlek zoomunu garanti et
    if (mapContainerRef.current) {
      mapContainerRef.current.addEventListener("mouseenter", () => {
        if (!isLocked && map.scrollWheelZoom) {
          map.scrollWheelZoom.enable();
        }
      });
    }

    mapInstanceRef.current = map;
    setCurrentZoom(initialZoom);

    // Container boyutu her değiştiğinde (daraltma/genişletme sırasında) Leaflet boyutunu otomatik güncelle
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    map.on("zoomend", () => {
      if (mapInstanceRef.current) {
        setCurrentZoom(mapInstanceRef.current.getZoom());
      }
    });

    // Katman Gruplarını Haritaya Ekle
    parcelLayerGroupRef.current = L.layerGroup().addTo(map);
    measurementLayerGroupRef.current = L.layerGroup().addTo(map);

    // Tile Katmanı (Varsayılan Uydu Hibrit veya Sokak)
    const initialTileUrl = mapLayerType === "satellite"
      ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    tileLayerRef.current = L.tileLayer(initialTileUrl, {
      maxZoom: mapLayerType === "satellite" ? 21 : 19,
      attribution: mapLayerType === "satellite" ? '© Google Uydu • TKGM Kadastro' : '© OpenStreetMap • İhaleciBurada GIS',
    }).addTo(map);

    // =====================================================================
    // TÜRKİYE GENELİ CANLI HARİTA TIKLAMA DİNLEYİCİSİ (0ms HIZ + TAPUSOR BAL PETEĞİ)
    // =====================================================================
    map.on("click", async (e: L.LeafletMouseEvent) => {
      // ÖLÇÜM MODU AKTİFSE NORMAL TIKLAMAYI VE ADA/PARSEL SORGUSUNU KES
      if (activeToolRef.current === "ruler") {
        handleRulerClickRef.current(e.latlng);
        return;
      }
      if (activeToolRef.current === "area") {
        handleAreaClickRef.current(e.latlng);
        return;
      }

      isInternalClickRef.current = true;
      const clickLat = Number(e.latlng.lat.toFixed(6));
      const clickLng = Number(e.latlng.lng.toFixed(6));
      lastInteractedCoordRef.current = { lat: clickLat, lng: clickLng };

      // 1. ANINDA 0ms YEREL 973 İLÇE ANALİZİ
      // Merkez hedef altıgenin üzerine veya yakınına tıklandıysa (< 75 metre), mevcut ada/parsel ve lokasyonu koru!
      const distFromCenterM = Math.hypot(clickLat - lat, clickLng - lng) * 111000;
      const isCenterClick = distFromCenterM < 75;

      const fastLoc = findFastLocationFromCoords(clickLat, clickLng);
      const effectiveCity = isCenterClick ? city : fastLoc.city;
      const effectiveDist = isCenterClick ? (district || activeDistrict) : fastLoc.district;
      const effectiveNeigh = isCenterClick ? (neighborhood || activeNeighborhood) : fastLoc.neighborhood;

      const clickCad = isCenterClick
        ? { ada: activeAda, parsel: activeParsel }
        : getCadastreForCoordinates(clickLat, clickLng);

      const initialAda = isCenterClick ? activeAda : clickCad.ada;
      const initialParsel = isCenterClick ? activeParsel : clickCad.parsel;

      const fastVal = getDistrictValuation(effectiveCity, effectiveDist, unitM2Price, {
        category,
        neighborhood: effectiveNeigh || undefined,
        ada: initialAda,
        parsel: initialParsel,
        areaM2: isCenterClick ? areaM2 : undefined,
      });
      const resolvedPrice = fastVal.pricePerM2TL;

      // 2. Tıklanan noktaya anında bal peteğini ve emsal ilanları çiz
      const generatedComps = drawParcelHoneycomb(
        clickLat,
        clickLng,
        resolvedPrice,
        effectiveCity,
        effectiveDist,
        effectiveNeigh || undefined,
        initialAda,
        initialParsel,
        isCenterClick ? areaM2 : undefined
      );

      const initialNoticeText = (initialAda && initialParsel)
        ? `📍 ${effectiveDist} / ${effectiveCity}${effectiveNeigh ? ` • ${effectiveNeigh}` : ""} • Ada ${initialAda} / Parsel ${initialParsel} • ${resolvedPrice.toLocaleString("tr-TR")} ₺/m²`
        : `📍 ${effectiveDist} / ${effectiveCity}${effectiveNeigh ? ` • ${effectiveNeigh}` : ""} • TKGM Parsel Bilgisi Sorgulanıyor... • ${resolvedPrice.toLocaleString("tr-TR")} ₺/m²`;

      setParcelNotice(initialNoticeText);
      setActiveDistrict(effectiveDist);
      if (effectiveNeigh) setActiveNeighborhood(effectiveNeigh);

      // 3. Sol paneli ve tüm uygulamayı 0ms gecikmeyle güncelle!
      if (onLocationSelect) {
        onLocationSelect({
          city: effectiveCity,
          district: effectiveDist,
          neighborhood: effectiveNeigh || "",
          coordinates: { lat: clickLat, lng: clickLng },
          unitPrice: resolvedPrice,
          ada: initialAda,
          parsel: initialParsel,
          areaM2: isCenterClick ? areaM2 : undefined,
          comparables: generatedComps,
        });
      }
      if (onLocationFound) {
        onLocationFound({ lat: clickLat, lng: clickLng });
      }

      // 4. Arka planda resmi TKGM MEGSIS API + tersine adres sorgula
      try {
        const res = await fetch(`/api/location/search?lat=${clickLat}&lng=${clickLng}`);
        const data = await res.json();
        if (data.success && data.location) {
          const loc = data.location;
          const refinedCity = loc.province || fastLoc.city;
          const refinedDistrict = loc.district || fastLoc.district;
          const refinedNeigh = loc.neighborhood || fastLoc.neighborhood;

          const finalAda = loc.ada || initialAda;
          const finalParsel = loc.parsel || initialParsel;
          const finalArea = loc.alanM2 || (isCenterClick ? areaM2 : undefined);

          // Gerçek TKGM sınırları (polygonGeoJson) ve resmi ada/parsel ile yeniden çiz
          drawParcelHoneycomb(
            clickLat,
            clickLng,
            resolvedPrice,
            refinedCity,
            refinedDistrict,
            refinedNeigh || undefined,
            finalAda,
            finalParsel,
            finalArea,
            loc.polygonGeoJson
          );

          const adaParselDesc = (finalAda && finalParsel) ? `Ada ${finalAda} / Parsel ${finalParsel}` : "Kadastro Parseli";
          const areaDesc = finalArea ? ` • ${formatArea(finalArea)} m²` : "";
          const officialBadge = loc.isOfficialCadastre ? "🏛️ TKGM Onaylı" : "📍";

          setParcelNotice(`${officialBadge} ${refinedDistrict} / ${refinedCity}${refinedNeigh ? ` • ${refinedNeigh}` : ""} • ${adaParselDesc}${areaDesc} • ${resolvedPrice.toLocaleString("tr-TR")} ₺/m²`);
          setActiveDistrict(refinedDistrict);
          if (refinedNeigh) setActiveNeighborhood(refinedNeigh);

          if (onLocationSelect) {
            onLocationSelect({
              city: refinedCity,
              district: refinedDistrict,
              neighborhood: refinedNeigh,
              coordinates: { lat: clickLat, lng: clickLng },
              unitPrice: resolvedPrice,
              ada: finalAda,
              parsel: finalParsel,
              areaM2: finalArea,
              comparables: generatedComps,
              polygonGeoJson: loc.polygonGeoJson,
              isOfficialCadastre: loc.isOfficialCadastre,
              nitelik: loc.nitelik,
            });
          }
        }
      } catch (err) {
        // Yerel veriler zaten ekranda aktif
      } finally {
        setTimeout(() => {
          isInternalClickRef.current = false;
        }, 500);
      }
    });

    // İlk Bal Peteği Çizimini Gerçekleştir
    drawParcelHoneycomb(
      lat,
      lng,
      unitM2Price,
      city,
      activeDistrict,
      activeNeighborhood || undefined,
      activeAda,
      activeParsel,
      areaM2
    );

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (measurementLayerGroupRef.current) {
        measurementLayerGroupRef.current.clearLayers();
        measurementLayerGroupRef.current = null;
      }
      Object.values(thematicLayersRef.current).forEach((layer) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      thematicLayersRef.current = {};
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // =========================================================================
  // KOORDİNAT VE DEĞER DEĞİŞİMİNDE ÇİZİMİ GÜNCELLE
  // =========================================================================
  // 1. Dışarıdan "Haritada Göster" butonu tetiklendiğinde doğrudan odakla ve zoom yap
  useEffect(() => {
    if (!mapInstanceRef.current || !focusTrigger) return;
    mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
    
    const effAda = (ada && ada.trim()) ? ada.trim() : activeAda;
    const effParsel = (parsel && parsel.trim()) ? parsel.trim() : activeParsel;
    const effDist = district || activeDistrict;
    const effNeigh = neighborhood || activeNeighborhood;

    drawParcelHoneycomb(
      lat,
      lng,
      unitM2Price,
      city,
      effDist,
      effNeigh || undefined,
      effAda,
      effParsel,
      areaM2
    );
    const adaParselDesc = (effAda && effParsel) ? `Ada ${effAda} / Parsel ${effParsel}` : "Kadastro Parseli";
    const areaDesc = areaM2 ? ` • ${formatArea(areaM2)} m²` : "";
    setParcelNotice(`🏛️ ${effDist} / ${city}${effNeigh ? ` • ${effNeigh}` : ""} • ${adaParselDesc}${areaDesc} • ${unitM2Price.toLocaleString("tr-TR")} ₺/m²`);
  }, [focusTrigger]);

  // 2. Koordinat veya ada/parsel değiştiğinde haritayı ve bal peteğini güncelle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (isInternalClickRef.current) return;

    const map = mapInstanceRef.current;
    const center = map.getCenter();
    const dist = Math.hypot(center.lat - lat, center.lng - lng);

    if (dist > 0.0003) {
      map.flyTo([lat, lng], 17, { duration: 1.0 });
    } else if (map.getZoom() < 16) {
      map.flyTo([lat, lng], 17, { duration: 0.8 });
    }

    const effAda = (ada && ada.trim()) ? ada.trim() : activeAda;
    const effParsel = (parsel && parsel.trim()) ? parsel.trim() : activeParsel;
    const effDist = district || activeDistrict;
    const effNeigh = neighborhood || activeNeighborhood;

    drawParcelHoneycomb(
      lat,
      lng,
      unitM2Price,
      city,
      effDist,
      effNeigh || undefined,
      effAda,
      effParsel,
      areaM2
    );
  }, [lat, lng, unitM2Price, city, district, neighborhood, activeDistrict, activeNeighborhood, searchRadius, ada, parsel, activeAda, activeParsel, areaM2]);

  // Dışarıdan seçilen ilanı haritada odakla ve popup aç
  useEffect(() => {
    if (focusedCompId && markersRef.current[focusedCompId]) {
      const marker = markersRef.current[focusedCompId];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(marker.getLatLng(), 16, { duration: 0.8 });
      }
      marker.openPopup();
      setSelectedCompId(focusedCompId);
    }
  }, [focusedCompId]);

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

  const handleCenterOnTarget = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.8 });
    }
  };

  const satilikCount = compsList.filter((c) => c.type === "satilik").length;
  const kiralikCount = compsList.filter((c) => c.type === "kiralik").length;

  return (
    <div className={`rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-xl flex flex-col ${
      isFullscreen ? "fixed inset-0 z-[99999] rounded-none border-none" : "h-full relative z-0 isolate"
    }`}>
      
      {/* 1. HARİTA ÜST BİLGİ VE FİLTRE BARI */}
      <div className="bg-[#0F223D] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-extrabold font-heading text-slate-100">
            {city} / {activeDistrict} {activeNeighborhood ? `— ${activeNeighborhood}` : ""}
          </span>
          <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded font-mono font-bold">
            Ada {activeAda} / Parsel {activeParsel}
          </span>
          <button
            type="button"
            onClick={() => {
              const textToCopy = `${city} / ${activeDistrict} / ${activeNeighborhood || "Merkez"} - Ada: ${activeAda} Parsel: ${activeParsel}`;
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(textToCopy);
              }
              const tkgmUrl = `https://parselsorgu.tkgm.gov.tr/#ara/cografi/${lat}/${lng}`;
              window.open(tkgmUrl, "_blank", "noopener,noreferrer");
            }}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded border border-amber-400/40 text-[10px] font-black transition cursor-pointer active:scale-95"
            title="Resmi TKGM Parsel Sorgu uygulamasını aç ve bilgileri panoya kopyala"
          >
            <span>🏛️ TKGM</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          {/* GPS Canlı Konum Butonu */}
          <button
            type="button"
            onClick={handleGetLiveLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg font-bold transition cursor-pointer border border-white/15 active:scale-95"
            title="GPS ile bulunduğun konumu haritada aç"
          >
            <Crosshair className={`w-3.5 h-3.5 text-amber-400 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Bulunuyor..." : "Konumumu Bul"}</span>
          </button>

          {/* Rakım Rozeti */}
          {elevationMeters && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/10 font-mono">
              <Mountain className="w-3 h-3 text-emerald-400" />
              Rakım: {elevationMeters}m
            </span>
          )}

          {/* Emsal Filtre Butonları */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                filter === "all" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-300 hover:text-white"
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
            <button
              type="button"
              onClick={() => setFilter("kiralik")}
              className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                filter === "kiralik" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Kiralık ({kiralikCount})
            </button>
          </div>

          {/* SAHA VE ÖLÇÜM ARAÇLARI (PARSELSORGU STANDARDI) */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[10px]">
            {/* Mesafe (Cetvel) */}
            <button
              type="button"
              onClick={toggleRuler}
              className={`px-2 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTool === "ruler" 
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-300" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
              title="Haritada İki veya Daha Fazla Nokta Arasında Canlı Mesafe Ölçümü Yap (Cetvel)"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mesafe</span>
            </button>

            {/* Alan Ölçer (Poligon) */}
            <button
              type="button"
              onClick={toggleArea}
              className={`px-2 py-1 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                activeTool === "area" 
                  ? "bg-blue-600 text-white font-black shadow-xs ring-1 ring-blue-300" 
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
              title="Haritada Parsel/Arazi Sınırlarını Çizerek Alan & Dönüm Hesapla (Poligon)"
            >
              <Shapes className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Alan</span>
            </button>

            {/* Google Haritalar Yol Tarifi */}
            <button
              type="button"
              onClick={handleGetDirections}
              className="px-2 py-1 rounded font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition cursor-pointer flex items-center gap-1"
              title="Google Haritalar ile Yol Tarifi / Navigasyon Başlat"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Yol Tarifi</span>
            </button>

            {/* WhatsApp Paylaş */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-2 py-1 rounded font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition cursor-pointer flex items-center gap-1"
              title="Parsel ve Değerleme Özetini WhatsApp İle Paylaş"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Künye & GPS Kopyala */}
            <button
              type="button"
              onClick={handleCopyKunye}
              className="px-2 py-1 rounded font-bold text-slate-300 hover:text-white hover:bg-slate-700/60 transition cursor-pointer flex items-center gap-1"
              title="Ada, Parsel ve GPS Koordinatlarını Panoya Kopyala"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden lg:inline">{copySuccess ? "Kopyalandı" : "Kopyala"}</span>
            </button>
          </div>

          {/* Harita Boyut Ayarı (Daralt / Genişlet Hızlı Butonları) */}
          {onToggleSidebar && (
            <div className="hidden sm:flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[10px] ml-1">
              <span className="text-[9px] font-bold text-amber-400/90 px-1 hidden md:inline">
                Harita:
              </span>
              <button
                type="button"
                onClick={() => onSetSidebarWidth && onSetSidebarWidth(580)}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  !isSidebarCollapsed && (sidebarWidth || 440) >= 520
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Paneli Genişlet, Haritayı Daralt (Panel: 580px)"
              >
                Dar
              </button>
              <button
                type="button"
                onClick={() => onSetSidebarWidth && onSetSidebarWidth(440)}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  !isSidebarCollapsed && (sidebarWidth || 440) >= 380 && (sidebarWidth || 440) < 520
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Dengeli Standart Boyut (Panel: 440px)"
              >
                Dengeli
              </button>
              <button
                type="button"
                onClick={() => onSetSidebarWidth && onSetSidebarWidth(320)}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  !isSidebarCollapsed && (sidebarWidth || 440) < 380
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Haritayı Genişlet, Paneli Daralt (Panel: 320px)"
              >
                Geniş
              </button>
              <button
                type="button"
                onClick={onToggleSidebar}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                  isSidebarCollapsed
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "text-slate-300 hover:text-white"
                }`}
                title={isSidebarCollapsed ? "Değerleme Panelini Göster" : "Haritayı Tam Ekran Yap"}
              >
                {isSidebarCollapsed ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isSidebarCollapsed ? "Paneli Aç" : "Tam Ekran"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. LEAFLET HARİTA KAPSAYICISI (SOKAK GÖRÜNÜMÜ + BAL PETEĞİ) */}
      <div className="relative flex-1 w-full min-h-[480px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* AKTİF ÖLÇÜM MODU YÜZEN BİLGİ VE KONTROL PANELİ (MESAFE VEYA ALAN ÖLÇER) */}
        {activeTool !== "none" && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] max-w-[95%] sm:max-w-md w-auto bg-slate-900/95 backdrop-blur-md text-white border border-amber-500/50 rounded-xl px-3.5 py-2 shadow-2xl flex items-center justify-between gap-3 text-xs pointer-events-auto animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              {activeTool === "ruler" ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Mesafe Ölçümü</div>
                    <div className="font-mono text-amber-300 font-black text-sm">
                      {rulerPoints.length < 2 ? "Haritadan nokta seçin" : formatDistance(rulerDistance)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Shapes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Poligon Alan Hesabı</div>
                    <div className="font-mono text-blue-300 font-black text-sm flex items-center gap-1.5">
                      {areaPoints.length < 3 ? (
                        <span className="text-slate-300 text-xs">
                          {areaPoints.length === 0 ? "Köşe noktalarını tıklayın" : `${areaPoints.length} nokta seçildi (en az 3)`}
                        </span>
                      ) : (
                        <>
                          <span>{formatArea(areaM2Value)} m²</span>
                          <span className="text-[10.5px] text-slate-400 font-normal">({(areaM2Value / 1000).toFixed(2)} Dönüm)</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-700/80 pl-2.5 shrink-0">
              <button
                type="button"
                onClick={resetMeasurement}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Çizilen noktaları sıfırla"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Sıfırla</span>
              </button>
              <button
                type="button"
                onClick={closeMeasurement}
                className="px-2 py-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                title="Ölçüm modundan çık (Esc)"
              >
                <X className="w-3 h-3" />
                <span>Kapat</span>
              </button>
            </div>
          </div>
        )}

        {/* SOL ÜST YÜZEN TAPUSOR PARSEL VE FİYAT BİLGİ KARTI (GÖRSEL 1789501075638 BİREBİR) */}
        <div className="absolute top-3 left-3 z-[450] bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl shadow-xl px-3.5 py-2.5 max-w-md select-none text-slate-900 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-xs"></span>
            <span className="truncate">{city} / {activeDistrict} {activeNeighborhood ? `• ${activeNeighborhood}` : ""}</span>
            <span className="text-slate-500 font-mono text-[11px] font-normal shrink-0">/ {activeAda} ada / {activeParsel} parsel</span>
          </div>
          <div className="flex items-center flex-wrap gap-2 text-[10.5px] text-slate-600 mt-1 font-semibold">
            <span>{formatArea(areaM2)} m²</span>
            <span>•</span>
            <span>{category === "konut" ? "Konut & Daire" : "İmarlı Arsa"}</span>
            <span>•</span>
            <span className="text-emerald-700 font-mono font-extrabold">{(unitM2Price || 54085).toLocaleString("tr-TR")} ₺/m²</span>
          </div>
        </div>

        {/* BİLDİRİM / GERİ BİLDİRİM ROZETİ */}
        {(parcelNotice || locateFeedback) && (
          <div className="absolute top-16 left-3 z-[450] bg-[#0F223D]/95 text-amber-300 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in fade-in duration-150">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{parcelNotice || locateFeedback}</span>
          </div>
        )}

        {/* SAĞ KENAR DİKEY YÜZEN ARAÇ ÇUBUĞU (TAPUSOR DİZAYNI) */}
        <div className="absolute top-4 right-3 z-[450] flex flex-col items-center gap-1.5 select-none pointer-events-auto">
          {/* Katman Göstergesi: Uydu & Sokak Haritası & İmar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg border transition cursor-pointer ${
                showLayerMenu || Object.values(thematicLayers).some(Boolean)
                  ? "bg-[#0B1E3B] text-amber-400 border-amber-500/60 ring-2 ring-amber-400/40" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
              title="Katmanlar & İmar Planları Menüsü"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-12 top-0 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 rounded-xl shadow-2xl p-3 w-64 sm:w-72 space-y-3 z-50 text-xs font-bold animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
                {/* 1. BÖLÜM: TEMEL HARİTA ALTLIĞI */}
                <div>
                  <div className="text-[10px] text-slate-400 px-1 uppercase tracking-wider font-mono mb-1.5 flex items-center justify-between">
                    <span>Harita Altlığı</span>
                    <span className="text-[9px] text-amber-400 font-bold">1 Seçili</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSwitchLayer("satellite")}
                      className={`text-left p-2 rounded-lg font-bold flex flex-col gap-0.5 transition cursor-pointer border ${
                        mapLayerType === "satellite"
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs"
                          : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-xs flex items-center justify-between">
                        <span>🛰️ Uydu</span>
                        {mapLayerType === "satellite" && <span className="text-[10px] font-black">✓</span>}
                      </span>
                      <span className={`text-[9px] ${mapLayerType === "satellite" ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
                        Google Hibrit
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchLayer("streets")}
                      className={`text-left p-2 rounded-lg font-bold flex flex-col gap-0.5 transition cursor-pointer border ${
                        mapLayerType === "streets"
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xs"
                          : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-xs flex items-center justify-between">
                        <span>🛣️ Sokak</span>
                        {mapLayerType === "streets" && <span className="text-[10px] font-black">✓</span>}
                      </span>
                      <span className={`text-[9px] ${mapLayerType === "streets" ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
                        Yol & Kadastro
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. BÖLÜM: RESMİ İMAR & ÇEVRE KATMANLARI (ÇŞİDB & MTA WMS) */}
                <div className="border-t border-slate-800 pt-2.5">
                  <div className="text-[10px] text-slate-400 px-1 uppercase tracking-wider font-mono mb-2 flex items-center justify-between">
                    <span>İmar & Çevre Katmanları</span>
                    <span className="text-[9px] text-emerald-400 font-bold">WMS Canlı</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* e-Plan İmar Planı */}
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🏗️</span>
                        <div>
                          <div className="text-xs text-white font-extrabold">e-Plan İmar Planları</div>
                          <div className="text-[9px] text-slate-400 font-normal">1/1000 Uygulama & 1/5000 Nazım (ÇŞİDB)</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={thematicLayers.eplan}
                        onChange={(e) => setThematicLayers((prev) => ({ ...prev, eplan: e.target.checked }))}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      />
                    </label>

                    {/* MTA Diri Fay Hatları */}
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⚡</span>
                        <div>
                          <div className="text-xs text-white font-extrabold">MTA Diri Fay Hatları</div>
                          <div className="text-[9px] text-slate-400 font-normal">Deprem risk hatları ve fay kırıkları</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={thematicLayers.fay}
                        onChange={(e) => setThematicLayers((prev) => ({ ...prev, fay: e.target.checked }))}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      />
                    </label>

                    {/* Doğal Sit & Koruma Alanları */}
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌲</span>
                        <div>
                          <div className="text-xs text-white font-extrabold">Doğal Sit & Koruma</div>
                          <div className="text-[9px] text-slate-400 font-normal">1., 2., 3. Derece Sit & Milli Park</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={thematicLayers.sit}
                        onChange={(e) => setThematicLayers((prev) => ({ ...prev, sit: e.target.checked }))}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      />
                    </label>

                    {/* Kıyı Kenar Çizgisi */}
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌊</span>
                        <div>
                          <div className="text-xs text-white font-extrabold">Kıyı Kenar Çizgisi</div>
                          <div className="text-[9px] text-slate-400 font-normal">Sahil koruma ve kıyı şeridi bandı</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={thematicLayers.kiyi}
                        onChange={(e) => setThematicLayers((prev) => ({ ...prev, kiyi: e.target.checked }))}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. BÖLÜM: KATMAN OPAKLIĞI (ŞEFFAFLIK SLIDER) */}
                <div className="border-t border-slate-800 pt-2.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 uppercase tracking-wider font-mono mb-1.5">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-amber-400" />
                      İmar Katmanı Opaklığı
                    </span>
                    <span className="font-mono text-amber-400 font-bold">%{Math.round(thematicOpacity * 100)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={thematicOpacity}
                    onChange={(e) => setThematicOpacity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex items-center justify-between text-[9px] text-slate-500 px-1 mt-1">
                    <span>%20 Saydam</span>
                    <span>%100 Net</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cetvel (Mesafe Ölçümü) Hızlı Butonu */}
          <button
            type="button"
            onClick={toggleRuler}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg border transition cursor-pointer active:scale-95 ${
              activeTool === "ruler"
                ? "bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-300"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title="Harita Üzerinde Canlı Mesafe Ölçümü (Cetvel)"
          >
            <Ruler className="w-4 h-4" />
          </button>

          {/* Alan Ölçer (Poligon & Dönüm) Hızlı Butonu */}
          <button
            type="button"
            onClick={toggleArea}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg border transition cursor-pointer active:scale-95 ${
              activeTool === "area"
                ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title="Harita Üzerinde Parsel Alanı ve Dönüm Hesabı"
          >
            <Shapes className="w-4 h-4" />
          </button>

          {/* Filtre Değiştirici */}
          <button
            type="button"
            onClick={() => setFilter(filter === "all" ? "satilik" : filter === "satilik" ? "kiralik" : "all")}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer ${
              filter !== "all" ? "ring-2 ring-blue-500 text-blue-600 font-black" : ""
            }`}
            title={`Emsal Filtresi: ${filter.toUpperCase()}`}
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Hedefe Yeniden Odaklan */}
          <button
            type="button"
            onClick={handleCenterOnTarget}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer active:scale-95"
            title="Hedef Parsele Odaklan"
          >
            <Crosshair className="w-4 h-4 text-blue-600" />
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

          {/* Canlı Zoom Seviyesi Rozeti */}
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

          {/* Kilit Butonu (Mausun Topuzu Aç/Kapat) */}
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg border transition cursor-pointer active:scale-95 ${
              isLocked 
                ? "bg-rose-600 text-white border-rose-700 shadow-rose-200" 
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title={isLocked ? "Harita Yakınlaştırma Kilitli (Tıkla ve Aç)" : "Harita Serbest (Tıkla ve Kilitle)"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Tam Ekran */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-lg border border-slate-200 transition cursor-pointer active:scale-95"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* SOL ALT BİLGİ & LEJANT (TAPUSOR STANDARDI) */}
        <div className="absolute bottom-4 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 text-slate-800 max-w-sm pointer-events-auto">
          <div className="text-[10px] font-extrabold text-slate-800 mb-1 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              TapuSor Bal Peteği Değerleme Modeli
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              İİK m.115 %50 Taban
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-2.5 text-[9.5px] text-slate-600 font-semibold pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block"></span>
              <span>Hedef Parsel</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[9px] font-black text-amber-900 bg-amber-100 px-1 rounded border border-amber-300">Ada/Par</span>
              <span>Kadastro No</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>Satılık Emsal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <span>Kiralık Emsal</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ÇEVREDEKİ EMSAL İLANLAR YATAY ŞERİDİ (ETKİLEŞİMLİ) */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 select-none">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 font-heading">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            {activeDistrict} {activeNeighborhood ? `(${activeNeighborhood})` : ""} Bölgesel Emsal İlanlar ({filteredComps.length} İlan)
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            Tıklayarak harita üzerinde odağa alabilirsiniz
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {filteredComps.map((comp) => {
            const isSelected = selectedCompId === comp.id;
            const isSatilik = comp.type === "satilik";

            return (
              <div
                key={comp.id}
                onClick={() => handleSelectComp(comp)}
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
      <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 select-none">
        <span>Resmi Kadastro & Tapu Veri Ağı: TKGM & TapuSor Emsal Motoru</span>
        <span className="font-mono">{lat.toFixed(5)}° K, {lng.toFixed(5)}° D</span>
      </div>
    </div>
  );
};
