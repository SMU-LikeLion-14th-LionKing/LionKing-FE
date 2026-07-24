"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
<<<<<<< HEAD
=======
import api from "@/lib/api";
>>>>>>> origin/develop

function EmptyInviteList() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-8 text-gray-3">
      <svg
        aria-hidden="true"
        width="58"
        height="46"
        viewBox="0 0 58 46"
        fill="none"
        className="text-[#c9c9c9]"
      >
        <rect
          x="1.5"
          y="1.5"
          width="55"
          height="43"
          rx="5.5"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M4 5L29 29L54 5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-10 text-xs">아직 초대한 팀원이 없습니다.</p>
    </div>
  );
}

export default function TeamInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamName = searchParams.get("team") || "라이온킹";
<<<<<<< HEAD
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState("");

  const addInvite = () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;
=======
  const projectId =
    searchParams.get("projectId") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("selected_project_id")
      : null);
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addInvite = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || isLoading) return;
>>>>>>> origin/develop
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("올바른 이메일을 입력해주세요.");
      return;
    }
<<<<<<< HEAD
    if (invites.includes(normalizedEmail)) {
      setError("이미 초대 목록에 있는 이메일입니다.");
      return;
    }
    setInvites((current) => [...current, normalizedEmail]);
    setEmail("");
    setError("");
  };

  const handleInviteClick = (event) => {
=======
    if (invites.some((invite) => invite.email === normalizedEmail)) {
      setError("이미 초대 목록에 있는 이메일입니다.");
      return;
    }
    if (!projectId) {
      setError("프로젝트 정보가 없습니다. 프로젝트를 다시 생성해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post(`/api/projects/${projectId}/members`, {
        team_name: teamName,
        email: normalizedEmail,
      });
      const result = response.data;

      if (result?.isSuccess === false) {
        throw new Error(result.message || "팀원 초대에 실패했습니다.");
      }

      setInvites((current) => [
        ...current,
        {
          email: normalizedEmail,
          userId: result?.data?.user_id,
          name: result?.data?.name,
        },
      ]);
      setEmail("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "팀원 초대 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteClick = async (event) => {
>>>>>>> origin/develop
    event.preventDefault();
    event.stopPropagation();

    if (!email.trim()) return;
<<<<<<< HEAD
    addInvite();
=======
    await addInvite();
>>>>>>> origin/develop
  };

  return (
    <section className="mx-auto flex min-h-[908px] w-full max-w-[612px] flex-col rounded-[11px] border-2 border-gray-5 bg-white px-6 py-10 sm:px-[41px] sm:pb-8 sm:pt-[42px]">
      <h1 className="text-[32px] font-bold tracking-[-0.7px] text-[#191f28]">
        팀원 초대
      </h1>

      <div className="mt-[45px]">
        <label
          htmlFor="invite-team-name"
          className="mb-2 block text-xs font-semibold text-[#4e5968]"
        >
          팀 명
        </label>
        <input
          id="invite-team-name"
          readOnly
          value={teamName}
          className="h-14 w-full rounded-[10px] bg-gray-4 px-6 text-[15px] text-[#4e5968] outline-none"
        />
      </div>

      <div className="mt-[43px]">
        <label
          htmlFor="invite-email"
          className="mb-2 block text-xs font-semibold text-[#4e5968]"
        >
          초대할 팀원 이메일
        </label>
        <input
          id="invite-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addInvite();
            }
          }}
          placeholder="이메일을 입력하세요."
          className="h-14 w-full rounded-[10px] border border-transparent bg-gray-4 px-6 text-[15px] text-[#333d4b] outline-none placeholder:text-[#4e5968] focus:border-primary focus:bg-white"
        />
        {error && <p className="mt-1 text-[11px] text-error">{error}</p>}
      </div>

      <div className="mt-8 border-t border-gray-5 pt-6">
        <h2 className="text-sm font-semibold text-[#333d4b]">
          초대 목록({invites.length})
        </h2>
      </div>

      {invites.length === 0 ? (
        <EmptyInviteList />
      ) : (
        <ul className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {invites.map((invite) => (
            <li
<<<<<<< HEAD
              key={invite}
=======
              key={invite.email}
>>>>>>> origin/develop
              className="flex min-h-12 items-center text-sm text-[#333d4b]"
            >
              <Image
                src="/icons/common/person.svg"
                alt=""
                width={40}
                height={40}
                className="mr-6 shrink-0"
              />
<<<<<<< HEAD
              <span className="w-[165px] truncate">{invite}</span>
=======
              <span className="w-[165px] truncate">{invite.email}</span>
>>>>>>> origin/develop
              <span className="ml-2 inline-flex h-[30px] min-w-[78px] items-center justify-center rounded-[7px] bg-[#fff4e6] px-3 text-xs font-semibold text-orange">
                대기 중
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleInviteClick}
<<<<<<< HEAD
          disabled={!email.trim()}
          className="h-14 w-32 rounded-[10px] bg-primary text-base font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3"
        >
          초대하기
=======
          disabled={!email.trim() || isLoading}
          className="h-14 w-32 rounded-[10px] bg-primary text-base font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3"
        >
          {isLoading ? "초대 중..." : "초대하기"}
>>>>>>> origin/develop
        </button>
        <button
          type="button"
          onClick={() => router.push("/main")}
          className="h-14 w-32 rounded-[10px] bg-primary text-base font-semibold text-white transition hover:bg-secondary"
        >
          넘어가기
        </button>
      </div>
    </section>
  );
}
