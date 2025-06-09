import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;
const supabaseServiceKey = config.supabase.serviceRoleKey;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});