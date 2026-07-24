"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import AiSuggestion from "./AiSuggestion";
import DateTimePicker, { formatDateTime } from "./DateTimePicker";
import PostEditor, { RequiredMark, TextEditor } from "./PostEditor";

const postTypes = [
  { id: "task", title: "작업", description: "업무 진행 상황 공유", width: 58, height: 58 },
  { id: "question", title: "질문", description: "의견/도움 요청", width: 50, height: 50 },
  { id: "note", title: "회의록", description: "회의 내용 정리", width: 51, height: 49 },
];

export default function PostCreatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");
  const [restoredDraft] = useState(() => {
    if (searchParams.get("restore") !== "1" || typeof window === "undefined") return null;
    try { return JSON.parse(sessionStorage.getItem("lionking-post-draft") ?? "null"); } catch { return null; }
  });
  const [storedEdit] = useState(() => {
    if (!editId || typeof window === "undefined") return null;
    return JSON.parse(localStorage.getItem("lionking-posts") ?? "[]").find((post) => post.id === editId) ?? null;
  });
  const [type, setType] = useState(() => restoredDraft?.type ?? (["task", "question", "note"].includes(searchParams.get("type")) ? searchParams.get("type") : storedEdit?.type ?? "task"));
  const [vote, setVote] = useState(() => {
    try { return restoredDraft?.vote ?? (searchParams.get("vote") ? JSON.parse(searchParams.get("vote")) : storedEdit?.vote ?? null); } catch { return restoredDraft?.vote ?? storedEdit?.vote ?? null; }
  });
  const [title, setTitle] = useState(() => restoredDraft?.title ?? searchParams.get("title") ?? storedEdit?.title ?? "");
  const [content, setContent] = useState(() => restoredDraft?.content ?? searchParams.get("content") ?? storedEdit?.content ?? "");
  const [files, setFiles] = useState(() => {
    try { return (restoredDraft?.files ?? (searchParams.get("files") ? JSON.parse(searchParams.get("files")) : storedEdit?.files ?? [])).map((file) => typeof file === "string" ? { name: file } : file); } catch { return restoredDraft?.files ?? storedEdit?.files ?? []; }
  });
  const [meetingDate, setMeetingDate] = useState(() => searchParams.get("meetingDate") || storedEdit?.meetingDate ? new Date(searchParams.get("meetingDate") ?? storedEdit.meetingDate) : null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isValid = title.trim() && content.trim() && (type !== "note" || meetingDate);
  const savePost = () => {
    if (!isValid) return;
    const storedPosts = JSON.parse(localStorage.getItem("lionking-posts") ?? "[]");
    const coverImage = files.find((file) => typeof file === "object" && file.preview)?.preview ?? null;
    const post = { id: editId ?? crypto.randomUUID(), type, title: title.trim(), content: content.trim(), files: files.map((file) => typeof file === "string" ? { name: file } : file), coverImage, vote: type === "question" ? vote : null, meetingDate: type === "note" ? meetingDate?.toISOString() : null, createdAt: storedEdit?.createdAt ?? new Date().toISOString() };
    const nextPosts = editId ? storedPosts.map((item) => item.id === editId ? post : item) : [post, ...storedPosts];
    localStorage.setItem("lionking-posts", JSON.stringify(nextPosts));
    router.push("/main");
  };
  const openVoteEditor = () => {
    sessionStorage.setItem("lionking-post-draft", JSON.stringify({ type: "question", title, content, files, vote, editId }));
    router.push(`/posts/create/vote${editId ? `?edit=${encodeURIComponent(editId)}` : ""}`);
  };

  return (
    <div className="flex min-h-screen bg-white"><Sidebar /><main className="ml-64 min-w-0 flex-1 bg-white p-5 sm:p-8 lg:p-10"><div className="mx-auto w-full max-w-7xl"><div className="flex items-center gap-3"><Image src="/icons/Sidebar/lion.svg" alt="" width={45} height={45} /><h1 className="text-[36px] font-bold">라이온킹</h1></div><h2 className="ml-6 mt-10 text-[32px] font-bold">{editId ? "게시글 수정" : "게시글 작성"}</h2>
      <form className="mt-8 rounded-xl border border-gray-5 px-8 py-12" onSubmit={(event) => event.preventDefault()}>
        <section><h2 className="mb-6 text-2xl font-semibold">1. 게시글 유형 선택<RequiredMark /></h2><div className="flex flex-wrap gap-[53px]">{postTypes.map((postType) => <button key={postType.id} type="button" onClick={() => { setType(postType.id); setContent(""); }} className={`flex h-[116px] w-[284px] cursor-pointer items-center justify-center gap-5 rounded-lg border-2 ${type === postType.id ? "border-primary" : "border-gray-5"}`}><Image src={`/icons/Posts/${postType.id}.svg`} alt="" width={postType.width} height={postType.height} /><span className="text-left"><strong className="block text-[20px] font-medium">{postType.title}</strong><span className="text-[18px] font-medium">{postType.description}</span></span></button>)}</div></section>
        {type !== "note" ? <><PostEditor title={title} setTitle={setTitle} content={content} setContent={setContent} files={files} setFiles={setFiles} afterContent={content.trim() ? <AiSuggestion type={type} onApply={setContent} /> : null} />{type === "question" && <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">5. 투표하기</h2>{vote ? <div className="rounded-lg border border-primary bg-third p-5"><div className="flex items-center justify-between"><strong className="text-primary">투표 · {vote.candidates.length}개 후보</strong><div className="flex gap-2"><button type="button" onClick={openVoteEditor} className="cursor-pointer rounded-lg bg-white px-4 py-2">수정</button><button type="button" onClick={() => setVote(null)} className="cursor-pointer rounded-lg bg-gray-5 px-4 py-2">삭제</button></div></div><p className="mt-3 font-semibold">{vote.question}</p><div className="mt-3 flex gap-3">{vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; return <span key={`${item.text}-${index}`} className="flex flex-col gap-2 rounded bg-white p-2 text-sm"><Image src={item.image || "/icons/Posts/noImage.svg"} alt="" width={80} height={72} unoptimized={Boolean(item.image)} className="h-[72px] w-20 rounded object-cover" />{item.text}</span>; })}</div></div> : <div className="rounded-lg border border-dashed border-gray-5 p-8"><button type="button" onClick={openVoteEditor} className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-gray-5 px-5 py-3 text-[20px] font-semibold"><Image src="/icons/Posts/vote.svg" alt="" width={45} height={45} />투표 만들기</button><p className="mt-3 text-gray-2">질문에 대한 팀원들의 의견을 투표로 받아보세요.</p></div>}</section>}</> : <>
          <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">2. 회의 제목<RequiredMark /></h2><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력해주세요." className="h-14 w-full rounded-lg border border-gray-5 px-5 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2 focus:ring-2 focus:ring-primary" /></section>
          <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">3. 회의 날짜<RequiredMark /></h2><button type="button" onClick={() => setPickerOpen(true)} className="flex h-14 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-5 px-5 text-left"><span className={meetingDate ? "text-black" : "text-[20px] font-medium text-gray-2"}>{formatDateTime(meetingDate)}</span><Image src="/icons/Posts/calendar.svg" alt="" width={30} height={30} /></button></section>
          <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">4. 회의 내용<RequiredMark /></h2><TextEditor value={content} onChange={setContent} />{content.trim() && <AiSuggestion type="note" onApply={setContent} />}</section>
        </>}
      </form><div className="flex justify-end py-5"><button type="button" onClick={savePost} disabled={!isValid} className="cursor-pointer rounded-lg bg-primary px-7 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3">{editId ? "수정 완료" : "게시글 등록하기"}</button></div></div></main>
      {pickerOpen && <DateTimePicker value={meetingDate} label="회의일" onClose={() => setPickerOpen(false)} onConfirm={(date) => { setMeetingDate(date); setPickerOpen(false); }} />}
    </div>
  );
}
