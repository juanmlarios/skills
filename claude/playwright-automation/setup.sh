#!/bin/bash

# Setup script for playwright-automation skill

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up playwright-automation skill..."
echo

cd "$SCRIPT_DIR"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node version: $(node --version)"
echo

# Install dependencies
echo "Installing dependencies..."
npm install

echo
echo "Installing Chromium browser..."
npx playwright install chromium

echo
echo "✅ Setup complete!"
echo
echo "Test the installation:"
echo "  node extract.js https://example.com h1"
echo
echo "See README.md for more examples"
