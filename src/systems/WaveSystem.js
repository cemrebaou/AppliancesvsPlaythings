/**
 * WaveSystem.js
 * Dalgaları zamanlar ve düşmanları sahaya salar.
 * Zamanlayıcı nesnesi kullanmaz; tek bir sayaçla ilerler (ucuz ve duraklatılabilir).
 */
import { dalgaAl, TOPLAM_DALGA } from '../config/LevelData.js';
import { TOY_BY_ID } from '../config/ToyData.js';
import { BALANCE } from '../config/GameConfig.js';

export class WaveSystem {
  constructor(saha, satirSayisi, olaylar) {
    this.saha = saha;
    this.satirSayisi = satirSayisi;
    this.olaylar = olaylar;   // { dalgaBasladi, dalgaBitti, hepsiBitti }
    this.sifirla();
  }

  sifirla() {
    this.dalgaNo = -1;
    this.kuyruk = [];
    this.sayac = BALANCE.hazirlikSuresiMs;
    this.dalgaAktif = false;
    this.bitti = false;
    this.sonSerit = -1;
  }

  get gorunenDalga() { return this.dalgaNo + 1; }
  get toplam() { return TOPLAM_DALGA; }

  _dalgaKur(n) {
    const d = dalgaAl(n);
    this.zorluk = d.zorlukCarpani || 1;
    const kuyruk = [];
    let t = 0;
    for (const g of d.gruplar) {
      let yerel = t;
      for (let i = 0; i < g.adet; i++) {
        kuyruk.push({ t: yerel, toy: g.toy });
        yerel += g.araMs;
      }
      t += 900;   // gruplar hafif kaydırılarak başlar
    }
    kuyruk.sort((a, b) => a.t - b.t);
    this.kuyruk = kuyruk;
    this.gecen = 0;
    this.indeks = 0;
    this.dalgaAktif = true;
    this.bonus = d.bonusEnerji || 0;
    this.olaylar.dalgaBasladi(n, d);
  }

  _seritSec() {
    // Aynı şeride üst üste gelmesin diye basit bir dağıtım.
    let r = (Math.random() * this.satirSayisi) | 0;
    if (r === this.sonSerit) r = (r + 1 + ((Math.random() * (this.satirSayisi - 1)) | 0)) % this.satirSayisi;
    this.sonSerit = r;
    return r;
  }

  guncelle(dt) {
    if (this.bitti) return;

    if (!this.dalgaAktif) {
      this.sayac -= dt;
      if (this.sayac <= 0) {
        this.dalgaNo++;
        this._dalgaKur(this.dalgaNo);
      }
      return;
    }

    this.gecen += dt;
    while (this.indeks < this.kuyruk.length && this.kuyruk[this.indeks].t <= this.gecen) {
      const e = this.kuyruk[this.indeks++];
      const veri = TOY_BY_ID[e.toy];
      if (veri) this.saha.dusmanEkle(veri, this._seritSec(), this.zorluk);
    }

    if (this.indeks >= this.kuyruk.length && this.saha.dusmanSayisi === 0) {
      this.dalgaAktif = false;
      this.sayac = BALANCE.dalgaArasiMs;
      this.olaylar.dalgaBitti(this.dalgaNo, this.bonus);
    }
  }

  /** Oyuncu "Dalgayı başlat" derse bekleme süresini bitirir. */
  hemenBaslat() {
    if (!this.dalgaAktif) this.sayac = 0;
  }

  get kalanBeklemeMs() { return this.dalgaAktif ? 0 : Math.max(0, this.sayac); }
}
