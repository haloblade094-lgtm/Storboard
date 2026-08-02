# Storboard

**Storboard** is a self-hosted storage monitoring dashboard that doesn't look like a typical enterprise interface.

Point it at your drives, choose a theme, and Storboard automatically renames and styles your storage to match—from a clean OLED-black dashboard to a Hogwarts-inspired vault or a galaxy far, far away.

Theme switching is completely client-side with **no page reload or server restart**, and your preferred theme is remembered in your browser.

---
AI Disclaimer: Claude Code was used in the making of this.
---

## ✨ Features

* Self-hosted storage dashboard
* Beautiful, customizable themes
* Automatic drive naming based on the selected theme
* Live storage usage updates every 3 seconds
* Zero frontend build process
* Lightweight Flask backend
* Docker and Docker Compose support
* Easy to extend with your own themes

---

## 🎨 Available Themes

| Theme                 | Description                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Dark / OLED**       | True black minimalist interface with generic drive names ("Drive 1", "Drive 2"...).      |
| **Light**             | Clean white and gray appearance with simple drive naming.                                |
| **Greek Mythology**   | Gold accents and a starfield background with Olympian-inspired drive names.              |
| **Norse Mythology**   | Icy blue styling with falling snow and drive names from the Æsir and Vanir.              |
| **Marvel**            | Comic-inspired red and blue theme with halftone effects and Avengers-themed drive names. |
| **DC**                | Navy and gold styling with searchlight effects and Justice League-inspired names.        |
| **The Simpsons**      | Bright yellow interface with drifting clouds and Springfield-themed drive names.         |
| **Star Wars**         | Black and gold interface with a starfield background and iconic ships and characters.    |
| **Harry Potter**      | Parchment styling with candlelight effects and Hogwarts-inspired drive names.            |
| **Lord of the Rings** | Earthy greens and golds with Fellowship-themed drive names.                              |

Additional themes can be added entirely within `static/themes.js`—no backend changes required.

---

## 🏗 Architecture

### Backend

* Python
* Flask
* psutil
* Gunicorn

The backend exposes a single JSON endpoint:

```text
/api/disks
```

It provides theme-agnostic information including:

* Total capacity
* Used space
* Free space
* Filesystem type
* Mount path
* Sequential drive index

### Frontend

The frontend is built with plain:

* HTML
* CSS
* JavaScript

There is **no build process**.

`static/themes.js` contains every theme's:

* Color palette
* Fonts
* Text
* Icons
* Background effects
* Drive naming pool

`static/app.js` applies the active theme, assigns drive names based on the selected theme, and refreshes storage statistics every **3 seconds**.

---

## 📦 Running Storboard

### Docker Compose (Recommended)

Pull the pre-built image straight from GHCR—no build step required:

```yaml
services:
  storboard:
    image: ghcr.io/scopeddlol/storboard:latest
    container_name: storboard
    ports:
      - "1338:1337"
    volumes:
      # Mount each drive you want tracked as its own read-only volume.
      # Every mount shows up as its own card in the dashboard.
      - /mnt/2TB-1:/drive1:ro
      - /mnt/2TB-2:/drive2:ro
      - /mnt/3TB:/drive3:ro
      - /mnt/D:/drive4:ro
      - /mnt/E:/drive5:ro
    restart: unless-stopped
```

```bash
docker compose up -d
```

Then open:

```text
http://localhost:1338
```

> **Prefer full host visibility instead?** Mount the whole host filesystem read-only at `/host` in place of the individual drive volumes above, and Storboard will auto-detect every physical drive and partition while filtering out virtual filesystems (`proc`, `sysfs`, `tmpfs`, `overlay`, `devtmpfs`, `squashfs`, etc.).

---

### Docker

```bash
docker pull ghcr.io/scopeddlol/storboard:latest

docker run -d \
  --name storboard \
  -p 1338:1337 \
  -v /mnt/2TB-1:/drive1:ro \
  -v /mnt/2TB-2:/drive2:ro \
  -v /mnt/3TB:/drive3:ro \
  -v /mnt/D:/drive4:ro \
  -v /mnt/E:/drive5:ro \
  ghcr.io/scopeddlol/storboard:latest
```

---

### Building From Source

```bash
docker build -t storboard .

docker run -d \
  --name storboard \
  -p 1337:1337 \
  -v /:/host:ro \
  storboard
```

---

### Local Development

```bash
pip install -r requirements.txt

PORT=1337 python app.py
```

Then open:

```text
http://localhost:1337
```

---

## ⚙ Configuration

| Environment Variable | Default | Description      |
| -------------------- | ------- | ---------------- |
| `PORT`               | `1337`  | HTTP server port |

---

## 🎭 Creating Your Own Theme

Adding a new theme requires **no backend changes**.

Simply edit:

```text
static/themes.js
```

Create a new entry in the `THEMES` object that defines:

* Colors
* Fonts
* Header and footer text
* Background effect
* Icons
* Drive naming rules

Available background effects include:

* `none`
* `stars`
* `snow`
* `clouds`
* `halftone`
* `spotlight`
* `candles`

For drive names, either:

* Set `genericNaming: true` for standard names like "Drive 1", or
* Provide a `names` array containing:

```js
[name, subtitle, icon]
```

Finally, add your theme's ID to `THEME_ORDER`, and it will automatically appear in the theme selector.

---

## 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.
