"use client";

import React, { useState } from "react";
import { 
  ParcelInput, 
  ZoningType, 
  TopographyType, 
  RoadAccessType, 
  PropertyCategory,
  HousingType,
  RoomCount,
  BuildingAge,
  FloorLocation,
  HeatingType,
  DeedStatus
} from "@/types";
import { SAMPLE_SCENARIOS } from "@/lib/constants";
import { 
  MapPin, 
  Building2, 
  Compass, 
  Coins, 
  UserCheck, 
  RotateCcw, 
  Gavel, 
  Sparkles,
  Zap,
  Loader2,
  CheckCircle2,
  Check,
  Globe,
  Search,
  TrendingUp,
  BarChart3,
  Home,
  CalendarClock,
  Landmark,
  ShieldAlert,
  Calculator
} from "lucide-react";
import { formatTL, formatNumber } from "@/lib/constants";
import { ParcelMap } from "@/components/ParcelMap";

interface ValuationWizardProps {
  input: ParcelInput;
  onChange: (updated: ParcelInput) => void;
  onReset: () => void;
}

export const ValuationWizard: React.FC<ValuationWizardProps> = ({
  input,
  onChange,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<string>("location");
  const [isQueryingApi, setIsQueryingApi] = useState<boolean>(false);
  const [apiFeedback, setApiFeedback] = useState<{ status: "success" | "error"; message: string } | null>(null);
  const [isResearchingEmsal, setIsResearchingEmsal] = useState<boolean>(false);
  const [emsalFeedback, setEmsalFeedback] = useState<{ status: "success" | "error"; message: string } | null>(null);

  const isResidential = input.category === "konut";

  const updateField = <K extends keyof ParcelInput>(field: K, value: ParcelInput[K]) => {
    onChange({
      ...input,
      [field]: value,
    });
  };

  const handleCategorySwitch = (category: PropertyCategory) => {
    if (category === input.category) return;
    onChange({
      ...input,
      category,
      title: category === "konut" ? "Yeni Konut Portföyü" : "Yeni Arsa Portföyü",
      areaM2: category === "konut" ? 125 : 1200,
      netAreaM2: category === "konut" ? 105 : undefined,
    });
    setActiveTab("location");
    setApiFeedback(null);
  };

  const handleScenarioSelect = (index: number) => {
    onChange(SAMPLE_SCENARIOS[index].data);
    setApiFeedback(null);
  };

  // Gerçek API Sorgulama Fonksiyonu
  const handleQueryRealApi = async () => {
    if (!input.city || !input.district) {
      setApiFeedback({
        status: "error",
        message: "Lütfen en az İl ve İlçe bilgisini giriniz.",
      });
      return;
    }

    setIsQueryingApi(true);
    setApiFeedback(null);

    try {
      const url = `/api/parsel?il=${encodeURIComponent(input.city)}&ilce=${encodeURIComponent(input.district)}&mahalle=${encodeURIComponent(input.neighborhood || "")}&ada=${encodeURIComponent(input.ada || "")}&parsel=${encodeURIComponent(input.parsel || "")}&kategori=${encodeURIComponent(input.category || "arsa")}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        const updated = { ...input };

        // Kadastro verisi
        if (data.parcel && data.parcel.alanM2 > 0 && !isResidential) {
          updated.areaM2 = data.parcel.alanM2;
        }
        if (data.parcel && data.parcel.coordinates) {
          updated.coordinates = data.parcel.coordinates;
        }
        if (data.parcel && data.parcel.elevationMeters !== undefined) {
          updated.elevationMeters = data.parcel.elevationMeters;
        }

        // Piyasa değerleme verisi (Endeksa / TCMB / 81 İl Yerel Motoru)
        if (data.market) {
          updated.estimatedLandM2PriceTL = data.market.landM2PriceTL;
          updated.estimatedUnitSaleM2PriceTL = data.market.unitSaleM2PriceTL;
          updated.dataSourceLabel = data.market.dataSourceLabel;
        }

        // İnternet emsal araştırması verisi (Sahibinden / Hepsiemlak / Endeksa)
        if (data.research) {
          updated.estimatedLandM2PriceTL = data.research.landM2PriceTL;
          updated.estimatedUnitSaleM2PriceTL = data.research.unitSaleM2PriceTL;
          updated.contractorSharePercent = data.research.contractorSharePercent;
          if (isResidential) {
            updated.monthlyRentEstimateTL = data.research.estimatedMonthlyRentTL;
          }
          updated.marketResearch = data.research;
          if (data.research.comparables) {
            updated.comparables = data.research.comparables;
          }
        }

        // Açık API Portalı (public-apis) Katmanları
        if (data.currency) {
          updated.currencyRates = data.currency;
        }
        if (data.earthquake) {
          updated.earthquakeRisk = data.earthquake;
        }
        if (data.solar) {
          updated.solarClimate = data.solar;
        }

        onChange(updated);
        setApiFeedback({
          status: "success",
          message: `Gerçek Veri Alındı! ${data.parcel.source} (${data.parcel.elevationMeters ? data.parcel.elevationMeters + "m rakım, " : ""}Open Topo), USGS Deprem (${data.earthquake?.riskLevel || "Orta"} Risk), TCMB/ECB Döviz ($${data.currency?.usdTry || 38.5}) ve internetten ${data.research ? data.research.sampleCount + " emsal ilan " : ""}entegre edildi.`,
        });
      } else {
        setApiFeedback({
          status: "error",
          message: data.error || "API sorgusu tamamlanamadı.",
        });
      }
    } catch (err: any) {
      setApiFeedback({
        status: "error",
        message: "Sunucu API bağlantı hatası: " + err.message,
      });
    } finally {
      setIsQueryingApi(false);
    }
  };

  // İnternetten Canlı Emsal Araştırması Fonksiyonu (Step 4 & Doğrudan Çağrı)
  const handleResearchEmsals = async () => {
    if (!input.city) {
      setEmsalFeedback({
        status: "error",
        message: "Lütfen önce 1. Adımda en az İl ve İlçe bilgisini giriniz.",
      });
      return;
    }

    setIsResearchingEmsal(true);
    setEmsalFeedback(null);

    try {
      const url = `/api/emsal?il=${encodeURIComponent(input.city)}&ilce=${encodeURIComponent(input.district || "")}&mahalle=${encodeURIComponent(input.neighborhood || "")}&kategori=${input.category}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        const resData = data.data;
        const updated: ParcelInput = {
          ...input,
          estimatedLandM2PriceTL: resData.landM2PriceTL,
          estimatedUnitSaleM2PriceTL: resData.unitSaleM2PriceTL,
          contractorSharePercent: resData.contractorSharePercent,
          monthlyRentEstimateTL: isResidential ? resData.estimatedMonthlyRentTL : input.monthlyRentEstimateTL,
          marketResearch: resData,
          comparables: resData.comparables,
        };
        onChange(updated);
        setEmsalFeedback({
          status: "success",
          message: `${resData.queryLocation} bölgesinde internetten ${resData.sampleCount} adet güncel emsal ilan ve piyasa endeksi analiz edildi. Emsal m² fiyatları ve müteahhit paylaşım oranları otomatik güncellendi.`,
        });
      } else {
        setEmsalFeedback({
          status: "error",
          message: data.error || "İnternet emsal araştırması tamamlanamadı.",
        });
      }
    } catch (err: any) {
      setEmsalFeedback({
        status: "error",
        message: "Emsal sorgulama bağlantı hatası: " + err.message,
      });
    } finally {
      setIsResearchingEmsal(false);
    }
  };

  return (
    <div className="bg-white border border-slate-300/80 rounded-2xl shadow-premium overflow-hidden">
      
      {/* 1. KATEGORİ SEÇİCİ (ARSA VS KONUT / EV) */}
      <div className="bg-[#0B1E3B] p-2.5 sm:px-5 flex items-center justify-between gap-3 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-300 hidden sm:inline">
          Ekspertiz Türü:
        </span>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleCategorySwitch("arsa")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              !isResidential
                ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Arsa / İmar Fizibilitesi</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategorySwitch("konut")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              isResidential
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Konut / Daire / Villa</span>
          </button>
        </div>
      </div>

      {/* Hızlı Demo Şablonları */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Hazır Senaryolar:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SAMPLE_SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleScenarioSelect(idx)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-slate-700 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
            >
              {sc.label.split(":")[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            title="Formu Sıfırla"
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Adım Sekmeleri */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-white">
        <button
          type="button"
          onClick={() => setActiveTab("location")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "location"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>1. Konum & Ada-Parsel</span>
        </button>

        {isResidential ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("residential_features")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "residential_features"
                  ? "border-blue-600 text-blue-700 bg-blue-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>2. Konut Özellikleri & Yaş</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rental_yield")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "rental_yield"
                  ? "border-blue-600 text-blue-700 bg-blue-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>3. Kira & Amortisman</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("zoning")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "zoning"
                  ? "border-blue-600 text-blue-700 bg-blue-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>2. İmar & Yapılaşma</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("topography")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === "topography"
                  ? "border-blue-600 text-blue-700 bg-blue-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3. Yol & Arazi Durumu</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("finance")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "finance"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>4. Fiyat & İhale Verisi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("agency")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "agency"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>5. Danışman & Ofis</span>
        </button>
      </div>

      {/* Form Gövdesi */}
      <div className="p-5 sm:p-6">
        {/* SEKME 1: KONUM VE ADA PARSEL */}
        {activeTab === "location" && (
          <div className="space-y-4">
            {/* Gerçek API Sorgulama Şeridi */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-[#0F223D] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Gerçek API Bağlantı Modülü</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  İl ve İlçe girip butona basarak OpenStreetMap ve Piyasa Değerleme API'sinden güncel verileri çekin.
                </p>
              </div>

              <button
                type="button"
                onClick={handleQueryRealApi}
                disabled={isQueryingApi}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shrink-0 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isQueryingApi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Sorgulanıyor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950" />
                    <span>API'den Otomatik Getir</span>
                  </>
                )}
              </button>
            </div>

            {/* API Geri Bildirim Mesajı */}
            {apiFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                apiFeedback.status === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-rose-50 border-rose-300 text-rose-900"
              }`}>
                {apiFeedback.status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <span className="text-rose-600 font-bold shrink-0">✕</span>
                )}
                <span>{apiFeedback.message}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isResidential ? "Portföy / Konut Başlığı" : "Proje / Arsa Başlığı"}
              </label>
              <input
                type="text"
                value={input.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={isResidential ? "Örn: Kadıköy Moda Sahil 3+1 Daire" : "Örn: Kepez Sahil Konut Geliştirme Parseli"}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İl *</label>
                <input
                  type="text"
                  value={input.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="İstanbul / Çanakkale"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İlçe *</label>
                <input
                  type="text"
                  value={input.district}
                  onChange={(e) => updateField("district", e.target.value)}
                  placeholder="Kadıköy / Merkez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mahalle / Köy</label>
                <input
                  type="text"
                  value={input.neighborhood}
                  onChange={(e) => updateField("neighborhood", e.target.value)}
                  placeholder="Caferağa / Kepez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ada No</label>
                <input
                  type="text"
                  value={input.ada}
                  onChange={(e) => updateField("ada", e.target.value)}
                  placeholder="184"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parsel No</label>
                <input
                  type="text"
                  value={input.parsel}
                  onChange={(e) => updateField("parsel", e.target.value)}
                  placeholder="22"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isResidential ? "Brüt Alan (m²) *" : "Tapu Alanı (m²) *"}
                </label>
                <input
                  type="number"
                  min="1"
                  value={input.areaM2 || ""}
                  onChange={(e) => updateField("areaM2", Number(e.target.value))}
                  placeholder={isResidential ? "135" : "1650"}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Canlı Harita Önizlemesi */}
            <ParcelMap 
              city={input.city}
              district={input.district}
              neighborhood={input.neighborhood}
              ada={input.ada}
              parsel={input.parsel}
              coordinates={input.coordinates}
              elevationMeters={input.elevationMeters}
              comparables={input.comparables || input.marketResearch?.comparables}
              category={input.category}
              onLocationFound={(coords) => updateField("coordinates", coords)}
            />
          </div>
        )}

        {/* ========================================== */}
        {/* KONUT ÖZEL SEKMESİ 2: KONUT NİTELİKLERİ */}
        {/* ========================================== */}
        {isResidential && activeTab === "residential_features" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Konut Tipi</label>
                <select
                  value={input.housingType || "daire"}
                  onChange={(e) => updateField("housingType", e.target.value as HousingType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="daire">Apartman Dairesi</option>
                  <option value="villa">Müstakil Villa</option>
                  <option value="dubleks">Çatı / Bahçe Dubleksi</option>
                  <option value="rezidans">Rezidans</option>
                  <option value="mustakil">Müstakil Köy / Şehir Evi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Oda Sayısı</label>
                <select
                  value={input.roomCount || "3+1"}
                  onChange={(e) => updateField("roomCount", e.target.value as RoomCount)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Net Alan (m²)</label>
                <input
                  type="number"
                  min="1"
                  value={input.netAreaM2 || ""}
                  onChange={(e) => updateField("netAreaM2", Number(e.target.value))}
                  placeholder="115"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bina Yaşı (Deprem Kriteri)</label>
                <select
                  value={input.buildingAge || "1-5"}
                  onChange={(e) => updateField("buildingAge", e.target.value as BuildingAge)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="0">0 (Sıfır Yapı)</option>
                  <option value="1-5">1 - 5 Yaş</option>
                  <option value="6-10">6 - 10 Yaş</option>
                  <option value="11-15">11 - 15 Yaş</option>
                  <option value="16-20">16 - 20 Yaş</option>
                  <option value="21+">21+ Yaş (2000 Öncesi Yapı)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bulunduğu Kat</label>
                <select
                  value={input.floorLocation || "ara_kat"}
                  onChange={(e) => updateField("floorLocation", e.target.value as FloorLocation)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="ara_kat">Ara Kat (En Değerli)</option>
                  <option value="bahce_giris">Bahçe / Giriş Kat</option>
                  <option value="en_ust_kat">En Üst Kat</option>
                  <option value="cati_dubleks">Çatı Dubleksi</option>
                  <option value="kot_bodrum">Kot / Bodrum Kat</option>
                  <option value="mustakil">Müstakil Bina</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tapu Durumu</label>
                <select
                  value={input.deedStatus || "kat_mulkiyeti"}
                  onChange={(e) => updateField("deedStatus", e.target.value as DeedStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="kat_mulkiyeti">Kat Mülkiyeti (İskanlı)</option>
                  <option value="kat_irtifaki">Kat İrtifakı</option>
                  <option value="arsa_payli">Arsa Paylı Tapu</option>
                  <option value="hisseli">Hisseli Tapu</option>
                </select>
              </div>
            </div>

            {/* Donatı Onay Kutuları */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Ek Donatılar & Özellikler:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={input.hasParking || false}
                    onChange={(e) => updateField("hasParking", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Otopark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={input.hasElevator || false}
                    onChange={(e) => updateField("hasElevator", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Asansör</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={input.hasBalcony || false}
                    onChange={(e) => updateField("hasBalcony", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Balkon / Teras</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={input.inGatedCommunity || false}
                    onChange={(e) => updateField("inGatedCommunity", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Site İçi / Güvenlik</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* KONUT ÖZEL SEKMESİ 3: KİRA & AMORTİSMAN */}
        {/* ========================================== */}
        {isResidential && activeTab === "rental_yield" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aylık Tahmini / Mevcut Kira Getirisi (TL)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={input.monthlyRentEstimateTL || ""}
                  onChange={(e) => updateField("monthlyRentEstimateTL", Number(e.target.value))}
                  placeholder="55000 (Boş bırakırsanız sistem otomatik hesaplar)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">
                  Boş bırakırsanız bölge emsal m² değerinden otomatik tahmin edilir.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isıtma Tipi
                </label>
                <select
                  value={input.heatingType || "dogalgaz_kombi"}
                  onChange={(e) => updateField("heatingType", e.target.value as HeatingType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="dogalgaz_kombi">Doğalgaz Kombi</option>
                  <option value="yerden_isitma">Yerden Isıtma</option>
                  <option value="merkezi_payolcer">Merkezi (Pay Ölçer)</option>
                  <option value="klima">Klima</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900">
              <strong>Amortisman Matematiği:</strong> Türkiye genelinde konut geri dönüş süresi ortalama 18–22 yıldır. 16 yılın altındaki konutlar yüksek kira getirili yatırım sınıfına girer.
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ARSA ÖZEL: İMAR & YAPILAŞMA HAKLARI */}
        {/* ========================================== */}
        {!isResidential && activeTab === "zoning" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">İmar Fonksiyonu</label>
                <select
                  value={input.zoningType}
                  onChange={(e) => updateField("zoningType", e.target.value as ZoningType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="konut">Konut Alanı</option>
                  <option value="ticari">Ticaret / Ofis Alanı</option>
                  <option value="karma">Karma (Konut + Ticaret)</option>
                  <option value="villa">Düşük Yoğunluklu Villa</option>
                  <option value="sanayi">Sanayi & Depolama</option>
                  <option value="tarla_gelisme">Tarla / İmar Gelişme Alanı</option>
                  <option value="turizm">Turizm & Konaklama Tesisi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  KAKS / Emsal Oranı
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="5.0"
                  value={input.kaks || ""}
                  onChange={(e) => updateField("kaks", Number(e.target.value))}
                  placeholder="1.50"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TAKS (Taban Oturumu)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="0.8"
                  value={input.taks || ""}
                  onChange={(e) => updateField("taks", Number(e.target.value))}
                  placeholder="0.35"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gabari (Hmax / Metre)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  value={input.gabariM || ""}
                  onChange={(e) => updateField("gabariM", Number(e.target.value))}
                  placeholder="15.5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maksimum Kat Adedi
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={input.maxFloors || ""}
                  onChange={(e) => updateField("maxFloors", Number(e.target.value))}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Tahmini Yola / Kamuya Terk Oranı (%):
                </label>
                <span className="text-xs font-mono font-bold text-blue-700">
                  %{input.relinquishmentRatio} Terk
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="5"
                value={input.relinquishmentRatio}
                onChange={(e) => updateField("relinquishmentRatio", Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* ARSA ÖZEL: YOL VE TOPOGRAFYA */}
        {/* ========================================== */}
        {!isResidential && activeTab === "topography" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kadastro Yolu Erişimi
                </label>
                <select
                  value={input.roadAccess}
                  onChange={(e) => updateField("roadAccess", e.target.value as RoadAccessType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="var">Resmi Kadastro Yolu Var</option>
                  <option value="yok">Yolu Yok (Geçit Hakkı Gerekir)</option>
                  <option value="cikmaz_sokak">Çıkmaz Sokak Cepheli</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Yol Cephesi Genişliği (Metre)
                </label>
                <input
                  type="number"
                  min="0"
                  value={input.roadFrontageM || ""}
                  onChange={(e) => updateField("roadFrontageM", Number(e.target.value))}
                  placeholder="28"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arazi Topografyası (Eğim)
                </label>
                <select
                  value={input.topography}
                  onChange={(e) => updateField("topography", e.target.value as TopographyType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="duz">Düz Arazi (Hafriyat maliyeti minimum)</option>
                  <option value="az_egimli">Az Eğimli (%5 - %15 meyilli)</option>
                  <option value="dik_egimli">Dik Eğimli / Kademeli (İstinat gerektirir)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={input.isCornerParcel}
                    onChange={(e) => updateField("isCornerParcel", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Köşe Başı Parsel (Çift Cephe Avantajı)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SEKME 4: FİYAT VE İHALE VERİSİ (ORTAK) */}
        {/* ========================================== */}
        {activeTab === "finance" && (
          <div className="space-y-4">
            {/* CANLI İNTERNET EMSAL ARAŞTIRMA KARTI & BUTONU */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B1E3B] via-[#0F2A52] to-[#0B1E3B] text-white shadow-md space-y-3 border border-blue-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
                    <Globe className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold font-heading text-white flex items-center gap-1.5">
                      <span>İnternetten Canlı Emsal Araştırma Motoru</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                        Canlı Rayiç
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Bölge: <strong className="text-white">{input.city || "Çanakkale"} / {input.district || "Merkez"}{input.neighborhood ? ` / ${input.neighborhood}` : ""}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResearchEmsals}
                  disabled={isResearchingEmsal}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/40 transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isResearchingEmsal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>İlanlar Taranıyor...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>İnternetten Emsalleri Otomatik Çek</span>
                    </>
                  )}
                </button>
              </div>

              {/* Geri Bildirim Mesajı */}
              {emsalFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  emsalFeedback.status === "success" 
                    ? "bg-emerald-950/80 text-emerald-200 border border-emerald-700/60"
                    : "bg-rose-950/80 text-rose-200 border border-rose-700/60"
                }`}>
                  {emsalFeedback.status === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Zap className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{emsalFeedback.message}</span>
                </div>
              )}

              {/* Taranan Emsal İlan Havuzu Göstergesi */}
              {input.marketResearch ? (
                <div className="pt-2 border-t border-white/10 space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400">Taranan Emsal Havuzu</div>
                      <div className="font-black text-sm text-white">{input.marketResearch.sampleCount} Aktif İlan & Endeks</div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Güven Skoru: %{input.marketResearch.confidenceScore}</div>
                    </div>
                    {!isResidential ? (
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-slate-400">Emsal Arsa Fiyat Bandı</div>
                        <div className="font-black text-sm text-amber-300">
                          {formatTL(input.marketResearch.landM2PriceTL)}/m²
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Aralık: {formatTL(input.marketResearch.landM2MinTL)} - {formatTL(input.marketResearch.landM2MaxTL)}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-slate-400">Emsal Kira Getiri Rayici</div>
                        <div className="font-black text-sm text-amber-300">
                          {formatTL(input.marketResearch.monthlyRentM2TL)}/m² / ay
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ~{formatTL(input.marketResearch.estimatedMonthlyRentTL)} TL / Ay (120m²)
                        </div>
                      </div>
                    )}
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-slate-400">Satılabilir Konut Emsali</div>
                      <div className="font-black text-sm text-emerald-300">
                        {formatTL(input.marketResearch.unitSaleM2PriceTL)}/m²
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Aralık: {formatTL(input.marketResearch.unitSaleM2MinTL)} - {formatTL(input.marketResearch.unitSaleM2MaxTL)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{input.marketResearch.marketTrend}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <span>Kaynaklar:</span>
                      <span className="text-slate-200 font-medium">{input.marketResearch.sources.join(" • ")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5 pt-1">
                  <span>💡</span>
                  <span>Butona bastığınızda <strong>Sahibinden, Hepsiemlak, Endeksa ve TCMB</strong> piyasa emsalleri taranarak aşağıdaki fiyat ve oranlar otomatik doldurulur.</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-orange-50/80 border border-orange-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(input.isTender || input.isAuction)}
                    onChange={(e) => {
                      const val = e.target.checked;
                      onChange({
                        ...input,
                        isTender: val,
                        isAuction: val,
                        auctionTargetProfitPercent: input.auctionTargetProfitPercent ?? 25,
                        kdvRatePercent: input.kdvRatePercent ?? 10,
                        evictionRiskBufferTL: input.evictionRiskBufferTL ?? 50000,
                        auctionStartingPriceTL: input.auctionStartingPriceTL || input.askedPriceTL || 0,
                      });
                    }}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-extrabold text-orange-950 flex items-center gap-1.5">
                    <Gavel className="w-4 h-4 text-orange-600" />
                    Bu Taşınmaz Bir Resmi İhale / İcra Satış Dosyası mı? (Yatırımcı Analizi)
                  </span>
                </label>
                {(input.isTender || input.isAuction) && (
                  <span className="text-[10px] font-bold bg-orange-600 text-white px-2 py-0.5 rounded-full">
                    Tavan Pey Aktif
                  </span>
                )}
              </div>

              {(input.isTender || input.isAuction) && (
                <div className="space-y-3 pt-2.5 border-t border-orange-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-orange-900 mb-0.5">
                        İhaleyi Açan Kurum
                      </label>
                      <input
                        type="text"
                        value={input.tenderAuthority || ""}
                        onChange={(e) => updateField("tenderAuthority", e.target.value)}
                        placeholder="Örn: Kadıköy 4. İcra Dairesi / Belediye"
                        className="w-full px-2.5 py-1.5 bg-white border border-orange-300 rounded-lg text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-orange-900 mb-0.5">
                        İhale / Dosya No
                      </label>
                      <input
                        type="text"
                        value={input.tenderFileNo || ""}
                        onChange={(e) => updateField("tenderFileNo", e.target.value)}
                        placeholder="Örn: 2026/842-ESAT"
                        className="w-full px-2.5 py-1.5 bg-white border border-orange-300 rounded-lg text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* İhale Finansal Parametreleri */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white/70 p-3 rounded-lg border border-orange-200/80">
                    <div>
                      <label className="block text-[10px] font-extrabold text-orange-950 mb-0.5">
                        İhale Başlangıç / Muhammen Bedel (TL)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={input.auctionStartingPriceTL || input.askedPriceTL || ""}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onChange({
                            ...input,
                            auctionStartingPriceTL: val,
                            askedPriceTL: val,
                          });
                        }}
                        placeholder="3500000"
                        className="w-full px-2 py-1 bg-white border border-orange-300 rounded text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-orange-950 mb-0.5">
                        Hedeflenen Net ROI (%)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        step="5"
                        value={input.auctionTargetProfitPercent ?? 25}
                        onChange={(e) => updateField("auctionTargetProfitPercent", Number(e.target.value))}
                        placeholder="25"
                        className="w-full px-2 py-1 bg-white border border-orange-300 rounded text-xs font-bold text-slate-900"
                      />
                      <span className="text-[9px] text-orange-800">Tavan pey bu kârı kilitler</span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-orange-950 mb-0.5">
                        İhale KDV Oranı (%)
                      </label>
                      <select
                        value={input.kdvRatePercent ?? 10}
                        onChange={(e) => updateField("kdvRatePercent", Number(e.target.value) as 1 | 10 | 20)}
                        className="w-full px-2 py-1 bg-white border border-orange-300 rounded text-xs font-bold text-slate-900"
                      >
                        <option value="1">%1 (Konut &lt; 150m²)</option>
                        <option value="10">%10 (Standart Konut / İşyeri)</option>
                        <option value="20">%20 (Ticari & Lüks / Arsa)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-extrabold text-orange-950 mb-0.5">
                        Tahliye, Haciz Terkini & Hukuk Tamponu (TL)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={input.evictionRiskBufferTL ?? 50000}
                        onChange={(e) => updateField("evictionRiskBufferTL", Number(e.target.value))}
                        placeholder="50000"
                        className="w-full px-2.5 py-1.5 bg-white border border-orange-300 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[10px] text-amber-900 flex flex-col justify-center">
                      <div className="font-bold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Otomatik Yasal Masraflar</span>
                      </div>
                      <span className="text-[9px] text-slate-600 mt-0.5">
                        Tellaliye (%1) ve Damga Vergisi (‰5.69) sistemce formüle otomatik dahil edilir.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {input.isTender ? "İhale Başlangıç / Tahmini Bedel (TL) *" : "İstenen Satış Fiyatı (TL) *"}
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={input.askedPriceTL || ""}
                  onChange={(e) => updateField("askedPriceTL", Number(e.target.value))}
                  placeholder="9800000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bölgedeki Emsal Satış m² Fiyatı (TL)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={input.estimatedUnitSaleM2PriceTL || ""}
                  onChange={(e) => updateField("estimatedUnitSaleM2PriceTL", Number(e.target.value))}
                  placeholder="95000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {!isResidential ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bölgedeki Emsal Arsa m² Fiyatı (TL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={input.estimatedLandM2PriceTL || ""}
                    onChange={(e) => updateField("estimatedLandM2PriceTL", Number(e.target.value))}
                    placeholder="13000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kat Karşılığı Müteahhit Payı (%)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="80"
                    value={input.contractorSharePercent || ""}
                    onChange={(e) => updateField("contractorSharePercent", Number(e.target.value))}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bölgedeki Emsal Aylık Kira Bedeli (TL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={input.monthlyRentEstimateTL || ""}
                    onChange={(e) => updateField("monthlyRentEstimateTL", Number(e.target.value))}
                    placeholder="25000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Banka Kredisi & BDDK Kaldıraç Simülatörü */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                  <Landmark className="w-3.5 h-3.5 text-blue-600" />
                  <span>Banka Kredisi & BDDK Kaldıraç Simülatörü</span>
                </div>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                  Anüite Taksit Modeli
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-slate-600">BDDK Azami Kredi (LTV):</label>
                    <span className="text-[10px] font-mono font-bold text-blue-600">%{input.creditLtvPercent ?? 60}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={input.creditLtvPercent ?? 60}
                    onChange={(e) => updateField("creditLtvPercent", Number(e.target.value))}
                    className="w-full accent-blue-600 h-1.5"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>%20</span>
                    <span>%60 (Standart)</span>
                    <span>%90</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Aylık Kredi Faiz Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="6.0"
                    step="0.05"
                    value={input.creditInterestRateMonthly ?? 2.99}
                    onChange={(e) => updateField("creditInterestRateMonthly", Number(e.target.value))}
                    placeholder="2.99"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[9px] text-slate-400">Piyasa ortalaması: ~%2.89 - %3.15</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Kredi Vadesi
                  </label>
                  <select
                    value={input.creditTermMonths ?? 120}
                    onChange={(e) => updateField("creditTermMonths", Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="60">60 Ay (5 Yıl)</option>
                    <option value="84">84 Ay (7 Yıl)</option>
                    <option value="120">120 Ay (10 Yıl - Standart)</option>
                    <option value="180">180 Ay (15 Yıl)</option>
                  </select>
                  <span className="text-[9px] text-slate-400">Azami taksit & nakit akışı</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEKME 5: DANIŞMAN & OFİS BİLGİLERİ (ORTAK) */}
        {activeTab === "agency" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Danışman Adı Soyadı
                </label>
                <input
                  type="text"
                  value={input.consultantName}
                  onChange={(e) => updateField("consultantName", e.target.value)}
                  placeholder="Hasan Hüseyin Yıldırım"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  İletişim Telefonu
                </label>
                <input
                  type="text"
                  value={input.consultantPhone}
                  onChange={(e) => updateField("consultantPhone", e.target.value)}
                  placeholder="0850 840 86 95"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emlak Ofisi / Şirket Unvanı
              </label>
              <input
                type="text"
                value={input.consultantAgency}
                onChange={(e) => updateField("consultantAgency", e.target.value)}
                placeholder="İhaleciBurada Kurumsal Portföy veya Kendi Ofisiniz"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ekspertiz Notları / Açıklama
              </label>
              <textarea
                rows={3}
                value={input.notes || ""}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Taşınmazın manzarası, tadilat durumu, ulaşım avantajları..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Alt Navigasyon */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Değişiklikler anlık olarak fizibilite kartına yansır.
        </span>
        <div className="flex items-center gap-2">
          {activeTab !== "location" && (
            <button
              type="button"
              onClick={() => setActiveTab("location")}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
            >
              Başa Dön
            </button>
          )}

          {activeTab !== "agency" && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === "location") {
                  setActiveTab(isResidential ? "residential_features" : "zoning");
                } else if (activeTab === "residential_features") {
                  setActiveTab("rental_yield");
                } else if (activeTab === "rental_yield") {
                  setActiveTab("finance");
                } else if (activeTab === "zoning") {
                  setActiveTab("topography");
                } else if (activeTab === "topography") {
                  setActiveTab("finance");
                } else if (activeTab === "finance") {
                  setActiveTab("agency");
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold transition cursor-pointer shadow-xs"
            >
              Sonraki Adım
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
