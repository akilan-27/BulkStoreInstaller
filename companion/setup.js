const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// In pkg, assets are available in /snapshot/
const installDir = path.join(process.env.LOCALAPPDATA, 'Programs', 'BulkStoreInstaller Companion');

function main() {
  console.log("Installing BulkStoreInstaller Companion...");
  
  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
  }

  // Determine if we are uninstalling
  const args = process.argv.slice(2);
  if (args.includes('/uninstall')) {
    console.log("Uninstalling...");
    try { execSync('taskkill /IM companion.exe /F /T', { stdio: 'ignore' }); } catch(e){}
    try { fs.rmSync(installDir, { recursive: true, force: true }); } catch(e){}
    try { execSync('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "BulkStoreInstallerCompanion" /f', { stdio: 'ignore' }); } catch(e){}
    try { execSync('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\BulkStoreInstallerCompanion" /f', { stdio: 'ignore' }); } catch(e){}
    
    console.log("Uninstallation complete.");
    return;
  }

  // 1. Copy companion.exe
  const companionPath = path.join(installDir, 'companion.exe');
  
  // When bundled with pkg, __dirname is the snapshot directory
  // We need to read the embedded companion.exe and write it to disk
  try {
    const embeddedExe = fs.readFileSync(path.join(__dirname, 'assets', 'companion.exe'));
    fs.writeFileSync(companionPath, embeddedExe);
  } catch (err) {
    console.error("Failed to extract companion.exe. Make sure it is bundled correctly.");
    process.exit(1);
  }

  // 2. Create run.vbs to start companion hidden
  const vbsPath = path.join(installDir, 'run.vbs');
  fs.writeFileSync(vbsPath, 'CreateObject("WScript.Shell").Run """' + companionPath + '""", 0, False');

  // 3. Copy the uninstaller (itself)
  const uninstallPath = path.join(installDir, 'uninstall.exe');
  fs.copyFileSync(process.execPath, uninstallPath);

  // 4. Registry: Startup
  try {
    execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "BulkStoreInstallerCompanion" /t REG_SZ /d "\\"${vbsPath}\\"" /f`, { stdio: 'ignore' });
  } catch(e){}

  // 5. Registry: Uninstaller
  try {
    const regKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\BulkStoreInstallerCompanion';
    execSync(`reg add "${regKey}" /v "DisplayName" /t REG_SZ /d "BulkStoreInstaller Companion" /f`, { stdio: 'ignore' });
    execSync(`reg add "${regKey}" /v "DisplayVersion" /t REG_SZ /d "1.1.0" /f`, { stdio: 'ignore' });
    execSync(`reg add "${regKey}" /v "Publisher" /t REG_SZ /d "BulkStoreInstaller" /f`, { stdio: 'ignore' });
    execSync(`reg add "${regKey}" /v "UninstallString" /t REG_SZ /d "\\"${uninstallPath}\\" /uninstall" /f`, { stdio: 'ignore' });
  } catch(e){}

  // 6. Start the companion
  try {
    execSync('taskkill /IM companion.exe /F /T', { stdio: 'ignore' });
  } catch(e){}
  
  try {
    execSync(`wscript.exe "${vbsPath}"`);
  } catch(e){}

  // 7. Show success message
  try {
    execSync(`powershell -Command "Add-Type -AssemblyName PresentationCore,PresentationFramework; [System.Windows.MessageBox]::Show('BulkStoreInstaller Companion has been successfully installed and is running in the background. Please refresh the website.', 'Installation Complete', 'OK', 'Information')"`, { stdio: 'ignore' });
  } catch(e){}
}

main();
