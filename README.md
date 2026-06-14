# 🎲 Game of Districts: İstanbul

**Game of Districts**, İstanbul'un harika ilçelerini dev bir oyun tahtasına dönüştüren, arkadaşlarınızla internet üzerinden canlı oynayabileceğiniz eğlenceli bir masa oyunudur.
---
## 🌟 Oyunun Amacı Nedir? Nasıl Oynanır?

1. **Karakterini Seç:** Oyuna başlarken kendine bir karakter seçersin. (Öğrenci, Esnaf, Turist veya Beyaz Yaka). Her karakterin kendine göre avantajları vardır!
2. **Zar At ve İlerle:** Sıran geldiğinde zar atarsın ve İstanbul haritası üzerinde ilçeden ilçeye hareket edersin. Vapurla karşıya geçebilir veya taksiye binebilirsin!
3. **Biletlerini Yönet:** Oyunda kırmızı, mavi ve yeşil biletler vardır. Bunlar senin paran gibidir. Biletleri akıllıca harca!
4. **Bölgeleri Ele Geçir:** Gittiğin ilçelerde "masa kapatarak" (yani orayı sahiplenerek) kendi bölgelerini kur. Rakiplerin senin bölgene gelirse sana kira ödemek zorunda kalır!
5. **Sabotaj Yap ve Kazan:** Rakiplerinin bölgelerini bozabilir, onlara şakalar yapabilirsin. 12 turun sonunda en çok puanı toplayan oyunu kazanır!
6. **🤖 Yapay Zeka Anlatıcı (Gemini):** Oyunda başına gelen komik olayları (taksi maceraları, fal bakma, sabotajlar vb.) size eğlenceli İstanbul hikayeleriyle anlatan akıllı bir yardımcı robotumuz var!

---

## 👥 Oyundaki Karakterler

* **🎒 Öğrenci:** Cebinde her zaman ekstra otobüs/metro biletleriyle başlar.
* **💼 Beyaz Yaka:** Plazalardan çıkıp gelmiştir, bilet ekonomisinde avantajları vardır.
* **🏪 Esnaf:** İstanbul'un sokaklarını en iyi o bilir, mahalle esnafı olmanın gücünü kullanır.
* **📸 Turist:** Şehri gezmeye gelmiştir, vapur ve taksi yolculuklarında rahattır.

---

## 🛠️ Bilgisayara Nasıl Kurulur? (Adım Adım Çok Kolay!)

Bu oyunu kendi bilgisayarında çalıştırmak için aşağıdaki adımları sırayla takip etmen yeterli. 

### 🎒 Başlamadan Önce Bilgisayarında Olması Gerekenler:
* **Node.js** (Oyunun motorunu çalıştırmak için program)
* **Docker** (Verilerimizi kaydedeceğimiz dijital kutuyu/veritabanını açmak için)

---

### 🚀 Kurulum Adımları

#### 1. Ayar Dosyalarını Oluşturma
Terminalini (Komut İstemi) aç ve aşağıdaki komutları kopyalayıp yapıştır. Bu komutlar oyunun çalışması için gereken ayar şablonlarını hazırlar:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### 2. Veritabanını (Dijital Kumbara) Çalıştırma
Docker uygulamasının açık olduğundan emin ol, ardından şu komutla veritabanını başlat:
```bash
docker compose up -d postgres
```

#### 3. Oyunun Sunucusunu (Arka Plan Motorunu) Başlatma
Şimdi oyunun kurallarını yönetecek olan sunucuyu çalıştıralım:
```bash
cd backend
npm install            # Gerekli malzemeleri indirir
npx prisma generate    # Veritabanı bağlantılarını hazırlar
npx prisma db push     # Oyun alanını veritabanına kurar
npm run dev            # Sunucuyu başlatır!
```
*(Sunucu şu adreste çalışmaya başlar: `http://localhost:3001`)*

#### 4. Oyunun Ekranını (Arayüzünü) Başlatma
Yeni bir terminal penceresi aç ve oyunun görsellerini göreceğin ekranı başlat:
```bash
cd frontend
npm install            # Görsel malzemeleri indirir
npm run dev            # Oyun ekranını açar!
```
*(Oyun ekranına tarayıcından şu adresten ulaşabilirsin: `http://localhost:5173`)*

Artık arkadaşlarınla birlikte oynamaya hazırsın! 🎉

---

## 📂 Proje Klasörleri Ne İşe Yarar?

* `frontend/`: Oyuncunun gördüğü renkli ekranlar, harita ve butonlar burada yer alır.
* `backend/`: Oyunun kurallarını yöneten, zarları atan ve yapay zekayı çalıştıran gizli beyin burasıdır.
* `prodocs/`: Oyunun nasıl tasarlandığını anlatan detaylı rehberler ve çizimler.
