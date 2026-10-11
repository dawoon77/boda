import { KBOTeam, Match, MatchStatus } from '../types';

export const KBO_TEAMS: KBOTeam[] = [
  {
    id: 'kia',
    name: 'KIA 타이거즈',
    shortName: 'KIA',
    engName: 'KIA Tigers',
    primaryColor: '#EC1C24',
    secondaryColor: '#111111',
    textColor: '#FFFFFF',
    stadium: '광주-기아 챔피언스 필드',
    mascot: '호걸이',
    logoEmoji: '🐯',
    city: '광주'
  },
  {
    id: 'samsung',
    name: '삼성 라이온즈',
    shortName: '삼성',
    engName: 'Samsung Lions',
    primaryColor: '#0066B2',
    secondaryColor: '#C0C0C0',
    textColor: '#FFFFFF',
    stadium: '대구 삼성 라이온즈 파크',
    mascot: '블레오',
    logoEmoji: '🦁',
    city: '대구'
  },
  {
    id: 'lg',
    name: 'LG 트윈스',
    shortName: 'LG',
    engName: 'LG Twins',
    primaryColor: '#C60C30',
    secondaryColor: '#000000',
    textColor: '#FFFFFF',
    stadium: '서울 잠실 야구장',
    mascot: '럭키/스타',
    logoEmoji: '🧑‍🤝‍🧑',
    city: '서울'
  },
  {
    id: 'doosan',
    name: '두산 베어스',
    shortName: '두산',
    engName: 'Doosan Bears',
    primaryColor: '#131230',
    secondaryColor: '#EC1C24',
    textColor: '#FFFFFF',
    stadium: '서울 잠실 야구장',
    mascot: '철웅이',
    logoEmoji: '🐻',
    city: '서울'
  },
  {
    id: 'kt',
    name: 'KT 위즈',
    shortName: 'KT',
    engName: 'KT Wiz',
    primaryColor: '#1D1D1D',
    secondaryColor: '#EF3340',
    textColor: '#FFFFFF',
    stadium: '수원 kt 위즈 파크',
    mascot: '빅/또리',
    logoEmoji: '🧙',
    city: '수원'
  },
  {
    id: 'ssg',
    name: 'SSG 랜더스',
    shortName: 'SSG',
    engName: 'SSG Landers',
    primaryColor: '#CE0E2D',
    secondaryColor: '#A2AAAD',
    textColor: '#FFFFFF',
    stadium: '인천 SSG 랜더스필드',
    mascot: '랜디',
    logoEmoji: '🐶',
    city: '인천'
  },
  {
    id: 'lotte',
    name: '롯데 자이언츠',
    shortName: '롯데',
    engName: 'Lotte Giants',
    primaryColor: '#041E42',
    secondaryColor: '#DD102F',
    textColor: '#FFFFFF',
    stadium: '부산 사직 야구장',
    mascot: '누리/피니',
    logoEmoji: '🦤',
    city: '부산'
  },
  {
    id: 'hanwha',
    name: '한화 이글스',
    shortName: '한화',
    engName: 'Hanwha Eagles',
    primaryColor: '#FF6600',
    secondaryColor: '#333333',
    textColor: '#FFFFFF',
    stadium: '대전 한화생명 이글스파크',
    mascot: '수리',
    logoEmoji: '🦅',
    city: '대전'
  },
  {
    id: 'nc',
    name: 'NC 다이노스',
    shortName: 'NC',
    engName: 'NC Dinos',
    primaryColor: '#002D62',
    secondaryColor: '#C5A059',
    textColor: '#FFFFFF',
    stadium: '창원 NC 파크',
    mascot: '단디/쎄리',
    logoEmoji: '🦕',
    city: '창원'
  },
  {
    id: 'kiwoom',
    name: '키움 히어로즈',
    shortName: '키움',
    engName: 'Kiwoom Heroes',
    primaryColor: '#570514',
    secondaryColor: '#C0C0C0',
    textColor: '#FFFFFF',
    stadium: '서울 고척 스카이돔',
    mascot: '턱돌이/동글이',
    logoEmoji: '🤖',
    city: '서울'
  }
];

// Popular ballpark foods list to offer in selection
export const FAMOUS_BALLPARK_FOODS = [
  { name: '광주 챔필 크림새우', stadiumId: 'kia' },
  { name: '광주 인켈 치킨', stadiumId: 'kia' },
  { name: '대구 라팍 납작만두', stadiumId: 'samsung' },
  { name: '대구 푸라닭 치킨', stadiumId: 'samsung'},
  { name: '잠실 원샷 원컵삼겹살', stadiumId: 'lg'},
  { name: '잠실 신철판 김치말이삼겹살', stadiumId: 'doosan'},
  { name: '수원 요아정 만두/진미통닭', stadiumId: 'kt'},
  { name: '수원 보영만두 + 군만두', stadiumId: 'kt'},
  { name: '인천 라팍 크림새우', stadiumId: 'ssg'},
  { name: '인천 스타벅스 슬래머', stadiumId: 'ssg'},
  { name: '사직 소문난 동래파전', stadiumId: 'lotte'},
  { name: '사직 허니버터 떡볶이', stadiumId: 'lotte'},
  { name: '대전 만년닭강정', stadiumId: 'hanwha'},
  { name: '대전 아줌마돈까스', stadiumId: 'hanwha'},
  { name: '창원 알통떡강정', stadiumId: 'nc'},
  { name: '창원 아귀찜', stadiumId: 'nc'},
  { name: '고척 크림새우', stadiumId: 'kiwoom'},
  { name: '고척 뉴욕버거', stadiumId: 'kiwoom'},
];

// Seeded pseudorandom generator based on date string to make schedules deterministic and identical across reloads
function seededRandom(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

/**
 * Procedurally generates direct matched schedules for KBO 2026.
 * All teams play 6 games a week (Tuesday - Sunday, resting on Monday).
 */
export function generateSchedule2026(): Match[] {
  const matches: Match[] = [];
  const startDate = new Date('2026-03-20'); // Season begins late March
  const endDate = new Date('2026-09-30');   // Season ends late September
  const todayStr = '2026-05-26'; // May 26 is current time

  let currentDate = new Date(startDate);

  // Define circular rotation pairs of team indices for KBO matchups
  const teamIds = KBO_TEAMS.map(t => t.id);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // No games on Mondays
    if (dayOfWeek !== 1) {
      const dateString = currentDate.toISOString().split('T')[0];
      const randVal = seededRandom(dateString);

      // Determine match starting times based on weekday or weekend
      let matchTime = '18:30';
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        const month = currentDate.getMonth() + 1; // 0-indexed
        if (month <= 4 || month >= 9) {
          matchTime = '14:00'; // Spring/Autumn weekends
        } else if (month >= 7 && month <= 8) {
          matchTime = '18:00'; // Hot mid-summer weekends
        } else {
          matchTime = '17:00'; // May/June weekends
        }
      }

      // 5 matches per day (10 teams)
      // We shuffle the pairing based on a deterministic rotation pattern triggered by the date number
      const dateNum = currentDate.getDate();
      const monthNum = currentDate.getMonth();
      const offset = (dateNum + monthNum * 3) % 9;

      // Simple round robin matchup matching
      const pairedIndices: [number, number][] = [];
      const visited = new Set<number>();

      for (let i = 0; i < 5; i++) {
        let homeIdx = -1;
        let awayIdx = -1;

        // Dynamic but deterministic pair picking
        for (let attempt = 0; attempt < 10; attempt++) {
          const testHome = (i + attempt + offset) % 10;
          if (!visited.has(testHome)) {
            homeIdx = testHome;
            visited.add(homeIdx);
            break;
          }
        }

        for (let attempt = 1; attempt <= 10; attempt++) {
          const testAway = (homeIdx + attempt + offset * 2) % 10;
          if (!visited.has(testAway)) {
            awayIdx = testAway;
            visited.add(awayIdx);
            break;
          }
        }

        if (homeIdx !== -1 && awayIdx !== -1) {
          pairedIndices.push([homeIdx, awayIdx]);
        }
      }

      // Create Match structures
      pairedIndices.forEach(([homeIdx, awayIdx], matchIndex) => {
        const homeTeam = teamIds[homeIdx];
        const awayTeam = teamIds[awayIdx];
        const matchId = `match-2026-${dateString}-${homeTeam}-vs-${awayTeam}`;

        // Determine status based on relative timeline
        let status: MatchStatus = 'scheduled';
        let homeScore: number | undefined;
        let awayScore: number | undefined;
        let inning: string | undefined;

        if (dateString < todayStr) {
          status = 'completed';
          // Deterministic scores
          const seed = seededRandom(matchId);
          homeScore = Math.floor(seed * 8) + 1;
          awayScore = Math.floor(seededRandom(matchId + '_away') * 7) + 1;
          // Avoid draw (draw is rare, but possible)
          if (homeScore === awayScore) {
            if (seed > 0.5) homeScore += 1;
            else awayScore += 1;
          }
          inning = '종료';
        } else if (dateString === todayStr) {
          // Today's matches! Let's make them 'live' or starting soon
          status = 'live'; 
          inning = '5회말';
          // Live default initial scores
          homeScore = 3;
          awayScore = 2;
        } else {
          status = 'scheduled';
        }

        matches.push({
          id: matchId,
          date: dateString,
          time: matchTime,
          homeTeamId: homeTeam,
          awayTeamId: awayTeam,
          homeScore,
          awayScore,
          status,
          inning
        });
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return matches;
}

export const MATCHES_DATA = generateSchedule2026();

// Helper to get KBO Team details by ID
export function getTeamById(id: string): KBOTeam {
  return KBO_TEAMS.find(t => t.id === id) || KBO_TEAMS[0];
}

// Live Commentary details generator to support second-by-second feeling updates
const HITTER_NAMES = ['김도영', '구자욱', '강백호', '노시환', '양의지', '최정', '이우성', '황재균', '홍창기', '레이예스', '전준우', '소크라테스', '박민우', '정수빈', '손아섭', '김혜성', '송성문', '오지환', '문성주', '채은성'];
const PITCHER_NAMES = ['양현종', '원태인', '곽빈', '고영표', '문동주', '류현진', '김광현', '앤더슨', '반즈', '네일', '쿠에바스', '이의리', '켈리', '임찬규', '하트', '헤이수스', '최지민', '오승환', '김택연'];

export function generateNextLiveState(currentMatch: Match, tick: number): Match {
  const matchCopy = { ...currentMatch };
  const rand = seededRandom(currentMatch.id + '_' + tick);
  
  // Base details
  if (!matchCopy.liveDetails) {
    matchCopy.liveDetails = {
      outs: 1,
      balls: 2,
      strikes: 1,
      bases: [true, false, false],
      batter: HITTER_NAMES[Math.floor(rand * HITTER_NAMES.length)],
      pitcher: PITCHER_NAMES[Math.floor(seededRandom(currentMatch.id + 'pitch_' + tick) * PITCHER_NAMES.length)],
      lastEvent: '경기 준비 중입니다.',
      lastUpdated: new Date().toISOString()
    };
  }

  const details = { ...matchCopy.liveDetails };
  const strikeVal = Math.floor(seededRandom(tick + '_s') * 5); // 0-4

  // Run dynamic simulation transitions
  if (currentMatch.status === 'live') {
    // Modify live game state based on simulated tick
    if (tick % 15 === 0) {
      // Someting big happened: hit, walk, out, strikeout, homerun
      const actionRand = seededRandom(tick + '_act');
      if (actionRand < 0.3) {
        // Strikeout or out
        details.outs = (details.outs + 1) % 3;
        details.balls = 0;
        details.strikes = 0;
        if (details.outs === 0) {
          // Inning changes!
          details.bases = [false, false, false];
          const isTop = matchCopy.inning?.endsWith('초');
          const inningNum = parseInt(matchCopy.inning || '5') || 5;
          if (isTop) {
            matchCopy.inning = `${inningNum}회말`;
            details.lastEvent = `이닝 종료! 공수 교대합니다. ${matchCopy.inning}이 시작됩니다.`;
          } else {
            const nextInning = inningNum + 1;
            if (nextInning > 9) {
              matchCopy.status = 'completed';
              matchCopy.inning = '경기 종료';
              details.lastEvent = '경기 종료! 수고하셨습니다.';
            } else {
              matchCopy.inning = `${nextInning}회초`;
              details.lastEvent = `이닝 종료! 공수 교대합니다. ${matchCopy.inning}이 시작됩니다.`;
            }
          }
        } else {
          details.lastEvent = `${details.batter} 선수, 삼진 아웃! 다음 타자 준비합니다.`;
        }
        details.batter = HITTER_NAMES[Math.floor(seededRandom(tick + '_bat') * HITTER_NAMES.length)];
      } else if (actionRand < 0.6) {
        // Safe hit (안타)
        const hitType = seededRandom(tick + '_hit') < 0.25 ? '디스플레이 홈런! 💥' : '시원한 안타! ⚾';
        
        if (hitType.includes('홈런')) {
          let scoreGained = 1;
          details.bases.forEach(b => { if (b) scoreGained++; });
          
          const isTop = matchCopy.inning?.endsWith('초');
          if (isTop) {
            matchCopy.awayScore = (matchCopy.awayScore || 0) + scoreGained;
          } else {
            matchCopy.homeScore = (matchCopy.homeScore || 0) + scoreGained;
          }
          
          details.bases = [false, false, false];
          details.lastEvent = `🎉 대형 홈런! 타자 주자 모두 홈인! (${scoreGained}점 득점)`;
        } else {
          // Standard single hit
          const isTop = matchCopy.inning?.endsWith('초');
          let scoreGained = 0;
          if (details.bases[2]) { scoreGained++; details.bases[2] = false; }
          if (details.bases[1]) { details.bases[2] = true; details.bases[1] = false; }
          if (details.bases[0]) { details.bases[1] = true; }
          details.bases[0] = true; // Batter to 1st base

          if (scoreGained > 0) {
            if (isTop) matchCopy.awayScore = (matchCopy.awayScore || 0) + scoreGained;
            else matchCopy.homeScore = (matchCopy.homeScore || 0) + scoreGained;
            details.lastEvent = `🔥 ${details.batter} 안타! 주자 홈인! 1점 추가!`;
          } else {
            details.lastEvent = `🎯 ${details.batter} 정교한 안타성 라인드라이브 타구! 안타입니다!`;
          }
        }
        
        details.balls = 0;
        details.strikes = 0;
        details.batter = HITTER_NAMES[Math.floor(seededRandom(tick + '_bat') * HITTER_NAMES.length)];
      } else {
        // Base on balls (볼넷)
        details.balls = 0;
        details.strikes = 0;
        let scoreGained = 0;
        
        if (details.bases[0] && details.bases[1] && details.bases[2]) {
          scoreGained = 1; // Miller walk
        } else if (details.bases[0] && details.bases[1]) {
          details.bases[2] = true;
        } else if (details.bases[0]) {
          details.bases[1] = true;
        } else {
          details.bases[0] = true;
        }
        
        const isTop = matchCopy.inning?.endsWith('초');
        if (scoreGained > 0) {
          if (isTop) matchCopy.awayScore = (matchCopy.awayScore || 0) + scoreGained;
          else matchCopy.homeScore = (matchCopy.homeScore || 0) + scoreGained;
          details.lastEvent = `💥 밀어내기 볼넷! 주자 만루 상황에서 밀려납니다! 1점 득점!`;
        } else {
          details.lastEvent = `👀 타자 침착하게 볼을 골라내 볼넷으로 걸어나갑니다. 무사 사사구!`;
        }
        
        details.batter = HITTER_NAMES[Math.floor(seededRandom(tick + '_bat') * HITTER_NAMES.length)];
      }
    } else {
      // pitch simulation: strike, ball, foul
      if (strikeVal === 0 || strikeVal === 1) {
        details.strikes = (details.strikes + 1) % 3;
        details.lastEvent = `⚡ 스트라이크! 정교한 슬라이더가 보더라인에 걸칩니다.`;
        if (details.strikes === 0) {
          details.outs = (details.outs + 1) % 3;
          details.lastEvent = `💀 타자 루킹 삼진 아웃! 투수의 멋진 제구였습니다.`;
          details.balls = 0;
          details.batter = HITTER_NAMES[Math.floor(seededRandom(tick + '_bat_' + tick) * HITTER_NAMES.length)];
        }
      } else if (strikeVal === 2 || strikeVal === 3) {
        details.balls = (details.balls + 1) % 4;
        details.lastEvent = `🟢 볼! 바깥쪽 낮게 흐르는 패스트볼입니다.`;
        if (details.balls === 0) {
          details.lastEvent = `👀 볼넷입니다! 타자 주자 1루로 걸어나갑니다.`;
          // Move runner
          if (details.bases[0] && details.bases[1] && details.bases[2]) {
            const isTop = matchCopy.inning?.endsWith('초');
            if (isTop) matchCopy.awayScore = (matchCopy.awayScore || 0) + 1;
            else matchCopy.homeScore = (matchCopy.homeScore || 0) + 1;
          } else if (details.bases[0] && details.bases[1]) {
            details.bases[2] = true;
          } else if (details.bases[0]) {
            details.bases[1] = true;
          } else {
            details.bases[0] = true;
          }
          details.batter = HITTER_NAMES[Math.floor(seededRandom(tick + '_bat_' + tick) * HITTER_NAMES.length)];
        }
      } else {
        details.lastEvent = `💥 파울볼! 타구는 관중석 뒤쪽으로 높이 뜹니다.`;
        if (details.strikes < 2) {
          details.strikes += 1;
        }
      }
    }
  }

  details.lastUpdated = new Date().toLocaleTimeString();
  matchCopy.liveDetails = details;
  return matchCopy;
}
