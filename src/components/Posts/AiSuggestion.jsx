"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const suggestions = {
  task: "현재 작업 범위와 완료한 내용을 공유합니다.\n남은 작업과 완료 예정일을 확인해주세요.\n도움이 필요한 부분에 대한 피드백 부탁드립니다.",
  question: "질문의 배경과 현재 고민 중인 기준을 정리했습니다.\n어떤 선택이 더 적합한지와 의견이 필요한 기한을 알려주세요.",
  note: "📌 회의 목적\n\n💡 핵심 논의\n• 주요 의견과 결정 사항\n\n📦 후속 작업\n• 담당자와 완료 예정일",
  comment: "전체적인 방향이 명확해서 이해하기 좋았습니다.\n특히 핵심 내용이 잘 정리되어 있어요.\n추가로 필요한 부분이 있다면 함께 확인하겠습니다.",
};

export default function AiSuggestion({
  type,
  content = "",
  projectId = "",
  onApply,
}) {
  const suggestion = suggestions[type];
  const usesCollaborateManager =
    type === "task" || type === "question" || type === "comment";
  const usesMeetingMinutes = type === "note";
  const usesAiApi = usesCollaborateManager || usesMeetingMinutes;
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      !usesAiApi ||
      !content.trim() ||
      (usesMeetingMinutes && !projectId)
    ) {
      return;
    }

    let controller;
    const timeoutId = window.setTimeout(async () => {
      controller = new AbortController();
      setIsLoading(true);
      setError("");

      try {
        const { data: result } = await api.post(
          usesMeetingMinutes
            ? "/api/ai/meeting-minutes"
            : "/api/ai/collaborate-manager",
          usesMeetingMinutes
            ? {
                projectId: Number(projectId),
                meetingNotes: content.trim(),
              }
            : { content: content.trim() },
          { signal: controller.signal },
        );

        if (result?.isSuccess === false || !result?.data) {
          throw new Error(result?.message || "AI 제안을 불러오지 못했습니다.");
        }

        setFeedback(result.data);
      } catch (requestError) {
        if (requestError.name !== "CanceledError") {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "AI 제안을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
      controller?.abort();
    };
  }, [content, projectId, usesAiApi, usesMeetingMinutes]);

  const meetingMinutesText = feedback
    ? [
        "📌 회의 목적",
        feedback.meetingGoal,
        "",
        "💡 핵심 논의",
        ...(feedback.keyDiscussions || []).map((item) => `• ${item}`),
        "",
        "✅ 결정 사항",
        ...(feedback.decisions || []).map((item) => `• ${item}`),
        "",
        `📦 후속 작업 총 ${feedback.totalTaskCount ?? 0}개`,
      ]
        .filter((item) => item !== undefined && item !== null)
        .join("\n")
    : "";
  const suggestedText = usesCollaborateManager
    ? feedback?.suggestedText
    : usesMeetingMinutes
      ? meetingMinutesText
      : suggestion;

  return (
    <section className="mt-3 rounded-xl border border-primary bg-third p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold"><Image src="/icons/Posts/blackAgent.svg" alt="" width={30} height={26} />AI 협업 매니저</h3>
      <p className="mt-4">작성 내용을 더 명확하게 전달할 수 있도록 정리해봤어요.</p>
      {isLoading && <div className="mt-4 rounded-lg bg-white p-5 text-sm text-gray-3">AI가 작성 내용을 분석하고 있습니다.</div>}
      {!isLoading && error && <p role="alert" className="mt-4 rounded-lg bg-white p-5 text-sm text-error">{error}</p>}
      {!isLoading && !error && usesCollaborateManager && feedback && (
        <div className="mt-4 space-y-4 rounded-lg bg-white p-5 text-sm leading-6">
          {feedback.feedbackPoints?.length > 0 && (
            <div>
              <strong>확인할 점</strong>
              <ul className="mt-1 list-disc pl-5">
                {feedback.feedbackPoints.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}
              </ul>
            </div>
          )}
          {feedback.suggestions?.length > 0 && (
            <div>
              <strong>제안 사항</strong>
              <ul className="mt-1 list-disc pl-5">
                {feedback.suggestions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
            </div>
          )}
          {suggestedText && <div className="whitespace-pre-line">{suggestedText}</div>}
        </div>
      )}
      {!isLoading && !error && usesMeetingMinutes && feedback && (
        <div className="mt-4 space-y-4 rounded-lg bg-white p-5 text-sm leading-6">
          <div><strong>회의 목적</strong><p className="mt-1">{feedback.meetingGoal}</p></div>
          {feedback.keyDiscussions?.length > 0 && (
            <div><strong>핵심 논의</strong><ul className="mt-1 list-disc pl-5">{feedback.keyDiscussions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>
          )}
          {feedback.decisions?.length > 0 && (
            <div><strong>결정 사항</strong><ul className="mt-1 list-disc pl-5">{feedback.decisions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></div>
          )}
          <p><strong>후속 작업</strong> 총 {feedback.totalTaskCount ?? 0}개</p>
        </div>
      )}
      {!usesAiApi && <div className="mt-4 whitespace-pre-line rounded-lg bg-white p-5 text-sm leading-6">{suggestion}</div>}
      {suggestedText && !isLoading && !error && (
        <div className="mt-4 flex justify-end"><button type="button" onClick={() => onApply(suggestedText)} className="cursor-pointer rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-secondary">이 내용으로 작성</button></div>
      )}
    </section>
  );
}
