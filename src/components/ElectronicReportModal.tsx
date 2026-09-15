"use client";

import React, { useState } from "react";
import { 
  FileText, 
  X, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Building, 
  Award, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Layers,
  Compass,
  Zap,
  Droplets,
  TreePine
} from "lucide-react";

interface ElectronicReportModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  propertyTitle = "Referans Ankara Sitesi No E Blok",
  category = "konut",
  locationText = "Devlet Mah. Etimesgut, Ankara",
  parcelText = "Ankara, Etimesgut, Eryaman, 48507 Ada, 1 Parsel",
  marketValueTL = 7900000,
  areaM2 = 110,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 13;

  if (!isOpen) return null;

  const minPrice = Math.round(marketValueTL * 0.95);
  const maxPrice = Math.round(marketValueTL * 1.06);
  const m2Price = Math.round(marketValueTL / (areaM2 || 1));
  const rentEstimate = Math.round(marketValueTL / 185);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL ÜST ÇUBUĞU */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0B1E3B] to-slate-900 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 shadow-xs">
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
                {propertyTitle} — Sayfa {currentPage} / {totalPages}
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
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs font-semibold">
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

        {/* RAPOR GÖVDE SAYFASI (13 Sayfa Birebir PDF Mantığı) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 font-sans">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-10 min-h-[700px] flex flex-col justify-between relative">
            
            {/* SAYFA 1: KAPAK (media_1789464761780.pdf Sayfa 1 Birebir) */}
            {currentPage === 1 && (
              <div className="space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-4 border-[#E11D48] pb-3 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading uppercase leading-tight">
                      {category === "arsa" 
                        ? "SATILIK ARSA ELEKTRONİK DEĞERLEME RAPORU" 
                        : category === "arazi" 
                        ? "SATILIK ARAZİ ELEKTRONİK DEĞERLEME RAPORU" 
                        : "SATILIK KONUT ELEKTRONİK DEĞERLEME RAPORU"}
                    </h1>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-4/3 bg-slate-100">
                      <img 
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                        alt="Taşınmaz Görseli" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                          MÖ
                        </div>
                        <h2 className="text-xl font-black text-slate-900 font-heading">Mehmet ÖRNEK</h2>
                        <p className="text-xs text-slate-500 font-medium">Bu rapor Murat Şahin adına hazırlanmıştır.</p>
                      </div>

                      <div className="space-y-2 text-xs text-slate-700">
                        <div><strong>Adres:</strong> {propertyTitle} {locationText}</div>
                        <div><strong>Parsel Bilgisi:</strong> {parcelText}</div>
                        <div><strong>Rapor Tarihi:</strong> 15.09.2026</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="text-xs font-black text-slate-900 mb-1">Danışman Görüşü</h3>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      Taşınmazın konumu, ulaşım akslarına yakınlığı ve bölgedeki benzer emsal hareketlilikleri incelendiğinde; kısa ve orta vadeli prim potansiyeli yüksek, likiditesi dengeli bir yatırım niteliği taşımaktadır.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 space-y-2 leading-relaxed">
                  <p>
                    Bu rapor, ihaleciburada.com tarafından satış, saha çalışmaları ve internette yer alan verilere dayalı istatistiksel modelleme yöntemleri ile üretilmiştir ve sapmalar içerebilir. Raporda yer alan bilgiler ve tahminler, varsayımsal olup herhangi bir taahhüt veya kesinlik içermez.
                  </p>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-2">
                    <span className="text-[#E11D48] font-black">İHALECİ BURADA × ENDEKSA</span>
                    <span>Sayfa 1 / 13</span>
                  </div>
                </div>
              </div>
            )}

            {/* SAYFA 2: DANIŞMAN PROFİLİ (Sayfa 2 Birebir) */}
            {currentPage === 2 && (
              <div className="space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Danışman & Ofis Bilgileri</h2>
                    <span className="text-xs font-bold text-slate-400">Lisanslı Emlak Değerleme</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100">
                      <img 
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80" 
                        alt="Mehmet ÖRNEK" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900">Mehmet ÖRNEK</h3>
                      <p className="text-xs text-[#E11D48] font-bold">SPK Lisanslı Gayrimenkul & İhale Uzmanı</p>
                      <div className="text-xs text-slate-600 space-y-1 pt-1">
                        <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> +90 123 456 78 90</div>
                        <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> mehmetornek@endeksa.com</div>
                        <div className="flex items-center gap-2"><Building className="w-3.5 h-3.5 text-slate-400" /> Endeksa Ankara Kurumsal Ofisi</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">Hakkımda</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      12 yılı aşkın süredir Ankara ve Ege bölgesinde konut, lüks konut, imarlı arsa ve tarımsal arazi değerlemeleri alanında hizmet vermekteyim. İhaleci Burada ve Endeksa büyük veri algoritmalarını harmanlayarak müşterilerime piyasa gerçekleriyle birebir örtüşen kıymet takdirleri sunmaktayım.
                    </p>
                  </div>

                  <div className="mt-8 space-y-3">
                    <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">Sertifikalar ve Yetki Belgeleri</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                        <Award className="w-8 h-8 text-amber-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">SPK Gayrimenkul Değerleme Lisansı</div>
                          <div className="text-[11px] text-slate-500">Sicil No: 408219 • Seviye 3</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">TTBS Taşınmaz Ticareti Yetki Belgesi</div>
                          <div className="text-[11px] text-slate-500">Belge No: 0600124-001</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Mehmet ÖRNEK Danışman Portföyü</span>
                  <span>Sayfa 2 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 3: TAŞINMAZ GÖRSELLERİ (Sayfa 3 Birebir 6'lı Galeri) */}
            {currentPage === 3 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Taşınmaz Görselleri</h2>
                    <span className="text-xs font-bold text-slate-500">6 Adet Doğrulanmış Görsel</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { title: "Salon ve Yaşam Alanı", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
                      { title: "Çalışma Odası & Manzara", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
                      { title: "Ebeveyn Yatak Odası", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80" },
                      { title: "Ada Mutfak", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80" },
                      { title: "Balkon & Cephe Açısı", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80" },
                      { title: "Site & Giriş Peyzajı", url: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80" },
                    ].map((img, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs group relative aspect-4/3 bg-slate-100">
                        <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-[10px] font-bold">
                          {img.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Saha Ekspertiz Fotoğraf Tespiti</span>
                  <span>Sayfa 3 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 4: KONUT / ARAZİ ÖZELLİKLERİ & DEĞER FİYAT ANALİZİ (Sayfa 4 Birebir) */}
            {currentPage === 4 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">
                      {category === "arazi" ? "Arazi Özellikleri" : category === "arsa" ? "Arsa Özellikleri" : "Konut Özellikleri"}
                    </h2>
                    <div className="px-3 py-1 bg-rose-50 text-[#E11D48] rounded-lg text-xs font-black">
                      3+1 • {areaM2} m² • Kat 10
                    </div>
                  </div>

                  {/* ÖZELLİK TABLOLARI */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Bölüm/Alan/Kat</div>
                      <div className="flex justify-between text-slate-600"><span>Oda Sayısı:</span><strong>3</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Salon Sayısı:</span><strong>1</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Banyo Sayısı:</span><strong>1</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Net / Brüt Alan:</span><strong>{areaM2} m²</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Bulunduğu Kat:</span><strong>10</strong></div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Isıtma & Cephe</div>
                      <div className="flex justify-between text-slate-600"><span>Isıtma:</span><strong>Merkezi Pay Ölçer</strong></div>
                      <div className="flex justify-between text-slate-600"><span>Kuzey:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="flex justify-between text-slate-600"><span>Güney:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="flex justify-between text-slate-600"><span>Doğu:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Manzara & Donatı</div>
                      <div className="flex justify-between text-slate-600"><span>Şehir Manzarası:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="flex justify-between text-slate-600"><span>Doğa / Park:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="flex justify-between text-slate-600"><span>Açık / Kapalı Havuz:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="flex justify-between text-slate-600"><span>Kapalı Otopark:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                    </div>
                  </div>

                  {/* TAŞINMAZIN DEĞER / FİYAT ANALİZİ KUTULARI (Kırmızı şeritli) */}
                  <div className="mt-6">
                    <div className="bg-[#E11D48] text-white px-4 py-2 rounded-t-xl text-xs font-black tracking-wide uppercase">
                      TAŞINMAZIN DEĞER/FİYAT ANALİZİ
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-b-xl border border-slate-200 text-center">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="text-xl font-black text-slate-900">{minPrice.toLocaleString("tr-TR")} ₺</div>
                        <div className="text-xs font-bold text-slate-600 mt-0.5">Minimum Fiyat</div>
                        <div className="text-[10px] text-slate-400 mt-1">Tahmini Satış: 0-3 Ay</div>
                        <div className="text-[10px] text-[#E11D48] font-bold mt-0.5">{Math.round(minPrice / (areaM2 || 1)).toLocaleString("tr-TR")} ₺/m²</div>
                      </div>

                      <div className="p-3 bg-rose-50/50 rounded-xl border-2 border-[#E11D48] shadow-xs">
                        <div className="text-2xl font-black text-[#E11D48]">{marketValueTL.toLocaleString("tr-TR")} ₺</div>
                        <div className="text-xs font-black text-slate-900 mt-0.5">Tahmini Piyasa Değeri</div>
                        <div className="text-[10px] text-slate-600 font-bold mt-1">Tahmini Satış: 3-6 Ay</div>
                        <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">Kira: {rentEstimate.toLocaleString("tr-TR")} ₺/ay</div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="text-xl font-black text-slate-900">{maxPrice.toLocaleString("tr-TR")} ₺</div>
                        <div className="text-xs font-bold text-slate-600 mt-0.5">Maksimum Fiyat</div>
                        <div className="text-[10px] text-slate-400 mt-1">Tahmini Satış: 6-12 Ay</div>
                        <div className="text-[10px] text-slate-700 font-bold mt-0.5">Amortisman: 13-14 Yıl</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Yaygın Piyasa Analizi Yöntemi</span>
                  <span>Sayfa 4 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 5: PAZARDAKİ DEĞER DEĞİŞİM PROJEKSİYONU (Sayfa 5 Birebir) */}
            {currentPage === 5 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Pazardaki Değer Değişim Projeksiyonu</h2>
                    <span className="text-xs font-bold text-slate-500">{locationText}</span>
                  </div>

                  {/* İSTATİSTİK ROZETLERİ */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Ortalama Pazarlama Süresi</span>
                      <strong className="text-slate-900 text-sm">1 Ay</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Pazardaki Rekabet Durumu</span>
                      <strong className="text-emerald-700 text-sm">Alıcı Pazarı</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Satılmayı Bekleyen Emsal</span>
                      <strong className="text-slate-900 text-sm">293 Adet</strong>
                    </div>
                  </div>

                  {/* DEĞİŞİM TABLOSU */}
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Bölge</th>
                          <th className="p-2.5">1 Yıllık</th>
                          <th className="p-2.5">2 Yıllık</th>
                          <th className="p-2.5">4 Yıllık</th>
                          <th className="p-2.5">1 Yıl Sonra Tahmini</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-900">Değer Artışı (%)</td>
                          <td className="p-2.5 text-emerald-600 font-bold">▲ %25,58</td>
                          <td className="p-2.5 text-emerald-600 font-bold">▲ %68,97</td>
                          <td className="p-2.5 text-emerald-600 font-bold">▲ %6,67</td>
                          <td className="p-2.5 text-emerald-700 font-black">▲ %11,63</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-900">Toplam Getiri (Kira Dahil)</td>
                          <td className="p-2.5 text-emerald-600 font-bold">▲ %35,84</td>
                          <td className="p-2.5 text-emerald-600 font-bold">▲ %93,48</td>
                          <td className="p-2.5 text-emerald-600 font-bold">▲ %31,85</td>
                          <td className="p-2.5 text-emerald-700 font-black">▲ %19,99</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* DEĞERE ESAS BAZI EMSALLER */}
                  <div className="mt-6">
                    <h3 className="text-xs font-black text-slate-900 mb-2">Değere Esas Bazı Emsaller</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2">Mesafe</th>
                            <th className="p-2">Süre</th>
                            <th className="p-2">Tip</th>
                            <th className="p-2">Bina Yaşı</th>
                            <th className="p-2">Alan</th>
                            <th className="p-2">Oda</th>
                            <th className="p-2 text-right">Değeri (TL)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                          <tr><td className="p-2 font-mono">150 m</td><td className="p-2">60 Gün</td><td>Apartman</td><td>4 Yaş</td><td>110 m²</td><td>3+1</td><td className="p-2 text-right font-bold text-slate-900">7.084.000 ₺</td></tr>
                          <tr><td className="p-2 font-mono">150 m</td><td className="p-2">30 Gün</td><td>Apartman</td><td>4 Yaş</td><td>110 m²</td><td>3+1</td><td className="p-2 text-right font-bold text-slate-900">7.502.000 ₺</td></tr>
                          <tr><td className="p-2 font-mono">150 m</td><td className="p-2">60 Gün</td><td>Apartman</td><td>4 Yaş</td><td>110 m²</td><td>2+1</td><td className="p-2 text-right font-bold text-slate-900">6.336.000 ₺</td></tr>
                          <tr><td className="p-2 font-mono">150 m</td><td className="p-2">30 Gün</td><td>Apartman</td><td>3 Yaş</td><td>105 m²</td><td>2+1</td><td className="p-2 text-right font-bold text-slate-900">6.028.000 ₺</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Endeksa Zaman Serisi & Hedonik Fiyat Endeksi</span>
                  <span>Sayfa 5 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 6: UZUN ZAMANDIR SATILMAYI BEKLEYEN EMSALLER (Sayfa 6 Birebir) */}
            {currentPage === 6 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-2 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Uzun Zamandır Satılmayı Bekleyen Emsaller</h2>
                    <span className="text-xs font-bold text-amber-600">3 Aydan Fazla Satışta Olanlar</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Aşağıdaki emsal mülkler 3 aydan fazla süredir satışta olup hala alıcı beklemektedir.</p>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Başlık / İlan</th>
                          <th className="p-2.5">Oda</th>
                          <th className="p-2.5">Yaş</th>
                          <th className="p-2.5">Alan</th>
                          <th className="p-2.5 text-right">Fiyat</th>
                          <th className="p-2.5 text-right">Birim / Gün</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {[
                          { title: "Eryaman Devlet Mah. Satılık 3+1 Ara Kat", room: "3+1", age: "17", area: "155", price: "5.800.000 ₺", unit: "37.419 ₺/m²", days: "101 Gün" },
                          { title: "Eryaman Çamdalı Sitesinde 3+1 Full Yapılı", room: "3+1", age: "16", area: "145", price: "5.450.000 ₺", unit: "37.586 ₺/m²", days: "97 Gün" },
                          { title: "Urhal Gold Sitesinde 3+1 Ara Katta Daire", room: "3+1", age: "13", area: "179", price: "8.225.000 ₺", unit: "45.950 ₺/m²", days: "132 Gün" },
                          { title: "Pro312'den Geniş Daire Metroya 600m", room: "3+1", age: "18", area: "120", price: "5.990.000 ₺", unit: "49.917 ₺/m²", days: "203 Gün" },
                          { title: "Metromall Konutları 3+1 Kiracılı Yatırımlık", room: "3+1", age: "8", area: "140", price: "9.150.000 ₺", unit: "65.357 ₺/m²", days: "94 Gün" },
                          { title: "Referans Ankarada Mükemmel Konum Süper Cephe", room: "3+1", age: "4", area: "110", price: "8.050.000 ₺", unit: "73.182 ₺/m²", days: "112 Gün" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-slate-900">{row.title}</td>
                            <td className="p-2.5">{row.room}</td>
                            <td className="p-2.5">{row.age}</td>
                            <td className="p-2.5">{row.area} m²</td>
                            <td className="p-2.5 text-right font-bold text-slate-900">{row.price}</td>
                            <td className="p-2.5 text-right font-mono text-[11px]">
                              <div>{row.unit}</div>
                              <span className="text-amber-600 font-bold">{row.days}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Pazarda Alıcı Bekleyen Portföyler</span>
                  <span>Sayfa 6 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 7: YAKIN ZAMANDA PAZARA GİRMİŞ EMSALLER (Sayfa 7 Birebir) */}
            {currentPage === 7 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-2 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Yakın Zamanda Pazara Girmiş Emsaller</h2>
                    <span className="text-xs font-bold text-emerald-600">Son 90 Gün İçinde Eklenenler</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Aşağıdaki emsal mülkler son 3 ay içerisinde pazara yeni girmiştir.</p>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Başlık / İlan</th>
                          <th className="p-2.5">Oda</th>
                          <th className="p-2.5">Yaş</th>
                          <th className="p-2.5">Alan</th>
                          <th className="p-2.5 text-right">Fiyat</th>
                          <th className="p-2.5 text-right">Birim / Gün</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {[
                          { title: "Etimesgut Eryaman Mah. Site İçi Lüx Yapılı", room: "3+1", age: "8", area: "180", price: "9.275.000 ₺", unit: "51.528 ₺/m²", days: "1 Gün" },
                          { title: "Tunahan Sitesi Metro Dur+Metromall Yanında", room: "3+1", age: "8", area: "117", price: "6.500.000 ₺", unit: "55.556 ₺/m²", days: "32 Gün" },
                          { title: "Eryaman Referans Ankara Konutları A Tipi", room: "3+1", age: "4", area: "110", price: "7.350.000 ₺", unit: "66.818 ₺/m²", days: "24 Gün" },
                          { title: "Ars'den Referans Ankara'da Bağımsız Mutfak", room: "3+1", age: "4", area: "145", price: "10.350.000 ₺", unit: "71.379 ₺/m²", days: "2 Gün" },
                          { title: "Referans Ankara Önü Full Açık A Tipi Boş", room: "3+1", age: "4", area: "110", price: "8.525.000 ₺", unit: "77.500 ₺/m²", days: "49 Gün" },
                          { title: "Stadyum ve Ankara Manzaralı Referans B Tipi", room: "3+1", age: "4", area: "140", price: "11.150.000 ₺", unit: "79.643 ₺/m²", days: "64 Gün" },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-slate-900">{row.title}</td>
                            <td className="p-2.5">{row.room}</td>
                            <td className="p-2.5">{row.age}</td>
                            <td className="p-2.5">{row.area} m²</td>
                            <td className="p-2.5 text-right font-bold text-slate-900">{row.price}</td>
                            <td className="p-2.5 text-right font-mono text-[11px]">
                              <div>{row.unit}</div>
                              <span className="text-emerald-600 font-bold">{row.days}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Pazara Yeni Giren Sıcak İlanlar</span>
                  <span>Sayfa 7 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 8: TAŞINMAZIN SIRALAMASI (Sayfa 8 Birebir Mavi Vurgulu Tablo) */}
            {currentPage === 8 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-2 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Emsaller Arasındaki Sıralaması</h2>
                    <span className="text-xs font-bold text-sky-600">m² Birim Fiyatına Göre Konum</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Mülkün m² birim fiyatına göre pazardaki diğer 20 emsal arasındaki konumu aşağıda yer almaktadır.</p>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Mesafe</th>
                          <th className="p-2">Mahalle</th>
                          <th className="p-2">Yaş</th>
                          <th className="p-2">Kat</th>
                          <th className="p-2">Alan</th>
                          <th className="p-2">Değer (TL)</th>
                          <th className="p-2 text-right">m² Birim ₺</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-2">1</td><td className="p-2">600 m</td><td>Tunahan</td><td>8</td><td>14</td><td>117 m²</td><td>6.500.000 ₺</td><td className="p-2 text-right font-mono">55.556 ₺</td></tr>
                        <tr><td className="p-2">5</td><td className="p-2">150 m</td><td>Devlet</td><td>4</td><td>28</td><td>110 m²</td><td>7.350.000 ₺</td><td className="p-2 text-right font-mono">66.818 ₺</td></tr>
                        <tr className="bg-sky-500 text-white font-black">
                          <td className="p-2">12</td>
                          <td className="p-2">0 m (Hedef)</td>
                          <td className="p-2">Devlet</td>
                          <td className="p-2">4</td>
                          <td className="p-2">25</td>
                          <td className="p-2">{areaM2} m²</td>
                          <td className="p-2">{marketValueTL.toLocaleString("tr-TR")} ₺</td>
                          <td className="p-2 text-right font-mono">{m2Price.toLocaleString("tr-TR")} ₺</td>
                        </tr>
                        <tr><td className="p-2">13</td><td className="p-2">150 m</td><td>Devlet</td><td>4</td><td>30</td><td>145 m²</td><td>10.495.000 ₺</td><td className="p-2 text-right font-mono">72.379 ₺</td></tr>
                        <tr><td className="p-2">20</td><td className="p-2">150 m</td><td>Devlet</td><td>4</td><td>30</td><td>110 m²</td><td>8.750.000 ₺</td><td className="p-2 text-right font-mono">79.545 ₺</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Hedef Gayrimenkul Emsallerin Tam Ortasında Konumlanmıştır</span>
                  <span>Sayfa 8 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 9: DEMOGRAFİ ANALİZİ (Sayfa 9 Birebir 150m-300m-600m Tablosu) */}
            {currentPage === 9 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Demografi ve Sosyo-Ekonomik Statü</h2>
                    <span className="text-xs font-bold text-slate-500">150m • 300m • 600m Çap Analizi</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-800 font-bold">
                        <tr>
                          <th className="p-2.5">Metrik</th>
                          <th className="p-2.5">150m</th>
                          <th className="p-2.5">300m</th>
                          <th className="p-2.5">600m</th>
                          <th className="p-2.5">Mahalle</th>
                          <th className="p-2.5">İlçe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        <tr><td className="p-2.5 font-bold text-slate-900">Toplam Nüfus</td><td>381</td><td>1.142</td><td>13.278</td><td>15.993</td><td>629.112</td></tr>
                        <tr><td className="p-2.5 font-bold text-slate-900">Baskın Yaş Grubu</td><td>40-44</td><td>40-44</td><td>40-44</td><td>40-44</td><td>40-44</td></tr>
                        <tr><td className="p-2.5 font-bold text-slate-900">A+ SES Oranı</td><td>%14</td><td>%14</td><td>%15</td><td>%15</td><td>%12</td></tr>
                        <tr><td className="p-2.5 font-bold text-slate-900">A SES Oranı</td><td>%30</td><td>%30</td><td>%30</td><td>%30</td><td>%24</td></tr>
                        <tr><td className="p-2.5 font-bold text-slate-900">B SES Oranı</td><td>%23</td><td>%23</td><td>%23</td><td>%24</td><td>%25</td></tr>
                        <tr><td className="p-2.5 font-bold text-slate-900">C SES Oranı</td><td>%22</td><td>%22</td><td>%22</td><td>%23</td><td>%30</td></tr>
                        <tr><td className="p-2.5 font-bold text-slate-900">Ort. Hane Geliri</td><td>161 ₺/Ay</td><td>161 ₺/Ay</td><td>148 ₺/Ay</td><td>161 ₺/Ay</td><td>220 ₺/Ay</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    <strong>TÜİK & Endeksa SES Notu:</strong> Taşınmazın bulunduğu bölgede A ve A+ yüksek sosyo-ekonomik statü oranı toplamda <strong>%44</strong> seviyesindedir. Bu oran Türkiye ortalamasının iki katıdır.
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>TÜİK ADNKS & Endeksa Sosyo-Ekonomik Skorlama</span>
                  <span>Sayfa 9 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 10: TÜKETİM HARCAMALARI & ÖNEMLİ KONUMLAR (Sayfa 10 Birebir) */}
            {currentPage === 10 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Tüketim Harcamaları ve Çevre Konumları</h2>
                    <span className="text-xs font-bold text-slate-500">Kişi Başına Harcama</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Kişi Başına Harcama (₺/Ay)</h3>
                      <div className="flex justify-between"><span>Gıda:</span><strong>4.230 ₺</strong></div>
                      <div className="flex justify-between"><span>Konut ve Kira:</span><strong>7.340 ₺</strong></div>
                      <div className="flex justify-between"><span>Ulaşım:</span><strong>8.822 ₺</strong></div>
                      <div className="flex justify-between"><span>Lokanta ve Oteller:</span><strong>2.659 ₺</strong></div>
                      <div className="flex justify-between"><span>Eğitim & Kültür:</span><strong>1.827 ₺</strong></div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Önemli Konumlara Mesafeler</h3>
                      <div className="flex justify-between"><span>Eğitim / Okul:</span><strong>17 Adet (1.500m içinde)</strong></div>
                      <div className="flex justify-between"><span>Sağlık / Hastane:</span><strong>11 Adet (1.500m içinde)</strong></div>
                      <div className="flex justify-between"><span>Metro / Ulaşım:</span><strong>4 Adet (1.000m içinde)</strong></div>
                      <div className="flex justify-between"><span>Sosyal Yaşam:</span><strong>Metromall AVM (600m)</strong></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>POI (Points of Interest) & Harcama Alışkanlıkları</span>
                  <span>Sayfa 10 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 11: SATILIK & KİRALIK KONUT BİLGİLERİ (Sayfa 11 Birebir) */}
            {currentPage === 11 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Satılık & Kiralık Stok Analizi</h2>
                    <span className="text-xs font-bold text-slate-500">Piyasa Likidite Göstergeleri</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <h3 className="font-black text-[#E11D48] mb-1.5 uppercase">Satılık Konut Bilgileri</h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-800 font-bold">
                            <tr>
                              <th className="p-2">Bölge</th>
                              <th className="p-2">Brüt Alan</th>
                              <th className="p-2">Birim Fiyat</th>
                              <th className="p-2">Amortisman</th>
                              <th className="p-2">Pazarlama Süresi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600">
                            <tr><td className="p-2 font-bold">150m Çap</td><td>90 m²</td><td>72 ₺/m²</td><td>-</td><td>60 Gün</td></tr>
                            <tr><td className="p-2 font-bold">600m Çap</td><td>110 m²</td><td>58 ₺/m²</td><td>12 Yıl</td><td>65 Gün</td></tr>
                            <tr><td className="p-2 font-bold">Mahalle</td><td>122 m²</td><td>50 ₺/m²</td><td>13 Yıl</td><td>62 Gün</td></tr>
                            <tr><td className="p-2 font-bold">İlçe</td><td>130 m²</td><td>40 ₺/m²</td><td>13 Yıl</td><td>65 Gün</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="font-black text-sky-600 mb-1.5 uppercase">Kiralık Konut Bilgileri</h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-slate-800 font-bold">
                            <tr>
                              <th className="p-2">Bölge</th>
                              <th className="p-2">Brüt Alan</th>
                              <th className="p-2">Birim Kira</th>
                              <th className="p-2">Pazarlama Süresi</th>
                              <th className="p-2">Stok Adedi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600">
                            <tr><td className="p-2 font-bold">150m Çap</td><td>65 m²</td><td>448 ₺/m²</td><td>47 Gün</td><td>87 Adet</td></tr>
                            <tr><td className="p-2 font-bold">600m Çap</td><td>89 m²</td><td>424 ₺/m²</td><td>48 Gün</td><td>132 Adet</td></tr>
                            <tr><td className="p-2 font-bold">Mahalle</td><td>99 m²</td><td>320 ₺/m²</td><td>47 Gün</td><td>-</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>Stok Devir Hızı ve Amortisman Projeksiyonu</span>
                  <span>Sayfa 11 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 12: ARAZİ KULLANIM HARİTALARI (Sayfa 12 Birebir) */}
            {currentPage === 12 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">Arazi Kullanım ve Çevre Analizi</h2>
                    <span className="text-xs font-bold text-slate-500">Resmi Kurum Harita Katmanları</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <TreePine className="w-4 h-4" />
                        <span>Ormanlık Alanlar</span>
                      </div>
                      <div className="text-[11px] text-slate-500">En Yakın Mesafe:</div>
                      <div className="text-sm font-black text-slate-900">965 metre</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                        <Zap className="w-4 h-4" />
                        <span>Enerji Nakil Hatları</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Hat Üzerinde Değil:</div>
                      <div className="text-sm font-black text-slate-900">316 metre</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-sky-700 font-bold">
                        <Droplets className="w-4 h-4" />
                        <span>Nehir / Su Toplama</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Durum:</div>
                      <div className="text-sm font-black text-emerald-700">Taşkın Riski Yok</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                        <Layers className="w-4 h-4" />
                        <span>Trafolar & Altyapı</span>
                      </div>
                      <div className="text-[11px] text-slate-500">En Yakın Trafo:</div>
                      <div className="text-sm font-black text-slate-900">3.305 metre</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Deprem Riski (PGA)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">AFAD Tehlike Skoru:</div>
                      <div className="text-sm font-black text-slate-900">0.347g (Orta Risk)</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                        <Compass className="w-4 h-4" />
                        <span>Heyelan Riski</span>
                      </div>
                      <div className="text-[11px] text-slate-500">MTA Haritası:</div>
                      <div className="text-sm font-black text-emerald-700">Risk Bulunmuyor</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>AFAD, MTA ve Çevre Şehircilik Bakanlığı Harita Verileri</span>
                  <span>Sayfa 12 / 13</span>
                </div>
              </div>
            )}

            {/* SAYFA 13: SEÇİM & SOSYAL ANALİZ (Sayfa 13 Birebir Oy Grafiği) */}
            {currentPage === 13 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 font-heading">2024 Yerel Seçim Siyasi ve Sosyal Tercihler</h2>
                    <span className="text-xs font-bold text-slate-500">YSK Sandık Verileri</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h3 className="font-extrabold text-slate-900">Belediye Başkanlığı Oy Dağılımı (2024)</h3>
                      <div className="space-y-1.5 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold"><span>CHP</span><span>%61 (5.890 Oy)</span></div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-600 rounded-full" style={{ width: "61%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold"><span>MHP / Cumhur İttifakı</span><span>%31 (2.948 Oy)</span></div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-600 rounded-full" style={{ width: "31%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold"><span>Diğer Partiler</span><span>%8 (762 Oy)</span></div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-500 rounded-full" style={{ width: "8%" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h3 className="font-extrabold text-slate-900">Belediye Meclis Üyeliği Oy Dağılımı (2024)</h3>
                      <div className="space-y-1.5 pt-1">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold"><span>CHP</span><span>%58 (5.641 Oy)</span></div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-600 rounded-full" style={{ width: "58%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] font-bold"><span>AK Parti / MHP</span><span>%33 (3.206 Oy)</span></div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: "33%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
                  <span>YSK Resmi Sandık Sonuçları ile Bölge Sosyolojisi</span>
                  <span>Sayfa 13 / 13 • Rapor Sonu</span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* MODAL ALT GEZİNME VE İŞLEM ÇUBUĞU */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
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
  );
};
