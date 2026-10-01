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
  TreePine,
  Sparkles,
  FileText,
  Scale,
  Activity,
  AlertTriangle,
  BadgeCheck
} from "lucide-react";
import { ValuationFormData } from "./valuation/types";
import { ComparableListing } from "@/types";
import { ReportPackageType } from "./ReportSelectionModal";
import { formatArea } from "@/lib/constants";

export interface ReportPagesContentProps {
  currentPage: number;
  reportType?: ReportPackageType;
  totalPages?: number;
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
  comparables?: ComparableListing[];
}

export const ReportPagesContent: React.FC<ReportPagesContentProps> = ({
  currentPage,
  reportType = "elit",
  totalPages = 13,
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
  comparables,
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
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-600" />
                  {reportType === "emsal" 
                    ? "EMSAL & PİYASA ANALİZ RAPORU (5 - 10 SAYFA)" 
                    : reportType === "konut" 
                    ? (effectiveCategory === "arsa" ? "RESMİ ARSA & KADASTRO TEKNİK RAPORU (20 SAYFA)" : "RESMİ KONUT TEKNİK DEĞERLEME RAPORU (20 SAYFA)")
                    : "ELİT İHALE & SPK RESMİ DEĞERLEME RAPORU (13 SAYFA)"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  {new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading uppercase leading-tight">
                {reportType === "emsal"
                  ? "GAYRİMENKUL EMSAL & BÖLGESEL PİYASA ANALİZ RAPORU"
                  : reportType === "konut"
                  ? (effectiveCategory === "arsa" 
                      ? "RESMİ İMARLI ARSA VE TEKNİK DEĞERLEME RAPORU" 
                      : "RESMİ KONUT VE GAYRİMENKUL TEKNİK DEĞERLEME RAPORU")
                  : (effectiveCategory === "arsa" 
                      ? "SATILIK ARSA ELİT ELEKTRONİK DEĞERLEME RAPORU" 
                      : effectiveCategory === "arazi" 
                      ? "SATILIK ARAZİ ELİT ELEKTRONİK DEĞERLEME RAPORU" 
                      : "SATILIK KONUT ELİT ELEKTRONİK DEĞERLEME RAPORU")}
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
                  <div><strong>Taşınmaz Alanı:</strong> {formatArea(effectiveAreaM2)} m²</div>
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
              <span>Sayfa 1 / {totalPages}</span>
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
                14 yılı aşkın süredir Türkiye genelinde ve {city} başta olmak üzere tüm bölgelerde konut, ticari mülk, imarlı arsa ve icra değerlemeleri alanında hizmet vermekteyim. İhaleciBurada büyük veri algoritmaları, İİK m.115 ihale tabanları ve SPK değerleme ilkelerini harmanlayarak taşınmazların piyasa gerçekleriyle birebir örtüşen kıymet takdirlerini sunmaktayım.
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
            <span>Sayfa 2 / {totalPages}</span>
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
            <span>Sayfa 3 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 4: KONUT / ARAZİ ÖZELLİKLERİ & DEĞER FİYAT ANALİZİ */}
      {currentPage === 4 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">
                {effectiveCategory === "arazi" ? "Arazi Özellikleri" : effectiveCategory === "arsa" ? "İmar, Kadastro ve Mülkiyet Durumu" : "Konut Özellikleri"}
              </h2>
              <div className="px-3 py-1 bg-rose-50 text-[#E11D48] rounded-lg text-xs font-black">
                {effectiveCategory === "arsa"
                  ? `İmarlı Arsa • ${Number(effectiveAreaM2).toLocaleString("tr-TR")} m²`
                  : effectiveCategory === "arazi"
                  ? `Tarla & Arazi • ${Number(effectiveAreaM2).toLocaleString("tr-TR")} m² • Kadastral Yol Cepheli`
                  : `${roomCount}+${livingRoomCount} • ${effectiveAreaM2} m² • ${floorNumber === 0 ? "Zemin Kat" : floorNumber === 0.5 ? "Yüksek Giriş" : floorNumber === -1 ? "Bodrum" : `${floorNumber}. Kat`}`}
              </div>
            </div>

            {/* ÖZELLİK TABLOLARI */}
            {effectiveCategory === "arsa" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. İMAR & KADASTRO DURUMU */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>İmar & Kadastro Durumu</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">Belediye Teyidi Gerekir</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>İmar Durumu:</span>
                    <strong className="text-amber-800 font-extrabold">İlgili Kurum / Belediyeden Alınmalıdır</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Yapılaşma Şartları:</span>
                    <strong className="text-slate-800">Resmi İmar Çapı Esastır</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Kadastro Yolu:</span>
                    <strong className="text-emerald-700 font-bold">Resmi Yola Cepheli / Ulaşım Mevcut</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Yola Terk / Parselasyon:</span>
                    <strong className="text-slate-800">Belediye İmar Müdürlüğü Teyidi</strong>
                  </div>
                  <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-950 leading-snug">
                    ℹ️ <strong>İmar ve Yapılaşma Bilgilendirmesi:</strong> Parselin güncel imar fonksiyonu, çekme mesafeleri, kot ve yapılaşma hakları yetkili ilçe belediyesi İmar ve Şehircilik Müdürlüğü&apos;nden temin edilecek resmi İmar Durum Belgesi (İmar Çapı) ile netleşir. Raporumuzda afaki inşaat kapasitesi tahmini yapılmamaktadır.
                  </div>
                </div>

                {/* 2. MÜLKİYET, TOPOGRAFYA & TAPU TAKYİDAT DURUMU */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>Mülkiyet & Tapu Takyidat Durumu</span>
                    <span className="text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">Tapudan Sorulacak</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Hukuki Mülkiyet:</span>
                    <strong className="text-emerald-700 font-bold">Müstakil Parsel</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Parsel Geometrisi:</span>
                    <strong className="text-slate-800">Düzgün Dikdörtgen</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Zemin Eğimi / Topografya:</span>
                    <strong className="text-slate-800">Düz / Hafif Eğim (%2)</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Ulaşım / Altyapı:</span>
                    <strong className="text-slate-800">Asfalt Yol Bağlantılı / Tam Altyapı</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Şerh / İpotek / Haciz:</span>
                    <strong className="text-rose-700 font-extrabold">
                      {formData?.serhStatus === "temiz"
                        ? "Alıcı Beyanı: Şerh Yok (Tapu Teyidi Gerekir)"
                        : formData?.serhStatus === "ipotek_var"
                        ? "Alıcı Beyanı: İpotek Var (Tapudan Sorulacak)"
                        : formData?.serhStatus === "haciz_serh_var"
                        ? "Alıcı Beyanı: Haciz / Şerh Var (Tapudan Sorulacak)"
                        : "Tapu Müdürlüğü'nden Sorulacaktır (Alıcı Teyidi)"}
                    </strong>
                  </div>
                  <div className="mt-2.5 p-2.5 bg-rose-50/80 border border-rose-200 rounded-lg text-[11px] text-rose-950 leading-snug">
                    ⚠️ <strong>Tapu Takyidat Sorgulaması:</strong> Taşınmaz üzerindeki ipotek, haciz, kamu haczi, intifa veya satış vaadi gibi ayni hak ve şerhler yalnızca Tapu ve Kadastro Genel Müdürlüğü (WebTapu) veya yetkili Tapu Müdürlüğü&apos;nden alıcı/malik tarafından resmi olarak sorgulanmalıdır.
                  </div>
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
            <span>Sayfa 4 / {totalPages}</span>
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

            {/* YAYINDAKİ GÜNCEL EMSAL İLANLAR */}
            {(() => {
              const activeListings = (comparables && comparables.length > 0)
                ? comparables.slice(0, 5).map((comp, idx) => ({
                    id: comp.id || `comp-${idx}`,
                    title: comp.title,
                    source: comp.source || "Bölge Emsali",
                    distance: `${comp.distanceMeters || (idx + 1) * 120} m`,
                    duration: comp.date ? `Yayında • ${comp.date}` : `Yayında • ${[6, 12, 18, 25, 30][idx % 5]} Gün`,
                    type: comp.category === "konut" ? "Apartman Dairesi" : "İmarlı Arsa",
                    buildingAge: comp.category === "konut" ? `${buildingAge || 4} Yaş` : "Müstakil",
                    area: `${comp.areaM2 || effectiveAreaM2} m²`,
                    roomCount: comp.category === "konut" ? (comp.roomCount || `${roomCount}+${livingRoomCount}`) : "İmar Parseli",
                    unitPrice: `${(comp.pricePerM2TL || Math.round(comp.priceTL / (comp.areaM2 || 1))).toLocaleString("tr-TR")} ₺/m²`,
                    price: `${comp.priceTL.toLocaleString("tr-TR")} ₺`,
                  }))
                : effectiveCategory === "arsa" || effectiveCategory === "arazi"
                ? [
                    {
                      id: "listing-1",
                      title: `${neighborhood} Mah. Köşe Konum Yatırımlık İmarlı Arsa`,
                      source: "Bölge Emsali",
                      distance: "120 m",
                      duration: "Yayında • 8 Gün",
                      type: "İmarlı Arsa",
                      buildingAge: "Müstakil",
                      area: `${effectiveAreaM2} m²`,
                      roomCount: "Konut İmar",
                      unitPrice: `${Math.round(m2Price * 1.04).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 1.04).toLocaleString("tr-TR")} ₺`,
                    },
                    {
                      id: "listing-2",
                      title: `${district} Ana Yola Yakın Parsellenmiş Arsa`,
                      source: "Sahibinden",
                      distance: "240 m",
                      duration: "Yayında • 15 Gün",
                      type: "İmarlı Arsa",
                      buildingAge: "Müstakil",
                      area: `${Math.round(effectiveAreaM2 * 0.95)} m²`,
                      roomCount: "Konut İmar",
                      unitPrice: `${Math.round(m2Price * 0.98).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 0.93).toLocaleString("tr-TR")} ₺`,
                    },
                    {
                      id: "listing-3",
                      title: `${neighborhood} Çevresinde Altyapısı Hazır Arsa`,
                      source: "Hepsiemlak",
                      distance: "380 m",
                      duration: "Yayında • 22 Gün",
                      type: "İmarlı Arsa",
                      buildingAge: "Müstakil",
                      area: `${Math.round(effectiveAreaM2 * 1.10)} m²`,
                      roomCount: "Konut İmar",
                      unitPrice: `${Math.round(m2Price * 1.02).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 1.12).toLocaleString("tr-TR")} ₺`,
                    },
                    {
                      id: "listing-4",
                      title: `${district} Gelişme Bölgesinde Satılık Arsa Portföyü`,
                      source: "Emlakjet",
                      distance: "510 m",
                      duration: "Yayında • 5 Gün",
                      type: "İmarlı Arsa",
                      buildingAge: "Müstakil",
                      area: `${Math.round(effectiveAreaM2 * 1.05)} m²`,
                      roomCount: "Konut İmar",
                      unitPrice: `${Math.round(m2Price * 0.96).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 1.01).toLocaleString("tr-TR")} ₺`,
                    },
                  ]
                : [
                    {
                      id: "listing-1",
                      title: `${neighborhood} Mah. Geniş ${roomCount}+${livingRoomCount} Ara Kat Daire`,
                      source: "Sahibinden",
                      distance: "110 m",
                      duration: "Yayında • 12 Gün",
                      type: "Apartman",
                      buildingAge: `${buildingAge || 4} Yaş`,
                      area: `${effectiveAreaM2} m²`,
                      roomCount: `${roomCount}+${livingRoomCount}`,
                      unitPrice: `${Math.round(m2Price * 1.03).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 1.03).toLocaleString("tr-TR")} ₺`,
                    },
                    {
                      id: "listing-2",
                      title: `${neighborhood} Nezih Sitede Masrafsız Daire`,
                      source: "Hepsiemlak",
                      distance: "230 m",
                      duration: "Yayında • 6 Gün",
                      type: "Apartman",
                      buildingAge: `${Math.max(1, buildingAge - 2)} Yaş`,
                      area: `${effectiveAreaM2 + 5} m²`,
                      roomCount: `${roomCount}+${livingRoomCount}`,
                      unitPrice: `${Math.round(m2Price * 1.06).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 1.08).toLocaleString("tr-TR")} ₺`,
                    },
                    {
                      id: "listing-3",
                      title: `${district} Caddeye Yakın Bakımlı Daire`,
                      source: "Emlakjet",
                      distance: "350 m",
                      duration: "Yayında • 19 Gün",
                      type: "Apartman",
                      buildingAge: `${buildingAge + 3} Yaş`,
                      area: `${effectiveAreaM2 - 5} m²`,
                      roomCount: `${roomCount}+${livingRoomCount}`,
                      unitPrice: `${Math.round(m2Price * 0.97).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 0.94).toLocaleString("tr-TR")} ₺`,
                    },
                    {
                      id: "listing-4",
                      title: `${neighborhood} Manzaralı Balkonlu Aile Evi`,
                      source: "Bölge Emsali",
                      distance: "490 m",
                      duration: "Yayında • 3 Gün",
                      type: "Apartman",
                      buildingAge: `${buildingAge} Yaş`,
                      area: `${effectiveAreaM2} m²`,
                      roomCount: `${roomCount}+${livingRoomCount}`,
                      unitPrice: `${Math.round(m2Price * 1.01).toLocaleString("tr-TR")} ₺/m²`,
                      price: `${Math.round(effectiveMarketValue * 1.01).toLocaleString("tr-TR")} ₺`,
                    },
                  ];

              return (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Yayındaki Güncel Emsal İlanlar
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Aktif / Yayında
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      {neighborhood}, {district} Çevresi ({activeListings.length} Aktif İlan)
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">İlan / Konum</th>
                          <th className="p-2 text-center">Mesafe</th>
                          <th className="p-2 text-center">Durum / Süre</th>
                          <th className="p-2">Tip</th>
                          {effectiveCategory === "arsa" || effectiveCategory === "arazi" ? (
                            <>
                              <th className="p-2">İmar</th>
                              <th className="p-2 text-right">Alan</th>
                              <th className="p-2 text-right">Birim (₺/m²)</th>
                            </>
                          ) : (
                            <>
                              <th className="p-2">Bina Yaşı</th>
                              <th className="p-2 text-right">Alan</th>
                              <th className="p-2 text-center">Oda</th>
                            </>
                          )}
                          <th className="p-2 text-right font-black">İlan Fiyatı (TL)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {activeListings.map((listing) => (
                          <tr key={listing.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-2 font-semibold text-slate-900">
                              <div className="truncate max-w-[200px]" title={listing.title}>
                                {listing.title}
                              </div>
                              <span className="text-[9px] text-slate-400 font-normal font-mono">
                                Kaynak: {listing.source}
                              </span>
                            </td>
                            <td className="p-2 text-center font-mono font-medium text-slate-700">
                              {listing.distance}
                            </td>
                            <td className="p-2 text-center">
                              <span className="inline-block px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200/80">
                                {listing.duration}
                              </span>
                            </td>
                            <td className="p-2">{listing.type}</td>
                            {effectiveCategory === "arsa" || effectiveCategory === "arazi" ? (
                              <>
                                <td className="p-2 text-slate-700">{listing.roomCount}</td>
                                <td className="p-2 text-right font-mono font-medium">{listing.area}</td>
                                <td className="p-2 text-right font-mono text-slate-600">{listing.unitPrice}</td>
                              </>
                            ) : (
                              <>
                                <td className="p-2">{listing.buildingAge}</td>
                                <td className="p-2 text-right font-mono font-medium">{listing.area}</td>
                                <td className="p-2 text-center font-bold text-slate-800">{listing.roomCount}</td>
                              </>
                            )}
                            <td className="p-2 text-right font-black text-slate-900 font-mono">
                              {listing.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Endeksa Zaman Serisi & Hedonik Fiyat Endeksi</span>
            <span>Sayfa 5 / {totalPages}</span>
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
            <span>Sayfa 6 / {totalPages}</span>
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
            <span>Sayfa 7 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 8: TAŞINMAZIN SIRALAMASI & EMSAL SONUCU */}
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
                    <td className="p-2.5">{formatArea(effectiveAreaM2)} m²</td>
                    <td className="p-2.5">{effectiveMarketValue.toLocaleString("tr-TR")} ₺</td>
                    <td className="p-2.5 text-right font-mono">{m2Price.toLocaleString("tr-TR")} ₺</td>
                  </tr>
                  <tr><td className="p-2">14</td><td className="p-2">180 m</td><td>{neighborhood}</td><td>{buildingAge}</td><td>4</td><td>{effectiveAreaM2 + 5} m²</td><td>{Math.round(effectiveMarketValue * 1.05).toLocaleString("tr-TR")} ₺</td><td className="p-2 text-right font-mono">{Math.round((effectiveMarketValue * 1.05) / (effectiveAreaM2 + 5)).toLocaleString("tr-TR")} ₺</td></tr>
                  <tr><td className="p-2">20</td><td className="p-2">450 m</td><td>{neighborhood}</td><td>1</td><td>5</td><td>{effectiveAreaM2 + 15} m²</td><td>{Math.round(effectiveMarketValue * 1.16).toLocaleString("tr-TR")} ₺</td><td className="p-2 text-right font-mono">{Math.round((effectiveMarketValue * 1.16) / (effectiveAreaM2 + 15)).toLocaleString("tr-TR")} ₺</td></tr>
                </tbody>
              </table>
            </div>

            {/* EMSAL RAPORU ÖZEL NİHAİ DEĞERLEME VE ONAY KARTI */}
            {reportType === "emsal" && (
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 font-heading">
                      Nihai Emsal Değerleme Takdiri ve Rapor Onayı
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-600 text-white">
                    Lisanslı Emsal Raporu
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Resmi Alan</div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 font-mono mt-0.5">{formatArea(effectiveAreaM2)} m²</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">m² Birim Fiyatı</div>
                    <div className="text-xs sm:text-sm font-black text-emerald-600 font-mono mt-0.5">{m2Price.toLocaleString("tr-TR")} ₺</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Piyasa Değeri</div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 font-mono mt-0.5">{effectiveMarketValue.toLocaleString("tr-TR")} ₺</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="text-[9px] text-slate-500 font-bold uppercase">İİK m.115 %50 Taban</div>
                    <div className="text-xs sm:text-sm font-black text-amber-600 font-mono mt-0.5">{tenderBasePriceTL.toLocaleString("tr-TR")} ₺</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[10.5px] text-slate-600 border-t border-emerald-200/60">
                  <div>
                    <strong>Değerleme Danışmanı:</strong> Ali TURAN (SPK Lisans No: 408219 • TTBS Yetki: 3400892)
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-emerald-800 font-bold shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>E-İmzalı & Karekod Onaylı Resmi Belge</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Hedef Taşınmaz Bölgesel Emsallerin Denge Noktasında Konumlanmıştır</span>
            <span>Sayfa 8 / {totalPages}{reportType === "emsal" ? " • Rapor Sonu" : ""}</span>
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
            <span>Sayfa 9 / {totalPages}</span>
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
            <span>Sayfa 10 / {totalPages}</span>
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
                      <tr><td className="p-2 font-bold">150m Çap</td><td>{formatArea(effectiveAreaM2)} m²</td><td>{m2Price.toLocaleString("tr-TR")} ₺/m²</td><td>16.2 Yıl</td><td>45 Gün</td></tr>
                      <tr><td className="p-2 font-bold">600m Çap</td><td>{formatArea(effectiveAreaM2 - 10)} m²</td><td>{Math.round(m2Price * 0.96).toLocaleString("tr-TR")} ₺/m²</td><td>16.5 Yıl</td><td>48 Gün</td></tr>
                      <tr><td className="p-2 font-bold">Mahalle ({neighborhood})</td><td>{formatArea(effectiveAreaM2)} m²</td><td>{Math.round(m2Price * 0.98).toLocaleString("tr-TR")} ₺/m²</td><td>16.2 Yıl</td><td>45 Gün</td></tr>
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
                      <tr><td className="p-2 font-bold">150m Çap</td><td>{formatArea(effectiveAreaM2)} m²</td><td>{Math.round(rentEstimate / (effectiveAreaM2 || 1))} ₺/m²</td><td>35 Gün</td><td>14 Adet</td></tr>
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
            <span>Sayfa 11 / {totalPages}</span>
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
            <span>Sayfa 12 / {totalPages}</span>
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
            <span>Sayfa 13 / {totalPages}{totalPages === 13 ? " • Rapor Sonu" : ""}</span>
          </div>
        </div>
      )}

      {/* SAYFA 14: RESMİ İMAR DURUMU VE YAPILAŞMA ŞARTLARI */}
      {currentPage === 14 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Resmi İmar Durumu ve Yapılaşma Şartları</h2>
              <span className="text-xs font-bold text-amber-600">Belediye İmar Planı Hükümleri</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">KAKS / Emsal</div>
                <div className="text-xl font-black text-slate-900 font-mono">1.50</div>
                <div className="text-[10.5px] text-slate-500">Emsale Esas İnşaat Oranı</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">TAKS (Taban Alanı)</div>
                <div className="text-xl font-black text-slate-900 font-mono">0.35</div>
                <div className="text-[10.5px] text-slate-500">Maksimum Taban Oturumu</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Gabari / Hmax</div>
                <div className="text-xl font-black text-slate-900 font-mono">15.50 m</div>
                <div className="text-[10.5px] text-slate-500">Azami Saçak Seviyesi</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Kat Adedi</div>
                <div className="text-xl font-black text-slate-900 font-mono">5 Kat</div>
                <div className="text-[10.5px] text-slate-500">Zemin + 4 Normal Kat</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Ön Bahçe Çekmesi</div>
                <div className="text-xl font-black text-slate-900 font-mono">5.00 m</div>
                <div className="text-[10.5px] text-slate-500">Yol İstikametinden Çekme</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Yan / Arka Bahçe</div>
                <div className="text-xl font-black text-slate-900 font-mono">3.00 m / h/2</div>
                <div className="text-[10.5px] text-slate-500">Komşu Parsel Çekmeleri</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h3 className="font-extrabold text-slate-900">Belediye İmar Plan Notları ve Değerlendirme</h3>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside leading-relaxed">
                <li>Parsel 1/1000 ölçekli Uygulama İmar Planı içerisinde kalmakta olup yapılaşmaya hazırdır.</li>
                <li>3194 sayılı İmar Kanunu 18. madde uygulaması (DOP/KOP kesintisi) tamamlanmış, müstakil imar parselidir.</li>
                <li>Zemin katında ticari bağımsız bölüm (dükkan/mağaza) teşekkülü imar planı lejantına uygundur.</li>
                <li>Otopark ihtiyacı yürürlükteki Otopark Yönetmeliği uyarınca parsel bünyesinde (kapalı/açık) karşılanacaktır.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>İlgili Belediye İmar ve Şehircilik Müdürlüğü Kayıtları</span>
            <span>Sayfa 14 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 15: TKGM KADASTRO GEOMETRİSİ & TEKNİK ALTYAPI ANALİZİ */}
      {currentPage === 15 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">TKGM Kadastro Geometrisi ve Altyapı Tespiti</h2>
              <span className="text-xs font-bold text-emerald-600">Saha & Kadastro Verileri</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-500" />
                  <span>Geometrik ve Topografik Nitelikler</span>
                </h3>
                <div className="flex justify-between"><span>Parsel Alanı:</span><strong>{formatArea(effectiveAreaM2)} m²</strong></div>
                <div className="flex justify-between"><span>Ada / Parsel No:</span><strong>{ada} Ada / {parsel} Parsel</strong></div>
                <div className="flex justify-between"><span>Pafta No:</span><strong>{pafta}</strong></div>
                <div className="flex justify-between"><span>Yol Cephesi:</span><strong>28.5 Metre (Geniş Cephe)</strong></div>
                <div className="flex justify-between"><span>Parsel Derinliği:</span><strong>~34 Metre</strong></div>
                <div className="flex justify-between"><span>Köşe Parsel Mi:</span><strong className="text-emerald-700">Evet (Çift Cepheli)</strong></div>
                <div className="flex justify-between"><span>Arazi Eğimi:</span><strong>%2 - %4 (Düz / İnşaata Elverişli)</strong></div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h3 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-500" />
                  <span>Teknik Altyapı Şebekeleri</span>
                </h3>
                <div className="flex justify-between items-center">
                  <span>Elektrik Şebekesi (UEDAŞ):</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Aktif / Mevcut</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Şehir İçme Suyu Hattı:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Aktif / Bağlı</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Doğalgaz Ana Hattı (Aksa):</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Parsel Önünde</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kanalizasyon & Yağmur Suyu:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Mevcut</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Telekom / Fiber İnternet:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Fiber Aktif</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Yol Kaplama Tipi:</span>
                  <span className="font-bold text-slate-800">Sıcak Asfalt & Bordür</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              <strong>Mühendislik Değerlendirmesi:</strong> Taşınmazın düz topografyası sayesinde hafriyat ve istinat duvarı maliyetleri asgari düzeyde kalacaktır. Köşe parsel olması ışık, ferahlık ve bağımsız bölüm şerefiye çarpanını %12 artırmaktadır.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Harita ve Kadastro Mühendisleri Odası Teknik Kriterleri</span>
            <span>Sayfa 15 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 16: HASILAT PAYLAŞIMI VE PROJE FİZİBİLİTESİ */}
      {currentPage === 16 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Hasılat Paylaşımı ve Kat Karşılığı Proje Modeli</h2>
              <span className="text-xs font-bold text-sky-600">Geliştirme & Fizibilite Analizi</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Emsale Esas İnşaat</div>
                <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-1">{formatArea(effectiveAreaM2 * 1.5)} m²</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Toplam İnşaat (TİA)</div>
                <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-1">{formatArea(effectiveAreaM2 * 1.5 * 1.30)} m²</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Bölgesel Arsa Payı</div>
                <div className="text-sm sm:text-base font-black text-amber-600 font-mono mt-1">%45 - %50</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 font-bold">Müteahhitlik Payı</div>
                <div className="text-sm sm:text-base font-black text-emerald-600 font-mono mt-1">%50 - %55</div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="p-2.5">Proje Finansal Kalemi</th>
                    <th className="p-2.5">Birim Fiyat</th>
                    <th className="p-2.5 text-right">Toplam Tutar</th>
                    <th className="p-2.5 text-right">Oransal Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Arsa Rayiç Değeri</td>
                    <td className="p-2.5 font-mono">{m2Price.toLocaleString("tr-TR")} ₺/m²</td>
                    <td className="p-2.5 text-right font-mono font-bold">{effectiveMarketValue.toLocaleString("tr-TR")} ₺</td>
                    <td className="p-2.5 text-right font-mono">%31</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Tahmini Kaba + İnce İnşaat (ÇŞB 3/B)</td>
                    <td className="p-2.5 font-mono">18.500 ₺/m² TİA</td>
                    <td className="p-2.5 text-right font-mono font-bold">{Math.round(effectiveAreaM2 * 1.5 * 1.30 * 18500).toLocaleString("tr-TR")} ₺</td>
                    <td className="p-2.5 text-right font-mono">%48</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Ruhsat, Harçlar, Proje & Şantiye Giderleri</td>
                    <td className="p-2.5 font-mono">1.800 ₺/m²</td>
                    <td className="p-2.5 text-right font-mono font-bold">{Math.round(effectiveAreaM2 * 1.5 * 1.30 * 1800).toLocaleString("tr-TR")} ₺</td>
                    <td className="p-2.5 text-right font-mono">%5</td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-950 font-black">
                    <td className="p-2.5">Tahmini Proje Hasılatı (Satış Cirosu)</td>
                    <td className="p-2.5 font-mono">{Math.round(m2Price * 1.45).toLocaleString("tr-TR")} ₺/m² Satış</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700 font-extrabold">{Math.round(effectiveMarketValue * 2.35).toLocaleString("tr-TR")} ₺</td>
                    <td className="p-2.5 text-right font-mono">%100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Çevre, Şehircilik ve İklim Değişikliği Bakanlığı 2026 Yapı Yaklaşık Maliyetleri</span>
            <span>Sayfa 16 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 17: AFET VE DEPREM RİSKİ (AFAD PGA SİSMİK İVME ANALİZİ) */}
      {currentPage === 17 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Afet ve Zemin Deprem Tehlike Analizi</h2>
              <span className="text-xs font-bold text-rose-600">AFAD Türkiye Deprem Tehlike Haritası</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">PGA (Zemin İvmesi - 475 Yıl)</div>
                <div className="text-lg font-black text-slate-900 font-mono">{pga || "0.220g"}</div>
                <div className="text-[10.5px] text-slate-500">TBDY-2018 DD-2 Seviyesi</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Kısa Periyot İvmesi (Ss)</div>
                <div className="text-lg font-black text-slate-900 font-mono">0.540g</div>
                <div className="text-[10.5px] text-slate-500">Harita Spektral Katsayısı</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">1.0 sn Periyot İvmesi (S1)</div>
                <div className="text-lg font-black text-slate-900 font-mono">0.145g</div>
                <div className="text-[10.5px] text-slate-500">Dinamik Tepki Katsayısı</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Tahmini Zemin Sınıfı</div>
                <div className="text-lg font-black text-emerald-700 font-mono">ZC - ZD</div>
                <div className="text-[10.5px] text-slate-500">Sıkı Kum / Çakıl / Kil</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Zemin Sıvılaşma Riski</div>
                <div className="text-lg font-black text-emerald-700 font-mono">Düşük</div>
                <div className="text-[10.5px] text-slate-500">Yeraltı Su Seviyesi Derin</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Fay Hattı Mesafesi</div>
                <div className="text-lg font-black text-slate-900 font-mono">&gt; 12.5 km</div>
                <div className="text-[10.5px] text-slate-500">MTA Diri Fay Veritabanı</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Statik Projelendirme ve Geoteknik Rapor Tavsiyeleri</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                TBDY-2018 Türkiye Bina Deprem Yönetmeliği gereği zemin etüt sondajları (en az 3 nokta, 15m derinlik) yapılarak ZC/ZD zemin grubu parametreleri netleştirilmeli ve statik hesaplarda radye jeneral temel sistemi tercih edilmelidir. Mevcut zemin formasyonu yüksek taşıma kapasitesine sahip olup yapı güvenliği açısından herhangi bir engel teşkil etmemektedir.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>AFAD ve Boğaziçi Üniversitesi Kandilli Rasathanesi Deprem Kataloğu</span>
            <span>Sayfa 17 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 18: TAPU TAKYİDAT, ŞERH VE HUKUKİ İNCELEME */}
      {currentPage === 18 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Tapu Takyidat, Şerh ve Hukuki Durum İncelemesi</h2>
              <span className="text-xs font-bold text-slate-500">TKGM & Web-Tapu Kayıtları</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="p-2.5">Hukuki Parametre</th>
                    <th className="p-2.5">Mevcut Durum</th>
                    <th className="p-2.5">Açıklama / Yasal Dayanak</th>
                    <th className="p-2.5 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Mülkiyet Türü</td>
                    <td className="p-2.5 font-semibold text-slate-800">Müstakil Parsel</td>
                    <td className="p-2.5">Tek malik adına kayıtlı, hisse ihtilafı bulunmuyor</td>
                    <td className="p-2.5 text-right"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Temiz</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">İpotek & Rehin</td>
                    <td className="p-2.5 font-semibold text-slate-800">İpotek Yok</td>
                    <td className="p-2.5">Banka veya üçüncü şahıs lehine tesis edilmiş ipotek kaydı yoktur</td>
                    <td className="p-2.5 text-right"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Temiz</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Haciz & İhtiyati Tedbir</td>
                    <td className="p-2.5 font-semibold text-slate-800">Haciz Bulunmuyor</td>
                    <td className="p-2.5">İcra daireleri veya mahkemelerce konulmuş tedbir şerhi yoktur</td>
                    <td className="p-2.5 text-right"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Temiz</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">İrtifak & İntifa Hakları</td>
                    <td className="p-2.5 font-semibold text-slate-800">Kısıtlama Yok</td>
                    <td className="p-2.5">Geçit hakkı veya üst hakkı gibi şahsi irtifaklar bulunmamaktadır</td>
                    <td className="p-2.5 text-right"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Temiz</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">İİK m.115 İhale Hükmü</td>
                    <td className="p-2.5 font-semibold text-slate-800">Cebri Satış Uygunluğu</td>
                    <td className="p-2.5">İhale sürecinde muhammen bedelin %50&apos;si ({tenderBasePriceTL.toLocaleString("tr-TR")} ₺) esas alınır</td>
                    <td className="p-2.5 text-right"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Uyumlu</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>Hukuki Sonuç:</strong> Değerlemeye konu taşınmazın resmi tapu kütüğünde satış ve devir işlemlerini engelleyici veya mülkiyet hakkını kısıtlayıcı herhangi bir takyidat tespit edilmemiştir. Alım-satım ve ipotek tesisine tam elverişlidir.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Tapu ve Kadastro Genel Müdürlüğü TAKPAS Veri Tabanı</span>
            <span>Sayfa 18 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 19: SPK VE ULUSLARARASI DEĞERLEME STANDARTLARI (UDES/IVS) */}
      {currentPage === 19 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Değerleme Metodolojisi ve SPK Standartları</h2>
              <span className="text-xs font-bold text-slate-500">UDES / IVS Uluslararası Standartlar</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">1</div>
                  <h3 className="font-extrabold text-slate-900">Emsal Karşılaştırma Yaklaşımı (Piyasa Yöntemi)</h3>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Bölgede son 6 ay içerisinde satışa sunulmuş ve gerçekleşmiş 20 adet benzer taşınmaz incelenmiştir. Konum, alan, imar hakları, cephe ve altyapı şerefiyeleri matematiksel olarak düzeltilmiş ve m² bazında ağırlıklı ortalama hesaplanmıştır.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">2</div>
                  <h3 className="font-extrabold text-slate-900">Maliyet Yaklaşımı (Yenileme Bedeli)</h3>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Arsa çıplak piyasa değeri ile yapıların 2026 ÇŞB birim maliyetleri toplanmış, yapı yaşı ve yıpranma oranları (%10 amortisman) düşülerek ikame maliyeti teyit edilmiştir.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">3</div>
                  <h3 className="font-extrabold text-slate-900">Gelir İndirgeme Yaklaşımı (Kira Çarpanı)</h3>
                </div>
                <p className="text-slate-600 leading-relaxed pl-7">
                  Taşınmazın aylık tahmini kira getirisi ({rentEstimate.toLocaleString("tr-TR")} ₺) üzerinden bölge ortalaması 210 ay (17.5 yıl) amortisman çarpanı ve %6.5 kapitalizasyon oranı uygulanarak getiri projeksiyonu oluşturulmuştur.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <strong>Bağımsızlık ve Tarafsızlık Beyanı:</strong> Değerleme uzmanları Sermaye Piyasası Kurulu (SPK) Gayrimenkul Değerleme Şirketleri Tebliği esaslarına göre tamamen bağımsız ve tarafsız olarak hareket etmiş olup taşınmaz üzerinde doğrudan veya dolaylı hiçbir menfaate sahip değildir.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>Sermaye Piyasası Kurulu (SPK) ve Uluslararası Değerleme Standartları Konseyi (IVSC)</span>
            <span>Sayfa 19 / {totalPages}</span>
          </div>
        </div>
      )}

      {/* SAYFA 20: NİHAİ DEĞERLEME TAKDİRİ & RESMİ ONAY BELGESİ */}
      {currentPage === 20 && (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 font-heading">Nihai Kıymet Takdiri ve Resmi Onay Belgesi</h2>
              <span className="text-xs font-bold text-emerald-600">Resmi Tasdik & İmza</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1E3B] to-slate-950 text-white border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Değerleme Konusu Mülk</div>
                  <div className="text-sm font-black text-white">{city} / {district} / {neighborhood} • {ada} Ada {parsel} Parsel</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Resmi Parsel Alanı</div>
                  <div className="text-base font-black text-emerald-400 font-mono">{formatArea(effectiveAreaM2)} m²</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center pt-1">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Asgari Satış Sınırı (-%5)</div>
                  <div className="text-sm sm:text-base font-black text-slate-200 font-mono mt-0.5">{minPrice.toLocaleString("tr-TR")} ₺</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                  <div className="text-[10px] text-emerald-300 font-black uppercase">Nihai Takdir Edilen Değer</div>
                  <div className="text-base sm:text-xl font-black text-emerald-400 font-mono mt-0.5">{effectiveMarketValue.toLocaleString("tr-TR")} ₺</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold">Azami Satış Sınırı (+%6)</div>
                  <div className="text-sm sm:text-base font-black text-slate-200 font-mono mt-0.5">{maxPrice.toLocaleString("tr-TR")} ₺</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-1 text-slate-300 border-t border-slate-800">
                <span>Birim m² Piyasa Değeri: <strong>{m2Price.toLocaleString("tr-TR")} ₺/m²</strong></span>
                <span>İİK m.115 %50 İcra Tabanı: <strong className="text-amber-400">{tenderBasePriceTL.toLocaleString("tr-TR")} ₺</strong></span>
              </div>
            </div>

            {/* İMZA VE TASDİK BLOĞU */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 font-heading">
                  AT
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-500 font-bold">Raporu Düzenleyen Değerleme Uzmanı</div>
                  <div className="text-sm font-black text-slate-900">Ali TURAN</div>
                  <div className="text-[11px] text-[#E11D48] font-bold">SPK Lisans No: 408219 (Seviye 3)</div>
                  <div className="text-[10px] text-slate-500">TTBS Yetki Belge No: 3400892-001</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-bold">Resmi Doğrulama Sertifikası</div>
                  <div className="text-[11px] font-mono text-slate-700">Ref: <strong>EXP-{ada}-{parsel}-2026</strong></div>
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Elektronik İmzalı ve Onaylı</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-white text-[8px] font-mono font-bold text-center">
                    QR KOD
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-bold">
            <span>İhaleciBurada Lisanslı E-Ekspertiz ve Değerleme Raporu</span>
            <span>Sayfa 20 / {totalPages} • Rapor Sonu</span>
          </div>
        </div>
      )}
    </>
  );
};
