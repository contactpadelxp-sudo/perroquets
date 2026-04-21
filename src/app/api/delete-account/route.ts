import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function POST() {
  try {
    // 1. Get the authenticated user from the request session
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié', detail: authError?.message },
        { status: 401 }
      );
    }

    const userId = user.id;
    const errors: string[] = [];

    // 2. Delete all user data — continue even if some tables fail
    const tables = [
      'meal_items',
      'daily_meals',
      'daily_nutrition_summary',
      'weight_logs',
      'user_settings',
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('user_id', userId);
      if (error) {
        errors.push(`${table}: ${error.message}`);
      }
    }

    // 3. Delete the auth user via admin API (requires service role key)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        errors.push(`auth: ${deleteAuthError.message}`);
      }
    } else {
      errors.push('auth: SUPABASE_SERVICE_ROLE_KEY manquante — compte auth non supprimé');
    }

    // 4. Sign out the current session
    await supabase.auth.signOut();

    if (errors.length > 0) {
      console.error('[delete-account] Partial errors:', errors);
    }

    return NextResponse.json({ success: true, warnings: errors.length > 0 ? errors : undefined });
  } catch (err: any) {
    console.error('[delete-account] Fatal error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
