"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
<<<<<<< HEAD
import api from "@/lib/api";
=======
>>>>>>> origin/develop

const CODE_LENGTH = 6;

export default function PasswordResetVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);
=======
>>>>>>> origin/develop
  const inputRefs = useRef([]);
  const isComplete = code.every(Boolean);

  const updateDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (error) setError("");
    setCode((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    );

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pastedCode) return;
    event.preventDefault();
    setCode(
      Array.from(
        { length: CODE_LENGTH },
        (_, index) => pastedCode[index] || "",
      ),
    );
    inputRefs.current[Math.min(pastedCode.length, CODE_LENGTH) - 1]?.focus();
  };

<<<<<<< HEAD
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isComplete || isLoading) return;

    const email = sessionStorage.getItem("password_reset_email");
    if (!email) {
      setError("이메일 인증을 다시 진행해주세요.");
      return;
    }

    const verificationCode = code.join("");
    setIsLoading(true);
    setError("");

    try {
      const { data: result } = await api.post(
        "/api/auth/password/verify-code",
        {
          email,
          code: verificationCode,
        },
      );
      if (result?.isSuccess === false) {
        throw new Error(result.message || "인증코드가 일치하지 않습니다.");
      }

      sessionStorage.setItem("password_reset_code", verificationCode);
      router.push("/password-reset/new-password");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.detail ||
          requestError.message ||
          "인증코드 검증 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
=======
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isComplete) return;

    if (code.join("") !== "111111") {
      setError("인증코드가 일치하지 않습니다.");
      return;
    }

    sessionStorage.setItem("password_reset_code", code.join(""));
    router.push("/password-reset/new-password");
>>>>>>> origin/develop
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white px-5 pb-12 sm:px-6">
      <section
        className="w-full max-w-[434px] -translate-y-3"
        aria-labelledby="verification-title"
      >
        <h1
          id="verification-title"
          className="mb-8 text-center text-[32px] font-bold leading-[1.1] tracking-[-0.8px] text-gray-1"
        >
          인증코드 입력
        </h1>

        <form onSubmit={handleSubmit}>
          <div
            className="grid grid-cols-6 gap-4"
            onPaste={handlePaste}
            aria-label="6자리 인증코드"
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                aria-label={`인증코드 ${index + 1}번째 자리`}
                className="aspect-square min-w-0 rounded-lg border border-gray-5 bg-white text-center text-xl font-semibold text-gray-1 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            ))}
          </div>
          {error && (
            <p className="mt-2 text-center text-xs text-error">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
<<<<<<< HEAD
            disabled={!isComplete || isLoading}
            className={`${error ? "mt-3" : "mt-7"} h-[42px] w-full rounded-lg text-sm`}
          >
            {isLoading ? "확인 중..." : "본인 확인 완료"}
=======
            disabled={!isComplete}
            className={`${error ? "mt-3" : "mt-7"} h-[42px] w-full rounded-lg text-sm`}
          >
            본인 확인 완료
>>>>>>> origin/develop
          </Button>
        </form>
      </section>
    </main>
  );
}
