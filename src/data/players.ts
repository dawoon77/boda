import { Player, PlayerPosition } from '../types';

// 임시 선수 데이터 (KBO 홈페이지 크롤링 연결 전까지 사용)
// ※ 실제 선수가 아닌 자리 표시용 데이터입니다. 이름·등번호·포지션 모두 임시값이에요.
// TODO: 서버 API(/api/players?team=lg)에서 실제 선수 명단을 불러오도록 변경
const POSITIONS: PlayerPosition[] = ['투수', '포수', '내야수', '외야수'];

// 팀 id를 넣으면 그 팀의 임시 선수 20명을 만들어 돌려줌
export function getPlayersByTeam(teamId: string): Player[] {
  return Array.from({ length: 20 }, (_, i) => {
    const no = i + 1;
    return {
      id: `${teamId}-${no}`,                          // 예: 'lg-7'
      teamId,
      name: `선수 ${String(no).padStart(2, '0')}`,    // 예: '선수 07'
      number: no,
      position: POSITIONS[i % POSITIONS.length],       // 투수 → 포수 → 내야수 → 외야수 순서로 반복
    };
  });
}