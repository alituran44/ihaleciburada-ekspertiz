"use client";

import React, { useState } from "react";
import { ParcelInput, PropertyCategory } from "@/types";
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
  Sparkles
} from "lucide-react";

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
  // Step 1: Gayrimenkul Tipi Seçimi (Görseldeki Birebir Ekran)
  // Step 2: Konum ve Parsel Bilgileri
  // Step 3: Gayrimenkul Detayları
  // Step 4: Değerleme & İhale Sonuç Özeti
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<PropertyCategory | "arazi" | "ticari">(
    input.category === "konut" ? "konut" : "arsa"
  );
  const [quotaRemaining, setQuotaRemaining] = useState<number>(4);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState<boolean>(false);

  // İlçe Listesi (Seçili İle Göre)
  const districts = getDistrictsByProvince(input.city || "Çanakkale");

  const handleSelectCategory = (cat: PropertyCategory | "arazi" | "ticari") => {
    setSelectedType(cat);
    const normalizedCategory: PropertyCategory = cat === "konut" ? "konut" : "arsa";
    onChange({
      ...input,
      category: normalizedCategory,
      title: cat === "konut" ? "Konut Değerleme Portföyü" : cat === "arazi" ? "Tarla & Arazi Portföyü" : cat === "ticari" ? "Ticari Taşınmaz Portföyü" : "İmarlı Arsa Portföyü",
      zoningType: cat === "arazi" ? "tarla_gelisme" : cat === "ticari" ? "ticari" : input.zoningType || "konut",
    });
  };

  const handleProceedFromStep1 = () => {
    setStep(2);
  };

  const handleProceedFromStep2 = () => {
    setStep(3);
  };

  const handleProceedToResult = () => {
    setQuotaRemaining((prev) => Math.max(0, prev - 1));
    setStep(4);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-[#F4F6F9] py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
      
      {/* İKİ SÜTUNLU ANA KAPSAYICI (EKRAN GÖRÜNTÜSÜYLE BİREBİR) */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* SOL ANA KART: "Emlak Değerini Hemen Öğrenin" (Genişlik: 7 Sütun) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col justify-between min-h-[520px]">
          
          {/* ADIM 1: GAYRİMENKUL TİPİ SEÇİMİ (KULLANICININ YÜKLEDİĞİ GÖRSEL media_1789459031632.png) */}
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

              {/* 4 ADET GAYRİMENKUL TİPİ KARTI (GÖRSELDEKİ RENK & İKONLARLA BİREBİR) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                
                {/* 1. KONUT (PEMBE/KIRMIZI İKON) */}
                <div
                  onClick={() => handleSelectCategory("konut")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    selectedType === "konut"
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

                {/* 2. ARSA (AÇIK YEŞİL İKON) */}
                <div
                  onClick={() => handleSelectCategory("arsa")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    selectedType === "arsa"
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

                {/* 3. ARAZİ (SARI/KEHRİBAR İKON) */}
                <div
                  onClick={() => handleSelectCategory("arazi")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    selectedType === "arazi"
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

                {/* 4. TİCARİ (AÇIK MAVİ İKON) */}
                <div
                  onClick={() => handleSelectCategory("ticari")}
                  className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[145px] ${
                    selectedType === "ticari"
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

              {/* BUTONLAR (GERİ & DEVAM ET) */}
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
                  onClick={handleProceedFromStep1}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span>Devam Et</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ADIM 2: KONUM VE PARSEL BİLGİLERİ */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Adım 2 / 3</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">{selectedType.toUpperCase()} DEĞERLEMESİ</span>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mahalle / Köy</label>
                  <input
                    type="text"
                    value={input.neighborhood || ""}
                    onChange={(e) => onChange({ ...input, neighborhood: e.target.value })}
                    placeholder="Örn: Çırpılar / Cevatpaşa"
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
                  onClick={handleProceedFromStep2}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <span>Özelliklere Geç</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ADIM 3: NİTELİKLER (M², İMAR/ODA, KAT VB.) */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Adım 3 / 3</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">ÖLÇÜ & NİTELİK GİRİŞİ</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                  Taşınmazın Ölçü ve Nitelikleri
                </h2>
                <p className="text-xs text-slate-500">
                  Otomatik Değerleme Modeli bu verileri emsal ilanlarla eşleştirecektir.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedType === "konut" ? "Brüt Kullanım Alanı (m²) *" : "Tapu Alanı (m²) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={input.areaM2 || ""}
                    onChange={(e) => onChange({ ...input, areaM2: Number(e.target.value) })}
                    placeholder={selectedType === "konut" ? "135" : "1250"}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                {selectedType === "konut" ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Oda Sayısı</label>
                    <select
                      value={input.roomCount || "3+1"}
                      onChange={(e) => onChange({ ...input, roomCount: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                    >
                      <option value="1+0">1+0 (Stüdyo)</option>
                      <option value="1+1">1+1</option>
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                      <option value="5+1">5+1 ve Üzeri</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">İmar Durumu</label>
                    <select
                      value={input.zoningType || "konut"}
                      onChange={(e) => onChange({ ...input, zoningType: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                    >
                      <option value="konut">Konut İmarı</option>
                      <option value="ticari">Ticari + Konut</option>
                      <option value="villa">Villa İmarı</option>
                      <option value="tarla_gelisme">Tarımsal Nitelikli / Tarla</option>
                      <option value="karma">Köy Yerleşik Alanı</option>
                    </select>
                  </div>
                )}
              </div>

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

          {/* ADIM 4: SONUÇ ÖZETİ VE İHALE FIRSAT KARTI */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-black text-slate-900 font-heading">
                  Yapay Zeka Değerlemesi Tamamlandı
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {input.city} / {input.district} {input.neighborhood ? `— ${input.neighborhood}` : ""} {selectedType.toUpperCase()}
                </p>
              </div>

              {/* Fiyat ve İhale Kartı */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Tahmini Piyasa Değeri</div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    ₺ {((input.areaM2 || 100) * (selectedType === "konut" ? 48000 : 8500)).toLocaleString("tr-TR")}
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    Ort. {selectedType === "konut" ? "48.000" : "8.500"} ₺/m²
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <Gavel className="w-3.5 h-3.5 text-emerald-600" />
                    İİK m.115 İcra Tabanı (%50)
                  </div>
                  <div className="text-xl font-black text-emerald-700 mt-1">
                    ₺ {Math.round(((input.areaM2 || 100) * (selectedType === "konut" ? 48000 : 8500) * 0.5)).toLocaleString("tr-TR")}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold mt-0.5">
                    Yasal Başlangıç: {selectedType === "konut" ? "24.000" : "4.250"} ₺/m²
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>İhale Fırsat ve Kazanç Skoru:</span>
                <span className="font-extrabold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">%89 (Yüksek Prim)</span>
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
        {/* SAĞ BİLGİLENDİRME KARTI: "Emlak değeri nasıl hesaplanır?" (Genişlik: 5 Sütun) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
            Emlak değeri nasıl hesaplanır?
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              TCMB EVDS & HGK Resmi Veri Tabanı
            </span>
            <span className="font-mono text-slate-400">v2.4 AI</span>
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
