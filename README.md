# My Landing Page

A single-page personal portfolio built with plain HTML, CSS, and a bit of
JavaScript (plus Three.js for the animated hero graphic). No build step —
just open `index.html` in a browser, or serve the folder as a static site.

## Editing your info

Everything lives in `index.html`. The sections, top to bottom, are:

- **Navbar** – logo initials and nav links.
- **Hero** (`id="home"`) – your name, tagline, short bio, resume/CTA buttons,
  social links, and the animated photo panel (`your-photo.jpg`).
- **About** (`id="about"`) – bio blurb and the four stat cards.
- **Credentials** (`id="credentials"`) – certifications and credentials, see
  below.
- **Projects** (`id="projects"`) – project cards.
- **Contact** (`id="contact"`) – closing call-to-action.
- **Footer** – copyright line and logo.

## Adding a certification or credential

The **Credentials** section on the page is built for this. Each certification
is one `<article class="credential-card">...</article>` block inside
`<div class="credentials-grid">`.

To add a new one:

1. Open `index.html` and find `<!-- CREDENTIALS / CERTIFICATIONS -->`.
2. Copy an existing `<article class="credential-card">...</article>` block.
3. Update:
   - `credential-title` – the certification's name.
   - `credential-issuer` – who issued it (e.g. "Amazon Web Services (AWS)").
   - `credential-meta` – issue date and credential ID.
   - The `href` on `credential-link` – the public verification URL your
     issuer gave you (LinkedIn certifications, Credly, Coursera, AWS,
     Google, Microsoft Learn, etc. all provide one). Employers can click
     this to confirm the credential is real.
4. Paste the new block anywhere inside the grid, before the dashed
   "Add your next certification" placeholder card at the end.

Cards automatically reflow into a responsive grid (3 columns on desktop,
1 column on mobile), so you can add as many as you like.

## Replacing the placeholder content

- Swap `your-photo.jpg` (referenced in the Hero section) with a real photo,
  or leave it out — the image quietly hides itself if it fails to load.
- Update the name, tagline, bio, stats, and project cards to match your own
  work.
- Update the social links (`social-btn` anchors) to point to your real
  GitHub, LinkedIn, Instagram, and email.
