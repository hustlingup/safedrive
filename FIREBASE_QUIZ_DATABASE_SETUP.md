# Firebase Quiz Database Setup Guide

This guide explains how to initialize the Firebase Realtime Database with the quiz statistics structure for the safedrive.kr quiz system.

## Overview

The quiz system uses Firebase Realtime Database to track:
- **Total quiz completions** for each quiz
- **Result type distribution** for each quiz

## Database Structure

```json
{
  "quizStats": {
    "quiz1": {
      "totalCompletions": 0,
      "results": {
        "SFE": 0,
        "SFI": 0,
        "SME": 0,
        "SMI": 0,
        "CFE": 0,
        "CFI": 0,
        "CME": 0,
        "CMI": 0
      }
    },
    "quiz2": {
      "totalCompletions": 0,
      "results": {
        "A": 0,
        "B": 0,
        "C": 0,
        "D": 0,
        "AB": 0,
        "BC": 0,
        "AC": 0,
        "DA": 0
      }
    }
  }
}
```

### Quiz1 Result Types (운전성향 테스트)
- **SFE** - Speed + Follow rules + Emotional
- **SFI** - Speed + Follow rules + Intuitive
- **SME** - Speed + My way + Emotional
- **SMI** - Speed + My way + Intuitive
- **CFE** - Careful + Follow rules + Emotional
- **CFI** - Careful + Follow rules + Intuitive
- **CME** - Careful + My way + Emotional
- **CMI** - Careful + My way + Intuitive

### Quiz2 Result Types (극한의 시나리오 챌린지)
- **A** - Type A result
- **B** - Type B result
- **C** - Type C result
- **D** - Type D result
- **AB** - Mixed A/B result
- **BC** - Mixed B/C result
- **AC** - Mixed A/C result
- **DA** - Mixed D/A result

## Initialization Methods

### Method 1: Firebase Console Import (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database** in the left sidebar
4. Click on the **Data** tab
5. Click the **⋮** (three dots) menu at the root node
6. Select **Import JSON**
7. Upload the `firebase-quiz-init-data.json` file
8. Click **Import**

> **Note:** If you already have data in the database, the import will merge with existing data. The `quizStats` node will be created or updated.

### Method 2: Manual Entry via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database**
4. Click on the **Data** tab
5. Hover over the root node and click the **+** button
6. Add the following structure manually:
   - Name: `quizStats`
   - Add child: `quiz1`
     - Add child: `totalCompletions` with value `0`
     - Add child: `results`
       - Add children: `SFE`, `SFI`, `SME`, `SMI`, `CFE`, `CFI`, `CME`, `CMI` (all with value `0`)
   - Add child: `quiz2`
     - Add child: `totalCompletions` with value `0`
     - Add child: `results`
       - Add children: `A`, `B`, `C`, `D`, `AB`, `BC`, `AC`, `DA` (all with value `0`)

### Method 3: Firebase CLI

You can also use the Firebase CLI to set the data:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the data using the REST API
firebase database:set /quizStats --data "$(cat firebase-quiz-init-data.json | jq '.quizStats')"
```

Or using curl with the REST API:

```bash
# Replace YOUR_PROJECT_ID with your actual Firebase project ID
# Replace YOUR_DATABASE_SECRET with your database secret (found in Project Settings > Service Accounts)

curl -X PUT \
  "https://YOUR_PROJECT_ID.firebaseio.com/quizStats.json?auth=YOUR_DATABASE_SECRET" \
  -d @firebase-quiz-init-data.json
```

## Important Notes

### Auto-Initialization Behavior

The `quiz-counter.js` module uses Firebase transactions that handle non-existent data gracefully:

```javascript
await totalRef.transaction((currentValue) => {
    return (currentValue || 0) + 1;
});
```

This means:
- If the data doesn't exist, it will be initialized to `1` on the first increment
- Pre-initializing with `0` values is **optional** but recommended for:
  - Cleaner database structure from the start
  - Accurate statistics display before any quiz completions
  - Easier debugging and monitoring

### Security Rules

The database security rules in `firebase-security-rules.json` are already configured to:
- Allow public read access to `quizStats`
- Allow write access only for increment operations
- Validate that values are numbers and increments are exactly +1

### Verification

After initialization, verify the structure in Firebase Console:

1. Navigate to Realtime Database > Data
2. Expand the `quizStats` node
3. Confirm both `quiz1` and `quiz2` nodes exist
4. Confirm each has `totalCompletions: 0` and `results` with all type codes set to `0`

## Troubleshooting

### Import Fails
- Ensure the JSON file is valid (no trailing commas, proper formatting)
- Check that you have write permissions to the database
- Verify your Firebase project is on a plan that supports Realtime Database

### Data Not Showing on Landing Pages
- Check browser console for Firebase connection errors
- Verify Firebase configuration in `firebase-config.js`
- Ensure the database URL is correct in your Firebase config

### Counter Not Incrementing
- Check that security rules are deployed: `firebase deploy --only database`
- Verify the quiz-counter.js is properly loaded on the page
- Check for CORS or authentication issues in browser console
