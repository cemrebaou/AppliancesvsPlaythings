/**
 * Pool.js
 * Basit ve hızlı nesne havuzu. Oyun sırasında hiç `new` çağrılmaz,
 * böylece çöp toplayıcı (GC) tetiklenmez ve takılma olmaz.
 */
export class Pool {
  /**
   * @param {Function} uret  yeni nesne üretir
   * @param {number} onIsitma başlangıçta kaç adet hazırlansın
   */
  constructor(uret, onIsitma = 0) {
    this._uret = uret;
    this._bos = [];
    this.aktif = [];
    for (let i = 0; i < onIsitma; i++) this._bos.push(uret());
  }

  al() {
    const o = this._bos.length ? this._bos.pop() : this._uret();
    this.aktif.push(o);
    return o;
  }

  /** aktif[i] konumundaki nesneyi havuza iade eder (swap-remove: O(1)) */
  birakIndex(i) {
    const a = this.aktif;
    const o = a[i];
    const son = a.length - 1;
    if (i !== son) a[i] = a[son];
    a.pop();
    this._bos.push(o);
    return o;
  }

  birak(o) {
    const i = this.aktif.indexOf(o);
    if (i >= 0) this.birakIndex(i);
  }

  hepsiniBirak(geriCagir) {
    for (let i = this.aktif.length - 1; i >= 0; i--) {
      if (geriCagir) geriCagir(this.aktif[i]);
      this.birakIndex(i);
    }
  }

  get sayi() { return this.aktif.length; }
}
