@echo off
setlocal enabledelayedexpansion

echo Building BulkStoreInstaller Companion (.NET 10)
echo.

where dotnet >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: 'dotnet' command not found. Please install .NET SDK.
    exit /b 1
)

set ISCC_CMD=
where iscc >nul 2>nul
if %errorlevel% equ 0 (
    set ISCC_CMD=iscc
) else (
    if exist "C:\Program Files (x86)\Inno Setup 7\ISCC.exe" (
        set "ISCC_CMD=C:\Program Files (x86)\Inno Setup 7\ISCC.exe"
    ) else if exist "C:\Program Files\Inno Setup 7\ISCC.exe" (
        set "ISCC_CMD=C:\Program Files\Inno Setup 7\ISCC.exe"
    ) else if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" (
        set "ISCC_CMD=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    ) else (
        echo ERROR: 'iscc' command not found. Please install Inno Setup.
        exit /b 1
    )
)

echo Generating catalog...
node scripts\generate-catalog.mjs
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate catalog.
    exit /b 1
)

echo.
echo Restoring dependencies...
dotnet restore src\BulkStoreInstaller.Companion\BulkStoreInstaller.Companion.csproj
if %errorlevel% neq 0 (
    echo ERROR: dotnet restore failed.
    exit /b 1
)

echo.
echo Running tests...
dotnet test tests\BulkStoreInstaller.Companion.Tests\BulkStoreInstaller.Companion.Tests.csproj
if %errorlevel% neq 0 (
    echo ERROR: Tests failed.
    exit /b 1
)

echo.
echo Publishing release...
dotnet publish src\BulkStoreInstaller.Companion\BulkStoreInstaller.Companion.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o out
if %errorlevel% neq 0 (
    echo ERROR: dotnet publish failed.
    exit /b 1
)

echo.
echo Building installer...
"%ISCC_CMD%" installer\BulkStoreInstallerCompanion.iss
if %errorlevel% neq 0 (
    echo ERROR: iscc failed.
    exit /b 1
)

echo.
if exist "dist\BulkStoreInstallerCompanionSetup.exe" (
    echo Build Complete!
    echo Output: %~dp0..\dist\BulkStoreInstallerCompanionSetup.exe
) else (
    echo ERROR: Installer not found in dist folder.
    exit /b 1
)
