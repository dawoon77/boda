import React, { useState } from 'react';
import { ChevronLeft, AlertTriangle, Check } from 'lucide-react';
import { BUTTONS, LAYOUT } from '../lib/styles';

// 탈퇴 사유 선택지
const REASONS = ['자주 사용하지 않아요', '원하는 기능이 없어요', '오류가 많아요', '다른 앱을 사용해요', '기타'];

interface WithdrawScreenProps {
  nickname: string;                     // 안내 문구에 표시할 닉네임
  recordCount: number;                  // 삭제될 직관 기록 개수
  onWithdraw: (reason: string) => void; // 탈퇴하기 (사유를 App으로 넘김)
  onBack: () => void;                   // 취소·뒤로가기 (마이페이지로)
}

export default function WithdrawScreen({ nickname, recordCount, onWithdraw, onBack }: WithdrawScreenProps) {
  const [reason, setReason] = useState<string | null>(null); // 선택한 탈퇴 사유 (선택 안 하면 null)
  const [etcText, setEtcText] = useState('');                // '기타' 선택 시 직접 입력한 내용
  const [agreed, setAgreed] = useState(false);               // 안내 확인 동의 체크 여부

  const handleWithdraw = () => {
    if (!agreed) return; // 동의하지 않으면 진행하지 않음 (버튼도 비활성화되어 있음)
    const finalReason = reason === '기타' ? `기타: ${etcText.trim()}` : reason ?? '선택 안 함';
    onWithdraw(finalReason);
  };

  return (
    <div id="withdraw-page" className="absolute inset-0 z-50 bg-white flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-withdraw"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">회원 탈퇴</h2>
        </div>
        <div />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* 1. 탈퇴 안내 */}
        <div className="space-y-2">
          <h3 className="text-[18px] font-bold text-[#191f28] leading-snug">
            {nickname}님,<br />정말 탈퇴하시겠어요?
          </h3>
          <p className="text-xs font-semibold text-[#8b95a1]">
            탈퇴하면 아래 정보가 모두 삭제되고, 다시 복구할 수 없어요.
          </p>
        </div>

        {/* 2. 삭제되는 정보 */}
        <div className="bg-[#feeef0] rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[#f04452]">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">삭제되는 정보</span>
          </div>
          <ul className="text-xs font-semibold text-[#4e5968] space-y-1 list-disc pl-5">
            <li>프로필 정보 (닉네임, 응원 구단)</li>
            <li>
              직관 기록 <b className="text-[#191f28]">{recordCount}개</b> (사진, 먹거리 기록 포함)
            </li>
            <li>즐겨찾기한 응원가</li>
          </ul>
        </div>

        {/* 3. 탈퇴 사유 (선택) */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#4e5968]">
            떠나시는 이유를 알려주세요 <span className="text-[#8b95a1] font-semibold">(선택)</span>
          </p>
          <div className="space-y-1.5">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(reason === r ? null : r)} // 같은 걸 다시 누르면 선택 해제
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                  reason === r
                    ? 'border-brand bg-brand-light text-brand'
                    : 'border-[#e5e8eb] text-[#4e5968] hover:bg-[#f9fafb]'
                }`}
              >
                {r}
                {reason === r && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            ))}
          </div>
          {reason === '기타' && (
            <textarea
              rows={3}
              maxLength={200}
              value={etcText}
              onChange={(e) => setEtcText(e.target.value)}
              placeholder="이유를 자유롭게 적어주세요"
              className={LAYOUT.textarea}
            />
          )}
        </div>

        {/* 4. 동의 체크 (비밀번호 대신 한 번 더 확인) */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            id="checkbox-withdraw-agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#f04452] cursor-pointer shrink-0"
          />
          <span className="text-xs font-bold text-[#191f28] leading-relaxed">
            안내 사항을 모두 확인했으며, 삭제된 정보는 복구할 수 없다는 것에 동의합니다.
          </span>
        </label>
      </main>

      {/* 하단 버튼: 취소 / 탈퇴하기 */}
      <div className="shrink-0 border-t border-[#f2f4f6] p-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onBack} className={BUTTONS.lightAction}>
          취소
        </button>
        <button
          id="btn-confirm-withdraw"
          type="button"
          onClick={handleWithdraw}
          disabled={!agreed}
          className="w-full h-13 rounded-2xl text-[13px] font-bold transition cursor-pointer bg-[#f04452] text-white hover:bg-[#d93a47] disabled:bg-[#e5e8eb] disabled:text-[#b0b8c1] disabled:cursor-not-allowed"
        >
          탈퇴하기
        </button>
      </div>
    </div>
  );
}