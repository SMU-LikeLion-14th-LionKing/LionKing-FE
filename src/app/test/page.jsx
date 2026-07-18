"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import Checkbox from "@/components/common/Checkbox";
import DeadlineBadge from "@/components/common/DeadlineBadge";
import Icon from "@/components/common/Icon";
import StatusBadge from "@/components/common/StatusBadge";
import TaskItem from "@/components/common/TaskItem";

function Section({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-gray-5 bg-white p-6 ${className}`}
    >
      <h2 className="h3 mb-5 text-gray-1">{title}</h2>
      {children}
    </section>
  );
}

export default function ComponentTestPage() {
  const [loginEnabled, setLoginEnabled] = useState(false);
  const [loginSaved, setLoginSaved] = useState(true);
  const [taskApiDone, setTaskApiDone] = useState(false);

  return (
    <main className="min-h-screen bg-gray-4 p-8 md:p-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="caption mb-2 text-primary">COMMON COMPONENTS</p>
          <h1 className="h1 text-gray-1">컴포넌트 테스트</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Button">
            <div className="grid max-w-sm gap-3">
              <Button size="lg">로그인</Button>
              <Button variant="secondary" size="lg">
                로그인
              </Button>
              <Button variant="light" size="lg" disabled>
                로그인
              </Button>
              <Button variant="outline" size="lg">
                IT/개발 프로젝트
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="sm">등록</Button>
              <Button size="md">내용으로 작성</Button>
              <Button variant="light" size="sm">
                전체
              </Button>
              <Button variant="primary" size="sm" disabled>
                전체
              </Button>
            </div>
          </Section>

          <Section title="Checkbox">
            <div className="space-y-4">
              <Checkbox
                label="로그인 상태 유지"
                checked={loginEnabled}
                onChange={(event) => setLoginEnabled(event.target.checked)}
              />
              <p> </p>
              <Checkbox
                label="로그인 상태 유지"
                checked={loginSaved}
                onChange={(event) => setLoginSaved(event.target.checked)}
              />
            </div>
          </Section>

          <Section title="Icon" className="lg:col-span-2">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <DeadlineBadge date="2026.07.24" dDay="D-17" />
                <DeadlineBadge date="2026.07.24" dDay="D-7" variant="urgent" />
                <DeadlineBadge
                  date="2026.07.24"
                  dDay="D-3"
                  remainingTime="23:45:12"
                  variant="urgent"
                />
                <DeadlineBadge date="2026.07.24" completed />
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                <div className="flex items-center gap-2">
                  <Icon name="check" size={26} />
                  <span className="body">확인 완료</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="pending" size={26} />
                  <span className="body">검토 중</span>
                </div>
                <div className="flex items-center gap-2 text-gray-2">
                  <Icon name="eye" size={28} />
                  <Icon name="eyeOff" size={28} />
                </div>
                <div className="flex flex-col gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                  <button className="flex items-center gap-2 text-left text-lg text-gray-1">
                    <Icon name="edit" size={24} /> 수정
                  </button>
                  <button className="flex items-center gap-2 text-left text-lg text-error">
                    <Icon name="trash" size={24} /> 삭제
                  </button>
                </div>
                <button className="flex items-center gap-1 rounded-full border border-gray-5 bg-white px-3 py-1.5">
                  <Icon name="plusCircle" size={19} /> 반응 추가
                </button>
              </div>
            </div>
          </Section>

          <Section title="Status badge" className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-6">
              <StatusBadge status="pending" />
              <StatusBadge status="accepted" />
            </div>
          </Section>

          <Section title="Task item" className="lg:col-span-2">
            <div className="grid max-w-2xl gap-3 md:grid-cols-2">
              <TaskItem
                title="API 연동"
                dueDate="29일"
                checked={taskApiDone}
                onChange={(event) => setTaskApiDone(event.target.checked)}
              />
              <TaskItem
                title="로그인 예외 처리 완료"
                dueDate="30일"
                completed
              />
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
