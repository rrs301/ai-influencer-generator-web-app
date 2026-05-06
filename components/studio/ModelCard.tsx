import Image from 'next/image'
import { Sparkles, ArrowRight } from 'lucide-react'

interface Model {
  id: string
  name: string
  gender: string
  vibe_aesthetic: string
  portrait_image_url: string
  age_range: string
}

export function ModelCard({ model }: { model: Model }) {
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden glass-dark hover:border-primary/50 transition-all duration-500">
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={model.portrait_image_url}
          alt={model.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
        
        {/* Floating Badge */}
        <div className="absolute top-4 right-4">
          <div className="px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{model.vibe_aesthetic}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">
          {model.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{model.gender}</span>
          <span className="w-1 h-1 rounded-full bg-slate-700" />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{model.age_range}</span>
        </div>

        <button className="w-full mt-4 py-2 rounded-xl bg-white/5 hover:bg-primary border border-white/5 hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 group/btn">
          <span className="text-xs font-bold text-white">Generate Post</span>
          <ArrowRight className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
