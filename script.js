/* ---------------------------------------------------------
   Techie side scroll nav
   Highlights the section currently in view (both the fixed
   side HUD and the top navbar links) and fills the glowing
   progress rail based on overall scroll position.
--------------------------------------------------------- */
function initScrollNav() {
  const sections = document.querySelectorAll("section[id]");
  const scrollNavEl = document.querySelector(".scroll-nav");
  const scrollNavItems = document.querySelectorAll(".scroll-nav-item");
  const topNavLinks = document.querySelectorAll(".nav-link");
  const progressEl = document.getElementById("scrollProgress");
  if (!sections.length) return;

  // Each section can opt into a light background via data-theme="light"
  // (see the About section). The side nav reads that and swaps its own
  // colors so it stays readable over both light and dark sections,
  // instead of a single hardcoded color that only works on dark ones.
  const setActive = (id) => {
    scrollNavItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.section === id);
    });
    topNavLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
    if (scrollNavEl) {
      const section = document.getElementById(id);
      const theme = (section && section.dataset.theme) || "dark";
      scrollNavEl.classList.toggle("on-light", theme === "light");
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  const updateProgress = () => {
    if (!progressEl) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    progressEl.style.height = `${pct}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  // Mark Home active by default before any scrolling/observer callback fires.
  setActive(sections[0].id);
}

document.addEventListener("DOMContentLoaded", initScrollNav);

/* ---------------------------------------------------------
   Hero 3D animation (Three.js)
   A mechanical/electrical "blueprint": two wireframe gears
   actually meshing (opposite rotation, speed ratio matches
   their tooth count, like a real gear train), a small ring of
   wired control nodes standing in for the electrical/sensing
   side of a mechatronic system, and a technical-drawing grid
   behind it all. Reacts gently to the mouse for parallax.
   Only runs on pages that have a #hero-3d canvas (Home).
--------------------------------------------------------- */
function initHero3D() {
  const canvas = document.getElementById("hero-3d");
  if (!canvas || typeof THREE === "undefined") return;

  const container = canvas.parentElement;
  let width = container.clientWidth;
  let height = container.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const BLUEPRINT_CYAN = 0x38bdf8;
  const BLUEPRINT_INDIGO = 0x818cf8;
  const BLUEPRINT_PINK = 0xe879f9;

  // ---- Blueprint grid backdrop, drawn onto a canvas texture ----
  function makeGridTexture() {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");

    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1;
    const step = size / 16;
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(size, i * step);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
    ctx.lineWidth = 1.5;
    const bigStep = size / 4;
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * bigStep, 0);
      ctx.lineTo(i * bigStep, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * bigStep);
      ctx.lineTo(size, i * bigStep);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(c);
  }

  const gridPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({
      map: makeGridTexture(),
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    })
  );
  gridPlane.position.z = -2.4;
  scene.add(gridPlane);

  // ---- Gear geometry: a real involute-ish gear outline (teeth as a
  // zig-zag between an outer and root radius) with a bore hole ----
  function createGearShape(teeth, outerRadius, innerRadius, toothDepth) {
    const shape = new THREE.Shape();
    const step = (Math.PI * 2) / (teeth * 2);
    for (let i = 0; i <= teeth * 2; i++) {
      const angle = i * step;
      const r = i % 2 === 0 ? outerRadius : outerRadius - toothDepth;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const bore = new THREE.Path();
    bore.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(bore);
    return shape;
  }

  function createGear(teeth, outerRadius, innerRadius, toothDepth, depth, color) {
    const shape = createGearShape(teeth, outerRadius, innerRadius, toothDepth);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: 12,
    });
    const mat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    return new THREE.Mesh(geo, mat);
  }

  const rig = new THREE.Group();
  scene.add(rig);

  const BIG_TEETH = 20;
  const SMALL_TEETH = 11;

  const bigGear = createGear(BIG_TEETH, 1.7, 0.55, 0.22, 0.3, BLUEPRINT_CYAN);
  bigGear.position.set(-0.85, 0, 0);
  rig.add(bigGear);

  const smallGear = createGear(SMALL_TEETH, 1.0, 0.32, 0.18, 0.3, BLUEPRINT_INDIGO);
  smallGear.position.set(1.55, 0, 0.05);
  rig.add(smallGear);

  // Shafts through each gear's bore, perpendicular to the gear faces
  function addShaft(x, len, color) {
    const geo = new THREE.CylinderGeometry(0.05, 0.05, len, 12);
    const mat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const shaft = new THREE.Mesh(geo, mat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(x, 0, 0);
    rig.add(shaft);
  }
  addShaft(-0.85, 1.1, BLUEPRINT_CYAN);
  addShaft(1.55, 0.9, BLUEPRINT_INDIGO);

  // ---- Electrical/control side: sensor nodes wired back to the rig ----
  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);

  const nodeCount = 6;
  const nodeRadius = 3;
  const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
  const nodeMat = new THREE.MeshBasicMaterial({
    color: BLUEPRINT_PINK,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
  });
  const wireMat = new THREE.LineBasicMaterial({
    color: BLUEPRINT_PINK,
    transparent: true,
    opacity: 0.3,
  });

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const x = Math.cos(angle) * nodeRadius;
    const y = Math.sin(angle) * nodeRadius * 0.6;
    const z = Math.sin(angle * 2) * 0.6;

    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(x, y, z);
    nodeGroup.add(node);

    const wireGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(x, y, z),
    ]);
    nodeGroup.add(new THREE.Line(wireGeo, wireMat));
  }

  // ---- Reference/dimension points scattered around the assembly ----
  const particleCount = 90;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 3.6 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.4;
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const particlesMat = new THREE.PointsMaterial({
    color: 0xa5b4fc,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // Gentle mouse parallax
  let targetX = 0;
  let targetY = 0;
  window.addEventListener("mousemove", (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.35;
  });

  function animate() {
    requestAnimationFrame(animate);

    // The two gears actually mesh: opposite rotation direction, and the
    // small gear spins faster by the inverse of the big/small tooth
    // ratio — the same relationship a real gear train has.
    bigGear.rotation.z += 0.006;
    smallGear.rotation.z -= 0.006 * (BIG_TEETH / SMALL_TEETH);

    nodeGroup.rotation.z -= 0.0015;
    particles.rotation.y += 0.0008;

    rig.rotation.y += (targetX - rig.rotation.y) * 0.02;
    rig.rotation.x += (targetY - rig.rotation.x) * 0.02;
    nodeGroup.rotation.y = rig.rotation.y;
    nodeGroup.rotation.x = rig.rotation.x;
    gridPlane.rotation.y = rig.rotation.y * 0.3;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

document.addEventListener("DOMContentLoaded", initHero3D);
