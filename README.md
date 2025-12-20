수입/지출 관리 가계부 앱
월별/년별 지출 내역 관리

프로젝트 파일 구조

src/
├── components/
│   ├── common/         # TabButton, Chip
│   ├── layout/         # Header, Navigation
│   ├── modals/         # InputModal, CategoryModal
│   ├── tabs/           # Home, Ledger, Stats, Settings
│   └── CalendarView    # 기존 캘린더 컴포넌트
├── hooks/
│   └── useBudgetData   # 비즈니스 로직 훅
│                       # 데이터 로딩/저장, 카테고리 관리, 파일 연동 로직을 한곳에서 관리
├── utils/
│   └── formatters      # 포맷터 유틸리티
└── App.jsx             # 메인 컨테이너