"use client";

import React, { useState } from "react";
import { 
  FileText, 
  X, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Building
} from "lucide-react";
import { ValuationFormData } from "./valuation/types";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formData: ValuationFormData;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  formData,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<"mulk_sahibi" | "yatirimci" | "emlak_danismani" | "diger">("mulk_sahibi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Lütfen adınızı ve soyadınızı giriniz.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Lütfen geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        userRole,
        ada: formData.ada,
        parsel: formData.parsel,
        city: formData.city,
        district: formData.district,
      };

      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("ihaleciburada_lead", JSON.stringify(payload));
      }

      setIsSubmitting(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      // Fallback: save to localStorage anyway and proceed
      if (typeof window !== "undefined") {
        localStorage.setItem("ihaleciburada_lead", JSON.stringify({ fullName, phone, userRole }));
      }
      setIsSubmitting(false);
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* ÜST BAŞLIK BANDI */}
        <div className="px-6 py-4 bg-[#0B1E3B] text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>13 Sayfalık Resmi Raporu İnceleyin</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {formData.city} • {formData.district} • Ada {formData.ada} / Parsel {formData.parsel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORMA ÖZEL BİLGİLENDİRME ROZETLERİ */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1 font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            SPK Lisanslı Ali TURAN Onaylı
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Ücretsiz & Anında Erişim
          </span>
        </div>

        {/* FORM GÖVDESİ */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              SPK ve BDDK uyumlu resmi değerleme dosyanızı tarayıcınızda açmak ve PDF olarak indirmek için bilgilerinizi doğrulayın:
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Ad Soyad */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Adınız ve Soyadınız <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Hasan Yıldırım"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition"
              />
            </div>
          </div>

          {/* Telefon */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Telefon Numaranız <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition"
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Raporunuz doğrudan açılacak ve uzmanımız gerektiğinde WhatsApp üzerinden destek sağlayacaktır.
            </span>
          </div>

          {/* E-posta (Opsiyonel) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              E-posta Adresiniz <span className="text-slate-400 font-normal">(Opsiyonel)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none transition"
              />
            </div>
          </div>

          {/* Rol Seçimi */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Taşınmazla İlgilenme Amacınız
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "mulk_sahibi", label: "Mülk Sahibiyim" },
                { id: "yatirimci", label: "İhale / Yatırımcı" },
                { id: "emlak_danismani", label: "Emlak Danışmanı" },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setUserRole(role.id as any)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                    userRole === role.id
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 ring-1 ring-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gönder ve Raporu Aç */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#0B1E3B] hover:bg-blue-900 text-amber-400 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Doğrulanıyor..." : "Raporu Şimdi Aç & PDF İndir"}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bilgileriniz 6698 sayılı KVKK kapsamında güvendedir, üçüncü şahıslarla paylaşılmaz.</span>
          </div>
        </form>

      </div>
    </div>
  );
};
