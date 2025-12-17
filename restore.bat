@echo off
REM Restore placeholders script for SafeDrive (Windows)
REM Runs before committing to Git

echo Restoring placeholders...
node restore-placeholders.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Placeholders restored! Safe to commit.
    echo.
    echo Verifying restoration...
    node verify-build.js
) else (
    echo.
    echo Restore failed! Please check the errors above.
    pause
)
