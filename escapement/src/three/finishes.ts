/**
 * Procedural watchmaking finishes, drawn to canvases at runtime — perlage on the
 * mainplate, Geneva stripes on the bridges, a printed dial, and the leather
 * bench mat. No downloaded assets, so the game works fully offline.
 */

import * as THREE from 'three';

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

let _perlage: THREE.CanvasTexture | null = null;
/** Overlapping circular-graining rows, the classic mainplate decoration. */
export function perlageTexture(): THREE.CanvasTexture {
  if (_perlage) return _perlage;
  const [c, ctx] = makeCanvas(1024);
  ctx.fillStyle = '#8f96a1';
  ctx.fillRect(0, 0, 1024, 1024);
  const r = 46;
  for (let row = 0; row * r * 1.15 < 1024 + r; row++) {
    for (let col = 0; col * r * 1.15 < 1024 + r; col++) {
      const x = col * r * 1.15 + (row % 2) * r * 0.55;
      const y = row * r * 1.15;
      const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
      g.addColorStop(0, 'rgba(226,231,238,0.55)');
      g.addColorStop(0.7, 'rgba(150,157,168,0.25)');
      g.addColorStop(1, 'rgba(96,102,112,0.5)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  _perlage = toTexture(c);
  return _perlage;
}

let _stripes: THREE.CanvasTexture | null = null;
/** Côtes de Genève — parallel polished bands across the bridges. */
export function genevaStripesTexture(): THREE.CanvasTexture {
  if (_stripes) return _stripes;
  const [c, ctx] = makeCanvas(512);
  const band = 64;
  for (let x = -band; x < 512 + band; x += band) {
    const g = ctx.createLinearGradient(x, 0, x + band, 0);
    g.addColorStop(0, '#8d95a2');
    g.addColorStop(0.35, '#d6dce6');
    g.addColorStop(0.55, '#aeb6c3');
    g.addColorStop(1, '#79808c');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, band + 1, 512);
  }
  _stripes = toTexture(c);
  _stripes.wrapS = _stripes.wrapT = THREE.RepeatWrapping;
  _stripes.rotation = Math.PI / 9;
  return _stripes;
}

let _dial: THREE.CanvasTexture | null = null;
/** Dark sunburst dial with a minute track, applied markers and discreet type. */
export function dialTexture(): THREE.CanvasTexture {
  if (_dial) return _dial;
  const S = 1024;
  const [c, ctx] = makeCanvas(S);
  const cx = S / 2;

  // Sunburst base.
  const base = ctx.createRadialGradient(cx, cx, S * 0.05, cx, cx, S * 0.52);
  base.addColorStop(0, '#333a46');
  base.addColorStop(0.55, '#232935');
  base.addColorStop(1, '#141922');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  // Radial brush strokes for the sunburst sheen.
  ctx.save();
  ctx.translate(cx, cx);
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 180; i++) {
    ctx.rotate(Math.PI / 90);
    ctx.strokeStyle = i % 2 ? '#5a6475' : '#0c0f15';
    ctx.beginPath();
    ctx.moveTo(0, S * 0.06);
    ctx.lineTo(0, S * 0.5);
    ctx.stroke();
  }
  ctx.restore();

  // Minute track.
  ctx.save();
  ctx.translate(cx, cx);
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    ctx.strokeStyle = major ? '#e6ebf2' : 'rgba(214,220,230,0.45)';
    ctx.lineWidth = major ? 7 : 3;
    ctx.beginPath();
    ctx.moveTo(0, -S * 0.455);
    ctx.lineTo(0, -S * (major ? 0.415 : 0.435));
    ctx.stroke();
    ctx.rotate(Math.PI / 30);
  }
  // Applied hour markers (double at 12).
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    const w = 14;
    const grad = ctx.createLinearGradient(-w, 0, w, 0);
    grad.addColorStop(0, '#9aa2ae');
    grad.addColorStop(0.5, '#f2f5fa');
    grad.addColorStop(1, '#828a96');
    ctx.fillStyle = grad;
    if (h === 0) {
      ctx.fillRect(-w - 11, -S * 0.40, w, S * 0.055);
      ctx.fillRect(11, -S * 0.40, w, S * 0.055);
    } else {
      ctx.fillRect(-w / 2, -S * 0.40, w, S * 0.055);
    }
    ctx.restore();
  }
  ctx.restore();

  // Type.
  ctx.fillStyle = '#c8cfd9';
  ctx.textAlign = 'center';
  ctx.font = `600 ${S * 0.032}px Georgia, 'Times New Roman', serif`;
  ctx.fillText('E S C A P E M E N T', cx, cx - S * 0.16);
  ctx.fillStyle = '#78808c';
  ctx.font = `${S * 0.02}px Georgia, serif`;
  ctx.fillText('28 800 bph', cx, cx + S * 0.22);

  _dial = toTexture(c);
  return _dial;
}

let _leather: THREE.CanvasTexture | null = null;
/** Speckled dark-green bench leather for the worktop mat. */
export function leatherTexture(): THREE.CanvasTexture {
  if (_leather) return _leather;
  const S = 512;
  const [c, ctx] = makeCanvas(S);
  const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S * 0.7);
  g.addColorStop(0, '#1d2a26');
  g.addColorStop(1, '#10171a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 3200; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(x, y, 1.4, 1.4);
  }
  _leather = toTexture(c);
  return _leather;
}
