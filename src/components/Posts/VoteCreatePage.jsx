"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import api from "@/lib/api";
import DateTimePicker, { formatDateTime } from "./DateTimePicker";

const subscribeToTeam = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getTeamNameSnapshot = () =>
  sessionStorage.getItem("selected_team_name") || "라이온킹";
const getTeamIconSnapshot = () =>
  sessionStorage.getItem("selected_team_icon") || "/icons/Sidebar/lion.svg";
const getServerTeamNameSnapshot = () => "라이온킹";
const getServerTeamIconSnapshot = () => "/icons/Sidebar/lion.svg";
const getProjectIdSnapshot = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getServerProjectIdSnapshot = () => "";

const getSafeUploadFileName = (fileName) => {
  const extensionIndex = fileName.lastIndexOf(".");
  const extension =
    extensionIndex > -1
      ? fileName.slice(extensionIndex).replace(/[^a-zA-Z0-9.]/g, "")
      : "";
  const baseName = (
    extensionIndex > -1 ? fileName.slice(0, extensionIndex) : fileName
  )
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return `${baseName || "poll-option"}-${Date.now()}${extension.toLowerCase()}`;
};

export default function VoteCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamName = useSyncExternalStore(
    subscribeToTeam,
    getTeamNameSnapshot,
    getServerTeamNameSnapshot,
  );
  const teamIcon = useSyncExternalStore(
    subscribeToTeam,
    getTeamIconSnapshot,
    getServerTeamIconSnapshot,
  );
  const projectId = useSyncExternalStore(
    subscribeToTeam,
    getProjectIdSnapshot,
    getServerProjectIdSnapshot,
  );
  const [postDraft] = useState(() => { if (typeof window === "undefined") return null; try { return JSON.parse(sessionStorage.getItem("lionking-post-draft") ?? "null"); } catch { return null; } });
  const initialVote = postDraft?.vote ?? null;
  const [question, setQuestion] = useState(() => initialVote?.question ?? "");
  const [multiple, setMultiple] = useState(() => initialVote?.multiple ?? false);
  const [candidates, setCandidates] = useState(() => initialVote?.candidates?.map((candidate, index) => ({ id: index + 1, text: typeof candidate === "string" ? candidate : candidate.text, image: typeof candidate === "string" ? "" : candidate.image ?? "", preview: typeof candidate === "string" ? "" : candidate.preview ?? candidate.image ?? "", isUploading: false })) ?? [{ id: 1, text: "", image: "", preview: "", isUploading: false }, { id: 2, text: "", image: "", preview: "", isUploading: false }]);
  const [deadline, setDeadline] = useState(() => initialVote?.deadline ? new Date(initialVote.deadline) : null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const canAdd = question.trim() && candidates.length >= 2 && candidates.every((candidate) => candidate.text.trim() && !candidate.isUploading);

  const updateCandidate = (id, values) => setCandidates((current) => current.map((candidate) => candidate.id === id ? { ...candidate, ...values } : candidate));
  const attachCandidateImage = async (id, file) => {
    if (!file?.type.startsWith("image/") || !projectId) return;
    setImageUploadError("");
    updateCandidate(id, { isUploading: true });

    const reader = new FileReader();
    reader.onload = () => updateCandidate(id, { preview: reader.result });
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file, getSafeUploadFileName(file.name));
      const { data: result } = await api.post(
        `/api/projects/${projectId}/files`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const imageUrl =
        typeof result?.data === "string"
          ? result.data
          : result?.data?.fileUrl || result?.data?.url;
      if (result?.isSuccess === false || !imageUrl) {
        throw new Error(result?.message || "후보 이미지를 업로드하지 못했습니다.");
      }
      updateCandidate(id, { image: imageUrl, isUploading: false });
    } catch (error) {
      updateCandidate(id, { image: "", preview: "", isUploading: false });
      setImageUploadError(
        error.response?.data?.message ||
          error.message ||
          "후보 이미지를 업로드하지 못했습니다.",
      );
    }
  };
  const addVote = () => {
    if (!canAdd) return;
    const vote = { ...initialVote, question: question.trim(), multiple, candidates: candidates.map(({ text, image, preview }, index) => ({ ...initialVote?.candidates?.[index], text: text.trim(), image, preview })), deadline: deadline?.toISOString() ?? null, responses: initialVote?.responses ?? [] };
    sessionStorage.setItem("lionking-post-draft", JSON.stringify({ ...postDraft, type: "question", vote }));
    const editId = searchParams.get("edit") ?? postDraft?.editId;
    router.push(`/posts/create?restore=1${editId ? `&edit=${encodeURIComponent(editId)}` : ""}`);
  };

  return (
    <div className="flex min-h-screen bg-white"><Sidebar /><main className="ml-64 min-w-0 flex-1 bg-white p-5 sm:p-8 lg:p-10"><div className="mx-auto w-full max-w-7xl"><div className="flex items-center gap-3"><Image src={teamIcon} alt="" width={45} height={45} /><h1 className="text-[36px] font-bold">{teamName}</h1></div>
      <form className="mt-16 rounded-xl border border-gray-5 px-10 py-12" onSubmit={(event) => event.preventDefault()}><h2 className="text-2xl font-bold">투표 만들기</h2>
        <section className="mt-8"><h3 className="mb-6 text-2xl font-semibold">1. 투표 질문</h3><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="어떤 내용에 대한 의견을 듣고 싶나요?" className="h-28 w-full resize-none rounded-lg border border-gray-5 p-5 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2 focus:ring-2 focus:ring-primary" /></section>
        <section className="mt-8"><h3 className="mb-6 text-2xl font-semibold">2. 투표 방식</h3><button type="button" onClick={() => setMultiple((value) => !value)} className={`cursor-pointer rounded-lg border-2 px-6 py-4 ${multiple ? "border-primary bg-third" : "border-gray-5"}`}>복수 선택 {multiple ? "가능" : "불가능"}</button></section>
        <section className="mt-8"><h3 className="text-2xl font-semibold">3. 투표 후보</h3><p className="mt-3 text-gray-2">최소 2개 이상 입력</p><div className="mt-2 max-w-[760px] space-y-3">{candidates.map((candidate, index) => <div key={candidate.id} className="flex items-center gap-4"><div className="flex h-[90px] min-w-0 flex-1 items-center rounded-lg border border-gray-5 px-5"><input value={candidate.text} onChange={(event) => updateCandidate(candidate.id, { text: event.target.value })} placeholder={`후보 ${index + 1}: 내용을 입력하세요.`} className="min-w-0 flex-1 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2" /><label className="cursor-pointer">{candidate.preview ? <Image src={candidate.preview} alt="후보 첨부 이미지" width={56} height={56} unoptimized className="h-14 w-14 rounded object-cover" /> : <Image src="/icons/Posts/greyImage.svg" alt="이미지 첨부" width={33} height={33} />}<input type="file" accept="image/*" className="hidden" onChange={(event) => attachCandidateImage(candidate.id, event.target.files?.[0])} /></label>{candidate.isUploading && <span className="ml-2 text-xs text-gray-2">업로드 중...</span>}</div><button type="button" onClick={() => candidates.length > 2 && setCandidates((current) => current.filter((item) => item.id !== candidate.id))} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-30" disabled={candidates.length <= 2}><Image src="/icons/Posts/trash.svg" alt="후보 삭제" width={30} height={33} /></button></div>)}</div>{imageUploadError && <p role="alert" className="mt-3 text-sm text-error">{imageUploadError}</p>}<button type="button" onClick={() => setCandidates((current) => [...current, { id: Date.now(), text: "", image: "", preview: "", isUploading: false }])} className="ml-0 mt-3 w-full max-w-[760px] cursor-pointer rounded-lg border border-gray-5 py-3 font-semibold">＋ 후보 추가</button></section>
        <section className="mt-8"><h3 className="mb-6 text-2xl font-semibold">4. 옵션 설정</h3><div className="flex flex-wrap items-center gap-6"><div className="flex items-center gap-3 font-semibold"><Image src="/icons/Posts/checkbox.svg" alt="" width={20} height={20} />투표 마감일 설정</div><button type="button" onClick={() => setPickerOpen(true)} className="flex h-14 min-w-[295px] cursor-pointer items-center justify-between rounded-lg border border-gray-5 px-5"><span className={deadline ? "" : "text-[20px] font-medium text-gray-2"}>{formatDateTime(deadline)}</span><Image src="/icons/Posts/calendar.svg" alt="" width={30} height={30} /></button></div></section>
        <div className="mt-8 flex justify-end gap-4"><button type="button" onClick={() => router.back()} className="cursor-pointer rounded-lg border border-gray-5 px-8 py-4 font-semibold">취소하기</button><button type="button" disabled={!canAdd} onClick={addVote} className="cursor-pointer rounded-lg bg-primary px-8 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3">추가하기</button></div>
      </form></div></main>{pickerOpen && <DateTimePicker value={deadline} label="투표 마감일" onClose={() => setPickerOpen(false)} onConfirm={(date) => { setDeadline(date); setPickerOpen(false); }} />}</div>
  );
}
