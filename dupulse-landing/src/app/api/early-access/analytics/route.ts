import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function GET() {
  // Get total count
  const { count, error } = await supabase
    .from('early_access_signups')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // Get sign-ups per day (grouped by date)
  const { data: all, error: allError } = await supabase
    .from('early_access_signups')
    .select('created_at');

  if (allError) {
    return NextResponse.json({ message: allError.message }, { status: 500 });
  }

  // Group by date (YYYY-MM-DD)
  const daily: Record<string, number> = {};
  all?.forEach((row: any) => {
    const date = row.created_at.slice(0, 10);
    daily[date] = (daily[date] || 0) + 1;
  });

  return NextResponse.json({ total: count, daily });
} 