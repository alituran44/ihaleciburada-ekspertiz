import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Phone, Mail, FileCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0B1E3B] text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Marka & Tanıtım */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-heading tracking-tight text-white">
                ihaleciburada<span className="text-blue-500">.com</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-900/50 border border-blue-600/40 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                Ekspertiz & İmar Fizibilitesi
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              Türkiye genelinde arsa satanlar, emlak danışmanları, müteahhitler ve ihale katılımcıları için 
              3194 Sayılı İmar Kanunu standartlarında yapılaşma hakkı, inşaat alanı, ÇŞB maliyet baremleri ve 
              kat karşılığı fizibilitesi üreten yeni nesil karar destek sistemi.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Merkez / Çanakkale, Türkiye
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                0850 840 86 95
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                ihalecib@gmail.com
              </span>
            </div>
          </div>

          {/* Hızlı Bağlantılar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
              İhaleciBurada Ekosistemi
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="https://ihaleciburada.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  İhale Portalı Ana Sayfa
                </a>
              </li>
              <li>
                <a href="https://ihaleciburada.com/pazar-yeri" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  İhale Pazar Yeri & İlanlar
                </a>
              </li>
              <li>
                <a href="https://ihaleciburada.com/abonelik" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  Kurumsal Üyelik & Paketler
                </a>
              </li>
              <li>
                <a href="https://ihaleciburada.com/sozlesmeler?tab=hakkimizda" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                  Kurumsal & Güvenli Escrow
                </a>
              </li>
            </ul>
          </div>

          {/* Hukuki & Yasal Sorumluluk Reddi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Yasal Bilgilendirme
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Bu sistem üzerinde üretilen analizler, kullanıcı tarafından beyan edilen imar katsayıları ve piyasa verilerine dayalı bir <strong className="text-slate-300">ön fizibilite ve yatırım karar destek modelidir</strong>. 6362 sayılı Sermaye Piyasası Kanunu kapsamında yetkili Gayrimenkul Değerleme Şirketlerinin düzenlediği resmi ekspertiz raporu niteliğinde değildir.
            </p>
          </div>
        </div>

        {/* Alt Telif Şeridi */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} İhaleciBurada (Hasan Hüseyin Yıldırım). Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>6698 Sayılı KVKK Uyumlu</span>
            <span>•</span>
            <span>SSL / TLS 1.3 Korumalı</span>
            <span>•</span>
            <span className="text-slate-400">ekspertiz.ihaleciburada.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
