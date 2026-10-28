import React, { useState, useMemo, useRef, useEffect } from 'react';
import { KBOTeam } from '../types';
import { KBO_TEAMS } from '../data/kboData';
import {
  KBO_YOUTUBE_CHANNELS,
  TEAM_STORE_LINKS,
  TeamStoreLink
} from '../data/kboClubData';
import {
  Youtube,
  ExternalLink,
  Search,
  Star,
  Users,
  ShoppingBag
} from 'lucide-react';

interface ClubTabProps {
  favoriteTeam: KBOTeam;
  activeSubTab: 'youtube' | 'goods';
  onSubTabChange?: (tab: 'youtube' | 'goods') => void;
}

export function ClubTab({ favoriteTeam, activeSubTab }: ClubTabProps) {
  const [youtubeSearchTerm, setYoutubeSearchTerm] = useState<string>('');

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
    if (activeSubTab === 'goods' && activeBtnRef.current) {
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

  // 구단 채널 정렬: 내 구단(favoriteTeam)이 1순위로 오도록 정렬
  const sortedYoutubeChannels = useMemo(() => {
    const list = [...KBO_YOUTUBE_CHANNELS].sort((a, b) => {
      if (a.teamId === favoriteTeam.id) return -1;
      if (b.teamId === favoriteTeam.id) return 1;
      return 0;
    });

    if (!youtubeSearchTerm.trim()) return list;

    const query = youtubeSearchTerm.toLowerCase();
    return list.filter((ch) => {
      const team = KBO_TEAMS.find((t) => t.id === ch.teamId);
      return (
        ch.channelName.toLowerCase().includes(query) ||
        ch.handle.toLowerCase().includes(query) ||
        (team && (team.name.toLowerCase().includes(query) || team.shortName.toLowerCase().includes(query))) ||
        ch.videoTags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [favoriteTeam.id, youtubeSearchTerm]);

  // 스토어 탭: 현재 선택된 구단 정보
  const currentSelectedTeam = useMemo(() => {
    return KBO_TEAMS.find((t) => t.id === selectedTeamId) || favoriteTeam;
  }, [selectedTeamId, favoriteTeam]);

  // 선택된 구단의 공식 스토어 링크 목록
  const currentStoreLinks: TeamStoreLink[] = useMemo(() => {
    return TEAM_STORE_LINKS[selectedTeamId] || [];
  }, [selectedTeamId]);

  return (
    <div className="pb-16 animate-fadeIn">
      {/* 1. 구단 뷰 (구단 공식 유튜브 채널 목록 - 내 구단 1순위) */}
      {activeSubTab === 'youtube' && (
        <div className="space-y-4">
          {/* 상단 안내 & 검색 바 */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <Youtube className="w-5 h-5 fill-red-600 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
                    KBO 구단
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      10개 구단
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    내 구단이 1순위로 배치되어 최신 소식 및 영상을 바로 확인하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 구단 빠른 검색 */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="구단명, 채널명, 태그(#덕아웃캠) 검색"
                value={youtubeSearchTerm}
                onChange={(e) => setYoutubeSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 focus:border-red-400 transition"
              />
            </div>
          </div>

          {/* 구단 채널 목록 (내 구단이 1순위 최상단) */}
          <div className="space-y-3">
            {sortedYoutubeChannels.map((channel) => {
              const team = KBO_TEAMS.find((t) => t.id === channel.teamId);
              const isMyTeam = channel.teamId === favoriteTeam.id;

              return (
                <div
                  key={channel.teamId}
                  className={`bg-white rounded-2xl border transition overflow-hidden ${
                    isMyTeam
                      ? 'border-red-200 shadow-md ring-1 ring-red-400/20'
                      : 'border-zinc-100 hover:border-zinc-200 shadow-xs'
                  }`}
                >
                  {/* 내 구단 1순위 강조 배너 */}
                  {isMyTeam && (
                    <div
                      className="px-4 py-1.5 text-xs font-bold flex items-center justify-between text-white"
                      style={{ backgroundColor: team?.primaryColor || '#EC1C24' }}
                    >
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        1순위 추천 · 내 응원 구단
                      </span>
                      <span className="text-[10px] font-semibold opacity-90">
                        {team?.name}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {/* 채널 헤더 */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 구단 로고 / 유튜브 뱃지 */}
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-zinc-100 shadow-xs relative"
                          style={{
                            backgroundColor: isMyTeam
                              ? `${team?.primaryColor}15`
                              : '#F8F9FA'
                          }}
                        >
                          <span>{team?.logoEmoji || '⚾'}</span>
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xs">
                            <Youtube className="w-3 h-3 fill-white" />
                          </span>
                        </div>

                        {/* 채널 정보 */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-bold text-zinc-500">
                              {team?.name}
                            </span>
                            {isMyTeam && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-red-100 text-red-600">
                                MY TEAM
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-black text-zinc-900 truncate tracking-tight">
                            {channel.channelName}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                            <span>{channel.handle}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-zinc-600">
                              <Users className="w-3 h-3 text-zinc-400" />
                              구독자 {channel.subscribers}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 유튜브 바로가기 버튼 */}
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                          isMyTeam
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                        }`}
                      >
                        <span>바로가기</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* 채널 설명 */}
                    <p className="text-xs text-zinc-600 leading-relaxed font-normal bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      {channel.description}
                    </p>

                    {/* 추천 영상 하이라이트 */}
                    {channel.popularVideoTitle && (
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-red-50/50 p-2 rounded-lg border border-red-100">
                        <span className="text-red-500 font-bold shrink-0">🎬 최근 화제작:</span>
                        <span className="font-medium text-zinc-700 truncate">
                          {channel.popularVideoTitle}
                        </span>
                      </div>
                    )}

                    {/* 주요 영상 태그 목록 */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {channel.videoTags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 공식 스토어 탭 뷰 (상단 마진을 줄이고 베스트 굿즈 및 불필요한 라인 제거) */}
      {activeSubTab === 'goods' && (
        <div className="-mt-2 space-y-3">
          {/* 가나다 순 구단 버튼 가로 스크롤/드래그 바 (사각 테두리 제거 & 라운드 필 버튼) */}
          <div className="py-1">
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

          {/* 팀에 따라 보여주는 공식 스토어 링크 카드 목록 (상단 텍스트 없이 바로 나열) */}
          {currentStoreLinks.length > 0 && (
            <div className="grid grid-cols-1 gap-2 pt-0.5">
              {currentStoreLinks.map((link, idx) => {
                let hostDomain = '';
                try {
                  hostDomain = new URL(link.url).hostname.replace('www.', '');
                } catch {
                  hostDomain = '공식몰';
                }

                return (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-2xl border border-zinc-100 hover:border-zinc-300 p-3.5 shadow-xs hover:shadow-sm transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 스토어 아이콘 */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${currentSelectedTeam.primaryColor}14`,
                            color: currentSelectedTeam.primaryColor
                          }}
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </div>

                        {/* 스토어 정보 */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-black"
                              style={{
                                backgroundColor: `${currentSelectedTeam.primaryColor}15`,
                                color: currentSelectedTeam.primaryColor
                              }}
                            >
                              {link.category}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400 truncate">
                              {hostDomain}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-zinc-900 group-hover:text-brand transition tracking-tight truncate">
                            {link.title}
                          </h4>
                          <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
                            {link.description}
                          </p>
                        </div>
                      </div>

                      {/* 바로가기 버튼 */}
                      <div
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition shadow-xs group-hover:opacity-90"
                        style={{ backgroundColor: currentSelectedTeam.primaryColor || '#531ded' }}
                      >
                        <span>바로가기</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
