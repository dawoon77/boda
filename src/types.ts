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