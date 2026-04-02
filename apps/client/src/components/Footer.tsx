import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white text-black pt-12 md:pt-16 pb-8 mt-12 md:mt-24 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: Editorial Typography & Newsletter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-12 md:mb-16">
          
          <div className="space-y-4 max-w-2xl">
            {/* Signature Font Pairing */}
            <h2 className="flex flex-col text-5xl md:text-6xl lg:text-[5rem] leading-[0.85]">
              <span className="font-black tracking-tighter uppercase text-black">Stay In</span>
              <span className="font-serif italic text-gray-500 pl-1 md:pl-2">The Loop.</span>
            </h2>
            <p className="text-gray-500 font-medium text-sm md:text-base max-w-md pt-2">
              Subscribe for exclusive drops, early access to sales, and curated editorial content.
            </p>
          </div>

          {/* Premium Minimalist Newsletter Input */}
          <div className="w-full lg:w-[400px] flex items-center border-b border-gray-300 focus-within:border-black transition-colors pb-2 group">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full bg-transparent outline-none text-sm font-medium text-black placeholder:text-gray-400"
            />
            <button className="p-2 -mr-2 transition-transform duration-300 group-focus-within:translate-x-1 hover:translate-x-1">
              <ArrowRight className="w-5 h-5 text-gray-400 group-focus-within:text-black hover:text-black transition-colors" />
            </button>
          </div>
        </div>

        {/* LINKS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-10 lg:gap-8 border-t border-gray-100 pt-10">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-5 flex flex-col gap-5 lg:pr-12">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="bg-black p-1.5 rounded-xl group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
                <Image 
                  src="/logo.png" 
                  alt="TrendLama" 
                  width={24} 
                  height={24} 
                  className="w-5 h-5 md:w-6 md:h-6 invert brightness-0"
                />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-black">
                Trendlama.
              </span>
            </Link>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
              Redefining modern aesthetics. Curated fashion and statement pieces for the contemporary individual.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Shop</h3>
            <Link href="/products" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">All Products</Link>
            <Link href="/products?category=new" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">New Arrivals</Link>
            <Link href="/products?category=best-sellers" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">Best Sellers</Link>
            <Link href="/products?category=sale" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">Archive Sale</Link>
          </div>

          {/* Links Column 2 */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Company</h3>
            <Link href="/about" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">About Us</Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">Contact</Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">Editorial</Link>
            <Link href="/careers" className="text-sm text-gray-600 hover:text-black transition-colors w-fit">Careers</Link>
          </div>

          {/* Links Column 3 */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3 flex flex-col gap-4">
            <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Socials</h3>
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors w-fit group flex items-center gap-2">
              Instagram <ArrowRight className="w-3 h-3 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0" />
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors w-fit group flex items-center gap-2">
              TikTok <ArrowRight className="w-3 h-3 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0" />
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors w-fit group flex items-center gap-2">
              Twitter / X <ArrowRight className="w-3 h-3 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0" />
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors w-fit group flex items-center gap-2">
              Pinterest <ArrowRight className="w-3 h-3 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0" />
            </a>
          </div>
        </div>

        {/* BOTTOM LEGAL BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-12 md:mt-16 pt-8 border-t border-gray-100 text-[11px] uppercase tracking-widest font-bold text-gray-400">
          <p>© {new Date().getFullYear()} TRENDLAMA. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
            <Link href="/shipping" className="hover:text-black transition-colors">Shipping & Returns</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;