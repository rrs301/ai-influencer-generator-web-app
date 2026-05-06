'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, User } from 'lucide-react'

interface PostPreviewProps {
  platform: string
  format: string
  imageUrls: string[]
  caption: string
}

export default function PostPreview({ platform, format, imageUrls, caption }: PostPreviewProps) {
  const [activeVariant, setActiveVariant] = useState(0)

  // Determine aspect ratio class based on format
  const getAspectClass = () => {
    switch (format) {
      case 'story': return 'aspect-[9/16]'
      case 'landscape': return 'aspect-[16/9]'
      case 'portrait': return 'aspect-[4/5]'
      default: return 'aspect-square'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight">Live Preview</h3>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => {
            const isAvailable = i === 0 || imageUrls.length > i;
            const isActive = activeVariant === i;
            
            return (
              <button
                key={i}
                title={!isAvailable ? "Not Available for Demo" : undefined}
                disabled={!isAvailable}
                onClick={() => isAvailable && setActiveVariant(i)}
                className={`w-8 h-8 rounded-lg text-[10px] font-bold border transition-all ${
                  isActive
                    ? 'bg-primary border-primary text-white shadow-lg'
                    : isAvailable
                    ? 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'
                    : 'bg-white/5 border-white/5 text-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                V{i + 1}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[400px] w-full">
        {/* Mobile Phone Mockup */}
        <div className="relative rounded-[3rem] border-[8px] border-slate-900 bg-black overflow-hidden shadow-2xl ring-1 ring-white/10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />
          
          <div className="h-[700px] overflow-y-auto scrollbar-hide bg-[#050505]">
            {/* Platform Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-md z-10">
              <span className="font-bold text-white text-sm capitalize">{platform}</span>
              <MoreHorizontal className="w-5 h-5 text-white" />
            </div>

            {/* Post Header */}
            <div className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-black">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white">influencer_ai</p>
                <p className="text-[10px] text-slate-500">Sponsored</p>
              </div>
            </div>

            {/* Main Image */}
            <div className={`relative w-full ${getAspectClass()} bg-slate-900/50`}>
              {imageUrls[activeVariant] ? (
                <Image
                  src={imageUrls[activeVariant]}
                  alt="Post Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-3">
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                    <User className="w-6 h-6 opacity-50" />
                  </div>
                  <p className="text-xs font-medium opacity-50">Image will appear here</p>
                </div>
              )}
            </div>

            {/* Interactions */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <Heart className="w-6 h-6 text-white" />
                  <MessageCircle className="w-6 h-6 text-white" />
                  <Send className="w-6 h-6 text-white" />
                </div>
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-bold text-white mb-1">1,245 likes</p>
              <p className="text-xs text-white leading-relaxed">
                <span className="font-bold mr-2">influencer_ai</span>
                {caption}
              </p>
              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tight">2 hours ago</p>
            </div>

            {/* Platform specific elements (e.g. TikTok buttons) */}
            {platform === 'tiktok' && (
              <div className="absolute bottom-20 right-4 flex flex-col gap-5 z-20">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white">124k</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <MessageCircle className="w-6 h-6 text-white fill-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white">1,2k</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Send className="w-6 h-6 text-white fill-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white">842</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}
