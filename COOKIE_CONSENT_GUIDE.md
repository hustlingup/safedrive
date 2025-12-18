# 🍪 SAFE DRIVE 쿠키 동의 시스템 가이드

## 개요

SAFE DRIVE 웹사이트에 GDPR 및 한국 개인정보보호법을 준수하는 쿠키 동의 배너 시스템이 구현되었습니다.

## 주요 기능

### 1. 쿠키 동의 배너
- 첫 방문 시 자동으로 표시
- 3가지 쿠키 카테고리 선택 가능:
  - **필수 쿠키**: 사이트 기본 기능 (현재 미사용)
  - **분석 쿠키**: Google Analytics
  - **광고 쿠키**: Google AdSense, 쿠팡 파트너스

### 2. 동의 옵션
- **모두 동의**: 모든 쿠키 허용
- **선택 동의**: 사용자가 선택한 쿠키만 허용
- **거부**: 필수 쿠키만 허용 (분석/광고 차단)

### 3. 쿠키 설정 관리
- 우측 하단 🍪 버튼으로 언제든지 설정 변경 가능
- 상세한 쿠키 정책 설명 제공
- 쿠팡 파트너스 제휴 링크 관련 안내 포함

### 4. Google Analytics 통합
- 사용자 동의 상태에 따라 자동으로 활성화/비활성화
- Google Consent Mode v2 지원

## 파일 구조

```
/css/cookie-consent.css          # 쿠키 배너 스타일
/js/cookie-consent.js            # 쿠키 동의 로직
cookie-consent-snippet.html      # HTML 통합 스니펫
google-analytics-consent-snippet.html  # GA 통합 스니펫
```

## 통합 방법

### 1단계: Google Analytics 업데이트

기존 Google Analytics 코드를 다음과 같이 교체:

```html
<!-- Google tag (gtag.js) - with Cookie Consent -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-9R8RZYZC7X"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  // Default consent to denied
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });
  
  gtag('config', 'G-9R8RZYZC7X');
</script>
```

### 2단계: 쿠키 동의 시스템 추가

모든 HTML 페이지의 `</body>` 태그 직전에 추가:

```html
<!-- Cookie Consent System -->
<link rel="stylesheet" href="/css/cookie-consent.css">
<script src="/js/cookie-consent.js"></script>

<!-- Cookie Settings Floating Button -->
<button 
    class="cookie-settings-trigger" 
    onclick="openCookieSettings()" 
    title="쿠키 설정 관리"
    aria-label="쿠키 설정 관리">
    🍪
</button>
```

## 업데이트가 필요한 페이지

다음 페이지들에 쿠키 동의 시스템을 추가해야 합니다:

- [x] index.html (완료)
- [ ] plate.html
- [ ] qr-generator.html
- [ ] terms.html
- [ ] referral.html
- [ ] privacy.html
- [ ] other.html
- [ ] legal.html
- [ ] faq.html
- [ ] contact.html

## 쿠키 정책 내용

### 필수 쿠키 (기능성)
사이트가 정상적으로 동작하는 데 필요한 최소한의 정보를 저장합니다.
현재 SAFE DRIVE는 별도의 필수 쿠키를 저장하지 않습니다.

### 분석 쿠키
Google Analytics를 통해 방문자 수, 페이지 방문 빈도, 사용자의 이동 경로 등을 익명으로 수집하여 서비스 품질 개선에 활용합니다.
이 쿠키는 사용자 개인을 식별하지 않으며, 집계 통계 데이터만 수집합니다.

### 광고 쿠키 (선택적)
Google AdSense를 통해 광고를 제공하는 경우, 광고 노출 및 클릭 기록을 기반으로 맞춤형 광고를 제공할 수 있습니다.
광고 쿠키 수집에 동의하지 않으시면 맞춤형 광고는 제공되지 않습니다.

### 제휴 링크 (Coupang Partners) 관련 쿠키
본 사이트는 쿠팡 파트너스 프로그램에 참여하고 있습니다. QR 생성 페이지에서 제공되는 일부 상품 링크는 쿠팡 파트너스 제휴 링크이며, 해당 링크를 클릭할 경우 다음과 같은 사항이 적용될 수 있습니다.

- **추적 쿠키 부여**: 쿠팡은 제휴 프로그램 운영을 위해 쿠키를 사용하여 추천 링크를 통해 유입된 사용자와 구매를 추적합니다.
- **수집 정보**: 쿠키에는 사용자 개인 정보가 포함되지 않으며, 추천 코드, 방문 시간, 구매 여부 등의 정보가 저장될 수 있습니다.
- **목적**: 추천 링크를 통한 판매가 발생했을 때 운영자가 소정의 수수료를 받을 수 있도록 하기 위한 것입니다.

## 쿠키 설정 변경 방법

1. 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다.
2. [Google 광고 설정 페이지](https://adssettings.google.com)에서 맞춤형 광고 수신 여부를 조정할 수 있습니다.
3. [Google Analytics 차단 브라우저 애드온](https://tools.google.com/dlpage/gaoptout)을 설치해 분석 쿠키 사용을 비활성화할 수 있습니다.

## 동의 철회

쿠키 동의를 철회하고 싶으신 경우, 페이지 우측 하단의 🍪 버튼을 통해 언제든지 선호도를 변경하실 수 있습니다.

## 기술 세부사항

### 저장 방식
- 사용자 동의 정보는 `localStorage`에 저장됩니다.
- 키: `safedrive_cookie_consent`
- 버전 관리를 통해 정책 변경 시 재동의 요청 가능

### 동의 상태 확인
```javascript
// 동의 여부 확인
if (window.cookieConsent.hasConsent()) {
    const preferences = window.cookieConsent.getPreferences();
    console.log('Analytics:', preferences.analytics);
    console.log('Advertising:', preferences.advertising);
}
```

### 동의 변경 이벤트
```javascript
// 동의 상태 변경 감지
window.addEventListener('cookieConsentChanged', (event) => {
    const preferences = event.detail;
    console.log('Cookie consent updated:', preferences);
});
```

### 프로그래밍 방식으로 설정 열기
```javascript
window.openCookieSettings();
```

## 반응형 디자인

- 모바일, 태블릿, 데스크톱 모두 지원
- 다크 모드 자동 감지 및 적용
- 터치 제스처 지원

## 접근성

- ARIA 레이블 적용
- 키보드 네비게이션 지원
- 스크린 리더 호환

## 법적 준수

이 시스템은 다음 규정을 준수합니다:
- GDPR (유럽 일반 데이터 보호 규정)
- 한국 개인정보보호법
- Google Consent Mode v2

## 테스트 방법

1. 브라우저 시크릿 모드로 사이트 접속
2. 쿠키 배너가 자동으로 표시되는지 확인
3. 각 동의 옵션 테스트:
   - 모두 동의
   - 선택 동의
   - 거부
4. 🍪 버튼 클릭하여 설정 변경 가능 확인
5. 개발자 도구 콘솔에서 `localStorage.getItem('safedrive_cookie_consent')` 확인

## 문제 해결

### 배너가 표시되지 않음
- 브라우저 콘솔에서 JavaScript 오류 확인
- CSS 파일 로드 확인
- localStorage 사용 가능 여부 확인

### Google Analytics가 작동하지 않음
- 사용자가 분석 쿠키에 동의했는지 확인
- 콘솔에서 `gtag` 함수 존재 여부 확인
- Network 탭에서 GA 요청 확인

### 설정이 저장되지 않음
- localStorage가 비활성화되어 있는지 확인
- 시크릿 모드에서는 세션 종료 시 삭제됨

## 향후 개선 사항

- [ ] 다국어 지원 (영어, 일본어 등)
- [ ] 쿠키 정책 페이지 자동 생성
- [ ] A/B 테스트를 위한 동의율 추적
- [ ] 서버 사이드 동의 관리 (선택사항)

## 지원

문의사항이 있으시면 개인정보처리방침 페이지를 참고하시거나 contact.html을 통해 연락주세요.

---

**마지막 업데이트**: 2024년 12월
**버전**: 1.0
**작성자**: SAFE DRIVE Team
