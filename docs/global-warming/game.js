'use strict';

/* ================= Config ================= */

const SAVE_KEY = 'global-warming-save-v5';
const COST_GROWTH = 1.15;
const OFFLINE_RATE = 0.5;          // fraction of production earned while away
const OFFLINE_CAP_S = 12 * 3600;   // max offline time counted
const KELVIN = 273.15;
const CORE_K = 35;                 // surface of a planet with no sun, warmed only by its core (spec: Climate scale)
const OCEAN_SHARE = 0.62;          // share of the planet that is ocean
const SOUP_FULL = 100;
const STORM_CLOUDS = 0.35;         // cloud cover where storms start
const OZONE_FOR_LAND = 0.6;
const MAX_O2 = 21;
const LIFE_WINDOW = [11, 36];      // global mean °C range of complex life over the last 485 million years
const SUN_IGNITED = 0.7;           // the young sun shone at about 70% of today's brightness
const THERMAL_LAG_S = 5;           // how fast temperature follows its target on an ice-covered planet
const OCEAN_LAG_S = 60;            // extra lag once oceans are open: water takes long to heat

// Frozen gases and the temperature (K) where they turn into air.
const GASES = [
  { id: 'n2', name: 'Nitrogen', at: 63, title: 'Nitrogen ice melts', text: 'At −210 °C the nitrogen ice melts. Soon it boils into the first thin air.' },
  { id: 'air', name: 'Air', at: 77, title: 'The first atmosphere', text: 'Nitrogen boils at −196 °C. The planet has air, and air can hold heat.' },
  { id: 'ch4', name: 'Methane', at: 112, title: 'Methane thaws', text: 'At −161 °C methane becomes gas. It traps heat, and the sky turns hazy orange.' },
  { id: 'co2', name: 'Carbon dioxide', at: 195, title: 'CO₂ thaws', text: 'At −78 °C the CO₂ ice turns to gas. The greenhouse effect kicks in.' },
];

// The early game unlocks the planet in a fixed order. See spec.md, "Unlock sequence".
const STEPS = [
  { name: 'Light the sun', goal: 'Tap the dark sun until it ignites. Each gas thaws at its real temperature.' },
  { name: 'Melt ice', goal: 'Reach 0°C. Brighten the sun, and let volcanoes pump CO₂ and darken the ice with dust.', unlockText: 'The planet is a snowball under a real atmosphere. Melt it.' },
  { name: 'Ocean', goal: 'Open 30% of the planet to water. Dark water absorbs sunlight, so the thaw speeds up: lower volcanic activity in the Sun tab to avoid a hothouse.', unlockText: 'Open water at 0°C! Dark water absorbs sunlight, so warming speeds up. Turn volcanic activity down in the Sun tab to avoid overheating.', tab: 'ocean' },
  { name: 'Clouds', goal: `Warm water evaporates. Build cloud cover to ${STORM_CLOUDS * 100}% so storms form. Tap clouds for rain: it washes minerals into the sea.`, unlockText: 'Water vapor rises. The first clouds form.' },
  { name: 'Thunder', goal: 'Tap storm clouds to strike lightning into the ocean. Fill the primordial soup.', unlockText: 'Storms! Tap a dark cloud to strike lightning.' },
  { name: 'Life', goal: 'The first cell is spreading through the ocean.', unlockText: 'Lightning in the soup made something... alive. The first cell!', tab: 'ocean' },
  { name: 'Water evolution', goal: `Evolve ocean life with DNA and keep the planet between ${LIFE_WINDOW[0]} and ${LIFE_WINDOW[1]}°C. Land opens at ${OZONE_FOR_LAND * 100}% ozone.`, unlockText: 'Life is established. Spend DNA to evolve. Life cools the planet: watch the temperature.', tab: 'ocean' },
  { name: 'Land', goal: 'Evolve land life. The first species that flies opens the sky.', unlockText: 'The ozone layer shields the land. Life can leave the water!', tab: 'ground' },
  { name: 'Air', goal: 'Life rules the planet. The Age of Dinosaurs is coming next.', unlockText: 'Something has taken to the air. The sky is alive!', tab: 'atmosphere' },
];

const TABS = {
  sun: { step: 0, hint: '' },
  ocean: { step: 2, hint: 'The ocean is frozen solid. Melt the ice first.' },
  ground: { step: 7, hint: 'The land is lifeless rock. Life must leave the ocean first.' },
  atmosphere: { step: 8, hint: 'Nothing lives in the sky yet. Something has to learn to fly.' },
  life: { step: 5, hint: 'There is no life yet. Lightning in the ocean will start it.' },
  world: { step: 0, hint: '' },
};

// Buildings bought with Energy. Cost grows 15% per copy.
const BUILDINGS = [
  { id: 'wind', icon: 'wind', tab: 'sun', step: 0, name: 'Solar Wind', desc: 'A steady stream from the sun. Energy, and it keeps the sun burning.', cost: 15, energy: 0.3, ignition: 0.002 },
  { id: 'volcano', icon: 'vent', tab: 'sun', step: 1, name: 'Volcano', desc: 'The planet\'s core pushes CO₂ into the air. Ash darkens the ice.', cost: 60, energy: 0.5, co2: 8, dust: 0.04 },
  { id: 'current', icon: 'wave', tab: 'ocean', step: 2, name: 'Warm Current', desc: 'Carries tropical heat toward the poles, so ice retreats at lower temperatures.', cost: 300, energy: 1, iceShift: 0.4 },
  { id: 'vent', icon: 'vent', tab: 'ocean', step: 2, name: 'Hydrothermal Vent', desc: 'Hot water on the sea floor. Minerals and a little methane.', cost: 900, energy: 3, minerals: 0.2, ch4: 0.005 },
  { id: 'storm', icon: 'bolt', tab: 'ocean', step: 4, name: 'Thunderstorm', desc: 'Strikes lightning on its own now and then.', cost: 2500, energy: 5, lightning: 0.08 },
];

// One-time upgrades bought with Energy.
const UPGRADES = [
  { id: 'bright', icon: 'sunicon', tab: 'sun', step: 0, name: 'Stoke the Core', desc: 'Sun taps x2.', cost: 25, tapMult: 2 },
  { id: 'flare', icon: 'sunicon', tab: 'sun', step: 0, name: 'Solar Flares', desc: 'Sun taps x2.', cost: 400, tapMult: 2 },
  { id: 'sun1', icon: 'sunicon', tab: 'sun', step: 1, name: 'Sun Matures I', desc: 'The young sun brightens: 70% to 78% of today.', cost: 200, sun: 0.78 },
  { id: 'sun2', icon: 'sunicon', tab: 'sun', step: 1, name: 'Sun Matures II', desc: 'The sun brightens to 86% of today.', cost: 2000, sun: 0.86 },
  { id: 'sun3', icon: 'sunicon', tab: 'sun', step: 2, name: 'Sun Matures III', desc: 'The sun brightens to 93% of today.', cost: 15000, sun: 0.93 },
  { id: 'sun4', icon: 'sunicon', tab: 'sun', step: 5, name: 'Sun Matures IV', desc: 'The sun reaches today\'s brightness.', cost: 80000, sun: 1 },
  { id: 'spots', icon: 'sunicon', tab: 'sun', step: 2, name: 'Sunspot Cycle', desc: 'Sun taps x3.', cost: 6000, tapMult: 3 },
  { id: 'evap', icon: 'cloud', tab: 'ocean', step: 3, name: 'Evaporation', desc: 'Clouds form 50% faster.', cost: 3000, cloudMult: 1.5 },
  { id: 'downpour', icon: 'cloud', tab: 'ocean', step: 3, name: 'Downpour', desc: 'Rain washes out 3x minerals.', cost: 1500, rainMult: 3 },
  { id: 'bigbolt', icon: 'bolt', tab: 'ocean', step: 4, name: 'Bigger Bolts', desc: 'Lightning adds 2x soup.', cost: 4000, boltMult: 2 },
  { id: 'cosmic', icon: 'sunicon', tab: 'sun', step: 6, name: 'Cosmic Rays', desc: 'Sun taps cause mutations: +1 DNA per tap.', cost: 8000, tapDna: 1 },
  { id: 'tides', icon: 'wave', tab: 'ocean', step: 6, name: 'Tidal Pools', desc: 'Ocean life makes 2x DNA.', cost: 30000, dnaMult: { ocean: 2 } },
  { id: 'soil', icon: 'plant', tab: 'ground', step: 7, name: 'First Soil', desc: 'Land life makes 2x DNA.', cost: 3e5, dnaMult: { ground: 2 } },
];

// The tree of life for this slice. Habitat (domain) decides which step a species needs.
// dna and o2 are per second at full population. temp is the global mean range (°C) the species can live in.
const SPECIES = [
  { id: 'cell', icon: 'cell', domain: 'ocean', name: 'First Cell', desc: 'A blob of chemistry that copies itself.', dna: 0.5, temp: [0, 80] },
  { id: 'cyano', icon: 'cell', domain: 'ocean', parent: 'cell', name: 'Cyanobacteria', desc: 'Turns sunlight into sugar. Oxygen is the waste.', cost: 10, dna: 1, o2: 0.0015, temp: [0, 70] },
  { id: 'algae', icon: 'algae', domain: 'ocean', parent: 'cyano', name: 'Green Algae', desc: 'Pond scum with ambition.', cost: 40, dna: 1.5, o2: 0.002, temp: [0, 45] },
  { id: 'sponge', icon: 'cell', domain: 'ocean', parent: 'cyano', name: 'Sponges', desc: 'The first animals. They mostly sit there.', cost: 60, dna: 2, temp: [2, 38] },
  { id: 'plankton', icon: 'algae', domain: 'ocean', parent: 'algae', name: 'Phytoplankton', desc: 'Tiny drifters that make most of the oxygen.', cost: 150, dna: 3, o2: 0.004, temp: [0, 40] },
  { id: 'worm', icon: 'worm', domain: 'ocean', parent: 'sponge', name: 'Worms', desc: 'A body with a front and a back. Revolutionary.', cost: 220, dna: 3, temp: [2, 38] },
  { id: 'jelly', icon: 'jelly', domain: 'ocean', parent: 'sponge', name: 'Jellyfish', desc: 'No brain, no problem.', cost: 300, dna: 4, temp: [2, 40] },
  { id: 'arthropod', icon: 'bug', domain: 'ocean', parent: 'worm', name: 'Arthropods', desc: 'Armor and legs. Lots of legs.', cost: 700, dna: 6, temp: [4, 36] },
  { id: 'chordate', icon: 'fish', domain: 'ocean', parent: 'worm', name: 'Chordates', desc: 'A rod down the back. The start of a spine.', cost: 800, dna: 6, temp: [4, 36] },
  { id: 'trilobite', icon: 'bug', domain: 'ocean', parent: 'arthropod', name: 'Trilobites', desc: 'Sea-floor crawlers. Future fossils.', cost: 1500, dna: 10, temp: [4, 34] },
  { id: 'fish', icon: 'fish', domain: 'ocean', parent: 'chordate', name: 'Fish', desc: 'Fins, gills and a backbone.', cost: 2000, dna: 12, temp: [4, 34] },
  { id: 'shark', icon: 'fish', domain: 'ocean', parent: 'fish', name: 'Sharks', desc: 'Older than trees. Still hungry.', cost: 5000, dna: 25, temp: [6, 36] },
  { id: 'lobefin', icon: 'fish', domain: 'ocean', parent: 'fish', name: 'Lobe-finned Fish', desc: 'Fins that look suspiciously like legs.', cost: 6000, dna: 25, temp: [6, 34] },
  { id: 'moss', icon: 'plant', domain: 'ground', parent: 'algae', name: 'Mosses', desc: 'The first plants on land. Green, soft, damp.', cost: 4000, dna: 15, o2: 0.004, green: 0.25, temp: [2, 34] },
  { id: 'fern', icon: 'plant', domain: 'ground', parent: 'moss', name: 'Ferns', desc: 'Plants with plumbing. They can grow tall.', cost: 10000, dna: 30, o2: 0.006, green: 0.3, temp: [6, 36] },
  { id: 'insect', icon: 'bug', domain: 'ground', parent: 'arthropod', name: 'Insects', desc: 'Six legs, endless numbers.', cost: 12000, dna: 40, temp: [8, 38] },
  { id: 'conifer', icon: 'tree', domain: 'ground', parent: 'fern', name: 'Conifers', desc: 'The first real forests.', cost: 30000, dna: 80, o2: 0.01, green: 0.35, temp: [2, 32] },
  { id: 'amphibian', icon: 'frog', domain: 'ground', parent: 'lobefin', name: 'Amphibians', desc: 'Half fish, half frog, all damp.', cost: 35000, dna: 90, temp: [10, 34] },
  { id: 'reptile', icon: 'frog', domain: 'ground', parent: 'amphibian', name: 'Reptiles', desc: 'Eggs with shells. No more ponds needed.', cost: 100000, dna: 200, temp: [12, 38] },
  { id: 'flyer', icon: 'fly', domain: 'atmosphere', parent: 'insect', name: 'Flying Insects', desc: 'The first wings on the planet.', cost: 60000, dna: 150, temp: [10, 38] },
];
const SPECIES_BY_ID = Object.fromEntries(SPECIES.map(s => [s.id, s]));
// Step a habitat needs before its species can evolve. Flyers only need land; evolving one opens step 8.
const DOMAIN_STEP = { ocean: 6, ground: 7, atmosphere: 7 };
// Flyers are listed on the Land tab until the sky opens.
const speciesTab = s => (s.domain === 'atmosphere' && state.step < 8 ? 'ground' : s.domain);

const NEWS = [
  { step: 0, items: ['Forecast: dark. Also cold. Mostly dark.', 'Planet reports "it\'s a bit chilly, 35 kelvin".', 'Sun still asleep. Planet tries knocking.', 'Nitrogen frozen solid. Nobody can breathe it anyway.'] },
  { step: 1, items: ['Snowball Earth: 100% ice, 0% fun.', 'Weather forecast: cold. Forever, apparently.', 'Volcanoes: the only warm thing for miles.', 'Local glacier wins "Most Glacier" award again.'] },
  { step: 2, items: ['Equator now slushy. Ice is nervous.', 'First wave spotted. It was small.', 'Ocean reports "a bit of a draft".', 'Sun: "Keep tapping, it\'s working!"'] },
  { step: 3, items: ['First cloud forms. Looks like a cloud.', 'Forecast: 100% chance of the first rain ever.', 'Puddles everywhere. Nobody to jump in them.'] },
  { step: 4, items: ['Thunder heard for the first time. Nobody is scared yet.', 'Lightning strikes ocean. Ocean unbothered.', 'Primordial soup: needs more seasoning.'] },
  { step: 5, items: ['Scientists would be thrilled, if they existed.', 'First cell copies itself. Then again. Then again.'] },
  { step: 6, items: ['Ocean turns slightly green. Algae claims credit.', 'Oxygen eats methane. Planet feels a chill.', 'Jellyfish still has no brain. Doing fine.'] },
  { step: 7, items: ['Moss conquers rock. Rock declines to comment.', 'Fish takes first step on land. Regrets it briefly.', 'Ferns everywhere. Coal deposits forming quietly.'] },
  { step: 8, items: ['Insect learns to fly. Immediately annoying.', 'Sky now has bugs in it. Progress.', 'Somewhere, a dragonfly the size of a seagull.'] },
];

/* ================= State ================= */

const freshState = () => ({
  step: 0,
  energy: 0,
  totalEnergy: 0,
  tempK: CORE_K,
  ignition: 0,      // 0..1, how far the sun is lit
  pressure: 0,      // nitrogen air, 0..1 bar
  co2: 0,           // ppm in the air
  co2Ice: 5000,     // ppm still frozen on the surface
  ch4: 0,           // ppm in the air
  ch4Ice: 10,       // ppm still frozen on the surface
  ice: 1,           // share of the planet under ice; follows temperature with a lag
  gases: 0,         // how many gas thaw events have happened
  volcanoActivity: 1,
  clouds: 0,
  minerals: 0,
  soup: 0,
  dna: 0,
  o2: 0,
  clicks: 0,
  strikes: 0,
  comets: 0,
  extinct: [],
  over: null,       // reason text once the run has ended
  buildings: {},
  upgrades: [],
  species: {},
  start: Date.now(),
  lastTick: Date.now(),
});

let state = freshState();
let owned = new Set();   // purchased upgrade ids
let rates = {};          // per-second rates and climate parts, recalculated often
let buyAmount = 1;
let skipSave = false;

function load() {
  // Open the game with ?reset to start over with a fresh save.
  const params = new URLSearchParams(location.search);
  if (params.has('reset')) {
    localStorage.removeItem(SAVE_KEY);
    history.replaceState(null, '', location.pathname);
  }
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) state = { ...freshState(), ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Save load failed', e);
  }
  owned = new Set(state.upgrades);
}

function save() {
  if (skipSave) return;
  state.upgrades = [...owned];
  state.lastTick = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Save failed', e);
  }
}

/* ================= Climate model ================= */

const count = id => state.buildings[id] || 0;
const pop = id => state.species[id] ?? -1;      // -1 = not evolved, -2 = extinct
const evolved = id => pop(id) >= 0;
const isExtinct = id => state.extinct.includes(id);
const clamp01 = k => Math.max(0, Math.min(1, k));
const log2 = Math.log2;

const tempC = () => state.tempK - KELVIN;

function mult(key) {
  return UPGRADES.reduce((m, u) => (owned.has(u.id) && u[key] ? m * u[key] : m), 1);
}

const tapPower = () => mult('tapMult');
const soupMult = () => (1 + Math.log10(1 + state.minerals)) * mult('boltMult');

// Sun brightness as a share of today's: rises to 70% while igniting (cubed, so the first glow is faint),
// then the "Sun Matures" upgrades brighten it toward today's level, as the real sun did.
function sunBrightness() {
  const lit = SUN_IGNITED * state.ignition ** 3;
  return UPGRADES.reduce((s, u) => (owned.has(u.id) && u.sun ? Math.max(s, u.sun) : s), lit);
}

// Ice the planet settles toward at a temperature. Water first opens at 0 °C; ice sheets are gone at about 22 °C.
function iceTarget(c = tempC() + Math.min(4, count('current') * 0.4)) {
  if (c <= 0) return 1;
  if (c <= 14) return 1 - 0.9 * Math.sqrt(c / 14);
  return Math.max(0, 0.1 * (1 - (c - 14) / 8));
}

const iceCover = () => state.ice;
const openOcean = () => OCEAN_SHARE * (1 - iceCover());
const ozone = () => clamp01(state.o2 / 2);   // ozone forms as O2 approaches 2%
const volcanoes = () => count('volcano') * state.volcanoActivity;

// Target temperature (K) from a simple energy balance:
// sunlight absorbed (less what ice, clouds and dust reflect) plus the greenhouse effect of the air.
function climate() {
  const ice = iceCover();
  const dust = state.step >= 1 ? Math.min(0.8, volcanoes() * 0.04) : 0;
  const albedo = 0.22 + 0.43 * ice * (1 - 0.5 * dust) + 0.08 * state.clouds;
  const sunK = 255 * Math.pow(Math.max(0, sunBrightness() * (1 - albedo) / 0.7), 0.25);
  const bare = Math.pow(sunK ** 4 + CORE_K ** 4, 0.25);
  // Greenhouse: each doubling of CO2 adds a few degrees; thin air holds less heat; water vapor amplifies it.
  const gasK = 3.3 * log2(1 + state.co2 / 10) + 2 * log2(1 + state.ch4 / 0.5);
  const greenhouse = gasK * (0.3 + 0.7 * state.pressure) * (1 + 0.45 * (1 - ice));
  return { target: bare + greenhouse, albedo, dust, greenhouse, sunK: bare };
}

function recalc() {
  const r = { energy: 0, ignition: 0, co2: 0, ch4: 0, minerals: 0, lightning: 0, dna: 0, o2: 0, clouds: 0, green: 0, life: 0, photo: 0 };
  for (const b of BUILDINGS) {
    const n = count(b.id);
    r.energy += (b.energy || 0) * n;
    r.ignition += (b.ignition || 0) * n;
    r.minerals += (b.minerals || 0) * n;
    r.lightning += (b.lightning || 0) * n;
    r.ch4 += (b.ch4 || 0) * n;
  }
  // Volcanoes: a little natural outgassing always, plus the player's volcanoes.
  if (state.step >= 1) r.co2 += (2 + volcanoes() * 8);
  // Evaporation from open water, faster when the air is warm.
  if (state.step >= 3) r.clouds = 0.03 * openOcean() * Math.max(0, tempC() / 14 + 0.3) * mult('cloudMult');

  for (const s of SPECIES) {
    const p = pop(s.id);
    if (p < 0) continue;
    const dnaMult = UPGRADES.reduce((m, u) => (owned.has(u.id) && u.dnaMult?.[s.domain] ? m * u.dnaMult[s.domain] : m), 1);
    r.dna += s.dna * p * dnaMult;
    r.o2 += (s.o2 || 0) * p;
    if (s.green) r.green += s.green * p;
    if (s.domain === 'ocean') r.life += p;
  }
  r.climate = climate();
  rates = r;
}

function addEnergy(n) {
  state.energy += n;
  state.totalEnergy += n;
}

// How well a species fits the current temperature: 1 inside its range, negative outside.
function fitness(s, c) {
  const [lo, hi] = s.temp;
  if (c >= lo && c <= hi) return 1;
  return -Math.min(1, (c < lo ? lo - c : c - hi) / 6);
}

// Advance the world by dt seconds.
function simulate(dt) {
  addEnergy(rates.energy * dt);
  state.ignition = Math.min(1, state.ignition + rates.ignition * dt);

  // Frozen gases turn into air at their real temperatures.
  const k = state.tempK;
  if (k >= 77) state.pressure = Math.min(1, state.pressure + 0.08 * dt);
  if (k >= 112 && state.ch4Ice > 0) {
    const out = Math.min(state.ch4Ice, 2 * dt);
    state.ch4Ice -= out;
    state.ch4 += out;
  }
  if (k >= 195 && state.co2Ice > 0) {
    const out = Math.min(state.co2Ice, 120 * dt);
    state.co2Ice -= out;
    state.co2 += out;
  }

  // Carbon cycle: volcanoes add CO2; rock weathering removes it when warm and wet (the planet's thermostat);
  // photosynthesis removes it too. Oxygen destroys methane.
  const c = tempC(), open = 1 - iceCover();
  const weathering = 0.002 * state.co2 * Math.max(0, c / 15) ** 1.5 * open;   // speeds up sharply in the heat
  const photosynthesis = rates.o2 * 1500 * state.co2 / (state.co2 + 1000);   // slows when CO2 runs low
  state.co2 = Math.max(0, state.co2 + (rates.co2 - weathering - photosynthesis) * dt);
  state.ch4 = Math.max(0, state.ch4 + (rates.ch4 - state.ch4 * 0.03 * clamp01(state.o2)) * dt);

  // Temperature follows its target with a lag. Ice sheets grow and melt more slowly still.
  const lag = THERMAL_LAG_S + OCEAN_LAG_S * (1 - state.ice);
  state.tempK += (rates.climate.target - state.tempK) * Math.min(1, dt / lag);
  const iceGoal = iceTarget();
  state.ice += (iceGoal - state.ice) * Math.min(1, dt * (iceGoal > state.ice ? 0.005 : 0.012));

  state.minerals += rates.minerals * dt;
  state.dna += rates.dna * dt;
  state.o2 += rates.o2 * (1 - state.o2 / MAX_O2) * dt;   // levels off near today's 21%
  // Clouds form from evaporation and rain out at 5% per second.
  if (state.step >= 3) state.clouds = clamp01(state.clouds + (rates.clouds - state.clouds * 0.05) * dt);

  // Species grow toward a full population inside their temperature range and die back outside it.
  for (const id of Object.keys(state.species)) {
    const p = state.species[id];
    if (p < 0) continue;
    const f = fitness(SPECIES_BY_ID[id], c);
    const next = f > 0 ? Math.min(1, p + p * (1 - p) * 0.25 * dt) : p * (1 + f * 0.15 * dt);
    if (next < 0.005) {
      state.species[id] = -2;
      state.extinct.push(id);
      onExtinct(SPECIES_BY_ID[id], c);
    } else {
      state.species[id] = next;
    }
  }
}

function onExtinct(s, c) {
  const why = c < s.temp[0] ? 'too cold' : 'too hot';
  toast(`Extinct: ${s.name}`, `It got ${why} at ${c.toFixed(1)}°C. Its descendants can no longer evolve.`);
  showNews(`${s.name} gone forever. Planet ${why}.`);
}

function checkGases() {
  while (state.gases < GASES.length && state.tempK >= GASES[state.gases].at) {
    const g = GASES[state.gases++];
    toast(g.title, g.text);
    showNews(g.text);
  }
}

/* ================= Tree status and game over ================= */

const CHILDREN = {};
for (const s of SPECIES) if (s.parent) (CHILDREN[s.parent] ||= []).push(s);

// A species is blocked for good when its parent died out before it evolved, or its parent is blocked.
function isBlocked(s) {
  if (!s.parent || evolved(s.id) || isExtinct(s.id)) return false;
  return isExtinct(s.parent) || isBlocked(SPECIES_BY_ID[s.parent]);
}

// alive, extinct, available (can evolve now), waiting (possible later) or blocked.
function speciesStatus(s) {
  if (isExtinct(s.id)) return 'extinct';
  if (evolved(s.id)) return 'alive';
  if (isBlocked(s)) return 'blocked';
  if (evolved(s.parent) && parentReady(s) && state.step >= DOMAIN_STEP[s.domain]) return 'available';
  return 'waiting';
}

function treeSummary() {
  const counts = { alive: 0, extinct: 0, available: 0, waiting: 0, blocked: 0 };
  for (const s of SPECIES) counts[speciesStatus(s)]++;
  return counts;
}

// The run ends when nothing is alive, or when every species still to evolve is blocked.
function checkGameOver() {
  if (state.over || state.step < 5) return;
  const t = treeSummary();
  if (t.alive === 0) gameOver('Life is gone. Every species on the planet is extinct.');
  else if (t.available + t.waiting === 0 && t.blocked > 0) gameOver('Every branch of the tree of life is blocked. Nothing new can ever evolve.');
}

function gameOver(reason) {
  state.over = reason;
  save();
  showGameOver();
}

function showGameOver() {
  const t = treeSummary();
  $('#gameover-reason').textContent = state.over;
  $('#gameover-stats').innerHTML = [
    ['Reached', `Step ${state.step}: ${STEPS[state.step].name}`],
    ['Species evolved', `${t.alive + t.extinct} / ${SPECIES.length}`],
    ['Extinct', `${t.extinct}`],
    ['Blocked', `${t.blocked}`],
    ['Temperature', fmtTemp(tempC())],
    ['Time played', fmtTime((Date.now() - state.start) / 1000)],
  ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  $('#gameover').classList.remove('hidden');
}

function checkSteps() {
  const c = tempC();
  const ready = [
    () => state.ignition >= 1 && state.co2Ice <= 0 && c >= -45,
    () => c >= 0,
    () => openOcean() >= 0.3,
    () => state.clouds >= STORM_CLOUDS,
    () => state.soup >= SOUP_FULL,
    () => pop('cell') >= 0.5,
    () => ozone() >= OZONE_FOR_LAND,
    () => evolved('flyer'),
  ][state.step];
  if (!ready || !ready()) return;
  state.step++;
  if (state.step === 5) state.species.cell = 0.02;
  const s = STEPS[state.step];
  toast(`Step ${state.step}: ${s.name}`, s.unlockText);
  showNews(s.unlockText);
  buzz([30, 50, 30]);
  recalc();
  renderTabs();
  if (s.tab) openTab(s.tab);
  else renderTab(currentTab, true);
}

/* ================= Formatting ================= */

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 100 && n % 1 ? n.toFixed(1) : Math.floor(n).toString();
  const tier = Math.floor(Math.log10(n) / 3);
  if (tier >= SUFFIXES.length) return n.toExponential(2);
  const v = n / 10 ** (tier * 3);
  return `${v.toFixed(v < 100 ? 2 : 1)}${SUFFIXES[tier]}`;
}

function fmtTime(s) {
  s = Math.floor(s);
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${s % 60}s` : `${s}s`;
}

const pct = v => `${Math.round(v * 100)}%`;
const fmtTemp = c => `${c.toFixed(1)}°C`;

/* ================= DOM ================= */

const $ = sel => document.querySelector(sel);
const el = {
  temp: $('#temp'), tempSub: $('#temp-sub'), hudLine: $('#hud-line'),
  fx: $('#fx'), news: $('#news'), sheet: $('#sheet'), toasts: $('#toasts'),
};

const spriteImg = id => `<img class="sprite" src="${Sprites.icon(id)}" alt="">`;

// Each tab is rebuilt only when its list of visible entries changes; otherwise only text updates.
const tabKeys = {};

function tabEntries(tab) {
  const entries = [];
  for (const b of BUILDINGS) if (b.tab === tab && state.step >= b.step) entries.push({ kind: 'building', item: b });
  for (const u of UPGRADES) if (u.tab === tab && state.step >= u.step && !owned.has(u.id)) entries.push({ kind: 'upgrade', item: u });
  for (const s of SPECIES) {
    if (speciesTab(s) !== tab) continue;
    const reachable = s.parent && state.step >= DOMAIN_STEP[s.domain] && (evolved(s.parent) || isExtinct(s.parent));
    if (evolved(s.id) || isExtinct(s.id) || reachable) entries.push({ kind: 'species', item: s });
  }
  return entries;
}

function meterHtml(label, cls) {
  return `<div class="meter-row"><span>${label}</span><b class="${cls}-v"></b></div><div class="meter"><i class="${cls}"></i></div>`;
}

function headHtml(tab) {
  if (tab === 'sun') {
    return `<p class="goal"></p>
      ${state.step === 0 ? meterHtml('Sun ignition', 'm-ignite') : meterHtml('Sun brightness', 'm-sun')}
      <p class="note m-air"></p>
      ${count('volcano') ? `<div class="meter-row"><span>Volcanic activity</span><b class="m-volc-v"></b></div>
        <input class="slider" id="volcano-activity" type="range" min="0" max="100" step="5">` : ''}`;
  }
  if (tab === 'ocean') {
    return `<p class="goal"></p>
      ${meterHtml('Open ocean', 'm-open')}
      ${state.step >= 3 ? meterHtml('Clouds', 'm-clouds') : ''}
      ${state.step >= 4 ? meterHtml('Primordial soup', 'm-soup') : ''}
      ${state.step >= 6 ? meterHtml('Ozone layer', 'm-ozone') : ''}
      ${state.step >= 3 ? '<p class="note m-minerals"></p>' : ''}`;
  }
  return '<p class="goal"></p>';
}

function renderTab(tab, force = false) {
  const root = $(`#${tab}`);
  if (!root || tab === 'world' || tab === 'life') return;
  const entries = tabEntries(tab);
  const key = `${state.step}|${count('volcano') > 0}|${entries.map(e => e.item.id + pop(e.item.id)).join()}`.replace(/0\.\d+/g, 'a');
  if (force || tabKeys[tab] !== key) {
    tabKeys[tab] = key;
    root.innerHTML = `<div class="domain-head">${headHtml(tab)}</div><ul class="list"></ul>`;
    const list = root.querySelector('.list');
    for (const e of entries) {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = `
        <div class="icon">${spriteImg(e.item.icon)}</div>
        <div class="info"><div class="name"></div><div class="desc"></div><div class="meta"></div></div>
        <div class="side"><div class="count"></div><div class="cost"></div></div>`;
      li.addEventListener('click', () => buy(e));
      e.li = li;
      list.appendChild(li);
    }
    root._entries = entries;
    const slider = root.querySelector('#volcano-activity');
    if (slider) {
      slider.value = Math.round(state.volcanoActivity * 100);
      slider.addEventListener('input', () => {
        state.volcanoActivity = slider.value / 100;
        recalc();
      });
    }
  }
  updateTab(tab, root);
}

function setMeter(root, cls, value, text) {
  const bar = root.querySelector(`.${cls}`);
  if (!bar) return;
  bar.style.width = pct(clamp01(value));
  root.querySelector(`.${cls}-v`).textContent = text ?? pct(value);
}

function buildingMeta(b) {
  const parts = [];
  if (b.energy) parts.push(`+${fmt(b.energy)} E/s`);
  if (b.ignition) parts.push('keeps the sun igniting');
  if (b.co2) parts.push(`+${b.co2} ppm CO₂/s`);
  if (b.iceShift) parts.push('ice retreats sooner');
  if (b.minerals) parts.push(`+${b.minerals} minerals/s`);
  if (b.lightning) parts.push('auto lightning');
  return parts.join(' · ') + ' each';
}

const parentReady = s => pop(s.parent) >= 0.5;

function updateTab(tab, root) {
  const goal = root.querySelector('.goal');
  if (goal) goal.textContent = `Goal: ${STEPS[state.step].goal}`;
  if (tab === 'sun') {
    setMeter(root, 'm-ignite', state.ignition);
    setMeter(root, 'm-sun', sunBrightness(), `${pct(sunBrightness())} of today`);
    const air = root.querySelector('.m-air');
    if (air) air.textContent = `Air: ${state.pressure.toFixed(2)} bar · CO₂ ${fmt(state.co2)} ppm · methane ${state.ch4.toFixed(1)} ppm · greenhouse +${rates.climate.greenhouse.toFixed(0)}°C`;
    const v = root.querySelector('.m-volc-v');
    if (v) v.textContent = pct(state.volcanoActivity);
  }
  if (tab === 'ocean') {
    setMeter(root, 'm-open', openOcean() / 0.3, pct(openOcean()));
    setMeter(root, 'm-clouds', state.clouds / STORM_CLOUDS, pct(state.clouds));
    setMeter(root, 'm-soup', state.soup / SOUP_FULL);
    setMeter(root, 'm-ozone', ozone() / OZONE_FOR_LAND, `${pct(ozone())} (O₂ ${state.o2.toFixed(2)}%)`);
    const minerals = root.querySelector('.m-minerals');
    if (minerals) minerals.textContent = `Minerals: ${fmt(state.minerals)}, lightning makes x${soupMult().toFixed(2)} soup`;
  }
  for (const e of root._entries || []) {
    const { item, li } = e, q = s => li.querySelector(s);
    if (e.kind === 'building') {
      const n = buyAmount === 'max' ? Math.max(1, maxAffordable(item)) : buyAmount;
      const cost = bulkCost(item, n);
      li.className = 'item' + (state.energy >= cost ? ' affordable' : '');
      q('.name').textContent = item.name + (n > 1 ? ` x${n}` : '');
      q('.desc').textContent = item.desc;
      q('.meta').textContent = buildingMeta(item);
      q('.count').textContent = count(item.id) || '';
      q('.cost').textContent = `${fmt(cost)} E`;
    } else if (e.kind === 'upgrade') {
      li.className = 'item' + (state.energy >= item.cost ? ' affordable' : '');
      q('.name').textContent = item.name;
      q('.desc').textContent = item.desc;
      q('.cost').textContent = `${fmt(item.cost)} E`;
    } else {
      const p = pop(item.id), range = `${item.temp[0]} to ${item.temp[1]}°C`;
      q('.name').textContent = item.name;
      q('.desc').textContent = item.desc;
      if (isExtinct(item.id)) {
        li.className = 'item extinct';
        q('.meta').textContent = `Lived at ${range}`;
        q('.cost').textContent = 'Extinct';
      } else if (p >= 0) {
        const f = fitness(item, tempC());
        li.className = 'item alive' + (f < 0 ? ' dying' : '');
        q('.meta').textContent = `Population ${pct(p)} · ${range}` + (f < 0 ? ' · DYING' : '') + (item.o2 ? ' · makes O₂' : '');
        q('.cost').textContent = f < 0 ? 'Dying' : 'Alive';
      } else if (isExtinct(item.parent)) {
        li.className = 'item extinct';
        q('.meta').textContent = `${SPECIES_BY_ID[item.parent].name} is extinct`;
        q('.cost').textContent = 'Locked';
      } else {
        li.className = 'item' + (state.dna >= item.cost && parentReady(item) ? ' affordable' : '');
        q('.meta').textContent = (parentReady(item) ? `Evolves from ${SPECIES_BY_ID[item.parent].name}` : `Needs ${SPECIES_BY_ID[item.parent].name} at 50%`) + ` · lives at ${range}`;
        q('.cost').textContent = `${fmt(item.cost)} DNA`;
      }
    }
  }
}

/* ================= Buying ================= */

function bulkCost(b, n) {
  const first = b.cost * COST_GROWTH ** count(b.id);
  return Math.ceil(first * (COST_GROWTH ** n - 1) / (COST_GROWTH - 1));
}

function maxAffordable(b) {
  const first = b.cost * COST_GROWTH ** count(b.id);
  return Math.floor(Math.log(state.energy * (COST_GROWTH - 1) / first + 1) / Math.log(COST_GROWTH));
}

function buy(e) {
  const { item } = e;
  if (e.kind === 'building') {
    const n = buyAmount === 'max' ? Math.max(1, maxAffordable(item)) : buyAmount;
    const cost = bulkCost(item, n);
    if (state.energy < cost) return;
    state.energy -= cost;
    state.buildings[item.id] = count(item.id) + n;
  } else if (e.kind === 'upgrade') {
    if (owned.has(item.id) || state.energy < item.cost) return;
    state.energy -= item.cost;
    owned.add(item.id);
  } else {
    if (evolved(item.id) || isExtinct(item.id) || state.dna < item.cost || !parentReady(item)) return;
    state.dna -= item.cost;
    state.species[item.id] = 0.05;
    toast(`Evolved: ${item.name}`, item.desc);
  }
  buzz(10);
  recalc();
  renderTab(currentTab);
}

/* ================= Tabs ================= */

let currentTab = 'sun';

function renderTabs() {
  document.querySelectorAll('#tabs button').forEach(btn => {
    btn.classList.toggle('locked', state.step < TABS[btn.dataset.tab].step);
  });
}

function openTab(tab, expand = true) {
  if (state.step < TABS[tab].step) {
    showNews(TABS[tab].hint);
    toast('Locked', TABS[tab].hint);
    return;
  }
  currentTab = tab;
  document.querySelectorAll('#tabs button').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
  document.querySelectorAll('.tab').forEach(n => n.classList.toggle('active', n.id === tab));
  $('#buy-amount').classList.toggle('hidden', !BUILDINGS.some(b => b.tab === tab && state.step >= b.step));
  if (expand) el.sheet.classList.remove('collapsed');
  if (tab === 'world') renderWorld();
  else if (tab === 'life') renderLife();
  else renderTab(tab);
}

document.querySelectorAll('#tabs button').forEach(btn => btn.addEventListener('click', () => {
  // Tapping the open tab folds the sheet away to show more of the planet.
  if (btn.dataset.tab === currentTab) el.sheet.classList.toggle('collapsed');
  else openTab(btn.dataset.tab);
}));

document.querySelectorAll('#buy-amount button').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('#buy-amount button').forEach(n => n.classList.remove('active'));
  btn.classList.add('active');
  buyAmount = btn.dataset.amount === 'max' ? 'max' : Number(btn.dataset.amount);
  renderTab(currentTab);
}));

/* ================= Life tab: the tree of life ================= */

const STATUS_TEXT = { alive: 'Alive', extinct: 'Extinct', available: 'Evolve', waiting: 'Later', blocked: 'Blocked' };

// Why a species cannot evolve yet, in a few words.
function waitReason(s) {
  if (!evolved(s.parent)) return `after ${SPECIES_BY_ID[s.parent].name}`;
  if (state.step < DOMAIN_STEP[s.domain]) return s.domain === 'ground' ? 'needs land (ozone)' : 'later step';
  if (!parentReady(s)) return `${SPECIES_BY_ID[s.parent].name} at 50%`;
  return `${fmt(s.cost)} DNA`;
}

function lifeNode(s) {
  const status = speciesStatus(s), p = pop(s.id);
  // Only species next to the known tree show their name; deeper ones stay a mystery.
  const known = status !== 'waiting' || evolved(s.parent) || isExtinct(s.parent);
  const blockedBy = status === 'blocked' ? [...ancestors(s)].find(a => isExtinct(a.id)) : null;
  let detail = '';
  if (status === 'alive') {
    const dying = fitness(s, tempC()) < 0;
    detail = `<span class="bar"><i style="width:${pct(p)}"></i></span>${dying ? '<em class="warn">dying</em>' : pct(p)}`;
  } else if (status === 'available') detail = `${fmt(s.cost)} DNA`;
  else if (status === 'waiting') detail = known ? waitReason(s) : '';
  else if (status === 'blocked') {
    const below = countDescendants(s);
    detail = `no ${blockedBy.name}${below ? ` · +${below}` : ''}`;
  }
  else if (status === 'extinct') detail = `${s.temp[0]}–${s.temp[1]}°C`;
  const affordable = status === 'available' && state.dna >= s.cost ? ' affordable' : '';
  // A blocked branch collapses into its first species; everything below it is blocked too.
  const kids = status === 'blocked' ? [] : CHILDREN[s.id] || [];
  return `<li>
    <div class="node ${status}${affordable}" data-id="${s.id}">
      <span class="node-icon">${known ? spriteImg(s.icon) : '<span class="q">?</span>'}</span>
      <span class="node-name">${known ? s.name : '???'}</span>
      <span class="node-detail">${detail}</span>
      <span class="node-status">${STATUS_TEXT[status]}</span>
    </div>
    ${kids.length ? `<ul>${kids.map(lifeNode).join('')}</ul>` : ''}
  </li>`;
}

function countDescendants(s) {
  return (CHILDREN[s.id] || []).reduce((n, k) => n + 1 + countDescendants(k), 0);
}

function* ancestors(s) {
  for (let a = SPECIES_BY_ID[s.parent]; a; a = SPECIES_BY_ID[a.parent]) yield a;
}

function renderLife() {
  const root = $('#life'), t = treeSummary();
  const scroll = $('#panel').scrollTop;
  root.innerHTML = `
    <div class="tree-summary">
      <span class="alive">${t.alive} alive</span>
      <span class="available">${t.available} ready</span>
      <span class="waiting">${t.waiting} later</span>
      <span class="blocked">${t.blocked} blocked</span>
      <span class="extinct">${t.extinct} extinct</span>
    </div>
    <p class="note">${t.available + t.waiting > 0
      ? `${t.available + t.waiting} species can still evolve. If every remaining branch is blocked, the run is over.`
      : 'No branch is open anymore.'}</p>
    <ul class="tree">${lifeNode(SPECIES[0])}</ul>`;
  $('#panel').scrollTop = scroll;
  root.querySelectorAll('.node.available').forEach(n => n.addEventListener('click', () => {
    buy({ kind: 'species', item: SPECIES_BY_ID[n.dataset.id] });
    renderLife();
  }));
}

/* ================= World tab ================= */

function renderWorld() {
  const c = tempC(), cl = rates.climate;
  const rows = [
    ['Global temperature', `${fmtTemp(c)} (${state.tempK.toFixed(0)} K)`],
    ['Heading toward', fmtTemp(cl.target - KELVIN)],
    ['Sun brightness', `${pct(sunBrightness())} of today`],
    ['Reflected sunlight', pct(cl.albedo)],
    ['Greenhouse warming', `+${cl.greenhouse.toFixed(1)}°C`],
    ['Air pressure', `${state.pressure.toFixed(2)} bar`],
    ['CO₂', `${fmt(state.co2)} ppm`],
    ['Methane', `${state.ch4.toFixed(1)} ppm`],
    ['Ice cover', pct(iceCover())],
    ['Open ocean', pct(openOcean())],
    ['Clouds', pct(state.clouds)],
    ['Oxygen', `${state.o2.toFixed(2)}%`],
    ['Ozone layer', pct(ozone())],
    ['Species alive', `${SPECIES.filter(s => evolved(s.id)).length} / ${SPECIES.length}`],
    ['Species extinct', `${state.extinct.length}`],
    ['Sun taps', fmt(state.clicks)],
    ['Lightning strikes', fmt(state.strikes)],
    ['Comets caught', fmt(state.comets)],
    ['Time played', fmtTime((Date.now() - state.start) / 1000)],
  ];
  $('#stats').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  $('#step-list').innerHTML = STEPS.map((s, n) => {
    const cls = n < state.step ? 'done' : n === state.step ? 'current' : 'locked';
    const mark = n < state.step ? '✓' : n === state.step ? '>' : '·';
    return `<li class="${cls}"><b>${mark} ${n}. ${n <= state.step ? s.name : '???'}</b>${n === state.step ? `<span>${s.goal}</span>` : ''}</li>`;
  }).join('');
}

/* ================= Effects ================= */

const buzz = ms => navigator.userActivation?.hasBeenActive && navigator.vibrate?.(ms);

function floatText(x, y, text, cls = '') {
  if (el.fx.childElementCount > 60) return;
  const d = document.createElement('div');
  d.className = `float ${cls}`;
  d.textContent = text;
  d.style.left = `${x}px`;
  d.style.top = `${y}px`;
  d.addEventListener('animationend', () => d.remove());
  el.fx.appendChild(d);
}

function toast(title, text) {
  const d = document.createElement('div');
  d.className = 'toast';
  d.innerHTML = `<b></b><span></span>`;
  d.querySelector('b').textContent = title;
  d.querySelector('span').textContent = text;
  el.toasts.appendChild(d);
  setTimeout(() => d.remove(), 5000);
  while (el.toasts.childElementCount > 3) el.toasts.firstChild.remove();
}

const TEMP_COLORS = [[-300, '#8a7cff'], [-100, '#9fd3ff'], [-20, '#bfe6ff'], [LIFE_WINDOW[0], '#8af0b0'], [LIFE_WINDOW[1], '#ffa040'], [50, '#ff5a3a']];

function tempColor(c) {
  let color = TEMP_COLORS[0][1];
  for (const [limit, col] of TEMP_COLORS) if (c >= limit) color = col;
  return color;
}

function tempCaption(c) {
  if (state.step === 0) return `${state.tempK.toFixed(0)} K · ${['Dark planet', 'Nitrogen melting', 'First air', 'Methane haze', 'CO₂ thawing'][state.gases]}`;
  if (state.step >= 5) {
    if (c < LIFE_WINDOW[0]) return `Too cold for complex life (${LIFE_WINDOW[0]}–${LIFE_WINDOW[1]}°C)`;
    if (c > LIFE_WINDOW[1]) return `Too hot for complex life (${LIFE_WINDOW[0]}–${LIFE_WINDOW[1]}°C)`;
    return `Life window ${LIFE_WINDOW[0]}–${LIFE_WINDOW[1]}°C · step ${state.step}`;
  }
  return `Step ${state.step}: ${STEPS[state.step].name}`;
}

/* ================= News ticker ================= */

let newsTimer = 0;

function showNews(text) {
  el.news.classList.add('fade');
  setTimeout(() => {
    el.news.textContent = text;
    el.news.classList.remove('fade');
  }, 400);
  newsTimer = 0;
}

function randomNews() {
  const pool = [...NEWS].reverse().find(n => state.step >= n.step).items;
  showNews(pool[Math.floor(Math.random() * pool.length)]);
}

/* ================= Input ================= */

Scene.onSunTap((x, y) => {
  const power = tapPower();
  addEnergy(power);
  state.clicks++;
  let text = `+${fmt(power)} E`;
  if (state.ignition < 1) {
    // Each tap pushes the sun closer to ignition.
    state.ignition = Math.min(1, state.ignition + 0.008 * Math.sqrt(power));
    text += ' · ignition';
  }
  if (owned.has('cosmic')) {
    state.dna += 1;
    text += ' +1 DNA';
  }
  floatText(x, y - 10, text);
  if (sunBrightness() > 0.05) Scene.ray();
  buzz(6);
});

function lightningHit(zone, x, y) {
  state.strikes++;
  if (zone === 'ocean' && state.step === 4) {
    const add = soupMult();
    state.soup = Math.min(SOUP_FULL, state.soup + add);
    floatText(x, y - 10, `+${add.toFixed(1)} soup`, 'soup');
  } else if (zone === 'ocean' && state.step >= 5) {
    // After life appears, lightning still feeds the ocean with nitrogen: a little DNA.
    const add = 1 + rates.dna * 2;
    state.dna += add;
    floatText(x, y - 10, `+${fmt(add)} DNA`, 'soup');
  } else {
    floatText(x, y - 10, 'Missed the ocean', 'miss');
  }
  buzz(15);
}

Scene.onCloudTap((kind, zone, x, y) => {
  if (kind === 'storm') {
    lightningHit(zone, x, y);
    return;
  }
  const add = mult('rainMult');
  state.minerals += add;
  state.clouds = Math.max(0, state.clouds - 0.004);
  floatText(x, y, `+${fmt(add)} minerals`, 'rain');
  buzz(4);
});

Scene.onZoneTap(zone => {
  openTab(zone);
  buzz(4);
});

Scene.onCometTap((x, y) => {
  const reward = Math.max(rates.energy * 60, tapPower() * 30, 20);
  addEnergy(reward);
  state.comets++;
  let text = `+${fmt(reward)} energy`;
  if (state.step >= 5) {
    const dna = Math.max(5, rates.dna * 30);
    state.dna += dna;
    text += ` and +${fmt(dna)} DNA`;
  }
  floatText(x, y, `+${fmt(reward)} E`);
  toast('Comet!', `${text}. Comets bring water and organic molecules.`);
  buzz([20, 40, 20]);
});

function scheduleComet() {
  setTimeout(() => {
    if (!document.hidden && state.step >= 1) Scene.launchComet();
    scheduleComet();
  }, (50 + Math.random() * 90) * 1000);
}

let resetArmed = null;
$('#reset').addEventListener('click', () => {
  const btn = $('#reset');
  if (!resetArmed) {
    btn.textContent = 'Tap again to erase';
    resetArmed = setTimeout(() => {
      resetArmed = null;
      btn.textContent = 'Reset game';
    }, 3000);
    return;
  }
  clearTimeout(resetArmed);
  resetArmed = null;
  btn.textContent = 'Reset game';
  newGame();
});

function newGame() {
  localStorage.removeItem(SAVE_KEY);
  state = freshState();
  owned = new Set();
  Object.keys(tabKeys).forEach(k => delete tabKeys[k]);
  $('#gameover').classList.add('hidden');
  recalc();
  renderTabs();
  openTab('sun');
  toast('Fresh planet', 'Dark and frozen at 35 K. Tap the sun.');
}

$('#gameover-restart').addEventListener('click', newGame);

/* ================= Offline progress ================= */

function applyOffline() {
  const away = Math.min((Date.now() - state.lastTick) / 1000, OFFLINE_CAP_S);
  state.lastTick = Date.now();
  if (away < 10) return;
  const before = state.energy;
  // Simulate in small steps so the climate and populations play out believably.
  const step = Math.min(2, Math.max(0.5, away / 3000));
  for (let done = 0; done < away; done += step) {
    recalc();
    simulate(step * OFFLINE_RATE);
  }
  recalc();
  toast('While you were away', `The planet kept turning for ${fmtTime(away)}: +${fmt(state.energy - before)} energy.`);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
  else applyOffline();
});
window.addEventListener('pagehide', save);

// Another tab reset the game: reload so this tab does not write its old state back.
window.addEventListener('storage', e => {
  if (e.key === SAVE_KEY && e.newValue === null) {
    skipSave = true;
    location.reload();
  }
});

/* ================= Main loop ================= */

function renderHud(c) {
  el.temp.textContent = fmtTemp(c);
  el.tempSub.textContent = tempCaption(c);
  const parts = [`<span><b>${fmt(state.energy)}</b> E <small>+${fmt(rates.energy)}/s</small></span>`];
  if (state.step >= 1) parts.push(`<span><b>${fmt(state.co2)}</b> ppm CO₂</span>`);
  if (state.step >= 5) parts.push(`<span><b>${fmt(state.dna)}</b> DNA <small>+${fmt(rates.dna)}/s</small></span>`);
  if (state.step >= 6) parts.push(`<span><b>${state.o2.toFixed(2)}%</b> O₂</span>`);
  el.hudLine.innerHTML = parts.join('');
  document.documentElement.style.setProperty('--temp-color', tempColor(c));
}

function updateScene(c) {
  // The scene's colors were tuned for big swings; a warm-but-livable planet should still look blue.
  Scene.setClimate(c < 14 ? c - 14 : (c - 14) * 0.4);
  Scene.setIce(iceCover());
  Scene.setAtmosphere(state.pressure, clamp01(state.ch4 / 15) * (1 - clamp01(state.o2)), sunBrightness());
  const storms = state.step >= 4 ? Math.min(3, 1 + Math.floor((state.clouds - STORM_CLOUDS) * 10)) : 0;
  Scene.setClouds(state.step >= 3 ? state.clouds : 0, Math.max(0, storms));
  Scene.setLife(clamp01(rates.green), clamp01(rates.life / 6), ozone());
}

let last = performance.now();
let slowTimer = 0, worldTimer = 0, lifeTimer = 0, saveTimer = 0, lightningTimer = 0;

function frame(now) {
  const dt = Math.min((now - last) / 1000, 1);
  last = now;
  if (!state.over) simulate(dt);
  state.lastTick = Date.now();

  const c = tempC();
  renderHud(c);

  // Thunderstorm buildings strike on their own.
  if (rates.lightning > 0 && state.step >= 4) {
    lightningTimer += dt * rates.lightning;
    if (lightningTimer >= 1) {
      lightningTimer = 0;
      const s = Scene.autoStrike();
      if (s) lightningHit(s.zone, s.x, s.y);
    }
  }

  slowTimer += dt;
  if (slowTimer > 0.2) {
    slowTimer = 0;
    recalc();
    checkGases();
    checkSteps();
    checkGameOver();
    updateScene(c);
    if (currentTab !== 'world' && currentTab !== 'life') renderTab(currentTab);
  }

  worldTimer += dt;
  if (worldTimer > 1) {
    worldTimer = 0;
    if (currentTab === 'world') renderWorld();
  }

  lifeTimer += dt;
  if (lifeTimer > 0.5) {
    lifeTimer = 0;
    if (currentTab === 'life') renderLife();
  }

  newsTimer += dt;
  if (newsTimer > 10) randomNews();

  saveTimer += dt;
  if (saveTimer > 10) {
    saveTimer = 0;
    save();
  }

  Scene.draw(now, dt);
  requestAnimationFrame(frame);
}

/* ================= Boot ================= */

load();
Scene.init();
recalc();
applyOffline();
renderTabs();
updateScene(tempC());
openTab('sun', false);
if (state.over) showGameOver();
if (state.step > 0) randomNews();
scheduleComet();
requestAnimationFrame(frame);

// Offline support only on the real HTTPS site. During local development, remove any
// service worker and cache left over from earlier versions so a stopped server looks stopped.
const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator) {
  if (location.protocol === 'https:' && !isLocal) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  } else {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    window.caches?.keys().then(keys => keys.forEach(k => caches.delete(k)));
  }
}
