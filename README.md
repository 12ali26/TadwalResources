# Tadwal Resources — website

Marketing website for **Tadwal Resources**, a multi-category distribution and logistics
company operating across coastal and southern Kenya (LPG / Taifa Gas, Daima Milk dairy,
Pepsi beverages on the South Coast, and Ocean 53 industrial coatings + painting contracting).

Plain **static HTML / CSS / JS** — no framework, no build server, no dependencies.
Host it anywhere that serves files: Netlify, Cloudflare Pages, GitHub Pages, or any web host.

---

## Project layout

```
.
├── index.html, about.html, taifa-gas.html, …   ← generated pages (committed, served as-is)
├── 404.html                                    ← generated not-found page
├── assets/
│   ├── css/styles.css                          ← all styling + design tokens
│   ├── js/main.js                              ← nav, forms, WhatsApp links, scroll reveal
│   └── img/                                    ← logo + favicon (SVG)
├── src/
│   ├── layout.html                             ← shared shell: <head>, header/nav, footer
│   └── pages/*.html                            ← per-page <main> content + metadata
├── build.js                                    ← assembles src/ into the root .html files
├── design-system/tadwal-resources/MASTER.md    ← palette / type / component reference
├── netlify.toml, robots.txt, sitemap.xml
```

## Editing content

- **A single page's text/sections:** edit the matching file in `src/pages/`, then run `node build.js`.
- **The nav, footer, or `<head>`:** edit `src/layout.html` (footer/head) or the `NAV` array in
  `build.js` (menu items), then run `node build.js`.
- The root `*.html` files are build output. Don't hand-edit them — your change would be
  overwritten on the next build. (They are committed so the site works even without Node.)

```bash
node build.js        # regenerate every page (Node 14+, no install needed)
```

## Local preview

Any static server works, for example:

```bash
python3 -m http.server 8000      # then open http://localhost:8000
# or:  npx serve .
```

Open pages via `http://localhost:8000/…` rather than `file://` so the WhatsApp links and
form scripts behave exactly as in production.

---

## Configuration — do this before going live

### 1. Phone / WhatsApp number and form endpoint

Edit the `CONFIG` block at the top of [`assets/js/main.js`](assets/js/main.js):

```js
var CONFIG = {
  whatsappNumber: "254700000000",                       // international format, digits only
  whatsappMessage: "Hello Tadwal Resources, I would like to enquire about ",
  formEndpoint: "https://formspree.io/f/REPLACE_WITH_FORM_ID"
};
```

- **WhatsApp:** replace `254700000000` with the real number (country code + number, no `+`).
  Every `data-whatsapp` link and the floating button update automatically.
- **Forms:** while `formEndpoint` still contains `REPLACE_WITH_FORM_ID`, the contact and
  Ocean 53 enquiry forms run in **demo mode** — they validate and show a success message but
  send nothing. To receive submissions, create a form at <https://formspree.io> (or any
  service that accepts a `POST` of `FormData` and returns JSON) and paste its endpoint here.

### 2. Placeholder phone numbers and email addresses in the HTML

Search the `src/` folder for `+254700000000` and `@tadwalresources.co.ke` and replace them
with real contact details, then run `node build.js`. Update the `tel:` link in
`src/layout.html` too.

### 3. Domain

Update the domain in `robots.txt` and `sitemap.xml` once the final domain is known.

### 4. Images

The division panels and the Ocean 53 gallery currently use SVG placeholders. To use real
photos, drop optimised images (WebP/JPEG, sized ≤ 1600px wide) into `assets/img/` and swap
the placeholder `<div class="gallery__img">…</div>` / `<div class="panel panel--art">…</div>`
blocks for `<img src="assets/img/your-photo.webp" alt="…" loading="lazy" width="…" height="…">`.

---

## Deploying

### Netlify
1. Push this repo to GitHub/GitLab.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command: *(leave blank)*. Publish directory: `.` (`netlify.toml` already sets this.)
4. Optional: enable **Netlify Forms** instead of Formspree — add `netlify` and
   `netlify-honeypot="company_website"` attributes to each `<form>` in `src/pages/`, rebuild,
   and Netlify will capture submissions with no endpoint needed.

### Cloudflare Pages / GitHub Pages
- **Cloudflare Pages:** connect the repo, framework preset *None*, build command blank,
  output directory `/`.
- **GitHub Pages:** Settings → Pages → deploy from branch, `/ (root)`. Note: GitHub Pages
  won't apply `netlify.toml`, so the custom 404 still works (`404.html`) but the header
  rules don't.

## Design reference

Colours, typography, spacing and component styles are documented in
[`design-system/tadwal-resources/MASTER.md`](design-system/tadwal-resources/MASTER.md).
Core palette: deep Indian-Ocean teal-blue `#0A3D52`, sun-amber CTA `#F2A030`, warm sand
`#F6F1E8`. Fonts: Space Grotesk (headings) + Inter (body), loaded from Google Fonts.

## Trademarks

Taifa Gas, Daima, Pepsi and Ocean 53 are trademarks of their respective owners and are
referenced here only to describe the products Tadwal Resources distributes.
