# 🍪 SAFE DRIVE 쿠키 동의 시스템

## 빠른 시작

### 1. 테스트하기
브라우저에서 `test-cookie-consent.html`을 열어 쿠키 동의 시스템을 테스트하세요.

```bash
# 로컬 서버 실행 (이미 있는 경우)
start-server.bat

# 브라우저에서 열기
http://localhost:8000/test-cookie-consent.html
```

### 2. 모든 페이지에 적용하기

**자동 방식 (권장):**
```powershell
powershell -ExecutionPolicy Bypass -File update-cookie-consent.ps1
```

**수동 방식:**
각 HTML 파일의 `</body>` 태그 직전에 다음 코드를 추가:

```html
<!-- Cookie Consent System -->
<link rel="stylesheet" href="/css/cookie-consent.css">
<script src="/js/cookie-consent.js"></script>

<button 
    class="cookie-settings-trigger" 
    onclick="openCookieSettings()" 
    title="쿠키 설정 관리"
    aria-label="쿠키 설정 관리">
    🍪
</button>
```

### 3. Google Analytics 업데이트

`<head>` 섹션의 Google Analytics 코드를 다음과 같이 수정:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  // 기본값을 거부로 설정 (쿠키 동의 시 자동 업데이트)
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });
  
  gtag('config', 'G-9R8RZYZC7X');
</script>
```

## 주요 파일

| 파일 | 설명 |
|------|------|
| `css/cookie-consent.css` | 쿠키 배너 스타일 |
| `js/cookie-consent.js` | 쿠키 동의 로직 |
| `test-cookie-consent.html` | 테스트 페이지 |
| `COOKIE_CONSENT_GUIDE.md` | 상세 가이드 |
| `update-cookie-consent.ps1` | 자동 업데이트 스크립트 |

## 기능

✅ **3가지 쿠키 카테고리**
- 필수 쿠키 (현재 미사용)
- 분석 쿠키 (Google Analytics)
- 광고 쿠키 (Google AdSense, 쿠팡 파트너스)

✅ **사용자 친화적**
- 첫 방문 시 자동 표시
- 우측 하단 🍪 버튼으로 언제든 변경
- 모바일/데스크톱 반응형
- 다크 모드 지원

✅ **법적 준수**
- GDPR 준수
- 한국 개인정보보호법 준수
- Google Consent Mode v2 지원

✅ **개발자 친화적**
- JavaScript API 제공
- 이벤트 리스너 지원
- LocalStorage 기반 저장

## 업데이트 필요 페이지

- [x] index.html ✅
- [ ] plate.html
- [ ] qr-generator.html
- [ ] terms.html
- [ ] referral.html
- [ ] privacy.html
- [ ] other.html
- [ ] legal.html
- [ ] faq.html
- [ ] contact.html

## JavaScript API

```javascript
// 동의 여부 확인
if (window.cookieConsent.hasConsent()) {
    const prefs = window.cookieConsent.getPreferences();
}

// 설정 창 열기
window.openCookieSettings();

// 동의 상태 변경 감지
window.addEventListener('cookieConsentChanged', (event) => {
    console.log(event.detail); // { essential, analytics, advertising }
});

// 프로그래밍 방식으로 동의 저장
window.cookieConsent.saveConsent({
    essential: true,
    analytics: true,
    advertising: false
});

// 동의 초기화 (테스트용)
window.cookieConsent.resetConsent();
```

## 문제 해결

**배너가 표시되지 않음:**
- 브라우저 콘솔에서 오류 확인
- CSS/JS 파일 경로 확인
- 시크릿 모드에서 테스트

**Google Analytics가 작동하지 않음:**
- 사용자가 분석 쿠키에 동의했는지 확인
- 콘솔에서 `gtag('consent', 'update', ...)` 호출 확인

## 다음 단계

1. ✅ `test-cookie-consent.html`에서 테스트
2. ⏳ `update-cookie-consent.ps1` 실행하여 모든 페이지 업데이트
3. ⏳ 각 페이지에서 동작 확인
4. ⏳ Google Analytics 콘솔에서 동의 모드 확인

## 지원

자세한 내용은 `COOKIE_CONSENT_GUIDE.md`를 참고하세요.

---

**버전**: 1.0  
**최종 업데이트**: 2024년 12월  
**작성자**: SAFE DRIVE Team
