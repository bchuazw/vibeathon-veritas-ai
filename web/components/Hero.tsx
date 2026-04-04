"use client";

import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, fadeIn, staggerContainer, staggerItem } from "@/components/motion";

const features = [
  {
    icon: Sparkles,
    title: "3-Agent AI Pipeline",
    description: "Scout → Writer → Editor workflow for quality content",
  },
  {
    icon: Shield,
    title: "Credibility Scored",
    description: "Every article rated for trustworthiness",
  },
  {
    icon: Zap,
    title: "Virlo-Optimized Headlines",
    description: "Viral content optimized for maximum engagement",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden gradient-hero noise-overlay">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full bg-gradient-to-br from-amber-100/40 to-orange-100/20 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-gradient-to-tr from-stone-200/30 to-stone-100/20 blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32 lg:py-40">
        <motion.div 
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          role="banner"
        >
          {/* Badge */}
          <motion.div variants={fadeIn} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm border border-stone-200/50 px-3 sm:px-4 py-1.5 text-sm font-medium text-stone-700 shadow-sm" aria-label="AI-Powered Journalism">
              <Sparkles className="h-4 w-4 text-amber-600" aria-hidden="true" />
              AI-Powered Journalism
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            variants={fadeInUp}
            className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 md:text-5xl lg:text-6xl xl:text-7xl"
          >
            Truth in the Age of{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-stone-700">Information</span>
              <motion.span 
                className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-gradient-to-r from-amber-200/60 to-orange-200/60 -rotate-1"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={fadeInUp}
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl leading-relaxed text-stone-600 max-w-2xl mx-auto px-2 sm:px-0"
          >
            AI-powered news analysis powered by our 3-Agent Pipeline (Scout → Writer → Editor)
            and Virlo-optimized headlines. Veritas AI delivers credible, viral-ready 
            journalism with transparency you can trust.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button 
              size="lg" 
              className="group bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-button hover:shadow-button-hover transition-all duration-300 rounded-full px-8"
              asChild
            >
              <a href="#latest" className="flex items-center gap-2">
                Explore Stories
                <motion.span
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowDown className="h-4 w-4" />
                </motion.span>
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-stone-300 text-stone-700 hover:bg-white/60 hover:border-stone-400 transition-all duration-300 rounded-full px-8"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature cards */}
        <motion.div 
          className="mx-auto mt-12 sm:mt-20 grid max-w-4xl gap-4 sm:gap-6 sm:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.6 }
            }
          }}
          role="list"
          aria-label="Key features"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300"
              role="listitem"
            >
              {/* Icon */}
              <div className="relative" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-br from-stone-100 to-stone-50 border border-stone-200/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-stone-700" aria-hidden="true" />
                </div>
              </div>
              
              <h3 className="mt-4 sm:mt-5 font-serif text-base sm:text-lg font-semibold text-stone-900">
                {feature.title}
              </h3>
              <p className="mt-1 sm:mt-2 text-sm text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-stone-50/80 to-transparent" aria-hidden="true" />
    </section>
  );
}
