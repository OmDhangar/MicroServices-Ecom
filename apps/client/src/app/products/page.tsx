import ProductList from "@/components/ProductList";
import Categories from "@/components/Categories";
import Filter from "@/components/Filter";
import { Suspense } from "react";
import Skeleton from "@/components/Skeleton";

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string; sort: string; search: string }>;
}) => {
  const category = (await searchParams).category;
  const sort = (await searchParams).sort;
  const search = (await searchParams).search;
  
  return (
    <div className="flex flex-col md:flex-row gap-12">
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col gap-10 w-64 flex-shrink-0">
        <Categories variant="vertical" />
        <div className="h-[1px] bg-gray-100 w-full" />
        <Filter />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">
              {category ? category.replace("-", " ") : "All Products"}
            </h1>
            <p className="text-gray-500 text-sm">
              Showing our collection of premium quality products.
            </p>
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-100 rounded-xl shadow-sm" />
              ))}
            </div>
          }>
            <ProductList
              category={category}
              sort={sort}
              search={search}
              params="products"
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;
