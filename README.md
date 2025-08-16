# Electron + React + TypeScript + BetterSQLite3 + DaisyUI Template

This template provides a ready-to-use starting point for building modern Electron desktop apps with:

- **React** for the UI
- **TypeScript** for type safety
- **BetterSQLite3** for fast, synchronous SQLite access
- **DaisyUI** for beautiful Tailwind-based components

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/taariqelliott/electron-better-sqlite3
cd electron-better-sqlite3
```

### 2. Install dependencies

```bash
npm install
```

### 3. Rebuild native modules for Electron

```bash
node_modules/.bin/electron-rebuild
```

### 4. Run the app in development mode

```bash
npm run dev
```

---

## Building the App

### Build production React assets

```bash
npm run build
```

---

## Packaging the App

1. Build production assets:

```bash
npm run build
```

2. Create distributables (macOS DMG, ZIPs, and application files):

```bash
npm run make
```

After running `npm run make`, your packaged files will be available in the `out` directory.

---

## Changing the DaisyUI Theme

This template uses the **`dim`** theme by default. You can customize it by changing the `data-theme` value in `index.html` and updating the theme list in `index.css`.

### To apply a theme:

1. In `index.html`, update the `data-theme` attribute:

```html
<html data-theme="dim"></html>
```

2. In `index.css`, configure DaisyUI themes:

```css
@import "tailwindcss";

@plugin "daisyui" {
  themes:
    light --default,
    dim; /* replace 'dim' with your chosen theme name */
}
```

3. Or create your own custom theme by defining colors, fonts, and other variables in the same section.

For a list of preset themes, visit [DaisyUI Themes](https://daisyui.com/docs/themes/).

---

Enjoy building and styling your app! 🎨
