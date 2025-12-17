# Git Cleanup Guide - Remove Exposed API Keys

## ⚠️ CRITICAL: Your API Keys Are in Git History

Even though we've updated the source files with placeholders, **your API keys are still in Git history**. Anyone who clones your repository can see the old commits with hardcoded keys.

## Immediate Actions Required

### 1. Rotate All Credentials (URGENT)

Before cleaning Git history, rotate all exposed credentials:

#### Firebase API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `safedrive-fa567`
3. Go to: APIs & Services > Credentials
4. Find your API key: `AIzaSyDIdD_L-FHumeBjvAzB-2e1iLv8dpAak7w`
5. Click "Delete" or "Regenerate"
6. Create a new API key
7. Add restrictions:
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: Add your domain(s)
   - **API restrictions**: Select only the APIs you use

#### VAPID Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `safedrive-fa567`
3. Go to: Project Settings > Cloud Messaging > Web Push certificates
4. Delete the old key pair
5. Generate a new key pair
6. Copy the new VAPID key

#### Update .env File
```bash
# Update your .env with new credentials
FIREBASE_API_KEY=your_new_api_key_here
VAPID_KEY=your_new_vapid_key_here
```

### 2. Clean Git History

You have two options:

#### Option A: Start Fresh (Recommended for Public Repos)

**Pros**: Complete clean slate, no history of exposed keys  
**Cons**: Lose all Git history

```bash
# 1. Backup your current code
cd ..
cp -r safedrive2 safedrive2-backup

# 2. Remove .git folder
cd safedrive2
rm -rf .git

# 3. Initialize new repository
git init
git add .
git commit -m "Initial commit with secure credential management"

# 4. Force push to GitHub (overwrites everything)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u --force origin main
```

#### Option B: Rewrite Git History (Keep History)

**Pros**: Keeps commit history  
**Cons**: More complex, requires coordination with team

**Using BFG Repo-Cleaner (Recommended):**

```bash
# 1. Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Create a file with strings to remove
echo "AIzaSyDIdD_L-FHumeBjvAzB-2e1iLv8dpAak7w" > secrets.txt
echo "BBPwhFN3K4dlsDZXul31NlMdOYtyLDvSNCV_RJuyz_GIdsWd0YCd3pAM3n_M8qm9UX0ZNpSAaOPAgJZY0aTYt8c" >> secrets.txt
echo "safedrive-fa567.firebaseapp.com" >> secrets.txt
echo "637630322258" >> secrets.txt
echo "1:637630322258:web:407f2f745f51aa3d58b18b" >> secrets.txt

# 3. Clone a fresh copy
cd ..
git clone --mirror https://github.com/YOUR_USERNAME/YOUR_REPO.git repo-mirror
cd repo-mirror

# 4. Run BFG to remove secrets
java -jar bfg.jar --replace-text ../secrets.txt

# 5. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. Force push
git push --force
```

**Using git-filter-repo (Alternative):**

```bash
# 1. Install git-filter-repo
pip install git-filter-repo

# 2. Create expressions file
cat > expressions.txt << EOF
AIzaSyDIdD_L-FHumeBjvAzB-2e1iLv8dpAak7w==>__FIREBASE_API_KEY__
BBPwhFN3K4dlsDZXul31NlMdOYtyLDvSNCV_RJuyz_GIdsWd0YCd3pAM3n_M8qm9UX0ZNpSAaOPAgJZY0aTYt8c==>__VAPID_KEY__
safedrive-fa567.firebaseapp.com==>__FIREBASE_AUTH_DOMAIN__
637630322258==>__FIREBASE_MESSAGING_SENDER_ID__
1:637630322258:web:407f2f745f51aa3d58b18b==>__FIREBASE_APP_ID__
EOF

# 3. Run filter
git filter-repo --replace-text expressions.txt --force

# 4. Force push
git push --force --all
```

### 3. Notify Team Members

If you're working with a team:

```bash
# Send this message to your team:
```

**Subject: URGENT - Git Repository Rewritten**

The Git repository has been rewritten to remove exposed API keys. All team members must:

1. Delete their local repository
2. Clone fresh from GitHub
3. Update their `.env` file with new credentials

**DO NOT** try to pull or merge - it will fail. You must clone fresh.

```bash
# Delete old repo
rm -rf safedrive2

# Clone fresh
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git safedrive2
cd safedrive2

# Create .env file
cp .env.example .env
# Edit .env with new credentials
```

### 4. Verify Cleanup

After cleaning, verify no secrets remain:

```bash
# Search for old API key
git log --all --full-history --source --pretty=format: -S "AIzaSyDIdD_L-FHumeBjvAzB-2e1iLv8dpAak7w"

# Should return nothing if successful
```

## Post-Cleanup Checklist

- [ ] Rotated Firebase API key
- [ ] Rotated VAPID key
- [ ] Updated `.env` file with new credentials
- [ ] Cleaned Git history (Option A or B)
- [ ] Force pushed to GitHub
- [ ] Verified no secrets in Git history
- [ ] Notified team members (if applicable)
- [ ] Updated CI/CD secrets with new credentials
- [ ] Tested application with new credentials
- [ ] Verified old credentials no longer work

## Prevention for Future

### 1. Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Pre-commit hook to prevent committing secrets

# Check for common secret patterns
if git diff --cached | grep -E "AIza[A-Za-z0-9_-]{35}"; then
    echo "❌ ERROR: Firebase API key detected!"
    echo "Remove the API key before committing."
    exit 1
fi

if git diff --cached | grep -E "BB[A-Za-z0-9_-]{85}"; then
    echo "❌ ERROR: VAPID key detected!"
    echo "Remove the VAPID key before committing."
    exit 1
fi

# Check if .env is being committed
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "❌ ERROR: .env file should not be committed!"
    exit 1
fi

exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 2. Use git-secrets

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Initialize in your repo
cd safedrive2
git secrets --install
git secrets --register-aws

# Add custom patterns
git secrets --add 'AIza[A-Za-z0-9_-]{35}'
git secrets --add 'BB[A-Za-z0-9_-]{85}'
```

### 3. GitHub Secret Scanning

Enable secret scanning in your GitHub repository:

1. Go to: Settings > Security > Code security and analysis
2. Enable: "Secret scanning"
3. Enable: "Push protection"

This will prevent pushing commits with secrets.

## Important Notes

### About Firebase Credentials

Firebase credentials are **designed to be public** in client-side applications. The real security comes from:

1. **Firebase Security Rules** - Control database access
2. **API Key Restrictions** - Limit where the key can be used
3. **Domain Restrictions** - Only allow your domain

However, using environment variables is still best practice for:
- Clean code separation
- Easy credential rotation
- Environment management (dev/staging/prod)
- CI/CD integration

### If You Can't Rotate Credentials

If you can't rotate credentials immediately:

1. **Add API Key Restrictions** (Google Cloud Console)
   - Restrict to your domain only
   - Limit to specific APIs

2. **Configure Firebase Security Rules**
   - Require authentication
   - Validate data access

3. **Monitor Usage**
   - Check Firebase Console for unusual activity
   - Set up billing alerts

## Need Help?

If you encounter issues:

1. **Git history cleanup failed**: Try Option A (start fresh)
2. **Team members can't sync**: They must clone fresh, not pull
3. **Old credentials still work**: Verify you deleted them in Firebase/Google Cloud Console
4. **Build fails**: Update `.env` with new credentials and run `node build.js`

## Summary

✅ **What We Did**:
- Moved credentials to environment variables
- Updated source files with placeholders
- Created build system that outputs to `dist/`

⚠️ **What You Must Do**:
- Rotate all exposed credentials
- Clean Git history
- Update `.env` with new credentials
- Force push to GitHub

🔒 **Prevention**:
- Use pre-commit hooks
- Enable GitHub secret scanning
- Never commit `.env` file
- Always use placeholders in source code

---

**Remember**: Even after cleaning Git history, assume the old credentials are compromised. Always rotate them!
