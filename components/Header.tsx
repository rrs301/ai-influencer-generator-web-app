"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/Button";
import { motion } from "framer-motion";
import { Sparkles, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass mx-4 mt-4 rounded-2xl"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold font-display tracking-tight text-white">
          Influencer<span className="text-primary">AI</span>
        </span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          Features
        </Link>
        <Link href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          How it Works
        </Link>
        <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          Pricing
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              <User className="w-4 h-4" />
              Dashboard
            </Link>
            <Button variant="outline" onClick={handleSignOut} className="rounded-xl px-4 py-2 flex items-center gap-2 text-sm">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        ) : (
          <>
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-xl px-6">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </motion.header>
  );
};
