/**
 * Projectile.js — şerit içinde sağa giden mermi.
 * Fizik motoru kullanılmaz; sadece u ekseninde ilerler, çarpışma şerit içinde taranır.
 */
import { DEPTH } from '../config/GameConfig.js';
import { K } from '../core/Keys.js';
import { BULLET_SCALE } from '../config/ApplianceData.js';

export class Projectile {
  constructor(scene) {
    /** delici mermilerde aynı düşmanı iki kez vurmamak için — havuzda tekrar kullanılır */
    this.vurulanlar = new Set();
    this.sprite = scene.add.image(0, 0, K.atlas, 'toast')
      .setOrigin(0.5, 0.5)
      .setDepth(DEPTH.projectile)
      .setActive(false)
      .setVisible(false);
    this.canli = false;
  }

  kur(veri, row, u, olcek, yon = 1) {
    this.row = row;
    this.u = u;
    this.yon = yon;
    // Kısa menzilli atıcıların mermisi menzil sonunda söner
    this.menzilSon = (veri.menzilU && veri.menzilU < 1) ? u + veri.menzilU + 0.03 : 1.14;
    this.hasar = veri.hasar;
    this.kalanDelme = veri.delici || 1;
    this.yavaslat = !!veri.yavaslat;
    this.iter = veri.iter || 0;
    this.ceker = veri.ceker || 0;
    this.patlama = veri.patlama || 0;
    this.sabitle = veri.sabitle || 0;
    this.guclu = false;
    this.sahipU = u;
    this.canli = true;

    const s = this.sprite;
    s.setFrame(veri.mermi);
    s.setScale(olcek * (BULLET_SCALE[veri.mermi] || 0.6));
    s.setFlipX(yon < 0);
    s.clearTint();
    if (veri.mermiRenk) s.setTint(veri.mermiRenk);
    s.setActive(true).setVisible(true);
    return this;
  }

  oldur() {
    this.canli = false;
    this.sprite.setActive(false).setVisible(false);
  }
}
