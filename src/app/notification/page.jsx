"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar/Sidebar";
import Button from "@/components/common/Button";
import { useNotificationState } from "@/context/NotificationContext";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    period: "오늘",
    type: "task",
    title: "김멋사님이 새로운 작업 게시물을 등록했습니다.",
    detail: "발표 PPT 1차 제작 완료",
    time: "10:30 AM",
    unread: true,
  },
  {
    id: 2,
    period: "오늘",
    type: "comment",
    title: "김네모님이 질문 게시글에 댓글을 남겼습니다.",
    detail: "어떤 디자인이 더 좋을까요?",
    time: "10:20 AM",
    unread: true,
  },
  {
    id: 3,
    period: "오늘",
    type: "link",
    title: "김네모님이 파일을 업로드했습니다.",
    detail: "AI 회의록_7_6.pdf",
    time: "09:45 AM",
    unread: false,
  },
  {
    id: 4,
    period: "오늘",
    type: "chart",
    title: "이땡땡님이 투표를 생성했습니다.",
    detail: "어떤 디자인이 더 좋을까요?",
    time: "09:20 AM",
    unread: true,
  },
  {
    id: 5,
    period: "어제",
    type: "notice",
    title: "새로운 공지사항이 등록되었습니다.",
    detail: "7/14 회의 장소 변경 - 강의관 205",
    time: "어제 05:43 PM",
    unread: false,
  },
  {
    id: 6,
    period: "어제",
    type: "bot",
    title: "AI 브리핑이 업데이트되었습니다.",
    detail: "프로젝트 진행 상황을 확인해보세요.",
    time: "어제 11:00 AM",
    unread: false,
  },
  {
    id: 7,
    period: "어제",
    type: "comment",
    title: "김멋사님이 댓글을 남겼습니다.",
    detail: "발표 영상 제작은 누가 담당하나요?",
    time: "어제 10:20 AM",
    unread: false,
  },
  {
    id: 8,
    period: "2일 전",
    type: "link",
    title: "파일이 업로드되었습니다.",
    detail: "와이어프레임_v2.figma",
    time: "2일 전 11:50 PM",
    unread: false,
  },
];

const NOTIFICATION_ICON_SOURCES = {
  task: "/icons/notification/task.svg",
  comment: "/icons/notification/comment.svg",
  link: "/icons/notification/link.svg",
  chart: "/icons/notification/chart.svg",
  notice: "/icons/notification/notice.svg",
  bot: "/icons/notification/bot.svg",
};

const PROJECT_ICON_SOURCE = "/icons/notification/project-lion.svg";

function NotificationSymbol({ type }) {
  return (
    <span className="flex h-[59px] w-[59px] shrink-0 items-center justify-center rounded-[10px] bg-third">
      <Image
        src={NOTIFICATION_ICON_SOURCES[type]}
        alt=""
        width={43}
        height={43}
      />
    </span>
  );
}

function NotificationItem({ notification }) {
  return (
    <li className="relative flex h-[105px] w-full items-center gap-[39px] border-b border-gray-5 px-4 py-3 last:border-b-0">
      <NotificationSymbol type={notification.type} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[24px] font-medium leading-[1.4] text-gray-1">
          {notification.title}
        </p>
        <p className="mt-1 truncate text-[20px] font-light leading-[1.4] text-gray-1">
          {notification.detail}
        </p>
      </div>
      <time className="shrink-0 self-end text-sm text-[#4E5968]">
        {notification.time}
      </time>
      {notification.unread && (
        <span
          className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-primary"
          aria-label="읽지 않음"
        />
      )}
    </li>
  );
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState("all");
  const { allNotificationsRead, markAllNotificationsRead } =
    useNotificationState();
  const syncedNotifications = allNotificationsRead
    ? notifications.map((notification) => ({ ...notification, unread: false }))
    : notifications;
  const unreadCount = syncedNotifications.filter(
    (notification) => notification.unread,
  ).length;
  const visibleNotifications =
    activeTab === "unread"
      ? syncedNotifications.filter((notification) => notification.unread)
      : syncedNotifications;
  const groups = useMemo(
    () =>
      ["오늘", "어제", "2일 전"]
        .map((period) => ({
          period,
          items: visibleNotifications.filter((item) => item.period === period),
        }))
        .filter((group) => group.items.length > 0),
    [visibleNotifications],
  );

  return (
    <div className="ml-64 flex min-h-screen bg-white">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-10 lg:px-12">
        <section className="mx-auto w-full max-w-[960px]">
          <div className="flex items-center gap-3">
            {/* Project SVG insertion point */}
            <Image src={PROJECT_ICON_SOURCE} alt="" width={40} height={40} />
            <h1 className="text-[36px] font-bold leading-none tracking-[-0.9px] text-gray-1">
              라이온킹
            </h1>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-[28px] font-bold leading-[1.4] text-gray-1">모든 알림</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNotifications((items) =>
                  items.map((item) => ({ ...item, unread: false })),
                );
                markAllNotificationsRead();
              }}
              className="!h-[45px] !w-[104px] rounded-[10px] !border-[#E5E8EB] !bg-white !px-6 py-3 text-base font-medium !text-black transition-colors hover:!bg-white active:!border-primary active:!bg-third active:!text-primary"
            >
              모두 읽음
            </Button>
          </div>

          <div
            className="mt-5 flex border-b border-gray-5"
            role="tablist"
            aria-label="알림 필터"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              className={`relative px-3 pb-3 text-base font-semibold ${activeTab === "all" ? "text-primary" : "text-gray-1"}`}
            >
              전체
              {activeTab === "all" && (
                <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-primary" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "unread"}
              onClick={() => setActiveTab("unread")}
              className={`relative ml-5 px-3 pb-3 text-base font-semibold ${activeTab === "unread" ? "text-primary" : "text-gray-1"}`}
            >
              안 읽은 알림({unreadCount})
              {activeTab === "unread" && (
                <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-primary" />
              )}
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {groups.map((group) => (
              <section key={group.period}>
                <h3 className="mb-3 text-[20px] font-medium leading-[1.4] text-gray-1">
                  {group.period}
                </h3>
                <ul className="w-full max-w-[835px] overflow-hidden rounded-lg border border-gray-5">
                  {group.items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
