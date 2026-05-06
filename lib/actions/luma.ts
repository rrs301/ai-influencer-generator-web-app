'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '../../lib/supabase/server';
import { createAdminClient } from '../../lib/supabase/admin';
import { AI_CONFIG } from '../ai-config';

const LUMA_API_BASE = 'https://agents.lumalabs.ai/v1';

async function lumaFetch(endpoint: string, options: RequestInit = {}) {
  // Try to get from both, trimming whitespace
  const apiKey = (process.env.LUMA_AGENTS_API_KEY || process.env.NEXT_PUBLIC_LUMA_AGENTS_API_KEY)?.trim();

  if (!apiKey) {
    throw new Error('LUMA_AGENTS_API_KEY is not set. Please add it to your .env file and restart the server.');
  }

  const response = await fetch(`${LUMA_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Prevent caching for generation status polling
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Luma API Error Details:', errorData);
    throw new Error(`Luma API error: ${response.statusText} ${errorData.message || ''}`);
  }

  return response.json();
}

export async function generateImage(prompt: string, aspectRatio: string = '1:1') {
  console.log(`Submitting generation request: "${prompt}" with aspect ratio ${aspectRatio}`);

  // 1. Submit
  const generation = await lumaFetch('/generations', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      aspect_ratio: aspectRatio,
    }),
  });

  const id = generation.id;
  console.log(`Generation submitted. ID: ${id}`);

  // 2. Poll
  let state = generation.state;
  let result = generation;
  const deadline = Date.now() + 120000; // 2 minutes timeout
  let interval = 2000; // Start with 2s interval

  while (state !== 'completed' && state !== 'failed') {
    if (Date.now() > deadline) {
      throw new Error(`Generation ${id} timed out after 2 minutes`);
    }

    // Wait for the interval
    await new Promise(resolve => setTimeout(resolve, interval));

    // Exponential backoff capped at 5s
    interval = Math.min(interval * 1.5, 5000);

    console.log(`Polling generation ${id}... current state: ${state}`);
    result = await lumaFetch(`/generations/${id}`);
    state = result.state;
  }

  if (state === 'failed') {
    throw new Error(`Generation failed: ${result.failure_reason || 'Unknown error'} (Code: ${result.failure_code})`);
  }

  console.log(`Generation ${id} completed successfully.`);
  const lumaUrl = result.output[0].url;

  // 3. Download and Upload to Supabase Storage
  try {
    console.log(`Downloading image from Luma: ${lumaUrl}`);
    const response = await fetch(lumaUrl);
    if (!response.ok) throw new Error(`Failed to fetch image from Luma: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `influencer-${id}-${Date.now()}.png`;
    
    console.log(`Uploading Luma image to Supabase storage as ${fileName}`);
    return await uploadToSupabase(buffer, fileName);
  } catch (error) {
    console.error('Error persisting Luma image to Supabase:', error);
    return lumaUrl; // Fallback to Luma URL
  }
}

async function uploadToSupabase(buffer: Buffer, fileName: string) {
  try {
    // Use Admin Client to bypass RLS for uploads
    const supabase = createAdminClient();

    // Upload to 'influencers' bucket
    const { data, error } = await supabase.storage
      .from('influencers')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.warn('Supabase storage upload failed:', error.message);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('influencers')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error('Error in uploadToSupabase:', err);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }
}

async function generateGeminiImage(prompt: string, aspectRatio: string = '1:1') {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Please add it to your .env file.');
  }

  console.log(`[Gemini] Generating image: "${prompt}" (${aspectRatio})`);
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.0-flash which supports native image generation (Nano Banana)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

  const result = await model.generateContent([
    { text: `Generate a high-quality ${aspectRatio} image of: ${prompt}. Professional lighting, 8k resolution, cinematic.` }
  ]);

  const response = await result.response;
  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content.parts.find(p => p.inlineData?.mimeType.startsWith('image/'));

  if (!imagePart || !imagePart.inlineData) {
    // Fallback: If it returned text instead of an image part, throw error to trigger higher level catch
    throw new Error('Gemini did not return an image part. It might have blocked the prompt or returned text.');
  }

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
  return await uploadToSupabase(buffer, `influencer-${Date.now()}-${Math.random().toString(36).substring(7)}.png`);
}

export async function generateInfluencerImages(basePrompt: string) {
  console.log(`Starting Influencer Generation process... Provider config: ${AI_CONFIG.IMAGE_PROVIDER}`);

  const doLuma = AI_CONFIG.IMAGE_PROVIDER === 'luma' || AI_CONFIG.IMAGE_PROVIDER === 'auto';
  const doGeminiFallback = AI_CONFIG.IMAGE_PROVIDER === 'auto';
  const doGeminiOnly = AI_CONFIG.IMAGE_PROVIDER === 'gemini';

  let lumaErrorMsg = '';

  if (doLuma) {
    // 1. Try Luma
    try {
      const portraitPrompt = `Headshot portrait of ${basePrompt}. Studio lighting, high quality.`;
      const fullBodyPrompt = `Full body fashion photography of ${basePrompt}. Professional lighting, 8k resolution.`;

      console.log('Attempting Luma AI generation...');
      const [portraitUrl, fullBodyUrl] = await Promise.all([
        generateImage(portraitPrompt, '1:1'),
        generateImage(fullBodyPrompt, '9:16')
      ]);

      return {
        success: true,
        portrait: portraitUrl,
        fullBody: fullBodyUrl,
        provider: 'luma'
      };
    } catch (lumaError: any) {
      lumaErrorMsg = lumaError.message;
      if (!doGeminiFallback) {
        console.error('Luma AI generation failed:', lumaErrorMsg);
        return {
          success: false,
          error: `Luma generation failed: ${lumaErrorMsg}`
        };
      }
      console.warn('Luma AI generation failed, falling back to Gemini (Nano Banana):', lumaErrorMsg);
    }
  }

  if (doGeminiOnly || (doGeminiFallback && lumaErrorMsg)) {
    // 2. Gemini
    try {
      const portraitPrompt = `A stunning headshot portrait of ${basePrompt}`;
      const fullBodyPrompt = `A stunning full body fashion photo of ${basePrompt}`;

      console.log('Attempting Gemini AI (Nano Banana) generation...');
      const [portraitUrl, fullBodyUrl] = await Promise.all([
        generateGeminiImage(portraitPrompt, '1:1'),
        generateGeminiImage(fullBodyPrompt, '9:16')
      ]);

      return {
        success: true,
        portrait: portraitUrl,
        fullBody: fullBodyUrl,
        provider: 'gemini'
      };
    } catch (geminiError: any) {
      console.error('Gemini generation failed:', geminiError.message);
      return {
        success: false,
        error: doGeminiFallback 
          ? `Both Luma and Gemini generation failed. Gemini Error: ${geminiError.message}`
          : `Gemini generation failed: ${geminiError.message}`
      };
    }
  }
  
  return { success: false, error: 'Invalid AI configuration.' };
}

export async function generateModelImagesAction(prompt: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // 1. Check credits
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.credits || 0) < 50) {
      return { success: false, error: 'Insufficient credits. 50 credits required.' };
    }

    // 2. Generate images
    const generationResult = await generateInfluencerImages(prompt);

    if (!generationResult.success) {
      return { success: false, error: generationResult.error };
    }

    const { portrait, fullBody } = generationResult;

    // 3. Deduct credits (generation costs credits)
    const { error: creditError } = await adminSupabase
      .from('profiles')
      .update({ credits: profile.credits - 50 })
      .eq('id', user.id);

    if (creditError) {
      console.error('Error deducting credits:', creditError);
    }

    return { 
      success: true, 
      portrait, 
      fullBody,
      creditsRemaining: profile.credits - 50
    };
  } catch (error: any) {
    console.error('Error in generateModelImagesAction:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

export async function saveModelAction(formData: any, prompt: string, portrait: string, fullBody: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Save model to database (using Admin client to bypass RLS)
    const { data: model, error: insertError } = await adminSupabase
      .from('models')
      .insert({
        user_id: user.id,
        name: formData.name,
        gender: formData.gender,
        body_type: formData.bodyType,
        skin_tone: formData.skinTone,
        age_range: formData.ageRange,
        hair_style_color: formData.hairStyle,
        vibe_aesthetic: formData.vibe,
        prompt: prompt,
        portrait_image_url: portrait,
        full_body_image_url: fullBody
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving model:', insertError);
      return { success: false, error: 'Failed to save model to database' };
    }

    return { success: true, model };
  } catch (error: any) {
    console.error('Error in saveModelAction:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
