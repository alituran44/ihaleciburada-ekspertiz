"use client";

import React, { useState } from "react";
import { 
  X, 
  FileText, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Info, 
  Sliders, 
  Camera, 
  FolderCheck, 
  Check, 
  Sparkles,
  Coins
} from "lucide-react";

export type ReportPackageType = "emsal" | "konut" | "elit";

interface ReportSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportPreview: (packageType: ReportPackageType) => void;
  city?: string;
  district?: string;
  neighborhood?: string;
  ada?: string;
  parsel?: string;
  areaM2?: number;
  category?: "konut" | "arsa" | "arazi";
  nitelik?: string;
}

export const ReportSelectionModal: React.FC<ReportSelectionModalProps> = ({
  isOpen,
  onClose,
  onOpenReportPreview,
  city = "Çanakkale",
  district = "Çan",
  neighborhood = "Muratlar",
  ada = "48507",
  parsel = "1",
  areaM2 = 110,
  category = "konut",
  nitelik = "Betonarme Mesken ve Müştemilatı",
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTier, setSelectedTier] = useState<ReportPackageType>("elit");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: "01 Raporlar", subtitle: "Rapor türünü seçin", icon: FileText },
    { id: 2, title: "02 Filtreler", subtitle: "Rapor filtrelerini ayarlayın", icon: Sliders },
    { id: 3, title: "03 Sokaktan Görünüm", subtitle: "Uydu & Street View görselleri ekleyin", icon: Camera },
    { id: 4, title: "04 Belgeler", subtitle: "Gerekli dokümanları yükleyin", icon: FolderCheck },
    { id: 5, title: "05 Bitti", subtitle: "İşlemi tamamlayın", icon: CheckCircle2 },
  ];

  const packages = [
    {
      id: "emsal" as ReportPackageType,
      title: "Emsal Raporu",
      tag: "Temel Piyasa Analizi",
      description:
        "Belirlenen kategoride (konut, işyeri, arsa) ayrı ayrı talep edilebilir. Filtreleme yaparak çalışmaktadır. Alt kategori, metrekare büyüklüğü, bina yaşı gibi değere etki eden faktörlerin tümünü analiz edebilmektedir. Genel itibariyle emlak danışmanları, değerleme uzmanları, müteahhitler tarafından kullanılmaktadır. Lokasyonel bazda veri yoğunluğuna göre değişiklik göstermekle birlikte 5-10 sayfa, dikey A4, renkli ve PDF formatında tarafınıza sunulur.",
      pages: "5 - 10 Sayfa",
      priceTL: 49.99,
      tokens: 10,
      badge: "Hızlı Emsal",
      isPopular: false,
    },
    {
      id: "konut" as ReportPackageType,
      title: category === "arsa" ? "Arsa Değerleme Raporu" : "Konut Değerleme Raporu",
      tag: "Kapsamlı İnceleme",
      description: `${category === "arsa" ? "Arsa ve arazi" : "Konut"} kategorisinde yer alan dataları barındıran resmi analiz raporudur. Rapor içerisinde parsele özgü fiyat/değer, TKGM mülkiyet sınırları, imar durumu ve teknik bilgiler yer alır. Genel olarak gayrimenkul danışmanları ve yatırımcılar tarafından talep edilmektedir. Lokasyonel bazda veri yoğunluğuna göre 20-25 sayfa arasında, dikey A4, renkli ve resmi PDF formatında hazırlanır.`,
      pages: "20 - 25 Sayfa",
      priceTL: 149.99,
      tokens: 30,
      badge: "Detaylı Teknik",
      isPopular: false,
    },
    {
      id: "elit" as ReportPackageType,
      title: "Elit İhale & SPK Raporu",
      tag: "Kurumsal & İcra Arbitrajı",
      description:
        "En kapsamlı resmi raporlama standardıdır. İçerisinde satılık, kiralık, konut, arsa ve ticari değer/teknik detaylar ayrı ayrı ve karşılaştırmalı olarak sunulur. İİK m.115 %50 icra tabanı simülasyonu, AFAD PGA deprem risk katsayısı, SPK lisanslı değerleme metodolojileri yer alır. Avukatlar, mali müşavirler, icra yatırımcıları ve kamu yöneticileri tarafından sıklıkla tercih edilmektedir. 13 - 100 sayfa arasında, dikey A4, renkli ve tescilli PDF formatında teslim edilir.",
      pages: "13 - 100 Sayfa",
      priceTL: 499.99,
      tokens: 100,
      badge: "SPK & İİK m.115 Uyumlu",
      isPopular: true,
    },
  ];

  const handleSelectAndOpen = (tierId: ReportPackageType) => {
    setSelectedTier(tierId);
    onOpenReportPreview(tierId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto transition-transform duration-150"
      >
        
        {/* 1. ÜST GEZİNME & PARSEL KÜNYESİ BARI (Görseldeki Gibi) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight">Rapor Al</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              {/* Tapusor Stili Parsel Özeti */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-amber-300/90 font-medium font-mono pt-0.5">
                <span className="text-white font-bold">{city}</span>
                <span>/</span>
                <span>{district}</span>
                <span>/</span>
                <span>{neighborhood || "Merkez"}</span>
                <span>/</span>
                <span className="bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-300 font-bold">
                  {ada || "48507"} Ada
                </span>
                <span>/</span>
                <span className="bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-300 font-bold">
                  {parsel || "1"} Parsel
                </span>
                <span>/</span>
                <span className="text-slate-300">{areaM2 || 110} m²</span>
                <span>/</span>
                <span className="text-slate-400 truncate max-w-[200px]">{nitelik}</span>
              </div>
            </div>
          </div>

          {/* Sağ Zoom & Kapat Kontrolleri */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <span className="text-[11px] font-mono font-bold px-2 text-slate-300">
                %{zoomLevel}
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                title="Küçült"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(125, z + 10))}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                title="Büyüt"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 text-[10px] text-slate-300 hover:text-white hover:bg-slate-700 rounded cursor-pointer font-medium"
              >
                Sıfırla
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. ANA GÖVDE: SOL 5 ADIMLI ÇUBUK + SAĞ RAPOR KARTLARI */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* SOL ADIM GEZİNTİSİ (%25 Genişlik) */}
          <div className="w-full md:w-[260px] bg-slate-50 border-r border-slate-200 p-4 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPassed = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`text-left p-3 rounded-xl transition flex items-start gap-3 cursor-pointer w-full shrink-0 ${
                    isActive
                      ? "bg-white text-slate-900 border-2 border-amber-500 shadow-sm"
                      : isPassed
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-400 hover:bg-slate-100/60"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                    isActive
                      ? "border-2 border-amber-500 text-amber-600 bg-amber-50"
                      : isPassed
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-300 text-slate-400"
                  }`}>
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </div>
                  <div>
                    <div className={`text-xs font-black leading-tight ${isActive ? "text-slate-900" : ""}`}>
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-snug hidden md:block">
                      {step.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Bakiye / Jeton Kutusu */}
            <div className="hidden md:block mt-auto p-3.5 rounded-xl bg-gradient-to-br from-[#0B1E3B] to-slate-900 text-white border border-slate-800">
              <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Mevcut Jeton Miktarı</span>
              </div>
              <div className="text-xl font-black font-mono text-white mt-1">
                10 Jeton
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                İhaleciBurada Kurumsal Bakiye
              </div>
            </div>
          </div>

          {/* SAĞ RAPOR LİSTESİ (%75 Genişlik - Scroll Edilebilir) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
            
            {/* Başlık ve Açıklama */}
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                Emlak Muayenesi Raporları
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Türkiye&apos;nin her yerinden saniyeler içinde rapor alın, gayrimenkullerinizi resmi kadastro, emsal ve İİK verileriyle detaylı olarak inceleyin.
              </p>
            </div>

            {/* 3 Adet Rapor Kartı */}
            <div className="space-y-4">
              {packages.map((pkg) => {
                const isSelected = selectedTier === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/20 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Sol: Metin ve Detaylar */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 font-heading">
                            {pkg.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {pkg.pages}
                          </span>
                          {pkg.isPopular && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              {pkg.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed text-justify">
                          {pkg.description}
                        </p>

                        {/* Örnek İncele Butonu */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectAndOpen(pkg.id)}
                            className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>Örnek İncele</span>
                          </button>
                        </div>
                      </div>

                      {/* Sağ: Fiyatlandırma ve Seç Butonu */}
                      <div className="lg:w-44 shrink-0 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {pkg.priceTL.toFixed(2)} TL
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 font-mono mt-0.5 justify-start lg:justify-end">
                            <Coins className="w-3 h-3 text-amber-500" />
                            <span>{pkg.tokens} jeton</span>
                          </div>
                        </div>

                        {/* Tapusor Stili Sarı/Kehribar "Seç [Kilit]" Butonu */}
                        <button
                          type="button"
                          onClick={() => handleSelectAndOpen(pkg.id)}
                          className="mt-2 py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Seç</span>
                          <Lock className="w-3.5 h-3.5 text-slate-950" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alt Kurumsal Güvence Şeridi */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tüm raporlar resmi SPK değerleme ilkelerine ve İcra İflas Kanunu m.115 normlarına uygun hazırlanır.</span>
              </div>
              <span className="font-mono text-slate-400 text-[10px] shrink-0">
                128-Bit SSL Doğrulama
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
