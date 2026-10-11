// 1. 폰트 크기 명세 (전체 서비스의 텍스트 크기를 한눈에 조율하고 수정할 수 있도록 정밀 정의)
export const FONT_SIZES = {
  // 대형 헤드라인 / 타이틀 (상대 스크린의 메인 타이틀, 로고 크기 등)
  display: "text-2xl",         // 24px
  xl: "text-xl",               // 20px
  lg: "text-lg",               // 18px
  
  // 섹션 제목 / 중급 강조 (카드 내부 타이틀, 주요 위젯 및 헤더)
  headingLg: "text-[15px]",    // 15px
  headingMd: "text-[13px]",    // 13px
  
  // 본문 텍스트 표준 크기 (일기 내용, 버튼 텍스트, 설명글 등)
  body: "text-xs",             // 12px
  
  // 부가 설명 / 캡션 및 배지용 초소형 크기들
  caption: "text-[11px]",      // 11px
  captionMini: "text-[10px]",  // 10px
  nano: "text-[9px]",          // 9px
};

// 2. 공통 색상 토큰 (클래스 매핑용)
export const COLORS = {
  // 메인 브랜드 컬러
  brand: "text-brand",
  brandBg: "bg-brand",
  brandHover: "hover:bg-brand-hover",
  brandLight: "bg-brand-light text-brand",
  
  // 기본 피드 텍스트 및 배경
  textMain: "text-[#191f28]",       // 토스 고유 진회색 (Primary)
  textMuted: "text-[#4e5968]",      // 중간 회색 (Secondary)
  textSub: "text-[#8b95a1]",        // 옅은 캡션용 회색 (Muted/Tertiary)
  bgLight: "bg-[#f2f4f6]",          // 부드러운 토스식 전체 배경색

  // 상태 색상
  win: "text-[#f04452]",            // 승리 (빨간색)
  lose: "text-brand",               // 패배 (보라색 메인 컬러로 표기)
  draw: "text-[#e5e8eb]",           // 무승부 (연회색 또는 중립)
};

// 3. 타이포그래피 (폰트 크기, 패밀리, 자간, 색상 조합)
export const TYPOGRAPHY = {
  // 최상위 대형 헤드라인 (Onboarding, 대형 대시보드 타이틀)
  display: `font-display ${FONT_SIZES.display} font-bold tracking-tight text-[#191f28] leading-tight`,
  
  // 섹션 제목 (카드 내부 타이틀, 주요 위젯 헤더)
  headingLg: `${FONT_SIZES.headingLg} font-bold text-[#191f28] leading-tight tracking-tight`,
  headingMd: `${FONT_SIZES.headingMd} font-bold text-[#191f28] tracking-tight`,
  
  // 본문 본격 강조 텍스트
  bodyBold: `${FONT_SIZES.body} font-bold text-[#191f28]`,
  bodyMedium: `${FONT_SIZES.body} font-semibold text-[#4e5968]`,
  bodyRegular: `${FONT_SIZES.body} font-medium text-[#4e5968] leading-relaxed`,

  // 캡션 및 부가 설명용 폰트
  caption: `${FONT_SIZES.caption} font-bold text-[#8b95a1]`,
  captionMuted: `${FONT_SIZES.captionMini} text-[#8b95a1] font-bold tracking-tight`,

  // 배지 라벨 전용 볼드체
  badgeText: `${FONT_SIZES.caption} font-bold px-2.5 py-1 rounded-full inline-block`,
  badgeTextMini: `${FONT_SIZES.nano} font-bold px-1.5 py-0.2 rounded-md shrink-0`,
};

// 4. 버튼 크기, 형태 및 색상 조합
export const BUTTONS = {
  // 메인 중심 액션 버튼 (프로필 등록 완료, 로그인 동의 등 - High Emphasis)
  primary: `w-full h-13 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl ${FONT_SIZES.headingMd} flex items-center justify-center gap-1.5 transition duration-150 active:scale-[0.99] shadow-sm cursor-pointer`,
  
  // 하단 고정 플로팅 액션 버튼 (FAB - 새 직관 기록 등록 전용)
  fab: "absolute bottom-24 right-5 z-30 w-13 h-13 rounded-full text-white flex items-center justify-center shadow-[0_8px_24px_rgba(71,18,147,0.35)] bg-brand hover:bg-brand-hover hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer",

  // 카드/리스트 내부 소형 버튼 (Compact Button - Medium Emphasis)
  secondary: `px-3 py-1.5 bg-brand-light text-brand font-bold rounded-xl ${FONT_SIZES.caption} hover:opacity-90 active:scale-[0.98] transition cursor-pointer flex items-center gap-1`,

  // 닫기 및 기본 취소 버튼 (Low Emphasis)
  darkAction: `w-full h-13 bg-[#191f28] hover:bg-zinc-800 text-white font-bold rounded-2xl ${FONT_SIZES.headingMd} flex items-center justify-center transition active:scale-[0.99] shadow-sm cursor-pointer`,
  lightAction: `w-full h-13 bg-[#f2f4f6] hover:bg-[#e5e8eb] text-[#4e5968] font-bold rounded-2xl ${FONT_SIZES.headingMd} flex items-center justify-center transition active:scale-[0.99] cursor-pointer`,

  // 원형 소형 버튼 및 아이콘 보조 도구들
  roundAction: `w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#e5e8eb] flex items-center justify-center font-bold text-[#4e5968] transition duration-150 cursor-pointer ${FONT_SIZES.lg} select-none`,
  roundIcon: "w-10 h-10 rounded-full bg-white border border-zinc-200/80 text-[#4e5968] hover:bg-[#f2f4f6] flex items-center justify-center transition shadow-2xs cursor-pointer",
};

// 5. 레이아웃 & 카드 & 입력 필드 공통 형태
export const LAYOUT = {
  // 토스 특유의 둥글고 경계선이 살짝 있는 화이트 카드 구조
  card: "bg-white border border-[#e5e8eb] rounded-3xl p-5 shadow-xs",
  cardInteractive: "bg-white border border-[#e5e8eb] hover:border-brand/40 rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.012)] transition duration-200 cursor-pointer transform active:scale-[0.995] relative overflow-hidden",
  
  // 입력 필드 (정갈한 회색 배경, 포커스 시 테두리와 배경색 변화)
  input: `w-full bg-[#f2f4f6] focus:bg-white border border-transparent focus:border-brand font-semibold rounded-2xl px-4 py-3 ${FONT_SIZES.body} text-[#191f28] focus:outline-none transition-all`,
  textarea: `w-full bg-[#f2f4f6] focus:bg-white border border-transparent focus:border-brand rounded-2xl px-4 py-3.5 ${FONT_SIZES.body} text-[#191f28] focus:outline-none transition-all resize-none leading-relaxed font-semibold`,
};

// 5. 공통 UI 및 통계 리포트 관련 텍스트 상수
export const TEXTS = {
  totalVisits: "총 방문",
  win: "승",
  loss: "패",
  draw: "무",
  attendanceWinRate: "직관기록 승률",
  yearlyAttendance: "년도별 직관기록",
  opponentWinRate: "상대 구단별 직관 승률 전적",
  noRecords: "등록된 직관 기록이 없습니다.",
  noRecordsOpponent: "기록 없음",
  years: "년도",
  winRate: "승률",
};
