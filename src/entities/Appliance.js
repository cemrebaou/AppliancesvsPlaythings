/**
 * Appliance.js — sahaya yerleştirilen ev aleti.
 * Havuzdan geldiği için `destroy` edilmez, `kur/oldur` ile yeniden kullanılır.
 */
import { DEPTH } from '../config/GameConfig.js';
import { K } from '../core/Keys.js';

const ATIS_KARE_MS = 170;

export class Appliance {
  constructor(scene) {
    this.sprite = scene.add.sprite(0, 0, K.atlas, 'toaster_0')
      .setOrigin(0.5, 1)
      .setActive(false)
      .setVisible(false);
    this.canli = false;
  }

  kur(veri, row, col, x, y, olcek) {
    this.veri = veri;
    this.row = row; this.col = col;
    this.can = veri.can || 300;
    this.maxCan = this.can;
    this.atisSayac = (veri.atisMs || 0) * 0.4;
    this.uretimSayac = veri.ilkUretimMs || veri.uretimMs || 0;
    this.seriKalan = 0;
    this.seriSayac = 0;
    this.fitil = veri.fitilMs || 0;
    this.hazirKalan = veri.hazirMs || 0;
    this.hazir = !veri.hazirMs;
    this.ezHedef = null;
    this.ezT = 0;
    this.bekleKare = veri.id + '_0';
    this.atisKare = 0;
    this.durum = 'bekle';     // yutucu: bekle | ceker | cigniyor
    this.hedef = null;
    this.icerik = null;
    this.sindirKalan = 0;
    this.ruzgarSayac = 0;
    this.canli = true;

    const s = this.sprite;
    s.setFrame(veri.id + '_0');
    s.setPosition(x, y);
    this.x0 = x; this.y0 = y;
    this.temelOlcek = olcek;
    s.setScale(this.temelOlcek);
    s.setDepth(DEPTH.field + y);
    s.clearTint();
    s.setAlpha(veri.hazirMs ? 0.75 : 1);
    s.setRotation(0);
    s.setActive(true).setVisible(true);
    return this;
  }

  hasarAl(miktar) {
    this.can -= miktar;
    // Canı azaldıkça kırmızılaşır — ayrı can barı çizmeye gerek kalmaz.
    const o = this.can / this.maxCan;
    if (o < 0.6) {
      const g = Math.max(0, Math.min(255, Math.round(80 + o * 290)));
      this.sprite.setTint((255 << 16) | (g << 8) | g);
    }
    return this.can <= 0;
  }

  atesEttiGoster() {
    this.atisKare = ATIS_KARE_MS;
    this.sprite.setFrame(this.veri.id + '_1');
  }

  guncelle(dt) {
    if (this.atisKare > 0) {
      this.atisKare -= dt;
      if (this.atisKare <= 0) this.sprite.setFrame(this.bekleKare);
    }
  }

  oldur() {
    this.canli = false;
    this.sprite.setActive(false).setVisible(false);
  }
}
