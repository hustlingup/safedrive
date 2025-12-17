# ⚡ Quick Action Checklist

## 🔴 URGENT - Do This First

### 1. Rotate Firebase API Key (5 minutes)
```
□ Go to: https://console.cloud.google.com/
□ Select project: safedrive-fa567
□ Navigate to: APIs & Services > Credentials
□ Find key: AIzaSyDIdD_L-FHumeBjvAzB-2e1iLv8dpAak7w
□ Click "Delete" or "Regenerate"
□ Create new API key
□ Add restrictions:
  □ Application restrictions: HTTP referrers
  □ Website restrictions: Add your domain
  □ API restrictions: Select specific APIs
□ Copy new API key
```

### 2. Rotate VAPID Key (3 minutes)
```
□ Go to: https://console.firebase.google.com/
□ Select project: safedrive-fa567
□ Navigate to: Project Settings > Cloud Messaging > Web Push certificates
□ Delete old key pair
□ Generate new key pair
□ Copy new VAPID key
```

### 3. Update .env File (1 minute)
```
□ Open .env file
□ Replace FIREBASE_API_KEY with new key
□ Replace VAPID_KEY with new key
□ Save file
```

## 🟡 IMPORTANT - Do This Next

### 4. Clean Git History (10 minutes)

**Option A: Start Fresh (Easiest)**
```
□ Run: git-cleanup.bat
□ Or manually:
  □ Delete .git folder: rm -rf .git
  □ Initialize: git init
  □ Add files: git add .
  □ Commit: git commit -m "Initial commit with secure credential management"
  □ Add remote: git remote add origin YOUR_GITHUB_URL
  □ Force push: git push -u --force origin main
```

**Option B: Rewrite History (Advanced)**
```
□ See GIT_CLEANUP_GUIDE.md for detailed instructions
```

### 5. Verify Everything (5 minutes)
```
□ Build: node build.js
□ Verify: node verify-build.js
□ Check output shows:
  □ Source files have placeholders ✓
  □ Dist files have real values ✓
```

## 🟢 RECOMMENDED - Do This Soon

### 6. Test Application (10 minutes)
```
□ Test locally:
  □ Open dist/index.html in browser
  □ Check Firebase connection works
  □ Test push notifications
□ Deploy: firebase deploy --only hosting
□ Test in production:
  □ Visit your live site
  □ Verify Firebase connection
  □ Test push notifications
```

### 7. Add Security Measures (15 minutes)
```
□ Google Cloud Console:
  □ Add API key restrictions
  □ Limit to your domain only
  □ Restrict to specific APIs
□ Firebase Console:
  □ Review Security Rules
  □ Enable Firebase App Check (optional)
□ GitHub:
  □ Enable secret scanning
  □ Enable push protection
```

### 8. Update CI/CD (if applicable)
```
□ Update secrets with new credentials:
  □ FIREBASE_API_KEY
  □ VAPID_KEY
  □ All other Firebase credentials
□ Test automated deployment
```

## 💡 OPTIONAL - Nice to Have

### 9. Set Up Pre-commit Hook
```
□ Create .git/hooks/pre-commit
□ Add secret detection patterns
□ Make executable: chmod +x .git/hooks/pre-commit
□ Test: Try committing a secret (should fail)
```

### 10. Document for Team
```
□ Share GIT_CLEANUP_GUIDE.md with team
□ Notify team about Git history rewrite
□ Ensure everyone clones fresh
□ Share new credentials securely
```

## ✅ Verification Checklist

After completing all steps:

```
□ Old Firebase API key doesn't work
□ Old VAPID key doesn't work
□ New credentials work in application
□ Source files have placeholders
□ Dist folder has real values
□ Git history is clean (no old secrets)
□ Application works in production
□ Push notifications work
□ No secrets in GitHub repository
□ Team members notified (if applicable)
```

## 📋 Quick Status Check

Run these commands to verify:

```bash
# Check source files (should have placeholders)
grep -r "AIzaSyDIdD" firebase-config.js sw.js script.js subscription-manager.js
# Should return: No matches

# Check dist files (should have real values)
grep -r "AIzaSyDIdD" dist/
# Should return: Multiple matches

# Verify build
node verify-build.js
# Should show: Everything looks good!

# Check Git history
git log --all --full-history -S "AIzaSyDIdD_L-FHumeBjvAzB-2e1iLv8dpAak7w"
# Should return: Nothing (after cleanup)
```

## 🆘 If Something Goes Wrong

### Build fails
```
□ Check .env file exists
□ Verify all variables are set
□ Run: node build.js
□ Check error message
```

### Old credentials still work
```
□ Verify you deleted them in Firebase/Google Cloud Console
□ Wait a few minutes for changes to propagate
□ Clear browser cache
```

### Git push fails
```
□ Use --force flag: git push --force origin main
□ Verify remote URL is correct
□ Check GitHub permissions
```

### Application doesn't work
```
□ Verify new credentials in .env
□ Rebuild: node build.js
□ Check browser console for errors
□ Verify Firebase Security Rules
```

## 📞 Need Help?

1. **Build issues**: Check `verify-build.js` output
2. **Git issues**: See `GIT_CLEANUP_GUIDE.md`
3. **Security questions**: See `SECURITY_AUDIT_REPORT.md`
4. **Quick reference**: See `QUICK_REFERENCE.md`

## ⏱️ Time Estimate

- **Minimum (Urgent only)**: ~10 minutes
- **Recommended (Urgent + Important)**: ~30 minutes
- **Complete (All steps)**: ~1 hour

## 🎯 Priority Order

1. 🔴 Rotate credentials (URGENT)
2. 🟡 Clean Git history (IMPORTANT)
3. 🟢 Test and verify (RECOMMENDED)
4. 💡 Add security measures (OPTIONAL)

---

**Start with step 1 and work your way down!**

**Remember**: The most important thing is rotating the credentials. Everything else can wait, but do this first!
