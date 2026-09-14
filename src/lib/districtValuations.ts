// Türkiye İlçe Düzeyi Değerleme ve Fiyat Kataloğu

export interface DistrictValuation {
  name: string;
  pricePerM2TL: number;
  tenderStartM2TL: number;
  yearlyGrowth: number;
  opportunityScore: number;
  isSpecialBadge?: string;
}

// Çanakkale İlçeleri (Ekran Görüntüsü ile Birebir)
export const CANAKKALE_DISTRICT_PRICES: Record<string, number> = {
  "yenice": 41711, // Birebir ekran görüntüsündeki 41.711 ₺/m²
  "çanakkale": 48500, // Merkez
  "merkez": 48500,
  "bozcaada": 96400, // Kırmızı ada
  "gökçeada": 42800,
  "ayvacık": 52600,
  "biga": 34500,
  "gelibolu": 38900,
  "eceabat": 43200,
  "lâpseki": 39800,
  "lapseki": 39800,
  "ezine": 33200,
  "bayramiç": 32400,
  "çan": 31800,
};

// İlçe m² Değerini Çözen Fonksiyon
export function getDistrictValuation(
  provinceName: string,
  districtName: string,
  baseM2Price: number = 45000
): DistrictValuation {
  const normProv = (provinceName || "").toLowerCase().trim()
    .replace(/i̇/g, "i").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o");
  const normDist = (districtName || "").toLowerCase().trim()
    .replace(/i̇/g, "i").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o");

  let price = 0;

  if (normProv.includes("canakkale")) {
    price = CANAKKALE_DISTRICT_PRICES[normDist] || CANAKKALE_DISTRICT_PRICES[districtName.toLowerCase()] || 0;
  }

  if (!price) {
    // İstanbul ilçeleri referansı
    const istPrices: Record<string, number> = {
      "besiktas": 125000, "sariyer": 140000, "kadikoy": 115000, "bakirkoy": 95000,
      "sisli": 98000, "uskudar": 85000, "beyoglu": 90000, "atasehir": 78000,
      "maltepe": 68000, "kartal": 58000, "pendik": 48000, "umraniye": 62000,
      "fatih": 54000, "zeytinburnu": 52000, "basaksehir": 64000, "esenyurt": 28000,
    };
    price = istPrices[normDist] || 0;
  }

  if (!price) {
    // İzmir ilçeleri referansı
    const izmPrices: Record<string, number> = {
      "cesme": 110000, "urla": 85000, "karsiyaka": 65000, "bostanli": 72000,
      "konak": 58000, "alsancak": 75000, "bornova": 52000, "cigli": 42000,
      "buca": 36000, "balcova": 60000, "narlidere": 68000, "seferihisar": 55000,
    };
    price = izmPrices[normDist] || 0;
  }

  if (!price) {
    // Dinamik hesaplama: baz fiyata göre ilçe adı hash'i ile deterministik gerçekçi varyasyon
    let hash = 0;
    for (let i = 0; i < normDist.length; i++) {
      hash = (hash << 5) - hash + normDist.charCodeAt(i);
      hash |= 0;
    }
    const mult = 0.72 + (Math.abs(hash) % 55) / 100; // 0.72x - 1.26x
    price = Math.round(baseM2Price * mult);
  }

  const tenderStart = Math.round(price * 0.5);
  const yearlyGrowth = Number((42 + ((price % 1000) / 100)).toFixed(1));
  const opportunityScore = Math.min(96, Math.max(65, Math.round(100 - (price / 2000))));

  return {
    name: districtName,
    pricePerM2TL: price,
    tenderStartM2TL: tenderStart,
    yearlyGrowth: yearlyGrowth,
    opportunityScore: opportunityScore,
    isSpecialBadge: normDist.includes("bozcaada") ? "B" : undefined,
  };
}

export function getDistrictChoroplethColor(pricePerM2: number, districtName: string): {
  fillColor: string;
  fillOpacity: number;
  color: string;
  weight: number;
} {
  const norm = districtName.toLowerCase().replace(/i̇/g, "i").replace(/ı/g, "i");

  // Bozcaada veya ultra lüks bölgeler ekran görüntüsünde kırmızı/bordo görünür
  if (norm.includes("bozcaada") || pricePerM2 > 88000) {
    return {
      fillColor: "#991B1B", // Dark Crimson Red
      fillOpacity: 0.65,
      color: "#FFFFFF",
      weight: 1.5,
    };
  }

  // Yeşil tonları skalası (Screenshot ile birebir)
  let fillColor = "#166534"; // Çok koyu zümrüt
  if (pricePerM2 >= 48000) {
    fillColor = "#15803D";
  } else if (pricePerM2 >= 41000) {
    fillColor = "#166534"; // Yenice koyu yeşil
  } else if (pricePerM2 >= 37000) {
    fillColor = "#16A34A";
  } else if (pricePerM2 >= 33000) {
    fillColor = "#22C55E";
  } else {
    fillColor = "#15803D";
  }

  return {
    fillColor,
    fillOpacity: 0.58,
    color: "#FFFFFF",
    weight: 1.5,
  };
}
