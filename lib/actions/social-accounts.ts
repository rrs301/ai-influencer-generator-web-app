'use server'

import { createClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import { zernio } from '../zernio';
import { revalidatePath } from 'next/cache';

export async function getSocialConnectUrlAction(platform: string, origin: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // 1. Get user profile and check for zernio_profile_id
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('zernio_profile_id, email, plan')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'User profile not found' };
    }

    // Check plan limits
    const { count, error: countError } = await adminSupabase
      .from('social_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (!countError && count !== null) {
      const plan = profile.plan || 'free';
      if (plan === 'free' && count >= 1) {
        return { success: false, error: 'Free plan limit reached (1 account max). Please upgrade.' };
      }
      if (plan === 'standard' && count >= 5) {
        return { success: false, error: 'Standard plan limit reached (5 accounts max). Please upgrade to Pro.' };
      }
    }

    let zernioProfileId = profile.zernio_profile_id;

    // 2. Create Zernio Profile if it doesn't exist
    if (!zernioProfileId) {
      const zProfileResponse = await zernio.profiles.create(
        `Profile for ${profile.email}`,
        `InfluencerAI profile for user ${user.id}`
      );
      
      zernioProfileId = zProfileResponse.profile._id;

      // Update local profile
      await adminSupabase
        .from('profiles')
        .update({ zernio_profile_id: zernioProfileId })
        .eq('id', user.id);
    }

    // 3. Get Connect URL
    const redirectUrl = `${origin}/dashboard/accounts?status=success`;
    const { authUrl } = await zernio.connect.getConnectUrl(platform, zernioProfileId, redirectUrl);

    return { success: true, authUrl };
  } catch (error: any) {
    console.error('Get Connect URL Error:', error);
    return { success: false, error: error.message };
  }
}

export async function syncSocialAccountsAction() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // 1. List accounts from Zernio
    const { accounts } = await zernio.accounts.list();
    console.log('Zernio Accounts sync for user:', user.id, 'Total accounts in Zernio:', accounts.length);
    if (accounts.length > 0) {
      console.log('Sample account object keys:', Object.keys(accounts[0]));
      console.log('Sample account profile info:', { profileId: accounts[0].profileId, profile_id: accounts[0].profile_id, profile: accounts[0].profile });
    }

    // 2. Get user's profile ID
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('zernio_profile_id')
      .eq('id', user.id)
      .single();
      
    if (!profile?.zernio_profile_id) {
      console.log('No Zernio profile ID found for user:', user.id);
      return { success: true, accounts: [] };
    }

    console.log('User Zernio Profile ID:', profile.zernio_profile_id);

    // Filter accounts by profile ID (handle various possible field names and nested objects)
    const userAccounts = accounts.filter((acc: any) => {
      let accProfileId = acc.profileId || acc.profile_id || acc.profile;
      
      // If the profile ID is an object (common in MongoDB/Zernio), extract the _id
      if (accProfileId && typeof accProfileId === 'object') {
        accProfileId = accProfileId._id || accProfileId.id;
      }

      console.log('Comparing account profile ID:', accProfileId, 'with user profile ID:', profile.zernio_profile_id);
      return accProfileId && String(accProfileId) === String(profile.zernio_profile_id);
    });

    console.log('Filtered accounts for user:', userAccounts.length);

    // Sync to DB
    for (const acc of userAccounts) {
      console.log('Upserting account:', acc._id, 'platform:', acc.platform);
      const { error: upsertError } = await adminSupabase
        .from('social_accounts')
        .upsert({
          user_id: user.id,
          platform: acc.platform,
          zernio_account_id: acc._id,
          account_name: acc.displayName || acc.name || acc.username || acc.platform,
          account_image: acc.profilePicture || acc.image || '',
        }, {
          onConflict: 'zernio_account_id'
        });
        
      if (upsertError) {
        console.error('Error upserting account:', acc._id, upsertError);
      }
    }

    // Delete accounts that are no longer in Zernio for this user
    const zernioIds = userAccounts.map((acc: any) => acc._id);
    const query = adminSupabase
      .from('social_accounts')
      .delete()
      .eq('user_id', user.id);
      
    if (zernioIds.length > 0) {
      await query.not('zernio_account_id', 'in', `(${zernioIds.join(',')})`);
    } else {
      await query;
    }

    revalidatePath('/dashboard/accounts');
    return { success: true };
  } catch (error: any) {
    console.error('Sync Social Accounts Error:', error);
    return { success: false, error: error.message };
  }
}

export async function disconnectSocialAccountAction(zernioAccountId: string) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    // 1. Delete from Zernio
    await zernio.accounts.delete(zernioAccountId);

    // 2. Delete from local DB
    await adminSupabase
      .from('social_accounts')
      .delete()
      .eq('zernio_account_id', zernioAccountId)
      .eq('user_id', user.id);

    revalidatePath('/dashboard/accounts');
    return { success: true };
  } catch (error: any) {
    console.error('Disconnect Social Account Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getConnectedAccountsAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);

    return data || [];
  } catch (error) {
    console.error('Get Connected Accounts Error:', error);
    return [];
  }
}
