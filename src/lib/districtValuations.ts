// Türkiye İlçe ve Mahalle Düzeyi Akıllı Değerleme ve Fiyat Kataloğu

export interface DistrictValuation {
  name: string;
  pricePerM2TL: number;
  tenderStartM2TL: number;
  yearlyGrowth: number;
  opportunityScore: number;
  isSpecialBadge?: string;
}

export interface ValuationOptions {
  category?: string; // "arsa" | "konut" | "arazi" | "ticari" | "bina" | "turizm" | "ozel"
  subCategory?: string; // "Daire", "Tarla", "İmarlı Arsa", "Villa", vb.
  neighborhood?: string | null;
  ada?: string | null;
  parsel?: string | null;
  areaM2?: number | null;
}

// Çanakkale İlçeleri Konut Baz Fiyatları (TL/m²)
export const CANAKKALE_DISTRICT_PRICES: Record<string, number> = {
  "yenice": 41711, // Ekran görüntüsündeki 41.711 ₺/m²
  "çanakkale": 48500, // Merkez konut ortalaması
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

// Çanakkale İlçeleri Arsa Baz Fiyatları (TL/m²)
export const CANAKKALE_DISTRICT_LAND_PRICES: Record<string, number> = {
  "yenice": 6500,
  "çanakkale": 18500, // Merkez arsa ortalaması
  "merkez": 18500,
  "bozcaada": 36000,
  "gökçeada": 14000,
  "ayvacık": 16500,
  "biga": 8500,
  "gelibolu": 9500,
  "eceabat": 12500,
  "lâpseki": 11500,
  "lapseki": 11500,
  "ezine": 7800,
  "bayramiç": 6800,
  "çan": 7200,
};

// Çanakkale Mahalleleri Özel Fiyat Matrisi (TL/m²)
interface NeighborhoodPrice {
  konut: number;
  arsa: number;
  arazi: number;
  ticari: number;
}

export const CANAKKALE_NEIGHBORHOOD_PRICES: Record<string, NeighborhoodPrice> = {
  "cevatpasa": { konut: 56500, arsa: 24500, arazi: 8500, ticari: 72000 },
  "barbaros": { konut: 51500, arsa: 21000, arazi: 7000, ticari: 65000 },
  "kemalpasa": { konut: 49000, arsa: 26000, arazi: 7500, ticari: 78000 },
  "ismetpasa": { konut: 46500, arsa: 18500, arazi: 6000, ticari: 56000 },
  "esenler": { konut: 44000, arsa: 17000, arazi: 5500, ticari: 48000 },
  "fevzipasa": { konut: 38000, arsa: 15000, arazi: 4800, ticari: 42000 },
  "namikkemal": { konut: 41500, arsa: 16000, arazi: 5000, ticari: 45000 },
  "kepez": { konut: 45000, arsa: 14000, arazi: 4500, ticari: 52000 },
  "karacaoren": { konut: 38500, arsa: 8800, arazi: 2650, ticari: 38000 },
  "guzelyali": { konut: 68000, arsa: 28500, arazi: 9000, ticari: 65000 },
  "dardanos": { konut: 72000, arsa: 31000, arazi: 9500, ticari: 70000 },
  "erenkoy": { konut: 40000, arsa: 9500, arazi: 3200, ticari: 36000 },
  "intepe": { konut: 40000, arsa: 9500, arazi: 3200, ticari: 36000 },
  "kumkale": { konut: 32000, arsa: 5500, arazi: 2100, ticari: 30000 },
  "tevfikiye": { konut: 34000, arsa: 6000, arazi: 2400, ticari: 32000 },
  "kalabakli": { konut: 35000, arsa: 6500, arazi: 2200, ticari: 30000 },
  "isiklar": { konut: 32000, arsa: 5200, arazi: 1900, ticari: 28000 },
  "cinarli": { konut: 33000, arsa: 5600, arazi: 2000, ticari: 29000 },
  "arslanca": { konut: 43000, arsa: 16500, arazi: 5000, ticari: 47000 },
};

function normalizeStr(str: string): string {
  return (str || "").toLowerCase().trim()
    .replace(/i̇/g, "i").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o");
}

// İlçe ve Mahalle m² Değerini Dinamik Olarak Çözen Fonksiyon
export function getDistrictValuation(
  provinceName: string,
  districtName: string,
  baseM2Price: number = 45000,
  options?: ValuationOptions
): DistrictValuation {
  const normProv = normalizeStr(provinceName);
  const normDist = normalizeStr(districtName);
  const normNeigh = normalizeStr(options?.neighborhood || "");
  const cat = options?.category || "konut";
  const subCat = (options?.subCategory || "").toLowerCase();
  const isLand = cat === "arsa";
  const isAgri = cat === "arazi" || subCat.includes("tarla") || subCat.includes("zeytin") || subCat.includes("bag") || subCat.includes("bahce");
  const isCommercial = cat === "ticari";
  const isTourism = cat === "turizm";
  const isBuilding = cat === "bina";

  let price = 0;

  // 1. Çanakkale İli için Mahalle Düzeyi Doğrudan Rayiç
  if (normProv.includes("canakkale")) {
    if (normNeigh && CANAKKALE_NEIGHBORHOOD_PRICES[normNeigh]) {
      const np = CANAKKALE_NEIGHBORHOOD_PRICES[normNeigh];
      if (isAgri) price = np.arazi;
      else if (isLand) price = np.arsa;
      else if (isCommercial) price = np.ticari;
      else if (isTourism) price = Math.round(np.konut * 1.35);
      else if (isBuilding) price = Math.round(np.konut * 0.95);
      else price = np.konut;
    } else if (normNeigh) {
      // Mahalle adının kısmi eşleşmesi (örn: "cevat pasa" -> "cevatpasa")
      const foundNeighKey = Object.keys(CANAKKALE_NEIGHBORHOOD_PRICES).find(k => normNeigh.includes(k) || k.includes(normNeigh));
      if (foundNeighKey) {
        const np = CANAKKALE_NEIGHBORHOOD_PRICES[foundNeighKey];
        if (isAgri) price = np.arazi;
        else if (isLand) price = np.arsa;
        else if (isCommercial) price = np.ticari;
        else if (isTourism) price = Math.round(np.konut * 1.35);
        else if (isBuilding) price = Math.round(np.konut * 0.95);
        else price = np.konut;
      }
    }

    // Mahalle özelinde bulunamadıysa ilçe baz fiyatı
    if (!price) {
      if (isAgri) {
        const distLand = CANAKKALE_DISTRICT_LAND_PRICES[normDist] || 12000;
        price = Math.round(distLand * 0.28);
      } else if (isLand) {
        price = CANAKKALE_DISTRICT_LAND_PRICES[normDist] || 18500;
      } else {
        const distRes = CANAKKALE_DISTRICT_PRICES[normDist] || CANAKKALE_DISTRICT_PRICES["merkez"] || 48500;
        if (isCommercial) price = Math.round(distRes * 1.30);
        else if (isTourism) price = Math.round(distRes * 1.45);
        else if (isBuilding) price = Math.round(distRes * 0.92);
        else price = distRes;
      }
    }
  }

  // 2. İstanbul İlçeleri
  if (!price && (normProv.includes("istanbul") || normDist.includes("kadikoy"))) {
    const istPrices: Record<string, number> = {
      "besiktas": 125000, "sariyer": 140000, "kadikoy": 115000, "bakirkoy": 95000,
      "sisli": 98000, "uskudar": 85000, "beyoglu": 90000, "atasehir": 78000,
      "maltepe": 68000, "kartal": 58000, "pendik": 48000, "umraniye": 62000,
      "fatih": 54000, "zeytinburnu": 52000, "basaksehir": 64000, "esenyurt": 28000,
    };
    const resBase = istPrices[normDist] || 65000;
    if (isAgri) price = Math.round(resBase * 0.12);
    else if (isLand) price = Math.round(resBase * 0.42);
    else if (isCommercial) price = Math.round(resBase * 1.35);
    else price = resBase;
  }

  // 3. Ankara İlçeleri
  if (!price && (normProv.includes("ankara") || normDist.includes("cankaya"))) {
    const ankPrices: Record<string, number> = {
      "cankaya": 68000, "golbasi": 48000, "yenimahalle": 42000, "etimesgut": 38000,
      "kecioren": 32000, "mamak": 26000, "altindag": 28000, "sincan": 24000, "pursaklar": 30000,
    };
    const resBase = ankPrices[normDist] || 42000;
    if (isAgri) price = Math.round(resBase * 0.10);
    else if (isLand) price = Math.round(resBase * 0.38);
    else if (isCommercial) price = Math.round(resBase * 1.25);
    else price = resBase;
  }

  // 4. Antalya İlçeleri
  if (!price && (normProv.includes("antalya") || normDist.includes("konyaalti"))) {
    const antPrices: Record<string, number> = {
      "muratpasa": 58000, "konyaalti": 72000, "kepez": 34000, "alanya": 62000,
      "manavgat": 48000, "kemer": 76000, "kas": 95000, "serik": 42000,
    };
    const resBase = antPrices[normDist] || 48000;
    if (isAgri) price = Math.round(resBase * 0.14);
    else if (isLand) price = Math.round(resBase * 0.40);
    else if (isCommercial) price = Math.round(resBase * 1.30);
    else price = resBase;
  }

  // 5. İzmir İlçeleri
  if (!price && normProv.includes("izmir")) {
    const izmPrices: Record<string, number> = {
      "cesme": 110000, "urla": 85000, "karsiyaka": 65000, "bostanli": 72000,
      "konak": 58000, "alsancak": 75000, "bornova": 52000, "cigli": 42000,
      "buca": 36000, "balcova": 60000, "narlidere": 68000, "seferihisar": 55000,
    };
    const resBase = izmPrices[normDist] || 45000;
    if (isAgri) price = Math.round(resBase * 0.12);
    else if (isLand) price = Math.round(resBase * 0.38);
    else if (isCommercial) price = Math.round(resBase * 1.30);
    else price = resBase;
  }

  // 6. Genel Deterministik Hesaplama
  if (!price) {
    let hash = 0;
    const combinedKey = `${normProv}_${normDist}_${normNeigh}`;
    for (let i = 0; i < combinedKey.length; i++) {
      hash = (hash << 5) - hash + combinedKey.charCodeAt(i);
      hash |= 0;
    }
    const mult = 0.75 + (Math.abs(hash) % 50) / 100;
    const resolvedBase = baseM2Price > 0 ? baseM2Price : 45000;
    const resBase = Math.round(resolvedBase * mult);

    if (isAgri) price = Math.round(resBase * 0.15);
    else if (isLand) price = Math.round(resBase * 0.38);
    else if (isCommercial) price = Math.round(resBase * 1.25);
    else price = resBase;
  }

  // 7. Ada & Parsel Mikro-Varyasyonu (Parsel bazında farklılık)
  if (options?.ada || options?.parsel) {
    const adaNum = parseInt(options.ada || "0") || 0;
    const parselNum = parseInt(options.parsel || "0") || 0;
    if (adaNum > 0 || parselNum > 0) {
      // ±%4 aralığında stabil deterministik mikro-fark
      const parcelVariancePct = (((adaNum * 7 + parselNum * 13) % 9) - 4) * 0.01;
      price = Math.round(price * (1 + parcelVariancePct));
    }
  }

  // 8. Alan Ölçek Çarpanı (Büyük parseller için toptan iskonto)
  if (options?.areaM2 && options.areaM2 > 0) {
    const a = options.areaM2;
    if (a > 10000) {
      price = Math.round(price * 0.88); // 10 dönüm üzeri %12 toptan iskonto
    } else if (a > 3000) {
      price = Math.round(price * 0.94); // 3-10 dönüm arası %6 iskonto
    } else if (a < 400 && (isLand || isAgri)) {
      price = Math.round(price * 1.08); // Küçük villa parseli %8 primli
    }
  }

  // 100 TL hassasiyetine yuvarla
  price = Math.round(price / 50) * 50;

  const tenderStart = Math.round(price * 0.5);
  const yearlyGrowth = Number((42 + ((price % 1000) / 100)).toFixed(1));
  const opportunityScore = Math.min(96, Math.max(65, Math.round(100 - (price / 2500))));

  return {
    name: options?.neighborhood ? `${districtName} / ${options.neighborhood}` : districtName,
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
