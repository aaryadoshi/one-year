# put your photos in this folder ♡

1. **Add file → Upload files** on GitHub, drag your pictures in here
2. Name them simply: `1.jpg`, `2.jpg`, `3.jpg`…
3. Then open `js/config.js` and list them:

```js
photos: [
  { src: "photos/1.jpg", caption: "the first one" },
  { src: "photos/2.jpg", caption: "you, laughing at nothing" },
],
```

Photos that aren't uploaded yet show a friendly placeholder — nothing breaks.

Keep each image under ~1 MB so the page loads fast.
`.jpg` `.png` `.webp` `.gif` all work.
