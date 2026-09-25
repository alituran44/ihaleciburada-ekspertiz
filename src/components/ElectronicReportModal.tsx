"use client";

import React, { useState } from "react";
import { 
  FileText, 
  X, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Loader2,
  CheckCircle2,
  ChevronDown
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; stage: string }>({
    current: 0,
    total: 13,
    stage: "",
  });
  const [showPdfOptions, setShowPdfOptions] = useState<boolean>(false);
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

  const handleDownloadFullPdf = async () => {
    setIsGeneratingPdf(true);
    setShowPdfOptions(false);
    setPdfProgress({ current: 0, total: totalPages, stage: "PDF motoru başlatılıyor..." });

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      for (let p = 1; p <= totalPages; p++) {
        setPdfProgress({
          current: p,
          total: totalPages,
          stage: `Sayfa ${p} / ${totalPages} derleniyor...`,
        });

        const pageElement = document.getElementById(`pdf-capture-page-${p}`);
        if (!pageElement) continue;

        const canvas = await html2canvas(pageElement, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: 794,
          windowWidth: 794,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.90);
        if (p > 1) {
          pdf.addPage("a4", "portrait");
        }
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

        // Clean up memory
        canvas.width = 0;
        canvas.height = 0;
      }

      setPdfProgress({
        current: totalPages,
        total: totalPages,
        stage: "Dosya kaydediliyor...",
      });

      const fileName = `IhaleciBurada_Ekspertiz_Raporu_${city}_${ada}_${parsel}.pdf`;
      pdf.save(fileName);

      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 1000);
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      alert("Doğrudan PDF oluşturulurken bir sorun oluştu. Yazdır / PDF seçeneği ile kaydedebilirsiniz.");
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadSinglePage = async (pageNumber: number) => {
    setIsGeneratingPdf(true);
    setShowPdfOptions(false);
    setPdfProgress({ current: 1, total: 1, stage: `Sayfa ${pageNumber} hazırlanıyor...` });

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const pageElement = document.getElementById(`pdf-capture-page-${pageNumber}`);
      if (!pageElement) throw new Error("Sayfa bulunamadı");

      const canvas = await html2canvas(pageElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.90);
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");

      const fileName = `IhaleciBurada_Rapor_Sayfa_${pageNumber}_${city}_${ada}_${parsel}.pdf`;
      pdf.save(fileName);

      setTimeout(() => {
        setIsGeneratingPdf(false);
      }, 800);
    } catch (error) {
      console.error("Tek sayfa PDF hatası:", error);
      alert("Sayfa PDF oluşturulamadı.");
      setIsGeneratingPdf(false);
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

              {/* DİREKT PDF İNDİR BUTONU & MENÜSÜ */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPdfOptions(!showPdfOptions)}
                  disabled={isGeneratingPdf}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shadow-emerald-950/40 disabled:opacity-50"
                  title="PDF Dosyası Olarak İndir"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF İndir</span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>

                {showPdfOptions && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={handleDownloadFullPdf}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 text-white font-bold flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                        13
                      </div>
                      <div>
                        <div className="text-slate-100 font-bold">13 Sayfa Tam Rapor</div>
                        <div className="text-[10px] text-slate-400 font-normal">Resmi SPK/BDDK Ekspertiz (.pdf)</div>
                      </div>
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      type="button"
                      onClick={() => handleDownloadSinglePage(currentPage)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                        {currentPage}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">Görüntülenen Sayfayı İndir</div>
                        <div className="text-[10px] text-slate-400">Sayfa {currentPage} (.pdf)</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Yazdır</span>
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

          {/* GİZLİ PDF ÇIKTI OLUŞTURMA ALANI (DOM İÇİNDE, EKRAN DIŞINDA) */}
          <div
            id="pdf-hidden-capture-container"
            aria-hidden="true"
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "794px",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              zIndex: -9999,
              pointerEvents: "none",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <div
                key={`pdf-page-${p}`}
                id={`pdf-capture-page-${p}`}
                style={{
                  width: "794px",
                  minHeight: "1123px",
                  backgroundColor: "#ffffff",
                  padding: "36px",
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <ReportPagesContent currentPage={p} {...reportDataProps} />
              </div>
            ))}
          </div>

          {/* PDF OLUŞTURULUYOR İLERLEME MODALI */}
          {isGeneratingPdf && (
            <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black tracking-tight text-white font-heading">
                    E-Ekspertiz Raporu PDF&apos;e Dönüştürülüyor
                  </h3>
                  <p className="text-xs text-slate-400">
                    SPK ve BDDK standartlarında 13 sayfa yüksek çözünürlüklü A4 dokümanı derleniyor.
                  </p>
                </div>

                {/* İlerleme Çubuğu */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="bg-linear-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.max(5, Math.round((pdfProgress.current / pdfProgress.total) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 px-1">
                    <span className="text-amber-400">{pdfProgress.stage}</span>
                    <span className="text-emerald-400">
                      %{Math.round((pdfProgress.current / pdfProgress.total) * 100)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>İşlem bitince PDF otomatik olarak cihazınıza inecektir.</span>
                </div>
              </div>
            </div>
          )}

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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadFullPdf}
                disabled={isGeneratingPdf}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>13 Sayfa PDF İndir</span>
              </button>
              <div className="text-xs font-bold text-slate-500">
                Sayfa <span className="text-[#E11D48] font-black">{currentPage}</span> / {totalPages}
              </div>
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
