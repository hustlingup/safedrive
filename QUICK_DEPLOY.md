# Quick Deploy Guide - Firebase Security Rules Upgrade

## 🚀 Ready to Deploy? (5 Minutes)

### Option A: Safe Deployment (Recommended) ✅

Deploy bot prevention for plates only, keep referrals working:

```bash
# 1. Backup current rules
cp database.rules.json database.rules.backup.json

# 2. Create temporary rules (plates protected, referrals open)
cat > database.rules.json << 'EOF'
{
  "rules": {
    "plates": {
      "$plateNumber": {
        ".read": true,
        ".write": false,
        "counters": { ".write": false },
        "daily": { ".write": false },
        "monthly": { ".write": false },
        "monthlyIncrements": { ".write": false },
        "lastUpdated": { ".write": false },
        "views": { ".write": false }
      }
    },
    "global": {
      ".read": true,
      ".write": false
    },
    "leaderboards": {
      ".read": true,
      ".write": false
    },
    "security": {
      ".read": false,
      ".write": false
    },
    "subscriptions": {
      ".read": true,
      "$token": {
        ".write": "auth != null && auth.token.firebase.sign_in_provider === 'anonymous'"
      }
    },
    "analytics": {
      ".read": true,
      ".write": false
    },
    "referrals": {
      ".read": true,
      ".write": true
    },
    "roadStress": {
      ".read": true,
      ".write": true
    }
  }
}
EOF

# 3. Deploy
firebase deploy --only database
firebase deploy --only hosting

# 4. Test
# Visit: https://your-project.web.app/plate.html?plate=12가3456
# Try clicking message buttons and like button
```

**Result:**
- ✅ Plate counters: Protected with bot prevention
- ✅ Referrals: Working (temporary)
- ✅ Everything else: Working

---

### Option B: Full Deployment (Breaks Referrals) ⚠️

Deploy complete bot prevention (referrals will break):

```bash
# 1. Backup
cp database.rules.json database.rules.backup.json

# 2. Deploy complete rules
cp firebase-security-rules.json database.rules.json
firebase deploy --only database
firebase deploy --only hosting
```

**Result:**
- ✅ Plate counters: Protected
- ❌ Referrals: BROKEN (needs Cloud Function)
- ✅ Everything else: Working

---

## 🧪 Quick Test

```bash
# 1. Visit plate page
https://your-project.web.app/plate.html?plate=12가3456

# 2. Click message buttons (should work)
# 3. Click like button (should work)
# 4. Try rapid clicking (should be rate limited after 10 clicks)

# 5. Check logs
firebase functions:log --only secureIncrementCounter
```

---

## 🔄 Rollback (If Needed)

```bash
# Restore backup
cp database.rules.backup.json database.rules.json
firebase deploy --only database
```

---

## 📊 What's Protected?

| Feature | Status | Method |
|---------|--------|--------|
| Plate Counters | ✅ Protected | Cloud Function |
| Global Stats | ✅ Protected | Cloud Function |
| Leaderboards | ✅ Protected | Cloud Function |
| Analytics | ✅ Protected | Cloud Function |
| Subscriptions | ✅ Protected | Anonymous Auth |
| Referrals | ⚠️ Temporary | Direct Write (Option A) |
| Referrals | ❌ Broken | No Function (Option B) |

---

## 🎯 Recommendation

**Use Option A** - Safe deployment that protects plates while keeping referrals working. Create referral Cloud Function later.

---

## 📚 Full Documentation

- `UPGRADE_COMPLETE.md` - Complete summary
- `DEPLOYMENT_CHECKLIST.md` - Detailed procedures
- `SECURITY_RULES_UPGRADE_SUMMARY.md` - Technical details

---

**Time to Deploy:** ~5 minutes
**Risk Level:** Low (Option A) / Medium (Option B)
**Rollback Time:** ~2 minutes
