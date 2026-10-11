import React, { useState, useEffect } from 'react';
import { Match, KBOTeam, AttendanceRecord } from '../types';
import { KBO_TEAMS, FAMOUS_BALLPARK_FOODS, MATCHES_DATA } from '../data/kboData';
import { Calendar, MapPin, Check, Trash2, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import { COLORS, TYPOGRAPHY, BUTTONS, LAYOUT } from '../lib/styles';

interface AttendanceFormProps {
  favoriteTeam: KBOTeam;
  selectedMatch: Match | null; // Null if manual custom match is being added
  existingRecord?: AttendanceRecord; // If editing
  onSave: (record: AttendanceRecord) => void;
  onDelete?: (recordId: string) => void;
  onClose: () => void;
}



export default function AttendanceForm({
  favoriteTeam,
  selectedMatch,
  existingRecord,
  onSave,
  onDelete,
  onClose
}: AttendanceFormProps) {
  // 로컬 컴포넌트 상태 정의
  const [date, setDate] = useState('');
  const [opponentTeamId, setOpponentTeamId] = useState('');
  const [isHome, setIsHome] = useState(true);
  const [stadium, setStadium] = useState('');
  const [ourScore, setOurScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [seats, setSeats] = useState('');
  const [ticketPrice, setTicketPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [foodImageUrls, setFoodImageUrls] = useState<string[]>([]);
  const [diaryContent, setDiaryContent] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [customFood, setCustomFood] = useState('');
  const [validationError, setValidationError] = useState('');
 
  // 입력값(수정 타겟 레코드 데이터 혹은 선택한 직전 대진 결과) 기반 로컬 상태값 초기화
  useEffect(() => {
    if (existingRecord) {
      setDate(existingRecord.date);
      setOpponentTeamId(existingRecord.opponentTeamId);
      setIsHome(existingRecord.isHome);
      setStadium(existingRecord.stadium);
      setOurScore(existingRecord.ourScore);
      setOppScore(existingRecord.oppScore);
      setSeats(existingRecord.seats);
      setTicketPrice(existingRecord.ticketPrice !== undefined ? existingRecord.ticketPrice : '');
      setImageUrl(existingRecord.imageUrl || '');
      setImageUrls(existingRecord.imageUrls || (existingRecord.imageUrl ? [existingRecord.imageUrl] : []));
      setFoodImageUrls(existingRecord.foodImageUrls || []);
      setDiaryContent(existingRecord.diaryContent);
      setSelectedFoods(existingRecord.foods || []);
    } else if (selectedMatch) {
      // Create starting details from the clicked scheduled match
      setDate(selectedMatch.date);
      const isHomeMatch = selectedMatch.homeTeamId === favoriteTeam.id;
      setIsHome(isHomeMatch);
      setOpponentTeamId(isHomeMatch ? selectedMatch.awayTeamId : selectedMatch.homeTeamId);
      
      const oppTeam = KBO_TEAMS.find(t => t.id === (isHomeMatch ? selectedMatch.awayTeamId : selectedMatch.homeTeamId));
      setStadium(isHomeMatch ? favoriteTeam.stadium : (oppTeam ? oppTeam.stadium : favoriteTeam.stadium));
      setOurScore(isHomeMatch ? (selectedMatch.homeScore || 0) : (selectedMatch.awayScore || 0));
      setOppScore(isHomeMatch ? (selectedMatch.awayScore || 0) : (selectedMatch.homeScore || 0));
      setSeats('');
      setTicketPrice('');
      setImageUrl('');
      setImageUrls([]);
      setFoodImageUrls([]);
      setDiaryContent('');
      setSelectedFoods([]);
    } else {
      // Manual/Custom Match
      setDate('2026-05-26');
      setOpponentTeamId(KBO_TEAMS.find(t => t.id !== favoriteTeam.id)?.id || 'samsung');
      setIsHome(true);
      setStadium(favoriteTeam.stadium);
      setOurScore(0);
      setOppScore(0);
      setSeats('');
      setTicketPrice('');
      setImageUrl('');
      setImageUrls([]);
      setFoodImageUrls([]);
      setDiaryContent('');
      setSelectedFoods([]);
    }
  }, [selectedMatch, existingRecord, favoriteTeam]);

  // 완료된 특정 연월일 경기를 유저가 직접 선택했을 때 관련 수치값을 오토-세팅
  useEffect(() => {
    if (!existingRecord && date) {
      // Find a matching completed (or scheduled) game for that date involving favoriteTeam
      const foundMatch = MATCHES_DATA.find(
        m => m.date === date && (m.homeTeamId === favoriteTeam.id || m.awayTeamId === favoriteTeam.id)
      );

      if (foundMatch) {
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
      }
    }
  }, [date, favoriteTeam, existingRecord]);

  // 경기 스코어 점수 변동 조절 핸들러
  const handleScoreChange = (type: 'our' | 'opp', val: number) => {
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

    const payload: AttendanceRecord = {
      id: existingRecord?.id || selectedMatch?.id || `custom-record-${Date.now()}`,
      matchId: selectedMatch?.id,
      date,
      opponentTeamId,
      isHome,
      stadium,
      result: getSimulatedResult(),
      ourScore,
      oppScore,
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

  return (
    <div id="attendance-form-overlay" className="absolute inset-0 bg-white z-40 flex flex-col h-full overflow-y-auto text-[#191f28] sm:rounded-[36px]">
      
      {/* 헤더 바 */}
      <div id="form-header-bar" className="grid grid-cols-3 items-center px-6 py-4 border-b border-zinc-100 shrink-0 bg-white/90 backdrop-blur-md z-10 sticky top-0">
        <div className="flex justify-start">
          <button
            id="btn-close-form"
            onClick={onClose}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-zinc-100 p-1 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
        
        <div className="flex justify-center">
          <h2 id="form-header-title" className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">
            직관기록
          </h2>
        </div>
        
        <div className="flex justify-end">
          {/* 가로 대칭 정렬을 위한 빈 공간 홀더 */}
        </div>
      </div>
      
      {/* 메인 폼 필드 리스트 스크롤 영역 */}
      <div id="form-body-scrollable" className="flex-1 px-5 py-5 pb-8 space-y-4">

        {/* Form Container */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs text-zinc-850">
          
          {/* Combined Card: 경기 일정, 상대팀, 스코어, 구장 및 좌석 정보 통합 */}
          <div className="pt-4 pb-0 space-y-5">
            
            {/* 1. 경기 일정 및 상대 구단 */}
            <div className="space-y-4">
              <div className="grid grid-cols-[4.5fr_5.5fr] gap-4">
                <div className="space-y-1">
                  <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                    <span>경기 일자</span>
                  </label>
                  <div 
                    className="relative w-full cursor-pointer group select-none"
                  >
                    {/* 사용자가 보기 수월하도록 가시화 커스텀 적용한 데이트 링커 */}
                    <div className={`${LAYOUT.input} flex items-center bg-white !border-[#e5e8eb] group-hover:border-zinc-300 transition-colors h-11 w-full !px-3.5`}>
                      <span className="text-[#191f28] font-medium font-sans text-[13px]">
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
                    {/* 클릭 트리거가 올바르게 전파될 수 있게 투명하게 얹은 실제 인풋 홀더 */}
                    <input
                      id="form-date-input"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>

                <div className="space-y-1 pl-2.5">
                  <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>홈 / 원정 구분</label>
                  <div className="grid grid-cols-2 gap-1 bg-[#f2f4f6] p-1 rounded-2xl h-11 items-center">
                    <button
                      id="btn-form-home"
                      type="button"
                      disabled={isEndedGame}
                      onClick={() => {
                        setIsHome(true);
                        setStadium(favoriteTeam.stadium);
                      }}
                      className={`h-8 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center ${
                        isEndedGame ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      } ${
                        isHome ? 'bg-brand text-white shadow-xs' : 'text-[#8b95a1] hover:text-[#4e5968]'
                      }`}
                    >
                      홈경기
                    </button>
                    <button
                      id="btn-form-away"
                      type="button"
                      disabled={isEndedGame}
                      onClick={() => {
                        setIsHome(false);
                        const opp = KBO_TEAMS.find(t => t.id === opponentTeamId);
                        setStadium(opp ? opp.stadium : '');
                      }}
                      className={`h-8 rounded-xl text-[11px] font-bold transition-all duration-200 flex items-center justify-center ${
                        isEndedGame ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      } ${
                        !isHome ? 'bg-brand text-white shadow-xs' : 'text-[#8b95a1] hover:text-[#4e5968]'
                      }`}
                    >
                      원정경기
                    </button>
                  </div>
                </div>
              </div>

              {isEndedGame && (
                <div className="bg-[#f0f4fa] text-brand text-[11px] font-bold p-3.5 rounded-2xl flex items-start gap-2 select-none leading-relaxed">
                  <span className="shrink-0 mt-0.5">ℹ️</span>
                  <span>종료된 공식 경기는 정보를 변경할 수 없습니다 (홈/원정, 상대 팀, 스코어, 경기장 고정).</span>
                </div>
              )}

              {/* 상대 구단 직접 선택 옵션 */}
              <div className="space-y-1 border-b-0 pb-0 pt-2.5">
                <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>상대 팀 구단</label>
                <div id="opponent-select-scroll" className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {KBO_TEAMS.filter(t => t.id !== favoriteTeam.id).map(t => {
                    const isSelected = opponentTeamId === t.id;
                    return (
                      <button
                        id={`form-opp-${t.id}`}
                        key={t.id}
                        type="button"
                        disabled={isEndedGame}
                        onClick={() => {
                          setOpponentTeamId(t.id);
                          if (!isHome) {
                            setStadium(t.stadium);
                          }
                        }}
                        className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition-all ${
                          isEndedGame ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                        } ${
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
              </div>
            </div>

            <hr className="border-dashed border-zinc-100" />

            {/* 2. 최종 경기 결과 기록 */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 items-center">
                {/* 좌측: 우리 구단 직관 점수 */}
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs font-semibold text-[#191f28]">{favoriteTeam.shortName} (마이팀)</span>
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-our-score-minus"
                      type="button"
                      disabled={isEndedGame}
                      onClick={() => handleScoreChange('our', Math.max(0, ourScore - 1))}
                      className={`${BUTTONS.roundAction} ${isEndedGame ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold font-mono w-8 text-center text-[#191f28]">{ourScore}</span>
                    <button
                      id="btn-our-score-plus"
                      type="button"
                      disabled={isEndedGame}
                      onClick={() => handleScoreChange('our', ourScore + 1)}
                      className={`${BUTTONS.roundAction} ${isEndedGame ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 우측: 상대 구단 경기 스코어 */}
                <div className="flex flex-col items-center space-y-2 border-l border-zinc-100">
                  <span className="text-xs font-semibold text-[#8b95a1]">{oppTeamObj.shortName} (상대팀)</span>
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-opp-score-minus"
                      type="button"
                      disabled={isEndedGame}
                      onClick={() => handleScoreChange('opp', Math.max(0, oppScore - 1))}
                      className={`${BUTTONS.roundAction} ${isEndedGame ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold font-mono w-8 text-center text-[#191f28]">{oppScore}</span>
                    <button
                      id="btn-opp-score-plus"
                      type="button"
                      disabled={isEndedGame}
                      onClick={() => handleScoreChange('opp', oppScore + 1)}
                      className={`${BUTTONS.roundAction} ${isEndedGame ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 스코어 결과 계산 오토 배너 표시 */}
              <div className="text-center pt-2">
                <span className={`inline-block text-xs font-bold px-4 py-2 rounded-2xl ${
                  getSimulatedResult() === 'win' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-zinc-50 text-zinc-500'
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
                <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                  <span>경기장</span>
                </label>
                <select
                  id="form-stadium-input"
                  required
                  disabled={isEndedGame}
                  value={stadium}
                  onChange={(e) => setStadium(e.target.value)}
                  className={`${LAYOUT.input} !border-zinc-200 bg-white disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed cursor-pointer`}
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 pt-2.5">
                  <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>내 예매 좌석/구역</label>
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

                <div className="space-y-1 pt-2.5">
                  <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>티켓 금액 (원)</label>
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
            </div>

          </div>

          {/* 카드 4: 현장 직관 사진 업로드/첨부 섹션 */}
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

          {/* Card 5: 구장 별미 먹거리 */}
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

          {/* Card 6: 직관 일기 소감 */}
          <div className="pb-4">
            <div className="pt-2.5">
              <label className={`${TYPOGRAPHY.bodyBold} block mb-2`}>
                <span>직관 소감</span>
              </label>
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
            </div>
          </div>

          {/* 누락 입력 항목에 대안 유효성 오류 및 경고 통지 패널 */}
          {validationError && (
            <div className="text-red-500 text-[11px] bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-2 font-bold select-none">
              <span>⚠️</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* 제출 및 취소/삭제 액션 단락 */}
          <div className="flex gap-3 pt-4">
            {existingRecord && onDelete && (
              <button
                id="btn-delete-record"
                type="button"
                onClick={() => onDelete(existingRecord.id)}
                className="bg-[#fee3e2] hover:bg-[#fcd2d1] text-[#f04452] font-semibold px-5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer"
                title="일기 기록 삭제"
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>삭제</span>
              </button>
            )}

            <button
              id="btn-save-record"
              type="submit"
              className={BUTTONS.primary + " h-12 text-xs flex-1"}
            >
              <Check className="w-4.5 h-4.5 stroke-[3]" />
              <span>
                {existingRecord ? '수정 내용 저장 완료' : '직관 다이어리 등록 완료'}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
