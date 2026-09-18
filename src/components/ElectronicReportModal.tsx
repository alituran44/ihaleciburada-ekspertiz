"use client";

import React, { useState } from "react";
import { 
  FileText, 
  X, 
  Printer, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { ValuationFormData } from "./valuation/types";
import { ReportPagesContent } from "./ReportPagesContent";

interface ElectronicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData?: ValuationFormData;
  propertyTitle?: string;
  category?: "konut" | "arsa" | "arazi";
  locationText?: string;
  parcelText?: string;
  marketValueTL?: number;
  areaM2?: number;
}

export const ElectronicReportModal: React.FC<ElectronicReportModalProps> = ({
  isOpen,
  onClose,
  formData,
  propertyTitle,
  category = "konut",
  locationText,
  parcelText,
  marketValueTL,
  areaM2,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 13;

  if (!isOpen) return null;

  // Dinamik Değerleme Değişkenleri
  const city = formData?.city || "Çanakkale";
  const district = formData?.district || "Merkez";
  const neighborhood = formData?.neighborhood || "Kepez";
  const ada = formData?.ada || "117";
  const parsel = formData?.parsel || "9";
  const pafta = formData?.pafta || "H17-D-04-B";

  const effectiveCategory = (formData?.service === "konut" || formData?.service === "arsa" || formData?.service === "arazi") 
    ? formData.service 
    : (category || "konut");

  const effectiveAreaM2 = formData?.service === "arsa" 
    ? (formData.arsaAreaM2 || areaM2 || 850) 
    : formData?.service === "arazi" 
      ? (formData.araziAreaM2 || areaM2 || 1250) 
      : (formData?.grossAreaM2 || areaM2 || 135);

  const roomCount = formData?.roomCount || 3;
  const livingRoomCount = formData?.livingRoomCount || 1;
  const buildingAge = formData?.buildingAge ?? 5;
  const floorNumber = formData?.floorNumber ?? 2;
  const totalFloors = formData?.totalFloors || 5;
  const pga = formData?.pgaSeismicHazard || "0.220g";

  const effectiveMarketValue = marketValueTL || 9425000;
  const minPrice = Math.round(effectiveMarketValue * 0.95);
  const maxPrice = Math.round(effectiveMarketValue * 1.06);
  const m2Price = Math.round(effectiveMarketValue / (effectiveAreaM2 || 1));
  const rentEstimate = Math.round(effectiveMarketValue / 210);
  const tenderBasePriceTL = Math.round(effectiveMarketValue * 0.50);

  const effectiveLocation = locationText || `${neighborhood}, ${district}, ${city}`;
  const effectiveParcelText = parcelText || `${city}, ${district}, ${neighborhood}, ${ada} Ada, ${parsel} Parsel`;
  const effectiveTitle = propertyTitle || `${city}, ${district}, ${neighborhood} Portföyü`;

  const reportDataProps = {
    city,
    district,
    neighborhood,
    ada,
    parsel,
    pafta,
    effectiveCategory,
    effectiveAreaM2,
    roomCount,
    livingRoomCount,
    buildingAge,
    floorNumber,
    totalFloors,
    pga,
    effectiveMarketValue,
    minPrice,
    maxPrice,
    m2Price,
    rentEstimate,
    tenderBasePriceTL,
    effectiveLocation,
    effectiveParcelText,
    effectiveTitle,
    formData,
    uploadedPhotos: formData?.uploadedPhotos,
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      const originalTitle = document.title;
      document.title = `IhaleciBurada_Ekspertiz_Raporu_${city}_${ada}_${parsel}`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #electronic-report-print-area, #electronic-report-print-area * {
            visibility: visible;
          }
          #electronic-report-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .report-page-sheet {
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            min-height: 275mm !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }
          .report-page-sheet:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .print-hidden-element {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* MODAL ÜST ÇUBUĞU */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print-hidden-element">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#0B1E3B] to-slate-900 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 shadow-xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-2">
                  <span>İhaleciBurada Lisanslı Elektronik Ekspertiz Raporu</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                    SPK & İİK m.115 Uyumlu
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {effectiveTitle} — Sayfa {currentPage} / {totalPages}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sayfa Değiştirici */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded-lg p-1 mr-2 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Önceki Sayfa"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold px-2 text-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Sonraki Sayfa"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Yazdır / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-400 text-slate-400 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SAYFA SEKMELERİ ÇUBUĞU */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs font-semibold print-hidden-element">
            {[
              { p: 1, title: "1. Kapak" },
              { p: 2, title: "2. Danışman" },
              { p: 3, title: "3. Fotoğraflar" },
              { p: 4, title: "4. Özellik & Değer" },
              { p: 5, title: "5. Değer Projeksiyonu" },
              { p: 6, title: "6. Bekleyen Emsaller" },
              { p: 7, title: "7. Yeni Emsaller" },
              { p: 8, title: "8. Emsal Sıralaması" },
              { p: 9, title: "9. Demografi" },
              { p: 10, title: "10. Tüketim & Konum" },
              { p: 11, title: "11. Satılık & Kiralık" },
              { p: 12, title: "12. Arazi Haritaları" },
              { p: 13, title: "13. Seçim Analizi" },
            ].map((item) => (
              <button
                key={item.p}
                type="button"
                onClick={() => setCurrentPage(item.p)}
                className={`px-3 py-1 rounded-md text-[11px] whitespace-nowrap transition cursor-pointer ${
                  currentPage === item.p
                    ? "bg-[#E11D48] text-white font-black shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* EKRAN GÖRÜNÜMÜ: SADECE SEÇİLİ SAYFA */}
          <div className="print-hidden-element flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-10 min-h-[700px] flex flex-col justify-between relative">
              <ReportPagesContent currentPage={currentPage} {...reportDataProps} />
            </div>
          </div>

          {/* BASKI (PRINT / PDF) GÖRÜNÜMÜ: 13 SAYFA SIRALI A4 */}
          <div id="electronic-report-print-area" className="hidden print:block w-full bg-white text-slate-900">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <div key={p} className="report-page-sheet bg-white">
                <ReportPagesContent currentPage={p} {...reportDataProps} />
              </div>
            ))}
          </div>

          {/* MODAL ALT GEZİNME VE İŞLEM ÇUBUĞU */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 print-hidden-element">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Önceki Sayfa</span>
            </button>

            <div className="text-xs font-bold text-slate-500">
              Sayfa <span className="text-[#E11D48] font-black">{currentPage}</span> / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>Sonraki Sayfa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
