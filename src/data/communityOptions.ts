import { KBO_TEAMS } from './kboData';
import { CommunityCategory, CommunityPost } from '../types';

// ─────────────────────────────────────────────
// 커뮤니티에서 쓰는 선택지·표시용 함수 모음
// ─────────────────────────────────────────────

// 상단 카테고리 탭
export const CATEGORY_TABS: { key: 'all' | CommunityCategory; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'seat', label: '좌석' },
  { key: 'food', label: '음식' },
  { key: 'goods', label: '굿즈' },
  { key: 'etc', label: '기타' },
];

// 카테고리 → 화면에 보일 이름
export const CATEGORY_LABELS: Record<CommunityCategory, string> = {
  seat: '좌석',
  food: '음식',
  goods: '굿즈',
  etc: '기타',
};

// 카테고리 배지 색상 (좌석: 파랑, 음식: 주황, 굿즈: 초록, 기타: 회색)
export const CATEGORY_BADGE_CLASS: Record<CommunityCategory, string> = {
  seat: 'bg-[#e8f3ff] text-[#1b64da]',
  food: 'bg-[#fff3e6] text-[#e8590c]',
  goods: 'bg-[#e9f8ee] text-[#16803c]',
  etc: 'bg-[#f2f4f6] text-[#4e5968]',
};

// 2025 KBO 정규시즌 최종 순위 (콤보창 정렬 기준)
export const TEAM_RANK_2025 = ['lg', 'hanwha', 'ssg', 'samsung', 'nc', 'kt', 'lotte', 'kia', 'doosan', 'kiwoom'];

// 콤보창에 보여줄 구단 목록 (2025 순위 순)
export const TEAMS_BY_RANK = TEAM_RANK_2025
  .map((teamId) => KBO_TEAMS.find((team) => team.id === teamId))
  .filter((team): team is (typeof KBO_TEAMS)[number] => !!team);

// 구단 id → 커뮤니티에서 쓰는 홈구장 이름 ("구장명 (지역)" 형식)
// ※ kboData.ts의 stadium과 따로 관리 (형식이 달라서). 대전은 2025년 개장한 신구장 기준
export const TEAM_STADIUM: Record<string, string> = {
  lg: '잠실야구장 (서울)',
  hanwha: '한화생명 볼파크 (대전)',
  ssg: 'SSG 랜더스필드 (인천)',
  samsung: '삼성 라이온즈 파크 (대구)',
  nc: 'NC 파크 (창원)',
  kt: 'KT 위즈 파크 (수원)',
  lotte: '사직야구장 (부산)',
  kia: '기아 챔피언스 필드 (광주)',
  doosan: '잠실야구장 (서울)',
  kiwoom: '고척 스카이돔 (서울)',
};

// 구장 목록: 2025 순위 순, 중복 제거 (잠실은 1위 LG 자리에 한 번만 나옴)
export const STADIUMS: string[] = Array.from(new Set(TEAM_RANK_2025.map((teamId) => TEAM_STADIUM[teamId])));

// 구단 id → 홈구장 이름 (전체 탭에서 구단을 고르면 홈구장의 좌석·음식 글도 같이 보여줄 때 사용)
export const getTeamStadium = (teamId: string) => TEAM_STADIUM[teamId];

// 좌석 구역 (블록·열은 구장마다 달라서 직접 입력)
export const SEAT_ZONES = ['1루 내야', '3루 내야', '중앙(포수 뒤)', '1루 외야', '3루 외야', '테이블석', '응원석', '기타'];

// 굿즈 종류
export const GOODS_TYPES = ['유니폼', '모자', '인형', '응원도구', '기타'];

// 유니폼 사이즈
export const UNIFORM_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

// ─────────────────────────────────────────────
// 한눈에 보기 (후기 작성 도우미)
//  - 버튼을 누르면 선택지가 펼쳐지고, 고르면 "항목 + 선택지" 배지로 저장됨 (CommunityPost.highlights)
//  - options가 비어 있으면 선택지 대신 직접 입력칸이 나옴 (template은 입력칸 예시 문구)
// ─────────────────────────────────────────────
export interface ReviewHelper {
  label: string;
  options: string[];
  template?: string;
}

export const REVIEW_HELPERS: Record<Exclude<CommunityCategory, 'etc'>, ReviewHelper[]> = {
  seat: [
    { label: '응원 분위기', options: ['응원석이라 열기 최고', '적당히 즐길 만함', '조용히 보기 좋음'] },
    { label: '시야 방해', options: ['방해 없이 잘 보임', '그물망이 조금 신경 쓰임', '기둥·구조물에 가려짐', '앞사람 때문에 가려짐'] },
    { label: '추천 대상', options: ['응원파', '커플', '가족·아이와', '혼자 관람'] },
  ],
  food: [
    { label: '위치', options: ['출입구 근처', '내야 통로', '외야 쪽', '구장 밖에서 사 옴'] },
    { label: '대기 시간', options: ['바로 받음', '10분 내외', '20분 이상'] },
    { label: '양', options: ['혼자 먹기 딱', '2명이 나눠 먹기 좋음', '3명 이상'] },
    { label: '매운 정도', options: ['안 매움', '살짝 매움', '많이 매움'] },
    { label: '재구매', options: ['또 사 먹을래요', '한 번이면 충분', '비추천'] },
  ],
  goods: [
    { label: '내 체형', options: [], template: '키 175cm / 평소 L' },
    { label: '사이즈 착용감', options: ['평소 사이즈 그대로 딱 맞아요', '한 치수 크게 나와요', '한 치수 작게 나와요'] },
    { label: '배송 기간', options: ['현장 구매', '2~3일', '일주일 이상'] },
    { label: '품질·마감', options: ['아주 좋음', '가격만큼', '아쉬움'] },
    { label: '실물 색감', options: ['사진과 같아요', '사진보다 진해요', '사진보다 연해요'] },
  ],
};

// ─────────────────────────────────────────────
// 표시용 함수
// ─────────────────────────────────────────────

// 구단 id → 구단 이름 (없으면 undefined)
export const getTeamName = (teamId?: string) => KBO_TEAMS.find((team) => team.id === teamId)?.name;

// 가격 표시: 25000 → "25,000원" (가격이 없으면 빈 글자)
export const formatPrice = (price?: number) => (price === undefined ? '' : `${price.toLocaleString()}원`);

// 날짜 표시: 목록은 "26.10.28", 상세·댓글은 "26.10.28 19:30"
export function formatPostDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${String(d.getFullYear()).slice(2)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

// 좌석 위치 글자: "3루 외야 419블록 20열" (블록·열은 입력했을 때만)
export function getSeatText(post: CommunityPost): string {
  return [post.seatZone, post.seatBlock && `${post.seatBlock}블록`, post.seatRow && `${post.seatRow}열`]
    .filter(Boolean)
    .join(' ');
}

// 글 목록·상세의 굵은 제목 줄 = 작성자가 직접 쓴 제목
export function getPostHeadline(post: CommunityPost): string {
  return post.title ?? '';
}

// 글 목록의 회색 둘째 줄 = 카테고리별 핵심 정보
//  - 좌석: 구장 · 구역 블록 열
//  - 음식: 구장 · 음식점
//  - 굿즈: 구단 · 상품명 · 사이즈
//  - 기타: 구단 (없으면 "전체")
export function getPostSubtitle(post: CommunityPost): string {
  switch (post.category) {
    case 'seat':
      return [post.stadium, getSeatText(post)].filter(Boolean).join(' · ');
    case 'food':
      return [post.stadium, post.restaurant].filter(Boolean).join(' · ');
    case 'goods':
      return [getTeamName(post.teamId), post.productName || post.goodsType, post.size].filter(Boolean).join(' · ');
    case 'etc':
      return getTeamName(post.teamId) ?? '전체';
  }
}
