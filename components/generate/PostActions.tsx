'use client'

import { useState } from 'react'
import { Save, Calendar, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { savePostAction, updatePostAction } from '@/lib/actions/posts'

interface PostActionsProps {
  postId?: string
  modelId: string
  imageUrl: string
  platform: string | string[]
  caption: string
  initialStatus?: 'draft' | 'scheduled' | 'published'
  initialScheduledAt?: string | null
  isPlatformConnected?: boolean
  onSuccess?: () => void
}

export default function PostActions({ postId, modelId, imageUrl, platform, caption, initialStatus, initialScheduledAt, isPlatformConnected, onSuccess }: PostActionsProps) {
  const platformsArray = Array.isArray(platform) ? platform : [platform]
  const [loading, setLoading] = useState<'draft' | 'schedule' | null>(null)
  const [isScheduled, setIsScheduled] = useState(initialStatus === 'scheduled')
  const [date, setDate] = useState(initialScheduledAt ? initialScheduledAt.split('T')[0] : '')
  const [time, setTime] = useState(initialScheduledAt ? initialScheduledAt.split('T')[1]?.substring(0, 5) : '')
  const [publishNow, setPublishNow] = useState(initialStatus !== 'scheduled')
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleSaveDraft = async () => {
    if (!imageUrl) return
    setLoading('draft')
    setStatus(null)
    
    let result;
    if (postId) {
      result = await updatePostAction(postId, {
        status: 'draft',
        scheduledAt: null
      })
    } else {
      result = await savePostAction({
        modelId,
        imageUrl,
        platform: platformsArray,
        caption,
        status: 'draft'
      })
    }

    if (result.success) {
      setStatus({ type: 'success', message: `Post saved as draft for ${platformsArray.length} platform(s)!` })
      onSuccess?.()
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to save draft' })
    }
    setLoading(null)
  }

  const handleSchedule = async () => {
    if (!imageUrl || !isPlatformConnected) return
    setLoading('schedule')
    setStatus(null)

    let result;
    if (postId) {
      result = await updatePostAction(postId, {
        status: publishNow ? 'published' : 'scheduled',
        scheduledAt: !publishNow ? `${date}T${time}` : null
      })
    } else {
      result = await savePostAction({
        modelId,
        imageUrl,
        platform: platformsArray,
        caption,
        status: publishNow ? 'published' : 'scheduled',
        scheduledAt: !publishNow ? `${date}T${time}` : undefined
      })
    }

    if (result.success) {
      setStatus({ 
        type: 'success', 
        message: publishNow ? `Post published to ${platformsArray.length} platform(s)!` : `Post scheduled for ${platformsArray.length} platform(s)` 
      })
      onSuccess?.()
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to schedule post' })
    }
    setLoading(null)
  }

  if (!imageUrl) return null

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Post Actions
          </h3>
          <button
            onClick={handleSaveDraft}
            disabled={!!loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            {loading === 'draft' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
        </div>

        {status && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          {!isPlatformConnected ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-xs font-bold uppercase tracking-wider">Connections Required</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                One or more of your selected platforms (<span className="text-white font-medium capitalize">{platformsArray.join(', ')}</span>) are not connected. 
                Please connect all selected accounts to schedule this post.
              </p>
              <button 
                onClick={() => window.location.href = '/dashboard/accounts'}
                className="w-full py-2 rounded-xl bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/30 transition-all"
              >
                Go to Accounts
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsScheduled(!isScheduled)}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 border ${
                  isScheduled 
                    ? 'bg-primary border-primary text-white shadow-lg' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-primary/30'
                }`}
              >
                <Calendar className="w-5 h-5" />
                {isScheduled ? 'Scheduling Post...' : `Schedule to ${platformsArray.length} Platforms`}
              </button>

              {isScheduled && (
                <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between p-1 bg-white/5 rounded-xl border border-white/10">
                    <button
                      onClick={() => setPublishNow(true)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${publishNow ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
                    >
                      Publish Now
                    </button>
                    <button
                      onClick={() => setPublishNow(false)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!publishNow ? 'bg-primary text-white shadow-md' : 'text-slate-500'}`}
                    >
                      Schedule Later
                    </button>
                  </div>

                  {!publishNow && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSchedule}
                    disabled={loading === 'schedule' || (!publishNow && (!date || !time))}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading === 'schedule' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {publishNow ? `Publish to ${platformsArray.length} Platforms` : 'Confirm Schedule'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
