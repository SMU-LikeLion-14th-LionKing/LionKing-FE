"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import api from "@/lib/api";
import AiSuggestion from "./AiSuggestion";
import DateTimePicker, { formatDateTime } from "./DateTimePicker";
import PostEditor, { RequiredMark, TextEditor } from "./PostEditor";

const postTypes = [
  { id: "task", title: "작업", description: "업무 진행 상황 공유", width: 58, height: 58 },
  { id: "question", title: "질문", description: "의견/도움 요청", width: 50, height: 50 },
  { id: "note", title: "회의록", description: "회의 내용 정리", width: 51, height: 49 },
];

const categoryIds = {
  task: 1,
  question: 2,
  note: 3,
};

const subscribeToProjectSelection = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () =>
    window.removeEventListener("team-selection-changed", callback);
};
const getSelectedProjectId = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getServerProjectId = () => "";
const getSelectedTeamName = () =>
  sessionStorage.getItem("selected_team_name") || "라이온킹";
const getSelectedTeamIcon = () =>
  sessionStorage.getItem("selected_team_icon") || "/icons/Sidebar/lion.svg";
const getServerTeamName = () => "라이온킹";
const getServerTeamIcon = () => "/icons/Sidebar/lion.svg";

const getSafeUploadFileName = (fileName) => {
  const extensionIndex = fileName.lastIndexOf(".");
  const extension =
    extensionIndex > -1
      ? fileName.slice(extensionIndex).replace(/[^a-zA-Z0-9.]/g, "")
      : "";
  const baseName = (extensionIndex > -1 ? fileName.slice(0, extensionIndex) : fileName)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return `${baseName || "attachment"}-${Date.now()}${extension.toLowerCase()}`;
};

const getCreatedPostId = (data) => {
  const candidate =
    data?.postId ??
    data?.post_id ??
    data?.id ??
    (typeof data === "number" ? data : null) ??
    (typeof data === "string" && /^\d+$/.test(data.trim())
      ? data.trim()
      : null);

  return candidate === undefined || candidate === null ? "" : String(candidate);
};

const getScheduleDates = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return [];
  }

  const dates = [];
  const current = new Date(start);
  while (dates.length < 366) {
    dates.push(new Date(current));
    if (
      current.getFullYear() === end.getFullYear() &&
      current.getMonth() === end.getMonth() &&
      current.getDate() === end.getDate()
    ) break;
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

const uploadAttachments = async (files, projectId) =>
  Promise.all(
    files.map(async (file) => {
      if (!file.file && file.fileUrl) {
        return {
          fileUrl: file.fileUrl,
          fileType: file.fileType || file.type || "",
        };
      }

      if (!file.file) {
        throw new Error(`${file.name || "첨부파일"}을 다시 선택해 주세요.`);
      }

      const formData = new FormData();
      formData.append(
        "file",
        file.file,
        getSafeUploadFileName(file.file.name),
      );
      const { data: result } = await api.post(
        `/api/projects/${projectId}/files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (result?.isSuccess === false) {
        throw new Error(result?.message || "첨부파일 업로드에 실패했습니다.");
      }
      const uploadedFileUrl =
        typeof result?.data === "string"
          ? result.data
          : result?.data?.fileUrl || result?.data?.url;
      if (!uploadedFileUrl) {
        throw new Error("파일 업로드 응답에 파일 URL이 없습니다.");
      }

      return {
        fileUrl: uploadedFileUrl.trim(),
        fileType:
          file.type || file.file.type || "application/octet-stream",
      };
    }),
  );

export default function PostCreatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedProjectId,
    getServerProjectId,
  );
  const teamName = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedTeamName,
    getServerTeamName,
  );
  const teamIcon = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedTeamIcon,
    getServerTeamIcon,
  );
  const editId = searchParams.get("edit");
  const meetingId = searchParams.get("meetingId") || editId;
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
  const [isAiMeetingMinutesApplied, setIsAiMeetingMinutesApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isValid = Boolean(projectId && title.trim() && content.trim() && (type !== "note" || meetingDate));

  const savePost = async () => {
    if (!isValid || isSubmitting) return;

    if (editId) {
      setIsSubmitting(true);
      setSubmitError("");

      try {
        let response;
        if (type === "note") {
          response = await api.patch(
            `/api/projects/${projectId}/meetings/${meetingId}`,
            {
              meetingTitle: title.trim(),
              meetingDate: meetingDate.toISOString(),
              rawContent: content.trim(),
              attendeeUserIds: [],
            },
          );
        } else {
          const attachments = await uploadAttachments(files, projectId);
          response = await api.patch(`/api/posts/${editId}/${type}`, {
            title: title.trim(),
            content: content.trim(),
            attachments,
          });
        }

        if (response.data?.isSuccess === false) {
          throw new Error(
            response.data.message || "게시글 수정에 실패했습니다.",
          );
        }

        sessionStorage.removeItem("lionking-post-draft");
        router.push(`/posts/${encodeURIComponent(editId)}`);
        router.refresh();
      } catch (requestError) {
        setSubmitError(
          requestError.response?.data?.message ||
            requestError.message ||
            "게시글 수정에 실패했습니다.",
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    try {
      let response;

      if (type === "note") {
        response = await api.post(`/api/projects/${projectId}/meetings`, {
          meetingTitle: title.trim(),
          meetingDate: meetingDate.toISOString(),
          rawContent: content.trim(),
          attendeeUserIds: [],
        });

        if (response.data?.isSuccess === false) {
          throw new Error(response.data.message || "회의록 등록에 실패했습니다.");
        }
        if (response.data?.data?.meetingId) {
          const storedMeetingIds = JSON.parse(
            localStorage.getItem("meeting_ids_by_title") || "{}",
          );
          const nextMeetingIds = {
            ...storedMeetingIds,
            [title.trim()]: String(response.data.data.meetingId),
          };
          localStorage.setItem(
            "meeting_ids_by_title",
            JSON.stringify(nextMeetingIds),
          );
          sessionStorage.setItem(
            "meeting_ids_by_title",
            JSON.stringify(nextMeetingIds),
          );
        }

        if (isAiMeetingMinutesApplied) {
          const { data: scheduleResult } = await api.post(
            "/api/ai/schedule-parse",
            { scheduleNotes: content.trim() },
          );
          if (
            scheduleResult?.isSuccess === false ||
            !Array.isArray(scheduleResult?.data?.schedules)
          ) {
            throw new Error(
              scheduleResult?.message || "AI 일정 분석에 실패했습니다.",
            );
          }

          await Promise.all(
            scheduleResult.data.schedules.flatMap((schedule) =>
              getScheduleDates(schedule.startTime, schedule.endTime).map(
                async (eventDate) => {
                  const { data: calendarResult } = await api.post(
                    `/api/projects/${projectId}/calendar`,
                    {
                      event_type: "작업",
                      title: schedule.title,
                      event_date: eventDate.toISOString(),
                    },
                  );
                  if (calendarResult?.isSuccess === false) {
                    throw new Error(
                      calendarResult.message || "AI 일정을 저장하지 못했습니다.",
                    );
                  }
                },
              ),
            ),
          );
        }
      } else {
        const attachments = await uploadAttachments(files, projectId);
        response = await api.post(
          `/api/projects/${projectId}/posts/${type}`,
          {
            categoryId: categoryIds[type],
            title: title.trim(),
            content: content.trim(),
            attachments,
          },
        );
      }

      const result = response.data;
      if (result?.isSuccess === false) {
        throw new Error(result.message || "게시글 등록에 실패했습니다.");
      }

      if (type === "question" && vote) {
        const postId = getCreatedPostId(result?.data);
        if (!postId) {
          throw new Error(
            "질문 게시글 응답에 postId가 없어 투표를 생성하지 못했습니다.",
          );
        }

        const { data: pollResult } = await api.post(
          `/api/posts/${postId}/polls`,
          {
            question: vote.question,
            isMultipleChoice: Boolean(vote.multiple),
            deadline: vote.deadline,
            options: vote.candidates.map((candidate) => {
              const option =
                typeof candidate === "string"
                  ? { text: candidate, image: "" }
                  : candidate;
              return {
                content: option.text,
                imageUrl: option.image || "",
              };
            }),
          },
        );

        if (pollResult?.isSuccess === false) {
          throw new Error(pollResult.message || "투표 생성에 실패했습니다.");
        }

        const pollId =
          pollResult?.data?.pollId ??
          pollResult?.data?.poll_id ??
          pollResult?.data?.id ??
          (typeof pollResult?.data === "number" ? pollResult.data : null) ??
          (typeof pollResult?.data === "string" &&
          /^\d+$/.test(pollResult.data.trim())
            ? pollResult.data.trim()
            : null);
        if (pollId !== undefined && pollId !== null) {
          const pollIdsByPost = JSON.parse(
            localStorage.getItem("poll_ids_by_post_id") || "{}",
          );
          localStorage.setItem(
            "poll_ids_by_post_id",
            JSON.stringify({
              ...pollIdsByPost,
              [postId]: String(pollId),
            }),
          );
        }
      }

      sessionStorage.removeItem("lionking-post-draft");
      router.push("/main");
      router.refresh();
    } catch (requestError) {
      setSubmitError(
        requestError.response?.data?.message ||
          requestError.message ||
          "게시글 등록에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const openVoteEditor = () => {
    sessionStorage.setItem("lionking-post-draft", JSON.stringify({ type: "question", title, content, files, vote, editId }));
    router.push(`/posts/create/vote${editId ? `?edit=${encodeURIComponent(editId)}` : ""}`);
  };

  return (
    <div className="flex min-h-screen bg-white"><Sidebar /><main className="ml-64 min-w-0 flex-1 bg-white p-5 sm:p-8 lg:p-10"><div className="mx-auto w-full max-w-7xl"><div className="flex items-center gap-3"><Image src={teamIcon} alt="" width={45} height={45} /><h1 className="text-[36px] font-bold">{teamName}</h1></div><h2 className="ml-6 mt-10 text-[32px] font-bold">{editId ? "게시글 수정" : "게시글 작성"}</h2>
      <form className="mt-8 rounded-xl border border-gray-5 px-8 py-12" onSubmit={(event) => event.preventDefault()}>
        <section><h2 className="mb-6 text-2xl font-semibold">1. 게시글 유형 선택<RequiredMark /></h2><div className="flex flex-wrap gap-[53px]">{postTypes.map((postType) => <button key={postType.id} type="button" onClick={() => { setType(postType.id); setContent(""); }} className={`flex h-[116px] w-[284px] cursor-pointer items-center justify-center gap-5 rounded-lg border-2 ${type === postType.id ? "border-primary" : "border-gray-5"}`}><Image src={`/icons/Posts/${postType.id}.svg`} alt="" width={postType.width} height={postType.height} /><span className="text-left"><strong className="block text-[20px] font-medium">{postType.title}</strong><span className="text-[18px] font-medium">{postType.description}</span></span></button>)}</div></section>
        {type !== "note" ? <><PostEditor title={title} setTitle={setTitle} content={content} setContent={setContent} files={files} setFiles={setFiles} afterContent={content.trim() ? <AiSuggestion type={type} content={content} onApply={setContent} /> : null} />{type === "question" && <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">5. 투표하기</h2>{vote ? <div className="rounded-lg border border-primary bg-third p-5"><div className="flex items-center justify-between"><strong className="text-primary">투표 · {vote.candidates.length}개 후보</strong><div className="flex gap-2"><button type="button" onClick={openVoteEditor} className="cursor-pointer rounded-lg bg-white px-4 py-2">수정</button><button type="button" onClick={() => setVote(null)} className="cursor-pointer rounded-lg bg-gray-5 px-4 py-2">삭제</button></div></div><p className="mt-3 font-semibold">{vote.question}</p><div className="mt-3 flex gap-3">{vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; const previewImage = item.preview || item.image; return <span key={`${item.text}-${index}`} className="flex flex-col gap-2 rounded bg-white p-2 text-sm"><Image src={previewImage || "/icons/Posts/noImage.svg"} alt="" width={80} height={72} unoptimized={Boolean(previewImage)} className="h-[72px] w-20 rounded object-cover" />{item.text}</span>; })}</div></div> : <div className="rounded-lg border border-dashed border-gray-5 p-8"><button type="button" onClick={openVoteEditor} className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-gray-5 px-5 py-3 text-[20px] font-semibold"><Image src="/icons/Posts/vote.svg" alt="" width={45} height={45} />투표 만들기</button><p className="mt-3 text-gray-2">질문에 대한 팀원들의 의견을 투표로 받아보세요.</p></div>}</section>}</> : <>
          <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">2. 회의 제목<RequiredMark /></h2><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력해주세요." className="h-14 w-full rounded-lg border border-gray-5 px-5 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2 focus:ring-2 focus:ring-primary" /></section>
          <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">3. 회의 날짜<RequiredMark /></h2><button type="button" onClick={() => setPickerOpen(true)} className="flex h-14 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-5 px-5 text-left"><span className={meetingDate ? "text-black" : "text-[20px] font-medium text-gray-2"}>{formatDateTime(meetingDate)}</span><Image src="/icons/Posts/calendar.svg" alt="" width={30} height={30} /></button></section>
          <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">4. 회의 내용<RequiredMark /></h2><TextEditor value={content} onChange={(nextContent) => { setContent(nextContent); setIsAiMeetingMinutesApplied(false); }} />{content.trim() && <AiSuggestion type="note" content={content} projectId={projectId} onApply={(suggestedContent) => { setContent(suggestedContent); setIsAiMeetingMinutesApplied(true); }} />}</section>
        </>}
      </form><div className="flex items-center justify-end gap-4 py-5">{!projectId && <p role="alert" className="text-sm font-medium text-error">프로젝트를 먼저 선택해 주세요.</p>}{submitError && <p role="alert" className="text-sm font-medium text-error">{submitError}</p>}<button type="button" onClick={savePost} disabled={!isValid || isSubmitting} className="cursor-pointer rounded-lg bg-primary px-7 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3">{isSubmitting ? "등록 중..." : editId ? "수정 완료" : "게시글 등록하기"}</button></div></div></main>
      {pickerOpen && <DateTimePicker value={meetingDate} label="회의일" onClose={() => setPickerOpen(false)} onConfirm={(date) => { setMeetingDate(date); setPickerOpen(false); }} />}
    </div>
  );
}
