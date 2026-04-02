"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  if (pathname === "/") return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto no-scrollbar py-2">
      <Link
        href="/"
        className="hover:text-black transition-colors flex items-center gap-1.5 flex-shrink-0"
      >
        <Home className="w-4 h-4" />
        <span className="font-medium">Home</span>
      </Link>

      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;

        return (
          <div key={path} className="flex items-center gap-2 flex-shrink-0">
            <ChevronRight className="w-4 h-4 text-gray-300" />
            {isLast ? (
              <span className="font-bold text-black capitalize">
                {path.replace(/-/g, " ")}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-black transition-colors capitalize font-medium"
              >
                {path.replace(/-/g, " ")}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
