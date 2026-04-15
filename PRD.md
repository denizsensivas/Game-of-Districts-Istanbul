# Game of Districts: Istanbul - Teknik Ürün Gereksinim Dokümanı (PRD)

## 1. Ürün Özeti
Game of Districts: Istanbul; klasik kutu oyunlarının yavaş ve tahmin edilebilir yapısını kıran, hızlı tempolu, yüksek etkileşimli ve sabotaj odaklı bir multiplayer strateji oyunudur. Oyuncular İstanbul haritasında hareket ederek ilçeleri kontrol altına almayı hedefler. Aynı zamanda dinamik ekonomi sistemini manipüle eder ve rakiplerini sabote ederek oyunu kazanmaya çalışırlar.

* **Tür:** Web tabanlı Multiplayer Strateji Oyunu
* **Platform:** Web (ilk faz), ileride Mobile (opsiyonel)
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

## 4. MVP Kapsamı (V1.0 Özellikleri)
Aşağıdaki özellikler oyunun ilk canlı sürümüne (V1.0) dahil edilecektir:

**Lobi ve Eşleştirme (Matchmaking):**
* **Misafir Girişi (Guest Login):** Karmaşık üyelik sistemleri yerine, oyuncuların sadece kullanıcı adı girerek anında oyuna başlaması sağlanacaktır.
* **Hızlı Maç:** Rastgele oyuncularla eşleşme modudur.
* **Özel Oda:** Kurucunun ürettiği 6 haneli davet koduyla arkadaşlarını çağırabildiği, maksimum 8 kişilik oyun modudur.
* **Karakter Seçimi:** Oyuna başlarken Öğrenci, Turist, Esnaf veya Beyaz Yakalı avatarlarından biri seçilir. Her karakterin sistemde tanımlı statik bonusları olmalıdır.

**Harita (Game Board):**
* **Poligon Harita:** İstanbul'un 39 ilçesini temsil eden, tıklanabilir SVG/Vektörel harita. Haritada Node-to-Node komşuluk ilişkileri tanımlanmış olmalıdır.
* **Dinamik Kısıtlama:** Odadaki oyuncu sayısı 4 veya daha az ise, oyun başlarken rastgele 15 ilçe "Yol Çalışması" (Pasif/Tıklanamaz) durumuna geçer.

**Ekonomi Sistemi:**
* **Bilet Cüzdanı:** Her oyuncunun Kırmızı, Mavi ve Yeşil bilet stokunu tutan arayüzdür.
* **Kur Tabelası:** Biletlerin birbirine olan değerini (Örn: 1 Kırmızı = 2 Mavi = 4 Yeşil) anlık olarak gösteren veri yapısıdır. Kurların minimum değeri 1, maksimum değeri ise 5 olarak kısıtlanmıştır.
* **Masayı Kapatma (Zone Control):** Boş bir ilçeye gelindiğinde bilet harcanarak o alan 3 turluğuna rezerve edilir. Sistem her tur geçişinde bu sayacı 1 düşürür ve O'a ulaştığında alanı tekrar boşa çıkarır.
* **Ayakbastı Ücreti (Çay Ismarlama):** Oyuncu, başkasının kontrolündeki bir ilçeye geldiğinde, sistem oyuncunun cüzdanından güncel kura göre otomatik tahsilat yapar.

**Sabotaj ve Ulaşım Mekanikleri:**
* **Hatır Kahvesi:** Oyuncunun kendi sırasında bilet harcayarak etkileyebileceği yeteneklerdir. İkiye ayrılır:
    * *Sade Kahve (Zabıta Çağırır):* Seçilen rakibin ilçe sayacını 0'a eşitler.
    * *Kahve Falı:* Kur değişimini tetikleyen yeni bir Global Olay kartı fonksiyonunu çalıştırır.
* **Ulaşım Zone'ları (Taksi/VIP Minibüs):** Ulaşım noktasına gelen oyuncular için RNG (Rastgele Sayı Üretici) bazlı bir risk sistemi devreye girer.
    * *Başarı Durumu:* Haritada komşuluk kuralı aranmaksızın 2 veya 3 birim uzağa ışınlanma (Teleport) gerçekleşir.
    * *Başarısızlık (Değişim Saati):* Ekranda bildirim çıkar, bilet silinir ve oyuncunun hareketi iptal edilir.

**Oyun Sonu (Endgame):**
* Belirlenen tur sayısı bittiğinde aktif oyun durdurulur.
* Oyuncuların elindeki tüm biletler ve aktif kapalı masaları, son güncel kura göre tek bir değere (Total Mal Varlığı) çevrilir.
* Bu değere göre sıralama ekranda gösterilir. En yüksek toplam varlığa sahip olan oyuncu oyunu kazanır.

## 5. Teknik Mimari ve Altyapı
* **Gerçek Zamanlı İletişim:** Zar atışları, hareketler ve kur değişimlerinin an
