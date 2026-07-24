"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import DeadlineBadge from "@/components/common/DeadlineBadge";
import api from "@/lib/api";
import { parseApiDate } from "@/lib/date";
import {
  DEFAULT_PROFILE_JSON,
  getProfileSnapshot,
  subscribeToProfile,
} from "@/lib/profileStorage";

const svgIcons = {
  search: "/icons/main/search.svg",
  plus: "/icons/main/plus.svg",
  more: "/icons/main/more.svg",
  reaction: "/icons/main/reaction.svg",
  complete: "/icons/main/complete.svg",
  review: "/icons/main/review.svg",
  arrow: "/icons/main/arrow.svg",
  crown: "/icons/main/crown.svg",
  comment: "/icons/main/comment.svg",
};

const posts = [
  {
    isExample: true,
    type: "작업",
    typeClass: "border-primary text-gray-1",
    author: "김멋사",
    initial: "김",
    avatar: "bg-[#37bea1]",
    time: "1시간 전",
    title: "발표 PPT 1차 제작 완료",
    description: [
      "1~6페이지 제작",
      "문제점 파트까지 작성",
      "해결방안 파트는 미작성 (17일까지 완료 예정)",
      "디자인 통일성 관련 피드백 부탁드립니다.",
    ],
    comments: 2,
    content: "image",
    imageUrl: "/images/work.png",
    imageAlt: "JOBto-DO 발표 자료 미리보기",
  },
  {
    isExample: true,
    type: "질문",
    typeClass: "border-orange text-gray-1",
    author: "이땡땡",
    initial: "이",
    avatar: "bg-[#f36f83]",
    time: "2시간 전",
    title: "어떤 디자인이 더 좋을까요?",
    description: [
      "게시글 화면에 보이는 카드 디자인입니다.",
      "어떤 디자인이 더 직관적이고 깔끔해보이나요?",
      "첫 번째는 이미지 크게, 두 번째는 내용 위주로",
      "구성했습니다. 내일 18:00까지 의견 부탁드립니다!",
    ],
    comments: 7,
    content: "poll",
    pollImages: [
      {
        id: 1,
        imageUrl: "/images/placeholder.png",
        imageAlt: "후보 1 이미지",
      },
      {
        id: 2,
        imageUrl: "/images/placeholder.png",
        imageAlt: "후보 2 이미지",
      },
    ],
  },
  {
    isExample: true,
    type: "회의록",
    typeClass: "border-green text-gray-1",
    author: "김네모",
    initial: "김",
    avatar: "bg-[#9a7be4]",
    time: "어제",
    title: "7/6 서비스명 회의",
    description: ["2차 회의 내용을 요약 정리합니다."],
    comments: 1,
    content: "meeting",
  },
];

const CATEGORY_CLASS = {
  작업: "border-primary text-gray-1",
  질문: "border-orange text-gray-1",
  회의록: "border-green text-gray-1",
};

const REACTION_TYPE_MAP = {
  complete: "CONFIRMED",
  review: "REVIEWING",
};

function formatRelativeTime(value) {
  if (!value) return "";
  const date = parseApiDate(value);
  if (!date) return "";
  const difference = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(difference / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "어제" : `${days}일 전`;
}

function normalizePost(post) {
  const authorName = post.author?.name || "알 수 없음";
  return {
    id: post.postId,
    detailId: post.postId,
    type: post.categoryName || "게시글",
    typeClass: CATEGORY_CLASS[post.categoryName] || "border-gray-3 text-gray-1",
    author: authorName,
    initial: authorName.slice(0, 1),
    avatar: "bg-[#37bea1]",
    time: formatRelativeTime(post.createdAt),
    title: post.title,
    description: [],
    comments: post.commentCount ?? 0,
    reactionCount: post.reactionCount ?? 0,
    content: null,
  };
}

function resolveAttachmentUrl(fileUrl) {
  if (!fileUrl || /^https?:\/\//i.test(fileUrl)) return fileUrl;
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
    /\/$/,
    "",
  );
  return `${apiBaseUrl}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

function normalizePostDetail(detail, summary) {
  const basePost = normalizePost({ ...summary, ...detail });
  const attachments = Array.isArray(detail.attachments)
    ? detail.attachments
    : [];
  const imageAttachment = attachments.find(
    (attachment) =>
      attachment.fileType?.toLowerCase().startsWith("image") ||
      /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.fileUrl || ""),
  );

  return {
    ...basePost,
    description: detail.content ? detail.content.split(/\r?\n/) : [],
    content: imageAttachment ? "image" : null,
    imageUrl: imageAttachment
      ? resolveAttachmentUrl(imageAttachment.fileUrl)
      : null,
    imageAlt: `${detail.title || summary.title} 첨부 이미지`,
  };
}

function normalizeLocalPost(post, profile) {
  const typeLabels = {
    task: "작업",
    question: "질문",
    note: "회의록",
  };
  const type = typeLabels[post.type] || post.type || "게시글";
  return {
    id: `local-${post.id}`,
    detailId: post.id,
    type,
    typeClass:
      post.type === "task"
        ? "border-primary text-gray-1"
        : post.type === "question"
          ? "border-orange text-gray-1"
          : post.type === "note"
            ? "border-green text-gray-1"
            : "border-gray-3 text-gray-1",
    author: profile.name,
    initial: profile.name.trim().charAt(0),
    profileImage: profile.image || "",
    avatar: "bg-green",
    time: formatRelativeTime(post.createdAt),
    title: post.title,
    description: post.content ? post.content.split(/\r?\n/) : [],
    comments: 0,
    reactionCount: 0,
    content: post.vote ? "poll" : post.coverImage ? "image" : null,
    imageUrl: post.coverImage || null,
    imageAlt: `${post.title} 첨부 이미지`,
    pollVote: post.vote || null,
  };
}

const subscribeToProjectSelection = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getSelectedProjectId = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getSelectedTeamName = () =>
  sessionStorage.getItem("selected_team_name") || "라이온킹";
const getSelectedTeamIcon = () =>
  sessionStorage.getItem("selected_team_icon") || "/icons/Sidebar/lion.svg";
const getSelectedProjectTitle = () =>
  sessionStorage.getItem("selected_project_title") ||
  "AI로 팀원 간의 소통 오류를 없앨 수 있다면?";
const getServerProjectId = () => "";
const getServerTeamName = () => "라이온킹";
const getServerTeamIcon = () => "/icons/Sidebar/lion.svg";
const getServerProjectTitle = () =>
  "AI로 팀원 간의 소통 오류를 없앨 수 있다면?";

function SvgSlot({ name, className = "" }) {
  return (
    <Image
      src={svgIcons[name]}
      alt=""
      width={24}
      height={24}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}

function NotificationIcon({ src, className = "" }) {
  return (
    <span
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      style={{
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
  );
}

function CommentIcon() {
  return <SvgSlot name="comment" className="h-4 w-4" />;
}

function BoardHeader({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <nav className="flex gap-2.5" aria-label="게시글 필터">
        {["전체", "작업", "질문", "회의록"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
            aria-pressed={activeFilter === item}
            className={`h-10 min-w-[78px] rounded-[10px] border px-5 text-sm ${activeFilter === item ? "border-primary bg-primary font-semibold text-white" : "border-gray-5 bg-white text-gray-1"}`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-5">
        <label className="flex h-12 w-[288px] items-center gap-3 rounded-[20px] border border-gray-5 px-4 text-gray-2">
          <SvgSlot name="search" className="h-5 w-5" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-2"
            placeholder="검색"
          />
        </label>
        <Link
          href="/posts/create"
          className="flex h-12 items-center gap-2 rounded-[20px] bg-primary px-5 text-sm font-semibold text-white"
        >
          <SvgSlot name="plus" className="h-5 w-5" />
          게시글 작성
        </Link>
      </div>
    </header>
  );
}

function formatDeadline(value) {
  if (!value) return "2026.07.24";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(value))
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

function getDDay(value) {
  if (!value) return "D-17";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(value);
  deadline.setHours(0, 0, 0, 0);
  const difference = Math.ceil((deadline - today) / 86400000);
  if (difference === 0) return "D-DAY";
  return difference > 0 ? `D-${difference}` : `D+${Math.abs(difference)}`;
}

function ProjectOverview({
  summary,
  teamName,
  teamIcon,
  projectTitle,
  recentNotices,
  aiProgress,
  totalPostCount,
}) {
  const progressRate = Math.min(
    100,
    Math.max(
      0,
      Number(aiProgress?.currentProgressRate ?? summary?.progressRate) || 0,
    ),
  );
  const normalizedTotalPostCount = Number(totalPostCount) || 0;
  const completedPostCount = Math.round(
    (normalizedTotalPostCount * progressRate) / 100,
  );
  const displayTeamName = summary?.teamName || teamName;

  return (
    <>
      <header className="flex items-center gap-3 border-b border-gray-5 pb-5">
        <Image src={teamIcon} alt={displayTeamName} width={42} height={42} />
        <h1 className="text-[30px] font-bold">{displayTeamName}</h1>
      </header>

      <section className="mt-5 grid min-h-[210px] grid-cols-[1.1fr_.9fr] items-center gap-12 rounded-[10px] border border-gray-5 px-12 py-8">
        <div>
          <h2 className="text-[23px] font-bold tracking-[-.4px]">
            {summary?.title || projectTitle}
          </h2>
          <DeadlineBadge
            date={formatDeadline(summary?.deadline)}
            dDay={getDDay(summary?.deadline)}
            className="mt-4"
          />
        </div>
        <div>
          <p className="text-base font-semibold">전체 진행률</p>
          <strong className="mt-2 block text-[27px]">{progressRate}%</strong>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-5">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progressRate}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-gray-2">
            완료 {completedPostCount} / 전체 {normalizedTotalPostCount}
          </p>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-8">
        <section className="min-h-[210px] rounded-[10px] border border-[#dfe3e7] px-7 py-5 text-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center text-lg font-bold text-gray-1">
              <NotificationIcon
                src="/icons/notification/bot.svg"
                className="mr-2 h-6 w-6 bg-primary"
              />
              AI 브리핑
              <span className="ml-3 text-[11px] font-normal text-[#969696]">
                업데이트 10:30 AM
              </span>
            </h2>
            <button className="flex items-center gap-2 text-right text-[14px] font-medium leading-[140%] text-gray-2">
              자세히 보기
              <SvgSlot name="arrow" className="h-3 w-[7px]" />
            </button>
          </div>
          <div className="mt-4 leading-[1.55]">
            <p className="font-semibold">이번 주 우선순위</p>
            <p>
              · 와이어프레임 완성
              <br />· 백엔드 API 문서 확인
            </p>
            <div className="my-3 border-t border-[#e5e8eb]" />
            <p className="font-semibold">최근 소통 이슈</p>
            <p>
              · 디자인 관련 질문 게시물이 3건 등록되었습니다.
              <br />· 발표 자료 피드백 요청이 아직 확인되지 않았습니다.
            </p>
          </div>
        </section>

        <section className="min-h-[210px] rounded-[10px] border border-[#dfe3e7] px-7 py-5 text-sm">
          <div className="flex items-center justify-between pb-3">
            <h2 className="flex items-center text-lg font-bold text-gray-1">
              <NotificationIcon
                src="/icons/notification/notice.svg"
                className="mr-2 h-6 w-6 bg-orange"
              />
              공지사항
            </h2>
            <Link
              href="/notice"
              className="flex items-center gap-2 text-right text-[14px] font-medium leading-[140%] text-gray-2"
            >
              전체 보기
              <SvgSlot name="arrow" className="h-3 w-[7px]" />
            </Link>
          </div>
          <ul className="divide-y divide-[#e5e8eb] leading-[1.45]">
            {Array.isArray(recentNotices) && recentNotices.length > 0 ? (
              recentNotices.map((notice) => (
                <li key={notice.postId} className="flex gap-2 py-3">
                  <span aria-hidden="true">·</span>
                  <span className="min-w-0 flex-1 truncate">
                    {notice.title}
                  </span>
                </li>
              ))
            ) : typeof recentNotices === "string" &&
              recentNotices.trim() ? (
              <li className="whitespace-pre-line py-3">
                {recentNotices}
              </li>
            ) : (
              <li className="py-8 text-center text-gray-2">
                등록된 공지사항이 없습니다.
              </li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}

function ImagePreview({ src, alt }) {
  return (
    <div className="relative min-h-[278px] overflow-hidden bg-[#eaf7f2]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center border border-dashed border-[#bdd8ce] text-sm text-[#73968a]">
          이미지 URL 영역
        </div>
      )}
    </div>
  );
}

function PollPreview({ images }) {
  return (
    <div className="min-h-[256px] rounded-[10px] border border-[#b9bec4] p-7">
      <div className="flex items-baseline gap-5">
        <strong className="text-lg text-[#3182f6]">투표 진행중</strong>
        <span className="text-lg font-semibold">D-1 (7/10 18:00 마감)</span>
      </div>
      <div className="mt-5 flex items-center gap-7">
        <div className="grid grid-cols-2 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative h-[112px] w-[138px] overflow-hidden bg-[#dfe3e7]"
            >
              {image.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.imageUrl}
                  alt={image.imageAlt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  aria-label={`${image.imageAlt} 자리`}
                >
                  <span className="h-10 w-10 rounded-[8px] border-[5px] border-white" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="min-w-[205px] flex-1 space-y-3 text-xs">
          <div>
            <b>후보 1</b>
            <div className="mt-1 flex items-center gap-3">
              <div className="h-4 flex-1 rounded-full bg-[#e4e7ea]">
                <div className="h-full w-[70%] rounded-full bg-[#3182f6]" />
              </div>
              <span>7명 (70%)</span>
              <SvgSlot name="crown" className="h-5 w-5" />
            </div>
          </div>
          <div>
            <b>후보 2</b>
            <div className="mt-1 flex items-center gap-3">
              <div className="h-4 flex-1 rounded-full bg-[#e4e7ea]">
                <div className="h-full w-[30%] rounded-full bg-[#3182f6]" />
              </div>
              <span>3명 (30%)</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3 text-xs">
        <span className="text-[#969696]">참여 10명</span>
        <u className="font-semibold">투표하기</u>
      </div>
    </div>
  );
}

function LocalPollPreview({ vote }) {
  const candidates = vote?.candidates ?? [];
  const responses = vote?.responses ?? [];
  const counts = candidates.map(
    (_, index) =>
      responses.filter((response) => response.selections?.includes(index))
        .length,
  );
  const total = responses.length;
  const deadline = vote?.deadline
    ? new Date(vote.deadline).toLocaleString("ko-KR")
    : "기한 없음";

  return (
    <div className="min-h-[256px] rounded-[10px] border border-[#b9bec4] p-7">
      <div className="flex flex-wrap items-baseline gap-5">
        <strong className="text-lg text-primary">투표 진행중</strong>
        <span className="text-lg font-semibold">{deadline} 마감</span>
      </div>
      <h4 className="mt-4 text-lg font-bold">{vote?.question}</h4>
      <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(220px,0.8fr)_minmax(220px,1.2fr)]">
        <div className="grid grid-cols-2 gap-3">
          {candidates.slice(0, 2).map((candidate, index) => {
            const item =
              typeof candidate === "string"
                ? { text: candidate, image: "" }
                : candidate;
            return (
              <div key={`${item.text}-${index}`}>
                <div className="flex h-[112px] items-center justify-center overflow-hidden bg-[#dfe3e7]">
                  <Image
                    src={item.image || "/icons/Posts/noImage.svg"}
                    alt={`${item.text} 후보 이미지`}
                    width={72}
                    height={72}
                    unoptimized={Boolean(item.image)}
                    className={item.image ? "h-full w-full object-cover" : ""}
                  />
                </div>
                <p className="mt-1 truncate text-sm">{item.text}</p>
              </div>
            );
          })}
        </div>
        <div className="space-y-4 self-center text-sm">
          {candidates.map((candidate, index) => {
            const item =
              typeof candidate === "string" ? { text: candidate } : candidate;
            const percent = total
              ? Math.round((counts[index] / total) * 100)
              : 0;
            return (
              <div key={`${item.text}-${index}`}>
                <b>{item.text}</b>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-4 flex-1 rounded-full bg-[#e4e7ea]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span>
                    {counts[index]}명 ({percent}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex gap-3 text-sm">
        <span className="text-gray-2">참여 {total}명</span>
        <u className="font-semibold">투표하기</u>
      </div>
    </div>
  );
}

function MeetingPreview() {
  return (
    <div className="min-h-[292px] rounded-[10px] border border-[#e1e5e9] px-8 py-5 text-sm leading-[1.55]">
      <h4 className="text-lg font-bold text-[#3182f6]">AI 회의록 요약</h4>
      <p className="mt-2">📌 회의 목적: 서비스명 최종 후보 선정</p>
      <p className="mt-4">
        💡 핵심 논의
        <br />
        · 총 6개의 서비스명을 비교
        <br />· 의미 전달력과 서비스 컨셉을 중심으로 의견 공유
      </p>
      <p className="mt-4">
        🗳️ 투표 결과
        <br />
        · 1차: 티키타카 4표 / 디토크 4표 / 팀플리 4표
        <br />· 2차: 디토크 2표 / 팀플리 3표
      </p>
      <p className="mt-4">🏆 최종 결과 → 팀플리 당선</p>
    </div>
  );
}

function ReactionModal({ postId, onClose, onSelect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectReaction = async (typeKey) => {
    if (isLoading) return;

    const reactionType = REACTION_TYPE_MAP[typeKey];

    if (!postId) {
      if (onSelect) onSelect(typeKey);
      if (onClose) onClose();
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.put(`/api/posts/${postId}/reactions`, {
        reactionType,
      });

      const result = response.data;

      if (result?.isSuccess !== false) {
        if (onSelect) onSelect(typeKey, result?.data);
        if (onClose) onClose();
      } else {
        throw new Error(result?.message || "반응 처리에 실패했습니다.");
      }
    } catch (err) {
      console.error("게시글 반응 API 오류:", err);
      setError(
        err.response?.data?.message || err.message || "오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      role="dialog"
      aria-labelledby="reaction-modal-title"
      className="absolute left-0 top-[34px] z-50 w-[214px] rounded-[12px] border border-gray-3 bg-white px-4 pb-4 pt-3 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h2 id="reaction-modal-title" className="text-xl font-semibold">
          반응 추가
        </h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="모달 닫기"
          className="flex h-7 w-7 items-center justify-center text-[30px] font-light leading-none text-gray-3 hover:text-gray-1 disabled:opacity-50"
        >
          ×
        </button>
      </div>
      <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-5">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSelectReaction("complete")}
          className="flex h-[62px] w-full items-center gap-3 px-3 text-left hover:bg-gray-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SvgSlot name="complete" className="h-8 w-8" />
          <span>
            <strong className="block text-base font-semibold">확인 완료</strong>
            <span className="block text-[10px]">
              내용 확인했고, 이상 없어요!
            </span>
          </span>
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleSelectReaction("review")}
          className="flex h-[62px] w-full items-center gap-3 border-t border-gray-5 px-3 text-left hover:bg-gray-4 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SvgSlot name="review" className="h-8 w-8" />
          <span>
            <strong className="block text-base font-semibold">검토 중</strong>
            <span className="block text-[10px]">내용을 확인하고 있어요.</span>
          </span>
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-center text-[10px] text-red-500">{error}</p>
      ) : (
        <p className="mt-3 text-center text-[9px] text-gray-2">
          반응은 내가 변경하거나 취소할 수 있어요.
        </p>
      )}
    </section>
  );
}

function PostCard({ post, onReactionSaved }) {
  const [isReactionModalOpen, setIsReactionModalOpen] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({
    complete: 0,
    review: 0,
  });

  const handleReactionSelect = (reaction) => {
    setReactionCounts((counts) => {
      if (selectedReaction === reaction) return counts;
      return {
        ...counts,
        ...(selectedReaction && {
          [selectedReaction]: Math.max(0, counts[selectedReaction] - 1),
        }),
        [reaction]: counts[reaction] + 1,
      };
    });
    setSelectedReaction(reaction);
    setIsReactionModalOpen(false);
    if (onReactionSaved) onReactionSaved(reaction);
  };

  return (
    <>
      <article className="relative rounded-[10px] border border-[#dfe3e7] bg-white px-8 py-5">
        {post.detailId != null && (
          <Link
            href={`/posts/${encodeURIComponent(post.detailId)}`}
            aria-label={`${post.title} 상세 보기`}
            className="absolute inset-0 z-[1] rounded-[10px]"
          />
        )}
        <button
          className="absolute right-5 top-4 z-10 h-5 w-6"
          aria-label="더보기"
        >
          <SvgSlot name="more" className="h-full w-full" />
        </button>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs ${post.typeClass}`}
        >
          {post.type}
        </span>
        <div
          className={`mt-3 grid gap-12 ${
            post.content ? "grid-cols-[300px_minmax(0,1fr)]" : "grid-cols-1"
          }`}
        >
          <div className="flex min-h-[255px] flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`relative flex h-10 w-10 overflow-hidden items-center justify-center rounded-full text-xl font-bold text-white ${post.avatar}`}
              >
                {post.profileImage ? (
                  <Image
                    src={post.profileImage}
                    alt={`${post.author} 프로필`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  post.initial
                )}
              </span>
              <strong className="text-xl">{post.author}</strong>
              <span className="text-xs">{post.time}</span>
            </div>
            <h3 className="mt-5 text-[22px] font-bold">{post.title}</h3>
            <p className="mt-3 text-sm leading-[1.45]">
              {post.description.map((line, index) => (
                <span className="block" key={`${line}-${index}`}>
                  {line}
                </span>
              ))}
            </p>
            <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-2">
                <CommentIcon /> {post.comments}
              </span>
              {post.reactionCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <SvgSlot name="reaction" className="h-4 w-4" />
                  반응 {post.reactionCount}
                </span>
              )}
              {(!post.isExample || post.type === "작업") &&
                !selectedReaction && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsReactionModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-full border border-[#d8dde2] px-3 py-1"
                    >
                      <SvgSlot name="reaction" className="h-4 w-4" />
                      반응 추가
                    </button>
                    {isReactionModalOpen && (
                      <ReactionModal
                        postId={post.detailId}
                        onClose={() => setIsReactionModalOpen(false)}
                        onSelect={handleReactionSelect}
                      />
                    )}
                  </div>
                )}
              {reactionCounts.complete > 0 && (
                <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-green">
                  <SvgSlot name="complete" className="h-[17.5px] w-[17.5px]" />
                  확인 완료 {reactionCounts.complete}
                </span>
              )}
              {reactionCounts.review > 0 && (
                <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-yellow">
                  <SvgSlot name="review" className="h-[17.5px] w-[17.5px]" />
                  검토 중 {reactionCounts.review}
                </span>
              )}
              {post.isExample && post.type === "질문" && (
                <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-yellow">
                  <SvgSlot name="review" className="h-[17.5px] w-[17.5px]" />
                  검토 중 2
                </span>
              )}
              {post.isExample && post.type === "회의록" && (
                <>
                  <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-green">
                    <SvgSlot
                      name="complete"
                      className="h-[17.5px] w-[17.5px]"
                    />
                    확인 완료 3
                  </span>
                  <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-yellow">
                    <SvgSlot name="review" className="h-[17.5px] w-[17.5px]" />
                    검토 중 1
                  </span>
                </>
              )}
            </div>
          </div>
          {post.content === "image" && (
            <ImagePreview src={post.imageUrl} alt={post.imageAlt} />
          )}
          {post.content === "poll" &&
            (post.pollVote ? (
              <LocalPollPreview vote={post.pollVote} />
            ) : (
              <PollPreview images={post.pollImages} />
            ))}
          {post.content === "meeting" && <MeetingPreview />}
        </div>
      </article>
    </>
  );
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [localPosts, setLocalPosts] = useState([]);
  const [projectPosts, setProjectPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
  const profileSnapshot = useSyncExternalStore(
    subscribeToProfile,
    getProfileSnapshot,
    () => DEFAULT_PROFILE_JSON,
  );
  const profile = useMemo(() => JSON.parse(profileSnapshot), [profileSnapshot]);
  const [projectSummary, setProjectSummary] = useState(null);
  const [recentNoticeState, setRecentNoticeState] = useState({
    projectId: "",
    items: [],
  });
  const [aiProgressState, setAiProgressState] = useState({
    projectId: "",
    data: null,
  });
  const [postCountState, setPostCountState] = useState({
    projectId: "",
    count: 0,
  });
  const projectId = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedProjectId,
    getServerProjectId,
  );

  useEffect(() => {
    try {
      const storedPosts = JSON.parse(
        localStorage.getItem("lionking-posts") ?? "[]",
      );
      // localStorage는 클라이언트 마운트 이후에만 읽어 hydration 차이를 방지합니다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalPosts(
        Array.isArray(storedPosts)
          ? storedPosts.map((post) => normalizeLocalPost(post, profile))
          : [],
      );
    } catch {
      setLocalPosts([]);
    }
  }, [profile]);

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
  const projectTitle = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedProjectTitle,
    getServerProjectTitle,
  );

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    api
      .get(`/api/projects/${projectId}/posts`, {
        params: { page: 0, size: 10 },
      })
      .then(async (response) => {
        const result = response.data;
        if (result?.isSuccess === false) {
          throw new Error(result.message || "게시글 조회에 실패했습니다.");
        }
        const content = Array.isArray(result?.data?.content)
          ? result.data.content.filter((post) => {
              const categoryName = post.categoryName?.toLowerCase();
              return categoryName !== "공지사항" && categoryName !== "notice";
            })
          : [];
        const detailedPosts = await Promise.all(
          content.map(async (post) => {
            try {
              const detailResponse = await api.get(`/api/posts/${post.postId}`);
              const detailResult = detailResponse.data;
              if (detailResult?.isSuccess === false || !detailResult?.data) {
                return normalizePost(post);
              }
              return normalizePostDetail(detailResult.data, post);
            } catch {
              return normalizePost(post);
            }
          }),
        );
        if (isMounted) {
          setPostsError("");
          setProjectPosts(detailedPosts);
          setPostCountState({
            projectId: String(projectId),
            count: detailedPosts.length,
          });
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setPostCountState({
            projectId: String(projectId),
            count: 0,
          });
          setPostsError(
            requestError.response?.data?.message ||
              requestError.message ||
              "게시글을 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsPostsLoading(false);
      });

    api
      .get(`/api/projects/${projectId}`)
      .then((response) => {
        const result = response.data;
        if (
          isMounted &&
          result?.isSuccess !== false &&
          result?.data?.team_name
        ) {
          sessionStorage.setItem("selected_team_name", result.data.team_name);
          window.dispatchEvent(new Event("team-selection-changed"));
        }
      })
      .catch(() => {});

    api
      .get(`/api/projects/${projectId}/summary`)
      .then((response) => {
        if (isMounted && response.data?.isSuccess !== false) {
          setProjectSummary(response.data?.data ?? null);
        }
      })
      .catch(() => {});

    api
      .get(`/api/projects/${projectId}/notice/recent`)
      .then((response) => {
        const result = response.data;
        if (isMounted && result?.isSuccess !== false) {
          setRecentNoticeState({
            projectId: String(projectId),
            items:
              typeof result?.data === "string" || Array.isArray(result?.data)
                ? result.data
                : [],
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecentNoticeState({
            projectId: String(projectId),
            items: [],
          });
        }
      });

    api
      .get(`/api/projects/${projectId}/ai-progress`)
      .then((response) => {
        const result = response.data;
        if (isMounted && result?.isSuccess !== false) {
          setAiProgressState({
            projectId: String(projectId),
            data: result?.data ?? null,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setAiProgressState({
            projectId: String(projectId),
            data: null,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const visiblePosts = useMemo(() => {
    const combined = projectId ? projectPosts : [...localPosts, ...posts];
    return combined.filter((post) => {
      const matchesFilter =
        activeFilter === "전체" || post.type === activeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [localPosts, projectId, projectPosts, activeFilter, searchQuery]);

  const refreshSummaryAfterReaction = async () => {
    if (!projectId) return;

    try {
      const { data: result } = await api.get(
        `/api/projects/${projectId}/summary`,
      );
      if (result?.isSuccess !== false && result?.data) {
        setProjectSummary(result.data);
      }
    } catch {
      // 반응은 정상 저장되었으므로 기존 진행률을 유지하고 다음 조회에서 갱신합니다.
    }

    try {
      const { data: result } = await api.get(
        `/api/projects/${projectId}/ai-progress`,
      );
      if (result?.isSuccess !== false) {
        setAiProgressState({
          projectId: String(projectId),
          data: result?.data ?? null,
        });
      }
    } catch {
      // AI 진행률 재조회 실패 시 기존 값을 유지합니다.
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <div className="w-64 shrink-0">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1 px-8 py-10">
          <div className="w-full">
            <ProjectOverview
              summary={
                String(projectSummary?.id) === String(projectId)
                  ? projectSummary
                  : null
              }
              teamName={teamName}
              teamIcon={teamIcon}
              projectTitle={projectTitle}
              recentNotices={
                recentNoticeState.projectId === String(projectId)
                  ? recentNoticeState.items
                  : []
              }
              aiProgress={
                aiProgressState.projectId === String(projectId)
                  ? aiProgressState.data
                  : null
              }
              totalPostCount={
                postCountState.projectId === String(projectId)
                  ? postCountState.count
                  : 0
              }
            />
            <div className="mt-8 space-y-6">
              <BoardHeader
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {isPostsLoading && projectId && (
                <div className="py-8 text-center text-gray-2">
                  게시글을 불러오는 중...
                </div>
              )}

              {postsError && (
                <div className="py-4 text-center text-sm text-red-500">
                  {postsError}
                </div>
              )}

              <div className="space-y-4">
                {visiblePosts.map((post, index) => (
                  <PostCard
                    key={post.id || post.detailId || `post-${index}`}
                    post={post}
                    onReactionSaved={refreshSummaryAfterReaction}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
