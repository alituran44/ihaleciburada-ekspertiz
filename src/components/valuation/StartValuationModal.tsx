"use client";

import React, { useState } from "react";
import { 
  MapPin, 
  Search, 
  X, 
  Building, 
  Building2, 
  Trees, 
  Store, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Layers
} from "lucide-react";
import { TURKEY_PROVINCES_AND_DISTRICTS, getProvinceCoordinates } from "@/lib/turkeyLocations";

export interface StartValuationPayload {
  category: "konut" | "arsa" | "arazi" | "ticari";
  city: string;
  district: string;
  neighborhood: string;
  ada: string;
  parsel: string;
  areaM2: number;
  tapuNiteligi: string;
  coordinates?: { lat: number; lng: number };
}

interface StartValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: StartValuationPayload) => void;
  initialCity?: string;
  initialDistrict?: string;
  initialNeighborhood?: string;
  initialAda?: string;
  initialParsel?: string;
  initialAreaM2?: number;
  initialCategory?: "konut" | "arsa" | "arazi" | "ticari";
}

export const StartValuationModal: React.FC<StartValuationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCity = "Çanakkale",
  initialDistrict = "Merkez",
  initialNeighborhood = "Sarıbeyli Köyü",
  initialAda = "1357",
  initialParsel = "4",
  initialAreaM2 = 1250,
  initialCategory = "arazi",
}) => {
  const [category, setCategory] = useState<"konut" | "arsa" | "arazi" | "ticari">(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [district, setDistrict] = useState(initialDistrict);
  const [neighborhood, setNeighborhood] = useState(initialNeighborhood);
  const [ada, setAda] = useState(initialAda);
  const [parsel, setParsel] = useState(initialParsel);
  const [areaM2, setAreaM2] = useState(initialAreaM2);
  const [tapuNiteligi, setTapuNiteligi] = useState("Tarla");

  if (!isOpen) return null;

  // İl değiştikçe ilçeleri otomatik getir
  const provinceList = Object.keys(TURKEY_PROVINCES_AND_DISTRICTS).sort((a, b) => a.localeCompare(b, "tr"));
  const availableDistricts = TURKEY_PROVINCES_AND_DISTRICTS[city]?.districts || [];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const dists = TURKEY_PROVINCES_AND_DISTRICTS[newCity]?.districts || [];
    if (dists.length > 0) {
      setDistrict(dists[0]);
    }
  };

  const handleCategorySwitch = (cat: "konut" | "arsa" | "arazi" | "ticari") => {
    setCategory(cat);
    if (cat === "konut") {
      setTapuNiteligi("Kat Mülkiyeti / Mesken");
      if (areaM2 > 1000) setAreaM2(120);
    } else if (cat === "arsa") {
      setTapuNiteligi("İmarlı Arsa");
      if (areaM2 < 200 || areaM2 > 10000) setAreaM2(850);
    } else if (cat === "arazi") {
      setTapuNiteligi("Tarla");
      if (areaM2 < 500) setAreaM2(2500);
    } else if (cat === "ticari") {
      setTapuNiteligi("Dükkan / Mağaza");
      if (areaM2 > 2000) setAreaM2(180);
    }
  };

  // Hazır Hızlı Test Şablonları
  const applyPreset = (preset: {
    cat: "konut" | "arsa" | "arazi" | "ticari";
    city: string;
    dist: string;
    neigh: string;
    ada: string;
    parsel: string;
    area: number;
    nit: string;
  }) => {
    setCategory(preset.cat);
    setCity(preset.city);
    setDistrict(preset.dist);
    setNeighborhood(preset.neigh);
    setAda(preset.ada);
    setParsel(preset.parsel);
    setAreaM2(preset.area);
    setTapuNiteligi(preset.nit);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Koordinat tespiti (Şehir veya ilçe merkezinden)
    const provCoords = getProvinceCoordinates(city) || { lat: 39.9334, lng: 32.8597 };

    onSubmit({
      category,
      city: city.trim() || "Çanakkale",
      district: district.trim() || "Merkez",
      neighborhood: neighborhood.trim() || "Merkez",
      ada: ada.trim() || "1",
      parsel: parsel.trim() || "1",
      areaM2: Number(areaM2) || (category === "konut" ? 110 : 850),
      tapuNiteligi: tapuNiteligi.trim() || "Arsa",
      coordinates: provCoords,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ÜST BAŞLIK BARI */}
        <div className="bg-gradient-to-r from-[#0B1E3B] via-[#0F284E] to-[#0B1E3B] text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>TKGM & İhaleciBurada Kadastro Motoru</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Yeni Ekspertiz ve Değerleme Başlat
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Değerlemesini yapmak istediğiniz taşınmazın il, ilçe, köy, ada, parsel ve alan (m²) bilgilerini belirtin.
          </p>
        </div>

        {/* FORM GÖVDESİ */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* 1. TAŞINMAZ TÜRÜ SEÇİMİ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Taşınmaz Türü
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "konut", label: "Konut / Daire", icon: Building },
                { id: "arsa", label: "İmarlı Arsa", icon: Building2 },
                { id: "arazi", label: "Tarla / Köy", icon: Trees },
                { id: "ticari", label: "Ticari / Dükkan", icon: Store },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategorySwitch(item.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-950 shadow-2xs font-extrabold ring-1 ring-blue-600"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                    <span className="text-[11px] whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. İL, İLÇE, KÖY / MAHALLE ALANLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* İL */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                İl <span className="text-rose-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              >
                {provinceList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* İLÇE */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                İlçe <span className="text-rose-500">*</span>
              </label>
              {availableDistricts.length > 0 ? (
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="İlçe girin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                />
              )}
            </div>

            {/* KÖY / MAHALLE */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Köy / Mahalle <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Örn: Sarıbeyli Köyü"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

          {/* 3. KADASTRO: ADA NO, PARSEL NO, ALAN (m²) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
            {/* ADA NO */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 uppercase mb-1">
                Ada No <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={ada}
                onChange={(e) => setAda(e.target.value)}
                placeholder="Örn: 1357"
                required
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-black text-amber-700 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

            {/* PARSEL NO */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 uppercase mb-1">
                Parsel No <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={parsel}
                onChange={(e) => setParsel(e.target.value)}
                placeholder="Örn: 4"
                required
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-black text-amber-700 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition"
              />
            </div>

            {/* TAŞINMAZ ALANI (m²) */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-800 uppercase mb-1">
                Alan (m²) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={1}
                  max={5000000}
                  value={areaM2}
                  onChange={(e) => setAreaM2(Number(e.target.value))}
                  placeholder="Örn: 1250"
                  required
                  className="w-full px-3 py-2 pr-9 bg-white border border-amber-300 rounded-xl text-xs font-mono font-black text-slate-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition"
                />
                <span className="absolute right-2.5 text-xs font-extrabold text-slate-500 select-none pointer-events-none">
                  m²
                </span>
              </div>
            </div>
          </div>

          {/* 4. TAPU NİTELİĞİ */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Tapu Niteliği / Vasfı
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Tarla", 
                "İmarlı Arsa", 
                "Kat Mülkiyeti / Mesken", 
                "Bağ / Bahçe", 
                "Zeytinlik", 
                "Dükkan / Mağaza"
              ].map((nitelik) => (
                <button
                  key={nitelik}
                  type="button"
                  onClick={() => setTapuNiteligi(nitelik)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    tapuNiteligi === nitelik
                      ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-2xs font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {nitelik}
                </button>
              ))}
            </div>
          </div>

          {/* 5. HIZLI ÖRNEK SEÇİCİLER (TEST KOLAYLIĞI) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hızlı Test Örnekleri (Tek Tıkla Doldur):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset({
                  cat: "arazi",
                  city: "Çanakkale",
                  dist: "Merkez",
                  neigh: "Sarıbeyli Köyü",
                  ada: "1357",
                  parsel: "4",
                  area: 1250,
                  nit: "Tarla",
                })}
                className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 transition"
              >
                🌾 <strong>Çanakkale Sarıbeyli</strong> (1357/4 - 1.250 m²)
              </button>

              <button
                type="button"
                onClick={() => applyPreset({
                  cat: "konut",
                  city: "Ankara",
                  dist: "Etimesgut",
                  neigh: "Devlet Mah.",
                  ada: "48507",
                  parsel: "1",
                  area: 110,
                  nit: "Kat Mülkiyeti / Mesken",
                })}
                className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 transition"
              >
                🏠 <strong>Ankara Etimesgut</strong> (48507/1 - 110 m²)
              </button>

              <button
                type="button"
                onClick={() => applyPreset({
                  cat: "arsa",
                  city: "İstanbul",
                  dist: "Kadıköy",
                  neigh: "Caferağa",
                  ada: "248",
                  parsel: "12",
                  area: 850,
                  nit: "İmarlı Arsa",
                })}
                className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 transition"
              >
                📐 <strong>İstanbul Kadıköy</strong> (248/12 - 850 m²)
              </button>
            </div>
          </div>

          {/* BUTONLAR */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-md shadow-orange-600/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <span>Kadastroyu Doğrula ve Değerlemeyi Başlat</span>
              <ArrowRight className="w-4 h-4 text-amber-200" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
