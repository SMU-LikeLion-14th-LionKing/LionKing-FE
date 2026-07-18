function FormField({ label, type = "text", value, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#566274]">{label}</span>
      <input type={type} defaultValue={value} placeholder={placeholder} className="h-13 w-full rounded-xl bg-gray-4 px-6 text-sm text-gray-1 outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary/30" />
    </label>
  );
}

export default function ProfileCard() {
  return (
    <section className="rounded-2xl border border-gray-5 bg-white px-7 py-8 sm:px-9 sm:py-9">
      <h1 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">마이페이지</h1>
      <div className="mt-7 flex flex-wrap items-center gap-7">
        <div className="flex h-29 w-29 items-center justify-center rounded-full bg-[#35bd9f] text-4xl font-bold text-white">김</div>
        <button type="button" className="h-13 rounded-2xl border border-gray-5 px-7 text-sm font-medium text-gray-1">프로필 사진 변경</button>
      </div>
      <form className="mt-7 grid grid-cols-1 gap-x-18 gap-y-7 md:grid-cols-2">
        <FormField label="이름" value="김멋사" />
        <FormField label="이메일" value="likelion@gmail.com" />
        <FormField label="기존 비밀번호" type="password" placeholder="기존 비밀번호를 입력하세요." />
        <button type="button" className="mt-6 h-13 rounded-xl bg-[#e2e6eb] text-base font-semibold text-gray-3">비밀번호 변경하기</button>
        <div className="flex justify-end pt-5 md:col-span-2">
          <button type="submit" className="h-13 rounded-xl bg-[#e2e6eb] px-9 text-base font-semibold text-gray-3">변경사항 저장</button>
        </div>
      </form>
    </section>
  );
}
