@echo off
REM Build script for SafeDrive (Windows)
REM Runs the Node.js build script

echo Building SafeDrive...
node build.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build successful! Ready to deploy.
) else (
    echo.
    echo Build failed! Please check the errors above.
    pause
)
