"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

export default function PasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const hasEmail = email.trim() !== "";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasEmail) return;
    sessionStorage.setItem("password_reset_email", email.trim());
    router.push(
      `/password-reset/verify?email=${encodeURIComponent(email.trim())}`,
    );
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-5 pb-12 sm:px-6">
      <section
        className="w-full max-w-[466px] -translate-y-3"
        aria-labelledby="password-reset-title"
      >
        <h1
          id="password-reset-title"
          className="mb-10 text-center text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-gray-1"
        >
          비밀번호 재설정
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-[#4e5968]">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력하세요."
              autoComplete="email"
              className={`login-input h-[50px] w-full rounded-lg px-[23px] text-sm text-gray-1 outline-none placeholder:text-[#a8b0b9] transition-colors focus:ring-2 focus:ring-primary/30 ${
                hasEmail ? "bg-third" : "bg-gray-4"
              }`}
            />
          </label>

          <Button
            type="submit"
            variant="primary"
            disabled={!hasEmail}
            className="mt-7 h-[46px] w-full rounded-lg text-sm"
          >
            인증코드 받기
          </Button>
        </form>
      </section>
    </main>
  );
}
