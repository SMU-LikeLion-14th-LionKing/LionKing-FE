"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import api from "@/lib/api";

export default function PasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const hasEmail = email.trim() !== "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasEmail || isLoading) return;

    const normalizedEmail = email.trim();
    setIsLoading(true);
    setError("");

    try {
      const { data: result } = await api.post(
        "/api/auth/password/send-code",
        { email: normalizedEmail },
      );
      if (result?.isSuccess === false) {
        throw new Error(result.message || "인증코드 전송에 실패했습니다.");
      }

      sessionStorage.setItem("password_reset_email", normalizedEmail);
      router.push(
        `/password-reset/verify?email=${encodeURIComponent(normalizedEmail)}`,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.detail ||
          requestError.message ||
          "인증코드 전송 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
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
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              placeholder="이메일을 입력하세요."
              autoComplete="email"
              className={`login-input h-[50px] w-full rounded-lg px-[23px] text-sm text-gray-1 outline-none placeholder:text-[#a8b0b9] transition-colors focus:ring-2 focus:ring-primary/30 ${
                hasEmail ? "bg-third" : "bg-gray-4"
              }`}
            />
          </label>

          {error && (
            <p role="alert" className="mt-2 text-sm text-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!hasEmail || isLoading}
            className={`${error ? "mt-3" : "mt-7"} h-[46px] w-full rounded-lg text-sm`}
          >
            {isLoading ? "전송 중..." : "인증코드 받기"}
          </Button>
        </form>
      </section>
    </main>
  );
}
