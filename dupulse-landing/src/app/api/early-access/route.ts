
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { name, yearGroup, email } = await req.json();

  // Basic validation
  if (!name || !yearGroup || !email) {
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
  }

  // Duplicate check
  const { data: existing, error: selectError } = await supabase
    .from('early_access_signups')
    .select('id')
    .eq('email', email);

  if (selectError) {
    return NextResponse.json({ message: selectError.message }, { status: 500 });
  }
  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Duplicate email.' }, { status: 409 });
  }

  // Insert new signup
  const { error } = await supabase
    .from('early_access_signups')
    .insert([{ name, year_group: yearGroup, email }]);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Success!' }, { status: 201 });
} 