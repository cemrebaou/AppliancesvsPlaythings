/**
 * Fx.js — "+25" gibi yükselip sönen küçük yazılar. Havuzlu, tween kullanmaz.
 */
import { DEPTH } from '../config/GameConfig.js';
import { Pool } from '../core/Pool.js';

export class Fx {
  constructor(scene) {
    this.scene = scene;
    this.havuz = new Pool(() => scene.add.text(0, 0, '', {
      fontFamily: 'Verdana, Arial, sans-serif', fontSize: '20px',
      color: '#ffe36e', stroke: '#2b1a10', strokeThickness: 4
    }).setOrigin(0.5).setDepth(DEPTH.fx).setActive(false).setVisible(false), 8);
  }

  yaz(x, y, metin, renk = '#ffe36e') {
    const t = this.havuz.al();
    t.setText(metin).setColor(renk).setPosition(x, y)
      .setAlpha(1).setActive(true).setVisible(true);
    t.setData('omur', 700);
    return t;
  }

  guncelle(dt) {
    const a = this.havuz.aktif;
    for (let i = a.length - 1; i >= 0; i--) {
      const t = a[i];
      let o = t.getData('omur') - dt;
      t.setData('omur', o);
      t.y -= dt * 0.045;
      if (o < 300) t.setAlpha(Math.max(0, o / 300));
      if (o <= 0) {
        t.setActive(false).setVisible(false);
        this.havuz.birakIndex(i);
      }
    }
  }

  temizle() {
    this.havuz.hepsiniBirak(t => t.setActive(false).setVisible(false));
  }
}
