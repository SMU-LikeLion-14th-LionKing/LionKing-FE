"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import DateTimePicker, { formatDateTime } from "./DateTimePicker";

export default function VoteCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [postDraft] = useState(() => { if (typeof window === "undefined") return null; try { return JSON.parse(sessionStorage.getItem("lionking-post-draft") ?? "null"); } catch { return null; } });
  const initialVote = postDraft?.vote ?? null;
  const [question, setQuestion] = useState(() => initialVote?.question ?? "");
  const [multiple, setMultiple] = useState(() => initialVote?.multiple ?? false);
  const [candidates, setCandidates] = useState(() => initialVote?.candidates?.map((candidate, index) => ({ id: index + 1, text: typeof candidate === "string" ? candidate : candidate.text, image: typeof candidate === "string" ? "" : candidate.image ?? "" })) ?? [{ id: 1, text: "", image: "" }, { id: 2, text: "", image: "" }]);
  const [deadline, setDeadline] = useState(() => initialVote?.deadline ? new Date(initialVote.deadline) : null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const canAdd = question.trim() && candidates.length >= 2 && candidates.every((candidate) => candidate.text.trim());

  const updateCandidate = (id, values) => setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, ...values } : candidate));
  const attachCandidateImage = (id, file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => updateCandidate(id, { image: reader.result });
    reader.readAsDataURL(file);
  };
  const addVote = () => {
    if (!canAdd) return;
    const vote = { question: question.trim(), multiple, candidates: candidates.map(({ text, image }) => ({ text: text.trim(), image })), deadline: deadline?.toISOString() ?? null };
    sessionStorage.setItem("lionking-post-draft", JSON.stringify({ ...postDraft, type: "question", vote }));
    const editId = searchParams.get("edit") ?? postDraft?.editId;
    router.push(`/posts/create?restore=1${editId ? `&edit=${encodeURIComponent(editId)}` : ""}`);
  };

  return (
    <div className="flex min-h-screen bg-white"><Sidebar /><main className="min-w-0 flex-1 bg-white p-5 sm:p-8 lg:p-10"><div className="mx-auto w-full max-w-7xl"><div className="flex items-center gap-3"><Image src="/icons/Sidebar/lion.svg" alt="" width={45} height={45} /><h1 className="text-[36px] font-bold">라이온킹</h1></div>
      <form className="mt-16 rounded-xl border border-gray-5 px-10 py-12" onSubmit={(event) => event.preventDefault()}><h2 className="text-2xl font-bold">투표 만들기</h2>
        <section className="mt-8"><h3 className="mb-6 text-2xl font-semibold">1. 투표 질문</h3><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="어떤 내용에 대한 의견을 듣고 싶나요?" className="h-28 w-full resize-none rounded-lg border border-gray-5 p-5 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2 focus:ring-2 focus:ring-primary" /></section>
        <section className="mt-8"><h3 className="mb-6 text-2xl font-semibold">2. 투표 방식</h3><button type="button" onClick={() => setMultiple((value) => !value)} className={`cursor-pointer rounded-lg border-2 px-6 py-4 ${multiple ? "border-primary bg-third" : "border-gray-5"}`}>복수 선택 {multiple ? "가능" : "불가능"}</button></section>
        <section className="mt-8"><h3 className="text-2xl font-semibold">3. 투표 후보</h3><p className="mt-3 text-gray-2">최소 2개 이상 입력</p><div className="mt-2 max-w-[760px] space-y-3">{candidates.map((candidate, index) => <div key={candidate.id} className="flex items-center gap-4"><div className="flex h-[90px] min-w-0 flex-1 items-center rounded-lg border border-gray-5 px-5"><input value={candidate.text} onChange={(event) => updateCandidate(candidate.id, { text: event.target.value })} placeholder={`후보 ${index + 1}: 내용을 입력하세요.`} className="min-w-0 flex-1 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2" /><label className="cursor-pointer">{candidate.image ? <Image src={candidate.image} alt="후보 첨부 이미지" width={56} height={56} unoptimized className="h-14 w-14 rounded object-cover" /> : <Image src="/icons/Posts/greyImage.svg" alt="이미지 첨부" width={33} height={33} />}<input type="file" accept="image/*" className="hidden" onChange={(event) => attachCandidateImage(candidate.id, event.target.files?.[0])} /></label></div><button type="button" onClick={() => candidates.length > 2 && setCandidates((current) => current.filter((item) => item.id !== candidate.id))} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-30" disabled={candidates.length <= 2}><Image src="/icons/Posts/trash.svg" alt="후보 삭제" width={30} height={33} /></button></div>)}</div><button type="button" onClick={() => setCandidates((current) => [...current, { id: Date.now(), text: "", image: "" }])} className="ml-0 mt-3 w-full max-w-[760px] cursor-pointer rounded-lg border border-gray-5 py-3 font-semibold">＋ 후보 추가</button></section>
        <section className="mt-8"><h3 className="mb-6 text-2xl font-semibold">4. 옵션 설정</h3><div className="flex flex-wrap items-center gap-6"><div className="flex items-center gap-3 font-semibold"><Image src="/icons/Posts/checkbox.svg" alt="" width={20} height={20} />투표 마감일 설정</div><button type="button" onClick={() => setPickerOpen(true)} className="flex h-14 min-w-[295px] cursor-pointer items-center justify-between rounded-lg border border-gray-5 px-5"><span className={deadline ? "" : "text-[20px] font-medium text-gray-2"}>{formatDateTime(deadline)}</span><Image src="/icons/Posts/calendar.svg" alt="" width={30} height={30} /></button></div></section>
        <div className="mt-8 flex justify-end gap-4"><button type="button" onClick={() => router.back()} className="cursor-pointer rounded-lg border border-gray-5 px-8 py-4 font-semibold">취소하기</button><button type="button" disabled={!canAdd} onClick={addVote} className="cursor-pointer rounded-lg bg-primary px-8 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3">추가하기</button></div>
      </form></div></main>{pickerOpen && <DateTimePicker value={deadline} label="투표 마감일" onClose={() => setPickerOpen(false)} onConfirm={(date) => { setDeadline(date); setPickerOpen(false); }} />}</div>
  );
}
