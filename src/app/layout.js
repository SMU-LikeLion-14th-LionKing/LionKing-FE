import "./globals.css";
import { NotificationProvider } from "@/context/NotificationContext";

export const metadata = {
  title: "LionKing",
  description: "LionKing project management service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-white">
        <NotificationProvider>
          <div className="min-h-screen">{children}</div>
        </NotificationProvider>
      </body>
    </html>
  );
}
