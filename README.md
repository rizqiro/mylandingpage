# My Landing Page

A single-page personal portfolio built with plain HTML, CSS, and a small
amount of JavaScript. No build step, no framework, no dependencies.

## Running it locally

Because icons are loaded from `icons/sprite.svg` via `<use>`, the page
needs to be served over http(s) rather than opened directly as a
`file://` URL (some browsers block cross-file SVG `<use>` under
`file://` for security reasons). Any real hosting (GitHub Pages,
Netlify, Vercel, etc.) already serves over https, so this only matters
for local preview. From this folder, run one of:

```
python3 -m http.server 8000
# or
npx serve .
```

then open `http://localhost:8000`.

## Files & folders

- `index.html` — all page content, in one scrolling document.
- `styles.css` — all styling.
- `script.js` — side scroll-nav, the About photo carousel, and the
  credential pop-up modal.
- `icons/sprite.svg` — every SVG icon used on the site, defined once as
  a `<symbol>` and referenced from `index.html` via `<use>` instead of
  being pasted inline everywhere.
- `images/` — background art and photos:
  - `images/hero-bg.svg` — the faint blueprint-grid texture behind the hero.
  - `images/profile-photo.png` — the hero portrait.
  - `images/about/` — the About section's photo carousel slides.
  - `images/credentials/` — certificate images shown in the credential pop-up.

## Icons: one sprite, referenced everywhere

Every icon (nav arrow, social logos, stat-card icons, timeline icons,
carousel/modal controls, etc.) is a `<symbol>` inside
`icons/sprite.svg`, used like this in `index.html`:

```html
<svg class="icon"><use href="#icon-arrow-up-right"></use></svg>
```

On page load, `script.js` (`loadIconSprite()`) fetches `icons/sprite.svg`
once and inlines its markup (hidden) at the top of `<body>` — that's
what makes the short `#icon-name` reference above resolve; browsers
don't reliably support `<use>` pointing straight at a separate SVG file.
`.icon` / `.icon-sm` / `.icon-lg` (in `styles.css`) control size; the
icon's color still comes from CSS `color` via `currentColor`, exactly as
before — nothing about how icons *look* changed, only where their SVG
code lives.

**To add a new icon:** open `icons/sprite.svg`, paste a new
`<symbol id="icon-your-name" viewBox="0 0 24 24">...</symbol>`, and
reference it the same way.

## Hero: photo + blueprint background

The hero is a two-column intro: your name/tagline/bio on the left, a
portrait photo on the right (`.portrait` in `index.html`), with a soft
indigo/cyan glow (`.portrait-glow`) peeking from behind its top-right and
bottom-left corners, and the "Focused on" card floating over its
bottom-right corner — all `position: absolute`, so they stay put
regardless of the photo.

**To add your photo:** replace `images/profile-photo.png` (any image
works; `<img>`'s `onerror` hides it gracefully if the file is missing,
showing the navy gradient box instead).

The whole hero section also has a faint blueprint-grid texture behind it
(`images/hero-bg.svg`, set via `.hero-section::before` in `styles.css`) —
a large ghost gear and grid lines at ~16% opacity, dark-gradiented on top
so it reads as background grain rather than a competing visual. To use a
different image instead, just point that `background: url(...)` at a
new file under `images/`.

## About: photo carousel

The About section's right-hand panel (`#aboutCarousel` in `index.html`)
is a small photo carousel — prev/next arrow buttons, dot navigation, and
a 6-second auto-advance that pauses on hover. It ships with 3 slides,
each with a real `<img>` layered over a dashed placeholder (camera icon
+ the expected file path).

**To add your photos:** drop files at the exact paths already referenced —

- `images/about/slide-1.jpg`
- `images/about/slide-2.jpg`
- `images/about/slide-3.jpg`

— and they'll appear automatically; until a file exists at that path,
the image fails to load silently and the placeholder shows instead, so
the carousel is fully usable either way.

**To add a 4th (or more) slide:** in `index.html`, copy one
`.carousel-slide` block inside `#aboutCarouselTrack` and add a matching
`.carousel-dot` button inside `.carousel-dots` (with the next
`data-index`). `script.js` reads however many of each exist, so no JS
changes are needed.

## Sections

Scrolling down `index.html`, top to bottom:

- **Home** (`id="home"`) — name, tagline, short bio, resume/CTA buttons,
  social links, your photo and the "Focused on" card.
- **About** (`id="about"`) — bio blurb, the four stat cards, and the
  photo carousel.
- **Career & Education** (`id="career"`) — a work-history timeline
  (newest first) and an education card.
- **Credentials** (`id="credentials"`) — certifications and credentials,
  see below.
- **Projects** (`id="projects"`) — project cards.
- **Contact** (`id="contact"`) — email/phone/location cards and social
  links.

The top navbar links (`#home`, `#about`, …) jump to each section, and
`html { scroll-behavior: smooth }` makes that a smooth scroll rather than
a jump cut.

### Alternating black/white theme

Background color alternates section by section: Home (black) → About
(white) → Career & Education (black) → Credentials (white) → Projects
through Contact and the Footer (black, all the way to the bottom — no
more alternating after Projects).

A white section is just `background: #fafafa; color: #18181b;` on the
full-width `<section>` (see `.about-section` / `.credentials-section` in
`styles.css`), rounded on whichever corners face a dark neighbor —
About only touches a dark section above (Hero), so it rounds just its
top corners; Credentials has a dark section on both sides (Career,
Projects), so it rounds all four. Add `data-theme="light"` to a
section's `<section>` tag when you do this — `initScrollNav()` in
`script.js` reads that attribute to swap the fixed side nav to
dark-on-light colors while that section is in view.

## Career & Education

`.timeline` in the **Career & Education** section lists your work
history newest-first, each entry a `.timeline-item` with a period, role,
company, a short scope-of-work list, and a row of achievement chips.

**To add or edit a role:** copy one `<li class="timeline-item">...</li>`
block and edit the text in place, then paste it at the top of `<ol
class="timeline">` if it's your most recent role.

The `.education-card` alongside it is a placeholder — it currently reads
"[Add your university name]" / "[Add years attended]". Edit those lines
directly with your real school, degree, and years. Copy the whole
`.education-card` block to list a second degree or program.

## The side scroll nav

A fixed vertical HUD on the right edge of the screen (`.scroll-nav` in
`index.html`, styled in `styles.css`, driven by `initScrollNav()` in
`script.js`) tracks which section is in view as the visitor scrolls:

- A glowing progress rail (`.scroll-nav-progress`) fills top-to-bottom
  based on overall scroll position.
- Each section gets a numbered dot (`01`–`06`) with a monospace label
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
   - `data-cert-image` on the "View Credential" button – a path under
     `images/credentials/`.
4. Paste the new block anywhere inside the grid.

### Clicking "View Credential" opens a pop-up, not a new page

Each "View Credential" button carries `data-cert-image="images/credentials/your-file.jpg"`
and `data-cert-title="..."`. Clicking it opens a pop-up modal
(`#certModal`, styled in `styles.css`, wired up by `initCertModal()` in
`script.js`) showing that image full-size — nothing navigates away from
the site.

**To add your certificate images:** drop a scanned copy or screenshot at
the exact path already referenced by that card's `data-cert-image`
(e.g. `images/credentials/lean-six-sigma-green-belt.jpg`). Until that
file exists, the pop-up shows a dashed placeholder (certificate icon +
the expected file path) instead of a broken image, so every card works
before you've added real files.

The modal closes on the × button, clicking the dark backdrop, or
pressing Escape.

## Replacing the placeholder content

- Update the name, tagline, bio, stats, timeline, education, and project
  cards to match your own work.
- Update the social links (`social-btn` anchors) to point to your real
  GitHub, LinkedIn, Instagram, and email — and update the placeholder
  email/phone/location in the Contact section.
- Add a real `resume.pdf` file next to `index.html` so the "Download
  Resume" button works, or remove the button if you don't want one.
