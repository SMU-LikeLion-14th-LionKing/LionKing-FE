"use client";

import Image from "next/image";
import { useState } from "react";
import { useNotificationState } from "@/context/NotificationContext";
import NotificationPopover, {
  SIDEBAR_NOTIFICATIONS,
} from "@/components/Notification/NotificationPopover";

export default function BottomMenu() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { allNotificationsRead, markAllNotificationsRead } =
    useNotificationState();
  const notificationItems = SIDEBAR_NOTIFICATIONS.map((item) =>
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
        <NotificationPopover
          items={notificationItems}
          onMarkAllRead={markAllNotificationsRead}
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </div>
  );
}
