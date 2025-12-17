# SafeDrive - 익명 차량 안전 공유 플랫폼

SafeDrive는 한국 운전자들이 번호판을 통해 익명으로 차량 안전 정보를 공유할 수 있는 웹 애플리케이션입니다. 개인정보 수집 없이 안전운전 문화를 증진하고 차량 문제를 알리는 것을 목표로 합니다.

## 주요 기능

- 🔍 **익명 번호판 검색**: 계정 생성 없이 모든 번호판 조회 가능
- 📊 **실시간 데이터 시각화**: Chart.js를 활용한 직관적인 차트
- 🏆 **리더보드**: 베스트 드라이버 및 인기 번호판 랭킹
- 📱 **모바일 최적화**: 반응형 디자인으로 모든 기기 지원
- 🔒 **완전한 프라이버시**: 쿠키 없음, 개인정보 수집 없음
- ⚡ **빠른 성능**: CDN 기반 리소스 로딩

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Database**: Firebase Realtime Database
- **Visualization**: Chart.js 4.x
- **Hosting**: Firebase Hosting
- **Version Control**: GitHub

## 프로젝트 구조

```
safedrive-webapp/
├── index.html          # 랜딩 페이지 (검색, 리더보드, 통계)
├── plate.html          # 번호판 상세 페이지 (카운터, 차트)
├── styles.css          # 전체 스타일시트
├── script.js           # 모든 JavaScript 모듈
├── assets/             # 이미지 및 아이콘
├── .gitignore          # Git 제외 파일
└── README.md           # 프로젝트 문서
```

## 로컬 개발 환경 설정

### 필수 요구사항

- 웹 브라우저 (Chrome, Firefox, Safari, Edge 최신 버전)
- Firebase 프로젝트 (Realtime Database 활성화)
- 로컬 웹 서버 (선택사항)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/YOUR_USERNAME/safedrive-webapp.git
   cd safedrive-webapp
   ```

2. **Firebase 설정**
   - [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
   - Realtime Database 활성화
   - 웹 앱 추가 및 구성 정보 복사
   - `script.js`의 Firebase 설정 객체 업데이트:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     databaseURL: "https://YOUR_PROJECT.firebaseio.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

3. **Firebase 보안 규칙 설정**
   - Firebase Console에서 Realtime Database > 규칙 탭으로 이동
   - `firebase-security-rules.json` 파일의 내용을 복사하여 적용
   - 또는 Firebase CLI 사용:
   ```bash
   firebase deploy --only database
   ```

4. **로컬 서버 실행**
   
   **옵션 A: Python 사용**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **옵션 B: Node.js 사용**
   ```bash
   npx http-server -p 8000
   ```
   
   **옵션 C: VS Code Live Server**
   - Live Server 확장 설치
   - `index.html` 우클릭 > "Open with Live Server"

5. **브라우저에서 열기**
   ```
   http://localhost:8000
   ```

## 배포

### 환경 변수 설정

배포 전에 환경 변수를 설정해야 합니다:

```bash
# 1. .env 파일 생성
copy .env.example .env

# 2. .env 파일에 VAPID 키 추가
# Firebase Console > Project Settings > Cloud Messaging > Web Push certificates에서 생성

# 3. 빌드 실행 (환경 변수 주입)
node build.js
```

**중요**: `node build.js`를 실행하지 않으면 푸시 알림이 작동하지 않습니다.

자세한 내용은 [BUILD_PROCESS.md](BUILD_PROCESS.md) 또는 [QUICK_BUILD_GUIDE.md](QUICK_BUILD_GUIDE.md)를 참조하세요.

### 수동 배포

Firebase Hosting을 사용하는 경우:

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화
firebase init hosting

# 빌드 후 배포
node build.js
firebase deploy --only hosting
```

### CI/CD 배포

GitHub Actions 예시:

```yaml
- name: Build
  env:
    VAPID_KEY: ${{ secrets.VAPID_KEY }}
  run: node build.js

- name: Deploy
  run: firebase deploy --only hosting
```

## 사용 방법

### 번호판 검색
1. 랜딩 페이지에서 번호판 입력 (예: 09루3363)
2. 검색 버튼 클릭 또는 Enter 키 입력
3. 해당 번호판의 상세 페이지로 이동

### 피드백 제공
1. 번호판 상세 페이지에서 해당하는 카운터 버튼 클릭
2. 하루에 각 항목당 1회만 투표 가능
3. 실시간으로 차트 및 숫자 업데이트

### 리더보드 확인
1. 랜딩 페이지에서 "인기 번호판 TOP 10" 섹션 확인
2. 시간대 탭 선택 (오늘, 이번주, 이번달, 올해, 역대)
3. 번호판 클릭하여 상세 정보 확인

### 공유하기
1. 번호판 상세 페이지에서 "공유하기" 버튼 클릭
2. Web Share API 지원 시 공유 메뉴 표시
3. 미지원 시 URL이 클립보드에 자동 복사

## 카운터 항목(초기)

### 고장수리 (노란색)
- 전조등 고장
- 후미등 고장
- 타이어 공기압 점검
- 연료캡 열림

### 안전운전 (빨간색)
- 운행이 위험해요
- 졸음 운전이 걱정되요
- 안전거리 좀 확보해 주세요
- 방향 지시등(깜빡이) 좀 켜 주세요
- 운전 중 스마트폰 사용하지 마세요
- 할많하않

### 감사 (초록색)
- 고맙습니다
- 운전 매너가 좋아요

### 좋아요 (파란색)
- 좋아요 ❤️

## 개인정보 보호

SafeDrive는 사용자 프라이버시를 최우선으로 합니다:

- ✅ 계정 생성 불필요
- ✅ 쿠키 사용 안 함 (LocalStorage만 사용)
- ✅ 개인정보 수집 안 함
- ✅ IP 주소 저장 안 함
- ✅ 완전 익명 사용

## 법적 고지

- **운전 중 사용 금지**: 안전 운전을 최우선으로 하세요
- **비방 금지**: 정보통신망법 제70조 준수
- **안전 목적만**: 악의적 사용 금지

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)
- 모바일 브라우저 (iOS Safari, Android Chrome)

## 성능 최적화

- CDN을 통한 라이브러리 로딩
- CSS 및 JavaScript 압축
- 이미지 최적화
- Firebase 트랜잭션을 통한 원자적 업데이트
- 차트 재사용으로 렌더링 최적화

## 문제 해결

### Firebase 연결 오류
- Firebase 설정이 올바른지 확인
- Firebase Console에서 Realtime Database가 활성화되었는지 확인
- 보안 규칙이 올바르게 설정되었는지 확인

### 번호판 검색 안 됨
- 올바른 형식인지 확인 (예: 09루3363)
- 2-3자리 숫자 + 한글 1자 + 4자리 숫자

### 카운터 증가 안 됨
- 오늘 이미 해당 항목에 투표했는지 확인
- 네트워크 연결 확인
- 브라우저 콘솔에서 오류 메시지 확인

### LocalStorage 할당량 초과
- 브라우저 설정에서 사이트 데이터 삭제
- 7일 이상 된 데이터는 자동으로 정리됨

## 기여하기

이 프로젝트는 오픈소스입니다. 기여를 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 향후 개발 계획

- [ ] 서버 사이드 리더보드 계산 (Firebase Cloud Functions)
- [ ] 실시간 업데이트 (Firebase onValue 리스너)
- [ ] PWA 지원 (오프라인 기능)
- [ ] 다크 모드
- [ ] 다국어 지원 (영어, 일본어)
- [ ] QR 코드 공유
- [ ] 음성 입력

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 연락처

프로젝트 관련 문의나 제안사항이 있으시면 GitHub Issues를 통해 연락해 주세요.

---

**SafeDrive** - 안전한 도로 문화를 함께 만들어갑니다 🚗💚
