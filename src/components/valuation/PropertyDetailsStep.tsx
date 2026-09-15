"use client";

import React from "react";
import { ValuationFormData } from "./types";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  Building, 
  Home, 
  Info, 
  Check, 
  Sparkles,
  Layers,
  Trees,
  Store
} from "lucide-react";

interface PropertyDetailsStepProps {
  data: ValuationFormData;
  onChange: (updated: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PropertyDetailsStep: React.FC<PropertyDetailsStepProps> = ({
  data,
  onChange,
  onNext,
  onPrev,
}) => {
  // Sayaç Yardımcısı
  const CounterInput = ({
    label,
    value,
    onValChange,
    min = 0,
    max = 99999,
    step = 1,
    unit = "",
    subtitle,
  }: {
    label: string;
    value: number;
    onValChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    subtitle?: string;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition gap-2">
      <div>
        <div className="text-xs sm:text-sm font-bold text-slate-900">{label}</div>
        {subtitle && <div className="text-[11px] text-slate-500">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onValChange(Math.max(min, Number((value - step).toFixed(2))))}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="min-w-[64px] text-center font-mono font-extrabold text-slate-900 text-sm">
          {value} {unit}
        </div>
        <button
          type="button"
          onClick={() => onValChange(Math.min(max, Number((value + step).toFixed(2))))}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* SOL ANA PANEL: Dinamik Mülk Formu */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Adım 2: Mülk & İmar Özellikleri</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
            Taşınmazın Teknik Detaylarını Belirtin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Gireceğiniz her detay yapay zeka algoritmasının değerleme hassasiyetini ve güven aralığını artırır.
          </p>
        </div>

        {/* ========================================== */}
        {/* A. KONUT FORMU                              */}
        {/* ========================================== */}
        {data.service === "konut" && (
          <div className="space-y-5">
            {/* Konut Tipi (Apartman / Müstakil) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Konut Tipi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ housingTypeKind: "apartman", housingSubtype: "daire" })}
                  className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    data.housingTypeKind === "apartman"
                      ? "border-blue-600 bg-blue-50 text-blue-900 shadow-2xs"
                      : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Apartman Dairesi</span>
                  {data.housingTypeKind === "apartman" && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ housingTypeKind: "mustakil", housingSubtype: "villa" })}
                  className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    data.housingTypeKind === "mustakil"
                      ? "border-blue-600 bg-blue-50 text-blue-900 shadow-2xs"
                      : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Home className="w-4 h-4 text-amber-600" />
                  <span>Müstakil / Villa</span>
                  {data.housingTypeKind === "mustakil" && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                </button>
              </div>
            </div>

            {/* Alt Tip Seçenekleri */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alt Tür</label>
              <div className="flex flex-wrap gap-2">
                {(data.housingTypeKind === "apartman"
                  ? ["daire", "teras_dubleks", "ara_kat_dubleks", "bahce_dubleks", "ters_dubleks"]
                  : ["villa", "mustakil_ev", "ciftlik_evi", "yali_kosk"]
                ).map((sub) => {
                  const labelMap: Record<string, string> = {
                    daire: "Daire",
                    teras_dubleks: "Teras Dubleks",
                    ara_kat_dubleks: "Ara Kat Dubleks",
                    bahce_dubleks: "Bahçe Dubleks",
                    ters_dubleks: "Ters Dubleks",
                    villa: "Villa",
                    mustakil_ev: "Müstakil Ev",
                    ciftlik_evi: "Çiftlik Evi",
                    yali_kosk: "Yalı / Köşk",
                  };
                  const isSelected = data.housingSubtype === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => onChange({ housingSubtype: sub })}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        isSelected
                          ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {labelMap[sub] || sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kullanım Durumu ve Yapı Durumu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kullanım Durumu</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "mulk_sahibi", label: "Mülk Sahibi" },
                    { id: "kiraci", label: "Kiracı Var" },
                    { id: "bos", label: "Boş" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onChange({ usageStatus: u.id as any })}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition cursor-pointer ${
                        data.usageStatus === u.id
                          ? "bg-blue-50 border-blue-600 text-blue-900 font-extrabold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Yapı Durumu</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "bakimli", label: "Bakımlı / Yeni" },
                    { id: "standart", label: "Standart" },
                    { id: "tadilat", label: "Tadilat Lazım" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onChange({ buildingCondition: b.id as any })}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition cursor-pointer ${
                        data.buildingCondition === b.id
                          ? "bg-blue-50 border-blue-600 text-blue-900 font-extrabold"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sayısal Sayaçlar */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CounterInput
                  label="Oda Sayısı"
                  value={data.roomCount}
                  onValChange={(v) => onChange({ roomCount: v })}
                  min={1}
                  max={12}
                />
                <CounterInput
                  label="Salon Sayısı"
                  value={data.livingRoomCount}
                  onValChange={(v) => onChange({ livingRoomCount: v })}
                  min={0}
                  max={5}
                />
                <CounterInput
                  label="Banyo Sayısı"
                  value={data.bathroomCount}
                  onValChange={(v) => onChange({ bathroomCount: v })}
                  min={1}
                  max={6}
                />
                <CounterInput
                  label="Brüt Alan"
                  value={data.grossAreaM2}
                  onValChange={(v) => onChange({ grossAreaM2: v })}
                  min={30}
                  max={1000}
                  step={5}
                  unit="m²"
                  subtitle="Duvarlar ve balkonlar dahil"
                />
                <CounterInput
                  label="Bina Yaşı"
                  value={data.buildingAge}
                  onValChange={(v) => onChange({ buildingAge: v })}
                  min={0}
                  max={70}
                  unit="Yıl"
                  subtitle="0 = Sıfır Yeni Bina"
                />
                <CounterInput
                  label="Bulunduğu Kat"
                  value={data.floorNumber}
                  onValChange={(v) => onChange({ floorNumber: v })}
                  min={-5}
                  max={60}
                  subtitle="0 = Giriş, -1 = Bodrum/Kot"
                />
                <CounterInput
                  label="Binadaki Toplam Kat"
                  value={data.totalFloors}
                  onValChange={(v) => onChange({ totalFloors: v })}
                  min={1}
                  max={60}
                />
                <CounterInput
                  label="Açık Teras Alanı"
                  value={data.terraceAreaM2}
                  onValChange={(v) => onChange({ terraceAreaM2: v })}
                  min={0}
                  max={300}
                  unit="m²"
                  subtitle="Brüt alana dahil değilse"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* B. ARSA FORMU                               */}
        {/* ========================================== */}
        {data.service === "arsa" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">İmar Fonksiyonu</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "konut", label: "Konut İmarı" },
                  { id: "ticari", label: "Ticari İmar" },
                  { id: "konut_ticari", label: "Karma (Konut + Ticari)" },
                  { id: "villa", label: "Villa / Düşük Yoğunluk" },
                  { id: "sanayi", label: "Sanayi / Depolama" },
                  { id: "turizm", label: "Turizm / Otel" },
                ].map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => onChange({ arsaZoningType: z.id })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      data.arsaZoningType === z.id
                        ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CounterInput
                label="Arsa Alanı"
                value={data.arsaAreaM2}
                onValChange={(v) => onChange({ arsaAreaM2: v })}
                min={50}
                max={500000}
                step={50}
                unit="m²"
              />
              <CounterInput
                label="Emsal (KAKS)"
                value={data.arsaKaks}
                onValChange={(v) => onChange({ arsaKaks: v })}
                min={0.1}
                max={4.0}
                step={0.1}
                subtitle="Toplam inşaat alanı katsayısı"
              />
              <CounterInput
                label="Taban Oturumu (TAKS)"
                value={data.arsaTaks}
                onValChange={(v) => onChange({ arsaTaks: v })}
                min={0.1}
                max={0.8}
                step={0.05}
                subtitle="Zemin kat oturum oranı"
              />
              <CounterInput
                label="Kat Adedi (Hmax)"
                value={data.arsaMaxFloors}
                onValChange={(v) => onChange({ arsaMaxFloors: v })}
                min={1}
                max={40}
                unit="Kat"
              />
              <CounterInput
                label="Müteahhit Kat Karşılığı Payı"
                value={data.arsaContractorShare}
                onValChange={(v) => onChange({ arsaContractorShare: v })}
                min={20}
                max={70}
                unit="%"
                subtitle="Arsa sahibine düşen bağımsız bölüm"
              />
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* C. ARAZİ FORMU                              */}
        {/* ========================================== */}
        {data.service === "arazi" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Arazi Niteliği</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "tarla", label: "Tarla" },
                  { id: "bag", label: "Bağ" },
                  { id: "bahce", label: "Meyve Bahçesi" },
                  { id: "zeytinlik", label: "Zeytinlik" },
                  { id: "cayir", label: "Çayır / Mera" },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onChange({ araziType: a.id })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      data.araziType === a.id
                        ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CounterInput
                label="Arazi Büyüklüğü"
                value={data.araziAreaM2}
                onValChange={(v) => onChange({ araziAreaM2: v })}
                min={100}
                max={500000}
                step={100}
                unit="m²"
              />
              <CounterInput
                label="Dikili Ağaç Sayısı"
                value={data.araziTreeCount}
                onValChange={(v) => onChange({ araziTreeCount: v })}
                min={0}
                max={5000}
                step={5}
                unit="Adet"
                subtitle="Verim veren ağaç adedi"
              />
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* D. TİCARİ FORMU                             */}
        {/* ========================================== */}
        {data.service === "ticari" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ticari Gayrimenkul Türü</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "dukkan", label: "Dükkan / Mağaza" },
                  { id: "ofis", label: "Ofis / Büro" },
                  { id: "plaza_kati", label: "Plaza Katı" },
                  { id: "bina", label: "Komple Ticari Bina" },
                  { id: "depo", label: "Depo / Antrepo" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange({ commercialType: t.id })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      data.commercialType === t.id
                        ? "bg-[#0B1E3B] text-white border-[#0B1E3B] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CounterInput
                label="Kullanım Alanı"
                value={data.commercialAreaM2}
                onValChange={(v) => onChange({ commercialAreaM2: v })}
                min={20}
                max={50000}
                step={10}
                unit="m²"
              />
              <CounterInput
                label="Cadde Vitrin Cephesi"
                value={data.commercialFrontageM}
                onValChange={(v) => onChange({ commercialFrontageM: v })}
                min={2}
                max={50}
                unit="Metre"
              />
            </div>
          </div>
        )}

        {/* ALT AKSİYON BUTONLARI */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onPrev}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri: Konum</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-[#0B1E3B] hover:bg-blue-900 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>Donatı & Niteliklere Geç</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* SAĞ YAN BİLGİ PANELİ */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Değerleme Çarpanları</span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">
            Değeri En Çok Ne Etkiler?
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
              <strong className="text-white">1. Kat & Cephe Faktörü:</strong>
              <p className="text-[11px] text-slate-400">
                Ara kat ve güney cepheli konutlar bölge ortalamasına göre %8 ila %14 daha yüksek değere sahiptir.
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
              <strong className="text-white">2. Bina Yaşı & Deprem Güvenliği:</strong>
              <p className="text-[11px] text-slate-400">
                2019 sonrası güncel deprem yönetmeliğine uygun yapılar değerini koruma ve prim üretmede en yüksek puana sahiptir.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model: Hedonik Regresyon</span>
            <span className="font-mono text-amber-400">Aktif Çarpanlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
