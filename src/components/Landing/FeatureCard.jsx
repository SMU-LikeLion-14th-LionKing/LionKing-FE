export default function FeatureCard({ number, title, description, visual }) {
  return (
    <article className="flex min-w-0 flex-col">
      <div className="flex items-start gap-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg leading-[1.4] font-semibold text-primary bg-third">
          {number}
        </span>
        <div>
          <h3 className="text-2xl leading-[1.1] font-bold tracking-[-0.05em] text-gray-1">{title}</h3>
          <p className="mt-3 break-keep text-sm leading-[1.4] font-semibold tracking-[-0.04em] text-gray-3">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex min-h-[148px] items-start justify-start overflow-visible text-xs leading-[1.4] font-normal">
        {visual}
      </div>
    </article>
  );
}
