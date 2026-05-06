'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  ArrowLeft, 
  Zap, 
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Edit3,
  Save,
  Check
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { VisualSelector } from '@/components/studio/VisualSelector'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { generateModelImagesAction, saveModelAction } from '@/lib/actions/luma'

const GENDER_OPTIONS = [
  { id: 'female', label: 'Female', icon: '👩' },
  { id: 'male', label: 'Male', icon: '👨' },
]

const BODY_TYPE_OPTIONS = [
  { id: 'slim', label: 'Slim', icon: '🏃‍♀️' },
  { id: 'athletic', label: 'Athletic', icon: '🏋️‍♀️' },
  { id: 'curvy', label: 'Curvy', icon: '💃' },
  { id: 'plus', label: 'Plus Size', icon: '👗' },
]

const SKIN_TONE_OPTIONS = [
  { id: 'fair', label: 'Fair', color: '#FCE1D4' },
  { id: 'tan', label: 'Tan', color: '#D2B48C' },
  { id: 'olive', label: 'Olive', color: '#808000' },
  { id: 'brown', label: 'Brown', color: '#5C4033' },
  { id: 'deep', label: 'Deep', color: '#2B1B17' },
]

const AGE_RANGE_OPTIONS = [
  { id: 'gen-z', label: '18-24', icon: '🤳' },
  { id: 'millennial', label: '25-34', icon: '💼' },
  { id: 'mature', label: '35-45', icon: '🍷' },
]

const VIBE_OPTIONS = [
  { id: 'minimalist', label: 'Minimal', icon: '⚪' },
  { id: 'cyberpunk', label: 'Cyber', icon: '🧬' },
  { id: 'retro', label: 'Retro', icon: '📻' },
  { id: 'streetwear', label: 'Street', icon: '👟' },
  { id: 'luxury', label: 'Luxury', icon: '💎' },
  { id: 'e-girl', label: 'E-Girl', icon: '🎮' },
]

const HAIR_STYLES = [
  { id: 'long-straight', label: 'Long Straight' },
  { id: 'curly-bob', label: 'Curly Bob' },
  { id: 'undercut', label: 'Undercut' },
  { id: 'braids', label: 'Braids' },
  { id: 'messy-bun', label: 'Messy Bun' },
]

export default function CreateModelPage() {
  const router = useRouter()
  const supabase = createClient()
  const [generating, setGenerating] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [isPromptEdited, setIsPromptEdited] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female',
    bodyType: 'slim',
    skinTone: 'fair',
    ageRange: 'gen-z',
    hairStyle: 'long-straight',
    vibe: 'minimalist',
  })

  const [prompt, setPrompt] = useState('')
  const [previewImages, setPreviewImages] = useState<{ portrait: string, fullBody: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    async function fetchCredits() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single()
        setCredits(profile?.credits ?? 0)
      }
    }
    fetchCredits()
  }, [])

  // Build prompt dynamically only if not manually edited
  useEffect(() => {
    if (!isPromptEdited) {
      const genderTerm = formData.gender === 'female' ? 'woman' : 'man'
      const generatedPrompt = `A stunning ${formData.ageRange.replace('-', ' ')} ${formData.bodyType} ${formData.skinTone} skinned ${genderTerm} with ${formData.hairStyle.replace('-', ' ')} hair. Character has a ${formData.vibe} aesthetic. High fashion photography, 8k resolution, cinematic lighting, ultra detailed.`
      setPrompt(generatedPrompt)
    }
  }, [formData, isPromptEdited])

  const handleGenerate = async () => {
    if (!formData.name) {
      alert('Please enter a name for your influencer.')
      return
    }

    if (credits !== null && credits < 50) {
      alert('Not enough credits. Each generation costs 50 credits.')
      return
    }

    setGenerating(true)
    setIsSaved(false)
    
    try {
      // Call server action to generate images
      const result = await generateModelImagesAction(prompt)

      if (!result.success) {
        alert(result.error || 'Failed to generate influencer images.')
        setGenerating(false)
        return
      }

      setPreviewImages({
        portrait: result.portrait!,
        fullBody: result.fullBody!
      })

      if (result.creditsRemaining !== undefined) {
        setCredits(result.creditsRemaining)
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      alert('An unexpected error occurred during generation.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!previewImages || isSaved) return
    
    setIsSaving(true)
    try {
      const result = await saveModelAction(formData, prompt, previewImages.portrait, previewImages.fullBody)
      
      if (result.success) {
        setIsSaved(true)
        // Optional: Redirect to studio after save
        // router.push('/dashboard/studio')
      } else {
        alert(result.error || 'Failed to save model.')
      }
    } catch (error: any) {
      console.error('Save error:', error)
      alert('An unexpected error occurred while saving.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/studio" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          Studio
        </Link>
        
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg glass">
          <Zap className="text-primary w-3.5 h-3.5 fill-primary/20" />
          <span className="text-xs font-bold text-white">{credits ?? '...'} Credits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Side */}
        <div className="lg:col-span-7 space-y-6 pb-12">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create AI Model</h1>
            <p className="text-xs text-slate-500 mt-1">Design your unique digital influencer personality.</p>
          </div>

          <div className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glass-dark">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Influencer Name</label>
              <input 
                type="text"
                placeholder="e.g. Maya Rivers"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <VisualSelector 
                label="Gender" 
                options={GENDER_OPTIONS} 
                value={formData.gender} 
                onChange={(v) => setFormData({...formData, gender: v})} 
              />
              <VisualSelector 
                label="Body Type" 
                options={BODY_TYPE_OPTIONS} 
                value={formData.bodyType} 
                onChange={(v) => setFormData({...formData, bodyType: v})} 
              />
            </div>

            <VisualSelector 
              label="Skin Tone" 
              options={SKIN_TONE_OPTIONS} 
              value={formData.skinTone} 
              onChange={(v) => setFormData({...formData, skinTone: v})} 
              gridCols={5}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <VisualSelector 
                label="Age Range" 
                options={AGE_RANGE_OPTIONS} 
                value={formData.ageRange} 
                onChange={(v) => setFormData({...formData, ageRange: v})} 
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hair Style</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                  value={formData.hairStyle}
                  onChange={(e) => setFormData({...formData, hairStyle: e.target.value})}
                >
                  {HAIR_STYLES.map(style => (
                    <option key={style.id} value={style.id} className="bg-slate-900">{style.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <VisualSelector 
              label="Vibe / Aesthetic" 
              options={VIBE_OPTIONS} 
              value={formData.vibe} 
              onChange={(v) => setFormData({...formData, vibe: v})} 
              gridCols={3}
            />

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prompt Builder</label>
                <button 
                  onClick={() => {
                    setIsPromptEdited(false)
                    const genderTerm = formData.gender === 'female' ? 'woman' : 'man'
                    setPrompt(`A stunning ${formData.ageRange.replace('-', ' ')} ${formData.bodyType} ${formData.skinTone} skinned ${genderTerm} with ${formData.hairStyle.replace('-', ' ')} hair. Character has a ${formData.vibe} aesthetic. High fashion photography, 8k resolution, cinematic lighting, ultra detailed.`)
                  }}
                  className="flex items-center gap-1 text-[9px] text-primary font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Reset to Auto
                </button>
              </div>
              <div className="relative group">
                <textarea 
                  className="w-full h-24 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-xs text-slate-300 leading-relaxed resize-none focus:outline-none focus:border-primary/30 transition-all"
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value)
                    setIsPromptEdited(true)
                  }}
                />
                <div className="absolute top-3 right-3 opacity-30 group-hover:opacity-60 transition-opacity">
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            <Button 
              className="w-full py-6 text-sm font-bold rounded-xl group relative overflow-hidden h-auto"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate Influencer (50 Credits)
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Preview Side */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="text-primary w-4 h-4" />
                Preview
              </h3>
              {previewImages && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleGenerate}
                    disabled={generating || isSaving}
                    className="text-[10px] text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
              )}
            </div>

            {previewImages && !generating && (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || isSaved}
                  className={cn(
                    "w-full py-4 text-xs font-bold rounded-xl border transition-all duration-300 h-auto",
                    isSaved 
                      ? "bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500/20" 
                      : "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
                  )}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving to Studio...
                    </div>
                  ) : isSaved ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      Saved Successfully
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-3.5 h-3.5" />
                      Save AI Model to Studio
                    </div>
                  )}
                </Button>
                {isSaved && (
                  <p className="text-[9px] text-green-500/70 text-center mt-2 animate-pulse">
                    Your model is now available in the Studio gallery.
                  </p>
                )}
              </div>
            )}

            {!previewImages && !generating ? (
              <div className="aspect-[4/5] bg-white/5 border border-white/10 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
                  <ImageIcon className="text-slate-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Ready to Visualize</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Configure your options and click generate to see the results.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Portrait Preview */}
                <div className="relative group">
                  <div className={cn(
                    "aspect-square rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl",
                    generating && "animate-pulse"
                  )}>
                    {generating ? (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">Drafting Face...</p>
                      </div>
                    ) : (
                      <img 
                        src={previewImages?.portrait} 
                        alt="Portrait Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Portrait</span>
                  </div>
                </div>

                {/* Full Body Preview */}
                <div className="relative group">
                  <div className={cn(
                    "aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl",
                    generating && "animate-pulse"
                  )}>
                    {generating ? (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">Creating Full Body...</p>
                      </div>
                    ) : (
                      <img 
                        src={previewImages?.fullBody} 
                        alt="Full Body Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest">Full Body</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
