# Electron + React + TypeScript + BetterSQLite3 + DaisyUI Template

This template provides a ready-to-use starting point for building modern Electron desktop apps with:

- **React** for the UI
- **TypeScript** for type safety
- **BetterSQLite3** for fast, synchronous SQLite access
- **DaisyUI** for beautiful Tailwind-based components

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-repo-folder>
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

## 📦 Building the App

### Build production React assets

```bash
npm run build
```

---

## 📂 Packaging the App

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

**Enjoy building!** 🎉
