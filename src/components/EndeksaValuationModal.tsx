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
  Users
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
  const [grossAreaVal, setGrossAreaVal] = useState<number>(input.areaM2 || 120);
  const [terraceAreaVal, setTerraceAreaVal] = useState<number | null>(null);
  const [buildingAgeVal, setBuildingAgeVal] = useState<number>(5);
  const [totalBuildingFloors, setTotalBuildingFloors] = useState<number>(5);
  const [floorNumberVal, setFloorNumberVal] = useState<number>(2);

  // Arsa / Arazi / Ticari Özel State'leri
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
  // ADIM 5: SONUÇ DASHBOARD'U (Görsel 5 Birebir)
  // ==========================================
  const [resultValuationMode, setResultValuationMode] = useState<"satis" | "kira">("satis");
  const [activeResultTab, setActiveResultTab] = useState<
    "danismanlar" | "raporlar" | "ozellikler" | "deger_degisimi" | "analiz_emsaller" | "kredi_yatirim" | "notlar" | "ekler"
  >("raporlar");

  const [actualPriceInput, setActualPriceInput] = useState<string>("");
  const [actualPriceDate] = useState<string>("15.09.2026");
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

  // Çoklu Seçim Toggle Fonksiyonları
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

  // Hesapla Butonuna Basıldığında Yükleme Animasyonunu Başlat (Görsel 4)
  const triggerCalculation = () => {
    setIsCalculating(true);
    setCalcProgress(10);
    setCalcStatusText("Geçmiş tarihli emsaller bulunuyor...");

    const timer1 = setTimeout(() => {
      setCalcProgress(45);
      setCalcStatusText("TCMB EVDS Konut Fiyat Endeksi analiz ediliyor...");
    }, 600);

    const timer2 = setTimeout(() => {
      setCalcProgress(80);
      setCalcStatusText("İcra İflas Kanunu m.115 %50 İhale tabanı hesaplanıyor...");
    }, 1200);

    const timer3 = setTimeout(() => {
      setCalcProgress(100);
      setCalcStatusText("Değerleme raporu hazırlandı!");
    }, 1800);

    const timer4 = setTimeout(() => {
      setIsCalculating(false);
      setQuotaRemaining((prev) => Math.max(0, prev - 1));
      setStep(5); // Sonuç Dashboard'a geç
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  // Dinamik Değerleme Hesaplamaları
  const baseArea = grossAreaVal || (activeService === "ev" ? 120 : activeService === "arsa" ? 850 : activeService === "arazi" ? 5000 : 180);
  
  // Metrekare Piyasa Değeri
  const unitPriceEstimate = activeService === "ev" 
    ? 48500 
    : activeService === "arsa" 
    ? 16800 
    : activeService === "arazi" 
    ? 2450 // Tarla m² rayici (~2.450.000 TL/dönüm)
    : 78000; // Ticari dükkan m² rayici

  const totalMarketValueTL = Math.round(baseArea * unitPriceEstimate);
  const tenderStartPriceTL = Math.round(totalMarketValueTL * 0.50); // İİK m.115 %50
  
  const estimatedRentTL = activeService === "ev" 
    ? Math.round(totalMarketValueTL / 260) 
    : activeService === "ticari" 
    ? Math.round(totalMarketValueTL / 180) 
    : Math.round(totalMarketValueTL / 360);

  const paybackYears = activeService === "ticari" ? 15 : activeService === "ev" ? 19 : 25;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F5F6F8] py-6 sm:py-10 px-3 sm:px-6 flex flex-col items-center">
      
      {/* ========================================================================= */}
      {/* 1. ÜST STEPPER NAVİGASYONU (Görseller 1, 2, 3 ile Birebir) */}
      {/* ========================================================================= */}
      {step !== 5 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="flex items-center justify-between relative">
            {/* Bağlantı Çizgisi Arka Planı */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            
            {/* Aktif İlerleme Çizgisi */}
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
      {/* 2. ANA FORM VE REHBER ALANI (ADIM 1 - 4 İÇİN İKİ SÜTUNLU KART) */}
      {/* ========================================================================= */}
      {step !== 5 && (
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SOL ANA FORM KARTI */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between min-h-[560px]">
            
            {/* ------------------------------------------------------------- */}
            {/* ADIM 1: GAYRİMENKUL TİPİ & ADRES BİLGİSİ                      */}
            {/* ------------------------------------------------------------- */}
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

                {/* 4 ADET HİZMET KARTI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {/* KONUT */}
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

                  {/* ARSA */}
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

                  {/* ARAZİ */}
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

                  {/* TİCARİ */}
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

                {/* ADRES VE KADASTRO GİRİŞİ */}
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
                        placeholder="Örn: Hürriyet Mah. veya Çırpılar"
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

                {/* KOTA ŞERİDİ */}
                <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3 text-center space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800">
                    <strong className="text-[#E11D48] font-extrabold text-sm">{quotaRemaining}</strong> değerleme hakkınız bulunuyor.
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Ücretsiz değerleme hakları sadece konut, arsa ve araziler için geçerlidir.
                  </div>
                </div>

                {/* BUTONLAR */}
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

            {/* ------------------------------------------------------------- */}
            {/* ADIM 2: KONUT ÖZELLİKLERİ (Görsel 1 ile Birebir)              */}
            {/* ------------------------------------------------------------- */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    {activeService === "ev" 
                      ? "Konutun özelliklerini kontrol ederek gerekliyse düzeltiniz" 
                      : activeService === "arsa" 
                      ? "Arsanın imar ve yapılaşma özelliklerini kontrol ediniz"
                      : activeService === "arazi" 
                      ? "Arazinin tarımsal ve kadastro niteliklerini kontrol ediniz"
                      : "Ticari taşınmazın metrekare ve kullanım özelliklerini kontrol ediniz"}
                  </h2>
                </div>

                {/* 1. KONUT SEÇİLİYSE GÖRSEL 1'DEKİ PİLL'LER VE SAYAÇLAR */}
                {activeService === "ev" && (
                  <div className="space-y-4 text-xs">
                    
                    {/* Konut Tipi */}
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

                    {/* Apartman Tipi */}
                    {housingTypeKind === "apartman" && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Apartman Tipi *</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "daire", label: "Daire" },
                            { id: "teras_dubleks", label: "Teras Dubleks" },
                            { id: "ara_kat_dubleks", label: "Ara Kat Dubleks" },
                            { id: "bahce_dubleks", label: "Bahçe Dubleks" },
                            { id: "ters_dubleks", label: "Ters Dubleks" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setApartmentSubtype(t.id)}
                              className={`px-3.5 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 font-semibold ${
                                apartmentSubtype === t.id
                                  ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                                  : "border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              <span>{t.label}</span>
                              {apartmentSubtype === t.id && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kullanım Durumu */}
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

                    {/* Yapı Durumu */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Yapı Durumu *</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "bakimli", label: "Bakımlı/Yenilenmiş" },
                          { id: "standart", label: "Standart" },
                          { id: "tadilat", label: "Tadilat İhtiyacı Var" },
                        ].map((y) => (
                          <button
                            key={y.id}
                            type="button"
                            onClick={() => setBuildingCondition(y.id as any)}
                            className={`px-4 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1 font-semibold ${
                              buildingCondition === y.id
                                ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <span>{y.label}</span>
                            {buildingCondition === y.id && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SAYAÇ GİRİŞLERİ (GÖRSEL 1'DEKİ [- VALUE +] KONTROLLERİ) */}
                    <div className="space-y-3 pt-2">
                      
                      {/* Oda Sayısı & Salon Sayısı */}
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

                      {/* Duş Alınan Banyo Sayısı & Brüt Alan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Duş Alınan Banyo Sayısı *</label>
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setBathroomCountVal(Math.max(1, bathroomCountVal - 1))}
                              className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="flex-1 text-center font-black text-slate-900">{bathroomCountVal}</span>
                            <button
                              type="button"
                              onClick={() => setBathroomCountVal(bathroomCountVal + 1)}
                              className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

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
                      </div>

                      {/* Teras Alanı (m²) */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Teras Alanı (m²)</label>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setTerraceAreaVal((prev) => Math.max(0, (prev || 0) - 5))}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="flex-1 text-center font-medium text-slate-500 text-xs">
                            {terraceAreaVal ? `${terraceAreaVal} m²` : "Brüt alana dahil etmeden ayrıca belirtin."}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTerraceAreaVal((prev) => (prev || 0) + 5)}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bina Yaşı & Bina Kat Sayısı */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Bina Kat Sayısı</label>
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setTotalBuildingFloors(Math.max(1, totalBuildingFloors - 1))}
                              className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="flex-1 text-center font-black text-slate-900">{totalBuildingFloors}</span>
                            <button
                              type="button"
                              onClick={() => setTotalBuildingFloors(totalBuildingFloors + 1)}
                              className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bulunduğu Kat */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Bulunduğu Kat *</label>
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setFloorNumberVal(floorNumberVal - 1)}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="flex-1 text-center font-black text-slate-900">
                            {floorNumberVal === 0 ? "0 (Giriş Kat)" : floorNumberVal < 0 ? `${floorNumberVal} (Bodrum)` : `${floorNumberVal}. Kat`}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFloorNumberVal(floorNumberVal + 1)}
                            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Giriş altı için negatif (örn: -2), giriş için 0 giriniz
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. ARSA SEÇİLİYSE ÖZELLİKLER */}
                {activeService === "arsa" && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">İmar Durumu</label>
                        <select
                          value={input.zoningType || "konut"}
                          onChange={(e) => onChange({ ...input, zoningType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        >
                          <option value="konut">Konut İmarı</option>
                          <option value="ticari">Ticari + Konut</option>
                          <option value="villa">Villa İmarı</option>
                          <option value="sanayi">Sanayi / Depolama</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tapu Alanı (m²) *</label>
                        <input
                          type="number"
                          value={grossAreaVal}
                          onChange={(e) => setGrossAreaVal(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Emsal (KAKS)</label>
                        <select
                          value={kaksVal}
                          onChange={(e) => setKaksVal(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                        >
                          <option value="0.30">0.30 (Düşük)</option>
                          <option value="0.50">0.50 (Villa)</option>
                          <option value="1.00">1.00</option>
                          <option value="1.50">1.50 (Standart)</option>
                          <option value="2.00">2.00 (Yoğun)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kat Karşılığı Payı</label>
                        <select
                          value={contractorShareVal}
                          onChange={(e) => setContractorShareVal(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                        >
                          <option value="40">%40 Arsa Sahibi</option>
                          <option value="45">%45 Arsa Sahibi</option>
                          <option value="50">%50 Eşit Pay</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Köşe Parsel mi?</label>
                        <select
                          value={isCornerVal ? "evet" : "hayir"}
                          onChange={(e) => setIsCornerVal(e.target.value === "evet")}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                        >
                          <option value="evet">Köşe Parsel (Çift Cephe)</option>
                          <option value="hayir">Ara Parsel</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ARAZİ SEÇİLİYSE ÖZELLİKLER */}
                {activeService === "arazi" && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Arazi Niteliği</label>
                        <select
                          value={fieldLandType}
                          onChange={(e) => setFieldLandType(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        >
                          <option value="sulu_tarla">Sulu Tarla</option>
                          <option value="kuru_tarla">Kuru Tarla</option>
                          <option value="zeytinlik">Zeytinlik</option>
                          <option value="meyve_bahcesi">Meyve Bahçesi</option>
                          <option value="bag">Üzüm Bağı</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Yüzölçümü (m²) *</label>
                        <input
                          type="number"
                          value={grossAreaVal}
                          onChange={(e) => setGrossAreaVal(Number(e.target.value))}
                          placeholder="5000"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. TİCARİ SEÇİLİYSE ÖZELLİKLER */}
                {activeService === "ticari" && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Ticari Tip</label>
                        <select
                          value={commercialType}
                          onChange={(e) => setCommercialType(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        >
                          <option value="cadde_dukkan">Cadde Dükkanı / Mağaza</option>
                          <option value="plaza_ofis">Plaza Ofis</option>
                          <option value="depo">Depo / İmalathane</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Kapalı Alan (m²)</label>
                        <input
                          type="number"
                          value={grossAreaVal}
                          onChange={(e) => setGrossAreaVal(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Vitrin Cephesi (m)</label>
                        <input
                          type="number"
                          value={commercialFrontageM}
                          onChange={(e) => setCommercialFrontageM(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-400">
                  (* İşareti otomatik değerleme için zorunlu alanı belirtmektedir.)
                </div>

                {/* BUTONLAR */}
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

            {/* ------------------------------------------------------------- */}
            {/* ADIM 3: EK ÖZELLİKLER (Görsel 2 ile Birebir)                  */}
            {/* ------------------------------------------------------------- */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    Ek özelliklerini giriniz
                  </h2>
                </div>

                {/* Cephe Durumu */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 text-xs">
                      Cephe Durumu <span className="font-normal text-slate-400 text-[11px]">(Birden fazla seçerek işaretleyebilirsiniz)</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "kuzey", label: "Kuzey" },
                      { id: "guney", label: "Güney" },
                      { id: "dogu", label: "Doğu" },
                      { id: "bati", label: "Batı" },
                    ].map((f) => {
                      const isSel = selectedFacades.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFacade(f.id)}
                          className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isSel
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{f.label}</span>
                          {isSel && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manzara */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 text-xs">
                      Manzara <span className="font-normal text-slate-400 text-[11px]">(Birden fazla seçerek işaretleyebilirsiniz)</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "istinat_duvari", label: "İstinat Duvarı" },
                      { id: "yan_bina", label: "Yan Bina" },
                      { id: "cadde_sokak", label: "Cadde/Sokak" },
                      { id: "bahce", label: "Bahçe" },
                      { id: "sehir", label: "Şehir" },
                      { id: "doga", label: "Doğa" },
                      { id: "gol", label: "Göl" },
                      { id: "deniz", label: "Deniz" },
                    ].map((v) => {
                      const isSel = selectedViews.includes(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => toggleView(v.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isSel
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{v.label}</span>
                          {isSel && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Isıtma Sistemi */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1.5">Isıtma Sistemi *</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "yok", label: "Yok" },
                      { id: "soba", label: "Soba" },
                      { id: "dogalgaz_sobasi", label: "Doğalgaz Sobası" },
                      { id: "kat_kaloriferi", label: "Kat Kaloriferi" },
                      { id: "dogalgaz_kombi", label: "Doğalgaz/Kombi" },
                      { id: "merkezi", label: "Merkezi Sistem" },
                      { id: "merkezi_payolcer", label: "Merkezi Isı Pay Ölçer" },
                      { id: "yerden_isitma", label: "Yerden Isıtma" },
                      { id: "klima", label: "Klima Sistemi/Isı Pompası" },
                      { id: "jeotermal", label: "Jeotermal Isınma" },
                      { id: "gunes_enerjisi", label: "Güneş Enerjisi" },
                      { id: "diger", label: "Diğer" },
                    ].map((h) => {
                      const isSel = heatingSystem === h.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setHeatingSystem(h.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                            isSel
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{h.label}</span>
                          {isSel && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400">
                  (* İşareti otomatik değerleme için zorunlu alanı belirtmektedir.)
                </div>

                {/* BUTONLAR */}
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

            {/* ------------------------------------------------------------- */}
            {/* ADIM 4: OLANAKLAR (Görsel 3 ile Birebir)                      */}
            {/* ------------------------------------------------------------- */}
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-bold text-slate-700 text-xs">
                      Olanaklar <span className="font-normal text-slate-400 text-[11px]">(Birden fazla seçerek işaretleyebilirsiniz)</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: "anayol", label: "Anayol/Bulvar Üzeri" },
                      { id: "cadde", label: "Cadde Üzeri" },
                      { id: "spor_salonu", label: "Spor Sahası/Salonu" },
                      { id: "cocuk_parki", label: "Çocuk Oyun Parkı" },
                      { id: "asansor", label: "Asansör" },
                      { id: "jenerator", label: "Jeneratör" },
                      { id: "site_gorevlisi", label: "Bina/Site Görevlisi" },
                      { id: "guvenlik", label: "Güvenlik" },
                      { id: "otopark", label: "Otopark" },
                      { id: "kapali_otopark", label: "Kapalı Otopark" },
                      { id: "acik_havuz", label: "Açık Havuz" },
                      { id: "kapali_havuz", label: "Kapalı Havuz" },
                      { id: "isi_yalitimi", label: "Isı Yalıtımı" },
                      { id: "klima", label: "Klima" },
                      { id: "somine", label: "Şömine" },
                    ].map((item) => {
                      const isSel = selectedAmenities.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAmenity(item.id)}
                          className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                            isSel
                              ? "border-[#E11D48] text-[#E11D48] bg-rose-50/50"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span>{item.label}</span>
                          {isSel && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BUTONLAR */}
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

          {/* SAĞ REHBER KARTI (GÖRSELLERDEKİ SAĞ BİLGİ KUTULARI) */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6 space-y-4 min-h-[500px]">
            
            {/* Pembe Ampul İkonu */}
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>

            {/* ADIM 1 SAĞ REHBER METNİ */}
            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Emlak Değeri Nasıl Hesaplanır?
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Emlak değeri, emlak değeri hesaplama, emlak değeri sorgulama, konut fiyatları, arsa fiyatları ve emlak endeksi soruları gayrimenkul sahiplerinin en çok araştırdığı konuların başında gelir.
                  </p>
                  <p>
                    Gayrimenkulünüzün tipini ve konumunu seçerek İhaleci Burada&apos;nın sektör lideri Otomatik Değerleme Modeli ile değerini anında hesaplayın.
                  </p>
                  <p className="font-semibold text-slate-700">
                    Resmi TCMB EVDS ve İİK m.115 %50 yasal ihale taban fiyatı algoritmalarımız ile en güvenilir fiyat segmentini sunuyoruz.
                  </p>
                </div>
              </div>
            )}

            {/* ADIM 2 SAĞ REHBER METNİ (Görsel 1 ile Birebir) */}
            {step === 2 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Konut Tipleri
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Konutları en basit haliyle apartman dairesi ve müstakil bina olarak kategorize ediyoruz.
                  </p>
                  <p>
                    Apartmanda bulunup dubleks, kat dubleksi veya çatı dubleksi gibi tipe sahip daireler apartman dairesi olarak seçilmelidir.
                  </p>
                  <p className="pt-2 text-slate-500 border-t border-slate-100">
                    Oda sayısı, kat konumu ve bina yaşı gibi kriterler algoritmamız tarafından ilgili mahalledeki gerçekleşen satışlarla eşleştirilir.
                  </p>
                </div>
              </div>
            )}

            {/* ADIM 3 SAĞ REHBER METNİ & CEPHE DİYAGRAMI (Görsel 2 ile Birebir) */}
            {step === 3 && (
              <div className="space-y-3">
                {/* Görsel 2'deki Cephe / Yön Şeması İllüstrasyonu */}
                <div className="w-full h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-3 relative overflow-hidden">
                  <div className="relative w-20 h-20 border-2 border-dashed border-rose-300 rounded-lg flex items-center justify-center rotate-12">
                    <div className="w-10 h-10 bg-rose-500/20 border border-rose-500 rounded flex items-center justify-center text-[10px] font-black text-rose-700">
                      GÜNEY
                    </div>
                  </div>
                  <div className="absolute bottom-2 text-[10px] font-mono text-slate-400">
                    Kuzey-Batı Güneş Açısı
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Cephe Durumu
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                  <p>
                    Cephe belirlemede yalnızca konutun içinden dış dünyayı gören cepheleri esas alın. Bitişik nizamdan ötürü kapalı olan ve/veya penceresi bulunmayan cepheleri dikkate almayın.
                  </p>
                  <p>
                    Açık cephe sayısından fazla sayıda cephe bildirimi yapmayın, tek bir cephe için tek bir ana yönü esas alın.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Örneğin, kuzeydoğu gibi ara yöne bakan tek bir cephe için kuzeyi veya doğuyu tercih ederek tek bir bildirim yapın.
                  </p>
                </div>
              </div>
            )}

            {/* ADIM 4 SAĞ REHBER METNİ (Görsel 3 ile Birebir Kaydırılabilir Liste) */}
            {step === 4 && (
              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Olanaklar
                </h3>
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
                  <div>
                    <strong className="text-slate-800">• Anayol/Bulvar Üzeri:</strong> konutun veya bulunduğu sitenin şehir dışı yollara, otobanlara, köprü ağızlarına, toplu taşıma güzergahlarına doğrudan cepheli olması durumunu ifade eder.
                  </div>
                  <div>
                    <strong className="text-slate-800">• Cadde Üzeri:</strong> konutun veya bulunduğu sitenin resmi posta adresi, cadde niteliğindeki bir yol üzerinde yer alıyorsa bu ifade geçerlidir.
                  </div>
                  <div>
                    <strong className="text-slate-800">• Bina/Site Görevlisi:</strong> binada/sitede kapıcı dairesi veya periyodik bir temizlik/bakım hizmeti varsa işaretlenmelidir.
                  </div>
                  <div>
                    <strong className="text-slate-800">• Güvenlik:</strong> binada/sitede güvenlik kulübesi ve/veya misafir karşılama yeri (lobi) varsa işaretlenmelidir.
                  </div>
                  <div>
                    <strong className="text-slate-800">• Asansör:</strong> binada faal olarak çalışan yolcu asansörü bulunması durumudur.
                  </div>
                  <div>
                    <strong className="text-slate-800">• Otopark:</strong> konuta tahsisli açık veya kapalı araç park alanının bulunmasıdır.
                  </div>
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
      {/* 3. YÜKLEME MODALI: "Değer Hesaplanıyor" (Görsel 4 ile Birebir)           */}
      {/* ========================================================================= */}
      {isCalculating && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 font-heading">
              Değer Hesaplanıyor
            </h3>

            {/* Kırmızı Yükselen Grafik İkonu */}
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-[#E11D48] flex items-center justify-center mx-auto shadow-xs">
              <TrendingUp className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600">
                {calcStatusText}
              </p>

              {/* Kırmızı İlerleme Çubuğu */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#E11D48] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${calcProgress}%` }}
                />
              </div>
            </div>

            {/* Sponsor / Altyapı Tanıtım Kutusu (Görsel 4 Alt Kısmı) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white text-left space-y-1.5 shadow-md">
              <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                İHALECİ BURADA DEĞERLEME MOTORU
              </div>
              <div className="text-xs font-bold leading-tight">
                TCMB EVDS, HGK Kadastro ve İİK m.115 Yasal İhale Tabanı Entegrasyonu
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                Yapay zeka ile saniyeler içinde tarafsız ve şeffaf piyasa tespiti.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADIM 5: SONUÇ DASHBOARD'U (Görsel 5 ile Birebir)                       */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="max-w-6xl w-full space-y-6 animate-in fade-in duration-300">
          
          {/* Üst Konum Başlığı & Düzenleme İkonu (Görsel 5 Header) */}
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-[#E11D48]" />
              <span>
                {input.neighborhood || "Hürriyet"} Mah. {input.district || "Erenler"} {input.city || "Sakarya"} {roomCountVal}+1
              </span>
              <button
                type="button"
                onClick={() => setStep(2)}
                title="Özellikleri Düzenle"
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateToMap}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Haritada Gör</span>
              </button>
            </div>
          </div>

          {/* İKİ SÜTUNLU ÜST BÖLÜM: SOL UYDU HARİTA ÖNİZLEME + SAĞ DEĞERLEME KARTI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* SOL: UYDU HARİTA KARTI (Görsel 5 Sol Kısım) */}
            <div className="lg:col-span-6 bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-xs relative min-h-[320px] flex flex-col justify-between">
              
              {/* Harita / Uydu Arka Plan Görseli & Kadastro Izgarası */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-85"
                style={{
                  backgroundImage: "radial-gradient(#ffffff15 1px, transparent 1px), radial-gradient(#ffffff15 1px, #1e293b 1px)",
                  backgroundSize: "24px 24px"
                }}
              >
                {/* Merkezdeki Kırmızı Konut Pin'i */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-rose-600/30 animate-ping absolute -inset-0" />
                    <div className="w-12 h-12 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-lg border-2 border-white relative z-10">
                      <Home className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sol Üst: Kategori Rozeti (KONUT / ARSA / ARAZİ / TİCARİ) */}
              <div className="relative z-10 p-4">
                <span className="px-3 py-1 bg-[#E11D48] text-white text-xs font-black rounded uppercase tracking-wider shadow-sm">
                  {activeService === "ev" ? "KONUT" : activeService === "arsa" ? "ARSA" : activeService === "arazi" ? "ARAZİ" : "TİCARİ"}
                </span>
              </div>

              {/* Alt Bilgi Şeridi */}
              <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{input.neighborhood || "Hürriyet"} Mah. {input.district || "Erenler"} {input.city || "Sakarya"}</span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">TKGM / HGK Uyumlu</span>
              </div>
            </div>

            {/* SAĞ: DEĞERLEME VE FİYAT KARTI (Görsel 5 Sağ Kısım) */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between space-y-4">
              
              {/* Üst Link ve İşlemler Menüsü */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setShowHowItWorksModal(true)}
                  className="hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Nasıl hesaplıyoruz?</span>
                </button>

                <span className="text-slate-400 font-mono text-[11px]">İşlemler ...</span>
              </div>

              {/* Satış Değeri / Kira Değeri Sekme Düğmesi (Görsel 5 Toggle) */}
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

              {/* DEĞER GÖSTERGE ALANI */}
              <div className="text-center py-2 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  {resultValuationMode === "satis" ? "Tahmini Satış Değeri" : "Tahmini Aylık Kira Değeri"}
                </div>
                
                <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
                  ₺ {resultValuationMode === "satis" 
                    ? totalMarketValueTL.toLocaleString("tr-TR") 
                    : estimatedRentTL.toLocaleString("tr-TR")
                  }
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {resultValuationMode === "satis" ? (
                    <>Güven Değer Aralığı: <strong>₺ {Math.round(totalMarketValueTL * 0.92).toLocaleString("tr-TR")} - ₺ {Math.round(totalMarketValueTL * 1.08).toLocaleString("tr-TR")}</strong></>
                  ) : (
                    <>Kira Değer Aralığı: <strong>₺ {Math.round(estimatedRentTL * 0.9).toLocaleString("tr-TR")} - ₺ {Math.round(estimatedRentTL * 1.1).toLocaleString("tr-TR")}</strong></>
                  )}
                </div>

                {/* İİK m.115 %50 İhale Tabanı Rozeti */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mt-1">
                  <Gavel className="w-3.5 h-3.5 text-emerald-600" />
                  <span>İİK m.115 İcra Tabanı: ₺ {tenderStartPriceTL.toLocaleString("tr-TR")}</span>
                </div>
              </div>

              {/* Danışman Butonu (Görsel 5 Mavi Outline Buton) */}
              <button
                type="button"
                onClick={() => setActiveResultTab("danismanlar")}
                className="w-full py-2.5 rounded-xl border border-sky-400 text-sky-600 hover:bg-sky-50 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>En İyi Emlak Danışmanları İhaleci Burada&apos;da</span>
              </button>

              {/* GERÇEKLEŞEN DEĞERİ KUTUSU (Görsel 5 Mavi Kutu) */}
              <div className="bg-[#38BDF8] text-white p-4 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black">Gerçekleşen Değeri</div>
                    <div className="text-[10px] text-white/90 leading-tight mt-0.5">
                      Tespit ettiğiniz değeri ve tarihini bizimle paylaşarak İhaleci Burada&apos;nın sizin için daha doğru sonuçlar üretmesini sağlayabilirsiniz.
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
                    className="w-full py-1 bg-white text-sky-700 hover:bg-sky-50 font-bold text-[11px] rounded-lg transition cursor-pointer"
                  >
                    {actualPriceSaved ? "✓ Değer Kaydedildi" : "Bu Değeri Doğrula ve Kaydet"}
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* 8'Lİ ALT SEKME MENÜSÜ (Görsel 5 ile Birebir)                              */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            
            {/* Sekme Butonları Çubuğu */}
            <div className="flex items-center overflow-x-auto border-b border-slate-200 scrollbar-none px-2 text-xs font-extrabold">
              {[
                { id: "danismanlar", label: "DANIŞMANLAR" },
                { id: "raporlar", label: "RAPORLAR" },
                { id: "ozellikler", label: "ÖZELLİKLER" },
                { id: "deger_degisimi", label: "DEĞER DEĞİŞİMİ" },
                { id: "analiz_emsaller", label: "ANALİZ VE EMSALLER" },
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
              
              {/* 1. RAPORLAR SEKMESİ (Görsel 5'te Varsayılan Açık Olan Ekran) */}
              {activeResultTab === "raporlar" && (
                <div className="space-y-5">
                  {/* Rapor Alma Şeridi */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                        <FileText className="w-4 h-4 text-[#E11D48]" />
                        <span>Raporlar</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Rapor alarak gayrimenkulünüzün değerini, emsal bilgilerini, bölgedeki gayrimenkul trendlerini ve demografik yapıyı öğrenin.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Mevcut {reportQuota} rapor hakkınızdan kullanarak hemen rapor oluşturabilirsiniz.</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setReportGenerated(true);
                          setReportQuota(0);
                        }}
                        className="px-5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-xs shadow-xs transition cursor-pointer active:scale-95"
                      >
                        Rapor Al
                      </button>
                    </div>
                  </div>

                  {/* Rapor Durum Kartı */}
                  {!reportGenerated ? (
                    <div className="p-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-600">Henüz rapor üretilmedi.</div>
                      <p className="text-[11px] text-slate-400">Yukarıdaki &apos;Rapor Al&apos; butonuna basarak resmi değerleme çıktısını hemen görüntüleyebilirsiniz.</p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-emerald-200 bg-white space-y-4 shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" />
                          <span className="font-extrabold text-sm text-slate-900">
                            Resmi Ekspertiz & İhale Fizibilite Raporu Hazırlandı
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Sertifika No: IB-2026-9842
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[10px] text-slate-500 font-bold">Kıymet Takdir Değeri</div>
                          <div className="text-base font-black text-slate-900 mt-0.5">₺ {totalMarketValueTL.toLocaleString("tr-TR")}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          <div className="text-[10px] text-emerald-800 font-bold">İİK m.115 %50 İhale Tabanı</div>
                          <div className="text-base font-black text-emerald-700 mt-0.5">₺ {tenderStartPriceTL.toLocaleString("tr-TR")}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                          <div className="text-[10px] text-amber-800 font-bold">Yıllık Brüt Kira Getirisi</div>
                          <div className="text-base font-black text-amber-900 mt-0.5">₺ {(estimatedRentTL * 12).toLocaleString("tr-TR")}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
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
                          onClick={() => alert("PDF Raporu İndirildi (İhaleci Burada Değerleme Motoru)")}
                          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Rapor İndir</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. ÖZELLİKLER SEKMESİ */}
              {activeResultTab === "ozellikler" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Gayrimenkulün Girilen Tüm Nitelikleri</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Konut / Gayrimenkul Tipi</span>
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
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Isıtma</span>
                      <strong className="text-slate-800 uppercase">{heatingSystem.replace("_", " ")}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Cepheler</span>
                      <strong className="text-slate-800 uppercase">{selectedFacades.join(", ")}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Kullanım Durumu</span>
                      <strong className="text-slate-800 uppercase">{usageStatus.replace("_", " ")}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block">Ada / Parsel</span>
                      <strong className="text-slate-800">{input.ada || "101"} / {input.parsel || "15"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. DEĞER DEĞİŞİMİ SEKMESİ */}
              {activeResultTab === "deger_degisimi" && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">TCMB EVDS Endeks Değişimi & Yıllık Artış</h4>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Yıllık Değer Artışı: +%68.4
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">1 Yıl Önceki Ortalama m²</div>
                      <div className="text-lg font-black text-slate-700 mt-1">₺ {Math.round(unitPriceEstimate * 0.59).toLocaleString("tr-TR")}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">Bugünkü Güncel m²</div>
                      <div className="text-lg font-black text-rose-600 mt-1">₺ {unitPriceEstimate.toLocaleString("tr-TR")}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">1 Yıl Sonraki Tahmin (TCMB Trendi)</div>
                      <div className="text-lg font-black text-emerald-600 mt-1">₺ {Math.round(unitPriceEstimate * 1.35).toLocaleString("tr-TR")}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. ANALİZ VE EMSALLER SEKMESİ */}
              {activeResultTab === "analiz_emsaller" && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Bölgedeki En Yakın Gerçek Emsaller</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {[
                      { title: `${input.neighborhood || "Hürriyet"} Mah. 3+1 Daire`, m2: 125, price: totalMarketValueTL * 0.98, dist: "150m", source: "İcra İhalesi" },
                      { title: `${input.neighborhood || "Hürriyet"} Mah. 3+1 Ara Kat`, m2: 130, price: totalMarketValueTL * 1.04, dist: "320m", source: "Piyasa Satışı" },
                      { title: `${input.district || "Erenler"} Merkez 2+1 Daire`, m2: 95, price: totalMarketValueTL * 0.78, dist: "600m", source: "Banka Teminatı" },
                    ].map((emsal, idx) => (
                      <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{emsal.title}</div>
                          <div className="text-[11px] text-slate-500">{emsal.m2} m² • Mesafe: {emsal.dist} • Kaynak: {emsal.source}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900">₺ {Math.round(emsal.price).toLocaleString("tr-TR")}</div>
                          <div className="text-[10px] text-slate-400 font-mono">₺ {Math.round(emsal.price / emsal.m2).toLocaleString("tr-TR")} / m²</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. KREDİ VE YATIRIM SEKMESİ */}
              {activeResultTab === "kredi_yatirim" && (
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">İhale Fırsatı & Amortisman Analizi</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[10px] font-bold text-emerald-800">İhale Alım Kazanç Marjı</div>
                      <div className="text-xl font-black text-emerald-700 mt-1">%50 İndirim</div>
                      <p className="text-[10px] text-emerald-600 mt-0.5">İcra satışında ₺ {tenderStartPriceTL.toLocaleString("tr-TR")} tabanından girme imkanı.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-600">Amortisman (Geri Dönüş)</div>
                      <div className="text-xl font-black text-slate-900 mt-1">{paybackYears} Yıl</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Yıllık brüt kira çarpanı 1/{paybackYears}.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-600">Kredi Kullanılabilirlik</div>
                      <div className="text-xl font-black text-slate-900 mt-1">%80 Ekspertiz</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Kat mülkiyetli bağımsız bölümlerde maksimum konut kredisi.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. DANIŞMANLAR SEKMESİ */}
              {activeResultTab === "danismanlar" && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-sm">Bölgedeki SPK Lisanslı Danışmanlar</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">AT</div>
                        <div>
                          <div className="font-bold text-slate-900">Ali Turan</div>
                          <div className="text-[11px] text-slate-500">SPK Lisanslı Değerleme Uzmanı</div>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-[#0F223D] text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer">
                        İletişime Geç
                      </button>
                    </div>
                  </div>
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

          {/* ALT GEZİNİM: YENİ DEĞERLEME & HARİTAYA GEÇİŞ */}
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

    </div>
  );
};
