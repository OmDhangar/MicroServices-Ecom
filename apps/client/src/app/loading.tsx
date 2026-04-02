export default function Loading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* HERO SKELETON */}
      <div className="w-full aspect-[3/1] bg-gray-200 rounded-xl" />
      
      {/* CATEGORIES SKELETON */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-gray-100 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* PRODUCTS GRID SKELETON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="aspect-[2/3] bg-gray-200 rounded-lg" />
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
  );
}
