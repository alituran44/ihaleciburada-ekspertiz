"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import { ComparableListing, PropertyCategory } from "@/types";
import { getDistrictValuation } from "@/lib/districtValuations";
import { findFastLocationFromCoords } from "@/lib/turkeyLocations";
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
  ShieldCheck
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
    comparables?: ComparableListing[];
  }) => void;
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
  onSelectComparable,
  onLocationFound,
  onSelectDistrict,
  onSelectNeighborhood,
  onLocationSelect,
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
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [parcelNotice, setParcelNotice] = useState<string | null>(null);

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
      (position) => {
        setIsLocating(false);
        const userLat = Number(position.coords.latitude.toFixed(6));
        const userLng = Number(position.coords.longitude.toFixed(6));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 16, { duration: 1.2 });
        }

        setLocateFeedback(`GPS Konumu Alındı (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
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
  const lat = coordinates?.lat || 40.1553;
  const lng = coordinates?.lng || 26.4142;

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
    cNeigh?: string
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

    // Merkez Hedef Altıgen (Sarı Vurgulu Petek)
    const centerHexCorners = getHexCorners(cLat, cLng, hexRadius);
    const centerPolygon = L.polygon(centerHexCorners, {
      color: "#CA8A04",
      weight: 3,
      opacity: 0.98,
      fillColor: "#FDE047",
      fillOpacity: 0.58,
    }).addTo(parcelLayerGroupRef.current);

    centerPolygon.bindTooltip(
      `<div style="font-family: sans-serif; text-align: center; padding: 2px;">
        <strong style="color: #854D0E; font-size: 11px;">Hedef Değerleme Parseli</strong><br/>
        <span style="color: #0F172A; font-weight: 800; font-size: 12px;">${targetPrice.toLocaleString("tr-TR")} ₺/m²</span>
      </div>`,
      { permanent: false, direction: "top", opacity: 0.95 }
    );

    // Merkezde TapuSor İğnesi ve m² Değeri Rozeti
    const centerBadgeIcon = L.divIcon({
      className: "leaflet-target-badge",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
          <div style="background: #0F223D; color: #FCD34D; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 2px solid #FCD34D; box-shadow: 0 4px 14px rgba(0,0,0,0.35); white-space: nowrap; font-family: monospace; display: flex; align-items: center; gap: 4px;">
            <span>📍</span>
            <span>${targetPrice.toLocaleString("tr-TR")} ₺/m²</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #0F223D;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    L.marker([cLat, cLng], { icon: centerBadgeIcon }).addTo(parcelLayerGroupRef.current);

    // Çevre 12 Adet Bal Peteği Hücresi (2 Halka: 6 Yakın + 6 Orta)
    const honeycombOffsets = [
      { angle: 0, dist: hexStep, mult: 1.04 },
      { angle: 60, dist: hexStep, mult: 0.97 },
      { angle: 120, dist: hexStep, mult: 1.06 },
      { angle: 180, dist: hexStep, mult: 0.92 },
      { angle: 240, dist: hexStep, mult: 0.95 },
      { angle: 300, dist: hexStep, mult: 1.08 },
      { angle: 30, dist: hexStep * 1.732, mult: 1.11 },
      { angle: 90, dist: hexStep * 1.732, mult: 1.03 },
      { angle: 150, dist: hexStep * 1.732, mult: 0.89 },
      { angle: 210, dist: hexStep * 1.732, mult: 0.91 },
      { angle: 270, dist: hexStep * 1.732, mult: 0.98 },
      { angle: 330, dist: hexStep * 1.732, mult: 1.14 },
    ];

    honeycombOffsets.forEach((hCell) => {
      const cellCenter = offsetCoord(cLat, cLng, hCell.dist, hCell.angle);
      const cellCorners = getHexCorners(cellCenter.lat, cellCenter.lng, hexRadius);
      const cellPrice = Math.round(targetPrice * hCell.mult);

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
          <div style="transform: translate(-50%, -50%); pointer-events: none;">
            <div style="background: rgba(255, 255, 255, 0.92); color: #1E3A8A; font-weight: 800; font-size: 9px; padding: 2px 6px; border-radius: 8px; border: 1px solid rgba(37, 99, 235, 0.4); box-shadow: 0 1px 4px rgba(0,0,0,0.15); white-space: nowrap; font-family: monospace;">
              ${cellPrice.toLocaleString("tr-TR")} ₺
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });

      L.marker([cellCenter.lat, cellCenter.lng], { icon: cellIcon }).addTo(parcelLayerGroupRef.current!);

      cellPoly.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 10.5px;">
          <strong>Bölge Mikro Hücresi</strong><br/>
          Ort. Rayiç: <span style="color: #2563EB; font-weight: 800;">${cellPrice.toLocaleString("tr-TR")} ₺/m²</span>
        </div>`,
        { direction: "center", opacity: 0.9 }
      );
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

    const initialZoom = 15;

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

    map.on("zoomend", () => {
      if (mapInstanceRef.current) {
        setCurrentZoom(mapInstanceRef.current.getZoom());
      }
    });

    // Katman Gruplarını Haritaya Ekle
    parcelLayerGroupRef.current = L.layerGroup().addTo(map);

    // Tile Katmanı: KULLANICININ İSTEDİĞİ GİBİ SADECE SOKAK GÖRÜNTÜSÜ (OpenStreetMap)
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap • İhaleciBurada GIS',
    }).addTo(map);

    // =====================================================================
    // TÜRKİYE GENELİ CANLI HARİTA TIKLAMA DİNLEYİCİSİ (0ms HIZ + TAPUSOR BAL PETEĞİ)
    // =====================================================================
    map.on("click", async (e: L.LeafletMouseEvent) => {
      isInternalClickRef.current = true;
      const clickLat = Number(e.latlng.lat.toFixed(6));
      const clickLng = Number(e.latlng.lng.toFixed(6));
      lastInteractedCoordRef.current = { lat: clickLat, lng: clickLng };

      // 1. ANINDA 0ms YEREL 973 İLÇE ANALİZİ
      const fastLoc = findFastLocationFromCoords(clickLat, clickLng);
      const fastVal = getDistrictValuation(fastLoc.city, fastLoc.district, unitM2Price);
      const resolvedPrice = fastVal.pricePerM2TL;

      // 2. Tıklanan noktaya anında bal peteğini ve emsal ilanları çiz
      const generatedComps = drawParcelHoneycomb(
        clickLat,
        clickLng,
        resolvedPrice,
        fastLoc.city,
        fastLoc.district,
        fastLoc.neighborhood
      );

      setParcelNotice(`📍 ${fastLoc.district} / ${fastLoc.city} • ${resolvedPrice.toLocaleString("tr-TR")} ₺/m²`);
      setActiveDistrict(fastLoc.district);
      setActiveNeighborhood(fastLoc.neighborhood);

      // 3. Sol paneli ve tüm uygulamayı 0ms gecikmeyle güncelle!
      if (onLocationSelect) {
        onLocationSelect({
          city: fastLoc.city,
          district: fastLoc.district,
          neighborhood: fastLoc.neighborhood,
          coordinates: { lat: clickLat, lng: clickLng },
          unitPrice: resolvedPrice,
          comparables: generatedComps,
        });
      }
      if (onLocationFound) {
        onLocationFound({ lat: clickLat, lng: clickLng });
      }

      // 4. Arka planda daha hassas mahalle/cadde adı sorgula (kullanıcıyı asla bekletmez)
      try {
        const res = await fetch(`/api/location/search?lat=${clickLat}&lng=${clickLng}`);
        const data = await res.json();
        if (data.success && data.location) {
          const loc = data.location;
          const refinedCity = loc.province || fastLoc.city;
          const refinedDistrict = loc.district || fastLoc.district;
          const refinedNeigh = loc.neighborhood || fastLoc.neighborhood;

          setParcelNotice(`📍 ${refinedDistrict} / ${refinedCity}${refinedNeigh ? ` • ${refinedNeigh}` : ""} • ${resolvedPrice.toLocaleString("tr-TR")} ₺/m²`);
          setActiveDistrict(refinedDistrict);
          if (refinedNeigh) setActiveNeighborhood(refinedNeigh);

          if (onLocationSelect) {
            onLocationSelect({
              city: refinedCity,
              district: refinedDistrict,
              neighborhood: refinedNeigh,
              coordinates: { lat: clickLat, lng: clickLng },
              unitPrice: resolvedPrice,
              comparables: generatedComps,
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
    drawParcelHoneycomb(lat, lng, unitM2Price, city, activeDistrict, activeNeighborhood || undefined);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // =========================================================================
  // KOORDİNAT VE DEĞER DEĞİŞİMİNDE ÇİZİMİ GÜNCELLE
  // =========================================================================
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (isInternalClickRef.current) return;

    if (lastInteractedCoordRef.current) {
      const diff = Math.hypot(
        lastInteractedCoordRef.current.lat - lat,
        lastInteractedCoordRef.current.lng - lng
      );
      if (diff < 0.001) {
        return;
      }
    }

    const map = mapInstanceRef.current;
    const center = map.getCenter();
    const dist = Math.hypot(center.lat - lat, center.lng - lng);

    if (dist > 0.0005) {
      map.flyTo([lat, lng], 15, { duration: 1.0 });
    }

    drawParcelHoneycomb(lat, lng, unitM2Price, city, activeDistrict, activeNeighborhood || undefined);
  }, [lat, lng, unitM2Price, city, activeDistrict, searchRadius]);

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
      isFullscreen ? "fixed inset-0 z-[9999] rounded-none border-none" : "h-full"
    }`}>
      
      {/* 1. HARİTA ÜST BİLGİ VE FİLTRE BARI */}
      <div className="bg-[#0F223D] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
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
        </div>
      </div>

      {/* 2. LEAFLET HARİTA KAPSAYICISI (SOKAK GÖRÜNÜMÜ + BAL PETEĞİ) */}
      <div className="relative flex-1 w-full min-h-[480px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* SOL ÜST YÜZEN TAPUSOR PARSEL VE FİYAT BİLGİ KARTI (GÖRSEL 1789501075638 BİREBİR) */}
        <div className="absolute top-3 left-3 z-[450] bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl shadow-xl px-3.5 py-2.5 max-w-md select-none text-slate-900 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-xs"></span>
            <span className="truncate">{city} / {activeDistrict} {activeNeighborhood ? `• ${activeNeighborhood}` : ""}</span>
            <span className="text-slate-500 font-mono text-[11px] font-normal shrink-0">/ {ada || "1357"} ada / {parsel || "4"} parsel</span>
          </div>
          <div className="flex items-center flex-wrap gap-2 text-[10.5px] text-slate-600 mt-1 font-semibold">
            <span>{areaM2} m²</span>
            <span>•</span>
            <span>{category === "konut" ? "Konut & Daire" : "İmarlı Arsa"}</span>
            <span>•</span>
            <span className="text-emerald-700 font-mono font-extrabold">{(unitM2Price || 54085).toLocaleString("tr-TR")} ₺/m²</span>
            <span>•</span>
            <span className="text-amber-800 font-mono font-bold">İcra Tabanı: {Math.round((unitM2Price || 54085) * 0.5).toLocaleString("tr-TR")} ₺/m²</span>
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
          {/* Katman Göstergesi: Sokak Haritası */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg border transition cursor-pointer ${
                showLayerMenu ? "bg-[#0B1E3B] text-amber-400 border-amber-500/40" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
              title="Aktif Katman: Sokak Haritası (Net Kadastro Yolları)"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-12 top-0 bg-slate-900 text-white border border-slate-700 rounded-xl shadow-2xl p-2.5 w-48 space-y-1.5 z-50 text-xs font-bold animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] text-slate-400 px-1 uppercase tracking-wider font-mono">
                  Aktif Katman
                </div>
                <div className="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-between shadow-xs">
                  <span className="flex items-center gap-1.5">
                    <span>🛣️</span>
                    <span>Sokak Haritası</span>
                  </span>
                  <span className="text-[11px] font-black">✓</span>
                </div>
                <div className="text-[9.5px] text-slate-400 px-1 font-normal leading-tight">
                  Tüm sokak, cadde ve resmi kadastro yolları nettir.
                </div>
              </div>
            )}
          </div>

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
          <div className="flex items-center gap-3 text-[9.5px] text-slate-600 font-semibold pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block"></span>
              <span>Hedef Parsel</span>
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
