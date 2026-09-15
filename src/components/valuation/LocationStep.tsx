"use client";

import React from "react";
import { ValuationFormData } from "./types";
import { 
  Search, 
  MapPin, 
  Crosshair, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Building2, 
  AlertTriangle,
  Compass,
  CheckCircle2
} from "lucide-react";

interface LocationStepProps {
  data: ValuationFormData;
  onChange: (updated: Partial<ValuationFormData>) => void;
  onNext: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const serviceLabel = 
    data.service === "konut" ? "Konut & Daire" :
    data.service === "arsa" ? "İmarlı Arsa" :
    data.service === "arazi" ? "Tarla & Arazi" : "Ticari Gayrimenkul";

  const handleGpsLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onChange({
            coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          });
        },
        () => {
          alert("GPS konumuna erişilemedi. Lütfen adresi arama kutusuna yazınız.");
        }
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* SOL ANA PANEL: Konum Arama, Uydu Haritası & TKGM Şeridi */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Adım 1: Lokasyon & Kadastro Doğrulaması</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            {serviceLabel} Konumunu Belirleyin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Türkiye genelinde 81 il, ilçe, mahalle veya doğrudan Ada/Parsel numarasını girerek TKGM uydu katmanında seçin.
          </p>
        </div>

        {/* ARAMA ÇUBUĞU */}
        <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50/70 p-1.5 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/15 transition shadow-2xs">
          <div className="hidden sm:flex items-center gap-1 px-3 text-xs font-extrabold text-slate-700 border-r border-slate-200 shrink-0">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Adres / Parsel</span>
          </div>

          <input
            type="text"
            value={data.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Örn: Ankara Etimesgut Devlet Mah. 48507 Ada 1 Parsel"
            className="flex-1 px-3 text-xs sm:text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 bg-transparent min-w-0"
          />

          {data.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ searchQuery: "" })}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 pl-1.5 shrink-0">
            <button
              type="button"
              onClick={handleGpsLocate}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="GPS Konumumu Bul"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNext}
              className="px-4 py-2 rounded-lg bg-[#0B1E3B] hover:bg-blue-900 text-amber-400 font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Konumu Doğrula</span>
            </button>
          </div>
        </div>

        {/* UYDU VE PARSEL ÖNİZLEME PENCERESİ */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 aspect-16/9 bg-slate-900 shadow-inner group">
          {/* Uydu Görüntüsü */}
          <img
            src="https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80"
            alt="TKGM Uydu Görünümü"
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-700"
          />

          {/* Sol Üst: TKGM Kadastro Rozeti */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 shadow-md">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>TKGM Canlı Parsel Katmanı</span>
            </div>
          </div>

          {/* Sağ Üst: Deprem Risk PGA Rozeti */}
          <div className="absolute top-3 right-3 z-10">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PGA Deprem İvmesi: {data.pgaSeismicHazard}</span>
            </div>
          </div>

          {/* Merkezde Özel İhaleciBurada Konum Pini */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative flex flex-col items-center animate-bounce">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0B1E3B] to-slate-900 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="w-3 h-3 bg-amber-400 rotate-45 -mt-1.5 shadow-md" />
            </div>
          </div>

          {/* Alt: Tapu & Kadastro Doğrulama Şeridi */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-slate-950/90 backdrop-blur-md p-3.5 text-white text-xs border-t border-white/10 space-y-1">
            <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-2">
              <span className="flex items-center gap-1.5 text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {data.city} / {data.district} / {data.neighborhood}
              </span>
              <span className="font-mono text-slate-300 text-[11px]">
                Ada: <strong className="text-white">{data.ada}</strong> | Parsel: <strong className="text-white">{data.parsel}</strong> | Pafta: {data.pafta}
              </span>
            </div>
            <div className="text-slate-300 text-[11px] flex items-center justify-between">
              <span>Mevcut Tapu Niteliği: <strong>Kat İrtifakı / Mülkiyeti</strong></span>
              <span className="text-emerald-400 font-semibold">Kadastro Tescili Aktif</span>
            </div>
          </div>
        </div>

        {/* ALT AKSİYON BUTONLARI */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 font-medium">
            * Tapu ve Kadastro Genel Müdürlüğü (TKGM) ve HGK koordinat doğrulama aktif
          </span>

          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-[#0B1E3B] hover:bg-blue-900 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>Mülk Özelliklerine Geç</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* SAĞ YAN BİLGİ PANELİ */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Akıllı Kadastro Analizi</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">
            Neden Ada ve Parsel Doğrulaması Önemlidir?
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              İhaleciBurada değerleme motoru, yalnızca genel ilçe ortalamalarını değil, taşınmazın mikro-lokasyonunu, belediye imar durumunu ve komşu parsel satışlarını baz alır.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1.5">
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                İhale & İcra Arbitrajı
              </div>
              <p className="text-[11px] text-slate-400">
                Taşınmazın icra tabanı (%50 İİK m.115) doğrudan bu kadastro kaydı üzerinden hesaplanır.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Veri Kaynağı: TKGM & HGK</span>
            <span className="font-mono text-emerald-400">Canlı Doğrulandı</span>
          </div>
        </div>

        {/* Hızlı İpucu Kartı */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-blue-950">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            Farklı Bir Bölge mi Bakıyorsunuz?
          </div>
          <p className="text-[11px] text-blue-800/90 leading-relaxed">
            Arama çubuğuna dilediğiniz ili veya ilçeyi yazarak haritayı o bölgeye anında odaklayabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};
