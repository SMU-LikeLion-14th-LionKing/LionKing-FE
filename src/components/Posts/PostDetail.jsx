"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import AiSuggestion from "./AiSuggestion";
import { formatDateTime } from "./DateTimePicker";
import api from "@/lib/api";
import { parseApiDate } from "@/lib/date";
import {
  DEFAULT_PROFILE_JSON,
  getProfileSnapshot,
  subscribeToProfile,
} from "@/lib/profileStorage";

const typeLabels = { task: "작업", question: "질문", note: "회의록" };
const colors = ["bg-[#ef6475]", "bg-[#8c73df]", "bg-green"];
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
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

function resolveFileUrl(fileUrl) {
  if (!fileUrl || /^(https?:|blob:|data:)/i.test(fileUrl)) return fileUrl;
  return `${apiBaseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

function getFileName(file, index) {
  if (file?.name) return file.name;
  if (!file?.fileUrl) return `첨부파일 ${index + 1}`;

  try {
    const path = file.fileUrl.split("?")[0];
    return decodeURIComponent(path.split("/").pop()) || `첨부파일 ${index + 1}`;
  } catch {
    return `첨부파일 ${index + 1}`;
  }
}

function isImageFile(file) {
  return (
    file?.fileType?.toLowerCase().startsWith("image") ||
    /\.(png|jpe?g|gif|webp|svg)$/i.test(file?.fileUrl?.split("?")[0] || "")
  );
}

function AttachmentItem({ file, index }) {
  const [imageUrl, setImageUrl] = useState(() =>
    file.preview ? resolveFileUrl(file.preview) : "",
  );
  const [imageError, setImageError] = useState("");
  const fileId =
    file?.fileId ??
    file?.file_id ??
    file?.attachmentId ??
    file?.attachment_id ??
    file?.id;
  const fileUrl = resolveFileUrl(file.fileUrl || file.preview);
  const fileName = getFileName(file, index);
  const imageFile = isImageFile(file);

  useEffect(() => {
    if (!imageFile || file.preview) return;

    if (fileId === undefined || fileId === null) {
      return;
    }

    const controller = new AbortController();
    const fetchImageUrl = async () => {
      try {
        const { data: result } = await api.get(
          `/api/files/${fileId}/download-url`,
          { signal: controller.signal },
        );
        const issuedUrl =
          typeof result?.data === "string"
            ? result.data
            : result?.data?.downloadUrl ||
              result?.data?.download_url ||
              result?.data?.url;
        if (result?.isSuccess === false || !issuedUrl) {
          throw new Error(
            result?.message || "이미지 주소를 발급받지 못했습니다.",
          );
        }
        setImageUrl(issuedUrl);
      } catch (error) {
        if (error.name !== "CanceledError") {
          setImageError(
            error.response?.data?.message ||
              error.message ||
              "이미지를 불러오지 못했습니다.",
          );
        }
      }
    };

    fetchImageUrl();
    return () => controller.abort();
  }, [file.preview, fileId, imageFile]);

  return (
    <a
      href={imageUrl || fileUrl}
      target="_blank"
      rel="noreferrer"
      className="block min-w-0 overflow-hidden rounded-lg bg-white"
    >
      {imageFile && imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={fileName}
          className="h-[280px] w-full bg-gray-4 object-contain"
        />
      ) : imageFile ? (
        <span className="flex h-[280px] items-center justify-center bg-gray-4 px-4 text-center text-sm text-gray-2">
          {imageError ||
            (fileId === undefined || fileId === null
              ? "이미지 파일 ID가 없습니다."
              : "이미지 불러오는 중...")}
        </span>
      ) : (
        <span className="flex items-center gap-3 p-3">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded bg-gray-4 text-xl">
            📎
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {fileName}
            </span>
            <span className="mt-1 block text-xs text-gray-2">
              클릭해서 파일 보기
            </span>
          </span>
        </span>
      )}
    </a>
  );
}

function AttachmentPanel({ files }) {
  return (
    <section className="min-h-[280px] overflow-hidden rounded-lg bg-[#f4faf7] lg:mr-10 lg:mt-2">
      <div className="grid max-h-[280px] gap-3 overflow-y-auto">
        {files.map((file, index) => (
          <AttachmentItem
            key={`${file.fileId ?? file.file_id ?? file.id ?? file.fileUrl}-${index}`}
            file={file}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function elapsed(value) {
  if (!value) return "방금 전";
  const date = parseApiDate(value);
  if (!date) return "방금 전";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return `${Math.floor(minutes / 1440)}일 전`;
}

function Avatar({ name, image = "", index = 0 }) {
  return <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ${colors[index % colors.length]} text-xl font-bold text-white`}>{image ? <Image src={image} alt={`${name} 프로필`} fill unoptimized className="object-cover" /> : name.slice(0, 1)}</div>;
}

function voteMeta(vote, now) {
  const responses = vote.responses ?? [];
  const hasVoted =
    vote.hasVoted ??
    responses.some((response) => response.voter === "current-user");
  const closed = Boolean(vote.deadline && new Date(vote.deadline).getTime() <= now);
  const counts =
    vote.counts ??
    vote.candidates.map(
      (_, index) =>
        responses.filter((response) => response.selections?.includes(index))
          .length,
    );
  const responseCount =
    vote.totalResponses ??
    vote.totalVoteCount ??
    responses.length;
  return { responses, responseCount, hasVoted, closed, counts };
}

function deadlineText(vote, now) {
  if (!vote.deadline) return "마감 기한 없음";
  const deadline = new Date(vote.deadline);
  const days = Math.max(0, Math.ceil((deadline.getTime() - now) / 86400000));
  return `D-${days} (${formatDateTime(deadline)} 마감)`;
}

function PollOptionImage({ option, width, height, className }) {
  const fileId =
    option.fileId ??
    option.file_id ??
    option.imageFileId ??
    option.image_file_id;
  const [imageUrl, setImageUrl] = useState(() =>
    fileId === undefined || fileId === null ? option.image || "" : "",
  );

  useEffect(() => {
    if (fileId === undefined || fileId === null) return;

    const controller = new AbortController();
    api
      .get(`/api/files/${fileId}/download-url`, {
        signal: controller.signal,
      })
      .then(({ data: result }) => {
        const issuedUrl =
          typeof result?.data === "string"
            ? result.data
            : result?.data?.downloadUrl ||
              result?.data?.download_url ||
              result?.data?.url;
        if (result?.isSuccess !== false && issuedUrl) {
          setImageUrl(issuedUrl);
        }
      })
      .catch((error) => {
        if (error.name !== "CanceledError") {
          console.error("투표 후보 이미지 조회 실패:", error);
        }
      });

    return () => controller.abort();
  }, [fileId]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl || "/icons/Posts/noImage.svg"}
      alt={imageUrl ? `${option.text} 후보 이미지` : "이미지 없음"}
      width={width}
      height={height}
      loading="eager"
      className={className}
    />
  );
}

function VoteSummary({ vote, now, onOpen }) {
  const { responseCount, hasVoted, closed, counts } = voteMeta(vote, now);
  return <section className="flex min-h-[280px] flex-col rounded-xl border border-gray-5 bg-white p-5 shadow-sm lg:mr-10 lg:mt-2" aria-label="투표 현황">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1"><strong className={closed ? "text-gray-3" : "text-primary"}>{closed ? "투표 마감" : hasVoted ? "투표 완료" : "투표 진행중"}</strong><span className="font-semibold">{deadlineText(vote, now)}</span></div>
    <p className="mt-3 text-lg font-bold">{vote.question}</p>
    <div className="mt-4 grid flex-1 gap-4 sm:grid-cols-[minmax(160px,0.9fr)_minmax(170px,1.1fr)]">
      <div className="grid grid-cols-2 gap-3">{vote.candidates.slice(0, 2).map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; return <div key={`${item.text}-${index}`} className="min-w-0"><div className="flex aspect-square items-center justify-center overflow-hidden bg-gray-4"><PollOptionImage option={item} width={180} height={180} className={item.image ? "h-full w-full object-cover" : "h-[72px] w-[72px]"} /></div><p className="mt-1 truncate text-sm font-medium">{item.text}</p></div>; })}</div>
      <div className="space-y-3 self-center">{vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate } : candidate; const percent = responseCount ? Math.round(((counts[index] ?? 0) / responseCount) * 100) : 0; return <div key={`${item.text}-${index}`}><p className="mb-1 truncate text-sm font-medium">{item.text}</p><div className="flex items-center gap-2"><span className="h-4 flex-1 overflow-hidden rounded-full bg-gray-5"><span className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></span><span className="w-[72px] shrink-0 text-sm">{counts[index] ?? 0}명 ({percent}%)</span></div></div>; })}</div>
    </div>
    <div className="mt-4 flex items-center gap-3 text-sm"><span className="text-gray-2">참여 {responseCount}명</span><button type="button" onClick={onOpen} disabled={closed || hasVoted} className="cursor-pointer font-semibold underline underline-offset-4 disabled:cursor-default disabled:text-gray-2">{hasVoted ? "투표 완료" : closed ? "투표 마감" : "투표하기"}</button></div>
  </section>;
}

function normalizePoll(poll) {
  const options = Array.isArray(poll?.options) ? poll.options : [];
  const counts = options.map(
    (option) =>
      option.voteCount ??
      option.vote_count ??
      option.count ??
      option.votes ??
      0,
  );

  return {
    pollId: poll?.pollId ?? poll?.poll_id ?? poll?.id,
    question: poll?.question || "",
    multiple:
      poll?.isMultipleChoice ??
      poll?.is_multiple_choice ??
      poll?.multiple ??
      false,
    deadline: poll?.deadline || null,
    candidates: options.map((option) => ({
      id:
        option.optionId ??
        option.option_id ??
        option.pollOptionId ??
        option.poll_option_id ??
        option.id,
      text: option.content ?? option.text ?? "",
      image: option.imageUrl ?? option.image_url ?? option.image ?? "",
      fileId:
        option.fileId ??
        option.file_id ??
        option.imageFileId ??
        option.image_file_id,
    })),
    counts,
    totalResponses:
      poll?.totalVoteCount ??
      poll?.total_vote_count ??
      poll?.participantCount ??
      poll?.participant_count ??
      counts.reduce((total, count) => total + count, 0),
    hasVoted: poll?.hasVoted ?? poll?.has_voted ?? false,
    responses: [],
  };
}

function applyPollResults(vote, result, hasVoted = vote.hasVoted) {
  const resultOptions = Array.isArray(result)
    ? result
    : result?.options ??
      result?.results ??
      result?.optionResults ??
      result?.option_results ??
      [];
  const counts = vote.candidates.map((candidate, index) => {
    const matchedOption = resultOptions.find((option) => {
      const optionId =
        option.optionId ??
        option.option_id ??
        option.pollOptionId ??
        option.poll_option_id ??
        option.id;
      return (
        optionId !== undefined &&
        optionId !== null &&
        String(optionId) === String(candidate.id)
      );
    });
    const option = matchedOption ?? resultOptions[index];
    return (
      option?.voteCount ??
      option?.vote_count ??
      option?.count ??
      option?.votes ??
      0
    );
  });

  return {
    ...vote,
    counts,
    totalResponses:
      result?.totalVoteCount ??
      result?.total_vote_count ??
      result?.totalVotes ??
      result?.total_votes ??
      result?.participantCount ??
      result?.participant_count ??
      counts.reduce((total, count) => total + count, 0),
    hasVoted,
  };
}

function VoteModal({
  vote,
  selections,
  onToggle,
  onSubmit,
  onClose,
  now,
  isSubmitting,
  submitError,
}) {
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
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; const selected = selections.includes(index); return <button key={`${item.text}-${index}`} type="button" onClick={() => onToggle(index)} aria-pressed={selected} className={`cursor-pointer rounded-xl border p-4 text-left transition ${selected ? "border-2 border-primary bg-third" : "border-gray-5 bg-white"}`}><span className="flex items-center justify-between gap-2 font-semibold"><span>후보 {index + 1}</span><span className={`h-5 w-5 rounded-full border-2 ${selected ? "border-[6px] border-primary" : "border-gray-5"}`} /></span><span className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-4"><PollOptionImage option={item} width={240} height={180} className={item.image ? "h-full w-full object-cover" : "h-[72px] w-[72px]"} /></span><span className="mt-3 block font-medium">{item.text}</span></button>; })}</div>
      {submitError && <p role="alert" className="mt-4 text-sm text-error">{submitError}</p>}
      <button type="button" onClick={onSubmit} disabled={!selections.length || closed || isSubmitting} className="mt-6 w-full cursor-pointer rounded-xl bg-primary py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-5">{isSubmitting ? "투표 중..." : "투표하기"}</button>
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
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [commentSubmitError, setCommentSubmitError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentActionId, setCommentActionId] = useState(null);
  const [commentActionError, setCommentActionError] = useState("");
  const [isPostDeleting, setIsPostDeleting] = useState(false);
  const [postActionError, setPostActionError] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [voteSelections, setVoteSelections] = useState([]);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [isVoteSubmitting, setIsVoteSubmitting] = useState(false);
  const [voteSubmitError, setVoteSubmitError] = useState("");
  const [now] = useState(() => Date.now());
  const profileSnapshot = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    () => DEFAULT_PROFILE_JSON,
  );
  const profile = useMemo(
    () => JSON.parse(profileSnapshot),
    [profileSnapshot],
  );
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

  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/api/users/me", { signal: controller.signal })
      .then(({ data: result }) => {
        if (result?.isSuccess !== false && result?.data?.name) {
          setCurrentUserName(result.data.name);
        }
      })
      .catch((error) => {
        if (error.name !== "CanceledError") {
          console.error("사용자 정보 조회 실패:", error);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const postId = decodeURIComponent(String(id));

    const fetchPost = async () => {
      try {
        const { data: result } = await api.get(`/api/posts/${postId}`, {
          signal: controller.signal,
        });
        if (result?.isSuccess === false || !result?.data) {
          throw new Error(result?.message || "게시글을 찾을 수 없습니다.");
        }

        const detail = result.data;
        let storedPollId = null;
        try {
          storedPollId = JSON.parse(
            localStorage.getItem("poll_ids_by_post_id") || "{}",
          )[String(detail.postId)];
        } catch {
          storedPollId = null;
        }
        const pollId =
          detail.pollId ??
          detail.poll_id ??
          detail.poll?.pollId ??
          detail.poll?.poll_id ??
          detail.poll?.id ??
          storedPollId;
        let vote = detail.poll ? normalizePoll(detail.poll) : null;

        if (
          detail.categoryName === "질문" &&
          pollId !== undefined &&
          pollId !== null
        ) {
          try {
            const { data: pollResult } = await api.get(
              `/api/polls/${pollId}`,
              { signal: controller.signal },
            );
            if (pollResult?.isSuccess !== false && pollResult?.data) {
              vote = normalizePoll(pollResult.data);

              let hasVoted = vote.hasVoted;
              try {
                const votedPollIds = JSON.parse(
                  localStorage.getItem("voted_poll_ids") || "[]",
                );
                hasVoted =
                  hasVoted ||
                  votedPollIds.some((id) => String(id) === String(pollId));
              } catch {
                hasVoted = vote.hasVoted;
              }

              try {
                const { data: resultsResponse } = await api.get(
                  `/api/polls/${pollId}/results`,
                  { signal: controller.signal },
                );
                if (
                  resultsResponse?.isSuccess !== false &&
                  resultsResponse?.data
                ) {
                  vote = applyPollResults(
                    vote,
                    resultsResponse.data,
                    hasVoted,
                  );
                } else {
                  vote = { ...vote, hasVoted };
                }
              } catch (resultsError) {
                if (resultsError.name === "CanceledError") throw resultsError;
                vote = { ...vote, hasVoted };
              }
            }
          } catch (pollError) {
            if (pollError.name === "CanceledError") throw pollError;
            console.error("투표 상세 조회 실패:", pollError);
          }
        }

        setPost({
          id: detail.postId,
          meetingId: detail.meetingId,
          type:
            Object.entries(typeLabels).find(
              ([, label]) => label === detail.categoryName,
            )?.[0] || detail.categoryName,
          author: detail.author,
          title: detail.title,
          content: detail.content,
          files: Array.isArray(detail.attachments)
            ? detail.attachments
            : [],
          reactionCount: detail.reactionCount ?? 0,
          commentCount: detail.commentCount ?? 0,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
          pollId,
          vote,
          isServerPost: true,
        });

        try {
          const { data: commentsResult } = await api.get(
            `/api/posts/${postId}/comments`,
            {
              params: { page: 0, size: 100 },
              signal: controller.signal,
            },
          );
          if (
            commentsResult?.isSuccess === false ||
            !Array.isArray(commentsResult?.data?.content)
          ) {
            throw new Error(
              commentsResult?.message || "댓글 목록을 불러오지 못했습니다.",
            );
          }

          setComments(
            commentsResult.data.content.map((comment, index) => ({
              id:
                comment.commentId ??
                comment.comment_id ??
                comment.id ??
                `server-comment-${index}`,
              author:
                comment.author?.name ||
                (typeof comment.author === "string"
                  ? comment.author
                  : "") ||
                comment.user?.name ||
                comment.writer?.name ||
                comment.authorName ||
                comment.userName ||
                "사용자",
              content: comment.content || "",
              createdAt:
                comment.createdAt ||
                comment.created_at ||
                new Date().toISOString(),
              updatedAt: comment.updatedAt || comment.updated_at || null,
              isServerComment: true,
            })),
          );
        } catch (commentsError) {
          if (commentsError.name !== "CanceledError") {
            console.error("댓글 목록 조회 실패:", commentsError);
            setComments([]);
          }
        }
      } catch (error) {
        if (error.name === "CanceledError") return;

        const posts = JSON.parse(
          localStorage.getItem("lionking-posts") ?? "[]",
        );
        const selectedPost =
          posts.find((item) => String(item.id) === postId) ?? null;
        setPost(selectedPost);
        setComments(
          JSON.parse(
            localStorage.getItem(`lionking-comments-${postId}`) ?? "[]",
          ),
        );
        setVoteSelections(
          selectedPost?.vote?.responses?.find(
            (response) => response.voter === "current-user",
          )?.selections ?? [],
        );
      } finally {
        if (!controller.signal.aborted) setLoaded(true);
      }
    };

    fetchPost();
    return () => controller.abort();
  }, [id]);

  const addComment = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isCommentSubmitting) return;

    if (!post?.isServerPost) {
      const next = [...comments, { id: crypto.randomUUID(), author: currentUserName || profile.name, content: trimmedContent, createdAt: new Date().toISOString() }];
      setComments(next);
      localStorage.setItem(`lionking-comments-${id}`, JSON.stringify(next));
      setContent("");
      return;
    }

    setIsCommentSubmitting(true);
    setCommentSubmitError("");

    try {
      const { data: result } = await api.post(`/api/posts/${post.id}/comments`, {
        content: trimmedContent,
      });
      if (result?.isSuccess === false || !result?.data) {
        throw new Error(result?.message || "댓글 등록에 실패했습니다.");
      }

      setComments((current) => [
        ...current,
        {
          id: result.data.commentId,
          author: currentUserName || profile.name,
          content: result.data.content,
          createdAt: result.data.createdAt,
          updatedAt: null,
          isServerComment: true,
        },
      ]);
      setPost((current) => ({
        ...current,
        commentCount: (current.commentCount ?? comments.length) + 1,
      }));
      setContent("");
    } catch (error) {
      setCommentSubmitError(
        error.response?.data?.message ||
          error.message ||
          "댓글 등록에 실패했습니다.",
      );
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const saveComments = (next) => {
    setComments(next);
    localStorage.setItem(`lionking-comments-${id}`, JSON.stringify(next));
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
    setCommentActionError("");
    setOpenMenu(null);
  };

  const updateComment = async () => {
    const trimmedContent = editingContent.trim();
    const targetComment = comments.find(
      (comment) => comment.id === editingId,
    );
    if (!trimmedContent || !targetComment || commentActionId) return;

    if (!targetComment.isServerComment) {
      saveComments(comments.map((comment) => comment.id === editingId ? { ...comment, content: trimmedContent, updatedAt: new Date().toISOString() } : comment));
      setEditingId(null);
      setEditingContent("");
      return;
    }

    setCommentActionId(targetComment.id);
    setCommentActionError("");
    try {
      const { data: result } = await api.patch(
        `/api/comments/${targetComment.id}`,
        { content: trimmedContent },
      );
      if (result?.isSuccess === false || !result?.data) {
        throw new Error(result?.message || "댓글 수정에 실패했습니다.");
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === targetComment.id
            ? {
                ...comment,
                content: result.data.content,
                updatedAt: result.data.updatedAt,
              }
            : comment,
        ),
      );
      setEditingId(null);
      setEditingContent("");
    } catch (error) {
      setCommentActionError(
        error.response?.data?.message ||
          error.message ||
          "댓글 수정에 실패했습니다.",
      );
    } finally {
      setCommentActionId(null);
    }
  };

  const removeComment = async (commentId) => {
    const targetComment = comments.find(
      (comment) => comment.id === commentId,
    );
    if (!targetComment || commentActionId) return;

    if (!targetComment.isServerComment) {
      saveComments(comments.filter((comment) => comment.id !== commentId));
      setOpenMenu(null);
      if (editingId === commentId) setEditingId(null);
      return;
    }

    setCommentActionId(commentId);
    setCommentActionError("");
    try {
      const { data: result } = await api.delete(
        `/api/comments/${commentId}`,
      );
      if (result?.isSuccess === false) {
        throw new Error(result?.message || "댓글 삭제에 실패했습니다.");
      }

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
      setPost((current) => ({
        ...current,
        commentCount: Math.max(0, (current.commentCount ?? comments.length) - 1),
      }));
      setOpenMenu(null);
      if (editingId === commentId) setEditingId(null);
    } catch (error) {
      setCommentActionError(
        error.response?.data?.message ||
          error.message ||
          "댓글 삭제에 실패했습니다.",
      );
    } finally {
      setCommentActionId(null);
    }
  };

  const toggleVoteSelection = (candidateIndex) => {
    if (post.vote.multiple) setVoteSelections((current) => current.includes(candidateIndex) ? current.filter((index) => index !== candidateIndex) : [...current, candidateIndex]);
    else setVoteSelections([candidateIndex]);
  };

  const submitVote = async () => {
    if (!voteSelections.length || !post.vote || isVoteSubmitting) return;

    const pollId = post.vote.pollId ?? post.pollId;
    if (pollId === undefined || pollId === null) {
      setVoteSubmitError("투표 ID를 찾을 수 없습니다.");
      return;
    }

    const optionIds = voteSelections
      .map((index) => post.vote.candidates[index]?.id)
      .filter((optionId) => optionId !== undefined && optionId !== null);
    if (optionIds.length !== voteSelections.length) {
      setVoteSubmitError("선택한 후보 ID를 찾을 수 없습니다.");
      return;
    }

    setIsVoteSubmitting(true);
    setVoteSubmitError("");
    try {
      const { data: voteResult } = await api.post(
        `/api/polls/${pollId}/votes`,
        { optionIds },
      );
      if (voteResult?.isSuccess === false) {
        throw new Error(voteResult.message || "투표에 실패했습니다.");
      }

      try {
        const votedPollIds = JSON.parse(
          localStorage.getItem("voted_poll_ids") || "[]",
        );
        if (!votedPollIds.some((id) => String(id) === String(pollId))) {
          localStorage.setItem(
            "voted_poll_ids",
            JSON.stringify([...votedPollIds, String(pollId)]),
          );
        }
      } catch {
        localStorage.setItem("voted_poll_ids", JSON.stringify([String(pollId)]));
      }

      const { data: resultsResponse } = await api.get(
        `/api/polls/${pollId}/results`,
      );
      if (resultsResponse?.isSuccess === false || !resultsResponse?.data) {
        throw new Error(
          resultsResponse?.message || "투표 결과를 불러오지 못했습니다.",
        );
      }

      setPost((current) => ({
        ...current,
        vote: applyPollResults(current.vote, resultsResponse.data, true),
      }));
      setVoteModalOpen(false);
      setVoteSelections([]);
    } catch (error) {
      setVoteSubmitError(
        error.response?.data?.message ||
          error.message ||
          "투표에 실패했습니다.",
      );
    } finally {
      setIsVoteSubmitting(false);
    }
  };

  const removePost = async () => {
    if (isPostDeleting) return;

    if (post.isServerPost) {
      setIsPostDeleting(true);
      setPostActionError("");
      try {
        const deleteUrl =
          post.type === "note"
            ? `/api/projects/${sessionStorage.getItem("selected_project_id")}/meetings/${post.id}`
            : `/api/posts/${post.id}`;
        const { data: result } = await api.delete(deleteUrl);
        if (result?.isSuccess === false) {
          throw new Error(result?.message || "게시글 삭제에 실패했습니다.");
        }
        router.push("/main");
      } catch (error) {
        setPostActionError(
          error.response?.data?.message ||
            error.message ||
            "게시글 삭제에 실패했습니다.",
        );
        setOpenMenu(null);
      } finally {
        setIsPostDeleting(false);
      }
      return;
    }

    const posts = JSON.parse(localStorage.getItem("lionking-posts") ?? "[]").filter((item) => String(item.id) !== String(post.id));
    localStorage.setItem("lionking-posts", JSON.stringify(posts));
    router.push("/main");
  };

  if (!loaded) return <main className="flex-1" />;
  if (!post) return <main className="flex flex-1 items-center justify-center"><div className="text-center"><p className="text-xl font-semibold">게시글을 찾을 수 없습니다.</p><Link href="/main" className="mt-4 inline-block text-primary">목록으로 돌아가기</Link></div></main>;

  const attachedFiles = post.files ?? [];
  const imageFiles = attachedFiles.filter(isImageFile);
  const image = post.coverImage;
  const hasVote = post.type === "question" && Boolean(post.vote);
  const authorName = post.author?.name || profile.name;
  const displayedCommentCount = Math.max(
    comments.length,
    post.commentCount ?? 0,
  );
  const meetingId =
    post.type === "note"
      ? post.meetingId ||
        (typeof window !== "undefined"
          ? JSON.parse(
          localStorage.getItem("meeting_ids_by_title") ||
            sessionStorage.getItem("meeting_ids_by_title") ||
            "{}",
            )[post.title]
          : null) ||
        post.id
      : post.id;
  const editVoteParam =
    post.type === "question" && post.vote
      ? `&vote=${encodeURIComponent(JSON.stringify(post.vote))}`
      : "";
  const editHref = post.isServerPost
    ? `/posts/create?edit=${encodeURIComponent(post.id)}&type=${encodeURIComponent(post.type)}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(post.content)}&files=${encodeURIComponent(JSON.stringify(post.files || []))}${editVoteParam}${post.type === "note" ? `&meetingId=${encodeURIComponent(meetingId)}&meetingDate=${encodeURIComponent(post.createdAt)}` : ""}`
    : `/posts/create?edit=${encodeURIComponent(post.id)}`;
  const canDeletePost = true;

  return (
    <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10"><div className="mx-auto w-full max-w-[1106px]">
      <div className="flex items-center gap-3"><Image src={teamIcon} alt="" width={45} height={45} /><h1 className="text-[36px] font-bold">{teamName}</h1></div>
      <article className="relative mt-10 min-h-[355px] rounded-xl border border-gray-5 p-7 lg:p-8"><div className={`grid gap-8 ${hasVote || image || imageFiles.length > 0 ? "lg:grid-cols-[minmax(0,0.8fr)_minmax(380px,1.2fr)] lg:gap-12" : ""}`}>
        <div className="flex min-h-[291px] flex-col"><span className="inline-flex w-fit rounded-full border border-primary px-3 py-1 text-sm font-medium">{typeLabels[post.type] ?? "게시글"}</span>
          <div className="mt-4 flex items-center gap-3"><Avatar name={authorName} image={post.isServerPost ? "" : profile.image} index={2} /><strong className="text-2xl font-medium">{authorName}</strong><span className="text-sm font-normal">{elapsed(post.createdAt)}</span></div>
          <h2 className="mt-6 text-2xl font-semibold">{post.title}</h2><p className="mt-3 whitespace-pre-wrap text-base font-normal leading-6">{post.content}</p>
          <div className="mt-auto pt-6"><div className="flex items-center gap-2 text-base font-normal"><Image src="/icons/Posts/reply.svg" alt="댓글" width={18} height={18} /><span>{displayedCommentCount}</span></div><div className="mt-2 flex items-center gap-2 text-sm font-normal"><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-2 text-[9px] text-white">✓</span><span>반응 {post.reactionCount ?? 0}</span></div></div>
        </div>
        {hasVote ? <VoteSummary vote={post.vote} now={now} onOpen={() => { setVoteSelections([]); setVoteModalOpen(true); }} /> : imageFiles.length > 0 ? <AttachmentPanel files={imageFiles} /> : image && <div className="flex min-h-[280px] items-center justify-center overflow-hidden bg-[#f4faf7] lg:mr-10 lg:mt-2"><Image src={image} alt="게시글 첨부 이미지" width={720} height={430} unoptimized className="max-h-[430px] w-full object-contain" /></div>}
      </div><div className="absolute right-[15px] top-[15px]"><button type="button" onClick={() => setOpenMenu((current) => current === "post" ? null : "post")} disabled={isPostDeleting} aria-label="게시글 메뉴" className="flex h-6 w-7 cursor-pointer items-center justify-center disabled:cursor-not-allowed"><Image src="/icons/Posts/more.svg" alt="" width={20} height={6} /></button>{openMenu === "post" && <div className="absolute right-0 top-8 z-20 w-[82px] overflow-hidden rounded-lg border border-gray-5 bg-white py-1 shadow-lg"><Link href={editHref} className="flex h-8 items-center gap-1 px-2 text-[15px] font-medium hover:bg-gray-4"><Image src="/icons/common/edit.svg" alt="" width={22} height={22} />수정</Link>{canDeletePost && <button type="button" onClick={removePost} disabled={isPostDeleting} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium text-[#FF0000] hover:bg-gray-4 disabled:cursor-not-allowed"><Image src="/icons/common/trash.svg" alt="" width={22} height={22} />{isPostDeleting ? "삭제중" : "삭제"}</button>}</div>}</div></article>
      {postActionError && <p role="alert" className="mt-3 text-sm text-error">{postActionError}</p>}

      <section className="mt-12"><h2 className="text-xl font-semibold">댓글 {displayedCommentCount}</h2><div className="mt-3 rounded-xl border border-gray-5 px-7 py-[30px]">
        {comments.length === 0 ? <p className="py-8 text-center text-gray-2">첫 댓글을 남겨보세요.</p> : <div className="space-y-[60px]">{comments.map((comment, index) => <div key={comment.id} className="relative flex gap-4 pr-12"><Avatar name={comment.author} index={index} /><div className="min-w-0 flex-1"><div className="flex items-end gap-4"><strong className="text-2xl font-medium">{comment.author}</strong><span className="mb-0.5 text-sm font-normal">{elapsed(comment.createdAt)}</span>{comment.updatedAt && <span className="mb-0.5 text-sm text-gray-2">수정됨</span>}</div>
          {editingId === comment.id ? <div className="mt-3"><textarea value={editingContent} onChange={(event) => { setEditingContent(event.target.value); setCommentActionError(""); }} autoFocus className="min-h-24 w-full resize-none rounded-lg border border-gray-5 p-3 text-xl outline-none focus:ring-2 focus:ring-primary" /><div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => { setEditingId(null); setEditingContent(""); setCommentActionError(""); }} disabled={commentActionId === comment.id} className="cursor-pointer rounded-lg border border-gray-5 px-4 py-2 disabled:cursor-not-allowed">취소</button><button type="button" onClick={updateComment} disabled={!editingContent.trim() || commentActionId === comment.id} className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-5">{commentActionId === comment.id ? "수정 중..." : "수정 완료"}</button></div></div> : <><p className="mt-2 whitespace-pre-wrap text-xl font-normal leading-7">{comment.content}</p><button type="button" className="mt-3 text-sm font-normal">답글</button></>}
        </div><div className="absolute right-[15px] top-[15px]"><button type="button" onClick={() => { setCommentActionError(""); setOpenMenu((current) => current === comment.id ? null : comment.id); }} disabled={commentActionId === comment.id} aria-label={`${comment.author} 댓글 메뉴`} aria-expanded={openMenu === comment.id} className="flex h-6 w-7 cursor-pointer items-center justify-center disabled:cursor-not-allowed"><Image src="/icons/Posts/more.svg" alt="" width={20} height={6} /></button>{openMenu === comment.id && <div className="absolute right-0 top-8 z-10 w-[82px] overflow-hidden rounded-lg border border-gray-5 bg-white py-1 shadow-lg"><button type="button" onClick={() => startEditing(comment)} disabled={commentActionId === comment.id} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium hover:bg-gray-4 disabled:cursor-not-allowed"><Image src="/icons/common/edit.svg" alt="" width={22} height={22} />수정</button><button type="button" onClick={() => removeComment(comment.id)} disabled={commentActionId === comment.id} className="flex h-8 w-full cursor-pointer items-center gap-1 px-2 text-[15px] font-medium text-[#FF0000] hover:bg-gray-4 disabled:cursor-not-allowed"><Image src="/icons/common/trash.svg" alt="" width={22} height={22} />{commentActionId === comment.id ? "처리중" : "삭제"}</button></div>}</div></div>)}</div>}
        {commentActionError && <p role="alert" className="mt-4 text-sm text-error">{commentActionError}</p>}
      </div></section>

      <section className="mt-7"><h2 className="text-2xl font-semibold">댓글 작성</h2><div className="relative mt-4 h-[141px] rounded-xl border border-gray-5 p-4 pb-14 focus-within:ring-2 focus-within:ring-primary"><textarea value={content} onChange={(event) => { setContent(event.target.value); setCommentSubmitError(""); }} placeholder="댓글을 작성하세요." className="h-full w-full resize-none text-xl font-medium outline-none placeholder:font-medium placeholder:text-[#969696]" /><button type="button" onClick={addComment} disabled={!content.trim() || isCommentSubmitting} className="absolute bottom-4 right-4 cursor-pointer rounded-lg bg-primary px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5">{isCommentSubmitting ? "등록 중..." : "등록"}</button></div>{commentSubmitError && <p role="alert" className="mt-2 text-sm text-error">{commentSubmitError}</p>}{content.trim() && <AiSuggestion type="comment" content={content} onApply={setContent} />}</section>
    </div>{voteModalOpen && hasVote && <VoteModal vote={post.vote} selections={voteSelections} onToggle={toggleVoteSelection} onSubmit={submitVote} onClose={() => { if (!isVoteSubmitting) { setVoteModalOpen(false); setVoteSubmitError(""); } }} now={now} isSubmitting={isVoteSubmitting} submitError={voteSubmitError} />}</main>
  );
}
