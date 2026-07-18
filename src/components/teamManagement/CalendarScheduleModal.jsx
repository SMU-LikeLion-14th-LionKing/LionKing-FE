"use client";

import { useState } from "react";

const scheduleTypes = ["회의", "마감", "작업"];

function formatScheduleDate(date, hour) {
  const dateText = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date).replaceAll(". ", ".").replace(".", ".");
  return `${dateText} 오전 ${hour}:00`;
}

export default function CalendarScheduleModal({ date, onClose }) {
  const [scheduleType, setScheduleType] = useState("회의");
  const [isAllDay, setIsAllDay] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title" onMouseDown={onClose}>
      <div className="relative w-full max-w-[410px] rounded-lg border-2 border-primary bg-white px-12 py-10 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="일정 추가 창 닫기" className="absolute -right-3 -top-8 flex h-6 w-6 items-center justify-center rounded-full bg-white text-2xl leading-none text-primary shadow-sm">×</button>
        <h2 id="schedule-modal-title" className="text-2xl font-bold">일정 추가</h2>
        <div className="mt-4 flex justify-between gap-2">
          {scheduleTypes.map((type) => <button key={type} type="button" onClick={() => setScheduleType(type)} className={`rounded border px-2 py-1 text-sm font-semibold ${scheduleType === type ? "border-primary bg-third text-primary" : "border-gray-5 bg-white"}`}>{type}</button>)}
        </div>
        <label className="mt-7 block text-sm font-semibold">제목<input className="mt-2 h-12 w-full rounded-xl bg-gray-4 px-4 text-sm font-normal outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary" placeholder="제목을 입력하세요." /></label>
        <div className="my-4 border-t border-gray-5" />
        <div className="flex items-center justify-between text-sm font-semibold"><span>하루 종일</span><button type="button" onClick={() => setIsAllDay((value) => !value)} aria-pressed={isAllDay} className={`relative h-5 w-9 rounded-full transition ${isAllDay ? "bg-primary" : "bg-gray-5"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${isAllDay ? "left-4.5" : "left-0.5"}`} /></button></div>
        <div className="mt-4 space-y-4 text-sm font-semibold">
          <div><p>시작</p><div className="mt-2 rounded-xl bg-gray-4 px-4 py-3 font-normal text-gray-3">{formatScheduleDate(date, 9)}</div></div>
          <div><p>종료</p><div className="mt-2 rounded-xl bg-gray-4 px-4 py-3 font-normal text-gray-3">{formatScheduleDate(date, isAllDay ? 9 : 10)}</div></div>
        </div>
        <button type="button" className="mt-4 h-12 w-full rounded-xl bg-gray-5 text-base font-semibold text-gray-3">일정 추가</button>
      </div>
    </div>
  );
}
