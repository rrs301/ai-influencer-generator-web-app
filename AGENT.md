# Agent Instructions: AI Influencer Generator

## Project Overview
You are building a high-fidelity AI Influencer platform. The core workflow involves generating video content via Luma AI, storing it in Supabase, and scheduling posts to social media via Zernio. 

## Technical Stack Guidelines

### Frontend
- **Framework**: Next.js 16 (App Router).
- **Styling**: Tailwind CSS v4 (No `tailwind.config.ts`, use `@import "tailwindcss"` in `app/globals.css`).
- **React**: Version 19 (Support for latest hooks and Server Actions).
- **Structure**: No `/src` folder. Root level folders: `/app`, `/components`, `/lib`, `/hooks`, `/services`, `/types`.

### Backend & Database
- **Database**: Supabase (PostgreSQL).
- **Auth**: Supabase Auth (SSR support via `@supabase/ssr`).
- **Storage**: Supabase Storage for video assets.
- **Background Jobs**: Inngest (Crucial for polling Luma AI video status and handling Zernio cron schedules).

### APIs
- **Luma AI**: For video generation (`/v1/generations`).
- **Zernio**: For social media scheduling and posting.
- **Stripe**: For subscription and credit-based billing.

## Coding Conventions

### Server Components First
- Use Server Components by default for data fetching in the `app/` directory.
- Use `use client` strictly for interactive elements (forms, toggles, modal states).

### Server Actions
- All mutations (Post generation request, Schedule post, Update profile) must be handled via Next.js Server Actions.
- Implement proper validation using `zod` inside actions.

### Data Access Pattern
- Centralize database logic in `lib/db/` or `services/`.
- Enforce Row Level Security (RLS) in Supabase. Never bypass RLS unless specifically required for background system tasks.

### Long-Running Tasks (Inngest)
- Since Luma AI video generation takes minutes, use Inngest functions to:
  1. Trigger the generation.
  2. Poll the status until success/failure.
  3. Download and upload the final asset to Supabase Storage.
  4. Update the database record.

### Error Handling
- Wrap API calls (Luma, Zernio, Stripe) in robust try/catch blocks.
- Use a standard error logging pattern for observability.

## Folder Structure Reference

/
├── app/             # App Router files
│   ├── (auth)/      # Login/Signup routes
│   ├── (dashboard)/ # Protected influencer dashboard
│   ├── api/         # Webhooks (Stripe, Inngest)
│   └── globals.css  # Tailwind 4 entry
├── components/      # React components
│   ├── ui/          # Atomic components (Buttons, Inputs)
│   ├── dashboard/   # Dashboard specific logic
│   └── landing/     # Landing page components
├── lib/             # Utilities (supabase-client, stripe, utils)
├── services/        # Logic for Luma, Zernio, Inngest
├── types/           # TypeScript definitions
└── inngest/         # Inngest functions and client


## Component Patterns
- **Video Library**: Use an optimistic UI pattern when a video generation starts (show a ghost/loading card).
- **Auth Guard**: Use `middleware.ts` to protect `/dashboard` routes and redirect to `/login`.