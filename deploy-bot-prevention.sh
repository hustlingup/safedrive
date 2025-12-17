#!/bin/bash

# SafeDrive Bot Prevention System - Automated Deployment Script
# This script automates the deployment of the bot prevention system

set -e  # Exit on error

echo "🛡️  SafeDrive Bot Prevention System - Deployment Script"
echo "========================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Firebase CLI is installed
print_info "Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi
print_success "Firebase CLI found"

# Check if logged in to Firebase
print_info "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi
print_success "Firebase authentication OK"

# Check if in correct directory
print_info "Checking project structure..."
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Are you in the project root?"
    exit 1
fi
if [ ! -d "functions" ]; then
    print_error "functions/ directory not found"
    exit 1
fi
if [ ! -d "public" ]; then
    print_error "public/ directory not found"
    exit 1
fi
print_success "Project structure OK"

# Check if new files exist
print_info "Checking bot prevention files..."
if [ ! -f "functions/secureIncrement.js" ]; then
    print_error "functions/secureIncrement.js not found"
    exit 1
fi
if [ ! -f "public/security.js" ]; then
    print_error "public/security.js not found"
    exit 1
fi
print_success "Bot prevention files found"

# Backup existing files
print_info "Creating backups..."
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp functions/index.js "$BACKUP_DIR/" 2>/dev/null || true
cp public/script.js "$BACKUP_DIR/" 2>/dev/null || true
print_success "Backups created in $BACKUP_DIR"

# Check if HMAC secret is configured
print_info "Checking HMAC secret configuration..."
if firebase functions:config:get | grep -q "hmac_secret"; then
    print_success "HMAC secret already configured"
else
    print_warning "HMAC secret not configured"
    echo ""
    echo "Would you like to generate and set a new HMAC secret? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Generating HMAC secret..."
        SECRET=$(openssl rand -hex 32)
        print_info "Setting HMAC secret in Firebase Functions config..."
        firebase functions:config:set security.hmac_secret="$SECRET"
        print_success "HMAC secret configured"
        print_warning "IMPORTANT: Update public/security.js with this secret:"
        echo ""
        echo "HMAC_SECRET: \"$SECRET\""
        echo ""
        echo "Press Enter to continue after updating the file..."
        read -r
    else
        print_error "HMAC secret is required. Exiting."
        exit 1
    fi
fi

# Install dependencies
print_info "Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..
print_success "Dependencies installed"

# Ask for deployment confirmation
echo ""
print_warning "Ready to deploy. This will:"
echo "  1. Deploy Cloud Functions (secureIncrementCounter, cleanupSecurityData)"
echo "  2. Deploy Hosting (including security.js)"
echo ""
echo "Continue with deployment? (y/n)"
read -r response
if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    print_info "Deployment cancelled"
    exit 0
fi

# Deploy functions
print_info "Deploying Cloud Functions..."
if firebase deploy --only functions; then
    print_success "Cloud Functions deployed successfully"
else
    print_error "Cloud Functions deployment failed"
    exit 1
fi

# Deploy hosting
print_info "Deploying Hosting..."
if firebase deploy --only hosting; then
    print_success "Hosting deployed successfully"
else
    print_error "Hosting deployment failed"
    exit 1
fi

# Optional: Deploy database rules
echo ""
echo "Would you like to deploy updated database rules? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    if [ -f "database-rules-with-bot-prevention.json" ]; then
        print_info "Deploying database rules..."
        cp database-rules-with-bot-prevention.json database.rules.json
        if firebase deploy --only database; then
            print_success "Database rules deployed successfully"
        else
            print_error "Database rules deployment failed"
        fi
    else
        print_warning "database-rules-with-bot-prevention.json not found, skipping"
    fi
fi

# Get project info
PROJECT_ID=$(firebase projects:list | grep -m 1 "│" | awk '{print $2}')

# Deployment complete
echo ""
echo "========================================================"
print_success "Deployment Complete!"
echo "========================================================"
echo ""
print_info "Next Steps:"
echo ""
echo "1. Test the bot prevention system:"
echo "   https://${PROJECT_ID}.web.app/test-bot-prevention.html"
echo ""
echo "2. Update HTML files (plate.html, plate2.html) to include security.js:"
echo "   <script src=\"security.js\"></script>"
echo "   <script src=\"script.js\"></script>"
echo ""
echo "3. Monitor Cloud Functions logs:"
echo "   firebase functions:log --only secureIncrementCounter"
echo ""
echo "4. Check Firebase Console:"
echo "   https://console.firebase.google.com/project/${PROJECT_ID}/functions"
echo ""
print_info "Documentation:"
echo "  - BOT_PREVENTION_IMPLEMENTATION.md (technical details)"
echo "  - BOT_PREVENTION_DEPLOYMENT.md (deployment guide)"
echo "  - BOT_PREVENTION_QUICK_REFERENCE.md (quick reference)"
echo ""
print_success "Bot prevention system is now active! 🎉"
echo ""
