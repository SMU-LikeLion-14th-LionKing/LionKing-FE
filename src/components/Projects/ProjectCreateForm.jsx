"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "IT/소프트웨어",
  "교양/학술",
  "공모전",
  "디자인/영상",
  "마케팅/기획",
  "기타",
];

const fieldClass =
  "h-14 w-full rounded-[10px] border border-transparent bg-gray-4 px-6 text-[15px] text-[#333d4b] outline-none transition placeholder:text-[#333d4b] focus:border-primary focus:bg-white";

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2.5 block text-sm font-semibold text-[#4e5968]"
    >
      {children} <span className="text-error">*</span>
    </label>
  );
}

export default function ProjectCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    teamName: "",
    projectName: "",
    category: "",
    deadline: "",
  });

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const isComplete = Object.values(form).every(Boolean);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isComplete) return;
    router.push(
      `/invite?team=${encodeURIComponent(form.teamName)}&project=${encodeURIComponent(form.projectName)}`,
    );
  };

  return (
    <section className="mx-auto w-full max-w-[612px] rounded-[11px] border-2 border-gray-5 bg-white px-6 py-10 sm:px-[41px] sm:pb-8 sm:pt-[42px]">
      <h1 className="text-[32px] font-bold tracking-[-0.7px] text-[#191f28]">
        프로젝트 생성
      </h1>

      <form onSubmit={handleSubmit} className="mt-[45px]">
        <div>
          <FieldLabel htmlFor="teamName">팀 명</FieldLabel>
          <input
            id="teamName"
            value={form.teamName}
            onChange={updateField("teamName")}
            className={fieldClass}
            placeholder="팀 명을 입력하세요."
          />
        </div>

        <div className="mt-[43px]">
          <FieldLabel htmlFor="projectName">프로젝트 명</FieldLabel>
          <input
            id="projectName"
            value={form.projectName}
            onChange={updateField("projectName")}
            className={fieldClass}
            placeholder="프로젝트를 입력하세요."
          />
        </div>

        <fieldset className="mt-[43px]">
          <legend className="mb-[27px] text-sm font-semibold text-[#4e5968]">
            프로젝트 분야 <span className="text-error">*</span>
          </legend>
          <div className="grid grid-cols-1 gap-x-[27px] gap-y-8 sm:grid-cols-2">
            {CATEGORIES.map((category) => {
              const selected = form.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    setForm((current) => ({ ...current, category }))
                  }
                  className={`h-14 rounded-[10px] border text-[15px] transition ${
                    selected
                      ? "border-primary bg-third font-semibold text-primary"
                      : "border-transparent bg-gray-4 text-[#333d4b] hover:bg-gray-5"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-[43px]">
          <FieldLabel htmlFor="deadline">마감기한</FieldLabel>
          <input
            id="deadline"
            type="text"
            value={form.deadline}
            onChange={updateField("deadline")}
            onFocus={(event) => (event.currentTarget.type = "datetime-local")}
            onBlur={(event) => {
              if (!event.currentTarget.value) event.currentTarget.type = "text";
            }}
            className={`${fieldClass} appearance-none`}
            placeholder="마감기한 및 시간을 입력하세요."
          />
        </div>

        <div className="mt-[33px] flex justify-end">
          <button
            type="submit"
            disabled={!isComplete}
            className="h-14 w-[168px] rounded-[10px] bg-primary text-base font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3"
          >
            프로젝트 생성
          </button>
        </div>
      </form>
    </section>
  );
}
