import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function POST() {
  try {
    // 1. Get the authenticated user from the request session
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = user.id;

    // 2. Delete all user data (with the user's own session)
    await supabase.from('meal_items').delete().eq('user_id', userId);
    await supabase.from('daily_meals').delete().eq('user_id', userId);
    await supabase.from('daily_nutrition_summary').delete().eq('user_id', userId);
    await supabase.from('weight_logs').delete().eq('user_id', userId);
    await supabase.from('user_settings').delete().eq('user_id', userId);

    // 3. Delete the auth user via admin API (requires service role key)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      await adminClient.auth.admin.deleteUser(userId);
    }

    // 4. Sign out the current session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
