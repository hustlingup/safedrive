# Quick Reference - SafeDrive Build System

## 🚀 Common Commands

| Task | Command | When to Use |
|------|---------|-------------|
| **Build** | `node build.js` | Before testing or deploying |
| **Restore** | `node restore-placeholders.js` | Before committing to Git |
| **Verify** | `node verify-build.js` | Check current build status |
| **Deploy** | `firebase deploy --only hosting` | After building |

## 📋 Quick Workflows

### Testing Locally
```bash
node build.js          # Inject credentials
# Test your app
node restore-placeholders.js  # Before committing
```

### Deploying to Production
```bash
node build.js          # Inject credentials
node verify-build.js   # Verify build
firebase deploy --only hosting
```

### Before Git Commit
```bash
node restore-placeholders.js  # Restore placeholders
node verify-build.js          # Verify restoration
git add .
git commit -m "Your message"
```

## 🔍 Status Check

### Check if Built (Ready to Deploy)
```bash
node verify-build.js
```
**Expected**: "✅ All files are BUILT and ready to deploy!"

### Check if Has Placeholders (Safe to Commit)
```bash
node verify-build.js
```
**Expected**: "⚠️ All files have PLACEHOLDERS (not built)"

## 📁 Files Overview

### Source Files (4)
- `script.js` - Main app (VAPID key)
- `subscription-manager.js` - Push notifications (VAPID key)
- `firebase-config.js` - Firebase config (8 credentials)
- `sw.js` - Service Worker (8 credentials)

### Build Scripts (3)
- `build.js` - Inject credentials from .env
- `restore-placeholders.js` - Restore placeholders
- `verify-build.js` - Check build status

### Config Files (2)
- `.env` - Real credentials (NOT in Git)
- `.env.example` - Template (in Git)

## 🔐 Environment Variables

### Required in .env (9 total)
```env
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_DATABASE_URL=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_MEASUREMENT_ID=...
VAPID_KEY=...
```

## ⚠️ Important Rules

1. **Always build before deploying**
   ```bash
   node build.js
   firebase deploy --only hosting
   ```

2. **Always restore before committing**
   ```bash
   node restore-placeholders.js
   git commit -m "..."
   ```

3. **Never commit .env file**
   - It's already in .gitignore
   - Contains real credentials

4. **Verify before actions**
   ```bash
   node verify-build.js
   ```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check `.env` file exists and has all variables |
| App doesn't work | Run `node build.js` before deploying |
| Push notifications fail | Verify VAPID_KEY in `.env` is correct |
| Committed credentials | Run `node restore-placeholders.js` and commit again |

## 📚 Documentation

- **SECURITY_ENHANCEMENT_COMPLETE.md** - Complete security guide
- **SECURITY_UPDATE_SUMMARY.md** - Detailed update info
- **BUILD_SUCCESS.md** - Build success guide
- **README.md** - Project documentation

## 🎯 Quick Checks

### Is it built?
```bash
# PowerShell
Select-String -Path firebase-config.js -Pattern "__FIREBASE_API_KEY__"
# No matches = Built ✅
# Has matches = Not built ⚠️
```

### Is it safe to commit?
```bash
# PowerShell
Select-String -Path firebase-config.js -Pattern "__FIREBASE_API_KEY__"
# Has matches = Safe to commit ✅
# No matches = Not safe ❌
```

## 🔄 State Transitions

```
Placeholders (Git) → Build → Built (Deploy) → Restore → Placeholders (Git)
     ↑                                                         ↓
     └─────────────────────────────────────────────────────────┘
```

## 💡 Pro Tips

1. **Use batch files on Windows**
   ```bash
   build.bat    # Build + Verify
   restore.bat  # Restore + Verify
   ```

2. **Verify after every action**
   ```bash
   node verify-build.js
   ```

3. **Keep .env secure**
   - Don't share it
   - Don't commit it
   - Back it up securely

4. **Use CI/CD secrets**
   - Add all 9 variables to CI/CD platform
   - Let automation handle building

## 🎨 Color Codes (verify-build.js)

- 🟢 Green = Built and ready
- 🟡 Yellow = Has placeholders
- 🔴 Red = Error or mixed state
- 🔵 Blue = Information

---

**Keep this file handy for quick reference!** 📌
