# Theme Design System: AI Influencer Generator (Ocean Theme)

## Vision
A sleek, professional, and fluid interface inspired by the depths and clarity of the ocean. The UI should feel high-tech yet serene, emphasizing content creation (Luma AI) and seamless distribution (Zernio).

## Color Palette (Hex Tokens)

### Primary Colors
- **Deep Abyss (Background)**: `#020617` (Deepest navy/black)
- **Ocean Wave (Primary)**: `#0EA5E9` (Vibrant sky blue)
- **Lagoon (Secondary)**: `#14B8A6` (Calm teal)
- **Foam (Surface)**: `#F8FAFC` (Pure off-white for text on dark)

### Accent Colors
- **Coral (Action/CTAs)**: `#F43F5E` (Warm highlight for critical actions)
- **Bioluminescence (Glow)**: `#38BDF8` (Used for active states and shadows)
- **Mist (Muted)**: `#94A3B8` (Secondary text and icons)

### Status Colors
- **Success (Clear Water)**: `#10B981` (Generation complete)
- **Warning (Sand)**: `#F59E0B` (Credits low)
- **Error (Red Tide)**: `#EF4444` (Post failed)
- **Processing (Tide)**: `#6366F1` (Luma AI working)

## Typography

- **Sans-Serif**: `Inter`, system-ui, sans-serif (Body, headings, primary UI)
- **Monospace**: `DM Mono`, monospace (Labels, IDs, metadata, timestamp, prompt code snippets)

### Scale
- **Display**: 3.75rem / 1 leading (Bold)
- **Heading 1**: 2.25rem / 2.5rem (Semibold)
- **Body**: 1rem / 1.5rem (Regular)
- **Label**: 0.75rem / 1rem (Medium, DM Mono)

## Component Styles

### Cards & Surfaces
- **Glassmorphism**: `bg-slate-900/50 backdrop-blur-md border border-slate-800`
- **Elevated Row**: Rounded-xl corners, subtle inner-shadow, hover translate-y-[-2px].

### Navigation (Sidebar)
- **Background**: `#0F172A` (Slate 900)
- **Active Item**: Left border 4px Ocean Wave, background gradient from Ocean Wave at 10% opacity.

### Status Badges
- **Default**: Pill-shaped, small padding (px-2 py-0.5), font-mono text-xs.
- **Animation**: Processing states should have a subtle horizontal pulse (tide effect).

### Buttons
- **Primary**: Gradient from `Ocean Wave` to `Lagoon`, white text, shadow-lg.
- **Secondary**: Ghost style with `Mist` border and white text on hover.

## Spacing & Geometry
- **Radius**: Large (12px) for cards, Full for pill buttons.
- **Gap Scale**: 4px, 8px, 16px, 24px, 32px standard increments.

## Tailwind v4 Configuration Hints
Use the `@theme` block in `app/globals.css` to map these tokens:
css
@theme {
  --color-primary: #0EA5E9;
  --color-secondary: #14B8A6;
  --color-background: #020617;
  --font-sans: "Inter", sans-serif;
  --font-mono: "DM Mono", monospace;
}
