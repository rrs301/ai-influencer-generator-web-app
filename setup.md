# Project Setup Guide

This guide will walk you through setting up the AI Influencer Generator project locally.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- Git

## Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-influencer-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or yarn install / pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env` or `.env.local` file in the root directory. You can use the instructions below to obtain all the necessary API keys.

4. **Database Setup (Supabase)**
   - The project uses Supabase as the database and backend.
   - Run the provided `supabase_setup.sql` script in your Supabase project's SQL Editor. This will create all the necessary tables and policies for the application.

5. **Run the Development Server**
   ```bash
   npm run dev
   # or yarn dev / pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

---

## Getting API Keys

To run the application with all features functional (AI generation, social scheduling, and billing), you will need API keys from the following services. Add them to your `.env` file.

### 1. Supabase (Database, Auth & Storage)
Supabase manages the project's data, user authentication, and file storage.
- Go to [Supabase](https://supabase.com/) and create a new project.
- Once created, navigate to **Project Settings** -> **API**.
- Copy the **Project URL** and set it as `NEXT_PUBLIC_SUPABASE_URL`.
- Copy the **anon / public** key and set it as `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to this value if needed).
- Copy the **service_role / secret** key and set it as `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Luma AI (Image & Influencer Generation)
Luma AI is used for generating the AI influencer models and their content.
- Visit [Luma AI](https://lumalabs.ai/) and sign in.
- Navigate to your account settings or the developer portal to generate an API key.
- Set both `LUMA_AGENTS_API_KEY` and `NEXT_PUBLIC_LUMA_AGENTS_API_KEY` to your generated key.

### 3. Google Gemini (Text & Caption Generation)
Gemini generates the social media captions and other text content.
- Go to [Google AI Studio](https://aistudio.google.com/).
- Click on **Get API key** and create a new key.
- Set it as `GEMINI_API_KEY`.

### 4. Zernio (Social Media Scheduling & Automation)
Zernio API is used to manage multiple social media accounts and schedule posts automatically.
- Sign up or log in to the Zernio platform.
- Navigate to the API settings or Developer dashboard.
- Generate a new API key and set it as `ZERNIO_API_KEY`.

### 5. Stripe (Billing & Subscriptions)
Stripe handles user subscriptions and credit management.
- Go to the [Stripe Dashboard](https://dashboard.stripe.com/) and create an account.
- Make sure **Test mode** is enabled if you are developing locally.
- Go to **Developers** -> **API keys**.
- Copy the **Publishable key** and set it as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Copy the **Secret key** and set it as `STRIPE_SECRET_KEY`.
- To get the `STRIPE_WEBHOOK_SECRET`:
  - Go to **Developers** -> **Webhooks**.
  - For local testing, download the Stripe CLI and run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - The CLI will print a webhook signing secret. Set it as `STRIPE_WEBHOOK_SECRET`.
  - For production, add an endpoint in the Stripe dashboard (`https://yourdomain.com/api/webhooks/stripe`) and use its signing secret.

### 6. Application URL
- Set `APP_URL` to your local development server URL (e.g., `http://localhost:3000`). When deploying to production, change this to your live domain name.
