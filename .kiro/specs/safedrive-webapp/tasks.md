# Implementation Plan

- [x] 1. Set up project structure and Firebase configuration





  - Create directory structure with index.html, plate.html, styles.css, script.js, and assets folder
  - Add Firebase SDK via CDN in HTML files
  - Add Chart.js library via CDN in plate.html
  - Create Firebase project and obtain configuration credentials
  - Initialize Firebase in script.js with configuration object
  - Set up basic HTML5 boilerplate with Korean language attribute
  - _Requirements: 10.1, 14.4, 15.4_

- [ ]* 1.1 Write property test for Firebase configuration
  - **Property: Firebase configuration validation**
  - **Validates: Requirements 15.4**

- [x] 2. Implement Validator module





  - Create Validator object with validatePlateNumber function
  - Implement Korean plate regex pattern /^(\d{2,3}[가-힣]\d{4})$/
  - Create sanitizePlateNumber function to clean and normalize input
  - Export Validator for use in other modules
  - _Requirements: 1.2, 1.4_

- [ ]* 2.1 Write property test for plate number validation
  - **Property 1: Plate number validation consistency**
  - **Validates: Requirements 1.2, 1.4**

- [x] 3. Implement Router module




  - Create Router object with URL parsing functions
  - Implement parsePlateFromURL to extract plate from /plate.html/09루3363 format
  - Add fallback to parse from query string ?plate=09루3363
  - Implement navigateToPlate function using History API
  - Add hash-based fallback for browsers without History API
  - Implement getCurrentPlate function
  - _Requirements: 1.3, 1.5, 8.1, 8.2_

- [ ]* 3.1 Write property test for URL parsing consistency
  - **Property 10: URL parsing consistency**
  - **Validates: Requirements 1.5, 8.1, 8.2**

- [x] 4. Implement Daily Limit Manager module





  - Create DailyLimitManager object with LocalStorage management
  - Implement getKSTDate function to get current date in Korea timezone (UTC+9)
  - Implement isNewDay function to compare timestamps with KST dates
  - Implement canIncrement function to check if increment is allowed today
  - Implement recordIncrement function to store timestamp in LocalStorage
  - Use key format: safedrive_limit_{plateNumber}_{counterKey}_{YYYYMMDD}
  - _Requirements: 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.1 Write property test for daily limit enforcement
  - **Property 3: Daily limit enforcement**
  - **Validates: Requirements 2.3, 3.1, 3.2, 3.3**

- [ ]* 4.2 Write property test for daily limit reset
  - **Property 4: Daily limit reset at midnight KST**
  - **Validates: Requirements 2.4, 3.4**

- [ ]* 4.3 Write property test for LocalStorage isolation
  - **Property 13: LocalStorage isolation**
  - **Validates: Requirements 3.5, 11.2, 11.4**

- [x] 5. Implement Firebase Client module





  - Create FirebaseClient object with database reference
  - Implement getPlateData function to fetch counters from /plates/{plateNumber}/counters
  - Implement incrementCounter function using Firebase transaction for atomic updates
  - Add lastUpdated timestamp update on each increment
  - Implement getGlobalStats function to fetch from /global/{period}
  - Implement updateGlobalStats function to increment global counters for all time periods
  - Implement getLeaderboard function with period filtering
  - Add error handling for network failures and transaction conflicts
  - _Requirements: 2.1, 4.1, 7.3, 7.4, 10.1, 10.2, 10.3, 10.4_

- [ ]* 5.1 Write property test for counter increment atomicity
  - **Property 2: Counter increment atomicity**
  - **Validates: Requirements 2.1, 10.1**

- [ ]* 5.2 Write property test for zero-state handling
  - **Property 6: Zero-state handling**
  - **Validates: Requirements 4.5**

- [ ]* 5.3 Write property test for global statistics aggregation
  - **Property 12: Global statistics aggregation**
  - **Validates: Requirements 7.3, 10.4**

- [x] 6. Implement counter key mapping and categories





  - Create COUNTER_KEYS object mapping Korean labels to database keys
  - Create CATEGORIES object grouping counters by category (repair, safety, thanks, likes)
  - Create helper function to get category for a counter key
  - Create helper function to get Korean label for a counter key
  - _Requirements: 2.5_

- [x] 7. Implement Leaderboard Calculator module





  - Create LeaderboardCalculator object with ranking functions
  - Implement calculateBestDriverScore function (sum of thanks - sum of safety)
  - Implement calculateMostLikedScore function (likes count)
  - Implement rankPlates function to sort and assign rank numbers
  - Implement filterByPeriod function using KST timezone boundaries
  - Add helper functions for period date ranges (today, this week, this month, this year, all time)
  - _Requirements: 5.2, 5.5, 6.2, 6.5_

- [ ]* 7.1 Write property test for best driver score calculation
  - **Property 7: Best driver score calculation**
  - **Validates: Requirements 5.2**

- [ ]* 7.2 Write property test for leaderboard ranking order
  - **Property 8: Leaderboard ranking order**
  - **Validates: Requirements 5.2, 5.3, 6.2**

- [ ]* 7.3 Write property test for time period filtering
  - **Property 9: Time period filtering accuracy**
  - **Validates: Requirements 5.5, 6.5**

- [x] 8. Implement Chart Manager module





  - Create ChartManager object with Chart.js integration
  - Implement formatChartData function to transform counters into Chart.js dataset format
  - Group data by categories (고장수리, 안전운전, 감사, 좋아요)
  - Implement createChart function to initialize horizontal bar chart
  - Configure chart with category-specific colors (red for safety, green for thanks, blue for likes, yellow for repairs)
  - Implement updateChart function to update existing chart without recreation
  - Implement destroyChart function for cleanup
  - Set responsive: true and animation duration to 300ms
  - _Requirements: 4.2, 4.3, 4.4_

- [ ]* 8.1 Write property test for chart data synchronization
  - **Property 5: Chart data synchronization**
  - **Validates: Requirements 2.2, 4.4**

- [x] 9. Build landing page HTML structure (index.html)




  - Create hero section with large header "SafeDrive: 익명으로 차량 안전을 공유하세요!"
  - Add warning notice "운전 중 사용 금지 – 안전 운전 우선"
  - Create search form with input (placeholder "번호판 조회 예: 09루3363") and submit button
  - Add "사이트 공유하기" button in hero section
  - Create "베스트 드라이버 랭킹" section with time period tabs (오늘, 이번주, 이번달, 올해, 역대)
  - Add table structure for top 10 best drivers (rank, plate, score, thanks count, safety count)
  - Create "인기 번호판 TOP 10" section with time period tabs
  - Add table structure for top 10 most liked (rank, plate, likes count)
  - Create global statistics section with card layout for each counter type
  - Add fun content section with app explanation
  - Add legal notices section
  - Add privacy notice "익명 사용 - 개인정보 수집 없음"
  - Add advertisement placeholder at bottom (320x50 mobile, 728x90 desktop)
  - Include meta tags for mobile viewport and Korean language
  - _Requirements: 1.1, 5.1, 6.1, 7.1, 11.5, 12.1, 13.1_

- [x] 10. Build plate page HTML structure (plate.html)





  - Create search bar at top (pre-filled with current plate)
  - Add large plate number header display
  - Create canvas element for Chart.js bar chart
  - Add numeric counter display section below chart (grouped by category)
  - Create "고장수리" category section with 4 counter buttons
  - Create "안전운전" category section with 6 counter buttons
  - Create "감사" category section with 2 counter buttons
  - Create "좋아요" section with large heart button and count display
  - Add "이 번호판 결과 공유하기" share button
  - Add notices: "비방 없음 – 안전 목적만", "악의적 사용 금지", "공개 비방 금지 – 정보통신망법 제70조 준수"
  - Add warning notice "운전 중 사용 금지 – 안전 운전 우선"
  - Add advertisement placeholders (top banner, mid-section, bottom banner)
  - Add loading indicator element (hidden by default)
  - Include meta tags for mobile viewport and Korean language
  - _Requirements: 2.5, 12.2, 12.3, 13.2_

- [x] 11. Implement base CSS styles and responsive layout




  - Create CSS variables for colors, spacing, and breakpoints
  - Implement mobile-first base styles with system font stack
  - Create responsive grid layout for landing page sections
  - Style hero section with prominent search bar
  - Style leaderboard tables with alternating row colors
  - Style global statistics cards with flexbox layout
  - Create button styles with minimum 44x44px touch targets
  - Style counter buttons grouped by category with category colors
  - Implement responsive breakpoints (mobile < 768px, desktop >= 768px)
  - Add media queries for mobile-specific layouts
  - Style loading indicator with spinner animation
  - Style toast notifications for user feedback
  - Ensure chart container is responsive and scales to viewport width
  - Add CSS for advertisement placeholder dimensions
  - _Requirements: 9.1, 9.2, 9.4, 13.3_

- [ ]* 11.1 Write property test for mobile touch target sizing
  - **Property 14: Mobile touch target sizing**
  - **Validates: Requirements 9.1**

- [x] 12. Implement UI Controller module




  - Create UIController object with DOM manipulation functions
  - Implement showLoading and hideLoading functions
  - Implement showNotification function for toast messages (success, error, info)
  - Implement renderPlateResults function to display plate data and create chart
  - Implement renderLeaderboard function to populate leaderboard tables
  - Implement renderGlobalStats function to display statistics cards with Korean number formatting
  - Implement updateCounterDisplay function to update specific counter values
  - Implement attachEventListeners function for all interactive elements
  - Add event delegation for counter buttons
  - Add tab switching logic for leaderboard time periods
  - _Requirements: 4.2, 4.3, 5.3, 6.3, 7.2_

- [x] 13. Implement landing page functionality




  - Initialize Router on page load
  - Attach event listener to search form submission
  - Validate plate number input on form submit
  - Navigate to plate page on valid submission using Router.navigateToPlate
  - Display error message on invalid submission
  - Fetch and render global statistics on page load
  - Fetch and render best drivers leaderboard (default to "역대" tab)
  - Fetch and render most liked leaderboard (default to "역대" tab)
  - Implement tab switching for leaderboard time periods
  - Re-fetch and re-render leaderboard data when tab changes
  - Make plate numbers in leaderboards clickable (navigate to plate page)
  - Implement site share button functionality (Web Share API with clipboard fallback)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1, 7.4, 8.5_

- [x] 14. Implement plate page functionality





  - Initialize Router on page load and parse plate number from URL
  - Display error and redirect to landing if plate number is invalid
  - Pre-fill search bar with current plate number
  - Fetch plate data from Firebase on page load
  - Display loading indicator during data fetch
  - Render plate number header, chart, and counter values when data loads
  - Handle zero-state (new plate with no data) by displaying all zeros
  - Attach event listeners to all counter buttons
  - Implement counter button click handler with daily limit check
  - Show notification if daily limit reached for that counter
  - Call Firebase incrementCounter on allowed clicks
  - Update UI (chart and numbers) immediately on successful increment
  - Record increment in LocalStorage via DailyLimitManager
  - Update global statistics in Firebase on each increment
  - Display error notification on Firebase transaction failure
  - Implement search bar re-search functionality
  - Implement share button functionality (Web Share API with clipboard fallback)
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 4.5, 8.3, 8.4_

- [x] 15. Implement share functionality




  - Create share helper function that accepts URL and title
  - Check for Web Share API availability (navigator.share)
  - Use Web Share API if available with Korean title and URL
  - Fallback to Clipboard API (navigator.clipboard.writeText) if Web Share unavailable
  - Show success notification "링크가 복사되었습니다" on clipboard copy
  - Show error notification if both APIs unavailable
  - Integrate share helper into site share button (landing page)
  - Integrate share helper into plate share button (plate page)
  - _Requirements: 8.3, 8.4, 8.5_

- [ ]* 15.1 Write property test for share URL format
  - **Property 11: Share URL format**
  - **Validates: Requirements 8.3, 8.4**

- [x] 16. Implement error handling and user feedback





  - Add try-catch blocks around all Firebase operations
  - Implement retry logic for Firebase transaction conflicts (up to 3 retries)
  - Display user-friendly Korean error messages for all error types
  - Handle network failures with "네트워크 오류" notification
  - Handle invalid plate input with "올바른 번호판 형식이 아닙니다" message
  - Handle daily limit with "오늘은 이미 이 항목에 투표하셨습니다" notification
  - Handle LocalStorage quota exceeded by clearing old entries (> 7 days)
  - Implement graceful degradation for chart rendering failures (show table only)
  - Log all errors to console with context for debugging
  - _Requirements: 1.4, 2.3_

- [ ]* 16.1 Write property test for transaction failure handling
  - **Property 15: Transaction failure handling**
  - **Validates: Requirements 2.1, 10.1**

- [x] 17. Configure Firebase Realtime Database security rules




  - Set read access to true for /plates, /global, /leaderboards
  - Set write access to true for /plates with validation rules
  - Add validation rule for counter values (must be number >= 0)
  - Add validation rule for lastUpdated (must be number)
  - Set write access to true for /global and /leaderboards
  - Test security rules with Firebase emulator or console
  - Deploy security rules to Firebase project
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 18. Implement leaderboard data management





  - Create function to compute best drivers leaderboard from all plates
  - Create function to compute most liked leaderboard from all plates
  - Implement client-side leaderboard computation on landing page load
  - Fetch all plates data and filter by time period
  - Calculate scores and rank plates
  - Store computed leaderboards in memory for session
  - Add note in code for future server-side computation with Cloud Functions
  - _Requirements: 5.2, 5.5, 6.2, 6.5_

- [x] 19. Add mobile-specific enhancements





  - Set input type="tel" for plate number input to trigger numeric keyboard
  - Add inputmode="numeric" attribute for better mobile keyboard
  - Test touch interactions on all buttons and links
  - Verify minimum 44x44px touch targets across all interactive elements
  - Add CSS touch-action for better scrolling performance
  - Test responsive layouts on various mobile screen sizes (320px to 768px)
  - Verify chart scales properly on small screens
  - Test landscape and portrait orientations
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 20. Optimize performance





  - Minify CSS and JavaScript files for production
  - Add DNS prefetch for Firebase domains in HTML head
  - Implement debouncing for search input validation (300ms delay)
  - Cache plate data in memory during session to avoid redundant fetches
  - Optimize Chart.js configuration for faster rendering
  - Reduce animation durations for better perceived performance
  - Test page load time on 3G connection simulation
  - Verify critical resources load within 2 seconds
  - _Requirements: 14.1, 14.3, 14.5_

- [x] 21. Add privacy and legal compliance elements





  - Verify no cookies are set (only LocalStorage used)
  - Verify no personal data is collected or transmitted
  - Add privacy notice to footer: "익명 사용 - 개인정보 수집 없음"
  - Add legal notice: "공개 비방 금지 – 정보통신망법 제70조 준수"
  - Add usage warning: "운전 중 사용 금지 – 안전 운전 우선"
  - Verify only predefined counters exist (no free-text input)
  - Test in incognito/private browsing mode
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 22. Prepare for deployment





  - Create GitHub repository for the project
  - Add .gitignore file (exclude node_modules, .env, .DS_Store)
  - Create README.md with project description and setup instructions
  - Create netlify.toml with redirect rules for clean URLs
  - Add security headers in netlify.toml (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
  - Commit all files to GitHub repository
  - Connect GitHub repository to Netlify
  - Configure Netlify build settings (publish directory: ".")
  - Set up continuous deployment from main branch
  - _Requirements: 15.1, 15.2, 15.3, 15.5_

- [ ] 23. Deploy and test production environment
  - Push code to GitHub main branch
  - Verify Netlify build succeeds
  - Test deployed site on production URL
  - Verify Firebase connection works in production
  - Test all user flows: search, view plate, increment counters, view leaderboards
  - Test on multiple devices (iOS, Android, desktop)
  - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
  - Verify HTTPS is enabled
  - Test share functionality on mobile devices
  - Verify advertisement placeholders are visible and properly sized
  - _Requirements: 15.1, 15.2, 15.5_

- [x] 24. Implement Monthly Trend Tracker module





  - Create MonthlyTrendTracker object with date tracking functions
  - Implement function to get current date in KST as YYYY-MM-DD format (no time data)
  - Implement recordMonthlyIncrement function to store date in Firebase under /plates/{plateNumber}/monthlyIncrements/{counterKey}/{YYYY-MM-DD}
  - Implement getMonthlyTrends function to fetch all increment dates for a plate
  - Implement aggregateByMonth function to group dates by YYYY-MM format and count occurrences
  - Implement getLast12Months function to generate array of last 12 month labels in KST
  - _Requirements: 15.1, 15.2, 15.4_

- [ ]* 24.1 Write property test for date-only storage
  - **Property 16: Date-only storage for monthly increments**
  - **Validates: Requirements 15.1**

- [ ]* 24.2 Write property test for monthly aggregation accuracy
  - **Property 17: Monthly aggregation accuracy**
  - **Validates: Requirements 15.2, 15.4**

- [ ]* 24.3 Write property test for 12-month trend completeness
  - **Property 18: 12-month trend completeness**
  - **Validates: Requirements 15.5**

- [x] 25. Add monthly trend chart to Chart Manager




  - Implement createMonthlyTrendChart function to initialize vertical bar chart
  - Configure chart with months on x-axis and increment counts on y-axis
  - Implement updateMonthlyTrendChart function to update existing trend chart
  - Set chart type to vertical bar with single color (blue)
  - Configure responsive behavior and 300ms animation
  - _Requirements: 15.3_

- [x] 26. Update plate page to display monthly trend




  - Add canvas element for monthly trend chart in plate.html
  - Add section header "월별 메세지 수신횟수" above trend chart
  - Fetch monthly trend data when plate page loads
  - Render monthly trend chart below the main counter chart
  - Update monthly trend chart when counter is incremented
  - Handle zero-state (no data) by displaying all zeros for 12 months
  - _Requirements: 15.2, 15.3, 15.5_

- [x] 27. Integrate monthly tracking with counter increments




  - Update counter increment handler to call recordMonthlyIncrement
  - Store current date (YYYY-MM-DD) in Firebase when counter is incremented
  - Ensure date is calculated using KST timezone
  - Update monthly trend chart immediately after successful increment
  - _Requirements: 15.1, 15.4_

- [x] 28. Style monthly trend chart section




  - Add CSS styles for monthly trend section
  - Ensure chart container is responsive on mobile and desktop
  - Add spacing between main chart and trend chart
  - Style section header with appropriate typography
  - Ensure chart scales properly on small screens
  - _Requirements: 15.3_

- [x] 29. Final checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.
