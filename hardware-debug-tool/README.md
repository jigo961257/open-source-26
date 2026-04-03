# Hardware Debug Tool

A professional-grade, cross-platform serial monitor and hardware debugging application built with **Electron**, **React**, **TypeScript**, and **Tailwind CSS**. 

Designed specifically for engineers and makers, this app provides robust real-time serial communications with a sleek, premium dark-mode interface, and a powerful command automation system.

## 🚀 Features

### Core Serial Communication
- **Real-Time Data Streaming**: Effortlessly connect to serial ports with configurable baud rates.
- **Binary Protocol Support**: Capable of reading raw data streams directly without newline blocking, making it suitable for both text and raw binary sensor debugging.
- **Split View & Hex View**: Toggle between pure ASCII view, pure Hex view, or a Split View to see both representations simultaneously.
- **Line Endings & Formats**: Send text (CR, LF, CRLF) or raw Hex bytes back to your hardware.

### Powerful Debugging Utilities
- **Data Logging**: Write incoming and outgoing serial traffic directly to disk in real-time.
- **Buffer Export**: Export the current session's entire buffer to a timestamped file for later analysis.
- **In-Terminal Search**: Instantly find specific payloads or strings within the terminal buffer (Ctrl/Cmd + F).
- **Auto-scroll & Timestamps**: Customizable terminal displaying optional millisecond-prefixed timestamps and autoscroll freezing.

### ⚡ Command Automation System
Save time during repetitive testing with the built-in Command Automation engine.
- **Command Storage**: Save commands (both text and Hex) with custom identifiers to your local disk.
- **Auto-Repeat Timers**: Offload repetitive tests. The main process reliably handles auto-repeat intervals (down to 100ms) even if the UI renderer is busy.
- **@-Mentions Autocomplete**: Type `@` into the Send Bar to fuzzy-search your saved commands and fire them instantly from the keyboard.

## 🛠️ Tech Stack

- **Framework:** [Electron-Vite](https://electron-vite.org/)
- **Frontend:** React, TypeScript, Tailwind CSS v4
- **UI Components:** Lucide Icons, Radix UI Primitives 
- **Hardware Integration:** `serialport` for Node.js
- **Persistence:** `electron-store` mapped through typed IPC context bridges

---

## 💻 Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 📦 Project Setup

### 1. Install Dependencies

You may need native build tools (like Python and C++ toolchains) installed on your system to compile the `serialport` bindings.

```bash
$ npm install
```

### 2. Development

Start the Vite development server and the Electron app simultaneously:

```bash
$ npm run dev
```

### 3. Build for Production

Package the application into an executable for your operating system:

```bash
# For macOS
$ npm run build:mac

# For Windows
$ npm run build:win

# For Linux
$ npm run build:linux
```
