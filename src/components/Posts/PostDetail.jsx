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

function VotePanel({ vote, selections, onToggle, onSubmit, now }) {
  const responses = vote.responses ?? [];
  const hasVoted = responses.some((response) => response.voter === "current-user");
  const closed = Boolean(vote.deadline && new Date(vote.deadline).getTime() <= now);
  const showResults = hasVoted || closed;
  const counts = vote.candidates.map((_, index) => responses.filter((response) => response.selections?.includes(index)).length);
  return <section className="mt-8 rounded-xl border border-primary bg-third p-6 lg:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="font-semibold text-primary">투표 · {vote.multiple ? "복수 선택" : "단일 선택"}</span><h2 className="mt-2 text-2xl font-bold">{vote.question}</h2></div><div className="text-right text-sm"><p className={closed ? "font-semibold text-error" : "text-gray-3"}>{closed ? "투표가 마감되었습니다" : vote.deadline ? `${formatDateTime(new Date(vote.deadline))}까지` : "마감 기한 없음"}</p><p className="mt-1">{responses.length}명 참여</p></div></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; const percent = responses.length ? Math.round((counts[index] / responses.length) * 100) : 0; const selected = selections.includes(index); return <button key={`${item.text}-${index}`} type="button" disabled={hasVoted || closed} onClick={() => onToggle(index)} className={`relative flex min-h-20 overflow-hidden rounded-lg border bg-white p-3 text-left ${selected ? "border-2 border-primary" : "border-gray-5"} disabled:cursor-default`}><span className="absolute inset-y-0 left-0 bg-primary/10 transition-[width]" style={{ width: showResults ? `${percent}%` : 0 }} />{item.image && <Image src={item.image} alt="" width={56} height={56} unoptimized className="relative mr-3 h-14 w-14 rounded object-cover" />}<span className="relative flex min-w-0 flex-1 items-center justify-between gap-3"><span className="font-semibold">{item.text}</span>{showResults && <strong className="shrink-0 text-primary">{counts[index]}표 · {percent}%</strong>}</span></button>; })}</div>
    {!hasVoted && !closed && <div className="mt-5 flex justify-end"><button type="button" onClick={onSubmit} disabled={!selections.length} className="cursor-pointer rounded-lg bg-primary px-7 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5">투표하기</button></div>}{hasVoted && <p className="mt-5 text-right font-semibold text-primary">투표가 완료되었습니다.</p>}
  </section>;
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
  };

  const removePost = () => {
    const posts = JSON.parse(localStorage.getItem("lionking-posts") ?? "[]").filter((item) => String(item.id) !== String(post.id));
    localStorage.setItem("lionking-posts", JSON.stringify(posts));
    router.push("/dashboard");
  };

  if (!loaded) return <main className="flex-1" />;
  if (!post) return <main className="flex flex-1 items-center justify-center"><div className="text-center"><p className="text-xl font-semibold">게시글을 찾을 수 없습니다.</p><Link href="/dashboard" className="mt-4 inline-block text-primary">목록으로 돌아가기</Link></div></main>;

  const image = post.coverImage ?? post.files?.find((file) => file?.preview)?.preview;

  return (
    <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><div className="mx-auto w-full max-w-[1106px]">
      <div className="flex items-center gap-3"><Image src="/icons/Sidebar/lion.svg" alt="" width={45} height={45} /><h1 className="text-[36px] font-bold">라이온킹</h1></div>
      <article className="relative mt-10 min-h-[355px] rounded-xl border border-gray-5 p-7 lg:p-8"><div className={`grid gap-8 ${image ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(380px,1.2fr)] lg:gap-12" : ""}`}>
        <div className="flex min-h-[291px] flex-col"><span className="inline-flex w-fit rounded-full border border-primary px-3 py-1 text-sm font-medium">{typeLabels[post.type] ?? "게시글"}</span>
          <div className="mt-4 flex items-center gap-3"><Avatar name="김멋사" index={2} /><strong className="text-2xl font-medium">김멋사</strong><span className="text-sm font-normal">{elapsed(post.createdAt)}</span></div>
          <h2 className="mt-6 text-2xl font-semibold">{post.title}</h2><p className="mt-3 whitespace-pre-wrap text-base font-normal leading-6">{post.content}</p>
          {(post.files ?? []).length > 0 && <div className="mt-5 flex flex-wrap gap-2">{post.files.map((file, index) => <span key={`${file.name}-${index}`} className="rounded-lg bg-gray-4 px-3 py-2 text-sm">📎 {file.name}</span>)}</div>}
          <div className="mt-auto pt-6"><div className="flex items-center gap-2 text-base font-normal"><Image src="/icons/Posts/reply.svg" alt="댓글" width={18} height={18} /><span>{comments.length}</span></div><div className="mt-2 flex items-center gap-2 text-sm font-normal"><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-2 text-[9px] text-white">✓</span><span>검토중 {comments.length}</span></div></div>
        </div>
        {image && <div className="flex min-h-[280px] items-center justify-center overflow-hidden bg-[#f4faf7] lg:mr-10 lg:mt-2"><Image src={image} alt="게시글 첨부 이미지" width={720} height={430} unoptimized className="max-h-[430px] w-full object-contain" /></div>}
      </div><div className="absolute right-[15px] top-[15px]"><button type="button" onClick={() => setOpenMenu((current) => current === "post" ? null : "post")} aria-label="게시글 메뉴" className="flex h-6 w-7 cursor-pointer items-center justify-center"><Image src="/icons/Posts/more.svg" alt="" width={20} height={6} /></button>{openMenu === "post" && <div className="absolute right-0 top-8 z-20 w-[82px] overflow-hidden rounded-lg border border-gray-5 bg-white py-1 shadow-lg"><Link href={`/posts/create?edit=${encodeURIComponent(post.id)}`} className="flex h-8 items-center gap-1 px-2 text-[15px] font-medium hover:bg-gray-4"><Image src="/icons/common/edit.svg" alt="" width={22} height={22} />수정</Link><button type="button" onClick={removePost} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium text-[#FF0000] hover:bg-gray-4"><Image src="/icons/common/trash.svg" alt="" width={22} height={22} />삭제</button></div>}</div></article>

      {post.type === "question" && post.vote && <VotePanel vote={post.vote} selections={voteSelections} onToggle={toggleVoteSelection} onSubmit={submitVote} now={now} />}

      <section className="mt-12"><h2 className="text-xl font-semibold">댓글 {comments.length}</h2><div className="mt-3 rounded-xl border border-gray-5 px-7 py-[30px]">
        {comments.length === 0 ? <p className="py-8 text-center text-gray-2">첫 댓글을 남겨보세요.</p> : <div className="space-y-[60px]">{comments.map((comment, index) => <div key={comment.id} className="relative flex gap-4 pr-12"><Avatar name={comment.author} index={index} /><div className="min-w-0 flex-1"><div className="flex items-end gap-4"><strong className="text-2xl font-medium">{comment.author}</strong><span className="mb-0.5 text-sm font-normal">{elapsed(comment.createdAt)}</span>{comment.updatedAt && <span className="mb-0.5 text-sm text-gray-2">수정됨</span>}</div>
          {editingId === comment.id ? <div className="mt-3"><textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} autoFocus className="min-h-24 w-full resize-none rounded-lg border border-gray-5 p-3 text-xl outline-none focus:ring-2 focus:ring-primary" /><div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => { setEditingId(null); setEditingContent(""); }} className="cursor-pointer rounded-lg border border-gray-5 px-4 py-2">취소</button><button type="button" onClick={updateComment} disabled={!editingContent.trim()} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-5">수정 완료</button></div></div> : <><p className="mt-2 whitespace-pre-wrap text-xl font-normal leading-7">{comment.content}</p><button type="button" className="mt-3 text-sm font-normal">답글</button></>}
        </div><div className="absolute right-[15px] top-[15px]"><button type="button" onClick={() => setOpenMenu((current) => current === comment.id ? null : comment.id)} aria-label={`${comment.author} 댓글 메뉴`} aria-expanded={openMenu === comment.id} className="flex h-6 w-7 cursor-pointer items-center justify-center"><Image src="/icons/Posts/more.svg" alt="" width={20} height={6} /></button>{openMenu === comment.id && <div className="absolute right-0 top-8 z-10 w-[82px] overflow-hidden rounded-lg border border-gray-5 bg-white py-1 shadow-lg"><button type="button" onClick={() => startEditing(comment)} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium hover:bg-gray-4"><Image src="/icons/common/edit.svg" alt="" width={22} height={22} />수정</button><button type="button" onClick={() => removeComment(comment.id)} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium text-[#FF0000] hover:bg-gray-4"><Image src="/icons/common/trash.svg" alt="" width={22} height={22} />삭제</button></div>}</div></div>)}</div>}
      </div></section>

      <section className="mt-7"><h2 className="text-2xl font-semibold">댓글 작성</h2><div className="relative mt-4 h-[141px] rounded-xl border border-gray-5 p-4 pb-14 focus-within:ring-2 focus-within:ring-primary"><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="댓글을 작성하세요." className="h-full w-full resize-none text-xl font-medium outline-none placeholder:font-medium placeholder:text-[#969696]" /><button type="button" onClick={addComment} disabled={!content.trim()} className="absolute bottom-4 right-4 cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5">등록</button></div>{content.trim() && <AiSuggestion type="comment" onApply={setContent} />}</section>
    </div></main>
  );
}
