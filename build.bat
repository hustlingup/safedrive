@echo off
REM Build script for SafeDrive (Windows)
REM Builds to dist/ folder with credentials injected

echo Building SafeDrive...
node build.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Verifying build...
    node verify-build.js
) else (
    echo.
    echo Build failed! Please check the errors above.
    pause
)
