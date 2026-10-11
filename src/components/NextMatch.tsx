import React, { useState, useEffect, useRef } from 'react';
import { Match, KBOTeam } from '../types';
import { getTeamById, generateNextLiveState } from '../data/kboData';
import { Clock, Radio, Activity, RefreshCw, ChevronRight, Zap, Target, Volume2 } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface NextMatchProps {
  favoriteTeam: KBOTeam;
  matches: Match[];
  onAttendanceClick: (match: Match) => void;
  hasRecord: (matchId: string) => boolean;
}

export default function NextMatch({ favoriteTeam, matches, onAttendanceClick, hasRecord }: NextMatchProps) {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [completedMatch, setCompletedMatch] = useState<Match | null>(null);

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast'>('fast');
  const [tick, setTick] = useState(1);
  const [countdownText, setCountdownText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('매시간 자동 동기화 활성');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 경기 목록을 분석하여 선호 구단의 현재 라이브 게임 또는 출시 예정된 대진 계획 식별
  useEffect(() => {
    const teamMatches = matches.filter(
      m => m.homeTeamId === favoriteTeam.id || m.awayTeamId === favoriteTeam.id
    );

    const sorted = [...teamMatches].sort((a, b) => a.date.localeCompare(b.date));

    // 라이브 경기 조회
    const foundLive = sorted.find(m => m.status === 'live');
    setLiveMatch(foundLive || null);

    // 다음 예정 경기 조회
    const foundUpcoming = sorted.find(m => m.status === 'scheduled');
    setUpcomingMatch(foundUpcoming || null);

    // 예정된 경기가 전혀 없을 때 대체 수단으로 기완료된 직전 경기 조회
    const completedArr = sorted.filter(m => m.status === 'completed');
    if (completedArr.length > 0) {
      setCompletedMatch(completedArr[completedArr.length - 1]);
    } else {
      setCompletedMatch(null);
    }

    if (foundLive) {
      setIsLiveMode(true);
    } else {
      setIsLiveMode(false);
    }
  }, [favoriteTeam, matches]);

  // 라이브 경기 시뮬레이션을 위한 실시간 틱 수집 타이머 설정
  useEffect(() => {
    if (isLiveMode && liveMatch && liveMatch.status === 'live') {
      const intervalMs = simulationSpeed === 'fast' ? 2500 : 7000;
      
      timerRef.current = setInterval(() => {
        setTick(prev => {
          const nextTick = prev + 1;
          setLiveMatch(current => {
            if (!current) return null;
            return generateNextLiveState(current, nextTick);
          });
          return nextTick;
        });
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveMode, liveMatch?.id, liveMatch?.status, simulationSpeed]);

  // 다음 예정 경기 시각 카운트다운 추적 타이머 설정
  useEffect(() => {
    const targetMatch = upcomingMatch;
    if (!targetMatch) return;

    const interval = setInterval(() => {
      const matchDateStr = `${targetMatch.date}T${targetMatch.time}:00`;
      const matchTime = new Date(matchDateStr).getTime();
      const now = new Date('2026-05-26T15:00:00Z').getTime(); // 고정된 시뮬레이터 기준 시각
      
      const diff = matchTime - now;

      if (diff <= 0) {
        setCountdownText('경기 진행 중 ⚾');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownText(`${hours}시간 ${mins}분 ${secs}초 후 시작`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingMatch]);

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncMessage('KBO 서버로부터 데이터 Scraping 중...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('KBO 야구 공식 집계 수집 성공 (0.1초 전 갱신됨)');
    }, 1200);
  };

  const choiceUpcoming = upcomingMatch || completedMatch;

  return (
    <div className="space-y-4">
      {/* 1. 실시간 중계 부분: 라이브 경기가 진행 중일 때만 렌더링 */}
      {liveMatch && liveMatch.status === 'live' && (
        <div id="live-broadcast-box" className={`${LAYOUT.card} overflow-hidden border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] !p-0`}>
          {/* Header */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <h3 className={`${TYPOGRAPHY.headingMd} flex items-center gap-1`}>
                실시간 경기 중계 (LIVE)
              </h3>
            </div>
          </div>

          {/* Scores box */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between px-3 bg-zinc-50/40 py-4 rounded-2xl border border-zinc-100">
              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-sm italic text-white shadow-sm relative overflow-hidden border border-black/5" style={{ backgroundColor: getTeamById(liveMatch.awayTeamId).primaryColor }}>
                  <span className="text-xl leading-none">
                    {getTeamById(liveMatch.awayTeamId).logoEmoji === 'ヒーロー' ? '🦸' : getTeamById(liveMatch.awayTeamId).logoEmoji === '쌍둥이' ? '⚾' : getTeamById(liveMatch.awayTeamId).logoEmoji}
                  </span>
                  <span className="text-[7.5px] font-bold absolute bottom-0.5 tracking-tighter text-white/85">{liveMatch.awayTeamId.toUpperCase()}</span>
                </div>
                <span className="text-xs font-bold text-zinc-800 mt-1.5">{getTeamById(liveMatch.awayTeamId).shortName}</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-tight">원정 AWAY</span>
              </div>

              {/* Match Live Indicator & Score */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl font-black text-zinc-900 font-mono">{liveMatch.awayScore}</span>
                  <span className="bg-red-50 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded font-display tracking-tight border border-red-200/50 animate-pulse">LIVE</span>
                  <span className="text-3xl font-black text-zinc-900 font-mono">{liveMatch.homeScore}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-extrabold mt-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  {liveMatch.inning}
                </span>
              </div>

              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-sm italic text-white shadow-sm relative overflow-hidden border border-black/5" style={{ backgroundColor: getTeamById(liveMatch.homeTeamId).primaryColor }}>
                  <span className="text-xl leading-none">
                    {getTeamById(liveMatch.homeTeamId).logoEmoji === 'ヒーロー' ? '🦸' : getTeamById(liveMatch.homeTeamId).logoEmoji === '쌍둥이' ? '⚾' : getTeamById(liveMatch.homeTeamId).logoEmoji}
                  </span>
                  <span className="text-[7.5px] font-bold absolute bottom-0.5 tracking-tighter text-white/85">{liveMatch.homeTeamId.toUpperCase()}</span>
                </div>
                <span className="text-xs font-bold text-zinc-800 mt-1.5">{getTeamById(liveMatch.homeTeamId).shortName}</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-tight">홈 HOME</span>
              </div>
            </div>

            {/* Stadium Label */}
            <div className="text-xs text-zinc-500 flex items-center justify-between pt-1 font-semibold">
              <span className="text-zinc-600 flex items-center gap-1.5">
                <span className="font-bold text-zinc-800">구장 | {liveMatch.stadium}</span>
              </span>
              <span className="text-xs text-zinc-400 font-semibold">
                {liveMatch.stadium} LIVE
              </span>
            </div>
          </div>

          {/* SBO & Diamond Live PlaybyPlay Details */}
          {liveMatch.liveDetails && (
            <div className="bg-zinc-50/40 p-4 space-y-4 animate-slideUp">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-xs font-bold text-zinc-850">실시간 야구 중계</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-150 px-1.5 py-0.5 rounded font-bold font-mono">초 단위</span>
                </div>

                <button
                  id="btn-manual-crawl-refresh-live"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="p-1.5 text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-105 disabled:opacity-50 rounded-lg border border-zinc-200 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="새로고침"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand' : 'text-zinc-500'}`} />
                </button>
              </div>

              {/* SBO Visual Board */}
              <div className="grid grid-cols-2 gap-4 items-center bg-white p-3 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                {/* Left: SBO lights */}
                <div className="space-y-1.5 text-xs font-mono font-bold">
                  {/* Ball */}
                  <div className="flex items-center gap-1">
                    <span className="w-3 text-emerald-600 text-[10px]">B</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map(item => (
                        <div
                          key={`ball-${item}`}
                          className={`w-3 h-3 rounded-full border transition-all ${
                            liveMatch.liveDetails!.balls >= item ? 'bg-emerald-500 border-transparent animate-scale' : 'bg-zinc-100 border-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Strike */}
                  <div className="flex items-center gap-1">
                    <span className="w-3 text-amber-500 text-[10px]">S</span>
                    <div className="flex gap-1.5">
                      {[1, 2].map(item => (
                        <div
                          key={`strike-${item}`}
                          className={`w-3 h-3 rounded-full border transition-all ${
                            liveMatch.liveDetails!.strikes >= item ? 'bg-amber-500 border-transparent animate-scale' : 'bg-zinc-100 border-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Out */}
                  <div className="flex items-center gap-1">
                    <span className="w-3 text-rose-500 text-[10px]">O</span>
                    <div className="flex gap-1.5">
                      {[1, 2].map(item => (
                        <div
                          key={`out-${item}`}
                          className={`w-3 h-3 rounded-full border transition-all ${
                            liveMatch.liveDetails!.outs >= item ? 'bg-rose-500 border-transparent animate-scale' : 'bg-zinc-100 border-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Diamond bases without border lines */}
                <div className="flex items-center justify-center">
                  <div className="relative w-14 h-14 transform rotate-45 flex items-center justify-center">
                    {/* 1st base (Right) */}
                    <div
                      className={`absolute right-0.5 -top-0.5 w-3 h-3 origin-center p-1 border rounded-sm transition-all duration-200 ${
                        liveMatch.liveDetails.bases[0] ? 'bg-teal-500 border-transparent shadow-[0_0_8px_rgba(20,184,166,0.4)]' : 'bg-zinc-50 border-zinc-200'
                      }`}
                      title="1루"
                    />
                    {/* 2nd base (Top) */}
                    <div
                      className={`absolute -left-0.5 -top-0.5 w-3 h-3 origin-center p-1 border rounded-sm transition-all duration-200 ${
                        liveMatch.liveDetails.bases[1] ? 'bg-teal-500 border-transparent shadow-[0_0_8px_rgba(20,184,166,0.4)]' : 'bg-zinc-50 border-zinc-200'
                      }`}
                      title="2루"
                    />
                    {/* 3rd base (Left) */}
                    <div
                      className={`absolute -left-0.5 bottom-0.5 w-3 h-3 origin-center p-1 border rounded-sm transition-all duration-200 ${
                        liveMatch.liveDetails.bases[2] ? 'bg-teal-500 border-transparent shadow-[0_0_8px_rgba(20,184,166,0.4)]' : 'bg-zinc-50 border-zinc-200'
                      }`}
                      title="3루"
                    />
                    {/* Home plate indicator */}
                    <div className="absolute right-[1px] bottom-[1px] w-2 h-2 transform rotate-45 bg-zinc-200 rounded-sm" />
                  </div>
                </div>
              </div>

              {/* Text commentaries */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500 font-bold bg-zinc-100/60 p-2 rounded-xl">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-zinc-700">투수: <strong className="text-zinc-900 font-bold">{liveMatch.liveDetails.pitcher}</strong></span>
                  </span>
                  <span className="text-zinc-750">타자: <strong className="text-zinc-900 font-bold">{liveMatch.liveDetails.batter}</strong></span>
                </div>

                {/* Speech commentary bubble */}
                <div className="bg-emerald-50/50 text-emerald-700 p-2.5 rounded-2xl flex gap-2 items-start leading-relaxed text-[11px]">
                  <Volume2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5 animate-bounce" />
                  <div className="flex-1">
                    <p className="font-bold text-zinc-800">{liveMatch.liveDetails.lastEvent}</p>
                    <p className="text-[9px] text-zinc-400 font-mono mt-0.5 text-right font-medium">
                      수집시간: {liveMatch.liveDetails.lastUpdated}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. 다음 경기 일정: 실시간 중계 카드 하단에 상시 표시되며, 비시즌 시 단독 노출 */}
      {choiceUpcoming && (
        <div id="next-match-panel" className={`${LAYOUT.card} overflow-hidden border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] !p-0`}>
          {/* Header */}
          <div id="next-match-header-badge" className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className={`${TYPOGRAPHY.headingMd} flex items-center gap-1`}>
                다음 경기 일정
              </h3>
            </div>
            <span className="text-xs font-semibold text-zinc-400">
              {choiceUpcoming.date} · {choiceUpcoming.time}
            </span>
          </div>

          {/* Main scheduled card body */}
          <div id="next-match-inner" className="p-4 space-y-4">
            <div id="teams-scoreboard-box" className="flex items-center justify-between px-3 bg-zinc-50/40 py-4 rounded-2xl border border-zinc-100">
              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-sm italic text-white shadow-sm relative overflow-hidden border border-black/5" style={{ backgroundColor: getTeamById(choiceUpcoming.awayTeamId).primaryColor }}>
                  <span className="text-xl leading-none">
                    {getTeamById(choiceUpcoming.awayTeamId).logoEmoji === 'ヒーロー' ? '🦸' : getTeamById(choiceUpcoming.awayTeamId).logoEmoji === '쌍둥이' ? '⚾' : getTeamById(choiceUpcoming.awayTeamId).logoEmoji}
                  </span>
                  <span className="text-[7.5px] font-bold absolute bottom-0.5 tracking-tighter text-white/85">{choiceUpcoming.awayTeamId.toUpperCase()}</span>
                </div>
                <span className="text-xs font-bold text-zinc-800 mt-1.5">{getTeamById(choiceUpcoming.awayTeamId).shortName}</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-tight">원정 AWAY</span>
              </div>

              {/* VS Score element */}
              <div className="flex flex-col items-center">
                {choiceUpcoming.status === 'completed' ? (
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl font-black text-zinc-900 font-mono">{choiceUpcoming.awayScore}</span>
                    <span className="bg-zinc-100 text-zinc-500 text-[8px] font-bold px-1.5 py-0.5 rounded font-display tracking-tight border border-zinc-200/60 font-semibold text-center leading-none">경기종료</span>
                    <span className="text-3xl font-black text-zinc-900 font-mono">{choiceUpcoming.homeScore}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-bold text-brand bg-brand-light px-2 py-0.5 rounded uppercase tracking-wider border border-brand/20">
                      {favoriteTeam.id === choiceUpcoming.homeTeamId ? 'HOME 경기' : 'AWAY 경기'}
                    </span>
                    <span className="text-md font-bold text-zinc-300 font-mono mt-1">VS</span>
                  </div>
                )}
              </div>

              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-sm italic text-white shadow-sm relative overflow-hidden border border-black/5" style={{ backgroundColor: getTeamById(choiceUpcoming.homeTeamId).primaryColor }}>
                  <span className="text-xl leading-none">
                    {getTeamById(choiceUpcoming.homeTeamId).logoEmoji === 'ヒーロー' ? '🦸' : getTeamById(choiceUpcoming.homeTeamId).logoEmoji === '쌍둥이' ? '⚾' : getTeamById(choiceUpcoming.homeTeamId).logoEmoji}
                  </span>
                  <span className="text-[7.5px] font-bold absolute bottom-0.5 tracking-tighter text-white/85">{choiceUpcoming.homeTeamId.toUpperCase()}</span>
                </div>
                <span className="text-xs font-bold text-zinc-800 mt-1.5">{getTeamById(choiceUpcoming.homeTeamId).shortName}</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-tight">홈 HOME</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
