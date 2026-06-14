# Plan

## 1. Cekirdek Oyun

- Istanbul harita verisini oynanabilir ilce node'larina donustur.
- Ilce komsuluklarini, vapur gecislerini ve harita boyutlarini tanimla.
- Zar, hareket ve ilce secimi akisini backend otoritesinde calistir.

## 2. Cok Oyunculu Altyapi

- Oda kurma ve odaya katilma akisini ekle.
- Socket.io ile oyun durumunu tum oyunculara yayinla.
- Sira, tur ve zamanlayici durumunu backend'de yonet.

## 3. Ekonomi ve Strateji

- Kirmizi, mavi ve yesil biletleri tanimla.
- Masa kapatma, kira, sabotaj, kahve fali, taksi/yol fali ve vapur maliyetlerini uygula.
- Skor sistemini bilet degeri ve aktif masalara gore hesapla.

## 4. Karakter Sistemi

- Ogrenci, Esnaf, Turist ve Beyaz Yaka karakterlerini ekle.
- Karakter secim galerisini guncel gorsellerle kur.
- Karakter bonuslarini backend'de uygula.

## 5. AI Entegrasyonu

- Gemini API anahtarini backend env ile al.
- Aktif olaylari AI ile kisa tematik metne cevir.
- Timeout/fallback ile oyunun kesintisiz devam etmesini sagla.

## 6. Teslim Hazirligi

- README'yi guncelle.
- `prodocs/` altindaki zorunlu dokumanlari tamamla.
- Gereksiz ve eski dosyalari temizle.
- Lint, health check ve yerel smoke test yap.
- Canli deploy ve demo video linklerini teslim formuna ekle.
