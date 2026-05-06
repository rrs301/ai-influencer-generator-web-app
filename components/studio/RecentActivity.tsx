'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { History, Calendar, Clock, ChevronRight, ChevronLeft, MoreHorizontal, ExternalLink, Edit3, Trash2, CheckCircle2, AlertCircle, Loader2, Sparkles, Send } from 'lucide-react'
import { format } from 'date-fns'
import { getRecentPostsAction, updatePostAction } from '@/lib/actions/posts'
import { Button } from '../ui/Button'
import PostActions from '../generate/PostActions'

export function RecentActivity() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchPosts = async () => {
    setLoading(true)
    const result = await getRecentPostsAction(page, 8)
    if (result.success) {
      setPosts(result.posts)
      setTotalCount(result.totalCount)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [page])

  const handleUpdateStatus = async (postId: string, status: 'draft' | 'scheduled') => {
    setIsUpdating(true)
    const result = await updatePostAction(postId, { status, scheduledAt: status === 'draft' ? null : undefined })
    if (result.success) {
      fetchPosts()
      setSelectedPost(null)
    }
    setIsUpdating(false)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 glass-dark">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 text-sm">Loading recent activity...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="text-slate-400 w-4 h-4" />
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        </div>
        {totalCount > 8 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 8 >= totalCount}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden glass-dark">
        {posts.length > 0 ? (
          <div className="divide-y divide-white/5">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                  <Image
                    src={post.image_url}
                    alt={post.caption || 'Post'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${post.status === 'scheduled'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : post.status === 'published'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                      }`}>
                      {post.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium capitalize">
                      {post.platform} • {post.models?.name || 'Custom'}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">
                    {post.caption || 'No caption'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {post.status === 'scheduled' && post.scheduled_at
                      ? `Scheduled for ${format(new Date(post.scheduled_at), 'MMM d, h:mm a')}`
                      : `Created ${format(new Date(post.created_at), 'MMM d, h:mm a')}`
                    }
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">No recent activity</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Image Preview */}
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-black">
                <Image
                  src={selectedPost.image_url}
                  alt="Post Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border backdrop-blur-md ${selectedPost.status === 'scheduled'
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : selectedPost.status === 'published'
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-black/40 border-white/10 text-white'
                    }`}>
                    {selectedPost.status}
                  </span>
                </div>
              </div>

              {/* Details & Actions */}
              <div className="flex-1 p-8 flex flex-col min-w-0 overflow-y-auto scrollbar-hide">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Post Details</h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Platform & Model</label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-medium capitalize">
                        {selectedPost.platform}
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
                        {selectedPost.models?.name || 'Custom'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Caption</label>
                    <p className="text-sm text-slate-300 leading-relaxed bg-white/5 border border-white/10 rounded-2xl p-4">
                      {selectedPost.caption || 'No caption provided.'}
                    </p>
                  </div>

                  {selectedPost.status === 'scheduled' && selectedPost.scheduled_at && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center gap-3 text-amber-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Scheduled For</span>
                      </div>
                      <p className="text-lg font-bold text-white ml-7">
                        {format(new Date(selectedPost.scheduled_at), 'EEEE, MMM do')}
                      </p>
                      <p className="text-sm text-slate-400 ml-7">
                        at {format(new Date(selectedPost.scheduled_at), 'h:mm a')}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    {selectedPost.status === 'draft' ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-4">
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Draft Post</p>
                          <p className="text-xs text-slate-400">This post is currently in drafts. You can schedule it to go live on your selected platforms.</p>
                        </div>

                        <PostActions
                          postId={selectedPost.id}
                          modelId={selectedPost.model_id}
                          imageUrl={selectedPost.image_url}
                          platform={selectedPost.platform}
                          caption={selectedPost.caption}
                          initialStatus={selectedPost.status}
                          onSuccess={() => {
                            fetchPosts()
                            setSelectedPost(null)
                          }}
                        />
                      </div>
                    ) : selectedPost.status === 'scheduled' ? (
                      <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                          <PostActions
                            postId={selectedPost.id}
                            modelId={selectedPost.model_id}
                            imageUrl={selectedPost.image_url}
                            platform={selectedPost.platform}
                            caption={selectedPost.caption}
                            initialStatus={selectedPost.status}
                            initialScheduledAt={selectedPost.scheduled_at}
                            onSuccess={() => {
                              fetchPosts()
                              setSelectedPost(null)
                            }}
                          />

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                              <span className="bg-[#0a0a0a] px-2 text-slate-600">or</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full justify-center gap-2 border-white/10 hover:bg-white/5 h-12 rounded-2xl"
                            onClick={() => handleUpdateStatus(selectedPost.id, 'draft')}
                            disabled={isUpdating}
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                            Move to Drafts
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center px-4">
                          Moving to drafts will cancel the scheduled publication.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Published</p>
                        <p className="text-xs text-slate-400">This post has already been published to {selectedPost.platform}.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
