import React, { useRef, useState } from 'react';
import { Search, X, Pencil, Heart, MessageCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CommunityPost, CommunityCategory, CommunityPostInput, CommentReply } from '../types';
import {
  CATEGORY_TABS,
  CATEGORY_LABELS,
  CATEGORY_BADGE_CLASS,
  STADIUMS,
  TEAMS_BY_RANK,
  getTeamStadium,
  getPostHeadline,
  getPostSubtitle,
  formatPostDate,
} from '../data/communityOptions';
import CommunityPostDetail from './CommunityPostDetail';
import CommunityWriteForm from './CommunityWriteForm';

type TabKey = 'all' | CommunityCategory;

const PAGE_SIZE = 10; // 한 페이지에 보여줄 글 수

interface CommunityTabProps {
  posts: CommunityPost[];                                  // 전체 글 목록
  myNickname: string;                                      // 내 닉네임 (상세 화면에서 내 댓글 표시용)
  favoriteTeamId: string;                                  // 글쓰기에서 구단 기본값
  onCreatePost: (input: CommunityPostInput) => void;       // 글 등록
  onUpdatePost: (postId: string, input: CommunityPostInput) => void; // 내 글 수정
  onDeletePost: (postId: string) => void;                  // 내 글 삭제
  onToggleLike: (postId: string) => void;                  // 좋아요 누르기/취소
  onAddComment: (postId: string, content: string, reply?: CommentReply) => void; // 댓글·답글 등록
  onEditComment: (postId: string, commentId: string, content: string) => void;   // 내 댓글 수정
  onDeleteComment: (postId: string, commentId: string) => void;                 // 내 댓글 삭제
}

// 날짜 비교용 숫자 (최신순 정렬에 사용)
const postTime = (post: CommunityPost) => new Date(post.createdAt).getTime();

// 목록의 좋아요·댓글 수 표시: 1000 이상은 "1k", "12k"처럼 줄여서 세 글자 칸을 넘지 않게
const formatCount = (count: number) => (count >= 1000 ? `${Math.floor(count / 1000)}k` : String(count));

export default function CommunityTab({
  posts,
  myNickname,
  favoriteTeamId,
  onCreatePost,
  onUpdatePost,
  onDeletePost,
  onToggleLike,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: CommunityTabProps) {
  const [tab, setTab] = useState<TabKey>('all');                       // 선택한 카테고리 탭
  const [placeFilter, setPlaceFilter] = useState('all');               // 구장 이름 또는 구단 id ('all' = 전체)
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');    // 정렬
  const [keyword, setKeyword] = useState('');                          // 검색어
  const [onlyMine, setOnlyMine] = useState(false);                     // 내 글만 보기 (탭을 바꿔도 유지)
  const [isSearchOpen, setIsSearchOpen] = useState(false);             // 검색창 열림 여부
  const [page, setPage] = useState(1);                                 // 현재 페이지 (1부터 시작)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null); // 상세로 보고 있는 글 id
  const [isWriting, setIsWriting] = useState(false);                   // 글쓰기 화면 열림 여부
  const [editingPostId, setEditingPostId] = useState<string | null>(null); // 수정 중인 글 id (있으면 글 수정 화면)

  const listRef = useRef<HTMLElement>(null); // 페이지를 바꾸면 목록을 맨 위로 올리기 위한 참조

  // 탭에 따라 콤보창(필터) 기준이 바뀜
  //  - 좌석·음식: 구장
  //  - 굿즈·기타: 구단
  //  - 전체: 구단 (그 구단의 굿즈·기타 글 + 그 구단 홈구장의 좌석·음식 글)
  const filterType: 'stadium' | 'team' = tab === 'seat' || tab === 'food' ? 'stadium' : 'team';

  // 탭·필터·정렬·검색이 바뀌면 1페이지부터 다시 보여줌
  const changeTab = (next: TabKey) => {
    setTab(next);
    setPlaceFilter('all'); // 탭이 바뀌면 필터 기준도 바뀌니 초기화
    setPage(1);
  };
  const changePlaceFilter = (value: string) => {
    setPlaceFilter(value);
    setPage(1);
  };
  const changeSort = (value: 'latest' | 'popular') => {
    setSort(value);
    setPage(1);
  };
  const changeKeyword = (value: string) => {
    setKeyword(value);
    setPage(1);
  };
  const toggleOnlyMine = () => {
    setOnlyMine(!onlyMine);
    setPage(1);
  };

  const toggleSearch = () => {
    if (isSearchOpen) changeKeyword(''); // 검색창을 닫으면 검색어도 지우기
    setIsSearchOpen(!isSearchOpen);
  };

  // 콤보창 조건에 맞는 글인지 확인
  const matchesPlace = (post: CommunityPost) => {
    if (placeFilter === 'all') return true;
    if (filterType === 'stadium') return post.stadium === placeFilter;
    if (tab === 'all') {
      // 전체 탭: 구단 글(굿즈·기타)이거나, 그 구단 홈구장 글(좌석·음식)이면 보여줌
      return post.teamId === placeFilter || (!!post.stadium && post.stadium === getTeamStadium(placeFilter));
    }
    return post.teamId === placeFilter;
  };

  // 보여줄 글: ① 카테고리 → ② 구장/구단 → ③ 내 글만 → ④ 검색어 → ⑤ 정렬 순서로 걸러내기
  const searchText = keyword.trim().toLowerCase();
  const visiblePosts = posts
    .filter((post) => tab === 'all' || post.category === tab)
    .filter(matchesPlace)
    .filter((post) => !onlyMine || post.author === myNickname)
    .filter((post) => {
      if (!searchText) return true;
      return [
        post.title,
        post.content,
        post.restaurant,
        post.menu,
        post.goodsType,
        post.productName,
        post.purchasePlace,
        post.stadium,
        ...(post.highlights ?? []).map((h) => h.value), // 한눈에 보기 값도 검색 (예: "응원석")
      ].some((text) => text?.toLowerCase().includes(searchText));
    })
    .sort((a, b) =>
      sort === 'popular'
        ? b.likeCount - a.likeCount || postTime(b) - postTime(a) // 좋아요 같으면 최신 글 먼저
        : postTime(b) - postTime(a),
    );

  // 페이지 나누기: 전체 글을 10개씩 잘라서 현재 페이지 몫만 보여줌
  const totalPages = Math.max(1, Math.ceil(visiblePosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // 글이 줄어서 페이지가 사라진 경우 대비
  const pagePosts = visiblePosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(next);
    listRef.current?.scrollTo({ top: 0 }); // 새 페이지는 맨 위부터 보이게
  };

  // 상세로 보고 있는 글 (좋아요·댓글이 바뀌면 최신 내용이 반영되도록 id로 다시 찾음)
  const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null;
  const editingPost = posts.find((post) => post.id === editingPostId) ?? null;

  return (
    <div id="community-tab" className="absolute inset-0 z-40 bg-[#f2f4f6] flex flex-col">
      {/* 상단: 제목 + 검색 + 카테고리 탭 + 필터·정렬 */}
      <header className="bg-white px-5 pt-4 pb-3 border-b border-[#f2f4f6] shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-[#191f28] tracking-tight">커뮤니티</span>
          <button
            id="btn-community-search"
            onClick={toggleSearch}
            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-xl transition cursor-pointer"
            aria-label={isSearchOpen ? '검색 닫기' : '검색'}
          >
            {isSearchOpen ? <X className="w-5 h-5 stroke-[2.2]" /> : <Search className="w-5 h-5 stroke-[2.2]" />}
          </button>
        </div>

        {/* 검색창 */}
        {isSearchOpen && (
          <input
            id="community-search-input"
            autoFocus
            value={keyword}
            onChange={(e) => changeKeyword(e.target.value)}
            placeholder="제목, 내용, 메뉴, 상품명 검색"
            className="w-full bg-[#f2f4f6] focus:bg-white border border-transparent focus:border-brand rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#191f28] focus:outline-none transition animate-fadeIn"
          />
        )}

        {/* 카테고리 탭 */}
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORY_TABS.map(({ key, label }) => (
            <button
              key={key}
              id={`community-tab-${key}`}
              onClick={() => changeTab(key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                tab === key ? 'bg-brand text-white border-transparent' : 'bg-white text-[#4e5968] border-[#e5e8eb] hover:bg-[#f2f4f6]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 구장/구단 콤보창 (2025 순위 순) + 정렬 + 내 글만 보기 */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative min-w-0 flex-1">
            <select
              id="community-place-filter"
              value={placeFilter}
              onChange={(e) => changePlaceFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-[#e5e8eb] hover:border-[#d1d6db] focus:border-brand rounded-xl pl-3.5 pr-8 py-1.5 text-xs font-bold text-[#191f28] focus:outline-none cursor-pointer transition truncate"
            >
              <option value="all">{filterType === 'stadium' ? '전체 구장' : '전체 구단'}</option>
              {filterType === 'stadium'
                ? STADIUMS.map((s) => <option key={s} value={s}>{s}</option>)
                : TEAMS_BY_RANK.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            {/* appearance-none으로 기본 화살표를 숨기고 직접 그린 화살표 */}
            <ChevronDown className="w-3.5 h-3.5 text-[#8b95a1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex bg-[#f2f4f6] rounded-xl p-0.5 shrink-0">
            {(['latest', 'popular'] as const).map((s) => (
              <button
                key={s}
                id={`community-sort-${s}`}
                onClick={() => changeSort(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  sort === s ? 'bg-white text-[#191f28] shadow-xs' : 'text-[#8b95a1]'
                }`}
              >
                {s === 'latest' ? '최신순' : '인기순'}
              </button>
            ))}
          </div>

          {/* 내 글만 보기: 켜지면 보라색 */}
          <button
            id="community-only-mine"
            onClick={toggleOnlyMine}
            aria-pressed={onlyMine}
            className={`shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
              onlyMine ? 'bg-brand text-white border-transparent' : 'bg-white text-[#8b95a1] border-[#e5e8eb] hover:text-[#4e5968]'
            }`}
          >
            내 글
          </button>
        </div>
      </header>

      {/* 글 목록 (pb-24: 글쓰기 버튼에 페이지 번호가 가리지 않게 아래 여백) */}
      <main ref={listRef} className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {visiblePosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e5e8eb] py-14 text-center space-y-1">
            <p className="text-xs font-bold text-[#4e5968]">
              {searchText ? '검색 결과가 없어요' : onlyMine ? '아직 내가 쓴 글이 없어요' : '아직 글이 없어요'}
            </p>
            <p className="text-[10px] font-semibold text-[#8b95a1]">첫 글을 남겨보세요!</p>
          </div>
        ) : (
          <>
            {/* 두 줄짜리 목록: 1줄 = 카테고리 + 제목, 2줄 = 카테고리별 핵심 정보 + 좋아요·댓글·날짜 */}
            <ul className="bg-white rounded-3xl border border-[#e5e8eb] overflow-hidden">
              {pagePosts.map((post) => {
                const subInfo = getPostSubtitle(post); // 가격은 상세 화면에서만 보여줌
                return (
                  <li key={post.id} className="border-b border-[#f2f4f6] last:border-b-0">
                    <button
                      id={`community-post-${post.id}`}
                      onClick={() => setSelectedPostId(post.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f9fafb] transition cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        {/* 1줄: 카테고리 배지 + 제목 */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${CATEGORY_BADGE_CLASS[post.category]}`}>
                            {CATEGORY_LABELS[post.category]}
                          </span>
                          {/* 내가 쓴 글 표시 (보라색 테두리 배지) */}
                          {post.author === myNickname && (
                            <span className="text-[10px] font-bold px-1.5 py-[1px] rounded-md shrink-0 border border-brand/40 text-brand">
                              내 글
                            </span>
                          )}
                          <p className="text-[13px] font-bold text-[#191f28] truncate">{getPostHeadline(post)}</p>
                        </div>
                        {/* 2줄: 카테고리별 핵심 정보 (왼쪽) + 좋아요·댓글·날짜 (오른쪽) */}
                        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-[#8b95a1]">
                          <span className="truncate">{subInfo}</span>
                          {/* tabular-nums: 숫자를 모두 같은 폭으로 그림 / w-[38px]: 세 자리 숫자 + 약간의 여백이 들어가는 칸 너비 → 자릿수가 달라도 위치가 같음 */}
                          <span className="flex items-center shrink-0 tabular-nums">
                            <span className={`w-[38px] flex items-center gap-0.5 ${post.likedByMe ? 'text-[#f04452]' : ''}`}>
                              <Heart className={`w-3 h-3 shrink-0 ${post.likedByMe ? 'fill-[#f04452]' : ''}`} />
                              {formatCount(post.likeCount)}
                            </span>
                            {/* 댓글 칸은 두 자리까지 맞춘 너비 (세 자리 댓글은 드물어서 날짜와 가깝게) */}
                            <span className="w-[30px] flex items-center gap-0.5">
                              <MessageCircle className="w-3 h-3 shrink-0" />
                              {formatCount(post.comments.filter((c) => !c.isDeleted).length)}
                            </span>
                            {/* 날짜는 좋아요·댓글과 구분되도록 세로선으로 나눔 */}
                            <span className="ml-1 pl-1 border-l border-[#e5e8eb]">{formatPostDate(post.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* 페이지 번호 (2페이지 이상일 때만) */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 pt-1" aria-label="페이지 이동">
                <button
                  id="community-page-prev"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#4e5968] hover:bg-white disabled:text-[#d1d6db] disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="이전 페이지"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    id={`community-page-${n}`}
                    onClick={() => goToPage(n)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition cursor-pointer ${
                      n === currentPage ? 'bg-brand text-white' : 'text-[#4e5968] hover:bg-white'
                    }`}
                    aria-current={n === currentPage ? 'page' : undefined}
                  >
                    {n}
                  </button>
                ))}
                <button
                  id="community-page-next"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#4e5968] hover:bg-white disabled:text-[#d1d6db] disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="다음 페이지"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      {/* 오른쪽 아래 글쓰기 버튼 */}
      <button
        id="btn-community-write"
        onClick={() => setIsWriting(true)}
        className="absolute bottom-5 right-5 z-10 w-12 h-12 bg-brand text-white shadow-md hover:bg-[#4314c4] active:scale-95 rounded-full flex items-center justify-center transition cursor-pointer"
        aria-label="글쓰기"
      >
        <Pencil className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 글 상세 (목록 위에 겹쳐서 표시) */}
      {selectedPost && (
        <CommunityPostDetail
          post={selectedPost}
          myNickname={myNickname}
          onBack={() => setSelectedPostId(null)}
          onToggleLike={() => onToggleLike(selectedPost.id)}
          onAddComment={(content, reply) => onAddComment(selectedPost.id, content, reply)}
          onEditComment={(commentId, content) => onEditComment(selectedPost.id, commentId, content)}
          onDeleteComment={(commentId) => onDeleteComment(selectedPost.id, commentId)}
          onEditPost={() => setEditingPostId(selectedPost.id)}
          onDeletePost={() => {
            onDeletePost(selectedPost.id);
            setSelectedPostId(null); // 지운 글의 상세 화면 닫기
          }}
        />
      )}

      {/* 글 수정 (상세 화면 위에 겹쳐서 표시, 수정하면 상세 화면으로 돌아감) */}
      {editingPost && (
        <CommunityWriteForm
          initialCategory={editingPost.category}
          initialPost={editingPost}
          favoriteTeamId={favoriteTeamId}
          onSubmit={(input) => {
            onUpdatePost(editingPost.id, input);
            setEditingPostId(null);
          }}
          onBack={() => setEditingPostId(null)}
        />
      )}

      {/* 글쓰기 (목록 위에 겹쳐서 표시) */}
      {isWriting && (
        <CommunityWriteForm
          initialCategory={tab === 'all' ? 'seat' : tab}
          favoriteTeamId={favoriteTeamId}
          onSubmit={(input) => {
            onCreatePost(input);
            setIsWriting(false);
            changeTab(input.category); // 방금 쓴 글이 보이도록 그 카테고리 탭 1페이지로 이동
            setSort('latest');
            setKeyword('');
            setIsSearchOpen(false);
          }}
          onBack={() => setIsWriting(false)}
        />
      )}
    </div>
  );
}
