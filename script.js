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
