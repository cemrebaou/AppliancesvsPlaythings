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
      .setOrigin(0.5, 0.92)
      .setActive(false)
      .setVisible(false);
    this.canli = false;
  }

  kur(veri, row, col, x, y, olcek) {
    this.veri = veri;
    this.row = row; this.col = col;
    this.can = veri.can;
    this.maxCan = veri.can;
    this.atisSayac = veri.atisMs * 0.4;
    this.uretimSayac = veri.uretimMs || 0;
    this.atisKare = 0;
    this.canli = true;

    const s = this.sprite;
    s.setFrame(veri.id + '_0');
    s.setPosition(x, y);
    s.setScale(olcek * (veri.olcek || 1));
    s.setDepth(DEPTH.field + y);
    s.clearTint();
    s.setAlpha(1);
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
      if (this.atisKare <= 0) this.sprite.setFrame(this.veri.id + '_0');
    }
  }

  oldur() {
    this.canli = false;
    this.sprite.setActive(false).setVisible(false);
  }
}
