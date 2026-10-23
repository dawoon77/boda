import React, { useState, useEffect } from 'react';
import { Match, KBOTeam, AttendanceRecord } from '../types';
import { KBO_TEAMS, FAMOUS_BALLPARK_FOODS, MATCHES_DATA } from '../data/kboData';
import { Calendar, Check, Image as ImageIcon, ChevronLeft, ChevronRight, X, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface AttendanceFormProps {
  favoriteTeam: KBOTeam;
  selectedMatch: Match | null; // Null if manual custom match is being added
  existingRecord?: AttendanceRecord; // If editing
  initialMode?: 'view' | 'edit';
  onSave: (record: AttendanceRecord) => void;
  onDelete?: (recordId: string) => void;
  onClose: () => void;
}



export default function AttendanceForm({
  favoriteTeam,
  selectedMatch,
  existingRecord,
  initialMode,
  onSave,
  onDelete,
  onClose
}: AttendanceFormProps) {
  // 초기 상태 계산 (수정 또는 신규 작성 시 원본 상태 스냅샷)
  const initialValues = React.useMemo(() => {
    if (existingRecord) {
      const origImgs = existingRecord.imageUrls || (existingRecord.imageUrl ? [existingRecord.imageUrl] : []);
      const origFoodImgs = existingRecord.foodImageUrls || [];
      return {
        date: existingRecord.date || '',
        opponentTeamId: existingRecord.opponentTeamId || '',
        isHome: existingRecord.isHome ?? true,
        stadium: existingRecord.stadium || '',
        ourScore: existingRecord.ourScore ?? 0,
        oppScore: existingRecord.oppScore ?? 0,
        seats: existingRecord.seats || '',
        ticketPrice: ((existingRecord.ticketPrice !== undefined && existingRecord.ticketPrice !== null) ? existingRecord.ticketPrice : '') as (number | ''),
        imageUrl: existingRecord.imageUrl || '',
        imageUrls: origImgs,
        foodImageUrls: origFoodImgs,
        diaryContent: existingRecord.diaryContent || '',
        selectedFoods: existingRecord.foods || [],
      };
    } else if (selectedMatch) {
      const isHomeMatch = selectedMatch.homeTeamId === favoriteTeam.id;
      const oppId = isHomeMatch ? selectedMatch.awayTeamId : selectedMatch.homeTeamId;
      const oppTeam = KBO_TEAMS.find(t => t.id === oppId);
      return {
        date: selectedMatch.date || '',
        opponentTeamId: oppId,
        isHome: isHomeMatch,
        stadium: isHomeMatch ? favoriteTeam.stadium : (oppTeam ? oppTeam.stadium : favoriteTeam.stadium),
        ourScore: isHomeMatch ? (selectedMatch.homeScore || 0) : (selectedMatch.awayScore || 0),
        oppScore: isHomeMatch ? (selectedMatch.awayScore || 0) : (selectedMatch.homeScore || 0),
        seats: '',
        ticketPrice: '' as (number | ''),
        imageUrl: '',
        imageUrls: [],
        foodImageUrls: [],
        diaryContent: '',
        selectedFoods: [],
      };
    } else {
      return {
        date: '2026-05-26',
        opponentTeamId: KBO_TEAMS.find(t => t.id !== favoriteTeam.id)?.id || 'samsung',
        isHome: true,
        stadium: favoriteTeam.stadium,
        ourScore: 0,
        oppScore: 0,
        seats: '',
        ticketPrice: '' as (number | ''),
        imageUrl: '',
        imageUrls: [],
        foodImageUrls: [],
        diaryContent: '',
        selectedFoods: [],
      };
    }
  }, [existingRecord, selectedMatch, favoriteTeam]);

  // 로컬 컴포넌트 상태 정의 (초기값을 initialValues로 직접 동기화)
  const [date, setDate] = useState(initialValues.date);
  const [opponentTeamId, setOpponentTeamId] = useState(initialValues.opponentTeamId);
  const [isHome, setIsHome] = useState(initialValues.isHome);
  const [stadium, setStadium] = useState(initialValues.stadium);
  const [ourScore, setOurScore] = useState<number>(initialValues.ourScore);
  const [oppScore, setOppScore] = useState<number>(initialValues.oppScore);
  const [seats, setSeats] = useState(initialValues.seats);
  const [ticketPrice, setTicketPrice] = useState<number | ''>(initialValues.ticketPrice);
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl);
  const [imageUrls, setImageUrls] = useState<string[]>(initialValues.imageUrls);
  const [foodImageUrls, setFoodImageUrls] = useState<string[]>(initialValues.foodImageUrls);
  const [diaryContent, setDiaryContent] = useState(initialValues.diaryContent);
  const [selectedFoods, setSelectedFoods] = useState<string[]>(initialValues.selectedFoods);
  const [customFood, setCustomFood] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(() => {
    if (initialMode) return initialMode === 'edit';
    return !existingRecord;
  });
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [lightboxPhotoIdx, setLightboxPhotoIdx] = useState(0);
  const [lightboxDragX, setLightboxDragX] = useState(0);
  const [lightboxIsDragging, setLightboxIsDragging] = useState(false);
  const dragStartRef = React.useRef<number | null>(null);

  // 상세보기 모드 인라인 1:1 사진 드래그/스와이프 상태
  const [detailDragX, setDetailDragX] = useState(0);
  const [detailIsDragging, setDetailIsDragging] = useState(false);
  const detailDragStartRef = React.useRef<number | null>(null);
  const detailDragMovedRef = React.useRef<boolean>(false);

  // 상세보기 모드 스크롤 감지 상태 (아래로 드래그/스크롤 시 상단바 등장)
  const [isScrolled, setIsScrolled] = useState(false);

  const handleOverlayScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 35);
  };

  useEffect(() => {
    if (initialMode) {
      setIsEditing(initialMode === 'edit');
    }
  }, [initialMode]);

  // 경기 일자 선택 달력 팝업 모달 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => {
    if (initialValues.date) {
      const y = parseInt(initialValues.date.split('-')[0], 10);
      if (!isNaN(y)) return y;
    }
    return 2026;
  });
  const [pickerMonth, setPickerMonth] = useState(() => {
    if (initialValues.date) {
      const m = parseInt(initialValues.date.split('-')[1], 10);
      if (!isNaN(m)) return m;
    }
    return 5;
  });

  // 선택된 date에 맞춰 캘린더 피커의 연/월 동기화
  useEffect(() => {
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(y)) setPickerYear(y);
        if (!isNaN(m)) setPickerMonth(m);
      }
    }
  }, [date, isDatePickerOpen]);

  // 완료된 특정 연월일 경기를 유저가 직접 선택했을 때 관련 수치값을 오토-세팅
  useEffect(() => {
    // 기존 레코드 수정 중이고 날짜가 원래 날짜 그대로라면 자동 매칭으로 덮어쓰지 않음
    if (existingRecord && date === initialValues.date) {
      return;
    }

    if (date) {
      // Find a matching completed (or scheduled) game for that date involving favoriteTeam
      const foundMatch = MATCHES_DATA.find(
        m => m.date === date && (m.homeTeamId === favoriteTeam.id || m.awayTeamId === favoriteTeam.id)
      );

      if (foundMatch && foundMatch.status === 'completed') {
        const favoriteIsHome = foundMatch.homeTeamId === favoriteTeam.id;
        setIsHome(favoriteIsHome);
        
        const oppId = favoriteIsHome ? foundMatch.awayTeamId : foundMatch.homeTeamId;
        setOpponentTeamId(oppId);
        
        // Auto set score
        setOurScore(favoriteIsHome ? (foundMatch.homeScore ?? 0) : (foundMatch.awayScore ?? 0));
        setOppScore(favoriteIsHome ? (foundMatch.awayScore ?? 0) : (foundMatch.homeScore ?? 0));
        
        // Auto set stadium
        const oppTeam = KBO_TEAMS.find(t => t.id === oppId);
        const autoStadium = favoriteIsHome ? favoriteTeam.stadium : (oppTeam ? oppTeam.stadium : favoriteTeam.stadium);
        setStadium(autoStadium);
      } else if (!existingRecord && foundMatch) {
        const favoriteIsHome = foundMatch.homeTeamId === favoriteTeam.id;
        setIsHome(favoriteIsHome);
        
        const oppId = favoriteIsHome ? foundMatch.awayTeamId : foundMatch.homeTeamId;
        setOpponentTeamId(oppId);
        
        const oppTeam = KBO_TEAMS.find(t => t.id === oppId);
        const autoStadium = favoriteIsHome ? favoriteTeam.stadium : (oppTeam ? oppTeam.stadium : favoriteTeam.stadium);
        setStadium(autoStadium);
      }
    }
  }, [date, favoriteTeam, existingRecord, initialValues.date]);

  // 경기 스코어 점수 변동 조절 핸들러 (종료된 경기일 때는 수정 불가)
  const handleScoreChange = (type: 'our' | 'opp', val: number) => {
    if (isLocked) return;
    if (type === 'our') setOurScore(val);
    else setOppScore(val);
  };

  // 득점 결과에 따른 직관 경기 최종 승패 여부 계산
  const getSimulatedResult = (): 'win' | 'lose' | 'draw' => {
    if (ourScore > oppScore) return 'win';
    if (ourScore < oppScore) return 'lose';
    return 'draw';
  };

  // 사용자가 직접 입력한 먹거리 품명을 현재 선택 목록에 수동 주입
  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFood.trim() && !selectedFoods.includes(customFood.trim())) {
      setSelectedFoods([...selectedFoods, customFood.trim()]);
      setCustomFood('');
    }
  };

  // 구장별 대표 먹거리 품목 태그 선택/해제 토글러
  const handleToggleFood = (foodName: string) => {
    if (selectedFoods.includes(foodName)) {
      setSelectedFoods(selectedFoods.filter(f => f !== foodName));
    } else {
      setSelectedFoods([...selectedFoods, foodName]);
    }
  };

  // 폼 수정/작성 내용 변경 여부 확인 (수정한 내용이 있는지 감지)
  const isFormDirty = (): boolean => {
    if (existingRecord) {
      if (date !== initialValues.date) return true;
      if (opponentTeamId !== initialValues.opponentTeamId) return true;
      if (isHome !== initialValues.isHome) return true;
      if (stadium !== initialValues.stadium) return true;
      if (ourScore !== initialValues.ourScore) return true;
      if (oppScore !== initialValues.oppScore) return true;
      if (seats !== initialValues.seats) return true;
      if (ticketPrice !== initialValues.ticketPrice) return true;
      if (diaryContent !== initialValues.diaryContent) return true;
      if (JSON.stringify(imageUrls) !== JSON.stringify(initialValues.imageUrls)) return true;
      if (JSON.stringify([...selectedFoods].sort()) !== JSON.stringify([...initialValues.selectedFoods].sort())) return true;
      return false;
    } else {
      if (seats.trim() !== '') return true;
      if (diaryContent.trim() !== '') return true;
      if (imageUrls.length > 0) return true;
      if (selectedFoods.length > 0) return true;
      if (ticketPrice !== '' && ticketPrice !== 0) return true;
      return false;
    }
  };

  // 상세보기 모드 인라인 사진 터치/드래그 스와이프 핸들러 (1:1 비율, 화살표 없이 드래그 좌우 이동)
  const handleDetailTouchStart = (e: React.TouchEvent) => {
    if (imageUrls.length <= 1) return;
    detailDragStartRef.current = e.touches[0].clientX;
    detailDragMovedRef.current = false;
    setDetailIsDragging(true);
    setDetailDragX(0);
  };

  const handleDetailTouchMove = (e: React.TouchEvent) => {
    if (!detailIsDragging || detailDragStartRef.current === null) return;
    const currentX = e.touches[0].clientX;
    let diff = currentX - detailDragStartRef.current;
    if (Math.abs(diff) > 5) {
      detailDragMovedRef.current = true;
    }
    if ((activePhotoIdx === 0 && diff > 0) || (activePhotoIdx === imageUrls.length - 1 && diff < 0)) {
      diff *= 0.3;
    }
    setDetailDragX(diff);
  };

  const handleDetailTouchEnd = () => {
    if (!detailIsDragging || detailDragStartRef.current === null) return;
    const threshold = 40;
    if (detailDragX < -threshold && activePhotoIdx < imageUrls.length - 1) {
      setActivePhotoIdx(prev => prev + 1);
    } else if (detailDragX > threshold && activePhotoIdx > 0) {
      setActivePhotoIdx(prev => prev - 1);
    }
    setDetailIsDragging(false);
    setDetailDragX(0);
    detailDragStartRef.current = null;
  };

  const handleDetailMouseDown = (e: React.MouseEvent) => {
    if (imageUrls.length <= 1) return;
    detailDragStartRef.current = e.clientX;
    detailDragMovedRef.current = false;
    setDetailIsDragging(true);
    setDetailDragX(0);
  };

  const handleDetailMouseMove = (e: React.MouseEvent) => {
    if (!detailIsDragging || detailDragStartRef.current === null) return;
    const currentX = e.clientX;
    let diff = currentX - detailDragStartRef.current;
    if (Math.abs(diff) > 5) {
      detailDragMovedRef.current = true;
    }
    if ((activePhotoIdx === 0 && diff > 0) || (activePhotoIdx === imageUrls.length - 1 && diff < 0)) {
      diff *= 0.3;
    }
    setDetailDragX(diff);
  };

  const handleDetailMouseUp = () => {
    if (!detailIsDragging || detailDragStartRef.current === null) return;
    const threshold = 40;
    if (detailDragX < -threshold && activePhotoIdx < imageUrls.length - 1) {
      setActivePhotoIdx(prev => prev + 1);
    } else if (detailDragX > threshold && activePhotoIdx > 0) {
      setActivePhotoIdx(prev => prev - 1);
    }
    setDetailIsDragging(false);
    setDetailDragX(0);
    detailDragStartRef.current = null;
  };

  const handleDetailPhotoClick = (idx: number) => {
    if (detailDragMovedRef.current) return;
    setLightboxPhotoIdx(idx);
    setIsPhotoLightboxOpen(true);
  };

  // 라이트박스 터치/드래그 스와이프 핸들러 (당근마켓 스타일 좌우 이동)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (imageUrls.length <= 1) return;
    dragStartRef.current = e.touches[0].clientX;
    setLightboxIsDragging(true);
    setLightboxDragX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!lightboxIsDragging || dragStartRef.current === null) return;
    const currentX = e.touches[0].clientX;
    let diff = currentX - dragStartRef.current;
    if ((lightboxPhotoIdx === 0 && diff > 0) || (lightboxPhotoIdx === imageUrls.length - 1 && diff < 0)) {
      diff *= 0.3;
    }
    setLightboxDragX(diff);
  };

  const handleTouchEnd = () => {
    if (!lightboxIsDragging || dragStartRef.current === null) return;
    const threshold = 40;
    if (lightboxDragX < -threshold && lightboxPhotoIdx < imageUrls.length - 1) {
      setLightboxPhotoIdx(prev => prev + 1);
    } else if (lightboxDragX > threshold && lightboxPhotoIdx > 0) {
      setLightboxPhotoIdx(prev => prev - 1);
    }
    setLightboxIsDragging(false);
    setLightboxDragX(0);
    dragStartRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (imageUrls.length <= 1) return;
    dragStartRef.current = e.clientX;
    setLightboxIsDragging(true);
    setLightboxDragX(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!lightboxIsDragging || dragStartRef.current === null) return;
    const currentX = e.clientX;
    let diff = currentX - dragStartRef.current;
    if ((lightboxPhotoIdx === 0 && diff > 0) || (lightboxPhotoIdx === imageUrls.length - 1 && diff < 0)) {
      diff *= 0.3;
    }
    setLightboxDragX(diff);
  };

  const handleMouseUp = () => {
    if (!lightboxIsDragging || dragStartRef.current === null) return;
    const threshold = 40;
    if (lightboxDragX < -threshold && lightboxPhotoIdx < imageUrls.length - 1) {
      setLightboxPhotoIdx(prev => prev + 1);
    } else if (lightboxDragX > threshold && lightboxPhotoIdx > 0) {
      setLightboxPhotoIdx(prev => prev - 1);
    }
    setLightboxIsDragging(false);
    setLightboxDragX(0);
    dragStartRef.current = null;
  };

  // 원본 값으로 폼 상태 롤백
  const resetToInitialValues = () => {
    setDate(initialValues.date);
    setOpponentTeamId(initialValues.opponentTeamId);
    setIsHome(initialValues.isHome);
    setStadium(initialValues.stadium);
    setOurScore(initialValues.ourScore);
    setOppScore(initialValues.oppScore);
    setSeats(initialValues.seats);
    setTicketPrice(initialValues.ticketPrice);
    setImageUrl(initialValues.imageUrl);
    setImageUrls(initialValues.imageUrls);
    setFoodImageUrls(initialValues.foodImageUrls);
    setDiaryContent(initialValues.diaryContent);
    setSelectedFoods(initialValues.selectedFoods);
    setCustomFood('');
    setValidationError('');
  };

  // 상단 닫기/뒤로가기 버튼 클릭 핸들러
  const handleCloseClick = () => {
    if (isEditing) {
      if (isFormDirty()) {
        setShowExitConfirm(true);
      } else {
        if (initialMode === 'view') {
          resetToInitialValues();
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    } else {
      onClose();
    }
  };

  // 수정 모드 취소 핸들러
  const handleCancelEdit = () => {
    if (isFormDirty()) {
      setShowExitConfirm(true);
    } else {
      resetToInitialValues();
      if (initialMode === 'view') {
        setIsEditing(false);
      } else {
        onClose();
      }
    }
  };

  // 직관 기록 제출 저장을 위한 폼 서브밋 핸들러
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stadium.trim()) {
      setValidationError('경기가 치러진 야구장을 입력해 주세요.');
      return;
    }
    if (!seats.trim()) {
      setValidationError('직관하신 응원 구역이나 좌석명을 입력해 주세요.');
      return;
    }

    // 종료된 경기인 경우 공식 경기 정보(홈/원정, 상대팀, 스코어, 구장)를 강제로 보장
    const foundCompletedMatch = MATCHES_DATA.find(
      m => m.date === date && 
      (m.homeTeamId === favoriteTeam.id || m.awayTeamId === favoriteTeam.id) &&
      m.status === 'completed'
    );

    const finalIsHome = foundCompletedMatch 
      ? (foundCompletedMatch.homeTeamId === favoriteTeam.id) 
      : isHome;
    const finalOppId = foundCompletedMatch 
      ? (finalIsHome ? foundCompletedMatch.awayTeamId : foundCompletedMatch.homeTeamId)
      : opponentTeamId;
    const finalOurScore = foundCompletedMatch 
      ? (finalIsHome ? (foundCompletedMatch.homeScore ?? 0) : (foundCompletedMatch.awayScore ?? 0))
      : ourScore;
    const finalOppScore = foundCompletedMatch
      ? (finalIsHome ? (foundCompletedMatch.awayScore ?? 0) : (foundCompletedMatch.homeScore ?? 0))
      : oppScore;
    const oppTeam = KBO_TEAMS.find(t => t.id === finalOppId);
    const finalStadium = foundCompletedMatch
      ? (finalIsHome ? favoriteTeam.stadium : (oppTeam ? oppTeam.stadium : favoriteTeam.stadium))
      : stadium;

    const finalResult: 'win' | 'lose' | 'draw' =
      finalOurScore > finalOppScore ? 'win' : finalOurScore < finalOppScore ? 'lose' : 'draw';

    const payload: AttendanceRecord = {
      id: existingRecord?.id || selectedMatch?.id || `custom-record-${Date.now()}`,
      matchId: foundCompletedMatch?.id || selectedMatch?.id,
      date,
      opponentTeamId: finalOppId,
      isHome: finalIsHome,
      stadium: finalStadium,
      result: finalResult,
      ourScore: finalOurScore,
      oppScore: finalOppScore,
      seats,
      ticketPrice: ticketPrice === '' ? undefined : Number(ticketPrice),
      diaryContent,
      foods: selectedFoods,
      satisfactionRating: existingRecord?.satisfactionRating || 5,
      foodsRating: existingRecord?.foodsRating || 5,
      cheerRating: existingRecord?.cheerRating || 5,
      createdTime: existingRecord?.createdTime || new Date().toISOString(),
      imageUrl: imageUrls[0] || imageUrl || '',
      imageUrls: imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []),
      foodImageUrls: foodImageUrls
    };

    onSave(payload);
  };

  const oppTeamObj = KBO_TEAMS.find(t => t.id === opponentTeamId) || KBO_TEAMS[0];
  const homeOrAwayFamousFoods = FAMOUS_BALLPARK_FOODS.filter(
    food => food.stadiumId === (isHome ? favoriteTeam.id : oppTeamObj.id)
  );

  const isEndedGame = MATCHES_DATA.some(
    m => m.date === date && 
    (m.homeTeamId === favoriteTeam.id || m.awayTeamId === favoriteTeam.id) && 
    m.status === 'completed'
  ) || (selectedMatch?.status === 'completed' && selectedMatch.date === date);

  const isLocked = isEndedGame;

  return (
    <div 
      id="attendance-form-overlay" 
      onScroll={handleOverlayScroll}
      className="absolute inset-0 bg-white z-40 flex flex-col h-full overflow-y-auto text-[#191f28] sm:rounded-[36px]"
    >
      
      {(() => {
        const hasDetailPhoto = !isEditing && imageUrls.length > 0;

        if (hasDetailPhoto) {
          return (
            <>
              {/* 플로팅 헤더 바 (상단 아이콘 주위 원도형 제거, 아래로 드래그/스크롤 시 상단바 등장) */}
              <div 
                id="form-header-bar-floating" 
                className={`sticky top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 -mb-14 transition-all duration-200 ${
                  isScrolled 
                    ? 'bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-2xs pointer-events-auto' 
                    : 'bg-transparent border-transparent pointer-events-none'
                }`}
              >
                <button
                  id="btn-close-form"
                  onClick={handleCloseClick}
                  className={`p-2 transition cursor-pointer active:scale-90 pointer-events-auto ${
                    isScrolled 
                      ? 'text-[#191f28] hover:text-[#4e5968]' 
                      : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:opacity-80'
                  }`}
                  aria-label="뒤로가기"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>

                <div className="flex-1" />

                <div className="relative pointer-events-auto">
                  <button
                    id="btn-detail-menu"
                    type="button"
                    onClick={() => setIsMenuOpen(prev => !prev)}
                    className={`p-2 transition cursor-pointer active:scale-90 ${
                      isScrolled 
                        ? 'text-[#191f28] hover:text-[#4e5968]' 
                        : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:opacity-80'
                    }`}
                    title="옵션 메뉴"
                    aria-label="옵션 메뉴"
                  >
                    <MoreVertical className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-28 bg-white border border-[#e5e8eb] rounded-2xl shadow-xl py-1.5 z-50 text-xs font-semibold animate-scaleUp select-none">
                        <button
                          id="btn-menu-edit"
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsEditing(true);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 flex items-center gap-2 cursor-pointer transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>수정</span>
                        </button>
                        {onDelete && (
                          <button
                            id="btn-menu-delete"
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              onDelete(existingRecord?.id || '');
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-[#f04452] flex items-center gap-2 cursor-pointer transition border-t border-zinc-100"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#f04452]" />
                            <span>삭제</span>
                          </button>
                        )}
                        <button
                          id="btn-menu-close"
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onClose();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 text-zinc-650 hover:text-zinc-900 flex items-center gap-2 cursor-pointer transition border-t border-zinc-100"
                        >
                          <X className="w-3.5 h-3.5 text-zinc-500" />
                          <span>닫기</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* [상세보기 모드 전용] 상단 처음부터 시작하는 1:1 사진 영역 (좌우 여백 없음, 화살표 없음, 3/3 표시 제거, 드래그 좌우 이동) */}
              <div className="w-full aspect-square select-none bg-zinc-950 overflow-hidden relative shrink-0">
                {imageUrls.length === 1 ? (
                  <div 
                    onClick={() => handleDetailPhotoClick(0)}
                    className="w-full h-full overflow-hidden bg-zinc-900 cursor-zoom-in group"
                    title="사진 전체 보기"
                  >
                    <img 
                      referrerPolicy="no-referrer"
                      src={imageUrls[0]} 
                      alt="직관 사진" 
                      className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300" 
                    />
                  </div>
                ) : (
                  <div 
                    className="w-full h-full overflow-hidden bg-zinc-900 relative cursor-grab active:cursor-grabbing touch-pan-y"
                    onTouchStart={handleDetailTouchStart}
                    onTouchMove={handleDetailTouchMove}
                    onTouchEnd={handleDetailTouchEnd}
                    onMouseDown={handleDetailMouseDown}
                    onMouseMove={handleDetailMouseMove}
                    onMouseUp={handleDetailMouseUp}
                    onMouseLeave={handleDetailMouseUp}
                  >
                    <div 
                      className="flex h-full w-full"
                      style={{
                        transform: `translateX(calc(-${activePhotoIdx * 100}% + ${detailDragX}px))`,
                        transition: detailIsDragging ? 'none' : 'transform 260ms cubic-bezier(0.25, 1, 0.5, 1)',
                      }}
                    >
                      {imageUrls.map((url, idx) => (
                        <div 
                          key={`detail-photo-${idx}`}
                          className="w-full h-full flex-shrink-0 cursor-zoom-in"
                          onClick={() => handleDetailPhotoClick(idx)}
                        >
                          <img 
                            referrerPolicy="no-referrer"
                            src={url} 
                            alt={`직관 사진 ${idx + 1}`} 
                            className="w-full h-full object-cover select-none pointer-events-none" 
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>

                    {/* 하단 점(dot) 인디케이터 (3/3 배지 제거됨) */}
                    <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
                      {imageUrls.map((_, i) => (
                        <div
                          key={`detail-dot-${i}`}
                          className={`h-1.5 rounded-full transition-all duration-200 ${
                            i === activePhotoIdx 
                              ? 'w-4 bg-white shadow-xs' 
                              : 'w-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        }

        return (
          /* 일반 헤더 바 (수정 모드 또는 사진이 없는 경우) */
          <div id="form-header-bar" className="grid grid-cols-3 items-center px-6 py-4 border-b border-zinc-100 shrink-0 bg-white/90 backdrop-blur-md z-10 sticky top-0">
            <div className="flex justify-start">
              <button
                id="btn-close-form"
                onClick={handleCloseClick}
                className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-zinc-100 p-1 rounded-full transition cursor-pointer"
                aria-label={isEditing ? "닫기" : "뒤로가기"}
              >
                {isEditing ? (
                  <X className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                )}
              </button>
            </div>
            
            <div className="flex justify-center">
              {isEditing && (
                <h2 id="form-header-title" className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">
                  {existingRecord ? '직관기록 수정' : '직관기록 작성'}
                </h2>
              )}
            </div>
            
            <div className="flex justify-end relative">
              {existingRecord && !isEditing && (
                <div className="relative">
                  <button
                    id="btn-detail-menu"
                    type="button"
                    onClick={() => setIsMenuOpen(prev => !prev)}
                    className="p-1.5 rounded-full hover:bg-zinc-100 text-[#8b95a1] hover:text-[#4e5968] transition cursor-pointer"
                    title="옵션 메뉴"
                    aria-label="옵션 메뉴"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-1.5 w-28 bg-white border border-[#e5e8eb] rounded-2xl shadow-xl py-1.5 z-50 text-xs font-semibold animate-scaleUp select-none">
                        <button
                          id="btn-menu-edit"
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsEditing(true);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 flex items-center gap-2 cursor-pointer transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>수정</span>
                        </button>
                        {onDelete && (
                          <button
                            id="btn-menu-delete"
                            type="button"
                            onClick={() => {
                              setIsMenuOpen(false);
                              onDelete(existingRecord.id);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-[#f04452] flex items-center gap-2 cursor-pointer transition border-t border-zinc-100"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#f04452]" />
                            <span>삭제</span>
                          </button>
                        )}
                        <button
                          id="btn-menu-close"
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onClose();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 text-zinc-650 hover:text-zinc-900 flex items-center gap-2 cursor-pointer transition border-t border-zinc-100"
                        >
                          <X className="w-3.5 h-3.5 text-zinc-500" />
                          <span>닫기</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
      
      {/* 메인 폼 필드 리스트 스크롤 영역 */}
      <div id="form-body-scrollable" className="flex-1 px-5 pt-4 pb-8 space-y-4">

        {/* Form Container */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-zinc-850">
          
          {/* Combined Card: 경기 일정, 상대팀, 스코어, 구장 및 좌석 정보 통합 */}
          <div className="pt-2 pb-0 space-y-4">

            {/* 1. 경기 일정 및 상대 구단 */}
            <div className="space-y-4">
              {/* 경기 일자 (작성 내용 확인 시 텍스트로 표시) */}
              <div className="space-y-1">
                <label htmlFor="btn-open-date-picker" className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                  <span>경기 일자</span>
                </label>
                {!isEditing ? (
                  <div className={`${LAYOUT.input} !border-zinc-200 bg-[#f8f9fa] text-zinc-700 flex items-center font-medium text-xs select-none h-11`}>
                    <span>
                      {(() => {
                        if (!date) return '-';
                        const parts = date.split('-');
                        if (parts.length === 3) {
                          return `${parts[0]}년 ${Number(parts[1])}월 ${Number(parts[2])}일`;
                        }
                        return date;
                      })()}
                    </span>
                  </div>
                ) : (
                  <button
                    id="btn-open-date-picker"
                    type="button"
                    onClick={() => setIsDatePickerOpen(true)}
                    className={`${LAYOUT.input} flex items-center justify-between bg-white !border-[#e5e8eb] hover:border-[#3182f6] hover:bg-blue-50/20 active:scale-[0.99] transition-all h-11 w-full !px-3 cursor-pointer group text-left`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-4 h-4 text-brand shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-[#191f28] font-bold font-sans text-[12.5px] truncate">
                        {(() => {
                          if (!date) return '날짜 선택';
                          const parts = date.split('-');
                          if (parts.length === 3) {
                            return `${parts[0]}년 ${Number(parts[1])}월 ${Number(parts[2])}일`;
                          }
                          return date;
                        })()}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#3182f6] font-bold shrink-0 bg-blue-50 px-2 py-0.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                      변경
                    </span>
                  </button>
                )}
                <input
                  id="form-date-input"
                  type="hidden"
                  value={date}
                  readOnly
                />
              </div>

              {/* 홈 / 원정 구분 */}
              <div className="space-y-1">
                <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>홈 / 원정 구분</label>
                <div className="grid grid-cols-2 gap-1 bg-[#f2f4f6] p-1 rounded-2xl h-11 items-center">
                  <button
                    id="btn-form-home"
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      setIsHome(true);
                      setStadium(favoriteTeam.stadium);
                    }}
                    className={`h-8 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                      isLocked ? 'opacity-90 cursor-default' : 'cursor-pointer'
                    } ${
                      isHome ? 'bg-brand text-white shadow-xs' : 'text-[#8b95a1] hover:text-[#4e5968]'
                    }`}
                  >
                    홈경기
                  </button>
                  <button
                    id="btn-form-away"
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      setIsHome(false);
                      const opp = KBO_TEAMS.find(t => t.id === opponentTeamId);
                      setStadium(opp ? opp.stadium : '');
                    }}
                    className={`h-8 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
                      isLocked ? 'opacity-90 cursor-default' : 'cursor-pointer'
                    } ${
                      !isHome ? 'bg-brand text-white shadow-xs' : 'text-[#8b95a1] hover:text-[#4e5968]'
                    }`}
                  >
                    원정경기
                  </button>
                </div>
              </div>

              {/* 상대 구단 선택 */}
              <div className="space-y-1 border-b-0 pb-0 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <label className={`${TYPOGRAPHY.bodyBold} block`}>상대 팀 구단</label>
                </div>
                {isLocked ? (
                  <div className={`${LAYOUT.input} !border-zinc-200 bg-[#f8f9fa] text-zinc-700 flex items-center gap-2 font-medium text-xs select-none`}>
                    <span>{oppTeamObj.logoEmoji === 'ヒーロー' ? '🦸' : oppTeamObj.logoEmoji === '쌍둥이' ? '⚾' : oppTeamObj.logoEmoji}</span>
                    <span>{oppTeamObj.name}</span>
                  </div>
                ) : (
                  <div id="opponent-select-scroll" className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    {KBO_TEAMS.filter(t => t.id !== favoriteTeam.id).map(t => {
                      const isSelected = opponentTeamId === t.id;
                      return (
                        <button
                          id={`form-opp-${t.id}`}
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setOpponentTeamId(t.id);
                            if (!isHome) {
                              setStadium(t.stadium);
                            }
                          }}
                          className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-transparent text-white shadow-sm font-bold' 
                              : 'border-zinc-200 bg-[#f2f4f6] text-[#4e5968] hover:text-[#191f28] hover:bg-[#ebedf0]/70'
                          }`}
                          style={isSelected ? { backgroundColor: t.primaryColor } : {}}
                        >
                          <span>{t.logoEmoji === 'ヒーロー' ? '🦸' : t.logoEmoji === '쌍둥이' ? '⚾' : t.logoEmoji}</span>
                          <span>{t.shortName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-dashed border-zinc-100" />

            {/* 2. 최종 경기 결과 기록 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className={`${TYPOGRAPHY.bodyBold} block`}>경기 스코어</span>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
                {/* 좌측: 우리 구단 직관 점수 */}
                <div className="flex flex-col items-center space-y-1.5">
                  <span className="text-xs font-semibold text-[#191f28]">{favoriteTeam.shortName} (마이팀)</span>
                  <div className="flex items-center gap-3">
                    {!isLocked && (
                      <button
                        id="btn-our-score-minus"
                        type="button"
                        onClick={() => handleScoreChange('our', Math.max(0, ourScore - 1))}
                        className={BUTTONS.roundAction}
                      >
                        -
                      </button>
                    )}
                    <span className="text-3xl font-bold font-mono w-10 text-center text-[#191f28]">{ourScore}</span>
                    {!isLocked && (
                      <button
                        id="btn-our-score-plus"
                        type="button"
                        onClick={() => handleScoreChange('our', ourScore + 1)}
                        className={BUTTONS.roundAction}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* 우측: 상대 구단 경기 스코어 */}
                <div className="flex flex-col items-center space-y-1.5 border-l border-zinc-200">
                  <span className="text-xs font-semibold text-[#8b95a1]">{oppTeamObj.shortName} (상대팀)</span>
                  <div className="flex items-center gap-3">
                    {!isLocked && (
                      <button
                        id="btn-opp-score-minus"
                        type="button"
                        onClick={() => handleScoreChange('opp', Math.max(0, oppScore - 1))}
                        className={BUTTONS.roundAction}
                      >
                        -
                      </button>
                    )}
                    <span className="text-3xl font-bold font-mono w-10 text-center text-[#191f28]">{oppScore}</span>
                    {!isLocked && (
                      <button
                        id="btn-opp-score-plus"
                        type="button"
                        onClick={() => handleScoreChange('opp', oppScore + 1)}
                        className={BUTTONS.roundAction}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 스코어 결과 계산 오토 배너 표시 */}
              <div className="text-center pt-2">
                <span className={`inline-block text-xs font-bold px-4 py-2 rounded-2xl ${
                  getSimulatedResult() === 'win' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : getSimulatedResult() === 'lose'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {getSimulatedResult() === 'win' && '🎉 경기 결과: 마이팀 직관 승리! 💥'}
                  {getSimulatedResult() === 'lose' && '😢 경기 결과: 마이팀 아쉬운 패배'}
                  {getSimulatedResult() === 'draw' && '🤝 경기 결과: 손에 땀을 쥔 무승부'}
                </span>
              </div>
            </div>

            {/* 3. 구장 상세 및 예약 좌석 */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <label className={`${TYPOGRAPHY.bodyBold} block`}>
                    <span>경기장</span>
                  </label>
                </div>
                {isLocked ? (
                  <div className={`${LAYOUT.input} !border-zinc-200 bg-[#f8f9fa] text-zinc-700 flex items-center font-medium text-xs select-none`}>
                    <span>{stadium || (isHome ? favoriteTeam.stadium : oppTeamObj.stadium)}</span>
                  </div>
                ) : (
                  <select
                    id="form-stadium-input"
                    required
                    value={stadium}
                    onChange={(e) => setStadium(e.target.value)}
                    className={`${LAYOUT.input} !border-zinc-200 bg-white cursor-pointer`}
                  >
                    <option value="" disabled>경기장을 선택하세요</option>
                    {Array.from(new Set(KBO_TEAMS.map(team => team.stadium))).map(stadiumName => (
                      <option key={stadiumName} value={stadiumName}>
                        {stadiumName}
                      </option>
                    ))}
                    {stadium && !Array.from(new Set(KBO_TEAMS.map(t => t.stadium))).includes(stadium) && (
                      <option value={stadium}>{stadium}</option>
                    )}
                  </select>
                )}
              </div>

              {!isEditing ? (
                /* [상세보기 모드] 내 예매 좌석/구역과 티켓 금액 수직 배치 및 텍스트 전용 표시 */
                <div className="space-y-3">
                  <div className="space-y-1 pt-1">
                    <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>내 예매 좌석/구역</label>
                    <div className={`${LAYOUT.input} !border-zinc-200 bg-[#f8f9fa] text-zinc-700 flex items-center font-medium text-xs select-none h-11`}>
                      <span>{seats || '좌석 정보 없음'}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>티켓 금액</label>
                    <div className={`${LAYOUT.input} !border-zinc-200 bg-[#f8f9fa] text-zinc-700 flex items-center font-medium text-xs select-none h-11`}>
                      <span>
                        {ticketPrice !== '' && ticketPrice !== undefined
                          ? `${Number(ticketPrice).toLocaleString()}원`
                          : '금액 정보 없음'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* [수정 모드] 내 예매 좌석/구역과 티켓 금액 나란히 배치 및 입력 가능 (수정 이전 상태와 동일) */
                <div className="grid grid-cols-[6fr_4fr] gap-3 pt-1">
                  <div className="space-y-1">
                    <label htmlFor="form-seats-input" className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                      <span>내 예매 좌석/구역</span>
                    </label>
                    <input
                      id="form-seats-input"
                      type="text"
                      required
                      placeholder="예: 3루 오렌지석"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className={LAYOUT.input}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="form-ticket-price-input" className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                      <span>티켓 금액</span>
                    </label>
                    <input
                      id="form-ticket-price-input"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="원 (선택)"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className={LAYOUT.input + " [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 카드 4: 현장 직관 사진 업로드/첨부 섹션 (편집 모드 시에만 표시) */}
          {isEditing && (
            <div className="pb-0">
              <div className="space-y-1 pt-2.5">
                <div className="flex items-center justify-between mb-2">
                  <label className={`${TYPOGRAPHY.bodyBold} flex items-center`}>
                    <span>직관 사진</span>
                  </label>
                  <span className={`text-[10px] font-bold ${imageUrls.length >= 10 ? 'text-red-500' : 'text-[#8b95a1]'}`}>
                    {imageUrls.length} / 10장
                  </span>
                </div>

                <div className="space-y-2">
                <label 
                  htmlFor="album-photos-upload"
                  className="w-full h-12 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-500 text-xs gap-1 bg-[#f8f9fa] cursor-pointer hover:border-brand hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#191f28] text-[12px]">
                    <ImageIcon className="w-4 h-4 text-brand" />
                    <span>내 앨범에서 사진 선택하기</span>
                  </div>
                </label>
                <input 
                  id="album-photos-upload"
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;

                    const filesArray = Array.from(files) as File[];
                    const remainingCount = 10 - imageUrls.length;
                    if (remainingCount <= 0) {
                      alert("최대 10장까지만 등록 가능합니다.");
                      return;
                    }
                    
                    const targetFiles = filesArray.slice(0, remainingCount);
                    
                    targetFiles.forEach((file: File) => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Url = event.target?.result as string;
                        if (!base64Url) return;

                        const img = new Image();
                        img.src = base64Url;
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          const maxWidth = 500;
                          const maxHeight = 500;
                          let width = img.width;
                          let height = img.height;

                          if (width > height) {
                            if (width > maxWidth) {
                              height *= maxWidth / width;
                              width = maxWidth;
                            }
                          } else {
                            if (height > maxHeight) {
                              width *= maxHeight / height;
                              height = maxHeight;
                            }
                          }

                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                            setImageUrls(prev => {
                              if (prev.length >= 10) return prev;
                              return [...prev, compressedBase64];
                            });
                          }
                        };
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="hidden" 
                />
              </div>

              {/* 업로드 완료된 선택 이미지 썸네일 파일 그리드 */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {imageUrls.map((url, index) => (
                    <div key={`idx-${index}`} className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 group border border-zinc-100">
                      <img 
                        referrerPolicy="no-referrer"
                        src={url} 
                        alt={`사진 ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrls(imageUrls.filter((_, i) => i !== index));
                        }}
                        className="absolute top-1 right-1 bg-[#191f28]/70 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-rose-500 transition cursor-pointer font-bold"
                        title="삭제"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-brand text-[8px] text-white font-bold py-0.5 text-center leading-none tracking-tight">
                          대표
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 임시 포토 디테일 제거 공간 */}
              </div>
            </div>
          )}

          {/* Card 5: 구장 별미 먹거리 */}
          {!isEditing ? (
            selectedFoods.length > 0 ? (
              <div className="space-y-1 pt-1">
                <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                  <span>구장 먹거리</span>
                </label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedFoods.map(food => (
                    <span
                      key={`food-tag-${food}`}
                      className="bg-[#f2f4f6] text-[#4e5968] text-xs px-3 py-1.5 rounded-xl font-medium select-none"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            ) : null
          ) : (
            <div className="pb-0">
              <div className="space-y-1 pt-2.5">
                <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                  <span>구장 먹거리</span>
                </label>

              {homeOrAwayFamousFoods.length > 0 && (
                <div id="famous-foods-quicklist" className="flex flex-wrap gap-1.5">
                  {homeOrAwayFamousFoods.map(food => {
                    const isPicked = selectedFoods.includes(food.name);
                    return (
                      <button
                        id={`btn-fast-food-${food.name.replace(/\s+/g, '-')}`}
                        key={food.name}
                        type="button"
                        onClick={() => handleToggleFood(food.name)}
                        className={`px-3 py-2 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
                          isPicked 
                            ? 'bg-[#191f28] text-white border-transparent shadow-sm' 
                            : 'bg-[#f2f4f6] border-transparent text-[#4e5968] hover:bg-[#ebedf0]'
                        }`}
                      >
                        <span>{food.name.split(' ').slice(1).join(' ') || food.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 유저가 직접 입력하는 커스텀 먹거리 입력 영역 */}
              <div className={`flex gap-2 ${homeOrAwayFamousFoods.length > 0 ? 'pt-1' : ''}`}>
                <input
                  id="custom-food-text-field"
                  type="text"
                  placeholder="먹은 다른 푸드 입력..."
                  value={customFood}
                  onChange={(e) => setCustomFood(e.target.value)}
                  className={LAYOUT.input + " flex-1"}
                />
                <button
                  id="btn-add-custom-food"
                  type="button"
                  onClick={(e) => handleAddCustomFood(e)}
                  className="bg-brand hover:bg-brand-hover text-white font-bold px-4 rounded-2xl text-xs cursor-pointer h-11 transition"
                >
                  추가
                </button>
              </div>

              {/* 현재 직관 일기에 선택 및 기록된 푸드 뱃지 리스트 */}
              {selectedFoods.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedFoods.map(food => (
                    <span
                      key={`badge-${food}`}
                      className="bg-brand-light text-brand text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold"
                    >
                      <span>{food}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleFood(food)}
                        className="text-brand/70 hover:text-red-500 font-bold text-sm leading-none shrink-0"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}

          {/* Card 6: 직관 일기 소감 */}
          <div className="pb-4">
            <div className="pt-2">
              <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                <span>직관 소감</span>
              </label>
              {!isEditing ? (
                <div className="w-full bg-[#f8f9fa] border border-zinc-200/80 rounded-2xl p-4 text-xs font-medium text-[#191f28] leading-relaxed select-none min-h-[80px] whitespace-pre-wrap">
                  {diaryContent || '작성된 직관 소감이 없습니다.'}
                </div>
              ) : (
                <>
                  <textarea
                    id="form-diary-textarea"
                    maxLength={400}
                    placeholder="오늘 경기에서 좋았던 점, 아쉬운 찬스, 활약했던 최애 선수 등을 적어보세요..."
                    rows={4}
                    value={diaryContent}
                    onChange={(e) => setDiaryContent(e.target.value)}
                    className={LAYOUT.textarea}
                  />
                  <div className="flex justify-end items-center text-[10px] text-[#4e5968] font-normal mt-1.5 font-sans">
                    <span className="font-mono">{diaryContent.length}/400자</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 누락 입력 항목에 대안 유효성 오류 및 경고 통지 패널 */}
          {validationError && (
            <div className="text-red-500 text-[11px] bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-2 font-bold select-none">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* 제출 액션 단락 */}
          {isEditing && (
            <div className="pt-4">
              <button
                id="btn-save-record"
                type="submit"
                className={BUTTONS.primary + " h-12 text-xs w-full"}
              >
                <Check className="w-4.5 h-4.5 stroke-[3]" />
                <span>
                  {existingRecord ? '수정 내용 저장 완료' : '직관 다이어리 등록 완료'}
                </span>
              </button>
            </div>
          )}

        </form>
      </div>

      {/* 경기 일자 선택 달력 모달 */}
      {isDatePickerOpen && (
        <div 
          id="date-picker-modal-backdrop"
          className="fixed inset-0 z-50 bg-[#191f28]/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsDatePickerOpen(false)}
        >
          <div 
            id="date-picker-modal-content"
            className="bg-white rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4 border border-zinc-100 animate-scaleUp select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 상단 헤더 */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-[15px] font-bold text-[#191f28]">경기 일자 선택</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* 빠른 날짜 선택 칩 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setDate('2026-05-26');
                  setPickerYear(2026);
                  setPickerMonth(5);
                  setIsDatePickerOpen(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  date === '2026-05-26'
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-zinc-200'
                }`}
              >
                오늘 (5/26)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDate('2026-05-25');
                  setPickerYear(2026);
                  setPickerMonth(5);
                  setIsDatePickerOpen(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  date === '2026-05-25'
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-zinc-200'
                }`}
              >
                어제 (5/25)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDate('2026-05-24');
                  setPickerYear(2026);
                  setPickerMonth(5);
                  setIsDatePickerOpen(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  date === '2026-05-24'
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-zinc-200'
                }`}
              >
                5/24 (일)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDate('2026-05-23');
                  setPickerYear(2026);
                  setPickerMonth(5);
                  setIsDatePickerOpen(false);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  date === '2026-05-23'
                    ? 'bg-brand text-white shadow-2xs'
                    : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-zinc-200'
                }`}
              >
                5/23 (토)
              </button>
            </div>

            {/* 년/월 전환 내비게이터 */}
            <div className="flex items-center justify-between px-1 py-1 bg-zinc-50 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 1) {
                    setPickerYear(prev => prev - 1);
                    setPickerMonth(12);
                  } else {
                    setPickerMonth(prev => prev - 1);
                  }
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-zinc-200/70 text-zinc-600 transition cursor-pointer"
                title="이전 달"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-1.5">
                <select
                  value={pickerYear}
                  onChange={(e) => setPickerYear(Number(e.target.value))}
                  className="bg-transparent font-bold text-[13px] text-[#191f28] cursor-pointer focus:outline-none"
                >
                  {[2026, 2025, 2024, 2023, 2022].map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
                <select
                  value={pickerMonth}
                  onChange={(e) => setPickerMonth(Number(e.target.value))}
                  className="bg-transparent font-bold text-[13px] text-[#191f28] cursor-pointer focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}월</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 12) {
                    setPickerYear(prev => prev + 1);
                    setPickerMonth(1);
                  } else {
                    setPickerMonth(prev => prev + 1);
                  }
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-zinc-200/70 text-zinc-600 transition cursor-pointer"
                title="다음 달"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* 달력 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-zinc-400">
              <span className="text-rose-500">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className="text-blue-500">토</span>
            </div>

            {/* 달력 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const totalDays = new Date(pickerYear, pickerMonth, 0).getDate();
                const startDay = new Date(pickerYear, pickerMonth - 1, 1).getDay();
                const days = [];

                for (let i = 0; i < startDay; i++) {
                  days.push(<div key={`empty-${i}`} className="h-10" />);
                }

                for (let d = 1; d <= totalDays; d++) {
                  const dStr = `${pickerYear}-${String(pickerMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const isSelected = date === dStr;
                  const dayOfWeek = (d + startDay - 1) % 7;
                  const isSunday = dayOfWeek === 0;
                  const isSaturday = dayOfWeek === 6;

                  // 선호 구단 해당 일자 경기 매칭
                  const match = MATCHES_DATA.find(
                    m => m.date === dStr && (m.homeTeamId === favoriteTeam.id || m.awayTeamId === favoriteTeam.id)
                  );
                  const opp = match 
                    ? KBO_TEAMS.find(t => t.id === (match.homeTeamId === favoriteTeam.id ? match.awayTeamId : match.homeTeamId))
                    : null;

                  days.push(
                    <button
                      key={dStr}
                      type="button"
                      onClick={() => {
                        setDate(dStr);
                        setIsDatePickerOpen(false);
                      }}
                      className={`h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-brand text-white font-bold shadow-md scale-105 ring-2 ring-brand/30'
                          : 'hover:bg-zinc-100 text-[#191f28]'
                      }`}
                    >
                      <span className={`text-[12px] leading-none ${
                        isSelected 
                          ? 'text-white font-bold' 
                          : isSunday 
                            ? 'text-rose-500 font-semibold' 
                            : isSaturday 
                              ? 'text-blue-500 font-semibold' 
                              : 'text-zinc-700'
                      }`}>
                        {d}
                      </span>
                      {match && opp && (
                        <span className={`text-[8px] leading-tight truncate px-0.5 mt-0.5 font-bold ${
                          isSelected ? 'text-blue-100' : 'text-[#3182f6]'
                        }`}>
                          {opp.shortName}
                        </span>
                      )}
                    </button>
                  );
                }
                return days;
              })()}
            </div>

            {/* 수동 직접 입력 옵션 */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-500 font-medium shrink-0">직접 입력:</span>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(e.target.value);
                    const parts = e.target.value.split('-');
                    if (parts.length === 3) {
                      setPickerYear(parseInt(parts[0], 10));
                      setPickerMonth(parseInt(parts[1], 10));
                    }
                  }
                }}
                className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-brand font-mono"
              />
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="px-3 py-1.5 bg-brand text-white text-xs font-bold rounded-xl hover:bg-[#4314c4] transition cursor-pointer shadow-2xs"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 게시글 수정/작성 중단 확인 팝업 모달 */}
      {showExitConfirm && (
        <div 
          id="exit-confirm-modal-backdrop"
          className="fixed inset-0 z-50 bg-[#191f28]/60 backdrop-blur-2xs flex items-center justify-center p-5 animate-fadeIn"
          onClick={() => setShowExitConfirm(false)}
        >
          <div 
            id="exit-confirm-modal-content"
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center space-y-4 border border-zinc-100 animate-scaleUp select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5 pt-1">
              <h3 className="text-[17px] font-bold text-[#191f28] leading-snug">
                게시글 수정을 그만둘까요?
              </h3>
              <p className="text-[13px] text-[#8b95a1] leading-relaxed">
                변경된 내용은 저장되지 않습니다.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 rounded-2xl bg-[#f2f4f6] text-[#4e5968] font-bold text-xs hover:bg-[#e5e8eb] transition cursor-pointer"
              >
                계속 작성
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  resetToInitialValues();
                  if (initialMode === 'view') {
                    setIsEditing(false);
                  } else {
                    onClose();
                  }
                }}
                className="w-full py-3 rounded-2xl bg-[#fee3e2] text-[#f04452] font-bold text-xs hover:bg-[#fcd2d1] transition cursor-pointer"
              >
                그만두기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사진 전체보기 풀스크린 라이트박스 모달 (당근마켓 스타일: 원본 비율 전체 표시, 좌우 드래그 스와이프, 상단 좌측 X 닫기 버튼) */}
      {isPhotoLightboxOpen && imageUrls.length > 0 && (
        <div 
          id="photo-lightbox-modal"
          className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center select-none animate-fadeIn overflow-hidden"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 상단 좌측 닫기(X) 버튼 (상단 좌/우 텍스트 및 배지 제거, 좌측에 X 아이콘 버튼만 배치) */}
          <div className="absolute top-0 left-0 right-0 p-4 pt-5 z-30 flex items-center justify-between pointer-events-none">
            <button
              id="btn-close-photo-lightbox"
              type="button"
              onClick={() => setIsPhotoLightboxOpen(false)}
              className="p-2.5 rounded-full text-white/90 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm transition cursor-pointer active:scale-95 pointer-events-auto"
              aria-label="닫기"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* 원본 비율 전체 화면 슬라이더 컨테이너 (좌우 드래그 스와이프 지원, 중간 화살표 제거) */}
          <div 
            className="w-full h-full flex items-center overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <div 
              className="flex h-full w-full items-center"
              style={{
                transform: `translateX(calc(-${lightboxPhotoIdx * 100}% + ${lightboxDragX}px))`,
                transition: lightboxIsDragging ? 'none' : 'transform 280ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {imageUrls.map((url, idx) => (
                <div 
                  key={`lightbox-img-${idx}`}
                  className="w-full h-full flex-shrink-0 flex items-center justify-center p-3 select-none"
                >
                  <img 
                    referrerPolicy="no-referrer"
                    src={url} 
                    alt={`직관 사진 ${idx + 1}`} 
                    className="max-w-full max-h-full w-auto h-auto object-contain select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 하단 인디케이터 (장수 표시: 당근마켓 스타일) */}
          {imageUrls.length > 1 && (
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="bg-black/60 text-white/90 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold backdrop-blur-md shadow-md border border-white/10">
                {lightboxPhotoIdx + 1} / {imageUrls.length}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
