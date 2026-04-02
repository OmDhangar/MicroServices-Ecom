import ProductList from "@/components/ProductList";
import Categories from "@/components/Categories";
import { Suspense } from "react";
import Skeleton from "@/components/Skeleton";
import AnimatedHero from "@/components/AnimatedHero";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;

  return (
    <main className="min-h-screen pb-24 bg-white selection:bg-black selection:text-white">
      
      {/* 1. ANIMATED HERO SECTION */}
      <AnimatedHero />

      {/* MAIN CONTENT CONTAINER */}
      {/* Added pt-16 to give breathing room after the massive hero section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32 md:space-y-40 pt-16 md:pt-24">
        
        {/* 2. CATEGORIES SECTION */}
        <section className="space-y-12">
          {/* Premium Editorial Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="w-8 h-[1px] bg-black"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
                Collections
              </span>
            </div>
            <h2 className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-[0.9]">
              <span className="font-black tracking-tighter uppercase">Shop By</span>
              <span className="font-serif italic text-gray-400">Category.</span>
            </h2>
            <p className="text-gray-500 font-medium text-base md:text-lg tracking-wide max-w-xl mt-2">
              Curated selections for every occasion. Discover pieces that define your personal aesthetic.
            </p>
          </div>
          
          <Categories variant="horizontal" />
        </section>

        {/* 3. PRODUCT LIST SECTION */}
        <section className="space-y-12">
          {/* Premium Editorial Header */}
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-10">
            <div className="flex items-center gap-4">
              <span className="w-8 h-[1px] bg-black"></span>
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
                {category ? "Filtered" : "Latest"}
              </span>
            </div>
            <h2 className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-[0.9]">
              <span className="font-black tracking-tighter uppercase">
                {category ? category.replace(/-/g, ' ') : "Featured"}
              </span>
              {!category && (
                <span className="font-serif italic text-gray-400 lowercase">
                  Drops.
                </span>
              )}
            </h2>
          </div>

          <Suspense 
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                {/* Upgraded Skeleton Loader:
                  - Aspect ratio 3:4 (standard for high-end fashion)
                  - Softer, more elegant pulse animation
                  - Minimalist UI matching premium brands
                */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-5 animate-pulse group">
                    <div className="aspect-[3/4] w-full rounded-2xl bg-gray-100 overflow-hidden relative">
                       {/* Subtle shimmer effect inside the image placeholder */}
                       <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="space-y-4 px-1">
                      {/* Title placeholder */}
                      <div className="h-4 w-2/3 rounded-sm bg-gray-200/80" />
                      
                      <div className="flex justify-between items-end mt-2">
                        {/* Price placeholder */}
                        <div className="h-4 w-1/4 rounded-sm bg-gray-200/80" />
                        {/* Button placeholder */}
                        <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200/80" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <ProductList category={category} params="homepage" />
          </Suspense>
        </section>
      </div>
    </main>
  );
};

export default Homepage;