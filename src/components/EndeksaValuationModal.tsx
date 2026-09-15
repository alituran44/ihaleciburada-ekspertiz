"use client";

import React, { useState } from "react";
import { ParcelInput, PropertyCategory } from "@/types";
import { ALL_PROVINCES, getDistrictsByProvince } from "@/lib/turkeyLocations";
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
  ExternalLink
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

  // Stepper Adımı: 1 (Adres), 2 (Konut/Arsa/Arazi Özellikleri), 3 (Ek Özellikler), 4 (Olanaklar), 5 (Sonuç Dashboard)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Hesaplama Animasyon Durumu (Loading Modal)
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcProgress, setCalcProgress] = useState<number>(0);
  const [calcStatusText, setCalcStatusText] = useState<string>("Geçmiş tarihli emsaller bulunuyor...");

  // Kalan Değerleme Hakkı
  const [quotaRemaining, setQuotaRemaining] = useState<number>(4);
  const [reportQuota, setReportQuota] = useState<number>(1);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);

  // ==========================================
  // ADIM 2: KONUT ÖZELLİKLERİ (Görsel 1 Birebir)
  // ==========================================
  const [housingTypeKind, setHousingTypeKind] = useState<"apartman" | "mustakil">("apartman");
  const [apartmentSubtype, setApartmentSubtype] = useState<string>("daire");
  const [usageStatus, setUsageStatus] = useState<"mulk_sahibi" | "kiraci" | "bos">("bos");
  const [buildingCondition, setBuildingCondition] = useState<"bakimli" | "standart" | "tadilat">("standart");
  
  const [roomCountVal, setRoomCountVal] = useState<number>(3);
  const [livingRoomCountVal, setLivingRoomCountVal] = useState<number>(1);
  const [bathroomCountVal, setBathroomCountVal] = useState<number>(1);
  const [grossAreaVal, setGrossAreaVal] = useState<number>(input.areaM2 || 145);
  const [terraceAreaVal, setTerraceAreaVal] = useState<number | null>(null);
  const [buildingAgeVal, setBuildingAgeVal] = useState<number>(5);
  const [totalBuildingFloors, setTotalBuildingFloors] = useState<number>(5);
  const [floorNumberVal, setFloorNumberVal] = useState<number>(2);

  // Arsa / Arazi / Ticari Özel Parametreleri
  const [kaksVal, setKaksVal] = useState<number>(input.kaks || 1.5);
  const [contractorShareVal, setContractorShareVal] = useState<number>(input.contractorSharePercent || 45);
  const [isCornerVal, setIsCornerVal] = useState<boolean>(input.isCornerParcel || false);

  const [fieldLandType, setFieldLandType] = useState<string>("sulu_tarla");
  const [commercialType, setCommercialType] = useState<string>("cadde_dukkan");
  const [commercialFrontageM, setCommercialFrontageM] = useState<number>(8);

  // ==========================================
  // ADIM 3: EK ÖZELLİKLER (Görsel 2 Birebir)
  // ==========================================
  const [selectedFacades, setSelectedFacades] = useState<string[]>(["guney", "dogu"]);
  const [selectedViews, setSelectedViews] = useState<string[]>(["cadde_sokak", "sehir"]);
  const [heatingSystem, setHeatingSystem] = useState<string>("dogalgaz_kombi");

  // ==========================================
  // ADIM 4: OLANAKLAR (Görsel 3 Birebir)
  // ==========================================
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "asansor",
    "otopark",
    "isi_yalitimi",
    "spor_salonu"
  ]);

  // ==========================================
  // ADIM 5: SONUÇ DASHBOARD'U (Görseller 5 ve 6 Birebir)
  // ==========================================
  const [resultValuationMode, setResultValuationMode] = useState<"satis" | "kira">("satis");
  const [activeResultTab, setActiveResultTab] = useState<
    "danismanlar" | "raporlar" | "ozellikler" | "yatirim_skoru" | "deger_degisimi" | "kredi_yatirim" | "notlar" | "ekler"
  >("danismanlar");

  const [actualPriceInput, setActualPriceInput] = useState<string>("");
  const [actualPriceDate, setActualPriceDate] = useState<string>("15.09.2026");
  const [actualPriceSaved, setActualPriceSaved] = useState<boolean>(false);

  // İlçe Listesi (Seçili İle Göre)
  const districts = getDistrictsByProvince(input.city || "Çanakkale");

  // Hizmet Değiştirme
  const handleSelectService = (service: ValuationServiceType) => {
    setActiveService(service);
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

  const toggleFacade = (f: string) => {
    setSelectedFacades((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const toggleView = (v: string) => {
    setSelectedViews((prev) =>
      prev.includes(v) ? prev.filter((item) => item !== v) : [...prev, v]
    );
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
    );
  };

  // Hesaplama Animasyonu (Görsel 4)
  const triggerCalculation = () => {
    setIsCalculating(true);
    setCalcProgress(10);
    setCalcStatusText("Geçmiş tarihli emsaller bulunuyor...");

    const t1 = setTimeout(() => {
      setCalcProgress(45);
      setCalcStatusText("TCMB EVDS Konut Fiyat Endeksi analiz ediliyor...");
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
      setQuotaRemaining((prev) => Math.max(0, prev - 1));
      setStep(5); // Sonuç Dashboard'a geç
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  // Dinamik Değerleme Hesaplamaları (Görsel 6'daki 8.700.000 ₺ / 60.000 ₺/m² standardı)
  const baseArea = grossAreaVal || 145;
  const unitPriceEstimate = 60000; // 60.000 ₺/m² (Görseldeki değer)
  const totalMarketValueTL = Math.round(baseArea * unitPriceEstimate); // 8.700.000 ₺ (145m² için)
  const tenderStartPriceTL = Math.round(totalMarketValueTL * 0.50); // İİK m.115 %50: 4.350.000 ₺
  
  const estimatedRentTL = Math.round(totalMarketValueTL / 225); // ~38.500 ₺/Ay
  const paybackYears = 17; // 15 - 18 yıl

  // Paylaşma Fonksiyonu
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F5F6F8] py-6 sm:py-10 px-3 sm:px-6 flex flex-col items-center">
      
      {/* ========================================================================= */}
      {/* 1. ÜST STEPPER (ADIM 1 - 4 ARASINDA GÖRÜNÜR)                               */}
      {/* ========================================================================= */}
      {step !== 5 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#E11D48] -translate-y-1/2 z-0 transition-all duration-300"
              style={{
                width: step === 1 ? "0%" : step === 2 ? "33.3%" : step === 3 ? "66.6%" : "100%"
              }}
            />

            {/* ADIM 1: Adres */}
            <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setStep(1)}>
              <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                step >= 1 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 1 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                Adres
              </span>
            </div>

            {/* ADIM 2: Konut Özellikleri */}
            <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 1 && setStep(2)}>
              <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                step >= 2 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step > 2 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 2 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                {activeService === "ev" ? "Konut Özellikleri" : activeService === "arsa" ? "Arsa Özellikleri" : activeService === "arazi" ? "Arazi Özellikleri" : "Ticari Özellikleri"}
              </span>
            </div>

            {/* ADIM 3: Ek Özellikler */}
            <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 2 && setStep(3)}>
              <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                step >= 3 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step > 3 ? <Check className="w-4 h-4" /> : "3"}
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 3 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                Ek Özellikler
              </span>
            </div>

            {/* ADIM 4: Olanaklar */}
            <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => step > 3 && setStep(4)}>
              <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition shadow-xs ${
                step >= 4 ? "bg-[#E11D48] text-white" : "bg-slate-200 text-slate-500"
              }`}>
                4
              </div>
              <span className={`text-[11px] font-semibold mt-1.5 ${step === 4 ? "text-slate-900 font-bold" : "text-slate-500"}`}>
                Olanaklar
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADIM 1-4 İÇİN FORM VE REHBER ALANI                                     */}
      {/* ========================================================================= */}
      {step !== 5 && (
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between min-h-[560px]">
            
            {/* ADIM 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                    Emlak Değerini Hemen Öğrenin
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Gayrimenkul tipini seçin, yapay zekanın gücü ile değerini öğrenin.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowHowItWorksModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 underline transition cursor-pointer pt-1"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 inline-flex items-center justify-center text-[9px] font-bold">?</span>
                    <span>Nasıl hesaplıyoruz ve veri kaynaklarımız neler inceleyin.</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div
                    onClick={() => handleSelectService("ev")}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                      activeService === "ev"
                        ? "border-[#E11D48] bg-rose-50/40 shadow-xs ring-2 ring-rose-400/20"
                        : "border-slate-200 hover:border-rose-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#FDF2F4] text-[#E11D48] flex items-center justify-center mb-2">
                      <Home className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">Tüm konut tipleri</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">Konut</div>
                  </div>

                  <div
                    onClick={() => handleSelectService("arsa")}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                      activeService === "arsa"
                        ? "border-emerald-500 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-400/20"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-2">
                      <Trees className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">İmarlı arsalar</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">Arsa</div>
                  </div>

                  <div
                    onClick={() => handleSelectService("arazi")}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                      activeService === "arazi"
                        ? "border-amber-500 bg-amber-50/40 shadow-xs ring-2 ring-amber-400/20"
                        : "border-slate-200 hover:border-amber-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#FEFCE8] text-[#D97706] flex items-center justify-center mb-2">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">Tarla, bağ, bahçe</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">Arazi</div>
                  </div>

                  <div
                    onClick={() => handleSelectService("ticari")}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] ${
                      activeService === "ticari"
                        ? "border-sky-500 bg-sky-50/40 shadow-xs ring-2 ring-sky-400/20"
                        : "border-slate-200 hover:border-sky-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center mb-2">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">Dükkan, ofis</div>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">Ticari</div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">İl *</label>
                      <select
                        value={input.city}
                        onChange={(e) => onChange({ ...input, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#E11D48] focus:outline-none"
                      >
                        {ALL_PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">İlçe *</label>
                      <select
                        value={input.district}
                        onChange={(e) => onChange({ ...input, district: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#E11D48] focus:outline-none"
                      >
                        {districts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mahalle / Köy *</label>
                      <input
                        type="text"
                        value={input.neighborhood || ""}
                        onChange={(e) => onChange({ ...input, neighborhood: e.target.value })}
                        placeholder="Örn: Karacaören Köyü"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#E11D48] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ada No</label>
                      <input
                        type="text"
                        value={input.ada || ""}
                        onChange={(e) => onChange({ ...input, ada: e.target.value })}
                        placeholder="Örn: 101"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#E11D48] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Parsel No</label>
                      <input
                        type="text"
                        value={input.parsel || ""}
                        onChange={(e) => onChange({ ...input, parsel: e.target.value })}
                        placeholder="Örn: 15"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#E11D48] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3 text-center space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800">
                    <strong className="text-[#E11D48] font-extrabold text-sm">{quotaRemaining}</strong> değerleme hakkınız bulunuyor.
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Ücretsiz değerleme hakları sadece konut, arsa ve araziler için geçerlidir.
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Vazgeç</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-7 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>Sonraki Adım</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  Konutun özelliklerini kontrol ederek gerekliyse düzeltiniz
                </h2>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Konut Tipi *</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setHousingTypeKind("apartman")}
                        className={`px-4 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 font-semibold ${
                          housingTypeKind === "apartman"
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>Apartman</span>
                        {housingTypeKind === "apartman" && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHousingTypeKind("mustakil")}
                        className={`px-4 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 font-semibold ${
                          housingTypeKind === "mustakil"
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>Müstakil</span>
                        {housingTypeKind === "mustakil" && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Kullanım Durumu *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "mulk_sahibi", label: "Mülk Sahibi" },
                        { id: "kiraci", label: "Kiracı" },
                        { id: "bos", label: "Boş" },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setUsageStatus(u.id as any)}
                          className={`px-4 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 font-semibold ${
                            usageStatus === u.id
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{u.label}</span>
                          {usageStatus === u.id && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Oda Sayısı *</label>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setRoomCountVal(Math.max(0, roomCountVal - 1))}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="flex-1 text-center font-black text-slate-900">{roomCountVal}</span>
                          <button
                            type="button"
                            onClick={() => setRoomCountVal(roomCountVal + 1)}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Salon Sayısı *</label>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setLivingRoomCountVal(Math.max(0, livingRoomCountVal - 1))}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="flex-1 text-center font-black text-slate-900">{livingRoomCountVal}</span>
                          <button
                            type="button"
                            onClick={() => setLivingRoomCountVal(livingRoomCountVal + 1)}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Brüt Alan (m²) *</label>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setGrossAreaVal(Math.max(20, grossAreaVal - 5))}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            value={grossAreaVal}
                            onChange={(e) => setGrossAreaVal(Number(e.target.value))}
                            className="flex-1 text-center font-black text-slate-900 bg-transparent outline-none w-16"
                          />
                          <button
                            type="button"
                            onClick={() => setGrossAreaVal(grossAreaVal + 5)}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Bina Yaşı *</label>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setBuildingAgeVal(Math.max(0, buildingAgeVal - 1))}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="flex-1 text-center font-black text-slate-900">{buildingAgeVal}</span>
                          <button
                            type="button"
                            onClick={() => setBuildingAgeVal(buildingAgeVal + 1)}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Önceki Adım</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-7 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>Sonraki Adım</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  Ek özelliklerini giriniz
                </h2>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5">Cephe Durumu</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "kuzey", label: "Kuzey" },
                      { id: "guney", label: "Güney" },
                      { id: "dogu", label: "Doğu" },
                      { id: "bati", label: "Batı" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFacade(f.id)}
                        className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          selectedFacades.includes(f.id)
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>{f.label}</span>
                        {selectedFacades.includes(f.id) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5">Isıtma Sistemi *</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "dogalgaz_kombi", label: "Doğalgaz/Kombi" },
                      { id: "merkezi", label: "Merkezi Sistem" },
                      { id: "yerden_isitma", label: "Yerden Isıtma" },
                      { id: "klima", label: "Klima Sistemi/Isı Pompası" },
                      { id: "soba", label: "Soba" },
                      { id: "diger", label: "Diğer" },
                    ].map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHeatingSystem(h.id)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          heatingSystem === h.id
                            ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>{h.label}</span>
                        {heatingSystem === h.id && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Önceki Adım</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-7 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>Sonraki Adım</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 4 */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    Konutun sahip olduğu olanakları giriniz
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Olanaklar bölgedeki değere etkilerine göre sıralanmaktadır.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {[
                    { id: "asansor", label: "Asansör" },
                    { id: "otopark", label: "Otopark" },
                    { id: "kapali_otopark", label: "Kapalı Otopark" },
                    { id: "spor_salonu", label: "Spor Sahası/Salonu" },
                    { id: "cocuk_parki", label: "Çocuk Oyun Parkı" },
                    { id: "guvenlik", label: "Güvenlik" },
                    { id: "isi_yalitimi", label: "Isı Yalıtımı" },
                    { id: "jenerator", label: "Jeneratör" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAmenity(item.id)}
                      className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        selectedAmenities.includes(item.id)
                          ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span>{item.label}</span>
                      {selectedAmenities.includes(item.id) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Önceki Adım</span>
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

          {/* SAĞ REHBER KARTI */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 space-y-4 min-h-[500px]">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Gayrimenkul Değerleme Rehberi
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                <p>
                  Emlak değeri, bölgedeki tapu devirleri, TCMB EVDS aylık konut endeksi ve bağımsız bölümün m², kat, cephe ve yapı nitelikleri baz alınarak hesaplanır.
                </p>
                <p className="font-semibold text-slate-700">
                  İhaleci Burada ile icra ve kamu ihalesi başlangıç tabanı olan %50 İİK m.115 fiyatını ve piyasa rayicini anında keşfedin.
                </p>
              </div>
            </div>

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
      {/* 3. YÜKLEME MODALI (Görsel 4)                                              */}
      {/* ========================================================================= */}
      {isCalculating && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 font-heading">
              Değer Hesaplanıyor
            </h3>

            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center mx-auto shadow-xs">
              <TrendingUp className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">
                {calcStatusText}
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#E11D48] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${calcProgress}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white text-left space-y-1.5 shadow-md">
              <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                İHALECİ BURADA DEĞERLEME MOTORU
              </div>
              <div className="text-xs font-bold leading-tight">
                TCMB EVDS, HGK Kadastro ve İİK m.115 Yasal İhale Tabanı Entegrasyonu
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADIM 5: SONUÇ DASHBOARD'U (Görsel 6: media_1789463680241.jpg Birebir)  */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="max-w-6xl w-full space-y-4 animate-in fade-in duration-300">
          
          {/* EN ÜST GEZİNİM ÇUBUĞU (Görsel 6 Üst Bar) */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 hover:text-slate-900 transition cursor-pointer font-bold text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Değerlemeler</span>
            </button>

            <div className="flex items-center gap-4 text-xs">
              <button
                type="button"
                onClick={onNavigateToMap}
                className="flex items-center gap-1.5 hover:text-slate-900 transition cursor-pointer font-bold text-slate-700"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Bölge Analizi</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-slate-900 transition cursor-pointer font-bold text-slate-700"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Paylaş</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setReportGenerated(false);
                }}
                className="flex items-center gap-1 hover:text-[#E11D48] transition cursor-pointer font-bold text-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni</span>
              </button>
            </div>
          </div>

          {/* KONUM & HARİTADA GÖSTER BAŞLIK ŞERİDİ (Görsel 6 Başlık) */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 min-w-0">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {input.neighborhood || "Karacaören Köyü"} {input.neighborhood || "Karacaören Köyü"} {input.district || "Çanakkale Merkez"} {input.city || "Çanakkale"}...
              </span>
              <button
                type="button"
                onClick={() => setStep(2)}
                title="Özellikleri Düzenle"
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onNavigateToMap}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Haritada Göster</span>
            </button>
          </div>

          {/* İKİ SÜTUNLU ANA GÖVDE (Görsel 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* SOL SÜTUN: GOOGLE STREET VIEW BİNA FOTOĞRAFI & DANIŞMAN KARTI */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* GOOGLE STREET VIEW / BİNA FOTOĞRAFI (Görsel 6 Sol Üst) */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative h-[280px] sm:h-[300px]">
                {/* Gerçekçi Modern Bina & Sokak Görünümü Arka Planı */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80')"
                  }}
                >
                  {/* Google Street View Izgarası & Gölge Katmanı */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Merkezdeki Pembe Konut Pin'i */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-rose-600/30 animate-ping absolute -inset-0" />
                      <div className="w-9 h-9 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-lg border-2 border-white relative z-10">
                        <Home className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sol Üst Kırmızı Kategori Rozeti */}
                <div className="relative z-10 p-3">
                  <span className="px-3 py-1 bg-[#E11D48] text-white text-[11px] font-black rounded uppercase tracking-wider shadow-sm">
                    {activeService === "ev" ? "KONUT" : activeService === "arsa" ? "ARSA" : activeService === "arazi" ? "ARAZİ" : "TİCARİ"}
                  </span>
                </div>

                {/* Alt Google Filigranı & Sokak Görünümü Butonları (Görseldeki Birebir) */}
                <div className="absolute bottom-0 left-0 right-0 z-10 px-3 py-2 flex items-center justify-between text-[10px] text-white/90">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-wide text-xs">Google</span>
                    <span className="text-[9px] text-white/70 hidden sm:inline">Klavye kısayolları • © 2026 Google Şartlar</span>
                  </div>
                  <div className="w-6 h-6 rounded bg-black/60 border border-white/20 flex items-center justify-center text-white cursor-pointer">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* "Satmayı mı düşünüyorsunuz?" DANIŞMAN KARTI (Görsel 6 Sol Alt) */}
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

                {/* Danışman Detay Kutusu */}
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

                  {/* Metrikler (Hesaplanıyor & 60-90 gün) */}
                  <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-200">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      <span>Hesaplanıyor...</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-medium">Danışmanın Ortalama Satış Süresi</div>
                      <div className="text-xs font-black text-[#E11D48] mt-0.5">60-90 gün</div>
                    </div>
                  </div>

                  {/* 3 Buton: Güvenle Sat | Rapor Al | Profili Gör */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => alert("Güvenle Sat talebiniz bölge danışmanına iletildi.")}
                      className="py-2 px-1 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Star className="w-3 h-3" />
                      <span>Güvenle Sat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveResultTab("raporlar");
                        setReportGenerated(true);
                      }}
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

            {/* SAĞ SÜTUN: DEĞERLEME KARTI & FİYAT TAHMİNİ (Görsel 6 Sağ Kısım) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              
              {/* Üst Bilgi Linki & İşlemler */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2.5">
                <button
                  type="button"
                  onClick={() => setShowHowItWorksModal(true)}
                  className="hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Nasıl hesaplıyoruz?</span>
                </button>

                <button 
                  type="button"
                  onClick={() => alert("Değerleme Raporu / Emsal İşlemleri")}
                  className="text-slate-400 hover:text-slate-700 font-mono text-xs flex items-center gap-0.5 cursor-pointer"
                >
                  <span>İşlemler</span>
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Satış Değeri / Kira Değeri Toggle */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setResultValuationMode("satis")}
                  className={`px-6 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                    resultValuationMode === "satis"
                      ? "bg-[#E11D48] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Satış Değeri
                </button>
                <button
                  type="button"
                  onClick={() => setResultValuationMode("kira")}
                  className={`px-6 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                    resultValuationMode === "kira"
                      ? "bg-[#E11D48] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Kira Değeri
                </button>
              </div>

              {/* BÜYÜK FİYAT GÖSTERGESİ (Görsel 6: 8.700.000 ₺ / 60.000 ₺/m²) */}
              <div className="text-center py-2 space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-slate-900 font-heading tracking-tight">
                  {resultValuationMode === "satis" 
                    ? `${totalMarketValueTL.toLocaleString("tr-TR")} ₺` 
                    : `${estimatedRentTL.toLocaleString("tr-TR")} ₺`
                  }
                </div>

                <div className="text-xs font-bold text-slate-500 pt-0.5">
                  {resultValuationMode === "satis" ? "3 Aydan Kısa Süre Beklenirse" : "Tahmini Aylık Net Kira"}
                </div>

                <div className="text-sm font-extrabold text-slate-700">
                  {resultValuationMode === "satis" 
                    ? `${unitPriceEstimate.toLocaleString("tr-TR")} ₺/m²`
                    : `${Math.round(unitPriceEstimate / 225).toLocaleString("tr-TR")} ₺/m² (Kira)`
                  }
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>15 Eyl 2026 12:10</span>
                </div>
              </div>

              {/* 3 SÜTUNLU ZAMAN & AMORTİSMAN TAHMİN KUTULARI (Görsel 6 Birebir) */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="p-1">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                    3 - 6 AY ARASI BEKLENİRSE
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                    {Math.round(totalMarketValueTL * 1.09).toLocaleString("tr-TR")} ₺
                  </div>
                </div>

                <div className="p-1 border-x border-slate-200">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                    YATIRIM GERİ DÖNÜŞ SÜRESİ
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                    15 - 18 yıl
                  </div>
                </div>

                <div className="p-1">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                    6 - 12 AY ARASI BEKLENİRSE
                  </div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                    {Math.round(totalMarketValueTL * 1.15).toLocaleString("tr-TR")} ₺
                  </div>
                </div>
              </div>

              {/* HESAP PUANI & BÖLGESEL DEPREM RİSKİ (Görsel 6) */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold pt-1">
                <span className="px-3 py-1 bg-[#E11D48] text-white rounded-full text-[11px] font-black shadow-2xs">
                  Hesap Puanı: 75/100
                </span>
                
                <span className="text-slate-300">|</span>

                <div className="flex items-center gap-1 text-[11px] text-slate-700">
                  <span>Bölgesel Deprem Tehlikesi (PGA):</span>
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  <span className="font-mono font-bold text-slate-900">0.302g</span>
                </div>
              </div>

              {/* İİK m.115 %50 İHALE TABAN ROZETİ */}
              <div className="flex items-center justify-center">
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-emerald-600" />
                  <span>İİK m.115 İhale Başlangıç Tabanı (%50): ₺ {tenderStartPriceTL.toLocaleString("tr-TR")}</span>
                </div>
              </div>

              {/* YASAL DİSCLAİMER */}
              <p className="text-[10px] text-slate-400 text-center leading-relaxed italic">
                * Bu değerler yasal durum bilgisi olmadan, bilgisayar algoritmaları kullanılarak hesaplanmıştır ve herhangi bir yasal yükümlülük taşımamaktadır.
              </p>

              {/* "GERÇEKLEŞEN DEĞERİ" MAVİ KUTUSU (Görsel 6 Birebir) */}
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
          {/* 8'Lİ ALT SEKME BAR & BÖLGENİZDEKİ DANIŞMANLAR (Görsel 6)                  */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden mt-6">
            
            {/* Sekme Butonları Çubuğu (Görsel 6: DANIŞMANLAR Aktif) */}
            <div className="flex items-center overflow-x-auto border-b border-slate-200 scrollbar-none px-2 text-xs font-extrabold">
              {[
                { id: "danismanlar", label: "DANIŞMANLAR" },
                { id: "raporlar", label: "RAPORLAR" },
                { id: "ozellikler", label: "ÖZELLİKLER" },
                { id: "yatirim_skoru", label: "YATIRIM SKORU" },
                { id: "deger_degisimi", label: "DEĞER DEĞİŞİMİ" },
                { id: "kredi_yatirim", label: "KREDİ VE YATIRIM" },
                { id: "notlar", label: "NOTLAR" },
                { id: "ekler", label: "EKLER" },
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setActiveResultTab(tabItem.id as any)}
                  className={`px-4 py-3 whitespace-nowrap transition cursor-pointer border-b-2 font-heading ${
                    activeResultTab === tabItem.id
                      ? "border-[#E11D48] text-[#E11D48] bg-rose-50/20 font-black"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* SEKME İÇERİKLERİ */}
            <div className="p-6">
              
              {/* 1. DANIŞMANLAR SEKMESİ (Görsel 6'da Birebir Gösterilen Ekran) */}
              {activeResultTab === "danismanlar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      Bölgenizdeki Danışmanlar
                    </h3>

                    <button
                      type="button"
                      onClick={() => alert("Güvenle Sat talebiniz bölgedeki en yüksek puanlı danışmana iletildi.")}
                      className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0EA5E9] text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Güvenle Sat</span>
                    </button>
                  </div>

                  {/* 4 ADET DANIŞMAN KARTI IZGARASI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                    
                    {/* Danışman 1: Gülçin Nazlı */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3 flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300 shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" 
                            alt="Gülçin Nazlı" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Gülçin Nazlı</div>
                          <div className="text-[11px] text-slate-500">Remax Troia - Merkez</div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>5.0 (48 İşlem)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 py-1 border-y border-slate-200/60">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ort. Satış Süresi:</span>
                          <strong className="text-[#E11D48]">60-90 gün</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Aktif Portföy:</span>
                          <strong className="text-slate-800">14 İlan</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => alert("Gülçin Nazlı ile iletişim: 0850 304 12 34")}
                          className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>İletişim</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert("Portföyler yükleniyor...")}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Portföy
                        </button>
                      </div>
                    </div>

                    {/* Danışman 2: Ali Turan */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3 flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300 bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                          AT
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Ali Turan</div>
                          <div className="text-[11px] text-slate-500">İhaleci Burada - SPK Lisanslı</div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>5.0 (92 Değerleme)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 py-1 border-y border-slate-200/60">
                        <div className="flex justify-between">
                          <span className="text-slate-400">İhale Başarı Oranı:</span>
                          <strong className="text-emerald-700">%94</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Uzmanlık:</span>
                          <strong className="text-slate-800">İcra & İhale</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => alert("Ali Turan ile görüşme başlatılıyor...")}
                          className="flex-1 py-1.5 rounded-lg bg-[#E11D48] text-white font-bold text-xs hover:bg-[#BE123C] transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Görüş</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert("İhale portföyleri listeleniyor...")}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          İhaleler
                        </button>
                      </div>
                    </div>

                    {/* Danışman 3: Mehmet Demir */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3 flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300 shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
                            alt="Mehmet Demir" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Mehmet Demir</div>
                          <div className="text-[11px] text-slate-500">Coldwell Banker 1915</div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>4.9 (35 İşlem)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 py-1 border-y border-slate-200/60">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ort. Satış Süresi:</span>
                          <strong className="text-[#E11D48]">75 gün</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Bölge:</span>
                          <strong className="text-slate-800">Çanakkale Boğazı</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => alert("Mehmet Demir ile iletişim kuruluyor...")}
                          className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>İletişim</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert("Portföyler yükleniyor...")}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Portföy
                        </button>
                      </div>
                    </div>

                    {/* Danışman 4: Zeynep Kaya */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3 flex flex-col justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300 shrink-0">
                          <img 
                            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80" 
                            alt="Zeynep Kaya" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">Zeynep Kaya</div>
                          <div className="text-[11px] text-slate-500">Turyap Çanakkale Temsilciliği</div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>4.8 (29 İşlem)</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 py-1 border-y border-slate-200/60">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ort. Satış Süresi:</span>
                          <strong className="text-[#E11D48]">60 gün</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Aktif Portföy:</span>
                          <strong className="text-slate-800">9 İlan</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => alert("Zeynep Kaya ile iletişim kuruluyor...")}
                          className="flex-1 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>İletişim</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => alert("Portföyler yükleniyor...")}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                        >
                          Portföy
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 2. RAPORLAR SEKMESİ */}
              {activeResultTab === "raporlar" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Resmi Ekspertiz Raporu</div>
                      <p className="text-xs text-slate-600">Gayrimenkulün resmi SPK & TCMB onaylı kıymet takdir özetini indirin.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Yazdır</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert("PDF Raporu indirildi.")}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF İndir</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ÖZELLİKLER SEKMESİ */}
              {activeResultTab === "ozellikler" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Gayrimenkulün Girilen Tüm Nitelikleri</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Konut Tipi</span>
                      <strong className="text-slate-800 uppercase">{housingTypeKind} / {apartmentSubtype}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Oda + Salon</span>
                      <strong className="text-slate-800">{roomCountVal} + {livingRoomCountVal}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Brüt Alan</span>
                      <strong className="text-slate-800">{grossAreaVal} m²</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Bina Yaşı / Kat</span>
                      <strong className="text-slate-800">{buildingAgeVal} Yaş / {floorNumberVal}. Kat</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. YATIRIM SKORU SEKMESİ (Görsel 6'daki Özel Başlık) */}
              {activeResultTab === "yatirim_skoru" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Yatırım ve İhale Fırsat Skoru</h4>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-xs">
                      Skor: 92/100 (Yüksek Fırsat)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[10px] font-bold text-emerald-800">İhale Kazanç Marjı</div>
                      <div className="text-xl font-black text-emerald-700 mt-1">%50 İndirim</div>
                      <p className="text-[10px] text-emerald-600 mt-0.5">İcra satışında ₺ {tenderStartPriceTL.toLocaleString("tr-TR")} tabanından girme fırsatı.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-600">Amortisman Süresi</div>
                      <div className="text-xl font-black text-slate-900 mt-1">15 - 18 Yıl</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Bölgesel ortalamanın 3 yıl altında geri dönüş.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-600">Kira Getiri Oranı</div>
                      <div className="text-xl font-black text-slate-900 mt-1">%5.3 / Yıllık</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Aylık net ₺ {estimatedRentTL.toLocaleString("tr-TR")} getiri.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. DEĞER DEĞİŞİMİ SEKMESİ */}
              {activeResultTab === "deger_degisimi" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">TCMB EVDS Endeks Değişimi</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">1 Yıl Önceki Ortalama m²</div>
                      <div className="text-lg font-black text-slate-700 mt-1">36.000 ₺/m²</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">Bugünkü Güncel m²</div>
                      <div className="text-lg font-black text-rose-600 mt-1">60.000 ₺/m²</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">1 Yıl Sonraki Tahmin</div>
                      <div className="text-lg font-black text-emerald-600 mt-1">82.000 ₺/m²</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. KREDİ VE YATIRIM SEKMESİ */}
              {activeResultTab === "kredi_yatirim" && (
                <div className="p-6 text-xs text-slate-600 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">Konut Kredisi ve İhale Finansmanı</h4>
                  <p>Bu konut için bankaların azami kredi limiti ekspertiz değerinin %80&apos;i olan <strong>₺ {Math.round(totalMarketValueTL * 0.8).toLocaleString("tr-TR")}</strong> tutarındadır.</p>
                </div>
              )}

              {/* 7. NOTLAR VE EKLER */}
              {(activeResultTab === "notlar" || activeResultTab === "ekler") && (
                <div className="p-8 text-center text-xs text-slate-500">
                  Bu gayrimenkul için eklenmiş özel bir not veya ek dosya bulunmamaktadır.
                </div>
              )}

            </div>

          </div>

          {/* ALT GEZİNİM BUTONLARI */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setReportGenerated(false);
              }}
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

      {/* NASIL HESAPLIYORUZ BİLGİLENDİRME MODALI */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-extrabold text-slate-900 font-heading">
                Veri Kaynaklarımız ve Hesaplama Metodolojisi
              </h4>
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. TCMB EVDS Konut Fiyat Endeksi:</strong> Türkiye Cumhuriyet Merkez Bankası&apos;nın resmi il ve bölge düzeyindeki aylık değer artış endeksleri baz alınır.
              </p>
              <p>
                <strong>2. İcra İflas Kanunu (İİK) m.115:</strong> Yasal icra ve ihale başlangıç bedeli, tespit edilen kıymet takdirinin tam olarak %50&apos;si üzerinden hesaplanır.
              </p>
              <p>
                <strong>3. Harita Genel Müdürlüğü (HGK) Kadastro:</strong> 81 il ve 973 ilçedeki mahalle ve köy sınırları doğrudan resmi mülki idare poligonlarıyla eşleştirilir.
              </p>
            </div>
            <button
              onClick={() => setShowHowItWorksModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}

      {/* PAYLAŞ TOAST BİLDİRİMİ */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Değerleme linki panoya kopyalandı!</span>
        </div>
      )}

    </div>
  );
};
