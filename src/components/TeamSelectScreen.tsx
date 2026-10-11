import React, { useState } from 'react';
import { KBOTeam, UserProfile } from '../types';
import { KBO_TEAMS } from '../data/kboData';
import { Trophy, Check, MapPin, User, ArrowRight, ChevronLeft } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface TeamSelectScreenProps {
  userEmail: string;
  provider: 'kakao' | 'naver' | 'google';
  onSetupComplete: (profile: UserProfileObj) => void;
  initialNickname?: string;
  initialTeamId?: string;
  onCancel?: () => void;
}

interface UserProfileObj {
  nickname: string;
  favoriteTeamId: string;
  isLoggedIn: boolean;
  provider: 'kakao' | 'naver' | 'google';
  email: string;
}

export default function TeamSelectScreen({ 
  userEmail, 
  provider, 
  onSetupComplete, 
  initialNickname = '', 
  initialTeamId = '',
  onCancel 
}: TeamSelectScreenProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(initialTeamId);
  const [errorText, setErrorText] = useState('');

  const isEditing = !!initialNickname;

  const activeTeam = KBO_TEAMS.find(t => t.id === selectedTeamId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorText('마이클럽에서 사용할 닉네임을 적어주세요.');
      return;
    }
    if (nickname.trim().length < 2 || nickname.trim().length > 10) {
      setErrorText('닉네임은 2자 이상 10자 이내로 입력해 주세요.');
      return;
    }
    if (!selectedTeamId) {
      setErrorText('마음을 함께할 KBO 응원 구단을 하나 선택해 주세요.');
      return;
    }

    onSetupComplete({
      nickname: nickname.trim(),
      favoriteTeamId: selectedTeamId,
      isLoggedIn: true,
      provider,
      email: userEmail
    });
  };

  return (
    <div id="team-select-container" className={`flex flex-col h-full overflow-y-auto font-sans p-6 scrollbar-thin ${COLORS.bgLight} ${COLORS.textMain} relative`}>
      {/* 프로필 수정 전용 상단 영역 헤더 바이 바 */}
      {isEditing && (
        <div id="profile-header-bar" className="grid grid-cols-3 items-center px-6 py-4 border-b border-zinc-100 shrink-0 bg-white z-10 sticky top-0 -mx-6 -mt-6 mb-2">
          <div className="flex justify-start">
            {onCancel && (
              <button
                id="btn-close-profile-edit"
                type="button"
                onClick={onCancel}
                className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-zinc-100 p-1 rounded-full transition cursor-pointer"
                aria-label="뒤로가기"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
            )}
          </div>
          
          <div className="flex justify-center">
            <h2 id="profile-header-title" className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">
              내 프로필 수정
            </h2>
          </div>
          
          <div className="flex justify-end">
            {/* 가로 대칭 정렬 빈 공간 스페이서 홀더 */}
          </div>
        </div>
      )}

      {/* 우측 상단 취소/뒤로 가기 조절 제어 버튼 (선택적) */}
      {onCancel && !isEditing && (
        <button 
          type="button"
          onClick={onCancel}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 font-semibold text-xs cursor-pointer bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
        >
          취소
        </button>
      )}

      {/* 전체 기입 가로 스크롤 콘텐트 래퍼 */}
      <div id="team-select-wrapper" className={`flex-1 space-y-6 pb-6 ${isEditing ? 'pt-1' : 'pt-2'}`}>
        <div id="setup-welcome-banner" className="space-y-2">
          <span className={`${TYPOGRAPHY.badgeText} ${COLORS.brandLight}`}>
            {isEditing ? '프로필 설정 변경' : '팬 프로필 등록'}
          </span>
          <h2 id="setup-title" className={TYPOGRAPHY.display}>
            {isEditing ? '내 프로필 수정 ✏️' : '반가워요 👋\n구장 일지를 등록해 볼게요'}
          </h2>
          <p id="setup-subtitle" className={TYPOGRAPHY.bodyMedium}>
            {isEditing 
              ? '닉네임과 언제든 나의 마음을 함께할 최애 KBO 구단을 변경하실 수 있습니다.'
              : '구장 일지 피드와 맛있는 먹거리 승률 분석에 필요한 프로필 설정을 최초 1회 입력해야 합니다.'}
          </p>
        </div>

        {/* 프로필 전용 입력 설정 폼 연동 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 직관러가 사용할 닉네임 기입 영역 */}
          <div id="nickname-input-group" className="space-y-2 bg-white rounded-3xl p-5 border border-[#e5e8eb] shadow-xs">
            <label className="text-xs font-bold text-[#4e5968] flex items-center gap-1.5 pb-1">
              <User className="w-4 h-4 text-brand" />
              <span>사용할 닉네임</span>
            </label>
            <div className="relative">
              <input
                id="nickname-text-field"
                type="text"
                maxLength={10}
                required
                placeholder="예: 경기장승리요정, 홈런커플"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setErrorText('');
                }}
                className="w-full bg-[#f2f4f6] border border-transparent text-[#191f28] rounded-2xl py-3 pl-4 pr-16 text-xs font-bold focus:outline-none focus:border-brand focus:bg-white transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#8b95a1] font-bold font-mono">
                {nickname.length}/10자
              </span>
            </div>
          </div>

          {/* 구단 10구단 선택 카드 섹션 그리드 */}
          <div id="team-grid-group" className="space-y-3 bg-white rounded-3xl p-5 border border-[#e5e8eb] shadow-xs">
            <label className="text-xs font-bold text-[#4e5968] flex items-center justify-between pb-1">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>나의 홈 팀 선택 (10개 구단)</span>
              </span>
              <span className="text-[10px] text-brand font-bold uppercase tracking-tight">직관 승리의 상징</span>
            </label>

            <div id="kbo-team-cards-grid" className="grid grid-cols-2 gap-2">
              {KBO_TEAMS.map((team) => {
                const isSelected = selectedTeamId === team.id;
                return (
                  <button
                    id={`team-card-${team.id}`}
                    key={team.id}
                    type="button"
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setErrorText('');
                    }}
                    className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 outline-none cursor-pointer ${
                      isSelected
                        ? 'border-transparent text-white shadow-sm font-bold scale-[1.02]'
                        : 'border-[#f2f4f6] bg-[#f2f4f6]/50 hover:bg-[#f2f4f6] text-[#4e5968]'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: team.primaryColor,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-2xl">{team.logoEmoji === 'ヒーロー' ? '🦸' : team.logoEmoji === '쌍둥이' ? '⚾' : team.logoEmoji}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 bg-white text-[#191f28] rounded-full flex items-center justify-center scale-90 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3.5]" style={{ color: team.primaryColor }} />
                        </div>
                      ) : (
                        <span className="text-[9px] text-[#8b95a1] font-bold font-mono uppercase bg-white/70 px-1.5 py-0.2 rounded border border-[#e5e8eb]">
                          {team.id.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-[13px] font-bold tracking-tight leading-none mb-1">
                      {team.name}
                    </span>
                    
                    <span className="text-[10px] text-[#8b95a1] font-semibold leading-none flex items-center gap-0.5 mt-0.5"
                          style={isSelected ? { color: 'rgba(255,255,255,0.85)' } : {}}>
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{team.stadium.replace('서울 ', '')}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 유저가 순위나 구단을 골랐을 때 매력적인 상호 작용 피드백 배너 */}
          {activeTeam && (
            <div id="selection-banner-preview" className={`${LAYOUT.card} !p-4.5 flex items-center gap-3.5 animate-fadeIn`}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xs shrink-0" style={{ backgroundColor: `${activeTeam.primaryColor}22` }}>
                {activeTeam.logoEmoji === 'ヒーロー' ? '🦸' : activeTeam.logoEmoji === '쌍둥이' ? '⚾' : activeTeam.logoEmoji}
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <p className="text-[10px] text-brand font-bold leading-none mb-1 uppercase tracking-tight">선택 완료</p>
                <h4 className="text-[14px] font-bold leading-tight">
                  {activeTeam.name}
                </h4>
                <p className={`${TYPOGRAPHY.bodyMedium} truncate mt-0.5 font-medium`}>
                  연고성 구장: {activeTeam.stadium}
                </p>
              </div>
            </div>
          )}

          {/* 기입 오류 가시성 에러 텍스트 통지 패널 */}
          {errorText && (
            <div id="setup-error" className="text-[#f04452] text-xs px-4 py-3 bg-[#feeef0] border border-transparent rounded-2xl leading-relaxed flex items-center gap-2 font-bold animate-fadeIn">
              <span className="text-sm">⚠️</span>
              <span>{errorText}</span>
            </div>
          )}

          {/* 작성 제출 및 시작하기 버튼 */}
          <button
            id="btn-confirm-profile"
            type="submit"
            className={BUTTONS.primary}
          >
            <span>{isEditing ? '프로필 수정 완료 💾' : '프로필 등록 완료하고 시작하기'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
