"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Filter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 group self-end md:self-auto">
      <span className="font-semibold text-gray-400 uppercase tracking-tighter text-[10px]">Sort By</span>
      <div className="relative">
        <select
          name="sort"
          id="sort"
          defaultValue={searchParams.get("sort") || "newest"}
          className="appearance-none bg-white border border-gray-100 hover:border-gray-300 shadow-sm px-4 py-2 pr-10 rounded-xl font-medium text-gray-900 cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20"
          onChange={(e) => handleFilter(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Filter;
