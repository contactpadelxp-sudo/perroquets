import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    url_starts_with: url ? url.substring(0, 10) + '...' : 'MISSING',
    key_exists: !!key
  });
}
