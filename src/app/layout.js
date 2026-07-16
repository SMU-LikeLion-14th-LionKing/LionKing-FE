import "./globals.css";

export const metadata = {
  title: "Teamply",
  description: "AI 협업 매니저 Teamply",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
