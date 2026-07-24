"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import { FileUpload, TextEditor } from "@/components/Posts/PostEditor";
import api from "@/lib/api";

const subscribeToProjectSelection = (callback) => {
  window.addEventListener("team-selection-changed", callback);
  return () =>
    window.removeEventListener("team-selection-changed", callback);
};
const getSelectedProjectId = () =>
  sessionStorage.getItem("selected_project_id") || "";
const getSelectedTeamName = () =>
  sessionStorage.getItem("selected_team_name") || "라이온킹";
const getSelectedTeamIcon = () =>
  sessionStorage.getItem("selected_team_icon") || "/icons/Sidebar/lion.svg";
const getServerProjectId = () => "";
const getServerTeamName = () => "라이온킹";
const getServerTeamIcon = () => "/icons/Sidebar/lion.svg";

export default function NoticeCreatePage() {
  const router = useRouter();
  const projectId = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedProjectId,
    getServerProjectId,
  );
  const teamName = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedTeamName,
    getServerTeamName,
  );
  const teamIcon = useSyncExternalStore(
    subscribeToProjectSelection,
    getSelectedTeamIcon,
    getServerTeamIcon,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isValid = Boolean(projectId && title.trim() && content.trim());

  const submitNotice = async (event) => {
    event.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const attachments = files
        .filter((file) => file.fileUrl || file.preview)
        .map((file) => ({
          fileUrl: file.fileUrl || file.preview,
          fileType: file.type || "application/octet-stream",
        }));
      const { data: result } = await api.post(
        `/api/projects/${projectId}/notice`,
        {
          title: title.trim(),
          content: content.trim(),
          attachments,
        },
      );

      if (result?.isSuccess === false) {
        throw new Error(result.message || "공지사항 등록에 실패했습니다.");
      }

      router.push("/notice");
      router.refresh();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "공지사항 등록에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="ml-64 min-w-0 flex-1 bg-white p-5 sm:p-8 lg:p-10">
        <div className="mx-auto w-full max-w-7xl">
          <header className="flex items-center gap-3">
            <Image
              src={teamIcon}
              alt=""
              width={45}
              height={45}
            />
            <h1 className="text-[36px] font-bold">{teamName}</h1>
          </header>
          <h2 className="ml-6 mt-10 text-[32px] font-bold">공지사항 작성</h2>

          <form onSubmit={submitNotice}>
            <div className="mt-8 rounded-xl border border-gray-5 px-8 py-12">
              <section>
                <h3 className="mb-6 text-2xl font-semibold">
                  1. 공지사항 제목 <span className="text-error">*</span>
                </h3>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="제목을 입력하세요."
                  maxLength={200}
                  className="h-14 w-full rounded-lg border border-gray-5 px-5 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2 focus:ring-2 focus:ring-primary"
                />
              </section>

              <section className="mt-12">
                <h3 className="mb-6 text-2xl font-semibold">
                  2. 공지사항 내용 <span className="text-error">*</span>
                </h3>
                <TextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="공지사항 내용을 입력하세요."
                  minHeight={240}
                />
              </section>

              <section className="mt-12">
                <h3 className="mb-6 text-2xl font-semibold">3. 첨부파일</h3>
                <FileUpload files={files} onChange={setFiles} />
              </section>
            </div>

            {!projectId && (
              <p role="alert" className="mt-4 text-right text-error">
                공지사항을 등록할 프로젝트를 먼저 선택해주세요.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-4 text-right text-error">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 py-5">
              <button
                type="button"
                onClick={() => router.push("/notice")}
                className="cursor-pointer rounded-lg border border-gray-5 px-7 py-4 font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="cursor-pointer rounded-lg bg-primary px-7 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3"
              >
                {submitting ? "등록 중..." : "공지사항 등록하기"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
