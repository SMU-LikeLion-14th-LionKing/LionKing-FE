"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Button from "@/components/common/Button";
import Icon from "@/components/common/Icon";

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-xs font-medium text-[#4e5968]">{label}</span>
      <span className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`login-input h-[46px] w-full rounded-lg px-[22px] pr-14 text-sm text-gray-1 outline-none placeholder:text-[#a8b0b9] transition-colors focus:ring-2 focus:ring-primary/30 ${
            value ? "bg-third" : "bg-gray-4"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-2"
          aria-label={visible ? `${label} 숨기기` : `${label} 보기`}
        >
          <Icon name={visible ? "eyeOff" : "eye"} size={18} />
        </button>
      </span>
    </label>
  );
}

export default function NewPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  const isComplete =
    password.length > 0 && confirmation.length > 0 && password === confirmation;
  const hasMismatch =
    confirmation.length > 0 && password.length > 0 && password !== confirmation;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isComplete || isLoading) return;

    const email = sessionStorage.getItem("password_reset_email");
    const verificationCode = sessionStorage.getItem("password_reset_code");

    if (!email || !verificationCode) {
      setResetError(
        "인증 정보가 없습니다. 비밀번호 찾기를 다시 진행해주세요.",
      );
      return;
    }

    setIsLoading(true);
    setResetError("");

    try {
      const response = await api.post(
        "/api/auth/me/password",
        {
          email,
          verification_code: verificationCode,
          new_password: password,
        },
      );
      const result = response.data;

      if (result?.isSuccess === false) {
        throw new Error(result.message || "비밀번호 재설정에 실패했습니다.");
      }

      sessionStorage.removeItem("password_reset_email");
      sessionStorage.removeItem("password_reset_code");
      router.replace("/login");
    } catch (error) {
      setResetError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "비밀번호 재설정 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-5 pb-12 sm:px-6">
      <section
        className="w-full max-w-[434px] -translate-y-3"
        aria-labelledby="new-password-title"
      >
        <h1
          id="new-password-title"
          className="mb-10 text-center text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-gray-1"
        >
          비밀번호 재설정
        </h1>

        <form onSubmit={handleSubmit} className="space-y-7">
          <PasswordField
            id="new-password"
            label="새 비밀번호"
            placeholder="새 비밀번호를 입력하세요."
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (resetError) setResetError("");
            }}
            visible={showPassword}
            onToggle={() => setShowPassword((current) => !current)}
            autoComplete="new-password"
          />

          <div>
            <PasswordField
              id="password-confirmation"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요."
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                if (resetError) setResetError("");
              }}
              visible={showConfirmation}
              onToggle={() => setShowConfirmation((current) => !current)}
              autoComplete="new-password"
            />
            {hasMismatch && (
              <p className="mt-2 text-xs text-error">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {resetError && (
            <p role="alert" className="-mt-3 text-sm text-error">
              {resetError}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={!isComplete || isLoading}
            className="h-[42px] w-full rounded-lg text-sm"
          >
            {isLoading ? "재설정 중..." : "재설정 하기"}
          </Button>
        </form>
      </section>
    </main>
  );
}
