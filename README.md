# Game of Districts

Game of Districts, Istanbul ilcelerini oyun tahtasina donusturen, cok oyunculu ve server-authoritative bir web masa oyunudur. Oyuncular zar atar, ilceler arasinda hareket eder, bilet ekonomisini yonetir, masa kapatir, rakiplerin masalarini bozabilir ve Gemini destekli Istanbul temali olay anlatimlariyla oyunun akisini takip eder.

## Durum

- Calisan web uygulamasi: React/Vite frontend ve Express/Socket.io backend.
- Gercek zamanli oyun: oda kurma, odaya katilma, test odasi, zar, hareket, bilet ekonomisi ve tur zamanlayicisi backend tarafindan yonetilir.
- AI entegrasyonu: Gemini API backend uzerinden kullanilir; oyun mekanigini degistirmez, aktif olaylari kisa ve tematik metinlerle anlatir.
- Veritabani: PostgreSQL + Prisma.
- Teslim dokumanlari: `prodocs/` klasorunde guncel proje dokumanlari bulunur.

## Temel Ozellikler

- Istanbul temali kucuk ve buyuk SVG haritalar.
- Tıklanabilir ilceler, komsuluk kurallari ve vapur gecisleri.
- Ogrenci, Esnaf, Turist ve Beyaz Yaka karakterleri.
- Karakter secim galerisi ve karaktere gore baslangic bilet bonuslari.
- Kirmizi, mavi ve yesil bilet ekonomisi.
- Masa kapatma, kira odeme, kur degisimi, sabotaj, taksi/yol fali ve vapur maliyeti.
- 12 turluk oyun, 30 saniyelik tur zamanlayicisi ve skor tablosu.
- Yerel test icin kucuk/buyuk harita test odalari.

## AI Kullanimi

AI entegrasyonu backend'de `backend/src/services/llmNarrator.js` icinde tutulur. Gemini, kahve fali, sabotaj, taksi/yol fali ve oyun sonu gibi aktif olaylari oyuncuya gosterilecek kisa anlatimlara cevirir.

Onemli sinir:

- Karar mekanigi backend tarafindaki deterministik oyun kurallarinda kalir.
- Gemini yalnizca olay metnini zenginlestirir.
- API anahtari frontend'e verilmez.
- `GEMINI_API_KEY` yoksa veya servis cevap vermezse oyun fallback metinlerle devam eder.

## Mimari

```text
frontend/         React, Vite, Tailwind, Zustand, Socket.io client
backend/          Express, Socket.io, Prisma, PostgreSQL, Gemini servisleri
prodocs/          Bitirme projesi dokumanlari
docker-compose.yml Yerel PostgreSQL servisi
```

Backend API ve Socket.io olaylari oyunun otoritesidir. Frontend sadece arayuz, harita etkilesimi ve oyuncu niyetlerini backend'e iletme katmanidir.

## Kurulum

Gereksinimler:

- Node.js 20+
- Docker
- npm

Ortam dosyalarini hazirlayin:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend icin `backend/.env` dosyasinda `DATABASE_URL` ve opsiyonel `GEMINI_API_KEY` degerlerini girin.

PostgreSQL'i baslatin:

```bash
docker compose up -d postgres
```

Backend bagimliliklarini kurun ve Prisma client'i hazirlayin:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Frontend'i ayri bir terminalde baslatin:

```bash
cd frontend
npm install
npm run dev
```

Varsayilan adresler:

- Frontend: `http://127.0.0.1:5173`
- Backend health check: `http://127.0.0.1:3001/api/health`

## Ortam Degiskenleri

Root `.env.example`, projenin tamaminda gereken degiskenlerin toplu referansidir. Calisma zamaninda backend ve frontend kendi `.env` dosyalarini okur.

Backend:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gameofdistricts?schema=public"
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_TIMEOUT_MS=4500
```

Frontend:

```env
VITE_API_URL="http://localhost:3001"
```

Gercek API anahtarlari ve sifreler repoya eklenmemelidir.

## Scriptler

Backend:

```bash
cd backend
npm run dev
npm start
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## Teslim ve Deploy Notlari

Bitirme brief'ine gore proje canli bir URL ile teslim edilmelidir. Onerilen kurulum:

- Backend: Render, Railway, Fly.io veya benzeri Node.js host.
- Veritabani: managed PostgreSQL veya deploy servisinin PostgreSQL eklentisi.
- Frontend: Vercel, Netlify veya statik Vite hosting.
- Production env: `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`, `VITE_API_URL`.

Canli URL ve demo video linki repo icinden dogrulanabilen bilgiler degildir; teslim formuna ayrica eklenmelidir.

## Dokumanlar

- [PRD](./prodocs/PRD.md)
- [Tech Stack](./prodocs/tech-stack.md)
- [Plan](./prodocs/Plan.md)
- [Design System](./prodocs/DesignSystem.md)
- [Progress](./prodocs/Progress.md)

## Brief Uygunluk Ozeti

- Interaktif web uygulamasi: tamam.
- Frontend/backend ayrimi: tamam.
- Backend API ve Socket.io katmani: tamam.
- LLM entegrasyonu: tamam, backend uzerinden Gemini.
- Gizli anahtarlarin repoya girmemesi: `.env.example` ile belgelenmis, `.env` dosyalari ignore edilir.
- Zorunlu proje dokumanlari: `prodocs/` altinda guncel.
- Deploy ve demo video: repo disi teslim adimi olarak tamamlanmalidir.
