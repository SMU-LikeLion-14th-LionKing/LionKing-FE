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
const scheduleTypeStyles = {
  "회의": "bg-third text-primary",
  "마감": "bg-red-50 text-error",
  "작업": "bg-green-50 text-green",
};

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDateForCell(month, cell) {
  return new Date(month.getFullYear(), month.getMonth() + cell.monthOffset, cell.day);
}

function getScheduleSegments(schedules, calendarDays, currentMonth) {
  if (!calendarDays.length) return [];

  const visibleStart = getDateForCell(currentMonth, calendarDays[0]);
  const visibleEnd = getDateForCell(currentMonth, calendarDays[calendarDays.length - 1]);
  const segments = [];

  schedules.forEach((schedule, lane) => {
    const scheduleStart = startOfDay(schedule.startDate);
    const scheduleEnd = startOfDay(schedule.endDate);
    if (scheduleEnd < visibleStart || scheduleStart > visibleEnd) return;

    const clippedStart = scheduleStart < visibleStart ? visibleStart : scheduleStart;
    const clippedEnd = scheduleEnd > visibleEnd ? visibleEnd : scheduleEnd;
    const firstIndex = calendarDays.findIndex(
      (cell) => getDateForCell(currentMonth, cell).getTime() === clippedStart.getTime(),
    );
    const lastIndex = calendarDays.findIndex(
      (cell) => getDateForCell(currentMonth, cell).getTime() === clippedEnd.getTime(),
    );
    if (firstIndex < 0 || lastIndex < 0) return;

    let segmentStart = firstIndex;
    while (segmentStart <= lastIndex) {
      const segmentEnd = Math.min(lastIndex, segmentStart + (6 - (segmentStart % 7)));
      segments.push({
        ...schedule,
        lane,
        startIndex: segmentStart,
        endIndex: segmentEnd,
        continuesBefore: segmentStart !== firstIndex || scheduleStart < visibleStart,
        continuesAfter: segmentEnd !== lastIndex || scheduleEnd > visibleEnd,
      });
      segmentStart = segmentEnd + 1;
    }
  });

  return segments;
}

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
  const [schedules, setSchedules] = useState([]);
  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const scheduleSegments = useMemo(
    () => getScheduleSegments(schedules, calendarDays, currentMonth),
    [schedules, calendarDays, currentMonth],
  );
  const eventsByDay = useMemo(
    () => new Map(calendarEvents.filter((date) => !date.muted).map((date) => [date.day, date.events])),
    [],
  );
  const hasMockEvents = currentMonth.getFullYear() === 2026 && currentMonth.getMonth() === 6;
  const isCurrentMonth = today.getFullYear() === currentMonth.getFullYear() && today.getMonth() === currentMonth.getMonth();
  const monthLabel = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(currentMonth);

  const changeMonth = (amount) => setCurrentMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1));
  const openScheduleModal = (date) => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + date.monthOffset, date.day));
  const addSchedule = (schedule) => {
    setSchedules((current) => [...current, schedule]);
    setSelectedDate(null);
  };

  return (
    <section className="h-[797px] w-full max-w-[1107px] rounded-2xl border border-gray-5 bg-white pb-8 pl-10 pr-[57px] pt-10">
      <div className="mb-5 flex h-[45px] items-center justify-between gap-4">
        <h2 className="text-[32px] font-bold leading-[140%]">일정 캘린더</h2>
        <div className="flex shrink-0 items-center gap-2 text-2xl font-semibold leading-[140%]">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달" className="flex h-5 w-3.5 items-center justify-center transition-opacity hover:opacity-60"><Image src="/icons/TeamManagement/lastMonth.svg" alt="" width={14} height={20} /></button>
          <span>{monthLabel}</span>
          <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달" className="flex h-5 w-3.5 items-center justify-center transition-opacity hover:opacity-60"><Image src="/icons/TeamManagement/nextMonth.svg" alt="" width={14} height={20} /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="w-[1008px] border-l border-t border-gray-5">
          <div className="grid grid-cols-7">
            {weekDays.map((day, index) => <div key={day} className={`h-[43px] w-36 border-b border-gray-5 px-3 py-[10px] text-base font-medium leading-[140%] text-gray-2 ${index > 0 ? "border-l" : ""} ${index === 6 ? "border-r" : ""}`}>{day}</div>)}
          </div>
          <div className="relative grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const events = !date.muted && hasMockEvents ? eventsByDay.get(date.day) || [] : [];
              const isToday = !date.muted && isCurrentMonth && date.day === today.getDate();
              return (
                <button type="button" key={`${date.day}-${index}`} onClick={() => openScheduleModal(date)} className={`relative h-[123px] w-36 border-b border-gray-5 text-left ${index % 7 > 0 ? "border-l" : ""} ${index % 7 === 6 ? "border-r" : ""} ${date.muted ? "bg-[#f8f8f8]" : isToday ? "bg-[#e8e8e8]" : "bg-white"} hover:bg-third focus-visible:outline-2 focus-visible:outline-primary`}>
                  <span className={`absolute left-3 top-3 text-[21px] font-medium leading-[140%] text-black ${date.muted ? "opacity-40" : "opacity-100"}`}>{date.day}</span>
                  <div className="absolute left-3 top-[53px] space-y-1">
                    {events.map((event) => <span key={event.label} className={`block w-fit max-w-full truncate rounded px-1.5 py-0.5 text-xs font-medium ${badgeStyles[event.tone]}`}>{event.label}</span>)}
                  </div>
                </button>
              );
            })}
            <div className="pointer-events-none absolute inset-0 z-10" aria-live="polite">
              {scheduleSegments.map((segment) => {
                const row = Math.floor(segment.startIndex / 7);
                const column = segment.startIndex % 7;
                const daySpan = segment.endIndex - segment.startIndex + 1;
                const isSingleDay = startOfDay(segment.startDate).getTime() === startOfDay(segment.endDate).getTime();
                return (
                  <div
                    key={`${segment.id}-${segment.startIndex}`}
                    title={segment.title}
                    className={`absolute flex h-[22px] items-center justify-center truncate px-2 text-center text-xs font-medium ${scheduleTypeStyles[segment.type] ?? scheduleTypeStyles["작업"]} ${segment.continuesBefore ? "rounded-l-none" : "rounded-l"} ${segment.continuesAfter ? "rounded-r-none" : "rounded-r"}`}
                    style={{
                      left: `${column * 144 + 12}px`,
                      top: `${row * 123 + 77 + (segment.lane % 2) * 24}px`,
                      width: `${daySpan * 144 - 24}px`,
                    }}
                  >
                    <span className="min-w-0 truncate">{segment.title}</span>
                    {!isSingleDay && <span className="sr-only">여러 날 일정</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {selectedDate && <CalendarScheduleModal date={selectedDate} onClose={() => setSelectedDate(null)} onAdd={addSchedule} />}
    </section>
  );
}
