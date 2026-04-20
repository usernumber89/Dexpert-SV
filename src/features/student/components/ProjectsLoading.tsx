export function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6">
      <div className="mb-6">
        <div className="h-4 w-20 bg-[#BAD8F7] rounded animate-pulse mb-2" />
        <div className="h-6 w-48 bg-[#BAD8F7] rounded animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border border-[#BAD8F7] p-4 mb-6">
        <div className="h-10 bg-[#E8F3FD] rounded-lg animate-pulse" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#BAD8F7] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 bg-[#E8F3FD] rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-3 bg-[#E8F3FD] rounded w-24 mb-1 animate-pulse" />
                <div className="h-2 bg-[#E8F3FD] rounded w-16 animate-pulse" />
              </div>
            </div>
            <div className="h-4 bg-[#E8F3FD] rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-[#E8F3FD] rounded w-full mb-1 animate-pulse" />
            <div className="h-3 bg-[#E8F3FD] rounded w-2/3 mb-4 animate-pulse" />
            <div className="flex gap-1 mb-3">
              <div className="h-5 w-16 bg-[#E8F3FD] rounded-full animate-pulse" />
              <div className="h-5 w-20 bg-[#E8F3FD] rounded-full animate-pulse" />
            </div>
            <div className="h-3 bg-[#E8F3FD] rounded w-24 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}