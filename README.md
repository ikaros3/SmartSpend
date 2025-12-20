# 💰 SmartSpend (스마트스펜드)

**심플하고 직관적인 우리 가족 맞춤형 가계부 앱**

SmartSpend는 수입과 지출을 월별, 년별로 관리하고 통계 분석 차트를 통해 소비 습관을 한눈에 확인할 수 있는 React 기반의 가계부 애플리케이션입니다.

---

## 🚀 주요 기능

- **📊 월별 지출 통계**: 바차트와 파이차트를 통한 시각적 소비 분석
- **📅 스마트 캘린더**: 날짜별 지출 내역 확인 및 일정 기반 고정비 관리
- **📝 간편한 지출 내역 관리**: 변동비/고정비 항목별 CRUD 및 필터링 기능
- **💾 데이터 백업 및 엑셀 연동**: 로컬 저장소 기반 데이터 보존 및 엑셀(Excel) 파일 업로드/다운로드 지원
- **🎨 프리미엄 UI**: Lucide 아이콘과 현대적인 디자인 시스템 적용

---

## 📂 프로젝트 파일 구조

```text
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/          # 공통 컴포넌트 (TabButton, Chip 등)
│   ├── layout/          # 레이아웃 컴포넌트 (Header, Navigation)
│   ├── modals/          # 기능별 모달 (InputModal, CategoryModal)
│   ├── tabs/            # 메인 탭 컴포넌트 (Home, Ledger, Stats, Settings)
│   └── CalendarView/    # 대시보드 내 캘린더 뷰
├── hooks/               # 커스텀 훅
│   └── useBudgetData    # 비즈니스 로직 및 상태 관리 통합 훅
├── utils/               # 유틸리티 함수
│   └── formatters       # 통화 및 숫자 포맷터
└── App.jsx              # 메인 애플리케이션 조립 및 라우팅
```

---

## 🛠 기술 스택

- **Core**: React, Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide-React
- **Library**: SheetJS (XLSX) for Excel operations
- **State**: React Hooks (useState, useMemo, useEffect)

---

## 🔧 설치 및 실행

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```