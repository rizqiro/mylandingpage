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

/* ---------------------------------------------------------
   Icon sprite loader
   Every <svg><use href="#icon-name"></use></svg> in index.html points
   at a *local* fragment, not the sprite file directly -- browsers are
   unreliable about resolving <use> against a separate external SVG
   file. So instead this fetches icons/sprite.svg once, and inlines its
   markup (hidden) as the first thing in <body>; after that, every
   #icon-name fragment resolves within the page itself. This keeps all
   the icon markup living in one file (icons/sprite.svg) without
   repeating it throughout index.html.
--------------------------------------------------------- */
async function loadIconSprite() {
  try {
    const res = await fetch("icons/sprite.svg");
    if (!res.ok) return;
    const markup = await res.text();
    const holder = document.createElement("div");
    holder.hidden = true;
    holder.innerHTML = markup;
    document.body.insertBefore(holder, document.body.firstChild);
  } catch (err) {
    // Offline/blocked fetch (e.g. opened as a file:// page) -- icons
    // just won't render; everything else on the page still works.
  }
}

/* ---------------------------------------------------------
   About photo carousel
   Slides .carousel-track sideways by 100% per step using a CSS
   transform. Works with any number of .carousel-slide/.carousel-dot
   pairs -- it just reads however many are in the DOM.
--------------------------------------------------------- */
function initAboutCarousel() {
  const carousel = document.getElementById("aboutCarousel");
  if (!carousel) return;

  const track = document.getElementById("aboutCarouselTrack");
  const slides = carousel.querySelectorAll(".carousel-slide");
  const dots = carousel.querySelectorAll(".carousel-dot");
  const prevBtn = carousel.querySelector(".carousel-prev");
  const nextBtn = carousel.querySelector(".carousel-next");
  if (!track || !slides.length) return;

  let index = 0;

  const goTo = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  };

  prevBtn && prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn && nextBtn.addEventListener("click", () => goTo(index + 1));
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => goTo(dotIndex));
  });

  // Auto-advance every 6s, pausing while the visitor's mouse is over it.
  let timer = setInterval(() => goTo(index + 1), 6000);
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", () => {
    timer = setInterval(() => goTo(index + 1), 6000);
  });

  goTo(0);
}

/* ---------------------------------------------------------
   Credential modal
   Every "View Credential" button in the CREDENTIALS section carries
   data-cert-image (a path under images/credentials/) and data-cert-title.
   Clicking it opens the modal and points it at that image instead of
   navigating away. If the image file doesn't exist yet at that path,
   the img's error event swaps in the dashed placeholder so the pop-up
   is never blank.
--------------------------------------------------------- */
function initCertModal() {
  const modal = document.getElementById("certModal");
  if (!modal) return;

  const imageEl = document.getElementById("certModalImage");
  const placeholderEl = document.getElementById("certModalPlaceholder");
  const hintEl = document.getElementById("certModalHint");
  const titleEl = document.getElementById("certModalTitle");
  const triggers = document.querySelectorAll(".credential-link[data-cert-image]");
  let lastFocused = null;

  const openModal = (imagePath, title) => {
    lastFocused = document.activeElement;
    titleEl.textContent = title || "";
    hintEl.textContent = imagePath || "";

    // Reset to "loading" state each time, since a previous open may have
    // hidden the <img> after a failed load.
    imageEl.style.display = "none";
    placeholderEl.style.display = "flex";
    imageEl.alt = title || "Certificate";

    if (imagePath) {
      imageEl.onload = () => {
        imageEl.style.display = "block";
        placeholderEl.style.display = "none";
      };
      imageEl.onerror = () => {
        imageEl.style.display = "none";
        placeholderEl.style.display = "flex";
      };
      imageEl.src = imagePath;
    } else {
      imageEl.removeAttribute("src");
    }

    modal.hidden = false;
    // Let the browser paint with `hidden` removed first so the
    // opacity/transform transition in styles.css actually runs.
    requestAnimationFrame(() => modal.classList.add("open"));
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => {
      modal.hidden = true;
    }, 200);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger.dataset.certImage, trigger.dataset.certTitle);
    });
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadIconSprite();
  initScrollNav();
  initAboutCarousel();
  initCertModal();
});
