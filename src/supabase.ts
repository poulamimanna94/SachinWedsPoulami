import { createClient } from '@supabase/supabase-js'

// The wedding's Supabase project. The publishable key is meant to be public
// (every guest's browser receives it); access is controlled by the policies in
// supabase/schema.sql. Vercel environment variables still take priority.
const defaultSupabaseUrl = 'https://ksferztsgyhkxrwhgxql.supabase.co'
const defaultSupabasePublishableKey = 'sb_publishable_8-BWkYHM7tiktsivag2b6g_Az5erULD'

// Blank or whitespace-only variables are ignored so the defaults still apply.
const fromEnv = (value: string | undefined) => value?.trim() || ''

const supabaseUrl = fromEnv(import.meta.env.VITE_SUPABASE_URL) || defaultSupabaseUrl
// Accept the older "anon key" name too, so either Vercel variable name works.
const supabasePublishableKey =
  fromEnv(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  fromEnv(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  defaultSupabasePublishableKey

export const supabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
)

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null
