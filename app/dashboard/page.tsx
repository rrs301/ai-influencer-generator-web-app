import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import Link from 'next/link'
import { RecentActivity } from '../../components/studio/RecentActivity'
import { Sparkles, Image as ImageIcon, Calendar, Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  const { count: modelCount } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: scheduledCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'scheduled')

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      {/* Welcome Header */}
      <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Welcome back,</h1>
        <p className="text-slate-400 mb-8 relative z-10">
          Logged in as: <span className="text-primary font-medium">{user.email}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Influencers</h3>
            <p className="text-4xl font-bold text-white">{modelCount ?? 0}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/30 transition-colors">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Posts Scheduled</h3>
            <p className="text-4xl font-bold text-white">{scheduledCount ?? 0}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Credits Remaining</h3>
            <p className="text-4xl font-bold text-primary flex items-center gap-2">
               <Sparkles className="w-6 h-6" /> {profile?.credits ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/dashboard/studio/create-model">
              <div className="group flex items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer glass-dark">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Plus className="text-primary w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Create Influencer</h4>
                  <p className="text-xs text-slate-400">Train a new AI model</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/create-post">
              <div className="group flex items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer glass-dark">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="text-purple-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Create Post</h4>
                  <p className="text-xs text-slate-400">Generate content</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/calendar">
              <div className="group flex items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer glass-dark">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Calendar className="text-amber-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">View Calendar</h4>
                  <p className="text-xs text-slate-400">Manage schedules</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
