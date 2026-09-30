export type ValuationServiceType = "konut" | "arsa" | "arazi" | "ticari";

export interface ValuationFormData {
  service: ValuationServiceType;
  step: number;

  // 1. Konum & Parsel Bilgileri
  city: string;
  district: string;
  neighborhood: string;
  searchQuery: string;
  ada: string;
  parsel: string;
  pafta: string;
  tapuNiteligi?: string;
  pgaSeismicHazard: string;
  coordinates?: { lat: number; lng: number };

  // 2. Konut Özel Verileri
  housingTypeKind: "apartman" | "mustakil";
  housingSubtype: string;
  usageStatus: "mulk_sahibi" | "kiraci" | "bos";
  buildingCondition: "bakimli" | "standart" | "tadilat";
  roomCount: number;
  livingRoomCount: number;
  bathroomCount: number;
  grossAreaM2: number;
  netAreaM2?: number;
  terraceAreaM2: number;
  buildingAge: number;
  totalFloors: number;
  floorNumber: number;

  // 3. Arsa Özel Verileri
  arsaZoningType: string;
  arsaSharedDeed: boolean;
  arsaAreaM2: number;
  arsaHmax: string;
  arsaMaxFloors: number;
  arsaTaks: number;
  arsaKaks: number;
  arsaRoadFrontage: string;
  arsaContractorShare: number;
  serhStatus?: "tapudan_sorulacak" | "temiz" | "ipotek_var" | "haciz_serh_var";

  // 4. Arazi Özel Verileri
  araziType: string;
  araziIrrigation: string;
  araziSoilQuality: string;
  araziAreaM2: number;
  araziCadastralRoad: boolean;
  araziSlope: string;
  araziCropType: string;
  araziTreeCount: number;

  // 5. Ticari Özel Verileri
  commercialType: string;
  commercialAreaM2: number;
  commercialFrontageM: number;
  commercialHasMezzanine: boolean;
  commercialHasBasement: boolean;
  commercialUsageStatus: string;

  // 6. Nitelik & Donatılar
  facades: string[];
  views: string[];
  heatingSystem: string;
  amenities: string[];

  // 7. Kullanıcı Doğrulama & Notlar
  userEstimatedPriceTL?: number;
  marketValueEstimate?: number;
  userNote?: string;

  // 8. Fotoğraflar
  uploadedPhotos?: string[];
}

export interface LeadCaptureData {
  fullName: string;
  phone: string;
  email?: string;
  userRole: "mulk_sahibi" | "yatirimci" | "emlak_danismani" | "diger";
  ada?: string;
  parsel?: string;
  city?: string;
  district?: string;
  createdAt?: string;
}

export interface CrowdsourcePriceData {
  ada: string;
  parsel: string;
  city: string;
  district: string;
  neighborhood: string;
  reportedPrice: number;
  userNote?: string;
  date: string;
}

export const INITIAL_VALUATION_DATA: ValuationFormData = {
  service: "konut",
  step: 1,

  city: "Çanakkale",
  district: "Merkez",
  neighborhood: "Kepez",
  searchQuery: "Kepez, Merkez, Çanakkale",
  ada: "117",
  parsel: "9",
  pafta: "H17-D-04-B",
  tapuNiteligi: "Kat Mülkiyeti / Mesken",
  pgaSeismicHazard: "0.220g",
  coordinates: { lat: 40.1172, lng: 26.4022 },

  housingTypeKind: "apartman",
  housingSubtype: "daire",
  usageStatus: "mulk_sahibi",
  buildingCondition: "standart",
  roomCount: 3,
  livingRoomCount: 1,
  bathroomCount: 1,
  grossAreaM2: 125,
  terraceAreaM2: 0,
  buildingAge: 5,
  totalFloors: 5,
  floorNumber: 2,

  arsaZoningType: "konut",
  arsaSharedDeed: false,
  arsaAreaM2: 850,
  arsaHmax: "Serbest",
  arsaMaxFloors: 5,
  arsaTaks: 0.35,
  arsaKaks: 1.5,
  arsaRoadFrontage: "kose_parsel",
  arsaContractorShare: 45,
  serhStatus: "tapudan_sorulacak",

  araziType: "tarla",
  araziIrrigation: "sulu",
  araziSoilQuality: "1_sinif",
  araziAreaM2: 1170,
  araziCadastralRoad: true,
  araziSlope: "duz",
  araziCropType: "zeytin",
  araziTreeCount: 35,

  commercialType: "dukkan",
  commercialAreaM2: 150,
  commercialFrontageM: 8,
  commercialHasMezzanine: true,
  commercialHasBasement: false,
  commercialUsageStatus: "bos",

  facades: ["kuzey", "guney", "dogu", "bati"],
  views: ["sehir", "doga"],
  heatingSystem: "merkezi_payolcer",
  amenities: [
    "spor_salonu",
    "cocuk_parki",
    "asansor",
    "bina_gorevlisi",
    "guvenlik",
    "kapali_otopark",
    "acik_otopark",
    "acik_havuz",
    "kapali_havuz",
    "isi_yalitimi",
    "klima",
    "jenerator",
  ],
  uploadedPhotos: [],
};
