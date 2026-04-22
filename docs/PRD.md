# Game of Districts: Istanbul - Ürün Gereksinim Dokümanı (PRD)

## 1. Ürün Özeti
Game of Districts: Istanbul; klasik kutu oyunlarının yavaş ve tahmin edilebilir yapısını kıran, hızlı tempolu, yüksek etkileşimli ve sabotaj odaklı bir multiplayer strateji oyunudur. Oyuncular İstanbul haritasında hareket ederek ilçeleri kontrol altına almayı hedefler. Aynı zamanda dinamik ekonomi sistemini manipüle eder ve rakiplerini sabote ederek oyunu kazanmaya çalışırlar.

* **Tür:** Web tabanlı Multiplayer Strateji Oyunu
* **Platform:** Mobil Uyumlu Web (Mobile-First yaklaşımı ile tasarlanmış, mobil cihazlarda sorunsuz oynanabilen yapı)
* **Oyuncu Sayısı:** 2-8 kişi
* **Oyun Süresi:** 20-25 dakika

## 2. Hedef Kitle ve Ürün Hedefleri
**Hedef Kitle:**
* 18-30 yaş arası üniversite öğrencileri ve çalışanlar.
* Casual ve mid-core oyuncular (gamerlar).
* Arkadaş gruplarıyla online oyun oynamayı seven kullanıcılar.

**Birincil Hedefler (Primary Goals):**
* Hızlı ve tekrar oynanabilir bir multiplayer deneyim sunmak.
* Oyuncular arası etkileşimi maksimum seviyeye çıkarmak.
* Ekonomi, strateji ve şans dengesini ideal şekilde kurmak.

**İkincil Hedefler (Secondary Goals):**
* İstanbul teması üzerinden oyuncularla lokal bir bağ kurmak.
* Arkadaş daveti sistemi ile viral yayılmaya uygun bir altyapı sağlamak.
* Basit bir öğrenme eğrisi sunarken derin bir oynanış (gameplay) sağlamak.

## 3. Oyun Mekanikleri ve Döngüsü (Core Gameplay)
**Temel Oyun Döngüsü (Core Loop):**
1. Oyuncunun sırası başlar.
2. Zar atılır. (Sistem 1-6 arası rastgele sayı üretir).
3. Hareket edilir.
4. İlçe aksiyonu gerçekleşir (Kazanım, Ele Geçirme veya Ödeme).
5. Opsiyonel olarak sabotaj veya ulaşım aksiyonları kullanılır.
6. Sıra biter.

**Oynanış Kuralları ve Sınırlandırmalar:**
* **Hareket Doğrulaması:** Sistem, zar atıldıktan sonra ulaşılabilecek geçerli komşu ilçeleri hesaplar ve haritada vurgular. Vurgulama işlemi highlighting olarak adlandırılır.
* **Süre Sınırı:** Her oyuncunun hamlesi için 30 saniyelik bir geri sayım (Timeout) vardır. Süre bittiğinde oyuncu sırasını pas geçer.
* **Oyun Süresi:** Oyun, belirlenen tur sayısı kadar oynanır (maksimum 30 tur) ve ardından sona erer.
* **Boğaz Geçiş Kuralı:** Avrupa ve Anadolu yakası arasındaki geçişler, sadece köprü statüsünde olan spesifik komşu ilçeler üzerinden yapılabilir.

## 4. Teknik Mimari ve Altyapı
* **Gerçek Zamanlı İletişim:** Zar atışları, hareketler ve kur değişimlerinin anında görülmesi için WebSocket altyapısı (örn: Socket.io veya Firebase Realtime DB) kullanılmalıdır. HTTP istekleri (REST API) bu yapı için çok yavaş kalacaktır.
* **Backend Otoritesi:** Hileleri engellemek için zar atma, kur değiştirme ve bilet eksiltme işlemleri tarayıcıda (Browser) değil, sunucuda (Server) hesaplanıp yayınlanmalıdır (Broadcasting).
* **Frontend (Arayüz):** Haritanın tıklanabilir poligonlardan oluşması nedeniyle, harita manipülasyonu için React, Vue veya p5.js gibi kütüphaneler uygun olacaktır. Arayüz tasarımı "Monopoly Go" tarzında, canlı, renkli, büyük butonların olduğu ve mikro animasyonlarla desteklenen bir "Mobile Game Look" (Mobil Oyun Görünümü) sunmalıdır. Tüm arayüz mobil ekranlar için optimize edilmelidir.
* **Veri Modelleri:**
    * Player: id, position, tickets {red, blue, green}, owned Districts.
    * District: id, ownerld, remaining Turns, type.
    * GameState: players, current Turn, ticketRates, activeEvents.

## 5. Gelecek Özellikler (Faz 2)
* Ranking (Sıralama) sistemi.
* Turnuvalar.
* Yeni şehir haritaları (Game of Districts: World).