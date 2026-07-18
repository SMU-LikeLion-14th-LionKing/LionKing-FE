export const calendarEvents = [
  { day: 28, muted: true, events: [] }, { day: 29, muted: true, events: [] }, { day: 30, muted: true, events: [] }, { day: 1, events: [] }, { day: 2, events: [] }, { day: 3, events: [{ label: "회의 (비대면)", tone: "blue" }] }, { day: 4, events: [] },
  { day: 5, events: [] }, { day: 6, events: [{ label: "회의 (대면)", tone: "blue" }] }, { day: 7, events: [] }, { day: 8, events: [] }, { day: 9, events: [] }, { day: 10, events: [] }, { day: 11, events: [] },
  { day: 12, events: [{ label: "디자인 마감", tone: "red" }] }, { day: 13, events: [] }, { day: 14, events: [] }, { day: 15, events: [] }, { day: 16, events: [{ label: "회의 (비대면)", tone: "blue" }] }, { day: 17, events: [] }, { day: 18, events: [] },
  { day: 19, events: [] }, { day: 20, events: [] }, { day: 21, events: [] }, { day: 22, events: [] }, { day: 23, events: [] }, { day: 24, events: [] }, { day: 25, events: [] },
  { day: 26, events: [] }, { day: 27, events: [] }, { day: 28, events: [] }, { day: 29, events: [{ label: "API 연동", tone: "green" }] }, { day: 30, events: [] }, { day: 31, events: [] }, { day: 1, muted: true, events: [] },
];

export const workspaceList = [
  { name: "Figma", mark: "F", color: "bg-[#242424] text-[#f24e1e]" },
  { name: "GitHub", mark: "GH", color: "bg-gray-1 text-white" },
];

export const memberList = [
  { name: "김멋사", email: "likelion@gmail.com", role: "기획/PM", initial: "김", color: "bg-[#35bea1]" },
  { name: "이땡땡", email: "ddaengddaeng@gmail.com", role: "디자인", initial: "이", color: "bg-[#f2697b]" },
  { name: "김네모", email: "nemo@gmail.com", role: "프론트엔드", initial: "김", color: "bg-[#9574dd]" },
  { name: "이세모", email: "semo@gmail.com", role: "백엔드", initial: "이", color: "bg-[#4788db]" },
];

export const scheduleTimeline = [
  { date: "7월 12일", tone: "red", items: ["메인 와이어프레임 최종 산출물 공유"] },
  { date: "7월 16일", tone: "orange", items: ["21:30 디스코드 온라인 회의"] },
  { date: "7월 29일 ~ 30일", tone: "green", items: ["API 연동(29일)", "로그인 예외 처리 완료(30일)"] },
];
