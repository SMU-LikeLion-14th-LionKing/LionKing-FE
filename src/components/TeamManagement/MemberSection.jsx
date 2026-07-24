"use client";

import { memberList } from "@/constants/teammanagement";
import Image from "next/image";
import { useState } from "react";
import MemberCard from "./MemberCard";

export default function MemberSection() {
  const [members, setMembers] = useState(memberList);
  const [draftMembers, setDraftMembers] = useState(memberList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderEmail, setLeaderEmail] = useState(null);
  const [draftLeaderEmail, setDraftLeaderEmail] = useState(memberList[0]?.email ?? null);

  const openModal = () => {
    setDraftMembers(members.map((member) => ({ ...member })));
    setDraftLeaderEmail(leaderEmail ?? memberList[0]?.email ?? null);
    setIsModalOpen(true);
  };

  const applyChanges = (event) => {
    event.preventDefault();
    setMembers(draftMembers.map((member) => ({ ...member })));
    setLeaderEmail(draftLeaderEmail);
    setIsModalOpen(false);
  };

  const changeRole = (email, role) => {
    setDraftMembers((current) => current.map((member) => (
      member.email === email ? { ...member, role } : member
    )));
  };

  return (
    <>
      <section className="rounded-2xl border border-gray-5 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">팀원({members.length}명)</h2>
          <button type="button" onClick={openModal} aria-label="팀원 설정" className="flex h-7 w-7 cursor-pointer items-center justify-center">
            <Image src="/icons/TeamManagement/teammate.svg" alt="" width={28} height={28} />
          </button>
        </div>
        <div className="space-y-3">{members.map((member) => <MemberCard key={member.email} member={member} isLeader={member.email === leaderEmail} />)}</div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" onMouseDown={() => setIsModalOpen(false)}>
          <form className="relative w-full max-w-[660px] rounded-[10px] border-2 border-primary bg-white px-[38px] pb-[46px] pt-[44px] shadow-xl" role="dialog" aria-modal="true" aria-labelledby="member-edit-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={applyChanges}>
            <button type="button" onClick={() => setIsModalOpen(false)} aria-label="팀원 수정 창 닫기" className="absolute right-0 top-[-32px] h-[22px] w-[22px] cursor-pointer">
              <Image src="/icons/common/close.svg" alt="" width={22} height={22} />
            </button>

            <div className="mb-4 flex items-end justify-between">
              <h3 id="member-edit-title" className="text-2xl font-bold">팀원 수정</h3>
              <span className="w-[52px] text-center text-sm font-semibold">팀장</span>
            </div>

            <div className="space-y-4">
              {draftMembers.map((member) => (
                <div key={member.email} className="flex items-center gap-5">
                  <div className="flex h-[76px] min-w-0 flex-1 items-center gap-5 rounded-[15px] border border-[#d1d1d1] px-[15px]">
                    <div className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white ${member.color}`}>{member.initial}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-semibold">{member.name}</p>
                      <p className="mt-1 truncate text-sm text-gray-2">{member.email}</p>
                    </div>
                    <input type="text" value={member.role} onChange={(event) => changeRole(member.email, event.target.value)} aria-label={`${member.name} 역할`} placeholder="역할 입력" className="h-9 w-[100px] shrink-0 rounded-md border border-black bg-white px-3 text-center text-sm font-semibold outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary" />
                  </div>
                  <label className="flex w-[52px] cursor-pointer justify-center">
                    <input type="radio" name="teamLeader" value={member.email} checked={draftLeaderEmail === member.email} onChange={() => setDraftLeaderEmail(member.email)} className="h-6 w-6 accent-black" aria-label={`${member.name} 팀장 선택`} />
                  </label>
                </div>
              ))}
            </div>

            <button type="submit" disabled={!draftLeaderEmail} className="mt-4 h-12 w-full rounded-[10px] bg-primary text-base font-semibold text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:bg-gray-5 disabled:text-gray-3">
              수정
            </button>
          </form>
        </div>
      )}
    </>
  );
}
