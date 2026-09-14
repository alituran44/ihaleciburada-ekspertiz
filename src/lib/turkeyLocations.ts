/**
 * Türkiye 81 İl ve 973 İlçe Resmi Mülki İdare Veritabanı
 * İçişleri Bakanlığı Nüfus ve Vatandaşlık İşleri (NVİ) ve TUİK mülki idare standartlarına göre hazırlanmıştır.
 */

export interface DistrictInfo {
  name: string;
  isCenter?: boolean;
}

export interface ProvinceInfo {
  plate: number;
  name: string;
  region: string;
  districts: string[];
}

export const TURKEY_PROVINCES_AND_DISTRICTS: Record<string, ProvinceInfo> = {
  "Adana": {
    plate: 1,
    name: "Adana",
    region: "Akdeniz",
    districts: ["Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"]
  },
  "Adıyaman": {
    plate: 2,
    name: "Adıyaman",
    region: "Güneydoğu Anadolu",
    districts: ["Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"]
  },
  "Afyonkarahisar": {
    plate: 3,
    name: "Afyonkarahisar",
    region: "Ege",
    districts: ["Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Merkez", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"]
  },
  "Ağrı": {
    plate: 4,
    name: "Ağrı",
    region: "Doğu Anadolu",
    districts: ["Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"]
  },
  "Amasya": {
    plate: 5,
    name: "Amasya",
    region: "Karadeniz",
    districts: ["Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"]
  },
  "Ankara": {
    plate: 6,
    name: "Ankara",
    region: "İç Anadolu",
    districts: ["Akyurt", "Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Etimesgut", "Evren", "Gölbaşı", "Güdül", "Haymana", "Kahramankazan", "Kalecik", "Keçiören", "Kızılcahamam", "Mamak", "Nallıhan", "Polatlı", "Pursaklar", "Sincan", "Şereflikoçhisar", "Yenimahalle"]
  },
  "Antalya": {
    plate: 7,
    name: "Antalya",
    region: "Akdeniz",
    districts: ["Akseki", "Aksu", "Alanya", "Demre", "Döşemealtı", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "İbradı", "Kaş", "Kemer", "Kepez", "Konyaaltı", "Korkuteli", "Kumluca", "Manavgat", "Muratpaşa", "Serik"]
  },
  "Artvin": {
    plate: 8,
    name: "Artvin",
    region: "Karadeniz",
    districts: ["Ardanuç", "Arhavi", "Borçka", "Hopa", "Kemalpaşa", "Merkez", "Murgul", "Şavşat", "Yusufeli"]
  },
  "Aydın": {
    plate: 9,
    name: "Aydın",
    region: "Ege",
    districts: ["Bozdoğan", "Buharkent", "Çine", "Didim", "Efeler", "Germencik", "İncirliova", "Karacasu", "Karpuzlu", "Koçarlı", "Köşk", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar"]
  },
  "Balıkesir": {
    plate: 10,
    name: "Balıkesir",
    region: "Marmara",
    districts: ["Altıeylül", "Ayvalık", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gömeç", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Marmara", "Savaştepe", "Sındırgı", "Susurluk"]
  },
  "Bilecik": {
    plate: 11,
    name: "Bilecik",
    region: "Marmara",
    districts: ["Bozüyük", "Gölpazarı", "İnhisar", "Merkez", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"]
  },
  "Bingöl": {
    plate: 12,
    name: "Bingöl",
    region: "Doğu Anadolu",
    districts: ["Adaklı", "Genç", "Karlıova", "Kiğı", "Merkez", "Solhan", "Yayladere", "Yedisu"]
  },
  "Bitlis": {
    plate: 13,
    name: "Bitlis",
    region: "Doğu Anadolu",
    districts: ["Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Merkez", "Mutki", "Tatvan"]
  },
  "Bolu": {
    plate: 14,
    name: "Bolu",
    region: "Karadeniz",
    districts: ["Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Merkez", "Mudurnu", "Seben", "Yeniçağa"]
  },
  "Burdur": {
    plate: 15,
    name: "Burdur",
    region: "Akdeniz",
    districts: ["Ağlasun", "Altınyayla", "Bucak", "Çavdır", "Çeltikçi", "Gölhisar", "Karamanlı", "Kemer", "Merkez", "Tefenni", "Yeşilova"]
  },
  "Bursa": {
    plate: 16,
    name: "Bursa",
    region: "Marmara",
    districts: ["Büyükorhan", "Gemlik", "Gürsu", "Harmancık", "İnegöl", "İznik", "Karacabey", "Keles", "Kestel", "Mudanya", "Mustafakemalpaşa", "Nilüfer", "Orhaneli", "Orhangazi", "Osmangazi", "Yenişehir", "Yıldırım"]
  },
  "Çanakkale": {
    plate: 17,
    name: "Çanakkale",
    region: "Marmara",
    districts: ["Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Merkez", "Yenice"]
  },
  "Çankırı": {
    plate: 18,
    name: "Çankırı",
    region: "İç Anadolu",
    districts: ["Atkaracalar", "Bayramören", "Çerkeş", "Eldivan", "Ilgaz", "Kızılırmak", "Korgun", "Kurşunlu", "Merkez", "Orta", "Şabanözü", "Yapraklı"]
  },
  "Çorum": {
    plate: 19,
    name: "Çorum",
    region: "Karadeniz",
    districts: ["Alaca", "Bayat", "Boğazkale", "Dodurga", "İskilip", "Kargı", "Laçin", "Mecitözü", "Merkez", "Oğuzlar", "Ortaköy", "Osmancık", "Sungurlu", "Uğurludağ"]
  },
  "Denizli": {
    plate: 20,
    name: "Denizli",
    region: "Ege",
    districts: ["Acıpayam", "Babadağ", "Baklan", "Bekilli", "Beyağaç", "Bozkurt", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Güney", "Honaz", "Kale", "Merkezefendi", "Pamukkale", "Sarayköy", "Serinhisar", "Tavas"]
  },
  "Diyarbakır": {
    plate: 21,
    name: "Diyarbakır",
    region: "Güneydoğu Anadolu",
    districts: ["Bağlar", "Bismil", "Çermik", "Çınar", "Çüngüş", "Dicle", "Eğil", "Ergani", "Hani", "Hazro", "Kayapınar", "Kocaköy", "Kulp", "Lice", "Silvan", "Sur", "Yenişehir"]
  },
  "Edirne": {
    plate: 22,
    name: "Edirne",
    region: "Marmara",
    districts: ["Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Merkez", "Süloğlu", "Uzunköprü"]
  },
  "Elazığ": {
    plate: 23,
    name: "Elazığ",
    region: "Doğu Anadolu",
    districts: ["Ağın", "Alacakaya", "Arıcak", "Baskil", "Karakoçan", "Keban", "Kovancılar", "Maden", "Merkez", "Palu", "Sivrice"]
  },
  "Erzincan": {
    plate: 24,
    name: "Erzincan",
    region: "Doğu Anadolu",
    districts: ["Çayırlı", "İliç", "Kemah", "Kemaliye", "Merkez", "Otlukbeli", "Refahiye", "Tercan", "Üzümlü"]
  },
  "Erzurum": {
    plate: 25,
    name: "Erzurum",
    region: "Doğu Anadolu",
    districts: ["Aşkale", "Aziziye", "Çat", "Hınıs", "Horasan", "İspir", "Karaçoban", "Karayazı", "Köprüköy", "Narman", "Oltu", "Olur", "Palandöken", "Pasinler", "Pazaryolu", "Şenkaya", "Tekman", "Tortum", "Uzundere", "Yakutiye"]
  },
  "Eskişehir": {
    plate: 26,
    name: "Eskişehir",
    region: "İç Anadolu",
    districts: ["Alpu", "Beylikova", "Çifteler", "Günyüzü", "Han", "İnönü", "Mahmudiye", "Mihalgazi", "Mihalıççık", "Odunpazarı", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Tepebaşı"]
  },
  "Gaziantep": {
    plate: 27,
    name: "Gaziantep",
    region: "Güneydoğu Anadolu",
    districts: ["Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"]
  },
  "Giresun": {
    plate: 28,
    name: "Giresun",
    region: "Karadeniz",
    districts: ["Alucra", "Bulancak", "Çamoluk", "Çanakçı", "Dereli", "Doğankent", "Espiye", "Eynesil", "Görele", "Güce", "Keşap", "Merkez", "Piraziz", "Şebinkarahisar", "Tirebolu", "Yağlıdere"]
  },
  "Gümüşhane": {
    plate: 29,
    name: "Gümüşhane",
    region: "Karadeniz",
    districts: ["Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"]
  },
  "Hakkari": {
    plate: 30,
    name: "Hakkari",
    region: "Doğu Anadolu",
    districts: ["Çukurca", "Derecik", "Merkez", "Şemdinli", "Yüksekova"]
  },
  "Hatay": {
    plate: 31,
    name: "Hatay",
    region: "Akdeniz",
    districts: ["Altınözü", "Antakya", "Arsuz", "Belen", "Defne", "Dörtyol", "Erzin", "Hassa", "İskenderun", "Kırıkhan", "Kumlu", "Payas", "Reyhanlı", "Samandağ", "Yayladağı"]
  },
  "Isparta": {
    plate: 32,
    name: "Isparta",
    region: "Akdeniz",
    districts: ["Aksu", "Atabey", "Eğirdir", "Gelendost", "Gönen", "Keçiborlu", "Merkez", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Yenişarbademli"]
  },
  "Mersin": {
    plate: 33,
    name: "Mersin",
    region: "Akdeniz",
    districts: ["Akdeniz", "Anamur", "Aydıncık", "Bozyazı", "Çamlıyayla", "Erdemli", "Gülnar", "Mezitli", "Mut", "Silifke", "Tarsus", "Toroslar", "Yenişehir"]
  },
  "İstanbul": {
    plate: 34,
    name: "İstanbul",
    region: "Marmara",
    districts: ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"]
  },
  "İzmir": {
    plate: 35,
    name: "İzmir",
    region: "Ege",
    districts: ["Aliağa", "Balçova", "Bayındır", "Bayraklı", "Bergama", "Beydağ", "Bornova", "Buca", "Çeşme", "Çiğli", "Dikili", "Foça", "Gaziemir", "Güzelbahçe", "Karabağlar", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Konak", "Menderes", "Menemen", "Narlıdere", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla"]
  },
  "Kars": {
    plate: 36,
    name: "Kars",
    region: "Doğu Anadolu",
    districts: ["Akyaka", "Arpaçay", "Digor", "Kağızman", "Merkez", "Sarıkamış", "Selim", "Susuz"]
  },
  "Kastamonu": {
    plate: 37,
    name: "Kastamonu",
    region: "Karadeniz",
    districts: ["Abana", "Ağlı", "Araç", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "Doğanyurt", "Hanönü", "İhsangazi", "İnebolu", "Küre", "Merkez", "Pınarbaşı", "Seydiler", "Şenpazar", "Taşköprü", "Tosya"]
  },
  "Kayseri": {
    plate: 38,
    name: "Kayseri",
    region: "İç Anadolu",
    districts: ["Akkışla", "Bünyan", "Develi", "Felahiye", "Hacılar", "İncesu", "Kocasinan", "Melikgazi", "Özvatan", "Pınarbaşı", "Sarıoğlan", "Sarız", "Talas", "Tomarza", "Yahyalı", "Yeşilhisar"]
  },
  "Kırklareli": {
    plate: 39,
    name: "Kırklareli",
    region: "Marmara",
    districts: ["Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Merkez", "Pehlivanköy", "Pınarhisar", "Vize"]
  },
  "Kırşehir": {
    plate: 40,
    name: "Kırşehir",
    region: "İç Anadolu",
    districts: ["Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Merkez", "Mucur"]
  },
  "Kocaeli": {
    plate: 41,
    name: "Kocaeli",
    region: "Marmara",
    districts: ["Başiskele", "Çayırova", "Darıca", "Derince", "Dilovası", "Gebze", "Gölcük", "İzmit", "Kandıra", "Karamürsel", "Kartepe", "Körfez"]
  },
  "Konya": {
    plate: 42,
    name: "Konya",
    region: "İç Anadolu",
    districts: ["Ahırlı", "Akören", "Akşehir", "Altınekin", "Beyşehir", "Bozkır", "Cihanbeyli", "Çeltik", "Çumra", "Derbent", "Derebucak", "Doğanhisar", "Emirgazi", "Ereğli", "Güneysınır", "Hadim", "Halkapınar", "Hüyük", "Ilgın", "Kadınhanı", "Karapınar", "Karatay", "Kulu", "Meram", "Sarayönü", "Selçuklu", "Seydişehir", "Taşkent", "Tuzlukçu", "Yalıhüyük", "Yunak"]
  },
  "Kütahya": {
    plate: 43,
    name: "Kütahya",
    region: "Ege",
    districts: ["Altıntaş", "Aslanapa", "Çavdarhisar", "Domaniç", "Dumlupınar", "Emet", "Gediz", "Hisarcık", "Merkez", "Pazarlar", "Simav", "Şaphane", "Tavşanlı"]
  },
  "Malatya": {
    plate: 44,
    name: "Malatya",
    region: "Doğu Anadolu",
    districts: ["Akçadağ", "Arapgir", "Arguvan", "Battalgazi", "Darende", "Doğanşehir", "Doğanyol", "Hekimhan", "Kale", "Kuluncak", "Pütürge", "Yazıhan", "Yeşilyurt"]
  },
  "Manisa": {
    plate: 45,
    name: "Manisa",
    region: "Ege",
    districts: ["Ahmetli", "Akhisar", "Alaşehir", "Demirci", "Gölmarmara", "Gördes", "Kırkağaç", "Köprübaşı", "Kula", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma", "Şehzadeler", "Turgutlu", "Yunusemre"]
  },
  "Kahramanmaraş": {
    plate: 46,
    name: "Kahramanmaraş",
    region: "Akdeniz",
    districts: ["Afşin", "Andırın", "Çağlayancerit", "Dulkadiroğlu", "Ekinözü", "Elbistan", "Göksun", "Nurhak", "Onikişubat", "Pazarcık", "Türkoğlu"]
  },
  "Mardin": {
    plate: 47,
    name: "Mardin",
    region: "Güneydoğu Anadolu",
    districts: ["Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"]
  },
  "Muğla": {
    plate: 48,
    name: "Muğla",
    region: "Ege",
    districts: ["Bodrum", "Dalaman", "Datça", "Fethiye", "Kavaklıdere", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ortaca", "Seydikemer", "Ula", "Yatağan"]
  },
  "Muş": {
    plate: 49,
    name: "Muş",
    region: "Doğu Anadolu",
    districts: ["Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"]
  },
  "Nevşehir": {
    plate: 50,
    name: "Nevşehir",
    region: "İç Anadolu",
    districts: ["Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp"]
  },
  "Niğde": {
    plate: 51,
    name: "Niğde",
    region: "İç Anadolu",
    districts: ["Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"]
  },
  "Ordu": {
    plate: 52,
    name: "Ordu",
    region: "Karadeniz",
    districts: ["Akkuş", "Altınordu", "Aybastı", "Çamaş", "Çatalpınar", "Çaybaşı", "Fatsa", "Gölköy", "Gülyalı", "Gürgentepe", "İkizce", "Kabadüz", "Kabataş", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye"]
  },
  "Rize": {
    plate: 53,
    name: "Rize",
    region: "Karadeniz",
    districts: ["Ardeşen", "Çamlıhemşin", "Çayeli", "Derepazarı", "Fındıklı", "Güneysu", "Hemşin", "İkizdere", "İyidere", "Kalkandere", "Merkez", "Pazar"]
  },
  "Sakarya": {
    plate: 54,
    name: "Sakarya",
    region: "Marmara",
    districts: ["Adapazarı", "Akyazı", "Arifiye", "Erenler", "Ferizli", "Geyve", "Hendek", "Karapürçek", "Karasu", "Kaynarca", "Kocaali", "Pamukova", "Sapanca", "Serdivan", "Söğütlü", "Taraklı"]
  },
  "Samsun": {
    plate: 55,
    name: "Samsun",
    region: "Karadeniz",
    districts: ["19 Mayıs", "Alaçam", "Asarcık", "Atakum", "Ayvacık", "Bafra", "Canik", "Çarşamba", "Havza", "İlkadım", "Kavak", "Ladik", "Salıpazarı", "Tekkeköy", "Terme", "Vezirköprü", "Yakakent"]
  },
  "Siirt": {
    plate: 56,
    name: "Siirt",
    region: "Güneydoğu Anadolu",
    districts: ["Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan", "Tillo"]
  },
  "Sinop": {
    plate: 57,
    name: "Sinop",
    region: "Karadeniz",
    districts: ["Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Merkez", "Saraydüzü", "Türkeli"]
  },
  "Sivas": {
    plate: 58,
    name: "Sivas",
    region: "İç Anadolu",
    districts: ["Akıncılar", "Altınyayla", "Divriği", "Doğanşar", "Gemerek", "Gölova", "Gürün", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Merkez", "Suşehri", "Şarkışla", "Ulaş", "Yıldızeli", "Zara"]
  },
  "Tekirdağ": {
    plate: 59,
    name: "Tekirdağ",
    region: "Marmara",
    districts: ["Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Kapaklı", "Malkara", "Marmaraereğlisi", "Muratlı", "Saray", "Süleymanpaşa", "Şarköy"]
  },
  "Tokat": {
    plate: 60,
    name: "Tokat",
    region: "Karadeniz",
    districts: ["Almus", "Artova", "Başçiftlik", "Erbaa", "Merkez", "Niksar", "Pazar", "Reşadiye", "Sulusaray", "Turhal", "Yeşilyurt", "Zile"]
  },
  "Trabzon": {
    plate: 61,
    name: "Trabzon",
    region: "Karadeniz",
    districts: ["Akçaabat", "Araklı", "Arsin", "Beşikdüzü", "Çarşıbaşı", "Çaykara", "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı", "Maçka", "Of", "Ortahisar", "Sürmene", "Şalpazarı", "Tonya", "Vakfıkebir", "Yomra"]
  },
  "Tunceli": {
    plate: 62,
    name: "Tunceli",
    region: "Doğu Anadolu",
    districts: ["Çemişgezek", "Hozat", "Mazgirt", "Merkez", "Nazımiye", "Ovacık", "Pertek", "Pülümür"]
  },
  "Şanlıurfa": {
    plate: 63,
    name: "Şanlıurfa",
    region: "Güneydoğu Anadolu",
    districts: ["Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Harran", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir"]
  },
  "Uşak": {
    plate: 64,
    name: "Uşak",
    region: "Ege",
    districts: ["Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"]
  },
  "Van": {
    plate: 65,
    name: "Van",
    region: "Doğu Anadolu",
    districts: ["Bahçesaray", "Başkale", "Çaldıran", "Çatak", "Edremit", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Saray", "Tuşba"]
  },
  "Yozgat": {
    plate: 66,
    name: "Yozgat",
    region: "İç Anadolu",
    districts: ["Akdağmadeni", "Aydıncık", "Boğazlıyan", "Çandır", "Çayıralan", "Çekerek", "Kadışehri", "Saraykent", "Sarıkaya", "Sorgun", "Şefaatli", "Yenifakılı", "Yerköy"]
  },
  "Zonguldak": {
    plate: 67,
    name: "Zonguldak",
    region: "Karadeniz",
    districts: ["Alaplı", "Çaycuma", "Devrek", "Ereğli", "Gökçebey", "Kilimli", "Kozlu", "Merkez"]
  },
  "Aksaray": {
    plate: 68,
    name: "Aksaray",
    region: "İç Anadolu",
    districts: ["Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Merkez", "Ortaköy", "Sarıyahşi", "Sultanhanı"]
  },
  "Bayburt": {
    plate: 69,
    name: "Bayburt",
    region: "Karadeniz",
    districts: ["Aydıntepe", "Demirözü", "Merkez"]
  },
  "Karaman": {
    plate: 70,
    name: "Karaman",
    region: "İç Anadolu",
    districts: ["Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Merkez", "Sarıveliler"]
  },
  "Kırıkkale": {
    plate: 71,
    name: "Kırıkkale",
    region: "İç Anadolu",
    districts: ["Bahşili", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Merkez", "Sulakyurt", "Yahşihan"]
  },
  "Batman": {
    plate: 72,
    name: "Batman",
    region: "Güneydoğu Anadolu",
    districts: ["Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"]
  },
  "Şırnak": {
    plate: 73,
    name: "Şırnak",
    region: "Güneydoğu Anadolu",
    districts: ["Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Merkez", "Silopi", "Uludere"]
  },
  "Bartın": {
    plate: 74,
    name: "Bartın",
    region: "Karadeniz",
    districts: ["Amasra", "Kurucaşile", "Merkez", "Ulus"]
  },
  "Ardahan": {
    plate: 75,
    name: "Ardahan",
    region: "Doğu Anadolu",
    districts: ["Çıldır", "Damal", "Göle", "Hanak", "Merkez", "Posof"]
  },
  "Iğdır": {
    plate: 76,
    name: "Iğdır",
    region: "Doğu Anadolu",
    districts: ["Aralık", "Karakoyunlu", "Merkez", "Tuzluca"]
  },
  "Yalova": {
    plate: 77,
    name: "Yalova",
    region: "Marmara",
    districts: ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"]
  },
  "Karabük": {
    plate: 78,
    name: "Karabük",
    region: "Karadeniz",
    districts: ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"]
  },
  "Kilis": {
    plate: 79,
    name: "Kilis",
    region: "Güneydoğu Anadolu",
    districts: ["Elbeyli", "Merkez", "Musabeyli", "Polateli"]
  },
  "Osmaniye": {
    plate: 80,
    name: "Osmaniye",
    region: "Akdeniz",
    districts: ["Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Merkez", "Sumbas", "Toprakkale"]
  },
  "Düzce": {
    plate: 81,
    name: "Düzce",
    region: "Karadeniz",
    districts: ["Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Merkez", "Yığılca"]
  },
};

/**
 * 81 İl Listesi (Alfabetik)
 */
export const ALL_PROVINCES: string[] = Object.keys(TURKEY_PROVINCES_AND_DISTRICTS).sort((a, b) => 
  a.localeCompare(b, "tr")
);

/**
 * Bir İle Ait Tüm Resmi İlçeleri Döner
 */
export function getDistrictsByProvince(provinceName: string): string[] {
  if (!provinceName) return [];
  const normalized = provinceName.trim();
  
  // Exact match
  const foundKey = Object.keys(TURKEY_PROVINCES_AND_DISTRICTS).find(
    (k) => k.localeCompare(normalized, "tr", { sensitivity: "accent" }) === 0
  );

  if (foundKey) {
    return TURKEY_PROVINCES_AND_DISTRICTS[foundKey].districts;
  }

  // Case-insensitive fallback
  const lower = normalized.toLowerCase();
  for (const [k, v] of Object.entries(TURKEY_PROVINCES_AND_DISTRICTS)) {
    if (k.toLowerCase() === lower) {
      return v.districts;
    }
  }

  return [];
}

/**
 * Türkçe Karakter Normalizasyonu (Arama toleransı için)
 */
export function normalizeTr(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .trim();
}

/**
 * Hızlı İl / İlçe Arama Fonksiyonu (Türkçe ve ASCII toleranslı)
 */
export function searchDistrictsAndProvinces(query: string, limit: number = 8) {
  if (!query || query.trim().length < 2) return [];
  const qNorm = normalizeTr(query);

  const results: Array<{
    type: "il" | "ilce";
    province: string;
    district?: string;
    label: string;
  }> = [];

  for (const [provName, provData] of Object.entries(TURKEY_PROVINCES_AND_DISTRICTS)) {
    const provNorm = normalizeTr(provName);
    
    // İl eşleşmesi
    if (provNorm.includes(qNorm) || qNorm.includes(provNorm)) {
      results.push({
        type: "il",
        province: provName,
        label: `${provName} (${provData.region})`,
      });
    }

    // İlçe eşleşmesi
    for (const dist of provData.districts) {
      const distNorm = normalizeTr(dist);
      const combined = `${distNorm} ${provNorm}`;
      if (distNorm.includes(qNorm) || combined.includes(qNorm)) {
        results.push({
          type: "ilce",
          province: provName,
          district: dist,
          label: `${dist}, ${provName}`,
        });
        if (results.length >= limit) return results;
      }
    }
  }

  return results.slice(0, limit);
}

