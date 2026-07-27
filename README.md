# Mahir Labib — Portfolio

A single-page portfolio. No build step, no frameworks — plain HTML/CSS/JS.
Design language inspired by wibify.de: lime signal green + cream + near-black,
Bricolage Grotesque headings, Instrument Serif italic accents, blur-and-rise
reveal animations, frosted sticky nav, marquees and a custom cursor.

## Run it locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173. (Or just double-click `index.html`.)

## Make it yours — edit `index.html`

Everything below is placeholder text. Search for these and replace:

| What | Where |
| --- | --- |
| Your photo | `assets/portrait.svg` → replace with your photo (keep ~4:5 ratio) |
| Education | `#education` section — years, school names |
| Work | `#work` section — role, company, dates |
| Behance link | `https://www.behance.net/yourusername` (appears twice) |
| Design images | `assets/design-1.svg` … `design-5.svg` → your work (4:5 ratio) |
| Project links | `https://github.com/yourusername/...` on each `.project-card` |
| Skills | the two `.marquee-track` lists (each item appears twice — keep the duplicate set, it makes the loop seamless) |
| Testimonials | `#testimonials` — quotes, names, `assets/avatar-*.svg` |
| Music | `#music` cards |
| Hobby photos | `assets/hobby-setup.svg`, `hobby-tournament.svg`, `hobby-photo.svg` (16:11 ratio) |
| Socials | footer links (GitHub / Behance / LinkedIn / X) |

The contact button already points to mahirlabib389@gmail.com.

## Deploy

Push to GitHub and enable GitHub Pages (Settings → Pages → deploy from branch),
or drag the folder into Netlify/Vercel. It's all static files.
