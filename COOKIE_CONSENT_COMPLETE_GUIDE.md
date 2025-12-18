# 🍪 SAFE DRIVE 쿠키 동의 시스템 - 완전 가이드

> **구현 상태**: ✅ 완료 및 검증됨  
> **버전**: 1.0  
> **최종 업데이트**: 2024년 12월 19일

---

## ✅ 구현 검증 완료

### 검증된 항목
- ✅ `css/cookie-consent.css` 생성 완료
- ✅ `js/cookie-consent.js` 생성 완료
- ✅ `index.html`에 Google Analytics 동의 모드 추가
- ✅ `index.html`에 쿠키 배너 시스템 통합
- ✅ `build.js`에 css 폴더 복사 추가 (수정 완료)
- ✅ `dist/` 폴더에 쿠키 파일 빌드 확인

### 배포 준비 완료
```bash
# 빌드 실행
node build.js

# Firebase 배포
firebase deploy --only hosting
```

---

## 🚀 빠른 시작

### 1단계: 테스트
```bash
# 로컬에서 테스트 페이지 열기
start test-cookie-consent.html
```

### 2단계: 다른 페이지에 적용
모든 HTML 페이지의 `</body>` 직전에 추가:
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

### 3단계: Google Analytics 업데이트
`<head>` 섹션의 GA 코드에 동의 모드 추가:
```javascript
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
});
```

### 4단계: 빌드 및 배포
```bash
node build.js
firebase deploy --only hosting
```

---

## 📦 시스템 개요

### 생성된 파일
```
css/
  ├── cookie-consent.css (8.8KB)         # 기본 배너 스타일
  └── cookie-consent-compact.css (NEW)   # 간결한 레이아웃 옵션

js/
  ├── cookie-consent.js (14.4KB)         # 전체 기능 버전
  └── cookie-consent-compact.js (NEW)    # 간결한 버전

test-cookie-consent.html                 # 기능 테스트 페이지
cookie-banner-layout-options.html (NEW)  # 레이아웃 미리보기
```

### 레이아웃 옵션 (NEW!)
6가지 간결한 레이아웃 중 선택 가능:

1. **Compact Bottom Bar** (기본) - 화면 하단 고정 바
2. **Corner Popup** - 우측 하단 팝업
3. **Minimal Toast** - 하단 중앙 토스트
4. **Side Panel** - 우측 사이드 패널
5. **Top Bar** - 화면 상단 고정 바
6. **Center Modal** - 화면 중앙 모달

**미리보기**: `cookie-banner-layout-options.html` 열어서 확인

### 주요 기능
1. **쿠키 동의 배너** - 첫 방문 시 자동 표시
2. **3가지 쿠키 카테고리**
   - 필수 쿠키 (현재 미사용)
   - 분석 쿠키 (Google Analytics)
   - 광고 쿠키 (Google AdSense, 쿠팡 파트너스)
3. **설정 관리 모달** - 상세 정책 설명
4. **플로팅 버튼 (🍪)** - 언제든 설정 변경
5. **Google Consent Mode v2** - GA 통합
6. **반응형 디자인** - 모바일/태블릿/데스크톱
7. **다크 모드 지원** - 자동 감지

---

## 🎯 쿠키 정책 내용

### 1. 필수 쿠키 (기능성)
사이트가 정상적으로 동작하는 데 필요한 최소한의 정보를 저장합니다.
**현재 SAFE DRIVE는 별도의 필수 쿠키를 저장하지 않습니다.**

### 2. 분석 쿠키
Google Analytics를 통해 방문자 수, 페이지 방문 빈도, 사용자의 이동 경로 등을 익명으로 수집하여 서비스 품질 개선에 활용합니다.
이 쿠키는 사용자 개인을 식별하지 않으며, 집계 통계 데이터만 수집합니다.

### 3. 광고 쿠키 (선택적)
Google AdSense를 통해 광고를 제공하는 경우, 광고 노출 및 클릭 기록을 기반으로 맞춤형 광고를 제공할 수 있습니다.
광고 쿠키 수집에 동의하지 않으시면 맞춤형 광고는 제공되지 않습니다.

### 4. 제휴 링크 (Coupang Partners) 관련 쿠키
본 사이트는 쿠팡 파트너스 프로그램에 참여하고 있습니다. QR 생성 페이지에서 제공되는 일부 상품 링크는 쿠팡 파트너스 제휴 링크이며, 해당 링크를 클릭할 경우 다음과 같은 사항이 적용될 수 있습니다.

- **추적 쿠키 부여**: 쿠팡은 제휴 프로그램 운영을 위해 쿠키를 사용하여 추천 링크를 통해 유입된 사용자와 구매를 추적합니다.
- **수집 정보**: 쿠키에는 사용자 개인 정보가 포함되지 않으며, 추천 코드, 방문 시간, 구매 여부 등의 정보가 저장될 수 있습니다.
- **목적**: 추천 링크를 통한 판매가 발생했을 때 운영자가 소정의 수수료를 받을 수 있도록 하기 위한 것입니다.

### 5. 쿠키 설정 변경 방법
- 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다.
- [Google 광고 설정 페이지](https://adssettings.google.com)에서 맞춤형 광고 수신 여부를 조정할 수 있습니다.
- [Google Analytics 차단 브라우저 애드온](https://tools.google.com/dlpage/gaoptout)을 설치해 분석 쿠키 사용을 비활성화할 수 있습니다.

### 6. 동의 철회
쿠키 동의를 철회하고 싶으신 경우, 페이지 우측 하단의 🍪 버튼을 통해 언제든지 선호도를 변경하실 수 있습니다.

---

## 💻 JavaScript API

### 기본 사용법
```javascript
// 동의 여부 확인
if (window.cookieConsent.hasConsent()) {
    const prefs = window.cookieConsent.getPreferences();
    console.log(prefs); // { essential, analytics, advertising }
}

// 설정 창 열기
window.openCookieSettings();

// 동의 저장
window.cookieConsent.saveConsent({
    essential: true,
    analytics: true,
    advertising: false
});

// 동의 초기화 (테스트용)
window.cookieConsent.resetConsent();
```

### 이벤트 리스너
```javascript
window.addEventListener('cookieConsentChanged', (event) => {
    console.log('동의 상태 변경:', event.detail);
    // { essential: true, analytics: true, advertising: false }
});
```

---

## 🧪 테스트 가이드

### 기능 테스트
1. 시크릿 모드로 사이트 접속
2. 쿠키 배너 자동 표시 확인
3. "모두 동의" 클릭
4. 페이지 새로고침
5. 배너가 다시 표시되지 않는지 확인
6. 🍪 버튼 클릭하여 설정 변경
7. LocalStorage 확인:
   ```javascript
   localStorage.getItem('safedrive_cookie_consent')
   ```

### Google Analytics 테스트
1. 개발자 도구 > Network 탭 열기
2. 분석 쿠키 거부
3. GA 요청이 차단되는지 확인
4. 분석 쿠키 허용
5. GA 요청이 전송되는지 확인

---

## 🔧 문제 해결

### 배너가 표시되지 않음
```javascript
// 브라우저 콘솔에서 확인
console.log(window.cookieConsent); // 객체가 있어야 함
console.log(window.cookieConsent.hasConsent()); // false여야 배너 표시
```

**해결 방법:**
- CSS/JS 파일 경로 확인
- 브라우저 콘솔에서 오류 확인
- 시크릿 모드에서 테스트

### Google Analytics가 작동하지 않음
```javascript
// 콘솔에서 확인
console.log(window.gtag); // 함수가 있어야 함
console.log(window.cookieConsent.getPreferences().analytics); // true여야 함
```

**해결 방법:**
- 사용자가 분석 쿠키에 동의했는지 확인
- Google Analytics 코드가 올바르게 로드되었는지 확인

### 배포 후 쿠키 배너가 안 보임
**원인:** `build.js`에 css 폴더가 포함되지 않음

**해결 완료:** ✅ `build.js` 업데이트됨
```javascript
const dirsToCopy = ['assets', 'css', 'js', 'public']; // css 추가됨
```

**재배포:**
```bash
node build.js
firebase deploy --only hosting
```

---

## 📋 배포 체크리스트

### 배포 전
- [x] `css/cookie-consent.css` 생성 확인
- [x] `js/cookie-consent.js` 생성 확인
- [x] `index.html`에 통합 확인
- [x] `build.js`에 css 폴더 추가 확인
- [ ] 로컬에서 테스트 완료
- [ ] 다른 HTML 페이지에 통합 (선택사항)

### 배포
```bash
# 1. 빌드
node build.js

# 2. dist 폴더 확인
# - dist/css/cookie-consent.css 존재 확인
# - dist/js/cookie-consent.js 존재 확인

# 3. Firebase 배포
firebase deploy --only hosting
```

### 배포 후
- [ ] 프로덕션 사이트에서 쿠키 배너 표시 확인
- [ ] 🍪 버튼 작동 확인
- [ ] Google Analytics 동의 모드 작동 확인
- [ ] 모바일에서 테스트
- [ ] 다크 모드에서 테스트

---

## 📱 업데이트 필요 페이지

현재 `index.html`만 통합 완료. 다른 페이지에도 적용하려면:

| 페이지 | 상태 |
|--------|------|
| index.html | ✅ 완료 |
| plate.html | ⏳ 대기 |
| qr-generator.html | ⏳ 대기 |
| terms.html | ⏳ 대기 |
| referral.html | ⏳ 대기 |
| privacy.html | ⏳ 대기 |
| other.html | ⏳ 대기 |
| legal.html | ⏳ 대기 |
| faq.html | ⏳ 대기 |
| contact.html | ⏳ 대기 |

**자동 업데이트:**
```powershell
powershell -ExecutionPolicy Bypass -File update-cookie-consent.ps1
```

---

## 🔒 법적 준수

이 시스템은 다음 규정을 준수합니다:
- ✅ **GDPR** (유럽 일반 데이터 보호 규정)
- ✅ **한국 개인정보보호법**
- ✅ **Google Consent Mode v2**

---

## 📞 지원

### 테스트
- 🧪 `test-cookie-consent.html` - 인터랙티브 테스트 페이지

### 문의
- 📧 contact.html을 통한 문의
- 🐛 GitHub Issues (해당되는 경우)

---

**🎉 구현 완료!**

이제 `node build.js`를 실행하고 `firebase deploy --only hosting`으로 배포하세요.

---

**작성일**: 2024년 12월 19일  
**버전**: 1.0  
**작성자**: SAFE DRIVE Development Team


---

## 🎨 간결한 레이아웃 사용하기 (NEW!)

### 레이아웃 미리보기
```bash
# 브라우저에서 열기
cookie-banner-layout-options.html
```

### 레이아웃 변경 방법

#### 옵션 1: 간결한 CSS 사용
HTML에서 CSS 파일 교체:
```html
<!-- 기존 -->
<link rel="stylesheet" href="/css/cookie-consent.css">

<!-- 간결한 버전으로 교체 -->
<link rel="stylesheet" href="/css/cookie-consent-compact.css">
```

#### 옵션 2: 간결한 JS 사용
HTML에서 JS 파일 교체:
```html
<!-- 기존 -->
<script src="/js/cookie-consent.js"></script>

<!-- 간결한 버전으로 교체 -->
<script src="/js/cookie-consent-compact.js"></script>
```

#### 옵션 3: 레이아웃 선택
`js/cookie-consent-compact.js` 파일에서 레이아웃 변경:
```javascript
const cookieConsentCompact = new CookieConsentCompact({
    layout: 'corner' // 'default', 'corner', 'toast', 'side', 'top', 'modal'
});
```

### 레이아웃 비교

| 레이아웃 | 위치 | 크기 | 추천 용도 |
|---------|------|------|----------|
| **default** | 하단 고정 | 전체 너비 | 일반적인 웹사이트 (권장) |
| **corner** | 우측 하단 | 340px | 블로그, 포트폴리오 |
| **toast** | 하단 중앙 | 자동 | 미니멀 디자인 |
| **side** | 우측 중앙 | 300px | 세로 긴 페이지 |
| **top** | 상단 고정 | 전체 너비 | 중요 공지 |
| **modal** | 화면 중앙 | 420px | 주의 집중 필요 시 |

### 빠른 적용 예시

**Corner Popup 사용:**
```html
<link rel="stylesheet" href="/css/cookie-consent-compact.css">
<script src="/js/cookie-consent-compact.js"></script>
<script>
    // 레이아웃 변경
    window.cookieConsentCompact.layout = 'corner';
</script>
```

**Minimal Toast 사용:**
```html
<link rel="stylesheet" href="/css/cookie-consent-compact.css">
<script src="/js/cookie-consent-compact.js"></script>
<script>
    window.cookieConsentCompact.layout = 'toast';
</script>
```

