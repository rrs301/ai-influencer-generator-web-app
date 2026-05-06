'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Calendar as CalendarIcon, Save, Loader2, Camera, Globe, Share2, Users, CheckCircle2, AlertCircle } from 'lucide-react'
import { getDraftPostsAction, updatePostAction } from '../../lib/actions/posts'
import Image from 'next/image'
import { format } from 'date-fns'

interface ScheduleDraftDialogProps {
  date: Date
  initialPost?: any
  onClose: () => void
  onSuccess: () => void
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Camera,
  twitter: Globe,
  facebook: Share2,
  linkedin: Users
}

export default function ScheduleDraftDialog({ date, initialPost, onClose, onSuccess }: ScheduleDraftDialogProps) {
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(!initialPost)
  const [scheduling, setScheduling] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<any>(initialPost || null)
  const [selectedDate, setSelectedDate] = useState(initialPost ? initialPost.scheduled_at.split('T')[0] : format(date, 'yyyy-MM-dd'))
  const [time, setTime] = useState(initialPost ? initialPost.scheduled_at.split('T')[1].substring(0, 5) : '12:00')
  const [caption, setCaption] = useState(initialPost ? initialPost.caption : '')
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (initialPost) return
    async function fetchDrafts() {
      const result = await getDraftPostsAction()
      if (result.success) {
        setDrafts(result.posts || [])
      }
      setLoading(false)
    }
    fetchDrafts()
  }, [initialPost])

  const handleSelectDraft = (draft: any) => {
    setSelectedDraft(draft)
    setCaption(draft.caption || '')
    setStatus(null)
  }

  const handleSchedule = async () => {
    if (!selectedDraft) return
    setScheduling(true)
    setStatus(null)

    const scheduledAt = `${selectedDate}T${time}`
    const result = await updatePostAction(selectedDraft.id, {
      status: 'scheduled',
      scheduledAt,
      caption
    })

    if (result.success) {
      setStatus({ type: 'success', message: 'Post scheduled successfully!' })
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to schedule post' })
    }
    setScheduling(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] glass rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {initialPost ? 'Post Details' : 'Schedule Draft'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {initialPost ? 'Modify scheduled post settings' : `Select a draft to post on ${format(date, 'MMMM do, yyyy')}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Draft Selection OR Post Image Preview */}
          <div className="w-full md:w-1/2 border-r border-white/5 flex flex-col overflow-hidden bg-black/20">
            {initialPost ? (
              /* If editing, show the image prominently on the left */
              <div className="flex-1 flex flex-col p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${selectedDraft.platform.toLowerCase() === 'instagram' ? 'from-purple-500 via-pink-500 to-orange-500' : 'from-blue-600 to-blue-400'} shadow-lg`}>
                    {(() => {
                      const Icon = PLATFORM_ICONS[selectedDraft.platform.toLowerCase()] || Camera
                      return <Icon className="w-5 h-5 text-white" />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold capitalize">{selectedDraft.platform} Post</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Model: {selectedDraft.models?.name}</p>
                  </div>
                </div>

                <div className="flex-1 relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                  <Image src={selectedDraft.image_url} alt="Post preview" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium leading-relaxed italic">
                      "{selectedDraft.caption || 'No caption'}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* If creating new, show the draft list */
              <>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Available Drafts</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-slate-400">{drafts.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                    </div>
                  ) : drafts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                        <Camera className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-sm">No drafts found. Create a post first.</p>
                    </div>
                  ) : (
                    drafts.map((draft) => {
                      const Icon = PLATFORM_ICONS[draft.platform.toLowerCase()] || Camera
                      const isSelected = selectedDraft?.id === draft.id
                      return (
                        <button
                          key={draft.id}
                          onClick={() => handleSelectDraft(draft)}
                          className={`w-full p-3 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left group ${isSelected
                            ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(14,165,233,0.1)]'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                            <Image src={draft.image_url} alt="draft" fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-slate-500'}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                {draft.platform}
                              </span>
                            </div>
                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {draft.caption || 'No caption'}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Model: {draft.models?.name || 'Unknown'}
                            </p>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Side: Details & Scheduling */}
          <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
            {selectedDraft ? (
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                {/* Status Message */}
                {status && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300 ${status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{status.message}</p>
                  </div>
                )}

                {/* Post Preview Image - Only show if NOT in initialPost mode (since it's already on the left in that case) */}
                {!initialPost && (
                  <div className="flex justify-center">
                    <div className="relative w-full aspect-square max-h-64 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                      <Image src={selectedDraft.image_url} alt="Post preview" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Selected Post Variant</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Post Description</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Edit your post caption..."
                    rows={6}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Scheduled Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Scheduled Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSchedule}
                    disabled={scheduling || !selectedDraft}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {scheduling ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {initialPost ? 'Update Schedule' : 'Confirm & Schedule Post'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-700">
                  <Clock className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Draft</h3>
                  <p className="text-slate-500 text-sm max-w-[240px] mx-auto">
                    Pick a post from the list on the left to configure its scheduling details.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
