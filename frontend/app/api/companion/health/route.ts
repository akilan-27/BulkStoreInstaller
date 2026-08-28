import { NextResponse } from 'next/server';
import { Winget } from '@/lib/companion/winget';
import { stateManager } from '@/lib/companion/state';
import os from 'os';
import fs from 'fs';
import { execSync } from 'child_process';

function isCompanionInstalled(): boolean {
  if (os.platform() !== 'win32') return false;

  // 1. Check known install paths
  const knownPaths = [
    'D:\\BulkStoreInstaller Companion\\companion.exe',
    'C:\\Program Files\\BulkStoreInstaller Companion\\companion.exe',
    'C:\\Program Files (x86)\\BulkStoreInstaller Companion\\companion.exe',
    `${process.env.LOCALAPPDATA || ''}\\Programs\\BulkStoreInstaller Companion\\companion.exe`,
  ];

  for (const p of knownPaths) {
    if (fs.existsSync(p)) return true;
  }

  // 2. Check Windows Registry (HKCU)
  try {
    const regCheck = execSync(
      'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\BulkStoreInstallerCompanion"',
      { stdio: ['ignore', 'pipe', 'ignore'], timeout: 1000 }
    ).toString();
    if (regCheck.includes('BulkStoreInstallerCompanion') || regCheck.includes('DisplayName')) return true;
  } catch {}

  // 3. Check Windows Registry (HKLM)
  try {
    const regCheckHklm = execSync(
      'reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\BulkStoreInstallerCompanion"',
      { stdio: ['ignore', 'pipe', 'ignore'], timeout: 1000 }
    ).toString();
    if (regCheckHklm.includes('BulkStoreInstallerCompanion') || regCheckHklm.includes('DisplayName')) return true;
  } catch {}

  return false;
}

export async function GET() {
  const winget = new Winget();
  const isWingetInstalled = await winget.isInstalled();
  const platform = os.platform();
  const isWindows = platform === 'win32';
  const installed = isCompanionInstalled();
  
  const currentJob = stateManager.getJob();

  let isAdmin = false;
  if (isWindows) {
    try {
      execSync('net session', { stdio: 'ignore' });
      isAdmin = true;
    } catch {
      isAdmin = false;
    }
  }

  return NextResponse.json({
    ready: isWindows && isWingetInstalled && installed,
    isAdmin,
    platform: platform,
    winget: {
      installed: isWingetInstalled,
      version: 'unknown'
    },
    companion: {
      installed: installed
    },
    queue: {
      active: currentJob ? currentJob.status === 'running' : false
    },
    reason: !isWindows 
      ? 'Not running on Windows' 
      : (!isWingetInstalled 
          ? 'Winget is not available' 
          : (!installed 
              ? 'Windows Companion is not installed on this system' 
              : undefined))
  });
}
