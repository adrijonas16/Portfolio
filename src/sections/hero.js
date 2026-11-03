import { gsap, ScrollTrigger, SplitText } from '../core/scroll.js';
import { reducedMotion, isTouch } from '../config.js';
import { $, $$ } from '../core/dom.js';
import { EDITOR_FILES } from '../data/editor-files.js';
import { highlight } from './highlight.js';

/**
 * Hero: a reactive dot grid with "data packets", a code editor that types C#, TSX and a terminal,
 * and the name reveal. Only runs its loops while the hero is on screen.
 */
export function initHero() {
  const grid = initDotGrid($('#gl'));
  const editor = initEditor(() => grid.running);

  // pause the canvas and the typing when the hero is off screen
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    onToggle: (self) => (grid.running = self.isActive),
  });
  if (!reducedMotion) {
    gsap.to('#edWrap', {
      yPercent: -25,
      opacity: 0,
      rotate: -4,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
  gsap.to('.hero-in', {
    yPercent: -18,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // hidden until the intro
  const chars = SplitText.create('#hero h1 .ln', { type: 'chars' }).chars;
  gsap.set(chars, { yPercent: 110 });
  gsap.set(['.role', '.hero-p', '.hero-row .btn', '#nav'], { opacity: 0, y: 20 });

  /** Adds the hero entrance to the intro timeline at label "in". */
  return function reveal(tl) {
    tl.fromTo(
      '#ed',
      { opacity: 0, y: 60, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'expo.out' },
      'in+=.2',
    )
      .call(() => editor.type(0), null, 'in+=.9')
      .to(chars, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035 }, 'in+=.35')
      .to(
        ['.role', '#nav', '.hero-p', '.hero-row .btn'],
        { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 },
        'in+=1',
      );
  };
}

/** Dot grid that brightens around the cursor, with light streaks running along the rows and columns. */
function initDotGrid(canvas) {
  const ctx = canvas.getContext('2d');
  const GAP = 26;
  const state = { mx: -999, my: -999, running: true, w: 0, h: 0, packets: [] };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio, 2);
    state.w = canvas.clientWidth;
    state.h = canvas.clientHeight;
    canvas.width = state.w * dpr;
    canvas.height = state.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    state.mx = e.clientX - r.left;
    state.my = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => (state.mx = state.my = -999));

  const spawn = () => {
    const horiz = Math.random() < 0.6;
    const lane = Math.floor(Math.random() * ((horiz ? state.h : state.w) / GAP)) * GAP + GAP / 2;
    state.packets.push({ horiz, lane, p: -60, v: 140 + Math.random() * 220, len: 40 + Math.random() * 90 });
  };

  let last = performance.now();
  let acc = 0;
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (!state.running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, state.w, state.h);

    for (let y = GAP / 2; y < state.h; y += GAP) {
      for (let x = GAP / 2; x < state.w; x += GAP) {
        const k = Math.max(0, 1 - Math.hypot(x - state.mx, y - state.my) / 170);
        ctx.fillStyle = k > 0 ? `rgba(183,156,255,${0.12 + k * 0.75})` : 'rgba(243,236,223,.09)';
        const s = 1.3 + k * 1.6;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }

    if (reducedMotion) return;
    acc += dt;
    if (acc > 0.45 && state.packets.length < 7) {
      acc = 0;
      spawn();
    }
    state.packets = state.packets.filter((pk) => {
      pk.p += pk.v * dt;
      const max = pk.horiz ? state.w : state.h;
      const g = pk.horiz
        ? ctx.createLinearGradient(pk.p - pk.len, 0, pk.p, 0)
        : ctx.createLinearGradient(0, pk.p - pk.len, 0, pk.p);
      g.addColorStop(0, 'rgba(183,156,255,0)');
      g.addColorStop(1, 'rgba(183,156,255,.85)');
      ctx.fillStyle = g;
      if (pk.horiz) ctx.fillRect(pk.p - pk.len, pk.lane - 0.75, pk.len, 1.5);
      else ctx.fillRect(pk.lane - 0.75, pk.p - pk.len, 1.5, pk.len);
      return pk.p - pk.len < max;
    });
  };
  requestAnimationFrame(loop);
  return state;
}

/** The editor window: tabs, line numbers, caret, typing loop and a tilt that follows the cursor. */
function initEditor(isVisible) {
  const code = $('#edCode');
  const nums = $('#edNums');
  const tabs = $$('.ed-tab');
  const lang = $('#edLang');
  const pos = $('#edPos');
  const win = $('#ed');
  let timer = null;

  const render = (file, n) => {
    const lines = file.code.slice(0, n).split('\n');
    const lastLine = lines.length - 1;
    code.innerHTML = lines
      .map(
        (l, i) =>
          `<div class="ln${i === lastLine ? ' cur' : ''}">${highlight(l, file.term) || '&nbsp;'}${
            i === lastLine ? '<i class="caret"></i>' : ''
          }</div>`,
      )
      .join('');
    nums.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
    pos.textContent = `Ln ${lines.length}, Col ${lines[lastLine].length + 1}`;
  };

  const type = (index) => {
    clearTimeout(timer);
    const file = EDITOR_FILES[index];
    tabs.forEach((t, k) => t.classList.toggle('on', k === index));
    lang.textContent = file.lang;
    win.classList.toggle('term', Boolean(file.term));
    if (reducedMotion) return render(file, file.code.length);

    let n = 0;
    const step = () => {
      if (!isVisible()) {
        timer = setTimeout(step, 300);
        return;
      }
      const ch = file.code[n];
      n += ch === ' ' && file.code[n + 1] === ' ' ? 4 : 1; // indentation lands in one go
      render(file, n);
      if (n < file.code.length) {
        timer = setTimeout(step, ch === '\n' ? (file.term ? 380 : 120) : 18 + Math.random() * 38);
      } else {
        timer = setTimeout(() => type((index + 1) % EDITOR_FILES.length), 2600);
      }
    };
    step();
  };

  tabs.forEach((t, k) => t.addEventListener('click', () => type(k)));
  render(EDITOR_FILES[0], 0);

  if (!isTouch && !reducedMotion) {
    const rx = gsap.quickTo(win, 'rotateX', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(win, 'rotateY', { duration: 0.8, ease: 'power3' });
    $('#hero').addEventListener('pointermove', (e) => {
      ry(-10 + (e.clientX / innerWidth - 0.5) * 10);
      rx(4 - (e.clientY / innerHeight - 0.5) * 8);
    });
  }
  return { type };
}
