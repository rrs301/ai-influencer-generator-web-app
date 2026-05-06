'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  id: string
  label: string
  icon?: string
  color?: string
}

interface VisualSelectorProps {
  label: string
  options: Option[]
  value: string
  onChange: (value: string) => void
  gridCols?: number
}

export function VisualSelector({
  label,
  options,
  value,
  onChange,
  gridCols = 2
}: VisualSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className={cn(
        "grid gap-2",
        gridCols === 2 ? "grid-cols-2" : gridCols === 3 ? "grid-cols-3" : gridCols === 4 ? "grid-cols-4" : "grid-cols-5"
      )}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 group",
              value === option.id
                ? "bg-primary/10 border-primary shadow-[0_0_10px_rgba(14,165,233,0.1)]"
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-2">
              {option.icon && (
                <span className="text-base group-hover:scale-110 transition-transform duration-300">
                  {option.icon}
                </span>
              )}
              {option.color && (
                <div 
                  className="w-3 h-3 rounded-full border border-white/20" 
                  style={{ backgroundColor: option.color }}
                />
              )}
              <span className={cn(
                "text-xs font-medium",
                value === option.id ? "text-white" : "text-slate-400"
              )}>
                {option.label}
              </span>
            </div>
            
            {value === option.id && (
              <div className="bg-primary rounded-full p-0.5">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
