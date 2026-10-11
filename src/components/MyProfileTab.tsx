import React, { useState } from 'react';
import { UserProfile, AttendanceRecord } from '../types';
import { getTeamById } from '../data/kboData';
import { Target, ChevronRight } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface MyProfileTabProps {
  profile: UserProfile;
  records: AttendanceRecord[];
  onEditProfile: () => void;
}

export default function MyProfileTab({ profile, records, onEditProfile }: MyProfileTabProps) {
  const favoriteTeamObj = getTeamById(profile.favoriteTeamId);
  const totalGames = records.length;
  
  // 커스텀 상태값
  const [yearlyGoal, setYearlyGoal] = useState<number>(10);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('10');

  // 배지/티어 산정 로직
  let tierLabel = '방구석 팬';
  let tierColor = 'text-zinc-650 bg-zinc-100 border-zinc-200';
  let maxGoal = yearlyGoal;
  let progressPct = Math.min(100, Math.round((totalGames / maxGoal) * 100));

  if (totalGames >= 150) {
    tierLabel = '내가 감독';
    tierColor = 'text-red-650 bg-red-50 border-red-200';
  } else if (totalGames >= 100) {
    tierLabel = '직관 MVP 팬';
    tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (totalGames >= 70) {
    tierLabel = '구장 지박령';
    tierColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (totalGames >= 50) {
    tierLabel = '프로 원정러';
    tierColor = 'text-brand bg-brand-light border-brand/20';
  } else if (totalGames >= 40) {
    tierLabel = '열혈팬';
    tierColor = 'text-brand bg-brand-light border-brand/20';
  } else if (totalGames >= 30) {
    tierLabel = '응원 중독자';
    tierColor = 'text-brand bg-brand-light border-brand/20';
  } else if (totalGames >= 20) {
    tierLabel = '직관 루키';
    tierColor = 'text-brand bg-brand-light border-brand/20';
  } else if (totalGames >= 10) {
    tierLabel = '직관 새내기';
    tierColor = 'text-brand bg-brand-light border-brand/20';
  }

  const handleSaveGoal = () => {
    const num = parseInt(goalInput);
    if (!isNaN(num) && num > 0) {
      setYearlyGoal(num);
    }
    setEditingGoal(false);
  };

  return (
    <div id="my-profile-panel" className="space-y-5">
      
      {/* 1. 야구팬 프로필 메인 카드 */}
      <div 
        onClick={onEditProfile}
        className={`${LAYOUT.card} border-zinc-150/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 cursor-pointer hover:border-zinc-350 hover:shadow-md transition-all group`}
      >
        <div className="flex items-center gap-3.5 border-b border-zinc-100 pb-4 justify-between">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border border-zinc-100 shadow-sm shrink-0"
              style={{ backgroundColor: favoriteTeamObj?.primaryColor }}
            >
              {favoriteTeamObj?.logoEmoji === 'ヒーロー' ? '🦸' : favoriteTeamObj?.logoEmoji === '쌍둥이' ? '⚾' : favoriteTeamObj?.logoEmoji}
            </div>
   
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-base font-bold text-zinc-900 leading-none truncate">{profile.nickname}</h4>
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-650 transition-all transform group-hover:translate-x-0.5" />
        </div>

        {/* 등급 배지 표시 */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-zinc-500 font-bold">나의 직관 등급</span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${tierColor}`}>
            {tierLabel}
          </span>
        </div>
      </div>

      {/* 2. 인터랙티브 올해 직관 목표도 */}
      <div className={`${LAYOUT.card} border-zinc-150/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-zinc-700" />
            <h4 className="font-bold text-sm text-zinc-900 font-display uppercase tracking-tight">올해 직관 목표</h4>
          </div>

          {editingGoal ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-10 text-center border font-mono font-bold border-zinc-200 rounded px-1 text-xs"
              />
              <button
                onClick={handleSaveGoal}
                className="text-[9px] font-bold bg-zinc-900 text-white px-2 py-1 rounded"
              >
                저장
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setGoalInput(String(yearlyGoal));
                setEditingGoal(true);
              }}
              className="text-[9px] font-bold border border-zinc-150 hover:border-zinc-300 px-2 py-1 bg-zinc-50/50 text-zinc-500 rounded-lg"
            >
              목표 수정
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end text-xs font-medium text-zinc-700">
            <p className="text-[10px] text-zinc-400">올시즌 내 목표 진행도</p>
            <span>{totalGames} / {yearlyGoal} 회 달성 ({progressPct}%)</span>
          </div>

          {/* Graphical Progress bar */}
          <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: favoriteTeamObj?.primaryColor || '#dc2626' }}
            ></div>
          </div>
        </div>

        <p className="text-[10px] text-zinc-400 leading-normal">
          🏆 마이팀 응원 목표를 채우고 명예의 전당 직관러 뱃지를 획득해 보세요!
        </p>
      </div>

    </div>
  );
}
