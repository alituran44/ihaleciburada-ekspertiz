/**
 * İhaleciBurada Emlak & Taşınmaz Kategori ve Filtre Taksonomisi
 * Kullanıcı yönergesi ve resmi emlak standartlarına göre hazırlanmıştır.
 */

export interface MainCategoryConfig {
  id: string;
  name: string;
  icon: string;
  badge: string;
  subCategories: string[];
}

export const REAL_ESTATE_CATEGORIES: MainCategoryConfig[] = [
  {
    id: "konut",
    name: "Konut / Ev",
    icon: "🏠",
    badge: "Konut & Daire",
    subCategories: [
      "Daire",
      "Müstakil Ev",
      "Villa",
      "İkiz Villa",
      "Yazlık",
      "Rezidans",
      "Çiftlik Evi",
      "Köy Evi",
      "Yalı",
      "Yalı Dairesi"
    ]
  },
  {
    id: "arsa",
    name: "Arsa / Arazi",
    icon: "📐",
    badge: "Arsa & Arazi",
    subCategories: [
      "Konut İmarlı Arsa",
      "Ticaret İmarlı Arsa",
      "Konut + Ticaret İmarlı Arsa",
      "Turizm İmarlı Arsa",
      "Sanayi İmarlı Arsa",
      "Tarla",
      "Bağ",
      "Bahçe",
      "Zeytinlik",
      "İmarsız Arazi"
    ]
  },
  {
    id: "ticari",
    name: "İşyeri / Ticari Gayrimenkul",
    icon: "🏢",
    badge: "Ticari Mülk",
    subCategories: [
      "Dükkân",
      "Mağaza",
      "Ofis",
      "Büro",
      "Depo",
      "Atölye",
      "Fabrika",
      "İmalathane",
      "Plaza",
      "İş Hanı",
      "Alışveriş Merkezi"
    ]
  },
  {
    id: "bina",
    name: "Bina",
    icon: "🏬",
    badge: "Bina Kompleks",
    subCategories: [
      "Apartman",
      "Ticari Bina",
      "Karma Kullanımlı Bina",
      "Müstakil Bina"
    ]
  },
  {
    id: "turizm",
    name: "Turizm Tesisi",
    icon: "🏖️",
    badge: "Turizm & Otel",
    subCategories: [
      "Otel",
      "Butik Otel",
      "Pansiyon",
      "Apart Otel",
      "Tatil Köyü",
      "Kamp Alanı",
      "Günübirlik Tesis"
    ]
  },
  {
    id: "ozel",
    name: "Özel Amaçlı Gayrimenkul",
    icon: "⚡",
    badge: "Özel Amaçlı",
    subCategories: [
      "Akaryakıt İstasyonu",
      "Otopark",
      "Özel Okul",
      "Öğrenci Yurdu",
      "Sağlık Tesisi",
      "Spor Tesisi",
      "Tarımsal İşletme"
    ]
  }
];

export const TRANSACTION_TYPES = [
  { id: "satilik", label: "Satılık" },
  { id: "kiralik", label: "Kiralık" },
  { id: "kat_karsiligi", label: "Kat Karşılığı" },
  { id: "devren_satilik", label: "Devren Satılık" },
  { id: "devren_kiralik", label: "Devren Kiralık" },
] as const;

export const DEED_STATUS_OPTIONS = [
  { id: "mustakil", label: "Müstakil" },
  { id: "hisseli", label: "Hisseli" },
  { id: "kat_mulkiyeti", label: "Kat Mülkiyeti" },
  { id: "kat_irtifaki", label: "Kat İrtifakı" },
] as const;

export const OFFER_METHODS = [
  { id: "sabit_fiyat", label: "Sabit Fiyat" },
  { id: "teklif_al", label: "Teklif Al" },
  { id: "acik_artirma", label: "Açık Artırma" },
] as const;

export const LISTING_OWNER_TYPES = [
  { id: "sahibinden", label: "Sahibinden" },
  { id: "emlak_ofisi", label: "Emlak Ofisi" },
  { id: "insaat_firmasi", label: "İnşaat Firması" },
  { id: "kurum", label: "Kurumdan" },
] as const;
