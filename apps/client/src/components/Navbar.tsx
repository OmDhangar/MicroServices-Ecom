"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google"; // Importing premium Google Font
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Bell, Menu } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

// Assuming these are your local components
import SearchBar from "./SearchBar";
import ShoppingCartIcon from "./ShoppingCartIcon";
import ProfileButton from "./ProfileButton";

// Initialize the premium font
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Catalog", href: "/products" },
  { name: "New Arrivals", href: "/products?category=new" },
];

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Morph the navbar based on scroll position
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed top-0 z-50 w-full flex justify-center transition-all duration-500 ease-in-out ${
        isScrolled ? "pt-4 px-4" : "pt-0 px-0"
      }`}
    >
      <motion.nav
        layout
        className={`flex items-center justify-between w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? "max-w-5xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-6 py-3"
            : "max-w-7xl bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5"
        }`}
      >
        {/* LEFT: Logo & Navigation */}
        <div className="flex items-center gap-8 lg:gap-16"> {/* Increased gap for more breathing room */}
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative z-10">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-black text-white p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-md"
            >
              <Image
                src="/logo.png"
                alt="TrendLama"
                width={24}
                height={24}
                className="w-4 h-4 md:w-5 md:h-5 invert"
              />
            </motion.div>
            {/* Applied Montserrat Font, ultra-bold, tight tracking */}
            <p className={`hidden md:block text-xl md:text-2xl font-black tracking-tighter uppercase text-black ${montserrat.className}`}>
              TRENDLAMA.
            </p>
          </Link>

          {/* Premium Gliding Navigation Links */}
          <div 
            className="hidden lg:flex items-center gap-1 relative z-10 pt-1"
            onMouseLeave={() => setHoveredLink(null)} 
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={() => setHoveredLink(link.name)}
                className="relative px-5 py-2.5 rounded-full"
              >
                {/* Micro-Typography: Small, uppercase, widely tracked */}
                <span 
                  className={`relative z-20 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${
                    hoveredLink === link.name ? "text-black" : "text-gray-500"
                  }`}
                >
                  {link.name}
                </span>
                
                {/* Gliding Background Effect */}
                {hoveredLink === link.name && (
                  <motion.div
                    layoutId="nav-hover-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
                    className="absolute inset-0 bg-gray-100/80 rounded-full -z-10"
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: Search, Actions, & Auth */}
        <div className="flex items-center gap-2 md:gap-4 relative z-10">
          
          <AnimatePresence mode="popLayout">
            {!isScrolled && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="hidden md:block flex-1 lg:min-w-[250px]"
              >
                <SearchBar />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center gap-1 md:gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group"
            >
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-black" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </motion.button>
            
            <Link href="/cart">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="p-2.5 rounded-full hover:bg-gray-100 transition-colors group"
              >
                <div className="text-gray-600 group-hover:text-black">
                  <ShoppingCartIcon />
                </div>
              </motion.div>
            </Link>
            
            <div className={`h-6 w-[1px] bg-gray-200 hidden md:block transition-all ${isScrolled ? "mx-1" : "mx-3"}`} />
            
            <SignedOut>
              <div className="hidden sm:flex items-center gap-1">
                <SignInButton mode="modal">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-600 hover:text-black px-4 py-2.5 rounded-full hover:bg-gray-50 transition-all"
                  >
                    Log In
                  </motion.button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`bg-black text-white px-6 py-2.5 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase shadow-lg shadow-black/10 hover:shadow-black/20 hover:bg-gray-900 transition-all ${montserrat.className}`}
                  >
                    Sign Up
                  </motion.button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <motion.div whileHover={{ scale: 1.05 }}>
                <ProfileButton />
              </motion.div>
            </SignedIn>

            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="lg:hidden p-2 text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </motion.header>
  );
};

export default Navbar;