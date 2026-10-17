import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, MessageSquare } from 'lucide-react';
import { Inquiry } from '../types';
import { BUTTONS } from '../lib/styles';

// 상태 필터 종류 : 전체 / 답변 대기 / 답변 완료
type StatusFilter = 'all' | 'waiting' | 'answered';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'waiting', label: '답변대기' },
  { key: 'answered', label: '답변완료' },
];

interface InquiryListProps {
  inquiries: Inquiry[];  // 내 문의 목록 (최신순)
  onWrite: () => void;   // 문의하기 버튼 (작성 화면으로)
  onBack: () => void;    // 뒤로가기 (마이페이지로)
}

export default function InquiryList({ inquiries, onWrite, onBack }: InquiryListProps) {
  // 펼쳐서 보고 있는 문의 id (한 번에 하나만 펼침, null이면 모두 접힘)
  const [openId, setOpenId] = useState<string | null>(null);

  // 현재 선택한 상태 필터 (처음엔 전체)
  const [filter, setFilter] = useState<StatusFilter>('all');

  // 탭에 표시할 개수
  const counts = {
    all: inquiries.length,
    waiting: inquiries.filter((i) => i.status === 'waiting').length,
    answered: inquiries.filter((i) => i.status === 'answered').length,
  };

  // 선택한 필터에 맞는 문의만 골라내기
  const filteredInquiries = filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <div id="inquiry-list-page" className="absolute inset-0 z-50 bg-[#f2f4f6] flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-inquiry-list"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">1:1 문의</h2>
        </div>
        <div />
      </header>

      {/* 내 문의 목록 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-[11px] font-semibold text-[#8b95a1] px-1">작성한 문의는 나만 볼 수 있어요.</p>

        {/* 상태 필터 탭 (문의가 있을 때만 표시) */}
        {inquiries.length > 0 && (
          <div className="flex gap-2 px-1">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                id={`inquiry-filter-${key}`}
                onClick={() => {
                  setFilter(key);
                  setOpenId(null); // 필터를 바꾸면 펼친 문의는 접기
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                  filter === key
                    ? 'bg-brand text-white border-transparent'
                    : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'
                }`}
              >
                {label} <span className="font-mono ml-0.5">{counts[key]}</span>
              </button>
            ))}
          </div>
        )}

        {inquiries.length === 0 ? (
          // 문의가 하나도 없을 때
          <div className="bg-white rounded-3xl border border-[#e5e8eb] py-14 flex flex-col items-center gap-2 text-center">
            <MessageSquare className="w-8 h-8 text-zinc-300" />
            <p className="text-xs font-bold text-[#4e5968]">아직 남긴 문의가 없어요</p>
            <p className="text-[10px] font-semibold text-[#8b95a1]">궁금한 점이나 의견을 남겨주세요.</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          // 문의는 있지만, 선택한 필터에 해당하는 문의가 없을 때
          <div className="bg-white rounded-3xl border border-[#e5e8eb] py-12 text-center">
            <p className="text-xs font-bold text-[#4e5968]">
              {filter === 'waiting' ? '답변 대기 중인 문의가 없어요' : '답변 완료된 문의가 없어요'}
            </p>
          </div>
        ) : (
          <ul className="bg-white rounded-3xl border border-[#e5e8eb] overflow-hidden">
            {filteredInquiries.map((inquiry) => {
              const isOpen = openId === inquiry.id;
              const isAnswered = inquiry.status === 'answered';
              return (
                <li key={inquiry.id} className="border-b border-[#f2f4f6] last:border-b-0">
                  {/* 문의 제목 줄 (누르면 펼치기/접기) */}
                  <button
                    id={`inquiry-item-${inquiry.id}`}
                    onClick={() => setOpenId(isOpen ? null : inquiry.id)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#f9fafb] transition cursor-pointer"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                            isAnswered ? 'bg-brand-light text-brand' : 'bg-[#f2f4f6] text-[#8b95a1]'
                          }`}
                        >
                          {isAnswered ? '답변 완료' : '답변 대기'}
                        </span>
                        <p className="text-[13px] font-bold text-[#191f28] truncate">{inquiry.title}</p>
                      </div>
                      <p className="text-[10px] font-semibold text-[#8b95a1]">
                        {inquiry.category} · {inquiry.createdAt}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 펼쳤을 때: 내가 쓴 내용 + 답변 */}
                  {isOpen && (
                    <div className="px-5 pb-5 space-y-3">
                      <p className="text-xs font-medium text-[#4e5968] leading-relaxed whitespace-pre-line bg-[#f9fafb] rounded-2xl p-4">
                        {inquiry.content}
                      </p>
                      {isAnswered ? (
                        <div className="rounded-2xl p-4 border border-brand/20 bg-brand-light/50 space-y-1.5">
                          <p className="text-[11px] font-bold text-brand">KBO:LOG 답변 · {inquiry.answeredAt}</p>
                          <p className="text-xs font-medium text-[#333d4b] leading-relaxed whitespace-pre-line">
                            {inquiry.answer}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] font-semibold text-[#8b95a1] text-center py-1">
                          답변을 준비하고 있어요. 조금만 기다려 주세요.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* 하단 고정: 문의하기 버튼 */}
      <div className="shrink-0 bg-white border-t border-[#f2f4f6] p-4">
        <button
          id="btn-write-inquiry"
          onClick={() => {
            setFilter('all'); // 새 문의가 바로 보이도록 전체로 돌려놓기
            onWrite();
          }}
          className={BUTTONS.primary}
        >          문의하기
        </button>
      </div>
    </div>
  );
}