# ⚡ Electron Template

A modern, production-ready Electron desktop application template with React, TypeScript, TailwindCSS v4, and Vite.

![Electron](https://img.shields.io/badge/Electron-33.x-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)

## ✨ Features

- ⚡ **Vite** - Lightning fast development with Hot Module Replacement (HMR)
- ⚛️ **React 18** - Modern hooks-based UI development
- 📝 **TypeScript** - Full type safety across main, preload, and renderer processes
- 🎨 **TailwindCSS v4** - Utility-first CSS with the new v4 engine
- 🔄 **Auto Updater** - Built-in update mechanism using electron-updater
- 🔌 **IPC Examples** - Secure main-renderer communication patterns
- 🪟 **Custom Titlebar** - Frameless window with custom controls
- 📋 **Context Menus** - Native context menu examples
- 🌓 **Theme Support** - Light/Dark mode with toggle
- 📦 **electron-builder** - Cross-platform packaging (macOS, Windows, Linux)

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone this repository (or use it as a template):

```bash
git clone https://github.com/yourusername/electron-template-by-jigo.git my-app
cd my-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

This will:
- Build the main and preload processes
- Start the Vite dev server for the renderer
- Launch Electron with hot reload enabled

## 📁 Project Structure

```
electron-template-by-jigo/
├── src/
│   ├── main/                    # Main process (Node.js)
│   │   ├── index.ts             # Main entry, window creation
│   │   ├── ipc.ts               # IPC handlers
│   │   ├── menu.ts              # App menu & context menus
│   │   └── updater.ts           # Auto-updater setup
│   │
│   ├── preload/                 # Preload scripts (bridge)
│   │   └── index.ts             # Context bridge API exposure
│   │
│   └── renderer/                # Renderer process (React)
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── App.tsx          # Main app component
│       │   ├── main.tsx         # React entry point
│       │   └── index.css        # TailwindCSS styles
│       └── index.html           # HTML template
│
├── resources/                   # App resources (icons, etc.)
├── electron-builder.yml         # Build configuration
├── vite.main.config.ts          # Vite config for main
├── vite.preload.config.ts       # Vite config for preload
├── vite.renderer.config.ts      # Vite config for renderer
└── package.json                 # Dependencies & scripts
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development with hot reload |
| `npm run build` | Build all processes for production |
| `npm run preview` | Build and run production build locally |
| `npm run package` | Package app for current platform |
| `npm run package:mac` | Package for macOS |
| `npm run package:win` | Package for Windows |
| `npm run package:linux` | Package for Linux |
| `npm run clean` | Remove build artifacts |
| `npm run typecheck` | Run TypeScript type checking |

## 🎨 Theme System

This template includes a built-in light/dark theme system.

### Using the Theme Toggle

- **UI Toggle**: Click the sun/moon icon in the titlebar or the toggle in the Theme Settings card
- **Keyboard Shortcut**: Press `⌘+Shift+T` (macOS) or `Ctrl+Shift+T` (Windows/Linux)
- **Menu**: View → Toggle Theme

### Customizing Themes

Edit the CSS variables in `src/renderer/src/index.css`:

```css
:root {
  /* Light Theme */
  --color-bg-primary: #ffffff;
  --color-text-primary: #0f172a;
  --color-accent: #6366f1;
  /* ... more variables */
}

[data-theme="dark"] {
  /* Dark Theme */
  --color-bg-primary: #0f172a;
  --color-text-primary: #f8fafc;
  --color-accent: #818cf8;
  /* ... more variables */
}
```

### Programmatic Theme Control

```typescript
// Get current theme
const theme = await window.electronAPI.invoke.getTheme();

// Set theme
await window.electronAPI.invoke.setTheme('dark');

// Toggle theme
const newTheme = await window.electronAPI.invoke.toggleTheme();
```

## 🔌 IPC Communication

This template demonstrates secure IPC patterns using `contextBridge`.

### Available APIs

```typescript
// Window controls
window.electronAPI.windowControls.minimize();
window.electronAPI.windowControls.maximize();
window.electronAPI.windowControls.close();

// App info
const version = await window.electronAPI.invoke.getVersion();
const systemInfo = await window.electronAPI.invoke.getSystemInfo();

// Dialogs
await window.electronAPI.invoke.showMessageDialog({
  type: 'info',
  title: 'Hello',
  message: 'This is a native dialog!',
});

// File operations
const result = await window.electronAPI.invoke.openFileDialog();
const fileContent = await window.electronAPI.invoke.readFile(path);

// Context menus
await window.electronAPI.contextMenu.showCustom(['Option 1', 'Option 2']);
```

### Adding New IPC Handlers

1. Add the handler in `src/main/ipc.ts`:

```typescript
ipcMain.handle('my:custom-handler', async (_, arg1, arg2) => {
  // Your logic here
  return result;
});
```

2. Expose it in `src/preload/index.ts`:

```typescript
myCustomHandler: (arg1, arg2) => ipcRenderer.invoke('my:custom-handler', arg1, arg2),
```

3. Update the type definitions in the `ElectronAPI` interface.

## 🖼️ Customizing the App Icon

The template includes placeholder icons. To use your own:

1. **Prepare your icon**:
   - Create a 1024x1024 PNG icon
   - For best results, use a square design with some padding

2. **Replace the placeholder**:
   - macOS: Replace `resources/icon.icns`
   - Windows: Replace `resources/icon.ico`
   - Linux: Add icons to `resources/icons/` (16x16, 32x32, 48x48, etc.)

3. **Icon conversion tools**:
   - macOS: Use `iconutil` or [Icon Slate](https://www.kodlian.com/apps/icon-slate)
   - Windows: Use [png2ico](https://www.winterdrache.de/freeware/png2ico/) or online converters
   - Cross-platform: [electron-icon-maker](https://www.npmjs.com/package/electron-icon-maker)

## 🔄 Auto Updater

The template includes electron-updater configured for GitHub Releases.

### Setting Up Auto Updates

1. Update `electron-builder.yml` with your GitHub details:

```yaml
publish:
  provider: github
  owner: your-username
  repo: your-repo
  releaseType: release
```

2. Set up GitHub token for publishing:

```bash
export GH_TOKEN=your_github_token
npm run package
```

3. Create a GitHub release and upload the built artifacts.

### Checking for Updates Programmatically

```typescript
// Check for updates
const result = await window.electronAPI.updater.check();

// Download update
await window.electronAPI.updater.download();

// Install and restart
window.electronAPI.updater.install();
```

## 📦 Building for Production

### macOS

```bash
npm run package:mac
```

For code signing, update `electron-builder.yml`:

```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  notarize:
    teamId: TEAM_ID
```

### Windows

```bash
npm run package:win
```

### Linux

```bash
npm run package:linux
```

## 🧩 Extending the Template

### Adding New Dependencies

- **Renderer dependencies**: Add to `dependencies` in package.json
- **Main process dependencies**: Add to `dependencies` (not bundled separately)

### Adding New Pages/Routes

For multi-page apps, consider adding [React Router](https://reactrouter.com/):

```bash
npm install react-router-dom
```

### Adding State Management

For complex state, consider [Zustand](https://github.com/pmndrs/zustand):

```bash
npm install zustand
```

## 🔒 Security Best Practices

This template follows Electron security best practices:

- ✅ Context Isolation enabled
- ✅ Node Integration disabled
- ✅ Secure IPC via contextBridge
- ✅ Content Security Policy configured
- ✅ Remote module disabled
- ✅ Sandboxing ready

## 📝 License

MIT License - feel free to use this template for any project!

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [electron-builder](https://electron.build/)

---

Made with ❤️ by Jeegar Goyani
