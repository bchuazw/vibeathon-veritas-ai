"use client";

import { motion } from "framer-motion";
import { Sparkles, Building2, User, Check, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Beta",
    icon: Sparkles,
    price: "Free",
    period: "during beta",
    description: "Experience AI-powered journalism at no cost",
    features: [
      "3 articles per hour",
      "Credibility scoring",
      "Virlo headline optimization",
      "Basic analytics",
    ],
    cta: "Start Free",
    highlighted: true,
    badge: "Current",
  },
  {
    name: "Pro Reader",
    icon: User,
    price: "$9",
    period: "/month",
    description: "For serious news enthusiasts",
    features: [
      "Everything in Beta",
      "Ad-free experience",
      "Priority generation queue",
      "Custom topic alerts",
      "Export to PDF/EPUB",
    ],
    cta: "Coming Soon",
    highlighted: false,
    badge: null,
  },
  {
    name: "Newsroom",
    icon: Building2,
    price: "Custom",
    period: "B2B SaaS",
    description: "Enterprise licensing for publishers",
    features: [
      "API access & webhooks",
      "White-label options",
      "Team collaboration",
      "Custom AI training",
      "Dedicated support",
      "SLA guarantees",
    ],
    cta: "Contact Sales",
    highlighted: false,
    badge: null,
  },
];

export function BusinessModel() {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden" aria-labelledby="pricing-title">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-50/50 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-stone-50/50 to-transparent blur-3xl" />
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
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 px-4 py-1.5">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Pricing
            </Badge>
          </motion.div>
          <h2 id="pricing-title" className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
            Free during beta. Scale with your needs — from individual readers to enterprise newsrooms.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-stone-900 text-white border-stone-900 shadow-xl scale-105 z-10"
                  : "bg-white border-stone-200/60 shadow-card hover:shadow-card-hover"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-3 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Icon & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  plan.highlighted ? "bg-stone-800" : "bg-stone-100"
                }`}>
                  <plan.icon className={`h-5 w-5 ${plan.highlighted ? "text-amber-400" : "text-stone-700"}`} />
                </div>
                <h3 className={`font-serif text-xl font-bold ${plan.highlighted ? "text-white" : "text-stone-900"}`}>
                  {plan.name}
                </h3>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-stone-900"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? "text-stone-400" : "text-stone-500"}`}>
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-stone-300" : "text-stone-600"}`}>
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? "text-amber-400" : "text-green-600"
                    }`} />
                    <span className={`text-sm ${plan.highlighted ? "text-stone-300" : "text-stone-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-white text-stone-900 hover:bg-stone-100"
                    : "bg-stone-900 text-white hover:bg-stone-800"
                }`}
                disabled={!plan.highlighted}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* B2B Note */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <p className="text-sm text-stone-500">
            Interested in B2B SaaS licensing for your newsroom?{" "}
            <a href="#" className="text-stone-900 font-medium underline underline-offset-2 hover:text-amber-600 transition-colors">
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
