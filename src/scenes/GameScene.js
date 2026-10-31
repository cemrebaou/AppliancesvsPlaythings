import Phaser from '../../vendor/phaser.esm.min.js';
import { SCENE, K } from '../core/Keys.js';
import { DESIGN, DEPTH, GRID, BALANCE, COLORS } from '../config/GameConfig.js';
import { APPLIANCE_BY_ID } from '../config/ApplianceData.js';
import { TOPLAM_DALGA } from '../config/LevelData.js';
import { Grid } from '../core/Grid.js';
import { Save } from '../core/Save.js';
import { Ses } from '../core/Audio.js';
import { FieldSystem } from '../systems/FieldSystem.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { EnergySystem } from '../systems/EnergySystem.js';
import { SeedBar } from '../ui/SeedBar.js';
import { Hud } from '../ui/Hud.js';
import { Fx } from '../ui/Fx.js';

const BASLANGIC_CAN = 3;

export class GameScene extends Phaser.Scene {
  constructor() { super(SCENE.game); }

  init(data) {
    this.secilenIdler = (data && data.secilenler) || Save.oku().secilenler;
  }

  create() {
    const W = DESIGN.width, H = DESIGN.height;

    this.add.image(0, 0, K.bg).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg);

    this.grid = new Grid();
    this.fx = new Fx(this);

    this.vurgu = this.add.graphics().setDepth(DEPTH.field - 1);
    this.hayalet = this.add.image(0, 0, K.atlas, 'toaster_0')
      .setOrigin(0.5, 0.92).setAlpha(0.55).setDepth(DEPTH.fx).setVisible(false);

    this.skor = 0;
    this.can = BASLANGIC_CAN;
    this.oyunBitti = false;
    this.durakli = false;
    this.secimVeri = null;
    this.secimIndeks = -1;
    this.kurekModu = false;

    this.saha = new FieldSystem(this, this.grid, {
      dusmanOldu: (t) => {
        this.skor += t.veri.puan;
        this.hud.skor(this.skor);
      },
      sizdi: (t) => this._sizinti(t),
      enerjiAlindi: (n, x, y) => {
        this.enerji.ekle(n);
        this.fx.yaz(x, y - 20, '+' + n);
      }
    });

    this.enerji = new EnergySystem(this.saha, this.grid, (n) => {
      this.hud.enerji(n);
      this.seed.enerjiDegisti(n);
    });

    this.dalga = new WaveSystem(this.saha, this.grid.rows, {
      dalgaBasladi: (n, d) => {
        Ses.dalga();
        this.hud.bilgi(d.ad + ' geliyor!');
        this.hud.dalga(this._dalgaMetni());
      },
      dalgaBitti: (n, bonus) => {
        if (bonus) { this.enerji.ekle(bonus); this.fx.yaz(DESIGN.width / 2, 200, 'Bonus +' + bonus); }
        this.hud.dalga(this._dalgaMetni());
        if (n + 1 >= TOPLAM_DALGA) this._kazandi();
      }
    });

    const veriler = this.secilenIdler.map(id => APPLIANCE_BY_ID[id]).filter(Boolean);
    this.seed = new SeedBar(this, veriler, (v, i) => this._kartSecildi(v, i));

    this.hud = new Hud(this, {
      kurekTiklandi: () => this._kurekDegistir(),
      duraklatTiklandi: () => this._duraklat(),
      dalgaCagir: () => { this.dalga.hemenBaslat(); this.hud.bilgi('Dalga erken çağrıldı!'); }
    });
    this.hud.enerji(this.enerji.enerji);
    this.hud.skor(0);
    this.hud.can(this.can);
    this.seed.enerjiDegisti(this.enerji.enerji);
    this.hud.bilgi('Kartı seç, sonra karoya dokun.', 3200);

    // --- girdi (dokunmatik + fare aynı yol) ---
    this.input.on('pointerdown', (p, ustunde) => {
      if (ustunde && ustunde.length) return;   // kart / şimşek / düğmeye dokunuldu
      this._sahayaDokun(p);
    });
    this.input.on('pointermove', (p) => this._hayaletiTasi(p));
    this.input.keyboard && this.input.keyboard.on('keydown-ESC', () => this._duraklat());

    this.events.on('shutdown', () => this._kapat());
  }

  _dalgaMetni() {
    const n = this.dalga.gorunenDalga;
    return n <= TOPLAM_DALGA ? `Dalga ${n} / ${TOPLAM_DALGA}` : `Sonsuz ${n - TOPLAM_DALGA}`;
  }

  // ------------------------------------------------------------------ girdi

  _kartSecildi(v, i) {
    this.secimVeri = v;
    this.secimIndeks = i;
    this.kurekModu = false;
    this.hud.kurekVurgu(false);
    if (v) {
      this.hayalet.setFrame(v.id + '_0').setVisible(false);
      this.hud.bilgi(v.ad + ' — ' + v.aciklama, 2600);
    } else {
      this.hayalet.setVisible(false);
      this.vurgu.clear();
    }
  }

  _kurekDegistir() {
    this.kurekModu = !this.kurekModu;
    if (this.kurekModu) this.seed.secimiBirak();
    this.hud.kurekVurgu(this.kurekModu);
    this.hayalet.setVisible(false);
    this.vurgu.clear();
  }

  _hayaletiTasi(p) {
    if (this.oyunBitti || this.durakli) return;
    if (!this.secimVeri && !this.kurekModu) return;
    const h = this.grid.hucreBul(p.worldX, p.worldY);
    this.vurgu.clear();
    if (!h) { this.hayalet.setVisible(false); return; }

    const bos = this.saha.bos(h.row, h.col);
    const renk = this.kurekModu ? (bos ? COLORS.kirmizi : COLORS.sari)
      : (bos ? COLORS.yesil : COLORS.kirmizi);
    const k = this.grid.hucreKoseleri(h.row, h.col);
    this.vurgu.fillStyle(renk, 0.22).fillPoints(
      [{ x: k[0], y: k[1] }, { x: k[2], y: k[3] }, { x: k[4], y: k[5] }, { x: k[6], y: k[7] }], true);
    this.vurgu.lineStyle(3, renk, 0.9).strokePoints(
      [{ x: k[0], y: k[1] }, { x: k[2], y: k[3] }, { x: k[4], y: k[5] }, { x: k[6], y: k[7] }], true);

    if (this.secimVeri && bos) {
      const c = this.grid.hucreMerkez(h.row, h.col);
      this.hayalet.setPosition(c.x, c.y)
        .setScale(this.grid.olcek(h.row) * 0.78 * (this.secimVeri.olcek || 1))
        .setVisible(true);
    } else {
      this.hayalet.setVisible(false);
    }
  }

  _sahayaDokun(p) {
    if (this.oyunBitti || this.durakli) return;
    const h = this.grid.hucreBul(p.worldX, p.worldY);
    if (!h) return;

    if (this.kurekModu) {
      const v = this.saha.sok(h.row, h.col);
      if (v) {
        const iade = Math.floor(v.fiyat * BALANCE.kurekIadeOrani);
        this.enerji.ekle(iade);
        const c = this.grid.hucreMerkez(h.row, h.col);
        this.fx.yaz(c.x, c.y - 30, '+' + iade);
        Ses.yerlestir();
      } else { Ses.hata(); }
      return;
    }

    const v = this.secimVeri;
    if (!v) return;

    if (!this.saha.bos(h.row, h.col)) { Ses.hata(); this.hud.bilgi('Burası dolu.'); return; }
    if (!this.seed.kartMusait(this.secimIndeks)) { Ses.hata(); return; }
    if (!this.enerji.harca(v.fiyat)) { Ses.hata(); this.hud.bilgi('Yeterli enerji yok.'); return; }

    this.saha.yerlestir(v, h.row, h.col);
    this.seed.beklemeBaslat(this.secimIndeks);
    Ses.yerlestir();
    this.seed.secimiBirak();
    this.hayalet.setVisible(false);
    this.vurgu.clear();
  }

  // ------------------------------------------------------------------ durum

  _sizinti(t) {
    this.can--;
    this.hud.can(this.can);
    this.cameras.main.shake(220, 0.006);
    if (this.can <= 0) this._kaybetti();
    else this.hud.bilgi('Bir oyuncak eve girdi! Kalan can: ' + this.can, 2600);
  }

  _duraklat() {
    if (this.oyunBitti) return;
    this.durakli = !this.durakli;
    this.saha.duraklat = this.durakli;
    if (this.durakli) {
      this.perde = this.add.rectangle(0, 0, DESIGN.width, DESIGN.height, 0x000000, 0.6)
        .setOrigin(0).setDepth(DEPTH.overlay).setInteractive();
      this.perdeYazi = this.add.text(DESIGN.width / 2, DESIGN.height / 2,
        'DURAKLATILDI\n(devam için dokun)', {
        fontFamily: 'Verdana, Arial, sans-serif', fontSize: '34px', color: '#ffd54a',
        align: 'center', stroke: '#2b1a10', strokeThickness: 6
      }).setOrigin(0.5).setDepth(DEPTH.overlay + 1);
      this.perde.on('pointerdown', () => this._duraklat());
    } else {
      this.perde && this.perde.destroy();
      this.perdeYazi && this.perdeYazi.destroy();
      this.perde = this.perdeYazi = null;
    }
  }

  _bitir(kazandi) {
    if (this.oyunBitti) return;
    this.oyunBitti = true;
    const k = Save.oku();
    Save.yaz({
      enYuksekDalga: Math.max(k.enYuksekDalga, this.dalga.gorunenDalga),
      enYuksekSkor: Math.max(k.enYuksekSkor, this.skor)
    });
    this.time.delayedCall(700, () => {
      this.scene.start(SCENE.over, {
        kazandi, dalga: this.dalga.gorunenDalga, skor: this.skor
      });
    });
  }

  _kaybetti() { Ses.kaybetme(); this._bitir(false); }
  _kazandi() { Ses.zafer(); this._bitir(true); }

  _kapat() {
    this.saha && this.saha.temizle();
    this.fx && this.fx.temizle();
  }

  // ------------------------------------------------------------------ döngü

  update(_zaman, delta) {
    if (this.oyunBitti || this.durakli) return;
    // çok düşük FPS'te fizik sıçramasını engelle
    const dt = delta > 50 ? 50 : delta;

    this.enerji.guncelle(dt);
    this.dalga.guncelle(dt);
    this.saha.guncelle(dt);
    this.seed.guncelle(dt);
    this.hud.guncelle(dt);
    this.fx.guncelle(dt);
  }
}
