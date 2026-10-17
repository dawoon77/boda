import React, { useState } from 'react';
import { ChevronLeft, Check, Search, X, User } from 'lucide-react';
import { KBOTeam, Player, PlayerPosition } from '../types';
import { BUTTONS } from '../lib/styles';

const MAX_FAVORITES = 5; // 최대 선택 인원
const POSITION_FILTERS: ('전체' | PlayerPosition)[] = ['전체', '투수', '포수', '내야수', '외야수'];

interface FavoritePlayersScreenProps {
  team: KBOTeam;                         // 응원팀 (색상·이름 표시용)
  players: Player[];                     // 고를 수 있는 선수 목록 (응원팀 선수)
  initialSelected: Player[];             // 지금 저장되어 있는 좋아하는 선수
  onSave: (selected: Player[]) => void;  // 저장하기
  onBack: () => void;                    // 저장하지 않고 나가기
}

export default function FavoritePlayersScreen({ team, players, initialSelected, onSave, onBack }: FavoritePlayersScreenProps) {
  const [selected, setSelected] = useState<Player[]>(initialSelected);     // 이 화면에서 고르는 중인 선수 (저장 전까지 임시)
  const [position, setPosition] = useState<'전체' | PlayerPosition>('전체'); // 포지션 필터
  const [keyword, setKeyword] = useState('');                              // 이름 검색어
  const [warning, setWarning] = useState('');                              // 5명 초과 안내 문구

  const isSelected = (player: Player) => selected.some((s) => s.id === player.id);

  // 선수 누르기: 이미 골랐으면 빼고, 아니면 추가 (5명 넘으면 안내만 표시)
  const togglePlayer = (player: Player) => {
    if (isSelected(player)) {
      setSelected(selected.filter((s) => s.id !== player.id));
      setWarning('');
      return;
    }
    if (selected.length >= MAX_FAVORITES) {
      setWarning(`최대 ${MAX_FAVORITES}명까지 선택할 수 있어요.`);
      return;
    }
    setSelected([...selected, player]);
    setWarning('');
  };

  // 포지션 필터 + 이름 검색 적용
  const visiblePlayers = players.filter(
    (p) => (position === '전체' || p.position === position) && p.name.includes(keyword.trim())
  );

  return (
    <div id="favorite-players-page" className="absolute inset-0 z-50 bg-[#f2f4f6] flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-favorite-players"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">좋아하는 선수</h2>
        </div>
        <div />
      </header>

      {/* 고른 선수 + 검색 + 포지션 필터 (스크롤해도 고정) */}
      <div className="bg-white px-5 pt-4 pb-3 space-y-3 border-b border-[#f2f4f6] shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#4e5968]">
            <span style={{ color: team.primaryColor }}>{team.name}</span> 선수 중 최대 {MAX_FAVORITES}명
          </p>
          <span className="text-xs font-bold text-brand font-mono">
            {selected.length}/{MAX_FAVORITES}
          </span>
        </div>

        {/* 고른 선수 칩 (✕ 누르면 빼기) */}
        {selected.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {selected.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlayer(p)}
                className="flex items-center gap-1 shrink-0 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-bold text-white cursor-pointer"
                style={{ backgroundColor: team.primaryColor }}
              >
                {p.number}. {p.name}
                <X className="w-3 h-3 stroke-[3]" />
              </button>
            ))}
          </div>
        )}

        {warning && <p className="text-[11px] font-bold text-[#f04452] animate-fadeIn">{warning}</p>}

        {/* 이름 검색 */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8b95a1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="favorite-players-search"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="선수 이름 검색"
            className="w-full bg-[#f2f4f6] focus:bg-white border border-transparent focus:border-brand rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#191f28] focus:outline-none transition"
          />
        </div>

        {/* 포지션 필터 */}
        <div className="flex gap-1.5">
          {POSITION_FILTERS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                position === pos
                  ? 'bg-[#191f28] text-white border-transparent'
                  : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* 선수 목록 */}
      <main className="flex-1 overflow-y-auto p-4">
        {visiblePlayers.length === 0 ? (
          <p className="text-center text-xs text-[#8b95a1] font-semibold py-16">조건에 맞는 선수가 없어요.</p>
        ) : (
          <ul className="bg-white rounded-3xl border border-[#e5e8eb] overflow-hidden">
            {visiblePlayers.map((player) => {
              const checked = isSelected(player);
              return (
                <li key={player.id} className="border-b border-[#f2f4f6] last:border-b-0">
                  <button
                    id={`player-item-${player.id}`}
                    onClick={() => togglePlayer(player)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f9fafb] transition cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: team.primaryColor }}
                    >
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#191f28] truncate">
                        <span className="font-mono text-[#8b95a1] mr-1">No.{player.number}</span>
                        {player.name}
                      </p>
                      <p className="text-[10px] font-semibold text-[#8b95a1]">{player.position}</p>
                    </div>
                    {/* 선택 표시 동그라미 */}
                    <div
                      className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 border-2 transition ${
                        checked ? 'border-transparent bg-brand' : 'border-[#e5e8eb]'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* 하단 고정: 저장 버튼 */}
      <div className="shrink-0 bg-white border-t border-[#f2f4f6] p-4">
        <button id="btn-save-favorite-players" onClick={() => onSave(selected)} className={BUTTONS.primary}>
          저장하기
        </button>
      </div>
    </div>
  );
}