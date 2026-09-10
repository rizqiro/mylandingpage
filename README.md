# My Landing Page

A single-page personal portfolio built with plain HTML, CSS, and a bit of
JavaScript (plus Three.js for the animated hero graphic). No build step —
just open `index.html` in a browser, or serve the folder as a static site.

## Files

- `index.html` — all page content, in one scrolling document.
- `styles.css` — all styling.
- `script.js` — the hero 3D graphic, plus the side scroll-nav logic
  (scroll-spy + progress rail) described below.

## Hero graphic: an interactive gear blueprint

The hero visual is a real engineering-style technical drawing — a front
view and a sectioned side view of a gear, with dimension lines, a
hatched cross-section, and a title block — drawn as plain 2D SVG (no
WebGL/Three.js, so it works everywhere). It's genuinely parametric: the
three sliders below it (**Teeth**, **Diameter**, **Bore ⌀**) redraw the
whole thing live, including the numbers in the title block, via
`renderBlueprint()`'s `render()` function in `script.js`. The sheet also
tilts gently toward the cursor for a "drafting table" feel.

To restyle it, look in `script.js`:
- Colors, dimension text, and the title block's wording are all inside
  the SVG template string in `render()`.
- Slider ranges live on the `<input type="range">` elements in
  `index.html` (`#ctrlTeeth`, `#ctrlDiameter`, `#ctrlBore`).
- A small circular photo badge (`.blueprint-photo`, top-right of the
  drawing) shows `your-photo.jpg` if present, and hides itself
  gracefully if not.

## Sections

Scrolling down `index.html`, top to bottom:

- **Home** (`id="home"`) — name, tagline, short bio, resume/CTA buttons,
  social links, and the animated hero graphic.
- **About** (`id="about"`) — bio blurb and the four stat cards.
- **Credentials** (`id="credentials"`) — certifications and credentials,
  see below.
- **Projects** (`id="projects"`) — project cards.
- **Contact** (`id="contact"`) — email/phone/location cards and social
  links.

The top navbar links (`#home`, `#about`, …) jump to each section, and
`html { scroll-behavior: smooth }` makes that a smooth scroll rather than
a jump cut.

## The side scroll nav

A fixed vertical HUD on the right edge of the screen (`.scroll-nav` in
`index.html`, styled in `styles.css`, driven by `initScrollNav()` in
`script.js`) tracks which section is in view as the visitor scrolls:

- A glowing progress rail (`.scroll-nav-progress`) fills top-to-bottom
  based on overall scroll position.
- Each section gets a numbered dot (`01`–`05`) with a monospace label
  that lights up — with a blinking terminal cursor — when its section is
  active or hovered.
- The same active state is mirrored on the top navbar links.
- The nav's colors are theme-aware, not fixed: a section can opt into a
  light background with `data-theme="light"` (see the About section),
  and `initScrollNav()` toggles `.on-light` on `.scroll-nav` as that
  section comes into view, swapping in dark-on-light colors so the nav
  stays readable instead of disappearing over a white background.

It's built with an `IntersectionObserver`, so no scroll-jank polling. It
hides below ~900px width to keep mobile layouts uncluttered (the top nav
links do the same, matching the original design).

## Adding a certification or credential

The **Credentials** section is built for this. Each certification is one
`<article class="credential-card">...</article>` block inside
`<div class="credentials-grid">`.

To add a new one:

1. Open `index.html` and find `<!-- CREDENTIALS / CERTIFICATIONS -->`.
2. Copy an existing `<article class="credential-card">...</article>` block.
3. Update:
   - `credential-title` – the certification's name.
   - `credential-issuer` – who issued it (e.g. "Amazon Web Services (AWS)").
   - `credential-meta` – issue date and credential ID.
   - The `href` on `credential-link` – the public verification URL your
     issuer gave you (LinkedIn, Credly, Coursera, AWS, Google, Microsoft
     Learn, etc. all provide one). Employers can click this to confirm the
     credential is real.
4. Paste the new block anywhere inside the grid, before the dashed
   "Add your next certification" placeholder card at the end.

If you add a 6th section this way, add a matching item to `.scroll-nav-list`
and `.nav-links` in `index.html` so the new section shows up in both navs.

## Replacing the placeholder content

- Swap `your-photo.jpg` (referenced in the Hero section) with a real photo,
  or leave it out — the image quietly hides itself if it fails to load.
- Update the name, tagline, bio, stats, and project cards to match your own
  work.
- Update the social links (`social-btn` anchors) to point to your real
  GitHub, LinkedIn, Instagram, and email — and update the placeholder
  email/phone/location in the Contact section.
- Add a real `resume.pdf` file next to `index.html` so the "Download
  Resume" button works, or remove the button if you don't want one.
