"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

const AnimatedHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track button hover, used to trigger the background image reaction
  const [isExploreHovered, setIsExploreHovered] = useState(false);

  // Track scroll position for complex parallax and depth effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Premium Scroll Effects: Subtle rotation adds significant 3D depth
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]); // Finer control over base scale
  const imageRotate = useTransform(scrollYProgress, [0, 1], [0, 0.7]); // Extremely subtle rotation

  // Text-specific parallax (text scrolls up slightly faster for separation)
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  // Hero section fades out as the user scrolls past
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Premium physics config used across all text elements for cohesive motion
  const springTransition = {
    type: "spring",
    stiffness: 140, // Snap strength
    damping: 20, // Prevents excessive bouncing
    mass: 0.9, // Feels high quality
  };

  // Variants for the main text elements
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // Stagger children for a sequential, cinematic drop-in
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const textItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ...springTransition },
    },
  };

  // Specific variants for the typography split reveal
  const splitHeaderVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger Summer and Collection separately
        delayChildren: 0.4, // Delay reveal after badge
      },
    },
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[85vh] min-h-[700px] flex items-center justify-center md:p-6 lg:p-8 overflow-hidden"
    >
      {/* 1. ANIMATED PARALLAX BACKGROUND */}
      <motion.div 
        className="absolute inset-0 md:inset-6 lg:inset-8 md:rounded-[2rem] overflow-hidden shadow-2xl bg-black origin-center"
        style={{ y: opacity }} 
        // Background container scales subtly in response to button hover
        animate={{
          scale: isExploreHovered ? 1.02 : 1, // very subtle scale reaction
          transition: { type: "spring", stiffness: 120, damping: 20 },
        }}
      >
        <motion.div 
          className="w-full h-full relative" 
          // Link base scale and custom parallax rotate
          style={{ y: imageY, scale: imageScale, rotateZ: imageRotate }} 
        >
          <Image 
            src="/featured.png" 
            alt="Summer Collection" 
            fill 
            className="object-cover object-top opacity-90" 
            priority 
            quality={100}
          />
        </motion.div>
        {/* Advanced Gradient Overlay: Ensures text legibility while keeping image details */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/95 md:via-black/50 md:to-transparent" />
      </motion.div>

      {/* 2. STAGGERED TEXT CONTENT */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ y: textY, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 flex flex-col items-start justify-end md:justify-center h-full pb-20 md:pb-0"
      >
        <div className="max-w-3xl space-y-6">
          
          {/* Badge Reveal */}
          <motion.div variants={textItemVariants}>
            <span className="inline-block py-2 px-5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-[0.2em] uppercase border border-white/20 shadow-sm">
              New Season
            </span>
          </motion.div>
          
          {/* 3. EDITORIAL TYPOGRAPHY MIX: Layered Splitting Reveal */}
          <motion.h1 
            variants={splitHeaderVariants}
            className="flex flex-col text-white leading-[0.9] origin-bottom pb-1"
          >
            {/* Split 1: Summer (Reveals from the bottom) */}
            <div className="overflow-hidden h-fit">
              <motion.span 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { ...springTransition, delay: 0.5 } }}
                className="block text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter uppercase"
              >
                Summer
              </motion.span>
            </div>

            {/* Split 2: Collection (Reveals from the top) */}
            <div className="overflow-hidden h-fit mt-[-5px]"> {/* slight pull up for spacing */}
              <motion.span 
                initial={{ y: "-100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { ...springTransition, delay: 0.6 } }}
                className="block text-5xl md:text-7xl lg:text-[7rem] font-serif italic text-white/90 pl-2 md:pl-4"
              >
                Collection.
              </motion.span>
            </div>
          </motion.h1>
          
          <motion.p variants={textItemVariants} className="text-lg md:text-xl text-gray-300 font-medium max-w-lg leading-relaxed pt-4">
            Elevated essentials and statement pieces designed for the modern wardrobe. Redefine your aesthetic.
          </motion.p>
          
          {/* 4. INTEGRATED BUTTON & INTERACTION */}
          <motion.div variants={textItemVariants} className="pt-8">
            <motion.button 
              // State Management: Links button hover to background reaction
              onMouseEnter={() => setIsExploreHovered(true)}
              onMouseLeave={() => setIsExploreHovered(false)}
              // Premium physics hover and active states
              whileHover={{
                scale: 1.05,
                y: -3,
                transition: { type: "spring", stiffness: 300, damping: 10 }
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center gap-4 bg-white text-black px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all duration-300 hover:bg-gray-100 active:scale-95"
            >
              <span className="relative z-10">Explore Collection</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default AnimatedHero;