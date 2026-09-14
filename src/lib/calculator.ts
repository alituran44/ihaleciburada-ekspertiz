import { 
  ParcelInput, 
  CalculationResult, 
  ZoningType, 
  BuildingAge, 
  FloorLocation,
  AuctionAnalysisResult,
  LoanAnalysisResult
} from "@/types";
import { calculateBuildingAndArchitecturalCost } from "./api/moEnAzBedel";

export function calculateAuctionMetrics(
  input: ParcelInput,
  fairMarketValueTL: number
): AuctionAnalysisResult {
  const isAuction = Boolean(input.isAuction);
  const startingPriceTL = input.auctionStartingPriceTL && input.auctionStartingPriceTL > 0 
    ? input.auctionStartingPriceTL 
    : Math.round(fairMarketValueTL * 0.5); // İcra iflas kanununda %50 açılış

  const targetProfitPercent = input.auctionTargetProfitPercent !== undefined 
    ? input.auctionTargetProfitPercent 
    : 20; // Varsayılan %20 net kâr hedefi

  // İhale KDV Oranı: Arsa için genelde %10, Konut için %1 veya %10 veya %20
  const kdvRate = (input.kdvRatePercent ?? (input.category === "arsa" ? 10 : 1)) / 100;
  
  // Tahliye, çilingir, dava masrafı tamponu
  const evictionBufferTL = input.evictionRiskBufferTL !== undefined 
    ? input.evictionRiskBufferTL 
    : (input.category === "konut" ? 40000 : 20000);

  // Yasal Masraflar: Tellaliye Harcı (%1), Damga Vergisi (Binde 5.69 = %0.569)
  const auctioneerRate = 0.01;
  const stampTaxRate = 0.00569;
  const totalTaxAndFeeRate = kdvRate + auctioneerRate + stampTaxRate;

  // Güvenli Tavan Teklif (Maksimum Pey) Formülü:
  // Yatırımcının hedef kârı düşüldükten sonraki net harcama tavanı = (Adil Değer - Tahliye Masrafı) / (1 + Kâr/100)
  // Bu tavan Teklif + Teklif Masraflarını içerdiği için:
  const netBudgetAvailable = Math.max(0, (fairMarketValueTL - evictionBufferTL) / (1 + targetProfitPercent / 100));
  const maxSafeBidTL = Math.round(netBudgetAvailable / (1 + totalTaxAndFeeRate));

  // Masrafların Tavan Teklif Üzerinden Hesabı:
  const kdvAmountTL = Math.round(maxSafeBidTL * kdvRate);
  const auctioneerFeeTL = Math.round(maxSafeBidTL * auctioneerRate);
  const stampTaxTL = Math.round(maxSafeBidTL * stampTaxRate);
  const totalAcquisitionCostTL = maxSafeBidTL + kdvAmountTL + auctioneerFeeTL + stampTaxTL + evictionBufferTL;

  const projectedNetProfitTL = Math.max(0, fairMarketValueTL - totalAcquisitionCostTL);
  const projectedRoiPercent = totalAcquisitionCostTL > 0 
    ? Number(((projectedNetProfitTL / totalAcquisitionCostTL) * 100).toFixed(1)) 
    : 0;

  return {
    isAuction,
    startingPriceTL,
    maxSafeBidTL,
    kdvAmountTL,
    auctioneerFeeTL,
    stampTaxTL,
    evictionBufferTL,
    totalAcquisitionCostTL,
    projectedNetProfitTL,
    projectedRoiPercent,
    targetProfitPercent,
  };
}

export function calculateLoanMetrics(
  input: ParcelInput,
  fairMarketValueTL: number,
  monthlyRentTL?: number
): LoanAnalysisResult {
  const ltvPercent = input.creditLtvPercent ?? 60; // BDDK varsayılan %60 LTV
  const interestRateMonthly = input.creditInterestRateMonthly ?? 
    (input.tcmbOfficialData?.mortgageInterestMonthlyPercent || 2.89);
  const termMonths = input.creditTermMonths ?? 120; // 120 ay (10 yıl)

  const maxLoanAmountTL = Math.round((fairMarketValueTL * ltvPercent) / 100);
  const requiredDownPaymentTL = Math.max(0, fairMarketValueTL - maxLoanAmountTL);

  // Standart Banka Anüite Kredi Taksit Formülü:
  // Taksit = Kredi * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]
  const r = (interestRateMonthly / 100);
  const n = termMonths;
  let monthlyLoanInstallmentTL = 0;

  if (r > 0 && n > 0 && maxLoanAmountTL > 0) {
    const factor = Math.pow(1 + r, n);
    monthlyLoanInstallmentTL = Math.round((maxLoanAmountTL * r * factor) / (factor - 1));
  }

  const netMonthlyCashFlowTL = monthlyRentTL !== undefined 
    ? monthlyRentTL - monthlyLoanInstallmentTL 
    : undefined;

  return {
    maxLoanAmountTL,
    requiredDownPaymentTL,
    monthlyLoanInstallmentTL,
    netMonthlyCashFlowTL,
    interestRateMonthly,
    termMonths,
    ltvPercent,
  };
}

export function getZoningMultiplier(zoning: ZoningType): { bonusFactor: number; baseCostPerM2: number; nameTr: string } {
  switch (zoning) {
    case "konut":
      return { bonusFactor: 1.25, baseCostPerM2: 24000, nameTr: "Konut Alanı" };
    case "ticari":
      return { bonusFactor: 1.20, baseCostPerM2: 30000, nameTr: "Ticaret / Ofis Alanı" };
    case "karma":
      return { bonusFactor: 1.25, baseCostPerM2: 27000, nameTr: "Karma (Konut + Ticaret)" };
    case "villa":
      return { bonusFactor: 1.15, baseCostPerM2: 34000, nameTr: "Düşük Yoğunluklu Konut (Villa)" };
    case "sanayi":
      return { bonusFactor: 1.10, baseCostPerM2: 18000, nameTr: "Sanayi & Depolama" };
    case "tarla_gelisme":
      return { bonusFactor: 1.05, baseCostPerM2: 15000, nameTr: "Tarla / İmar Gelişme Alanı" };
    case "turizm":
      return { bonusFactor: 1.30, baseCostPerM2: 32000, nameTr: "Turizm & Konaklama Tesis" };
    default:
      return { bonusFactor: 1.20, baseCostPerM2: 24000, nameTr: "İmar Alanı" };
  }
}

export function calculateFeasibility(input: ParcelInput): CalculationResult {
  const isResidential = input.category === "konut";

  // ==========================================
  // SENARYO A: KONUT / EV / DAİRE DEĞERLEMESİ
  // ==========================================
  if (isResidential) {
    const grossM2 = input.areaM2 || 120;
    const netM2 = input.netAreaM2 || Math.round(grossM2 * 0.82);

    // 1. Bina Yaşı ve Deprem Amortismanı Çarpanı
    let ageMultiplier = 1.0;
    let ageRiskNote = "Yeni bina standartlarında.";
    const age = input.buildingAge || "1-5";

    if (age === "0") {
      ageMultiplier = 1.08;
      ageRiskNote = "Sıfır yapı, güncel deprem yönetmeliğine tam uyumlu.";
    } else if (age === "1-5") {
      ageMultiplier = 1.00;
      ageRiskNote = "1-5 yaş genç bina, yapı denetimli.";
    } else if (age === "6-10") {
      ageMultiplier = 0.93;
      ageRiskNote = "6-10 yaş orta yapı stoku.";
    } else if (age === "11-15") {
      ageMultiplier = 0.86;
      ageRiskNote = "11-15 yaş, periyodik bakım gereksinimi.";
    } else if (age === "16-20") {
      ageMultiplier = 0.78;
      ageRiskNote = "16-20 yaş yapı, tesisat yenileme ihtiyacı.";
    } else if (age === "21+") {
      ageMultiplier = 0.65;
      ageRiskNote = "2000 öncesi / 21+ yaş yapı; kentsel dönüşüm ve deprem risk analizi tavsiye edilir.";
    }

    // 2. Kat Konumu Çarpanı
    let floorMultiplier = 1.0;
    const floor = input.floorLocation || "ara_kat";
    if (floor === "ara_kat") floorMultiplier = 1.05;
    else if (floor === "bahce_giris") floorMultiplier = 0.94;
    else if (floor === "kot_bodrum") floorMultiplier = 0.78;
    else if (floor === "en_ust_kat") floorMultiplier = 0.98;
    else if (floor === "cati_dubleks") floorMultiplier = 1.04;
    else if (floor === "mustakil") floorMultiplier = 1.15;

    // 3. Donatı Ekstraları
    let amenityMultiplier = 1.0;
    if (input.hasParking) amenityMultiplier += 0.04;
    if (input.hasElevator) amenityMultiplier += 0.03;
    if (input.hasBalcony) amenityMultiplier += 0.03;
    if (input.inGatedCommunity) amenityMultiplier += 0.06;
    if (input.isFurnished) amenityMultiplier += 0.07;

    // 4. Adil Piyasa Değeri
    const baseM2Price = input.estimatedUnitSaleM2PriceTL || 40000;
    const adjustedM2Price = Math.round(baseM2Price * ageMultiplier * floorMultiplier * amenityMultiplier);
    const fairMarketValueTL = Math.round(grossM2 * adjustedM2Price);
    const quickSaleValueTL = Math.round(fairMarketValueTL * 0.85);

    // 5. Kira ve Amortisman Hesabı
    let monthlyRent = input.monthlyRentEstimateTL || 0;
    if (!monthlyRent) {
      // Tipik kira çarpanı: Satış bedelinin yıllık %5.5'i
      monthlyRent = Math.round((fairMarketValueTL * 0.055) / 12);
    }
    const annualRentalIncomeTL = monthlyRent * 12;

    const askedPrice = input.askedPriceTL || fairMarketValueTL;
    const priceVsMarketRatio = Math.round((askedPrice / (fairMarketValueTL || 1)) * 100);
    const discountRatio = Math.round((1 - (askedPrice / fairMarketValueTL)) * 100);
    const isOpportunity = askedPrice < fairMarketValueTL;

    // Amortisman (Geri Dönüş) Süresi
    const amortizationYears = Math.round((askedPrice / (annualRentalIncomeTL || 1)) * 10) / 10;
    const grossRentalYieldPercent = Math.round(((annualRentalIncomeTL / (askedPrice || 1)) * 100) * 100) / 100;

    // 6. Konut Yatırım Sağlık Skoru (0-100)
    let score = 70;
    // Fiyat İskontosu
    if (discountRatio >= 20) score += 18;
    else if (discountRatio >= 10) score += 10;
    else if (discountRatio < -15) score -= 18;

    // Amortisman Süresi (Türkiye ortalaması 17-20 yıl)
    if (amortizationYears <= 14) score += 15;
    else if (amortizationYears <= 17) score += 8;
    else if (amortizationYears > 23) score -= 12;

    // Bina Yaşı & Deprem
    if (age === "0" || age === "1-5") score += 8;
    else if (age === "21+") score -= 15;

    // Donatılar
    if (input.hasParking) score += 4;
    if (input.hasElevator) score += 3;
    if (input.deedStatus === "kat_mulkiyeti") score += 5;
    if (input.deedStatus === "hisseli" || input.deedStatus === "arsa_payli") score -= 10;

    const investmentScore = Math.max(15, Math.min(99, Math.round(score)));

    let scoreLabel: CalculationResult["scoreLabel"] = "Dengeli Piyasa";
    if (investmentScore >= 85) scoreLabel = "Çok Yüksek Fırsat";
    else if (investmentScore >= 72) scoreLabel = "Yatırıma Uygun";
    else if (investmentScore < 50) scoreLabel = "Yüksek Fiyat / Riskli";

    // 7. Konut Avantaj ve Risk Maddeleri
    const advantages: string[] = [];
    const risksAndWarnings: string[] = [];

    if (discountRatio > 8) {
      advantages.push(`İstenen satış bedeli, bölge emsallerine ve ekspertiz değerine göre yaklaşık %${discountRatio} iskontoludur.`);
    }
    if (amortizationYears <= 16) {
      advantages.push(`Amortisman süresi ${amortizationYears} yıl ile Türkiye genel ortalamasının (18-22 yıl) oldukça altında olup yüksek kira getirisi sunar.`);
    }
    if (age === "0" || age === "1-5") {
      advantages.push("Genç bina ve güncel deprem yönetmeliği standartları sebebiyle sigorta ve değerleme riski düşüktür.");
    }
    if (input.hasParking && input.hasElevator) {
      advantages.push("Kapalı/açık otopark ve asansör donatısı kiracı ve alıcı talebini belirgin şekilde artırır.");
    }
    if (floor === "ara_kat") {
      advantages.push("Ara kat konumu sayesinde ısı yalıtımı ve tercih edilebilirlik avantajına sahiptir.");
    }

    // Riskler
    if (age === "21+") {
      risksAndWarnings.push("Bina yaşı 21 yılın üzerindedir. Deprem risk raporu, kentsel dönüşüm durumu ve güçlendirme ihtiyacı kontrol edilmelidir.");
    }
    if (amortizationYears > 23) {
      risksAndWarnings.push(`Amortisman süresi (${amortizationYears} yıl) uzundur; satış bedeli kira getirisine kıyasla yüksek kalmaktadır.`);
    }
    if (input.deedStatus === "hisseli" || input.deedStatus === "arsa_payli") {
      risksAndWarnings.push("Tapu cinsi Kat Mülkiyeti değildir. Konut kredisi kullanımında banka ekspertizinde sınırlama veya ret riski bulunabilir.");
    }
    if (floor === "kot_bodrum") {
      risksAndWarnings.push("Bodrum/kot katı konumu nem, rutubet ve doğal ışık yetersizliği nedeniyle değer kaybına yol açabilir.");
    }

    // Açık API Göstergeleri
    const usdRate = input.currencyRates?.usdTry || 38.5;
    const eurRate = input.currencyRates?.eurTry || 41.8;
    const fairMarketValueUSD = Math.round(fairMarketValueTL / usdRate);
    const fairMarketValueEUR = Math.round(fairMarketValueTL / eurRate);

    // İhale ve Kredi Analitiği
    const auctionAnalysis = calculateAuctionMetrics(input, fairMarketValueTL);
    const loanAnalysis = calculateLoanMetrics(input, fairMarketValueTL, monthlyRent);

    return {
      category: "konut",
      fairMarketValueTL,
      fairMarketValueUSD,
      fairMarketValueEUR,
      auctionAnalysis,
      loanAnalysis,
      currencyRates: input.currencyRates ? { usdTry: input.currencyRates.usdTry, eurTry: input.currencyRates.eurTry } : undefined,
      earthquakeRisk: input.earthquakeRisk ? {
        riskLevel: input.earthquakeRisk.riskLevel,
        nearestEvent: input.earthquakeRisk.nearestEvent,
        magnitude: input.earthquakeRisk.magnitude,
        eventsCountWithin150km: input.earthquakeRisk.eventsCountWithin150km,
      } : undefined,
      solarClimate: input.solarClimate ? {
        solarRadiationMJ: input.solarClimate.solarRadiationMJ,
        solarSuitability: input.solarClimate.solarSuitability,
        avgTempMaxC: input.solarClimate.avgTempMaxC,
      } : undefined,
      quickSaleValueTL,
      priceVsMarketRatio,
      discountRatio,
      isOpportunity,
      investmentScore,
      scoreLabel,
      advantages,
      risksAndWarnings,

      // Konut Alanları
      monthlyRentalYieldTL: monthlyRent,
      annualRentalIncomeTL,
      amortizationYears,
      grossRentalYieldPercent,
      buildingAgeRiskLabel: ageRiskNote,

      // Arsa defaultları (sıfır)
      netAreaM2: netM2,
      relinquishedAreaM2: 0,
      footprintAreaM2: 0,
      zoningAllowedConstructionM2: 0,
      totalSellableGrossM2: grossM2,
      estimatedUnitCount: 1,
      estimatedConstructionCostPerM2TL: 0,
      totalEstimatedConstructionCostTL: 0,
      totalProjectTurnoverTL: fairMarketValueTL,
      landownerGrossM2: grossM2,
      contractorGrossM2: 0,
      landownerRevenueTL: fairMarketValueTL,
      developerCeilingValueTL: fairMarketValueTL,

      tcmbOfficialData: input.tcmbOfficialData,
      buildingCostEstimate: input.buildingCostEstimate,
    };
  }

  // ==========================================
  // SENARYO B: ARSA & İMAR FİZİBİLİTESİ
  // ==========================================
  const { bonusFactor, baseCostPerM2 } = getZoningMultiplier(input.zoningType);

  // 1. Alan Hesaplamaları
  const relinquishmentPercent = Math.max(0, Math.min(60, input.relinquishmentRatio || 0));
  const relinquishedAreaM2 = Math.round((input.areaM2 * (relinquishmentPercent / 100)) * 100) / 100;
  const netAreaM2 = Math.max(10, input.areaM2 - relinquishedAreaM2);

  const footprintAreaM2 = Math.round(netAreaM2 * (input.taks || 0.30) * 100) / 100;
  const zoningAllowedConstructionM2 = Math.round(netAreaM2 * (input.kaks || 1.0) * 100) / 100;
  const totalSellableGrossM2 = Math.round(zoningAllowedConstructionM2 * bonusFactor);
  const estimatedUnitCount = Math.max(1, Math.round(totalSellableGrossM2 / 100));

  let topographyCostMultiplier = 1.0;
  if (input.topography === "az_egimli") topographyCostMultiplier = 1.08;
  if (input.topography === "dik_egimli") topographyCostMultiplier = 1.22;

  // ÇŞB 2026/1 Yapı Sınıfı & Mimarlar Odası En Az Bedel Entegrasyonu
  const buildingCostEstimate = input.buildingCostEstimate || calculateBuildingAndArchitecturalCost(
    totalSellableGrossM2,
    input.maxFloors || 4,
    input.zoningType
  );

  const estimatedConstructionCostPerM2TL = Math.round(
    (buildingCostEstimate ? buildingCostEstimate.unitCostTL : baseCostPerM2) * topographyCostMultiplier
  );
  const totalEstimatedConstructionCostTL = Math.round(totalSellableGrossM2 * estimatedConstructionCostPerM2TL);
  
  const unitSaleM2Price = input.estimatedUnitSaleM2PriceTL || 45000;
  const totalProjectTurnoverTL = Math.round(totalSellableGrossM2 * unitSaleM2Price);

  const contractorPercent = Math.max(20, Math.min(80, input.contractorSharePercent || 50));
  const landownerPercent = 100 - contractorPercent;

  const landownerGrossM2 = Math.round((totalSellableGrossM2 * (landownerPercent / 100)) * 100) / 100;
  const contractorGrossM2 = Math.round((totalSellableGrossM2 * (contractorPercent / 100)) * 100) / 100;
  const landownerRevenueTL = Math.round(landownerGrossM2 * unitSaleM2Price);

  const marketM2Price = input.estimatedLandM2PriceTL || 15000;
  const baseLandValueTL = Math.round(input.areaM2 * marketM2Price);

  const developerResidualValueTL = Math.max(
    baseLandValueTL * 0.7,
    Math.round(totalProjectTurnoverTL - (totalEstimatedConstructionCostTL * 1.35))
  );

  const fairMarketValueTL = Math.round((baseLandValueTL * 0.65) + (developerResidualValueTL * 0.35));
  const quickSaleValueTL = Math.round(fairMarketValueTL * 0.82);
  const developerCeilingValueTL = Math.round(developerResidualValueTL * 1.05);

  const askedPrice = input.askedPriceTL || fairMarketValueTL;
  const priceVsMarketRatio = Math.round((askedPrice / (fairMarketValueTL || 1)) * 100);
  const discountRatio = Math.round((1 - (askedPrice / fairMarketValueTL)) * 100);
  const isOpportunity = askedPrice < fairMarketValueTL;

  let score = 70;
  if (discountRatio >= 30) score += 20;
  else if (discountRatio >= 15) score += 12;
  else if (discountRatio >= 5) score += 6;
  else if (discountRatio < -20) score -= 25;
  else if (discountRatio < -10) score -= 15;

  if (input.roadAccess === "var") score += 5;
  if (input.roadAccess === "yok") score -= 25;
  if (input.roadAccess === "cikmaz_sokak") score -= 5;
  if (input.isCornerParcel) score += 5;
  if (input.topography === "duz") score += 4;
  if (input.topography === "dik_egimli") score -= 12;
  if (input.kaks >= 1.5) score += 4;

  const investmentScore = Math.max(15, Math.min(99, Math.round(score)));

  let scoreLabel: CalculationResult["scoreLabel"] = "Dengeli Piyasa";
  if (investmentScore >= 85) scoreLabel = "Çok Yüksek Fırsat";
  else if (investmentScore >= 72) scoreLabel = "Yatırıma Uygun";
  else if (investmentScore < 50) scoreLabel = "Yüksek Fiyat / Riskli";

  const advantages: string[] = [];
  const risksAndWarnings: string[] = [];

  if (input.isCornerParcel) {
    advantages.push("Köşe parsel konumu sayesinde çift cepheden ışık alma ve ticari/giriş avantajı bulunmaktadır.");
  }
  if (input.roadAccess === "var" && input.roadFrontageM >= 12) {
    advantages.push(`${input.roadFrontageM} metre geniş yol cephesi, şantiye girişi ve mimari planlama açısından yüksek değer sunar.`);
  }
  if (discountRatio > 10) {
    advantages.push(`İstenen fiyat, bölgedeki adil piyasa değerine göre yaklaşık %${discountRatio} iskontolu görünmektedir.`);
  }
  if (input.kaks >= 1.2) {
    advantages.push(`KAKS (Emsal: ${input.kaks}) değeri yüksek inşaat yoğunluğuna izin vermekte, bağımsız bölüm potansiyelini maksimize etmektedir.`);
  }
  if (input.topography === "duz") {
    advantages.push("Düz arazi yapısı, ekstra hafriyat ve istinat duvarı maliyetlerini minimize eder.");
  }

  if (input.roadAccess === "yok") {
    risksAndWarnings.push("Kadastro yolu bulunmamaktadır. İmar izni veya yapı ruhsatı alabilmek için geçit hakkı kurulması veya imar yolu terki zorunludur.");
  }
  if (input.topography === "dik_egimli") {
    risksAndWarnings.push("Dik eğimli arazi yapısı; temel hafriyatı, zemin güçlendirme ve istinat perdesi inşaat maliyetlerini %20'nin üzerinde artırabilir.");
  }
  if (relinquishmentPercent >= 25) {
    risksAndWarnings.push(`Arsanın yaklaşık %${relinquishmentPercent} oranında yola veya kamuya terk gereksinimi bulunmaktadır.`);
  }
  if (discountRatio < -15) {
    risksAndWarnings.push("Talep edilen satış bedeli, bölge emsallerinin ve müteahhit fizibilite tavanının belirgin şekilde üzerindedir.");
  }

  const usdRate = input.currencyRates?.usdTry || 38.5;
  const eurRate = input.currencyRates?.eurTry || 41.8;
  const fairMarketValueUSD = Math.round(fairMarketValueTL / usdRate);
  const fairMarketValueEUR = Math.round(fairMarketValueTL / eurRate);

  // İhale ve Kredi Analitiği
  const auctionAnalysis = calculateAuctionMetrics(input, fairMarketValueTL);
  const loanAnalysis = calculateLoanMetrics(input, fairMarketValueTL);

  return {
    category: "arsa",
    fairMarketValueTL,
    fairMarketValueUSD,
    fairMarketValueEUR,
    auctionAnalysis,
    loanAnalysis,
    currencyRates: input.currencyRates ? { usdTry: input.currencyRates.usdTry, eurTry: input.currencyRates.eurTry } : undefined,
    earthquakeRisk: input.earthquakeRisk ? {
      riskLevel: input.earthquakeRisk.riskLevel,
      nearestEvent: input.earthquakeRisk.nearestEvent,
      magnitude: input.earthquakeRisk.magnitude,
      eventsCountWithin150km: input.earthquakeRisk.eventsCountWithin150km,
    } : undefined,
    solarClimate: input.solarClimate ? {
      solarRadiationMJ: input.solarClimate.solarRadiationMJ,
      solarSuitability: input.solarClimate.solarSuitability,
      avgTempMaxC: input.solarClimate.avgTempMaxC,
    } : undefined,
    netAreaM2,
    relinquishedAreaM2,
    footprintAreaM2,
    zoningAllowedConstructionM2,
    totalSellableGrossM2,
    estimatedUnitCount,
    estimatedConstructionCostPerM2TL,
    totalEstimatedConstructionCostTL,
    totalProjectTurnoverTL,
    landownerGrossM2,
    contractorGrossM2,
    landownerRevenueTL,
    quickSaleValueTL,
    developerCeilingValueTL,
    priceVsMarketRatio,
    discountRatio,
    isOpportunity,
    investmentScore,
    scoreLabel,
    advantages,
    risksAndWarnings,

    tcmbOfficialData: input.tcmbOfficialData,
    buildingCostEstimate,
  };
}
