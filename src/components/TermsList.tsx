import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Term } from '../types';

interface TermsListProps {
  terms: Term[];                   // 보여줄 약관 목록
  onSelect: (term: Term) => void;  // 약관을 눌렀을 때 (상세로 이동)
  onBack: () => void;              // 뒤로가기 (마이페이지로)
}

export default function TermsList({ terms, onSelect, onBack }: TermsListProps) {
  return (
    <div id="terms-list-page" className="absolute inset-0 z-50 bg-[#f2f4f6] flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-terms-list"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">약관 및 정책</h2>
        </div>
        <div />
      </header>

      {/* 약관 목록 */}
      <main className="flex-1 overflow-y-auto p-4">
        <ul className="bg-white rounded-3xl border border-[#e5e8eb] overflow-hidden">
          {terms.map((term) => (
            <li key={term.id} className="border-b border-[#f2f4f6] last:border-b-0">
              <button
                id={`terms-item-${term.id}`}
                onClick={() => onSelect(term)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#f9fafb] transition cursor-pointer group"
              >
                <p className="text-[13px] font-bold text-[#191f28] truncate">{term.title}</p>
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}