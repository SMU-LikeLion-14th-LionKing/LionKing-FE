"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Icon from "@/components/common/Icon";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const hasName = name.trim() !== "";
  const hasEmail = email.trim() !== "";
  const hasPassword = password !== "";
  const canSubmit = hasName && hasEmail && hasPassword;

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="flex min-h-[1024px] w-full items-center justify-center bg-white px-5 pb-12 sm:px-6">
      <section className="w-full max-w-[500px] -translate-y-3" aria-labelledby="signup-title">
        <h1 id="signup-title" className="mb-8 text-center text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-gray-1">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#4E5968]">이름</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름을 입력하세요."
              autoComplete="name"
              className={`login-input h-[53px] w-full rounded-lg px-[25px] text-sm text-gray-1 outline-none placeholder:text-[#A8B0B9] transition-colors focus:ring-2 focus:ring-primary/30 ${
                hasName ? "bg-third" : "bg-gray-4"
              }`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#4E5968]">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력하세요."
              autoComplete="email"
              className={`login-input h-[53px] w-full rounded-lg px-[25px] text-sm text-gray-1 outline-none placeholder:text-[#A8B0B9] transition-colors focus:ring-2 focus:ring-primary/30 ${
                hasEmail ? "bg-third" : "bg-gray-4"
              }`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#4E5968]">비밀번호</span>
            <span className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요."
                autoComplete="new-password"
                className={`login-input h-[53px] w-full rounded-lg px-[25px] pr-14 text-sm text-gray-1 outline-none placeholder:text-[#A8B0B9] transition-colors focus:ring-2 focus:ring-primary/30 ${
                  hasPassword ? "bg-third" : "bg-gray-4"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-[25px] top-1/2 -translate-y-1/2 text-gray-2"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <Icon name={showPassword ? "eye" : "eyeOff"} size={18} />
              </button>
            </span>
          </label>

          <Button type="submit" variant="primary" disabled={!canSubmit} className="h-12 w-full rounded-lg px-3 py-4 text-sm">
            회원가입
          </Button>
        </form>

        <div className="mt-5 border-t border-gray-5 pt-5 text-center text-[11px] text-[#4E5968]">
          이미 가입이 되어있나요?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </div>
      </section>
    </main>
  );
}
