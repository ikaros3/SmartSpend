# Firebase Emulator 사용 가이드

## 로컬 개발 환경 설정

### 1. Firebase Emulator 시작

두 개의 터미널을 열어주세요:

**터미널 1: Firebase Emulator 실행**
```bash
npm run dev:emulator
```

이 명령은 다음 서비스를 시작합니다:
- 📧 Auth Emulator: http://127.0.0.1:9099
- 📊 Firestore Emulator: http://127.0.0.1:8080
- 🎛️ Emulator UI: http://127.0.0.1:4000 (데이터 확인 및 관리)

**터미널 2: Vite 개발 서버 실행**
```bash
npm run dev
```

- 🌐 앱: http://localhost:5173

### 2. 환경 구분

#### 개발 환경 (Emulator)
- `.env.development` 파일에서 `VITE_USE_EMULATOR=true` 설정
- `npm run dev`로 실행하면 자동으로 에뮬레이터 연결
- **무료 할당량 소비 없음** ✅
- 로컬 데이터만 사용 (영구 저장 안됨)

#### 프로덕션 환경 (실제 Firebase)
- `.env.production` 파일에서 `VITE_USE_EMULATOR=false` 설정
- `npm run build && firebase deploy`로 배포
- 실제 Firebase 서비스 사용
- 데이터 영구 저장

### 3. Emulator UI 사용법

http://127.0.0.1:4000 접속 후:
- **Authentication**: 테스트 사용자 확인
- **Firestore**: 데이터베이스 내용 확인 및 수동 수정
- **데이터 내보내기/가져오기** 가능

### 4. 개발 워크플로우

```bash
# 1. Emulator 시작 (터미널 1)
npm run dev:emulator

# 2. 개발 서버 시작 (터미널 2)
npm run dev

# 3. http://localhost:5173 접속하여 개발

# 4. 충분한 테스트 후 프로덕션 배포
npm run build
firebase deploy
```

### 5. 주의사항

⚠️ **Emulator는 메모리 내 데이터만 저장**
- Emulator를 종료하면 데이터가 모두 사라집니다
- 테스트 데이터를 유지하려면 Emulator UI에서 내보내기/가져오기 사용

⚠️ **프로덕션 배포 전 확인**
- `.env.production`에서 `VITE_USE_EMULATOR=false` 확인
- 빌드 후 배포하면 실제 Firebase 사용

### 6. 문제 해결

**Emulator가 시작되지 않는 경우:**
```bash
# Java가 설치되어 있는지 확인
java -version

# Firebase CLI 최신 버전 확인
firebase --version
```

**포트 충돌 시:**
`firebase.json`의 `emulators` 섹션에서 포트 번호 변경
