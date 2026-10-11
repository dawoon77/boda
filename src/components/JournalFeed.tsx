import React, { useState } from 'react';
import { AttendanceRecord, KBOTeam } from '../types';
import { getTeamById } from '../data/kboData';
import { MapPin, Calendar, Edit2, Camera, HelpCircle, ChevronLeft, ChevronRight, X, Maximize2, MoreVertical, Trash2 } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface DiaryPhotoCarouselProps {
  urls: string[];
  onPhotoClick: (idx: number) => void;
}

function DiaryPhotoCarousel({ urls, onPhotoClick }: DiaryPhotoCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (urls.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full aspect-square rounded-2xl border border-[#e5e8eb] overflow-hidden relative shadow-xs bg-zinc-50 mb-4 group select-none">
      {/* 슬라이드 이미지 프레임 컨테이너 */}
      <div className="w-full h-full relative overflow-hidden">
        <div 
          className="h-full flex transition-transform duration-300 ease-out cursor-zoom-in"
          style={{ 
            width: `${urls.length * 100}%`,
            transform: `translateX(-${(currentIdx * 100) / urls.length}%)` 
          }}
          onClick={() => onPhotoClick(currentIdx)}
        >
          {urls.map((url, idx) => (
            <div 
              key={idx} 
              style={{ width: `${100 / urls.length}%` }} 
              className="h-full shrink-0 relative"
            >
              <img 
                referrerPolicy="no-referrer"
                src={url} 
                alt={`직관 인증 사진 ${idx + 1}`}
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
      </div>



      {/* 상단 현재 슬라이더 이미지 카운트 인디케이터 오버레이 */}
      {urls.length > 1 && (
        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10.5px] font-mono font-black px-2.5 py-0.5 rounded-lg border border-white/10 z-10 shadow-sm">
          {currentIdx + 1} / {urls.length}장
        </div>
      )}

      {/* 좌측/우측 다음 사진 조절 액션 버튼 */}
      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/95 border border-zinc-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-50 select-none cursor-pointer active:scale-95 shadow-sm transition-all z-10"
            title="이전 사진"
          >
            <ChevronLeft className="w-4 h-4 text-black stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/95 border border-zinc-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-50 select-none cursor-pointer active:scale-95 shadow-sm transition-all z-10"
            title="다음 사진"
          >
            <ChevronRight className="w-4 h-4 text-black stroke-[3]" />
          </button>

          {/* 하단 점형 인디케이터 도트 슬라이더 */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-full z-10 shadow-sm">
            {urls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIdx === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                }`}
                title={`${idx + 1}번 사진으로 이동`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface JournalFeedProps {
  favoriteTeam: KBOTeam;
  records: AttendanceRecord[];
  onEditRecord: (record: AttendanceRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
}

export default function JournalFeed({ favoriteTeam, records, onEditRecord, onDeleteRecord }: JournalFeedProps) {
  // 경기 일자 직관 기록 내림차순 정렬부
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  // 점 세개 메뉴 목록 드롭다운 보기 활성화
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // 선택한 직관인증사진 목록 풀스크린 라이트박스 팝업 줌 보기 활성화
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxActiveIdx, setLightboxActiveIdx] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleOpenLightbox = (urls: string[], idx: number) => {
    setLightboxImages(urls);
    setLightboxActiveIdx(idx);
    setIsLightboxOpen(true);
  };

  if (records.length === 0) {
    return (
      <div id="journal-empty" className={LAYOUT.card + " text-center text-zinc-500 py-12 space-y-4"}>
        <span className="text-4xl animate-bounce inline-block">🎟️</span>
        <h4 className="text-sm font-black text-zinc-900">등록된 나의 직관 티켓 기록이 없습니다</h4>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-[270px] mx-auto font-semibold">
          달력에서 경기를 선택하거나 다이어리 탭에서 직직관 다이어리를 정성스레 작성해 보세요!
        </p>
      </div>
    );
  }

  return (
    <div id="journal-feed-list" className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-black text-zinc-900 flex items-center gap-1.5 uppercase font-display tracking-tight">
          <span>나의 직관 티켓북</span>
        </h3>
      </div>

      <div className="space-y-4">
        {sortedRecords.map(record => {
          const oppTeamObj = getTeamById(record.opponentTeamId);
          
          return (
            <div
              key={record.id}
              id={`ticket-feed-card-${record.id}`}
              className="relative bg-white rounded-3xl border border-[#e5e8eb] shadow-xs overflow-hidden flex flex-col select-none hover:shadow-md transition-all duration-200 !p-0"
            >
              
              {/* 상단 섹션: 경기 정보 카드 */}
              <div className="flex flex-col w-full min-h-[120px]">
                {/* Ticket main content */}
                <div className="flex-1 p-4 flex flex-col justify-between pr-3 relative">
                  
                  {/* 매치 인포 및 수정/삭제 콘트롤 버튼 인터페이스 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-normal text-[#4e5968] tracking-tight uppercase">
                        <span>{record.date}</span>
                      </span>
                      
                      <div className="relative">
                        <button
                          id={`btn-menu-ticket-${record.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === record.id ? null : record.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-zinc-100 text-[#8b95a1] hover:text-[#4e5968] transition cursor-pointer"
                          title="기록 옵션"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {activeMenuId === record.id && (
                          <>
                            {/* 영역 외부를 탭했을 때 드롭다운을 닫아주기 위한 불투명 백그라운드 오버레이 */}
                            <div 
                              className="fixed inset-0 z-30 cursor-default" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                              }}
                            />
                            {/* 옵션 메뉴 드롭다운 */}
                            <div className="absolute right-0 mt-1.5 w-24 bg-white border border-zinc-200 rounded-2xl shadow-lg py-1.5 z-40 text-xs font-semibold">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  onEditRecord(record);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>수정</span>
                              </button>
                              {onDeleteRecord && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    onDeleteRecord(record.id);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-1.5 cursor-pointer border-t border-zinc-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>삭제</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 대진 구단 정보 */}
                    <div className="flex flex-col gap-2 pt-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-lg font-black text-zinc-900 tracking-tight">
                          {record.isHome ? favoriteTeam.name : oppTeamObj.name}
                        </span>
                        <span className="text-sm font-extrabold text-[#8b95a1] lowercase px-1 select-none">
                          vs
                        </span>
                        <span className="text-lg font-black text-zinc-900 tracking-tight font-display">
                          {record.isHome ? oppTeamObj.name : favoriteTeam.name}
                        </span>
                      </div>

                      {/* 경기 최종 직관 스코어 수치 정보 */}
                      <div className="flex items-center mt-0.5 gap-2">
                        <span 
                          className={`text-xs font-black font-mono tracking-wider px-3 py-1 rounded-full shrink-0 border shadow-xs ${
                            record.result === 'lose'
                              ? 'border-zinc-200 text-[#8b95a1] bg-[#f2f4f6]'
                              : 'border-brand/20 text-brand bg-brand-light'
                          }`}
                        >
                          {record.ourScore} : {record.oppScore}
                        </span>
                        {record.result === 'win' && (
                          <span className="text-sm font-sans ml-1 flex items-center">
                            👼
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 직관을 관전한 야구장 위치 */}
                    <div className="text-xs text-zinc-500 mt-3 font-normal">
                      <span>{record.stadium}</span>
                    </div>

                    {/* 좌석 및 결제한 티켓 영수 가격 로우 */}
                    {(record.seats || record.ticketPrice !== undefined) && (
                      <div className="text-xs text-zinc-500 flex items-center gap-2 mt-1.5 font-normal">
                        {record.seats && (
                          <span>{record.seats}</span>
                        )}
                        {record.seats && record.ticketPrice !== undefined && (
                          <span className="text-zinc-300 font-sans mx-0.5">|</span>
                        )}
                        {record.ticketPrice !== undefined && (
                          <span>
                            {record.ticketPrice.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 가로형 티켓 찢는선 점선 구분선 효과 마크업 구조 */}
              <div className="relative w-full h-4 bg-transparent select-none flex items-center">
                {/* 왼쪽 펀치 구멍 */}
                <div className="absolute -left-2 w-4 h-4 bg-[#f2f4f6] rounded-full border border-[#e5e8eb] z-10" />
                {/* 찢은선 점선 점 구조 */}
                <div className="w-full border-t-2 border-dashed border-zinc-200" />
                {/* 오른쪽 펀치 구멍 */}
                <div className="absolute -right-2 w-4 h-4 bg-[#f2f4f6] rounded-full border border-[#e5e8eb] z-10" />
              </div>

              {/* 하단 섹션: 유저 첨부사진, 구장별 별미 일기 내용 레이아웃 통합 기재 기획 */}
              {(() => {
                const recordImages = (record.imageUrls && record.imageUrls.length > 0 
                  ? record.imageUrls 
                  : (record.imageUrl ? [record.imageUrl] : [])
                ).filter(Boolean);

                const hasImages = recordImages.length > 0;
                const hasFoods = (record.foods && record.foods.length > 0) || (record.foodImageUrls && record.foodImageUrls.length > 0);
                const hasDiary = !!record.diaryContent;

                if (!hasImages && !hasFoods && !hasDiary) return null;

                return (
                  <div className="w-full bg-zinc-50/50 px-4 pb-4 pt-2 flex flex-col gap-2 bg-zinc-50/60">
                    {hasImages && (
                      <DiaryPhotoCarousel 
                        urls={recordImages} 
                        onPhotoClick={(idx) => handleOpenLightbox(recordImages, idx)} 
                      />
                    )}

                    {hasFoods && (
                      <div className={`flex flex-col gap-2 ${hasImages ? '-mt-1.5' : ''}`}>
                        {record.foods && record.foods.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            {record.foods.slice(0, 4).map((food, idx) => {
                              const cleanFood = food.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
                              return (
                                <span
                                  key={`${record.id}-food-${idx}`}
                                  className="text-xs font-normal bg-brand-light text-brand px-2.5 py-1 rounded-lg leading-none flex items-center gap-0.5 select-none"
                                >
                                  {cleanFood}
                                </span>
                              );
                            })}
                            {record.foods.length > 4 && (
                              <span className="text-xs text-zinc-400 font-normal ml-1">+ {record.foods.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* 구장내 대표 먹거리 별미 인증 썸네일 수평 목록 */}
                        {record.foodImageUrls && record.foodImageUrls.length > 0 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 select-none scrollbar-none">
                            {record.foodImageUrls.map((imgUrl, i) => (
                              <div 
                                key={`${record.id}-food-proof-${i}`}
                                className="w-10 h-10 rounded-lg border border-zinc-200 overflow-hidden shrink-0 bg-zinc-100 relative shadow-xs"
                              >
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={imgUrl} 
                                  alt="먹거리"
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {hasDiary && (
                      <div className="text-[11.5px] text-zinc-650 leading-relaxed mt-1.5">
                        <blockquote className="italic border-l-2 border-zinc-400 pl-3 font-medium text-zinc-850 max-w-full overflow-hidden text-ellipsis">
                          "{record.diaryContent}"
                        </blockquote>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* 확대 이미지 보기 원본 라이트박스 팝업 전체화면 모달 */}
      {isLightboxOpen && lightboxImages.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex flex-col justify-between items-center p-4 select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* 상단 띠 헤더 내비게이션 인터페이스 구조 */}
          <div className="w-full flex justify-between items-center text-white px-2 py-3 z-[10000]">
            <span className="text-[10px] uppercase font-black tracking-widest bg-zinc-800 text-zinc-350 px-3 py-1.5 rounded-lg border border-zinc-700/50">
              📸 직관 앨범 원본 보기
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="bg-white text-zinc-900 border border-zinc-250 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 transition cursor-pointer active:scale-95 shadow-sm"
              title="닫기"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>닫기</span>
            </button>
          </div>

          {/* 선택한 특정 현재 사진의 디스플레이 프레임(슬라이더) */}
          <div className="relative flex-1 w-full max-w-xl flex items-center justify-center p-4">
            
            {/* 이미지 캔버스 디스플레이 */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl max-h-[65vh] aspect-square flex items-center justify-center w-full">
              <img 
                referrerPolicy="no-referrer"
                src={lightboxImages[lightboxActiveIdx] || lightboxImages[0]} 
                alt="확대 이미지" 
                className="w-full h-full object-contain"
              />
            </div>

            {/* 라이트박스 이전/다음 좌우 내비게이션 화살표 */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxActiveIdx((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
                  }}
                  className="absolute left-1 sm:-left-4 bg-white border border-zinc-200 text-zinc-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-50 cursor-pointer active:scale-90 shadow-md transition-all z-20"
                  title="이전 사진"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[3]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxActiveIdx((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-1 sm:-right-4 bg-white border border-zinc-200 text-zinc-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-50 cursor-pointer active:scale-90 shadow-md transition-all z-20"
                  title="다음 사진"
                >
                  <ChevronRight className="w-5 h-5 stroke-[3]" />
                </button>
              </>
            )}

          </div>

          {/* 라이트박스 하단 슬라이드 인덱스 표출 페이지네이션 */}
          <div className="bg-zinc-800 text-zinc-350 px-4 py-1.5 rounded-full mb-6 text-xs font-mono font-black border border-zinc-700 shadow-inner">
            {lightboxActiveIdx + 1} / {lightboxImages.length}장
          </div>

        </div>
      )}
    </div>
  );
}
