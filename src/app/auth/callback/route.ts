import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const origin = new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // We need to collect cookies during exchangeCodeForSession,
  // then apply them to the final redirect response
  const cookiesToApply: { name: string; value: string; options: any }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => {
            cookiesToApply.push(cookie);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Create user_settings if needed (non-blocking)
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

  // Now create the redirect WITH all the auth cookies
  const response = NextResponse.redirect(`${origin}/`);
  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
