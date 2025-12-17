# Generate HMAC Secret for Bot Prevention System
# Windows PowerShell Script

Write-Host "🔐 Generating HMAC Secret..." -ForegroundColor Cyan
Write-Host ""

# Generate 32 random bytes and convert to hex
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$secret = [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()

Write-Host "✅ HMAC Secret Generated:" -ForegroundColor Green
Write-Host ""
Write-Host $secret -ForegroundColor Yellow
Write-Host ""

# Copy to clipboard if available
try {
    Set-Clipboard -Value $secret
    Write-Host "✅ Secret copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not copy to clipboard (manual copy needed)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Set in Firebase Functions config:" -ForegroundColor White
Write-Host "   firebase functions:config:set security.hmac_secret=`"$secret`"" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update public/security.js (line 11):" -ForegroundColor White
Write-Host "   HMAC_SECRET: `"$secret`"" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy:" -ForegroundColor White
Write-Host "   firebase deploy" -ForegroundColor Gray
Write-Host ""

# Optionally set in Firebase automatically
Write-Host "Would you like to set this in Firebase Functions config now? (Y/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Setting Firebase Functions config..." -ForegroundColor Cyan
    
    $command = "firebase functions:config:set security.hmac_secret=`"$secret`""
    Invoke-Expression $command
    
    Write-Host ""
    Write-Host "✅ Firebase config updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Don't forget to update public/security.js with the same secret!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Remember to set the secret manually using the command above!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
