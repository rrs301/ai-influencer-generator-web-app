'use client'

import { useState } from 'react'
import { Target, Flag, MessageSquare } from 'lucide-react'

const goals = ['Awareness', 'Engagement', 'Launch', 'Conversion', 'Giveaway']

export default function ContentBriefForm({ onChange }: { onChange: (data: any) => void }) {
  const [formData, setFormData] = useState({
    campaignName: '',
    product: '',
    goal: 'Engagement',
    brief: ''
  })

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Content Brief</label>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Campaign Details</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Campaign Name</p>
          <input
            type="text"
            placeholder="Summer Vibe 2024"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            onChange={(e) => handleChange('campaignName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Product / Brand</p>
          <input
            type="text"
            placeholder="Glow Skin Serum"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            onChange={(e) => handleChange('product', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
          <Target className="w-3 h-3 text-primary" />
          Post Goal
        </div>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => handleChange('goal', goal)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                formData.goal === goal
                  ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">
          <MessageSquare className="w-3 h-3 text-primary" />
          Detailed Brief
        </div>
        <textarea
          rows={3}
          placeholder="Describe the mood, messaging, and any specific details for this post..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none"
          onChange={(e) => handleChange('brief', e.target.value)}
        />
      </div>
    </div>
  )
}
