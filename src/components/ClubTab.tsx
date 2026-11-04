import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KBOTeam } from '../types';
import { KBO_TEAMS } from '../data/kboData';
import {
  TEAM_STORE_LINKS,
  TeamStoreLink,
  TEAM_HOMEPAGE_LINKS,
  TeamHomepageLink,
  TEAM_YOUTUBE_LINKS,
  TeamYoutubeLink
} from '../data/kboClubData';

interface ClubTabProps {
  favoriteTeam: KBOTeam;
  activeSubTab: 'youtube' | 'goods';
  onSubTabChange?: (tab: 'youtube' | 'goods') => void;
}

export function ClubTab({ favoriteTeam, activeSubTab }: ClubTabProps) {

  // 공식 스토어 탭: 마이팀으로 자동 선택
  const [selectedTeamId, setSelectedTeamId] = useState<string>(favoriteTeam.id);

  // 마이팀이 변경되면 공식 스토어 탭의 선택도 자동으로 마이팀으로 동기화
  useEffect(() => {
    setSelectedTeamId(favoriteTeam.id);
  }, [favoriteTeam.id]);

  // 가나다 순으로 정렬된 KBO 구단 목록
  const sortedTeams = useMemo(() => {
    return [...KBO_TEAMS].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, []);

  // 가로 드래그 스크롤 제어용 Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  // 마이팀 또는 선택 구단이 변경되었을 때 해당 버튼으로 스무스 스크롤
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeSubTab, selectedTeamId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  // 스토어 탭: 현재 선택된 구단 정보
  const currentSelectedTeam = useMemo(() => {
    return KBO_TEAMS.find((t) => t.id === selectedTeamId) || favoriteTeam;
  }, [selectedTeamId, favoriteTeam]);

  // 선택된 구단의 공식 스토어 링크 목록
  const currentStoreLinks: TeamStoreLink[] = useMemo(() => {
    return TEAM_STORE_LINKS[selectedTeamId] || [];
  }, [selectedTeamId]);

  // 선택된 구단의 공식 홈페이지 정보
  const currentHomepage: TeamHomepageLink | undefined = useMemo(() => {
    return TEAM_HOMEPAGE_LINKS[selectedTeamId];
  }, [selectedTeamId]);

  // 선택된 구단의 공식 유튜브 정보
  const currentYoutube: TeamYoutubeLink | undefined = useMemo(() => {
    return TEAM_YOUTUBE_LINKS[selectedTeamId];
  }, [selectedTeamId]);

  return (
    <div className="pb-16 animate-fadeIn space-y-3">
      {/* 가나다 순 구단 버튼 가로 스크롤/드래그 바 (구단 및 공식스토어 공통 표시) */}
      <div className="-mt-2 py-1">
        {/* 마우스 드래그 & 터치 가로 스크롤 컨테이너 */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          {sortedTeams.map((team) => {
            const isSelected = team.id === selectedTeamId;
            const isMyTeam = team.id === favoriteTeam.id;

            return (
              <button
                key={team.id}
                ref={isSelected ? activeBtnRef : null}
                onClick={() => {
                  if (!hasDraggedRef.current) {
                    setSelectedTeamId(team.id);
                  }
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-sm scale-[1.02]'
                    : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/80 shadow-2xs'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: team.primaryColor || '#531ded',
                        boxShadow: `0 4px 12px ${team.primaryColor}35`
                      }
                    : {}
                }
              >
                <span>{team.name}</span>
                {isMyTeam && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-brand/10 text-brand'
                    }`}
                  >
                    MY
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. 구단 뷰: 선택된 구단 공식 홈페이지 & 공식 유튜브 카드 */}
      {activeSubTab === 'youtube' && (
        <div className="grid grid-cols-1 gap-2 pt-0.5">
          {currentHomepage && (
            <a
              href={currentHomepage.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-zinc-100 hover:border-zinc-300 p-3.5 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-black text-zinc-900 group-hover:text-brand transition tracking-tight truncate">
                  {currentHomepage.title}
                </h4>
                <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
                  {currentHomepage.description}
                </p>
              </div>
            </a>
          )}

          {currentYoutube && (
            <a
              href={currentYoutube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-zinc-100 hover:border-zinc-300 p-3.5 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className="min-w-0">
                <h4 className="text-xs font-black text-zinc-900 group-hover:text-brand transition tracking-tight truncate">
                  {currentYoutube.title}
                </h4>
                <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
                  {currentYoutube.description}
                </p>
              </div>
            </a>
          )}
        </div>
      )}

      {/* 2. 공식 스토어 탭 뷰 */}
      {activeSubTab === 'goods' && (
        <>
          {/* 팀에 따라 보여주는 공식 스토어 링크 카드 목록 (상단 텍스트 없이 바로 나열) */}
          {currentStoreLinks.length > 0 && (
            <div className="grid grid-cols-1 gap-2 pt-0.5">
              {currentStoreLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl border border-zinc-100 hover:border-zinc-300 p-3.5 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-zinc-900 group-hover:text-brand transition tracking-tight truncate">
                      {link.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
