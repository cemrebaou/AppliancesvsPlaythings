# OYUN.md — Appliances vs Playthings denge notları

Sürüm: **v0.12**
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

## Ev aletleri (savunma) — 15 adet

| # | Ad | Fiyat | Can | Hasar | Atış (ms) | Menzil | Özellik |
|---|---|---|---|---|---|---|---|
| 1 | Kahve Makinesi | 50 | 300 | 8 | 3200 | 0.18 | **Enerji üreteci**: 9 sn'de +25 |
| 2 | Ekmek Kızartma | 100 | 300 | 20 | 1450 | tam | Temel atıcı |
| 3 | Waffle Makinesi | 50 | **1600** | 10 | 3000 | 0.35 | **Duvar** |
| 4 | Su Isıtıcısı | 150 | 300 | 14 | 1500 | tam | Yavaşlatır |
| 5 | Vantilatör | 125 | 280 | 11 | 850 | tam | Hızlı atış |
| 6 | Saç Kurutma | 175 | 300 | 16 | 1600 | tam | Geri iter (0.045 u) |
| 7 | Blender | 200 | 300 | 18 | 1700 | tam | 3 düşmanı deler |
| 8 | Mikrodalga | 250 | 340 | **48** | 1400 | 0.32 | Kısa menzil, 2 delme |
| 9 | Ütü | 175 | 320 | **42** | 2600 | tam | Ağır, yavaş |
| 10 | Elektrikli Süpürge | 200 | 300 | 15 | 1500 | 0.9 | Düşmanı çeker (0.035 u) |
| 11 | Çamaşır Makinesi | 225 | 520 | 24 | 2100 | tam | Alan hasarı (0.07 u) |
| 12 | Fritöz | 150 | 300 | 13 | 1800 | 1.0 | **3 şeride** birden atar |
| 13 | Dikiş Makinesi | 175 | 300 | 8 | **420** | tam | Çok hızlı + yavaşlatır |
| 14 | Matkap | 300 | 320 | 34 | 1500 | tam | **Tüm şeridi deler** |
| 15 | Mısır Patlatma | 325 | 360 | 30 | 2400 | tam | Patlama (0.11 u) |

Yavaşlatma: hızın **%50'si**, **2.5 sn** sürer.
Mermi hızı: **0.62 u/sn**, çarpma toleransı **0.028 u**. (1 u = sahanın tüm genişliği)

### Mermi eşleşmesi
`coffee→choco, toaster→toast, waffle→waffle, kettle→steam, fan→wave, hairdryer→wind,
blender→juice, microwave→heat, iron→blast, vacuum→dust, washer→cloth, fryer→fry,
sewing→thread, drill→drillbit, popcorn→popcorn`

---

## Oyuncaklar (düşman) — 6 adet

| Ad | Can | Hız (u/sn) | Zırh | Isırık | Puan | Özellik |
|---|---|---|---|---|---|---|
| Bebek | 150 | 0.052 | — | 22 | 10 | En hızlı |
| Oyuncak Ayı | 190 | 0.032 | — | 26 | 12 | Dengeli |
| Kurşun Asker | 270 | 0.038 | %12 | 30 | 18 | Hafif zırhlı |
| Kutudaki Palyaço | 230 | 0.040 | — | 28 | 22 | **5.2 sn'de bir zıplayıp bir cihazı atlar** |
| Kurmalı Robot | 360 | 0.030 | %30 | 34 | 28 | Metal gövde |
| Hayalet Tren | **1100** | 0.022 | %20 | **70** | 80 | **PATRON** |

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
- 9 kartlık ekip seçimi (15 içinden)
- 15 dalga + sonsuz mod, 3 can, kürek, duraklat, erken dalga çağırma
- Tek doku atlası, tam havuzlu nesne yönetimi, fizik motoru yok
- WebAudio ile üretilen ses efektleri (0 KB)
