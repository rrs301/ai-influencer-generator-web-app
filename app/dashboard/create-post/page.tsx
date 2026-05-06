'use client'

import { useState, useCallback, useEffect } from 'react'
import ModelPicker from '@/components/generate/ModelPicker'
import PlatformTabs from '@/components/generate/PlatformTabs'
import PostFormatSelector from '@/components/generate/PostFormatSelector'
import ContentBriefForm from '@/components/generate/ContentBriefForm'
import VisualDirectionForm from '@/components/generate/VisualDirectionForm'
import CaptionSettings from '@/components/generate/CaptionSettings'
import PostPreview from '@/components/generate/PostPreview'
import PostActions from '@/components/generate/PostActions'
import { generatePostAction } from '@/lib/actions/posts'
import { getConnectedAccountsAction } from '@/lib/actions/social-accounts'
import { Sparkles, Upload, X, Send, Wand2, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'

function PostGeneratorContent() {
  const searchParams = useSearchParams()
  const initialDate = searchParams.get('date') || ''
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    modelId: '',
    platform: ['instagram'],
    format: 'single',
    briefData: {},
    visualData: {},
    captionData: {},
    referenceImages: [] as string[],
    prompt: '',
  })

  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([])
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const fetchConnectedAccounts = useCallback(async () => {
    const accounts = await getConnectedAccountsAction()
    setConnectedAccounts(accounts)
  }, [])

  useEffect(() => {
    fetchConnectedAccounts()
  }, [fetchConnectedAccounts])

  const isPlatformConnected = formData.platform.every(p => 
    connectedAccounts.some(acc => acc.platform.toLowerCase() === p.toLowerCase())
  )

  const handleModelSelect = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, modelId: id }))
  }, [])

  const handlePlatformSelect = useCallback((ids: string | string[]) => {
    const newPlatforms = Array.isArray(ids) ? ids : [ids]
    setFormData(prev => ({ ...prev, platform: newPlatforms }))
  }, [])

  const handleFormatSelect = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, format: id }))
  }, [])

  const handleBriefChange = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, briefData: data }))
  }, [])

  const handleVisualChange = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, visualData: data }))
  }, [])

  const handleCaptionChange = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, captionData: data }))
  }, [])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generatePostAction({
        ...formData,
        prompt: formData.prompt || 'Influencer posing in studio, high fashion'
      })
      if (result.success) {
        setGeneratedImages(result.variants || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && formData.referenceImages.length < 3) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev, 
          referenceImages: [...prev.referenceImages, event.target?.result as string].slice(0, 3)
        }))
      }
      reader.readAsDataURL(files[0])
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Post Generator
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              AI Engine Active
            </div>
          </h1>
          <p className="text-slate-500 mt-2">Create viral social media content with AI influencers in seconds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column - Form */}
        <div className="lg:col-span-7 space-y-10">
          <section className="glass rounded-3xl p-8 space-y-8 shadow-xl">
            <ModelPicker onSelect={handleModelSelect} />
            <hr className="border-white/5" />
            <PlatformTabs onSelect={handlePlatformSelect} connectedAccounts={connectedAccounts} />
            <hr className="border-white/5" />
            <PostFormatSelector onSelect={handleFormatSelect} />
          </section>

          <section className="glass rounded-3xl p-8 space-y-8 shadow-xl">
            <ContentBriefForm onChange={handleBriefChange} />
          </section>

          <section className="glass rounded-3xl p-8 space-y-8 shadow-xl">
            <VisualDirectionForm onChange={handleVisualChange} />
          </section>

          <section className="glass rounded-3xl p-8 space-y-8 shadow-xl">
            <CaptionSettings onChange={handleCaptionChange} briefData={formData.briefData} />
          </section>

          <section className="glass rounded-3xl p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Reference Images
              </label>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Max 3 Images</span>
            </div>

            <div className="flex gap-4">
              {formData.referenceImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group">
                  <Image src={img} alt="ref" fill className="object-cover" />
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, referenceImages: prev.referenceImages.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {formData.referenceImages.length < 3 && (
                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group">
                  <Upload className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] text-slate-600 mt-2">Upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">AI Prompt Instruction (Editable)</p>
              <div className="relative">
                <textarea
                  rows={4}
                  value={formData.prompt}
                  onChange={(e) => setFormData(p => ({ ...p, prompt: e.target.value }))}
                  placeholder="The AI will use your brief above, but you can override or add specific details here..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none shadow-inner"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                   <div className="text-[10px] text-slate-500 font-medium">Prompt refined by Gemini</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_50px_rgba(14,165,233,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Wand2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Generate Post
                </>
              )}
            </button>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6 sticky top-10 self-start">
          <PostPreview 
            platform={formData.platform[0] || 'instagram'}
            format={formData.format}
            imageUrls={generatedImages}
            caption={(formData.captionData as any)?.caption || ''}
          />
          {generatedImages.length > 0 && (
            <PostActions 
              modelId={formData.modelId}
              imageUrl={generatedImages[0]} // Using first variant by default
              platform={formData.platform}
              caption={(formData.captionData as any)?.caption || ''}
              isPlatformConnected={isPlatformConnected}
              initialStatus={initialDate ? 'scheduled' : 'draft'}
              initialScheduledAt={initialDate ? `${initialDate}T12:00` : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function PostGeneratorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <PostGeneratorContent />
    </Suspense>
  )
}
