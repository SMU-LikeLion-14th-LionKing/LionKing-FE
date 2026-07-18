"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { calendarEvents } from "@/constants/teamManagement";
import CalendarScheduleModal from "./CalendarScheduleModal";

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
const badgeStyles = {
  blue: "bg-third text-primary",
  red: "bg-red-50 text-error",
  green: "bg-green-50 text-green",
};

function getCalendarDays(month) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const previousMonthDays = new Date(year, monthIndex, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1) return { day: previousMonthDays + day, monthOffset: -1, muted: true };
    if (day > daysInMonth) return { day: day - daysInMonth, monthOffset: 1, muted: true };
    return { day, monthOffset: 0, muted: false };
  });
}

export default function CalendarSection() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const eventsByDay = useMemo(
    () => new Map(calendarEvents.filter((date) => !date.muted).map((date) => [date.day, date.events])),
    [],
  );
  const hasMockEvents = currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 6;
  const isCurrentMonth = today.getFullYear() === currentMonth.getFullYear() && today.getMonth() === currentMonth.getMonth();
  const monthLabel = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(currentMonth);

  const changeMonth = (amount) => setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
  const openScheduleModal = (date) => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + date.monthOffset, date.day));

  return (
    <section className="w-full max-w-[1107px] rounded-2xl border border-gray-5 bg-white p-5 shadow-sm sm:p-8 xl:min-h-[797px] xl:p-12">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold leading-[140%] sm:text-[32px]">일정 캘린더</h2>
        <div className="flex items-center gap-3 text-xl font-semibold leading-[140%] sm:text-2xl">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달" className="rounded p-1 transition hover:bg-gray-4"><Image src="/icons/TeamManagement/lastMonth.svg" alt="" width={14} height={20} /></button>
          <span>{monthLabel}</span>
          <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달" className="rounded p-1 transition hover:bg-gray-4"><Image src="/icons/TeamManagement/nextMonth.svg" alt="" width={14} height={20} /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="w-[1008px] border-l border-t border-gray-5">
          <div className="grid grid-cols-7">
            {weekDays.map((day) => <div key={day} className="h-[43px] border-b border-r border-gray-5 px-3 py-[10px] text-base font-medium leading-[140%] text-gray-2">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const events = !date.muted && hasMockEvents ? eventsByDay.get(date.day) || [] : [];
              const isToday = !date.muted && isCurrentMonth && date.day === today.getDate();
              return (
                <button type="button" key={`${date.day}-${index}`} onClick={() => openScheduleModal(date)} className={`h-[117px] border-b border-r border-gray-5 p-3 text-left ${date.muted ? "bg-[#f8f8f8]" : isToday ? "bg-[#e8e8e8]" : "bg-white"} hover:bg-third focus-visible:outline-2 focus-visible:outline-primary`}>
                  <span className={`text-[21px] font-medium leading-[140%] ${date.muted ? "text-gray-1/40" : "text-gray-1"}`}>{date.day}</span>
                  <div className="mt-4 space-y-1">
                    {events.map((event) => <span key={event.label} className={`block w-fit rounded px-1.5 py-0.5 text-xs font-medium ${badgeStyles[event.tone]}`}>{event.label}</span>)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selectedDate && <CalendarScheduleModal date={selectedDate} onClose={() => setSelectedDate(null)} />}
    </section>
  );
}
