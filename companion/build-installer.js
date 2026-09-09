const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

console.log("Building Server...");
run('npx pkg server.js --targets node18-win-x64 --output dist/companion.exe');

console.log("Preparing assets for Installer...");
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// Copy the compiled companion.exe to the assets folder so setup.js can bundle it
fs.copyFileSync('dist/companion.exe', 'assets/companion.exe');

console.log("Building Installer Setup...");
// Create a temporary package.json for pkg so it knows to include the assets directory
fs.writeFileSync('setup-package.json', JSON.stringify({
  bin: "setup.js",
  pkg: {
    assets: [ "assets/**/*" ]
  }
}));

run('npx pkg setup-package.json --targets node18-win-x64 --output dist/BulkStoreInstallerCompanionSetup.exe');

// Clean up
fs.rmSync('assets', { recursive: true, force: true });
fs.unlinkSync('setup-package.json');

console.log("Build Complete! Installer is at dist/BulkStoreInstallerCompanionSetup.exe");
