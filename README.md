# easytimer

Desktop time-tracking app built with Tauri v2 + Vite + TypeScript.

## Prerequisites

Run the one-time setup script for your OS. This installs system dependencies and writes the local Cargo toolchain config (never committed to the repo).

### Windows 11

Requires Visual Studio 2022 Build Tools with "Desktop development with C++". If not yet installed:

```powershell
winget install --id Microsoft.VisualStudio.2022.BuildTools --override "--quiet --wait --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

Then run the setup script **once**:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-windows.ps1
```

This detects your installed MSVC and Windows SDK versions and writes `%USERPROFILE%\.cargo\config.toml` with the correct linker and library paths (needed when running from Git Bash, which has a conflicting `/usr/bin/link.exe`).

### Ubuntu 24

```bash
bash scripts/setup-ubuntu.sh
```

Installs all required apt packages, Rust via rustup, Node.js via nvm, and Yarn. After it completes, restart your terminal.

## Development

```bash
yarn          # install JS dependencies
yarn tauri dev
```

## Build

```bash
yarn tauri build
```

> **Important**: never copy `src-tauri/target/` between systems. Run `cargo clean` when switching OS or after a major toolchain update.

