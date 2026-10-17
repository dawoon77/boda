import { Player, BatterStats, PitcherStats } from '../types';

// 임시 선수 기록 (KBO 홈페이지 크롤링 연결 전까지 사용)
// ※ 실제 기록이 아닙니다. 선수 id를 기준으로 계산해서 항상 같은 숫자가 나오게만 만든 값이에요.
// TODO: 서버 API(/api/player-stats?id=...)에서 실제 기록을 불러오도록 변경

// 글자(seed)를 넣으면 min~max 사이 숫자를 돌려줌 (같은 글자면 항상 같은 숫자)
function seededNumber(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const x = Math.sin(hash) * 10000;
  const ratio = x - Math.floor(x); // 0 이상 1 미만
  return min + ratio * (max - min);
}

const int = (seed: string, min: number, max: number) => Math.round(seededNumber(seed, min, max));

export function getBatterStats(player: Player): BatterStats {
  const id = player.id;
  const games = int(`${id}-games`, 60, 144);
  const avg = seededNumber(`${id}-avg`, 0.22, 0.34);
  const homeRuns = int(`${id}-hr`, 0, 30);
  return {
    avg,
    games,
    hits: Math.round(games * 3.6 * avg), // 경기당 약 3.6타수로 계산한 안타 수
    homeRuns,
    rbi: Math.round(homeRuns * 2.2 + seededNumber(`${id}-rbi`, 10, 50)),
    stolenBases: int(`${id}-sb`, 0, 30),
    ops: avg + seededNumber(`${id}-ops`, 0.45, 0.62),
  };
}

export function getPitcherStats(player: Player): PitcherStats {
  const id = player.id;
  return {
    era: seededNumber(`${id}-era`, 2.3, 5.8),
    games: int(`${id}-games`, 15, 65),
    wins: int(`${id}-w`, 0, 15),
    losses: int(`${id}-l`, 0, 12),
    saves: int(`${id}-sv`, 0, 30),
    holds: int(`${id}-hld`, 0, 25),
    strikeouts: int(`${id}-so`, 20, 180),
  };
}