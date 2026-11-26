# Archa Bayram Invitation Web Page 🎄✨

A festive, interactive holiday invitation webpage asking **"Go archa bayram with me?"** with a static **Yes** button and an impossibly evasive **No** button that dodges the cursor whenever it gets close.

---

## 🚀 How to Run

You can open the page directly in your browser:

### Option 1: Double Click
Simply double-click [`index.html`](index.html) to open it in your default web browser (Chrome, Safari, Firefox, Edge).

### Option 2: Terminal Command (macOS)
```bash
open index.html
```

### Option 3: Local Development Server
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## ✨ Features

- **Proximity Avoidance Engine**: Continuously tracks cursor proximity with a 130px threshold. Moving anywhere near the **No** button makes it smoothly dart away in the opposite direction.
- **Corner & Edge Escape**: If chased into a wall or corner, the **No** button teleports to open space so it never gets cornered.
- **Click-Proof Safeguards**: Intercepts `pointermove`, `mouseenter`, `pointerdown`, `touchstart`, and keyboard `focus` events so it cannot be clicked even with rapid mouse clicks or touch taps.
- **Stationary "Yes" Button**: The **Yes** button remains firmly in place with dedicated layout spacing that never shifts or resizes.
- **Celebration Mode**: Clicking **Yes** reveals a holiday celebration card, launches a canvas confetti explosion, and plays an authentic holiday jingle synthesized using the Web Audio API (100% self-contained, no external audio files needed).
- **Winter Atmosphere**: Fullscreen HTML5 canvas falling snow particles, twinkling fairy lights garland, and an animated holiday Archa (tree).
