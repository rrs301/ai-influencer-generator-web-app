const ZERNIO_API_BASE = 'https://zernio.com/api/v1';

async function zernioFetch(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.ZERNIO_API_KEY;
  if (!apiKey) {
    throw new Error('ZERNIO_API_KEY is not set. Please add it to your .env file.');
  }

  const response = await fetch(`${ZERNIO_API_BASE}${endpoint}`, {
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
    throw new Error(`Zernio API error: ${response.statusText} ${errorData.message || ''}`);
  }

  return response.json();
}

export const zernio = {
  profiles: {
    create: async (name: string, description?: string) => {
      return zernioFetch('/profiles', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
    },
  },
  connect: {
    getConnectUrl: async (platform: string, profileId: string, redirectUrl?: string) => {
      // Ensure platform is lowercase as expected by Zernio
      const p = platform.toLowerCase();
      let url = `/connect/${p}?profileId=${profileId}`;
      if (redirectUrl) {
        url += `&redirectUrl=${encodeURIComponent(redirectUrl)}`;
      }
      return zernioFetch(url);
    },
  },
  accounts: {
    list: async () => {
      return zernioFetch('/accounts');
    },
    delete: async (accountId: string) => {
      return zernioFetch(`/accounts/${accountId}`, {
        method: 'DELETE',
      });
    },
  },
  posts: {
    createPost: async (data: {
      content: string;
      scheduledFor?: string;
      publishNow?: boolean;
      timezone?: string;
      mediaItems?: Array<{ url: string; type: 'image' | 'video' | 'document' }>;
      platforms: Array<{ platform: string; accountId: string }>;
    }) => {
      return zernioFetch('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};
