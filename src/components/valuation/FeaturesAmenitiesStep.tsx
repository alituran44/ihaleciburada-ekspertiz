"use client";

import React from "react";
import { ValuationFormData } from "./types";
import { 
  ArrowLeft, 
  Sparkles, 
  Compass, 
  Flame, 
  Building2, 
  ShieldCheck, 
  Check, 
  Eye, 
  CheckCircle2,
  TrendingUp
} from "lucide-react";

interface FeaturesAmenitiesStepProps {
  data: ValuationFormData;
  onChange: (updated: Partial<ValuationFormData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export const FeaturesAmenitiesStep: React.FC<FeaturesAmenitiesStepProps> = ({
  data,
  onChange,
  onPrev,
  onSubmit,
}) => {
  const toggleFacade = (item: string) => {
    const exists = data.facades.includes(item);
    onChange({
      facades: exists ? data.facades.filter((x) => x !== item) : [...data.facades, item],
    });
  };

  const toggleView = (item: string) => {
    const exists = data.views.includes(item);
    onChange({
      views: exists ? data.views.filter((x) => x !== item) : [...data.views, item],
    });
  };

  const toggleAmenity = (item: string) => {
    const exists = data.amenities.includes(item);
    onChange({
      amenities: exists ? data.amenities.filter((x) => x !== item) : [...data.amenities, item],
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* SOL ANA PANEL: Cephe, Manzara, Isıtma & Donatılar */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Adım 3: Donatı, Cephe & Olanaklar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            Taşınmazın Donanımlarını Seçin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Isıtma, cephe, otopark ve sosyal tesisler hem piyasa satış değerini hem de aylık kira getirisini doğrudan etkiler.
          </p>
        </div>

        {/* 1. CEPHE DURUMU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Cephe Durumu</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Birden fazla seçilebilir</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "kuzey", label: "Kuzey" },
              { id: "guney", label: "Güney (Güneş)" },
              { id: "dogu", label: "Doğu (Sabah)" },
              { id: "bati", label: "Batı (Akşam)" },
            ].map((f) => {
              const isSelected = data.facades.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFacade(f.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "border-[#0B1E3B] bg-[#0B1E3B] text-white shadow-2xs"
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{f.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. MANZARA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Manzara & Görüş Alanı</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Birden fazla seçilebilir</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "sehir", label: "Şehir Manzarası" },
              { id: "doga", label: "Doğa / Orman" },
              { id: "park", label: "Park & Yeşil Alan" },
              { id: "cadde", label: "Cadde / Sokak" },
              { id: "deniz", label: "Deniz / Göl / Boğaz" },
              { id: "yan_bina", label: "Yan Bina" },
            ].map((v) => {
              const isSelected = data.views.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleView(v.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isSelected
                      ? "border-[#0B1E3B] bg-[#0B1E3B] text-white shadow-2xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. ISITMA SİSTEMİ */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Isıtma Sistemi</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: "dogalgaz_kombi", label: "Doğalgaz / Kombi" },
              { id: "merkezi_payolcer", label: "Merkezi Isı Pay Ölçer" },
              { id: "yerden_isitma", label: "Yerden Isıtma" },
              { id: "merkezi", label: "Merkezi Sistem" },
              { id: "klima_isi_pompasi", label: "Klima / Isı Pompası" },
              { id: "soba_yok", label: "Soba / Yok" },
            ].map((h) => {
              const isSelected = data.heatingSystem === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onChange({ heatingSystem: h.id })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600 font-extrabold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. SOSYAL OLANAKLAR & TEKNİK DONATILAR */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Olanaklar & Sosyal Donatılar</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: "asansor", label: "Asansör" },
              { id: "kapali_otopark", label: "Kapalı Otopark" },
              { id: "acik_otopark", label: "Açık Otopark" },
              { id: "guvenlik", label: "7/24 Güvenlik" },
              { id: "bina_gorevlisi", label: "Bina / Site Görevlisi" },
              { id: "spor_salonu", label: "Spor Salonu / Fitness" },
              { id: "cocuk_parki", label: "Çocuk Oyun Parkı" },
              { id: "acik_havuz", label: "Açık Yüzme Havuzu" },
              { id: "kapali_havuz", label: "Kapalı Yüzme Havuzu" },
              { id: "isi_yalitimi", label: "Dış Cephe Isı Yalıtımı" },
              { id: "jenerator", label: "Tam Kapasite Jeneratör" },
              { id: "klima", label: "Klima / Soğutma" },
            ].map((am) => {
              const isSelected = data.amenities.includes(am.id);
              return (
                <button
                  key={am.id}
                  type="button"
                  onClick={() => toggleAmenity(am.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{am.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ALT AKSİYON BUTONLARI & HESAPLA CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onPrev}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri: Mülk Özellikleri</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm shadow-lg shadow-orange-950/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <TrendingUp className="w-4 h-4" />
            <span>İhaleciBurada Değerlemesini Başlat</span>
          </button>
        </div>
      </div>

      {/* SAĞ YAN BİLGİ PANELİ */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Donatı & Kira Çarpanı</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">
            Kapalı Otopark ve Güvenliğin Etkisi
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Site içerisinde güvenlik, kapalı otopark ve asansör donanımına sahip mülkler kiralama piyasasında <strong>%25 daha hızlı kiralanmakta</strong> ve kira getirisi ortalama <strong>%15 daha yüksek</strong> gerçekleşmektedir.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
              <span className="text-amber-300 font-bold">Likidite Skoru Artışı:</span>
              <p className="text-[11px] text-slate-400">
                Sosyal donatılı konutlar acil nakit ihtiyaçlarında piyasada 45 gün altında nakde dönebilmektedir.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Yatırım Algoritması</span>
            <span className="font-mono text-emerald-400">+1.4 Puan Skor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
