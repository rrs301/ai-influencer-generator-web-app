'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '../../lib/supabase/server';
import { createAdminClient } from '../../lib/supabase/admin';
import { zernio } from '../zernio';

const LUMA_API_BASE = 'https://agents.lumalabs.ai/v1';

async function lumaFetch(endpoint: string, options: RequestInit = {}) {
  const apiKey = (process.env.LUMA_AGENTS_API_KEY || process.env.NEXT_PUBLIC_LUMA_AGENTS_API_KEY)?.trim();
  if (!apiKey) throw new Error('LUMA_AGENTS_API_KEY is not set.');

  const response = await fetch(`${LUMA_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Luma API error: ${response.statusText} ${errorData.message || ''}`);
  }

  return response.json();
}

async function uploadToSupabase(buffer: Buffer, fileName: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from('posts')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('Supabase storage upload failed:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err: any) {
    console.error('Error in uploadToSupabase:', err);
    throw err;
  }
}

async function generateLumaPost(prompt: string, aspectRatio: string = '1:1', modelImage?: string, referenceImages: string[] = []) {
  // Combine character (modelImage) and style/context (referenceImages)
  const allImages = [];
  if (modelImage) allImages.push(modelImage);
  if (referenceImages && referenceImages.length > 0) {
    allImages.push(...referenceImages);
  }

  const body: any = {
    prompt,
    aspect_ratio: aspectRatio
  };

  // If we have images, pass them to Luma. Uni-1 supports multiple references.
  if (allImages.length === 1) {
    body.image_prompt = allImages[0];
  } else if (allImages.length > 1) {
    body.image_prompt = allImages;
  }

  const generation = await lumaFetch('/generations', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const id = generation.id;
  let state = generation.state;
  let result = generation;
  const deadline = Date.now() + 120000;

  while (state !== 'completed' && state !== 'failed') {
    if (Date.now() > deadline) throw new Error(`Luma timed out`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    result = await lumaFetch(`/generations/${id}`);
    state = result.state;
  }

  if (state === 'failed') throw new Error(`Luma failed: ${result.failure_reason}`);

  const lumaUrl = result.output[0].url;
  const response = await fetch(lumaUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  return await uploadToSupabase(buffer, `post-luma-${id}.png`);
}

async function generateGeminiPost(prompt: string, aspectRatio: string = '1:1', modelImage?: string, referenceImages: string[] = []) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

  const parts: any[] = [
    {
      text: `Generate a high-quality ${aspectRatio} social media post image based on the provided visual references and this prompt: ${prompt}.

    STRICT REQUIREMENTS:
    - IDENTITY: The first image provided (if any) is the character portrait. You MUST maintain the exact facial features, skin tone, and identity of this person.
    - REFERENCE: Any subsequent images are for visual reference (style, pose, or background).
    - QUALITY: Cinematic lighting, professional photography, 8k resolution.` }
  ];

  // Add influencer portrait as visual reference (Character)
  if (modelImage) {
    try {
      const response = await fetch(modelImage);
      const buffer = await response.arrayBuffer();
      parts.push({
        inlineData: {
          data: Buffer.from(buffer).toString('base64'),
          mimeType: 'image/png'
        }
      });
    } catch (e) {
      console.warn('Failed to fetch model image for Gemini:', e);
    }
  }

  // Add additional reference images
  for (const ref of referenceImages) {
    if (ref.startsWith('data:')) {
      const [mime, data] = ref.split(';base64,');
      parts.push({
        inlineData: {
          data,
          mimeType: mime.split(':')[1]
        }
      });
    } else if (ref.startsWith('http')) {
      try {
        const response = await fetch(ref);
        const buffer = await response.arrayBuffer();
        parts.push({
          inlineData: {
            data: Buffer.from(buffer).toString('base64'),
            mimeType: response.headers.get('content-type') || 'image/png'
          }
        });
      } catch (e) {
        console.warn('Failed to fetch reference image for Gemini:', e);
      }
    }
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  const imagePart = response.candidates?.[0]?.content.parts.find(p => p.inlineData?.mimeType.startsWith('image/'));

  if (!imagePart || !imagePart.inlineData) {
    throw new Error('Gemini failed to generate image');
  }

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
  return await uploadToSupabase(buffer, `post-gemini-${Date.now()}.png`);
}

async function generateVariant(prompt: string, aspectRatio: string = '1:1', modelImage?: string, referenceImages: string[] = []) {
  try {
    console.log(`Attempting Luma generation for: ${prompt}`);
    return await generateLumaPost(prompt, aspectRatio, modelImage, referenceImages);
  } catch (error) {
    console.warn('Luma post generation failed, falling back to Gemini:', error);
    try {
      return await generateGeminiPost(prompt, aspectRatio, modelImage, referenceImages);
    } catch (geminiError: any) {
      console.error('Gemini fallback also failed:', geminiError);
      throw new Error(`Both Luma and Gemini failed: ${geminiError.message}`);
    }
  }
}

async function scheduleToZernio(userId: string, platform: string, imageUrl: string, caption: string, scheduledAt?: string) {
  const adminSupabase = createAdminClient();

  // 1. Fetch connected accounts for this platform
  const { data: accounts } = await adminSupabase
    .from('social_accounts')
    .select('zernio_account_id')
    .eq('user_id', userId)
    .eq('platform', platform.toLowerCase());

  if (!accounts || accounts.length === 0) {
    console.warn(`No connected accounts found for platform: ${platform}`);
    return;
  }

  // 2. Prepare platforms array for Zernio
  const zernioPlatforms = accounts.map(acc => ({
    platform: platform.toLowerCase(),
    accountId: acc.zernio_account_id
  }));

  // 3. Call Zernio API
  try {
    const postResponse = await zernio.posts.createPost({
      content: caption || '',
      scheduledFor: scheduledAt,
      publishNow: !scheduledAt,
      timezone: 'UTC', // Defaulting to UTC
      mediaItems: [
        { url: imageUrl, type: 'image' }
      ],
      platforms: zernioPlatforms
    });
    console.log('Post scheduled to Zernio:', postResponse.post?._id);
    return postResponse;
  } catch (error) {
    console.error('Failed to schedule post to Zernio:', error);
    // We don't throw here to avoid breaking the local DB transaction/flow
  }
}

export async function generatePostAction(data: any) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // 1. Fetch Model Data to get Portrait URL (Strict Check)
    if (!data.modelId) return { success: false, error: 'No model selected' };

    const { data: modelData, error: modelError } = await adminSupabase
      .from('models')
      .select('portrait_image_url')
      .eq('id', data.modelId)
      .single();

    if (modelError || !modelData) {
      return { success: false, error: 'Selected model not found. Please select a valid influencer model.' };
    }

    const modelImage = modelData.portrait_image_url;

    // 2. Deduct credits
    const { data: profile } = await adminSupabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits < 10) return { success: false, error: 'Insufficient credits' };

    await adminSupabase.from('profiles').update({ credits: profile.credits - 10 }).eq('id', user.id);

    const prompt = data.prompt;
    const aspectRatio = data.format === 'story' ? '9:16' : data.format === 'landscape' ? '16:9' : '1:1';

    // 3. Process reference images (upload base64 to Supabase if needed)
    const referenceImages = await Promise.all((data.referenceImages || []).map(async (img: string, i: number) => {
      if (img.startsWith('data:')) {
        const [mime, base64Data] = img.split(';base64,');
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `ref-${user.id}-${Date.now()}-${i}.png`;
        return await uploadToSupabase(buffer, fileName);
      }
      return img;
    }));

    // Generate 1 variant
    const results = await Promise.all([
      generateVariant(prompt, aspectRatio, modelImage, referenceImages),
    ]);

    return {
      success: true,
      variants: results,
      creditsRemaining: profile.credits - 10
    };
  } catch (error: any) {
    console.error('Post Generation Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getModelsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.from('models').select('*').eq('user_id', user.id);
  return data || [];
}

export async function savePostAction(postData: {
  modelId: string;
  imageUrl: string;
  platform: string | string[];
  caption: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string;
}) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const platforms = Array.isArray(postData.platform) ? postData.platform : [postData.platform];

    // Check plan limits for scheduled posts
    if (postData.status === 'scheduled') {
      const { data: profile } = await adminSupabase.from('profiles').select('plan').eq('id', user.id).single();
      const plan = profile?.plan || 'free';

      if (plan === 'free') {
        const { count } = await adminSupabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'scheduled');

        if (count !== null && count + platforms.length > 5) {
          return { success: false, error: 'Free plan limit reached (max 5 scheduled posts). Please upgrade.' };
        }
      }
    }

    const inserts = platforms.map(platform => ({
      user_id: user.id,
      model_id: postData.modelId,
      image_url: postData.imageUrl,
      platform: platform,
      caption: postData.caption,
      status: postData.status,
      scheduled_at: postData.scheduledAt || null
    }));

    const { data, error } = await adminSupabase
      .from('posts')
      .insert(inserts)
      .select();

    if (error) {
      console.error('Error saving post(s):', error);
      return { success: false, error: error.message };
    }

    // 4. If scheduled, send to Zernio
    if (postData.status === 'scheduled' || postData.status === 'published') {
      for (const platform of platforms) {
        await scheduleToZernio(
          user.id,
          platform,
          postData.imageUrl,
          postData.caption,
          postData.status === 'scheduled' ? postData.scheduledAt : undefined
        );
      }
    }

    return { success: true, posts: data };
  } catch (error: any) {
    console.error('Save Post Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getRecentPostsAction(page: number = 1, limit: number = 8) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized', posts: [], totalCount: 0 };

    const offset = (page - 1) * limit;

    // Get posts with total count
    const { data, error, count } = await supabase
      .from('posts')
      .select('*, models(name)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      return { success: false, error: error.message, posts: [], totalCount: 0 };
    }

    return {
      success: true,
      posts: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  } catch (error: any) {
    console.error('Get Recent Posts Error:', error);
    return { success: false, error: error.message, posts: [], totalCount: 0 };
  }
}

export async function updatePostAction(postId: string, updates: {
  status?: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string | null;
  caption?: string;
  platform?: string;
}) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { scheduledAt, ...rest } = updates;
    const updatePayload: any = { ...rest };
    if (scheduledAt !== undefined) {
      updatePayload.scheduled_at = scheduledAt;
    }

    // Check limits if changing status to scheduled
    if (updatePayload.status === 'scheduled') {
      const { data: profile } = await adminSupabase.from('profiles').select('plan').eq('id', user.id).single();
      const plan = profile?.plan || 'free';

      if (plan === 'free') {
        const { count } = await adminSupabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'scheduled');

        if (count !== null && count >= 5) {
          return { success: false, error: 'Free plan limit reached (max 5 scheduled posts). Please upgrade.' };
        }
      }
    }

    const { data, error } = await adminSupabase
      .from('posts')
      .update(updatePayload)
      .eq('id', postId)
      .eq('user_id', user.id) // Security check
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return { success: false, error: error.message };
    }

    // Trigger Zernio if status changed to scheduled/published or if scheduledAt/caption changed for a scheduled post
    if (data.status === 'scheduled' || data.status === 'published') {
      await scheduleToZernio(
        user.id,
        data.platform,
        data.image_url,
        data.caption,
        data.status === 'scheduled' ? data.scheduled_at : undefined
      );
    }

    return { success: true, post: data };
  } catch (error: any) {
    console.error('Update Post Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getScheduledPostsAction(month: number, year: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized', posts: [] };

    // Format start and end of month literally to match stored format
    const m = String(month + 1).padStart(2, '0');
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startOfMonth = `${year}-${m}-01T00:00:00`;
    const endOfMonth = `${year}-${m}-${lastDay}T23:59:59`;

    const { data, error } = await supabase
      .from('posts')
      .select('*, models(name)')
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', startOfMonth)
      .lte('scheduled_at', endOfMonth)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled posts:', error);
      return { success: false, error: error.message, posts: [] };
    }

    return { success: true, posts: data || [] };
  } catch (error: any) {
    console.error('Get Scheduled Posts Error:', error);
    return { success: false, error: error.message, posts: [] };
  }
}

export async function getDraftPostsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized', posts: [] };

    const { data, error } = await supabase
      .from('posts')
      .select('*, models(name)')
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching draft posts:', error);
      return { success: false, error: error.message, posts: [] };
    }

    return { success: true, posts: data || [] };
  } catch (error: any) {
    console.error('Get Draft Posts Error:', error);
    return { success: false, error: error.message, posts: [] };
  }
}

export async function generateCaptionAction(params: {
  tone: string;
  cta: string;
  language: string;
  hashtags: number;
  emojiDensity: string;
  briefData?: any;
}) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)?.trim();
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY is not set.' };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `Generate a social media caption with the following requirements:
- Tone: ${params.tone}
- Language: ${params.language}
- Call to Action: ${params.cta}
- Number of hashtags: ${params.hashtags}
- Emoji Density: ${params.emojiDensity}
${params.briefData?.campaignName ? `- Campaign Name: ${params.briefData.campaignName}` : ''}
${params.briefData?.product ? `- Product/Brand: ${params.briefData.product}` : ''}
${params.briefData?.goal ? `- Goal: ${params.briefData.goal}` : ''}
${params.briefData?.brief ? `- Detailed Brief: ${params.briefData.brief}` : ''}

Please return ONLY the generated caption text. Do not include any quotes or prefixes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { success: true, caption: text.trim() };
  } catch (error: any) {
    console.error('Caption Generation Error:', error);
    return { success: false, error: error.message };
  }
}
