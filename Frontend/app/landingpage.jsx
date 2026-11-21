"use client";
// Requires:  npm install three
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import GlassNavbar from "./components/navbar";

// Edit the copy and claims below to match your real products.
const THEMES = {
  summer: {
    label: "Summer shade",
    bg: "linear-gradient(160deg,#0d0b09 0%,#1c150e 100%)",
    text: "#f6efe6",
    muted: "rgba(246,239,230,0.68)",
    accent: "#f2a93b",
    panel: "rgba(255,255,255,0.06)",
    fabric: "#8fb3cc", // washed blue cap
    under: "#5d849d",
    headline: "Keep the sun off your face.",
    sub: "Baseball caps made for hot days. The curved brim shades your eyes and cheeks, and the light cotton stays cool and blocks UV.",
    points: ["UPF 50+ cotton twill", "Curved brim shades face and eyes", "Breathable, adjustable back strap"],
  },
  winter: {
    label: "Winter warm",
    bg: "linear-gradient(160deg,#070c15 0%,#111c2f 100%)",
    text: "#eef3fb",
    muted: "rgba(238,243,251,0.68)",
    accent: "#ff9a5c",
    panel: "rgba(255,255,255,0.07)",
    fabric: "#b9502e", // burnt orange cap
    under: "#7d3319",
    headline: "Stay warm when it drops below zero.",
    sub: "Baseball caps with a fleece lining that holds in heat and stops the wind, so you can stay out longer in the cold.",
    points: ["Fleece-lined inside", "Wind-proof shell", "Soft fabric that keeps its shape"],
  },
};

/* ---------- procedural textures ---------- */
function makeWeaveTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const v = 90 + Math.random() * 90;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
  }
  g.strokeStyle = "rgba(255,255,255,0.18)";
  for (let i = -256; i < 512; i += 4) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 256, 256);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 10);
  return t;
}

function makeBrimTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(0,0,0,0.3)";
  g.lineWidth = 2;
  g.setLineDash([7, 5]);
  [0.7, 0.77, 0.84, 0.91].forEach((v) => {
    const y = (1 - v) * 512;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y);
    g.stroke();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeLogoTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d");
  g.font = "700 120px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#f4ece0";
  g.fillText("CapShop", 256, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* ---------- geometry ---------- */
// Six-panel crown: a hemisphere with seams pressed in at every 60 degrees.
function makeCrownGeometry() {
  const geo = new THREE.SphereGeometry(1, 240, 64, 0, Math.PI * 2, 0, Math.PI / 2);
  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const t = Math.atan2(v.x, v.z) / (Math.PI / 3);
    const d = Math.abs(t - Math.round(t)) * (Math.PI / 3);
    let s = Math.exp(-Math.pow(d / 0.04, 2));
    s *= Math.min(1, (1 - v.y) * 14); // fade seams out near the button
    v.multiplyScalar(1 - 0.02 * s);
    p.setXYZ(i, v.x, v.y, v.z);
    const shade = 1 - 0.35 * s;
    colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = shade;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// Curved brim: starts on the crown edge, pitches down and bends down at the sides.
function makeBrimGeometry() {
  const NU = 48, NV = 14, RBX = 0.9, DC = 0.68;
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= NV; j++) {
    const v = j / NV;
    for (let i = 0; i <= NU; i++) {
      const u = (i / NU) * 2 - 1;
      const x = u * RBX;
      const zr = 1.12 * Math.sqrt(Math.max(1 - x * x, 0));
      const zf = 1.12 + DC * Math.sqrt(Math.max(1 - Math.pow(Math.abs(u), 2.4), 0));
      const z = zr + (zf - zr) * v;
      const y = -0.03 - 0.1 * u * u * (0.3 + v) - 0.06 * v;
      pos.push(x, y, z);
      uv.push((u + 1) / 2, v);
    }
  }
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/* ---------- 3D cap ---------- */
function CapScene({ fabric, under, accent }) {
  const mountRef = useRef(null);
  const targetRef = useRef({ fabric, under });
  targetRef.current = { fabric, under };

  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return; // no WebGL: the glow stays as a fallback
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    camera.position.set(0, 1.5, 6.8);
    camera.lookAt(0, 0.1, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x33384a, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9db8ff, 1.4);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    // colors that ease toward the selected theme
    const cur = { fabric: new THREE.Color(fabric), under: new THREE.Color(under) };
    const tg = { fabric: new THREE.Color(fabric), under: new THREE.Color(under) };
    let lastF = fabric, lastU = under;

    const weave = makeWeaveTexture();
    const fabricMat = new THREE.MeshStandardMaterial({
      color: cur.fabric, roughness: 0.92, bumpMap: weave, bumpScale: 1.2,
      vertexColors: true, side: THREE.DoubleSide,
    });
    const brimMat = new THREE.MeshStandardMaterial({
      color: cur.fabric, roughness: 0.9, map: makeBrimTexture(), bumpMap: weave, bumpScale: 1.2,
    });
    const underMat = new THREE.MeshStandardMaterial({ color: cur.under, roughness: 0.95, side: THREE.BackSide });
    const solidMat = new THREE.MeshStandardMaterial({ color: cur.fabric, roughness: 0.9, side: THREE.DoubleSide });
    const darkMat = new THREE.MeshStandardMaterial({ color: cur.fabric, roughness: 0.85 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xc4c8d0, metalness: 0.9, roughness: 0.35 });
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x0b0b0b });
    const logoMat = new THREE.MeshBasicMaterial({ map: makeLogoTexture(), transparent: true, depthWrite: false, toneMapped: false });

    const model = new THREE.Group();
    model.position.z = -0.35; // centers the cap so the brim doesn't swing wide

    const crown = new THREE.Mesh(makeCrownGeometry(), fabricMat);
    crown.scale.set(1, 0.82, 1.12);
    model.add(crown);

    const button = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), solidMat);
    button.position.y = 0.82;
    button.scale.y = 0.6;
    model.add(button);

    const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.028, 12, 120), darkMat);
    band.rotation.x = Math.PI / 2;
    band.scale.set(1, 1.12, 1);
    model.add(band);

    const brimGeo = makeBrimGeometry();
    model.add(new THREE.Mesh(brimGeo, brimMat));
    const brimUnder = new THREE.Mesh(brimGeo, underMat);
    brimUnder.position.y = -0.016;
    model.add(brimUnder);

    // adjustable back strap + buckle
    const strap = new THREE.Mesh(
      new THREE.CylinderGeometry(1.015, 1.015, 0.1, 48, 1, true, Math.PI - 0.55, 1.1), solidMat);
    strap.scale.z = 1.12;
    strap.position.y = 0.05;
    model.add(strap);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.03), metalMat);
    buckle.position.set(0, 0.05, -1.15);
    model.add(buckle);

    // surface helper for the ellipsoid crown (eyelets, logo)
    const onCrown = (theta, phi) => {
      const p = new THREE.Vector3(Math.sin(phi) * Math.sin(theta), Math.cos(phi) * 0.82, Math.sin(phi) * Math.cos(theta) * 1.12);
      const n = new THREE.Vector3(p.x, p.y / 0.6724, p.z / 1.2544).normalize();
      return { p, n };
    };
    [1, -1].forEach((s) => {
      const { p, n } = onCrown(s * Math.PI / 2, 0.85);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.012, 10, 24), darkMat);
      ring.position.copy(p).addScaledVector(n, 0.008);
      ring.lookAt(p.clone().add(n));
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), holeMat);
      hole.position.copy(p).addScaledVector(n, 0.003);
      hole.lookAt(p.clone().add(n));
      model.add(ring, hole);
    });
    const { p: lp, n: ln } = onCrown(0, 0.9);
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.23), logoMat);
    logo.position.copy(lp).addScaledVector(ln, 0.012);
    logo.lookAt(lp.clone().add(ln));
    model.add(logo);

    const spin = new THREE.Group();
    spin.add(model);
    const tilt = new THREE.Group();
    tilt.rotation.x = 0.12;
    tilt.add(spin);
    scene.add(tilt);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.2),
      new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.5;
    scene.add(shadow);

    // size + drag to rotate
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let yaw = 0.7, dragging = false, lastX = 0;
    const onDown = (e) => { dragging = true; lastX = e.clientX; };
    const onMove = (e) => { if (dragging) { yaw += (e.clientX - lastX) * 0.012; lastX = e.clientX; } };
    const onUp = () => { dragging = false; };
    mount.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();
    let raf;
    const tick = () => {
      const dt = clock.getDelta();
      if (!dragging && !reduce) yaw += dt * 0.55;
      spin.rotation.y = yaw;
      tilt.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.04;

      const t = targetRef.current;
      if (t.fabric !== lastF) { tg.fabric.set(t.fabric); lastF = t.fabric; }
      if (t.under !== lastU) { tg.under.set(t.under); lastU = t.under; }
      cur.fabric.lerp(tg.fabric, 0.07);
      cur.under.lerp(tg.under, 0.07);
      fabricMat.color.copy(cur.fabric);
      brimMat.color.copy(cur.fabric);
      underMat.color.copy(cur.under);
      solidMat.color.copy(cur.fabric).multiplyScalar(0.9);
      darkMat.color.copy(cur.fabric).multiplyScalar(0.6);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          [].concat(o.material).forEach((m) => {
            ["map", "bumpMap"].forEach((k) => m[k] && m[k].dispose());
            m.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <GlassNavbar/>
      <div
        className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700"
        style={{ background: accent, opacity: 0.22 }}
      />
      <div
        ref={mountRef}
        aria-hidden="true"
        className="relative h-[420px] w-full cursor-grab touch-pan-y select-none active:cursor-grabbing md:h-[560px]"
      />
      <p className="relative mt-2 text-center text-sm opacity-50">Drag to rotate</p>
    </div>
  );
}

/* ---------- page ---------- */
export default function CapShopLanding() {
  const [season, setSeason] = useState("summer");
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const t = THEMES[season];

  return (
    <div
      className="min-h-screen font-sans antialiased transition-colors duration-700"
      style={{ background: t.bg, color: t.text }}
    >
      <style>{`
        @keyframes capRise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:min-h-screen md:grid-cols-2 md:px-10">
        <div>
          <div
            role="tablist"
            aria-label="Choose a season"
            className="mb-8 inline-flex rounded-full p-1"
            style={{ background: t.panel, animation: "capRise .8s both" }}
          >
            {Object.entries(THEMES).map(([key, v]) => (
              <button
                key={key}
                role="tab"
                aria-selected={season === key}
                onClick={() => setSeason(key)}
                className="rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: season === key ? t.accent : "transparent",
                  color: season === key ? "#1a1208" : t.muted,
                  outlineColor: t.accent,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <h1
            className="mb-5 font-serif text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            style={{ animation: "capRise .9s .1s both" }}
          >
            {t.headline}
          </h1>
          <p className="mb-8 max-w-md text-lg" style={{ color: t.muted, animation: "capRise .9s .2s both" }}>
            {t.sub}
          </p>

          <ul className="mb-10 space-y-2" style={{ animation: "capRise .9s .3s both" }}>
            {t.points.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ background: t.accent }} />
                {p}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4" style={{ animation: "capRise .9s .4s both" }}>
            <a
              href="#"
              className="rounded-md px-7 py-3 font-semibold text-[#1a1208] transition hover:-translate-y-0.5"
              style={{ background: t.accent }}
            >
              Shop Now
            </a>
            <a
              href="#why"
              className="rounded-md border px-7 py-3 font-semibold transition hover:-translate-y-0.5"
              style={{ borderColor: t.muted }}
            >
              See how they work
            </a>
          </div>
        </div>

        <CapScene fabric={t.fabric} under={t.under} accent={t.accent} />
      </section>

      {/* Why it works */}
      <section id="why" className="mx-auto max-w-6xl px-6 py-24 md:px-10">
        <h2 className="mb-12 max-w-xl font-serif text-4xl font-semibold md:text-5xl">
          Two caps, each made for one kind of weather
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              key: "summer",
              title: "Shade caps",
              text: "Made for hot, bright days. The curved brim and UV-blocking cotton keep sun off your face and eyes, and the adjustable strap keeps the fit comfortable.",
            },
            {
              key: "winter",
              title: "Warm caps",
              text: "Made for freezing days. A fleece lining traps heat and the wind-proof shell stops the cold from getting through.",
            },
          ].map((c) => (
            <div
              key={c.key}
              className="rounded-xl p-8 transition-transform duration-300 hover:-translate-y-1"
              style={{ background: t.panel }}
            >
              <h3 className="mb-3 font-serif text-2xl font-semibold" style={{ color: t.accent }}>
                {c.title}
              </h3>
              <p style={{ color: t.muted }}>{c.text}</p>
              <button
                onClick={() => {
                  setSeason(c.key);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-6 text-sm font-semibold underline underline-offset-4"
              >
                Preview in 3D
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section id="join" className="mx-auto max-w-6xl px-6 pb-28 pt-8 text-center md:px-10">
        <h2 className="mb-3 font-serif text-4xl font-semibold md:text-5xl">Be first to wear one</h2>
        <p className="mx-auto mb-10 max-w-lg" style={{ color: t.muted }}>
          Leave your email and we'll tell you the day CapShop opens.
        </p>
        {joined ? (
          <p className="text-xl font-semibold" style={{ color: t.accent }}>You're on the list.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="min-w-[260px] rounded-md border bg-transparent px-4 py-3 placeholder:opacity-50 focus-visible:outline focus-visible:outline-2"
              style={{ borderColor: t.muted, outlineColor: t.accent }}
            />
            <button
              onClick={() => email.includes("@") && setJoined(true)}
              className="rounded-md px-7 py-3 font-semibold text-[#1a1208] transition hover:-translate-y-0.5"
              style={{ background: t.accent }}
            >
              Notify me
            </button>
          </div>
        )}
      </section>
    </div>
  
  );
}