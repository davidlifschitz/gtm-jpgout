# JpgOut

Drop WebP (or HEIC on Safari). Get JPEG. Files never leave the browser.

Ask this answers: [Sites do not display webp, so I end up converting either with an app or browser extension](https://news.ycombinator.com/item?id=49326973)

- No account
- No upload
- Cap: 8 files, 8 MB each
- Uses the browser decoder, then canvas JPEG
- HEIC only where the OS already decodes it (Safari)
- Canvas re-encode strips EXIF on purpose

## Local

Open `index.html` in a browser, or:

```bash
python3 -m http.server 4173
```

## GTM

Reply to people who already said they convert WebP by hand before a site will take it. Copy is in the page footer.
