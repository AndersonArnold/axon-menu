export function ProductCardSkeleton() {
  return (
    <div className="flex gap-0 rounded-2xl overflow-hidden bg-[#1e293b] border border-[#334155]">
      {/* Image placeholder */}
      <div className="skeleton flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32" style={{ borderRadius: 0 }} />
      {/* Content */}
      <div className="flex flex-col justify-between flex-1 px-3 py-3 gap-2">
        <div className="space-y-2">
          <div className="skeleton h-4 w-3/4 rounded-md" />
          <div className="skeleton h-3 w-full rounded-md" />
          <div className="skeleton h-3 w-2/3 rounded-md" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="skeleton h-5 w-20 rounded-md" />
          <div className="skeleton h-7 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function StoriesMenuSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-4 py-3 border-b border-[#334155]">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="skeleton w-14 h-14 rounded-full" />
          <div className="skeleton h-2.5 w-10 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div>
      <div className="skeleton w-full h-44 sm:h-56" style={{ borderRadius: 0 }} />
      <div className="bg-[#1e293b] px-4 pb-4 pt-0 flex flex-col items-center gap-3">
        <div className="skeleton w-20 h-20 rounded-full -mt-10 relative z-10" />
        <div className="skeleton h-5 w-40 rounded-md" />
        <div className="skeleton h-3 w-52 rounded-md" />
        <div className="skeleton h-6 w-32 rounded-full" />
        <div className="h-px w-full bg-[#334155] mt-1" />
      </div>
    </div>
  );
}
