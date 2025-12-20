# 💰 SmartSpend

> 스마트한 가계부 관리 앱 - React + Vite로 구축된 현대적인 지출 관리 솔루션

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📝 프로젝트 소개

SmartSpend는 개인 및 가족의 월별/연별 지출을 효율적으로 관리할 수 있는 웹 기반 가계부 애플리케이션입니다. 직관적인 UI와 강력한 데이터 관리 기능으로 재정 상태를 한눈에 파악하고 분석할 수 있습니다.

### ✨ 주요 기능

- 📅 **월별/연도별 지출 관리**: 연도와 월을 선택하여 지출 내역 조회
- 💳 **고정비/변동비 분류**: 정기적인 지출과 일시적 지출 구분 관리
- 📊 **통계 및 분석**: 
  - 월별 지출 추이 막대 그래프
  - 카테고리별 지출 비율 파이 차트
  - 전월 대비 증감액 자동 계산
- 📆 **달력 뷰**: 날짜별 지출 내역 시각화 및 상세 조회
- 🏷️ **카테고리 관리**: 사용자 정의 카테고리 생성/수정/삭제
- 📤 **Excel 연동**: 
  - 월별 데이터 Excel 파일 내보내기
  - Excel 파일 가져오기 (중복 제거)
- 💾 **자동 저장**: LocalStorage 기반 실시간 데이터 저장
- 🔔 **지출 예정 알림**: 다가오는 고정비 지출 미리보기

## 🏗️ 프로젝트 구조

```
src/
├── components/                # React 컴포넌트
│   ├── common/                # 공통 재사용 컴포넌트
│   │   ├── Chip.jsx           # 필터 칩 UI
│   │   ├── TabButton.jsx      # 탭 버튼
│   │   └── Toast.jsx          # 알림 토스트
│   ├── layout/                # 레이아웃 컴포넌트
│   │   ├── Header.jsx         # 헤더 (년/월 선택)
│   │   └── Navigation.jsx     # 하단 네비게이션
│   ├── modals/                # 모달 컴포넌트
│   │   ├── CategoryManageModal.jsx  # 카테고리 관리
│   │   └── ItemInputModal.jsx       # 지출 입력/수정
│   ├── views/                 # 탭별 화면 컴포넌트
│   │   ├── HomeView.jsx       # 홈 (요약 + 달력)
│   │   ├── LedgerView.jsx     # 내역 (테이블)
│   │   ├── StatsView.jsx      # 통계 (차트)
│   │   └── SettingsView.jsx   # 설정
│   └── CalendarView.jsx       # 달력 컴포넌트
├── context/                   # 전역 상태 관리
│   └── BudgetContext.jsx      # Context API
├── hooks/                     # 커스텀 훅 (비즈니스 로직)
│   ├── useBudget.js           # 지출 데이터 관리
│   ├── useCategories.js       # 카테고리 관리
│   └── useExcel.js            # Excel 입출력
├── utils/                     # 유틸리티 함수
│   └── formatters.js          # 숫자/통화 포맷팅
├── constants/                 # 상수
│   └── index.js               # COLOR_PALETTE, FULL_MONTHS
├── App.jsx                    # 메인 앱 컴포넌트
├── index.jsx                  # 진입점
└── styles.css                 # 글로벌 스타일 (Tailwind)
```

## 🛠️ 기술 스택

### Core
- **React 18.x** - UI 라이브러리
- **Vite 5.x** - 빌드 도구 (초고속 HMR)
- **React Context API** - 전역 상태 관리

### Styling
- **TailwindCSS 3.x** - 유틸리티 기반 CSS 프레임워크
- **Pretendard Font** - 한글 웹폰트

### Libraries
- **xlsx** - Excel 파일 읽기/쓰기
- **lucide-react** - 아이콘 라이브러리

### Performance Optimizations
- **useMemo** - 계산 비용이 높은 연산 메모이제이션
- **useCallback** - 함수 참조 안정화로 리렌더링 최적화
- **Context Memoization** - Context value 메모이제이션

## 🚀 시작하기

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

## 💡 사용 방법

### 1. 지출 추가
- 우측 하단의 **+** 버튼 클릭
- 날짜, 카테고리, 금액, 세부내역 입력
- 고정비/변동비 선택 후 저장

### 2. 데이터 분석
- **홈 탭**: 이번 달 총 지출, 전월 대비 증감, 예정된 고정비 확인
- **내역 탭**: 필터링 가능한 상세 지출 내역 테이블
- **통계 탭**: 월별 추이 그래프 및 카테고리별 분석

### 3. Excel 백업/불러오기
- **설정 탭** → **엑셀로 내보내기**: 월별 시트로 구성된 Excel 파일 다운로드
- **설정 탭** → **데이터 불러오기**: Excel 파일 업로드 (중복 자동 제거)

### 4. 카테고리 관리
- **설정 탭** → **카테고리 관리**
- 카테고리 추가/수정/삭제 가능
- 각 카테고리는 고유한 아이콘과 색상 자동 할당

## 📦 데이터 저장

- **저장 방식**: 브라우저 LocalStorage
- **자동 저장**: 데이터 변경 시 실시간 자동 저장
- **키 구조**: `budgetData = { dbData, categories }`
- **월별 키**: `YYYY-MM월` 형식 (예: `2025-1월`)

## 🎨 디자인 특징

- **반응형 디자인**: 모바일/태블릿/데스크톱 완벽 지원
- **다크 모드**: 없음 (라이트 테마 최적화)
- **애니메이션**: Tailwind의 `animate-in` 유틸리티 활용
- **색상 팔레트**: 8가지 구분 가능한 카테고리 색상

## 🔧 주요 개선 이력

### v2.0 (2025-12-21) - 대규모 리팩토링
- ✅ 1,700+ 라인의 단일 파일을 모듈형 구조로 전환
- ✅ Context API 기반 전역 상태 관리 도입
- ✅ 커스텀 훅으로 비즈니스 로직 분리
- ✅ `useMemo`/`useCallback`로 성능 최적화
- ✅ Toast 알림 시스템 구현 (비침습적 UX)
- ✅ Context value 메모이제이션 적용

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 👨‍💻 개발자

**겸이네 가족** - 가계부 관리 솔루션

---

💡 **Tip**: 정기적으로 Excel 백업을 수행하여 데이터를 안전하게 보관하세요!
