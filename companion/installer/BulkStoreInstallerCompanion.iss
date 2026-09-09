[Setup]
AppId={{5F8A2D3C-4E61-4B71-9B5A-1A9E3F8C2D4E}
AppName=BulkStoreInstaller Companion
AppVersion=1.1.0
AppPublisher=BulkStoreInstaller
DefaultDirName={localappdata}\Programs\BulkStoreInstaller Companion
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\dist
OutputBaseFilename=BulkStoreInstallerCompanionSetup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\BulkStoreInstaller.Companion.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "..\out\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; We assume Assets/catalog.json is already published in out/ folder.

[Icons]
Name: "{userprograms}\BulkStoreInstaller Companion"; Filename: "{app}\BulkStoreInstaller.Companion.exe"

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "BulkStoreInstaller Companion"; ValueData: """{app}\BulkStoreInstaller.Companion.exe"""; Flags: uninsdeletevalue

[Run]
Filename: "{app}\BulkStoreInstaller.Companion.exe"; Description: "{cm:LaunchProgram,BulkStoreInstaller Companion}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; Kill the process gracefully or forcefully during uninstallation
Filename: "taskkill.exe"; Parameters: "/F /IM BulkStoreInstaller.Companion.exe"; Flags: runhidden
