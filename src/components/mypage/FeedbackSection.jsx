"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import api from "@/lib/api";
import FeedbackCard from "./FeedbackCard";

const subscribeToProject = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () => window.removeEventListener("team-selection-changed", callback);
};
const getProjectSnapshot = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getServerProjectSnapshot = () => "";

const CATEGORY_LABELS = {
  TONE: "말투교정",
  TONE_CORRECTION: "말투교정",
  말투교정: "말투교정",
  "말투 교정": "말투교정",
  OMISSION: "누락감지",
  MISSING: "누락감지",
  MISSING_CONTENT: "누락감지",
  누락감지: "누락감지",
  "누락 감지": "누락감지",
};

export default function FeedbackSection() {
  const projectId = useSyncExternalStore(
    subscribeToProject,
    getProjectSnapshot,
    getServerProjectSnapshot,
  );
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    const controller = new AbortController();

    const fetchIssues = async () => {
      setIsLoading(true);
      setError("");

      try {
        const { data: result } = await api.get(
          `/api/projects/${projectId}/ai-issues`,
          { signal: controller.signal },
        );

        if (result?.isSuccess === false || !Array.isArray(result?.data?.issues)) {
          throw new Error(result?.message || "AI 피드백을 불러오지 못했습니다.");
        }

        setIssues(result.data.issues);
      } catch (requestError) {
        if (requestError.name !== "CanceledError") {
          setIssues([]);
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "AI 피드백을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchIssues();
    return () => controller.abort();
  }, [projectId]);

  return (
    <section className="flex h-[526px] w-full max-w-[562px] flex-col rounded-2xl border border-gray-5 bg-white p-10">
      <h2 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">AI 피드백 기록</h2>
      <div className="mt-4 flex h-[388px] w-[456px] max-w-full flex-none flex-col items-start gap-4 self-start overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-2/70">
        {!projectId && <p className="w-full py-8 text-center text-sm text-gray-3">프로젝트를 선택해 주세요.</p>}
        {projectId && isLoading && <p className="w-full py-8 text-center text-sm text-gray-3">AI 피드백을 불러오는 중입니다.</p>}
        {projectId && !isLoading && error && <p role="alert" className="w-full py-8 text-center text-sm text-error">{error}</p>}
        {projectId && !isLoading && !error && issues.length === 0 && (
          <p className="w-full py-8 text-center text-sm text-gray-3">아직 AI 피드백 기록이 없습니다.</p>
        )}
        {projectId && !isLoading && !error && issues.map((issue, index) => (
          <FeedbackCard
            key={issue.issueId ?? `${issue.createdAt}-${index}`}
            status={CATEGORY_LABELS[issue.category] || issue.category}
            feedback={issue.cause}
            suggestion={issue.suggestion}
          />
        ))}
      </div>
    </section>
  );
}
