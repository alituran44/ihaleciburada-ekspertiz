export type PropertyCategory = "arsa" | "konut";

export type ZoningType = 
  | "konut" 
  | "ticari" 
  | "karma" 
  | "villa" 
  | "sanayi" 
  | "tarla_gelisme" 
  | "turizm";

export type TopographyType = "duz" | "az_egimli" | "dik_egimli";

export type RoadAccessType = "var" | "yok" | "cikmaz_sokak";

// Konut Tipleri
export type HousingType = "daire" | "villa" | "mustakil" | "rezidans" | "dubleks";
export type RoomCount = "1+0" | "1+1" | "2+1" | "3+1" | "4+1" | "5+1" | "villa_özel";
export type BuildingAge = "0" | "1-5" | "6-10" | "11-15" | "16-20" | "21+";
export type FloorLocation = "bahce_giris" | "ara_kat" | "en_ust_kat" | "cati_dubleks" | "kot_bodrum" | "mustakil";
export type HeatingType = "dogalgaz_kombi" | "merkezi_payolcer" | "yerden_isitma" | "klima" | "soba";
export type DeedStatus = "kat_mulkiyeti" | "kat_irtifaki" | "arsa_payli" | "hisseli";

export interface ParcelInput {
  category: PropertyCategory; // "arsa" | "konut"
  title: string;
  city: string;
  district: string;
  neighborhood: string;
  ada: string;
  parsel: string;
  areaM2: number; // Arsa için Tapu Alanı, Konut için Brüt m²
  
  // Arsa Geometri & Erişim
  roadAccess: RoadAccessType;
  roadFrontageM: number; // Yol cephesi (metre)
  isCornerParcel: boolean; // Köşe başı mı?
  topography: TopographyType;
  
  // Arsa İmar Durumu
  zoningType: ZoningType;
  kaks: number; // Emsal (örn: 1.50)
  taks: number; // Taban Oturumu (örn: 0.30)
  gabariM: number; // Maksimum yükseklik (metre veya kat)
  maxFloors: number; // Kat adedi
  relinquishmentRatio: number; // Terk oranı (% - örn: %10 yola/yeşil alana terk)
  
  // KONUT & EV ÖZEL ALANLARI
  housingType?: HousingType;
  roomCount?: RoomCount;
  netAreaM2?: number; // Konut Net Süpürülebilir Alan
  buildingAge?: BuildingAge;
  floorLocation?: FloorLocation;
  totalFloorsInBuilding?: number;
  heatingType?: HeatingType;
  deedStatus?: DeedStatus;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  inGatedCommunity?: boolean;
  isFurnished?: boolean;
  isCreditEligible?: boolean;
  monthlyRentEstimateTL?: number; // Aylık tahmini veya mevcut kira bedeli
  regionalAvgRentM2TL?: number; // Bölgedeki emsal m2 kira bedeli
  
  // Finansal / Piyasa Verileri
  askedPriceTL: number; // İstenen Fiyat veya İhale Başlangıç Fiyatı
  isTender: boolean; // İhale konusu mu?
  tenderAuthority?: string; // İhaleyi Açan Kurum (Belediye, İcra, Milli Emlak vb.)
  tenderFileNo?: string; // İhale Dosya No
  
  estimatedLandM2PriceTL: number; // Bölgedeki emsal arsa m2 fiyatı
  estimatedUnitSaleM2PriceTL: number; // Bölgedeki sıfır satılabilir bağımsız bölüm m2 fiyatı
  contractorSharePercent: number; // Bölgedeki kat karşılığı oranı (örn: %50)
  
  // Rapor / Danışman Bilgisi
  consultantName: string;
  consultantPhone: string;
  consultantAgency: string;
  notes?: string;

  // Harita & Canlı API Verileri
  coordinates?: { lat: number; lng: number };
  elevationMeters?: number;
  dataSourceLabel?: string;
  marketResearch?: MarketResearchResult;
  comparables?: ComparableListing[];

  // Açık API Portalı Ek Entegrasyonları (public-apis)
  currencyRates?: {
    usdTry: number;
    eurTry: number;
    updatedAt: string;
    source: string;
  };
  earthquakeRisk?: {
    riskLevel: "Düşük" | "Orta" | "Yüksek" | "Bilinmiyor";
    nearestEvent: string;
    magnitude: number;
    eventDate: string;
    eventsCountWithin150km: number;
    source: string;
  };
  solarClimate?: {
    solarRadiationMJ: number;
    solarSuitability: "Çok Yüksek" | "Yüksek" | "Orta" | "Düşük";
    avgTempMaxC: number;
    source: string;
  };

  // Resmi Veri Kaynakları (TCMB & ÇŞB & Mimarlar Odası)
  tcmbOfficialData?: TcmbOfficialData;
  buildingCostEstimate?: BuildingCostEstimate;

  // İhale / İcra Özel Parametreleri
  isAuction?: boolean;
  auctionStartingPriceTL?: number; // Muhammen / Açılış bedeli
  auctionTargetProfitPercent?: number; // Hedeflenen net kâr marjı (örn: %25)
  kdvRatePercent?: 1 | 10 | 20; // İhale KDV oranı
  evictionRiskBufferTL?: number; // Tahliye & hukuk risk tamponu

  // Finansman & Banka Kredisi Parametreleri
  creditLtvPercent?: number; // Azami Kredi/Değer Oranı (örn: %60)
  creditInterestRateMonthly?: number; // Aylık kredi faiz oranı (örn: %2.89)
  creditTermMonths?: number; // Kredi vadesi (örn: 120 ay)
}

export interface AuctionAnalysisResult {
  isAuction: boolean;
  startingPriceTL: number;
  maxSafeBidTL: number; // Güvenli tavan teklif
  kdvAmountTL: number; // KDV tutarı
  auctioneerFeeTL: number; // Tellaliye (%1)
  stampTaxTL: number; // Damga vergisi (‰5.69)
  evictionBufferTL: number; // Tahliye/risk payı
  totalAcquisitionCostTL: number; // Toplam satın alma maliyeti
  projectedNetProfitTL: number; // Net kâr
  projectedRoiPercent: number; // Net ROI (%)
  targetProfitPercent: number;
}

export interface LoanAnalysisResult {
  maxLoanAmountTL: number; // Çekilebilecek azami kredi
  requiredDownPaymentTL: number; // Asgari peşinat / özkaynak ihtiyacı
  monthlyLoanInstallmentTL: number; // Aylık kredi taksiti
  netMonthlyCashFlowTL?: number; // Net aylık nakit akışı (Kira - Taksit)
  interestRateMonthly: number;
  termMonths: number;
  ltvPercent: number;
}

export interface ComparableListing {
  id: string;
  title: string;
  category: "arsa" | "konut";
  type: "satilik" | "kiralik";
  priceTL: number;
  areaM2: number;
  pricePerM2TL: number;
  distanceMeters: number;
  coordinates: { lat: number; lng: number };
  source: "Sahibinden" | "Hepsiemlak" | "Emlakjet" | "Bölge Emsali";
  roomCount?: string;
  zoningType?: string;
  date: string;
}

export interface TcmbOfficialData {
  kfeIndex: number;
  kfeAnnualChangePercent: number;
  officialAvgM2TL: number;
  mortgageInterestAnnualPercent: number;
  mortgageInterestMonthlyPercent: number;
  benchmarkRegion: string;
  lastUpdated: string;
  source: string;
}

export interface BuildingCostEstimate {
  csbBuildingClass: string;
  unitCostTL: number;
  totalBuildingCostTL: number;
  architecturalProjectFeeTL: number;
  engineeringAndSupervisionFeeTL: number;
  municipalPermitFeeTL: number;
  totalPermitAndProjectCostTL: number;
  grandTotalDevelopmentCostTL: number;
  source: string;
}

export interface MarketResearchResult {
  searchedAt: string;
  queryLocation: string;
  sampleCount: number;
  landM2PriceTL: number;
  landM2MinTL: number;
  landM2MaxTL: number;
  unitSaleM2PriceTL: number;
  unitSaleM2MinTL: number;
  unitSaleM2MaxTL: number;
  contractorSharePercent: number;
  monthlyRentM2TL: number;
  estimatedMonthlyRentTL: number;
  marketTrend: string;
  confidenceScore: number;
  sources: string[];
  summaryNote: string;
  comparables?: ComparableListing[];
  tcmbOfficialData?: TcmbOfficialData;
  buildingCostEstimate?: BuildingCostEstimate;
}

export interface CalculationResult {
  // Ortak Metrikler
  category: PropertyCategory;
  fairMarketValueTL: number; // Piyasa gerçek değeri
  quickSaleValueTL: number; // Hızlı satış / İskontolu değer
  priceVsMarketRatio: number; // İstenen fiyatın piyasaya oranı (%)
  discountRatio: number; // İskonto / Fırsat oranı (%)
  isOpportunity: boolean; // Piyasa altında mı?
  investmentScore: number; // 0 - 100
  scoreLabel: "Çok Yüksek Fırsat" | "Yatırıma Uygun" | "Dengeli Piyasa" | "Yüksek Fiyat / Riskli";
  advantages: string[];
  risksAndWarnings: string[];

  // ARSA ÖZEL ALANLARI
  netAreaM2: number; // Terkler düşüldükten sonraki net alan
  relinquishedAreaM2: number; // Yola ve kamuya terk edilecek m2
  footprintAreaM2: number; // TAKS ile taban oturumu
  zoningAllowedConstructionM2: number; // KAKS (Emsale dahil) alan
  totalSellableGrossM2: number; // Bodrum, çatı ve çıkmalarla toplam satılabilir alan
  estimatedUnitCount: number; // Yaklaşık 100m²'lik bağımsız bölüm adedi
  estimatedConstructionCostPerM2TL: number; // ÇŞB baremlerine göre tahmini inşaat m2 maliyeti
  totalEstimatedConstructionCostTL: number; // Toplam kaba+ince inşaat maliyeti
  totalProjectTurnoverTL: number; // Toplam tahmini proje satış hasılatı
  landownerGrossM2: number; // Arsa sahibine düşecek m2
  contractorGrossM2: number; // Müteahhide düşecek m2
  landownerRevenueTL: number; // Arsa sahibinin hasılat karşılığı
  developerCeilingValueTL: number; // Geliştirici / Müteahhit için karlı tavan teklif
  
  // KONUT & EV ÖZEL ALANLARI
  monthlyRentalYieldTL?: number; // Aylık kira getirisi
  annualRentalIncomeTL?: number; // Yıllık kira geliri
  amortizationYears?: number; // Geri dönüş / Amortisman süresi (Yıl)
  grossRentalYieldPercent?: number; // Brüt yıllık kira getirisi (%)
  buildingAgeRiskLabel?: string; // Bina yaşı ve deprem riski değerlendirmesi

  // Açık API Göstergeleri (public-apis)
  fairMarketValueUSD?: number;
  fairMarketValueEUR?: number;
  currencyRates?: {
    usdTry: number;
    eurTry: number;
  };
  earthquakeRisk?: {
    riskLevel: "Düşük" | "Orta" | "Yüksek" | "Bilinmiyor";
    nearestEvent: string;
    magnitude: number;
    eventsCountWithin150km: number;
  };
  solarClimate?: {
    solarRadiationMJ: number;
    solarSuitability: "Çok Yüksek" | "Yüksek" | "Orta" | "Düşük";
    avgTempMaxC: number;
  };

  // İhale Analitiği & Kredi Uygunluğu
  auctionAnalysis?: AuctionAnalysisResult;
  loanAnalysis?: LoanAnalysisResult;

  // Resmi Veri Kaynakları (TCMB KFE & ÇŞB Mimarlık Maliyetleri)
  tcmbOfficialData?: TcmbOfficialData;
  buildingCostEstimate?: BuildingCostEstimate;
}

export interface AppraisalReport {
  id: string;
  createdAt: string;
  parcel: ParcelInput;
  calc: CalculationResult;
}
