export interface KBOTeam {
  id: string;
  name: string;
  shortName: string;
  engName: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  stadium: string;
  mascot: string;
  logoEmoji: string;
  city: string;
}

export interface MatchLiveDetails {
  outs: number;
  balls: number;
  strikes: number;
  bases: [boolean, boolean, boolean]; // [1루, 2루, 3루]
  batter: string;
  pitcher: string;
  lastEvent: string;
  lastUpdated: string; // YYYY-MM-DD HH:MM:SS
}

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'canceled';

export interface Match {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  inning?: string; // e.g., "5회초", "9회말", "종료"
  liveDetails?: MatchLiveDetails;
  stadium?: string;
}

export interface AttendanceRecord {
  id: string; // can match matchId or be custom
  matchId?: string;
  date: string; // YYYY-MM-DD
  opponentTeamId: string;
  isHome: boolean;
  stadium: string;
  result: 'win' | 'lose' | 'draw';
  ourScore: number;
  oppScore: number;
  seats: string;
  ticketPrice?: number;
  diaryContent: string;
  foods: string[];
  satisfactionRating: number; // 1 to 5
  foodsRating: number; // 1 to 5
  cheerRating: number; // 1 to 5
  createdTime: string;
  imageUrl?: string;
  imageUrls?: string[];
  foodImageUrls?: string[];
}

export interface UserProfile {
  nickname: string;
  favoriteTeamId: string;
  isLoggedIn: boolean;
  provider?: 'kakao' | 'naver' | 'google';
  email?: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  content: string;
  isImportant?: boolean; // true : 목록 맨 위 + '중요' 배지
}

export interface Term {
  id: string;
  title: string;
  effectiveDate: string; // 시행일 YYYY-MM-DD
  content: string;
}

export type InquiryCategory = '서비스 이용' | '오류 신고' | '기능 제안' | '기타';

export interface Inquiry {
  id: string;
  category: InquiryCategory;
  title: string;
  content: string;
  createdAt: string;               // 작성일 YYYY-MM-DD
  status: 'waiting' | 'answered';  // 답변 대기 / 답변 완료
  answer?: string;                 // 운영자 답변 (답변 완료일 때만)
  answeredAt?: string;             // 답변일 YYYY-MM-DD
}

export type PlayerPosition = '투수' | '포수' | '내야수' | '외야수';

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;           // 등번호
  position: PlayerPosition;
}

export interface BatterStats {
  avg: number;          // 타율
  games: number;        // 경기
  hits: number;         // 안타
  homeRuns: number;     // 홈런
  rbi: number;          // 타점
  stolenBases: number;  // 도루
  ops: number;          // OPS
}

export interface PitcherStats {
  era: number;          // 평균자책점
  games: number;        // 경기
  wins: number;         // 승
  losses: number;       // 패
  saves: number;        // 세이브
  holds: number;        // 홀드
  strikeouts: number;   // 탈삼진
}

export type HomeSectionId = 
  | 'liveMatch' 
  | 'nextMatch' 
  | 'teamCalendar' 
  | 'teamStandings' 
  | 'playerRankings';

export interface HomeSectionConfig {
  id: HomeSectionId;
  name: string;
  description: string;
  enabled: boolean;
}

// ─── 커뮤니티 ───
export type CommunityCategory = 'seat' | 'food' | 'goods' | 'etc'; // 좌석 / 음식 / 굿즈 / 기타

// 한눈에 보기 항목 하나 (예: { label: '응원 분위기', value: '응원석이라 열기 최고' })
export interface CommunityHighlight {
  label: string;
  value: string;
}

export interface CommunityComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;   // 작성 시각 (ISO 형식)
  parentId?: string;   // 답글이면 원래 댓글의 id (답글의 답글도 같은 원래 댓글 아래에 붙음)
  mentionTo?: string;  // 답글 대상 닉네임 (@닉네임 표시용, 나중에 알림 보낼 때도 사용)
  editedAt?: string;   // 수정한 시각 (있으면 "(수정됨)" 표시)
  isDeleted?: boolean; // 삭제됨 (답글이 달린 댓글을 지우면 "삭제된 댓글입니다."로 자리만 남김)
}

// 답글을 달 때 넘겨주는 정보
export interface CommentReply {
  parentId: string;    // 원래 댓글 id
  mentionTo: string;   // 답글 대상 닉네임
}

export interface CommunityPost {
  id: string;
  category: CommunityCategory;
  author: string;
  createdAt: string;        // 작성 시각 (ISO 형식)
  editedAt?: string;        // 글을 수정한 시각 (있으면 "수정됨" 표시)
  content: string;          // 후기·내용 (직접 쓴 글)
  highlights?: CommunityHighlight[]; // 한눈에 보기 항목 (후기 도우미에서 고른 것, 기타 제외)
  imageUrls: string[];      // 사진 주소 목록
  likeCount: number;        // 좋아요 수
  likedByMe: boolean;       // 내가 좋아요를 눌렀는지
  comments: CommunityComment[];

  // 카테고리마다 쓰는 항목이 달라서 전부 선택(?)으로 둠
  stadium?: string;         // 좌석·음식: 구장
  teamId?: string;          // 굿즈: 구단 / 기타: 구단 (없으면 "전체")
  price?: number;           // 좌석·음식·굿즈: 가격
  seatZone?: string;        // 좌석: 구역
  seatBlock?: string;       // 좌석: 블록
  seatRow?: string;         // 좌석: 열
  restaurant?: string;      // 음식: 음식점
  menu?: string;            // 음식: 메뉴
  goodsType?: string;       // 굿즈: 종류
  productName?: string;     // 굿즈: 상품명 (예: 먼작귀 콜라보 인형, 서울 유니폼)
  purchasePlace?: string;   // 굿즈: 구매처
  size?: string;            // 굿즈: 사이즈 (유니폼일 때)
  title?: string;           // 제목 (모든 카테고리, 글쓰기에서 필수)
}

// 글쓰기 화면에서 넘겨주는 값 (id·작성자·날짜·좋아요·댓글은 App에서 붙임)
export type CommunityPostInput = Omit<CommunityPost, 'id' | 'author' | 'createdAt' | 'editedAt' | 'likeCount' | 'likedByMe' | 'comments'>;