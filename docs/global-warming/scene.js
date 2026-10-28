'use strict';

// Pixel-art scene: space, a sky whose atmosphere thickens as the planet warms,
// a tappable sun and clouds, and a huge planet whose top edge sits at the middle of the screen.
const Scene = (() => {
  const TEX_W = 256;
  const TEX_H = 128;
  const TILT = 50 * Math.PI / 180;          // pole tipped away from the viewer, so the horizon is temperate
  const LIGHT = norm([0.15, 0.9, 0.45]);    // the sun is above the planet
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.5);
  const SKY_BANDS = 8;
  const SPIN_SECONDS = 150;
  const MAX_CLOUDS = 8;
  const SMOKY = new Set(['campfire', 'oil', 'suv', 'coal', 'factory', 'rig', 'cargo', 'permafrost']);

  const RAMPS = {
    deep: [[-59, '#1b3566'], [0, '#1d4f9a'], [6, '#1f5a6a'], [12, '#3a4a3a'], [20, '#4a2418']],
    shallow: [[-59, '#2a5a9a'], [0, '#2f7fd0'], [6, '#3a8a8a'], [12, '#5a6a4a'], [20, '#6a3a22']],
    desert: [[0, '#d8b870'], [10, '#c8884a'], [20, '#9a4a2a']],
    horizon: [[-59, '#7a9ac0'], [-20, '#8ab8e0'], [0, '#a8dcff'], [5, '#d8d0a0'], [12, '#ff9a50'], [20, '#ff5a20']],
    zenith: [[-59, '#121c3a'], [0, '#2a64c0'], [5, '#4a6aa0'], [12, '#7a3048'], [20, '#4a0e10']],
    space: [[-59, '#05060f'], [10, '#0a0610'], [20, '#140406']],
  };
  const ROCK = hex('#7a6a5a');
  const MOUNTAIN = hex('#5a4e48');
  const GRASS = hex('#5ab04a');
  const FOREST = hex('#2f7a3a');
  const LAND_ICE = hex('#f4fbff');
  const SEA_ICE = hex('#d4e8f6');
  const SMOG = hex('#6a5a48');
  const BLOOM = hex('#1f7a5a');
  const OZONE = hex('#b49cff');
  const HAZE = hex('#d88a3a');

  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const bg = document.createElement('canvas');
  const bgCtx = bg.getContext('2d');

  const elev = fbm(rng(7), 6);
  const moist = fbm(rng(99), 4);
  const seaThreshold = percentile(elev, 0.62);
  const texColors = new Uint32Array(TEX_W * TEX_H * 3);

  let W = 0, H = 0, P = 1, cx = 0, cy = 0, R = 0;
  let sun = { x: 0, y: 0, r: 1 };
  let sunBody = null, sunMood = null;
  let bgImage, bgPixels, pixU, pixV, pixShade, pixAlt, pixDither, stars = [], slots = [];
  let skyColors = [], spaceColor = 0, atmosphere = 10;
  let climate = null, smog = 0, spin = 0, lastBg = -1e9, currentSea = seaThreshold;
  let landLife = 0, oceanLife = 0, ozone = 0;
  let iceCoverValue = 1, pressure = 0, haze = 0, sunBright = 1;
  let counts = {}, groundSprites = [], skySprites = [], jetCount = 0, jets = [], jetTimer = 0;
  let clouds = [], cloudCover = 0, storms = 0;
  let particles = [], bolts = [], smokeRate = 0, smokeTimer = 0;
  let sunPress = 0, comet = null;
  let onSun = () => {}, onZone = () => {}, onCloud = () => {}, onComet = () => {};

  /* ---------- helpers ---------- */

  function norm(v) {
    const l = Math.hypot(...v);
    return v.map(x => x / l);
  }

  function rng(seed) {
    return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  function lerp(a, b, k) {
    return a + (b - a) * k;
  }

  function clamp01(k) {
    return Math.max(0, Math.min(1, k));
  }

  function smooth(k) {
    return k * k * (3 - 2 * k);
  }

  // Fractal value noise on an equirectangular map that wraps around the planet.
  function fbm(rand, octaves) {
    const out = new Float32Array(TEX_W * TEX_H);
    let amp = 1, total = 0;
    for (let o = 0; o < octaves; o++) {
      const gw = 4 << o, gh = 2 << o;
      const grid = Array.from({ length: gw * (gh + 1) }, rand);
      for (let y = 0; y < TEX_H; y++) {
        const fy = y / TEX_H * gh, y0 = Math.floor(fy), ty = smooth(fy - y0);
        for (let x = 0; x < TEX_W; x++) {
          const fx = x / TEX_W * gw, x0 = Math.floor(fx), tx = smooth(fx - x0), x1 = (x0 + 1) % gw;
          const top = lerp(grid[y0 * gw + x0], grid[y0 * gw + x1], tx);
          const bottom = lerp(grid[(y0 + 1) * gw + x0], grid[(y0 + 1) * gw + x1], tx);
          out[y * TEX_W + x] += amp * lerp(top, bottom, ty);
        }
      }
      total += amp;
      amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= total;
    return out;
  }

  function percentile(values, p) {
    const sorted = Float32Array.from(values).sort();
    return sorted[Math.floor(sorted.length * p)];
  }

  function hex(h) {
    const n = parseInt(h.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }

  function mix(a, b, k) {
    return a.map((v, i) => v + (b[i] - v) * k);
  }

  function css([r, g, b]) {
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }

  function ramp(stops, t) {
    if (t <= stops[0][0]) return hex(stops[0][1]);
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        const [t0, c0] = stops[i - 1], [t1, c1] = stops[i];
        return mix(hex(c0), hex(c1), (t - t0) / (t1 - t0));
      }
    }
    return hex(stops[stops.length - 1][1]);
  }

  // ImageData is little-endian RGBA, so pack as ABGR.
  function pack([r, g, b], f = 1) {
    const c = v => Math.max(0, Math.min(255, Math.round(v * f)));
    return ((255 << 24) | (c(b) << 16) | (c(g) << 8) | c(r)) >>> 0;
  }

  function surfaceY(x) {
    return cy - Math.sqrt(Math.max(0, R * R - (x - cx) ** 2));
  }

  // Which domain is drawn at a logical pixel: the sky, or ocean or land on the turning planet.
  function zoneAt(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return null;
    const i = iy * W + ix;
    if (pixU[i] < 0) return 'atmosphere';
    const u = ((pixU[i] * TEX_W + spin * TEX_W) | 0) % TEX_W;
    return elev[pixV[i] * TEX_W + u] < currentSea ? 'ocean' : 'ground';
  }

  /* ---------- climate ---------- */

  // Latitude above which there is ice, from the share of the planet covered (area above latitude L is 1 - sin L).
  const iceLimit = () => iceCoverValue >= 0.995 ? -20 : iceCoverValue <= 0 ? 120 : Math.asin(1 - iceCoverValue) * 180 / Math.PI;
  // Visible thickness of the air: grows with gas pressure and with heat.
  const atmosphereHeight = t => Math.max(0.5, (H / 2) * pressure * (t < 0 ? lerp(0.25, 0.6, clamp01((t + 59) / 59)) : lerp(0.6, 1.3, clamp01(t / 20))));
  // Planets lit by a dim sun look darker.
  const surfaceLight = () => 0.25 + 0.75 * Math.sqrt(clamp01(sunBright / 0.7));

  function updateTexture(t) {
    const limit = iceLimit(), veg = landLife, light = surfaceLight();
    const sea = seaThreshold + (t > 0 ? Math.min(0.06, t * 0.004) : 0);
    currentSea = sea;
    const deep = mix(ramp(RAMPS.deep, t), BLOOM, oceanLife * 0.3);
    const shallow = mix(ramp(RAMPS.shallow, t), BLOOM, oceanLife * 0.45);
    const desert = ramp(RAMPS.desert, t);
    for (let v = 0; v < TEX_H; v++) {
      const lat = Math.abs(90 - (v + 0.5) / TEX_H * 180);
      for (let u = 0; u < TEX_W; u++) {
        const i = v * TEX_W + u, e = elev[i], m = moist[i];
        let c;
        if (lat + (e - seaThreshold) * 60 > limit) c = e < sea ? SEA_ICE : LAND_ICE;
        else if (e < sea - 0.06) c = deep;
        else if (e < sea) c = shallow;
        else if (e > sea + 0.14) c = MOUNTAIN;
        else if (m < veg * 0.5) c = FOREST;
        else if (m < veg) c = GRASS;
        else c = t < 2 ? ROCK : desert;
        texColors[i * 3] = pack(c, 1.18 * light);
        texColors[i * 3 + 1] = pack(c, light);
        texColors[i * 3 + 2] = pack(c, 0.68 * light);
      }
    }
  }

  function updateSky(t) {
    atmosphere = atmosphereHeight(t);
    // Methane haze without oxygen tints the sky orange, like Titan.
    const horizon = mix(ramp(RAMPS.horizon, t), HAZE, haze * 0.85), zenith = mix(ramp(RAMPS.zenith, t), HAZE, haze * 0.6);
    skyColors = [];
    for (let k = 0; k < SKY_BANDS; k++) {
      let c = mix(horizon, zenith, k / (SKY_BANDS - 1));
      const low = 1 - k / (SKY_BANDS * 0.4);
      if (low > 0) c = mix(c, SMOG, smog * low * 0.8);
      if (k === SKY_BANDS - 2) c = mix(c, OZONE, ozone * 0.25); // the ozone layer, high in the sky
      skyColors.push(pack(c));
    }
    spaceColor = pack(ramp(RAMPS.space, t));
  }

  /* ---------- layout ---------- */

  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    P = Math.max(2, Math.round(Math.min(vw, vh * 0.55) / 180));
    W = Math.ceil(vw / P);
    H = Math.ceil(vh / P);
    canvas.width = bg.width = W;
    canvas.height = bg.height = H;
    canvas.style.width = `${W * P}px`;
    canvas.style.height = `${H * P}px`;
    ctx.imageSmoothingEnabled = false;

    // Circle whose top is the middle of the screen and which passes through both bottom corners.
    R = (W * W + H * H) / (4 * H);
    cx = W / 2;
    cy = H / 2 + R;
    sun = { x: Math.round(W / 2), y: Math.round(H * 0.28), r: Math.round(Math.min(W * 0.1, H * 0.055)) };
    sunMood = null;

    bgImage = bgCtx.createImageData(W, H);
    bgPixels = new Uint32Array(bgImage.data.buffer);
    const n = W * H;
    pixU = new Float32Array(n);
    pixV = new Uint16Array(n);
    pixShade = new Uint8Array(n);
    pixAlt = new Float32Array(n);
    pixDither = new Float32Array(n);
    const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x, dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
        const dither = BAYER[(y & 3) * 4 + (x & 3)];
        if (d <= R) {
          const nx = dx / R, ny = -dy / R, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          const wy = ny * cosT - nz * sinT, wz = ny * sinT + nz * cosT;
          const lat = Math.asin(Math.max(-1, Math.min(1, wy)));
          pixU[i] = Math.atan2(nx, wz) / (2 * Math.PI) + 0.5;
          pixV[i] = Math.min(TEX_H - 1, Math.max(0, Math.floor((0.5 - lat / Math.PI) * TEX_H)));
          const b = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2] + dither * 0.12;
          pixShade[i] = b > 0.55 ? 0 : b > 0.2 ? 1 : 2;
        } else {
          pixU[i] = -1;
          pixAlt[i] = d - R;
          pixDither[i] = dither * 0.18;
        }
      }
    }

    const rand = rng(3);
    stars = Array.from({ length: Math.round(W * H / 900) }, () => ({
      x: Math.floor(rand() * W),
      y: Math.floor(rand() * H * 0.5),
      c: pack([255, 255, 255], 0.5 + rand() * 0.5),
    }));

    slots = [];
    for (let x = cx - R * 0.62; x <= cx + R * 0.62; x += 6) slots.push(Math.round(x));
    const order = rng(11);
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(order() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    clouds = Array.from({ length: MAX_CLOUDS }, () => ({
      x: rand() * W, alt: 0.3 + rand() * 0.4, w: 10 + Math.floor(rand() * 10), speed: 1.5 + rand() * 3,
    }));

    if (climate !== null) {
      updateSky(climate);
      layoutSprites();
    }
    lastBg = -1e9;
  }

  function layoutSprites() {
    groundSprites = [];
    skySprites = [];
    jetCount = 0;
    let slot = 0;
    for (const [id, n] of Object.entries(counts)) {
      if (!n || !SPRITES[id]) continue;
      const shown = Math.min(3, 1 + Math.floor(Math.log10(n)));
      if (id === 'jet') jetCount = shown;
      else if (id === 'mirror') {
        const spots = [[0.12, 0.2], [0.88, 0.22], [0.22, 0.12], [0.78, 0.1], [0.05, 0.3]];
        for (let k = 0; k < Math.min(spots.length, shown + 2); k++) skySprites.push({ id, x: W * spots[k][0], y: H * spots[k][1] });
      } else {
        for (let k = 0; k < shown && slot < slots.length; k++) groundSprites.push({ id, x: slots[slot++] });
      }
    }
    const free = slots.length - slot;
    const trees = Math.round(free * Math.max(0, landLife - 0.4) / 0.6 / (1 + (counts.forest || 0) / 5));
    for (let k = 0; k < trees; k++) groundSprites.push({ id: 'tree', x: slots[slot++] });
    for (const s of groundSprites) {
      const c = Sprites.canvas(s.id);
      s.dx = Math.round(s.x - c.width / 2);
      s.dy = Math.round(surfaceY(s.x)) - c.height + 1;
    }
    groundSprites.sort((a, b) => a.x - b.x);
  }

  /* ---------- drawing ---------- */

  function renderBackground() {
    const n = W * H, shift = spin * TEX_W;
    for (let i = 0; i < n; i++) {
      const u0 = pixU[i];
      if (u0 >= 0) {
        const u = ((u0 * TEX_W + shift) | 0) % TEX_W;
        bgPixels[i] = texColors[(pixV[i] * TEX_W + u) * 3 + pixShade[i]];
      } else {
        const band = Math.floor((pixAlt[i] / atmosphere + pixDither[i]) * SKY_BANDS);
        bgPixels[i] = band < SKY_BANDS ? skyColors[Math.max(0, band)] : spaceColor;
      }
    }
    for (const s of stars) {
      const i = s.y * W + s.x;
      if (pixU[i] < 0 && pixAlt[i] > atmosphere * 1.05) bgPixels[i] = s.c;
    }
    bgCtx.putImageData(bgImage, 0, 0);
  }

  function renderSunBody(mood, bright) {
    const dim = 1 - clamp01(bright / 0.7);
    const r = sun.r, size = r * 2 + 7, c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d'), m = size / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d = Math.hypot(x + 0.5 - m, y + 0.5 - m) / r + BAYER[(y & 3) * 4 + (x & 3)] * 0.12;
        let col = null;
        if (d < 0.45) col = '#fff6b0';
        else if (d < 0.75) col = '#ffd23f';
        else if (d < 0.93) col = '#ffa62a';
        else if (d < 1) col = '#e0701a';
        else if (d < 1.12 && (x + y) % 2 === 0) col = '#ff9a2a';
        if (col) {
          g.fillStyle = css(mix(hex(col), [58, 22, 14], dim * 0.85));
          g.fillRect(x, y, 1, 1);
        }
      }
    }
    const face = dim > 0.6 ? '#1a0a06' : '#7a3a00', ex = Math.round(r * 0.33), ey = Math.round(m - r * 0.15);
    g.fillStyle = face;
    // Closed, sleepy eyes until the sun is properly lit.
    const eyeH = dim > 0.6 ? 1 : 3;
    g.fillRect(Math.round(m - ex - 1), ey + (3 - eyeH), 2, eyeH);
    g.fillRect(Math.round(m + ex - 1), ey + (3 - eyeH), 2, eyeH);
    const mw = Math.round(r * 0.4);
    for (let x = -mw; x <= mw; x++) {
      const y = Math.round(m + r * 0.32 - (x * x) * (0.9 / r) * (mood < 0 ? -0.6 : 1));
      g.fillRect(Math.round(m + x), y, 1, 2);
    }
    if (mood > 0) {
      g.fillStyle = '#8ad8ff';
      g.fillRect(Math.round(m + r * 0.6), Math.round(m - r * 0.4), 2, 3);
      g.fillRect(Math.round(m + r * 0.6) + 2, Math.round(m - r * 0.4) + 3, 1, 1);
    }
    return c;
  }

  function drawSun(now, dt) {
    const mood = climate > 8 ? 1 : climate < -40 ? -1 : 0, key = `${mood}|${Math.round(sunBright * 20)}`;
    if (key !== sunMood) {
      sunMood = key;
      sunBody = renderSunBody(mood, sunBright);
    }
    sunPress = Math.max(0, sunPress - dt * 8);
    const press = sunPress > 0 ? 1 : 0, { x, y, r } = sun, a0 = now / 6000;
    const rayScale = clamp01((sunBright - 0.05) / 0.65);
    for (let k = 0; rayScale > 0 && k < 12; k++) {
      const a = a0 + k * Math.PI / 6, long = k % 2 === 0, len = Math.round(((long ? 8 : 5) - press * 2) * rayScale), w = long ? 2 : 1;
      ctx.fillStyle = long ? '#ffd23f' : '#ffb02e';
      for (let s = r + 4; s < r + 4 + len; s++) {
        ctx.fillRect(Math.round(x + Math.cos(a) * s - w / 2), Math.round(y + Math.sin(a) * s - w / 2), w, w);
      }
    }
    ctx.drawImage(sunBody, Math.round(x - sunBody.width / 2), Math.round(y - sunBody.height / 2) + press);
  }

  // Visible clouds, with storm clouds first. Each gets its screen box for drawing and tapping.
  function visibleClouds() {
    const n = Math.min(MAX_CLOUDS, Math.ceil(cloudCover * MAX_CLOUDS * 1.5));
    const out = [];
    for (let k = 0; k < n; k++) {
      const c = clouds[k], storm = k < storms, w = c.w + (storm ? 6 : 0);
      out.push({ cloud: c, storm, x: Math.round(c.x - w), y: Math.round(H / 2 - c.alt * Math.max(atmosphere, 40)), w });
    }
    return out;
  }

  function drawClouds(now, dt) {
    const white = css(mix([245, 248, 255], SMOG, smog * 0.7)), whiteShade = css(mix([200, 210, 225], SMOG, smog * 0.7));
    for (const v of visibleClouds()) {
      v.cloud.x = (v.cloud.x + v.cloud.speed * dt) % (W + v.w);
      const { x, y, w, storm } = v;
      ctx.fillStyle = storm ? '#5a5a78' : white;
      ctx.fillRect(x + 2, y - 1, w - 4, 1);
      if (w > 10) ctx.fillRect(x + 4, y - 2, w - 9, 1);
      if (storm) ctx.fillRect(x + 6, y - 3, w - 14, 1);
      ctx.fillRect(x, y, w, 2);
      ctx.fillStyle = storm ? '#3a3a52' : whiteShade;
      ctx.fillRect(x + 1, y + 2, w - 2, storm ? 2 : 1);
      if (storm && Math.floor(now / 90 + v.cloud.alt * 50) % 23 === 0) {
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(x + Math.floor(w / 2), y + 4, 1, 2);
      }
    }
  }

  // A zigzag bolt from a storm cloud down to the surface. Returns where it hit.
  function strike(v) {
    let x = v.x + Math.floor(v.w / 2), y = v.y + 4;
    const groundY = Math.round(surfaceY(x)) + 2, points = [];
    while (y < groundY) {
      points.push([x, y]);
      y += 1;
      if (Math.random() < 0.35) x += Math.random() < 0.5 ? -1 : 1;
    }
    bolts.push({ points, life: 0.25 });
    for (let k = 0; k < 6; k++) {
      particles.push({ x, y: groundY - 2, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 30, life: 0.4, max: 0.4, size: 1, color: '#fff3a0' });
    }
    return { zone: zoneAt(x, groundY), x: x * P, y: groundY * P };
  }

  function rain(v) {
    for (let k = 0; k < 14; k++) {
      const x = v.x + 1 + Math.random() * (v.w - 2), groundY = surfaceY(x), time = 0.4 + Math.random() * 0.3;
      particles.push({ x, y: v.y + 3, vx: 0, vy: (groundY - v.y - 3) / time, life: time, max: time, size: 1, color: '#7ab8ff' });
    }
  }

  function drawBolts(dt) {
    bolts = bolts.filter(b => (b.life -= dt) > 0);
    for (const b of bolts) {
      ctx.fillStyle = b.life > 0.12 ? '#ffffff' : '#ffe066';
      for (const [x, y] of b.points) ctx.fillRect(x, y, 1, 1);
    }
  }

  function drawSprites(now, dt) {
    for (const s of skySprites) {
      if (Math.floor(now / 400 + s.x) % 7 === 0) continue; // twinkle
      ctx.drawImage(Sprites.canvas(s.id), Math.round(s.x), Math.round(s.y));
    }
    if (jetCount) {
      jetTimer -= dt;
      if (jetTimer <= 0) {
        jetTimer = 8 / jetCount;
        jets.push({ x: -10, y: Math.round(Math.max(H * 0.2, H / 2 - atmosphere * (0.4 + Math.random() * 0.3))) });
      }
    }
    const jet = Sprites.canvas('jet');
    jets = jets.filter(j => j.x < W + 10);
    for (const j of jets) {
      j.x += 30 * dt;
      ctx.drawImage(jet, Math.round(j.x), j.y);
      if (Math.random() < 0.6) particles.push({ x: j.x, y: j.y + 2, vx: 0, vy: 0, life: 1.5, max: 1.5, size: 1, color: '#e8eef8' });
    }
    for (const s of groundSprites) ctx.drawImage(Sprites.canvas(s.id), s.dx, s.dy);
  }

  function drawComet(dt) {
    if (!comet) return;
    comet.x += comet.vx * dt;
    comet.y += comet.vy * dt;
    if (comet.x > W + 10) {
      comet = null;
      return;
    }
    if (Math.random() < 0.9) {
      particles.push({ x: comet.x, y: comet.y, vx: -6, vy: -2, life: 0.8, max: 0.8, size: 1, color: Math.random() < 0.5 ? '#bfe8ff' : '#ffffff' });
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(comet.x) - 1, Math.round(comet.y) - 1, 3, 3);
    ctx.fillStyle = '#bfe8ff';
    ctx.fillRect(Math.round(comet.x) - 2, Math.round(comet.y), 1, 1);
  }

  function emitSmoke(dt) {
    if (!smokeRate) return;
    const sources = groundSprites.filter(s => SMOKY.has(s.id));
    if (!sources.length) return;
    smokeTimer += dt * smokeRate;
    const grey = Math.round(150 - smog * 70);
    while (smokeTimer > 1) {
      smokeTimer -= 1;
      const s = sources[Math.floor(Math.random() * sources.length)];
      particles.push({
        x: s.dx + Math.random() * 4, y: s.dy, vx: 1 + Math.random() * 3, vy: -(3 + Math.random() * 4),
        life: 3, max: 3, size: Math.random() < 0.5 ? 1 : 2, color: `rgb(${grey},${grey - 6},${grey - 12})`,
      });
    }
  }

  function drawParticles(dt) {
    const next = [];
    for (const p of particles) {
      p.life -= dt;
      if (p.life <= 0) {
        p.done?.(next);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.trail) next.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.15, max: 0.15, size: 1, color: '#ffe066' });
      ctx.globalAlpha = Math.max(0.15, Math.ceil(p.life / p.max * 4) / 4);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      next.push(p);
    }
    ctx.globalAlpha = 1;
    particles = next.length > 600 ? next.slice(-600) : next;
  }

  function draw(now, dt) {
    if (!W) return;
    spin = (spin + dt / SPIN_SECONDS) % 1;
    if (now - lastBg > 120) {
      renderBackground();
      lastBg = now;
    }
    ctx.drawImage(bg, 0, 0);
    drawSun(now, dt);
    drawClouds(now, dt);
    drawBolts(dt);
    drawSprites(now, dt);
    drawComet(dt);
    emitSmoke(dt);
    drawParticles(dt);
  }

  /* ---------- input ---------- */

  canvas.addEventListener('pointerdown', e => {
    const x = e.clientX / P, y = e.clientY / P;
    if (comet && Math.hypot(x - comet.x, y - comet.y) < 10) {
      e.preventDefault();
      comet = null;
      onComet(e.clientX, e.clientY);
      return;
    }
    if (Math.hypot(x - sun.x, y - sun.y) <= sun.r + 10) {
      e.preventDefault();
      sunPress = 1;
      onSun(e.clientX, e.clientY);
      return;
    }
    const hit = visibleClouds().find(v => x >= v.x - 3 && x <= v.x + v.w + 3 && y >= v.y - 6 && y <= v.y + 6);
    if (hit) {
      e.preventDefault();
      if (hit.storm) {
        const s = strike(hit);
        onCloud('storm', s.zone, s.x, s.y);
      } else {
        rain(hit);
        onCloud('rain', null, e.clientX, e.clientY);
      }
      return;
    }
    const zone = zoneAt(x, y);
    if (!zone) return;
    const color = { atmosphere: '#a8dcff', ocean: '#3a8ad8', ground: '#c8a070' }[zone];
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      particles.push({ x, y, vx: Math.cos(a) * 18, vy: Math.sin(a) * 18, life: 0.3, max: 0.3, size: 1, color });
    }
    onZone(zone);
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('resize', resize);

  /* ---------- public API ---------- */

  return {
    init() {
      resize();
    },
    draw,
    setClimate(t) {
      if (climate !== null && Math.abs(t - climate) < 0.05) return;
      climate = t;
      updateTexture(t);
      updateSky(t);
      lastBg = -1e9;
    },
    // How green the land is and how much life colors the ocean (0..1 each), and the ozone layer (0..1).
    setLife(land, ocean, oz) {
      const changed = Math.abs(land - landLife) > 0.02 || Math.abs(ocean - oceanLife) > 0.02;
      const ozChanged = Math.abs(oz - ozone) > 0.02;
      if (!changed && !ozChanged) return;
      landLife = land;
      oceanLife = ocean;
      ozone = oz;
      if (climate === null) return;
      if (changed) {
        updateTexture(climate);
        layoutSprites();
      }
      updateSky(climate);
      lastBg = -1e9;
    },
    // Share of the planet under ice (0..1).
    setIce(cover) {
      if (Math.abs(cover - iceCoverValue) < 0.004) return;
      iceCoverValue = cover;
      if (climate !== null) updateTexture(climate);
      lastBg = -1e9;
    },
    // Air pressure (0..1, nitrogen atmosphere), methane haze (0..1) and sun brightness (0..1, today = 1).
    setAtmosphere(p, h, sun) {
      if (Math.abs(p - pressure) < 0.01 && Math.abs(h - haze) < 0.02 && Math.abs(sun - sunBright) < 0.01) return;
      const lightChanged = Math.abs(sun - sunBright) >= 0.01;
      pressure = p;
      haze = h;
      sunBright = sun;
      if (climate === null) return;
      updateSky(climate);
      if (lightChanged) updateTexture(climate);
      lastBg = -1e9;
    },
    setClouds(cover, stormCount) {
      cloudCover = cover;
      storms = stormCount;
    },
    // Lightning from a random storm cloud, for automatic storms.
    autoStrike() {
      const storm = visibleClouds().find(v => v.storm);
      return storm ? strike(storm) : null;
    },
    setIndustry(buildingCounts, perSecond) {
      const changed = Object.keys({ ...buildingCounts, ...counts }).some(k => buildingCounts[k] !== counts[k]);
      counts = { ...buildingCounts };
      if (changed) layoutSprites();
      smokeRate = Math.min(12, Math.log10(perSecond + 1) * 2);
    },
    ray() {
      const tx = cx + (Math.random() - 0.5) * R * 0.9, ty = surfaceY(tx), time = 0.35;
      particles.push({
        x: sun.x, y: sun.y, vx: (tx - sun.x) / time, vy: (ty - sun.y) / time, life: time, max: time,
        size: 2, color: '#fff3a0', trail: true,
        done: out => {
          for (let k = 0; k < 5; k++) {
            out.push({ x: tx, y: ty - 1, vx: (Math.random() - 0.5) * 30, vy: -Math.random() * 25, life: 0.4, max: 0.4, size: 1, color: '#ffb02e' });
          }
        },
      });
    },
    launchComet() {
      comet = { x: -5, y: H * (0.08 + Math.random() * 0.12), vx: W / 9, vy: H * 0.012 };
    },
    onSunTap(fn) {
      onSun = fn;
    },
    onZoneTap(fn) {
      onZone = fn;
    },
    onCloudTap(fn) {
      onCloud = fn;
    },
    onCometTap(fn) {
      onComet = fn;
    },
  };
})();
