# Brand image sources

The PNG files in `assets/img/` (favicon, app icons and the social share image) are rendered
from these HTML sources by `.github/workflows/brand-images.yml` using headless Chrome on
GitHub's runner. Edit `og.html` or `assets/img/logo-mark.svg`, push, and the workflow
re-renders and commits the PNGs. You can also run it manually from the Actions tab
("Render brand images" → "Run workflow").
