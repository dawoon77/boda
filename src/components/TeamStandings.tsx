import React, { useState, useEffect } from 'react';
import { KBOTeam } from '../types';
import { KBO_TEAMS } from '../data/kboData';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface TeamStandingsProps {
  favoriteTeam: KBOTeam;
  onlyMyTeam?: boolean;
}

// 2026 시즌 기준 가상 시뮬레이션 순위 데이터부
export interface StandingsRow {
  rank: number;
  teamId: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gameBehind: string;
  streak: string;
}

export const SIMULATED_STANDINGS: StandingsRow[] = [
  { rank: 1, teamId: 'kia', games: 50, wins: 33, losses: 16, draws: 1, winRate: 0.673, gameBehind: '0.0', streak: '3승' },
  { rank: 2, teamId: 'samsung', games: 51, wins: 31, losses: 19, draws: 1, winRate: 0.620, gameBehind: '2.5', streak: '1패' },
  { rank: 3, teamId: 'lg', games: 50, wins: 29, losses: 20, draws: 1, winRate: 0.592, gameBehind: '4.0', streak: '2승' },
  { rank: 4, teamId: 'doosan', games: 50, wins: 27, losses: 22, draws: 1, winRate: 0.551, gameBehind: '6.0', streak: '1승' },
  { rank: 5, teamId: 'ssg', games: 51, wins: 25, losses: 25, draws: 1, winRate: 0.500, gameBehind: '8.5', streak: '4패' },
  { rank: 6, teamId: 'kt', games: 50, wins: 24, losses: 25, draws: 1, winRate: 0.490, gameBehind: '9.0', streak: '2승' },
  { rank: 7, teamId: 'lotte', games: 50, wins: 22, losses: 27, draws: 1, winRate: 0.449, gameBehind: '11.0', streak: '2패' },
  { rank: 8, teamId: 'hanwha', games: 51, wins: 22, losses: 28, draws: 1, winRate: 0.440, gameBehind: '11.5', streak: '1패' },
  { rank: 9, teamId: 'nc', games: 51, wins: 21, losses: 29, draws: 1, winRate: 0.420, gameBehind: '12.5', streak: '3패' },
  { rank: 10, teamId: 'kiwoom', games: 50, wins: 18, losses: 31, draws: 1, winRate: 0.367, gameBehind: '15.0', streak: '2승' }
];

export default function TeamStandings({ favoriteTeam, onlyMyTeam = false }: TeamStandingsProps) {
  const [standings, setStandings] = useState<StandingsRow[]>(SIMULATED_STANDINGS);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    async function loadStandings() {
      try {
        const response = await fetch('/api/team-standings');
        if (!response.ok) return;
        const data = await response.json();
        if (active && data && Array.isArray(data.standings)) {
          setStandings(data.standings);
          setIsLive(data.fetchedLive);
        }
      } catch (err) {
        console.warn("Could not load KBO real-time team standings:", err);
      }
    }
    loadStandings();
    return () => {
      active = false;
    };
  }, []);

  if (onlyMyTeam) {
    const row = standings.find(r => r.teamId === favoriteTeam.id);
    if (!row) return null;
    const matchedTeam = KBO_TEAMS.find(t => t.id === row.teamId) || favoriteTeam;
    
    return (
      <div id="my-team-standing-compact" className={LAYOUT.card}>
        <div className="flex items-center justify-between border-b border-[#f2f4f6] pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-450 shrink-0" />
            <h3 className={TYPOGRAPHY.headingMd}>
              마이 구단 현재 순위 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 ${isLive ? 'text-brand bg-brand-light' : 'text-[#8b95a1] bg-[#f2f4f6]'}`}>{isLive ? '실시간' : '단독'}</span>
            </h3>
          </div>
          <span className="text-xs font-bold text-white bg-brand px-3 py-1 rounded-full">
            {row.rank}위
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <span className="text-4xl">
              {matchedTeam.logoEmoji === 'ヒーロー' ? '🦸' : matchedTeam.logoEmoji === '쌍둥이' ? '⚾' : matchedTeam.logoEmoji}
            </span>
            <div>
              <p className={`text-[14px] font-bold leading-tight mb-1 ${COLORS.textMain}`}>
                {matchedTeam.name}
              </p>
              <p className={TYPOGRAPHY.bodyMedium}>
                {row.wins}승 {row.losses}패 {row.draws}무 · 승률 {(row.winRate).toFixed(3).replace(/^0/, '')}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[11px] bg-[#f2f4f6] text-[#4e5968] px-2.5 py-0.8 rounded-lg font-bold border border-[#e5e8eb] inline-block">
              최근 {row.streak}
            </span>
            <p className={TYPOGRAPHY.captionMuted + " mt-1.5"}>
              선두와 {row.gameBehind} 게임차
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="team-standings-widget" className={LAYOUT.card}>
      <div className="flex items-center justify-between border-b border-[#f2f4f6] pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand shrink-0" />
          <h3 className={TYPOGRAPHY.headingMd}>
            현재 2026 리그 순위표
          </h3>
        </div>
        <div className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold select-none ${isLive ? 'bg-brand-light text-brand' : 'bg-[#f2f4f6] text-[#8b95a1]'}`}>
          <TrendingUp className="w-3 h-3" />
          <span>{isLive ? '실시간 반영 기준' : 'KBO 리그 기준'}</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className={`w-full text-left text-xs ${COLORS.textMuted}`}>
          <thead>
            <tr className={`border-b border-[#f2f4f6] text-[10px] font-bold uppercase tracking-wider ${COLORS.textSub}`}>
              <th className="py-2.5 pl-1 text-center w-8">순위</th>
              <th className="py-2.5">구단</th>
              <th className="py-2.5 text-center">경기</th>
              <th className="py-2.5 text-center text-[#f04452]">승</th>
              <th className="py-2.5 text-center text-brand">패</th>
              <th className="py-2.5 text-center">승률</th>
              <th className="py-2.5 text-center">게임차</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const matchedTeam = KBO_TEAMS.find(t => t.id === row.teamId);
              const isFav = row.teamId === favoriteTeam.id;

              return (
                <tr
                  key={row.teamId}
                  className={`border-b border-[#f2f4f6]/60 hover:bg-[#f2f4f6]/40 transition ${
                    isFav ? 'bg-brand/5 font-semibold text-[#191f28]' : ''
                  }`}
                >
                  <td className="py-2.5 text-center font-bold text-[#191f28]">
                    {row.rank === 1 ? (
                      <span className="bg-[#f04452] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto">
                        1
                      </span>
                    ) : row.rank === 2 || row.rank === 3 ? (
                      <span className="bg-brand text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto">
                        {row.rank}
                      </span>
                    ) : (
                      row.rank
                    )}
                  </td>
                  <td className="py-2.5 flex items-center gap-1.5 min-w-[75px]">
                    <span className="text-base shrink-0">
                      {matchedTeam?.logoEmoji === 'ヒーロー' ? '🦸' : matchedTeam?.logoEmoji === '쌍둥이' ? '⚾' : matchedTeam?.logoEmoji}
                    </span>
                    <span className="truncate tracking-tight font-bold">
                      {matchedTeam?.shortName}
                    </span>
                    {isFav && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0 ml-0.5 animate-pulse" />
                    )}
                  </td>
                  <td className="py-2.5 text-center font-bold text-[#4e5968]">{row.games}</td>
                  <td className="py-2.5 text-center font-bold text-[#f04452]/90">{row.wins}</td>
                  <td className="py-2.5 text-center font-bold text-brand/90">{row.losses}</td>
                  <td className="py-2.5 text-center font-bold text-[#191f28]">{row.winRate.toFixed(3).replace(/^0/, '')}</td>
                  <td className="py-2.5 text-center text-[#8b95a1] font-bold">{row.gameBehind}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

