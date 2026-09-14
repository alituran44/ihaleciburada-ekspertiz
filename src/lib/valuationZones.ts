export interface ValuationZone {
  id: string;
  name: string;
  isCenter: boolean;
  color: string;
  status: string;
  unitPriceTL: number;
  tenderStartPriceTL: number;
  yearlyGrowthRate: number;
  coordinates: [number, number][];
  centroid: [number, number];
  description: string;
}

function offsetCoord(lat: number, lng: number, meters: number, bearingDeg: number): [number, number] {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (meters * Math.cos(rad)) / 111000;
  const dLng = (meters * Math.sin(rad)) / (111000 * Math.cos((lat * Math.PI) / 180));
  return [Number((lat + dLat).toFixed(6)), Number((lng + dLng).toFixed(6))];
}

interface NeighborhoodProfile {
  center: { name: string; mult: number; color: string; status: string; growth: number; desc: string };
  sectors: Array<{ name: string; mult: number; color: string; status: string; growth: number; desc: string }>;
}

const DISTRICT_PROFILES: Record<string, NeighborhoodProfile> = {
  "canakkale_merkez": {
    center: {
      name: "Cevat Paşa Mah.",
      mult: 1.0,
      color: "#F59E0B",
      status: "Değerlenen Bölge",
      growth: 46.8,
      desc: "Merkezi Konum • İnönü & Bahriye Üçok Caddeleri Aksı",
    },
    sectors: [
      {
        name: "Karacaören & Sanayi Mevkii",
        mult: 0.74,
        color: "#059669",
        status: "Yüksek Fırsat",
        growth: 52.4,
        desc: "Kuzeydoğu Gelişim ve Depolama Alanı",
      },
      {
        name: "İsmetpaşa Mah.",
        mult: 0.94,
        color: "#10B981",
        status: "Dengeli Piyasa",
        growth: 44.2,
        desc: "Piri Reis & Troya Caddeleri Yerleşik Bölge",
      },
      {
        name: "Namık Kemal Mah.",
        mult: 0.86,
        color: "#10B981",
        status: "Fırsat Bölgesi",
        growth: 41.5,
        desc: "Setboyu Caddesi & Kamu Hizmet Alanları",
      },
      {
        name: "Barbaros Mah.",
        mult: 1.18,
        color: "#F97316",
        status: "Yüksek Talep",
        growth: 49.3,
        desc: "Havalimanı & Yeni Üniversite Yerleşim Aksı",
      },
      {
        name: "Kemalpaşa Mah. & Kordon Sahil",
        mult: 1.38,
        color: "#E11D48",
        status: "Prestij / Sahil",
        growth: 54.0,
        desc: "Boğaz Manzaralı Tarihi Çarşı & Kordon Hattı",
      },
      {
        name: "Esenler Mah.",
        mult: 0.90,
        color: "#10B981",
        status: "Konut Gelişim",
        growth: 47.1,
        desc: "Ahmet Piriştina Caddesi Yeni Siteler Bölgesi",
      },
    ],
  },
  "canakkale_kepez": {
    center: {
      name: "Kepez Merkez Mah.",
      mult: 1.0,
      color: "#F59E0B",
      status: "Değerlenen Bölge",
      growth: 51.2,
      desc: "Kepez Belde Merkezi & Sahil Yakını",
    },
    sectors: [
      {
        name: "Cumhuriyet Mah.",
        mult: 0.88,
        color: "#10B981",
        status: "Konut Aksı",
        growth: 48.6,
        desc: "İzmir Yolu Üzeri Yeni Konut Siteleri",
      },
      {
        name: "Hamidiye & Liman Bölgesi",
        mult: 1.15,
        color: "#F97316",
        status: "Yüksek Talep",
        growth: 53.4,
        desc: "Kepez Liman Yakını Ticari Alanlar",
      },
      {
        name: "Boğazkent Mevkii",
        mult: 1.25,
        color: "#E11D48",
        status: "Sahil Prestij",
        growth: 56.1,
        desc: "Deniz Manzaralı Villa ve Lüks Konutlar",
      },
      {
        name: "Dardanos Sahil Aksı",
        mult: 1.42,
        color: "#E11D48",
        status: "Yazlık & Villa",
        growth: 58.7,
        desc: "Müstakil Villa ve Turistik Sahil Şeridi",
      },
      {
        name: "Çınarlı & Gelişim Alanı",
        mult: 0.78,
        color: "#059669",
        status: "Yüksek Fırsat",
        growth: 54.2,
        desc: "Gelişmekte Olan İmar Sahası",
      },
      {
        name: "Üniversite & Araştırma Hastanesi",
        mult: 1.08,
        color: "#F97316",
        status: "Kira Getirisi Yüksek",
        growth: 49.8,
        desc: "Tıp Fakültesi & Öğrenci Sirkülasyon Bölgesi",
      },
    ],
  },
  "istanbul_kadikoy": {
    center: {
      name: "Caferağa Mah. (Moda)",
      mult: 1.0,
      color: "#F59E0B",
      status: "Değerlenen Bölge",
      growth: 45.3,
      desc: "Tarihi Moda Sahili & Çarşı Çekirdeği",
    },
    sectors: [
      {
        name: "Fenerbahçe Mah.",
        mult: 1.35,
        color: "#E11D48",
        status: "Ultra Prestij",
        growth: 48.2,
        desc: "Marina & Sahil Parkı Hattı",
      },
      {
        name: "Caddebostan & Bağdat Cd.",
        mult: 1.28,
        color: "#E11D48",
        status: "Lüks Segment",
        growth: 46.9,
        desc: "Bağdat Caddesi Alışveriş & Sahil Bandı",
      },
      {
        name: "Göztepe & Çiftehavuzlar",
        mult: 1.15,
        color: "#F97316",
        status: "Yüksek Talep",
        growth: 44.5,
        desc: "Nezih Konut ve Park Çevresi",
      },
      {
        name: "Suadiye & Bostancı",
        mult: 1.10,
        color: "#F97316",
        status: "Sahil Aksı",
        growth: 43.8,
        desc: "Marmaray ve Sahil Entegrasyonu",
      },
      {
        name: "Acıbadem & Koşuyolu",
        mult: 0.95,
        color: "#10B981",
        status: "Dengeli Piyasa",
        growth: 42.0,
        desc: "Ulaşım Merkezlerine Yakın Yaşam Alanı",
      },
      {
        name: "Osmanağa & Rasimpaşa",
        mult: 0.88,
        color: "#10B981",
        status: "Fırsat / Ticari",
        growth: 47.6,
        desc: "Rıhtım & Vapur İskeleleri Aksı",
      },
    ],
  },
  "istanbul_besiktas": {
    center: {
      name: "Sinanpaşa Mah. (Çarşı)",
      mult: 1.0,
      color: "#F59E0B",
      status: "Değerlenen Bölge",
      growth: 48.0,
      desc: "Beşiktaş Merkez & İskele Çevresi",
    },
    sectors: [
      {
        name: "Levent & Nisbetiye",
        mult: 1.32,
        color: "#E11D48",
        status: "Finans & Prestij",
        growth: 51.5,
        desc: "Plazalar & Metro Hattı",
      },
      {
        name: "Etiler Mah.",
        mult: 1.38,
        color: "#E11D48",
        status: "Lüks Konut",
        growth: 50.2,
        desc: "A Plus Sosyo-Ekonomik Düzey",
      },
      {
        name: "Bebek Sahili",
        mult: 1.65,
        color: "#7C3AED",
        status: "Ultra Lüks Sahil",
        growth: 55.4,
        desc: "Boğaziçi Yalı ve Rezidans Hattı",
      },
      {
        name: "Ortaköy & Mecidiye",
        mult: 1.18,
        color: "#F97316",
        status: "Turistik & Sahil",
        growth: 46.3,
        desc: "Boğaz Köprüsü Ayağı & Tarihi Doku",
      },
      {
        name: "Abbasağa & Yıldız",
        mult: 0.92,
        color: "#10B981",
        status: "Dengeli Yerleşim",
        growth: 44.0,
        desc: "Park ve Üniversite Aksı",
      },
      {
        name: "Gayrettepe & Balmumcu",
        mult: 1.12,
        color: "#F97316",
        status: "Ulaşım Merkezi",
        growth: 46.8,
        desc: "Barbaros Bulvarı & Metrobüs Bağlantısı",
      },
    ],
  },
  "ankara_cankaya": {
    center: {
      name: "Kızılay & Kavaklıdere",
      mult: 1.0,
      color: "#F59E0B",
      status: "Değerlenen Bölge",
      growth: 43.5,
      desc: "Başkent Çekirdeği & Bakanlıklar Aksı",
    },
    sectors: [
      {
        name: "Gaziosmanpaşa (GOP)",
        mult: 1.25,
        color: "#E11D48",
        status: "Elçilikler & Prestij",
        growth: 46.2,
        desc: "Kuleler ve Lüks Rezidanslar",
      },
      {
        name: "Tunalı Hilmi & Ayrancı",
        mult: 1.12,
        color: "#F97316",
        status: "Yüksek Talep",
        growth: 44.8,
        desc: "Popüler Sosyal Yaşam Alanı",
      },
      {
        name: "Çayyolu & Alacaatlı",
        mult: 1.22,
        color: "#F97316",
        status: "Villa & Geniş Konut",
        growth: 49.0,
        desc: "Batı Aksı Müstakil Yaşam Siteleri",
      },
      {
        name: "Ümitköy & Mutlukent",
        mult: 1.18,
        color: "#F97316",
        status: "Yerleşik Nezih",
        growth: 47.3,
        desc: "Köklü Aile Siteleri ve Okullar",
      },
      {
        name: "Bahçelievler & Emek",
        mult: 0.95,
        color: "#10B981",
        status: "Dengeli Piyasa",
        growth: 42.1,
        desc: "7. Cadde & Metro Aksı",
      },
      {
        name: "Yıldız & Oran Mevkii",
        mult: 1.14,
        color: "#F97316",
        status: "Panoramik Konut",
        growth: 45.7,
        desc: "Vadi Manzaralı Yeni Projeler",
      },
    ],
  },
  "izmir_karsiyaka": {
    center: {
      name: "Bostanlı Mah.",
      mult: 1.0,
      color: "#F59E0B",
      status: "Değerlenen Bölge",
      growth: 47.9,
      desc: "Bostanlı Sahili & Sosyal Yaşam Çarşısı",
    },
    sectors: [
      {
        name: "Mavişehir Mah.",
        mult: 1.34,
        color: "#E11D48",
        status: "Lüks Rezidans",
        growth: 52.0,
        desc: "Alışveriş Merkezleri & Marina Projeleri",
      },
      {
        name: "Aksoy & Donanmacı",
        mult: 0.96,
        color: "#10B981",
        status: "Dengeli Konut",
        growth: 44.8,
        desc: "Karşıyaka Çarşıya Yürüme Mesafesi",
      },
      {
        name: "Alaybey & Bahçelievler",
        mult: 0.88,
        color: "#10B981",
        status: "Fırsat Bölgesi",
        growth: 43.1,
        desc: "İzban ve Tramvay Bağlantı Hattı",
      },
      {
        name: "Tersane & Sahil Bandı",
        mult: 1.10,
        color: "#F97316",
        status: "Körfez Manzarası",
        growth: 46.5,
        desc: "Yalı Caddesi & Vapur İskelesi",
      },
      {
        name: "Nergiz & Dedebaşı",
        mult: 0.82,
        color: "#059669",
        status: "Yüksek Fırsat",
        growth: 48.4,
        desc: "Kentsel Dönüşüm ve Gelişim Alanı",
      },
      {
        name: "Şemikler & Demirköprü",
        mult: 0.85,
        color: "#059669",
        status: "Ulaşım Aksı",
        growth: 45.0,
        desc: "İzban İstasyonu Yakını Konutlar",
      },
    ],
  },
};

function generateValuationZones(
  lat: number,
  lng: number,
  city: string,
  district: string,
  neighborhood?: string,
  baseUnitM2Price: number = 45000
): ValuationZone[] {
  const normKey = (city || '').toLowerCase().trim() + '_' + (district || '').toLowerCase().trim()
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o');

  let profile = DISTRICT_PROFILES[normKey];

  if (!profile) {
    const centerTitle = neighborhood && neighborhood.trim().length > 2
      ? (neighborhood.includes('Mah') || neighborhood.includes('Köy') ? neighborhood : neighborhood + ' Mah.')
      : (district || city) + ' Merkez';

    profile = {
      center: {
        name: centerTitle,
        mult: 1.0,
        color: "#F59E0B",
        status: "Değerlenen Bölge",
        growth: 46.5,
        desc: (district || city) + " Ana Değerleme Çekirdeği",
      },
      sectors: [
        {
          name: (district || city) + " Kuzeydoğu Gelişim Aksı",
          mult: 0.78,
          color: "#059669",
          status: "Yüksek Fırsat",
          growth: 52.1,
          desc: "Yeni İmar & Genişleme Sahası",
        },
        {
          name: (district || city) + " Doğu Ticaret Bölgesi",
          mult: 0.94,
          color: "#10B981",
          status: "Dengeli Piyasa",
          growth: 44.0,
          desc: "Ticari İşletmeler ve Yerleşik Konutlar",
        },
        {
          name: (district || city) + " Güney Yerleşim Alanı",
          mult: 0.86,
          color: "#10B981",
          status: "Fırsat Bölgesi",
          growth: 42.5,
          desc: "Kamu Hizmetleri & Sosyal Donatılar",
        },
        {
          name: (district || city) + " Güneybatı Yeni Siteler",
          mult: 1.15,
          color: "#F97316",
          status: "Yüksek Talep",
          growth: 49.8,
          desc: "Modern Konut Projeleri & Yeni Yaşam Alanı",
        },
        {
          name: (district || city) + " Batı Çevre Yolu & Sahil",
          mult: 1.32,
          color: "#E11D48",
          status: "Prestij Bölgesi",
          growth: 54.6,
          desc: "Ulaşım Kolaylığı & Hakim Konum",
        },
        {
          name: (district || city) + " Kuzey Konut Kuşağı",
          mult: 0.90,
          color: "#10B981",
          status: "Konut Aksı",
          growth: 45.2,
          desc: "Yerleşik Mahalle Kültürü & Okullar Çevresi",
        },
      ],
    };
  }

  const R_INNER = 500;
  const R_OUTER = 1420;

  const inVertices: [number, number][] = [];
  const outVertices: [number, number][] = [];

  for (let k = 0; k < 6; k++) {
    const angleDeg = k * 60 + 30;
    inVertices.push(offsetCoord(lat, lng, R_INNER, angleDeg));
    outVertices.push(offsetCoord(lat, lng, R_OUTER, angleDeg));
  }

  const zones: ValuationZone[] = [];

  const centerPrice = Math.round(baseUnitM2Price * profile.center.mult);
  zones.push({
    id: "zone-center",
    name: profile.center.name,
    isCenter: true,
    color: profile.center.color,
    status: profile.center.status,
    unitPriceTL: centerPrice,
    tenderStartPriceTL: Math.round(centerPrice * 0.5),
    yearlyGrowthRate: profile.center.growth,
    coordinates: inVertices,
    centroid: [lat, lng],
    description: profile.center.desc,
  });

  for (let k = 0; k < 6; k++) {
    const nextK = (k + 1) % 6;
    const secProfile = profile.sectors[k];
    const secPrice = Math.round(baseUnitM2Price * secProfile.mult);

    const sectorCoords: [number, number][] = [
      inVertices[k],
      outVertices[k],
      outVertices[nextK],
      inVertices[nextK],
    ];

    const midAngle = k * 60 + 60;
    const midRadius = (R_INNER + R_OUTER) / 2;
    const centroid = offsetCoord(lat, lng, midRadius, midAngle);

    zones.push({
      id: "zone-sector-" + k,
      name: secProfile.name,
      isCenter: false,
      color: secProfile.color,
      status: secProfile.status,
      unitPriceTL: secPrice,
      tenderStartPriceTL: Math.round(secPrice * 0.5),
      yearlyGrowthRate: secProfile.growth,
      coordinates: sectorCoords,
      centroid: centroid,
      description: secProfile.desc,
    });
  }

  return zones;
}

export { generateValuationZones };
