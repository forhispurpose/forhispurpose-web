# For His Purpose — Website

Static frontend for [forhispurpose.co](https://forhispurpose.co), deployed for free on GitHub Pages.

## Structure

- `index.html`, `about.html`, `bible-study.html`, etc. — all site pages
- `css/style.css` — single shared stylesheet (palette, layout, components, dark mode)
- `js/main.js` — nav, dark-mode toggle, reveal animations, form submission logic
- `js/config.js` — **edit this** after deploying the backend, to point forms at your live API
- `images/` — site images
- `CNAME` — tells GitHub Pages this site should serve on the custom domain `forhispurpose.co`

## Local preview

No build step — just serve the folder:

```
python3 -m http.server 8811
```

Then open http://localhost:8811

## Deployment

See `DEPLOYMENT_GUIDE.md` in the project root for the full step-by-step (GitHub Pages, Truehost DNS, backend on Hugging Face Spaces, and email setup).
