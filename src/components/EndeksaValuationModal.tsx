"use client";

import React, { useState } from "react";
import { ParcelInput, PropertyCategory } from "@/types";
import { ALL_PROVINCES, getDistrictsByProvince } from "@/lib/turkeyLocations";
import { ElectronicReportModal } from "./ElectronicReportModal";
import { 
  Home, 
  Trees, 
  Compass, 
  Store, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Gavel, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Award, 
  Info, 
  Minus, 
  Plus, 
  Lightbulb, 
  Pencil, 
  FileText, 
  Download, 
  Printer, 
  Users,
  ChevronLeft,
  BarChart2,
  Share2,
  Star,
  Calendar,
  Clock,
  MoreVertical,
  Phone,
  MessageSquare,
  Shield,
  Loader2,
  Search,
  X,
  Crosshair,
  Sprout,
  Droplets,
  Layers
} from "lucide-react";

type ValuationServiceType = "ev" | "arsa" | "arazi" | "ticari";

interface EndeksaValuationModalProps {
  input: ParcelInput;
  onChange: (updated: ParcelInput) => void;
  onClose: () => void;
  onNavigateToMap: () => void;
}

export const EndeksaValuationModal: React.FC<EndeksaValuationModalProps> = ({
  input,
  onChange,
  onClose,
  onNavigateToMap,
}) => {
  // Hizmet Türü: ev (Konut), arsa (İmarlı Arsa), arazi (Tarla/Bağ/Bahçe), ticari (Dükkan/Ofis)
  const [activeService, setActiveService] = useState<ValuationServiceType>(
    input.category === "konut" ? "ev" : "arsa"
  );

  // Stepper Adımı:
  // Arsa için: 1 (Ada Parsel), 2 (İmar Bilgileri), 3 (Arsa Özellikleri), 4 (Sonuç Dashboard)
  // Arazi için: 1 (Ada Parsel), 2 (Arazi Özellikleri), 3 (Mahsül Bilgileri - opsiyonel), 4 (Ek Özellikler), 5 (Sonuç Dashboard)
  // Konut için: 1 (Adres), 2 (Konut Özellikleri), 3 (Ek Özellikler), 4 (Olanaklar), 5 (Sonuç Dashboard)
  const [step, setStep] = useState<number>(1);

  // Hesaplama Animasyon Durumu (Loading Modal)
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcProgress, setCalcProgress] = useState<number>(0);
  const [calcStatusText, setCalcStatusText] = useState<string>("Geçmiş tarihli emsaller bulunuyor...");

  // Modal ve Paylaşım Durumları
  const [showHowItWorksModal, setShowHowItWorksModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);

  // ==========================================
  // ARSA ÖZEL STATE'LERİ (media_1789464154320.png & media_1789464164864.png)
  // ==========================================
  const [arsaSearchQuery, setArsaSearchQuery] = useState<string>(
    input.neighborhood ? `${input.neighborhood} ${input.district} ${input.city}` : "Şükriye Mah Gemlik Bursa"
  );
  const [arsaZoningType, setArsaZoningType] = useState<string>("konut"); // konut, konut_ticari, villa, koyici, ticari
  const [arsaSharedDeed, setArsaSharedDeed] = useState<boolean>(false); // Hayır (false) / Evet (true)
  const [arsaAreaM2, setArsaAreaM2] = useState<number>(input.areaM2 || 850);
  const [arsaHmax, setArsaHmax] = useState<string>("Serbest");
  const [arsaMaxFloors, setArsaMaxFloors] = useState<number>(5);
  const [arsaTaks, setArsaTaks] = useState<number>(0.35);
  const [arsaKaks, setArsaKaks] = useState<number>(input.kaks || 1.50);
  const [arsaRoadFrontage, setArsaRoadFrontage] = useState<string>("kose_parsel");
  const [arsaContractorShare, setArsaContractorShare] = useState<number>(input.contractorSharePercent || 45);

  // ==========================================
  // ARAZİ ÖZEL STATE'LERİ (media_1789464631631.png & media_1789464665831.png)
  // ==========================================
  const [araziSearchQuery, setAraziSearchQuery] = useState<string>("Akyurt Mah Tire İzmir");
  const [araziType, setAraziType] = useState<"tarla" | "bag_bahce" | "zeytinlik">("tarla");
  const [araziSharedDeed, setAraziSharedDeed] = useState<boolean>(false);
  const [araziAreaM2, setAraziAreaM2] = useState<number>(5000);
  const [araziSlope, setAraziSlope] = useState<"duz" | "az_egimli" | "egimli">("duz");
  const [araziAsphaltDistKm, setAraziAsphaltDistKm] = useState<number>(0.5);
  const [araziSettlementDistKm, setAraziSettlementDistKm] = useState<number>(1.2);
  const [araziWaterDistKm, setAraziWaterDistKm] = useState<number>(0.3);

  // Mahsül Bilgileri (Bağ, Bahçe seçildiğinde Adım 3)
  const [mahsulCropType, setMahsulCropType] = useState<string>("meyve_bahcesi");
  const [mahsulTreeCount, setMahsulTreeCount] = useState<number>(120);
  const [mahsulTreeAge, setMahsulTreeAge] = useState<number>(8);
  const [mahsulIrrigation, setMahsulIrrigation] = useState<string>("damla_sulama");
  const [mahsulAnnualYieldTL, setMahsulAnnualYieldTL] = useState<number>(85000);

  // Arazi Ek Özellikler & Olanaklar (media_1789464665831.png)
  const [araziAmenities, setAraziAmenities] = useState<string[]>(["yolu_acik"]);
  const [araziViews, setAraziViews] = useState<string[]>(["doga"]);

  // ==========================================
  // KONUT ÖZEL STATE'LERİ
  // ==========================================
  const [housingTypeKind, setHousingTypeKind] = useState<"apartman" | "mustakil">("apartman");
  const [roomCountVal, setRoomCountVal] = useState<number>(3);
  const [livingRoomCountVal, setLivingRoomCountVal] = useState<number>(1);
  const [bathroomCountVal, setBathroomCountVal] = useState<number>(1);
  const [grossAreaVal, setGrossAreaVal] = useState<number>(input.areaM2 || 145);
  const [buildingAgeVal, setBuildingAgeVal] = useState<number>(5);
  const [selectedFacades, setSelectedFacades] = useState<string[]>(["guney", "dogu"]);
  const [selectedViews, setSelectedViews] = useState<string[]>(["cadde_sokak", "sehir"]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "asansor",
    "otopark",
    "isi_yalitimi",
    "spor_salonu"
  ]);

  // ==========================================
  // SONUÇ DASHBOARD STATE'LERİ (media_1789463680241.jpg & media_1789464712819.png)
  // ==========================================
  const [resultValuationMode, setResultValuationMode] = useState<"satis" | "kira">("satis");
  const [activeResultTab, setActiveResultTab] = useState<
    "danismanlar" | "raporlar" | "ozellikler" | "yatirim_skoru" | "deger_degisimi" | "analiz_emsaller" | "notlar" | "ekler"
  >("danismanlar");

  const [actualPriceInput, setActualPriceInput] = useState<string>("");
  const [actualPriceDate] = useState<string>("15.09.2026");
  const [actualPriceSaved, setActualPriceSaved] = useState<boolean>(false);

  // Hizmet Değiştirme
  const handleSelectService = (service: ValuationServiceType) => {
    setActiveService(service);
    setStep(1);
    const normalizedCategory: PropertyCategory = service === "ev" ? "konut" : "arsa";
    
    onChange({
      ...input,
      category: normalizedCategory,
      title: service === "ev" 
        ? "Konut Değerleme Portföyü" 
        : service === "arazi" 
        ? "Tarla & Arazi Portföyü" 
        : service === "ticari" 
        ? "Ticari Gayrimenkul Portföyü" 
        : "İmarlı Arsa Portföyü",
      zoningType: service === "arazi" 
        ? "tarla_gelisme" 
        : service === "ticari" 
        ? "ticari" 
        : service === "ev" 
        ? "konut" 
        : input.zoningType || "konut",
    });
  };

  const toggleAraziAmenity = (item: string) => {
    setAraziAmenities((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleAraziView = (item: string) => {
    setAraziViews((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  // Hesaplama Animasyonu
  const triggerCalculation = () => {
    setIsCalculating(true);
    setCalcProgress(10);
    setCalcStatusText("Geçmiş tarihli emsaller bulunuyor...");

    const t1 = setTimeout(() => {
      setCalcProgress(45);
      setCalcStatusText(
        activeService === "arazi"
          ? "Tarım İl Müdürlüğü rekolte ve toprak verimlilik haritaları inceleniyor..."
          : activeService === "arsa" 
          ? "Belediye imar planı ve KAKS / Emsal inşaat hakları analiz ediliyor..." 
          : "TCMB EVDS Konut Fiyat Endeksi analiz ediliyor..."
      );
    }, 600);

    const t2 = setTimeout(() => {
      setCalcProgress(80);
      setCalcStatusText("İcra İflas Kanunu m.115 %50 İhale tabanı hesaplanıyor...");
    }, 1200);

    const t3 = setTimeout(() => {
      setCalcProgress(100);
      setCalcStatusText("Değerleme raporu hazırlandı!");
    }, 1800);

    const t4 = setTimeout(() => {
      setIsCalculating(false);
      // Sonuç Adımı: Arsa için 4, Arazi için 5, Konut için 5
      setStep(activeService === "arsa" ? 4 : 5);
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  // Değerleme Hesaplamaları
  const isArsa = activeService === "arsa";
  const isArazi = activeService === "arazi";
  const isEv = activeService === "ev";

  const baseArea = isArsa ? arsaAreaM2 : isArazi ? araziAreaM2 : (grossAreaVal || 145);
  // Arazi m²: 419 ₺ (media_1789464712819.png birebir), Arsa m²: 18.500 ₺, Konut m²: 60.000 ₺
  const unitPriceEstimate = isArazi ? 419 : isArsa ? 18500 : 60000;
  const totalMarketValueTL = isArazi ? 490000 : Math.round(baseArea * unitPriceEstimate);
  const tenderStartPriceTL = Math.round(totalMarketValueTL * 0.50); // İİK m.115 %50
  const estimatedRentTL = isArazi 
    ? Math.round(totalMarketValueTL / 400) 
    : isArsa 
    ? Math.round(totalMarketValueTL / 320) 
    : Math.round(totalMarketValueTL / 225);
  const paybackYears = isArazi ? 28 : isArsa ? 24 : 17;

  // İnşaat Alanı (Arsa için)
  const totalBuildableAreaM2 = Math.round(arsaAreaM2 * arsaKaks);
  const ownerShareM2 = Math.round(totalBuildableAreaM2 * (arsaContractorShare / 100));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const isLastStep = isArsa ? step === 4 : step === 5;

  const currentAddressText = isArazi 
    ? araziSearchQuery 
    : isArsa 
    ? arsaSearchQuery 
    : `${input.neighborhood || "Devlet Mah."} ${input.district || "Etimesgut"} ${input.city || "Ankara"}`;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F5F6F8] py-6 sm:py-10 px-3 sm:px-6 flex flex-col items-center">
      
      {/* ========================================================================= */}
      {/* 1. ÜST HİZMET SEÇİCİ SEKMELERİ (Ev / Arsa / Arazi / Ticari)                */}
      {/* ========================================================================= */}
      {!isLastStep && (
        <div className="max-w-md w-full flex items-center justify-between gap-1 p-1 bg-white rounded-xl mb-6 text-xs font-bold border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => handleSelectService("ev")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
              activeService === "ev"
                ? "bg-rose-50 text-[#E11D48] border border-rose-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Evimin Değeri</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectService("arsa")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
              activeService === "arsa"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Arsamın Değeri</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectService("arazi")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
              activeService === "arazi"
                ? "bg-amber-50 text-amber-800 border border-amber-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Arazimin Değeri</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectService("ticari")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
              activeService === "ticari"
                ? "bg-sky-50 text-sky-700 border border-sky-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Ticarimin Değeri</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ÜST STEPPER NAVİGASYONU                                                */}
      {/* ========================================================================= */}
      {!isLastStep && (
        <div className="w-full max-w-xl mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#E11D48] -translate-y-1/2 z-0 transition-all duration-300"
              style={{
                width: isArsa 
                  ? (step === 1 ? "0%" : step === 2 ? "50%" : "100%")
                  : (step === 1 ? "0%" : step === 2 ? "33.3%" : step === 3 ? "66.6%" : "100%")
              }}
            />

            {/* ARSA STEPPER'I (3 Adım: Ada Parsel | İmar Bilgileri | Arsa Özellikleri) */}
            {isArsa ? (
              <>
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setStep(1)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 1 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${step === 1 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    Ada Parsel
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 1 && setStep(2)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 2 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 2 ? <Check className="w-4 h-4" /> : "2"}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${step === 2 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    İmar Bilgileri
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 2 && setStep(3)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 3 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    3
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${step === 3 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    Arsa Özellikleri
                  </span>
                </div>
              </>
            ) : isArazi ? (
              /* ARAZİ STEPPER'I (media_1789464631631.png & media_1789464665831.png: 4 Adım) */
              <>
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setStep(1)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 1 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${step === 1 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    Ada Parsel
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 1 && setStep(2)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 2 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 2 ? <Check className="w-4 h-4" /> : "2"}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${step === 2 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    Arazi Özellikleri
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => araziType === "bag_bahce" && step > 2 && setStep(3)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 3 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 3 ? <Check className="w-4 h-4" /> : "3"}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${step === 3 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    Mahsül Bilgileri
                  </span>
                </div>

                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 3 && setStep(4)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 4 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    4
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${step === 4 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                    Ek Özellikler
                  </span>
                </div>
              </>
            ) : (
              /* KONUT STEPPER'I (4 Adım: Adres | Konut Özellikleri | Ek Özellikler | Olanaklar) */
              <>
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setStep(1)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 1 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 1 ? <Check className="w-4 h-4" /> : "1"}
                  </div>
                  <span className="text-[11px] font-semibold mt-1.5 text-slate-900 font-bold">Adres</span>
                </div>
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 1 && setStep(2)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 2 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 2 ? <Check className="w-4 h-4" /> : "2"}
                  </div>
                  <span className="text-[11px] font-semibold mt-1.5 text-slate-500">Konut Özellikleri</span>
                </div>
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 2 && setStep(3)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 3 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {step > 3 ? <Check className="w-4 h-4" /> : "3"}
                  </div>
                  <span className="text-[11px] font-semibold mt-1.5 text-slate-500">Ek Özellikler</span>
                </div>
                <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 3 && setStep(4)}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    step >= 4 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    4
                  </div>
                  <span className="text-[11px] font-semibold mt-1.5 text-slate-500">Olanaklar</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ARAZİ DEĞERLEME AKIŞI (media_1789464631631.png & media_1789464665831) */}
      {/* ========================================================================= */}
      {isArazi && !isLastStep && (
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SOL ANA KART */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between min-h-[560px]">
            
            {/* ADIM 1: ARAZİ ADA PARSEL SORGULAMA */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-heading">
                    Arazimin Değeri Ne Kadar?
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Arazinizin Ada Parsel bilgisini girin ve haritada seçin. Emlak değeri bilgisini hemen öğrenin.
                  </p>
                </div>

                {/* Arama Çubuğu */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1 shadow-2xs focus-within:border-[#E11D48] focus-within:ring-1 focus-within:ring-[#E11D48]">
                  <div className="flex items-center gap-1 px-3 text-xs font-bold text-slate-700 border-r border-slate-200 shrink-0 cursor-pointer">
                    <span>Adres</span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </div>

                  <input
                    type="text"
                    value={araziSearchQuery}
                    onChange={(e) => setAraziSearchQuery(e.target.value)}
                    placeholder="Akyurt Mah Tire İzmir"
                    className="flex-1 px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  {araziSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAraziSearchQuery("")}
                      className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 pl-2 pr-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => alert("GPS Konumunuz alındı: Tire / İzmir")}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      title="Konumumu Bul"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      className="p-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition cursor-pointer shadow-xs"
                      title="Haritada Ara"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* İnteraktif Uydu Haritası */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 aspect-16/10 bg-slate-900 shadow-inner group">
                  <img 
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" 
                    alt="Tarla & Arazi Uydu Görünümü" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700"
                  />

                  <div className="absolute top-3 left-3 z-10">
                    <button
                      type="button"
                      onClick={() => alert("TKGM Parsel Sorgu servisi aktif.")}
                      className="px-3.5 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Parsel Sorgu</span>
                    </button>
                  </div>

                  {/* Merkez Pin */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="relative flex flex-col items-center animate-bounce">
                      <div className="w-10 h-10 rounded-full bg-[#E11D48] border-2 border-white shadow-xl flex items-center justify-center text-white">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div className="w-2.5 h-2.5 bg-[#E11D48] rotate-45 -mt-1.5 shadow-sm" />
                    </div>
                  </div>

                  {/* Alt Bilgi Şeridi */}
                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-950/85 backdrop-blur-md p-3 text-white text-[11px] border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Bölgesel Deprem Tehlikesi (PGA): 0.347g
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">Tire / İzmir</span>
                    </div>
                    <div className="text-slate-300 leading-snug">
                      <strong>Tapu Kaydı:</strong> İzmir, Tire, Akyurt | <strong>Ada/Parsel:</strong> 142/12 | <strong>Mevkii:</strong> Kırtepe | <strong>Nitelik:</strong> Tarla / Zeytinlik | <strong>Alan:</strong> 5.420 m²
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    * Tapu ve Kadastro Genel Müdürlüğü (TKGM) ve HGK canlı uydu katmanı
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Arazi Özelliklerini Gir</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 2: ARAZİ ÖZELLİKLERİ (media_1789464631631.png Birebir) */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Üst Yükleniyor Uyarısı */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 shrink-0" />
                    <span>Bölgedeki yaygın bilgiler yükleniyor... Bu işlem biraz zaman alabilir.</span>
                  </div>
                  <div className="text-xs text-slate-500 pl-5">
                    <button
                      type="button"
                      onClick={() => handleSelectService("arsa")}
                      className="text-[#E11D48] hover:underline font-bold cursor-pointer"
                    >
                      İmar bilgisi girerek arsa değerini hesaplamak için lütfen buraya tıklayarak devam edin.
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Arazi Tipi * */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Arazi Tipi *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "tarla", label: "Tarla" },
                        { id: "bag_bahce", label: "Bağ, Bahçe" },
                        { id: "zeytinlik", label: "Zeytinlik" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAraziType(item.id as any)}
                          className={`px-4 py-2 rounded-full border text-xs font-semibold transition cursor-pointer ${
                            araziType === item.id
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#E11D48] mt-1 font-medium">
                      * Arazi tipi olarak Tarla ve Zeytinlik seçildiğinde mahsül bilgileri adımı atlanacaktır.
                    </p>
                  </div>

                  {/* Hisseli Tapu * */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Hisseli Tapu *</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAraziSharedDeed(false)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          !araziSharedDeed
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>Hayır</span>
                        {!araziSharedDeed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAraziSharedDeed(true)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          araziSharedDeed
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>Evet</span>
                        {araziSharedDeed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    </div>
                  </div>

                  {/* Alanı (m²) * */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Alanı (m²) *</label>
                    <div className="flex items-center max-w-xs border border-rose-400 rounded-xl bg-white p-1">
                      <button
                        type="button"
                        onClick={() => setAraziAreaM2((prev) => Math.max(10, prev - 250))}
                        className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={araziAreaM2}
                        onChange={(e) => setAraziAreaM2(Number(e.target.value))}
                        className="flex-1 text-center font-black text-slate-900 text-xs sm:text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setAraziAreaM2((prev) => Math.min(1000000, prev + 250))}
                        className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[#E11D48] font-semibold mt-1 block">
                      Alan değeri aralığı: 10 - 1000000
                    </span>
                  </div>

                  {/* Eğimi */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Eğimi</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "duz", label: "Düz Arazi (%0-3)" },
                        { id: "az_egimli", label: "Az Eğimli (%4-15)" },
                        { id: "egimli", label: "Eğimli (%15+)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAraziSlope(item.id as any)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                            araziSlope === item.id
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Asfalt Yola Uzaklık (km) */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Asfalt Yola Uzaklık (km)</label>
                    <div className="flex items-center max-w-xs border border-slate-300 rounded-xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setAraziAsphaltDistKm((prev) => Math.max(0, Number((prev - 0.1).toFixed(1))))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        value={araziAsphaltDistKm}
                        onChange={(e) => setAraziAsphaltDistKm(Number(e.target.value))}
                        className="flex-1 text-center font-bold text-slate-800 text-xs outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setAraziAsphaltDistKm((prev) => Number((prev + 0.1).toFixed(1)))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Yerleşim Yerine Uzaklık (km) */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Yerleşim Yerine Uzaklık (km)</label>
                    <div className="flex items-center max-w-xs border border-slate-300 rounded-xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setAraziSettlementDistKm((prev) => Math.max(0, Number((prev - 0.2).toFixed(1))))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        value={araziSettlementDistKm}
                        onChange={(e) => setAraziSettlementDistKm(Number(e.target.value))}
                        className="flex-1 text-center font-bold text-slate-800 text-xs outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setAraziSettlementDistKm((prev) => Number((prev + 0.2).toFixed(1)))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Su Kaynağına Uzaklık (km) */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Su Kaynağına Uzaklık (km)</label>
                    <div className="flex items-center max-w-xs border border-slate-300 rounded-xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setAraziWaterDistKm((prev) => Math.max(0, Number((prev - 0.1).toFixed(1))))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        value={araziWaterDistKm}
                        onChange={(e) => setAraziWaterDistKm(Number(e.target.value))}
                        className="flex-1 text-center font-bold text-slate-800 text-xs outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setAraziWaterDistKm((prev) => Number((prev + 0.1).toFixed(1)))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 italic pt-1">
                    (* İşareti otomatik değerleme için zorunlu alanı belirtmektedir.)
                  </div>
                </div>

                {/* BUTONLAR */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Önceki Adım
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (araziType === "bag_bahce") {
                        setStep(3); // Mahsül Bilgileri
                      } else {
                        setStep(4); // Ek Özellikler (Tarla ve Zeytinlik adımı atlar)
                      }
                    }}
                    className="px-6 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Sonraki Adım</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 3: MAHSÜL BİLGİLERİ (Bağ, Bahçe seçildiğinde) */}
            {step === 3 && araziType === "bag_bahce" && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    Mahsül Bilgilerini Giriniz
                  </h2>
                  <p className="text-xs text-slate-500">
                    Arazinizdeki dikili ürün, ağaç ve sulama altyapısı bilgilerini giriniz.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Mahsül Tipi</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "meyve_bahcesi", label: "Meyve Bahçesi" },
                        { id: "sebze_sera", label: "Sebze / Sera" },
                        { id: "findiklik", label: "Fındıklık" },
                        { id: "ceviz_badem", label: "Ceviz / Badem" },
                        { id: "bag", label: "Bağ (Üzüm)" },
                        { id: "diger", label: "Karışık Mahsül" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMahsulCropType(item.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                            mahsulCropType === item.id
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Ağaç Sayısı</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setMahsulTreeCount((p) => Math.max(0, p - 10))}
                          className="p-1.5 text-slate-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={mahsulTreeCount}
                          onChange={(e) => setMahsulTreeCount(Number(e.target.value))}
                          className="flex-1 text-center font-bold text-slate-800 text-xs outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setMahsulTreeCount((p) => p + 10)}
                          className="p-1.5 text-slate-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Ortalama Ağaç Yaşı</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setMahsulTreeAge((p) => Math.max(1, p - 1))}
                          className="p-1.5 text-slate-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={mahsulTreeAge}
                          onChange={(e) => setMahsulTreeAge(Number(e.target.value))}
                          className="flex-1 text-center font-bold text-slate-800 text-xs outline-none bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setMahsulTreeAge((p) => p + 1)}
                          className="p-1.5 text-slate-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Sulama Altyapısı</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "damla_sulama", label: "Damla Sulama" },
                        { id: "artezyen", label: "Artezyen / Sondaj" },
                        { id: "kanal", label: "Kanal / Akarsu" },
                        { id: "kuru_tarim", label: "Kuru Tarım (Sulamasız)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMahsulIrrigation(item.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer ${
                            mahsulIrrigation === item.id
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Önceki Adım
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-6 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Ek Özellikler</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 4: EK ÖZELLİKLER (media_1789464665831.png Birebir) */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    Ek özelliklerini giriniz
                  </h2>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Olanaklar */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Olanaklar <span className="text-[11px] font-normal text-slate-500">(Birden fazla seçenek işaretleyebilirsiniz)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { id: "elektrik", label: "Elektrik" },
                        { id: "su", label: "Su" },
                        { id: "yolu_acik", label: "Yolu Açık" },
                        { id: "dogalgaz", label: "Doğalgaz" },
                        { id: "telefon", label: "Telefon" },
                        { id: "kanalizasyon", label: "Kanalizasyon" },
                        { id: "zemin_etudu", label: "Zemin Etüdü" },
                        { id: "yola_yakin", label: "Yola Yakın" },
                        { id: "denize_sifir", label: "Denize Sıfır" },
                        { id: "denize_yakin", label: "Denize Yakın" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAraziAmenity(item.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            araziAmenities.includes(item.id)
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{item.label}</span>
                          {araziAmenities.includes(item.id) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manzara */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Manzara <span className="text-[11px] font-normal text-slate-500">(Birden fazla seçenek işaretleyebilirsiniz)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { id: "sehir", label: "Şehir" },
                        { id: "doga", label: "Doğa" },
                        { id: "gol", label: "Göl" },
                        { id: "deniz", label: "Deniz" },
                        { id: "bogaz", label: "Boğaz" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAraziView(item.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            araziViews.includes(item.id)
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{item.label}</span>
                          {araziViews.includes(item.id) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 italic pt-2">
                    (* İşareti otomatik değerleme için zorunlu alanı belirtmektedir.)
                  </div>
                </div>

                {/* BUTONLAR */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (araziType === "bag_bahce") setStep(3);
                      else setStep(2);
                    }}
                    className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Önceki Adım
                  </button>

                  <button
                    type="button"
                    onClick={triggerCalculation}
                    className="px-8 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Hesapla</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* SAĞ SÜTUN REHBER KARTLARI (media_1789464631631 & media_1789464665831) */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 space-y-4 min-h-[500px]">
            
            {/* Pembe Ampul */}
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>

            {/* ADIM 1 SAĞ METNİ */}
            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Arazimin değerini nasıl belirlerim?
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Tarımsal arazilerde değer; toprak verimliliği, sulama imkânları, kadastral yol erişimi ve çevredeki yerleşim alanlarına yakınlıkla şekillenir.
                  </p>
                  <p>
                    İhaleci Burada ile arazinizin gerçek piyasa değerini ve icra taban fiyatını büyük veri algoritmalarıyla saniyeler içinde hesaplayın.
                  </p>
                  <p className="font-bold text-slate-800">
                    Konum bilgisi ve kadastral yol durumu, arazi değerini doğrudan etkiler.
                  </p>
                </div>
              </div>
            )}

            {/* ADIM 2 SAĞ METNİ: "Arazi Tipi" (media_1789464631631 Birebir) */}
            {step === 2 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Arazi Tipi
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Arazinin üzerinde ekili mahsüle göre değişmektedir.
                  </p>
                  <p className="font-semibold text-slate-700">
                    Boş olması durumunda Tarla seçeneği seçilmelidir.
                  </p>
                  <p>
                    Dikili zeytinlikler ve meyve bahçeleri rekolte geliri ürettiği için tarla vasfına göre birim bazda daha yüksek değerlenir.
                  </p>
                </div>
              </div>
            )}

            {/* ADIM 3 SAĞ METNİ */}
            {step === 3 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Mahsül Bilgisi
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Arazide dikili ağaç ve mahsül türü, rekolte ve sulama altyapısı arazi birim değerine doğrudan çarpan olarak eklenir.
                  </p>
                  <p className="font-semibold text-slate-700">
                    Damla sulama altyapısı olan bahçeler, kuru tarıma kıyasla %35-%50 daha yüksek birim fiyata sahiptir.
                  </p>
                </div>
              </div>
            )}

            {/* ADIM 4 SAĞ METNİ: "Olanaklar" (media_1789464665831 Birebir) */}
            {step === 4 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Olanaklar
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Arazinin sahip olduğu olanakları işaretleyebilirsiniz.
                  </p>
                  <p className="font-semibold text-slate-700">
                    Kadastral yolu açık, elektrik ve su hattına yakın tarlalar; hobi bahçesi ve çiftlik projelerine uygunluğu nedeniyle yüksek talep görür.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Tarımsal Endeks & HGK
              </span>
              <span className="font-mono text-slate-400">v2.5 Endeksa Uyumlu</span>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ARSA DEĞERLEME AKIŞI (media_1789464154320.png & media_1789464164864)   */}
      {/* ========================================================================= */}
      {isArsa && !isLastStep && (
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SOL ANA KART */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between min-h-[560px]">
            
            {/* ARSA ADIM 1: "Arsamın Değeri Ne Kadar?" (media_1789464154320)  */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-heading">
                    Arsamın Değeri Ne Kadar?
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Arsanızın Ada Parsel bilgisini girin ve haritada seçin. Emlak değeri bilgisini hemen öğrenin.
                  </p>
                </div>

                {/* ARAMA ÇUBUĞU */}
                <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1 shadow-2xs focus-within:border-[#E11D48] focus-within:ring-1 focus-within:ring-[#E11D48]">
                  <div className="flex items-center gap-1 px-3 text-xs font-bold text-slate-700 border-r border-slate-200 shrink-0 cursor-pointer">
                    <span>Adres</span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </div>

                  <input
                    type="text"
                    value={arsaSearchQuery}
                    onChange={(e) => setArsaSearchQuery(e.target.value)}
                    placeholder="Şükriye Mah Gemlik Bursa"
                    className="flex-1 px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  {arsaSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setArsaSearchQuery("")}
                      className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 pl-2 pr-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => alert("GPS Konumunuz alındı: Gemlik / Bursa")}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      title="Konumumu Bul"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      className="p-2 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white transition cursor-pointer shadow-xs"
                      title="Haritada Ara"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* UYDU HARİTASI */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 aspect-16/10 bg-slate-900 shadow-inner group">
                  <img 
                    src="https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80" 
                    alt="Arsa Uydu Görünümü" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700"
                  />

                  <div className="absolute top-3 left-3 z-10">
                    <button
                      type="button"
                      onClick={() => alert("TKGM Parsel Sorgu servisi aktif.")}
                      className="px-3.5 py-1.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Parsel Sorgu</span>
                    </button>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="relative flex flex-col items-center animate-bounce">
                      <div className="w-10 h-10 rounded-full bg-[#E11D48] border-2 border-white shadow-xl flex items-center justify-center text-white">
                        <Home className="w-5 h-5" />
                      </div>
                      <div className="w-2.5 h-2.5 bg-[#E11D48] rotate-45 -mt-1.5 shadow-sm" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-950/85 backdrop-blur-md p-3 text-white text-[11px] border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Bölgesel Deprem Tehlikesi (PGA): 0.405g
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">Gemlik / Bursa</span>
                    </div>
                    <div className="text-slate-300 leading-snug">
                      <strong>Tapu Kaydı:</strong> Bursa, Gemlik, Şükriye | <strong>Ada/Parsel:</strong> 114/188 | <strong>Mevkii:</strong> Değirmendere | <strong>Pafta:</strong> H22-B-16-A-3 | <strong>Alan:</strong> 2.560.918 m²
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    * Tapu ve Kadastro Genel Müdürlüğü (TKGM) ve HGK canlı uydu katmanı
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>İmar Bilgilerini Gir</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ARSA ADIM 2: "Arsa imar bilgilerini giriniz" (media_1789464164864) */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight font-heading">
                    Arsa imar bilgilerini giriniz
                  </h1>
                  <p className="text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleSelectService("arazi")}
                      className="text-[#E11D48] hover:underline font-semibold cursor-pointer"
                    >
                      Bağ, bahçe tipinde imar bilgisi olmayan arazilerin değerini hesaplamak için lütfen buraya tıklayarak devam edin.
                    </button>
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">İmar Tipi</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "konut", label: "Konut" },
                        { id: "konut_ticari", label: "Konut + Ticari" },
                        { id: "villa", label: "Villa Parseli" },
                        { id: "koyici", label: "Köyiçi" },
                        { id: "ticari", label: "Ticari İmarlı" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setArsaZoningType(item.id)}
                          className={`px-4 py-2 rounded-full border text-xs font-semibold transition cursor-pointer ${
                            arsaZoningType === item.id
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Hisseli Tapu</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setArsaSharedDeed(false)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          !arsaSharedDeed
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>Hayır</span>
                        {!arsaSharedDeed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setArsaSharedDeed(true)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          arsaSharedDeed
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>Evet</span>
                        {arsaSharedDeed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Alanı (m²)</label>
                    <div className="flex items-center max-w-xs border border-slate-300 rounded-xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setArsaAreaM2((prev) => Math.max(10, prev - 50))}
                        className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={arsaAreaM2}
                        onChange={(e) => setArsaAreaM2(Number(e.target.value))}
                        className="flex-1 text-center font-black text-slate-900 text-xs sm:text-sm outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setArsaAreaM2((prev) => Math.min(100000, prev + 50))}
                        className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Aralık: 10 - 100000</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Hmax (m)</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setArsaHmax("Serbest")}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-bold text-slate-800 text-xs">{arsaHmax}</span>
                        <button
                          type="button"
                          onClick={() => setArsaHmax("15.50 m")}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Maksimum Kat İzni</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setArsaMaxFloors((prev) => Math.max(1, prev - 1))}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-bold text-slate-800 text-xs">{arsaMaxFloors}</span>
                        <button
                          type="button"
                          onClick={() => setArsaMaxFloors((prev) => prev + 1)}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">TAKS</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setArsaTaks((prev) => Math.max(0.1, Number((prev - 0.05).toFixed(2))))}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-bold text-slate-800 text-xs">{arsaTaks}</span>
                        <button
                          type="button"
                          onClick={() => setArsaTaks((prev) => Math.min(0.8, Number((prev + 0.05).toFixed(2))))}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">KAKS (Emsal)</label>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                        <button
                          type="button"
                          onClick={() => setArsaKaks((prev) => Math.max(0.2, Number((prev - 0.1).toFixed(2))))}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex-1 text-center font-bold text-slate-800 text-xs">{arsaKaks}</span>
                        <button
                          type="button"
                          onClick={() => setArsaKaks((prev) => Math.min(4.0, Number((prev + 0.1).toFixed(2))))}
                          className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Önceki Adım
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Sonraki Adım</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ARSA ADIM 3: "Arsa Özellikleri" */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 font-heading">
                    Arsa Özellikleri ve Kat Karşılığı
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cephe konumu ve bölgedeki müteahhit paylaşım oranını belirleyiniz.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Cephe Durumu</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "kose_parsel", label: "Köşe Parsel (Çift Cephe)" },
                        { id: "ara_parsel", label: "Ara Parsel (Tek Cephe)" },
                        { id: "uc_cephe", label: "Üç Cepheli Ada Sonu" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setArsaRoadFrontage(item.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            arsaRoadFrontage === item.id
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{item.label}</span>
                          {arsaRoadFrontage === item.id && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">Kat Karşılığı Beklentisi</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { val: 40, label: "%40 Arsa Sahibi / %60 Müteahhit" },
                        { val: 45, label: "%45 Arsa Sahibi / %55 Müteahhit" },
                        { val: 50, label: "%50 / %50 Eşit Paylaşım" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setArsaContractorShare(item.val)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            arsaContractorShare === item.val
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{item.label}</span>
                          {arsaContractorShare === item.val && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                    <div className="text-xs font-extrabold text-emerald-900">
                      Tahmini İnşaat İzni: {totalBuildableAreaM2.toLocaleString("tr-TR")} m²
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Arsa sahibine düşen bağımsız bölüm payı: <strong>{ownerShareM2.toLocaleString("tr-TR")} m²</strong> (~{Math.round(ownerShareM2 / 120)} adet 3+1 daire)
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Önceki Adım
                  </button>

                  <button
                    type="button"
                    onClick={triggerCalculation}
                    className="px-8 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Değerini Hesapla</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* SAĞ SÜTUN REHBER KARTLARI */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 space-y-4 min-h-[500px]">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Arsamın değerini nasıl belirlerim?
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    İhaleci Burada ile gayrimenkulünüzün gerçek değerini ve kirasını hemen hesaplayıp, emlak fiyatı bilgisini doğru veriler ışığında kısa sürede öğrenebilirsiniz.
                  </p>
                  <p className="font-semibold text-slate-700">
                    Konum seçimini doğru yapmalı, arsa imar özelliklerini eksiksiz girmelisiniz.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Arsa Alanı
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Arsa alanının kesin bir sayı olarak girilmesi önemlidir. Her zaman alınacak olan bir arsa dikdörtgen ya da kare şeklinde olmayabilir.
                  </p>
                  <p className="font-semibold text-slate-700">
                    Üçgenin alanı ise iki dik kenarın çarpımının ikiye bölünmesi ile bulunur.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  İmar ve Kat Karşılığı Değeri
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    İmarlı arsalarda değer; inşaat emsal hakkı (KAKS) ve bölgedeki müteahhit paylaşım oranına göre belirlenir.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                TCMB EVDS & HGK
              </span>
              <span className="font-mono text-slate-400">v2.5 Endeksa Uyumlu</span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. KONUT DEĞERLEME AKIŞI                                                  */}
      {/* ========================================================================= */}
      {!isArsa && !isArazi && !isLastStep && (
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between min-h-[560px]">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                    Emlak Değerini Hemen Öğrenin
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Gayrimenkul tipini seçin, yapay zekanın gücü ile değerini öğrenin.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">İl *</label>
                      <select
                        value={input.city}
                        onChange={(e) => onChange({ ...input, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      >
                        {ALL_PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">İlçe *</label>
                      <input
                        type="text"
                        value={input.district}
                        onChange={(e) => onChange({ ...input, district: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-[#E11D48] text-white font-bold text-xs"
                  >
                    Konut Özellikleri
                  </button>
                </div>
              </div>
            )}

            {step >= 2 && (
              <div className="space-y-4">
                <h3 className="font-black text-slate-900">Konut Detayları</h3>
                <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div>3+1 • 145 m² • Doğalgaz Kombi</div>
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(step - 1)} className="px-4 py-2 border rounded-xl text-xs font-bold">Geri</button>
                  <button onClick={triggerCalculation} className="px-6 py-2 bg-[#E11D48] text-white rounded-xl text-xs font-black">Hesapla</button>
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm">Konut Değerleme</h4>
            <p className="text-xs text-slate-500 mt-2">Endeksa ve TCMB verileri ile anında kıymet takdiri.</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SONUÇ DASHBOARD (media_1789463680241.jpg & media_1789464712819.png)   */}
      {/* ========================================================================= */}
      {isLastStep && (
        <div className="max-w-5xl w-full space-y-6">
          
          {/* ÜST BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:px-6 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Değerlemeler</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateToMap}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Bölge Analizi</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Paylaş</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition cursor-pointer flex items-center gap-1"
              >
                <span>+ Yeni</span>
              </button>
            </div>
          </div>

          {/* ANA İKİ SÜTUN: SOL HARİTA / DANIŞMAN, SAĞ FİYAT KARTI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* SOL SÜTUN */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* UYDU HARİTASI KARTI (media_1789464712819.png Birebir) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{currentAddressText}</span>
                  </div>
                  <button type="button" onClick={() => setStep(1)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative aspect-16/10 bg-slate-900">
                  <img 
                    src={isArazi 
                      ? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                      : "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="Uydu Görünümü" 
                    className="w-full h-full object-cover"
                  />

                  {/* Rozet: [ARAZİ] (Turuncu) / [ARSA] (Zümrüt) / [KONUT] (Kırmızı) */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-2.5 py-1 text-white text-[11px] font-black rounded uppercase tracking-wider shadow-sm ${
                      isArazi ? "bg-amber-600" : isArsa ? "bg-emerald-700" : "bg-[#E11D48]"
                    }`}>
                      {isArazi ? "ARAZİ" : isArsa ? "ARSA" : "KONUT"}
                    </span>
                  </div>

                  {/* Pembe Pin */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-8 h-8 rounded-full bg-[#E11D48] border-2 border-white shadow-xl flex items-center justify-center text-white">
                      <Home className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{currentAddressText}</span>
                </div>
              </div>

              {/* DANIŞMAN KARTI */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 font-heading leading-tight">
                      Satmayı mı düşünüyorsunuz?
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      En iyi danışman size yardımcı olabilir
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" 
                        alt="Gülçin Nazlı" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Gülçin Nazlı</div>
                      <div className="text-[11px] text-slate-500 font-medium">SPK Lisanslı Değerleme & Satış Uzmanı</div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>5.0 (48 Başarılı İşlem)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-200">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Ortalama Satış Süresi</div>
                      <div className="text-xs font-black text-[#E11D48] mt-0.5">60-90 gün</div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Başarı Oranı</div>
                      <div className="text-xs font-black text-emerald-700 mt-0.5">%96 İşlem Kapama</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => alert("Güvenle Sat talebiniz alındı. Danışmanımız sizinle iletişime geçecektir.")}
                      className="py-2 px-1 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Star className="w-3 h-3" />
                      <span>Güvenle Sat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReportModal(true)}
                      className="py-2 px-1 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white font-extrabold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Rapor Al</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveResultTab("danismanlar")}
                      className="py-2 px-1 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition cursor-pointer flex items-center justify-center"
                    >
                      <span>Profili Gör</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* SAĞ SÜTUN (DEĞERLEME SONUÇ KARTI) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2.5">
                <button
                  type="button"
                  onClick={() => setShowHowItWorksModal(true)}
                  className="hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Nasıl hesaplıyoruz?</span>
                </button>

                <span className="text-slate-400 font-mono text-xs">İşlemler ︙</span>
              </div>

              {/* Satış / Kira Toggle */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setResultValuationMode("satis")}
                  className={`px-6 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                    resultValuationMode === "satis" ? "bg-[#E11D48] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Satış Değeri
                </button>
                <button
                  type="button"
                  onClick={() => setResultValuationMode("kira")}
                  className={`px-6 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                    resultValuationMode === "kira" ? "bg-[#E11D48] text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Kira Değeri
                </button>
              </div>

              {/* Büyük Fiyat Göstergesi (media_1789464712819.png Birebir: 490.000 ₺) */}
              <div className="text-center py-2 space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
                  {resultValuationMode === "satis" 
                    ? `${totalMarketValueTL.toLocaleString("tr-TR")} ₺` 
                    : `${estimatedRentTL.toLocaleString("tr-TR")} ₺`
                  }
                </div>

                <div className="text-xs font-bold text-slate-500 pt-0.5">
                  3 Aydan Kısa Süre Beklenirse
                </div>

                <div className="text-sm font-extrabold text-slate-700">
                  {unitPriceEstimate.toLocaleString("tr-TR")} ₺/m²
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>15 Eyl 2026 12:31</span>
                </div>
              </div>

              {/* İki / Üç Sütunlu Tahmin Kutusu (media_1789464712819.png Birebir: 540.000 ₺ & 620.000 ₺) */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    3 - 6 AY ARASI BEKLENİRSE
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-1">
                    {isArazi ? "540.000 ₺" : `${Math.round(totalMarketValueTL * 1.09).toLocaleString("tr-TR")} ₺`}
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    6 - 12 AY ARASI BEKLENİRSE
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 mt-1">
                    {isArazi ? "620.000 ₺" : `${Math.round(totalMarketValueTL * 1.15).toLocaleString("tr-TR")} ₺`}
                  </div>
                </div>
              </div>

              {/* Hesap Puanı & Deprem Riski (media_1789464712819.png: 64/100 & 0.347g) */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold pt-1">
                <span className="px-3 py-1 bg-[#E11D48] text-white rounded-full text-[11px] font-black shadow-2xs">
                  Hesap Puanı: {isArazi ? "64/100" : "75/100"}
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <span>Bölgesel Deprem Tehlikesi (PGA):</span>
                  <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block shrink-0" />
                  <span className="font-mono font-bold text-slate-900">{isArazi ? "0.347g" : "0.405g"}</span>
                </div>
              </div>

              {/* İİK m.115 %50 İhale Tabanı */}
              <div className="flex items-center justify-center">
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-emerald-600" />
                  <span>İİK m.115 İhale Başlangıç Tabanı (%50): ₺ {tenderStartPriceTL.toLocaleString("tr-TR")}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed italic">
                * Bu değerler yasal durum bilgisi olmadan, bilgisayar algoritmaları kullanılarak hesaplanmıştır ve herhangi bir yasal yükümlülük taşımamaktadır.
              </p>

              {/* Gerçekleşen Değeri Mavi Kutusu (media_1789464712819.png Birebir) */}
              <div className="bg-[#38BDF8] text-white p-4 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black">Gerçekleşen Değeri</div>
                    <div className="text-[10px] text-white/90 leading-tight mt-0.5">
                      Tespit ettiğiniz değeri ve tarihini bizimle paylaşarak Endeksa&apos;nın sizin için daha doğru sonuçlar üretmesini sağlayabilirsiniz.
                    </div>
                  </div>
                  <div className="space-y-1.5 shrink-0 w-36">
                    <input
                      type="text"
                      value={actualPriceInput}
                      onChange={(e) => setActualPriceInput(e.target.value)}
                      placeholder="₺ ............."
                      className="w-full px-2.5 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold outline-none text-right"
                    />
                    <div className="w-full px-2.5 py-1 bg-white/90 text-slate-700 rounded-lg text-[11px] font-semibold text-right">
                      {actualPriceDate}
                    </div>
                  </div>
                </div>

                {actualPriceInput && (
                  <button
                    type="button"
                    onClick={() => setActualPriceSaved(true)}
                    className="w-full py-1.5 bg-white text-sky-700 hover:bg-sky-50 font-black text-[11px] rounded-lg transition cursor-pointer"
                  >
                    {actualPriceSaved ? "✓ Gerçekleşen Değer Doğrulandı ve Kaydedildi" : "Bu Değeri Doğrula ve Kaydet"}
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* 7. 8'Lİ ALT SEKME MENÜSÜ (media_1789464712819.png & media_1789464724295) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mt-6">
            <div className="flex items-center overflow-x-auto border-b border-slate-200 scrollbar-none px-2 text-xs font-extrabold">
              {[
                { id: "danismanlar", label: "DANIŞMANLAR" },
                { id: "raporlar", label: "RAPORLAR" },
                { id: "ozellikler", label: "ÖZELLİKLER" },
                { id: "yatirim_skoru", label: "YATIRIM SKORU" },
                { id: "deger_degisimi", label: "DEĞER DEĞİŞİMİ" },
                { id: "analiz_emsaller", label: "ANALİZ VE EMSALLER" },
                { id: "notlar", label: "NOTLAR" },
                { id: "ekler", label: "EKLER" },
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setActiveResultTab(tabItem.id as any)}
                  className={`px-4 py-3 whitespace-nowrap transition cursor-pointer border-b-2 font-heading ${
                    activeResultTab === tabItem.id
                      ? "border-[#E11D48] text-white bg-[#E11D48] font-black rounded-t-lg"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* SEKME 1: DANIŞMANLAR */}
              {activeResultTab === "danismanlar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 font-heading">Bölgenizdeki Danışmanlar</h3>
                    <button
                      type="button"
                      onClick={() => alert("Güvenle Sat talebiniz iletildi.")}
                      className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Güvenle Sat</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" 
                          alt="Gülçin Nazlı" 
                          className="w-12 h-12 rounded-full object-cover border border-slate-300 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Gülçin Nazlı</div>
                          <div className="text-[11px] text-slate-500">Remax Troia - Bölge Temsilcisi</div>
                          <div className="text-[10px] text-amber-600 font-bold">5.0 ⭐ (48 İşlem)</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div className="flex justify-between"><span>Ort. Satış:</span><strong>60-90 gün</strong></div>
                        <div className="flex justify-between"><span>Portföy:</span><strong>14 İlan</strong></div>
                      </div>
                      <button className="w-full py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition">İletişim</button>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">AT</div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Ali Turan</div>
                          <div className="text-[11px] text-slate-500">İhaleci Burada - SPK Lisanslı</div>
                          <div className="text-[10px] text-amber-600 font-bold">5.0 ⭐ (92 Değerleme)</div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div className="flex justify-between"><span>İhale Başarı:</span><strong className="text-emerald-700">%94</strong></div>
                        <div className="flex justify-between"><span>Uzmanlık:</span><strong>İcra & İhale</strong></div>
                      </div>
                      <button className="w-full py-1.5 rounded-lg bg-[#E11D48] text-white text-xs font-bold hover:bg-[#BE123C] transition">İletişim</button>
                    </div>
                  </div>
                </div>
              )}

              {/* SEKME 2: RAPORLAR (media_1789464724295.png Birebir!) */}
              {activeResultTab === "raporlar" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-base font-black text-slate-900 font-heading">
                      <FileText className="w-5 h-5 text-[#E11D48]" />
                      <span>Raporlar</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Rapor alarak gayrimenkulünüzün değerini, emsal bilgilerini, bölgedeki gayrimenkul trendlerini ve demografik yapıyı öğrenin.
                    </p>
                  </div>

                  {/* Pembe Banner Kutu (1.199 ₺ + Örnek Rapor + Rapor Satın Al) */}
                  <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 text-center space-y-4">
                    <div className="space-y-1">
                      <div className="text-3xl font-black text-[#E11D48] font-heading">
                        1.199 ₺
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        &apos;den başlayan fiyatlarla rapor alabilirsiniz.
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                      {/* Örnek Rapor Butonu -> 13 Sayfalık Rapor Modalı Açar */}
                      <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>Örnek Rapor (13 Sayfa)</span>
                      </button>

                      {/* Rapor Satın Al Butonu */}
                      <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Rapor Satın Al & İncele</span>
                      </button>
                    </div>
                  </div>

                  {/* Henüz rapor üretilmedi Boş Durum Çerçevesi (media_1789464724295.png) */}
                  <div className="p-10 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full border border-slate-300 bg-white text-slate-400 flex items-center justify-center">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      Henüz rapor üretilmedi.
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-sm">
                      Yukarıdaki &quot;Örnek Rapor&quot; butonuna tıklayarak SPK ve TCMB uyumlu 13 sayfalık resmi değerleme raporunu inceleyebilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              {/* SEKME 3: ÖZELLİKLER */}
              {activeResultTab === "ozellikler" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Alan</span>
                    <strong className="text-slate-900">{baseArea.toLocaleString("tr-TR")} m²</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">Kategori</span>
                    <strong className="text-slate-900 uppercase">{activeService}</strong>
                  </div>
                  {isArazi && (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">Vasıf</span>
                        <strong className="text-slate-900 uppercase">{araziType}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">Eğim</span>
                        <strong className="text-slate-900">{araziSlope}</strong>
                      </div>
                    </>
                  )}
                  {isArsa && (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">Emsal (KAKS)</span>
                        <strong className="text-slate-900">{arsaKaks}</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 text-[10px] block">İnşaat İzni</span>
                        <strong className="text-slate-900">{totalBuildableAreaM2.toLocaleString("tr-TR")} m²</strong>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SEKME 4: YATIRIM SKORU */}
              {activeResultTab === "yatirim_skoru" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-800 font-bold">İhale Fırsat Marjı</div>
                    <div className="text-xl font-black text-emerald-700 mt-1">%50 İndirim</div>
                    <p className="text-[10px] text-emerald-600 mt-0.5">İİK m.115 tabanından alım potansiyeli.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Amortisman Süresi</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{paybackYears} Yıl</div>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="text-[10px] text-[#E11D48] font-bold">Değerleme Puanı</div>
                    <div className="text-xl font-black text-[#E11D48] mt-1">{isArazi ? "64 / 100" : "75 / 100"}</div>
                  </div>
                </div>
              )}

              {/* SEKME 5: DEĞER DEĞİŞİMİ */}
              {activeResultTab === "deger_degisimi" && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900">Yıllık Fiyat Trendi ve Gelecek Tahmini</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400">1 Yıllık Değişim</span>
                      <div className="text-sm font-black text-emerald-600 mt-1">▲ %25,58</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400">2 Yıllık Değişim</span>
                      <div className="text-sm font-black text-emerald-600 mt-1">▲ %68,97</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400">1 Yıl Sonra Öngörü</span>
                      <div className="text-sm font-black text-emerald-700 mt-1">▲ %11,63</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEKME 6: ANALİZ VE EMSALLER */}
              {activeResultTab === "analiz_emsaller" && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900">Bölgedeki Gerçekleşen Emsaller (Son 90 Gün)</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">Konum / Parsel</th>
                          <th className="p-2">Vasıf</th>
                          <th className="p-2">Alan</th>
                          <th className="p-2">Satış Fiyatı</th>
                          <th className="p-2 text-right">m² Birim</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr><td className="p-2 font-semibold">Tire Akyurt 141/5</td><td>Tarla</td><td>4.200 m²</td><td>1.750.000 ₺</td><td className="p-2 text-right font-mono">416 ₺/m²</td></tr>
                        <tr><td className="p-2 font-semibold">Tire Akyurt 143/8</td><td>Zeytinlik</td><td>5.800 m²</td><td>2.450.000 ₺</td><td className="p-2 text-right font-mono">422 ₺/m²</td></tr>
                        <tr><td className="p-2 font-semibold">Tire Boynuyoğun 102/14</td><td>Tarla</td><td>8.500 m²</td><td>3.500.000 ₺</td><td className="p-2 text-right font-mono">411 ₺/m²</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SEKME 7: NOTLAR */}
              {activeResultTab === "notlar" && (
                <div className="space-y-2 text-xs text-slate-600">
                  <p>• Değerleme verileri Tapu ve Kadastro Genel Müdürlüğü (TKGM) ve HGK coğrafi harita verileri baz alınarak oluşturulmuştur.</p>
                  <p>• Tarımsal arazilerde kadastral yol erişimi bulunmayan parsellerde İmar Kanunu m.18 uygulaması ve geçit hakkı davaları dikkate alınmalıdır.</p>
                </div>
              )}

              {/* SEKME 8: EKLER */}
              {activeResultTab === "ekler" && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>TKGM Resmi Kadastro Parsel Krokisi (PDF)</span>
                  <button onClick={() => alert("Kroki indirildi.")} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold">İndir</button>
                </div>
              )}
            </div>
          </div>

          {/* ALT GEZİNME VE HARİTAYA GEÇİŞ */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Yeni Değerleme Başlat
            </button>

            <button
              type="button"
              onClick={onNavigateToMap}
              className="px-6 py-2.5 rounded-xl bg-[#0F223D] hover:bg-[#1E293B] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Bölgeyi İncele & Mahalle Haritasına Geç</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. YÜKLENİYOR / HESAPLAMA MODALI                                          */}
      {/* ========================================================================= */}
      {isCalculating && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 font-heading">
                Değer Hesaplanıyor
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {calcStatusText}
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-[#E11D48] to-[#BE123C] rounded-full transition-all duration-300"
                  style={{ width: `${calcProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-400">%{calcProgress}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. 13 SAYFALIK ELEKTRONİK DEĞERLEME RAPORU MODALI (media_1789464761780.pdf) */}
      {/* ========================================================================= */}
      <ElectronicReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        propertyTitle={isArazi ? "Akyurt Parsel Tarımsal Arazi" : isArsa ? "Şükriye Parsel İmarlı Arsa" : "Referans Ankara Sitesi E Blok"}
        category={isArazi ? "arazi" : isArsa ? "arsa" : "konut"}
        locationText={currentAddressText}
        parcelText={isArazi ? "İzmir, Tire, Akyurt, 142 Ada, 12 Parsel" : isArsa ? "Bursa, Gemlik, Şükriye, 114 Ada, 188 Parsel" : "Ankara, Etimesgut, Eryaman, 48507 Ada, 1 Parsel"}
        marketValueTL={totalMarketValueTL}
        areaM2={baseArea}
      />

      {/* NASIL HESAPLIYORUZ MODALI */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-extrabold text-slate-900 font-heading">
                Veri Kaynaklarımız ve Hesaplama Metodolojisi
              </h4>
              <button onClick={() => setShowHowItWorksModal(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p><strong>1. TCMB EVDS Konut Fiyat Endeksi:</strong> Türkiye Cumhuriyet Merkez Bankası resmi endeksleri baz alınır.</p>
              <p><strong>2. İcra İflas Kanunu (İİK) m.115:</strong> Yasal icra ihale tabanı rayicin %50&apos;sidir.</p>
              <p><strong>3. Harita Genel Müdürlüğü (HGK):</strong> 81 il ve 973 ilçe resmi sınırları.</p>
              <p><strong>4. Tarım ve Orman Bakanlığı Verileri:</strong> Tarla ve arazi verimlilik katsayıları.</p>
            </div>
            <button onClick={() => setShowHowItWorksModal(false)} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition">
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}

      {/* PAYLAŞILDI BİLDİRİMİ */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Değerleme linki panoya kopyalandı!</span>
        </div>
      )}

    </div>
  );
};
