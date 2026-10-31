/**
 * FieldSystem.js
 * Oyunun sıcak döngüsü. Cihazlar, düşmanlar, mermiler ve şimşekler burada yaşar.
 *
 * OPTİMİZASYON NOTLARI
 *  - Her şey şeritlere (lane) bölünmüştür; çarpışma taraması sadece aynı şerit içinde yapılır.
 *  - Tüm nesneler havuzludur (Pool); oyun sırasında new/destroy çağrılmaz -> GC takılması yok.
 *  - Dizi silme işlemleri swap-remove ile O(1).
 *  - Perspektif hesapları Grid içinde önceden tablolanmıştır.
 *  - Phaser fizik motoru hiç kullanılmaz.
 */

import { Pool } from '../core/Pool.js';
import { Appliance } from '../entities/Appliance.js';
import { Toy } from '../entities/Toy.js';
import { Projectile } from '../entities/Projectile.js';
import { Spark } from '../entities/Spark.js';
import { BALANCE, DEPTH, GRID } from '../config/GameConfig.js';
import { Ses } from '../core/Audio.js';

const CIHAZ_TABAN_OLCEK = 0.78;
const DUSMAN_TABAN_OLCEK = 0.80;
const MERMI_TABAN_OLCEK = 1.0;
const MERMI_Y_OFSET = 44;   // merminin zeminden yüksekliği (gövde hizası)

export class FieldSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../core/Grid.js').Grid} grid
   * @param {object} olaylar { dusmanOldu, sizdi, enerjiAlindi }
   */
  constructor(scene, grid, olaylar) {
    this.scene = scene;
    this.grid = grid;
    this.olaylar = olaylar;

    this.cihazHavuz = new Pool(() => new Appliance(scene), 12);
    this.dusmanHavuz = new Pool(() => new Toy(scene), 24);
    this.mermiHavuz = new Pool(() => new Projectile(scene), 48);
    this.simsekHavuz = new Pool(() => this._simsekUret(), 10);

    this.seritler = [];
    for (let r = 0; r < grid.rows; r++) {
      this.seritler.push({
        dusmanlar: [],
        mermiler: [],
        cihazlar: new Array(grid.cols).fill(null)
      });
    }
    this.olenler = [];     // ölüm animasyonu oynayan düşmanlar
    this.duraklat = false;
  }

  _simsekUret() {
    const s = new Spark(this.scene);
    s.sprite.on('pointerdown', () => {
      if (!s.canli) return;
      this.olaylar.enerjiAlindi(s.deger, s.sprite.x, s.sprite.y);
      Ses.toplama();
      s.oldur();
      this.simsekHavuz.birak(s);
    });
    return s;
  }

  // ------------------------------------------------------------------ yerleşim

  bos(row, col) {
    return !this.seritler[row].cihazlar[col];
  }

  yerlestir(veri, row, col) {
    if (!this.bos(row, col)) return null;
    const p = this.grid.hucreMerkez(row, col);
    const olcek = this.grid.olcek(row) * CIHAZ_TABAN_OLCEK;
    const a = this.cihazHavuz.al().kur(veri, row, col, p.x, p.y, olcek);
    a.u = this.grid.sutunU(col);
    this.seritler[row].cihazlar[col] = a;
    return a;
  }

  sok(row, col) {
    const a = this.seritler[row].cihazlar[col];
    if (!a) return null;
    this.seritler[row].cihazlar[col] = null;
    a.oldur();
    this.cihazHavuz.birak(a);
    return a.veri;
  }

  _cihazYikil(a) {
    this.seritler[a.row].cihazlar[a.col] = null;
    a.oldur();
    this.cihazHavuz.birak(a);
  }

  // ------------------------------------------------------------------ düşman

  dusmanEkle(veri, row, zorluk = 1) {
    const olcek = this.grid.olcek(row) * DUSMAN_TABAN_OLCEK;
    const t = this.dusmanHavuz.al().kur(veri, row, 1.1, olcek, zorluk);
    this.seritler[row].dusmanlar.push(t);
    return t;
  }

  get dusmanSayisi() {
    let n = 0;
    for (let r = 0; r < this.seritler.length; r++) n += this.seritler[r].dusmanlar.length;
    return n;
  }

  // ------------------------------------------------------------------ şimşek

  simsekBirak(x, y, hedefY, deger, zipla) {
    this.simsekHavuz.al().kur(x, y, hedefY, deger, zipla);
  }

  // ------------------------------------------------------------------ döngü

  guncelle(dt) {
    if (this.duraklat) return;
    const dts = dt / 1000;
    const grid = this.grid;

    for (let r = 0; r < this.seritler.length; r++) {
      const lane = this.seritler[r];
      this._cihazlariGuncelle(lane, r, dt);
      this._dusmanlariGuncelle(lane, r, dt, dts);
      this._mermileriGuncelle(lane, r, dts);
    }

    this._olenleriGuncelle(dt);
    this._simsekleriGuncelle(dt, dts);
  }

  // --- cihazlar: hedef arar, ateş eder, enerji üretir
  _cihazlariGuncelle(lane, r, dt) {
    const cihazlar = lane.cihazlar;
    for (let c = 0; c < cihazlar.length; c++) {
      const a = cihazlar[c];
      if (!a) continue;
      a.guncelle(dt);
      const v = a.veri;

      // enerji üreteci
      if (v.rol === 'uretec') {
        a.uretimSayac -= dt;
        if (a.uretimSayac <= 0) {
          a.uretimSayac = v.uretimMs;
          const p = this.grid.hucreMerkez(r, c);
          this.simsekBirak(p.x, p.y - 40, p.y - 6, v.uretimDeger, true);
          a.atesEttiGoster();
        }
      }

      if (!v.mermi || v.hasar <= 0) continue;

      a.atisSayac -= dt;
      if (a.atisSayac > 0) continue;

      // menzilde düşman var mı?
      if (!this._hedefVar(r, a.u, v)) continue;

      a.atisSayac = v.atisMs;
      a.atesEttiGoster();
      Ses.atis();

      const seritler = v.seritler || [0];
      for (let i = 0; i < seritler.length; i++) {
        const hr = r + seritler[i];
        if (hr < 0 || hr >= this.seritler.length) continue;
        this._mermiAt(v, hr, a.u + 0.012);
      }
    }
  }

  _hedefVar(r, u, v) {
    const seritler = v.seritler || [0];
    const menzil = v.menzilU;
    for (let i = 0; i < seritler.length; i++) {
      const hr = r + seritler[i];
      if (hr < 0 || hr >= this.seritler.length) continue;
      const list = this.seritler[hr].dusmanlar;
      for (let j = 0; j < list.length; j++) {
        const d = list[j];
        if (d.u >= u - 0.01 && d.u <= u + menzil) return true;
      }
    }
    return false;
  }

  _mermiAt(v, row, u) {
    const olcek = this.grid.olcek(row) * MERMI_TABAN_OLCEK;
    const m = this.mermiHavuz.al().kur(v, row, u, olcek);
    m.delici = m.kalanDelme > 1;
    if (m.delici) m.vurulanlar.clear();
    const p = this.grid.seritNokta(row, u);
    m.sprite.setPosition(p.x, p.y - MERMI_Y_OFSET * this.grid.olcek(row));
    this.seritler[row].mermiler.push(m);
  }

  // --- düşmanlar: yürür, yer, zıplar
  _dusmanlariGuncelle(lane, r, dt, dts) {
    const list = lane.dusmanlar;
    const grid = this.grid;
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];

      if (t.tintKalan > 0) {
        t.tintKalan -= dt;
        if (t.tintKalan <= 0) t.sprite.clearTint();
      }

      // zıplama
      if (t.ziplaKalan > 0) {
        t.ziplaKalan -= dt;
        const o = 1 - Math.max(0, t.ziplaKalan) / 480;
        t.u = t.ziplaBasU - t.veri.ziplaU * o;
        t.yOfset = -Math.sin(o * Math.PI) * 52 * grid.olcek(r);
        if (t.ziplaKalan <= 0) { t.yOfset = 0; t.ziplaSayac = t.veri.ziplaMs; }
      } else {
        if (t.veri.zipla) {
          t.ziplaSayac -= dt;
        }
        if (t.yavasKalan > 0) t.yavasKalan -= dt;

        // önünde cihaz var mı?
        const c = grid.uSutun(t.u - 0.022);
        const hedef = (t.u - 0.022 >= 0) ? lane.cihazlar[c] : null;

        if (hedef && hedef.canli) {
          if (t.veri.zipla && t.ziplaSayac <= 0) {
            t.zipla();
          } else {
            t.yiyor = hedef;
            t.isirikSayac -= dt;
            if (t.isirikSayac <= 0) {
              t.isirikSayac = BALANCE.dusmanYemeHasariMs;
              Ses.carpma();
              if (hedef.hasarAl(t.veri.isirik)) this._cihazYikil(hedef);
            }
          }
        } else {
          t.yiyor = null;
          const carp = t.yavasKalan > 0 ? BALANCE.yavaslatmaOrani : 1;
          t.u -= t.hiz * carp * dts;
        }
      }

      // ekran konumu
      const p = grid.seritNokta(r, t.u);
      const s = t.sprite;
      s.x = p.x; s.y = p.y + t.yOfset;
      s.setDepth(DEPTH.field + p.y);

      // sızdı mı?
      if (t.u < -0.03) {
        this._dusmaniCikar(lane, i);
        this.olaylar.sizdi(t);
        continue;
      }
      if (t.can <= 0) {
        this._dusmaniCikar(lane, i);
        this._olumBasla(t);
        this.olaylar.dusmanOldu(t);
      }
    }
  }

  _dusmaniCikar(lane, i) {
    const list = lane.dusmanlar;
    const son = list.length - 1;
    const t = list[i];
    if (i !== son) list[i] = list[son];
    list.pop();
    return t;
  }

  _olumBasla(t) {
    t.canli = false;
    t.olum = 280;
    t.sprite.setTint(0x773344);
    this.olenler.push(t);
    Ses.olum();
  }

  _olenleriGuncelle(dt) {
    const arr = this.olenler;
    for (let i = arr.length - 1; i >= 0; i--) {
      const t = arr[i];
      t.olum -= dt;
      const o = Math.max(0, t.olum) / 280;
      t.sprite.setAlpha(o);
      t.sprite.y -= dt * 0.03;
      t.sprite.rotation = (1 - o) * 0.9;
      if (t.olum <= 0) {
        t.sprite.rotation = 0;
        t.oldur();
        this.dusmanHavuz.birak(t);
        const son = arr.length - 1;
        if (i !== son) arr[i] = arr[son];
        arr.pop();
      }
    }
  }

  // --- mermiler
  _mermileriGuncelle(lane, r, dts) {
    const list = lane.mermiler;
    const dusmanlar = lane.dusmanlar;
    const grid = this.grid;
    const carpU = BALANCE.mermiCarpmaU;

    for (let i = list.length - 1; i >= 0; i--) {
      const m = list[i];
      m.u += BALANCE.mermiHizU * dts;

      if (m.u > 1.14) { this._mermiCikar(list, i); continue; }

      const p = grid.seritNokta(r, m.u);
      m.sprite.x = p.x;
      m.sprite.y = p.y - MERMI_Y_OFSET * grid.olcek(r);

      // çarpışma: sadece bu şeritteki düşmanlar
      for (let j = dusmanlar.length - 1; j >= 0; j--) {
        const d = dusmanlar[j];
        if (d.can <= 0) continue;
        if (Math.abs(d.u - m.u) > carpU) continue;
        if (m.delici && m.vurulanlar.has(d)) continue;

        d.hasarAl(m.hasar);
        if (m.yavaslat) d.yavaslat();
        if (m.iter) d.it(m.iter);
        if (m.ceker) d.cek(m.ceker, m.sahipU + 0.05);
        if (m.patlama) this._alanHasari(lane, m.u, m.patlama, m.hasar * 0.5, d);

        if (m.delici) m.vurulanlar.add(d);
        m.kalanDelme--;
        if (m.kalanDelme <= 0) { this._mermiCikar(list, i); break; }
      }
    }
  }

  _alanHasari(lane, u, yaricap, hasar, haric) {
    const list = lane.dusmanlar;
    for (let i = 0; i < list.length; i++) {
      const d = list[i];
      if (d === haric) continue;
      if (Math.abs(d.u - u) <= yaricap) d.hasarAl(hasar);
    }
  }

  _mermiCikar(list, i) {
    const m = list[i];
    const son = list.length - 1;
    if (i !== son) list[i] = list[son];
    list.pop();
    m.oldur();
    this.mermiHavuz.birak(m);
  }

  // --- şimşekler
  _simsekleriGuncelle(dt, dts) {
    const arr = this.simsekHavuz.aktif;
    for (let i = arr.length - 1; i >= 0; i--) {
      const s = arr[i];
      const sp = s.sprite;

      if (!s.dustu) {
        if (s.vz !== 0) {
          s.vz += 900 * dts;
          s.y += s.vz * dts;
          s.x += s.vx * dts;
          if (s.vz > 0 && s.y >= s.hedefY) { s.y = s.hedefY; s.dustu = true; }
        } else {
          s.y += BALANCE.simsekDususHizi * dts;
          if (s.y >= s.hedefY) { s.y = s.hedefY; s.dustu = true; }
        }
        sp.setPosition(s.x, s.y);
      } else {
        s.faz += dts * 4;
        sp.y = s.y + Math.sin(s.faz) * 3;
        s.yasam -= dt;
        if (s.yasam < 1200) sp.setAlpha(Math.max(0, s.yasam / 1200));
        if (s.yasam <= 0) {
          s.oldur();
          this.simsekHavuz.birakIndex(i);
        }
      }
    }
  }

  // ------------------------------------------------------------------ temizlik

  temizle() {
    for (let r = 0; r < this.seritler.length; r++) {
      const lane = this.seritler[r];
      for (let i = lane.dusmanlar.length - 1; i >= 0; i--) {
        const t = lane.dusmanlar[i]; t.oldur(); this.dusmanHavuz.birak(t);
      }
      lane.dusmanlar.length = 0;
      for (let i = lane.mermiler.length - 1; i >= 0; i--) {
        const m = lane.mermiler[i]; m.oldur(); this.mermiHavuz.birak(m);
      }
      lane.mermiler.length = 0;
      for (let c = 0; c < lane.cihazlar.length; c++) {
        const a = lane.cihazlar[c];
        if (a) { a.oldur(); this.cihazHavuz.birak(a); lane.cihazlar[c] = null; }
      }
    }
    for (let i = this.olenler.length - 1; i >= 0; i--) {
      const t = this.olenler[i]; t.oldur(); this.dusmanHavuz.birak(t);
    }
    this.olenler.length = 0;
    this.simsekHavuz.hepsiniBirak(s => s.oldur());
  }
}
