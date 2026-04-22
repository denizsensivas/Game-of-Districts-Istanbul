# Game of Districts: Istanbul - Minimum Uygulanabilir Ürün (MVP)

## 1. MVP Kapsamı (V1.0 Özellikleri)
Aşağıdaki özellikler oyunun ilk canlı sürümüne (V1.0) dahil edilecektir:

**Lobi ve Eşleştirme (Matchmaking):**
* **Misafir Girişi (Guest Login):** Karmaşık üyelik sistemleri yerine, oyuncuların sadece kullanıcı adı girerek anında oyuna başlaması sağlanacaktır.
* **Hızlı Maç:** Rastgele oyuncularla eşleşme modudur.
* **Özel Oda:** Kurucunun ürettiği 6 haneli davet koduyla arkadaşlarını çağırabildiği, maksimum 8 kişilik oyun modudur.
* **Karakter Seçimi:** Oyuna başlarken Öğrenci, Turist, Esnaf veya Beyaz Yakalı avatarlarından biri seçilir. Her karakterin sistemde tanımlı statik bonusları olmalıdır.

**Kullanıcı Arayüzü (UI/UX) ve Tasarım Dili:**
* **Mobil Oyun Hissi (Mobile Game Look):** Monopoly Go tarzında canlı renkler, kalın (bold) ve okunabilir typography, büyük ve dokunmatik ekranlara uygun etkileşimli butonlar.
* **Mobil Uyumluluk:** Responsive tasarım, özellikle mobil cihazlarda (dokunmatik ekranlarda) tam uyumlu, pürüzsüz ve App benzeri (PWA) bir deneyim.

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

## 2. Kapsam Dışı (Out-of-Scope)
Projenin hızlıca test edilebilir (playable) hale gelmesi için V1.0 sürümüne şunlar dahil edilmeyecektir:
* Premium abonelikler ve kredi kartı/ödeme sistemleri içeren mağaza entegrasyonu.
* Animasyonlu özel zarlar ve satın alınabilir kozmetik avatarlar (Skins).
* Gelişmiş arkadaşlık sistemi ve mesajlaşma (Yalnızca hazır emoji yollama eklenebilir).