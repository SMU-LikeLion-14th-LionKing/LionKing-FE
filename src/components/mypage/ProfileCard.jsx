"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const INITIAL_PROFILE = {
  name: "김멋사",
  email: "likelion@gmail.com",
};

function TextField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#566274]">{label}</span>
      <input
        value={value}
        onInput={onChange}
        className="h-13 w-full rounded-xl bg-gray-4 px-6 text-sm text-gray-1 outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function PasswordField({ label, value, onChange, placeholder }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#566274]">{label}</span>
      <span className="relative block">
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-13 w-full rounded-xl bg-gray-4 px-6 pr-14 text-sm text-gray-1 outline-none placeholder:text-gray-2 focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute inset-y-0 right-5 flex items-center"
          aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={isVisible}
        >
          <Image src="/icons/MyPage/eye.svg" alt="" width={19} height={18} />
        </button>
      </span>
    </label>
  );
}

function PasswordChangeModal({ onClose, onConfirm }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const hasBothPasswords = newPassword.length > 0 && confirmPassword.length > 0;
  const isPasswordMismatch = hasBothPasswords && newPassword !== confirmPassword;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!hasBothPasswords || isPasswordMismatch) return;
    onConfirm(newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="password-change-title" className="relative w-full max-w-[460px] rounded-xl border border-primary bg-white px-7 py-8 shadow-xl sm:px-9">
        <button type="button" onClick={onClose} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-lg leading-none text-primary shadow-sm" aria-label="비밀번호 변경 창 닫기">×</button>
        <h2 id="password-change-title" className="text-2xl font-bold text-gray-1">비밀번호 변경</h2>
        <div className="mt-6 space-y-5">
          <PasswordField label="새 비밀번호" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="새 비밀번호를 입력하세요." />
          <PasswordField label="새 비밀번호 확인" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="새 비밀번호를 입력하세요." />
          {isPasswordMismatch && <p className="-mt-2 text-sm font-medium text-error">비밀번호가 일치하지 않습니다.</p>}
        </div>
        <button type="submit" disabled={!hasBothPasswords} className={`mt-7 h-13 w-full rounded-xl text-sm font-semibold ${hasBothPasswords ? "bg-primary text-white hover:bg-primary/90" : "cursor-not-allowed bg-[#e2e6eb] text-gray-3"}`}>비밀번호 변경</button>
      </form>
    </div>
  );
}

export default function ProfileCard() {
  const [savedProfile, setSavedProfile] = useState(INITIAL_PROFILE);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [password, setPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const fileInputRef = useRef(null);

  const updateProfile = (field) => (event) => {
    const nextProfile = { ...profile, [field]: event.target.value };
    setProfile(nextProfile);
    setIsSaveEnabled(nextProfile.name !== savedProfile.name || nextProfile.email !== savedProfile.email);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isSaveEnabled) return;

    setSavedProfile(profile);
    setIsSaveEnabled(false);
  };

  const handleProfileImageChange = (event) => {
    const [file] = event.target.files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <section className="rounded-2xl border border-gray-5 bg-white px-7 py-8 sm:px-9 sm:py-9">
      <h1 className="text-3xl font-bold tracking-[-0.04em] text-gray-1">마이페이지</h1>

      <div className="mt-7 flex flex-wrap items-center gap-7">
        <div className="relative flex h-29 w-29 items-center justify-center overflow-hidden rounded-full bg-[#35bd9f] text-4xl font-bold text-white">
          {profileImage ? (
            <Image src={profileImage} alt={`${profile.name} 프로필 사진`} fill unoptimized className="object-cover" />
          ) : profile.name.trim().charAt(0)}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfileImageChange} className="sr-only" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="h-13 rounded-2xl border border-gray-5 px-7 text-sm font-medium text-gray-1">프로필 사진 변경</button>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 grid grid-cols-1 gap-x-18 gap-y-7 md:grid-cols-2">
        <TextField label="이름" value={profile.name} onChange={updateProfile("name")} />
        <TextField label="이메일" value={profile.email} onChange={updateProfile("email")} />

        <PasswordField label="기존 비밀번호" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="기존 비밀번호를 입력하세요." />

        <button type="button" onClick={() => setIsPasswordModalOpen(true)} disabled={!password} className={`mt-6 h-13 rounded-xl text-base font-semibold ${password ? "bg-primary text-white" : "cursor-not-allowed bg-[#e2e6eb] text-gray-3"}`}>비밀번호 변경하기</button>

        <div className="flex justify-end pt-5 md:col-span-2">
          <button
            type="submit"
            disabled={!isSaveEnabled}
            className={`h-13 rounded-xl px-9 text-base font-semibold transition-colors ${isSaveEnabled ? "bg-primary text-white hover:bg-primary/90" : "cursor-not-allowed bg-[#e2e6eb] text-gray-3"}`}
          >
            변경사항 저장
          </button>
        </div>
      </form>
      {isPasswordModalOpen && <PasswordChangeModal onClose={() => setIsPasswordModalOpen(false)} onConfirm={() => { setPassword(""); setIsPasswordModalOpen(false); }} />}
    </section>
  );
}
