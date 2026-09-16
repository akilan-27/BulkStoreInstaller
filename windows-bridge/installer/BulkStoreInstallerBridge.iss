[Setup]
AppId={{5F8A2D3C-4E61-4B71-9B5A-1A9E3F8C2D4E}
AppName=BulkStoreInstaller Bridge
AppVersion=1.2.0
AppPublisher=BulkStoreInstaller
DefaultDirName={localappdata}\Programs\BulkStoreInstaller Bridge
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\dist
OutputBaseFilename=BulkStoreInstallerBridgeSetup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\BulkStoreInstaller.Bridge.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\src\BulkStoreInstaller.Bridge\bin\Release\net10.0-windows\win-x64\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{userprograms}\BulkStoreInstaller Bridge"; Filename: "{app}\BulkStoreInstaller.Bridge.exe"

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "BulkStoreInstaller Bridge"; ValueData: """{app}\BulkStoreInstaller.Bridge.exe"""; Flags: uninsdeletevalue

[Run]
Filename: "{app}\BulkStoreInstaller.Bridge.exe"; Description: "{cm:LaunchProgram,BulkStoreInstaller Bridge}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "taskkill.exe"; Parameters: "/F /IM BulkStoreInstaller.Bridge.exe"; Flags: runhidden
