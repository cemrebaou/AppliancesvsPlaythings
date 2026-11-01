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
import { K } from '../core/Keys.js';
import { Ses } from '../core/Audio.js';

const CIHAZ_TABAN_OLCEK = 0.78;
const DUSMAN_TABAN_OLCEK = 0.80;
const MERMI_TABAN_OLCEK = 1.0;
const MERMI_Y_OFSET = 44;   // merminin zeminden yüksekliği (gövde hizası)

// Kapı: şimşek solun gerisinde kalan alan (arka-sol köşe civarı)
// Düşmanlar sızdıktan sonra buraya doğru koşar ve sol duvarda "kaybolur"
const KAPI_X = 195;  // kapının sol duvar eşiği (bu x'i geçince sprite gizlenir)
const KAPI_HEDEF_X = 225;
const KAPI_HEDEF_Y = 310;

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
        cihazlar: new Array(grid.cols).fill(null),
        silindir: []   // aktif silindir saldırıları
      });
    }
    this.olenler = [];     // ölüm animasyonu oynayan düşmanlar
    this.kacanlar = [];    // sızdıktan sonra kapıya koşan düşmanlar
    this.yildizlar = [];   // Waffle'ın 5 yöne attığı yıldızlar (şeritten bağımsız)
    this.yildizBos = [];   // havuz
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
    // Silindir: kule değil, şeridi boydan boya eziyor
    if (veri.rol === 'silindir') {
      this._silindir(veri, row);
      return null;
    }
    if (!this.bos(row, col)) return null;
    const p = this.grid.hucreMerkez(row, col);
    const olcek = this.grid.olcek(row) * CIHAZ_TABAN_OLCEK;
    const a = this.cihazHavuz.al().kur(veri, row, col, p.x, p.y, olcek);
    a.u = this.grid.sutunU(col);
    this.seritler[row].cihazlar[col] = a;
    return a;
  }

  // Silindir başlatır: şeridin en gerisinden (u=0) sağa doğru ilerler
  _silindir(veri, row) {
    const olcek = this.grid.olcek(row) * (veri.olcek || 1.2);
    const p = this.grid.seritNokta(row, 0);
    const spr = this.scene.add.image(p.x, p.y, K.atlas, 'iron_1')
      .setOrigin(0.5, 0.76)
      .setScale(olcek)
      .setDepth(DEPTH.field + p.y + 5)
      .setTint(0xff8800);
    this.seritler[row].silindir.push({ sprite: spr, u: 0, row, hiz: veri.hizU || 0.55 });
    Ses.atis();
  }

  sok(row, col) {
    const a = this.seritler[row].cihazlar[col];
    if (!a) return null;
    this.seritler[row].cihazlar[col] = null;
    this._yutucuSerbest(a);
    a.oldur();
    this.cihazHavuz.birak(a);
    return a.veri;
  }

  _cihazYikil(a) {
    this.seritler[a.row].cihazlar[a.col] = null;
    this._yutucuSerbest(a);
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
      this._silindirleriGuncelle(lane, r, dts);
    }

    this._yildizlariGuncelle(dts);
    this._olenleriGuncelle(dt);
    this._kacanGuncelle(dt);
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

      // --- özel roller
      if (v.rol === 'ruzgar') { this._ruzgarGuncelle(a, lane, dt); continue; }
      if (v.rol === 'yakin') { this._yakinGuncelle(a, lane, dt); continue; }
      if (v.rol === 'yutucu') { this._yutucuGuncelle(a, lane, r, dt); continue; }
      if (v.rol === 'yildiz') { this._yildizCihazGuncelle(a, r, dt); continue; }
      if (v.rol === 'ates') continue;   // Fritöz: pasif, mermileri güçlendirir

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

  // --- silindir: şeridin solundan sağına kayarak tüm düşmanları ezer
  _silindirleriGuncelle(lane, r, dts) {
    const arr = lane.silindir;
    const grid = this.grid;
    for (let i = arr.length - 1; i >= 0; i--) {
      const sl = arr[i];
      sl.u += sl.hiz * dts;

      const p = grid.seritNokta(r, sl.u);
      sl.sprite.x = p.x;
      sl.sprite.y = p.y;
      sl.sprite.setDepth(DEPTH.field + p.y + 5);
      const olcek = grid.olcek(r) * 1.2;
      sl.sprite.setScale(olcek);

      // düşmanlara çarpıyor mu?
      const dusmanlar = lane.dusmanlar;
      for (let j = dusmanlar.length - 1; j >= 0; j--) {
        const d = dusmanlar[j];
        if (Math.abs(d.u - sl.u) < 0.065) {
          // Ezme efekti: yere yapış
          d.sprite.setScale(d.sprite.scaleX, d.sprite.scaleY * 0.12);
          d.sprite.y += 18 * olcek;
          d.sprite.setTint(0x555555);
          d.can = 0;
          // ölüm listesine değil, direkt temizle (ezildi efekti kısa)
          const son = dusmanlar.length - 1;
          if (j !== son) dusmanlar[j] = dusmanlar[son];
          dusmanlar.pop();
          this._ezildiAnimasyon(d, r);
          this.olaylar.dusmanOldu(d);
          Ses.carpma();
        }
      }

      // Şeridin sonuna ulaşınca kaldır
      if (sl.u > 1.15) {
        sl.sprite.destroy();
        const son = arr.length - 1;
        if (i !== son) arr[i] = arr[son];
        arr.pop();
      }
    }
  }

  // Ezilmiş düşman: yerde yassı kalır kısa süre, sonra yok olur
  _ezildiAnimasyon(t, r) {
    t.canli = false;
    t.olum = 500;          // 500ms yerde kalır
    t.sprite.rotation = (Math.random() - 0.5) * 0.5;
    this.olenler.push(t);
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
      } else if (t.cekiliyor) {
        t.yiyor = null;                     // Süpürge çekiyor, konumu o yönetir
      } else if (t.sabitKalan > 0) {
        t.sabitKalan -= dt;                 // Dikiş makinesi: yere sabit
        t.yiyor = null;
        if (t.sabitKalan <= 0) { t.sprite.anims.resume(); t.sprite.clearTint(); }
        else if (!(t.tintKalan > 0)) t.sprite.setTint(0x66ffcc);
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

      // sızdı mı? → kapıya kaç animasyonu başlat
      if (t.u < -0.03) {
        const son = list.length - 1;
        if (i !== son) list[i] = list[son];
        list.pop();
        // Kapıya koş animasyonuna al (sprite hâlâ görünür)
        t.kapiHedefX = KAPI_HEDEF_X;
        t.kapiHedefY = KAPI_HEDEF_Y;
        this.kacanlar.push(t);
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

  // Kapıya kaçan düşmanları güncelle
  _kacanGuncelle(dt) {
    const dts = dt / 1000;
    const arr = this.kacanlar;
    for (let i = arr.length - 1; i >= 0; i--) {
      const t = arr[i];
      const s = t.sprite;
      const dx = t.kapiHedefX - s.x;
      const dy = t.kapiHedefY - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hiz = 160 * dts;

      if (dist < hiz + 2) {
        // Kapının sol duvarına ulaştı → gizle ve havuza bırak
        t.oldur();
        this.dusmanHavuz.birak(t);
        const son = arr.length - 1;
        if (i !== son) arr[i] = arr[son];
        arr.pop();
      } else {
        s.x += (dx / dist) * hiz;
        s.y += (dy / dist) * hiz;
        // Sol duvara yaklaşınca (kapının çerçevesi arkasına geçince) soldur
        if (s.x < KAPI_X + 30) {
          s.setAlpha(Math.max(0, (s.x - KAPI_X) / 30));
        }
      }
    }
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

      // Ezilenler için özel animasyon (yassı + solma)
      if (t.sprite.scaleY !== undefined && t.sprite.scaleY < t.sprite.scaleX * 0.5) {
        t.sprite.setAlpha(o * 0.8);
      } else {
        t.sprite.setAlpha(o);
        t.sprite.y -= dt * 0.03;
        t.sprite.rotation = (1 - o) * 0.9;
      }

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

      // Fritöz (ateş ağacı): üstünden geçen mermi sarı parlar ve güçlenir
      if (!m.guclu) {
        const c = grid.uSutun(m.u);
        const f = (c >= 0 && c < lane.cihazlar.length) ? lane.cihazlar[c] : null;
        if (f && f.veri.rol === 'ates') {
          m.guclu = true;
          m.hasar *= f.veri.guc || 2;
          m.yavaslat = false;               // ateş buzu eritir
          m.sprite.setTint(0xffd23a);
          f.atesEttiGoster();
        }
      }

      // çarpışma: sadece bu şeritteki düşmanlar
      for (let j = dusmanlar.length - 1; j >= 0; j--) {
        const d = dusmanlar[j];
        if (d.can <= 0) continue;
        if (Math.abs(d.u - m.u) > carpU) continue;
        if (m.delici && m.vurulanlar.has(d)) continue;

        d.hasarAl(m.hasar);
        if (m.yavaslat) d.yavaslat();
        if (m.sabitle) d.sabitle(m.sabitle);
        if (m.iter) d.it(m.iter);
        if (m.ceker) d.cek(m.ceker, m.sahipU + 0.05);
        if (m.patlama) this._alanHasari(lane, m.u, m.patlama, m.hasar * 0.5, d);

        if (m.delici) m.vurulanlar.add(d);
        m.kalanDelme--;
        if (m.kalanDelme <= 0) { this._mermiCikar(list, i); break; }
      }
    }
  }

  // --- Vantilatör: menzildeki oyuncakları sürekli geri üfler
  _ruzgarGuncelle(a, lane, dt) {
    const v = a.veri, dts = dt / 1000;
    const list = lane.dusmanlar;
    let var_ = false;
    for (let j = 0; j < list.length; j++) {
      const d = list[j];
      if (d.u >= a.u - 0.01 && d.u <= a.u + v.menzilU) {
        d.u = Math.min(1.12, d.u + v.itmeU * dts);
        var_ = true;
      }
    }
    a.ruzgarSayac -= dt;
    if (var_ && a.ruzgarSayac <= 0) { a.ruzgarSayac = 240; a.atesEttiGoster(); }
  }

  // --- Çamaşır Makinesi: sadece yakına gelene kapağı açıp vurur
  _yakinGuncelle(a, lane, dt) {
    const v = a.veri;
    a.atisSayac -= dt;
    if (a.atisSayac > 0) return;
    const list = lane.dusmanlar;
    let vurdu = false;
    for (let j = 0; j < list.length; j++) {
      const d = list[j];
      if (d.can <= 0 || d.cekiliyor) continue;
      if (d.u >= a.u - 0.01 && d.u <= a.u + v.menzilU) { d.hasarAl(v.hasar); vurdu = true; }
    }
    if (vurdu) {
      a.atisSayac = v.atisMs;
      a.atesEttiGoster();
      Ses.carpma();
    }
  }

  // --- Elektrikli Süpürge (Chomper): 2 kare ilerideki düşmanı çeker, yutar, sindirir, atar
  _yutucuGuncelle(a, lane, r, dt) {
    const v = a.veri, dts = dt / 1000;
    const id = v.id;

    if (a.durum === 'cigniyor') {
      a.sindirKalan -= dt;
      if (a.sindirKalan <= 0) this._yutucuAt(a, r);
      return;
    }

    if (a.durum === 'ceker') {
      const d = a.hedef;
      const list = lane.dusmanlar;
      const k = d ? list.indexOf(d) : -1;
      if (!d || !d.canli || d.can <= 0 || k < 0) {
        if (d) d.cekiliyor = false;
        a.hedef = null; a.durum = 'bekle';
        a.sprite.setFrame(id + '_0');
        return;
      }
      const hedefU = a.u + 0.04;
      d.u = Math.max(hedefU, d.u - v.cekmeHizU * dts);
      if (d.u <= hedefU + 0.001) {
        // yuttu: düşman sahadan çıkar, içeride bekler; süpürge idle'a döner ve %10 büyür
        const son = list.length - 1;
        if (k !== son) list[k] = list[son];
        list.pop();
        d.sprite.setVisible(false);
        a.icerik = d; a.hedef = null;
        a.durum = 'cigniyor';
        a.sindirKalan = v.sindirMs;
        a.sprite.setFrame(id + '_0');
        a.sprite.setScale(a.temelOlcek * 1.1);
        Ses.carpma();
      }
      return;
    }

    // bekle: menzildeki en yakın oyuncağı seç
    const list = lane.dusmanlar;
    let en = null;
    for (let j = 0; j < list.length; j++) {
      const d = list[j];
      if (d.can <= 0 || d.cekiliyor) continue;
      if (d.u >= a.u - 0.01 && d.u <= a.u + v.menzilU && (!en || d.u < en.u)) en = d;
    }
    if (en) {
      a.durum = 'ceker'; a.hedef = en;
      en.cekiliyor = true; en.yiyor = null;
      a.sprite.setFrame(id + '_1');      // çekerken saldırı karesinde durur
      Ses.atis();
    }
  }

  // sindirme bitti: oyuncağı dışarı atar (ölür)
  _yutucuAt(a, r) {
    const d = a.icerik;
    a.icerik = null; a.durum = 'bekle';
    a.sprite.setScale(a.temelOlcek);
    if (!d) return;
    const p = this.grid.seritNokta(r, a.u + 0.05);
    d.sprite.setPosition(p.x, p.y).setVisible(true);
    d.cekiliyor = false;
    d.can = 0;
    this._olumBasla(d);
    this.olaylar.dusmanOldu(d);
  }

  // süpürge sökülür/yıkılırsa içindeki oyuncak sağ salim serbest kalır
  _yutucuSerbest(a) {
    if (a.hedef) { a.hedef.cekiliyor = false; a.hedef = null; }
    const d = a.icerik;
    if (!d) return;
    a.icerik = null; a.durum = 'bekle';
    d.cekiliyor = false;
    d.u = Math.min(1.1, a.u + 0.03);
    d.sprite.setVisible(true);
    this.seritler[a.row].dusmanlar.push(d);
  }

  // --- Waffle (Starfruit): 5 yöne yıldız
  _yildizCihazGuncelle(a, r, dt) {
    const v = a.veri;
    a.atisSayac -= dt;
    if (a.atisSayac > 0) return;
    if (!this._sahadaDusmanVar()) return;
    a.atisSayac = v.atisMs;
    a.atesEttiGoster();
    Ses.atis();
    const H = BALANCE.mermiHizU;
    // [u yönü, şerit yönü]
    const yonler = [[1, 0], [-1, 0], [0.6, -1], [0.6, 1], [-0.6, -1]];
    for (let i = 0; i < yonler.length; i++) {
      this._yildizAt(a.u, r, yonler[i][0] * H, yonler[i][1] * 2.4, v.hasar);
    }
  }

  _sahadaDusmanVar() {
    for (let r = 0; r < this.seritler.length; r++) if (this.seritler[r].dusmanlar.length) return true;
    return false;
  }

  _yildizAt(u, row, du, dr, hasar) {
    let y = this.yildizBos.pop();
    if (!y) {
      const spr = this.scene.add.star(0, 0, 5, 6, 13, 0xffd54a)
        .setStrokeStyle(2, 0x7a4a00).setDepth(DEPTH.projectile);
      y = { spr };
    }
    y.u = u + 0.01; y.row = row; y.du = du; y.dr = dr; y.hasar = hasar; y.omur = 2.6;
    y.spr.setActive(true).setVisible(true).setRotation(0);
    this.yildizlar.push(y);
  }

  _yildizlariGuncelle(dts) {
    const arr = this.yildizlar;
    const grid = this.grid, rows = this.seritler.length;
    for (let i = arr.length - 1; i >= 0; i--) {
      const y = arr[i];
      y.u += y.du * dts;
      y.row += y.dr * dts;
      y.omur -= dts;

      let bitti = y.omur <= 0 || y.u < -0.03 || y.u > 1.14 || y.row < -0.45 || y.row > rows - 0.55;

      if (!bitti) {
        const rf = Math.min(rows - 1, Math.max(0, y.row));
        const r0 = Math.floor(rf), r1 = Math.min(rows - 1, r0 + 1), f = rf - r0;
        const uu = Math.min(1.14, Math.max(0, y.u));
        const p0 = grid.seritNokta(r0, uu), p1 = grid.seritNokta(r1, uu);
        const o = grid.olcek(r0) + (grid.olcek(r1) - grid.olcek(r0)) * f;
        y.spr.setPosition(p0.x + (p1.x - p0.x) * f, p0.y + (p1.y - p0.y) * f - MERMI_Y_OFSET * o);
        y.spr.setScale(o * 0.9);
        y.spr.rotation += dts * 9;

        // çarpışma: en yakın şeritteki düşmanlar
        const lr = Math.round(y.row);
        if (lr >= 0 && lr < rows) {
          const list = this.seritler[lr].dusmanlar;
          for (let j = 0; j < list.length; j++) {
            const d = list[j];
            if (d.can <= 0 || d.cekiliyor) continue;
            if (Math.abs(d.u - y.u) <= BALANCE.mermiCarpmaU * 1.4) {
              d.hasarAl(y.hasar);
              bitti = true;
              break;
            }
          }
        }
      }

      if (bitti) {
        y.spr.setActive(false).setVisible(false);
        const son = arr.length - 1;
        if (i !== son) arr[i] = arr[son];
        arr.pop();
        this.yildizBos.push(y);
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
        if (a && a.icerik) { a.icerik.oldur(); this.dusmanHavuz.birak(a.icerik); a.icerik = null; }
        if (a) { a.oldur(); this.cihazHavuz.birak(a); lane.cihazlar[c] = null; }
      }
      // Silindirler
      for (let i = lane.silindir.length - 1; i >= 0; i--) {
        lane.silindir[i].sprite.destroy();
      }
      lane.silindir.length = 0;
    }
    for (let i = this.olenler.length - 1; i >= 0; i--) {
      const t = this.olenler[i]; t.oldur(); this.dusmanHavuz.birak(t);
    }
    this.olenler.length = 0;
    // Kapıya kaçanlar
    for (let i = this.kacanlar.length - 1; i >= 0; i--) {
      const t = this.kacanlar[i]; t.oldur(); this.dusmanHavuz.birak(t);
    }
    this.kacanlar.length = 0;
    for (let i = this.yildizlar.length - 1; i >= 0; i--) this.yildizlar[i].spr.destroy();
    for (let i = this.yildizBos.length - 1; i >= 0; i--) this.yildizBos[i].spr.destroy();
    this.yildizlar.length = 0; this.yildizBos.length = 0;
    this.simsekHavuz.hepsiniBirak(s => s.oldur());
  }
}
