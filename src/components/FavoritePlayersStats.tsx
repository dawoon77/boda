import React, { useState } from 'react';
import { ChevronLeft, User } from 'lucide-react';
import { KBOTeam, Player } from '../types';
import { getBatterStats, getPitcherStats } from '../data/playerStats';

interface FavoritePlayersStatsProps {
  team: KBOTeam;         // 응원팀 (색상 표시용)
  players: Player[];     // 좋아하는 선수 목록
  onEdit: () => void;    // 편집 (선택 화면으로)
  onBack: () => void;    // 뒤로가기 (마이페이지로)
}

// 소수 앞의 0 빼기: 0.312 → .312 (야구 기록 표기 방식)
const formatRate = (value: number) => value.toFixed(3).replace(/^0/, '');

export default function FavoritePlayersStats({ team, players, onEdit, onBack }: FavoritePlayersStatsProps) {
  const batters = players.filter((p) => p.position !== '투수');
  const pitchers = players.filter((p) => p.position === '투수');

  // 처음 보여줄 탭: 타자가 있으면 타자, 없으면 투수
  const [tab, setTab] = useState<'batter' | 'pitcher'>(batters.length > 0 ? 'batter' : 'pitcher');
  const visiblePlayers = tab === 'batter' ? batters : pitchers;

  // 선수 한 명의 기록을 [항목 이름, 값] 목록으로 만들기
  const getStatItems = (player: Player) => {
    if (tab === 'batter') {
      const s = getBatterStats(player);
      return [
        { label: '타율', value: formatRate(s.avg) },
        { label: '경기', value: s.games },
        { label: '안타', value: s.hits },
        { label: '홈런', value: s.homeRuns },
        { label: '타점', value: s.rbi },
        { label: '도루', value: s.stolenBases },
        { label: 'OPS', value: formatRate(s.ops) },
      ];
    }
    const s = getPitcherStats(player);
    return [
      { label: '평균자책점', value: s.era.toFixed(2) },
      { label: '경기', value: s.games },
      { label: '승', value: s.wins },
      { label: '패', value: s.losses },
      { label: '세이브', value: s.saves },
      { label: '홀드', value: s.holds },
      { label: '탈삼진', value: s.strikeouts },
    ];
  };

  return (
    <div id="favorite-stats-page" className="absolute inset-0 z-50 bg-[#f2f4f6] flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 + 편집 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-favorite-stats"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">선수 기록</h2>
        </div>
        <div className="flex justify-end">
          <button
            id="btn-edit-from-stats"
            onClick={onEdit}
            className="text-[12px] font-bold text-[#8b95a1] hover:text-brand px-2 py-1 rounded-lg transition cursor-pointer"
          >
            편집
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-[11px] font-semibold text-[#8b95a1] px-1">※ 지금 보이는 기록은 임시 데이터예요.</p>

        {/* 타자 / 투수 탭 */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200/50">
          {([
            { key: 'batter', label: '타자', count: batters.length },
            { key: 'pitcher', label: '투수', count: pitchers.length },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              id={`stats-tab-${key}`}
              onClick={() => setTab(key)}
              className={`py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                tab === key ? 'bg-brand text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {label} <span className="font-mono ml-0.5">{count}</span>
            </button>
          ))}
        </div>

        {/* 선수별 기록 카드 */}
        {visiblePlayers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e5e8eb] py-12 text-center">
            <p className="text-xs font-bold text-[#4e5968]">
              좋아하는 {tab === 'batter' ? '타자' : '투수'}가 없어요
            </p>
          </div>
        ) : (
          visiblePlayers.map((player) => (
            <div key={player.id} className="bg-white rounded-3xl border border-[#e5e8eb] p-4 space-y-3">
              {/* 선수 정보 */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#191f28] truncate">
                    {player.number}. {player.name}
                  </p>
                  <p className="text-[10px] font-semibold text-[#8b95a1]">{player.position}</p>
                </div>
              </div>

              {/* 기록 (4개 + 3개 두 줄) */}
              <div className="grid grid-cols-4 gap-y-3 bg-[#f9fafb] rounded-2xl py-3 px-2">
                {getStatItems(player).map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-[10px] font-bold text-[#8b95a1]">{label}</p>
                    <p className="text-[14px] font-bold text-[#191f28] font-mono mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}