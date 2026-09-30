export interface TaxonomyCategory {
  id: string;
  label: string;
  iconName: string;
  serviceCategory: "konut" | "arsa" | "arazi" | "ticari";
  subCategories: Array<{
    id: string;
    label: string;
    tapuNitelikDefault?: string;
  }>;
}

export const REAL_ESTATE_TAXONOMY: Record<string, TaxonomyCategory> = {
  konut: {
    id: "konut",
    label: "Konut / Ev",
    iconName: "Home",
    serviceCategory: "konut",
    subCategories: [
      { id: "daire", label: "Daire", tapuNitelikDefault: "Mesken" },
      { id: "mustakil_ev", label: "Müstakil Ev", tapuNitelikDefault: "Müstakil Ev" },
      { id: "villa", label: "Villa", tapuNitelikDefault: "Villa" },
      { id: "ikiz_villa", label: "İkiz Villa", tapuNitelikDefault: "İkiz Villa" },
      { id: "yazlik", label: "Yazlık", tapuNitelikDefault: "Yazlık Konut" },
      { id: "rezidans", label: "Rezidans", tapuNitelikDefault: "Rezidans Dairesi" },
      { id: "ciftlik_evi", label: "Çiftlik Evi", tapuNitelikDefault: "Çiftlik Evi ve Müştemilatı" },
      { id: "koy_evi", label: "Köy Evi", tapuNitelikDefault: "Köy Evi" },
      { id: "yali", label: "Yalı", tapuNitelikDefault: "Yalı" },
      { id: "yali_dairesi", label: "Yalı Dairesi", tapuNitelikDefault: "Yalı Dairesi" },
    ],
  },
  arsa: {
    id: "arsa",
    label: "Arsa / Arazi",
    iconName: "Trees",
    serviceCategory: "arsa",
    subCategories: [
      { id: "konut_imarli", label: "Konut İmarlı Arsa", tapuNitelikDefault: "Arsa" },
      { id: "ticaret_imarli", label: "Ticaret İmarlı Arsa", tapuNitelikDefault: "Arsa" },
      { id: "konut_ticaret_imarli", label: "Konut + Ticaret İmarlı Arsa", tapuNitelikDefault: "Arsa" },
      { id: "turizm_imarli", label: "Turizm İmarlı Arsa", tapuNitelikDefault: "Arsa" },
      { id: "sanayi_imarli", label: "Sanayi İmarlı Arsa", tapuNitelikDefault: "Arsa" },
      { id: "tarla", label: "Tarla", tapuNitelikDefault: "Tarla" },
      { id: "bag", label: "Bağ", tapuNitelikDefault: "Bağ" },
      { id: "bahce", label: "Bahçe", tapuNitelikDefault: "Bahçe" },
      { id: "zeytinlik", label: "Zeytinlik", tapuNitelikDefault: "Zeytinlik" },
      { id: "imarsiz_arazi", label: "İmarsız Arazi", tapuNitelikDefault: "Ham Arazi" },
    ],
  },
  ticari: {
    id: "ticari",
    label: "İşyeri / Ticari",
    iconName: "Store",
    serviceCategory: "ticari",
    subCategories: [
      { id: "dukkan", label: "Dükkân", tapuNitelikDefault: "Dükkân" },
      { id: "magaza", label: "Mağaza", tapuNitelikDefault: "Mağaza" },
      { id: "ofis_buro", label: "Ofis / Büro", tapuNitelikDefault: "Büro" },
      { id: "depo", label: "Depo", tapuNitelikDefault: "Depo" },
      { id: "atolye", label: "Atölye", tapuNitelikDefault: "Atölye" },
      { id: "fabrika", label: "Fabrika", tapuNitelikDefault: "Fabrika Binası" },
      { id: "imalathane", label: "İmalathane", tapuNitelikDefault: "İmalathane" },
      { id: "plaza", label: "Plaza", tapuNitelikDefault: "İş Merkezi" },
      { id: "is_hani", label: "İş Hanı", tapuNitelikDefault: "İş Hanı" },
      { id: "avm", label: "Alışveriş Merkezi", tapuNitelikDefault: "AVM Bağımsız Bölüm" },
    ],
  },
  bina: {
    id: "bina",
    label: "Bina",
    iconName: "Building2",
    serviceCategory: "konut",
    subCategories: [
      { id: "apartman", label: "Apartman", tapuNitelikDefault: "Apartman Komple" },
      { id: "ticari_bina", label: "Ticari Bina", tapuNitelikDefault: "Ticari Komple Bina" },
      { id: "karma_bina", label: "Karma Kullanımlı Bina", tapuNitelikDefault: "Konut + Ticari Bina" },
      { id: "mustakil_bina", label: "Müstakil Bina", tapuNitelikDefault: "Müstakil Bina" },
    ],
  },
  turizm: {
    id: "turizm",
    label: "Turizm Tesisi",
    iconName: "Building",
    serviceCategory: "ticari",
    subCategories: [
      { id: "otel", label: "Otel", tapuNitelikDefault: "Otel" },
      { id: "butik_otel", label: "Butik Otel", tapuNitelikDefault: "Butik Otel" },
      { id: "pansiyon", label: "Pansiyon", tapuNitelikDefault: "Pansiyon" },
      { id: "apart_otel", label: "Apart Otel", tapuNitelikDefault: "Apart Otel" },
      { id: "tatil_koyu", label: "Tatil Köyü", tapuNitelikDefault: "Tatil Köyü Tesisi" },
      { id: "kamp_alani", label: "Kamp Alanı", tapuNitelikDefault: "Kamping Alanı" },
      { id: "gunubirlik_tesis", label: "Günübirlik Tesis", tapuNitelikDefault: "Günübirlik Turizm Tesisi" },
    ],
  },
  ozel_amacli: {
    id: "ozel_amacli",
    label: "Özel Amaçlı",
    iconName: "ShieldCheck",
    serviceCategory: "ticari",
    subCategories: [
      { id: "akaryakit_istasyonu", label: "Akaryakıt İstasyonu", tapuNitelikDefault: "Akaryakıt İstasyonu" },
      { id: "otopark", label: "Otopark", tapuNitelikDefault: "Otopark Alanı" },
      { id: "ozel_okul", label: "Özel Okul", tapuNitelikDefault: "Özel Eğitim Tesisi" },
      { id: "ogrenci_yurdu", label: "Öğrenci Yurdu", tapuNitelikDefault: "Yurt Binası" },
      { id: "saglik_tesisi", label: "Sağlık Tesisi", tapuNitelikDefault: "Özel Sağlık Tesisi" },
      { id: "spor_tesisi", label: "Spor Tesisi", tapuNitelikDefault: "Spor Kompleksi" },
      { id: "tarimsal_isletme", label: "Tarımsal İşletme", tapuNitelikDefault: "Tarımsal Tesis / Çiftlik" },
    ],
  },
};

// 1. İşlem Türleri ("Satılık ve kiralık seçeneklerini alt kategori yerine 'İşlem türü' olarak sunmanı öneririm")
export const TRANSACTION_TYPES = [
  { id: "satilik", label: "Satılık", color: "emerald" },
  { id: "kiralik", label: "Kiralık", color: "blue" },
  { id: "kat_karsiligi", label: "Kat Karşılığı", color: "purple" },
  { id: "devren_satilik", label: "Devren Satılık", color: "amber" },
  { id: "devren_kiralik", label: "Devren Kiralık", color: "sky" },
];

// 2. Teklif Yöntemi
export const TENDER_METHODS = [
  { id: "sabit_fiyat", label: "Sabit Fiyat" },
  { id: "teklif_al", label: "Teklif Al" },
  { id: "acik_artirma", label: "Açık Artırma / İhale" },
];

// 3. İlan Veren
export const SELLER_TYPES = [
  { id: "sahibinden", label: "Sahibinden" },
  { id: "emlak_ofisi", label: "Emlak Ofisinden" },
  { id: "insaat_firmasi", label: "İnşaat Firmasından" },
  { id: "kurum", label: "Kurumdan (Belediye / İcra / Banka)" },
];

// 4. Tapu & Hisse Durumu (Önemli kural: "Hisseli durumunu tapu filtresinde göster")
export const DEED_STATUS_OPTIONS = [
  { id: "mustakil", label: "Müstakil Parsel (Tek Malik)", badge: "Müstakil" },
  { id: "hisseli", label: "Hisseli Tapu (Paylı Mülkiyet)", badge: "Hisseli" },
  { id: "kat_mulkiyeti", label: "Kat Mülkiyeti", badge: "Kat Mülkiyeti" },
  { id: "kat_irtifaki", label: "Kat İrtifakı", badge: "Kat İrtifakı" },
];

// 5. Özellik & Filtre Etiketleri (Önemli kural: "'denize yakın', 'yatırımlık' gibi ifadeleri özellik alanında göster")
export const PROPERTY_TAGS = [
  { id: "denize_yakin", label: "Denize Yakın" },
  { id: "yatirimlik", label: "Yatırımlık / Yüksek Prim" },
  { id: "cadde_uzeri", label: "Cadde / Ana Arter Üzeri" },
  { id: "krediye_uygun", label: "Krediye Uygun" },
  { id: "takasa_uygun", label: "Takasa Uygun" },
];
