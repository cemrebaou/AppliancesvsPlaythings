/**
 * Audio.js
 * Ses dosyası yok — tüm efektler WebAudio ile anlık üretilir.
 * Böylece indirme boyutu artmaz ve mobilde gecikme olmaz.
 */
import { Save } from './Save.js';

let ctx = null;
let anaKazanc = null;
let sonCalma = 0;

function hazirla() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  anaKazanc = ctx.createGain();
  anaKazanc.gain.value = 0.18;
  anaKazanc.connect(ctx.destination);
  return ctx;
}

function ton(frek, sure, tip = 'square', hacim = 1, kayma = 0) {
  if (!Save.oku().sesAcik) return;
  const c = hazirla();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const t = c.currentTime;
  // aynı anda çok fazla ses üst üste binmesin (mobil CPU koruması)
  if (t - sonCalma < 0.012) return;
  sonCalma = t;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(frek, t);
  if (kayma) o.frequency.exponentialRampToValueAtTime(Math.max(40, frek + kayma), t + sure);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(hacim, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g); g.connect(anaKazanc);
  o.start(t); o.stop(t + sure + 0.02);
}

export const Ses = {
  ac() { hazirla(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
  tik()      { ton(620, 0.05, 'square', 0.5); },
  yerlestir(){ ton(330, 0.11, 'triangle', 0.8, 220); },
  atis()     { ton(840, 0.045, 'square', 0.35, -260); },
  carpma()   { ton(190, 0.06, 'sawtooth', 0.4, -70); },
  toplama()  { ton(900, 0.08, 'sine', 0.7, 500); },
  olum()     { ton(140, 0.22, 'sawtooth', 0.6, -90); },
  hata()     { ton(150, 0.12, 'square', 0.5, -40); },
  dalga()    { ton(300, 0.3, 'triangle', 0.7, 320); },
  kaybetme() { ton(110, 0.7, 'sawtooth', 0.8, -60); },
  zafer()    { ton(520, 0.45, 'triangle', 0.8, 700); }
};
