"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import api from "@/lib/api";
import { parseApiDate } from "@/lib/date";
import ActivityCard from "./ActivityCard";

const formatDate = (createdAt) => {
  if (!createdAt) return "";

  const date = parseApiDate(createdAt);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const getPart = (type) => parts.find((part) => part.type === type)?.value;

  return `${getPart("year")}.${getPart("month")}.${getPart("day")}`;
};

const ACTIVITY_TYPE_LABELS = {
  POST: "게시글",
  COMMENT: "댓글",
  작업: "게시글",
  질문: "게시글",
  회의록: "게시글",
  게시글: "게시글",
  댓글: "댓글",
};

const subscribeToProject = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getProjectIdSnapshot = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getProjectNameSnapshot = () =>
  sessionStorage.getItem("selected_team_name") || "";
const getServerSnapshot = () => "";

const isMyActivity = (author, user) => {
  const authorId =
    author?.userId ??
    author?.user_id ??
    author?.id;
  const userId =
    user?.userId ??
    user?.user_id ??
    user?.id;

  if (authorId !== undefined && authorId !== null && userId !== undefined && userId !== null) {
    return String(authorId) === String(userId);
  }

  return Boolean(author?.name && user?.name && author.name === user.name);
};

export default function ActivitySection() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const projectId = useSyncExternalStore(
    subscribeToProject,
    getProjectIdSnapshot,
    getServerSnapshot,
  );
  const projectName = useSyncExternalStore(
    subscribeToProject,
    getProjectNameSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchActivities = async () => {
      if (!projectId) {
        setActivities([]);
        setError("프로젝트를 먼저 선택해 주세요.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [{ data: userResult }, { data: postsResult }] = await Promise.all([
          api.get("/api/users/me", { signal: controller.signal }),
          api.get(`/api/projects/${projectId}/posts`, {
            params: { page: 0, size: 100 },
            signal: controller.signal,
          }),
        ]);

        if (userResult?.isSuccess === false || !userResult?.data) {
          throw new Error(
            userResult?.message || "사용자 정보를 불러오지 못했습니다.",
          );
        }

        const posts = Array.isArray(postsResult?.data?.content)
          ? postsResult.data.content
          : Array.isArray(postsResult?.data)
            ? postsResult.data
            : [];

        if (postsResult?.isSuccess === false) {
          throw new Error(
            postsResult?.message || "게시글 목록을 불러오지 못했습니다.",
          );
        }

        const postActivities = posts
          .filter((post) => isMyActivity(post.author, userResult.data))
          .map((post) => ({
            type: "게시글",
            title: post.title || "제목 없는 게시글",
            project_name: projectName,
            created_at: post.createdAt || post.created_at,
          }));

        const commentGroups = await Promise.all(
          posts.map(async (post) => {
            const postId = post.postId ?? post.post_id ?? post.id;
            if (postId === undefined || postId === null) return [];

            try {
              const { data: commentsResult } = await api.get(
                `/api/posts/${postId}/comments`,
                {
                  params: { page: 0, size: 100 },
                  signal: controller.signal,
                },
              );
              if (commentsResult?.isSuccess === false) return [];

              const comments = Array.isArray(commentsResult?.data?.content)
                ? commentsResult.data.content
                : Array.isArray(commentsResult?.data)
                  ? commentsResult.data
                  : [];

              return comments
                .filter((comment) =>
                  isMyActivity(
                    comment.author ||
                      comment.user ||
                      comment.writer || {
                        userId: comment.userId ?? comment.user_id,
                        name:
                          comment.authorName ??
                          comment.userName ??
                          comment.writerName,
                      },
                    userResult.data,
                  ),
                )
                .map((comment) => ({
                  type: "댓글",
                  title: comment.content || `${post.title}의 댓글`,
                  project_name: projectName,
                  created_at:
                    comment.createdAt ||
                    comment.created_at ||
                    post.createdAt ||
                    post.created_at,
                }));
            } catch (commentsError) {
              if (commentsError.name === "CanceledError") throw commentsError;
              return [];
            }
          }),
        );

        setActivities(
          [...postActivities, ...commentGroups.flat()].sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime(),
          ),
        );
      } catch (requestError) {
        if (requestError.name !== "CanceledError") {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "활동 목록을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchActivities();
    return () => controller.abort();
  }, [projectId, projectName]);

  return (
    <section className="flex h-[526px] w-full max-w-[562px] flex-col rounded-2xl border border-gray-5 bg-white p-10">
      <h2 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">나의 활동</h2>
      <div className="mt-4 flex h-[388px] w-full flex-none flex-col items-start gap-3 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-2/70">
        {isLoading && <p className="w-full py-8 text-center text-sm text-gray-3">활동을 불러오는 중입니다.</p>}
        {!isLoading && error && <p role="alert" className="w-full py-8 text-center text-sm text-error">{error}</p>}
        {!isLoading && !error && activities.length === 0 && (
          <p className="w-full py-8 text-center text-sm text-gray-3">아직 활동 내역이 없습니다.</p>
        )}
        {!isLoading && !error && activities.map((activity, index) => (
          <ActivityCard
            key={`${activity.type}-${activity.title}-${activity.created_at}-${index}`}
            type={ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
            title={activity.title}
            project={activity.project_name}
            date={formatDate(activity.created_at)}
          />
        ))}
      </div>
    </section>
  );
}
