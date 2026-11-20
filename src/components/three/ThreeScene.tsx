import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type ThreeVariant = 'calculator' | 'car' | 'house' | 'plant';

export interface ThreeShowcaseProps {
  variant: ThreeVariant;
  className?: string;
  accentValue?: number;
}

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function buildCalculatorGroup(): THREE.Group {
  const group = new THREE.Group();

  // 1. Chassis (rounded slab)
  const w = 2.1;
  const h = 2.75;
  const r = 0.28;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 5,
  });
  bodyGeo.center();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x8b5cff,
    emissive: 0x5b2cff,
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // Peechay pink glow slab (depth aur colour pop ke liye)
  const glowSlab = new THREE.Mesh(
    bodyGeo,
    new THREE.MeshStandardMaterial({
      color: 0xff4d8d,
      emissive: 0xff2d78,
      emissiveIntensity: 0.9,
      roughness: 0.4,
    })
  );
  glowSlab.scale.set(1.07, 1.07, 0.5);
  glowSlab.position.z = -0.14;
  group.add(glowSlab);

  // 2. Screen bezel + glowing LCD
  const bezel = new THREE.Mesh(
    new RoundedBoxGeometry(1.66, 0.66, 0.1, 4, 0.07),
    new THREE.MeshStandardMaterial({ color: 0x0b0e26, roughness: 0.2, metalness: 0.5 })
  );
  bezel.position.set(0, 0.85, 0.25);
  group.add(bezel);

  const lcd = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.52, 0.02),
    new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.85,
      roughness: 0.15,
    })
  );
  lcd.position.set(0, 0.85, 0.305);
  group.add(lcd);

  // LCD par animated bar chart (animate loop mein scale.y chalta hai)
  const barColors = [0xfacc15, 0xfb7185, 0x34d399, 0x1d4ed8, 0x9333ea];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.BoxGeometry(0.12, 0.4, 0.03);
    g.translate(0, 0.2, 0); // origin neechay, taake neechay se upar grow kare
    const bar = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({
        color: barColors[i],
        emissive: barColors[i],
        emissiveIntensity: 0.7,
        roughness: 0.3,
      })
    );
    bar.position.set(-0.62 + i * 0.17, 0.63, 0.33);
    bar.name = `lcd_bar_${i}`;
    group.add(bar);
  }

  const readout = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.15, 0.03),
    new THREE.MeshStandardMaterial({
      color: 0xb4f434,
      emissive: 0xb4f434,
      emissiveIntensity: 0.9,
    })
  );
  readout.position.set(0.5, 0.97, 0.33);
  group.add(readout);

  const readout2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.1, 0.03),
    new THREE.MeshStandardMaterial({
      color: 0xff4d8d,
      emissive: 0xff4d8d,
      emissiveIntensity: 0.9,
    })
  );
  readout2.position.set(0.57, 0.75, 0.33);
  group.add(readout2);

  // 3. Bright rounded buttons (4x3)
  const btnColors = [
    0x22d3ee, 0x22d3ee, 0x22d3ee, 0xff7a1a,
    0xa78bfa, 0xa78bfa, 0xa78bfa, 0xff7a1a,
    0xa78bfa, 0xa78bfa, 0xf472b6, 0xa3e635,
  ];
  const btnGeo = new RoundedBoxGeometry(0.32, 0.32, 0.14, 3, 0.06);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col;
      const mat = new THREE.MeshStandardMaterial({
        color: btnColors[idx],
        emissive: btnColors[idx],
        emissiveIntensity: 0.25,
        roughness: 0.25,
        metalness: 0.1,
      });
      const btn = new THREE.Mesh(btnGeo, mat);
      btn.position.set(-0.57 + col * 0.38, 0.22 - row * 0.44, 0.27);
      btn.userData.baseZ = 0.27;
      btn.name = `btn_${idx}`;
      btn.castShadow = true;
      group.add(btn);
    }
  }

  // 4. Orbiting gold coins (position animate loop mein set hoti hai)
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xffc928,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.18,
  });
  const coinCfg = [
    { radius: 1.7, speed: 0.7, phase: 0, y: 0.7 },
    { radius: 1.6, speed: 0.6, phase: 1.6, y: -0.8 },
    { radius: 1.8, speed: 0.8, phase: 3.1, y: 0.1 },
    { radius: 1.55, speed: 0.65, phase: 4.7, y: 1.1 },
  ];
  coinCfg.forEach((cfg, i) => {
    const coin = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.07, 32), coinMat);
    disc.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 12, 32), coinMat);
    const emboss = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 10, 28), coinMat);
    coin.add(disc, rim, emboss);
    coin.userData = cfg;
    coin.name = `float_item_${i}`;
    group.add(coin);
  });

  // 5. Floating plus (green)
  const plusMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 0.6,
    roughness: 0.25,
  });
  const plusGroup = new THREE.Group();
  plusGroup.add(
    new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.14), plusMat),
    new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), plusMat)
  );
  plusGroup.position.set(1.5, 0.4, 0.5);
  plusGroup.name = 'float_plus';
  group.add(plusGroup);

  // 6. Floating % symbol (pink)
  const pctMat = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
  const pct = new THREE.Group();
  const dotA = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), pctMat);
  dotA.position.set(-0.14, 0.14, 0);
  const dotB = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), pctMat);
  dotB.position.set(0.14, -0.14, 0);
  const slash = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), pctMat);
  slash.rotation.z = -0.78;
  pct.add(dotA, dotB, slash);
  pct.position.set(-1.5, 0.15, 0.55);
  pct.name = 'float_percent';
  group.add(pct);

  // 7. Growth arrow (lime)
  const arrowMat = new THREE.MeshStandardMaterial({
    color: 0xa3e635,
    emissive: 0x84cc16,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
  const arrow = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12), arrowMat);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 16), arrowMat);
  head.position.y = 0.36;
  arrow.add(shaft, head);
  arrow.rotation.z = -0.6;
  arrow.position.set(1.45, -0.95, 0.5);
  arrow.name = 'float_arrow';
  group.add(arrow);

  // 8. Two orbit rings
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.028, 12, 80),
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.9,
      roughness: 0.3,
    })
  );
  ring.rotation.set(1.15, 0.3, 0);
  ring.name = 'orbit_ring';
  group.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.022, 12, 80),
    new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    })
  );
  ring2.rotation.set(0.5, -0.8, 0);
  ring2.name = 'orbit_ring_2';
  group.add(ring2);

  // 9. Sparkles
  const sparkMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff3b0,
    emissiveIntensity: 1.2,
  });
  const sparkPos: [number, number, number][] = [
    [-1.2, 1.5, 0.4], [1.2, 1.4, 0.3], [-1.7, -1.0, 0.2],
    [1.75, 0.0, 0.2], [0.2, -1.8, 0.4], [-0.3, 1.9, 0.2],
  ];
  sparkPos.forEach((p, i) => {
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), sparkMat);
    s.position.set(...p);
    s.name = `spark_${i}`;
    group.add(s);
  });

  group.position.y = 0.25;
  group.scale.setScalar(0.88);
  group.rotation.set(-0.18, -0.35, 0.12);
  return group;
}

function buildCarGroup(): THREE.Group {
  const group = new THREE.Group();

  // 1. Sleek Coupe Silhouette (ExtrudeGeometry)
  const profile = new THREE.Shape();
  profile.moveTo(-1.85, 0.15);
  profile.lineTo(-1.85, 0.48);
  profile.quadraticCurveTo(-1.7, 0.72, -1.05, 0.78);
  profile.quadraticCurveTo(-0.55, 1.24, 0.18, 1.24);
  profile.quadraticCurveTo(0.82, 1.22, 1.18, 0.76);
  profile.quadraticCurveTo(1.78, 0.72, 1.88, 0.42);
  profile.lineTo(1.88, 0.15);
  profile.closePath();

  const chassisGeo = new THREE.ExtrudeGeometry(profile, {
    depth: 1.48,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.1,
    bevelSegments: 4,
  });
  chassisGeo.translate(0, 0, -0.74);

  const carPaint = new THREE.MeshPhysicalMaterial({
    color: 0x1e3a8a,
    metalness: 0.85,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });
  const body = new THREE.Mesh(chassisGeo, carPaint);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 2. Tinted Cabin Glass Canopy
  const cabinGeo = new THREE.BoxGeometry(1.42, 0.44, 1.22);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.08,
    clearcoat: 1.0,
  });
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0.05, 0.94, 0);
  group.add(cabin);

  // 3. 4 Wheels (Tire + Metallic Rim)
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.82, metalness: 0.1 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.9 });
  const wheelCoords: [number, number][] = [
    [-1.12, 0.8],
    [-1.12, -0.8],
    [1.14, 0.8],
    [1.14, -0.8],
  ];

  wheelCoords.forEach(([wx, wz]) => {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 28), tireMat);
    tire.rotation.x = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.26, 16), rimMat);
    rim.rotation.x = Math.PI / 2;
    wheel.add(tire, rim);
    wheel.position.set(wx, 0.26, wz);
    wheel.castShadow = true;
    group.add(wheel);
  });

  // 4. Glowing LED Headlights & Taillight Strip
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.4,
  });
  const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.34), headlightMat);
  hlLeft.position.set(1.88, 0.45, 0.46);
  const hlRight = hlLeft.clone();
  hlRight.position.z = -0.46;
  group.add(hlLeft, hlRight);

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0x22c55e,
    emissiveIntensity: 0.9,
  });
  const tailStrip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.24), tailMat);
  tailStrip.position.set(-1.88, 0.48, 0);
  group.add(tailStrip);

  // 5. Grounding Showroom Pedestal Ring
  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(2.45, 2.55, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0x11152c, roughness: 0.5, metalness: 0.4 })
  );
  stage.position.y = -0.14;
  stage.receiveShadow = true;
  group.add(stage);

  group.position.y = -0.35;
  group.rotation.y = -0.62;
  return group;
}

function buildHouseGroup(): THREE.Group {
  const group = new THREE.Group();

  // 1. Foundation Pad
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.18, 2.8),
    new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.75 })
  );
  pad.position.y = -0.85;
  pad.receiveShadow = true;
  group.add(pad);

  // 2. Main Stucco House Walls
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.45, 1.9),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 })
  );
  walls.position.set(-0.2, -0.05, 0);
  walls.castShadow = true;
  walls.receiveShadow = true;
  group.add(walls);

  // 3. Pitched Cobalt-Blue Roof
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.45, 0);
  roofShape.lineTo(0, 1.05);
  roofShape.lineTo(1.45, 0);
  roofShape.closePath();

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 2.2,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
  });
  roofGeo.translate(0, 0, -1.1);
  const roof = new THREE.Mesh(
    roofGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.35,
      clearcoat: 0.4,
    })
  );
  roof.position.set(-0.2, 0.65, 0);
  roof.castShadow = true;
  group.add(roof);

  // 4. Side Garage / Extension
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 1.05, 1.45),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
  );
  wing.position.set(1.15, -0.25, 0.1);
  wing.castShadow = true;
  group.add(wing);

  // 5. Front Door & Glowing Sky Windows
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.75, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.4 })
  );
  door.position.set(-0.45, -0.38, 0.96);
  group.add(door);

  const winMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.45,
    roughness: 0.15,
  });
  const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.08), winMat);
  win1.position.set(0.32, -0.1, 0.96);
  const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.08), winMat);
  win2.position.set(-0.2, 0.95, 0.98);
  group.add(win1, win2);

  // 6. Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.65, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 })
  );
  chimney.position.set(-0.9, 1.35, -0.45);
  group.add(chimney);

  group.rotation.set(0.12, -0.52, 0);
  return group;
}

function buildPlantGroup(): THREE.Group {
  const group = new THREE.Group();

  // 1. Ceramic Planter (LatheGeometry)
  const potPoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.58, 0),
    new THREE.Vector2(0.76, 0.92),
    new THREE.Vector2(0.82, 0.96),
    new THREE.Vector2(0.75, 1.04),
    new THREE.Vector2(0.62, 0.98),
  ];
  const potGeo = new THREE.LatheGeometry(potPoints, 32);
  const potMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.25,
  });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = -1.25;
  pot.castShadow = true;
  group.add(pot);

  // 2. Soil Disc
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.65, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 })
  );
  soil.position.y = -0.32;
  group.add(soil);

  // 3. Curved Emerald Stem (TubeGeometry)
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.32, 0),
    new THREE.Vector3(-0.08, 0.35, 0.05),
    new THREE.Vector3(0.06, 1.05, -0.04),
    new THREE.Vector3(0, 1.55, 0),
  ]);
  const stem = new THREE.Mesh(
    new THREE.TubeGeometry(stemCurve, 24, 0.065, 12, false),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.35,
      emissive: 0x047857,
      emissiveIntensity: 0.25,
    })
  );
  stem.castShadow = true;
  group.add(stem);

  // 4. Sculpted Leaves
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.45, 0.32, 0.85, 0.05);
  leafShape.quadraticCurveTo(0.42, -0.3, 0, 0);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });

  const leafMat = new THREE.MeshPhysicalMaterial({
    color: 0x34d399,
    emissive: 0x059669,
    emissiveIntensity: 0.3,
    roughness: 0.25,
    clearcoat: 0.6,
  });

  const leafConfigs: [number, number, number, number, number][] = [
    [0.02, 0.45, 0, 0.35, 0.2],
    [-0.04, 0.82, 0, -0.45, Math.PI + 0.15],
    [0.03, 1.22, 0.04, 0.28, -0.3],
    [0, 1.48, 0, 0.6, 2.1],
  ];
  leafConfigs.forEach(([lx, ly, lz, rz, ry]) => {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(lx, ly, lz);
    leaf.rotation.set(0.2, ry, rz);
    leaf.castShadow = true;
    group.add(leaf);
  });

  // 5. Stacked Metallic Gold Coins around planter
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.9,
    roughness: 0.18,
  });
  for (let i = 0; i < 4; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 28), coinMat);
    coin.position.set(0.95, -1.2 + i * 0.09, 0.45);
    coin.castShadow = true;
    group.add(coin);
  }

  const floatingCoin = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 28), coinMat);
  floatingCoin.rotation.x = Math.PI / 2;
  floatingCoin.position.set(-0.95, 0.9, 0.35);
  floatingCoin.name = 'float_coin';
  group.add(floatingCoin);

  return group;
}

export function ThreeScene({
  variant,
  className = 'w-full h-72 sm:h-80',
  accentValue = 0.5,
}: ThreeShowcaseProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const accentRef = useRef(accentValue);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    accentRef.current = accentValue;
  }, [accentValue]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping =
      variant === 'calculator' ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, variant === 'calculator' ? 0.5 : 0.4, variant === 'car' ? 5.6 : variant === 'calculator' ? 6.8 : 5.1);

    // 3-Point Warm/Cool Studio Lighting
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.7);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(
      variant === 'plant' ? 0x10b981 : variant === 'house' ? 0x38bdf8 : 0x818cf8,
      3.5,
      14
    );
    rimLight.position.set(-4, 2, -2.5);
    scene.add(rimLight);
    if (variant === 'calculator') {
      const pinkLight = new THREE.PointLight(0xff4d8d, 60, 14);
      pinkLight.position.set(3.5, -2, 3);
      scene.add(pinkLight);

      const cyanLight = new THREE.PointLight(0x22d3ee, 60, 14);
      cyanLight.position.set(-3.5, 2.5, 3);
      scene.add(cyanLight);

      scene.environmentIntensity = 0.45; // grey reflection kam
    }

    let modelGroup: THREE.Group;
    switch (variant) {
      case 'car':
        modelGroup = buildCarGroup();
        break;
      case 'house':
        modelGroup = buildHouseGroup();
        break;
      case 'plant':
        modelGroup = buildPlantGroup();
        break;
      case 'calculator':
      default:
        modelGroup = buildCalculatorGroup();
        break;
    }
    scene.add(modelGroup);

    const baseRotX = modelGroup.rotation.x;
    const baseRotY = modelGroup.rotation.y;

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    };
    container.addEventListener('pointermove', onPointerMove);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    let smoothedAccent = accentRef.current;

    function animate() {
      if (disposed) return;
      const delta = Math.min(0.05, clock.getDelta());
      const elapsed = clock.getElapsedTime();
      const targetAccent = Number.isFinite(accentRef.current)
        ? Math.min(1, Math.max(0, accentRef.current))
        : 0.5;
      smoothedAccent = THREE.MathUtils.damp(smoothedAccent, targetAccent, 5, delta);

      if (!prefersReducedMotion) {
        modelGroup.position.y +=
          (Math.sin(elapsed * 1.4) * 0.08 +
            (variant === 'calculator' ? 0.25 : 0) -
            (variant === 'car' ? 0.35 : 0) -
            modelGroup.position.y) *
          0.06;
        const accentAngleOffset = variant === 'car' ? (smoothedAccent - 0.5) * 0.65 : (smoothedAccent - 0.5) * 0.25;
        const targetY =
          baseRotY + pointerX * 0.28 + Math.sin(elapsed * 0.5) * 0.14 + accentAngleOffset;
        const targetX = baseRotX + pointerY * 0.14;
        modelGroup.rotation.y = THREE.MathUtils.damp(modelGroup.rotation.y, targetY, 4, delta);
        modelGroup.rotation.x = THREE.MathUtils.damp(modelGroup.rotation.x, targetX, 4, delta);

        if (variant === 'plant') {
          const targetScale = 0.88 + smoothedAccent * 0.24;
          const nextScale = THREE.MathUtils.damp(modelGroup.scale.x, targetScale, 5, delta);
          modelGroup.scale.setScalar(nextScale);
        }

        const ring = modelGroup.getObjectByName('orbit_ring');
        if (ring) {
          ring.rotation.z += delta * (0.4 + smoothedAccent * 0.85);
        }

        const floatCoin = modelGroup.getObjectByName('float_coin');
        if (floatCoin) {
          floatCoin.rotation.y += delta * (1.1 + smoothedAccent * 1.4);
          floatCoin.position.y = 0.75 + smoothedAccent * 0.3 + Math.sin(elapsed * 2) * 0.08;
        }

        for (let i = 0; i < 4; i++) {
          const item = modelGroup.getObjectByName(`float_item_${i}`);
          if (item) {
            item.rotation.y += delta * (0.7 + i * 0.15 + smoothedAccent * 0.8);
          }
        }
      }
      if (variant === 'calculator') {
        // LCD bars
        for (let i = 0; i < 5; i++) {
          const bar = modelGroup.getObjectByName(`lcd_bar_${i}`);
          if (bar) {
            const v = Math.sin(elapsed * 1.8 + i * 0.9) * 0.5 + 0.5;
            bar.scale.y = Math.min(1.2, 0.25 + v * 0.75 + smoothedAccent * 0.2);
          }
        }

        // Button wave
        for (let i = 0; i < 12; i++) {
          const btn = modelGroup.getObjectByName(`btn_${i}`) as THREE.Mesh | undefined;
          if (btn) {
            const pulse = Math.max(0, Math.sin(elapsed * 2.2 - i * 0.5));
            btn.position.z = btn.userData.baseZ + pulse * 0.06;
            (btn.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25 + pulse * 0.6;
          }
        }

        // Coins orbit
        for (let i = 0; i < 4; i++) {
          const coin = modelGroup.getObjectByName(`float_item_${i}`);
          if (coin) {
            const { radius, speed, phase, y } = coin.userData;
            const a = elapsed * (speed + smoothedAccent * 0.4) + phase;
            coin.position.set(
              Math.cos(a) * radius,
              y + Math.sin(a * 2) * 0.25,
              Math.sin(a) * radius * 0.6 + 0.3
            );
          }
        }

        // Second ring (ulta ghoomta hai)
        const ring2 = modelGroup.getObjectByName('orbit_ring_2');
        if (ring2) ring2.rotation.z -= delta * 0.5;

        // Percent, arrow, plus bobbing
        const pct = modelGroup.getObjectByName('float_percent');
        if (pct) {
          pct.position.y = 0.15 + Math.sin(elapsed * 1.6) * 0.12;
          pct.rotation.y = Math.sin(elapsed) * 0.5;
        }
        const arrow = modelGroup.getObjectByName('float_arrow');
        if (arrow) arrow.position.y = -0.95 + Math.sin(elapsed * 2 + 1) * 0.1;
        const plus = modelGroup.getObjectByName('float_plus');
        if (plus) {
          plus.rotation.z = 0.35 + Math.sin(elapsed * 1.2) * 0.25;
          plus.rotation.y += delta * 0.8;
        }

        // Sparkles twinkle
        for (let i = 0; i < 6; i++) {
          const s = modelGroup.getObjectByName(`spark_${i}`);
          if (s) {
            const sc = 0.6 + (Math.sin(elapsed * 3 + i * 1.7) * 0.5 + 0.5) * 1.0;
            s.scale.setScalar(sc);
            s.rotation.y += delta * 2;
          }
        }
      }
      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      envTexture.dispose();
      renderer.dispose();
    };
  }, [variant]);

  if (webglFailed) {
    return (
      <div
        className={`${className} rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900/80 border border-white/10 flex items-center justify-center p-6 text-center`}
      >
        <div className="text-sm font-semibold text-slate-300 capitalize">
          Interactive {variant} 3D Showcase
        </div>
      </div>
    );
  }

  return <div ref={mountRef} className={`${className} select-none cursor-grab active:cursor-grabbing`} />;
}
