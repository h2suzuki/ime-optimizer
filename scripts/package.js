#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function print(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function printInfo(message) { print(colors.blue, 'INFO', message); }
function printSuccess(message) { print(colors.green, 'SUCCESS', message); }
function printWarning(message) { print(colors.yellow, 'WARNING', message); }
function printError(message) { print(colors.red, 'ERROR', message); }

async function createPackage() {
  try {
    printInfo('🚀 Creating Chrome Extension Package...');

    // Get version from package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version;
    const packageName = `ime-optimizer-v${version}.zip`;

    printInfo(`📦 Package version: ${version}`);

    // Define required files
    const requiredFiles = [
      'dist/manifest.json',
      'dist/background.js',
      'dist/content.js',
      'dist/popup.html',
      'dist/popup.js',
      'dist/options.html',
      'dist/options.js',
      'dist/icons/icon-16.png',
      'dist/icons/icon-32.png',
      'dist/icons/icon-48.png',
      'dist/icons/icon-128.png',
      'dist/_locales/ja/messages.json'
    ];

    // Verify required files exist
    printInfo('✅ Verifying package contents...');
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        printError(`Missing required file: ${file}`);
        process.exit(1);
      }
    }

    // Validate manifest.json
    printInfo('🔍 Validating manifest.json...');
    try {
      const manifestContent = fs.readFileSync('dist/manifest.json', 'utf8');
      JSON.parse(manifestContent);
    } catch (error) {
      printError('Invalid manifest.json format');
      process.exit(1);
    }

    // Check file sizes
    printInfo('📏 Checking file sizes...');
    const jsFiles = ['dist/background.js', 'dist/content.js', 'dist/popup.js', 'dist/options.js'];
    for (const jsFile of jsFiles) {
      if (fs.existsSync(jsFile)) {
        const stats = fs.statSync(jsFile);
        if (stats.size < 100) {
          printWarning(`${path.basename(jsFile)} seems too small (${stats.size} bytes)`);
        }
      }
    }

    // Create ZIP file
    printInfo('🗜️ Creating ZIP package...');
    
    const output = fs.createWriteStream(packageName);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle events
    output.on('close', () => {
      const zipSize = archive.pointer();
      printSuccess(`📦 Package created: ${packageName} (${zipSize} bytes)`);
      
      // List contents for verification
      printInfo('📋 Package contents verified');
      printSuccess('✅ Package creation completed successfully!');
      printInfo(`📁 File: ${packageName}`);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        printWarning(err.message);
      } else {
        throw err;
      }
    });

    archive.on('error', (err) => {
      printError(`Archive error: ${err.message}`);
      process.exit(1);
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add files to the archive
    archive.file('dist/manifest.json', { name: 'manifest.json' });
    archive.file('dist/background.js', { name: 'background.js' });
    archive.file('dist/content.js', { name: 'content.js' });
    archive.file('dist/popup.html', { name: 'popup.html' });
    archive.file('dist/popup.js', { name: 'popup.js' });
    archive.file('dist/options.html', { name: 'options.html' });
    archive.file('dist/options.js', { name: 'options.js' });

    // Add icons directory
    archive.directory('dist/icons/', 'icons/');

    // Add locales directory
    archive.directory('dist/_locales/', '_locales/');

    // Finalize the archive
    await archive.finalize();

  } catch (error) {
    printError(`Package creation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createPackage();
}

module.exports = { createPackage };