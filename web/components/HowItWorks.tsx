"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const agents = [
  {
    step: "01",
    icon: Search,
    name: "Scout Agent",
    title: "Discover",
    description: "Monitors breaking news 24/7 across thousands of sources. Identifies trending stories with high viral potential using real-time signals.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200/60",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    step: "02",
    icon: PenTool,
    name: "Writer Agent",
    title: "Create",
    description: "Crafts compelling, well-researched articles with proper sourcing. Generates credibility-scored content that balances depth with readability.",
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200/60",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    step: "03",
    icon: Sparkles,
    name: "Editor Agent",
    title: "Optimize",
    description: "Polishes content and optimizes headlines for maximum engagement. Uses Virlo AI to analyze viral potential and suggest improvements.",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200/60",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 md:py-28 bg-white relative overflow-hidden" aria-labelledby="how-it-works-title">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-stone-100/50 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-stone-100/50 to-transparent blur-3xl" />
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
            <Badge className="bg-stone-100 text-stone-700 hover:bg-stone-200 px-4 py-1.5">
              <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              3-Agent AI Pipeline
            </Badge>
          </motion.div>
          <h2 id="how-it-works-title" className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
            How Veritas AI Works
          </h2>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            Our autonomous 3-agent pipeline discovers, writes, and optimizes news articles — 
            delivering credible, viral-ready journalism in seconds.
          </p>
        </motion.div>

        {/* Agent Pipeline */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              {/* Connector arrow (between cards) */}
              {index < agents.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.15, duration: 0.4 }}
                  >
                    <ArrowRight className="h-6 w-6 text-stone-300" />
                  </motion.div>
                </div>
              )}

              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${agent.bgColor} border ${agent.borderColor} shadow-card hover:shadow-card-hover transition-all duration-300`}
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-1 px-3 py-1 bg-white rounded-full shadow-sm border border-stone-200/60">
                  <span className={`text-xs font-bold bg-gradient-to-r ${agent.color} bg-clip-text text-transparent`}>
                    STEP {agent.step}
                  </span>
                </div>

                {/* Icon */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${agent.iconBg} mb-5`}>
                  <agent.icon className={`h-7 w-7 ${agent.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
                  {agent.name}
                </h3>
                <p className={`text-sm font-semibold bg-gradient-to-r ${agent.color} bg-clip-text text-transparent mb-3`}>
                  {agent.title}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {agent.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Virlo Integration Callout */}
        <motion.div
          className="mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-200/40 shadow-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">
                  Powered by Virlo Viral Optimization
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Every article is optimized using <span className="font-semibold text-purple-700">Virlo AI</span> — 
                  analyzing trending topics, optimizing headlines for engagement, and suggesting hashtags 
                  to maximize viral reach. Get content that doesn&apos;t just inform, but spreads.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
