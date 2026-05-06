import { createClient } from '../../../lib/supabase/server'
import Link from 'next/link'
import { Plus, Sparkles, Image as ImageIcon, History, Zap, ArrowRight } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ModelCard } from '../../../components/studio/ModelCard'
import { RecentActivity } from '../../../components/studio/RecentActivity'

export default async function StudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user?.id)
    .single()

  const { data: models } = await supabase
    .from('models')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Studio</h1>
          <p className="text-xs text-slate-500 mt-1">Manage models and generate viral content.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl glass">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="text-primary w-4 h-4 fill-primary/20" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Credits</p>
            <p className="text-lg font-bold text-white">{profile?.credits ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add New Model Card */}
        <Link href="/dashboard/studio/create-model" className="group">
          <div className="relative h-full p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden glass-dark">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                <Plus className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1.5">Create New Model</h2>
              <p className="text-xs text-slate-400 mb-6 flex-1">Design a custom AI influencer with unique traits and personality.</p>
              <div className="flex items-center text-primary text-sm font-bold gap-2 group-hover:translate-x-2 transition-transform">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>

        {/* Create New Post Card */}
        <Link href="/dashboard/create-post" className="group">
          <div className="relative h-full p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden glass-dark">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <ImageIcon className="w-24 h-24 text-purple-500" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                <ImageIcon className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1.5">Create New Post</h2>
              <p className="text-xs text-slate-400 mb-6 flex-1">Generate high-quality social media posts using your AI models.</p>
              <div className="flex items-center text-purple-500 text-sm font-bold gap-2 group-hover:translate-x-2 transition-transform">
                Coming Soon <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary w-4 h-4" />
              <h3 className="text-lg font-bold text-white">My Models</h3>
            </div>
            <Link href="/dashboard/studio/models" className="text-[10px] text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-bold">View All</Link>
          </div>

          {models && models.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {models.map((model) => (
                <ModelCard key={model.id} model={model as any} />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-3 glass-dark">
              <div className="w-14 h-14 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                <Sparkles className="text-slate-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">No models created yet</p>
                <p className="text-[10px] text-slate-500 mt-1">Start by creating your first AI influencer model.</p>
              </div>
              <Link href="/dashboard/studio/create-model">
                <Button variant="outline" className="mt-1 h-auto py-2 text-xs rounded-lg px-4">Create First Model</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  )
}
