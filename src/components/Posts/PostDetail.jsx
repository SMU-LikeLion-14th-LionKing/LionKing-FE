"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AiSuggestion from "./AiSuggestion";
import { formatDateTime } from "./DateTimePicker";

const typeLabels = { task: "작업", question: "질문", note: "회의록" };
const colors = ["bg-[#ef6475]", "bg-[#8c73df]", "bg-green"];

function elapsed(value) {
  if (!value) return "방금 전";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 1440)}일 전`;
}

function Avatar({ name, index = 0 }) {
  return <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${colors[index % colors.length]} text-xl font-bold text-white`}>{name.slice(0, 1)}</div>;
}

function voteMeta(vote, now) {
  const responses = vote.responses ?? [];
  const hasVoted = responses.some((response) => response.voter === "current-user");
  const closed = Boolean(vote.deadline && new Date(vote.deadline).getTime() <= now);
  const counts = vote.candidates.map((_, index) => responses.filter((response) => response.selections?.includes(index)).length);
  return { responses, hasVoted, closed, counts };
}

function deadlineText(vote, now) {
  if (!vote.deadline) return "마감 기한 없음";
  const deadline = new Date(vote.deadline);
  const days = Math.max(0, Math.ceil((deadline.getTime() - now) / 86400000));
  return `D-${days} (${formatDateTime(deadline)} 마감)`;
}

function VoteSummary({ vote, now, onOpen }) {
  const { responses, hasVoted, closed, counts } = voteMeta(vote, now);
  return <section className="flex min-h-[280px] flex-col rounded-xl border border-gray-5 bg-white p-5 shadow-sm lg:mr-10 lg:mt-2" aria-label="투표 현황">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1"><strong className={closed ? "text-gray-3" : "text-primary"}>{closed ? "투표 마감" : "투표 진행중"}</strong><span className="font-semibold">{deadlineText(vote, now)}</span></div>
    <p className="mt-3 text-lg font-bold">{vote.question}</p>
    <div className="mt-4 grid flex-1 gap-4 sm:grid-cols-[minmax(160px,0.9fr)_minmax(170px,1.1fr)]">
      <div className="grid grid-cols-2 gap-3">{vote.candidates.slice(0, 2).map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; return <div key={`${item.text}-${index}`} className="min-w-0"><div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-4">{item.image ? <Image src={item.image} alt={`${item.text} 후보 이미지`} width={180} height={180} unoptimized className="h-full w-full object-cover" /> : <Image src="/icons/Posts/noImage.svg" alt="이미지 없음" width={72} height={72} />}</div><p className="mt-1 truncate text-sm font-medium">{item.text}</p></div>; })}</div>
      <div className="space-y-3 self-center">{vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate } : candidate; const percent = responses.length ? Math.round((counts[index] / responses.length) * 100) : 0; return <div key={`${item.text}-${index}`}><p className="mb-1 truncate text-sm font-medium">{item.text}</p><div className="flex items-center gap-2"><span className="h-4 flex-1 overflow-hidden rounded-full bg-gray-5"><span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></span><span className="w-[72px] shrink-0 text-sm">{counts[index]}명 ({percent}%)</span></div></div>; })}</div>
    </div>
    <div className="mt-4 flex items-center gap-3 text-sm"><span className="text-gray-2">참여 {responses.length}명</span><button type="button" onClick={onOpen} disabled={closed || hasVoted} className="cursor-pointer font-semibold underline underline-offset-4 disabled:cursor-default disabled:text-gray-2">{hasVoted ? "투표 완료" : closed ? "투표 마감" : "투표하기"}</button></div>
  </section>;
}

function VoteModal({ vote, selections, onToggle, onSubmit, onClose, now }) {
  const { closed } = voteMeta(vote, now);
  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="vote-modal-title" className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-xl border-2 border-primary bg-white p-6 shadow-2xl sm:p-10">
      <button type="button" onClick={onClose} aria-label="투표 팝업 닫기" className="absolute right-4 top-3 cursor-pointer text-3xl font-light text-primary">×</button>
      <h2 id="vote-modal-title" className="pr-8 text-2xl font-bold">{vote.question}</h2><p className="mt-1 text-sm">{deadlineText(vote, now)}</p>
      <p className="mt-5 text-sm text-gray-3">{vote.multiple ? "복수 선택이 가능합니다." : "후보 한 개를 선택해 주세요."}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; const selected = selections.includes(index); return <button key={`${item.text}-${index}`} type="button" onClick={() => onToggle(index)} aria-pressed={selected} className={`cursor-pointer rounded-xl border p-4 text-left transition ${selected ? "border-2 border-primary bg-third" : "border-gray-5 bg-white"}`}><span className="flex items-center justify-between gap-2 font-semibold"><span>후보 {index + 1}</span><span className={`h-5 w-5 rounded-full border-2 ${selected ? "border-[6px] border-primary" : "border-gray-5"}`} /></span><span className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-4">{item.image ? <Image src={item.image} alt={`${item.text} 후보 이미지`} width={240} height={180} unoptimized className="h-full w-full object-cover" /> : <Image src="/icons/Posts/noImage.svg" alt="이미지 없음" width={72} height={72} />}</span><span className="mt-3 block font-medium">{item.text}</span></button>; })}</div>
      <button type="button" onClick={onSubmit} disabled={!selections.length || closed} className="mt-6 w-full cursor-pointer rounded-xl bg-primary py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-5">투표하기</button>
    </section>
  </div>;
}

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [voteSelections, setVoteSelections] = useState([]);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const posts = JSON.parse(localStorage.getItem("lionking-posts") ?? "[]");
    const selectedPost = posts.find((item) => String(item.id) === decodeURIComponent(String(id))) ?? null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPost(selectedPost);
    setComments(JSON.parse(localStorage.getItem(`lionking-comments-${id}`) ?? "[]"));
    setVoteSelections(selectedPost?.vote?.responses?.find((response) => response.voter === "current-user")?.selections ?? []);
    setLoaded(true);
  }, [id]);

  const addComment = () => {
    if (!content.trim()) return;
    const next = [...comments, { id: crypto.randomUUID(), author: "김멋사", content: content.trim(), createdAt: new Date().toISOString() }];
    setComments(next);
    localStorage.setItem(`lionking-comments-${id}`, JSON.stringify(next));
    setContent("");
  };

  const saveComments = (next) => {
    setComments(next);
    localStorage.setItem(`lionking-comments-${id}`, JSON.stringify(next));
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
    setOpenMenu(null);
  };

  const updateComment = () => {
    if (!editingContent.trim()) return;
    saveComments(comments.map((comment) => comment.id === editingId ? { ...comment, content: editingContent.trim(), updatedAt: new Date().toISOString() } : comment));
    setEditingId(null);
    setEditingContent("");
  };

  const removeComment = (commentId) => {
    saveComments(comments.filter((comment) => comment.id !== commentId));
    setOpenMenu(null);
    if (editingId === commentId) setEditingId(null);
  };

  const toggleVoteSelection = (candidateIndex) => {
    if (post.vote.multiple) setVoteSelections((current) => current.includes(candidateIndex) ? current.filter((index) => index !== candidateIndex) : [...current, candidateIndex]);
    else setVoteSelections([candidateIndex]);
  };

  const submitVote = () => {
    if (!voteSelections.length || !post.vote || post.vote.responses?.some((response) => response.voter === "current-user")) return;
    const updatedPost = { ...post, vote: { ...post.vote, responses: [...(post.vote.responses ?? []), { voter: "current-user", selections: voteSelections, votedAt: new Date().toISOString() }] } };
    const posts = JSON.parse(localStorage.getItem("lionking-posts") ?? "[]").map((item) => String(item.id) === String(post.id) ? updatedPost : item);
    localStorage.setItem("lionking-posts", JSON.stringify(posts));
    setPost(updatedPost);
    setVoteModalOpen(false);
  };

  const removePost = () => {
    const posts = JSON.parse(localStorage.getItem("lionking-posts") ?? "[]").filter((item) => String(item.id) !== String(post.id));
    localStorage.setItem("lionking-posts", JSON.stringify(posts));
    router.push("/dashboard");
  };

  if (!loaded) return <main className="flex-1" />;
  if (!post) return <main className="flex flex-1 items-center justify-center"><div className="text-center"><p className="text-xl font-semibold">게시글을 찾을 수 없습니다.</p><Link href="/dashboard" className="mt-4 inline-block text-primary">목록으로 돌아가기</Link></div></main>;

  const image = post.coverImage ?? post.files?.find((file) => file?.preview)?.preview;
  const hasVote = post.type === "question" && Boolean(post.vote);

  return (
    <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><div className="mx-auto w-full max-w-[1106px]">
      <div className="flex items-center gap-3"><Image src="/icons/Sidebar/lion.svg" alt="" width={45} height={45} /><h1 className="text-[36px] font-bold">라이온킹</h1></div>
      <article className="relative mt-10 min-h-[355px] rounded-xl border border-gray-5 p-7 lg:p-8"><div className={`grid gap-8 ${hasVote || image ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(380px,1.2fr)] lg:gap-12" : ""}`}>
        <div className="flex min-h-[291px] flex-col"><span className="inline-flex w-fit rounded-full border border-primary px-3 py-1 text-sm font-medium">{typeLabels[post.type] ?? "게시글"}</span>
          <div className="mt-4 flex items-center gap-3"><Avatar name="김멋사" index={2} /><strong className="text-2xl font-medium">김멋사</strong><span className="text-sm font-normal">{elapsed(post.createdAt)}</span></div>
          <h2 className="mt-6 text-2xl font-semibold">{post.title}</h2><p className="mt-3 whitespace-pre-wrap text-base font-normal leading-6">{post.content}</p>
          {(post.files ?? []).length > 0 && <div className="mt-5 flex flex-wrap gap-2">{post.files.map((file, index) => <span key={`${file.name}-${index}`} className="rounded-lg bg-gray-4 px-3 py-2 text-sm">📎 {file.name}</span>)}</div>}
          <div className="mt-auto pt-6"><div className="flex items-center gap-2 text-base font-normal"><Image src="/icons/Posts/reply.svg" alt="댓글" width={18} height={18} /><span>{comments.length}</span></div><div className="mt-2 flex items-center gap-2 text-sm font-normal"><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-2 text-[9px] text-white">✓</span><span>검토중 {comments.length}</span></div></div>
        </div>
        {hasVote ? <VoteSummary vote={post.vote} now={now} onOpen={() => { setVoteSelections([]); setVoteModalOpen(true); }} /> : image && <div className="flex min-h-[280px] items-center justify-center overflow-hidden bg-[#f4faf7] lg:mr-10 lg:mt-2"><Image src={image} alt="게시글 첨부 이미지" width={720} height={430} unoptimized className="max-h-[430px] w-full object-contain" /></div>}
      </div><div className="absolute right-[15px] top-[15px]"><button type="button" onClick={() => setOpenMenu((current) => current === "post" ? null : "post")} aria-label="게시글 메뉴" className="flex h-6 w-7 cursor-pointer items-center justify-center"><Image src="/icons/Posts/more.svg" alt="" width={20} height={6} /></button>{openMenu === "post" && <div className="absolute right-0 top-8 z-20 w-[82px] overflow-hidden rounded-lg border border-gray-5 bg-white py-1 shadow-lg"><Link href={`/posts/create?edit=${encodeURIComponent(post.id)}`} className="flex h-8 items-center gap-1 px-2 text-[15px] font-medium hover:bg-gray-4"><Image src="/icons/common/edit.svg" alt="" width={22} height={22} />수정</Link><button type="button" onClick={removePost} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium text-[#FF0000] hover:bg-gray-4"><Image src="/icons/common/trash.svg" alt="" width={22} height={22} />삭제</button></div>}</div></article>

      <section className="mt-12"><h2 className="text-xl font-semibold">댓글 {comments.length}</h2><div className="mt-3 rounded-xl border border-gray-5 px-7 py-[30px]">
        {comments.length === 0 ? <p className="py-8 text-center text-gray-2">첫 댓글을 남겨보세요.</p> : <div className="space-y-[60px]">{comments.map((comment, index) => <div key={comment.id} className="relative flex gap-4 pr-12"><Avatar name={comment.author} index={index} /><div className="min-w-0 flex-1"><div className="flex items-end gap-4"><strong className="text-2xl font-medium">{comment.author}</strong><span className="mb-0.5 text-sm font-normal">{elapsed(comment.createdAt)}</span>{comment.updatedAt && <span className="mb-0.5 text-sm text-gray-2">수정됨</span>}</div>
          {editingId === comment.id ? <div className="mt-3"><textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} autoFocus className="min-h-24 w-full resize-none rounded-lg border border-gray-5 p-3 text-xl outline-none focus:ring-2 focus:ring-primary" /><div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => { setEditingId(null); setEditingContent(""); }} className="cursor-pointer rounded-lg border border-gray-5 px-4 py-2">취소</button><button type="button" onClick={updateComment} disabled={!editingContent.trim()} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-5">수정 완료</button></div></div> : <><p className="mt-2 whitespace-pre-wrap text-xl font-normal leading-7">{comment.content}</p><button type="button" className="mt-3 text-sm font-normal">답글</button></>}
        </div><div className="absolute right-[15px] top-[15px]"><button type="button" onClick={() => setOpenMenu((current) => current === comment.id ? null : comment.id)} aria-label={`${comment.author} 댓글 메뉴`} aria-expanded={openMenu === comment.id} className="flex h-6 w-7 cursor-pointer items-center justify-center"><Image src="/icons/Posts/more.svg" alt="" width={20} height={6} /></button>{openMenu === comment.id && <div className="absolute right-0 top-8 z-10 w-[82px] overflow-hidden rounded-lg border border-gray-5 bg-white py-1 shadow-lg"><button type="button" onClick={() => startEditing(comment)} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium hover:bg-gray-4"><Image src="/icons/common/edit.svg" alt="" width={22} height={22} />수정</button><button type="button" onClick={() => removeComment(comment.id)} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium text-[#FF0000] hover:bg-gray-4"><Image src="/icons/common/trash.svg" alt="" width={22} height={22} />삭제</button></div>}</div></div>)}</div>}
      </div></section>

      <section className="mt-7"><h2 className="text-2xl font-semibold">댓글 작성</h2><div className="relative mt-4 h-[141px] rounded-xl border border-gray-5 p-4 pb-14 focus-within:ring-2 focus-within:ring-primary"><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="댓글을 작성하세요." className="h-full w-full resize-none text-xl font-medium outline-none placeholder:font-medium placeholder:text-[#969696]" /><button type="button" onClick={addComment} disabled={!content.trim()} className="absolute bottom-4 right-4 cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5">등록</button></div>{content.trim() && <AiSuggestion type="comment" onApply={setContent} />}</section>
    </div>{voteModalOpen && hasVote && <VoteModal vote={post.vote} selections={voteSelections} onToggle={toggleVoteSelection} onSubmit={submitVote} onClose={() => setVoteModalOpen(false)} now={now} />}</main>
  );
}
