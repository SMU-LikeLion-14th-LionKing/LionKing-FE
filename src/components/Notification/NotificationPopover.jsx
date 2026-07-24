"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";

export const SIDEBAR_NOTIFICATIONS = [
  { id: 1, icon: "task", title: "김멋사님이 새로운 작업 게시글을 등록했습니다.", detail: "발표 PPT 1차 제작 완료", unread: true },
  { id: 2, icon: "comment", title: "김네모님이 질문 게시글에 댓글을 남겼습니다.", detail: "어떤 디자인이 더 좋을까요?", unread: true },
  { id: 3, icon: "link", title: "김네모님이 파일을 업로드했습니다.", detail: "AI 회의록_7.6.pdf", time: "09:45 PM" },
  { id: 4, icon: "chart", title: "이땡땡님이 투표를 생성했습니다.", detail: "어떤 디자인이 더 좋을까요?", time: "09:20 PM", unread: true },
  { id: 5, icon: "notice", title: "새로운 공지사항이 등록되었습니다.", detail: "7/14 회의 장소 변경", time: "어제" },
  { id: 6, icon: "bot", title: "AI 브리핑이 업데이트되었습니다.", detail: "프로젝트 진행 상황을 확인해보세요.", time: "어제" },
];

export default function NotificationPopover({ items, onMarkAllRead, onClose }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="알림 팝오버 닫기"
        className="fixed inset-0 z-[9998] cursor-default bg-transparent"
        onClick={onClose}
      />
      <div
      role="dialog"
      aria-label="알림"
      className="fixed bottom-6 left-[80px] z-[9999] flex h-[391px] w-[335px] flex-col items-start gap-3 rounded-[28px] border border-gray-5 bg-white pb-[10px] pl-4 pr-[7px] pt-[19px] shadow-lg"
    >
      <div className="flex w-full items-center justify-between">
        <h2 className="text-[20px] font-bold leading-none">알림</h2>
        <button type="button" onClick={onMarkAllRead} className="pr-5 text-xs font-medium text-primary">
          모두 읽음
        </button>
      </div>

      <ul className="notification-scrollbar flex min-h-0 w-full flex-1 flex-col gap-2 overflow-y-scroll pr-2">
        {items.map((notification) => (
          <li key={notification.id} className="relative flex h-[62px] shrink-0 items-center gap-3 rounded-[11px] border border-gray-5 px-3 py-2">
            <Image src={`/icons/notification/${notification.icon}.svg`} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium leading-[1.4]">{notification.title}</p>
              <div className="mt-1 flex items-center justify-between gap-2 text-[10px] leading-[1.4] text-gray-2">
                <span className="truncate">{notification.detail}</span>
                {notification.time && <time className="shrink-0">{notification.time}</time>}
              </div>
            </div>
            {notification.unread && <span className="absolute right-3 top-[21px] h-2 w-2 rounded-full bg-primary" aria-label="읽지 않음" />}
          </li>
        ))}
      </ul>

      <Link href="/notification" className="flex h-8 w-[calc(100%_-_5px)] shrink-0 items-center justify-center rounded-[10px] bg-primary text-xs font-semibold text-white">
        모든 알림 보기
      </Link>
      </div>
    </>,
    document.body,
  );
}
