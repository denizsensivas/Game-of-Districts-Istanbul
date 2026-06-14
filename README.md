# Game of Districts: İstanbul

**Game of Districts: İstanbul**, arkadaşlarınızla birlikte eğlenerek oynayabileceğiniz, İstanbul ilçeleri üzerinde geçen gerçek zamanlı ve AI destekli bir web tabanlı masa oyunudur.

Oyuncular aynı odaya katılır, karakterlerini seçer, zar atarak İstanbul haritasında ilerler, ilçelerde masa kapatır, biletlerini yönetir ve rakiplerine karşı stratejik hamleler yapar. Oyun boyunca kahve falı, sabotaj, taksi, vapur ve kira sistemi gibi mekanikler sayesinde oyun dengesi sürekli değişebilir.

Oyundaki önemli anlar, Google Gemini destekli yapay zeka anlatıcısı tarafından kısa ve eğlenceli İstanbul temalı metinlerle anlatılır.

---

## Canlı Demo

Oyunu buradan oynayabilirsiniz:

**https://game-of-districts-istanbul.up.railway.app**

---

## Proje Özeti

Game of Districts: İstanbul, arkadaşlarınızla birlikte eğlenerek oynayabileceğiniz, İstanbul ilçeleri üzerinde geçen gerçek zamanlı bir web tabanlı masa oyunudur.

Oyuncular aynı odaya katılır, karakterlerini seçer, zar atarak İstanbul haritasında ilerler ve ilçelerde masa kapatarak bölge sahipliği kazanmaya çalışır. Oyun boyunca biletler, kira ödemeleri, sabotajlar, kahve falı etkileri, taksi ve vapur gibi İstanbul’a özgü mekanikler oyuncuların stratejisini sürekli değiştirir.

Amaç yalnızca haritada ilerlemek değil; doğru anda doğru hamleyi yaparak oyun sonuna kadar avantajı elde tutmaya çalışmaktır. Yapay zeka destekli anlatıcı ise oyun içindeki önemli olayları kısa, eğlenceli ve İstanbul temalı metinlerle aktararak oyuna daha canlı bir atmosfer kazandırır.

---

## Problem

Klasik masa oyunlarında oyun ilerledikçe kazanan çoğu zaman erken belli olur. Bir oyuncu belirli bir üstünlük kurduğunda diğer oyuncular için oyuna devam etmek daha az heyecanlı hale gelebilir.

Game of Districts bu problemi, oyun içi dinamikleri sürekli değişen bir yapı kurarak çözmeyi hedefler. Bilet ekonomisi, ilçe sahipliği, kira sistemi, sabotajlar, kahve falı etkileri ve ulaşım mekanikleri sayesinde oyunun gidişatı son ana kadar değişebilir.

Bu sayede oyuncular yalnızca ilk dakikalarda değil, oyunun sonuna kadar aktif kararlar alır. Her hamle yeni bir risk veya fırsat yaratır; bu da kazananın oyun bitene kadar kesinleşmemesini sağlar.

---

## Çözüm

Game of Districts, İstanbul haritasını oynanabilir bir oyun tahtasına dönüştürür.

Oyuncular oyun boyunca:

- Karakter seçer.
- Oda kurar veya mevcut bir odaya katılır.
- Zar atarak İstanbul ilçeleri arasında hareket eder.
- Kırmızı, mavi ve yeşil biletlerini yönetir.
- İlçelerde masa kapatarak bölge sahipliği elde eder.
- Rakipleri kendi bölgelerine geldiğinde kira kazanır.
- Kahve falı, sabotaj, taksi, vapur ve yol falı gibi özel aksiyonları kullanır.
- Oyun sonunda masa sahipliği, bilet değeri ve skor kurallarına göre kazanan belirlenir.

Yapay zeka oyunun sonucunu belirlemez. Oyun kuralları backend tarafında hesaplanır. Yapay zeka yalnızca oyun içi olayları daha eğlenceli ve temaya uygun şekilde anlatmak için kullanılır.

---

## Hedef Kullanıcılar

- Arkadaşlarıyla kısa ve eğlenceli web tabanlı oyun oynamak isteyen kullanıcılar
- İstanbul temalı oyunları seven oyuncular
- Strateji, şans ve sosyal rekabet içeren oyunlardan hoşlanan kullanıcılar
- Gerçek zamanlı multiplayer oyun deneyimi arayan kişiler

---

## Temel Özellikler

- Gerçek zamanlı çok oyunculu oyun akışı
- Oda kurma ve oda koduyla oyuna katılma
- Karakter seçimi
- Küçük ve büyük İstanbul haritası seçimi
- Zar atma ve gidilebilir ilçelerin hesaplanması
- İlçe sahipliği ve masa kapatma sistemi
- Kira, skor ve bilet ekonomisi
- Kırmızı, mavi ve yeşil bilet kaynakları
- Kahve falı, sabotaj, taksi, yol falı ve vapur mekanikleri
- AI destekli aktif olay anlatımı
- AI çalışmadığında fallback anlatım sistemi
- Test modu ile hızlı demo akışı

---

## Yapay Zeka Kullanımı

Projede Google Gemini entegrasyonu kullanılmıştır.

AI kullanım amacı:

- Oyun içinde gerçekleşen olayları kısa, eğlenceli ve İstanbul temalı metinlerle anlatmak
- Oyuna daha canlı ve mizahi bir atmosfer kazandırmak
- Oyuncuların yaptığı hamleleri daha anlaşılır ve eğlenceli hale getirmek

Önemli teknik karar:

AI, oyunun ana karar mekanizması değildir. Zar, hareket, kira, skor ve kazanma koşulları backend tarafında hesaplanır. Gemini servisi yavaşlarsa, yanıt vermezse veya API anahtarı tanımlı değilse oyun fallback metinlerle devam eder. Böylece oyun akışı AI servisine bağımlı kalmaz.

Kullanılan AI servis dosyası:

```txt
backend/src/services/llmNarrator.js
```

Gerekli environment değişkenleri:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=4500
```

---

## Proje Mimarisi

Proje frontend ve backend olarak iki ana parçadan oluşur.

```txt
Game-of-Districts-Istanbul/
│
├── frontend/          # React + Vite arayüz kodları
├── backend/           # Express + Socket.io backend kodları
├── prodocs/           # Bitirme projesi dokümantasyonları
├── characters/        # Karakter görselleri / ikon varlıkları
├── .env.example       # Ana environment değişkenleri örneği
├── docker-compose.yml # PostgreSQL için Docker Compose dosyası
└── README.md
```

---

## Frontend

Frontend, oyuncunun gördüğü arayüzden sorumludur.

Kullanılan teknolojiler:

- React
- Vite
- Tailwind CSS
- Zustand
- Socket.io Client
- Framer Motion
- Lucide React

Frontend tarafında bulunan temel görevler:

- Kullanıcı adı girişi
- Karakter seçimi
- Harita seçimi
- Oda oluşturma
- Oda koduyla oyuna katılma
- İstanbul haritası üzerinde hareket
- Oyuncu paneli
- Bilet, skor ve oyun durumu gösterimi
- AI olay anlatımlarının kullanıcıya gösterilmesi

---

## Backend

Backend, oyunun ana kurallarını ve gerçek zamanlı senkronizasyonunu yönetir.

Kullanılan teknolojiler:

- Node.js
- Express
- Socket.io
- Prisma
- PostgreSQL
- Google Gemini API

Backend tarafında bulunan temel görevler:

- Oda oluşturma ve oda yönetimi
- Oyuncuların gerçek zamanlı senkronizasyonu
- Zar sonucu üretimi
- Oyuncu hareketlerinin doğrulanması
- İlçe sahipliği ve masa kapatma kuralları
- Kira ve skor hesaplama
- Bilet ekonomisi
- AI anlatıcı servisinin çağrılması
- AI çalışmadığında fallback metinlerin kullanılması

Backend sağlık kontrol endpoint’i:

```txt
GET /api/health
```

---

## Veritabanı

Projede PostgreSQL ve Prisma kullanılmaktadır.

Veritabanı bağlantısı `.env` dosyasındaki `DATABASE_URL` üzerinden yapılır.

Örnek:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gameofdistricts?schema=public"
```

Prisma schema dosyası:

```txt
backend/prisma/schema.prisma
```

---

## Kurulum

Projeyi yerel ortamda çalıştırmak için Node.js, npm ve Docker kurulu olmalıdır.

### 1. Repoyu Klonlama

```bash
git clone https://github.com/denizsensivas/Game-of-Districts-Istanbul.git
cd Game-of-Districts-Istanbul
```

### 2. Environment Dosyalarını Oluşturma

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend `.env` örneği:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gameofdistricts?schema=public"
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=4500
```

Frontend `.env` örneği:

```env
VITE_API_URL="http://localhost:3001"
```

---

### 3. Veritabanını Başlatma

```bash
docker compose up -d postgres
```

---

### 4. Backend’i Çalıştırma

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend varsayılan olarak şu adreste çalışır:

```txt
http://localhost:3001
```


### 5. Frontend’i Çalıştırma

Yeni bir terminal açın:

```bash
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak şu adreste çalışır:

```txt
http://localhost:5173
```

---

## Oyun Nasıl Oynanır?

1. Kullanıcı adınızı girin.
2. Karakterinizi seçin.
3. Küçük veya büyük İstanbul haritasını seçin.
4. Oda oluşturun veya oda koduyla mevcut bir odaya katılın.
5. Sıranız geldiğinde zar atın.
6. Haritada ulaşılabilir ilçelerden birini seçin.
7. Gittiğiniz ilçede masa kapatabilir, biletlerinizi yönetebilir veya özel aksiyonları kullanabilirsiniz.
8. Rakip oyuncular sizin bölgenize gelirse kira öder.
9. Oyun boyunca kahve falı, sabotaj, taksi ve vapur gibi mekaniklerle avantaj sağlamaya çalışın.
10. Oyun sonunda en yüksek puana sahip oyuncu kazanır.

---

## Karakterler

### Öğrenci

Bilet avantajlarıyla oyuna başlar. Daha hareketli ve kaynak yönetimi açısından esnek bir karakterdir.

### Esnaf

İstanbul sokaklarını iyi bilen, bölge sahipliği ve mahalle temasıyla öne çıkan karakterdir.

### Beyaz Yaka

Bilet ekonomisi ve şehir içi hareketlerde avantaj sağlayan karakterdir.

### Turist

İstanbul’u gezmeye gelen, ulaşım ve keşif hissiyle oynanan karakterdir.

---

## Özel Mekanikler

### Masa Kapatma

Oyuncular gittikleri ilçelerde masa kapatarak o bölgeyi sahiplenebilir. Rakip oyuncular bu bölgeye geldiğinde kira öder.

### Bilet Ekonomisi

Oyunda kırmızı, mavi ve yeşil biletler bulunur. Bu biletler oyuncunun kaynak ekonomisini oluşturur.

### Kahve Falı

Oyuncuya özel olaylar ve avantaj/dezavantaj ihtimalleri sunan tematik aksiyonlardan biridir.

### Sabotaj

Rakip oyuncuların oyun planını bozmak için kullanılabilen stratejik aksiyondur.

### Taksi ve Vapur

İstanbul temasını güçlendiren ulaşım mekanikleridir. Oyuncuların harita üzerindeki hareketlerini çeşitlendirir.

### AI Olay Anlatımı

Önemli oyun olayları Gemini destekli anlatıcı tarafından kısa ve eğlenceli metinlere dönüştürülür.

---

## API ve Gerçek Zamanlı Yapı

Proje, klasik REST endpoint’leriyle birlikte Socket.io tabanlı gerçek zamanlı iletişim kullanır.


## Deploy Bilgisi

Canlı uygulama Railway üzerinde yayınlanmıştır.

```txt
https://game-of-districts-istanbul.up.railway.app
```

---

## Gelecek Geliştirmeler

- Kalıcı oyun geçmişi
- Daha detaylı oyuncu profili
- Daha fazla sabotaj ve kahve falı kartı
- Mobil ekranlar için iyileştirilmiş arayüz
- Oyun sonu istatistik ekranı
- Daha gelişmiş AI anlatım varyasyonları
- Harita ve karakter animasyonlarının artırılması

---

## Kullanılan Teknolojiler

### Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- Socket.io Client
- Framer Motion
- Lucide React

### Backend

- Node.js
- Express
- Socket.io
- Prisma
- PostgreSQL
- Google Gemini API

### Deploy

- Railway
- Environment Variables
- PostgreSQL production database bağlantısı

---

## Geliştirici

**Zeynep Deniz Sensivas**

