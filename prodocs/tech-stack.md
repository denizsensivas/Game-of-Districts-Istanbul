# Tech Stack

## Frontend

- React 19
- Vite 8
- Tailwind CSS 4
- Zustand
- Socket.io Client
- Framer Motion
- Lucide React

Frontend, kullanici arayuzu, karakter secimi, harita etkilesimi, oyun paneli, animasyonlar ve istemci tarafli state gosteriminden sorumludur.

## Backend

- Node.js
- Express 5
- Socket.io
- Prisma 7
- PostgreSQL
- `@google/genai`

Backend oyun otoritesidir. Zar, hareket, kaynak harcama, ilce sahipligi, skor ve tur zamanlayicisi backend tarafinda hesaplanir.

## Veritabani

- PostgreSQL
- Prisma schema: `backend/prisma/schema.prisma`

Kullanici, oda ve oyuncu kayitlari veritabaninda tutulur. Anlik oyun durumu backend bellegindeki room state uzerinden yayinlanir.

## AI

- Provider: Google Gemini
- Servis: `backend/src/services/llmNarrator.js`
- Env: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`

AI katmani oyun sonucunu belirlemez; yalnizca aktif olay metinlerini zenginlestirir.

## Yerel Calisma

- PostgreSQL icin Docker Compose
- Backend: `npm run dev`
- Frontend: `npm run dev`

## Deploy

Onerilen canli mimari:

- Frontend: Vercel/Netlify statik Vite build.
- Backend: Render/Railway/Fly.io Node.js servisi.
- Database: Managed PostgreSQL.
- Secrets: Deploy paneli environment variables.
