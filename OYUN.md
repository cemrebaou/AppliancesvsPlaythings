# OYUN.md — Appliances vs Playthings denge notları

Sürüm: **v0.14**
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
| Başlangıç enerjisi | 150 |
| Gökten düşen şimşek | 25 enerji, her 7–11 sn'de bir |
| Şimşek yerde kalma | 9 sn (son 1.2 sn'de solar) |
| Kürek iadesi | Maliyetin %50'si |

## Dalgalar

| Değer | |
|---|---|
| İlk dalgaya kadar hazırlık | 12 sn |
| Dalgalar arası | 18 sn (ÇAĞIR ile erkene alınabilir) |
| Toplam elle yazılmış dalga | 15 |
| 15'ten sonra | Sonsuz mod — her turda düşman canı ×(1 + 0.18·n) |
| Bonus enerji | Dalga 5 → +50, Dalga 9 → +75, Dalga 13 → +100 |

---

## Ev aletleri (savunma) — 30 adet

| # | id | Ad | Fiyat | Bekleme | Can | Hasar | Atış | Özellik |
|---|---|---|---|---|---|---|---|---|
| 1 | coffee | Kahve Makinesi | 50 | 7 sn | 300 | 8 | 3.2 sn | Enerji üretir (9 sn'de +25), yakına kahve atar |
| 2 | toaster | Ekmek Kızartma | 100 | 5 sn | 300 | 20 | 1.45 sn | Temel atıcı |
| 3 | waffle | Waffle Makinesi | 125 | 7.5 sn | 300 | 20 | 1.5 sn | Starfruit: 5 yöne yıldız (sağ, sol, sağ-yukarı, sağ-aşağı, sol-yukarı) |
| 4 | kettle | Su Isıtıcısı | 150 | 7 sn | 300 | 14 | 1.5 sn | Yavaşlatır |
| 5 | fan | Vantilatör | 100 | 7.5 sn | 280 | – | – | Blover (kalıcı): menzildekileri sürekli geri üfler |
| 6 | hairdryer | Saç Kurutma | 175 | 8 sn | 300 | 16 | 1.6 sn | Geri iter |
| 7 | blender | Blender | 175 | 7.5 sn | 300 | 20 | 1.45 sn | Snow Pea: mavi buz mermisi, yavaşlatır |
| 8 | microwave | Mikrodalga | 250 | 11 sn | 340 | 48 | 1.4 sn | Kısa menzil, ağır hasar, 2 delme |
| 9 | iron | Ütü | 125 | 50 sn | – | – | – | Silindir (Jalapeño): şeridin gerisinden geçip hepsini ezer, kule koymaz |
| 10 | vacuum | Elektrikli Süpürge | 150 | 7.5 sn | 300 | – | – | Chomper: 2 kare ilerideki düşmanı çeker, yutar (%10 büyür), 42 sn sindirip öldürür |
| 11 | washer | Çamaşır Makinesi | 150 | 7.5 sn | 400 | 45 | 1 sn | Yakın kapak vuruşu (Snapdragon) |
| 12 | fryer | Fritöz | 175 | 7.5 sn | 300 | – | – | Ateş ağacı (Torchwood): geçen mermi sarı parlar, 2x hasar, buzu eritir |
| 13 | sewing | Dikiş Makinesi | 175 | 8 sn | 300 | 8 | 0.42 sn | İlk vuruşta düşmanı 3 sn yere sabitler (düşman başına 1 kez) |
| 14 | drill | Matkap | 300 | 14 sn | 320 | 34 | 1.5 sn | Tüm şeridi deler |
| 15 | popcorn | Mısır Patlatma | 325 | 7.5 sn | 360 | 20 | 1.45 sn | Threepeater: 3 şeride atar |
| 16 | ricecooker | Pirinç Pişirici | 100 | 7 sn | 300 | 15 | 1.5 sn | **Yer tutucu — özellik sonra verilecek** |
| 17 | standmixer | Stand Mikser | 150 | 8 sn | 300 | 18 | 1.2 sn | **Yer tutucu — özellik sonra verilecek** |
| 18 | airfryer | Hava Fritözü | 175 | 9 sn | 300 | 22 | 1.6 sn | **Yer tutucu — özellik sonra verilecek** |
| 19 | dishwasher | Bulaşık Makinesi | 200 | 10 sn | 400 | 20 | 1.8 sn | **Yer tutucu — özellik sonra verilecek** |
| 20 | spaceheater | Isıtıcı | 125 | 7 sn | 280 | 16 | 1.4 sn | **Yer tutucu — özellik sonra verilecek** |
| 21 | humidifier | Nemlendirici | 100 | 6 sn | 260 | 12 | 1.3 sn | **Yer tutucu — özellik sonra verilecek** |
| 22 | airpurifier | Hava Temizleyici | 150 | 7.5 sn | 300 | 14 | 1.1 sn | **Yer tutucu — özellik sonra verilecek** |
| 23 | slowcooker | Yavaş Pişirici | 125 | 8 sn | 350 | 17 | 1.7 sn | **Yer tutucu — özellik sonra verilecek** |
| 24 | canopener | Elektrikli Konserve Açacağı | 75 | 5 sn | 200 | 10 | 0.9 sn | **Yer tutucu — özellik sonra verilecek** |
| 25 | foodprocessor | Mutfak Robotu | 200 | 9 sn | 320 | 24 | 1.3 sn | **Yer tutucu — özellik sonra verilecek** |
| 26 | paninipress | Tost Makinesi | 125 | 7 sn | 280 | 18 | 1.5 sn | **Yer tutucu — özellik sonra verilecek** |
| 27 | handmixer | El Mikseri | 100 | 6 sn | 240 | 13 | 0.8 sn | **Yer tutucu — özellik sonra verilecek** |
| 28 | citrusjuicer | Meyve Sıkacağı | 75 | 5 sn | 200 | 11 | 1.2 sn | **Yer tutucu — özellik sonra verilecek** |
| 29 | clothessteamer | Giysi Buharlayıcı | 125 | 7 sn | 260 | 15 | 1.4 sn | **Yer tutucu — özellik sonra verilecek** |
| 30 | waterdispenser | Su Sebili | 100 | 6 sn | 280 | 8 | 2.5 sn | **Yer tutucu — özellik sonra verilecek** |

Bekleme = kartın tekrar kullanılabilmesi için gereken süre. Fiyat/bekleme eşleşmeleri Plants vs Zombies'ten: Chomper 150$, Jalapeño 125$ (50 sn), Snow Pea 175$, Torchwood 175$, Starfruit 125$, Threepeater 325$, Blover 100$ (7.5 sn).

Yavaşlatma: hızın **%50'si**, **2.5 sn** sürer.
Mermi hızı: **0.62 u/sn**, çarpma toleransı **0.028 u**. (1 u = sahanın tüm genişliği)

### Mermi eşleşmesi
`coffee→choco, toaster→toast, waffle→waffle, kettle→steam, fan→wave, hairdryer→wind,
blender→juice, microwave→heat, iron→blast, vacuum→dust, washer→cloth, fryer→fry,
sewing→thread, drill→drillbit, popcorn→popcorn`

---

## Oyuncaklar (düşman) — 20 adet (6 oyuncak + 14 mobilya)

| # | id | Ad | Can | Hız (u/sn) | Zırh | Isırık | Puan | Not |
|---|---|---|---|---|---|---|---|---|
| 1 | doll | Bebek | 150 | 0.052 | 0 | 22 | 10 |  |
| 2 | bear | Oyuncak Ayı | 190 | 0.032 | 0 | 26 | 12 |  |
| 3 | soldier | Kurşun Asker | 270 | 0.038 | 0.12 | 30 | 18 |  |
| 4 | jack | Kutudaki Palyaço | 230 | 0.04 | 0 | 28 | 22 | Zıplar.  |
| 5 | robot | Kurmalı Robot | 360 | 0.03 | 0.3 | 34 | 28 |  |
| 6 | train | Hayalet Tren | 1100 | 0.022 | 0.2 | 70 | 80 | PATRON.  |
| 7 | refrigerator | Buzdolabı | 500 | 0.025 | 0.1 | 40 | 40 | 2 kare (_0/_1). **2 kat büyük**. Dalgalara girmiyor (özellik sonra) |
| 8 | minifridge | Mini Buzdolabı | 200 | 0.04 | 0 | 25 | 15 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 9 | washingmachine | Çamaşır Makinesi (Düşman) | 320 | 0.03 | 0.15 | 32 | 25 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 10 | table | Masa | 180 | 0.045 | 0 | 20 | 12 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 11 | chair | Sandalye | 140 | 0.055 | 0 | 18 | 10 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 12 | desklamp | Masa Lambası | 120 | 0.06 | 0 | 15 | 8 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 13 | floorlamp | Zemin Lambası | 160 | 0.048 | 0 | 18 | 12 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 14 | armchair | Koltuk | 280 | 0.028 | 0.05 | 28 | 20 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 15 | television | Televizyon | 220 | 0.038 | 0.08 | 24 | 18 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 16 | bookshelf | Kitaplık | 350 | 0.025 | 0.1 | 30 | 25 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 17 | nightstand | Komodin | 150 | 0.05 | 0 | 18 | 12 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 18 | trashcan | Çöp Kutusu | 130 | 0.055 | 0 | 15 | 10 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 19 | coatrack | Portmanto | 100 | 0.065 | 0 | 12 | 8 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |
| 20 | dresser | Şifonyer | 300 | 0.03 | 0.08 | 28 | 22 | 2 kare (_0/_1). Dalgalara girmiyor (özellik sonra) |

Isırık aralığı: **500 ms**.

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
