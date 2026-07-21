"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const typeLabels = { task: "작업", question: "질문", note: "회의록" };
const imagePattern = /\.(png|jpe?g|gif|webp|svg)$/i;

function editHref(post) {
  return `/posts/create?edit=${encodeURIComponent(post.id)}`;
}

export default function DashboardPosts() {
  const [posts, setPosts] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosts(JSON.parse(localStorage.getItem("lionking-posts") ?? "[]"));
  }, []);

  const removePost = (id) => {
    const next = posts.filter((post) => post.id !== id);
    setPosts(next);
    localStorage.setItem("lionking-posts", JSON.stringify(next));
    setOpenMenu(null);
  };

  return (
    <main className="min-w-0 flex-1 px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-[1090px]">
        <div className="flex items-center justify-between"><h1 className="text-[32px] font-bold">게시글</h1><Link href="/posts/create" className="rounded-lg bg-primary px-5 py-3 font-semibold text-white">게시글 작성</Link></div>
        {posts.length === 0 ? <div className="mt-8 rounded-xl border border-gray-5 py-24 text-center text-gray-2">등록된 게시글이 없습니다.</div> : <div className="mt-8 space-y-5">{posts.map((post) => {
          const imageFile = (post.files ?? []).find((file) => imagePattern.test(file.name ?? file));
          const imagePreview = post.coverImage ?? imageFile?.preview ?? null;
          return <article key={post.id} className="relative grid min-h-[210px] overflow-visible rounded-xl border border-gray-5 bg-white md:grid-cols-2">
            <div className="p-7"><span className="inline-flex items-center gap-2 rounded-full bg-third px-3 py-1 text-sm font-semibold text-primary"><Image src={`/icons/Posts/${post.type}.svg`} alt="" width={20} height={20} />{typeLabels[post.type]}</span><h2 className="mt-4 truncate text-2xl font-semibold">{post.title}</h2><p className="mt-3 line-clamp-3 whitespace-pre-line text-gray-3">{post.content}</p></div>
            <div className="flex min-h-[180px] items-center justify-center overflow-hidden border-t border-gray-5 bg-[#fafafa] p-7 md:border-l md:border-t-0">{post.type === "question" && post.vote ? <div className="w-full rounded-lg border border-primary bg-third p-4"><strong className="text-primary">투표</strong><p className="mt-2 font-semibold">{post.vote.question}</p><div className="mt-3 flex flex-wrap gap-3">{post.vote.candidates.map((candidate, index) => { const item = typeof candidate === "string" ? { text: candidate, image: "" } : candidate; return <span key={`${item.text}-${index}`} className="flex flex-col rounded bg-white p-2 text-sm"><Image src={item.image || "/icons/Posts/noImage.svg"} alt="" width={80} height={72} unoptimized={Boolean(item.image)} className="h-[72px] w-20 rounded object-cover" /><span className="mt-1 max-w-20 truncate">{item.text}</span></span>; })}</div></div> : imagePreview ? <Image src={imagePreview} alt="첨부 이미지" width={360} height={220} unoptimized className="h-full max-h-[190px] w-full rounded-lg object-cover" /> : imageFile ? <p className="text-sm text-gray-2">이미지를 다시 첨부해주세요.</p> : null}</div>
            <div className="absolute right-3 top-3 z-10"><button type="button" onClick={() => setOpenMenu((current) => current === post.id ? null : post.id)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm" aria-label="게시글 메뉴"><Image src="/icons/Posts/more.svg" alt="" width={24} height={24} /></button>{openMenu === post.id && <div className="absolute right-0 top-11 w-24 overflow-hidden rounded-lg border border-gray-5 bg-white py-1 shadow-lg"><Link href={editHref(post)} className="block px-4 py-2 text-center hover:bg-gray-4">수정</Link><button type="button" onClick={() => removePost(post.id)} className="w-full cursor-pointer px-4 py-2 text-error hover:bg-gray-4">삭제</button></div>}</div>
          </article>;
        })}</div>}
      </div>
    </main>
  );
}
