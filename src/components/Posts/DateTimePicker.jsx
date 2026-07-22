"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

function calendarDays(month) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1).getDay();
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const previous = new Date(year, monthIndex, 0).getDate();
  return Array.from({ length: Math.ceil((first + count) / 7) * 7 }, (_, index) => {
    const day = index - first + 1;
    if (day < 1) return { day: previous + day, offset: -1 };
    if (day > count) return { day: day - count, offset: 1 };
    return { day, offset: 0 };
  });
}

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function formatDateTime(date) {
  if (!date) return "날짜를 선택해주세요.";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
}

export default function DateTimePicker({ value, onClose, onConfirm, label = "날짜" }) {
  const [draft, setDraft] = useState(() => new Date(value ?? Date.now()));
  const [month, setMonth] = useState(() => new Date(draft.getFullYear(), draft.getMonth(), 1));
  const days = useMemo(() => calendarDays(month), [month]);

  const changeTime = (part, nextValue) => setDraft((current) => { const next = new Date(current); if (part === "period") { const hour = current.getHours() % 12; next.setHours(hour + (nextValue === "PM" ? 12 : 0)); } if (part === "hour") next.setHours((Number(nextValue) % 12) + (current.getHours() >= 12 ? 12 : 0)); if (part === "minute") next.setMinutes(Number(nextValue)); return next; });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-5" onMouseDown={onClose}>
      <div className="relative w-full max-w-[455px] rounded-xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${label} 선택`}>
        <button type="button" onClick={onClose} className="absolute right-0 top-[-32px] cursor-pointer"><Image src="/icons/common/close.svg" alt="" width={22} height={22} /></button>
        <div className="flex items-center justify-between"><h3 className="text-xl font-bold">{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(month)}</h3><div className="flex gap-6"><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="cursor-pointer text-2xl text-primary">‹</button><button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="cursor-pointer text-2xl text-primary">›</button></div></div>
        <div className="mt-5 grid grid-cols-7">{weekDays.map((day) => <span key={day} className="py-2 text-center text-xs text-gray-2">{day}</span>)}{days.map((item, index) => { const cell = new Date(month.getFullYear(), month.getMonth() + item.offset, item.day); return <button key={`${item.day}-${index}`} type="button" onClick={() => setDraft((current) => { const next = new Date(current); next.setFullYear(cell.getFullYear(), cell.getMonth(), cell.getDate()); return next; })} className={`mx-auto my-1 h-9 w-9 cursor-pointer rounded-full ${sameDay(cell, draft) ? "bg-black text-white" : item.offset ? "text-gray-2" : "hover:bg-gray-4"}`}>{item.day}</button>; })}</div>
        <p className="mt-4 font-semibold">시간 선택</p>
        <div className="mt-2 grid grid-cols-3 gap-2"><select value={draft.getHours() < 12 ? "AM" : "PM"} onChange={(event) => changeTime("period", event.target.value)} className="rounded-lg bg-gray-4 p-3"><option value="AM">오전(AM)</option><option value="PM">오후(PM)</option></select><select value={draft.getHours() % 12 || 12} onChange={(event) => changeTime("hour", event.target.value)} className="rounded-lg bg-gray-4 p-3">{Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => <option key={hour}>{hour}</option>)}</select><select value={draft.getMinutes()} onChange={(event) => changeTime("minute", event.target.value)} className="rounded-lg bg-gray-4 p-3">{Array.from({ length: 60 }, (_, minute) => <option key={minute} value={minute}>{String(minute).padStart(2, "0")}분</option>)}</select></div>
        <button type="button" onClick={() => { const confirmed = new Date(draft); confirmed.setSeconds(0, 0); onConfirm(confirmed); }} className="mt-3 h-11 w-full cursor-pointer rounded-lg bg-primary font-semibold text-white">{label} 지정 완료</button>
      </div>
    </div>
  );
}
