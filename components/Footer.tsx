"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Send, Camera, Globe, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-20 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-1 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-white">
                Influencer<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering creators to scale their presence with hyper-realistic AI influencers and automated social media management.
            </p>
            <div className="flex items-center gap-4">
              <Send className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <Camera className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <Globe className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <ExternalLink className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">AI Generator</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Scheduler</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 text-xs text-slate-500">
          <p>© 2024 InfluencerAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <p>Built with ❤️ for creators</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
