"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import DeadlineBadge from "@/components/common/DeadlineBadge";
import api from "@/lib/api";

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

const subscribeToProjectSelection = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () =>
    window.removeEventListener("team-selection-changed", callback);
};
const getSelectedProjectId = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getSelectedTeamName = () =>
  sessionStorage.getItem("selected_team_name") || "라이온킹";
const getSelectedTeamIcon = () =>
  sessionStorage.getItem("selected_team_icon") ||
  "/icons/Sidebar/lion.svg";
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

function BoardHeader({ activeFilter, onFilterChange }) {
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
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-2"
            placeholder="검색"
          />
        </label>
        <button className="flex h-12 items-center gap-2 rounded-[20px] bg-primary px-5 text-sm font-semibold text-white">
          <SvgSlot name="plus" className="h-5 w-5" />
          게시글 작성
        </button>
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

function ProjectOverview({ summary, teamName, teamIcon, projectTitle }) {
  return (
    <>
      <header className="flex items-center gap-3 border-b border-gray-5 pb-5">
        <Image
          src={teamIcon}
          alt={teamName}
          width={42}
          height={42}
        />
        <h1 className="text-[30px] font-bold">{teamName}</h1>
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
          <strong className="mt-2 block text-[27px]">47%</strong>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-5">
            <div className="h-full w-[47%] rounded-full bg-primary" />
          </div>
          <p className="mt-3 text-xs text-gray-2">완료 12 / 전체20</p>
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
            <li className="py-3">
              · 7/24(수) 18:00 최종 발표
              <br />└ 7/22까지 발표 시연 영상 제출
            </li>
            <li className="py-3">· 7/14 회의 장소 변경 - 공학관 205</li>
            <li className="py-3">
              · API 명세서 공유
              <br />└ 7/14까지 첨부파일 확인
            </li>
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
        // API가 반환하는 이미지 URL을 그대로 표시하는 영역입니다.
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
                // API가 반환하는 후보 이미지 URL을 표시합니다.
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

function MeetingPreview() {
  return (
    <div className="min-h-[292px] rounded-[10px] border border-[#e1e5e9] px-8 py-5 text-sm leading-[1.55]">
      <h4 className="text-lg font-bold text-[#3182f6]">AI 회의록 요약</h4>
      <p className="mt-2">📌 회의 목적: 서비스명 최종 후보 선정</p>
      <p className="mt-4">
        💡 핵심 논의
        <br />
        　· 총 6개의 서비스명을 비교
        <br />
        　· 의미 전달력과 서비스 컨셉을 중심으로 의견 공유
      </p>
      <p className="mt-4">
        🗳️ 투표 결과
        <br />
        　· 1차: 티키타카 4표 / 디토크 4표 / 팀플리 4표
        <br />
        　· 2차: 디토크 2표 / 팀플리 3표
      </p>
      <p className="mt-4">🏆 최종 결과 → 팀플리 당선</p>
    </div>
  );
}

function ReactionModal({ onClose, onSelect }) {
  return (
      <section
        role="dialog"
        aria-labelledby="reaction-modal-title"
        className="absolute left-0 top-[34px] z-50 w-[214px] rounded-[12px] border border-gray-3 bg-white px-4 pb-4 pt-3 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 id="reaction-modal-title" className="text-xl font-semibold">반응 추가</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="모달 닫기"
            className="flex h-7 w-7 items-center justify-center text-[30px] font-light leading-none text-gray-3"
          >
            ×
          </button>
        </div>
        <div className="mt-3 overflow-hidden rounded-[10px] border border-gray-5">
          <button type="button" onClick={() => onSelect("complete")} className="flex h-[62px] w-full items-center gap-3 px-3 text-left hover:bg-gray-4">
            <SvgSlot name="complete" className="h-8 w-8" />
            <span><strong className="block text-base font-semibold">확인 완료</strong><span className="block text-[10px]">내용 확인했고, 이상 없어요!</span></span>
          </button>
          <button type="button" onClick={() => onSelect("review")} className="flex h-[62px] w-full items-center gap-3 border-t border-gray-5 px-3 text-left hover:bg-gray-4">
            <SvgSlot name="review" className="h-8 w-8" />
            <span><strong className="block text-base font-semibold">검토 중</strong><span className="block text-[10px]">내용을 확인하고 있어요.</span></span>
          </button>
        </div>
        <p className="mt-3 text-center text-[9px] text-gray-2">반응은 내가 변경하거나 취소할 수 있어요.</p>
      </section>
  );
}

function PostCard({ post }) {
  const [isReactionModalOpen, setIsReactionModalOpen] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState({ complete: 0, review: 0 });

  const handleReactionSelect = (reaction) => {
    setReactionCounts((counts) => {
      if (selectedReaction === reaction) return counts;
      return {
        ...counts,
        ...(selectedReaction && { [selectedReaction]: Math.max(0, counts[selectedReaction] - 1) }),
        [reaction]: counts[reaction] + 1,
      };
    });
    setSelectedReaction(reaction);
    setIsReactionModalOpen(false);
  };

  return (
    <>
    <article className="relative rounded-[10px] border border-[#dfe3e7] bg-white px-8 py-5">
      <button className="absolute right-5 top-4 h-5 w-6" aria-label="더보기">
        <SvgSlot name="more" className="h-full w-full" />
      </button>
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs ${post.typeClass}`}
      >
        {post.type}
      </span>
      <div className="mt-3 grid grid-cols-[300px_minmax(0,1fr)] gap-12">
        <div className="flex min-h-[255px] flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-white ${post.avatar}`}
            >
              {post.initial}
            </span>
            <strong className="text-xl">{post.author}</strong>
            <span className="text-xs">{post.time}</span>
          </div>
          <h3 className="mt-5 text-[22px] font-bold">{post.title}</h3>
          <p className="mt-3 text-sm leading-[1.45]">
            {post.description.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <CommentIcon /> {post.comments}
            </span>
            {post.type === "작업" && !selectedReaction && (
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
                  onClose={() => setIsReactionModalOpen(false)}
                  onSelect={handleReactionSelect}
                />
              )}
              </div>
            )}
            {post.type === "작업" && reactionCounts.complete > 0 && (
              <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-green">
                <SvgSlot name="complete" className="h-[17.5px] w-[17.5px]" />
                확인 완료 {reactionCounts.complete}
              </span>
            )}
            {post.type === "작업" && reactionCounts.review > 0 && (
              <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-yellow">
                <SvgSlot name="review" className="h-[17.5px] w-[17.5px]" />
                검토 중 {reactionCounts.review}
              </span>
            )}
            {post.type === "질문" && (
              <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-yellow">
                <SvgSlot name="review" className="h-[17.5px] w-[17.5px]" />
                검토 중 2
              </span>
            )}
            {post.type === "회의록" && (
              <>
                <span className="flex h-[21px] w-[91px] items-center justify-center gap-[5px] text-xs text-green">
                  <SvgSlot name="complete" className="h-[17.5px] w-[17.5px]" />
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
        {post.content === "poll" && <PollPreview images={post.pollImages} />}
        {post.content === "meeting" && <MeetingPreview />}
      </div>
    </article>
    </>
  );
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("전체");
  const [projectSummary, setProjectSummary] = useState(null);
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
  const projectTitle = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedProjectTitle,
    getServerProjectTitle,
  );

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    api
      .get(`/api/projects/${projectId}`)
      .then((response) => {
        const result = response.data;
        if (
          isMounted &&
          result?.isSuccess !== false &&
          result?.data?.team_name
        ) {
          sessionStorage.setItem(
            "selected_team_name",
            result.data.team_name,
          );
          window.dispatchEvent(new Event("team-selection-changed"));
        }
      })
      .catch(() => {
        // 팀 선택 조회가 실패하면 생성 단계에서 저장한 팀명을 유지합니다.
      });

    api
      .get(`/api/projects/${projectId}/summary`)
      .then((response) => {
        if (isMounted && response.data?.isSuccess !== false) {
          setProjectSummary(response.data?.data ?? null);
        }
      })
      .catch(() => {
        // 생성 직후 저장된 프로젝트 ID로 요약을 불러오지 못하면 기본 UI를 유지합니다.
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);
  const filteredPosts =
    activeFilter === "전체"
      ? posts
      : posts.filter((post) => post.type === activeFilter);

  return (
    <div className="flex h-screen min-w-[1180px] overflow-hidden bg-white text-[#111]">
      <div className="shrink-0">
        <Sidebar />
      </div>
      <main className="ml-64 min-w-0 flex-1 overflow-y-auto px-8 py-7">
        <div className="mx-auto w-full max-w-[1180px]">
          <ProjectOverview
            summary={projectSummary}
            teamName={teamName}
            teamIcon={teamIcon}
            projectTitle={projectTitle}
          />
          <div className="mt-10">
            <BoardHeader
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
          <section className="mt-4 space-y-6 pb-10">
            {filteredPosts.map((post) => (
              <PostCard key={post.type} post={post} />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
