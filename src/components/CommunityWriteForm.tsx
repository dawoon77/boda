import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Camera, X, Check } from 'lucide-react';
import { CommunityCategory, CommunityHighlight, CommunityPost, CommunityPostInput } from '../types';
import {
  CATEGORY_LABELS,
  STADIUMS,
  TEAMS_BY_RANK,
  SEAT_ZONES,
  GOODS_TYPES,
  UNIFORM_SIZES,
  REVIEW_HELPERS,
  ReviewHelper,
} from '../data/communityOptions';
import { BUTTONS, LAYOUT } from '../lib/styles';

const MAX_PHOTOS = 5; // 사진 최대 장수
const CATEGORIES: CommunityCategory[] = ['seat', 'food', 'goods', 'etc'];

// 동그란 선택 버튼(칩) 스타일: 선택됐으면 보라색
const chipClass = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
    active ? 'bg-brand text-white border-transparent' : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'
  }`;

// 입력 항목 하나의 이름표 + 내용 묶음
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#4e5968]">
        {label}
        {required && <span className="text-[#f04452] ml-0.5">*</span>}
      </p>
      {children}
    </div>
  );
}

// 콤보창: 기본 화살표를 숨기고(appearance-none) 직접 그린 화살표를 얹음
function SelectBox({ id, value, onChange, children }: { id: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${LAYOUT.input} appearance-none pr-10 cursor-pointer`}
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-[#8b95a1] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

interface CommunityWriteFormProps {
  initialCategory: CommunityCategory;           // 처음 선택되어 있을 카테고리 (보고 있던 탭)
  initialPost?: CommunityPost;                  // 수정할 글 (있으면 "글 수정" 모드: 기존 내용을 채워서 열림)
  favoriteTeamId: string;                       // 굿즈·기타의 구단 기본값
  onSubmit: (input: CommunityPostInput) => void; // 등록·수정 (id·작성자·날짜는 App에서 붙임)
  onBack: () => void;                           // 뒤로가기
}

export default function CommunityWriteForm({ initialCategory, initialPost, favoriteTeamId, onSubmit, onBack }: CommunityWriteFormProps) {
  const isEditMode = !!initialPost;
  // 수정 모드에서 기존 구역이 기본 구역 목록에 없으면 (예: 바베큐존) '기타' + 직접 입력으로 보여줌
  const initialZoneIsCustom = !!initialPost?.seatZone && !SEAT_ZONES.includes(initialPost.seatZone);

  const [category, setCategory] = useState<CommunityCategory>(initialPost?.category ?? initialCategory);

  // 좌석·음식 공통
  const [stadium, setStadium] = useState(initialPost?.stadium ?? '');
  // 좌석
  const [seatZone, setSeatZone] = useState(initialZoneIsCustom ? '기타' : initialPost?.seatZone ?? '');
  const [seatZoneCustom, setSeatZoneCustom] = useState(initialZoneIsCustom ? initialPost?.seatZone ?? '' : ''); // 구역에서 '기타'를 골랐을 때 직접 입력한 구역 (예: 바베큐존)
  const [seatBlock, setSeatBlock] = useState(initialPost?.seatBlock ?? '');
  const [seatRow, setSeatRow] = useState(initialPost?.seatRow ?? '');
  // 음식
  const [restaurant, setRestaurant] = useState(initialPost?.restaurant ?? '');
  const [menu, setMenu] = useState(initialPost?.menu ?? '');
  // 굿즈·기타 공통 (기타에서 ''는 "전체")
  const [teamId, setTeamId] = useState(initialPost ? initialPost.teamId ?? '' : favoriteTeamId);
  // 굿즈
  const [goodsType, setGoodsType] = useState(initialPost?.goodsType ?? '');
  const [productName, setProductName] = useState(initialPost?.productName ?? '');
  const [purchasePlace, setPurchasePlace] = useState(initialPost?.purchasePlace ?? '');
  const [size, setSize] = useState(initialPost?.size ?? '');
  // 제목
  const [title, setTitle] = useState(initialPost?.title ?? '');
  // 공통
  const [price, setPrice] = useState(initialPost?.price !== undefined ? String(initialPost.price) : '');
  const [content, setContent] = useState(initialPost?.content ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(initialPost?.imageUrls ?? []);
  const [highlights, setHighlights] = useState<CommunityHighlight[]>(initialPost?.highlights ?? []); // 한눈에 보기 배지
  const [openHelper, setOpenHelper] = useState<string | null>(null); // 선택지(또는 직접 입력칸)가 펼쳐진 도우미 항목 이름
  const [helperInput, setHelperInput] = useState('');                // 선택지 없는 항목(예: 내 체형)에 직접 입력 중인 내용
  const [errorText, setErrorText] = useState('');
  // 카테고리 이동 확인창: 이동하려는 카테고리 (null이면 확인창 닫힘)
  const [pendingCategory, setPendingCategory] = useState<CommunityCategory | null>(null);

  const helpers: ReviewHelper[] = category === 'etc' ? [] : REVIEW_HELPERS[category];
  const showPrice = category !== 'etc';

  // 작성 중인 내용이 하나라도 있는지 (구단은 기본값에서 바꿨을 때만 작성한 것으로 봄)
  const isDirty =
    [stadium, seatZone, seatZoneCustom, seatBlock, seatRow, restaurant, menu, goodsType, productName, purchasePlace, size, title, price, content]
      .some((value) => value.trim() !== '') ||
    imageUrls.length > 0 ||
    highlights.length > 0 ||
    teamId !== favoriteTeamId;

  // 이 화면에서 새로 고른 사진인지 (수정 모드의 기존 사진은 글에서 계속 쓰므로 임시 주소를 정리하면 안 됨)
  const isNewPhoto = (url: string) => url.startsWith('blob:') && !initialPost?.imageUrls.includes(url);

  // 모든 입력을 처음 상태로 되돌리고 새 카테고리로 바꾸기
  const resetForm = (next: CommunityCategory) => {
    imageUrls.filter(isNewPhoto).forEach((url) => URL.revokeObjectURL(url)); // 새로 고른 사진의 임시 주소 정리
    setCategory(next);
    setStadium('');
    setSeatZone('');
    setSeatZoneCustom('');
    setSeatBlock('');
    setSeatRow('');
    setRestaurant('');
    setMenu('');
    setTeamId(favoriteTeamId);
    setGoodsType('');
    setProductName('');
    setPurchasePlace('');
    setSize('');
    setTitle('');
    setPrice('');
    setContent('');
    setImageUrls([]);
    setHighlights([]);
    setOpenHelper(null);
    setHelperInput('');
    setErrorText('');
  };

  // 카테고리 버튼: 작성 중인 내용이 있으면 확인창, 없으면 바로 이동
  const handleCategoryClick = (next: CommunityCategory) => {
    if (next === category) return;
    if (isDirty) {
      setPendingCategory(next);
    } else {
      resetForm(next);
    }
  };

  // 후기 도우미: 고른 값을 한눈에 보기 배지로 추가 (같은 항목이 이미 있으면 값만 바꿈)
  //  - 배지 순서는 도우미 버튼 순서와 같게 맞춤
  const applyHelper = (helper: ReviewHelper, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const others = highlights.filter((h) => h.label !== helper.label);
    const next = [...others, { label: helper.label, value: trimmed }];
    const order = helpers.map((h) => h.label);
    next.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
    setHighlights(next);
    setOpenHelper(null);
    setHelperInput('');
    setErrorText('');
  };

  const removeHighlight = (label: string) => {
    setHighlights(highlights.filter((h) => h.label !== label));
  };

  // 도우미 버튼 누르기: 선택지(또는 직접 입력칸) 펼치기/접기
  const toggleHelper = (helper: ReviewHelper) => {
    if (openHelper === helper.label) {
      setOpenHelper(null);
      return;
    }
    setOpenHelper(helper.label);
    // 선택지 없는 항목은 이미 넣은 값이 있으면 입력칸에 채워서 고칠 수 있게
    setHelperInput(highlights.find((h) => h.label === helper.label)?.value ?? '');
  };

  // 사진 선택: 미리보기용 임시 주소(blob:)를 만들어 보관 (서버 업로드는 아직 없음)
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const room = MAX_PHOTOS - imageUrls.length;
    const urls = files.slice(0, room).map((file) => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...urls]);
    e.target.value = ''; // 같은 사진을 다시 고를 수 있게 초기화
  };

  const removePhoto = (url: string) => {
    if (isNewPhoto(url)) URL.revokeObjectURL(url); // 새로 고른 사진이면 임시 주소 정리
    setImageUrls(imageUrls.filter((u) => u !== url));
  };

  // 필수 입력 확인: 문제가 있으면 안내 문구, 없으면 빈 글자
  const validate = (): string => {
    if (title.trim().length < 2) return '제목을 2자 이상 입력해 주세요.';
    if (category === 'seat') {
      if (!stadium) return '구장을 선택해 주세요.';
      if (!seatZone) return '구역을 선택해 주세요.';
      if (seatZone === '기타' && !seatZoneCustom.trim()) return '구역 이름을 입력해 주세요.';
    }
    if (category === 'food') {
      if (!stadium) return '구장을 선택해 주세요.';
      if (!restaurant.trim()) return '음식점 이름을 입력해 주세요.';
      if (!menu.trim()) return '먹은 메뉴를 입력해 주세요.';
    }
    if (category === 'goods') {
      if (!teamId) return '구단을 선택해 주세요.';
      if (!goodsType) return '굿즈 종류를 선택해 주세요.';
      if (!productName.trim()) return '상품명을 입력해 주세요.';
      if (goodsType === '유니폼' && !size) return '사이즈를 선택해 주세요.';
      // 굿즈는 사진만 올려서 자랑해도 OK
      if (!content.trim() && imageUrls.length === 0 && highlights.length === 0) return '사진이나 후기 중 하나는 남겨주세요.';
    }
    // 좌석·음식: 한눈에 보기 배지만 골라도 OK, 아무것도 없으면 후기 5자 이상
    if ((category === 'seat' || category === 'food') && highlights.length === 0 && content.trim().length < 5) {
      return '한눈에 보기를 고르거나 후기를 5자 이상 입력해 주세요.';
    }
    if (category === 'etc' && content.trim().length < 5) return '내용을 5자 이상 입력해 주세요.';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 기본 동작(페이지 새로고침) 막기
    const error = validate();
    if (error) {
      setErrorText(error);
      return;
    }

    const priceValue = showPrice && price !== '' ? Number(price) : undefined;
    const base = {
      category,
      title: title.trim(),
      content: content.trim(),
      imageUrls,
      // 기타는 한눈에 보기가 없고, 하나도 안 골랐으면 저장하지 않음
      highlights: category !== 'etc' && highlights.length > 0 ? highlights : undefined,
    };

    // 카테고리별로 필요한 값만 담기
    let input: CommunityPostInput;
    switch (category) {
      case 'seat':
        input = {
          ...base,
          stadium,
          seatZone: seatZone === '기타' ? seatZoneCustom.trim() : seatZone, // '기타'면 직접 입력한 이름으로 저장
          seatBlock: seatBlock.trim(),
          seatRow: seatRow.trim(),
          price: priceValue,
        };
        break;
      case 'food':
        input = { ...base, stadium, restaurant: restaurant.trim(), menu: menu.trim(), price: priceValue };
        break;
      case 'goods':
        input = {
          ...base,
          teamId,
          goodsType,
          productName: productName.trim(),
          purchasePlace: purchasePlace.trim(),
          size: goodsType === '유니폼' ? size : undefined,
          price: priceValue,
        };
        break;
      default:
        input = { ...base, teamId: teamId || undefined };
    }
    onSubmit(input);
  };

  const openedHelper = helpers.find((h) => h.label === openHelper);

  return (
    <div id="community-write-form" className="absolute inset-0 z-20 bg-white flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <button
            id="btn-back-community-write"
            type="button"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">{isEditMode ? '글 수정' : '글쓰기'}</h2>
        </div>
        <div />
      </header>

      {/* noValidate: 브라우저 기본 검사(예: 가격이 100원 단위가 아니면 등록 막기)를 끄고 직접 검사(validate)만 사용 */}
      <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* 카테고리 선택 */}
          <Field label="카테고리" required>
            <div className="flex gap-1.5">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => handleCategoryClick(c)} className={chipClass(category === c)}>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </Field>

          {/* ── 제목 (모든 카테고리 공통) ── */}
          <Field label="제목" required>
            <input
              id="write-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrorText(''); }}
              placeholder={
                category === 'seat'
                  ? '예: 잠실 3루 외야, 노을 맛집이에요'
                  : category === 'food'
                    ? '예: 사직 가면 이가네 떡볶이는 꼭 드세요'
                    : category === 'goods'
                      ? '예: 먼작귀 콜라보 인형 데려왔어요'
                      : '제목을 입력해 주세요'
              }
              maxLength={50}
              className={LAYOUT.input}
            />
          </Field>

          {/* ── 좌석·음식: 구장 ── */}
          {(category === 'seat' || category === 'food') && (
            <Field label="구장" required>
              <SelectBox id="write-stadium" value={stadium} onChange={setStadium}>
                <option value="">구장을 선택해 주세요</option>
                {STADIUMS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </SelectBox>
            </Field>
          )}

          {/* ── 좌석: 구역 · 블록 · 열 ── */}
          {category === 'seat' && (
            <>
              <Field label="구역" required>
                <div className="flex flex-wrap gap-1.5">
                  {SEAT_ZONES.map((zone) => (
                    <button key={zone} type="button" onClick={() => { setSeatZone(zone); setErrorText(''); }} className={chipClass(seatZone === zone)}>
                      {zone}
                    </button>
                  ))}
                </div>
                {/* '기타'를 고르면 구역 이름 직접 입력 (예: 바베큐존, 익사이팅존) */}
                {seatZone === '기타' && (
                  <input
                    id="write-seat-zone-custom"
                    autoFocus
                    value={seatZoneCustom}
                    onChange={(e) => { setSeatZoneCustom(e.target.value); setErrorText(''); }}
                    placeholder="구역 이름을 입력해 주세요 (예: 바베큐존)"
                    maxLength={20}
                    className={`${LAYOUT.input} animate-fadeIn`}
                  />
                )}
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="블록">
                  <input value={seatBlock} onChange={(e) => setSeatBlock(e.target.value)} placeholder="예: 419" maxLength={10} className={LAYOUT.input} />
                </Field>
                <Field label="열">
                  <input value={seatRow} onChange={(e) => setSeatRow(e.target.value)} placeholder="예: 20" maxLength={10} className={LAYOUT.input} />
                </Field>
              </div>
            </>
          )}

          {/* ── 음식: 음식점 · 메뉴 ── */}
          {category === 'food' && (
            <>
              <Field label="음식점" required>
                <input value={restaurant} onChange={(e) => setRestaurant(e.target.value)} placeholder="예: 3루 쪽 분식 매장" maxLength={30} className={LAYOUT.input} />
              </Field>
              <Field label="먹은 메뉴" required>
                <input value={menu} onChange={(e) => setMenu(e.target.value)} placeholder="예: 떡볶이 + 어묵" maxLength={40} className={LAYOUT.input} />
              </Field>
            </>
          )}

          {/* ── 굿즈·기타: 구단 ── */}
          {(category === 'goods' || category === 'etc') && (
            <Field label={category === 'goods' ? '구단' : '대상'} required={category === 'goods'}>
              <SelectBox id="write-team" value={teamId} onChange={setTeamId}>
                <option value="">{category === 'goods' ? '구단을 선택해 주세요' : '전체 (구단 상관없음)'}</option>
                {TEAMS_BY_RANK.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </SelectBox>
            </Field>
          )}

          {/* ── 굿즈: 종류 · 상품명 · 사이즈 · 구매처 ── */}
          {category === 'goods' && (
            <>
              <Field label="종류" required>
                <div className="flex flex-wrap gap-1.5">
                  {GOODS_TYPES.map((type) => (
                    <button key={type} type="button" onClick={() => setGoodsType(type)} className={chipClass(goodsType === type)}>
                      {type}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="상품명" required>
                <input
                  value={productName}
                  onChange={(e) => { setProductName(e.target.value); setErrorText(''); }}
                  placeholder="예: 먼작귀 콜라보 인형, 서울 유니폼"
                  maxLength={40}
                  className={LAYOUT.input}
                />
              </Field>
              {goodsType === '유니폼' && (
                <Field label="사이즈" required>
                  <div className="flex flex-wrap gap-1.5">
                    {UNIFORM_SIZES.map((s) => (
                      <button key={s} type="button" onClick={() => setSize(s)} className={chipClass(size === s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
              <Field label="구매처">
                <input value={purchasePlace} onChange={(e) => setPurchasePlace(e.target.value)} placeholder="예: 구장 굿즈샵, 구단 공식 온라인몰" maxLength={30} className={LAYOUT.input} />
              </Field>
            </>
          )}

          {/* ── 가격 (기타 제외, 화살표·키보드 위아래로 100원씩) ── */}
          {showPrice && (
            <Field label="가격">
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="구매한 가격"
                  className={`${LAYOUT.input} pr-10`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8b95a1]">원</span>
              </div>
            </Field>
          )}

          {/* ── 사진 ── */}
          <Field label={`사진 (최대 ${MAX_PHOTOS}장)`}>
            <div className="flex gap-2 overflow-x-auto pt-1.5">
              {imageUrls.length < MAX_PHOTOS && (
                <label className="w-20 h-20 shrink-0 rounded-2xl border-2 border-dashed border-[#e5e8eb] hover:border-brand/40 flex flex-col items-center justify-center gap-0.5 text-[#8b95a1] cursor-pointer transition">
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] font-bold font-mono">{imageUrls.length}/{MAX_PHOTOS}</span>
                  <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                </label>
              )}
              {imageUrls.map((url, i) => (
                <div key={url} className="relative w-20 h-20 shrink-0">
                  <img src={url} alt={`첨부 사진 ${i + 1}`} className="w-20 h-20 rounded-2xl object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#191f28] text-white flex items-center justify-center cursor-pointer"
                    aria-label="사진 삭제"
                  >
                    <X className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </Field>

          {/* ── 한눈에 보기 (기타 제외): 고른 항목은 배지로 쌓임 → 상세 화면에도 같은 배지로 보임 ── */}
          {helpers.length > 0 && (
            <Field label="한눈에 보기">
              <p className="text-[11px] font-semibold text-[#8b95a1] -mt-1">항목을 누르고 골라주세요. 상세 화면 위쪽에 배지로 보여요.</p>

              {/* 항목 버튼 (이미 고른 항목은 ✓) */}
              <div className="flex flex-wrap gap-1.5">
                {helpers.map((helper) => {
                  const used = highlights.some((h) => h.label === helper.label);
                  const isOpen = openHelper === helper.label;
                  return (
                    <button
                      key={helper.label}
                      type="button"
                      onClick={() => toggleHelper(helper)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                        isOpen
                          ? 'border-brand text-brand bg-brand-light'
                          : used
                            ? 'border-brand/30 text-brand bg-white'
                            : 'border-[#e5e8eb] text-[#4e5968] bg-white hover:bg-[#f2f4f6]'
                      }`}
                    >
                      {used && <Check className="w-3 h-3 stroke-[3]" />}
                      {helper.label}
                    </button>
                  );
                })}
              </div>

              {/* 펼쳐진 항목: 선택지 버튼 또는 (선택지 없는 항목이면) 직접 입력칸 */}
              {openedHelper && (
                <div className="bg-[#f9fafb] rounded-2xl p-2.5 animate-fadeIn">
                  {openedHelper.options.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {openedHelper.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => applyHelper(openedHelper, option)}
                          className="px-3 py-1.5 rounded-full bg-white border border-[#e5e8eb] text-[11px] font-bold text-[#4e5968] hover:border-brand hover:text-brand transition cursor-pointer"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        id="write-helper-input"
                        autoFocus
                        value={helperInput}
                        onChange={(e) => setHelperInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault(); // 엔터로 글 전체가 등록되지 않게
                            applyHelper(openedHelper, helperInput);
                          }
                        }}
                        placeholder={`예: ${openedHelper.template ?? ''}`.trim()}
                        maxLength={30}
                        className="flex-1 min-w-0 bg-white border border-[#e5e8eb] focus:border-brand rounded-xl px-3 py-2 text-xs font-semibold text-[#191f28] focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => applyHelper(openedHelper, helperInput)}
                        disabled={!helperInput.trim()}
                        className="w-8 h-8 shrink-0 rounded-full bg-brand text-white flex items-center justify-center cursor-pointer disabled:bg-[#e5e8eb] disabled:text-[#b0b8c1] disabled:cursor-not-allowed"
                        aria-label="추가"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 고른 항목 배지 (상세 화면과 같은 모양, ✕로 빼기) */}
              {highlights.length > 0 && (
                <div id="write-highlights" className="flex flex-wrap gap-1">
                  {highlights.map((item) => (
                    <span key={item.label} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-[#f2f4f6] text-[11px]">
                      <span className="font-semibold text-[#8b95a1]">{item.label}</span>
                      <span className="font-bold text-[#333d4b]">{item.value}</span>
                      <button
                        type="button"
                        onClick={() => removeHighlight(item.label)}
                        className="ml-0.5 p-0.5 text-[#b0b8c1] hover:text-[#4e5968] cursor-pointer"
                        aria-label={`${item.label} 빼기`}
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          )}

          {/* ── 후기 / 내용 (직접 쓰는 글) ── */}
          <Field label={category === 'etc' ? '내용' : '후기'} required={category === 'etc'}>
            <textarea
              id="write-content"
              rows={8}
              maxLength={2000}
              value={content}
              onChange={(e) => { setContent(e.target.value); setErrorText(''); }}
              placeholder={
                category === 'etc'
                  ? '궁금한 점이나 하고 싶은 이야기를 자유롭게 남겨주세요.'
                  : category === 'goods'
                    ? '사진만 올려서 자랑해도 좋아요!'
                    : '어땠는지 자유롭게 남겨주세요.'
              }
              className={LAYOUT.textarea}
            />
            <p className="text-right text-[10px] text-[#8b95a1] font-bold font-mono">{content.length}/2000</p>
          </Field>

          {/* 입력 오류 안내 */}
          {errorText && (
            <div className="text-[#f04452] text-xs px-4 py-3 bg-[#feeef0] rounded-2xl font-bold flex items-center gap-2 animate-fadeIn">
              <span>⚠️</span>
              <span>{errorText}</span>
            </div>
          )}
        </main>

        {/* 하단 고정: 등록 버튼 */}
        <div className="shrink-0 border-t border-[#f2f4f6] p-4">
          <button id="btn-submit-community-post" type="submit" className={BUTTONS.primary}>
            {isEditMode ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>

      {/* 카테고리 이동 확인창 (작성 중인 내용이 있을 때만) */}
      {pendingCategory && (
        <div
          className="absolute inset-0 z-30 bg-[#191f28]/40 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setPendingCategory(null)} // 바깥 어두운 부분을 누르면 취소
        >
          <div
            id="category-change-dialog"
            className="w-full max-w-[300px] bg-white rounded-3xl p-5 space-y-4 shadow-lg"
            onClick={(e) => e.stopPropagation()} // 창 안쪽을 누를 때는 닫히지 않게
          >
            <div className="space-y-1.5 text-center">
              <p className="text-[15px] font-bold text-[#191f28]">
                {CATEGORY_LABELS[pendingCategory]}(으)로 이동할까요?
              </p>
              <p className="text-xs font-semibold text-[#8b95a1] leading-relaxed">
                이동하면 작성 중인 내용이 모두 초기화돼요.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-cancel-category-change"
                type="button"
                onClick={() => setPendingCategory(null)}
                className="h-11 rounded-2xl bg-[#f2f4f6] hover:bg-[#e5e8eb] text-[13px] font-bold text-[#4e5968] transition cursor-pointer"
              >
                취소
              </button>
              <button
                id="btn-confirm-category-change"
                type="button"
                onClick={() => {
                  resetForm(pendingCategory);
                  setPendingCategory(null);
                }}
                className="h-11 rounded-2xl bg-brand hover:bg-brand-hover text-white text-[13px] font-bold transition cursor-pointer"
              >
                이동하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
