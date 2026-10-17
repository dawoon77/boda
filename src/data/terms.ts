import { Term } from '../types';

// 임시 약관 데이터 (DB 연결 전까지 사용)
export const TERMS: Term[] = [
  {
    id: 'service',
    title: '서비스 이용약관',
    effectiveDate: '2026-10-01',
    content: '서비스 이용약관 내용을 준비 중입니다.\n\n정식 약관이 확정되면 이 화면에서 확인하실 수 있습니다.',
  },
  {
    id: 'privacy',
    title: '개인정보 처리방침',
    effectiveDate: '2026-10-01',
    content: '개인정보 처리방침 내용을 준비 중입니다.\n\n정식 방침이 확정되면 이 화면에서 확인하실 수 있습니다.',
  },
  {
    id: 'opensource',
    title: '오픈소스 라이선스',
    effectiveDate: '2026-10-01',
    content: '이 앱에서 사용하는 오픈소스 라이선스 정보를 준비 중입니다.',
  },
];