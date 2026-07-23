import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar/Sidebar";

const NOTICES = [
  {
    id: 1,
    title: "최종 발표 일정 변경 안내",
    date: "2026.07.14(화) 18:00",
    lines: [
      "7/24 (목) 18:00 최종 발표",
      "→ 7/22(화)까지 발표 자료 및 시연 영상 제출 부탁드립니다.",
      "",
      "+ 시연 영상 5분 이내",
    ],
  },
  {
    id: 2,
    title: "7/14 회의 장소 변경 안내",
    date: "2026.07.13(월) 13:00",
    lines: [
      "7/14(월) 회의 장소 변경되었습니다.",
      "기존: 공학관 207 → 변경: 공학관 205",
    ],
  },
  {
    id: 3,
    title: "API 명세서 공유 안내",
    date: "2026.07.12(일) 19:20",
    lines: [
      "API 명세서 최신 버전 공유",
      "7/14(월)까지 첨부된 내용 확인해주세요.",
    ],
  },
  {
    id: 4,
    title: "다음주 일정 안내",
    date: "2026.07.12(일) 09:40",
    lines: [
      "다음주 (7/15~7/18) 주요 일정 안내",
      "ㆍ7/15(화): 중간 점검 회의",
      "ㆍ7/16(수): 와이어프레임 최종 확인",
      "ㆍ7/17(목)~7/18(금): 기능 구현 및 테스트",
    ],
  },
];

function NoticeCard({ notice }) {
  return (
    <article className="relative min-h-[114px] rounded-[10px] border border-gray-5 px-5 py-5 sm:px-7 sm:pr-48">
      <h3 className="text-[22px] font-semibold tracking-[-0.3px] text-gray-1">
        {notice.title}
      </h3>
      <div className="mt-2 text-sm leading-[1.45] text-gray-1">
        {notice.lines.map((line, index) =>
          line ? <p key={index}>{line}</p> : <div key={index} className="h-3" />,
        )}
      </div>
      <time className="mt-3 block text-sm text-gray-1 sm:absolute sm:right-7 sm:top-5 sm:mt-0">
        {notice.date}
      </time>
    </article>
  );
}

export default function ProjectNoticesPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-9">
        <section className="mx-auto w-full max-w-[1080px]">
          <header className="flex items-center gap-3">
            <Image
              src="/icons/Sidebar/lion.svg"
              alt=""
              width={38}
              height={38}
            />
            <h1 className="text-[32px] font-bold tracking-[-0.7px] text-gray-1">
              라이온킹
            </h1>
          </header>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-[26px] font-bold tracking-[-0.4px] text-gray-1">
              공지사항
            </h2>
            <div className="text-right">
              <Link
                href="/notice/create"
                className="inline-flex h-11 items-center rounded-[20px] bg-primary px-5 text-base font-semibold text-white transition hover:bg-secondary"
              >
                <span className="mr-1 text-2xl font-light leading-none">+</span>
                공지사항 작성
              </Link>
              <p className="mt-2 text-xs text-gray-2">
                (권한 부여된 사용자만 작성 가능)
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-2">
            {NOTICES.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
