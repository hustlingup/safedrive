# SAFE DRIVE Cookie Consent Update Script
# 모든 HTML 페이지에 쿠키 동의 시스템을 추가하는 스크립트

Write-Host "🍪 SAFE DRIVE Cookie Consent Update Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 업데이트할 HTML 파일 목록
$htmlFiles = @(
    "plate.html",
    "qr-generator.html",
    "terms.html",
    "referral.html",
    "privacy.html",
    "other.html",
    "legal.html",
    "faq.html",
    "contact.html"
)

# 쿠키 동의 스니펫
$cookieConsentSnippet = @"

    <!-- Cookie Consent System -->
    <link rel="stylesheet" href="/css/cookie-consent.css">
    <script src="/js/cookie-consent.js"></script>
    
    <!-- Cookie Settings Floating Button -->
    <button 
        class="cookie-settings-trigger" 
        onclick="openCookieSettings()" 
        title="쿠키 설정 관리"
        aria-label="쿠키 설정 관리">
        🍪
    </button>
</body>
</html>
"@

# Google Analytics 업데이트 (기존 코드 찾기)
$oldGAPattern = "gtag\('config', 'G-9R8RZYZC7X'\);"
$newGACode = @"
// Default consent to denied (will be updated by cookie consent manager)
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
      
      gtag('config', 'G-9R8RZYZC7X');
"@

$updatedCount = 0
$errorCount = 0

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            
            # 1. 쿠키 동의 시스템이 이미 있는지 확인
            if ($content -match "cookie-consent\.js") {
                Write-Host "  ⚠️  Cookie consent already exists, skipping..." -ForegroundColor Gray
                continue
            }
            
            # 2. </body></html> 패턴 찾아서 교체
            if ($content -match "</body>\s*</html>") {
                $content = $content -replace "</body>\s*</html>", $cookieConsentSnippet
                
                # 3. Google Analytics 업데이트
                if ($content -match $oldGAPattern) {
                    $content = $content -replace "gtag\('config', 'G-9R8RZYZC7X'\);", $newGACode
                    Write-Host "  ✓ Updated Google Analytics consent mode" -ForegroundColor Green
                }
                
                # 4. 파일 저장
                $content | Set-Content $file -Encoding UTF8 -NoNewline
                Write-Host "  ✓ Added cookie consent system" -ForegroundColor Green
                $updatedCount++
            } else {
                Write-Host "  ✗ Could not find </body></html> pattern" -ForegroundColor Red
                $errorCount++
            }
        }
        catch {
            Write-Host "  ✗ Error: $_" -ForegroundColor Red
            $errorCount++
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Updated: $updatedCount files" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  ✗ Errors: $errorCount files" -ForegroundColor Red
}
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the cookie banner on each page" -ForegroundColor White
Write-Host "2. Verify Google Analytics consent mode is working" -ForegroundColor White
Write-Host "3. Check the floating 🍪 button appears on all pages" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see COOKIE_CONSENT_GUIDE.md" -ForegroundColor Cyan
