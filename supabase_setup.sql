-- 1. FIX MODELS TABLE POLICIES
-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own models
DROP POLICY IF EXISTS "Users can view their own models" ON models;
CREATE POLICY "Users can view their own models" 
ON models FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to insert their own models
DROP POLICY IF EXISTS "Users can insert their own models" ON models;
CREATE POLICY "Users can insert their own models" 
ON models FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 2. FIX STORAGE POLICIES
-- Allow authenticated users to upload to 'influencers' bucket
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'influencers');

-- Allow public read access to 'influencers' bucket
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'influencers');

-- 3. CREATE POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID REFERENCES models(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  caption TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Table Policies
DROP POLICY IF EXISTS "Users can view their own posts" ON posts;
CREATE POLICY "Users can view their own posts" ON posts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own posts" ON posts;
CREATE POLICY "Users can insert their own posts" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. ADDITIONAL STORAGE POLICIES FOR 'POSTS' BUCKET
-- Allow authenticated users to upload to 'posts' bucket
DROP POLICY IF EXISTS "Allow authenticated uploads to posts" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to posts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

-- Allow public read access to 'posts' bucket
DROP POLICY IF EXISTS "Allow public read from posts" ON storage.objects;
CREATE POLICY "Allow public read from posts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

-- 5. SOCIAL ACCOUNTS INTEGRATION
-- Add zernio_profile_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zernio_profile_id TEXT;

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  zernio_account_id TEXT NOT NULL UNIQUE,
  account_name TEXT,
  account_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Table Policies
DROP POLICY IF EXISTS "Users can view their own social accounts" ON social_accounts;
CREATE POLICY "Users can view their own social accounts" ON social_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own social accounts" ON social_accounts;
CREATE POLICY "Users can delete their own social accounts" ON social_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. ADD STRIPE COLUMNS TO PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
