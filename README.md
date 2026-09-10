# My Landing Page

A personal portfolio site built with plain HTML, CSS, and a bit of
JavaScript (plus Three.js for the animated hero graphic). No build step,
no framework — just open `index.html` in a browser, or serve the folder
as a static site.

## Pages

This is a real multi-page site — each nav item is its own HTML file, all
sharing one stylesheet (`styles.css`):

- `index.html` — **Home**: name, tagline, short bio, resume/CTA buttons,
  social links, and the animated 3D hero graphic.
- `about.html` — **About**: bio blurb and the four stat cards.
- `credentials.html` — **Credentials**: certifications and credentials,
  see below.
- `projects.html` — **Projects**: project cards.
- `contact.html` — **Contact**: email/phone/location and social links.

`styles.css` holds all shared styling, and `script.js` holds the animated
hero graphic (only loaded on `index.html`, since only that page has the
`#hero-3d` canvas).

## Adding a certification or credential

The **Credentials** page (`credentials.html`) is built for this. Each
certification is one `<article class="credential-card">...</article>`
block inside `<div class="credentials-grid">`.

To add a new one:

1. Open `credentials.html` and find `<!-- CREDENTIALS / CERTIFICATIONS -->`.
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

Cards automatically reflow into a responsive grid (3 columns on desktop,
1 column on mobile), so you can add as many as you like.

## Replacing the placeholder content

- Swap `your-photo.jpg` (referenced in `index.html`) with a real photo, or
  leave it out — the image quietly hides itself if it fails to load.
- Update the name, tagline, bio, stats, and project cards to match your
  own work.
- Update the social links (`social-btn` anchors, repeated in every page's
  navbar/footer area) to point to your real GitHub, LinkedIn, Instagram,
  and email — and update the placeholder email/phone/location in
  `contact.html`.
- Add a real `resume.pdf` file next to `index.html` so the "Download
  Resume" button works, or remove the button if you don't want one.

## Adding another page

1. Copy an existing page (e.g. `about.html`) as a starting point.
2. Keep the `<link rel="stylesheet" href="styles.css">` tag so it picks
   up the shared design.
3. Add a nav link to it in the `<nav class="nav-links">` block of
   **every** page (including the new one, marked `active`).
