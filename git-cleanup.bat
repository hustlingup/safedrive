@echo off
REM Git Cleanup Script for Windows
REM This script helps you start fresh with a clean Git repository

echo ========================================
echo Git Cleanup - Remove Exposed API Keys
echo ========================================
echo.
echo WARNING: This will remove all Git history!
echo.
echo Before proceeding:
echo 1. Make sure you have rotated all API keys
echo 2. Updated your .env file with new credentials
echo 3. Backed up your code
echo.
pause

echo.
echo Step 1: Removing .git folder...
if exist .git (
    rmdir /s /q .git
    echo Done!
) else (
    echo .git folder not found
)

echo.
echo Step 2: Initializing new Git repository...
git init
echo Done!

echo.
echo Step 3: Adding all files...
git add .
echo Done!

echo.
echo Step 4: Creating initial commit...
git commit -m "Initial commit with secure credential management"
echo Done!

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Add your GitHub remote:
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo.
echo 2. Force push to GitHub:
echo    git push -u --force origin main
echo.
echo 3. Verify no secrets in history:
echo    git log --all --oneline
echo.
pause
