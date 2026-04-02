"use client";

import { motion } from "framer-motion";
import { Users, PenTool, Newspaper, Building2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const targetMarkets = [
  {
    icon: Newspaper,
    title: "News Readers",
    description: "Seeking credible, in-depth reporting without clickbait or bias",
  },
  {
    icon: PenTool,
    title: "Content Creators",
    description: "Looking for research assistance and fact-checked source material",
  },
  {
    icon: Users,
    title: "Journalists",
    description: "Augmenting their workflow with AI-powered research and analysis",
  },
  {
    icon: Building2,
    title: "Publishers",
    description: "Looking to scale content production while maintaining quality",
  },
];

export function TargetMarket() {
  return (
    <section className="py-20 md:py-28 bg-stone-50 relative overflow-hidden" aria-labelledby="target-market-title">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-stone-100/50 to-transparent blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-l from-stone-100/50 to-transparent blur-3xl -translate-y-1/2" />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Badge className="bg-stone-900 text-stone-50 hover:bg-stone-800 px-4 py-1.5">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Who It&apos;s For
            </Badge>
          </motion.div>
          <h2 id="target-market-title" className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
            Built for Modern News Consumers
          </h2>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            Veritas AI serves everyone who values credible, transparent journalism — 
            from individual readers to enterprise newsrooms.
          </p>
        </motion.div>

        {/* Target Market Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {targetMarkets.map((market, index) => (
            <motion.div
              key={market.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative p-6 rounded-2xl bg-white border border-stone-200/60 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 mb-4 group-hover:bg-stone-900 group-hover:text-white transition-colors duration-300">
                <market.icon className="h-6 w-6 text-stone-700 group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">
                {market.title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {market.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
