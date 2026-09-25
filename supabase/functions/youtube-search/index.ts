const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

declare const Deno: {
  env: { get(name: string): string | undefined }
  serve(handler: (request: Request) => Response | Promise<Response>): unknown
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const query = typeof body.query === 'string' ? body.query.trim() : ''
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')

    if (!query) {
      return new Response(JSON.stringify({ error: 'Enter a song name.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not configured in Supabase secrets.')
    }

    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: '1',
      videoEmbeddable: 'true',
      videoSyndicated: 'true',
      key: apiKey,
    })

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'YouTube search failed.')
    }

    const videoId = data.items?.[0]?.id?.videoId
    if (!videoId) {
      throw new Error('No playable YouTube song was found for that name.')
    }

    return new Response(JSON.stringify({ videoId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'YouTube search failed.'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
