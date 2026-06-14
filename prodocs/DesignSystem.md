# Design System

## Gorsel Yon

Game of Districts, Istanbul temali, oyuncak kutusu hissi veren renkli bir masa oyunu arayuzune sahiptir. Arayuz ciddi bir dashboard gibi degil; okunakli, eglenceli ve dokunulabilir bir oyun paneli gibi davranir.

## Renkler

- Arka plan: acik mavi Istanbul/deniz hissi.
- Ana vurgu: sicak kirmizi/pembe.
- Ikincil vurgu: turkuaz/yesil.
- Koyu kontrast: kahverengi oyun metni ve buton zeminleri.
- Bilet renkleri: kirmizi, mavi ve yesil.

## Tipografi

- Kalin, yuvarlak ve oyun hissi veren basliklar.
- Harita uzerinde ilce isimleri okunakli, merkezi ve ilce sinirlarini asmadan konumlandirilir.
- Panel metinleri kisa ve islev odaklidir.

## Bilesenler

- Oyun paneli: yuvarlatilmis, kalin kenarlikli ve golgeli.
- Harita: SVG path tabanli, zoom/pan destekli.
- Karakter ikonlari: karakter gorselleriyle temsil edilir.
- Zar butonu: merkezi ana aksiyon.
- Aktif olay bannner'i: AI veya fallback metnini animasyonlu gosterir.
- Modal/menu: kahve fali, bilet takasi ve karakter secimi icin kullanilir.

## Etkilesim Ilkeleri

- Ana aksiyon her zaman net gorunmelidir.
- Zar atildiktan sonra secilebilir ilceler belirginlesmelidir.
- Harita surukleme ve zoom, oyuncunun baktigi bolgeye gore davranmalidir.
- Karakter secimi yana kaydirma ve oklarla degistirilebilir oldugunu anlatmalidir.

## Erişilebilirlik Notlari

- Butonlarda ikon + kisa metin kullanilir.
- Etkilesimli kontrollerde `title` ve `aria-label` kullanimi tercih edilir.
- Kritik oyun durumlari yalniz renge degil metne de dayanir.
