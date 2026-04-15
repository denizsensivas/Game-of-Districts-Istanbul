# Game of Districts: Istanbul - Teknik Ürün Gereksinim Dokümanı (PRD)

## 1. Ürün Özeti 
Game of Districts: Istanbul; klasik kutu oyunlarının yavaş ve tahmin edilebilir yapısını kıran, hızlı tempolu, yüksek etkileşimli ve sabotaj odaklı bir multiplayer strateji oyunudur. Oyuncular İstanbul haritasında hareket ederek ilçeleri kontrol altına almayı hedefler. Aynı zamanda dinamik ekonomi sistemini manipüle eder ve rakiplerini sabote ederek oyunu kazanmaya çalışırlar.
* **Tür:** Web tabanlı Multiplayer Strateji Oyunu 
* **Platform:** Web (ilk faz), ileride Mobile (opsiyonel) 
* [cite_start]**Oyuncu Sayısı:** 2-8 kişi [cite: 103]
* [cite_start]**Oyun Süresi:** 20-25 dakika [cite: 104]

## [cite_start]2. Hedef Kitle ve Ürün Hedefleri [cite: 109]
[cite_start]**Hedef Kitle:** [cite: 110]
* [cite_start]18-30 yaş arası üniversite öğrencileri ve çalışanlar. [cite: 111]
* [cite_start]Casual ve mid-core oyuncular (gamerlar). [cite: 112]
* [cite_start]Arkadaş gruplarıyla online oyun oynamayı seven kullanıcılar. [cite: 113]

[cite_start]**Birincil Hedefler (Primary Goals):** [cite: 114]
* [cite_start]Hızlı ve tekrar oynanabilir bir multiplayer deneyim sunmak. [cite: 115]
* [cite_start]Oyuncular arası etkileşimi maksimum seviyeye çıkarmak. [cite: 115]
* [cite_start]Ekonomi, strateji ve şans dengesini ideal şekilde kurmak. [cite: 116]

[cite_start]**İkincil Hedefler (Secondary Goals):** [cite: 117]
* [cite_start]İstanbul teması üzerinden oyuncularla lokal bir bağ kurmak. [cite: 118]
* [cite_start]Arkadaş daveti sistemi ile viral yayılmaya uygun bir altyapı sağlamak. [cite: 119]
* [cite_start]Basit bir öğrenme eğrisi sunarken derin bir oynanış (gameplay) sağlamak. [cite: 120]

## [cite_start]3. Oyun Mekanikleri ve Döngüsü (Core Gameplay) [cite: 121]
[cite_start]**Temel Oyun Döngüsü (Core Loop):** [cite: 122]
1. [cite_start]Oyuncunun sırası başlar. [cite: 123]
2. Zar atılır. (Sistem 1-6 arası rastgele sayı üretir)[cite_start]. [cite: 124]
3. [cite_start]Hareket edilir. [cite: 125]
4. [cite_start]İlçe aksiyonu gerçekleşir (Kazanım, Ele Geçirme veya Ödeme). [cite: 126]
5. [cite_start]Opsiyonel olarak sabotaj veya ulaşım aksiyonları kullanılır. [cite: 126]
6. [cite_start]Sıra biter. [cite: 127]

[cite_start]**Oynanış Kuralları ve Sınırlandırmalar:** [cite: 128]
* **Hareket Doğrulaması:** Sistem, zar atıldıktan sonra ulaşılabilecek geçerli komşu ilçeleri hesaplar ve haritada vurgular. [cite_start]Vurgulama işlemi highlighting olarak adlandırılır. [cite: 129]
* **Süre Sınırı:** Her oyuncunun hamlesi için 30 saniyelik bir geri sayım (Timeout) vardır. [cite_start]Süre bittiğinde oyuncu sırasını pas geçer. [cite: 130]
* [cite_start]**Oyun Süresi:** Oyun, belirlenen tur sayısı kadar oynanır (maksimum 30 tur) ve ardından sona erer. [cite: 131]
* [cite_start]**Boğaz Geçiş Kuralı:** Avrupa ve Anadolu yakası arasındaki geçişler, sadece köprü statüsünde olan spesifik komşu ilçeler üzerinden yapılabilir. [cite: 132]

## [cite_start]4. MVP Kapsamı (V1.0 Özellikleri) [cite: 133]
[cite_start]Aşağıdaki özellikler oyunun ilk canlı sürümüne (V1.0) dahil edilecektir: [cite: 134]

[cite_start]**Lobi ve Eşleştirme (Matchmaking):** [cite: 135]
* [cite_start]**Misafir Girişi (Guest Login):** Karmaşık üyelik sistemleri yerine, oyuncuların sadece kullanıcı adı girerek anında oyuna başlaması sağlanacaktır. [cite: 136]
* [cite_start]**Hızlı Maç:** Rastgele oyuncularla eşleşme modudur. [cite: 137]
* [cite_start]**Özel Oda:** Kurucunun ürettiği 6 haneli davet koduyla arkadaşlarını çağırabildiği, maksimum 8 kişilik oyun modudur. [cite: 138]
* **Karakter Seçimi:** Oyuna başlarken Öğrenci, Turist, Esnaf veya Beyaz Yakalı avatarlarından biri seçilir. [cite_start]Her karakterin sistemde tanımlı statik bonusları olmalıdır. [cite: 139]

[cite_start]**Harita (Game Board):** [cite: 140]
* **Poligon Harita:** İstanbul'un 39 ilçesini temsil eden, tıklanabilir SVG/Vektörel harita. [cite_start]Haritada Node-to-Node komşuluk ilişkileri tanımlanmış olmalıdır. [cite: 141]
* [cite_start]**Dinamik Kısıtlama:** Odadaki oyuncu sayısı 4 veya daha az ise, oyun başlarken rastgele 15 ilçe "Yol Çalışması" (Pasif/Tıklanamaz) durumuna geçer. [cite: 142]

[cite_start]**Ekonomi Sistemi:** [cite: 143]
* [cite_start]**Bilet Cüzdanı:** Her oyuncunun Kırmızı, Mavi ve Yeşil bilet stokunu tutan arayüzdür. [cite: 144]
* [cite_start]**Kur Tabelası:** Biletlerin birbirine olan değerini (Örn: 1 Kırmızı = 2 Mavi = 4 Yeşil) anlık olarak gösteren veri yapısıdır. [cite: 145] [cite_start]Kurların minimum değeri 1, maksimum değeri ise 5 olarak kısıtlanmıştır. [cite: 146]
* [cite_start]**Masayı Kapatma (Zone Control):** Boş bir ilçeye gelindiğinde bilet harcanarak o alan 3 turluğuna rezerve edilir. [cite: 147] [cite_start]Sistem her tur geçişinde bu sayacı 1 düşürür ve O'a ulaştığında alanı tekrar boşa çıkarır. [cite: 148]
* [cite_start]**Ayakbastı Ücreti (Çay Ismarlama):** Oyuncu, başkasının kontrolündeki bir ilçeye geldiğinde, sistem oyuncunun cüzdanından güncel kura göre otomatik tahsilat yapar. [cite: 149]

[cite_start]**Sabotaj ve Ulaşım Mekanikleri:** [cite: 150]
* **Hatır Kahvesi:** Oyuncunun kendi sırasında bilet harcayarak etkileyebileceği yeteneklerdir. [cite_start]İkiye ayrılır: [cite: 151]
    * [cite_start]*Sade Kahve (Zabıta Çağırır):* Seçilen rakibin ilçe sayacını 0'a eşitler. [cite: 152]
    * [cite_start]*Kahve Falı:* Kur değişimini tetikleyen yeni bir Global Olay kartı fonksiyonunu çalıştırır. [cite: 153]
* [cite_start]**Ulaşım Zone'ları (Taksi/VIP Minibüs):** Ulaşım noktasına gelen oyuncular için RNG (Rastgele Sayı Üretici) bazlı bir risk sistemi devreye girer. [cite: 154]
    * [cite_start]*Başarı Durumu:* Haritada komşuluk kuralı aranmaksızın 2 veya 3 birim uzağa ışınlanma (Teleport) gerçekleşir. [cite: 155, 157]
    * [cite_start]*Başarısızlık (Değişim Saati):* Ekranda bildirim çıkar, bilet silinir ve oyuncunun hareketi iptal edilir. [cite: 158]

[cite_start]**Oyun Sonu (Endgame):** [cite: 159]
* [cite_start]Belirlenen tur sayısı bittiğinde aktif oyun durdurulur. [cite: 160]
* [cite_start]Oyuncuların elindeki tüm biletler ve aktif kapalı masaları, son güncel kura göre tek bir değere (Total Mal Varlığı) çevrilir. [cite: 161]
* Bu değere göre sıralama ekranda gösterilir. [cite_start]En yüksek toplam varlığa sahip olan oyuncu oyunu kazanır. [cite: 162]

## [cite_start]5. Teknik Mimari ve Altyapı [cite: 163]
* [cite_start]**Gerçek Zamanlı İletişim:** Zar atışları, hareketler ve kur değişimlerinin anında görülmesi için WebSocket altyapısı (örn: Socket.io veya Firebase Realtime DB) kullanılmalıdır. [cite: 164] [cite_start]HTTP istekleri (REST API) bu yapı için çok yavaş kalacaktır. [cite: 165]
* [cite_start]**Backend Otoritesi:** Hileleri engellemek için zar atma, kur değiştirme ve bilet eksiltme işlemleri tarayıcıda (Browser) değil, sunucuda (Server) hesaplanıp yayınlanmalıdır (Broadcasting). [cite: 166]
* [cite_start]**Frontend (Arayüz):** Haritanın tıklanabilir poligonlardan oluşması nedeniyle, harita manipülasyonu için React, Vue veya p5.js gibi kütüphaneler uygun olacaktır. [cite: 167]
* [cite_start]**Veri Modelleri:** [cite: 168]
    * [cite_start]Player: id, position, tickets {red, blue, green}, owned Districts. [cite: 169]
    * [cite_start]District: id, ownerld, remaining Turns, type. [cite: 169]
    * [cite_start]GameState: players, current Turn, ticketRates, activeEvents. [cite: 170]

## [cite_start]6. Kapsam Dışı (Faz 2) ve Gelecek Özellikler [cite: 171]
[cite_start]**MVP Kapsamı Dışındakiler (Out-of-Scope):** Projenin hızlıca test edilebilir (playable) hale gelmesi için V1.0 sürümüne şunlar dahil edilmeyecektir: [cite: 172]
* [cite_start]Premium abonelikler ve kredi kartı/ödeme sistemleri içeren mağaza entegrasyonu. [cite: 173]
* [cite_start]Animasyonlu özel zarlar ve satın alınabilir kozmetik avatarlar (Skins). [cite: 173]
* [cite_start]Gelişmiş arkadaşlık sistemi ve mesajlaşma (Yalnızca hazır emoji yollama eklenebilir). [cite: 174]

[cite_start]**Gelecek Özellikler:** [cite: 175]
* [cite_start]Ranking (Sıralama) sistemi. [cite: 176]
* [cite_start]Turnuvalar. [cite: 177]
* [cite_start]Yeni şehir haritaları (Game of Districts: World) [cite: 178]
