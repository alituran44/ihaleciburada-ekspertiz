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
  Store,
  ShieldCheck
} from "lucide-react";

interface PropertyDetailsStepProps {
  data: ValuationFormData;
  onChange: (updated: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface CounterInputProps {
  label: string;
  value: number;
  onValChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  subtitle?: string;
}

// Sayaç ve Doğrudan Klavye Girişi Bileşeni (Elle yazılabilir & +/- butonlu)
const CounterInput: React.FC<CounterInputProps> = ({
  label,
  value,
  onValChange,
  min = 0,
  max = 99999,
  step = 1,
  unit = "",
  subtitle,
}) => {
  const [localVal, setLocalVal] = React.useState<string>(
    value !== undefined && value !== null ? String(value) : "0"
  );

  React.useEffect(() => {
    setLocalVal(value !== undefined && value !== null ? String(value) : "0");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalVal(raw);
    if (raw === "" || raw === "-") {
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onValChange(parsed);
    }
  };

  const handleBlur = () => {
    let parsed = parseFloat(localVal);
    if (isNaN(parsed)) {
      parsed = min;
    } else {
      if (min !== undefined && parsed < min) parsed = min;
      if (max !== undefined && parsed > max) parsed = max;
    }
    setLocalVal(String(parsed));
    onValChange(parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleDecrement = () => {
    const current = parseFloat(localVal);
    const base = isNaN(current) ? value : current;
    const nextVal = Math.max(min, Number((base - step).toFixed(2)));
    setLocalVal(String(nextVal));
    onValChange(nextVal);
  };

  const handleIncrement = () => {
    const current = parseFloat(localVal);
    const base = isNaN(current) ? value : current;
    const nextVal = Math.min(max, Number((base + step).toFixed(2)));
    setLocalVal(String(nextVal));
    onValChange(nextVal);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition gap-2 shadow-2xs">
      <div>
        <div className="text-xs sm:text-sm font-bold text-slate-900">{label}</div>
        {subtitle && <div className="text-[11px] text-slate-500">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleDecrement}
          title="Azalt (-)"
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center font-bold text-sm transition cursor-pointer"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div 
          className="flex items-center h-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-lg px-2 transition group"
          title="Elle sayı yazabilir veya +/- butonlarıyla değiştirebilirsiniz"
        >
          <input
            type="number"
            value={localVal}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            step={step}
            aria-label={label}
            className="w-14 sm:w-16 text-center font-mono font-black text-slate-900 text-sm bg-transparent outline-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
          />
          {unit && (
            <span className="text-xs font-bold text-slate-500 select-none ml-1 shrink-0">
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          title="Artır (+)"
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center font-bold text-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const PropertyDetailsStep: React.FC<PropertyDetailsStepProps> = ({
  data,
  onChange,
  onNext,
  onPrev,
}) => {
  const [zoningMode, setZoningMode] = React.useState<"auto" | "custom">("auto");
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
            Gireceğiniz her detay yapay zeka algoritmasının değerleme hassasiyetini ve güven aralığını artırır. Değerleri klavyenizle doğrudan yazabilir veya sayaç butonlarıyla ayarlayabilirsiniz.
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

            {/* Sayısal Sayaçlar & Manuel Klavye Girişi */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CounterInput
                  label="Oda Sayısı"
                  value={data.roomCount}
                  onValChange={(v) => onChange({ roomCount: v })}
                  min={1}
                  max={20}
                />
                <CounterInput
                  label="Salon Sayısı"
                  value={data.livingRoomCount}
                  onValChange={(v) => onChange({ livingRoomCount: v })}
                  min={0}
                  max={10}
                />
                <CounterInput
                  label="Banyo Sayısı"
                  value={data.bathroomCount}
                  onValChange={(v) => onChange({ bathroomCount: v })}
                  min={1}
                  max={10}
                />
                <CounterInput
                  label="Brüt Alan"
                  value={data.grossAreaM2}
                  onValChange={(v) => onChange({ grossAreaM2: v })}
                  min={10}
                  max={10000}
                  step={5}
                  unit="m²"
                  subtitle="Duvarlar ve balkonlar dahil"
                />
                <CounterInput
                  label="Bina Yaşı"
                  value={data.buildingAge}
                  onValChange={(v) => onChange({ buildingAge: v })}
                  min={0}
                  max={120}
                  unit="Yıl"
                  subtitle="0 = Sıfır Yeni Bina"
                />
                {/* Bulunduğu Kat Seçimi (Zemin, Yüksek Giriş, 1, 2, 3, 4, 5, 6... Bilgi Yok) */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2.5 shadow-2xs sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Bulunduğu Kat</span>
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {data.floorNumber === 0 ? "Zemin Kat" :
                           data.floorNumber === 0.5 ? "Yüksek Giriş" :
                           data.floorNumber === -1 ? "Bodrum Kat" :
                           data.floorNumber === 999 ? "Bilgi Yok / Bilinmiyor" :
                           `${data.floorNumber}. Kat`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Taşınmazın yer aldığı kat seviyesini doğrudan seçin
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">Elle:</span>
                      <input
                        type="number"
                        min={-5}
                        max={100}
                        value={data.floorNumber === 999 ? "" : data.floorNumber}
                        onChange={(e) => onChange({ floorNumber: e.target.value === "" ? 999 : Number(e.target.value) })}
                        placeholder="Kat"
                        className="w-14 h-7 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { val: 0, label: "Zemin" },
                      { val: 0.5, label: "Yüksek Giriş" },
                      { val: 1, label: "1. Kat" },
                      { val: 2, label: "2. Kat" },
                      { val: 3, label: "3. Kat" },
                      { val: 4, label: "4. Kat" },
                      { val: 5, label: "5. Kat" },
                      { val: 6, label: "6. Kat" },
                      { val: -1, label: "Bodrum" },
                      { val: 999, label: "Bilgi Yok" },
                    ].map((f) => {
                      const isSelected = data.floorNumber === f.val;
                      return (
                        <button
                          key={f.val}
                          type="button"
                          onClick={() => onChange({ floorNumber: f.val })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-[#0B1E3B] text-white shadow-2xs font-black"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <CounterInput
                  label="Binadaki Toplam Kat"
                  value={data.totalFloors}
                  onValChange={(v) => onChange({ totalFloors: v })}
                  min={1}
                  max={100}
                />
                <CounterInput
                  label="Açık Teras Alanı"
                  value={data.terraceAreaM2}
                  onValChange={(v) => onChange({ terraceAreaM2: v })}
                  min={0}
                  max={2000}
                  step={5}
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

            {/* Arsa Alanı */}
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
            </div>

            {/* İmar Durumu ve Yapılaşma Bilgilendirmesi */}
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-600" />
                  <span>İmar Durumu & Yapılaşma Bilgisi</span>
                </span>
                <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  İlgili Kurumdan Alınmalıdır
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Taşınmazın güncel imar fonksiyonu, çekme mesafeleri, kat adedi ve yapılaşma hakları <strong>yetkili ilçe veya büyükşehir belediyesi imar müdürlüğünden</strong> temin edilecek resmi imar çapı ile belirlenir. Sistemimiz afaki inşaat kapasitesi hesabı yapmaz.
              </p>
            </div>

            {/* Tapu Şerh & İpotek Durumu - Alıcı / Tapu Sorgusu */}
            <div className="space-y-3 pt-2 border-t border-slate-200/70">
              <div>
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Tapu Şerh / İpotek / Takyidat Durumu</span>
                  <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full lowercase">
                    tapudan sorulacak
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Taşınmaz üzerinde herhangi bir banka ipoteği, icra/haciz veya satış vaadi şerhi bulunuyor mu?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    id: "tapudan_sorulacak",
                    title: "Tapu Müdürlüğü'nden Sorulacak",
                    sub: "Tavsiye Edilen (WebTapu teyidi gerekli)",
                  },
                  {
                    id: "temiz",
                    title: "Şerh / İpotek Yok",
                    sub: "Alıcı / Satıcı Beyanı: Temiz",
                  },
                  {
                    id: "ipotek_var",
                    title: "İpotek / Banka Rehinli",
                    sub: "Kredi / borç bakiyesi mevcut",
                  },
                  {
                    id: "haciz_serh_var",
                    title: "Haciz / Dava Şerhi Var",
                    sub: "İcra veya mahkeme şerhi var",
                  },
                ].map((opt) => {
                  const isSelected = (data.serhStatus || "tapudan_sorulacak") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChange({ serhStatus: opt.id as any })}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#0B1E3B] bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="font-bold text-xs">{opt.title}</strong>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <span className={`text-[11px] mt-1 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {opt.sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">⚠️ Not:</span>
                <span>
                  Taşınmaz takyidat kayıtları yalnızca e-Devlet Web-Tapu sistemi veya yetkili Tapu Müdürlüğü üzerinden alıcı ve malik tarafından sorgulanabilir.
                </span>
              </div>
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
