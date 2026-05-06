"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { ArrowRight, Play, Users } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New: AI Post Scheduler is now live
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6"
            >
              Scale Your Presence with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-glow">
                AI Influencers
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-8"
            >
              Generate consistent AI influencers, create viral content, and schedule 
              posts automatically across all social platforms. The future of content 
              creation is here.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/login">
                <Button className="h-14 px-8 text-base rounded-2xl group">
                  Start Generating Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-8 text-base rounded-2xl">
                <Play className="mr-2 w-5 h-5 fill-current" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex items-center justify-center lg:justify-start gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-800 flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                <span className="text-white font-bold">1,200+</span> creators joined this week
              </p>
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/20">
              <Image 
                src="/hero-ai.png" 
                alt="AI Influencer" 
                width={600} 
                height={600}
                className="w-full h-auto hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              
              {/* Floating Stat Card */}
              <div className="absolute bottom-6 left-6 right-6 glass p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Engagement Rate</p>
                  <p className="text-xl font-bold text-white">12.4%</p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-xs text-slate-400">Monthly Reach</p>
                  <p className="text-xl font-bold text-white">2.5M+</p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="bg-primary/20 p-2 rounded-lg">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 blur-[60px] -z-10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 blur-[60px] -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
