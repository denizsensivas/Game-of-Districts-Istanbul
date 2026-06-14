# Product Requirements Document

## Urun

Game of Districts, Istanbul ilcelerini rekabetci bir masa oyunu tahtasi olarak kullanan cok oyunculu web oyunudur. Oyuncu zar atarak ilceler arasinda hareket eder, bilet kaynaklarini yonetir, masa kapatir, rakiplerinin hamlelerine cevap verir ve AI destekli olay anlatimlariyla oyunun guncel durumunu takip eder.

## Hedef Kitle

- Istanbul temali sosyal/strateji oyunlarini seven oyuncular.
- Kisa oturumlarda arkadaslariyla web uzerinden oynanabilir oyun arayan kullanicilar.
- Bitirme projesi kapsaminda AI destekli, frontend/backend ayrimi olan canli bir uygulama bekleyen degerlendiriciler.

## Problem

Klasik masa oyunlari dijitalde genellikle statik kalir ve yerel tema hissini kaybeder. Bu proje, Istanbul haritasini oynanabilir bir sistem haline getirerek hem yerel baglam hem de gercek zamanli rekabet sunar.

## Cozum

Oyun, backend tarafindan yonetilen kurallarla deterministik ve adil kalir. Frontend harita etkilesimi, karakter secimi ve oyun panelini sunar. Gemini entegrasyonu ise kritik olaylari kisa, Istanbul esintili metinlerle anlatir.

## Temel Kullanici Akislari

1. Oyuncu kullanici adini girer.
2. Karakter galerisinden Ogrenci, Esnaf, Turist veya Beyaz Yaka varyantlarindan birini secer.
3. Kucuk veya buyuk harita ile oda kurar ya da oda koduyla mevcut oyuna katilir.
4. Sira kendisine geldiginde zar atar.
5. Ulasilabilir ilcelerden birini secer ve hamlesini onaylar.
6. Gerekirse bilet takasi, kahve fali, sabotaj veya taksi/yol fali kullanir.
7. Tur sonunda skor, bilet degeri ve sahip olunan masalara gore hesaplanir.

## Fonksiyonel Gereksinimler

- Oda kurma ve odaya katilma.
- Gercek zamanli oyun durumu senkronizasyonu.
- Server-authoritative zar, hareket ve kaynak kurallari.
- Kucuk ve buyuk Istanbul haritasi.
- Karaktere gore baslangic bonuslari.
- Bilet ekonomisi ve degisen kurlar.
- Ilce sahipligi, kira odemesi ve masa suresi.
- AI destekli aktif olay anlatimi.
- Test modu ile hizli demo.

## Fonksiyonel Olmayan Gereksinimler

- API anahtarlari frontend'e acilmamalidir.
- Oyun AI servisi yavaslasa bile devam etmelidir.
- Frontend ve backend ayri deploy edilebilir olmalidir.
- Backend API/Socket katmani farkli istemciler tarafindan kullanilabilir olmalidir.

## Basari Kriterleri

- Iki oyuncu ayni odaya girip oyunu tamamlayabilir.
- Zar sonrasi secilebilir ilceler dogru isaretlenir.
- AI metni olmadiginda fallback metinler oyunu kesmeden calisir.
- README ve `prodocs/` brief gerekliliklerini acikca karsilar.
