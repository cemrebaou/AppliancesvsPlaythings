# OYUN.md — Appliances vs Playthings denge notları

Sürüm: **v0.19**  — tüm değerler Plants vs Zombies karşılıklarına göre
Bu dosya oyunun tüm sayılarını tutar. Kod tarafında karşılığı `src/config/` klasörüdür.

---

## Saha

| Değer | |
|---|---|
| Tasarım çözünürlüğü | 1280 × 720 (Scale.FIT) |
| Izgara | 6 şerit × 10 sütun |
| Izgara eşlemesi | Arka plandaki çizili perspektif zemine 4 köşeli homografi ile oturtulur (`GRID.corners`) |
| Perspektif ölçeği | Arka sıra ≈ 0.58, ön sıra = 1.00 (otomatik hesaplanır) |
| Başlangıç canı | 3 (her sızan oyuncak 1 can götürür) |

## Enerji (şimşek)

| Değer | |
|---|---|
| Başlangıç enerjisi | 50 (PvZ gibi) |
| Gökten düşen şimşek | 25 enerji, her 7–11 sn'de bir |
| Şimşek yerde kalma | 9 sn (son 1.2 sn'de solar) |
| Kürek iadesi | Maliyetin %50'si |

## Dalgalar

| Değer | |
|---|---|
| İlk dalgaya kadar hazırlık | 20 sn |
| Dalgalar arası | 15 sn (ÇAĞIR ile erkene alınabilir) |
| Tempo | İlk dalgalar tek tek ve seyrek (Dalga 1 = 1 Bebek). 10. ve 15. dalga büyük dalga |
| Toplam elle yazılmış dalga | 15 |
| 15'ten sonra | Sonsuz mod — her turda düşman canı ×(1 + 0.15·n), her 5. tur büyük |
| Bonus enerji | Dalga 5 → +50, Dalga 9 → +75, Dalga 13 → +100 |

---

## Ev aletleri (savunma) — 38 adet

| # | id | Ad | PvZ karşılığı | Fiyat | Bekleme | Can | Hasar | Atış | Özellik |
|---|---|---|---|---|---|---|---|---|---|
| 1 | dynamo | Kollu Dinamo | Ayçiçeği | 50 | 7.5 sn | 300 | – | – | Standart enerji üreteci. 24 sn'de bir 25 enerji. Saldırmaz. |
| 2 | generator | Jeneratör | İkiz Ayçiçeği | 150 | 50 sn | 300 | – | – | Gelişmiş üreteç. Sadece Kollu Dinamo'nun üstüne kurulur, 2 kat enerji. |
| 3 | coffee | Kahve Makinesi | Güneş Mantarı | 25 | 7.5 sn | 300 | – | – | Ucuz üreteç. 24 sn'de bir 15 enerji. Saldırmaz. |
| 4 | toaster | Ekmek Kızartma | Bezelye Atıcı | 100 | 7.5 sn | 300 | 20 | 1.425 sn | Temel atıcı. Şeridi boyunca kızarmış ekmek fırlatır. |
| 5 | lamp | Kollu Lamba | Tekrarlayıcı | 200 | 7.5 sn | 300 | 20 | 1.425 sn | Her seferinde 2 ışık topu atar. |
| 6 | standmixer | Stand Mikser | Makineli Bezelye | 250 | 50 sn | 300 | 20 | 1.425 sn | Her seferinde 4 hamur topu atar. |
| 7 | blender | Blender | Buz Bezelye | 175 | 7.5 sn | 300 | 20 | 1.425 sn | Buzlu meyve suyu. Vurduğu oyuncağı yavaşlatır. |
| 8 | kettle | Su Isıtıcısı | Buz Bezelye (ucuz) | 150 | 7.5 sn | 300 | 15 | 1.425 sn | Kaynar buhar. Daha az hasar, değdiğini yavaşlatır. |
| 9 | popcorn | Mısır Patlatma | Üçlü Atıcı | 325 | 7.5 sn | 300 | 20 | 1.425 sn | 3 şeride birden mısır patlatır. |
| 10 | waffle | Waffle Makinesi | Yıldız Meyvesi | 125 | 7.5 sn | 300 | 20 | 1.425 sn | 5 yöne birden yıldız atar (sağ, sol, çaprazlar, yukarı). |
| 11 | handmixer | El Mikseri | Bölünmüş Bezelye | 125 | 7.5 sn | 300 | 20 | 1.425 sn | Öne 1, arkaya 2 atış. Arkadan geçenleri de vurur. |
| 12 | airfryer | Hava Fritözü | Kaktüs | 125 | 7.5 sn | 300 | 20 | 1.425 sn | Patates dikeni atar, 2 düşmanı birden deler. |
| 13 | canopener | Konserve Açacağı | Korkak Mantar | 25 | 7.5 sn | 300 | 20 | 1.425 sn | Çok ucuz uzun menzilli atıcı. |
| 14 | airpurifier | Hava Temizleyici | Puf Mantarı | 0 | 7.5 sn | 300 | 20 | 1.425 sn | Bedava. Sadece 3 kare ileriye atar. |
| 15 | radio | Eski Radyo | Duman Mantarı | 75 | 7.5 sn | 300 | 20 | 1.425 sn | Ses dalgası 4 kare ilerideki herkesi deler geçer. |
| 16 | washer | Çamaşır Makinesi | Ejder Çiçeği | 150 | 7.5 sn | 300 | 40 | 1 sn | Yakına gelene kapağı açıp vurur. Kısa menzil, ağır hasar. |
| 17 | microwave | Mikrodalga | Duman Mantarı (ağır) | 250 | 11 sn | 300 | 48 | 1.425 sn | Kısa menzilli ışın. Yakına çok ağır hasar verir. |
| 18 | drill | Matkap | Delici | 300 | 14 sn | 300 | 34 | 1.5 sn | Matkap ucu tüm şeridi delip geçer. |
| 19 | sewing | Dikiş Makinesi | Dondurucu | 175 | 8 sn | 300 | 8 | 0.42 sn | İlk dikişte oyuncağı yere sabitler (3 sn). |
| 20 | hairdryer | Saç Kurutma | İtici | 175 | 8 sn | 300 | 20 | 1.6 sn | Sıcak rüzgâr. Oyuncakları geriye doğru iter. |
| 21 | dishwasher | Bulaşık Makinesi | Lahana Fırlatıcı | 100 | 7.5 sn | 300 | 40 | 2.9 sn | Kavisli tabak fırlatır, 40 hasar. |
| 22 | ricecooker | Pirinç Pişirici | Mısır Fırlatıcı | 100 | 7.5 sn | 300 | 20 | 2.9 sn | Pirinç topu atar; bazen yapışkan top atıp 4 sn dondurur. |
| 23 | foodprocessor | Mutfak Robotu | Kavun Fırlatıcı | 300 | 7.5 sn | 300 | 80 | 2.9 sn | Ağır karışım atar, 80 hasar + çevresine sıçrar. |
| 24 | waterdispenser | Su Sebili | Kış Kavunu | 500 | 50 sn | 300 | 80 | 2.9 sn | Buz gibi su bombası. 80 hasar, çevresine sıçrar ve hepsini yavaşlatır. |
| 25 | minifridge | Mini Buzdolabı | Ceviz | 50 | 30 sn | 4000 | – | – | Sağlam duvar. Oyuncakları uzun süre oyalar. |
| 26 | refrigerator | Büyük Buzdolabı | Uzun Ceviz | 125 | 30 sn | 8000 | – | – | Çok sağlam, uzun duvar. Üstünden zıplanamaz. |
| 27 | citrusjuicer | Meyve Sıkacağı | Sarımsak | 50 | 7.5 sn | 400 | – | – | Isıran oyuncak ekşiyip komşu şeride kaçar. |
| 28 | battery | Akü | Kiraz Bombası | 150 | 50 sn | – | 1800 | – | Patlar! 3x3 alandaki her şeyi yok eder. |
| 29 | slowcooker | Yavaş Pişirici | Kıyamet Mantarı | 125 | 50 sn | – | 1800 | – | Dev patlama. 5x5 alandaki her şeyi yok eder. |
| 30 | outlet | Elektrik Prizi | Patates Mayını | 25 | 30 sn | 300 | 1800 | – | 15 sn'de kurulur, üstüne basanı çarpıp yok eder. |
| 31 | paninipress | Tost Makinesi | Kabak | 50 | 30 sn | 300 | 1800 | – | Yakına gelen oyuncağın üstüne atlayıp ezer. |
| 32 | humidifier | Nemlendirici | Buz Mantarı | 75 | 50 sn | – | 20 | – | Sahadaki tüm oyuncakları 4 sn dondurur. |
| 33 | iron | Ütü | Jalapeño | 125 | 50 sn | – | – | – | Şeridin en gerisinden ezip geçer, hepsini tek seferde öldürür. |
| 34 | vacuum | Elektrikli Süpürge | Yutucu | 150 | 7.5 sn | 300 | – | – | 2 kare ilerideki oyuncağı içine çeker, 42 sn sindirir. |
| 35 | fryer | Fritöz | Meşale Ağacı | 175 | 7.5 sn | 300 | – | – | Üstünden geçen mermiler sarı parlar, 2 kat güçlenir. |
| 36 | fan | Vantilatör | Üfleyici | 100 | 7.5 sn | 300 | – | – | Önündeki oyuncakları sürekli geri üfler. |
| 37 | spaceheater | Isıtıcı | Diken Otu | 100 | 7.5 sn | 300 | 20 | 1 sn | Üstünden geçeni saniyede 20 yakar. Oyuncaklar onu yiyemez. |
| 38 | clothessteamer | Giysi Buharlayıcı | Mıknatıs Mantarı | 100 | 7.5 sn | 300 | – | 15 sn | Yakındaki metal oyuncağın kask/kovasını söker (15 sn şarj). |

Bekleme = kartın tekrar kullanılabilmesi için gereken süre. Fiyat/bekleme/can/hasar Plants vs Zombies'ten: alet canı 300, standart mermi 20 hasar / 1.425 sn, Ceviz 4000, Uzun Ceviz 8000, bombalar 1800 hasar.
Jeneratör (İkiz Ayçiçeği) sadece Kollu Dinamo'nun üstüne kurulur. Elektrik Prizi 15 sn'de kurulur, kurulunca yenmez. Isıtıcı (diken) yenmez. Büyük Buzdolabı zıplayanı durdurur.

Yavaşlatma: hızın **%50'si**, **2.5 sn** sürer.
Mermi hızı: **0.62 u/sn**, çarpma toleransı **0.028 u**. (1 u = sahanın tüm genişliği)

### Mermi eşleşmesi
`toaster→toast, waffle→waffle, kettle→steam, fan→wave, hairdryer→wind,
blender→juice, microwave→heat, iron→blast, vacuum→dust, washer→cloth, fryer→fry,
sewing→thread, drill→drillbit, popcorn→popcorn, lamp→heat(sarı), standmixer→choco, handmixer→wave,
airfryer→fry, canopener→thread, airpurifier→dust, dishwasher→cloth, ricecooker→popcorn, foodprocessor→juice(yeşil), waterdispenser→juice(mavi)`

---

## Düşmanlar — 18 adet (6 oyuncak + 12 mobilya)

| # | id | Ad | PvZ karşılığı | Can | Hız (u/sn) | Isırık | Puan | Not |
|---|---|---|---|---|---|---|---|---|
| 1 | doll | Bebek | Normal Zombi | 270 | 0.021 | 50 | 10 | Sıradan, yavaş yürür. |
| 2 | bear | Oyuncak Ayı | Konili Zombi | 640 | 0.021 | 50 | 12 | Dolgun gövde, normalin 2 katından fazla dayanır. |
| 3 | soldier | Kurşun Asker | Kovalı Zombi | 1370 | 0.021 | 50 | 18 | Metal kasklı, çok dayanıklı. Mıknatısla kaskı sökülür. Metal (kask 1100). |
| 4 | jack | Kutudaki Palyaço | Sırıklı Zombi | 500 | 0.04 | 50 | 22 | Hızlı koşar, ilk aletin üstünden bir kez zıplar. Büyük Buzdolabı durdurur. |
| 5 | robot | Kurmalı Robot | Futbolcu Zombi | 1670 | 0.042 | 50 | 28 | Metal gövde, hızlı ve çok dayanıklı. Metal (kask 1400). |
| 6 | train | Hayalet Tren | Dev Zombi | 3000 | 0.017 | 1500 | 80 | PATRON. Aletleri tek darbede ezer. |
| 7 | washingmachine | Çamaşır Makinesi (Düşman) | Buz Arabası | 1350 | 0.02 | 2000 | 25 | Önüne çıkan aleti anında ezer. |
| 8 | table | Masa | Bayraklı Zombi | 270 | 0.026 | 50 | 12 | Büyük dalgaların öncüsü, biraz hızlı. |
| 9 | chair | Sandalye | Cüce Zombi | 270 | 0.035 | 50 | 10 | Hafif ve hızlı. |
| 10 | desklamp | Masa Lambası | Gazeteli Zombi | 420 | 0.021 | 50 | 12 | Abajuru kırılınca sinirlenip koşmaya başlar. |
| 11 | floorlamp | Zemin Lambası | Dansçı Zombi | 500 | 0.026 | 50 | 14 | Uzun boylu, tuhaf adımlar. |
| 12 | armchair | Koltuk | Konili Zombi (yavaş) | 640 | 0.018 | 50 | 14 | Şişman ve yavaş. |
| 13 | television | Televizyon | Kapılı Zombi | 1370 | 0.021 | 50 | 20 | Ekranı kalkan gibi. Mıknatısla sökülür. Metal (kask 1100). |
| 14 | bookshelf | Kitaplık | Ağır Zombi | 1100 | 0.018 | 50 | 20 | Ağır ve dayanıklı. |
| 15 | nightstand | Komodin | Konili Zombi | 640 | 0.021 | 50 | 12 | Çekmeceleriyle korunur. |
| 16 | trashcan | Çöp Kutusu | Çöp Kutulu Zombi | 1370 | 0.021 | 50 | 18 | Metal gövde. Mıknatısla kapağı sökülür. Metal (kask 1100). |
| 17 | coatrack | Portmanto | Cüce Zombi | 270 | 0.032 | 50 | 8 | İnce ama çevik. |
| 18 | dresser | Şifonyer | Ağır Zombi | 1100 | 0.019 | 50 | 20 | Çekmecelerini kalkan yapar. |

Isırık aralığı: **500 ms** (50 hasar = PvZ'deki saniyede 100). Normal hız 0.021 u/sn ≈ kare başına 4.7 sn.

---

## Sürüm geçmişi

### v0.12
- **Izgara hizası düzeltildi**: arka plandaki karoların gerçek köşeleri ölçülerek
  homografi yeniden kuruldu (sağ alt köşe 1085 → 1172, sol alt 72 → 103).
  Artık cihazlar karonun tam ortasına oturuyor, düşmanlar karoları ortalayarak yürüyor.
- Karo içi oturma oranı `footV` 0.86 → 0.70
- Cihaz origin 0.92 → 0.76, düşman origin 0.94 → 0.90

### v0.11
- Seçim ekranında GERİ / BAŞLA düğmelerinin çakışması giderildi
- Mermiler zemin yerine gövde hizasından gidiyor
- Alınamayan kartlar daha okunur (soluklaştırma azaltıldı)

### v0.10 — ilk sürüm
- 6×10 perspektif saha, arka plandaki çizili karolarla birebir hizalı
- 15 ev aleti, 6 oyuncak, 15 mermi, şimşek toplama
- 9 kartlık ekip seçimi (30 içinden)
- 15 dalga + sonsuz mod, 3 can, kürek, duraklat, erken dalga çağırma
- Tek doku atlası, tam havuzlu nesne yönetimi, fizik motoru yok
- WebAudio ile üretilen ses efektleri (0 KB)

### v0.13
- Ütü kule modundan çıktı: basılan şeridin en gerisinden sağa sweeping silindir saldırısı yapar, yoldaki tüm düşmanları ezer (görsel deformasyon)
- Ütü fiyatı 175 → 125
- Oyun bitince ekran hemen gelir (700 ms gecikme → 180 ms)
- Şimşek temizliğinde null-check eklendi (Chrome crash düzeltmesi)
- Düşmanlar sızdığında kapıya koşar; kapının sol duvarına değince kaybolur
- Sağ alt köşeye oynanırken sürüm numarası eklendi

### v0.14
- 15 yeni ev aleti (Pirinç Pişirici … Su Sebili) ve 14 mobilya düşman (Buzdolabı … Şifonyer) atlasa eklendi; **Buzdolabı diğerlerinin 2 katı büyük**. Şimdilik sadece model + isim, özellikler sonra verilecek; mobilyalar dalgalara henüz girmiyor
- Seçim ekranı 10×3 kart ile 30 aleti gösterir
- Waffle → Starfruit (5 yöne yıldız), Vantilatör → sürekli geri iten (100), Blender → buz mermisi (175), Ütü bekleme 50 sn, Süpürge → Chomper, Çamaşır Makinesi → yakın kapak vuruşu, Fritöz → ateş ağacı, Dikiş Makinesi → sabitleme, Mısır Patlatma → 3 şerit
- Vantilatör modelinin kırpık alt kısmı (direk + taban) tamamlandı; Çamaşır Makinesi karesindeki artık parça silindi

### v0.15
- 6 yeni model: Jeneratör (İkiz Ayçiçeği, Dinamo'nun üstüne), Kollu Dinamo (Ayçiçeği 50, saldırmaz), Eski Radyo (Duman Mantarı), Akü (Kiraz Bombası), Elektrik Prizi (Patates Mayını), Kollu Lamba (Tekrarlayıcı)
- Mini Buzdolabı = Ceviz (50), Büyük Buzdolabı = Uzun Ceviz (125); ikisi düşman listesinden alet listesine geçti
- 15 yer tutucu alete PvZ özelliği verildi (Stand Mikser = Makineli, Bulaşık = Lahana, Pirinç = Mısır, Mutfak Robotu = Kavun, Su Sebili = Kış Kavunu, Tost = Kabak, Nemlendirici = Buz Mantarı, Yavaş Pişirici = Kıyamet Mantarı, Isıtıcı = Diken Otu, Meyve Sıkacağı = Sarımsak, Giysi Buharlayıcı = Mıknatıs, Hava Temizleyici = Puf Mantarı, Konserve Açacağı = Korkak Mantar, El Mikseri = Bölünmüş Bezelye, Hava Fritözü = Kaktüs)
- Kahve Makinesi artık Güneş Mantarı (25, +15, saldırmaz)
- Düşmanlar PvZ zombilerine göre: can (270/640/1370/1670/3000), hız 0.021, ısırık 50; mobilyalar dalgalara girdi
- Dalgalar PvZ temposunda: başta tek tek ve yavaş, hazırlık 20 sn, başlangıç enerjisi 50
- Seçim ekranı 10×4

### v0.16
- "Telefonu yatay çevir" uyarısı kaldırıldı
- Menüye TAM EKRAN tuşu eklendi: basınca tam ekran olur ve ekran yataya kilitlenir (Android/Chrome). Tekrar basınca çıkar

### v0.17
- Aletler artık karonun içine oturuyor: karonun %80 genişliğine / %88 boyuna sığdırılır, tabanı karonun alt kenarının hemen üstünde (çizgi üstünde durmuyor). Büyük Buzdolabı 1.5 kat uzun
- Üst kart barı arka plandaki cam yuvalara göre yeniden ölçüldü (başlangıç 340, aralık 86) — kartlar sağa kaydı, ikonlar küçüldü ve yuvaya sığıyor

### v0.18
- Arka plandaki 60 karo tek tek ölçüldü (çizim tam perspektif değil, arka sıralarda kayma vardı). Aletler artık ölçülmüş karonun tam ortasına oturuyor (genişliğin %85'i, boyun %95'i)
- Dokunma ve yeşil/kırmızı karo vurgusu da ölçülmüş karolara göre

### v0.19
- Aletler, düşmanlar, mermiler ve silindir hep birlikte yukarı kaydırıldı: ön sırada 20 px, arka sıraya doğru perspektifle azalarak (~11 px). Ayar: `GRID.yukari`
