"use client";

import { createContext, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [allNotificationsRead, setAllNotificationsRead] = useState(false);

  return (
    <NotificationContext.Provider
      value={{
        allNotificationsRead,
        markAllNotificationsRead: () => setAllNotificationsRead(true),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationState() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotificationState must be used within NotificationProvider");
  }

  return context;
}
