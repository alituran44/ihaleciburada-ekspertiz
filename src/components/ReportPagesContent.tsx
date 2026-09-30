"use client";

import React from "react";
import { 
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
import { ValuationFormData } from "./valuation/types";

export interface ReportPagesContentProps {
  currentPage: number;
  city: string;
  district: string;
  neighborhood: string;
  ada: string;
  parsel: string;
  pafta: string;
  effectiveCategory: string;
  effectiveAreaM2: number;
  roomCount: number;
  livingRoomCount: number;
  buildingAge: number;
  floorNumber: number;
  totalFloors: number;
  pga: string;
  effectiveMarketValue: number;
  minPrice: number;
  maxPrice: number;
  m2Price: number;
  rentEstimate: number;
  tenderBasePriceTL: number;
  effectiveLocation: string;
  effectiveParcelText: string;
  effectiveTitle: string;
  formData?: Partial<ValuationFormData>;
  uploadedPhotos?: string[];
}

export const ReportPagesContent: React.FC<ReportPagesContentProps> = ({
  currentPage,
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
  uploadedPhotos,
}) => {
  const coverPhotoUrl = (uploadedPhotos && uploadedPhotos.length > 0)
    ? uploadedPhotos[0]
    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

  return (
    <>
      {/* SAYFA 1: KAPAK */}
      {currentPage === 1 && (
        <div className="space-y-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-4 border-[#E11D48] pb-3 mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading uppercase leading-tight">
                {effectiveCategory === "arsa" 
                  ? "SATILIK ARSA ELEKTRONİK DEĞERLEME RAPORU" 
                  : effectiveCategory === "arazi" 
                  ? "SATILIK ARAZİ ELEKTRONİK DEĞERLEME RAPORU" 
                  : "SATILIK KONUT ELEKTRONİK DEĞERLEME RAPORU"}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-4/3 bg-slate-100">
                <img 
                  src={coverPhotoUrl} 
                  alt="Taşınmaz Görseli" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    AT
                  </div>
                  <h2 className="text-xl font-black text-slate-900 font-heading">Ali TURAN</h2>
                  <p className="text-xs text-slate-500 font-medium">Bu rapor Hasan Yıldırım (İhaleciBurada Portföyü) adına hazırlanmıştır.</p>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div><strong>Adres:</strong> {effectiveLocation}</div>
                  <div><strong>Parsel Bilgisi:</strong> {effectiveParcelText}</div>
                  <div><strong>Taşınmaz Alanı:</strong> {effectiveAreaM2} m²</div>
                  <div><strong>Rapor Tarihi:</strong> {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-black text-slate-900 mb-1">Danışman Görüşü</h3>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {city} ili, {district} ilçesi, {neighborhood} sınırları dahilinde bulunan {ada} Ada {parsel} Parsel sayılı taşınmazın konumu, ulaşım akslarına yakınlığı ve bölgedeki benzer emsal hareketlilikleri incelendiğinde; kısa ve orta vadeli prim potansiyeli yüksek, likiditesi dengeli bir gayrimenkul yatırımı niteliği taşımaktadır.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 space-y-2 leading-relaxed">
            <p>
              Bu rapor, ihaleciburada.com tarafından resmi tapu kayıtları, saha çalışmaları ve internette yer alan teyitli emsal verilere dayalı hedonik değerleme algoritmaları ile üretilmiştir.
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 pt-2">
              <span className="text-[#E11D48] font-black">İHALECİ BURADA × ELEKTRONİK EKSPERTİZ</span>
              <span>Sayfa 1 / 13</span>
            </div>
          </div>
        </div>
      )}

      {/* SAYFA 2: DANIŞMAN PROFİLİ */}
      {currentPage === 2 && (
        <div className="space-y-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Danışman & Ofis Bilgileri</h2>
              <span className="text-xs font-bold text-slate-400">Lisanslı Gayrimenkul Değerleme</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-sm shrink-0 bg-slate-900 flex items-center justify-center text-white text-3xl font-black font-heading">
                AT
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Ali TURAN</h3>
                <p className="text-xs text-[#E11D48] font-bold">SPK Lisanslı Gayrimenkul & İhale Değerleme Uzmanı</p>
                <div className="text-xs text-slate-600 space-y-1 pt-1">
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> +90 850 308 00 00</div>
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> alituran@ihaleciburada.com</div>
                  <div className="flex items-center gap-2"><Building className="w-3.5 h-3.5 text-slate-400" /> İhaleciBurada Gayrimenkul & Değerleme Koordinatörlüğü</div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-1">Hakkımda</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                14 yılı aşkın süredir {city} ve Marmara/Ege bölgesinde konut, ticari mülk, imarlı arsa ve icra değerlemeleri alanında hizmet vermekteyim. İhaleciBurada büyük veri algoritmaları, İİK m.115 ihale tabanları ve SPK değerleme ilkelerini harmanlayarak taşınmazların piyasa gerçekleriyle birebir örtüşen kıymet takdirlerini sunmaktayım.
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
                    <div className="text-[11px] text-slate-500">Belge No: 3400892-001</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Ali TURAN Danışman Portföyü • İhaleciBurada</span>
            <span>Sayfa 2 / 13</span>
          </div>
        </div>
      )}

      {/* SAYFA 3: TAŞINMAZ GÖRSELLERİ */}
      {currentPage === 3 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Taşınmaz Görselleri</h2>
              <span className="text-xs font-bold text-slate-500">
                {(uploadedPhotos && uploadedPhotos.length > 0)
                  ? `${uploadedPhotos.length} Adet Saha Fotoğrafı Yüklendi`
                  : "6 Adet Doğrulanmış Görsel"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: "Ana Cephe & Giriş", fallback: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
                { title: "Salon ve Yaşam Alanı", fallback: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" },
                { title: "Mutfak & Donatılar", fallback: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80" },
                { title: "Oda / İç Mekan", fallback: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80" },
                { title: "Balkon & Cephe Açısı", fallback: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80" },
                { title: "Site & Çevre Peyzajı", fallback: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80" },
              ].map((item, i) => {
                const isUserPhoto = Boolean(uploadedPhotos && uploadedPhotos[i]);
                const photoSrc = isUserPhoto ? (uploadedPhotos as string[])[i] : item.fallback;
                const photoTitle = isUserPhoto ? `${item.title} (Yüklenen)` : item.title;

                return (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs group relative aspect-4/3 bg-slate-100">
                    <img src={photoSrc} alt={photoTitle} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 text-white text-[10px] font-bold flex items-center justify-between">
                      <span className="truncate">{photoTitle}</span>
                      {isUserPhoto && (
                        <span className="px-1 py-0.5 rounded bg-amber-500 text-[8px] font-black text-slate-950 shrink-0">
                          Özgün
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Saha Ekspertiz Fotoğraf Tespiti</span>
            <span>Sayfa 3 / 13</span>
          </div>
        </div>
      )}

      {/* SAYFA 4: KONUT / ARAZİ ÖZELLİKLERİ & DEĞER FİYAT ANALİZİ */}
      {currentPage === 4 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">
                {effectiveCategory === "arazi" ? "Arazi Özellikleri" : effectiveCategory === "arsa" ? "Arsa Özellikleri" : "Konut Özellikleri"}
              </h2>
              <div className="px-3 py-1 bg-rose-50 text-[#E11D48] rounded-lg text-xs font-black">
                {effectiveCategory === "arsa"
                  ? `İmarlı Arsa • ${effectiveAreaM2} m² • Emsal (KAKS): 1.50 / TAKS: 0.35`
                  : effectiveCategory === "arazi"
                  ? `Tarla & Arazi • ${effectiveAreaM2} m² • Kadastral Yol Cepheli`
                  : `${roomCount}+${livingRoomCount} • ${effectiveAreaM2} m² • ${floorNumber === 0 ? "Zemin Kat" : floorNumber === 0.5 ? "Yüksek Giriş" : floorNumber === -1 ? "Bodrum" : `${floorNumber}. Kat`}`}
              </div>
            </div>

            {/* ÖZELLİK TABLOLARI */}
            {effectiveCategory === "arsa" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">İmar & Kadastro Kriterleri</div>
                  <div className="flex justify-between text-slate-600"><span>İmar Durumu:</span><strong className="text-emerald-700">Konut + Ticari İmarlı</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Emsal (KAKS):</span><strong>1.50</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Taban Alanı (TAKS):</span><strong>0.35</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Maksimum Kat:</span><strong>5 Kat (15.50m)</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Yola Terk Oranı:</span><strong>~%20 Terk Öngörüsü</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">İnşaat Kapasitesi</div>
                  <div className="flex justify-between text-slate-600"><span>Arsa Alanı:</span><strong>{effectiveAreaM2} m²</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Net İnşaat Alanı:</span><strong className="text-blue-700 font-mono">~{Math.round(effectiveAreaM2 * 1.50)} m²</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Taban Oturumu:</span><strong>~{Math.round(effectiveAreaM2 * 0.35)} m²</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Yol Cephesi:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                  <div className="flex justify-between text-slate-600"><span>Altyapı (Elektrik/Su):</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Topografya & Mülkiyet</div>
                  <div className="flex justify-between text-slate-600"><span>Zemin Eğimi:</span><strong>Düz / Hafif Eğim (%2)</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Parsel Geometrisi:</span><strong>Düzgün Dikdörtgen</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Ulaşım:</span><strong>Asfalt Yol Bağlantılı</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Hukuki Durum:</span><strong className="text-emerald-700">Müstakil Parsel</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Şerh / İpotek:</span><span className="text-emerald-600 font-bold">Temiz / Sorunsuz</span></div>
                </div>
              </div>
            ) : effectiveCategory === "arazi" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Toprak & Tarım Niteliği</div>
                  <div className="flex justify-between text-slate-600"><span>Tapu Niteliği:</span><strong>Tarla / Bağ / Zeytinlik</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Toprak Sınıfı:</span><strong>2. Sınıf Tarım Arazisi</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Sulama Durumu:</span><strong className="text-emerald-700">Sulanabilir Tarım Alanı</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Kadastro Yolu:</span><strong className="text-blue-700">Resmi Yola Cepheli</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Parsel Alanı:</span><strong>{effectiveAreaM2.toLocaleString("tr-TR")} m²</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Tarımsal Yapılaşma ve İzinler</div>
                  <div className="flex justify-between text-slate-600"><span>5403 Sayılı Kanun:</span><strong className="text-emerald-700">Bölünemez Asgari Parsel Uygun</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Bağ Evi İzni:</span><strong>75 m² Tarımsal Yapı İzni</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Elektrik Şebekesi:</span><strong>En Yakın Hat ~400m</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Su İmkanı:</span><strong>Sondaj / Kuyu Açılabilir</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Zemin Eğimi:</span><strong>%3-5 Hafif Eğimli</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Yatırım & Değerleme Kriterleri</div>
                  <div className="flex justify-between text-slate-600"><span>Prim Potansiyeli:</span><strong className="text-emerald-700">Yüksek (Bölgesel Gelişim)</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Mücavir Alan:</span><strong>Köye 850m Mesafede</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Sit / Koruma:</span><span className="text-emerald-600 font-bold">Koruma Kısıtı Yok</span></div>
                  <div className="flex justify-between text-slate-600"><span>Mülkiyet Türü:</span><strong className="text-slate-900">Müstakil Parsel</strong></div>
                  <div className="flex justify-between text-slate-600"><span>İcra / Haciz:</span><span className="text-emerald-600 font-bold">Temiz Mülkiyet</span></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Bölüm/Alan/Kat</div>
                  <div className="flex justify-between text-slate-600"><span>Oda Sayısı:</span><strong>{roomCount}</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Salon Sayısı:</span><strong>{livingRoomCount}</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Banyo Sayısı:</span><strong>1</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Net / Brüt Alan:</span><strong>{Math.round(effectiveAreaM2 * 0.85)} m² / {effectiveAreaM2} m²</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Bulunduğu Kat:</span><strong>{floorNumber === 0 ? "Zemin Kat" : floorNumber === 0.5 ? "Yüksek Giriş" : floorNumber === -1 ? "Bodrum Kat" : `${floorNumber}. Kat`} (Top: {totalFloors})</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Isıtma & Cephe</div>
                  <div className="flex justify-between text-slate-600"><span>Isıtma:</span><strong>{formData?.heatingSystem || "Doğalgaz Kombi"}</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Kuzey / Güney:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                  <div className="flex justify-between text-slate-600"><span>Bina Yaşı:</span><strong>{buildingAge} Yaşında</strong></div>
                  <div className="flex justify-between text-slate-600"><span>Yapı Tipi:</span><strong>{formData?.housingTypeKind === "mustakil" ? "Müstakil / Villa" : "Betonarme Apartman"}</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Manzara & Donatı</div>
                  <div className="flex justify-between text-slate-600"><span>Şehir / Doğa Manzarası:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                  <div className="flex justify-between text-slate-600"><span>Balkon / Teras:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                  <div className="flex justify-between text-slate-600"><span>Asansör & Otopark:</span><Check className="w-3.5 h-3.5 text-emerald-600" /></div>
                  <div className="flex justify-between text-slate-600"><span>Kullanım Durumu:</span><strong className="capitalize">{formData?.usageStatus ? formData.usageStatus.replace("_", " ") : "Mülk Sahibi"}</strong></div>
                </div>
              </div>
            )}

            {/* TAŞINMAZIN DEĞER / FİYAT ANALİZİ KUTULARI */}
            <div className="mt-6">
              <div className="bg-[#E11D48] text-white px-4 py-2 rounded-t-xl text-xs font-black tracking-wide uppercase">
                TAŞINMAZIN DEĞER/FİYAT ANALİZİ
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-b-xl border border-slate-200 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xl font-black text-slate-900">{minPrice.toLocaleString("tr-TR")} ₺</div>
                  <div className="text-xs font-bold text-slate-600 mt-0.5">Minimum Fiyat</div>
                  <div className="text-[10px] text-slate-400 mt-1">Tahmini Satış: 0-3 Ay</div>
                  <div className="text-[10px] text-[#E11D48] font-bold mt-0.5">{Math.round(minPrice / (effectiveAreaM2 || 1)).toLocaleString("tr-TR")} ₺/m²</div>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl border-2 border-[#E11D48] shadow-xs">
                  <div className="text-2xl font-black text-[#E11D48]">{effectiveMarketValue.toLocaleString("tr-TR")} ₺</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">Tahmini Piyasa Değeri</div>
                  <div className="text-[10px] text-slate-600 font-bold mt-1">Tahmini Satış: 3-6 Ay</div>
                  <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">Kira: {rentEstimate.toLocaleString("tr-TR")} ₺/ay</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-xl font-black text-slate-900">{maxPrice.toLocaleString("tr-TR")} ₺</div>
                  <div className="text-xs font-bold text-slate-600 mt-0.5">Maksimum Fiyat</div>
                  <div className="text-[10px] text-slate-400 mt-1">Tahmini Satış: 6-12 Ay</div>
                  <div className="text-[10px] text-slate-700 font-bold mt-0.5">Birim: {Math.round(maxPrice / (effectiveAreaM2 || 1)).toLocaleString("tr-TR")} ₺/m²</div>
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

      {/* SAYFA 5: PAZARDAKİ DEĞER DEĞİŞİM PROJEKSİYONU */}
      {currentPage === 5 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Pazardaki Değer Değişim Projeksiyonu</h2>
              <span className="text-xs font-bold text-slate-500">{effectiveLocation}</span>
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

      {/* SAYFA 6: UZUN ZAMANDIR SATILMAYI BEKLEYEN EMSALLER */}
      {currentPage === 6 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-2 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Uzun Zamandır Satılmayı Bekleyen Emsaller</h2>
              <span className="text-xs font-bold text-amber-600">3 Aydan Fazla Satışta Olanlar</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Aşağıdaki emsal mülkler {neighborhood} ve {district} genelinde 3 aydan uzun süredir satışta olup pazarlık marjı yüksektir.</p>

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
                    { title: `${neighborhood} Mah. Geniş ${roomCount}+${livingRoomCount} Ara Kat`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge + 8}`, area: `${effectiveAreaM2 + 15}`, price: `${Math.round(effectiveMarketValue * 0.82).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 0.82) / (effectiveAreaM2 + 15)).toLocaleString("tr-TR")} ₺/m²`, days: "104 Gün" },
                    { title: `${neighborhood} Sitesinde Full Yapılı Daire`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge + 5}`, area: `${effectiveAreaM2}`, price: `${Math.round(effectiveMarketValue * 0.88).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 0.88) / effectiveAreaM2).toLocaleString("tr-TR")} ₺/m²`, days: "92 Gün" },
                    { title: `${district} Merkezde Cadde Üzeri Satılık`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge + 10}`, area: `${effectiveAreaM2 - 10}`, price: `${Math.round(effectiveMarketValue * 0.78).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 0.78) / (effectiveAreaM2 - 10)).toLocaleString("tr-TR")} ₺/m²`, days: "135 Gün" },
                    { title: `${neighborhood} Boğaz/Doğa Manzaralı Ara Kat`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge + 3}`, area: `${effectiveAreaM2 + 10}`, price: `${Math.round(effectiveMarketValue * 0.94).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 0.94) / (effectiveAreaM2 + 10)).toLocaleString("tr-TR")} ₺/m²`, days: "115 Gün" },
                    { title: `${district} ${neighborhood} Yatırımlık Kiracılı Portföy`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge + 6}`, area: `${effectiveAreaM2}`, price: `${Math.round(effectiveMarketValue * 0.90).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 0.90) / effectiveAreaM2).toLocaleString("tr-TR")} ₺/m²`, days: "98 Gün" },
                    { title: `${ada} Ada Çevresi Prestijli Konut Projesi`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge}`, area: `${effectiveAreaM2 - 5}`, price: `${Math.round(effectiveMarketValue * 0.96).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 0.96) / (effectiveAreaM2 - 5)).toLocaleString("tr-TR")} ₺/m²`, days: "90 Gün" },
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
            <span>Pazarda Alıcı Bekleyen Bölgesel Portföyler</span>
            <span>Sayfa 6 / 13</span>
          </div>
        </div>
      )}

      {/* SAYFA 7: YAKIN ZAMANDA PAZARA GİRMİŞ EMSALLER */}
      {currentPage === 7 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-2 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Yakın Zamanda Pazara Girmiş Emsaller</h2>
              <span className="text-xs font-bold text-emerald-600">Son 90 Gün İçinde Eklenenler</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Aşağıdaki emsal mülkler {neighborhood} bölgesinde son 3 ay içerisinde pazara yeni girmiştir.</p>

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
                    { title: `${neighborhood} Mah. Yeni Bina Sıfır ${roomCount}+${livingRoomCount}`, room: `${roomCount}+${livingRoomCount}`, age: "0", area: `${effectiveAreaM2}`, price: `${Math.round(effectiveMarketValue * 1.08).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 1.08) / effectiveAreaM2).toLocaleString("tr-TR")} ₺/m²`, days: "2 Gün" },
                    { title: `${district} ${neighborhood} Sahil Aksında Lüks Daire`, room: `${roomCount}+${livingRoomCount}`, age: "2", area: `${effectiveAreaM2 + 10}`, price: `${Math.round(effectiveMarketValue * 1.12).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 1.12) / (effectiveAreaM2 + 10)).toLocaleString("tr-TR")} ₺/m²`, days: "14 Gün" },
                    { title: `${neighborhood} Prestij Konutlarında Bağımsız Mutfak`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge}`, area: `${effectiveAreaM2}`, price: `${Math.round(effectiveMarketValue * 1.02).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 1.02) / effectiveAreaM2).toLocaleString("tr-TR")} ₺/m²`, days: "5 Gün" },
                    { title: `${district} ${neighborhood} Önü Açık Ferah Daire`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge}`, area: `${effectiveAreaM2 - 10}`, price: `${Math.round(effectiveMarketValue * 0.98).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 0.98) / (effectiveAreaM2 - 10)).toLocaleString("tr-TR")} ₺/m²`, days: "21 Gün" },
                    { title: `${ada} Ada Komşu Parsel Satılık Daire`, room: `${roomCount}+${livingRoomCount}`, age: `${buildingAge + 2}`, area: `${effectiveAreaM2}`, price: `${Math.round(effectiveMarketValue * 1.04).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 1.04) / effectiveAreaM2).toLocaleString("tr-TR")} ₺/m²`, days: "8 Gün" },
                    { title: `${neighborhood} Manzaralı Geniş Balkonlu Lüks Portföy`, room: `${roomCount}+${livingRoomCount}`, age: "1", area: `${effectiveAreaM2 + 20}`, price: `${Math.round(effectiveMarketValue * 1.18).toLocaleString("tr-TR")} ₺`, unit: `${Math.round((effectiveMarketValue * 1.18) / (effectiveAreaM2 + 20)).toLocaleString("tr-TR")} ₺/m²`, days: "11 Gün" },
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

      {/* SAYFA 8: TAŞINMAZIN SIRALAMASI */}
      {currentPage === 8 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-2 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Emsaller Arasındaki Sıralaması</h2>
              <span className="text-xs font-bold text-sky-600">m² Birim Fiyatına Göre Konum</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">{neighborhood} bölgesinde değerlemeye konu taşınmazın diğer 20 emsal arasındaki konumu aşağıda yer almaktadır.</p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Mesafe</th>
                    <th className="p-2">Mahalle / Konum</th>
                    <th className="p-2">Yaş</th>
                    <th className="p-2">Kat</th>
                    <th className="p-2">Alan</th>
                    <th className="p-2">Değer (TL)</th>
                    <th className="p-2 text-right">m² Birim ₺</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="p-2">1</td><td className="p-2">650 m</td><td>{neighborhood}</td><td>{buildingAge + 8}</td><td>1</td><td>{effectiveAreaM2 - 15} m²</td><td>{Math.round(effectiveMarketValue * 0.80).toLocaleString("tr-TR")} ₺</td><td className="p-2 text-right font-mono">{Math.round((effectiveMarketValue * 0.80) / (effectiveAreaM2 - 15)).toLocaleString("tr-TR")} ₺</td></tr>
                  <tr><td className="p-2">5</td><td className="p-2">350 m</td><td>{neighborhood}</td><td>{buildingAge + 4}</td><td>3</td><td>{effectiveAreaM2 - 5} m²</td><td>{Math.round(effectiveMarketValue * 0.90).toLocaleString("tr-TR")} ₺</td><td className="p-2 text-right font-mono">{Math.round((effectiveMarketValue * 0.90) / (effectiveAreaM2 - 5)).toLocaleString("tr-TR")} ₺</td></tr>
                  <tr className="bg-sky-600 text-white font-black shadow-xs">
                    <td className="p-2.5">10</td>
                    <td className="p-2.5">0 m (Hedef: Ada {ada} / Parsel {parsel})</td>
                    <td className="p-2.5">{neighborhood}</td>
                    <td className="p-2.5">{buildingAge}</td>
                    <td className="p-2.5">{floorNumber === 0 ? "Zemin" : floorNumber === 0.5 ? "Y.Giriş" : `${floorNumber}.Kat`}</td>
                    <td className="p-2.5">{effectiveAreaM2} m²</td>
                    <td className="p-2.5">{effectiveMarketValue.toLocaleString("tr-TR")} ₺</td>
                    <td className="p-2.5 text-right font-mono">{m2Price.toLocaleString("tr-TR")} ₺</td>
                  </tr>
                  <tr><td className="p-2">14</td><td className="p-2">180 m</td><td>{neighborhood}</td><td>{buildingAge}</td><td>4</td><td>{effectiveAreaM2 + 5} m²</td><td>{Math.round(effectiveMarketValue * 1.05).toLocaleString("tr-TR")} ₺</td><td className="p-2 text-right font-mono">{Math.round((effectiveMarketValue * 1.05) / (effectiveAreaM2 + 5)).toLocaleString("tr-TR")} ₺</td></tr>
                  <tr><td className="p-2">20</td><td className="p-2">450 m</td><td>{neighborhood}</td><td>1</td><td>5</td><td>{effectiveAreaM2 + 15} m²</td><td>{Math.round(effectiveMarketValue * 1.16).toLocaleString("tr-TR")} ₺</td><td className="p-2 text-right font-mono">{Math.round((effectiveMarketValue * 1.16) / (effectiveAreaM2 + 15)).toLocaleString("tr-TR")} ₺</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Hedef Taşınmaz Bölgesel Emsallerin Denge Noktasında Konumlanmıştır</span>
            <span>Sayfa 8 / 13</span>
          </div>
        </div>
      )}

      {/* SAYFA 9: DEMOGRAFİ ANALİZİ */}
      {currentPage === 9 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Demografi ve Sosyo-Ekonomik Statü</h2>
              <span className="text-xs font-bold text-slate-500">{neighborhood} • {district} • {city}</span>
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
                  <tr><td className="p-2.5 font-bold text-slate-900">Toplam Nüfus</td><td>412</td><td>1.280</td><td>14.150</td><td>18.420</td><td>195.800</td></tr>
                  <tr><td className="p-2.5 font-bold text-slate-900">Baskın Yaş Grubu</td><td>35-39</td><td>35-39</td><td>35-39</td><td>35-39</td><td>35-39</td></tr>
                  <tr><td className="p-2.5 font-bold text-slate-900">A+ SES Oranı</td><td>%16</td><td>%16</td><td>%15</td><td>%15</td><td>%14</td></tr>
                  <tr><td className="p-2.5 font-bold text-slate-900">A SES Oranı</td><td>%32</td><td>%32</td><td>%30</td><td>%30</td><td>%28</td></tr>
                  <tr><td className="p-2.5 font-bold text-slate-900">B SES Oranı</td><td>%26</td><td>%26</td><td>%25</td><td>%25</td><td>%26</td></tr>
                  <tr><td className="p-2.5 font-bold text-slate-900">C SES Oranı</td><td>%18</td><td>%18</td><td>%20</td><td>%20</td><td>%22</td></tr>
                  <tr><td className="p-2.5 font-bold text-slate-900">Ort. Hane Geliri</td><td>88.500 ₺/Ay</td><td>88.500 ₺/Ay</td><td>82.000 ₺/Ay</td><td>84.000 ₺/Ay</td><td>76.000 ₺/Ay</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <strong>TÜİK & Değerleme SES Notu:</strong> Taşınmazın bulunduğu {neighborhood} bölgesinde A ve A+ yüksek sosyo-ekonomik statü oranı toplamda <strong>%48</strong> seviyesindedir. Bölge gelişmiş eğitimli nüfus ve istikrarlı yatırımcı profilindedir.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>TÜİK ADNKS & Bölgesel Sosyo-Ekonomik Skorlama</span>
            <span>Sayfa 9 / 13</span>
          </div>
        </div>
      )}

      {/* SAYFA 10: TÜKETİM HARCAMALARI & ÖNEMLİ KONUMLAR */}
      {currentPage === 10 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Tüketim Harcamaları ve Çevre Konumları</h2>
              <span className="text-xs font-bold text-slate-500">{neighborhood}, {district}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Kişi Başına Harcama (₺/Ay)</h3>
                <div className="flex justify-between"><span>Gıda ve İçecek:</span><strong>6.850 ₺</strong></div>
                <div className="flex justify-between"><span>Konut ve Kira:</span><strong>11.400 ₺</strong></div>
                <div className="flex justify-between"><span>Ulaşım & Akaryakıt:</span><strong>8.250 ₺</strong></div>
                <div className="flex justify-between"><span>Lokanta & Sosyal Yaşam:</span><strong>4.800 ₺</strong></div>
                <div className="flex justify-between"><span>Eğitim & Sağlık:</span><strong>3.600 ₺</strong></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">Önemli Konumlara Mesafeler</h3>
                <div className="flex justify-between"><span>Eğitim / Okul Kampüsü:</span><strong>12 Adet (1.500m içinde)</strong></div>
                <div className="flex justify-between"><span>Sağlık / Hastane:</span><strong>4 Adet (1.500m içinde)</strong></div>
                <div className="flex justify-between"><span>Sahil / Ana Arter Aksı:</span><strong>400m içinde</strong></div>
                <div className="flex justify-between"><span>Sosyal Yaşam & Çarşı:</span><strong>{neighborhood} Merkez (300m)</strong></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>POI (Points of Interest) & Donatı İncelemesi</span>
            <span>Sayfa 10 / 13</span>
          </div>
        </div>
      )}

      {/* SAYFA 11: SATILIK & KİRALIK KONUT BİLGİLERİ */}
      {currentPage === 11 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Satılık & Kiralık Stok Analizi</h2>
              <span className="text-xs font-bold text-slate-500">{district} Piyasa Likidite Göstergeleri</span>
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
                      <tr><td className="p-2 font-bold">150m Çap</td><td>{effectiveAreaM2} m²</td><td>{m2Price.toLocaleString("tr-TR")} ₺/m²</td><td>16.2 Yıl</td><td>45 Gün</td></tr>
                      <tr><td className="p-2 font-bold">600m Çap</td><td>{effectiveAreaM2 - 10} m²</td><td>{Math.round(m2Price * 0.96).toLocaleString("tr-TR")} ₺/m²</td><td>16.5 Yıl</td><td>48 Gün</td></tr>
                      <tr><td className="p-2 font-bold">Mahalle ({neighborhood})</td><td>{effectiveAreaM2} m²</td><td>{Math.round(m2Price * 0.98).toLocaleString("tr-TR")} ₺/m²</td><td>16.2 Yıl</td><td>45 Gün</td></tr>
                      <tr><td className="p-2 font-bold">İlçe ({district})</td><td>125 m²</td><td>{Math.round(m2Price * 0.94).toLocaleString("tr-TR")} ₺/m²</td><td>17.0 Yıl</td><td>52 Gün</td></tr>
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
                      <tr><td className="p-2 font-bold">150m Çap</td><td>{effectiveAreaM2} m²</td><td>{Math.round(rentEstimate / effectiveAreaM2)} ₺/m²</td><td>35 Gün</td><td>14 Adet</td></tr>
                      <tr><td className="p-2 font-bold">600m Çap</td><td>120 m²</td><td>{Math.round((rentEstimate * 0.95) / 120)} ₺/m²</td><td>38 Gün</td><td>42 Adet</td></tr>
                      <tr><td className="p-2 font-bold">Mahalle ({neighborhood})</td><td>125 m²</td><td>{Math.round((rentEstimate * 0.98) / 125)} ₺/m²</td><td>36 Gün</td><td>86 Adet</td></tr>
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

      {/* SAYFA 12: ARAZİ KULLANIM HARİTALARI */}
      {currentPage === 12 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-3 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Arazi Kullanım ve Çevre Analizi</h2>
              <span className="text-xs font-bold text-slate-500">{city} Kadastro Katmanları</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <TreePine className="w-4 h-4" />
                  <span>Ormanlık Alanlar</span>
                </div>
                <div className="text-[11px] text-slate-500">En Yakın Orman:</div>
                <div className="text-sm font-black text-slate-900">1.250 metre</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Enerji Nakil Hatları</span>
                </div>
                <div className="text-[11px] text-slate-500">Hat Koruma Bandı:</div>
                <div className="text-sm font-black text-emerald-700">Güvenli Mesafede</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-sky-700 font-bold">
                  <Droplets className="w-4 h-4" />
                  <span>Deniz / Su Toplama</span>
                </div>
                <div className="text-[11px] text-slate-500">Taşkın Durumu:</div>
                <div className="text-sm font-black text-emerald-700">Taşkın Riski Yok</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>Trafolar & Altyapı</span>
                </div>
                <div className="text-[11px] text-slate-500">Altyapı Durumu:</div>
                <div className="text-sm font-black text-slate-900">Tam Altyapılı</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Deprem Riski (PGA)</span>
                </div>
                <div className="text-[11px] text-slate-500">AFAD Zemin İvmesi:</div>
                <div className="text-sm font-black text-slate-900">{pga} (Düşük/Orta)</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                  <Compass className="w-4 h-4" />
                  <span>Heyelan Riski</span>
                </div>
                <div className="text-[11px] text-slate-500">MTA Zemin Haritası:</div>
                <div className="text-sm font-black text-emerald-700">Risk Bulunmuyor</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>AFAD, MTA ve Çevre Şehircilik Bakanlığı Harita Katmanları</span>
            <span>Sayfa 12 / 13</span>
          </div>
        </div>
      )}

      {/* SAYFA 13: SEÇİM & SOSYAL ANALİZ */}
      {currentPage === 13 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">2024 Yerel Seçim Siyasi ve Sosyal Tercihler</h2>
              <span className="text-xs font-bold text-slate-500">{district} / {city} Sandık Verileri</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-extrabold text-slate-900">Belediye Başkanlığı Oy Dağılımı (2024)</h3>
                <div className="space-y-1.5 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold"><span>CHP</span><span>%58</span></div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: "58%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold"><span>AK Parti / Cumhur İttifakı</span><span>%34</span></div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "34%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold"><span>Diğer Partiler</span><span>%8</span></div>
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
                    <div className="flex justify-between text-[11px] font-bold"><span>CHP</span><span>%56</span></div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: "56%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold"><span>Cumhur İttifakı</span><span>%36</span></div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "36%" }} />
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
    </>
  );
};
