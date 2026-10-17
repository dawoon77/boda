import { Inquiry } from '../types';

// 샘플 문의 데이터 ("답변 완료" 화면 확인용, DB 연결 전까지 사용)
// 추후에 DB 연결 후 서버 API(/api/inquiries)에서 내 문의만 불러오도록 변경
export const INQUIRIES: Inquiry[] = [
  {
    id: 'inquiry-sample-1',
    category: '기능 제안',
    title: '직관 기록에 사진을 더 많이 올리고 싶어요',
    content: '직관 기록 한 번에 사진을 10장까지만 올릴 수 있는데, 더 늘려주실 수 있나요?',
    createdAt: '2026-10-12',
    status: 'answered',
    answer: '소중한 의견 감사합니다!\n\n사진 개수 확대는 다음 업데이트에서 검토하겠습니다.',
    answeredAt: '2026-10-13',
  },
];