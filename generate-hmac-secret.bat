@echo off
REM Generate HMAC Secret for Bot Prevention System
REM Windows Batch Script

echo.
echo ================================
echo  HMAC Secret Generator
echo ================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell not found!
    echo Please run generate-hmac-secret.ps1 instead
    pause
    exit /b 1
)

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0generate-hmac-secret.ps1"
