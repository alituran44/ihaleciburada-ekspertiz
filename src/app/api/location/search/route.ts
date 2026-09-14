import { NextRequest, NextResponse } from "next/server";
import { 
  searchDistrictsAndProvinces, 
  TURKEY_PROVINCES_AND_DISTRICTS 
} from "@/lib/turkeyLocations";

// 81 İl Merkez Koordinatları
const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Adana": { lat: 37.0000, lng: 35.3213 },
  "Adıyaman": { lat: 37.7648, lng: 38.2786 },
  "Afyonkarahisar": { lat: 38.7507, lng: 30.5567 },
  "Ağrı": { lat: 39.7191, lng: 43.0503 },
  "Amasya": { lat: 40.6501, lng: 35.8353 },
  "Ankara": { lat: 39.9334, lng: 32.8597 },
  "Antalya": { lat: 36.8969, lng: 30.7133 },
  "Artvin": { lat: 41.1828, lng: 41.8183 },
  "Aydın": { lat: 37.8560, lng: 27.8416 },
  "Balıkesir": { lat: 39.6484, lng: 27.8826 },
  "Bilecik": { lat: 40.1451, lng: 29.9799 },
  "Bingöl": { lat: 38.8854, lng: 40.4966 },
  "Bitlis": { lat: 38.4006, lng: 42.1095 },
  "Bolu": { lat: 40.7350, lng: 31.6061 },
  "Burdur": { lat: 37.7203, lng: 30.2908 },
  "Bursa": { lat: 40.1885, lng: 29.0610 },
  "Çanakkale": { lat: 40.1553, lng: 26.4142 },
  "Çankırı": { lat: 40.6013, lng: 33.6134 },
  "Çorum": { lat: 40.5506, lng: 34.9556 },
  "Denizli": { lat: 37.7765, lng: 29.0864 },
  "Diyarbakır": { lat: 37.9144, lng: 40.2306 },
  "Edirne": { lat: 41.6771, lng: 26.5557 },
  "Elazığ": { lat: 38.6810, lng: 39.2264 },
  "Erzincan": { lat: 39.7500, lng: 39.5000 },
  "Erzurum": { lat: 39.9055, lng: 41.2658 },
  "Eskişehir": { lat: 39.7767, lng: 30.5206 },
  "Gaziantep": { lat: 37.0662, lng: 37.3833 },
  "Giresun": { lat: 40.9128, lng: 38.3895 },
  "Gümüşhane": { lat: 40.4600, lng: 39.4814 },
  "Hakkari": { lat: 37.5833, lng: 43.7333 },
  "Hatay": { lat: 36.2023, lng: 36.1606 },
  "Isparta": { lat: 37.7648, lng: 30.5566 },
  "Mersin": { lat: 36.8121, lng: 34.6415 },
  "İstanbul": { lat: 41.0082, lng: 28.9784 },
  "İzmir": { lat: 38.4237, lng: 27.1428 },
  "Kars": { lat: 40.6013, lng: 43.0975 },
  "Kastamonu": { lat: 41.3887, lng: 33.7827 },
  "Kayseri": { lat: 38.7312, lng: 35.4787 },
  "Kırklareli": { lat: 41.7333, lng: 27.2167 },
  "Kırşehir": { lat: 39.1425, lng: 34.1709 },
  "Kocaeli": { lat: 40.8533, lng: 29.8815 },
  "Konya": { lat: 37.8667, lng: 32.4833 },
  "Kütahya": { lat: 39.4167, lng: 29.9833 },
  "Malatya": { lat: 38.3552, lng: 38.3095 },
  "Manisa": { lat: 38.6191, lng: 27.4289 },
  "Kahramanmaraş": { lat: 37.5858, lng: 36.9371 },
  "Mardin": { lat: 37.3212, lng: 40.7245 },
  "Muğla": { lat: 37.2153, lng: 28.3636 },
  "Muş": { lat: 38.9462, lng: 41.7539 },
  "Nevşehir": { lat: 38.6250, lng: 34.7122 },
  "Niğde": { lat: 37.9667, lng: 34.6833 },
  "Ordu": { lat: 40.9839, lng: 37.8764 },
  "Rize": { lat: 41.0201, lng: 40.5234 },
  "Sakarya": { lat: 40.7569, lng: 30.3783 },
  "Samsun": { lat: 41.2928, lng: 36.3313 },
  "Siirt": { lat: 37.9333, lng: 41.9500 },
  "Sinop": { lat: 42.0231, lng: 35.1531 },
  "Sivas": { lat: 39.7477, lng: 37.0179 },
  "Tekirdağ": { lat: 40.9833, lng: 27.5167 },
  "Tokat": { lat: 40.3167, lng: 36.5500 },
  "Trabzon": { lat: 41.0027, lng: 39.7168 },
  "Tunceli": { lat: 39.1079, lng: 39.5401 },
  "Şanlıurfa": { lat: 37.1591, lng: 38.7969 },
  "Uşak": { lat: 38.6823, lng: 29.4082 },
  "Van": { lat: 38.4891, lng: 43.4089 },
  "Yozgat": { lat: 39.8181, lng: 34.8147 },
  "Zonguldak": { lat: 41.4564, lng: 31.7987 },
  "Aksaray": { lat: 38.3687, lng: 34.0370 },
  "Bayburt": { lat: 40.2552, lng: 40.2249 },
  "Karaman": { lat: 37.1759, lng: 33.2287 },
  "Kırıkkale": { lat: 39.8468, lng: 33.5153 },
  "Batman": { lat: 37.8812, lng: 41.1293 },
  "Şırnak": { lat: 37.5164, lng: 42.4611 },
  "Bartın": { lat: 41.6344, lng: 32.3375 },
  "Ardahan": { lat: 41.1105, lng: 42.7022 },
  "Iğdır": { lat: 39.9196, lng: 44.0454 },
  "Yalova": { lat: 40.6500, lng: 29.2667 },
  "Karabük": { lat: 41.2061, lng: 32.6204 },
  "Kilis": { lat: 36.7184, lng: 37.1212 },
  "Osmaniye": { lat: 37.0742, lng: 36.2472 },
  "Düzce": { lat: 40.8438, lng: 31.1565 },
};

const searchCache = new Map<string, any[]>();

export interface LocationSearchResult {
  id: string;
  label: string;
  secondaryLabel: string;
  type: "il" | "ilce" | "koy" | "mahalle" | "belde" | "konum";
  province: string;
  district: string;
  neighborhood?: string;
  lat: number;
  lng: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  const cacheKey = trimmed.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return NextResponse.json({ success: true, results: searchCache.get(cacheKey) });
  }

  const results: LocationSearchResult[] = [];

  // 1. AŞAMA: Yerel Türkiye Veritabanında İl ve İlçe Arama (0ms)
  const localMatches = searchDistrictsAndProvinces(trimmed, 8);
  for (const match of localMatches) {
    const coords = PROVINCE_COORDINATES[match.province] || { lat: 39.0, lng: 35.0 };

    if (match.type === "il") {
      results.push({
        id: `il-${match.province}`,
        label: match.province,
        secondaryLabel: `${TURKEY_PROVINCES_AND_DISTRICTS[match.province]?.region || "Türkiye"} Bölgesi • İl`,
        type: "il",
        province: match.province,
        district: "Merkez",
        lat: coords.lat,
        lng: coords.lng,
      });
    } else if (match.type === "ilce" && match.district) {
      results.push({
        id: `ilce-${match.province}-${match.district}`,
        label: match.district,
        secondaryLabel: `${match.province} • İlçe`,
        type: "ilce",
        province: match.province,
        district: match.district,
        lat: coords.lat,
        lng: coords.lng,
      });
    }
  }

  // 2. AŞAMA: Eğer sorgu köy, mahalle veya spesifik bir yer adı içeriyorsa (OSM Nominatim)
  if (trimmed.length >= 3) {
    try {
      const osmQuery = encodeURIComponent(`${trimmed}, Türkiye`);
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${osmQuery}&countrycodes=tr&addressdetails=1&format=json&limit=6`,
        {
          headers: {
            "User-Agent": "IhaleciBurada-Ekspertiz-LocationService/1.0 (info@ihaleciburada.com)",
          },
        }
      );

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (Array.isArray(osmData)) {
          for (const item of osmData) {
            const addr = item.address || {};
            const provinceName = addr.province || addr.state || "";
            const districtName = addr.county || addr.town || addr.city_district || addr.district || "Merkez";
            const villageOrNeigh = addr.village || addr.hamlet || addr.suburb || addr.neighbourhood || addr.quarter || item.name;

            let locType: "il" | "ilce" | "koy" | "mahalle" | "belde" | "konum" = "konum";
            if (addr.village || addr.hamlet) locType = "koy";
            else if (addr.neighbourhood || addr.suburb || addr.quarter) locType = "mahalle";
            else if (addr.town) locType = "belde";
            else if (item.addresstype === "county") locType = "ilce";

            const resId = `osm-${item.place_id}`;
            if (!results.some((r) => r.label === villageOrNeigh && r.province === provinceName)) {
              results.push({
                id: resId,
                label: villageOrNeigh || item.display_name.split(",")[0],
                secondaryLabel: `${districtName ? districtName + ", " : ""}${provinceName || "Türkiye"} • ${
                  locType === "koy" ? "Köy" : locType === "mahalle" ? "Mahalle" : locType === "belde" ? "Belde" : "Konum"
                }`,
                type: locType,
                province: provinceName || "Çanakkale",
                district: districtName || "Merkez",
                neighborhood: locType === "koy" || locType === "mahalle" ? villageOrNeigh : undefined,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("OSM Nominatim sorgusu tamamlanamadı:", e);
    }
  }

  const finalResults = results.slice(0, 10);
  searchCache.set(cacheKey, finalResults);

  return NextResponse.json({
    success: true,
    results: finalResults,
  });
}
