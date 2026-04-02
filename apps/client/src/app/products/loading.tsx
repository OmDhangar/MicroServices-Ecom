export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row gap-8 animate-pulse">
      {/* SIDEBAR SKELETON */}
      <div className="hidden md:flex flex-col gap-6 w-64 flex-shrink-0">
        <div className="h-6 w-1/2 bg-gray-200 rounded" />
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-5 w-3/4 bg-gray-100 rounded" />
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID SKELETON */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div className="h-6 w-1/4 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[2/3] bg-gray-200 rounded-lg shadow-sm" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="flex justify-between items-center mt-2">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
