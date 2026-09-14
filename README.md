# İhaleciBurada Arsa & Gayrimenkul Ekspertiz Platformu
> **Sub-domain:** `ekspertiz.ihaleciburada.com` (veya `arsa.ihaleciburada.com`)  
> **Ana Ekosistem:** [ihaleciburada.com](https://ihaleciburada.com)

Bu platform, arsa satanlar, emlak danışmanları, gayrimenkul geliştiricileri ve ihale katılımcıları için 3 dakikada 3194 Sayılı İmar Kanunu ve Planlı Alanlar İmar Yönetmeliği standartlarında **kapsamlı imar fizibilitesi, inşaat hacmi hesaplaması, kat karşılığı paylaşımı ve A-Sınıfı yatırım ekspertiz raporu** üreten kurumsal bir web uygulamasıdır.

---

## 1. Temel Özellikler

- **Ada / Parsel ve Kadastro Tanımlaması:** TKGM standartlarında ada, parsel, yüzölçümü, yol cephesi, köşe parsel ve topografya analizi.
- **Yasal İmar ve Yapılaşma Kapasitesi:**
  - KAKS (Emsal), TAKS (Taban Oturumu), Gabari (Hmax) ve Maksimum Kat Adedi.
  - Kamuya/Yola terk oranı simülasyonu ile net inşaat alanı tespiti.
  - Emsal dışı satılabilir ilave brüt alan ve tahmini bağımsız bölüm adedi hesabı.
- **Finansal Fizibilite ve Değerleme Bandı:**
  - Çevre ve Şehircilik Bakanlığı güncel yapı yaklaşık maliyet baremleri.
  - Adil Piyasa Değeri, İskontolu Hızlı Satış Değeri ve Müteahhit Tavan Teklif Bedeli.
  - Proje toplam satış hasılatı ve kat karşılığı paylaşım modeli (% arsa sahibi / % müteahhit).
- **Çift Kullanım Modu:**
  - **Standart Portföy Modu:** Emlakçıların portföylerindeki arsalar için kurumsal alıcı sunumu.
  - **Resmi İhale Modu:** İcra, Belediye, Milli Emlak ve Banka ihaleleri için dosya no takipli karlı teklif tavanı hesabı.
- **Çıktılar:**
  - **A4 Kurumsal PDF Raporu:** Baskıya hazır, çok sayfalı, İhaleciBurada mühürlü ve emlak danışmanı kartvizitli resmi rapor.
  - **WhatsApp Yatırım Brifi:** Müşteriye veya yatırımcıya tek tıkla gönderilebilecek formatlanmış özet mesaj.

---

## 2. Teknoloji Yığını ve Tasarım Sistemi

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Tasarım & UI:** Tailwind CSS v3.4 (İhaleciBurada Marka Renkleri: `#0F223D`, `#0B1E3B`, `#0052FF`, `#FF5938`)
- **Tipografi:** `Outfit` (Başlıklar) + `Inter` (Gövde metinleri)
- **İkonografi:** `lucide-react` (Temiz, modern, SVG ikon seti)

---

## 3. Sub-domain Kurulumu ve Dağıtım (Deployment)

### Yöntem A: Vercel Üzerinden Dağıtım (En Kolay & Önerilen)
1. Bu projeyi bir GitHub/GitLab reposuna push edin.
2. Vercel paneline girip projeyi import edin.
3. Domain ayarlarından `ekspertiz.ihaleciburada.com` CNAME kaydını `cname.vercel-dns.com` adresine yönlendirin.
4. SSL sertifikası ve küresel CDN otomatik olarak aktifleşir.

### Yöntem B: Kendi Linux Sunucunuzda (Nginx + PM2)
```bash
# Bağımlılıkları yükleyin
npm install

# Üretim derlemesi alın
npm run build

# PM2 ile arka planda başlatın
pm2 start npm --name "ihaleciburada-ekspertiz" -- start -- -p 3005
```

**Nginx VirtualHost Yapılandırması (`/etc/nginx/sites-available/ekspertiz.ihaleciburada.com`):**
```nginx
server {
    server_name ekspertiz.ihaleciburada.com;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 4. Geliştirici Komutları

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Üretim derlemesi (Build)
npm run build

# Üretim sunucusunu çalıştır
npm run start
```
