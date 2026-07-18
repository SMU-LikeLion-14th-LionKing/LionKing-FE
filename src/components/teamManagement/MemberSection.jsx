import { memberList } from "@/constants/teamManagement";
import Image from "next/image";
import MemberCard from "./MemberCard";

export default function MemberSection() {
  return (
    <section className="rounded-2xl border border-gray-5 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">팀원({memberList.length}명)</h2>
        <Image src="/icons/TeamManagement/teammate.svg" alt="팀원 관리" width={28} height={28} />
      </div>
      <div className="space-y-3">{memberList.map((member) => <MemberCard key={member.email} member={member} />)}</div>
    </section>
  );
}
