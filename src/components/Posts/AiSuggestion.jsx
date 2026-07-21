import Image from "next/image";

const suggestions = {
  task: "현재 작업 범위와 완료한 내용을 공유합니다.\n남은 작업과 완료 예정일을 확인해주세요.\n도움이 필요한 부분에 대한 피드백 부탁드립니다.",
  question: "질문의 배경과 현재 고민 중인 기준을 정리했습니다.\n어떤 선택이 더 적합한지와 의견이 필요한 기한을 알려주세요.",
  note: "📌 회의 목적\n\n💡 핵심 논의\n• 주요 의견과 결정 사항\n\n📦 후속 작업\n• 담당자와 완료 예정일",
};

export default function AiSuggestion({ type, onApply }) {
  const suggestion = suggestions[type];
  return (
    <section className="mt-3 rounded-xl border border-primary bg-third p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold"><Image src="/icons/Posts/blackAgent.svg" alt="" width={30} height={26} />AI 협업 매니저</h3>
      <p className="mt-4">작성 내용을 더 명확하게 전달할 수 있도록 정리해봤어요.</p>
      <div className="mt-4 whitespace-pre-line rounded-lg bg-white p-5 text-sm leading-6">{suggestion}</div>
      <div className="mt-4 flex justify-end"><button type="button" onClick={() => onApply(suggestion)} className="cursor-pointer rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-secondary">이 내용으로 작성</button></div>
    </section>
  );
}
