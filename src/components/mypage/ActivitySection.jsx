"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ActivityCard from "./ActivityCard";

const formatDate = (createdAt) => {
  if (!createdAt) return "";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

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

export default function ActivitySection() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchActivities = async () => {
      try {
        const { data: result } = await api.get("/api/users/me/activities", {
          signal: controller.signal,
        });

        if (result?.isSuccess === false || !Array.isArray(result?.data?.content)) {
          throw new Error(result?.message || "활동 목록을 불러오지 못했습니다.");
        }

        setActivities(result.data.content);
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
  }, []);

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
