"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Checkbox from "@/components/common/Checkbox";
import Icon from "@/components/common/Icon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim() !== "" && password !== "";

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="flex min-h-[1024px] w-full items-center justify-center bg-white px-5 pb-12 sm:px-6">
      <section className="w-full max-w-[500px] -translate-y-3" aria-labelledby="login-title">
        <h1 id="login-title" className="mb-8 text-center text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-gray-1">
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#4E5968]">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력하세요."
              className="h-[53px] w-full rounded-lg bg-gray-4 px-[25px] text-sm text-gray-1 outline-none placeholder:text-[#A8B0B9] focus:ring-2 focus:ring-primary/30"
              autoComplete="email"
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
                className="h-[53px] w-full rounded-lg bg-gray-4 px-[25px] pr-14 text-sm text-gray-1 outline-none placeholder:text-[#A8B0B9] focus:ring-2 focus:ring-primary/30"
                autoComplete="current-password"
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

          <div className="-mt-2 flex items-center justify-between">
            <Checkbox
              label="로그인 상태 유지"
              size={14}
              className="gap-1.5 text-sm font-normal leading-[1.4] text-[#4E5968] [&>span>span]:rounded-[3px] [&>span>span]:border"
            />
            <Link href="#" className="text-[11px] font-medium text-primary hover:underline">
              비밀번호를 잊어버리셨나요?
            </Link>
          </div>

          <Button type="submit" variant="primary" disabled={!canSubmit} className="-mt-0.5 h-[34px] w-full rounded-lg text-xs">
            로그인
          </Button>
        </form>

        <div className="mt-5 border-t border-gray-5 pt-5 text-center text-[11px] text-[#4E5968]">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </div>
      </section>
    </main>
  );
}
