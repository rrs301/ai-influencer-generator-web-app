"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Calendar, 
  BarChart3, 
  Users2, 
  ShieldCheck, 
  Cpu 
} from "lucide-react";

const features = [
  {
    title: "AI Face Consistency",
    description: "Generate influencers with identical facial features across every single post and video.",
    icon: Users2,
    color: "bg-blue-500",
  },
  {
    title: "Auto-Post Scheduler",
    description: "Connect your socials and let our AI handle the posting at peak engagement times.",
    icon: Calendar,
    color: "bg-purple-500",
  },
  {
    title: "Smart Analytics",
    description: "Track performance, growth, and engagement with deep AI-driven insights.",
    icon: BarChart3,
    color: "bg-emerald-500",
  },
  {
    title: "Instant Content",
    description: "Turn a single prompt into weeks of high-quality viral content in seconds.",
    icon: Zap,
    color: "bg-amber-500",
  },
  {
    title: "Advanced AI Core",
    description: "Powered by the latest LLMs and Diffusion models for hyper-realistic results.",
    icon: Cpu,
    color: "bg-rose-500",
  },
  {
    title: "Secure & Private",
    description: "Your data and generated characters are yours. We prioritize security.",
    icon: ShieldCheck,
    color: "bg-indigo-500",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-slate-950/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold font-display mb-4"
          >
            Everything you need to <span className="text-primary">Dominate</span> Social Media
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            Our all-in-one platform handles everything from character creation to audience growth.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass p-8 rounded-3xl hover:bg-white/10 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.color}/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 text-white`} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
