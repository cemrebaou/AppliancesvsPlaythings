# Appliances vs Playthings

Öfkeli ev aletleri, karanlık oyuncaklara karşı. Phaser 4 ile yazılmış, mobil
(dokunmatik) için tasarlanmış bir kule savunma oyunu.

**Sürüm:** `v0.10` · **Geliştiren:** Cemre Başoğlu

---

## Oyna

GitHub Pages: `https://cemrebaou.github.io/AppliancesvsPlaythings/`
(Repo ayarlarından Pages → Branch: `main` / `root` seçilmesi yeterli.)

Yerelde çalıştırmak için bir sunucu gerekir (ES modülleri `file://` üzerinden
çalışmaz):

```bash
python3 -m http.server 8080
# tarayıcıda: http://localhost:8080
```

---

## Nasıl oynanır

1. **EKİBİNİ SEÇ** ekranında 15 ev aletinden 9 tanesini seç.
2. Üstteki karttan birine dokun, sonra zemindeki bir karoya dokun → cihaz yerleşir.
3. Gökten ve Kahve Makinesi'nden düşen **şimşeklere dokunarak enerji topla**.
4. Oyuncaklar sağdan gelir, soldan eve girerse **can** kaybedersin. 3 can bitince oyun biter.
5. **KÜREK** düğmesi açıkken bir cihaza dokunursan sökülür ve maliyetin yarısı geri gelir.
6. **ÇAĞIR** dalgayı erken başlatır, **DUR** oyunu duraklatır.

15 dalga bitince ev kurtulur; sonrasında sonsuz mod açılır.

---

## Klasör yapısı

```
AppliancesvsPlaythings/
├── index.html                 # tek giriş noktası
├── assets/
│   ├── atlas.webp             # tüm sprite'lar tek doku atlasında (76 kare)
│   ├── atlas.json             # atlas tanımı
│   └── bg_room.jpg            # oda arka planı (ızgara arka plana çizili)
├── vendor/
│   └── phaser.esm.min.js      # Phaser 4.2.1 (CDN'e bağımlı değil, çevrimdışı çalışır)
└── src/
    ├── main.js                # Phaser kurulumu
    ├── config/                # SADECE VERİ — denge ayarı burada yapılır
    │   ├── GameConfig.js      # sürüm, çözünürlük, ızgara köşeleri, denge sabitleri
    │   ├── ApplianceData.js   # 15 ev aleti
    │   ├── ToyData.js         # 6 oyuncak düşman
    │   └── LevelData.js       # 15 dalga + sonsuz mod üreteci
    ├── core/
    │   ├── Keys.js            # varlık/sahne anahtarları
    │   ├── Grid.js            # perspektif ızgara (homografi), önceden tablolanmış
    │   ├── Pool.js            # nesne havuzu
    │   ├── Save.js            # localStorage
    │   └── Audio.js           # WebAudio ile üretilen ses efektleri (dosya yok)
    ├── entities/              # Appliance / Toy / Projectile / Spark
    ├── systems/               # FieldSystem (sıcak döngü) / WaveSystem / EnergySystem
    ├── ui/                    # SeedBar / Hud / Fx
    └── scenes/                # Boot / Preload / Menu / Select / Game / Over
```

---

## Optimizasyon

Oyun bilerek "ağır olmayacak" şekilde kurgulandı:

| Konu | Yaklaşım |
|---|---|
| Ağ isteği | Sadece **2 varlık isteği**: `atlas.webp` + `bg_room.jpg` |
| Doku | Tüm sprite'lar **tek 2048×512 atlasta** → tek doku bağlama, az draw call |
| Bellek | **Tüm nesneler havuzlu** (`Pool`). Oyun sırasında `new` / `destroy` yok → GC takılması yok |
| Çarpışma | Fizik motoru **hiç kullanılmaz**. Şerit (lane) bazlı tarama: mermi sadece kendi şeridindeki düşmanlara bakar |
| Dizi işlemi | Silme işlemleri **swap-remove** ile O(1) |
| Perspektif | Homografi ve satır ölçekleri **başta bir kez hesaplanır**, tabloya yazılır |
| Metin | HUD metinleri değer değişmediği sürece `setText` çağırmaz |
| Ses | Ses dosyası yok; efektler **WebAudio ile anlık üretilir** (0 KB indirme) |
| Kare | `delta` 50 ms'de kırpılır → düşük FPS'te fizik sıçraması olmaz |
| Sekme | Arka plana alınınca `loop.sleep()` ile döngü durur (pil tasarrufu) |

Ölçüm (Node, saf mantık): **60 cihaz + 150 düşman** dolu sahada 60 saniyelik
simülasyon toplam **~164 ms**, en kötü kare **~5.7 ms**. Kare bütçesi 16.7 ms.

---

## Mobil

- `Scale.FIT` + `CENTER_BOTH` → her ekran oranına oturur.
- `touch-action: none`, zoom/kaydırma/uzun basma menüsü kapalı.
- Tüm dokunma hedefleri (kart, düğme, şimşek) **görünenden geniş vuruş alanına** sahip.
- Dikey tutulursa "telefonu yatay çevir" uyarısı çıkar.
- Çevrimdışı çalışır (Phaser repo içinde) → Capacitor / Cordova ile doğrudan paketlenebilir.

---

## Varlıklar

Sprite'lar kullanıcının sağladığı sayfalardan otomatik kesilip tek atlasa paketlendi:

- 15 ev aleti × 2 kare (bekleme / saldırı)
- 6 oyuncak × 5 kare (yürüyüş döngüsü)
- 15 mermi ikonu + 1 şimşek

Denge değerleri ve tüm sayılar için `OYUN.md` dosyasına bak.
