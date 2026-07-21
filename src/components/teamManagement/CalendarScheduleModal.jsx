"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const scheduleTypes = ["회의", "마감", "작업"];
const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
const minuteOptions = [0, 10, 20, 30, 40, 50];

function formatScheduleDate(date) {
  const dateText = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll(". ", ".");

  const period = date.getHours() < 12 ? "오전" : "오후";
  const hour = date.getHours() % 12 || 12;
  return `${dateText} ${period} ${hour}:${String(date.getMinutes()).padStart(2, "0")}`;
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
    if (day < 1) return { day: previousMonthDays + day, monthOffset: -1 };
    if (day > daysInMonth) return { day: day - daysInMonth, monthOffset: 1 };
    return { day, monthOffset: 0 };
  });
}

function isSameDate(first, second) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function DateTimePicker({ value, label, onCancel, onConfirm }) {
  const [draft, setDraft] = useState(() => new Date(value));
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const monthLabel = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(visibleMonth);

  const updateTime = ({ period, hour, minute }) => {
    setDraft((current) => {
      const next = new Date(current);
      let nextHour = hour ?? (current.getHours() % 12 || 12);
      const nextPeriod = period ?? (current.getHours() < 12 ? "AM" : "PM");
      nextHour = (nextHour % 12) + (nextPeriod === "PM" ? 12 : 0);
      next.setHours(nextHour, minute ?? current.getMinutes(), 0, 0);
      return next;
    });
  };

  const selectDate = ({ day, monthOffset }) => {
    const next = new Date(draft);
    next.setFullYear(visibleMonth.getFullYear(), visibleMonth.getMonth() + monthOffset, day);
    setDraft(next);
    if (monthOffset !== 0) {
      setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const selectClass = "h-10 min-w-0 appearance-none rounded-md bg-gray-4 px-3 text-sm outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onMouseDown={onCancel}>
      <div className="relative w-full max-w-[383px] overflow-hidden rounded-[10px] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={`${label} 날짜 및 시간 선택`} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onCancel} aria-label="날짜 및 시간 선택 창 닫기" className="absolute right-0 top-0 z-10 h-[22px] w-[22px] cursor-pointer">
          <Image src="/icons/common/close.svg" alt="" width={22} height={22} />
        </button>

        <div className="px-4 pb-3 pt-12">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{monthLabel}</h3>
            <div className="flex items-center gap-7 pr-1">
              <button type="button" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="이전 달" className="h-5 w-3.5">
                <Image src="/icons/TeamManagement/lastMonth.svg" alt="" width={14} height={20} />
              </button>
              <button type="button" onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="다음 달" className="h-5 w-3.5">
                <Image src="/icons/TeamManagement/nextMonth.svg" alt="" width={14} height={20} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7">
            {weekDays.map((day) => <div key={day} className="flex h-8 items-center justify-center text-xs text-gray-2">{day}</div>)}
            {calendarDays.map((date, index) => {
              const cellDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + date.monthOffset, date.day);
              const selected = isSameDate(cellDate, draft);
              return (
                <button key={`${date.day}-${index}`} type="button" onClick={() => selectDate(date)} className={`mx-auto my-1 flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors ${selected ? "bg-black text-white" : date.monthOffset !== 0 ? "text-gray-2 hover:bg-gray-4" : "text-black hover:bg-gray-4"}`}>
                  {date.day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-5 px-5 pb-[18px] pt-5">
          <p className="mb-3 text-sm font-semibold">시간 선택</p>
          <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-2">
            <select aria-label="오전 또는 오후" value={draft.getHours() < 12 ? "AM" : "PM"} onChange={(event) => updateTime({ period: event.target.value })} className={selectClass}>
              <option value="AM">오전(AM)</option>
              <option value="PM">오후(PM)</option>
            </select>
            <select aria-label="시" value={draft.getHours() % 12 || 12} onChange={(event) => updateTime({ hour: Number(event.target.value) })} className={selectClass}>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => <option key={hour} value={hour}>{hour}시</option>)}
            </select>
            <select aria-label="분" value={draft.getMinutes()} onChange={(event) => updateTime({ minute: Number(event.target.value) })} className={selectClass}>
              {minuteOptions.map((minute) => <option key={minute} value={minute}>{String(minute).padStart(2, "0")}분</option>)}
            </select>
          </div>
          <button type="button" onClick={() => onConfirm(draft)} className="mt-3 h-10 w-full rounded-md bg-primary text-sm font-semibold text-white hover:bg-secondary">
            {label} 지정 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarScheduleModal({ date, onClose, onAdd }) {
  const [scheduleType, setScheduleType] = useState("회의");
  const [title, setTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [activePicker, setActivePicker] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const next = new Date(date);
    next.setHours(9, 0, 0, 0);
    return next;
  });
  const [endDate, setEndDate] = useState(() => {
    const next = new Date(date);
    next.setHours(10, 0, 0, 0);
    return next;
  });

  const confirmDate = (nextDate) => {
    if (activePicker === "start") {
      setStartDate(nextDate);
      if (isAllDay) {
        const endOfDay = new Date(nextDate);
        endOfDay.setHours(23, 59, 0, 0);
        setEndDate(endOfDay);
      } else if (nextDate >= endDate) {
        setEndDate(new Date(nextDate.getTime() + 60 * 60 * 1000));
      }
    } else {
      setEndDate(nextDate < startDate ? new Date(startDate) : nextDate);
    }
    setActivePicker(null);
  };

  const toggleAllDay = () => {
    setIsAllDay((current) => {
      const next = !current;
      if (next) {
        const endOfDay = new Date(startDate);
        endOfDay.setHours(23, 59, 0, 0);
        setEndDate(endOfDay);
      }
      return next;
    });
  };

  const addSchedule = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: trimmedTitle,
      type: scheduleType,
      isAllDay,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title" onMouseDown={onClose}>
      <div className="relative w-full max-w-[410px] rounded-lg border-2 border-primary bg-white px-12 py-10 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="일정 추가 창 닫기" className="absolute -right-3 -top-8 h-[22px] w-[22px] cursor-pointer">
          <Image src="/icons/common/close.svg" alt="" width={22} height={22} />
        </button>
        <h2 id="schedule-modal-title" className="text-2xl font-bold">일정 추가</h2>
        <div className="mt-4 flex justify-between gap-2">
          {scheduleTypes.map((type) => <button key={type} type="button" onClick={() => setScheduleType(type)} className={`rounded border px-2 py-1 text-sm font-semibold ${scheduleType === type ? "border-primary bg-third text-primary" : "border-gray-5 bg-white"}`}>{type}</button>)}
        </div>
        <label className="mt-7 block text-sm font-semibold">제목<input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-12 w-full rounded-xl bg-gray-4 px-4 text-sm font-normal outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary" placeholder="제목을 입력하세요" /></label>
        <div className="my-4 border-t border-gray-5" />
        <div className="flex items-center justify-between text-sm font-semibold"><span>하루 종일</span><button type="button" onClick={toggleAllDay} aria-pressed={isAllDay} className={`relative h-5 w-9 rounded-full transition ${isAllDay ? "bg-primary" : "bg-gray-5"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${isAllDay ? "left-[18px]" : "left-0.5"}`} /></button></div>
        <div className="mt-4 space-y-4 text-sm font-semibold">
          <div><p>시작</p><button type="button" onClick={() => setActivePicker("start")} className="mt-2 w-full rounded-xl bg-gray-4 px-4 py-3 text-left font-normal text-black transition hover:ring-2 hover:ring-primary">{formatScheduleDate(startDate)}</button></div>
          <div><p>종료</p><button type="button" disabled={isAllDay} onClick={() => setActivePicker("end")} className={`mt-2 w-full rounded-xl bg-gray-4 px-4 py-3 text-left font-normal text-black transition ${isAllDay ? "cursor-not-allowed" : "hover:ring-2 hover:ring-primary"}`}>{formatScheduleDate(endDate)}</button></div>
        </div>
        <button type="button" onClick={addSchedule} disabled={!title.trim()} className={`mt-4 h-12 w-full rounded-xl text-base font-semibold transition ${title.trim() ? "bg-primary text-white hover:bg-secondary" : "cursor-not-allowed bg-gray-5 text-gray-3"}`}>일정 추가</button>
      </div>

      {activePicker && (
        <DateTimePicker
          key={activePicker}
          value={activePicker === "start" ? startDate : endDate}
          label={activePicker === "start" ? "시작일" : "마감일"}
          onCancel={() => setActivePicker(null)}
          onConfirm={confirmDate}
        />
      )}
    </div>
  );
}
