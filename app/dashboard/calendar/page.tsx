'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Camera, 
  Globe, 
  Share2, 
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  Loader2
} from 'lucide-react'
import { getScheduledPostsAction } from '@/lib/actions/posts'
import Link from 'next/link'
import Image from 'next/image'
import ScheduleDraftDialog from '@/components/calendar/ScheduleDraftDialog'

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Camera,
  twitter: Globe,
  facebook: Share2,
  linkedin: Users
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedPost, setSelectedPost] = useState<any>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const month = currentDate.getMonth()
    const year = currentDate.getFullYear()
    const result = await getScheduledPostsAction(month, year)
    if (result.success) {
      setPosts(result.posts || [])
    }
    setLoading(false)
  }, [currentDate])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => {
      if (!post.scheduled_at) return false
      return isSameDay(parseISO(post.scheduled_at), day)
    })
  }

  return (
    <div className="min-h-screen space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Content Calendar
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              Live Schedule
            </div>
          </h1>
          <p className="text-slate-500 mt-2">Manage and visualize your AI influencer's social presence.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-4 min-w-[140px] text-center">
            <span className="text-white font-bold text-lg">{format(currentDate, 'MMMM yyyy')}</span>
          </div>

          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.02]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{day}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 md:auto-rows-[120px] lg:auto-rows-[160px]">
          {calendarDays.map((day, i) => {
            const dayPosts = getPostsForDay(day)
            const isCurrentMonth = isSameMonth(day, monthStart)
            const today = isToday(day)
            
            return (
              <div 
                key={i} 
                className={`relative group border-r border-b border-white/5 p-2 transition-all duration-300 hover:bg-white/[0.02] ${
                  !isCurrentMonth ? 'opacity-20 grayscale bg-black/20' : ''
                } ${today ? 'bg-primary/5' : ''}`}
              >
                {/* Day Number */}
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold ${
                    today ? 'text-primary' : isCurrentMonth ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  
                  {isCurrentMonth && (
                    <button 
                      onClick={() => {
                        setSelectedDate(day)
                        setIsDialogOpen(true)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all transform scale-75 group-hover:scale-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Posts for this day */}
                <div className="space-y-1 overflow-y-auto max-h-[80%] custom-scrollbar">
                  {dayPosts.map((post, idx) => {
                    const Icon = PLATFORM_ICONS[post.platform.toLowerCase()] || Camera
                    return (
                      <div 
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPost(post)
                          setSelectedDate(parseISO(post.scheduled_at))
                          setIsDialogOpen(true)
                        }}
                        className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 group/post hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div className="relative w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={post.image_url} alt="post" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <Icon className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[10px] text-white font-bold truncate">
                              {post.models?.name || 'AI Post'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[8px] text-slate-500">
                            <Clock className="w-2 h-2" />
                            {format(parseISO(post.scheduled_at), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Empty State Overlay */}
                {isCurrentMonth && dayPosts.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats/Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-dark rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scheduled Posts</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-dark rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Instagram Posts</p>
              <p className="text-2xl font-bold text-white">
                {posts.filter(p => p.platform.toLowerCase() === 'instagram').length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-dark rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Queue</p>
              <p className="text-2xl font-bold text-white">
                {posts.length > 0 ? format(parseISO(posts[0].scheduled_at), 'MMM d, h:mm a') : 'Empty'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Draft Dialog */}
      {isDialogOpen && selectedDate && (
        <ScheduleDraftDialog 
          date={selectedDate}
          initialPost={selectedPost}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedPost(null)
          }}
          onSuccess={fetchPosts}
        />
      )}
    </div>
  )
}
