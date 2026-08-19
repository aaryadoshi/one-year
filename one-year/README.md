# ♡ one year

A password-protected anniversary site. Letter, calendar, four jars.

**Live:** `https://<your-username>.github.io/<repo-name>/`

---

## 1 · Put it on GitHub (5 minutes, no terminal needed)

1. Go to **github.com/new**
2. Repository name: `one-year` (or anything). Set it to **Public** — GitHub Pages needs public on free accounts. *(Don't worry: the site is password-gated and the password itself is never stored in the code, only its SHA-256 hash.)*
3. Click **Create repository**
4. On the new empty repo page click **uploading an existing file**
5. Drag in **everything from this folder** — `index.html`, the `css/`, `js/`, `photos/`, `tools/` folders and `.nojekyll`
6. Click **Commit changes**
7. Go to **Settings → Pages** (left sidebar)
8. Under *Build and deployment* → *Source* pick **Deploy from a branch**, branch **`main`**, folder **`/ (root)`**, hit **Save**
9. Wait ~60 seconds, refresh. Your link appears at the top of that page. Send it to him.

> Changed something later? Open the file on GitHub → pencil icon → edit → **Commit changes**. The live site updates in about a minute.

---

## 2 · Add your photos

1. Open the **`photos/`** folder in your repo → **Add file → Upload files**
2. Drop your images in. Name them `1.jpg`, `2.jpg`, `3.jpg`… (easiest)
3. Open **`js/config.js`** → edit the `photos` list so the filenames match:

```js
photos: [
  { src: "photos/1.jpg", caption: "the first one" },
  { src: "photos/2.jpg", caption: "you, laughing at nothing" },
],
```

Any photo that isn't uploaded yet just shows a friendly placeholder — nothing breaks. Add as many as you like; the collage lays itself out.

**Tip:** keep images under ~1 MB each so the page loads fast. `.jpg`, `.png`, `.webp`, `.gif` all work.

---

## 3 · Set the password

The password is **not** in the code. Only a SHA-256 hash of it is — so he can't find it by viewing the source.

1. Open **`tools/hash.html`** in any browser (double-click it on your computer)
2. Type the password you want → it prints a hash
3. Copy that hash into `js/config.js` as `passwordHash`
4. **Set `passwordPlain: ""`** (empty) — otherwise the plain one takes priority

```js
passwordHash: "paste-the-long-hash-here",
passwordPlain: "",
passwordHint: "hint shown after 3 wrong tries",
```

The check is case-insensitive and ignores extra spaces, so he can't fail on a technicality.

---

## 4 · Everything else you can change

All of it lives in **`js/config.js`**. That's the only file you need to touch.

| What | Where in `config.js` |
|---|---|
| His name, your name, start date | top of the file |
| The letter | `letter` |
| Songs (title, artist, YouTube link, your note) | `songs` |
| Photos + captions | `photos` |
| Memory game emojis | `memoryCards` |
| Reasons for the `why` command | `reasons` |
| The secret terminal command | `secretCommand` / `secretResponse` |

**Adding a song:** grab the bit after `v=` in a YouTube URL.
`youtube.com/watch?v=`**`dQw4w9WgXcQ`** → `youtubeId: "dQw4w9WgXcQ"`

```js
{
  title: "Song Name",
  artist: "Artist",
  youtubeId: "dQw4w9WgXcQ",
  note: "why this one is ours",
},
```

**Using photos in the memory game** instead of emoji:

```js
memoryCards: [
  { img: "photos/1.jpg" },
  { img: "photos/2.jpg" },
  // …8 total
],
```

---

## What's inside

```
index.html          the page
css/style.css       all the styling
js/config.js        ← YOUR CONTENT LIVES HERE
js/app.js           the logic
photos/             your pictures go here
tools/hash.html     password hash generator
.nojekyll           tells GitHub to serve the files as-is
```

**Jar 4 is `love.exe`** — a little fake terminal he can type into. `help`, `whoami`, `why`, `days`, `ls`, `stats`, and one secret command he has to find (it's `sudo hug` by default — change it in config).

---

## Under the hood

No frameworks, no build step, no dependencies. One HTML file, one stylesheet, two scripts.

- **SHA-256 password gate** — hashed client-side via the Web Crypto API, with a pure-JS fallback so it also works opened straight off your desktop
- **Canvas particle system** for the starfield and drifting hearts, capped at 2× DPR
- **CSS 3D transforms** for the envelope flap and card flips (`preserve-3d`, `backface-visibility`)
- **IntersectionObserver** scroll reveals
- **localStorage** for the memory-game high score
- `prefers-reduced-motion` respected throughout

♡
