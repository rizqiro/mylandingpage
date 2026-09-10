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
   Interactive gear blueprint (plain 2D SVG, no WebGL)
   A parametric technical drawing — a front view and a
   sectioned side view of a gear, dimension lines, hatching,
   and a title block — redrawn live as the visitor drags the
   Teeth / Diameter / Bore sliders. The sheet also tilts
   gently toward the cursor, like a drawing on a drafting
   table. Only runs on pages with a #blueprintSvg (Home).
--------------------------------------------------------- */
function initBlueprint() {
  const svg = document.getElementById("blueprintSvg");
  const sheet = document.getElementById("blueprint");
  const teethInput = document.getElementById("ctrlTeeth");
  const diameterInput = document.getElementById("ctrlDiameter");
  const boreInput = document.getElementById("ctrlBore");
  if (!svg || !sheet || !teethInput || !diameterInput || !boreInput) return;

  const teethValueEl = document.getElementById("ctrlTeethValue");
  const diameterValueEl = document.getElementById("ctrlDiameterValue");
  const boreValueEl = document.getElementById("ctrlBoreValue");

  // Outline of a gear (teeth as a zig-zag between an outer and root
  // radius), as an SVG path, centered at (cx, cy).
  function gearOutlinePath(cx, cy, teeth, outerR, toothDepth) {
    const pts = [];
    const step = (Math.PI * 2) / (teeth * 2);
    for (let i = 0; i <= teeth * 2; i++) {
      const r = i % 2 === 0 ? outerR : outerR - toothDepth;
      const a = i * step - Math.PI / 2;
      pts.push(
        `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`
      );
    }
    return `M${pts.join(" L")} Z`;
  }

  // A zig-zag "tooth profile" line across a fixed width, for the
  // sectioned side view.
  function toothProfilePoints(x0, x1, yBase, toothHeight, teeth) {
    const n = Math.max(3, Math.min(teeth, 10));
    const step = (x1 - x0) / (n * 2);
    const pts = [];
    for (let i = 0; i <= n * 2; i++) {
      const x = x0 + i * step;
      const y = i % 2 === 0 ? yBase : yBase - toothHeight;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts;
  }

  function render() {
    const teeth = parseInt(teethInput.value, 10);
    const diameter = parseInt(diameterInput.value, 10);
    const bore = parseInt(boreInput.value, 10);

    if (teethValueEl) teethValueEl.textContent = teeth;
    if (diameterValueEl) diameterValueEl.textContent = `${diameter}mm`;
    if (boreValueEl) boreValueEl.textContent = `${bore}mm`;

    // --- Front view (right side of the sheet): a full gear face ---
    const cx = 290;
    const cy = 185;
    const outerR = 55 + ((diameter - 60) / 80) * 40;
    const toothDepth = outerR * 0.22;
    const boreR = 10 + ((bore - 10) / 30) * 22;
    const gearPath = gearOutlinePath(cx, cy, teeth, outerR, toothDepth);

    // --- Side / sectional view (left side): tooth profile + shaft ---
    const sx0 = 45;
    const sx1 = 175;
    const yBase = 150;
    const toothHeightSide = 22 + ((diameter - 60) / 80) * 16;
    const shaftHalfWidth = 18 + boreR * 0.55;
    const shaftTop = yBase + 6;
    const shaftBottom = 300;
    const midX = (sx0 + sx1) / 2;

    const topPts = toothProfilePoints(sx0, sx1, yBase, toothHeightSide, teeth);
    const blockPath =
      `M${topPts.join(" L")} ` +
      `L${sx1.toFixed(1)},${shaftTop} ` +
      `L${(midX + shaftHalfWidth).toFixed(1)},${shaftTop} ` +
      `L${(midX + shaftHalfWidth).toFixed(1)},${shaftBottom} ` +
      `L${(midX - shaftHalfWidth).toFixed(1)},${shaftBottom} ` +
      `L${(midX - shaftHalfWidth).toFixed(1)},${shaftTop} ` +
      `L${sx0.toFixed(1)},${shaftTop} Z`;

    svg.innerHTML = `
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(255,255,255,0.45)" stroke-width="1" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="400" height="500" fill="#123a5e" />
      <rect x="14" y="14" width="372" height="472" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" />

      <circle cx="55" cy="435" r="95" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" />
      <circle cx="55" cy="435" r="62" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" />

      <g stroke="rgba(255,255,255,0.5)" stroke-width="1.2" fill="none">
        <rect x="350" y="26" width="10" height="10" />
        <path d="M326 34 l6 6 14 -16" />
      </g>

      <path d="${blockPath}" fill="url(#hatch)" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" stroke-linejoin="round" />

      <g stroke="rgba(255,255,255,0.55)" stroke-width="1">
        <line x1="${sx0}" y1="330" x2="${sx1}" y2="330" />
        <line x1="${sx0}" y1="324" x2="${sx0}" y2="336" />
        <line x1="${sx1}" y1="324" x2="${sx1}" y2="336" />
      </g>
      <text x="${midX.toFixed(1)}" y="346" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" fill="rgba(255,255,255,0.8)">Z = ${teeth} TEETH</text>

      <path d="${gearPath}" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" stroke-linejoin="round" />
      <circle cx="${cx}" cy="${cy}" r="${boreR.toFixed(1)}" fill="#123a5e" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" />
      <rect x="${(cx - 4).toFixed(1)}" y="${(cy - boreR - 8).toFixed(1)}" width="8" height="12" fill="#123a5e" stroke="rgba(255,255,255,0.9)" stroke-width="1.2" />

      <g stroke="rgba(255,255,255,0.55)" stroke-width="1">
        <line x1="${(cx - outerR).toFixed(1)}" y1="${(cy + outerR + 20).toFixed(1)}" x2="${(cx + outerR).toFixed(1)}" y2="${(cy + outerR + 20).toFixed(1)}" />
        <line x1="${(cx - outerR).toFixed(1)}" y1="${(cy + outerR + 14).toFixed(1)}" x2="${(cx - outerR).toFixed(1)}" y2="${(cy + outerR + 26).toFixed(1)}" />
        <line x1="${(cx + outerR).toFixed(1)}" y1="${(cy + outerR + 14).toFixed(1)}" x2="${(cx + outerR).toFixed(1)}" y2="${(cy + outerR + 26).toFixed(1)}" />
      </g>
      <text x="${cx.toFixed(1)}" y="${(cy + outerR + 40).toFixed(1)}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" fill="rgba(255,255,255,0.8)">&#8960; ${diameter}mm</text>
      <text x="${cx.toFixed(1)}" y="${(cy + outerR + 56).toFixed(1)}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" fill="rgba(255,255,255,0.6)">&#8960; ${bore}mm bore</text>

      <g font-family="'JetBrains Mono', monospace" fill="rgba(255,255,255,0.85)">
        <rect x="230" y="404" width="156" height="66" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1" />
        <line x1="230" y1="426" x2="386" y2="426" stroke="rgba(255,255,255,0.35)" stroke-width="1" />
        <line x1="230" y1="448" x2="386" y2="448" stroke="rgba(255,255,255,0.35)" stroke-width="1" />
        <text x="238" y="418" font-size="9" letter-spacing="1" fill="rgba(255,255,255,0.6)">TECHNICAL DRAWING</text>
        <text x="238" y="440" font-size="11" font-weight="600">GEAR &#183; Z${teeth} / &#8960;${diameter}</text>
        <text x="238" y="462" font-size="9" letter-spacing="1" fill="rgba(255,255,255,0.6)">MECHATRONICS PORTFOLIO</text>
      </g>
    `;
  }

  [teethInput, diameterInput, boreInput].forEach((input) => {
    input.addEventListener("input", render);
  });
  render();

  // Gentle tilt toward the cursor, like a drawing on a drafting table.
  sheet.addEventListener("mousemove", (e) => {
    const rect = sheet.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    sheet.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
  });
  sheet.addEventListener("mouseleave", () => {
    sheet.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
  });
}

document.addEventListener("DOMContentLoaded", initBlueprint);
