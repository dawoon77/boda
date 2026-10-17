import { Notice } from '../types';

// 공지사항 : 추후에 DB 연결 후 서버 API(/api/notices)에서 불러오도록 변경
export const NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'KBO:LOG 서비스 오픈 안내',
    date: '2026-10-01',
    isImportant: true,
    content:
      '안녕하세요, KBO:LOG입니다.\n\n' +
      '야구장 직관 기록을 남기고, 나만의 직관 승률과 먹거리 기록을 확인할 수 있는 KBO:LOG를 오픈했습니다.\n\n' +
      '많은 이용 부탁드립니다. 감사합니다.',
  },
  {
    id: 'notice-2',
    title: 'v1.2 업데이트 안내',
    date: '2026-10-10',
    content:
      '이제 홈 상단에서 응원 구단을 간편하게 변경할 수 있습니다.\n\n' +
      '홈 화면 왼쪽 위의 구단 이름을 눌러 확인해 보세요!',
  },
  {
    id: 'notice-3',
    title: '마이페이지가 새로워졌어요',
    date: '2026-10-17',
    content:
      '마이페이지에서 공지사항, 앱 설정, 약관 및 정책, 의견 남기기 메뉴를 바로 이용할 수 있습니다.',
  },
];