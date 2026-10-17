import React, { useState } from 'react';
import { UserProfile, AttendanceRecord, Player } from '../types';
import { getTeamById } from '../data/kboData';
import { Target, ChevronRight, Megaphone, Settings, FileText, UserX, MessageSquare, Star, Plus, User } from 'lucide-react';import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

export type MyMenuKey = 'notices' | 'settings' | 'terms' | 'inquiry' | 'withdraw' ;

const MENU_ITEMS: { key: MyMenuKey; label: string; icon: React.ElementType }[] = [
  { key: 'notices', label: '공지사항', icon: Megaphone },
  { key: 'settings', label: '앱 설정', icon: Settings },
  { key: 'terms', label: '약관 및 정책', icon: FileText },
  { key: 'inquiry', label: '1:1 문의', icon: MessageSquare },
  { key: 'withdraw', label: '탈퇴', icon: UserX },
];

interface MyProfileTabProps {
  profile: UserProfile;
  records: AttendanceRecord[];
  yearlyGoal: number;
  favoritePlayers: Player[];
  onChangeGoal: (goal: number) => void; 
  onEditProfile: () => void;
  onMenuSelect: (key: MyMenuKey) => void;
  onOpenFavoritePlayers: () => void;
  onOpenFavoriteStats: () => void; 
}

export default function MyProfileTab({ profile, records, yearlyGoal, onChangeGoal, onEditProfile, onMenuSelect, favoritePlayers, onOpenFavoritePlayers, onOpenFavoriteStats }: MyProfileTabProps) {
  const favoriteTeamObj = getTeamById(profile.favoriteTeamId);
  const totalGames = records.length;

  // 커스텀 상태값
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
      onChangeGoal(num);
    }
    setEditingGoal(false);
  };
  
  const hasFavorites = favoritePlayers.length > 0; // 좋아하는 선수가 1명 이상인지

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

      {/* 2. 좋아하는 선수 (카드 누르면 기록 상세, [편집]·빈칸 누르면 선택 화면) */}
      <div
        id="favorite-players-card"
        onClick={hasFavorites ? onOpenFavoriteStats : onOpenFavoritePlayers}
        className={`${LAYOUT.card} border-zinc-150/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4 cursor-pointer hover:border-zinc-350 hover:shadow-md transition-all group`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-zinc-700" />
            <h4 className="font-bold text-sm text-zinc-900 tracking-tight">좋아하는 선수</h4>
            <span className="text-[10px] font-bold text-[#8b95a1] font-mono">{favoritePlayers.length}/5</span>
          </div>
          <button
            id="btn-edit-favorite-players"
            onClick={(e) => {
              e.stopPropagation(); // 카드 클릭(기록 상세)까지 같이 실행되지 않게 막기
              onOpenFavoritePlayers();
            }}
            className="text-[9px] font-bold border border-zinc-150 hover:border-zinc-300 px-2 py-1 bg-zinc-50/50 text-zinc-500 rounded-lg cursor-pointer"
          >
            편집
          </button>
        </div>

        {/* 5칸 고정: 고른 선수는 원형 아이콘, 빈 칸은 + 표시 */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, i) => {
            const player = favoritePlayers[i];
            return player ? (
              <div key={player.id} className="flex flex-col items-center gap-1 min-w-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: favoriteTeamObj?.primaryColor }}
                >
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#4e5968] truncate w-full text-center">
                  {player.number}. {player.name}
                </span>
              </div>
            ) : (
              <div
                key={`empty-${i}`}
                onClick={(e) => {
                  e.stopPropagation(); // 빈칸은 기록 상세 대신 선택 화면으로
                  onOpenFavoritePlayers();
                }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#e5e8eb] hover:border-brand/40 flex items-center justify-center text-[#b0b8c1] transition">
                  <Plus className="w-4 h-4" />
                </div>
                {/* 이름 칸 높이를 맞추기 위한 빈 글자 */}
                <span className="text-[10px] font-bold text-transparent select-none">-</span>
              </div>
            );
          })}
        </div>

        {/* 기록 상세보기 안내 (선수가 있을 때만) */}
        {hasFavorites && (
          <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-[#8b95a1] group-hover:text-[#4e5968] transition">
            기록 상세보기
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* 3. 인터랙티브 올해 직관 목표도 */}
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

      {/* 4. 마이페이지 메뉴 목록 */}
      <div className={`${LAYOUT.card} !p-2 border-zinc-150/80`}>
        {MENU_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`my-menu-${key}`}
            onClick={() => onMenuSelect(key)}
            className="w-full flex items-center justify-between px-3 py-3.5 rounded-2xl hover:bg-[#f2f4f6] transition cursor-pointer group"
          >
            <span className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-zinc-500" />
              <span className="text-[13px] font-bold text-[#191f28]">{label}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>

    </div>
  );
}
