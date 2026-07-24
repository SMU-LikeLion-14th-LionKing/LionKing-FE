<<<<<<< HEAD
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar/Sidebar";

const NOTICES = [
  {
    id: 1,
    title: "최종 발표 일정 변경 안내",
    date: "2026.07.14(화) 18:00",
    lines: [
      "7/24 (목) 18:00 최종 발표",
      "→ 7/22(화)까지 발표 자료 및 시연 영상 제출 부탁드립니다.",
      "",
      "+ 시연 영상 5분 이내",
    ],
  },
  {
    id: 2,
    title: "7/14 회의 장소 변경 안내",
    date: "2026.07.13(월) 13:00",
    lines: [
      "7/14(월) 회의 장소 변경되었습니다.",
      "기존: 공학관 207 → 변경: 공학관 205",
    ],
  },
  {
    id: 3,
    title: "API 명세서 공유 안내",
    date: "2026.07.12(일) 19:20",
    lines: [
      "API 명세서 최신 버전 공유",
      "7/14(월)까지 첨부된 내용 확인해주세요.",
    ],
  },
  {
    id: 4,
    title: "다음주 일정 안내",
    date: "2026.07.12(일) 09:40",
    lines: [
      "다음주 (7/15~7/18) 주요 일정 안내",
      "ㆍ7/15(화): 중간 점검 회의",
      "ㆍ7/16(수): 와이어프레임 최종 확인",
      "ㆍ7/17(목)~7/18(금): 기능 구현 및 테스트",
    ],
  },
];
=======
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import api from "@/lib/api";

const PAGE_SIZE = 10;

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
  sessionStorage.getItem("selected_team_icon") || "/icons/Sidebar/lion.svg";
const getServerProjectId = () => "";
const getServerTeamName = () => "라이온킹";
const getServerTeamIcon = () => "/icons/Sidebar/lion.svg";

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
>>>>>>> origin/develop

function NoticeCard({ notice }) {
  return (
    <article className="relative min-h-[114px] rounded-[10px] border border-gray-5 px-5 py-5 sm:px-7 sm:pr-48">
      <h3 className="text-[22px] font-semibold tracking-[-0.3px] text-gray-1">
        {notice.title}
      </h3>
<<<<<<< HEAD
      <div className="mt-2 text-sm leading-[1.45] text-gray-1">
        {notice.lines.map((line, index) =>
          line ? <p key={index}>{line}</p> : <div key={index} className="h-3" />,
        )}
      </div>
      <time className="mt-3 block text-sm text-gray-1 sm:absolute sm:right-7 sm:top-5 sm:mt-0">
        {notice.date}
=======
      <p className="mt-2 whitespace-pre-wrap text-sm leading-[1.45] text-gray-1">
        {notice.content}
      </p>
      <time
        dateTime={notice.createdAt}
        className="mt-3 block text-sm text-gray-1 sm:absolute sm:right-7 sm:top-5 sm:mt-0"
      >
        {formatDate(notice.createdAt)}
>>>>>>> origin/develop
      </time>
    </article>
  );
}

export default function ProjectNoticesPage() {
<<<<<<< HEAD
=======
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
  const [notices, setNotices] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();
    const loadNotices = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: result } = await api.get(
          `/api/projects/${projectId}/notice`,
          {
            params: { page, size: PAGE_SIZE },
            signal: controller.signal,
          },
        );

        if (result?.isSuccess === false) {
          throw new Error(result.message || "공지사항을 불러오지 못했습니다.");
        }

        const pageData = result?.data;
        setNotices(Array.isArray(pageData?.content) ? pageData.content : []);
        setTotalPages(pageData?.totalPages ?? 0);
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED") return;
        setNotices([]);
        setTotalPages(0);
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "공지사항을 불러오지 못했습니다.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadNotices();

    return () => controller.abort();
  }, [projectId, page]);

  const displayError = projectId
    ? error
    : "공지사항을 확인할 프로젝트를 선택해주세요.";

>>>>>>> origin/develop
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-9">
        <section className="mx-auto w-full max-w-[1080px]">
          <header className="flex items-center gap-3">
            <Image
<<<<<<< HEAD
              src="/icons/Sidebar/lion.svg"
=======
              src={teamIcon}
>>>>>>> origin/develop
              alt=""
              width={38}
              height={38}
            />
            <h1 className="text-[32px] font-bold tracking-[-0.7px] text-gray-1">
<<<<<<< HEAD
              라이온킹
=======
              {teamName}
>>>>>>> origin/develop
            </h1>
          </header>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-[26px] font-bold tracking-[-0.4px] text-gray-1">
              공지사항
            </h2>
            <div className="text-right">
              <Link
                href="/notice/create"
                className="inline-flex h-11 items-center rounded-[20px] bg-primary px-5 text-base font-semibold text-white transition hover:bg-secondary"
              >
                <span className="mr-1 text-2xl font-light leading-none">+</span>
                공지사항 작성
              </Link>
              <p className="mt-2 text-xs text-gray-2">
                (권한 부여된 사용자만 작성 가능)
              </p>
            </div>
          </div>

<<<<<<< HEAD
          <div className="mt-7 space-y-2">
            {NOTICES.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
=======
          <div className="mt-7 space-y-2" aria-busy={loading}>
            {loading && (
              <p className="py-16 text-center text-gray-2">
                공지사항을 불러오는 중입니다.
              </p>
            )}
            {!loading && displayError && (
              <p role="alert" className="py-16 text-center text-error">
                {displayError}
              </p>
            )}
            {!loading && !displayError && notices.length === 0 && (
              <p className="py-16 text-center text-gray-2">
                등록된 공지사항이 없습니다.
              </p>
            )}
            {!loading &&
              !displayError &&
              notices.map((notice, index) => (
                <NoticeCard
                  key={`${notice.createdAt}-${notice.title}-${index}`}
                  notice={notice}
                />
              ))}
          </div>

          {!loading && !displayError && totalPages > 1 && (
            <nav
              aria-label="공지사항 페이지"
              className="mt-8 flex items-center justify-center gap-3"
            >
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 0}
                className="rounded-lg border border-gray-5 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-sm text-gray-2">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page + 1 >= totalPages}
                className="rounded-lg border border-gray-5 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음
              </button>
            </nav>
          )}
>>>>>>> origin/develop
        </section>
      </main>
    </div>
  );
}
