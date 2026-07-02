/**
 * Tiny synthesised bench sounds — no audio assets. A watch tick, the ratchet's
 * click while winding, and the soft settle of a placed part. The AudioContext is
 * created lazily on first user gesture (browser autoplay policy).
 */

let ctx: AudioContext | null = null;

export function ensureAudio(): void {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* audio unavailable — the game stays silent */
  }
}

function blip(freq: number, peak: number, decay: number, type: OscillatorType = 'square', hp = 0): void {
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + 0.0015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  let tail: AudioNode = gain;
  if (hp > 0) {
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hp;
    gain.connect(filter);
    tail = filter;
  }
  osc.connect(gain);
  tail.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + decay + 0.02);
}

/** The escapement's tick — a bright, tiny metallic snap. */
export function tickSound(): void {
  blip(4100 + Math.random() * 500, 0.035, 0.03, 'square', 2400);
}

/** A part settling into its socket — a low, satisfying thock. */
export function placeSound(): void {
  blip(210, 0.11, 0.1, 'sine');
  blip(1500, 0.03, 0.04, 'triangle', 900);
}

/** One ratchet click of the winding crown. */
export function windClickSound(): void {
  blip(1900 + Math.random() * 300, 0.05, 0.035, 'square', 1200);
}

/** Regulation achieved — a soft two-note chime. */
export function chimeSound(): void {
  if (!ctx || ctx.state !== 'running') return;
  blip(880, 0.05, 0.5, 'sine');
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 1318.5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t + 0.18);
  gain.gain.linearRampToValueAtTime(0.05, t + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t + 0.18);
  osc.stop(t + 1);
}
