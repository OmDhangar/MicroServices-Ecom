"use client";
import {
  Footprints,
  Glasses,
  Briefcase,
  Shirt,
  ShoppingBasket,
  Hand,
  Venus,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categories = [
  {
    name: "All",
    icon: <ShoppingBasket className="w-4 h-4" />,
    slug: "all",
  },
  {
    name: "T-shirts",
    icon: <Shirt className="w-4 h-4" />,
    slug: "t-shirts",
  },
  {
    name: "Shoes",
    icon: <Footprints className="w-4 h-4" />,
    slug: "shoes",
  },
  {
    name: "Accessories",
    icon: <Glasses className="w-4 h-4" />,
    slug: "accessories",
  },
  {
    name: "Bags",
    icon: <Briefcase className="w-4 h-4" />,
    slug: "bags",
  },
  {
    name: "Dresses",
    icon: <Venus className="w-4 h-4" />,
    slug: "dresses",
  },
  {
    name: "Jackets",
    icon: <Shirt className="w-4 h-4" />,
    slug: "jackets",
  },
  {
    name: "Gloves",
    icon: <Hand className="w-4 h-4" />,
    slug: "gloves",
  },
];

const Categories = ({
  variant = "horizontal",
}: {
  variant?: "horizontal" | "vertical";
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams.get("category");

  const handleChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", value || "all");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (variant === "vertical") {
    return (
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 px-2 uppercase tracking-wider">Categories</h3>
        {categories.map((category) => (
          <div
            className={`flex items-center gap-3 cursor-pointer px-4 py-2.5 rounded-xl transition-all duration-200 ${
              category.slug === selectedCategory || (category.slug === "all" && !selectedCategory)
                ? "bg-black text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            key={category.name}
            onClick={() => handleChange(category.slug)}
          >
            <span className={category.slug === selectedCategory || (category.slug === "all" && !selectedCategory) ? "text-white" : "text-gray-400"}>
              {category.icon}
            </span>
            <span className="text-sm font-medium">{category.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 mb-8">
      {categories.map((category) => (
        <div
          className={`flex items-center justify-center gap-2 cursor-pointer px-6 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 border ${
            category.slug === selectedCategory || (category.slug === "all" && !selectedCategory)
              ? "bg-black text-white border-black shadow-md shadow-black/10"
              : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-900 hover:text-gray-900"
          }`}
          key={category.name}
          onClick={() => handleChange(category.slug)}
        >
          {category.icon}
          <span className="text-sm font-semibold tracking-wide">{category.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Categories;
