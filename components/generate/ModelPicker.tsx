'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getModelsAction } from '../../lib/actions/posts'
import { Check, Users as UsersIcon, Sparkles } from 'lucide-react'

interface Model {
  id: string
  name: string
  vibe_aesthetic: string
  portrait_image_url: string
}

export default function ModelPicker({ onSelect }: { onSelect: (modelId: string) => void }) {
  const [models, setModels] = useState<Model[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchModels() {
      const data = await getModelsAction()
      setModels(data)
      setLoading(false)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
        onSelect(data[0].id)
      }
    }
    fetchModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-primary" />
          Model Picker
        </label>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Select Influencer</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => {
              setSelectedId(model.id)
              onSelect(model.id)
            }}
            className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left ${selectedId === model.id
                ? 'border-primary ring-4 ring-primary/20 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
                : 'border-white/5 hover:border-white/20'
              }`}
          >
            <div className="aspect-[3/4] relative">
              <Image
                src={model.portrait_image_url}
                alt={model.name}
                fill
                className={`object-cover transition-transform duration-500 ${selectedId === model.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {selectedId === model.id && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg animate-in zoom-in">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-bold text-white truncate">{model.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <p className="text-[10px] text-slate-300 truncate uppercase tracking-wider">{model.vibe_aesthetic}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[9px] text-slate-400">Reach Est.</p>
                  <p className="text-[9px] font-bold text-accent">12.5k - 45k</p>
                </div>
              </div>
            </div>
          </button>
        ))}

        {models.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5">
            <p className="text-slate-500 text-sm">No models found. Create one in Studio!</p>
          </div>
        )}
      </div>
    </div>
  )
}
