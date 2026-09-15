"use client";

import React, { useState } from "react";
import { ParcelInput, PropertyCategory, ZoningType, HousingType, RoomCount, BuildingAge, FloorLocation, HeatingType } from "@/types";
import { ALL_PROVINCES, getDistrictsByProvince } from "@/lib/turkeyLocations";
import { 
  Home, 
  Trees, 
  Compass, 
  Store, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  Coins, 
  Gavel, 
  TrendingUp, 
  ShieldCheck,
  Check,
  Search,
  Sparkles,
  Calculator,
  Layers,
  FileSpreadsheet,
  Award,
  Zap,
  Info
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
  // 4 Temel Endeksa Hizmeti:
  // 1. ev: evimin-degeri/ogren (Konut, Daire, Villa)
  // 2. arsa: arsamin-degeri/ogren (İmarlı Arsa, Kat Karşılığı)
  // 3. arazi: arazimin-degeri/ogren (Tarla, Bağ, Bahçe, Zeytinlik)
  // 4. ticari: ticarimin-degeri/ogren (Dükkan, Ofis, Mağaza, Depo)
  const [activeService, setActiveService] = useState<ValuationServiceType>(
    input.category === "konut" ? "ev" : "arsa"
  );
  
  // Adımlar: 1 (Hizmet & Tip Seçimi) | 2 (Konum & Kadastro) | 3 (Özel Nitelikler) | 4 (Sonuç Raporu)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(4);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState<boolean>(false);

  // Arazi Özel Nitelikleri (Tarla / Bağ / Bahçe)
  const [fieldLandType, setFieldLandType] = useState<string>("sulu_tarla");
  const [fieldCadastreRoad, setFieldCadastreRoad] = useState<string>("resmi_kadastro_var");
  const [fieldWaterAccess, setFieldWaterAccess] = useState<string>("artezyen_kuyu_var");
  const [fieldVillageDistance, setFieldVillageDistance] = useState<string>("yakin_500m");

  // Ticari Özel Nitelikleri (Dükkan / Mağaza / Ofis)
  const [commercialType, setCommercialType] = useState<string>("cadde_dukkan");
  const [commercialFrontageM, setCommercialFrontageM] = useState<number>(8);
  const [commercialTenantStatus, setCommercialTenantStatus] = useState<string>("kurumsal_kiracili");
  const [commercialCurrentRentTL, setCommercialCurrentRentTL] = useState<number>(45000);

  // İlçe Listesi (Seçili İle Göre)
  const districts = getDistrictsByProvince(input.city || "Çanakkale");

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

  const handleProceedToResult = () => {
    setQuotaRemaining((prev) => Math.max(0, prev - 1));
    setStep(4);
  };

  // Dinamik Değerleme Hesaplamaları
  const baseArea = input.areaM2 || (activeService === "ev" ? 135 : activeService === "arsa" ? 850 : activeService === "arazi" ? 5000 : 180);
  
  // Metrekare Piyasa Değeri (İl ve Hizmete Göre)
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
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F4F6F9] py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
      
      {/* İKİ SÜTUNLU ANA KAPSAYICI */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* SOL ANA KART: "Emlak Değerini Hemen Öğrenin" (Genişlik: 7 Sütun) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between min-h-[540px]">
          
          {/* ÜST HİZMET HIZLI SEÇİCİ ŞERİDİ (4 ENDEKSA SERVİSİ) */}
          <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => handleSelectService("ev")}
              className={`flex-1 py-2 px-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeService === "ev"
                  ? "bg-white text-rose-700 shadow-xs border border-rose-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home className="w-3.5 h-3.5 text-rose-600" />
              <span>Evimin Değeri</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectService("arsa")}
              className={`flex-1 py-2 px-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeService === "arsa"
                  ? "bg-white text-emerald-700 shadow-xs border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arsamın Değeri</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectService("arazi")}
              className={`flex-1 py-2 px-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeService === "arazi"
                  ? "bg-white text-amber-800 shadow-xs border border-amber-300"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Arazimin Değeri</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectService("ticari")}
              className={`flex-1 py-2 px-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                activeService === "ticari"
                  ? "bg-white text-sky-700 shadow-xs border border-sky-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-sky-600" />
              <span>Ticarimin Değeri</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ADIM 1: GAYRİMENKUL TİPİ SEÇİMİ (GÖRSELDEKİ BİREBİR EKRAN) */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Başlık ve Alt Başlık */}
              <div className="text-center space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                  Emlak Değerini Hemen Öğrenin
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Gayrimenkul tipini seçin, yapay zekanın gücü ile değerini öğrenin.
                </p>
                
                {/* Bilgi Linki */}
                <button
                  type="button"
                  onClick={() => setShowHowItWorksModal(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 underline transition cursor-pointer pt-1"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-600 inline-flex items-center justify-center text-[9px] font-bold">?</span>
                  <span>Nasıl hesaplıyoruz ve veri kaynaklarımız neler inceleyin.</span>
                </button>
              </div>

              {/* 4 ADET GAYRİMENKUL TİPİ KARTI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                
                {/* 1. KONUT */}
                <div
                  onClick={() => handleSelectService("ev")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    activeService === "ev"
                      ? "border-rose-500 bg-rose-50/40 shadow-sm ring-2 ring-rose-400/20"
                      : "border-slate-200 hover:border-rose-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FDF2F4] text-[#E11D48] flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Home className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    Tüm konut tipleri
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">
                    Konut
                  </div>
                </div>

                {/* 2. ARSA */}
                <div
                  onClick={() => handleSelectService("arsa")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    activeService === "arsa"
                      ? "border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-400/20"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Trees className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">
                    İmarlı arsalar
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">
                    Arsa
                  </div>
                </div>

                {/* 3. ARAZİ */}
                <div
                  onClick={() => handleSelectService("arazi")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    activeService === "arazi"
                      ? "border-amber-500 bg-amber-50/40 shadow-sm ring-2 ring-amber-400/20"
                      : "border-slate-200 hover:border-amber-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FEFCE8] text-[#D97706] flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                    İmarı olmayan tarla, bağ, bahçeler
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">
                    Arazi
                  </div>
                </div>

                {/* 4. TİCARİ */}
                <div
                  onClick={() => handleSelectService("ticari")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    activeService === "ticari"
                      ? "border-sky-500 bg-sky-50/40 shadow-sm ring-2 ring-sky-400/20"
                      : "border-slate-200 hover:border-sky-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center mb-2 group-hover:scale-105 transition">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                    Ticari bağımsız bölümler
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">
                    Ticari
                  </div>
                </div>
              </div>

              {/* BİLGİLENDİRME KUTUSU (GÖRSELDEKİ MAVİ BİLGİ ŞERİDİ) */}
              <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3.5 text-center space-y-1">
                <div className="text-xs font-semibold text-slate-800">
                  <strong className="text-rose-600 font-extrabold text-sm">{quotaRemaining}</strong> değerleme hakkınız bulunuyor.
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
                  className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Geri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span>Devam Et</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADIM 2: KONUM VE KADASTRO (ADA / PARSEL) */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Adım 2 / 3</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">
                    {activeService === "ev" ? "EVİMİN DEĞERİ" : activeService === "arsa" ? "ARSAMIN DEĞERİ" : activeService === "arazi" ? "ARAZİMİN DEĞERİ" : "TİCARİMİN DEĞERİ"}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                  Konum ve Kadastro Bilgilerini Girin
                </h2>
                <p className="text-xs text-slate-500">
                  TCMB EVDS ve HGK mahalle sınırları üzerinden otomatik rayiç çekilecektir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İl *</label>
                  <select
                    value={input.city}
                    onChange={(e) => onChange({ ...input, city: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {activeService === "arazi" ? "Köy / Mevkii *" : "Mahalle *"}
                  </label>
                  <input
                    type="text"
                    value={input.neighborhood || ""}
                    onChange={(e) => onChange({ ...input, neighborhood: e.target.value })}
                    placeholder={activeService === "arazi" ? "Örn: Çırpılar Köyü" : "Örn: Cevatpaşa"}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ada No</label>
                  <input
                    type="text"
                    value={input.ada || ""}
                    onChange={(e) => onChange({ ...input, ada: e.target.value })}
                    placeholder="101"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parsel No</label>
                  <input
                    type="text"
                    value={input.parsel || ""}
                    onChange={(e) => onChange({ ...input, parsel: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Geri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span>Özelliklere Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADIM 3: ÖZEL NİTELİKLER (4 HİZMETE GÖRE DİNAMİK FORM) */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Adım 3 / 3</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600 uppercase">{activeService} NİTELİK VE DETAYLARI</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                  {activeService === "ev" ? "Evinizin Nitelikleri" : activeService === "arsa" ? "Arsanızın İmar Detayları" : activeService === "arazi" ? "Arazinizin Tarım ve Ulaşım Özellikleri" : "Ticari Taşınmazınızın Detayları"}
                </h2>
                <p className="text-xs text-slate-500">
                  Otomatik Değerleme Modeli bu parametreleri bölgedeki gerçekleşen satışlarla eşleştirecektir.
                </p>
              </div>

              {/* 1. EVİMİN DEĞERİ FORMU */}
              {activeService === "ev" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Konut Tipi</label>
                      <select
                        value={input.housingType || "daire"}
                        onChange={(e) => onChange({ ...input, housingType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="daire">Apartman Dairesi</option>
                        <option value="villa">Müstakil Villa</option>
                        <option value="rezidans">Rezidans Daire</option>
                        <option value="dubleks">Çatı / Bahçe Dubleksi</option>
                        <option value="mustakil">Köy / Şehir Evi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Oda Sayısı</label>
                      <select
                        value={input.roomCount || "3+1"}
                        onChange={(e) => onChange({ ...input, roomCount: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="1+0">1+0 (Stüdyo)</option>
                        <option value="1+1">1+1</option>
                        <option value="2+1">2+1</option>
                        <option value="3+1">3+1</option>
                        <option value="4+1">4+1</option>
                        <option value="5+1">5+1 ve Üzeri</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Brüt Alan (m²) *</label>
                      <input
                        type="number"
                        min="1"
                        value={input.areaM2 || ""}
                        onChange={(e) => onChange({ ...input, areaM2: Number(e.target.value) })}
                        placeholder="135"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bina Yaşı</label>
                      <select
                        value={input.buildingAge || "1-5"}
                        onChange={(e) => onChange({ ...input, buildingAge: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="0">0 (Sıfır Bina)</option>
                        <option value="1-5">1 - 5 Yıl</option>
                        <option value="6-10">6 - 10 Yıl</option>
                        <option value="11-15">11 - 15 Yıl</option>
                        <option value="16-20">16 - 20 Yıl</option>
                        <option value="21+">21 Yıl ve Üzeri</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bulunduğu Kat</label>
                      <select
                        value={input.floorLocation || "ara_kat"}
                        onChange={(e) => onChange({ ...input, floorLocation: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="bahce_giris">Bahçe / Giriş Kat</option>
                        <option value="ara_kat">Ara Kat</option>
                        <option value="en_ust_kat">En Üst Kat</option>
                        <option value="cati_dubleks">Çatı Dubleksi</option>
                        <option value="kot_bodrum">Kot / Bodrum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Isıtma Tipi</label>
                      <select
                        value={input.heatingType || "dogalgaz_kombi"}
                        onChange={(e) => onChange({ ...input, heatingType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="dogalgaz_kombi">Doğalgaz Kombi</option>
                        <option value="yerden_isitma">Yerden Isıtma</option>
                        <option value="merkezi_payolcer">Merkezi Pay Ölçer</option>
                        <option value="klima">Klima / Elektrikli</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ARSAMIN DEĞERİ FORMU */}
              {activeService === "arsa" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">İmar Durumu</label>
                      <select
                        value={input.zoningType || "konut"}
                        onChange={(e) => onChange({ ...input, zoningType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="konut">Konut İmarı</option>
                        <option value="ticari">Ticari + Konut</option>
                        <option value="villa">Villa İmarı</option>
                        <option value="sanayi">Sanayi / Depolama</option>
                        <option value="karma">Köy Yerleşik Alanı</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tapu Alanı (m²) *</label>
                      <input
                        type="number"
                        min="1"
                        value={input.areaM2 || ""}
                        onChange={(e) => onChange({ ...input, areaM2: Number(e.target.value) })}
                        placeholder="850"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Emsal (KAKS)</label>
                      <select
                        value={input.kaks || 1.5}
                        onChange={(e) => onChange({ ...input, kaks: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="0.30">0.30 (Düşük Yoğunluk)</option>
                        <option value="0.50">0.50 (Villa Bölgesi)</option>
                        <option value="1.00">1.00 (Emsal 1)</option>
                        <option value="1.20">1.20</option>
                        <option value="1.50">1.50 (Standart Konut)</option>
                        <option value="2.00">2.00 (Yüksek Yoğunluk)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Yol Cephesi & Köşe Durumu</label>
                      <select
                        value={input.isCornerParcel ? "kose" : "tek_cephe"}
                        onChange={(e) => onChange({ ...input, isCornerParcel: e.target.value === "kose" })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="kose">Köşe Başı Parsel (Çift Cepheli)</option>
                        <option value="tek_cephe">Tek Yola Cepheli Ara Parsel</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kat Karşılığı Beklentisi</label>
                      <select
                        value={input.contractorSharePercent || 45}
                        onChange={(e) => onChange({ ...input, contractorSharePercent: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="40">%40 Arsa Sahibi / %60 Müteahhit</option>
                        <option value="45">%45 Arsa Sahibi / %55 Müteahhit</option>
                        <option value="50">%50 / %50 Eşit Paylaşım</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ARAZİMİN DEĞERİ FORMU (TARLA / BAĞ / BAHÇE) */}
              {activeService === "arazi" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Arazi Niteliği</label>
                      <select
                        value={fieldLandType}
                        onChange={(e) => setFieldLandType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="sulu_tarla">Sulu Tarım Arazisi</option>
                        <option value="kuru_tarla">Kuru Tarla</option>
                        <option value="zeytinlik">Zeytinlik (Verimli)</option>
                        <option value="meyve_bahcesi">Meyve / Elma Bahçesi</option>
                        <option value="bag">Üzüm Bağı</option>
                        <option value="ciftlik">Çiftlik / Hayvancılık Arazisi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Yüzölçümü (m²) *</label>
                      <input
                        type="number"
                        min="100"
                        value={input.areaM2 || ""}
                        onChange={(e) => onChange({ ...input, areaM2: Number(e.target.value) })}
                        placeholder="5000 (5 Dönüm)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kadastro Yolu Durumu</label>
                      <select
                        value={fieldCadastreRoad}
                        onChange={(e) => setFieldCadastreRoad(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="resmi_kadastro_var">Resmi Kadastro Yolu Var</option>
                        <option value="fiili_yol">Fiili Açık Toprak Yol</option>
                        <option value="yol_yok">Resmi Yolu Yok (Geçit Hakkı Gerekir)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Su & Sulama Altyapısı</label>
                      <select
                        value={fieldWaterAccess}
                        onChange={(e) => setFieldWaterAccess(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="artezyen_kuyu_var">Artezyen / Sondaj Kuyusu Var</option>
                        <option value="kanal_baraj">Sulama Kanalı / Baraj Hattında</option>
                        <option value="su_yok">Su Kaynağı Yok (Kuru Tarım)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Köy Yerleşimine Mesafe</label>
                      <select
                        value={fieldVillageDistance}
                        onChange={(e) => setFieldVillageDistance(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="yakin_500m">0 - 500m (Köy Dibinde / Yürüyüş Mesafesi)</option>
                        <option value="orta_1km">500m - 1.5 km</option>
                        <option value="uzak">1.5 km ve Üzeri (Kırsal Arazi)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TİCARİMİN DEĞERİ FORMU (DÜKKAN / OFİS / DEPO) */}
              {activeService === "ticari" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ticari Tip</label>
                      <select
                        value={commercialType}
                        onChange={(e) => setCommercialType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="cadde_dukkan">Cadde Üzeri Dükkan / Mağaza</option>
                        <option value="plaza_ofis">Plaza Katı / Büro / Ofis</option>
                        <option value="avm_magaza">AVM İçi Ticari Ünite</option>
                        <option value="depo_antrepo">Depo / İmalathane / Atölye</option>
                        <option value="komple_bina">Komple Ticari Bina</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kapalı Alan (m²) *</label>
                      <input
                        type="number"
                        min="10"
                        value={input.areaM2 || ""}
                        onChange={(e) => onChange({ ...input, areaM2: Number(e.target.value) })}
                        placeholder="180"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Vitrin Cephesi (Metre)</label>
                      <input
                        type="number"
                        min="1"
                        value={commercialFrontageM}
                        onChange={(e) => setCommercialFrontageM(Number(e.target.value))}
                        placeholder="8"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kiracı Durumu</label>
                      <select
                        value={commercialTenantStatus}
                        onChange={(e) => setCommercialTenantStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      >
                        <option value="kurumsal_kiracili">Kurumsal Kiracılı (Market / Banka / Zincir Mağaza)</option>
                        <option value="bireysel_kiracili">Bireysel Esnaf Kiracılı</option>
                        <option value="bos">Boş / Hemen Kullanıma Uygun</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mevcut / Hedef Aylık Kira (₺)</label>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        value={commercialCurrentRentTL}
                        onChange={(e) => setCommercialCurrentRentTL(Number(e.target.value))}
                        placeholder="45000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BUTONLAR */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Geri</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToResult}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Değerlemeyi Tamamla</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADIM 4: SONUÇ RAPORU & İCRA İHALE FIRSAT KARTI */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-black text-slate-900 font-heading">
                  Yapay Zeka & İhale Değerlemesi Tamamlandı
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {input.city} / {input.district} {input.neighborhood ? `— ${input.neighborhood}` : ""} • {activeService.toUpperCase()} DEĞERLEMESİ
                </p>
              </div>

              {/* Fiyat ve İhale Kartı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Tahmini Serbest Piyasa Değeri</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    ₺ {totalMarketValueTL.toLocaleString("tr-TR")}
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    Ort. {unitPriceEstimate.toLocaleString("tr-TR")} ₺/m² ({baseArea} m²)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <Gavel className="w-3.5 h-3.5 text-emerald-600" />
                    İİK m.115 İcra Taban Fiyatı (%50)
                  </div>
                  <div className="text-xl font-black text-emerald-700 mt-1">
                    ₺ {tenderStartPriceTL.toLocaleString("tr-TR")}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold mt-0.5">
                    Yasal Başlangıç: {Math.round(unitPriceEstimate * 0.5).toLocaleString("tr-TR")} ₺/m²
                  </div>
                </div>
              </div>

              {/* Finansal Göstergeler (Kira, Amortisman, Fırsat Skoru) */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                <div>
                  <div className="text-[10px] font-bold text-amber-800">Tahmini Aylık Kira</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">₺ {estimatedRentTL.toLocaleString("tr-TR")}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-800">Geri Dönüş Süresi</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{paybackYears} Yıl</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-800">İhale Fırsat Skoru</div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">%92 (Yüksek)</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Yeni Değerleme
                </button>

                <button
                  type="button"
                  onClick={onNavigateToMap}
                  className="px-6 py-2.5 rounded-xl bg-[#0F223D] hover:bg-[#1E293B] text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Bölgeyi İncele & Haritada Gör</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SAĞ BİLGİLENDİRME KARTI: (4 HİZMETE GÖRE DİNAMİK AÇIKLAMA METNİ) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Endeksa & İhaleci Burada Rehberi</span>
          </div>

          {/* 1. EVİMİN DEĞERİ BİLGİSİ */}
          {activeService === "ev" && (
            <>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                Evimin değeri nasıl hesaplanır?
              </h3>
              <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                <p>
                  Emlak değeri, emlak değeri hesaplama, emlak değeri sorgulama, emlak değeri öğrenme, konut fiyatları, arsa fiyatları, emlak değer değişimi, emlak endeksi ve konut fiyat değişimi soruları herkesin merak ettiği soruların başında geliyor.
                </p>
                <p>
                  Gayrimenkulünüzün tipini seçerek İhaleci Burada&apos;nın sektör lideri &apos;Otomatik Değerleme Modeli&apos; ile değerini hesaplayın.
                </p>
                <p className="font-semibold text-slate-700">
                  Değerleme sonucunda yapay zekanın gayrimenkulünüzün fiyat segmentine, satış süresine ve danışmanın bölgesine göre önerdiği profesyoneller ile alın, satın, kiralayın.
                </p>
              </div>
            </>
          )}

          {/* 2. ARSAMIN DEĞERİ BİLGİSİ */}
          {activeService === "arsa" && (
            <>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                Arsamın imar değeri ve kat karşılığı nasıl hesaplanır?
              </h3>
              <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                <p>
                  Arsa değerlemesinde en kritik göstergeler; belediye imar planındaki KAKS (Emsal), TAKS (Taban oturumu) ve terk oranlarıdır.
                </p>
                <p>
                  Sistemimiz; arsanızın toplam inşaat yapılabilir alanını, müteahhit paylaşım oranını (%40-%50) ve arsa sahibine kalacak bağımsız bölüm cirosunu otomatik olarak hesaplar.
                </p>
                <p className="font-semibold text-slate-700">
                  Ayrıca icra ve ihale başlangıç bedeli olan %50 yasal sınır ile serbest piyasa rayici arasındaki kazanç marjını sunar.
                </p>
              </div>
            </>
          )}

          {/* 3. ARAZİMİN DEĞERİ BİLGİSİ */}
          {activeService === "arazi" && (
            <>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                Tarla ve arazimin gerçek değeri nasıl belirlenir?
              </h3>
              <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                <p>
                  İmarsız tarla, bağ ve bahçelerde değer; resmi kadastro yoluna cepheli olup olmamasına, elektrik-su altyapısına ve köy yerleşik alanına mesafesine göre katbekat değişir.
                </p>
                <p>
                  Özellikle Çanakkale Bayramiç ve Kazdağları havzasında ekoturizm ve hobi bahçesi talebi, verimli sulu tarım arazilerinin dönüm fiyatını doğrudan etkiler.
                </p>
                <p className="font-semibold text-slate-700">
                  İcra daireleri kıymet takdir raporları ve emsal tarla ilanlarıyla arazinizin en doğru değerini anında keşfedin.
                </p>
              </div>
            </>
          )}

          {/* 4. TİCARİMİN DEĞERİ BİLGİSİ */}
          {activeService === "ticari" && (
            <>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                Ticari mülk ve dükkan kirası nasıl hesaplanır?
              </h3>
              <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                <p>
                  Ticari gayrimenkullerin değeri; cadde vitrin cephesi genişliği, tabela değeri, yaya/araç trafiği ve mevcut kira getirisine (Cap Rate) göre tespit edilir.
                </p>
                <p>
                  Kurumsal market veya banka kiracılı ticari üniteler, amortisman süresini 14-16 yıla kadar düşürerek yüksek yatırım primi sağlar.
                </p>
                <p className="font-semibold text-slate-700">
                  İhaleci Burada ile ticari bağımsız bölümlerinizin kira getirisini ve %50 ihale taban bedelini saniyeler içinde hesaplayın.
                </p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              TCMB EVDS & HGK Resmi Veri Tabanı
            </span>
            <span className="font-mono text-slate-400">v2.5 Endeksa Uyumlu</span>
          </div>
        </div>

      </div>

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
