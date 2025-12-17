# SafeDrive Web App - Design Document

## Overview

SafeDrive is a privacy-focused, anonymous web application that enables Korean drivers to share and view vehicle safety feedback using license plate numbers. The application is built entirely with vanilla HTML, CSS, and JavaScript, utilizing Firebase Realtime Database for data persistence and Chart.js for data visualization. The architecture prioritizes simplicity, performance, and mobile responsiveness while maintaining strict privacy standards.

The system operates without user authentication, using LocalStorage for client-side daily limit enforcement and Firebase transactions for atomic counter updates. The application supports clean URL routing for shareable plate pages and implements real-time leaderboards to encourage positive driving behavior.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  HTML Pages (index.html, plate.html)                   │ │
│  │  ├─ Landing Page (search, leaderboards, stats)         │ │
│  │  └─ Plate Page (results, counters, chart)              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  JavaScript Modules (script.js)                        │ │
│  │  ├─ Router (URL parsing, navigation)                   │ │
│  │  ├─ Firebase Client (CRUD operations, transactions)    │ │
│  │  ├─ UI Controller (DOM manipulation, events)           │ │
│  │  ├─ Chart Manager (Chart.js integration)               │ │
│  │  ├─ Daily Limit Manager (LocalStorage)                 │ │
│  │  └─ Leaderboard Calculator (ranking logic)             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  CSS Styles (styles.css)                               │ │
│  │  ├─ Responsive layouts (mobile-first)                  │ │
│  │  ├─ Component styles (buttons, cards, charts)          │ │
│  │  └─ Theme variables (colors, spacing)                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Realtime Database                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /plates/{plateNumber}/counters/{counterKey}           │ │
│  │  /plates/{plateNumber}/lastUpdated                     │ │
│  │  /global/{period}/{counterKey}                         │ │
│  │  /leaderboards/bestDrivers/{period}/[...]              │ │
│  │  /leaderboards/mostLiked/{period}/[...]                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: HTML5, CSS3 (Flexbox, Grid), Vanilla JavaScript (ES6+)
- **Database**: Firebase Realtime Database (via CDN)
- **Visualization**: Chart.js 4.x (via CDN)
- **Hosting**: Netlify (static site hosting with continuous deployment)
- **Version Control**: GitHub
- **Dependencies**: All loaded via CDN (no build process required)

### Deployment Architecture

```
GitHub Repository
       │
       │ (push to main)
       ▼
Netlify Build & Deploy
       │
       ├─ Build: None (static files)
       ├─ Deploy: Copy files to CDN
       └─ URL: https://safedrive.netlify.app
       │
       ▼
Global CDN Distribution
```

## Components and Interfaces

### 1. Router Module

**Purpose**: Handle URL parsing, navigation, and clean URL support

**Key Functions**:
- `parsePlateFromURL()`: Extract plate number from URL path or query string
- `navigateToPlate(plateNumber)`: Navigate to plate detail page with clean URL
- `initRouter()`: Initialize History API or hash-based routing

**Interface**:
```javascript
const Router = {
  parsePlateFromURL: () => string | null,
  navigateToPlate: (plateNumber: string) => void,
  getCurrentPlate: () => string | null,
  initRouter: () => void
};
```

### 2. Firebase Client Module

**Purpose**: Manage all Firebase Realtime Database operations

**Key Functions**:
- `initFirebase(config)`: Initialize Firebase SDK with configuration
- `incrementCounter(plateNumber, counterKey)`: Atomic counter increment using transaction
- `getPlateData(plateNumber)`: Fetch all counters for a plate
- `getGlobalStats(period)`: Fetch global statistics for a time period
- `getLeaderboard(type, period, limit)`: Fetch ranked plates for leaderboards

**Interface**:
```javascript
const FirebaseClient = {
  initFirebase: (config: object) => void,
  incrementCounter: (plateNumber: string, counterKey: string) => Promise<number>,
  getPlateData: (plateNumber: string) => Promise<object>,
  getGlobalStats: (period: string) => Promise<object>,
  getLeaderboard: (type: string, period: string, limit: number) => Promise<array>,
  updateGlobalStats: (counterKey: string, period: string) => Promise<void>
};
```

### 3. Daily Limit Manager Module

**Purpose**: Enforce one-click-per-day limit using LocalStorage

**Key Functions**:
- `canIncrement(plateNumber, counterKey)`: Check if increment is allowed today
- `recordIncrement(plateNumber, counterKey)`: Store increment timestamp
- `isNewDay(timestamp)`: Check if stored timestamp is from previous day (KST)
- `getKSTDate()`: Get current date in KST timezone

**Interface**:
```javascript
const DailyLimitManager = {
  canIncrement: (plateNumber: string, counterKey: string) => boolean,
  recordIncrement: (plateNumber: string, counterKey: string) => void,
  isNewDay: (timestamp: number) => boolean,
  getKSTDate: () => Date
};
```

**LocalStorage Key Format**: `safedrive_limit_{plateNumber}_{counterKey}_{YYYYMMDD}`

### 4. Chart Manager Module

**Purpose**: Handle Chart.js visualization and updates

**Key Functions**:
- `createChart(canvasElement, data)`: Initialize bar chart with plate data
- `updateChart(chartInstance, data)`: Update existing chart with new data
- `formatChartData(counters)`: Transform counter object into Chart.js format
- `createMonthlyTrendChart(canvasElement, trendData)`: Initialize monthly trend bar chart
- `updateMonthlyTrendChart(chartInstance, trendData)`: Update monthly trend chart with new data

**Interface**:
```javascript
const ChartManager = {
  createChart: (canvas: HTMLCanvasElement, data: object) => Chart,
  updateChart: (chart: Chart, data: object) => void,
  formatChartData: (counters: object) => object,
  createMonthlyTrendChart: (canvas: HTMLCanvasElement, trendData: object) => Chart,
  updateMonthlyTrendChart: (chart: Chart, trendData: object) => void,
  destroyChart: (chart: Chart) => void
};
```

**Chart Configuration**:
- Type: Horizontal Bar Chart (for counter categories)
- Categories: 고장수리 (Repair), 안전운전 (Safety), 감사 (Thanks), 좋아요 (Likes)
- Colors: Category-specific (red for safety warnings, green for thanks, blue for likes, yellow for repairs)
- Responsive: true
- Animation: 300ms

**Monthly Trend Chart Configuration**:
- Type: Vertical Bar Chart
- X-axis: Last 12 months (YYYY-MM format)
- Y-axis: Total increment count
- Color: Single color (blue)
- Responsive: true
- Animation: 300ms

### 5. UI Controller Module

**Purpose**: Manage DOM manipulation, event handling, and user interactions

**Key Functions**:
- `renderPlateResults(plateNumber, data)`: Display plate data and chart
- `renderLeaderboard(type, period, data)`: Display leaderboard table
- `renderGlobalStats(stats)`: Display global statistics cards
- `showNotification(message, type)`: Display toast notification
- `showLoading()` / `hideLoading()`: Toggle loading indicator

**Interface**:
```javascript
const UIController = {
  renderPlateResults: (plateNumber: string, data: object) => void,
  renderLeaderboard: (type: string, period: string, data: array) => void,
  renderGlobalStats: (stats: object) => void,
  showNotification: (message: string, type: string) => void,
  showLoading: () => void,
  hideLoading: () => void,
  attachEventListeners: () => void
};
```

### 6. Leaderboard Calculator Module

**Purpose**: Calculate rankings and scores for leaderboards

**Key Functions**:
- `calculateBestDriverScore(plateData)`: Calculate score (감사 - 안전운전)
- `rankPlates(plates, scoreFunction)`: Sort and rank plates
- `filterByPeriod(plates, period)`: Filter plates by time period (KST)

**Interface**:
```javascript
const LeaderboardCalculator = {
  calculateBestDriverScore: (plateData: object) => number,
  calculateMostLikedScore: (plateData: object) => number,
  rankPlates: (plates: array, scoreFunction: function) => array,
  filterByPeriod: (plates: array, period: string) => array
};
```

### 7. Monthly Trend Tracker Module

**Purpose**: Track and retrieve monthly increment data for trend visualization

**Key Functions**:
- `recordMonthlyIncrement(plateNumber, counterKey, date)`: Store increment date data (YYYY-MM-DD format only)
- `getMonthlyTrends(plateNumber, months)`: Fetch increment counts grouped by month for the last N months
- `aggregateByMonth(incrementDates)`: Group increment dates by month and count occurrences
- `getLast12Months()`: Generate array of last 12 month labels in KST

**Interface**:
```javascript
const MonthlyTrendTracker = {
  recordMonthlyIncrement: (plateNumber: string, counterKey: string, date: string) => Promise<void>,
  getMonthlyTrends: (plateNumber: string, months: number) => Promise<object>,
  aggregateByMonth: (incrementDates: array) => object,
  getLast12Months: () => array
};
```

### 8. Validator Module

**Purpose**: Validate user inputs and data formats

**Key Functions**:
- `validatePlateNumber(input)`: Validate Korean plate format
- `sanitizePlateNumber(input)`: Clean and normalize plate input

**Interface**:
```javascript
const Validator = {
  validatePlateNumber: (input: string) => boolean,
  sanitizePlateNumber: (input: string) => string,
  PLATE_REGEX: /^(\d{2,3}[가-힣]\d{4})$/
};
```

## Data Models

### Plate Data Model

```javascript
{
  plateNumber: "09루3363",
  counters: {
    // 고장수리 (Repair) category
    headlight_broken: 5,
    taillight_broken: 3,
    tire_pressure: 2,
    fuel_cap_open: 1,
    
    // 안전운전 (Safety Warning) category
    dangerous_driving: 4,
    drowsy_driving: 2,
    keep_distance: 6,
    use_blinker: 8,
    no_phone: 3,
    halmanghaanj: 12,
    
    // 감사 (Thanks) category
    thank_you: 25,
    good_manners: 18,
    
    // 좋아요 (Likes) category
    likes: 156
  },
  lastUpdated: 1736995200000,
  monthlyIncrements: {
    // Stores dates of increments (YYYY-MM-DD format only, no time data)
    headlight_broken: ["2024-11-15", "2024-11-20", "2024-12-05"],
    taillight_broken: ["2024-10-12", "2024-11-08"],
    // ... other counters
  }
}
```

### Monthly Trend Data Model

```javascript
{
  plateNumber: "09루3363",
  last12Months: ["2024-01", "2024-02", "2024-03", ..., "2024-12"],
  trendData: {
    "2024-01": 5,   // Total increments in January 2024
    "2024-02": 8,   // Total increments in February 2024
    "2024-03": 12,
    // ... up to current month
  }
}
```

### Firebase Database Schema

```
/
├── plates/
│   └── {plateNumber}/          // e.g., "09루3363"
│       ├── counters/
│       │   ├── headlight_broken: number
│       │   ├── taillight_broken: number
│       │   ├── tire_pressure: number
│       │   ├── fuel_cap_open: number
│       │   ├── dangerous_driving: number
│       │   ├── drowsy_driving: number
│       │   ├── keep_distance: number
│       │   ├── use_blinker: number
│       │   ├── no_phone: number
│       │   ├── halmanghaanj: number
│       │   ├── thank_you: number
│       │   ├── good_manners: number
│       │   └── likes: number
│       ├── monthlyIncrements/
│       │   ├── headlight_broken/
│       │   │   └── {YYYY-MM-DD}: true    // Date only, no time data
│       │   ├── taillight_broken/
│       │   │   └── {YYYY-MM-DD}: true
│       │   └── ... (for each counter key)
│       └── lastUpdated: timestamp
│
├── global/
│   ├── daily/
│   │   └── {YYYYMMDD}/
│   │       └── {counterKey}: number
│   ├── weekly/
│   │   └── {YYYY-WW}/
│   │       └── {counterKey}: number
│   ├── monthly/
│   │   └── {YYYY-MM}/
│   │       └── {counterKey}: number
│   ├── yearly/
│   │   └── {YYYY}/
│   │       └── {counterKey}: number
│   └── allTime/
│       └── {counterKey}: number
│
└── leaderboards/
    ├── bestDrivers/
    │   ├── daily/
    │   │   └── {YYYYMMDD}/
    │   │       └── [array of {plate, score, thanks, safety}]
    │   ├── weekly/
    │   ├── monthly/
    │   ├── yearly/
    │   └── allTime/
    └── mostLiked/
        ├── daily/
        ├── weekly/
        ├── monthly/
        ├── yearly/
        └── allTime/
```

### Counter Key Mapping

```javascript
const COUNTER_KEYS = {
  // 고장수리 category
  '전조등 고장': 'headlight_broken',
  '후미등 고장': 'taillight_broken',
  '타이어 공기압 점검': 'tire_pressure',
  '연료캡 열림': 'fuel_cap_open',
  
  // 안전운전 category
  '운행이 위험해요': 'dangerous_driving',
  '졸음 운전이 걱정되요': 'drowsy_driving',
  '안전거리 좀 확보해 주세요': 'keep_distance',
  '방향 지시등(깜빡이) 좀 켜 주세요': 'use_blinker',
  '운전 중 스마트폰 사용하지 마세요': 'no_phone',
  '할많하않': 'halmanghaanj',
  
  // 감사 category
  '고맙습니다': 'thank_you',
  '운전 매너가 좋아요': 'good_manners',
  
  // 좋아요 category
  '좋아요': 'likes'
};

const CATEGORIES = {
  repair: ['headlight_broken', 'taillight_broken', 'tire_pressure', 'fuel_cap_open'],
  safety: ['dangerous_driving', 'drowsy_driving', 'keep_distance', 'use_blinker', 'no_phone', 'halmanghaanj'],
  thanks: ['thank_you', 'good_manners'],
  likes: ['likes']
};
```

### Leaderboard Entry Model

```javascript
// Best Drivers Entry
{
  rank: 1,
  plateNumber: "09루3363",
  score: 31,           // thanks_total - safety_total
  thanksCount: 43,     // thank_you + good_manners
  safetyCount: 12,     // sum of all safety category counters
  lastUpdated: 1736995200000
}

// Most Liked Entry
{
  rank: 1,
  plateNumber: "12가3456",
  likesCount: 156,
  lastUpdated: 1736995200000
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Plate number validation consistency
*For any* string input to the search function, the validation result should be consistent with the regex pattern /^(\d{2,3}[가-힣]\d{4})$/, and invalid inputs should never result in navigation.
**Validates: Requirements 1.2, 1.4**

### Property 2: Counter increment atomicity
*For any* counter increment operation, the Firebase transaction should either succeed completely (incrementing the value by exactly 1) or fail completely (leaving the value unchanged), never resulting in partial updates or race conditions.
**Validates: Requirements 2.1, 10.1**

### Property 3: Daily limit enforcement
*For any* plate-counter combination, if a user has already incremented that counter today (based on KST), subsequent attempts should be rejected, and the counter value should remain unchanged.
**Validates: Requirements 2.3, 3.1, 3.2, 3.3**

### Property 4: Daily limit reset at midnight KST
*For any* stored increment timestamp from a previous day (based on KST timezone), the daily limit check should allow a new increment, treating it as the first increment of the new day.
**Validates: Requirements 2.4, 3.4**

### Property 5: Chart data synchronization
*For any* counter increment that succeeds, the displayed chart and numeric values should update to reflect the new counter value without requiring a page reload.
**Validates: Requirements 2.2, 4.4**

### Property 6: Zero-state handling
*For any* plate number that has never received feedback, fetching the plate data should return an object with all counter values initialized to zero.
**Validates: Requirements 4.5**

### Property 7: Best driver score calculation
*For any* plate with counter data, the best driver score should always equal the sum of all "감사" category counters minus the sum of all "안전운전" category counters.
**Validates: Requirements 5.2**

### Property 8: Leaderboard ranking order
*For any* leaderboard (best drivers or most liked), entries should be sorted in descending order by their respective score, with rank 1 having the highest score.
**Validates: Requirements 5.2, 5.3, 6.2**

### Property 9: Time period filtering accuracy
*For any* leaderboard with a selected time period (daily, weekly, monthly, yearly, all-time), only plates with lastUpdated timestamps within that period (based on KST) should be included in the results.
**Validates: Requirements 5.5, 6.5**

### Property 10: URL parsing consistency
*For any* valid plate page URL (either /plate.html/09루3363 or /plate.html?plate=09루3363), the router should extract the same plate number and load the same data.
**Validates: Requirements 1.5, 8.1, 8.2**

### Property 11: Share URL format
*For any* plate page, the generated share URL should contain the plate number in a clean, readable format that can be parsed back to load the same plate data.
**Validates: Requirements 8.3, 8.4**

### Property 12: Global statistics aggregation
*For any* counter increment on any plate, the corresponding global counter for all applicable time periods (daily, weekly, monthly, yearly, all-time) should also increment by exactly 1.
**Validates: Requirements 7.3, 10.4**

### Property 13: LocalStorage isolation
*For any* daily limit check, the system should only read from LocalStorage and never set cookies, ensuring privacy compliance.
**Validates: Requirements 3.5, 11.2, 11.4**

### Property 14: Mobile touch target sizing
*For any* interactive element (buttons, links, inputs) on mobile viewports, the tap target size should be at least 44x44 pixels to ensure touch-friendly interaction.
**Validates: Requirements 9.1**

### Property 15: Transaction failure handling
*For any* Firebase transaction that fails (due to network issues or conflicts), the UI should display an error notification and the counter value should remain unchanged.
**Validates: Requirements 2.1, 10.1**

### Property 16: Date-only storage for monthly increments
*For any* counter increment, the stored date should be in YYYY-MM-DD format without any time, minute, or second data.
**Validates: Requirements 15.1**

### Property 17: Monthly aggregation accuracy
*For any* set of increment dates for a plate, grouping by month should produce counts that equal the number of dates within each month boundary (based on KST).
**Validates: Requirements 15.2, 15.4**

### Property 18: 12-month trend completeness
*For any* plate, the monthly trend data should include all 12 months from the current month back, with zero values for months without increments.
**Validates: Requirements 15.5**

## Error Handling

### Client-Side Errors

1. **Invalid Plate Number Input**
   - Detection: Regex validation fails
   - Response: Display inline error message "올바른 번호판 형식이 아닙니다 (예: 09루3363)"
   - Recovery: Keep user on current page, focus on input field

2. **Daily Limit Reached**
   - Detection: LocalStorage check returns existing timestamp for today
   - Response: Display toast notification "오늘은 이미 이 항목에 투표하셨습니다"
   - Recovery: Disable button temporarily, show visual feedback

3. **Network Failure**
   - Detection: Firebase operation promise rejection
   - Response: Display error notification "네트워크 오류가 발생했습니다. 다시 시도해 주세요"
   - Recovery: Allow retry, maintain current state

4. **Firebase Transaction Conflict**
   - Detection: Transaction returns false (conflict detected)
   - Response: Automatically retry up to 3 times
   - Recovery: If all retries fail, show error message

5. **Chart Rendering Failure**
   - Detection: Chart.js throws error or canvas not found
   - Response: Display raw numeric data only, log error to console
   - Recovery: Graceful degradation to table view

6. **LocalStorage Quota Exceeded**
   - Detection: LocalStorage.setItem() throws QuotaExceededError
   - Response: Clear old entries (older than 7 days), retry
   - Recovery: If still fails, disable daily limit tracking (allow all clicks)

### Firebase-Side Errors

1. **Database Connection Failure**
   - Detection: Firebase initialization fails or connection timeout
   - Response: Display "데이터베이스 연결 실패" message
   - Recovery: Provide retry button, check Firebase config

2. **Permission Denied**
   - Detection: Firebase returns PERMISSION_DENIED error
   - Response: Display "접근 권한이 없습니다" message
   - Recovery: Check Firebase security rules, contact administrator

3. **Data Not Found**
   - Detection: Firebase snapshot.exists() returns false
   - Response: Initialize with zero values, proceed normally
   - Recovery: Create new plate entry on first increment

### User Input Errors

1. **Empty Search Input**
   - Detection: Input value is empty or whitespace only
   - Response: Display "번호판을 입력해 주세요" message
   - Recovery: Focus on input field, prevent form submission

2. **Malformed URL**
   - Detection: URL parsing returns null or invalid plate
   - Response: Redirect to landing page with error message
   - Recovery: Allow user to search again

### Error Logging Strategy

- **Console Logging**: All errors logged to browser console with context
- **User-Facing Messages**: Korean language, friendly tone, actionable guidance
- **No External Tracking**: No error reporting to external services (privacy)
- **Graceful Degradation**: Always provide fallback functionality

## Testing Strategy

### Unit Testing

We will use **Vitest** as the unit testing framework for its speed, modern API, and excellent ES6+ support.

**Unit Test Coverage**:
- Validator module: Test plate number regex against valid and invalid inputs
- Daily Limit Manager: Test KST date calculations, timestamp comparisons
- Leaderboard Calculator: Test score calculations with various counter combinations
- Router: Test URL parsing with different formats (path, query string, hash)
- Chart Manager: Test data formatting for Chart.js

**Example Unit Tests**:
```javascript
// Validator tests
describe('Validator.validatePlateNumber', () => {
  test('valid plate formats', () => {
    expect(Validator.validatePlateNumber('09루3363')).toBe(true);
    expect(Validator.validatePlateNumber('123가4567')).toBe(true);
  });
  
  test('invalid plate formats', () => {
    expect(Validator.validatePlateNumber('1루3363')).toBe(false);
    expect(Validator.validatePlateNumber('09a3363')).toBe(false);
  });
});

// Daily Limit Manager tests
describe('DailyLimitManager.isNewDay', () => {
  test('timestamp from yesterday returns true', () => {
    const yesterday = Date.now() - (24 * 60 * 60 * 1000);
    expect(DailyLimitManager.isNewDay(yesterday)).toBe(true);
  });
  
  test('timestamp from today returns false', () => {
    const now = Date.now();
    expect(DailyLimitManager.isNewDay(now)).toBe(false);
  });
});
```

### Property-Based Testing

We will use **fast-check** as the property-based testing library for JavaScript, which provides excellent random data generation and shrinking capabilities.

**Configuration**: Each property test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Property Test Tagging**: Each property-based test will include a comment tag in this exact format:
```javascript
// **Feature: safedrive-webapp, Property 1: Plate number validation consistency**
```

**Property Test Coverage**:

**Property 1: Plate number validation consistency**
- Generate random strings (valid and invalid plate formats)
- Verify validation result matches regex pattern
- Verify invalid inputs never trigger navigation
- **Feature: safedrive-webapp, Property 1: Plate number validation consistency**

**Property 2: Counter increment atomicity**
- Generate random plate numbers and counter keys
- Simulate concurrent increments
- Verify final value equals initial + number of successful increments
- **Feature: safedrive-webapp, Property 2: Counter increment atomicity**

**Property 3: Daily limit enforcement**
- Generate random plate-counter combinations
- Record increment, attempt second increment same day
- Verify second increment is rejected
- **Feature: safedrive-webapp, Property 3: Daily limit enforcement**

**Property 7: Best driver score calculation**
- Generate random counter values for all categories
- Calculate score using formula
- Verify score = sum(thanks) - sum(safety)
- **Feature: safedrive-webapp, Property 7: Best driver score calculation**

**Property 8: Leaderboard ranking order**
- Generate random array of plates with scores
- Apply ranking function
- Verify descending order and correct rank numbers
- **Feature: safedrive-webapp, Property 8: Leaderboard ranking order**

**Property 10: URL parsing consistency**
- Generate random valid plate numbers
- Create URLs in both formats (path and query string)
- Verify both formats extract the same plate number
- **Feature: safedrive-webapp, Property 10: URL parsing consistency**

**Property 12: Global statistics aggregation**
- Generate random counter increments
- Track global counters across time periods
- Verify all periods increment correctly
- **Feature: safedrive-webapp, Property 12: Global statistics aggregation**

### Integration Testing

**Firebase Integration Tests**:
- Test actual Firebase connection and authentication
- Test transaction operations with real database
- Test concurrent writes from multiple clients
- Test security rules enforcement

**End-to-End User Flows**:
- Landing page → Search → Plate page → Increment counter → View updated chart
- Landing page → Click leaderboard entry → View plate details
- Plate page → Share button → Copy URL → Paste in new tab → Verify same data loads

### Manual Testing Checklist

**Mobile Testing**:
- Test on iOS Safari, Android Chrome
- Verify touch targets are appropriately sized
- Test landscape and portrait orientations
- Verify keyboard behavior for inputs

**Browser Compatibility**:
- Chrome, Firefox, Safari, Edge (latest versions)
- Test History API fallback for older browsers

**Performance Testing**:
- Measure page load time on 3G connection
- Verify chart renders within 300ms
- Test with large counter values (10,000+)

**Privacy Testing**:
- Verify no cookies are set (except LocalStorage)
- Verify no personal data is transmitted to Firebase
- Test in incognito/private browsing mode

## Security Considerations

### Firebase Security Rules

```json
{
  "rules": {
    "plates": {
      "$plateNumber": {
        ".read": true,
        ".write": "newData.exists()",
        "counters": {
          "$counterKey": {
            ".validate": "newData.isNumber() && newData.val() >= 0"
          }
        },
        "lastUpdated": {
          ".validate": "newData.isNumber()"
        }
      }
    },
    "global": {
      ".read": true,
      ".write": true
    },
    "leaderboards": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Client-Side Security

1. **Input Sanitization**: All user inputs validated and sanitized before use
2. **XSS Prevention**: No innerHTML usage with user data, only textContent
3. **HTTPS Only**: All Firebase connections over HTTPS
4. **No Sensitive Data**: No API keys or secrets in client code (Firebase config is public)
5. **Rate Limiting**: Daily limit prevents abuse (client-side, can be enhanced server-side)

### Privacy Protection

1. **No User Tracking**: No analytics, no cookies, no fingerprinting
2. **Anonymous Usage**: No login, no user IDs, no session tracking
3. **LocalStorage Only**: Daily limits stored locally, never transmitted
4. **Public Data Only**: Plate numbers are public information in Korea
5. **No Free Text**: Prevents defamation and abuse

## Performance Optimization

### Loading Performance

1. **CDN Resources**: Firebase SDK and Chart.js loaded from CDN
2. **Minification**: CSS and JS minified for production
3. **Lazy Loading**: Chart.js loaded only on plate page
4. **Resource Hints**: DNS prefetch for Firebase domains
5. **Compression**: Netlify automatic gzip/brotli compression

### Runtime Performance

1. **Debouncing**: Search input debounced to prevent excessive validation
2. **Caching**: Plate data cached in memory during session
3. **Efficient DOM Updates**: Minimal reflows, batch DOM operations
4. **Chart Reuse**: Update existing chart instead of recreating
5. **Firebase Indexing**: Proper indexes for leaderboard queries

### Mobile Performance

1. **Mobile-First CSS**: Smaller base styles, desktop enhancements
2. **Touch Optimization**: CSS touch-action for better scrolling
3. **Reduced Animations**: Respect prefers-reduced-motion
4. **Optimized Images**: SVG icons, compressed assets
5. **Service Worker**: (Future enhancement) Offline support

## Deployment Strategy

### GitHub Repository Structure

```
safedrive-webapp/
├── index.html
├── plate.html
├── styles.css
├── script.js
├── assets/
│   ├── logo.svg
│   └── icons/
├── README.md
├── .gitignore
└── netlify.toml (optional configuration)
```

### Netlify Configuration

**netlify.toml**:
```toml
[build]
  publish = "."
  
[[redirects]]
  from = "/plate.html/*"
  to = "/plate.html"
  status = 200
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"
```

### Continuous Deployment

1. Push to GitHub main branch
2. Netlify webhook triggers build
3. Static files deployed to CDN
4. DNS updates automatically
5. HTTPS certificate auto-renewed

### Environment Variables

Firebase configuration will be hardcoded in script.js for MVP. For production:
- Consider using Netlify environment variables
- Inject config during build process
- Keep Firebase security rules strict

### Rollback Strategy

1. Netlify maintains deployment history
2. One-click rollback to previous version
3. GitHub tags for version tracking
4. Test deployments on preview URLs before production

## Future Enhancements

1. **Server-Side Leaderboard Computation**: Use Firebase Cloud Functions to pre-compute leaderboards
2. **Real-Time Updates**: Use Firebase onValue listeners for live counter updates
3. **Progressive Web App**: Add service worker for offline support
4. **Advanced Analytics**: Privacy-respecting usage statistics
5. **Moderation Tools**: Admin interface for content moderation
6. **Multi-Language Support**: English, Japanese translations
7. **Dark Mode**: User preference for dark theme
8. **Export Data**: Allow users to download plate statistics
9. **QR Code Sharing**: Generate QR codes for plate pages
10. **Voice Input**: Speech-to-text for plate number entry
