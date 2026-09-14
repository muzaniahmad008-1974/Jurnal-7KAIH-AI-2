// ============================================================================
// SI-7KAIH AI - Supabase Client Configuration
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Resolve URL from environment variables with safe defaults
const getEnvVar = (name: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[name]) {
    return (import.meta as any).env[name];
  }
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name] as string;
  }
  return '';
};

const supabaseUrl: string =
  getEnvVar('SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  'https://lgiqyvehajbksndwlxlm.supabase.co';

const supabaseAnonKey: string =
  getEnvVar('SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaXF5dmVoYWpia3NuZHdseGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDcxNDcsImV4cCI6MjEwMzkyMzE0N30.T1slhbQlGidzDrpcI_xHpZIDML8D2C7rGmmE28KNE2I';

// Lazy-initialized singleton client
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

export const supabase: SupabaseClient = getSupabase();

export const SUPABASE_CONFIG = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
};

export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  message: string;
  tablesReady: boolean;
}> {
  try {
    const client = getSupabase();
    // Test basic query to check if connection reaches Supabase
    const { error } = await client.from('si7kaih_journals').select('id').limit(1);
    if (!error) {
      return { connected: true, message: 'Terhubung & Tabel Siap', tablesReady: true };
    }
    if (error.code === '42P01' || error.message?.toLowerCase().includes('schema cache')) {
      // Reached database, but table not yet created
      return {
        connected: true,
        message: 'Terhubung ke Supabase (Menunggu Pembuatan Tabel SQL)',
        tablesReady: false,
      };
    }
    return {
      connected: false,
      message: error.message || 'Koneksi gagal',
      tablesReady: false,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Gagal menghubungi server Supabase',
      tablesReady: false,
    };
  }
}

