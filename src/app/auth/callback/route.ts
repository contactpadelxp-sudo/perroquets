import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth', origin));
  }

  try {
    const cookieStore = await cookies();

    // Collect cookies that Supabase sets during exchange
    const pendingCookies: { name: string; value: string; options: any }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set on the cookie store (for server-side)
              try { cookieStore.set(name, value, options); } catch { /* */ }
              // Also collect for the redirect response
              pendingCookies.push({ name, value, options });
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth', origin));
    }

    // Create user_settings if needed
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existing } = await supabase
          .from('user_settings')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (!existing) {
          await supabase.from('user_settings').insert({
            user_id: user.id,
            bird_name: 'Mon Éclectus',
          });
        }
      }
    } catch {
      // Non-critical
    }

    // Build redirect with auth cookies
    const redirectResponse = NextResponse.redirect(new URL('/', origin));
    pendingCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });

    return redirectResponse;
  } catch (e) {
    // Catch-all to prevent 500
    console.error('Auth callback crash:', e);
    return NextResponse.redirect(new URL('/login?error=auth', origin));
  }
}
