# Credential / certificate images

Drop scanned or photographed certificates here. Each "View Credential"
button in `index.html`'s Credentials section has a
`data-cert-image="images/credentials/<filename>"` attribute pointing at
the file it expects — match that filename and it'll show up in the
pop-up modal automatically:

- `cad-2d-3d-modelling.jpg`
- `lean-six-sigma-green-belt.jpg`
- `lean-six-sigma-black-belt.jpg`
- `unit-head-promotion.jpg`
- `section-chief-promotion.jpg`
- `rnd-internship.jpg`
- `glass-manufacturing-training.jpg`
- `flutter-bootcamp.jpg`
- `fullstack-bootcamp.jpg`

Until a file exists at one of these paths, that credential's pop-up
shows a dashed placeholder (certificate icon + the expected path)
instead of a broken image.
