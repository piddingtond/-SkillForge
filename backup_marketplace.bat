@echo off
REM OpenClaw Skills Marketplace - Dual Backup Script
REM Backs up to both G: and D: drives
REM Created: 2026-04-17

echo ================================================
echo OpenClaw Skills Marketplace - Backup Script
echo ================================================
echo.

REM Get timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/: " %%a in ('time /t') do (set mytime=%%a%%b)
set timestamp=%mydate%_%mytime%

REM Define backup directories
set SOURCE=G:\workspace\skill-finder
set BACKUP_G=G:\openclaw\backups\marketplace\%timestamp%
set BACKUP_D=D:\openclaw\backups\marketplace\%timestamp%

echo Timestamp: %timestamp%
echo Source: %SOURCE%
echo.

REM Create backup directories
echo Creating backup directories...
mkdir "%BACKUP_G%" 2>nul
mkdir "%BACKUP_D%" 2>nul

REM Backup to G: drive
echo.
echo [1/2] Backing up to G: drive...
xcopy "%SOURCE%" "%BACKUP_G%" /E /I /H /Y /Q
if %ERRORLEVEL% EQU 0 (
    echo ✓ G: drive backup complete
) else (
    echo ✗ G: drive backup failed
)

REM Backup to D: drive
echo.
echo [2/2] Backing up to D: drive...
xcopy "%SOURCE%" "%BACKUP_D%" /E /I /H /Y /Q
if %ERRORLEVEL% EQU 0 (
    echo ✓ D: drive backup complete
) else (
    echo ✗ D: drive backup failed
)

REM Create manifest
echo.
echo Creating backup manifests...

echo OpenClaw Skills Marketplace - Backup Manifest > "%BACKUP_G%\MANIFEST.txt"
echo Backup Date: %mydate% %mytime% >> "%BACKUP_G%\MANIFEST.txt"
echo Source: %SOURCE% >> "%BACKUP_G%\MANIFEST.txt"
echo Location: G: drive >> "%BACKUP_G%\MANIFEST.txt"
echo. >> "%BACKUP_G%\MANIFEST.txt"
echo Contents: >> "%BACKUP_G%\MANIFEST.txt"
dir "%BACKUP_G%" /B >> "%BACKUP_G%\MANIFEST.txt"

echo OpenClaw Skills Marketplace - Backup Manifest > "%BACKUP_D%\MANIFEST.txt"
echo Backup Date: %mydate% %mytime% >> "%BACKUP_D%\MANIFEST.txt"
echo Source: %SOURCE% >> "%BACKUP_D%\MANIFEST.txt"
echo Location: D: drive >> "%BACKUP_D%\MANIFEST.txt"
echo. >> "%BACKUP_D%\MANIFEST.txt"
echo Contents: >> "%BACKUP_D%\MANIFEST.txt"
dir "%BACKUP_D%" /B >> "%BACKUP_D%\MANIFEST.txt"

echo.
echo ================================================
echo Backup Complete!
echo ================================================
echo G: drive: %BACKUP_G%
echo D: drive: %BACKUP_D%
echo ================================================
pause
