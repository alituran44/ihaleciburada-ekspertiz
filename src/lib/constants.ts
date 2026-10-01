import { ParcelInput } from "@/types";

export const SAMPLE_SCENARIOS: { label: string; description: string; data: ParcelInput }[] = [
  {
    label: "TKGM Resmi Parsel: Çanakkale Karacaören 117/9",
    description: "TKGM Kayıtlı 4.961,37 m² Arsa — Kat İrtifakı — Enderesi Mevkii (Pafta: H16c09c1a/1B)",
    data: {
      category: "arsa",
      title: "Çanakkale Merkez Karacaören 117 Ada 9 Parsel (Enderesi)",
      city: "Çanakkale",
      district: "Merkez",
      neighborhood: "Karacaören",
      ada: "117",
      parsel: "9",
      areaM2: 4961.37,
      roadAccess: "var",
      roadFrontageM: 42,
      isCornerParcel: true,
      topography: "duz",
      zoningType: "konut",
      kaks: 1.50,
      taks: 0.35,
      gabariM: 15.5,
      maxFloors: 5,
      relinquishmentRatio: 10,
      askedPriceTL: 19800000,
      isTender: false,
      tenderAuthority: "Çanakkale Tapu ve Kadastro Müdürlüğü",
      tenderFileNo: "133826 / H16c09c1a/1B",
      estimatedLandM2PriceTL: 4200,
      estimatedUnitSaleM2PriceTL: 38000,
      contractorSharePercent: 50,
      coordinates: { lat: 40.169844, lng: 26.430442 },
      consultantName: "Ali TURAN",
      consultantPhone: "+90 850 308 00 00",
      consultantAgency: "İhaleciBurada Gayrimenkul & Değerleme",
      notes: "TKGM 133826 Zemin Nolu, Enderesi Mevkii, Kat İrtifaklı, 4.961,37 m² İmarlı Arsa.",
      serhStatus: "tapudan_sorulacak",
    }
  },
  {
    label: "Belediye İhalesi: Çanakkale Kepez Konut Arsası",
    description: "İhale Başlangıç: 14.500.000 TL — Emsal 1.50 — 24 Dairelik Proje Potansiyeli",
    data: {
      category: "arsa",
      title: "Çanakkale Kepez Sahil Bölgesi Konut Geliştirme Parseli",
      city: "Çanakkale",
      district: "Merkez",
      neighborhood: "Kepez",
      ada: "248",
      parsel: "12",
      areaM2: 1650,
      roadAccess: "var",
      roadFrontageM: 28,
      isCornerParcel: true,
      topography: "duz",
      zoningType: "konut",
      kaks: 1.50,
      taks: 0.35,
      gabariM: 15.5,
      maxFloors: 5,
      relinquishmentRatio: 10,
      askedPriceTL: 14500000,
      isTender: true,
      tenderAuthority: "Çanakkale Belediyesi İhale Birimi",
      tenderFileNo: "2026/04-İH-17",
      estimatedLandM2PriceTL: 13000,
      estimatedUnitSaleM2PriceTL: 45000,
      contractorSharePercent: 50,
      coordinates: { lat: 40.1065, lng: 26.4175 },
      consultantName: "Hasan Hüseyin Yıldırım",
      consultantPhone: "0850 840 86 95",
      consultantAgency: "İhaleciBurada Kurumsal Portföy",
      notes: "Deniz manzaralı, ana artere 150m mesafede. Belediye mülkiyetinden açık artırma ile satış.",
    }
  },
  {
    label: "İcra İhalesi: Kadıköy Moda 3+1 Daire",
    description: "İhale Başlangıç: 9.800.000 TL — 135 m² — 55.000 TL Aylık Kira Getirisi",
    data: {
      category: "konut",
      title: "Kadıköy Moda Sahil Yakını 3+1 Geniş Ara Kat Daire",
      city: "İstanbul",
      district: "Kadıköy",
      neighborhood: "Caferağa",
      ada: "184",
      parsel: "22",
      areaM2: 135,
      netAreaM2: 115,
      coordinates: { lat: 40.9880, lng: 29.0280 },
      housingType: "daire",
      roomCount: "3+1",
      buildingAge: "1-5",
      floorLocation: "ara_kat",
      totalFloorsInBuilding: 5,
      heatingType: "dogalgaz_kombi",
      deedStatus: "kat_mulkiyeti",
      hasElevator: true,
      hasParking: true,
      hasBalcony: true,
      inGatedCommunity: false,
      isFurnished: false,
      isCreditEligible: true,
      monthlyRentEstimateTL: 55000,
      roadAccess: "var",
      roadFrontageM: 15,
      isCornerParcel: false,
      topography: "duz",
      zoningType: "konut",
      kaks: 1.5,
      taks: 0.35,
      gabariM: 15,
      maxFloors: 5,
      relinquishmentRatio: 0,
      askedPriceTL: 9800000,
      isTender: true,
      tenderAuthority: "İstanbul Anadolu 4. İcra Dairesi",
      tenderFileNo: "2026/842-ESAT",
      estimatedLandM2PriceTL: 36000,
      estimatedUnitSaleM2PriceTL: 95000,
      contractorSharePercent: 50,
      consultantName: "Hasan Hüseyin Yıldırım",
      consultantPhone: "0850 840 86 95",
      consultantAgency: "İhaleciBurada Gayrimenkul İcra Masası",
      notes: "Metro ve tramvay durağına 300 metre mesafede, yüksek kira çarpanlı birinci sınıf lokasyon.",
    }
  },
  {
    label: "Satılık Müstakil Villa: Muğla Bodrum Yalıkavak",
    description: "Özel Havuzlu 4+1 Müstakil Villa — 280 m² Brüt — Yüksek Prim Potansiyeli",
    data: {
      category: "konut",
      title: "Bodrum Yalıkavak Marina Manzaralı Müstakil Havuzlu Villa",
      city: "Muğla",
      district: "Bodrum",
      neighborhood: "Yalıkavak",
      ada: "512",
      parsel: "4",
      areaM2: 280,
      netAreaM2: 240,
      coordinates: { lat: 37.1067, lng: 27.2917 },
      housingType: "villa",
      roomCount: "4+1",
      buildingAge: "0",
      floorLocation: "mustakil",
      totalFloorsInBuilding: 2,
      heatingType: "yerden_isitma",
      deedStatus: "kat_mulkiyeti",
      hasElevator: false,
      hasParking: true,
      hasBalcony: true,
      inGatedCommunity: true,
      isFurnished: true,
      isCreditEligible: true,
      monthlyRentEstimateTL: 140000,
      roadAccess: "var",
      roadFrontageM: 25,
      isCornerParcel: true,
      topography: "az_egimli",
      zoningType: "villa",
      kaks: 0.6,
      taks: 0.2,
      gabariM: 6.5,
      maxFloors: 2,
      relinquishmentRatio: 0,
      askedPriceTL: 34500000,
      isTender: false,
      estimatedLandM2PriceTL: 31000,
      estimatedUnitSaleM2PriceTL: 130000,
      contractorSharePercent: 45,
      consultantName: "Selim Çetin",
      consultantPhone: "0532 999 88 77",
      consultantAgency: "Bodrum Elite Portföy",
      notes: "Yalıkavak Marina'ya 5 dakika sürüş mesafesinde, akıllı ev sistemli, müstakil bahçe ve sonsuzluk havuzlu.",
    }
  },
  {
    label: "Kat Karşılığı: İstanbul Çekmeköy Villa / Konut",
    description: "Emlakçı Portföyü: 2.400 m² — Emsal 0.80 — Butik Site Yapımına Uygun",
    data: {
      category: "arsa",
      title: "Çekmeköy Orman Kenarı Butik Konut & Villa Arsası",
      city: "İstanbul",
      district: "Çekmeköy",
      neighborhood: "Ömerli",
      ada: "1420",
      parsel: "3",
      areaM2: 2400,
      roadAccess: "var",
      roadFrontageM: 35,
      isCornerParcel: false,
      topography: "az_egimli",
      zoningType: "villa",
      kaks: 0.80,
      taks: 0.25,
      gabariM: 9.5,
      maxFloors: 3,
      relinquishmentRatio: 15,
      askedPriceTL: 32000000,
      isTender: false,
      estimatedLandM2PriceTL: 15000,
      estimatedUnitSaleM2PriceTL: 68000,
      contractorSharePercent: 48,
      consultantName: "Ahmet Erdem",
      consultantPhone: "0532 555 12 34",
      consultantAgency: "Ömerli Gayrimenkul Yatırım Danışmanlığı",
      notes: "Doğa ile iç içe, müstakil girişli 12 adet ikiz villa yapımına imkan tanıyan temiz kadastro parseli.",
    }
  }
];

export function formatTL(amount: number): string {
  if (isNaN(amount)) return "0 ₺";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount).replace("TRY", "₺");
}

export function formatNumber(amount: number, maxDigits: number = 2): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "0";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  }).format(amount);
}

/**
 * Alan (m²) formatlayıcı:
 * - Binlik ayıraç olarak '.' kullanır (örn: 16.200)
 * - Küsüratlı kısımlarda en fazla 2 basamak gösterir (örn: 16.200,46)
 * - Tam sayılarda gereksiz ',00' eklemez (örn: 1.000)
 */
export function formatArea(amount: number | null | undefined, maxDigits: number = 2): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) return "0";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  }).format(amount);
}

/**
 * Kullanıcı girdisini veya API çıktısını güvenli şekilde sayıya çevirir:
 * "16.200,46" -> 16200.46
 * "16,20046"  -> 16200.46
 * "16200,46"  -> 16200.46
 * "1.000"     -> 1000
 * "16.200"    -> 16200
 */
export function parseTurkishNumber(input: string | number | null | undefined): number {
  if (typeof input === "number") return isNaN(input) ? 0 : input;
  if (!input) return 0;

  let str = String(input).trim().replace(/[^\d.,-]/g, "");
  if (!str) return 0;

  if (str.includes(".") && str.includes(",")) {
    const lastDot = str.lastIndexOf(".");
    const lastComma = str.lastIndexOf(",");
    if (lastComma > lastDot) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    const parts = str.split(",");
    if (parts.length === 2 && parts[0].length <= 3 && parts[1].length >= 4) {
      const thousands = parts[0] + parts[1].slice(0, 3);
      const decimals = parts[1].slice(3);
      str = decimals.length > 0 ? (thousands + "." + decimals) : thousands;
    } else {
      str = str.replace(",", ".");
    }
  } else if (str.includes(".")) {
    const parts = str.split(".");
    if (parts.length === 2) {
      if (parts[1].length === 3) {
        str = parts[0] + parts[1];
      } else if (parts[0].length <= 3 && parts[1].length >= 4) {
        const thousands = parts[0] + parts[1].slice(0, 3);
        const decimals = parts[1].slice(3);
        str = decimals.length > 0 ? (thousands + "." + decimals) : thousands;
      }
    } else if (parts.length > 2) {
      str = str.replace(/\./g, "");
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}
