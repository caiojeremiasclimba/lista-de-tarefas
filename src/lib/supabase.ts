import { createClient } from '@supabase/supabase-js'
import { createAuthStorageAdapter } from './authPreferences'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createAuthStorageAdapter(),
    persistSession: true,
    autoRefreshToken: true,
  },
})
