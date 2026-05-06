"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for testing the waters.",
    features: [
      "1 AI Influencer",
      "50 AI Photos / mo",
      "Basic Scheduler",
      "Community Support",
    ],
    cta: "Start for Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$79",
    description: "For serious content creators.",
    features: [
      "3 AI Influencers",
      "Unlimited AI Photos",
      "Video Generation",
      "Advanced Auto-Post",
      "Priority Analytics",
    ],
    cta: "Get Started Pro",
    popular: true,
  },
  {
    name: "Agency",
    price: "$199",
    description: "Scale multiple brands at once.",
    features: [
      "Unlimited AI Influencers",
      "API Access",
      "Custom Fine-Tuning",
      "White-label Reports",
      "24/7 Dedicated Support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold font-display mb-4"
          >
            Simple, <span className="text-primary">Transparent</span> Pricing
          </motion.h2>
          <p className="text-slate-400 text-lg">
            Choose the plan that fits your growth ambitions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative glass p-8 rounded-3xl flex flex-col ${
                plan.popular ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/20 rounded-full p-0.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.popular ? "primary" : "outline"} 
                className="w-full h-12 rounded-xl"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
