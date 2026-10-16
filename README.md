<div align="center">

# 🌾 শীতের সকাল | A Winter Morning in Rural Bangladesh (1990s)

**A cinematic, immersive 2D hand-drawn animated panorama depicting childhood in rural Bengal**

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-brightgreen?style=for-the-badge&logo=github)](https://mahbub440.github.io/rural-bangladesh-winter-morning/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-blue?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

<p align="center">
  <em>An artistic tribute to 1990s rural Bangladesh — chilly morning mist rising from the river, schoolchildren walking wrapped in woolen shawls and sweaters toward their tin-roof primary school, and village elders huddled around an open winter wood fire.</em>
</p>

[**View Live Demo**](https://mahbub440.github.io/rural-bangladesh-winter-morning/) • [**Report Bug**](https://github.com/mahbub440/rural-bangladesh-winter-morning/issues) • [**Request Feature**](https://github.com/mahbub440/rural-bangladesh-winter-morning/issues)

</div>

---

## 📖 Overview

**শীতের সকাল (A Winter Morning)** is a full-viewport, borderless 2D animated landscape built entirely from scratch with **Vanilla JavaScript (ES6+)**, the **HTML5 Canvas 2D API**, and the **Web Audio API**.

The project does not rely on heavy external graphics, sprite sheets, or game engines. Instead, **every blade of grass, morning mist ribbon, river ripple, character stride, and sound wave is synthesized procedurally in real-time** at 60 frames per second.

The composition captures a quintessential morning in 1990s rural Bangladesh around 7:00 AM:
- **Schoolchildren Journey**: A group of village students in authentic school uniforms, colorful sweaters, and mufflers walking down a reddish-brown earthen road carrying satchels and slate-boxes.
- **Village Fire (*আগুন পোহানো*)**: Adult villagers huddled in a circle near a courtyard home, warming their hands over small crackling wood flames with rising embers and smoke.
- **The Rural River & Boatman**: A calm blue-grey river with organic flowing ripples, natural reed banks, and a traditional wooden *dingi* boat propelled by a lone boatman.
- **Botanical Detail**: Date palms (*খেজুর গাছ*) fitted with clay sap pots (*রসের হাঁড়ি*), swaying coconut and betel-nut palms, banana groves, and a dew-covered foreground of 65 botanical grass clumps that catch the soft morning sun.
- **Subtle Sunrise & Mist**: An authentic winter atmosphere with a gentle, pale-gold sun disc peeking above the tree line and thin, horizontal mist layers drifting across the fields.
- **Procedural Soundscape**: An integrated procedural audio engine generating cold morning breezes and authentic songbird chirps (sparrows and robins) without needing any `.mp3` or `.wav` files.

---

## 🎨 Key Visual & Animation Features

| Feature | Description |
| :--- | :--- |
| **🌄 Multi-Depth Landscape** | Layered parallax composition maintaining true 16:9 cinematic aspect ratio across all display resolutions. |
| **🎒 Schoolchildren Walk Cycles** | Custom kinematics simulating realistic strides, bouncing schoolbags, swinging scarves, and group spacing. |
| **🔥 Winter Fire (*আগুন পোহানো*)** | Procedural particle system simulating flickering amber flames, glowing wood embers, floating smoke, and warm lighting cast upon seated villagers. |
| **🌫️ Organic Morning Mist** | Multi-tiered, low-opacity horizontal mist ribbons undulating across the river and distant paddy fields without obscuring focal elements. |
| **🌊 Procedural Water System** | Organic water wavelets with dynamic phase offsets and sunrise reflection highlights along the current. |
| **🌾 Dew-Kissed Botanical Grass** | 65 individual botanical grass tufts with mathematical Bézier curvature and glistening optical morning dew droplets. |
| **🌴 Authentic Bengal Flora** | Date palm trees with tapped trunks and hanging clay pots (*রসের হাঁড়ি*), bamboo groves, coconut palms, and mustard field hues. |
| **🔊 Real-Time Procedural Audio** | Built-in Web Audio API synthesizer generating soft wind gusts and discrete sparrow chirps dynamically. |

---

## 📂 Project Architecture

```
rural-bangladesh-winter-morning/
│
├── index.html               # Main HTML entrypoint, responsive canvas & minimal UI
├── favicon.svg              # Custom SVG morning icon
├── LICENSE                  # MIT Open-Source License
├── README.md                # Comprehensive project documentation
│
├── css/
│   └── style.css            # Full-viewport layout, dark theme background & animations
│
├── js/
│   ├── main.js              # Application lifecycle, render loop & procedural audio synthesizer
│   ├── scene.js             # World dimensions (1920x1080), perspective anchors & color palettes
│   ├── animation.js         # Math utilities, easing functions & Perlin-like noise curves
│   ├── environment.js       # Background sky, sunrise, river, flora, mist, fire gathering & school
│   └── characters.js        # Schoolchildren sprites, kinematics, clothing & walking pathing
│
├── assets/
│   ├── README.md            # Explanation of procedural runtime generation
│   ├── audio/               # (Reserved for optional external audio tracks)
│   ├── backgrounds/         # (Reserved for optional raster backdrops)
│   ├── characters/          # (Reserved for optional custom sprites)
│   └── environment/         # (Reserved for optional asset packs)
│
└── .github/
    └── workflows/
        └── deploy.yml       # GitHub Actions automated deployment to GitHub Pages
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/mahbub440/rural-bangladesh-winter-morning.git
cd rural-bangladesh-winter-morning
```

### 2. Run Locally
Because the project uses standard ES6 modules (`type="module"`), it should be served via a local HTTP server:

**Using Python (pre-installed on most systems):**
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

**Using Node.js (npx):**
```bash
npx serve .
```

**Using VS Code:**
- Install the **Live Server** extension.
- Right-click `index.html` and select **"Open with Live Server"**.

---

## 🎮 Interactive Controls

- **Sound Toggle (🔇 / 🔊)**: Located at the bottom-right corner. Click to enable or mute the procedural ambient winter wind and birdsong.
- **Pause / Resume (⏸ / ▶)**: Pause the animation loop at any frame for inspection.
- **Auto-Resize**: Automatically adapts to full-screen viewports, ultra-wide monitors, tablets, and mobile devices while preserving the 16:9 cinematic framing.

---

## 🛠️ Technology Stack

- **HTML5 Canvas (2D Context)**: Core rendering engine rendering thousands of procedural vector instructions per frame.
- **Modern JavaScript (ES6+ Modules)**: Modular, clean code separation without bundlers or compilation steps (WebPack/Vite not required).
- **Web Audio API**: Real-time sound synthesis using `OscillatorNode`, `BiquadFilterNode`, and `GainNode` for procedural nature soundscapes.
- **CSS3 Modern Layout**: CSS Grid/Flexbox overlay with backdrop blur filters and unobtrusive typography using Google Fonts (*Noto Sans Bengali* & *Playfair Display*).

---

## 🌐 Deploy to GitHub Pages

To host your own live instance on GitHub Pages:
1. Go to your repository settings on GitHub: **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push to `main` or trigger the included `.github/workflows/deploy.yml` workflow.
4. Your application will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Mahbubur Rahman Sayem**
- GitHub: [@mahbub440](https://github.com/mahbub440)
- Portfolio: [mahbub-portfolio](https://github.com/mahbub440/mahbub-portfolio)

*Crafted with heart, celebrating the peaceful simplicity of rural Bengal.* 🇧🇩
