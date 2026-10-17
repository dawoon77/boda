import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Notice } from '../types';

interface NoticeListProps {
  notices: Notice[];                   // 보여줄 공지 목록
  onSelect: (notice: Notice) => void;  // 공지를 눌렀을 때 (상세로 이동)
  onBack: () => void;                  // 뒤로가기 (마이페이지로)
}

export default function NoticeList({ notices, onSelect, onBack }: NoticeListProps) {
  // 정렬: 중요 공지가 맨 위, 그다음은 최신 날짜 순
  const sortedNotices = [...notices].sort((a, b) => {
    if (!!a.isImportant !== !!b.isImportant) return a.isImportant ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div id="notice-list-page" className="absolute inset-0 z-50 bg-[#f2f4f6] flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 (설정 화면 헤더와 같은 스타일) */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-notice-list"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">공지사항</h2>
        </div>
        <div />
      </header>

      {/* 공지 목록 */}
      <main className="flex-1 overflow-y-auto p-4">
        {sortedNotices.length === 0 ? (
          <p className="text-center text-xs text-[#8b95a1] font-semibold py-16">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="bg-white rounded-3xl border border-[#e5e8eb] overflow-hidden">
            {sortedNotices.map((notice) => (
              <li key={notice.id} className="border-b border-[#f2f4f6] last:border-b-0">
                <button
                  id={`notice-item-${notice.id}`}
                  onClick={() => onSelect(notice)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#f9fafb] transition cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {notice.isImportant && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-brand-light text-brand shrink-0">중요</span>
                      )}
                      <p className="text-[13px] font-bold text-[#191f28] truncate">{notice.title}</p>
                    </div>
                    <p className="text-[10px] font-semibold text-[#8b95a1]">{notice.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}