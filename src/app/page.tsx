"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ValuationWizard } from "@/components/ValuationWizard";
import { FeasibilityPreview } from "@/components/FeasibilityPreview";
import { ReportView } from "@/components/ReportView";
import { WhatsAppShareModal } from "@/components/WhatsAppShareModal";
import { ParcelInput } from "@/types";
import { SAMPLE_SCENARIOS } from "@/lib/constants";
import { calculateFeasibility } from "@/lib/calculator";
import { 
  Building, 
  FileSpreadsheet, 
  Sparkles, 
  ShieldCheck, 
  Gavel, 
  CheckCircle, 
  Layers, 
  TrendingUp,
  FileCheck
} from "lucide-react";

export default function Home() {
  // Varsayılan olarak Çanakkale Belediye İhalesi senaryosu ile başlar
  const [parcelData, setParcelData] = useState<ParcelInput>(SAMPLE_SCENARIOS[0].data);
  const [viewMode, setViewMode] = useState<"calculator" | "report">("calculator");
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  // Anlık fizibilite hesaplaması
  const calculation = useMemo(() => {
    return calculateFeasibility(parcelData);
  }, [parcelData]);

  const handleReset = () => {
    if (parcelData.category === "konut") {
      setParcelData({
        category: "konut",
        title: "Yeni Konut / Daire Portföyü",
        city: "İstanbul",
        district: "Kadıköy",
        neighborhood: "Caferağa",
        ada: "",
        parsel: "",
        areaM2: 125,
        netAreaM2: 105,
        housingType: "daire",
        roomCount: "3+1",
        buildingAge: "1-5",
        floorLocation: "ara_kat",
        totalFloorsInBuilding: 5,
        heatingType: "dogalgaz_kombi",
        deedStatus: "kat_mulkiyeti",
        hasElevator: true,
        hasParking: true,
        hasBalcony: true,
        inGatedCommunity: false,
        isFurnished: false,
        isCreditEligible: true,
        monthlyRentEstimateTL: 35000,
        roadAccess: "var",
        roadFrontageM: 15,
        isCornerParcel: false,
        topography: "duz",
        zoningType: "konut",
        kaks: 1.5,
        taks: 0.35,
        gabariM: 15,
        maxFloors: 5,
        relinquishmentRatio: 0,
        askedPriceTL: 6500000,
        isTender: false,
        estimatedLandM2PriceTL: 25000,
        estimatedUnitSaleM2PriceTL: 55000,
        contractorSharePercent: 50,
        consultantName: "",
        consultantPhone: "",
        consultantAgency: "İhaleciBurada Portföy Danışmanlığı",
      });
    } else {
      setParcelData({
        category: "arsa",
        title: "Yeni Arsa Portföyü",
        city: "Çanakkale",
        district: "Merkez",
        neighborhood: "",
        ada: "",
        parsel: "",
        areaM2: 1000,
        roadAccess: "var",
        roadFrontageM: 20,
        isCornerParcel: false,
        topography: "duz",
        zoningType: "konut",
        kaks: 1.50,
        taks: 0.35,
        gabariM: 15.5,
        maxFloors: 5,
        relinquishmentRatio: 10,
        askedPriceTL: 10000000,
        isTender: false,
        estimatedLandM2PriceTL: 10000,
        estimatedUnitSaleM2PriceTL: 40000,
        contractorSharePercent: 50,
        consultantName: "",
        consultantPhone: "",
        consultantAgency: "İhaleciBurada Portföy Danışmanlığı",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      <Header onNewReportClick={() => {
        handleReset();
        setViewMode("calculator");
      }} />

      {/* RAPOR GÖRÜNÜMÜ MODU */}
      {viewMode === "report" ? (
        <main className="flex-1 py-8 px-4 sm:px-6">
          <ReportView 
            input={parcelData}
            calc={calculation}
            onBack={() => setViewMode("calculator")}
            onOpenShareModal={() => setShareModalOpen(true)}
          />
        </main>
      ) : (
        /* HESAPLAYICI VE ÇALIŞMA ALANI MODU */
        <main className="flex-1">
          {/* Hero Tanıtım Şeridi */}
          <section className="bg-gradient-to-b from-[#0F223D] via-[#0B1E3B] to-[#07111F] text-white py-12 px-4 sm:px-6 border-b border-slate-800">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-xs flex items-center gap-1.5 font-heading">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                  ihaleciburada.com Sub-Domain Altyapısı
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 font-bold text-xs flex items-center gap-1.5">
                  <Gavel className="w-3.5 h-3.5 text-orange-400" />
                  Arsa & Konut İhale Ekspertizi
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight">
                    Arsa ve Konut Yatırımcıları İçin <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
                      3 Dakikada Ekspertiz, Fizibilite & A-Sınıfı Rapor
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Arsa için 3194 İmar Kanunu algoritmalarıyla KAKS, taban alanı, kat karşılığı ve inşaat hasılatı; 
                    Konut için bina yaşı, deprem kriteri, kira amortismanı ve adil piyasa değerini saniyeler içinde hesaplayın.
                  </p>
                </div>

                <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Neler Kazanırsınız?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Banka standardında A4 PDF Ekspertiz Raporu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>İhale teklif tavanı ve amortisman simülatörü</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Müşteriye tek tıkla WhatsApp Yatırım Brifi</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* İKİLİ ÇALIŞMA ALANI: FORM (SOL) + CANLI FİZİBİLİTE KARTI (SAĞ) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Sol Taraf: Sihirbaz (7 Kolon) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-black font-heading text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                      <span>{parcelData.category === "konut" ? "Konut & Daire Değerleme Girişi" : "Arsa & İmar Veri Girişi"}</span>
                    </h2>
                    <span className="text-xs text-slate-500">
                      Tüm alanlar anlık hesaplanır
                    </span>
                  </div>

                  <ValuationWizard 
                    input={parcelData}
                    onChange={setParcelData}
                    onReset={handleReset}
                  />
                </div>
              </div>

              {/* Sağ Taraf: Canlı Fizibilite Kartı (5 Kolon - Sticky) */}
              <div className="lg:col-span-5">
                <FeasibilityPreview 
                  input={parcelData}
                  calc={calculation}
                  onViewReport={() => setViewMode("report")}
                />
              </div>
            </div>
          </section>

          {/* NASIL ÇALIŞIR? BÖLÜMÜ */}
          <section id="nasil-calisir" className="bg-white border-y border-slate-200 py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-heading">
                  Süreç & Metodoloji
                </span>
                <h2 className="text-2xl font-black font-heading text-slate-900">
                  3 Adımda Eksiksiz Arsa Ekspertizi
                </h2>
                <p className="text-xs text-slate-600">
                  Belediye belediye dolaşmadan, karmaşık yönetmeliklerle boğuşmadan profesyonel yatırım kararı alın.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black font-heading text-base">
                    01
                  </div>
                  <h3 className="text-sm font-black text-slate-900 font-heading">
                    Ada, Parsel ve İmar Parametreleri
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Arsanın tapu alanını, KAKS (emsal), TAKS, gabari ve terk oranını girin. İhale ise dosya no ve ihale başlangıç bedelini tanımlayın.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black font-heading text-base">
                    02
                  </div>
                  <h3 className="text-sm font-black text-slate-900 font-heading">
                    Yönetmelik ve Hasılat Algoritması
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sistem 3194 Sayılı İmar Kanunu ve Planlı Alanlar Yönetmeliği çerçevesinde net satılabilir inşaat alanını, maliyeti ve kat karşılığı dağılımını hesaplar.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black font-heading text-base">
                    03
                  </div>
                  <h3 className="text-sm font-black text-slate-900 font-heading">
                    Kurumsal Rapor ve Hızlı Paylaşım
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Emlak ofisinizin künyesi ve İhaleciBurada doğrulama rozetiyle A4 PDF çıktısı alın veya WhatsApp'tan tek tıkla yatırımcı brifi gönderin.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* WhatsApp Paylaşım Modalı */}
      <WhatsAppShareModal 
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        input={parcelData}
        calc={calculation}
      />

      <Footer />
    </div>
  );
}
