import * as THREE from 'three';

// ============================================================================
// 1. PROCEDURAL WEB AUDIO SYNTHESIZER (Clay Squishes, Crunches, Vacuum, Siren)
// ============================================================================
class ClaySoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft bubbly pop when sweeping trash/clay chunks
  playSweepPop(pitchOffset = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 260 + Math.random() * 140 + pitchOffset * 25;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, now + 0.085);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  // Heavy clay thud + metallic squish when smashing cars or bikes
  playClaySmash(isHeavy = true) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Low punch oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isHeavy ? 150 : 220, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + (isHeavy ? 0.28 : 0.16));

    gain.gain.setValueAtTime(isHeavy ? 0.38 : 0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.3 : 0.18));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);

    // Squish noise burst
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 520 : 880, now);
    filter.Q.value = 2.2;

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.28, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Giant Compactor Boulder launch cannon sound
  playBoulderLaunch() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(310, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.45);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Cheerful arcade fanfare for time bonuses / block cleared
  playBonusFanfare() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.065;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    });
  }

  // Truck Horn + Shockwave
  playHorn() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [220, 277.18].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.34);
    });
  }
}

const sfx = new ClaySoundEngine();

// ============================================================================
// 2. PROCEDURAL CLAY TEXTURE & ORGANIC HAND-MOLDED GEOMETRY HELPERS
// ============================================================================
function createClayBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Neutral mid-grey base
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle organic clay dents / thumb impressions
  for (let i = 0; i < 95; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 10 + Math.random() * 28;
    const grad = ctx.createRadialGradient(x, y, 1, x, y, r);
    const bright = Math.random() > 0.5 ? 155 : 100;
    grad.addColorStop(0, `rgba(${bright}, ${bright}, ${bright}, 0.22)`);
    grad.addColorStop(1, 'rgba(128, 128, 128, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine fingerprint ridges (concentric arcs)
  ctx.strokeStyle = 'rgba(205, 205, 205, 0.14)';
  ctx.lineWidth = 1.6;
  for (let w = 0; w < 22; w++) {
    const cx = Math.random() * 256;
    const cy = Math.random() * 256;
    for (let ring = 4; ring < 26; ring += 3.2) {
      ctx.beginPath();
      ctx.arc(cx, cy, ring, 0.2, Math.PI * 1.4);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

const sharedClayBump = createClayBumpTexture();
const materialCache = new Map();

function getClayMaterial(hexColor, roughness = 0.82, bumpScale = 0.045) {
  const key = `${hexColor}_${roughness}_${bumpScale}`;
  if (materialCache.has(key)) return materialCache.get(key);

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hexColor),
    roughness,
    metalness: 0.04,
    bumpMap: sharedClayBump,
    bumpScale,
  });
  materialCache.set(key, mat);
  return mat;
}

// Hand-molded clay geometry deformer: softens sharp box corners and adds organic lumps
function moldClayGeometry(geom, lumpiness = 0.06) {
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Deterministic spatial wobble so shared vertices stay welded!
    const n =
      Math.sin(v.x * 3.7 + v.y * 2.3) *
      Math.cos(v.z * 4.1 - v.x * 1.9) *
      lumpiness;
    v.x += n;
    v.y += Math.sin(v.z * 5.2 + v.x * 2.1) * lumpiness * 0.7;
    v.z += Math.cos(v.x * 4.3 + v.y * 3.1) * lumpiness;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geom.computeVertexNormals();
  return geom;
}

// ============================================================================
// 3. COLOR PALETTE (Play-Doh / Stop-Motion Clayville Palette)
// ============================================================================
const PALETTE = {
  sweeperYellow: 0xffbe2e,
  sweeperTeal: 0x18b7a0,
  sweeperOrange: 0xff6b35,
  brushBlue: 0x2ec4b6,
  brushPink: 0xff477e,
  darkClay: 0x2d242f,
  creamClay: 0xfff3dd,
  roadClean: 0x4b4254,
  roadSidewalk: 0xd9cbb8,
  grassClay: 0x56c568,
  grimeColors: [0x5c4738, 0x4a5d32, 0x6e4f3a, 0x3d352e],
  trashColors: [0xff595e, 0xffca3a, 0x8ac926, 0x1982c4, 0x6a4c93, 0xff924c],
  carColors: [0xff495c, 0x3b82f6, 0xffbe0b, 0x9b5de5, 0x06d6a0, 0xff7b00, 0xf15bb5],
  buildingColors: [0xf4a261, 0xe76f51, 0x2a9d8f, 0xe9c46a, 0x8ecae6, 0xb5838d, 0x90be6d],
};

// ============================================================================
// 4. SCENE, ISOMETRIC CAMERA & LIGHTING SETUP
// ============================================================================
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcf3ff);
scene.fog = new THREE.FogExp2(0xdcf3ff, 0.0042);

// Isometric-style narrow FOV perspective camera (gives miniature stop-motion diorama depth!)
const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 1, 350);
const CAMERA_OFFSET = new THREE.Vector3(-42, 54, 42);

// Warm Miniature Studio Lighting
const hemiLight = new THREE.HemisphereLight(0xfff8eb, 0x8b728e, 0.95);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff1d6, 1.65);
sunLight.position.set(45, 78, 35);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 190;
const d = 68;
sunLight.shadow.camera.left = -d;
sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d;
sunLight.shadow.camera.bottom = -d;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Rim light for tactile clay highlights
const rimLight = new THREE.DirectionalLight(0x80ffea, 0.45);
rimLight.position.set(-40, 30, -40);
scene.add(rimLight);

// ============================================================================
// 5. CITY GRID & WORLD GENERATION (Streets, Buildings, Trees, Hydrants)
// ============================================================================
const WORLD_HALF = 76;
const BLOCK_STEP = 36; // Roads at -54, -18, +18, +54
const ROAD_COORDS = [-54, -18, 18, 54];
const ROAD_WIDTH = 13.5;

const cityGroup = new THREE.Group();
scene.add(cityGroup);

const buildingObstacles = []; // { x, z, halfW, halfD }
const streetProps = [];       // Hydrants, hot-dog carts, cafe tables, bus stops, newsstands

// Dynamic emissive material for building windows & streetlamps (glows warmly in Night Mode!)
const buildingWindowMat = new THREE.MeshStandardMaterial({
  color: 0xfff3b0,
  emissive: 0xffae00,
  emissiveIntensity: 0.0,
  roughness: 0.55,
});

const streetLampBulbMat = new THREE.MeshStandardMaterial({
  color: 0xfff8d6,
  emissive: 0xffd166,
  emissiveIntensity: 0.1,
  roughness: 0.4,
});

function isOnRoad(x, z, margin = 0) {
  const half = ROAD_WIDTH * 0.5 + margin;
  for (const rc of ROAD_COORDS) {
    if (Math.abs(x - rc) < half || Math.abs(z - rc) < half) return true;
  }
  return false;
}

function buildClayCity() {
  // Base table surface (clean asphalt under everything)
  const baseGeo = new THREE.BoxGeometry(WORLD_HALF * 2 + 24, 2, WORLD_HALF * 2 + 24);
  const baseMesh = new THREE.Mesh(baseGeo, getClayMaterial(PALETTE.roadClean, 0.88, 0.05));
  baseMesh.position.y = -1;
  baseMesh.receiveShadow = true;
  cityGroup.add(baseMesh);

  // Dashed clay road markings along each street
  const dashGeo = moldClayGeometry(new THREE.BoxGeometry(2.4, 0.12, 0.45, 2, 1, 1), 0.02);
  const dashMat = getClayMaterial(0xffe066, 0.8, 0.03);

  for (const rc of ROAD_COORDS) {
    for (let pos = -WORLD_HALF + 6; pos <= WORLD_HALF - 6; pos += 6.5) {
      // Skip intersection centers
      if (ROAD_COORDS.some((other) => Math.abs(pos - other) < 6.5)) continue;

      // X-axis road dash
      const d1 = new THREE.Mesh(dashGeo, dashMat);
      d1.position.set(pos, 0.05, rc);
      d1.receiveShadow = true;
      cityGroup.add(d1);

      // Z-axis road dash
      const d2 = new THREE.Mesh(dashGeo, dashMat);
      d2.rotation.y = Math.PI / 2;
      d2.position.set(rc, 0.05, pos);
      d2.receiveShadow = true;
      cityGroup.add(d2);
    }
  }

  // City blocks between roads: [-72, -36, 0, 36, 72]
  const blockCenters = [-72, -36, 0, 36, 72];
  const blockFullSize = BLOCK_STEP - ROAD_WIDTH; // 22.5

  blockCenters.forEach((bx) => {
    blockCenters.forEach((bz) => {
      const isEdgeBlock = Math.abs(bx) > 60 || Math.abs(bz) > 60;
      const w = isEdgeBlock ? 16 : blockFullSize;
      const d = isEdgeBlock ? 16 : blockFullSize;

      // Sidewalk slab
      const swGeo = moldClayGeometry(new THREE.BoxGeometry(w, 0.7, d, 4, 1, 4), 0.05);
      const swMesh = new THREE.Mesh(swGeo, getClayMaterial(PALETTE.roadSidewalk, 0.85, 0.05));
      swMesh.position.set(bx, 0.35, bz);
      swMesh.receiveShadow = true;
      swMesh.castShadow = true;
      cityGroup.add(swMesh);

      // Inner green park or clay buildings
      const isPark = (bx === 0 && bz === 0);
      if (isPark) {
        // Central Clay Plaza Park with fountain & trees
        const lawnGeo = moldClayGeometry(new THREE.BoxGeometry(w - 3, 0.35, d - 3, 4, 1, 4), 0.06);
        const lawn = new THREE.Mesh(lawnGeo, getClayMaterial(PALETTE.grassClay, 0.85, 0.06));
        lawn.position.set(bx, 0.8, bz);
        lawn.receiveShadow = true;
        cityGroup.add(lawn);

        // Central Clay Donut Sculpture on pedestal
        const ped = new THREE.Mesh(
          moldClayGeometry(new THREE.CylinderGeometry(2.6, 3.1, 2.2, 12), 0.06),
          getClayMaterial(PALETTE.creamClay)
        );
        ped.position.set(bx, 1.8, bz);
        ped.castShadow = true;
        cityGroup.add(ped);

        const donut = new THREE.Mesh(
          moldClayGeometry(new THREE.TorusGeometry(1.9, 0.75, 12, 20), 0.05),
          getClayMaterial(0xff477e, 0.72)
        );
        donut.position.set(bx, 4.4, bz);
        donut.rotation.y = 0.6;
        donut.castShadow = true;
        cityGroup.add(donut);

        buildingObstacles.push({ x: bx, z: bz, halfW: 3.4, halfD: 3.4 });

        // 4 chunky clay trees in the park corners
        [[-6, -6], [6, -6], [-6, 6], [6, 6]].forEach(([ox, oz]) => {
          createClayTree(bx + ox, bz + oz);
        });

        // Add Hot-Dog Carts & Cafe Umbrellas along the park perimeter!
        spawnHotDogCart(bx + w * 0.43, bz);
        spawnHotDogCart(bx - w * 0.43, bz);
        spawnCafeTable(bx, bz + d * 0.43);
        spawnCafeTable(bx, bz - d * 0.43);
      } else {
        // Create 1 or 2 chunky clay buildings on this block
        const bW = w - 5.2;
        const bD = d - 5.2;
        const bH = isEdgeBlock ? 9 + Math.random() * 10 : 7 + Math.random() * 9;
        const color = PALETTE.buildingColors[Math.floor(Math.random() * PALETTE.buildingColors.length)];

        const bldgGroup = new THREE.Group();
        bldgGroup.position.set(bx, 0.7, bz);

        const bodyGeo = moldClayGeometry(new THREE.BoxGeometry(bW, bH, bD, 4, 4, 4), 0.09);
        const body = new THREE.Mesh(bodyGeo, getClayMaterial(color, 0.82, 0.06));
        body.position.y = bH * 0.5;
        body.castShadow = true;
        body.receiveShadow = true;
        bldgGroup.add(body);

        // Roof cap
        const roofGeo = moldClayGeometry(new THREE.BoxGeometry(bW + 0.7, 0.9, bD + 0.7, 3, 1, 3), 0.06);
        const roof = new THREE.Mesh(roofGeo, getClayMaterial(PALETTE.darkClay, 0.85));
        roof.position.y = bH + 0.35;
        roof.castShadow = true;
        bldgGroup.add(roof);

        // Chunky clay windows (glow warmly in Night Mode!)
        const floors = Math.max(2, Math.floor(bH / 3.2));
        for (let f = 1; f < floors; f++) {
          const wy = f * 2.9 + 1.2;
          for (let wx = -bW * 0.3; wx <= bW * 0.3; wx += bW * 0.3) {
            if (Math.abs(wx) < 0.1 && bW < 12) continue;
            const wFront = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 0.35), buildingWindowMat);
            wFront.position.set(wx, wy, bD * 0.5 + 0.08);
            bldgGroup.add(wFront);

            const wSide = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 1.4), buildingWindowMat);
            wSide.position.set(bW * 0.5 + 0.08, wy, wx);
            bldgGroup.add(wSide);
          }
        }

        cityGroup.add(bldgGroup);
        buildingObstacles.push({ x: bx, z: bz, halfW: bW * 0.5 + 0.6, halfD: bD * 0.5 + 0.6 });

        // Populate sidewalk curbs with destructible street furniture!
        if (!isEdgeBlock) {
          spawnHydrant(bx + w * 0.44, bz + d * 0.44);
          spawnNewsstand(bx - w * 0.44, bz - d * 0.44);
          spawnCafeTable(bx + w * 0.44, bz - d * 0.22);
          spawnHotDogCart(bx - w * 0.44, bz + d * 0.25);
          spawnBusStop(bx, bz + d * 0.45);
          spawnStreetLamp(bx - w * 0.44, bz + d * 0.44);
        }
      }
    });
  });

  // Outer perimeter boundary wall made of striped clay barriers
  const wallThickness = 4;
  buildingObstacles.push({ x: 0, z: -WORLD_HALF - 4, halfW: WORLD_HALF + 8, halfD: wallThickness });
  buildingObstacles.push({ x: 0, z: WORLD_HALF + 4, halfW: WORLD_HALF + 8, halfD: wallThickness });
  buildingObstacles.push({ x: -WORLD_HALF - 4, z: 0, halfW: wallThickness, halfD: WORLD_HALF + 8 });
  buildingObstacles.push({ x: WORLD_HALF + 4, z: 0, halfW: wallThickness, halfD: WORLD_HALF + 8 });
}

function createClayTree(x, z) {
  const tree = new THREE.Group();
  tree.position.set(x, 0.7, z);

  const trunk = new THREE.Mesh(
    moldClayGeometry(new THREE.CylinderGeometry(0.45, 0.65, 2.4, 8), 0.05),
    getClayMaterial(0x7f5539)
  );
  trunk.position.y = 1.2;
  trunk.castShadow = true;
  tree.add(trunk);

  const puff1 = new THREE.Mesh(
    moldClayGeometry(new THREE.DodecahedronGeometry(1.75, 1), 0.12),
    getClayMaterial(0x38b000)
  );
  puff1.position.y = 3.1;
  puff1.castShadow = true;
  tree.add(puff1);

  const puff2 = new THREE.Mesh(
    moldClayGeometry(new THREE.DodecahedronGeometry(1.25, 1), 0.1),
    getClayMaterial(0x70e000)
  );
  puff2.position.set(0.6, 4.2, 0.3);
  puff2.castShadow = true;
  tree.add(puff2);

  cityGroup.add(tree);
}

function spawnStreetLamp(x, z) {
  const lamp = new THREE.Group();
  lamp.position.set(x, 0.7, z);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.26, 4.6, 8),
    getClayMaterial(PALETTE.darkClay)
  );
  pole.position.y = 2.3;
  pole.castShadow = true;
  lamp.add(pole);

  const globe = new THREE.Mesh(
    moldClayGeometry(new THREE.SphereGeometry(0.58, 10, 10), 0.03),
    streetLampBulbMat
  );
  globe.position.y = 4.75;
  lamp.add(globe);
  cityGroup.add(lamp);
}

function registerStreetProp(mesh, x, z, type, label, burstColor, points = 150) {
  cityGroup.add(mesh);
  streetProps.push({
    mesh,
    x,
    z,
    origY: mesh.position.y,
    type,
    label,
    burstColor,
    points,
    smashed: false,
    vel: new THREE.Vector3(),
    rotVel: new THREE.Vector3(),
  });
}

function spawnHydrant(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.7, z);

  const body = new THREE.Mesh(
    moldClayGeometry(new THREE.CylinderGeometry(0.42, 0.5, 1.35, 8), 0.04),
    getClayMaterial(0xef233c)
  );
  body.position.y = 0.68;
  body.castShadow = true;
  group.add(body);

  const cap = new THREE.Mesh(
    moldClayGeometry(new THREE.SphereGeometry(0.45, 8, 8), 0.03),
    getClayMaterial(0xffbe0b)
  );
  cap.position.y = 1.35;
  group.add(cap);

  registerStreetProp(group, x, z, 'hydrant', 'HYDRANT GUSHER!', 0x3b82f6, 130);
}

// Smashable Hot-Dog Cart with striped umbrella!
function spawnHotDogCart(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.7, z);

  const cartBox = new THREE.Mesh(
    moldClayGeometry(new THREE.BoxGeometry(1.7, 1.15, 1.2, 2, 2, 2), 0.05),
    getClayMaterial(0xffbe0b)
  );
  cartBox.position.y = 0.7;
  cartBox.castShadow = true;
  group.add(cartBox);

  const stripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 0.38, 1.26),
    getClayMaterial(0xef233c)
  );
  stripe.position.y = 0.75;
  group.add(stripe);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 2.2, 6),
    getClayMaterial(PALETTE.creamClay)
  );
  pole.position.y = 1.8;
  group.add(pole);

  const umbrella = new THREE.Mesh(
    moldClayGeometry(new THREE.ConeGeometry(1.45, 0.85, 10), 0.06),
    getClayMaterial(0xff595e)
  );
  umbrella.position.y = 2.85;
  umbrella.castShadow = true;
  group.add(umbrella);

  registerStreetProp(group, x, z, 'hotdog', 'HOT-DOG EXPLOSION! 🌭', 0xffbe0b, 220);
}

// Smashable Sidewalk Café Table & Bistro Umbrella
function spawnCafeTable(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.7, z);

  const tableTop = new THREE.Mesh(
    moldClayGeometry(new THREE.CylinderGeometry(1.05, 1.05, 0.22, 10), 0.04),
    getClayMaterial(PALETTE.creamClay)
  );
  tableTop.position.y = 0.95;
  tableTop.castShadow = true;
  group.add(tableTop);

  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.3, 0.95, 8),
    getClayMaterial(PALETTE.darkClay)
  );
  leg.position.y = 0.48;
  group.add(leg);

  const umbrella = new THREE.Mesh(
    moldClayGeometry(new THREE.ConeGeometry(1.35, 0.75, 9), 0.05),
    getClayMaterial(0x18b7a0)
  );
  umbrella.position.y = 2.35;
  umbrella.castShadow = true;
  group.add(umbrella);

  registerStreetProp(group, x, z, 'cafe', 'CAFÉ CRUSH! ☕', 0x18b7a0, 190);
}

// Smashable Clay Bus Stop Shelter
function spawnBusStop(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.7, z);

  const roof = new THREE.Mesh(
    moldClayGeometry(new THREE.BoxGeometry(2.6, 0.32, 1.35, 3, 1, 2), 0.04),
    getClayMaterial(0x3b82f6)
  );
  roof.position.y = 2.45;
  roof.castShadow = true;
  group.add(roof);

  const backWall = new THREE.Mesh(
    moldClayGeometry(new THREE.BoxGeometry(2.4, 2.2, 0.22, 3, 2, 1), 0.04),
    getClayMaterial(0x8ecae6, 0.5)
  );
  backWall.position.set(0, 1.25, -0.5);
  group.add(backWall);

  const bench = new THREE.Mesh(
    moldClayGeometry(new THREE.BoxGeometry(1.8, 0.35, 0.55), 0.03),
    getClayMaterial(0xff924c)
  );
  bench.position.set(0, 0.55, -0.15);
  group.add(bench);

  registerStreetProp(group, x, z, 'busstop', 'BUS STOP SMASH! 🚌', 0x3b82f6, 260);
}

// Smashable Newspaper Stand Box
function spawnNewsstand(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.7, z);

  const box = new THREE.Mesh(
    moldClayGeometry(new THREE.BoxGeometry(0.85, 1.45, 0.75, 2, 2, 2), 0.04),
    getClayMaterial(0x9b5de5)
  );
  box.position.y = 0.75;
  box.castShadow = true;
  group.add(box);

  const windowSlot = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.45, 0.8),
    getClayMaterial(PALETTE.creamClay)
  );
  windowSlot.position.y = 1.05;
  group.add(windowSlot);

  registerStreetProp(group, x, z, 'newsstand', 'EXTRA! EXTRA! 📰', 0x9b5de5, 160);
}

function resetStreetProps() {
  streetProps.forEach((p) => {
    p.smashed = false;
    p.mesh.visible = true;
    p.mesh.position.set(p.x, p.origY, p.z);
    p.mesh.rotation.set(0, 0, 0);
    p.vel.set(0, 0, 0);
  });
}

buildClayCity();

// ============================================================================
// 6. THE SWEEPER TRUCK ("BIG BRISTLE")
// ============================================================================
class ClaySweeperTruck {
  constructor() {
    this.group = new THREE.Group();
    this.bodyGroup = new THREE.Group(); // Tilts & squashes independently
    this.group.add(this.bodyGroup);

    this.pos = new THREE.Vector3(-18, 0, 18);
    this.heading = 0; // Radians (0 = +Z)
    this.speed = 0;
    this.maxSpeed = 29;
    this.turboActive = false;

    this.buildModel();
    scene.add(this.group);
  }

  buildModel() {
    // 1. Chunky Chassis
    const chassisGeo = moldClayGeometry(new THREE.BoxGeometry(3.8, 1.1, 6.2, 3, 2, 4), 0.06);
    const chassis = new THREE.Mesh(chassisGeo, getClayMaterial(PALETTE.darkClay));
    chassis.position.y = 1.05;
    chassis.castShadow = true;
    this.bodyGroup.add(chassis);

    // 2. Rear Hopper / Compactor Tank (holds swept trash)
    const hopperGeo = moldClayGeometry(new THREE.BoxGeometry(3.9, 2.6, 3.6, 4, 3, 4), 0.08);
    const hopper = new THREE.Mesh(hopperGeo, getClayMaterial(PALETTE.sweeperYellow));
    hopper.position.set(0, 2.5, -1.1);
    hopper.castShadow = true;
    hopper.receiveShadow = true;
    this.bodyGroup.add(hopper);

    // Teal side stripes on hopper
    const stripeGeo = moldClayGeometry(new THREE.BoxGeometry(4.05, 0.65, 3.1, 2, 1, 2), 0.03);
    const stripe = new THREE.Mesh(stripeGeo, getClayMaterial(PALETTE.sweeperTeal));
    stripe.position.set(0, 2.4, -1.1);
    this.bodyGroup.add(stripe);

    // Growing Compacted Clay Mound peeking out the top of the hopper!
    const moundGeo = moldClayGeometry(new THREE.DodecahedronGeometry(1.55, 2), 0.14);
    this.hopperMound = new THREE.Mesh(moundGeo, getClayMaterial(0xff6b35, 0.78));
    this.hopperMound.position.set(0, 3.6, -1.1);
    this.hopperMound.scale.set(0.1, 0.1, 0.1);
    this.bodyGroup.add(this.hopperMound);

    // 3. Forward Cab
    const cabGeo = moldClayGeometry(new THREE.BoxGeometry(3.5, 2.4, 2.3, 3, 3, 3), 0.07);
    const cab = new THREE.Mesh(cabGeo, getClayMaterial(PALETTE.sweeperTeal));
    cab.position.set(0, 2.45, 1.75);
    cab.castShadow = true;
    this.bodyGroup.add(cab);

    // Cream Windshield with goofy clay eyes!
    const glassGeo = moldClayGeometry(new THREE.BoxGeometry(3.0, 1.15, 0.35, 2, 2, 1), 0.03);
    const glass = new THREE.Mesh(glassGeo, getClayMaterial(PALETTE.creamClay, 0.55));
    glass.position.set(0, 2.75, 2.82);
    this.bodyGroup.add(glass);

    // Expressive Clay Pupils on the windshield
    const pupilGeo = new THREE.SphereGeometry(0.24, 10, 10);
    const pupilMat = getClayMaterial(PALETTE.darkClay, 0.4);
    const leftEye = new THREE.Mesh(pupilGeo, pupilMat);
    leftEye.position.set(-0.65, 2.75, 3.0);
    const rightEye = new THREE.Mesh(pupilGeo, pupilMat);
    rightEye.position.set(0.65, 2.75, 3.0);
    this.bodyGroup.add(leftEye, rightEye);

    // Roof Beacon Siren Light
    const beaconBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 0.35, 10),
      getClayMaterial(PALETTE.darkClay)
    );
    beaconBase.position.set(0, 3.75, 1.8);
    this.bodyGroup.add(beaconBase);

    this.beaconBulb = new THREE.Mesh(
      moldClayGeometry(new THREE.SphereGeometry(0.42, 10, 10), 0.03),
      new THREE.MeshStandardMaterial({
        color: 0xffbe0b,
        emissive: 0xff6b00,
        emissiveIntensity: 0.9,
        roughness: 0.4,
      })
    );
    this.beaconBulb.position.set(0, 4.05, 1.8);
    this.bodyGroup.add(this.beaconBulb);

    // Heavy Demolition Front Bumper / Plow Bar
    const bumperGeo = moldClayGeometry(new THREE.BoxGeometry(4.4, 0.85, 0.9, 4, 1, 2), 0.05);
    const bumper = new THREE.Mesh(bumperGeo, getClayMaterial(PALETTE.sweeperOrange));
    bumper.position.set(0, 1.15, 3.25);
    bumper.castShadow = true;
    this.bodyGroup.add(bumper);

    // Night-Mode Volumetric Headlight Cones + Real PointLight!
    this.headlightsGroup = new THREE.Group();
    const coneBeamGeo = new THREE.ConeGeometry(2.6, 11, 14, 1, true);
    coneBeamGeo.rotateX(Math.PI / 2);
    const coneBeamMat = new THREE.MeshBasicMaterial({
      color: 0xfff3a8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const leftBeam = new THREE.Mesh(coneBeamGeo, coneBeamMat);
    leftBeam.position.set(-1.2, 1.1, 8.6);
    const rightBeam = new THREE.Mesh(coneBeamGeo, coneBeamMat);
    rightBeam.position.set(1.2, 1.1, 8.6);
    this.headlightPoint = new THREE.PointLight(0xffe699, 3.2, 28, 1.2);
    this.headlightPoint.position.set(0, 2.4, 6.5);
    this.headlightsGroup.add(leftBeam, rightBeam, this.headlightPoint);
    this.headlightsGroup.visible = false;
    this.bodyGroup.add(this.headlightsGroup);

    // Dual Side-Flamethrower Nozzles (visible when Flamethrower Power-Up is active!)
    this.flamethrowerGroup = new THREE.Group();
    const nozzleGeo = moldClayGeometry(new THREE.CylinderGeometry(0.32, 0.48, 1.4, 8), 0.04);
    nozzleGeo.rotateZ(Math.PI / 2);
    const nozzleMat = getClayMaterial(0xff477e);
    const leftNozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    leftNozzle.position.set(-2.5, 1.65, 0.8);
    const rightNozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    rightNozzle.position.set(2.5, 1.65, 0.8);
    this.flamethrowerGroup.add(leftNozzle, rightNozzle);
    this.flamethrowerGroup.visible = false;
    this.bodyGroup.add(this.flamethrowerGroup);

    // 4. Dual Oversized Spinning Rotary Brushes in Front!
    this.leftBrush = this.createRotaryBrush(PALETTE.brushBlue, PALETTE.sweeperYellow);
    this.leftBrush.position.set(-1.95, 0.62, 3.55);
    this.bodyGroup.add(this.leftBrush);

    this.rightBrush = this.createRotaryBrush(PALETTE.brushPink, PALETTE.sweeperYellow);
    this.rightBrush.position.set(1.95, 0.62, 3.55);
    this.bodyGroup.add(this.rightBrush);

    // 5. Four Chunky Clay Wheels
    this.wheels = [];
    const wheelGeo = moldClayGeometry(new THREE.CylinderGeometry(0.85, 0.85, 0.8, 12), 0.05);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = getClayMaterial(PALETTE.darkClay, 0.9);
    const hubGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.86, 8);
    hubGeo.rotateZ(Math.PI / 2);
    const hubMat = getClayMaterial(PALETTE.sweeperYellow);

    [
      [-1.95, 0.85, 1.8],
      [1.95, 0.85, 1.8],
      [-1.95, 0.85, -1.6],
      [1.95, 0.85, -1.6],
    ].forEach(([wx, wy, wz]) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, wy, wz);
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.castShadow = true;
      const hub = new THREE.Mesh(hubGeo, hubMat);
      wGroup.add(tire, hub);
      this.bodyGroup.add(wGroup);
      this.wheels.push(wGroup);
    });
  }

  createRotaryBrush(colorA, colorB) {
    const brushGroup = new THREE.Group();
    const cap = new THREE.Mesh(
      moldClayGeometry(new THREE.CylinderGeometry(1.15, 1.45, 0.45, 12), 0.05),
      getClayMaterial(colorB)
    );
    cap.position.y = 0.25;
    cap.castShadow = true;
    brushGroup.add(cap);

    // Chunky clay bristles radiating outward
    const bristleGeo = moldClayGeometry(new THREE.BoxGeometry(0.32, 0.5, 0.95), 0.03);
    const matA = getClayMaterial(colorA);
    const matB = getClayMaterial(colorB);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const b = new THREE.Mesh(bristleGeo, i % 2 === 0 ? matA : matB);
      b.position.set(Math.sin(angle) * 1.15, -0.05, Math.cos(angle) * 1.15);
      b.rotation.y = angle;
      b.rotation.x = 0.28;
      brushGroup.add(b);
    }
    return brushGroup;
  }
}

const sweeper = new ClaySweeperTruck();

// ============================================================================
// 7. STREET GRIME, TRASH PILES & COLLECTIBLE CLAY CHUNKS
// ============================================================================
const grimePatches = []; // Flat mud/sludge decals + 3D trash blobs on the street
const looseClayChunks = []; // Flying chunks from smashed cars & trash
const clayPuffs = []; // Exhaust & sweep dust particles

const grimeDiskGeo = moldClayGeometry(new THREE.CylinderGeometry(1.6, 1.85, 0.14, 10), 0.12);
const trashBlobGeo = moldClayGeometry(new THREE.DodecahedronGeometry(0.62, 1), 0.12);
const coneGeo = moldClayGeometry(new THREE.ConeGeometry(0.45, 1.1, 8), 0.04);

function spawnCityMess() {
  // Clear previous mess
  grimePatches.forEach((g) => scene.remove(g.mesh));
  grimePatches.length = 0;

  looseClayChunks.forEach((c) => scene.remove(c.mesh));
  looseClayChunks.length = 0;

  // Populate all road avenues with grime puddles and trash clusters
  ROAD_COORDS.forEach((rc) => {
    for (let s = -WORLD_HALF + 8; s <= WORLD_HALF - 8; s += 7.5) {
      // Horizontal road mess
      createMessCluster(s + (Math.random() - 0.5) * 3.5, rc + (Math.random() - 0.5) * 6.5);
      // Vertical road mess
      if (!ROAD_COORDS.some((other) => Math.abs(s - other) < 5)) {
        createMessCluster(rc + (Math.random() - 0.5) * 6.5, s + (Math.random() - 0.5) * 3.5);
      }
    }
  });
}

function createMessCluster(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0.08, z);

  // Grime puddle base
  const grimeColor = PALETTE.grimeColors[Math.floor(Math.random() * PALETTE.grimeColors.length)];
  const puddle = new THREE.Mesh(grimeDiskGeo, getClayMaterial(grimeColor, 0.92, 0.07));
  puddle.scale.set(0.85 + Math.random() * 0.55, 1, 0.85 + Math.random() * 0.55);
  puddle.rotation.y = Math.random() * Math.PI * 2;
  puddle.receiveShadow = true;
  group.add(puddle);

  // 2 to 3 colorful clay trash pieces on top (bags, cans, cones)
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i++) {
    const isCone = Math.random() < 0.22;
    const tColor = isCone
      ? 0xff6b35
      : PALETTE.trashColors[Math.floor(Math.random() * PALETTE.trashColors.length)];
    const item = new THREE.Mesh(
      isCone ? coneGeo : trashBlobGeo,
      getClayMaterial(tColor, 0.78, 0.05)
    );
    item.position.set((Math.random() - 0.5) * 1.6, isCone ? 0.55 : 0.38, (Math.random() - 0.5) * 1.6);
    if (!isCone) {
      item.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      item.scale.setScalar(0.65 + Math.random() * 0.5);
    }
    item.castShadow = true;
    group.add(item);
  }

  scene.add(group);
  grimePatches.push({
    mesh: group,
    x,
    z,
    cleaned: false,
    beingSucked: false,
    suckProgress: 0,
  });
}

function spawnClayBurst(x, y, z, baseColor, count = 12, speedMult = 1) {
  for (let i = 0; i < count; i++) {
    const color =
      i % 3 === 0
        ? PALETTE.trashColors[Math.floor(Math.random() * PALETTE.trashColors.length)]
        : baseColor;
    const mesh = new THREE.Mesh(trashBlobGeo, getClayMaterial(color, 0.76));
    const scale = 0.45 + Math.random() * 0.55;
    mesh.scale.setScalar(scale);
    mesh.position.set(x + (Math.random() - 0.5) * 1.5, y + 0.5, z + (Math.random() - 0.5) * 1.5);
    mesh.castShadow = true;
    scene.add(mesh);

    const angle = Math.random() * Math.PI * 2;
    const spd = (4 + Math.random() * 11) * speedMult;
    looseClayChunks.push({
      mesh,
      vel: new THREE.Vector3(Math.cos(angle) * spd, 6 + Math.random() * 9, Math.sin(angle) * spd),
      rotVel: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8),
      age: 0,
      collected: false,
    });
  }
}

function spawnSmokePuff(x, y, z, color = 0xfff3dd, startScale = 0.45) {
  const mesh = new THREE.Mesh(trashBlobGeo, getClayMaterial(color, 0.9));
  mesh.position.set(x, y, z);
  mesh.scale.setScalar(startScale);
  scene.add(mesh);
  clayPuffs.push({
    mesh,
    vel: new THREE.Vector3((Math.random() - 0.5) * 2, 2.5 + Math.random() * 2, (Math.random() - 0.5) * 2),
    age: 0,
    maxAge: 0.55 + Math.random() * 0.25,
  });
}

// ============================================================================
// 8. DEMOLITION TRAFFIC: CLAY CARS, VANS, TAXIS & BIKES
// ============================================================================
const vehicles = [];
const MAX_VEHICLES = 30;

function createClayCarMesh(type, color) {
  const group = new THREE.Group();

  if (type === 'bike') {
    // Cute Clay Scooter / Bicycle + Rider
    const frame = new THREE.Mesh(
      moldClayGeometry(new THREE.BoxGeometry(0.65, 0.85, 2.1, 2, 2, 3), 0.04),
      getClayMaterial(color)
    );
    frame.position.y = 0.75;
    frame.castShadow = true;
    group.add(frame);

    // Rider torso & helmet
    const rider = new THREE.Mesh(
      moldClayGeometry(new THREE.CylinderGeometry(0.35, 0.42, 1.0, 8), 0.05),
      getClayMaterial(PALETTE.sweeperTeal)
    );
    rider.position.set(0, 1.5, -0.1);
    group.add(rider);

    const helmet = new THREE.Mesh(
      moldClayGeometry(new THREE.SphereGeometry(0.42, 10, 10), 0.04),
      getClayMaterial(PALETTE.sweeperYellow)
    );
    helmet.position.set(0, 2.2, -0.1);
    helmet.castShadow = true;
    group.add(helmet);

    // Two wheels
    const wGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.28, 10);
    wGeo.rotateZ(Math.PI / 2);
    const wMat = getClayMaterial(PALETTE.darkClay);
    [-0.75, 0.75].forEach((wz) => {
      const w = new THREE.Mesh(wGeo, wMat);
      w.position.set(0, 0.45, wz);
      group.add(w);
    });
    return group;
  }

  // Car / Taxi / Van
  const isVan = type === 'van';
  const isTaxi = type === 'taxi';
  const bodyColor = isTaxi ? 0xffbe0b : color;

  const lowerGeo = moldClayGeometry(
    new THREE.BoxGeometry(2.5, isVan ? 1.55 : 1.05, isVan ? 4.7 : 4.2, 3, 2, 4),
    0.06
  );
  const lower = new THREE.Mesh(lowerGeo, getClayMaterial(bodyColor));
  lower.position.y = isVan ? 1.15 : 0.9;
  lower.castShadow = true;
  lower.receiveShadow = true;
  group.add(lower);

  if (!isVan) {
    const cabinGeo = moldClayGeometry(new THREE.BoxGeometry(2.15, 0.95, 2.3, 3, 2, 3), 0.06);
    const cabin = new THREE.Mesh(cabinGeo, getClayMaterial(bodyColor));
    cabin.position.set(0, 1.75, -0.15);
    cabin.castShadow = true;
    group.add(cabin);
  }

  // Windshield
  const win = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.65, 0.25),
    getClayMaterial(PALETTE.creamClay, 0.5)
  );
  win.position.set(0, isVan ? 1.45 : 1.75, isVan ? 2.28 : 1.0);
  group.add(win);

  if (isTaxi) {
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.38, 0.45),
      getClayMaterial(0xfff3dd)
    );
    sign.position.set(0, 2.35, -0.1);
    group.add(sign);
  }

  // 4 Clay Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.45, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = getClayMaterial(PALETTE.darkClay);
  [
    [-1.25, 0.52, 1.3],
    [1.25, 0.52, 1.3],
    [-1.25, 0.52, -1.3],
    [1.25, 0.52, -1.3],
  ].forEach(([wx, wy, wz]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, wy, wz);
    group.add(w);
  });

  return group;
}

function spawnTrafficVehicle() {
  if (vehicles.length >= MAX_VEHICLES) return;

  const types = ['sedan', 'taxi', 'van', 'bike', 'bike'];
  const type = types[Math.floor(Math.random() * types.length)];
  const color = PALETTE.carColors[Math.floor(Math.random() * PALETTE.carColors.length)];

  const alongX = Math.random() > 0.5;
  const roadCoord = ROAD_COORDS[Math.floor(Math.random() * ROAD_COORDS.length)];
  const laneDir = Math.random() > 0.5 ? 1 : -1;
  const laneOffset = laneDir * 3.1;
  const posAlong = (Math.random() - 0.5) * (WORLD_HALF * 1.75);

  const x = alongX ? posAlong : roadCoord + laneOffset;
  const z = alongX ? roadCoord - laneOffset : posAlong;

  // Avoid spawning right on top of player
  if ( Math.hypot(x - sweeper.pos.x, z - sweeper.pos.z) < 14 ) return;

  const mesh = createClayCarMesh(type, color);
  mesh.position.set(x, 0, z);
  const heading = alongX ? (laneDir > 0 ? Math.PI / 2 : -Math.PI / 2) : (laneDir > 0 ? 0 : Math.PI);
  mesh.rotation.y = heading;
  scene.add(mesh);

  const isParked = Math.random() < 0.28;
  vehicles.push({
    mesh,
    type,
    color,
    x,
    z,
    heading,
    speed: isParked ? 0 : (type === 'bike' ? 7.5 : 9.5) + Math.random() * 4.5,
    state: 'driving', // 'driving' | 'pancaked' | 'flying'
    vel: new THREE.Vector3(),
    rotVel: new THREE.Vector3(),
    timer: 0,
    radius: type === 'bike' ? 1.4 : 2.35,
  });
}

function resetTraffic() {
  vehicles.forEach((v) => scene.remove(v.mesh));
  vehicles.length = 0;
  for (let i = 0; i < MAX_VEHICLES; i++) {
    spawnTrafficVehicle();
  }
}

// ============================================================================
// 8B. POWER-UP CLAY CANS (Collectible Golden Play-Doh Tubs on Intersections)
// ============================================================================
const powerupTubs = [];
const POWERUP_TYPES = [
  { id: 'magnet', label: '🧲 GIANT MAGNET BRUSHES!', lidColor: 0x3b82f6 },
  { id: 'flamethrower', label: '🔥 DUAL SIDE-FLAMETHROWERS!', lidColor: 0xff477e },
  { id: 'steamroller', label: '🛞 GIANT STEAMROLLER TIRES!', lidColor: 0x38ef7d },
];

function createPowerupTubMesh(lidColor) {
  const group = new THREE.Group();

  // Golden Play-Doh tub cylinder
  const tub = new THREE.Mesh(
    moldClayGeometry(new THREE.CylinderGeometry(1.15, 0.95, 1.55, 12), 0.04),
    new THREE.MeshStandardMaterial({
      color: 0xffbe0b,
      emissive: 0xff9200,
      emissiveIntensity: 0.35,
      roughness: 0.45,
      bumpMap: sharedClayBump,
      bumpScale: 0.03,
    })
  );
  tub.position.y = 1.1;
  tub.castShadow = true;
  group.add(tub);

  // Chunky colorful Play-Doh lid
  const lid = new THREE.Mesh(
    moldClayGeometry(new THREE.CylinderGeometry(1.3, 1.3, 0.36, 12), 0.04),
    getClayMaterial(lidColor, 0.65)
  );
  lid.position.y = 1.95;
  lid.castShadow = true;
  group.add(lid);

  return group;
}

function spawnPowerupTubs() {
  powerupTubs.forEach((t) => scene.remove(t.mesh));
  powerupTubs.length = 0;

  // Place Golden Play-Doh Tubs on 6 road intersections
  const coords = [-54, -18, 18, 54];
  let idx = 0;
  coords.forEach((ix) => {
    coords.forEach((iz) => {
      if ((Math.abs(ix) === 18 && Math.abs(iz) === 18) || (Math.abs(ix) === 54 && Math.abs(iz) === 54 && idx % 2 === 0)) {
        const pType = POWERUP_TYPES[idx % POWERUP_TYPES.length];
        idx++;
        const mesh = createPowerupTubMesh(pType.lidColor);
        mesh.position.set(ix, 0.2, iz);
        scene.add(mesh);
        powerupTubs.push({
          mesh,
          x: ix,
          z: iz,
          powerup: pType,
          active: true,
          respawnTimer: 0,
        });
      }
    });
  });
}

function activatePowerup(pType) {
  gameState.activePowerup = pType.id;
  gameState.powerupTimer = 12.0;
  sfx.playBonusFanfare();
  spawnWorldPopup(sweeper.pos.x, 5.2, sweeper.pos.z, pType.label, 'time-bonus');
  applySweeperPowerupVisuals();
}

function applySweeperPowerupVisuals() {
  const p = gameState.activePowerup;

  // 1. Giant Magnet Brushes scale
  const brushScale = p === 'magnet' ? 1.85 : 1.0;
  sweeper.leftBrush.scale.setScalar(brushScale);
  sweeper.rightBrush.scale.setScalar(brushScale);

  // 2. Dual Side-Flamethrowers visibility
  sweeper.flamethrowerGroup.visible = p === 'flamethrower';

  // 3. Giant Steamroller Tires scale
  const wheelScale = p === 'steamroller' ? 1.85 : 1.0;
  sweeper.wheels.forEach((w) => w.scale.setScalar(wheelScale));
  sweeper.group.scale.setScalar(p === 'steamroller' ? 1.28 : 1.0);
}

// ============================================================================
// 8C. CITY ENFORCERS / BOSS HAZARDS (Armored Clay Dump Trucks & Police Cruisers)
// ============================================================================
const enforcers = [];

function createEnforcerMesh(isDumpTruck) {
  const group = new THREE.Group();

  if (isDumpTruck) {
    // Colossal Armored Clay Enforcer Dump Truck with Bulldozer Plow
    const body = new THREE.Mesh(
      moldClayGeometry(new THREE.BoxGeometry(3.8, 2.5, 6.2, 4, 3, 4), 0.08),
      getClayMaterial(0x5a189a, 0.78)
    );
    body.position.y = 1.75;
    body.castShadow = true;
    group.add(body);

    const cab = new THREE.Mesh(
      moldClayGeometry(new THREE.BoxGeometry(3.5, 2.1, 2.2, 3, 2, 2), 0.06),
      getClayMaterial(PALETTE.darkClay)
    );
    cab.position.set(0, 2.3, 2.1);
    cab.castShadow = true;
    group.add(cab);

    // Spiky Orange Clay Bulldozer Blade in front
    const blade = new THREE.Mesh(
      moldClayGeometry(new THREE.BoxGeometry(4.6, 1.45, 1.1, 4, 2, 2), 0.07),
      getClayMaterial(0xff6b35)
    );
    blade.position.set(0, 1.1, 3.55);
    blade.castShadow = true;
    group.add(blade);
  } else {
    // Clay Police Cruiser Interceptor + Flashing Red/Blue Lightbar
    const lower = new THREE.Mesh(
      moldClayGeometry(new THREE.BoxGeometry(2.7, 1.15, 4.6, 3, 2, 4), 0.06),
      getClayMaterial(PALETTE.darkClay)
    );
    lower.position.y = 0.95;
    lower.castShadow = true;
    group.add(lower);

    const doors = new THREE.Mesh(
      moldClayGeometry(new THREE.BoxGeometry(2.78, 0.95, 2.1, 2, 2, 2), 0.04),
      getClayMaterial(PALETTE.creamClay)
    );
    doors.position.y = 1.0;
    group.add(doors);

    const cabin = new THREE.Mesh(
      moldClayGeometry(new THREE.BoxGeometry(2.3, 1.0, 2.3, 3, 2, 3), 0.05),
      getClayMaterial(PALETTE.creamClay)
    );
    cabin.position.set(0, 1.85, -0.1);
    group.add(cabin);
  }

  // Flashing Red & Blue Siren Bar on top
  const redLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.42, 0.48),
    new THREE.MeshStandardMaterial({ color: 0xff2a55, emissive: 0xff0033, emissiveIntensity: 1.2 })
  );
  redLight.position.set(-0.55, isDumpTruck ? 3.6 : 2.5, isDumpTruck ? 2.1 : -0.1);
  const blueLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.42, 0.48),
    new THREE.MeshStandardMaterial({ color: 0x00bbff, emissive: 0x0088ff, emissiveIntensity: 1.2 })
  );
  blueLight.position.set(0.55, isDumpTruck ? 3.6 : 2.5, isDumpTruck ? 2.1 : -0.1);
  group.add(redLight, blueLight);

  return group;
}

function spawnEnforcerBoss() {
  if (enforcers.length >= 4) return;
  const isDumpTruck = Math.random() < 0.55;
  const mesh = createEnforcerMesh(isDumpTruck);

  // Spawn on a road 42m away from player
  const rc = ROAD_COORDS[Math.floor(Math.random() * ROAD_COORDS.length)];
  const x = rc;
  const z = sweeper.pos.z > 0 ? -54 : 54;
  mesh.position.set(x, 0, z);
  scene.add(mesh);

  enforcers.push({
    mesh,
    isDumpTruck,
    x,
    z,
    heading: 0,
    speed: isDumpTruck ? 14.5 : 18.5,
    radius: isDumpTruck ? 3.2 : 2.5,
    state: 'pursuing', // 'pursuing' | 'pancaked' | 'flying'
    vel: new THREE.Vector3(),
    rotVel: new THREE.Vector3(),
    timer: 0,
    bumpCooldown: 0,
  });

  sfx.playHorn();
  spawnWorldPopup(
    sweeper.pos.x,
    5.4,
    sweeper.pos.z,
    isDumpTruck ? '🚨 HEAVY CLAY DUMP TRUCK INCOMING!' : '🚓 POLICE BLOCKADE DISPATCHED!',
    'boulder'
  );
}

function resetEnforcers() {
  enforcers.forEach((e) => scene.remove(e.mesh));
  enforcers.length = 0;
}

function demolishEnforcer(e, impactDir, isMegaBoulder = false) {
  if (e.state !== 'pursuing') return;
  e.state = 'pancaked';
  e.timer = 0;
  e.mesh.scale.set(1.55, 0.15, 1.5);
  e.mesh.position.y = 0.1;

  gameState.wrecksCount++;
  incrementCombo();
  incrementCombo();
  addCompactorCharge(30);
  sfx.playClaySmash(true);
  sfx.playBonusFanfare();
  gameState.cameraShake = 0.85;

  spawnClayBurst(e.x, 1.8, e.z, 0x9b5de5, 22, 1.35);

  const bonusPts = isMegaBoulder ? 2500 : 1200;
  gameState.timeLeft += 6;
  addScore(
    bonusPts,
    e.x,
    3.5,
    e.z,
    isMegaBoulder ? '💥 MEGA-BOULDER BOSS CRUSH! +6s' : '🚨 ENFORCER FLATTENED! +6s',
    'boulder'
  );
}

// ============================================================================
// 9. KATAMARI-STYLE CLAY COMPACTOR BOULDER CANNON
// ============================================================================
const activeBoulders = [];

function launchClayBoulder() {
  if (gameState.compactorCharge < 25 || !gameState.running) return;

  const chargeFraction = gameState.compactorCharge / 100;
  const isMega = gameState.compactorCharge >= 95;
  const radius = 2.1 + chargeFraction * 2.1; // Up to massive 4.2m radius boulder!
  gameState.compactorCharge = 0;
  gameState.bouldersFired++;
  sfx.playBoulderLaunch();

  // Build marbled multi-colored Katamari clay boulder
  const boulderGroup = new THREE.Group();
  const coreGeo = moldClayGeometry(new THREE.DodecahedronGeometry(radius, 2), 0.22);
  const core = new THREE.Mesh(coreGeo, getClayMaterial(0xff595e, 0.78, 0.08));
  core.castShadow = true;
  boulderGroup.add(core);

  // Stick colorful lumped clay blobs & car bumpers sticking out of the boulder!
  for (let i = 0; i < 14; i++) {
    const lumpColor = PALETTE.trashColors[i % PALETTE.trashColors.length];
    const lump = new THREE.Mesh(
      trashBlobGeo,
      getClayMaterial(lumpColor, 0.75)
    );
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = radius * 0.82;
    lump.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    lump.scale.setScalar(0.6 + chargeFraction * 0.7);
    boulderGroup.add(lump);
  }

  const forward = new THREE.Vector3(Math.sin(sweeper.heading), 0, Math.cos(sweeper.heading));
  const spawnPos = sweeper.pos.clone().addScaledVector(forward, 4.8);
  spawnPos.y = radius;
  boulderGroup.position.copy(spawnPos);
  scene.add(boulderGroup);

  activeBoulders.push({
    mesh: boulderGroup,
    pos: spawnPos,
    vel: forward.multiplyScalar(44),
    radius,
    isMega,
    age: 0,
    maxAge: 3.6,
  });

  // Recoil squash on the sweeper + screen shake
  gameState.cameraShake = 0.65;
  spawnWorldPopup(
    sweeper.pos.x,
    4.5,
    sweeper.pos.z,
    isMega ? '100% MEGA CLAY BOULDER! ☄️' : 'CLAY BOULDER LAUNCH! ☄️',
    'boulder'
  );
  updateHud();
}

// ============================================================================
// 10. GAME STATE, NIGHT MODE, COMBOS, POPUPS & INPUT HANDLING
// ============================================================================
const gameState = {
  running: false,
  shiftNumber: 1,
  nightMode: false,
  score: 0,
  combo: 1,
  comboTimer: 0,
  timeLeft: 90,
  compactorCharge: 0, // 0 to 100
  wrecksCount: 0,
  bouldersFired: 0,
  quotaTarget: 75,
  quotaBonusAwarded: false,
  activePowerup: null, // 'magnet' | 'flamethrower' | 'steamroller' | null
  powerupTimer: 0,
  stopMotion12Fps: true,
  cameraShake: 0,
};

function setNightMode(isNight) {
  gameState.nightMode = isNight;

  if (isNight) {
    scene.background.setHex(0x11152c);
    scene.fog.color.setHex(0x11152c);
    hemiLight.color.setHex(0x4b5c9e);
    hemiLight.groundColor.setHex(0x1b1528);
    hemiLight.intensity = 0.55;
    sunLight.color.setHex(0x8ecae6);
    sunLight.intensity = 0.65;
    buildingWindowMat.emissiveIntensity = 1.1;
    streetLampBulbMat.emissiveIntensity = 1.4;
    sweeper.headlightsGroup.visible = true;
  } else {
    scene.background.setHex(0xdcf3ff);
    scene.fog.color.setHex(0xdcf3ff);
    hemiLight.color.setHex(0xfff8eb);
    hemiLight.groundColor.setHex(0x8b728e);
    hemiLight.intensity = 0.95;
    sunLight.color.setHex(0xfff1d6);
    sunLight.intensity = 1.65;
    buildingWindowMat.emissiveIntensity = 0.0;
    streetLampBulbMat.emissiveIntensity = 0.1;
    sweeper.headlightsGroup.visible = false;
  }

  const toggleNightBtn = document.getElementById('toggle-night');
  if (toggleNightBtn) {
    toggleNightBtn.classList.toggle('active', isNight);
    toggleNightBtn.textContent = isNight ? '🌙 Night Mode' : '☀️ Day Mode';
  }
  if (shiftBadgeEl) {
    shiftBadgeEl.textContent = `SHIFT #${gameState.shiftNumber} • ${
      isNight ? 'MIDNIGHT CLAYVILLE 🌙' : 'DAYTIME CLAYVILLE ☀️'
    }`;
  }
}

const keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  shift: false,
};

// Mobile / Touch Floating Virtual Clay Joystick
const touchJoystick = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  dx: 0,
  dy: 0,
  magnitude: 0, // 0..1
  targetHeading: 0,
};

const joystickZoneEl = document.getElementById('touch-joystick-zone');
const joystickBaseEl = document.getElementById('joystick-base');
const joystickKnobEl = document.getElementById('joystick-knob');
const touchHintEl = document.getElementById('touch-hint');

if (joystickZoneEl) {
  joystickZoneEl.addEventListener('pointerdown', (e) => {
    if (!gameState.running) return;
    sfx.init();
    touchJoystick.active = true;
    touchJoystick.pointerId = e.pointerId;
    touchJoystick.startX = e.clientX;
    touchJoystick.startY = e.clientY;
    touchJoystick.dx = 0;
    touchJoystick.dy = 0;
    touchJoystick.magnitude = 0.25; // Light tap starts gentle forward drive

    joystickBaseEl.style.left = `${e.clientX}px`;
    joystickBaseEl.style.top = `${e.clientY}px`;
    joystickBaseEl.classList.remove('hidden');
    joystickKnobEl.style.transform = `translate(0px, 0px)`;
    if (touchHintEl) touchHintEl.classList.add('fade-out');

    joystickZoneEl.setPointerCapture(e.pointerId);
  });

  joystickZoneEl.addEventListener('pointermove', (e) => {
    if (!touchJoystick.active || e.pointerId !== touchJoystick.pointerId) return;
    const maxRadius = 46;
    const rawDx = e.clientX - touchJoystick.startX;
    const rawDy = e.clientY - touchJoystick.startY;
    const dist = Math.hypot(rawDx, rawDy);
    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(rawDy, rawDx);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    joystickKnobEl.style.transform = `translate(${kx}px, ${ky}px)`;

    touchJoystick.dx = kx / maxRadius;
    touchJoystick.dy = ky / maxRadius;
    touchJoystick.magnitude = Math.max(0.25, clampedDist / maxRadius);

    if (dist > 6) {
      // Convert 2D screen drag (dx right, dy down) to Isometric World XZ direction:
      // Camera is at (-42, 54, +42) looking at (0,0,0):
      // Screen Right (+dx) -> World (+X, +Z)
      // Screen Up (-dy)    -> World (+X, -Z)
      const worldX = rawDx - rawDy;
      const worldZ = rawDx + rawDy;
      touchJoystick.targetHeading = Math.atan2(worldX, worldZ);
    }
  });

  const endTouchJoystick = (e) => {
    if (!touchJoystick.active || (e.pointerId !== undefined && e.pointerId !== touchJoystick.pointerId)) return;
    touchJoystick.active = false;
    touchJoystick.pointerId = null;
    touchJoystick.magnitude = 0;
    joystickBaseEl.classList.add('hidden');
  };

  joystickZoneEl.addEventListener('pointerup', endTouchJoystick);
  joystickZoneEl.addEventListener('pointercancel', endTouchJoystick);
}

window.addEventListener('keydown', (e) => {
  const code = e.code;
  if (code === 'KeyW' || code === 'ArrowUp') keys.up = true;
  if (code === 'KeyS' || code === 'ArrowDown') keys.down = true;
  if (code === 'KeyA' || code === 'ArrowLeft') keys.left = true;
  if (code === 'KeyD' || code === 'ArrowRight') keys.right = true;
  if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = true;
  if (code === 'Space') {
    e.preventDefault();
    launchClayBoulder();
  }
  if (code === 'KeyH') {
    triggerHornShockwave();
  }
});

window.addEventListener('keyup', (e) => {
  const code = e.code;
  if (code === 'KeyW' || code === 'ArrowUp') keys.up = false;
  if (code === 'KeyS' || code === 'ArrowDown') keys.down = false;
  if (code === 'KeyA' || code === 'ArrowLeft') keys.left = false;
  if (code === 'KeyD' || code === 'ArrowRight') keys.right = false;
  if (code === 'ShiftLeft' || code === 'ShiftRight') keys.shift = false;
});

function triggerHornShockwave() {
  if (!gameState.running) return;
  sfx.playHorn();
  gameState.cameraShake = 0.25;
  spawnSmokePuff(sweeper.pos.x, 4.2, sweeper.pos.z, 0xffbe2e, 1.1);

  // Scares nearby bikes/cars & bounces them slightly
  vehicles.forEach((v) => {
    if (v.state !== 'driving') return;
    const dist = Math.hypot(v.x - sweeper.pos.x, v.z - sweeper.pos.z);
    if (dist < 14) {
      v.mesh.position.y = 0.9;
    }
  });
}

// World-to-screen floating arcade popups
const popupsLayer = document.getElementById('popups-layer');
function spawnWorldPopup(wx, wy, wz, text, styleClass = '') {
  const v = new THREE.Vector3(wx, wy, wz);
  v.project(camera);
  if (v.z > 1) return;

  const x = (v.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;

  const el = document.createElement('div');
  el.className = `world-popup ${styleClass}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.textContent = text;
  popupsLayer.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function addScore(basePoints, wx, wy, wz, label = '', styleClass = '') {
  gameState.comboTimer = 3.2;
  const pts = Math.round(basePoints * gameState.combo);
  gameState.score += pts;

  if (label) {
    spawnWorldPopup(wx, wy, wz, `${label} +${pts}`, styleClass);
  }
}

function incrementCombo() {
  gameState.combo = Math.min(12, gameState.combo + 1);
  gameState.comboTimer = 3.4;
}

function addCompactorCharge(amount) {
  const prev = gameState.compactorCharge;
  gameState.compactorCharge = Math.min(100, gameState.compactorCharge + amount);
  if (prev < 25 && gameState.compactorCharge >= 25) {
    sfx.playSweepPop(8);
  }
}

// Demolish a vehicle (either flatten into a clay pancake or launch it tumbling!)
function demolishVehicle(v, impactSourcePos, impactDir, forcePancake = false) {
  if (v.state !== 'driving') return;

  gameState.wrecksCount++;
  incrementCombo();
  addCompactorCharge(v.type === 'bike' ? 9 : 16);

  const isHeavy = v.type !== 'bike';
  sfx.playClaySmash(isHeavy);
  gameState.cameraShake = Math.max(gameState.cameraShake, isHeavy ? 0.45 : 0.25);

  // Spawn collectible Play-Doh explosion chunks!
  spawnClayBurst(v.x, 1.2, v.z, v.color, isHeavy ? 14 : 8, isHeavy ? 1.15 : 0.9);

  // Decide between flattening into a clay pancake or flinging through the air
  const makePancake = forcePancake || Math.random() < 0.48;
  if (makePancake) {
    v.state = 'pancaked';
    v.timer = 0;
    // Squash flat onto the asphalt like run-over Play-Doh!
    v.mesh.scale.set(1.45, 0.14, 1.4);
    v.mesh.position.y = 0.08;
    const words = ['SQUISHED!', 'CLAY PANCAKE!', 'FLATTENED!', 'SPLAT!'];
    const word = words[Math.floor(Math.random() * words.length)];
    addScore(isHeavy ? 250 : 150, v.x, 2.4, v.z, word, 'smash');
  } else {
    v.state = 'flying';
    v.timer = 0;
    const pushX = impactDir.x * 24 + (Math.random() - 0.5) * 14;
    const pushZ = impactDir.z * 24 + (Math.random() - 0.5) * 14;
    v.vel.set(pushX, 14 + Math.random() * 7, pushZ);
    v.rotVel.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 14
    );
    const words = ['CRUNCH!', 'HOME RUN!', 'YEETED!', 'SMASHED!'];
    const word = words[Math.floor(Math.random() * words.length)];
    addScore(isHeavy ? 300 : 180, v.x, 2.8, v.z, word, 'smash');
  }

  // Every 7 vehicles demolished dispatches a City Enforcer Boss Hazard!
  if (gameState.wrecksCount % 7 === 0) {
    spawnEnforcerBoss();
  }

  // Every 10 vehicles demolished grants a +4s Rampage Time Bonus!
  if (gameState.wrecksCount % 10 === 0) {
    gameState.timeLeft += 4;
    sfx.playBonusFanfare();
    spawnWorldPopup(sweeper.pos.x, 5.2, sweeper.pos.z, '10x WRECKSTREAK! +4s TIME!', 'time-bonus');
  }
}

// ============================================================================
// 11. UI BINDINGS & HUD UPDATES
// ============================================================================
const scoreEl = document.getElementById('score-value');
const comboBadgeEl = document.getElementById('combo-badge');
const comboCountEl = document.getElementById('combo-count');
const comboTimerFillEl = document.getElementById('combo-timer-fill');
const timerValEl = document.getElementById('timer-value');
const shiftBadgeEl = document.getElementById('shift-level-badge');
const powerupBadgeEl = document.getElementById('powerup-badge');
const powerupNameEl = document.getElementById('powerup-name');
const powerupTimerFillEl = document.getElementById('powerup-timer-fill');
const enforcerBadgeEl = document.getElementById('enforcer-badge');
const cleanPercentEl = document.getElementById('clean-percent');
const cleanBarFillEl = document.getElementById('clean-bar-fill');
const wrecksCountEl = document.getElementById('wrecks-count');
const compactorCardEl = document.getElementById('compactor-card');
const compactorStatusEl = document.getElementById('compactor-status');
const compactorPercentEl = document.getElementById('compactor-percent');
const compactorBarFillEl = document.getElementById('compactor-bar-fill');
const fireBoulderBtn = document.getElementById('fire-boulder-btn');
const turboBtn = document.getElementById('turbo-btn');

function getCleanlinessPercentage() {
  if (grimePatches.length === 0) return 0;
  let cleanedCount = 0;
  for (let i = 0; i < grimePatches.length; i++) {
    if (grimePatches[i].cleaned) cleanedCount++;
  }
  // Scale so cleaning ~65% of the entire map hits 100% City Cleanliness!
  const rawPct = (cleanedCount / (grimePatches.length * 0.65)) * 100;
  return Math.min(100, Math.floor(rawPct));
}

function updateHud() {
  scoreEl.textContent = gameState.score.toLocaleString();

  if (gameState.combo > 1 && gameState.comboTimer > 0) {
    comboBadgeEl.classList.remove('hidden');
    comboCountEl.textContent = `${gameState.combo}x`;
    comboTimerFillEl.style.width = `${(gameState.comboTimer / 3.4) * 100}%`;
  } else {
    comboBadgeEl.classList.add('hidden');
  }

  // Active Power-Up HUD indicator
  if (gameState.activePowerup && gameState.powerupTimer > 0) {
    powerupBadgeEl.classList.remove('hidden');
    const names = {
      magnet: '🧲 GIANT MAGNET BRUSHES',
      flamethrower: '🔥 DUAL FLAMETHROWERS',
      steamroller: '🛞 MONSTER STEAMROLLER',
    };
    powerupNameEl.textContent = names[gameState.activePowerup] || 'POWER-UP!';
    powerupTimerFillEl.style.width = `${(gameState.powerupTimer / 12.0) * 100}%`;
  } else if (powerupBadgeEl) {
    powerupBadgeEl.classList.add('hidden');
  }

  // Active Enforcer Alert indicator
  const activeEnforcerCount = enforcers.filter((e) => e.state === 'pursuing').length;
  if (enforcerBadgeEl) {
    enforcerBadgeEl.classList.toggle('hidden', activeEnforcerCount === 0);
    if (activeEnforcerCount > 0) {
      enforcerBadgeEl.textContent = `🚨 ${activeEnforcerCount} ENFORCER BOSS${
        activeEnforcerCount > 1 ? 'ES' : ''
      } ACTIVE!`;
    }
  }

  // Timer formatting
  const secs = Math.max(0, Math.ceil(gameState.timeLeft));
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  timerValEl.textContent = `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  timerValEl.classList.toggle('urgent', secs <= 15);

  // Cleanliness
  const cleanPct = getCleanlinessPercentage();
  cleanPercentEl.textContent = `${cleanPct}%`;
  cleanBarFillEl.style.width = `${cleanPct}%`;
  wrecksCountEl.textContent = gameState.wrecksCount;

  // Check if cleanliness quota just reached!
  if (!gameState.quotaBonusAwarded && cleanPct >= gameState.quotaTarget) {
    gameState.quotaBonusAwarded = true;
    gameState.timeLeft += 12;
    gameState.score += 2500;
    sfx.playBonusFanfare();
    spawnWorldPopup(
      sweeper.pos.x,
      5.5,
      sweeper.pos.z,
      'QUOTA MET! +12s BONUS TIME! ✨',
      'time-bonus'
    );
  }

  // Compactor Cannon
  const charge = Math.floor(gameState.compactorCharge);
  compactorPercentEl.textContent = `${charge}%`;
  compactorBarFillEl.style.width = `${charge}%`;

  const canFire = charge >= 25;
  fireBoulderBtn.disabled = !canFire;
  compactorCardEl.classList.toggle('ready', canFire);

  if (charge >= 100) {
    compactorStatusEl.textContent = '100% MEGA-BOULDER READY!';
  } else if (canFire) {
    compactorStatusEl.textContent = 'READY TO LAUNCH! [SPACE]';
  } else {
    compactorStatusEl.textContent = 'SWEEP & SMASH TO FILL (25%+)';
  }

  // Scale hopper clay mound on the truck
  const moundScale = 0.1 + (charge / 100) * 1.15;
  sweeper.hopperMound.scale.set(moundScale, moundScale * 0.85, moundScale);
}

// Button listeners
fireBoulderBtn.addEventListener('click', () => {
  sfx.init();
  launchClayBoulder();
});

turboBtn.addEventListener('mousedown', () => (keys.shift = true));
turboBtn.addEventListener('mouseup', () => (keys.shift = false));
turboBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys.shift = true;
});
turboBtn.addEventListener('touchend', () => (keys.shift = false));

const toggleStopMotionBtn = document.getElementById('toggle-stopmotion');
toggleStopMotionBtn.addEventListener('click', () => {
  gameState.stopMotion12Fps = !gameState.stopMotion12Fps;
  toggleStopMotionBtn.classList.toggle('active', gameState.stopMotion12Fps);
  toggleStopMotionBtn.textContent = `🎬 12fps: ${gameState.stopMotion12Fps ? 'ON' : 'OFF'}`;
});

const toggleNightBtn = document.getElementById('toggle-night');
if (toggleNightBtn) {
  toggleNightBtn.addEventListener('click', () => {
    setNightMode(!gameState.nightMode);
  });
}

const toggleSoundBtn = document.getElementById('toggle-sound');
toggleSoundBtn.addEventListener('click', () => {
  sfx.init();
  sfx.enabled = !sfx.enabled;
  toggleSoundBtn.classList.toggle('active', sfx.enabled);
  toggleSoundBtn.textContent = `🔊 SFX: ${sfx.enabled ? 'ON' : 'OFF'}`;
});

// Start & End Modals
const modalOverlay = document.getElementById('modal-overlay');
const startModal = document.getElementById('start-modal');
const gameoverModal = document.getElementById('gameover-modal');

function startGame(nextShift = false) {
  sfx.init();
  if (nextShift) {
    gameState.shiftNumber++;
  } else {
    gameState.shiftNumber = 1;
    gameState.score = 0;
  }

  gameState.combo = 1;
  gameState.comboTimer = 0;
  gameState.timeLeft = 90;
  gameState.compactorCharge = 35; // Start with a free boulder ready to test right away!
  gameState.wrecksCount = 0;
  gameState.bouldersFired = 0;
  gameState.quotaBonusAwarded = false;
  gameState.activePowerup = null;
  gameState.powerupTimer = 0;
  gameState.running = true;

  // Even level numbers automatically switch to Night Mode!
  const isEvenShiftNight = gameState.shiftNumber % 2 === 0;
  setNightMode(isEvenShiftNight);
  applySweeperPowerupVisuals();

  sweeper.pos.set(-18, 0, 18);
  sweeper.heading = 0;
  sweeper.speed = 0;

  spawnCityMess();
  resetStreetProps();
  spawnPowerupTubs();
  resetTraffic();
  resetEnforcers();

  // On Shift #2 and higher, dispatch an initial Enforcer Boss right away!
  if (gameState.shiftNumber >= 2) {
    spawnEnforcerBoss();
  }

  updateHud();

  modalOverlay.classList.add('hidden');
  startModal.classList.add('hidden');
  gameoverModal.classList.add('hidden');
  sfx.playBonusFanfare();
}

function endShift() {
  gameState.running = false;
  const cleanPct = getCleanlinessPercentage();
  const wonQuota = cleanPct >= gameState.quotaTarget;
  const nextShiftNum = gameState.shiftNumber + 1;
  const nextModeLabel = nextShiftNum % 2 === 0 ? '🌙 NIGHT SHIFT' : '☀️ DAY SHIFT';

  document.getElementById('gameover-badge').textContent = wonQuota
    ? `SHIFT #${gameState.shiftNumber} QUOTA CRUSHED!`
    : `SHIFT #${gameState.shiftNumber} TIME UP!`;
  document.getElementById('gameover-title').textContent = wonQuota
    ? 'STREET SWEEP SUPERSTAR!'
    : 'BACK TO THE CLAY GARAGE!';
  document.getElementById('gameover-subtitle').textContent = wonQuota
    ? `You scrubbed ${cleanPct}% of Clayville and flattened ${gameState.wrecksCount} vehicles! Ready for Shift #${nextShiftNum} (${nextModeLabel})?`
    : `You reached ${cleanPct}% cleanliness (Quota: ${gameState.quotaTarget}%). Try Shift #${nextShiftNum} (${nextModeLabel})!`;

  document.getElementById('final-score').textContent = gameState.score.toLocaleString();
  document.getElementById('final-clean').textContent = `${cleanPct}%`;
  document.getElementById('final-wrecks').textContent = gameState.wrecksCount;
  document.getElementById('final-boulders').textContent = gameState.bouldersFired;

  modalOverlay.classList.remove('hidden');
  startModal.classList.add('hidden');
  gameoverModal.classList.remove('hidden');
  sfx.playBonusFanfare();
}

document.getElementById('start-game-btn').addEventListener('click', () => startGame(false));
document.getElementById('next-shift-btn').addEventListener('click', () => startGame(true));

// ============================================================================
// 12. MAIN ARCADE PHYSICS & STOP-MOTION ANIMATION LOOP
// ============================================================================
let lastTime = performance.now();
let stopMotionAccumulator = 0;
let steppedTime = 0;

function updateGame(dt, elapsed) {
  // 12 FPS Stop-Motion stepped clock for authentic clay animation wobble
  stopMotionAccumulator += dt;
  if (stopMotionAccumulator >= 1 / 12) {
    steppedTime += stopMotionAccumulator;
    stopMotionAccumulator = 0;
  }
  const animClock = gameState.stopMotion12Fps ? steppedTime : elapsed;

  if (gameState.running) {
    // Countdown Timer
    gameState.timeLeft -= dt;
    if (gameState.timeLeft <= 0) {
      gameState.timeLeft = 0;
      updateHud();
      endShift();
      return;
    }

    // Combo decay
    if (gameState.comboTimer > 0) {
      gameState.comboTimer -= dt;
      if (gameState.comboTimer <= 0) {
        gameState.combo = 1;
      }
    }

    // Active Power-Up timer decay
    if (gameState.powerupTimer > 0) {
      gameState.powerupTimer -= dt;
      if (gameState.powerupTimer <= 0) {
        gameState.activePowerup = null;
        applySweeperPowerupVisuals();
      }
    }

    const isMagnet = gameState.activePowerup === 'magnet';
    const isFlamethrower = gameState.activePowerup === 'flamethrower';
    const isSteamroller = gameState.activePowerup === 'steamroller';

    // ------------------------------------------------------------------------
    // A. SWEEPER TRUCK DRIVING & TURBO DRIFT PHYSICS (Keyboard + Mobile Touch)
    // ------------------------------------------------------------------------
    sweeper.turboActive = keys.shift;
    const targetMax = (sweeper.turboActive ? 40 : sweeper.maxSpeed) * (isSteamroller ? 1.12 : 1.0);
    const accel = sweeper.turboActive ? 46 : 30;

    if (touchJoystick.active) {
      const desiredSpeed = targetMax * Math.min(1, touchJoystick.magnitude * 1.15);
      sweeper.speed = THREE.MathUtils.lerp(sweeper.speed, desiredSpeed, 8 * dt);

      let angleDiff = touchJoystick.targetHeading - sweeper.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const maxSteerStep = (sweeper.turboActive ? 6.2 : 5.2) * dt;
      sweeper.heading += THREE.MathUtils.clamp(angleDiff, -maxSteerStep, maxSteerStep);
    } else {
      if (keys.up) {
        sweeper.speed = Math.min(targetMax, sweeper.speed + accel * dt);
      } else if (keys.down) {
        sweeper.speed = Math.max(-16, sweeper.speed - 28 * dt);
      } else {
        sweeper.speed *= Math.pow(0.08, dt);
        if (Math.abs(sweeper.speed) < 0.2) sweeper.speed = 0;
      }

      const turnRate = (sweeper.turboActive ? 3.2 : 2.65) * (sweeper.speed >= -0.5 ? 1 : -1);
      if (keys.left) sweeper.heading += turnRate * dt;
      if (keys.right) sweeper.heading -= turnRate * dt;
    }

    const moveX = Math.sin(sweeper.heading) * sweeper.speed * dt;
    const moveZ = Math.cos(sweeper.heading) * sweeper.speed * dt;
    sweeper.pos.x += moveX;
    sweeper.pos.z += moveZ;

    // Collide & slide softly against building blocks
    const truckRadius = isSteamroller ? 3.35 : 2.65;
    for (let i = 0; i < buildingObstacles.length; i++) {
      const b = buildingObstacles[i];
      const dx = sweeper.pos.x - b.x;
      const dz = sweeper.pos.z - b.z;
      const overlapX = b.halfW + truckRadius - Math.abs(dx);
      const overlapZ = b.halfD + truckRadius - Math.abs(dz);

      if (overlapX > 0 && overlapZ > 0) {
        if (overlapX < overlapZ) {
          sweeper.pos.x += dx > 0 ? overlapX : -overlapX;
        } else {
          sweeper.pos.z += dz > 0 ? overlapZ : -overlapZ;
        }
        sweeper.speed *= 0.65;
      }
    }

    // Update Sweeper Transform + Stop-Motion Chug Wobble
    sweeper.group.position.copy(sweeper.pos);
    sweeper.group.rotation.y = sweeper.heading;

    const chugBounce = Math.abs(Math.sin(animClock * 16)) * (0.06 + Math.abs(sweeper.speed) * 0.004);
    sweeper.bodyGroup.position.y = chugBounce;

    // Body roll when turning & pitching when accelerating
    const steerInput = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
    sweeper.bodyGroup.rotation.z = THREE.MathUtils.lerp(
      sweeper.bodyGroup.rotation.z,
      -steerInput * (sweeper.speed / 35) * 0.16,
      10 * dt
    );
    sweeper.bodyGroup.rotation.x = THREE.MathUtils.lerp(
      sweeper.bodyGroup.rotation.x,
      keys.up ? -0.04 : keys.down ? 0.05 : 0,
      10 * dt
    );

    // Spin rotary brushes (stepped to 12fps when stop-motion feel is active!)
    const brushSpeed = sweeper.turboActive || isMagnet ? 24 : 13;
    sweeper.leftBrush.rotation.y = animClock * brushSpeed;
    sweeper.rightBrush.rotation.y = -animClock * brushSpeed;

    // Pulse roof siren
    sweeper.beaconBulb.material.emissiveIntensity = 0.6 + Math.sin(animClock * 14) * 0.5;

    // Exhaust & turbo clay puffs
    if (Math.random() < (sweeper.turboActive ? 0.45 : 0.18)) {
      const backX = sweeper.pos.x - Math.sin(sweeper.heading) * 3.2;
      const backZ = sweeper.pos.z - Math.cos(sweeper.heading) * 3.2;
      spawnSmokePuff(
        backX,
        1.2,
        backZ,
        sweeper.turboActive ? 0xffbe2e : 0xfff3dd,
        sweeper.turboActive ? 0.6 : 0.35
      );
    }

    // Dual Side-Flamethrowers spewing clay fireballs left & right!
    if (isFlamethrower && Math.random() < 0.75) {
      const rightVecX = Math.cos(sweeper.heading);
      const rightVecZ = -Math.sin(sweeper.heading);
      [-1, 1].forEach((side) => {
        const distOut = 3.2 + Math.random() * 4.8;
        const fx = sweeper.pos.x + rightVecX * side * distOut;
        const fz = sweeper.pos.z + rightVecZ * side * distOut;
        const fireColor = Math.random() > 0.4 ? 0xff5400 : 0xffbe0b;
        spawnSmokePuff(fx, 1.3, fz, fireColor, 0.85);
      });
    }

    // ------------------------------------------------------------------------
    // B. COLLECTIBLE GOLDEN PLAY-DOH TUB POWER-UPS
    // ------------------------------------------------------------------------
    for (let i = 0; i < powerupTubs.length; i++) {
      const tub = powerupTubs[i];
      if (tub.active) {
        tub.mesh.rotation.y = animClock * 2.6 + i;
        tub.mesh.position.y = 0.25 + Math.abs(Math.sin(animClock * 4 + i)) * 0.65;

        const dist = Math.hypot(tub.x - sweeper.pos.x, tub.z - sweeper.pos.z);
        if (dist < 4.2) {
          tub.active = false;
          tub.respawnTimer = 18.0;
          tub.mesh.visible = false;
          activatePowerup(tub.powerup);
          spawnClayBurst(tub.x, 1.5, tub.z, 0xffbe0b, 14, 1.1);
        }
      } else {
        tub.respawnTimer -= dt;
        if (tub.respawnTimer <= 0) {
          tub.active = true;
          tub.mesh.visible = true;
        }
      }
    }

    // ------------------------------------------------------------------------
    // C. SWEEPING STREET GRIME & VACUUMING CLAY CHUNKS
    // ------------------------------------------------------------------------
    const brushCenterX = sweeper.pos.x + Math.sin(sweeper.heading) * 2.8;
    const brushCenterZ = sweeper.pos.z + Math.cos(sweeper.heading) * 2.8;
    const sweepRadius = isMagnet
      ? 12.5
      : isFlamethrower || isSteamroller
      ? 7.8
      : sweeper.turboActive
      ? 5.6
      : 4.4;

    for (let i = 0; i < grimePatches.length; i++) {
      const g = grimePatches[i];
      if (g.cleaned) continue;

      if (!g.beingSucked) {
        const dist = Math.hypot(g.x - brushCenterX, g.z - brushCenterZ);
        if (dist < sweepRadius) {
          g.beingSucked = true;
          sfx.playSweepPop(gameState.combo);
          addCompactorCharge(2.8);
          addScore(45, g.x, 1.5, g.z, 'CLEAN!', '');
        }
      } else {
        g.suckProgress += dt * 5.5;
        g.mesh.position.x = THREE.MathUtils.lerp(g.x, brushCenterX, g.suckProgress);
        g.mesh.position.z = THREE.MathUtils.lerp(g.z, brushCenterZ, g.suckProgress);
        g.mesh.position.y = Math.sin(g.suckProgress * Math.PI) * 1.4;
        const s = Math.max(0.01, 1 - g.suckProgress);
        g.mesh.scale.setScalar(s);

        if (g.suckProgress >= 1) {
          g.cleaned = true;
          scene.remove(g.mesh);
        }
      }
    }

    // Update & vacuum loose clay chunks from smashed cars
    const chunkMagnetRadius = isMagnet ? 18.0 : 8.5;
    for (let i = looseClayChunks.length - 1; i >= 0; i--) {
      const c = looseClayChunks[i];
      c.age += dt;

      c.vel.y -= 26 * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.rotation.x += c.rotVel.x * dt;
      c.mesh.rotation.y += c.rotVel.y * dt;

      if (c.mesh.position.y < 0.35) {
        c.mesh.position.y = 0.35;
        c.vel.y *= -0.45;
        c.vel.x *= 0.72;
        c.vel.z *= 0.72;
      }

      const dx = brushCenterX - c.mesh.position.x;
      const dz = brushCenterZ - c.mesh.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < chunkMagnetRadius && c.age > 0.18) {
        const pullSpeed = isMagnet ? 38 : 24;
        c.mesh.position.x += (dx / dist) * pullSpeed * dt;
        c.mesh.position.z += (dz / dist) * pullSpeed * dt;
        if (dist < 2.4) {
          sfx.playSweepPop(gameState.combo);
          addCompactorCharge(1.2);
          gameState.score += 20 * gameState.combo;
          scene.remove(c.mesh);
          looseClayChunks.splice(i, 1);
          continue;
        }
      }

      if (c.age > 8) {
        scene.remove(c.mesh);
        looseClayChunks.splice(i, 1);
      }
    }

    // ------------------------------------------------------------------------
    // D. TRAFFIC AI & WILD DEMOLITION COLLISIONS
    // ------------------------------------------------------------------------
    const impactDir = new THREE.Vector3(Math.sin(sweeper.heading), 0, Math.cos(sweeper.heading));
    const hitExtraRadius = isFlamethrower ? 5.2 : isSteamroller ? 2.2 : 0;

    for (let i = vehicles.length - 1; i >= 0; i--) {
      const v = vehicles[i];

      if (v.state === 'driving') {
        v.x += Math.sin(v.heading) * v.speed * dt;
        v.z += Math.cos(v.heading) * v.speed * dt;

        if (v.x > WORLD_HALF) v.x = -WORLD_HALF;
        if (v.x < -WORLD_HALF) v.x = WORLD_HALF;
        if (v.z > WORLD_HALF) v.z = -WORLD_HALF;
        if (v.z < -WORLD_HALF) v.z = WORLD_HALF;

        v.mesh.position.x = v.x;
        v.mesh.position.z = v.z;
        v.mesh.rotation.z = Math.sin(animClock * 12 + i) * 0.045;

        const distToTruck = Math.hypot(v.x - sweeper.pos.x, v.z - sweeper.pos.z);
        const distToBrushes = Math.hypot(v.x - brushCenterX, v.z - brushCenterZ);
        if (
          distToTruck < v.radius + 2.6 + hitExtraRadius ||
          distToBrushes < v.radius + 2.2 + hitExtraRadius
        ) {
          demolishVehicle(v, sweeper.pos, impactDir, isSteamroller);
        }
      } else if (v.state === 'pancaked') {
        v.timer += dt;
        if (v.timer > 0.45) {
          const dist = Math.hypot(v.x - brushCenterX, v.z - brushCenterZ);
          if (dist < (isMagnet ? 9.5 : 4.5)) {
            sfx.playSweepPop(10);
            addCompactorCharge(8);
            addScore(150, v.x, 1.5, v.z, 'SCHLORPED!', '');
            scene.remove(v.mesh);
            vehicles.splice(i, 1);
            spawnTrafficVehicle();
            continue;
          }
        }
        if (v.timer > 6.5) {
          scene.remove(v.mesh);
          vehicles.splice(i, 1);
          spawnTrafficVehicle();
        }
      } else if (v.state === 'flying') {
        v.timer += dt;
        v.vel.y -= 30 * dt;
        v.mesh.position.addScaledVector(v.vel, dt);
        v.mesh.rotation.x += v.rotVel.x * dt;
        v.mesh.rotation.y += v.rotVel.y * dt;
        v.mesh.rotation.z += v.rotVel.z * dt;

        if (v.mesh.position.y < 0.5 && v.vel.y < 0) {
          v.mesh.position.y = 0.2;
          v.vel.y *= -0.35;
          v.mesh.scale.set(1.35, 0.35, 1.35);
        }

        if (v.timer > 2.2) {
          scene.remove(v.mesh);
          vehicles.splice(i, 1);
          spawnTrafficVehicle();
        }
      }
    }

    // ------------------------------------------------------------------------
    // E. CITY ENFORCERS / BOSS HAZARDS (Dump Trucks & Police Blockades)
    // ------------------------------------------------------------------------
    for (let i = enforcers.length - 1; i >= 0; i--) {
      const e = enforcers[i];
      if (e.bumpCooldown > 0) e.bumpCooldown -= dt;

      if (e.state === 'pursuing') {
        // Actively steer toward Big Bristle!
        const targetAngle = Math.atan2(sweeper.pos.x - e.x, sweeper.pos.z - e.z);
        let diff = targetAngle - e.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        e.heading += THREE.MathUtils.clamp(diff, -2.1 * dt, 2.1 * dt);

        e.x += Math.sin(e.heading) * e.speed * dt;
        e.z += Math.cos(e.heading) * e.speed * dt;
        e.mesh.position.set(e.x, 0, e.z);
        e.mesh.rotation.y = e.heading;
        e.mesh.rotation.z = Math.sin(animClock * 15 + i) * 0.05;

        const dist = Math.hypot(e.x - sweeper.pos.x, e.z - sweeper.pos.z);
        if (dist < e.radius + truckRadius + (isFlamethrower ? 3.5 : 0)) {
          // If player has Steamroller Tires, Flamethrowers, or high-speed Turbo, crush the Enforcer!
          if (isSteamroller || isFlamethrower || sweeper.turboActive) {
            demolishEnforcer(e, impactDir, false);
          } else if (e.bumpCooldown <= 0) {
            // Armored Boss shoves player back—prompting them to use Boulder or Turbo/Powerup!
            e.bumpCooldown = 1.1;
            sweeper.speed = -18;
            gameState.cameraShake = 0.55;
            sfx.playClaySmash(true);
            spawnWorldPopup(
              e.x,
              3.5,
              e.z,
              'ARMORED ENFORCER! USE BOULDER OR TURBO! 🛡️',
              'smash'
            );
          }
        }
      } else if (e.state === 'pancaked') {
        e.timer += dt;
        if (e.timer > 5.0) {
          scene.remove(e.mesh);
          enforcers.splice(i, 1);
        }
      }
    }

    // ------------------------------------------------------------------------
    // F. DESTRUCTIBLE STREET FURNITURE (Hot-Dog Carts, Cafés, Bus Stops, etc.)
    // ------------------------------------------------------------------------
    for (let i = 0; i < streetProps.length; i++) {
      const p = streetProps[i];
      if (!p.smashed) {
        const dist = Math.hypot(p.x - sweeper.pos.x, p.z - sweeper.pos.z);
        if (dist < 3.6 + hitExtraRadius) {
          p.smashed = true;
          p.vel.set(
            impactDir.x * 20 + (Math.random() - 0.5) * 8,
            12 + Math.random() * 5,
            impactDir.z * 20 + (Math.random() - 0.5) * 8
          );
          p.rotVel.set(8, 5, 9);
          sfx.playClaySmash(false);
          incrementCombo();
          addCompactorCharge(6);
          spawnClayBurst(p.x, 1.2, p.z, p.burstColor, 12, 1.1);
          addScore(p.points, p.x, 2.4, p.z, p.label, 'smash');
        }
      } else if (p.mesh.visible) {
        p.vel.y -= 28 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.rotation.x += p.rotVel.x * dt;
        p.mesh.rotation.z += p.rotVel.z * dt;
        if (p.mesh.position.y < -2) p.mesh.visible = false;
      }
    }

    // ------------------------------------------------------------------------
    // G. ACTIVE COMPACTOR CLAY BOULDERS
    // ------------------------------------------------------------------------
    for (let i = activeBoulders.length - 1; i >= 0; i--) {
      const b = activeBoulders[i];
      b.age += dt;
      b.pos.addScaledVector(b.vel, dt);
      b.mesh.position.copy(b.pos);
      b.mesh.rotation.x += 7 * dt;
      b.mesh.rotation.z -= 4 * dt;

      // Flatten every vehicle in the boulder's path!
      for (let j = 0; j < vehicles.length; j++) {
        const v = vehicles[j];
        if (v.state !== 'driving') continue;
        if (Math.hypot(v.x - b.pos.x, v.z - b.pos.z) < b.radius + v.radius + 0.8) {
          demolishVehicle(v, b.pos, b.vel.clone().normalize(), true);
        }
      }

      // Flatten City Enforcer Bosses in the boulder's path for HUGE bonus points!
      for (let j = 0; j < enforcers.length; j++) {
        const e = enforcers[j];
        if (e.state !== 'pursuing') continue;
        if (Math.hypot(e.x - b.pos.x, e.z - b.pos.z) < b.radius + e.radius + 1.2) {
          demolishEnforcer(e, b.vel.clone().normalize(), b.isMega);
        }
      }

      // Smash street furniture in the boulder's path!
      for (let j = 0; j < streetProps.length; j++) {
        const p = streetProps[j];
        if (p.smashed) continue;
        if (Math.hypot(p.x - b.pos.x, p.z - b.pos.z) < b.radius + 1.8) {
          p.smashed = true;
          p.vel.set(b.vel.x * 0.5, 14, b.vel.z * 0.5);
          p.rotVel.set(9, 6, 8);
          spawnClayBurst(p.x, 1.2, p.z, p.burstColor, 10, 1.1);
          addScore(p.points, p.x, 2.4, p.z, p.label, 'smash');
        }
      }

      // Instantly scrub grime patches under the rolling boulder!
      for (let j = 0; j < grimePatches.length; j++) {
        const g = grimePatches[j];
        if (g.cleaned || g.beingSucked) continue;
        if (Math.hypot(g.x - b.pos.x, g.z - b.pos.z) < b.radius + 1.8) {
          g.cleaned = true;
          scene.remove(g.mesh);
          sfx.playSweepPop(12);
          gameState.score += 60 * gameState.combo;
        }
      }

      if (b.age >= b.maxAge || Math.abs(b.pos.x) > WORLD_HALF + 10 || Math.abs(b.pos.z) > WORLD_HALF + 10) {
        spawnClayBurst(b.pos.x, b.pos.y, b.pos.z, 0xff595e, 16, 1.3);
        sfx.playClaySmash(true);
        scene.remove(b.mesh);
        activeBoulders.splice(i, 1);
      }
    }

    updateHud();
  }

  // Update clay smoke puffs
  for (let i = clayPuffs.length - 1; i >= 0; i--) {
    const p = clayPuffs[i];
    p.age += dt;
    p.mesh.position.addScaledVector(p.vel, dt);
    const t = p.age / p.maxAge;
    p.mesh.scale.setScalar(Math.max(0.01, (1 - t) * 0.65));
    if (p.age >= p.maxAge) {
      scene.remove(p.mesh);
      clayPuffs.splice(i, 1);
    }
  }

  // Smooth Isometric Camera Follow + Responsive Portrait Zoom + Impact Shake
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const portraitZoom = aspect < 1 ? THREE.MathUtils.clamp(1.38 - aspect * 0.35, 1.05, 1.35) : 1.0;
  const targetCamPos = sweeper.pos.clone().addScaledVector(CAMERA_OFFSET, portraitZoom);
  camera.position.lerp(targetCamPos, 8 * dt);

  const lookTarget = sweeper.pos.clone();
  if (gameState.cameraShake > 0) {
    lookTarget.x += (Math.random() - 0.5) * gameState.cameraShake * 3.2;
    lookTarget.z += (Math.random() - 0.5) * gameState.cameraShake * 3.2;
    gameState.cameraShake = Math.max(0, gameState.cameraShake - dt * 2.4);
  }
  camera.lookAt(lookTarget);

  renderer.render(scene, camera);
}

// Initial idle scene setup so the background diorama is alive on the title screen
spawnCityMess();
spawnPowerupTubs();
resetTraffic();
camera.position.copy(sweeper.pos.clone().add(CAMERA_OFFSET));
camera.lookAt(sweeper.pos);

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  updateGame(dt, now / 1000);
}
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
