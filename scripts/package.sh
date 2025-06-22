#!/bin/bash

# IME Optimizer - Package Script
# Creates a Chrome extension ZIP file for distribution

set -e  # Exit on any error

echo "🚀 Creating Chrome Extension Package..."

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME="ime-optimizer-v${VERSION}.zip"

echo "📦 Package version: ${VERSION}"

# Clean and create temp directory
TEMP_DIR="./temp-package"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"

# Copy built files
echo "📂 Copying built files..."
cp -r dist/* "${TEMP_DIR}/"

# Copy locale files
echo "🌐 Copying locale files..."
cp -r public/_locales "${TEMP_DIR}/"

# Verify required files exist
echo "✅ Verifying package contents..."
REQUIRED_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "popup.html"
    "popup.js"
    "options.html"
    "options.js"
    "icons/icon-16.png"
    "icons/icon-32.png"
    "icons/icon-48.png"
    "icons/icon-128.png"
    "_locales/ja/messages.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "${TEMP_DIR}/${file}" ]]; then
        echo "❌ Missing required file: ${file}"
        exit 1
    fi
done

# Validate manifest.json
echo "🔍 Validating manifest.json..."
if ! node -e "JSON.parse(require('fs').readFileSync('${TEMP_DIR}/manifest.json', 'utf8'))" 2>/dev/null; then
    echo "❌ Invalid manifest.json format"
    exit 1
fi

# Check file sizes (should not be empty)
echo "📏 Checking file sizes..."
for js_file in "${TEMP_DIR}"/*.js; do
    if [[ -f "$js_file" ]]; then
        # Cross-platform file size check
        if command -v stat >/dev/null 2>&1; then
            size=$(stat -f%z "$js_file" 2>/dev/null || stat -c%s "$js_file" 2>/dev/null || echo "0")
        else
            size=$(wc -c < "$js_file" 2>/dev/null || echo "0")
        fi
        if [[ $size -lt 100 ]]; then
            echo "⚠️ Warning: $(basename "$js_file") seems too small (${size} bytes)"
        fi
    fi
done

# Create ZIP file
echo "🗜️ Creating ZIP package..."
cd "${TEMP_DIR}"
zip -r "../${PACKAGE_NAME}" . -x "*.DS_Store" "*/__pycache__/*" "*/node_modules/*"
cd ..

# Clean up temp directory
rm -rf "${TEMP_DIR}"

# Verify ZIP file
echo "✅ Verifying ZIP package..."
if [[ ! -f "${PACKAGE_NAME}" ]]; then
    echo "❌ Failed to create package"
    exit 1
fi

# Cross-platform file size check for ZIP
if command -v stat >/dev/null 2>&1; then
    ZIP_SIZE=$(stat -f%z "${PACKAGE_NAME}" 2>/dev/null || stat -c%s "${PACKAGE_NAME}" 2>/dev/null || echo "0")
else
    ZIP_SIZE=$(wc -c < "${PACKAGE_NAME}" 2>/dev/null || echo "0")
fi
echo "📦 Package created: ${PACKAGE_NAME} (${ZIP_SIZE} bytes)"

# List contents for verification
echo "📋 Package contents:"
unzip -l "${PACKAGE_NAME}"

echo "✅ Package creation completed successfully!"
echo "📁 File: ${PACKAGE_NAME}"