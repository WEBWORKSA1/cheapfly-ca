# Brand image sources

`assets/img/` holds the SVG logo and favicon. Five PNG files are also used when present
(the page templates detect them automatically):

| File | Size | Used for |
|---|---|---|
| `og-image.png` | 1200×630 | Social share previews (Facebook, X, LinkedIn, iMessage) |
| `favicon-32.png` | 32×32 | Legacy browser favicon |
| `apple-touch-icon.png` | 180×180 | iPhone/iPad home-screen icon |
| `icon-192.png`, `icon-512.png` | 192/512 | Installable web-app icons |

## Option A: upload them (1 minute)
On GitHub open `assets/img/` → **Add file → Upload files**, drop the five PNGs, commit to `main`.

## Option B: let GitHub render them automatically
Create `.github/workflows/brand-images.yml` (GitHub → **Add file → Create new file**) and paste the
contents of `_branding/brand-images.yml`. On every change to `og.html` or the logo, the workflow
renders the PNGs from `og.html` / `icon.html` with headless Chrome and commits them. You can also run
it from the **Actions** tab → "Render brand images" → **Run workflow**.
