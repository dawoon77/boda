import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { InquiryCategory } from '../types';
import { BUTTONS, LAYOUT } from '../lib/styles';

const CATEGORIES: InquiryCategory[] = ['서비스 이용', '오류 신고', '기능 제안', '기타'];

interface InquiryFormProps {
  // 등록 버튼을 눌렀을 때 입력한 내용을 App으로 넘겨줌 (id, 작성일, 상태는 App에서 붙임)
  onSubmit: (data: { category: InquiryCategory; title: string; content: string }) => void;
  onBack: () => void;  // 뒤로가기 (목록으로)
}

export default function InquiryForm({ onSubmit, onBack }: InquiryFormProps) {
  const [category, setCategory] = useState<InquiryCategory>('서비스 이용');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 기본 동작(페이지 새로고침) 막기
    if (title.trim().length < 2) {
      setErrorText('제목을 2자 이상 입력해 주세요.');
      return;
    }
    if (content.trim().length < 10) {
      setErrorText('내용을 10자 이상 입력해 주세요.');
      return;
    }
    onSubmit({ category, title: title.trim(), content: content.trim() });
  };

  return (
    <div id="inquiry-form-page" className="absolute inset-0 z-50 bg-white flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-inquiry-form"
            type="button"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">문의하기</h2>
        </div>
        <div />
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* 문의 유형 선택 */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#4e5968]">문의 유형</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
                    category === c
                      ? 'bg-brand text-white border-transparent'
                      : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 입력 */}
          <div className="space-y-2">
            <label htmlFor="inquiry-title" className="text-xs font-bold text-[#4e5968]">제목</label>
            <div className="relative">
              <input
                id="inquiry-title"
                type="text"
                maxLength={50}
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrorText(''); }}
                placeholder="문의 제목을 입력해 주세요"
                className={`${LAYOUT.input} pr-14`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#8b95a1] font-bold font-mono">
                {title.length}/50
              </span>
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="space-y-2">
            <label htmlFor="inquiry-content" className="text-xs font-bold text-[#4e5968]">내용</label>
            <textarea
              id="inquiry-content"
              rows={8}
              maxLength={1000}
              value={content}
              onChange={(e) => { setContent(e.target.value); setErrorText(''); }}
              placeholder={'궁금한 점이나 의견을 자유롭게 남겨주세요.\n오류 신고는 어떤 화면에서 어떤 문제가 있었는지 적어주시면 큰 도움이 돼요.'}
              className={LAYOUT.textarea}
            />
            <p className="text-right text-[10px] text-[#8b95a1] font-bold font-mono">{content.length}/1000</p>
          </div>

          {/* 입력 오류 안내 */}
          {errorText && (
            <div className="text-[#f04452] text-xs px-4 py-3 bg-[#feeef0] rounded-2xl font-bold flex items-center gap-2 animate-fadeIn">
              <span>⚠️</span>
              <span>{errorText}</span>
            </div>
          )}
        </main>

        {/* 하단 고정: 등록 버튼 */}
        <div className="shrink-0 border-t border-[#f2f4f6] p-4">
          <button id="btn-submit-inquiry" type="submit" className={BUTTONS.primary}>
            문의 등록하기
          </button>
        </div>
      </form>
    </div>
  );
}