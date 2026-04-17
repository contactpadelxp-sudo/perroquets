import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const redirectUrl = `${origin}${next}`;
  const errorUrl = `${origin}/login?error=auth`;

  if (!code) {
    return NextResponse.redirect(errorUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Read cookies from the incoming request
          return request.headers.get('cookie')?.split('; ').map((c) => {
            const [name, ...rest] = c.split('=');
            return { name, value: rest.join('=') };
          }) ?? [];
        },
        setAll(cookiesToSet) {
          // Write cookies to the outgoing response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback error:', error.message);
    return NextResponse.redirect(errorUrl);
  }

  // Ensure user_settings row exists
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
    // Non-critical — don't block login if settings insert fails
  }

  return response;
}
