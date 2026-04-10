#!/usr/bin/env bash
# One-time developer environment setup for EasyTimer on Ubuntu 24.
#
# Installs all system dependencies required by Tauri v2, Rust, Node.js, and Yarn.
# Run once per developer machine:
#   bash scripts/setup-ubuntu.sh

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[setup]${NC} $*"; }
warning() { echo -e "${YELLOW}[setup]${NC} $*"; }
error()   { echo -e "${RED}[setup]${NC} $*" >&2; exit 1; }

# ── 1. System packages required by Tauri v2 on Linux ─────────────────────────
info "Installing system packages for Tauri v2..."
sudo apt-get update -qq
sudo apt-get install -y \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    pkg-config

# ── 2. Rustup / Rust toolchain ────────────────────────────────────────────────
if command -v rustup &>/dev/null; then
    info "rustup already installed — updating toolchain..."
    rustup update stable
else
    info "Installing rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
    # shellcheck disable=SC1091
    source "$HOME/.cargo/env"
fi

RUST_VERSION=$(rustc --version 2>/dev/null || echo "not found")
info "Rust: $RUST_VERSION"

# ── 3. Node.js via nvm ───────────────────────────────────────────────────────
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ -s "$NVM_DIR/nvm.sh" ]; then
    info "nvm already installed — loading..."
    # shellcheck disable=SC1091
    source "$NVM_DIR/nvm.sh"
else
    info "Installing nvm..."
    NVM_INSTALL_VERSION="0.40.3"
    curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_INSTALL_VERSION}/install.sh" | bash
    # shellcheck disable=SC1091
    source "$NVM_DIR/nvm.sh"
fi

# Install LTS Node if no version is active
if ! command -v node &>/dev/null; then
    info "Installing Node.js LTS..."
    nvm install --lts
    nvm use --lts
fi

NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
info "Node.js: $NODE_VERSION"

# ── 4. Yarn ───────────────────────────────────────────────────────────────────
if command -v yarn &>/dev/null; then
    info "yarn already installed: $(yarn --version)"
else
    info "Installing yarn..."
    npm install -g yarn
    YARN_VERSION=$(yarn --version 2>/dev/null || echo "not found")
    info "yarn: $YARN_VERSION"
fi

# ── 5. Summary ───────────────────────────────────────────────────────────────
echo ""
info "Setup complete. Next steps:"
echo "  1. Restart your terminal (or run: source ~/.cargo/env && source ~/.nvm/nvm.sh)"
echo "  2. cd into the project directory"
echo "  3. yarn"
echo "  4. yarn tauri dev"
