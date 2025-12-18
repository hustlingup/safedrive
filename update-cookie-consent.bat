@echo off
REM SAFE DRIVE Cookie Consent Update Script (Batch version)
REM 모든 HTML 페이지에 쿠키 동의 시스템을 추가하는 스크립트

echo.
echo ============================================
echo   SAFE DRIVE Cookie Consent Update Script
echo ============================================
echo.
echo This script will update all HTML files with cookie consent system.
echo.
echo For automatic updates, please run:
echo   powershell -ExecutionPolicy Bypass -File update-cookie-consent.ps1
echo.
echo Or manually add the following to each HTML file before ^</body^>:
echo.
echo   ^<!-- Cookie Consent System --^>
echo   ^<link rel="stylesheet" href="/css/cookie-consent.css"^>
echo   ^<script src="/js/cookie-consent.js"^>^</script^>
echo   ^<button class="cookie-settings-trigger" onclick="openCookieSettings()"^>🍪^</button^>
echo.
echo Files to update:
echo   - plate.html
echo   - qr-generator.html
echo   - terms.html
echo   - referral.html
echo   - privacy.html
echo   - other.html
echo   - legal.html
echo   - faq.html
echo   - contact.html
echo.
echo For more information, see COOKIE_CONSENT_GUIDE.md
echo.
pause
