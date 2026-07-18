import "./globals.css";

export const metadata = {
  title: "LionKing",
  description: "LionKing project management service",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
