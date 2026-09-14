"use client";

import React, { useEffect, useRef, useState } from "react";
import { ComparableListing } from "@/types";
import { generateValuationZones, ValuationZone } from "@/lib/valuationZones";
import { getDistrictValuation, getDistrictChoroplethColor } from "@/lib/districtValuations";
import { 
  MapPin, 
  Mountain, 
  ExternalLink, 
  Layers, 
  Layers2,
  Compass,
  Navigation,
  Eye,
  EyeOff
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
  unitM2Price = 45000,
  isEndeksaSplitView = false,
  onLocationFound,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  
  const [filter, setFilter] = useState<"all" | "satilik" | "kiralik">("all");
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateFeedback, setLocateFeedback] = useState<string | null>(null);
  const [showValuationZones, setShowValuationZones] = useState<boolean>(true);
  const [showZoneBadges, setShowZoneBadges] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"ilceler" | "parsel">("ilceler");

  useEffect(() => {
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
  const lat = coordinates?.lat || 40.1553;
  const lng = coordinates?.lng || 26.4142;

  const isResidential = category === "konut";

  // Emsal İlan Listesi (Parametreden gelen veya koordinata göre türetilen)
  const compsList: ComparableListing[] = React.useMemo(() => {
    if (comparables && comparables.length > 0) {
      return comparables;
    }
    if (isResidential) {
      return [
        {
          id: "def-res-1",
          title: `${neighborhood || district} 3+1 Balkonlu Ara Kat Daire`,
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
          title: `${neighborhood || district} 2+1 Sıfır Lüks Site Dairesi`,
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
          title: `${neighborhood || district} Ön Cephe Geniş 3+1 Aile Dairesi`,
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
          title: `${neighborhood || district} Kiralık 3+1 Kombili Masrafsız Daire`,
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
        {
          id: "def-res-5",
          title: `${neighborhood || district} Kiralık 2+1 Merkezi Konumda Daire`,
          category: "konut",
          type: "kiralik",
          areaM2: 95,
          pricePerM2TL: 240,
          priceTL: 22800,
          distanceMeters: 450,
          coordinates: offsetCoord(lat, lng, 450, 85),
          source: "Hepsiemlak",
          roomCount: "2+1",
          date: "1 hafta önce",
        },
      ];
    } else {
      return [
        {
          id: "def-land-1",
          title: `${neighborhood || district} Sahibinden Satılık Köşe İmarlı Arsa`,
          category: "arsa",
          type: "satilik",
          areaM2: 620,
          pricePerM2TL: 14500,
          priceTL: 8990000,
          distanceMeters: 250,
          coordinates: offsetCoord(lat, lng, 250, 45),
          source: "Sahibinden",
          zoningType: "Konut İmarı",
          date: "2 gün önce",
        },
        {
          id: "def-land-2",
          title: `${neighborhood || district} Ana Arter Yakını İfrazlı Müstakil Arsa`,
          category: "arsa",
          type: "satilik",
          areaM2: 950,
          pricePerM2TL: 13800,
          priceTL: 13110000,
          distanceMeters: 420,
          coordinates: offsetCoord(lat, lng, 420, 150),
          source: "Hepsiemlak",
          zoningType: "Konut İmarı",
          date: "Dün",
        },
        {
          id: "def-land-3",
          title: `${neighborhood || district} Kat Karşılığına Uygun Yatırımlık Parsel`,
          category: "arsa",
          type: "satilik",
          areaM2: 1350,
          pricePerM2TL: 13200,
          priceTL: 17820000,
          distanceMeters: 590,
          coordinates: offsetCoord(lat, lng, 590, 235),
          source: "Sahibinden",
          zoningType: "Gelişme Konut",
          date: "4 gün önce",
        },
        {
          id: "def-land-4",
          title: `${neighborhood || district} Villa İmarlı Müstakil Parsel (TAKS 0.25)`,
          category: "arsa",
          type: "satilik",
          areaM2: 500,
          pricePerM2TL: 16000,
          priceTL: 8000000,
          distanceMeters: 330,
          coordinates: offsetCoord(lat, lng, 330, 315),
          source: "Emlakjet",
          zoningType: "Villa İmarı",
          date: "1 hafta önce",
        },
        {
          id: "def-land-5",
          title: `${neighborhood || district} Yeni Proje Konut Satış Emsali (125m² 3+1)`,
          category: "konut",
          type: "satilik",
          areaM2: 125,
          pricePerM2TL: 46000,
          priceTL: 5750000,
          distanceMeters: 480,
          coordinates: offsetCoord(lat, lng, 480, 100),
          source: "Hepsiemlak",
          roomCount: "3+1 Sıfır",
          date: "3 gün önce",
        },
      ];
    }
  }, [comparables, isResidential, lat, lng, neighborhood, district]);

  const filteredComps = React.useMemo(() => {
    if (filter === "all") return compsList;
    return compsList.filter((c) => c.type === filter);
  }, [compsList, filter]);

  // Leaflet Başlatma
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

      const isMacro = viewMode === "ilceler";
      const initialZoom = isMacro ? 10 : 15;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: initialZoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // 1. MAKRO GÖRÜNÜM: GERÇEK İLÇE SINIRLARI GEOJSON (Ekran Görüntüsü ile Birebir)
      if (isMacro) {
        const citySlug = (city || "çanakkale")
          .toLowerCase()
          .trim()
          .replace(/i̇/g, "i")
          .replace(/ı/g, "i")
          .replace(/ş/g, "s")
          .replace(/ç/g, "c")
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ö/g, "o")
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
                const isSelected = Boolean(district && distName.toLowerCase().includes(district.toLowerCase()));
                const choropleth = getDistrictChoroplethColor(val.pricePerM2TL, distName);

                return {
                  fillColor: choropleth.fillColor,
                  fillOpacity: choropleth.fillOpacity,
                  color: choropleth.color,
                  weight: isSelected ? 2.5 : 1.5,
                  opacity: 0.95,
                };
              },
              onEachFeature: (feature: any, layer: any) => {
                const distName = feature?.properties?.name || "";
                const val = getDistrictValuation(city, distName, unitM2Price);
                const priceText = val.pricePerM2TL.toLocaleString("tr-TR");

                // Ekran görüntüsüyle birebir beyaz rounded tooltip: "Yenice (41.711 ₺/m²)"
                layer.bindTooltip(`
                  <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; font-weight: 700; color: #1E293B; padding: 5px 12px; background: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.18); border: 1px solid rgba(0,0,0,0.08); white-space: nowrap; pointer-events: none;">
                    ${distName} (${priceText} ₺/m²)
                  </div>
                `, {
                  sticky: true,
                  direction: "top",
                  opacity: 1,
                  className: "custom-district-tooltip"
                });

                layer.on("mouseover", () => {
                  layer.setStyle({
                    fillOpacity: 0.78,
                    weight: 2.5,
                    color: "#FFFFFF",
                  });
                  layer.bringToFront();
                  if (targetMarker) targetMarker.bringToFront();
                });

                layer.on("mouseout", () => {
                  geoLayer.resetStyle(layer);
                });

                layer.on("click", () => {
                  layer.bindPopup(`
                    <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 220px; padding: 4px;">
                      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-bottom: 6px;">
                        <strong style="color: #0F223D; font-size: 13px; font-weight: 800;">${distName}</strong>
                        <span style="background: #10B98120; color: #059669; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid #10B98140;">
                          İlçe Analizi
                        </span>
                      </div>
                      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;">
                          <span style="font-size: 10px; color: #64748B; font-weight: 600;">Ort. m² Piyasa Değeri:</span>
                          <span style="font-size: 13px; font-weight: 900; color: #0F223D;">${priceText} ₺/m²</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: baseline;">
                          <span style="font-size: 10px; color: #059669; font-weight: 600;">İcra / İhale Başlangıç (%50):</span>
                          <span style="font-size: 11px; font-weight: 800; color: #059669;">${val.tenderStartM2TL.toLocaleString("tr-TR")} ₺/m²</span>
                        </div>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; margin-bottom: 8px;">
                        <span style="color: #64748B;">Yıllık Değer Artış Trendi:</span>
                        <span style="font-weight: 800; color: #16A34A;">+%${val.yearlyGrowth}</span>
                      </div>
                      <button
                        onclick="window.__switchToParcelMode && window.__switchToParcelMode()"
                        style="width: 100%; background: #0F223D; color: #FFFFFF; font-weight: 700; font-size: 10px; padding: 6px 10px; border-radius: 6px; border: none; cursor: pointer;"
                      >
                        🔍 Parsel Seviyesine Yaklaş & Emsalleri Gör
                      </button>
                    </div>
                  `).openPopup();
                });

                // Bozcaada için ekran görüntüsündeki kırmızı B harfi rozeti
                if (val.isSpecialBadge && layer.getBounds) {
                  const badgeIcon = L.divIcon({
                    className: "special-district-badge-b",
                    html: `<div style="color: #FFFFFF; font-weight: 900; font-size: 11px; text-shadow: 0 1px 3px rgba(0,0,0,0.8); pointer-events: none;">${val.isSpecialBadge}</div>`,
                    iconSize: [0, 0],
                  });
                  L.marker(layer.getBounds().getCenter(), { icon: badgeIcon, interactive: false }).addTo(map);
                }
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

      // 2. MİKRO GÖRÜNÜM: 500M ETKİ ÇEMBERİ VE MAHALLE DEĞERLEME MOZAİĞİ
      if (!isMacro) {
        L.circle([lat, lng], {
          radius: 500,
          color: "#2563EB",
          weight: 1.5,
          opacity: 0.85,
          fillColor: "#3B82F6",
          fillOpacity: 0.07,
          dashArray: "4, 6",
        }).addTo(map);

        if (isEndeksaSplitView && showValuationZones) {
          const valuationZones = generateValuationZones(
            lat,
            lng,
            city,
            district,
            neighborhood,
            unitM2Price
          );

          valuationZones.forEach((zone) => {
            const poly = L.polygon(zone.coordinates, {
              color: "#FFFFFF",
              weight: zone.isCenter ? 2.5 : 1.8,
              opacity: 0.95,
              fillColor: zone.color,
              fillOpacity: zone.isCenter ? 0.38 : 0.30,
              dashArray: zone.isCenter ? "4, 4" : undefined,
            }).addTo(map);

            poly.on("mouseover", () => {
              poly.setStyle({
                fillOpacity: 0.62,
                weight: 3.5,
                color: "#F59E0B",
              });
              poly.bringToFront();
            });

            poly.on("mouseout", () => {
              poly.setStyle({
                fillOpacity: zone.isCenter ? 0.38 : 0.30,
                weight: zone.isCenter ? 2.5 : 1.8,
                color: "#FFFFFF",
              });
            });

            poly.bindPopup(`
              <div style="font-family: ui-sans-serif, system-ui, sans-serif; min-width: 220px; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-bottom: 6px;">
                  <strong style="color: #0F223D; font-size: 13px; font-weight: 800;">${zone.name}</strong>
                  <span style="background: ${zone.color}22; color: ${zone.color}; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; border: 1px solid ${zone.color}40;">
                    ${zone.status}
                  </span>
                </div>
                <div style="font-size: 10px; color: #64748B; margin-bottom: 6px; line-height: 1.3;">
                  ${zone.description}
                </div>
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;">
                    <span style="font-size: 10px; color: #64748B; font-weight: 600;">Ort. m² Piyasa Değeri:</span>
                    <span style="font-size: 13px; font-weight: 900; color: #0F223D;">${zone.unitPriceTL.toLocaleString("tr-TR")} ₺/m²</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <span style="font-size: 10px; color: #059669; font-weight: 600;">İhale Başlangıç (%50):</span>
                    <span style="font-size: 11px; font-weight: 800; color: #059669;">${zone.tenderStartPriceTL.toLocaleString("tr-TR")} ₺/m²</span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px;">
                  <span style="color: #64748B;">Yıllık Değer Artış Hızı:</span>
                  <span style="font-weight: 800; color: #16A34A;">+%${zone.yearlyGrowthRate}</span>
                </div>
                <div style="font-size: 8.5px; color: #94A3B8; text-align: center; margin-top: 6px; border-top: 1px solid #F1F5F9; padding-top: 4px;">
                  İhaleci Burada Emsal Değerleme & Bölge Isı Katmanı
                </div>
              </div>
            `);

            if (showZoneBadges) {
              const badgeIcon = L.divIcon({
                className: "leaflet-zone-pill",
                html: `
                  <div style="display: flex; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
                    <div style="background: rgba(15, 34, 61, 0.90); backdrop-filter: blur(4px); color: #FFFFFF; font-weight: 700; font-size: 9.5px; padding: 2.5px 8px; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 3px 8px rgba(0,0,0,0.3); white-space: nowrap; display: flex; align-items: center; gap: 5px; font-family: ui-sans-serif, system-ui, sans-serif;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: ${zone.color}; box-shadow: 0 0 5px ${zone.color};"></span>
                      <span style="color: #F8FAFC;">${zone.name}</span>
                      <span style="color: #F59E0B; font-weight: 900; border-left: 1px solid rgba(255,255,255,0.25); padding-left: 5px;">${formatShortPrice(zone.unitPriceTL)}/m²</span>
                    </div>
                  </div>
                `,
                iconSize: [0, 0],
              });
              const badgeMarker = L.marker(zone.centroid, {
                icon: badgeIcon,
                interactive: true,
                zIndexOffset: zone.isCenter ? 800 : 500,
              }).addTo(map);

              badgeMarker.on("click", () => {
                poly.openPopup();
              });
            }
          });
        }
      }

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
        <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-size: 10px; font-weight: 800; color: #3B82F6; text-transform: uppercase;">Değerlenen Taşınmaz</div>
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin: 2px 0;">${city} / ${district}</div>
          <div style="font-size: 11px; color: #64748B;">Ada: ${ada || "-"} | Parsel: ${parsel || "-"}</div>
          ${elevationMeters !== undefined ? `<div style="font-size: 10px; color: #059669; margin-top: 4px; font-weight: 700;">Rakım: ${elevationMeters}m (Open Topo)</div>` : ""}
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
    district, 
    neighborhood, 
    ada, 
    parsel, 
    elevationMeters,
    unitM2Price,
    isEndeksaSplitView,
    showValuationZones,
    showZoneBadges,
    viewMode
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
            {city} / {district} {neighborhood ? `— ${neighborhood}` : ""}
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

          {/* Görünüm Modu Seçimi: İlçe Sınırları vs Parsel/Emsaller */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-700 text-[10px]">
            <button
              type="button"
              onClick={() => setViewMode("ilceler")}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "ilceler"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
              title="İl geneli gerçek ilçe sınırları ve değerleme haritası"
            >
              <Layers className="w-3 h-3 text-emerald-300" />
              <span>İlçe Sınırları</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("parsel")}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === "parsel"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Değerlenen taşınmaz, mahalle mozaiği ve emsal ilanlar"
            >
              <MapPin className="w-3 h-3 text-blue-300" />
              <span>Parsel & Emsaller</span>
            </button>
          </div>

          {/* Bölge Isı Katmanı Aç/Kapat Butonu (Parsel modunda) */}
          {isEndeksaSplitView && viewMode === "parsel" && (
            <button
              type="button"
              onClick={() => setShowValuationZones((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition text-[10px] cursor-pointer border ${
                showValuationZones
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
              title="Bölgesel değerleme ve mahalle katmanını aç/kapat"
            >
              <Layers2 className="w-3 h-3 text-amber-400" />
              <span>Bölgeler: {showValuationZones ? "Açık" : "Kapalı"}</span>
            </button>
          )}

          {/* Emsal Filtre Butonları */}
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
            {kiralikCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter("kiralik")}
                className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                  filter === "kiralik" ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                Kiralık ({kiralikCount})
              </button>
            )}
          </div>

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
      <div className={`relative w-full bg-slate-100 z-10 ${
        isEndeksaSplitView 
          ? "h-full min-h-[540px] sm:min-h-[680px] lg:min-h-[820px]" 
          : "h-72 sm:h-80"
      }`}>
        <div ref={mapContainerRef} className="w-full h-full" />

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
        `}</style>

        {/* GPS Geri Bildirim Bildirimi */}
        {locateFeedback && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[450] bg-slate-900/90 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 animate-bounce">
            <Navigation className="w-3 h-3 text-amber-400" />
            <span>{locateFeedback}</span>
          </div>
        )}

        {/* İhaleci Burada Üst Ekmek Kırıntısı (Breadcrumb Overlay) */}
        {isEndeksaSplitView && (
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="text-slate-500">Türkiye</span>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-700">{city}</span>
            <span className="text-slate-300">&gt;</span>
            <span className="text-amber-600 font-bold">{district}</span>
          </div>
        )}

        {/* İhaleci Burada Lejant Çubuğu (Isı Haritası Skalası) */}
        {isEndeksaSplitView ? (
          <div className="absolute bottom-4 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-200 text-slate-800">
            {viewMode === "ilceler" ? (
              <div>
                <div className="text-[10px] font-extrabold text-slate-800 mb-1.5 flex items-center justify-between gap-3">
                  <span>{city} İlçe Değerleme Isı Haritası</span>
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Gerçek İlçe İdari Sınırları
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
                  <span>🟢 Uygun Emsal (Çan, Yenice)</span>
                  <span>🔴 Lüks Segment (Bozcaada)</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[10px] font-extrabold text-slate-800 mb-1.5 flex items-center justify-between gap-3">
                  <span>{category === "arsa" ? "Arsa" : "Konut"} m² Değer Skalası</span>
                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Sıfır Boşluklu İdari Bölge Mozaği
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-700">
                    {formatShortPrice(Math.round(unitM2Price * 0.74))}
                  </span>
                  <div className="w-28 sm:w-36 h-2 rounded-full bg-gradient-to-r from-emerald-600 via-amber-400 to-rose-600 shadow-inner"></div>
                  <span className="text-[10px] font-mono font-bold text-rose-700">
                    {formatShortPrice(Math.round(unitM2Price * 1.38))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>🟢 Fırsat Bölgesi</span>
                  <span>🟡 Değerlenen</span>
                  <span>🔴 Prestij Aksı</span>
                  <button
                    type="button"
                    onClick={() => setShowZoneBadges((p) => !p)}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                  >
                    Etiketler: {showZoneBadges ? "Gizle" : "Göster"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standart Harita İçi Gösterge Rozeti (Legend) */
          <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-xs border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-3 text-[10px] text-slate-700 font-semibold">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F223D] border border-amber-400 inline-block"></span>
              <span>Hedef Taşınmaz</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>Satılık Emsal</span>
            </div>
            {kiralikCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                <span>Kiralık Emsal</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-slate-400 border-l border-slate-200 pl-2">
              <span>⭕ 500m Etki Çemberi</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. ÇEVREDEKİ EMSAL İLANLAR YATAY ŞERİDİ (ETKİLEŞİMLİ) */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 font-heading">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            Haritada Gösterilen Çevre Emsal İlanlar ({filteredComps.length} İlan)
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
      <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
        <span>Açık Kaynak Harita Katmanı: OpenStreetMap & Leaflet (Nominatim Geocoding)</span>
        <span className="font-mono">{lat.toFixed(5)}° K, {lng.toFixed(5)}° D</span>
      </div>
    </div>
  );
};
