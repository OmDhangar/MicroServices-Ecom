"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const SearchBar = () => {
  const [value, setValue] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-2xl focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black/20 transition-all duration-300 w-full group shadow-sm">
      <Search className="w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
      <input
        id="search"
        type="text"
        autoComplete="off"
        placeholder="Discover something new..."
        className="text-sm border-none outline-none bg-transparent w-full placeholder:text-gray-400 text-gray-900"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(value);
          }
        }}
      />
    </div>
  );
};

export default SearchBar;
