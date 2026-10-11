import React, { useState } from 'react';
import { Match, KBOTeam, AttendanceRecord } from '../types';
import { getTeamById, KBO_TEAMS } from '../data/kboData';
import { ChevronLeft, ChevronRight, Bookmark, MapPin, Award, Navigation } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface MatchCalendarProps {
  favoriteTeam: KBOTeam;
  matches: Match[];
  attendanceRecords: AttendanceRecord[];
  onMatchSelect: (match: Match) => void;
  onAddCustomRecord: () => void;
}

export default function MatchCalendar({
  favoriteTeam,
  matches,
  attendanceRecords,
  onMatchSelect,
  onAddCustomRecord
}: MatchCalendarProps) {
  // 기본값: 2026년 5월 설정
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 1부터 시작

  const handlePrevMonth = () => {
    if (currentMonth > 3) {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth < 9) {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // 해당 월의 총 일수와 시작 요일 구하기
  const totalDays = new Date(currentYear, currentMonth, 0).getDate();
  const startDayPadding = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 = 일요일

  // 현재 년도와 월에 해당하는 선호 구단의 경기 목록 필터링
  const currentMonthMatches = matches.filter(match => {
    if (match.homeTeamId !== favoriteTeam.id && match.awayTeamId !== favoriteTeam.id) return false;
    const matchDate = new Date(match.date);
    return matchDate.getFullYear() === currentYear && (matchDate.getMonth() + 1) === currentMonth;
  });

  // 해당 날짜에 경기가 있는지 확인하는 헬퍼 함수
  const getMatchByDay = (day: number): Match | undefined => {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    const targetDateStr = `${currentYear}-${monthStr}-${dayStr}`;
    return currentMonthMatches.find(m => m.date === targetDateStr);
  };

  // 특정 경기 ID에 대한 직관 기록(참석 정보)을 가져오는 헬퍼 함수
  const getAttendanceForMatch = (matchId: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(r => r.matchId === matchId);
  };

  // 요일 헤더 목록 (일요일 ~ 토요일)
  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  // 달력 타일 렌더링용 배열
  const cells: React.ReactNode[] = [];

  // 1. 이전 달 빈 칸 채우기 패딩 타일 추가
  for (let i = 0; i < startDayPadding; i++) {
    cells.push(
      <div 
        key={`pad-${i}`} 
        className="bg-zinc-50 min-h-[82px] border border-zinc-100 rounded-2xl opacity-40"
      />
    );
  }

  // 2. 실제 날짜 타일 추가
  for (let day = 1; day <= totalDays; day++) {
    const match = getMatchByDay(day);
    const dayOfWeek = (day + startDayPadding - 1) % 7;
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;

    // 완료된 경기 중 선호 구단이 패배했는지 여부 파악
    const isCompleted = match?.status === 'completed';
    let isLoss = false;
    if (match && isCompleted && match.homeScore !== undefined && match.awayScore !== undefined) {
      if (match.homeTeamId === favoriteTeam.id) {
        isLoss = match.homeScore < match.awayScore;
      } else if (match.awayTeamId === favoriteTeam.id) {
        isLoss = match.awayScore < match.homeScore;
      }
    }

    let textColor = 'text-zinc-800';
    if (isSunday) textColor = 'text-rose-600';
    if (isSaturday) textColor = 'text-blue-600';
    if (isMonday) textColor = 'text-zinc-400';
    if (isLoss) textColor = 'text-zinc-400/80';

    const hasMatch = !!match;
    const attRecord = match ? getAttendanceForMatch(match.id) : undefined;
    const isAttended = !!attRecord;

    cells.push(
      <div
        key={`day-${day}`}
        id={`day-cell-${day}`}
        onClick={() => match && onMatchSelect(match)}
        className={`min-h-[82px] border rounded-2xl flex flex-col justify-between p-2 cursor-pointer transition-all duration-200 ${
          hasMatch
            ? isLoss
              ? 'border-zinc-200 bg-zinc-100/60 hover:bg-zinc-150/50 opacity-60 shadow-none'
              : isAttended
                ? 'border-amber-300 bg-amber-50/70 hover:bg-amber-100/50 shadow-[0_2px_8px_rgba(245,158,11,0.04)]'
                : 'border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50 shadow-sm'
            : 'border-zinc-100 bg-zinc-100/20 cursor-default hover:bg-zinc-100/40 opacity-70'
        }`}
      >
        {/* 날짜 번호 및 홈/어웨이 표시기 */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold font-mono ${textColor}`}>{day}</span>
          
          {hasMatch && (
            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md leading-none ${
              isLoss
                ? 'bg-zinc-100 text-zinc-400 border border-zinc-200/40'
                : favoriteTeam.id === match.homeTeamId 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
                  : 'bg-zinc-100 text-zinc-500 border border-zinc-200/50'
            }`}>
              {favoriteTeam.id === match.homeTeamId ? 'H' : 'A'}
            </span>
          )}
        </div>

        {/* 중앙 비주얼: 상대 구단 로고 */}
        <div className="flex-1 flex flex-col items-center justify-center py-1">
          {hasMatch ? (
            <div className="flex flex-col items-center text-center">
              {/* 상대 구단 엠블럼 */}
              <span className={`text-sm ${isLoss ? 'grayscale opacity-60' : ''}`}>
                {getTeamById(match.homeTeamId === favoriteTeam.id ? match.awayTeamId : match.homeTeamId).logoEmoji}
              </span>
              
              {/* 상대 경기 설명 */}
              <span className={`text-[8px] font-bold tracking-tighter mt-0.5 truncate max-w-[48px] ${
                isLoss ? 'text-zinc-400 font-medium' : 'text-zinc-500'
              }`}>
                {getTeamById(match.homeTeamId === favoriteTeam.id ? match.awayTeamId : match.homeTeamId).shortName}
              </span>
            </div>
          ) : (
            isMonday && <span className="text-[8px] text-zinc-400 font-semibold tracking-tighter">월요휴무</span>
          )}
        </div>

        {/* 대진 결과 태그 또는 스코어 */}
        <div className="w-full">
          {hasMatch ? (
            isAttended ? (
              <div className={`text-[8px] font-bold py-0.5 rounded text-center leading-none tracking-tighter uppercase shrink-0 ${
                attRecord.result === 'win' 
                  ? 'bg-emerald-550 text-white' 
                  : 'bg-zinc-400 text-white'
              }`}>
                {attRecord.result === 'win' ? '★ 직관승' : attRecord.result === 'lose' ? '직관패' : '직관무'}
              </div>
            ) : match.status === 'completed' ? (
              <div className={`text-[9px] font-mono text-center font-bold leading-none tracking-tighter ${
                isLoss ? 'text-zinc-400 font-medium' : 'text-zinc-500'
              }`}>
                {match.homeTeamId === favoriteTeam.id 
                  ? `${match.homeScore}:${match.awayScore}` 
                  : `${match.awayScore}:${match.homeScore}`}
              </div>
            ) : match.status === 'live' ? (
              <div className="text-[8px] bg-red-500 text-white font-bold text-center py-0.5 rounded leading-none shrink-0 animate-pulse tracking-tighter">
                LIVE
              </div>
            ) : (
              <div className="text-[8px] text-zinc-400 font-bold font-mono text-center leading-none tracking-tighter">
                {match.time}
              </div>
            )
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div id="calendar-view-container" className={`${LAYOUT.card} !p-4 shadow-[0_4px_20px_rgba(0,0,0,0.015)]`}>
      {/* 달력 헤더 네비게이션 */}
      <div id="calendar-header-nav" className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 id="cal-headline" className={TYPOGRAPHY.headingMd}>
            구단 경기 일정
          </h3>
        </div>
        
        {/* 월 선택 버튼 영역 */}
        <div className="flex items-center gap-3">
          <button
            id="btn-calendar-prev"
            onClick={handlePrevMonth}
            disabled={currentMonth <= 3}
            className="p-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-zinc-800 px-1 font-display">
            {currentYear}년 {currentMonth}월
          </span>

          <button
            id="btn-calendar-next"
            onClick={handleNextMonth}
            disabled={currentMonth >= 9}
            className="p-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 그리드 */}
      <div id="calendar-week-grid" className="grid grid-cols-7 gap-1 text-center justify-items-stretch mb-2">
        {WEEKDAYS.map(day => (
          <span
            key={`wd-${day}`}
            className={`text-[10px] font-bold py-1.5 text-zinc-450 ${
              day === '일' ? 'text-rose-500' : day === '토' ? 'text-blue-500' : ''
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      {/* 달력 셀 피드 */}
      <div id="calendar-cells-grid" className="grid grid-cols-7 gap-1">
        {cells}
      </div>
    </div>
  );
}
