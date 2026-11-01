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
import { BULLET_SCALE } from '../config/ApplianceData.js';
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
    this.firlatmalar = []; // fırlatıcıların kavisli atışları
    this.firlatmaBos = []; // havuz
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

  /** Bu alet bu kareye konabilir mi? (yükseltmeler sadece ana aletin üstüne) */
  yerlesebilir(veri, row, col) {
    if (veri.rol === 'silindir') return true;
    const mevcut = this.seritler[row].cihazlar[col];
    if (veri.ustune) return !!(mevcut && mevcut.veri.id === veri.ustune);
    return !mevcut;
  }

  yerlestir(veri, row, col) {
    // Silindir: kule değil, şeridi boydan boya eziyor
    if (veri.rol === 'silindir') {
      this._silindir(veri, row);
      return null;
    }
    if (!this.yerlesebilir(veri, row, col)) return null;
    // Yükseltme: alttaki aleti kaldırıp yerine kurulur
    if (veri.ustune) this._cihazYikil(this.seritler[row].cihazlar[col]);
    const y = this.cihazYerlesim(veri, row, col);
    const a = this.cihazHavuz.al().kur(veri, row, col, y.x, y.y, y.olcek);
    a.u = this.grid.sutunU(col);
    this.seritler[row].cihazlar[col] = a;
    return a;
  }

  /**
   * Aleti arka plandaki ölçülmüş karonun tam ortasına sığdırır
   * (genişliğin %85'i, boyun %95'i; Büyük Buzdolabı 1.5 kat uzun).
   * Döner: { x, y, olcek } — sprite origin (0.5, 1) ile kullanılır.
   */
  cihazYerlesim(veri, row, col) {
    const k = this.grid.karo(row, col);
    const kare = this.scene.textures.getFrame(K.atlas, veri.id + '_0');
    const fw = kare ? kare.width : 100, fh = kare ? kare.height : 100;
    if (veri.uzun) {
      // Büyük Buzdolabı: tabanı karoda, boyu 1.5 karo
      const o = Math.min(k.w * 0.85 / fw, k.h * 1.5 / fh);
      return { x: k.cx, y: k.alt - k.h * 0.06 - this.grid.kaydir[row], olcek: o };
    }
    // Karonun tam ortasına: genişliğin %85'i, boyun %95'i içinde, dikeyde ortalı
    const olcek = Math.min(k.w * 0.85 / fw, k.h * 0.95 / fh);
    return { x: k.cx, y: k.cy + (fh * olcek) / 2 - this.grid.kaydir[row], olcek };
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
    this._firlatmalariGuncelle(dts);
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
          const n = v.uretimAdet || 1;
          for (let k = 0; k < n; k++) {
            const ox = n > 1 ? (k - (n - 1) / 2) * 34 : 0;
            this.simsekBirak(p.x + ox, p.y - 40, p.y - 6, v.uretimDeger, true);
          }
          a.atesEttiGoster();
        }
        continue;
      }

      // --- PvZ rolleri (v0.15)
      if (v.rol === 'duvar') continue;
      if (v.rol === 'sarimsak') continue;          // etkisi düşman ısırınca
      if (v.rol === 'bomba') { this._bombaGuncelle(a, r, dt); continue; }
      if (v.rol === 'buz') { this._buzGuncelle(a, dt); continue; }
      if (v.rol === 'mayin') { this._mayinGuncelle(a, lane, dt); continue; }
      if (v.rol === 'ezici') { this._eziciGuncelle(a, lane, r, dt); continue; }
      if (v.rol === 'diken') { this._dikenGuncelle(a, lane, dt); continue; }
      if (v.rol === 'miknatis') { this._miknatisGuncelle(a, r, dt); continue; }
      if (v.rol === 'firlatici') { this._firlaticiGuncelle(a, lane, r, dt); continue; }

      // --- özel roller
      if (v.rol === 'ruzgar') { this._ruzgarGuncelle(a, lane, dt); continue; }
      if (v.rol === 'yakin') { this._yakinGuncelle(a, lane, dt); continue; }
      if (v.rol === 'yutucu') { this._yutucuGuncelle(a, lane, r, dt); continue; }
      if (v.rol === 'yildiz') { this._yildizCihazGuncelle(a, r, dt); continue; }
      if (v.rol === 'ates') continue;   // Fritöz: pasif, mermileri güçlendirir

      if (!v.mermi || v.hasar <= 0) continue;

      // Tekrarlayıcı / makineli: kalan seri atışlar
      if (a.seriKalan > 0) {
        a.seriSayac -= dt;
        if (a.seriSayac <= 0) {
          a.seriKalan--;
          a.seriSayac = 150;
          a.atesEttiGoster();
          this._seritlereAt(v, r, a.u + 0.012, 1);
        }
      }

      a.atisSayac -= dt;
      if (a.atisSayac > 0) continue;

      // menzilde düşman var mı?
      const onde = this._hedefVar(r, a.u, v);
      const arkada = v.geri ? this._arkadaVar(r, a.u) : false;
      if (!onde && !arkada) continue;

      a.atisSayac = v.atisMs;
      a.atesEttiGoster();
      Ses.atis();

      this._seritlereAt(v, r, a.u + 0.012, 1);
      if (v.seri > 1) { a.seriKalan = v.seri - 1; a.seriSayac = 150; }
      // Bölünmüş bezelye: arkaya atış
      if (v.geri) {
        for (let k = 0; k < v.geri; k++) this._mermiAt(v, r, a.u - 0.012 - k * 0.035, -1);
      }
    }
  }

  _seritlereAt(v, r, u, yon) {
    const seritler = v.seritler || [0];
    for (let i = 0; i < seritler.length; i++) {
      const hr = r + seritler[i];
      if (hr < 0 || hr >= this.seritler.length) continue;
      this._mermiAt(v, hr, u, yon);
    }
  }

  _arkadaVar(r, u) {
    const list = this.seritler[r].dusmanlar;
    for (let j = 0; j < list.length; j++) if (list[j].u < u && list[j].u > -0.03) return true;
    return false;
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

  _mermiAt(v, row, u, yon = 1) {
    const olcek = this.grid.olcek(row) * MERMI_TABAN_OLCEK;
    const m = this.mermiHavuz.al().kur(v, row, u, olcek, yon);
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
        if (t.ziplaKalan <= 0) {
          t.yOfset = 0;
          if (t.veri.tekZipla) t.ziplamayiBitir();
          else t.ziplaSayac = t.veri.ziplaMs;
        }
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
        let hedef = (t.u - 0.022 >= 0) ? lane.cihazlar[c] : null;
        // Diken otu ve kurulmuş mayın yenmez, üstünden geçilir
        if (hedef && (hedef.veri.rol === 'diken' || (hedef.veri.rol === 'mayin' && hedef.hazir))) hedef = null;

        if (hedef && hedef.canli) {
          if (t.veri.zipla && !t.ziplaBitti && t.ziplaSayac <= 0) {
            if (hedef.veri.uzun) t.ziplamayiBitir();   // Uzun ceviz: zıplatmaz
            else t.zipla();
          } else {
            t.yiyor = hedef;
            t.isirikSayac -= dt;
            if (t.isirikSayac <= 0) {
              t.isirikSayac = BALANCE.dusmanYemeHasariMs;
              Ses.carpma();
              const yikildi = hedef.hasarAl(t.veri.isirik);
              if (yikildi) this._cihazYikil(hedef);
              // Sarımsak: ısıran komşu şeride sapar
              if (hedef.veri.rol === 'sarimsak' && t.can > 0 && this._seritDegistir(t, r, i)) continue;
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
      m.u += BALANCE.mermiHizU * dts * m.yon;

      if (m.u > m.menzilSon || m.u < -0.05) { this._mermiCikar(list, i); continue; }

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
      // Waffle mermisi (5 yöne atılır)
      const spr = this.scene.add.image(0, 0, K.atlas, 'waffle').setDepth(DEPTH.projectile);
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
        y.spr.setScale(o * (BULLET_SCALE.waffle || 0.56));
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

  // ================================================================ PvZ rolleri

  /** Sarımsak: düşmanı komşu şeride taşır. Taşındıysa true döner. */
  _seritDegistir(t, r, i) {
    const rows = this.seritler.length;
    let yeni;
    if (r === 0) yeni = 1;
    else if (r === rows - 1) yeni = rows - 2;
    else yeni = Math.random() < 0.5 ? r - 1 : r + 1;
    this._dusmaniCikar(this.seritler[r], i);
    t.row = yeni;
    t.yiyor = null;
    t.u -= 0.03;
    t.temelOlcek = this.grid.olcek(yeni) * DUSMAN_TABAN_OLCEK * (t.veri.olcek || 1);
    t.sprite.setScale(t.temelOlcek);
    t.sprite.setTint(0xb6ff6a);
    t.tintKalan = 400;
    this.seritler[yeni].dusmanlar.push(t);
    return true;
  }

  /** Belirli bir alanda patlama: (merkez şerit r, merkez u) */
  _patlat(r, u, seritYaricap, uYaricap, hasar) {
    for (let rr = r - seritYaricap; rr <= r + seritYaricap; rr++) {
      if (rr < 0 || rr >= this.seritler.length) continue;
      const list = this.seritler[rr].dusmanlar;
      for (let j = 0; j < list.length; j++) {
        const d = list[j];
        if (d.can <= 0 || d.cekiliyor) continue;
        if (Math.abs(d.u - u) <= uYaricap) d.hasarAl(hasar);
      }
    }
    const p = this.grid.seritNokta(r, Math.min(1.1, Math.max(0, u)));
    const o = this.grid.olcek(r);
    const yaricapPx = (uYaricap * 900 + 30) * o;
    const halka = this.scene.add.circle(p.x, p.y - 30 * o, yaricapPx * 0.3, 0xffb030, 0.85)
      .setDepth(DEPTH.fx);
    this.scene.tweens.add({
      targets: halka, scale: 3.3, alpha: 0, duration: 420, ease: 'Cubic.Out',
      onComplete: () => halka.destroy()
    });
    this.scene.cameras.main.shake(180, 0.006 * (seritYaricap + 1));
    Ses.carpma();
  }

  // --- Akü / Yavaş Pişirici (kiraz / kıyamet): fitil sonra patlar
  _bombaGuncelle(a, r, dt) {
    const v = a.veri;
    a.fitil -= dt;
    const o = 1 - Math.max(0, a.fitil) / v.fitilMs;
    a.sprite.setScale(a.temelOlcek * (1 + o * 0.35));
    a.sprite.setFrame(v.id + '_1');
    a.sprite.setTint(((255) << 16) | ((255 - Math.round(o * 160)) << 8) | (255 - Math.round(o * 200)));
    if (a.fitil <= 0) {
      this._patlat(r, a.u, v.seritYaricap, v.uYaricap, v.hasar);
      this._cihazYikil(a);
    }
  }

  // --- Nemlendirici (buz mantarı): sahadaki herkesi dondurur
  _buzGuncelle(a, dt) {
    const v = a.veri;
    a.fitil -= dt;
    a.sprite.setFrame(v.id + '_1');
    if (a.fitil > 0) return;
    for (let rr = 0; rr < this.seritler.length; rr++) {
      const list = this.seritler[rr].dusmanlar;
      for (let j = 0; j < list.length; j++) {
        const d = list[j];
        if (d.can <= 0) continue;
        d.hasarAl(v.hasar || 0);
        d.dondur(v.donmaMs, 6000);
        d.sprite.setTint(0x99ddff);
        d.tintKalan = 0;
      }
    }
    const W = this.scene.scale.gameSize.width, H = this.scene.scale.gameSize.height;
    const perde = this.scene.add.rectangle(0, 0, W, H, 0xbfe9ff, 0.55).setOrigin(0).setDepth(DEPTH.fx);
    this.scene.tweens.add({ targets: perde, alpha: 0, duration: 700, onComplete: () => perde.destroy() });
    Ses.atis();
    this._cihazYikil(a);
  }

  // --- Elektrik Prizi (patates mayını)
  _mayinGuncelle(a, lane, dt) {
    const v = a.veri;
    if (!a.hazir) {
      a.hazirKalan -= dt;
      if (a.hazirKalan <= 0) {
        a.hazir = true;
        a.bekleKare = v.id + '_1';
        a.sprite.setFrame(a.bekleKare).setAlpha(1);
      }
      return;
    }
    const list = lane.dusmanlar;
    for (let j = 0; j < list.length; j++) {
      const d = list[j];
      if (d.can <= 0 || d.cekiliyor) continue;
      if (Math.abs(d.u - a.u) <= 0.045) {
        this._patlat(a.row, a.u, 0, v.uYaricap, v.hasar);
        this._cihazYikil(a);
        return;
      }
    }
  }

  // --- Tost Makinesi (kabak): yakına geleni üstüne atlayıp ezer
  _eziciGuncelle(a, lane, r, dt) {
    const v = a.veri;
    if (!a.ezHedef) {
      const list = lane.dusmanlar;
      let en = null;
      for (let j = 0; j < list.length; j++) {
        const d = list[j];
        if (d.can <= 0 || d.cekiliyor) continue;
        if (d.u >= a.u - 0.08 && d.u <= a.u + 0.13 && (!en || d.u < en.u)) en = d;
      }
      if (en) {
        a.ezHedef = en; a.ezT = 0; a.ezU = en.u;
        a.sprite.setFrame(v.id + '_1');
        a.bekleKare = v.id + '_1';
      }
      return;
    }
    const d = a.ezHedef;
    if (d.canli && d.can > 0) a.ezU = d.u;
    a.ezT += dt;
    const o = Math.min(1, a.ezT / 550);
    const bas = { x: a.x0, y: a.y0 }, son = this.grid.seritNokta(r, a.ezU);
    a.sprite.x = bas.x + (son.x - bas.x) * o;
    a.sprite.y = bas.y + (son.y - bas.y) * o - Math.sin(o * Math.PI) * 90 * this.grid.olcek(r);
    a.sprite.setDepth(DEPTH.field + bas.y + 40);
    if (o >= 1) {
      this._patlat(r, a.ezU, 0, 0.06, v.hasar);
      this._cihazYikil(a);
    }
  }

  // --- Isıtıcı (diken otu): üstündekine sürekli hasar
  _dikenGuncelle(a, lane, dt) {
    const v = a.veri;
    a.atisSayac -= dt;
    if (a.atisSayac > 0) return;
    a.atisSayac = v.atisMs;
    const list = lane.dusmanlar;
    let vurdu = false;
    for (let j = 0; j < list.length; j++) {
      const d = list[j];
      if (d.can <= 0 || d.cekiliyor) continue;
      if (Math.abs(d.u - a.u) <= 0.055) { d.hasarAl(v.hasar); vurdu = true; }
    }
    if (vurdu) a.atesEttiGoster();
  }

  // --- Giysi Buharlayıcı (mıknatıs): metal düşmanın kaskını söker
  _miknatisGuncelle(a, r, dt) {
    const v = a.veri;
    a.atisSayac -= dt;
    if (a.atisSayac > 0) return;
    let en = null, enM = 99;
    for (let rr = r - 2; rr <= r + 2; rr++) {
      if (rr < 0 || rr >= this.seritler.length) continue;
      const list = this.seritler[rr].dusmanlar;
      for (let j = 0; j < list.length; j++) {
        const d = list[j];
        if (!d.veri.metal || d.can <= (d.veri.govde || 0) || d.cekiliyor) continue;
        const m = Math.abs(d.u - a.u) + Math.abs(rr - r) * 0.1;
        if (Math.abs(d.u - a.u) <= v.menzilU && m < enM) { en = d; enM = m; }
      }
    }
    if (!en) { a.atisSayac = 250; return; }
    en.can = en.veri.govde;
    en.sprite.setTint(0x8fb6ff);
    en.tintKalan = 500;
    a.atisSayac = v.atisMs;
    a.atisKare = 900;
    a.sprite.setFrame(v.id + '_1');
    Ses.atis();
  }

  // --- Fırlatıcılar (lahana / mısır / kavun): kavisli atış
  _firlaticiGuncelle(a, lane, r, dt) {
    const v = a.veri;
    a.atisSayac -= dt;
    if (a.atisSayac > 0) return;
    const list = lane.dusmanlar;
    let en = null;
    for (let j = 0; j < list.length; j++) {
      const d = list[j];
      if (d.can <= 0 || d.cekiliyor) continue;
      if (d.u >= a.u - 0.01 && d.u <= 1.1 && (!en || d.u < en.u)) en = d;
    }
    if (!en) { a.atisSayac = 200; return; }
    a.atisSayac = v.atisMs;
    a.atesEttiGoster();
    Ses.atis();

    let f = this.firlatmaBos.pop();
    if (!f) f = { spr: this.scene.add.image(0, 0, K.atlas, 'toast').setDepth(DEPTH.projectile) };
    const tereyag = v.tereyagSans && Math.random() < v.tereyagSans;
    f.row = r; f.u0 = a.u + 0.01; f.u1 = en.u; f.hedef = en; f.t = 0;
    f.sure = 0.55 + Math.abs(en.u - a.u) * 0.6;
    f.hasar = tereyag ? v.hasar * 2 : v.hasar;
    f.tereyag = tereyag;
    f.v = v;
    const o = this.grid.olcek(r);
    f.spr.setFrame(v.mermi).setVisible(true).setActive(true).setRotation(0)
      .setScale(o * (BULLET_SCALE[v.mermi] || 0.6) * (v.sicrama ? 1.4 : 1.1));
    f.spr.clearTint();
    if (tereyag) f.spr.setTint(0xffe14a);
    else if (v.mermiRenk) f.spr.setTint(v.mermiRenk);
    this.firlatmalar.push(f);
  }

  _firlatmalariGuncelle(dts) {
    const arr = this.firlatmalar;
    const grid = this.grid;
    for (let i = arr.length - 1; i >= 0; i--) {
      const f = arr[i];
      f.t += dts;
      if (f.hedef && f.hedef.canli && f.hedef.can > 0 && f.hedef.row === f.row) f.u1 = f.hedef.u;
      const o = Math.min(1, f.t / f.sure);
      const u = f.u0 + (f.u1 - f.u0) * o;
      const sc = grid.olcek(f.row);
      const p = grid.seritNokta(f.row, Math.max(0, Math.min(1.12, u)));
      f.spr.setPosition(p.x, p.y - MERMI_Y_OFSET * sc - Math.sin(o * Math.PI) * 150 * sc);
      f.spr.rotation += dts * 6;
      if (o < 1) continue;

      // iniş: hedefi (ya da o noktadaki ilk düşmanı) vur
      const v = f.v;
      const list = this.seritler[f.row].dusmanlar;
      let vurulan = (f.hedef && f.hedef.canli && f.hedef.can > 0 && list.indexOf(f.hedef) >= 0) ? f.hedef : null;
      if (!vurulan) {
        for (let j = 0; j < list.length; j++) {
          if (list[j].can > 0 && Math.abs(list[j].u - f.u1) <= 0.05) { vurulan = list[j]; break; }
        }
      }
      if (vurulan) {
        vurulan.hasarAl(f.hasar);
        if (f.tereyag) vurulan.dondur(4000);
        if (v.yavaslat) vurulan.yavaslat();
      }
      if (v.sicrama) {
        for (let rr = f.row - 1; rr <= f.row + 1; rr++) {
          if (rr < 0 || rr >= this.seritler.length) continue;
          const l2 = this.seritler[rr].dusmanlar;
          for (let j = 0; j < l2.length; j++) {
            const d = l2[j];
            if (d === vurulan || d.can <= 0 || d.cekiliyor) continue;
            if (Math.abs(d.u - f.u1) <= v.sicrama) {
              d.hasarAl(v.sicramaHasar);
              if (v.yavaslat) d.yavaslat();
            }
          }
        }
      }
      f.hedef = null;
      f.spr.setActive(false).setVisible(false);
      const son = arr.length - 1;
      if (i !== son) arr[i] = arr[son];
      arr.pop();
      this.firlatmaBos.push(f);
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
    for (let i = this.firlatmalar.length - 1; i >= 0; i--) this.firlatmalar[i].spr.destroy();
    for (let i = this.firlatmaBos.length - 1; i >= 0; i--) this.firlatmaBos[i].spr.destroy();
    this.firlatmalar.length = 0; this.firlatmaBos.length = 0;
    this.simsekHavuz.hepsiniBirak(s => s.oldur());
  }
}
