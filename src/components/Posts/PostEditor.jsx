"use client";

import Image from "next/image";
import { useRef } from "react";

const tools = [
  { name: "bold", label: "굵게", before: "**", after: "**", width: 13, height: 17 },
  { name: "italic", label: "기울임", before: "_", after: "_", width: 10, height: 14 },
  { name: "list", label: "목록", before: "• ", after: "", width: 20, height: 13 },
  { name: "link", label: "링크", before: "[", after: "](https://)", width: 20, height: 20 },
  { name: "blackImage", label: "이미지", before: "![이미지](`", after: "`)", width: 18, height: 18 },
];

export function RequiredMark() {
  return <span className="text-error"> *</span>;
}

export function TextEditor({ value, onChange, placeholder = "내용을 입력하세요.", minHeight = 165 }) {
  const textareaRef = useRef(null);

  const applyTool = (tool) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    onChange(`${value.slice(0, start)}${tool.before}${selected}${tool.after}${value.slice(end)}`);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-5 bg-white focus-within:ring-2 focus-within:ring-primary">
      <textarea ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={50000} className="w-full resize-none px-5 py-4 text-base outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2" style={{ minHeight }} />
      <div className="flex h-11 items-center gap-4 border-t border-gray-5 px-5">
        {tools.map((tool) => <button key={tool.name} type="button" onClick={() => applyTool(tool)} aria-label={tool.label} className="flex h-5 w-5 cursor-pointer items-center justify-center"><Image src={`/icons/Posts/${tool.name}.svg`} alt="" width={tool.width} height={tool.height} /></button>)}
        <span className="ml-auto text-xs text-gray-5">{value.length}/50000</span>
      </div>
    </div>
  );
}

export function FileUpload({ files, onChange }) {
  const inputRef = useRef(null);
  const addFiles = async (fileList) => {
    const nextFiles = await Promise.all(Array.from(fileList).map((file) => new Promise((resolve) => {
      if (!file.type.startsWith("image/")) { resolve({ name: file.name, type: file.type, preview: null }); return; }
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, preview: reader.result });
      reader.onerror = () => resolve({ name: file.name, type: file.type, preview: null });
      reader.readAsDataURL(file);
    })));
    onChange([...files, ...nextFiles].slice(0, 5));
  };

  return (
    <div>
      {files.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-gray-5 px-3 py-2 text-sm"><span className="max-w-52 truncate">{file.name}</span><button type="button" onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))} className="cursor-pointer text-gray-3" aria-label={`${file.name} 삭제`}>×</button></div>)}</div>}
      <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="flex h-[180px] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-5 text-gray-2">
        <span className="flex items-center gap-4 text-left text-[20px] font-medium"><Image src="/icons/Posts/cloudUpload.svg" alt="" width={41} height={41} /><span>파일을 드래그 하거나 클릭하여 첨부하세요.<br />최대(10MB)</span></span>
      </button>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => addFiles(event.target.files)} />
    </div>
  );
}

export default function PostEditor({ title, setTitle, content, setContent, files, setFiles, titleLabel = "제목", contentLabel = "내용", showFiles = true, startNumber = 2, afterContent = null }) {
  return (
    <>
      <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">{startNumber}. {titleLabel}<RequiredMark /></h2><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력하세요." className="h-14 w-full rounded-lg border border-gray-5 px-5 outline-none placeholder:text-[20px] placeholder:font-medium placeholder:text-gray-2 focus:ring-2 focus:ring-primary" /></section>
      <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">{startNumber + 1}. {contentLabel}<RequiredMark /></h2><TextEditor value={content} onChange={setContent} />{afterContent}</section>
      {showFiles && <section className="mt-12"><h2 className="mb-6 text-2xl font-semibold">{startNumber + 2}. 첨부파일</h2><FileUpload files={files} onChange={setFiles} /></section>}
    </>
  );
}
