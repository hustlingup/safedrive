# 🏗️ SAFE DRIVE 쿠키 동의 시스템 아키텍처

## 시스템 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    SAFE DRIVE Website                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   User Interface                      │ │
│  │                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │ │
│  │  │ Cookie Banner│  │Settings Modal│  │🍪 Button   │ │ │
│  │  │ (First Visit)│  │ (On Demand)  │  │(Floating)  │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │ │
│  │         │                 │                 │        │ │
│  └─────────┼─────────────────┼─────────────────┼────────┘ │
│            │                 │                 │          │
│  ┌─────────▼─────────────────▼─────────────────▼────────┐ │
│  │          Cookie Consent Manager (JS)                 │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │ - loadConsent()                              │   │ │
│  │  │ - saveConsent(preferences)                   │   │ │
│  │  │ - applyConsent(preferences)                  │   │ │
│  │  │ - showBanner() / showSettings()              │   │ │
│  │  └──────────────────────────────────────────────┘   │ │
│  └─────────┬────────────────────────────┬───────────────┘ │
│            │                            │                 │
│  ┌─────────▼──────────┐    ┌───────────▼──────────────┐  │
│  │   LocalStorage     │    │  Google Consent Mode     │  │
│  │                    │    │                          │  │
│  │  safedrive_cookie_ │    │  gtag('consent',         │  │
│  │  consent:          │    │    'update', {...})      │  │
│  │  {                 │    │                          │  │
│  │    version: "1.0"  │    │  - analytics_storage     │  │
│  │    timestamp: ...  │    │  - ad_storage            │  │
│  │    preferences: {  │    │  - ad_user_data          │  │
│  │      essential: T  │    │  - ad_personalization    │  │
│  │      analytics: T  │    │                          │  │
│  │      advertising:F │    └───────────┬──────────────┘  │
│  │    }               │                │                 │
│  │  }                 │                │                 │
│  └────────────────────┘    ┌───────────▼──────────────┐  │
│                            │   External Services      │  │
│                            │                          │  │
│                            │  - Google Analytics      │  │
│                            │  - Google AdSense        │  │
│                            │  - Coupang Partners      │  │
│                            └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 파일 구조

```
safedrive2/
│
├── css/
│   └── cookie-consent.css          # 스타일시트
│       ├── Banner styles
│       ├── Modal styles
│       ├── Button styles
│       ├── Responsive design
│       └── Dark mode support
│
├── js/
│   └── cookie-consent.js           # 핵심 로직
│       ├── CookieConsent class
│       │   ├── loadConsent()
│       │   ├── saveConsent()
│       │   ├── applyConsent()
│       │   ├── showBanner()
│       │   ├── showSettings()
│       │   ├── enableAnalytics()
│       │   ├── disableAnalytics()
│       │   ├── enableAdvertising()
│       │   └── disableAdvertising()
│       └── Event handlers
│
├── index.html                      # ✅ 통합 완료
├── plate.html                      # ⏳ 통합 대기
├── qr-generator.html               # ⏳ 통합 대기
├── [other pages...]                # ⏳ 통합 대기
│
├── test-cookie-consent.html        # 테스트 페이지
│
├── COOKIE_CONSENT_GUIDE.md         # 상세 가이드
├── COOKIE_CONSENT_README.md        # 빠른 시작
├── COOKIE_IMPLEMENTATION_CHECKLIST.md
├── COOKIE_CONSENT_SUMMARY.md
└── COOKIE_SYSTEM_ARCHITECTURE.md   # 이 파일
```

## 데이터 흐름

### 1. 첫 방문 시나리오

```
User visits page
      │
      ▼
Page loads
      │
      ▼
cookie-consent.js initializes
      │
      ▼
Check LocalStorage
      │
      ├─ Has consent? ──► Apply preferences ──► Done
      │                        │
      │                        ▼
      │                   Update gtag()
      │
      └─ No consent? ──► Show banner
                              │
                              ▼
                         User chooses:
                         ┌────┴────┐
                         │         │
                    Accept    Reject
                         │         │
                         ▼         ▼
                    Save to LocalStorage
                         │
                         ▼
                    Apply consent
                         │
                         ▼
                    Update gtag()
                         │
                         ▼
                    Hide banner
```

### 2. 설정 변경 시나리오

```
User clicks 🍪 button
      │
      ▼
Open settings modal
      │
      ▼
Load current preferences
      │
      ▼
User modifies checkboxes
      │
      ▼
User clicks "Save"
      │
      ▼
Save to LocalStorage
      │
      ▼
Apply new consent
      │
      ▼
Update gtag()
      │
      ▼
Dispatch 'cookieConsentChanged' event
      │
      ▼
Close modal
```

## 컴포넌트 상세

### 1. Cookie Banner (쿠키 배너)

```
┌─────────────────────────────────────────────────────┐
│  🍪 쿠키 사용 안내                                   │
│                                                     │
│  SAFE DRIVE는 서비스 품질 개선과 맞춤형 광고        │
│  제공을 위해 쿠키를 사용합니다.                     │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ☑ 필수 쿠키 (현재 미사용)                   │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ☑ 분석 쿠키 (Google Analytics)             │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ☑ 광고 쿠키 (AdSense, 쿠팡 파트너스)       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  자세한 내용은 개인정보처리방침을 참고하세요.       │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │모두 동의 │ │선택 동의 │ │  거부    │           │
│  └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────┘

Properties:
- Position: Fixed bottom
- Z-index: 10000
- Animation: Slide up from bottom
- Backdrop: Semi-transparent overlay
```

### 2. Settings Modal (설정 모달)

```
┌─────────────────────────────────────────────────────┐
│  쿠키 설정 관리                                [×]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ☑ 필수 쿠키 (기능성)                        │   │
│  │   사이트가 정상적으로 동작하는 데 필요한    │   │
│  │   최소한의 정보를 저장합니다.               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ☑ 분석 쿠키                                 │   │
│  │   Google Analytics를 통해 방문자 수,        │   │
│  │   페이지 방문 빈도 등을 익명으로 수집...    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ☑ 광고 쿠키 (선택적)                        │   │
│  │   Google AdSense를 통해 광고를 제공...      │   │
│  │                                             │   │
│  │   ┌───────────────────────────────────────┐ │   │
│  │   │ 제휴 링크 (Coupang Partners)         │ │   │
│  │   │ 쿠팡 파트너스 프로그램 참여...        │ │   │
│  │   └───────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  쿠키 설정 변경 방법                                │
│  - 브라우저 설정에서 쿠키 저장 거부/삭제            │
│  - Google 광고 설정 페이지                          │
│  - Google Analytics 차단 애드온                     │
│                                                     │
│  동의 철회                                          │
│  쿠키 동의를 철회하고 싶으신 경우...                │
│                                                     │
├─────────────────────────────────────────────────────┤
│                          ┌──────────┐ ┌──────────┐ │
│                          │설정 저장 │ │  취소    │ │
│                          └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────┘

Properties:
- Position: Fixed center
- Z-index: 10001
- Max-height: 90vh
- Scrollable content
- Backdrop: Dark overlay
```

### 3. Floating Button (플로팅 버튼)

```
                                    ┌─────┐
                                    │     │
                                    │  🍪 │
                                    │     │
                                    └─────┘
                                      ▲
                                      │
                            Fixed: bottom-right
                            Z-index: 9999
                            Size: 56x56px
                            Hover: Scale 1.1

Properties:
- Always visible
- Circular shape
- Gradient background
- Box shadow
- Smooth hover animation
```

## 상태 관리

### LocalStorage 구조

```json
{
  "version": "1.0",
  "timestamp": "2024-12-18T10:30:00.000Z",
  "preferences": {
    "essential": true,
    "analytics": true,
    "advertising": false
  }
}
```

### 상태 전이 다이어그램

```
┌─────────────┐
│   No Data   │ (첫 방문)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Show Banner  │
└──────┬──────┘
       │
       ├─► Accept All ──┐
       ├─► Accept Some ─┤
       └─► Reject All ──┘
                        │
                        ▼
                ┌───────────────┐
                │ Consent Saved │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Apply Consent │
                └───────┬───────┘
                        │
                        ├─► Enable GA
                        ├─► Enable Ads
                        └─► Disable All
                        
                        │
                        ▼
                ┌───────────────┐
                │  User Action  │
                │ (Click 🍪)    │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Show Settings │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Modify & Save │
                └───────┬───────┘
                        │
                        ▼
                (Back to Apply Consent)
```

## Google Consent Mode 통합

### 초기 설정 (Default Consent)

```javascript
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});
```

### 동의 업데이트 (User Consent)

```javascript
// 분석 쿠키 허용 시
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});

// 광고 쿠키 허용 시
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
});
```

### 데이터 흐름

```
User Consent
     │
     ▼
CookieConsent.applyConsent()
     │
     ├─► analytics: true
     │   └─► gtag('consent', 'update', {
     │         'analytics_storage': 'granted'
     │       })
     │       └─► Google Analytics
     │           └─► Collect data
     │
     └─► advertising: true
         └─► gtag('consent', 'update', {
               'ad_storage': 'granted',
               'ad_user_data': 'granted',
               'ad_personalization': 'granted'
             })
             └─► Google AdSense
                 └─► Show personalized ads
```

## 이벤트 시스템

### Custom Events

```javascript
// 동의 변경 이벤트
window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
  detail: {
    essential: true,
    analytics: true,
    advertising: false
  }
}));
```

### Event Flow

```
User Action
     │
     ▼
saveConsent()
     │
     ▼
applyConsent()
     │
     ├─► Update gtag()
     │
     └─► Dispatch Event
         │
         ▼
    Event Listeners
         │
         ├─► Custom Analytics
         ├─► Third-party Scripts
         └─► UI Updates
```

## 보안 고려사항

### 1. XSS 방지
```javascript
// 사용자 입력 없음 - 안전
// 모든 텍스트는 하드코딩됨
```

### 2. CSRF 방지
```javascript
// 서버 통신 없음 - 안전
// LocalStorage만 사용
```

### 3. 데이터 무결성
```javascript
// 버전 관리
if (consent.version !== this.CONSENT_VERSION) {
  // 재동의 요청
}
```

## 성능 최적화

### 1. 지연 로딩
```javascript
// 배너는 페이지 로드 후 표시
document.addEventListener('DOMContentLoaded', () => {
  cookieConsent.showBanner();
});
```

### 2. 이벤트 위임
```javascript
// 동적 요소에 이벤트 위임 사용
banner.addEventListener('click', (e) => {
  if (e.target.matches('.btn')) {
    // Handle click
  }
});
```

### 3. CSS 최적화
```css
/* GPU 가속 사용 */
.cookie-consent-banner {
  transform: translateY(100%);
  will-change: transform;
}
```

## 접근성 (A11y)

### ARIA 속성
```html
<button 
  class="cookie-settings-trigger"
  aria-label="쿠키 설정 관리"
  title="쿠키 설정 관리">
  🍪
</button>
```

### 키보드 네비게이션
```
Tab       - 다음 요소로 이동
Shift+Tab - 이전 요소로 이동
Enter     - 버튼 클릭
Esc       - 모달 닫기
```

### 스크린 리더 지원
```html
<div role="dialog" aria-labelledby="cookie-title">
  <h2 id="cookie-title">쿠키 설정 관리</h2>
  ...
</div>
```

## 브라우저 호환성

| 브라우저 | 최소 버전 | 지원 상태 |
|---------|----------|----------|
| Chrome | 60+ | ✅ 완전 지원 |
| Firefox | 55+ | ✅ 완전 지원 |
| Safari | 11+ | ✅ 완전 지원 |
| Edge | 79+ | ✅ 완전 지원 |
| IE | 11 | ⚠️ 부분 지원 |

## 모니터링 및 분석

### 추적 가능한 메트릭

```javascript
// 동의율 추적
const consentRate = {
  total: 0,
  accepted: 0,
  rejected: 0,
  partial: 0
};

window.addEventListener('cookieConsentChanged', (event) => {
  // 분석 로직
  if (event.detail.analytics && event.detail.advertising) {
    consentRate.accepted++;
  } else if (!event.detail.analytics && !event.detail.advertising) {
    consentRate.rejected++;
  } else {
    consentRate.partial++;
  }
  consentRate.total++;
});
```

## 향후 확장 계획

### Phase 2
- [ ] 다국어 지원 (i18n)
- [ ] 서버 사이드 동의 관리
- [ ] 동의율 대시보드

### Phase 3
- [ ] A/B 테스트 프레임워크
- [ ] 쿠키 스캐너 자동화
- [ ] 정책 버전 관리 시스템

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024년 12월 18일  
**작성자**: SAFE DRIVE Development Team
