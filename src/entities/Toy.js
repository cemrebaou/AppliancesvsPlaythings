/**
 * Toy.js — sağdan sola yürüyen karanlık oyuncak (düşman).
 * Konum `u` (0..1.1) ile tutulur; ekran koordinatı her karede Grid'den okunur.
 */
import { DEPTH, BALANCE } from '../config/GameConfig.js';
import { K, animYuru } from '../core/Keys.js';

export class Toy {
  constructor(scene) {
    this.sprite = scene.add.sprite(0, 0, K.atlas, 'bear_0')
      .setOrigin(0.5, 0.90)
      .setFlipX(true)          // sprite'lar sağa bakıyor, biz sola yürütüyoruz
      .setActive(false)
      .setVisible(false);
    this.canli = false;
  }

  kur(veri, row, u, olcek, zorluk = 1) {
    this.veri = veri;
    this.row = row;
    this.u = u;
    this.maxCan = Math.round(veri.can * zorluk);
    this.can = this.maxCan;
    this.hiz = veri.hizU;
    this.yavasKalan = 0;
    this.yiyor = null;
    this.isirikSayac = 0;
    this.ziplaSayac = veri.ziplaMs || 0;
    this.ziplaKalan = 0;
    this.ziplaBasU = 0;
    this.yOfset = 0;
    this.sabitKalan = 0;
    this.sabitlendi = false;
    this.cekiliyor = false;
    this.canli = true;
    this.temelOlcek = olcek * (veri.olcek || 1);

    const s = this.sprite;
    s.setScale(this.temelOlcek);
    s.clearTint();
    s.setAlpha(1);
    s.setActive(true).setVisible(true);
    s.play(animYuru(veri.id));
    return this;
  }

  hasarAl(miktar) {
    this.can -= miktar * (1 - (this.veri.zirh || 0));
    this.sprite.setTint(0xff9999);
    this.tintKalan = 70;
    return this.can <= 0;
  }

  /** Dikiş makinesi: ilk vuruşta yere sabitler (her düşmana bir kez). */
  sabitle(ms) {
    if (this.sabitlendi) return;
    this.sabitlendi = true;
    this.sabitKalan = ms;
    this.sprite.anims.pause();
  }

  yavaslat() {
    this.yavasKalan = BALANCE.yavaslatmaSuresiMs;
  }

  it(miktar) {
    this.u = Math.min(1.12, this.u + miktar);
  }

  cek(miktar, enAzU) {
    this.u = Math.max(enAzU, this.u - miktar);
  }

  zipla() {
    this.ziplaKalan = 480;
    this.ziplaBasU = this.u;
    this.yiyor = null;
  }

  oldur() {
    this.canli = false;
    this.sprite.setActive(false).setVisible(false);
    this.sprite.stop();
    this.cekiliyor = false;
    this.sabitKalan = 0;
  }
}
