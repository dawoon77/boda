import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Notice } from '../types';

interface NoticeDetailProps {
  notice: Notice;      // 보여줄 공지 하나
  onBack: () => void;  // 뒤로가기 (목록으로)
}

export default function NoticeDetail({ notice, onBack }: NoticeDetailProps) {
  return (
    <div id="notice-detail-page" className="absolute inset-0 z-50 bg-white flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-notice-detail"
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

      {/* 공지 본문 */}
      <main className="flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-2 pb-4 border-b border-[#f2f4f6]">
          {notice.isImportant && (
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-light text-brand">중요</span>
          )}
          <h3 className="text-[17px] font-bold text-[#191f28] leading-snug">{notice.title}</h3>
          <p className="text-[11px] font-semibold text-[#8b95a1]">{notice.date}</p>
        </div>
        {/* whitespace-pre-line: 내용 안의 \n을 실제 줄바꿈으로 보여줌 */}
        <p className="pt-5 text-[13px] font-medium text-[#4e5968] leading-relaxed whitespace-pre-line">
          {notice.content}
        </p>
      </main>
    </div>
  );
}