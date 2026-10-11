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
