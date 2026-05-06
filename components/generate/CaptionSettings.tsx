'use client'

import { useState } from 'react'
import { Type, Link as LinkIcon, Languages, Hash, Smile, RefreshCw, Loader2 } from 'lucide-react'
import { generateCaptionAction } from '@/lib/actions/posts'

const tones = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Urgent']
const ctas = ['Link in Bio', 'Shop Now', 'Tag a Friend', 'Comment Below', 'Sign Up']
const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Hindi']
const densities = ['Low', 'Medium', 'High']

export default function CaptionSettings({ onChange, briefData }: { onChange: (data: any) => void, briefData?: any }) {
  const [formData, setFormData] = useState({
    tone: 'Casual',
    cta: 'Link in Bio',
    language: 'English',
    hashtags: 15,
    emojiDensity: 'Medium',
    caption: '✨ Ready for a change? Our latest Glow Skin Serum is finally here to transform your routine! 💖 Check it out now. #skincare #beauty #glow'
  })

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
  }

  const [isGenerating, setIsGenerating] = useState(false)

  const handleRegenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await generateCaptionAction({
        tone: formData.tone,
        cta: formData.cta,
        language: formData.language,
        hashtags: formData.hashtags,
        emojiDensity: formData.emojiDensity,
        briefData
      })
      if (response.success && response.caption) {
        handleChange('caption', response.caption)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Caption & Copy</label>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Copywriting</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
          <Type className="w-3 h-3 text-primary" />
          Brand Tone
        </div>
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => (
            <button
              key={tone}
              onClick={() => handleChange('tone', tone)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                formData.tone === tone
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
            <LinkIcon className="w-3 h-3 text-primary" />
            Primary CTA
          </div>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
            value={formData.cta}
            onChange={(e) => handleChange('cta', e.target.value)}
          >
            {ctas.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
            <Languages className="w-3 h-3 text-primary" />
            Language
          </div>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
            value={formData.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            {languages.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between ml-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500">
            <Hash className="w-3 h-3 text-primary" />
            Hashtag Count
          </div>
          <span className="text-xs font-bold text-primary">{formData.hashtags}</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          value={formData.hashtags}
          onChange={(e) => handleChange('hashtags', parseInt(e.target.value))}
          className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
          <Smile className="w-3 h-3 text-primary" />
          Emoji Density
        </div>
        <div className="flex flex-wrap gap-2">
          {densities.map((d) => (
            <button
              key={d}
              onClick={() => handleChange('emojiDensity', d)}
              className={`flex-1 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border ${
                formData.emojiDensity === d
                  ? 'bg-primary/10 border-primary text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Auto-Generated Caption</p>
          <button 
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="text-[10px] font-bold text-primary flex items-center gap-1 hover:text-accent transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </button>
        </div>
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-300 italic">
          {formData.caption}
        </div>
      </div>
    </div>
  )
}
