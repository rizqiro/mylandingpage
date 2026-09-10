/* ---------------------------------------------------------
   Techie side scroll nav
   Highlights the section currently in view (both the fixed
   side HUD and the top navbar links) and fills the glowing
   progress rail based on overall scroll position.
--------------------------------------------------------- */
function initScrollNav() {
  const sections = document.querySelectorAll("section[id]");
  const scrollNavItems = document.querySelectorAll(".scroll-nav-item");
  const topNavLinks = document.querySelectorAll(".nav-link");
  const progressEl = document.getElementById("scrollProgress");
  if (!sections.length) return;

  const setActive = (id) => {
    scrollNavItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.section === id);
    });
    topNavLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
    });
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
   A rotating wireframe icosahedron with a glowing core and
   a scattering of particles, sitting in the hero photo slot.
   Reacts gently to the mouse for a subtle parallax feel.
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
  camera.position.z = 6.5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const group = new THREE.Group();
  scene.add(group);

  // Outer wireframe shape
  const wireGeo = new THREE.IcosahedronGeometry(2, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireMesh);

  // Glowing inner core
  const coreGeo = new THREE.IcosahedronGeometry(1.05, 2);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xe879f9,
    transparent: true,
    opacity: 0.18,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // A second, slightly offset wireframe shell for depth
  const shellGeo = new THREE.IcosahedronGeometry(2.6, 0);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  group.add(shell);

  // Floating particles around the shape
  const particleCount = 160;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 3.2 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particlesGeo = new THREE.BufferGeometry();
  particlesGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  const particlesMat = new THREE.PointsMaterial({
    color: 0xa5b4fc,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
  });
  const particles = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particles);

  // Gentle mouse parallax
  let targetX = 0;
  let targetY = 0;
  window.addEventListener("mousemove", (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
    targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  function animate() {
    requestAnimationFrame(animate);

    group.rotation.y += 0.0035;
    group.rotation.x += 0.0012;
    shell.rotation.y -= 0.0018;
    particles.rotation.y += 0.0006;

    group.rotation.y += (targetX - group.rotation.y) * 0.02;
    group.rotation.x += (targetY - group.rotation.x) * 0.02;

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
