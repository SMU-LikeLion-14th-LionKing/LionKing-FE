"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useNotificationState } from "@/context/NotificationContext";

const notifications = [
  {
    id: 1,
    icon: "task",
    title: "김멋사님이 새로운 작업 게시글을 등록했습니다.",
    detail: "발표 PPT 1차 제작 완료",
    unread: true,
  },
  {
    id: 2,
    icon: "comment",
    title: "김네모님이 질문 게시글에 댓글을 남겼습니다.",
    detail: "어떤 디자인이 더 좋을까요?",
    unread: true,
  },
  {
    id: 3,
    icon: "link",
    title: "김네모님이 파일을 업로드했습니다.",
    detail: "AI 회의록_7.6.pdf",
    time: "09:45 PM",
  },
  {
    id: 4,
    icon: "chart",
    title: "이땡땡님이 투표를 생성했습니다.",
    detail: "어떤 디자인이 더 좋을까요?",
    time: "09:20 PM",
    unread: true,
  },
];

function NotificationPopover({ items, onMarkAllRead }) {
  return (
    <div
      role="dialog"
      aria-label="알림"
      className="fixed bottom-6 left-11 z-50 flex h-[391px] w-[335px] flex-col items-start gap-3 rounded-[28px] border border-gray-5 bg-white pb-[10px] pl-4 pr-3 pt-[19px] shadow-lg"
    >
      <div className="flex w-full items-center justify-between">
        <h2 className="text-2xl font-bold">알림</h2>
        <button type="button" onClick={onMarkAllRead} className="text-sm font-medium text-primary">
          모두 읽음
        </button>
      </div>

      <ul className="flex w-full flex-1 flex-col gap-1.5 overflow-hidden">
        {items.map((notification) => (
          <li key={notification.id} className="relative flex h-[62px] shrink-0 items-center gap-3 rounded-[13px] border border-gray-5 px-3 py-2">
            <Image
              src={`/icons/notification/${notification.icon}.svg`}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{notification.title}</p>
              <div className="mt-1 flex items-center justify-between gap-3 text-xs text-gray-2">
                <span className="truncate">{notification.detail}</span>
                {notification.time && <time className="shrink-0">{notification.time}</time>}
              </div>
            </div>
            {notification.unread && <span className="absolute right-3 top-5 h-2.5 w-2.5 rounded-full bg-primary" aria-label="읽지 않음" />}
          </li>
        ))}
      </ul>

      <Link
        href="/notification"
        className="flex h-10 w-full shrink-0 items-center justify-center rounded-[12px] bg-primary text-sm font-semibold text-white"
      >
        모든 알림 보기
      </Link>
    </div>
  );
}

export default function BottomMenu() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { allNotificationsRead, markAllNotificationsRead } =
    useNotificationState();
  const notificationItems = notifications.map((item) =>
    allNotificationsRead ? { ...item, unread: false } : item,
  );
  const unreadCount = notificationItems.filter((item) => item.unread).length;

  return (
    <div className="mt-auto flex gap-4">
      <button type="button" aria-label="설정">
        <Image src="/icons/Sidebar/settings.svg" alt="" width={20} height={20} />
      </button>

      <div className="relative">
        <button
          type="button"
          aria-label="알림"
          aria-expanded={isNotificationOpen}
          onClick={() => setIsNotificationOpen((open) => !open)}
        >
          <Image src="/icons/Sidebar/alarm.svg" alt="" width={18} height={20} />
        </button>
        {unreadCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-white">
            {unreadCount}
          </div>
        )}
      </div>

      {isNotificationOpen && (
        <>
          <button
            type="button"
            aria-label="알림 팝오버 닫기"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setIsNotificationOpen(false)}
          />
          <NotificationPopover
            items={notificationItems}
            onMarkAllRead={markAllNotificationsRead}
          />
        </>
      )}
    </div>
  );
}
