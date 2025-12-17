# Requirements Document

## Introduction

SafeDrive is an anonymous web application designed for Korean drivers to report and check vehicle safety issues using license plate numbers. The system allows users to increment predefined safety, warning, and positive feedback counters without requiring user accounts or collecting personal data. The application prioritizes privacy, mobile responsiveness, and ease of use while maintaining a positive community-focused approach to road safety.

## Glossary

- **SafeDrive System**: The complete web application including frontend interface and Firebase backend
- **Plate Number**: Korean vehicle license plate identifier (format: 2-3 digits + Korean character + 4 digits, e.g., "09루3363")
- **Counter**: A numeric value tracking specific feedback types for a plate number
- **Category**: A grouping of related counters (고장수리/Repair, 안전운전/Safety Warning, 감사/Thanks, 좋아요/Likes)
- **Daily Limit**: A restriction allowing one increment per counter label per user per day
- **Leaderboard**: A ranked list of plate numbers based on specific scoring criteria
- **Firebase Realtime Database**: The cloud-based NoSQL database storing all counter data
- **KST**: Korea Standard Time (UTC+9)

## Requirements

### Requirement 1: Anonymous Plate Search and Navigation

**User Story:** As a driver, I want to search for any license plate number anonymously, so that I can view safety feedback without creating an account or sharing personal information.

#### Acceptance Criteria

1. WHEN a user visits the landing page, THE SafeDrive System SHALL display a search input field with placeholder text "번호판 조회 예: 09루3363"
2. WHEN a user enters a plate number and clicks the search button, THE SafeDrive System SHALL validate the format against the pattern /^(\d{2,3}[가-힣]\d{4})$/
3. WHEN a valid plate number is submitted, THE SafeDrive System SHALL navigate to the URL path /plate.html/[plate_number]
4. WHEN an invalid plate number is submitted, THE SafeDrive System SHALL display an error message and prevent navigation
5. WHEN a user accesses a plate page URL directly, THE SafeDrive System SHALL parse the plate number from the URL path and load the corresponding data

### Requirement 2: Counter Increment System

**User Story:** As a driver, I want to send feedback by clicking predefined counter buttons, so that I can contribute safety information about specific vehicles.

#### Acceptance Criteria

1. WHEN a user clicks a counter button on a plate page, THE SafeDrive System SHALL increment the corresponding counter value in Firebase Realtime Database using a transaction
2. WHEN a counter increment succeeds, THE SafeDrive System SHALL update the displayed counter value and chart immediately without page reload
3. WHEN a user attempts to click the same counter button twice in one day, THE SafeDrive System SHALL prevent the increment and display a message indicating the daily limit has been reached
4. WHEN the system time crosses midnight KST, THE SafeDrive System SHALL reset the daily limit tracking for all counter buttons
5. THE SafeDrive System SHALL provide counter buttons for all predefined labels: "전조등 고장", "후미등 고장", "타이어 공기압 점검", "연료캡 열림", "운행이 위험해요", "졸음 운전이 걱정되요", "안전거리 좀 확보해 주세요", "방향 지시등(깜빡이) 좀 켜 주세요", "운전 중 스마트폰 사용하지 마세요", "할많하않", "고맙습니다", "운전 매너가 좋아요", "좋아요"

### Requirement 3: Daily Limit Enforcement

**User Story:** As a system administrator, I want to limit users to one increment per counter per day, so that the feedback system remains fair and prevents abuse.

#### Acceptance Criteria

1. WHEN a user clicks a counter button, THE SafeDrive System SHALL check LocalStorage for a record of that plate-counter combination for the current day
2. WHEN no record exists for the current day, THE SafeDrive System SHALL allow the increment and store a timestamp in LocalStorage
3. WHEN a record exists for the current day, THE SafeDrive System SHALL prevent the increment and display a notification
4. WHEN the system detects the stored timestamp is from a previous day based on KST, THE SafeDrive System SHALL allow the increment and update the timestamp
5. THE SafeDrive System SHALL use LocalStorage exclusively for daily limit tracking without setting cookies

### Requirement 4: Real-time Data Visualization

**User Story:** As a driver, I want to see visual charts and statistics for each plate number, so that I can quickly understand the feedback patterns.

#### Acceptance Criteria

1. WHEN a plate page loads, THE SafeDrive System SHALL fetch all counter data for that plate from Firebase Realtime Database
2. WHEN counter data is received, THE SafeDrive System SHALL render a bar chart using Chart.js grouped by categories (고장수리, 안전운전, 감사, 좋아요)
3. WHEN counter data is received, THE SafeDrive System SHALL display raw numeric values below each category
4. WHEN a counter is incremented, THE SafeDrive System SHALL update both the chart and numeric displays without page reload
5. WHEN no data exists for a plate, THE SafeDrive System SHALL display zero values for all counters

### Requirement 5: Best Drivers Leaderboard

**User Story:** As a driver, I want to see a ranking of the best drivers, so that I can recognize positive driving behavior in the community.

#### Acceptance Criteria

1. WHEN a user views the landing page, THE SafeDrive System SHALL display a "베스트 드라이버 랭킹" section with time period tabs (오늘, 이번주, 이번달, 올해, 역대)
2. WHEN a user selects a time period tab, THE SafeDrive System SHALL fetch and display the top 10 plate numbers ranked by score calculation: Total "감사" category count minus Total "안전운전" category count
3. WHEN displaying leaderboard entries, THE SafeDrive System SHALL show rank number, plate number, score, "감사" count, and "안전운전" count
4. WHEN a user clicks a plate number in the leaderboard, THE SafeDrive System SHALL navigate to that plate's detail page
5. THE SafeDrive System SHALL update leaderboard data based on the selected time period using KST timezone boundaries

### Requirement 6: Most Liked Plates Leaderboard

**User Story:** As a driver, I want to see which plates have received the most likes, so that I can identify popular or well-regarded drivers.

#### Acceptance Criteria

1. WHEN a user views the landing page, THE SafeDrive System SHALL display an "인기 번호판 TOP 10" section with time period tabs (오늘, 이번주, 이번달, 올해, 역대)
2. WHEN a user selects a time period tab, THE SafeDrive System SHALL fetch and display the top 10 plate numbers ranked by "좋아요" count
3. WHEN displaying most liked entries, THE SafeDrive System SHALL show rank number, plate number, and "좋아요" count
4. WHEN a user clicks a plate number in the most liked list, THE SafeDrive System SHALL navigate to that plate's detail page
5. THE SafeDrive System SHALL update most liked data based on the selected time period using KST timezone boundaries

### Requirement 7: Global Statistics Display

**User Story:** As a visitor, I want to see cumulative statistics across all plates, so that I can understand the overall usage and impact of the platform.

#### Acceptance Criteria

1. WHEN a user views the landing page, THE SafeDrive System SHALL display global cumulative counters for each feedback type
2. WHEN displaying global statistics, THE SafeDrive System SHALL format large numbers with Korean notation (e.g., "12,345회")
3. WHEN global counters are updated by any user action, THE SafeDrive System SHALL reflect the changes on the landing page for subsequent visitors
4. THE SafeDrive System SHALL fetch global statistics from Firebase Realtime Database on landing page load
5. THE SafeDrive System SHALL display statistics in card format with clear labels for each counter type

### Requirement 8: URL Sharing and Clean URLs

**User Story:** As a user, I want to share specific plate pages with others using clean URLs, so that the links are easy to read and share.

#### Acceptance Criteria

1. WHEN a plate page is loaded, THE SafeDrive System SHALL use the History API to maintain clean URL format /plate.html/[plate_number]
2. WHEN the History API is unavailable, THE SafeDrive System SHALL fallback to query string format /plate.html?plate=[plate_number]
3. WHEN a user clicks the share button on a plate page, THE SafeDrive System SHALL use the Web Share API if available
4. WHEN the Web Share API is unavailable, THE SafeDrive System SHALL copy the current plate page URL to clipboard
5. WHEN a user clicks the site share button on the landing page, THE SafeDrive System SHALL share or copy the landing page URL

### Requirement 9: Mobile-Responsive Design

**User Story:** As a mobile user, I want the app to work seamlessly on my phone, so that I can use it while parked or as a passenger.

#### Acceptance Criteria

1. WHEN the SafeDrive System is accessed on a mobile device, THE SafeDrive System SHALL render all interface elements with touch-friendly sizes (minimum 44x44px tap targets)
2. WHEN the viewport width is below 768px, THE SafeDrive System SHALL apply mobile-specific layouts using CSS flexbox and grid
3. WHEN a user interacts with form inputs on mobile, THE SafeDrive System SHALL display appropriate keyboard types (numeric for plate numbers)
4. WHEN charts are displayed on mobile, THE SafeDrive System SHALL scale appropriately to fit the screen width
5. THE SafeDrive System SHALL load and render within 3 seconds on 3G mobile connections

### Requirement 10: Firebase Data Persistence

**User Story:** As a system administrator, I want all counter data stored reliably in Firebase, so that user contributions are never lost.

#### Acceptance Criteria

1. WHEN a counter is incremented, THE SafeDrive System SHALL use Firebase transaction operations to ensure atomic updates
2. WHEN storing plate data, THE SafeDrive System SHALL organize counters under the path /plates/[plate_number]/counters/[counter_key]
3. WHEN updating a plate's data, THE SafeDrive System SHALL store a lastUpdated timestamp in milliseconds
4. WHEN storing global statistics, THE SafeDrive System SHALL maintain separate nodes for daily, weekly, monthly, yearly, and all-time periods
5. WHEN storing leaderboard data, THE SafeDrive System SHALL maintain separate nodes for bestDrivers and mostLiked under /leaderboards/

### Requirement 11: Privacy and Anonymous Usage

**User Story:** As a privacy-conscious user, I want to use the app without providing personal information, so that my identity remains protected.

#### Acceptance Criteria

1. THE SafeDrive System SHALL NOT require user registration or login
2. THE SafeDrive System SHALL NOT set cookies except for essential functionality
3. THE SafeDrive System SHALL NOT collect or store IP addresses, device identifiers, or personal information
4. THE SafeDrive System SHALL use LocalStorage only for daily limit tracking with plate-counter-date keys
5. THE SafeDrive System SHALL display a privacy notice stating "익명 사용 - 개인정보 수집 없음"

### Requirement 12: Legal Compliance and Content Moderation

**User Story:** As a platform operator, I want to display legal notices and usage guidelines, so that users understand acceptable use and legal boundaries.

#### Acceptance Criteria

1. WHEN a user views any page, THE SafeDrive System SHALL display a notice "운전 중 사용 금지 – 안전 운전 우선"
2. WHEN a user views the plate page, THE SafeDrive System SHALL display notices "비방 없음 – 안전 목적만" and "악의적 사용 금지"
3. WHEN a user views the plate page, THE SafeDrive System SHALL display "공개 비방 금지 – 정보통신망법 제70조 준수"
4. THE SafeDrive System SHALL provide only predefined positive and safety-focused counter options
5. THE SafeDrive System SHALL NOT provide free-text input fields for user comments

### Requirement 13: Advertisement Integration Preparation

**User Story:** As a platform operator, I want to prepare for Google AdSense integration, so that the app can generate revenue while remaining free for users.

#### Acceptance Criteria

1. WHEN the landing page is rendered, THE SafeDrive System SHALL include a placeholder element for a bottom banner advertisement
2. WHEN the plate page is rendered, THE SafeDrive System SHALL include placeholder elements for top banner, mid-section, and bottom banner advertisements
3. WHEN advertisement placeholders are rendered, THE SafeDrive System SHALL reserve appropriate dimensions (320x50 for mobile, 728x90 for desktop)
4. THE SafeDrive System SHALL structure HTML to allow easy insertion of AdSense code without layout disruption
5. THE SafeDrive System SHALL ensure advertisement placeholders do not interfere with core functionality or user interactions

### Requirement 14: Performance and Loading

**User Story:** As a user, I want the app to load quickly and respond instantly, so that I can access information without delays.

#### Acceptance Criteria

1. WHEN a user accesses any page, THE SafeDrive System SHALL load all critical resources (HTML, CSS, JS) within 2 seconds on broadband connections
2. WHEN Firebase data is fetched, THE SafeDrive System SHALL display a loading indicator until data is received
3. WHEN a counter is incremented, THE SafeDrive System SHALL provide visual feedback within 100 milliseconds
4. THE SafeDrive System SHALL use CDN-hosted libraries (Firebase SDK, Chart.js) for optimal loading performance
5. THE SafeDrive System SHALL minify CSS and JavaScript files for production deployment

### Requirement 15: Monthly Increment Trend Tracking

**User Story:** As a driver, I want to see the monthly increment trend for each plate over the last 12 months, so that I can understand feedback patterns over time.

#### Acceptance Criteria

1. WHEN a counter is incremented, THE SafeDrive System SHALL store the date (year, month, day) of the increment without storing time, minute, or second data
2. WHEN a plate page loads, THE SafeDrive System SHALL fetch increment count data grouped by month for the last 12 months
3. WHEN displaying the monthly trend, THE SafeDrive System SHALL render a bar graph with months on the x-axis and increment counts on the y-axis
4. WHEN calculating monthly data, THE SafeDrive System SHALL use KST timezone to determine month boundaries
5. WHEN no increment data exists for a specific month, THE SafeDrive System SHALL display zero for that month in the graph

### Requirement 16: Deployment and Hosting

**User Story:** As a developer, I want to deploy the app via GitHub and Netlify, so that it is publicly accessible with reliable hosting.

#### Acceptance Criteria

1. WHEN the application is deployed, THE SafeDrive System SHALL serve all static files (HTML, CSS, JS, assets) from Netlify CDN
2. WHEN a user accesses the deployed URL, THE SafeDrive System SHALL load the landing page as the default route
3. WHEN the application is updated in the GitHub repository, THE SafeDrive System SHALL automatically redeploy via Netlify continuous deployment
4. THE SafeDrive System SHALL include Firebase configuration in the JavaScript code for database connectivity
5. THE SafeDrive System SHALL support HTTPS connections for all deployed pages
