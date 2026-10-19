import React, { useState, useEffect, useRef } from 'react';
import { HomeSectionConfig, HomeSectionId } from '../types';
import { 
  ChevronLeft, 
  Radio, 
  Clock, 
  Calendar, 
  Trophy, 
  Award, 
  Check, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  {
    id: 'liveMatch',
    name: '실시간 경기 중계',
    description: '진행 중인 경기의 실시간 스코어, 볼카운트 및 중계',
    enabled: true,
  },
  {
    id: 'nextMatch',
    name: '다음경기일정',
    description: '선호 구단의 다음 예정 매치 및 D-Day 카운트다운',
    enabled: true,
  },
  {
    id: 'teamCalendar',
    name: '구단경기일정',
    description: '월별 구단 전체 매치 달력 및 나의 직관 기록 여부',
    enabled: true,
  },
  {
    id: 'teamStandings',
    name: '현재 2026리그 순위표',
    description: 'KBO 10개 구단 전체 순위, 승률, 게임차 순위표',
    enabled: true,
  },
  {
    id: 'playerRankings',
    name: 'kbo리그 개인 순위',
    description: '타자·투수 부문별 실시간/시즌 개인 랭킹 TOP 5',
    enabled: true,
  },
];

interface HomeSectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: HomeSectionConfig[];
  onSave: (newSections: HomeSectionConfig[]) => void;
}

export default function HomeSectionSettingsModal({
  isOpen,
  onClose,
  sections,
  onSave,
}: HomeSectionSettingsModalProps) {
  const [list, setList] = useState<HomeSectionConfig[]>(sections);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setList(sections);
      setShowDiscardDialog(false);
      setDraggingIndex(null);
    }
  }, [sections, isOpen]);

  if (!isOpen) return null;

  // 변경사항 여부 검사
  const hasChanges = () => {
    if (list.length !== sections.length) return true;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id !== sections[i].id || list[i].enabled !== sections[i].enabled) {
        return true;
      }
    }
    return false;
  };

  // 뒤로가기 클릭
  const handleBack = () => {
    if (hasChanges()) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  };

  // 저장/적용 버튼 클릭: 체크된 항목들만 위로 올려주고 변경사항 반영
  const handleApply = () => {
    const checked = list.filter((item) => item.enabled);
    const unchecked = list.filter((item) => !item.enabled);
    const reordered = [...checked, ...unchecked];
    onSave(reordered);
    onClose();
  };

  // 토글 활성화/비활성화
  const handleToggle = (id: HomeSectionId) => {
    setList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  // 가로줄 3개 아이콘 포인터(마우스/터치) 드래그 핸들러
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (e.button !== 0) return; // 좌클릭/터치만 허용
    setDraggingIndex(index);
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex === null) return;
    const currentY = e.clientY;

    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el || i === draggingIndex) continue;
      const rect = el.getBoundingClientRect();
      if (currentY >= rect.top && currentY <= rect.bottom) {
        setList((prev) => {
          const next = [...prev];
          const [movedItem] = next.splice(draggingIndex, 1);
          next.splice(i, 0, movedItem);
          return next;
        });
        setDraggingIndex(i);
        break;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingIndex !== null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setDraggingIndex(null);
    }
  };

  // 아이콘 렌더링
  const renderIcon = (id: HomeSectionId) => {
    switch (id) {
      case 'liveMatch':
        return <Radio className="w-4 h-4 text-rose-500" />;
      case 'nextMatch':
        return <Clock className="w-4 h-4 text-brand" />;
      case 'teamCalendar':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'teamStandings':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'playerRankings':
        return <Award className="w-4 h-4 text-indigo-500" />;
      default:
        return <SlidersHorizontal className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div 
      id="home-sections-settings-page"
      className="absolute inset-0 z-50 bg-white flex flex-col animate-fadeIn select-none overflow-hidden"
    >
      {/* 1. 상단 헤더: 왼쪽 뒤로가기 화살표, 중간 홈화면구성, 오른쪽 적용 */}
      <header className="bg-white px-5 py-4 border-b border-[#f2f4f6] shrink-0 grid grid-cols-3 items-center sticky top-0 z-30">
        <div className="flex justify-start">
          <button
            id="btn-back-home-settings"
            type="button"
            onClick={handleBack}
            className="text-[#8b95a1] hover:text-[#191f28] hover:bg-[#f2f4f6] p-1.5 -ml-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">
            홈화면구성
          </h2>
        </div>

        <div className="flex justify-end">
          <button
            id="btn-apply-home-settings"
            type="button"
            onClick={handleApply}
            className="text-[14px] font-extrabold text-brand hover:text-brand-hover px-2.5 py-1 rounded-lg hover:bg-brand-light/60 transition cursor-pointer"
          >
            적용
          </button>
        </div>
      </header>

      {/* 섹션 목록 스크롤 영역 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">

        {list.map((item, index) => {
          const isDragging = draggingIndex === index;
          const checkedOrder = list.slice(0, index + 1).filter((i) => i.enabled).length;

          return (
            <div
              key={item.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={`relative rounded-2xl p-3.5 transition-all duration-150 border flex items-center justify-between gap-3 ${
                isDragging
                  ? 'bg-white border-brand shadow-lg scale-[1.02] z-30 ring-2 ring-brand/20'
                  : item.enabled
                  ? 'bg-white border-zinc-200/90 shadow-xs'
                  : 'bg-zinc-100/70 border-zinc-200/60 opacity-65'
              }`}
            >
              {/* 왼쪽: 체크박스 + 아이콘 + 타이틀/설명 */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 cursor-pointer border ${
                    item.enabled
                      ? 'bg-brand border-brand text-white shadow-xs'
                      : 'bg-white border-zinc-300 text-transparent hover:border-zinc-400'
                  }`}
                  title={item.enabled ? '홈 화면에서 숨기기' : '홈 화면에 표시하기'}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                <div className="w-8 h-8 rounded-xl bg-zinc-100/80 flex items-center justify-center shrink-0">
                  {renderIcon(item.id)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[13px] font-bold truncate ${item.enabled ? 'text-zinc-900' : 'text-zinc-500'}`}>
                      {item.name}
                    </span>
                    {item.enabled ? (
                      <span className="text-[10px] bg-brand/10 text-brand font-black px-1.5 py-0.2 rounded font-mono shrink-0">
                        {checkedOrder}번째
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-200 text-zinc-500 font-bold px-1.5 py-0.2 rounded shrink-0">
                        숨김
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* 오른쪽: 가로줄 3개 드래그 이동 핸들 아이콘 */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl p-2 cursor-grab active:cursor-grabbing touch-none select-none transition shrink-0 ${
                  isDragging 
                    ? 'text-brand bg-brand/10' 
                    : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:text-brand'
                }`}
                title="가로줄을 누른 채로 위아래로 이동"
                onPointerDown={(e) => handlePointerDown(e, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* 세련된 가로줄 3개 햄버거 그립 아이콘 */}
                <svg
                  className="w-5 h-5 pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </div>
            </div>
          );
        })}
      </main>

      {/* 4. 뒤로가기 시 변경사항 미저장 확인 팝업 모달 */}
      {showDiscardDialog && (
        <div 
          className="absolute inset-0 z-60 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setShowDiscardDialog(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-zinc-150 space-y-4 animate-scale select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                  변경사항을 저장 안하시겠습니까?
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  저장하지 않은 설정은 취소됩니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardDialog(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs font-bold transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardDialog(false);
                  setList(sections); // 원래 상태로 되돌림
                  onClose(); // 홈 화면으로 이동
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
