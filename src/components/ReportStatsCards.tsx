import React, { useState, useMemo } from 'react';
import { AttendanceRecord, KBOTeam } from '../types';
import { getTeamById, KBO_TEAMS } from '../data/kboData';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { TEXTS, TYPOGRAPHY } from '../lib/styles';

/**
 * 1. 나의 직관 요정 지수 카드
 */
export function AttendanceFairyCard({
  records,
  favoriteTeam,
}: {
  records: AttendanceRecord[];
  favoriteTeam: KBOTeam;
}) {
  const totalGames = records.length;
  const wins = records.filter((r) => r.result === 'win').length;
  const losses = records.filter((r) => r.result === 'lose').length;
  const draws = records.filter((r) => r.result === 'draw').length;

  const playableGamesCount = wins + losses;
  const winRate = playableGamesCount > 0 ? (wins / playableGamesCount) * 100 : 0;

  // 승률 비례별 개성 넘치는 전용 팬 칭호 획득 로직
  let fanTitle = '직관새내기 🌱';
  let titleDesc = '첫 직관을 기록하여 승리요정에 도전하세요!';
  let emoji = '🐥';

  if (totalGames > 0) {
    if (winRate >= 100) {
      fanTitle = '초특급 승리요정 👼';
      titleDesc = '이 정도면 구단에서 시즌권 주세요!';
      emoji = '👑';
    } else if (winRate >= 90) {
      fanTitle = '승리 부적 🥳';
      titleDesc = '어디서 승리 냄새 안나요? ~(‾▿‾~)';
      emoji = '🎉';
    } else if (winRate >= 80) {
      fanTitle = '승률 스나이퍼 🔫';
      titleDesc = '직관만 가면 상대팀이 긴장';
      emoji = '🎯';
    } else if (winRate >= 70) {
      fanTitle = '인간 승률 버프 🔥';
      titleDesc = '승리 버프 장착 ଘ(∩^o^)⊃━☆゜';
      emoji = '🪄';
    } else if (winRate >= 60) {
      fanTitle = '승리맛집 단골 😎';
      titleDesc = '승리 메뉴 주문 완료 (˙⤙˙ )';
      emoji = '🍺';
    } else if (winRate >= 50) {
      fanTitle = '동전 던지기 장인 🪙';
      titleDesc = '이겨? 져? (‘◇’)?';
      emoji = '🤷‍♂️';
    } else if (winRate >= 40) {
      fanTitle = '눈물 젖은 유니폼 🤧';
      titleDesc = '오늘도 응원가는 불렀다...';
      emoji = '🌧️';
    } else if (winRate >= 30) {
      fanTitle = '패배 수집가 💀';
      titleDesc = '희귀한 패배 컬렉션 보유중';
      emoji = '🏳️';
    } else if (winRate >= 20) {
      fanTitle = '프로보살 직관러 🛡️';
      titleDesc = '패배에도 흔들리지 않는 멘탈';
      emoji = '🧘';
    } else {
      fanTitle = '패배 요정 탈출기.. 😈';
      titleDesc = '많이 가면..탈출하지 않을까..?';
      emoji = '🧗';
    }
  }

  return (
    <div
      id="stats-summary-card"
      className="bg-white border border-[#e5e8eb] p-5 rounded-3xl relative overflow-hidden shadow-xs"
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-brand/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2.5">
        <span className={`${TYPOGRAPHY.bodyBold} uppercase tracking-wider`}>
          나의 직관 요정 지수
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col justify-center">
          <h4
            id="user-title"
            className={`${TYPOGRAPHY.headingLg} flex items-center gap-1.5 text-[17px] leading-tight`}
          >
            <span>{emoji} {fanTitle}</span>
          </h4>
          <p className={`${TYPOGRAPHY.bodyRegular} mt-1 max-w-[190px]`}>
            {titleDesc}
          </p>
        </div>

        {/* 원형 승률 가시화 서클 */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="34"
              className="stroke-purple-100"
              strokeWidth="6.5"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              className="stroke-brand transition-all duration-500"
              strokeWidth="6.5"
              fill="transparent"
              strokeDasharray={213.628}
              strokeDashoffset={213.628 - (213.628 * winRate) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex items-center justify-center">
            <span className={`${TYPOGRAPHY.bodyBold} font-mono text-sm leading-none`}>
              {totalGames > 0 ? Math.round(winRate) : '0'}%
            </span>
          </div>
        </div>
      </div>

      {/* 승-패-무 전적 카운터 스트립 */}
      <div
        id="three-counter-blocks"
        className="grid grid-cols-4 gap-2 text-center mt-2.5 pt-0 text-xs"
      >
        <div className="bg-[#f9fafb] p-2 rounded-xl border border-[#e5e8eb]">
          <span className={`block ${TYPOGRAPHY.captionMuted} leading-none mb-1 text-[9px]`}>
            {TEXTS.totalVisits}
          </span>
          <span className={`font-extrabold ${TYPOGRAPHY.bodyBold} font-mono text-base`}>
            {totalGames}
          </span>
        </div>
        <div className="bg-brand-light/50 p-2 rounded-xl border border-brand/20">
          <span className={`block text-brand ${TYPOGRAPHY.captionMuted} leading-none mb-1 text-[9px]`}>
            {TEXTS.win}
          </span>
          <span className={`font-extrabold text-brand font-mono text-base ${TYPOGRAPHY.bodyBold}`}>
            {wins}
          </span>
        </div>
        <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100/60">
          <span className={`block text-rose-500 ${TYPOGRAPHY.captionMuted} leading-none mb-1 text-[9px]`}>
            {TEXTS.loss}
          </span>
          <span className={`font-extrabold text-rose-500 font-mono text-base ${TYPOGRAPHY.bodyBold}`}>
            {losses}
          </span>
        </div>
        <div className="bg-[#f9fafb] p-2 rounded-xl border border-[#e5e8eb]">
          <span className={`block ${TYPOGRAPHY.captionMuted} text-[#4e5968] leading-none mb-1 text-[9px]`}>
            {TEXTS.draw}
          </span>
          <span className={`font-extrabold text-[#4e5968] font-mono text-base ${TYPOGRAPHY.bodyBold}`}>
            {draws}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. 직관기록 캘린더 카드
 */
export function AttendanceWinRateCalendarCard({
  records,
}: {
  records: AttendanceRecord[];
}) {
  const [currentYear, setCurrentYear] = useState(() => {
    if (records.length > 0) {
      const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
      const parts = sorted[0].date.split('-');
      return parseInt(parts[0], 10);
    }
    return new Date().getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (records.length > 0) {
      const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
      const parts = sorted[0].date.split('-');
      return parseInt(parts[1], 10) - 1; // 0-indexed month
    }
    return new Date().getMonth();
  });

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div
      id="monthly-attendance-calendar"
      className="bg-white border border-[#e5e8eb] p-5 rounded-3xl space-y-4 shadow-xs relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`${TYPOGRAPHY.bodyBold} uppercase tracking-wider`}>
            {TEXTS.attendanceWinRate}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
            title="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-zinc-800 px-1 font-display">
            {currentYear}년 {currentMonth + 1}월
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 transition cursor-pointer"
            title="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 달력 요일 헤더 */}
      <div className={`grid grid-cols-7 gap-1 text-center ${TYPOGRAPHY.captionMuted} text-[10px] border-b border-[#f2f4f6] pb-2`}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <span key={idx} className={idx === 0 ? 'text-rose-500/90' : idx === 6 ? 'text-blue-400/90' : ''}>
            {day}
          </span>
        ))}
      </div>

      {/* 일별 직관 달력 타일 그리드 */}
      <div className="grid grid-cols-7 gap-y-2.5 gap-x-1.5 text-center text-xs">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const monthStr = String(currentMonth + 1).padStart(2, '0');
          const dayStr = String(day).padStart(2, '0');
          const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

          const dayRecords = records.filter((r) => r.date === dateKey);
          const hasRecord = dayRecords.length > 0;
          const isWin = dayRecords.some((r) => r.result === 'win');

          let cellClass =
            'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[11px] font-bold rounded-full mx-auto transition-all duration-200 relative select-none ';
          let titleText = `${currentYear}년 ${currentMonth + 1}월 ${day}일`;

          if (hasRecord) {
            const details = dayRecords
              .map((r) => {
                const opp = getTeamById(r.opponentTeamId);
                const oppName = opp ? opp.shortName : '상대';
                const resKo =
                  r.result === 'win' ? '승리' : r.result === 'lose' ? '패배' : '무승부';
                return `${oppName}전 ${r.ourScore}:${r.oppScore} (${resKo})`;
              })
              .join(', ');

            titleText += ` - [직관 기록 완료] ${details}`;

            if (isWin) {
              // 이긴 날: 연한 보라색 원
              cellClass +=
                'bg-purple-100 text-purple-700 font-extrabold shadow-[0_0_6px_rgba(147,51,234,0.15)] hover:bg-purple-200 scale-110 active:scale-95 cursor-pointer';
            } else {
              // 진 날 (또는 무승부): 연한 회색 원
              cellClass +=
                'bg-zinc-100 text-zinc-500 font-bold shadow-[0_0_6px_rgba(161,161,170,0.1)] hover:bg-zinc-200 scale-110 active:scale-95 cursor-pointer';
            }
          } else {
            // 일반 날짜
            const isSunday = idx % 7 === 0;
            const isSaturday = idx % 7 === 6;
            cellClass += 'text-[#4e5968] hover:bg-[#f2f4f6] rounded-full';
            if (isSunday) {
              cellClass += ' text-rose-500/80';
            } else if (isSaturday) {
              cellClass += ' text-blue-400/80';
            }
          }

          return (
            <div key={`day-${day}`} className="aspect-square flex items-center justify-center">
              <button type="button" className={cellClass} title={titleText}>
                <span>{day}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 3. 상대 구단별 직관 승률 전적 카드
 */
export function OpponentWinRateCard({
  records,
  favoriteTeam,
}: {
  records: AttendanceRecord[];
  favoriteTeam: KBOTeam;
}) {
  const [showAllOpponents, setShowAllOpponents] = useState(false);

  // 상대 구단 대전별 승패무 및 총 게임 수 계산
  const opponentStats = useMemo(() => {
    const stats: { [oppId: string]: { wins: number; losses: number; draws: number; total: number } } = {};
    records.forEach((r) => {
      if (!stats[r.opponentTeamId]) {
        stats[r.opponentTeamId] = { wins: 0, losses: 0, draws: 0, total: 0 };
      }
      stats[r.opponentTeamId].total += 1;
      if (r.result === 'win') stats[r.opponentTeamId].wins += 1;
      else if (r.result === 'lose') stats[r.opponentTeamId].losses += 1;
      else stats[r.opponentTeamId].draws += 1;
    });
    return stats;
  }, [records]);

  const sortedOpponents = useMemo(() => {
    const opps = KBO_TEAMS.filter((t) => t.id !== favoriteTeam.id).map((opp) => {
      const stat = opponentStats[opp.id] || { wins: 0, losses: 0, draws: 0, total: 0 };
      const oppWinrate = stat.total > 0 ? (stat.wins / stat.total) * 100 : 0;
      return { opp, stat, oppWinrate };
    });

    // 정렬 순서: 상대 승률 내림차순 -> 매치 경기 횟수 내림차순 -> 구단 ID 알파벳 오름차순
    return opps.sort((a, b) => {
      if (b.oppWinrate !== a.oppWinrate) {
        return b.oppWinrate - a.oppWinrate;
      }
      if (b.stat.total !== a.stat.total) {
        return b.stat.total - a.stat.total;
      }
      return a.opp.id.localeCompare(b.opp.id);
    });
  }, [opponentStats, favoriteTeam.id]);

  return (
    <div
      onClick={() => setShowAllOpponents(!showAllOpponents)}
      className="bg-white border border-[#e5e8eb] p-4 rounded-3xl space-y-3.5 shadow-xs cursor-pointer select-none active:scale-[0.995] hover:border-brand/40 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <h4 className={`${TYPOGRAPHY.bodyBold} flex items-center gap-1.5 leading-none`}>
          <span>{TEXTS.opponentWinRate}</span>
        </h4>
        <span className="text-[10px] font-bold text-[#8b95a1] group-hover:text-brand transition-colors flex items-center gap-0.5">
          {showAllOpponents ? (
            <>접기 <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>더보기 <ChevronDown className="w-3 h-3" /></>
          )}
        </span>
      </div>

      <div className="space-y-2.5 max-h-[290px] overflow-y-auto scrollbar-thin">
        {sortedOpponents.slice(0, showAllOpponents ? undefined : 5).map(({ opp, stat, oppWinrate }) => {
          return (
            <div key={`opp-stat-${opp.id}`} className="space-y-1 text-[11px]">
              <div className={`flex justify-between ${TYPOGRAPHY.bodyBold}`}>
                <span className="text-[#4e5968] flex items-center gap-1">
                  <span>{opp.logoEmoji === 'ヒーロー' ? '🦸' : opp.logoEmoji === '쌍둥이' ? '⚾' : opp.logoEmoji}</span>
                  <span>{opp.shortName}전</span>
                </span>
                <span className={`text-[#8b95a1] font-mono ${TYPOGRAPHY.captionMuted}`}>
                  {stat.total > 0
                    ? `${stat.wins}승 ${stat.losses}패 (${oppWinrate.toFixed(0)}%)`
                    : `${TEXTS.noRecordsOpponent}`}
                </span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden flex">
                {stat.total > 0 ? (
                  <>
                    <div
                      className="bg-brand h-full"
                      style={{ width: `${(stat.wins / stat.total) * 100}%` }}
                      title="승리"
                    />
                    <div
                      className="bg-[#8b95a1] h-full"
                      style={{ width: `${(stat.draws / stat.total) * 100}%` }}
                      title="무승부"
                    />
                    <div
                      className="bg-rose-500 h-full"
                      style={{ width: `${(stat.losses / stat.total) * 100}%` }}
                      title="패배"
                    />
                  </>
                ) : (
                  <div className="bg-[#e5e8eb] h-full w-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!showAllOpponents && sortedOpponents.length > 5 && (
        <div className="pt-1.5 text-center text-[10px] font-bold text-[#8b95a1] group-hover:text-brand transition-colors border-t border-dashed border-[#e5e8eb]/80">
          구단 전체 기록 보기
        </div>
      )}
    </div>
  );
}
