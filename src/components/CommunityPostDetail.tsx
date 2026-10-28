import React, { useRef, useState } from 'react';
import { ChevronLeft, Heart, MessageCircle, Send, X, Check, CornerDownRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { CommunityPost, CommunityComment, CommentReply } from '../types';
import {
  CATEGORY_LABELS,
  CATEGORY_BADGE_CLASS,
  getSeatText,
  getPostHeadline,
  getPostSubtitle,
  getTeamName,
  formatPostDate,
  formatPrice,
} from '../data/communityOptions';

interface CommunityPostDetailProps {
  post: CommunityPost;                                            // 보여줄 글
  myNickname: string;                                             // 내 닉네임 (내 글·댓글 확인용)
  onBack: () => void;                                             // 뒤로가기 (목록으로)
  onToggleLike: () => void;                                       // 좋아요 누르기/취소
  onAddComment: (content: string, reply?: CommentReply) => void;  // 댓글 등록 (reply가 있으면 답글)
  onEditComment: (commentId: string, content: string) => void;    // 내 댓글 수정
  onDeleteComment: (commentId: string) => void;                   // 내 댓글 삭제
  onEditPost: () => void;                                         // 내 글 수정 (글 수정 화면 열기)
  onDeletePost: () => void;                                       // 내 글 삭제
}

// 카테고리별로 정보 표에 보여줄 [항목, 값] 목록 (값이 없는 항목은 빼고 보여줌)
function getInfoRows(post: CommunityPost): { label: string; value: string }[] {
  const rows: { label: string; value: string | undefined }[] = [];
  if (post.category === 'seat') {
    rows.push(
      { label: '구장', value: post.stadium },
      { label: '자리', value: getSeatText(post) },
      { label: '가격', value: formatPrice(post.price) },
    );
  }
  if (post.category === 'food') {
    rows.push(
      { label: '구장', value: post.stadium },
      { label: '음식점', value: post.restaurant },
      { label: '메뉴', value: post.menu },
      { label: '가격', value: formatPrice(post.price) },
    );
  }
  if (post.category === 'goods') {
    rows.push(
      { label: '구단', value: getTeamName(post.teamId) },
      { label: '상품명', value: post.productName },
      { label: '종류', value: post.goodsType },
      { label: '사이즈', value: post.size },
      { label: '구매처', value: post.purchasePlace },
      { label: '가격', value: formatPrice(post.price) },
    );
  }
  // 값이 비어 있는 줄 제거
  return rows.filter((row): row is { label: string; value: string } => !!row.value);
}

type DeleteTarget = { kind: 'post' } | { kind: 'comment'; id: string };

export default function CommunityPostDetail({
  post,
  myNickname,
  onBack,
  onToggleLike,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onEditPost,
  onDeletePost,
}: CommunityPostDetailProps) {
  const [comment, setComment] = useState('');                                    // 입력 중인 댓글
  const [replyTarget, setReplyTarget] = useState<CommentReply | null>(null);       // 답글 대상 (null이면 일반 댓글)
  const inputRef = useRef<HTMLInputElement>(null);                                // 답글 달기를 누르면 입력칸에 커서 두기
  const [editingId, setEditingId] = useState<string | null>(null);                // 수정 중인 댓글 id
  const [editText, setEditText] = useState('');                                   // 수정 중인 댓글 내용
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);    // 삭제 확인창 대상 (글 또는 댓글)
  const [isMenuOpen, setIsMenuOpen] = useState(false);                            // 내 글 ⋮ 메뉴 열림 여부
  const [photoIndex, setPhotoIndex] = useState(0);                                // 지금 보고 있는 사진 번호 (0부터)

  const isMyPost = post.author === myNickname;
  const headline = getPostHeadline(post);
  const infoRows = getInfoRows(post);
  const summary = post.highlights ?? []; // 한눈에 보기 배지
  const body = post.content;             // 직접 쓴 후기

  // 원래 댓글 / 답글 나누기 (답글은 원래 댓글 아래에 작성 순서대로)
  const rootComments = post.comments.filter((c) => !c.parentId);
  const repliesOf = (commentId: string) => post.comments.filter((c) => c.parentId === commentId);
  const commentCount = post.comments.filter((c) => !c.isDeleted).length; // 삭제된 댓글은 세지 않음

  // 사진을 옆으로 넘기면 몇 번째 사진인지 계산
  //  - 얼마나 넘겼는지 비율(0 = 맨 앞, 1 = 맨 끝)을 사진 번호로 바꿈
  //  - 마지막 사진은 화면 왼쪽 끝까지 넘어가지 않아서, 너비로 나누는 방식 대신 비율로 계산
  const handlePhotoScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = el.scrollLeft / maxScroll;
    setPhotoIndex(Math.round(ratio * (post.imageUrls.length - 1)));
  };

  // 답글 달기: 답글에 답글을 달아도 같은 원래 댓글 아래에 붙도록 parentId는 원래 댓글 id로
  const startReply = (target: CommunityComment) => {
    setReplyTarget({ parentId: target.parentId ?? target.id, mentionTo: target.author });
    inputRef.current?.focus();
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 기본 동작(페이지 새로고침) 막기
    const text = comment.trim();
    if (!text) return;
    onAddComment(text, replyTarget ?? undefined);
    setComment('');
    setReplyTarget(null);
  };

  // 댓글 수정 시작: 말풍선이 입력칸으로 바뀜 (답글 작성 중이었다면 취소)
  const startEdit = (c: CommunityComment) => {
    setEditingId(c.id);
    setEditText(c.content);
    setReplyTarget(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (c: CommunityComment) => {
    const text = editText.trim();
    if (!text) return;
    if (text !== c.content) onEditComment(c.id, text); // 바뀐 게 없으면 저장하지 않음
    cancelEdit();
  };

  // 삭제 확인창에서 [삭제]를 눌렀을 때
  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'post') {
      setDeleteTarget(null);
      onDeletePost();
      return;
    }
    onDeleteComment(deleteTarget.id);
    // 지운 댓글에 답글을 쓰던 중이었다면 답글 작성 취소
    if (replyTarget?.parentId === deleteTarget.id) setReplyTarget(null);
    setDeleteTarget(null);
  };

  // 댓글 한 개 그리기: 말풍선 배경 (내가 쓴 댓글만 조금 더 진한 회색) + 답글이면 앞에 @닉네임
  const renderComment = (c: CommunityComment) => {
    // 삭제된 댓글 (답글이 남아 있어서 자리만 남은 경우)
    if (c.isDeleted) {
      return (
        <div className="rounded-2xl px-3.5 py-3 bg-[#f2f4f6]">
          <p className="text-xs font-medium text-[#8b95a1]">삭제된 댓글입니다.</p>
        </div>
      );
    }

    const isMine = c.author === myNickname;
    const isEditing = editingId === c.id;

    return (
      <div className={`rounded-2xl px-3.5 py-3 space-y-0.5 ${isMine ? 'bg-[#e5e8eb]' : 'bg-[#f2f4f6]'}`}>
        <p className="text-[11px] font-bold text-[#191f28]">
          {c.author}
          <span className="font-semibold text-[#8b95a1] ml-1.5">{formatPostDate(c.createdAt, true)}</span>
          {c.editedAt && <span className="font-semibold text-[#8b95a1] ml-1">(수정됨)</span>}
        </p>

        {isEditing ? (
          // 수정 중: 입력칸 + 작은 ✕ / ✓ 버튼
          <div className="flex items-end gap-1.5 pt-1">
            <textarea
              id="comment-edit-input"
              autoFocus
              rows={2}
              maxLength={300}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 min-w-0 bg-white border border-[#e5e8eb] focus:border-brand rounded-xl px-3 py-2 text-xs font-medium text-[#191f28] focus:outline-none resize-none transition"
            />
            <button
              id="btn-cancel-comment-edit"
              type="button"
              onClick={cancelEdit}
              className="w-7 h-7 shrink-0 rounded-full bg-white border border-[#e5e8eb] text-[#8b95a1] hover:text-[#4e5968] flex items-center justify-center cursor-pointer transition"
              aria-label="수정 취소"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <button
              id="btn-save-comment-edit"
              type="button"
              onClick={() => saveEdit(c)}
              disabled={!editText.trim()}
              className="w-7 h-7 shrink-0 rounded-full bg-brand text-white flex items-center justify-center cursor-pointer transition disabled:bg-[#e5e8eb] disabled:text-[#b0b8c1] disabled:cursor-not-allowed"
              aria-label="수정 저장"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-medium text-[#4e5968] leading-relaxed whitespace-pre-line">
              {c.mentionTo && <span className="font-bold text-brand mr-1">@{c.mentionTo}</span>}
              {c.content}
            </p>
            {/* 답글 달기 (+ 내 댓글이면 수정·삭제) */}
            <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#8b95a1]">
              <button type="button" onClick={() => startReply(c)} className="hover:text-brand transition cursor-pointer">
                답글 달기
              </button>
              {isMine && (
                <>
                  <button type="button" onClick={() => startEdit(c)} className="hover:text-[#4e5968] transition cursor-pointer">
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ kind: 'comment', id: c.id })}
                    className="hover:text-[#f04452] transition cursor-pointer"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div id="community-post-detail" className="absolute inset-0 z-20 bg-white flex flex-col animate-fadeIn">
      {/* 상단 헤더: 뒤로가기 + 제목 + (내 글이면) ⋮ 메뉴 */}
      <header className="bg-white px-6 py-4 border-b border-zinc-100 shrink-0 grid grid-cols-3 items-center relative">
        <div className="flex justify-start">
          <button
            id="btn-back-community-detail"
            onClick={onBack}
            className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          </button>
        </div>
        <div className="flex justify-center">
          <h2 className="text-[16px] font-bold text-[#191f28] whitespace-nowrap">게시글</h2>
        </div>
        <div className="flex justify-end">
          {isMyPost && (
            <button
              id="btn-post-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#8b95a1] hover:text-[#4e5968] hover:bg-[#f2f4f6] p-1.5 rounded-full transition cursor-pointer"
              aria-label="글 메뉴"
            >
              <MoreVertical className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* ⋮ 메뉴: 수정 / 삭제 */}
        {isMenuOpen && (
          <div className="absolute right-5 top-14 z-40 w-32 bg-white rounded-2xl border border-[#e5e8eb] shadow-lg py-1.5 animate-fadeIn">
            <button
              id="btn-edit-post"
              onClick={() => {
                setIsMenuOpen(false);
                onEditPost();
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-[#191f28] hover:bg-[#f9fafb] cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-[#8b95a1]" />
              수정하기
            </button>
            <button
              id="btn-delete-post"
              onClick={() => {
                setIsMenuOpen(false);
                setDeleteTarget({ kind: 'post' });
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-[#f04452] hover:bg-[#fef3f4] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              삭제하기
            </button>
          </div>
        )}
      </header>
      {/* 메뉴 바깥을 누르면 메뉴 닫기 */}
      {isMenuOpen && <div className="absolute inset-0 z-30" onClick={() => setIsMenuOpen(false)} />}

      <main className="flex-1 overflow-y-auto">
        <article className="px-5 pt-5 pb-6 space-y-5">
          {/* 1. 카테고리 · 제목 · 작성자 */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${CATEGORY_BADGE_CLASS[post.category]}`}>
                {CATEGORY_LABELS[post.category]}
              </span>
              {/* 내가 쓴 글 표시 (목록과 같은 위치·모양) */}
              {isMyPost && (
                <span className="text-[10px] font-bold px-1.5 py-[1px] rounded-md shrink-0 border border-brand/40 text-brand">
                  내 글
                </span>
              )}
              <span className="text-[11px] font-semibold text-[#8b95a1] truncate">{getPostSubtitle(post)}</span>
            </div>
            {headline && <h3 className="text-[19px] font-bold text-[#191f28] leading-snug">{headline}</h3>}
            <div className="flex items-center gap-2.5">
              {/* 프로필 사진 대신 닉네임 첫 글자 */}
              <div className="w-8 h-8 rounded-full bg-brand-light text-brand flex items-center justify-center text-xs font-black shrink-0">
                {post.author.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#191f28] truncate">{post.author}</p>
                <p className="text-[11px] font-semibold text-[#8b95a1]">
                  {formatPostDate(post.createdAt, true)}
                  {post.editedAt && ' · 수정됨'}
                </p>
              </div>
            </div>
          </div>

          {/* 2. 정보 상자 (구장·자리·가격 등, 가격은 보라색으로 강조) */}
          {infoRows.length > 0 && (
            <div className="bg-[#f9fafb] rounded-2xl p-4 space-y-2">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-[#8b95a1] shrink-0">{row.label}</span>
                  <span className={`text-xs font-bold text-right ${row.label === '가격' ? 'text-brand' : 'text-[#191f28]'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 3. 한눈에 보기 (후기 도우미로 넣은 항목들) */}
          {summary.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-[#4e5968]">한눈에 보기</p>
              <div className="flex flex-wrap gap-1">
                {summary.map((item) => (
                  <span key={item.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f2f4f6] text-[11px]">
                    <span className="font-semibold text-[#8b95a1]">{item.label}</span>
                    <span className="font-bold text-[#333d4b]">{item.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 4. 사진: 작은 사진을 옆으로 넘겨보기 (여러 장이면 몇 번째인지 표시) */}
          {post.imageUrls.length > 0 && (
            <div className="relative -mx-5">
              {/* scroll-px-5: 사진이 멈출 때 본문과 같은 왼쪽 여백(20px)에 맞춰 멈추게 함 */}
              <div onScroll={handlePhotoScroll} className="flex gap-2 overflow-x-auto snap-x snap-mandatory px-5 scroll-px-5">
                {post.imageUrls.map((url, i) => (
                  <img
                    key={url}
                    src={url}
                    alt={`첨부 사진 ${i + 1}`}
                    className="w-56 h-56 rounded-2xl object-cover shrink-0 snap-start bg-[#f2f4f6]"
                  />
                ))}
              </div>
              {post.imageUrls.length > 1 && (
                <p className="px-5 pt-1.5 text-[11px] font-bold text-[#8b95a1]">
                  {photoIndex + 1} / {post.imageUrls.length} · 옆으로 넘겨보세요
                </p>
              )}
            </div>
          )}

          {/* 5. 본문 */}
          {body && <p className="text-[14px] font-medium text-[#333d4b] leading-7 whitespace-pre-line">{body}</p>}

          {/* 6. 좋아요 + 댓글 수 */}
          <div className="flex items-center gap-2 pt-1">
            <button
              id="btn-like-post"
              onClick={onToggleLike}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer ${
                post.likedByMe
                  ? 'border-[#f04452]/30 bg-[#feeef0] text-[#f04452]'
                  : 'border-[#e5e8eb] text-[#4e5968] hover:bg-[#f2f4f6]'
              }`}
            >
              <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-[#f04452]' : ''}`} />
              좋아요 {post.likeCount}
            </button>
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#e5e8eb] text-xs font-bold text-[#4e5968]">
              <MessageCircle className="w-4 h-4" />
              댓글 {commentCount}
            </span>
          </div>
        </article>

        {/* 7. 댓글 목록 */}
        <section className="border-t-8 border-[#f2f4f6] px-5 py-4 space-y-3">
          <p className="text-xs font-bold text-[#191f28] flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            댓글 {commentCount}
          </p>
          {post.comments.length === 0 ? (
            <p className="text-[11px] font-semibold text-[#8b95a1] text-center py-6">첫 댓글을 남겨보세요.</p>
          ) : (
            <ul className="space-y-3">
              {rootComments.map((c) => {
                const replies = repliesOf(c.id);
                return (
                  <li key={c.id} className="space-y-2">
                    {renderComment(c)}
                    {/* 답글: ↳ 화살표 + 들여쓰기 */}
                    {replies.length > 0 && (
                      <ul className="space-y-2">
                        {replies.map((r) => (
                          <li key={r.id} className="flex gap-1.5 pl-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-[#c4cad1] mt-3 shrink-0" />
                            <div className="min-w-0 flex-1">{renderComment(r)}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* 답글 다는 중 안내 (✕를 누르면 일반 댓글로 돌아감) */}
      {replyTarget && (
        <div
          id="reply-target-banner"
          className="shrink-0 flex items-center justify-between px-4 py-2 bg-[#f9fafb] border-t border-[#f2f4f6] text-[11px] font-bold text-[#4e5968] animate-fadeIn"
        >
          <span>
            <span className="text-brand">@{replyTarget.mentionTo}</span>님에게 답글 남기는 중
          </span>
          <button
            id="btn-cancel-reply"
            type="button"
            onClick={() => setReplyTarget(null)}
            className="p-1 text-[#8b95a1] hover:text-[#4e5968] cursor-pointer"
            aria-label="답글 취소"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* 하단 고정: 댓글 입력 */}
      <form
        onSubmit={handleSubmitComment}
        className="shrink-0 border-t border-[#f2f4f6] bg-white px-4 py-3 flex items-center gap-2"
      >
        <input
          id="community-comment-input"
          ref={inputRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={300}
          placeholder={replyTarget ? `@${replyTarget.mentionTo}님에게 답글을 남겨보세요` : '댓글을 남겨보세요'}
          className="flex-1 bg-[#f2f4f6] focus:bg-white border border-transparent focus:border-brand rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#191f28] focus:outline-none transition"
        />
        <button
          id="btn-submit-comment"
          type="submit"
          disabled={!comment.trim()}
          className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center transition cursor-pointer disabled:bg-[#e5e8eb] disabled:text-[#b0b8c1] disabled:cursor-not-allowed"
          aria-label="댓글 등록"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* 삭제 확인창 (글·댓글 공통) */}
      {deleteTarget && (
        <div
          className="absolute inset-0 z-50 bg-[#191f28]/40 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => setDeleteTarget(null)} // 바깥 어두운 부분을 누르면 취소
        >
          <div
            id="delete-confirm-dialog"
            className="w-full max-w-[300px] bg-white rounded-3xl p-5 space-y-4 shadow-lg"
            onClick={(e) => e.stopPropagation()} // 창 안쪽을 누를 때는 닫히지 않게
          >
            <div className="space-y-1.5 text-center">
              <p className="text-[15px] font-bold text-[#191f28]">
                {deleteTarget.kind === 'post' ? '게시글을 삭제할까요?' : '댓글을 삭제할까요?'}
              </p>
              <p className="text-xs font-semibold text-[#8b95a1] leading-relaxed">
                {deleteTarget.kind === 'post' ? '삭제한 글과 댓글은 되돌릴 수 없어요.' : '삭제한 댓글은 되돌릴 수 없어요.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-cancel-delete"
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-11 rounded-2xl bg-[#f2f4f6] hover:bg-[#e5e8eb] text-[13px] font-bold text-[#4e5968] transition cursor-pointer"
              >
                취소
              </button>
              <button
                id="btn-confirm-delete"
                type="button"
                onClick={confirmDelete}
                className="h-11 rounded-2xl bg-[#f04452] hover:bg-[#d93a47] text-white text-[13px] font-bold transition cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
